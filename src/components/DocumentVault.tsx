// ============================================================
// Document Vault — Per-venture document links
// ============================================================

import { useState, useMemo } from 'react';
import { useStore } from '../lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import type { VentureDocument, DocCategory } from '../lib/types';
import {
    FileText, Plus, X, ExternalLink, Search,
    Briefcase, BarChart3, Code, Scale, Megaphone, FolderOpen
} from 'lucide-react';

const categoryConfig: Record<DocCategory, { label: string; color: string; icon: typeof FileText }> = {
    legal: { label: 'Legal', color: '#EF4444', icon: Scale },
    pitch: { label: 'Pitch', color: '#6366F1', icon: Briefcase },
    technical: { label: 'Technical', color: '#3B82F6', icon: Code },
    financial: { label: 'Financial', color: '#10B981', icon: BarChart3 },
    marketing: { label: 'Marketing', color: '#F59E0B', icon: Megaphone },
    other: { label: 'Other', color: '#64748B', icon: FolderOpen },
};

export default function DocumentVault() {
    const { state, addDocument, dispatch } = useStore();
    const [showForm, setShowForm] = useState(false);
    const [ventureFilter, setVentureFilter] = useState<string>('all');
    const [catFilter, setCatFilter] = useState<string>('all');
    const [search, setSearch] = useState('');
    const [form, setForm] = useState<Partial<VentureDocument>>({ category: 'other', venture_id: '' });

    const filtered = useMemo(() => {
        let docs = state.documents;
        if (ventureFilter !== 'all') docs = docs.filter(d => d.venture_id === ventureFilter);
        if (catFilter !== 'all') docs = docs.filter(d => d.category === catFilter);
        if (search) {
            const q = search.toLowerCase();
            docs = docs.filter(d => d.name.toLowerCase().includes(q) || d.notes?.toLowerCase().includes(q));
        }
        return docs.sort((a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime());
    }, [state.documents, ventureFilter, catFilter, search]);

    // Group by venture
    const grouped = useMemo(() => {
        const groups: Record<string, { venture: any; docs: typeof filtered }> = {};
        filtered.forEach(d => {
            const v = state.ventures.find(v => v.id === d.venture_id);
            if (!v) return;
            if (!groups[v.id]) groups[v.id] = { venture: v, docs: [] };
            groups[v.id].docs.push(d);
        });
        return Object.values(groups);
    }, [filtered, state.ventures]);

    const handleSubmit = () => {
        if (!form.venture_id || !form.name || !form.url) return;
        addDocument(form as Omit<VentureDocument, 'id' | 'added_at'>);
        setShowForm(false);
        setForm({ category: 'other', venture_id: '' });
    };

    return (
        <div>
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 'var(--space-5)',
            }}>
                <div>
                    <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                        <FileText size={20} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
                        Document Vault
                    </h2>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                        {state.documents.length} documents across {new Set(state.documents.map(d => d.venture_id)).size} ventures
                    </p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
                    <Plus size={14} /> Add Document
                </button>
            </div>

            {/* Filters */}
            <div style={{
                display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-5)', flexWrap: 'wrap',
            }}>
                <div className="search-wrapper" style={{ flex: 1, minWidth: 200 }}>
                    <Search size={14} className="search-icon" />
                    <input className="form-input" placeholder="Search documents..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        style={{ paddingLeft: 32 }} />
                </div>
                <select className="form-select" style={{ width: 'auto' }} value={ventureFilter}
                    onChange={e => setVentureFilter(e.target.value)}>
                    <option value="all">All Ventures</option>
                    {state.ventures.map(v => <option key={v.id} value={v.id}>{v.prefix} — {v.name}</option>)}
                </select>
                <select className="form-select" style={{ width: 'auto' }} value={catFilter}
                    onChange={e => setCatFilter(e.target.value)}>
                    <option value="all">All Categories</option>
                    {(Object.keys(categoryConfig) as DocCategory[]).map(c =>
                        <option key={c} value={c}>{categoryConfig[c].label}</option>
                    )}
                </select>
            </div>

            {/* Category stat badges */}
            <div style={{
                display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-5)', flexWrap: 'wrap',
            }}>
                {(Object.entries(categoryConfig) as [DocCategory, typeof categoryConfig.legal][]).map(([key, cfg]) => {
                    const count = state.documents.filter(d => d.category === key).length;
                    return (
                        <span key={key} style={{
                            padding: '4px 12px', borderRadius: 'var(--border-radius-full)',
                            background: `${cfg.color}18`, color: cfg.color, fontSize: 'var(--font-size-xs)',
                            fontWeight: 600, cursor: 'pointer',
                            border: catFilter === key ? `1px solid ${cfg.color}` : '1px solid transparent',
                        }} onClick={() => setCatFilter(catFilter === key ? 'all' : key)}>
                            {cfg.label} ({count})
                        </span>
                    );
                })}
            </div>

            {/* Document Groups */}
            {grouped.length === 0 ? (
                <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                    <FileText size={40} style={{ opacity: 0.15, marginBottom: 'var(--space-3)' }} />
                    <div className="empty-state-title">No documents yet</div>
                    <div className="empty-state-text">Add links to pitch decks, contracts, specs, and more.</div>
                </div>
            ) : (
                grouped.map((group, gi) => (
                    <motion.div key={group.venture.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: gi * 0.05 }} style={{ marginBottom: 'var(--space-5)' }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                            marginBottom: 'var(--space-3)',
                        }}>
                            <span style={{
                                width: 8, height: 8, borderRadius: '50%', background: group.venture.color,
                            }} />
                            <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                {group.venture.name}
                            </h3>
                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                ({group.docs.length})
                            </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
                            {group.docs.map(doc => {
                                const cat = categoryConfig[doc.category];
                                const CatIcon = cat.icon;
                                return (
                                    <div key={doc.id} className="card card-body" style={{
                                        padding: 'var(--space-3)', display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)',
                                        cursor: 'pointer', transition: 'border-color 0.2s',
                                    }}
                                        onClick={() => window.open(doc.url, '_blank')}>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: 'var(--border-radius-md)',
                                            background: `${cat.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0,
                                        }}>
                                            <CatIcon size={16} color={cat.color} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-primary)',
                                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                            }}>
                                                {doc.name}
                                            </div>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                                {cat.label} · {new Date(doc.added_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            <ExternalLink size={12} color="var(--color-text-muted)" />
                                            <button className="btn btn-secondary btn-sm btn-icon" style={{ padding: 2 }}
                                                onClick={e => { e.stopPropagation(); dispatch({ type: 'DELETE_DOCUMENT', payload: doc.id }); }}>
                                                <X size={10} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
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
                                <h3 className="modal-title">Add Document</h3>
                                <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setShowForm(false)}><X size={14} /></button>
                            </div>
                            <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                <select className="form-select" value={form.venture_id}
                                    onChange={e => setForm(f => ({ ...f, venture_id: e.target.value }))}>
                                    <option value="">Select venture...</option>
                                    {state.ventures.map(v => <option key={v.id} value={v.id}>{v.prefix} — {v.name}</option>)}
                                </select>
                                <input className="form-input" placeholder="Document name" value={form.name || ''}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                                <input className="form-input" placeholder="URL (Google Drive, Notion, etc.)" value={form.url || ''}
                                    onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
                                <select className="form-select" value={form.category}
                                    onChange={e => setForm(f => ({ ...f, category: e.target.value as DocCategory }))}>
                                    {(Object.entries(categoryConfig) as [DocCategory, typeof categoryConfig.legal][]).map(([k, v]) =>
                                        <option key={k} value={k}>{v.label}</option>
                                    )}
                                </select>
                                <textarea className="form-textarea" placeholder="Notes (optional)" value={form.notes || ''}
                                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
                                <button className="btn btn-primary" onClick={handleSubmit}>Add Document</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
