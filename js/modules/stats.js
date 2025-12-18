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

    // Calculate aggregated metric across ALL exercises for a given period
    function calculateAggregatedMetric(period, metric) {
        const base = startOfWeek();
        const periodSessions = [];
        
        // Get sessions for the specified period
        for (let i = period - 1; i >= 0; i--) {
            const ws = addDays(base, -i * 7);
            const we = addDays(ws, 6);
            const subset = app.sessions.filter(s => {
                const d = parseLocalDate(s.date);
                return d >= ws && d <= we;
            });
            periodSessions.push(...subset);
        }

        let totalVolume = 0;
        let maxWeight = 0;
        let rirSum = 0;
        let rirCount = 0;

        // Aggregate data from ALL exercises in all sessions
        periodSessions.forEach(session => {
            (session.exercises || []).forEach(ex => {
                (ex.sets || []).forEach(set => {
                    const kg = parseFloat(set.kg) || 0;
                    const reps = window.parseReps ? window.parseReps(set.reps) : (parseFloat(set.reps) || 0);
                    const rir = window.parseRIR ? window.parseRIR(set.rir) : (parseFloat(set.rir) || 0);

                    // Volume: sum of all kg * reps
                    if (reps > 0 && kg > 0) {
                        totalVolume += kg * reps;
                    }

                    // Max weight: highest kg across all exercises
                    if (kg > 0) {
                        maxWeight = Math.max(maxWeight, kg);
                    }

                    // Average RIR: sum and count for average calculation
                    if (rir > 0) {
                        rirSum += rir;
                        rirCount++;
                    }
                });
            });
        });

        // Return the requested metric
        if (metric === 'volume') {
            return totalVolume;
        } else if (metric === 'weight') {
            return maxWeight;
        } else if (metric === 'rir') {
            return rirCount > 0 ? (rirSum / rirCount) : 0;
        }

        return 0;
    }

    // Calculate metric per week for the specified period
    function calculateWeeklyMetrics(period, metric) {
        const base = startOfWeek();
        const weeklyData = [];

        // Calculate metric for each week
        for (let i = period - 1; i >= 0; i--) {
            const ws = addDays(base, -i * 7);
            const we = addDays(ws, 6);
            const weekSessions = app.sessions.filter(s => {
                const d = parseLocalDate(s.date);
                return d >= ws && d <= we;
            });

            let weekVolume = 0;
            let weekMaxWeight = 0;
            let weekRirSum = 0;
            let weekRirCount = 0;

            // Aggregate data from ALL exercises in this week's sessions
            weekSessions.forEach(session => {
                (session.exercises || []).forEach(ex => {
                    (ex.sets || []).forEach(set => {
                        const kg = parseFloat(set.kg) || 0;
                        const reps = window.parseReps ? window.parseReps(set.reps) : (parseFloat(set.reps) || 0);
                        const rir = window.parseRIR ? window.parseRIR(set.rir) : (parseFloat(set.rir) || 0);

                        if (reps > 0 && kg > 0) {
                            weekVolume += kg * reps;
                        }

                        if (kg > 0) {
                            weekMaxWeight = Math.max(weekMaxWeight, kg);
                        }

                        if (rir > 0) {
                            weekRirSum += rir;
                            weekRirCount++;
                        }
                    });
                });
            });

            let weekValue = 0;
            if (metric === 'volume') {
                weekValue = weekVolume;
            } else if (metric === 'weight') {
                weekValue = weekMaxWeight;
            } else if (metric === 'rir') {
                weekValue = weekRirCount > 0 ? (weekRirSum / weekRirCount) : 0;
            }

            weeklyData.push({
                weekNumber: period - i,
                value: weekValue
            });
        }

        return weeklyData;
    }

    // Generate fixed color for each week number
    // Week 1 always has color 1, Week 2 always has color 2, etc.
    function getWeekColor(weekNumber) {
        // Fixed color palette - each week number maps to a specific color
        const weekColors = {
            1: '#3b82f6',  // Blue - Semana 1
            2: '#10b981',  // Green - Semana 2
            3: '#f59e0b',  // Amber - Semana 3
            4: '#ef4444',  // Red - Semana 4
            5: '#8b5cf6',  // Purple - Semana 5
            6: '#06b6d4',  // Cyan - Semana 6
            7: '#ec4899',  // Pink - Semana 7
            8: '#84cc16',  // Lime - Semana 8
            9: '#f97316',  // Orange - Semana 9
            10: '#6366f1', // Indigo - Semana 10
            11: '#14b8a6', // Teal - Semana 11
            12: '#a855f7'  // Violet - Semana 12
        };

        // Return the fixed color for this week number, or default to first color if week > 12
        return weekColors[weekNumber] || weekColors[1];
    }

    // Render aggregated circular chart (all exercises combined) with weekly segments
    function renderAggregatedCircularChart(metric, period) {
        const chartContainer = document.getElementById('aggregatedCircularChart');
        if (!chartContainer) return;

        // Calculate aggregated value (total)
        const totalValue = calculateAggregatedMetric(period, metric);

        // Calculate weekly metrics
        const weeklyData = calculateWeeklyMetrics(period, metric);

        // Format display value and label
        let displayValue = '';
        let metricLabel = '';

        if (metric === 'volume') {
            metricLabel = 'Volumen total';
            displayValue = totalValue.toLocaleString('es-ES', { maximumFractionDigits: 0 });
        } else if (metric === 'rir') {
            metricLabel = 'RIR promedio';
            displayValue = totalValue.toFixed(1);
        } else if (metric === 'weight') {
            metricLabel = 'Peso máximo';
            displayValue = totalValue.toLocaleString('es-ES', { maximumFractionDigits: 1 });
        }

        // Chart dimensions
        const size = 200;
        const center = size / 2;
        const radius = 70;
        const circumference = 2 * Math.PI * radius;
        const strokeWidth = 12;
        const bgColor = 'var(--border, rgba(255,255,255,0.1))';

        // Calculate total for percentage calculation
        const total = weeklyData.reduce((sum, week) => sum + week.value, 0);
        
        // Build weekly arcs - each arc starts where the previous one ended
        let accumulatedLength = 0;
        const weeklyArcs = weeklyData.map((week, index) => {
            const percentage = total > 0 ? (week.value / total) * 100 : (100 / period);
            const arcLength = (percentage / 100) * circumference;
            
            // Start offset: where this arc begins (from accumulated length)
            const startOffset = circumference - accumulatedLength;
            // End offset: where this arc ends (after adding its length)
            const endOffset = circumference - (accumulatedLength + arcLength);
            
            const weekColor = getWeekColor(week.weekNumber);
            
            // Update accumulated length for next arc
            accumulatedLength += arcLength;
            
            return {
                weekNumber: week.weekNumber,
                color: weekColor,
                startOffset: startOffset,
                endOffset: endOffset,
                arcLength: arcLength,
                percentage: percentage
            };
        });

        // Format period text
        const periodText = period === 4 ? 'Últimas 4 semanas' : period === 8 ? 'Últimas 8 semanas' : `Últimas ${period} semanas`;

        // Build SVG arcs for each week
        // Each arc uses stroke-dasharray to show only its portion
        const arcsHTML = weeklyArcs.map((arc, index) => {
            // For each arc, we need to show only its portion
            // stroke-dasharray: [visible length, gap length (rest of circle)]
            // stroke-dashoffset: where to start drawing (rotated to the right position)
            const dashArray = `${arc.arcLength} ${circumference - arc.arcLength}`;
            // Set final position directly (no animation)
            const dashOffset = arc.startOffset;
            
            return `
                <circle 
                    class="aggregated-week-arc week-${arc.weekNumber}" 
                    cx="${center}" 
                    cy="${center}" 
                    r="${radius}" 
                    fill="none" 
                    stroke="${arc.color}" 
                    stroke-width="${strokeWidth}"
                    stroke-dasharray="${dashArray}" 
                    stroke-dashoffset="${dashOffset}"
                    stroke-linecap="round"/>
            `;
        }).join('');

        // Create SVG chart
        chartContainer.innerHTML = `
            <div class="aggregated-chart-wrapper" style="position: relative; width: ${size}px; height: ${size}px; margin: 0 auto;">
                <svg class="aggregated-circular-svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform: rotate(-90deg);">
                    <!-- Background circle -->
                    <circle 
                        class="aggregated-circular-bg" 
                        cx="${center}" 
                        cy="${center}" 
                        r="${radius}" 
                        fill="none" 
                        stroke="${bgColor}" 
                        stroke-width="${strokeWidth}"
                        stroke-linecap="round"/>
                    <!-- Weekly arcs -->
                    ${arcsHTML}
                </svg>
                <!-- Center content -->
                <div class="aggregated-chart-center" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; pointer-events: none;">
                    <div class="aggregated-chart-value" style="font-size: 2rem; font-weight: 700; color: var(--text, #ffffff); line-height: 1.2; margin-bottom: 4px;">
                        ${displayValue}
                    </div>
                    <div class="aggregated-chart-label" style="font-size: 0.75rem; color: var(--muted, rgba(255,255,255,0.6)); text-transform: uppercase; letter-spacing: 0.5px;">
                        ${metricLabel}
                    </div>
                </div>
            </div>
            <div class="aggregated-chart-subtitle" style="text-align: center; margin-top: 12px; font-size: 0.85rem; color: var(--muted, rgba(255,255,255,0.6));">
                ${periodText}
            </div>
        `;

        // No animation needed - arcs are rendered in final position
    }

    // Helper function to calculate exercise stats (extracted for reuse)
    function calculateExerciseStats(exerciseName, sessions, metric) {
        let currentStats = { maxKg: 0, totalReps: 0, totalVol: 0, rirSum: 0, rirCount: 0, sessionCount: 0 };

        sessions.forEach(s => {
            const ex = (s.exercises || []).find(e => e.name === exerciseName);
            if (!ex) return;
            currentStats.sessionCount++;
            (ex.sets || []).forEach(st => {
                const kg = parseFloat(st.kg) || 0;
                const reps = window.parseReps ? window.parseReps(st.reps) : (parseFloat(st.reps) || 0);
                const rir = window.parseRIR ? window.parseRIR(st.rir) : (parseFloat(st.rir) || 0);
                
                if (kg > 0) {
                    currentStats.maxKg = Math.max(currentStats.maxKg, kg);
                }
                
                if (reps > 0) {
                    currentStats.totalReps += reps;
                    if (kg > 0) {
                        currentStats.totalVol += kg * reps;
                    }
                }
                
                if (rir > 0) {
                    currentStats.rirSum += rir;
                    currentStats.rirCount++;
                }
            });
        });

        const currentAvgRir = currentStats.rirCount > 0 ? currentStats.rirSum / currentStats.rirCount : 0;
        let currentValue = 0;
        if (metric === 'volume') {
            currentValue = currentStats.totalVol;
        } else if (metric === 'weight') {
            currentValue = currentStats.maxKg;
        } else if (metric === 'rir') {
            currentValue = currentAvgRir;
        }

        return { currentStats, currentAvgRir, currentValue };
    }

    function buildStats() {
        const listContainer = document.getElementById('statsListContainer');
        const chartContainer = document.getElementById('statsChartContainer');
        const exerciseList = document.getElementById('statsExerciseList');
        const circularChart = document.getElementById('statsCircularChart');
        const chartDetails = document.getElementById('statsChartDetails');
        const aggregatedChartContainer = document.getElementById('aggregatedChartContainer');
        const sharedMetric = document.getElementById('sharedMetric');
        const sharedExercise = document.getElementById('sharedExercise');
        const sharedPeriod = document.getElementById('sharedPeriod');

        if (!listContainer || !chartContainer || !exerciseList || !circularChart || !chartDetails) {
            console.warn('Stats containers not found');
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
        const period = sharedPeriod ? parseInt(sharedPeriod.value) : (app.chartState.period || 4);

        // Render aggregated circular chart (always shows all exercises, regardless of filter)
        if (aggregatedChartContainer) {
            if (app.sessions.length === 0) {
                aggregatedChartContainer.style.display = 'none';
            } else {
                aggregatedChartContainer.style.display = 'block';
                renderAggregatedCircularChart(metric, period);
            }
        }

        if (app.sessions.length === 0) {
            listContainer.style.display = 'none';
            chartContainer.style.display = 'none';
            return;
        }

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

        // Calculate stats for each exercise
        const exerciseData = [...allExercises].map(exerciseName => {
            // Get ALL sessions with this exercise (not just current period) for accurate stats
            const allSessionsWithExercise = [...app.sessions]
                .filter(s => {
                    const ex = (s.exercises || []).find(e => e.name === exerciseName);
                    return ex && ex.sets && ex.sets.length > 0;
                })
                .sort((a, b) => new Date(a.date) - new Date(b.date));
            
            // Calculate stats from ALL sessions, not just current period
            const { currentStats, currentAvgRir, currentValue } = calculateExerciseStats(exerciseName, allSessionsWithExercise, metric);
            
            // Calculate progress from first record to last record
            let progressText = 'Sin datos';
            let progressClass = 'progress--same';
            
            if (allSessionsWithExercise.length > 0) {
                // Find first session with actual volume data (skip empty sessions)
                let firstSessionWithData = null;
                let firstVolume = 0;
                for (let i = 0; i < allSessionsWithExercise.length; i++) {
                    const session = allSessionsWithExercise[i];
                    const ex = (session.exercises || []).find(e => e.name === exerciseName);
                    if (ex && ex.sets) {
                        let sessionVolume = 0;
                        ex.sets.forEach(st => {
                            const kg = parseFloat(st.kg) || 0;
                            const reps = parseReps(st.reps);
                            if (reps > 0 && kg > 0) {
                                sessionVolume += kg * reps;
                            }
                        });
                        if (sessionVolume > 0) {
                            firstSessionWithData = session;
                            firstVolume = sessionVolume;
                            break;
                        }
                    }
                }
                
                // Calculate total volume for last session (newest)
                let lastVolume = 0;
                const lastSession = allSessionsWithExercise[allSessionsWithExercise.length - 1];
                const lastEx = (lastSession.exercises || []).find(e => e.name === exerciseName);
                if (lastEx && lastEx.sets) {
                    lastEx.sets.forEach(st => {
                        const kg = parseFloat(st.kg) || 0;
                        const reps = parseReps(st.reps);
                        if (reps > 0 && kg > 0) {
                            lastVolume += kg * reps;
                        }
                    });
                }
                
                // Calculate progress based on volume (primary metric for progress)
                if (firstVolume > 0 && lastVolume > 0) {
                    const diff = ((lastVolume - firstVolume) / firstVolume) * 100;
                    if (Math.abs(diff) < 0.1) {
                        progressText = '0%';
                        progressClass = 'progress--same';
                    } else if (diff > 0) {
                        progressText = `+${diff.toFixed(1)}%`;
                        progressClass = 'progress--up';
                    } else {
                        progressText = `${diff.toFixed(1)}%`;
                        progressClass = 'progress--down';
                    }
                } else if (lastVolume > 0 && firstVolume === 0) {
                    // If no first session with data but last has volume, it's the first record
                    progressText = 'Primer registro';
                    progressClass = 'progress--up';
                } else if (allSessionsWithExercise.length === 1 && lastVolume > 0) {
                    // Only one session with data
                    progressText = 'Primer registro';
                    progressClass = 'progress--up';
                }
            }

            return {
                exerciseName,
                currentStats,
                currentAvgRir,
                currentValue,
                progressText,
                progressClass,
                metric
            };
        });

        // Show/hide containers based on filter
        if (exerciseFilter === 'all') {
            // Show list, hide chart
            listContainer.style.display = 'block';
            chartContainer.style.display = 'none';
            
            // Render vertical list
            renderExerciseList(exerciseData, metric, period);
        } else {
            // When filtering by exercise, show detailed breakdown panel by panel
                chartContainer.style.display = 'none';
                listContainer.style.display = 'block';
            
            const exerciseDataItem = exerciseData.find(e => e.exerciseName === exerciseFilter);
            if (exerciseDataItem && exerciseDataItem.currentStats.sessionCount > 0) {
                // Render single exercise with detailed breakdown (panel by panel)
                renderExerciseDetailedBreakdown(exerciseDataItem, metric, period);
            } else {
                // No data found, show empty state
                exerciseList.innerHTML = '<div class="stats-empty-state">No se encontraron datos para este ejercicio</div>';
            }
        }
    }

    function renderExerciseList(exerciseData, metric, period) {
        const exerciseList = document.getElementById('statsExerciseList');
        if (!exerciseList) return;

        // Sort: exercises with data first, then "Sin datos"
        const withData = exerciseData.filter(e => e.currentValue > 0);
        const withoutData = exerciseData.filter(e => e.currentValue === 0);
        
        // Sort with data by current value (descending)
        withData.sort((a, b) => b.currentValue - a.currentValue);

        if (withData.length === 0 && withoutData.length === 0) {
            exerciseList.innerHTML = '<div class="stats-empty-state">Sin entrenamientos registrados</div>';
            return;
        }

        exerciseList.innerHTML = '';

        // Render exercises with data
        withData.forEach(exercise => {
            const item = document.createElement('div');
            item.className = 'stats-exercise-item';
            
            // Always show: Volumen, Max KG, and Progreso
            const volume = exercise.currentStats.totalVol.toLocaleString();
            const maxKg = exercise.currentStats.maxKg;
            
            // Calculate progress percentage for display
            let progressDisplay = '';
            if (exercise.progressText === 'Sin datos') {
                progressDisplay = '<span class="stats-progress-percentage stats-progress-percentage--none">Sin datos</span>';
            } else if (exercise.progressText === 'Primer registro') {
                progressDisplay = '<span class="stats-progress-percentage stats-progress-percentage--none">Primer registro</span>';
            } else {
                // Mostrar porcentaje con color según mejora/empeora
                const isPositive = exercise.progressClass === 'progress--up';
                const percentageClass = isPositive ? 'stats-progress-percentage--up' : 'stats-progress-percentage--down';
                progressDisplay = `<span class="stats-progress-percentage ${percentageClass}">${exercise.progressText}</span>`;
            }
            
            item.innerHTML = `
                <div class="stats-exercise-header">
                    <div class="stats-exercise-name">${exercise.exerciseName}</div>
                </div>
                <div class="stats-exercise-metrics">
                    <div class="stats-metric-row">
                        <span class="stats-metric-label">Volumen:</span>
                        <span class="stats-metric-value">${volume} kg</span>
                    </div>
                    <div class="stats-metric-row">
                        <span class="stats-metric-label">Max KG:</span>
                        <span class="stats-metric-value">${maxKg} kg</span>
                    </div>
                    <div class="stats-metric-row">
                        <span class="stats-metric-label">Progreso:</span>
                        <span class="stats-metric-value">${progressDisplay}</span>
                    </div>
                </div>
            `;
            
            exerciseList.appendChild(item);
        });

        // Render exercises without data at the bottom
        if (withoutData.length > 0) {
            const noDataSection = document.createElement('div');
            noDataSection.className = 'stats-no-data-section';
            noDataSection.innerHTML = '<div class="stats-no-data-title">Sin datos</div>';
            
            withoutData.forEach(exercise => {
                const item = document.createElement('div');
                item.className = 'stats-exercise-item stats-exercise-item--no-data';
                item.innerHTML = `
                    <div class="stats-exercise-name">${exercise.exerciseName}</div>
                    <div class="stats-exercise-metric stats-exercise-metric--muted">Sin entrenamientos registrados</div>
                `;
                noDataSection.appendChild(item);
            });
            
            exerciseList.appendChild(noDataSection);
        }
    }

    function renderExerciseDetailedBreakdown(exerciseData, metric, period) {
        const exerciseList = document.getElementById('statsExerciseList');
        if (!exerciseList) return;

        exerciseList.innerHTML = '';

        // Create a separate panel for each metric
        const volume = exerciseData.currentStats.totalVol.toLocaleString();
        const maxKg = exerciseData.currentStats.maxKg;
        const totalReps = exerciseData.currentStats.totalReps;
        const avgRir = exerciseData.currentAvgRir > 0 ? exerciseData.currentAvgRir.toFixed(1) : '–';
        const sessionCount = exerciseData.currentStats.sessionCount;

        // Calculate progress percentage for display
        let progressDisplay = '';
        if (exerciseData.progressText === 'Sin datos') {
            progressDisplay = '<span class="stats-progress-percentage stats-progress-percentage--none">Sin datos</span>';
        } else if (exerciseData.progressText === 'Primer registro') {
            progressDisplay = '<span class="stats-progress-percentage stats-progress-percentage--none">Primer registro</span>';
        } else {
            const isPositive = exerciseData.progressClass === 'progress--up';
            const percentageClass = isPositive ? 'stats-progress-percentage--up' : 'stats-progress-percentage--down';
            progressDisplay = `<span class="stats-progress-percentage ${percentageClass}">${exerciseData.progressText}</span>`;
        }

        // Panel 1: Exercise Name (with theme color)
        const namePanel = document.createElement('div');
        namePanel.className = 'stats-exercise-item';
        namePanel.style.cssText = 'margin-bottom: 10px;';
        namePanel.innerHTML = `
            <div class="stats-exercise-header">
                <div class="stats-exercise-name" style="color: var(--primary);">${exerciseData.exerciseName}</div>
            </div>
        `;
        exerciseList.appendChild(namePanel);

        // Panel 2: Progreso (moved to second position)
        const progressPanel = document.createElement('div');
        progressPanel.className = 'stats-exercise-item';
        progressPanel.style.cssText = 'margin-bottom: 10px;';
        progressPanel.innerHTML = `
            <div class="stats-exercise-metrics">
                <div class="stats-metric-row">
                    <span class="stats-metric-label">Progreso:</span>
                    <span class="stats-metric-value">${progressDisplay}</span>
                </div>
            </div>
        `;
        exerciseList.appendChild(progressPanel);

        // Panel 3: Volumen
        const volumePanel = document.createElement('div');
        volumePanel.className = 'stats-exercise-item';
        volumePanel.style.cssText = 'margin-bottom: 10px;';
        volumePanel.innerHTML = `
            <div class="stats-exercise-metrics">
                <div class="stats-metric-row">
                    <span class="stats-metric-label">Volumen:</span>
                    <span class="stats-metric-value">${volume} kg</span>
                </div>
            </div>
        `;
        exerciseList.appendChild(volumePanel);

        // Panel 4: Max KG
        const maxKgPanel = document.createElement('div');
        maxKgPanel.className = 'stats-exercise-item';
        maxKgPanel.style.cssText = 'margin-bottom: 10px;';
        maxKgPanel.innerHTML = `
            <div class="stats-exercise-metrics">
                <div class="stats-metric-row">
                    <span class="stats-metric-label">Max KG:</span>
                    <span class="stats-metric-value">${maxKg} kg</span>
                </div>
            </div>
        `;
        exerciseList.appendChild(maxKgPanel);

        // Panel 5: Total Reps
        const repsPanel = document.createElement('div');
        repsPanel.className = 'stats-exercise-item';
        repsPanel.style.cssText = 'margin-bottom: 10px;';
        repsPanel.innerHTML = `
            <div class="stats-exercise-metrics">
                <div class="stats-metric-row">
                    <span class="stats-metric-label">Total reps:</span>
                    <span class="stats-metric-value">${totalReps}</span>
                </div>
            </div>
        `;
        exerciseList.appendChild(repsPanel);

        // Panel 6: RIR promedio
        const rirPanel = document.createElement('div');
        rirPanel.className = 'stats-exercise-item';
        rirPanel.style.cssText = 'margin-bottom: 10px;';
        rirPanel.innerHTML = `
            <div class="stats-exercise-metrics">
                <div class="stats-metric-row">
                    <span class="stats-metric-label">RIR promedio:</span>
                    <span class="stats-metric-value">${avgRir}</span>
                </div>
            </div>
        `;
        exerciseList.appendChild(rirPanel);

        // Panel 7: Sesiones
        const sessionsPanel = document.createElement('div');
        sessionsPanel.className = 'stats-exercise-item';
        sessionsPanel.style.cssText = 'margin-bottom: 10px;';
        sessionsPanel.innerHTML = `
            <div class="stats-exercise-metrics">
                <div class="stats-metric-row">
                    <span class="stats-metric-label">Sesiones:</span>
                    <span class="stats-metric-value">${sessionCount}</span>
                </div>
            </div>
        `;
        exerciseList.appendChild(sessionsPanel);
    }

    function renderCircularChart(exerciseData, metric, period) {
        const circularChart = document.getElementById('statsCircularChart');
        const chartDetails = document.getElementById('statsChartDetails');
        if (!circularChart || !chartDetails) return;

        // Get containers
        const chartContainer = document.getElementById('statsChartContainer');
        const listContainer = document.getElementById('statsListContainer');
        const exerciseList = document.getElementById('statsExerciseList');
        
        // Don't show chart if progress is 0% or no data
        if (exerciseData.progressText === '0%' || exerciseData.progressText === 'Sin datos' || exerciseData.currentStats.sessionCount === 0) {
            if (chartContainer) chartContainer.style.display = 'none';
            if (listContainer) listContainer.style.display = 'block';
            if (exerciseList) {
                exerciseList.innerHTML = '<div class="stats-empty-state">No se encontraron datos para este ejercicio</div>';
            }
            return;
        }

        // Calculate progress percentage from progressText
        let progressPercent = 0;
        if (exerciseData.progressText && exerciseData.progressText !== 'Primer registro' && exerciseData.progressText !== 'Sin datos') {
            const match = exerciseData.progressText.match(/[+-]?(\d+\.?\d*)/);
            if (match) {
                progressPercent = parseFloat(match[0]);
            }
        } else if (exerciseData.progressText === 'Primer registro') {
            progressPercent = 100;
        }

        // Normalize to 0-100 for display
        const displayPercent = Math.min(Math.abs(progressPercent), 100);
        const circumference = 2 * Math.PI * 45; // radius = 45
        const offset = circumference - (displayPercent / 100) * circumference;

        // Format period text
        const periodText = period === 4 ? 'Últimas 4 semanas' : period === 8 ? 'Últimas 8 semanas' : `Últimas ${period} semanas`;

        // Chart color based on progress
        const chartColor = progressPercent >= 0 ? 'var(--success, #4caf50)' : 'var(--danger, #ff4444)';

        circularChart.innerHTML = `
            <div class="stats-chart-wrapper">
                <svg class="stats-circular-svg" viewBox="0 0 100 100">
                    <circle class="stats-circular-bg" cx="50" cy="50" r="45" fill="none" stroke="var(--border, rgba(255,255,255,0.1))" stroke-width="8"/>
                    <circle class="stats-circular-progress" cx="50" cy="50" r="45" fill="none" stroke="${chartColor}" stroke-width="8" 
                        stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}" 
                        stroke-linecap="round" transform="rotate(-90 50 50)"/>
                </svg>
                <div class="stats-chart-center">
                    <div class="stats-chart-percentage">${displayPercent.toFixed(0)}%</div>
                    <div class="stats-chart-label">${exerciseData.progressText === 'Primer registro' ? 'Nuevo' : exerciseData.progressText}</div>
                </div>
            </div>
            <div class="stats-chart-title">${exerciseData.exerciseName}</div>
            <div class="stats-chart-subtitle">Progreso desde el primer registro</div>
        `;

        // Animate the chart
        requestAnimationFrame(() => {
            const progressCircle = circularChart.querySelector('.stats-circular-progress');
            if (progressCircle) {
                progressCircle.style.transition = 'stroke-dashoffset 1s ease-out';
                progressCircle.style.strokeDashoffset = offset;
            }
        });

        // Details - Remove duplicate volume, show all stats
        chartDetails.innerHTML = `
            <div class="stats-detail-item">
                <div class="stats-detail-label">Sesiones</div>
                <div class="stats-detail-value">${exerciseData.currentStats.sessionCount}</div>
            </div>
            <div class="stats-detail-item">
                <div class="stats-detail-label">KG máximo</div>
                <div class="stats-detail-value">${exerciseData.currentStats.maxKg} kg</div>
            </div>
            <div class="stats-detail-item">
                <div class="stats-detail-label">Total reps</div>
                <div class="stats-detail-value">${exerciseData.currentStats.totalReps}</div>
            </div>
            <div class="stats-detail-item">
                <div class="stats-detail-label">Volumen total</div>
                <div class="stats-detail-value">${exerciseData.currentStats.totalVol.toLocaleString()} kg</div>
            </div>
            <div class="stats-detail-item">
                <div class="stats-detail-label">RIR promedio</div>
                <div class="stats-detail-value">${exerciseData.currentAvgRir > 0 ? exerciseData.currentAvgRir.toFixed(1) : '–'}</div>
            </div>
        `;
    }

    function buildChartState() {
        // Initialize chartState if it doesn't exist
        if (!app.chartState) {
            app.chartState = { period: 4, exercise: 'all', metric: 'volume' };
        }

        // Shared filters (used by both chart and stats)
        const sharedMetric = document.getElementById('sharedMetric');
        const sharedExercise = document.getElementById('sharedExercise');
        const sharedPeriod = document.getElementById('sharedPeriod');

        // Initialize shared filters with current state
        if (sharedMetric) {
            sharedMetric.value = app.chartState.metric || 'volume';
            sharedMetric.onchange = () => {
                app.chartState.metric = sharedMetric.value;
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

            const suggestionsDiv = document.getElementById('exerciseSuggestions');
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
            sharedPeriod.value = String(app.chartState.period || 4);
            sharedPeriod.onchange = () => {
                app.chartState.period = +sharedPeriod.value;
                buildStats();
            };
        }

        // Week info button
        const weekInfoBtn = document.getElementById('weekInfoBtn');
        if (weekInfoBtn) {
            weekInfoBtn.addEventListener('click', () => {
                showWeekInfoDialog();
            });
        }
    }

    // Show week information dialog
    function showWeekInfoDialog() {
        const dialog = document.getElementById('weekInfoDialog');
        const content = document.getElementById('weekInfoContent');
        if (!dialog || !content) return;

        // Get current period and metric
        const sharedPeriod = document.getElementById('sharedPeriod');
        const sharedMetric = document.getElementById('sharedMetric');
        const period = sharedPeriod ? parseInt(sharedPeriod.value) : 4;
        const metric = sharedMetric ? sharedMetric.value : 'volume';

        // Calculate weekly metrics
        const weeklyData = calculateWeeklyMetrics(period, metric);

        // Build content HTML
        let contentHTML = '<div style="display: flex; flex-direction: column; gap: 12px;">';
        
        weeklyData.forEach((week, index) => {
            const weekColor = getWeekColor(week.weekNumber);
            let displayValue = '';
            let metricLabel = '';
            
            if (metric === 'volume') {
                metricLabel = 'Volumen total';
                displayValue = week.value.toLocaleString('es-ES', { maximumFractionDigits: 0 }) + ' kg';
            } else if (metric === 'rir') {
                metricLabel = 'RIR promedio';
                displayValue = week.value.toFixed(1);
            } else if (metric === 'weight') {
                metricLabel = 'Peso máximo';
                displayValue = week.value.toLocaleString('es-ES', { maximumFractionDigits: 1 }) + ' kg';
            }

            contentHTML += `
                <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--card-bg, rgba(255,255,255,0.05)); border-radius: 8px; border-left: 4px solid ${weekColor};">
                    <div style="width: 24px; height: 24px; border-radius: 50%; background: ${weekColor}; flex-shrink: 0;"></div>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: var(--text, #ffffff); margin-bottom: 4px;">Semana ${week.weekNumber}</div>
                        <div style="font-size: 0.9rem; color: var(--muted, rgba(255,255,255,0.6));">${metricLabel}: ${displayValue}</div>
                    </div>
                </div>
            `;
        });

        contentHTML += '</div>';
        content.innerHTML = contentHTML;

        // Show dialog
        dialog.showModal();
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



// Make functions available globally
window.getExerciseStatsForPeriod = getExerciseStatsForPeriod;
window.getCurrentWeekStats = getCurrentWeekStats;
window.archiveCurrentCycle = archiveCurrentCycle;
window.resumeArchivedCycle = resumeArchivedCycle;
window.renderArchivedCycles = renderArchivedCycles;
window.buildStats = buildStats;
window.buildChartState = buildChartState;
window.weeklyData = weeklyData;
