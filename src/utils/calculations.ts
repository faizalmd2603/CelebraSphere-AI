import {
  EventPlan,
  ReadinessScoreBreakdown,
  RunOfShowBlock,
  Vendor,
  VendorScoreCriteria,
  Currency,
  BudgetItem,
  BudgetCategory
} from '../types/event';

/**
 * Currency conversion rate approximation (1 USD = 83 INR)
 */
export const INR_PER_USD = 83;

export function formatCurrency(amount: number, currency: Currency): string {
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Converts amounts cleanly between INR and USD
 */
export function convertCurrency(amount: number, from: Currency, to: Currency): number {
  if (from === to) return amount;
  if (from === 'USD' && to === 'INR') return Math.round(amount * INR_PER_USD);
  return Math.round(amount / INR_PER_USD);
}

/**
 * Pure Deterministic Event-Day Readiness Gauge (0-100)
 * Weighted 4 Pillars:
 * 1. Budget Health (25%)
 * 2. Vendor Confirmation Rate (25%)
 * 3. Schedule Conflict-Free Status (25%)
 * 4. Checklist Velocity (25%)
 */
export function calculateReadinessScore(plan: EventPlan): ReadinessScoreBreakdown {
  const flags: string[] = [];

  // Pillar 1: Budget Health (25%)
  let budgetScore = 100;
  const totalActual = plan.budgetItems.reduce((acc, item) => acc + item.actualAmount, 0);
  const totalAllocated = plan.totalBudget;
  const contingencyBuffer = totalAllocated * (plan.contingencyPercentage / 100);

  // Check category overruns
  const overrunItems = plan.budgetItems.filter(item => item.actualAmount > item.estimatedAmount);
  if (overrunItems.length > 0) {
    const overrunCountPenalty = Math.min(30, overrunItems.length * 10);
    budgetScore -= overrunCountPenalty;
    flags.push(`${overrunItems.length} budget line items are currently over estimated spend.`);
  }

  // Check if actual spend is exceeding total budget minus minimum contingency buffer
  if (totalActual > totalAllocated - (contingencyBuffer * 0.8)) {
    budgetScore -= 30;
    flags.push('Contingency reserve has dropped below the safe 8% threshold.');
  }
  budgetScore = Math.max(0, Math.min(100, budgetScore));

  // Pillar 2: Vendor Confirmation Rate (25%)
  let vendorScore = 100;
  if (plan.vendors.length === 0) {
    vendorScore = 50;
  } else {
    const confirmedCount = plan.vendors.filter(
      v => v.status === 'contract_signed' || v.status === 'deposit_paid' || v.status === 'completed'
    ).length;
    const confirmationRatio = confirmedCount / plan.vendors.length;
    vendorScore = Math.round(confirmationRatio * 100);

    // Urgent check: if < 30 days and key vendors still researching
    if (plan.daysRemaining <= 30) {
      const criticalUnconfirmed = plan.vendors.filter(
        v => ['Venue', 'Catering', 'Photography'].includes(v.category) &&
             (v.status === 'researching' || v.status === 'quoted')
      );
      if (criticalUnconfirmed.length > 0) {
        vendorScore = Math.max(20, vendorScore - 25);
        flags.push(`Critical vendors (${criticalUnconfirmed.map(v => v.name).join(', ')}) still unconfirmed with <= 30 days left.`);
      }
    }
  }

  // Pillar 3: Schedule Conflict-Free Status (25%)
  const conflicts = detectTimelineConflicts(plan.runOfShow);
  let scheduleScore = 100;
  if (conflicts.length > 0) {
    scheduleScore = Math.max(20, 100 - (conflicts.length * 25));
    flags.push(`${conflicts.length} time conflict(s) or overlapping zone clashes detected in Run-of-Show.`);
  }

  // Pillar 4: Checklist Velocity (25%)
  let checklistScore = 100;
  if (plan.checklistTasks.length === 0) {
    checklistScore = 60;
  } else {
    const highCritTasks = plan.checklistTasks.filter(t => t.priority === 'critical' || t.priority === 'high');
    const completedHighCrit = highCritTasks.filter(t => t.completed).length;
    const ratio = highCritTasks.length > 0 ? (completedHighCrit / highCritTasks.length) : 1;

    // Velocity expectation depends on daysRemaining
    if (plan.daysRemaining <= 14 && ratio < 0.8) {
      checklistScore = Math.round(ratio * 75);
      flags.push('Critical checklist velocity lagging for final 2-week window.');
    } else if (plan.daysRemaining <= 30 && ratio < 0.5) {
      checklistScore = Math.round(ratio * 85);
      flags.push('Mid-range milestone tasks require immediate completion.');
    } else {
      checklistScore = Math.round(ratio * 100);
    }
  }
  checklistScore = Math.max(0, Math.min(100, checklistScore));

  const overallScore = Math.round(
    (budgetScore * 0.25) +
    (vendorScore * 0.25) +
    (scheduleScore * 0.25) +
    (checklistScore * 0.25)
  );

  let status: ReadinessScoreBreakdown['status'] = 'Ready';
  if (overallScore < 50) status = 'Critical Risk';
  else if (overallScore < 70) status = 'Attention Needed';
  else if (overallScore < 88) status = 'On Track';

  return {
    overallScore,
    budgetHealthScore: budgetScore,
    vendorConfirmationScore: vendorScore,
    scheduleConflictScore: scheduleScore,
    checklistVelocityScore: checklistScore,
    status,
    flags
  };
}

/**
 * Computes high-level budget metrics
 */
export function calculateBudgetSummary(plan: EventPlan) {
  const totalEstimated = plan.budgetItems.reduce((acc, item) => acc + item.estimatedAmount, 0);
  const totalActual = plan.budgetItems.reduce((acc, item) => acc + item.actualAmount, 0);
  const totalPaid = plan.budgetItems.reduce((acc, item) => acc + item.paidAmount, 0);
  const contingencyAmount = Math.round(plan.totalBudget * (plan.contingencyPercentage / 100));
  
  const fixedItems = plan.budgetItems.filter(item => item.costType === 'fixed');
  const variableItems = plan.budgetItems.filter(item => item.costType === 'variable');

  const fixedCostTotal = fixedItems.reduce((acc, item) => acc + item.estimatedAmount, 0);
  const variableCostTotal = variableItems.reduce((acc, item) => acc + item.estimatedAmount, 0);

  const remainingBudget = plan.totalBudget - totalActual;
  const isOverrun = totalActual > plan.totalBudget;

  return {
    totalBudget: plan.totalBudget,
    totalEstimated,
    totalActual,
    totalPaid,
    contingencyAmount,
    fixedCostTotal,
    variableCostTotal,
    remainingBudget,
    isOverrun,
    varianceAmount: totalActual - totalEstimated
  };
}

/**
 * Dynamically scales variable cost items based on guest count change
 */
export function scaleGuestCosts(plan: EventPlan, newGuestCount: number): EventPlan {
  const safeCount = Math.max(1, newGuestCount);
  const updatedItems = plan.budgetItems.map(item => {
    if (item.costType === 'variable') {
      const estimatedAmount = Math.round(item.unitCost * safeCount);
      // If actualAmount was tracking estimated, adjust proportionately
      const actualAmount = item.actualAmount > 0 
        ? Math.round((item.actualAmount / Math.max(1, item.quantity)) * safeCount)
        : 0;
      return {
        ...item,
        quantity: safeCount,
        estimatedAmount,
        actualAmount
      };
    }
    return item;
  });

  return {
    ...plan,
    guestCount: safeCount,
    budgetItems: updatedItems
  };
}

/**
 * AI Auto-Rebalance Algorithm
 * Transfers funds from under-spent non-critical categories to cover overruns
 * Preserves the minimum 8% emergency contingency floor
 */
export function rebalanceBudget(plan: EventPlan): {
  newPlan: EventPlan;
  diff: { category: string; before: number; after: number; reason: string }[];
} {
  const diff: { category: string; before: number; after: number; reason: string }[] = [];
  
  // Calculate total overrun amount across items
  let totalOverrun = 0;
  plan.budgetItems.forEach(item => {
    if (item.actualAmount > item.estimatedAmount) {
      totalOverrun += (item.actualAmount - item.estimatedAmount);
    }
  });

  if (totalOverrun <= 0) {
    return { newPlan: plan, diff };
  }

  // Work with categories
  const categoriesCopy: BudgetCategory[] = JSON.parse(JSON.stringify(plan.categories));
  const contingencyBuffer = plan.totalBudget * 0.08; // 8% absolute reserve floor

  // Find non-critical categories with surplus: Decor, Gifts, Secondary Entertainment
  const surplusCategories = categoriesCopy.filter(cat => {
    const isProtected = ['Venue', 'Catering', 'Permits & Logistics'].includes(cat.name);
    return !isProtected && cat.allocatedAmount > cat.spentAmount;
  });

  let remainingOverrunToAbsorb = totalOverrun;

  for (const cat of surplusCategories) {
    if (remainingOverrunToAbsorb <= 0) break;
    const surplus = cat.allocatedAmount - cat.spentAmount;
    if (surplus > 0) {
      const deduction = Math.min(surplus * 0.7, remainingOverrunToAbsorb); // Keep 30% buffer
      const before = cat.allocatedAmount;
      cat.allocatedAmount = Math.round(cat.allocatedAmount - deduction);
      remainingOverrunToAbsorb -= deduction;
      diff.push({
        category: cat.name,
        before,
        after: cat.allocatedAmount,
        reason: `Reallocated surplus buffer to absorb category overruns without breaching contracts.`
      });
    }
  }

  // If still remaining, absorb up to the safe contingency threshold
  if (remainingOverrunToAbsorb > 0) {
    const contingencyCategory = categoriesCopy.find(c => c.name.toLowerCase().includes('contingency'));
    if (contingencyCategory && contingencyCategory.allocatedAmount > contingencyBuffer) {
      const availableContingency = contingencyCategory.allocatedAmount - contingencyBuffer;
      const deduction = Math.min(availableContingency, remainingOverrunToAbsorb);
      const before = contingencyCategory.allocatedAmount;
      contingencyCategory.allocatedAmount = Math.round(contingencyCategory.allocatedAmount - deduction);
      remainingOverrunToAbsorb -= deduction;
      diff.push({
        category: contingencyCategory.name,
        before,
        after: contingencyCategory.allocatedAmount,
        reason: `Drawn from emergency contingency while maintaining safe 8% floor.`
      });
    }
  }

  // Synchronize item estimates so they match actuals for overrun items
  const updatedItems = plan.budgetItems.map(item => {
    if (item.actualAmount > item.estimatedAmount) {
      return {
        ...item,
        estimatedAmount: item.actualAmount,
        notes: (item.notes ? item.notes + ' ' : '') + '[AI Rebalanced to match actual spend]'
      };
    }
    return item;
  });

  return {
    newPlan: {
      ...plan,
      categories: categoriesCopy,
      budgetItems: updatedItems
    },
    diff
  };
}

/**
 * Checks for time overlaps or missing buffers between run-of-show blocks
 */
export function detectTimelineConflicts(blocks: RunOfShowBlock[]): { blockId1: string; blockId2: string; message: string }[] {
  const conflicts: { blockId1: string; blockId2: string; message: string }[] = [];
  
  // Sort blocks by start time
  const sorted = [...blocks].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];
    if (!current || !next) continue;

    const currentEnd = timeToMinutes(current.endTime);
    const nextStart = timeToMinutes(next.startTime);

    // Overlap condition
    if (currentEnd > nextStart) {
      conflicts.push({
        blockId1: current.id,
        blockId2: next.id,
        message: `Direct time overlap between "${current.title}" (${current.startTime}-${current.endTime}) and "${next.title}" (${next.startTime}-${next.endTime}).`
      });
    } else if (current.zone === next.zone && (nextStart - currentEnd) < 5) {
      // Zone transition buffer insufficient
      conflicts.push({
        blockId1: current.id,
        blockId2: next.id,
        message: `Zero transition gap in "${current.zone}" between "${current.title}" and "${next.title}".`
      });
    }
  }

  return conflicts;
}

