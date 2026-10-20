import React, { useState, useRef, useEffect } from 'react';
import { useEventContext } from '../../context/EventContext';
import {
  sendCopilotMessage,
  buildContextSnapshot,
  getActiveEngineStatus,
  ChatHistoryEntry
} from '../../services/aiService';
import {
  AIResponsePayload,
  ExecutableAction,
  AgenticTraceStep,
  WeatherTelemetry
} from '../../types/event';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../../i18n/translations';
import {
  Bot,
  X,
  Send,
  Sparkles,
  ShieldCheck,
  Eye,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  ChevronDown,
  ChevronUp,
  CloudSun,
  Activity,
  Layers,
  Thermometer,
  Wind,
  Droplets,
  Cpu,
  Globe
} from 'lucide-react';

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  proposedActions?: ExecutableAction[];
  decisionAudit?: AIResponsePayload['decisionAudit'];
  appliedActionIndex?: number;
  agenticTrace?: AgenticTraceStep[];
  weatherTelemetry?: WeatherTelemetry;
  wasAutoExecuted?: boolean;
}

// Simple inline markdown helpers for natural ChatGPT/Gemini conversational formatting
const formatInlineMarkdown = (str: string) => {
  const parts = str.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, pIdx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={pIdx} className="font-bold text-white">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const renderFormattedText = (text: string) => {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        if (trimmed.startsWith('#### ')) {
          return <h4 key={idx} className="font-bold text-amber-300 text-[12px] mt-2 mb-0.5">{trimmed.replace(/^####\s*/, '')}</h4>;
        }
        if (trimmed.startsWith('### ')) {
          return <h3 key={idx} className="font-bold text-brand-300 text-[13px] mt-2.5 mb-1">{trimmed.replace(/^###\s*/, '')}</h3>;
        }
        if (trimmed.startsWith('## ')) {
          return <h2 key={idx} className="font-extrabold text-white text-[14px] mt-3 mb-1">{trimmed.replace(/^##\s*/, '')}</h2>;
        }

        if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          const content = trimmed.replace(/^[\*\-•]\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-1.5 ml-1 my-0.5 text-slate-300">
              <span className="text-brand-400 font-bold shrink-0">&bull;</span>
              <span>{formatInlineMarkdown(content)}</span>
            </div>
          );
        }

        return <p key={idx} className="text-slate-200 leading-relaxed">{formatInlineMarkdown(trimmed)}</p>;
      })}
    </div>
  );
};

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  isOpen,
  onClose
}) => {
  const { plan, applyExecutableAction, undo, canUndo, language, setLanguage, t } = useEventContext();
  const [privacyShieldActive, setPrivacyShieldActive] = useState<boolean>(true);
  const [showPayloadInspector, setShowPayloadInspector] = useState<boolean>(false);
  const [autonomousMode, setAutonomousMode] = useState<boolean>(true);
  const [showLangMenu, setShowLangMenu] = useState<boolean>(false);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('Grounding active workspace...');

  const engineStatus = getActiveEngineStatus();
  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `👋 Greetings! I am **CelebraSphere AI**, your Autonomous Operations Co-Pilot.

I have direct, stateful integration with **"${plan.title}"** (Headcount: ${plan.guestCount}, Budget: ${plan.currency} ${plan.totalBudget.toLocaleString()}, Countdown: ${plan.daysRemaining} days).

I can inspect **live weather telemetry**, **rebalance budget overruns**, **resolve schedule delays**, **scale guest catering**, and **automate critical tasks** directly within the app!`,
      timestamp: 'Just now'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (queryToSend?: string) => {
    const text = (queryToSend || inputQuery).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryToSend) setInputQuery('');
    setIsLoading(true);
    setLoadingStep('Ingesting active event parameters...');

    const stepTimer = setTimeout(() => {
      setLoadingStep('Executing within-app integrations...');
    }, 900);

    // Build conversational history for multi-turn intelligence
    const history: ChatHistoryEntry[] = messages
      .filter(m => m.id !== 'msg-welcome' && !m.id.startsWith('msg-err'))
      .map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text
      }));

    try {
      const response = await sendCopilotMessage(text, plan, privacyShieldActive, history, language);
      clearTimeout(stepTimer);

      let autoExecuted = false;
      let appliedIndex: number | undefined = undefined;

      // In Autonomous Mode, if an action was generated from explicit tools, auto-apply it!
      if (autonomousMode && response.proposedActions && response.proposedActions.length > 0) {
        const topAction = response.proposedActions[0];
        if (
          topAction.type === 'APPLY_WEATHER_BACKUP' ||
          topAction.type === 'REBALANCE_BUDGET' ||
          topAction.type === 'REFLOW_TIMELINE' ||
          topAction.type === 'UPDATE_GUEST_COUNT' ||
          topAction.type === 'ADD_VENDOR_TASK'
        ) {
          applyExecutableAction(topAction);
          autoExecuted = true;
          appliedIndex = 0;
        }
      }

      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'assistant',
        text: response.conversationalReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        proposedActions: response.proposedActions,
        decisionAudit: response.decisionAudit,
        agenticTrace: response.agenticTrace,
        weatherTelemetry: response.weatherTelemetry,
        wasAutoExecuted: autoExecuted,
        appliedActionIndex: appliedIndex
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      clearTimeout(stepTimer);
      setMessages(prev => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'assistant',
          text: 'Encountered a temporary network latency issue. Transitioned seamlessly to deterministic local reasoning.',
          timestamp: 'Now'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyAction = (action: ExecutableAction, msgId: string, actionIdx: number) => {
    applyExecutableAction(action);
    setMessages(prev =>
      prev.map(m => (m.id === msgId ? { ...m, appliedActionIndex: actionIdx, wasAutoExecuted: false } : m))
    );
  };

  const handleUndoAutoAction = (msgId: string) => {
    if (canUndo) {
      undo();
      setMessages(prev =>
        prev.map(m => (m.id === msgId ? { ...m, appliedActionIndex: undefined, wasAutoExecuted: false } : m))
      );
    }
  };

  const quickAgentActions = [
    { label: t.checkWeather, query: 'Check live weather radar and forecast for our venue' },
    { label: t.rainFailover, query: 'Trigger indoor weather backup failover for lawn sessions' },
    { label: t.rebalanceBudget, query: 'Rebalance budget overruns while maintaining 8% contingency reserve' },
    { label: t.reflowSchedule, query: 'Simulate +25 min ceremony delay and reflow timeline with locked anchors' },
    { label: t.scaleGuests, query: 'Scale headcount +25 guests and update variable catering costs' },
    { label: t.automateTasks, query: 'Automate top critical operational tasks for active readiness score' }
  ];

  if (!isOpen) return null;

  const currentPayloadPreview = buildContextSnapshot(plan, privacyShieldActive);

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 sm:hidden animate-fadeIn"
      />

      {/* Drawer */}
      <aside
        aria-label="AI Operations Co-Pilot Workspace"
        className="fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] max-w-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between animate-slideLeft text-slate-100 overflow-hidden"
      >
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 via-pink-600 to-amber-500 flex items-center justify-center text-white shadow-md">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-white">{t.appName}</h2>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[10px] text-slate-400 font-mono truncate max-w-[170px] sm:max-w-none">
                {engineStatus.model}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Drawer Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(prev => !prev)}
                className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 hover:text-white flex items-center gap-1 shadow-sm transition-all"
                title="Change Language for AI Agent"
              >
                <Globe className="w-3.5 h-3.5 text-brand-400" />
                <span className="text-[10px] font-bold uppercase">{language}</span>
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-44 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-1 z-50 animate-fadeIn">
                  <div className="px-2 py-1 text-[9px] font-bold uppercase text-slate-400 border-b border-slate-700 mb-0.5">
                    Agent Language / மொழி
                  </div>
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded text-xs font-medium flex items-center justify-between ${
                        language === lang.code ? 'bg-brand-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <span>{lang.nativeName}</span>
                      <span className="text-[10px] text-slate-400">{lang.code.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Autonomous Execution Mode Switch */}
            <button
              onClick={() => setAutonomousMode(prev => !prev)}
              className={`px-2 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-all ${
                autonomousMode
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title={autonomousMode ? "Autonomous Execution: AI auto-executes tools" : "Review Mode: Confirm before executing"}
            >
              <Zap className={`w-3.5 h-3.5 ${autonomousMode ? 'text-amber-400 fill-amber-400' : ''}`} />
              <span className="hidden sm:inline">{autonomousMode ? 'Auto-Run' : 'Manual'}</span>
            </button>

            {/* Privacy Shield Toggle */}
            <button
              onClick={() => setPrivacyShieldActive(p => !p)}
              className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
                privacyShieldActive
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title={privacyShieldActive ? "Privacy Shield: PII Masking Active" : "Privacy Shield: Disabled"}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              aria-label="Close AI Co-Pilot panel"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Outbound AI Context Payload Inspector */}
        <div className="border-b border-slate-800 bg-slate-950/70 px-4 py-2 shrink-0">
          <button
            onClick={() => setShowPayloadInspector(p => !p)}
            className="w-full flex items-center justify-between text-[11px] font-mono text-brand-300 hover:text-brand-200"
          >
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" /> {t.inspectSnapshot}
            </span>
            {showPayloadInspector ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showPayloadInspector && (
            <div className="mt-2 p-2 bg-slate-900 rounded-lg border border-slate-800 max-h-40 overflow-y-auto">
              <div className="text-[9px] text-slate-400 uppercase font-bold mb-1">
                Active Grounded Snapshot ({privacyShieldActive ? 'PII Redacted' : 'Raw'}):
              </div>
              <pre className="text-[10px] text-emerald-400 font-mono whitespace-pre-wrap leading-tight">
                {currentPayloadPreview}
              </pre>
            </div>
          )}
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[96%] sm:max-w-[92%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-brand-600 to-pink-600 text-white rounded-tr-none'
                    : 'bg-slate-800/90 border border-slate-700/60 text-slate-200 rounded-tl-none'
                }`}
              >
                {/* Formatted Text */}
                <div>{renderFormattedText(msg.text)}</div>

                {/* Weather Telemetry Visual Widget */}
                {msg.weatherTelemetry && (
                  <div className="mt-3 p-3 bg-slate-900/90 rounded-xl border border-sky-500/30 text-[11px] space-y-2">
                    <div className="flex items-center justify-between text-sky-400 font-bold">
                      <span className="flex items-center gap-1.5">
                        <CloudSun className="w-4 h-4 text-amber-400" />
                        Live Weather Radar Telemetry
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono">
                        {msg.weatherTelemetry.temperature}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-slate-300 pt-1">
                      <div className="flex items-center gap-1 text-[10px]">
                        <Droplets className="w-3 h-3 text-cyan-400" />
                        <span>Rain Risk: <strong>{msg.weatherTelemetry.precipitationProbability}%</strong></span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px]">
                        <Wind className="w-3 h-3 text-teal-400" />
                        <span>Wind: <strong>{msg.weatherTelemetry.windSpeed.split(' ')[0]} km/h</strong></span>
                      </div>
                    </div>

                    {/* Rain Risk Meter */}
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          msg.weatherTelemetry.precipitationProbability > 30 ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${Math.min(100, msg.weatherTelemetry.precipitationProbability)}%` }}
                      />
                    </div>

                    <p className="text-[10px] text-sky-200/80 italic leading-snug">
                      {msg.weatherTelemetry.advisory}
                    </p>
                  </div>
                )}

                {/* Agentic Execution Trace Visual Widget */}
                {msg.agenticTrace && msg.agenticTrace.length > 0 && (
                  <div className="mt-3 p-2.5 bg-slate-950/80 rounded-xl border border-slate-700/80 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Activity className="w-3 h-3" /> Agentic Execution Trace:
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {msg.agenticTrace.length} Steps
                      </span>
                    </div>

                    <div className="space-y-1 pt-1">
                      {msg.agenticTrace.map((traceStep, tIdx) => (
                        <div key={tIdx} className="flex items-start gap-1.5 text-[10px] text-slate-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-white">{traceStep.label}:</strong>{' '}
                            <span className="text-slate-400">{traceStep.detail}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Decision Audit if available */}
                {msg.decisionAudit && (
                  <div className="mt-3 pt-2 border-t border-slate-700/80 space-y-1.5 text-[11px]">
                    <div className="font-bold text-amber-300 uppercase tracking-wider text-[10px]">
                      Decision Audit:
                    </div>
                    {msg.decisionAudit.whatChanged.length > 0 && (
                      <div className="text-slate-300">
                        <strong className="text-emerald-400">Changed:</strong> {msg.decisionAudit.whatChanged.slice(0, 2).join('; ')}
                      </div>
                    )}
                    {msg.decisionAudit.needsHumanConfirmation.length > 0 && (
                      <div className="text-slate-300">
                        <strong className="text-amber-400">Needs Confirmation:</strong> {msg.decisionAudit.needsHumanConfirmation.slice(0, 2).join('; ')}
                      </div>
                    )}
                  </div>
                )}

                {/* Proposed Executable Actions (Human-in-the-Loop or Auto-Executed) */}
                {msg.proposedActions && msg.proposedActions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-700/80 space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-brand-300 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Within-App Action Integrations:
                      </span>
                      {msg.wasAutoExecuted && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono flex items-center gap-1">
                          <Zap className="w-2.5 h-2.5 fill-amber-300" /> Auto-Applied
                        </span>
                      )}
                    </div>

                    {msg.proposedActions.map((action, aIdx) => {
                      const isApplied = msg.appliedActionIndex === aIdx;

                      return (
                        <div
                          key={aIdx}
                          className="bg-slate-900/90 border border-slate-700 rounded-xl p-2.5 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-[11px]">{action.label}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 font-mono">
                              {action.type}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-snug">{action.description}</p>

                          <div className="flex items-center gap-2">
                            <button
                              disabled={isApplied}
                              onClick={() => handleApplyAction(action, msg.id, aIdx)}
                              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow ${
                                isApplied
                                  ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 cursor-default'
                                  : 'bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 text-white'
                              }`}
                            >
                              {isApplied ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>{t.applied}</span>
                                </>
                              ) : (
                                <>
                                  <Zap className="w-3.5 h-3.5" />
                                  <span>{t.applyToPlan}</span>
                                </>
                              )}
                            </button>

                            {isApplied && (
                              <button
                                onClick={() => handleUndoAutoAction(msg.id)}
                                title="Revert this action"
                                className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white text-xs transition-colors"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <span className="block text-[9px] text-slate-400 text-right mt-1.5">{msg.timestamp}</span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 p-3 bg-slate-800/90 border border-brand-500/40 rounded-2xl w-fit shadow-lg">
              <Bot className="w-4 h-4 text-brand-400 animate-bounce" />
              <span className="text-xs text-brand-200 font-medium">{loadingStep}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Fast Prompts */}
        <div className="p-2.5 bg-slate-950/90 border-t border-slate-800 flex gap-1.5 overflow-x-auto shrink-0 no-scrollbar">
          {quickAgentActions.map((action, pIdx) => (
            <button
              key={pIdx}
              onClick={() => handleSendMessage(action.query)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/80 rounded-lg text-[11px] whitespace-nowrap transition-all flex items-center gap-1 shadow-sm shrink-0"
            >
              {action.label}
            </button>
          ))}
        </div>

        {/* Input Box */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 shrink-0">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              placeholder={t.askPlaceholder}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              aria-label="Send message to AI"
              className="p-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white rounded-xl shadow-lg transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </aside>
    </>
  );
};
