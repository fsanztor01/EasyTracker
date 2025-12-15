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

// Make functions available globally
window.safeAlert = safeAlert;
window.clearAlert = clearAlert;
window.handleFile = handleFile;
window.normalizeSessionFromImport = normalizeSessionFromImport;
window.applyImport = applyImport;
window.exportSessions = exportSessions;
window.exportRoutines = exportRoutines;
window.clearRoutineAlert = clearRoutineAlert;
window.safeRoutineAlert = safeRoutineAlert;
window.handleRoutineFile = handleRoutineFile;
window.applyRoutineImport = applyRoutineImport;
window.cancelRoutineImport = cancelRoutineImport;
window.initWeekSelector = initWeekSelector;