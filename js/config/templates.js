/**
 * Routine Templates
 */

const Templates = (() => {
    const templates = {
        '5day': [
            { name: 'Día 1 - Torso (Push)', ex: ['Press banca', 'Press inclinado mancuernas', 'Fondos en paralelas', 'Extensiones tríceps'] },
            { name: 'Día 2 - Pierna', ex: ['Sentadilla con barra', 'Prensa de piernas', 'Zancadas', 'Curl femoral tumbado'] },
            { name: 'Día 3 - Torso (Pull)', ex: ['Dominadas', 'Remo con barra', 'Remo en máquina', 'Curl bíceps con barra'] },
            { name: 'Día 4 - Torso (Upper)', ex: ['Press militar', 'Press banca', 'Remo con barra', 'Elevaciones laterales'] },
            { name: 'Día 5 - Pierna', ex: ['Peso muerto rumano', 'Sentadilla búlgara', 'Gémeos', 'Elevación de talones'] },
        ],
        '3day': [
            { name: 'Día 1 - Full Body A', ex: ['Sentadilla con barra', 'Press banca', 'Remo con barra', 'Press militar', 'Curl bíceps'] },
            { name: 'Día 2 - Full Body B', ex: ['Peso muerto', 'Press inclinado', 'Dominadas', 'Zancadas', 'Extensiones tríceps'] },
            { name: 'Día 3 - Full Body C', ex: ['Prensa de piernas', 'Fondos en paralelas', 'Remo en máquina', 'Elevaciones laterales', 'Curl femoral'] },
        ],
        '4day': [
            { name: 'Día 1 - Upper', ex: ['Press banca', 'Press inclinado', 'Remo con barra', 'Dominadas', 'Press militar'] },
            { name: 'Día 2 - Lower', ex: ['Sentadilla con barra', 'Peso muerto rumano', 'Prensa de piernas', 'Zancadas', 'Gémeos'] },
            { name: 'Día 3 - Upper', ex: ['Press banca', 'Fondos en paralelas', 'Remo mancuernas', 'Jalón al pecho', 'Curl bíceps'] },
            { name: 'Día 4 - Lower', ex: ['Sentadilla frontal', 'Peso muerto', 'Curl femoral', 'Elevación de talones', 'Abducciones'] },
        ],
        'ppl': [
            { name: 'Día 1 - Push', ex: ['Press banca', 'Press inclinado', 'Press militar', 'Fondos en paralelas', 'Extensiones tríceps'] },
            { name: 'Día 2 - Pull', ex: ['Dominadas', 'Remo con barra', 'Jalón al pecho', 'Remo en máquina', 'Curl bíceps'] },
            { name: 'Día 3 - Legs', ex: ['Sentadilla con barra', 'Peso muerto rumano', 'Prensa de piernas', 'Zancadas', 'Gémeos'] },
            { name: 'Día 4 - Push', ex: ['Press banca', 'Press inclinado mancuernas', 'Press militar mancuernas', 'Aperturas', 'Elevaciones laterales'] },
            { name: 'Día 5 - Pull', ex: ['Dominadas', 'Remo mancuernas', 'Face pulls', 'Curl martillo', 'Curl concentrado'] },
            { name: 'Día 6 - Legs', ex: ['Sentadilla frontal', 'Peso muerto', 'Curl femoral', 'Elevación de talones', 'Abdominales'] },
        ],
    };

    const templateLabels = {
        '5day': 'Rutina 5 días',
        '3day': 'Rutina 3 días',
        '4day': 'Rutina 4 días',
        'ppl': 'Rutina PPL 6 días'
    };

    return {
        templates,
        templateLabels
    };
})();

// Make available globally
window.templates = Templates.templates;
window.templateLabels = Templates.templateLabels;

