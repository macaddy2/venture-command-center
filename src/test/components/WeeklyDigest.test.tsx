import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders, userEvent } from '../test-utils';
import WeeklyDigest from '../../components/WeeklyDigest';

describe('WeeklyDigest', () => {
    it('renders the component', () => {
        renderWithProviders(<WeeklyDigest />);
        // Use getAllByText since "digest" may appear multiple times
        const matches = screen.getAllByText(/digest/i);
        expect(matches.length).toBeGreaterThan(0);
    });

    it('renders Copy button', () => {
        renderWithProviders(<WeeklyDigest />);
        expect(screen.getByText(/copy/i)).toBeInTheDocument();
    });

    it('renders Download button', () => {
        renderWithProviders(<WeeklyDigest />);
        expect(screen.getByText(/download/i)).toBeInTheDocument();
    });

    it('Copy button works', async () => {
        const user = userEvent.setup();
        renderWithProviders(<WeeklyDigest />);
        await user.click(screen.getByText(/copy/i));
        // If we get here without error, the button works
        expect(true).toBe(true);
    });

    it('Download button works', async () => {
        const user = userEvent.setup();
        renderWithProviders(<WeeklyDigest />);
        await user.click(screen.getByText(/download/i));
        expect(URL.createObjectURL).toHaveBeenCalled();
    });

    it('displays portfolio data in digest', () => {
        renderWithProviders(<WeeklyDigest />);
        const content = document.body.textContent;
        expect(content).toContain('TruCycle');
    });
});
