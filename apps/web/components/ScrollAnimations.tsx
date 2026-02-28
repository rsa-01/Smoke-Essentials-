'use client';

import { useRef, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';

/* ═══════════════════════════════════════════
   SCROLL-DRIVEN ANIMATION COMPONENTS
   Following the scroll-experience skill patterns:
   - Scroll-triggered reveals
   - Parallax depth layers
   - Staggered entries
   - Sticky sections
   ═══════════════════════════════════════════ */

// ─── Fade in + slide up when element enters viewport ───
export function ScrollReveal({
    children,
    delay = 0,
    direction = 'up',
    className = '',
    style = {},
}: {
    children: React.ReactNode;
    delay?: number;
    direction?: 'up' | 'down' | 'left' | 'right';
    className?: string;
    style?: React.CSSProperties;
}) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });

    const directionMap = {
        up: { y: 60, x: 0 },
        down: { y: -60, x: 0 },
        left: { y: 0, x: 60 },
        right: { y: 0, x: -60 },
    };

    const offset = directionMap[direction];

    return (
        <motion.div
            ref={ref}
            className={className}
            style={style}
            initial={{ opacity: 0, y: offset.y, x: offset.x }}
            animate={isInView ? { opacity: 1, y: 0, x: 0 } : { opacity: 0, y: offset.y, x: offset.x }}
            transition={{
                duration: 0.8,
                delay,
                ease: [0.16, 1, 0.3, 1],
            }}
        >
            {children}
        </motion.div>
    );
}

// ─── Parallax element — moves at different speed than scroll ───
export function Parallax({
    children,
    speed = 0.5,
    className = '',
    style = {},
}: {
    children: React.ReactNode;
    speed?: number;
    className?: string;
    style?: React.CSSProperties;
}) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start'],
    });

    const y = useTransform(scrollYProgress, [0, 1], [0, speed * -200]);

    return (
        <motion.div ref={ref} className={className} style={{ ...style, y }}>
            {children}
        </motion.div>
    );
}

// ─── Text that reveals word by word on scroll ───
export function WordReveal({
    text,
    className = '',
    style = {},
}: {
    text: string;
    className?: string;
    style?: React.CSSProperties;
}) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-40px' });
    const words = text.split(' ');

    return (
        <span ref={ref} className={className} style={{ display: 'inline', ...style }}>
            {words.map((word, i) => (
                <motion.span
                    key={i}
                    style={{ display: 'inline-block', marginRight: '0.3em' }}
                    initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
                    animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
                    transition={{
                        duration: 0.5,
                        delay: i * 0.05,
                        ease: [0.16, 1, 0.3, 1],
                    }}
                >
                    {word}
                </motion.span>
            ))}
        </span>
    );
}

// ─── Horizontal scroll progress indicator ───
export function ScrollProgress() {
    const { scrollYProgress } = useScroll();

    return (
        <motion.div
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                height: 3,
                background: 'var(--gradient-ember)',
                transformOrigin: '0%',
                scaleX: scrollYProgress,
                zIndex: 999,
            }}
        />
    );
}

// ─── Scale up from small as it scrolls into view ───
export function ScaleOnScroll({
    children,
    className = '',
    style = {},
}: {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start'],
    });

    const scale = useTransform(scrollYProgress, [0, 0.5], [0.85, 1]);
    const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

    return (
        <motion.div ref={ref} className={className} style={{ ...style, scale, opacity }}>
            {children}
        </motion.div>
    );
}

// ─── Counter that animates from 0 when in view ───
export function AnimatedCounter({
    target,
    suffix = '',
    style = {},
}: {
    target: number;
    suffix?: string;
    style?: React.CSSProperties;
}) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
        <motion.span
            ref={ref}
            style={style}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
        >
            {isInView ? (
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <CountUp target={target} />
                    {suffix}
                </motion.span>
            ) : (
                '0'
            )}
        </motion.span>
    );
}

function CountUp({ target }: { target: number }) {
    const nodeRef = useRef<HTMLSpanElement>(null);
    const startRef = useRef<number | null>(null);

    useEffect(() => {
        let rafId: number;
        const format = (val: number) =>
            Number.isInteger(target) ? Math.round(val).toString() : val.toFixed(1);

        const animate = (timestamp: number) => {
            if (!startRef.current) startRef.current = timestamp;
            const progress = Math.min((timestamp - startRef.current) / 2000, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = eased * target;

            if (nodeRef.current) {
                nodeRef.current.textContent = format(current);
            }

            if (progress < 1) {
                rafId = requestAnimationFrame(animate);
            }
        };

        rafId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafId);
    }, [target]);

    return <span ref={nodeRef}>0</span>;
}

// ─── Stagger children with scroll-triggered animation ───
export function StaggerContainer({
    children,
    staggerDelay = 0.1,
    className = '',
    style = {},
}: {
    children: React.ReactNode;
    staggerDelay?: number;
    className?: string;
    style?: React.CSSProperties;
}) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-60px' });

    return (
        <motion.div
            ref={ref}
            className={className}
            style={style}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={{
                hidden: {},
                visible: { transition: { staggerChildren: staggerDelay } },
            }}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({
    children,
    className = '',
    style = {},
}: {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}) {
    return (
        <motion.div
            className={className}
            style={style}
            variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
            }}
        >
            {children}
        </motion.div>
    );
}
