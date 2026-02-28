'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../../store/auth';

export default function SignupPage() {
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', isAgeVerified: false });
    const [error, setError] = useState('');
    const register = useAuthStore((s) => s.register);
    const isLoading = useAuthStore((s) => s.isLoading);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!form.isAgeVerified) {
            setError('You must confirm you are 18 or older');
            return;
        }

        try {
            await register(form);
            router.push('/shop');
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        }
    };

    const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

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
                    <span style={{ fontSize: 40 }}>🔥</span>
                    <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 12 }}>Create Account</h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginTop: 8 }}>
                        Join Smoke & Essentials today
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
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Full Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => update('name', e.target.value)}
                            placeholder="John Doe"
                            required
                            minLength={2}
                        />
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Email</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => update('email', e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Phone Number</label>
                        <input
                            type="tel"
                            value={form.phone}
                            onChange={(e) => update('phone', e.target.value)}
                            placeholder="01XXXXXXXXX"
                            required
                        />
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Password</label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={(e) => update('password', e.target.value)}
                            placeholder="Minimum 6 characters"
                            required
                            minLength={6}
                        />
                    </div>

                    {/* Age verification */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        marginBottom: 24,
                        padding: '12px 16px',
                        background: 'rgba(249,115,22,0.05)',
                        border: '1px solid rgba(249,115,22,0.2)',
                        borderRadius: 10,
                    }}>
                        <input
                            type="checkbox"
                            checked={form.isAgeVerified}
                            onChange={(e) => update('isAgeVerified', e.target.checked)}
                            style={{ width: 18, height: 18, marginTop: 2, accentColor: 'var(--color-primary)' }}
                            id="age-verify"
                        />
                        <label htmlFor="age-verify" style={{ fontSize: 13, color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                            I confirm that I am <strong style={{ color: 'var(--color-primary)' }}>18 years or older</strong> and agree to the Terms & Conditions.
                        </label>
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
                        {isLoading ? 'Creating Account...' : 'Create Account'}
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
                    Already have an account?{' '}
                    <Link href="/login" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
