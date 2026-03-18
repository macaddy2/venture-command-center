import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, userEvent } from '../test-utils';
import SettingsView from '../../components/SettingsView';

describe('SettingsView', () => {
    it('renders the component', () => {
        const { container } = renderWithProviders(<SettingsView />);
        const matches = screen.getAllByText(/settings/i);
        expect(matches.length).toBeGreaterThan(0);
    });

    it('renders Add Venture button', () => {
        renderWithProviders(<SettingsView />);
        expect(screen.getByText(/add venture/i)).toBeInTheDocument();
    });

    it('opens add venture form when clicked', async () => {
        const user = userEvent.setup();
        renderWithProviders(<SettingsView />);
        await user.click(screen.getByText(/add venture/i));
        await waitFor(() => {
            expect(screen.getByPlaceholderText(/venture name|name/i)).toBeInTheDocument();
        });
    });

    it('renders GitHub integration section', () => {
        renderWithProviders(<SettingsView />);
        const matches = screen.getAllByText(/github/i);
        expect(matches.length).toBeGreaterThan(0);
    });

    it('renders Slack integration section', () => {
        renderWithProviders(<SettingsView />);
        const matches = screen.getAllByText(/slack/i);
        expect(matches.length).toBeGreaterThan(0);
    });

    it('renders Reset Data button', () => {
        renderWithProviders(<SettingsView />);
        const matches = screen.getAllByText(/reset/i);
        expect(matches.length).toBeGreaterThan(0);
    });

    it('renders venture configuration', () => {
        const { container } = renderWithProviders(<SettingsView />);
        expect(container.textContent).toMatch(/TruCycle|DepositGuard/);
    });
});
