/**
 * Theme Management
 */

const ThemeUtils = (() => {
    const THEME_KEY = 'trainingDiary.theme';
    const COLOR_STORAGE_KEY = 'trainingDiary.colors';

    // Color definitions: [primary, primary-600, accent, accent-600]
    const COLOR_PRESETS = {
        azul: {
            dark: { primary: '#5ea9ff', primary600: '#0080e9', accent: '#5ea9ff', accent600: '#0080e9' },
            light: { primary: '#5ea9ff', primary600: '#0080e9', accent: '#5ea9ff', accent600: '#0080e9' }
        },
        rojo: {
            dark: { primary: '#ff6b6b', primary600: '#ff3b30', accent: '#ff6b6b', accent600: '#ff3b30' },
            light: { primary: '#ff6b6b', primary600: '#ff3b30', accent: '#ff6b6b', accent600: '#ff3b30' }
        },
        verde: {
            dark: { primary: '#34c759', primary600: '#248a3d', accent: '#34c759', accent600: '#248a3d' },
            light: { primary: '#34c759', primary600: '#248a3d', accent: '#34c759', accent600: '#248a3d' }
        },
        amarillo: {
            dark: { primary: '#FFE100', primary600: '#FFF757', accent: '#FFE100', accent600: '#FFF757' },
            light: { primary: '#ffcc00', primary600: '#ff9500', accent: '#ffcc00', accent600: '#ff9500' }
        },
        morado: {
            dark: { primary: '#A24AFF', primary600: '#5800FA', accent: '#A24AFF', accent600: '#5800FA' },
            light: { primary: '#A24AFF', primary600: '#5800FA', accent: '#A24AFF', accent600: '#5800FA' }
        },
        rosa: {
            dark: { primary: '#f783ac', primary600: '#f06292', accent: '#f783ac', accent600: '#f06292' },
            light: { primary: '#ff2d55', primary600: '#d81b60', accent: '#ff2d55', accent600: '#d81b60' }
        },
        naranja: {
            dark: { primary: '#ff9500', primary600: '#ff6b00', accent: '#ff9500', accent600: '#ff6b00' },
            light: { primary: '#ff9500', primary600: '#ff6b00', accent: '#ff9500', accent600: '#ff6b00' }
        },
        cian: {
            dark: { primary: '#3bc9db', primary600: '#007aff', accent: '#3bc9db', accent600: '#007aff' },
            light: { primary: '#3bc9db', primary600: '#007aff', accent: '#3bc9db', accent600: '#007aff' }
        },
        gris: {
            dark: { primary: '#adb5bd', primary600: '#868e96', accent: '#adb5bd', accent600: '#868e96' },
            light: { primary: '#8e8e93', primary600: '#636366', accent: '#8e8e93', accent600: '#636366' }
        },
        turquesa: {
            dark: { primary: '#00d4aa', primary600: '#00b894', accent: '#00d4aa', accent600: '#00b894' },
            light: { primary: '#00d4aa', primary600: '#00b894', accent: '#00d4aa', accent600: '#00b894' }
        },
        esmeralda: {
            dark: { primary: '#10b981', primary600: '#059669', accent: '#10b981', accent600: '#059669' },
            light: { primary: '#10b981', primary600: '#059669', accent: '#10b981', accent600: '#059669' }
        },
        indigo: {
            dark: { primary: '#6366f1', primary600: '#4f46e5', accent: '#6366f1', accent600: '#4f46e5' },
            light: { primary: '#6366f1', primary600: '#4f46e5', accent: '#6366f1', accent600: '#4f46e5' }
        },
        fucsia: {
            dark: { primary: '#d946ef', primary600: '#c026d3', accent: '#d946ef', accent600: '#c026d3' },
            light: { primary: '#d946ef', primary600: '#c026d3', accent: '#d946ef', accent600: '#c026d3' }
        },
        coral: {
            dark: { primary: '#ff7f50', primary600: '#ff6348', accent: '#ff7f50', accent600: '#ff6348' },
            light: { primary: '#ff7f50', primary600: '#ff6348', accent: '#ff7f50', accent600: '#ff6348' }
        },
        lima: {
            dark: { primary: '#84cc16', primary600: '#65a30d', accent: '#84cc16', accent600: '#65a30d' },
            light: { primary: '#84cc16', primary600: '#65a30d', accent: '#84cc16', accent600: '#65a30d' }
        },
        teal: {
            dark: { primary: '#14b8a6', primary600: '#0d9488', accent: '#14b8a6', accent600: '#0d9488' },
            light: { primary: '#14b8a6', primary600: '#0d9488', accent: '#14b8a6', accent600: '#0d9488' }
        },
        violeta: {
            dark: { primary: '#8b5cf6', primary600: '#7c3aed', accent: '#8b5cf6', accent600: '#7c3aed' },
            light: { primary: '#8b5cf6', primary600: '#7c3aed', accent: '#8b5cf6', accent600: '#7c3aed' }
        },
        carmesi: {
            dark: { primary: '#dc2626', primary600: '#b91c1c', accent: '#dc2626', accent600: '#b91c1c' },
            light: { primary: '#dc2626', primary600: '#b91c1c', accent: '#dc2626', accent600: '#b91c1c' }
        }
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
        const colors = COLOR_PRESETS[colorKey][theme];

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
        const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeButton(savedTheme);
        updateThemeColors(savedTheme);

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

