/**
 * UI Utilities - Reusable UI Functions
 * 
 * This module provides reusable UI components and helper functions
 * for modals, toasts, confirmations, and other UI interactions.
 */

const UIUtils = (() => {

    // ===== MODAL MANAGEMENT =====

    /**
     * Show a modal dialog
     * @param {Object} options - Modal configuration
     * @param {string} options.title - Modal title
     * @param {string} options.content - Modal HTML content
     * @param {Array} options.actions - Array of action buttons
     * @param {Function} options.onClose - Callback when modal closes
     * @returns {HTMLElement} Modal element
     */
    const showModal = ({ title, content, actions = [], onClose = null }) => {
        const container = document.getElementById('modalContainer');

        // Create modal HTML
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-header">
                <h3 class="modal-title">${title}</h3>
                <button class="modal-close" aria-label="Cerrar">×</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            ${actions.length > 0 ? `
                <div class="modal-footer">
                    ${actions.map(action => `
                        <button class="btn ${action.className || 'btn-secondary'}" data-action="${action.id}">
                            ${action.label}
                        </button>
                    `).join('')}
                </div>
            ` : ''}
        `;

        // Clear previous modals and add new one
        container.innerHTML = '';
        container.appendChild(modal);
        container.classList.add('active');

        // Close button handler
        const closeBtn = modal.querySelector('.modal-close');
        const closeModal = () => {
            container.classList.remove('active');
            setTimeout(() => {
                container.innerHTML = '';
            }, 300);
            if (onClose) onClose();
        };

        closeBtn.addEventListener('click', closeModal);

        // Click outside to close
        container.addEventListener('click', (e) => {
            if (e.target === container) closeModal();
        });

        // Action buttons handlers
        actions.forEach(action => {
            const btn = modal.querySelector(`[data-action="${action.id}"]`);
            if (btn && action.handler) {
                btn.addEventListener('click', () => {
                    action.handler();
                    if (action.closeOnClick !== false) closeModal();
                });
            }
        });

        // ESC key to close
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        return modal;
    };

    /**
     * Close the current modal
     */
    const closeModal = () => {
        const container = document.getElementById('modalContainer');
        container.classList.remove('active');
        setTimeout(() => {
            container.innerHTML = '';
        }, 300);
    };

    /**
     * Show a confirmation dialog
     * @param {Object} options - Confirmation options
     * @param {string} options.title - Dialog title
     * @param {string} options.message - Confirmation message
     * @param {string} options.confirmText - Confirm button text
     * @param {string} options.cancelText - Cancel button text
     * @param {Function} options.onConfirm - Callback on confirm
     * @param {Function} options.onCancel - Callback on cancel
     */
    const confirm = ({
        title = 'Confirmar',
        message,
        confirmText = 'Confirmar',
        cancelText = 'Cancelar',
        onConfirm = null,
        onCancel = null
    }) => {
        showModal({
            title,
            content: `<p>${message}</p>`,
            actions: [
                {
                    id: 'cancel',
                    label: cancelText,
                    className: 'btn-secondary',
                    handler: () => {
                        if (onCancel) onCancel();
                    }
                },
                {
                    id: 'confirm',
                    label: confirmText,
                    className: 'btn-primary',
                    handler: () => {
                        if (onConfirm) onConfirm();
                    }
                }
            ]
        });
    };

    // ===== TOAST NOTIFICATIONS =====

    /**
     * Show a toast notification
     * @param {Object} options - Toast options
     * @param {string} options.message - Toast message
     * @param {string} options.type - Toast type ('success', 'error', 'warning', 'info')
     * @param {number} options.duration - Duration in ms (default: 3000)
     */
    const showToast = ({ message, type = 'info', duration = 3000 }) => {
        const container = document.getElementById('toastContainer');

        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message">${message}</span>
        `;

        container.appendChild(toast);

        // Auto remove after duration
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 300ms ease-in-out';
            setTimeout(() => {
                container.removeChild(toast);
            }, 300);
        }, duration);
    };

    // ===== FORM UTILITIES =====

    /**
     * Create a form group element
     * @param {Object} options - Form group options
     * @param {string} options.label - Input label
     * @param {string} options.type - Input type
     * @param {string} options.id - Input ID
     * @param {string} options.value - Input value
     * @param {string} options.placeholder - Input placeholder
     * @param {boolean} options.required - Is required
     * @returns {HTMLElement} Form group element
     */
    const createFormGroup = ({
        label,
        type = 'text',
        id,
        value = '',
        placeholder = '',
        required = false
    }) => {
        const group = document.createElement('div');
        group.className = 'form-group';

        const inputElement = type === 'textarea'
            ? `<textarea class="form-textarea" id="${id}" placeholder="${placeholder}" ${required ? 'required' : ''}>${value}</textarea>`
            : `<input type="${type}" class="form-input" id="${id}" value="${value}" placeholder="${placeholder}" ${required ? 'required' : ''}>`;

        group.innerHTML = `
            <label class="form-label" for="${id}">${label}${required ? ' *' : ''}</label>
            ${inputElement}
        `;

        return group;
    };

    /**
     * Get form data as object
     * @param {HTMLFormElement} form - Form element
     * @returns {Object} Form data
     */
    const getFormData = (form) => {
        const formData = new FormData(form);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        return data;
    };

    /**
     * Validate form inputs
     * @param {HTMLFormElement} form - Form element
     * @returns {boolean} Is valid
     */
    const validateForm = (form) => {
        const inputs = form.querySelectorAll('[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.style.borderColor = 'var(--color-danger)';
                isValid = false;
            } else {
                input.style.borderColor = 'var(--color-border)';
            }
        });

        return isValid;
    };

    // ===== DATE UTILITIES =====

    /**
     * Format date to readable string
     * @param {Date|string} date - Date to format
     * @param {string} format - Format type ('short', 'long', 'time')
     * @returns {string} Formatted date
     */
    const formatDate = (date, format = 'short') => {
        const d = new Date(date);

        const options = {
            short: { year: 'numeric', month: '2-digit', day: '2-digit' },
            long: { year: 'numeric', month: 'long', day: 'numeric' },
            time: { hour: '2-digit', minute: '2-digit' }
        };

        return d.toLocaleDateString('es-ES', options[format] || options.short);
    };

    /**
     * Get relative time string (e.g., "hace 2 horas")
     * @param {Date|string} date - Date to compare
     * @returns {string} Relative time string
     */
    const getRelativeTime = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);

        if (seconds < 60) return 'Ahora mismo';
        if (minutes < 60) return `Hace ${minutes} min`;
        if (hours < 24) return `Hace ${hours}h`;
        if (days < 7) return `Hace ${days}d`;
        if (weeks < 4) return `Hace ${weeks} sem`;
        return `Hace ${months} mes${months > 1 ? 'es' : ''}`;
    };

    /**
     * Get today's date in YYYY-MM-DD format
     * @returns {string} Today's date
     */
    const getTodayString = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    // ===== ANIMATION UTILITIES =====

    /**
     * Animate element with fade in
     * @param {HTMLElement} element - Element to animate
     * @param {number} duration - Animation duration in ms
     */
    const fadeIn = (element, duration = 300) => {
        element.style.opacity = '0';
        element.style.display = 'block';

        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            element.style.opacity = Math.min(progress / duration, 1);

            if (progress < duration) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    };

    /**
     * Animate element with fade out
     * @param {HTMLElement} element - Element to animate
     * @param {number} duration - Animation duration in ms
     * @param {Function} callback - Callback after animation
     */
    const fadeOut = (element, duration = 300, callback = null) => {
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            element.style.opacity = Math.max(1 - (progress / duration), 0);

            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
                if (callback) callback();
            }
        };

        requestAnimationFrame(animate);
    };

    // ===== LOADING STATES =====

    /**
     * Show loading spinner in element
     * @param {HTMLElement} element - Target element
     * @param {string} message - Loading message
     */
    const showLoading = (element, message = 'Cargando...') => {
        element.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⏳</div>
                <div class="empty-state-text">${message}</div>
            </div>
        `;
    };

    /**
     * Show empty state in element
     * @param {HTMLElement} element - Target element
     * @param {string} icon - Empty state icon
     * @param {string} message - Empty state message
     * @param {string} subMessage - Empty state sub-message
     */
    const showEmptyState = (element, icon = '📭', message = 'No hay datos', subMessage = '') => {
        element.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">${icon}</div>
                <div class="empty-state-text">${message}</div>
                ${subMessage ? `<p style="color: var(--color-text-tertiary); margin-top: var(--space-sm);">${subMessage}</p>` : ''}
            </div>
        `;
    };

    // ===== DEBOUNCE & THROTTLE =====

    /**
     * Debounce function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {Function} Debounced function
     */
    const debounce = (func, wait = 300) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    /**
     * Throttle function calls
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in ms
     * @returns {Function} Throttled function
     */
    const throttle = (func, limit = 300) => {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    // Public API
    return {
        // Modals
        showModal,
        closeModal,
        confirm,

        // Toasts
        showToast,

        // Forms
        createFormGroup,
        getFormData,
        validateForm,

        // Dates
        formatDate,
        getRelativeTime,
        getTodayString,

        // Animations
        fadeIn,
        fadeOut,

        // Loading
        showLoading,
        showEmptyState,

        // Performance
        debounce,
        throttle
    };
})();

// Make it available globally
window.UIUtils = UIUtils;
