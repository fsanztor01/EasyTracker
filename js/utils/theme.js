/**
 * Theme Management
 */

const ThemeUtils = (() => {
    const THEME_KEY = 'trainingDiary.theme';
    const COLOR_STORAGE_KEY = 'trainingDiary.colors';

    // Color definitions organized by color scale: [primary, primary-600, accent, accent-600]
    // Organized in color spectrum order: Red -> Orange -> Yellow -> Green -> Blue -> Purple -> Pink -> Gray
    // This matches the structure in app.js - using window.COLOR_PRESETS from app.js
    // Note: COLOR_PRESETS will be available from app.js after DOMContentLoaded
    const COLOR_PRESETS = {};

    // Load saved colors or use defaults
    function loadColorPreferences() {
        try {
            const saved = localStorage.getItem(COLOR_STORAGE_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Error loading color preferences:', e);
        }
        return { dark: 'azul', light: 'azul' };
    }

    // Save color preferences
    function saveColorPreferences(prefs) {
        try {
            localStorage.setItem(COLOR_STORAGE_KEY, JSON.stringify(prefs));
        } catch (e) {
            console.warn('Error saving color preferences:', e);
        }
    }

    // Convert hex to RGB
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    // Update CSS variables for current theme
    function updateThemeColors(theme) {
        const prefs = loadColorPreferences();
        const colorKey = prefs[theme] || 'azul';
        // Use window.COLOR_PRESETS if available (from app.js), otherwise fallback to local
        const presets = window.COLOR_PRESETS || COLOR_PRESETS;
        let colors = presets[colorKey]?.[theme];
        if (!colors) {
            console.warn(`Color preset "${colorKey}" not found, using default azul`);
            colors = presets['azul']?.[theme] || { primary: '#2768F5', primary600: '#2731F5', accent: '#2768F5', accent600: '#2731F5' };
        }

        const root = document.documentElement;
        root.style.setProperty('--primary', colors.primary);
        root.style.setProperty('--primary-600', colors.primary600);
        root.style.setProperty('--accent', colors.accent);
        root.style.setProperty('--accent-600', colors.accent600);

        // Update focus colors based on primary
        const primaryRgb = hexToRgb(colors.primary);
        if (primaryRgb) {
            root.style.setProperty('--focus', `0 0 0 3px rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.4)`);
            root.style.setProperty('--focus-keyboard', `0 0 0 2px ${colors.primary}, 0 0 12px rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.3)`);
            root.style.setProperty('--primary-glow', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.15)`);
        }
    }

    function updateThemeButton(theme) {
        const themeBtn = $('#themeToggle');
        if (themeBtn) {
            themeBtn.setAttribute('aria-pressed', theme === 'light');
            themeBtn.textContent = theme === 'light' ? '☀️ Claro' : '🌙 Oscuro';
        }
    }

    function init() {
        // Check for saved theme, otherwise default to dark
        let savedTheme = localStorage.getItem(THEME_KEY);
        if (!savedTheme) {
                savedTheme = 'dark';
        }
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeButton(savedTheme);
        updateThemeColors(savedTheme);

        // Listen for system theme changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                // Only auto-switch if user hasn't manually set a preference
                if (!localStorage.getItem(THEME_KEY)) {
                    const newTheme = e.matches ? 'dark' : 'light';
                    document.documentElement.setAttribute('data-theme', newTheme);
                    updateThemeButton(newTheme);
                    updateThemeColors(newTheme);
                }
            });
        }

        const themeBtn = $('#themeToggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                const current = document.documentElement.getAttribute('data-theme');
                const next = current === 'light' ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', next);
                localStorage.setItem(THEME_KEY, next);
                updateThemeButton(next);
                updateThemeColors(next);
            });
        }
    }

    return {
        init,
        updateThemeColors,
        loadColorPreferences,
        saveColorPreferences,
        COLOR_PRESETS
    };
})();

// Make available globally
window.ThemeUtils = ThemeUtils;

