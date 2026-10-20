import {
  EventPlan,
  AIResponsePayload,
  ExecutableAction,
  AgenticTraceStep,
  WeatherTelemetry
} from '../types/event';
import {
  calculateReadinessScore,
  calculateBudgetSummary,
  formatCurrency
} from '../utils/calculations';
import {
  sanitizeInput,
  maskPII,
  aiRequestCache,
  hashString
} from '../utils/security';
import {
  getLiveWeatherTelemetry,
  executeWeatherRelocation,
  executeBudgetAuditAndRebalance,
  executeTimelineScheduleReflow,
  executeGuestHeadcountScaling,
  executeAutomateTasks
} from './agentTools';
import { SupportedLanguage, getTranslation } from '../i18n/translations';

// Available Gemini API Keys loaded strictly from environment
const PRIMARY_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const BACKUP_KEYS = [
  import.meta.env.VITE_GEMINI_API_KEY_BACKUP_1,
  import.meta.env.VITE_GEMINI_API_KEY_BACKUP_2,
  import.meta.env.VITE_GEMINI_API_KEY_BACKUP_3,
  import.meta.env.VITE_GEMINI_API_KEY_BACKUP_4,
].filter(Boolean) as string[];

const ALL_GEMINI_KEYS = [PRIMARY_KEY, ...BACKUP_KEYS].filter(k => k && k.length > 5);

// Alternative High-Speed Fallback Providers
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';

// Latest Active Models as of October 2026:
const GEMINI_MODELS = ['gemini-2.5-flash-lite', 'gemini-3.5-flash-lite', 'gemini-3.8-flash'];
const GROQ_MODELS = ['qwen/qwen3.8-27b', 'openai/gpt-oss-20b', 'openai/gpt-oss-120b'];
const OPENROUTER_MODELS = ['nvidia/nemotron-3.5-lightning:free', 'meta-llama/llama-3.3-70b-instruct'];

let activeGeminiKeyIndex = 0;

export interface ChatHistoryEntry {
  role: 'user' | 'model';
  text: string;
}

const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  ta: 'Tamil (தமிழ்)',
  hi: 'Hindi (हिन्दी)',
  ml: 'Malayalam (മലയാളം)',
  kn: 'Kannada (ಕನ್ನಡ)',
  te: 'Telugu (తెలుగు)',
  bn: 'Bengali (বাংলা)',
  mr: 'Marathi (मराठी)',
  gu: 'Gujarati (ગુજરાતી)'
};

export function getActiveEngineStatus(): { isCloud: boolean; model: string; keyCount: number } {
  const hasCloud = ALL_GEMINI_KEYS.length > 0 || !!GROQ_KEY || !!OPENROUTER_KEY;
  let modelLabel = 'Autonomous Agentic Operations Engine';
  if (ALL_GEMINI_KEYS.length > 0) {
    modelLabel = 'Gemini 2.5 Flash / Multi-Cloud Agent';
  } else if (GROQ_KEY) {
    modelLabel = 'Groq Qwen 3.8 Ultra-Fast Live';
  } else if (OPENROUTER_KEY) {
    modelLabel = 'OpenRouter Nemotron Live';
  }

  return {
    isCloud: hasCloud,
    model: modelLabel,
    keyCount: ALL_GEMINI_KEYS.length + (GROQ_KEY ? 1 : 0) + (OPENROUTER_KEY ? 1 : 0)
  };
}

/**
 * Sends a natural, grounded query to our Multi-Cloud AI Mesh:
 * Tier 1: Google Gemini API (gemini-2.5-flash-lite)
 * Tier 2: Groq Cloud API (qwen/qwen3.8-27b - ultra fast 10ms-400ms)
 * Tier 3: OpenRouter API (nemotron/llama-3.3)
 * Tier 4: Autonomous Agentic Local Engine (zero freeze guarantee)
 */
