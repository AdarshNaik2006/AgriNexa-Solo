/**
 * AgriNexa-Solo: Authentication & Session Client Helpers
 */

let currentUser = null;

/**
 * Check active session against Flask server
 */
async function checkAuth() {
    try {
        const res = await apiFetch('/auth/me');
        if (res && res.authenticated && res.user) {
            currentUser = res.user;
            updateAuthUI(currentUser);
            return currentUser;
        }
    } catch (e) {
        currentUser = null;
        updateAuthUI(null);
    }
    return null;
}

/**
 * Protect page: redirect to login if session is not active
 */
async function requireAuth() {
    const user = await checkAuth();
    if (!user) {
        const currentPath = window.location.pathname;
        window.location.href = `/login.html?redirect=${encodeURIComponent(currentPath)}`;
        return null;
    }
    return user;
}

/**
 * Redirect to dashboard if already logged in (used on login.html & register.html)
 */
async function redirectIfLoggedIn() {
    const user = await checkAuth();
    if (user) {
        window.location.href = '/dashboard.html';
    }
}

/**
 * Perform logout
 */
async function logout() {
    try {
        await apiFetch('/auth/logout', { method: 'POST' });
        currentUser = null;
        showToast('Logged out successfully.', 'info');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 500);
    } catch (err) {
        showToast('Logout failed: ' + err.message, 'error');
    }
}

/**
 * Dynamically update navigation items based on authentication state
 */
function updateAuthUI(user) {
    const authActions = document.getElementById('nav-auth-actions');
    if (!authActions) return;

    if (user) {
        const displayName = user.full_name ? user.full_name.split(' ')[0] : 'Farmer';
        authActions.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.6rem;">
                <a href="/farmer-profile.html" class="btn btn-secondary btn-sm" style="display: flex; align-items: center; gap: 0.3rem;">
                    <span>👨‍🌾</span>
                    <span>${displayName}</span>
                </a>
                <button onclick="logout()" class="btn btn-danger btn-sm" title="Logout">
                    <span data-i18n="nav_logout">Logout</span>
                </button>
            </div>
        `;
    } else {
        authActions.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <a href="/login.html" class="btn btn-secondary btn-sm" data-i18n="nav_login">Login</a>
                <a href="/register.html" class="btn btn-warning btn-sm" data-i18n="nav_register">Register</a>
            </div>
        `;
    }
    // Re-apply language labels if any
    if (typeof applyTranslations === 'function') {
        applyTranslations();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});
