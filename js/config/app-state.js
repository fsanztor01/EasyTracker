/**
 * Application State
 * Centralized state management
 */

const AppState = (() => {
    const STORAGE_KEY = 'trainingDiary.v8';
    
    const app = {
        sessions: [],
        routines: [],
        profile: {
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
        },
        notes: [],
        weekOffset: 0,
        currentSessionId: null,
        chartState: { metric: 'volume', exercise: 'all', period: 4 },
        tmpTemplateKey: null,
        importBuffer: null,
        routineImportBuffer: null,
        deleteTarget: { type: null, id: null, sessionId: null, exId: null, setId: null, routineId: null, goalId: null },
        routineEditId: null,
        statsPeriod: '8weeks',
        goals: [],
        recentAchievements: [],
        lastLevel: 1,
        totalDaysCompleted: 0,
        archivedCycles: [],
        editingSessions: {},
        sessionSnapshots: {},
        prs: {},
        onerm: {},
        exerciseNotes: {},
        achievements: [],
        streak: { current: 0, lastDate: null },
        weeklyGoal: { target: 3, current: 0 }
    };

    function initializeDefaultData() {
        app.sessions = [];
        app.routines = [];
        app.profile = {
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
        app.notes = [];
        app.prs = {};
        app.onerm = {};
        app.exerciseNotes = {};
        app.achievements = [];
        app.streak = { current: 0, lastDate: null };
        app.weeklyGoal = { target: 3, current: 0 };
        app.statsPeriod = 'lastWeek';
        app.goals = [];
        app.recentAchievements = [];
        app.lastLevel = 1;
        app.totalDaysCompleted = 0;
        app.archivedCycles = [];
    }

    return {
        app,
        STORAGE_KEY,
        initializeDefaultData
    };
})();

// Make available globally
window.app = AppState.app;
window.STORAGE_KEY = AppState.STORAGE_KEY;
window.initializeDefaultData = AppState.initializeDefaultData;