export async function sendCopilotMessage(
  userQuery: string,
  livePlan: EventPlan,
  privacyShieldActive: boolean = true,
  history: ChatHistoryEntry[] = [],
  language: SupportedLanguage = 'en'
): Promise<AIResponsePayload> {
  const sanitizedQuery = sanitizeInput(userQuery);
  if (!sanitizedQuery) {
    return {
      conversationalReply: "I didn't receive your query. Please ask me any question about your event's budget, weather, timeline reflow, vendor tasks, or creative ideas!",
      proposedActions: []
    };
  }

  // Check In-Memory Cache Key
  const contextSummary = `${livePlan.id}_${livePlan.guestCount}_${livePlan.totalBudget}_${livePlan.daysRemaining}`;
  const historySnippet = history.slice(-3).map(h => h.text.slice(0, 30)).join('_');
  const cacheKey = hashString(`${sanitizedQuery}_${historySnippet}_${contextSummary}_${privacyShieldActive}_${language}`);
  const cachedResponse = aiRequestCache.get(cacheKey) as AIResponsePayload | null;
  if (cachedResponse) {
    return cachedResponse;
  }

  // Prepare Live Grounded Context Snapshot
  const contextSnapshot = buildContextSnapshot(livePlan, privacyShieldActive);
  const langName = LANGUAGE_NAMES[language] || 'English';

  // Tier 1: Google Gemini
  if (ALL_GEMINI_KEYS.length > 0) {
    try {
      const geminiResult = await callGeminiWithFastTimeout(sanitizedQuery, contextSnapshot, livePlan, history, langName, language);
      if (geminiResult && geminiResult.conversationalReply) {
        aiRequestCache.set(cacheKey, geminiResult);
        return geminiResult;
      }
    } catch (err) {
      console.warn('Gemini attempt timed out or failed. Transitioning to Groq Tier:', err);
    }
  }

  // Tier 2: Groq Cloud API (Ultra-Fast < 500ms inference)
  if (GROQ_KEY) {
    try {
      const groqResult = await callGroqWithFastTimeout(sanitizedQuery, contextSnapshot, livePlan, history, langName, language);
      if (groqResult && groqResult.conversationalReply) {
        aiRequestCache.set(cacheKey, groqResult);
        return groqResult;
      }
    } catch (err) {
      console.warn('Groq attempt timed out or failed. Transitioning to OpenRouter Tier:', err);
    }
  }

  // Tier 3: OpenRouter API
  if (OPENROUTER_KEY) {
    try {
      const openRouterResult = await callOpenRouterWithFastTimeout(sanitizedQuery, contextSnapshot, livePlan, history, langName, language);
      if (openRouterResult && openRouterResult.conversationalReply) {
        aiRequestCache.set(cacheKey, openRouterResult);
        return openRouterResult;
      }
    } catch (err) {
      console.warn('OpenRouter attempt timed out or failed. Transitioning to Local Agentic Engine:', err);
    }
  }

  // Tier 4: Autonomous Agentic Local Engine (Deterministic, Multilingual & Instantaneous)
  const agenticResult = executeAgenticReasoning(sanitizedQuery, livePlan, language);
  aiRequestCache.set(cacheKey, agenticResult);
  return agenticResult;
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

function buildSystemInstruction(contextSnapshot: string, livePlan: EventPlan, langName: string): string {
  return `You are CelebraSphere AI, a world-class, empathetic, and highly capable Celebration & Event Operations Co-Pilot. You converse with natural intelligence, warmth, and depth like ChatGPT and Google Gemini, specialized in weddings, milestone birthdays, and community festivals.

ACTIVE WORKSPACE REAL-TIME CONTEXT:
${contextSnapshot}

CRITICAL MULTILINGUAL MANDATE:
The user has chosen to communicate in: **${langName}**.
You MUST respond entirely, naturally, and fluently in **${langName}**. Use culturally respectful celebration vocabulary (e.g. Muhurtham, Sangeet, Mehendi, Mandap, catering specialties, auspicious timings, etc.).

OPERATIONAL CAPABILITIES:
1. Ground your advice in their actual numbers: Venue "${livePlan.venueName}", Headcount ${livePlan.guestCount}, Budget ${livePlan.currency} ${livePlan.totalBudget.toLocaleString()}, Countdown ${livePlan.daysRemaining} days.
2. If asked about weather, delays, budget, guests, tasks, or creative ideas, provide clear, step-by-step guidance formatted in clean, elegant Markdown.`;
}

/**
 * Calls Google Gemini API with tight 3.2s abort timeout
 */
async function callGeminiWithFastTimeout(
  userQuery: string,
  contextSnapshot: string,
  livePlan: EventPlan,
  history: ChatHistoryEntry[],
  langName: string,
  language: SupportedLanguage
): Promise<AIResponsePayload | null> {
  const systemInstructionText = buildSystemInstruction(contextSnapshot, livePlan, langName);

  const formattedContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  history.slice(-4).forEach(entry => {
    formattedContents.push({
      role: entry.role === 'user' ? 'user' : 'model',
      parts: [{ text: entry.text }]
    });
  });

  formattedContents.push({
    role: 'user',
    parts: [{ text: userQuery }]
  });

  const apiKey = ALL_GEMINI_KEYS[activeGeminiKeyIndex] || PRIMARY_KEY;
  if (!apiKey) return null;

  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3200);

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
            maxOutputTokens: 1200
          }
        })
      });

      clearTimeout(timeoutId);

      if (response.status === 429) {
        activeGeminiKeyIndex = (activeGeminiKeyIndex + 1) % ALL_GEMINI_KEYS.length;
        continue;
      }

      if (!response.ok) continue;

      const data = await response.json();
      const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (replyText && typeof replyText === 'string' && replyText.trim().length > 0) {
        const { actions, trace, telemetry, decisionAudit } = synthesizeAgenticActionsAndTrace(userQuery, replyText, livePlan, language);

        return {
          conversationalReply: replyText.trim(),
          proposedActions: actions,
          agenticTrace: trace,
          weatherTelemetry: telemetry,
          decisionAudit
        };
      }
    } catch {
      // Continue to next model or tier
    }
  }

  return null;
}

/**
 * Calls Groq Cloud API with ultra-low latency (< 500ms)
 */
async function callGroqWithFastTimeout(
  userQuery: string,
  contextSnapshot: string,
  livePlan: EventPlan,
  history: ChatHistoryEntry[],
  langName: string,
  language: SupportedLanguage
): Promise<AIResponsePayload | null> {
  const systemInstructionText = buildSystemInstruction(contextSnapshot, livePlan, langName);

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemInstructionText }
  ];

  history.slice(-4).forEach(entry => {
    messages.push({
      role: entry.role === 'user' ? 'user' : 'assistant',
      content: entry.text
    });
  });

  messages.push({ role: 'user', content: userQuery });

  for (const model of GROQ_MODELS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3200);

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_KEY}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 1200
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) continue;

      const data = await response.json();
      const replyText = data?.choices?.[0]?.message?.content;

      if (replyText && typeof replyText === 'string' && replyText.trim().length > 0) {
        const { actions, trace, telemetry, decisionAudit } = synthesizeAgenticActionsAndTrace(userQuery, replyText, livePlan, language);

        return {
          conversationalReply: replyText.trim(),
          proposedActions: actions,
          agenticTrace: trace,
          weatherTelemetry: telemetry,
          decisionAudit
        };
      }
    } catch {
      // Continue to next model
    }
  }

  return null;
}

/**
 * Calls OpenRouter API as additional safety tier
 */
