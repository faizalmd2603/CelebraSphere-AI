import { describe, it, expect } from 'vitest';
import {
  sanitizeInput,
  maskPII,
  hashString,
  AIResponsePayloadSchema,
  BudgetItemInputSchema
} from '../utils/security';

describe('Security, Responsible AI & Input Validation', () => {
  it('strips malicious <script> tags, iframes, and javascript pseudo-protocols', () => {
    const maliciousPayload = `<script>alert('pwned')</script><iframe src="evil.com"></iframe>Hello Celebration<a href="javascript:steal()">Click</a>`;
    const sanitized = sanitizeInput(maliciousPayload);

    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('alert');
    expect(sanitized).not.toContain('iframe');
    expect(sanitized).not.toContain('javascript:');
    expect(sanitized).toContain('Hello Celebration');
  });

  it('strips inline HTML event handlers such as onclick and onerror', () => {
    const attackString = `<img src="x" onerror="stealCookies()" onload="pwn()">Festive Decor`;
    const sanitized = sanitizeInput(attackString);

    expect(sanitized).not.toContain('onerror');
    expect(sanitized).not.toContain('onload');
    expect(sanitized).not.toContain('stealCookies');
    expect(sanitized).toContain('Festive Decor');
  });

  it('enforces string length constraints on user query inputs', () => {
    const hugeString = 'A'.repeat(5000);
    const sanitized = sanitizeInput(hugeString, 200);

    expect(sanitized.length).toBe(200);
  });

  it('masks emails, international phone numbers, and payment tokens using Privacy Shield', () => {
    const sensitivePayload = `Please contact organizer meera.bride@wedding.in or call +91 98401 23456 or aarav@upi for vendor settlements.`;
    const masked = maskPII(sensitivePayload);

    expect(masked).not.toContain('meera.bride@wedding.in');
    expect(masked).toContain('[REDACTED_EMAIL]');
    expect(masked).not.toContain('98401 23456');
    expect(masked).toContain('[REDACTED_PHONE]');
    expect(masked).not.toContain('aarav@upi');
    expect(masked).toContain('[REDACTED_PAYMENT_ID]');
  });

  it('validates AI structured responses with Zod schema and rejects malformed types', () => {
    const validAiResponse = {
      thoughtProcess: "Identified category variance",
      conversationalReply: "Rebalancing complete.",
      proposedActions: [
        {
          type: "REBALANCE_BUDGET",
          label: "Apply Rebalance",
          description: "Absorbs overruns safely",
          payload: {}
        }
      ],
      decisionAudit: {
        whatChanged: ["Catering adjusted"],
        assumptionsMade: ["Contingency floor preserved"],
        needsHumanConfirmation: ["Sign contract amendment"]
      }
    };

    const parsed = AIResponsePayloadSchema.safeParse(validAiResponse);
    expect(parsed.success).toBe(true);

    const malformedResponse = {
      // Missing conversationalReply
      proposedActions: [
        {
          type: "INVALID_ACTION_TYPE", // Illegal enum
          label: "Test"
        }
      ]
    };

    const invalidParsed = AIResponsePayloadSchema.safeParse(malformedResponse);
    expect(invalidParsed.success).toBe(false);
  });

  it('validates user budget item inputs and rejects negative costs', () => {
    const validItem = {
      name: "Sound System Rental",
      category: "AV",
      costType: "fixed",
      unitCost: 15000,
      quantity: 1,
      actualAmount: 15000
    };
    expect(BudgetItemInputSchema.safeParse(validItem).success).toBe(true);

    const negativeCostItem = {
      name: "Illegal Item",
      category: "AV",
      costType: "fixed",
      unitCost: -500, // Negative!
      quantity: 1
    };
    expect(BudgetItemInputSchema.safeParse(negativeCostItem).success).toBe(false);
  });

  it('generates consistent deterministic hashes for cache deduplication', () => {
    const inputA = "rebalance_wedding_180_1800000";
    const inputB = "rebalance_wedding_180_1800000";
    const inputC = "rebalance_wedding_210_1800000";

    expect(hashString(inputA)).toBe(hashString(inputB));
    expect(hashString(inputA)).not.toBe(hashString(inputC));
  });
});
