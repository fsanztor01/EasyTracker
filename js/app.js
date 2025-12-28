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

    // Color definitions organized by color scale: [primary, primary-600, accent, accent-600]
    // Organized in color spectrum order: Red -> Orange -> Yellow -> Green -> Blue -> Purple -> Pink -> Gray
    // Color definitions now loaded from ThemeUtils to ensure consistency
    const COLOR_PRESETS = ThemeUtils.COLOR_PRESETS;

    // Color display names
    const COLOR_NAMES = {
        // REDS
        carmesi: 'Carmesí',
        rojo: 'Rojo',
        rojoClaro: 'Rojo Claro',
        rojoOscuro: 'Rojo Oscuro',
        // ORANGES
        naranjaOscuro: 'Naranja Oscuro',
        naranja: 'Naranja',
        coral: 'Coral',
        naranjaClaro: 'Naranja Claro',
        // YELLOWS
        amarilloOscuro: 'Amarillo Oscuro',
        amarillo: 'Amarillo',
        lima: 'Lima',
        amarilloClaro: 'Amarillo Claro',
        // GREENS
        verdeOscuro: 'Verde Oscuro',
        verde: 'Verde',
        esmeralda: 'Esmeralda',
        verdeClaro: 'Verde Claro',
        // TEAL/CYAN
        teal: 'Teal',
        turquesa: 'Turquesa',
        cian: 'Cian',
        cianClaro: 'Cian Claro',
        // BLUES
        azulOscuro: 'Azul Oscuro',
        azul: 'Azul',
        azulClaro: 'Azul Claro',
        azulCielo: 'Azul Cielo',
        // INDIGO
        indigo: 'Índigo',
        indigoOscuro: 'Índigo Oscuro',
        indigoClaro: 'Índigo Claro',
        indigoVibrante: 'Índigo Vibrante',
        // PURPLES
        moradoOscuro: 'Morado Oscuro',
        morado: 'Morado',
        violeta: 'Violeta',
        moradoClaro: 'Morado Claro',
        // PINKS
        rosaOscuro: 'Rosa Oscuro',
        rosa: 'Rosa',
        fucsia: 'Fucsia',
        rosaClaro: 'Rosa Claro',
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
        // Use ThemeUtils if available, otherwise use local function
        if (window.ThemeUtils && window.ThemeUtils.updateThemeColors) {
            window.ThemeUtils.updateThemeColors(theme);
            return;
        }

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

    // Make COLOR_PRESETS available globally for theme.js
    window.COLOR_PRESETS = COLOR_PRESETS;

    // Make COLOR_PRESETS available globally for theme.js
    window.COLOR_PRESETS = COLOR_PRESETS;

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
        if (!app.routines || !app.routines.length) {
            empty.hidden = false;
            list.hidden = true;
            return;
        }
        empty.hidden = true;
        list.hidden = false;

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
            importBtn.className = 'btn btn--secondary js-import-user-routine';
            importBtn.dataset.routineId = routine.id;
            importBtn.innerHTML = '<span style="margin-right: 6px;">📥</span> Importar';
            importBtn.style.minHeight = '44px';
            importBtn.style.padding = '10px 16px';
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

    function renderCreatedRoutinesList() {
        const list = $('#createdRoutinesList');
        const empty = $('#noCreatedRoutinesEmpty');
        if (!list || !empty) return;

        // Clear list to prevent duplicates
        while (list.firstChild) {
            list.removeChild(list.firstChild);
        }

        // Get created routines
        const createdRoutines = [];
        if (app.routines && app.routines.length > 0) {
            app.routines.forEach(routine => {
                createdRoutines.push({
                    id: routine.id,
                    name: routine.name || 'Rutina sin nombre',
                    days: routine.days || [],
                    isTemplate: false
                });
            });
        }

        // Show empty state if no routines
        if (createdRoutines.length === 0) {
            empty.hidden = false;
            list.hidden = true;
            return;
        }

        empty.hidden = true;
        list.hidden = false;

        // Render created routines in 2x2 grid
        createdRoutines.forEach(routine => {
            const item = createRoutineItem(routine, false);
            list.appendChild(item);
        });
    }

    function renderDefaultRoutinesList() {
        const list = $('#defaultRoutinesList');
        if (!list) return;

        // Clear list to prevent duplicates
        while (list.firstChild) {
            list.removeChild(list.firstChild);
        }

        // Get default templates
        const defaultRoutines = [];
        if (typeof templates !== 'undefined' && templates) {
            Object.entries(templates).forEach(([key, days]) => {
                const totalExercises = days.reduce((sum, day) => {
                    const count = Array.isArray(day.ex) ? day.ex.length : 0;
                    return sum + count;
                }, 0);
                defaultRoutines.push({
                    id: `template-${key}`,
                    name: (typeof templateLabels !== 'undefined' && templateLabels[key]) || `Rutina ${key}`,
                    days: days,
                    isTemplate: true,
                    templateKey: key,
                    meta: `${days.length} días · ${totalExercises} ejercicios`
                });
            });
        }

        // Render default routines in 2x2 grid
        defaultRoutines.forEach(routine => {
            const item = createRoutineItem(routine, true);
            list.appendChild(item);
        });
    }

    function createRoutineItem(routine, isTemplate) {
        const item = document.createElement('div');
        item.className = 'routine-item';

        // Different styling for templates vs created routines - compact design
        if (isTemplate) {
            item.style.cssText = 'padding: 8px; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--surface); transition: all 0.2s ease; cursor: pointer; min-height: 100px; display: flex; flex-direction: column;';
        } else {
            item.style.cssText = 'padding: 8px; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--surface); transition: all 0.2s ease; cursor: pointer; min-height: 100px; display: flex; flex-direction: column;';
        }

        item.addEventListener('mouseenter', () => {
            item.style.background = 'var(--surface-2)';
            item.style.borderColor = 'var(--primary)';
            item.style.transform = 'translateY(-2px)';
        });
        item.addEventListener('mouseleave', () => {
            item.style.background = 'var(--surface)';
            item.style.borderColor = 'var(--border)';
            item.style.transform = 'translateY(0)';
        });

        // Icon based on routine type and name
        let icon = '🧩';
        if (isTemplate) {
            const name = routine.name.toLowerCase();
            if (name.includes('3 días') || name.includes('3 dias')) icon = '💪';
            else if (name.includes('4 días') || name.includes('4 dias')) icon = '🔥';
            else if (name.includes('5 días') || name.includes('5 dias')) icon = '🏋️';
            else if (name.includes('ppl') || name.includes('6 días') || name.includes('6 dias')) icon = '⚡';
            else icon = '🔥';
        } else {
            icon = '🧩'; // Puzzle piece for created routines
        }

        // Compact vertical layout for grid - smaller spacing
        const content = document.createElement('div');
        content.style.cssText = 'display: flex; flex-direction: column; align-items: center; text-align: center; gap: 4px; flex: 1; width: 100%;';

        const iconEl = document.createElement('div');
        iconEl.style.cssText = 'font-size: 1.1rem; flex-shrink: 0;';
        iconEl.textContent = icon;
        content.appendChild(iconEl);

        const info = document.createElement('div');
        info.style.cssText = 'width: 100%; flex: 1; min-height: 0;';

        const title = document.createElement('div');
        title.className = 'routine-item-title';
        title.style.cssText = 'font-weight: 600; font-size: 0.9rem; margin-bottom: 2px; color: var(--text); word-wrap: break-word; overflow-wrap: break-word; hyphens: auto; line-height: 1.2;';
        title.textContent = routine.name;
        info.appendChild(title);

        if (routine.meta) {
            const meta = document.createElement('div');
            meta.className = 'routine-item-meta';
            meta.style.cssText = 'font-size: 0.78rem; color: var(--muted); line-height: 1.2; word-wrap: break-word; overflow-wrap: break-word;';
            meta.textContent = routine.meta;
            info.appendChild(meta);
        } else {
            const totalExercises = (routine.days || []).reduce((sum, day) => sum + (day.exercises ? day.exercises.length : 0), 0);
            const meta = document.createElement('div');
            meta.className = 'routine-item-meta';
            meta.style.cssText = 'font-size: 0.78rem; color: var(--muted); line-height: 1.2; word-wrap: break-word; overflow-wrap: break-word;';
            meta.textContent = `${(routine.days || []).length} días · ${totalExercises} ejercicios`;
            info.appendChild(meta);
        }

        content.appendChild(info);

        // Action buttons container - compact design
        const actionsContainer = document.createElement('div');
        actionsContainer.style.cssText = 'width: 100%; display: flex; gap: 3px; margin-top: auto; flex-shrink: 0;';

        if (isTemplate) {
            // Two buttons for templates: Plantilla and Importar
            const useBtn = document.createElement('button');
            useBtn.className = 'btn btn--ghost js-use-template';
            useBtn.style.cssText = 'flex: 1; padding: 6px 3px; min-height: 30px; font-size: 0.7rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;';
            useBtn.textContent = 'Plantilla';
            useBtn.dataset.template = routine.templateKey;
            actionsContainer.appendChild(useBtn);

            const importTemplateBtn = document.createElement('button');
            importTemplateBtn.className = 'btn btn--ghost js-import-template';
            importTemplateBtn.style.cssText = 'flex: 1; padding: 6px 3px; min-height: 30px; font-size: 0.7rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;';
            importTemplateBtn.innerHTML = '<span style="margin-right: 2px;">📥</span><span>Importar</span>';
            importTemplateBtn.dataset.template = routine.templateKey;
            actionsContainer.appendChild(importTemplateBtn);
        } else {
            // Import button
            const importBtn = document.createElement('button');
            importBtn.className = 'btn btn--ghost';
            importBtn.style.cssText = 'flex: 1; padding: 6px 3px; min-height: 30px; font-size: 0.7rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;';
            importBtn.innerHTML = '<span style="margin-right: 2px;">📥</span><span>Importar</span>';
            importBtn.classList.add('js-import-user-routine');
            importBtn.dataset.routineId = routine.id;
            actionsContainer.appendChild(importBtn);

            // Edit button
            const editBtn = document.createElement('button');
            editBtn.className = 'btn btn--ghost js-edit-routine-item';
            editBtn.style.cssText = 'padding: 6px; min-height: 30px; font-size: 0.85rem; min-width: 32px; max-width: 32px; flex-shrink: 0;';
            editBtn.innerHTML = '✏️';
            editBtn.dataset.routineId = routine.id;
            editBtn.title = 'Editar rutina';
            editBtn.setAttribute('aria-label', 'Editar rutina');
            actionsContainer.appendChild(editBtn);

            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn--ghost js-delete-routine-item';
            deleteBtn.style.cssText = 'padding: 6px; min-height: 30px; font-size: 0.85rem; min-width: 32px; max-width: 32px; flex-shrink: 0; color: var(--danger, #ff4444);';
            deleteBtn.innerHTML = '✕';
            deleteBtn.dataset.routineId = routine.id;
            deleteBtn.title = 'Eliminar rutina';
            deleteBtn.setAttribute('aria-label', 'Eliminar rutina');
            actionsContainer.appendChild(deleteBtn);
        }

        content.appendChild(actionsContainer);
        item.appendChild(content);

        // Click handler - removed for created routines (only buttons work now)
        if (isTemplate) {
            item.addEventListener('click', (e) => {
                if (e.target.closest('button')) return; // Don't trigger if clicking button
                if (typeof loadTemplateIntoBuilder === 'function') {
                    loadTemplateIntoBuilder(routine.templateKey);
                    showRoutineBuilder();
                }
            });
        }
        // For created routines, clicking the panel does nothing - only buttons work

        return item;
    }

    function renderRoutines() {
        // Clear all routine containers first to prevent duplicates
        const defaultRoutinesList = $('#defaultRoutinesList');
        const createdRoutinesList = $('#createdRoutinesList');
        const defaultRoutineList = $('#defaultRoutineList');
        const createdRoutineList = $('#createdRoutineList');

        if (defaultRoutinesList) defaultRoutinesList.innerHTML = '';
        if (createdRoutinesList) createdRoutinesList.innerHTML = '';
        if (defaultRoutineList) defaultRoutineList.innerHTML = '';
        if (createdRoutineList) createdRoutineList.innerHTML = '';

        // Render routines
        renderDefaultRoutines();
        renderCreatedRoutines();
        renderImportRoutineList();
        renderCreatedRoutinesList();
        renderDefaultRoutinesList();
        updateRoutineDayTitles();
    }

    function showRoutineBuilder() {
        const builder = $('#routineBuilderCard');
        const btn = $('#btnCreateNewRoutine');
        if (builder) builder.style.display = 'block';
        if (btn) btn.style.display = 'none';
        // Scroll to builder
        if (builder) builder.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function hideRoutineBuilder() {
        const builder = $('#routineBuilderCard');
        const btn = $('#btnCreateNewRoutine');
        if (builder) builder.style.display = 'none';
        if (btn) btn.style.display = 'flex';
        // Reset form
        if (typeof resetRoutineBuilder === 'function') resetRoutineBuilder();
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
        hideRoutineBuilder();
    }

    /* =================== Persistencia =================== */
    // Override save to include clearProgressCache
    const originalSave = window.save;
    window.save = async function () {
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
            'panel-settings': 'navSettings'
        };

        function updateNav(panelId) {
            const navId = panelToNav[panelId];
            if (!navId) return;

            // Update bottom nav buttons (optimized: batch DOM updates)
            const navIds = ['navDiary', 'navStats', 'navRoutines', 'navSettings'];
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
            if (panelId === 'panel-diary') {
                renderSessions();
                renderSummary();
            }
            if (panelId === 'panel-routines') {
                // Only render if panel is visible to prevent duplicate rendering
                const routinesPanel = $('#panel-routines');
                if (routinesPanel && routinesPanel.getAttribute('aria-hidden') === 'false') {
                    renderRoutines();
                }
            }
            if (panelId === 'panel-stats') {
                renderSummary(); // Update weekly summary
                loadModule('./js/modules/stats.js').then(() => {
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
            if (panelId === 'panel-settings') {
                if (typeof showSettingsMain === 'function') showSettingsMain();
            }
        }

        // Bottom nav bindings
        const navBindings = {
            navDiary: 'panel-diary',
            navStats: 'panel-stats',
            navRoutines: 'panel-routines',
            navSettings: 'panel-settings'
        };
        Object.keys(navBindings).forEach(navId => {
            const btn = $(`#${navId}`);
            if (btn) {
                btn.addEventListener('click', () => select(navBindings[navId]));
            }
        });

        // Button to navigate to import panel from routines
        const btnGoToImport = $('#btnGoToImport');
        if (btnGoToImport) {
            btnGoToImport.addEventListener('click', () => {
                select('panel-import');
            });
        }

        // Button to go back from import panel to routines
        const btnBackFromImport = $('#btnBackFromImport');
        if (btnBackFromImport) {
            btnBackFromImport.addEventListener('click', () => {
                select('panel-routines');
            });
        }

        // Button to create new routine
        const btnCreateNewRoutine = $('#btnCreateNewRoutine');
        if (btnCreateNewRoutine) {
            btnCreateNewRoutine.addEventListener('click', () => {
                showRoutineBuilder();
            });
        }

        // Button to cancel routine builder
        const cancelRoutineBuilder = $('#cancelRoutineBuilder');
        if (cancelRoutineBuilder) {
            cancelRoutineBuilder.addEventListener('click', () => {
                hideRoutineBuilder();
            });
        }

        // Button to close routine builder (X button)
        const closeRoutineBuilder = $('#closeRoutineBuilder');
        if (closeRoutineBuilder) {
            closeRoutineBuilder.addEventListener('click', () => {
                hideRoutineBuilder();
            });
        }


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

    /* =================== PERFORMANCE OPTIMIZATION UTILITIES =================== */
    // Throttle function for scroll events
    function throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Debounce function for resize and other events
    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Virtual scrolling manager for exercises and sets
    class VirtualScrollManager {
        constructor(container, itemHeight, buffer = 3) {
            this.container = container;
            this.itemHeight = itemHeight;
            this.buffer = buffer; // Number of items to render outside viewport
            this.visibleStart = 0;
            this.visibleEnd = 0;
            this.totalItems = 0;
            this.items = [];
            this.renderedItems = new Map();
            this.observer = null;
            this.scrollHandler = null;
            this.isInitialized = false;
        }

        init(items, renderFn) {
            this.items = items;
            this.totalItems = items.length;
            this.renderFn = renderFn;

            if (this.totalItems === 0) {
                this.container.innerHTML = '';
                return;
            }

            // Calculate visible range
            this.updateVisibleRange();

            // Render initial visible items
            this.render();

            // Setup scroll listener with throttling
            this.scrollHandler = throttle(() => {
                this.updateVisibleRange();
                this.render();
            }, 16); // ~60fps

            this.container.addEventListener('scroll', this.scrollHandler, { passive: true });

            // Setup IntersectionObserver for better performance
            this.setupObserver();

            this.isInitialized = true;
        }

        updateVisibleRange() {
            const scrollTop = this.container.scrollTop || 0;
            const containerHeight = this.container.clientHeight || this.container.offsetHeight;

            this.visibleStart = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.buffer);
            this.visibleEnd = Math.min(
                this.totalItems - 1,
                Math.ceil((scrollTop + containerHeight) / this.itemHeight) + this.buffer
            );
        }

        render() {
            requestAnimationFrame(() => {
                // Remove items outside visible range
                this.renderedItems.forEach((element, index) => {
                    if (index < this.visibleStart || index > this.visibleEnd) {
                        element.remove();
                        this.renderedItems.delete(index);
                    }
                });

                // Add items in visible range
                for (let i = this.visibleStart; i <= this.visibleEnd; i++) {
                    if (!this.renderedItems.has(i) && this.items[i]) {
                        const element = this.renderFn(this.items[i], i);
                        if (element) {
                            // Use transform to position items efficiently
                            element.style.transform = `translateY(${i * this.itemHeight}px)`;
                            element.style.position = 'absolute';
                            element.style.top = '0';
                            element.style.left = '0';
                            element.style.right = '0';
                            element.style.height = `${this.itemHeight}px`;
                            element.dataset.virtualIndex = i;

                            // Insert in correct position
                            const existing = Array.from(this.container.children);
                            let insertBefore = null;
                            for (const child of existing) {
                                const idx = parseInt(child.dataset.virtualIndex || '999999');
                                if (idx > i) {
                                    insertBefore = child;
                                    break;
                                }
                            }
                            if (insertBefore) {
                                this.container.insertBefore(element, insertBefore);
                            } else {
                                this.container.appendChild(element);
                            }

                            this.renderedItems.set(i, element);
                        }
                    }
                }

                // Update container height for proper scrolling
                this.container.style.height = `${this.totalItems * this.itemHeight}px`;
            });
        }

        setupObserver() {
            if (!window.IntersectionObserver) return;

            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const index = parseInt(entry.target.dataset.virtualIndex);
                        if (!isNaN(index)) {
                            // Ensure item is rendered
                            if (!this.renderedItems.has(index)) {
                                this.updateVisibleRange();
                                this.render();
                            }
                        }
                    }
                });
            }, {
                root: this.container,
                rootMargin: `${this.buffer * this.itemHeight}px`,
                threshold: 0
            });
        }

        destroy() {
            if (this.scrollHandler) {
                this.container.removeEventListener('scroll', this.scrollHandler);
            }
            if (this.observer) {
                this.observer.disconnect();
            }
            this.renderedItems.clear();
            this.isInitialized = false;
        }

        updateItems(newItems) {
            this.items = newItems;
            this.totalItems = newItems.length;
            this.renderedItems.clear();
            this.updateVisibleRange();
            this.render();
        }
    }

    // Cache for virtual scroll managers
    const virtualScrollManagers = new WeakMap();

    // Get or create virtual scroll manager for a container
    function getVirtualScrollManager(container, itemHeight, buffer = 3) {
        if (!virtualScrollManagers.has(container)) {
            const manager = new VirtualScrollManager(container, itemHeight, buffer);
            virtualScrollManagers.set(container, manager);
        }
        return virtualScrollManagers.get(container);
    }

    // Batch update queue for DOM modifications
    const domUpdateQueue = [];
    let domUpdateScheduled = false;

    // Memoization caches
    const sessionRenderCache = new WeakMap();
    const exerciseRenderCache = new WeakMap();

    // Setup global event delegation (once)
    function setupDiaryEventDelegation() {
        const container = $('#sessions');
        if (!container) return;

        // Only set up once to avoid duplicate listeners
        if (diaryEventDelegationSetup) return;
        diaryEventDelegationSetup = true;

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
        const container = $('#sessions');
        const emptyState = $('#emptyState');
        if (!container) return;

        // Setup event delegation for diary inputs (ensure it's set up after container exists)
        setupDiaryEventDelegation();

        // Preserve user's open/closed state of sessions across re-renders
        const prevDetails = Array.from(container.querySelectorAll('details'));
        const prevOpen = new Set();
        prevDetails.forEach(d => {
            if (d.open) {
                // Store both dayKey and sessionId for backward compatibility
                if (d.dataset.dayKey) prevOpen.add(d.dataset.dayKey);
                if (d.dataset.sessionId) prevOpen.add(d.dataset.sessionId);
            }
        });
        const hadPrev = prevDetails.length > 0;

        container.innerHTML = '';

        // Use robust function to check if there are any sessions in the visible week
        const hasSessions = hasSessionsThisWeek();

        // Show "No hay entrenos" message ONLY when there are truly no sessions
        if (!hasSessions) {
            if (emptyState) {
                emptyState.hidden = false;
                emptyState.style.display = '';
            }
            return;
        }

        // Hide empty state completely when there are sessions
        if (emptyState) {
            emptyState.hidden = true;
            emptyState.style.display = 'none';
        }

        // Get and render all sessions for the visible week
        const week = getWeekSessions();

        // Sort sessions: non-completed first, completed at the end
        // Within same completion status, sort ascending by date
        const sortedSessions = [...week].sort((a, b) => {
            const aCompleted = !!a.completed;
            const bCompleted = !!b.completed;
            if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;
            return parseLocalDate(a.date) - parseLocalDate(b.date);
        });

        // Find the first non-completed session (the "current day")
        const firstNonCompletedIndex = sortedSessions.findIndex(s => !s.completed);

        // Render each session as its own day (collapsible <details> element)
        // Use requestAnimationFrame to batch renders for better performance
        sortedSessions.forEach((session, sessionIndex) => {
            const dayKey = toLocalISO(parseLocalDate(session.date));
            const sessionId = session.id;

            const details = document.createElement('details');
            details.className = 'day-panel card';
            // Store dayKey and sessionId so we can restore open state later
            details.dataset.dayKey = dayKey;
            details.dataset.sessionId = sessionId;

            // Restore previous user state if available
            // Otherwise: only open the first non-completed day (current day)
            // If all are completed, all remain closed
            if (hadPrev) {
                details.open = prevOpen.has(dayKey) || prevOpen.has(sessionId);
            } else {
                // Only open if this is the first non-completed session
                details.open = (firstNonCompletedIndex !== -1 && sessionIndex === firstNonCompletedIndex);
            }

            const summary = document.createElement('summary');
            summary.style.display = 'flex';
            summary.style.justifyContent = 'space-between';
            summary.style.alignItems = 'flex-start';
            summary.style.padding = '6px 10px';
            summary.style.cursor = 'pointer';
            summary.style.minHeight = 'auto';

            const left = document.createElement('div');
            left.innerHTML = `<strong style="font-weight:800; font-size: 0.9rem;">${session.name}</strong>`;
            const right = document.createElement('div');
            right.style.display = 'flex';
            right.style.flexDirection = 'column';
            right.style.alignItems = 'flex-end';
            right.style.gap = '2px';
            right.style.color = 'var(--muted)';
            right.style.fontSize = '0.85rem';
            const dateStr = new Date(session.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
            const dateText = document.createElement('div');
            dateText.textContent = dateStr;
            right.appendChild(dateText);
            if (session.completed) {
                left.classList.add('completed');
                const completedText = document.createElement('div');
                completedText.textContent = 'Completada ✓';
                completedText.style.color = 'var(--success, #30D158)';
                completedText.style.fontSize = '0.8rem';
                right.appendChild(completedText);
            }
            summary.appendChild(left);
            summary.appendChild(right);
            details.appendChild(summary);



            // Render the session article (nested inside details)
            const card = $('#tpl-session').content.firstElementChild.cloneNode(true);
            card.dataset.id = session.id;
            card.classList.remove('card', 'pop'); // Avoid double card styling
            card.classList.toggle('completed', !!session.completed);
            // Hide session title when inside details (to avoid duplication with summary)
            const titleEl = card.querySelector('.session__title');
            if (titleEl) {
                titleEl.textContent = session.name;
                titleEl.style.display = 'none';
            }
            card.querySelector('.session__date').textContent = new Date(session.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            const dateEl = card.querySelector('.session__date');
            if (dateEl) {
                dateEl.textContent = '';
                dateEl.style.display = 'none';
            }
            const btnComplete = card.querySelector('.js-complete');
            btnComplete.setAttribute('aria-pressed', String(!!session.completed));
            if (session.completed) {
                const badge = document.createElement('span');
                badge.className = 'badge-done';
                badge.textContent = 'Completada ✓';
                card.querySelector('.session__titlewrap').appendChild(badge);
            }

            const body = card.querySelector('.session__body');
            (session.exercises || []).forEach(ex => body.appendChild(renderExercise(session, ex)));

            // Move the "Añadir ejercicio" button to the end of the session body
            const addExBtn = card.querySelector('.js-add-ex');
            if (addExBtn && body) {
                addExBtn.classList.remove('btn--mobile');
                body.appendChild(addExBtn);
            }

            // Initialize edit UI state
            updateSessionEditUI(session.id);

            details.appendChild(card);
            container.appendChild(details);


        });
    }

    // Optimized renderExercise with deferred set rendering
    function renderExercise(session, ex) {
        const block = $('#tpl-exercise').content.firstElementChild.cloneNode(true);
        block.dataset.exId = ex.id;
        const nameEl = block.querySelector('.exercise__name');
        nameEl.textContent = ex.name;



        // Make name editable on click (inline editing with save/cancel)
        let isEditing = false;
        nameEl.style.cursor = 'pointer';
        nameEl.title = 'Clic para editar';

        const makeEditable = (element) => {
            element.addEventListener('click', function handleClick(e) {
                // Prevent event bubbling if clicking on edit button
                if (e.target.closest('.js-edit-exercise-name')) return;
                if (isEditing) return;
                isEditing = true;
                const originalName = ex.name;
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'input';
                input.value = originalName;
                input.style.width = '100%';
                input.style.maxWidth = '300px';
                input.style.fontSize = 'inherit';
                input.style.fontWeight = 'inherit';
                const parentEl = element.parentElement;
                element.replaceWith(input);
                input.focus();
                input.select();

                // Create confirmation buttons container
                const confirmContainer = document.createElement('div');
                confirmContainer.style.display = 'flex';
                confirmContainer.style.gap = '8px';
                confirmContainer.style.marginTop = '8px';
                confirmContainer.style.alignItems = 'center';

                const saveBtn = document.createElement('button');
                saveBtn.className = 'btn btn--small';
                saveBtn.textContent = '💾 Guardar';
                saveBtn.style.margin = '0';

                const cancelBtn = document.createElement('button');
                cancelBtn.className = 'btn btn--small btn--ghost';
                cancelBtn.textContent = '✕ Cancelar';
                cancelBtn.style.margin = '0';

                confirmContainer.appendChild(saveBtn);
                confirmContainer.appendChild(cancelBtn);

                // Insert confirmation buttons after input
                input.parentElement.insertBefore(confirmContainer, input.nextSibling);

                const cleanup = () => {
                    confirmContainer.remove();
                    isEditing = false;
                };

                const saveChanges = () => {
                    const newName = input.value.trim();
                    if (newName && newName !== originalName) {
                        if (updateExerciseName(session.id, ex.id, newName, originalName)) {
                            // Update the name element with new name
                            const newNameEl = document.createElement('div');
                            newNameEl.className = 'exercise__name';
                            newNameEl.textContent = newName;
                            newNameEl.style.cursor = 'pointer';
                            newNameEl.title = 'Clic para editar';
                            input.replaceWith(newNameEl);
                            makeEditable(newNameEl);
                            cleanup();
                        } else {
                            // If update failed, restore original
                            cancelChanges();
                        }
                    } else {
                        cancelChanges();
                    }
                };

                const cancelChanges = () => {
                    const newNameEl = document.createElement('div');
                    newNameEl.className = 'exercise__name';
                    newNameEl.textContent = originalName;
                    newNameEl.style.cursor = 'pointer';
                    newNameEl.title = 'Clic para editar';
                    input.replaceWith(newNameEl);
                    makeEditable(newNameEl);
                    cleanup();
                };

                saveBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    saveChanges();
                });

                cancelBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    cancelChanges();
                });

                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        saveChanges();
                    } else if (e.key === 'Escape') {
                        e.preventDefault();
                        cancelChanges();
                    }
                });

                // Don't close on blur if clicking on buttons
                input.addEventListener('blur', (e) => {
                    // Delay to allow button clicks to register
                    setTimeout(() => {
                        if (!confirmContainer.contains(document.activeElement) && document.activeElement !== input) {
                            // Only cancel if focus moved outside the edit area
                            if (!confirmContainer.contains(e.relatedTarget)) {
                                cancelChanges();
                            }
                        }
                    }, 200);
                });
            });
        };

        makeEditable(nameEl);

        // Add note button to exercise head
        const headEl = block.querySelector('.exercise__head');
        if (headEl) {
            const noteBtn = document.createElement('button');
            noteBtn.className = 'exercise-note-btn';
            noteBtn.type = 'button';
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
            noteBtn.addEventListener('click', () => openExerciseNoteDialog(session.id, ex.id, ex.name));
            headEl.appendChild(noteBtn);
        }

        // Render mobile cards and desktop table with deferred rendering
        const mobileContainer = block.querySelector('.sets-container');
        const desktopTable = block.querySelector('.sets');
        const sets = ex.sets || [];

        // Use IntersectionObserver to render sets only when exercise is visible
        if (sets.length > 10) {
            // For exercises with many sets, use deferred rendering
            renderSetsDeferred(session, ex, sets, mobileContainer, desktopTable, block);
        } else {
            sets.forEach((set, index) => {
                if (mobileContainer) mobileContainer.appendChild(renderSetCard(session, ex, set));
                if (desktopTable) desktopTable.appendChild(renderSet(session, ex, set));
            });
        }

        // Display exercise note if exists
        const note = getExerciseNote(session.id, ex.id);
        if (note) {
            const noteDisplay = document.createElement('div');
            noteDisplay.className = 'exercise-note-display';
            // Preserve line breaks in note display
            const noteText = escapeHtml(note).replace(/\n/g, '<br>');
            noteDisplay.innerHTML = `
                <div class="exercise-note-text">${noteText}</div>
                <div class="exercise-note-actions">
                    <button class="exercise-note-edit" data-session-id="${session.id}" data-ex-id="${ex.id}" aria-label="Editar nota">✏️</button>
                    <button class="exercise-note-delete" data-session-id="${session.id}" data-ex-id="${ex.id}" aria-label="Eliminar nota">🗑️</button>
                </div>
            `;
            noteDisplay.querySelector('.exercise-note-edit').addEventListener('click', () => openExerciseNoteDialog(session.id, ex.id, ex.name));
            noteDisplay.querySelector('.exercise-note-delete').addEventListener('click', () => {
                saveExerciseNote(session.id, ex.id, '');
                refresh({ preserveTab: true });
            });
            block.appendChild(noteDisplay);
        }

        return block;
    }

    // Deferred rendering for exercises with many sets
    function renderSetsDeferred(session, ex, sets, mobileContainer, desktopTable, exerciseBlock) {
        if (!mobileContainer && !desktopTable) return;

        // Create intersection observer for the exercise block
        if (!window.IntersectionObserver) {
            // Fallback: render all sets immediately
            sets.forEach(set => {
                if (mobileContainer) mobileContainer.appendChild(renderSetCard(session, ex, set));
                if (desktopTable) desktopTable.appendChild(renderSet(session, ex, set));
            });
            requestAnimationFrame(() => {
                exerciseBlock.style.opacity = '1';
                exerciseBlock.style.transform = 'translateY(0)';
            });
            return;
        }

        let hasRendered = false;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasRendered) {
                    hasRendered = true;
                    observer.disconnect();

                    // Render sets in batches using requestAnimationFrame
                    const batchSize = 5;
                    let index = 0;

                    const renderBatch = () => {
                        const end = Math.min(index + batchSize, sets.length);
                        for (let i = index; i < end; i++) {
                            const set = sets[i];
                            if (mobileContainer) {
                                const card = renderSetCard(session, ex, set);
                                card.style.opacity = '0';
                                card.style.transform = 'translateY(5px)';
                                mobileContainer.appendChild(card);
                                requestAnimationFrame(() => {
                                    card.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
                                    card.style.opacity = '1';
                                    card.style.transform = 'translateY(0)';
                                });
                            }
                            if (desktopTable) {
                                desktopTable.appendChild(renderSet(session, ex, set));
                            }
                        }

                        index = end;
                        if (index < sets.length) {
                            requestAnimationFrame(renderBatch);
                        } else {
                            // All sets rendered, fade in exercise block
                            requestAnimationFrame(() => {
                                exerciseBlock.style.opacity = '1';
                                exerciseBlock.style.transform = 'translateY(0)';
                            });
                        }
                    };

                    requestAnimationFrame(renderBatch);
                }
            });
        }, {
            rootMargin: '100px' // Start rendering 100px before visible
        });

        observer.observe(exerciseBlock);

        sets.forEach(set => {
            if (mobileContainer) mobileContainer.appendChild(renderSetCard(session, ex, set));
            if (desktopTable) desktopTable.appendChild(renderSet(session, ex, set));
        });

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

    function renderSet(session, ex, set) {
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

        // Add PR badge
        const progressCell = row.querySelector('.progress');
        if (progressCell) {
            let progressHTML = progressText(session, ex, set);
            if (set.isPR) {
                const prLabel = set.prType === 'weight' ? 'Peso' : set.prType === 'volume' ? 'Volumen' : 'Reps';
                progressHTML += `<span class="pr-badge">🏆 PR ${prLabel}</span>`;
            }
            progressCell.innerHTML = progressHTML;
        }

        // Calculate and display 1RM
        if (set.kg && set.reps) {
            const onerm = calculate1RM(set.kg, set.reps);
            if (onerm) {
                const onermCell = document.createElement('td');
                onermCell.className = 'onerm-display';
                const currentBest = app.onerm[ex.name] || 0;
                const isPR = onerm > currentBest;
                onermCell.innerHTML = `<span class="${isPR ? 'onerm-pr' : 'onerm-value'}">1RM: ${onerm.toFixed(1)} kg</span>`;
                row.appendChild(onermCell);
            }
        }

        return row;
    }

    function renderSetCard(session, ex, set) {
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

        // Add PR badge
        const progressEl = card.querySelector('.set-progress');
        if (progressEl) {
            let progressHTML = progressText(session, ex, set);
            if (set.isPR) {
                const prLabel = set.prType === 'weight' ? 'Peso' : set.prType === 'volume' ? 'Volumen' : 'Reps';
                progressHTML += `<span class="pr-badge pr-badge-set">🏆 PR ${prLabel}</span>`;
            }
            progressEl.innerHTML = progressHTML;
        }

        // Calculate and display 1RM
        if (set.kg && set.reps) {
            const onerm = calculate1RM(set.kg, set.reps);
            if (onerm) {
                const onermDiv = document.createElement('div');
                onermDiv.className = 'onerm-display';
                const currentBest = app.onerm[ex.name] || 0;
                const isPR = onerm > currentBest;
                onermDiv.innerHTML = `<span class="${isPR ? 'onerm-pr' : 'onerm-value'}">1RM: ${onerm.toFixed(1)} kg</span>`;
                card.appendChild(onermDiv);
            }
        }

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
        toast('Entrenamiento copiado correctamente', 'ok');
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
            const body = sessionEl.querySelector('.session__body');
            if (body) {
                body.appendChild(renderExercise(s, newEx));
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
                        tbody.appendChild(renderSet(s, ex, newSet));
                    }
                } else {
                    const container = exEl.querySelector('.sets-container');
                    if (container) {
                        container.appendChild(renderSetCard(s, ex, newSet));
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
        // Use window.debouncedSave if available (from storage.js), otherwise fallback
        if (typeof window.debouncedSave === 'function') {
            window.debouncedSave();
        } else if (typeof save === 'function') {
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

    // buildStats() and buildChartState() are now in stats.js module
    // Removed old implementation to use new redesign

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
        const key = app.tmpTemplateKey || (ev && ev.target && ev.target.dataset && ev.target.dataset.template);
        if (!key) return;
        const arr = templates[key] || [];

        // Get selected week from targetWeek selector (if in import panel) or use visible week
        const targetWeekSelect = $('#targetWeek');
        let targetWeekStart;
        if (targetWeekSelect && targetWeekSelect.value !== '') {
            const offset = +targetWeekSelect.value;
            // Calculate the exact Monday of the target week (forcing 00:00 local time)
            targetWeekStart = startOfWeek(addDays(new Date(), offset * 7));
            targetWeekStart.setHours(0, 0, 0, 0);
        } else {
            // Fallback to visible week if selector not available
            const { ws } = getVisibleWeek();
            targetWeekStart = ws;
        }

        const toAdd = arr.map((it, idx) => ({
            id: uuid(),
            name: it.name,
            date: toLocalISO(addDays(targetWeekStart, idx)),
            completed: false,
            exercises: it.ex.map(n => ({ id: uuid(), name: n, sets: [{ id: uuid(), setNumber: 1, kg: '', reps: '', rir: '' }] }))
        }));
        app.sessions = [...app.sessions, ...toAdd];
        save(); refresh(); $('#templateDialog').close();

        // Format week range for toast message
        const weekEnd = addDays(targetWeekStart, 6);
        const weekRange = `${targetWeekStart.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} – ${weekEnd.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}`;
        toast(`Plantilla «${key}» importada en la semana del ${weekRange}`, 'ok');
    }

    function showRoutineImportWeekDialog(routineId) {
        app.tempRoutineId = routineId;
        const dialog = $('#routineImportWeekDialog');
        const selector = $('#routineImportWeek');
        if (!dialog || !selector) return;

        // Initialize week selector
        selector.innerHTML = '';
        const base = startOfWeek(new Date());
        for (let i = -8; i <= 8; i++) {
            const ws = addDays(base, i * 7), we = addDays(ws, 6);
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = `${ws.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} – ${we.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}`;
            if (i === app.weekOffset) opt.selected = true;
            selector.appendChild(opt);
        }

        dialog.showModal();
    }

    function showTemplateImportWeekDialog(templateKey) {
        app.tempTemplateKey = templateKey;
        const dialog = $('#routineImportWeekDialog');
        const selector = $('#routineImportWeek');
        if (!dialog || !selector) return;

        // Initialize week selector
        selector.innerHTML = '';
        const base = startOfWeek(new Date());
        for (let i = -8; i <= 8; i++) {
            const ws = addDays(base, i * 7), we = addDays(ws, 6);
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = `${ws.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} – ${we.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}`;
            if (i === app.weekOffset) opt.selected = true;
            selector.appendChild(opt);
        }

        dialog.showModal();
    }

    function importRoutineIntoWeek(routineId, weekOffset = null) {
        const routine = app.routines.find(r => r.id === routineId);
        if (!routine) {
            toast('Rutina no encontrada', 'err');
            return;
        }

        // Get selected week from parameter or selector
        let targetWeekStart;
        if (weekOffset !== null) {
            targetWeekStart = startOfWeek(addDays(new Date(), weekOffset * 7));
            targetWeekStart.setHours(0, 0, 0, 0);
        } else {
            // Fallback to visible week
            const { ws } = getVisibleWeek();
            targetWeekStart = ws;
        }

        const days = routine.days || [];
        if (!days.length) {
            toast('La rutina no tiene días definidos', 'warn');
            return;
        }
        const toAdd = days.map((day, idx) => ({
            id: uuid(),
            name: day.name || `Sesión ${idx + 1}`,
            date: toLocalISO(addDays(targetWeekStart, idx)),
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

        // Format week range for toast message
        const weekEnd = addDays(targetWeekStart, 6);
        const weekRange = `${targetWeekStart.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} – ${weekEnd.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}`;
        toast(`Rutina «${routine.name}» importada en la semana del ${weekRange}`, 'ok');
    }

    function importTemplateIntoWeek(templateKey, weekOffset = null) {
        const arr = templates[templateKey] || [];
        if (!arr.length) {
            toast('Plantilla no encontrada', 'err');
            return;
        }

        // Get selected week from parameter
        let targetWeekStart;
        if (weekOffset !== null) {
            targetWeekStart = startOfWeek(addDays(new Date(), weekOffset * 7));
            targetWeekStart.setHours(0, 0, 0, 0);
        } else {
            // Fallback to visible week
            const { ws } = getVisibleWeek();
            targetWeekStart = ws;
        }

        const toAdd = arr.map((it, idx) => ({
            id: uuid(),
            name: it.name,
            date: toLocalISO(addDays(targetWeekStart, idx)),
            completed: false,
            exercises: it.ex.map(n => ({ id: uuid(), name: n, sets: [{ id: uuid(), setNumber: 1, kg: '', reps: '', rir: '' }] }))
        }));
        app.sessions = [...app.sessions, ...toAdd];
        save();
        refresh();

        // Format week range for toast message
        const weekEnd = addDays(targetWeekStart, 6);
        const weekRange = `${targetWeekStart.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} – ${weekEnd.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}`;
        toast(`Plantilla «${templateKey}» importada en la semana del ${weekRange}`, 'ok');
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



    /* =================== Eventos =================== */
    function bindEvents() {


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

        // Event listeners for new default routines list (defaultRoutinesList)
        const defaultRoutinesList = document.getElementById('defaultRoutinesList');
        if (defaultRoutinesList) {
            defaultRoutinesList.addEventListener('click', (ev) => {
                // Handle template button (Plantilla - load into builder to create new routine)
                const templateBtn = ev.target.closest('.js-use-template');
                if (templateBtn) {
                    ev.preventDefault();
                    ev.stopPropagation();
                    const templateKey = templateBtn.dataset.template;
                    if (!templateKey) return;
                    if (typeof loadTemplateIntoBuilder === 'function') {
                        // Reset edit ID to create new routine based on template
                        app.routineEditId = null;
                        loadTemplateIntoBuilder(templateKey);
                        showRoutineBuilder();
                        toast('Plantilla cargada. Puedes personalizarla antes de guardar.', 'ok');
                    }
                    return;
                }

                // Handle import template button (Importar - show week selector)
                const importTemplateBtn = ev.target.closest('.js-import-template');
                if (importTemplateBtn) {
                    ev.preventDefault();
                    ev.stopPropagation();
                    const templateKey = importTemplateBtn.dataset.template;
                    if (!templateKey) return;
                    showTemplateImportWeekDialog(templateKey);
                    return;
                }
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

        // Event listeners for new created routines list (createdRoutinesList)
        const createdRoutinesList = document.getElementById('createdRoutinesList');
        if (createdRoutinesList) {
            createdRoutinesList.addEventListener('click', (ev) => {
                // Handle edit button
                const editBtn = ev.target.closest('.js-edit-routine-item');
                if (editBtn) {
                    ev.preventDefault();
                    ev.stopPropagation();
                    const routineId = editBtn.dataset.routineId;
                    if (!routineId) return;
                    const routine = app.routines.find(r => r.id === routineId);
                    if (!routine) return;
                    loadRoutineIntoBuilder(routine);
                    app.routineEditId = routine.id;
                    showRoutineBuilder();
                    toast('Rutina cargada para editar', 'ok');
                    return;
                }

                // Handle delete button
                const deleteBtn = ev.target.closest('.js-delete-routine-item');
                if (deleteBtn) {
                    ev.preventDefault();
                    ev.stopPropagation();
                    const routineId = deleteBtn.dataset.routineId;
                    if (!routineId) return;
                    app.deleteTarget = { type: 'routine', routineId };
                    showConfirmDialog('¿Eliminar esta rutina personalizada? Esta acción no se puede deshacer.');
                    return;
                }

                // Handle import button (show week selector)
                const importBtn = ev.target.closest('.js-import-user-routine');
                if (importBtn) {
                    ev.preventDefault();
                    ev.stopPropagation();
                    const routineId = importBtn.dataset.routineId;
                    if (!routineId) return;
                    showRoutineImportWeekDialog(routineId);
                    return;
                }

                // Handle template button (Plantilla - load into builder to create new routine)
                const templateBtn = ev.target.closest('.js-use-template');
                if (templateBtn) {
                    ev.preventDefault();
                    ev.stopPropagation();
                    const templateKey = templateBtn.dataset.template;
                    if (!templateKey) return;
                    if (typeof loadTemplateIntoBuilder === 'function') {
                        // Reset edit ID to create new routine based on template
                        app.routineEditId = null;
                        loadTemplateIntoBuilder(templateKey);
                        showRoutineBuilder();
                        toast('Plantilla cargada. Puedes personalizarla antes de guardar.', 'ok');
                    }
                    return;
                }

                // Handle import template button (Importar - show week selector)
                const importTemplateBtn = ev.target.closest('.js-import-template');
                if (importTemplateBtn) {
                    ev.preventDefault();
                    ev.stopPropagation();
                    const templateKey = importTemplateBtn.dataset.template;
                    if (!templateKey) return;
                    showTemplateImportWeekDialog(templateKey);
                    return;
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

        // Limpiar semana
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
                        hideRoutineBuilder();
                    }
                    save();
                    renderRoutines();
                    $('#confirmDialog').close();
                    toast('Rutina eliminada', 'ok');
                    return;
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

        // Routine import week dialog
        const confirmRoutineImportWeek = $('#confirmRoutineImportWeek');
        if (confirmRoutineImportWeek) {
            confirmRoutineImportWeek.addEventListener('click', (e) => {
                e.preventDefault();
                const selector = $('#routineImportWeek');
                if (!selector) return;
                const weekOffset = +selector.value;

                // Check if importing routine or template
                if (app.tempRoutineId) {
                    importRoutineIntoWeek(app.tempRoutineId, weekOffset);
                    app.tempRoutineId = null;
                } else if (app.tempTemplateKey) {
                    importTemplateIntoWeek(app.tempTemplateKey, weekOffset);
                    app.tempTemplateKey = null;
                }

                const dialog = $('#routineImportWeekDialog');
                if (dialog) dialog.close();
            });
        }

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
            renderSummary(); // Update weekly summary
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

        app.profile.firstName = firstName;
        app.profile.lastName = lastName;

        // If no photo is set and no seed exists, generate seed from name
        if (!app.profile.photo && !app.profile.avatarSeed) {
            const nameSeed = (firstName + ' ' + lastName).trim() || 'default';
            app.profile.avatarSeed = nameSeed;
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
    const settingsMain = $('#settingsMain');
    const settingsTheme = $('#settingsTheme');
    const settingsProfile = $('#settingsProfile');
    const settingsInfo = $('#settingsInfo');
    const settingsCreator = $('#settingsCreator');
    const themeDarkBtn = $('#themeDarkBtn');
    const themeLightBtn = $('#themeLightBtn');
    const colorSwatches = $('#colorSwatches');

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
                const creatorPanel = $('#settingsCreator');

                if (themePanel && themePanel.style.display !== 'none') {
                    showSettingsMain();
                } else if (profilePanel && profilePanel.style.display !== 'none') {
                    showSettingsMain();
                } else if (infoPanel && infoPanel.style.display !== 'none') {
                    showSettingsMain();
                } else if (creatorPanel && creatorPanel.style.display !== 'none') {
                    showSettingsMain();
                }
            }
        }, { passive: true });
    }

    const settingsBodyTrack = $('#settingsBodyTrack');

    function showSettingsMain() {
        if (settingsMain) settingsMain.style.display = 'block';
        if (settingsTheme) settingsTheme.style.display = 'none';
        if (settingsProfile) settingsProfile.style.display = 'none';
        if (settingsBodyTrack) settingsBodyTrack.style.display = 'none';
        if (settingsInfo) settingsInfo.style.display = 'none';
        if (settingsCreator) settingsCreator.style.display = 'none';
    }

    function showSettingsTheme() {
        if (settingsMain) settingsMain.style.display = 'none';
        if (settingsTheme) settingsTheme.style.display = 'block';
        if (settingsProfile) settingsProfile.style.display = 'none';
        if (settingsBodyTrack) settingsBodyTrack.style.display = 'none';
        if (settingsInfo) settingsInfo.style.display = 'none';
        if (settingsCreator) settingsCreator.style.display = 'none';
        updateThemeButtons();
        renderColorSwatches();
    }

    function showSettingsProfile() {
        if (settingsMain) settingsMain.style.display = 'none';
        if (settingsTheme) settingsTheme.style.display = 'none';
        if (settingsProfile) settingsProfile.style.display = 'block';
        if (settingsBodyTrack) settingsBodyTrack.style.display = 'none';
        if (settingsInfo) settingsInfo.style.display = 'none';
        if (settingsCreator) settingsCreator.style.display = 'none';
        renderProfile();
    }

    function showSettingsBodyTrack() {
        if (settingsMain) settingsMain.style.display = 'none';
        if (settingsTheme) settingsTheme.style.display = 'none';
        if (settingsProfile) settingsProfile.style.display = 'none';
        if (settingsBodyTrack) settingsBodyTrack.style.display = 'block';
        if (settingsInfo) settingsInfo.style.display = 'none';
        if (settingsCreator) settingsCreator.style.display = 'none';
        renderProfile(); // Load body data
    }

    function showSettingsInfo() {
        if (settingsMain) settingsMain.style.display = 'none';
        if (settingsTheme) settingsTheme.style.display = 'none';
        if (settingsProfile) settingsProfile.style.display = 'none';
        if (settingsBodyTrack) settingsBodyTrack.style.display = 'none';
        if (settingsInfo) settingsInfo.style.display = 'block';
        if (settingsCreator) settingsCreator.style.display = 'none';
    }

    function showSettingsCreator() {
        if (settingsMain) settingsMain.style.display = 'none';
        if (settingsTheme) settingsTheme.style.display = 'none';
        if (settingsProfile) settingsProfile.style.display = 'none';
        if (settingsBodyTrack) settingsBodyTrack.style.display = 'none';
        if (settingsInfo) settingsInfo.style.display = 'none';
        if (settingsCreator) settingsCreator.style.display = 'block';
    }

    // Navigation buttons
    const settingsThemeBtn = $('#settingsThemeBtn');
    const settingsProfileBtn = $('#settingsProfileBtn');
    const settingsBodyTrackBtn = $('#settingsBodyTrackBtn');
    const settingsInfoBtn = $('#settingsInfoBtn');
    const settingsCreatorBtn = $('#settingsCreatorBtn');
    const backFromTheme = $('#backFromTheme');
    const backFromProfile = $('#backFromProfile');
    const backFromBodyTrack = $('#backFromBodyTrack');
    const backFromInfo = $('#backFromInfo');
    const backFromCreator = $('#backFromCreator');

    if (settingsThemeBtn) settingsThemeBtn.addEventListener('click', showSettingsTheme);
    if (settingsProfileBtn) settingsProfileBtn.addEventListener('click', showSettingsProfile);
    if (settingsBodyTrackBtn) settingsBodyTrackBtn.addEventListener('click', showSettingsBodyTrack);
    if (settingsInfoBtn) {
        settingsInfoBtn.addEventListener('click', () => {
            const manualDialog = $('#manualDialog');
            if (manualDialog) manualDialog.showModal();
        });
    }
    if (settingsCreatorBtn) settingsCreatorBtn.addEventListener('click', showSettingsCreator);
    if (backFromTheme) backFromTheme.addEventListener('click', showSettingsMain);
    if (backFromProfile) backFromProfile.addEventListener('click', showSettingsMain);
    if (backFromBodyTrack) backFromBodyTrack.addEventListener('click', showSettingsMain);
    if (backFromInfo) backFromInfo.addEventListener('click', showSettingsMain);
    if (backFromCreator) backFromCreator.addEventListener('click', showSettingsMain);

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

        // Color groups organized by spectrum
        const colorGroups = [
            { name: 'Rojos', colors: ['carmesi', 'rojo', 'rojoClaro', 'rojoOscuro'] },
            { name: 'Naranjas', colors: ['naranjaOscuro', 'naranja', 'coral', 'naranjaClaro'] },
            { name: 'Amarillos', colors: ['amarilloOscuro', 'amarillo', 'lima', 'amarilloClaro'] },
            { name: 'Verdes', colors: ['verdeOscuro', 'verde', 'esmeralda', 'verdeClaro'] },
            { name: 'Turquesas/Cianes', colors: ['teal', 'turquesa', 'cian', 'cianClaro'] },
            { name: 'Azules', colors: ['azulOscuro', 'azul', 'azulClaro', 'azulCielo'] },
            { name: 'Índigos', colors: ['indigo', 'indigoOscuro', 'indigoClaro', 'indigoVibrante'] },
            { name: 'Morados/Violetas', colors: ['moradoOscuro', 'morado', 'violeta', 'moradoClaro'] },
            { name: 'Rosas/Fucsias', colors: ['rosaOscuro', 'rosa', 'fucsia', 'rosaClaro'] },
        ];

        colorGroups.forEach(group => {
            // Create group container
            const groupContainer = document.createElement('div');
            groupContainer.className = 'color-group';
            groupContainer.style.cssText = 'margin-bottom: 20px;';

            // Add group label
            const groupLabel = document.createElement('div');
            groupLabel.className = 'color-group-label';
            groupLabel.textContent = group.name;
            groupLabel.style.cssText = 'font-size: 0.75rem; font-weight: 600; color: var(--muted); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;';
            groupContainer.appendChild(groupLabel);

            // Create swatches container for this group
            const swatchesContainer = document.createElement('div');
            swatchesContainer.className = 'color-swatches-group';
            swatchesContainer.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(44px, 1fr)); gap: 10px;';

            group.colors.forEach(colorKey => {
                if (!COLOR_PRESETS[colorKey]) return; // Skip if color doesn't exist

                const colors = COLOR_PRESETS[colorKey];
                const swatch = document.createElement('button');
                swatch.className = 'color-swatch';
                swatch.setAttribute('aria-label', `Color ${COLOR_NAMES[colorKey] || colorKey}`);
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

                swatchesContainer.appendChild(swatch);
            });

            if (swatchesContainer.children.length > 0) {
                groupContainer.appendChild(swatchesContainer);
                colorSwatches.appendChild(groupContainer);
            }
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
        app.profile.firstName = firstName;
        app.profile.lastName = lastName;
        if (!app.profile.photo && !app.profile.avatarSeed) {
            const nameSeed = (firstName + ' ' + lastName).trim() || 'default';
            app.profile.avatarSeed = nameSeed;
        }
        save();
        renderProfile();
        toast('Perfil actualizado', 'ok');
    }

    function handleBodyTrackSave(e) {
        if (e) e.preventDefault();
        const height = $('#profileHeight')?.value.trim() || '';
        const weight = $('#profileWeight')?.value.trim() || '';
        const bodyFat = $('#profileBodyFat')?.value.trim() || '';
        app.profile.height = height;
        app.profile.weight = weight;
        app.profile.bodyFat = bodyFat;
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
        toast('Datos corporales guardados', 'ok');
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
    const saveBodyTrack = $('#saveBodyTrack');
    if (saveBodyTrack) saveBodyTrack.addEventListener('click', handleBodyTrackSave);
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
