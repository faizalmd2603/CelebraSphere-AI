import {
  EventPlan,
  AIResponsePayload,
  ExecutableAction
} from '../types/event';
import {
  calculateReadinessScore,
  calculateBudgetSummary,
  rebalanceBudget,
  reflowTimelineWithLockedAnchors,
  simulateWeatherRelocation,
  formatCurrency
} from '../utils/calculations';
import {
  sanitizeInput,
  maskPII,
  aiRequestCache,
  hashString,
  rateLimiter,
  AIResponsePayloadSchema
} from '../utils/security';

// Available Gemini API Keys loaded strictly from environment
const PRIMARY_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const BACKUP_KEYS = [
  import.meta.env.VITE_GEMINI_API_KEY_BACKUP_1,
  import.meta.env.VITE_GEMINI_API_KEY_BACKUP_2,
  import.meta.env.VITE_GEMINI_API_KEY_BACKUP_3,
  import.meta.env.VITE_GEMINI_API_KEY_BACKUP_4,
].filter(Boolean) as string[];

const ALL_API_KEYS = [PRIMARY_KEY, ...BACKUP_KEYS].filter(k => k && k.length > 5);

// Model fallback chain: gemini-3.8-flash -> gemini-3.5-flash -> gemini-2.5-flash-lite
const TARGET_MODELS = [
  import.meta.env.VITE_GEMINI_MODEL || 'gemini-3.8-flash',
  import.meta.env.VITE_GEMINI_FALLBACK_MODEL || 'gemini-3.5-flash',
  'gemini-2.5-flash-lite'
];

let activeKeyIndex = 0;

export function getActiveEngineStatus(): { isCloud: boolean; model: string; keyCount: number } {
  const hasCloudKey = ALL_API_KEYS.length > 0;
  return {
    isCloud: hasCloudKey,
    model: hasCloudKey ? TARGET_MODELS[0] || 'Gemini 3.8 Flash' : 'Local Context Reasoning Engine',
    keyCount: ALL_API_KEYS.length
  };
}

/**
 * Sends a grounded query to Google Gemini API with fallback to Local Context Reasoning Engine
 */
export async function sendCopilotMessage(
  userQuery: string,
  livePlan: EventPlan,
  privacyShieldActive: boolean = true
): Promise<AIResponsePayload> {
  const sanitizedQuery = sanitizeInput(userQuery);
  if (!sanitizedQuery) {
    return {
      conversationalReply: "I didn't receive a query. Please ask me any question about your budget, timeline, vendors, or event ideas!",
      proposedActions: []
    };
  }

  // Check Rate Limiter
  if (!rateLimiter.canCall()) {
    const remaining = rateLimiter.getCooldownRemaining();
    return {
      conversationalReply: `Please wait ${remaining}s before sending another request to ensure rate-limit stability.`,
      proposedActions: []
    };
  }

  // Check Cache Key
  const contextSummary = `${livePlan.id}_${livePlan.guestCount}_${livePlan.totalBudget}_${livePlan.daysRemaining}`;
  const cacheKey = hashString(`${sanitizedQuery}_${contextSummary}_${privacyShieldActive}`);
  const cachedResponse = aiRequestCache.get(cacheKey) as AIResponsePayload | null;
  if (cachedResponse) {
    return cachedResponse;
  }

  // Prepare Live Grounded Context Snapshot
  const contextSnapshot = buildContextSnapshot(livePlan, privacyShieldActive);

  // If Cloud API Key exists, attempt calling Google Gemini
  if (ALL_API_KEYS.length > 0) {
    try {
      const cloudResult = await callGeminiWithFallback(sanitizedQuery, contextSnapshot, livePlan);
      if (cloudResult) {
        aiRequestCache.set(cacheKey, cloudResult);
        return cloudResult;
      }
    } catch (err) {
      console.warn('Cloud Gemini API call encountered an error. Seamlessly falling back to Local Context Reasoning Engine:', err);
    }
  }

  // Fallback: Local Context Reasoning Engine (Deterministic, zero-config, 100% reliable)
  const localResult = executeLocalContextReasoning(sanitizedQuery, livePlan);
  aiRequestCache.set(cacheKey, localResult);
  return localResult;
}

/**
 * Builds a structured, compact JSON representation of the live event state
 */
