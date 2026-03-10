// ============================================================
// Plan Tracker — Implementation plan management per venture
// ============================================================

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../lib/store';
import { taskStatusCssColors } from '../lib/utils';
import type { ImplementationPlan, PlanPhase, PlanPhaseStatus, Task } from '../lib/types';
import {
    ClipboardList, Plus, Trash2, ChevronDown, ChevronRight,
    Circle, CheckCircle2, Clock, AlertTriangle, X, GripVertical,
} from 'lucide-react';

const PHASE_STATUS_CONFIG: Record<PlanPhaseStatus, { label: string; color: string; icon: typeof Circle }> = {
    not_started: { label: 'Not Started', color: 'var(--color-text-muted)', icon: Circle },
    in_progress: { label: 'In Progress', color: 'var(--color-accent-primary)', icon: Clock },
    completed: { label: 'Completed', color: 'var(--color-success)', icon: CheckCircle2 },
    blocked: { label: 'Blocked', color: 'var(--color-danger)', icon: AlertTriangle },
};

function computePlanProgress(plan: ImplementationPlan, tasksByPhase: Map<string, Pick<Task, 'plan_phase_id' | 'status'>[]>): number {
    if (plan.phases.length === 0) return 0;
    const completed = plan.phases.filter(p => p.status === 'completed').length;

    let partialProgress = 0;
    for (const phase of plan.phases) {
        if (phase.status !== 'in_progress') continue;
        const phaseTasks = tasksByPhase.get(phase.id);
        if (phaseTasks && phaseTasks.length > 0) {
            const done = phaseTasks.filter(t => t.status === 'done').length;
            partialProgress += done / phaseTasks.length;
        } else {
            partialProgress += 0.5;
        }
    }

    return Math.round(((completed + partialProgress) / plan.phases.length) * 100);
}

