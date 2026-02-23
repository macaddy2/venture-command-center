// ============================================================
// App.tsx — Main Application Shell
// ============================================================

import { DataProvider, useStore } from './lib/store';
import { useAuth } from './lib/useAuth';
import AuthPage from './components/AuthPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import KanbanBoard from './components/KanbanBoard';
import Analytics from './components/Analytics';
import AICopilot from './components/AICopilot';
import SettingsView from './components/SettingsView';
import TimelineView from './components/TimelineView';
import FocusMode from './components/FocusMode';
import FinancialTracker from './components/FinancialTracker';
import DocumentVault from './components/DocumentVault';
import RiskMatrix from './components/RiskMatrix';
import VentureComparisons from './components/VentureComparisons';
import WeeklyDigest from './components/WeeklyDigest';
import RecurringTasks from './components/RecurringTasks';
import ResourceSharingView from './components/ResourceSharing';
import PredictiveAlerts from './components/PredictiveAlerts';
import StandupGenerator from './components/StandupGenerator';
import { Loader } from 'lucide-react';

function AppContent() {
    const { state } = useStore();

    const renderView = () => {
        switch (state.activeView) {
            case 'dashboard': return <Dashboard />;
            case 'tasks': return <KanbanBoard />;
            case 'analytics': return <Analytics />;
            case 'ai': return <AICopilot />;
            case 'settings': return <SettingsView />;
            case 'timeline': return <TimelineView />;
            case 'focus': return <FocusMode />;
            case 'financials': return <FinancialTracker />;
            case 'documents': return <DocumentVault />;
            case 'risks': return <RiskMatrix />;
            case 'comparisons': return <VentureComparisons />;
            case 'digest': return <WeeklyDigest />;
            case 'recurring': return <RecurringTasks />;
            case 'resources': return <ResourceSharingView />;
            case 'alerts': return <PredictiveAlerts />;
            case 'standup': return <StandupGenerator />;
            default: return <Dashboard />;
        }
    };

    return (
        <div className="app-shell">
            <Sidebar />
            <div className="app-main">
                <Header />
                <main className="app-content">
                    {renderView()}
                </main>
            </div>
        </div>
    );
}

function App() {
    const { user, isLoading } = useAuth();

    // Show loader while checking auth state
    if (isLoading) {
        return (
            <div className="auth-loading">
                <Loader size={32} className="auth-spinner" />
                <p>Loading...</p>
            </div>
        );
    }

    // Not authenticated → show login page
    if (!user) {
        return <AuthPage />;
    }

    // Authenticated → show app
    return (
        <DataProvider>
            <AppContent />
        </DataProvider>
    );
}

export default App;
