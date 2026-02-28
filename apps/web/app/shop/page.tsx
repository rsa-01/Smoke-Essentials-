'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '../../components/ProductCard';

const categories = ['ALL', 'CIGARETTE', 'CONDOM', 'COMBO', 'OTHER'];
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function ShopContent() {
    const searchParams = useSearchParams();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [category, setCategory] = useState(searchParams.get('category') || 'ALL');
    const [search, setSearch] = useState('');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', '12');
        if (category !== 'ALL') params.set('category', category);
        if (search) params.set('search', search);
        if (priceRange[0] > 0) params.set('priceMin', String(priceRange[0]));
        if (priceRange[1] < 1000) params.set('priceMax', String(priceRange[1]));

        try {
            const res = await fetch(`${API}/products?${params}`);
            const data = await res.json();
            setProducts(data.data?.items || []);
            setTotal(data.data?.totalPages || 1);
        } catch {
            setProducts([]);
        }
        setLoading(false);
    }, [page, category, search, priceRange]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return (
        <div className="section-pad" style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '100px 24px 40px',
        }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 32 }}>
                🛍️ Shop
            </h1>

            <div className="shop-layout" style={{
                display: 'grid',
                gridTemplateColumns: '240px 1fr',
                gap: 32,
            }}>
                {/* Sidebar Filters */}
                <aside className="shop-sidebar" style={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 16,
                    padding: 24,
                    height: 'fit-content',
                    position: 'sticky',
                    top: 88,
                }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Filters</h3>

                    {/* Search */}
                    <div style={{ marginBottom: 24 }}>
                        <label style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 6, display: 'block' }}>
                            Search
                        </label>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search products..."
                            style={{ fontSize: 13 }}
                        />
                    </div>

                    {/* Category */}
                    <div style={{ marginBottom: 24 }}>
                        <label style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 8, display: 'block' }}>
                            Category
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => { setCategory(cat); setPage(1); }}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: 8,
                                        border: 'none',
                                        background: category === cat ? 'rgba(249,115,22,0.15)' : 'transparent',
                                        color: category === cat ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                        fontWeight: category === cat ? 600 : 400,
                                        fontSize: 13,
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {cat === 'ALL' ? '🏪 All Products' :
                                        cat === 'CIGARETTE' ? '🚬 Cigarettes' :
                                            cat === 'CONDOM' ? '📦 Condoms' :
                                                cat === 'COMBO' ? '🎁 Combos' :
                                                    '🛒 Other'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div>
                        <label style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 8, display: 'block' }}>
                            Price Range: ৳{priceRange[0]} - ৳{priceRange[1]}
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="1000"
                            value={priceRange[1]}
                            onChange={(e) => { setPriceRange([priceRange[0], parseInt(e.target.value)]); setPage(1); }}
                            style={{
                                width: '100%',
                                accentColor: 'var(--color-primary)',
                                background: 'transparent',
                                border: 'none',
                                padding: 0,
                            }}
                        />
                    </div>
                </aside>

                {/* Product Grid */}
                <div>
                    {loading ? (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                            gap: 20,
                        }}>
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="skeleton" style={{ height: 340, borderRadius: 16 }} />
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '80px 24px',
                            color: 'var(--color-text-secondary)',
                        }}>
                            <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>🔍</span>
                            <p style={{ fontSize: 18 }}>No products found</p>
                            <p style={{ fontSize: 14, marginTop: 8 }}>Try adjusting your filters</p>
                        </div>
                    ) : (
                        <>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                                gap: 20,
                            }}>
                                {products.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {total > 1 && (
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: 8,
                                    marginTop: 40,
                                }}>
                                    {[...Array(total)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPage(i + 1)}
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: 10,
                                                border: page === i + 1 ? 'none' : '1px solid var(--color-border)',
                                                background: page === i + 1 ? 'var(--gradient-primary)' : 'transparent',
                                                color: 'var(--color-text)',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ShopPage() {
    return (
        <Suspense fallback={<div style={{ padding: '80px', textAlign: 'center', color: 'white' }}>Loading Shop...</div>}>
            <ShopContent />
        </Suspense>
    );
}
