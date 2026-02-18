// ============================================================
// Timeline View — Gantt-style horizontal timeline
// ============================================================

import { useMemo } from 'react';
import { useStore } from '../lib/store';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

export default function TimelineView() {
    const { state } = useStore();

    // Build timeline items from milestones and tasks with due dates
    const timelineItems = useMemo(() => {
        const items: {
            id: string; type: 'milestone' | 'task'; title: string;
            ventureId: string; ventureName: string; ventureColor: string; venturePrefix: string;
            date: string; progress?: number; status?: string; priority?: string;
        }[] = [];

        // Milestones
        state.milestones.forEach(m => {
            const v = state.ventures.find(v => v.id === m.venture_id);
            if (!v) return;
            items.push({
                id: m.id, type: 'milestone', title: m.name,
                ventureId: v.id, ventureName: v.name, ventureColor: v.color, venturePrefix: v.prefix,
                date: m.target_date, progress: m.progress,
            });
        });

        // Tasks with due dates
        state.tasks.filter(t => t.due_date).forEach(t => {
            const v = state.ventures.find(v => v.id === t.venture_id);
            if (!v) return;
            items.push({
                id: t.id, type: 'task', title: t.title,
                ventureId: v.id, ventureName: v.name, ventureColor: v.color, venturePrefix: v.prefix,
                date: t.due_date!, status: t.status, priority: t.priority,
            });
        });

        return items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [state.milestones, state.tasks, state.ventures]);

    // Generate months for the timeline header
    const months = useMemo(() => {
        if (timelineItems.length === 0) return [];
        const now = new Date();
        const result: { label: string; year: number; month: number; start: Date; end: Date }[] = [];
        for (let i = -2; i <= 8; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
            const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
            result.push({
                label: d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
                year: d.getFullYear(), month: d.getMonth(),
                start: d, end,
            });
        }
        return result;
    }, [timelineItems.length]);

    const totalDays = months.length > 0
        ? Math.ceil((months[months.length - 1].end.getTime() - months[0].start.getTime()) / (1000 * 60 * 60 * 24))
        : 1;
    const timelineStart = months.length > 0 ? months[0].start.getTime() : 0;

    const getPosition = (dateStr: string) => {
        const d = new Date(dateStr).getTime();
        const days = (d - timelineStart) / (1000 * 60 * 60 * 24);
        return Math.max(0, Math.min(100, (days / totalDays) * 100));
    };

    // Group by venture
    const ventureGroups = useMemo(() => {
        const groups: Record<string, typeof timelineItems> = {};
        timelineItems.forEach(item => {
            if (!groups[item.ventureId]) groups[item.ventureId] = [];
            groups[item.ventureId].push(item);
        });
        return Object.entries(groups).map(([ventureId, items]) => ({
            ventureId,
            ventureName: items[0].ventureName,
            ventureColor: items[0].ventureColor,
            venturePrefix: items[0].venturePrefix,
            items,
        }));
    }, [timelineItems]);

    const today = new Date();
    const todayPos = getPosition(today.toISOString());

    return (
        <div>
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 'var(--space-5)',
            }}>
                <div>
                    <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                        <Calendar size={20} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
                        Portfolio Timeline
                    </h2>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                        {timelineItems.filter(i => i.type === 'milestone').length} milestones · {timelineItems.filter(i => i.type === 'task').length} dated tasks
                    </p>
                </div>
            </div>

            {/* Timeline Header — Months */}
            <div className="card card-body" style={{ overflowX: 'auto', padding: 0 }}>
                <div style={{ minWidth: 900 }}>
                    {/* Month labels */}
                    <div style={{
                        display: 'flex', borderBottom: '1px solid var(--border-color)',
                        position: 'relative',
                    }}>
                        {months.map((m, i) => (
                            <div key={i} style={{
                                flex: 1, textAlign: 'center',
                                padding: 'var(--space-3)',
                                fontSize: 'var(--font-size-xs)',
                                fontWeight: 600,
                                color: 'var(--color-text-secondary)',
                                borderRight: '1px solid var(--border-color)',
                            }}>
                                {m.label}
                            </div>
                        ))}
                    </div>

                    {/* Today indicator */}
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            position: 'absolute', left: `${todayPos}%`, top: 0, bottom: 0,
                            width: 2, background: 'var(--color-accent-primary)',
                            zIndex: 10, opacity: 0.6,
                        }} />
                        <div style={{
                            position: 'absolute', left: `${todayPos}%`, top: -2,
                            transform: 'translateX(-50%)',
                            fontSize: 'var(--font-size-xs)', fontWeight: 600,
                            color: 'var(--color-accent-primary)',
                            background: 'var(--color-bg-card)', padding: '0 4px',
                            zIndex: 11,
                        }}>
                            Today
                        </div>
                    </div>

                    {/* Venture rows */}
                    {ventureGroups.map((group, gi) => (
                        <motion.div
                            key={group.ventureId}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: gi * 0.05 }}
                            style={{
                                display: 'flex', alignItems: 'center',
                                borderBottom: '1px solid var(--border-color)',
                                minHeight: 56,
                            }}
                        >
                            {/* Venture label */}
                            <div style={{
                                width: 120, flexShrink: 0, padding: 'var(--space-2) var(--space-3)',
                                display: 'flex', alignItems: 'center', gap: 6,
                                borderRight: '1px solid var(--border-color)',
                            }}>
                                <span style={{
                                    width: 24, height: 24, borderRadius: 'var(--border-radius-sm)',
                                    background: group.ventureColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#fff', fontWeight: 700, fontSize: 9, flexShrink: 0,
                                }}>
                                    {group.venturePrefix}
                                </span>
                                <span style={{
                                    fontSize: 'var(--font-size-xs)', fontWeight: 600,
                                    color: 'var(--color-text-secondary)',
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                }}>
                                    {group.ventureName}
                                </span>
                            </div>

                            {/* Timeline bar */}
                            <div style={{ flex: 1, position: 'relative', height: '100%', padding: '8px 0' }}>
                                {group.items.map(item => {
                                    const left = getPosition(item.date);
                                    const isMilestone = item.type === 'milestone';
                                    const isPast = new Date(item.date) < today;
                                    const isDone = item.status === 'done' || (item.progress !== undefined && item.progress >= 100);

                                    return (
                                        <div
                                            key={item.id}
                                            title={`${item.title}\n${new Date(item.date).toLocaleDateString('en-GB')}`}
                                            style={{
                                                position: 'absolute',
                                                left: `${left}%`,
                                                top: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {isMilestone ? (
                                                <div style={{
                                                    width: 14, height: 14, borderRadius: 3,
                                                    background: isDone ? 'var(--color-success)' : group.ventureColor,
                                                    transform: 'rotate(45deg)',
                                                    border: `2px solid ${isDone ? 'var(--color-success)' : isPast ? 'var(--color-warning)' : group.ventureColor}`,
                                                    opacity: isDone ? 0.7 : 1,
                                                }} />
                                            ) : (
                                                <div style={{
                                                    width: 10, height: 10, borderRadius: '50%',
                                                    background: isDone ? 'var(--color-success)' :
                                                        item.status === 'blocked' ? 'var(--color-danger)' :
                                                            item.status === 'in-progress' ? 'var(--color-info)' :
                                                                group.ventureColor,
                                                    opacity: isDone ? 0.5 : isPast && !isDone ? 0.9 : 1,
                                                    border: isPast && !isDone ? '2px solid var(--color-warning)' : 'none',
                                                }} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div style={{
                display: 'flex', gap: 'var(--space-5)', marginTop: 'var(--space-4)',
                fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--color-accent-primary)', transform: 'rotate(45deg)' }} />
                    Milestone
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-info)' }} />
                    Task
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)' }} />
                    Done
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-danger)' }} />
                    Blocked
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', border: '2px solid var(--color-warning)' }} />
                    Overdue
                </div>
            </div>

            {/* Upcoming List */}
            <div style={{ marginTop: 'var(--space-6)' }}>
                <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)' }}>
                    Upcoming Deadlines
                </h3>
                <div className="card card-body" style={{ padding: 0 }}>
                    {timelineItems
                        .filter(i => new Date(i.date) >= today && i.status !== 'done')
                        .slice(0, 12)
                        .map(item => {
                            const daysUntil = Math.ceil((new Date(item.date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                            return (
                                <div key={item.id} style={{
                                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                                    padding: 'var(--space-3) var(--space-4)',
                                    borderBottom: '1px solid var(--border-color)',
                                }}>
                                    <span style={{
                                        width: 8, height: 8, borderRadius: item.type === 'milestone' ? 2 : '50%',
                                        background: item.ventureColor, flexShrink: 0,
                                        transform: item.type === 'milestone' ? 'rotate(45deg)' : 'none',
                                    }} />
                                    <span style={{
                                        width: 28, height: 20, borderRadius: 'var(--border-radius-sm)',
                                        background: item.ventureColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', fontWeight: 700, fontSize: 8, flexShrink: 0,
                                    }}>
                                        {item.venturePrefix}
                                    </span>
                                    <span style={{ flex: 1, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                        {item.title}
                                    </span>
                                    <span style={{
                                        fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)',
                                    }}>
                                        {new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                    </span>
                                    <span style={{
                                        fontSize: 'var(--font-size-xs)', fontWeight: 600,
                                        color: daysUntil <= 7 ? 'var(--color-warning)' : 'var(--color-text-muted)',
                                        padding: '1px 8px', borderRadius: 'var(--border-radius-full)',
                                        background: daysUntil <= 7 ? 'var(--color-warning-bg)' : 'var(--color-bg-tertiary)',
                                    }}>
                                        {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil}d`}
                                    </span>
                                </div>
                            );
                        })}
                </div>
            </div>
        </div>
    );
}
