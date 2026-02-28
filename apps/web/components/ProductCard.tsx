'use client';

import Link from 'next/link';
import { useCartStore } from '../store/cart';

interface ProductCardProps {
    product: any;
}

export default function ProductCard({ product }: ProductCardProps) {
    const addItem = useCartStore((s) => s.addItem);

    const categoryEmoji = product.category === 'CIGARETTE' ? '🚬' : product.category === 'CONDOM' ? '📦' : '🎁';

    return (
        <div className="glass-card" style={{
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Product Visual */}
            <Link href={`/shop/${product.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 64,
                    position: 'relative',
                    overflow: 'hidden',
                    background: product.category === 'CIGARETTE'
                        ? 'linear-gradient(135deg, rgba(255,107,53,0.06) 0%, rgba(255,45,85,0.04) 100%)'
                        : product.category === 'CONDOM'
                            ? 'linear-gradient(135deg, rgba(0,212,170,0.06) 0%, rgba(59,130,246,0.04) 100%)'
                            : 'linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(255,107,53,0.04) 100%)',
                }}>
                    {/* Decorative circle */}
                    <div style={{
                        position: 'absolute',
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        border: '1px solid rgba(255,255,255,0.04)',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    }} />
                    {product.imageUrl ? (
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                position: 'relative',
                                zIndex: 1
                            }}
                        />
                    ) : (
                        <span style={{ position: 'relative', zIndex: 1 }}>{categoryEmoji}</span>
                    )}

                    {/* Stock badge */}
                    <div style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                    }}>
                        <span className={`badge ${product.stock > 10 ? 'badge-jade' : 'badge-ember'}`}>
                            {product.stock > 10 ? 'In stock' : `${product.stock} left`}
                        </span>
                    </div>
                </div>
            </Link>

            {/* Info */}
            <div style={{
                padding: '20px 22px 24px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
            }}>
                {/* Category + Brand */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 9,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'var(--ember)',
                        opacity: 0.8,
                    }}>
                        {product.category}
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>
                    <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 9,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'var(--mist)',
                    }}>
                        {product.brand}
                    </span>
                </div>

                {/* Name */}
                <Link href={`/shop/${product.id}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 18,
                        fontWeight: 700,
                        color: 'var(--cream)',
                        marginBottom: 4,
                        lineHeight: 1.2,
                        letterSpacing: '-0.01em',
                    }}>
                        {product.name}
                    </h3>
                </Link>

                <p style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: 'var(--mist)',
                    letterSpacing: '0.05em',
                    marginBottom: 16,
                }}>
                    {product.packSize}
                </p>

                {/* Tobacco warning */}
                {product.category === 'CIGARETTE' && (
                    <div className="tobacco-warning" style={{ marginBottom: 16 }}>
                        ⚠ Statutory Warning: Smoking is injurious to health
                    </div>
                )}

                {/* Price + Add to Cart */}
                <div style={{
                    marginTop: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <div>
                        <span style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 24,
                            fontWeight: 900,
                            color: 'var(--cream)',
                            letterSpacing: '-0.02em',
                        }}>
                            ৳{product.price}
                        </span>
                    </div>
                    <button
                        onClick={(e) => { e.preventDefault(); addItem(product); }}
                        disabled={product.stock === 0}
                        className="btn-ember"
                        style={{
                            padding: '10px 20px',
                            fontSize: 12,
                            fontFamily: 'var(--font-mono)',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            opacity: product.stock === 0 ? 0.4 : 1,
                        }}
                    >
                        {product.stock === 0 ? 'Sold out' : '+ Add'}
                    </button>
                </div>
            </div>
        </div>
    );
}
