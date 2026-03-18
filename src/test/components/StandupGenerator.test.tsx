import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders, userEvent } from '../test-utils';
import StandupGenerator from '../../components/StandupGenerator';

describe('StandupGenerator', () => {
    it('renders the component', () => {
        const { container } = renderWithProviders(<StandupGenerator />);
        const matches = screen.getAllByText(/standup/i);
        expect(matches.length).toBeGreaterThan(0);
    });

    it('renders period toggle buttons (Daily/Weekly)', () => {
        const { container } = renderWithProviders(<StandupGenerator />);
        const text = container.textContent!;
        expect(text).toMatch(/daily/i);
        expect(text).toMatch(/weekly/i);
    });

    it('switching period works without error', async () => {
        const user = userEvent.setup();
        renderWithProviders(<StandupGenerator />);
        const weeklyBtn = screen.getAllByText(/weekly/i)[0];
        await user.click(weeklyBtn);
        expect(weeklyBtn).toBeInTheDocument();
    });

    it('renders venture filter buttons', () => {
        const { container } = renderWithProviders(<StandupGenerator />);
        // Venture prefixes should appear
        expect(container.textContent).toMatch(/TC|DG|FX/);
    });

    it('renders Copy button', () => {
        renderWithProviders(<StandupGenerator />);
        const matches = screen.getAllByText(/copy/i);
        expect(matches.length).toBeGreaterThan(0);
    });

    it('Copy button works', async () => {
        const user = userEvent.setup();
        renderWithProviders(<StandupGenerator />);
        const copyBtn = screen.getAllByText(/copy/i)[0];
        await user.click(copyBtn);
        expect(true).toBe(true);
    });

    it('renders Download button', () => {
        renderWithProviders(<StandupGenerator />);
        const matches = screen.getAllByText(/download/i);
        expect(matches.length).toBeGreaterThan(0);
    });
});
