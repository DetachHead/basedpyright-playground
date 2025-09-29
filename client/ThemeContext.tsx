/*
 * Theme context and utilities for dark/light mode support.
 */

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';

export type Theme = 'light' | 'dark';

export interface ThemeColors {
    background: string;
    surface: string;
    hover: string;
    text: string;
    textSecondary: string;
    border: string;
    accent: string;
    error: string;
    warning: string;
    info: string;
    success: string;
    shadow: string;
}

const lightTheme: ThemeColors = {
    background: '#ffffff',
    surface: '#f8f9fa',
    hover: '#eee',
    text: '#212529',
    textSecondary: '#6c757d',
    border: '#dee2e6',
    accent: '#ffaa00',
    error: '#dc3545',
    warning: '#fd7e14',
    info: '#0dcaf0',
    success: '#198754',
    shadow: 'rgba(0, 0, 0, 0.1)',
};

const darkTheme: ThemeColors = {
    background: '#1e1e1e',
    surface: '#252526',
    hover: '#252526',
    text: '#cccccc',
    textSecondary: '#9d9d9d',
    border: '#404040',
    accent: '#ffaa00',
    error: '#f14c4c',
    warning: '#ff8c00',
    info: '#17a2b8',
    success: '#28a745',
    shadow: 'rgba(0, 0, 0, 0.3)',
};

export interface ThemeContextType {
    theme: Theme;
    colors: ThemeColors;
    isDark: boolean;
    monacoTheme: string;
}

const ThemeContext = createContext<ThemeContextType>(undefined);

export interface ThemeProviderProps {
    children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(
        () => Appearance.getColorScheme() === 'dark' ? 'dark' : 'light'
    );

    useEffect(() => {
        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
            setTheme(colorScheme === 'dark' ? 'dark' : 'light');
        });

        return () => subscription?.remove?.();
    }, []);

    const contextValue = useMemo<ThemeContextType>(() => {
        return {
            theme,
            colors: theme === 'dark' ? darkTheme : lightTheme,
            isDark: theme === 'dark',
            monacoTheme: theme === 'dark' ? 'vs-dark' : 'vs',
        };
    }, [theme]);

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextType {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
