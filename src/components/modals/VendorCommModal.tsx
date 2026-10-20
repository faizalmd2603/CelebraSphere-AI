import React, { useState } from 'react';
import { Vendor, EventPlan } from '../../types/event';
import { formatCurrency } from '../../utils/calculations';
import { Mail, Copy, Check, X, Sparkles } from 'lucide-react';

interface VendorCommModalProps {
  vendor: Vendor;
  plan: EventPlan;
  initialType: 'rfp' | 'negotiation' | 'arrival';
  onClose: () => void;
}

export const VendorCommModal: React.FC<VendorCommModalProps> = ({
  vendor,
  plan,
  initialType,
  onClose
}) => {
  const [commType, setCommType] = useState<'rfp' | 'negotiation' | 'arrival'>(initialType);
  const [copied, setCopied] = useState<boolean>(false);

  // Compute dietary counts to ground the communications
  const severeAllergies = plan.guests.flatMap(g => g.allergies).filter(Boolean);
  const vegCount = plan.guests.filter(g => g.dietaryPreference === 'vegetarian').length;

  // Generate grounded template
  const generateMessage = () => {
    if (commType === 'rfp') {
      return `Subject: Request for Proposal: ${plan.title} on ${plan.eventDate}

Dear ${vendor.contactPerson || vendor.name} Team,

We are organizing "${plan.title}" scheduled for ${plan.eventDate} at ${plan.venueName}. Based on your exceptional portfolio, we would love to review your formal proposal and package availability for our celebration.

KEY CELEBRATION DETAILS:
- Event: ${plan.title} (${plan.vertical.toUpperCase()} Celebration)
- Confirmed Date: ${plan.eventDate}
- Venue & Layout: ${plan.venueName} (${plan.venueType.toUpperCase()} Setting)
- Estimated Headcount: ${plan.guestCount} Attendees (${vegCount} Vegetarian guests)
- Target Category Budget Ceiling: ${formatCurrency(vendor.quotedPrice, plan.currency)}

Could you please share:
1. Itemized quotation including all applicable setup, transportation, and taxes.
2. Written confirmation of your cancellation & weather contingency / rain backup policy.
3. Payment milestone schedule (Advance deposit % vs final balance date).

We look forward to partnering with your team!

Warm regards,
Organizing Lead for ${plan.title}
Phone: [Your Phone] | Email: [Your Email]`;
    }

    if (commType === 'negotiation') {
      const targetOffer = Math.round(vendor.quotedPrice * 0.90);
      return `Subject: Partnership Proposal & Budget Alignment for ${plan.title}

Dear ${vendor.contactPerson || vendor.name},

Thank you very much for your detailed quote for ${plan.title}. We are deeply impressed with your team's craftsmanship and style fit for our ${plan.vertical} celebration.

As we review our comprehensive operational allocations across our ${plan.guestCount} guests, our allocated ceiling for ${vendor.category} is strictly capped at ${formatCurrency(targetOffer, plan.currency)}.

We would love to finalize a contract with you immediately if you could consider adjusting the package to ${formatCurrency(targetOffer, plan.currency)}, or by bundling complimentary setup/transportation within this figure.

Please let us know if this works for your team so we can initiate the contract and release the booking deposit milestone today.

Warm regards,
Organizing Committee, ${plan.title}`;
    }

    // Day-of Arrival
    return `Subject: Day-of Event Dispatch & Arrival Logistics: ${plan.title} (${plan.eventDate})

Dear ${vendor.contactPerson || vendor.name},

We are excited to work with you on ${plan.eventDate} for "${plan.title}" at ${plan.venueName}!

DAY-OF LOGISTICS RIDER:
- Venue Arrival & Setup Window: Access granted from 06:30 AM onwards.
- Assigned Zone: ${plan.runOfShow[0]?.zone || 'Main Celebration Pavilion'}
- Total Confirmed Headcount: ${plan.guestCount} Guests
${severeAllergies.length > 0 ? `- CRITICAL DIETARY NOTE: Strict allergy protocols required for: ${severeAllergies.slice(0, 3).join(', ')}.\n` : ''}- In-House Logistics Coordinator: Reachable on-site at [Venue Coordinator Contact].

Please reply to confirm your lead technician/driver's name and estimated arrival time.

Warm regards,
Event Operations Command, ${plan.title}`;
  };

  const currentMessage = generateMessage();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-700 pb-3">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-brand-400" />
            <h3 className="text-base font-bold text-white">
              Vendor Communication Dispatcher: {vendor.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Type Tabs */}
        <div className="flex items-center gap-2">
          {[
            { id: 'rfp', label: '1. Initial RFP Brief' },
            { id: 'negotiation', label: '2. Polite Budget Negotiation' },
            { id: 'arrival', label: '3. Day-Of Arrival Logistics' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setCommType(t.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                commType === t.id
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Message Preview */}
        <div className="relative">
          <textarea
            readOnly
            rows={14}
            value={currentMessage}
            className="w-full bg-slate-900/90 border border-slate-700 rounded-2xl p-4 text-xs font-mono text-slate-200 leading-relaxed focus:outline-none select-all"
          />
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-bold text-white shadow flex items-center gap-1.5 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Template'}</span>
          </button>
        </div>

        <div className="flex justify-between items-center pt-2">
          <span className="text-[11px] text-slate-400 italic">
            Automatically grounded with active event headcount, date, venue, and allergy records.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
