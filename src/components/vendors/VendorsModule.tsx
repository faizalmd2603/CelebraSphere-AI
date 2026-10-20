import React, { useState, useMemo } from 'react';
import { useEventContext } from '../../context/EventContext';
import {
  calculateVendorScore,
  identifyBestVendorMatch,
  formatCurrency
} from '../../utils/calculations';
import { Vendor, VendorStatus } from '../../types/event';
import {
  Store,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  FileText,
  Mail,
  Scale,
  Award,
  DollarSign,
  Plus,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { VendorCommModal } from '../modals/VendorCommModal';

export const VendorsModule: React.FC = () => {
  const {
    plan,
    currency,
    updateVendorStatus,
    toggleVendorSafetyCheck,
    addVendor
  } = useEventContext();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [commModalVendor, setCommModalVendor] = useState<Vendor | null>(null);
  const [commType, setCommType] = useState<'rfp' | 'negotiation' | 'arrival'>('rfp');

  // Filter vendors
  const filteredVendors = useMemo(() => {
    if (selectedCategory === 'all') return plan.vendors;
    return plan.vendors.filter(v => v.category.toLowerCase().includes(selectedCategory.toLowerCase()));
  }, [plan.vendors, selectedCategory]);

  // Compute Best Logical Match for the current category or overall
  const bestMatch = useMemo(() => {
    return identifyBestVendorMatch(filteredVendors);
  }, [filteredVendors]);

  const handleOpenComm = (vendor: Vendor, type: 'rfp' | 'negotiation' | 'arrival') => {
    setCommModalVendor(vendor);
    setCommType(type);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Module Header & Summary */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-700/60">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Anti-Hallucination & Verification Guardrails</span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Store className="w-5 h-5 text-brand-400" /> Vendor Pipeline, Matrix & Pre-Booking Safety
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Every vendor profile is grounded with verified records or labeled for human verification. Compare shortlisted partners across a 4-pillar weighted algorithm (30% Budget, 25% Style, 25% Reliability, 20% Flexibility).
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {['all', 'Venue', 'Catering', 'Decor', 'Photography', 'Entertainment'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  selectedCategory === cat
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Best Match Banner */}
        {bestMatch && (
          <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    Best Logical Match ({bestMatch.compositeScore}/100)
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Category: {bestMatch.category}</span>
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">{bestMatch.name}</h3>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                onClick={() => handleOpenComm(bestMatch, 'negotiation')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow transition-all flex items-center gap-1"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Negotiation Reply</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Vendor Pipeline Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredVendors.map(vendor => {
          const score = vendor.compositeScore || (vendor.scoring ? calculateVendorScore(vendor.scoring) : 85);
          const checks = vendor.safetyChecklist;

          return (
            <div
              key={vendor.id}
              className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-6 shadow-xl space-y-5 flex flex-col justify-between transition-all hover:border-slate-600"
            >
              <div className="space-y-3">
                {/* Header: Name, Category, Verification Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">
                        {vendor.category}
                      </span>

                      {/* Anti-Hallucination Tag */}
                      {vendor.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Verified Record
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <AlertCircle className="w-3 h-3" /> AI Suggested — Needs Verification
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white mt-1">{vendor.name}</h3>
                  </div>

                  {/* Composite Score Pill */}
                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-white bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-700">
                      Score: <span className="text-emerald-400">{score}/100</span>
                    </div>
                  </div>
                </div>

                {/* Financial Milestone Snapshot */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-900/60 rounded-2xl border border-slate-700/40 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Quoted Price</span>
                    <div className="font-bold text-white mt-0.5">{formatCurrency(vendor.quotedPrice, currency)}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Deposit Paid</span>
                    <div className="font-bold text-emerald-400 mt-0.5">{formatCurrency(vendor.depositPaid, currency)}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Balance Due</span>
                    <div className="font-medium text-slate-300 mt-0.5">{vendor.balanceDueDate || 'Pending'}</div>
                  </div>
                </div>

                {/* 4-Pillar Weighted Score Breakdown */}
                {vendor.scoring && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      Weighted Decision Matrix Breakdown
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="flex justify-between bg-slate-900/40 px-2 py-1 rounded">
                        <span className="text-slate-400">Budget (30%):</span>
                        <span className="text-white font-bold">{vendor.scoring.budgetAlignment.score}%</span>
                      </div>
                      <div className="flex justify-between bg-slate-900/40 px-2 py-1 rounded">
                        <span className="text-slate-400">Style Fit (25%):</span>
                        <span className="text-white font-bold">{vendor.scoring.stylePersonaFit.score}%</span>
                      </div>
                      <div className="flex justify-between bg-slate-900/40 px-2 py-1 rounded">
                        <span className="text-slate-400">Reliability (25%):</span>
                        <span className="text-white font-bold">{vendor.scoring.reliabilityTrackRecord.score}%</span>
                      </div>
                      <div className="flex justify-between bg-slate-900/40 px-2 py-1 rounded">
                        <span className="text-slate-400">Flexibility (20%):</span>
                        <span className="text-white font-bold">{vendor.scoring.contractFlexibility.score}%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pre-Booking Safety Checklist (Section 2.4 Requirement) */}
                <div className="space-y-2 pt-2 border-t border-slate-700/60">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-400" /> 4-Point Pre-Booking Safety Checklist
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checks.portfolioVerified}
                        onChange={() => toggleVendorSafetyCheck(vendor.id, 'portfolioVerified')}
                        className="rounded bg-slate-900 border-slate-700 text-brand-600 focus:ring-brand-500"
                      />
                      <span className={checks.portfolioVerified ? "text-emerald-300" : ""}>Portfolio Verified</span>
                    </label>

                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checks.writtenQuoteChecked}
                        onChange={() => toggleVendorSafetyCheck(vendor.id, 'writtenQuoteChecked')}
                        className="rounded bg-slate-900 border-slate-700 text-brand-600 focus:ring-brand-500"
                      />
                      <span className={checks.writtenQuoteChecked ? "text-emerald-300" : ""}>Written Tax Quote</span>
                    </label>

                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checks.rainClauseChecked}
                        onChange={() => toggleVendorSafetyCheck(vendor.id, 'rainClauseChecked')}
                        className="rounded bg-slate-900 border-slate-700 text-brand-600 focus:ring-brand-500"
                      />
                      <span className={checks.rainClauseChecked ? "text-emerald-300" : ""}>Force Majeure / Rain</span>
                    </label>

                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checks.depositMilestoneLogged}
                        onChange={() => toggleVendorSafetyCheck(vendor.id, 'depositMilestoneLogged')}
                        className="rounded bg-slate-900 border-slate-700 text-brand-600 focus:ring-brand-500"
                      />
                      <span className={checks.depositMilestoneLogged ? "text-emerald-300" : ""}>Milestone Logged</span>
                    </label>
                  </div>
                </div>

                {vendor.notes && (
                  <p className="text-[11px] text-slate-400 italic bg-slate-900/40 p-2 rounded-xl">
                    &ldquo;{vendor.notes}&rdquo;
                  </p>
                )}
              </div>

              {/* Action Buttons: Status Selector & 1-Click Communication Generator */}
              <div className="pt-4 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Status Switcher */}
                <select
                  value={vendor.status}
                  onChange={e => updateVendorStatus(vendor.id, e.target.value as VendorStatus)}
                  className="w-full sm:w-auto bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:ring-2 focus:ring-brand-500"
                >
                  <option value="researching">Status: Researching</option>
                  <option value="quoted">Status: Quoted</option>
                  <option value="contract_signed">Status: Contract Signed</option>
                  <option value="deposit_paid">Status: Deposit Paid</option>
                  <option value="completed">Status: Completed</option>
                </select>

                {/* 1-Click Context-Aware Email Generator Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => handleOpenComm(vendor, 'rfp')}
                    className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition-all"
                    title="Generate RFP Brief with Headcount & Date"
                  >
                    RFP Brief
                  </button>

                  <button
                    onClick={() => handleOpenComm(vendor, 'negotiation')}
                    className="px-2.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold shadow transition-all"
                    title="Generate Polite Negotiation Response"
                  >
                    Negotiate
                  </button>

                  <button
                    onClick={() => handleOpenComm(vendor, 'arrival')}
                    className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition-all"
                    title="Day-of Arrival & AV Instructions"
                  >
                    Arrival Note
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Vendor Communication Modal */}
      {commModalVendor && (
        <VendorCommModal
          vendor={commModalVendor}
          plan={plan}
          initialType={commType}
          onClose={() => setCommModalVendor(null)}
        />
      )}
    </div>
  );
};
