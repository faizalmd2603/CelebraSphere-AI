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
  rateLimiter
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

// Model fallback chain: gemini-2.5-flash-lite is fastest & most reliable; fallback to gemini-3.5-flash and gemini-3.8-flash
const TARGET_MODELS = [
  'gemini-2.5-flash-lite',
  import.meta.env.VITE_GEMINI_FALLBACK_MODEL || 'gemini-3.5-flash',
  import.meta.env.VITE_GEMINI_MODEL || 'gemini-3.8-flash'
];

let activeKeyIndex = 0;

export interface ChatHistoryEntry {
  role: 'user' | 'model';
  text: string;
}

export function getActiveEngineStatus(): { isCloud: boolean; model: string; keyCount: number } {
  const hasCloudKey = ALL_API_KEYS.length > 0;
  return {
    isCloud: hasCloudKey,
    model: hasCloudKey ? 'Gemini 3.8 / 2.5 Flash Live' : 'Deterministic Context Co-Pilot',
    keyCount: ALL_API_KEYS.length
  };
}

/**
 * Sends a natural, grounded query to Google Gemini API with multi-turn history and robust fallback
 */
export async function sendCopilotMessage(
  userQuery: string,
  livePlan: EventPlan,
  privacyShieldActive: boolean = true,
  history: ChatHistoryEntry[] = []
): Promise<AIResponsePayload> {
  const sanitizedQuery = sanitizeInput(userQuery);
  if (!sanitizedQuery) {
    return {
      conversationalReply: "I didn't receive your query. Please ask me any question about your wedding, birthday, community event, budget, timeline, or vendors!",
      proposedActions: []
    };
  }

  // Check Rate Limiter (1.2s cooldown)
  if (!rateLimiter.canCall()) {
    const remaining = rateLimiter.getCooldownRemaining();
    return {
      conversationalReply: `Please wait ${remaining}s before sending another request to ensure connection stability.`,
      proposedActions: []
    };
  }

  // Check In-Memory Cache Key
  const contextSummary = `${livePlan.id}_${livePlan.guestCount}_${livePlan.totalBudget}_${livePlan.daysRemaining}`;
  const historySnippet = history.slice(-3).map(h => h.text.slice(0, 30)).join('_');
  const cacheKey = hashString(`${sanitizedQuery}_${historySnippet}_${contextSummary}_${privacyShieldActive}`);
  const cachedResponse = aiRequestCache.get(cacheKey) as AIResponsePayload | null;
  if (cachedResponse) {
    return cachedResponse;
  }

  // Prepare Live Grounded Context Snapshot
  const contextSnapshot = buildContextSnapshot(livePlan, privacyShieldActive);

  // If Cloud API Key exists, attempt calling Google Gemini
  if (ALL_API_KEYS.length > 0) {
    try {
      const cloudResult = await callGeminiWithFallback(sanitizedQuery, contextSnapshot, livePlan, history);
      if (cloudResult && cloudResult.conversationalReply) {
        aiRequestCache.set(cacheKey, cloudResult);
        return cloudResult;
      }
    } catch (err) {
      console.warn('Cloud Gemini API call encountered an issue, transitioning smoothly to intelligent local reasoning:', err);
    }
  }

  // Fallback: Intelligent Local Context Reasoning Engine
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
    unconfirmedVendors: plan.vendors
      .filter(v => v.status === 'researching' || v.status === 'quoted')
      .map(v => ({ name: v.name, category: v.category, quote: v.quotedPrice })),
    timelineBlocksCount: plan.runOfShow.length,
    criticalTasksPending: plan.checklistTasks
      .filter(t => !t.completed && (t.priority === 'critical' || t.priority === 'high'))
      .map(t => t.title),
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
 * Calls Gemini API with multi-turn support, key rotation, and per-call timeout
 */
async function callGeminiWithFallback(
  userQuery: string,
  contextSnapshot: string,
  livePlan: EventPlan,
  history: ChatHistoryEntry[]
): Promise<AIResponsePayload | null> {
  const systemInstructionText = `You are CelebraSphere AI, an expert, warm, and highly professional Celebration & Event Operations Co-Pilot. You converse with natural intelligence, empathy, and depth just like ChatGPT and Google Gemini, specialized in weddings, birthdays, anniversaries, and community festivals.

You have direct real-time visibility into the user's active event workspace:
${contextSnapshot}

YOUR GUIDELINES:
1. Always respond warmly, naturally, and comprehensively to the user's exact question, whether it is high-level ("How can I host a grand wedding?") or specific ("What are the top 3 mocktails?").
2. Connect your advice to their actual event context when relevant (e.g. mention their venue, guest count, or budget naturally).
3. If the user's query relates to budget rebalancing, timeline shifts, vendor tasks, or ideas, you can suggest concrete actions.
4. Format your response in clean, beautiful Markdown with headings, bullet points, and practical tips.`;

  // Build multi-turn messages array
  const formattedContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  // Add recent history (up to last 6 turns)
  history.slice(-6).forEach(entry => {
    formattedContents.push({
      role: entry.role === 'user' ? 'user' : 'model',
      parts: [{ text: entry.text }]
    });
  });

  // Add current query
  formattedContents.push({
    role: 'user',
    parts: [{ text: userQuery }]
  });

  for (let m = 0; m < TARGET_MODELS.length; m++) {
    const model = TARGET_MODELS[m];

    for (let k = 0; k < ALL_API_KEYS.length; k++) {
      const currentKeyIndex = (activeKeyIndex + k) % ALL_API_KEYS.length;
      const apiKey = ALL_API_KEYS[currentKeyIndex];
      if (!apiKey) continue;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 9000); // 9s timeout per call

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemInstructionText }]
            },
            contents: formattedContents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048
            }
          })
        });

        clearTimeout(timeoutId);

        if (response.status === 429) {
          activeKeyIndex = (activeKeyIndex + 1) % ALL_API_KEYS.length;
          continue;
        }

        if (response.status === 404) {
          break; // Try next model
        }

        if (!response.ok) {
          continue;
        }

        const data = await response.json();
        const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (replyText && typeof replyText === 'string' && replyText.trim().length > 0) {
          // Check if response contains structured actions or synthesize contextually
          const proposedActions = extractOrSuggestActions(userQuery, replyText, livePlan);

          return {
            conversationalReply: replyText.trim(),
            proposedActions
          };
        }
      } catch (err) {
        // Continue to next key or model
      }
    }
  }

  return null;
}

