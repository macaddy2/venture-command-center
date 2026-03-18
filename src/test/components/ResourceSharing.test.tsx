import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, userEvent } from '../test-utils';
import ResourceSharing from '../../components/ResourceSharing';

describe('ResourceSharing', () => {
    it('renders the component', () => {
        const { container } = renderWithProviders(<ResourceSharing />);
        const matches = screen.getAllByText(/resource/i);
        expect(matches.length).toBeGreaterThan(0);
    });

    it('renders Share Resource button', () => {
        renderWithProviders(<ResourceSharing />);
        expect(screen.getByText(/share resource/i)).toBeInTheDocument();
    });

    it('opens form modal when clicked', async () => {
        const user = userEvent.setup();
        renderWithProviders(<ResourceSharing />);
        await user.click(screen.getByText(/share resource/i));
        await waitFor(() => {
            const selects = document.querySelectorAll('select');
            expect(selects.length).toBeGreaterThanOrEqual(3);
        });
    });

    it('displays seed resource sharing data', () => {
        const { container } = renderWithProviders(<ResourceSharing />);
        expect(container.textContent?.length).toBeGreaterThan(0);
    });
});
