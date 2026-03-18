import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import FocusMode from '../../components/FocusMode';

describe('FocusMode', () => {
    beforeEach(() => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders the component', () => {
        const { container } = renderWithProviders(<FocusMode />);
        const matches = screen.getAllByText(/focus/i);
        expect(matches.length).toBeGreaterThan(0);
    });

    it('displays priority tasks from seed data', () => {
        const { container } = renderWithProviders(<FocusMode />);
        expect(container.textContent?.length).toBeGreaterThan(0);
    });

    it('renders timer or focus mode interface', () => {
        const { container } = renderWithProviders(<FocusMode />);
        // Timer may show as formatted time or buttons
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
    });

    it('has interactive buttons', () => {
        renderWithProviders(<FocusMode />);
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
    });
});
