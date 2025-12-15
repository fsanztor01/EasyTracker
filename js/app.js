/**
 * FitTracker - Main Application
 * 
 * Main application controller that initializes all modules
 * and handles global app functionality like navigation and theming.
 */

const FitTrackerApp = (() => {
    let currentView = 'diary';

    /**
     * Initialize the application
     */
    const init = () => {
        console.log('🚀 Initializing FitTracker...');

        // Initialize theme
        initTheme();

        // Initialize modules
        DiaryModule.init();
        RoutinesModule.init();
        StatsModule.init();

        // Setup navigation
        setupNavigation();

        // Setup global event listeners
        setupGlobalListeners();

        // Show initial view
        showView('diary');

        console.log('✅ FitTracker initialized successfully');
    };

    /**
     * Initialize theme from storage
     */
    const initTheme = () => {
        const savedTheme = StorageService.getTheme();
        applyTheme(savedTheme);
        updateThemeIcon(savedTheme);
    };

    /**
     * Apply theme to document
     * @param {string} theme - Theme name ('light' or 'dark')
     */
    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
    };

    /**
     * Update theme toggle icon
     * @param {string} theme - Current theme
     */
    const updateThemeIcon = (theme) => {
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    };

    /**
     * Toggle between light and dark theme
     */
    const toggleTheme = () => {
        const currentTheme = StorageService.getTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        StorageService.setTheme(newTheme);
        applyTheme(newTheme);
        updateThemeIcon(newTheme);

        UIUtils.showToast({
            message: `Tema ${newTheme === 'dark' ? 'oscuro' : 'claro'} activado`,
            type: 'success',
            duration: 2000
        });
    };

    /**
     * Setup navigation between views
     */
    const setupNavigation = () => {
        const navTabs = document.querySelectorAll('.nav-tab');

        navTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const view = tab.dataset.view;
                showView(view);
            });
        });
    };

    /**
     * Show a specific view
     * @param {string} viewName - Name of the view to show
     */
    const showView = (viewName) => {
        // Update current view
        currentView = viewName;

        // Hide all views
        document.querySelectorAll('.view-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected view
        const selectedView = document.getElementById(`${viewName}View`);
        if (selectedView) {
            selectedView.classList.add('active');
        }

        // Update nav tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        const selectedTab = document.querySelector(`[data-view="${viewName}"]`);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }

        // Refresh view content if needed
        refreshCurrentView();
    };

    /**
     * Refresh the current view's content
     */
    const refreshCurrentView = () => {
        switch (currentView) {
            case 'diary':
                DiaryModule.renderDiary();
                break;
            case 'routines':
                RoutinesModule.renderRoutines();
                break;
            case 'stats':
                StatsModule.renderStats();
                break;
        }
    };

    /**
     * Setup global event listeners
     */
    const setupGlobalListeners = () => {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboardShortcuts);

        // Handle visibility change (refresh when tab becomes visible)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                refreshCurrentView();
            }
        });

        // Handle online/offline status
        window.addEventListener('online', () => {
            UIUtils.showToast({
                message: 'Conexión restaurada',
                type: 'success',
                duration: 2000
            });
        });

        window.addEventListener('offline', () => {
            UIUtils.showToast({
                message: 'Sin conexión a internet',
                type: 'warning',
                duration: 3000
            });
        });
    };

    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} e - Keyboard event
     */
    const handleKeyboardShortcuts = (e) => {
        // Ctrl/Cmd + K: Quick search (future feature)
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            // TODO: Implement quick search
        }

        // Ctrl/Cmd + N: New session/routine based on current view
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            handleQuickAdd();
        }

        // Number keys 1-3: Switch views
        if (e.key >= '1' && e.key <= '3' && !e.ctrlKey && !e.metaKey) {
            const target = e.target;
            // Don't trigger if user is typing in an input
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                return;
            }

            e.preventDefault();
            const views = ['diary', 'routines', 'stats'];
            const viewIndex = parseInt(e.key) - 1;
            if (views[viewIndex]) {
                showView(views[viewIndex]);
            }
        }
    };

    /**
     * Handle quick add based on current view
     */
    const handleQuickAdd = () => {
        switch (currentView) {
            case 'diary':
                document.getElementById('addSessionBtn')?.click();
                break;
            case 'routines':
                document.getElementById('addRoutineBtn')?.click();
                break;
        }
    };

    /**
     * Export all app data
     */
    const exportAllData = () => {
        const data = StorageService.exportAll();
        const jsonString = JSON.stringify(data, null, 2);
        const filename = `fittracker_backup_${new Date().toISOString().split('T')[0]}.json`;

        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        UIUtils.showToast({
            message: 'Datos exportados correctamente',
            type: 'success'
        });
    };

    /**
     * Import all app data
     * @param {File} file - JSON file to import
     */
    const importAllData = (file) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                UIUtils.confirm({
                    title: 'Importar Datos',
                    message: '⚠️ Esto reemplazará todos tus datos actuales. ¿Estás seguro?',
                    confirmText: 'Importar',
                    cancelText: 'Cancelar',
                    onConfirm: () => {
                        if (StorageService.importAll(data)) {
                            UIUtils.showToast({
                                message: 'Datos importados correctamente',
                                type: 'success'
                            });
                            refreshCurrentView();
                        } else {
                            UIUtils.showToast({
                                message: 'Error al importar los datos',
                                type: 'error'
                            });
                        }
                    }
                });
            } catch (error) {
                console.error('Error parsing import file:', error);
                UIUtils.showToast({
                    message: 'Error al leer el archivo. Verifica el formato.',
                    type: 'error'
                });
            }
        };

        reader.onerror = () => {
            UIUtils.showToast({
                message: 'Error al leer el archivo',
                type: 'error'
            });
        };

        reader.readAsText(file);
    };

    /**
     * Clear all app data (with confirmation)
     */
    const clearAllData = () => {
        UIUtils.confirm({
            title: 'Borrar Todos los Datos',
            message: '⚠️ Esta acción eliminará TODOS tus datos de forma permanente. ¿Estás completamente seguro?',
            confirmText: 'Sí, borrar todo',
            cancelText: 'Cancelar',
            onConfirm: () => {
                if (StorageService.clearAll()) {
                    UIUtils.showToast({
                        message: 'Todos los datos han sido eliminados',
                        type: 'success'
                    });
                    refreshCurrentView();
                } else {
                    UIUtils.showToast({
                        message: 'Error al borrar los datos',
                        type: 'error'
                    });
                }
            }
        });
    };

    /**
     * Get app info
     * @returns {Object} App information
     */
    const getAppInfo = () => {
        return {
            name: 'FitTracker',
            version: '1.0.0',
            description: 'Tu compañero personal de entrenamiento',
            author: 'FitTracker Team',
            sessions: StorageService.getSessions().length,
            routines: StorageService.getRoutines().length
        };
    };

    // Public API
    return {
        init,
        showView,
        refreshCurrentView,
        toggleTheme,
        exportAllData,
        importAllData,
        clearAllData,
        getAppInfo
    };
})();

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', FitTrackerApp.init);
} else {
    FitTrackerApp.init();
}

// Make app available globally for debugging
window.FitTrackerApp = FitTrackerApp;

// Service Worker registration (for future PWA support)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment when service worker is implemented
        // navigator.serviceWorker.register('/sw.js')
        //     .then(reg => console.log('Service Worker registered'))
        //     .catch(err => console.log('Service Worker registration failed'));
    });
}