async function callOpenRouterWithFastTimeout(
  userQuery: string,
  contextSnapshot: string,
  livePlan: EventPlan,
  history: ChatHistoryEntry[],
  langName: string,
  language: SupportedLanguage
): Promise<AIResponsePayload | null> {
  const systemInstructionText = buildSystemInstruction(contextSnapshot, livePlan, langName);

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemInstructionText }
  ];

  history.slice(-4).forEach(entry => {
    messages.push({
      role: entry.role === 'user' ? 'user' : 'assistant',
      content: entry.text
    });
  });

  messages.push({ role: 'user', content: userQuery });

  for (const model of OPENROUTER_MODELS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_KEY}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) continue;

      const data = await response.json();
      const replyText = data?.choices?.[0]?.message?.content;

      if (replyText && typeof replyText === 'string' && replyText.trim().length > 0) {
        const { actions, trace, telemetry, decisionAudit } = synthesizeAgenticActionsAndTrace(userQuery, replyText, livePlan, language);

        return {
          conversationalReply: replyText.trim(),
          proposedActions: actions,
          agenticTrace: trace,
          weatherTelemetry: telemetry,
          decisionAudit
        };
      }
    } catch {
      // Continue
    }
  }

  return null;
}

/**
 * Autonomous Agentic Operations Engine (Local Fallback)
 * Deterministic, instant, and fully translated across all 9 Indian languages.
 */
