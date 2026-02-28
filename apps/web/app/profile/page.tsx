'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/auth';
import { api } from '../../lib/api';

export default function ProfilePage() {
    const { user, accessToken, logout } = useAuthStore();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [addresses, setAddresses] = useState<any[]>([]);

    useEffect(() => {
        if (!user || !accessToken) {
            router.push('/login');
            return;
        }

        // Fetch orders
        api('/orders?limit=5', { token: accessToken })
            .then((res: any) => setOrders(res.data?.items || []))
            .catch(() => { });

        // Fetch addresses
        api('/addresses', { token: accessToken })
            .then((res: any) => setAddresses(res.data || []))
            .catch(() => { });
    }, [user, accessToken, router]);

    if (!user) return null;

    const statusColors: Record<string, string> = {
        PENDING: '#f59e0b',
        OUT_FOR_DELIVERY: '#3b82f6',
        DELIVERED: '#10b981',
        CANCELLED: '#ef4444',
    };

    return (
        <div className="section-pad" style={{
            maxWidth: 800,
            margin: '0 auto',
            padding: '100px 24px 40px',
        }}>
            {/* Profile Header */}
            <div className="profile-header" style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 20,
                padding: 32,
                marginBottom: 32,
                display: 'flex',
                alignItems: 'center',
                gap: 20,
            }}>
                <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'var(--gradient-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    fontWeight: 700,
                    color: 'white',
                }}>
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700 }}>{user.name}</h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>{user.email}</p>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>{user.phone}</p>
                </div>
                <button
                    onClick={() => { logout(); router.push('/'); }}
                    style={{
                        marginLeft: 'auto',
                        padding: '8px 20px',
                        borderRadius: 8,
                        border: '1px solid var(--color-border)',
                        background: 'transparent',
                        color: 'var(--color-text-secondary)',
                        cursor: 'pointer',
                        fontSize: 13,
                    }}
                >
                    Logout
                </button>
            </div>

            {/* Saved Addresses */}
            <div style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 20,
                padding: 24,
                marginBottom: 32,
            }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📍 Saved Addresses</h2>
                {addresses.length === 0 ? (
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>No saved addresses yet</p>
                ) : (
                    addresses.map((addr: any) => (
                        <div key={addr.id} style={{
                            padding: '12px 0',
                            borderBottom: '1px solid var(--color-border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <div>
                                <span style={{
                                    padding: '2px 8px',
                                    borderRadius: 6,
                                    background: 'rgba(249,115,22,0.1)',
                                    color: 'var(--color-primary)',
                                    fontSize: 11,
                                    fontWeight: 600,
                                    marginRight: 8,
                                }}>
                                    {addr.label}
                                </span>
                                <span style={{ fontSize: 14 }}>{addr.fullAddress}</span>
                            </div>
                            {addr.isDefault && (
                                <span style={{ fontSize: 11, color: 'var(--color-success)' }}>Default</span>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Recent Orders */}
            <div style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 20,
                padding: 24,
            }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📦 Recent Orders</h2>
                {orders.length === 0 ? (
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>No orders yet</p>
                ) : (
                    orders.map((order: any) => (
                        <div
                            key={order.id}
                            onClick={() => router.push(`/orders/${order.id}`)}
                            style={{
                                padding: '16px 0',
                                borderBottom: '1px solid var(--color-border)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer',
                            }}
                        >
                            <div>
                                <p style={{ fontWeight: 600, fontSize: 14, fontFamily: 'monospace' }}>
                                    #{order.id.slice(0, 8)}
                                </p>
                                <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                                    {order.items?.length || 0} items · {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{
                                    padding: '4px 10px',
                                    borderRadius: 20,
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: statusColors[order.status] || '#6b7280',
                                    background: `${statusColors[order.status]}15` || 'rgba(107,114,128,0.15)',
                                }}>
                                    {order.status}
                                </span>
                                <p style={{ fontWeight: 700, marginTop: 4, color: 'var(--color-primary)' }}>
                                    ৳{order.totalAmount?.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
