import React, { useState, useMemo } from 'react';
import { useEventContext } from '../../context/EventContext';
import { formatCurrency } from '../../utils/calculations';
import { CreativeIdea, Guest } from '../../types/event';
import {
  Sparkles,
  Palette,
  UtensilsCrossed,
  HeartHandshake,
  Leaf,
  Plus,
  CheckCircle2,
  Users,
  AlertTriangle,
  Accessibility,
  Eye,
  ShieldCheck,
  Tag
} from 'lucide-react';

export const IdeasStudioModule: React.FC = () => {
  const {
    plan,
    currency,
    addCreativeIdeaToPlan
  } = useEventContext();

  const [activeCategory, setActiveCategory] = useState<'palette' | 'culinary' | 'rituals' | 'eco_cost_saving'>('palette');

  // Filter ideas by category
  const filteredIdeas = useMemo(() => {
    return plan.creativeIdeas.filter(i => i.category === activeCategory);
  }, [plan.creativeIdeas, activeCategory]);

  // Aggregate RSVP & Dietary metrics
  const guestStats = useMemo(() => {
    const total = plan.guests.length;
    const confirmed = plan.guests.filter(g => g.rsvpStatus === 'confirmed').length;
    const pending = plan.guests.filter(g => g.rsvpStatus === 'pending').length;
    const declined = plan.guests.filter(g => g.rsvpStatus === 'declined').length;

    const dietaryCounts = {
      regular: plan.guests.filter(g => g.dietaryPreference === 'regular').length,
      vegetarian: plan.guests.filter(g => g.dietaryPreference === 'vegetarian').length,
      vegan: plan.guests.filter(g => g.dietaryPreference === 'vegan').length,
      gluten_free: plan.guests.filter(g => g.dietaryPreference === 'gluten_free').length,
      jain_halal: plan.guests.filter(g => g.dietaryPreference === 'jain_halal').length,
    };

    const allergies = plan.guests.flatMap(g => g.allergies).filter(Boolean);
    const accessibilityNeeds = plan.guests.flatMap(g => g.accessibilityNeeds).filter(Boolean);

    return {
      total,
      confirmed,
      pending,
      declined,
      dietaryCounts,
      allergies,
      accessibilityNeeds
    };
  }, [plan.guests]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Module Banner */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-700/60">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Grounded Creative Synthesis</span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-brand-400" /> Personalized Ideas Studio, RSVP & Accessibility Matrix
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Curate cultural themes, custom culinary concepts, and zero-waste cost savings tailored to {plan.vertical} celebrations. Add any idea directly to your live budget and task checklist in 1 click.
            </p>
          </div>

          {/* Ideas Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'palette', label: 'Color & Theme 🎨', icon: Palette },
              { id: 'culinary', label: 'Culinary & Mocktails 🍹', icon: UtensilsCrossed },
              { id: 'rituals', label: 'Rituals & Engagement ✨', icon: HeartHandshake },
              { id: 'eco_cost_saving', label: 'Eco Swaps (15% Cut) 🌿', icon: Leaf },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeCategory === cat.id
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Ideas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredIdeas.map(idea => (
            <div
              key={idea.id}
              className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4 hover:border-slate-600 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-bold text-white">{idea.title}</h3>
                  <span className={`text-xs font-black px-2.5 py-1 rounded-xl shrink-0 ${
                    idea.estimatedCostImpact < 0
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : idea.estimatedCostImpact === 0
                      ? 'bg-slate-800 text-slate-300'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {idea.estimatedCostImpact < 0 ? `Saves ${formatCurrency(Math.abs(idea.estimatedCostImpact), currency)}` : idea.estimatedCostImpact === 0 ? 'Zero Surcharge' : `+${formatCurrency(idea.estimatedCostImpact, currency)}`}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{idea.description}</p>

                {/* Hex Color Swatches for Palette Studio */}
                {idea.swatches && idea.swatches.length > 0 && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold mr-1">Palette:</span>
                    {idea.swatches.map((hex, sIdx) => (
                      <div
                        key={sIdx}
                        className="w-8 h-8 rounded-xl shadow-md border border-white/20 flex items-center justify-center text-[9px] font-mono font-bold text-white drop-shadow"
                        style={{ backgroundColor: hex }}
                        title={`Color: ${hex}`}
                      >
                        {hex.slice(1, 4)}
                      </div>
                    ))}
                  </div>
                )}

                {/* Tags */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {idea.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* 1-Click Add to Live Plan Button */}
              <div className="pt-3 border-t border-slate-800 flex justify-end">
                {idea.isAddedToPlan ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 py-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Added to Live Plan & Budget
                  </span>
                ) : (
                  <button
                    onClick={() => addCreativeIdeaToPlan(idea.id)}
                    className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Budget & Checklist</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guest Dietary, Allergy & Accessibility Hub */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Accessibility className="w-5 h-5 text-brand-400" /> Guest Dietary, Allergy & Accessibility Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Synced directly with Catering RFP briefs and Venue accessibility seating arrangements
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-slate-900 text-slate-300 font-mono">
            {guestStats.confirmed} Confirmed / {guestStats.total} Logged
          </span>
        </div>

        {/* 3 Metric Hub Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Dietary Preferences */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/50 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <UtensilsCrossed className="w-4 h-4 text-emerald-400" /> Dietary Preferences
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Traditional / Regular:</span>
                <span className="font-bold text-white">{guestStats.dietaryCounts.regular}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Pure Vegetarian:</span>
                <span className="font-bold text-emerald-400">{guestStats.dietaryCounts.vegetarian}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Vegan:</span>
                <span className="font-bold text-emerald-400">{guestStats.dietaryCounts.vegan}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Gluten-Free:</span>
                <span className="font-bold text-amber-400">{guestStats.dietaryCounts.gluten_free}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Jain / Halal:</span>
                <span className="font-bold text-blue-400">{guestStats.dietaryCounts.jain_halal}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Severe Allergy Alerts */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/50 space-y-3">
            <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" /> Severe Allergy Protocols
            </h4>
            <div className="space-y-2">
              {guestStats.allergies.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No severe allergies registered.</p>
              ) : (
                guestStats.allergies.map((allergy, aIdx) => (
                  <div key={aIdx} className="bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl text-xs text-rose-200 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                    <span>{allergy}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 3: Physical & Sensory Accessibility */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/50 space-y-3">
            <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
              <Accessibility className="w-4 h-4 text-blue-400" /> Accessibility Allocations
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 p-2 rounded-xl text-blue-200">
                <span>♿ Wheelchair Ramp & Seating Reserved</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 p-2 rounded-xl text-blue-200">
                <span>🔇 Quiet Sensory / Lactation Space</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 p-2 rounded-xl text-blue-200">
                <span>👵 Elderly Front-Row Priority Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
