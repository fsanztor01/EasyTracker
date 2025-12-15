/**
 * Stats Module - Training Statistics
 * 
 * Handles statistics generation and visualization:
 * - Sessions per week/month
 * - Most used exercises
 * - Total volume
 * - Progress tracking
 */

const StatsModule = (() => {
    let currentPeriod = 'week';

    /**
     * Initialize the stats module
     */
    const init = () => {
        setupEventListeners();
        renderStats();
    };

    /**
     * Setup event listeners
     */
    const setupEventListeners = () => {
        const periodSelector = document.getElementById('statsPeriod');
        if (periodSelector) {
            periodSelector.addEventListener('change', (e) => {
                currentPeriod = e.target.value;
                renderStats();
            });
        }
    };

    /**
     * Render statistics
     */
    const renderStats = () => {
        const container = document.getElementById('statsContent');
        const sessions = StorageService.getSessions();

        if (!sessions || sessions.length === 0) {
            UIUtils.showEmptyState(
                container,
                '📊',
                'No hay datos suficientes',
                'Registra algunas sesiones de entrenamiento para ver tus estadísticas'
            );
            return;
        }

        const stats = calculateStats(sessions, currentPeriod);
        container.innerHTML = renderStatsHTML(stats);
    };

    /**
     * Calculate statistics based on period
     * @param {Array} sessions - All sessions
     * @param {string} period - Period ('week', 'month', 'year', 'all')
     * @returns {Object} Calculated statistics
     */
    const calculateStats = (sessions, period) => {
        const filteredSessions = filterSessionsByPeriod(sessions, period);

        return {
            totalSessions: filteredSessions.length,
            totalExercises: countTotalExercises(filteredSessions),
            totalSets: countTotalSets(filteredSessions),
            totalVolume: calculateTotalVolume(filteredSessions),
            averageDuration: calculateAverageDuration(filteredSessions),
            mostUsedExercises: getMostUsedExercises(filteredSessions, 5),
            sessionsPerWeek: calculateSessionsPerWeek(filteredSessions),
            periodLabel: getPeriodLabel(period)
        };
    };

    /**
     * Filter sessions by time period
     * @param {Array} sessions - All sessions
     * @param {string} period - Period filter
     * @returns {Array} Filtered sessions
     */
    const filterSessionsByPeriod = (sessions, period) => {
        const now = new Date();
        const startDate = new Date();

        switch (period) {
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            case 'all':
                return sessions;
            default:
                startDate.setDate(now.getDate() - 7);
        }

        return sessions.filter(session => {
            const sessionDate = new Date(session.date);
            return sessionDate >= startDate && sessionDate <= now;
        });
    };

    /**
     * Count total exercises across sessions
     * @param {Array} sessions - Sessions to count
     * @returns {number} Total exercises
     */
    const countTotalExercises = (sessions) => {
        return sessions.reduce((total, session) => {
            return total + (session.exercises?.length || 0);
        }, 0);
    };

    /**
     * Count total sets across all sessions
     * @param {Array} sessions - Sessions to count
     * @returns {number} Total sets
     */
    const countTotalSets = (sessions) => {
        return sessions.reduce((total, session) => {
            const sessionSets = (session.exercises || []).reduce((sum, exercise) => {
                return sum + (exercise.sets?.length || 0);
            }, 0);
            return total + sessionSets;
        }, 0);
    };

    /**
     * Calculate total volume (weight × reps)
     * @param {Array} sessions - Sessions to calculate
     * @returns {number} Total volume in kg
     */
    const calculateTotalVolume = (sessions) => {
        return sessions.reduce((total, session) => {
            const sessionVolume = (session.exercises || []).reduce((sum, exercise) => {
                const exerciseVolume = (exercise.sets || []).reduce((setSum, set) => {
                    const weight = set.weight || 0;
                    const reps = set.reps || 0;
                    return setSum + (weight * reps);
                }, 0);
                return sum + exerciseVolume;
            }, 0);
            return total + sessionVolume;
        }, 0);
    };

    /**
     * Calculate average session duration
     * @param {Array} sessions - Sessions to calculate
     * @returns {number} Average duration in minutes
     */
    const calculateAverageDuration = (sessions) => {
        const sessionsWithDuration = sessions.filter(s => s.duration);
        if (sessionsWithDuration.length === 0) return 0;

        const totalDuration = sessionsWithDuration.reduce((sum, s) => sum + s.duration, 0);
        return Math.round(totalDuration / sessionsWithDuration.length);
    };

    /**
     * Get most used exercises
     * @param {Array} sessions - Sessions to analyze
     * @param {number} limit - Number of exercises to return
     * @returns {Array} Array of {name, count} objects
     */
    const getMostUsedExercises = (sessions, limit = 5) => {
        const exerciseCount = {};

        sessions.forEach(session => {
            (session.exercises || []).forEach(exercise => {
                const name = exercise.name;
                exerciseCount[name] = (exerciseCount[name] || 0) + 1;
            });
        });

        return Object.entries(exerciseCount)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    };

    /**
     * Calculate sessions per week
     * @param {Array} sessions - Sessions to calculate
     * @returns {number} Average sessions per week
     */
    const calculateSessionsPerWeek = (sessions) => {
        if (sessions.length === 0) return 0;

        const dates = sessions.map(s => new Date(s.date));
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));
        const daysDiff = Math.max(1, (maxDate - minDate) / (1000 * 60 * 60 * 24));
        const weeks = daysDiff / 7;

        return weeks > 0 ? (sessions.length / weeks).toFixed(1) : sessions.length;
    };

    /**
     * Get period label for display
     * @param {string} period - Period code
     * @returns {string} Human-readable label
     */
    const getPeriodLabel = (period) => {
        const labels = {
            week: 'Esta Semana',
            month: 'Este Mes',
            year: 'Este Año',
            all: 'Histórico'
        };
        return labels[period] || labels.week;
    };

    /**
     * Render statistics HTML
     * @param {Object} stats - Calculated statistics
     * @returns {string} HTML string
     */
    const renderStatsHTML = (stats) => {
        return `
            <div style="margin-bottom: var(--space-xl);">
                <h3 style="font-size: var(--font-size-xl); font-weight: 600; margin-bottom: var(--space-lg); color: var(--color-text-primary);">
                    ${stats.periodLabel}
                </h3>
                
                <!-- Main Stats Grid -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-label">Entrenamientos</div>
                        <div class="stat-value">${stats.totalSessions}</div>
                        <div class="stat-change">${stats.sessionsPerWeek} por semana</div>
                    </div>
                    
                    <div class="stat-card" style="background: linear-gradient(135deg, var(--color-secondary) 0%, #db2777 100%);">
                        <div class="stat-label">Ejercicios</div>
                        <div class="stat-value">${stats.totalExercises}</div>
                        <div class="stat-change">${stats.totalSets} series totales</div>
                    </div>
                    
                    <div class="stat-card" style="background: linear-gradient(135deg, var(--color-success) 0%, #059669 100%);">
                        <div class="stat-label">Volumen Total</div>
                        <div class="stat-value">${formatNumber(stats.totalVolume)}</div>
                        <div class="stat-change">kg levantados</div>
                    </div>
                    
                    ${stats.averageDuration > 0 ? `
                        <div class="stat-card" style="background: linear-gradient(135deg, var(--color-warning) 0%, #d97706 100%);">
                            <div class="stat-label">Duración Media</div>
                            <div class="stat-value">${stats.averageDuration}</div>
                            <div class="stat-change">minutos</div>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- Most Used Exercises -->
            ${stats.mostUsedExercises.length > 0 ? `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Ejercicios Más Usados</h3>
                    </div>
                    <div class="card-body">
                        <div style="display: flex; flex-direction: column; gap: var(--space-md);">
                            ${stats.mostUsedExercises.map((exercise, index) => `
                                <div style="display: flex; align-items: center; gap: var(--space-md);">
                                    <div style="
                                        width: 32px;
                                        height: 32px;
                                        border-radius: var(--radius-full);
                                        background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
                                        color: white;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        font-weight: 700;
                                        font-size: var(--font-size-sm);
                                    ">
                                        ${index + 1}
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="font-weight: 600; color: var(--color-text-primary);">
                                            ${exercise.name}
                                        </div>
                                        <div style="font-size: var(--font-size-sm); color: var(--color-text-tertiary);">
                                            ${exercise.count} ${exercise.count === 1 ? 'vez' : 'veces'}
                                        </div>
                                    </div>
                                    <div style="
                                        width: ${Math.min(100, (exercise.count / stats.mostUsedExercises[0].count) * 100)}%;
                                        height: 8px;
                                        background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
                                        border-radius: var(--radius-full);
                                    "></div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            ` : ''}
            
            <!-- Activity Timeline -->
            ${renderActivityTimeline(stats)}
        `;
    };

    /**
     * Render activity timeline
     * @param {Object} stats - Statistics object
     * @returns {string} HTML string
     */
    const renderActivityTimeline = (stats) => {
        if (stats.totalSessions === 0) return '';

        const sessions = StorageService.getSessions();
        const recentSessions = filterSessionsByPeriod(sessions, currentPeriod)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);

        return `
            <div class="card" style="margin-top: var(--space-xl);">
                <div class="card-header">
                    <h3 class="card-title">Actividad Reciente</h3>
                </div>
                <div class="card-body">
                    <div style="display: flex; flex-direction: column; gap: var(--space-md);">
                        ${recentSessions.map(session => {
            const exerciseCount = session.exercises?.length || 0;
            const setCount = (session.exercises || []).reduce((sum, ex) =>
                sum + (ex.sets?.length || 0), 0
            );

            return `
                                <div style="
                                    padding: var(--space-md);
                                    background: var(--color-bg-secondary);
                                    border-radius: var(--radius-md);
                                    border-left: 3px solid var(--color-primary);
                                ">
                                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--space-sm);">
                                        <div>
                                            <div style="font-weight: 600; color: var(--color-text-primary);">
                                                ${UIUtils.formatDate(session.date, 'long')}
                                            </div>
                                            <div style="font-size: var(--font-size-sm); color: var(--color-text-tertiary);">
                                                ${UIUtils.getRelativeTime(session.createdAt)}
                                            </div>
                                        </div>
                                        ${session.duration ? `
                                            <div style="
                                                padding: var(--space-xs) var(--space-sm);
                                                background: var(--color-primary);
                                                color: white;
                                                border-radius: var(--radius-md);
                                                font-size: var(--font-size-xs);
                                                font-weight: 600;
                                            ">
                                                ${session.duration} min
                                            </div>
                                        ` : ''}
                                    </div>
                                    <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                                        ${exerciseCount} ejercicio${exerciseCount !== 1 ? 's' : ''} • ${setCount} serie${setCount !== 1 ? 's' : ''}
                                    </div>
                                </div>
                            `;
        }).join('')}
                    </div>
                </div>
            </div>
        `;
    };

    /**
     * Format large numbers with separators
     * @param {number} num - Number to format
     * @returns {string} Formatted number
     */
    const formatNumber = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toFixed(0);
    };

    // Public API
    return {
        init,
        renderStats
    };
})();

// Make it available globally
window.StatsModule = StatsModule;
