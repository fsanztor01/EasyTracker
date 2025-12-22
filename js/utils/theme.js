/**
 * Theme Management
 */

const ThemeUtils = (() => {
    const THEME_KEY = 'trainingDiary.theme';
    const COLOR_STORAGE_KEY = 'trainingDiary.colors';

    const COLOR_PRESETS = {
        // REDS - Rojos
        carmesi: {
            dark: { primary: '#dc2626', primary600: '#b91c1c', accent: '#dc2626', accent600: '#b91c1c' },
            light: { primary: '#dc2626', primary600: '#b91c1c', accent: '#dc2626', accent600: '#b91c1c' }
        },
        rojo: {
            dark: { primary: '#ff6b6b', primary600: '#ff3b30', accent: '#ff6b6b', accent600: '#ff3b30' },
            light: { primary: '#ff6b6b', primary600: '#ff3b30', accent: '#ff6b6b', accent600: '#ff3b30' }
        },
        rojoClaro: {
            dark: { primary: '#ff8787', primary600: '#ff6b6b', accent: '#ff8787', accent600: '#ff6b6b' },
            light: { primary: '#ff5252', primary600: '#ff1744', accent: '#ff5252', accent600: '#ff1744' }
        },
        rojoOscuro: {
            dark: { primary: '#ef4444', primary600: '#dc2626', accent: '#ef4444', accent600: '#dc2626' },
            light: { primary: '#e53935', primary600: '#c62828', accent: '#e53935', accent600: '#c62828' }
        },
        // ORANGES - Naranjas
        naranjaOscuro: {
            dark: { primary: '#f97316', primary600: '#ea580c', accent: '#f97316', accent600: '#ea580c' },
            light: { primary: '#ff6f00', primary600: '#e65100', accent: '#ff6f00', accent600: '#e65100' }
        },
        naranja: {
            dark: { primary: '#ff9500', primary600: '#ff6b00', accent: '#ff9500', accent600: '#ff6b00' },
            light: { primary: '#ff9500', primary600: '#ff6b00', accent: '#ff9500', accent600: '#ff6b00' }
        },
        coral: {
            dark: { primary: '#ff7f50', primary600: '#ff6348', accent: '#ff7f50', accent600: '#ff6348' },
            light: { primary: '#ff7f50', primary600: '#ff6348', accent: '#ff7f50', accent600: '#ff6348' }
        },
        naranjaClaro: {
            dark: { primary: '#ffa726', primary600: '#ff9800', accent: '#ffa726', accent600: '#ff9800' },
            light: { primary: '#ffb74d', primary600: '#ffa726', accent: '#ffb74d', accent600: '#ffa726' }
        },
        // YELLOWS - Amarillos
        amarilloOscuro: {
            dark: { primary: '#fbbf24', primary600: '#f59e0b', accent: '#fbbf24', accent600: '#f59e0b' },
            light: { primary: '#ffc107', primary600: '#ffb300', accent: '#ffc107', accent600: '#ffb300' }
        },
        amarillo: {
            dark: { primary: '#FFE100', primary600: '#FFF757', accent: '#FFE100', accent600: '#FFF757' },
            light: { primary: '#ffcc00', primary600: '#ff9500', accent: '#ffcc00', accent600: '#ff9500' }
        },
        lima: {
            dark: { primary: '#84cc16', primary600: '#65a30d', accent: '#84cc16', accent600: '#65a30d' },
            light: { primary: '#84cc16', primary600: '#65a30d', accent: '#84cc16', accent600: '#65a30d' }
        },
        amarilloClaro: {
            dark: { primary: '#fde047', primary600: '#facc15', accent: '#fde047', accent600: '#facc15' },
            light: { primary: '#ffeb3b', primary600: '#fdd835', accent: '#ffeb3b', accent600: '#fdd835' }
        },
        // GREENS - Verdes
        verdeOscuro: {
            dark: { primary: '#16a34a', primary600: '#15803d', accent: '#16a34a', accent600: '#15803d' },
            light: { primary: '#2e7d32', primary600: '#1b5e20', accent: '#2e7d32', accent600: '#1b5e20' }
        },
        verde: {
            dark: { primary: '#34c759', primary600: '#248a3d', accent: '#34c759', accent600: '#248a3d' },
            light: { primary: '#34c759', primary600: '#248a3d', accent: '#34c759', accent600: '#248a3d' }
        },
        esmeralda: {
            dark: { primary: '#10b981', primary600: '#059669', accent: '#10b981', accent600: '#059669' },
            light: { primary: '#10b981', primary600: '#059669', accent: '#10b981', accent600: '#059669' }
        },
        verdeClaro: {
            dark: { primary: '#4ade80', primary600: '#22c55e', accent: '#4ade80', accent600: '#22c55e' },
            light: { primary: '#66bb6a', primary600: '#4caf50', accent: '#66bb6a', accent600: '#4caf50' }
        },
        // TEAL/CYAN - Turquesas/Cianes
        teal: {
            dark: { primary: '#14b8a6', primary600: '#0d9488', accent: '#14b8a6', accent600: '#0d9488' },
            light: { primary: '#14b8a6', primary600: '#0d9488', accent: '#14b8a6', accent600: '#0d9488' }
        },
        turquesa: {
            dark: { primary: '#00d4aa', primary600: '#00b894', accent: '#00d4aa', accent600: '#00b894' },
            light: { primary: '#00d4aa', primary600: '#00b894', accent: '#00d4aa', accent600: '#00b894' }
        },
        cian: {
            dark: { primary: '#3bc9db', primary600: '#007aff', accent: '#3bc9db', accent600: '#007aff' },
            light: { primary: '#3bc9db', primary600: '#007aff', accent: '#3bc9db', accent600: '#007aff' }
        },
        cianClaro: {
            dark: { primary: '#22d3ee', primary600: '#06b6d4', accent: '#22d3ee', accent600: '#06b6d4' },
            light: { primary: '#00bcd4', primary600: '#0097a7', accent: '#00bcd4', accent600: '#0097a7' }
        },
        // BLUES - Azules
        azulOscuro: {
            dark: { primary: '#1e40af', primary600: '#1e3a8a', accent: '#1e40af', accent600: '#1e3a8a' },
            light: { primary: '#1976d2', primary600: '#1565c0', accent: '#1976d2', accent600: '#1565c0' }
        },
        azul: {
            dark: { primary: '#2768F5', primary600: '#2731F5', accent: '#2768F5', accent600: '#2731F5' },
            light: { primary: '#2768F5', primary600: '#2731F5', accent: '#2768F5', accent600: '#2731F5' }
        },
        azulClaro: {
            dark: { primary: '#3b82f6', primary600: '#2563eb', accent: '#3b82f6', accent600: '#2563eb' },
            light: { primary: '#42a5f5', primary600: '#2196f3', accent: '#42a5f5', accent600: '#2196f3' }
        },
        azulCielo: {
            dark: { primary: '#60a5fa', primary600: '#3b82f6', accent: '#60a5fa', accent600: '#3b82f6' },
            light: { primary: '#64b5f6', primary600: '#42a5f5', accent: '#64b5f6', accent600: '#42a5f5' }
        },
        // INDIGO - Índigos
        indigo: {
            dark: { primary: '#6366f1', primary600: '#4f46e5', accent: '#6366f1', accent600: '#4f46e5' },
            light: { primary: '#6366f1', primary600: '#4f46e5', accent: '#6366f1', accent600: '#4f46e5' }
        },
        indigoOscuro: {
            dark: { primary: '#4c1d95', primary600: '#3730a3', accent: '#4c1d95', accent600: '#3730a3' },
            light: { primary: '#5e35b1', primary600: '#512da8', accent: '#5e35b1', accent600: '#512da8' }
        },
        indigoClaro: {
            dark: { primary: '#818cf8', primary600: '#6366f1', accent: '#818cf8', accent600: '#6366f1' },
            light: { primary: '#7986cb', primary600: '#5c6bc0', accent: '#7986cb', accent600: '#5c6bc0' }
        },
        indigoVibrante: {
            dark: { primary: '#7c3aed', primary600: '#6d28d9', accent: '#7c3aed', accent600: '#6d28d9' },
            light: { primary: '#7c3aed', primary600: '#6d28d9', accent: '#7c3aed', accent600: '#6d28d9' }
        },
        // PURPLES - Morados/Violetas
        moradoOscuro: {
            dark: { primary: '#7c3aed', primary600: '#6d28d9', accent: '#7c3aed', accent600: '#6d28d9' },
            light: { primary: '#7b1fa2', primary600: '#6a1b9a', accent: '#7b1fa2', accent600: '#6a1b9a' }
        },
        morado: {
            dark: { primary: '#A24AFF', primary600: '#5800FA', accent: '#A24AFF', accent600: '#5800FA' },
            light: { primary: '#A24AFF', primary600: '#5800FA', accent: '#A24AFF', accent600: '#5800FA' }
        },
        violeta: {
            dark: { primary: '#8b5cf6', primary600: '#7c3aed', accent: '#8b5cf6', accent600: '#7c3aed' },
            light: { primary: '#8b5cf6', primary600: '#7c3aed', accent: '#8b5cf6', accent600: '#7c3aed' }
        },
        moradoClaro: {
            dark: { primary: '#a78bfa', primary600: '#8b5cf6', accent: '#a78bfa', accent600: '#8b5cf6' },
            light: { primary: '#9575cd', primary600: '#7986cb', accent: '#9575cd', accent600: '#7986cb' }
        },
        // PINKS - Rosas/Fucsias
        rosaOscuro: {
            dark: { primary: '#ec4899', primary600: '#db2777', accent: '#ec4899', accent600: '#db2777' },
            light: { primary: '#c2185b', primary600: '#ad1457', accent: '#c2185b', accent600: '#ad1457' }
        },
        rosa: {
            dark: { primary: '#f783ac', primary600: '#f06292', accent: '#f783ac', accent600: '#f06292' },
            light: { primary: '#ff2d55', primary600: '#d81b60', accent: '#ff2d55', accent600: '#d81b60' }
        },
        fucsia: {
            dark: { primary: '#d946ef', primary600: '#c026d3', accent: '#d946ef', accent600: '#c026d3' },
            light: { primary: '#d946ef', primary600: '#c026d3', accent: '#d946ef', accent600: '#c026d3' }
        },
        rosaClaro: {
            dark: { primary: '#f9a8d4', primary600: '#f472b6', accent: '#f9a8d4', accent600: '#f472b6' },
            light: { primary: '#f48fb1', primary600: '#ec407a', accent: '#f48fb1', accent600: '#ec407a' }
        },
    };

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

