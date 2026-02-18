// ============================================================
// Header Component
// ============================================================

import { useStore } from '../lib/store';
import { Search, Bell, RefreshCw, Plus } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
    const { state, dispatch } = useStore();
    const unreadInsights = state.aiInsights.filter(i => !i.is_read).length;
    const [showNotif, setShowNotif] = useState(false);

    const viewTitles: Record<string, string> = {
        dashboard: 'Portfolio Dashboard',
        tasks: 'Task Engine',
        analytics: 'Analytics',
        ai: 'AI Copilot',
        settings: 'Settings',
    };

    return (
        <header className="app-header">
            {/* View Title */}
            <h1 style={{
                fontSize: 'var(--font-size-lg)',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.3px',
            }}>
                {viewTitles[state.activeView] || 'Dashboard'}
            </h1>

            {/* Search */}
            <div className="header-search">
                <Search size={15} className="header-search-icon" />
                <input
                    type="text"
                    className="header-search-input"
                    placeholder="Search ventures, tasks..."
                    value={state.filters.search}
                    onChange={(e) => dispatch({ type: 'SET_FILTERS', payload: { search: e.target.value } })}
                />
            </div>

            {/* Actions */}
            <div className="header-actions">
                <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                        // Will trigger add-task modal in tasks view
                        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'tasks' });
                    }}
                >
                    <Plus size={14} />
                    New Task
                </button>

                <button className="header-btn" title="Refresh data">
                    <RefreshCw size={16} />
                </button>

                <button
                    className="header-btn"
                    title="Notifications"
                    onClick={() => setShowNotif(!showNotif)}
                >
                    <Bell size={16} />
                    {unreadInsights > 0 && (
                        <span className="header-btn-badge">{unreadInsights}</span>
                    )}
                </button>

                <div className="header-avatar" title="Ade">A</div>
            </div>

            {/* Notification Dropdown */}
            {showNotif && (
                <div style={{
                    position: 'absolute',
                    top: 'var(--header-height)',
                    right: 'var(--space-6)',
                    width: 340,
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--border-radius-lg)',
                    boxShadow: 'var(--shadow-xl)',
                    zIndex: 50,
                    maxHeight: 400,
                    overflowY: 'auto',
                }}>
                    <div style={{
                        padding: 'var(--space-4)',
                        borderBottom: '1px solid var(--border-color)',
                        fontSize: 'var(--font-size-md)',
                        fontWeight: 600,
                    }}>
                        Notifications
                    </div>
                    {state.aiInsights.length === 0 ? (
                        <div style={{
                            padding: 'var(--space-6)',
                            textAlign: 'center',
                            color: 'var(--color-text-muted)',
                            fontSize: 'var(--font-size-sm)',
                        }}>
                            No notifications yet
                        </div>
                    ) : (
                        state.aiInsights.slice(0, 10).map(insight => (
                            <div
                                key={insight.id}
                                style={{
                                    padding: 'var(--space-3) var(--space-4)',
                                    borderBottom: '1px solid var(--border-color)',
                                    cursor: 'pointer',
                                    opacity: insight.is_read ? 0.6 : 1,
                                }}
                                onClick={() => dispatch({ type: 'MARK_INSIGHT_READ', payload: insight.id })}
                            >
                                <div style={{
                                    fontSize: 'var(--font-size-sm)',
                                    fontWeight: insight.is_read ? 400 : 600,
                                    color: 'var(--color-text-primary)',
                                    marginBottom: 2,
                                }}>
                                    {insight.title}
                                </div>
                                <div style={{
                                    fontSize: 'var(--font-size-xs)',
                                    color: 'var(--color-text-muted)',
                                }}>
                                    {insight.content.slice(0, 80)}...
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </header>
    );
}
