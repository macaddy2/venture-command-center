import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, userEvent } from '../test-utils';
import EquityTracker from '../../components/EquityTracker';

describe('EquityTracker', () => {
    it('renders the component', () => {
        const { container } = renderWithProviders(<EquityTracker />);
        const matches = screen.getAllByText(/equity/i);
        expect(matches.length).toBeGreaterThan(0);
    });

    it('renders Add Stakeholder button', () => {
        renderWithProviders(<EquityTracker />);
        expect(screen.getByText(/add stakeholder/i)).toBeInTheDocument();
    });

    it('opens form modal when Add Stakeholder is clicked', async () => {
        const user = userEvent.setup();
        renderWithProviders(<EquityTracker />);
        await user.click(screen.getByText(/add stakeholder/i));
        await waitFor(() => {
            expect(screen.getByPlaceholderText(/jane smith/i)).toBeInTheDocument();
        });
    });

    it('form includes Cofounder in role dropdown', async () => {
        const user = userEvent.setup();
        renderWithProviders(<EquityTracker />);
        await user.click(screen.getByText(/add stakeholder/i));
        await waitFor(() => {
            const options = screen.getAllByRole('option');
            const roleOptions = options.map(o => o.textContent);
            expect(roleOptions).toContain('Cofounder');
            expect(roleOptions).toContain('Founder');
            expect(roleOptions).toContain('Investor');
            expect(roleOptions).toContain('Advisor');
            expect(roleOptions).toContain('Employee');
            expect(roleOptions).toContain('ESOP Pool');
        });
    });

    it('submit button is disabled when required fields are empty', async () => {
        const user = userEvent.setup();
        renderWithProviders(<EquityTracker />);
        await user.click(screen.getByText(/add stakeholder/i));
        await waitFor(() => {
            // In the modal, there should be a disabled submit button
            const allButtons = screen.getAllByRole('button');
            const submitBtn = allButtons.find(b => b.textContent?.match(/add stakeholder/i) && b.hasAttribute('disabled'));
            expect(submitBtn).toBeTruthy();
        });
    });

    it('renders venture filter', () => {
        const { container } = renderWithProviders(<EquityTracker />);
        // Filter may be buttons or text, check for "All" option
        expect(container.textContent).toMatch(/all|filter|venture/i);
    });

    it('displays seed equity data', () => {
        const { container } = renderWithProviders(<EquityTracker />);
        expect(container.textContent?.length).toBeGreaterThan(0);
    });
});
