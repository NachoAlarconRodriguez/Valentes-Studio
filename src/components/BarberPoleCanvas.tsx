'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// --- SOLID 3D MODEL COMPONENT ---

function BarberPoleModel() {
  const innerRef = useRef<THREE.Mesh>(null);

  // Generate a seamless, high-fidelity diagonal black, white, and gold texture
  const texture = useMemo(() => {
    if (typeof window === 'undefined') return null;
    
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Fill background with black
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, 512, 512);

    // Draw diagonal bands
    // Each repeating cycle has a width of 128 (4 cycles fit in 512)
    // Within 128:
    // - 0 to 32: Black background
    // - 32 to 64: White band
    // - 64 to 96: Black background
    // - 96 to 112: Gold band
    // - 112 to 128: Black background
    const step = 128;
    for (let i = -4; i < 8; i++) {
      const startX = i * step;

      const drawBand = (offsetStart: number, width: number, color: string) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        // Since we shift left by 512px at Y=512, the slope is 1 (45 degrees)
        // This makes the diagonal pattern seamless and tileable on both axes.
        ctx.moveTo(startX + offsetStart, 0);
        ctx.lineTo(startX + offsetStart + width, 0);
        ctx.lineTo(startX + offsetStart + width - 512, 512);
        ctx.lineTo(startX + offsetStart - 512, 512);
        ctx.closePath();
        ctx.fill();
      };

      // Draw White band
      drawBand(32, 32, '#fcfcfc');

      // Draw Gold band
      drawBand(96, 16, '#D4AF37');
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    // Set repeat scale for a tighter, elegant spiral
    tex.repeat.set(1.5, 1.5);
    return tex;
  }, []);

  useFrame((state) => {
    if (innerRef.current) {
      // Rotate the inner core cylinder to create the infinite spiral illusion
      innerRef.current.rotation.y = -state.clock.getElapsedTime() * 1.5;
    }
  });

  return (
    <group>
      {/* 1. Inner core cylinder with dynamic texture */}
      <mesh ref={innerRef} position={[0, 0, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 2.1, 32, 1, true]} />
        {texture && <meshBasicMaterial map={texture} toneMapped={false} />}
      </mesh>

      {/* 2. Glass outer protective cylinder */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 2.2, 32, 1, false]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent={true}
          opacity={0.18}
          roughness={0.05}
          metalness={0.1}
          transmission={0.9}
          ior={1.5}
          thickness={0.15}
          depthWrite={false}
        />
      </mesh>

      {/* 3. Top metal cap structure */}
      <group position={[0, 1.1, 0]}>
        {/* Base gold ring */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.40, 0.40, 0.1, 32]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.15} />
        </mesh>
        {/* Chrome dome base */}
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.35, 0.40, 0.15, 32]} />
          <meshStandardMaterial color="#cccccc" metalness={0.95} roughness={0.1} />
        </mesh>
        {/* Main chrome dome sphere */}
        <mesh position={[0, 0.22, 0]}>
          <sphereGeometry args={[0.35, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#cccccc" metalness={0.95} roughness={0.1} />
        </mesh>
        {/* Gold column stem */}
        <mesh position={[0, 0.42, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.2, 32]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.15} />
        </mesh>
        {/* Gold crown sphere */}
        <mesh position={[0, 0.60, 0]}>
          <sphereGeometry args={[0.16, 32, 32]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.95} roughness={0.12} />
        </mesh>
      </group>

      {/* 4. Bottom metal cap structure */}
      <group position={[0, -1.1, 0]} rotation={[Math.PI, 0, 0]}>
        {/* Base gold ring */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.40, 0.40, 0.1, 32]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.15} />
        </mesh>
        {/* Chrome dome base */}
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.35, 0.40, 0.15, 32]} />
          <meshStandardMaterial color="#cccccc" metalness={0.95} roughness={0.1} />
        </mesh>
        {/* Main chrome dome sphere */}
        <mesh position={[0, 0.22, 0]}>
          <sphereGeometry args={[0.35, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#cccccc" metalness={0.95} roughness={0.1} />
        </mesh>
        {/* Gold column stem */}
        <mesh position={[0, 0.42, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.2, 32]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.15} />
        </mesh>
        {/* Gold crown sphere */}
        <mesh position={[0, 0.60, 0]}>
          <sphereGeometry args={[0.16, 32, 32]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.95} roughness={0.12} />
        </mesh>
      </group>
    </group>
  );
}

// --- MAIN EXPORTED CANVAS COMPONENT ---

export default function BarberPoleCanvas() {
  return (
    <div className="w-full h-full min-h-[420px] md:min-h-[520px] relative select-none">
      <Canvas camera={{ position: [0, 0, 3.1], fov: 50 }}>
        {/* Soft environmental lighting */}
        <ambientLight intensity={0.45} />
        
        {/* Main key light for sharp chrome highlights */}
        <directionalLight position={[5, 8, 5]} intensity={1.6} color="#ffffff" />
        
        {/* Backlight/rim light for glass highlights */}
        <directionalLight position={[-5, 5, -5]} intensity={0.9} color="#ffffff" />
        
        {/* Lateral golden accent light */}
        <pointLight position={[3, 1, 2]} intensity={1.3} color="#D4AF37" decay={2} />
        
        {/* The solid model */}
        <BarberPoleModel />
      </Canvas>
    </div>
  );
}
