const API_URL = '/api';

interface FetchOptions extends RequestInit {
    token?: string;
}

// Helper to get/set auth store without importing zustand directly (avoids circular deps)
function getAuthStore() {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem('smoke-essentials-auth');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed?.state || null;
    } catch {
        return null;
    }
}

function setAuthStore(accessToken: string, refreshToken: string) {
    if (typeof window === 'undefined') return;
    try {
        const raw = localStorage.getItem('smoke-essentials-auth');
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (parsed?.state) {
            parsed.state.accessToken = accessToken;
            parsed.state.refreshToken = refreshToken;
            localStorage.setItem('smoke-essentials-auth', JSON.stringify(parsed));
        }
    } catch { }
}

function clearAuthStore() {
    if (typeof window === 'undefined') return;
    try {
        const raw = localStorage.getItem('smoke-essentials-auth');
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (parsed?.state) {
            parsed.state.user = null;
            parsed.state.accessToken = null;
            parsed.state.refreshToken = null;
            localStorage.setItem('smoke-essentials-auth', JSON.stringify(parsed));
        }
    } catch { }
}

// Refresh lock to avoid multiple concurrent refresh calls
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
    // If already refreshing, wait for the existing promise
    if (isRefreshing && refreshPromise) {
        return refreshPromise;
    }

    isRefreshing = true;
    refreshPromise = (async () => {
        try {
            const authState = getAuthStore();
            if (!authState?.refreshToken) return null;

            const response = await fetch(`${API_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: authState.refreshToken }),
            });

            if (!response.ok) {
                // Refresh token also expired — force logout
                clearAuthStore();
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
                return null;
            }

            const data = await response.json();
            const newAccessToken = data.data.accessToken;
            const newRefreshToken = data.data.refreshToken;

            // Persist the new tokens
            setAuthStore(newAccessToken, newRefreshToken);

            return newAccessToken;
        } catch {
            return null;
        } finally {
            isRefreshing = false;
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

export async function api<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { token, headers: customHeaders, ...rest } = options;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...customHeaders as Record<string, string>,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        headers,
        ...rest,
    });

    // If 401 and we have a token, try refreshing
    if (response.status === 401 && token) {
        const newToken = await refreshAccessToken();
        if (newToken) {
            // Retry the original request with the new token
            headers['Authorization'] = `Bearer ${newToken}`;
            const retryResponse = await fetch(`${API_URL}${endpoint}`, {
                headers,
                ...rest,
            });

            const retryData = await retryResponse.json();
            if (!retryResponse.ok) {
                throw new Error(retryData.error || 'API request failed');
            }
            return retryData;
        }
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'API request failed');
    }

    return data;
}
