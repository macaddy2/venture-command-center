// ============================================================
// Venture Command Center — Type Definitions
// ============================================================

// --- Enums ---
export type VentureTier = 'Active Build' | 'Incubating' | 'Parked';
export type VentureGeo = 'UK' | 'NG';
export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done' | 'blocked';
export type TaskPriority = 'P0' | 'P1' | 'P2' | 'P3';
export type RoleStatus = 'filled' | 'hiring' | 'later' | 'open';
export type InsightType = 'summary' | 'alert' | 'suggestion' | 'health';
export type InsightSeverity = 'info' | 'warning' | 'critical';

// --- Core Entities ---
export interface Venture {
    id: string;
    name: string;
    prefix: string;
    geo: VentureGeo;
    tier: VentureTier;
    status: string;
    stage: string;
    color: string;
    lightColor: string;
    description?: string;
    config?: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

export interface Task {
    id: string;
    venture_id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    parent_id?: string | null;
    milestone_id?: string | null;
    blocked_by?: string | null;
    due_date?: string | null;
    tags?: string[];
    created_at: string;
    updated_at: string;
}

export interface Milestone {
    id: string;
    venture_id: string;
    name: string;
    target_date: string;
    progress: number;
    created_at: string;
    updated_at: string;
}

export interface TeamRole {
    id: string;
    venture_id: string;
    role_name: string;
    status: RoleStatus;
    assignee_name?: string | null;
}

export interface Registration {
    id: string;
    venture_id: string;
    type: 'domain' | 'company' | 'bank' | 'legal';
    completed: boolean;
    notes?: string;
}

export interface GitHubStats {
    id: string;
    venture_id: string;
    repos: number;
    commits_7d: number;
    prs_open: number;
    issues_open: number;
    last_activity: string;
    synced_at: string;
}

export interface FileScan {
    id: string;
    venture_id: string;
    file_path: string;
    file_type: string;
    extracted_data: Record<string, unknown>;
    todos_found?: string[];
    scanned_at: string;
}

export interface AIInsight {
    id: string;
    venture_id?: string | null;
    type: InsightType;
    title: string;
    content: string;
    severity: InsightSeverity;
    is_read: boolean;
    generated_at: string;
}

// --- Computed / View Types ---
export interface VentureWithStats extends Venture {
    tasks: TaskSummary;
    milestones: Milestone[];
    team: TeamSummary;
    regs: RegistrationSummary;
    github: GitHubStats | null;
    healthScore: number;
}

export interface TaskSummary {
    total: number;
    done: number;
    inProgress: number;
    blocked: number;
    backlog: number;
    todo: number;
    review: number;
}

export interface TeamSummary {
    filled: number;
    total: number;
    roles: TeamRole[];
}

export interface RegistrationSummary {
    domain: boolean;
    company: boolean;
    bank: boolean;
    legal: boolean;
    completedCount: number;
    totalCount: number;
}

// --- AI / Agent Types ---
export interface AIQueryRequest {
    query: string;
    context?: {
        venture_id?: string;
        include_tasks?: boolean;
        include_github?: boolean;
    };
}

export interface AIQueryResponse {
    answer: string;
    sources: string[];
    suggested_actions?: string[];
}

export interface AgentConfig {
    watch_paths: { venture_id: string; path: string }[];
    github_token?: string;
    openai_api_key?: string;
    scan_interval_minutes: number;
    ai_model: string;
}

// --- Feature Enhancement Types ---

// Health Trends (Feature 4)
export interface HealthSnapshot {
    id: string;
    venture_id: string;
    score: number;
    week_label?: string;
    recorded_at: string;
}

// Recurring Tasks (Feature 6)
export type RecurrencePattern = 'daily' | 'weekly' | 'biweekly' | 'monthly';
export interface RecurringTask {
    id: string;
    venture_id: string;
    title: string;
    description?: string;
    priority: TaskPriority;
    recurrence: RecurrencePattern;
    next_due: string;
    last_generated?: string;
    active: boolean;
    created_at: string;
}

// Financial Tracker (Feature 7)
export type FinancialType = 'expense' | 'revenue' | 'funding' | 'runway';
export interface FinancialRecord {
    id: string;
    venture_id: string;
    type: FinancialType;
    amount: number;
    currency: 'GBP' | 'NGN' | 'USD';
    label: string;
    date: string;
    recurring?: boolean;
    notes?: string;
}

// Document Vault (Feature 8)
export type DocCategory = 'legal' | 'pitch' | 'technical' | 'financial' | 'marketing' | 'other';
export interface VentureDocument {
    id: string;
    venture_id: string;
    name: string;
    category: DocCategory;
    url: string;
    notes?: string;
    added_at: string;
}

// Risk Matrix (Feature 9)
export type RiskLikelihood = 1 | 2 | 3 | 4 | 5;
export type RiskImpact = 1 | 2 | 3 | 4 | 5;
export type RiskStatus = 'active' | 'mitigated' | 'accepted' | 'resolved';
export interface Risk {
    id: string;
    venture_id: string;
    title: string;
    description?: string;
    likelihood: RiskLikelihood;
    impact: RiskImpact;
    status: RiskStatus;
    mitigation?: string;
    created_at: string;
}

export type ResourceType = 'person' | 'tool' | 'budget' | 'knowledge';
export type SharingStatus = 'active' | 'completed' | 'cancelled';

export interface ResourceSharing {
    id: string;
    from_venture_id: string;
    to_venture_id: string;
    resource_type: ResourceType;
    resource_name: string;
    start_date: string;
    end_date?: string;
    status: SharingStatus;
    notes?: string;
    created_at: string;
}

// --- UI State Types ---
export type ViewKey = 'dashboard' | 'tasks' | 'analytics' | 'ai' | 'settings'
    | 'timeline' | 'focus' | 'financials' | 'documents' | 'risks' | 'comparisons'
    | 'digest' | 'recurring' | 'resources' | 'alerts' | 'standup';

export interface FilterState {
    tier: VentureTier | 'all';
    geo: VentureGeo | 'all';
    search: string;
    sortBy: 'name' | 'health' | 'activity' | 'tasks';
}

export interface NotificationItem {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    venture_id?: string;
    read: boolean;
    created_at: string;
}
