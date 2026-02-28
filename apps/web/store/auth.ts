'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';

interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    isAgeVerified: boolean;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: {
        name: string;
        email: string;
        phone: string;
        password: string;
        isAgeVerified: boolean;
    }) => Promise<void>;
    logout: () => void;
    setTokens: (accessToken: string, refreshToken: string) => void;
    syncFromStorage: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isLoading: false,

            login: async (email: string, password: string) => {
                set({ isLoading: true });
                try {
                    const res: any = await api('/auth/login', {
                        method: 'POST',
                        body: JSON.stringify({ email, password }),
                    });
                    set({
                        user: res.data.user,
                        accessToken: res.data.accessToken,
                        refreshToken: res.data.refreshToken,
                        isLoading: false,
                    });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            register: async (data) => {
                set({ isLoading: true });
                try {
                    const res: any = await api('/auth/register', {
                        method: 'POST',
                        body: JSON.stringify(data),
                    });
                    set({
                        user: res.data.user,
                        accessToken: res.data.accessToken,
                        refreshToken: res.data.refreshToken,
                        isLoading: false,
                    });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            logout: () => {
                const { accessToken, refreshToken } = get();
                if (accessToken && refreshToken) {
                    api('/auth/logout', {
                        method: 'POST',
                        token: accessToken,
                        body: JSON.stringify({ refreshToken }),
                    }).catch(() => { });
                }
                set({ user: null, accessToken: null, refreshToken: null });
            },

            setTokens: (accessToken, refreshToken) => {
                set({ accessToken, refreshToken });
            },

            // Sync Zustand state from localStorage (after silent token refresh)
            syncFromStorage: () => {
                try {
                    const raw = localStorage.getItem('smoke-essentials-auth');
                    if (!raw) return;
                    const parsed = JSON.parse(raw);
                    const state = parsed?.state;
                    if (state) {
                        set({
                            accessToken: state.accessToken,
                            refreshToken: state.refreshToken,
                            user: state.user,
                        });
                    }
                } catch { }
            },
        }),
        {
            name: 'smoke-essentials-auth',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
            }),
        }
    )
);

// Listen for storage changes (e.g. token refresh in api.ts updates localStorage)
if (typeof window !== 'undefined') {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function (key, value) {
        originalSetItem.call(this, key, value);
        if (key === 'smoke-essentials-auth') {
            // Defer sync so it doesn't conflict with Zustand's own writes
            setTimeout(() => {
                useAuthStore.getState().syncFromStorage();
            }, 0);
        }
    };
}
