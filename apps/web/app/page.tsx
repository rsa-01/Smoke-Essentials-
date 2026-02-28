'use client';

import { useEffect, useState, Suspense, useRef, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, useScroll, useTransform } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import {
  ScrollReveal,
  Parallax,
  WordReveal,
  ScaleOnScroll,
  AnimatedCounter,
  StaggerContainer,
  StaggerItem,
} from '../components/ScrollAnimations';


const HeroScene = dynamic(() => import('../components/HeroScene'), { ssr: false });
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.7], [1, 0.92]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Ensure video autoplays — programmatic play() handles browser restrictions
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tryPlay = () => {
      video.play().catch(() => {
        // If autoplay blocked, play on first user interaction
        const handler = () => {
          video.play().catch(() => { });
          document.removeEventListener('click', handler);
          document.removeEventListener('touchstart', handler);
          document.removeEventListener('scroll', handler);
        };
        document.addEventListener('click', handler, { once: true });
        document.addEventListener('touchstart', handler, { once: true });
        document.addEventListener('scroll', handler, { once: true });
      });
    };

    // Small delay to ensure video element is fully mounted
    const timer = setTimeout(tryPlay, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetch(`${API}/products?limit=6`)
      .then(res => res.json())
      .then(data => { setProducts(data.data?.items || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>

      {/* ═══════════════════════════════════════════
          BEAT 1: THE HOOK — Full viewport, cinematic  
          ═══════════════════════════════════════════ */}
      <motion.section
        ref={heroRef}
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          opacity: heroOpacity,
          scale: heroScale,
        }}
      >
        {/* 3D Background — Parallax layer (0.2x speed) */}
        <motion.div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          opacity: 0.7,
          y: heroY,
        }}>
          <Suspense fallback={null}>
            <HeroScene />
          </Suspense>
        </motion.div>

        {/* Gradient overlays */}
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          background: 'linear-gradient(180deg, rgba(10,10,26,0.3) 0%, rgba(10,10,26,0.7) 70%, var(--coal) 100%)',
          pointerEvents: 'none',
        }} />

        {/* Hero Video — Right side, all edges softly faded to blend into hero */}
        <div className="hero-video-container" style={{
          position: 'absolute',
          top: 0,
          right: '-5%',
          bottom: 0,
          width: '70%',
          zIndex: 2,
          pointerEvents: 'none',
          overflow: 'hidden',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 70% at 50% 50%, black 18%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.12) 58%, transparent 72%)',
          maskImage: 'radial-gradient(ellipse 75% 70% at 50% 50%, black 18%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.12) 58%, transparent 72%)',
        }}>
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'center center',
              display: 'block',
            }}
          >
            <source src="/smoke-video.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Hero Content — Foreground text */}
        <div className="hero-content" style={{
          position: 'relative',
          zIndex: 3,
          maxWidth: 1200,
          margin: '0 auto',
          padding: '140px 40px 80px',
          width: '100%',
        }}>
          {/* Status Badge */}
          <ScrollReveal delay={0.1}>
            <span className="badge badge-jade" style={{ marginBottom: 32, display: 'inline-flex' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--jade)', display: 'inline-block' }} />
              Live in Dhaka · 30 min delivery
            </span>
          </ScrollReveal>

          {/* Headline — word-by-word reveal */}
          <ScrollReveal delay={0.2}>
            <h1 className="text-display" style={{ maxWidth: 600 }}>
              Your late-night
              <br />
              <span className="text-serif-italic" style={{ color: 'var(--ember)' }}>essentials,</span>
              <br />
              delivered.
            </h1>
          </ScrollReveal>

          {/* Subtitle */}
          <ScrollReveal delay={0.4}>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 18,
              color: 'var(--mist)',
              maxWidth: 480,
              marginTop: 28,
              lineHeight: 1.7,
              fontWeight: 300,
            }}>
              Cigarettes, condoms, and everyday essentials.
              Discreet packaging. No judgment. Just fast delivery.
            </p>
          </ScrollReveal>

          {/* CTA Buttons */}
          <ScrollReveal delay={0.5}>
            <div style={{ display: 'flex', gap: 16, marginTop: 40, alignItems: 'center' }}>
              <Link href="/shop" className="btn-ember" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Order Now <span style={{ fontSize: 18 }}>→</span>
              </Link>
              <Link href="/shop?category=COMBO" className="btn-ghost" style={{ textDecoration: 'none' }}>
                View combos
              </Link>
            </div>
          </ScrollReveal>

          {/* Animated Stats */}
          <ScrollReveal delay={0.7}>
            <div className="stats-container" style={{
              display: 'flex',
              gap: 48,
              marginTop: 64,
              paddingTop: 32,
              borderTop: '1px solid rgba(255,255,255,0.05)',
              maxWidth: 500,
            }}>
              {[
                { value: 30, label: 'min delivery', suffix: '' },
                { value: 500, label: 'orders served', suffix: '+' },
                { value: 4.9, label: 'avg rating', suffix: '★' },
              ].map((stat, i) => (
                <div key={i}>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 32,
                    fontWeight: 900,
                    color: 'var(--cream)',
                    letterSpacing: '-0.03em',
                  }}>
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </span>
                  <p style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--mist)',
                    marginTop: 4,
                  }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>

        {/* Scroll hint */}
        <motion.div
          style={{
            position: 'absolute',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            textAlign: 'center',
          }}
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--mist)',
            opacity: 0.5,
          }}>
            Scroll to explore
          </span>
          <div style={{ marginTop: 8, fontSize: 18, opacity: 0.4 }}>↓</div>
        </motion.div>
      </motion.section>


      {/* ═══════════════════════════════════════════
          BEAT 2: CONTEXT — "How it works" sticky section
          ═══════════════════════════════════════════ */}
      <section className="section-pad" style={{
        position: 'relative',
        padding: '120px 40px',
        maxWidth: 1200,
        margin: '0 auto',
        zIndex: 2,
      }}>
        <ScrollReveal>
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <span className="badge badge-ember" style={{ marginBottom: 16, display: 'inline-flex' }}>How it works</span>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 48,
              fontWeight: 700,
              marginTop: 12,
            }}>
              <WordReveal text="Three steps to your door." />
            </h2>
          </div>
        </ScrollReveal>

        {/* Steps with stagger */}
        <StaggerContainer
          staggerDelay={0.15}
          className="grid-3"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 32,
          }}
        >
          {[
            {
              step: '01',
              emoji: '🛒',
              title: 'Browse & Add',
              desc: 'Choose from our curated selection of cigarettes, condoms, and essentials. Add to cart in seconds.',
            },
            {
              step: '02',
              emoji: '📍',
              title: 'Set Location',
              desc: 'Drop your pin or type your address. We cover all major areas of Dhaka with pinpoint accuracy.',
            },
            {
              step: '03',
              emoji: '⚡',
              title: 'Get It Fast',
              desc: 'Our riders pick up and deliver within 30 minutes. Track in real-time. Discreet packaging guaranteed.',
            },
          ].map((item) => (
            <StaggerItem key={item.step}>
              <div className="glass-card" style={{
                padding: '40px 32px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Step number — large background element */}
                <div style={{
                  position: 'absolute',
                  top: -10,
                  right: 10,
                  fontFamily: 'var(--font-display)',
                  fontSize: 120,
                  fontWeight: 900,
                  color: 'rgba(255,107,53,0.04)',
                  lineHeight: 1,
                  pointerEvents: 'none',
                }}>
                  {item.step}
                </div>

                <span style={{ fontSize: 48, display: 'block', marginBottom: 20 }}>{item.emoji}</span>
                <span className="badge badge-ember" style={{ marginBottom: 16, display: 'inline-flex' }}>
                  Step {item.step}
                </span>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 24,
                  fontWeight: 700,
                  marginBottom: 12,
                }}>
                  {item.title}
                </h3>
                <p style={{
                  color: 'var(--mist)',
                  fontSize: 14,
                  lineHeight: 1.7,
                  fontWeight: 300,
                }}>
                  {item.desc}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>


      {/* ═══════════════════════════════════════════
          BEAT 3: JOURNEY — Categories with parallax
          ═══════════════════════════════════════════ */}
      <section className="section-pad" style={{
        position: 'relative',
        padding: '40px 40px 120px',
        maxWidth: 1200,
        margin: '0 auto',
        zIndex: 2,
      }}>
        <ScrollReveal>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span className="badge badge-ember" style={{ marginBottom: 16, display: 'inline-flex' }}>Categories</span>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 40,
              fontWeight: 700,
              marginTop: 12,
            }}>
              What are you <span className="text-serif-italic" style={{ color: 'var(--ember)' }}>looking for?</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid-4" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
        }}>
          {[
            { iconSrc: '/images/cigarette_3d.png', title: 'Cigarettes', desc: 'Premium brands', color: 'rgba(255,107,53,0.08)', cat: 'CIGARETTE', speed: 0.1 },
            { iconSrc: '/images/package_3d.png', title: 'Condoms', desc: 'All types & sizes', color: 'rgba(0,212,170,0.08)', cat: 'CONDOM', speed: 0.2 },
            { iconSrc: '/images/wrapped_present_3d.png', title: 'Combos', desc: 'Save more', color: 'rgba(139,92,246,0.08)', cat: 'COMBO', speed: 0.15 },
            { iconSrc: '/images/shopping_cart_3d.png', title: 'All Items', desc: 'Browse everything', color: 'rgba(255,255,255,0.03)', cat: 'ALL', speed: 0.05 },
          ].map((cat, i) => (
            <Parallax key={cat.cat} speed={cat.speed}>
              <ScrollReveal delay={i * 0.1}>
                <Link
                  href={cat.cat === 'ALL' ? '/shop' : `/shop?category=${cat.cat}`}
                  className="glass-card"
                  style={{
                    textDecoration: 'none',
                    padding: '32px 24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: cat.color,
                    display: 'block',
                  }}
                >
                  <img src={cat.iconSrc} alt={cat.title} style={{ width: 56, height: 56, display: 'block', margin: '0 auto 16px', objectFit: 'contain' }} />
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 20,
                    fontWeight: 700,
                    color: 'var(--cream)',
                    marginBottom: 4,
                  }}>
                    {cat.title}
                  </h3>
                  <p style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--mist)',
                  }}>
                    {cat.desc}
                  </p>
                </Link>
              </ScrollReveal>
            </Parallax>
          ))}
        </div>
      </section>


      {/* ═══════════════════════════════════════════
          BEAT 4: CLIMAX — Featured products (dramatic reveal)
          ═══════════════════════════════════════════ */}
      <section className="section-pad" style={{
        position: 'relative',
        padding: '0 40px 120px',
        maxWidth: 1200,
        margin: '0 auto',
        zIndex: 2,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
          <ScrollReveal>
            <div>
              <span className="badge badge-ember" style={{ marginBottom: 12, display: 'inline-flex' }}>Featured</span>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 36,
                fontWeight: 700,
              }}>
                Popular <span className="text-serif-italic" style={{ color: 'var(--ember)' }}>picks</span>
              </h2>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <Link href="/shop" style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--ember)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              View all →
            </Link>
          </ScrollReveal>
        </div>

        {loading ? (
          <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 360, borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        ) : (
          <StaggerContainer
            staggerDelay={0.08}
            className="grid-3"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 20,
            }}
          >
            {products.map((product) => (
              <StaggerItem key={product.id}>
                <ScaleOnScroll>
                  <ProductCard product={product} />
                </ScaleOnScroll>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </section>


      {/* ═══════════════════════════════════════════
          BEAT 5: RESOLUTION — Delivery promise (CTA)
          ═══════════════════════════════════════════ */}
      <section className="section-pad" style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 40px 60px',
        position: 'relative',
        zIndex: 2,
      }}>
        <ScaleOnScroll>
          <div className="glass-card delivery-promise-grid" style={{
            padding: '60px 48px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 40,
            background: 'rgba(255,107,53,0.03)',
            borderColor: 'rgba(255,107,53,0.08)',
          }}>
            {[
              { icon: '⚡', title: '30 Min Delivery', desc: 'Lightning-fast delivery across Dhaka. Track your order in real-time.' },
              { icon: '📦', title: 'Discreet Packaging', desc: 'Plain packaging with no product labels. Your privacy is our priority.' },
              { icon: '🔒', title: '100% Secure', desc: 'End-to-end encrypted. Cash on delivery available.' },
            ].map((feature, i) => (
              <ScrollReveal key={i} delay={i * 0.15}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: 36, display: 'block', marginBottom: 16 }}>{feature.icon}</span>
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 22,
                    fontWeight: 700,
                    marginBottom: 8,
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{
                    color: 'var(--mist)',
                    fontSize: 14,
                    lineHeight: 1.7,
                    fontWeight: 300,
                  }}>
                    {feature.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </ScaleOnScroll>
      </section>

      {/* ═══ Final CTA ═══ */}
      <section className="section-pad" style={{
        padding: '80px 40px 120px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 2,
      }}>
        <ScrollReveal>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 48,
            fontWeight: 700,
            marginBottom: 16,
          }}>
            Ready to <span className="text-serif-italic" style={{ color: 'var(--ember)' }}>order?</span>
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <p style={{
            color: 'var(--mist)',
            fontSize: 18,
            fontWeight: 300,
            maxWidth: 500,
            margin: '0 auto 32px',
            lineHeight: 1.7,
          }}>
            Get your essentials delivered in 30 minutes.
            No minimum order. Cash on delivery.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.3}>
          <Link href="/shop" className="btn-ember" style={{
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '18px 48px',
            fontSize: 16,
          }}>
            Start Shopping <span style={{ fontSize: 20 }}>→</span>
          </Link>
        </ScrollReveal>
      </section>
    </div>
  );
}
