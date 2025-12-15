/**
 * Calculation Utilities
 * Parse reps, RIR, calculate 1RM, etc.
 */

const CalculationUtils = (() => {
    const parseReps = s => {
        if (!s) return 0;
        if (s.includes('+')) {
            return (+(s.split('+')[0]) + +(s.split('+')[1] || 0));
        }
        if (s.includes('-')) {
            return ((+s.split('-')[0] + +s.split('-')[1]) / 2);
        }
        return +s || 0;
    };

    const parseRIR = s => {
        if (!s) return 0;
        if (s.includes('/')) {
            return ((+s.split('/')[0] + +s.split('/')[1]) / 2);
        }
        return +s || 0;
    };

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

    return {
        parseReps,
        parseRIR,
        calculate1RM
    };
})();

// Make available globally
window.parseReps = CalculationUtils.parseReps;
window.parseRIR = CalculationUtils.parseRIR;
window.calculate1RM = CalculationUtils.calculate1RM;

