// ============================================================
// Financial Tracker — Revenue, expenses, runway
// ============================================================

import { useState, useMemo } from 'react';
import { useStore } from '../lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import type { FinancialRecord, FinancialType } from '../lib/types';
import {
    DollarSign, TrendingUp, TrendingDown, Banknote, Plus, X,
    PiggyBank, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

const typeConfig: Record<FinancialType, { label: string; color: string; icon: typeof TrendingUp }> = {
    revenue: { label: 'Revenue', color: '#10B981', icon: ArrowUpRight },
    expense: { label: 'Expense', color: '#EF4444', icon: ArrowDownRight },
    funding: { label: 'Funding', color: '#6366F1', icon: PiggyBank },
    runway: { label: 'Runway', color: '#F59E0B', icon: Banknote },
};

const currencySymbol: Record<string, string> = { GBP: '£', NGN: '₦', USD: '$' };

export default function FinancialTracker() {
    const { state, addFinancial, dispatch } = useStore();
    const [showForm, setShowForm] = useState(false);
    const [ventureFilter, setVentureFilter] = useState<string>('all');
    const [form, setForm] = useState<Partial<FinancialRecord>>({
        type: 'expense', currency: 'GBP', venture_id: '',
    });

    const filtered = useMemo(() => {
        let records = state.financials;
        if (ventureFilter !== 'all') records = records.filter(r => r.venture_id === ventureFilter);
        return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [state.financials, ventureFilter]);

    // Summary stats
    const stats = useMemo(() => {
        const revenue = filtered.filter(r => r.type === 'revenue' || r.type === 'funding').reduce((s, r) => s + r.amount, 0);
        const expenses = filtered.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0);
        return { revenue, expenses, net: revenue - expenses };
    }, [filtered]);

    // Group by venture
    const byVenture = useMemo(() => {
        const groups: Record<string, { venture: string; color: string; revenue: number; expense: number }> = {};
        state.financials.forEach(r => {
            const v = state.ventures.find(v => v.id === r.venture_id);
            if (!v) return;
            if (!groups[v.id]) groups[v.id] = { venture: v.name, color: v.color, revenue: 0, expense: 0 };
            if (r.type === 'revenue' || r.type === 'funding') groups[v.id].revenue += r.amount;
            else if (r.type === 'expense') groups[v.id].expense += r.amount;
        });
        return Object.values(groups);
    }, [state.financials, state.ventures]);

    const handleSubmit = () => {
        if (!form.venture_id || !form.amount || !form.label || !form.date) return;
        addFinancial(form as Omit<FinancialRecord, 'id'>);
        setShowForm(false);
        setForm({ type: 'expense', currency: 'GBP', venture_id: '' });
    };

    const formatAmount = (amount: number, currency: string = 'GBP') =>
        `${currencySymbol[currency] || currency}${amount.toLocaleString()}`;

    return (
        <div>
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 'var(--space-5)',
            }}>
                <div>
                    <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                        <DollarSign size={20} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
                        Financial Tracker
                    </h2>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                        {state.financials.length} records across {state.ventures.length} ventures
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <select className="form-select" style={{ width: 'auto', fontSize: 'var(--font-size-sm)' }}
                        value={ventureFilter} onChange={e => setVentureFilter(e.target.value)}>
                        <option value="all">All Ventures</option>
                        {state.ventures.map(v => <option key={v.id} value={v.id}>{v.prefix} — {v.name}</option>)}
                    </select>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
                        <Plus size={14} /> Add Record
                    </button>
                </div>
            </div>

            {/* KPI Summary */}
            <div className="stat-grid" style={{ marginBottom: 'var(--space-6)' }}>
                {[
                    { label: 'Total Revenue', value: formatAmount(stats.revenue), color: '#10B981', icon: TrendingUp },
                    { label: 'Total Expenses', value: formatAmount(stats.expenses), color: '#EF4444', icon: TrendingDown },
                    { label: 'Net Position', value: formatAmount(stats.net), color: stats.net >= 0 ? '#10B981' : '#EF4444', icon: DollarSign },
                ].map((stat, i) => (
                    <motion.div key={i} className="stat-card"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <div className="stat-card-header">
                            <span className="stat-card-label">{stat.label}</span>
                            <stat.icon size={16} color={stat.color} />
                        </div>
                        <div className="stat-card-value" style={{ color: stat.color }}>{stat.value}</div>
                    </motion.div>
                ))}
            </div>

            {/* Venture breakdown */}
            {byVenture.length > 0 && (
                <div className="card card-body" style={{ marginBottom: 'var(--space-6)' }}>
                    <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
                        By Venture
                    </h3>
                    {byVenture.map((g, i) => {
                        const maxVal = Math.max(...byVenture.map(x => Math.max(x.revenue, x.expense)), 1);
                        return (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                                padding: '8px 0', borderBottom: '1px solid var(--border-color)',
                            }}>
                                <span style={{
                                    width: 8, height: 8, borderRadius: '50%', background: g.color, flexShrink: 0,
                                }} />
                                <span style={{ width: 120, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                    {g.venture}
                                </span>
                                <div style={{ flex: 1, display: 'flex', gap: 4 }}>
                                    <div style={{
                                        width: `${(g.revenue / maxVal) * 100}%`,
                                        height: 16, borderRadius: 4,
                                        background: 'linear-gradient(90deg, #10B98130, #10B981)',
                                        minWidth: g.revenue > 0 ? 4 : 0,
                                    }} />
                                    <div style={{
                                        width: `${(g.expense / maxVal) * 100}%`,
                                        height: 16, borderRadius: 4,
                                        background: 'linear-gradient(90deg, #EF444430, #EF4444)',
                                        minWidth: g.expense > 0 ? 4 : 0,
                                    }} />
                                </div>
                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', width: 100, textAlign: 'right' }}>
                                    {formatAmount(g.revenue - g.expense)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Transaction list */}
            <div className="card card-body" style={{ padding: 0 }}>
                <div style={{
                    padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--border-color)',
                    fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)',
                    display: 'grid', gridTemplateColumns: '100px 1fr 100px 100px 40px',
                }}>
                    <span>Date</span><span>Description</span><span>Type</span><span style={{ textAlign: 'right' }}>Amount</span><span></span>
                </div>

                {filtered.length === 0 ? (
                    <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        No financial records yet
                    </div>
                ) : (
                    filtered.map(rec => {
                        const tc = typeConfig[rec.type];
                        const venture = state.ventures.find(v => v.id === rec.venture_id);
                        return (
                            <div key={rec.id} style={{
                                display: 'grid', gridTemplateColumns: '100px 1fr 100px 100px 40px',
                                alignItems: 'center', padding: 'var(--space-3) var(--space-4)',
                                borderBottom: '1px solid var(--border-color)',
                                fontSize: 'var(--font-size-sm)',
                            }}>
                                <span style={{ color: 'var(--color-text-muted)' }}>
                                    {new Date(rec.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-secondary)' }}>
                                    {venture && <span style={{ width: 6, height: 6, borderRadius: '50%', background: venture.color }} />}
                                    {rec.label}
                                </span>
                                <span style={{
                                    fontSize: 'var(--font-size-xs)', padding: '2px 8px',
                                    borderRadius: 'var(--border-radius-full)',
                                    background: `${tc.color}18`, color: tc.color, fontWeight: 600,
                                }}>
                                    {tc.label}
                                </span>
                                <span style={{
                                    textAlign: 'right', fontWeight: 600,
                                    color: rec.type === 'expense' ? 'var(--color-danger)' : 'var(--color-success)',
                                }}>
                                    {rec.type === 'expense' ? '-' : '+'}{formatAmount(rec.amount, rec.currency)}
                                </span>
                                <button className="btn btn-secondary btn-sm btn-icon" style={{ padding: 4 }}
                                    onClick={() => dispatch({ type: 'DELETE_FINANCIAL', payload: rec.id })}>
                                    <X size={12} />
                                </button>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add form modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setShowForm(false)}>
                        <motion.div className="modal" style={{ width: 480 }}
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">Add Financial Record</h3>
                                <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setShowForm(false)}><X size={14} /></button>
                            </div>
                            <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                <select className="form-select" value={form.venture_id}
                                    onChange={e => setForm(f => ({ ...f, venture_id: e.target.value }))}>
                                    <option value="">Select venture...</option>
                                    {state.ventures.map(v => <option key={v.id} value={v.id}>{v.prefix} — {v.name}</option>)}
                                </select>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                                    <select className="form-select" value={form.type}
                                        onChange={e => setForm(f => ({ ...f, type: e.target.value as FinancialType }))}>
                                        <option value="expense">Expense</option>
                                        <option value="revenue">Revenue</option>
                                        <option value="funding">Funding</option>
                                        <option value="runway">Runway</option>
                                    </select>
                                    <select className="form-select" value={form.currency}
                                        onChange={e => setForm(f => ({ ...f, currency: e.target.value as 'GBP' | 'NGN' | 'USD' }))}>
                                        <option value="GBP">£ GBP</option>
                                        <option value="NGN">₦ NGN</option>
                                        <option value="USD">$ USD</option>
                                    </select>
                                </div>
                                <input className="form-input" type="number" placeholder="Amount" value={form.amount || ''}
                                    onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))} />
                                <input className="form-input" type="text" placeholder="Description" value={form.label || ''}
                                    onChange={e => setForm(f => ({ ...f, label: e.target.value }))} />
                                <input className="form-input" type="date" value={form.date || ''}
                                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                                <button className="btn btn-primary" onClick={handleSubmit}>Add Record</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
