// ============================================================
// Venture Comparisons — Side-by-side analytics
// ============================================================

import { useState, useMemo } from 'react';
import { useStore } from '../lib/store';
import { motion } from 'framer-motion';
import { GitCompare } from 'lucide-react';

export default function VentureComparisons() {
    const { state, venturesWithStats } = useStore();
    const [selectedA, setSelectedA] = useState<string>(state.ventures[0]?.id || '');
    const [selectedB, setSelectedB] = useState<string>(state.ventures[1]?.id || '');

    const ventureA = venturesWithStats.find(v => v.id === selectedA);
    const ventureB = venturesWithStats.find(v => v.id === selectedB);

    const metrics = useMemo(() => {
        if (!ventureA || !ventureB) return [];
        return [
            { label: 'Health Score', a: ventureA.healthScore, b: ventureB.healthScore, format: (v: number) => `${v}%`, higherBetter: true },
            { label: 'Total Tasks', a: ventureA.tasks.total, b: ventureB.tasks.total, format: (v: number) => `${v}`, higherBetter: false },
            { label: 'Done Tasks', a: ventureA.tasks.done, b: ventureB.tasks.done, format: (v: number) => `${v}`, higherBetter: true },
            { label: 'In Progress', a: ventureA.tasks.inProgress, b: ventureB.tasks.inProgress, format: (v: number) => `${v}`, higherBetter: true },
            { label: 'Blocked', a: ventureA.tasks.blocked, b: ventureB.tasks.blocked, format: (v: number) => `${v}`, higherBetter: false },
            { label: 'Completion Rate', a: ventureA.tasks.total ? Math.round((ventureA.tasks.done / ventureA.tasks.total) * 100) : 0, b: ventureB.tasks.total ? Math.round((ventureB.tasks.done / ventureB.tasks.total) * 100) : 0, format: (v: number) => `${v}%`, higherBetter: true },
            { label: 'Team Filled', a: ventureA.team.filled, b: ventureB.team.filled, format: (v: number) => `${v}`, higherBetter: true },
            { label: 'Team Capacity', a: ventureA.team.total, b: ventureB.team.total, format: (v: number) => `${v}`, higherBetter: false },
            { label: 'Milestones', a: ventureA.milestones.length, b: ventureB.milestones.length, format: (v: number) => `${v}`, higherBetter: true },
            { label: 'Registrations Done', a: ventureA.regs.completedCount, b: ventureB.regs.completedCount, format: (v: number) => `${v}/${ventureA.regs.totalCount}`, higherBetter: true },
            { label: 'GitHub Commits (7d)', a: ventureA.github?.commits_7d || 0, b: ventureB.github?.commits_7d || 0, format: (v: number) => `${v}`, higherBetter: true },
            { label: 'Open PRs', a: ventureA.github?.prs_open || 0, b: ventureB.github?.prs_open || 0, format: (v: number) => `${v}`, higherBetter: false },
        ];
    }, [ventureA, ventureB]);

    const getWinner = (a: number, b: number, higherBetter: boolean) => {
        if (a === b) return 'tie';
        if (higherBetter) return a > b ? 'a' : 'b';
        return a < b ? 'a' : 'b';
    };

    return (
        <div>
            <div style={{ marginBottom: 'var(--space-5)' }}>
                <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                    <GitCompare size={20} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
                    Venture Comparison
                </h2>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                    Side-by-side analytics for any two ventures
                </p>
            </div>

            {/* Selectors */}
            <div style={{
                display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 'var(--space-4)',
                alignItems: 'center', marginBottom: 'var(--space-6)',
            }}>
                <div className="card card-body" style={{
                    textAlign: 'center', padding: 'var(--space-4)',
                    borderTop: `3px solid ${ventureA?.color || '#666'}`,
                }}>
                    <select className="form-select" style={{ textAlign: 'center', fontWeight: 600, fontSize: 'var(--font-size-md)' }}
                        value={selectedA} onChange={e => setSelectedA(e.target.value)}>
                        {state.ventures.map(v => <option key={v.id} value={v.id}>{v.prefix} — {v.name}</option>)}
                    </select>
                    {ventureA && (
                        <div style={{
                            fontSize: '2.5rem', fontWeight: 800, marginTop: 'var(--space-3)',
                            background: `linear-gradient(135deg, ${ventureA.color}, ${ventureA.color}88)`,
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>
                            {ventureA.healthScore}%
                        </div>
                    )}
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Health Score</div>
                </div>

                <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: 'var(--color-bg-tertiary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, color: 'var(--color-text-muted)',
                }}>
                    VS
                </div>

                <div className="card card-body" style={{
                    textAlign: 'center', padding: 'var(--space-4)',
                    borderTop: `3px solid ${ventureB?.color || '#666'}`,
                }}>
                    <select className="form-select" style={{ textAlign: 'center', fontWeight: 600, fontSize: 'var(--font-size-md)' }}
                        value={selectedB} onChange={e => setSelectedB(e.target.value)}>
                        {state.ventures.map(v => <option key={v.id} value={v.id}>{v.prefix} — {v.name}</option>)}
                    </select>
                    {ventureB && (
                        <div style={{
                            fontSize: '2.5rem', fontWeight: 800, marginTop: 'var(--space-3)',
                            background: `linear-gradient(135deg, ${ventureB.color}, ${ventureB.color}88)`,
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>
                            {ventureB.healthScore}%
                        </div>
                    )}
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Health Score</div>
                </div>
            </div>

            {/* Metrics comparison */}
            <div className="card card-body" style={{ padding: 0 }}>
                <div style={{
                    display: 'grid', gridTemplateColumns: '100px 1fr 150px 1fr 100px',
                    padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--border-color)',
                    fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-muted)',
                }}>
                    <span style={{ textAlign: 'right' }}>{ventureA?.prefix || 'A'}</span>
                    <span></span>
                    <span style={{ textAlign: 'center' }}>Metric</span>
                    <span></span>
                    <span>{ventureB?.prefix || 'B'}</span>
                </div>

                {metrics.map((m, i) => {
                    const winner = getWinner(m.a, m.b, m.higherBetter);
                    const maxVal = Math.max(m.a, m.b, 1);
                    return (
                        <motion.div key={m.label}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.04 }}
                            style={{
                                display: 'grid', gridTemplateColumns: '100px 1fr 150px 1fr 100px',
                                alignItems: 'center', padding: 'var(--space-3) var(--space-4)',
                                borderBottom: '1px solid var(--border-color)',
                            }}
                        >
                            {/* Value A */}
                            <span style={{
                                textAlign: 'right', fontWeight: 600,
                                color: winner === 'a' ? 'var(--color-success)' : 'var(--color-text-secondary)',
                                fontSize: 'var(--font-size-sm)',
                            }}>
                                {m.format(m.a)}
                            </span>

                            {/* Bar A (right-aligned) */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 8px' }}>
                                <div style={{
                                    width: `${(m.a / maxVal) * 100}%`,
                                    height: 8, borderRadius: 4,
                                    background: winner === 'a'
                                        ? `linear-gradient(90deg, transparent, ${ventureA?.color || '#6366F1'})`
                                        : `linear-gradient(90deg, transparent, var(--color-bg-tertiary))`,
                                    minWidth: m.a > 0 ? 4 : 0,
                                }} />
                            </div>

                            {/* Label */}
                            <span style={{
                                textAlign: 'center', fontSize: 'var(--font-size-xs)',
                                color: 'var(--color-text-muted)', fontWeight: 500,
                            }}>
                                {m.label}
                            </span>

                            {/* Bar B (left-aligned) */}
                            <div style={{ display: 'flex', justifyContent: 'flex-start', padding: '0 8px' }}>
                                <div style={{
                                    width: `${(m.b / maxVal) * 100}%`,
                                    height: 8, borderRadius: 4,
                                    background: winner === 'b'
                                        ? `linear-gradient(270deg, transparent, ${ventureB?.color || '#6366F1'})`
                                        : `linear-gradient(270deg, transparent, var(--color-bg-tertiary))`,
                                    minWidth: m.b > 0 ? 4 : 0,
                                }} />
                            </div>

                            {/* Value B */}
                            <span style={{
                                fontWeight: 600,
                                color: winner === 'b' ? 'var(--color-success)' : 'var(--color-text-secondary)',
                                fontSize: 'var(--font-size-sm)',
                            }}>
                                {m.format(m.b)}
                            </span>
                        </motion.div>
                    );
                })}
            </div>

            {/* Summary */}
            {ventureA && ventureB && (
                <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr',
                    gap: 'var(--space-4)', marginTop: 'var(--space-6)',
                }}>
                    {[ventureA, ventureB].map(v => (
                        <div key={v.id} className="card card-body" style={{ borderTop: `3px solid ${v.color}` }}>
                            <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
                                {v.name}
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)' }}>
                                <div>
                                    <span style={{ color: 'var(--color-text-muted)' }}>Tier: </span>
                                    <span style={{ fontWeight: 600 }}>{v.tier}</span>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--color-text-muted)' }}>Geo: </span>
                                    <span style={{ fontWeight: 600 }}>{v.geo}</span>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--color-text-muted)' }}>Stage: </span>
                                    <span style={{ fontWeight: 600 }}>{v.stage}</span>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--color-text-muted)' }}>Status: </span>
                                    <span style={{ fontWeight: 600 }}>{v.status}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
