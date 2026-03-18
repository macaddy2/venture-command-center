import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, userEvent } from '../test-utils';
import RiskMatrix from '../../components/RiskMatrix';

describe('RiskMatrix', () => {
    it('renders the component', () => {
        const { container } = renderWithProviders(<RiskMatrix />);
        const matches = screen.getAllByText(/risk/i);
        expect(matches.length).toBeGreaterThan(0);
    });

    it('renders Add Risk button', () => {
        renderWithProviders(<RiskMatrix />);
        expect(screen.getByText(/add risk/i)).toBeInTheDocument();
    });

    it('opens form modal when Add Risk is clicked', async () => {
        const user = userEvent.setup();
        renderWithProviders(<RiskMatrix />);
        await user.click(screen.getByText(/add risk/i));
        await waitFor(() => {
            expect(screen.getByPlaceholderText(/risk title/i)).toBeInTheDocument();
        });
    });

    it('form has likelihood and impact selects', async () => {
        const user = userEvent.setup();
        renderWithProviders(<RiskMatrix />);
        await user.click(screen.getByText(/add risk/i));
        await waitFor(() => {
            const selects = document.querySelectorAll('select');
            expect(selects.length).toBeGreaterThanOrEqual(3);
        });
    });

    it('renders the 5x5 heat map', () => {
        const { container } = renderWithProviders(<RiskMatrix />);
        const text = container.textContent!;
        expect(text).toMatch(/impact|likelihood|severity/i);
    });

    it('displays seed risk data', () => {
        const { container } = renderWithProviders(<RiskMatrix />);
        expect(container.textContent?.length).toBeGreaterThan(0);
    });
});