/**
 * Dynamically synthesizes contextual action cards based on conversation content
 */
function extractOrSuggestActions(
  query: string,
  replyText: string,
  plan: EventPlan
): ExecutableAction[] {
  const combined = (query + ' ' + replyText).toLowerCase();
  const actions: ExecutableAction[] = [];

  if (combined.includes('rebalance') || combined.includes('overrun') || combined.includes('budget cut')) {
    actions.push({
      type: 'REBALANCE_BUDGET',
      label: 'Run Budget Rebalance',
      description: 'Absorbs overruns from non-critical categories while preserving the 8% contingency floor.',
      payload: {}
    });
  }

  if (combined.includes('delay') || combined.includes('schedule') || combined.includes('clash') || combined.includes('timeline')) {
    actions.push({
      type: 'REFLOW_TIMELINE',
      label: 'Simulate +25m Schedule Reflow',
      description: 'Shifts downstream sessions while locking rigid ceremonial anchor blocks.',
      payload: {}
    });
  }

  if (combined.includes('rain') || combined.includes('weather') || combined.includes('outdoor')) {
    actions.push({
      type: 'REFLOW_TIMELINE',
      label: 'Activate Indoor Weather Plan',
      description: 'Relocates outdoor sessions to the indoor backup ballroom and adds soundcheck buffer.',
      payload: {}
    });
  }

  if (combined.includes('guest') && (combined.includes('increase') || combined.includes('surge') || combined.includes('add'))) {
    actions.push({
      type: 'UPDATE_GUEST_COUNT',
      label: `Scale Headcount (+25 Guests)`,
      description: `Updates per-guest catering and seating allocations for ${plan.guestCount + 25} guests.`,
      payload: { newGuestCount: plan.guestCount + 25 }
    });
  }

  return actions;
}

/**
 * Intelligent Local Context Reasoning Engine
 * Provides rich, empathetic, human-quality advice for ANY celebration inquiry
 */