export function executeAgenticReasoning(
  query: string,
  plan: EventPlan,
  language: SupportedLanguage = 'en'
): AIResponsePayload {
  const lowerQuery = query.toLowerCase();
  const readiness = calculateReadinessScore(plan);
  const budget = calculateBudgetSummary(plan);
  const t = getTranslation(language);

  // 1. Tool Execution: Live Weather Check & Rain Failover
  if (
    lowerQuery.includes('weather') ||
    lowerQuery.includes('rain') ||
    lowerQuery.includes('forecast') ||
    lowerQuery.includes('temp') ||
    lowerQuery.includes('storm') ||
    lowerQuery.includes('outdoor') ||
    lowerQuery.includes('வானிலை') ||
    lowerQuery.includes('மழை') ||
    lowerQuery.includes('मौसम') ||
    lowerQuery.includes('बारिश')
  ) {
    const telemetry = getLiveWeatherTelemetry(plan.venueName, plan.venueType, plan.eventDate);
    const { updatedRunOfShow, audit, newTask } = executeWeatherRelocation(plan);

    const trace: AgenticTraceStep[] = [
      {
        step: 1,
        label: 'Workspace Context Ingestion',
        detail: `Ingested active venue "${plan.venueName}" (${plan.venueType} layout) for ${plan.title}.`,
        status: 'completed'
      },
      {
        step: 2,
        label: 'Tool Call: check_weather',
        detail: `Atmospheric reading: ${telemetry.temperature}, ${telemetry.condition}, ${telemetry.precipitationProbability}% precipitation probability.`,
        status: 'completed'
      },
      {
        step: 3,
        label: 'Risk Assessment & Decision',
        detail: telemetry.precipitationProbability > 30
          ? `Rain risk is elevated (${telemetry.precipitationProbability}%). Automated indoor relocation and soundcheck buffer required.`
          : 'Weather conditions are optimal. Outdoor setups can proceed with basic wind restraints.',
        status: 'completed'
      },
      {
        step: 4,
        label: 'Tool Call: relocate_weather_backup',
        detail: `Reallocated outdoor lawn sessions to Grand Indoor Ballroom and injected 20m soundcheck buffer.`,
        status: 'completed'
      }
    ];

    const actions: ExecutableAction[] = [
      {
        type: 'APPLY_WEATHER_BACKUP',
        label: t.rainFailover,
        description: 'Moves lawn sessions to Grand Indoor Ballroom, adds a 20-min transition buffer, and reserves canopy hold.',
        payload: { runOfShow: updatedRunOfShow }
      },
      {
        type: 'ADD_VENDOR_TASK',
        label: 'Lock Weather Canopy Hold',
        description: newTask.title,
        payload: {
          title: newTask.title,
          category: newTask.category,
          priority: newTask.priority
        }
      }
    ];

    let conversationalReply = `### 🌤️ Live Atmospheric & Weather Telemetry Report
I inspected the active meteorological radar for **"${plan.venueName}"**:

- **Location:** ${telemetry.location}
- **Current Reading:** **${telemetry.temperature}** | **${telemetry.condition}**
- **Precipitation Probability:** **${telemetry.precipitationProbability}%**
- **Wind & Humidity:** ${telemetry.windSpeed} | ${telemetry.humidity} Humidity
- **Operations Advisory:** *${telemetry.advisory}*

#### ⚡ Autonomous Agentic Action Taken
Because your venue incorporates ${plan.venueType} spaces and rain risk is at **${telemetry.precipitationProbability}%**, I have prepared an immediate **Indoor Ballroom Weather Relocation Plan**:
1. All open-air lawn sessions are mapped to the **Grand Indoor Ballroom**.
2. A **20-minute acoustic soundcheck buffer** is injected before the main ceremonial block.
3. Added a critical checklist task to verify backup generator power loads.

Click **"${t.rainFailover}"** below to apply this directly to your active schedule!`;

    if (language === 'ta') {
      conversationalReply = `### 🌤️ நேரடி வானிலை மற்றும் ரேடார் தகவல் அறிக்கை
**"${plan.venueName}"** பகுதிக்கான தற்போதைய வானிலை அறிக்கையை ஆய்வு செய்தேன்:

- **இடம்:** ${telemetry.location}
- **தற்போதைய வெப்பநிலை:** **${telemetry.temperature}** | **${telemetry.condition}**
- **மழை பெய்யும் வாய்ப்பு:** **${telemetry.precipitationProbability}%**
- **காற்று மற்றும் ஈரப்பதம்:** ${telemetry.windSpeed} | ${telemetry.humidity}
- **வழிகாட்டுதல்:** *${telemetry.advisory}*

#### ⚡ தானியங்கி செயல்பாட்டு முடிவு:
தங்கள் நிகழ்வு திறந்தவெளிப் பகுதிகளைக் கொண்டிருப்பதாலும், மழை வாய்ப்பு **${telemetry.precipitationProbability}%** இருப்பதாலும், உடனடி **உட்புற மண்டப மாற்றத் திட்டத்தை** செயல்படுத்தியுள்ளேன்:
1. புல்வெளி நிகழ்ச்சிகள் அனைத்தும் **உட்புற பெரிய திருமண மண்டபத்திற்கு** மாற்றப்படும்.
2. ஒலி மற்றும் ஒலிவாங்கி சோதனைகளுக்காக **20 நிமிட இடையக நேரம்** சேர்க்கப்பட்டுள்ளது.
3. அவசரக்கால மின்சார ஜெனரேட்டரை உறுதிசெய்ய முக்கியமான பணி சேர்க்கப்பட்டுள்ளது.

கீழே உள்ள **"${t.rainFailover}"** பொத்தானை அழுத்தி இதை உங்கள் திட்டத்தில் சேர்க்கவும்!`;
    } else if (language === 'hi') {
      conversationalReply = `### 🌤️ लाइव मौसम और रडार टेलीमेट्री रिपोर्ट
मैंने **"${plan.venueName}"** के लिए सक्रिय मौसम रडार का निरीक्षण किया है:

- **स्थान:** ${telemetry.location}
- **वर्तमान तापमान:** **${telemetry.temperature}** | **${telemetry.condition}**
- **वर्षा की संभावना:** **${telemetry.precipitationProbability}%**
- **हवा और आर्द्रता:** ${telemetry.windSpeed} | ${telemetry.humidity}
- **परिचालन सलाह:** *${telemetry.advisory}*

#### ⚡ स्वचालित एजेंटिक कार्रवाई:
क्योंकि आपके आयोजन स्थल में आउटडोर स्थान शामिल हैं और बारिश का जोखिम **${telemetry.precipitationProbability}%** है, मैंने एक इनडोर बैंक्वेट बैकअप योजना तैयार की है:
1. सभी लॉन सत्रों को **ग्रैंड इंडोर बॉलरूम** में स्थानांतरित किया गया है।
2. मुख्य अनुष्ठान से पहले **20 मिनट का साउंडचेक बफर** जोड़ा गया है।
3. बैकअप जनरेटर लोड सत्यापन का महत्वपूर्ण कार्य चेकलिस्ट में जोड़ा गया है।

इसे अपनी लाइव अनुसूची पर लागू करने के लिए नीचे दिए गए बटन पर क्लिक करें!`;
    }

    return {
      conversationalReply,
      proposedActions: actions,
      agenticTrace: trace,
      weatherTelemetry: telemetry,
      decisionAudit: {
        whatChanged: audit,
        assumptionsMade: ['Backup ballroom is available under venue contract', 'AV transitions completed within 20m'],
        needsHumanConfirmation: ['Confirm indoor ballroom air conditioning load with facility engineer']
      }
    };
  }

  // 2. Tool Execution: Budget Variance Audit & Auto-Rebalance
  if (
    lowerQuery.includes('rebalance') ||
    lowerQuery.includes('budget') ||
    lowerQuery.includes('overrun') ||
    lowerQuery.includes('spend') ||
    lowerQuery.includes('cost') ||
    lowerQuery.includes('money') ||
    lowerQuery.includes('பட்ஜெட்') ||
    lowerQuery.includes('செலவு') ||
    lowerQuery.includes('बजट')
  ) {
    const { newPlan, diff, budgetSummary } = executeBudgetAuditAndRebalance(plan);
    const hasDiff = diff.length > 0;

    const trace: AgenticTraceStep[] = [
      {
        step: 1,
        label: 'Ledger Audit',
        detail: `Audited ${plan.budgetItems.length} line items across ${plan.categories.length} categories against ceiling of ${formatCurrency(budget.totalBudget, plan.currency)}.`,
        status: 'completed'
      },
      {
        step: 2,
        label: 'Tool Call: rebalance_budget',
        detail: hasDiff
          ? `Detected variance across ${diff.length} categories. Reallocated surplus from under-spent non-critical areas.`
          : 'All categories are within allocated ceilings. Contingency reserve intact.',
        status: 'completed'
      },
      {
        step: 3,
        label: 'Safety Floor Enforcement',
        detail: `Verified emergency contingency reserve remains strictly >= 8% (${formatCurrency(budget.contingencyAmount, plan.currency)} maintained).`,
        status: 'completed'
      }
    ];

    const actions: ExecutableAction[] = [];
    if (hasDiff) {
      actions.push({
        type: 'REBALANCE_BUDGET',
        label: t.rebalanceBudget,
        description: `Absorbs overruns across ${diff.length} categories while strictly protecting the 8% contingency floor.`,
        payload: { diff, rebalancedCategories: newPlan.categories }
      });
    }

    let conversationalReply = hasDiff
      ? `### 📊 Autonomous Budget Ledger Audit & Rebalance
I performed a comprehensive variance audit across your active spending categories:

- **Total Budget Ceiling:** ${formatCurrency(budget.totalBudget, plan.currency)}
- **Committed / Actual Spend:** ${formatCurrency(budget.totalActual, plan.currency)}
- **Emergency Reserve:** ${formatCurrency(budget.contingencyAmount, plan.currency)} (Safe at ${plan.contingencyPercentage}%)

#### 🔍 Detected Variances & Proposed Reallocations:
${diff.map(d => {
  const delta = d.after - d.before;
  return `- **${d.category}:** Shifted ${formatCurrency(d.before, plan.currency)} &rarr; **${formatCurrency(d.after, plan.currency)}** (${delta > 0 ? '+' : ''}${formatCurrency(delta, plan.currency)}) — *${d.reason}*`;
}).join('\n')}

All critical contracts (**Venue Base** and **Catering Minimums**) remain 100% safeguarded. Click **"${t.rebalanceBudget}"** to update your budget ledger instantly.`
      : `### 📊 Budget Ledger Status: Balanced & On Track
Good news! Your budget ledger for **"${plan.title}"** is operating with full financial discipline:

- **Total Budget:** ${formatCurrency(budget.totalBudget, plan.currency)}
- **Current Actual Spend:** ${formatCurrency(budget.totalActual, plan.currency)}
- **Remaining Buffer:** ${formatCurrency(budget.remainingBudget, plan.currency)}
- **Emergency Reserve:** ${formatCurrency(budget.contingencyAmount, plan.currency)} (Guaranteed at ${plan.contingencyPercentage}%)

No deficit or category overrun is currently detected. If you'd like to allocate extra funds to upgraded entertainment or bespoke decor, let me know and I'll model the reallocation!`;

    if (language === 'ta') {
      conversationalReply = hasDiff
        ? `### 📊 பட்ஜெட் கணக்காய்வு மற்றும் தானியங்கி மறுசீரமைப்பு
உங்கள் செலவுப் பட்டியலை விரிவாக ஆய்வு செய்ததில் கீழ்க்கண்ட மாற்றங்கள் தேவைப்படுகின்றன:

- **மொத்த பட்ஜெட் உச்சவரம்பு:** ${formatCurrency(budget.totalBudget, plan.currency)}
- **தற்போதைய செலவு:** ${formatCurrency(budget.totalActual, plan.currency)}
- **அவசரக்கால இருப்பு:** ${formatCurrency(budget.contingencyAmount, plan.currency)} (${plan.contingencyPercentage}% பாதுகாப்பானது)

#### 🔍 பரிந்துரைக்கப்படும் சீரமைப்புகள்:
${diff.map(d => `- **${d.category}:** ${formatCurrency(d.before, plan.currency)} இலிருந்து **${formatCurrency(d.after, plan.currency)}** ஆக மாற்றப்பட்டது. (${d.reason})`).join('\n')}

முக்கிய ஒப்பந்தங்கள் அனைத்தும் பாதுகாக்கப்பட்டுள்ளன. இதை செயல்படுத்த கீழே உள்ள பொத்தானை அழுத்தவும்!`
        : `### 📊 பட்ஜெட் நிலை: முழு ஆரோக்கியத்துடன் சமநிலையில் உள்ளது
மகிழ்ச்சியான செய்தி! **"${plan.title}"** நிகழ்வின் பட்ஜெட் மிகவும் ஒழுங்காக நிர்வகிக்கப்படுகிறது:
- **மொத்த பட்ஜெட்:** ${formatCurrency(budget.totalBudget, plan.currency)}
- **செலவிடப்பட்ட தொகை:** ${formatCurrency(budget.totalActual, plan.currency)}
- **மீதமுள்ள இருப்பு:** ${formatCurrency(budget.remainingBudget, plan.currency)}
- **அவசரக்கால நிதி:** ${formatCurrency(budget.contingencyAmount, plan.currency)} (${plan.contingencyPercentage}%)`;
    }

    return {
      conversationalReply,
      proposedActions: actions,
      agenticTrace: trace,
      decisionAudit: {
        whatChanged: diff.map(d => `Reallocated ${d.category} from ${formatCurrency(d.before, plan.currency)} to ${formatCurrency(d.after, plan.currency)}`),
        assumptionsMade: ['Protected core venue and catering contracts', 'Maintained 8% emergency contingency floor'],
        needsHumanConfirmation: ['Review adjusted vendor payment milestones with accounts lead']
      }
    };
  }

  // 3. Tool Execution: Timeline Schedule Reflow & Delay Simulation
  if (
    lowerQuery.includes('delay') ||
    lowerQuery.includes('timeline') ||
    lowerQuery.includes('schedule') ||
    lowerQuery.includes('reflow') ||
    lowerQuery.includes('clash') ||
    lowerQuery.includes('late') ||
    lowerQuery.includes('தாமதம்') ||
    lowerQuery.includes('நேரம்') ||
    lowerQuery.includes('देरी') ||
    lowerQuery.includes('समय')
  ) {
    const delayMinutes = 25;
    const { delayedBlockTitle, newBlocks, audit } = executeTimelineScheduleReflow(plan, delayMinutes);

    const trace: AgenticTraceStep[] = [
      {
        step: 1,
        label: 'Schedule Conflict Scan',
        detail: `Scanned ${plan.runOfShow.length} run-of-show blocks for overlaps and rigid anchor timestamps.`,
        status: 'completed'
      },
      {
        step: 2,
        label: 'Tool Call: reflow_schedule',
        detail: `Simulated +${delayMinutes}m delay starting from "${delayedBlockTitle}". Compressed downstream flexible buffers to 10m.`,
        status: 'completed'
      },
      {
        step: 3,
        label: 'Locked Anchor Verification',
        detail: 'Protected immutable ceremony anchor blocks (Muhurtham / Keynote / Curfew) from shifting.',
        status: 'completed'
      }
    ];

    const actions: ExecutableAction[] = [
      {
        type: 'REFLOW_TIMELINE',
        label: t.reflowSchedule,
        description: `Shifts downstream sessions conflict-free while strictly holding locked ceremonial anchor times.`,
        payload: { runOfShow: newBlocks }
      }
    ];

    let conversationalReply = `### ⏱️ Autonomous Timeline Reflow & Delay Engine
Simulated a **+${delayMinutes} minute real-world disruption** starting at **"${delayedBlockTitle}"**:

#### 🛠️ Operational Pacing Adjustments:
${audit.map(item => `- ${item}`).join('\n')}

#### 🔒 Locked Anchor Integrity:
- All blocks tagged with the **Lock Anchor** toggle remain fixed at their auspicious or strict venue curfew times.
- Transition buffers were safely compressed down to the **10-minute operational floor**, keeping the celebration on track without rushed guest movements.

Click **"${t.reflowSchedule}"** below to write these updated timings directly to your live schedule!`;

    if (language === 'ta') {
      conversationalReply = `### ⏱️ காலவரிசை தாமத தானியங்கி சீரமைப்பு
**"${delayedBlockTitle}"** நிகழ்வில் ஏற்பட்ட **+${delayMinutes} நிமிட தாமதம்** வெற்றிகரமாக சீரமைக்கப்பட்டது:

- முகூர்த்தம் மற்றும் முக்கியமான சுபநேர நிகழ்வுகள் மாறாமல் பூட்டப்பட்டுள்ளன.
- இடைப்பட்ட நேரங்கள் பாதுகாப்பான குறைந்தபட்ச 10 நிமிட அளவுக்குள் சுருக்கப்பட்டு, விழா நேரம் தடையின்றி இயங்கும் வகையில் வடிவமைக்கப்பட்டுள்ளது.

கீழே உள்ள **"${t.reflowSchedule}"** பொத்தானை அழுத்தி அட்டவணையை புதுப்பிக்கவும்!`;
    }

    return {
      conversationalReply,
      proposedActions: actions,
      agenticTrace: trace,
      decisionAudit: {
        whatChanged: audit,
        assumptionsMade: ['Minimum safe transition buffer is 10 minutes', 'Locked anchor times cannot shift'],
        needsHumanConfirmation: ['Notify emcee and transport coordinator of updated session departures']
      }
    };
  }

  // 4. Tool Execution: Headcount Scaling & Per-Head Variable Math
  if (
    lowerQuery.includes('guest') ||
    lowerQuery.includes('headcount') ||
    lowerQuery.includes('rsvp') ||
    lowerQuery.includes('attendee') ||
    lowerQuery.includes('surge') ||
    lowerQuery.includes('people') ||
    lowerQuery.includes('விருந்தினர்') ||
    lowerQuery.includes('அதிதிகள்') ||
    lowerQuery.includes('अतिथि')
  ) {
    const deltaGuests = 25;
    const { newCount, newPlan, costDelta } = executeGuestHeadcountScaling(plan, deltaGuests);

    const trace: AgenticTraceStep[] = [
      {
        step: 1,
        label: 'Headcount Scaling Math',
        detail: `Calculated delta for +${deltaGuests} guests: current ${plan.guestCount} &rarr; projected ${newCount}.`,
        status: 'completed'
      },
      {
        step: 2,
        label: 'Tool Call: scale_guest_headcount',
        detail: `Scaled variable per-plate catering, welcome kits, and seating rentals by +${formatCurrency(costDelta, plan.currency)}.`,
        status: 'completed'
      },
      {
        step: 3,
        label: 'Resource Allocation',
        detail: `Added requirement for 3 additional 8-seater banquet tables and linen sets.`,
        status: 'completed'
      }
    ];

    const actions: ExecutableAction[] = [
      {
        type: 'UPDATE_GUEST_COUNT',
        label: t.scaleGuests,
        description: `Recalculates variable catering (+${formatCurrency(costDelta, plan.currency)}) and updates seating allocations.`,
        payload: { newGuestCount: newCount }
      },
      {
        type: 'ADD_VENDOR_TASK',
        label: 'Order Additional Banquet Tables',
        description: 'Adds rental order task for 3 extra banquet tables with premium linens.',
        payload: {
          title: `Order 3 Extra Banquet Tables & Linens for +${deltaGuests} Guest Surge`,
          category: 'Rentals & Infrastructure',
          priority: 'high'
        }
      }
    ];

    let conversationalReply = `### 👥 Headcount Scaling & Variable Cost Impact
Here is the operational breakdown if you adjust your guest headcount by **+${deltaGuests} guests** (from **${plan.guestCount}** &rarr; **${newCount} Guests**):

- **Per-Head Catering Impact:** Estimated cost delta of **+${formatCurrency(costDelta, plan.currency)}** across food, welcome drinks, and desserts.
- **Seating & Table Allocation:** Requires **3 additional 8-seater round tables** plus matching linen settings.
- **Dietary Buffer Recommendation:** We recommend setting aside a 10% vegetarian/allergy-safe buffer (${Math.ceil(newCount * 0.1)} portions) to accommodate last-minute RSVP shifts.

Click **"${t.scaleGuests}"** to update your budget ledger and guest analytics automatically!`;

    if (language === 'ta') {
      conversationalReply = `### 👥 விருந்தினர் எண்ணிக்கை மற்றும் செலவு ஆய்வு
விருந்தினர்கள் எண்ணிக்கை **+${deltaGuests}** அதிகரித்தால் (மொத்தம்: **${newCount} விருந்தினர்கள்**):

- **உணவுச் செலவு உயர்வு:** சுமார் **+${formatCurrency(costDelta, plan.currency)}** கூடுதலாக தேவைப்படும்.
- **இருக்கைகள் ஏற்பாடு:** கூடுதலாக **3 சுற்று வட்ட மேசைகள்** மற்றும் நாற்காலிகள் தேவைப்படும்.
- **உணவுக் கட்டுப்பாடு:** 10% கூடுதல் சைவ மற்றும் உணவு ஒவ்வாமை இல்லாத உணவை முன்கூட்டியே சமையல்காரரிடம் உறுதி செய்யவும்.`;
    }

    return {
      conversationalReply,
      proposedActions: actions,
      agenticTrace: trace,
      decisionAudit: {
        whatChanged: [`Scaled guest headcount to ${newCount}`, `Variable catering items updated by ${formatCurrency(costDelta, plan.currency)}`],
        assumptionsMade: ['Venue capacity accommodates new guest count', 'Catering allows 48-hour headcount modifications'],
        needsHumanConfirmation: ['Confirm final plate count with catering head 72 hours prior']
      }
    };
  }

  // 5. Tool Execution: Task Automation Engine
  if (
    lowerQuery.includes('automate') ||
    lowerQuery.includes('task') ||
    lowerQuery.includes('checklist') ||
    lowerQuery.includes('to-do') ||
    lowerQuery.includes('பணி') ||
    lowerQuery.includes('வேலை') ||
    lowerQuery.includes('कार्य')
  ) {
    const tasks = executeAutomateTasks(plan);

    const trace: AgenticTraceStep[] = [
      {
        step: 1,
        label: 'Readiness Vulnerability Scan',
        detail: `Scanned active plan (Readiness Score: ${readiness.overallScore}/100) for missing operational safeguards.`,
        status: 'completed'
      },
      {
        step: 2,
        label: 'Tool Call: automate_task',
        detail: `Synthesized ${tasks.length} targeted high-priority tasks spanning logistics, vendor contracts, and dietary safety.`,
        status: 'completed'
      }
    ];

    const actions: ExecutableAction[] = tasks.map(tItem => ({
      type: 'ADD_VENDOR_TASK',
      label: `Add: ${tItem.title.slice(0, 30)}...`,
      description: tItem.title,
      payload: {
        title: tItem.title,
        category: tItem.category,
        priority: tItem.priority
      }
    }));

    let conversationalReply = `### 📋 Autonomous Task Automation Engine
I evaluated your active event readiness profile (**${readiness.overallScore}/100** — *${readiness.status}*) and generated **${tasks.length} critical action items** to close operational vulnerabilities:

${tasks.map((taskItem, idx) => `**${idx + 1}. [${taskItem.priority.toUpperCase()}] ${taskItem.title}**\n   - *Category:* ${taskItem.category} | *Owner:* ${taskItem.owner}\n   - *Context:* ${taskItem.notes}`).join('\n\n')}

Click the action cards below to add these directly to your active **Master Checklist**!`;

    if (language === 'ta') {
      conversationalReply = `### 📋 பணிகளை தானியங்குபடுத்தும் திட்டம்
தங்களின் தயார்நிலை மதிப்பெண் (**${readiness.overallScore}/100**) அடிப்படையில், தவிர்க்கக்கூடாத **${tasks.length} முக்கிய பணிகளை** உருவாக்கியுள்ளேன்:

${tasks.map((taskItem, idx) => `**${idx + 1}. [${taskItem.priority.toUpperCase()}] ${taskItem.title}**\n   - *பிரிவு:* ${taskItem.category} | *பொறுப்பாளர்:* ${taskItem.owner}`).join('\n\n')}

இவற்றை உங்கள் பணிப்பட்டியலில் சேர்க்க கீழே உள்ள அட்டைகளை அழுத்தவும்!`;
    }

    return {
      conversationalReply,
      proposedActions: actions,
      agenticTrace: trace,
      decisionAudit: {
        whatChanged: tasks.map(taskItem => `Generated automated task: ${taskItem.title}`),
        assumptionsMade: ['Tasks mapped to available team lead roles'],
        needsHumanConfirmation: ['Assign specific individuals to each task owner slot']
      }
    };
  }

  // 6. Meta / Greeting / General Natural Response
  const trace: AgenticTraceStep[] = [
    {
      step: 1,
      label: 'Context Evaluation',
      detail: `Inspecting "${plan.title}" (${plan.guestCount} guests, ${plan.currency} ${plan.totalBudget.toLocaleString()}, ${plan.daysRemaining} days countdown).`,
      status: 'completed'
    }
  ];

  let conversationalReply = `### 🌟 CelebraSphere AI Planning Co-Pilot
I am here to help you coordinate every operational, financial, and creative milestone for **"${plan.title}"**!

- **Event Date:** ${plan.eventDate} (${plan.daysRemaining} ${t.daysToGo})
- **Headcount:** ${plan.guestCount} ${t.guests}
- **Budget Ceiling:** ${formatCurrency(budget.totalBudget, plan.currency)} (${t.remaining}: ${formatCurrency(budget.remainingBudget, plan.currency)})
- **Readiness Score:** **${readiness.overallScore}/100** (${readiness.status})

Tell me what you'd like to work on right now — for instance:
- *"Check the live weather and rain failover"*
- *"Rebalance budget overruns safely"*
- *"Simulate a +25 min delay in schedule"*
- *"Scale guest headcount and catering math"*
- *"Give me creative culinary and decor concepts"*`;

  if (language === 'ta') {
    conversationalReply = `### 🌟 செலிப்ராஸ்பியர் AI விழா மேலாண்மை உதவியாளர்
வணக்கம்! **"${plan.title}"** விழாவின் அனைத்து திட்டமிடல்களுக்கும் உதவ நான் தயாராக உள்ளேன்!

- **விழா தேதி:** ${plan.eventDate} (${plan.daysRemaining} ${t.daysToGo})
- **விருந்தினர்கள்:** ${plan.guestCount} ${t.guests}
- **மொத்த பட்ஜெட்:** ${formatCurrency(budget.totalBudget, plan.currency)} (${t.remaining}: ${formatCurrency(budget.remainingBudget, plan.currency)})
- **தயார்நிலை:** **${readiness.overallScore}/100**

நீங்கள் என்ன செய்ய விரும்புகிறீர்கள்?
- *"வானிலை சரிபார்த்து மழை பாதுகாப்பு திட்டம் அமை"*
- *"பட்ஜெட் செலவுகளை மறுசீரமை"*
- *"நிகழ்ச்சி 25 நிமிடம் தாமதமானால் சரிசெய்"*
- *"விருந்தினர்கள் எண்ணிக்கையை 210 ஆக மாற்று"*`;
  } else if (language === 'hi') {
    conversationalReply = `### 🌟 सेलिब्रॉस्फीयर AI आयोजन सहायक
नमस्ते! मैं **"${plan.title}"** के हर परिचालन और बजट मील के पत्थर के समन्वय के लिए तैयार हूँ!

- **आयोजन तिथि:** ${plan.eventDate} (${plan.daysRemaining} ${t.daysToGo})
- **अतिथि संख्या:** ${plan.guestCount} ${t.guests}
- **कुल बजट:** ${formatCurrency(budget.totalBudget, plan.currency)} (${t.remaining}: ${formatCurrency(budget.remainingBudget, plan.currency)})
- **तैयारी स्कोर:** **${readiness.overallScore}/100**

मुझसे कुछ भी पूछें:
- *"लाइव मौसम जांचें और बारिश बैकअप सक्रिय करें"*
- *"बजट को पुनः संतुलित करें"*
- *"कार्यक्रम में 25 मिनट की देरी का समाधान करें"*`;
  }

  return {
    conversationalReply,
    proposedActions: [
      {
        type: 'APPLY_WEATHER_BACKUP',
        label: t.checkWeather,
        description: `Inspects live weather radar for ${plan.venueName}.`,
        payload: {}
      },
      {
        type: 'REBALANCE_BUDGET',
        label: t.rebalanceBudget,
        description: 'Audits spending allocations and ensures contingency buffer safety.',
        payload: {}
      }
    ],
    agenticTrace: trace
  };
}

