// ============================================================
// Data Store — Local-first state management with Supabase sync
// ============================================================
// Uses React Context + localStorage for offline-first operation.
// When Supabase is configured, data syncs bidirectionally.
// ============================================================

import React, { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react';
import type { Venture, Task, Milestone, TeamRole, Registration, GitHubStats, AIInsight, VentureWithStats, FilterState, ViewKey, HealthSnapshot, RecurringTask, FinancialRecord, VentureDocument, Risk, ResourceSharing } from './types';
import { computeTaskSummary, computeTeamSummary, computeRegistrationSummary, computeHealthScore } from './utils';
import { seedVentures, seedTasks, seedMilestones, seedTeamRoles, seedRegistrations, seedGitHubStats, seedFinancials, seedDocuments, seedRisks, seedRecurringTasks, seedResourceSharing, seedHealthSnapshots } from './seed-data';
import { generateId } from './utils';

// --- State Shape ---
interface AppState {
    ventures: Venture[];
    tasks: Task[];
    milestones: Milestone[];
    teamRoles: TeamRole[];
    registrations: Registration[];
    githubStats: GitHubStats[];
    aiInsights: AIInsight[];
    healthSnapshots: HealthSnapshot[];
    recurringTasks: RecurringTask[];
    financials: FinancialRecord[];
    documents: VentureDocument[];
    risks: Risk[];
    resourceSharing: ResourceSharing[];
    filters: FilterState;
    selectedVentureId: string | null;
    activeView: ViewKey;
    sidebarCollapsed: boolean;
    isLoading: boolean;
}

// --- Actions ---
type Action =
    | { type: 'SET_VENTURES'; payload: Venture[] }
    | { type: 'ADD_VENTURE'; payload: Venture }
    | { type: 'UPDATE_VENTURE'; payload: Venture }
    | { type: 'DELETE_VENTURE'; payload: string }
    | { type: 'SET_TASKS'; payload: Task[] }
    | { type: 'ADD_TASK'; payload: Task }
    | { type: 'UPDATE_TASK'; payload: Task }
    | { type: 'DELETE_TASK'; payload: string }
    | { type: 'SET_MILESTONES'; payload: Milestone[] }
    | { type: 'ADD_MILESTONE'; payload: Milestone }
    | { type: 'UPDATE_MILESTONE'; payload: Milestone }
    | { type: 'DELETE_MILESTONE'; payload: string }
    | { type: 'SET_TEAM_ROLES'; payload: TeamRole[] }
    | { type: 'ADD_TEAM_ROLE'; payload: TeamRole }
    | { type: 'UPDATE_TEAM_ROLE'; payload: TeamRole }
    | { type: 'SET_REGISTRATIONS'; payload: Registration[] }
    | { type: 'UPDATE_REGISTRATION'; payload: Registration }
    | { type: 'SET_GITHUB_STATS'; payload: GitHubStats[] }
    | { type: 'SET_AI_INSIGHTS'; payload: AIInsight[] }
    | { type: 'ADD_AI_INSIGHT'; payload: AIInsight }
    | { type: 'MARK_INSIGHT_READ'; payload: string }
    | { type: 'SET_FILTERS'; payload: Partial<FilterState> }
    | { type: 'SELECT_VENTURE'; payload: string | null }
    | { type: 'SET_ACTIVE_VIEW'; payload: ViewKey }
    | { type: 'TOGGLE_SIDEBAR' }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'LOAD_STATE'; payload: Partial<AppState> }
    // New feature actions
    | { type: 'SET_HEALTH_SNAPSHOTS'; payload: HealthSnapshot[] }
    | { type: 'ADD_HEALTH_SNAPSHOT'; payload: HealthSnapshot }
    | { type: 'SET_RECURRING_TASKS'; payload: RecurringTask[] }
    | { type: 'ADD_RECURRING_TASK'; payload: RecurringTask }
    | { type: 'UPDATE_RECURRING_TASK'; payload: RecurringTask }
    | { type: 'DELETE_RECURRING_TASK'; payload: string }
    | { type: 'SET_FINANCIALS'; payload: FinancialRecord[] }
    | { type: 'ADD_FINANCIAL'; payload: FinancialRecord }
    | { type: 'DELETE_FINANCIAL'; payload: string }
    | { type: 'SET_DOCUMENTS'; payload: VentureDocument[] }
    | { type: 'ADD_DOCUMENT'; payload: VentureDocument }
    | { type: 'DELETE_DOCUMENT'; payload: string }
    | { type: 'SET_RISKS'; payload: Risk[] }
    | { type: 'ADD_RISK'; payload: Risk }
    | { type: 'UPDATE_RISK'; payload: Risk }
    | { type: 'DELETE_RISK'; payload: string }
    | { type: 'SET_RESOURCE_SHARING'; payload: ResourceSharing[] }
    | { type: 'ADD_RESOURCE_SHARING'; payload: ResourceSharing }
    | { type: 'DELETE_RESOURCE_SHARING'; payload: string };

