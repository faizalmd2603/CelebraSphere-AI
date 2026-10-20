import { z } from 'zod';

/**
 * Zod Schemas for Runtime Validation of AI Output & User Inputs
 */

export const ExecutableActionSchema = z.object({
  type: z.enum([
    'ADD_BUDGET_ITEM',
    'REBALANCE_BUDGET',
    'REFLOW_TIMELINE',
    'ADD_VENDOR_TASK',
    'SAVE_THEME_IDEA',
    'UPDATE_GUEST_COUNT'
  ]),
  label: z.string().min(1).max(120),
  description: z.string().min(1).max(500),
  payload: z.record(z.any())
});

export const DecisionAuditSchema = z.object({
  whatChanged: z.array(z.string()),
  assumptionsMade: z.array(z.string()),
  needsHumanConfirmation: z.array(z.string())
});

export const AIResponsePayloadSchema = z.object({
  thoughtProcess: z.string().optional(),
  conversationalReply: z.string().min(1),
  proposedActions: z.array(ExecutableActionSchema).default([]),
  decisionAudit: DecisionAuditSchema.optional()
});

export const BudgetItemInputSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().min(1).max(50),
  costType: z.enum(['fixed', 'variable']),
  unitCost: z.number().min(0).max(100000000),
  quantity: z.number().min(1).max(100000),
  actualAmount: z.number().min(0).max(100000000).default(0),
  notes: z.string().max(500).optional()
});

/**
 * Strips dangerous HTML, scripts, attributes, and tags to prevent XSS
 */
export function sanitizeInput(input: string, maxLength: number = 2000): string {
  if (!input || typeof input !== 'string') return '';

  // Enforce max length boundary
  let sanitized = input.slice(0, maxLength);

  // Strip script tags, iframe, object, embed, etc.
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  sanitized = sanitized.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');

  // Strip javascript: pseudo protocols
  sanitized = sanitized.replace(/javascript:[^"']*/gi, '');

  // Strip inline event handlers like onclick, onload, onerror
  sanitized = sanitized.replace(/on\w+\s*=\s*(?:["'][^"']*["']|[^\s>]+)/gi, '');

  // Strip residual dangerous HTML tags
  sanitized = sanitized.replace(/[<>]/g, '');

  return sanitized.trim();
}

/**
 * Privacy Shield: Masks Sensitive PII (Phone numbers, emails, addresses)
 * before passing the context snapshot to external LLMs
 */
export function maskPII(text: string): string {
  if (!text) return '';

  // Mask email addresses
  const emailRegex = /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  let masked = text.replace(emailRegex, '[REDACTED_EMAIL]');

  // Mask phone numbers (Indian & International formats: +91..., 10-digit, 5-5 digit chunks, dashes)
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]*)?(?:\d{5}[-.\s]*\d{5}|\(?\d{3}\)?[-.\s]*\d{3}[-.\s]*\d{4}|\b\d{10}\b)/g;
  masked = masked.replace(phoneRegex, '[REDACTED_PHONE]');

  // Mask sensitive credit/UPI IDs
  const upiRegex = /[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}/g;
  masked = masked.replace(upiRegex, '[REDACTED_PAYMENT_ID]');

  return masked;
}

/**
 * Generates a lightweight, deterministic hash string for cache keys
 */
export function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return 'h_' + Math.abs(hash).toString(36);
}

/**
 * In-Memory LRU Cache for AI Request Deduplication
 */
class RequestCache {
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private maxItems = 50;
  private ttlMs = 1000 * 60 * 15; // 15 minutes TTL

  get(key: string): unknown | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  set(key: string, data: unknown): void {
    if (this.cache.size >= this.maxItems) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const aiRequestCache = new RequestCache();

/**
 * Rate Limiter to prevent API abuse or rapid accidental spam
 */
class RateLimiter {
  private lastCallTime = 0;
  private cooldownMs = 1200; // 1.2s cooldown between calls

  canCall(): boolean {
    const now = Date.now();
    if (now - this.lastCallTime < this.cooldownMs) {
      return false;
    }
    this.lastCallTime = now;
    return true;
  }

  getCooldownRemaining(): number {
    const remaining = this.cooldownMs - (Date.now() - this.lastCallTime);
    return Math.max(0, Math.ceil(remaining / 1000));
  }
}

export const rateLimiter = new RateLimiter();
