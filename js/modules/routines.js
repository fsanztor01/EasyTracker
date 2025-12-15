/**
 * Routines Module - Workout Routine Management
 * 
 * Hierarchical structure:
 * Routine → Days → Exercises → Sets → (KG, Reps, RIR)
 */

const RoutinesModule = (() => {
    let currentEditingRoutine = null;

    /**
     * Initialize the routines module
     */
    const init = () => {
        renderRoutines();
        setupEventListeners();
    };

    /**
     * Setup event listeners
     */
    const setupEventListeners = () => {
        const addRoutineBtn = document.getElementById('addRoutineBtn');
        const importRoutineBtn = document.getElementById('importRoutineBtn');

        if (addRoutineBtn) {
            addRoutineBtn.addEventListener('click', showAddRoutineModal);
        }

        if (importRoutineBtn) {
            importRoutineBtn.addEventListener('click', showImportModal);
        }
    };

    /**
     * Render all routines
     */
    const renderRoutines = () => {
        const container = document.getElementById('routinesContent');
        const routines = StorageService.getRoutines();

        if (!routines || routines.length === 0) {
            UIUtils.showEmptyState(
                container,
                '📋',
                'No hay rutinas creadas',
                'Crea tu primera rutina de entrenamiento o importa una existente'
            );
            return;
        }

        container.innerHTML = routines.map(routine =>
            createRoutineCard(routine)
        ).join('');

        attachRoutineEventListeners();
    };

    /**
     * Create HTML for a routine card with hierarchical structure
     */
    const createRoutineCard = (routine) => {
        const days = routine.days || [];
        const totalExercises = days.reduce((sum, day) =>
            sum + (day.exercises?.length || 0), 0
        );
        const totalSets = days.reduce((sum, day) => {
            const daySets = (day.exercises || []).reduce((s, ex) =>
                s + (ex.sets?.length || 0), 0
            );
            return sum + daySets;
        }, 0);

        return `
            <div class="card routine-card" style="margin-bottom: var(--space-lg);">
                <div class="card-header">
                    <div>
                        <h3 class="card-title">${routine.name}</h3>
                        ${routine.description ? `
                            <p style="color: var(--color-text-secondary); font-size: var(--font-size-sm); margin-top: var(--space-xs);">
                                ${routine.description}
                            </p>
                        ` : ''}
                    </div>
                    <div class="card-actions">
                        <button class="icon-btn use-routine" data-id="${routine.id}" title="Usar en Diario">
                            ▶️
                        </button>
                        <button class="icon-btn export-routine" data-id="${routine.id}" title="Exportar">
                            📥
                        </button>
                        <button class="icon-btn edit-routine" data-id="${routine.id}" title="Editar">
                            ✏️
                        </button>
                        <button class="icon-btn delete-routine" data-id="${routine.id}" title="Eliminar">
                            🗑️
                        </button>
                    </div>
                </div>
                
                <div class="card-body">
                    ${days.length > 0 ? `
                        <div class="routine-structure">
                            ${days.map((day, dayIndex) => `
                                <div class="routine-day" style="margin-bottom: var(--space-lg);">
                                    <div style="font-weight: var(--font-semibold); font-size: var(--font-size-lg); margin-bottom: var(--space-md); color: var(--color-text-primary);">
                                        ${day.name || `Día ${dayIndex + 1}`}
                                    </div>
                                    ${day.exercises && day.exercises.length > 0 ? `
                                        <div class="routine-exercises">
                                            ${day.exercises.map((exercise, exIndex) => `
                                                <div class="routine-exercise" style="margin-bottom: var(--space-md); padding: var(--space-md); background: var(--color-bg-secondary); border-radius: var(--radius-md); border-left: 3px solid var(--color-accent);">
                                                    <div style="font-weight: var(--font-semibold); margin-bottom: var(--space-sm); color: var(--color-text-primary);">
                                                        ${exercise.name}
                                                    </div>
                                                    ${exercise.sets && exercise.sets.length > 0 ? `
                                                        <div class="routine-sets" style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                                                            ${exercise.sets.map((set, setIndex) => `
                                                                <div style="margin-bottom: var(--space-xs);">
                                                                    Set ${setIndex + 1}: 
                                                                    ${set.kg ? `${set.kg} kg` : ''} 
                                                                    ${set.reps ? `× ${set.reps} reps` : ''} 
                                                                    ${set.rir !== null && set.rir !== undefined ? `@ RIR ${set.rir}` : ''}
                                                                </div>
                                                            `).join('')}
                                                        </div>
                                                    ` : '<p style="font-size: var(--font-size-sm); color: var(--color-text-tertiary);">Sin sets configurados</p>'}
                                                </div>
                                            `).join('')}
                                        </div>
                                    ` : '<p style="color: var(--color-text-tertiary); font-size: var(--font-size-sm);">Sin ejercicios</p>'}
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p style="color: var(--color-text-tertiary);">Sin días configurados</p>'}
                    
                    <div style="margin-top: var(--space-lg); padding-top: var(--space-md); border-top: 0.5px solid var(--color-separator); display: flex; gap: var(--space-lg); font-size: var(--font-size-sm); color: var(--color-text-tertiary);">
                        <span>📅 ${days.length} día${days.length !== 1 ? 's' : ''}</span>
                        <span>💪 ${totalExercises} ejercicio${totalExercises !== 1 ? 's' : ''}</span>
                        <span>📊 ${totalSets} set${totalSets !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            </div>
        `;
    };

    /**
     * Attach event listeners to routine cards
     */
    const attachRoutineEventListeners = () => {
        // Use routine in diary
        document.querySelectorAll('.use-routine').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const routineId = e.target.dataset.id;
                useRoutineInDiary(routineId);
            });
        });

        // Edit buttons
        document.querySelectorAll('.edit-routine').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const routineId = e.target.dataset.id;
                showEditRoutineModal(routineId);
            });
        });

        // Delete buttons
        document.querySelectorAll('.delete-routine').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const routineId = e.target.dataset.id;
                confirmDeleteRoutine(routineId);
            });
        });

        // Export buttons
        document.querySelectorAll('.export-routine').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const routineId = e.target.dataset.id;
                exportRoutine(routineId);
            });
        });
    };

    /**
     * Use routine in diary - creates sessions from routine days
     */
    const useRoutineInDiary = (routineId) => {
        const routine = StorageService.getRoutine(routineId);
        if (!routine) {
            UIUtils.showToast({ message: 'Rutina no encontrada', type: 'error' });
            return;
        }

        // Store active routine in localStorage
        localStorage.setItem('active_routine', JSON.stringify({
            routineId: routine.id,
            routineName: routine.name,
            currentDayIndex: 0,
            days: routine.days
        }));

        UIUtils.showToast({
            message: `Rutina "${routine.name}" activada en el diario`,
            type: 'success'
        });

        // Switch to diary view
        document.querySelector('[data-view="diary"]').click();
    };

    /**
     * Show modal to add a new routine
     */
    const showAddRoutineModal = () => {
        currentEditingRoutine = null;
        showRoutineModal();
    };

    /**
     * Show modal to edit an existing routine
     */
    const showEditRoutineModal = (routineId) => {
        currentEditingRoutine = StorageService.getRoutine(routineId);
        if (!currentEditingRoutine) {
            UIUtils.showToast({ message: 'Rutina no encontrada', type: 'error' });
            return;
        }
        showRoutineModal(currentEditingRoutine);
    };

    /**
     * Show routine modal with hierarchical structure
     */
    const showRoutineModal = (routine = null) => {
        const isEdit = routine !== null;
        const days = routine?.days || [];

        const modalContent = `
            <form id="routineForm">
                <div class="form-group">
                    <label class="form-label" for="routineName">Nombre de la rutina *</label>
                    <input type="text" class="form-input" id="routineName" 
                           value="${routine?.name || ''}" placeholder="Ej: Push Pull Legs" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="routineDescription">Descripción</label>
                    <textarea class="form-textarea" id="routineDescription" 
                              placeholder="Describe tu rutina...">${routine?.description || ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Días de entrenamiento</label>
                    <div id="daysList" style="display: flex; flex-direction: column; gap: var(--space-lg);">
                        ${days.map((day, index) => createDayFormItem(day, index)).join('')}
                    </div>
                    <button type="button" class="btn btn-secondary" id="addDayBtn" style="width: 100%; margin-top: var(--space-md);">
                        <span class="btn-icon">+</span>
                        Añadir Día
                    </button>
                </div>
            </form>
        `;

        UIUtils.showModal({
            title: isEdit ? 'Editar Rutina' : 'Nueva Rutina',
            content: modalContent,
            actions: [
                {
                    id: 'cancel',
                    label: 'Cancelar',
                    className: 'btn-secondary'
                },
                {
                    id: 'save',
                    label: isEdit ? 'Guardar Cambios' : 'Crear Rutina',
                    className: 'btn-primary',
                    handler: () => saveRoutine(isEdit),
                    closeOnClick: false
                }
            ]
        });

        setupDayManagement();
    };

    /**
     * Create HTML for a day form item with hierarchical structure
     */
    const createDayFormItem = (day = null, index = 0) => {
        const exercises = day?.exercises || [];

        return `
            <div class="card" data-day-index="${index}" style="border-left: 3px solid var(--color-accent);">
                <div class="card-header">
                    <input type="text" class="form-input day-name" 
                           placeholder="Nombre del día (ej: Día 1 - Push)" 
                           value="${day?.name || ''}" required
                           style="border: none; padding: 0; font-weight: var(--font-semibold); font-size: var(--font-size-lg); background: transparent;">
                    <button type="button" class="icon-btn remove-day" title="Eliminar día">
                        🗑️
                    </button>
                </div>
                <div class="card-body">
                    <div class="exercises-list" style="display: flex; flex-direction: column; gap: var(--space-md);">
                        ${exercises.map((ex, exIndex) => createExerciseFormItem(ex, exIndex)).join('')}
                    </div>
                    <button type="button" class="btn btn-secondary add-exercise" style="width: 100%; margin-top: var(--space-md);">
                        <span class="btn-icon">+</span>
                        Añadir Ejercicio
                    </button>
                </div>
            </div>
        `;
    };

    /**
     * Create HTML for an exercise form item with sets
     */
    const createExerciseFormItem = (exercise = null, index = 0) => {
        const sets = exercise?.sets || [];

        return `
            <div class="card" data-exercise-index="${index}" style="background: var(--color-bg-secondary); border: 0.5px solid var(--color-separator);">
                <div class="card-header" style="border-bottom: 0.5px solid var(--color-separator);">
                    <input type="text" class="form-input exercise-name" 
                           placeholder="Nombre del ejercicio" 
                           value="${exercise?.name || ''}" required
                           style="border: none; padding: 0; font-weight: var(--font-medium); background: transparent;">
                    <button type="button" class="icon-btn remove-exercise" title="Eliminar ejercicio">
                        ✕
                    </button>
                </div>
                <div class="card-body">
                    <div class="sets-list" style="display: flex; flex-direction: column; gap: var(--space-sm);">
                        ${sets.map((set, setIndex) => createSetFormItem(set, setIndex)).join('')}
                    </div>
                    <button type="button" class="btn btn-secondary add-set" style="width: 100%; margin-top: var(--space-sm); font-size: var(--font-size-sm);">
                        <span class="btn-icon">+</span>
                        Añadir Set
                    </button>
                </div>
            </div>
        `;
    };

    /**
     * Create HTML for a set form item (KG, Reps, RIR)
     */
    const createSetFormItem = (set = null, index = 0) => {
        return `
            <div class="set-item" data-set-index="${index}" style="display: flex; gap: var(--space-sm); align-items: center; padding: var(--space-sm); background: var(--color-surface); border-radius: var(--radius-sm);">
                <span style="font-size: var(--font-size-sm); color: var(--color-text-secondary); min-width: 40px;">Set ${index + 1}</span>
                <input type="number" class="form-input set-kg" placeholder="KG" 
                       value="${set?.kg || ''}" min="0" step="0.5" style="flex: 1;">
                <input type="number" class="form-input set-reps" placeholder="Reps" 
                       value="${set?.reps || ''}" min="1" style="flex: 1;">
                <input type="number" class="form-input set-rir" placeholder="RIR" 
                       value="${set?.rir !== null && set?.rir !== undefined ? set.rir : ''}" min="0" max="10" style="flex: 1;">
                <button type="button" class="icon-btn remove-set" title="Eliminar set">
                    ✕
                </button>
            </div>
        `;
    };

    /**
     * Setup day management in modal
     */
    const setupDayManagement = () => {
        const daysList = document.getElementById('daysList');
        const addDayBtn = document.getElementById('addDayBtn');

        addDayBtn.addEventListener('click', () => {
            const index = daysList.children.length;
            const dayHtml = createDayFormItem(null, index);
            daysList.insertAdjacentHTML('beforeend', dayHtml);
            attachDayListeners();
        });

        attachDayListeners();
    };

    /**
     * Attach listeners to day items
     */
    const attachDayListeners = () => {
        // Remove day
        document.querySelectorAll('.remove-day').forEach(btn => {
            btn.replaceWith(btn.cloneNode(true));
        });
        document.querySelectorAll('.remove-day').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (document.querySelectorAll('[data-day-index]').length > 1) {
                    e.target.closest('[data-day-index]').remove();
                } else {
                    UIUtils.showToast({ message: 'Debe haber al menos un día', type: 'warning' });
                }
            });
        });

        // Add exercise
        document.querySelectorAll('.add-exercise').forEach(btn => {
            btn.replaceWith(btn.cloneNode(true));
        });
        document.querySelectorAll('.add-exercise').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const exercisesList = e.target.closest('.card-body').querySelector('.exercises-list');
                const index = exercisesList.children.length;
                const exerciseHtml = createExerciseFormItem(null, index);
                exercisesList.insertAdjacentHTML('beforeend', exerciseHtml);
                attachExerciseListeners();
            });
        });

        attachExerciseListeners();
    };

    /**
     * Attach listeners to exercise items
     */
    const attachExerciseListeners = () => {
        // Remove exercise
        document.querySelectorAll('.remove-exercise').forEach(btn => {
            btn.replaceWith(btn.cloneNode(true));
        });
        document.querySelectorAll('.remove-exercise').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('[data-exercise-index]').remove();
            });
        });

        // Add set
        document.querySelectorAll('.add-set').forEach(btn => {
            btn.replaceWith(btn.cloneNode(true));
        });
        document.querySelectorAll('.add-set').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const setsList = e.target.closest('.card-body').querySelector('.sets-list');
                const index = setsList.children.length;
                const setHtml = createSetFormItem(null, index);
                setsList.insertAdjacentHTML('beforeend', setHtml);
                attachSetListeners();
            });
        });

        attachSetListeners();
    };

    /**
     * Attach listeners to set items
     */
    const attachSetListeners = () => {
        document.querySelectorAll('.remove-set').forEach(btn => {
            btn.replaceWith(btn.cloneNode(true));
        });
        document.querySelectorAll('.remove-set').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('[data-set-index]').remove();
            });
        });
    };

    /**
     * Save routine with hierarchical structure
     */
    const saveRoutine = (isEdit) => {
        const form = document.getElementById('routineForm');

        if (!UIUtils.validateForm(form)) {
            UIUtils.showToast({ message: 'Por favor completa los campos requeridos', type: 'error' });
            return;
        }

        const name = document.getElementById('routineName').value.trim();
        const description = document.getElementById('routineDescription').value.trim();

        // Collect days with hierarchical structure
        const days = [];
        document.querySelectorAll('[data-day-index]').forEach(dayEl => {
            const dayName = dayEl.querySelector('.day-name').value.trim();
            if (!dayName) return;

            const exercises = [];
            dayEl.querySelectorAll('[data-exercise-index]').forEach(exEl => {
                const exName = exEl.querySelector('.exercise-name').value.trim();
                if (!exName) return;

                const sets = [];
                exEl.querySelectorAll('[data-set-index]').forEach(setEl => {
                    const kg = setEl.querySelector('.set-kg').value;
                    const reps = setEl.querySelector('.set-reps').value;
                    const rir = setEl.querySelector('.set-rir').value;

                    sets.push({
                        kg: kg ? parseFloat(kg) : null,
                        reps: reps ? parseInt(reps) : null,
                        rir: rir !== '' ? parseInt(rir) : null
                    });
                });

                exercises.push({ name: exName, sets });
            });

            days.push({ name: dayName, exercises });
        });

        if (days.length === 0) {
            UIUtils.showToast({ message: 'Debes añadir al menos un día', type: 'error' });
            return;
        }

        const routineData = {
            name,
            description,
            days
        };

        try {
            if (isEdit && currentEditingRoutine) {
                StorageService.updateRoutine(currentEditingRoutine.id, routineData);
                UIUtils.showToast({ message: 'Rutina actualizada correctamente', type: 'success' });
            } else {
                StorageService.saveRoutine(routineData);
                UIUtils.showToast({ message: 'Rutina creada correctamente', type: 'success' });
            }

            UIUtils.closeModal();
            renderRoutines();
        } catch (error) {
            console.error('Error saving routine:', error);
            UIUtils.showToast({ message: 'Error al guardar la rutina', type: 'error' });
        }
    };

    /**
     * Confirm and delete a routine
     */
    const confirmDeleteRoutine = (routineId) => {
        UIUtils.confirm({
            title: 'Eliminar Rutina',
            message: '¿Estás seguro de que quieres eliminar esta rutina? Esta acción no se puede deshacer.',
            confirmText: 'Eliminar',
            cancelText: 'Cancelar',
            onConfirm: () => {
                if (StorageService.deleteRoutine(routineId)) {
                    UIUtils.showToast({ message: 'Rutina eliminada', type: 'success' });
                    renderRoutines();
                } else {
                    UIUtils.showToast({ message: 'Error al eliminar la rutina', type: 'error' });
                }
            }
        });
    };

    /**
     * Export routine to JSON file
     */
    const exportRoutine = (routineId) => {
        const jsonData = StorageService.exportRoutine(routineId);
        if (!jsonData) {
            UIUtils.showToast({ message: 'Error al exportar la rutina', type: 'error' });
            return;
        }

        const routine = StorageService.getRoutine(routineId);
        const filename = `${routine.name.replace(/\s+/g, '_')}_routine.json`;

        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        UIUtils.showToast({ message: 'Rutina exportada correctamente', type: 'success' });
    };

    /**
     * Show import routine modal
     */
    const showImportModal = () => {
        const modalContent = `
            <div class="form-group">
                <label class="form-label" for="routineFile">Selecciona un archivo JSON</label>
                <input type="file" class="form-input" id="routineFile" accept=".json">
            </div>
            <p style="color: var(--color-text-secondary); font-size: var(--font-size-sm); margin-top: var(--space-md);">
                Selecciona un archivo JSON de rutina previamente exportado para importarlo.
            </p>
        `;

        UIUtils.showModal({
            title: 'Importar Rutina',
            content: modalContent,
            actions: [
                {
                    id: 'cancel',
                    label: 'Cancelar',
                    className: 'btn-secondary'
                },
                {
                    id: 'import',
                    label: 'Importar',
                    className: 'btn-primary',
                    handler: handleImport,
                    closeOnClick: false
                }
            ]
        });
    };

    /**
     * Handle routine import
     */
    const handleImport = () => {
        const fileInput = document.getElementById('routineFile');
        const file = fileInput.files[0];

        if (!file) {
            UIUtils.showToast({ message: 'Por favor selecciona un archivo', type: 'error' });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const jsonString = e.target.result;
            const routine = StorageService.importRoutine(jsonString);

            if (routine) {
                UIUtils.showToast({ message: 'Rutina importada correctamente', type: 'success' });
                UIUtils.closeModal();
                renderRoutines();
            } else {
                UIUtils.showToast({ message: 'Error al importar la rutina. Verifica el formato del archivo.', type: 'error' });
            }
        };

        reader.onerror = () => {
            UIUtils.showToast({ message: 'Error al leer el archivo', type: 'error' });
        };

        reader.readAsText(file);
    };

    // Public API
    return {
        init,
        renderRoutines
    };
})();

// Make it available globally
window.RoutinesModule = RoutinesModule;
