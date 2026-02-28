'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../../store/auth';
import { api } from '../../../lib/api';

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
    PENDING: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', label: '⏳ Pending' },
    OUT_FOR_DELIVERY: { color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', label: '🚗 Out for Delivery' },
    DELIVERED: { color: '#10b981', bg: 'rgba(16,185,129,0.15)', label: '✅ Delivered' },
    CANCELLED: { color: '#ef4444', bg: 'rgba(239,68,68,0.15)', label: '❌ Cancelled' },
};

export default function OrderDetailPage() {
    const params = useParams();
    const { accessToken } = useAuthStore();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res: any = await api(`/orders/${params.id}`, {
                    token: accessToken!,
                });
                setOrder(res.data);
            } catch { }
            setLoading(false);
        }
        if (accessToken) load();
    }, [params.id, accessToken]);

    if (loading) {
        return (
            <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 24px' }}>
                <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />
            </div>
        );
    }

    if (!order) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 24px' }}>
                <span style={{ fontSize: 64 }}>😕</span>
                <h2 style={{ marginTop: 16 }}>Order not found</h2>
            </div>
        );
    }

    const status = statusConfig[order.status] || statusConfig.PENDING;

    return (
        <div className="section-pad" style={{
            maxWidth: 700,
            margin: '0 auto',
            padding: '100px 24px 40px',
        }}>
            {/* Success message */}
            <div className="animate-fade-in" style={{
                textAlign: 'center',
                marginBottom: 40,
            }}>
                <span style={{ fontSize: 64 }}>🎉</span>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 12 }}>Order Confirmed!</h1>
                <p style={{ color: 'var(--color-text-secondary)', marginTop: 8 }}>
                    Your order has been placed successfully
                </p>
            </div>

            {/* Order Card */}
            <div style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 20,
                padding: 32,
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Order ID</p>
                        <p style={{ fontWeight: 700, fontSize: 16, fontFamily: 'monospace' }}>#{order.id.slice(0, 8)}</p>
                    </div>
                    <div style={{
                        padding: '8px 16px',
                        borderRadius: 20,
                        background: status.bg,
                        color: status.color,
                        fontWeight: 600,
                        fontSize: 14,
                    }}>
                        {status.label}
                    </div>
                </div>

                {/* Estimated Delivery */}
                <div style={{
                    padding: '16px 20px',
                    borderRadius: 12,
                    background: 'rgba(249,115,22,0.08)',
                    border: '1px solid rgba(249,115,22,0.2)',
                    marginBottom: 24,
                    textAlign: 'center',
                }}>
                    <p style={{ fontSize: 14, color: 'var(--color-primary)', fontWeight: 600 }}>
                        ⏱ Estimated Delivery: 30 minutes
                    </p>
                </div>

                {/* Delivery Address */}
                {order.address && (
                    <div style={{ marginBottom: 24 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>📍 Delivery Address</h3>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
                            {order.address.label} — {order.address.fullAddress}
                        </p>
                    </div>
                )}

                {/* Items */}
                <div style={{ marginBottom: 24 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>📦 Items</h3>
                    {order.items?.map((item: any) => (
                        <div key={item.id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '10px 0',
                            borderBottom: '1px solid var(--color-border)',
                            fontSize: 14,
                        }}>
                            <span>
                                {item.product?.name || 'Product'} × {item.quantity}
                            </span>
                            <span style={{ fontWeight: 600 }}>৳{(item.unitPrice * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>

                {/* Pricing */}
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14 }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Delivery Fee</span>
                        <span>৳{order.deliveryFee?.toFixed(2)}</span>
                    </div>
                    {order.discount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14 }}>
                            <span style={{ color: 'var(--color-text-secondary)' }}>Discount</span>
                            <span style={{ color: 'var(--color-success)' }}>-৳{order.discount?.toFixed(2)}</span>
                        </div>
                    )}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontWeight: 700,
                        fontSize: 20,
                        marginTop: 12,
                        paddingTop: 12,
                        borderTop: '1px solid var(--color-border)',
                    }}>
                        <span>Total</span>
                        <span style={{ color: 'var(--color-primary)' }}>৳{order.totalAmount?.toFixed(2)}</span>
                    </div>
                </div>

                {/* Notes */}
                {order.deliveryNotes && (
                    <div style={{
                        marginTop: 24,
                        padding: '12px 16px',
                        borderRadius: 10,
                        background: 'var(--color-bg)',
                        fontSize: 13,
                    }}>
                        <strong>Notes:</strong> {order.deliveryNotes}
                    </div>
                )}
            </div>

            <div style={{ textAlign: 'center', marginTop: 32 }}>
                <Link
                    href="/shop"
                    className="btn-glow"
                    style={{
                        display: 'inline-block',
                        padding: '14px 32px',
                        borderRadius: 12,
                        color: 'white',
                        textDecoration: 'none',
                        fontWeight: 600,
                    }}
                >
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
}