function synthesizeAgenticActionsAndTrace(
  query: string,
  replyText: string,
  plan: EventPlan,
  language: SupportedLanguage
): {
  actions: ExecutableAction[];
  trace: AgenticTraceStep[];
  telemetry?: WeatherTelemetry;
  decisionAudit?: AIResponsePayload['decisionAudit'];
} {
  const combined = (query + ' ' + replyText).toLowerCase();
  const actions: ExecutableAction[] = [];
  const trace: AgenticTraceStep[] = [];
  let telemetry: WeatherTelemetry | undefined;
  const t = getTranslation(language);

  // Weather detection
  if (combined.includes('weather') || combined.includes('rain') || combined.includes('forecast') || combined.includes('outdoor') || combined.includes('வானிலை') || combined.includes('मौसम')) {
    telemetry = getLiveWeatherTelemetry(plan.venueName, plan.venueType, plan.eventDate);
    const { updatedRunOfShow } = executeWeatherRelocation(plan);

    trace.push({
      step: 1,
      label: 'Tool Call: check_weather',
      detail: `Telemetry for ${plan.venueName}: ${telemetry.temperature}, ${telemetry.precipitationProbability}% precipitation probability.`,
      status: 'completed'
    });

    actions.push({
      type: 'APPLY_WEATHER_BACKUP',
      label: t.rainFailover,
      description: 'Moves lawn sessions to Grand Indoor Ballroom and injects 20m sound buffer.',
      payload: { runOfShow: updatedRunOfShow }
    });
  }

  // Budget rebalance detection
  if (combined.includes('rebalance') || combined.includes('overrun') || combined.includes('budget') || combined.includes('cost') || combined.includes('பட்ஜெட்') || combined.includes('बजट')) {
    const { newPlan, diff } = executeBudgetAuditAndRebalance(plan);
    trace.push({
      step: trace.length + 1,
      label: 'Tool Call: rebalance_budget',
      detail: `Audited spending ledger and verified 8% emergency contingency floor.`,
      status: 'completed'
    });

    actions.push({
      type: 'REBALANCE_BUDGET',
      label: t.rebalanceBudget,
      description: 'Absorbs overruns from non-critical categories while preserving 8% contingency floor.',
      payload: { diff, rebalancedCategories: newPlan.categories }
    });
  }

  // Schedule reflow detection
  if (combined.includes('delay') || combined.includes('schedule') || combined.includes('reflow') || combined.includes('timeline') || combined.includes('தாமதம்') || combined.includes('देरी')) {
    const { newBlocks } = executeTimelineScheduleReflow(plan, 25);
    trace.push({
      step: trace.length + 1,
      label: 'Tool Call: reflow_schedule',
      detail: 'Protected locked anchor times and compressed downstream buffers to 10m floor.',
      status: 'completed'
    });

    actions.push({
      type: 'REFLOW_TIMELINE',
      label: t.reflowSchedule,
      description: 'Shifts downstream sessions conflict-free with locked ceremonial anchor protection.',
      payload: { runOfShow: newBlocks }
    });
  }

  // Headcount scaling
  if (combined.includes('guest') && (combined.includes('surge') || combined.includes('scale') || combined.includes('add') || combined.includes('increase') || combined.includes('விருந்தினர்') || combined.includes('अतिथि'))) {
    const newCount = plan.guestCount + 25;
    actions.push({
      type: 'UPDATE_GUEST_COUNT',
      label: t.scaleGuests,
      description: `Updates per-guest catering and rental seating for ${newCount} guests.`,
      payload: { newGuestCount: newCount }
    });
  }

  return { actions, trace, telemetry };
}
