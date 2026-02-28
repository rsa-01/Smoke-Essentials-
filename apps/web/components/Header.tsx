'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '../store/cart';
import { useAuthStore } from '../store/auth';

export default function Header() {
    const { items, openCart } = useCartStore();
    const { user, logout } = useAuthStore();
    const [isMounted, setIsMounted] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <>
            <header className="header-container" style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 100,
                padding: '0 40px',
                height: 72,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(10,10,26,0.6)',
                backdropFilter: 'blur(20px) saturate(1.5)',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}>
                {/* Logo */}
                <Link href="/" style={{
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                }}>
                    <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: 'var(--gradient-ember)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                        boxShadow: '0 0 20px rgba(255,107,53,0.3)',
                    }}>
                        🔥
                    </div>
                    <div>
                        <span style={{
                            fontFamily: 'var(--font-display)',
                            fontWeight: 700,
                            fontSize: 18,
                            color: 'var(--cream)',
                            letterSpacing: '-0.02em',
                        }}>
                            Smoke
                        </span>
                        <span className="desktop-only" style={{
                            fontFamily: 'var(--font-display)',
                            fontWeight: 400,
                            fontStyle: 'italic',
                            fontSize: 18,
                            color: 'var(--ember)',
                            marginLeft: 4,
                        }}>
                            &amp; Essentials
                        </span>
                    </div>
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {/* Navigation */}
                    <nav className="header-nav-links" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                    }}>
                        <Link href="/shop" style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 11,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: 'var(--mist)',
                            textDecoration: 'none',
                            padding: '8px 16px',
                            borderRadius: 60,
                            transition: 'all 0.3s',
                            border: '1px solid transparent',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.color = 'var(--cream)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--mist)'; e.currentTarget.style.borderColor = 'transparent'; }}
                        >
                            Shop
                        </Link>

                        {isMounted && user && (
                            <Link href="/profile" style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 11,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                color: 'var(--mist)',
                                textDecoration: 'none',
                                padding: '8px 16px',
                                borderRadius: 60,
                                transition: 'all 0.3s',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.color = 'var(--cream)'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = 'var(--mist)'; }}
                            >
                                Profile
                            </Link>
                        )}

                        {/* Auth */}
                        {isMounted ? (
                            user ? (
                                <button onClick={logout} style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 11,
                                    letterSpacing: '0.08em',
                                    textTransform: 'uppercase',
                                    color: 'var(--mist)',
                                    background: 'none',
                                    border: 'none',
                                    padding: '8px 16px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--crimson)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--mist)'; }}
                                >
                                    Logout
                                </button>
                            ) : (
                                <Link href="/login" className="btn-ember" style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 11,
                                    letterSpacing: '0.08em',
                                    textTransform: 'uppercase',
                                    padding: '10px 24px',
                                    textDecoration: 'none',
                                }}>
                                    Sign In
                                </Link>
                            )
                        ) : (
                            <div style={{ padding: '10px 24px', width: 85, height: 36 }} /> // Space placeholder
                        )}
                    </nav>

                    {/* Cart */}
                    <button onClick={openCart} style={{
                        position: 'relative',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'var(--cream)',
                        padding: '8px 20px',
                        borderRadius: 60,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'all 0.3s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ember)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                    >
                        Cart
                        {isMounted && itemCount > 0 && (
                            <span style={{
                                background: 'var(--ember)',
                                color: 'white',
                                width: 18,
                                height: 18,
                                borderRadius: '50%',
                                fontSize: 10,
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontFamily: 'var(--font-body)',
                            }}>
                                {itemCount}
                            </span>
                        )}
                    </button>

                    {/* Hamburger Menu Icon */}
                    <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{
                        background: 'transparent', border: 'none', color: 'var(--cream)', fontSize: 24, cursor: 'pointer', width: 40, height: 40, alignItems: 'center', justifyContent: 'center'
                    }}>
                        ☰
                    </button>
                </div>
            </header>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div style={{
                    position: 'fixed',
                    top: 72, left: 0, right: 0, bottom: 0,
                    background: 'rgba(10,10,26,0.95)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 99,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '32px 24px',
                    gap: 24,
                }}>
                    <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--cream)', fontSize: 24, fontWeight: 700, textDecoration: 'none' }}>🏪 Shop</Link>
                    {isMounted && user ? (
                        <>
                            <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--cream)', fontSize: 24, fontWeight: 700, textDecoration: 'none' }}>👤 Profile</Link>
                            <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} style={{ background: 'none', border: 'none', color: 'var(--crimson)', fontSize: 24, fontWeight: 700, cursor: 'pointer', textAlign: 'left', padding: 0 }}>🚪 Logout</button>
                        </>
                    ) : (
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--ember)', fontSize: 24, fontWeight: 700, textDecoration: 'none' }}>🔑 Sign In</Link>
                    )}
                </div>
            )}
        </>
    );
}
