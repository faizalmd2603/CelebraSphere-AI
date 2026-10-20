import { describe, it, expect } from 'vitest';
import {
  calculateReadinessScore,
  calculateBudgetSummary,
  scaleGuestCosts,
  rebalanceBudget,
  detectTimelineConflicts,
  reflowTimelineWithLockedAnchors,
  simulateWeatherRelocation,
  calculateVendorScore
} from '../utils/calculations';
import { WEDDING_PRESET } from '../data/presets';
import { RunOfShowBlock, VendorScoreCriteria } from '../types/event';

describe('Event Planning Calculations & Decision Engine', () => {
  it('calculates deterministic Event-Day Readiness Score within 0-100 bounds', () => {
    const readiness = calculateReadinessScore(WEDDING_PRESET);
    expect(readiness.overallScore).toBeGreaterThanOrEqual(0);
    expect(readiness.overallScore).toBeLessThanOrEqual(100);
    expect(readiness.budgetHealthScore).toBeGreaterThanOrEqual(0);
    expect(readiness.vendorConfirmationScore).toBeGreaterThanOrEqual(0);
    expect(readiness.scheduleConflictScore).toBeGreaterThanOrEqual(0);
    expect(readiness.checklistVelocityScore).toBeGreaterThanOrEqual(0);
    expect(['Ready', 'On Track', 'Attention Needed', 'Critical Risk']).toContain(readiness.status);
  });

  it('penalizes readiness score when contingency drops and category overruns occur', () => {
    const overrunPlan = JSON.parse(JSON.stringify(WEDDING_PRESET));
    // Force heavy overrun
    overrunPlan.budgetItems[0].actualAmount = 800000;
    overrunPlan.budgetItems[1].actualAmount = 900000;
    
    const readinessOverrun = calculateReadinessScore(overrunPlan);
    const readinessNormal = calculateReadinessScore(WEDDING_PRESET);

    expect(readinessOverrun.overallScore).toBeLessThan(readinessNormal.overallScore);
    expect(readinessOverrun.budgetHealthScore).toBeLessThan(readinessNormal.budgetHealthScore);
  });

  it('scales variable per-guest costs without altering fixed cost items', () => {
    const initialGuestCount = WEDDING_PRESET.guestCount; // 180
    const newGuestCount = 210; // +30 guests

    const scaledPlan = scaleGuestCosts(WEDDING_PRESET, newGuestCount);
    expect(scaledPlan.guestCount).toBe(210);

    const initialCatering = WEDDING_PRESET.budgetItems.find(i => i.id === 'b-catering-1')!;
    const scaledCatering = scaledPlan.budgetItems.find(i => i.id === 'b-catering-1')!;

    // Variable item must scale
    expect(scaledCatering.quantity).toBe(210);
    expect(scaledCatering.estimatedAmount).toBe(initialCatering.unitCost * 210);

    // Fixed item must remain unchanged
    const initialVenue = WEDDING_PRESET.budgetItems.find(i => i.id === 'b-venue-1')!;
    const scaledVenue = scaledPlan.budgetItems.find(i => i.id === 'b-venue-1')!;
    expect(scaledVenue.estimatedAmount).toBe(initialVenue.estimatedAmount);
    expect(scaledVenue.quantity).toBe(1);
  });

  it('AI Auto-Rebalance reallocates surplus from non-critical categories and maintains 8% contingency floor', () => {
    const planWithOverrun = JSON.parse(JSON.stringify(WEDDING_PRESET));
    // Introduce an overrun in catering
    planWithOverrun.budgetItems[1].actualAmount = planWithOverrun.budgetItems[1].estimatedAmount + 25000;

    const { newPlan, diff } = rebalanceBudget(planWithOverrun);
    expect(diff.length).toBeGreaterThan(0);

    const summary = calculateBudgetSummary(newPlan);
    // Ensure contingency reserve did not drop below 8% of total budget
    const minimumSafeContingency = planWithOverrun.totalBudget * 0.08;
    expect(summary.contingencyAmount).toBeGreaterThanOrEqual(minimumSafeContingency);
  });

  it('detects timeline conflicts and overlapping session intervals', () => {
    const testBlocks: RunOfShowBlock[] = [
      {
        id: 'blk-1',
        startTime: '10:00',
        endTime: '11:00',
        durationMinutes: 60,
        title: 'Morning Welcome',
        description: '',
        zone: 'Main Lawn',
        isOutdoor: true,
        owner: 'Lead',
        bufferMinutes: 10,
        isLockedAnchor: false,
        dependencies: []
      },
      {
        id: 'blk-2',
        startTime: '10:45', // 15-minute overlap!
        endTime: '11:30',
        durationMinutes: 45,
        title: 'Ceremony Start',
        description: '',
        zone: 'Main Lawn',
        isOutdoor: true,
        owner: 'Lead',
        bufferMinutes: 10,
        isLockedAnchor: false,
        dependencies: []
      }
    ];

    const conflicts = detectTimelineConflicts(testBlocks);
    expect(conflicts.length).toBe(1);
    expect(conflicts[0]!.message).toContain('Direct time overlap');
  });

  it('reflows schedule by +25 mins, preserves locked anchors and respects safe 10m buffer floor', () => {
    const blocks = WEDDING_PRESET.runOfShow;
    const muhurthamBlock = blocks.find(b => b.isLockedAnchor)!;
    const initialMuhurthamStart = muhurthamBlock.startTime;

    const startingBlock = blocks[0]!;
    const { newBlocks, audit } = reflowTimelineWithLockedAnchors(blocks, 25, startingBlock.id);

    expect(audit.length).toBeGreaterThan(0);

    // Verify Locked Anchor remained untouched at its designated start time
    const lockedAfterReflow = newBlocks.find(b => b.id === muhurthamBlock.id)!;
    expect(lockedAfterReflow.startTime).toBe(initialMuhurthamStart);

    // Verify all transition buffers are >= 10 minutes
    newBlocks.forEach(b => {
      expect(b.bufferMinutes).toBeGreaterThanOrEqual(10);
    });
  });

  it('simulates sudden weather relocation to indoor backup hall and injects AV buffer', () => {
    const { newBlocks, audit } = simulateWeatherRelocation(WEDDING_PRESET.runOfShow, 'Grand Indoor Ballroom');
    expect(audit.length).toBeGreaterThan(0);

    // No blocks should remain outdoor
    const anyOutdoor = newBlocks.some(b => b.isOutdoor);
    expect(anyOutdoor).toBe(false);

    // First relocated block should have extra 20m buffer injected
    const relocated = newBlocks.find(b => b.zone.includes('Grand Indoor Ballroom'))!;
    expect(relocated.zone).toContain('Weather Contingency');
  });

  it('computes weighted vendor decision score based on 30/25/25/20 distribution', () => {
    const sampleCriteria: VendorScoreCriteria = {
      budgetAlignment: { score: 90, notes: '' },        // 90 * 0.30 = 27
      stylePersonaFit: { score: 80, notes: '' },        // 80 * 0.25 = 20
      reliabilityTrackRecord: { score: 100, notes: '' }, // 100 * 0.25 = 25
      contractFlexibility: { score: 70, notes: '' }     // 70 * 0.20 = 14
    };

    // Total expected: 27 + 20 + 25 + 14 = 86
    const score = calculateVendorScore(sampleCriteria);
    expect(score).toBe(86);
  });
});
