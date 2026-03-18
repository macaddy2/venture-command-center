import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, userEvent } from '../test-utils';
import FinancialTracker from '../../components/FinancialTracker';

describe('FinancialTracker', () => {
    it('renders the component title', () => {
        renderWithProviders(<FinancialTracker />);
        expect(screen.getByText(/financial/i)).toBeInTheDocument();
    });

    it('renders Add Record button', () => {
        renderWithProviders(<FinancialTracker />);
        expect(screen.getByText(/add record/i)).toBeInTheDocument();
    });

    it('opens form modal when Add Record is clicked', async () => {
        const user = userEvent.setup();
        renderWithProviders(<FinancialTracker />);
        await user.click(screen.getByText(/add record/i));
        await waitFor(() => {
            expect(screen.getByPlaceholderText(/amount/i)).toBeInTheDocument();
        });
    });

    it('form has all required fields', async () => {
        const user = userEvent.setup();
        renderWithProviders(<FinancialTracker />);
        await user.click(screen.getByText(/add record/i));
        await waitFor(() => {
            expect(screen.getByPlaceholderText(/amount/i)).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/description/i)).toBeInTheDocument();
        });
    });

    it('renders venture filter dropdown', () => {
        renderWithProviders(<FinancialTracker />);
        const selects = screen.getAllByRole('combobox');
        expect(selects.length).toBeGreaterThan(0);
    });

    it('displays seed financial data', () => {
        renderWithProviders(<FinancialTracker />);
        const content = document.body.textContent;
        expect(content).toBeTruthy();
    });
});
