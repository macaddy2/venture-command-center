import { describe, it, expect } from 'vitest';
import {
    computeHealthScore,
    computeTaskSummary,
    computeTeamSummary,
    computeRegistrationSummary,
    formatDate,
    formatRelativeTime,
    generateId,
    clamp,
    tierColors,
    taskStatusColors,
    priorityConfig,
} from '../lib/utils';
import type { Task, TeamRole, Registration, VentureWithStats } from '../lib/types';

describe('Utils', () => {
    // --- computeTaskSummary ---
    describe('computeTaskSummary', () => {
        it('returns zeros for empty array', () => {
            const summary = computeTaskSummary([]);
            expect(summary.total).toBe(0);
            expect(summary.done).toBe(0);
            expect(summary.inProgress).toBe(0);
            expect(summary.blocked).toBe(0);
        });

        it('counts each status correctly', () => {
            const tasks: Task[] = [
                { id: '1', venture_id: 'v1', title: 'A', status: 'done', priority: 'P1', created_at: '', updated_at: '' },
                { id: '2', venture_id: 'v1', title: 'B', status: 'done', priority: 'P2', created_at: '', updated_at: '' },
                { id: '3', venture_id: 'v1', title: 'C', status: 'in-progress', priority: 'P0', created_at: '', updated_at: '' },
                { id: '4', venture_id: 'v1', title: 'D', status: 'blocked', priority: 'P0', created_at: '', updated_at: '' },
                { id: '5', venture_id: 'v1', title: 'E', status: 'todo', priority: 'P1', created_at: '', updated_at: '' },
                { id: '6', venture_id: 'v1', title: 'F', status: 'backlog', priority: 'P3', created_at: '', updated_at: '' },
                { id: '7', venture_id: 'v1', title: 'G', status: 'review', priority: 'P2', created_at: '', updated_at: '' },
            ];
            const summary = computeTaskSummary(tasks);
            expect(summary.total).toBe(7);
            expect(summary.done).toBe(2);
            expect(summary.inProgress).toBe(1);
            expect(summary.blocked).toBe(1);
            expect(summary.todo).toBe(1);
            expect(summary.backlog).toBe(1);
            expect(summary.review).toBe(1);
        });
    });

    // --- computeTeamSummary ---
    describe('computeTeamSummary', () => {
        it('counts filled roles', () => {
            const roles: TeamRole[] = [
                { id: '1', venture_id: 'v1', role_name: 'CTO', status: 'filled', assignee_name: 'Alice' },
                { id: '2', venture_id: 'v1', role_name: 'Dev', status: 'hiring' },
                { id: '3', venture_id: 'v1', role_name: 'PM', status: 'filled', assignee_name: 'Bob' },
            ];
            const summary = computeTeamSummary(roles);
            expect(summary.total).toBe(3);
            expect(summary.filled).toBe(2);
            expect(summary.roles).toHaveLength(3);
        });

        it('handles empty array', () => {
            const summary = computeTeamSummary([]);
            expect(summary.total).toBe(0);
            expect(summary.filled).toBe(0);
        });
    });

    // --- computeRegistrationSummary ---
    describe('computeRegistrationSummary', () => {
        it('returns correct boolean flags', () => {
            const regs: Registration[] = [
                { id: '1', venture_id: 'v1', type: 'domain', completed: true },
                { id: '2', venture_id: 'v1', type: 'company', completed: false },
                { id: '3', venture_id: 'v1', type: 'bank', completed: true },
                { id: '4', venture_id: 'v1', type: 'legal', completed: false },
            ];
            const summary = computeRegistrationSummary(regs);
            expect(summary.domain).toBe(true);
            expect(summary.company).toBe(false);
            expect(summary.bank).toBe(true);
            expect(summary.legal).toBe(false);
            expect(summary.completedCount).toBe(2);
            expect(summary.totalCount).toBe(4);
        });

        it('returns false for missing types', () => {
            const summary = computeRegistrationSummary([]);
            expect(summary.domain).toBe(false);
            expect(summary.completedCount).toBe(0);
        });
    });

    // --- computeHealthScore ---
    describe('computeHealthScore', () => {
        function makeVentureWithStats(overrides: Partial<VentureWithStats> = {}): VentureWithStats {
            return {
                id: 'v1', name: 'Test', prefix: 'T', geo: 'UK', tier: 'Active Build',
                status: 'Active', stage: 'MVP', color: '#000', lightColor: '#fff',
                created_at: '', updated_at: '',
                tasks: { total: 10, done: 5, inProgress: 3, blocked: 0, backlog: 1, todo: 1, review: 0 },
                milestones: [{ id: 'm1', venture_id: 'v1', name: 'M1', target_date: '2026-06-01', progress: 50, created_at: '', updated_at: '' }],
                team: { total: 4, filled: 3, roles: [] },
                regs: { domain: true, company: true, bank: false, legal: false, completedCount: 2, totalCount: 4 },
                github: null,
                healthScore: 0,
                ...overrides,
            };
        }

        it('returns 0-100 range', () => {
            const score = computeHealthScore(makeVentureWithStats());
            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(100);
        });

        it('penalizes blocked tasks', () => {
            const noBlockers = computeHealthScore(makeVentureWithStats({
                tasks: { total: 10, done: 5, inProgress: 5, blocked: 0, backlog: 0, todo: 0, review: 0 },
            }));
            const withBlockers = computeHealthScore(makeVentureWithStats({
                tasks: { total: 10, done: 5, inProgress: 2, blocked: 3, backlog: 0, todo: 0, review: 0 },
            }));
            expect(noBlockers).toBeGreaterThan(withBlockers);
        });

        it('rewards higher task velocity', () => {
            const lowVelocity = computeHealthScore(makeVentureWithStats({
                tasks: { total: 10, done: 1, inProgress: 5, blocked: 0, backlog: 4, todo: 0, review: 0 },
            }));
            const highVelocity = computeHealthScore(makeVentureWithStats({
                tasks: { total: 10, done: 8, inProgress: 2, blocked: 0, backlog: 0, todo: 0, review: 0 },
            }));
            expect(highVelocity).toBeGreaterThan(lowVelocity);
        });

        it('handles zero tasks gracefully', () => {
            const score = computeHealthScore(makeVentureWithStats({
                tasks: { total: 0, done: 0, inProgress: 0, blocked: 0, backlog: 0, todo: 0, review: 0 },
            }));
            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(100);
        });

        it('handles zero milestones gracefully', () => {
            const score = computeHealthScore(makeVentureWithStats({ milestones: [] }));
            expect(score).toBeGreaterThanOrEqual(0);
        });

        it('rewards full team coverage', () => {
            const partial = computeHealthScore(makeVentureWithStats({
                team: { total: 4, filled: 1, roles: [] },
            }));
            const full = computeHealthScore(makeVentureWithStats({
                team: { total: 4, filled: 4, roles: [] },
            }));
            expect(full).toBeGreaterThan(partial);
        });
    });

    // --- formatDate ---
    describe('formatDate', () => {
        it('formats date in en-GB format', () => {
            const result = formatDate('2026-03-18T00:00:00Z');
            expect(result).toContain('Mar');
            expect(result).toContain('2026');
            expect(result).toContain('18');
        });
    });

    // --- formatRelativeTime ---
    describe('formatRelativeTime', () => {
        it('returns "just now" for recent times', () => {
            const result = formatRelativeTime(new Date().toISOString());
            expect(result).toBe('just now');
        });

        it('returns minutes for < 1 hour', () => {
            const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
            expect(formatRelativeTime(tenMinsAgo)).toBe('10m ago');
        });

        it('returns hours for < 1 day', () => {
            const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
            expect(formatRelativeTime(twoHoursAgo)).toBe('2h ago');
        });

        it('returns days for < 1 week', () => {
            const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
            expect(formatRelativeTime(threeDaysAgo)).toBe('3d ago');
        });

        it('returns weeks for < 4 weeks', () => {
            const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
            expect(formatRelativeTime(twoWeeksAgo)).toBe('2w ago');
        });

        it('returns formatted date for old times', () => {
            const result = formatRelativeTime('2025-01-01T00:00:00Z');
            expect(result).toContain('Jan');
            expect(result).toContain('2025');
        });
    });

    // --- generateId ---
    describe('generateId', () => {
        it('returns a string', () => {
            const id = generateId();
            expect(typeof id).toBe('string');
            expect(id.length).toBeGreaterThan(0);
        });

        it('returns unique ids', () => {
            const ids = new Set(Array.from({ length: 50 }, () => generateId()));
            expect(ids.size).toBe(50);
        });
    });

    // --- clamp ---
    describe('clamp', () => {
        it('clamps below min', () => {
            expect(clamp(-5, 0, 100)).toBe(0);
        });

        it('clamps above max', () => {
            expect(clamp(150, 0, 100)).toBe(100);
        });

        it('returns value when in range', () => {
            expect(clamp(50, 0, 100)).toBe(50);
        });

        it('handles min === max', () => {
            expect(clamp(10, 5, 5)).toBe(5);
        });
    });

    // --- Config objects ---
    describe('Config objects', () => {
        it('tierColors has all tiers', () => {
            expect(tierColors).toHaveProperty('Active Build');
            expect(tierColors).toHaveProperty('Incubating');
            expect(tierColors).toHaveProperty('Parked');
        });

        it('taskStatusColors has all statuses', () => {
            for (const status of ['backlog', 'todo', 'in-progress', 'review', 'done', 'blocked']) {
                expect(taskStatusColors).toHaveProperty(status);
            }
        });

        it('priorityConfig has all priorities', () => {
            for (const p of ['P0', 'P1', 'P2', 'P3']) {
                expect(priorityConfig).toHaveProperty(p);
                expect(priorityConfig[p]).toHaveProperty('label');
                expect(priorityConfig[p]).toHaveProperty('color');
                expect(priorityConfig[p]).toHaveProperty('icon');
            }
        });
    });
});
