'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminApi } from '../../lib/api';

interface DashboardOrder {
    id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    items: unknown[];
    user: { name: string; phone: string } | null;
}

export default function DashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState({ orders: 0, products: 0, users: 0, revenue: 0 });
    const [recentOrders, setRecentOrders] = useState<DashboardOrder[]>([]);

    useEffect(() => {
        const t = localStorage.getItem('admin-token');
        if (!t) { router.replace('/login'); return; }
        // Fetch stats
        Promise.all([
            adminApi<{ data: { items: DashboardOrder[], total: number } }>('/orders?limit=5', { token: t }).catch(() => ({ data: { items: [] as DashboardOrder[], total: 0 } })),
            adminApi<{ data: { total: number } }>('/products?limit=1', { token: t }).catch(() => ({ data: { total: 0 } })),
        ]).then(([ordersRes, productsRes]) => {
            const orders = ordersRes.data?.items || [];
            const totalOrders = ordersRes.data?.total || 0;
            const totalProducts = productsRes.data?.total || 0;
            const revenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

            setStats({ orders: totalOrders, products: totalProducts, users: 0, revenue });
            setRecentOrders(orders);
        });
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('admin-token');
        localStorage.removeItem('admin-user');
        router.push('/login');
    };

    const navLinks = [
        { label: '📊 Dashboard', href: '/dashboard', active: true },
        { label: '📦 Products', href: '/products', active: false },
        { label: '🛒 Orders', href: '/orders', active: false },
        { label: '👥 Users', href: '/users', active: false },
    ];

    const statusColors: Record<string, string> = {
        PENDING: '#f59e0b', OUT_FOR_DELIVERY: '#3b82f6', DELIVERED: '#10b981', CANCELLED: '#ef4444',
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <aside style={{
                width: 240, background: 'var(--color-bg-card)', borderRight: '1px solid var(--color-border)',
                padding: 24, display: 'flex', flexDirection: 'column',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
                    <span style={{ fontSize: 24 }}>🔥</span>
                    <span style={{ fontWeight: 700, fontSize: 16 }}>Admin Panel</span>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
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

                <button onClick={handleLogout} style={{
                    padding: '10px', borderRadius: 8, border: '1px solid var(--color-border)',
                    background: 'transparent', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: 13,
                }}>
                    🚪 Logout
                </button>
            </aside>

            {/* Main */}
            <main style={{ flex: 1, padding: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 32 }}>Dashboard</h1>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
                    {[
                        { label: 'Total Orders', value: stats.orders, emoji: '🛒', color: '#3b82f6' },
                        { label: 'Revenue', value: `৳${stats.revenue.toFixed(0)}`, emoji: '💰', color: '#10b981' },
                        { label: 'Products', value: stats.products, emoji: '📦', color: '#f59e0b' },
                        { label: 'Users', value: stats.users, emoji: '👥', color: '#8b5cf6' },
                    ].map(stat => (
                        <div key={stat.label} className="stat-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                <span style={{ fontSize: 32 }}>{stat.emoji}</span>
                                <span style={{
                                    width: 8, height: 8, borderRadius: '50%',
                                    background: stat.color, alignSelf: 'flex-start',
                                }} />
                            </div>
                            <p style={{ fontSize: 28, fontWeight: 800, color: stat.color }}>{stat.value}</p>
                            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Recent Orders */}
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Recent Orders</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map(order => (
                                <tr key={order.id}>
                                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>#{order.id.slice(0, 8)}</td>
                                    <td>{order.user?.name || 'N/A'}</td>
                                    <td>{order.items?.length || 0} items</td>
                                    <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>৳{order.totalAmount?.toFixed(2)}</td>
                                    <td>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                                            color: statusColors[order.status] || '#6b7280',
                                            background: `${statusColors[order.status]}15`,
                                        }}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {recentOrders.length === 0 && (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--color-text-secondary)' }}>No orders yet</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
