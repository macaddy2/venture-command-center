// ============================================================
// Resource Sharing — Cross-venture resource allocation
// ============================================================

import { useState } from 'react';
import { useStore } from '../lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import type { ResourceSharing } from '../lib/types';
import {
    Share2, Plus, X, ArrowRight, Calendar
} from 'lucide-react';

const resourceTypeColors: Record<string, string> = {
    person: '#3B82F6', tool: '#10B981', budget: '#F59E0B', knowledge: '#6366F1',
};

export default function ResourceSharingView() {
    const { state, addResourceSharing, dispatch } = useStore();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<Partial<ResourceSharing>>({
        resource_type: 'person', status: 'active',
    });

    const active = state.resourceSharing.filter(r => r.status === 'active');
    const completed = state.resourceSharing.filter(r => r.status === 'completed');

    const handleSubmit = () => {
        if (!form.from_venture_id || !form.to_venture_id || !form.resource_name) return;
        addResourceSharing(form as Omit<ResourceSharing, 'id' | 'created_at'>);
        setShowForm(false);
        setForm({ resource_type: 'person', status: 'active' });
    };

    const renderCard = (rs: ResourceSharing) => {
        const fromV = state.ventures.find(v => v.id === rs.from_venture_id);
        const toV = state.ventures.find(v => v.id === rs.to_venture_id);
        return (
            <motion.div key={rs.id} className="card card-body"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                style={{ opacity: rs.status === 'completed' ? 0.6 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <span style={{
                            padding: '2px 8px', borderRadius: 'var(--border-radius-full)',
                            background: `${resourceTypeColors[rs.resource_type] || '#666'}18`,
                            color: resourceTypeColors[rs.resource_type] || '#666',
                            fontSize: 'var(--font-size-xs)', fontWeight: 600,
                        }}>
                            {rs.resource_type}
                        </span>
                    </div>
                    <button className="btn btn-secondary btn-sm btn-icon" style={{ padding: 4 }}
                        onClick={() => dispatch({ type: 'DELETE_RESOURCE_SHARING', payload: rs.id })}>
                        <X size={12} />
                    </button>
                </div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-size-md)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
                    {rs.resource_name}
                </div>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                    fontSize: 'var(--font-size-sm)',
                }}>
                    {fromV && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: fromV.color }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: fromV.color }} />
                            {fromV.prefix}
                        </span>
                    )}
                    <ArrowRight size={14} color="var(--color-text-muted)" />
                    {toV && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: toV.color }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: toV.color }} />
                            {toV.prefix}
                        </span>
                    )}
                </div>
                {rs.start_date && (
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
                        <Calendar size={10} style={{ display: 'inline', marginRight: 4 }} />
                        {new Date(rs.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        {rs.end_date && ` — ${new Date(rs.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                    </div>
                )}
            </motion.div>
        );
    };

    return (
        <div>
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 'var(--space-5)',
            }}>
                <div>
                    <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                        <Share2 size={20} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
                        Resource Sharing
                    </h2>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                        {active.length} active · {completed.length} completed
                    </p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
                    <Plus size={14} /> Share Resource
                </button>
            </div>

            {/* Active */}
            {active.length > 0 && (
                <>
                    <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, marginBottom: 'var(--space-3)', color: 'var(--color-text-primary)' }}>
                        Active Sharing
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                        {active.map(renderCard)}
                    </div>
                </>
            )}

            {/* Completed */}
            {completed.length > 0 && (
                <>
                    <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, marginBottom: 'var(--space-3)', color: 'var(--color-text-muted)' }}>
                        Completed
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                        {completed.map(renderCard)}
                    </div>
                </>
            )}

            {state.resourceSharing.length === 0 && (
                <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                    <Share2 size={40} style={{ opacity: 0.15, marginBottom: 'var(--space-3)' }} />
                    <div className="empty-state-title">No shared resources</div>
                    <div className="empty-state-text">Share team members, tools, or budget between ventures.</div>
                </div>
            )}

            {/* Form modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setShowForm(false)}>
                        <motion.div className="modal" style={{ width: 480 }}
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">Share Resource</h3>
                                <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setShowForm(false)}><X size={14} /></button>
                            </div>
                            <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                <input className="form-input" placeholder="Resource name (e.g., Sarah — Designer)" value={form.resource_name || ''}
                                    onChange={e => setForm(f => ({ ...f, resource_name: e.target.value }))} />
                                <select className="form-select" value={form.resource_type}
                                    onChange={e => setForm(f => ({ ...f, resource_type: e.target.value as any }))}>
                                    <option value="person">Person</option>
                                    <option value="tool">Tool / License</option>
                                    <option value="budget">Budget</option>
                                    <option value="knowledge">Knowledge</option>
                                </select>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                                    <div>
                                        <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 4, display: 'block' }}>From venture</label>
                                        <select className="form-select" value={form.from_venture_id || ''}
                                            onChange={e => setForm(f => ({ ...f, from_venture_id: e.target.value }))}>
                                            <option value="">Select...</option>
                                            {state.ventures.map(v => <option key={v.id} value={v.id}>{v.prefix} — {v.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 4, display: 'block' }}>To venture</label>
                                        <select className="form-select" value={form.to_venture_id || ''}
                                            onChange={e => setForm(f => ({ ...f, to_venture_id: e.target.value }))}>
                                            <option value="">Select...</option>
                                            {state.ventures.map(v => <option key={v.id} value={v.id}>{v.prefix} — {v.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                                    <div>
                                        <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 4, display: 'block' }}>Start date</label>
                                        <input className="form-input" type="date" value={form.start_date || ''}
                                            onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 4, display: 'block' }}>End date (optional)</label>
                                        <input className="form-input" type="date" value={form.end_date || ''}
                                            onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
                                    </div>
                                </div>
                                <button className="btn btn-primary" onClick={handleSubmit}>Share Resource</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
