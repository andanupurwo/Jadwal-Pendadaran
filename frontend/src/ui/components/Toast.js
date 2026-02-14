
// Toast Notification Component
// Replaces standard browser alert() with elegant floating notifications

const style = `
.toast-container {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 999999;
    font-family: 'Inter', system-ui, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    pointer-events: none;
    width: 100%;
    max-width: 420px;
}

.toast {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    width: 100%;
    max-width: 380px;
    padding: 14px 18px;
    border-radius: 50px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.04);
    border: 1px solid rgba(0,0,0,0.08);
    border-left: none; /* Removed colored border for cleaner mobile look */
    font-size: 0.95rem;
    font-weight: 500;
    color: #1f2937;
    pointer-events: auto;
    
    /* Animation start state */
    transform: translateY(-100%);
    transition: all 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28);
    opacity: 0;
    
    display: flex;
    align-items: center;
    justify-content: center; /* Center content */
    gap: 12px;
}

.toast.show {
    transform: translateY(0);
    opacity: 1;
}

.toast.removing {
    transform: translateY(-20px);
    opacity: 0;
}

.toast-success .toast-icon { color: #10B981; }
.toast-error .toast-icon { color: #EF4444; }
.toast-info .toast-icon { color: #3B82F6; }
.toast-warning .toast-icon { color: #F59E0B; }

.toast-icon {
    font-size: 1.1rem;
    display: flex;
    align-items: center;
}
`;

// Inject styles
const styleSheet = document.createElement("style");
styleSheet.innerText = style;
document.head.appendChild(styleSheet);

// Create container
let container = document.querySelector('.toast-container');
if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
}

const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
};

export function showToast(message, type = 'info', duration = 4000) {
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `
        <span class="toast-icon">${icons[type] || ''}</span>
        <span style="line-height:1.4; text-align: left;">${message}</span>
    `;

    container.appendChild(el);

    // Trigger animation
    requestAnimationFrame(() => {
        el.classList.add('show');
    });

    // Auto remove
    setTimeout(() => {
        el.classList.remove('show');
        el.classList.add('removing');
        el.addEventListener('transitionend', () => el.remove());
    }, duration);
}

// Expose to window globally
window.showToast = showToast;