function PhaseRow({ phase, planId, linkedTasks, ventureColor, onToggle, isExpanded }: {
    phase: PlanPhase;
    planId: string;
    linkedTasks: Pick<Task, 'id' | 'title' | 'status' | 'priority'>[];
    ventureColor: string;
    onToggle: () => void;
    isExpanded: boolean;
}) {
    const { updatePhase, deletePhase } = useStore();
    const config = PHASE_STATUS_CONFIG[phase.status];
    const Icon = config.icon;
    const doneTasks = linkedTasks.filter(t => t.status === 'done').length;
    const taskProgress = linkedTasks.length > 0 ? Math.round((doneTasks / linkedTasks.length) * 100) : null;

    return (
        <div style={{ borderLeft: `3px solid ${phase.status === 'completed' ? 'var(--color-success)' : phase.status === 'in_progress' ? ventureColor : 'var(--border-color)'}` }}>
            <div
                onClick={onToggle}
                style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                    padding: 'var(--space-3) var(--space-4)', cursor: 'pointer',
                    background: isExpanded ? 'var(--color-bg-secondary)' : 'transparent',
                    transition: 'background 0.15s',
                }}
            >
                <GripVertical size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                <span style={{
                    width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${config.color}20`, color: config.color, fontSize: 'var(--font-size-sm)', fontWeight: 700, flexShrink: 0,
                }}>
                    {phase.order}
                </span>
                <Icon size={16} style={{ color: config.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>{phase.name}</div>
                    {phase.description && (
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>{phase.description}</div>
                    )}
                </div>
                {linkedTasks.length > 0 && (
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                        {doneTasks}/{linkedTasks.length} tasks
                    </span>
                )}
                {taskProgress !== null && (
                    <div style={{ width: 60, height: 4, borderRadius: 2, background: 'var(--color-bg-tertiary)', overflow: 'hidden', flexShrink: 0 }}>
                        <div style={{ width: `${taskProgress}%`, height: '100%', background: ventureColor, borderRadius: 2, transition: 'width 0.3s' }} />
                    </div>
                )}
                <select
                    value={phase.status}
                    onChange={e => {
                        e.stopPropagation();
                        updatePhase(planId, { ...phase, status: e.target.value as PlanPhaseStatus });
                    }}
                    onClick={e => e.stopPropagation()}
                    style={{
                        fontSize: 'var(--font-size-xs)', padding: '2px 6px', borderRadius: 'var(--border-radius-sm)',
                        border: '1px solid var(--border-color)', background: 'var(--color-bg-primary)', color: config.color,
                        cursor: 'pointer', flexShrink: 0,
                    }}
                >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                </select>
                {phase.target_start && phase.target_end && (
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {new Date(phase.target_start).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })} — {new Date(phase.target_end).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                    </span>
                )}
                <button
                    onClick={e => { e.stopPropagation(); deletePhase(planId, phase.id); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4, flexShrink: 0 }}
                    title="Delete phase"
                >
                    <Trash2 size={14} />
                </button>
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>

            <AnimatePresence>
                {isExpanded && linkedTasks.length > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden', background: 'var(--color-bg-secondary)' }}
                    >
                        <div style={{ padding: '0 var(--space-4) var(--space-3)', paddingLeft: 'calc(var(--space-4) + 42px)' }}>
                            {linkedTasks.map(task => (
                                <div key={task.id} style={{
                                    display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                                    padding: 'var(--space-1) 0', fontSize: 'var(--font-size-xs)',
                                }}>
                                    <span style={{
                                        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                                        background: taskStatusCssColors[task.status] ?? 'var(--color-text-muted)',
                                    }} />
                                    <span style={{ color: 'var(--color-text-secondary)', flex: 1 }}>{task.title}</span>
                                    <span style={{
                                        fontSize: 'var(--font-size-xs)', padding: '1px 6px', borderRadius: 'var(--border-radius-sm)',
                                        background: task.priority === 'P0' ? 'rgba(239,68,68,0.15)' : task.priority === 'P1' ? 'rgba(245,158,11,0.15)' : 'var(--color-bg-tertiary)',
                                        color: task.priority === 'P0' ? 'var(--color-danger)' : task.priority === 'P1' ? 'var(--color-warning)' : 'var(--color-text-muted)',
                                    }}>
                                        {task.priority}
                                    </span>
                                    <span style={{
                                        fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)',
                                        textTransform: 'capitalize',
                                    }}>
                                        {task.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function PlanTracker() {
    const { state, addPlan, deletePlan, addPhase } = useStore();
    const [selectedVentureId, setSelectedVentureId] = useState<string | 'all'>('all');
    const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
    const [showAddPlan, setShowAddPlan] = useState(false);
    const [showAddPhase, setShowAddPhase] = useState<string | null>(null);
    const [newPlanName, setNewPlanName] = useState('');
    const [newPlanDesc, setNewPlanDesc] = useState('');
    const [newPlanVenture, setNewPlanVenture] = useState('');
    const [newPhaseName, setNewPhaseName] = useState('');
    const [newPhaseDesc, setNewPhaseDesc] = useState('');

    const plans = useMemo(() => {
        if (selectedVentureId === 'all') return state.implementationPlans;
        return state.implementationPlans.filter(p => p.venture_id === selectedVentureId);
    }, [state.implementationPlans, selectedVentureId]);

    const ventures = useMemo(() => state.ventures.filter(v => v.tier !== 'Parked'), [state.ventures]);

    // Pre-group tasks by plan_phase_id for efficient lookup
    const tasksByPhase = useMemo(() => {
        const map = new Map<string, Task[]>();
        for (const task of state.tasks) {
            if (task.plan_phase_id) {
                const existing = map.get(task.plan_phase_id);
                if (existing) existing.push(task);
                else map.set(task.plan_phase_id, [task]);
            }
        }
        return map;
    }, [state.tasks]);

    const togglePhase = (id: string) => {
        setExpandedPhases(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const handleAddPlan = () => {
        if (!newPlanName || !newPlanVenture) return;
        addPlan({
            venture_id: newPlanVenture,
            name: newPlanName,
            description: newPlanDesc || undefined,
            phases: [],
        });
        setNewPlanName('');
        setNewPlanDesc('');
        setNewPlanVenture('');
        setShowAddPlan(false);
    };

    const handleAddPhase = (planId: string) => {
        if (!newPhaseName) return;
        const plan = state.implementationPlans.find(p => p.id === planId);
        const nextOrder = plan ? Math.max(0, ...plan.phases.map(p => p.order)) + 1 : 1;
        addPhase(planId, {
            plan_id: planId,
            name: newPhaseName,
            description: newPhaseDesc || undefined,
            status: 'not_started',
            order: nextOrder,
        });
        setNewPhaseName('');
        setNewPhaseDesc('');
        setShowAddPhase(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ maxWidth: 960 }}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <ClipboardList size={22} style={{ color: 'var(--color-accent-primary)' }} />
                    <div>
                        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                            Implementation Plans
                        </h2>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
                            Track development phases and progress per venture
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <select
                        value={selectedVentureId}
                        onChange={e => setSelectedVentureId(e.target.value)}
                        className="form-select"
                        style={{ fontSize: 'var(--font-size-sm)' }}
                    >
                        <option value="all">All Ventures</option>
                        {ventures.map(v => (
                            <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                    </select>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowAddPlan(true)}>
                        <Plus size={14} />
                        New Plan
                    </button>
                </div>
            </div>

            {/* Add Plan Modal */}
            <AnimatePresence>
                {showAddPlan && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        style={{
                            background: 'var(--color-bg-secondary)', borderRadius: 'var(--border-radius-lg)',
                            border: '1px solid var(--border-color)', padding: 'var(--space-4)', marginBottom: 'var(--space-4)',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                            <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Create Implementation Plan</span>
                            <button onClick={() => setShowAddPlan(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                                <X size={16} />
                            </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                            <input
                                className="form-input"
                                placeholder="Plan name"
                                value={newPlanName}
                                onChange={e => setNewPlanName(e.target.value)}
                            />
                            <select
                                className="form-select"
                                value={newPlanVenture}
                                onChange={e => setNewPlanVenture(e.target.value)}
                            >
                                <option value="">Select venture</option>
                                {ventures.map(v => (
                                    <option key={v.id} value={v.id}>{v.name}</option>
                                ))}
                            </select>
                        </div>
                        <textarea
                            className="form-input"
                            placeholder="Description (optional)"
                            value={newPlanDesc}
                            onChange={e => setNewPlanDesc(e.target.value)}
                            rows={2}
                            style={{ marginBottom: 'var(--space-3)', resize: 'vertical' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => setShowAddPlan(false)}>Cancel</button>
                            <button className="btn btn-primary btn-sm" onClick={handleAddPlan} disabled={!newPlanName || !newPlanVenture}>Create</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Plans */}
            {plans.length === 0 ? (
                <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                    <ClipboardList size={40} className="empty-state-icon" />
                    <div className="empty-state-title">No implementation plans yet</div>
                    <div className="empty-state-text">Create a plan to track development phases</div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {plans.map(plan => {
                        const venture = state.ventures.find(v => v.id === plan.venture_id);
                        const progress = computePlanProgress(plan, tasksByPhase);
                        const sortedPhases = [...plan.phases].sort((a, b) => a.order - b.order);

                        return (
                            <motion.div
                                key={plan.id}
                                layout
                                style={{
                                    background: 'var(--color-bg-secondary)', borderRadius: 'var(--border-radius-lg)',
                                    border: '1px solid var(--border-color)', overflow: 'hidden',
                                }}
                            >
                                {/* Plan Header */}
                                <div style={{
                                    padding: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                                    borderBottom: '1px solid var(--border-color)',
                                }}>
                                    {venture && (
                                        <span className="venture-prefix" style={{ background: venture.color }}>
                                            {venture.prefix}
                                        </span>
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', color: 'var(--color-text-primary)' }}>{plan.name}</div>
                                        {plan.description && (
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>{plan.description}</div>
                                        )}
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: progress >= 100 ? 'var(--color-success)' : 'var(--color-text-primary)' }}>
                                            {progress}%
                                        </div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                            {plan.phases.filter(p => p.status === 'completed').length}/{plan.phases.length} phases
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deletePlan(plan.id)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4 }}
                                        title="Delete plan"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                {/* Progress bar */}
                                <div style={{ height: 4, background: 'var(--color-bg-tertiary)' }}>
                                    <div style={{
                                        height: '100%', width: `${progress}%`,
                                        background: venture ? `linear-gradient(90deg, ${venture.color}, ${venture.color}dd)` : 'var(--color-accent-primary)',
                                        transition: 'width 0.4s ease',
                                    }} />
                                </div>

                                {/* Phases */}
                                <div>
                                    {sortedPhases.map(phase => (
                                        <PhaseRow
                                            key={phase.id}
                                            phase={phase}
                                            planId={plan.id}
                                            linkedTasks={tasksByPhase.get(phase.id) ?? []}
                                            ventureColor={venture?.color ?? 'var(--color-accent-primary)'}
                                            isExpanded={expandedPhases.has(phase.id)}
                                            onToggle={() => togglePhase(phase.id)}
                                        />
                                    ))}
                                </div>

                                {/* Add phase */}
                                {showAddPhase === plan.id ? (
                                    <div style={{ padding: 'var(--space-3) var(--space-4)', borderTop: '1px solid var(--border-color)', background: 'var(--color-bg-tertiary)' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                                            <input className="form-input" placeholder="Phase name" value={newPhaseName} onChange={e => setNewPhaseName(e.target.value)} style={{ fontSize: 'var(--font-size-sm)' }} />
                                            <input className="form-input" placeholder="Description (optional)" value={newPhaseDesc} onChange={e => setNewPhaseDesc(e.target.value)} style={{ fontSize: 'var(--font-size-sm)' }} />
                                        </div>
                                        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                                            <button className="btn btn-secondary btn-sm" onClick={() => { setShowAddPhase(null); setNewPhaseName(''); setNewPhaseDesc(''); }}>Cancel</button>
                                            <button className="btn btn-primary btn-sm" onClick={() => handleAddPhase(plan.id)} disabled={!newPhaseName}>Add Phase</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowAddPhase(plan.id)}
                                        style={{
                                            width: '100%', padding: 'var(--space-2) var(--space-4)', border: 'none',
                                            borderTop: '1px solid var(--border-color)', background: 'transparent',
                                            color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                                            transition: 'background 0.15s',
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-tertiary)')}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <Plus size={12} />
                                        Add phase
                                    </button>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}
