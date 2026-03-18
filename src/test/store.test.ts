import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { DataProvider, useStore } from '../lib/store';
import { ThemeProvider } from '../lib/theme';

function wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(ThemeProvider, null,
        React.createElement(DataProvider, null, children)
    );
}

function useTestStore() {
    return renderHook(() => useStore(), { wrapper });
}

describe('Store Reducer', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    // --- Initial State ---
    describe('Initial State', () => {
        it('loads seed data when localStorage is empty', () => {
            const { result } = useTestStore();
            expect(result.current.state.ventures.length).toBeGreaterThan(0);
            expect(result.current.state.tasks.length).toBeGreaterThan(0);
            expect(result.current.state.activeView).toBe('dashboard');
            expect(result.current.state.sidebarCollapsed).toBe(false);
            expect(result.current.state.isLoading).toBe(false);
            expect(result.current.state.selectedVentureId).toBeNull();
        });

        it('loads from localStorage when available', () => {
            const savedState = {
                ventures: [{ id: 'v1', name: 'Saved Venture', prefix: 'SV', geo: 'UK', tier: 'Active Build', status: 'Active', stage: 'MVP', color: '#000', lightColor: '#fff', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' }],
                tasks: [],
                milestones: [],
                teamRoles: [],
                registrations: [],
                githubStats: [],
                aiInsights: [],
                healthSnapshots: [],
                recurringTasks: [],
                financials: [],
                documents: [],
                risks: [],
                resourceSharing: [],
                equity: [],
                scheduleBlocks: [],
                implementationPlans: [],
            };
            localStorage.setItem('vcc-state', JSON.stringify(savedState));
            const { result } = useTestStore();
            expect(result.current.state.ventures).toHaveLength(1);
            expect(result.current.state.ventures[0].name).toBe('Saved Venture');
        });
    });

    // --- Ventures ---
    describe('Ventures CRUD', () => {
        it('SET_VENTURES replaces all ventures', () => {
            const { result } = useTestStore();
            const newVentures = [{ id: 'v-new', name: 'New', prefix: 'NW', geo: 'UK' as const, tier: 'Active Build' as const, status: 'Active', stage: 'MVP', color: '#000', lightColor: '#fff', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' }];
            act(() => result.current.dispatch({ type: 'SET_VENTURES', payload: newVentures }));
            expect(result.current.state.ventures).toHaveLength(1);
            expect(result.current.state.ventures[0].name).toBe('New');
        });

        it('ADD_VENTURE appends a venture', () => {
            const { result } = useTestStore();
            const count = result.current.state.ventures.length;
            act(() => {
                result.current.addVenture({
                    name: 'Added', prefix: 'AD', geo: 'NG', tier: 'Incubating',
                    status: 'Active', stage: 'MVP', color: '#111', lightColor: '#eee',
                });
            });
            expect(result.current.state.ventures).toHaveLength(count + 1);
            expect(result.current.state.ventures[count].name).toBe('Added');
            expect(result.current.state.ventures[count].id).toBeTruthy();
        });

        it('UPDATE_VENTURE updates matching venture', () => {
            const { result } = useTestStore();
            const first = result.current.state.ventures[0];
            act(() => {
                result.current.updateVenture({ ...first, name: 'Updated Name' });
            });
            expect(result.current.state.ventures[0].name).toBe('Updated Name');
        });

        it('DELETE_VENTURE removes venture and clears selection', () => {
            const { result } = useTestStore();
            const id = result.current.state.ventures[0].id;
            const count = result.current.state.ventures.length;
            // Select the venture first
            act(() => result.current.dispatch({ type: 'SELECT_VENTURE', payload: id }));
            expect(result.current.state.selectedVentureId).toBe(id);
            // Delete it
            act(() => result.current.dispatch({ type: 'DELETE_VENTURE', payload: id }));
            expect(result.current.state.ventures).toHaveLength(count - 1);
            expect(result.current.state.selectedVentureId).toBeNull();
        });
    });

    // --- Tasks ---
    describe('Tasks CRUD', () => {
        it('ADD_TASK appends a task with generated id and timestamps', () => {
            const { result } = useTestStore();
            const count = result.current.state.tasks.length;
            act(() => {
                result.current.addTask({
                    venture_id: result.current.state.ventures[0].id,
                    title: 'New Task', status: 'todo', priority: 'P1',
                });
            });
            expect(result.current.state.tasks).toHaveLength(count + 1);
            const added = result.current.state.tasks[count];
            expect(added.title).toBe('New Task');
            expect(added.id).toBeTruthy();
            expect(added.created_at).toBeTruthy();
        });

        it('UPDATE_TASK updates matching task', () => {
            const { result } = useTestStore();
            const task = result.current.state.tasks[0];
            act(() => {
                result.current.updateTask({ ...task, status: 'done' });
            });
            expect(result.current.state.tasks.find(t => t.id === task.id)?.status).toBe('done');
        });

        it('DELETE_TASK removes task by id', () => {
            const { result } = useTestStore();
            const task = result.current.state.tasks[0];
            const count = result.current.state.tasks.length;
            act(() => result.current.deleteTask(task.id));
            expect(result.current.state.tasks).toHaveLength(count - 1);
            expect(result.current.state.tasks.find(t => t.id === task.id)).toBeUndefined();
        });

        it('SET_TASKS replaces all tasks', () => {
            const { result } = useTestStore();
            act(() => result.current.dispatch({ type: 'SET_TASKS', payload: [] }));
            expect(result.current.state.tasks).toHaveLength(0);
        });
    });

    // --- Milestones ---
    describe('Milestones CRUD', () => {
        it('ADD_MILESTONE appends', () => {
            const { result } = useTestStore();
            const count = result.current.state.milestones.length;
            act(() => {
                result.current.addMilestone({
                    venture_id: result.current.state.ventures[0].id,
                    name: 'Beta Launch', target_date: '2026-06-01', progress: 0,
                });
            });
            expect(result.current.state.milestones).toHaveLength(count + 1);
        });

        it('UPDATE_MILESTONE updates matching', () => {
            const { result } = useTestStore();
            const ms = result.current.state.milestones[0];
            act(() => result.current.updateMilestone({ ...ms, progress: 80 }));
            expect(result.current.state.milestones.find(m => m.id === ms.id)?.progress).toBe(80);
        });

        it('DELETE_MILESTONE removes by id', () => {
            const { result } = useTestStore();
            const ms = result.current.state.milestones[0];
            const count = result.current.state.milestones.length;
            act(() => result.current.dispatch({ type: 'DELETE_MILESTONE', payload: ms.id }));
            expect(result.current.state.milestones).toHaveLength(count - 1);
        });
    });

    // --- Team Roles ---
    describe('Team Roles', () => {
        it('ADD_TEAM_ROLE appends', () => {
            const { result } = useTestStore();
            const count = result.current.state.teamRoles.length;
            const role = { id: 'role-new', venture_id: result.current.state.ventures[0].id, role_name: 'Designer', status: 'open' as const };
            act(() => result.current.dispatch({ type: 'ADD_TEAM_ROLE', payload: role }));
            expect(result.current.state.teamRoles).toHaveLength(count + 1);
        });

        it('UPDATE_TEAM_ROLE updates matching', () => {
            const { result } = useTestStore();
            const role = result.current.state.teamRoles[0];
            act(() => result.current.dispatch({ type: 'UPDATE_TEAM_ROLE', payload: { ...role, status: 'filled' } }));
            expect(result.current.state.teamRoles.find(r => r.id === role.id)?.status).toBe('filled');
        });
    });

    // --- Registrations ---
    describe('Registrations', () => {
        it('UPDATE_REGISTRATION updates matching', () => {
            const { result } = useTestStore();
            const reg = result.current.state.registrations[0];
            act(() => result.current.dispatch({ type: 'UPDATE_REGISTRATION', payload: { ...reg, completed: !reg.completed } }));
            expect(result.current.state.registrations.find(r => r.id === reg.id)?.completed).toBe(!reg.completed);
        });
    });

    // --- AI Insights ---
    describe('AI Insights', () => {
        it('ADD_AI_INSIGHT prepends', () => {
            const { result } = useTestStore();
            act(() => {
                result.current.addInsight({
                    type: 'alert', title: 'Test Alert', content: 'body',
                    severity: 'warning', is_read: false, venture_id: null,
                });
            });
            expect(result.current.state.aiInsights[0].title).toBe('Test Alert');
        });

        it('MARK_INSIGHT_READ marks as read', () => {
            const { result } = useTestStore();
            act(() => {
                result.current.addInsight({
                    type: 'alert', title: 'Unread', content: 'x',
                    severity: 'info', is_read: false, venture_id: null,
                });
            });
            const id = result.current.state.aiInsights[0].id;
            act(() => result.current.dispatch({ type: 'MARK_INSIGHT_READ', payload: id }));
            expect(result.current.state.aiInsights.find(i => i.id === id)?.is_read).toBe(true);
        });
    });

    // --- Health Snapshots ---
    describe('Health Snapshots', () => {
        it('ADD_HEALTH_SNAPSHOT appends', () => {
            const { result } = useTestStore();
            const count = result.current.state.healthSnapshots.length;
            act(() => {
                result.current.addHealthSnapshot({
                    venture_id: result.current.state.ventures[0].id,
                    score: 75, week_label: 'W12',
                });
            });
            expect(result.current.state.healthSnapshots).toHaveLength(count + 1);
        });
    });

    // --- Recurring Tasks ---
    describe('Recurring Tasks', () => {
        it('ADD_RECURRING_TASK appends', () => {
            const { result } = useTestStore();
            const count = result.current.state.recurringTasks.length;
            act(() => {
                result.current.addRecurringTask({
                    venture_id: result.current.state.ventures[0].id,
                    title: 'Weekly standup', recurrence: 'weekly',
                    priority: 'P2', next_due: '2026-04-01', active: true,
                });
            });
            expect(result.current.state.recurringTasks).toHaveLength(count + 1);
        });

        it('UPDATE_RECURRING_TASK updates', () => {
            const { result } = useTestStore();
            const rt = result.current.state.recurringTasks[0];
            act(() => result.current.dispatch({ type: 'UPDATE_RECURRING_TASK', payload: { ...rt, active: false } }));
            expect(result.current.state.recurringTasks.find(r => r.id === rt.id)?.active).toBe(false);
        });

        it('DELETE_RECURRING_TASK removes', () => {
            const { result } = useTestStore();
            const rt = result.current.state.recurringTasks[0];
            const count = result.current.state.recurringTasks.length;
            act(() => result.current.dispatch({ type: 'DELETE_RECURRING_TASK', payload: rt.id }));
            expect(result.current.state.recurringTasks).toHaveLength(count - 1);
        });
    });

    // --- Financials ---
    describe('Financials', () => {
        it('ADD_FINANCIAL appends', () => {
            const { result } = useTestStore();
            const count = result.current.state.financials.length;
            act(() => {
                result.current.addFinancial({
                    venture_id: result.current.state.ventures[0].id,
                    type: 'revenue', amount: 5000, currency: 'GBP',
                    label: 'Sale', date: '2026-03-01',
                });
            });
            expect(result.current.state.financials).toHaveLength(count + 1);
        });

        it('DELETE_FINANCIAL removes', () => {
            const { result } = useTestStore();
            const f = result.current.state.financials[0];
            const count = result.current.state.financials.length;
            act(() => result.current.dispatch({ type: 'DELETE_FINANCIAL', payload: f.id }));
            expect(result.current.state.financials).toHaveLength(count - 1);
        });
    });

    // --- Documents ---
    describe('Documents', () => {
        it('ADD_DOCUMENT appends', () => {
            const { result } = useTestStore();
            const count = result.current.state.documents.length;
            act(() => {
                result.current.addDocument({
                    venture_id: result.current.state.ventures[0].id,
                    name: 'Business Plan', category: 'pitch',
                    url: 'https://example.com/plan.pdf',
                });
            });
            expect(result.current.state.documents).toHaveLength(count + 1);
        });

        it('DELETE_DOCUMENT removes', () => {
            const { result } = useTestStore();
            const d = result.current.state.documents[0];
            const count = result.current.state.documents.length;
            act(() => result.current.dispatch({ type: 'DELETE_DOCUMENT', payload: d.id }));
            expect(result.current.state.documents).toHaveLength(count - 1);
        });
    });

    // --- Risks ---
    describe('Risks', () => {
        it('ADD_RISK appends', () => {
            const { result } = useTestStore();
            const count = result.current.state.risks.length;
            act(() => {
                result.current.addRisk({
                    venture_id: result.current.state.ventures[0].id,
                    title: 'Market risk', likelihood: 3, impact: 4,
                    status: 'active',
                });
            });
            expect(result.current.state.risks).toHaveLength(count + 1);
        });

        it('UPDATE_RISK updates', () => {
            const { result } = useTestStore();
            const r = result.current.state.risks[0];
            act(() => result.current.dispatch({ type: 'UPDATE_RISK', payload: { ...r, status: 'mitigated' } }));
            expect(result.current.state.risks.find(x => x.id === r.id)?.status).toBe('mitigated');
        });

        it('DELETE_RISK removes', () => {
            const { result } = useTestStore();
            const r = result.current.state.risks[0];
            const count = result.current.state.risks.length;
            act(() => result.current.dispatch({ type: 'DELETE_RISK', payload: r.id }));
            expect(result.current.state.risks).toHaveLength(count - 1);
        });
    });

    // --- Resource Sharing ---
    describe('Resource Sharing', () => {
        it('ADD_RESOURCE_SHARING appends', () => {
            const { result } = useTestStore();
            const count = result.current.state.resourceSharing.length;
            act(() => {
                result.current.addResourceSharing({
                    from_venture_id: result.current.state.ventures[0].id,
                    to_venture_id: result.current.state.ventures[1].id,
                    resource_type: 'person', resource_name: 'Dev',
                    start_date: '2026-03-01', status: 'active',
                });
            });
            expect(result.current.state.resourceSharing).toHaveLength(count + 1);
        });

        it('DELETE_RESOURCE_SHARING removes', () => {
            const { result } = useTestStore();
            const rs = result.current.state.resourceSharing[0];
            const count = result.current.state.resourceSharing.length;
            act(() => result.current.dispatch({ type: 'DELETE_RESOURCE_SHARING', payload: rs.id }));
            expect(result.current.state.resourceSharing).toHaveLength(count - 1);
        });
    });

    // --- Equity ---
    describe('Equity', () => {
        it('ADD_EQUITY appends', () => {
            const { result } = useTestStore();
            const count = result.current.state.equity.length;
            act(() => {
                result.current.addEquity({
                    venture_id: result.current.state.ventures[0].id,
                    stakeholder: 'John Doe', role: 'Cofounder',
                    percentage: 25, date: '2026-01-01',
                });
            });
            expect(result.current.state.equity).toHaveLength(count + 1);
            const added = result.current.state.equity[count];
            expect(added.role).toBe('Cofounder');
        });

        it('UPDATE_EQUITY updates', () => {
            const { result } = useTestStore();
            const eq = result.current.state.equity[0];
            act(() => result.current.dispatch({ type: 'UPDATE_EQUITY', payload: { ...eq, percentage: 30 } }));
            expect(result.current.state.equity.find(e => e.id === eq.id)?.percentage).toBe(30);
        });

        it('DELETE_EQUITY removes', () => {
            const { result } = useTestStore();
            const eq = result.current.state.equity[0];
            const count = result.current.state.equity.length;
            act(() => result.current.dispatch({ type: 'DELETE_EQUITY', payload: eq.id }));
            expect(result.current.state.equity).toHaveLength(count - 1);
        });
    });

    // --- Schedule Blocks ---
    describe('Schedule Blocks', () => {
        it('ADD_SCHEDULE_BLOCK appends', () => {
            const { result } = useTestStore();
            const count = result.current.state.scheduleBlocks.length;
            act(() => {
                result.current.addScheduleBlock({
                    date: '2026-03-20', time_slot: 'AM',
                    venture_id: result.current.state.ventures[0].id,
                    title: 'Dev Sprint',
                });
            });
            expect(result.current.state.scheduleBlocks).toHaveLength(count + 1);
        });

        it('UPDATE_SCHEDULE_BLOCK updates', () => {
            const { result } = useTestStore();
            const b = result.current.state.scheduleBlocks[0];
            act(() => result.current.dispatch({ type: 'UPDATE_SCHEDULE_BLOCK', payload: { ...b, title: 'Updated' } }));
            expect(result.current.state.scheduleBlocks.find(x => x.id === b.id)?.title).toBe('Updated');
        });

        it('DELETE_SCHEDULE_BLOCK removes', () => {
            const { result } = useTestStore();
            const b = result.current.state.scheduleBlocks[0];
            const count = result.current.state.scheduleBlocks.length;
            act(() => result.current.dispatch({ type: 'DELETE_SCHEDULE_BLOCK', payload: b.id }));
            expect(result.current.state.scheduleBlocks).toHaveLength(count - 1);
        });
    });

    // --- Implementation Plans ---
    describe('Implementation Plans', () => {
        it('ADD_PLAN appends', () => {
            const { result } = useTestStore();
            const count = result.current.state.implementationPlans.length;
            act(() => {
                result.current.addPlan({
                    venture_id: result.current.state.ventures[0].id,
                    name: 'Launch Plan', phases: [],
                });
            });
            expect(result.current.state.implementationPlans).toHaveLength(count + 1);
        });

        it('UPDATE_PLAN updates', () => {
            const { result } = useTestStore();
            const plan = result.current.state.implementationPlans[0];
            act(() => result.current.updatePlan({ ...plan, name: 'Renamed Plan' }));
            expect(result.current.state.implementationPlans.find(p => p.id === plan.id)?.name).toBe('Renamed Plan');
        });

        it('DELETE_PLAN removes', () => {
            const { result } = useTestStore();
            const plan = result.current.state.implementationPlans[0];
            const count = result.current.state.implementationPlans.length;
            act(() => result.current.deletePlan(plan.id));
            expect(result.current.state.implementationPlans).toHaveLength(count - 1);
        });

        it('ADD_PLAN_PHASE adds phase to plan', () => {
            const { result } = useTestStore();
            const plan = result.current.state.implementationPlans[0];
            const phaseCount = plan.phases.length;
            act(() => {
                result.current.addPhase(plan.id, {
                    plan_id: plan.id, name: 'New Phase',
                    status: 'not_started', order: phaseCount + 1,
                });
            });
            const updated = result.current.state.implementationPlans.find(p => p.id === plan.id)!;
            expect(updated.phases).toHaveLength(phaseCount + 1);
        });

        it('UPDATE_PLAN_PHASE updates a phase', () => {
            const { result } = useTestStore();
            const plan = result.current.state.implementationPlans[0];
            const phase = plan.phases[0];
            act(() => {
                result.current.updatePhase(plan.id, { ...phase, status: 'completed' });
            });
            const updated = result.current.state.implementationPlans.find(p => p.id === plan.id)!;
            expect(updated.phases.find(ph => ph.id === phase.id)?.status).toBe('completed');
        });

        it('DELETE_PLAN_PHASE removes a phase', () => {
            const { result } = useTestStore();
            const plan = result.current.state.implementationPlans[0];
            const phase = plan.phases[0];
            const phaseCount = plan.phases.length;
            act(() => result.current.deletePhase(plan.id, phase.id));
            const updated = result.current.state.implementationPlans.find(p => p.id === plan.id)!;
            expect(updated.phases).toHaveLength(phaseCount - 1);
        });
    });

    // --- UI State ---
    describe('UI State', () => {
        it('SET_FILTERS merges partial filters', () => {
            const { result } = useTestStore();
            act(() => result.current.dispatch({ type: 'SET_FILTERS', payload: { search: 'test' } }));
            expect(result.current.state.filters.search).toBe('test');
            expect(result.current.state.filters.tier).toBe('all'); // unchanged
        });

        it('SELECT_VENTURE sets selectedVentureId', () => {
            const { result } = useTestStore();
            const id = result.current.state.ventures[0].id;
            act(() => result.current.dispatch({ type: 'SELECT_VENTURE', payload: id }));
            expect(result.current.state.selectedVentureId).toBe(id);
            act(() => result.current.dispatch({ type: 'SELECT_VENTURE', payload: null }));
            expect(result.current.state.selectedVentureId).toBeNull();
        });

        it('SET_ACTIVE_VIEW changes active view', () => {
            const { result } = useTestStore();
            act(() => result.current.dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'tasks' }));
            expect(result.current.state.activeView).toBe('tasks');
        });

        it('TOGGLE_SIDEBAR flips sidebarCollapsed', () => {
            const { result } = useTestStore();
            expect(result.current.state.sidebarCollapsed).toBe(false);
            act(() => result.current.dispatch({ type: 'TOGGLE_SIDEBAR' }));
            expect(result.current.state.sidebarCollapsed).toBe(true);
            act(() => result.current.dispatch({ type: 'TOGGLE_SIDEBAR' }));
            expect(result.current.state.sidebarCollapsed).toBe(false);
        });

        it('SET_LOADING sets loading flag', () => {
            const { result } = useTestStore();
            act(() => result.current.dispatch({ type: 'SET_LOADING', payload: true }));
            expect(result.current.state.isLoading).toBe(true);
        });

        it('LOAD_STATE merges partial state', () => {
            const { result } = useTestStore();
            act(() => result.current.dispatch({ type: 'LOAD_STATE', payload: { activeView: 'settings' } }));
            expect(result.current.state.activeView).toBe('settings');
        });
    });

    // --- Computed Selectors ---
    describe('Computed Selectors', () => {
        it('venturesWithStats enriches ventures with task data', () => {
            const { result } = useTestStore();
            const vws = result.current.venturesWithStats;
            expect(vws.length).toBe(result.current.state.ventures.length);
            expect(vws[0]).toHaveProperty('tasks');
            expect(vws[0]).toHaveProperty('healthScore');
            expect(vws[0].tasks).toHaveProperty('total');
            expect(vws[0].tasks).toHaveProperty('done');
        });

        it('filteredVentures applies tier filter', () => {
            const { result } = useTestStore();
            act(() => result.current.dispatch({ type: 'SET_FILTERS', payload: { tier: 'Parked' } }));
            const filtered = result.current.filteredVentures;
            expect(filtered.every(v => v.tier === 'Parked')).toBe(true);
        });

        it('filteredVentures applies geo filter', () => {
            const { result } = useTestStore();
            act(() => result.current.dispatch({ type: 'SET_FILTERS', payload: { geo: 'UK' } }));
            const filtered = result.current.filteredVentures;
            expect(filtered.every(v => v.geo === 'UK')).toBe(true);
        });

        it('filteredVentures applies search filter', () => {
            const { result } = useTestStore();
            act(() => result.current.dispatch({ type: 'SET_FILTERS', payload: { search: 'trucycle' } }));
            const filtered = result.current.filteredVentures;
            expect(filtered.length).toBe(1);
            expect(filtered[0].name).toBe('TruCycle');
        });

        it('filteredVentures sorts by health', () => {
            const { result } = useTestStore();
            act(() => result.current.dispatch({ type: 'SET_FILTERS', payload: { sortBy: 'health' } }));
            const scores = result.current.filteredVentures.map(v => v.healthScore);
            for (let i = 1; i < scores.length; i++) {
                expect(scores[i - 1]).toBeGreaterThanOrEqual(scores[i]);
            }
        });

        it('selectedVenture returns enriched venture when selected', () => {
            const { result } = useTestStore();
            expect(result.current.selectedVenture).toBeNull();
            act(() => result.current.dispatch({ type: 'SELECT_VENTURE', payload: result.current.state.ventures[0].id }));
            expect(result.current.selectedVenture).not.toBeNull();
            expect(result.current.selectedVenture?.id).toBe(result.current.state.ventures[0].id);
        });

        it('portfolioStats aggregates correctly', () => {
            const { result } = useTestStore();
            const stats = result.current.portfolioStats;
            expect(stats.totalVentures).toBe(result.current.state.ventures.length);
            expect(stats.totalTasks).toBe(result.current.state.tasks.length);
            expect(stats.doneTasks).toBeLessThanOrEqual(stats.totalTasks);
            expect(stats.avgHealth).toBeGreaterThanOrEqual(0);
            expect(stats.avgHealth).toBeLessThanOrEqual(100);
        });
    });

    // --- Persistence ---
    describe('Persistence', () => {
        it('saves state to localStorage on changes', () => {
            const { result } = useTestStore();
            act(() => {
                result.current.addTask({
                    venture_id: result.current.state.ventures[0].id,
                    title: 'Persist Test', status: 'todo', priority: 'P2',
                });
            });
            const saved = JSON.parse(localStorage.getItem('vcc-state')!);
            expect(saved.tasks.some((t: { title: string }) => t.title === 'Persist Test')).toBe(true);
        });
    });
});
