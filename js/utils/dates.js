/**
 * Date Utilities
 */

const DateUtils = (() => {
    function startOfWeek(d = new Date()) {
        // Lunes = 1
        const x = new Date(d);
        let day = x.getDay();
        if (day === 0) day = 7;
        x.setHours(0, 0, 0, 0);
        x.setDate(x.getDate() - (day - 1));
        return x;
    }

    function addDays(d, n) {
        const x = new Date(d);
        x.setDate(x.getDate() + n);
        return x;
    }

    // Devuelve YYYY-MM-DD usando calendario local (sin toISOString)
    function toLocalISO(d) {
        const x = new Date(d);
        const y = x.getFullYear();
        const m = String(x.getMonth() + 1).padStart(2, '0');
        const dd = String(x.getDate()).padStart(2, '0');
        return `${y}-${m}-${dd}`;
    }

    // Parsea 'YYYY-MM-DD' como fecha LOCAL (mediodía para evitar bordes TZ)
    function parseLocalDate(s) {
        const [y, m, d] = s.split('-').map(Number);
        return new Date(y, m - 1, d, 12, 0, 0, 0);
    }

    return {
        startOfWeek,
        addDays,
        toLocalISO,
        parseLocalDate
    };
})();

// Make available globally
window.startOfWeek = DateUtils.startOfWeek;
window.addDays = DateUtils.addDays;
window.toLocalISO = DateUtils.toLocalISO;
window.parseLocalDate = DateUtils.parseLocalDate;

