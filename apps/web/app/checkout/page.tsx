'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../../store/cart';
import { useAuthStore } from '../../store/auth';
import { api } from '../../lib/api';
import AddressAutocomplete from '../../components/AddressAutocomplete';

export default function CheckoutPage() {
    const { items, getSubtotal, getDeliveryFee, getTotal, clearCart } = useCartStore();
    const { user, accessToken } = useAuthStore();
    const router = useRouter();

    const [address, setAddress] = useState({ label: 'Home', fullAddress: '', lat: 23.8103, lng: 90.4125 });
    const [apartment, setApartment] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!user) {
        return (
            <div style={{
                maxWidth: 600,
                margin: '0 auto',
                padding: '100px 24px',
                textAlign: 'center',
            }}>
                <span style={{ fontSize: 64 }}>🔐</span>
                <h2 style={{ marginTop: 16, marginBottom: 8 }}>Please sign in</h2>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>
                    You need to be logged in to checkout
                </p>
                <button
                    onClick={() => router.push('/login')}
                    className="btn-glow"
                    style={{
                        padding: '12px 32px',
                        borderRadius: 10,
                        border: 'none',
                        color: 'white',
                        fontWeight: 600,
                        cursor: 'pointer',
                    }}
                >
                    Sign In
                </button>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div style={{
                maxWidth: 600,
                margin: '0 auto',
                padding: '100px 24px',
                textAlign: 'center',
            }}>
                <span style={{ fontSize: 64 }}>🛒</span>
                <h2 style={{ marginTop: 16, marginBottom: 8 }}>Your cart is empty</h2>
                <button
                    onClick={() => router.push('/shop')}
                    className="btn-glow"
                    style={{
                        padding: '12px 32px',
                        borderRadius: 10,
                        border: 'none',
                        color: 'white',
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginTop: 16,
                    }}
                >
                    Go Shopping
                </button>
            </div>
        );
    }

    const handleOrder = async () => {
        if (!address.fullAddress) {
            setError('Please enter your delivery address');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Always grab the freshest token (might have been silently refreshed)
            const currentToken = useAuthStore.getState().accessToken;
            if (!currentToken) {
                setError('Please log in again');
                setLoading(false);
                return;
            }

            // First create address
            const addrRes: any = await api('/addresses', {
                method: 'POST',
                token: currentToken,
                body: JSON.stringify({
                    label: address.label,
                    fullAddress: apartment ? `${address.fullAddress} (Apt: ${apartment})` : address.fullAddress,
                    lat: address.lat,
                    lng: address.lng,
                }),
            });

            // Then create order (token may have refreshed during address creation)
            const latestToken = useAuthStore.getState().accessToken || currentToken;
            const orderRes: any = await api('/orders', {
                method: 'POST',
                token: latestToken,
                body: JSON.stringify({
                    addressId: addrRes.data.id,
                    deliveryNotes: notes,
                    items: items.map(item => ({
                        productId: item.product.id,
                        quantity: item.quantity,
                    })),
                }),
            });

            clearCart();
            router.push(`/orders/${orderRes.data.id}`);
        } catch (err: any) {
            setError(err.message || 'Failed to place order');
        }
        setLoading(false);
    };

    return (
        <div className="section-pad" style={{
            maxWidth: 900,
            margin: '0 auto',
            padding: '100px 24px 40px',
        }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 40 }}>🛍️ Checkout</h1>

            <div className="checkout-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32 }}>
                {/* Left: Form */}
                <div>
                    {/* Delivery Address */}
                    <div style={{
                        background: 'var(--color-bg-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 16,
                        padding: 24,
                        marginBottom: 24,
                    }}>
                        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📍 Delivery Address</h2>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'block' }}>
                                Address Label
                            </label>
                            <select
                                value={address.label}
                                onChange={(e) => setAddress(prev => ({ ...prev, label: e.target.value }))}
                            >
                                <option value="Home">🏠 Home</option>
                                <option value="Office">🏢 Office</option>
                                <option value="Other">📍 Other</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'block' }}>
                                Search Address
                            </label>
                            <AddressAutocomplete
                                value={address.fullAddress}
                                onSelect={({ fullAddress, lat, lng }) =>
                                    setAddress(prev => ({ ...prev, fullAddress, lat, lng }))
                                }
                                placeholder="Type your address — e.g. Dhanmondi, Gulshan, Mirpur..."
                            />
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'block' }}>
                                Apartment, suite, etc. (Optional)
                            </label>
                            <input
                                type="text"
                                value={apartment}
                                onChange={(e) => setApartment(e.target.value)}
                                placeholder="e.g. Apt 4B, Floor 2"
                            />
                        </div>

                        {address.fullAddress && (
                            <div style={{
                                padding: '12px 16px',
                                borderRadius: 10,
                                background: 'rgba(16,185,129,0.1)',
                                border: '1px solid rgba(16,185,129,0.2)',
                                fontSize: 13,
                                color: '#6ee7b7',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                            }}>
                                <span>✓</span>
                                <span style={{ wordBreak: 'break-word' }}>
                                    Delivering to: {address.fullAddress}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Delivery Notes */}
                    <div style={{
                        background: 'var(--color-bg-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 16,
                        padding: 24,
                    }}>
                        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📝 Delivery Notes (Optional)</h2>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any special instructions for delivery..."
                            rows={3}
                            style={{ resize: 'vertical' }}
                        />
                    </div>
                </div>

                {/* Right: Order Summary */}
                <div style={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 16,
                    padding: 24,
                    height: 'fit-content',
                    position: 'sticky',
                    top: 88,
                }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>📋 Order Summary</h2>

                    {items.map(item => (
                        <div key={item.product.id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px 0',
                            borderBottom: '1px solid var(--color-border)',
                        }}>
                            <div>
                                <p style={{ fontSize: 14, fontWeight: 500 }}>{item.product.name}</p>
                                <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                                    ৳{item.product.price} × {item.quantity}
                                </p>
                            </div>
                            <span style={{ fontWeight: 600 }}>
                                ৳{(item.product.price * item.quantity).toFixed(2)}
                            </span>
                        </div>
                    ))}

                    <div style={{ paddingTop: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                            <span style={{ color: 'var(--color-text-secondary)' }}>Subtotal</span>
                            <span>৳{getSubtotal().toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                            <span style={{ color: 'var(--color-text-secondary)' }}>Delivery Fee</span>
                            <span>৳{getDeliveryFee().toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                            <span style={{ color: 'var(--color-text-secondary)' }}>Discount</span>
                            <span style={{ color: 'var(--color-success)' }}>-৳0.00</span>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            paddingTop: 16,
                            borderTop: '1px solid var(--color-border)',
                            fontSize: 20,
                            fontWeight: 700,
                        }}>
                            <span>Total</span>
                            <span style={{ color: 'var(--color-primary)' }}>৳{getTotal().toFixed(2)}</span>
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            marginTop: 16,
                            padding: '10px 14px',
                            borderRadius: 8,
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.3)',
                            color: '#fca5a5',
                            fontSize: 13,
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleOrder}
                        disabled={loading}
                        className="btn-glow"
                        style={{
                            width: '100%',
                            padding: '16px',
                            borderRadius: 12,
                            border: 'none',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: 16,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            marginTop: 24,
                        }}
                    >
                        {loading ? 'Placing Order...' : 'Confirm Order →'}
                    </button>

                    <p style={{
                        textAlign: 'center',
                        marginTop: 12,
                        fontSize: 12,
                        color: 'var(--color-text-secondary)',
                    }}>
                        ⏱ Estimated delivery: 30 minutes
                    </p>
                </div>
            </div>
        </div>
    );
}
