// ============================================================
// useSlackNotifier — Dispatch Slack notifications on state changes
// ============================================================
// Watches for task completions, blockers, milestone updates, and
// health score changes, then sends webhook notifications.
// ============================================================

import { useEffect, useRef } from 'react';
import { useStore } from '../lib/store';
import {
    sendSlackNotification,
    formatTaskDone,
    formatTaskBlocked,
    formatMilestoneUpdate,
    formatHealthChange,
    shouldNotify,
    isSlackWebhookValid,
} from '../lib/slack';
import type { Task, Milestone } from '../lib/types';

/**
 * Hook that monitors state changes and sends Slack notifications.
 * Should be mounted once at the app level.
 */
export function useSlackNotifier() {
    const { state, venturesWithStats } = useStore();
    const prevTasksRef = useRef<Task[]>(state.tasks);
    const prevMilestonesRef = useRef<Milestone[]>(state.milestones);
    const prevHealthRef = useRef<Map<string, number>>(new Map());

    // Initialize health scores
    useEffect(() => {
        const map = new Map<string, number>();
        for (const v of venturesWithStats) {
            map.set(v.id, v.healthScore);
        }
        prevHealthRef.current = map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Watch for task changes
    useEffect(() => {
        const prev = prevTasksRef.current;
        prevTasksRef.current = state.tasks;

        // Skip on first render
        if (prev === state.tasks) return;

        for (const task of state.tasks) {
            const prevTask = prev.find(t => t.id === task.id);
            if (!prevTask || prevTask.status === task.status) continue;

            const venture = state.ventures.find(v => v.id === task.venture_id);
            if (!venture?.integrations?.slack) continue;
            const { webhook_url, notify_on } = venture.integrations.slack;
            if (!isSlackWebhookValid(webhook_url)) continue;

            if (task.status === 'done' && shouldNotify(notify_on, 'task_done')) {
                sendSlackNotification(webhook_url, formatTaskDone(venture.name, task.title));
            } else if (task.status === 'blocked' && shouldNotify(notify_on, 'task_blocked')) {
                sendSlackNotification(webhook_url, formatTaskBlocked(venture.name, task.title));
            }
        }
    }, [state.tasks, state.ventures]);

    // Watch for milestone changes
    useEffect(() => {
        const prev = prevMilestonesRef.current;
        prevMilestonesRef.current = state.milestones;

        if (prev === state.milestones) return;

        for (const milestone of state.milestones) {
            const prevMilestone = prev.find(m => m.id === milestone.id);
            if (!prevMilestone || prevMilestone.progress === milestone.progress) continue;

            const venture = state.ventures.find(v => v.id === milestone.venture_id);
            if (!venture?.integrations?.slack) continue;
            const { webhook_url, notify_on } = venture.integrations.slack;
            if (!isSlackWebhookValid(webhook_url) || !shouldNotify(notify_on, 'milestone_update')) continue;

            sendSlackNotification(webhook_url, formatMilestoneUpdate(venture.name, milestone.name, milestone.progress));
        }
    }, [state.milestones, state.ventures]);

    // Watch for health score changes
    useEffect(() => {
        const prev = prevHealthRef.current;
        const next = new Map<string, number>();

        for (const v of venturesWithStats) {
            next.set(v.id, v.healthScore);
            const oldScore = prev.get(v.id);
            if (oldScore === undefined || oldScore === v.healthScore) continue;

            // Only notify on significant changes (>= 5 point shift)
            if (Math.abs(v.healthScore - oldScore) < 5) continue;

            if (!v.integrations?.slack) continue;
            const { webhook_url, notify_on } = v.integrations.slack;
            if (!isSlackWebhookValid(webhook_url) || !shouldNotify(notify_on, 'health_change')) continue;

            sendSlackNotification(webhook_url, formatHealthChange(v.name, oldScore, v.healthScore));
        }

        prevHealthRef.current = next;
    }, [venturesWithStats]);
}

export default useSlackNotifier;
