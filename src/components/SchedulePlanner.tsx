import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, X, Trash2 } from 'lucide-react';
import { useStore } from '../lib/store';
import type { TimeSlot, ScheduleBlock } from '../lib/types';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SLOTS: TimeSlot[] = ['AM', 'PM', 'Eve'];
const SLOT_LABELS: Record<TimeSlot, string> = { AM: 'Morning', PM: 'Afternoon', Eve: 'Evening' };

function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay(); // 0=Sun
    const diff = day === 0 ? -6 : 1 - day; // Monday-based
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

function addDays(date: Date, n: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
}

function toYMD(date: Date): string {
    return date.toISOString().split('T')[0];
}

function formatWeekLabel(start: Date): string {
    const end = addDays(start, 6);
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    return `${start.toLocaleDateString('en-GB', opts)} – ${end.toLocaleDateString('en-GB', { ...opts, year: 'numeric' })}`;
}

function isWeekend(dayIndex: number): boolean {
    return dayIndex >= 5; // Sat, Sun
}

export default function SchedulePlanner() {
    const { state, dispatch, addScheduleBlock } = useStore();
    const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart(new Date()));
    const [activeCell, setActiveCell] = useState<{ date: string; slot: TimeSlot } | null>(null);
    const [newTitle, setNewTitle] = useState('');
    const [newVentureId, setNewVentureId] = useState('');

    const weekDates = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

    const blocksByCell = useMemo(() => {
        const map: Record<string, ScheduleBlock[]> = {};
        state.scheduleBlocks.forEach(b => {
            const key = `${b.date}-${b.time_slot}`;
            if (!map[key]) map[key] = [];
            map[key].push(b);
        });
        return map;
    }, [state.scheduleBlocks]);

    // Hours per venture this week
    const weekSummary = useMemo(() => {
        const weekDates7 = Array.from({ length: 7 }, (_, i) => toYMD(addDays(weekStart, i)));
        const counts: Record<string, number> = {};
        state.scheduleBlocks.forEach(b => {
            if (weekDates7.includes(b.date) && b.venture_id) {
                counts[b.venture_id] = (counts[b.venture_id] ?? 0) + 1;
            }
        });
        return Object.entries(counts)
            .map(([vid, count]) => ({ venture: state.ventures.find(v => v.id === vid), count }))
            .filter(x => x.venture)
            .sort((a, b) => b.count - a.count);
    }, [state.scheduleBlocks, state.ventures, weekStart]);

    const ventures = state.ventures.filter(v => v.tier !== 'Parked');

    const getVenture = (id: string | null) => id ? state.ventures.find(v => v.id === id) : null;

    const handleCellClick = (date: string, slot: TimeSlot) => {
        setActiveCell({ date, slot });
        setNewTitle('');
        setNewVentureId(ventures[0]?.id ?? '');
    };

    const handleAddBlock = () => {
        if (!activeCell || !newTitle.trim()) return;
        addScheduleBlock({
            date: activeCell.date,
            time_slot: activeCell.slot,
            venture_id: newVentureId || null,
            title: newTitle.trim(),
        });
        setActiveCell(null);
    };

    const handleDeleteBlock = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch({ type: 'DELETE_SCHEDULE_BLOCK', payload: id });
    };

    const today = toYMD(new Date());

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ padding: 'var(--space-6)' }}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
                <div>
                    <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, margin: 0 }}>Schedule Planner</h1>
                    <p style={{ color: 'var(--color-text-secondary)', marginTop: 4, fontSize: 'var(--font-size-sm)' }}>
                        Weekly time blocks across ventures
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <button className="btn" onClick={() => setWeekStart(getWeekStart(new Date()))} style={{ fontSize: 'var(--font-size-sm)' }}>
                        Today
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button className="btn" onClick={() => setWeekStart(w => addDays(w, -7))} style={{ padding: '6px 10px' }}>
                            <ChevronLeft size={16} />
                        </button>
                        <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, minWidth: 200, textAlign: 'center' }}>
                            {formatWeekLabel(weekStart)}
                        </span>
                        <button className="btn" onClick={() => setWeekStart(w => addDays(w, 7))} style={{ padding: '6px 10px' }}>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 'var(--space-5)' }}>
                {/* Weekly Grid */}
                <div className="stat-card" style={{ padding: 0, overflow: 'hidden' }}>
                    {/* Day headers */}
                    <div style={{ display: 'grid', gridTemplateColumns: '64px repeat(7, 1fr)', borderBottom: '1px solid var(--color-border)' }}>
                        <div style={{ padding: '10px 12px', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }} />
                        {weekDates.map((date, i) => {
                            const ymd = toYMD(date);
                            const isToday = ymd === today;
                            return (
                                <div key={i} style={{
                                    padding: '10px 8px',
                                    textAlign: 'center',
                                    borderLeft: '1px solid var(--color-border)',
                                    background: isWeekend(i) ? 'var(--color-bg-secondary)' : 'transparent',
                                }}>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {DAYS[i]}
                                    </div>
                                    <div style={{
                                        fontSize: 'var(--font-size-sm)', fontWeight: 700, marginTop: 2,
                                        color: isToday ? 'var(--color-accent-primary)' : 'var(--color-text-primary)',
                                        ...(isToday ? {
                                            background: 'var(--color-accent-primary)',
                                            color: '#fff',
                                            borderRadius: '50%',
                                            width: 26, height: 26,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            margin: '2px auto 0',
                                        } : {}),
                                    }}>
                                        {date.getDate()}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Slot rows */}
                    {SLOTS.map((slot, si) => (
                        <div key={slot} style={{
                            display: 'grid',
                            gridTemplateColumns: '64px repeat(7, 1fr)',
                            borderTop: si > 0 ? '1px solid var(--color-border)' : undefined,
                            minHeight: 88,
                        }}>
                            {/* Slot label */}
                            <div style={{
                                padding: '10px 8px',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                borderRight: '1px solid var(--color-border)',
                                background: 'var(--color-bg-secondary)',
                            }}>
                                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{slot}</span>
                                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: 2 }}>{SLOT_LABELS[slot]}</span>
                            </div>

                            {/* Day cells */}
                            {weekDates.map((date, di) => {
                                const ymd = toYMD(date);
                                const cellKey = `${ymd}-${slot}`;
                                const blocks = blocksByCell[cellKey] ?? [];
                                const weekend = isWeekend(di);

                                return (
                                    <div
                                        key={di}
                                        onClick={() => handleCellClick(ymd, slot)}
                                        style={{
                                            borderLeft: '1px solid var(--color-border)',
                                            padding: 6,
                                            cursor: 'pointer',
                                            background: weekend ? 'var(--color-bg-secondary)' : 'transparent',
                                            transition: 'background var(--transition-fast)',
                                            position: 'relative',
                                            minHeight: 88,
                                        }}
                                        onMouseEnter={e => { if (!weekend) (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-tertiary)'; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = weekend ? 'var(--color-bg-secondary)' : 'transparent'; }}
                                    >
                                        {blocks.map(block => {
                                            const v = getVenture(block.venture_id);
                                            return (
                                                <div key={block.id} style={{
                                                    background: v ? v.lightColor : 'var(--color-bg-tertiary)',
                                                    border: `1px solid ${v ? v.color : 'var(--color-border)'}`,
                                                    borderRadius: 'var(--border-radius-sm)',
                                                    padding: '4px 6px',
                                                    marginBottom: 4,
                                                    fontSize: '11px',
                                                    lineHeight: 1.3,
                                                }}>
                                                    {v && (
                                                        <div style={{ fontSize: '10px', fontWeight: 700, color: v.color, marginBottom: 2 }}>{v.prefix}</div>
                                                    )}
                                                    <div style={{ color: 'var(--color-text-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 4 }}>
                                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{block.title}</span>
                                                        <button
                                                            onClick={e => handleDeleteBlock(block.id, e)}
                                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--color-text-muted)', flexShrink: 0, lineHeight: 1 }}
                                                        >
                                                            <X size={10} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {blocks.length === 0 && (
                                            <div style={{
                                                position: 'absolute', inset: 0,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                opacity: 0.2,
                                            }}>
                                                <Plus size={14} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Week Summary Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div className="stat-card" style={{ padding: 'var(--space-4)' }}>
                        <h3 style={{ margin: '0 0 var(--space-3)', fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                            This Week
                        </h3>
                        {weekSummary.length === 0 ? (
                            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)', margin: 0 }}>No blocks scheduled this week</p>
                        ) : (
                            weekSummary.map(({ venture: v, count }) => v && (
                                <div key={v.id} style={{ marginBottom: 'var(--space-3)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                        <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: v.color, display: 'inline-block' }} />
                                            {v.name}
                                        </span>
                                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{count} {count === 1 ? 'block' : 'blocks'}</span>
                                    </div>
                                    <div style={{ height: 6, background: 'var(--color-bg-tertiary)', borderRadius: 'var(--border-radius-full)', overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${Math.min(100, (count / Math.max(...weekSummary.map(x => x.count))) * 100)}%`,
                                            background: v.color,
                                            borderRadius: 'var(--border-radius-full)',
                                            transition: 'width var(--transition-base)',
                                        }} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="stat-card" style={{ padding: 'var(--space-4)' }}>
                        <h3 style={{ margin: '0 0 var(--space-3)', fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                            Legend
                        </h3>
                        {ventures.slice(0, 6).map(v => (
                            <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                <span style={{ width: 10, height: 10, borderRadius: 2, background: v.color, flexShrink: 0 }} />
                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{v.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Add Block Popover */}
            <AnimatePresence>
                {activeCell && (
                    <div style={{
                        position: 'fixed', inset: 0, zIndex: 1000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.5)',
                    }} onClick={() => setActiveCell(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={e => e.stopPropagation()}
                            style={{
                                background: 'var(--color-bg-card)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--border-radius-lg)',
                                padding: 'var(--space-5)',
                                width: 360,
                                boxShadow: 'var(--shadow-xl)',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                                <h3 style={{ margin: 0, fontSize: 'var(--font-size-base)', fontWeight: 600 }}>
                                    Add Block — {SLOT_LABELS[activeCell.slot]}
                                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginLeft: 6, fontWeight: 400 }}>
                                        {new Date(activeCell.date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                                    </span>
                                </h3>
                                <button onClick={() => setActiveCell(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                                    <X size={16} />
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                <div>
                                    <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Venture</label>
                                    <select className="form-select" value={newVentureId} onChange={e => setNewVentureId(e.target.value)}>
                                        <option value="">No venture (personal)</option>
                                        {ventures.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>What are you working on? *</label>
                                    <input
                                        className="form-input"
                                        value={newTitle}
                                        onChange={e => setNewTitle(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddBlock()}
                                        placeholder="e.g. Backend sprint, UI review..."
                                        autoFocus
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                                    <button className="btn" onClick={() => setActiveCell(null)}>Cancel</button>
                                    <button className="btn btn-primary" onClick={handleAddBlock}>Add Block</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// Suppress unused import warning
const _Trash2 = Trash2;
void _Trash2;
