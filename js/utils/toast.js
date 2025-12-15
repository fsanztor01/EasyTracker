/**
 * Toast Notifications
 */

const ToastUtils = (() => {
    function toast(msg, type = 'ok') {
        const container = $('#toasts');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.textContent = msg;

        container.appendChild(toast);

        // Auto remove after delay
        setTimeout(() => {
            toast.classList.add('toast--hide');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, type === 'err' ? 5000 : 3000);
    }

    return { toast };
})();

// Make available globally
window.toast = ToastUtils.toast;

