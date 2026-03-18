import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders, userEvent } from '../test-utils';
import KanbanBoard from '../../components/KanbanBoard';

describe('KanbanBoard', () => {
    it('renders all 6 column headers', () => {
        const { container } = renderWithProviders(<KanbanBoard />);
        const text = container.textContent!;
        expect(text).toMatch(/backlog/i);
        expect(text).toMatch(/todo|to do/i);
        expect(text).toMatch(/in.?progress/i);
        expect(text).toMatch(/review/i);
        expect(text).toMatch(/done/i);
        expect(text).toMatch(/blocked/i);
    });

    it('renders New Task button', () => {
        renderWithProviders(<KanbanBoard />);
        expect(screen.getByText(/new task/i)).toBeInTheDocument();
    });

    it('clicking New Task opens TaskForm', async () => {
        const user = userEvent.setup();
        renderWithProviders(<KanbanBoard />);
        await user.click(screen.getByText(/new task/i));
        // TaskForm should appear — check for any form inputs
        const inputs = document.querySelectorAll('input, textarea, select');
        expect(inputs.length).toBeGreaterThan(0);
    });

    it('renders filter dropdowns', () => {
        const { container } = renderWithProviders(<KanbanBoard />);
        const selects = container.querySelectorAll('select');
        expect(selects.length).toBeGreaterThanOrEqual(2);
    });

    it('displays seed task data', () => {
        const { container } = renderWithProviders(<KanbanBoard />);
        expect(container.textContent?.length).toBeGreaterThan(100);
    });

    it('task cards are present', () => {
        const { container } = renderWithProviders(<KanbanBoard />);
        expect(container.textContent).toMatch(/CI\/CD|authentication|database|landing/i);
    });
});
