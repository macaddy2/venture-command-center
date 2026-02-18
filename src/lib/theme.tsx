// ============================================================
// Theme Provider — Dark / Light mode toggle
// ============================================================
// Persists preference to localStorage. Applies via [data-theme]
// attribute on <html> element.
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContext {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (t: Theme) => void;
}

const ThemeCtx = createContext<ThemeContext | null>(null);

const STORAGE_KEY = 'vcc-theme';

function getInitialTheme(): Theme {
    if (typeof window === 'undefined') return 'dark';
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    // Respect OS preference
    if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light';
    return 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(getInitialTheme);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
    }, []);

    const setTheme = useCallback((t: Theme) => {
        setThemeState(t);
    }, []);

    return (
        <ThemeCtx.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeCtx.Provider>
    );
}

export function useTheme(): ThemeContext {
    const ctx = useContext(ThemeCtx);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
}
