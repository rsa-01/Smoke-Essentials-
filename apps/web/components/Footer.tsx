'use client';

import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="section-pad" style={{
            position: 'relative',
            zIndex: 2,
            borderTop: '1px solid rgba(255,255,255,0.04)',
            padding: '60px 40px 40px',
            background: 'rgba(10,10,26,0.8)',
            backdropFilter: 'blur(20px)',
        }}>
            <div className="footer-grid" style={{
                maxWidth: 1200,
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                gap: 48,
                marginBottom: 48,
            }}>
                {/* Brand */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <span style={{ fontSize: 24 }}>🔥</span>
                        <span style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 20,
                            fontWeight: 700,
                        }}>
                            Smoke <span className="text-serif-italic" style={{ color: 'var(--ember)' }}>&amp; Essentials</span>
                        </span>
                    </div>
                    <p style={{
                        color: 'var(--mist)',
                        fontSize: 14,
                        lineHeight: 1.8,
                        fontWeight: 300,
                        maxWidth: 320,
                    }}>
                        Dhaka&apos;s fastest delivery service for cigarettes, condoms, and everyday essentials.
                        Discreet, reliable, always available.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'var(--ember)',
                        marginBottom: 20,
                    }}>
                        Navigate
                    </h4>
                    {['Shop', 'Login', 'Signup', 'Profile'].map(link => (
                        <Link key={link} href={`/${link.toLowerCase()}`} style={{
                            display: 'block',
                            color: 'var(--mist)',
                            textDecoration: 'none',
                            fontSize: 14,
                            padding: '6px 0',
                            transition: 'color 0.2s',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.color = 'var(--cream)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--mist)'; }}
                        >
                            {link}
                        </Link>
                    ))}
                </div>

                {/* Legal */}
                <div>
                    <h4 style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'var(--ember)',
                        marginBottom: 20,
                    }}>
                        Legal
                    </h4>
                    {['Terms & Conditions', 'Privacy Policy', 'Refund Policy'].map(link => (
                        <p key={link} style={{
                            color: 'var(--mist)',
                            fontSize: 14,
                            padding: '6px 0',
                        }}>
                            {link}
                        </p>
                    ))}
                </div>

                {/* Contact */}
                <div>
                    <h4 style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'var(--ember)',
                        marginBottom: 20,
                    }}>
                        Contact
                    </h4>
                    <p style={{ color: 'var(--mist)', fontSize: 14, padding: '6px 0' }}>📧 support@smokeessentials.com</p>
                    <p style={{ color: 'var(--mist)', fontSize: 14, padding: '6px 0' }}>📱 +880 1700-000-000</p>
                    <p style={{ color: 'var(--mist)', fontSize: 14, padding: '6px 0' }}>📍 Dhaka, Bangladesh</p>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="divider" style={{ marginBottom: 24 }} />
            <div className="footer-bottom" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <p style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.05em',
                    color: 'var(--mist)',
                    opacity: 0.6,
                }}>
                    © 2026 Smoke &amp; Essentials. All rights reserved.
                </p>
                <div className="tobacco-warning" style={{ opacity: 0.8 }}>
                    ⚠ Tobacco products are sold to adults (18+) only
                </div>
            </div>
        </footer>
    );
}
