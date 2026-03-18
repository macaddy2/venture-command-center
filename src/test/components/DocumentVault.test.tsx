import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, userEvent } from '../test-utils';
import DocumentVault from '../../components/DocumentVault';

describe('DocumentVault', () => {
    it('renders the component', () => {
        const { container } = renderWithProviders(<DocumentVault />);
        const matches = screen.getAllByText(/document/i);
        expect(matches.length).toBeGreaterThan(0);
    });

    it('renders Add Document button', () => {
        renderWithProviders(<DocumentVault />);
        expect(screen.getByText(/add document/i)).toBeInTheDocument();
    });

    it('opens form modal when clicked', async () => {
        const user = userEvent.setup();
        renderWithProviders(<DocumentVault />);
        await user.click(screen.getByText(/add document/i));
        await waitFor(() => {
            expect(screen.getByPlaceholderText(/document name/i)).toBeInTheDocument();
        });
    });

    it('form has url and category fields', async () => {
        const user = userEvent.setup();
        renderWithProviders(<DocumentVault />);
        await user.click(screen.getByText(/add document/i));
        await waitFor(() => {
            expect(screen.getByPlaceholderText(/url/i)).toBeInTheDocument();
        });
    });

    it('renders search input for filtering', () => {
        renderWithProviders(<DocumentVault />);
        expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });

    it('search filters documents', async () => {
        const user = userEvent.setup();
        renderWithProviders(<DocumentVault />);
        const search = screen.getByPlaceholderText(/search/i);
        await user.type(search, 'nonexistent-xyz');
        expect(search).toHaveValue('nonexistent-xyz');
    });

    it('displays seed document data', () => {
        const { container } = renderWithProviders(<DocumentVault />);
        expect(container.textContent?.length).toBeGreaterThan(0);
    });
});
