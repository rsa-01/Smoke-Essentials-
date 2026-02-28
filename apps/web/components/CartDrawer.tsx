'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '../store/cart';

export default function CartDrawer() {
    const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal, getDeliveryFee, getTotal } = useCartStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    onClick={closeCart}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(10,10,26,0.7)',
                        backdropFilter: 'blur(8px)',
                        zIndex: 200,
                        animation: 'fadeIn 0.2s ease',
                    }}
                />
            )}

            {/* Drawer */}
            <div style={{
                position: 'fixed',
                top: 0,
                right: 0,
                width: '100%',
                maxWidth: 400,
                height: '100vh',
                background: 'rgba(26,26,46,0.95)',
                backdropFilter: 'blur(40px)',
                borderLeft: '1px solid rgba(255,255,255,0.06)',
                zIndex: 201,
                transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
            }}>
                {/* Header */}
                <div style={{
                    padding: '24px 28px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                    <div>
                        <h2 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 22,
                            fontWeight: 700,
                        }}>
                            Your <span className="text-serif-italic" style={{ color: 'var(--ember)' }}>Cart</span>
                        </h2>
                        <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 10,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: 'var(--mist)',
                        }}>
                            {items.length} {items.length === 1 ? 'item' : 'items'}
                        </span>
                    </div>
                    <button onClick={closeCart} style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '50%',
                        width: 36,
                        height: 36,
                        color: 'var(--cream)',
                        fontSize: 16,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        ✕
                    </button>
                </div>

                {/* Items */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 28px' }}>
                    {items.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 0' }}>
                            <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>🛒</span>
                            <p style={{ color: 'var(--mist)', fontSize: 14 }}>Your cart is empty</p>
                        </div>
                    ) : (
                        items.map(item => (
                            <div key={item.product.id} style={{
                                display: 'flex',
                                gap: 16,
                                padding: '16px 0',
                                borderBottom: '1px solid rgba(255,255,255,0.04)',
                            }}>
                                {/* Product emoji */}
                                <div style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 'var(--radius)',
                                    background: 'rgba(255,255,255,0.03)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 28,
                                    flexShrink: 0,
                                }}>
                                    {item.product.category === 'CIGARETTE' ? '🚬' : '📦'}
                                </div>

                                <div style={{ flex: 1 }}>
                                    <h4 style={{
                                        fontFamily: 'var(--font-display)',
                                        fontSize: 14,
                                        fontWeight: 600,
                                        marginBottom: 4,
                                    }}>
                                        {item.product.name}
                                    </h4>
                                    <p style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: 10,
                                        color: 'var(--mist)',
                                        letterSpacing: '0.05em',
                                        marginBottom: 8,
                                    }}>
                                        ৳{item.product.price} × {item.quantity}
                                    </p>

                                    {/* Quantity controls */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <button
                                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                            style={{
                                                width: 28, height: 28, borderRadius: 6,
                                                background: 'rgba(255,255,255,0.04)',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                                color: 'var(--cream)',
                                                fontSize: 14,
                                                cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}
                                        >
                                            −
                                        </button>
                                        <span style={{
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: 12,
                                            minWidth: 20,
                                            textAlign: 'center',
                                        }}>
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                            style={{
                                                width: 28, height: 28, borderRadius: 6,
                                                background: 'rgba(255,255,255,0.04)',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                                color: 'var(--cream)',
                                                fontSize: 14,
                                                cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}
                                        >
                                            +
                                        </button>
                                        <button
                                            onClick={() => removeItem(item.product.id)}
                                            style={{
                                                marginLeft: 'auto',
                                                background: 'none', border: 'none',
                                                color: 'var(--crimson)',
                                                fontSize: 11,
                                                fontFamily: 'var(--font-mono)',
                                                letterSpacing: '0.05em',
                                                cursor: 'pointer',
                                                textTransform: 'uppercase',
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>

                                <span style={{
                                    fontFamily: 'var(--font-display)',
                                    fontWeight: 700,
                                    fontSize: 16,
                                    color: 'var(--cream)',
                                }}>
                                    ৳{(item.product.price * item.quantity).toFixed(0)}
                                </span>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer / Totals */}
                {items.length > 0 && (
                    <div style={{
                        padding: '24px 28px',
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        background: 'rgba(255,255,255,0.02)',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ color: 'var(--mist)', fontSize: 14 }}>Subtotal</span>
                            <span style={{ fontWeight: 600 }}>৳{getSubtotal().toFixed(0)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                            <span style={{ color: 'var(--mist)', fontSize: 14 }}>Delivery</span>
                            <span style={{ fontWeight: 600 }}>৳{getDeliveryFee().toFixed(0)}</span>
                        </div>
                        <div className="divider" style={{ marginBottom: 16 }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                            <span style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: 18,
                                fontWeight: 700,
                            }}>
                                Total
                            </span>
                            <span style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: 22,
                                fontWeight: 900,
                                color: 'var(--ember)',
                            }}>
                                ৳{getTotal().toFixed(0)}
                            </span>
                        </div>

                        <Link
                            href="/checkout"
                            onClick={closeCart}
                            className="btn-ember"
                            style={{
                                display: 'block',
                                textAlign: 'center',
                                textDecoration: 'none',
                                width: '100%',
                                padding: '16px',
                                fontSize: 14,
                                fontFamily: 'var(--font-mono)',
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase',
                            }}
                        >
                            Checkout →
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}