const STORAGE_KEY = 'vcc-state';

function loadFromStorage(): Partial<AppState> | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return null;
}

function saveToStorage(state: AppState) {
    try {
        const toSave = {
            ventures: state.ventures,
            tasks: state.tasks,
            milestones: state.milestones,
            teamRoles: state.teamRoles,
            registrations: state.registrations,
            githubStats: state.githubStats,
            aiInsights: state.aiInsights,
            healthSnapshots: state.healthSnapshots,
            recurringTasks: state.recurringTasks,
            financials: state.financials,
            documents: state.documents,
            risks: state.risks,
            resourceSharing: state.resourceSharing,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch { /* ignore */ }
}

const defaultFilters: FilterState = { tier: 'all', geo: 'all', search: '', sortBy: 'name' };

function getInitialState(): AppState {
    const saved = loadFromStorage();
    return {
        ventures: saved?.ventures?.length ? saved.ventures : seedVentures,
        tasks: saved?.tasks?.length ? saved.tasks : seedTasks,
        milestones: saved?.milestones?.length ? saved.milestones : seedMilestones,
        teamRoles: saved?.teamRoles?.length ? saved.teamRoles : seedTeamRoles,
        registrations: saved?.registrations?.length ? saved.registrations : seedRegistrations,
        githubStats: saved?.githubStats?.length ? saved.githubStats : seedGitHubStats,
        aiInsights: saved?.aiInsights ?? [],
        healthSnapshots: saved?.healthSnapshots?.length ? saved.healthSnapshots : seedHealthSnapshots,
        recurringTasks: saved?.recurringTasks?.length ? saved.recurringTasks : seedRecurringTasks,
        financials: saved?.financials?.length ? saved.financials : seedFinancials,
        documents: saved?.documents?.length ? saved.documents : seedDocuments,
        risks: saved?.risks?.length ? saved.risks : seedRisks,
        resourceSharing: saved?.resourceSharing?.length ? saved.resourceSharing : seedResourceSharing,
        filters: defaultFilters,
        selectedVentureId: null,
        activeView: 'dashboard',
        sidebarCollapsed: false,
        isLoading: false,
    };
}

function reducer(state: AppState, action: Action): AppState {
    switch (action.type) {
        case 'SET_VENTURES': return { ...state, ventures: action.payload };
        case 'ADD_VENTURE': return { ...state, ventures: [...state.ventures, action.payload] };
        case 'UPDATE_VENTURE': return { ...state, ventures: state.ventures.map(v => v.id === action.payload.id ? action.payload : v) };
        case 'DELETE_VENTURE': return { ...state, ventures: state.ventures.filter(v => v.id !== action.payload), selectedVentureId: state.selectedVentureId === action.payload ? null : state.selectedVentureId };
        case 'SET_TASKS': return { ...state, tasks: action.payload };
        case 'ADD_TASK': return { ...state, tasks: [...state.tasks, action.payload] };
        case 'UPDATE_TASK': return { ...state, tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t) };
        case 'DELETE_TASK': return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };
        case 'SET_MILESTONES': return { ...state, milestones: action.payload };
        case 'ADD_MILESTONE': return { ...state, milestones: [...state.milestones, action.payload] };
        case 'UPDATE_MILESTONE': return { ...state, milestones: state.milestones.map(m => m.id === action.payload.id ? action.payload : m) };
        case 'DELETE_MILESTONE': return { ...state, milestones: state.milestones.filter(m => m.id !== action.payload) };
        case 'SET_TEAM_ROLES': return { ...state, teamRoles: action.payload };
        case 'ADD_TEAM_ROLE': return { ...state, teamRoles: [...state.teamRoles, action.payload] };
        case 'UPDATE_TEAM_ROLE': return { ...state, teamRoles: state.teamRoles.map(r => r.id === action.payload.id ? action.payload : r) };
        case 'SET_REGISTRATIONS': return { ...state, registrations: action.payload };
        case 'UPDATE_REGISTRATION': return { ...state, registrations: state.registrations.map(r => r.id === action.payload.id ? action.payload : r) };
        case 'SET_GITHUB_STATS': return { ...state, githubStats: action.payload };
        case 'SET_AI_INSIGHTS': return { ...state, aiInsights: action.payload };
        case 'ADD_AI_INSIGHT': return { ...state, aiInsights: [action.payload, ...state.aiInsights] };
        case 'MARK_INSIGHT_READ': return { ...state, aiInsights: state.aiInsights.map(i => i.id === action.payload ? { ...i, is_read: true } : i) };
        case 'SET_FILTERS': return { ...state, filters: { ...state.filters, ...action.payload } };
        case 'SELECT_VENTURE': return { ...state, selectedVentureId: action.payload };
        case 'SET_ACTIVE_VIEW': return { ...state, activeView: action.payload };
        case 'TOGGLE_SIDEBAR': return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
        case 'SET_LOADING': return { ...state, isLoading: action.payload };
        case 'LOAD_STATE': return { ...state, ...action.payload };
        // New feature reducers
        case 'SET_HEALTH_SNAPSHOTS': return { ...state, healthSnapshots: action.payload };
        case 'ADD_HEALTH_SNAPSHOT': return { ...state, healthSnapshots: [...state.healthSnapshots, action.payload] };
        case 'SET_RECURRING_TASKS': return { ...state, recurringTasks: action.payload };
        case 'ADD_RECURRING_TASK': return { ...state, recurringTasks: [...state.recurringTasks, action.payload] };
        case 'UPDATE_RECURRING_TASK': return { ...state, recurringTasks: state.recurringTasks.map(r => r.id === action.payload.id ? action.payload : r) };
        case 'DELETE_RECURRING_TASK': return { ...state, recurringTasks: state.recurringTasks.filter(r => r.id !== action.payload) };
        case 'SET_FINANCIALS': return { ...state, financials: action.payload };
        case 'ADD_FINANCIAL': return { ...state, financials: [...state.financials, action.payload] };
        case 'DELETE_FINANCIAL': return { ...state, financials: state.financials.filter(f => f.id !== action.payload) };
        case 'SET_DOCUMENTS': return { ...state, documents: action.payload };
        case 'ADD_DOCUMENT': return { ...state, documents: [...state.documents, action.payload] };
        case 'DELETE_DOCUMENT': return { ...state, documents: state.documents.filter(d => d.id !== action.payload) };
        case 'SET_RISKS': return { ...state, risks: action.payload };
        case 'ADD_RISK': return { ...state, risks: [...state.risks, action.payload] };
        case 'UPDATE_RISK': return { ...state, risks: state.risks.map(r => r.id === action.payload.id ? action.payload : r) };
        case 'DELETE_RISK': return { ...state, risks: state.risks.filter(r => r.id !== action.payload) };
        case 'SET_RESOURCE_SHARING': return { ...state, resourceSharing: action.payload };
        case 'ADD_RESOURCE_SHARING': return { ...state, resourceSharing: [...state.resourceSharing, action.payload] };
        case 'DELETE_RESOURCE_SHARING': return { ...state, resourceSharing: state.resourceSharing.filter(r => r.id !== action.payload) };
        default: return state;
    }
}

