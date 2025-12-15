/**
 * Diary Module - Training Session Management
 * 
 * Implements the same logic and layout as TrainTracker's diary:
 * - Sessions with exercises and sets (kg, reps, rir)
 * - Mobile: Cards layout for sets
 * - Desktop: Table layout for sets
 * - Set validation: kg, reps, rir are mandatory and cannot be 0
 * - Exercise completion: at least one set, all sets valid
 * - Session completion: all exercises completed
 * - Full CRUD for sets
 * - Exercise reordering
 * - Exercise notes
 * - Rest timer
 * - Previous week data comparison
 * - Progress indicators
 */

const DiaryModule = (() => {
    /**
     * Generate unique ID
     */
    const generateId = () => {
        return StorageService.generateId();
    };

    /**
     * Get all sessions from storage
     */
    const getSessions = () => {
        return StorageService.getSessions();
    };

    /**
     * Save sessions to storage
     */
    const saveSessions = (sessions) => {
        const currentSessions = StorageService.getSessions();
        const newSessionIds = new Set(sessions.map(s => s.id));
        
        // Delete sessions that are no longer in the list
        currentSessions.forEach(session => {
            if (!newSessionIds.has(session.id)) {
                StorageService.deleteSession(session.id);
            }
        });
        
        // Save or update each session
        sessions.forEach(session => {
            const existing = StorageService.getSession(session.id);
            if (existing) {
                StorageService.updateSession(session.id, session);
            } else {
                StorageService.saveSession(session);
            }
        });
        
        return true;
    };

    /**
     * Validate if a set is complete (has kg, reps, rir and none are 0)
     */
    const isSetComplete = (set) => {
        if (!set) return false;
        const kg = parseFloat(set.kg) || 0;
        const reps = parseFloat(set.reps) || 0;
        const rir = parseFloat(set.rir) || 0;
        return kg > 0 && reps > 0 && rir >= 0;
    };

    /**
     * Validate if an exercise is complete
     */
    const isExerciseComplete = (exercise) => {
        if (!exercise || !exercise.sets || exercise.sets.length === 0) {
            return false;
        }
        return exercise.sets.every(set => isSetComplete(set));
    };

    /**
     * Validate if a session is complete
     */
    const isSessionComplete = (session) => {
        if (!session || !session.exercises || session.exercises.length === 0) {
            return false;
        }
        return session.exercises.every(ex => isExerciseComplete(ex));
    };

    /**
     * Get exercise note from storage
     */
    const getExerciseNote = (sessionId, exerciseId) => {
        try {
            const notes = JSON.parse(localStorage.getItem('exercise_notes') || '{}');
            return notes[`${sessionId}_${exerciseId}`] || null;
        } catch {
            return null;
        }
    };

    /**
     * Save exercise note
     */
    const saveExerciseNote = (sessionId, exerciseId, note) => {
        try {
            const notes = JSON.parse(localStorage.getItem('exercise_notes') || '{}');
            if (note && note.trim()) {
                notes[`${sessionId}_${exerciseId}`] = note.trim();
            } else {
                delete notes[`${sessionId}_${exerciseId}`];
            }
            localStorage.setItem('exercise_notes', JSON.stringify(notes));
            return true;
        } catch {
            return false;
        }
    };

    /**
     * Get previous session data for comparison
     */
    const getPreviousSessionData = (currentSession, exerciseName, setNumber) => {
        const sessions = getSessions();
        const currentDate = new Date(currentSession.date);
        
        // Find previous session with same exercise
        for (let i = sessions.length - 1; i >= 0; i--) {
            const session = sessions[i];
            if (session.id === currentSession.id) continue;
            
            const sessionDate = new Date(session.date);
            if (sessionDate >= currentDate) continue;
            
            const exercise = session.exercises?.find(e => e.name === exerciseName);
            if (!exercise) continue;
            
            const set = exercise.sets?.find(s => s.setNumber === setNumber);
            if (set && (set.kg || set.reps || set.rir)) {
                return set;
            }
        }
        
        return null;
    };

    /**
     * Calculate progress text
     */
    const getProgressText = (session, exercise, set) => {
        const prevSet = getPreviousSessionData(session, exercise.name, set.setNumber || 1);
        
        if (!prevSet) {
            return '<span class="progress-text">Primera sesión</span>';
        }
        
        const prevKg = parseFloat(prevSet.kg) || 0;
        const currKg = parseFloat(set.kg) || 0;
        const prevReps = parseFloat(prevSet.reps) || 0;
        const currReps = parseFloat(set.reps) || 0;
        const prevRir = parseFloat(prevSet.rir) || 0;
        const currRir = parseFloat(set.rir) || 0;
        
        if (!currKg && !currReps) {
            return '<span class="progress-text">Sin datos</span>';
        }
        
        if (currKg > prevKg) {
            return `<span class="progress-text progress-up">+${(currKg - prevKg).toFixed(1)} kg</span>`;
        }
        if (currKg < prevKg) {
            return `<span class="progress-text progress-down">-${(prevKg - currKg).toFixed(1)} kg</span>`;
        }
        if (currReps > prevReps) {
            return `<span class="progress-text progress-up">Más reps: ${prevReps} → ${currReps}</span>`;
        }
        if (currReps < prevReps) {
            return `<span class="progress-text progress-down">Menos reps: ${prevReps} → ${currReps}</span>`;
        }
        if (currRir < prevRir) {
            return `<span class="progress-text progress-up">Menos RIR: ${prevRir} → ${currRir}</span>`;
        }
        if (currRir > prevRir) {
            return `<span class="progress-text progress-down">Más RIR: ${prevRir} → ${currRir}</span>`;
        }
        
        return '<span class="progress-text">Sin cambio</span>';
    };

    /**
     * Initialize the diary module
     */
    const init = () => {
        renderDiary();
        setupEventListeners();
    };

    /**
     * Setup event listeners
     */
    const setupEventListeners = () => {
        const addSessionBtn = document.getElementById('addSessionBtn');
        if (addSessionBtn) {
            addSessionBtn.addEventListener('click', showAddSessionModal);
        }
    };

    /**
     * Render diary with all sessions
     */
    const renderDiary = () => {
        const container = document.getElementById('diaryContent');
        if (!container) return;

        const sessions = getSessions();

        if (sessions.length === 0) {
            UIUtils.showEmptyState(
                container,
                '📝',
                'No hay entrenamientos registrados',
                'Crea una nueva sesión para comenzar'
            );
            return;
        }

        // Sort sessions by date (newest first)
        const sortedSessions = [...sessions].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });

        container.innerHTML = sortedSessions.map(session =>
            createSessionCard(session)
        ).join('');

        attachDiaryEventListeners();
    };

    /**
     * Create HTML for a session card
     */
    const createSessionCard = (session) => {
        const isComplete = isSessionComplete(session);
        const completedClass = isComplete ? 'session-completed' : '';
        const dateStr = new Date(session.date).toLocaleDateString('es-ES', { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short' 
        });

        return `
            <article class="card session-card ${completedClass}" data-session-id="${session.id}">
                <div class="session-header">
                    <div class="session-title-wrap">
                        <div class="session-title">${escapeHtml(session.name)}</div>
                        <div class="session-date">${dateStr}</div>
                        ${isComplete ? '<span class="completed-badge">Completada ✓</span>' : ''}
                    </div>
                    <div class="session-tools">
                        <button class="icon-btn toggle-complete" data-id="${session.id}" 
                                title="${isComplete ? 'Marcar como incompleta' : 'Marcar como completada'}"
                                aria-pressed="${isComplete}">
                            ${isComplete ? '✓' : '○'}
                        </button>
                        <button class="icon-btn edit-session" data-id="${session.id}" title="Editar sesión">✏️</button>
                        <button class="icon-btn add-exercise" data-session-id="${session.id}" title="Añadir ejercicio">+ Ejercicio</button>
                        <button class="icon-btn delete-session" data-id="${session.id}" title="Eliminar sesión">✕</button>
                    </div>
                </div>
                
                <div class="session-body">
                    ${session.exercises && session.exercises.length > 0 ? `
                        <div class="exercises-list">
                            ${session.exercises.map((exercise, index) => 
                                createExerciseCard(session, exercise, index, session.exercises.length)
                            ).join('')}
                        </div>
                    ` : '<p style="color: var(--color-text-tertiary); padding: var(--space-lg); text-align: center;">Sin ejercicios</p>'}
                </div>
            </article>
        `;
    };

    /**
     * Create HTML for an exercise card
     */
    const createExerciseCard = (session, exercise, index, totalExercises) => {
        const isExComplete = isExerciseComplete(exercise);
        const exerciseClass = isExComplete ? 'exercise-complete' : '';
        const isDesktop = window.matchMedia('(min-width: 768px)').matches;
        const hasNote = getExerciseNote(session.id, exercise.id);

        return `
            <section class="exercise-card ${exerciseClass}" data-exercise-id="${exercise.id}">
                <div class="exercise-head">
                    <div class="exercise-name" data-session-id="${session.id}" data-exercise-id="${exercise.id}">
                        ${escapeHtml(exercise.name)}
                    </div>
                    <div class="exercise-actions">
                        ${totalExercises >= 2 ? `
                            <button class="icon-btn exercise-reorder-up" 
                                    data-session-id="${session.id}" 
                                    data-exercise-id="${exercise.id}"
                                    data-direction="up"
                                    ${index === 0 ? 'disabled' : ''}
                                    title="Mover arriba">↑</button>
                            <button class="icon-btn exercise-reorder-down" 
                                    data-session-id="${session.id}" 
                                    data-exercise-id="${exercise.id}"
                                    data-direction="down"
                                    ${index === totalExercises - 1 ? 'disabled' : ''}
                                    title="Mover abajo">↓</button>
                        ` : ''}
                        <button class="icon-btn add-set" 
                                data-session-id="${session.id}" 
                                data-exercise-id="${exercise.id}"
                                title="Añadir set">+ Set</button>
                        <button class="icon-btn delete-exercise" 
                                data-session-id="${session.id}" 
                                data-exercise-id="${exercise.id}"
                                title="Eliminar ejercicio">✕</button>
                    </div>
                </div>
                
                <button class="exercise-note-btn ${hasNote ? 'has-note' : ''}" 
                        data-session-id="${session.id}" 
                        data-exercise-id="${exercise.id}">
                    ${hasNote ? '📝' : '+ Nota'}
                </button>
                
                ${hasNote ? `
                    <div class="exercise-note-display">
                        <div class="exercise-note-text">${escapeHtml(getExerciseNote(session.id, exercise.id)).replace(/\n/g, '<br>')}</div>
                        <div class="exercise-note-actions">
                            <button class="icon-btn edit-note" data-session-id="${session.id}" data-exercise-id="${exercise.id}">✏️</button>
                            <button class="icon-btn delete-note" data-session-id="${session.id}" data-exercise-id="${exercise.id}">🗑️</button>
                        </div>
                    </div>
                ` : ''}
                
                ${isDesktop ? createExerciseTable(session, exercise) : createExerciseCards(session, exercise)}
            </section>
        `;
    };

    /**
     * Create table layout for desktop
     */
    const createExerciseTable = (session, exercise) => {
        return `
            <div class="table-container">
                <table class="sets-table">
                    <thead>
                        <tr>
                            <th>Set</th>
                            <th>KG</th>
                            <th>Reps</th>
                            <th>RIR</th>
                            <th>Progreso</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${exercise.sets && exercise.sets.length > 0 ? exercise.sets.map((set, index) => 
                            createSetRow(session, exercise, set, index + 1)
                        ).join('') : ''}
                    </tbody>
                </table>
            </div>
        `;
    };

    /**
     * Create cards layout for mobile
     */
    const createExerciseCards = (session, exercise) => {
        return `
            <div class="sets-container">
                ${exercise.sets && exercise.sets.length > 0 ? exercise.sets.map((set, index) => 
                    createSetCard(session, exercise, set, index + 1)
                ).join('') : ''}
            </div>
        `;
    };

    /**
     * Create table row for a set (desktop)
     */
    const createSetRow = (session, exercise, set, setNumber) => {
        const isComplete = isSetComplete(set);
        const setClass = isComplete ? 'set-complete' : 'set-incomplete';
        const progressText = getProgressText(session, exercise, set);

        return `
            <tr class="set-row ${setClass}" data-set-id="${set.id}">
                <td class="set-num">${setNumber}</td>
                <td>
                    <input type="number" 
                           class="form-input set-kg" 
                           data-session-id="${session.id}"
                           data-exercise-id="${exercise.id}"
                           data-set-id="${set.id}"
                           data-field="kg"
                           placeholder="0"
                           value="${set.kg || ''}"
                           min="0" 
                           step="0.5" 
                           inputmode="decimal">
                </td>
                <td>
                    <input type="number" 
                           class="form-input set-reps" 
                           data-session-id="${session.id}"
                           data-exercise-id="${exercise.id}"
                           data-set-id="${set.id}"
                           data-field="reps"
                           placeholder="0"
                           value="${set.reps || ''}"
                           min="1" 
                           step="1"
                           inputmode="numeric">
                </td>
                <td>
                    <input type="number" 
                           class="form-input set-rir" 
                           data-session-id="${session.id}"
                           data-exercise-id="${exercise.id}"
                           data-set-id="${set.id}"
                           data-field="rir"
                           placeholder="0"
                           value="${set.rir || ''}"
                           min="0" 
                           max="10" 
                           step="0.5"
                           inputmode="decimal">
                </td>
                <td class="progress-cell">${progressText}</td>
                <td class="set-actions">
                    <button class="icon-btn rest-timer" 
                            data-session-id="${session.id}"
                            data-exercise-id="${exercise.id}"
                            data-set-id="${set.id}"
                            title="Temporizador de descanso">⏳</button>
                    <button class="icon-btn prev-week-data" 
                            data-session-id="${session.id}"
                            data-exercise-id="${exercise.id}"
                            data-set-id="${set.id}"
                            title="Ver datos de la semana pasada">👁️</button>
                    <button class="icon-btn delete-set" 
                            data-session-id="${session.id}"
                            data-exercise-id="${exercise.id}"
                            data-set-id="${set.id}"
                            title="Eliminar set">✕</button>
                </td>
            </tr>
        `;
    };

    /**
     * Create card for a set (mobile)
     */
    const createSetCard = (session, exercise, set, setNumber) => {
        const isComplete = isSetComplete(set);
        const setClass = isComplete ? 'set-complete' : 'set-incomplete';
        const progressText = getProgressText(session, exercise, set);

        return `
            <div class="set-card ${setClass}" data-set-id="${set.id}">
                <div class="set-header">
                    <div class="set-number">Set ${setNumber}</div>
                    <div class="set-header-actions">
                        <button class="icon-btn rest-timer" 
                                data-session-id="${session.id}"
                                data-exercise-id="${exercise.id}"
                                data-set-id="${set.id}"
                                title="Temporizador de descanso">⏳</button>
                        <button class="icon-btn prev-week-data" 
                                data-session-id="${session.id}"
                                data-exercise-id="${exercise.id}"
                                data-set-id="${set.id}"
                                title="Ver datos de la semana pasada">👁️</button>
                        <button class="icon-btn delete-set" 
                                data-session-id="${session.id}"
                                data-exercise-id="${exercise.id}"
                                data-set-id="${set.id}"
                                title="Eliminar set">✕</button>
                    </div>
                </div>
                <div class="set-inputs">
                    <div class="set-input-group">
                        <label class="set-input-label">KG</label>
                        <input type="number" 
                               class="form-input set-kg" 
                               data-session-id="${session.id}"
                               data-exercise-id="${exercise.id}"
                               data-set-id="${set.id}"
                               data-field="kg"
                               placeholder="0"
                               value="${set.kg || ''}"
                               min="0" 
                               step="0.5" 
                               inputmode="decimal">
                    </div>
                    <div class="set-input-group">
                        <label class="set-input-label">Reps</label>
                        <input type="number" 
                               class="form-input set-reps" 
                               data-session-id="${session.id}"
                               data-exercise-id="${exercise.id}"
                               data-set-id="${set.id}"
                               data-field="reps"
                               placeholder="0"
                               value="${set.reps || ''}"
                               min="1" 
                               step="1"
                               inputmode="numeric">
                    </div>
                    <div class="set-input-group">
                        <label class="set-input-label">RIR</label>
                        <input type="number" 
                               class="form-input set-rir" 
                               data-session-id="${session.id}"
                               data-exercise-id="${exercise.id}"
                               data-set-id="${set.id}"
                               data-field="rir"
                               placeholder="0"
                               value="${set.rir || ''}"
                               min="0" 
                               max="10" 
                               step="0.5"
                               inputmode="decimal">
                    </div>
                </div>
                <div class="set-progress">${progressText}</div>
            </div>
        `;
    };

    /**
     * Escape HTML to prevent XSS
     */
    const escapeHtml = (text) => {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    /**
     * Attach event listeners to diary elements
     */
    const attachDiaryEventListeners = () => {
        // Use event delegation for dynamic content
        const container = document.getElementById('diaryContent');
        if (!container) return;

        container.addEventListener('click', (e) => {
            // Toggle session completion
            if (e.target.closest('.toggle-complete')) {
                const sessionId = e.target.closest('.toggle-complete').dataset.id;
                toggleSessionComplete(sessionId);
            }
            // Edit session
            else if (e.target.closest('.edit-session')) {
                const sessionId = e.target.closest('.edit-session').dataset.id;
                showEditSessionModal(sessionId);
            }
            // Delete session
            else if (e.target.closest('.delete-session')) {
                const sessionId = e.target.closest('.delete-session').dataset.id;
                confirmDeleteSession(sessionId);
            }
            // Add exercise
            else if (e.target.closest('.add-exercise')) {
                const sessionId = e.target.closest('.add-exercise').dataset.sessionId;
                showAddExerciseModal(sessionId);
            }
            // Delete exercise
            else if (e.target.closest('.delete-exercise')) {
                const btn = e.target.closest('.delete-exercise');
                const sessionId = btn.dataset.sessionId;
                const exerciseId = btn.dataset.exerciseId;
                confirmDeleteExercise(sessionId, exerciseId);
            }
            // Add set
            else if (e.target.closest('.add-set')) {
                const btn = e.target.closest('.add-set');
                const sessionId = btn.dataset.sessionId;
                const exerciseId = btn.dataset.exerciseId;
                addSet(sessionId, exerciseId);
            }
            // Delete set
            else if (e.target.closest('.delete-set')) {
                const btn = e.target.closest('.delete-set');
                const sessionId = btn.dataset.sessionId;
                const exerciseId = btn.dataset.exerciseId;
                const setId = btn.dataset.setId;
                deleteSet(sessionId, exerciseId, setId);
            }
            // Exercise note
            else if (e.target.closest('.exercise-note-btn')) {
                const btn = e.target.closest('.exercise-note-btn');
                const sessionId = btn.dataset.sessionId;
                const exerciseId = btn.dataset.exerciseId;
                showExerciseNoteModal(sessionId, exerciseId);
            }
            // Edit note
            else if (e.target.closest('.edit-note')) {
                const btn = e.target.closest('.edit-note');
                const sessionId = btn.dataset.sessionId;
                const exerciseId = btn.dataset.exerciseId;
                showExerciseNoteModal(sessionId, exerciseId);
            }
            // Delete note
            else if (e.target.closest('.delete-note')) {
                const btn = e.target.closest('.delete-note');
                const sessionId = btn.dataset.sessionId;
                const exerciseId = btn.dataset.exerciseId;
                deleteExerciseNote(sessionId, exerciseId);
            }
            // Reorder exercise
            else if (e.target.closest('.exercise-reorder-up, .exercise-reorder-down')) {
                const btn = e.target.closest('.exercise-reorder-up, .exercise-reorder-down');
                const sessionId = btn.dataset.sessionId;
                const exerciseId = btn.dataset.exerciseId;
                const direction = btn.dataset.direction;
                reorderExercise(sessionId, exerciseId, direction);
            }
            // Rest timer
            else if (e.target.closest('.rest-timer')) {
                UIUtils.showToast({
                    message: 'Temporizador de descanso próximamente',
                    type: 'info'
                });
            }
            // Previous week data
            else if (e.target.closest('.prev-week-data')) {
                const btn = e.target.closest('.prev-week-data');
                const sessionId = btn.dataset.sessionId;
                const exerciseId = btn.dataset.exerciseId;
                const setId = btn.dataset.setId;
                togglePreviousWeekData(sessionId, exerciseId, setId, btn);
            }
        });

        // Input events for set values
        container.addEventListener('input', (e) => {
            if (e.target.classList.contains('set-kg') || 
                e.target.classList.contains('set-reps') || 
                e.target.classList.contains('set-rir')) {
                const sessionId = e.target.dataset.sessionId;
                const exerciseId = e.target.dataset.exerciseId;
                const setId = e.target.dataset.setId;
                const field = e.target.dataset.field;
                const value = e.target.value.trim();
                
                updateSet(sessionId, exerciseId, setId, field, value);
            }
        });

        // Blur events for validation
        container.addEventListener('blur', (e) => {
            if (e.target.classList.contains('set-kg') || 
                e.target.classList.contains('set-reps') || 
                e.target.classList.contains('set-rir')) {
                updateSetValidation(e.target);
            }
        }, true);
    };

    /**
     * Update set value
     */
    const updateSet = (sessionId, exerciseId, setId, field, value) => {
        const sessions = getSessions();
        const session = sessions.find(s => s.id === sessionId);
        if (!session) return;

        const exercise = session.exercises.find(e => e.id === exerciseId);
        if (!exercise) return;

        const set = exercise.sets.find(s => s.id === setId);
        if (!set) return;

        // Update value
        set[field] = value;
        set.setNumber = set.setNumber || exercise.sets.indexOf(set) + 1;

        // Save
        saveSessions(sessions);

        // Update validation UI
        updateSetValidation(document.querySelector(`[data-set-id="${setId}"][data-field="${field}"]`));

        // Update completion status
        updateCompletionStatus(sessionId);

        // Update progress text
        updateProgressText(sessionId, exerciseId, setId);
    };

    /**
     * Update set validation visual state
     */
    const updateSetValidation = (input) => {
        if (!input) return;
        
        const sessionId = input.dataset.sessionId;
        const exerciseId = input.dataset.exerciseId;
        const setId = input.dataset.setId;

        const sessions = getSessions();
        const session = sessions.find(s => s.id === sessionId);
        if (!session) return;

        const exercise = session.exercises.find(e => e.id === exerciseId);
        if (!exercise) return;

        const set = exercise.sets.find(s => s.id === setId);
        if (!set) return;

        const isComplete = isSetComplete(set);
        const setRow = input.closest('.set-row, .set-card');
        
        if (setRow) {
            setRow.classList.remove('set-complete', 'set-incomplete');
            setRow.classList.add(isComplete ? 'set-complete' : 'set-incomplete');

            const inputs = setRow.querySelectorAll('.set-kg, .set-reps, .set-rir');
            inputs.forEach(inp => {
                inp.classList.remove('set-invalid');
                if (!isComplete) {
                    const field = inp.dataset.field;
                    const val = parseFloat(set[field]) || 0;
                    if (val === 0 || (field === 'rir' && val < 0)) {
                        inp.classList.add('set-invalid');
                    }
                }
            });
        }
    };

    /**
     * Update progress text for a set
     */
    const updateProgressText = (sessionId, exerciseId, setId) => {
        const sessions = getSessions();
        const session = sessions.find(s => s.id === sessionId);
        if (!session) return;

        const exercise = session.exercises.find(e => e.id === exerciseId);
        if (!exercise) return;

        const set = exercise.sets.find(s => s.id === setId);
        if (!set) return;

        const progressText = getProgressText(session, exercise, set);
        const progressEl = document.querySelector(`[data-set-id="${setId}"] .progress-cell, [data-set-id="${setId}"] .set-progress`);
        if (progressEl) {
            progressEl.innerHTML = progressText;
        }
    };

    /**
     * Update completion status for exercise and session
     */
    const updateCompletionStatus = (sessionId) => {
        const sessions = getSessions();
        const session = sessions.find(s => s.id === sessionId);
        if (!session) return;

        // Update exercise completion
        session.exercises.forEach(exercise => {
            const isExComplete = isExerciseComplete(exercise);
            const exerciseCard = document.querySelector(`[data-exercise-id="${exercise.id}"]`);
            if (exerciseCard) {
                exerciseCard.classList.remove('exercise-complete');
                if (isExComplete) {
                    exerciseCard.classList.add('exercise-complete');
                }
            }
        });

        // Update session completion
        const isComplete = isSessionComplete(session);
        const sessionCard = document.querySelector(`[data-session-id="${sessionId}"]`);
        const toggleBtn = sessionCard?.querySelector('.toggle-complete');
        
        if (sessionCard) {
            sessionCard.classList.remove('session-completed');
            if (isComplete) {
                sessionCard.classList.add('session-completed');
            }
        }

        if (toggleBtn) {
            toggleBtn.setAttribute('aria-pressed', isComplete);
            toggleBtn.textContent = isComplete ? '✓' : '○';
            toggleBtn.title = isComplete ? 'Marcar como incompleta' : 'Marcar como completada';
            
            // Update badge
            const titleWrap = sessionCard?.querySelector('.session-title-wrap');
            if (titleWrap) {
                let badge = titleWrap.querySelector('.completed-badge');
                if (isComplete && !badge) {
                    badge = document.createElement('span');
                    badge.className = 'completed-badge';
                    badge.textContent = 'Completada ✓';
                    titleWrap.appendChild(badge);
                } else if (!isComplete && badge) {
                    badge.remove();
                }
            }
        }
    };

    /**
     * Add a new set to an exercise
     */
    const addSet = (sessionId, exerciseId) => {
        const sessions = getSessions();
        const session = sessions.find(s => s.id === sessionId);
        if (!session) return;

        const exercise = session.exercises.find(e => e.id === exerciseId);
        if (!exercise) return;

        if (!exercise.sets) {
            exercise.sets = [];
        }

        const newSet = {
            id: generateId(),
            setNumber: exercise.sets.length + 1,
            kg: '',
            reps: '',
            rir: ''
        };

        exercise.sets.push(newSet);
        saveSessions(sessions);

        renderDiary();
    };

    /**
     * Delete a set
     */
    const deleteSet = (sessionId, exerciseId, setId) => {
        const sessions = getSessions();
        const session = sessions.find(s => s.id === sessionId);
        if (!session) return;

        const exercise = session.exercises.find(e => e.id === exerciseId);
        if (!exercise) return;

        if (exercise.sets.length <= 1) {
            UIUtils.showToast({
                message: 'Debe haber al menos un set',
                type: 'warning'
            });
            return;
        }

        exercise.sets = exercise.sets.filter(s => s.id !== setId);
        // Renumber sets
        exercise.sets.forEach((s, i) => {
            s.setNumber = i + 1;
        });
        saveSessions(sessions);

        renderDiary();
    };

    /**
     * Reorder exercise
     */
    const reorderExercise = (sessionId, exerciseId, direction) => {
        const sessions = getSessions();
        const session = sessions.find(s => s.id === sessionId);
        if (!session) return;

        const exIndex = session.exercises.findIndex(e => e.id === exerciseId);
        if (exIndex === -1) return;

        const newIndex = direction === 'up' ? exIndex - 1 : exIndex + 1;
        if (newIndex < 0 || newIndex >= session.exercises.length) return;

        [session.exercises[exIndex], session.exercises[newIndex]] = 
        [session.exercises[newIndex], session.exercises[exIndex]];

        saveSessions(sessions);
        renderDiary();
    };

    /**
     * Toggle previous week data
     */
    const togglePreviousWeekData = (sessionId, exerciseId, setId, button) => {
        // Implementation for showing previous week data
        UIUtils.showToast({
            message: 'Función de semana pasada próximamente',
            type: 'info'
        });
    };

    /**
     * Toggle session completion
     */
    const toggleSessionComplete = (sessionId) => {
        const sessions = getSessions();
        const session = sessions.find(s => s.id === sessionId);
        if (!session) return;

        const isActuallyComplete = isSessionComplete(session);
        
        if (!isActuallyComplete && !session.completed) {
            UIUtils.showToast({
                message: 'Completa todos los ejercicios y sets antes de marcar la sesión como completada',
                type: 'warning'
            });
            return;
        }

        session.completed = !session.completed;
        saveSessions(sessions);
        renderDiary();
    };

    /**
     * Show modal to add a new session
     */
    const showAddSessionModal = () => {
        const today = new Date().toISOString().split('T')[0];
        
        UIUtils.showModal({
            title: 'Nueva Sesión',
            content: `
                <div class="form-group">
                    <label class="form-label" for="sessionName">Nombre de la sesión</label>
                    <input type="text" class="form-input" id="sessionName" placeholder="Ej. Pecho y Tríceps" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="sessionDate">Fecha</label>
                    <input type="date" class="form-input" id="sessionDate" value="${today}" required>
                </div>
            `,
            actions: [
                {
                    id: 'cancel',
                    label: 'Cancelar',
                    className: 'btn-secondary',
                    handler: () => {}
                },
                {
                    id: 'save',
                    label: 'Guardar',
                    className: 'btn-primary',
                    handler: () => {
                        const name = document.getElementById('sessionName').value.trim();
                        const date = document.getElementById('sessionDate').value;

                        if (!name) {
                            UIUtils.showToast({
                                message: 'El nombre es obligatorio',
                                type: 'error'
                            });
                            return;
                        }

                        const sessions = getSessions();
                        const newSession = {
                            id: generateId(),
                            name,
                            date,
                            exercises: [],
                            completed: false
                        };

                        sessions.push(newSession);
                        saveSessions(sessions);
                        
                        UIUtils.showToast({
                            message: 'Sesión creada correctamente',
                            type: 'success'
                        });

                        renderDiary();
                    }
                }
            ]
        });
    };

    /**
     * Show modal to edit a session
     */
    const showEditSessionModal = (sessionId) => {
        const sessions = getSessions();
        const session = sessions.find(s => s.id === sessionId);
        if (!session) return;

        UIUtils.showModal({
            title: 'Editar Sesión',
            content: `
                <div class="form-group">
                    <label class="form-label" for="editSessionName">Nombre de la sesión</label>
                    <input type="text" class="form-input" id="editSessionName" value="${escapeHtml(session.name)}" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="editSessionDate">Fecha</label>
                    <input type="date" class="form-input" id="editSessionDate" value="${session.date}" required>
                </div>
            `,
            actions: [
                {
                    id: 'cancel',
                    label: 'Cancelar',
                    className: 'btn-secondary',
                    handler: () => {}
                },
                {
                    id: 'save',
                    label: 'Guardar',
                    className: 'btn-primary',
                    handler: () => {
                        const name = document.getElementById('editSessionName').value.trim();
                        const date = document.getElementById('editSessionDate').value;

                        if (!name) {
                            UIUtils.showToast({
                                message: 'El nombre es obligatorio',
                                type: 'error'
                            });
                            return;
                        }

                        session.name = name;
                        session.date = date;
                        saveSessions(sessions);
                        
                        UIUtils.showToast({
                            message: 'Sesión actualizada',
                            type: 'success'
                        });

                        renderDiary();
                    }
                }
            ]
        });
    };

    /**
     * Show modal to add an exercise
     */
    const showAddExerciseModal = (sessionId) => {
        UIUtils.showModal({
            title: 'Añadir Ejercicio',
            content: `
                <div class="form-group">
                    <label class="form-label" for="exerciseName">Nombre del ejercicio</label>
                    <input type="text" class="form-input" id="exerciseName" placeholder="Ej. Press banca" required>
                </div>
            `,
            actions: [
                {
                    id: 'cancel',
                    label: 'Cancelar',
                    className: 'btn-secondary',
                    handler: () => {}
                },
                {
                    id: 'save',
                    label: 'Guardar',
                    className: 'btn-primary',
                    handler: () => {
                        const name = document.getElementById('exerciseName').value.trim();

                        if (!name) {
                            UIUtils.showToast({
                                message: 'El nombre es obligatorio',
                                type: 'error'
                            });
                            return;
                        }

                        const sessions = getSessions();
                        const session = sessions.find(s => s.id === sessionId);
                        if (!session) return;

                        const newExercise = {
                            id: generateId(),
                            name,
                            sets: [{
                                id: generateId(),
                                setNumber: 1,
                                kg: '',
                                reps: '',
                                rir: ''
                            }]
                        };

                        session.exercises = session.exercises || [];
                        session.exercises.push(newExercise);
                        saveSessions(sessions);
                        
                        UIUtils.showToast({
                            message: 'Ejercicio añadido',
                            type: 'success'
                        });

                        renderDiary();
                    }
                }
            ]
        });
    };

    /**
     * Show modal for exercise note
     */
    const showExerciseNoteModal = (sessionId, exerciseId) => {
        const sessions = getSessions();
        const session = sessions.find(s => s.id === sessionId);
        if (!session) return;
        const exercise = session.exercises.find(e => e.id === exerciseId);
        if (!exercise) return;

        const currentNote = getExerciseNote(sessionId, exerciseId) || '';

        UIUtils.showModal({
            title: `Nota: ${exercise.name}`,
            content: `
                <div class="form-group">
                    <label class="form-label" for="exerciseNoteText">Nota (puedes usar saltos de línea)</label>
                    <textarea class="form-textarea" id="exerciseNoteText" rows="6" placeholder="Escribe tu nota aquí...">${escapeHtml(currentNote)}</textarea>
                </div>
            `,
            actions: [
                {
                    id: 'cancel',
                    label: 'Cancelar',
                    className: 'btn-secondary',
                    handler: () => {}
                },
                {
                    id: 'save',
                    label: 'Guardar',
                    className: 'btn-primary',
                    handler: () => {
                        const note = document.getElementById('exerciseNoteText').value;
                        saveExerciseNote(sessionId, exerciseId, note);
                        
                        UIUtils.showToast({
                            message: 'Nota guardada',
                            type: 'success'
                        });

                        renderDiary();
                    }
                }
            ]
        });
    };

    /**
     * Delete exercise note
     */
    const deleteExerciseNote = (sessionId, exerciseId) => {
        saveExerciseNote(sessionId, exerciseId, '');
        UIUtils.showToast({
            message: 'Nota eliminada',
            type: 'success'
        });
        renderDiary();
    };

    /**
     * Confirm and delete a session
     */
    const confirmDeleteSession = (sessionId) => {
        UIUtils.confirm({
            title: 'Eliminar Sesión',
            message: '¿Estás seguro de que quieres eliminar esta sesión? Esta acción no se puede deshacer.',
            confirmText: 'Eliminar',
            cancelText: 'Cancelar',
            onConfirm: () => {
                StorageService.deleteSession(sessionId);
                
                UIUtils.showToast({
                    message: 'Sesión eliminada',
                    type: 'success'
                });

                renderDiary();
            }
        });
    };

    /**
     * Confirm and delete an exercise
     */
    const confirmDeleteExercise = (sessionId, exerciseId) => {
        UIUtils.confirm({
            title: 'Eliminar Ejercicio',
            message: '¿Estás seguro de que quieres eliminar este ejercicio? Esta acción no se puede deshacer.',
            confirmText: 'Eliminar',
            cancelText: 'Cancelar',
            onConfirm: () => {
                const sessions = getSessions();
                const session = sessions.find(s => s.id === sessionId);
                if (!session) return;

                session.exercises = session.exercises.filter(e => e.id !== exerciseId);
                saveSessions(sessions);
                
                UIUtils.showToast({
                    message: 'Ejercicio eliminado',
                    type: 'success'
                });

                renderDiary();
            }
        });
    };

    // Public API
    return {
        init,
        renderDiary
    };
})();

// Make it available globally
window.DiaryModule = DiaryModule;
