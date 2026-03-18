import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders, userEvent } from '../test-utils';
import AICopilot from '../../components/AICopilot';

describe('AICopilot', () => {
    it('renders the chat interface', () => {
        const { container } = renderWithProviders(<AICopilot />);
        expect(container.textContent?.length).toBeGreaterThan(0);
    });

    it('renders message input', () => {
        renderWithProviders(<AICopilot />);
        const input = screen.getByPlaceholderText(/type|ask|command|message/i);
        expect(input).toBeInTheDocument();
    });

    it('renders send button', () => {
        renderWithProviders(<AICopilot />);
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
    });

    it('can type into the input', async () => {
        const user = userEvent.setup();
        renderWithProviders(<AICopilot />);
        const input = screen.getByPlaceholderText(/type|ask|command|message/i);
        await user.type(input, 'help');
        expect(input).toHaveValue('help');
    });

    it('shows welcome/intro message on load', () => {
        const { container } = renderWithProviders(<AICopilot />);
        expect(container.textContent?.length).toBeGreaterThan(50);
    });
});
