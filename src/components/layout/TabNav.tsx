import React from 'react';
import {
  LayoutDashboard,
  Wallet,
  Clock,
  Store,
  Sparkles,
  Bot
} from 'lucide-react';

interface TabNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onToggleCopilot: () => void;
  copilotOpen: boolean;
}

export const TabNav: React.FC<TabNavProps> = ({
  activeTab,
  onSelectTab,
  onToggleCopilot,
  copilotOpen
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Command Dashboard', icon: LayoutDashboard },
    { id: 'budget', label: 'Predictive Budget', icon: Wallet },
    { id: 'timeline', label: 'Timeline & Disruption Simulator', icon: Clock },
    { id: 'vendors', label: 'Vendor Pipeline & Matrix', icon: Store },
    { id: 'ideas', label: 'Ideas Studio & RSVP', icon: Sparkles },
  ];

  return (
    <nav className="bg-slate-900/60 border-b border-slate-800 px-4 sm:px-6 lg:px-8 print:hidden" aria-label="Main Navigation Tabs">
      <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto gap-2">
        <div className="flex items-center space-x-1 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-brand-400 ${
                  isActive
                    ? 'bg-slate-800 text-brand-400 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* AI Co-Pilot Toggle Button */}
        <button
          onClick={onToggleCopilot}
          aria-expanded={copilotOpen}
          aria-label="Toggle Grounded AI Co-Pilot Assistant"
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shrink-0 border ${
            copilotOpen
              ? 'bg-brand-600 text-white border-brand-500 shadow-brand-500/25 ring-2 ring-brand-400'
              : 'bg-gradient-to-r from-purple-900/80 to-brand-900/80 text-brand-300 border-brand-500/30 hover:border-brand-500/60 hover:text-white'
          }`}
        >
          <Bot className="w-4 h-4 text-brand-300 animate-pulse" />
          <span>AI Co-Pilot</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </button>
      </div>
    </nav>
  );
};
