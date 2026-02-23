// ============================================================
// Kanban Board — Task Engine View
// ============================================================

import { useState, useMemo } from 'react';
import { useStore } from '../lib/store';
import type { Task, TaskStatus as TStatus } from '../lib/types';
import TaskForm from './TaskForm';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Filter,
    AlertTriangle, Clock, CheckCircle2, Circle,
    Eye, Archive
} from 'lucide-react';

const COLUMNS: { key: TStatus; label: string; color: string; icon: React.ElementType }[] = [
    { key: 'backlog', label: 'Backlog', color: '#64748B', icon: Archive },
    { key: 'todo', label: 'Todo', color: '#3B82F6', icon: Circle },
    { key: 'in-progress', label: 'In Progress', color: '#6366F1', icon: Clock },
    { key: 'review', label: 'Review', color: '#8B5CF6', icon: Eye },
    { key: 'done', label: 'Done', color: '#10B981', icon: CheckCircle2 },
    { key: 'blocked', label: 'Blocked', color: '#EF4444', icon: AlertTriangle },
];

const priorityLabels: Record<string, { emoji: string; color: string }> = {
    P0: { emoji: '🔴', color: '#EF4444' },
    P1: { emoji: '🟠', color: '#F59E0B' },
    P2: { emoji: '🟡', color: '#EAB308' },
    P3: { emoji: '⚪', color: '#64748B' },
};

