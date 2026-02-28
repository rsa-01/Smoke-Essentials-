'use client';

import { motion } from 'framer-motion';

/**
 * Animated smoke wisps that rise from the cigarette tip.
 * Uses CSS keyframes for organic, looping smoke animation.
 */

const smokeKeyframes = `
@keyframes smokeRise1 {
  0%   { transform: translate(0, 0) scale(0.4) rotate(0deg); opacity: 0; }
  15%  { opacity: 0.7; }
  50%  { transform: translate(-14px, -70px) scale(1.2) rotate(-15deg); opacity: 0.4; }
  100% { transform: translate(-24px, -150px) scale(2.2) rotate(-25deg); opacity: 0; }
}
@keyframes smokeRise2 {
  0%   { transform: translate(0, 0) scale(0.3) rotate(0deg); opacity: 0; }
  20%  { opacity: 0.55; }
  55%  { transform: translate(10px, -80px) scale(1.3) rotate(12deg); opacity: 0.35; }
  100% { transform: translate(18px, -160px) scale(2.4) rotate(20deg); opacity: 0; }
}
@keyframes smokeRise3 {
  0%   { transform: translate(0, 0) scale(0.35) rotate(0deg); opacity: 0; }
  10%  { opacity: 0.45; }
  45%  { transform: translate(-8px, -55px) scale(1) rotate(-8deg); opacity: 0.28; }
  100% { transform: translate(-14px, -130px) scale(1.8) rotate(-18deg); opacity: 0; }
}
@keyframes smokeRise4 {
  0%   { transform: translate(0, 0) scale(0.25) rotate(0deg); opacity: 0; }
  18%  { opacity: 0.4; }
  50%  { transform: translate(6px, -60px) scale(0.9) rotate(10deg); opacity: 0.22; }
  100% { transform: translate(14px, -125px) scale(1.6) rotate(15deg); opacity: 0; }
}
@keyframes emberGlow {
  0%, 100% { box-shadow: 0 0 8px 3px rgba(255,107,53,0.8), 0 0 16px 6px rgba(255,60,20,0.35); }
  50%      { box-shadow: 0 0 14px 6px rgba(255,107,53,1), 0 0 28px 10px rgba(255,60,20,0.5); }
}
@keyframes emberPulse {
  0%, 100% { opacity: 0.7; }
  50%      { opacity: 1; }
}
`;

interface SmokeWispProps {
    style: React.CSSProperties;
    animation: string;
    size: number;
}

function SmokeWisp({ style, animation, size }: SmokeWispProps) {
    return (
        <div
            style={{
                position: 'absolute',
                width: size,
                height: size,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(220,220,230,0.6) 0%, rgba(200,200,215,0.2) 40%, transparent 70%)',
                filter: 'blur(5px)',
                animation,
                pointerEvents: 'none',
                ...style,
            }}
        />
    );
}

export default function SmokingGirlHero() {
    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: smokeKeyframes }} />

            <motion.div
                initial={{ opacity: 0, x: 60, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{
                    position: 'relative',
                    zIndex: 5,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                {/* The illustration — using native img for reliability */}
                <div style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: 500,
                }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/smoking-girl.jpg"
                        alt="Stylish illustration"
                        style={{
                            width: '100%',
                            height: 'auto',
                            borderRadius: '20px',
                            objectFit: 'cover',
                            display: 'block',
                            filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.6))',
                        }}
                    />

                    {/* Gradient fade at the bottom to blend into dark background */}
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '35%',
                        borderRadius: '0 0 20px 20px',
                        background: 'linear-gradient(to top, var(--coal, #0a0a1a) 0%, rgba(10,10,26,0.6) 50%, transparent 100%)',
                        pointerEvents: 'none',
                    }} />

                    {/* Gradient fade on the left edge to blend with the text side */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        width: '25%',
                        borderRadius: '20px 0 0 20px',
                        background: 'linear-gradient(to right, var(--coal, #0a0a1a) 0%, transparent 100%)',
                        pointerEvents: 'none',
                        opacity: 0.5,
                    }} />

                    {/* Smoke wisps — positioned at the cigarette tip area */}
                    {/* Cigarette tip is roughly top-center-left of the image */}
                    <div style={{
                        position: 'absolute',
                        top: '32%',
                        left: '28%',
                        width: 0,
                        height: 0,
                    }}>
                        {/* Ember glow at cigarette tip */}
                        <div style={{
                            position: 'absolute',
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: '#ff6b35',
                            animation: 'emberGlow 2s ease-in-out infinite, emberPulse 1.5s ease-in-out infinite',
                            zIndex: 2,
                        }} />

                        {/* Smoke wisp 1 — slow, large, drifts left */}
                        <SmokeWisp
                            size={22}
                            animation="smokeRise1 3.5s ease-out infinite"
                            style={{ top: -6, left: -4 }}
                        />

                        {/* Smoke wisp 2 — medium speed, drifts right */}
                        <SmokeWisp
                            size={16}
                            animation="smokeRise2 4s ease-out 0.8s infinite"
                            style={{ top: -3, left: 3 }}
                        />

                        {/* Smoke wisp 3 — fast, subtle, drifts left */}
                        <SmokeWisp
                            size={12}
                            animation="smokeRise3 3s ease-out 1.6s infinite"
                            style={{ top: -4, left: 0 }}
                        />

                        {/* Smoke wisp 4 — slowest, gentlest */}
                        <SmokeWisp
                            size={24}
                            animation="smokeRise4 4.5s ease-out 2.4s infinite"
                            style={{ top: -7, left: -2 }}
                        />
                    </div>

                    {/* Subtle warm ambient glow behind the figure */}
                    <div style={{
                        position: 'absolute',
                        top: '35%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '80%',
                        height: '60%',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(255,107,53,0.08) 0%, transparent 70%)',
                        filter: 'blur(40px)',
                        pointerEvents: 'none',
                        zIndex: -1,
                    }} />
                </div>
            </motion.div>
        </>
    );
}
