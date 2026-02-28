'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);
            if (data.data.user.role !== 'ADMIN') throw new Error('Access denied. Admin only.');

            localStorage.setItem('admin-token', data.data.accessToken);
            localStorage.setItem('admin-user', JSON.stringify(data.data.user));
            router.push('/dashboard');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Login failed');
        }
        setLoading(false);
    };

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: '100vh', padding: 24,
        }}>
            <div style={{
                background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
                borderRadius: 20, padding: '48px 40px', maxWidth: 420, width: '100%',
            }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <span style={{ fontSize: 40 }}>🔧</span>
                    <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 12 }}>Admin Panel</h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginTop: 8 }}>
                        Sign in with your admin credentials
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                        color: '#fca5a5', padding: '10px 16px', borderRadius: 8, fontSize: 13, marginBottom: 20,
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@smokeessentials.com" required />
                    </div>
                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', fontSize: 16, padding: 14, opacity: loading ? 0.7 : 1 }}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}
