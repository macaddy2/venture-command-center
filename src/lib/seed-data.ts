// ============================================================
// Seed Data — Initial venture portfolio (from prototype)
// ============================================================

import type { Venture, Task, Milestone, TeamRole, Registration, GitHubStats } from './types';
import { generateId } from './utils';

// --- Venture IDs (stable for references) ---
const IDS = {
    tc: 'v-trucycle-001',
    dg: 'v-depositguard-002',
    pm: 'v-pathmate-003',
    fx: 'v-fixars-004',
    cn: 'v-conceptnexus-005',
    sc: 'v-skillscanvas-006',
    cb: 'v-collabboard-007',
    vd: 'v-vestden-008',
    pp: 'v-paypaddy-009',
    fs: 'v-fashop-010',
};

export const seedVentures: Venture[] = [
    { id: IDS.tc, name: 'TruCycle', prefix: 'TC', geo: 'UK', tier: 'Active Build', color: '#27AE60', lightColor: '#D5F5E3', status: 'Registered', stage: 'MVP Development', description: 'Circular economy marketplace for verified pre-owned goods', created_at: '2025-11-01T00:00:00Z', updated_at: '2026-02-16T00:00:00Z' },
    { id: IDS.dg, name: 'DepositGuard', prefix: 'DG', geo: 'UK', tier: 'Active Build', color: '#2E86C1', lightColor: '#D6EAF8', status: 'Pending Registration', stage: 'Pre-Registration', description: 'Tenant deposit protection and management platform', created_at: '2025-12-01T00:00:00Z', updated_at: '2026-02-16T00:00:00Z' },
    { id: IDS.pm, name: 'PathMate', prefix: 'PM', geo: 'UK', tier: 'Incubating', color: '#8E44AD', lightColor: '#E8DAEF', status: 'Concept', stage: 'Research & Validation', description: 'Social rideshare platform connecting verified commuters', created_at: '2025-12-15T00:00:00Z', updated_at: '2026-02-16T00:00:00Z' },
    { id: IDS.fx, name: 'Fixars', prefix: 'FX', geo: 'NG', tier: 'Incubating', color: '#E67E22', lightColor: '#FDEBD0', status: 'Pending CAC', stage: 'Registration & Architecture', description: 'Nigerian superapp ecosystem for services and commerce', created_at: '2025-10-01T00:00:00Z', updated_at: '2026-02-16T00:00:00Z' },
    { id: IDS.cn, name: 'ConceptNexus', prefix: 'CN', geo: 'NG', tier: 'Parked', color: '#E67E22', lightColor: '#FDEBD0', status: 'Planning', stage: 'Under Fixars', description: 'Innovation and brainstorming platform (Fixars sub-app)', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-02-16T00:00:00Z' },
    { id: IDS.sc, name: 'SkillsCanvas', prefix: 'SC', geo: 'NG', tier: 'Parked', color: '#E67E22', lightColor: '#FDEBD0', status: 'Planning', stage: 'Under Fixars', description: 'Talent and skills marketplace (Fixars sub-app)', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-02-16T00:00:00Z' },
    { id: IDS.cb, name: 'CollabBoard', prefix: 'CB', geo: 'NG', tier: 'Parked', color: '#E67E22', lightColor: '#FDEBD0', status: 'Planning', stage: 'Under Fixars', description: 'Collaborative project board (Fixars sub-app)', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-02-16T00:00:00Z' },
    { id: IDS.vd, name: 'VestDen', prefix: 'VD', geo: 'NG', tier: 'Parked', color: '#E67E22', lightColor: '#FDEBD0', status: 'Planning', stage: 'Under Fixars', description: 'Investment and portfolio tracking (Fixars sub-app)', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-02-16T00:00:00Z' },
    { id: IDS.pp, name: 'PayPaddy', prefix: 'PP', geo: 'NG', tier: 'Parked', color: '#E67E22', lightColor: '#FDEBD0', status: 'Planning', stage: 'Under Fixars', description: 'Payment and fintech layer (Fixars sub-app)', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-02-16T00:00:00Z' },
    { id: IDS.fs, name: 'FaShop', prefix: 'FS', geo: 'NG', tier: 'Parked', color: '#E67E22', lightColor: '#FDEBD0', status: 'Concept', stage: 'Under Fixars', description: 'E-commerce and shopping hub (Fixars sub-app)', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-02-16T00:00:00Z' },
];

// --- Sample tasks (subset to demonstrate the engine) ---
export const seedTasks: Task[] = [
    // TruCycle tasks
    { id: generateId(), venture_id: IDS.tc, title: 'Set up CI/CD pipeline', status: 'done', priority: 'P1', created_at: '2025-12-01T00:00:00Z', updated_at: '2026-01-15T00:00:00Z' },
    { id: generateId(), venture_id: IDS.tc, title: 'Design database schema', status: 'done', priority: 'P0', created_at: '2025-12-01T00:00:00Z', updated_at: '2026-01-10T00:00:00Z' },
    { id: generateId(), venture_id: IDS.tc, title: 'Implement user authentication', status: 'done', priority: 'P0', created_at: '2025-12-05T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: generateId(), venture_id: IDS.tc, title: 'Build product listing API', status: 'done', priority: 'P0', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-02-01T00:00:00Z' },
    { id: generateId(), venture_id: IDS.tc, title: 'Design landing page', status: 'done', priority: 'P1', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-02-05T00:00:00Z' },
    { id: generateId(), venture_id: IDS.tc, title: 'Implement product verification flow', status: 'done', priority: 'P0', created_at: '2026-01-05T00:00:00Z', updated_at: '2026-02-10T00:00:00Z' },
    { id: generateId(), venture_id: IDS.tc, title: 'Build search and filter system', status: 'done', priority: 'P1', created_at: '2026-01-10T00:00:00Z', updated_at: '2026-02-12T00:00:00Z' },
    { id: generateId(), venture_id: IDS.tc, title: 'Integrate payment gateway (Stripe)', status: 'done', priority: 'P0', created_at: '2026-01-15T00:00:00Z', updated_at: '2026-02-14T00:00:00Z' },
    { id: generateId(), venture_id: IDS.tc, title: 'Build seller dashboard', status: 'in-progress', priority: 'P1', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-02-16T00:00:00Z' },
    { id: generateId(), venture_id: IDS.tc, title: 'Implement review & rating system', status: 'in-progress', priority: 'P1', created_at: '2026-02-01T00:00:00Z', updated_at: '2026-02-16T00:00:00Z' },
    { id: generateId(), venture_id: IDS.tc, title: 'Order tracking & notifications', status: 'in-progress', priority: 'P1', created_at: '2026-02-01T00:00:00Z', updated_at: '2026-02-16T00:00:00Z' },
    { id: generateId(), venture_id: IDS.tc, title: 'Mobile responsive optimization', status: 'in-progress', priority: 'P2', created_at: '2026-02-01T00:00:00Z', updated_at: '2026-02-16T00:00:00Z' },
    { id: generateId(), venture_id: IDS.tc, title: 'Admin moderation panel', status: 'in-progress', priority: 'P1', created_at: '2026-02-05T00:00:00Z', updated_at: '2026-02-16T00:00:00Z' },
    { id: generateId(), venture_id: IDS.tc, title: 'Open bank account', status: 'blocked', priority: 'P0', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-02-10T00:00:00Z' },
    { id: generateId(), venture_id: IDS.tc, title: 'Set up analytics (Mixpanel)', status: 'todo', priority: 'P2', created_at: '2026-02-10T00:00:00Z', updated_at: '2026-02-10T00:00:00Z' },
    { id: generateId(), venture_id: IDS.tc, title: 'SEO optimization', status: 'backlog', priority: 'P2', created_at: '2026-02-10T00:00:00Z', updated_at: '2026-02-10T00:00:00Z' },
    { id: generateId(), venture_id: IDS.tc, title: 'Launch marketing campaign', status: 'backlog', priority: 'P1', created_at: '2026-02-10T00:00:00Z', updated_at: '2026-02-10T00:00:00Z' },
    { id: generateId(), venture_id: IDS.tc, title: 'Build referral system', status: 'backlog', priority: 'P2', created_at: '2026-02-10T00:00:00Z', updated_at: '2026-02-10T00:00:00Z' },
    { id: generateId(), venture_id: IDS.tc, title: 'Write API documentation', status: 'backlog', priority: 'P3', created_at: '2026-02-10T00:00:00Z', updated_at: '2026-02-10T00:00:00Z' },
    { id: generateId(), venture_id: IDS.tc, title: 'Hire CTO', status: 'todo', priority: 'P0', tags: ['hiring'], created_at: '2026-01-01T00:00:00Z', updated_at: '2026-02-16T00:00:00Z' },
    { id: generateId(), venture_id: IDS.tc, title: 'Performance load testing', status: 'backlog', priority: 'P2', created_at: '2026-02-10T00:00:00Z', updated_at: '2026-02-10T00:00:00Z' },
    { id: generateId(), venture_id: IDS.tc, title: 'Set up customer support system', status: 'backlog', priority: 'P2', created_at: '2026-02-10T00:00:00Z', updated_at: '2026-02-10T00:00:00Z' },
    { id: generateId(), venture_id: IDS.tc, title: 'Legal terms of service review', status: 'backlog', priority: 'P1', created_at: '2026-02-10T00:00:00Z', updated_at: '2026-02-10T00:00:00Z' },
    { id: generateId(), venture_id: IDS.tc, title: 'User onboarding flow', status: 'backlog', priority: 'P1', created_at: '2026-02-10T00:00:00Z', updated_at: '2026-02-10T00:00:00Z' },

    // DepositGuard tasks
    { id: generateId(), venture_id: IDS.dg, title: 'Research tenancy deposit regulations', status: 'done', priority: 'P0', created_at: '2025-12-15T00:00:00Z', updated_at: '2026-01-15T00:00:00Z' },
    { id: generateId(), venture_id: IDS.dg, title: 'Draft legal framework document', status: 'done', priority: 'P0', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-02-01T00:00:00Z' },
    { id: generateId(), venture_id: IDS.dg, title: 'Validate legal model with solicitor', status: 'done', priority: 'P0', created_at: '2026-01-10T00:00:00Z', updated_at: '2026-02-10T00:00:00Z' },
    { id: generateId(), venture_id: IDS.dg, title: 'Build DepositFlow prototype', status: 'in-progress', priority: 'P0', created_at: '2026-01-15T00:00:00Z', updated_at: '2026-02-16T00:00:00Z' },
    { id: generateId(), venture_id: IDS.dg, title: 'Design UI/UX for tenant portal', status: 'in-progress', priority: 'P1', created_at: '2026-02-01T00:00:00Z', updated_at: '2026-02-16T00:00:00Z' },
    { id: generateId(), venture_id: IDS.dg, title: 'Implement Supabase backend', status: 'in-progress', priority: 'P0', created_at: '2026-02-01T00:00:00Z', updated_at: '2026-02-16T00:00:00Z' },
    { id: generateId(), venture_id: IDS.dg, title: 'Deed of Assignment feature', status: 'in-progress', priority: 'P1', created_at: '2026-02-05T00:00:00Z', updated_at: '2026-02-16T00:00:00Z' },
    { id: generateId(), venture_id: IDS.dg, title: 'Register Ltd company', status: 'blocked', priority: 'P0', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-02-01T00:00:00Z' },
    { id: generateId(), venture_id: IDS.dg, title: 'Open business bank account', status: 'blocked', priority: 'P0', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-02-01T00:00:00Z' },
    { id: generateId(), venture_id: IDS.dg, title: 'Landlord portal MVP', status: 'backlog', priority: 'P1', created_at: '2026-02-10T00:00:00Z', updated_at: '2026-02-10T00:00:00Z' },
    { id: generateId(), venture_id: IDS.dg, title: 'Payment integration', status: 'backlog', priority: 'P0', created_at: '2026-02-10T00:00:00Z', updated_at: '2026-02-10T00:00:00Z' },
    { id: generateId(), venture_id: IDS.dg, title: 'Compliance audit preparation', status: 'backlog', priority: 'P1', created_at: '2026-02-10T00:00:00Z', updated_at: '2026-02-10T00:00:00Z' },
    { id: generateId(), venture_id: IDS.dg, title: 'Marketing website', status: 'backlog', priority: 'P2', created_at: '2026-02-10T00:00:00Z', updated_at: '2026-02-10T00:00:00Z' },
    { id: generateId(), venture_id: IDS.dg, title: 'Beta user recruitment', status: 'backlog', priority: 'P1', created_at: '2026-02-10T00:00:00Z', updated_at: '2026-02-10T00:00:00Z' },
    { id: generateId(), venture_id: IDS.dg, title: 'Dispute resolution workflow', status: 'backlog', priority: 'P1', created_at: '2026-02-10T00:00:00Z', updated_at: '2026-02-10T00:00:00Z' },
    { id: generateId(), venture_id: IDS.dg, title: 'Automated deposit protection certificates', status: 'backlog', priority: 'P2', created_at: '2026-02-10T00:00:00Z', updated_at: '2026-02-10T00:00:00Z' },
    { id: generateId(), venture_id: IDS.dg, title: 'Hire lead developer', status: 'todo', priority: 'P0', tags: ['hiring'], created_at: '2026-02-01T00:00:00Z', updated_at: '2026-02-16T00:00:00Z' },

    // PathMate tasks
    { id: generateId(), venture_id: IDS.pm, title: 'Market research: UK rideshare landscape', status: 'done', priority: 'P0', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-02-01T00:00:00Z' },
    { id: generateId(), venture_id: IDS.pm, title: 'Competitive analysis document', status: 'in-progress', priority: 'P0', created_at: '2026-01-15T00:00:00Z', updated_at: '2026-02-16T00:00:00Z' },
    { id: generateId(), venture_id: IDS.pm, title: 'Define MVP feature set', status: 'in-progress', priority: 'P0', created_at: '2026-02-01T00:00:00Z', updated_at: '2026-02-16T00:00:00Z' },
    { id: generateId(), venture_id: IDS.pm, title: 'User persona research', status: 'backlog', priority: 'P1', created_at: '2026-02-10T00:00:00Z', updated_at: '2026-02-10T00:00:00Z' },
    { id: generateId(), venture_id: IDS.pm, title: 'Regulatory requirements (TfL, insurance)', status: 'backlog', priority: 'P0', created_at: '2026-02-10T00:00:00Z', updated_at: '2026-02-10T00:00:00Z' },
    { id: generateId(), venture_id: IDS.pm, title: 'Company registration', status: 'backlog', priority: 'P1', created_at: '2026-02-10T00:00:00Z', updated_at: '2026-02-10T00:00:00Z' },
    { id: generateId(), venture_id: IDS.pm, title: 'Technical architecture design', status: 'backlog', priority: 'P1', created_at: '2026-02-10T00:00:00Z', updated_at: '2026-02-10T00:00:00Z' },
    { id: generateId(), venture_id: IDS.pm, title: 'UI/UX wireframes', status: 'backlog', priority: 'P1', created_at: '2026-02-10T00:00:00Z', updated_at: '2026-02-10T00:00:00Z' },
    { id: generateId(), venture_id: IDS.pm, title: 'Pitch deck draft', status: 'backlog', priority: 'P2', created_at: '2026-02-10T00:00:00Z', updated_at: '2026-02-10T00:00:00Z' },
    { id: generateId(), venture_id: IDS.pm, title: 'Safety & verification model', status: 'backlog', priority: 'P0', created_at: '2026-02-10T00:00:00Z', updated_at: '2026-02-10T00:00:00Z' },
    { id: generateId(), venture_id: IDS.pm, title: 'Route matching algorithm research', status: 'backlog', priority: 'P1', created_at: '2026-02-10T00:00:00Z', updated_at: '2026-02-10T00:00:00Z' },
    { id: generateId(), venture_id: IDS.pm, title: 'Partnership outreach plan', status: 'backlog', priority: 'P3', created_at: '2026-02-10T00:00:00Z', updated_at: '2026-02-10T00:00:00Z' },

    // Fixars tasks
    { id: generateId(), venture_id: IDS.fx, title: 'Define superapp architecture', status: 'done', priority: 'P0', created_at: '2025-10-15T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: generateId(), venture_id: IDS.fx, title: 'Create PRD document', status: 'done', priority: 'P0', created_at: '2025-11-01T00:00:00Z', updated_at: '2026-01-22T00:00:00Z' },
    { id: generateId(), venture_id: IDS.fx, title: 'Build demo prototype', status: 'done', priority: 'P1', created_at: '2026-01-15T00:00:00Z', updated_at: '2026-01-22T00:00:00Z' },
    { id: generateId(), venture_id: IDS.fx, title: 'Implement cross-app features', status: 'done', priority: 'P0', created_at: '2026-01-22T00:00:00Z', updated_at: '2026-01-23T00:00:00Z' },
    { id: generateId(), venture_id: IDS.fx, title: 'CAC registration filing', status: 'in-progress', priority: 'P0', created_at: '2026-02-01T00:00:00Z', updated_at: '2026-02-16T00:00:00Z' },
    { id: generateId(), venture_id: IDS.fx, title: 'Design auth/identity layer', status: 'in-progress', priority: 'P0', created_at: '2026-02-05T00:00:00Z', updated_at: '2026-02-16T00:00:00Z' },
    { id: generateId(), venture_id: IDS.fx, title: 'Supabase integration setup', status: 'in-progress', priority: 'P1', created_at: '2026-01-21T00:00:00Z', updated_at: '2026-02-16T00:00:00Z' },
    { id: generateId(), venture_id: IDS.fx, title: 'Finalize CAC documents', status: 'blocked', priority: 'P0', created_at: '2026-01-15T00:00:00Z', updated_at: '2026-02-10T00:00:00Z' },
    ...Array.from({ length: 22 }, (_, i) => ({
        id: generateId(),
        venture_id: IDS.fx,
        title: [
            'Design shared component library', 'Implement real-time data sync', 'Build notification service',
            'User profile microservice', 'Payment gateway integration', 'File upload service',
            'Search indexing service', 'Analytics dashboard', 'Admin panel',
            'API gateway setup', 'Mobile app shell (React Native)', 'Push notification service',
            'Geolocation service', 'Chat/messaging service', 'Content moderation system',
            'Rate limiting & security', 'Logging infrastructure', 'Automated testing setup',
            'Deploy staging environment', 'Documentation site', 'Open source contribution guide',
            'Launch first sub-app beta',
        ][i],
        status: 'backlog' as const,
        priority: (i < 5 ? 'P1' : i < 12 ? 'P2' : 'P3') as 'P1' | 'P2' | 'P3',
        created_at: '2026-02-10T00:00:00Z',
        updated_at: '2026-02-10T00:00:00Z',
    })),
];

export const seedMilestones: Milestone[] = [
    { id: generateId(), venture_id: IDS.tc, name: 'MVP Launch', target_date: '2026-06-30', progress: 33, created_at: '2025-11-01T00:00:00Z', updated_at: '2026-02-16T00:00:00Z' },
    { id: generateId(), venture_id: IDS.tc, name: 'First 100 Users', target_date: '2026-08-31', progress: 0, created_at: '2025-11-01T00:00:00Z', updated_at: '2026-02-16T00:00:00Z' },
    { id: generateId(), venture_id: IDS.dg, name: 'Ltd Registration', target_date: '2026-03-31', progress: 20, created_at: '2025-12-01T00:00:00Z', updated_at: '2026-02-16T00:00:00Z' },
    { id: generateId(), venture_id: IDS.dg, name: 'Legal Model Validated', target_date: '2026-04-30', progress: 40, created_at: '2025-12-01T00:00:00Z', updated_at: '2026-02-16T00:00:00Z' },
    { id: generateId(), venture_id: IDS.dg, name: 'Platform Beta', target_date: '2026-07-31', progress: 0, created_at: '2025-12-01T00:00:00Z', updated_at: '2026-02-16T00:00:00Z' },
    { id: generateId(), venture_id: IDS.pm, name: 'Competitive Analysis', target_date: '2026-04-30', progress: 10, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-02-16T00:00:00Z' },
    { id: generateId(), venture_id: IDS.pm, name: 'Company Registration', target_date: '2026-05-31', progress: 0, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-02-16T00:00:00Z' },
    { id: generateId(), venture_id: IDS.fx, name: 'CAC Registration', target_date: '2026-03-31', progress: 15, created_at: '2025-10-01T00:00:00Z', updated_at: '2026-02-16T00:00:00Z' },
    { id: generateId(), venture_id: IDS.fx, name: 'Auth/Identity Layer', target_date: '2026-06-30', progress: 5, created_at: '2025-10-01T00:00:00Z', updated_at: '2026-02-16T00:00:00Z' },
    { id: generateId(), venture_id: IDS.fx, name: 'First Sub-App Live', target_date: '2026-09-30', progress: 0, created_at: '2025-10-01T00:00:00Z', updated_at: '2026-02-16T00:00:00Z' },
];

export const seedTeamRoles: TeamRole[] = [
    // TruCycle
    { id: generateId(), venture_id: IDS.tc, role_name: 'Founder / CEO', status: 'filled', assignee_name: 'Ade' },
    { id: generateId(), venture_id: IDS.tc, role_name: 'CTO', status: 'hiring', assignee_name: null },
    { id: generateId(), venture_id: IDS.tc, role_name: 'Ops Lead', status: 'hiring', assignee_name: null },
    { id: generateId(), venture_id: IDS.tc, role_name: 'UX Designer', status: 'hiring', assignee_name: null },
    { id: generateId(), venture_id: IDS.tc, role_name: 'Marketing Lead', status: 'hiring', assignee_name: null },
    // DepositGuard
    { id: generateId(), venture_id: IDS.dg, role_name: 'Founder / CEO', status: 'filled', assignee_name: 'Ade' },
    { id: generateId(), venture_id: IDS.dg, role_name: 'Lead Developer', status: 'hiring', assignee_name: null },
    { id: generateId(), venture_id: IDS.dg, role_name: 'Legal Advisor', status: 'hiring', assignee_name: null },
    { id: generateId(), venture_id: IDS.dg, role_name: 'UX Designer', status: 'hiring', assignee_name: null },
    // PathMate
    { id: generateId(), venture_id: IDS.pm, role_name: 'Mobile Developer', status: 'later', assignee_name: null },
    { id: generateId(), venture_id: IDS.pm, role_name: 'Backend Engineer', status: 'later', assignee_name: null },
    { id: generateId(), venture_id: IDS.pm, role_name: 'UX Designer', status: 'later', assignee_name: null },
    { id: generateId(), venture_id: IDS.pm, role_name: 'Growth Manager', status: 'later', assignee_name: null },
    { id: generateId(), venture_id: IDS.pm, role_name: 'Regulatory Advisor', status: 'later', assignee_name: null },
    // Fixars
    { id: generateId(), venture_id: IDS.fx, role_name: 'CTO / Architect', status: 'hiring', assignee_name: null },
    { id: generateId(), venture_id: IDS.fx, role_name: 'Full-Stack Developer', status: 'hiring', assignee_name: null },
    { id: generateId(), venture_id: IDS.fx, role_name: 'Product Designer', status: 'hiring', assignee_name: null },
    { id: generateId(), venture_id: IDS.fx, role_name: 'Community Lead', status: 'hiring', assignee_name: null },
    { id: generateId(), venture_id: IDS.fx, role_name: 'Biz Ops', status: 'hiring', assignee_name: null },
    { id: generateId(), venture_id: IDS.fx, role_name: 'Mobile Developer', status: 'hiring', assignee_name: null },
];

export const seedRegistrations: Registration[] = [
    // TruCycle
    { id: generateId(), venture_id: IDS.tc, type: 'domain', completed: true, notes: 'trucycle.co.uk' },
    { id: generateId(), venture_id: IDS.tc, type: 'company', completed: true, notes: 'TruCycle Ltd registered' },
    { id: generateId(), venture_id: IDS.tc, type: 'bank', completed: false, notes: 'Pending Tide application' },
    { id: generateId(), venture_id: IDS.tc, type: 'legal', completed: true, notes: 'T&C drafted' },
    // DepositGuard
    { id: generateId(), venture_id: IDS.dg, type: 'domain', completed: true, notes: 'depositguard.co.uk' },
    { id: generateId(), venture_id: IDS.dg, type: 'company', completed: false },
    { id: generateId(), venture_id: IDS.dg, type: 'bank', completed: false },
    { id: generateId(), venture_id: IDS.dg, type: 'legal', completed: false },
    // PathMate
    { id: generateId(), venture_id: IDS.pm, type: 'domain', completed: true, notes: 'pathmate.co.uk' },
    { id: generateId(), venture_id: IDS.pm, type: 'company', completed: false },
    { id: generateId(), venture_id: IDS.pm, type: 'bank', completed: false },
    { id: generateId(), venture_id: IDS.pm, type: 'legal', completed: false },
    // Fixars
    { id: generateId(), venture_id: IDS.fx, type: 'domain', completed: true, notes: 'fixars.ng' },
    { id: generateId(), venture_id: IDS.fx, type: 'company', completed: false, notes: 'CAC filing in progress' },
    { id: generateId(), venture_id: IDS.fx, type: 'bank', completed: false },
    { id: generateId(), venture_id: IDS.fx, type: 'legal', completed: false },
    // Sub-apps (domain only)
    ...['cn', 'sc', 'cb', 'vd', 'pp', 'fs'].flatMap(key => [
        { id: generateId(), venture_id: IDS[key as keyof typeof IDS], type: 'domain' as const, completed: true },
        { id: generateId(), venture_id: IDS[key as keyof typeof IDS], type: 'company' as const, completed: false },
        { id: generateId(), venture_id: IDS[key as keyof typeof IDS], type: 'bank' as const, completed: false },
        { id: generateId(), venture_id: IDS[key as keyof typeof IDS], type: 'legal' as const, completed: false },
    ]),
];

export const seedGitHubStats: GitHubStats[] = [
    { id: generateId(), venture_id: IDS.tc, repos: 3, commits_7d: 0, prs_open: 0, issues_open: 2, last_activity: 'Awaiting CTO', synced_at: '2026-02-16T00:00:00Z' },
    { id: generateId(), venture_id: IDS.dg, repos: 2, commits_7d: 0, prs_open: 0, issues_open: 1, last_activity: 'Awaiting Dev', synced_at: '2026-02-16T00:00:00Z' },
    { id: generateId(), venture_id: IDS.pm, repos: 0, commits_7d: 0, prs_open: 0, issues_open: 0, last_activity: 'Not started', synced_at: '2026-02-16T00:00:00Z' },
    { id: generateId(), venture_id: IDS.fx, repos: 2, commits_7d: 0, prs_open: 0, issues_open: 3, last_activity: 'Architecture planning', synced_at: '2026-02-16T00:00:00Z' },
];

// --- Seed data for new features ---
import type { FinancialRecord, VentureDocument, Risk, RecurringTask, ResourceSharing, HealthSnapshot } from './types';

export const seedFinancials: FinancialRecord[] = [
    { id: generateId(), venture_id: IDS.tc, type: 'expense', amount: 120, currency: 'GBP', label: 'Domain & hosting', date: '2026-01-10' },
    { id: generateId(), venture_id: IDS.tc, type: 'expense', amount: 49, currency: 'GBP', label: 'Vercel Pro plan', date: '2026-02-01' },
    { id: generateId(), venture_id: IDS.tc, type: 'expense', amount: 250, currency: 'GBP', label: 'Logo and branding', date: '2025-12-15' },
    { id: generateId(), venture_id: IDS.dg, type: 'expense', amount: 15, currency: 'GBP', label: 'Domain registration', date: '2026-01-15' },
    { id: generateId(), venture_id: IDS.dg, type: 'expense', amount: 200, currency: 'GBP', label: 'Legal consultation', date: '2026-02-05' },
    { id: generateId(), venture_id: IDS.fx, type: 'expense', amount: 15000, currency: 'NGN', label: 'CAC registration fee', date: '2026-02-01' },
    { id: generateId(), venture_id: IDS.fx, type: 'expense', amount: 5000, currency: 'NGN', label: 'Domain registration', date: '2025-12-01' },
];

export const seedDocuments: VentureDocument[] = [
    { id: generateId(), venture_id: IDS.tc, name: 'TruCycle PRD', url: 'https://docs.google.com/document/d/trucycle-prd', category: 'technical', added_at: '2026-01-10T00:00:00Z' },
    { id: generateId(), venture_id: IDS.tc, name: 'Pitch Deck v2', url: 'https://docs.google.com/presentation/d/trucycle-pitch', category: 'pitch', added_at: '2026-02-01T00:00:00Z' },
    { id: generateId(), venture_id: IDS.tc, name: 'Terms of Service', url: 'https://docs.google.com/document/d/trucycle-tos', category: 'legal', added_at: '2026-01-20T00:00:00Z' },
    { id: generateId(), venture_id: IDS.dg, name: 'Legal Framework', url: 'https://docs.google.com/document/d/dg-legal-framework', category: 'legal', added_at: '2026-01-15T00:00:00Z' },
    { id: generateId(), venture_id: IDS.dg, name: 'DepositFlow Wireframes', url: 'https://figma.com/file/depositflow-wireframes', category: 'technical', added_at: '2026-02-10T00:00:00Z' },
    { id: generateId(), venture_id: IDS.fx, name: 'Fixars PRD', url: 'https://docs.google.com/document/d/fixars-prd', category: 'technical', added_at: '2025-11-01T00:00:00Z' },
    { id: generateId(), venture_id: IDS.pm, name: 'Market Research', url: 'https://docs.google.com/document/d/pathmate-research', category: 'marketing', added_at: '2026-01-05T00:00:00Z' },
];

export const seedRisks: Risk[] = [
    { id: generateId(), venture_id: IDS.tc, title: 'No CTO hired yet', description: 'Technical leadership gap could delay MVP', likelihood: 4, impact: 5, status: 'active', mitigation: 'Actively networking and posting on LinkedIn', created_at: '2026-01-15T00:00:00Z' },
    { id: generateId(), venture_id: IDS.tc, title: 'Bank account delay', description: 'Unable to accept payments without bank account', likelihood: 3, impact: 4, status: 'active', mitigation: 'Exploring alternative payment providers', created_at: '2026-02-01T00:00:00Z' },
    { id: generateId(), venture_id: IDS.dg, title: 'Regulatory compliance risk', description: 'TDS regulations may require FCA authorization', likelihood: 3, impact: 5, status: 'active', mitigation: 'Consulting with solicitor, exploring custodial model', created_at: '2026-01-20T00:00:00Z' },
    { id: generateId(), venture_id: IDS.fx, title: 'CAC registration delay', description: 'Nigerian CAC processes can take 2-6 weeks', likelihood: 4, impact: 3, status: 'active', mitigation: 'Filed through registered agent', created_at: '2026-02-05T00:00:00Z' },
    { id: generateId(), venture_id: IDS.pm, title: 'Transport regulation changes', description: 'TfL may change ride-sharing regulations', likelihood: 2, impact: 4, status: 'accepted', created_at: '2026-01-01T00:00:00Z' },
];

export const seedRecurringTasks: RecurringTask[] = [
    { id: generateId(), venture_id: IDS.tc, title: 'Review website analytics', recurrence: 'weekly', priority: 'P2', active: true, next_due: '2026-02-21', created_at: '2026-01-15T00:00:00Z' },
    { id: generateId(), venture_id: IDS.dg, title: 'Check competition updates', recurrence: 'biweekly', priority: 'P3', active: true, next_due: '2026-02-28', created_at: '2026-02-01T00:00:00Z' },
    { id: generateId(), venture_id: IDS.fx, title: 'Follow up on CAC status', recurrence: 'weekly', priority: 'P0', active: true, next_due: '2026-02-19', created_at: '2026-02-05T00:00:00Z' },
];

export const seedResourceSharing: ResourceSharing[] = [
    { id: generateId(), from_venture_id: IDS.tc, to_venture_id: IDS.dg, resource_type: 'knowledge', resource_name: 'Supabase setup template', status: 'active', start_date: '2026-02-01', created_at: '2026-02-01T00:00:00Z' },
    { id: generateId(), from_venture_id: IDS.fx, to_venture_id: IDS.cn, resource_type: 'person', resource_name: 'Ade — cross-project coordination', status: 'active', start_date: '2025-10-01', created_at: '2025-10-01T00:00:00Z' },
];

export const seedHealthSnapshots: HealthSnapshot[] = [
    { id: generateId(), venture_id: IDS.tc, score: 65, recorded_at: '2026-01-01T00:00:00Z' },
    { id: generateId(), venture_id: IDS.tc, score: 68, recorded_at: '2026-01-15T00:00:00Z' },
    { id: generateId(), venture_id: IDS.tc, score: 70, recorded_at: '2026-02-01T00:00:00Z' },
    { id: generateId(), venture_id: IDS.tc, score: 72, recorded_at: '2026-02-16T00:00:00Z' },
    { id: generateId(), venture_id: IDS.dg, score: 30, recorded_at: '2026-01-01T00:00:00Z' },
    { id: generateId(), venture_id: IDS.dg, score: 38, recorded_at: '2026-01-15T00:00:00Z' },
    { id: generateId(), venture_id: IDS.dg, score: 42, recorded_at: '2026-02-01T00:00:00Z' },
    { id: generateId(), venture_id: IDS.dg, score: 45, recorded_at: '2026-02-16T00:00:00Z' },
    { id: generateId(), venture_id: IDS.fx, score: 20, recorded_at: '2026-01-01T00:00:00Z' },
    { id: generateId(), venture_id: IDS.fx, score: 28, recorded_at: '2026-01-15T00:00:00Z' },
    { id: generateId(), venture_id: IDS.fx, score: 33, recorded_at: '2026-02-01T00:00:00Z' },
    { id: generateId(), venture_id: IDS.fx, score: 35, recorded_at: '2026-02-16T00:00:00Z' },
];

