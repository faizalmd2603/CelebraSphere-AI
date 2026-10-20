# CelebraSphere AI — Celebration & Event Operations Platform

> **Author:** Mohammed Faizal M (`faizalmd2006`)  
> **Production Live URL:** [https://celebrasphere-ai.vercel.app](https://celebrasphere-ai.vercel.app)  
> **Primary Vertical:** Wedding & Multi-Ceremony Celebration (with instant 1-click persona switching to Milestone Birthday & Community Fest)  
> **AI Architecture:** Multi-Cloud Agentic AI Mesh (Google Gemini `gemini-2.5-flash-lite`, Groq Cloud `qwen/qwen3.8-27b`, OpenRouter `nemotron-3.5`) + Autonomous Deterministic Agentic Fallback Engine  
> **Languages Supported:** Multilingual in 9 Indian Languages (English, தமிழ், हिन्दी, മലയാളം, ಕನ್ನಡ, తెలుగు, বাংলা, मराठी, ગુજરાતી)

---

## 🌟 Executive Summary & Grounded Agentic AI Architecture

Generic AI chatbots fail at celebration planning because their suggestions remain trapped in ephemeral chat windows, hallucinate vendor prices, and forget previous event constraints. 

**CelebraSphere AI** transforms event management by embedding an **Autonomous Grounded Operations Agent directly inside a stateful planning workspace**:
- **Live Grounded Snapshot:** Before formulating any guidance, the AI inspects the live event state (vertical persona, headcount, venue indoor/outdoor context, actual spend vs. budget ceiling, vendor confirmations, locked anchor times, and dietary/allergy matrices).
- **Within-App Tool Integrations:** The agent has direct stateful tool integrations that can query live atmospheric radar (`check_weather`), execute indoor failover relocation (`relocate_weather_backup`), rebalance budget overruns (`rebalance_budget`), reflow schedule delays with anchor protections (`reflow_schedule`), scale guest catering math (`scale_guest_headcount`), and automate prioritized checklist items (`automate_task`).
- **Human-in-the-Loop & Autonomous Modes:** Organizers can toggle **Autonomous Mode** (AI executes tools directly on the workspace with 1-click undo) or **Review Mode** (Human-in-the-Loop approval cards).
- **Multi-Cloud High-Speed Resilience:** Multi-tiered provider architecture combining Google Gemini 2.5 Flash (~1.8s), Groq Qwen 3.8 / GPT-OSS (<500ms), OpenRouter, and a deterministic local agentic engine to guarantee **zero freezing and zero latency interruptions**.

---

## 🌍 Multilingual Indian Language Support (9 Languages)

CelebraSphere AI features a native multilingual engine with synchronized dual-toggles in both the **Main Application Header** and inside the **AI Operations Drawer**:

1. **English** (`en`)
2. **Tamil — தமிழ்** (`ta`)
3. **Hindi — हिन्दी** (`hi`)
4. **Malayalam — മലയാളം** (`ml`)
5. **Kannada — ಕನ್ನಡ** (`kn`)
6. **Telugu — తెలుగు** (`te`)
7. **Bengali — বাংলা** (`bn`)
8. **Marathi — मराठी** (`mr`)
9. **Gujarati — ગુજરાતી** (`gu`)

Selecting any language translates navigation tabs, metric pills, action cards, and automatically instructs the AI models to converse fluently in native vocabulary (e.g. *Muhurtham*, *Mandap*, *Sangeet*, *Mehendi*, *Auspicious Timing*, *Allergy Plating*).

---

## 📱 Cross-Platform Responsive Real App UX

CelebraSphere AI is engineered as a responsive web application designed for seamless performance across all screen sizes and operating systems:

- **Mobile (iOS Safari, Android Chrome):**
  - Full touch-friendly viewport with `100dvh` dynamic height and `pb-safe` notch insets.
  - Full-width slide-out drawer on mobile screens with blurred backdrop dismiss.
  - Touch-momentum scrolling (`-webkit-overflow-scrolling: touch`) and zero horizontal scroll leaks (`no-scrollbar`).
  - Minimum 44x44px accessible touch targets compliant with WCAG 2.2 AA.
- **Desktop & Laptop (macOS, Windows, Linux, Chrome, Firefox, Safari, Edge):**
  - Multi-column dashboards, SVG data visualizations, keyboard navigable tables, and keyboard shortcuts (`Ctrl+Z` undo, `Ctrl+Y` redo).
  - Client-ready printing stylesheet (`window.print()`) that formats clean executive reports on white backgrounds without UI controls.

---

## 🏛️ Persona Architecture & Multi-Vertical Switcher

CelebraSphere AI supports three pre-loaded event personas switchable with one click in the header:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   1-CLICK MULTI-VERTICAL PERSONAS                      │
├──────────────────────────┬─────────────────────────┬───────────────────┤
│ 1. Royal Coastal Wedding │ 2. Milestone Birthday   │ 3. Community Fest │
│ (Primary Hero Vertical)  │ (Private Gala Soirée)   │ (Civic Festival)  │
├──────────────────────────┼─────────────────────────┼───────────────────┤
│ • 180 Guests             │ • 65 Guests             │ • 350 Attendees   │
│ • ₹18,00,000 (~$22k USD) │ • ₹1,50,000 (~$2.5k USD)│ • ₹4,50,000 ($5.5k│
│ • Beach Resort + Lawn    │ • SkyDeck Rooftop       │ • Main Auditorium │
│ • 45 Days Countdown      │ • 18 Days Countdown     │ • 30 Days Count   │
│ • Multi-ceremony run-of- │ • Custom cake lead-time │ • Volunteer shifts│
│   show with Muhurtham    │   alerts, DJ licensing, │   AV permits, zero│
│   locked anchor time     │   mocktail curation     │   waste seed bags │
└──────────────────────────┴─────────────────────────┴───────────────────┘
```

### "+ Create Custom Celebration Wizard"
A 4-step interactive modal allows organizers to launch a custom celebration:
1. **Basics:** Vertical, Title, Event Date, Indoor/Outdoor Setting.
2. **Headcount & Inclusivity:** Guest count, wheelchair accessibility, quiet sensory/lactation rooms.
3. **Financial Architecture:** Total budget ceiling, currency (`₹ INR` / `$ USD`), contingency reserve buffer (8%–15%).
4. **Priority Pillars:** Top 2 pillars (e.g., Culinary Excellence, Immersive Decor, Strict Cost Control). Submitting dynamically generates a tailored budget split, run-of-show schedule, and vendor matrix.

---

## 🧠 Decision Engine & Mathematical Formulas

All operations logic is 100% decoupled from React UI components and housed in pure, unit-tested functions in [`src/utils/calculations.ts`](file:///Users/apple/Desktop/CelebraSphere%20AI/src/utils/calculations.ts) and [`src/services/agentTools.ts`](file:///Users/apple/Desktop/CelebraSphere%20AI/src/services/agentTools.ts).

### 1. Event-Day Readiness Gauge (0–100)
Calculated via a deterministic formula across 4 weighted operational pillars:

$$\text{Readiness Score} = 0.25 \times B + 0.25 \times V + 0.25 \times S + 0.25 \times C$$

Where:
- **$B$ (Budget Health, 25%):** Penalizes category overruns or contingency reserve dropping below 8%.
- **$V$ (Vendor Confirmation Rate, 25%):** Ratio of critical vendors in `contract_signed` or `deposit_paid`.
- **$S$ (Schedule Conflict-Free, 25%):** 100% if zero time overlaps and all transition buffers $\ge 10\text{ min}$.
- **$C$ (Checklist Velocity, 25%):** Percentage of high-priority milestones completed relative to countdown velocity.

### 2. Variable Cost Scaling Math
$$\text{Item Cost} = \begin{cases} \text{unitCost} \times \text{quantity} & \text{if Fixed Cost} \\ \text{unitCost} \times \text{guestCount} & \text{if Variable Cost} \end{cases}$$

### 3. AI Budget Auto-Rebalancing Algorithm
1. Detects all categories where $\text{Actual Spend} > \text{Allocated Cap}$.
2. Gathers surplus funds from non-critical categories (`Decor`, `Entertainment`, `Favors`).
3. Reallocates surplus to absorb overruns before touching the contingency fund.
4. Strictly enforces an **8% Emergency Contingency Reserve floor**.

### 4. Locked-Anchor Run-of-Show Reflow Engine
- When delays occur (e.g., +25m ceremony delay), the engine shifts downstream unlocked sessions.
- Compresses flexible transition buffers down to a safe **10-minute floor**.
- Immutably locks sacred ritual anchor blocks (e.g., 10:30 AM Muhurtham or 8:00 PM Cake Cutting) at their exact original clock times.

### 5. Multi-Criteria Vendor Decision Matrix (30/25/25/20)
$$\text{Vendor Score} = 0.30 \times \text{Budget} + 0.25 \times \text{Style} + 0.25 \times \text{Reliability} + 0.20 \times \text{Flexibility}$$

---

## 🛡️ Security, Privacy Shield & Responsible AI

CelebraSphere AI implements bank-grade security and responsible AI practices:
- **Zero API Keys in Git:** Environment secrets are strictly git-ignored.
- **Privacy Shield PII Masking:** Anonymizes phone numbers, emails, and payment IDs (`[REDACTED_PHONE]`, `[REDACTED_EMAIL]`, `[REDACTED_PAYMENT_ID]`) before transmitting payloads to external LLMs.
- **Context Payload Inspector:** Evaluators can inspect the exact outbound sanitized JSON payload in real time.
- **Input Sanitization:** Strips XSS script tags, `<iframe>`, and malicious `javascript:` URI handlers via strict sanitization rules.
- **Runtime Schema Validation:** All inbound and outbound payloads are validated using Zod schemas (`AIResponsePayloadSchema`, `BudgetItemInputSchema`).

---

## 🧪 Testing & Verification Suite (21 Tests)

CelebraSphere AI includes both Vitest CLI automated unit tests and an **interactive in-app live browser test suite**:

```bash
# Run CLI Vitest automated unit tests (21/21 passing in ~450ms)
npm test
```

### In-App Verification Suite:
Click the **"Verify Tests (21/21)"** button in the top navigation bar to execute all 21 assertions directly inside the browser:
- **Calculations Suite (Tests 1–6):** Readiness score bounds (0-100), overrun penalties, variable headcount scaling, fixed cost package immutability, surplus reallocation, 8% contingency floor guarantee.
- **Timeline Suite (Tests 7–11):** Direct time overlap detection, +25m delay reflow, locked anchor immutability, 10m buffer floor, weather failover relocation.
- **Calculations & Scoring (Test 12):** 30/25/25/20 weighted vendor scoring algorithm.
- **Security Suite (Tests 13–15):** XSS script injection sanitization, Privacy Shield PII masking, runtime Zod schema rejection.
- **Agentic & Multilingual Suite (Tests 16–21):** Multilingual dictionary integrity across 9 Indian languages, live weather telemetry tool, weather failover buffer tool, autonomous budget rebalance tool, headcount scaler tool, readiness vulnerability task automation tool.

---

## 🚀 Running the Project Locally

```bash
# Clone the repository
git clone https://github.com/faizalmd2603/CelebraSphere-AI.git
cd CelebraSphere-AI

# Install dependencies
npm install

# Configure environment variables (copy template)
cp .env.example .env

# Run development server
npm run dev

# Run unit tests
npm test

# Build production bundle
npm run build
```
