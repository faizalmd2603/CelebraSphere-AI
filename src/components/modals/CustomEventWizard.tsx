import React, { useState } from 'react';
import { useEventContext } from '../../context/EventContext';
import { EventPlan, VerticalPersona, Currency, CostType } from '../../types/event';
import {
  Sparkles,
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Users,
  DollarSign,
  Award
} from 'lucide-react';

interface CustomEventWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomEventWizard: React.FC<CustomEventWizardProps> = ({
  isOpen,
  onClose
}) => {
  const { createCustomPlan } = useEventContext();

  const [step, setStep] = useState<number>(1);

  // Step 1: Basics
  const [vertical, setVertical] = useState<VerticalPersona>('wedding');
  const [title, setTitle] = useState<string>('Grand Horizon Celebration 2026');
  const [eventDate, setEventDate] = useState<string>('2026-11-28');
  const [venueName, setVenueName] = useState<string>('Ocean Vista Grand Pavilion');
  const [venueType, setVenueType] = useState<'indoor' | 'outdoor' | 'hybrid'>('hybrid');

  // Step 2: Guests & Inclusivity
  const [guestCount, setGuestCount] = useState<number>(150);
  const [hasWheelchair, setHasWheelchair] = useState<boolean>(true);
  const [hasQuietSpace, setHasQuietSpace] = useState<boolean>(true);

  // Step 3: Financials
  const [currency, setCurrency] = useState<Currency>('INR');
  const [totalBudget, setTotalBudget] = useState<number>(1200000);
  const [contingencyPercentage, setContingencyPercentage] = useState<number>(10);

  // Step 4: Priorities
  const [selectedPillars, setSelectedPillars] = useState<string[]>([
    'Culinary Excellence & Traditional Service',
    'Immersive Lighting & Floral Architecture'
  ]);

  if (!isOpen) return null;

  const priorityOptions = [
    'Culinary Excellence & Traditional Service',
    'Immersive Lighting & Floral Architecture',
    'High-Energy Live Band & Acoustic Entertainment',
    'Zero-Waste Eco Sustainability & Seed Favors',
    'Universal Physical & Sensory Accessibility',
    'Strict Cost Control & Contingency Preservation'
  ];

  const togglePillar = (pillar: string) => {
    if (selectedPillars.includes(pillar)) {
      setSelectedPillars(selectedPillars.filter(p => p !== pillar));
    } else {
      if (selectedPillars.length < 2) {
        setSelectedPillars([...selectedPillars, pillar]);
      } else {
        setSelectedPillars([selectedPillars[1]!, pillar]);
      }
    }
  };

  const handleGeneratePlan = () => {
    const contingencyAmount = Math.round(totalBudget * (contingencyPercentage / 100));
    const netSpendable = totalBudget - contingencyAmount;

    // Dynamically calculate category breakdown based on chosen vertical and priorities
    const categories = [
      { id: 'cat-w-1', name: 'Venue & Infrastructure', allocatedPercentage: 28, allocatedAmount: Math.round(netSpendable * 0.28), spentAmount: Math.round(netSpendable * 0.28), color: '#3b82f6' },
      { id: 'cat-w-2', name: 'Catering & Dining', allocatedPercentage: 32, allocatedAmount: Math.round(netSpendable * 0.32), spentAmount: Math.round(netSpendable * 0.30), color: '#10b981' },
      { id: 'cat-w-3', name: 'Decor & Production', allocatedPercentage: 20, allocatedAmount: Math.round(netSpendable * 0.20), spentAmount: Math.round(netSpendable * 0.18), color: '#ec4899' },
      { id: 'cat-w-4', name: 'Photography & Cinema', allocatedPercentage: 12, allocatedAmount: Math.round(netSpendable * 0.12), spentAmount: Math.round(netSpendable * 0.12), color: '#8b5cf6' },
      { id: 'cat-w-5', name: 'Entertainment & AV', allocatedPercentage: 8, allocatedAmount: Math.round(netSpendable * 0.08), spentAmount: Math.round(netSpendable * 0.07), color: '#f59e0b' },
      { id: 'cat-w-6', name: 'Emergency Contingency Reserve', allocatedPercentage: contingencyPercentage, allocatedAmount: contingencyAmount, spentAmount: 0, color: '#64748b' }
    ];

    const perGuestCateringCost = Math.round((netSpendable * 0.32) / Math.max(1, guestCount));

    const newPlan: EventPlan = {
      id: `custom-event-${Date.now()}`,
      title,
      vertical,
      eventDate,
      daysRemaining: 38,
      venueName,
      venueType,
      guestCount,
      currency,
      totalBudget,
      contingencyPercentage,
      priorityPillars: [selectedPillars[0] || 'Culinary Excellence', selectedPillars[1] || 'Immersive Decor'],
      budgetPriorityMode: 'balanced',
      categories,
      budgetItems: [
        {
          id: 'bi-1',
          name: `${venueName} Primary Booking Package`,
          category: 'Venue & Infrastructure',
          costType: 'fixed',
          unitCost: Math.round(netSpendable * 0.28),
          quantity: 1,
          estimatedAmount: Math.round(netSpendable * 0.28),
          actualAmount: Math.round(netSpendable * 0.28),
          paidAmount: Math.round(netSpendable * 0.14),
          notes: '50% advance confirmed'
        },
        {
          id: 'bi-2',
          name: 'Celebration Banquet Feast & Beverages (Per Guest)',
          category: 'Catering & Dining',
          costType: 'variable',
          unitCost: perGuestCateringCost,
          quantity: guestCount,
          estimatedAmount: perGuestCateringCost * guestCount,
          actualAmount: perGuestCateringCost * guestCount,
          paidAmount: Math.round(perGuestCateringCost * guestCount * 0.4),
          notes: 'Includes dietary options'
        },
        {
          id: 'bi-3',
          name: 'Custom Theme Floral Architecture & Lighting',
          category: 'Decor & Production',
          costType: 'fixed',
          unitCost: Math.round(netSpendable * 0.20),
          quantity: 1,
          estimatedAmount: Math.round(netSpendable * 0.20),
          actualAmount: Math.round(netSpendable * 0.18),
          paidAmount: Math.round(netSpendable * 0.10)
        }
      ],
      checklistTasks: [
        {
          id: 'ct-1',
          title: `Confirm layout & seating chart for ${guestCount} guests at ${venueName}`,
          category: 'Venue & Logistics',
          planningWindow: '1m_out',
          priority: 'critical',
          dueDate: eventDate,
          completed: true,
          owner: 'Operations Lead'
        },
        {
          id: 'ct-2',
          title: 'Finalize catering tasting and dietary restrictions list',
          category: 'Catering',
          planningWindow: '1m_out',
          priority: 'high',
          dueDate: eventDate,
          completed: false,
          owner: 'Culinary Lead'
        },
        {
          id: 'ct-3',
          title: 'Audit sound permits and event insurance certificates',
          category: 'Compliance',
          planningWindow: '1w_out',
          priority: 'critical',
          dueDate: eventDate,
          completed: false,
          owner: 'Legal & Permits Lead'
        }
      ],
      runOfShow: [
        {
          id: 'ros-c1',
          startTime: '10:00',
          endTime: '11:30',
          durationMinutes: 90,
          title: 'Guest Arrival, Welcome Mocktails & Red Carpet Photo Session',
          description: 'Acoustic background tunes and guest seating into main pavilion.',
          zone: 'Welcome Terrace',
          isOutdoor: venueType !== 'indoor',
          owner: 'Ushers & Hospitality',
          bufferMinutes: 15,
          isLockedAnchor: false,
          dependencies: []
        },
        {
          id: 'ros-c2',
          startTime: '11:45',
          endTime: '13:00',
          durationMinutes: 75,
          title: 'Main Ceremonial Assembly & Keynote Addresses',
          description: 'Heartfelt speeches, milestone recognition, and special rituals.',
          zone: 'Grand Pavilion Stage',
          isOutdoor: false,
          owner: 'Lead Emcee',
          bufferMinutes: 15,
          isLockedAnchor: true, // FIXED LOCKED ANCHOR
          dependencies: ['ros-c1']
        },
        {
          id: 'ros-c3',
          startTime: '13:15',
          endTime: '15:15',
          durationMinutes: 120,
          title: 'Grand Celebratory Banquet Dining Service',
          description: 'Multi-course culinary feast with dedicated allergen-free food station.',
          zone: 'Dining Hall',
          isOutdoor: false,
          owner: 'Master Chef & Service Crew',
          bufferMinutes: 20,
          isLockedAnchor: true, // FIXED ANCHOR
          dependencies: ['ros-c2']
        }
      ],
      vendors: [
        {
          id: 'v-c1',
          name: venueName,
          category: 'Venue',
          status: 'contract_signed',
          contactPerson: 'Venue Operations Manager',
          contactEmail: 'events@venuepartner.com',
          contactPhone: '+91 98400 99999',
          quotedPrice: Math.round(netSpendable * 0.28),
          depositPaid: Math.round(netSpendable * 0.14),
          balanceDueDate: eventDate,
          isVerified: true,
          safetyChecklist: {
            portfolioVerified: true,
            writtenQuoteChecked: true,
            rainClauseChecked: true,
            depositMilestoneLogged: true
          },
          scoring: {
            budgetAlignment: { score: 95, notes: 'Matches 28% allocation ceiling' },
            stylePersonaFit: { score: 96, notes: 'Matches chosen theme' },
            reliabilityTrackRecord: { score: 94, notes: 'Verified safety certification' },
            contractFlexibility: { score: 90, notes: 'Weather contingency clause verified' }
          },
          compositeScore: 94
        }
      ],
      guests: [
        {
          id: 'g-custom-1',
          name: 'Honored Family / VIP Group',
          group: 'VIP',
          rsvpStatus: 'confirmed',
          email: 'family.vip@celebration.org',
          phone: '+91 98401 00001',
          dietaryPreference: 'vegetarian',
          allergies: ['Peanut Allergy'],
          accessibilityNeeds: hasWheelchair ? ['wheelchair', 'ramp'] : [],
          notes: 'Reserved front-row seating.'
        }
      ],
      creativeIdeas: [
        {
          id: 'idea-custom-1',
          category: 'palette',
          title: 'Grand Emerald & Horizon Gold Palette',
          description: 'Deep forest emerald, metallic champagne gold, ivory linen, and subtle slate accents.',
          tags: ['Refined', 'Modern SaaS', 'High Contrast'],
          estimatedCostImpact: 0,
          swatches: ['#065f46', '#d97706', '#fef3c7', '#1e293b'],
          isAddedToPlan: true
        }
      ],
      recentAudits: [
        {
          id: 'audit-custom-init',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          scenarioName: 'Custom Celebration Plan Generated via Wizard',
          whatChanged: [`Generated ${title} with ${guestCount} guests`, `Allocated ${currency} ${totalBudget.toLocaleString()} ceiling`],
          assumptionsMade: [`Maintained ${contingencyPercentage}% contingency reserve`, 'Fixed vs variable cost ratios applied'],
          needsHumanConfirmation: ['Finalize catering and decor contracts']
        }
      ]
    };

    createCustomPlan(newPlan);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6">
        
        {/* Wizard Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Create Custom Celebration Wizard</h2>
              <span className="text-[11px] text-brand-400 font-mono">Step {step} of 4</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Basics */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Celebration Vertical</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'wedding', label: '💍 Wedding' },
                  { id: 'birthday', label: '🎂 Birthday' },
                  { id: 'community', label: '🎪 Community' },
                ].map(v => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVertical(v.id as any)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      vertical === v.id
                        ? 'bg-brand-600 text-white border-brand-500 shadow'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Event Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Event Date</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={e => setEventDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Setting</label>
                <select
                  value={venueType}
                  onChange={e => setVenueType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-brand-500"
                >
                  <option value="indoor">Indoor Hall / Ballroom</option>
                  <option value="outdoor">Outdoor Lawn / Rooftop</option>
                  <option value="hybrid">Hybrid (Indoor + Lawn)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Venue Name / Location</label>
              <input
                type="text"
                value={venueName}
                onChange={e => setVenueName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        )}

        {/* Step 2: Guests & Inclusivity */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300">Expected Headcount</label>
                <span className="text-xs font-black text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded">
                  {guestCount} Guests
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="600"
                step="10"
                value={guestCount}
                onChange={e => setGuestCount(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
            </div>

            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Inclusivity & Accessibility Provisions
              </span>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasWheelchair}
                  onChange={e => setHasWheelchair(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-brand-600 focus:ring-brand-500"
                />
                <span>Include Wheelchair Ramp & Priority Seating</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasQuietSpace}
                  onChange={e => setHasQuietSpace(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-brand-600 focus:ring-brand-500"
                />
                <span>Reserve Quiet Sensory & Lactation Suite</span>
              </label>
            </div>
          </div>
        )}

        {/* Step 3: Financials */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Currency</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrency('INR')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border ${currency === 'INR' ? 'bg-brand-600 text-white border-brand-500' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                  >
                    ₹ INR
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency('USD')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border ${currency === 'USD' ? 'bg-brand-600 text-white border-brand-500' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                  >
                    $ USD
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Contingency Reserve %</label>
                <select
                  value={contingencyPercentage}
                  onChange={e => setContingencyPercentage(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-brand-500"
                >
                  <option value={8}>8% (Tight Buffer)</option>
                  <option value={10}>10% (Recommended)</option>
                  <option value={15}>15% (Conservative)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Total Budget Ceiling ({currency})</label>
              <input
                type="number"
                min="5000"
                step="5000"
                value={totalBudget}
                onChange={e => setTotalBudget(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        )}

        {/* Step 4: Priority Pillars */}
        {step === 4 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Select Top 2 Priority Pillars (Currently: {selectedPillars.length}/2)
              </label>
              <div className="space-y-2">
                {priorityOptions.map((pillar, idx) => {
                  const isSelected = selectedPillars.includes(pillar);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => togglePillar(pillar)}
                      className={`w-full p-2.5 rounded-xl text-xs text-left border flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-brand-600/30 border-brand-500 text-white font-bold'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{pillar}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {step > 1 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
            >
              Next Step <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleGeneratePlan}
              className="px-5 py-2.5 bg-gradient-to-r from-brand-600 via-pink-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-500/25 animate-pulse"
            >
              <Sparkles className="w-4 h-4" /> Generate Celebration Workspace
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