/**
 * Converts "HH:MM" string to minutes from midnight
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const parts = timeStr.split(':');
  const h = parseInt(parts[0] || '0', 10);
  const m = parseInt(parts[1] || '0', 10);
  return (h * 60) + m;
}

/**
 * Converts minutes from midnight to "HH:MM" string
 */
export function minutesToTime(minutes: number): string {
  const normalized = Math.max(0, minutes % (24 * 60));
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Dependency-Aware Schedule Reflow with Locked Anchors
 * Scenario 1: Delay occurs in a session.
 * Compresses flexible downstream transition buffers down to a safe minimum of 10m.
 * Strictly preserves Locked Anchors (Muhurtham, Keynote, Dinner Service).
 */
export function reflowTimelineWithLockedAnchors(
  blocks: RunOfShowBlock[],
  delayMinutes: number,
  startingBlockId: string
): { newBlocks: RunOfShowBlock[]; audit: string[] } {
  const audit: string[] = [];
  const blocksCopy: RunOfShowBlock[] = JSON.parse(JSON.stringify(blocks));

  const startIndex = blocksCopy.findIndex(b => b.id === startingBlockId);
  if (startIndex === -1) {
    return { newBlocks: blocksCopy, audit: ['Starting block not found.'] };
  }

  const delayedBlock = blocksCopy[startIndex];
  if (!delayedBlock) {
    return { newBlocks: blocksCopy, audit: ['No starting block.'] };
  }

  // Extend or shift the starting delayed block
  delayedBlock.durationMinutes += delayMinutes;
  delayedBlock.endTime = minutesToTime(timeToMinutes(delayedBlock.startTime) + delayedBlock.durationMinutes);
  audit.push(`Extended "${delayedBlock.title}" by +${delayMinutes} mins (Ends at ${delayedBlock.endTime}).`);

  let currentReflowTime = timeToMinutes(delayedBlock.endTime);

  for (let i = startIndex + 1; i < blocksCopy.length; i++) {
    const block = blocksCopy[i];
    if (!block) continue;

    const origStart = timeToMinutes(block.startTime);
    const origDuration = block.durationMinutes;

    if (block.isLockedAnchor) {
      // Locked anchor cannot shift its start time!
      audit.push(`Preserved locked anchor block "${block.title}" fixed at ${block.startTime}.`);
      
      // If reflow time encroaches into locked anchor, compress preceding flexible buffer
      if (currentReflowTime > origStart) {
        const encroachment = currentReflowTime - origStart;
        // Attempt to compress previous block buffer or report necessary human decision
        audit.push(`Notice: Reflow reached locked anchor "${block.title}". Required ${encroachment}m compression in flexible transition buffer.`);
      }
      currentReflowTime = timeToMinutes(block.endTime);
    } else {
      // Unlocked block can shift
      // Safely compress buffer if needed
      const safeBuffer = Math.max(10, block.bufferMinutes - 5);
      const newStart = Math.max(origStart, currentReflowTime + safeBuffer);
      const newEnd = newStart + origDuration;

      const shiftedAmount = newStart - origStart;
      block.startTime = minutesToTime(newStart);
      block.endTime = minutesToTime(newEnd);
      block.bufferMinutes = safeBuffer;
      currentReflowTime = newEnd;

      if (shiftedAmount > 0) {
        audit.push(`Shifted "${block.title}" by +${shiftedAmount}m to ${block.startTime}-${block.endTime} (Buffer set to safe ${safeBuffer}m).`);
      }
    }
  }

  return { newBlocks: blocksCopy, audit };
}

/**
 * Scenario 2: Sudden Outdoor Rain Relocation
 * Reassigns outdoor zones to indoor backup hall, injects relocation buffer
 */
export function simulateWeatherRelocation(
  blocks: RunOfShowBlock[],
  backupZone: string = 'Grand Indoor Ballroom'
): { newBlocks: RunOfShowBlock[]; audit: string[] } {
  const audit: string[] = [];
  const blocksCopy: RunOfShowBlock[] = JSON.parse(JSON.stringify(blocks));

  const outdoorBlocks = blocksCopy.filter(b => b.isOutdoor);
  if (outdoorBlocks.length === 0) {
    audit.push('No outdoor timeline blocks found.');
    return { newBlocks: blocksCopy, audit };
  }

  outdoorBlocks.forEach(b => {
    const priorZone = b.zone;
    b.zone = `${backupZone} (Indoor Weather Contingency)`;
    b.isOutdoor = false;
    audit.push(`Relocated "${b.title}" from "${priorZone}" to "${b.zone}".`);
  });

  // Inject a 20-minute relocation and acoustic check buffer before the first relocated block
  const firstRelocatedIndex = blocksCopy.findIndex(b => outdoorBlocks.some(ob => ob.id === b.id));
  if (firstRelocatedIndex >= 0) {
    const targetBlock = blocksCopy[firstRelocatedIndex];
    if (targetBlock) {
      targetBlock.bufferMinutes += 20;
      audit.push(`Injected 20-minute Weather Transition & AV Soundcheck buffer before "${targetBlock.title}".`);
    }
  }

  return { newBlocks: blocksCopy, audit };
}

/**
 * Weighted Vendor Decision Matrix (0-100)
 * Weights:
 * - Budget Alignment (30%)
 * - Style / Persona Fit (25%)
 * - Track Record & Reliability (25%)
 * - Contract & Cancellation Flexibility (20%)
 */
export function calculateVendorScore(criteria: VendorScoreCriteria): number {
  const budgetWeight = 0.30;
  const styleWeight = 0.25;
  const reliabilityWeight = 0.25;
  const contractWeight = 0.20;

  const score = (
    (criteria.budgetAlignment.score * budgetWeight) +
    (criteria.stylePersonaFit.score * styleWeight) +
    (criteria.reliabilityTrackRecord.score * reliabilityWeight) +
    (criteria.contractFlexibility.score * contractWeight)
  );

  return Math.round(score);
}

/**
 * Identifies the Best Logical Match from a list of vendors in a category
 */
export function identifyBestVendorMatch(vendors: Vendor[]): Vendor | null {
  if (vendors.length === 0) return null;
  return [...vendors].sort((a, b) => (b.compositeScore || 0) - (a.compositeScore || 0))[0] || null;
}
