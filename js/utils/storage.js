/**
 * Storage Utilities
 * Save and load application data
 */

const StorageUtils = (() => {
    let saveTimer = null;
    let progressCache = null;

    function clearProgressCache() {
        progressCache = null;
    }

    function createDefaultProfile() {
        return {
            photo: '',
            avatarStyle: 'avataaars',
            avatarSeed: '',
            firstName: '',
            lastName: '',
            height: '',
            weight: '',
            bodyFat: '',
            weightHistory: [],
            bodyMeasurementsHistory: [],
        };
    }

    async function save() {
        // clearProgressCache is defined in app.js, call it if available
        if (typeof clearProgressCache === 'function') {
            clearProgressCache();
        }
        const payload = {
            sessions: app.sessions,
            routines: app.routines,
            profile: app.profile,
            notes: app.notes,
            prs: app.prs || {},
            onerm: app.onerm || {},
            exerciseNotes: app.exerciseNotes || {},
            achievements: app.achievements || [],
            streak: app.streak || { current: 0, lastDate: null },
            weeklyGoal: app.weeklyGoal || { target: 3, current: 0 },
            statsPeriod: app.statsPeriod || '8weeks',
            goals: app.goals || [],
            recentAchievements: app.recentAchievements || [],
            lastLevel: app.lastLevel || 1,
            totalDaysCompleted: app.totalDaysCompleted || 0,
            archivedCycles: app.archivedCycles || []
        };

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    function debouncedSave() {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            save();
        }, 500); // Wait 500ms after last change before saving
    }

    async function load() {
        let parsed = null;
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                initializeDefaultData();
                return;
            }
            parsed = JSON.parse(raw);
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            initializeDefaultData();
            return;
        }

        // Parse and load data
        const ensureSessionsCompleted = (sessions) => {
            sessions.forEach(session => {
                if (session.completed === undefined) {
                    session.completed = false;
                }
            });
        };

        try {
            if (Array.isArray(parsed)) {
                app.sessions = parsed;
                ensureSessionsCompleted(app.sessions);
                app.routines = [];
                app.profile = createDefaultProfile();
                app.notes = [];
                app.prs = {};
                app.onerm = {};
                app.exerciseNotes = {};
                app.achievements = [];
                app.streak = { current: 0, lastDate: null };
                app.weeklyGoal = { target: 3, current: 0 };
                app.statsPeriod = '8weeks';
            } else {
                app.sessions = Array.isArray(parsed.sessions) ? parsed.sessions : [];
                ensureSessionsCompleted(app.sessions);
                app.routines = Array.isArray(parsed.routines) ? parsed.routines : [];
                const baseProfile = createDefaultProfile();
                const storedProfile = (parsed.profile && typeof parsed.profile === 'object') ? parsed.profile : {};
                app.profile = {
                    ...baseProfile,
                    ...storedProfile,
                    avatarStyle: storedProfile.avatarStyle || 'avataaars',
                    avatarSeed: storedProfile.avatarSeed || '',
                    weightHistory: Array.isArray(storedProfile.weightHistory) ? storedProfile.weightHistory : [],
                    bodyMeasurementsHistory: Array.isArray(storedProfile.bodyMeasurementsHistory) ? storedProfile.bodyMeasurementsHistory : []
                };
                app.notes = Array.isArray(parsed.notes) ? parsed.notes : [];
                app.prs = (parsed.prs && typeof parsed.prs === 'object') ? parsed.prs : {};
                app.onerm = (parsed.onerm && typeof parsed.onerm === 'object') ? parsed.onerm : {};
                app.exerciseNotes = (parsed.exerciseNotes && typeof parsed.exerciseNotes === 'object') ? parsed.exerciseNotes : {};
                app.achievements = Array.isArray(parsed.achievements) ? parsed.achievements : [];
                app.streak = (parsed.streak && typeof parsed.streak === 'object') ? parsed.streak : { current: 0, lastDate: null };
                app.weeklyGoal = (parsed.weeklyGoal && typeof parsed.weeklyGoal === 'object') ? parsed.weeklyGoal : { target: 3, current: 0 };
                app.statsPeriod = parsed.statsPeriod || 'lastWeek';
                app.goals = Array.isArray(parsed.goals) ? parsed.goals : [];
                app.recentAchievements = Array.isArray(parsed.recentAchievements) ? parsed.recentAchievements : [];
                app.lastLevel = parsed.lastLevel || 1;
                app.totalDaysCompleted = parsed.totalDaysCompleted || 0;
                app.archivedCycles = Array.isArray(parsed.archivedCycles) ? parsed.archivedCycles : [];
            }

            const needsSave = app.sessions.some(session => session.completed === undefined);
            if (needsSave) {
                ensureSessionsCompleted(app.sessions);
                await save();
            }
        } catch (error) {
            console.error('Error parsing loaded data:', error);
            initializeDefaultData();
        }
    }

    return {
        save,
        debouncedSave,
        load,
        createDefaultProfile,
        clearProgressCache
    };
})();

// Make available globally
window.save = StorageUtils.save;
window.debouncedSave = StorageUtils.debouncedSave;
window.load = StorageUtils.load;
window.createDefaultProfile = StorageUtils.createDefaultProfile;
window.clearProgressCache = StorageUtils.clearProgressCache;

