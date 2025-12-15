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

// Make functions available globally
window.getExerciseStatsForPeriod = getExerciseStatsForPeriod;
window.getCurrentWeekStats = getCurrentWeekStats;
window.archiveCurrentCycle = archiveCurrentCycle;
window.resumeArchivedCycle = resumeArchivedCycle;
window.renderArchivedCycles = renderArchivedCycles;
window.buildStats = buildStats;
window.buildChartState = buildChartState;
window.resizeCanvas = resizeCanvas;
window.weeklyData = weeklyData;
window.drawChart = drawChart;
window.drawBarChart = drawBarChart;
window.drawPieChart = drawPieChart;
window.adjustColorOpacity = adjustColorOpacity;
