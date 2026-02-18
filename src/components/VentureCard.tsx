// ============================================================
// VentureCard Component — Enhanced Grid Card
// ============================================================

import type { VentureWithStats } from '../lib/types';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, Users, GitBranch } from 'lucide-react';

interface Props {
    venture: VentureWithStats;
    selected: boolean;
    onClick: () => void;
    index: number;
}

export default function VentureCard({ venture, selected, onClick, index }: Props) {
    const v = venture;
    const progress = v.tasks.total > 0 ? Math.round((v.tasks.done / v.tasks.total) * 100) : 0;

    // Health color
    const healthColor = v.healthScore >= 60 ? '#10B981'
        : v.healthScore >= 35 ? '#F59E0B'
            : '#EF4444';

    const tierStyle = v.tier === 'Active Build'
        ? { background: 'var(--tier-active-bg)', color: 'var(--tier-active)' }
        : v.tier === 'Incubating'
            ? { background: 'var(--tier-incubating-bg)', color: 'var(--tier-incubating)' }
            : { background: 'var(--tier-parked-bg)', color: 'var(--tier-parked)' };

    return (
        <motion.div
            className={`venture-card${selected ? ' selected' : ''}`}
            style={{ '--venture-color': v.color } as React.CSSProperties}
            onClick={onClick}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.04 }}
            whileHover={{ scale: 1.01 }}
        >
            {/* Header row */}
            <div className="venture-card-header">
                <div className="venture-card-title-group">
                    <span className="venture-prefix" style={{ background: v.color }}>{v.prefix}</span>
                    <span className="venture-name">{v.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="venture-tier-badge" style={tierStyle}>{v.tier}</span>
                    {/* Health Gauge */}
                    <div className="health-gauge" style={{
                        background: `conic-gradient(${healthColor} ${v.healthScore * 3.6}deg, rgba(255,255,255,0.06) 0deg)`,
                        color: healthColor,
                    }}>
                        <span>{v.healthScore}</span>
                    </div>
                </div>
            </div>

            {/* Meta */}
            <div className="venture-meta">
                <span>{v.geo === 'UK' ? '🇬🇧' : '🇳🇬'} {v.geo}</span>
                <span style={{ color: 'var(--border-color)' }}>·</span>
                <span>{v.stage}</span>
            </div>

            {/* Progress */}
            <div className="progress-bar">
                <div className="progress-bar-fill" style={{
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${v.color}, ${v.color}CC)`,
                }} />
            </div>

            {/* Task counts */}
            <div className="task-counts">
                <div className="task-count-item">
                    <span className="task-count-dot" style={{ background: '#10B981' }} />
                    <span>{v.tasks.done}</span>
                </div>
                <div className="task-count-item">
                    <span className="task-count-dot" style={{ background: '#3B82F6' }} />
                    <span>{v.tasks.inProgress} active</span>
                </div>
                {v.tasks.blocked > 0 && (
                    <div className="task-count-item" style={{ color: 'var(--color-danger)' }}>
                        <AlertTriangle size={11} />
                        <span style={{ fontWeight: 600 }}>{v.tasks.blocked} blocked</span>
                    </div>
                )}
                <div className="task-count-item" style={{ marginLeft: 'auto' }}>
                    <span style={{ fontWeight: 500, color: 'var(--color-text-secondary)' }}>{progress}%</span>
                </div>
            </div>

            {/* Bottom row: team + github */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 'var(--space-3)',
                paddingTop: 'var(--space-3)',
                borderTop: '1px solid var(--border-color)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    <Users size={11} />
                    <span>{v.team.filled}/{v.team.total}</span>
                </div>
                {v.github && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                        <GitBranch size={11} />
                        <span>{v.github.repos} repos</span>
                    </div>
                )}
                {v.milestones.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                        <TrendingUp size={11} />
                        <span>{v.milestones.length} milestones</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
