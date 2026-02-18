// ============================================================
// Utility Functions
// ============================================================

import type { VentureWithStats, TaskSummary, Task, TeamRole, Registration, RegistrationSummary, TeamSummary } from './types';

/**
 * Calculate health score (0-100) from venture stats
 * Weighted formula:
 *   - Task velocity (30%): ratio of done tasks
 *   - Blocker penalty (20%): penalize for blocked tasks
 *   - Team coverage (20%): filled/total roles
 *   - Milestone progress (20%): average milestone completion
 *   - Registration completion (10%)
 */
export function computeHealthScore(venture: VentureWithStats): number {
    const { tasks, team, regs, milestones } = venture;

    // Task velocity: done / total
    const taskScore = tasks.total > 0 ? (tasks.done / tasks.total) * 100 : 0;

    // Blocker penalty: more blockers = lower score
    const blockerPenalty = tasks.total > 0
        ? Math.max(0, 100 - (tasks.blocked / tasks.total) * 300)
        : 100;

    // Team coverage
    const teamScore = team.total > 0 ? (team.filled / team.total) * 100 : 50;

    // Milestone progress (average)
    const milestoneScore = milestones.length > 0
        ? milestones.reduce((sum, m) => sum + m.progress, 0) / milestones.length
        : 0;

    // Registration completion
    const regScore = (regs.completedCount / regs.totalCount) * 100;

    const weighted =
        taskScore * 0.3 +
        blockerPenalty * 0.2 +
        teamScore * 0.2 +
        milestoneScore * 0.2 +
        regScore * 0.1;

    return Math.round(Math.min(100, Math.max(0, weighted)));
}

/**
 * Compute task summary from task array
 */
export function computeTaskSummary(tasks: Task[]): TaskSummary {
    return {
        total: tasks.length,
        done: tasks.filter(t => t.status === 'done').length,
        inProgress: tasks.filter(t => t.status === 'in-progress').length,
        blocked: tasks.filter(t => t.status === 'blocked').length,
        backlog: tasks.filter(t => t.status === 'backlog').length,
        todo: tasks.filter(t => t.status === 'todo').length,
        review: tasks.filter(t => t.status === 'review').length,
    };
}

/**
 * Compute team summary from roles array
 */
export function computeTeamSummary(roles: TeamRole[]): TeamSummary {
    return {
        total: roles.length,
        filled: roles.filter(r => r.status === 'filled').length,
        roles,
    };
}

/**
 * Compute registration summary from registrations array
 */
export function computeRegistrationSummary(regs: Registration[]): RegistrationSummary {
    const byType = (type: string) => regs.find(r => r.type === type)?.completed ?? false;
    const completedCount = regs.filter(r => r.completed).length;
    return {
        domain: byType('domain'),
        company: byType('company'),
        bank: byType('bank'),
        legal: byType('legal'),
        completedCount,
        totalCount: 4,
    };
}

/**
 * Format a date string for display
 */
export function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Format relative time (e.g., "3 days ago")
 */
export function formatRelativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    return formatDate(dateStr);
}

/** 
 * Get tier color config
 */
export const tierColors: Record<string, { bg: string; fg: string; border: string }> = {
    'Active Build': { bg: '#D5F5E3', fg: '#27AE60', border: '#27AE60' },
    'Incubating': { bg: '#D6EAF8', fg: '#2E86C1', border: '#2E86C1' },
    'Parked': { bg: '#F2F3F4', fg: '#95A5A6', border: '#95A5A6' },
};

/**
 * Get status colors for tasks
 */
export const taskStatusColors: Record<string, string> = {
    backlog: '#95A5A6',
    todo: '#3498DB',
    'in-progress': '#2E86C1',
    review: '#8E44AD',
    done: '#27AE60',
    blocked: '#E74C3C',
};

/**
 * Get priority config
 */
export const priorityConfig: Record<string, { label: string; color: string; icon: string }> = {
    P0: { label: 'Critical', color: '#E74C3C', icon: '🔴' },
    P1: { label: 'High', color: '#E67E22', icon: '🟠' },
    P2: { label: 'Medium', color: '#F1C40F', icon: '🟡' },
    P3: { label: 'Low', color: '#95A5A6', icon: '⚪' },
};

/**
 * Generate a unique ID
 */
export function generateId(): string {
    return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}
