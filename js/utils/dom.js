/**
 * DOM Utilities
 * Optimized DOM queries and helpers
 */

const DomUtils = (() => {
    // Optimized DOM queries - cache frequently accessed elements
    const domCache = new Map();
    
    const $ = (s, c = document) => {
        // Don't cache if context is not document (dynamic queries)
        if (c !== document) return c.querySelector(s);
        const key = s;
        if (!domCache.has(key)) {
            const el = document.querySelector(s);
            if (el) domCache.set(key, el);
            return el;
        }
        const cached = domCache.get(key);
        // Verify element still exists
        if (cached && document.contains(cached)) {
            return cached;
        }
        // Element removed, clear cache
        domCache.delete(key);
        return null;
    };
    
    const $$ = (s, c = document) => [...c.querySelectorAll(s)];

    // Clear cache when DOM changes significantly
    const clearDomCache = () => {
        domCache.clear();
    };

    const HTML_ESCAPE = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };

    function escapeHtml(str = '') {
        return str.replace(/[&<>"']/g, ch => HTML_ESCAPE[ch] || ch);
    }

    return {
        $,
        $$,
        clearDomCache,
        escapeHtml
    };
})();

// Make available globally
window.$ = DomUtils.$;
window.$$ = DomUtils.$$;
window.clearDomCache = DomUtils.clearDomCache;
window.escapeHtml = DomUtils.escapeHtml;

