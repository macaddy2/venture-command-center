// ============================================================
// Dashboard View — Portfolio Overview
// ============================================================

import { useStore } from '../lib/store';
import VentureCard from './VentureCard';
import DetailPanel from './DetailPanel';
import {
    Briefcase, CheckCircle2, AlertTriangle, Users,
    FileCheck, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
    const {
        state, dispatch, filteredVentures, selectedVenture, portfolioStats
    } = useStore();

    const { filters } = state;

    const stats = [
        {
            label: 'Ventures',
            val: portfolioStats.totalVentures,
            sub: `${state.ventures.filter(v => v.geo === 'UK').length} UK · ${state.ventures.filter(v => v.geo === 'NG').length} NG`,
            accent: '#6366F1',
            accentBg: 'rgba(99, 102, 241, 0.12)',
            icon: Briefcase,
        },
        {
            label: 'Tasks Done',
            val: `${portfolioStats.doneTasks}/${portfolioStats.totalTasks}`,
            sub: `${portfolioStats.totalTasks > 0 ? Math.round((portfolioStats.doneTasks / portfolioStats.totalTasks) * 100) : 0}% complete`,
            accent: '#10B981',
            accentBg: 'rgba(16, 185, 129, 0.12)',
            icon: CheckCircle2,
        },
        {
            label: 'Blocked',
            val: portfolioStats.blockedTasks,
            sub: portfolioStats.blockedTasks > 0 ? 'Needs attention' : 'All clear ✓',
            accent: portfolioStats.blockedTasks > 0 ? '#EF4444' : '#10B981',
            accentBg: portfolioStats.blockedTasks > 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
            icon: AlertTriangle,
        },
        {
            label: 'Team',
            val: `${portfolioStats.filledTeam}/${portfolioStats.totalTeam}`,
            sub: `${portfolioStats.totalTeam - portfolioStats.filledTeam} roles to fill`,
            accent: '#8B5CF6',
            accentBg: 'rgba(139, 92, 246, 0.12)',
            icon: Users,
        },
        {
            label: 'Registrations',
            val: `${portfolioStats.regsComplete}/${portfolioStats.regsTotal}`,
            sub: `${portfolioStats.regsTotal > 0 ? Math.round((portfolioStats.regsComplete / portfolioStats.regsTotal) * 100) : 0}% complete`,
            accent: '#F59E0B',
            accentBg: 'rgba(245, 158, 11, 0.12)',
            icon: FileCheck,
        },
        {
            label: 'Avg Health',
            val: portfolioStats.avgHealth,
            sub: portfolioStats.avgHealth >= 50 ? 'Good shape' : 'Needs work',
            accent: portfolioStats.avgHealth >= 50 ? '#10B981' : '#F59E0B',
            accentBg: portfolioStats.avgHealth >= 50 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
            icon: Activity,
        },
    ];

    return (
        <div>
            {/* KPI Stats Grid */}
            <div className="stat-grid">
                {stats.map((s, i) => (
                    <motion.div
                        key={s.label}
                        className="stat-card"
                        style={{ '--stat-accent': s.accent, '--stat-accent-bg': s.accentBg } as React.CSSProperties}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                    >
                        <div className="stat-card-icon">
                            <s.icon size={16} />
                        </div>
                        <div className="stat-card-label">{s.label}</div>
                        <div className="stat-card-value">{s.val}</div>
                        <div className="stat-card-sub">{s.sub}</div>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <div className="filter-bar">
                {[
                    { key: 'all' as const, label: 'All Ventures' },
                    { key: 'Active Build' as const, label: 'Active Build' },
                    { key: 'Incubating' as const, label: 'Incubating' },
                    { key: 'Parked' as const, label: 'Parked' },
                ].map(f => (
                    <button
                        key={f.key}
                        className={`filter-pill${filters.tier === f.key ? ' active' : ''}`}
                        onClick={() => dispatch({ type: 'SET_FILTERS', payload: { tier: f.key } })}
                    >
                        {f.label}
                    </button>
                ))}
                <div className="filter-divider" />
                {[
                    { key: 'all' as const, label: 'All Geos' },
                    { key: 'UK' as const, label: '🇬🇧 UK' },
                    { key: 'NG' as const, label: '🇳🇬 Nigeria' },
                ].map(f => (
                    <button
                        key={f.key}
                        className={`filter-pill${filters.geo === f.key ? ' active' : ''}`}
                        onClick={() => dispatch({ type: 'SET_FILTERS', payload: { geo: f.key } })}
                    >
                        {f.label}
                    </button>
                ))}
                <div className="filter-divider" />
                {[
                    { key: 'name' as const, label: 'A-Z' },
                    { key: 'health' as const, label: 'Health' },
                    { key: 'tasks' as const, label: 'Tasks' },
                ].map(f => (
                    <button
                        key={f.key}
                        className={`filter-pill${filters.sortBy === f.key ? ' active' : ''}`}
                        onClick={() => dispatch({ type: 'SET_FILTERS', payload: { sortBy: f.key } })}
                    >
                        Sort: {f.label}
                    </button>
                ))}
            </div>

            {/* Blockers Alert */}
            {portfolioStats.blockedTasks > 0 && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{
                        padding: 'var(--space-4)',
                        background: 'var(--color-danger-bg)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: 'var(--border-radius-md)',
                        marginBottom: 'var(--space-5)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                        <AlertTriangle size={14} color="var(--color-danger)" />
                        <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-danger)' }}>
                            {portfolioStats.blockedTasks} Active Blocker{portfolioStats.blockedTasks > 1 ? 's' : ''}
                        </span>
                    </div>
                    {filteredVentures.filter(v => v.tasks.blocked > 0).map(v => (
                        <div key={v.id} style={{
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--color-text-secondary)',
                            padding: '2px 0',
                        }}>
                            <strong style={{ color: v.color }}>{v.name}:</strong>{' '}
                            {v.tasks.blocked} blocked task{v.tasks.blocked > 1 ? 's' : ''}
                        </div>
                    ))}
                </motion.div>
            )}

            {/* Main: Venture Grid + Detail Panel */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: selectedVenture ? '1fr 400px' : '1fr',
                gap: 'var(--space-5)',
                transition: 'all var(--transition-base)',
            }}>
                {/* Venture Grid */}
                <div className="venture-grid">
                    {filteredVentures.map((v, i) => (
                        <VentureCard
                            key={v.id}
                            venture={v}
                            selected={state.selectedVentureId === v.id}
                            onClick={() => dispatch({
                                type: 'SELECT_VENTURE',
                                payload: state.selectedVentureId === v.id ? null : v.id,
                            })}
                            index={i}
                        />
                    ))}
                </div>

                {/* Detail Panel */}
                <AnimatePresence>
                    {selectedVenture && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.25 }}
                        >
                            <DetailPanel
                                venture={selectedVenture}
                                onClose={() => dispatch({ type: 'SELECT_VENTURE', payload: null })}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
