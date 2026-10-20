import React, { useState } from 'react';
import { useEventContext } from './context/EventContext';
import { SkipLink } from './components/layout/SkipLink';
import { Header } from './components/layout/Header';
import { TabNav } from './components/layout/TabNav';
import { DashboardModule } from './components/dashboard/DashboardModule';
import { BudgetModule } from './components/budget/BudgetModule';
import { TimelineModule } from './components/timeline/TimelineModule';
import { VendorsModule } from './components/vendors/VendorsModule';
import { IdeasStudioModule } from './components/ideas/IdeasStudioModule';
import { AICopilotDrawer } from './components/copilot/AICopilotDrawer';
import { CustomEventWizard } from './components/modals/CustomEventWizard';
import { DiagnosticsModal } from './components/modals/DiagnosticsModal';
import { Sparkles, Heart } from 'lucide-react';

export const AppContent: React.FC = () => {
  const { activeTab, setActiveTab } = useEventContext();
  const [copilotOpen, setCopilotOpen] = useState<boolean>(false);
  const [wizardOpen, setWizardOpen] = useState<boolean>(false);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      <SkipLink />

      {/* Header */}
      <Header
        onOpenWizard={() => setWizardOpen(true)}
        onOpenDiagnostics={() => setDiagnosticsOpen(true)}
      />

      {/* Primary Tab Navigation */}
      <TabNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onToggleCopilot={() => setCopilotOpen(p => !p)}
        copilotOpen={copilotOpen}
      />

      {/* Main Content Area */}
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-none">
        {activeTab === 'dashboard' && <DashboardModule />}
        {activeTab === 'budget' && <BudgetModule />}
        {activeTab === 'timeline' && <TimelineModule />}
        {activeTab === 'vendors' && <VendorsModule />}
        {activeTab === 'ideas' && <IdeasStudioModule />}
      </main>

      {/* Modals & Drawers */}
      <AICopilotDrawer
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
      />

      <CustomEventWizard
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
      />

      <DiagnosticsModal
        isOpen={diagnosticsOpen}
        onClose={() => setDiagnosticsOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/80 py-6 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">CelebraSphere AI</span>
            <span>&bull;</span>
            <span>Intelligent Celebration & Event Operations Platform</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>by Mohammed Faizal M</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppContent;
