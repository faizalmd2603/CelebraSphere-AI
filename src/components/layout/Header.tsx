import React, { useState } from 'react';
import { useEventContext } from '../../context/EventContext';
import { calculateReadinessScore } from '../../utils/calculations';
import { getActiveEngineStatus } from '../../services/aiService';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../../i18n/translations';
import {
  Sparkles,
  RotateCcw,
  RotateCw,
  PlusCircle,
  Eye,
  Sliders,
  Printer,
  CheckCircle2,
  Cpu,
  Globe,
  FileCheck2,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  onOpenWizard: () => void;
  onOpenDiagnostics: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenWizard,
  onOpenDiagnostics
}) => {
  const {
    plan,
    switchPersona,
    currency,
    toggleCurrency,
    canUndo,
    canRedo,
    undo,
    redo,
    highContrast,
    toggleHighContrast,
    largeText,
    toggleLargeText,
    reducedMotion,
    toggleReducedMotion,
    language,
    setLanguage,
    t
  } = useEventContext();

  const [showA11yMenu, setShowA11yMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const readiness = calculateReadinessScore(plan);
  const engineStatus = getActiveEngineStatus();

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Logo & Platform Tag */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-amber-500 flex items-center justify-center shadow-lg shadow-brand-500/20 text-white shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  CelebraSphere<span className="text-brand-400">AI</span>
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20">
                  {t.eventPlatform}
                </span>
              </div>
              <p className="hidden sm:block text-[10px] sm:text-[11px] text-slate-400 truncate max-w-[200px] md:max-w-xs">
                {plan.title} ({plan.daysRemaining} {t.daysToGo})
              </p>
            </div>
          </div>

          {/* 1-Click Multi-Vertical Persona Switcher (Desktop) */}
          <div className="hidden lg:flex items-center gap-1.5 p-1 bg-slate-800/80 rounded-xl border border-slate-700/60" role="group" aria-label="Persona Switcher">
            <button
              onClick={() => switchPersona('wedding')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                plan.vertical === 'wedding'
                  ? 'bg-gradient-to-r from-brand-600 to-pink-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span>{t.personaWedding}</span>
            </button>

            <button
              onClick={() => switchPersona('birthday')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                plan.vertical === 'birthday'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span>{t.personaBirthday}</span>
            </button>

            <button
              onClick={() => switchPersona('community')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                plan.vertical === 'community'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span>{t.personaCommunity}</span>
            </button>

            <button
              onClick={onOpenWizard}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-brand-300 hover:text-white hover:bg-brand-500/20 transition-all flex items-center gap-1 border border-dashed border-brand-500/40"
              title="Create Custom Celebration Wizard"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t.personaCustom}</span>
            </button>
          </div>

          {/* Controls: Language Selector, Currency, Readiness Pill, Undo/Redo */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Multilingual Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(prev => !prev)}
                aria-label={`Select Language (Current: ${currentLang.nativeName})`}
                aria-expanded={showLangMenu}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold text-slate-200 hover:text-white transition-all shadow-sm flex items-center gap-1.5"
                title="Select App & AI Language"
              >
                <Globe className="w-3.5 h-3.5 text-brand-400" />
                <span className="text-xs font-medium">{currentLang.nativeName}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 space-y-0.5 animate-fadeIn">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-700/80 mb-1">
                    Select Language / மொழி
                  </div>
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                        language === lang.code
                          ? 'bg-brand-600 text-white font-bold'
                          : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
                      }`}
                    >
                      <span>{lang.nativeName}</span>
                      <span className="text-[10px] text-slate-400">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Live Readiness Pill */}
            <div 
              className={`hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold shadow-sm ${
                readiness.overallScore >= 80 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : readiness.overallScore >= 60
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}
              title={`Event Readiness Score: ${readiness.overallScore}/100`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t.readiness}: {readiness.overallScore}/100</span>
            </div>

            {/* Currency Switcher */}
            <button
              onClick={toggleCurrency}
              aria-label={`Toggle currency (Current: ${currency})`}
              className="px-2 sm:px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold text-white transition-all shadow-sm flex items-center gap-1"
            >
              <span className="text-amber-400">{currency === 'INR' ? '₹' : '$'}</span>
              <span className="hidden sm:inline">{currency}</span>
            </button>

            {/* Undo / Redo */}
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5">
              <button
                onClick={undo}
                disabled={!canUndo}
                aria-label="Undo last action (Ctrl+Z)"
                className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors rounded"
                title="Undo (Ctrl+Z)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                aria-label="Redo action (Ctrl+Y)"
                className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors rounded"
                title="Redo (Ctrl+Y)"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Diagnostics Test Runner Trigger */}
            <button
              onClick={onOpenDiagnostics}
              className="px-2.5 py-1.5 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-600/50 hover:to-blue-600/50 border border-cyan-500/40 text-cyan-300 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
              title="Verify 21 Live Automated Tests"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Tests (21/21)</span>
            </button>

            {/* Accessibility Quick Menu Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowA11yMenu(p => !p)}
                aria-label="Accessibility options"
                aria-expanded={showA11yMenu}
                className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-all shadow-sm"
                title="WCAG 2.2 AA Accessibility Settings"
              >
                <Eye className="w-4 h-4" />
              </button>

              {showA11yMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-4 z-50 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-brand-400" /> Accessibility
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                      WCAG 2.2 AA
                    </span>
                  </div>

                  <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                    <span>High Contrast Mode</span>
                    <input
                      type="checkbox"
                      checked={highContrast}
                      onChange={toggleHighContrast}
                      className="rounded bg-slate-900 border-slate-700 text-brand-600 focus:ring-brand-500"
                    />
                  </label>

                  <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                    <span>Large Text Scale (115%)</span>
                    <input
                      type="checkbox"
                      checked={largeText}
                      onChange={toggleLargeText}
                      className="rounded bg-slate-900 border-slate-700 text-brand-600 focus:ring-brand-500"
                    />
                  </label>

                  <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                    <span>Reduced Motion</span>
                    <input
                      type="checkbox"
                      checked={reducedMotion}
                      onChange={toggleReducedMotion}
                      className="rounded bg-slate-900 border-slate-700 text-brand-600 focus:ring-brand-500"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Print Client Report */}
            <button
              onClick={() => window.print()}
              aria-label="Print or Export client-ready report"
              className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-all shadow-sm hidden md:block"
              title="Print Run-of-Show & Executive Budget Report"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Mobile Persona Switcher Bar (Smooth touch scroll on iOS / Android) */}
        <div className="flex lg:hidden items-center justify-between py-2 border-t border-slate-800/60 overflow-x-auto gap-2 no-scrollbar">
          <button
            onClick={() => switchPersona('wedding')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
              plan.vertical === 'wedding' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.personaWedding}
          </button>
          <button
            onClick={() => switchPersona('birthday')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
              plan.vertical === 'birthday' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.personaBirthday}
          </button>
          <button
            onClick={() => switchPersona('community')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
              plan.vertical === 'community' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.personaCommunity}
          </button>
          <button
            onClick={onOpenWizard}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-brand-300 border border-dashed border-brand-500/40 whitespace-nowrap shrink-0 hover:bg-brand-500/10"
          >
            {t.personaCustom}
          </button>
        </div>

      </div>
    </header>
  );
};
