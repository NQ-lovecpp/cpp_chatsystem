/**
 * 主题上下文
 * 支持亮色/暗色模式 + 主题色自定义
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

// 预设主题色
export const THEME_COLORS = {
    ocean: { name: '海洋蓝', h: 200, s: 80, l: 24 },
    emerald: { name: '翡翠绿', h: 160, s: 84, l: 39 },
    violet: { name: '紫罗兰', h: 271, s: 81, l: 56 },
    rose: { name: '玫瑰红', h: 350, s: 89, l: 60 },
    amber: { name: '琥珀金', h: 38, s: 92, l: 50 },
    slate: { name: '石板灰', h: 215, s: 16, l: 47 },
};

const STORAGE_KEYS = {
    mode: 'theme-mode',
    color: 'theme-color',
    custom: 'theme-custom-color',
};

export function ThemeProvider({ children }) {
    // 主题模式：light | dark | system
    const [mode, setMode] = useState(() => {
        return localStorage.getItem(STORAGE_KEYS.mode) || 'system';
    });
    
    // 主题色名称
    const [colorName, setColorName] = useState(() => {
        return localStorage.getItem(STORAGE_KEYS.color) || 'ocean';
    });
    
    // 自定义颜色（HSL）
    const [customColor, setCustomColor] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.custom);
        return saved ? JSON.parse(saved) : { h: 200, s: 80, l: 24 };
    });
    
    // 计算实际主题模式
    const resolvedMode = useCallback(() => {
        if (mode === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return mode;
    }, [mode]);
    
    const [isDark, setIsDark] = useState(() => resolvedMode() === 'dark');

    // 应用主题
    useEffect(() => {
        const root = document.documentElement;
        
        // 设置亮/暗模式
        const actualMode = resolvedMode();
        root.setAttribute('data-theme', actualMode);
        setIsDark(actualMode === 'dark');
        
        // 设置主题色
        if (colorName === 'custom') {
            root.style.setProperty('--primary-h', customColor.h);
            root.style.setProperty('--primary-s', `${customColor.s}%`);
            root.style.setProperty('--primary-l', `${customColor.l}%`);
            root.removeAttribute('data-color');
        } else {
            root.setAttribute('data-color', colorName);
            root.style.removeProperty('--primary-h');
            root.style.removeProperty('--primary-s');
            root.style.removeProperty('--primary-l');
        }
        
        // 存储设置
        localStorage.setItem(STORAGE_KEYS.mode, mode);
        localStorage.setItem(STORAGE_KEYS.color, colorName);
        localStorage.setItem(STORAGE_KEYS.custom, JSON.stringify(customColor));
    }, [mode, colorName, customColor, resolvedMode]);
    
    // 监听系统主题变化
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => {
            if (mode === 'system') {
                setIsDark(mediaQuery.matches);
                document.documentElement.setAttribute('data-theme', mediaQuery.matches ? 'dark' : 'light');
            }
        };
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, [mode]);

    // 切换模式
    const toggleMode = useCallback(() => {
        setMode(prev => {
            if (prev === 'light') return 'dark';
            if (prev === 'dark') return 'system';
            return 'light';
        });
    }, []);
    
    // 设置主题色
    const setThemeColor = useCallback((name) => {
        if (THEME_COLORS[name] || name === 'custom') {
            setColorName(name);
        }
    }, []);
    
    // 设置自定义颜色
    const setCustomThemeColor = useCallback((hsl) => {
        setCustomColor(hsl);
        setColorName('custom');
    }, []);

    const value = {
        mode,
        setMode,
        isDark,
        toggleMode,
        colorName,
        setThemeColor,
        customColor,
        setCustomThemeColor,
        themeColors: THEME_COLORS,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

export default ThemeContext;
