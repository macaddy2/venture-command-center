// ============================================================
// Risk Matrix — Severity/likelihood matrix with risk cards
// ============================================================

import { useState, useMemo } from 'react';
import { useStore } from '../lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import type { Risk, RiskLikelihood, RiskImpact, RiskStatus } from '../lib/types';
import { ShieldAlert, Plus, X, Shield } from 'lucide-react';

const statusColors: Record<RiskStatus, string> = {
    active: '#EF4444', mitigated: '#F59E0B', accepted: '#6366F1', resolved: '#10B981',
};

export default function RiskMatrix() {
    const { state, addRisk, dispatch } = useStore();
    const [showForm, setShowForm] = useState(false);
    const [ventureFilter, setVentureFilter] = useState<string>('all');
    const [form, setForm] = useState<Partial<Risk>>({
        likelihood: 3, impact: 3, status: 'active', venture_id: '',
    });

    const filtered = useMemo(() => {
        let risks = state.risks;
        if (ventureFilter !== 'all') risks = risks.filter(r => r.venture_id === ventureFilter);
        return risks.sort((a, b) => (b.likelihood * b.impact) - (a.likelihood * a.impact));
    }, [state.risks, ventureFilter]);

    const activeCount = filtered.filter(r => r.status === 'active').length;
    const criticalCount = filtered.filter(r => r.likelihood * r.impact >= 16).length;

    const handleSubmit = () => {
        if (!form.venture_id || !form.title) return;
        addRisk(form as Omit<Risk, 'id' | 'created_at'>);
        setShowForm(false);
        setForm({ likelihood: 3, impact: 3, status: 'active', venture_id: '' });
    };

    const getRiskLevel = (l: number, i: number): { label: string; color: string } => {
        const score = l * i;
        if (score >= 16) return { label: 'Critical', color: '#EF4444' };
        if (score >= 9) return { label: 'High', color: '#F59E0B' };
        if (score >= 4) return { label: 'Medium', color: '#6366F1' };
        return { label: 'Low', color: '#10B981' };
    };

    // 5×5 Matrix data
    const matrixData = useMemo(() => {
        const cells: Record<string, typeof filtered> = {};
        for (let l = 1; l <= 5; l++) {
            for (let i = 1; i <= 5; i++) {
                cells[`${l}-${i}`] = filtered.filter(r => r.likelihood === l && r.impact === i);
            }
        }
        return cells;
    }, [filtered]);

    return (
        <div>
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 'var(--space-5)',
            }}>
                <div>
                    <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                        <ShieldAlert size={20} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
                        Risk Matrix
                    </h2>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                        {activeCount} active · {criticalCount} critical · {filtered.length} total
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <select className="form-select" style={{ width: 'auto', fontSize: 'var(--font-size-sm)' }}
                        value={ventureFilter} onChange={e => setVentureFilter(e.target.value)}>
                        <option value="all">All Ventures</option>
                        {state.ventures.map(v => <option key={v.id} value={v.id}>{v.prefix} — {v.name}</option>)}
                    </select>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
                        <Plus size={14} /> Add Risk
                    </button>
                </div>
            </div>

            {/* 5×5 Heat Map Matrix */}
            <div className="card card-body" style={{ marginBottom: 'var(--space-6)', overflowX: 'auto' }}>
                <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, marginBottom: 'var(--space-4)', color: 'var(--color-text-primary)' }}>
                    Likelihood × Impact Heat Map
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(5, 1fr)', gap: 2, minWidth: 500 }}>
                    {/* Header */}
                    <div></div>
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} style={{
                            textAlign: 'center', fontSize: 'var(--font-size-xs)', fontWeight: 600,
                            color: 'var(--color-text-muted)', padding: '4px 0',
                        }}>
                            Impact {i}
                        </div>
                    ))}

                    {/* Matrix rows (top = likelihood 5, bottom = likelihood 1) */}
                    {[5, 4, 3, 2, 1].map(l => (
                        <>
                            <div key={`l-${l}`} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-muted)',
                            }}>
                                L{l}
                            </div>
                            {[1, 2, 3, 4, 5].map(i => {
                                const level = getRiskLevel(l, i);
                                const cellRisks = matrixData[`${l}-${i}`] || [];
                                return (
                                    <div key={`${l}-${i}`} style={{
                                        background: `${level.color}${cellRisks.length > 0 ? '30' : '10'}`,
                                        borderRadius: 'var(--border-radius-sm)',
                                        padding: 'var(--space-2)',
                                        minHeight: 48,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: `1px solid ${level.color}20`,
                                    }}>
                                        {cellRisks.length > 0 && (
                                            <span style={{
                                                width: 24, height: 24, borderRadius: '50%',
                                                background: level.color, color: '#fff',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 700, fontSize: 'var(--font-size-xs)',
                                            }}>
                                                {cellRisks.length}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </>
                    ))}
                </div>
            </div>

            {/* Risk cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-4)' }}>
                {filtered.map((risk, i) => {
                    const venture = state.ventures.find(v => v.id === risk.venture_id);
                    const level = getRiskLevel(risk.likelihood, risk.impact);
                    return (
                        <motion.div key={risk.id} className="card card-body"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            style={{ borderLeft: `3px solid ${level.color}` }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                                        {risk.title}
                                    </div>
                                    {risk.description && (
                                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
                                            {risk.description}
                                        </p>
                                    )}
                                </div>
                                <button className="btn btn-secondary btn-sm btn-icon" style={{ padding: 4 }}
                                    onClick={() => dispatch({ type: 'DELETE_RISK', payload: risk.id })}>
                                    <X size={12} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-2)' }}>
                                {venture && (
                                    <span style={{
                                        fontSize: 'var(--font-size-xs)', padding: '2px 8px',
                                        background: `${venture.color}18`, color: venture.color,
                                        borderRadius: 'var(--border-radius-full)', fontWeight: 600,
                                    }}>
                                        {venture.prefix}
                                    </span>
                                )}
                                <span style={{
                                    fontSize: 'var(--font-size-xs)', padding: '2px 8px',
                                    background: `${level.color}18`, color: level.color,
                                    borderRadius: 'var(--border-radius-full)', fontWeight: 600,
                                }}>
                                    {level.label} ({risk.likelihood}×{risk.impact})
                                </span>
                                <span style={{
                                    fontSize: 'var(--font-size-xs)', padding: '2px 8px',
                                    background: `${statusColors[risk.status]}18`, color: statusColors[risk.status],
                                    borderRadius: 'var(--border-radius-full)', fontWeight: 600,
                                }}>
                                    {risk.status}
                                </span>
                            </div>

                            {risk.mitigation && (
                                <div style={{
                                    fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)',
                                    padding: 'var(--space-2)', background: 'var(--color-bg-tertiary)',
                                    borderRadius: 'var(--border-radius-sm)', marginTop: 'var(--space-2)',
                                }}>
                                    <strong>Mitigation:</strong> {risk.mitigation}
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                    <Shield size={40} style={{ opacity: 0.15, marginBottom: 'var(--space-3)' }} />
                    <div className="empty-state-title">No risks logged</div>
                    <div className="empty-state-text">Track potential risks across your ventures.</div>
                </div>
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
                                <h3 className="modal-title">Add Risk</h3>
                                <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setShowForm(false)}><X size={14} /></button>
                            </div>
                            <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                <select className="form-select" value={form.venture_id}
                                    onChange={e => setForm(f => ({ ...f, venture_id: e.target.value }))}>
                                    <option value="">Select venture...</option>
                                    {state.ventures.map(v => <option key={v.id} value={v.id}>{v.prefix} — {v.name}</option>)}
                                </select>
                                <input className="form-input" placeholder="Risk title" value={form.title || ''}
                                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                                <textarea className="form-textarea" placeholder="Description" value={form.description || ''}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                                    <div>
                                        <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 4, display: 'block' }}>
                                            Likelihood (1-5)
                                        </label>
                                        <select className="form-select" value={form.likelihood}
                                            onChange={e => setForm(f => ({ ...f, likelihood: Number(e.target.value) as RiskLikelihood }))}>
                                            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} — {['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'][n - 1]}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 4, display: 'block' }}>
                                            Impact (1-5)
                                        </label>
                                        <select className="form-select" value={form.impact}
                                            onChange={e => setForm(f => ({ ...f, impact: Number(e.target.value) as RiskImpact }))}>
                                            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} — {['Negligible', 'Minor', 'Moderate', 'Major', 'Severe'][n - 1]}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <textarea className="form-textarea" placeholder="Mitigation strategy (optional)" value={form.mitigation || ''}
                                    onChange={e => setForm(f => ({ ...f, mitigation: e.target.value }))} rows={2} />
                                <button className="btn btn-primary" onClick={handleSubmit}>Add Risk</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