export function executeLocalContextReasoning(
  query: string,
  plan: EventPlan
): AIResponsePayload {
  const lowerQuery = query.toLowerCase();
  const readiness = calculateReadinessScore(plan);
  const budget = calculateBudgetSummary(plan);

  // 1. General Celebration / Marriage / Success Planning
  if (lowerQuery.includes('marriage') || lowerQuery.includes('wedding') || lowerQuery.includes('host') || lowerQuery.includes('success') || lowerQuery.includes('start') || lowerQuery.includes('help')) {
    const reply = `### 💍 Blueprint for a Grand & Seamless Celebration

Hosting a magnificent celebration for **"${plan.title}"** is all about harmonizing three elements: **guest experience**, **operational pacing**, and **financial discipline**. 

Here is my recommended master roadmap tailored to your event:

#### 1. Define Your 3 Unshakeable Pillars
- **Culinary Delight:** Guests remember great food above all else. For your ${plan.guestCount} guests, ensure live counters, clear dietary signs (especially for the ${plan.guests.filter(g => g.dietaryPreference === 'vegetarian').length} vegetarian guests), and separate allergy-safe plating.
- **Atmospheric Decor:** Transform **${plan.venueName}** with ambient warm lighting, fresh florals, and a statement ceremonial entrance backdrop.
- **Rhythm & Run-of-Show:** Keep transitions brisk. Avoid long 45+ minute dead intervals where guests wait idly.

#### 2. Master Budget & Financial Architecture
- **Allocated Ceiling:** ${formatCurrency(budget.totalBudget, plan.currency)}
- **Fixed vs. Variable Discipline:** Fixed venue & decor packages are capped, while catering and welcome kits scale per head.
- **Contingency Armor:** Always maintain at least a **10% Emergency Reserve** (${formatCurrency(budget.contingencyAmount, plan.currency)}) to absorb last-minute generator fuel, extra floral garlands, or unexpected guests.

#### 3. Vendor Command & Pre-Booking Safety
- Lock in your core quartet: **Venue, Catering, Photography, and Music/AV**.
- For each contract, verify the **Force Majeure & Weather Relocation** clause (especially crucial since you have ${plan.venueType} spaces).

#### 4. Day-of Run-of-Show & Locked Anchors
- Designate strict **Locked Anchor Times** for auspicious rituals or dinner dispatch so your team never compromises auspicious timing during accidental delays.

What specific area would you like to dive into next — **fine-tuning your budget split**, **curating signature culinary ideas**, or **stress-testing the day-of timeline**?`;

    return {
      conversationalReply: reply,
      proposedActions: [
        {
          type: 'REBALANCE_BUDGET',
          label: 'Audit & Optimize Budget',
          description: 'Checks category variances and contingency buffers.',
          payload: {}
        },
        {
          type: 'REFLOW_TIMELINE',
          label: 'Review Run-of-Show Timings',
          description: 'Inspects sequential session flow and buffer times.',
          payload: {}
        }
      ]
    };
  }

  // 2. Budget Rebalance / Overrun Query
  if (lowerQuery.includes('rebalance') || lowerQuery.includes('overrun') || lowerQuery.includes('cost') || lowerQuery.includes('budget') || lowerQuery.includes('money')) {
    const { newPlan, diff } = rebalanceBudget(plan);
    const hasDiff = diff.length > 0;

    const proposedActions: ExecutableAction[] = [];
    if (hasDiff) {
      proposedActions.push({
        type: 'REBALANCE_BUDGET',
        label: 'Apply Budget Rebalance',
        description: `Absorbs overruns by reallocating surplus from non-critical categories while preserving the 8% contingency floor.`,
        payload: { diff, rebalancedCategories: newPlan.categories }
      });
    }

    const reply = hasDiff
      ? `### 📊 Live Budget Rebalance Analysis
I analyzed your budget ledger and detected active category variances:
- **Total Budget Ceiling:** ${formatCurrency(budget.totalBudget, plan.currency)}
- **Current Spend:** ${formatCurrency(budget.totalActual, plan.currency)}
- **Emergency Reserve:** ${formatCurrency(budget.contingencyAmount, plan.currency)}

**Proposed Rebalancing Strategy:**
${diff.map(d => `- **${d.category}:** Reallocate ${formatCurrency(d.before, plan.currency)} → ${formatCurrency(d.after, plan.currency)}. *${d.reason}*`).join('\n')}

Click the **Apply Budget Rebalance** card below to execute this safely.`
      : `### 📊 Budget Status: Healthy & Balanced
All categories in **"${plan.title}"** are currently operating within their allocated ceilings:
- **Allocated Ceiling:** ${formatCurrency(budget.totalBudget, plan.currency)}
- **Current Actual Spend:** ${formatCurrency(budget.totalActual, plan.currency)}
- **Remaining Buffer:** ${formatCurrency(budget.remainingBudget, plan.currency)}
- **Contingency Floor:** Safe at ${plan.contingencyPercentage}% (${formatCurrency(budget.contingencyAmount, plan.currency)})

No immediate overruns detected. If you want to expand any category (such as decor or music), you can add custom line items in the Budget tab!`;

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

  // 3. Timeline / Delay / Conflict Query
  if (lowerQuery.includes('delay') || lowerQuery.includes('timeline') || lowerQuery.includes('schedule') || lowerQuery.includes('reflow') || lowerQuery.includes('clash') || lowerQuery.includes('time')) {
    const delayedBlock = plan.runOfShow[1] || plan.runOfShow[0];
    const delayAmount = 25;
    const { newBlocks, audit } = reflowTimelineWithLockedAnchors(plan.runOfShow, delayAmount, delayedBlock?.id || '');

    return {
      conversationalReply: `### ⏱️ Dependency-Aware Timeline Reflow Engine
Simulated a **+${delayAmount} min delay** starting from **"${delayedBlock?.title}"**:
- Automatically compressed downstream flexible transition buffers down to the safe 10-minute floor.
- **Strictly preserved Locked Anchors** (such as auspicious ritual moments and fixed catering dispatches) to prevent cascading clashes.

Review the audit details below and click **"Apply Reflow to Live Schedule"** to commit this to your active run-of-show.`,
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

  // 4. Weather / Rain Contingency
  if (lowerQuery.includes('weather') || lowerQuery.includes('rain') || lowerQuery.includes('storm') || lowerQuery.includes('outdoor')) {
    const { newBlocks, audit } = simulateWeatherRelocation(plan.runOfShow, 'Grand Indoor Ballroom');
    return {
      conversationalReply: `### 🌧️ Rain Contingency & Weather Failover Protocol
Detected outdoor zones in **"${plan.title}"**. Here is the failover plan:
- Reassigned all lawn and terrace sessions to the indoor ballroom backup hall.
- Injected a **20-minute relocation and acoustic soundcheck buffer** before the first relocated session.
- Added a high-priority tent & canopy hold task to your checklist.`,
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

  // 5. Guest Scaling / Headcount
  if (lowerQuery.includes('guest') || lowerQuery.includes('headcount') || lowerQuery.includes('rsvp') || lowerQuery.includes('people') || lowerQuery.includes('attendee')) {
    const surgeAmount = 30;
    const newCount = plan.guestCount + surgeAmount;

    return {
      conversationalReply: `### 👥 Guest Capacity & Cost Impact Analysis
- **Current Headcount:** ${plan.guestCount} &rarr; **Projected Headcount:** ${newCount} (+${surgeAmount} Guests)
- **Variable Cost Impact:** Catering and welcome kits will automatically scale proportionally based on your per-head unit costs.
- **Seating & Table Impact:** 4 additional 8-seater banquet tables required with linens.
- **Dietary Buffer:** Recommend ordering a 10% vegetarian and gluten-free buffer over the confirmed count.`,
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

  // 6. Theme, Creative, Decor, Food
  if (lowerQuery.includes('theme') || lowerQuery.includes('decor') || lowerQuery.includes('food') || lowerQuery.includes('menu') || lowerQuery.includes('mocktail') || lowerQuery.includes('idea')) {
    return {
      conversationalReply: `### 🎨 Creative Direction for "${plan.title}"

Here are personalized concepts suited to your **${plan.vertical}** setting at **${plan.venueName}**:

1. **Theme & Lighting Mood:**
   - Layer golden hour amber up-lights with natural floral foliage.
   - Use brass temple deepams or fairy-light canopies for an organic warm glow.
2. **Signature Culinary & Mocktail Experience:**
   - **Tender Coconut Elaneer Cooler:** Fresh tender coconut water infused with mint, ginger, and lime.
   - **Artisanal High-Tea Counter:** Filter coffee served in traditional brass tumblers alongside bite-sized savory canapés.
3. **Memorable Keepsake Ritual:**
   - Set up an interactive message wall where guests sign wooden puzzle pieces or write blessings on handwoven palm leaves.

You can explore these concepts with hex swatches in the **Ideas Studio & RSVP** tab!`,
      proposedActions: [
        {
          type: 'SAVE_THEME_IDEA',
          label: 'Explore Ideas Studio',
          description: 'Opens theme palettes, culinary concepts, and eco-friendly swaps.',
          payload: {}
        }
      ]
    };
  }

  // 7. General Conversational Fallback
  return {
    conversationalReply: `### 🌟 CelebraSphere AI Planning Co-Pilot
I am here to help you coordinate every operational, financial, and creative milestone for **"${plan.title}"**!

Here is your active workspace summary:
- **Event Date:** ${plan.eventDate} (${plan.daysRemaining} days remaining)
- **Headcount:** ${plan.guestCount} Guests
- **Budget Ceiling:** ${formatCurrency(budget.totalBudget, plan.currency)} (Remaining Buffer: ${formatCurrency(budget.remainingBudget, plan.currency)})
- **Readiness Score:** **${readiness.overallScore}/100** (${readiness.status})

Tell me what you'd like to work on right now — for instance:
- *"How should I allocate my budget across venue and catering?"*
- *"What should I do if a vendor delays their delivery?"*
- *"Can you give me ideas for memorable guest engagement?"*
- *"Help me prepare a checklist for 1 month before the event"*`,
    proposedActions: [
      {
        type: 'REBALANCE_BUDGET',
        label: 'Optimize Budget Allocations',
        description: 'Audits spending allocations and ensures contingency buffer safety.',
        payload: {}
      }
    ]
  };
}
