'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProductCard from '../../../components/ProductCard';
import { useCartStore } from '../../../store/cart';

const API = '/api';

export default function ProductDetailPage() {
    const params = useParams();
    const [product, setProduct] = useState<any>(null);
    const [similar, setSimilar] = useState<any[]>([]);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const addItem = useCartStore((s) => s.addItem);
    const openCart = useCartStore((s) => s.openCart);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`${API}/products/${params.id}`);
                const data = await res.json();
                setProduct(data.data);

                // Fetch similar products
                const simRes = await fetch(`${API}/products?category=${data.data.category}&limit=4`);
                const simData = await simRes.json();
                setSimilar((simData.data?.items || []).filter((p: any) => p.id !== params.id));
            } catch { }
            setLoading(false);
        }
        load();
    }, [params.id]);

    const handleAddToCart = () => {
        if (!product) return;
        for (let i = 0; i < quantity; i++) {
            addItem(product);
        }
        openCart();
    };

    if (loading) {
        return (
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
                <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />
            </div>
        );
    }

    if (!product) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 24px' }}>
                <span style={{ fontSize: 64 }}>😕</span>
                <h2 style={{ marginTop: 16 }}>Product not found</h2>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
            {/* Product Detail */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 48,
                marginBottom: 80,
            }}>
                {/* Image */}
                <div style={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 20,
                    height: 400,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 100,
                    overflow: 'hidden',
                }}>
                    {product.imageUrl ? (
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
                    ) : (
                        product.category === 'CIGARETTE' ? '🚬' : product.category === 'CONDOM' ? '📦' : '📦'
                    )}
                </div>

                {/* Info */}
                <div>
                    <div style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: 20,
                        background: 'rgba(249,115,22,0.15)',
                        color: 'var(--color-primary)',
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        marginBottom: 12,
                    }}>
                        {product.category}
                    </div>

                    <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>{product.name}</h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 15, marginBottom: 4 }}>{product.brand}</p>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 24 }}>📦 {product.packSize}</p>

                    <div style={{
                        fontSize: 36,
                        fontWeight: 800,
                        color: 'var(--color-primary)',
                        marginBottom: 24,
                    }}>
                        ৳{product.price}
                    </div>

                    <p style={{
                        color: 'var(--color-text-secondary)',
                        fontSize: 15,
                        lineHeight: 1.7,
                        marginBottom: 24,
                    }}>
                        {product.description}
                    </p>

                    {/* Stock */}
                    <div style={{
                        display: 'inline-block',
                        padding: '6px 14px',
                        borderRadius: 20,
                        background: product.stock > 10 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                        color: product.stock > 10 ? '#10b981' : '#f59e0b',
                        fontSize: 13,
                        fontWeight: 600,
                        marginBottom: 24,
                    }}>
                        {product.stock > 10 ? `✓ In Stock (${product.stock} available)` : `⚠ Only ${product.stock} left`}
                    </div>

                    {product.category === 'CIGARETTE' && (
                        <div className="tobacco-warning" style={{ marginBottom: 24 }}>
                            ⚠️ Statutory Warning: Smoking is injurious to health
                        </div>
                    )}

                    {/* Quantity + Add to Cart */}
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            background: 'var(--color-bg-card)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 12,
                            padding: '8px 16px',
                        }}>
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--color-text)',
                                    fontSize: 20,
                                    cursor: 'pointer',
                                    padding: '0 4px',
                                }}
                            >
                                −
                            </button>
                            <span style={{ fontWeight: 700, fontSize: 16, minWidth: 24, textAlign: 'center' }}>
                                {quantity}
                            </span>
                            <button
                                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--color-text)',
                                    fontSize: 20,
                                    cursor: 'pointer',
                                    padding: '0 4px',
                                }}
                            >
                                +
                            </button>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={product.stock === 0}
                            className="btn-glow"
                            style={{
                                flex: 1,
                                padding: '14px 32px',
                                borderRadius: 12,
                                border: 'none',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: 16,
                                cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                            }}
                        >
                            Add to Cart — ৳{(product.price * quantity).toFixed(2)}
                        </button>
                    </div>
                </div>
            </div>

            {/* Similar Products */}
            {similar.length > 0 && (
                <div>
                    <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>
                        Similar Products
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                        gap: 20,
                    }}>
                        {similar.map(p => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