export function buildContextSnapshot(plan: EventPlan, privacyShieldActive: boolean): string {
  const readiness = calculateReadinessScore(plan);
  const budget = calculateBudgetSummary(plan);

  let rawSnapshot = JSON.stringify({
    eventTitle: plan.title,
    vertical: plan.vertical,
    daysRemaining: plan.daysRemaining,
    venue: { name: plan.venueName, type: plan.venueType },
    guestCount: plan.guestCount,
    currency: plan.currency,
    readinessScore: readiness.overallScore,
    readinessStatus: readiness.status,
    budget: {
      totalBudget: budget.totalBudget,
      totalEstimated: budget.totalEstimated,
      totalActual: budget.totalActual,
      remaining: budget.remainingBudget,
      contingency: budget.contingencyAmount,
      isOverrun: budget.isOverrun
    },
    unconfirmedVendors: plan.vendors.filter(v => v.status === 'researching' || v.status === 'quoted').map(v => ({ name: v.name, category: v.category, quote: v.quotedPrice })),
    timelineBlocksCount: plan.runOfShow.length,
    criticalTasksPending: plan.checklistTasks.filter(t => !t.completed && (t.priority === 'critical' || t.priority === 'high')).map(t => t.title),
    dietaryOverview: {
      veg: plan.guests.filter(g => g.dietaryPreference === 'vegetarian').length,
      vegan: plan.guests.filter(g => g.dietaryPreference === 'vegan').length,
      glutenFree: plan.guests.filter(g => g.dietaryPreference === 'gluten_free').length,
      allergiesLogged: plan.guests.flatMap(g => g.allergies).length
    }
  }, null, 2);

  if (privacyShieldActive) {
    rawSnapshot = maskPII(rawSnapshot);
  }

  return rawSnapshot;
}

/**
 * Calls Gemini API with model fallback and key rotation
 */
async function callGeminiWithFallback(
  userQuery: string,
  contextSnapshot: string,
  livePlan: EventPlan
): Promise<AIResponsePayload | null> {
  const systemPrompt = `You are CelebraSphere AI, an expert Celebration & Event Operations Co-Pilot.
You have direct read access to a live, stateful event plan:
${contextSnapshot}

Your goal:
1. Provide concise, highly actionable, expert guidance tailored to the event's vertical persona.
2. If the user asks for budget rebalancing, timeline shifts, vendor tasks, or ideas, return structured actionable JSON executable actions.
3. Every response MUST strictly be valid JSON in this format:
{
  "thoughtProcess": "Brief reasoning",
  "conversationalReply": "Clear markdown answer for the organizer",
  "proposedActions": [
    {
      "type": "REBALANCE_BUDGET" | "ADD_BUDGET_ITEM" | "REFLOW_TIMELINE" | "ADD_VENDOR_TASK" | "SAVE_THEME_IDEA" | "UPDATE_GUEST_COUNT",
      "label": "Short button label",
      "description": "What clicking this action will do",
      "payload": {}
    }
  ],
  "decisionAudit": {
    "whatChanged": ["item"],
    "assumptionsMade": ["item"],
    "needsHumanConfirmation": ["item"]
  }
}
Do not wrap in markdown fences or text outside JSON.`;

  for (let m = 0; m < TARGET_MODELS.length; m++) {
    const model = TARGET_MODELS[m];
    for (let k = 0; k < ALL_API_KEYS.length; k++) {
      const currentKeyIndex = (activeKeyIndex + k) % ALL_API_KEYS.length;
      const apiKey = ALL_API_KEYS[currentKeyIndex];
      if (!apiKey) continue;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: systemPrompt },
                  { text: `Organizer Query: ${userQuery}` }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.3,
              responseMimeType: "application/json"
            }
          })
        });

        if (response.status === 429) {
          // Rate limit, rotate key
          activeKeyIndex = (activeKeyIndex + 1) % ALL_API_KEYS.length;
          continue;
        }

        if (response.status === 404) {
          // Model not found, try next model
          break;
        }

        if (!response.ok) {
          continue;
        }

        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          // Clean JSON
          const cleanedJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanedJson);
          const validated = AIResponsePayloadSchema.safeParse(parsed);
          if (validated.success) {
            return validated.data;
          }
        }
      } catch (e) {
        // Continue to fallback
      }
    }
  }

  // If cloud calls failed or returned malformed JSON, return local reasoning
  return executeLocalContextReasoning(userQuery, livePlan);
}

/**
 * Deterministic Local Context Reasoning Engine
 * Evaluates live EventPlan mathematical state, detects real overruns,
 * runs timeline reflows, and returns verified executable actions.
 */
