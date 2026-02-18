// ============================================================
// Analytics View — Charts and Health Scores
// ============================================================

import { useStore } from '../lib/store';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell,
    AreaChart, Area
} from 'recharts';
import { Activity, Target, Users, TrendingUp } from 'lucide-react';



export default function Analytics() {
    const { venturesWithStats, state } = useStore();

    // Task distribution by status
    const taskStatusData = [
        { name: 'Done', value: state.tasks.filter(t => t.status === 'done').length, color: '#10B981' },
        { name: 'In Progress', value: state.tasks.filter(t => t.status === 'in-progress').length, color: '#6366F1' },
        { name: 'Todo', value: state.tasks.filter(t => t.status === 'todo').length, color: '#3B82F6' },
        { name: 'Review', value: state.tasks.filter(t => t.status === 'review').length, color: '#8B5CF6' },
        { name: 'Blocked', value: state.tasks.filter(t => t.status === 'blocked').length, color: '#EF4444' },
        { name: 'Backlog', value: state.tasks.filter(t => t.status === 'backlog').length, color: '#64748B' },
    ];

    // Tasks per venture
    const tasksByVenture = venturesWithStats
        .filter(v => v.tasks.total > 0)
        .map(v => ({
            name: v.prefix,
            fullName: v.name,
            done: v.tasks.done,
            active: v.tasks.inProgress,
            blocked: v.tasks.blocked,
            remaining: v.tasks.backlog + v.tasks.todo + v.tasks.review,
            total: v.tasks.total,
            color: v.color,
        }))
        .sort((a, b) => b.total - a.total);

    // Health scores comparison
    const healthData = venturesWithStats
        .filter(v => v.tier !== 'Parked')
        .map(v => ({
            name: v.prefix,
            fullName: v.name,
            health: v.healthScore,
            color: v.color,
        }));

    // Radar chart for active ventures
    const _radarData = venturesWithStats
        .filter(v => v.tier !== 'Parked' && v.tasks.total > 0)
        .map(v => ({
            venture: v.prefix,
            'Task Progress': v.tasks.total > 0 ? Math.round((v.tasks.done / v.tasks.total) * 100) : 0,
            'Team Coverage': v.team.total > 0 ? Math.round((v.team.filled / v.team.total) * 100) : 0,
            'Registration': Math.round((v.regs.completedCount / 4) * 100),
            'Milestone Progress': v.milestones.length > 0
                ? Math.round(v.milestones.reduce((s, m) => s + m.progress, 0) / v.milestones.length)
                : 0,
        }));

    // Priority distribution
    const priorityData = [
        { name: 'P0 Critical', value: state.tasks.filter(t => t.priority === 'P0' && t.status !== 'done').length, color: '#EF4444' },
        { name: 'P1 High', value: state.tasks.filter(t => t.priority === 'P1' && t.status !== 'done').length, color: '#F59E0B' },
        { name: 'P2 Medium', value: state.tasks.filter(t => t.priority === 'P2' && t.status !== 'done').length, color: '#EAB308' },
        { name: 'P3 Low', value: state.tasks.filter(t => t.priority === 'P3' && t.status !== 'done').length, color: '#64748B' },
    ];

    // Simulated velocity data (would be real in production)
    const velocityData = [
        { week: 'W1', tasks: 3 },
        { week: 'W2', tasks: 5 },
        { week: 'W3', tasks: 4 },
        { week: 'W4', tasks: 7 },
        { week: 'W5', tasks: 6 },
        { week: 'W6', tasks: 8 },
        { week: 'W7', tasks: 5 },
        { week: 'W8', tasks: 9 },
    ];

    const tooltipStyle = {
        contentStyle: {
            background: '#1A2236',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            fontSize: 12,
            color: '#F1F5F9',
        },
    };

    return (
        <div>
            {/* Health Score Cards */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 'var(--space-4)', marginBottom: 'var(--space-6)',
            }}>
                {healthData.map((v, i) => (
                    <motion.div
                        key={v.name}
                        className="card card-body"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        style={{ padding: 'var(--space-4)', textAlign: 'center' }}
                    >
                        <div style={{
                            width: 64, height: 64, borderRadius: '50%', margin: '0 auto var(--space-3)',
                            background: `conic-gradient(${v.color} ${v.health * 3.6}deg, rgba(255,255,255,0.06) 0deg)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            position: 'relative',
                        }}>
                            <div style={{
                                width: 52, height: 52, borderRadius: '50%',
                                background: 'var(--color-bg-card)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 'var(--font-size-lg)', fontWeight: 700, color: v.color,
                            }}>
                                {v.health}
                            </div>
                        </div>
                        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{v.fullName}</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                            {v.health >= 60 ? 'Good' : v.health >= 35 ? 'Fair' : 'Needs Work'}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Grid */}
            <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: 'var(--space-5)', marginBottom: 'var(--space-5)',
            }}>
                {/* Tasks by Venture */}
                <div className="chart-container">
                    <div className="chart-title">
                        <Target size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                        Tasks by Venture
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={tasksByVenture}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
                            <Tooltip {...tooltipStyle} />
                            <Bar dataKey="done" stackId="a" fill="#10B981" name="Done" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="active" stackId="a" fill="#6366F1" name="Active" />
                            <Bar dataKey="blocked" stackId="a" fill="#EF4444" name="Blocked" />
                            <Bar dataKey="remaining" stackId="a" fill="#64748B" name="Remaining" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Task Status Distribution */}
                <div className="chart-container">
                    <div className="chart-title">
                        <Activity size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                        Task Status Distribution
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={taskStatusData}
                                cx="50%" cy="50%"
                                innerRadius={60} outerRadius={100}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                {taskStatusData.map((entry, i) => (
                                    <Cell key={i} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip {...tooltipStyle} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{
                        display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
                        gap: 'var(--space-3)', marginTop: 'var(--space-2)',
                    }}>
                        {taskStatusData.map(item => (
                            <div key={item.name} style={{
                                display: 'flex', alignItems: 'center', gap: 4,
                                fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)',
                            }}>
                                <span style={{ width: 8, height: 8, borderRadius: 2, background: item.color }} />
                                {item.name}: {item.value}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Velocity Trend */}
                <div className="chart-container">
                    <div className="chart-title">
                        <TrendingUp size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                        Task Completion Velocity
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={velocityData}>
                            <defs>
                                <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
                            <Tooltip {...tooltipStyle} />
                            <Area type="monotone" dataKey="tasks" stroke="#6366F1" fill="url(#velocityGradient)" strokeWidth={2} name="Tasks Completed" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Priority Distribution */}
                <div className="chart-container">
                    <div className="chart-title">
                        <Users size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                        Open Tasks by Priority
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={priorityData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                            <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#94A3B8' }} width={90} />
                            <Tooltip {...tooltipStyle} />
                            <Bar dataKey="value" name="Tasks" radius={[0, 4, 4, 0]}>
                                {priorityData.map((entry, i) => (
                                    <Cell key={i} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
