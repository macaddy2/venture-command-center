import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Plus, Trash2, TrendingUp, Users, Briefcase, X } from 'lucide-react';
import { useStore } from '../lib/store';
import type { EquityRole } from '../lib/types';
import { generateId } from '../lib/utils';

const ROLE_COLORS: Record<EquityRole, string> = {
    'Founder': '#6366F1',
    'Cofounder': '#818CF8',
    'Investor': '#10B981',
    'Advisor': '#F59E0B',
    'Employee': '#3B82F6',
    'ESOP Pool': '#8B5CF6',
};

const currencySymbols = { GBP: '£', NGN: '₦', USD: '$' } as const;

export default function EquityTracker() {
    const { state, dispatch, addEquity } = useStore();
    const [selectedVentureId, setSelectedVentureId] = useState<string>('all');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        venture_id: '',
        stakeholder: '',
        role: 'Founder' as EquityRole,
        percentage: '',
        shares: '',
        investment_amount: '',
        currency: 'GBP' as 'GBP' | 'NGN' | 'USD',
        date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const ventures = state.ventures.filter(v => v.tier !== 'Parked');

    const equityRecords = useMemo(() => {
        if (selectedVentureId === 'all') return state.equity;
        return state.equity.filter(e => e.venture_id === selectedVentureId);
    }, [state.equity, selectedVentureId]);

    const pieData = useMemo(() => {
        const records = selectedVentureId === 'all' ? [] : equityRecords;
        return records.map(e => ({
            name: e.stakeholder,
            value: e.percentage,
            role: e.role,
        }));
    }, [equityRecords, selectedVentureId]);

    const stats = useMemo(() => {
        const venturesWithEquity = new Set(state.equity.map(e => e.venture_id)).size;
        const totalStakeholders = state.equity.length;
        const largest = state.equity.reduce<{ name: string; pct: number } | null>((best, e) => {
            if (!best || e.percentage > best.pct) return { name: e.stakeholder, pct: e.percentage };
            return best;
        }, null);
        return { venturesWithEquity, totalStakeholders, largest };
    }, [state.equity]);

    const handleSubmit = () => {
        if (!form.venture_id || !form.stakeholder || !form.percentage) return;
        addEquity({
            venture_id: form.venture_id,
            stakeholder: form.stakeholder,
            role: form.role,
            percentage: parseFloat(form.percentage),
            shares: form.shares ? parseInt(form.shares) : undefined,
            investment_amount: form.investment_amount ? parseFloat(form.investment_amount) : undefined,
            currency: form.investment_amount ? form.currency : undefined,
            date: form.date,
            notes: form.notes || undefined,
        });
        setShowForm(false);
        setForm({ venture_id: '', stakeholder: '', role: 'Founder', percentage: '', shares: '', investment_amount: '', currency: 'GBP', date: new Date().toISOString().split('T')[0], notes: '' });
    };

    const getVentureName = (id: string) => state.ventures.find(v => v.id === id)?.name ?? id;
    const getVentureColor = (id: string) => state.ventures.find(v => v.id === id)?.color ?? '#6366F1';

    const selectedVenture = ventures.find(v => v.id === selectedVentureId);
    const totalPct = equityRecords.reduce((s, e) => s + e.percentage, 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ padding: 'var(--space-6)', maxWidth: 1100 }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
                <div>
                    <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, margin: 0 }}>Equity & Cap Table</h1>
                    <p style={{ color: 'var(--color-text-secondary)', marginTop: 4, fontSize: 'var(--font-size-sm)' }}>
                        Ownership structure across your portfolio
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Plus size={16} /> Add Stakeholder
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                {[
                    { label: 'Ventures with Cap Data', value: stats.venturesWithEquity, icon: <Briefcase size={18} />, color: '#6366F1' },
                    { label: 'Total Stakeholders', value: stats.totalStakeholders, icon: <Users size={18} />, color: '#10B981' },
                    { label: 'Largest Stake', value: stats.largest ? `${stats.largest.name} (${stats.largest.pct}%)` : '—', icon: <TrendingUp size={18} />, color: '#F59E0B' },
                ].map(card => (
                    <div key={card.label} className="stat-card" style={{ padding: 'var(--space-4)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <span style={{ color: card.color }}>{card.icon}</span>
                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</span>
                        </div>
                        <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>{card.value}</div>
                    </div>
                ))}
            </div>

            {/* Venture Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
                <button
                    onClick={() => setSelectedVentureId('all')}
                    className={`filter-pill${selectedVentureId === 'all' ? ' active' : ''}`}
                >
                    All Ventures
                </button>
                {ventures.map(v => (
                    <button
                        key={v.id}
                        onClick={() => setSelectedVentureId(v.id)}
                        className={`filter-pill${selectedVentureId === v.id ? ' active' : ''}`}
                        style={selectedVentureId === v.id ? { borderColor: v.color, background: v.lightColor } : {}}
                    >
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: v.color, display: 'inline-block', marginRight: 6 }} />
                        {v.name}
                    </button>
                ))}
            </div>

            {/* Main Content: Pie + Table */}
            <div style={{ display: 'grid', gridTemplateColumns: selectedVentureId !== 'all' && pieData.length > 0 ? '380px 1fr' : '1fr', gap: 'var(--space-5)' }}>

                {/* Pie Chart (only for individual venture) */}
                {selectedVentureId !== 'all' && pieData.length > 0 && (
                    <div className="stat-card" style={{ padding: 'var(--space-5)' }}>
                        <h3 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                            {selectedVenture?.name} Ownership Split
                        </h3>
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label={({ value }) => `${value}%`}
                                    labelLine={false}
                                >
                                    {pieData.map((entry, i) => (
                                        <Cell key={i} fill={ROLE_COLORS[entry.role as EquityRole] ?? '#6366F1'} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(val) => `${val}%`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                        {totalPct !== 100 && totalPct > 0 && (
                            <p style={{ textAlign: 'center', fontSize: 'var(--font-size-xs)', color: 'var(--color-warning)', marginTop: 8 }}>
                                Total: {totalPct.toFixed(1)}% (should sum to 100%)
                            </p>
                        )}
                    </div>
                )}

                {/* Equity Table */}
                <div className="stat-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-border)' }}>
                        <h3 style={{ margin: 0, fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                            {selectedVentureId === 'all' ? 'All Stakeholders' : `${selectedVenture?.name ?? ''} Stakeholders`}
                            <span style={{ marginLeft: 8, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 400 }}>
                                {equityRecords.length} {equityRecords.length === 1 ? 'record' : 'records'}
                            </span>
                        </h3>
                    </div>
                    {equityRecords.length === 0 ? (
                        <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                            No equity records yet. Add your first stakeholder.
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
                            <thead>
                                <tr style={{ background: 'var(--color-bg-secondary)' }}>
                                    {['Stakeholder', 'Venture', 'Role', '%', 'Shares', 'Investment', 'Date', ''].map(h => (
                                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {equityRecords.map(record => (
                                    <tr key={record.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                                        <td style={{ padding: '12px 14px', fontWeight: 500 }}>{record.stakeholder}</td>
                                        <td style={{ padding: '12px 14px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: getVentureColor(record.venture_id), flexShrink: 0 }} />
                                                <span style={{ color: 'var(--color-text-secondary)' }}>{getVentureName(record.venture_id)}</span>
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 14px' }}>
                                            <span style={{
                                                padding: '2px 8px',
                                                borderRadius: 'var(--border-radius-full)',
                                                fontSize: 'var(--font-size-xs)',
                                                background: ROLE_COLORS[record.role] + '22',
                                                color: ROLE_COLORS[record.role],
                                                fontWeight: 600,
                                            }}>{record.role}</span>
                                        </td>
                                        <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--color-accent-primary)' }}>{record.percentage}%</td>
                                        <td style={{ padding: '12px 14px', color: 'var(--color-text-secondary)' }}>{record.shares?.toLocaleString() ?? '—'}</td>
                                        <td style={{ padding: '12px 14px', color: 'var(--color-text-secondary)' }}>
                                            {record.investment_amount ? `${currencySymbols[record.currency ?? 'GBP']}${record.investment_amount.toLocaleString()}` : '—'}
                                        </td>
                                        <td style={{ padding: '12px 14px', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>{record.date}</td>
                                        <td style={{ padding: '12px 14px' }}>
                                            <button
                                                onClick={() => dispatch({ type: 'DELETE_EQUITY', payload: record.id })}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4 }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Add Stakeholder Modal */}
            {showForm && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            background: 'var(--color-bg-card)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--border-radius-lg)',
                            padding: 'var(--space-6)',
                            width: 480,
                            maxWidth: '90vw',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
                            <h2 style={{ margin: 0, fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>Add Stakeholder</h2>
                            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                                <div>
                                    <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Venture *</label>
                                    <select className="form-select" value={form.venture_id} onChange={e => setForm(f => ({ ...f, venture_id: e.target.value }))}>
                                        <option value="">Select venture</option>
                                        {ventures.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Role *</label>
                                    <select className="form-select" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as EquityRole }))}>
                                        {(['Founder', 'Cofounder', 'Investor', 'Advisor', 'Employee', 'ESOP Pool'] as EquityRole[]).map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Stakeholder Name *</label>
                                <input className="form-input" value={form.stakeholder} onChange={e => setForm(f => ({ ...f, stakeholder: e.target.value }))} placeholder="e.g. Jane Smith" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                                <div>
                                    <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Ownership % *</label>
                                    <input className="form-input" type="number" min="0" max="100" step="0.1" value={form.percentage} onChange={e => setForm(f => ({ ...f, percentage: e.target.value }))} placeholder="e.g. 25" />
                                </div>
                                <div>
                                    <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Shares (optional)</label>
                                    <input className="form-input" type="number" min="0" value={form.shares} onChange={e => setForm(f => ({ ...f, shares: e.target.value }))} placeholder="e.g. 250000" />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 'var(--space-3)' }}>
                                <div>
                                    <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Currency</label>
                                    <select className="form-select" value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value as 'GBP' | 'NGN' | 'USD' }))}>
                                        <option value="GBP">GBP</option>
                                        <option value="NGN">NGN</option>
                                        <option value="USD">USD</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Investment Amount (optional)</label>
                                    <input className="form-input" type="number" min="0" value={form.investment_amount} onChange={e => setForm(f => ({ ...f, investment_amount: e.target.value }))} placeholder="e.g. 25000" />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                                <div>
                                    <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Date</label>
                                    <input className="form-input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Notes</label>
                                    <input className="form-input" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes" />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                                <button className="btn" onClick={() => setShowForm(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={handleSubmit} disabled={!form.venture_id || !form.stakeholder || !form.percentage} style={{ opacity: (!form.venture_id || !form.stakeholder || !form.percentage) ? 0.5 : 1 }}>Add Stakeholder</button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}

// Needed for generateId usage in modal fallback
const _generateId = generateId;
void _generateId;
