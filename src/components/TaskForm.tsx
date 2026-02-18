// ============================================================
// Task Form — Modal for creating/editing tasks
// ============================================================

import { useState } from 'react';
import { useStore } from '../lib/store';
import type { Task, TaskStatus, TaskPriority } from '../lib/types';
import { X } from 'lucide-react';

interface Props {
    task?: Task | null;          // null = create mode
    ventureId?: string;          // pre-selected venture for new tasks
    onClose: () => void;
}

export default function TaskForm({ task, ventureId, onClose }: Props) {
    const { state, addTask, updateTask } = useStore();
    const isEdit = !!task;

    const [title, setTitle] = useState(task?.title || '');
    const [description, setDescription] = useState(task?.description || '');
    const [status, setStatus] = useState<TaskStatus>(task?.status || 'backlog');
    const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'P2');
    const [selectedVenture, setSelectedVenture] = useState(task?.venture_id || ventureId || '');
    const [dueDate, setDueDate] = useState(task?.due_date || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !selectedVenture) return;

        if (isEdit && task) {
            updateTask({
                ...task,
                title: title.trim(),
                description: description.trim() || undefined,
                status,
                priority,
                venture_id: selectedVenture,
                due_date: dueDate || null,
            });
        } else {
            addTask({
                title: title.trim(),
                description: description.trim() || undefined,
                status,
                priority,
                venture_id: selectedVenture,
                due_date: dueDate || null,
                parent_id: null,
                milestone_id: null,
                blocked_by: null,
                tags: [],
            });
        }

        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <span className="modal-title">{isEdit ? 'Edit Task' : 'New Task'}</span>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label">Venture</label>
                            <select
                                className="form-select"
                                value={selectedVenture}
                                onChange={e => setSelectedVenture(e.target.value)}
                                required
                            >
                                <option value="">Select venture...</option>
                                {state.ventures.map(v => (
                                    <option key={v.id} value={v.id}>{v.prefix} — {v.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Title</label>
                            <input
                                className="form-input"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="What needs to be done?"
                                required
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                className="form-textarea"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Details, context, links..."
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select className="form-select" value={status} onChange={e => setStatus(e.target.value as TaskStatus)}>
                                    <option value="backlog">Backlog</option>
                                    <option value="todo">Todo</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="review">Review</option>
                                    <option value="done">Done</option>
                                    <option value="blocked">Blocked</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Priority</label>
                                <select className="form-select" value={priority} onChange={e => setPriority(e.target.value as TaskPriority)}>
                                    <option value="P0">🔴 P0 — Critical</option>
                                    <option value="P1">🟠 P1 — High</option>
                                    <option value="P2">🟡 P2 — Medium</option>
                                    <option value="P3">⚪ P3 — Low</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Due Date</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={dueDate}
                                    onChange={e => setDueDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">
                            {isEdit ? 'Save Changes' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
