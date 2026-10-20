import { describe, it, expect } from 'vitest';
import { WEDDING_PRESET, BIRTHDAY_PRESET } from '../data/presets';
import {
  getLiveWeatherTelemetry,
  executeWeatherRelocation,
  executeBudgetAuditAndRebalance,
  executeTimelineScheduleReflow,
  executeGuestHeadcountScaling,
  executeAutomateTasks
} from '../services/agentTools';

describe('Within-App Agentic Tool Integrations', () => {
  it('Tool 1: getLiveWeatherTelemetry returns location-specific weather telemetry', () => {
    const coastalWeather = getLiveWeatherTelemetry(WEDDING_PRESET.venueName, WEDDING_PRESET.venueType, WEDDING_PRESET.eventDate);
    expect(coastalWeather.location).toContain('Mahabalipuram');
    expect(coastalWeather.precipitationProbability).toBeGreaterThanOrEqual(40);
    expect(coastalWeather.advisory).toContain('Precipitation risk is elevated');

    const rooftopWeather = getLiveWeatherTelemetry(BIRTHDAY_PRESET.venueName, BIRTHDAY_PRESET.venueType, BIRTHDAY_PRESET.eventDate);
    expect(rooftopWeather.location).toContain('SkyDeck');
    expect(rooftopWeather.precipitationProbability).toBeLessThan(30);
  });

  it('Tool 2: executeWeatherRelocation reallocates outdoor sessions to indoor ballroom', () => {
    const result = executeWeatherRelocation(WEDDING_PRESET);
    expect(result.updatedRunOfShow.length).toBe(WEDDING_PRESET.runOfShow.length);
    expect(result.audit.length).toBeGreaterThan(0);
    expect(result.newTask.priority).toBe('critical');
    expect(result.newTask.title).toContain('Marquee Tent');
  });

  it('Tool 3: executeBudgetAuditAndRebalance audits ledger and protects 8% reserve', () => {
    const result = executeBudgetAuditAndRebalance(WEDDING_PRESET);
    expect(result.newPlan.contingencyPercentage).toBeGreaterThanOrEqual(8);
    expect(result.budgetSummary.totalBudget).toBe(WEDDING_PRESET.totalBudget);
  });

  it('Tool 4: executeTimelineScheduleReflow shifts downstream sessions and preserves locked anchors', () => {
    const result = executeTimelineScheduleReflow(WEDDING_PRESET, 25);
    expect(result.newBlocks.length).toBe(WEDDING_PRESET.runOfShow.length);
    expect(result.audit.length).toBeGreaterThan(0);

    // Verify locked anchor (e.g. Muhurtham) did not change its fixed start time
    const lockedOriginal = WEDDING_PRESET.runOfShow.find(b => b.isLockedAnchor);
    const lockedReflowed = result.newBlocks.find(b => b.isLockedAnchor);
    if (lockedOriginal && lockedReflowed) {
      expect(lockedReflowed.startTime).toBe(lockedOriginal.startTime);
    }
  });

  it('Tool 5: executeGuestHeadcountScaling scales per-guest catering accurately', () => {
    const result = executeGuestHeadcountScaling(WEDDING_PRESET, 25);
    expect(result.newCount).toBe(WEDDING_PRESET.guestCount + 25);
    expect(result.costDelta).toBeGreaterThan(0);
  });

  it('Tool 6: executeAutomateTasks synthesizes operational tasks based on readiness gaps', () => {
    const tasks = executeAutomateTasks(WEDDING_PRESET);
    expect(tasks.length).toBeGreaterThanOrEqual(2);
    expect(tasks.some(t => t.priority === 'critical')).toBe(true);
    expect(tasks.some(t => t.isAiSuggested)).toBe(true);
  });
});
