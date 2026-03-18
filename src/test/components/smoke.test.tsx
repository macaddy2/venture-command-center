import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '../test-utils';
import Dashboard from '../../components/Dashboard';
import Analytics from '../../components/Analytics';
import TimelineView from '../../components/TimelineView';
import PredictiveAlerts from '../../components/PredictiveAlerts';

describe('Smoke Tests — Display Components', () => {
    describe('Dashboard', () => {
        it('renders without crashing', () => {
            const { container } = renderWithProviders(<Dashboard />);
            expect(container.textContent?.length).toBeGreaterThan(0);
        });

        it('shows portfolio KPI stats', () => {
            const { container } = renderWithProviders(<Dashboard />);
            const text = container.textContent;
            expect(text).toMatch(/venture|task|health|team/i);
        });

        it('renders venture cards', () => {
            const { container } = renderWithProviders(<Dashboard />);
            expect(container.textContent).toContain('TruCycle');
        });

        it('renders filter pills', () => {
            const { container } = renderWithProviders(<Dashboard />);
            expect(container.textContent).toMatch(/active build|incubating|parked/i);
        });
    });

    describe('Analytics', () => {
        it('renders without crashing', () => {
            const { container } = renderWithProviders(<Analytics />);
            expect(container.textContent?.length).toBeGreaterThan(0);
        });

        it('shows analytics-related text', () => {
            const { container } = renderWithProviders(<Analytics />);
            expect(container.textContent).toMatch(/analytics|chart|task|health/i);
        });
    });

    describe('TimelineView', () => {
        it('renders without crashing', () => {
            const { container } = renderWithProviders(<TimelineView />);
            expect(container.textContent?.length).toBeGreaterThan(0);
        });

        it('shows timeline-related content', () => {
            const { container } = renderWithProviders(<TimelineView />);
            expect(container.textContent).toMatch(/timeline|milestone|month/i);
        });
    });

    describe('PredictiveAlerts', () => {
        it('renders without crashing', () => {
            const { container } = renderWithProviders(<PredictiveAlerts />);
            expect(container.textContent?.length).toBeGreaterThan(0);
        });

        it('shows alert-related content', () => {
            const { container } = renderWithProviders(<PredictiveAlerts />);
            expect(container.textContent).toMatch(/alert|warning|risk|blocker/i);
        });
    });
});
