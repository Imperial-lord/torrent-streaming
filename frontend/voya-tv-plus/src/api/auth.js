const API = (import.meta.env.VITE_API_BASE || 'http://localhost:8081').replace(/\/+$/, '');

let accessToken = null; // short-lived access token (in-memory)
const REFRESH_KEY = 'refreshToken'; // tab-scoped
const getRefresh = () => sessionStorage.getItem(REFRESH_KEY);
const setRefresh = (v) => (v ? sessionStorage.setItem(REFRESH_KEY, v) : sessionStorage.removeItem(REFRESH_KEY));

function setAccess(token) {
    accessToken = token || null;
}

// --- basic JSON helpers ---
async function postJson(path, body) {
    const res = await fetch(`${API}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(body || {}),
        credentials: 'omit',
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
}

async function refreshAccess() {
    const rt = getRefresh();
    if (!rt) throw new Error('No refresh token');
    const data = await postJson('/auth/refresh', { refreshToken: rt });
    setAccess(data.accessToken);
    return data.accessToken;
}

// --- public API ---
export async function login(username, password) {
    const data = await postJson('/auth/login', { username, password });
    setAccess(data.accessToken);
    setRefresh(data.refreshToken);
    return {
        username: data.username,
        roles: (data.roles || []).map((r) => (typeof r === 'string' ? r : r.authority)),
    };
}

export function logout() {
    setAccess(null);
    setRefresh(null);
}

export function authHeader() {
    return accessToken ? `Bearer ${accessToken}` : null;
}

/**
 * Auth-aware fetch for JSON/file endpoints.
 * On 403, we refresh once and retry.
 */
export async function apiFetch(path, init = {}) {
    const tryOnce = async () => {
        const headers = new Headers(init.headers || {});
        if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
        headers.set('Accept', headers.get('Accept') || 'application/json');
        return fetch(`${API}${path}`, { ...init, headers, credentials: 'omit' });
    };

    let res = await tryOnce();
    if (res.status === 403 && getRefresh()) {
        try {
            await refreshAccess();
            res = await tryOnce();
        } catch (e) {
            logout();
            throw e;
        }
    }
    return res;
}

export function apiBase() {
    return API;
}

export function hasSession() {
    return !!sessionStorage.getItem('refreshToken');
}