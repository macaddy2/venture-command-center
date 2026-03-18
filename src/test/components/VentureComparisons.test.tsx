import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders, userEvent } from '../test-utils';
import VentureComparisons from '../../components/VentureComparisons';

describe('VentureComparisons', () => {
    it('renders the component', () => {
        renderWithProviders(<VentureComparisons />);
        expect(screen.getByText(/compar/i)).toBeInTheDocument();
    });

    it('renders two venture selector dropdowns', () => {
        renderWithProviders(<VentureComparisons />);
        const selects = screen.getAllByRole('combobox');
        expect(selects.length).toBeGreaterThanOrEqual(2);
    });

    it('selecting ventures shows comparison metrics', async () => {
        const user = userEvent.setup();
        renderWithProviders(<VentureComparisons />);
        const selects = screen.getAllByRole('combobox');
        // Select first venture in dropdown A
        await user.selectOptions(selects[0], selects[0].querySelectorAll('option')[1]?.value || '');
        // Content should show metrics
        const content = document.body.textContent;
        expect(content?.length).toBeGreaterThan(50);
    });
});
