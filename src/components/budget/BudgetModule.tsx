import React, { useState, useMemo } from 'react';
import { useEventContext } from '../../context/EventContext';
import {
  calculateBudgetSummary,
  formatCurrency,
  rebalanceBudget
} from '../../utils/calculations';
import { BudgetItem, BudgetPriorityMode, CostType } from '../../types/event';
import {
  Wallet,
  PieChart,
  Plus,
  Trash2,
  Edit2,
  Download,
  AlertCircle,
  CheckCircle2,
  Scale,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const BudgetModule: React.FC = () => {
  const {
    plan,
    currency,
    updateGuestCount,
    setPriorityMode,
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    rebalanceBudgetAction
  } = useEventContext();

  const [guestSliderValue, setGuestSliderValue] = useState<number>(plan.guestCount);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showRebalanceDiffModal, setShowRebalanceDiffModal] = useState<boolean>(false);
  const [rebalanceDiff, setRebalanceDiff] = useState<any[]>([]);

  // New item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState(plan.categories[0]?.name || 'Catering & Beverages');
  const [newItemCostType, setNewItemCostType] = useState<CostType>('fixed');
  const [newItemUnitCost, setNewItemUnitCost] = useState<number>(1000);
  const [newItemQuantity, setNewItemQuantity] = useState<number>(1);
  const [newItemActual, setNewItemActual] = useState<number>(0);

  const budgetSummary = useMemo(() => calculateBudgetSummary(plan), [plan]);

  // Handle guest count slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setGuestSliderValue(val);
    updateGuestCount(val);
  };

  // Run AI Auto-Rebalance
  const handleTriggerRebalance = () => {
    const { diff } = rebalanceBudget(plan);
    setRebalanceDiff(diff);
    setShowRebalanceDiffModal(true);
  };

  const handleConfirmRebalance = () => {
    rebalanceBudgetAction();
    setShowRebalanceDiffModal(false);
  };

  // Add Item Submit
  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const estimatedAmount = newItemCostType === 'variable'
      ? newItemUnitCost * plan.guestCount
      : newItemUnitCost * newItemQuantity;

    addBudgetItem({
      name: newItemName.trim(),
      category: newItemCategory,
      costType: newItemCostType,
      unitCost: newItemUnitCost,
      quantity: newItemCostType === 'variable' ? plan.guestCount : newItemQuantity,
      estimatedAmount,
      actualAmount: newItemActual || estimatedAmount,
      paidAmount: 0
    });

    setNewItemName('');
    setShowAddModal(false);
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['Name', 'Category', 'Cost Type', 'Unit Cost', 'Quantity', 'Estimated Amount', 'Actual Amount', 'Paid Amount', 'Notes'];
    const rows = plan.budgetItems.map(item => [
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.category}"`,
      item.costType,
      item.unitCost,
      item.quantity,
      item.estimatedAmount,
      item.actualAmount,
      item.paidAmount,
      `"${(item.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${plan.title.replace(/\s+/g, '_')}_Budget_Plan.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // SVG Donut calculation
  const donutData = useMemo(() => {
    const total = budgetSummary.totalBudget;
    let accumulated = 0;
    return plan.categories.map(cat => {
      const percentage = (cat.allocatedAmount / Math.max(1, total)) * 100;
      const strokeDash = `${percentage} ${100 - percentage}`;
      const strokeDashoffset = -accumulated;
      accumulated += percentage;
      return {
        ...cat,
        percentage: Math.round(percentage),
        strokeDash,
        strokeDashoffset
      };
    });
  }, [plan.categories, budgetSummary.totalBudget]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Controls: Priority Mode & Guest Count Scaler */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-700/60">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-brand-400" /> Interactive Budget Architecture & Scaler
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Adjust guest count and priority focus to dynamically rescale fixed vs. variable per-head expenses.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {budgetSummary.isOverrun && (
              <button
                onClick={handleTriggerRebalance}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-brand-600 hover:from-amber-500 hover:to-brand-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-500/20 transition-all flex items-center gap-1.5 animate-pulse"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Auto-Rebalance Overruns</span>
              </button>
            )}

            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-brand-400" />
              <span>Add Line Item</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              title="Export Budget to CSV"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Priority Persona & Guest Slider Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Guest Count Scaler Slider */}
          <div className="space-y-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-700/50">
            <div className="flex justify-between items-center">
              <label htmlFor="guest-slider" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Interactive Headcount Scaler
              </label>
              <span className="text-sm font-black text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-lg border border-brand-500/20">
                {plan.guestCount} Guests
              </span>
            </div>
            <input
              id="guest-slider"
              type="range"
              min="20"
              max="600"
              step="5"
              value={guestSliderValue}
              onChange={handleSliderChange}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Intimate (20)</span>
              <span>Medium (250)</span>
              <span>Grand Gala (600)</span>
            </div>
          </div>

          {/* Priority Mode Selector */}
          <div className="space-y-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-700/50">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Budget Priority Persona
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'balanced', label: 'Balanced ⚖️' },
                { id: 'culinary-first', label: 'Culinary First 🍲' },
                { id: 'decor-vibe', label: 'Decor & Vibe 🌸' },
                { id: 'eco-minimalist', label: 'Eco-Minimalist 🌿' },
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setPriorityMode(mode.id as BudgetPriorityMode)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-left border ${
                    plan.budgetPriorityMode === mode.id
                      ? 'bg-brand-600/30 border-brand-500 text-brand-300 shadow-sm'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4 Financial Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/40">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Budget Ceiling</span>
            <div className="text-lg font-black text-white mt-0.5">{formatCurrency(budgetSummary.totalBudget, currency)}</div>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/40">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Fixed Base Costs</span>
            <div className="text-lg font-black text-blue-400 mt-0.5">{formatCurrency(budgetSummary.fixedCostTotal, currency)}</div>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/40">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Variable Guest Costs</span>
            <div className="text-lg font-black text-amber-400 mt-0.5">{formatCurrency(budgetSummary.variableCostTotal, currency)}</div>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/40">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">10% Emergency Reserve</span>
            <div className="text-lg font-black text-emerald-400 mt-0.5">{formatCurrency(budgetSummary.contingencyAmount, currency)}</div>
          </div>
        </div>
      </div>

      {/* Visual Analytics: SVG Category Donut & Stacked Spend Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Donut Chart */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-brand-400" /> Category Allocation Ratio
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Budget split across functional areas</p>
          </div>

          {/* Lightweight Accessible SVG Donut */}
          <div className="py-6 flex items-center justify-center">
            <div className="relative w-44 h-44">
              <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90">
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#1e293b" strokeWidth="6" />
                {donutData.map(cat => (
                  <circle
                    key={cat.id}
                    cx="21"
                    cy="21"
                    r="15.915"
                    fill="transparent"
                    stroke={cat.color}
                    strokeWidth="6"
                    strokeDasharray={cat.strokeDash}
                    strokeDashoffset={cat.strokeDashoffset}
                    className="transition-all duration-700"
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xs text-slate-400 font-medium">Spent Ratio</span>
                <span className="text-lg font-black text-white">
                  {Math.round((budgetSummary.totalActual / Math.max(1, budgetSummary.totalBudget)) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-1.5 pt-2">
            {donutData.map(cat => (
              <div key={cat.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-slate-300 truncate">{cat.name}</span>
                </div>
                <span className="font-bold text-white shrink-0">{cat.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stacked Spend vs Estimate Progress Bars */}
        <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700/60 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Estimated vs. Actual vs. Paid Spend</h3>
              <p className="text-xs text-slate-400 mt-0.5">Tracking category contract utilization</p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {plan.categories.map(cat => {
              const spentRatio = Math.min(100, (cat.spentAmount / Math.max(1, cat.allocatedAmount)) * 100);
              const isOver = cat.spentAmount > cat.allocatedAmount;

              return (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-200">{cat.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">
                        Cap: <span className="text-white font-medium">{formatCurrency(cat.allocatedAmount, currency)}</span>
                      </span>
                      <span className={isOver ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                        Actual: {formatCurrency(cat.spentAmount, currency)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-rose-500' : 'bg-emerald-500'}`}
                      style={{ width: `${spentRatio}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Budget Line Items Table */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-700/60 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Comprehensive Line-Item Ledger</h3>
            <p className="text-xs text-slate-400 mt-0.5">Full itemization of fixed packages and variable guest items</p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-slate-900 text-slate-300 font-mono">
            {plan.budgetItems.length} Line Items
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/60 text-slate-400 uppercase tracking-wider border-b border-slate-700/60">
                <th className="py-3 px-4 font-semibold">Item & Category</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">Unit Cost</th>
                <th className="py-3 px-4 font-semibold">Qty</th>
                <th className="py-3 px-4 font-semibold">Estimated</th>
                <th className="py-3 px-4 font-semibold">Actual Spend</th>
                <th className="py-3 px-4 font-semibold">Paid Advance</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40 text-slate-200">
              {plan.budgetItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{item.name}</div>
                    <div className="text-[11px] text-slate-400">{item.category}</div>
                    {item.notes && <div className="text-[10px] text-brand-300 italic mt-0.5 truncate max-w-xs">{item.notes}</div>}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.costType === 'variable' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {item.costType}
                    </span>
                  </td>
                  <td className="py-3 px-4">{formatCurrency(item.unitCost, currency)}</td>
                  <td className="py-3 px-4 font-mono">{item.quantity}</td>
                  <td className="py-3 px-4">{formatCurrency(item.estimatedAmount, currency)}</td>
                  <td className="py-3 px-4">
                    <span className={item.actualAmount > item.estimatedAmount ? "text-rose-400 font-bold" : "text-white"}>
                      {formatCurrency(item.actualAmount, currency)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-emerald-400 font-medium">{formatCurrency(item.paidAmount, currency)}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => deleteBudgetItem(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Line Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-brand-400" /> Add New Budget Line Item
            </h3>

            <form onSubmit={handleAddItemSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Item Title</label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  placeholder="e.g. Traditional Brass Lamp Lighting"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={e => setNewItemCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-brand-500"
                  >
                    {plan.categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cost Architecture</label>
                  <select
                    value={newItemCostType}
                    onChange={e => setNewItemCostType(e.target.value as CostType)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="fixed">Fixed Cost Package</option>
                    <option value="variable">Variable (Per Guest)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Unit Cost ({currency})</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newItemUnitCost}
                    onChange={e => setNewItemUnitCost(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {newItemCostType === 'variable' ? 'Quantity (Matches Guests)' : 'Quantity'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    disabled={newItemCostType === 'variable'}
                    value={newItemCostType === 'variable' ? plan.guestCount : newItemQuantity}
                    onChange={e => setNewItemQuantity(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-lg"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Auto-Rebalance Before/After Diff Approval Modal */}
      {showRebalanceDiffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-800 border border-brand-500/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-lg font-bold text-white">AI Auto-Rebalance Proposal</h3>
            </div>
            <p className="text-xs text-slate-300">
              CelebraSphere AI calculated surplus funds in non-critical categories to absorb active overruns while guaranteeing your 8% emergency contingency floor.
            </p>

            <div className="space-y-3 py-2">
              {rebalanceDiff.length === 0 ? (
                <div className="text-xs text-slate-400 italic">No category overruns detected.</div>
              ) : (
                rebalanceDiff.map((d, idx) => (
                  <div key={idx} className="bg-slate-900/80 p-3 rounded-xl border border-slate-700 text-xs space-y-1">
                    <div className="flex justify-between items-center font-bold text-white">
                      <span>{d.category}</span>
                      <span className="text-brand-300">
                        {formatCurrency(d.before, currency)} &rarr; {formatCurrency(d.after, currency)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{d.reason}</p>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRebalanceDiffModal(false)}
                className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRebalance}
                className="px-4 py-2 bg-gradient-to-r from-brand-600 to-amber-600 text-white rounded-xl text-xs font-bold shadow-lg"
              >
                Apply Rebalance to Live Budget
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
