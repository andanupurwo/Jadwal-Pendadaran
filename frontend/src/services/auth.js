// Authentication Module
import { showConfirm } from '../ui/components/ConfirmationModal.js';
import { authAPI } from './api.js';

// Helper: Check JWT token expiry
function isTokenExpired(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return true;

        const payload = JSON.parse(atob(parts[1]));
        if (!payload.exp) return false; // No expiry = valid
        
        const expiryTime = payload.exp * 1000; // Convert to milliseconds
        return Date.now() > expiryTime;
    } catch (err) {
        console.error('Token parse error:', err);
        return true; // If error, consider expired
    }
}

export function isAuthenticated() {
    const token = localStorage.getItem('token');
    
    // Check if token exists and is not expired
    if (!token) return false;
    if (isTokenExpired(token)) {
        // Token expired, remove it
        logout();
        return false;
    }
    
    return true;
}

export async function login(username, password) {
    try {
        const response = await authAPI.login(username, password);
        if (response.success) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            localStorage.setItem('login_time', new Date().toISOString());
            return { success: true };
        }
        return { success: false, error: response.error };
    } catch (error) {
        console.error('Login failed', error);
        return { success: false, error: error.message || 'Gagal terhubung ke server' };
    }
}

export function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('login_time');
    // localStorage.removeItem('isAuthenticated'); // Cleanup old key if exists
}

export async function handleLogin(e) {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.textContent = 'Memuat...';
    submitBtn.disabled = true;

    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');

    const result = await login(username, password);

    if (result.success) {
        window.showToast('Login berhasil!', 'success');
        setTimeout(() => window.location.reload(), 500);
    } else {
        window.showToast(result.error || 'Username atau password salah!', 'error');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

export async function handleLogout() {
    if (await showConfirm('Keluar dari aplikasi?', 'Konfirmasi Logout', { text: 'Keluar', variant: 'danger' })) {
        logout();
        window.location.reload();
    }
}

// Expose to window
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
