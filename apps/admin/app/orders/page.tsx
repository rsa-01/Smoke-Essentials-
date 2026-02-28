'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminApi } from '../../lib/api';

const statusOptions = ['PENDING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
const statusColors: Record<string, string> = {
    PENDING: '#f59e0b', OUT_FOR_DELIVERY: '#3b82f6', DELIVERED: '#10b981', CANCELLED: '#ef4444',
};

interface Order {
    id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    items: unknown[];
    user: {
        name: string;
        phone: string;
    };
}

export default function OrdersPage() {
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchOrders = async (t: string) => {
            setLoading(true);
            const params = new URLSearchParams({ page: String(page), limit: '20' });
            if (filter) params.set('status', filter);
            try {
                const res = await adminApi<{ data?: { items?: Order[], totalPages?: number } }>(`/orders?${params}`, { token: t });
                setOrders(res.data?.items || []);
                setTotalPages(res.data?.totalPages || 1);
            } catch { }
            setLoading(false);
        };

        const t = localStorage.getItem('admin-token');
        if (!t) { router.replace('/login'); return; }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setToken(t);
        fetchOrders(t);
    }, [router, page, filter]);

    const updateStatus = async (orderId: string, status: string) => {
        try {
            await adminApi(`/orders/${orderId}/status`, {
                method: 'PATCH',
                token: token!,
                body: JSON.stringify({ status }),
            });
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    const navLinks = [
        { label: '📊 Dashboard', href: '/dashboard' },
        { label: '📦 Products', href: '/products' },
        { label: '🛒 Orders', href: '/orders', active: true },
        { label: '👥 Users', href: '/users' },
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800 }}>🛒 Orders</h1>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => { setFilter(''); setPage(1); }} style={{
                            padding: '6px 14px', borderRadius: 8, border: !filter ? 'none' : '1px solid var(--color-border)',
                            background: !filter ? 'var(--gradient-primary)' : 'transparent', color: 'white',
                            fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        }}>
                            All
                        </button>
                        {statusOptions.map(s => (
                            <button key={s} onClick={() => { setFilter(s); setPage(1); }} style={{
                                padding: '6px 14px', borderRadius: 8,
                                border: filter === s ? 'none' : '1px solid var(--color-border)',
                                background: filter === s ? `${statusColors[s]}30` : 'transparent',
                                color: filter === s ? statusColors[s] : 'var(--color-text-secondary)',
                                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            }}>
                                {s.replace(/_/g, ' ')}
                            </button>
                        ))}
                    </div>
                </div>

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
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>#{order.id.slice(0, 8)}</td>
                                    <td>
                                        <div>
                                            <p style={{ fontWeight: 500 }}>{order.user?.name || 'N/A'}</p>
                                            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{order.user?.phone}</p>
                                        </div>
                                    </td>
                                    <td>{order.items?.length || 0}</td>
                                    <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>৳{order.totalAmount?.toFixed(2)}</td>
                                    <td>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                                            color: statusColors[order.status], background: `${statusColors[order.status]}15`,
                                        }}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>
                                        {new Date(order.createdAt).toLocaleString()}
                                    </td>
                                    <td>
                                        <select
                                            value={order.status}
                                            onChange={(e) => updateStatus(order.id, e.target.value)}
                                            style={{ fontSize: 12, padding: '4px 8px', width: 'auto' }}
                                        >
                                            {statusOptions.map(s => (
                                                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && !loading && (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--color-text-secondary)' }}>No orders</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
