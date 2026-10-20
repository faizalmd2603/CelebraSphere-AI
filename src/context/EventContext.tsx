import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  EventPlan,
  VerticalPersona,
  Currency,
  BudgetPriorityMode,
  BudgetItem,
  BudgetCategory,
  RunOfShowBlock,
  TimelineTask,
  Vendor,
  VendorStatus,
  ExecutableAction,
  DecisionAudit
} from '../types/event';
import { WEDDING_PRESET, BIRTHDAY_PRESET, COMMUNITY_PRESET } from '../data/presets';
import {
  scaleGuestCosts,
  rebalanceBudget,
  convertCurrency
} from '../utils/calculations';

interface EventContextType {
  plan: EventPlan;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currency: Currency;
  toggleCurrency: () => void;
  switchPersona: (vertical: VerticalPersona) => void;
  setPriorityMode: (mode: BudgetPriorityMode) => void;
  updateGuestCount: (newCount: number) => void;
  
  // Budget Actions
  addBudgetItem: (item: Omit<BudgetItem, 'id'>) => void;
  updateBudgetItem: (item: BudgetItem) => void;
  deleteBudgetItem: (id: string) => void;
  rebalanceBudgetAction: () => { diff: unknown[] };
  
  // Timeline Actions
  updateRunOfShow: (blocks: RunOfShowBlock[], auditMessage?: string) => void;
  toggleLockAnchor: (blockId: string) => void;
  toggleTaskComplete: (taskId: string) => void;
  addChecklistTask: (task: Omit<TimelineTask, 'id' | 'completed'>) => void;
  
  // Vendor Actions
  updateVendorStatus: (vendorId: string, status: VendorStatus) => void;
  toggleVendorSafetyCheck: (vendorId: string, key: keyof Vendor['safetyChecklist']) => void;
  addVendor: (vendor: Omit<Vendor, 'id'>) => void;
  
  // Ideas & RSVP Actions
  addCreativeIdeaToPlan: (ideaId: string) => void;
  
  // Executable Actions from AI
  applyExecutableAction: (action: ExecutableAction) => void;
  
  // History & Workspace Control
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  resetToDefault: () => void;
  exportPlanAsJson: () => string;
  importPlanFromJson: (jsonStr: string) => boolean;
  createCustomPlan: (customPlan: EventPlan) => void;
  
