'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Torus, Box } from '@react-three/drei';
import * as THREE from 'three';

function EmberSphere() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.elapsedTime * 0.15;
            meshRef.current.rotation.z = state.clock.elapsedTime * 0.1;
        }
    });

    return (
        <Float speed={1.5} rotationIntensity={0.3} floatIntensity={1.2}>
            <Sphere ref={meshRef} args={[1.2, 64, 64]} position={[-2.5, 0.5, -2]}>
                <MeshDistortMaterial
                    color="#ff6b35"
                    emissive="#ff2d55"
                    emissiveIntensity={0.3}
                    roughness={0.2}
                    metalness={0.8}
                    distort={0.3}
                    speed={2}
                />
            </Sphere>
        </Float>
    );
}

function SmokeTorus() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
        }
    });

    return (
        <Float speed={1} rotationIntensity={0.5} floatIntensity={0.8}>
            <Torus ref={meshRef} args={[1.8, 0.15, 32, 100]} position={[-2, -0.5, -2]}>
                <meshStandardMaterial
                    color="#16213e"
                    emissive="#0f3460"
                    emissiveIntensity={0.5}
                    roughness={0.3}
                    metalness={0.9}
                    transparent
                    opacity={0.6}
                />
            </Torus>
        </Float>
    );
}

function FloatingCube() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.8} floatIntensity={1}>
            <Box ref={meshRef} args={[0.6, 0.6, 0.6]} position={[-3, 1.5, -3]}>
                <meshStandardMaterial
                    color="#ff8c42"
                    emissive="#e55100"
                    emissiveIntensity={0.2}
                    roughness={0.4}
                    metalness={0.7}
                    transparent
                    opacity={0.5}
                />
            </Box>
        </Float>
    );
}

function Particles() {
    const count = 80;
    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 15;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
        }
        return pos;
    }, []);

    const ref = useRef<THREE.Points>(null);

    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y = state.clock.elapsedTime * 0.02;
            ref.current.rotation.x = state.clock.elapsedTime * 0.01;
        }
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    args={[positions, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.03}
                color="#ff6b35"
                transparent
                opacity={0.6}
                sizeAttenuation
            />
        </points>
    );
}

export default function HeroScene() {
    return (
        <Canvas
            className="three-canvas"
            camera={{ position: [0, 0, 6], fov: 50 }}
            gl={{ antialias: true, alpha: true }}
            style={{ background: 'transparent' }}
        >
            {/* Lighting */}
            <ambientLight intensity={0.3} />
            <pointLight position={[5, 5, 5]} intensity={1} color="#ff6b35" />
            <pointLight position={[-5, 3, 3]} intensity={0.5} color="#0f3460" />
            <pointLight position={[0, -3, 5]} intensity={0.3} color="#ff2d55" />

            {/* 3D Objects */}
            <EmberSphere />
            <SmokeTorus />
            <FloatingCube />
            <Particles />

            {/* A subtle fog for depth */}
            <fog attach="fog" args={['#0a0a1a', 5, 18]} />
        </Canvas>
    );
}