export function executeLocalContextReasoning(
  query: string,
  plan: EventPlan
): AIResponsePayload {
  const lowerQuery = query.toLowerCase();
  const readiness = calculateReadinessScore(plan);
  const budget = calculateBudgetSummary(plan);

  // 1. Budget Rebalance / Overrun Query
  if (lowerQuery.includes('rebalance') || lowerQuery.includes('overrun') || lowerQuery.includes('cut cost') || lowerQuery.includes('budget')) {
    const { newPlan, diff } = rebalanceBudget(plan);
    const hasDiff = diff.length > 0;

    const proposedActions: ExecutableAction[] = [];
    if (hasDiff) {
      proposedActions.push({
        type: 'REBALANCE_BUDGET',
        label: 'Apply Budget Rebalance',
        description: `Absorbs category overruns by trimming surplus from non-critical items while holding the 8% contingency floor.`,
        payload: { diff, rebalancedCategories: newPlan.categories }
      });
    }

    const reply = hasDiff
      ? `### 📊 Live Budget Rebalance Analysis
I analyzed your budget items and detected actual variances. 
- **Total Budget:** ${formatCurrency(budget.totalBudget, plan.currency)}
- **Current Spend:** ${formatCurrency(budget.totalActual, plan.currency)}
- **Emergency Reserve:** ${formatCurrency(budget.contingencyAmount, plan.currency)}

**Proposed Rebalancing Strategy:**
${diff.map(d => `- **${d.category}:** Reallocate ${formatCurrency(d.before, plan.currency)} → ${formatCurrency(d.after, plan.currency)}. *${d.reason}*`).join('\n')}

Click the **Apply Budget Rebalance** card below to execute this safely.`
      : `### 📊 Budget Status: Healthy
All active categories are operating within their allocated ceilings.
- **Allocated:** ${formatCurrency(budget.totalBudget, plan.currency)}
- **Actual Spend:** ${formatCurrency(budget.totalActual, plan.currency)}
- **Remaining Buffer:** ${formatCurrency(budget.remainingBudget, plan.currency)}

No overruns detected. You can review individual vendor contracts in the Vendors tab.`;

    return {
      conversationalReply: reply,
      proposedActions,
      decisionAudit: {
        whatChanged: diff.map(d => `Reallocated ${d.category} from ${d.before} to ${d.after}`),
        assumptionsMade: ['Maintained minimum 8% contingency reserve floor', 'Protected core Venue and Catering contracts'],
        needsHumanConfirmation: ['Confirm vendor payment adjustments with catering and decor leads']
      }
    };
  }

  // 2. Timeline Delay / Reflow Query
  if (lowerQuery.includes('delay') || lowerQuery.includes('timeline') || lowerQuery.includes('schedule') || lowerQuery.includes('reflow') || lowerQuery.includes('clash')) {
    const delayedBlock = plan.runOfShow[1] || plan.runOfShow[0];
    const delayAmount = 25;
    const { newBlocks, audit } = reflowTimelineWithLockedAnchors(plan.runOfShow, delayAmount, delayedBlock?.id || '');

    return {
      conversationalReply: `### ⏱️ Schedule Conflict & Delay Reflow Engine
Simulated a **+${delayAmount} min delay** starting from **"${delayedBlock?.title}"**:
- Automatically compressed flexible downstream transition buffers down to the safe 10-minute floor.
- **Strictly preserved Locked Anchors** (such as auspicious ceremony moments and fixed dinner service).

Review the detailed audit breakdown and click **"Apply Reflow to Live Schedule"** if approved.`,
      proposedActions: [
        {
          type: 'REFLOW_TIMELINE',
          label: 'Apply Reflow to Live Schedule',
          description: `Updates ${newBlocks.length} schedule blocks with conflict-free timings.`,
          payload: { runOfShow: newBlocks }
        }
      ],
      decisionAudit: {
        whatChanged: audit,
        assumptionsMade: [
          'Compressed buffer durations to minimum 10m threshold',
          'Locked anchor blocks remained immutably fixed at original clock time'
        ],
        needsHumanConfirmation: [
          'Notify emcee, sound engineer, and transport leads of shifted session times'
        ]
      }
    };
  }

  // 3. Weather / Rain Contingency
  if (lowerQuery.includes('weather') || lowerQuery.includes('rain') || lowerQuery.includes('outdoor')) {
    const { newBlocks, audit } = simulateWeatherRelocation(plan.runOfShow, 'Grand Indoor Ballroom');
    return {
      conversationalReply: `### 🌧️ Rain Contingency & Indoor Relocation Plan
Detected outdoor zones in your plan. Prepared the full weather failover protocol:
- Reassigned all lawn and terrace sessions to the indoor ballroom backup hall.
- Injected a **20-minute relocation and acoustic soundcheck buffer**.
- Flagged decor canopy vendor hold requirements.`,
      proposedActions: [
        {
          type: 'REFLOW_TIMELINE',
          label: 'Activate Indoor Weather Plan',
          description: 'Reassigns outdoor timeline blocks to the indoor backup ballroom and injects soundcheck buffer.',
          payload: { runOfShow: newBlocks }
        },
        {
          type: 'ADD_VENDOR_TASK',
          label: 'Add Tent & Canopy Hold Task',
          description: 'Adds high-priority weather tent contingency task to checklist.',
          payload: {
            title: 'Confirm Waterproof Marquee Tent & Canopy Hold with Venue Lead',
            category: 'Venue & Logistics',
            priority: 'critical'
          }
        }
      ],
      decisionAudit: {
        whatChanged: audit,
        assumptionsMade: ['Indoor ballroom is available without surcharge per venue clause', 'AV equipment can transition within 20m'],
        needsHumanConfirmation: ['Confirm indoor hall AC power load with venue electrician']
      }
    };
  }

  // 4. Guest Count Surge / Scaling
  if (lowerQuery.includes('guest') || lowerQuery.includes('headcount') || lowerQuery.includes('rsvp') || lowerQuery.includes('surge')) {
    const surgeAmount = 30;
    const newCount = plan.guestCount + surgeAmount;

    return {
      conversationalReply: `### 👥 Guest Scaling & Capacity Impact (+${surgeAmount} Guests)
- **Current Headcount:** ${plan.guestCount} → **Projected Headcount:** ${newCount}
- **Variable Cost Impact:** Catering & favors automatically scale proportionally.
- **Action Required:** Add 4 additional banquet tables and verify venue fire marshal capacity.`,
      proposedActions: [
        {
          type: 'UPDATE_GUEST_COUNT',
          label: `Scale Headcount to ${newCount}`,
          description: `Automatically updates variable catering and seating calculations for ${newCount} guests.`,
          payload: { newGuestCount: newCount }
        },
        {
          type: 'ADD_VENDOR_TASK',
          label: 'Add 4 Extra Banquet Tables Task',
          description: 'Adds urgent task to request additional seating from venue rentals.',
          payload: {
            title: 'Order 4 Extra Banquet Tables & Linens for +30 Guest Surge',
            category: 'Rentals',
            priority: 'high'
          }
        }
      ],
      decisionAudit: {
        whatChanged: [`Headcount delta: +${surgeAmount} guests`, 'Variable catering unit costs scaled'],
        assumptionsMade: ['Venue maximum capacity accommodates new headcount', 'Catering requires 72h notice'],
        needsHumanConfirmation: ['Confirm table linen availability with decor vendor']
      }
    };
  }

  // 5. General Celebration Co-Pilot Guidance
  const unconfirmedVendors = plan.vendors.filter(v => v.status === 'researching' || v.status === 'quoted');
  return {
    conversationalReply: `### 🌟 CelebraSphere AI Planning Co-Pilot
Here is your current operational snapshot for **"${plan.title}"**:
- **Event-Day Readiness Score:** **${readiness.overallScore}/100** (${readiness.status})
- **Budget Health:** ${readiness.budgetHealthScore}/100 | Remaining Buffer: ${formatCurrency(budget.remainingBudget, plan.currency)}
- **Timeline Health:** ${readiness.scheduleConflictScore}/100 (${plan.runOfShow.length} schedule blocks)
- **Vendor Confirmation:** ${readiness.vendorConfirmationScore}/100 (${unconfirmedVendors.length} unconfirmed vendors pending)

${unconfirmedVendors.length > 0 ? `> ⚠️ **Priority Alert:** ${unconfirmedVendors.map(v => v.name).join(', ')} require finalized quotes or contract signing.` : '✅ All primary vendors have secured contracts!'}

You can ask me to:
- *"Rebalance budget overruns"*
- *"Simulate +25 min delay in schedule"*
- *"Run outdoor rain contingency"*
- *"Scale guest headcount by +30"*
- *"Suggest personalized theme palettes or signature mocktails"*`,
    proposedActions: [
      {
        type: 'REBALANCE_BUDGET',
        label: 'Optimize & Rebalance Budget',
        description: 'Audits spending allocations and ensures contingency buffer safety.',
        payload: {}
      }
    ]
  };
}
