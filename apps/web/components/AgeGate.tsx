'use client';

import { useState, useEffect } from 'react';

export default function AgeGate() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const verified = localStorage.getItem('age-verified');
        if (!verified) setShow(true);
    }, []);

    const accept = () => { localStorage.setItem('age-verified', 'true'); setShow(false); };
    const decline = () => { window.location.href = 'https://google.com'; };

    if (!show) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(10,10,26,0.95)',
            backdropFilter: 'blur(30px)',
        }}>
            <div style={{
                maxWidth: 480,
                width: '100%',
                padding: '56px 48px',
                textAlign: 'center',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 'var(--radius-xl)',
                backdropFilter: 'blur(40px)',
                animation: 'fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            }}>
                {/* Icon */}
                <div style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'rgba(255,107,53,0.1)',
                    border: '1px solid rgba(255,107,53,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 36,
                    margin: '0 auto 28px',
                }}>
                    🔞
                </div>

                <h2 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 28,
                    fontWeight: 700,
                    marginBottom: 12,
                    letterSpacing: '-0.02em',
                }}>
                    Age Verification <span className="text-serif-italic" style={{ color: 'var(--ember)' }}>Required</span>
                </h2>

                <p style={{
                    color: 'var(--mist)',
                    fontSize: 15,
                    lineHeight: 1.7,
                    fontWeight: 300,
                    marginBottom: 8,
                }}>
                    This website sells tobacco and adult products.
                </p>
                <p style={{
                    fontSize: 14,
                    marginBottom: 36,
                }}>
                    You must be at least <span style={{ color: 'var(--ember)', fontWeight: 700 }}>18 years of age</span> to access this website.
                </p>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={accept} className="btn-ember" style={{
                        flex: 1,
                        padding: '16px',
                        fontSize: 14,
                    }}>
                        I am 18 or older
                    </button>
                    <button onClick={decline} className="btn-ghost" style={{
                        flex: 1,
                        padding: '16px',
                        fontSize: 14,
                    }}>
                        I am under 18
                    </button>
                </div>

                <p style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    letterSpacing: '0.05em',
                    color: 'var(--mist)',
                    opacity: 0.5,
                    marginTop: 24,
                }}>
                    By entering, you agree to our Terms & Conditions and confirm you are of legal age.
                </p>
            </div>
        </div>
    );
}
