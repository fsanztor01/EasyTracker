/**
 * UUID Generator
 */

const UUID = (() => {
    const generate = () => {
        return (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') 
            ? crypto.randomUUID()
            : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
    };

    return { generate };
})();

// Make available globally
window.uuid = UUID.generate;

