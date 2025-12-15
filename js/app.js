// Initialize theme on load (before DOMContentLoaded)
ThemeUtils.init();

// Lazy module loader
const loadedModules = new Set();
function loadModule(src) {
    if (loadedModules.has(src)) {
        return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            loadedModules.add(src);
            resolve();
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    /* =================== Main Application =================== */

    /* =================== Color Customization System =================== */
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

    // Color display names
    const COLOR_NAMES = {
        azul: 'Azul',
        rojo: 'Rojo',
        verde: 'Verde',
        amarillo: 'Amarillo',
        morado: 'Morado',
        rosa: 'Rosa',
        naranja: 'Naranja',
        cian: 'Cian',
        gris: 'Gris',
        turquesa: 'Turquesa',
        esmeralda: 'Esmeralda',
        indigo: 'Índigo',
        fucsia: 'Fucsia',
        coral: 'Coral',
        lima: 'Lima',
        teal: 'Teal',
        violeta: 'Violeta',
        carmesi: 'Carmesí'
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

    // Convert hex to RGB
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    // Set color for a specific theme
    function setThemeColor(theme, colorKey) {
        const prefs = loadColorPreferences();
        prefs[theme] = colorKey;
        saveColorPreferences(prefs);

        // Update if this is the current theme
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === theme) {
            updateThemeColors(theme);
        }

        // Update swatches
        renderColorSwatches();
    }

    // Render color swatches
    function renderColorSwatches() {
        const prefs = loadColorPreferences();
        const darkSwatches = $('#colorSwatchesDark');
        const lightSwatches = $('#colorSwatchesLight');

        if (!darkSwatches || !lightSwatches) return;

        darkSwatches.innerHTML = '';
        lightSwatches.innerHTML = '';

        Object.keys(COLOR_PRESETS).forEach(colorKey => {
            const colors = COLOR_PRESETS[colorKey];

            // Dark theme swatch
            const darkSwatch = document.createElement('button');
            darkSwatch.className = 'color-swatch';
            darkSwatch.setAttribute('aria-label', `Color ${COLOR_NAMES[colorKey]} para modo oscuro`);
            darkSwatch.style.setProperty('--swatch-color', colors.dark.primary);
            darkSwatch.dataset.colorKey = colorKey;
            darkSwatch.dataset.theme = 'dark';
            if (prefs.dark === colorKey) {
                darkSwatch.classList.add('active');
            }
            darkSwatch.addEventListener('click', () => setThemeColor('dark', colorKey));
            darkSwatches.appendChild(darkSwatch);

            // Light theme swatch
            const lightSwatch = document.createElement('button');
            lightSwatch.className = 'color-swatch';
            lightSwatch.setAttribute('aria-label', `Color ${COLOR_NAMES[colorKey]} para modo claro`);
            lightSwatch.style.setProperty('--swatch-color', colors.light.primary);
            lightSwatch.dataset.colorKey = colorKey;
            lightSwatch.dataset.theme = 'light';
            if (prefs.light === colorKey) {
                lightSwatch.classList.add('active');
            }
            lightSwatch.addEventListener('click', () => setThemeColor('light', colorKey));
            lightSwatches.appendChild(lightSwatch);
        });
    }

    // Initialize colors on load
    const currentTheme = document.documentElement.getAttribute('data-theme');
    updateThemeColors(currentTheme);

    // Render on tab change - Only for Diary and Routines
    // Removed profile tab functionality

    // Make renderColorSwatches available globally for renderProfile
    window.renderColorSwatches = renderColorSwatches;

    /* Parallax suave - throttled for better performance */
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) return;
        scrollTimeout = requestAnimationFrame(() => {
            document.documentElement.style.setProperty('--grad-pos', String(window.scrollY));
            scrollTimeout = null;
        });
    }, { passive: true });

    /* =================== Estado =================== */
    // app, templates, and templateLabels are now imported from modules

    const DEFAULT_AVATAR = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" rx="100" fill="%231e293b"/><text x="50%" y="55%" font-size="64" text-anchor="middle" dominant-baseline="middle">👤</text></svg>';

    // Generate DiceBear avatar URL
    function generateAvatarUrl(style, seed) {
        // Map style names to DiceBear API style names
        const styleMap = {
            'avataaars': 'avataaars',
            'pixel-art': 'pixel-art',
            'adventurer': 'adventurer',
            'big-smile': 'big-smile',
            'bottts': 'bottts',
            'fun-emoji': 'fun-emoji',
            'icons': 'icons',
            'identicon': 'identicon',
            'lorelei': 'lorelei',
            'micah': 'micah',
            'miniavs': 'miniavs',
            'notionists': 'notionists',
            'open-peeps': 'open-peeps',
            'personas': 'personas',
            'rings': 'rings',
            'shapes': 'shapes',
            'thumbs': 'thumbs'
        };

        const apiStyle = styleMap[style] || 'avataaars';
        const avatarSeed = seed || Math.random().toString(36).substring(2, 15);
        return `https://api.dicebear.com/9.x/${apiStyle}/svg?seed=${encodeURIComponent(avatarSeed)}`;
    }

    // Get current avatar (photo or generated)
    function getCurrentAvatar() {
        if (app.profile.photo) {
            return app.profile.photo;
        }
        const seed = app.profile.avatarSeed || (app.profile.firstName + ' ' + app.profile.lastName).trim() || 'default';
        const style = app.profile.avatarStyle || 'avataaars';
        return generateAvatarUrl(style, seed);
    }

    // createDefaultProfile is now imported from storage.js

    function updateRoutineDayTitles() {
        const days = $$('#routineDays .routine-day');
        days.forEach((day, idx) => {
            const title = day.querySelector('.routine-day__title');
            if (title) title.textContent = `Día ${idx + 1}`;
        });
    }

    function updateRoutineSetIndexes(exEl) {
        if (!exEl) return;
        const sets = exEl.querySelectorAll('.routine-set');
        sets.forEach((set, idx) => {
            const label = set.querySelector('.routine-set__index');
            if (label) label.textContent = `Set ${idx + 1}`;
        });
    }

    function addRoutineDay(data = {}) {
        const container = $('#routineDays');
        if (!container) return;
        const tpl = $('#tpl-routine-day');
        if (!tpl) return;
        const node = tpl.content.firstElementChild.cloneNode(true);
        node.dataset.dayId = data.id || uuid();
        const nameInput = node.querySelector('.routine-day__name');
        if (nameInput) nameInput.value = data.name || '';
        const exercisesContainer = node.querySelector('.routine-exercises');
        (data.exercises || []).forEach(ex => addRoutineExercise(node, ex));
        container.appendChild(node);
        updateRoutineDayTitles();
        updateRoutineExerciseReorderButtons(node);
        return node;
    }

    function addRoutineExercise(dayEl, data = {}) {
        if (!dayEl) return;
        const tpl = $('#tpl-routine-exercise');
        if (!tpl) return;
        const node = tpl.content.firstElementChild.cloneNode(true);
        node.dataset.exId = data.id || uuid();
        const nameInput = node.querySelector('.routine-exercise__name');
        if (nameInput) nameInput.value = data.name || '';
        const setsContainer = node.querySelector('.routine-sets');
        const sets = (data.sets && data.sets.length) ? data.sets : [{ id: uuid(), planKg: '', planReps: '', planRir: '' }];
        sets.forEach(set => addRoutineSet(node, set));
        const exercisesContainer = dayEl.querySelector('.routine-exercises');
        if (exercisesContainer) {
            exercisesContainer.appendChild(node);
            updateRoutineExerciseReorderButtons(dayEl);
        }
    }

    function updateRoutineExerciseReorderButtons(dayEl) {
        const exercisesContainer = dayEl.querySelector('.routine-exercises');
        if (!exercisesContainer) return;

        const exerciseElements = [...exercisesContainer.querySelectorAll('.routine-exercise')];
        const exerciseCount = exerciseElements.length;

        exerciseElements.forEach((exEl, index) => {
            const headEl = exEl.querySelector('.routine-exercise__head');
            if (!headEl) return;

            // Find the buttons container (the div that contains + Set and X buttons)
            let buttonsContainer = headEl.querySelector('div:last-child');
            if (!buttonsContainer) {
                buttonsContainer = document.createElement('div');
                headEl.appendChild(buttonsContainer);
            }

            // Remove existing reorder buttons
            const existingButtons = buttonsContainer.querySelectorAll('.routine-exercise-reorder-btn');
            existingButtons.forEach(btn => btn.remove());

            // Add buttons if there are 2+ exercises
            if (exerciseCount >= 2) {
                buttonsContainer.style.display = 'flex';
                buttonsContainer.style.alignItems = 'center';
                buttonsContainer.style.gap = '6px';

                const upBtn = document.createElement('button');
                upBtn.className = 'btn btn--ghost btn--small routine-exercise-reorder-btn routine-exercise-reorder-up';
                upBtn.setAttribute('aria-label', 'Mover ejercicio arriba');
                upBtn.dataset.exId = exEl.dataset.exId;
                upBtn.dataset.direction = 'up';

                const downBtn = document.createElement('button');
                downBtn.className = 'btn btn--ghost btn--small routine-exercise-reorder-btn routine-exercise-reorder-down';
                downBtn.setAttribute('aria-label', 'Mover ejercicio abajo');
                downBtn.dataset.exId = exEl.dataset.exId;
                downBtn.dataset.direction = 'down';

                const setButtonDisabled = (btn, disabled) => {
                    btn.disabled = disabled;
                    if (disabled) {
                        btn.style.opacity = '0.3';
                        btn.style.cursor = 'not-allowed';
                    }
                };
                setButtonDisabled(upBtn, index === 0);
                setButtonDisabled(downBtn, index === exerciseCount - 1);

                buttonsContainer.insertBefore(upBtn, buttonsContainer.firstChild);
                buttonsContainer.insertBefore(downBtn, buttonsContainer.firstChild);
            }
        });
    }

    function moveRoutineExercise(exId, direction) {
        const exerciseEl = document.querySelector(`.routine-exercise[data-ex-id="${exId}"]`);
        if (!exerciseEl) return;

        const dayEl = exerciseEl.closest('.routine-day');
        if (!dayEl) return;

        const exercisesContainer = dayEl.querySelector('.routine-exercises');
        if (!exercisesContainer) return;

        const exerciseElements = [...exercisesContainer.querySelectorAll('.routine-exercise')];
        const currentIndex = exerciseElements.findIndex(el => el.dataset.exId === exId);
        if (currentIndex === -1) return;

        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex < 0 || newIndex >= exerciseElements.length) return;

        // Swap exercises in DOM
        const currentEl = exerciseElements[currentIndex];
        const targetEl = exerciseElements[newIndex];

        if (direction === 'up') {
            exercisesContainer.insertBefore(currentEl, targetEl);
        } else {
            exercisesContainer.insertBefore(currentEl, targetEl.nextSibling);
        }

        // Update reorder buttons
        updateRoutineExerciseReorderButtons(dayEl);
    }

    function addRoutineSet(exEl, data = {}) {
        if (!exEl) return;
        const tpl = $('#tpl-routine-set');
        if (!tpl) return;
        const node = tpl.content.firstElementChild.cloneNode(true);
        node.dataset.setId = data.id || uuid();
        const kgInput = node.querySelector('.routine-set__kg');
        const repsInput = node.querySelector('.routine-set__reps');
        const rirInput = node.querySelector('.routine-set__rir');
        const planKg = data.planKg !== undefined ? data.planKg : (data.kg || '');
        const planReps = data.planReps !== undefined ? data.planReps : (data.reps || '');
        const planRir = data.planRir !== undefined ? data.planRir : (data.rir || '');
        if (kgInput) {
            kgInput.value = planKg;
            kgInput.placeholder = 'Opcional';
        }
        if (repsInput) {
            repsInput.value = planReps;
            repsInput.placeholder = 'Opcional';
        }
        if (rirInput) {
            rirInput.value = planRir;
            rirInput.placeholder = 'Opcional';
        }
        const setsContainer = exEl.querySelector('.routine-sets');
        if (setsContainer) setsContainer.appendChild(node);
        updateRoutineSetIndexes(exEl);
    }

    function resetRoutineBuilder() {
        const routineNameInput = $('#routineName');
        if (routineNameInput) routineNameInput.value = '';
        const container = $('#routineDays');
        if (container) container.innerHTML = '';
        app.routineEditId = null;
        updateRoutineDayTitles();
    }

    function loadRoutineIntoBuilder(routine) {
        if (!routine) return;
        resetRoutineBuilder();
        const routineNameInput = $('#routineName');
        if (routineNameInput) routineNameInput.value = routine.name || '';
        (routine.days || []).forEach(day => {
            const dayEl = addRoutineDay({
                id: day.id || uuid(),
                name: day.name || '',
                exercises: (day.exercises || []).map(ex => ({
                    id: ex.id || uuid(),
                    name: ex.name || '',
                    sets: (ex.sets || []).map(set => ({
                        id: set.id || uuid(),
                        kg: set.kg || '',
                        reps: set.reps || '',
                        rir: set.rir || ''
                    }))
                }))
            });
            if (dayEl) updateRoutineExerciseReorderButtons(dayEl);
        });
        app.routineEditId = routine.id || null;
    }

    function renderDefaultRoutines() {
        const list = $('#defaultRoutineList');
        if (!list) return;
        list.innerHTML = '';
        Object.entries(templates).forEach(([key, days]) => {
            const item = document.createElement('div');
            item.className = 'routine-default__item';

            const head = document.createElement('div');
            head.className = 'routine-default__head';

            const info = document.createElement('div');
            const title = document.createElement('strong');
            title.textContent = templateLabels[key] || `Rutina ${key}`;
            info.appendChild(title);
            const meta = document.createElement('div');
            meta.className = 'routine-default__meta';
            const totalExercises = days.reduce((sum, day) => {
                const count = Array.isArray(day.ex) ? day.ex.length : 0;
                return sum + count;
            }, 0);
            meta.textContent = `${days.length} días · ${totalExercises} ejercicios`;
            info.appendChild(meta);

            head.appendChild(info);

            const useBtn = document.createElement('button');
            useBtn.className = 'btn btn--small btn--ghost js-use-template';
            useBtn.dataset.template = key;
            useBtn.textContent = 'Usar plantilla';
            head.appendChild(useBtn);

            item.appendChild(head);

            const body = document.createElement('div');
            body.className = 'routine-created__body';
            days.forEach((day, idx) => {
                const dayEl = document.createElement('div');
                dayEl.className = 'routine-created__day';
                const dayTitle = document.createElement('div');
                dayTitle.className = 'routine-created__day-title';
                dayTitle.textContent = `${idx + 1}. ${day.name}`;
                dayEl.appendChild(dayTitle);
                const exercises = document.createElement('div');
                exercises.className = 'routine-default__meta';
                const exerciseList = Array.isArray(day.ex) ? day.ex.join(', ') : '';
                exercises.textContent = exerciseList;
                dayEl.appendChild(exercises);
                body.appendChild(dayEl);
            });
            item.appendChild(body);

            list.appendChild(item);
        });
    }

    function renderCreatedRoutines() {
        const list = $('#createdRoutineList');
        const empty = $('#noCreatedRoutines');
        if (!list || !empty) return;
        list.innerHTML = '';
        if (!app.routines.length) {
            empty.hidden = false;
            return;
        }
        empty.hidden = true;

        app.routines.forEach(routine => {
            const item = document.createElement('div');
            item.className = 'routine-created__item';
            item.dataset.routineId = routine.id;

            const head = document.createElement('div');
            head.className = 'routine-created__head';

            const info = document.createElement('div');
            const title = document.createElement('strong');
            title.textContent = routine.name;
            info.appendChild(title);
            const meta = document.createElement('div');
            meta.className = 'routine-created__meta';
            const totalExercises = (routine.days || []).reduce((sum, day) => sum + (day.exercises ? day.exercises.length : 0), 0);
            meta.textContent = `${(routine.days || []).length} días · ${totalExercises} ejercicios`;
            info.appendChild(meta);
            head.appendChild(info);

            const actions = document.createElement('div');
            actions.style.display = 'flex';
            actions.style.flexWrap = 'wrap';
            actions.style.gap = '6px';

            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'btn btn--small btn--ghost js-toggle-routine';
            toggleBtn.textContent = 'Ver';
            actions.appendChild(toggleBtn);

            const editBtn = document.createElement('button');
            editBtn.className = 'btn btn--small btn--ghost js-edit-routine';
            editBtn.textContent = 'Editar';
            actions.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn--small btn--ghost js-delete-routine';
            deleteBtn.textContent = '✕';
            actions.appendChild(deleteBtn);

            head.appendChild(actions);
            item.appendChild(head);

            const body = document.createElement('div');
            body.className = 'routine-created__body';
            body.hidden = true;
            (routine.days || []).forEach((day, idx) => {
                const dayEl = document.createElement('div');
                dayEl.className = 'routine-created__day';
                const dayTitle = document.createElement('div');
                dayTitle.className = 'routine-created__day-title';
                dayTitle.textContent = `${idx + 1}. ${day.name}`;
                dayEl.appendChild(dayTitle);
                (day.exercises || []).forEach(ex => {
                    const exLine = document.createElement('div');
                    exLine.className = 'routine-default__meta';
                    const setsLabel = (ex.sets || []).length === 1 ? 'set' : 'sets';
                    exLine.textContent = `${ex.name} · ${(ex.sets || []).length} ${setsLabel}`;
                    dayEl.appendChild(exLine);
                });
                body.appendChild(dayEl);
            });
            item.appendChild(body);

            list.appendChild(item);
        });
    }

    function renderImportRoutineList() {
        const list = $('#importRoutineList');
        const empty = $('#importRoutineEmpty');
        if (!list || !empty) return;
        list.innerHTML = '';
        if (!app.routines.length) {
            empty.hidden = false;
            return;
        }
        empty.hidden = true;

        app.routines.forEach(routine => {
            const item = document.createElement('div');
            item.className = 'routine-import__item';

            const head = document.createElement('div');
            head.className = 'routine-import__head';

            const info = document.createElement('div');
            const title = document.createElement('strong');
            title.textContent = routine.name || 'Rutina sin nombre';
            info.appendChild(title);
            const meta = document.createElement('div');
            meta.className = 'routine-created__meta';
            const totalExercises = (routine.days || []).reduce((sum, day) => sum + (day.exercises ? day.exercises.length : 0), 0);
            meta.textContent = `${(routine.days || []).length} días · ${totalExercises} ejercicios`;
            info.appendChild(meta);
            head.appendChild(info);

            const importBtn = document.createElement('button');
            importBtn.className = 'btn btn--secondary btn--small js-import-user-routine';
            importBtn.dataset.routineId = routine.id;
            importBtn.textContent = 'Importar en semana visible';
            head.appendChild(importBtn);

            item.appendChild(head);

            const detail = document.createElement('div');
            detail.className = 'routine-default__meta';
            const days = routine.days || [];
            const dayNames = days.map((day, idx) => `${idx + 1}. ${day.name || 'Sin nombre'}`);
            detail.textContent = dayNames.length ? dayNames.join(' · ') : 'Sin días definidos';
            item.appendChild(detail);

            list.appendChild(item);
        });
    }

    function renderRoutines() {
        renderDefaultRoutines();
        renderCreatedRoutines();
        renderImportRoutineList();
        updateRoutineDayTitles();
    }

    function loadTemplateIntoBuilder(key) {
        if (!key) return;
        const preset = templates[key];
        if (!preset) return;
        resetRoutineBuilder();
        const routineNameInput = $('#routineName');
        if (routineNameInput) {
            routineNameInput.value = templateLabels[key] || `Rutina ${key}`;
            routineNameInput.focus();
        }
        
        // For PPL (6 days), use 3 sets per exercise, otherwise 1 set
        const setsPerExercise = (key === 'ppl') ? 3 : 1;
        
        preset.forEach(day => {
            const dayEl = addRoutineDay({
                id: uuid(),
                name: day.name,
                exercises: (day.ex || []).map(exName => ({
                    id: uuid(),
                    name: exName,
                    sets: Array.from({ length: setsPerExercise }, (_, index) => ({
                        id: uuid(),
                        kg: '',
                        reps: '',
                        rir: '',
                        planKg: '',
                        planReps: '',
                        planRir: '',
                        setNumber: index + 1 // Assign set numbers 1, 2, 3...
                    }))
                }))
            });
            if (dayEl) updateRoutineExerciseReorderButtons(dayEl);
        });
        app.routineEditId = null;
        updateRoutineDayTitles();
    }

    function collectRoutineFromBuilder() {
        const nameInput = $('#routineName');
        const routineName = nameInput ? nameInput.value.trim() : '';
        if (!routineName) {
            toast('Añade un nombre para la rutina', 'warn');
            if (nameInput) nameInput.focus();
            return null;
        }
        const dayElements = $$('#routineDays .routine-day');
        if (!dayElements.length) {
            toast('Añade al menos un día a la rutina', 'warn');
            return null;
        }
        const days = [];
        for (const dayEl of dayElements) {
            const dayNameInput = dayEl.querySelector('.routine-day__name');
            const dayName = dayNameInput ? dayNameInput.value.trim() : '';
            if (!dayName) {
                toast('Cada día necesita un nombre', 'warn');
                if (dayNameInput) dayNameInput.focus();
                return null;
            }
            const exElements = [...dayEl.querySelectorAll('.routine-exercise')];
            if (!exElements.length) {
                toast(`Añade ejercicios para ${dayName}`, 'warn');
                if (dayNameInput) dayNameInput.focus();
                return null;
            }
            const exercises = [];
            for (const exEl of exElements) {
                const exNameInput = exEl.querySelector('.routine-exercise__name');
                const exName = exNameInput ? exNameInput.value.trim() : '';
                if (!exName) {
                    toast('Cada ejercicio necesita un nombre', 'warn');
                    if (exNameInput) exNameInput.focus();
                    return null;
                }
                const setElements = [...exEl.querySelectorAll('.routine-set')];
                // Sets are optional during routine creation - they can be filled later when logging the workout
                const sets = [];
                for (let i = 0; i < setElements.length; i++) {
                    const setEl = setElements[i];
                    const kgInput = setEl.querySelector('.routine-set__kg');
                    const repsInput = setEl.querySelector('.routine-set__reps');
                    const rirInput = setEl.querySelector('.routine-set__rir');
                    const kg = kgInput ? kgInput.value.trim() : '';
                    const reps = repsInput ? repsInput.value.trim() : '';
                    const rir = rirInput ? rirInput.value.trim() : '';
                    // Allow empty sets during routine creation
                    sets.push({
                        id: setEl.dataset.setId || uuid(),
                        kg: kg || '',
                        reps: reps || '',
                        rir: rir || ''
                    });
                }
                // If no sets exist, create one empty set as placeholder
                if (sets.length === 0) {
                    sets.push({
                        id: uuid(),
                        kg: '',
                        reps: '',
                        rir: ''
                    });
                }
                exercises.push({
                    id: exEl.dataset.exId || uuid(),
                    name: exName,
                    sets
                });
            }
            days.push({
                id: dayEl.dataset.dayId || uuid(),
                name: dayName,
                exercises
            });
        }
        return { name: routineName, days };
    }

    function handleSaveRoutine(ev) {
        if (ev) ev.preventDefault();
        const data = collectRoutineFromBuilder();
        if (!data) return;
        if (app.routineEditId) {
            const target = app.routines.find(r => r.id === app.routineEditId);
            if (target) {
                target.name = data.name;
                target.days = data.days;
                toast('Rutina actualizada', 'ok');
            }
        } else {
            app.routines.push({
                id: uuid(),
                createdAt: new Date().toISOString(),
                ...data
            });
            toast('Rutina creada', 'ok');
        }
        app.routineEditId = null;
        save();
        renderRoutines();
        resetRoutineBuilder();
    }

    /* =================== Persistencia =================== */
    // Override save to include clearProgressCache
    const originalSave = window.save;
    window.save = async function() {
        clearProgressCache();
        return originalSave();
    };
    
    // save, load, debouncedSave, and createDefaultProfile are now imported from storage.js module
    // initializeDefaultData is now imported from app-state.js module

    /* =================== Fechas =================== */
    // Date functions are now imported from dates.js module
    function getVisibleWeek() {
        const ws = addDays(startOfWeek(), app.weekOffset * 7);
        const we = addDays(ws, 6);
        we.setHours(23, 59, 59, 999);
        return { ws, we };
    }

    /* =================== Tabs & Nav =================== */
    // Prevent navigation if there are unsaved changes
    window.addEventListener('beforeunload', (e) => {
        if (hasUnsavedChanges()) {
            e.preventDefault();
            e.returnValue = 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?';
            return e.returnValue;
        }
    });

    function setupTabs() {
        const panels = $$('.panel');
        const panelToNav = {
            'panel-diary': 'navDiary',
            'panel-stats': 'navStats',
            'panel-routines': 'navRoutines',
            'panel-import': 'navImport'
        };

        function updateNav(panelId) {
            const navId = panelToNav[panelId];
            if (!navId) return;
            
            // Update bottom nav buttons (optimized: batch DOM updates)
            const navIds = ['navDiary', 'navStats', 'navRoutines', 'navImport'];
            const updates = [];
            for (let i = 0; i < navIds.length; i++) {
                const id = navIds[i];
                const btn = $(`#${id}`);
                if (btn) {
                    const isActive = id === navId;
                    updates.push(() => {
                        btn.setAttribute('aria-current', isActive ? 'page' : 'false');
                        btn.classList.toggle('active', isActive);
                    });
                }
            }
            // Batch updates in single frame
            if (updates.length) {
                requestAnimationFrame(() => updates.forEach(fn => fn()));
            }
        }

        function select(panelId) {
            // Check for unsaved changes before switching tabs
            if (hasUnsavedChanges()) {
                const editingIds = getEditingSessionIds();
                if (editingIds.length > 0) {
                    toast('Guarda o cancela los cambios antes de cambiar de pestaña', 'warn');
                    return;
                }
            }

            // Batch panel updates (optimized loop)
            for (let i = 0; i < panels.length; i++) {
                panels[i].setAttribute('aria-hidden', panels[i].id === panelId ? 'false' : 'true');
            }
            
            // Reset settings panel to main menu when switching away
            if (panelId !== 'panel-settings') {
                if (typeof showSettingsMain === 'function') showSettingsMain();
            }
            
            updateNav(panelId);
            if (panelId === 'panel-diary') { renderSessions(); }
            if (panelId === 'panel-routines') { renderRoutines(); }
            if (panelId === 'panel-stats') { 
                loadModule('js/modules/stats.js').then(() => {
                    if (typeof buildStats === 'function') buildStats();
                    if (typeof buildChartState === 'function') buildChartState();
                    if (typeof renderArchivedCycles === 'function') renderArchivedCycles();
                });
            }
            if (panelId === 'panel-import') { 
                loadModule('js/modules/import.js').then(() => {
                    if (typeof initWeekSelector === 'function') initWeekSelector();
                    if (typeof renderImportRoutineList === 'function') renderImportRoutineList();
                });
            }
        }

        // Bottom nav bindings
        const navBindings = {
            navDiary: 'panel-diary',
            navStats: 'panel-stats',
            navRoutines: 'panel-routines',
            navImport: 'panel-import'
        };
        Object.keys(navBindings).forEach(navId => {
            const btn = $(`#${navId}`);
            if (btn) {
                btn.addEventListener('click', () => select(navBindings[navId]));
            }
        });

        select('panel-diary');
    }

    /* =================== Semana UI =================== */
    function renderWeekbar() {
        const ws = addDays(startOfWeek(), app.weekOffset * 7);
        const we = addDays(ws, 6);
        const label = (app.weekOffset === 0) ? 'Semana actual'
            : (app.weekOffset === -1 ? 'Semana pasada'
                : (app.weekOffset === 1 ? 'Semana siguiente'
                    : `${ws.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} – ${we.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}`));
        $('#weekInfo').textContent = label;
    }
    function getWeekSessions() {
        const { ws, we } = getVisibleWeek();
        const wsLocal = new Date(ws.getFullYear(), ws.getMonth(), ws.getDate(), 0, 0, 0);
        const weLocal = new Date(we.getFullYear(), we.getMonth(), we.getDate(), 23, 59, 59);

        return app.sessions
            .filter(s => {
                const d = parseLocalDate(s.date);
                return d >= wsLocal && d <= weLocal;
            })
            .sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date));
    }

    /**
     * Robust function to check if there are any sessions in the visible week.
     * Returns true if at least one session exists within the week range, false otherwise.
     * This function uses the EXACT same logic as getWeekSessions() for consistency.
     * This function is designed to be 100% reliable and handle edge cases.
     */
    function hasSessionsThisWeek() {
        // Ensure app.sessions exists and is an array
        if (!app.sessions || !Array.isArray(app.sessions) || app.sessions.length === 0) {
            return false;
        }

        // Use the exact same logic as getWeekSessions() for consistency
        const { ws, we } = getVisibleWeek();
        const wsLocal = new Date(ws.getFullYear(), ws.getMonth(), ws.getDate(), 0, 0, 0);
        const weLocal = new Date(we.getFullYear(), we.getMonth(), we.getDate(), 23, 59, 59);

        // Check each session using the same filter logic as getWeekSessions()
        for (let i = 0; i < app.sessions.length; i++) {
            const session = app.sessions[i];

            // Skip if session has no date
            if (!session || !session.date) {
                continue;
            }

            try {
                // Use the exact same parsing and comparison as getWeekSessions()
                const d = parseLocalDate(session.date);
                if (d >= wsLocal && d <= weLocal) {
                    return true; // Found at least one session in the week
                }
            } catch (e) {
                // Skip invalid dates silently
                continue;
            }
        }

        return false; // No sessions found in the visible week
    }

    /* =================== Parseos =================== */
    // parseReps and parseRIR are now imported from calculations.js module

    /* =================== Resumen =================== */
    function renderSummary() {
        const list = getWeekSessions();
        $('#kpiSessions').textContent = String(list.length);
        const counts = new Map();
        const exerciseProgress = new Map(); // Track progress per exercise
        let vol = 0, rirS = 0, rirC = 0;

        list.forEach(s => (s.exercises || []).forEach(e => {
            counts.set(e.name, (counts.get(e.name) || 0) + 1);
            (e.sets || []).forEach(st => {
                const kg = parseFloat(st.kg) || 0;
                const reps = parseReps(st.reps);
                vol += kg * reps;
                const r = parseRIR(st.rir);
                if (r > 0) { rirS += r; rirC++; }

                // Calculate progress: max weight * reps for this exercise
                if (kg > 0 && reps > 0) {
                    const currentMax = exerciseProgress.get(e.name) || 0;
                    const currentValue = kg * reps; // Volume as progress indicator
                    if (currentValue > currentMax) {
                        exerciseProgress.set(e.name, currentValue);
                    }
                }
            });
        }));

        // Find exercise with most progress (highest volume achieved)
        let topExercise = '–';
        if (exerciseProgress.size > 0) {
            const sorted = [...exerciseProgress.entries()].sort((a, b) => b[1] - a[1]);
            topExercise = sorted[0][0]; // Only show the top one
        }

        $('#kpiTop').textContent = topExercise;
        $('#kpiVolume').textContent = `${vol.toLocaleString()} kg`;
        $('#kpiRIR').textContent = rirC ? (rirS / rirC).toFixed(1) : '–';

        // Update weekly goal
        updateWeeklyGoal();
    }

    /* =================== Progreso por set (texto) =================== */
    // Cache for progress calculations to avoid repeated expensive operations
    const progressCache = new Map();
    const getCacheKey = (sessionId, exId, setId) => `${sessionId}-${exId}-${setId}`;

    // Helper to get sorted history for an exercise (Cached)
    function getExerciseHistory(exerciseName) {
        if (!app.exerciseHistoryCache) app.exerciseHistoryCache = {};
        if (app.exerciseHistoryCache[exerciseName]) return app.exerciseHistoryCache[exerciseName];

        // Optimized: single pass filter and sort
        const history = [];
        for (let i = 0; i < app.sessions.length; i++) {
            const s = app.sessions[i];
            if (s.exercises) {
                for (let j = 0; j < s.exercises.length; j++) {
                    if (s.exercises[j].name === exerciseName) {
                        history.push(s);
                        break; // Found exercise in this session, move to next session
                    }
                }
            }
        }
        
        // Sort by date
        history.sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date));

        app.exerciseHistoryCache[exerciseName] = history;
        return history;
    }

    function progressText(currentSession, currentEx, currentSet) {
        // Check cache first - include set values in cache key to invalidate when they change
        const setValuesKey = `${currentSet.kg || ''}-${currentSet.reps || ''}-${currentSet.rir || ''}`;
        const cacheKey = `${getCacheKey(currentSession.id, currentEx.id, currentSet.id)}-${setValuesKey}`;
        if (progressCache.has(cacheKey)) {
            return progressCache.get(cacheKey);
        }

        const history = getExerciseHistory(currentEx.name);
        if (!history || history.length === 0) {
            const result = '<span class="progress--same">Primera sesión</span>';
            progressCache.set(cacheKey, result);
            return result;
        }

        // Find current session index
        // Since history is sorted by date, we can find where currentSession fits
        const currentSessionDate = parseLocalDate(currentSession.date).getTime();

        // Find the index of the current session in the history
        // We can't rely on ID because the current session might be new/unsaved or just being edited
        // So we look for the session with the same ID or the first one with >= date
        let currentIndex = -1;
        for (let i = 0; i < history.length; i++) {
            if (history[i].id === currentSession.id) {
                currentIndex = i;
                break;
            }
        }

        // If not found by ID (shouldn't happen if it's in app.sessions), fallback to date
        if (currentIndex === -1) {
            for (let i = 0; i < history.length; i++) {
                if (parseLocalDate(history[i].date).getTime() >= currentSessionDate) {
                    currentIndex = i;
                    break;
                }
            }
        }

        // If still -1, it means it's newer than all history (should be appended)
        if (currentIndex === -1) currentIndex = history.length;

        // Look backwards from currentIndex - 1 - optimized loop
        for (let i = currentIndex - 1; i >= 0; i--) {
            const s = history[i];
            // Skip if it's the same session
            if (s.id === currentSession.id) continue;

            // Optimized: direct access instead of find
            if (!s.exercises) continue;
            let ex = null;
            for (let j = 0; j < s.exercises.length; j++) {
                if (s.exercises[j].name === currentEx.name) {
                    ex = s.exercises[j];
                    break;
                }
            }
            if (!ex) continue;

            // Optimized: direct access instead of find
            if (!ex.sets) continue;
            let prevSet = null;
            for (let k = 0; k < ex.sets.length; k++) {
                if (ex.sets[k].setNumber === currentSet.setNumber) {
                    prevSet = ex.sets[k];
                    break;
                }
            }
            
            if (prevSet && (prevSet.kg || prevSet.reps)) {
                const [txt, cls] = compareSets(prevSet, currentSet, currentSet.setNumber);
                const result = `<span class="${cls}">${txt}</span>`;
                progressCache.set(cacheKey, result);
                return result;
            }
        }

        const result = '<span class="progress--same">Primera sesión</span>';
        progressCache.set(cacheKey, result);
        return result;
    }

    // Clear progress cache when sessions change
    const clearProgressCache = () => {
        progressCache.clear();
        app.exerciseHistoryCache = {};
        // Clear DOM element cache when sessions are re-rendered
        domElementCache = new WeakMap();
    };
    function compareSets(prev, curr, setNumber) {
        const pk = parseFloat(prev.kg) || 0;
        const ck = parseFloat(curr.kg) || 0;
        const pr = parseReps(prev.reps);
        const cr = parseReps(curr.reps);
        const pi = parseRIR(prev.rir);
        const ci = parseRIR(curr.rir);
        if (!curr.kg && !curr.reps) return ['Sin datos', 'progress--same'];
        if (ck > pk) return [`+${(ck - pk).toFixed(1)} kg en set ${setNumber}`, 'progress--up'];
        if (ck < pk) return [`-${(pk - ck).toFixed(1)} kg en set ${setNumber}`, 'progress--down'];
        if (cr > pr) return [`Más reps: ${pr} → ${cr}`, 'progress--up'];
        if (cr < pr) return [`Menos reps: ${pr} → ${cr}`, 'progress--down'];
        if (ci < pi) return [`Menos RIR: ${pi} → ${ci}`, 'progress--up'];
        if (ci > pi) return [`Más RIR: ${pi} → ${ci}`, 'progress--down'];
        return ['Sin cambio', 'progress--same'];
    }

    /* =================== Render sesiones =================== */
    // EXTREME PERFORMANCE ARCHITECTURE
    // Event delegation: single global listener for all inputs
    let diaryEventDelegationSetup = false;
    
    // Component-level DOM caches (WeakMap for automatic cleanup)
    const sessionElementCache = new WeakMap(); // session object -> DOM element
    const exerciseElementCache = new WeakMap(); // exercise object -> DOM element
    const setElementCache = new WeakMap(); // set object -> DOM element
    
    // Render state tracking
    let isRendering = false;
    let renderedSessions = new WeakSet(); // Track which sessions are rendered
    
    // IntersectionObserver for lazy loading calculations
    let calculationObserver = null;
    
    // Batch update queue for DOM modifications
    const domUpdateQueue = [];
    let domUpdateScheduled = false;
    
    // Memoization caches
    const sessionRenderCache = new WeakMap();
    const exerciseRenderCache = new WeakMap();
    
    // Setup global event delegation (once)
    function setupDiaryEventDelegation() {
        if (diaryEventDelegationSetup) return;
        diaryEventDelegationSetup = true;
        
        const container = $('#sessions');
        if (!container) return;
        
        // Single listener for all input events (delegation)
        container.addEventListener('input', (e) => {
            const input = e.target;
            if (!input.classList.contains('js-kg') && 
                !input.classList.contains('js-reps') && 
                !input.classList.contains('js-rir')) return;
            
            const setElement = input.closest('[data-set-id]');
            if (!setElement) return;
            
            const sessionEl = input.closest('.session');
            const exerciseEl = input.closest('.exercise');
            if (!sessionEl || !exerciseEl) return;
            
            const sessionId = sessionEl.dataset.id;
            const exId = exerciseEl.dataset.exId;
            const setId = setElement.dataset.setId;
            
            if (!sessionId || !exId || !setId) return;
            
            // Get field name from class
            let field = 'kg';
            if (input.classList.contains('js-reps')) field = 'reps';
            else if (input.classList.contains('js-rir')) field = 'rir';
            
            // Update immediately without re-render
            updateSet(sessionId, exId, setId, field, input.value.trim(), true);
        }, { passive: true });
        
        // Single listener for focus events
        container.addEventListener('focus', (e) => {
            const input = e.target;
            if (!input.classList.contains('js-kg') && 
                !input.classList.contains('js-reps') && 
                !input.classList.contains('js-rir')) return;
            
            const setElement = input.closest('[data-set-id]');
            if (!setElement) return;
            
            const sessionId = input.closest('.session')?.dataset.id;
            const exId = input.closest('.exercise')?.dataset.exId;
            const setId = setElement.dataset.setId;
            
            if (sessionId && exId && setId) {
                restoreOriginalValues(sessionId, exId, setId);
            }
        }, true);
    }
    
    // Batch DOM updates to minimize reflows
    function scheduleDOMUpdate(callback) {
        domUpdateQueue.push(callback);
        if (!domUpdateScheduled) {
            domUpdateScheduled = true;
            requestAnimationFrame(() => {
                domUpdateScheduled = false;
                const queue = domUpdateQueue.splice(0);
                queue.forEach(fn => {
                    try { fn(); } catch (e) { console.warn('DOM update error:', e); }
                });
            });
        }
    }

    function captureInputState() {
        const container = $('#sessions');
        if (!container) return new Map();

        const state = new Map();
        const inputs = container.querySelectorAll('.js-kg, .js-reps, .js-rir');
        if (inputs.length === 0) return state; // Early return if no inputs
        
        const activeElement = document.activeElement;
        const isActive = (el) => el === activeElement;

        // Optimized: traverse DOM once and cache parent relationships
        inputs.forEach(input => {
            const setElement = input.closest('[data-set-id]');
            if (!setElement) return;

            const session = input.closest('.session');
            const exercise = input.closest('.exercise');
            
            const sessionId = session?.dataset.id;
            const exId = exercise?.dataset.exId;
            const setId = setElement.dataset.setId;

            if (sessionId && exId && setId) {
                const key = `${sessionId}::${exId}::${setId}::${input.className}`;
                const hasFocus = isActive(input);
                state.set(key, {
                    value: input.value,
                    hasFocus: hasFocus,
                    selectionStart: hasFocus ? input.selectionStart : 0,
                    selectionEnd: hasFocus ? input.selectionEnd : 0
                });
            }
        });

        return state;
    }

    function restoreInputState(state) {
        if (!state || state.size === 0) return;

        const container = $('#sessions');
        if (!container) return;

        // Optimized: single pass with direct queries (faster than caching for small sets)
        let focusedInput = null;
        let focusData = null;

        state.forEach((data, key) => {
            const parts = key.split('::');
            if (parts.length < 4) return;

            const sessionId = parts[0];
            const exId = parts[1];
            const setId = parts[2];
            const inputClass = parts[3];

            // Direct query - faster for small number of elements
            const session = container.querySelector(`.session[data-id="${sessionId}"]`);
            if (!session) return;

            const exercise = session.querySelector(`.exercise[data-ex-id="${exId}"]`);
            if (!exercise) return;

            const setElement = exercise.querySelector(`[data-set-id="${setId}"]`);
            if (!setElement) return;

            const input = setElement.querySelector(`.${inputClass}`);
            if (!input) return;

            // Restore value immediately
            input.value = data.value;

            // Track focused input
            if (data.hasFocus) {
                focusedInput = input;
                focusData = data;
            }
        });

        // Restore focus immediately if needed
        if (focusedInput && focusData) {
            try {
                focusedInput.focus();
                if (focusedInput.setSelectionRange && typeof focusData.selectionStart === 'number') {
                    focusedInput.setSelectionRange(focusData.selectionStart, focusData.selectionEnd);
                }
            } catch (e) {
                // Ignore focus errors
            }
        }
    }

    // EXTREME PERFORMANCE: Optimized renderSessions
    // Only renders structure, defers all calculations
    function renderSessions() {
        if (isRendering) return;
        isRendering = true;

        const container = $('#sessions');
        const emptyState = $('#emptyState');
        if (!container) {
            isRendering = false;
            return;
        }

        // Setup event delegation once
        setupDiaryEventDelegation();

        // Capture minimal state (only open/closed state)
        const prevDetails = Array.from(container.querySelectorAll('details'));
        const prevOpen = new Set();
        prevDetails.forEach(d => {
            if (d.open) {
                if (d.dataset.dayKey) prevOpen.add(d.dataset.dayKey);
                if (d.dataset.sessionId) prevOpen.add(d.dataset.sessionId);
            }
        });
        const hadPrev = prevDetails.length > 0;

        // Clear only if needed (incremental updates would be better, but for now full clear)
        clearDomCache();
        container.innerHTML = '';

        const hasSessions = hasSessionsThisWeek();
        if (!hasSessions) {
            if (emptyState) {
                emptyState.hidden = false;
                emptyState.style.display = '';
            }
            isRendering = false;
            return;
        }

        if (emptyState) {
            emptyState.hidden = true;
            emptyState.style.display = 'none';
        }

        const week = getWeekSessions();
        const sortedSessions = [...week].sort((a, b) => {
            const aCompleted = !!a.completed;
            const bCompleted = !!b.completed;
            if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;
            return parseLocalDate(a.date) - parseLocalDate(b.date);
        });

        const currentDayId = sortedSessions.find(s => !s.completed)?.id || null;
        
        // Render structure only - NO calculations, NO expensive operations
        const fragment = document.createDocumentFragment();
        sortedSessions.forEach(session => {
            const dayKey = toLocalISO(parseLocalDate(session.date));
            const sessionId = session.id;

            const details = document.createElement('details');
            details.className = 'day-panel card pop';
            details.dataset.dayKey = dayKey;
            details.dataset.sessionId = sessionId;

            if (hadPrev) {
                details.open = prevOpen.has(dayKey) || prevOpen.has(sessionId);
            } else {
                details.open = sessionId === currentDayId;
            }

            // Minimal summary (fast)
            const summary = document.createElement('summary');
            summary.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:10px;cursor:pointer';
            const completedStyle = session.completed ? 'color:#4CAF50' : '';
            summary.innerHTML = `
                <div><strong style="font-weight:800;${completedStyle}">${escapeHtml(session.name)}</strong></div>
                <div style="color:${session.completed ? '#4CAF50' : 'var(--muted)'}">${new Date(session.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}${session.completed ? ' · Completada ✓' : ''}</div>
            `;
            details.appendChild(summary);

            const dayBody = document.createElement('div');
            dayBody.style.cssText = 'display:grid;gap:8px;padding:10px';

            // Clone session card template (fast)
            const card = $('#tpl-session').content.firstElementChild.cloneNode(true);
            card.dataset.id = session.id;
            card.classList.toggle('completed', !!session.completed);
            card.querySelector('.session__title').textContent = session.name;
            const dateEl = card.querySelector('.session__date');
            if (dateEl) dateEl.style.display = 'none';
            const btnComplete = card.querySelector('.js-complete');
            if (btnComplete) btnComplete.setAttribute('aria-pressed', String(!!session.completed));
            if (session.completed) {
                const badge = document.createElement('span');
                badge.className = 'badge-done';
                badge.textContent = 'Completada ✓';
                card.querySelector('.session__titlewrap').appendChild(badge);
            }

            const body = card.querySelector('.session__body');
            const exercisesData = session.exercises || [];
            const exercisesContainer = document.createElement('div');
            exercisesContainer.className = 'exercises-lazy-container';
            exercisesContainer.style.display = 'none';
            body.appendChild(exercisesContainer);

            // Lazy render function - ONLY called when details opens
            let exercisesRendered = false;
            const renderExercisesLazy = () => {
                if (exercisesRendered) return;
                exercisesRendered = true;
                exercisesContainer.style.display = '';

                const isDesktop = window.matchMedia('(min-width: 768px)').matches;
                const fragment = document.createDocumentFragment();
                
                // Render structure ONLY - no calculations
                exercisesData.forEach(ex => {
                    fragment.appendChild(renderExercise(session, ex, isDesktop, true));
                });
                exercisesContainer.appendChild(fragment);
                
                // Schedule calculations in idle time (non-blocking)
                scheduleDOMUpdate(() => {
                    const allSets = [];
                    exercisesData.forEach(ex => {
                        ex.sets?.forEach(set => {
                            allSets.push({ session, ex, set });
                        });
                    });
                    
                    // Process in micro-batches (1 set at a time for extreme responsiveness)
                    let idx = 0;
                    const processNext = () => {
                        if (idx < allSets.length) {
                            updateSetCalculations(allSets[idx].session, allSets[idx].ex, allSets[idx].set);
                            idx++;
                            if (idx < allSets.length) {
                                setTimeout(processNext, 0);
                            }
                        }
                    };
                    setTimeout(processNext, 0);
                });
            };

            details._renderExercises = renderExercisesLazy;

            const addExBtn = card.querySelector('.js-add-ex');
            if (addExBtn) {
                addExBtn.classList.remove('btn--mobile');
                exercisesContainer.appendChild(addExBtn);
            }

            dayBody.appendChild(card);
            details.appendChild(dayBody);
            fragment.appendChild(details);

            // Toggle handler - instant response
            details.addEventListener('toggle', function () {
                if (this.open) {
                    if (this._renderExercises) {
                        this._renderExercises();
                        delete this._renderExercises;
                    }
                    const sessionCard = this.querySelector('.session.card');
                    if (sessionCard) sessionCard.classList.add('animate-in');
                } else {
                    const sessionCard = this.querySelector('.session.card');
                    if (sessionCard) sessionCard.classList.remove('animate-in');
                }
            });

            // Render if already open
            if (details.open && details._renderExercises) {
                details._renderExercises();
                delete details._renderExercises;
                const sessionCard = details.querySelector('.session.card');
                if (sessionCard) sessionCard.classList.add('animate-in');
            }
        });

        container.appendChild(fragment);

        // Update session edit UI in batch
        scheduleDOMUpdate(() => {
            sortedSessions.forEach(session => {
                updateSessionEditUI(session.id);
            });
        });

        isRendering = false;
    }
    // Helper function to update set calculations after initial render
    function updateSetCalculations(session, ex, set) {
        const container = $('#sessions');
        if (!container) return;
        
        const sessionEl = container.querySelector(`.session[data-id="${session.id}"]`);
        if (!sessionEl) return;
        
        const exerciseEl = sessionEl.querySelector(`.exercise[data-ex-id="${ex.id}"]`);
        if (!exerciseEl) return;
        
        const setElement = exerciseEl.querySelector(`[data-set-id="${set.id}"]`);
        if (!setElement) return;
        
        // Update progress
        const progressEl = setElement.querySelector('.progress, .set-progress');
        if (progressEl && progressEl.innerHTML.includes('...')) {
            const cacheKey = `${getCacheKey(session.id, ex.id, set.id)}-${set.kg || ''}-${set.reps || ''}-${set.rir || ''}`;
            let progressHTML = progressCache.get(cacheKey);
            if (!progressHTML) {
                progressHTML = progressText(session, ex, set);
            }
            const prLabel = set.isPR ? (set.prType === 'weight' ? 'Peso' : set.prType === 'volume' ? 'Volumen' : 'Reps') : '';
            if (set.isPR) {
                const badgeClass = progressEl.classList.contains('set-progress') ? 'pr-badge-set' : 'pr-badge';
                progressHTML += `<span class="pr-badge ${badgeClass}">🏆 PR ${prLabel}</span>`;
            }
            progressEl.innerHTML = progressHTML;
        }
        
        // Update 1RM
        if (set.kg && set.reps && !setElement.querySelector('.onerm-display')) {
            const onerm = calculate1RM(set.kg, set.reps);
            if (onerm) {
                const currentBest = app.onerm[ex.name] || 0;
                const isPR = onerm > currentBest;
                const onermHTML = `<span class="${isPR ? 'onerm-pr' : 'onerm-value'}">1RM: ${onerm.toFixed(1)} kg</span>`;
                
                const isDesktop = setElement.tagName === 'TR';
                if (isDesktop) {
                    const onermCell = document.createElement('td');
                    onermCell.className = 'onerm-display';
                    onermCell.innerHTML = onermHTML;
                    setElement.appendChild(onermCell);
                } else {
                    const onermDiv = document.createElement('div');
                    onermDiv.className = 'onerm-display';
                    onermDiv.innerHTML = onermHTML;
                    setElement.appendChild(onermDiv);
                }
            }
        }
    }
    
    function renderExercise(session, ex, isDesktop, deferCalculations = false) {
        const block = $('#tpl-exercise').content.firstElementChild.cloneNode(true);
        block.dataset.exId = ex.id;
        const nameEl = block.querySelector('.exercise__name');
        nameEl.textContent = ex.name;
        nameEl.dataset.sessionId = session.id;
        nameEl.dataset.exId = ex.id;
        nameEl.classList.add('js-editable-name');

        // Add note button to exercise head
        const headEl = block.querySelector('.exercise__head');
        if (headEl) {
            // Check if there are 2+ exercises to show reorder arrows
            // Count from session data instead of DOM to ensure accuracy
            const exerciseCount = (session.exercises || []).length;

            // Get the buttons container (the div that contains + Set and X buttons)
            const buttonsContainer = headEl.querySelector('div:last-child');

            // Add reorder buttons if there are 2+ exercises
            if (exerciseCount >= 2 && buttonsContainer) {
                // Ensure buttons container is flex for horizontal alignment
                buttonsContainer.style.display = 'flex';
                buttonsContainer.style.alignItems = 'center';
                buttonsContainer.style.gap = '6px';

                const upBtn = document.createElement('button');
                upBtn.className = 'btn btn--ghost btn--small exercise-reorder-btn exercise-reorder-up';
                upBtn.setAttribute('aria-label', 'Mover ejercicio arriba');
                upBtn.dataset.sessionId = session.id;
                upBtn.dataset.exId = ex.id;
                upBtn.dataset.direction = 'up';

                const downBtn = document.createElement('button');
                downBtn.className = 'btn btn--ghost btn--small exercise-reorder-btn exercise-reorder-down';
                downBtn.setAttribute('aria-label', 'Mover ejercicio abajo');
                downBtn.dataset.sessionId = session.id;
                downBtn.dataset.exId = ex.id;
                downBtn.dataset.direction = 'down';

                const currentIndex = (session.exercises || []).findIndex(e => e.id === ex.id);
                const setButtonDisabled = (btn, disabled) => {
                    btn.disabled = disabled;
                    if (disabled) {
                        btn.style.opacity = '0.3';
                        btn.style.cursor = 'not-allowed';
                    }
                };
                setButtonDisabled(upBtn, currentIndex === 0);
                setButtonDisabled(downBtn, currentIndex === exerciseCount - 1);

                buttonsContainer.insertBefore(upBtn, buttonsContainer.firstChild);
                buttonsContainer.insertBefore(downBtn, buttonsContainer.firstChild);
            }

            const noteBtn = document.createElement('button');
            noteBtn.className = 'exercise-note-btn';
            const hasNote = getExerciseNote(session.id, ex.id);
            if (hasNote) {
                noteBtn.classList.add('has-note');
                noteBtn.innerHTML = '📝';
            } else {
                noteBtn.innerHTML = '+ Nota';
            }
            noteBtn.setAttribute('aria-label', hasNote ? 'Editar nota del ejercicio' : 'Añadir nota del ejercicio');
            noteBtn.dataset.sessionId = session.id;
            noteBtn.dataset.exId = ex.id;
            headEl.appendChild(noteBtn);
        }

        const mobileContainer = block.querySelector('.sets-container');
        const desktopTable = block.querySelector('.sets');
        const sets = ex.sets || [];

        if (isDesktop) {
            // Hide mobile container to be safe (though it should be empty)
            mobileContainer.style.display = 'none';
            desktopTable.parentElement.parentElement.style.display = ''; // Ensure table container is visible

            // Use document fragment for batch DOM insertion (better performance)
            const fragment = document.createDocumentFragment();
            sets.forEach(set => {
                const row = renderSet(session, ex, set, deferCalculations);
                fragment.appendChild(row);
                // Cache DOM element reference for efficient updates
                domElementCache.set(set, row);
            });
            desktopTable.appendChild(fragment);
        } else {
            // Hide desktop container
            desktopTable.parentElement.parentElement.style.display = 'none';
            mobileContainer.style.display = '';

            // Render all sets at once for immediate complete loading
            const fragment = document.createDocumentFragment();
            sets.forEach((set, i) => {
                const card = renderSetCard(session, ex, set, i, deferCalculations);
                fragment.appendChild(card);
                // Cache DOM element reference for efficient updates
                domElementCache.set(set, card);
            });
            mobileContainer.appendChild(fragment);
        }

        const note = getExerciseNote(session.id, ex.id);
        if (note) {
            const noteDisplay = document.createElement('div');
            noteDisplay.className = 'exercise-note-display';
            const noteText = escapeHtml(note).replace(/\n/g, '<br>');
            noteDisplay.innerHTML = `
                <div class="exercise-note-text">${noteText}</div>
                <div class="exercise-note-actions">
                    <button class="exercise-note-edit" data-session-id="${session.id}" data-ex-id="${ex.id}" aria-label="Editar nota">✏️</button>
                    <button class="exercise-note-delete" data-session-id="${session.id}" data-ex-id="${ex.id}" aria-label="Eliminar nota">🗑️</button>
                </div>
            `;
            block.appendChild(noteDisplay);
        }

        return block;
    }

    function openExerciseNoteDialog(sessionId, exId, exerciseName) {
        const currentNote = getExerciseNote(sessionId, exId);
        const dialog = $('#exerciseNoteDialog');
        const title = $('#exerciseNoteTitle');
        const textarea = $('#exerciseNoteText');

        if (title) title.textContent = `Nota: ${exerciseName}`;
        if (textarea) textarea.value = currentNote || '';
        dialog.dataset.sessionId = sessionId;
        dialog.dataset.exId = exId;

        dialog.showModal();
        if (textarea) {
            setTimeout(() => textarea.focus(), 100);
        }
    }

    function renderSet(session, ex, set, deferCalculations = false) {
        const row = $('#tpl-set').content.firstElementChild.cloneNode(true);
        row.dataset.setId = set.id;
        row.querySelector('.set-num').textContent = set.setNumber;
        const kgInput = row.querySelector('.js-kg');
        const repsInput = row.querySelector('.js-reps');
        const rirInput = row.querySelector('.js-rir');
        if (kgInput) {
            kgInput.value = set.kg || '';
            if (!kgInput.value && (set.planKg || set.kgTemplate)) kgInput.placeholder = set.planKg || set.kgTemplate;
        }
        if (repsInput) {
            repsInput.value = set.reps || '';
            if (!repsInput.value && (set.planReps || set.repsTemplate)) repsInput.placeholder = set.planReps || set.repsTemplate;
        }
        if (rirInput) {
            rirInput.value = set.rir || '';
            if (!rirInput.value && (set.planRir || set.rirTemplate)) rirInput.placeholder = set.planRir || set.rirTemplate;
        }

        // ALWAYS defer calculations - show placeholder
        const progressCell = row.querySelector('.progress');
        if (progressCell) {
            progressCell.innerHTML = '<span class="progress--same">...</span>';
        }
        // 1RM will be calculated later by updateSetCalculations

        return row;
    }

    function renderSetCard(session, ex, set, setIndex = 0, deferCalculations = false) {
        const card = $('#tpl-set-card').content.firstElementChild.cloneNode(true);
        card.dataset.setId = set.id;
        card.style.position = 'relative';
        card.querySelector('.set-number').textContent = `Set ${set.setNumber}`;
        const kgInput = card.querySelector('.js-kg');
        const repsInput = card.querySelector('.js-reps');
        const rirInput = card.querySelector('.js-rir');
        if (kgInput) {
            kgInput.value = set.kg || '';
            if (!kgInput.value && (set.planKg || set.kgTemplate)) kgInput.placeholder = set.planKg || set.kgTemplate;
        }
        if (repsInput) {
            repsInput.value = set.reps || '';
            if (!repsInput.value && (set.planReps || set.repsTemplate)) repsInput.placeholder = set.planReps || set.repsTemplate;
        }
        if (rirInput) {
            rirInput.value = set.rir || '';
            if (!rirInput.value && (set.planRir || set.rirTemplate)) rirInput.placeholder = set.planRir || set.rirTemplate;
        }

        // ALWAYS defer calculations - show placeholder
        const progressEl = card.querySelector('.set-progress');
        if (progressEl) {
            progressEl.innerHTML = '<span class="progress--same">...</span>';
        }
        // 1RM will be calculated later by updateSetCalculations

        return card;
    }

    /* =================== REST TIMER SYSTEM =================== */
    let restTimerInterval = null;
    let restTimerSeconds = 0;
    let restTimerDialog = null;

    function openRestTimer() {
        restTimerDialog = $('#restTimerDialog');
        if (!restTimerDialog) return;

        // Reset timer state
        restTimerSeconds = 0;
        if (restTimerInterval) {
            clearInterval(restTimerInterval);
            restTimerInterval = null;
        }

        // Show selection, hide running timer and completed state
        const timerEls = {
            selection: $('#timerSelection'),
            running: $('#timerRunning'),
            completed: $('#timerCompleted'),
            cancel: $('#timerCancel')
        };
        timerEls.selection.style.display = 'block';
        timerEls.running.style.display = 'none';
        timerEls.completed.style.display = 'none';
        timerEls.cancel.style.display = 'none';

        restTimerDialog.showModal();
    }

    function startRestTimer(minutes) {
        restTimerSeconds = minutes * 60;
        restTimerDialog = $('#restTimerDialog');
        if (!restTimerDialog) return;

        const timerEls = getTimerElements();
        timerEls.selection.style.display = 'none';
        timerEls.running.style.display = 'block';
        timerEls.completed.style.display = 'none';
        timerEls.cancel.style.display = 'block';

        // Update display immediately
        updateTimerDisplay();

        // Start countdown
        if (restTimerInterval) {
            clearInterval(restTimerInterval);
        }

        restTimerInterval = setInterval(() => {
            restTimerSeconds--;
            updateTimerDisplay();

            if (restTimerSeconds <= 0) {
                clearInterval(restTimerInterval);
                restTimerInterval = null;

                const timerEls = getTimerElements();
                timerEls.running.style.display = 'none';
                timerEls.completed.style.display = 'block';
                timerEls.cancel.style.display = 'none';

                setTimeout(() => {
                    if (restTimerDialog) {
                        restTimerDialog.close();
                    }
                }, 2000);
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const timerTimeEl = $('#timerTime');
        if (!timerTimeEl) return;

        const minutes = Math.floor(restTimerSeconds / 60);
        const seconds = restTimerSeconds % 60;
        timerTimeEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function stopRestTimer() {
        if (restTimerInterval) {
            clearInterval(restTimerInterval);
            restTimerInterval = null;
        }
        restTimerSeconds = 0;
        // Reset all timer states
        const timerSelection = $('#timerSelection');
        const timerRunning = $('#timerRunning');
        const timerCompleted = $('#timerCompleted');
        if (timerSelection) timerSelection.style.display = 'block';
        if (timerRunning) timerRunning.style.display = 'none';
        if (timerCompleted) timerCompleted.style.display = 'none';
        if (restTimerDialog) {
            restTimerDialog.close();
        }
    }

    /* =================== PREVIOUS WEEK DATA SYSTEM =================== */
    // Store original values when showing prev week data
    const prevWeekOriginalValues = new Map();

    function togglePrevWeekData(sessionId, exId, clickedButton) {
        if (!clickedButton) return;

        // Find the row or card that contains this set
        const rowOrCard = clickedButton.closest('tr[data-set-id]') || clickedButton.closest('.set-card[data-set-id]');
        if (!rowOrCard) return;

        const setId = rowOrCard.dataset.setId;
        if (!setId) return;

        const session = app.sessions.find(s => s.id === sessionId);
        if (!session) return;

        const exercise = session.exercises.find(e => e.id === exId);
        if (!exercise) return;

        const set = exercise.sets.find(s => s.id === setId);
        if (!set) return;

        const setNumber = set.setNumber;
        const exerciseName = exercise.name;

        // Find input elements
        const kgInput = rowOrCard.querySelector('.js-kg');
        const repsInput = rowOrCard.querySelector('.js-reps');
        const rirInput = rowOrCard.querySelector('.js-rir');

        if (!kgInput || !repsInput || !rirInput) return;

        const isActive = clickedButton.classList.contains('active');
        const storageKey = `${sessionId}-${exId}-${setId}`;

        if (isActive) {
            // Restore original values
            if (prevWeekOriginalValues.has(storageKey)) {
                const original = prevWeekOriginalValues.get(storageKey);
                kgInput.value = original.kg || '';
                repsInput.value = original.reps || '';
                rirInput.value = original.rir || '';
                prevWeekOriginalValues.delete(storageKey);
            }
            // Remove styling classes
            kgInput.classList.remove('showing-prev-week');
            repsInput.classList.remove('showing-prev-week');
            rirInput.classList.remove('showing-prev-week');
            clickedButton.textContent = '👁️';
            clickedButton.classList.remove('active');
            return;
        }

        // Save current values
        const currentValues = {
            kg: kgInput.value || '',
            reps: repsInput.value || '',
            rir: rirInput.value || ''
        };
        prevWeekOriginalValues.set(storageKey, currentValues);

        // Find previous week's data
        const prevWeekData = findPrevWeekSetData(exerciseName, setNumber);

        if (prevWeekData && (prevWeekData.kg || prevWeekData.reps || prevWeekData.rir)) {
            // Replace input values with previous week data
            kgInput.value = prevWeekData.kg || '';
            repsInput.value = prevWeekData.reps || '';
            rirInput.value = prevWeekData.rir || '';

            // Add class to style inputs with theme color
            kgInput.classList.add('showing-prev-week');
            repsInput.classList.add('showing-prev-week');
            rirInput.classList.add('showing-prev-week');
        } else {
            // No data found - clear inputs
            kgInput.value = '';
            repsInput.value = '';
            rirInput.value = '';
        }

        // Update button
        clickedButton.textContent = '👁️‍🗨️';
        clickedButton.classList.add('active');
    }

    function restoreOriginalValues(sessionId, exId, setId) {
        const storageKey = `${sessionId}-${exId}-${setId}`;
        if (!prevWeekOriginalValues.has(storageKey)) return;

        // Find the row or card
        const rowOrCard = document.querySelector(`tr[data-set-id="${setId}"], .set-card[data-set-id="${setId}"]`);
        if (!rowOrCard) return;

        const kgInput = rowOrCard.querySelector('.js-kg');
        const repsInput = rowOrCard.querySelector('.js-reps');
        const rirInput = rowOrCard.querySelector('.js-rir');
        const button = rowOrCard.querySelector('.js-prev-week-data');

        if (!kgInput || !repsInput || !rirInput) return;

        // Restore original values
        const original = prevWeekOriginalValues.get(storageKey);
        kgInput.value = original.kg || '';
        repsInput.value = original.reps || '';
        rirInput.value = original.rir || '';
        prevWeekOriginalValues.delete(storageKey);

        // Remove styling classes
        kgInput.classList.remove('showing-prev-week');
        repsInput.classList.remove('showing-prev-week');
        rirInput.classList.remove('showing-prev-week');

        // Update button
        if (button) {
            button.textContent = '👁️';
            button.classList.remove('active');
        }
    }

    function findPrevWeekSetData(exerciseName, setNumber) {
        if (!exerciseName || !setNumber) return null;

        // Calculate previous week range
        const currentWeekStart = addDays(startOfWeek(), app.weekOffset * 7);
        const prevWeekStart = addDays(currentWeekStart, -7);
        const prevWeekEnd = addDays(prevWeekStart, 6);
        prevWeekEnd.setHours(23, 59, 59, 999);

        // Find sessions in previous week
        const prevWeekSessions = app.sessions.filter(s => {
            if (!s.date) return false;
            const sessionDate = parseLocalDate(s.date);
            return sessionDate >= prevWeekStart && sessionDate <= prevWeekEnd;
        });

        // Find exercise with same name (case-insensitive comparison)
        for (const session of prevWeekSessions) {
            if (!session.exercises || !Array.isArray(session.exercises)) continue;

            const exercise = session.exercises.find(e => e.name && e.name.trim().toLowerCase() === exerciseName.trim().toLowerCase());
            if (!exercise) continue;

            // Find set with same number
            if (!exercise.sets || !Array.isArray(exercise.sets)) continue;

            const set = exercise.sets.find(s => s.setNumber === setNumber);
            if (set) {
                return {
                    kg: set.kg || '',
                    reps: set.reps || '',
                    rir: set.rir || ''
                };
            }
        }

        return null;
    }

    /* =================== ADVANCED FEATURES SYSTEM =================== */

    // Initialize advanced features data
    if (!app.prs) app.prs = {};
    if (!app.onerm) app.onerm = {};
    if (!app.exerciseNotes) app.exerciseNotes = {};
    if (!app.achievements) app.achievements = [];
    if (!app.streak) app.streak = { current: 0, lastDate: null };
    if (!app.weeklyGoal) app.weeklyGoal = { target: 3, current: 0 };

    /* =================== PR Detection System =================== */

    function checkAndRecordPRs(sessionId, exId, setId, exerciseName) {
        const session = app.sessions.find(s => s.id === sessionId);
        if (!session) return;
        const exercise = session.exercises.find(e => e.id === exId);
        if (!exercise) return;
        const currentSet = exercise.sets.find(s => s.id === setId);
        if (!currentSet || !currentSet.kg || !currentSet.reps) return;

        const kg = parseFloat(currentSet.kg) || 0;
        const reps = parseReps(currentSet.reps);
        const volume = kg * reps;

        // Calculate historical max values from all sessions
        let maxKg = 0;
        let maxVolume = 0;
        const maxRepsByKg = {};

        app.sessions.forEach(s => {
            const ex = (s.exercises || []).find(e => e.name === exerciseName);
            if (!ex) return;
            (ex.sets || []).forEach(st => {
                if (st.id === setId) return; // Skip current set
                const stKg = parseFloat(st.kg) || 0;
                const stReps = parseReps(st.reps);
                const stVolume = stKg * stReps;
                if (stKg > maxKg) maxKg = stKg;
                if (stVolume > maxVolume) maxVolume = stVolume;
                if (stKg > 0 && (!maxRepsByKg[stKg] || stReps > maxRepsByKg[stKg])) {
                    maxRepsByKg[stKg] = stReps;
                }
            });
        });

        // Initialize PR data if needed
        if (!app.prs[exerciseName]) {
            app.prs[exerciseName] = { maxKg: 0, maxVolume: 0, maxRepsByKg: {} };
        }

        const prData = app.prs[exerciseName];
        let prDetected = false;
        let prType = '';

        // Check PR weight
        if (kg > maxKg) {
            prData.maxKg = kg;
            prDetected = true;
            prType = 'weight';
            currentSet.isPR = true;
            currentSet.prType = 'weight';
        }

        // Check PR volume
        if (volume > maxVolume) {
            prData.maxVolume = volume;
            prDetected = true;
            prType = prType ? 'multiple' : 'volume';
            if (!currentSet.isPR) {
                currentSet.isPR = true;
                currentSet.prType = 'volume';
            } else {
                currentSet.prType = 'multiple';
            }
        }

        // Check PR reps with same weight
        if (kg > 0 && (!maxRepsByKg[kg] || reps > maxRepsByKg[kg])) {
            if (!prData.maxRepsByKg) prData.maxRepsByKg = {};
            prData.maxRepsByKg[kg] = reps;
            if (!prDetected) {
                prDetected = true;
                prType = 'reps';
                currentSet.isPR = true;
                currentSet.prType = 'reps';
            }
        }

        if (prDetected) {
            save();
            toast(`🏆 Nuevo PR de ${prType === 'weight' ? 'peso' : prType === 'volume' ? 'volumen' : 'repeticiones'} en ${exerciseName}!`, 'ok');
        }
    }

    /* =================== 1RM Calculation System =================== */
    function calculate1RM(kg, reps) {
        if (!kg || !reps || kg <= 0 || reps <= 0) return null;
        const kgNum = parseFloat(kg);
        const repsNum = parseReps(reps);
        if (repsNum <= 0) return null;

        // Epley: 1RM = kg × (1 + reps / 30)
        const epley = kgNum * (1 + repsNum / 30);

        // Brzycki: 1RM = kg × (36 / (37 - reps))
        const brzycki = repsNum >= 37 ? null : kgNum * (36 / (37 - repsNum));

        // Wendler: 1RM = kg × reps^0.1
        const wendler = kgNum * Math.pow(repsNum, 0.1);

        // Average of valid calculations
        const valid = [epley, brzycki, wendler].filter(v => v !== null && isFinite(v));
        return valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
    }

    function update1RM(exerciseName, onermValue) {
        if (!onermValue || !isFinite(onermValue)) return;
        const currentBest = app.onerm[exerciseName] || 0;
        if (onermValue > currentBest) {
            const wasPR = currentBest > 0;
            app.onerm[exerciseName] = onermValue;
            if (wasPR) {
                toast(`🏆 Nuevo PR de 1RM en ${exerciseName}: ${onermValue.toFixed(1)} kg!`, 'ok');
            }
            save();
        }
    }

    /* =================== Goals System =================== */
    if (!app.goals) app.goals = [];
    if (!app.recentAchievements) app.recentAchievements = [];

    function createMilestones(goal) {
        if (!goal.autoMilestones) return [];
        const milestones = [];
        const target = goal.type === 'repsWeight' ? (parseFloat(goal.targetReps) || 0) : (parseFloat(goal.target) || 0);
        let current = parseFloat(goal.current) || 0;

        // If current is 0, try to get actual progress from sessions
        if (current === 0 && goal.exerciseName) {
            current = calculateGoalProgress(goal);
        }

        const diff = target - current;

        // Determine milestone strategy based on goal type and difference
        if (goal.type === 'repsWeight') {
            // For repsWeight: milestones based on target reps
            const targetReps = parseFloat(goal.targetReps) || 0;
            const currentReps = current;
            const repsDiff = targetReps - currentReps;

            if (repsDiff <= 10) {
                // Small difference: use fixed increments
                const increment = Math.max(1, Math.ceil(repsDiff / 4));
                let milestoneValue = currentReps;
                while (milestoneValue < targetReps) {
                    milestoneValue = Math.min(targetReps, milestoneValue + increment);
                    if (milestoneValue > currentReps && milestoneValue < targetReps) {
                        milestones.push({
                            id: uuid(),
                            value: Math.round(milestoneValue),
                            completed: false,
                            completedAt: null
                        });
                    }
                }
            } else {
                // Large difference: use percentage-based milestones (25%, 50%, 75%)
                const percentages = [0.25, 0.5, 0.75];
                percentages.forEach(percent => {
                    const milestoneValue = currentReps + (repsDiff * percent);
                    if (milestoneValue > currentReps && milestoneValue < targetReps) {
                        milestones.push({
                            id: uuid(),
                            value: Math.round(milestoneValue),
                            completed: false,
                            completedAt: null
                        });
                    }
                });
            }
        } else if (goal.type === 'weight' || goal.type === 'reps') {
            // For weight/reps: use percentage-based increments (20%, 40%, 60%, 80%, 100%)
            // Or fixed increments if the difference is small
            if (diff <= 20) {
                // Small difference: use fixed 5kg/rep increments
                const increment = Math.max(1, Math.ceil(diff / 4));
                let milestoneValue = current;
                while (milestoneValue < target) {
                    milestoneValue = Math.min(target, milestoneValue + increment);
                    if (milestoneValue > current && milestoneValue < target) {
                        milestones.push({
                            id: uuid(),
                            value: Math.round(milestoneValue * 10) / 10,
                            completed: false,
                            completedAt: null
                        });
                    }
                }
            } else {
                // Large difference: use percentage-based milestones (25%, 50%, 75%, 100%)
                const percentages = [0.25, 0.5, 0.75];
                percentages.forEach(percent => {
                    const milestoneValue = current + (diff * percent);
                    if (milestoneValue > current && milestoneValue < target) {
                        milestones.push({
                            id: uuid(),
                            value: Math.round(milestoneValue * 10) / 10,
                            completed: false,
                            completedAt: null
                        });
                    }
                });
            }
        } else if (goal.type === 'volume') {
            // For volume: use percentage-based (20%, 40%, 60%, 80%)
            const percentages = [0.2, 0.4, 0.6, 0.8];
            percentages.forEach(percent => {
                const milestoneValue = current + (diff * percent);
                if (milestoneValue > current && milestoneValue < target) {
                    milestones.push({
                        id: uuid(),
                        value: Math.round(milestoneValue * 10) / 10,
                        completed: false,
                        completedAt: null
                    });
                }
            });
        } else {
            // For sessions, streak, exercise: use equal divisions (25%, 50%, 75%)
            const percentages = [0.25, 0.5, 0.75];
            percentages.forEach(percent => {
                const milestoneValue = current + (diff * percent);
                if (milestoneValue > current && milestoneValue < target) {
                    milestones.push({
                        id: uuid(),
                        value: Math.round(milestoneValue * 10) / 10,
                        completed: false,
                        completedAt: null
                    });
                }
            });
        }

        return milestones;
    }

    function calculateGoalProgress(goal) {
        const sessions = app.sessions.filter(s => s.completed);
        let current = 0;

        switch (goal.type) {
            case 'loseWeight':
                // Get current weight from profile
                const currentWeight = parseFloat(app.profile?.weight) || 0;
                if (currentWeight > 0) {
                    // For weight loss, we track how much weight has been lost
                    // If target is 70kg and current is 75kg, progress is 5kg lost (towards 70kg)
                    const initialWeight = goal.initialWeight || currentWeight;
                    current = Math.max(0, initialWeight - currentWeight);
                }
                break;
            case 'gainWeight':
                // Get current weight from profile
                const currentWeightGain = parseFloat(app.profile?.weight) || 0;
                if (currentWeightGain > 0) {
                    // For weight gain, we track how much weight has been gained
                    // If target is 80kg and current is 75kg, progress is 5kg gained (towards 80kg)
                    const initialWeightGain = goal.initialWeight || currentWeightGain;
                    current = Math.max(0, currentWeightGain - initialWeightGain);
                }
                break;
            case 'weight':
                if (goal.exerciseName) {
                    const exerciseSessions = sessions.flatMap(s =>
                        (s.exercises || []).filter(e => e.name === goal.exerciseName)
                    );
                    exerciseSessions.forEach(ex => {
                        (ex.sets || []).forEach(set => {
                            const kg = parseFloat(set.kg) || 0;
                            if (kg > current) current = kg;
                        });
                    });
                }
                break;
            case 'volume':
                sessions.forEach(s => {
                    (s.exercises || []).forEach(ex => {
                        (ex.sets || []).forEach(set => {
                            const kg = parseFloat(set.kg) || 0;
                            const reps = parseReps(set.reps);
                            current += kg * reps;
                        });
                    });
                });
                break;
            case 'reps':
                if (goal.exerciseName) {
                    const exerciseSessions = sessions.flatMap(s =>
                        (s.exercises || []).filter(e => e.name === goal.exerciseName)
                    );
                    exerciseSessions.forEach(ex => {
                        (ex.sets || []).forEach(set => {
                            const reps = parseReps(set.reps);
                            if (reps > current) current = reps;
                        });
                    });
                }
                break;
            case 'repsWeight':
                if (goal.exerciseName && goal.targetKg && goal.targetReps) {
                    const exerciseSessions = sessions.flatMap(s =>
                        (s.exercises || []).filter(e => e.name === goal.exerciseName)
                    );
                    exerciseSessions.forEach(ex => {
                        (ex.sets || []).forEach(set => {
                            const kg = parseFloat(set.kg) || 0;
                            const reps = parseReps(set.reps);
                            // Check if this set was done with at least the target weight
                            // Track the maximum reps achieved with target weight or more
                            if (kg >= goal.targetKg && reps > 0) {
                                current = Math.max(current, reps);
                            }
                        });
                    });
                }
                break;
            case 'sessions':
                current = sessions.length;
                break;
            case 'streak':
                current = app.streak?.current || 0;
                break;
            case 'exercise':
                if (goal.exerciseName) {
                    const exerciseSessions = sessions.flatMap(s =>
                        (s.exercises || []).filter(e => e.name === goal.exerciseName)
                    );
                    current = exerciseSessions.length;
                }
                break;
        }

        return current;
    }

    function updateGoalProgress(goal) {
        const newCurrent = calculateGoalProgress(goal);
        const wasCompleted = goal.completed;
        goal.current = newCurrent;

        // For weight loss/gain, the target is the amount to lose/gain, not the final weight
        if (goal.type === 'loseWeight' || goal.type === 'gainWeight') {
            goal.progress = Math.min(100, (newCurrent / parseFloat(goal.target)) * 100);
            goal.completed = newCurrent >= parseFloat(goal.target);
        } else if (goal.type === 'repsWeight') {
            // For repsWeight, goal is completed when current reps >= target reps (with target weight)
            goal.progress = Math.min(100, (newCurrent / parseFloat(goal.targetReps)) * 100);
            goal.completed = newCurrent >= parseFloat(goal.targetReps);
        } else {
            goal.progress = Math.min(100, (newCurrent / parseFloat(goal.target)) * 100);
            goal.completed = newCurrent >= parseFloat(goal.target);
        }

        // Check milestones
        if (goal.milestones && goal.milestones.length > 0) {
            goal.milestones.forEach(milestone => {
                if (!milestone.completed && newCurrent >= milestone.value) {
                    milestone.completed = true;
                    milestone.completedAt = new Date().toISOString();
                    celebrateMilestone(goal, milestone);
                }
            });
        }

        // Celebrate goal completion
        if (!wasCompleted && goal.completed) {
            celebrateGoal(goal);
        }

        // Adaptive adjustment based on progress
        if (goal.adaptive && !goal.completed) {
            adjustGoalAdaptively(goal);
        }
    }

    function adjustGoalAdaptively(goal) {
        const deadline = goal.deadline ? new Date(goal.deadline) : null;
        if (!deadline) return;

        const now = new Date();
        const daysRemaining = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
        const progress = goal.progress || 0;
        const expectedProgress = ((deadline.getTime() - new Date(goal.createdAt).getTime()) / (now.getTime() - new Date(goal.createdAt).getTime())) * 100;

        if (daysRemaining < 7 && progress < expectedProgress * 0.7) {
            // If behind schedule, suggest adjustment
            const suggestedTarget = goal.current + ((goal.target - goal.current) * 0.8);
            goal.suggestedAdjustment = {
                target: suggestedTarget,
                reason: 'Ajuste sugerido basado en progreso actual'
            };
        }
    }

    function celebrateGoal(goal) {
        const achievement = {
            id: uuid(),
            type: 'goal',
            title: `🎯 Objetivo completado: ${goal.name}`,
            description: `Has alcanzado tu objetivo de ${goal.name}`,
            date: new Date().toISOString(),
            goalId: goal.id
        };

        app.recentAchievements.unshift(achievement);
        if (app.recentAchievements.length > 10) {
            app.recentAchievements = app.recentAchievements.slice(0, 10);
        }

        toast(`🎉 ¡Objetivo completado! ${goal.name}`, 'ok');
        save();
        renderGoals();
        renderRecentAchievements();
        renderAllAchievements();

        // Trigger celebration animation
        setTimeout(() => {
            createConfetti();
            // Find goal item and add celebration class
            const goalItem = $(`.goal-item[data-goal-id="${goal.id}"]`);
            if (goalItem) {
                goalItem.classList.add('fiesta-celebration');
                setTimeout(() => {
                    goalItem.classList.remove('fiesta-celebration');
                }, 600);
            }
        }, 100);
    }

    function celebrateMilestone(goal, milestone) {
        // Trigger celebration animation for milestone
        setTimeout(() => {
            createConfetti();
        }, 100);
        const achievement = {
            id: uuid(),
            type: 'milestone',
            title: `🏆 Hito alcanzado: ${milestone.value}`,
            description: `Hito del objetivo "${goal.name}"`,
            date: new Date().toISOString(),
            goalId: goal.id,
            milestoneId: milestone.id
        };

        app.recentAchievements.unshift(achievement);
        if (app.recentAchievements.length > 10) {
            app.recentAchievements = app.recentAchievements.slice(0, 10);
        }

        toast(`🎯 Hito alcanzado: ${milestone.value}`, 'ok');
        save();
        renderGoals();
        renderRecentAchievements();
        renderAllAchievements();

        // Trigger celebration animation for milestone
        setTimeout(() => {
            createConfetti();
        }, 100);
    }

    function addGoal(goalData) {
        // Create temporary goal object to calculate current progress
        const tempGoal = {
            type: goalData.type,
            target: parseFloat(goalData.target) || 0,
            targetKg: goalData.type === 'repsWeight' ? parseFloat(goalData.target) : null,
            targetReps: goalData.repsTarget || null,
            exerciseName: goalData.exerciseName || null,
            current: 0
        };

        // For weight loss/gain goals, store initial weight
        let initialWeight = null;
        if (goalData.type === 'loseWeight' || goalData.type === 'gainWeight') {
            initialWeight = parseFloat(app.profile?.weight) || 0;
        }

        // Calculate actual current progress before creating milestones
        const actualCurrent = calculateGoalProgress(tempGoal);

        const goal = {
            id: uuid(),
            name: goalData.name,
            type: goalData.type,
            target: parseFloat(goalData.target) || 0,
            targetKg: goalData.type === 'repsWeight' ? parseFloat(goalData.target) : null,
            targetReps: goalData.repsTarget || null,
            current: actualCurrent,
            progress: 0,
            completed: false,
            exerciseName: goalData.exerciseName || null,
            deadline: goalData.deadline || null,
            autoMilestones: goalData.autoMilestones || false,
            adaptive: true,
            createdAt: new Date().toISOString(),
            initialWeight: initialWeight,
            milestones: goalData.autoMilestones ? createMilestones({
                type: goalData.type,
                target: goalData.target,
                targetKg: goalData.type === 'repsWeight' ? parseFloat(goalData.target) : null,
                targetReps: goalData.repsTarget || null,
                current: actualCurrent,
                exerciseName: goalData.exerciseName || null,
                autoMilestones: true
            }) : []
        };

        updateGoalProgress(goal);
        app.goals.push(goal);
        save();
        renderGoals();
        toast('Objetivo creado', 'ok');
    }

    function deleteGoal(goalId) {
        app.goals = app.goals.filter(g => g.id !== goalId);
        save();
        renderGoals();
    }

    function renderGoals() {
        const list = $('#goalsList');
        const empty = $('#noGoals');
        if (!list) return;

        // Update all goals progress
        app.goals.forEach(goal => updateGoalProgress(goal));

        if (!app.goals || app.goals.length === 0) {
            if (empty) empty.hidden = false;
            if (list) list.innerHTML = '';
            return;
        }

        if (empty) empty.hidden = true;
        list.innerHTML = '';

        app.goals.forEach(goal => {
            const item = document.createElement('div');
            item.className = `goal-item ${goal.completed ? 'completed' : ''}`;

            const progressPercent = Math.min(100, goal.progress || 0);

            // Format goal display based on type
            let goalDisplay = '';
            if (goal.type === 'repsWeight' && goal.targetKg && goal.targetReps) {
                goalDisplay = `${Math.round(goal.current)} / ${goal.targetReps} reps (con ${goal.targetKg} kg)`;
            } else {
                goalDisplay = `${goal.current.toFixed(1)} / ${goal.target}`;
            }

            const createdDate = goal.createdAt ? new Date(goal.createdAt).toLocaleDateString('es-ES') : '';
            item.innerHTML = `
                        <div class="goal-header">
                            <h4 class="goal-title">${escapeHtml(goal.name)}</h4>
                            <div class="goal-actions">
                                <button class="btn btn--small btn--ghost js-delete-goal" data-goal-id="${goal.id}" aria-label="Eliminar objetivo">✕</button>
                            </div>
                        </div>
                        <div class="goal-progress">
                            <div class="goal-stats">
                                <span>${goalDisplay}</span>
                                <span>${progressPercent.toFixed(0)}%</span>
                            </div>
                            <div class="goal-progress-bar">
                                <div class="goal-progress-fill ${goal.completed ? 'completed' : ''}" style="width: ${progressPercent}%"></div>
                            </div>
                            ${createdDate ? `<div class="goal-date" style="color: #000000; font-size: 0.75rem; margin-top: 6px; opacity: 0.7;">Creado: ${createdDate}</div>` : ''}
                        </div>
                        ${goal.milestones && goal.milestones.length > 0 ? `
                            <div class="goal-milestones">
                                ${goal.milestones.map(m => {
                let milestoneText = m.value;
                if (goal.type === 'repsWeight') {
                    milestoneText = `${Math.round(m.value)} REPS`;
                } else if (goal.type === 'weight') {
                    milestoneText = `${m.value} KG`;
                }
                return `
                                    <div class="milestone-item ${m.completed ? 'completed' : ''}">
                                        <div class="milestone-check">${m.completed ? '✓' : ''}</div>
                                        <span>${milestoneText}</span>
                                    </div>
                                `;
            }).join('')}
                            </div>
                        ` : ''}
                    `;

            const deleteBtn = item.querySelector('.js-delete-goal');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    app.deleteTarget = { type: 'goal', goalId: goal.id };
                    showConfirmDialog('¿Eliminar este objetivo?');
                });
            }

            list.appendChild(item);
        });
    }

    function updateAchievementsByTime() {
        if (!app.recentAchievements) app.recentAchievements = [];
        if (!app.achievements) app.achievements = [];

        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        twoWeeksAgo.setHours(0, 0, 0, 0);

        const recent = [];
        const toMove = [];

        app.recentAchievements.forEach(achievement => {
            const achievementDate = new Date(achievement.date);
            achievementDate.setHours(0, 0, 0, 0);

            if (achievementDate >= twoWeeksAgo) {
                recent.push(achievement);
            } else {
                toMove.push(achievement);
            }
        });

        // Move old achievements to all achievements
        if (toMove.length > 0) {
            toMove.forEach(achievement => {
                // Check if already exists in all achievements
                const exists = app.achievements.some(a => a.id === achievement.id);
                if (!exists) {
                    app.achievements.push(achievement);
                }
            });

            app.achievements.sort((a, b) => new Date(b.date) - new Date(a.date));
            app.recentAchievements = recent;
            save();
        }
    }

    function deleteAchievement(achievementId, isRecent = false) {
        // Remove from both lists to ensure complete deletion
        app.recentAchievements = (app.recentAchievements || []).filter(a => a.id !== achievementId);
        app.achievements = (app.achievements || []).filter(a => a.id !== achievementId);
        save();
        renderRecentAchievements();
        renderAllAchievements();
    }

    function renderRecentAchievements() {
        updateAchievementsByTime();

        const container = $('#recentAchievements');
        if (!container) return;

        if (!app.recentAchievements || app.recentAchievements.length === 0) {
            container.innerHTML = '<div class="routine-empty">Aún no hay logros recientes.</div>';
            return;
        }

        container.innerHTML = '';
        app.recentAchievements.forEach(achievement => {
            const badge = document.createElement('div');
            badge.className = `achievement-badge ${achievement.type === 'milestone' ? 'achievement-milestone' : ''}`;
            const date = new Date(achievement.date).toLocaleDateString('es-ES');
            const icon = achievement.type === 'goal' ? '🎯' : achievement.type === 'milestone' ? '🏆' : achievement.type === 'reps-weight' ? '💪' : '🏆';
            badge.innerHTML = `
                        <div class="achievement-icon">${icon}</div>
                        <div class="achievement-text">
                            <strong>${achievement.title}</strong>
                            <div class="achievement-date">${date}</div>
                        </div>
                        <button class="achievement-delete-btn" aria-label="Eliminar logro" title="Eliminar logro">✕</button>
                    `;
            const deleteBtn = badge.querySelector('.achievement-delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteAchievement(achievement.id, true);
            });
            container.appendChild(badge);
        });
    }

    function renderAllAchievements() {
        const container = $('#allAchievements');
        if (!container) return;

        // Combine recent and all achievements, removing duplicates
        const allAchievements = [];
        const seenIds = new Set();

        // Add all achievements first
        (app.achievements || []).forEach(ach => {
            if (!seenIds.has(ach.id)) {
                allAchievements.push(ach);
                seenIds.add(ach.id);
            }
        });

        // Add recent achievements that are older than 2 weeks (should already be moved, but just in case)
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        (app.recentAchievements || []).forEach(ach => {
            const achDate = new Date(ach.date);
            if (achDate < twoWeeksAgo && !seenIds.has(ach.id)) {
                allAchievements.push(ach);
                seenIds.add(ach.id);
            }
        });

        // Sort by date descending
        allAchievements.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (allAchievements.length === 0) {
            container.innerHTML = '<div class="routine-empty">Aún no hay logros.</div>';
            return;
        }

        container.innerHTML = '';
        allAchievements.forEach(achievement => {
            const badge = document.createElement('div');
            badge.className = `achievement-badge ${achievement.type === 'milestone' ? 'achievement-milestone' : ''}`;
            const date = new Date(achievement.date).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            const icon = achievement.type === 'goal' ? '🎯' : achievement.type === 'milestone' ? '🏆' : achievement.type === 'reps-weight' ? '💪' : '🏆';
            badge.innerHTML = `
                        <div class="achievement-icon">${icon}</div>
                        <div class="achievement-text">
                            <strong>${achievement.title}</strong>
                            <div class="achievement-date">${date}</div>
                        </div>
                        <button class="achievement-delete-btn" aria-label="Eliminar logro" title="Eliminar logro">✕</button>
                    `;
            const deleteBtn = badge.querySelector('.achievement-delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteAchievement(achievement.id);
            });
            container.appendChild(badge);
        });
    }

    /* =================== Exercise Notes System =================== */
    function getExerciseNoteKey(sessionId, exId) {
        return `${sessionId}_${exId}`;
    }

    function saveExerciseNote(sessionId, exId, note) {
        // Notes are always editable - no edit mode required
        const key = getExerciseNoteKey(sessionId, exId);
        if (note && note.trim()) {
            // Preserve line breaks - don't trim newlines, only leading/trailing whitespace
            app.exerciseNotes[key] = note.replace(/^\s+|\s+$/g, '');
        } else {
            delete app.exerciseNotes[key];
        }

        // Save immediately
        save();
    }

    function getExerciseNote(sessionId, exId) {
        const key = getExerciseNoteKey(sessionId, exId);
        return app.exerciseNotes[key] || '';
    }

    /* =================== Competitive Mode System =================== */
    function updateStreak() {
        const completedSessions = app.sessions.filter(s => s.completed).sort((a, b) => new Date(b.date) - new Date(a.date));
        if (completedSessions.length === 0) {
            app.streak = { current: 0, lastDate: null };
            save();
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let streak = 0;
        let checkDate = new Date(today);

        for (const session of completedSessions) {
            const sessionDate = parseLocalDate(session.date);
            sessionDate.setHours(0, 0, 0, 0);

            const daysDiff = Math.floor((checkDate - sessionDate) / (1000 * 60 * 60 * 24));

            if (daysDiff === 0) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else if (daysDiff === 1) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        app.streak = { current: streak, lastDate: completedSessions[0]?.date || null };
        save();
    }

    function updateWeeklyGoal() {
        const { ws, we } = getVisibleWeek();
        const weekSessions = app.sessions.filter(s => {
            const d = parseLocalDate(s.date);
            return d >= ws && d <= we && s.completed;
        });
        app.weeklyGoal.current = weekSessions.length;
        save();
    }

    function checkAchievements() {
        const achievements = [];
        const completedSessions = app.sessions.filter(s => s.completed);
        const totalVolume = app.sessions.reduce((sum, s) => {
            return sum + (s.exercises || []).reduce((exSum, ex) => {
                return exSum + (ex.sets || []).reduce((setSum, set) => {
                    const kg = parseFloat(set.kg) || 0;
                    const reps = parseReps(set.reps);
                    return setSum + (kg * reps);
                }, 0);
            }, 0);
        }, 0);

        // Check existing achievements to avoid duplicates
        const existingIds = new Set((app.achievements || []).map(a => a.id));

        // 10 sessions completed
        if (completedSessions.length >= 10 && !existingIds.has('10_sessions')) {
            achievements.push({ id: '10_sessions', icon: '🎯', title: '10 sesiones completadas', date: new Date().toISOString() });
        }

        // First week complete
        const weeks = new Set(completedSessions.map(s => {
            const d = parseLocalDate(s.date);
            return startOfWeek(d).toISOString();
        }));
        if (weeks.size >= 1 && !existingIds.has('first_week')) {
            achievements.push({ id: 'first_week', icon: '🌟', title: 'Tu primera semana completa', date: new Date().toISOString() });
        }

        // First PR
        const hasPR = Object.keys(app.prs || {}).length > 0;
        if (hasPR && !existingIds.has('first_pr')) {
            achievements.push({ id: 'first_pr', icon: '🏆', title: 'Primer PR de peso', date: new Date().toISOString() });
        }

        // 7 day streak
        if (app.streak && app.streak.current >= 7 && !existingIds.has('streak_7')) {
            achievements.push({ id: 'streak_7', icon: '🔥', title: 'Racha de 7 días', date: new Date().toISOString() });
        }

        // 5000 kg volume
        if (totalVolume >= 5000 && !existingIds.has('volume_5k')) {
            achievements.push({ id: 'volume_5k', icon: '💪', title: '5000 kg de volumen total', date: new Date().toISOString() });
        }

        if (achievements.length > 0) {
            if (!app.achievements) app.achievements = [];
            app.achievements.push(...achievements);
            app.achievements.sort((a, b) => new Date(b.date) - new Date(a.date));
            save();
            achievements.forEach(ach => {
                toast(`${ach.icon} ${ach.title}!`, 'ok');
            });
        }
    }

    function renderCompetitiveMode() {
        updateStreak();
        updateWeeklyGoal();
        checkAchievements();

        const streakEl = $('#currentStreak');
        if (streakEl) streakEl.textContent = app.streak?.current || 0;

        const goalProgressEl = $('#weeklyGoalProgress');
        const goalBarEl = $('#weeklyGoalBar');
        if (goalProgressEl && goalBarEl) {
            const current = app.weeklyGoal?.current || 0;
            const target = app.weeklyGoal?.target || 3;
            goalProgressEl.textContent = `${current} / ${target}`;
            const percentage = Math.min((current / target) * 100, 100);
            goalBarEl.style.width = `${percentage}%`;
        }

        const achievementsList = $('#achievementsList');
        if (achievementsList) {
            const achievements = app.achievements || [];
            if (achievements.length === 0) {
                achievementsList.innerHTML = '<div class="routine-empty">Aún no hay logros. ¡Sigue entrenando!</div>';
            } else {
                achievementsList.innerHTML = achievements.map(ach => {
                    const date = new Date(ach.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
                    return `
                        <div class="achievement-item">
                            <div class="achievement-icon">${ach.icon}</div>
                            <div class="achievement-content">
                                <div class="achievement-title">${ach.title}</div>
                                <div class="achievement-date">${date}</div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }
    }

    /* =================== Copy Last Week Workout =================== */
    function copyLastWeekWorkout() {
        const { ws } = getVisibleWeek();
        const lastWeekStart = addDays(ws, -7);
        const lastWeekEnd = addDays(lastWeekStart, 6);
        lastWeekEnd.setHours(23, 59, 59, 999);

        // Find sessions from last week
        const lastWeekSessions = app.sessions.filter(s => {
            const d = parseLocalDate(s.date);
            return d >= lastWeekStart && d <= lastWeekEnd;
        }).sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date));

        if (lastWeekSessions.length === 0) {
            toast('No hay entrenamientos en la semana pasada para copiar', 'warn');
            return;
        }

        // Get today's day of week (Monday=1, Sunday=7)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let todayDayOfWeek = today.getDay();
        if (todayDayOfWeek === 0) todayDayOfWeek = 7; // Sunday = 7
        const targetDayIndex = todayDayOfWeek - 1; // 0-6 for Monday-Sunday

        // Find session from same day last week
        const lastWeekSameDay = lastWeekSessions.find(s => {
            const sDate = parseLocalDate(s.date);
            let sDayOfWeek = sDate.getDay();
            if (sDayOfWeek === 0) sDayOfWeek = 7;
            return (sDayOfWeek - 1) === targetDayIndex;
        });

        if (!lastWeekSameDay) {
            const dayNames = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
            toast(`No hay entrenamiento del ${dayNames[targetDayIndex]} de la semana pasada`, 'warn');
            return;
        }

        // Create new session with today's date
        const newDate = toLocalISO(today);
        const newSession = {
            id: uuid(),
            name: lastWeekSameDay.name,
            date: newDate,
            completed: false,
            exercises: (lastWeekSameDay.exercises || []).map(ex => ({
                id: uuid(),
                name: ex.name,
                sets: (ex.sets || []).map(set => ({
                    id: uuid(),
                    setNumber: set.setNumber || 1,
                    kg: set.kg || '',
                    reps: set.reps || '',
                    rir: set.rir || '',
                    planKg: set.planKg || '',
                    planReps: set.planReps || '',
                    planRir: set.planRir || ''
                }))
            }))
        };

        app.sessions.push(newSession);
        save();
        refresh();
        toast(`Entrenamiento copiado de la semana pasada: ${newSession.name}`, 'ok');
    }

    /* =================== Manual Save System =================== */
    function startEditingSession(sessionId) {
        const session = app.sessions.find(s => s.id === sessionId);
        if (!session) return;

        // Create deep copy for snapshot
        app.sessionSnapshots[sessionId] = JSON.parse(JSON.stringify(session));

        // Mark as editing
        if (!app.editingSessions[sessionId]) {
            app.editingSessions[sessionId] = { isEditing: true, hasChanges: false };
        } else {
            app.editingSessions[sessionId].isEditing = true;
            app.editingSessions[sessionId].hasChanges = false;
        }

        updateSessionEditUI(sessionId);
    }

    function saveSessionChanges(sessionId) {
        const session = app.sessions.find(s => s.id === sessionId);
        if (!session) return;

        // Validate session data
        if (!session.name || !session.name.trim()) {
            toast('El nombre de la sesión no puede estar vacío', 'warn');
            return;
        }

        // Recalculate PRs and 1RM for all exercises in the session
        session.exercises.forEach(ex => {
            ex.sets.forEach(set => {
                if (set.kg && set.reps) {
                    checkAndRecordPRs(sessionId, ex.id, set.id, ex.name);
                    const onerm = calculate1RM(set.kg, set.reps);
                    if (onerm) {
                        update1RM(ex.name, onerm);
                    }
                }
            });
        });

        // Update goals progress if session is completed
        if (session.completed && app.goals && app.goals.length > 0) {
            app.goals.forEach(goal => updateGoalProgress(goal));
        }

        // Save to persistent storage
        save();

        // Clear editing state
        if (app.editingSessions[sessionId]) {
            app.editingSessions[sessionId].isEditing = false;
            app.editingSessions[sessionId].hasChanges = false;
        }
        delete app.sessionSnapshots[sessionId];

        updateSessionEditUI(sessionId);
        refresh({ preserveTab: true });
        toast('Cambios guardados', 'ok');
    }

    function cancelSessionChanges(sessionId) {
        const session = app.sessions.find(s => s.id === sessionId);
        const snapshot = app.sessionSnapshots[sessionId];
        if (!session || !snapshot) return;

        // Restore from snapshot
        const sessionIndex = app.sessions.findIndex(s => s.id === sessionId);
        if (sessionIndex !== -1) {
            app.sessions[sessionIndex] = JSON.parse(JSON.stringify(snapshot));
        }

        // Clear editing state
        if (app.editingSessions[sessionId]) {
            app.editingSessions[sessionId].isEditing = false;
            app.editingSessions[sessionId].hasChanges = false;
        }
        delete app.sessionSnapshots[sessionId];

        updateSessionEditUI(sessionId);
        refresh({ preserveTab: true });
        toast('Cambios descartados', 'ok');
    }

    function markSessionAsChanged(sessionId) {
        if (app.editingSessions[sessionId]) {
            app.editingSessions[sessionId].hasChanges = true;
        } else {
            app.editingSessions[sessionId] = { isEditing: false, hasChanges: true };
        }
        updateSessionEditUI(sessionId);
    }

    function updateSessionEditUI(sessionId) {
        const sessionEl = document.querySelector(`.session[data-id="${sessionId}"]`);
        if (!sessionEl) return;

        const editState = app.editingSessions[sessionId];
        const isEditing = editState && editState.isEditing;
        const hasChanges = editState && editState.hasChanges;

        // Toggle editing class
        if (isEditing) {
            sessionEl.classList.add('editing');
        } else {
            sessionEl.classList.remove('editing');
        }

        // Toggle changes indicator (only for name changes)
        if (hasChanges) {
            sessionEl.classList.add('has-changes');
            const indicator = sessionEl.querySelector('.session__changes-indicator');
            if (indicator) indicator.style.display = 'flex';
        } else {
            sessionEl.classList.remove('has-changes');
            const indicator = sessionEl.querySelector('.session__changes-indicator');
            if (indicator) indicator.style.display = 'none';
        }

        // Hide edit controls permanently (not needed anymore - edit button opens dialog directly)
        const editControls = sessionEl.querySelector('.session__edit-controls');
        if (editControls) {
            editControls.style.display = 'none';
        }

        // Exercise names are always editable - no restrictions
        // Sets are always editable
        // Exercise deletion is always available - no restrictions
    }

    function hasUnsavedChanges() {
        return Object.values(app.editingSessions).some(state => state.hasChanges);
    }

    function getEditingSessionIds() {
        return Object.keys(app.editingSessions).filter(id =>
            app.editingSessions[id] && app.editingSessions[id].isEditing
        );
    }

    /* =================== CRUD =================== */
    function addSession({ name, date }) {
        app.sessions.push({ id: uuid(), name, date, completed: false, exercises: [] }); save(); refresh();
    }
    function updateSession(id, { name, date }) {
        const session = app.sessions.find(s => s.id === id);
        if (!session) return;
        session.name = name;
        session.date = date;
        save(); refresh();
    }
    function deleteSession(id) {
        app.deleteTarget = { type: 'session', id };
        showConfirmDialog('¿Estás seguro de que quieres eliminar esta sesión? Esta acción no se puede deshacer.');
    }

    function clearWeek() {
        const weekSessions = getWeekSessions();
        if (weekSessions.length === 0) {
            toast('No hay sesiones en esta semana para eliminar', 'warn');
            return;
        }
        app.deleteTarget = { type: 'week', sessionIds: weekSessions.map(s => s.id) };
        const weekLabel = (app.weekOffset === 0) ? 'esta semana'
            : (app.weekOffset === -1 ? 'la semana pasada'
                : (app.weekOffset === 1 ? 'la semana siguiente'
                    : 'esta semana'));
        showConfirmDialog(`¿Estás seguro de que quieres eliminar todas las sesiones de ${weekLabel}? Se eliminarán ${weekSessions.length} sesión${weekSessions.length > 1 ? 'es' : ''}. Esta acción no se puede deshacer.`);
    }
    /* =================== FIESTA CELEBRATION ANIMATION =================== */
    function triggerFiestaCelebration(sessionId) {
        // Check if user prefers reduced motion
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        // Find the session
        const session = app.sessions.find(s => s.id === sessionId);
        if (!session) return;

        // Find the session card element
        const sessionCard = $(`.session[data-id="${sessionId}"]`);
        if (!sessionCard) return;

        // Add celebration class to the card
        sessionCard.classList.add('fiesta-celebration');

        // Remove class after animation completes
        setTimeout(() => {
            sessionCard.classList.remove('fiesta-celebration');
        }, 600);

        // Create level-up notification with session name
        createLevelUpNotification(session.name);
    }

    function triggerLevelUpAnimation(newLevel, oldLevel) {
        // Check if user prefers reduced motion
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        // Remove existing level up overlay if any
        const existing = $('#levelUpOverlay');
        if (existing) {
            existing.remove();
        }

        // Create overlay container
        const overlay = document.createElement('div');
        overlay.id = 'levelUpOverlay';
        overlay.className = 'level-up-overlay';

        // Get level color
        const levelColor = newLevel.color || '#5ea9ff';

        // Create content
        overlay.innerHTML = `
            <div class="level-up-container">
                <div class="level-up-burst" style="--level-color: ${levelColor}"></div>
                <div class="level-up-content-wrapper">
                    <div class="level-up-number" style="color: ${levelColor}">${newLevel.level}</div>
                    <div class="level-up-icon" style="color: ${levelColor}">${newLevel.icon}</div>
                    <div class="level-up-title" style="color: ${levelColor}">${newLevel.name}</div>
                    <div class="level-up-subtitle">¡NIVEL ALCANZADO!</div>
                </div>
                <div class="level-up-particles"></div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Trigger entrance animation
        requestAnimationFrame(() => {
            overlay.classList.add('active');
        });

        // Create confetti particles
        createLevelUpConfetti(levelColor, newLevel.stage);

        // Add glow effect to body
        document.body.classList.add('level-up-glow');
        setTimeout(() => {
            document.body.classList.remove('level-up-glow');
        }, 2000);

        // Remove overlay after animation
        setTimeout(() => {
            overlay.classList.remove('active');
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.remove();
                }
            }, 1000);
        }, 3000);
    }

    /* =================== LEVEL SYSTEM =================== */

    // Definición de los 50 niveles
    const LEVELS_DATA = [
        // Niveles 1-10 (Humanos - Verdes)
        { level: 1, name: 'Novato', days: 0, color: '#7ED957', icon: '👤', stage: 'human' },
        { level: 2, name: 'Iniciado', days: 1, color: '#7ED957', icon: '👟', stage: 'human' },
        { level: 3, name: 'Aprendiz', days: 3, color: '#7ED957', icon: '📖', stage: 'human' },
        { level: 4, name: 'Practicante', days: 5, color: '#7ED957', icon: '⏰', stage: 'human' },
        { level: 5, name: 'Disciplinado', days: 7, color: '#7ED957', icon: '📅', stage: 'human' },
        { level: 6, name: 'Constante', days: 10, color: '#7ED957', icon: '🛡️', stage: 'human' },
        { level: 7, name: 'Dedicado', days: 13, color: '#7ED957', icon: '💪', stage: 'human' },
        { level: 8, name: 'Comprometido', days: 16, color: '#7ED957', icon: '⭐', stage: 'human' },
        { level: 9, name: 'Resuelto', days: 20, color: '#7ED957', icon: '✨', stage: 'human' },
        { level: 10, name: 'Maestro Humano', days: 25, color: '#4CAF50', icon: '👑', stage: 'human' },

        // Niveles 11-20 (Superiores - Azules)
        { level: 11, name: 'Superior', days: 30, color: '#42A5F5', icon: '🏅', stage: 'superior' },
        { level: 12, name: 'Distinguido', days: 35, color: '#42A5F5', icon: '✍️', stage: 'superior' },
        { level: 13, name: 'Reconocido', days: 40, color: '#42A5F5', icon: '🔖', stage: 'superior' },
        { level: 14, name: 'Eminente', days: 45, color: '#42A5F5', icon: '🏛️', stage: 'superior' },
        { level: 15, name: 'Elevado', days: 50, color: '#42A5F5', icon: '⛰️', stage: 'superior' },
        { level: 16, name: 'Sublime', days: 55, color: '#42A5F5', icon: '🏔️', stage: 'superior' },
        { level: 17, name: 'Trascendente', days: 60, color: '#42A5F5', icon: '👣', stage: 'superior' },
        { level: 18, name: 'Excepcional', days: 65, color: '#42A5F5', icon: '🛡️', stage: 'superior' },
        { level: 19, name: 'Extraordinario', days: 70, color: '#42A5F5', icon: '⚡', stage: 'superior' },
        { level: 20, name: 'Maestro Superior', days: 75, color: '#1E88E5', icon: '👑', stage: 'superior' },

        // Niveles 21-30 (Sobrehumanos - Dorados)
        { level: 21, name: 'Sobrehumano', days: 80, color: '#FFC74D', icon: '⬆️', stage: 'superhuman' },
        { level: 22, name: 'Trascendido', days: 85, color: '#FFC74D', icon: '😇', stage: 'superhuman' },
        { level: 23, name: 'Radiante', days: 90, color: '#FFC74D', icon: '✨', stage: 'superhuman' },
        { level: 24, name: 'Laureado', days: 95, color: '#FFC74D', icon: '🌿', stage: 'superhuman' },
        { level: 25, name: 'Alado', days: 100, color: '#FFC74D', icon: '🪽', stage: 'superhuman' },
        { level: 26, name: 'Forjador', days: 105, color: '#FFC74D', icon: '⚒️', stage: 'superhuman' },
        { level: 27, name: 'Forjador Mayor', days: 110, color: '#FFC74D', icon: '🔨', stage: 'superhuman' },
        { level: 28, name: 'Cometa', days: 115, color: '#FFC74D', icon: '☄️', stage: 'superhuman' },
        { level: 29, name: 'Solar', days: 120, color: '#FFC74D', icon: '☀️', stage: 'superhuman' },
        { level: 30, name: 'Maestro Sobrehumano', days: 125, color: '#FFB300', icon: '👑', stage: 'superhuman' },

        // Niveles 31-40 (Divinos - Violetas)
        { level: 31, name: 'Divino', days: 130, color: '#AB47BC', icon: '🐦‍🔥​', stage: 'divine' },
        { level: 32, name: 'Trinitario', days: 135, color: '#AB47BC', icon: '🔺', stage: 'divine' },
        { level: 33, name: 'Mandálico', days: 140, color: '#AB47BC', icon: '🕉️', stage: 'divine' },
        { level: 34, name: 'Nítido', days: 145, color: '#AB47BC', icon: '⚜️', stage: 'divine' },
        { level: 35, name: 'Nebuloso', days: 150, color: '#AB47BC', icon: '☁️', stage: 'divine' },
        { level: 36, name: 'Perfecto', days: 155, color: '#AB47BC', icon: '💎', stage: 'divine' },
        { level: 37, name: 'Astral', days: 160, color: '#AB47BC', icon: '🕐', stage: 'divine' },
        { level: 38, name: 'Estelar', days: 165, color: '#AB47BC', icon: '⭐', stage: 'divine' },
        { level: 39, name: 'Infinito', days: 170, color: '#AB47BC', icon: '♾️', stage: 'divine' },
        { level: 40, name: 'Maestro Divino', days: 175, color: '#8E24AA', icon: '💎', stage: 'divine' },

        // Niveles 41-50 (Abismales/Demoníacos - Rojos)
        { level: 41, name: 'Abismal', days: 180, color: '#E53935', icon: '🌑', stage: 'abyssal' },
        { level: 42, name: 'Fractal', days: 185, color: '#E53935', icon: '🔷', stage: 'abyssal' },
        { level: 43, name: 'Oscuro', days: 190, color: '#E53935', icon: '👁️', stage: 'abyssal' },
        { level: 44, name: 'Encapuchado', days: 195, color: '#E53935', icon: '🧙', stage: 'abyssal' },
        { level: 45, name: 'Vacío', days: 200, color: '#E53935', icon: '🌀', stage: 'abyssal' },
        { level: 46, name: 'Garra', days: 205, color: '#E53935', icon: '🦅', stage: 'abyssal' },
        { level: 47, name: 'Agrietado', days: 210, color: '#E53935', icon: '🌐', stage: 'abyssal' },
        { level: 48, name: 'Distorsionado', days: 215, color: '#E53935', icon: '🌌', stage: 'abyssal' },
        { level: 49, name: 'Angel corrupto', days: 220, color: '#E53935', icon: '👹', stage: 'abyssal' },
        { level: 50, name: 'Demonio Supremo', days: 225, color: '#B71C1C', icon: '😈', stage: 'abyssal' }
    ];

    // Mensajes motivadores por nivel (solo para mostrar en el nivel actual)
    const LEVEL_MESSAGES = {
        1: 'Todo empieza con un paso, y hoy lo has dado.',
        2: 'Tu curiosidad ya es más fuerte que tus dudas.',
        3: 'Creces un poco cada día, incluso cuando no lo ves.',
        4: 'Tu disciplina empieza a construirse desde dentro.',
        5: 'La decisión de seguir ya te diferencia del resto.',
        6: 'Incluso cansado, avanzas: eso es fuerza real.',
        7: 'Tu cuerpo responde porque tu mente ya despertó.',
        8: 'Empiezas a notar de lo que eres capaz.',
        9: 'Confías más en ti, y eso cambia todo.',
        10: 'Ya no eres el mismo: estás preparado para más.',
        11: 'Tu esfuerzo empieza a transformarse en poder.',
        12: 'Has descubierto que puedes mucho más de lo que pensabas.',
        13: 'Cada marca del camino demuestra que sigues de pie.',
        14: 'Has superado momentos duros; eso te ha hecho más fuerte.',
        15: 'Tu constancia ya es una fuerza imparable.',
        16: 'No solo avanzas: inspiras a otros sin darte cuenta.',
        17: 'Incluso herido, sigues luchando: eso es coraje.',
        18: 'Empiezas a convertirte en tu mejor versión.',
        19: 'Tu progreso ya parece imposible para quienes no te conocen.',
        20: 'Has llegado a un nivel que pocos alcanzan.',
        21: 'Tu energía cambia: estás empezando a brillar.',
        22: 'Ahora entiendes que tu límite siempre fue mental.',
        23: 'Fluyes mejor, piensas mejor, avanzas mejor.',
        24: 'Te mueves como alguien que encontró su camino.',
        25: 'Has renacido más fuerte de cada caída.',
        26: 'Tu esencia es más firme, más clara, más tuya.',
        27: 'Te has forjado a base de decisiones difíciles.',
        28: 'Tu presencia impacta más de lo que imaginas.',
        29: 'Destacas porque ya no te escondes.',
        30: 'Tienes la fuerza de alguien que domina su vida.',
        31: 'Tu crecimiento ya roza lo extraordinario.',
        32: 'Has superado barreras que antes parecían imposibles.',
        33: 'Comprendes cosas que solo se aprenden viviendo.',
        34: 'Tu poder interior es estable, profundo y real.',
        35: 'Tu mente se expande más allá de lo común.',
        36: 'Eres capaz de moldear tu destino con tus actos.',
        37: 'Controlas tu tiempo, tu energía y tu camino.',
        38: 'Tu liderazgo surge sin esfuerzo: simplemente eres tú.',
        39: 'Tu fuerza parece infinita para quienes te observan.',
        40: 'Has alcanzado un nivel donde nada te detiene.',
        41: 'Conoces tus sombras y aun así avanzas: eso es grandeza.',
        42: 'Te enfrentas al caos con una calma que pocos poseen.',
        43: 'Has atravesado límites que muchos ni se atreven a mirar.',
        44: 'Sigues adelante incluso cuando el camino oscurece.',
        45: 'Tienes la fortaleza de quien ya no teme al vacío.',
        46: 'Tu mente domina lo que antes te dominaba.',
        47: 'Impactas el mundo de formas que antes soñabas.',
        48: 'Tu energía mueve más de lo que imaginas.',
        49: 'Estás al borde de convertirte en imparable.',
        50: 'Has alcanzado tu máximo poder: esto es solo el principio.'
    };

    // Mensajes motivadores por etapa (para notificaciones al subir de nivel)
    const MOTIVATIONAL_MESSAGES = {
        human: [
            'Cada día estás más cerca de tu mejor versión.',
            'La constancia está empezando a dar frutos.',
            'Gran paso. Ya no eres el mismo que ayer.'
        ],
        superior: [
            'Tu disciplina ya destaca entre los demás.',
            'Estás construyendo algo que pocos logran.',
            'Tu progreso habla por sí solo.'
        ],
        superhuman: [
            'Cruzas límites que muy pocos pisan.',
            'Tu fuerza ya inspira.',
            'Has entrado en territorio legendario.'
        ],
        divine: [
            'Tu voluntad trasciende lo humano.',
            'Estás reescribiendo lo imposible.',
            'Tu energía ya es otra cosa.'
        ],
        abyssal: [
            'Has mirado al abismo, y avanzaste.',
            'Tu poder pertenece a otro plano.',
            'Estás a un paso de convertirte en mito.'
        ]
    };

    // Calcular días completados (sesiones completadas)
    function getCompletedDays() {
        // Include archived days in the count
        const archivedDays = app.totalDaysCompleted || 0;

        // Count current cycle days
        const completedSessions = app.sessions.filter(s => s.completed === true);
        const uniqueDays = new Set();
        completedSessions.forEach(s => {
            if (s.date) {
                uniqueDays.add(s.date);
            }
        });

        return archivedDays + uniqueDays.size;
    }

    // Determinar el nivel actual basado en días completados
    function getCurrentLevel(daysCompleted) {
        // Buscar el nivel más alto que el usuario ha alcanzado
        for (let i = LEVELS_DATA.length - 1; i >= 0; i--) {
            if (daysCompleted >= LEVELS_DATA[i].days) {
                return LEVELS_DATA[i];
            }
        }
        // Si no alcanza ningún nivel, está en nivel 1
        return LEVELS_DATA[0];
    }

    // Obtener el siguiente nivel
    function getNextLevel(currentLevel) {
        const currentIndex = LEVELS_DATA.findIndex(l => l.level === currentLevel.level);
        if (currentIndex < LEVELS_DATA.length - 1) {
            return LEVELS_DATA[currentIndex + 1];
        }
        return null; // Ya está en el nivel máximo
    }

    // Definir rangos de medallas
    const MEDAL_RANGES = [
        { min: 1, max: 5, image: 'images/Level1.png', name: 'Niveles 1-5', color: '#7ED957', stage: 'human' },
        { min: 6, max: 10, image: 'images/Level5.png', name: 'Niveles 6-10', color: '#4CAF50', stage: 'human' },
        { min: 11, max: 15, image: 'images/Level10.png', name: 'Niveles 11-15', color: '#42A5F5', stage: 'superior' },
        { min: 16, max: 20, image: 'images/Level15.png', name: 'Niveles 16-20', color: '#1E88E5', stage: 'superior' },
        { min: 21, max: 25, image: 'images/Level20.png', name: 'Niveles 21-25', color: '#FFC74D', stage: 'superhuman' },
        { min: 26, max: 30, image: 'images/Level25.png', name: 'Niveles 26-30', color: '#FFB300', stage: 'superhuman' },
        { min: 31, max: 35, image: 'images/Level30.png', name: 'Niveles 31-35', color: '#AB47BC', stage: 'divine' },
        { min: 36, max: 40, image: 'images/Level35.png', name: 'Niveles 36-40', color: '#8E24AA', stage: 'divine' },
        { min: 41, max: 45, image: 'images/Level40.png', name: 'Niveles 41-45', color: '#E53935', stage: 'abyssal' },
        { min: 46, max: 49, image: 'images/Level45.png', name: 'Niveles 46-49', color: '#B71C1C', stage: 'abyssal' },
        { min: 50, max: 50, image: null, name: 'Nivel 50', color: '#B71C1C', stage: 'abyssal', special: true }
    ];

    // Obtener rangos desbloqueados basándose en días completados
    function getUnlockedRanges(daysCompleted) {
        const unlockedRanges = [];

        for (const range of MEDAL_RANGES) {
            // Para rangos normales, verificar si el usuario ha alcanzado el nivel mínimo del rango
            const minLevel = LEVELS_DATA.find(l => l.level === range.min);
            if (minLevel && daysCompleted >= minLevel.days) {
                unlockedRanges.push(range);
            }
        }

        return unlockedRanges;
    }

    // Obtener todas las frases motivacionales de un rango con su nivel
    function getRangeMessages(range) {
        const messages = [];
        for (let level = range.min; level <= range.max; level++) {
            if (LEVEL_MESSAGES[level]) {
                messages.push({
                    level: level,
                    message: LEVEL_MESSAGES[level]
                });
            }
        }
        return messages;
    }

    // Función para obtener la imagen de medalla según el nivel
    function getMedalImage(level) {
        const levelNum = typeof level === 'object' ? level.level : level;

        // Regla especial para nivel 50
        if (levelNum === 50) {
            const STORAGE_KEY_50 = 'trainingDiary.level50ReachedAt';
            let reachedAt = null;

            try {
                const stored = localStorage.getItem(STORAGE_KEY_50);
                if (stored) {
                    reachedAt = new Date(stored);
                    // Validar que la fecha sea válida
                    if (isNaN(reachedAt.getTime())) {
                        reachedAt = null;
                    }
                }
            } catch (e) {
                console.warn('Error loading level 50 date:', e);
            }

            // Si no hay fecha guardada o es inválida, guardar la fecha actual
            if (!reachedAt) {
                reachedAt = new Date();
                try {
                    localStorage.setItem(STORAGE_KEY_50, reachedAt.toISOString());
                } catch (e) {
                    console.warn('Error saving level 50 date:', e);
                }
            }

            // Calcular días transcurridos
            const now = new Date();
            const daysDiff = Math.floor((now - reachedAt) / (1000 * 60 * 60 * 24));

            // Si han pasado 10 días o más, usar Level+50.png
            if (daysDiff >= 10) {
                return 'images/Level+50.png';
            }
            // Si no, usar Level50.png
            return 'images/Level50.png';
        }

        // Reglas normales para otros niveles
        if (levelNum >= 1 && levelNum <= 5) {
            return 'images/Level1.png';
        } else if (levelNum >= 6 && levelNum <= 10) {
            return 'images/Level5.png';
        } else if (levelNum >= 11 && levelNum <= 15) {
            return 'images/Level10.png';
        } else if (levelNum >= 16 && levelNum <= 20) {
            return 'images/Level15.png';
        } else if (levelNum >= 21 && levelNum <= 25) {
            return 'images/Level20.png';
        } else if (levelNum >= 26 && levelNum <= 30) {
            return 'images/Level25.png';
        } else if (levelNum >= 31 && levelNum <= 35) {
            return 'images/Level30.png';
        } else if (levelNum >= 36 && levelNum <= 40) {
            return 'images/Level35.png';
        } else if (levelNum >= 41 && levelNum <= 45) {
            return 'images/Level40.png';
        } else if (levelNum >= 46 && levelNum <= 49) {
            return 'images/Level45.png';
        }

        // Si no coincide con ningún rango, retornar null (usará emoji)
        return null;
    }

    // Verificar si el usuario subió de nivel y mostrar mensaje
    function checkLevelUp() {
        if (!app.lastLevel) {
            // Primera vez, guardar nivel actual
            const daysCompleted = getCompletedDays();
            const currentLevel = getCurrentLevel(daysCompleted);
            app.lastLevel = currentLevel.level;
            return;
        }

        const daysCompleted = getCompletedDays();
        const currentLevel = getCurrentLevel(daysCompleted);

        if (currentLevel.level > app.lastLevel) {
            // El usuario subió de nivel
            const oldLevel = app.lastLevel;
            app.lastLevel = currentLevel.level;

            // Si alcanzó el nivel 50 por primera vez, guardar la fecha
            if (currentLevel.level === 50) {
                const STORAGE_KEY_50 = 'trainingDiary.level50ReachedAt';
                try {
                    const existing = localStorage.getItem(STORAGE_KEY_50);
                    // Solo guardar si no existe (primera vez)
                    if (!existing) {
                        localStorage.setItem(STORAGE_KEY_50, new Date().toISOString());
                    }
                } catch (error) {
                    console.warn('Error saving level 50 date:', error);
                }
            }

            // Guardar directamente sin interceptar (evitar recursión)
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
                lastLevel: app.lastLevel || 1
            };
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
            } catch (error) {
                console.error('Error saving to localStorage:', error);
            }

            // Mostrar mensaje motivador
            const messages = MOTIVATIONAL_MESSAGES[currentLevel.stage] || MOTIVATIONAL_MESSAGES.human;
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];

            // Set flag to suppress other animations
            app.justLeveledUp = true;

            // Trigger level up animation (solo cuando realmente sube de nivel)
            if (typeof showLevelUpAnimation === 'function') {
                showLevelUpAnimation(currentLevel);
            } else {
                // Fallback if modal not ready
                toast(`🎉 ¡Nivel ${currentLevel.level} alcanzado! ${currentLevel.name}`, 'ok');
                setTimeout(() => toast(randomMessage, 'ok'), 1500);
            }
        }
    }

    // Renderizar el apartado de niveles
    function renderLevels() {
        const currentLevelDisplay = $('#currentLevelDisplay');
        const levelProgressBar = $('#levelProgressBar');
        const levelStats = $('#levelStats');
        const allLevelsList = $('#allLevelsList');

        if (!currentLevelDisplay || !levelProgressBar || !levelStats || !allLevelsList) return;

        const daysCompleted = getCompletedDays();
        const currentLevel = getCurrentLevel(daysCompleted);
        const nextLevel = getNextLevel(currentLevel);

        // Renderizar nivel actual
        // Obtener frase motivadora específica del nivel
        const motivationalMessage = LEVEL_MESSAGES[currentLevel.level] || 'Sigue adelante, cada día cuenta.';

        // Obtener imagen usando la función getMedalImage
        const imageFile = getMedalImage(currentLevel);

        // Usar imagen si está definida, emoji como fallback
        const levelIcon = imageFile
            ? `<img src="${imageFile}" alt="Nivel ${currentLevel.level}" style="width:80px; height:80px; object-fit:contain; margin-bottom:8px; background:transparent; mix-blend-mode:normal" onerror="this.onerror=null; this.src=''; this.style.display='none'; const fallback = this.parentElement.querySelector('.level-icon-fallback'); if(fallback) fallback.style.display='block';" />
                <div class="level-icon-fallback" style="font-size:3rem; margin-bottom:8px; display:none">${currentLevel.icon}</div>`
            : `<div style="font-size:3rem; margin-bottom:8px">${currentLevel.icon}</div>`;

        currentLevelDisplay.innerHTML = `
            <div style="margin-bottom:16px">
                ${levelIcon}
                <div style="font-size:1.5rem; font-weight:800; color:${currentLevel.color}; margin-bottom:4px">
                    Nivel ${currentLevel.level}
                </div>
                <div style="font-size:1.1rem; color:var(--heading); font-weight:600; margin-bottom:4px">
                    ${currentLevel.name}
                </div>
                <div style="font-size:0.95rem; color:var(--muted); font-style:italic; padding:0 16px">
                    ${motivationalMessage}
                </div>
            </div>
        `;

        // Renderizar barra de progreso
        if (nextLevel) {
            const daysInCurrentLevel = daysCompleted - currentLevel.days;
            const daysNeededForNext = nextLevel.days - currentLevel.days;
            const progressPercent = Math.min(100, (daysInCurrentLevel / daysNeededForNext) * 100);

            levelProgressBar.innerHTML = `
                <div style="margin-bottom:8px; display:flex; justify-content:space-between; align-items:center">
                    <span style="font-size:0.9rem; color:var(--muted)">Progreso hacia ${nextLevel.name}</span>
                    <span style="font-size:0.9rem; color:var(--muted); font-weight:600">
                        ${daysInCurrentLevel} / ${daysNeededForNext} días
                    </span>
                </div>
                <div style="width:100%; height:12px; background:var(--surface-2); border-radius:6px; overflow:hidden; position:relative">
                    <div style="width:${progressPercent}%; height:100%; background:linear-gradient(90deg, ${currentLevel.color}, ${nextLevel.color}); border-radius:6px; transition:width 0.5s ease"></div>
                </div>
            `;
        } else {
            // Nivel máximo alcanzado
            levelProgressBar.innerHTML = `
                <div style="text-align:center; padding:16px; background:var(--surface); border-radius:var(--radius); border:2px solid ${currentLevel.color}">
                    <div style="font-size:1.2rem; font-weight:800; color:${currentLevel.color}; margin-bottom:4px">
                        ¡Nivel Máximo Alcanzado!
                    </div>
                    <div style="font-size:0.9rem; color:var(--muted)">
                        Has alcanzado el nivel más alto. ¡Eres un ${currentLevel.name}!
                    </div>
                </div>
            `;
        }

        // Renderizar estadísticas
        levelStats.innerHTML = `
            <div style="text-align:center; padding:12px; background:var(--surface); border-radius:var(--radius); border:1px solid var(--border)">
                <div style="font-size:0.85rem; color:var(--muted); margin-bottom:4px">Días Completados</div>
                <div style="font-size:1.5rem; font-weight:800; color:var(--heading)">${daysCompleted}</div>
            </div>
            <div style="text-align:center; padding:12px; background:var(--surface); border-radius:var(--radius); border:1px solid var(--border)">
                <div style="font-size:0.85rem; color:var(--muted); margin-bottom:4px">Nivel Actual</div>
                <div style="font-size:1.5rem; font-weight:800; color:${currentLevel.color}">${currentLevel.level}</div>
            </div>
            <div style="text-align:center; padding:12px; background:var(--surface); border-radius:var(--radius); border:1px solid var(--border)">
                <div style="font-size:0.85rem; color:var(--muted); margin-bottom:4px">${nextLevel ? 'Días para Siguiente' : 'Nivel Máximo'}</div>
                <div style="font-size:1.5rem; font-weight:800; color:${nextLevel ? nextLevel.color : currentLevel.color}">
                    ${nextLevel ? (nextLevel.days - daysCompleted) : '—'}
                </div>
            </div>
        `;

        // Renderizar medallas (rangos desbloqueados)
        const medalsList = $('#medalsList');
        if (medalsList) {
            const unlockedRanges = getUnlockedRanges(daysCompleted);
            if (unlockedRanges.length === 0) {
                medalsList.innerHTML = '<div class="routine-empty" style="padding:16px; text-align:center; color:var(--muted); grid-column: 1 / -1;">Aún no has desbloqueado ninguna medalla. ¡Sigue entrenando!</div>';
            } else {
                medalsList.innerHTML = unlockedRanges.map(range => {
                    // Determinar si el rango actual contiene el nivel actual del usuario
                    const isCurrentRange = currentLevel.level >= range.min && currentLevel.level <= range.max;

                    // Para el nivel 50, usar getMedalImage para obtener la imagen correcta (Level50.png o Level+50.png)
                    let imageFile = range.image;
                    if (range.special && range.min === 50) {
                        const level50 = LEVELS_DATA.find(l => l.level === 50);
                        if (level50) {
                            imageFile = getMedalImage(level50);
                        }
                    }

                    const medalIcon = imageFile
                        ? `<img src="${imageFile}" alt="${range.name}" style="width:100%; height:auto; object-fit:contain; background:transparent; mix-blend-mode:normal" onerror="this.onerror=null; this.style.display='none'; const fallback = this.parentElement.querySelector('.medal-icon-fallback'); if(fallback) fallback.style.display='block';" />
                            <div class="medal-icon-fallback" style="font-size:2rem; display:none; text-align:center">🏅</div>`
                        : `<div style="font-size:2rem; text-align:center">🏅</div>`;

                    return `
                        <div class="medal-item" data-range-min="${range.min}" data-range-max="${range.max}" style="cursor:pointer; padding:12px; background:var(--surface); border-radius:var(--radius); border:${isCurrentRange ? '2px' : '1px'} solid ${isCurrentRange ? range.color : 'var(--border)'}; text-align:center; transition:var(--transition-base); display:flex; flex-direction:column; align-items:center; gap:8px" title="Clic para ver detalles">
                            <div style="width:100%; aspect-ratio:1; display:flex; align-items:center; justify-content:center">
                                ${medalIcon}
                            </div>
                            <div style="font-size:0.75rem; font-weight:800; color:${isCurrentRange ? range.color : 'var(--heading)'}">
                                ${range.name}
                            </div>
                            ${isCurrentRange ? '<span style="font-size:0.65rem; padding:2px 6px; background:' + range.color + '; color:white; border-radius:4px; font-weight:600">ACTUAL</span>' : ''}
                        </div>
                    `;
                }).join('');

                // Añadir event listeners para abrir el modal
                medalsList.querySelectorAll('.medal-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const rangeMin = parseInt(item.dataset.rangeMin);
                        const rangeMax = parseInt(item.dataset.rangeMax);
                        const range = MEDAL_RANGES.find(r => r.min === rangeMin && r.max === rangeMax);
                        if (range) {
                            showRangeDetail(range, daysCompleted);
                        }
                    });
                });
            }
        }

        // Renderizar lista de todos los niveles
        renderAllLevelsList(daysCompleted, currentLevel);
    }

    // Mostrar detalles de rango de medalla en modal
    function showRangeDetail(range, daysCompleted) {
        const dialog = $('#medalDetailDialog');
        const content = $('#medalDetailContent');
        const title = $('#medalDetailTitle');

        if (!dialog || !content || !title) return;

        // Obtener imagen del rango
        let imageFile = range.image;
        if (range.special && range.min === 50) {
            const level50 = LEVELS_DATA.find(l => l.level === 50);
            if (level50) {
                imageFile = getMedalImage(level50);
            }
        }

        const medalImage = imageFile
            ? `<img src="${imageFile}" alt="${range.name}" style="width:150px; height:150px; object-fit:contain; background:transparent; mix-blend-mode:normal; margin:0 auto; display:block" onerror="this.onerror=null; this.style.display='none'; const fallback = this.parentElement.querySelector('.medal-detail-fallback'); if(fallback) fallback.style.display='block';" />
                <div class="medal-detail-fallback" style="font-size:4rem; display:none; text-align:center; margin:20px 0">🏅</div>`
            : `<div style="font-size:4rem; text-align:center; margin:20px 0">🏅</div>`;

        // Obtener todas las frases motivacionales del rango
        const rangeMessages = getRangeMessages(range);

        // Obtener el nivel mínimo del rango para mostrar información de desbloqueo
        const minLevel = LEVELS_DATA.find(l => l.level === range.min);
        const unlockDays = minLevel ? minLevel.days : 0;

        title.textContent = `Medalla - ${range.name}`;
        content.innerHTML = `
            <div style="text-align:center">
                ${medalImage}
                <div style="margin-top:20px">
                    <div style="font-size:1.25rem; font-weight:800; color:${range.color}; margin-bottom:8px">
                        ${range.name}
                    </div>
                    <div style="font-size:0.9rem; color:var(--muted); margin-bottom:16px; padding:12px; background:var(--surface); border-radius:var(--radius); border:1px solid var(--border)">
                        <div style="font-weight:600; color:var(--heading); margin-bottom:4px">Desbloqueado a los:</div>
                        <div style="font-size:1.1rem; font-weight:800; color:${range.color}">${unlockDays} ${unlockDays === 1 ? 'día' : 'días'} completados</div>
                    </div>
                    <div style="font-size:0.95rem; color:var(--muted); padding:12px; background:var(--surface); border-radius:var(--radius); border:1px solid var(--border); text-align:left">
                        <div style="font-weight:600; color:var(--heading); margin-bottom:12px; text-align:center">Frases motivacionales:</div>
                        <div style="display:flex; flex-direction:column; gap:8px">
                            ${rangeMessages.map(item => {
            const levelData = LEVELS_DATA.find(l => l.level === item.level);
            return `
                                    <div style="font-style:italic; padding:8px; background:var(--surface-2); border-radius:var(--radius); border-left:3px solid ${range.color}">
                                        <div style="font-size:0.75rem; font-weight:600; color:${levelData ? levelData.color : range.color}; margin-bottom:4px; font-style:normal">
                                            Nivel ${item.level}
                                        </div>
                                        <div>"${item.message}"</div>
                                    </div>
                                `;
        }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        dialog.showModal();
    }

    // Renderizar lista de todos los niveles
    function renderAllLevelsList(daysCompleted, currentLevel) {
        const allLevelsList = $('#allLevelsList');
        if (!allLevelsList) return;

        allLevelsList.innerHTML = LEVELS_DATA.map(level => {
            const isUnlocked = daysCompleted >= level.days;
            const isCurrent = level.level === currentLevel.level;
            const opacity = isUnlocked ? 1 : 0.5;
            const borderColor = isCurrent ? level.color : 'var(--border)';
            const borderWidth = isCurrent ? '2px' : '1px';

            return `
                <div style="display:flex; align-items:center; gap:12px; padding:12px; background:var(--surface); border-radius:var(--radius); border:${borderWidth} solid ${borderColor}; opacity:${opacity}">
                    <div style="font-size:1.5rem; width:40px; text-align:center">${level.icon}</div>
                    <div style="flex:1">
                        <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px">
                            <span style="font-weight:800; color:${isCurrent ? level.color : 'var(--heading)'}">
                                Nivel ${level.level}
                            </span>
                            ${isCurrent ? '<span style="font-size:0.75rem; padding:2px 6px; background:' + level.color + '; color:white; border-radius:4px; font-weight:600"></span>' : ''}
                        </div>
                        <div style="font-size:0.9rem; color:var(--text); font-weight:600; margin-bottom:2px">
                            ${level.name}
                        </div>
                        <div style="font-size:0.8rem; color:var(--muted)">
                            ${level.days} ${level.days === 1 ? 'día' : 'días'} completados
                        </div>
                    </div>
                    <div style="width:24px; height:24px; border-radius:50%; background:${level.color}; display:flex; align-items:center; justify-content:center; flex-shrink:0">
                        ${isUnlocked ? '✓' : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Interceptar save para verificar subida de nivel
    // Esto debe hacerse después de que todas las funciones estén definidas
    (function () {
        const originalSaveFunction = save;
        save = async function () {
            await originalSaveFunction();
            // Solo verificar nivel si las funciones están disponibles
            if (typeof checkLevelUp === 'function') {
                checkLevelUp();
            }
        };
    })();

    // Inicializar nivel al cargar (solo una vez)
    if (typeof app !== 'undefined' && (!app.lastLevel || app.lastLevel === undefined)) {
        if (typeof getCompletedDays === 'function' && typeof getCurrentLevel === 'function') {
            try {
                const daysCompleted = getCompletedDays();
                const currentLevel = getCurrentLevel(daysCompleted);
                app.lastLevel = currentLevel.level;
            } catch (e) {
                console.error('Error initializing level:', e);
                app.lastLevel = 1;
            }
        }
    }

    function createLevelUpNotification(sessionName) {
        // Check if user prefers reduced motion
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        // Remove existing notification if any
        const existing = $('#levelUpNotification');
        if (existing) {
            existing.remove();
        }

        // Create notification container
        const notification = document.createElement('div');
        notification.id = 'levelUpNotification';
        notification.className = 'level-up-notification';

        // Create content
        notification.innerHTML = `
            <div class="level-up-content">
                <div class="level-up-icon">✓</div>
                <div class="level-up-text">
                    <div class="level-up-title">${escapeHtml(sessionName)}</div>
                    <div class="level-up-subtitle">COMPLETADO</div>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Remove notification after animation
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 500);
        }, 3000);
    }

    function toggleCompleted(id) {
        const s = app.sessions.find(x => x.id === id);
        if (!s) return;
        const wasCompleted = s.completed;
        s.completed = !s.completed;
        save();
        // Update competitive mode stats
        updateStreak();
        updateWeeklyGoal();
        checkAchievements();
        // Update goals progress
        if (app.goals && app.goals.length > 0) {
            app.goals.forEach(goal => updateGoalProgress(goal));
            save();
        }

        refresh();

        // If session was just completed, close it and open the next non-completed session
        // This must happen AFTER refresh() so the DOM is updated
        if (s.completed && !wasCompleted) {
            // Use requestAnimationFrame for smooth DOM updates after refresh
            requestAnimationFrame(() => {
                const container = $('#sessions');
                if (container) {
                    // Close the completed session
                    const completedDetails = container.querySelector(`details[data-session-id="${id}"]`);
                    if (completedDetails) {
                        completedDetails.open = false;
                    }

                    // Find and open the next non-completed session
                    const week = getWeekSessions();
                    const sortedSessions = [...week].sort((a, b) => {
                        const aCompleted = !!a.completed;
                        const bCompleted = !!b.completed;
                        if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;
                        return parseLocalDate(a.date) - parseLocalDate(b.date);
                    });

                    const nextSession = sortedSessions.find(session => !session.completed && session.id !== id);
                    if (nextSession) {
                        // Use requestAnimationFrame for smooth opening
                        requestAnimationFrame(() => {
                            const nextDetails = container.querySelector(`details[data-session-id="${nextSession.id}"]`);
                            if (nextDetails) {
                                nextDetails.open = true;
                                // Smooth scroll to the next session
                                requestAnimationFrame(() => {
                                    nextDetails.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                });
                            }
                        });
                    }
                }
            });
        }

        // Trigger celebration animation if session was just completed (not uncompleted)
        if (s.completed && !wasCompleted) {
            // Small delay to ensure DOM is updated
            setTimeout(() => {
                // Only trigger fiesta if we didn't just level up (level up has its own celebration)
                if (!app.justLeveledUp) {
                    triggerFiestaCelebration(id);
                }
            }, 100);
        }
    }
    function addExercise(sessionId, name) {
        const s = app.sessions.find(x => x.id === sessionId); if (!s) return;

        // No edit mode required - always allow adding exercises

        const newEx = { id: uuid(), name, sets: [{ id: uuid(), setNumber: 1, kg: '', reps: '', rir: '' }] };
        s.exercises.push(newEx);
        save();

        // OPTIMIZATION: Update DOM directly
        const sessionEl = document.querySelector(`.session[data-id="${sessionId}"]`);
        if (sessionEl) {
            const container = sessionEl.querySelector('.exercises-lazy-container');
            if (container) {
                const isDesktop = window.matchMedia('(min-width: 768px)').matches;
                container.appendChild(renderExercise(s, newEx, isDesktop));
            }
        }
    }

    function deleteExercise(sessionId, exId) {
        const s = app.sessions.find(x => x.id === sessionId);
        if (!s) return;

        // No edit mode required - always allow deleting exercises (with confirmation)
        const ex = s.exercises.find(e => e.id === exId);
        if (!ex) return;

        // Show confirmation dialog
        app.deleteTarget = { type: 'exercise', sessionId, exId };
        showConfirmDialog(`¿Estás seguro de que quieres eliminar el ejercicio "${ex.name}"? Esta acción no se puede deshacer.`);
    }

    function moveExercise(sessionId, exId, direction) {
        const s = app.sessions.find(x => x.id === sessionId);
        if (!s || !s.exercises) return;

        const exIndex = s.exercises.findIndex(e => e.id === exId);
        if (exIndex === -1) return;

        const newIndex = direction === 'up' ? exIndex - 1 : exIndex + 1;
        if (newIndex < 0 || newIndex >= s.exercises.length) return;

        // Swap exercises
        [s.exercises[exIndex], s.exercises[newIndex]] = [s.exercises[newIndex], s.exercises[exIndex]];

        // Save changes
        save();

        // Refresh with smooth animation
        refresh({ preserveTab: true });
    }

    function updateExerciseName(sessionId, exId, newName, oldName = null) {
        const s = app.sessions.find(x => x.id === sessionId);
        if (!s) return false;
        const ex = s.exercises.find(e => e.id === exId);
        if (!ex) return false;

        // No edit mode required - always allow editing

        if (!newName || !newName.trim()) {
            toast('El nombre del ejercicio no puede estar vacío', 'warn');
            return false;
        }

        const trimmedNewName = newName.trim();
        const trimmedOldName = oldName ? oldName.trim() : ex.name.trim();

        // If name hasn't changed, do nothing
        if (trimmedNewName === trimmedOldName) {
            return true;
        }

        // Remove statistics from old name (don't migrate - old name should not count for stats)
        if (trimmedOldName !== trimmedNewName) {
            // Remove PRs for the old name (only for this specific exercise)
            // Note: We don't migrate stats - the old name should not count for statistics
            // The new name will have its stats recalculated from scratch below

            // Initialize PRs for new name if needed
            if (!app.prs[trimmedNewName]) {
                app.prs[trimmedNewName] = { maxKg: 0, maxVolume: 0, maxRepsByKg: {} };
            }

            // Initialize 1RM for new name if needed
            if (!app.onerm[trimmedNewName]) {
                app.onerm[trimmedNewName] = 0;
            }
        }

        // Update the current exercise name
        ex.name = trimmedNewName;

        // Recalculate statistics for all sets with the new name
        if (ex.sets && ex.sets.length > 0) {
            ex.sets.forEach(set => {
                if (set.kg && set.reps) {
                    checkAndRecordPRs(sessionId, exId, set.id, trimmedNewName);
                    const onerm = calculate1RM(set.kg, set.reps);
                    if (onerm) {
                        update1RM(trimmedNewName, onerm);
                    }
                }
            });
        }

        // Update exercise notes if they exist
        const noteKey = `${sessionId}_${exId}`;
        if (app.exerciseNotes && app.exerciseNotes[noteKey]) {
            // Notes are tied to session and exercise ID, not name, so no migration needed
        }

        save();
        refresh({ preserveTab: true });
        toast(`Ejercicio renombrado: "${trimmedOldName}" → "${trimmedNewName}"`, 'ok');
        return true;
    }

    function addSet(sessionId, exId) {
        const s = app.sessions.find(x => x.id === sessionId); if (!s) return;
        const ex = s.exercises.find(e => e.id === exId); if (!ex) return;

        // Sets can always be added - no edit mode required
        const newSet = { id: uuid(), setNumber: ex.sets.length + 1, kg: '', reps: '', rir: '' };
        ex.sets.push(newSet);
        save();

        // OPTIMIZATION: Update DOM directly instead of full refresh
        const sessionEl = document.querySelector(`.session[data-id="${sessionId}"]`);
        if (sessionEl) {
            const exEl = sessionEl.querySelector(`.exercise[data-ex-id="${exId}"]`);
            if (exEl) {
                const isDesktop = window.matchMedia('(min-width: 768px)').matches;
                if (isDesktop) {
                    const tbody = exEl.querySelector('.sets tbody');
                    if (tbody) {
                        tbody.appendChild(renderSet(s, ex, newSet, false));
                    }
                } else {
                    const container = exEl.querySelector('.sets-container');
                    if (container) {
                        container.appendChild(renderSetCard(s, ex, newSet, ex.sets.length - 1, false));
                    }
                }
            }
        }
    }
    function deleteSet(sessionId, exId, setId) {
        const s = app.sessions.find(x => x.id === sessionId);
        if (!s) return;
        const ex = s.exercises.find(e => e.id === exId);
        if (!ex) return;

        // Check if it's the last set
        if (ex.sets.length <= 1) {
            toast('Debe haber al menos un set', 'warn');
            return;
        }

        // Sets can always be deleted - no edit mode required
        ex.sets = ex.sets.filter(t => t.id !== setId);
        ex.sets.forEach((t, i) => t.setNumber = i + 1);
        save();

        // OPTIMIZATION: Update DOM directly instead of full refresh
        const sessionEl = document.querySelector(`.session[data-id="${sessionId}"]`);
        if (sessionEl) {
            const exEl = sessionEl.querySelector(`.exercise[data-ex-id="${exId}"]`);
            if (exEl) {
                // Remove the set element
                const setEl = exEl.querySelector(`[data-set-id="${setId}"]`);
                if (setEl) setEl.remove();

                // Renumber remaining sets in DOM
                const isDesktop = window.matchMedia('(min-width: 768px)').matches;
                if (isDesktop) {
                    const rows = exEl.querySelectorAll('.sets tbody tr');
                    rows.forEach((row, i) => {
                        const numEl = row.querySelector('.set-num');
                        if (numEl) numEl.textContent = i + 1;
                    });
                } else {
                    const cards = exEl.querySelectorAll('.sets-container .set-card');
                    cards.forEach((card, i) => {
                        const numEl = card.querySelector('.set-number');
                        if (numEl) numEl.textContent = `Set ${i + 1}`;
                    });
                }
            }
        }
    }
    // Debounce timer for set updates to avoid closing keyboard on mobile
    let setUpdateTimer = null;
    let focusedInput = null;

    // Debounced save function for frequent updates (e.g., typing in inputs)
    // This will be initialized inside DOMContentLoaded to access the save function
    var debouncedSave = function () {
        // Fallback: if save is not available yet, do nothing
        // This will be replaced when DOMContentLoaded runs
        if (typeof save === 'function') {
            save();
        }
    };

    // Cache for DOM element references to avoid repeated queries
    let domElementCache = new WeakMap();
    
    // Fallback for requestIdleCallback
    const requestIdleCallback = window.requestIdleCallback || ((callback, options) => {
        const timeout = (options && options.timeout) ? options.timeout : 50;
        return setTimeout(callback, timeout);
    });
    
    // Throttle updateSetUI calls to avoid excessive updates during rapid typing
    let updateSetUITimeouts = new Map();
    
    function updateSet(sessionId, exId, setId, field, value, skipRefresh = false) {
        const s = app.sessions.find(x => x.id === sessionId); if (!s) return;
        const ex = s.exercises.find(e => e.id === exId); if (!ex) return;
        const st = ex.sets.find(t => t.id === setId); if (!st) return;

        // Check if value actually changed to avoid unnecessary updates
        const oldValue = st[field];
        if (oldValue === value) return; // No change, skip update

        // Sets are always editable - no edit mode required
        st[field] = value;

        // Only check PRs and 1RM if kg or reps changed and both are present
        // Defer to avoid blocking input, but use minimal delay
        if ((field === 'kg' || field === 'reps') && st.kg && st.reps) {
            setTimeout(() => {
                checkAndRecordPRs(sessionId, exId, setId, ex.name);
                const onerm = calculate1RM(st.kg, st.reps);
                if (onerm) {
                    update1RM(ex.name, onerm);
                }
            }, 0);
        }

        // Only update goals progress if session is completed AND user finished editing
        // Don't update on every keystroke - too expensive
        // Goals will be updated when session is marked as completed or on save

        // Save automatically (debounced for typing)
        debouncedSave();

        // Update UI incrementally only if needed and throttle to avoid excessive updates
        if (!skipRefresh) {
            const cacheKey = `${sessionId}-${exId}-${setId}`;
            
            // Clear existing timeout for this set
            if (updateSetUITimeouts.has(cacheKey)) {
                clearTimeout(updateSetUITimeouts.get(cacheKey));
            }
            
            // Throttle UI updates - only update after user stops typing for 300ms
            const timeout = setTimeout(() => {
                updateSetUITimeouts.delete(cacheKey);
                // Only update if field affects visual display (kg or reps)
                if (field === 'kg' || field === 'reps') {
                    requestAnimationFrame(() => {
                        updateSetUI(sessionId, exId, setId, st, ex.name);
                    });
                }
            }, 300);
            
            updateSetUITimeouts.set(cacheKey, timeout);
        }
    }

    // Incremental UI update for set changes (PR badges, 1RM) without full re-render
    // Optimized with DOM element caching and memoized calculations
    function updateSetUI(sessionId, exId, setId, set, exerciseName) {
        // Use cached DOM references if available
        let setElement = domElementCache.get(set);
        if (!setElement) {
            const container = $('#sessions');
            if (!container) return;

            const sessionEl = container.querySelector(`.session[data-id="${sessionId}"]`);
            if (!sessionEl) return;

            const exerciseEl = sessionEl.querySelector(`.exercise[data-ex-id="${exId}"]`);
            if (!exerciseEl) return;

            setElement = exerciseEl.querySelector(`[data-set-id="${setId}"]`);
            if (!setElement) return;
            
            // Cache the element reference
            domElementCache.set(set, setElement);
        }

        // Get session and exercise data from app state (cache these too if needed)
        const sessionData = app.sessions.find(s => s.id === sessionId);
        if (!sessionData) return;
        const exData = sessionData.exercises?.find(e => e.id === exId);
        if (!exData) return;

        // Update progress cell/div - use cached calculation if available
        const progressEl = setElement.querySelector('.progress, .set-progress');
        if (progressEl) {
            // Check if we need to recalculate (only if kg or reps changed)
            const setValuesKey = `${set.kg || ''}-${set.reps || ''}-${set.rir || ''}`;
            const cacheKey = `${getCacheKey(sessionData.id, exData.id, set.id)}-${setValuesKey}`;
            const cachedProgress = progressCache.get(cacheKey);
            
            // Only recalculate if not cached - calculate immediately
            if (!cachedProgress) {
                try {
                    let progressHTML = progressText(sessionData, exData, set);
                    if (set.isPR) {
                        const prLabel = set.prType === 'weight' ? 'Peso' : set.prType === 'volume' ? 'Volumen' : 'Reps';
                        const badgeClass = progressEl.classList.contains('set-progress') ? 'pr-badge-set' : 'pr-badge';
                        progressHTML += `<span class="pr-badge ${badgeClass}">🏆 PR ${prLabel}</span>`;
                    }
                    progressEl.innerHTML = progressHTML;
                } catch (e) {
                    console.warn('Error updating progress UI:', e);
                }
            } else {
                // Use cached value
                let progressHTML = cachedProgress;
                if (set.isPR) {
                    const prLabel = set.prType === 'weight' ? 'Peso' : set.prType === 'volume' ? 'Volumen' : 'Reps';
                    const badgeClass = progressEl.classList.contains('set-progress') ? 'pr-badge-set' : 'pr-badge';
                    progressHTML += `<span class="pr-badge ${badgeClass}">🏆 PR ${prLabel}</span>`;
                }
                progressEl.innerHTML = progressHTML;
            }
        }

        // Update 1RM display - only if kg and reps are present - calculate immediately
        if (set.kg && set.reps) {
            try {
                const onerm = calculate1RM(set.kg, set.reps);
                if (onerm) {
                    const currentBest = app.onerm[exerciseName] || 0;
                    const isPR = onerm > currentBest;
                    const onermHTML = `<span class="${isPR ? 'onerm-pr' : 'onerm-value'}">1RM: ${onerm.toFixed(1)} kg</span>`;

                    // Check if 1RM element already exists
                    let onermEl = setElement.querySelector('.onerm-display');
                    if (onermEl) {
                        // Only update if value changed
                        if (onermEl.textContent !== `1RM: ${onerm.toFixed(1)} kg`) {
                            onermEl.innerHTML = onermHTML;
                        }
                    } else {
                        // Create new 1RM element
                        const isDesktop = setElement.tagName === 'TR';
                        if (isDesktop) {
                            const onermCell = document.createElement('td');
                            onermCell.className = 'onerm-display';
                            onermCell.innerHTML = onermHTML;
                            setElement.appendChild(onermCell);
                        } else {
                            const onermDiv = document.createElement('div');
                            onermDiv.className = 'onerm-display';
                            onermDiv.innerHTML = onermHTML;
                            setElement.appendChild(onermDiv);
                        }
                    }
                } else {
                    // Remove 1RM display if kg or reps is empty
                    const onermEl = setElement.querySelector('.onerm-display');
                    if (onermEl) {
                        onermEl.remove();
                    }
                }
            } catch (e) {
                console.warn('Error updating 1RM UI:', e);
            }
        }
    }

    /* =================== Confirm Dialog =================== */
    function showConfirmDialog(message) {
        $('#confirmMessage').textContent = message;
        $('#confirmDialog').showModal();
    }

    /* =================== Estadísticas + Chart =================== */

    // Nueva función para obtener estadísticas de un ejercicio en un período específico
    function getExerciseStatsForPeriod(exerciseName, periodType) {
        let startDate, endDate;
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        switch (periodType) {
            case 'lastWeek':
                // Semana pasada: 7 días antes de la semana actual
                const currentWeekStart = startOfWeek();
                startDate = addDays(currentWeekStart, -7);
                endDate = addDays(startDate, 6);
                break;

            case '4weeks':
                // Hace 4 semanas: de hace 28 a 21 días atrás
                endDate = addDays(today, -21);
                endDate.setHours(23, 59, 59, 999);
                startDate = addDays(today, -28);
                startDate.setHours(0, 0, 0, 0);
                break;

            case '8weeks':
                // Hace 8 semanas: de hace 56 a 49 días atrás
                endDate = addDays(today, -49);
                endDate.setHours(23, 59, 59, 999);
                startDate = addDays(today, -56);
                startDate.setHours(0, 0, 0, 0);
                break;

            case 'beginning':
            default:
                // Desde el principio: todas las sesiones anteriores a la semana actual
                const currentStart = startOfWeek();
                startDate = new Date(2000, 0, 1); // Fecha muy temprana
                endDate = addDays(currentStart, -1);
                endDate.setHours(23, 59, 59, 999);
                break;
        }

        // Filtrar sesiones en el período especificado
        const periodSessions = app.sessions.filter(s => {
            const d = parseLocalDate(s.date);
            return d >= startDate && d <= endDate;
        });

        let maxKg = 0;
        let totalReps = 0;
        let totalVol = 0;
        let rirSum = 0;
        let rirCount = 0;
        let sessionCount = 0;

        periodSessions.forEach(s => {
            const ex = (s.exercises || []).find(e => e.name === exerciseName);
            if (!ex) return;

            sessionCount++;
            (ex.sets || []).forEach(st => {
                const kg = parseFloat(st.kg) || 0;
                const reps = parseReps(st.reps);
                const rir = parseRIR(st.rir);

                maxKg = Math.max(maxKg, kg);
                if (reps > 0) {
                    totalReps += reps;
                    totalVol += kg * reps;
                }
                if (rir > 0) {
                    rirSum += rir;
                    rirCount++;
                }
            });
        });

        return {
            maxKg,
            totalReps,
            totalVol,
            avgRir: rirCount ? (rirSum / rirCount) : 0,
            sessionCount
        };
    }

    // Función para obtener estadísticas de la semana actual
    function getCurrentWeekStats(exerciseName) {
        const { ws, we } = getVisibleWeek();

        const weekSessions = app.sessions.filter(s => {
            const d = parseLocalDate(s.date);
            return d >= ws && d <= we;
        });

        let maxKg = 0;
        let totalReps = 0;
        let totalVol = 0;
        let rirSum = 0;
        let rirCount = 0;
        let sessionCount = 0;

        weekSessions.forEach(s => {
            const ex = (s.exercises || []).find(e => e.name === exerciseName);
            if (!ex) return;

            sessionCount++;
            (ex.sets || []).forEach(st => {
                const kg = parseFloat(st.kg) || 0;
                const reps = parseReps(st.reps);
                const rir = parseRIR(st.rir);

                maxKg = Math.max(maxKg, kg);
                if (reps > 0) {
                    totalReps += reps;
                    totalVol += kg * reps;
                }
                if (rir > 0) {
                    rirSum += rir;
                    rirCount++;
                }
            });
        });

        return {
            maxKg,
            totalReps,
            totalVol,
            avgRir: rirCount ? (rirSum / rirCount) : 0,
            sessionCount
        };
    }

    function archiveCurrentCycle() {
        if (app.sessions.length === 0) {
            toast('No hay sesiones para archivar', 'warn');
            return;
        }

        const cycleName = prompt('Nombre del ciclo (opcional):', `Ciclo ${new Date().toLocaleDateString('es-ES')}`);

        // Calculate current cycle days (only from current sessions, not archived)
        const completedSessions = app.sessions.filter(s => s.completed === true);
        const uniqueDays = new Set();
        completedSessions.forEach(s => {
            if (s.date) {
                uniqueDays.add(s.date);
            }
        });
        const currentCycleDays = uniqueDays.size;

        // Save current level before archiving
        const currentLevel = app.lastLevel || 1;

        const archivedCycle = {
            id: uuid(),
            name: cycleName || `Ciclo ${new Date().toLocaleDateString('es-ES')}`,
            archivedAt: new Date().toISOString(),
            sessions: JSON.parse(JSON.stringify(app.sessions)),
            prs: JSON.parse(JSON.stringify(app.prs || {})),
            onerm: JSON.parse(JSON.stringify(app.onerm || {})),
            achievements: JSON.parse(JSON.stringify(app.achievements || [])),
            streak: JSON.parse(JSON.stringify(app.streak || { current: 0, lastDate: null })),
            weeklyGoal: JSON.parse(JSON.stringify(app.weeklyGoal || { target: 3, current: 0 })),
            lastLevel: currentLevel,
            daysCompleted: currentCycleDays
        };

        app.archivedCycles.push(archivedCycle);

        // Reset current cycle but keep level and accumulate days completed
        app.sessions = [];
        app.prs = {};
        app.onerm = {};
        app.achievements = [];
        app.streak = { current: 0, lastDate: null };
        app.weeklyGoal = { target: 3, current: 0 };
        // Keep level - it accumulates across cycles
        // Add current cycle days to total
        if (!app.totalDaysCompleted) app.totalDaysCompleted = 0;
        app.totalDaysCompleted += currentCycleDays;

        save();
        refresh({ preserveTab: true });
        renderArchivedCycles();
        toast('Ciclo archivado correctamente', 'ok');
    }

    function resumeArchivedCycle(cycleId) {
        const cycle = app.archivedCycles.find(c => c.id === cycleId);
        if (!cycle) {
            toast('Ciclo no encontrado', 'warn');
            return;
        }

        if (app.sessions.length > 0) {
            const confirmResume = confirm('¿Archivar el ciclo actual antes de retomar este ciclo? Si cancelas, se perderán los datos del ciclo actual.');
            if (confirmResume) {
                archiveCurrentCycle();
            } else {
                return;
            }
        }

        // Restore cycle data
        app.sessions = JSON.parse(JSON.stringify(cycle.sessions));
        app.prs = JSON.parse(JSON.stringify(cycle.prs));
        app.onerm = JSON.parse(JSON.stringify(cycle.onerm));
        app.achievements = JSON.parse(JSON.stringify(cycle.achievements));
        app.streak = JSON.parse(JSON.stringify(cycle.streak));
        app.weeklyGoal = JSON.parse(JSON.stringify(cycle.weeklyGoal));

        // Restore level and subtract archived days from total
        const archivedDays = cycle.daysCompleted || 0;
        if (app.totalDaysCompleted >= archivedDays) {
            app.totalDaysCompleted -= archivedDays;
        }
        // Keep the higher level between current and archived
        app.lastLevel = Math.max(app.lastLevel || 1, cycle.lastLevel || 1);

        // Remove from archived cycles
        app.archivedCycles = app.archivedCycles.filter(c => c.id !== cycleId);

        save();
        refresh({ preserveTab: true });
        renderArchivedCycles();
        toast('Ciclo restaurado correctamente', 'ok');
    }

    function renderArchivedCycles() {
        const container = $('#archivedCyclesList');
        if (!container) return;

        container.innerHTML = '';

        if (app.archivedCycles.length === 0) {
            return;
        }

        app.archivedCycles.forEach(cycle => {
            const btn = document.createElement('button');
            btn.className = 'btn btn--ghost';
            btn.type = 'button';
            const date = new Date(cycle.archivedAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            btn.textContent = `📂 ${cycle.name} (${date})`;
            btn.title = `Retomar ciclo: ${cycle.name}`;
            btn.addEventListener('click', () => {
                if (confirm(`¿Retomar el ciclo "${cycle.name}"? Esto restaurará todas las sesiones y estadísticas de ese ciclo.`)) {
                    resumeArchivedCycle(cycle.id);
                }
            });
            container.appendChild(btn);
        });
    }

    // Función buildStats modificada - usa los mismos filtros compartidos que drawChart
    function buildStats() {
        const body = $('#statsBody');
        const sharedMetric = $('#sharedMetric');
        const sharedExercise = $('#sharedExercise');
        const sharedPeriod = $('#sharedPeriod');

        if (!body) return;

        if (app.sessions.length === 0) {
            body.innerHTML = '<tr><td colspan="7" style="padding:16px">No hay datos suficientes</td></tr>';
            return;
        }

        // Use shared filters (same as chart)
        const metric = sharedMetric ? sharedMetric.value : (app.chartState.metric || 'volume');
        // For input field, check value or use 'all' if empty
        let exerciseFilter = 'all';
        if (sharedExercise) {
            const exerciseValue = sharedExercise.value.trim();
            exerciseFilter = exerciseValue === '' ? 'all' : exerciseValue;
        } else {
            exerciseFilter = app.chartState.exercise || 'all';
        }
        const period = sharedPeriod ? parseInt(sharedPeriod.value) : (app.chartState.period || 8);

        // Get exercises to show (filtered by exerciseFilter)
        const allExercises = new Set();
        app.sessions.forEach(s => {
            (s.exercises || []).forEach(e => {
                if (exerciseFilter === 'all' || e.name === exerciseFilter) {
                    allExercises.add(e.name);
                }
            });
        });

        // Calculate current period stats (same logic as weeklyData)
        const base = startOfWeek();
        const currentPeriodSessions = [];
        for (let i = period - 1; i >= 0; i--) {
            const ws = addDays(base, -i * 7), we = addDays(ws, 6);
            const subset = app.sessions.filter(s => {
                const d = parseLocalDate(s.date);
                return d >= ws && d <= we;
            });
            currentPeriodSessions.push(...subset);
        }

        // Calculate comparison period stats (previous period of same length)
        const comparisonPeriodSessions = [];
        for (let i = period * 2 - 1; i >= period; i--) {
            const ws = addDays(base, -i * 7), we = addDays(ws, 6);
            const subset = app.sessions.filter(s => {
                const d = parseLocalDate(s.date);
                return d >= ws && d <= we;
            });
            comparisonPeriodSessions.push(...subset);
        }

        const rows = [...allExercises].map(exerciseName => {
            // Calculate stats for current period
            let currentValue = 0;
            let currentStats = { maxKg: 0, totalReps: 0, totalVol: 0, rirSum: 0, rirCount: 0, sessionCount: 0 };

            currentPeriodSessions.forEach(s => {
                const ex = (s.exercises || []).find(e => e.name === exerciseName);
                if (!ex) return;
                currentStats.sessionCount++;
                (ex.sets || []).forEach(st => {
                    const kg = parseFloat(st.kg) || 0;
                    const reps = parseReps(st.reps);
                    const rir = parseRIR(st.rir);
                    currentStats.maxKg = Math.max(currentStats.maxKg, kg);
                    if (reps > 0) {
                        currentStats.totalReps += reps;
                        currentStats.totalVol += kg * reps;
                    }
                    if (rir > 0) {
                        currentStats.rirSum += rir;
                        currentStats.rirCount++;
                    }
                });
            });

            const currentAvgRir = currentStats.rirCount > 0 ? currentStats.rirSum / currentStats.rirCount : 0;

            // Calculate stats for comparison period
            let comparisonValue = 0;
            let comparisonStats = { maxKg: 0, totalReps: 0, totalVol: 0, rirSum: 0, rirCount: 0, sessionCount: 0 };

            comparisonPeriodSessions.forEach(s => {
                const ex = (s.exercises || []).find(e => e.name === exerciseName);
                if (!ex) return;
                comparisonStats.sessionCount++;
                (ex.sets || []).forEach(st => {
                    const kg = parseFloat(st.kg) || 0;
                    const reps = parseReps(st.reps);
                    const rir = parseRIR(st.rir);
                    comparisonStats.maxKg = Math.max(comparisonStats.maxKg, kg);
                    if (reps > 0) {
                        comparisonStats.totalReps += reps;
                        comparisonStats.totalVol += kg * reps;
                    }
                    if (rir > 0) {
                        comparisonStats.rirSum += rir;
                        comparisonStats.rirCount++;
                    }
                });
            });

            const comparisonAvgRir = comparisonStats.rirCount > 0 ? comparisonStats.rirSum / comparisonStats.rirCount : 0;

            // Calculate metric value based on selected metric
            if (metric === 'volume') {
                currentValue = currentStats.totalVol;
                comparisonValue = comparisonStats.totalVol;
            } else if (metric === 'weight') {
                currentValue = currentStats.maxKg;
                comparisonValue = comparisonStats.maxKg;
            } else if (metric === 'rir') {
                currentValue = currentAvgRir;
                comparisonValue = comparisonAvgRir;
            }

            // Calculate progress - compare current period with previous period of same length
            let progressText = 'Sin datos';
            let progressClass = 'progress--same';
            let baseValue = comparisonValue;

            // Check if comparison period has sufficient data
            // Group comparison period sessions by week to verify we have enough weeks
            const comparisonWeeks = new Set();
            comparisonPeriodSessions.forEach(s => {
                const d = parseLocalDate(s.date);
                const weekStart = startOfWeek(d);
                const weekKey = weekStart.toISOString().split('T')[0];
                comparisonWeeks.add(weekKey);
            });

            // Check if comparison period has sessions for this exercise
            const hasComparisonData = comparisonPeriodSessions.some(s => {
                const ex = (s.exercises || []).find(e => e.name === exerciseName);
                return ex && ex.sets && ex.sets.length > 0;
            });

            // Check if comparison period has enough weeks (should match current period length)
            const hasEnoughWeeks = comparisonWeeks.size >= period;

            // If no comparison period data for this exercise OR not enough weeks, compare with first week of data
            // But only if we have at least 2 weeks of data to compare
            if ((comparisonValue === 0 || !hasComparisonData || !hasEnoughWeeks) && currentValue > 0) {
                // Find first week with this exercise
                const allSessionsWithExercise = [...app.sessions]
                    .filter(s => {
                        const ex = (s.exercises || []).find(e => e.name === exerciseName);
                        return ex && ex.sets && ex.sets.length > 0;
                    })
                    .sort((a, b) => new Date(a.date) - new Date(b.date));

                if (allSessionsWithExercise.length > 0) {
                    // Group sessions by week
                    const sessionsByWeek = new Map();
                    allSessionsWithExercise.forEach(s => {
                        const d = parseLocalDate(s.date);
                        const weekStart = startOfWeek(d);
                        const weekKey = weekStart.toISOString().split('T')[0];

                        if (!sessionsByWeek.has(weekKey)) {
                            sessionsByWeek.set(weekKey, []);
                        }
                        sessionsByWeek.get(weekKey).push(s);
                    });

                    // Get first week
                    const firstWeekKey = Array.from(sessionsByWeek.keys()).sort()[0];
                    const firstWeekSessions = sessionsByWeek.get(firstWeekKey);

                    // Calculate stats for first week
                    const firstWeekStats = { maxKg: 0, totalReps: 0, totalVol: 0, rirSum: 0, rirCount: 0 };
                    firstWeekSessions.forEach(s => {
                        const ex = s.exercises.find(e => e.name === exerciseName);
                        if (ex) {
                            ex.sets.forEach(st => {
                                const kg = parseFloat(st.kg) || 0;
                                const reps = parseReps(st.reps);
                                const rir = parseRIR(st.rir);
                                firstWeekStats.maxKg = Math.max(firstWeekStats.maxKg, kg);
                                if (reps > 0) {
                                    firstWeekStats.totalReps += reps;
                                    firstWeekStats.totalVol += kg * reps;
                                }
                                if (rir > 0) {
                                    firstWeekStats.rirSum += rir;
                                    firstWeekStats.rirCount++;
                                }
                            });
                        }
                    });

                    const firstWeekAvgRir = firstWeekStats.rirCount > 0 ? firstWeekStats.rirSum / firstWeekStats.rirCount : 0;

                    // Get first week value based on metric
                    // When no comparison period exists, compare last week of current period with first week
                    // This gives a meaningful progress percentage (week-to-week comparison)
                    const lastWeekSessions = [];
                    const lastWeekStart = addDays(base, -(period - 1) * 7);
                    const lastWeekEnd = addDays(lastWeekStart, 6);
                    currentPeriodSessions.forEach(s => {
                        const d = parseLocalDate(s.date);
                        if (d >= lastWeekStart && d <= lastWeekEnd) {
                            lastWeekSessions.push(s);
                        }
                    });

                    // Calculate last week stats
                    const lastWeekStats = { maxKg: 0, totalVol: 0, rirSum: 0, rirCount: 0 };
                    lastWeekSessions.forEach(s => {
                        const ex = (s.exercises || []).find(e => e.name === exerciseName);
                        if (ex) {
                            ex.sets.forEach(st => {
                                const kg = parseFloat(st.kg) || 0;
                                const reps = parseReps(st.reps);
                                const rir = parseRIR(st.rir);
                                lastWeekStats.maxKg = Math.max(lastWeekStats.maxKg, kg);
                                if (reps > 0) {
                                    lastWeekStats.totalVol += kg * reps;
                                }
                                if (rir > 0) {
                                    lastWeekStats.rirSum += rir;
                                    lastWeekStats.rirCount++;
                                }
                            });
                        }
                    });
                    const lastWeekAvgRir = lastWeekStats.rirCount > 0 ? lastWeekStats.rirSum / lastWeekStats.rirCount : 0;

                    // Compare last week with first week (week-to-week comparison)
                    // Always use week-to-week comparison when no comparison period exists
                    // Check if we have multiple weeks of data
                    const weeksWithData = Array.from(sessionsByWeek.keys()).sort();
                    const hasMultipleWeeks = weeksWithData.length > 1;

                    if (metric === 'volume') {
                        // Use last week volume, or if no data in last week, use the most recent week with data
                        if (lastWeekStats.totalVol > 0) {
                            currentValue = lastWeekStats.totalVol;
                        } else {
                            // Find most recent week with data
                            const weeksWithDataReversed = weeksWithData.slice().reverse();
                            for (const weekKey of weeksWithDataReversed) {
                                const weekSessions = sessionsByWeek.get(weekKey);
                                let weekVol = 0;
                                weekSessions.forEach(s => {
                                    const ex = s.exercises.find(e => e.name === exerciseName);
                                    if (ex) {
                                        ex.sets.forEach(st => {
                                            const kg = parseFloat(st.kg) || 0;
                                            const reps = parseReps(st.reps);
                                            if (reps > 0) {
                                                weekVol += kg * reps;
                                            }
                                        });
                                    }
                                });
                                if (weekVol > 0) {
                                    currentValue = weekVol;
                                    break;
                                }
                            }
                        }
                        // Only compare if we have multiple weeks, otherwise use current period total
                        // Only compare if we have multiple weeks, otherwise don't set baseValue (will show "Primer registro")
                        if (hasMultipleWeeks && firstWeekStats.totalVol > 0) {
                            baseValue = firstWeekStats.totalVol;
                        } else {
                            // If all data is in one week, don't set baseValue to show "Primer registro"
                            baseValue = 0;
                            currentValue = currentStats.totalVol;
                        }
                    } else if (metric === 'weight') {
                        if (lastWeekStats.maxKg > 0) {
                            currentValue = lastWeekStats.maxKg;
                        } else {
                            // Find most recent week with data
                            const weeksWithDataReversed = weeksWithData.slice().reverse();
                            for (const weekKey of weeksWithDataReversed) {
                                const weekSessions = sessionsByWeek.get(weekKey);
                                let weekMaxKg = 0;
                                weekSessions.forEach(s => {
                                    const ex = s.exercises.find(e => e.name === exerciseName);
                                    if (ex) {
                                        ex.sets.forEach(st => {
                                            const kg = parseFloat(st.kg) || 0;
                                            weekMaxKg = Math.max(weekMaxKg, kg);
                                        });
                                    }
                                });
                                if (weekMaxKg > 0) {
                                    currentValue = weekMaxKg;
                                    break;
                                }
                            }
                        }
                        // Only compare if we have multiple weeks, otherwise don't set baseValue (will show "Primer registro")
                        if (hasMultipleWeeks && firstWeekStats.maxKg > 0) {
                            baseValue = firstWeekStats.maxKg;
                        } else {
                            // If all data is in one week, don't set baseValue to show "Primer registro"
                            baseValue = 0;
                            currentValue = currentStats.maxKg;
                        }
                    } else if (metric === 'rir') {
                        if (lastWeekAvgRir > 0) {
                            currentValue = lastWeekAvgRir;
                        } else {
                            // Find most recent week with data
                            const weeksWithDataReversed = weeksWithData.slice().reverse();
                            for (const weekKey of weeksWithDataReversed) {
                                const weekSessions = sessionsByWeek.get(weekKey);
                                let rirSum = 0, rirCount = 0;
                                weekSessions.forEach(s => {
                                    const ex = s.exercises.find(e => e.name === exerciseName);
                                    if (ex) {
                                        ex.sets.forEach(st => {
                                            const rir = parseRIR(st.rir);
                                            if (rir > 0) {
                                                rirSum += rir;
                                                rirCount++;
                                            }
                                        });
                                    }
                                });
                                if (rirCount > 0) {
                                    currentValue = rirSum / rirCount;
                                    break;
                                }
                            }
                        }
                        // Only compare if we have multiple weeks, otherwise don't set baseValue (will show "Primer registro")
                        if (hasMultipleWeeks && firstWeekAvgRir > 0) {
                            baseValue = firstWeekAvgRir;
                        } else {
                            // If all data is in one week, don't set baseValue to show "Primer registro"
                            baseValue = 0;
                            currentValue = currentAvgRir;
                        }
                    }
                }
            }

            if (baseValue > 0) {
                const diff = ((currentValue - baseValue) / baseValue * 100);
                // If difference is very small (less than 0.1%), treat as same
                if (Math.abs(diff) < 0.1) {
                    // Check if we have multiple weeks of data
                    const weeksWithData = Array.from(new Set(
                        [...app.sessions]
                            .filter(s => {
                                const ex = (s.exercises || []).find(e => e.name === exerciseName);
                                return ex && ex.sets && ex.sets.length > 0;
                            })
                            .map(s => {
                                const d = parseLocalDate(s.date);
                                return startOfWeek(d).toISOString().split('T')[0];
                            })
                    ));

                    if (weeksWithData.length <= 1) {
                        // All data in one week - show as first record
                        progressText = 'Primer registro';
                        progressClass = 'progress--up';
                    } else {
                        progressText = '0%';
                        progressClass = 'progress--same';
                    }
                } else if (diff > 0) {
                    progressText = `+${diff.toFixed(1)}%`;
                    progressClass = 'progress--up';
                } else {
                    progressText = `${diff.toFixed(1)}%`;
                    progressClass = 'progress--down';
                }
            } else if (currentValue > 0) {
                progressText = 'Primer registro';
                progressClass = 'progress--up';
            }

            return `
                <tr>
                    <td><strong>${exerciseName}</strong></td>
                    <td>${currentStats.sessionCount}</td>
                    <td>${currentStats.maxKg} kg</td>
                    <td>${currentStats.totalReps}</td>
                    <td>${currentStats.totalVol.toLocaleString()} kg</td>
                    <td>${currentAvgRir > 0 ? currentAvgRir.toFixed(1) : '–'}</td>
                    <td class="${progressClass}">${progressText}</td>
                </tr>
            `;
        }).join('');

        body.innerHTML = rows || '<tr><td colspan="7" style="padding:16px">No hay datos suficientes</td></tr>';
    }

    function buildChartState() {
        // Shared filters (used by both chart and stats)
        const sharedMetric = $('#sharedMetric');
        const sharedExercise = $('#sharedExercise');
        const sharedPeriod = $('#sharedPeriod');

        // Initialize shared filters with current state
        if (sharedMetric) {
            sharedMetric.value = app.chartState.metric || 'volume';
            sharedMetric.onchange = () => {
                app.chartState.metric = sharedMetric.value;
                drawChart();
                buildStats();
            };
        }

        if (sharedExercise) {
            // Get all exercises
            const allExercises = new Set();
            app.sessions.forEach(s => {
                (s.exercises || []).forEach(e => allExercises.add(e.name));
            });
            const exercisesList = [...allExercises].sort();

            // Set initial value
            const currentExercise = app.chartState.exercise || 'all';
            if (currentExercise === 'all') {
                sharedExercise.value = '';
                sharedExercise.placeholder = 'Todos los ejercicios';
            } else {
                sharedExercise.value = currentExercise;
            }

            const suggestionsDiv = $('#exerciseSuggestions');
            let highlightedIndex = -1;

            // Function to filter and show suggestions
            const showSuggestions = (query) => {
                if (!suggestionsDiv) return;

                const queryLower = query.toLowerCase().trim();
                let filtered = [];

                if (queryLower === '') {
                    // Show "Todos los ejercicios" option
                    filtered = [{ name: 'all', display: 'Todos los ejercicios' }];
                } else {
                    // Filter exercises that start with the query
                    filtered = exercisesList
                        .filter(ex => ex.toLowerCase().startsWith(queryLower))
                        .map(ex => ({ name: ex, display: ex }));
                }

                if (filtered.length === 0) {
                    suggestionsDiv.style.display = 'none';
                    return;
                }

                suggestionsDiv.innerHTML = '';
                filtered.forEach((item, index) => {
                    const div = document.createElement('div');
                    div.className = `exercise-suggestion-item ${item.name === 'all' ? 'all-exercises' : ''}`;
                    div.textContent = item.display;
                    div.dataset.exercise = item.name;
                    div.addEventListener('click', () => {
                        selectExercise(item.name);
                    });
                    suggestionsDiv.appendChild(div);
                });

                suggestionsDiv.style.display = 'block';
                highlightedIndex = -1;
            };

            // Function to select an exercise
            const selectExercise = (exerciseName) => {
                if (exerciseName === 'all') {
                    sharedExercise.value = '';
                    sharedExercise.placeholder = 'Todos los ejercicios';
                    app.chartState.exercise = 'all';
                } else {
                    sharedExercise.value = exerciseName;
                    app.chartState.exercise = exerciseName;
                }
                suggestionsDiv.style.display = 'none';
                drawChart();
                buildStats();
            };

            // Input event listener
            sharedExercise.addEventListener('input', (e) => {
                const query = e.target.value;
                showSuggestions(query);
            });

            // Focus event listener
            sharedExercise.addEventListener('focus', () => {
                if (sharedExercise.value.trim() === '') {
                    showSuggestions('');
                } else {
                    showSuggestions(sharedExercise.value);
                }
            });

            // Keyboard navigation
            sharedExercise.addEventListener('keydown', (e) => {
                const items = suggestionsDiv.querySelectorAll('.exercise-suggestion-item');
                if (items.length === 0) return;

                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    highlightedIndex = Math.min(highlightedIndex + 1, items.length - 1);
                    items.forEach((item, idx) => {
                        item.classList.toggle('highlighted', idx === highlightedIndex);
                    });
                    items[highlightedIndex].scrollIntoView({ block: 'nearest' });
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    highlightedIndex = Math.max(highlightedIndex - 1, -1);
                    items.forEach((item, idx) => {
                        item.classList.toggle('highlighted', idx === highlightedIndex);
                    });
                    if (highlightedIndex >= 0) {
                        items[highlightedIndex].scrollIntoView({ block: 'nearest' });
                    }
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (highlightedIndex >= 0 && items[highlightedIndex]) {
                        const exerciseName = items[highlightedIndex].dataset.exercise;
                        selectExercise(exerciseName);
                    } else if (items.length > 0) {
                        // Select first item if nothing is highlighted
                        const exerciseName = items[0].dataset.exercise;
                        selectExercise(exerciseName);
                    }
                } else if (e.key === 'Escape') {
                    suggestionsDiv.style.display = 'none';
                    sharedExercise.blur();
                }
            });

            // Close suggestions when clicking outside
            document.addEventListener('click', (e) => {
                if (!sharedExercise.contains(e.target) && !suggestionsDiv.contains(e.target)) {
                    suggestionsDiv.style.display = 'none';
                }
            });
        }

        if (sharedPeriod) {
            sharedPeriod.value = String(app.chartState.period || 8);
            sharedPeriod.onchange = () => {
                app.chartState.period = +sharedPeriod.value;
                drawChart();
                buildStats();
            };
        }

        const chartTypeSelect = $('#chartType');
        if (chartTypeSelect) {
            chartTypeSelect.onchange = () => {
                drawChart();
            };
        }

        // Throttle resize events for better performance
        let resizeTimeout;
        window.addEventListener('resize', () => {
            if (resizeTimeout) return;
            resizeTimeout = requestAnimationFrame(() => {
                resizeCanvas();
                drawChart();
                resizeTimeout = null;
            });
        }, { passive: true });
        resizeCanvas();
    }

    function resizeCanvas() {
        const canvas = $('#progressChart'); if (!canvas) return;
        const dpr = Math.max(1, window.devicePixelRatio || 1);
        const rect = canvas.getBoundingClientRect();
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor((window.innerWidth < 420 ? 230 : 250) * dpr);
        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function weeklyData(period = 4, filter = 'all', metric = 'volume') {
        const weeks = [], values = [];
        const base = startOfWeek();

        for (let i = period - 1; i >= 0; i--) {
            const ws = addDays(base, -i * 7), we = addDays(ws, 6);
            const subset = app.sessions.filter(s => {
                const d = new Date(s.date);
                return d >= ws && d <= we;
            });

            let value = 0;
            if (metric === 'volume') {
                subset.forEach(s => (s.exercises || []).forEach(e => {
                    if (filter === 'all' || e.name === filter) {
                        (e.sets || []).forEach(st => value += (parseFloat(st.kg) || 0) * parseReps(st.reps));
                    }
                }));
            } else if (metric === 'rir') {
                let rirSum = 0, rirCount = 0;
                subset.forEach(s => (s.exercises || []).forEach(e => {
                    if (filter === 'all' || e.name === filter) {
                        (e.sets || []).forEach(st => {
                            const rir = parseRIR(st.rir);
                            if (rir > 0) {
                                rirSum += rir;
                                rirCount++;
                            }
                        });
                    }
                }));
                value = rirCount ? (rirSum / rirCount) : 0;
            } else if (metric === 'weight') {
                subset.forEach(s => (s.exercises || []).forEach(e => {
                    if (filter === 'all' || e.name === filter) {
                        (e.sets || []).forEach(st => {
                            const kg = parseFloat(st.kg) || 0;
                            if (kg > 0) value = Math.max(value, kg);
                        });
                    }
                }));
            }

            weeks.push(`Sem ${period - i}`);
            values.push(value);
        }
        return { weeks, values };
    }

    function drawChart() {
        const canvas = $('#progressChart'); if (!canvas) return;
        const ctx = canvas.getContext('2d'); if (!ctx) return;

        // Ensure canvas dimensions match display size for sharpness
        const dpr = Math.max(1, window.devicePixelRatio || 1);
        const rect = canvas.getBoundingClientRect();

        // Only resize if dimensions changed to avoid flickering
        if (canvas.width !== Math.floor(rect.width * dpr) || canvas.height !== Math.floor(rect.height * dpr)) {
            canvas.width = Math.floor(rect.width * dpr);
            canvas.height = Math.floor(rect.height * dpr);
            ctx.scale(dpr, dpr);
        } else {
            // Reset transform if not resizing, but ensure scale is correct
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        // Clear with correct dimensions
        ctx.clearRect(0, 0, rect.width, rect.height);

        const chartTypeSelect = $('#chartType');
        const chartType = chartTypeSelect ? chartTypeSelect.value : 'bar';

        // Get theme colors
        const style = getComputedStyle(document.documentElement);
        const barColor = style.getPropertyValue('--primary').trim() || '#3b82f6';
        const lineColor = style.getPropertyValue('--accent').trim() || '#10b981';
        const gridColor = document.documentElement.getAttribute('data-theme') === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)';
        const textColor = style.getPropertyValue('--text').trim() || '#94a3b8';

        const padding = { l: 50, r: 20, t: 30, b: 40 };
        const w = rect.width;
        const h = rect.height;

        // Use shared filters
        const sharedMetric = $('#sharedMetric');
        const sharedExercise = $('#sharedExercise');
        const sharedPeriod = $('#sharedPeriod');

        const period = sharedPeriod ? parseInt(sharedPeriod.value) : (app.chartState.period || 8);

        let filter = 'all';
        if (sharedExercise) {
            const exerciseValue = sharedExercise.value.trim();
            filter = exerciseValue === '' ? 'all' : exerciseValue;
        } else {
            filter = app.chartState.exercise || 'all';
        }

        const metric = sharedMetric ? sharedMetric.value : (app.chartState.metric || 'volume');
        const { weeks, values } = weeklyData(period, filter, metric);

        if (chartType === 'pie') {
            drawPieChart(ctx, canvas, weeks, values, metric, barColor, textColor, gridColor);
        } else {
            drawBarChart(ctx, canvas, weeks, values, metric, barColor, lineColor, gridColor, textColor, padding, w, h);
        }
    }

    function drawBarChart(ctx, canvas, weeks, values, metric, barColor, lineColor, gridColor, textColor, padding, w, h) {
        const vmax = Math.max(1, ...values) * 1.1; // Add 10% headroom
        const cw = w - padding.l - padding.r;
        const ch = h - padding.t - padding.b;
        const barW = Math.min(40, (cw / weeks.length) * 0.6); // Cap bar width
        const step = cw / weeks.length;
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';

        // Background grid lines
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        const ticks = 5;

        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = textColor;
        ctx.font = '11px Inter, system-ui, sans-serif';

        for (let i = 0; i <= ticks; i++) {
            const val = vmax * (i / ticks);
            const y = padding.t + ch - (val / vmax) * ch;

            // Grid line
            ctx.beginPath();
            ctx.moveTo(padding.l, y);
            ctx.lineTo(padding.l + cw, y);
            ctx.stroke();

            // Y-axis label
            let label = val >= 1000 ? (val / 1000).toFixed(1) + 'k' : Math.round(val).toLocaleString();
            if (metric === 'rir') label = val.toFixed(1);
            ctx.fillText(label, padding.l - 10, y);
        }

        // Bars
        for (let i = 0; i < weeks.length; i++) {
            const x = padding.l + i * step + (step - barW) / 2;
            const val = values[i];
            const barH = (val / vmax) * ch;
            const y = padding.t + ch - barH;

            if (barH > 0) {
                // Gradient fill
                const gradient = ctx.createLinearGradient(x, y, x, y + barH);
                gradient.addColorStop(0, barColor);
                gradient.addColorStop(1, adjustColorOpacity(barColor, 0.6));

                ctx.fillStyle = gradient;

                // Rounded top corners
                const radius = Math.min(6, barW / 2);
                ctx.beginPath();
                ctx.moveTo(x, y + barH);
                ctx.lineTo(x, y + radius);
                ctx.quadraticCurveTo(x, y, x + radius, y);
                ctx.lineTo(x + barW - radius, y);
                ctx.quadraticCurveTo(x + barW, y, x + barW, y + radius);
                ctx.lineTo(x + barW, y + barH);
                ctx.closePath();
                ctx.fill();

                // Value label on hover or always if space permits (simplified to always for now)
                if (weeks.length <= 8) {
                    ctx.fillStyle = textColor;
                    ctx.textAlign = 'center';
                    ctx.font = 'bold 10px Inter, system-ui, sans-serif';
                    let valLabel = val >= 1000 ? (val / 1000).toFixed(1) + 'k' : Math.round(val).toLocaleString();
                    if (metric === 'rir') valLabel = val.toFixed(1);
                    ctx.fillText(valLabel, x + barW / 2, y - 8);
                }
            }

            // X-axis label
            ctx.fillStyle = textColor;
            ctx.textAlign = 'center';
            ctx.font = '10px Inter, system-ui, sans-serif';
            // Simplify week label if too many
            let weekLabel = weeks[i].replace('Sem ', 'S');
            if (weeks.length > 12 && i % 2 !== 0) weekLabel = ''; // Skip every other label if crowded
            ctx.fillText(weekLabel, x + barW / 2, padding.t + ch + 15);
        }
    }

    function adjustColorOpacity(color, opacity) {
        // Simple hex to rgba converter
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }
        return color;
    }

    function drawPieChart(ctx, canvas, weeks, values, metric, barColor, textColor, gridColor) {
        const rect = canvas.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';

        const centerX = w * 0.35; // Shift left to make room for legend
        const centerY = h / 2;
        const radius = Math.min(w, h) * 0.35;
        const total = values.reduce((sum, val) => sum + val, 0);

        if (total === 0) {
            ctx.fillStyle = textColor;
            ctx.font = '14px Inter, system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('No hay datos disponibles', w / 2, centerY);
            return;
        }

        let currentAngle = -Math.PI / 2;

        // Premium palette
        const colors = [
            barColor,
            '#10b981', // Emerald
            '#f59e0b', // Amber
            '#8b5cf6', // Violet
            '#ec4899', // Pink
            '#06b6d4', // Cyan
            '#ef4444', // Red
            '#6366f1', // Indigo
            '#84cc16', // Lime
            '#14b8a6'  // Teal
        ];

        // Draw slices
        values.forEach((val, i) => {
            if (val === 0) return;

            const sliceAngle = (val / total) * 2 * Math.PI;
            const color = colors[i % colors.length];

            // Add gap
            const gap = 0.02;
            const start = currentAngle + gap;
            const end = currentAngle + sliceAngle - gap;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, start, end);
            ctx.closePath();

            // Gradient for depth
            const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.4, centerX, centerY, radius);
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, adjustColorOpacity(color, 0.8));

            ctx.fillStyle = gradient;
            ctx.fill();

            // Border
            ctx.strokeStyle = isLight ? '#ffffff' : '#1e1e1e';
            ctx.lineWidth = 2;
            ctx.stroke();

            currentAngle += sliceAngle;
        });

        // Draw Legend
        const legendX = w * 0.65;
        const legendY = 40;
        const lineHeight = 20;

        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.font = '11px Inter, system-ui, sans-serif';

        values.forEach((val, i) => {
            if (val === 0) return;

            const y = legendY + i * lineHeight;
            // Don't draw if out of bounds
            if (y > h - 20) return;

            const color = colors[i % colors.length];
            const percentage = ((val / total) * 100).toFixed(1) + '%';
            const label = weeks[i];

            // Color dot
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(legendX, y, 4, 0, Math.PI * 2);
            ctx.fill();

            // Text
            ctx.fillStyle = textColor;
            let valText = val >= 1000 ? (val / 1000).toFixed(1) + 'k' : Math.round(val).toLocaleString();
            if (metric === 'rir') valText = val.toFixed(1);

            ctx.fillText(`${label}: ${valText} (${percentage})`, legendX + 12, y);
        });

        // Draw total in center (Donut style)
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = isLight ? '#ffffff' : '#1e1e1e'; // Match background
        ctx.fill();

        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.font = 'bold 12px Inter, system-ui, sans-serif';
        ctx.fillText('Total', centerX, centerY - 8);

        let totalText = total >= 1000 ? (total / 1000).toFixed(1) + 'k' : Math.round(total).toLocaleString();
        if (metric === 'rir') totalText = (total / values.filter(v => v > 0).length).toFixed(1); // Avg for RIR

        ctx.font = '11px Inter, system-ui, sans-serif';
        ctx.fillText(totalText, centerX, centerY + 8);
    }

    /* =================== Import/Export =================== */
    function safeAlert(msg) {
        const box = $('#importAlert');
        box.textContent = msg;
        box.classList.remove('hidden');
    }

    function clearAlert() {
        const box = $('#importAlert');
        box.textContent = '';
        box.classList.add('hidden');

        const errorList = $('#importErrorList');
        errorList.innerHTML = '';
        errorList.classList.add('hidden');
    }

    function handleFile(e) {
        clearAlert();
        app.importBuffer = null;
        $('#preview').classList.add('hidden');
        $('#previewList').innerHTML = '';

        const fileList = e.target.files;
        const file = fileList && fileList[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                if (!Array.isArray(data)) throw new Error('Formato inválido: se esperaba un array');

                // Validación más estricta
                const errors = [];
                data.forEach((s, i) => {
                    if (!s.name) errors.push(`Sesión ${i + 1}: falta el nombre`);
                    if (!s.date) errors.push(`Sesión ${i + 1}: falta la fecha`);
                    if (!s.exercises || !Array.isArray(s.exercises)) errors.push(`Sesión ${i + 1}: falta el array de ejercicios`);

                    if (s.exercises && Array.isArray(s.exercises)) {
                        s.exercises.forEach((e, j) => {
                            if (!e.name) errors.push(`Sesión ${i + 1}, ejercicio ${j + 1}: falta el nombre`);
                            if (!e.sets || !Array.isArray(e.sets)) errors.push(`Sesión ${i + 1}, ejercicio ${j + 1}: falta el array de sets`);

                            if (e.sets && Array.isArray(e.sets)) {
                                e.sets.forEach((set, k) => {
                                    if (!set.setNumber) errors.push(`Sesión ${i + 1}, ejercicio ${j + 1}, set ${k + 1}: falta el número de set`);
                                });
                            }
                        });
                    }
                });

                if (errors.length > 0) {
                    const errorList = $('#importErrorList');
                    errorList.innerHTML = '<strong>Errores de validación:</strong>';
                    errors.forEach(error => {
                        const item = document.createElement('div');
                        item.className = 'import-error-item';
                        item.textContent = error;
                        errorList.appendChild(item);
                    });
                    errorList.classList.remove('hidden');
                    return;
                }

                app.importBuffer = data;
                const list = $('#previewList');
                data.slice(0, 10).forEach(s => {
                    const li = document.createElement('li');
                    li.textContent = s.name;
                    list.appendChild(li);
                });
                if (data.length > 10) {
                    const li = document.createElement('li');
                    li.textContent = `… y ${data.length - 10} más`;
                    list.appendChild(li);
                }
                $('#preview').classList.remove('hidden');
            } catch (err) {
                safeAlert('El archivo no es válido. Por favor, revisa el formato.');
                console.error(err);
            }
        };
        reader.onerror = () => safeAlert('No se pudo leer el archivo.');
        reader.readAsText(file);
    }

    function normalizeSessionFromImport(src, dateISO) {
        return {
            id: uuid(),
            name: String(src.name || 'Sesión'),
            date: dateISO,
            completed: !!src.completed,
            exercises: (src.exercises || []).map(e => ({
                id: uuid(),
                name: String(e.name || 'Ejercicio'),
                sets: (e.sets || [{ setNumber: 1, kg: '', reps: '', rir: '' }]).map((st, i) => ({
                    id: uuid(),
                    setNumber: st.setNumber || (i + 1),
                    kg: String(st.kg || ''),
                    reps: String(st.reps || ''),
                    rir: String(st.rir || '')
                }))
            }))
        };
    }

    function applyImport() {
        if (!app.importBuffer) {
            safeAlert('No hay datos que importar.');
            return;
        }

        clearAlert();

        const offset = +$('#targetWeek').value;

        // Calcula el lunes exacto de la semana objetivo (forzando 00:00 hora local)
        const monday = startOfWeek(addDays(new Date(), offset * 7));
        monday.setHours(0, 0, 0, 0);

        // Mapea las sesiones respetando sus fechas originales si existen
        const mapped = app.importBuffer.map((s, idx) => {
            let sessionDate;
            let dateISO;

            // Si la sesión tiene una fecha original, usarla
            if (s.date) {
                try {
                    sessionDate = new Date(s.date);
                    // Validar que la fecha sea válida
                    if (isNaN(sessionDate.getTime())) {
                        throw new Error('Invalid date');
                    }
                    sessionDate.setHours(12, 0, 0, 0);
                    dateISO = toLocalISO(sessionDate);
                } catch (e) {
                    // Si la fecha no es válida, usar fallback
                    sessionDate = new Date(monday);
                    sessionDate.setDate(monday.getDate() + idx);
                    sessionDate.setHours(12, 0, 0, 0);
                    dateISO = toLocalISO(sessionDate);
                }
            } else {
                // Si no tiene fecha, usar días consecutivos como fallback
                sessionDate = new Date(monday);
                sessionDate.setDate(monday.getDate() + idx);
                sessionDate.setHours(12, 0, 0, 0);
                dateISO = toLocalISO(sessionDate);
            }

            return normalizeSessionFromImport(s, dateISO);
        });

        // Inserta las sesiones
        app.sessions = [...app.sessions, ...mapped];
        save();

        // Always refresh to update UI (renderSessions will check if we're viewing the imported week)
        refresh();

        // Limpieza
        app.importBuffer = null;
        $('#fileInput').value = '';
        $('#preview').classList.add('hidden');
        $('#importAlert').classList.add('hidden');

        // Mensaje visual
        toast('Entrenamiento importado correctamente ✔️', 'ok');
    }

    function exportSessions() {
        const blob = new Blob([JSON.stringify(app.sessions, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `training_diary_${toLocalISO(new Date())}.json`; a.click();
        URL.revokeObjectURL(url);
    }

    function exportRoutines() {
        if (!app.routines || app.routines.length === 0) {
            toast('No hay rutinas para exportar', 'warn');
            return;
        }
        const blob = new Blob([JSON.stringify(app.routines, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `routines_${toLocalISO(new Date())}.json`; a.click();
        URL.revokeObjectURL(url);
        toast('Rutinas exportadas correctamente', 'ok');
    }

    function clearRoutineAlert() {
        const alert = $('#routineImportAlert');
        if (alert) {
            alert.classList.add('hidden');
            alert.textContent = '';
        }
        const errorList = $('#routineImportErrorList');
        if (errorList) {
            errorList.classList.add('hidden');
            errorList.innerHTML = '';
        }
    }

    function safeRoutineAlert(msg) {
        const alert = $('#routineImportAlert');
        if (alert) {
            alert.textContent = msg;
            alert.classList.remove('hidden');
        }
    }

    function handleRoutineFile(e) {
        clearRoutineAlert();
        app.routineImportBuffer = null;
        const preview = $('#routinePreview');
        if (preview) preview.classList.add('hidden');
        const previewList = $('#routinePreviewList');
        if (previewList) previewList.innerHTML = '';

        const fileList = e.target.files;
        const file = fileList && fileList[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                if (!Array.isArray(data)) throw new Error('Formato inválido: se esperaba un array');

                // Validación de rutinas
                const errors = [];
                data.forEach((r, i) => {
                    if (!r.name) errors.push(`Rutina ${i + 1}: falta el nombre`);
                    if (!r.days || !Array.isArray(r.days)) errors.push(`Rutina ${i + 1}: falta el array de días`);

                    if (r.days && Array.isArray(r.days)) {
                        r.days.forEach((day, j) => {
                            if (!day.exercises || !Array.isArray(day.exercises)) {
                                errors.push(`Rutina ${i + 1}, día ${j + 1}: falta el array de ejercicios`);
                            }

                            if (day.exercises && Array.isArray(day.exercises)) {
                                day.exercises.forEach((ex, k) => {
                                    if (!ex.name) errors.push(`Rutina ${i + 1}, día ${j + 1}, ejercicio ${k + 1}: falta el nombre`);
                                    if (!ex.sets || !Array.isArray(ex.sets)) {
                                        errors.push(`Rutina ${i + 1}, día ${j + 1}, ejercicio ${k + 1}: falta el array de sets`);
                                    }
                                });
                            }
                        });
                    }
                });

                if (errors.length > 0) {
                    const errorList = $('#routineImportErrorList');
                    if (errorList) {
                        errorList.innerHTML = '<strong>Errores de validación:</strong>';
                        errors.forEach(error => {
                            const item = document.createElement('div');
                            item.className = 'import-error-item';
                            item.textContent = error;
                            errorList.appendChild(item);
                        });
                        errorList.classList.remove('hidden');
                    }
                    return;
                }

                app.routineImportBuffer = data;
                const list = $('#routinePreviewList');
                if (list) {
                    data.slice(0, 10).forEach(r => {
                        const li = document.createElement('li');
                        li.textContent = r.name || 'Rutina sin nombre';
                        list.appendChild(li);
                    });
                    if (data.length > 10) {
                        const li = document.createElement('li');
                        li.textContent = `… y ${data.length - 10} más`;
                        list.appendChild(li);
                    }
                }
                if (preview) preview.classList.remove('hidden');
            } catch (err) {
                safeRoutineAlert('El archivo no es válido. Por favor, revisa el formato.');
                console.error(err);
            }
        };
        reader.onerror = () => safeRoutineAlert('No se pudo leer el archivo.');
        reader.readAsText(file);
    }

    function applyRoutineImport() {
        if (!app.routineImportBuffer) {
            safeRoutineAlert('No hay datos que importar.');
            return;
        }

        clearRoutineAlert();

        // Normalizar y agregar las rutinas
        const importedRoutines = app.routineImportBuffer.map(r => ({
            id: uuid(),
            createdAt: new Date().toISOString(),
            name: String(r.name || 'Rutina sin nombre'),
            days: (r.days || []).map(day => ({
                id: uuid(),
                name: String(day.name || 'Día sin nombre'),
                exercises: (day.exercises || []).map(ex => ({
                    id: uuid(),
                    name: String(ex.name || 'Ejercicio'),
                    sets: (ex.sets || []).map((set, idx) => ({
                        id: uuid(),
                        kg: String(set.kg || set.planKg || ''),
                        reps: String(set.reps || set.planReps || ''),
                        rir: String(set.rir || set.planRir || ''),
                        planKg: String(set.planKg !== undefined ? set.planKg : (set.kg || '')),
                        planReps: String(set.planReps !== undefined ? set.planReps : (set.reps || '')),
                        planRir: String(set.planRir !== undefined ? set.planRir : (set.rir || ''))
                    }))
                }))
            }))
        }));

        // Agregar las rutinas importadas
        app.routines = [...app.routines, ...importedRoutines];
        save();

        // Limpieza
        app.routineImportBuffer = null;
        const fileInput = $('#routineFileInput');
        if (fileInput) {
            fileInput.value = '';
            // Create a new input to reset the file selection (needed for mobile)
            const newInput = fileInput.cloneNode(true);
            fileInput.parentNode.replaceChild(newInput, fileInput);
            newInput.addEventListener('change', (e) => {
                handleRoutineFile(e);
                const container = $('#routineFileInputContainer');
                if (container) {
                    container.style.display = 'block';
                }
            });
        }
        const container = $('#routineFileInputContainer');
        if (container) container.style.display = 'none';
        const preview = $('#routinePreview');
        if (preview) preview.classList.add('hidden');
        const previewList = $('#routinePreviewList');
        if (previewList) previewList.innerHTML = '';

        // Refrescar la lista de rutinas
        renderImportRoutineList();
        renderRoutines();

        // Mensaje visual
        toast(`Rutinas importadas correctamente (${importedRoutines.length}) ✔️`, 'ok');
    }

    function cancelRoutineImport() {
        app.routineImportBuffer = null;
        clearRoutineAlert();
        const fileInput = $('#routineFileInput');
        if (fileInput) {
            fileInput.value = '';
            // Create a new input to reset the file selection (needed for mobile)
            const newInput = fileInput.cloneNode(true);
            fileInput.parentNode.replaceChild(newInput, fileInput);
            newInput.addEventListener('change', (e) => {
                handleRoutineFile(e);
                const container = $('#routineFileInputContainer');
                if (container) {
                    container.style.display = 'block';
                }
            });
        }
        const container = $('#routineFileInputContainer');
        if (container) container.style.display = 'none';
        const preview = $('#routinePreview');
        if (preview) preview.classList.add('hidden');
        const previewList = $('#routinePreviewList');
        if (previewList) previewList.innerHTML = '';
    }

    /* =================== Plantillas =================== */
    function openTemplatePreview(key) {
        app.tmpTemplateKey = key;
        const list = templates[key] || [];
        const cont = $('#templatePreview'); cont.innerHTML = '';
        list.forEach((s, i) => {
            const card = document.createElement('div'); card.className = 'card'; card.style.padding = '10px';
            card.innerHTML = `<strong>${i + 1}. ${s.name}</strong><br><span style="color:var(--muted)">${s.ex.slice(0, 5).join(', ')}${s.ex.length > 5 ? '…' : ''}</span>`;
            cont.appendChild(card);
        });
        $('#templateDialog').showModal();
    }

    function importTemplateIntoVisibleWeek(ev) {
        if (ev) ev.preventDefault();
        const key = app.tmpTemplateKey; if (!key) return;
        const arr = templates[key] || [];
        const { ws } = getVisibleWeek(); // SIEMPRE desde lunes de la semana visible
        const toAdd = arr.map((it, idx) => ({
            id: uuid(),
            name: it.name,
            date: toLocalISO(addDays(ws, idx)),
            completed: false,
            exercises: it.ex.map(n => ({ id: uuid(), name: n, sets: [{ id: uuid(), setNumber: 1, kg: '', reps: '', rir: '' }] }))
        }));
        app.sessions = [...app.sessions, ...toAdd];
        save(); refresh(); $('#templateDialog').close();
        toast(`Plantilla «${key}» importada en la semana visible`, 'ok');
    }

    function importRoutineIntoWeek(routineId) {
        const routine = app.routines.find(r => r.id === routineId);
        if (!routine) {
            toast('Rutina no encontrada', 'err');
            return;
        }
        const { ws } = getVisibleWeek();
        const days = routine.days || [];
        if (!days.length) {
            toast('La rutina no tiene días definidos', 'warn');
            return;
        }
        const toAdd = days.map((day, idx) => ({
            id: uuid(),
            name: day.name || `Sesión ${idx + 1}`,
            date: toLocalISO(addDays(ws, idx)),
            completed: false,
            exercises: (day.exercises || []).map(ex => ({
                id: uuid(),
                name: ex.name,
                sets: ((ex.sets && ex.sets.length) ? ex.sets : [{ planKg: '', planReps: '', planRir: '' }]).map((set, setIdx) => ({
                    id: uuid(),
                    setNumber: setIdx + 1,
                    kg: '',
                    reps: '',
                    rir: '',
                    planKg: set.planKg !== undefined ? set.planKg : (set.kg || ''),
                    planReps: set.planReps !== undefined ? set.planReps : (set.reps || ''),
                    planRir: set.planRir !== undefined ? set.planRir : (set.rir || '')
                }))
            }))
        }));

        app.sessions = [...app.sessions, ...toAdd];
        save();
        refresh();
        toast(`Rutina «${routine.name}» importada en la semana visible`, 'ok');
    }

    /* =================== Selector de semana (panel Importar) =================== */
    function initWeekSelector() {
        const sel = $('#targetWeek'); if (!sel) return;
        sel.innerHTML = '';
        const base = startOfWeek(new Date());
        for (let i = -8; i <= 8; i++) {
            const ws = addDays(base, i * 7), we = addDays(ws, 6);
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = `${ws.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} – ${we.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}`;
            if (i === app.weekOffset) opt.selected = true;
            sel.appendChild(opt);
        }
    }

    /* =================== Toast =================== */
    function toast(msg, type = 'ok') {
        const cont = $('#toasts');
        const t = document.createElement('div');
        t.className = `toast toast--${type}`;
        t.textContent = msg;
        cont.appendChild(t);
        setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
    }

    /* =================== Level Up Animation =================== */
    function showLevelUpAnimation(level) {
        const dialog = $('#levelUpDialog');
        const medalImg = $('#levelUpMedal');
        const title = $('#levelUpTitle');
        const name = $('#levelUpName');
        const phrase = $('#levelUpPhrase');
        const btn = $('#levelUpBtn');


        if (!dialog || !medalImg || !title || !name || !phrase || !btn) return;

        // Set content
        title.textContent = `¡NIVEL ${level.level} ALCANZADO!`;
        name.textContent = level.name;

        // Get medal image
        const medalSrc = getMedalImage(level);
        medalImg.src = medalSrc || 'images/Level1.png'; // Fallback

        // Get motivational phrase
        const messages = MOTIVATIONAL_MESSAGES[level.stage] || MOTIVATIONAL_MESSAGES.human;
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        phrase.textContent = `"${randomMessage}"`;

        // Show dialog
        dialog.showModal();
        document.body.classList.add('level-up-active');

        // Play sound if available (optional)
        // const audio = new Audio('levelup.mp3');
        // audio.play().catch(e => console.log('Audio play failed', e));
    }

    /* =================== Eventos =================== */
    function bindEvents() {
        // Level Up Dialog
        const levelUpBtn = $('#levelUpBtn');
        if (levelUpBtn) {
            levelUpBtn.addEventListener('click', () => {
                const dialog = $('#levelUpDialog');
                dialog.close();
                document.body.classList.remove('level-up-active');

                // Reset flag
                app.justLeveledUp = false;
            });
        }

        setupTabs();

        // Manual de Usuario - Removed for EasyTracker

        $$('[data-close-dialog]').forEach(btn => {
            btn.addEventListener('click', (ev) => {
                ev.preventDefault();
                const targetId = btn.getAttribute('data-close-dialog');
                if (targetId) {
                    const dialog = document.getElementById(targetId);
                    if (dialog) dialog.close();
                } else {
                    const dialog = btn.closest('dialog');
                    if (dialog) dialog.close();
                }
            });
        });

        // Semana
        $('#prevWeek').addEventListener('click', () => { app.weekOffset--; refresh(); });
        $('#nextWeek').addEventListener('click', () => { app.weekOffset++; refresh(); });

        const addRoutineDayBtn = document.getElementById('addRoutineDay');
        if (addRoutineDayBtn) {
            addRoutineDayBtn.addEventListener('click', (ev) => {
                ev.preventDefault();
                addRoutineDay();
            });
        }

        const saveRoutineBtn = document.getElementById('saveRoutine');
        if (saveRoutineBtn) {
            saveRoutineBtn.addEventListener('click', handleSaveRoutine);
        }

        const resetRoutineBtn = document.getElementById('resetRoutine');
        if (resetRoutineBtn) {
            resetRoutineBtn.addEventListener('click', (ev) => {
                ev.preventDefault();
                resetRoutineBuilder();
            });
        }

        const routineDaysContainer = document.getElementById('routineDays');
        if (routineDaysContainer) {
            routineDaysContainer.addEventListener('click', (ev) => {
                const addExerciseBtn = ev.target.closest('.js-add-routine-exercise');
                if (addExerciseBtn) {
                    ev.preventDefault();
                    const day = addExerciseBtn.closest('.routine-day');
                    addRoutineExercise(day);
                    return;
                }
                const deleteDayBtn = ev.target.closest('.js-delete-routine-day');
                if (deleteDayBtn) {
                    ev.preventDefault();
                    const day = deleteDayBtn.closest('.routine-day');
                    if (day) day.remove();
                    updateRoutineDayTitles();
                    return;
                }
                const addSetBtn = ev.target.closest('.js-add-routine-set');
                if (addSetBtn) {
                    ev.preventDefault();
                    const ex = addSetBtn.closest('.routine-exercise');
                    addRoutineSet(ex);
                    return;
                }
                const deleteExerciseBtn = ev.target.closest('.js-delete-routine-exercise');
                if (deleteExerciseBtn) {
                    ev.preventDefault();
                    const ex = deleteExerciseBtn.closest('.routine-exercise');
                    const dayEl = ex ? ex.closest('.routine-day') : null;
                    if (ex) ex.remove();
                    if (dayEl) updateRoutineExerciseReorderButtons(dayEl);
                    return;
                }
                const deleteSetBtn = ev.target.closest('.js-delete-routine-set');
                if (deleteSetBtn) {
                    ev.preventDefault();
                    const ex = deleteSetBtn.closest('.routine-exercise');
                    const setEl = deleteSetBtn.closest('.routine-set');
                    if (setEl) setEl.remove();
                    updateRoutineSetIndexes(ex);
                    return;
                }
                const reorderBtn = ev.target.closest('.routine-exercise-reorder-btn');
                if (reorderBtn) {
                    ev.preventDefault();
                    ev.stopPropagation();
                    const exId = reorderBtn.dataset.exId;
                    const direction = reorderBtn.dataset.direction;
                    if (exId && direction) {
                        moveRoutineExercise(exId, direction);
                    }
                    return;
                }
            });
        }

        const defaultRoutineList = document.getElementById('defaultRoutineList');
        if (defaultRoutineList) {
            defaultRoutineList.addEventListener('click', (ev) => {
                const btn = ev.target.closest('.js-use-template');
                if (!btn) return;
                ev.preventDefault();
                loadTemplateIntoBuilder(btn.dataset.template);
                toast('Plantilla cargada en el creador', 'ok');
            });
        }

        const createdRoutineList = document.getElementById('createdRoutineList');
        if (createdRoutineList) {
            createdRoutineList.addEventListener('click', (ev) => {
                const item = ev.target.closest('.routine-created__item');
                if (!item) return;
                const routineId = item.dataset.routineId;
                if (!routineId) return;

                if (ev.target.closest('.js-toggle-routine')) {
                    ev.preventDefault();
                    const body = item.querySelector('.routine-created__body');
                    if (!body) return;
                    body.hidden = !body.hidden;
                    const btn = ev.target.closest('.js-toggle-routine');
                    if (btn) btn.textContent = body.hidden ? 'Ver' : 'Ocultar';
                    return;
                }

                if (ev.target.closest('.js-edit-routine')) {
                    ev.preventDefault();
                    const routine = app.routines.find(r => r.id === routineId);
                    if (!routine) return;
                    loadRoutineIntoBuilder(routine);
                    app.routineEditId = routine.id;
                    toast('Rutina cargada para editar', 'ok');
                    return;
                }

                if (ev.target.closest('.js-delete-routine')) {
                    ev.preventDefault();
                    app.deleteTarget = { type: 'routine', routineId };
                    showConfirmDialog('¿Eliminar esta rutina personalizada? Esta acción no se puede deshacer.');
                }
            });
        }

        const importRoutineList = document.getElementById('importRoutineList');
        if (importRoutineList) {
            importRoutineList.addEventListener('click', (ev) => {
                const btn = ev.target.closest('.js-import-user-routine');
                if (!btn) return;
                ev.preventDefault();
                importRoutineIntoWeek(btn.dataset.routineId);
            });
        }

        // Nueva sesión: por defecto lunes de semana visible
        $('#btnNewSession').addEventListener('click', () => {
            const { ws } = getVisibleWeek();
            $('#sessionDate').value = toLocalISO(ws);
            $('#sessionName').value = '';
            $('#sessionDialog').showModal();
        });

        // Copiar entrenamiento de la semana pasada
        $('#btnCopyLastWeek').addEventListener('click', () => {
            copyLastWeekWorkout();
        });

        $('#btnClearWeek').addEventListener('click', () => {
            clearWeek();
        });

        // Guardar sesión
        $('#saveSession').addEventListener('click', (ev) => {
            ev.preventDefault();
            const name = $('#sessionName').value.trim();
            const date = $('#sessionDate').value;
            if (!name || !date) {
                toast('Completa el nombre y la fecha', 'warn');
                return;
            }
            addSession({ name, date });
            $('#sessionDialog').close();
            toast('Sesión creada', 'ok');
        });

        // Allow closing session dialog without validation
        $('#sessionDialog').addEventListener('close', () => {
            // Reset form when closing
            $('#sessionName').value = '';
        });

        // Actualizar sesión
        $('#updateSession').addEventListener('click', (ev) => {
            ev.preventDefault();
            const id = $('#editSessionDialog').dataset.sessionId;
            const name = $('#editSessionName').value.trim();
            const date = $('#editSessionDate').value;
            if (!name || !date || !id) return;
            updateSession(id, { name, date });
            $('#editSessionDialog').close();
            toast('Sesión actualizada', 'ok');
        });

        // Confirmar eliminación
        $('#confirmDelete').addEventListener('click', (ev) => {
            ev.preventDefault();
            const { type, id, sessionId, exId, setId, routineId, goalId, sessionIds } = app.deleteTarget;

            if (type === 'session') {
                app.sessions = app.sessions.filter(s => s.id !== id);
            } else if (type === 'week') {
                // Eliminar todas las sesiones de la semana
                if (sessionIds && Array.isArray(sessionIds)) {
                    app.sessions = app.sessions.filter(s => !sessionIds.includes(s.id));
                    save();
                    refresh();
                    $('#confirmDialog').close();
                    toast(`Semana limpiada: ${sessionIds.length} sesión${sessionIds.length > 1 ? 'es eliminadas' : ' eliminada'}`, 'ok');
                    return;
                }
            } else if (type === 'exercise') {
                const s = app.sessions.find(x => x.id === sessionId);
                if (s) s.exercises = s.exercises.filter(e => e.id !== exId);

                // OPTIMIZATION: Remove from DOM directly
                const sessionEl = document.querySelector(`.session[data-id="${sessionId}"]`);
                if (sessionEl) {
                    const exEl = sessionEl.querySelector(`.exercise[data-ex-id="${exId}"]`);
                    if (exEl) exEl.remove();
                }
                save();
                $('#confirmDialog').close();
                toast('Elemento eliminado', 'ok');
                return;
            } else if (type === 'set') {
                const s = app.sessions.find(x => x.id === sessionId);
                if (s) {
                    const ex = s.exercises.find(e => e.id === exId);
                    if (ex) {
                        if (ex.sets.length <= 1) {
                            toast('Debe haber al menos un set', 'warn');
                            return;
                        }
                        ex.sets = ex.sets.filter(t => t.id !== setId);
                        ex.sets.forEach((t, i) => t.setNumber = i + 1);
                    }
                }
            } else if (type === 'routine') {
                if (routineId) {
                    app.routines = app.routines.filter(r => r.id !== routineId);
                    if (app.routineEditId === routineId) {
                        resetRoutineBuilder();
                    }
                }
            } else if (type === 'goal') {
                if (goalId) {
                    deleteGoal(goalId);
                    $('#confirmDialog').close();
                    return;
                }
            }

            save();
            refresh();
            $('#confirmDialog').close();
            toast('Elemento eliminado', 'ok');
        });

        // Delegación sesiones
        $('#sessions').addEventListener('click', (e) => {
            const card = e.target.closest('.session');
            if (!card) return;
            const id = card.dataset.id;

            // Edit session button - open edit dialog (name and date only)
            if (e.target.closest('.js-edit-session')) {
                e.preventDefault();
                const session = app.sessions.find(s => s.id === id);
                if (session) {
                    $('#editSessionDialog').dataset.sessionId = id;
                    $('#editSessionName').value = session.name || '';
                    $('#editSessionDate').value = session.date || '';
                    $('#editSessionDialog').showModal();
                }
                return;
            }

            // Save session changes
            if (e.target.closest('.js-save-session')) {
                e.preventDefault();
                saveSessionChanges(id);
                return;
            }

            // Cancel session changes
            if (e.target.closest('.js-cancel-session')) {
                e.preventDefault();
                cancelSessionChanges(id);
                return;
            }

            if (e.target.closest('.js-delete')) {
                // Check if in edit mode
                const editState = app.editingSessions[id];
                if (editState && editState.isEditing) {
                    toast('Guarda o cancela los cambios antes de eliminar', 'warn');
                    return;
                }
                deleteSession(id);
                return;
            }

            if (e.target.closest('.js-complete')) {
                // Check if in edit mode
                const editState = app.editingSessions[id];
                if (editState && editState.isEditing) {
                    toast('Guarda o cancela los cambios antes de marcar como completada', 'warn');
                    return;
                }
                toggleCompleted(id);
                return;
            }

            if (e.target.closest('.js-add-ex')) {
                // Adding exercises - no edit mode required
                app.currentSessionId = id;
                $('#exerciseName').value = '';
                $('#exerciseDialog').showModal();
                return;
            }
        });

        // Ejercicios / sets
        $('#sessions').addEventListener('click', (e) => {
            const exEl = e.target.closest('.exercise');
            if (!exEl) return;

            const sessionId = e.target.closest('.session').dataset.id;
            const exId = exEl.dataset.exId;

            if (e.target.closest('.js-add-set')) {
                addSet(sessionId, exId);
                return;
            }

            if (e.target.closest('.js-del-ex')) {
                deleteExercise(sessionId, exId);
                return;
            }

            if (e.target.closest('.js-del-set')) {
                const setId = e.target.closest('[data-set-id]').dataset.setId;
                deleteSet(sessionId, exId, setId);
                return;
            }

            if (e.target.closest('.js-rest-timer')) {
                openRestTimer();
                return;
            }

            if (e.target.closest('.js-prev-week-data')) {
                const clickedButton = e.target.closest('.js-prev-week-data');
                if (clickedButton) {
                    togglePrevWeekData(sessionId, exId, clickedButton);
                }
                return;
            }

            // Exercise Reorder Delegation
            if (e.target.closest('.exercise-reorder-btn')) {
                const btn = e.target.closest('.exercise-reorder-btn');
                const direction = btn.dataset.direction;
                moveExercise(sessionId, exId, direction);
                return;
            }

            // Note Button Delegation
            if (e.target.closest('.exercise-note-btn')) {
                const btn = e.target.closest('.exercise-note-btn');
                // Need exercise name for dialog
                const s = app.sessions.find(x => x.id === sessionId);
                if (s) {
                    const ex = s.exercises.find(x => x.id === exId);
                    if (ex) {
                        openExerciseNoteDialog(sessionId, exId, ex.name);
                    }
                }
                return;
            }

            // Note Edit/Delete Delegation
            if (e.target.closest('.exercise-note-edit')) {
                const s = app.sessions.find(x => x.id === sessionId);
                if (s) {
                    const ex = s.exercises.find(x => x.id === exId);
                    if (ex) {
                        openExerciseNoteDialog(sessionId, exId, ex.name);
                    }
                }
                return;
            }

            if (e.target.closest('.exercise-note-delete')) {
                saveExerciseNote(sessionId, exId, '');
                refresh({ preserveTab: true });
                return;
            }
        });

        // Event delegation is now handled globally by setupDiaryEventDelegation()
        // No need for duplicate listeners here

        // Removed blur-triggered refresh to prevent input focus loss
        // Inputs are updated in real-time via 'input' event, no need for refresh on blur

        // Guardar ejercicio
        $('#saveExercise').addEventListener('click', (ev) => {
            ev.preventDefault();
            const name = $('#exerciseName').value.trim();
            if (!name) {
                toast('Escribe el nombre del ejercicio', 'warn');
                return;
            }
            addExercise(app.currentSessionId, name);
            $('#exerciseDialog').close();
            toast('Ejercicio añadido', 'ok');
        });

        // Allow closing exercise dialog without validation
        $('#exerciseDialog').addEventListener('close', () => {
            // Reset form when closing
            $('#exerciseName').value = '';
        });

        // Guardar nota de ejercicio
        $('#saveExerciseNote').addEventListener('click', (ev) => {
            ev.preventDefault();
            const dialog = $('#exerciseNoteDialog');
            const textarea = $('#exerciseNoteText');
            const sessionId = dialog.dataset.sessionId;
            const exId = dialog.dataset.exId;

            if (!sessionId || !exId) return;

            const noteText = textarea ? textarea.value : '';
            saveExerciseNote(sessionId, exId, noteText);
            dialog.close();
            refresh({ preserveTab: true });
            if (noteText.trim()) {
                toast('Nota guardada', 'ok');
            } else {
                toast('Nota eliminada', 'ok');
            }
        });

        // Reset exercise note dialog when closing
        $('#exerciseNoteDialog').addEventListener('close', () => {
            const textarea = $('#exerciseNoteText');
            if (textarea) textarea.value = '';
        });

        // Rest timer dialog - use event delegation
        document.addEventListener('click', (e) => {
            const timerBtn = e.target.closest('.timer-btn');
            if (timerBtn) {
                e.preventDefault();
                const minutes = parseInt(timerBtn.dataset.minutes);
                if (minutes) {
                    startRestTimer(minutes);
                }
                return;
            }

            const timerCancelBtn = e.target.closest('#timerCancel');
            if (timerCancelBtn) {
                e.preventDefault();
                stopRestTimer();
                return;
            }
        });

        // Close timer dialog when closing
        const restTimerDialog = $('#restTimerDialog');
        if (restTimerDialog) {
            restTimerDialog.addEventListener('close', () => {
                stopRestTimer();
            });
        }

        // Archivo JSON - Only if elements exist (EasyTracker: only Diary and Routines)
        const fileInput = $('#fileInput');
        if (fileInput) fileInput.addEventListener('change', handleFile);
        const btnImport = $('#btnImport');
        if (btnImport) btnImport.addEventListener('click', applyImport);
        const btnExport = $('#btnExport');
        if (btnExport) btnExport.addEventListener('click', exportSessions);
        const btnExportRoutines = $('#btnExportRoutines');
        if (btnExportRoutines) btnExportRoutines.addEventListener('click', exportRoutines);

        // Importar rutinas - Only if elements exist
        const btnImportRoutines = $('#btnImportRoutines');
        if (btnImportRoutines) {
            btnImportRoutines.addEventListener('click', () => {
                const fileInput = $('#routineFileInput');
                if (fileInput) {
                    fileInput.click();
                }
            });
        }
        const routineFileInput = $('#routineFileInput');
        if (routineFileInput) {
            routineFileInput.addEventListener('change', (e) => {
                handleRoutineFile(e);
                // Show the container after file is selected
                const container = $('#routineFileInputContainer');
                if (container) {
                    container.style.display = 'block';
                }
            });
        }
        const btnConfirmImportRoutines = $('#btnConfirmImportRoutines');
        if (btnConfirmImportRoutines) btnConfirmImportRoutines.addEventListener('click', applyRoutineImport);
        const btnCancelImportRoutines = $('#btnCancelImportRoutines');
        if (btnCancelImportRoutines) btnCancelImportRoutines.addEventListener('click', cancelRoutineImport);

        // Plantillas - Only if elements exist
        const templateButtons = $('#templateButtons');
        if (templateButtons) {
            templateButtons.addEventListener('click', (e) => {
                const btn = e.target.closest('[data-template]');
                if (!btn) return;
                openTemplatePreview(btn.dataset.template);
            });
        }
        const confirmTemplate = $('#confirmTemplate');
        if (confirmTemplate) confirmTemplate.addEventListener('click', importTemplateIntoVisibleWeek);

        // Selector de período de estadísticas
        const statsPeriodSelect = $('#statsPeriod');
        if (statsPeriodSelect) {
            statsPeriodSelect.addEventListener('change', () => {
                app.statsPeriod = statsPeriodSelect.value;
                save(); // Guardar la preferencia
                buildStats(); // Recalcular estadísticas
            });
        }

        const profilePhotoInput = document.getElementById('profilePhoto');
        if (profilePhotoInput) {
            profilePhotoInput.addEventListener('change', handleProfilePhotoChange);
        }

        const generateAvatarBtn = document.getElementById('generateAvatar');
        if (generateAvatarBtn) {
            generateAvatarBtn.addEventListener('click', handleGenerateAvatar);
        }

        const avatarStyleSelect = document.getElementById('avatarStyle');
        if (avatarStyleSelect) {
            avatarStyleSelect.addEventListener('change', handleAvatarStyleChange);
        }

        const removePhotoBtn = document.getElementById('removePhoto');
        if (removePhotoBtn) {
            removePhotoBtn.addEventListener('click', handleRemovePhoto);
        }

        const saveProfileBtn = document.getElementById('saveProfile');
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', handleProfileSave);
        }

        const saveBodyMeasurementsBtn = document.getElementById('saveBodyMeasurements');
        if (saveBodyMeasurementsBtn) {
            saveBodyMeasurementsBtn.addEventListener('click', handleBodyMeasurementsSave);
        }

        const calculateBMRBtn = document.getElementById('calculateBMR');
        if (calculateBMRBtn) {
            calculateBMRBtn.addEventListener('click', handleBMRCalculate);
        }

        // Archive cycle button
        const archiveCycleBtn = $('#archiveCycleBtn');
        if (archiveCycleBtn) {
            archiveCycleBtn.addEventListener('click', () => {
                if (confirm('¿Archivar el ciclo actual? Esto guardará todas tus sesiones y estadísticas, y reiniciará el ciclo actual.')) {
                    archiveCurrentCycle();
                }
            });
        }

        // Initial render of archived cycles - Removed for EasyTracker (only Diary and Routines)
        // renderArchivedCycles();

        const addNoteBtn = document.getElementById('addNote');
        if (addNoteBtn) {
            addNoteBtn.addEventListener('click', handleAddNote);
        }

        const notesListEl = document.getElementById('notesList');
        if (notesListEl) {
            notesListEl.addEventListener('click', (ev) => {
                const btn = ev.target.closest('.js-delete-note');
                if (!btn) return;
                ev.preventDefault();
                deleteNote(btn.dataset.noteId);
            });
        }

        // Goals System
        const btnNewGoal = document.getElementById('btnNewGoal');
        if (btnNewGoal) {
            btnNewGoal.addEventListener('click', () => {
                $('#goalName').value = '';
                $('#goalType').value = 'weight';
                $('#goalTarget').value = '';
                $('#goalRepsTarget').value = '';
                $('#goalExercise').value = '';
                $('#goalDeadline').value = '';
                $('#goalAutoMilestones').checked = true;
                // Show exercise field for weight type by default
                $('#goalExerciseField').style.display = 'block';
                $('#goalRepsTargetField').style.display = 'none';
                $('#goalTargetLabel').textContent = 'Meta objetivo';
                $('#goalTitle').textContent = 'Nuevo Objetivo';
                $('#goalDialog').dataset.goalId = '';
                $('#goalDialog').showModal();
            });
        }

        const goalTypeSelect = document.getElementById('goalType');
        if (goalTypeSelect) {
            goalTypeSelect.addEventListener('change', (e) => {
                const type = e.target.value;
                const exerciseField = $('#goalExerciseField');
                const targetField = $('#goalTargetField');
                const targetLabel = $('#goalTargetLabel');
                const repsTargetField = $('#goalRepsTargetField');

                // Show/hide exercise field
                if (type === 'exercise' || type === 'weight' || type === 'repsWeight') {
                    if (exerciseField) exerciseField.style.display = 'block';
                } else {
                    if (exerciseField) exerciseField.style.display = 'none';
                }

                // Handle repsWeight type - show two inputs
                if (type === 'repsWeight') {
                    if (targetLabel) targetLabel.textContent = 'KG Objetivo';
                    if (targetField) targetField.style.display = 'block';
                    if (repsTargetField) repsTargetField.style.display = 'block';
                    if ($('#goalTarget')) $('#goalTarget').placeholder = 'Ej. 100';
                    if ($('#goalRepsTarget')) $('#goalRepsTarget').placeholder = 'Ej. 10';
                } else {
                    if (targetLabel) targetLabel.textContent = 'Meta objetivo';
                    if (targetField) targetField.style.display = 'block';
                    if (repsTargetField) repsTargetField.style.display = 'none';
                    if ($('#goalTarget')) {
                        if (type === 'weight' || type === 'loseWeight' || type === 'gainWeight') {
                            $('#goalTarget').placeholder = 'Ej. 100';
                        } else {
                            $('#goalTarget').placeholder = 'Ej. 100';
                        }
                    }
                }
            });
        }

        const saveGoalBtn = document.getElementById('saveGoal');
        if (saveGoalBtn) {
            saveGoalBtn.addEventListener('click', (ev) => {
                ev.preventDefault();
                const name = $('#goalName').value.trim();
                const type = $('#goalType').value;
                const target = $('#goalTarget').value;
                const repsTarget = $('#goalRepsTarget').value;
                const exerciseName = $('#goalExercise').value.trim();
                const deadline = $('#goalDeadline').value;
                const autoMilestones = $('#goalAutoMilestones').checked;

                if (!name) {
                    toast('Escribe el nombre del objetivo', 'warn');
                    return;
                }

                if (type === 'repsWeight') {
                    if (!target || parseFloat(target) <= 0) {
                        toast('El KG objetivo debe ser mayor que 0', 'warn');
                        return;
                    }
                    if (!repsTarget || parseFloat(repsTarget) <= 0) {
                        toast('Las repeticiones objetivo deben ser mayores que 0', 'warn');
                        return;
                    }
                    if (!exerciseName) {
                        toast('Especifica el ejercicio', 'warn');
                        return;
                    }
                } else {
                    if (!target || parseFloat(target) <= 0) {
                        toast('La meta debe ser mayor que 0', 'warn');
                        return;
                    }
                    if ((type === 'exercise' || type === 'weight' || type === 'repsWeight') && !exerciseName) {
                        toast('Especifica el ejercicio', 'warn');
                        return;
                    }
                }

                addGoal({
                    name,
                    type,
                    target,
                    repsTarget: type === 'repsWeight' ? parseFloat(repsTarget) : null,
                    exerciseName: (type === 'exercise' || type === 'weight' || type === 'repsWeight') ? exerciseName : null,
                    deadline: deadline || null,
                    autoMilestones
                });

                $('#goalDialog').close();
            });
        }

        // Optimized resize handler - only re-render if viewport crosses mobile/desktop threshold
        let resizeTimer;
        let lastViewportWidth = window.innerWidth;
        const MOBILE_BREAKPOINT = 768;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const currentWidth = window.innerWidth;
                const wasMobile = lastViewportWidth < MOBILE_BREAKPOINT;
                const isMobile = currentWidth < MOBILE_BREAKPOINT;

                // Only re-render if crossing mobile/desktop threshold
                if (wasMobile !== isMobile) {
                    const activePanel = document.querySelector('.panel[aria-hidden="false"]');
                    if (activePanel && activePanel.id === 'panel-diary') {
                        renderSessions();
                    }
                }
                lastViewportWidth = currentWidth;
            }, 300);
        });

    }

    /* =================== Refresh =================== */
    function render() {
        renderWeekbar();
        renderSummary();

        // Only render visible panels for better performance - EasyTracker: Only Diary and Routines
        const activePanel = document.querySelector('.panel[aria-hidden="false"]');
        if (activePanel) {
            const panelId = activePanel.id;
            if (panelId === 'panel-diary') {
                renderSessions();
            } else if (panelId === 'panel-routines') {
                renderRoutines();
            }
        } else {
            // Fallback: render diary by default
            renderSessions();
        }
    }

    function refresh({ preserveTab } = {}) {
        // Clear caches
        clearDomCache();
        if (typeof clearProgressCache === 'function') clearProgressCache();
        app.exerciseHistoryCache = {}; // Clear history cache

        render();
        
        // Render Stats if visible
        const activePanel = document.querySelector('.panel[aria-hidden="false"]');
        if (activePanel && activePanel.id === 'panel-stats') {
            if (typeof buildStats === 'function') buildStats();
            if (typeof buildChartState === 'function') buildChartState();
            if (typeof renderArchivedCycles === 'function') renderArchivedCycles();
        }
        
        // Render Import if visible
        if (activePanel && activePanel.id === 'panel-import') {
            if (typeof initWeekSelector === 'function') initWeekSelector();
            if (typeof renderImportRoutineList === 'function') renderImportRoutineList();
        }
    }

    /* =================== Init =================== */
    (async function init() {
        // Load data
        await load();
        bindEvents();
        render();
        // Removed competitive mode initialization for EasyTracker (only Diary and Routines)
    })();


    /* =================== Profile Handlers =================== */
    function handleProfilePhotoChange(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast('Por favor selecciona un archivo de imagen', 'warn');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (event) {
            const photoData = event.target.result;
            app.profile.photo = photoData;
            save();

            const avatar = $('#profileAvatar');
            if (avatar) {
                avatar.src = photoData;
            }

            // Show remove photo button
            const removeBtn = $('#removePhoto');
            if (removeBtn) {
                removeBtn.style.display = 'block';
            }

            toast('Foto de perfil actualizada', 'ok');
        };
        reader.onerror = function () {
            toast('Error al cargar la imagen', 'err');
        };
        reader.readAsDataURL(file);
    }

    function handleGenerateAvatar() {
        // Generate new random seed
        app.profile.avatarSeed = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        app.profile.photo = ''; // Clear photo when using generated avatar
        save();

        const avatar = $('#profileAvatar');
        if (avatar) {
            avatar.src = getCurrentAvatar();
        }

        // Hide remove photo button
        const removeBtn = $('#removePhoto');
        if (removeBtn) {
            removeBtn.style.display = 'none';
        }
    }

    function handleAvatarStyleChange() {
        const styleSelect = $('#avatarStyle');
        if (!styleSelect) return;

        app.profile.avatarStyle = styleSelect.value;
        app.profile.photo = ''; // Clear photo when changing style
        save();

        const avatar = $('#profileAvatar');
        if (avatar) {
            avatar.src = getCurrentAvatar();
        }

        // Hide remove photo button
        const removeBtn = $('#removePhoto');
        if (removeBtn) {
            removeBtn.style.display = 'none';
        }
    }

    function handleRemovePhoto() {
        app.profile.photo = '';
        save();

        const avatar = $('#profileAvatar');
        if (avatar) {
            avatar.src = getCurrentAvatar();
        }

        const photoInput = $('#profilePhoto');
        if (photoInput) {
            photoInput.value = '';
        }

        const removeBtn = $('#removePhoto');
        if (removeBtn) {
            removeBtn.style.display = 'none';
        }

        toast('Foto eliminada', 'ok');
    }

    function handleProfileSave(e) {
        if (e) e.preventDefault();

        const firstName = $('#profileFirstName')?.value.trim() || '';
        const lastName = $('#profileLastName')?.value.trim() || '';
        const height = $('#profileHeight')?.value.trim() || '';
        const weight = $('#profileWeight')?.value.trim() || '';
        const bodyFat = $('#profileBodyFat')?.value.trim() || '';

        app.profile.firstName = firstName;
        app.profile.lastName = lastName;
        app.profile.height = height;
        app.profile.weight = weight;
        app.profile.bodyFat = bodyFat;

        // If no photo is set and no seed exists, generate seed from name
        if (!app.profile.photo && !app.profile.avatarSeed) {
            const nameSeed = (firstName + ' ' + lastName).trim() || 'default';
            app.profile.avatarSeed = nameSeed;
        }

        // Add to weight history if weight or bodyFat is provided
        if (weight || bodyFat) {
            const today = new Date().toISOString().split('T')[0];
            const existingEntry = app.profile.weightHistory?.find(entry => entry.date === today);

            if (existingEntry) {
                if (weight) existingEntry.weight = parseFloat(weight) || null;
                if (bodyFat) existingEntry.bodyFat = parseFloat(bodyFat) || null;
            } else {
                if (!app.profile.weightHistory) app.profile.weightHistory = [];
                app.profile.weightHistory.push({
                    date: today,
                    weight: weight ? parseFloat(weight) : null,
                    bodyFat: bodyFat ? parseFloat(bodyFat) : null
                });
            }
        }

        save();
        renderProfile();
        toast('Perfil actualizado', 'ok');
    }

    /* =================== Notes Handlers =================== */
    function handleAddNote(e) {
        if (e) e.preventDefault();

        const noteText = $('#noteText');
        if (!noteText) return;

        const text = noteText.value.trim();
        if (!text) {
            toast('Escribe algo en la nota', 'warn');
            return;
        }

        if (!app.notes) app.notes = [];
        app.notes.push({
            id: uuid(),
            text: text,
            createdAt: new Date().toISOString()
        });

        save();
        noteText.value = '';
        renderNotes();
        toast('Nota guardada', 'ok');
    }

    function deleteNote(noteId) {
        if (!noteId) return;
        if (!app.notes) app.notes = [];
        app.notes = app.notes.filter(note => note.id !== noteId);
        save();
        renderNotes();
        toast('Nota eliminada', 'ok');
    }

    function renderNotes() {
        const notesList = $('#notesList');
        const notesEmpty = $('#notesEmpty');

        if (!notesList) return;

        if (!app.notes || app.notes.length === 0) {
            if (notesList) notesList.innerHTML = '';
            if (notesEmpty) notesEmpty.hidden = false;
            return;
        }

        if (notesEmpty) notesEmpty.hidden = true;

        const sortedNotes = [...app.notes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        notesList.innerHTML = sortedNotes.map(note => {
            const date = new Date(note.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            return `
                <div class="note-item">
                    <p>${note.text}</p>
                    <div class="note-meta">
                        <span>${date}</span>
                        <button class="note-delete-btn js-delete-note" data-note-id="${note.id}" aria-label="Eliminar nota" title="Eliminar nota">✕</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderProfile() {
        const avatar = $('#profileAvatar');
        if (avatar) {
            avatar.src = getCurrentAvatar();
        }

        const photoInput = $('#profilePhoto');
        if (photoInput) {
            photoInput.value = '';
        }

        // Set avatar style selector
        const styleSelect = $('#avatarStyle');
        if (styleSelect) {
            styleSelect.value = app.profile.avatarStyle || 'avataaars';
        }

        // Show/hide remove photo button
        const removeBtn = $('#removePhoto');
        if (removeBtn) {
            removeBtn.style.display = app.profile.photo ? 'block' : 'none';
        }

        // Render level display
        const levelDisplay = $('#profileLevelDisplay');
        if (levelDisplay && typeof getCompletedDays === 'function' && typeof getCurrentLevel === 'function' && typeof getMedalImage === 'function') {
            const daysCompleted = getCompletedDays();
            const currentLevel = getCurrentLevel(daysCompleted);
            const imageFile = getMedalImage(currentLevel);

            const levelImage = imageFile
                ? `<img src="${imageFile}" alt="Nivel ${currentLevel.level}" style="width:70px; height:70px; object-fit:contain; background:transparent; mix-blend-mode:normal; flex-shrink:0" onerror="this.onerror=null; this.src=''; this.style.display='none'; const fallback = this.parentElement.querySelector('.level-icon-fallback'); if(fallback) fallback.style.display='block';" />
                    <div class="level-icon-fallback" style="font-size:2rem; display:none">${currentLevel.icon}</div>`
                : `<div style="font-size:2rem; width:70px; height:70px; display:flex; align-items:center; justify-content:center; flex-shrink:0">${currentLevel.icon}</div>`;

            levelDisplay.innerHTML = `
                <div style="display:flex; align-items:center; justify-content:space-between; gap:16px; width:100%">
                    <div style="display:flex; align-items:center; justify-content:center; flex-shrink:0">
                        ${levelImage}
                    </div>
                    <div style="display:flex; flex-direction:column; flex:1; min-width:0">
                        <div style="font-size:0.85rem; color:var(--muted); margin-bottom:4px">Nivel actual</div>
                        <div style="font-size:1.1rem; font-weight:800; color:var(--heading); margin-bottom:4px">
                            ${currentLevel.name}
                        </div>
                        <div style="font-size:0.85rem; color:var(--muted)">
                            ${daysCompleted} ${daysCompleted === 1 ? 'día' : 'días'} completados
                        </div>
                    </div>
                </div>
            `;
        }

        const firstNameInput = $('#profileFirstName');
        if (firstNameInput) firstNameInput.value = app.profile.firstName || '';
        const lastNameInput = $('#profileLastName');
        if (lastNameInput) lastNameInput.value = app.profile.lastName || '';
        const heightInput = $('#profileHeight');
        if (heightInput) heightInput.value = app.profile.height || '';
        const weightInput = $('#profileWeight');
        if (weightInput) weightInput.value = app.profile.weight || '';
        const bodyFatInput = $('#profileBodyFat');
        if (bodyFatInput) bodyFatInput.value = app.profile.bodyFat || '';

        const historyBody = $('#profileHistoryBody');
        if (historyBody) {
            const entries = [...(app.profile.weightHistory || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
            if (!entries.length) {
                historyBody.innerHTML = '<tr><td colspan="3" style="padding:8px">Sin registros aún</td></tr>';
            } else {
                historyBody.innerHTML = entries.map(entry => {
                    const date = new Date(entry.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
                    const hasWeight = typeof entry.weight === 'number' && Number.isFinite(entry.weight);
                    const hasFat = typeof entry.bodyFat === 'number' && Number.isFinite(entry.bodyFat);
                    const weight = hasWeight ? entry.weight.toFixed(1) : '—';
                    const fat = hasFat ? entry.bodyFat.toFixed(1) : '—';
                    return `<tr><td>${date}</td><td>${weight}</td><td>${fat}</td></tr>`;
                }).join('');
            }
        }

        // Render body measurements history
        const bodyMeasurementsHistoryBody = $('#bodyMeasurementsHistoryBody');
        if (bodyMeasurementsHistoryBody) {
            const entries = [...(app.profile.bodyMeasurementsHistory || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
            if (!entries.length) {
                bodyMeasurementsHistoryBody.innerHTML = '<tr><td colspan="7" style="padding:8px; color:var(--muted)">Sin registros aún</td></tr>';
            } else {
                bodyMeasurementsHistoryBody.innerHTML = entries.map(entry => {
                    const date = new Date(entry.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
                    const formatValue = (val) => (typeof val === 'number' && Number.isFinite(val)) ? val.toFixed(1) : '—';
                    return `<tr>
                                <td style="padding:8px; border-bottom:1px solid var(--border)">${date}</td>
                                <td style="padding:8px; border-bottom:1px solid var(--border)">${formatValue(entry.arms)}</td>
                                <td style="padding:8px; border-bottom:1px solid var(--border)">${formatValue(entry.chest)}</td>
                                <td style="padding:8px; border-bottom:1px solid var(--border)">${formatValue(entry.waist)}</td>
                                <td style="padding:8px; border-bottom:1px solid var(--border)">${formatValue(entry.hips)}</td>
                                <td style="padding:8px; border-bottom:1px solid var(--border)">${formatValue(entry.legs)}</td>
                                <td style="padding:8px; border-bottom:1px solid var(--border)">${formatValue(entry.calves)}</td>
                            </tr>`;
                }).join('');
            }
        }

        // Render notes
        renderNotes();
    }

    function handleBodyMeasurementsSave(e) {
        if (e) e.preventDefault();

        const arms = $('#measurementArms')?.value.trim() || '';
        const chest = $('#measurementChest')?.value.trim() || '';
        const waist = $('#measurementWaist')?.value.trim() || '';
        const hips = $('#measurementHips')?.value.trim() || '';
        const legs = $('#measurementLegs')?.value.trim() || '';
        const calves = $('#measurementCalves')?.value.trim() || '';

        // Check if at least one measurement is provided
        if (!arms && !chest && !waist && !hips && !legs && !calves) {
            toast('Ingresa al menos una medida', 'warn');
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        const existingEntry = app.profile.bodyMeasurementsHistory?.find(entry => entry.date === today);

        const measurements = {
            date: today,
            arms: arms ? parseFloat(arms) : null,
            chest: chest ? parseFloat(chest) : null,
            waist: waist ? parseFloat(waist) : null,
            hips: hips ? parseFloat(hips) : null,
            legs: legs ? parseFloat(legs) : null,
            calves: calves ? parseFloat(calves) : null
        };

        if (existingEntry) {
            // Update existing entry, merge with existing values
            if (arms) existingEntry.arms = parseFloat(arms);
            if (chest) existingEntry.chest = parseFloat(chest);
            if (waist) existingEntry.waist = parseFloat(waist);
            if (hips) existingEntry.hips = parseFloat(hips);
            if (legs) existingEntry.legs = parseFloat(legs);
            if (calves) existingEntry.calves = parseFloat(calves);
        } else {
            if (!app.profile.bodyMeasurementsHistory) app.profile.bodyMeasurementsHistory = [];
            app.profile.bodyMeasurementsHistory.push(measurements);
        }

        // Clear form
        $('#measurementArms').value = '';
        $('#measurementChest').value = '';
        $('#measurementWaist').value = '';
        $('#measurementHips').value = '';
        $('#measurementLegs').value = '';
        $('#measurementCalves').value = '';

        save();
        renderProfile();
        toast('Medidas guardadas', 'ok');
    }

    function handleBMRCalculate(e) {
        if (e) e.preventDefault();

        const gender = $('#bmrGender')?.value || 'male';
        const age = parseFloat($('#bmrAge')?.value) || 0;
        const activity = parseFloat($('#bmrActivity')?.value) || 1.2;
        const goal = $('#bmrGoal')?.value || 'maintain';
        const weight = parseFloat(app.profile?.weight) || 0;
        const height = parseFloat(app.profile?.height) || 0;

        if (!age || age < 1 || age > 120) {
            toast('Ingresa una edad válida', 'warn');
            return;
        }

        if (!weight || weight <= 0) {
            toast('Ingresa tu peso en el perfil para calcular la TMB', 'warn');
            return;
        }

        if (!height || height <= 0) {
            toast('Ingresa tu altura en el perfil para calcular la TMB', 'warn');
            return;
        }

        // Calculate BMR using Mifflin-St Jeor equation
        // BMR (men) = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + 5
        // BMR (women) = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) - 161
        let bmr = (10 * weight) + (6.25 * height) - (5 * age);
        if (gender === 'male') {
            bmr += 5;
        } else {
            bmr -= 161;
        }

        // Calculate TDEE (Total Daily Energy Expenditure)
        const tdee = Math.round(bmr * activity);

        // Calculate recommended calories based on goal
        let recommendedCalories = tdee;
        let goalText = '';
        if (goal === 'lose') {
            // Deficit of 500 kcal/day for ~0.5kg/week weight loss
            recommendedCalories = Math.round(tdee - 500);
            goalText = `Para perder grasa: ${recommendedCalories} kcal/día (déficit de 500 kcal)`;
        } else if (goal === 'gain') {
            // Surplus of 300-500 kcal/day for muscle gain
            recommendedCalories = Math.round(tdee + 400);
            goalText = `Para ganar masa muscular: ${recommendedCalories} kcal/día (superávit de 400 kcal)`;
        } else {
            goalText = `Para mantener peso: ${recommendedCalories} kcal/día`;
        }

        // Display results
        const resultsDiv = $('#bmrResults');
        const bmrValue = $('#bmrValue');
        const tdeeValue = $('#tdeeValue');
        const recommendedCaloriesDiv = $('#recommendedCalories');

        if (resultsDiv) resultsDiv.style.display = 'block';
        if (bmrValue) bmrValue.textContent = Math.round(bmr);
        if (tdeeValue) tdeeValue.textContent = tdee;
        if (recommendedCaloriesDiv) recommendedCaloriesDiv.textContent = goalText;
    }

    /* =================== Settings Menu =================== */
    // Settings navigation
    const settingsBtn = $('#settingsBtn');
    const settingsMain = $('#settingsMain');
    const settingsTheme = $('#settingsTheme');
    const settingsProfile = $('#settingsProfile');
    const settingsInfo = $('#settingsInfo');
    const themeDarkBtn = $('#themeDarkBtn');
    const themeLightBtn = $('#themeLightBtn');
    const colorSwatches = $('#colorSwatches');

    // Open settings panel
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            // Hide all other panels
            $$('.panel').forEach(panel => {
                panel.setAttribute('aria-hidden', 'true');
            });
            // Show settings panel
            const settingsPanel = $('#panel-settings');
            if (settingsPanel) {
                settingsPanel.setAttribute('aria-hidden', 'false');
                // Reset to main menu
                showSettingsMain();
            }
            // Update navigation
            ['navDiary', 'navStats', 'navRoutines', 'navImport'].forEach(id => {
                const btn = $(`#${id}`);
                if (btn) {
                    btn.setAttribute('aria-current', 'false');
                    btn.classList.remove('active');
                }
            });
        });
    }

    // Swipe gesture support for mobile (swipe right to go back)
    let touchStartX = 0;
    let touchEndX = 0;
    const settingsPanel = $('#panel-settings');
    if (settingsPanel) {
        settingsPanel.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        settingsPanel.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const swipeThreshold = 50;
            const swipeDistance = touchStartX - touchEndX;
            
            // Swipe right (go back)
            if (swipeDistance < -swipeThreshold) {
                const themePanel = $('#settingsTheme');
                const profilePanel = $('#settingsProfile');
                const infoPanel = $('#settingsInfo');
                
                if (themePanel && themePanel.style.display !== 'none') {
                    showSettingsMain();
                } else if (profilePanel && profilePanel.style.display !== 'none') {
                    showSettingsMain();
                } else if (infoPanel && infoPanel.style.display !== 'none') {
                    showSettingsMain();
                }
            }
        }, { passive: true });
    }

    function showSettingsMain() {
        if (settingsMain) settingsMain.style.display = 'block';
        if (settingsTheme) settingsTheme.style.display = 'none';
        if (settingsProfile) settingsProfile.style.display = 'none';
        if (settingsInfo) settingsInfo.style.display = 'none';
    }

    function showSettingsTheme() {
        if (settingsMain) settingsMain.style.display = 'none';
        if (settingsTheme) settingsTheme.style.display = 'block';
        if (settingsProfile) settingsProfile.style.display = 'none';
        if (settingsInfo) settingsInfo.style.display = 'none';
        updateThemeButtons();
        renderColorSwatches();
    }

    function showSettingsProfile() {
        if (settingsMain) settingsMain.style.display = 'none';
        if (settingsTheme) settingsTheme.style.display = 'none';
        if (settingsProfile) settingsProfile.style.display = 'block';
        if (settingsInfo) settingsInfo.style.display = 'none';
        renderProfile();
    }

    function showSettingsInfo() {
        if (settingsMain) settingsMain.style.display = 'none';
        if (settingsTheme) settingsTheme.style.display = 'none';
        if (settingsProfile) settingsProfile.style.display = 'none';
        if (settingsInfo) settingsInfo.style.display = 'block';
    }

    // Navigation buttons
    const settingsThemeBtn = $('#settingsThemeBtn');
    const settingsProfileBtn = $('#settingsProfileBtn');
    const settingsInfoBtn = $('#settingsInfoBtn');
    const backFromTheme = $('#backFromTheme');
    const backFromProfile = $('#backFromProfile');
    const backFromInfo = $('#backFromInfo');

    if (settingsThemeBtn) settingsThemeBtn.addEventListener('click', showSettingsTheme);
    if (settingsProfileBtn) settingsProfileBtn.addEventListener('click', showSettingsProfile);
    if (settingsInfoBtn) settingsInfoBtn.addEventListener('click', showSettingsInfo);
    if (backFromTheme) backFromTheme.addEventListener('click', showSettingsMain);
    if (backFromProfile) backFromProfile.addEventListener('click', showSettingsMain);
    if (backFromInfo) backFromInfo.addEventListener('click', showSettingsMain);

    // Theme toggle
    function updateThemeButtons() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (themeDarkBtn && themeLightBtn) {
            if (currentTheme === 'dark') {
                themeDarkBtn.classList.remove('btn--ghost');
                themeDarkBtn.classList.add('btn');
                themeLightBtn.classList.remove('btn');
                themeLightBtn.classList.add('btn--ghost');
            } else {
                themeDarkBtn.classList.remove('btn');
                themeDarkBtn.classList.add('btn--ghost');
                themeLightBtn.classList.remove('btn--ghost');
                themeLightBtn.classList.add('btn');
            }
        }
    }

    if (themeDarkBtn) {
        themeDarkBtn.addEventListener('click', () => {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('trainingDiary.theme', 'dark');
            updateThemeButtons();
            updateThemeColors('dark');
        });
    }

    if (themeLightBtn) {
        themeLightBtn.addEventListener('click', () => {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('trainingDiary.theme', 'light');
            updateThemeButtons();
            updateThemeColors('light');
        });
    }

    // Color swatches - apply to both themes
    function renderColorSwatches() {
        if (!colorSwatches) return;
        const prefs = loadColorPreferences();
        colorSwatches.innerHTML = '';

        Object.keys(COLOR_PRESETS).forEach(colorKey => {
            const colors = COLOR_PRESETS[colorKey];
            const swatch = document.createElement('button');
            swatch.className = 'color-swatch';
            swatch.setAttribute('aria-label', `Color ${COLOR_NAMES[colorKey]}`);
            swatch.style.setProperty('--swatch-color', colors.dark.primary);
            swatch.dataset.colorKey = colorKey;
            
            // Check if this color is selected for either theme
            if (prefs.dark === colorKey || prefs.light === colorKey) {
                swatch.classList.add('active');
            }
            
            swatch.addEventListener('click', () => {
                // Apply to both themes
                setThemeColor('dark', colorKey);
                setThemeColor('light', colorKey);
                renderColorSwatches();
            });
            
            colorSwatches.appendChild(swatch);
        });
    }

    // Set color for a specific theme
    function setThemeColor(theme, colorKey) {
        const prefs = loadColorPreferences();
        prefs[theme] = colorKey;
        saveColorPreferences(prefs);

        // Update if this is the current theme
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === theme) {
            updateThemeColors(theme);
        }
    }

    // Manual dialog
    const btnManual = $('#btnManual');
    if (btnManual) {
        btnManual.addEventListener('click', () => {
            const manualDialog = $('#manualDialog');
            if (manualDialog) manualDialog.showModal();
        });
    }

    // Profile handlers (from TrainTracker)
    function generateAvatarUrl(style, seed) {
        const styleMap = {
            'avataaars': 'avataaars',
            'pixel-art': 'pixel-art',
            'adventurer': 'adventurer',
            'big-smile': 'big-smile',
            'bottts': 'bottts',
            'fun-emoji': 'fun-emoji',
            'icons': 'icons',
            'identicon': 'identicon',
            'lorelei': 'lorelei',
            'micah': 'micah',
            'miniavs': 'miniavs',
            'notionists': 'notionists',
            'open-peeps': 'open-peeps',
            'personas': 'personas',
            'rings': 'rings',
            'shapes': 'shapes',
            'thumbs': 'thumbs'
        };
        const apiStyle = styleMap[style] || 'avataaars';
        const avatarSeed = seed || Math.random().toString(36).substring(2, 15);
        return `https://api.dicebear.com/9.x/${apiStyle}/svg?seed=${encodeURIComponent(avatarSeed)}`;
    }

    function getCurrentAvatar() {
        if (app.profile.photo) {
            return app.profile.photo;
        }
        const seed = app.profile.avatarSeed || (app.profile.firstName + ' ' + app.profile.lastName).trim() || 'default';
        const style = app.profile.avatarStyle || 'avataaars';
        return generateAvatarUrl(style, seed);
    }

    function handleProfilePhotoChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast('Por favor selecciona un archivo de imagen', 'warn');
            return;
        }
        const reader = new FileReader();
        reader.onload = function (event) {
            app.profile.photo = event.target.result;
            save();
            const avatar = $('#profileAvatar');
            if (avatar) avatar.src = app.profile.photo;
            const removeBtn = $('#removePhoto');
            if (removeBtn) removeBtn.style.display = 'block';
            toast('Foto de perfil actualizada', 'ok');
        };
        reader.readAsDataURL(file);
    }

    function handleGenerateAvatar() {
        app.profile.avatarSeed = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        app.profile.photo = '';
        save();
        const avatar = $('#profileAvatar');
        if (avatar) avatar.src = getCurrentAvatar();
        const removeBtn = $('#removePhoto');
        if (removeBtn) removeBtn.style.display = 'none';
    }

    function handleAvatarStyleChange() {
        const styleSelect = $('#avatarStyle');
        if (!styleSelect) return;
        app.profile.avatarStyle = styleSelect.value;
        app.profile.photo = '';
        save();
        const avatar = $('#profileAvatar');
        if (avatar) avatar.src = getCurrentAvatar();
        const removeBtn = $('#removePhoto');
        if (removeBtn) removeBtn.style.display = 'none';
    }

    function handleRemovePhoto() {
        app.profile.photo = '';
        save();
        const avatar = $('#profileAvatar');
        if (avatar) avatar.src = getCurrentAvatar();
        const photoInput = $('#profilePhoto');
        if (photoInput) photoInput.value = '';
        const removeBtn = $('#removePhoto');
        if (removeBtn) removeBtn.style.display = 'none';
        toast('Foto eliminada', 'ok');
    }

    function handleProfileSave(e) {
        if (e) e.preventDefault();
        const firstName = $('#profileFirstName')?.value.trim() || '';
        const lastName = $('#profileLastName')?.value.trim() || '';
        const height = $('#profileHeight')?.value.trim() || '';
        const weight = $('#profileWeight')?.value.trim() || '';
        const bodyFat = $('#profileBodyFat')?.value.trim() || '';
        app.profile.firstName = firstName;
        app.profile.lastName = lastName;
        app.profile.height = height;
        app.profile.weight = weight;
        app.profile.bodyFat = bodyFat;
        if (!app.profile.photo && !app.profile.avatarSeed) {
            const nameSeed = (firstName + ' ' + lastName).trim() || 'default';
            app.profile.avatarSeed = nameSeed;
        }
        if (weight || bodyFat) {
            const today = new Date().toISOString().split('T')[0];
            const existingEntry = app.profile.weightHistory?.find(entry => entry.date === today);
            if (existingEntry) {
                if (weight) existingEntry.weight = parseFloat(weight) || null;
                if (bodyFat) existingEntry.bodyFat = parseFloat(bodyFat) || null;
            } else {
                if (!app.profile.weightHistory) app.profile.weightHistory = [];
                app.profile.weightHistory.push({
                    date: today,
                    weight: weight ? parseFloat(weight) : null,
                    bodyFat: bodyFat ? parseFloat(bodyFat) : null
                });
            }
        }
        save();
        renderProfile();
        toast('Perfil actualizado', 'ok');
    }

    function handleBodyMeasurementsSave(e) {
        if (e) e.preventDefault();
        const arms = $('#measurementArms')?.value.trim() || '';
        const chest = $('#measurementChest')?.value.trim() || '';
        const waist = $('#measurementWaist')?.value.trim() || '';
        const hips = $('#measurementHips')?.value.trim() || '';
        const legs = $('#measurementLegs')?.value.trim() || '';
        const calves = $('#measurementCalves')?.value.trim() || '';
        if (!arms && !chest && !waist && !hips && !legs && !calves) {
            toast('Ingresa al menos una medida', 'warn');
            return;
        }
        const today = new Date().toISOString().split('T')[0];
        const existingEntry = app.profile.bodyMeasurementsHistory?.find(entry => entry.date === today);
        const measurements = {
            date: today,
            arms: arms ? parseFloat(arms) : null,
            chest: chest ? parseFloat(chest) : null,
            waist: waist ? parseFloat(waist) : null,
            hips: hips ? parseFloat(hips) : null,
            legs: legs ? parseFloat(legs) : null,
            calves: calves ? parseFloat(calves) : null
        };
        if (existingEntry) {
            if (arms) existingEntry.arms = parseFloat(arms);
            if (chest) existingEntry.chest = parseFloat(chest);
            if (waist) existingEntry.waist = parseFloat(waist);
            if (hips) existingEntry.hips = parseFloat(hips);
            if (legs) existingEntry.legs = parseFloat(legs);
            if (calves) existingEntry.calves = parseFloat(calves);
        } else {
            if (!app.profile.bodyMeasurementsHistory) app.profile.bodyMeasurementsHistory = [];
            app.profile.bodyMeasurementsHistory.push(measurements);
        }
        $('#measurementArms').value = '';
        $('#measurementChest').value = '';
        $('#measurementWaist').value = '';
        $('#measurementHips').value = '';
        $('#measurementLegs').value = '';
        $('#measurementCalves').value = '';
        save();
        renderProfile();
        toast('Medidas guardadas', 'ok');
    }

    function handleAddNote(e) {
        if (e) e.preventDefault();
        const noteText = $('#noteText');
        if (!noteText) return;
        const text = noteText.value.trim();
        if (!text) {
            toast('Escribe algo en la nota', 'warn');
            return;
        }
        if (!app.notes) app.notes = [];
        app.notes.push({
            id: uuid(),
            text: text,
            createdAt: new Date().toISOString()
        });
        save();
        noteText.value = '';
        renderNotes();
        toast('Nota guardada', 'ok');
    }

    function deleteNote(noteId) {
        if (!noteId) return;
        if (!app.notes) app.notes = [];
        app.notes = app.notes.filter(note => note.id !== noteId);
        save();
        renderNotes();
        toast('Nota eliminada', 'ok');
    }

    function renderNotes() {
        const notesList = $('#notesList');
        const notesEmpty = $('#notesEmpty');
        if (!notesList) return;
        if (!app.notes || app.notes.length === 0) {
            if (notesList) notesList.innerHTML = '';
            if (notesEmpty) notesEmpty.hidden = false;
            return;
        }
        if (notesEmpty) notesEmpty.hidden = true;
        const sortedNotes = [...app.notes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        notesList.innerHTML = sortedNotes.map(note => {
            const date = new Date(note.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            return `
                <div class="note-item">
                    <p>${escapeHtml(note.text)}</p>
                    <div class="note-meta">
                        <span>${date}</span>
                        <button class="note-delete-btn js-delete-note" data-note-id="${note.id}" aria-label="Eliminar nota" title="Eliminar nota">✕</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderProfile() {
        const avatar = $('#profileAvatar');
        if (avatar) avatar.src = getCurrentAvatar();
        const photoInput = $('#profilePhoto');
        if (photoInput) photoInput.value = '';
        const styleSelect = $('#avatarStyle');
        if (styleSelect) styleSelect.value = app.profile.avatarStyle || 'avataaars';
        const removeBtn = $('#removePhoto');
        if (removeBtn) removeBtn.style.display = app.profile.photo ? 'block' : 'none';
        const firstNameInput = $('#profileFirstName');
        if (firstNameInput) firstNameInput.value = app.profile.firstName || '';
        const lastNameInput = $('#profileLastName');
        if (lastNameInput) lastNameInput.value = app.profile.lastName || '';
        const heightInput = $('#profileHeight');
        if (heightInput) heightInput.value = app.profile.height || '';
        const weightInput = $('#profileWeight');
        if (weightInput) weightInput.value = app.profile.weight || '';
        const bodyFatInput = $('#profileBodyFat');
        if (bodyFatInput) bodyFatInput.value = app.profile.bodyFat || '';
        const historyBody = $('#profileHistoryBody');
        if (historyBody) {
            const entries = [...(app.profile.weightHistory || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
            if (!entries.length) {
                historyBody.innerHTML = '<tr><td colspan="3" style="padding:8px">Sin registros aún</td></tr>';
            } else {
                historyBody.innerHTML = entries.map(entry => {
                    const date = new Date(entry.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
                    const hasWeight = typeof entry.weight === 'number' && Number.isFinite(entry.weight);
                    const hasFat = typeof entry.bodyFat === 'number' && Number.isFinite(entry.bodyFat);
                    const weight = hasWeight ? entry.weight.toFixed(1) : '—';
                    const fat = hasFat ? entry.bodyFat.toFixed(1) : '—';
                    return `<tr><td>${date}</td><td>${weight}</td><td>${fat}</td></tr>`;
                }).join('');
            }
        }
        const bodyMeasurementsHistoryBody = $('#bodyMeasurementsHistoryBody');
        if (bodyMeasurementsHistoryBody) {
            const entries = [...(app.profile.bodyMeasurementsHistory || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
            if (!entries.length) {
                bodyMeasurementsHistoryBody.innerHTML = '<tr><td colspan="7" style="padding:8px; color:var(--muted)">Sin registros aún</td></tr>';
            } else {
                bodyMeasurementsHistoryBody.innerHTML = entries.map(entry => {
                    const date = new Date(entry.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
                    const formatValue = (val) => (typeof val === 'number' && Number.isFinite(val)) ? val.toFixed(1) : '—';
                    return `<tr>
                                <td style="padding:8px; border-bottom:1px solid var(--border)">${date}</td>
                                <td style="padding:8px; border-bottom:1px solid var(--border)">${formatValue(entry.arms)}</td>
                                <td style="padding:8px; border-bottom:1px solid var(--border)">${formatValue(entry.chest)}</td>
                                <td style="padding:8px; border-bottom:1px solid var(--border)">${formatValue(entry.waist)}</td>
                                <td style="padding:8px; border-bottom:1px solid var(--border)">${formatValue(entry.hips)}</td>
                                <td style="padding:8px; border-bottom:1px solid var(--border)">${formatValue(entry.legs)}</td>
                                <td style="padding:8px; border-bottom:1px solid var(--border)">${formatValue(entry.calves)}</td>
                            </tr>`;
                }).join('');
            }
        }
        renderNotes();
    }

    // Bind profile event listeners
    const profilePhoto = $('#profilePhoto');
    if (profilePhoto) profilePhoto.addEventListener('change', handleProfilePhotoChange);
    const generateAvatar = $('#generateAvatar');
    if (generateAvatar) generateAvatar.addEventListener('click', handleGenerateAvatar);
    const avatarStyle = $('#avatarStyle');
    if (avatarStyle) avatarStyle.addEventListener('change', handleAvatarStyleChange);
    const removePhoto = $('#removePhoto');
    if (removePhoto) removePhoto.addEventListener('click', handleRemovePhoto);
    const saveProfile = $('#saveProfile');
    if (saveProfile) saveProfile.addEventListener('click', handleProfileSave);
    const saveBodyMeasurements = $('#saveBodyMeasurements');
    if (saveBodyMeasurements) saveBodyMeasurements.addEventListener('click', handleBodyMeasurementsSave);
    const calculateBMR = $('#calculateBMR');
    if (calculateBMR) calculateBMR.addEventListener('click', handleBMRCalculate);
    const addNote = $('#addNote');
    if (addNote) addNote.addEventListener('click', handleAddNote);
    const notesList = $('#notesList');
    if (notesList) {
        notesList.addEventListener('click', (ev) => {
            const btn = ev.target.closest('.js-delete-note');
            if (!btn) return;
            ev.preventDefault();
            deleteNote(btn.dataset.noteId);
        });
    }

});
