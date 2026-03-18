import React, { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '../lib/theme';
import { DataProvider } from '../lib/store';

function AllProviders({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <DataProvider>
                {children}
            </DataProvider>
        </ThemeProvider>
    );
}

export function renderWithProviders(
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) {
    return render(ui, { wrapper: AllProviders, ...options });
}

// Minimal test data factories
export function makeVenture(overrides: Record<string, unknown> = {}) {
    return {
        id: 'v-test-001',
        name: 'TestVenture',
        prefix: 'TV',
        geo: 'UK' as const,
        tier: 'Active Build' as const,
        status: 'Active',
        stage: 'MVP',
        color: '#3498DB',
        lightColor: '#D6EAF8',
        description: 'Test venture',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        ...overrides,
    };
}

export function makeTask(overrides: Record<string, unknown> = {}) {
    return {
        id: 'task-test-001',
        venture_id: 'v-test-001',
        title: 'Test Task',
        status: 'todo' as const,
        priority: 'P1' as const,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        ...overrides,
    };
}

export function makeMilestone(overrides: Record<string, unknown> = {}) {
    return {
        id: 'ms-test-001',
        venture_id: 'v-test-001',
        name: 'Test Milestone',
        target_date: '2026-06-01',
        progress: 50,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        ...overrides,
    };
}

export function makeTeamRole(overrides: Record<string, unknown> = {}) {
    return {
        id: 'role-test-001',
        venture_id: 'v-test-001',
        role_name: 'CTO',
        status: 'filled' as const,
        assignee_name: 'Jane Doe',
        ...overrides,
    };
}

export function makeRegistration(overrides: Record<string, unknown> = {}) {
    return {
        id: 'reg-test-001',
        venture_id: 'v-test-001',
        type: 'domain' as const,
        completed: true,
        ...overrides,
    };
}

export { render } from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
export { screen, within, waitFor, act } from '@testing-library/react';
