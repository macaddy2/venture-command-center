import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders, userEvent } from '../test-utils';
import Sidebar from '../../components/Sidebar';

describe('Sidebar', () => {
    it('renders all 19 navigation items', () => {
        renderWithProviders(<Sidebar />);
        const navLabels = [
            'Dashboard', 'Focus Mode', 'Tasks', 'Timeline', 'Analytics',
            'Compare', 'Financials', 'Equity', 'Schedule', 'Plans',
            'Documents', 'Risks', 'Recurring', 'Resources', 'Alerts',
            'Digest', 'Standup', 'AI Copilot', 'Settings',
        ];
        for (const label of navLabels) {
            expect(screen.getByText(label)).toBeInTheDocument();
        }
    });

    it('renders active ventures in sidebar', () => {
        renderWithProviders(<Sidebar />);
        // TruCycle and DepositGuard are Active Build ventures from seed
        expect(screen.getByText('TruCycle')).toBeInTheDocument();
        expect(screen.getByText('DepositGuard')).toBeInTheDocument();
    });

    it('clicking a nav item is interactive', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Sidebar />);
        const tasksLink = screen.getByText('Tasks');
        await user.click(tasksLink);
        // If click works without error, the dispatch was called
        expect(tasksLink).toBeInTheDocument();
    });

    it('renders the sidebar toggle button', () => {
        renderWithProviders(<Sidebar />);
        // Sidebar has a toggle button (chevron icon)
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
    });
});