// --- Computed selectors ---
function getVentureWithStats(state: AppState, venture: Venture): VentureWithStats {
    const tasks = state.tasks.filter(t => t.venture_id === venture.id);
    const milestones = state.milestones.filter(m => m.venture_id === venture.id);
    const roles = state.teamRoles.filter(r => r.venture_id === venture.id);
    const regs = state.registrations.filter(r => r.venture_id === venture.id);
    const github = state.githubStats.find(g => g.venture_id === venture.id) ?? null;

    const taskSummary = computeTaskSummary(tasks);
    const teamSummary = computeTeamSummary(roles);
    const regSummary = computeRegistrationSummary(regs);

    const ventureWithStats: VentureWithStats = {
        ...venture,
        tasks: taskSummary,
        milestones,
        team: teamSummary,
        regs: regSummary,
        github,
        healthScore: 0,
    };

    ventureWithStats.healthScore = computeHealthScore(ventureWithStats);
    return ventureWithStats;
}

// --- Context ---
interface StoreContext {
    state: AppState;
    dispatch: React.Dispatch<Action>;
    // Computed
    venturesWithStats: VentureWithStats[];
    selectedVenture: VentureWithStats | null;
    filteredVentures: VentureWithStats[];
    portfolioStats: {
        totalVentures: number;
        totalTasks: number;
        doneTasks: number;
        blockedTasks: number;
        totalTeam: number;
        filledTeam: number;
        regsComplete: number;
        regsTotal: number;
        avgHealth: number;
    };
    // Actions
    addTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => void;
    updateTask: (task: Task) => void;
    deleteTask: (id: string) => void;
    addVenture: (venture: Omit<Venture, 'id' | 'created_at' | 'updated_at'>) => void;
    updateVenture: (venture: Venture) => void;
    addMilestone: (milestone: Omit<Milestone, 'id' | 'created_at' | 'updated_at'>) => void;
    updateMilestone: (milestone: Milestone) => void;
    addInsight: (insight: Omit<AIInsight, 'id' | 'generated_at'>) => void;
    // New feature actions
    addRecurringTask: (task: Omit<RecurringTask, 'id' | 'created_at'>) => void;
    addFinancial: (record: Omit<FinancialRecord, 'id'>) => void;
    addDocument: (doc: Omit<VentureDocument, 'id' | 'added_at'>) => void;
    addRisk: (risk: Omit<Risk, 'id' | 'created_at'>) => void;
    addResourceSharing: (sharing: Omit<ResourceSharing, 'id' | 'created_at'>) => void;
    addHealthSnapshot: (snapshot: Omit<HealthSnapshot, 'id' | 'recorded_at'>) => void;
}

