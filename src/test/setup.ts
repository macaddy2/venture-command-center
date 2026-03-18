import '@testing-library/jest-dom';

// Mock localStorage
const store: Record<string, string> = {};
const localStorageMock: Storage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    get length() { return Object.keys(store).length; },
    key: (i: number) => Object.keys(store)[i] ?? null,
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock crypto.randomUUID
let uuidCounter = 0;
Object.defineProperty(globalThis, 'crypto', {
    value: {
        randomUUID: () => `test-uuid-${++uuidCounter}`,
        getRandomValues: (arr: Uint8Array) => {
            for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
            return arr;
        },
    },
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    value: (query: string) => ({
        matches: query.includes('dark'),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
    }),
});

// Mock ResizeObserver (Recharts)
class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
}
window.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

// Mock IntersectionObserver
class IntersectionObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
}
window.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver;

// Mock clipboard — must be configurable so @testing-library/user-event can override it
Object.defineProperty(navigator, 'clipboard', {
    value: {
        writeText: vi.fn().mockResolvedValue(undefined),
        readText: vi.fn().mockResolvedValue(''),
    },
    configurable: true,
    writable: true,
});

// Mock URL.createObjectURL / revokeObjectURL
URL.createObjectURL = vi.fn(() => 'blob:mock-url');
URL.revokeObjectURL = vi.fn();

// Global mock for useAuth (used by Header, AuthPage)
vi.mock('../lib/useAuth', () => ({
    useAuth: () => ({
        user: { email: 'test@example.com', id: 'user-1' },
        session: null,
        isLoading: false,
        signIn: vi.fn().mockResolvedValue({ error: null }),
        signUp: vi.fn().mockResolvedValue({ error: null }),
        signOut: vi.fn().mockResolvedValue(undefined),
    }),
    AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Global mock for Toast (used by many components)
vi.mock('../components/Toast', () => ({
    useToast: () => ({ showToast: vi.fn() }),
    ToastProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Global mock for Supabase (optional integration)
vi.mock('../lib/supabase', () => ({
    supabase: null,
    isSupabaseConfigured: false,
}));

// Global mock for GitHub
vi.mock('../lib/github', () => ({
    validateGitHub: vi.fn().mockResolvedValue({ login: 'testuser' }),
}));

// Mock Element.prototype.scrollIntoView (used by AICopilot)
Element.prototype.scrollIntoView = vi.fn();

// Reset uuid counter before each test
beforeEach(() => {
    uuidCounter = 0;
    localStorageMock.clear();
});
