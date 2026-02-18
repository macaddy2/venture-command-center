// ============================================================
// Detail Panel — Right side venture detail view
// ============================================================

import type { VentureWithStats } from '../lib/types';
import { useStore } from '../lib/store';
import {
    X, CheckCircle2, AlertTriangle, Clock, Target,
    Users, GitBranch, FileText
} from 'lucide-react';

interface Props {
    venture: VentureWithStats;
    onClose: () => void;
}

export default function DetailPanel({ venture: v, onClose }: Props) {
    const { state } = useStore();
    const progress = v.tasks.total > 0 ? Math.round((v.tasks.done / v.tasks.total) * 100) : 0;

    const healthColor = v.healthScore >= 60 ? 'var(--color-success)'
        : v.healthScore >= 35 ? 'var(--color-warning)'
            : 'var(--color-danger)';

    // Recent tasks for this venture
    const ventureTasks = state.tasks
        .filter(t => t.venture_id === v.id)
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    return (
        <div className="detail-panel animate-slide-in">
            {/* Header */}
            <div className="detail-panel-header">
                <div style={{
                    width: 44, height: 44, borderRadius: 'var(--border-radius-md)',
                    background: v.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: 'var(--font-size-lg)', flexShrink: 0,
                }}>
                    {v.prefix}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        {v.name}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>
                        {v.geo === 'UK' ? '🇬🇧' : '🇳🇬'} {v.geo} · {v.tier} · {v.status}
                    </div>
                </div>
                <div style={{
                    fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: healthColor,
                    textAlign: 'center', lineHeight: 1,
                }}>
                    {v.healthScore}
                    <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 500, color: 'var(--color-text-muted)' }}>health</div>
                </div>
                <button className="btn btn-ghost btn-icon" onClick={onClose}>
                    <X size={18} />
                </button>
            </div>

            {/* Body */}
            <div className="detail-panel-body">
                {/* Description */}
                {v.description && (
                    <p style={{
                        fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)',
                        marginBottom: 'var(--space-4)', lineHeight: 1.6,
                    }}>
                        {v.description}
                    </p>
                )}

                {/* Task Progress */}
                <div className="detail-panel-section">
                    <div className="detail-section-title">
                        <Target size={14} />
                        Task Progress
                    </div>
                    <div className="progress-bar lg" style={{ marginBottom: 'var(--space-3)' }}>
                        <div className="progress-bar-fill" style={{
                            width: `${progress}%`,
                            background: `linear-gradient(90deg, ${v.color}, ${v.color}CC)`,
                        }} />
                    </div>
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)',
                        textAlign: 'center',
                    }}>
                        {[
                            { label: 'Done', val: v.tasks.done, icon: CheckCircle2, c: 'var(--color-success)' },
                            { label: 'Active', val: v.tasks.inProgress, icon: Clock, c: 'var(--color-info)' },
                            { label: 'Blocked', val: v.tasks.blocked, icon: AlertTriangle, c: 'var(--color-danger)' },
                        ].map(s => (
                            <div key={s.label}>
                                <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: s.c }}>{s.val}</div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                    <s.icon size={10} />
                                    {s.label}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-3)',
                        paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-color)',
                        fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)',
                    }}>
                        <span>Todo: {v.tasks.todo}</span>
                        <span>Review: {v.tasks.review}</span>
                        <span>Backlog: {v.tasks.backlog}</span>
                        <span>Total: {v.tasks.total}</span>
                    </div>
                </div>

                {/* Registration Checklist */}
                <div className="detail-panel-section">
                    <div className="detail-section-title">
                        <FileText size={14} />
                        Registration Checklist
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                        {[
                            { label: 'Domain', done: v.regs.domain },
                            { label: 'Company Reg', done: v.regs.company },
                            { label: 'Bank Account', done: v.regs.bank },
                            { label: 'Legal Docs', done: v.regs.legal },
                        ].map(r => (
                            <div key={r.label} className="reg-item">
                                <span className={`reg-dot ${r.done ? 'done' : 'pending'}`} />
                                <span style={{ color: r.done ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                                    {r.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Team */}
                {v.team.total > 0 && (
                    <div className="detail-panel-section">
                        <div className="detail-section-title">
                            <Users size={14} />
                            Team ({v.team.filled}/{v.team.total} filled)
                        </div>
                        <div className="progress-bar" style={{ marginBottom: 'var(--space-3)' }}>
                            <div className="progress-bar-fill" style={{
                                width: `${(v.team.filled / v.team.total) * 100}%`,
                                background: v.color,
                            }} />
                        </div>
                        {v.team.roles.map(role => (
                            <div key={role.id} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '6px 0', borderBottom: '1px solid var(--border-color)',
                                fontSize: 'var(--font-size-sm)',
                            }}>
                                <span style={{ color: 'var(--color-text-secondary)' }}>{role.role_name}</span>
                                <span style={{
                                    fontSize: 'var(--font-size-xs)', fontWeight: 600,
                                    padding: '1px 8px', borderRadius: 'var(--border-radius-full)',
                                    background: role.status === 'filled' ? 'var(--color-success-bg)' : role.status === 'hiring' ? 'var(--color-warning-bg)' : 'var(--color-bg-tertiary)',
                                    color: role.status === 'filled' ? 'var(--color-success)' : role.status === 'hiring' ? 'var(--color-warning)' : 'var(--color-text-muted)',
                                }}>
                                    {role.status === 'filled' ? role.assignee_name || 'Filled' : role.status.charAt(0).toUpperCase() + role.status.slice(1)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* GitHub */}
                {v.github && (
                    <div className="detail-panel-section">
                        <div className="detail-section-title">
                            <GitBranch size={14} />
                            GitHub Activity
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)', textAlign: 'center' }}>
                            <div>
                                <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>{v.github.repos}</div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Repos</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>{v.github.commits_7d}</div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Commits 7d</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>{v.github.prs_open}</div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Open PRs</div>
                            </div>
                        </div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 'var(--space-2)' }}>
                            {v.github.last_activity}
                        </div>
                    </div>
                )}

                {/* Milestones */}
                {v.milestones.length > 0 && (
                    <div className="detail-panel-section">
                        <div className="detail-section-title">
                            <Target size={14} />
                            Milestones
                        </div>
                        {v.milestones.map(m => (
                            <div key={m.id} style={{ marginBottom: 'var(--space-3)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)', marginBottom: 4 }}>
                                    <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>{m.name}</span>
                                    <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>{m.target_date}</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-bar-fill" style={{ width: `${m.progress}%`, background: v.color }} />
                                </div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>{m.progress}%</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Recent Tasks */}
                <div className="detail-panel-section">
                    <div className="detail-section-title">Recent Tasks</div>
                    {ventureTasks.slice(0, 8).map(task => {
                        const statusColor = task.status === 'done' ? 'var(--color-success)'
                            : task.status === 'blocked' ? 'var(--color-danger)'
                                : task.status === 'in-progress' ? 'var(--color-info)'
                                    : 'var(--color-text-muted)';
                        return (
                            <div key={task.id} style={{
                                display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                                padding: '5px 0', borderBottom: '1px solid var(--border-color)',
                                fontSize: 'var(--font-size-sm)',
                            }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, flexShrink: 0 }} />
                                <span style={{ flex: 1, color: 'var(--color-text-secondary)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {task.title}
                                </span>
                                <span style={{
                                    fontSize: 'var(--font-size-xs)', fontWeight: 600, color: statusColor,
                                    flexShrink: 0,
                                }}>
                                    {task.status}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
