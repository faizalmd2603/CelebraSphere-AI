export type VerticalPersona = 'wedding' | 'birthday' | 'community';

export type Currency = 'INR' | 'USD';

export type BudgetPriorityMode = 'balanced' | 'culinary-first' | 'decor-vibe' | 'eco-minimalist';

export type CostType = 'fixed' | 'variable';

export interface BudgetItem {
  id: string;
  name: string;
  category: string;
  costType: CostType;
  unitCost: number; // For variable items, per guest. For fixed, total unit cost.
  quantity: number; // For variable, matches guest count or custom multiplier.
  estimatedAmount: number;
  actualAmount: number;
  paidAmount: number;
  notes?: string;
  isAiSuggested?: boolean;
}

export interface BudgetCategory {
  id: string;
  name: string;
  allocatedPercentage: number;
  allocatedAmount: number;
  spentAmount: number;
  color: string;
}

export type TimelinePriority = 'critical' | 'high' | 'medium' | 'low';
export type PlanningWindow = '6m_out' | '3m_out' | '1m_out' | '1w_out' | 'event_day' | 'post_event';

export interface TimelineTask {
  id: string;
  title: string;
  category: string;
  planningWindow: PlanningWindow;
  priority: TimelinePriority;
  dueDate: string;
  completed: boolean;
  owner: string;
  isAiSuggested?: boolean;
  notes?: string;
}

export interface RunOfShowBlock {
  id: string;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "10:30"
  durationMinutes: number;
  title: string;
  description: string;
  zone: string; // e.g. "Beach Lawn", "Grand Ballroom", "Auditorium"
  isOutdoor: boolean;
  owner: string;
  bufferMinutes: number;
  isLockedAnchor: boolean; // Locked blocks (Muhurtham, Keynote, Dinner) cannot shift automatically
  dependencies: string[];  // ids of preceding blocks
  isAiSuggested?: boolean;
}

export type VendorStatus = 'researching' | 'quoted' | 'contract_signed' | 'deposit_paid' | 'completed';

export interface VendorCriterion {
  score: number; // 0-100
  notes: string;
}

export interface VendorScoreCriteria {
  budgetAlignment: VendorCriterion;       // 30% weight
  stylePersonaFit: VendorCriterion;       // 25% weight
  reliabilityTrackRecord: VendorCriterion;// 25% weight
  contractFlexibility: VendorCriterion;   // 20% weight
}

export interface Vendor {
  id: string;
  name: string;
  category: string; // Venue, Catering, Decor & Florals, Photography, Entertainment, Logistics
  status: VendorStatus;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  quotedPrice: number;
  depositPaid: number;
  balanceDueDate: string;
  isVerified: boolean; // Verified Record vs AI Suggested - Needs Human Verification
  safetyChecklist: {
    portfolioVerified: boolean;
    writtenQuoteChecked: boolean;
    rainClauseChecked: boolean;
    depositMilestoneLogged: boolean;
  };
  scoring?: VendorScoreCriteria;
  compositeScore?: number;
  notes?: string;
}

export interface Guest {
  id: string;
  name: string;
  group: 'VIP' | 'Family' | 'Friend' | 'Staff' | 'Attendee';
  rsvpStatus: 'confirmed' | 'pending' | 'declined';
  email: string;
  phone: string;
  dietaryPreference: 'regular' | 'vegetarian' | 'vegan' | 'jain_halal' | 'gluten_free';
  allergies: string[];
  accessibilityNeeds: string[]; // wheelchair, ramp, quiet_space, sign_language, elderly_front_row
  tableNumber?: number;
  notes?: string;
}

export interface CreativeIdea {
  id: string;
  category: 'palette' | 'culinary' | 'rituals' | 'eco_cost_saving';
  title: string;
  description: string;
  tags: string[];
  estimatedCostImpact: number;
  swatches?: string[]; // hex colors for theme palettes
  isAddedToPlan?: boolean;
}

export interface DecisionAudit {
  id: string;
  timestamp: string;
  scenarioName: string;
  whatChanged: string[];
  assumptionsMade: string[];
  needsHumanConfirmation: string[];
}

export interface ProactiveAlert {
  id: string;
  type: 'weather' | 'guest_surge' | 'vendor_delay' | 'budget_overrun';
  severity: 'high' | 'medium' | 'info';
  title: string;
  message: string;
  actionLabel: string;
  actionPayload: Record<string, unknown>;
}

export interface EventPlan {
  id: string;
  title: string;
  vertical: VerticalPersona;
  eventDate: string;
  daysRemaining: number;
  venueName: string;
  venueType: 'indoor' | 'outdoor' | 'hybrid';
  guestCount: number;
  currency: Currency;
  totalBudget: number;
  contingencyPercentage: number; // e.g. 10%
  priorityPillars: [string, string];
  budgetPriorityMode: BudgetPriorityMode;
  
  // Modules data
  categories: BudgetCategory[];
  budgetItems: BudgetItem[];
  checklistTasks: TimelineTask[];
  runOfShow: RunOfShowBlock[];
  vendors: Vendor[];
  guests: Guest[];
  creativeIdeas: CreativeIdea[];
  recentAudits: DecisionAudit[];
}

export interface ReadinessScoreBreakdown {
  overallScore: number; // 0-100
  budgetHealthScore: number;     // 25%
  vendorConfirmationScore: number; // 25%
  scheduleConflictScore: number; // 25%
  checklistVelocityScore: number; // 25%
  status: 'Ready' | 'On Track' | 'Attention Needed' | 'Critical Risk';
  flags: string[];
}

export interface ExecutableAction {
  type: 'ADD_BUDGET_ITEM' | 'REBALANCE_BUDGET' | 'REFLOW_TIMELINE' | 'ADD_VENDOR_TASK' | 'SAVE_THEME_IDEA' | 'UPDATE_GUEST_COUNT';
  label: string;
  description: string;
  payload: Record<string, unknown>;
}

export interface AIResponsePayload {
  thoughtProcess?: string;
  conversationalReply: string;
  proposedActions: ExecutableAction[];
  decisionAudit?: {
    whatChanged: string[];
    assumptionsMade: string[];
    needsHumanConfirmation: string[];
  };
}
