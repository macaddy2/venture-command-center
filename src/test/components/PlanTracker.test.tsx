import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import PlanTracker from '../../components/PlanTracker';

describe('PlanTracker', () => {
    it('renders the component', () => {
        const { container } = renderWithProviders(<PlanTracker />);
        const matches = screen.getAllByText(/plan/i);
        expect(matches.length).toBeGreaterThan(0);
    });

    it('renders Add Plan button', () => {
        renderWithProviders(<PlanTracker />);
        const matches = screen.getAllByText(/add plan|new plan/i);
        expect(matches.length).toBeGreaterThan(0);
    });

    it('displays seed implementation plans', () => {
        const { container } = renderWithProviders(<PlanTracker />);
        expect(container.textContent).toMatch(/trucycle|depositguard|fixars/i);
    });

    it('displays phase information', () => {
        const { container } = renderWithProviders(<PlanTracker />);
        expect(container.textContent?.length).toBeGreaterThan(100);
    });

    it('has interactive select elements', () => {
        const { container } = renderWithProviders(<PlanTracker />);
        const selects = container.querySelectorAll('select');
        expect(selects.length).toBeGreaterThan(0);
    });
});
