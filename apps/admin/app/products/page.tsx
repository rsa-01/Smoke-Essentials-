'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminApi } from '../../lib/api';

interface Product {
    id: string;
    name: string;
    brand: string;
    category: string;
    price: number;
    stock: number;
    isActive: boolean;
}

export default function ProductsPage() {
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchProducts = async (t: string) => {
            setLoading(true);
            try {
                const res = await adminApi<{ data?: { items?: Product[], totalPages?: number } }>(`/products?page=${page}&limit=20`, { token: t });
                setProducts(res.data?.items || []);
                setTotalPages(res.data?.totalPages || 1);
            } catch { }
            setLoading(false);
        };

        const t = localStorage.getItem('admin-token');
        if (!t) { router.replace('/login'); return; }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setToken(t);
        fetchProducts(t);
    }, [router, page]);

    const deleteProduct = async (id: string) => {
        if (!confirm('Delete this product?')) return;
        try {
            await adminApi(`/products/${id}`, { method: 'DELETE', token: token! });
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch { }
    };

    const navLinks = [
        { label: '📊 Dashboard', href: '/dashboard' },
        { label: '📦 Products', href: '/products', active: true },
        { label: '🛒 Orders', href: '/orders' },
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
                    <h1 style={{ fontSize: 28, fontWeight: 800 }}>📦 Products</h1>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Brand</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id}>
                                    <td style={{ fontWeight: 600 }}>{product.name}</td>
                                    <td style={{ color: 'var(--color-text-secondary)' }}>{product.brand}</td>
                                    <td>
                                        <span style={{
                                            padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                                            background: 'rgba(249,115,22,0.1)', color: 'var(--color-primary)',
                                        }}>
                                            {product.category}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 600 }}>৳{product.price}</td>
                                    <td>
                                        <span style={{
                                            color: product.stock > 10 ? 'var(--color-success)' : product.stock > 0 ? 'var(--color-warning)' : 'var(--color-danger)',
                                        }}>
                                            {product.stock}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{
                                            width: 8, height: 8, borderRadius: '50%', display: 'inline-block',
                                            background: product.isActive ? 'var(--color-success)' : 'var(--color-danger)',
                                        }} />
                                    </td>
                                    <td>
                                        <button onClick={() => deleteProduct(product.id)} style={{
                                            background: 'rgba(239,68,68,0.1)', border: 'none', color: 'var(--color-danger)',
                                            padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12,
                                        }}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && !loading && (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--color-text-secondary)' }}>No products</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
                        {[...Array(totalPages)].map((_, i) => (
                            <button key={i} onClick={() => setPage(i + 1)} style={{
                                width: 36, height: 36, borderRadius: 8,
                                border: page === i + 1 ? 'none' : '1px solid var(--color-border)',
                                background: page === i + 1 ? 'var(--gradient-primary)' : 'transparent',
                                color: 'white', fontWeight: 600, cursor: 'pointer',
                            }}>
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