const DataContext = createContext<StoreContext | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reducer, undefined, getInitialState);

    // Persist to localStorage on changes
    useEffect(() => {
        saveToStorage(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally listing data properties, not the full state object
    }, [state.ventures, state.tasks, state.milestones, state.teamRoles, state.registrations, state.githubStats, state.aiInsights, state.healthSnapshots, state.recurringTasks, state.financials, state.documents, state.risks, state.resourceSharing]);

    // Computed values
    const venturesWithStats = state.ventures.map(v => getVentureWithStats(state, v));

    const filteredVentures = venturesWithStats.filter(v => {
        if (state.filters.tier !== 'all' && v.tier !== state.filters.tier) return false;
        if (state.filters.geo !== 'all' && v.geo !== state.filters.geo) return false;
        if (state.filters.search) {
            const q = state.filters.search.toLowerCase();
            if (!v.name.toLowerCase().includes(q) && !v.prefix.toLowerCase().includes(q)) return false;
        }
        return true;
    }).sort((a, b) => {
        switch (state.filters.sortBy) {
            case 'health': return b.healthScore - a.healthScore;
            case 'activity': return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
            case 'tasks': return b.tasks.total - a.tasks.total;
            default: return a.name.localeCompare(b.name);
        }
    });

    const selectedVenture = state.selectedVentureId
        ? venturesWithStats.find(v => v.id === state.selectedVentureId) ?? null
        : null;

    const portfolioStats = {
        totalVentures: state.ventures.length,
        totalTasks: state.tasks.length,
        doneTasks: state.tasks.filter(t => t.status === 'done').length,
        blockedTasks: state.tasks.filter(t => t.status === 'blocked').length,
        totalTeam: state.teamRoles.length,
        filledTeam: state.teamRoles.filter(r => r.status === 'filled').length,
        regsComplete: state.registrations.filter(r => r.completed).length,
        regsTotal: state.registrations.length,
        avgHealth: venturesWithStats.length > 0
            ? Math.round(venturesWithStats.reduce((s, v) => s + v.healthScore, 0) / venturesWithStats.length)
            : 0,
    };

    // Action creators
    const now = () => new Date().toISOString();

    const addTask = useCallback((task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
        dispatch({ type: 'ADD_TASK', payload: { ...task, id: generateId(), created_at: now(), updated_at: now() } as Task });
    }, []);

    const updateTask = useCallback((task: Task) => {
        dispatch({ type: 'UPDATE_TASK', payload: { ...task, updated_at: now() } });
    }, []);

    const deleteTask = useCallback((id: string) => {
        dispatch({ type: 'DELETE_TASK', payload: id });
    }, []);

    const addVenture = useCallback((venture: Omit<Venture, 'id' | 'created_at' | 'updated_at'>) => {
        dispatch({ type: 'ADD_VENTURE', payload: { ...venture, id: generateId(), created_at: now(), updated_at: now() } as Venture });
    }, []);

    const updateVenture = useCallback((venture: Venture) => {
        dispatch({ type: 'UPDATE_VENTURE', payload: { ...venture, updated_at: now() } });
    }, []);

    const addMilestone = useCallback((milestone: Omit<Milestone, 'id' | 'created_at' | 'updated_at'>) => {
        dispatch({ type: 'ADD_MILESTONE', payload: { ...milestone, id: generateId(), created_at: now(), updated_at: now() } as Milestone });
    }, []);

    const updateMilestone = useCallback((milestone: Milestone) => {
        dispatch({ type: 'UPDATE_MILESTONE', payload: { ...milestone, updated_at: now() } });
    }, []);

    const addInsight = useCallback((insight: Omit<AIInsight, 'id' | 'generated_at'>) => {
        dispatch({ type: 'ADD_AI_INSIGHT', payload: { ...insight, id: generateId(), generated_at: now() } as AIInsight });
    }, []);

    const addRecurringTask = useCallback((task: Omit<RecurringTask, 'id' | 'created_at'>) => {
        dispatch({ type: 'ADD_RECURRING_TASK', payload: { ...task, id: generateId(), created_at: now() } as RecurringTask });
    }, []);

    const addFinancial = useCallback((record: Omit<FinancialRecord, 'id'>) => {
        dispatch({ type: 'ADD_FINANCIAL', payload: { ...record, id: generateId() } as FinancialRecord });
    }, []);

    const addDocument = useCallback((doc: Omit<VentureDocument, 'id' | 'added_at'>) => {
        dispatch({ type: 'ADD_DOCUMENT', payload: { ...doc, id: generateId(), added_at: now() } as VentureDocument });
    }, []);

    const addRisk = useCallback((risk: Omit<Risk, 'id' | 'created_at'>) => {
        dispatch({ type: 'ADD_RISK', payload: { ...risk, id: generateId(), created_at: now() } as Risk });
    }, []);

    const addResourceSharing = useCallback((sharing: Omit<ResourceSharing, 'id' | 'created_at'>) => {
        dispatch({ type: 'ADD_RESOURCE_SHARING', payload: { ...sharing, id: generateId(), created_at: now() } as ResourceSharing });
    }, []);

    const addHealthSnapshot = useCallback((snapshot: Omit<HealthSnapshot, 'id' | 'recorded_at'>) => {
        dispatch({ type: 'ADD_HEALTH_SNAPSHOT', payload: { ...snapshot, id: generateId(), recorded_at: now() } as HealthSnapshot });
    }, []);

    const value: StoreContext = {
        state, dispatch,
        venturesWithStats, selectedVenture, filteredVentures, portfolioStats,
        addTask, updateTask, deleteTask,
        addVenture, updateVenture,
        addMilestone, updateMilestone,
        addInsight,
        addRecurringTask, addFinancial, addDocument, addRisk, addResourceSharing, addHealthSnapshot,
    };

    return React.createElement(DataContext.Provider, { value }, children);
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore(): StoreContext {
    const ctx = useContext(DataContext);
    if (!ctx) throw new Error('useStore must be used within DataProvider');
    return ctx;
}

export default DataProvider;
