'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UsersPage() {
    const router = useRouter();

    useEffect(() => {
        const t = localStorage.getItem('admin-token');
        if (!t) router.replace('/login');
    }, [router]);

    const navLinks = [
        { label: '📊 Dashboard', href: '/dashboard' },
        { label: '📦 Products', href: '/products' },
        { label: '🛒 Orders', href: '/orders' },
        { label: '👥 Users', href: '/users', active: true },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <aside style={{
                width: 240, background: 'var(--color-bg-card)', borderRight: '1px solid var(--color-border)', padding: 24,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
                    <span style={{ fontSize: 24 }}>🔥</span>
                    <span style={{ fontWeight: 700, fontSize: 16 }}>Admin Panel</span>
                </div>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {navLinks.map(link => (
                        <Link key={link.href} href={link.href} style={{
                            padding: '10px 14px', borderRadius: 8, textDecoration: 'none', fontSize: 14,
                            background: link.active ? 'rgba(249,115,22,0.15)' : 'transparent',
                            color: link.active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                            fontWeight: link.active ? 600 : 400,
                        }}>
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </aside>

            <main style={{ flex: 1, padding: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>👥 Users</h1>

                <div style={{
                    textAlign: 'center', padding: '80px 24px',
                    background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
                    borderRadius: 16,
                }}>
                    <span style={{ fontSize: 64 }}>👥</span>
                    <h2 style={{ marginTop: 16, fontSize: 20, fontWeight: 600 }}>User Management</h2>
                    <p style={{ color: 'var(--color-text-secondary)', marginTop: 8, fontSize: 14 }}>
                        User listing with order counts will be available here.
                        <br />
                        Users are automatically created when they register on the platform.
                    </p>
                </div>
            </main>
        </div>
    );
}
