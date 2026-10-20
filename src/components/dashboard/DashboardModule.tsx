import React, { useMemo } from 'react';
import { useEventContext } from '../../context/EventContext';
import {
  calculateReadinessScore,
  calculateBudgetSummary,
  formatCurrency,
  detectTimelineConflicts
} from '../../utils/calculations';
import { ReadinessGauge } from '../common/ReadinessGauge';
import {
  AlertTriangle,
  CloudRain,
  Users,
  Store,
  CheckCircle2,
  Calendar,
  DollarSign,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const DashboardModule: React.FC = () => {
  const {
    plan,
    setActiveTab,
    toggleTaskComplete,
    addChecklistTask,
    updateGuestCount,
    currency
  } = useEventContext();

  const readiness = calculateReadinessScore(plan);
  const budget = calculateBudgetSummary(plan);
  const conflicts = useMemo(() => detectTimelineConflicts(plan.runOfShow), [plan.runOfShow]);

  // Proactive Context Decision Alerts Logic
  const alerts = useMemo(() => {
    const list: Array<{
      id: string;
      type: 'weather' | 'vendor' | 'guest' | 'conflict';
      title: string;
      message: string;
      actionLabel: string;
      onAction: () => void;
    }> = [];

    // Alert 1: Weather / Venue Outdoor Risk
    const hasOutdoor = plan.venueType === 'outdoor' || plan.venueType === 'hybrid' || plan.runOfShow.some(b => b.isOutdoor);
    const rainTask = plan.checklistTasks.find(t => t.title.toLowerCase().includes('weather') || t.title.toLowerCase().includes('rain') || t.title.toLowerCase().includes('tent'));
    const isRainTaskDone = rainTask?.completed ?? false;

    if (hasOutdoor && !isRainTaskDone) {
      list.push({
        id: 'alert-weather',
        type: 'weather',
        title: 'Outdoor Setting Detected Without Confirmed Rain Contingency',
        message: `Your event features outdoor sessions at "${plan.venueName}". A sudden coastal squall or rain can cause critical schedule disruptions.`,
        actionLabel: 'Add Weather Tent & Hold Task [1-Click Fix]',
        onAction: () => {
          addChecklistTask({
            title: 'Confirm Waterproof Marquee Tent & Indoor Backup Hold with Venue Manager',
            category: 'Venue & Logistics',
            planningWindow: '1m_out',
            priority: 'critical',
            dueDate: plan.eventDate,
            owner: 'Event Operations Lead',
            isAiSuggested: true
          });
        }
      });
    }

    // Alert 2: Unconfirmed Critical Vendors within 30-45 Days
    if (plan.daysRemaining <= 45) {
      const unconfirmed = plan.vendors.filter(
        v => ['Venue', 'Catering', 'Photography', 'AV'].includes(v.category) &&
             (v.status === 'researching' || v.status === 'quoted')
      );
      if (unconfirmed.length > 0) {
        list.push({
          id: 'alert-vendor',
          type: 'vendor',
          title: `${unconfirmed.length} High-Impact Vendor(s) Awaiting Final Contract`,
          message: `${unconfirmed.map(v => v.name).join(', ')} are still in quoted status with ${plan.daysRemaining} days left.`,
          actionLabel: 'Review Vendor Shortlists',
          onAction: () => setActiveTab('vendors')
        });
      }
    }

    // Alert 3: Timeline Conflict Alert
    if (conflicts.length > 0) {
      list.push({
        id: 'alert-conflict',
        type: 'conflict',
        title: `${conflicts.length} Overlapping Schedule Conflict(s) Detected`,
        message: conflicts[0]?.message || 'Concurrent sessions found in the same zone without transition buffers.',
        actionLabel: 'Open Disruption Simulator',
        onAction: () => setActiveTab('timeline')
      });
    }

    return list;
  }, [plan, conflicts, addChecklistTask, setActiveTab]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-purple-950/70 border border-slate-700/60 p-6 md:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Grounded Celebration Co-Pilot Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {plan.title}
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              {plan.venueName} &bull; <span className="text-brand-400 font-medium">{plan.guestCount} Guests</span> &bull; <span className="text-amber-400 font-medium">{plan.daysRemaining} Days Countdown</span> &bull; {plan.priorityPillars.join(' & ')}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('timeline')}
              className="px-4 py-2.5 bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-500 hover:to-rose-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-brand-500/20 transition-all flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              <span>View Run-of-Show</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Proactive Context Decision Alerts Banner */}
      {alerts.length > 0 && (
        <section aria-labelledby="proactive-alerts-heading" className="space-y-3">
          <h2 id="proactive-alerts-heading" className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Proactive Context Decision Alerts ({alerts.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-slate-800/90 border border-amber-500/30 rounded-2xl p-4 shadow-lg flex flex-col justify-between gap-3 relative overflow-hidden"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0 mt-0.5">
                    {alert.type === 'weather' ? <CloudRain className="w-5 h-5" /> : alert.type === 'vendor' ? <Store className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white">{alert.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{alert.message}</p>
                  </div>
                </div>
                <button
                  onClick={alert.onAction}
                  className="w-full mt-2 py-2 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-white border border-amber-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <span>{alert.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Dynamic Readiness Score Gauge Section */}
      <section aria-labelledby="readiness-section-heading">
        <h2 id="readiness-section-heading" className="sr-only">Event Readiness Analysis</h2>
        <ReadinessGauge readiness={readiness} />
      </section>

      {/* 4 Core Operational KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Budget Spend */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Budget Ceiling</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg sm:text-2xl font-black text-white">
            {formatCurrency(budget.totalBudget, currency)}
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-700/40">
            <span className="text-slate-400">Actual Spend:</span>
            <span className={budget.isOverrun ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
              {formatCurrency(budget.totalActual, currency)}
            </span>
          </div>
        </div>

        {/* KPI 2: Guest Headcount */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Guest Headcount</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-lg sm:text-2xl font-black text-white">
            {plan.guestCount} <span className="text-xs font-normal text-slate-400">Attendees</span>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-700/40">
            <span className="text-slate-400">RSVP Confirmed:</span>
            <span className="text-blue-400 font-bold">
              {plan.guests.filter(g => g.rsvpStatus === 'confirmed').length} / {plan.guests.length}
            </span>
          </div>
        </div>

        {/* KPI 3: Vendors Confirmed */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Vendor Pipeline</span>
            <Store className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-lg sm:text-2xl font-black text-white">
            {plan.vendors.filter(v => v.status === 'contract_signed' || v.status === 'deposit_paid').length} / {plan.vendors.length}
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-700/40">
            <span className="text-slate-400">Total Deposits:</span>
            <span className="text-purple-400 font-bold">
              {formatCurrency(plan.vendors.reduce((acc, v) => acc + v.depositPaid, 0), currency)}
            </span>
          </div>
        </div>

        {/* KPI 4: Timeline Blocks */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Run-of-Show Sessions</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg sm:text-2xl font-black text-white">
            {plan.runOfShow.length} <span className="text-xs font-normal text-slate-400">Blocks</span>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-700/40">
            <span className="text-slate-400">Locked Anchors:</span>
            <span className="text-amber-400 font-bold">
              {plan.runOfShow.filter(b => b.isLockedAnchor).length} Fixed
            </span>
          </div>
        </div>
      </div>

      {/* Critical Milestone Tasks Snapshot */}
      <section aria-labelledby="milestones-heading" className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="milestones-heading" className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-400" /> Critical Milestone Velocity Checklist
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">High-priority operational gates for the next 45-day window</p>
          </div>
          <button
            onClick={() => setActiveTab('timeline')}
            className="text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1"
          >
            <span>View Full Timeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-700/60">
          {plan.checklistTasks.slice(0, 5).map((task) => (
            <div key={task.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleTaskComplete(task.id)}
                  aria-label={`Mark task "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
                  className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                    task.completed
                      ? 'bg-emerald-500 border-emerald-400 text-white'
                      : 'border-slate-600 hover:border-brand-400 bg-slate-900'
                  }`}
                >
                  {task.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
                <div>
                  <span className={`text-xs sm:text-sm font-medium ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    {task.title}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 font-mono">
                      {task.category}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      task.priority === 'critical' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {task.priority}
                    </span>
                    <span className="text-[10px] text-slate-400">Due: {task.dueDate}</span>
                    <span className="text-[10px] text-slate-400 font-medium">({task.owner})</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
