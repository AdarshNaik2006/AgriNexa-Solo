/**
 * AgriNexa-Solo: Centralized API Client and Global Utilities
 */
const API_BASE = '/api';

/**
 * Perform authenticated REST API fetch requests with standard error handling.
 */
async function apiFetch(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    const config = {
        ...options,
        credentials: 'include', // Ensure session cookies are sent
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json().catch(() => null);

        if (!response.ok) {
            let errorMsg = 'An error occurred. Please try again.';
            if (data && data.message) {
                errorMsg = data.message;
            } else if (data && data.error) {
                errorMsg = data.error;
            } else if (response.status === 401) {
                errorMsg = 'Session expired or login required.';
            } else if (response.status === 403) {
                errorMsg = 'Access denied: You do not have permission for this action.';
            } else if (response.status === 404) {
                errorMsg = 'Requested resource not found.';
            } else if (response.status === 503 || response.status === 504) {
                errorMsg = 'Service temporarily unavailable. Please check your network.';
            }

            const error = new Error(errorMsg);
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data;
    } catch (err) {
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
            const networkError = new Error('Network connection error. Server is unreachable.');
            networkError.status = 0;
            throw networkError;
        }
        throw err;
    }
}

/**
 * Toast Notification System
 */
function showToast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';
    if (type === 'warning') icon = '🔔';

    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span>${icon}</span>
            <span>${message}</span>
        </div>
        <button style="background: none; border: none; color: white; cursor: pointer; font-size: 1.1rem; margin-left: 0.5rem;" onclick="this.parentElement.remove()">✕</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }
    }, duration);
}

/**
 * Modal dialog helpers
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

// Close modal when clicking backdrop
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
        e.target.classList.remove('show');
    }
});
