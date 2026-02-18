// ============================================================
// Focus Mode — Daily Sprint Planner
// ============================================================

import { useState, useMemo } from 'react';
import { useStore } from '../lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, CheckCircle2, AlertTriangle, Clock,
    Star, Play, Pause
} from 'lucide-react';

export default function FocusMode() {
    const { state, updateTask } = useStore();
    const [activeTimer, setActiveTimer] = useState<string | null>(null);
    const [elapsed, setElapsed] = useState(0);
    const [timerInterval, setTimerInterval] = useState<number | null>(null);
    const [completedToday, setCompletedToday] = useState<string[]>([]);

    const today = new Date().toISOString().split('T')[0];

    // Top priority tasks — P0/P1 in-progress or todo, not done
    const focusTasks = useMemo(() => {
        return state.tasks
            .filter(t => ['todo', 'in-progress'].includes(t.status) && ['P0', 'P1'].includes(t.priority))
            .sort((a, b) => {
                const prioOrder = { P0: 0, P1: 1, P2: 2, P3: 3 };
                return (prioOrder[a.priority] ?? 3) - (prioOrder[b.priority] ?? 3);
            })
            .slice(0, 5);
    }, [state.tasks]);

    // Today's completed
    const todayDone = useMemo(() => {
        return state.tasks.filter(t =>
            t.status === 'done' &&
            t.updated_at.startsWith(today)
        );
    }, [state.tasks, today]);

    // Blockers
    const blockers = useMemo(() =>
        state.tasks.filter(t => t.status === 'blocked'),
        [state.tasks]);

    // Due today
    const dueToday = useMemo(() =>
        state.tasks.filter(t => t.due_date && t.due_date.startsWith(today) && t.status !== 'done'),
        [state.tasks, today]);

    // Timer functions
    const startTimer = (taskId: string) => {
        if (timerInterval) clearInterval(timerInterval);
        setActiveTimer(taskId);
        setElapsed(0);
        const id = window.setInterval(() => {
            setElapsed(prev => prev + 1);
        }, 1000);
        setTimerInterval(id);
    };

    const stopTimer = () => {
        if (timerInterval) clearInterval(timerInterval);
        setTimerInterval(null);
        setActiveTimer(null);
        setElapsed(0);
    };

    const markDone = (taskId: string) => {
        const task = state.tasks.find(t => t.id === taskId);
        if (task) {
            updateTask({ ...task, status: 'done' });
            setCompletedToday(prev => [...prev, taskId]);
            if (activeTimer === taskId) stopTimer();
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            {/* Greeting */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}
            >
                <h1 style={{
                    fontSize: 'var(--font-size-3xl)', fontWeight: 800,
                    background: 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    marginBottom: 'var(--space-2)',
                }}>
                    {greeting}, Ade ⚡
                </h1>
                <p style={{ fontSize: 'var(--font-size-md)', color: 'var(--color-text-muted)' }}>
                    {todayDone.length + completedToday.length} tasks done today · {focusTasks.length} in focus · {blockers.length} blockers
                </p>
            </motion.div>

            {/* Today's Focus — Top 5 */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                    marginBottom: 'var(--space-4)',
                }}>
                    <Zap size={18} color="var(--color-warning)" />
                    <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        Today's Focus
                    </h2>
                    <span style={{
                        fontSize: 'var(--font-size-xs)', padding: '2px 8px',
                        background: 'var(--color-warning-bg)', color: 'var(--color-warning)',
                        borderRadius: 'var(--border-radius-full)', fontWeight: 600,
                    }}>
                        Top {focusTasks.length}
                    </span>
                </div>

                <AnimatePresence>
                    {focusTasks.map((task, i) => {
                        const venture = state.ventures.find(v => v.id === task.venture_id);
                        const isActive = activeTimer === task.id;

                        return (
                            <motion.div
                                key={task.id}
                                className="card focus-task-card"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20, height: 0 }}
                                transition={{ delay: i * 0.08 }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                                    padding: 'var(--space-4)',
                                    marginBottom: 'var(--space-3)',
                                    border: isActive ? '1px solid var(--color-accent-primary)' : '1px solid var(--border-color)',
                                    boxShadow: isActive ? '0 0 20px rgba(99, 102, 241, 0.15)' : 'none',
                                }}
                            >
                                {/* Order badge */}
                                <div style={{
                                    width: 32, height: 32, borderRadius: '50%',
                                    background: i === 0 ? 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))' : 'var(--color-bg-tertiary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: i === 0 ? '#fff' : 'var(--color-text-muted)',
                                    fontWeight: 700, fontSize: 'var(--font-size-sm)', flexShrink: 0,
                                }}>
                                    {i + 1}
                                </div>

                                {/* Task info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize: 'var(--font-size-md)', fontWeight: 600,
                                        color: 'var(--color-text-primary)',
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    }}>
                                        {task.title}
                                    </div>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                                        marginTop: 4, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)',
                                    }}>
                                        {venture && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: venture.color }} />
                                                {venture.name}
                                            </span>
                                        )}
                                        <span style={{
                                            color: task.priority === 'P0' ? 'var(--color-danger)' : 'var(--color-warning)',
                                            fontWeight: 600,
                                        }}>
                                            {task.priority === 'P0' ? '🔴' : '🟠'} {task.priority}
                                        </span>
                                    </div>
                                </div>

                                {/* Timer */}
                                {isActive && (
                                    <div style={{
                                        fontSize: 'var(--font-size-xl)', fontWeight: 700,
                                        fontFamily: 'monospace', color: 'var(--color-accent-primary)',
                                        minWidth: 60, textAlign: 'center',
                                    }}>
                                        {formatTime(elapsed)}
                                    </div>
                                )}

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0 }}>
                                    {!isActive ? (
                                        <button
                                            className="btn btn-secondary btn-sm btn-icon"
                                            onClick={() => startTimer(task.id)}
                                            title="Start timer"
                                        >
                                            <Play size={14} />
                                        </button>
                                    ) : (
                                        <button
                                            className="btn btn-secondary btn-sm btn-icon"
                                            onClick={stopTimer}
                                            title="Stop timer"
                                        >
                                            <Pause size={14} />
                                        </button>
                                    )}
                                    <button
                                        className="btn btn-primary btn-sm btn-icon"
                                        onClick={() => markDone(task.id)}
                                        title="Mark done"
                                    >
                                        <CheckCircle2 size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {focusTasks.length === 0 && (
                    <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                        <Star size={40} style={{ opacity: 0.15, marginBottom: 'var(--space-3)' }} />
                        <div className="empty-state-title">All clear! 🎉</div>
                        <div className="empty-state-text">
                            No P0/P1 tasks in queue. Time to plan or review.
                        </div>
                    </div>
                )}
            </div>

            {/* Side panels */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
                {/* Due Today */}
                <div className="card card-body">
                    <h3 style={{
                        fontSize: 'var(--font-size-md)', fontWeight: 600,
                        color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)',
                        display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                        <Clock size={14} />
                        Due Today
                    </h3>
                    {dueToday.length === 0 ? (
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Nothing due today</p>
                    ) : (
                        dueToday.map(t => {
                            const v = state.ventures.find(v => v.id === t.venture_id);
                            return (
                                <div key={t.id} style={{
                                    display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                                    padding: '6px 0', borderBottom: '1px solid var(--border-color)',
                                    fontSize: 'var(--font-size-sm)',
                                }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: v?.color || '#666' }} />
                                    <span style={{ flex: 1, color: 'var(--color-text-secondary)' }}>{t.title}</span>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Blockers */}
                <div className="card card-body">
                    <h3 style={{
                        fontSize: 'var(--font-size-md)', fontWeight: 600,
                        color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)',
                        display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                        <AlertTriangle size={14} color="var(--color-danger)" />
                        Blockers ({blockers.length})
                    </h3>
                    {blockers.length === 0 ? (
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-success)' }}>No blockers ✓</p>
                    ) : (
                        blockers.slice(0, 6).map(t => {
                            const v = state.ventures.find(v => v.id === t.venture_id);
                            return (
                                <div key={t.id} style={{
                                    display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                                    padding: '6px 0', borderBottom: '1px solid var(--border-color)',
                                    fontSize: 'var(--font-size-sm)',
                                }}>
                                    <AlertTriangle size={10} color="var(--color-danger)" />
                                    <span style={{ flex: 1, color: 'var(--color-text-secondary)' }}>{t.title}</span>
                                    <span style={{ fontSize: 'var(--font-size-xs)', color: v?.color }}>{v?.prefix}</span>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Completed Today */}
            {(todayDone.length + completedToday.length) > 0 && (
                <div style={{ marginTop: 'var(--space-6)' }}>
                    <h3 style={{
                        fontSize: 'var(--font-size-md)', fontWeight: 600,
                        color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)',
                        display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                        <CheckCircle2 size={14} color="var(--color-success)" />
                        Completed Today ({todayDone.length + completedToday.length})
                    </h3>
                    <div className="card card-body" style={{ padding: 0 }}>
                        {todayDone.map(t => (
                            <div key={t.id} style={{
                                display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                                padding: 'var(--space-3) var(--space-4)',
                                borderBottom: '1px solid var(--border-color)',
                                opacity: 0.6,
                            }}>
                                <CheckCircle2 size={12} color="var(--color-success)" />
                                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', textDecoration: 'line-through' }}>
                                    {t.title}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