export default function KanbanBoard() {
    const { state, updateTask } = useStore();
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [ventureFilter, setVentureFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [draggedTask, setDraggedTask] = useState<Task | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

    const filteredTasks = useMemo(() => {
        let tasks = state.tasks;
        if (ventureFilter !== 'all') tasks = tasks.filter(t => t.venture_id === ventureFilter);
        if (priorityFilter !== 'all') tasks = tasks.filter(t => t.priority === priorityFilter);
        return tasks;
    }, [state.tasks, ventureFilter, priorityFilter]);

    const handleDragStart = (e: React.DragEvent, task: Task) => {
        setDraggedTask(task);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', task.id);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, newStatus: TStatus) => {
        e.preventDefault();
        if (draggedTask && draggedTask.status !== newStatus) {
            updateTask({ ...draggedTask, status: newStatus });
        }
        setDraggedTask(null);
        setDragOverColumn(null);
    };

    const handleDragEnter = (e: React.DragEvent, colKey: string) => {
        e.preventDefault();
        setDragOverColumn(colKey);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        // Only clear if leaving the column entirely
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        if (
            e.clientX < rect.left || e.clientX > rect.right ||
            e.clientY < rect.top || e.clientY > rect.bottom
        ) {
            setDragOverColumn(null);
        }
    };

    const getVentureName = (ventureId: string) => {
        return state.ventures.find(v => v.id === ventureId);
    };

    return (
        <div>
            {/* Filters */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                marginBottom: 'var(--space-5)', flexWrap: 'wrap',
            }}>
                <button className="btn btn-primary btn-sm" onClick={() => { setEditingTask(null); setShowForm(true); }}>
                    <Plus size={14} /> New Task
                </button>

                <div className="filter-divider" />

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Filter size={13} style={{ color: 'var(--color-text-muted)' }} />
                    <select
                        className="form-select"
                        style={{ width: 'auto', padding: '4px 12px', fontSize: 'var(--font-size-sm)' }}
                        value={ventureFilter}
                        onChange={e => setVentureFilter(e.target.value)}
                    >
                        <option value="all">All Ventures</option>
                        {state.ventures.map(v => (
                            <option key={v.id} value={v.id}>{v.prefix} — {v.name}</option>
                        ))}
                    </select>
                </div>

                <select
                    className="form-select"
                    style={{ width: 'auto', padding: '4px 12px', fontSize: 'var(--font-size-sm)' }}
                    value={priorityFilter}
                    onChange={e => setPriorityFilter(e.target.value)}
                >
                    <option value="all">All Priorities</option>
                    <option value="P0">🔴 Critical</option>
                    <option value="P1">🟠 High</option>
                    <option value="P2">🟡 Medium</option>
                    <option value="P3">⚪ Low</option>
                </select>

                <div style={{ marginLeft: 'auto', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                    {filteredTasks.length} tasks
                </div>
            </div>

            {/* Kanban Columns */}
            <div className="kanban-board">
                {COLUMNS.map(col => {
                    const columnTasks = filteredTasks
                        .filter(t => t.status === col.key)
                        .sort((a, b) => {
                            const prioOrder = { P0: 0, P1: 1, P2: 2, P3: 3 };
                            return (prioOrder[a.priority] ?? 3) - (prioOrder[b.priority] ?? 3);
                        });

                    return (
                        <div
                            key={col.key}
                            className={`kanban-column${dragOverColumn === col.key ? ' drag-over' : ''}`}
                            onDragOver={handleDragOver}
                            onDragEnter={e => handleDragEnter(e, col.key)}
                            onDragLeave={handleDragLeave}
                            onDrop={e => handleDrop(e, col.key)}
                        >
                            {/* Column Header */}
                            <div className="kanban-column-header">
                                <div className="kanban-column-title">
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                                    {col.label}
                                </div>
                                <span className="kanban-column-count">{columnTasks.length}</span>
                            </div>

                            {/* Column Body */}
                            <div className="kanban-column-body">
                                <AnimatePresence>
                                    {columnTasks.map(task => {
                                        const venture = getVentureName(task.venture_id);
                                        const prio = priorityLabels[task.priority];
                                        const blockedByTask = task.blocked_by ? state.tasks.find(t => t.id === task.blocked_by) : null;
                                        const hasDependents = state.tasks.some(t => t.blocked_by === task.id);

                                        return (
                                            <motion.div
                                                key={task.id}
                                                className="kanban-task-card"
                                                draggable
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- bridging framer-motion and native drag event types
                                                onDragStart={(e: any) => handleDragStart(e, task)}
                                                onClick={() => { setEditingTask(task); setShowForm(true); }}
                                                layout
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <div className="kanban-task-title">{task.title}</div>
                                                {/* Dependency indicator */}
                                                {blockedByTask && (
                                                    <div style={{
                                                        display: 'flex', alignItems: 'center', gap: 4,
                                                        fontSize: 'var(--font-size-xs)', color: 'var(--color-warning)',
                                                        padding: '2px 0', marginBottom: 2,
                                                    }}>
                                                        🔗 Blocked by: <em style={{ color: 'var(--color-text-muted)' }}>{blockedByTask.title}</em>
                                                    </div>
                                                )}
                                                {hasDependents && (
                                                    <div style={{
                                                        display: 'flex', alignItems: 'center', gap: 4,
                                                        fontSize: 'var(--font-size-xs)', color: 'var(--color-info)',
                                                        padding: '2px 0', marginBottom: 2,
                                                    }}>
                                                        ⛓️ Has dependents
                                                    </div>
                                                )}
                                                <div className="kanban-task-meta">
                                                    <span className="kanban-task-priority" style={{
                                                        background: `${prio.color}18`,
                                                        color: prio.color,
                                                    }}>
                                                        {prio.emoji} {task.priority}
                                                    </span>
                                                    {venture && (
                                                        <span className="kanban-task-venture">
                                                            <span style={{
                                                                display: 'inline-block', width: 6, height: 6,
                                                                borderRadius: '50%', background: venture.color,
                                                                marginRight: 4,
                                                            }} />
                                                            {venture.prefix}
                                                        </span>
                                                    )}
                                                    {task.due_date && (
                                                        <span style={{
                                                            fontSize: 'var(--font-size-xs)',
                                                            color: new Date(task.due_date) < new Date() ? 'var(--color-danger)' : 'var(--color-text-muted)',
                                                        }}>
                                                            {new Date(task.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                        </span>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>

                                {columnTasks.length === 0 && (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: 'var(--space-6) var(--space-3)',
                                        color: 'var(--color-text-muted)',
                                        fontSize: 'var(--font-size-xs)',
                                    }}>
                                        No tasks
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Task Form Modal */}
            {showForm && (
                <TaskForm
                    task={editingTask}
                    ventureId={ventureFilter !== 'all' ? ventureFilter : undefined}
                    onClose={() => { setShowForm(false); setEditingTask(null); }}
                />
            )}
        </div>
    );
}
