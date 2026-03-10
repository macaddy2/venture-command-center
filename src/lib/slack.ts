// ============================================================
// Slack Integration — Webhook notifications for venture events
// ============================================================
// Sends formatted messages to Slack channels via incoming webhooks.
// All operations are fire-and-forget with graceful error handling.
// ============================================================

import type { SlackNotifyEvent } from './types';

export interface SlackBlock {
    type: string;
    text?: { type: string; text: string; emoji?: boolean };
    fields?: { type: string; text: string }[];
    elements?: { type: string; text: string }[];
}

export interface SlackMessage {
    text: string;
    blocks?: SlackBlock[];
}

/**
 * Check if a Slack webhook URL is configured (non-empty, valid format).
 */
export function isSlackWebhookValid(url: string | undefined): boolean {
    if (!url) return false;
    return url.startsWith('https://hooks.slack.com/');
}

/**
 * Send a notification to a Slack channel via incoming webhook.
 * Fire-and-forget — errors are logged but never thrown.
 */
export async function sendSlackNotification(webhookUrl: string, message: SlackMessage): Promise<boolean> {
    if (!isSlackWebhookValid(webhookUrl)) return false;

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message),
        });
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Format a task completion notification.
 */
export function formatTaskDone(ventureName: string, taskTitle: string): SlackMessage {
    return {
        text: `[${ventureName}] Task completed: ${taskTitle}`,
        blocks: [
            {
                type: 'section',
                text: { type: 'mrkdwn', text: `:white_check_mark: *Task Completed*\n*${ventureName}*: ${taskTitle}` },
            },
        ],
    };
}

/**
 * Format a task blocked notification.
 */
export function formatTaskBlocked(ventureName: string, taskTitle: string): SlackMessage {
    return {
        text: `[${ventureName}] Task blocked: ${taskTitle}`,
        blocks: [
            {
                type: 'section',
                text: { type: 'mrkdwn', text: `:no_entry: *Task Blocked*\n*${ventureName}*: ${taskTitle}` },
            },
        ],
    };
}

/**
 * Format a milestone progress notification.
 */
export function formatMilestoneUpdate(ventureName: string, milestoneName: string, progress: number): SlackMessage {
    return {
        text: `[${ventureName}] Milestone update: ${milestoneName} — ${progress}%`,
        blocks: [
            {
                type: 'section',
                text: { type: 'mrkdwn', text: `:dart: *Milestone Update*\n*${ventureName}*: ${milestoneName} — ${progress}% complete` },
            },
        ],
    };
}

/**
 * Format a health score change alert.
 */
export function formatHealthChange(ventureName: string, oldScore: number, newScore: number): SlackMessage {
    const direction = newScore > oldScore ? ':arrow_up:' : ':arrow_down:';
    const severity = newScore < 35 ? ':warning: ' : '';
    return {
        text: `[${ventureName}] Health score: ${oldScore} → ${newScore}`,
        blocks: [
            {
                type: 'section',
                text: { type: 'mrkdwn', text: `${severity}${direction} *Health Score Change*\n*${ventureName}*: ${oldScore} → ${newScore}` },
            },
        ],
    };
}

/**
 * Test a Slack webhook by sending a test message.
 */
export async function testSlackWebhook(webhookUrl: string): Promise<boolean> {
    return sendSlackNotification(webhookUrl, {
        text: 'Venture Command Center — webhook test successful!',
        blocks: [
            {
                type: 'section',
                text: { type: 'mrkdwn', text: ':rocket: *Venture Command Center*\nSlack webhook connected successfully!' },
            },
        ],
    });
}

/**
 * Check if a specific event type should trigger a notification.
 */
export function shouldNotify(notifyOn: SlackNotifyEvent[] | undefined, event: SlackNotifyEvent): boolean {
    if (!notifyOn || notifyOn.length === 0) return false;
    return notifyOn.includes(event);
}
