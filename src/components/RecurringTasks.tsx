// ============================================================
// Recurring Tasks Manager
// ============================================================

import { useState, useMemo } from 'react';
import { useStore } from '../lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import type { RecurringTask, RecurrencePattern } from '../lib/types';
import {
    RefreshCw, Plus, X, Play, Pause, Calendar
} from 'lucide-react';

const recurrenceLabels: Record<RecurrencePattern, string> = {
    daily: 'Daily', weekly: 'Weekly', biweekly: 'Bi-Weekly', monthly: 'Monthly',
};

const recurrenceColors: Record<RecurrencePattern, string> = {
    daily: '#EF4444', weekly: '#3B82F6', biweekly: '#6366F1', monthly: '#10B981',
};

export default function RecurringTasks() {
    const { state, addRecurringTask, dispatch, addTask } = useStore();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<Partial<RecurringTask>>({
        recurrence: 'weekly', priority: 'P2', active: true, venture_id: '',
    });

    const grouped = useMemo(() => {
        const groups: Record<string, { venture: any; tasks: RecurringTask[] }> = {};
        state.recurringTasks.forEach(t => {
            const v = state.ventures.find(v => v.id === t.venture_id);
            if (!v) return;
            if (!groups[v.id]) groups[v.id] = { venture: v, tasks: [] };
            groups[v.id].tasks.push(t);
        });
        return Object.values(groups);
    }, [state.recurringTasks, state.ventures]);

    const handleSubmit = () => {
        if (!form.venture_id || !form.title) return;
        addRecurringTask({
            ...form,
            next_due: form.next_due || new Date().toISOString().split('T')[0],
        } as Omit<RecurringTask, 'id' | 'created_at'>);
        setShowForm(false);
        setForm({ recurrence: 'weekly', priority: 'P2', active: true, venture_id: '' });
    };

    const generateTask = (rt: RecurringTask) => {
        addTask({
            venture_id: rt.venture_id,
            title: `${rt.title} (${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })})`,
            description: rt.description,
            status: 'todo',
            priority: rt.priority,
            due_date: rt.next_due,
            tags: ['recurring'],
        });
        // Update next_due
        const d = new Date(rt.next_due);
        switch (rt.recurrence) {
            case 'daily': d.setDate(d.getDate() + 1); break;
            case 'weekly': d.setDate(d.getDate() + 7); break;
            case 'biweekly': d.setDate(d.getDate() + 14); break;
            case 'monthly': d.setMonth(d.getMonth() + 1); break;
        }
        dispatch({
            type: 'UPDATE_RECURRING_TASK',
            payload: { ...rt, next_due: d.toISOString().split('T')[0], last_generated: new Date().toISOString() }
        });
    };

    return (
        <div>
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 'var(--space-5)',
            }}>
                <div>
                    <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                        <RefreshCw size={20} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
                        Recurring Tasks
                    </h2>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                        {state.recurringTasks.filter(t => t.active).length} active · {state.recurringTasks.length} total
                    </p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
                    <Plus size={14} /> Add Recurring Task
                </button>
            </div>

            {/* Due now alert */}
            {state.recurringTasks.filter(t => t.active && t.next_due <= new Date().toISOString().split('T')[0]).length > 0 && (
                <div className="card card-body" style={{
                    marginBottom: 'var(--space-5)',
                    borderLeft: '3px solid var(--color-warning)',
                    background: 'var(--color-warning-bg)',
                }}>
                    <div style={{ fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--color-warning)' }}>
                        ⏰ Tasks due for generation
                    </div>
                    {state.recurringTasks
                        .filter(t => t.active && t.next_due <= new Date().toISOString().split('T')[0])
                        .map(t => (
                            <div key={t.id} style={{
                                display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                                padding: '6px 0',
                            }}>
                                <span style={{ flex: 1, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                    {t.title}
                                </span>
                                <button className="btn btn-primary btn-sm" onClick={() => generateTask(t)}>
                                    <Play size={12} /> Generate
                                </button>
                            </div>
                        ))}
                </div>
            )}

            {/* Grouped by venture */}
            {grouped.length === 0 ? (
                <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                    <RefreshCw size={40} style={{ opacity: 0.15, marginBottom: 'var(--space-3)' }} />
                    <div className="empty-state-title">No recurring tasks</div>
                    <div className="empty-state-text">Create recurring tasks for routine work like "Check analytics every Friday"</div>
                </div>
            ) : (
                grouped.map((group, gi) => (
                    <motion.div key={group.venture.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: gi * 0.05 }}
                        style={{ marginBottom: 'var(--space-5)' }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                            marginBottom: 'var(--space-3)',
                        }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: group.venture.color }} />
                            <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                {group.venture.name}
                            </h3>
                        </div>

                        {group.tasks.map(rt => (
                            <div key={rt.id} className="card card-body" style={{
                                display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                                marginBottom: 'var(--space-2)', opacity: rt.active ? 1 : 0.5,
                            }}>
                                <RefreshCw size={14} color={recurrenceColors[rt.recurrence]} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>
                                        {rt.title}
                                    </div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', display: 'flex', gap: 'var(--space-2)' }}>
                                        <span style={{
                                            padding: '1px 6px', borderRadius: 'var(--border-radius-full)',
                                            background: `${recurrenceColors[rt.recurrence]}18`, color: recurrenceColors[rt.recurrence],
                                        }}>
                                            {recurrenceLabels[rt.recurrence]}
                                        </span>
                                        <span>Next: {new Date(rt.next_due).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                                        <span>{rt.priority}</span>
                                    </div>
                                </div>
                                <button className="btn btn-secondary btn-sm btn-icon"
                                    onClick={() => dispatch({ type: 'UPDATE_RECURRING_TASK', payload: { ...rt, active: !rt.active } })}
                                    title={rt.active ? 'Pause' : 'Resume'}>
                                    {rt.active ? <Pause size={12} /> : <Play size={12} />}
                                </button>
                                <button className="btn btn-primary btn-sm btn-icon" onClick={() => generateTask(rt)} title="Generate now">
                                    <Calendar size={12} />
                                </button>
                                <button className="btn btn-secondary btn-sm btn-icon" style={{ padding: 4 }}
                                    onClick={() => dispatch({ type: 'DELETE_RECURRING_TASK', payload: rt.id })}>
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </motion.div>
                ))
            )}

            {/* Add form modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setShowForm(false)}>
                        <motion.div className="modal" style={{ width: 480 }}
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">Add Recurring Task</h3>
                                <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setShowForm(false)}><X size={14} /></button>
                            </div>
                            <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                <select className="form-select" value={form.venture_id}
                                    onChange={e => setForm(f => ({ ...f, venture_id: e.target.value }))}>
                                    <option value="">Select venture...</option>
                                    {state.ventures.map(v => <option key={v.id} value={v.id}>{v.prefix} — {v.name}</option>)}
                                </select>
                                <input className="form-input" placeholder="Task title (e.g., Check Twitter analytics)" value={form.title || ''}
                                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                                <textarea className="form-textarea" placeholder="Description (optional)" value={form.description || ''}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                                    <select className="form-select" value={form.recurrence}
                                        onChange={e => setForm(f => ({ ...f, recurrence: e.target.value as RecurrencePattern }))}>
                                        {(Object.entries(recurrenceLabels) as [RecurrencePattern, string][]).map(([k, v]) =>
                                            <option key={k} value={k}>{v}</option>
                                        )}
                                    </select>
                                    <select className="form-select" value={form.priority}
                                        onChange={e => setForm(f => ({ ...f, priority: e.target.value as any }))}>
                                        <option value="P0">🔴 P0 — Critical</option>
                                        <option value="P1">🟠 P1 — High</option>
                                        <option value="P2">🟡 P2 — Medium</option>
                                        <option value="P3">⚪ P3 — Low</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 4, display: 'block' }}>
                                        First due date
                                    </label>
                                    <input className="form-input" type="date" value={form.next_due || ''}
                                        onChange={e => setForm(f => ({ ...f, next_due: e.target.value }))} />
                                </div>
                                <button className="btn btn-primary" onClick={handleSubmit}>Create Recurring Task</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
