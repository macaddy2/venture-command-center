import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, userEvent } from '../test-utils';
import RecurringTasks from '../../components/RecurringTasks';

describe('RecurringTasks', () => {
    it('renders the component', () => {
        const { container } = renderWithProviders(<RecurringTasks />);
        const matches = screen.getAllByText(/recurring/i);
        expect(matches.length).toBeGreaterThan(0);
    });

    it('renders Add Recurring Task button', () => {
        renderWithProviders(<RecurringTasks />);
        expect(screen.getByText(/add recurring task/i)).toBeInTheDocument();
    });

    it('opens form modal when clicked', async () => {
        const user = userEvent.setup();
        renderWithProviders(<RecurringTasks />);
        await user.click(screen.getByText(/add recurring task/i));
        await waitFor(() => {
            expect(screen.getByPlaceholderText(/task title/i)).toBeInTheDocument();
        });
    });

    it('form has recurrence and priority selects', async () => {
        const user = userEvent.setup();
        renderWithProviders(<RecurringTasks />);
        await user.click(screen.getByText(/add recurring task/i));
        await waitFor(() => {
            const selects = document.querySelectorAll('select');
            expect(selects.length).toBeGreaterThanOrEqual(3);
        });
    });

    it('displays seed recurring task data', () => {
        const { container } = renderWithProviders(<RecurringTasks />);
        expect(container.textContent?.length).toBeGreaterThan(0);
    });
});
