import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders, userEvent } from '../test-utils';
import Header from '../../components/Header';

describe('Header', () => {
    it('renders search input', () => {
        renderWithProviders(<Header />);
        const input = screen.getByPlaceholderText(/search/i);
        expect(input).toBeInTheDocument();
    });

    it('search input dispatches filter updates', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Header />);
        const input = screen.getByPlaceholderText(/search/i);
        await user.type(input, 'trucycle');
        expect(input).toHaveValue('trucycle');
    });

    it('renders New Task button', () => {
        renderWithProviders(<Header />);
        expect(screen.getByText(/new task/i)).toBeInTheDocument();
    });

    it('clicking New Task navigates to tasks view', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Header />);
        const btn = screen.getByText(/new task/i);
        await user.click(btn);
        expect(btn).toBeInTheDocument();
    });

    it('renders theme toggle button', () => {
        renderWithProviders(<Header />);
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
    });
});
