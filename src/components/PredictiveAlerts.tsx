// ============================================================
// Predictive Alerts — Proactive risk / deadline warnings
// ============================================================
// Scans ventures, tasks, milestones, risks, and financials to
// surface timely alerts the user hasn't asked for yet.
// ============================================================

import { useMemo } from 'react';
import { useStore } from '../lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle, Clock, TrendingDown, Users,
    ShieldAlert, DollarSign, Zap, ArrowRight
} from 'lucide-react';

// --- Alert types ---
interface PredictiveAlert {
    id: string;
    severity: 'critical' | 'warning' | 'info';
    category: 'deadline' | 'blocker' | 'velocity' | 'team' | 'risk' | 'financial';
    title: string;
    detail: string;
    ventureId?: string;
    actionLabel?: string;
    actionView?: string;
}

const categoryIcons: Record<string, typeof AlertTriangle> = {
    deadline: Clock,
    blocker: AlertTriangle,
    velocity: TrendingDown,
    team: Users,
    risk: ShieldAlert,
    financial: DollarSign,
};

const severityColors: Record<string, string> = {
    critical: 'var(--color-danger)',
    warning: 'var(--color-warning)',
    info: 'var(--color-info)',
};

export default function PredictiveAlerts() {
    const { state, venturesWithStats, dispatch } = useStore();

    const alerts = useMemo<PredictiveAlert[]>(() => {
        const now = new Date();
        const result: PredictiveAlert[] = [];

        // 1. Milestone deadline alerts
        state.milestones.forEach(m => {
            const target = new Date(m.target_date);
            const daysUntil = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            const v = state.ventures.find(v => v.id === m.venture_id);
            if (daysUntil < 0 && m.progress < 100) {
                result.push({
                    id: `ms-overdue-${m.id}`,
                    severity: 'critical',
                    category: 'deadline',
                    title: `"${m.name}" is overdue`,
                    detail: `${v?.name}: This milestone was due ${Math.abs(daysUntil)} days ago and is only ${m.progress}% complete.`,
                    ventureId: m.venture_id,
                    actionLabel: 'View Timeline',
                    actionView: 'timeline',
                });
            } else if (daysUntil <= 14 && daysUntil > 0 && m.progress < 50) {
                result.push({
                    id: `ms-atrisk-${m.id}`,
                    severity: 'warning',
                    category: 'deadline',
                    title: `"${m.name}" at risk`,
                    detail: `${v?.name}: Due in ${daysUntil} days but only ${m.progress}% done. Needs acceleration.`,
                    ventureId: m.venture_id,
                    actionLabel: 'View Timeline',
                    actionView: 'timeline',
                });
            } else if (daysUntil <= 30 && daysUntil > 14 && m.progress < 25) {
                result.push({
                    id: `ms-slow-${m.id}`,
                    severity: 'info',
                    category: 'velocity',
                    title: `"${m.name}" progressing slowly`,
                    detail: `${v?.name}: ${daysUntil} days remaining but only ${m.progress}% progress.`,
                    ventureId: m.venture_id,
                });
            }
        });

        // 2. Blocker accumulation
        venturesWithStats.forEach(v => {
            if (v.tasks.blocked >= 2) {
                result.push({
                    id: `blocker-${v.id}`,
                    severity: v.tasks.blocked >= 3 ? 'critical' : 'warning',
                    category: 'blocker',
                    title: `${v.name} has ${v.tasks.blocked} blocked tasks`,
                    detail: `Multiple blockers suggest systemic issues. Review dependencies and external requirements.`,
                    ventureId: v.id,
                    actionLabel: 'View Tasks',
                    actionView: 'tasks',
                });
            }
        });

        // 3. Team capacity gaps
        venturesWithStats.forEach(v => {
            const hiringCount = state.teamRoles.filter(r => r.venture_id === v.id && r.status === 'hiring').length;
            if (hiringCount >= 3 && v.tier === 'Active Build') {
                result.push({
                    id: `team-${v.id}`,
                    severity: 'warning',
                    category: 'team',
                    title: `${v.name}: ${hiringCount} unfilled roles`,
                    detail: `Active Build venture with significant team gaps. This could delay milestones.`,
                    ventureId: v.id,
                });
            }
        });

        // 4. Health score decline
        venturesWithStats.forEach(v => {
            const snapshots = state.healthSnapshots
                .filter(s => s.venture_id === v.id)
                .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
            if (snapshots.length >= 2) {
                const latest = snapshots[0].score;
                const previous = snapshots[1].score;
                if (latest < previous - 5) {
                    result.push({
                        id: `health-decline-${v.id}`,
                        severity: 'warning',
                        category: 'velocity',
                        title: `${v.name} health declining`,
                        detail: `Health dropped from ${previous} → ${latest}. Review recent changes and blockers.`,
                        ventureId: v.id,
                        actionLabel: 'View Analytics',
                        actionView: 'analytics',
                    });
                }
            }
        });

        // 5. Active high-impact risks
        state.risks.filter(r => r.status === 'active' && r.likelihood >= 3 && r.impact >= 4).forEach(r => {
            const v = state.ventures.find(v => v.id === r.venture_id);
            result.push({
                id: `risk-${r.id}`,
                severity: r.likelihood >= 4 && r.impact >= 4 ? 'critical' : 'warning',
                category: 'risk',
                title: r.title,
                detail: `${v?.name}: ${r.description || 'High likelihood × high impact risk'}.${r.mitigation ? ' Mitigation: ' + r.mitigation : ''}`,
                ventureId: r.venture_id,
                actionLabel: 'View Risks',
                actionView: 'risks',
            });
        });

        // 6. No tasks due soon (stagnation)
        const tasksInProgress = state.tasks.filter(t => t.status === 'in-progress');
        if (tasksInProgress.length === 0) {
            result.push({
                id: 'stagnation',
                severity: 'warning',
                category: 'velocity',
                title: 'No tasks currently in progress',
                detail: 'There are no active tasks across your entire portfolio. Consider starting work on high-priority items.',
                actionLabel: 'View Tasks',
                actionView: 'tasks',
            });
        }

        // 7. Overdue recurring tasks
        state.recurringTasks.filter(rt => rt.active).forEach(rt => {
            const due = new Date(rt.next_due);
            if (due < now) {
                const v = state.ventures.find(v => v.id === rt.venture_id);
                result.push({
                    id: `recurring-${rt.id}`,
                    severity: 'info',
                    category: 'deadline',
                    title: `Recurring task overdue: ${rt.title}`,
                    detail: `${v?.name}: Was due ${Math.ceil((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))} days ago. Generate or reschedule.`,
                    ventureId: rt.venture_id,
                    actionLabel: 'View Recurring',
                    actionView: 'recurring',
                });
            }
        });

        // Sort: critical first, then warning, then info
        return result.sort((a, b) => {
            const sev = { critical: 0, warning: 1, info: 2 };
            return sev[a.severity] - sev[b.severity];
        });
    }, [state, venturesWithStats]);

    const criticalCount = alerts.filter(a => a.severity === 'critical').length;
    const warningCount = alerts.filter(a => a.severity === 'warning').length;
    const infoCount = alerts.filter(a => a.severity === 'info').length;

    return (
        <div>
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 'var(--space-5)',
            }}>
                <div>
                    <h2 style={{
                        fontSize: 'var(--font-size-xl)', fontWeight: 700,
                        color: 'var(--color-text-primary)', marginBottom: 4,
                    }}>
                        <Zap size={20} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
                        Predictive Alerts
                    </h2>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                        AI-powered early warnings across your portfolio
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    {criticalCount > 0 && (
                        <span className="badge" style={{ background: 'var(--color-danger)', color: '#fff', padding: '4px 12px' }}>
                            🚨 {criticalCount} critical
                        </span>
                    )}
                    {warningCount > 0 && (
                        <span className="badge" style={{ background: 'var(--color-warning)', color: '#000', padding: '4px 12px' }}>
                            ⚠️ {warningCount} warning
                        </span>
                    )}
                    {infoCount > 0 && (
                        <span className="badge" style={{ background: 'var(--color-info)', color: '#fff', padding: '4px 12px' }}>
                            💡 {infoCount} info
                        </span>
                    )}
                </div>
            </div>

            {/* Alert cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <AnimatePresence>
                    {alerts.map((alert, i) => {
                        const Icon = categoryIcons[alert.category] || AlertTriangle;
                        const v = alert.ventureId ? state.ventures.find(v => v.id === alert.ventureId) : null;
                        return (
                            <motion.div
                                key={alert.id}
                                className="card card-body"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                style={{
                                    borderLeft: `3px solid ${severityColors[alert.severity]}`,
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                                            marginBottom: 'var(--space-2)',
                                        }}>
                                            <Icon size={14} color={severityColors[alert.severity]} />
                                            <span style={{
                                                fontSize: 'var(--font-size-xs)',
                                                textTransform: 'uppercase',
                                                fontWeight: 700,
                                                letterSpacing: '0.5px',
                                                color: severityColors[alert.severity],
                                            }}>
                                                {alert.severity}
                                            </span>
                                            {v && (
                                                <span style={{
                                                    fontSize: 'var(--font-size-xs)',
                                                    padding: '1px 8px',
                                                    borderRadius: 'var(--border-radius-full)',
                                                    background: `${v.color}18`,
                                                    color: v.color,
                                                    fontWeight: 600,
                                                }}>
                                                    {v.prefix}
                                                </span>
                                            )}
                                            <span style={{
                                                fontSize: 'var(--font-size-xs)',
                                                padding: '1px 8px',
                                                borderRadius: 'var(--border-radius-full)',
                                                background: 'var(--color-bg-secondary)',
                                                color: 'var(--color-text-muted)',
                                            }}>
                                                {alert.category}
                                            </span>
                                        </div>
                                        <div style={{
                                            fontWeight: 600,
                                            fontSize: 'var(--font-size-md)',
                                            color: 'var(--color-text-primary)',
                                            marginBottom: 4,
                                        }}>
                                            {alert.title}
                                        </div>
                                        <div style={{
                                            fontSize: 'var(--font-size-sm)',
                                            color: 'var(--color-text-secondary)',
                                            lineHeight: 1.5,
                                        }}>
                                            {alert.detail}
                                        </div>
                                    </div>
                                    {alert.actionLabel && alert.actionView && (
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            style={{ whiteSpace: 'nowrap', marginLeft: 'var(--space-3)' }}
                                            onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', payload: alert.actionView as any })}
                                        >
                                            {alert.actionLabel}
                                            <ArrowRight size={12} />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {alerts.length === 0 && (
                <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                    <Zap size={40} style={{ opacity: 0.15, marginBottom: 'var(--space-3)' }} />
                    <div className="empty-state-title">All clear! 🎉</div>
                    <div className="empty-state-text">
                        No predictive alerts at this time. Your portfolio looks healthy.
                    </div>
                </div>
            )}
        </div>
    );
}
