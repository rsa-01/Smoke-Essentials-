'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../../store/auth';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const login = useAuthStore((s) => s.login);
    const isLoading = useAuthStore((s) => s.isLoading);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            router.push('/shop');
        } catch (err: any) {
            setError(err.message || 'Login failed');
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 200px)',
            padding: '40px 24px',
        }}>
            <div className="animate-fade-in" style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 20,
                padding: '48px 40px',
                maxWidth: 440,
                width: '100%',
            }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <span style={{ fontSize: 40 }}>👋</span>
                    <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 12 }}>Welcome back</h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginTop: 8 }}>
                        Sign in to your account
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        color: '#fca5a5',
                        padding: '10px 16px',
                        borderRadius: 8,
                        fontSize: 13,
                        marginBottom: 20,
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-glow"
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: 10,
                            border: 'none',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: 16,
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            opacity: isLoading ? 0.7 : 1,
                        }}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                {/* Google OAuth placeholder */}
                <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>or</span>
                    <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
                </div>

                <button style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 10,
                    border: '1px solid var(--color-border)',
                    background: 'transparent',
                    color: 'var(--color-text)',
                    fontWeight: 500,
                    fontSize: 14,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                }}>
                    <span style={{ fontSize: 18 }}>🔵</span>
                    Continue with Google
                </button>

                <p style={{
                    textAlign: 'center',
                    marginTop: 24,
                    color: 'var(--color-text-secondary)',
                    fontSize: 14,
                }}>
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
