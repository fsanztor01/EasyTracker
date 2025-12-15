/**
 * Storage Service - Data Abstraction Layer
 * 
 * This module provides an abstraction layer for data storage.
 * Currently uses localStorage, but designed to easily migrate to
 * Supabase, Firebase, or any other backend in the future.
 * 
 * To migrate to a backend:
 * 1. Replace the implementation of each method
 * 2. Keep the same method signatures
 * 3. Handle async operations (add async/await where needed)
 * 4. Update error handling for network requests
 */

const StorageService = (() => {
    // Storage keys
    const KEYS = {
        SESSIONS: 'fittracker_sessions',
        ROUTINES: 'fittracker_routines',
        SETTINGS: 'fittracker_settings',
        THEME: 'fittracker_theme'
    };

    /**
     * Generic get method from localStorage
     * @param {string} key - Storage key
     * @returns {any} Parsed data or null
     */
    const get = (key) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Error reading from storage (${key}):`, error);
            return null;
        }
    };

    /**
     * Generic set method to localStorage
     * @param {string} key - Storage key
     * @param {any} value - Data to store
     * @returns {boolean} Success status
     */
    const set = (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error writing to storage (${key}):`, error);
            return false;
        }
    };

    /**
     * Generic remove method from localStorage
     * @param {string} key - Storage key
     * @returns {boolean} Success status
     */
    const remove = (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing from storage (${key}):`, error);
            return false;
        }
    };

    // ===== SESSIONS (Diary) =====

    /**
     * Get all training sessions
     * @returns {Array} Array of session objects
     */
    const getSessions = () => {
        const sessions = get(KEYS.SESSIONS);
        return sessions || [];
    };

    /**
     * Get a single session by ID
     * @param {string} id - Session ID
     * @returns {Object|null} Session object or null
     */
    const getSession = (id) => {
        const sessions = getSessions();
        return sessions.find(s => s.id === id) || null;
    };

    /**
     * Save a new session
     * @param {Object} session - Session object
     * @returns {Object} Saved session with ID
     */
    const saveSession = (session) => {
        const sessions = getSessions();
        const newSession = {
            ...session,
            id: session.id || generateId(),
            createdAt: session.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        sessions.push(newSession);
        set(KEYS.SESSIONS, sessions);
        return newSession;
    };

    /**
     * Update an existing session
     * @param {string} id - Session ID
     * @param {Object} updates - Updated fields
     * @returns {Object|null} Updated session or null
     */
    const updateSession = (id, updates) => {
        const sessions = getSessions();
        const index = sessions.findIndex(s => s.id === id);
        if (index === -1) return null;

        sessions[index] = {
            ...sessions[index],
            ...updates,
            id, // Ensure ID doesn't change
            updatedAt: new Date().toISOString()
        };
        set(KEYS.SESSIONS, sessions);
        return sessions[index];
    };

    /**
     * Delete a session
     * @param {string} id - Session ID
     * @returns {boolean} Success status
     */
    const deleteSession = (id) => {
        const sessions = getSessions();
        const filtered = sessions.filter(s => s.id !== id);
        if (filtered.length === sessions.length) return false;
        return set(KEYS.SESSIONS, filtered);
    };

    /**
     * Get sessions within a date range
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @returns {Array} Filtered sessions
     */
    const getSessionsByDateRange = (startDate, endDate) => {
        const sessions = getSessions();
        return sessions.filter(session => {
            const sessionDate = new Date(session.date);
            return sessionDate >= startDate && sessionDate <= endDate;
        });
    };

    // ===== ROUTINES =====

    /**
     * Get all routines
     * @returns {Array} Array of routine objects
     */
    const getRoutines = () => {
        const routines = get(KEYS.ROUTINES);
        return routines || [];
    };

    /**
     * Get a single routine by ID
     * @param {string} id - Routine ID
     * @returns {Object|null} Routine object or null
     */
    const getRoutine = (id) => {
        const routines = getRoutines();
        return routines.find(r => r.id === id) || null;
    };

    /**
     * Save a new routine
     * @param {Object} routine - Routine object
     * @returns {Object} Saved routine with ID
     */
    const saveRoutine = (routine) => {
        const routines = getRoutines();
        const newRoutine = {
            ...routine,
            id: routine.id || generateId(),
            createdAt: routine.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        routines.push(newRoutine);
        set(KEYS.ROUTINES, routines);
        return newRoutine;
    };

    /**
     * Update an existing routine
     * @param {string} id - Routine ID
     * @param {Object} updates - Updated fields
     * @returns {Object|null} Updated routine or null
     */
    const updateRoutine = (id, updates) => {
        const routines = getRoutines();
        const index = routines.findIndex(r => r.id === id);
        if (index === -1) return null;

        routines[index] = {
            ...routines[index],
            ...updates,
            id, // Ensure ID doesn't change
            updatedAt: new Date().toISOString()
        };
        set(KEYS.ROUTINES, routines);
        return routines[index];
    };

    /**
     * Delete a routine
     * @param {string} id - Routine ID
     * @returns {boolean} Success status
     */
    const deleteRoutine = (id) => {
        const routines = getRoutines();
        const filtered = routines.filter(r => r.id !== id);
        if (filtered.length === routines.length) return false;
        return set(KEYS.ROUTINES, filtered);
    };

    /**
     * Export routine to JSON
     * @param {string} id - Routine ID
     * @returns {string|null} JSON string or null
     */
    const exportRoutine = (id) => {
        const routine = getRoutine(id);
        if (!routine) return null;
        
        // Create a clean export without internal IDs
        const exportData = {
            name: routine.name,
            description: routine.description,
            days: routine.days,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
        
        return JSON.stringify(exportData, null, 2);
    };

    /**
     * Import routine from JSON
     * @param {string} jsonString - JSON string
     * @returns {Object|null} Imported routine or null
     */
    const importRoutine = (jsonString) => {
        try {
            const data = JSON.parse(jsonString);
            
            // Validate required fields
            if (!data.name || !data.days) {
                throw new Error('Invalid routine format');
            }
            
            // Create new routine from imported data
            const routine = {
                name: data.name,
                description: data.description || '',
                days: data.days
            };
            
            return saveRoutine(routine);
        } catch (error) {
            console.error('Error importing routine:', error);
            return null;
        }
    };

    // ===== SETTINGS =====

    /**
     * Get user settings
     * @returns {Object} Settings object
     */
    const getSettings = () => {
        const settings = get(KEYS.SETTINGS);
        return settings || {
            theme: 'light',
            notifications: true,
            language: 'es'
        };
    };

    /**
     * Update settings
     * @param {Object} updates - Settings to update
     * @returns {Object} Updated settings
     */
    const updateSettings = (updates) => {
        const settings = getSettings();
        const newSettings = { ...settings, ...updates };
        set(KEYS.SETTINGS, newSettings);
        return newSettings;
    };

    /**
     * Get theme preference
     * @returns {string} Theme ('light' or 'dark')
     */
    const getTheme = () => {
        return get(KEYS.THEME) || 'light';
    };

    /**
     * Set theme preference
     * @param {string} theme - Theme ('light' or 'dark')
     * @returns {boolean} Success status
     */
    const setTheme = (theme) => {
        return set(KEYS.THEME, theme);
    };

    // ===== UTILITIES =====

    /**
     * Generate a unique ID
     * @returns {string} Unique ID
     */
    const generateId = () => {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    };

    /**
     * Clear all app data (use with caution!)
     * @returns {boolean} Success status
     */
    const clearAll = () => {
        try {
            Object.values(KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    };

    /**
     * Export all data
     * @returns {Object} All app data
     */
    const exportAll = () => {
        return {
            sessions: getSessions(),
            routines: getRoutines(),
            settings: getSettings(),
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
    };

    /**
     * Import all data
     * @param {Object} data - Data to import
     * @returns {boolean} Success status
     */
    const importAll = (data) => {
        try {
            if (data.sessions) set(KEYS.SESSIONS, data.sessions);
            if (data.routines) set(KEYS.ROUTINES, data.routines);
            if (data.settings) set(KEYS.SETTINGS, data.settings);
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    };

    // Public API
    return {
        // Sessions
        getSessions,
        getSession,
        saveSession,
        updateSession,
        deleteSession,
        getSessionsByDateRange,
        
        // Routines
        getRoutines,
        getRoutine,
        saveRoutine,
        updateRoutine,
        deleteRoutine,
        exportRoutine,
        importRoutine,
        
        // Settings
        getSettings,
        updateSettings,
        getTheme,
        setTheme,
        
        // Utilities
        clearAll,
        exportAll,
        importAll,
        generateId
    };
})();

// Make it available globally
window.StorageService = StorageService;
