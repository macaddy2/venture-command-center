// ============================================================
// Standup Report Generator — Structured daily/weekly standup
// ============================================================

import { useState, useMemo } from 'react';
import { useStore } from '../lib/store';
import { motion } from 'framer-motion';
import {
    FileText, Copy, Download, Calendar, Check,
    RotateCcw, Filter
} from 'lucide-react';

type ReportPeriod = 'daily' | 'weekly';

export default function StandupGenerator() {
    const { state, venturesWithStats } = useStore();
    const [period, setPeriod] = useState<ReportPeriod>('weekly');
    const [selectedVentures, setSelectedVentures] = useState<string[]>(
        state.ventures.filter(v => v.tier === 'Active Build' || v.tier === 'Incubating').map(v => v.id)
    );
    const [copied, setCopied] = useState(false);

    const now = new Date();
    const cutoffDays = period === 'daily' ? 1 : 7;
    const cutoff = new Date(now.getTime() - cutoffDays * 24 * 60 * 60 * 1000);

    const report = useMemo(() => {
        const lines: string[] = [];
        const dateStr = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        const periodLabel = period === 'daily' ? 'Daily Standup' : 'Weekly Standup';

        lines.push(`# ${periodLabel} Report`);
        lines.push(`📅 ${dateStr}`);
        lines.push('');

        // --- Portfolio summary ---
        const totalTasks = state.tasks.length;
        const doneTasks = state.tasks.filter(t => t.status === 'done').length;
        const blockedTasks = state.tasks.filter(t => t.status === 'blocked').length;
        const inProgressTasks = state.tasks.filter(t => t.status === 'in-progress').length;

        lines.push('## 📊 Portfolio Snapshot');
        lines.push(`- Active ventures: ${state.ventures.filter(v => v.tier === 'Active Build').length}`);
        lines.push(`- Tasks: ${doneTasks}/${totalTasks} done (${inProgressTasks} in progress, ${blockedTasks} blocked)`);
        lines.push(`- Average health: ${Math.round(venturesWithStats.reduce((sum, v) => sum + v.healthScore, 0) / (venturesWithStats.length || 1))}/100`);
        lines.push('');

        // --- Per-venture sections ---
        const filteredVentures = venturesWithStats.filter(v => selectedVentures.includes(v.id));
        filteredVentures.forEach(v => {
            const ventureTasks = state.tasks.filter(t => t.venture_id === v.id);
            const recentlyDone = ventureTasks.filter(t =>
                t.status === 'done' && new Date(t.updated_at) >= cutoff
            );
            const inProgress = ventureTasks.filter(t => t.status === 'in-progress');
            const blocked = ventureTasks.filter(t => t.status === 'blocked');
            const upcoming = ventureTasks.filter(t =>
                (t.status === 'todo' || t.status === 'backlog') && t.priority === 'P0'
            );

            const healthEmoji = v.healthScore >= 60 ? '🟢' : v.healthScore >= 35 ? '🟡' : '🔴';

            lines.push(`## ${v.prefix} — ${v.name} ${healthEmoji} ${v.healthScore}/100`);
            lines.push('');

            // What was done
            if (recentlyDone.length > 0) {
                lines.push(`### ✅ Completed (${period === 'daily' ? 'today' : 'this week'})`);
                recentlyDone.forEach(t => lines.push(`- ${t.title}`));
                lines.push('');
            }

            // What's in progress
            if (inProgress.length > 0) {
                lines.push('### 🔄 In Progress');
                inProgress.forEach(t => {
                    const priLabel = t.priority === 'P0' ? '🔴' : t.priority === 'P1' ? '🟠' : '🟡';
                    lines.push(`- ${priLabel} ${t.title}`);
                });
                lines.push('');
            }

            // Blockers
            if (blocked.length > 0) {
                lines.push('### 🚫 Blockers');
                blocked.forEach(t => lines.push(`- ⛔ ${t.title}`));
                lines.push('');
            }

            // What's next
            if (upcoming.length > 0) {
                lines.push('### 📋 Up Next (P0)');
                upcoming.slice(0, 3).forEach(t => lines.push(`- ${t.title}`));
                lines.push('');
            }

            // Milestones
            const mstones = state.milestones.filter(m => m.venture_id === v.id);
            if (mstones.length > 0) {
                lines.push('### 🎯 Milestones');
                mstones.forEach(m => {
                    const daysUntil = Math.ceil((new Date(m.target_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    const statusEmoji = daysUntil < 0 ? '⚠️ OVERDUE' : daysUntil <= 14 ? `⏰ ${daysUntil}d left` : `${daysUntil}d left`;
                    lines.push(`- ${m.name} — ${m.progress}% — ${statusEmoji}`);
                });
                lines.push('');
            }

            lines.push('---');
            lines.push('');
        });

        // --- Risks ---
        const activeRisks = state.risks.filter(r => r.status === 'active' && r.likelihood >= 3 && r.impact >= 4);
        if (activeRisks.length > 0) {
            lines.push('## ⚠️ High-Priority Risks');
            activeRisks.forEach(r => {
                const v = state.ventures.find(v => v.id === r.venture_id);
                lines.push(`- **${v?.prefix}**: ${r.title} (L${r.likelihood}×I${r.impact})`);
            });
            lines.push('');
        }

        // --- Hiring ---
        const hiringRoles = state.teamRoles.filter(r => r.status === 'hiring');
        if (hiringRoles.length > 0) {
            lines.push('## 👥 Open Hiring');
            hiringRoles.forEach(r => {
                const v = state.ventures.find(v => v.id === r.venture_id);
                lines.push(`- ${v?.prefix}: ${r.role_name}`);
            });
            lines.push('');
        }

        lines.push('---');
        lines.push(`_Generated by Venture Command Center on ${now.toISOString().slice(0, 16)}_`);

        return lines.join('\n');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `now` recalculates each render; data deps are sufficient
    }, [state, venturesWithStats, selectedVentures, period, cutoff]);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(report);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([report], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `standup-${period}-${now.toISOString().slice(0, 10)}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const toggleVenture = (id: string) => {
        setSelectedVentures(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    return (
        <div>
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 'var(--space-5)',
            }}>
                <div>
                    <h2 style={{
                        fontSize: 'var(--font-size-xl)', fontWeight: 700,
                        color: 'var(--color-text-primary)', marginBottom: 4,
                    }}>
                        <FileText size={20} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
                        Standup Report
                    </h2>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                        Auto-generated structured standup for sharing
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button className="btn btn-primary btn-sm" onClick={handleCopy}>
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={handleDownload}>
                        <Download size={14} /> Download .md
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div style={{
                display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)',
                marginBottom: 'var(--space-5)', alignItems: 'center',
            }}>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button
                        className={`btn btn-sm ${period === 'daily' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setPeriod('daily')}
                    >
                        <Calendar size={12} /> Daily
                    </button>
                    <button
                        className={`btn btn-sm ${period === 'weekly' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setPeriod('weekly')}
                    >
                        <RotateCcw size={12} /> Weekly
                    </button>
                </div>

                <div style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                    marginLeft: 'var(--space-4)',
                }}>
                    <Filter size={12} color="var(--color-text-muted)" />
                    {state.ventures.filter(v => v.tier !== 'Parked').map(v => (
                        <button
                            key={v.id}
                            className={`btn btn-sm ${selectedVentures.includes(v.id) ? '' : 'btn-secondary'}`}
                            onClick={() => toggleVenture(v.id)}
                            style={{
                                padding: '2px 10px',
                                fontSize: 'var(--font-size-xs)',
                                fontWeight: 600,
                                background: selectedVentures.includes(v.id) ? `${v.color}20` : undefined,
                                color: selectedVentures.includes(v.id) ? v.color : 'var(--color-text-muted)',
                                border: selectedVentures.includes(v.id) ? `1px solid ${v.color}40` : undefined,
                            }}
                        >
                            {v.prefix}
                        </button>
                    ))}
                </div>
            </div>

            {/* Preview */}
            <motion.div
                className="card"
                style={{
                    padding: 'var(--space-5)',
                    fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
                    fontSize: 'var(--font-size-sm)',
                    lineHeight: 1.7,
                    whiteSpace: 'pre-wrap',
                    color: 'var(--color-text-secondary)',
                    maxHeight: 'calc(100vh - 300px)',
                    overflowY: 'auto',
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                dangerouslySetInnerHTML={{
                    __html: report
                        .replace(/^# (.+)$/gm, '<span style="font-size:1.3em;font-weight:700;color:var(--color-text-primary)">$1</span>')
                        .replace(/^## (.+)$/gm, '<span style="font-size:1.1em;font-weight:600;color:var(--color-text-primary)">$1</span>')
                        .replace(/^### (.+)$/gm, '<span style="font-weight:600;color:var(--color-text-primary)">$1</span>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--color-text-primary)">$1</strong>')
                        .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid var(--border-color);margin:8px 0"/>')
                        .replace(/^_(.+)_$/gm, '<em style="opacity:0.5">$1</em>')
                        .replace(/\n/g, '<br/>')
                }}
            />
        </div>
    );
}
