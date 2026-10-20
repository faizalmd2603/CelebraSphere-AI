import React from 'react';
import { ReadinessScoreBreakdown } from '../../types/event';
import { ShieldCheck, AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ReadinessGaugeProps {
  readiness: ReadinessScoreBreakdown;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export const ReadinessGauge: React.FC<ReadinessGaugeProps> = ({
  readiness,
  size = 'md',
  showDetails = true
}) => {
  const { overallScore, budgetHealthScore, vendorConfirmationScore, scheduleConflictScore, checklistVelocityScore, status } = readiness;

  // Circle configuration
  const radius = size === 'sm' ? 28 : size === 'md' ? 48 : 64;
  const strokeWidth = size === 'sm' ? 5 : size === 'md' ? 8 : 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  // Status colors & icons
  const getStatusConfig = () => {
    if (overallScore >= 88) {
      return {
        color: '#10b981', // emerald
        strokeClass: 'text-emerald-500',
        bgPill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        icon: CheckCircle2
      };
    }
    if (overallScore >= 70) {
      return {
        color: '#3b82f6', // blue
        strokeClass: 'text-blue-500',
        bgPill: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        icon: ShieldCheck
      };
    }
    if (overallScore >= 50) {
      return {
        color: '#f59e0b', // amber
        strokeClass: 'text-amber-500',
        bgPill: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        icon: AlertTriangle
      };
    }
    return {
      color: '#ef4444', // red
      strokeClass: 'text-rose-500',
      bgPill: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      icon: AlertCircle
    };
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const dimension = (radius + strokeWidth) * 2;

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 p-5 bg-slate-800/80 rounded-2xl border border-slate-700/60 shadow-xl backdrop-blur-md">
      {/* SVG Circular Dial */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          width={dimension}
          height={dimension}
          className="transform -rotate-90 drop-shadow-lg"
          aria-label={`Event-Day Readiness Gauge: ${overallScore} out of 100 (${status})`}
          role="img"
        >
          {/* Background Track */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-700/50"
            fill="transparent"
          />
          {/* Foreground Animated Progress */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke={statusConfig.color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Score & Icon */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold text-white tracking-tight">{overallScore}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">/ 100</span>
        </div>
      </div>

      {/* Readiness Details & 4-Pillar Breakdown */}
      {showDetails && (
        <div className="flex-1 w-full space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Event-Day Readiness Score</h3>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusConfig.bgPill}`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Computed deterministically across 4 weighted operational pillars (25% each)
              </p>
            </div>
          </div>

          {/* 4 Pillars Progress Mini-Bars */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Pillar 1: Budget Health */}
            <div className="space-y-1 bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/40">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">Budget Health (25%)</span>
                <span className="text-white font-bold">{budgetHealthScore}%</span>
              </div>
              <div className="w-full bg-slate-700/60 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${budgetHealthScore}%` }}
                />
              </div>
            </div>

            {/* Pillar 2: Vendor Confirmation */}
            <div className="space-y-1 bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/40">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">Vendor Confirmation (25%)</span>
                <span className="text-white font-bold">{vendorConfirmationScore}%</span>
              </div>
              <div className="w-full bg-slate-700/60 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${vendorConfirmationScore}%` }}
                />
              </div>
            </div>

            {/* Pillar 3: Schedule Conflict-Free */}
            <div className="space-y-1 bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/40">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">Schedule Conflicts (25%)</span>
                <span className="text-white font-bold">{scheduleConflictScore}%</span>
              </div>
              <div className="w-full bg-slate-700/60 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${scheduleConflictScore}%` }}
                />
              </div>
            </div>

            {/* Pillar 4: Checklist Velocity */}
            <div className="space-y-1 bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/40">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">Checklist Velocity (25%)</span>
                <span className="text-white font-bold">{checklistVelocityScore}%</span>
              </div>
              <div className="w-full bg-slate-700/60 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${checklistVelocityScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
