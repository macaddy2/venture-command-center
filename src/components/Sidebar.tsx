// ============================================================
// Sidebar Component
// ============================================================

import { useStore } from '../lib/store';
import type { ViewKey } from '../lib/types';
import {
    LayoutDashboard, ListTodo, BarChart3, Bot, Settings,
    ChevronLeft, ChevronRight, Zap, Calendar, Target,
    DollarSign, FileText, ShieldAlert, GitCompare,
    Mail, RefreshCw, Share2, AlertCircle, ClipboardList
} from 'lucide-react';

const navItems: { key: ViewKey; label: string; icon: typeof LayoutDashboard }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'focus', label: 'Focus Mode', icon: Target },
    { key: 'tasks', label: 'Tasks', icon: ListTodo },
    { key: 'timeline', label: 'Timeline', icon: Calendar },
    { key: 'analytics', label: 'Analytics', icon: BarChart3 },
    { key: 'comparisons', label: 'Compare', icon: GitCompare },
    { key: 'financials', label: 'Financials', icon: DollarSign },
    { key: 'documents', label: 'Documents', icon: FileText },
    { key: 'risks', label: 'Risks', icon: ShieldAlert },
    { key: 'recurring', label: 'Recurring', icon: RefreshCw },
    { key: 'resources', label: 'Resources', icon: Share2 },
    { key: 'alerts', label: 'Alerts', icon: AlertCircle },
    { key: 'digest', label: 'Digest', icon: Mail },
    { key: 'standup', label: 'Standup', icon: ClipboardList },
    { key: 'ai', label: 'AI Copilot', icon: Bot },
    { key: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
    const { state, dispatch, venturesWithStats } = useStore();
    const { activeView, sidebarCollapsed, selectedVentureId } = state;
    const blockedCount = state.tasks.filter(t => t.status === 'blocked').length;

    return (
        <aside className={`app-sidebar${sidebarCollapsed ? ' collapsed' : ''}`}>
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">
                    <Zap size={18} color="#fff" />
                </div>
                <div>
                    <div className="sidebar-logo-text">Command Center</div>
                    <div className="sidebar-logo-sub">Venture Portfolio</div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                <div className="sidebar-section-label">Navigation</div>
                {navItems.map(item => (
                    <div
                        key={item.key}
                        className={`sidebar-link${activeView === item.key ? ' active' : ''}`}
                        onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', payload: item.key })}
                    >
                        <span className="sidebar-link-icon">
                            <item.icon size={18} />
                        </span>
                        <span>{item.label}</span>
                        {item.key === 'tasks' && blockedCount > 0 && (
                            <span className="sidebar-link-badge">{blockedCount}</span>
                        )}
                    </div>
                ))}

                {!sidebarCollapsed && (
                    <>
                        <div className="sidebar-section-label" style={{ marginTop: 8 }}>Ventures</div>
                        {venturesWithStats
                            .filter(v => v.tier !== 'Parked')
                            .map(v => (
                                <div
                                    key={v.id}
                                    className={`sidebar-venture-item${selectedVentureId === v.id ? ' active' : ''}`}
                                    onClick={() => {
                                        dispatch({ type: 'SELECT_VENTURE', payload: v.id });
                                        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'dashboard' });
                                    }}
                                >
                                    <span className="sidebar-venture-dot" style={{ background: v.color }} />
                                    <span>{v.name}</span>
                                </div>
                            ))}
                        {venturesWithStats.filter(v => v.tier === 'Parked').length > 0 && (
                            <>
                                <div className="sidebar-section-label" style={{ marginTop: 4 }}>Parked</div>
                                {venturesWithStats
                                    .filter(v => v.tier === 'Parked')
                                    .map(v => (
                                        <div
                                            key={v.id}
                                            className={`sidebar-venture-item${selectedVentureId === v.id ? ' active' : ''}`}
                                            onClick={() => {
                                                dispatch({ type: 'SELECT_VENTURE', payload: v.id });
                                                dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'dashboard' });
                                            }}
                                        >
                                            <span className="sidebar-venture-dot" style={{ background: v.color }} />
                                            <span>{v.name}</span>
                                        </div>
                                    ))}
                            </>
                        )}
                    </>
                )}
            </nav>

            {/* Toggle */}
            <div className="sidebar-toggle">
                <button onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}>
                    {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    {!sidebarCollapsed && <span>Collapse</span>}
                </button>
            </div>
        </aside>
    );
}