  // UI Preferences
  highContrast: boolean;
  toggleHighContrast: () => void;
  largeText: boolean;
  toggleLargeText: () => void;
  reducedMotion: boolean;
  toggleReducedMotion: () => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

const STORAGE_KEY = 'celebrasphere_active_plan_v1';
const PREFS_KEY = 'celebrasphere_ui_prefs_v1';

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize plan from localStorage or default to Wedding
  const [plan, setPlan] = useState<EventPlan>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved plan from localStorage', e);
    }
    return WEDDING_PRESET;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // History Stacks for Undo / Redo
  const [history, setHistory] = useState<EventPlan[]>([]);
  const [redoStack, setRedoStack] = useState<EventPlan[]>([]);

  // Accessibility / UI preferences
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [largeText, setLargeText] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedPrefs = localStorage.getItem(PREFS_KEY);
      if (savedPrefs) {
        const p = JSON.parse(savedPrefs);
        if (p.highContrast) setHighContrast(true);
        if (p.largeText) setLargeText(true);
        if (p.reducedMotion) setReducedMotion(true);
      }
    } catch (e) {}
  }, []);

  // Save on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    } catch (e) {}
  }, [plan]);

  const savePrefs = useCallback((hc: boolean, lt: boolean, rm: boolean) => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({ highContrast: hc, largeText: lt, reducedMotion: rm }));
    } catch (e) {}
  }, []);

  const toggleHighContrast = useCallback(() => {
    setHighContrast(prev => {
      const next = !prev;
      savePrefs(next, largeText, reducedMotion);
      return next;
    });
  }, [largeText, reducedMotion, savePrefs]);

  const toggleLargeText = useCallback(() => {
    setLargeText(prev => {
      const next = !prev;
      savePrefs(highContrast, next, reducedMotion);
      return next;
    });
  }, [highContrast, reducedMotion, savePrefs]);

  const toggleReducedMotion = useCallback(() => {
    setReducedMotion(prev => {
      const next = !prev;
      savePrefs(highContrast, largeText, next);
      return next;
    });
  }, [highContrast, largeText, savePrefs]);

  // Helper to commit new plan state with Undo History
  const commitPlan = useCallback((newPlanOrUpdater: EventPlan | ((prev: EventPlan) => EventPlan)) => {
    setPlan(prevPlan => {
      const nextPlan = typeof newPlanOrUpdater === 'function' ? newPlanOrUpdater(prevPlan) : newPlanOrUpdater;
      setHistory(h => [...h.slice(-25), prevPlan]);
      setRedoStack([]);
      return nextPlan;
    });
  }, []);

  const undo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    if (!previous) return;
    setRedoStack(r => [...r, plan]);
    setHistory(h => h.slice(0, h.length - 1));
    setPlan(previous);
  }, [history, plan]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    if (!next) return;
    setHistory(h => [...h, plan]);
    setRedoStack(r => r.slice(0, r.length - 1));
    setPlan(next);
  }, [redoStack, plan]);

  // Switch Vertical Persona
  const switchPersona = useCallback((vertical: VerticalPersona) => {
    let preset: EventPlan;
    if (vertical === 'wedding') preset = WEDDING_PRESET;
    else if (vertical === 'birthday') preset = BIRTHDAY_PRESET;
    else preset = COMMUNITY_PRESET;

    commitPlan(preset);
  }, [commitPlan]);

  // Toggle Currency between INR and USD
  const toggleCurrency = useCallback(() => {
    commitPlan(prev => {
      const targetCurrency: Currency = prev.currency === 'INR' ? 'USD' : 'INR';
      const from = prev.currency;
      
      const newTotalBudget = convertCurrency(prev.totalBudget, from, targetCurrency);
      const newCategories = prev.categories.map(c => ({
        ...c,
        allocatedAmount: convertCurrency(c.allocatedAmount, from, targetCurrency),
        spentAmount: convertCurrency(c.spentAmount, from, targetCurrency)
      }));
      const newItems = prev.budgetItems.map(item => ({
        ...item,
        unitCost: convertCurrency(item.unitCost, from, targetCurrency),
        estimatedAmount: convertCurrency(item.estimatedAmount, from, targetCurrency),
        actualAmount: convertCurrency(item.actualAmount, from, targetCurrency),
        paidAmount: convertCurrency(item.paidAmount, from, targetCurrency)
      }));
      const newVendors = prev.vendors.map(v => ({
        ...v,
        quotedPrice: convertCurrency(v.quotedPrice, from, targetCurrency),
        depositPaid: convertCurrency(v.depositPaid, from, targetCurrency)
      }));

      return {
        ...prev,
        currency: targetCurrency,
        totalBudget: newTotalBudget,
        categories: newCategories,
        budgetItems: newItems,
        vendors: newVendors
      };
    });
  }, [commitPlan]);

  // Change guest headcount with dynamic variable cost scaling
  const updateGuestCount = useCallback((newCount: number) => {
    commitPlan(prev => scaleGuestCosts(prev, newCount));
  }, [commitPlan]);

  // Update budget priority mode
  const setPriorityMode = useCallback((mode: BudgetPriorityMode) => {
    commitPlan(prev => {
      let multiplierCatering = 1;
      let multiplierDecor = 1;

      if (mode === 'culinary-first') {
        multiplierCatering = 1.15;
        multiplierDecor = 0.85;
      } else if (mode === 'decor-vibe') {
        multiplierDecor = 1.20;
        multiplierCatering = 0.90;
      } else if (mode === 'eco-minimalist') {
        multiplierCatering = 0.90;
        multiplierDecor = 0.80;
      }

      const updatedCategories = prev.categories.map(c => {
        if (c.name.toLowerCase().includes('catering') || c.name.toLowerCase().includes('food')) {
          return { ...c, allocatedAmount: Math.round(c.allocatedAmount * multiplierCatering) };
        }
        if (c.name.toLowerCase().includes('decor') || c.name.toLowerCase().includes('floral')) {
          return { ...c, allocatedAmount: Math.round(c.allocatedAmount * multiplierDecor) };
        }
        return c;
      });

      return {
        ...prev,
        budgetPriorityMode: mode,
        categories: updatedCategories
      };
    });
  }, [commitPlan]);

  // Budget item operations
  const addBudgetItem = useCallback((item: Omit<BudgetItem, 'id'>) => {
    const newItem: BudgetItem = {
      ...item,
      id: `item-${Date.now()}`
    };
    commitPlan(prev => ({
      ...prev,
      budgetItems: [...prev.budgetItems, newItem]
    }));
  }, [commitPlan]);

  const updateBudgetItem = useCallback((item: BudgetItem) => {
    commitPlan(prev => ({
      ...prev,
      budgetItems: prev.budgetItems.map(b => b.id === item.id ? item : b)
    }));
  }, [commitPlan]);

  const deleteBudgetItem = useCallback((id: string) => {
    commitPlan(prev => ({
      ...prev,
      budgetItems: prev.budgetItems.filter(b => b.id !== id)
    }));
  }, [commitPlan]);

  // Rebalance Budget Action
  const rebalanceBudgetAction = useCallback(() => {
    let diffResult: unknown[] = [];
    commitPlan(prev => {
      const { newPlan, diff } = rebalanceBudget(prev);
      diffResult = diff;
      return newPlan;
    });
    return { diff: diffResult };
  }, [commitPlan]);

  // Timeline operations
  const updateRunOfShow = useCallback((blocks: RunOfShowBlock[], auditMessage?: string) => {
    commitPlan(prev => {
      const audits = prev.recentAudits;
      if (auditMessage) {
        audits.unshift({
          id: `audit-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          scenarioName: 'Run-of-Show Reflow',
          whatChanged: [auditMessage],
          assumptionsMade: ['Maintained anchor times and transition minimums'],
          needsHumanConfirmation: ['Notify leads of shifted schedule']
        });
      }
      return {
        ...prev,
        runOfShow: blocks,
        recentAudits: audits.slice(0, 10)
      };
    });
  }, [commitPlan]);

  const toggleLockAnchor = useCallback((blockId: string) => {
    commitPlan(prev => ({
      ...prev,
      runOfShow: prev.runOfShow.map(b => b.id === blockId ? { ...b, isLockedAnchor: !b.isLockedAnchor } : b)
    }));
  }, [commitPlan]);

  const toggleTaskComplete = useCallback((taskId: string) => {
    commitPlan(prev => ({
      ...prev,
      checklistTasks: prev.checklistTasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
    }));
  }, [commitPlan]);

  const addChecklistTask = useCallback((task: Omit<TimelineTask, 'id' | 'completed'>) => {
    const newTask: TimelineTask = {
      ...task,
      id: `task-${Date.now()}`,
      completed: false
    };
    commitPlan(prev => ({
      ...prev,
      checklistTasks: [...prev.checklistTasks, newTask]
    }));
  }, [commitPlan]);

  // Vendor operations
  const updateVendorStatus = useCallback((vendorId: string, status: VendorStatus) => {
    commitPlan(prev => ({
      ...prev,
      vendors: prev.vendors.map(v => v.id === vendorId ? { ...v, status } : v)
    }));
  }, [commitPlan]);

  const toggleVendorSafetyCheck = useCallback((vendorId: string, key: keyof Vendor['safetyChecklist']) => {
    commitPlan(prev => ({
      ...prev,
      vendors: prev.vendors.map(v => {
        if (v.id === vendorId) {
          return {
            ...v,
            safetyChecklist: {
              ...v.safetyChecklist,
              [key]: !v.safetyChecklist[key]
            }
          };
        }
        return v;
      })
    }));
  }, [commitPlan]);

  const addVendor = useCallback((vendor: Omit<Vendor, 'id'>) => {
    const newVendor: Vendor = {
      ...vendor,
      id: `v-${Date.now()}`
    };
    commitPlan(prev => ({
      ...prev,
      vendors: [...prev.vendors, newVendor]
    }));
  }, [commitPlan]);

  // Creative Ideas operations
  const addCreativeIdeaToPlan = useCallback((ideaId: string) => {
    commitPlan(prev => {
      const idea = prev.creativeIdeas.find(i => i.id === ideaId);
      if (!idea) return prev;

      const updatedIdeas = prev.creativeIdeas.map(i => i.id === ideaId ? { ...i, isAddedToPlan: true } : i);
      
      // If idea has cost impact, add a budget item
      const newItems = [...prev.budgetItems];
      if (idea.estimatedCostImpact !== 0) {
        newItems.push({
          id: `item-idea-${Date.now()}`,
          name: `[Creative Idea] ${idea.title}`,
          category: idea.category === 'culinary' ? 'Catering & Beverages' : 'Floral Decor & Mandap',
          costType: 'fixed',
          unitCost: Math.abs(idea.estimatedCostImpact),
          quantity: 1,
          estimatedAmount: idea.estimatedCostImpact,
          actualAmount: idea.estimatedCostImpact > 0 ? idea.estimatedCostImpact : 0,
          paidAmount: 0,
          notes: idea.description,
          isAiSuggested: true
        });
      }

      // Add a checklist task
      const newTasks = [...prev.checklistTasks, {
        id: `task-idea-${Date.now()}`,
        title: `Implement Creative Concept: ${idea.title}`,
        category: 'Creative Design',
        planningWindow: '1m_out' as const,
        priority: 'medium' as const,
        dueDate: prev.eventDate,
        completed: false,
        owner: 'Creative Lead',
        isAiSuggested: true,
        notes: idea.description
      }];

      return {
        ...prev,
        creativeIdeas: updatedIdeas,
        budgetItems: newItems,
        checklistTasks: newTasks
      };
    });
  }, [commitPlan]);

  // Execute structured AI Action
  const applyExecutableAction = useCallback((action: ExecutableAction) => {
    commitPlan(prev => {
      if (action.type === 'REBALANCE_BUDGET') {
        const { newPlan } = rebalanceBudget(prev);
        return newPlan;
      }
      if (action.type === 'REFLOW_TIMELINE' && action.payload['runOfShow']) {
        return {
          ...prev,
          runOfShow: action.payload['runOfShow'] as RunOfShowBlock[]
        };
      }
      if (action.type === 'UPDATE_GUEST_COUNT' && typeof action.payload['newGuestCount'] === 'number') {
        return scaleGuestCosts(prev, action.payload['newGuestCount'] as number);
      }
      if (action.type === 'ADD_VENDOR_TASK' && action.payload['title']) {
        const newTask: TimelineTask = {
          id: `task-ai-${Date.now()}`,
          title: String(action.payload['title']),
          category: String(action.payload['category'] || 'General'),
          planningWindow: '1w_out',
          priority: (action.payload['priority'] as any) || 'high',
          dueDate: prev.eventDate,
          completed: false,
          owner: 'Assigned Lead',
          isAiSuggested: true
        };
        return {
          ...prev,
          checklistTasks: [newTask, ...prev.checklistTasks]
        };
      }
      return prev;
    });
  }, [commitPlan]);

  // Reset to default preset
  const resetToDefault = useCallback(() => {
    commitPlan(WEDDING_PRESET);
  }, [commitPlan]);

  // Custom Plan Creation Wizard
  const createCustomPlan = useCallback((customPlan: EventPlan) => {
    commitPlan(customPlan);
  }, [commitPlan]);

  // Export / Import
  const exportPlanAsJson = useCallback(() => {
    return JSON.stringify(plan, null, 2);
  }, [plan]);

  const importPlanFromJson = useCallback((jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.id && parsed.title && parsed.budgetItems) {
        commitPlan(parsed as EventPlan);
        return true;
      }
    } catch (e) {
      console.error('Failed to import JSON plan', e);
    }
    return false;
  }, [commitPlan]);

  const value = useMemo(() => ({
    plan,
    activeTab,
    setActiveTab,
    currency: plan.currency,
    toggleCurrency,
    switchPersona,
    setPriorityMode,
    updateGuestCount,
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    rebalanceBudgetAction,
    updateRunOfShow,
    toggleLockAnchor,
    toggleTaskComplete,
    addChecklistTask,
    updateVendorStatus,
    toggleVendorSafetyCheck,
    addVendor,
    addCreativeIdeaToPlan,
    applyExecutableAction,
    canUndo: history.length > 0,
    canRedo: redoStack.length > 0,
    undo,
    redo,
    resetToDefault,
    exportPlanAsJson,
    importPlanFromJson,
    createCustomPlan,
    highContrast,
    toggleHighContrast,
    largeText,
    toggleLargeText,
    reducedMotion,
    toggleReducedMotion
  }), [
    plan,
    activeTab,
    toggleCurrency,
    switchPersona,
    setPriorityMode,
    updateGuestCount,
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    rebalanceBudgetAction,
    updateRunOfShow,
    toggleLockAnchor,
    toggleTaskComplete,
    addChecklistTask,
    updateVendorStatus,
    toggleVendorSafetyCheck,
    addVendor,
    addCreativeIdeaToPlan,
    applyExecutableAction,
    history.length,
    redoStack.length,
    undo,
    redo,
    resetToDefault,
    exportPlanAsJson,
    importPlanFromJson,
    createCustomPlan,
    highContrast,
    toggleHighContrast,
    largeText,
    toggleLargeText,
    reducedMotion,
    toggleReducedMotion
  ]);

  return (
    <EventContext.Provider value={value}>
      <div className={`min-h-screen ${highContrast ? 'contrast-125' : ''} ${largeText ? 'text-lg' : 'text-base'} ${reducedMotion ? 'motion-reduce' : ''}`}>
        {children}
      </div>
    </EventContext.Provider>
  );
};

export const useEventContext = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return context;
};
