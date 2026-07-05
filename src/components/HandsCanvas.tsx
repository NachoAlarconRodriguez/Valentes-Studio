'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// --- GLSL SHADERS ---

const handsVertexShader = `
  attribute vec3 aTargetPos;
  attribute vec3 aRandomPos;
  attribute float aRandSize;
  attribute vec3 aTargetColor;
  attribute float aIsRotatable;

  uniform float uProgress;
  uniform vec3 uMouse;
  uniform float uHover;
  uniform float uTime;

  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    // 1. Rotate target position locally around its own vertical axis
    vec3 localTarget = aTargetPos;
    if (aIsRotatable > 0.5) {
      float theta = atan(localTarget.z, localTarget.x);
      float R = length(localTarget.xz);
      // Continuous helical scrolling rotation speed (around 1.6 rads/sec)
      float rotationSpeed = 1.6;
      float currentTheta = theta + uTime * rotationSpeed;
      localTarget.x = R * cos(currentTheta);
      localTarget.z = R * sin(currentTheta);
    }
    
    // 2. Shift the local coordinates to the target position on the screen
    vec3 shiftedTarget = localTarget;
    shiftedTarget.x += 1.85;
    shiftedTarget.y -= 0.30;
    
    // 3. Interpolate from random scatter to the shifted target shape
    vec3 basePos = mix(aRandomPos, shiftedTarget, uProgress);
    
    // 4. Mouse Repulsion / Disassembling effect
    vec3 finalPos = basePos;
    float dist = distance(basePos, uMouse);
    float repulsionRadius = 0.95; // radius of influence
    
    if (dist < repulsionRadius && uHover > 0.01) {
      // Repulsion force grows stronger close to the mouse
      float force = (1.0 - (dist / repulsionRadius));
      
      // Calculate push direction
      vec3 dir = basePos - uMouse;
      if (length(dir) < 0.01) {
        dir = vec3(0.01, 0.01, 0.0);
      }
      
      // Push particles away (multiplied by hover factor and particle jitter)
      float jitter = 0.8 + 0.4 * sin(uTime * 4.0 + aRandSize * 15.0);
      finalPos += normalize(dir) * force * 0.75 * uHover * jitter;
      
      // Offset Z coordinate to create a 3D disintegrating explosion feel
      finalPos.z += (aRandSize - 0.5) * force * 0.8 * uHover;
    }
    
    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Set point size based on distance (very tiny, delicate pixel-like stars)
    gl_PointSize = (5.5 + aRandSize * 3.5) / -mvPosition.z;
    
    // Subtle luxury sparkle/glimmer over time
    vColor = aTargetColor * (0.82 + 0.18 * sin(uTime * 5.0 + aRandSize * 10.0));
    
    // Fade in as transition completes
    vAlpha = smoothstep(0.0, 0.4, uProgress) * 0.65; // 65% opacity for high visibility
  }
`;

const handsFragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;
  
  void main() {
    // Render soft squares (max coordinate distance instead of circle radius)
    vec2 temp = gl_PointCoord - vec2(0.5);
    float dist = max(abs(temp.x), abs(temp.y));
    if (dist > 0.5) discard;
    
    // Soft anti-aliased edges for the square shapes
    float edgeSoftness = smoothstep(0.5, 0.44, dist);
    
    // Subtle golden square glow
    gl_FragColor = vec4(vColor, vAlpha * edgeSoftness * 0.8);
  }
`;

// --- PARTICLES ENGINE ---

interface BarberPolePoint {
  x: number;
  y: number;
  z: number;
  color: [number, number, number]; // r, g, b
  isRotatable: number; // 1 or 0
}

function generateBarberPolePoints(): BarberPolePoint[] {
  const points: BarberPolePoint[] = [];
  
  // 1. Generate cylinder stripes (2000 points)
  const cylinderRadius = 0.28;
  const cylinderHeight = 1.5;
  
  // Colors (Luxury gold theme)
  const colorGold: [number, number, number] = [0.831, 0.686, 0.216]; // #D4AF37 (Warm Luxury Gold)
  const colorBronze: [number, number, number] = [0.55, 0.43, 0.28]; // #8C6E47 (Warm Bronze)
  const colorLightGold: [number, number, number] = [0.88, 0.82, 0.68]; // #E2D3B8 (Light Champagne Gold)
  
  while (points.length < 2000) {
    const y = (Math.random() - 0.5) * cylinderHeight; // between -0.75 and 0.75
    const theta = Math.random() * Math.PI * 2;
    
    // Helical phase: we want 3 spiraling stripes
    // Angle theta spirals along height y: phase = theta - pitch * y
    // Tightness of the spiral is controlled by the pitch factor (3.8)
    const phase = (theta - 3.8 * y) % (Math.PI * 2);
    const normalizedPhase = phase < 0 ? phase + Math.PI * 2 : phase;
    
    // Divide 2*PI into 6 segments of size PI/3
    // Stripe 1: segment 0
    // Stripe 2: segment 2
    // Stripe 3: segment 4
    // Gaps: segments 1, 3, 5
    const segment = Math.floor(normalizedPhase / (Math.PI / 3));
    
    let color: [number, number, number] | null = null;
    if (segment === 0) {
      color = colorGold;
    } else if (segment === 2) {
      color = colorBronze;
    } else if (segment === 4) {
      color = colorLightGold;
    }
    
    if (color !== null) {
      const x = Math.cos(theta) * cylinderRadius;
      const z = Math.sin(theta) * cylinderRadius;
      points.push({
        x,
        y,
        z,
        color,
        isRotatable: 1.0
      });
    }
  }
  
  // 2. Generate top cap (450 points)
  // Dome starting at y = 0.75 and ending at y = 0.97
  const capRadius = cylinderRadius * 1.15; // slightly wider than cylinder
  const capHeight = 0.22;
  const topY = cylinderHeight / 2; // 0.75
  
  const colorCap: [number, number, number] = [0.85, 0.82, 0.76]; // Shiny platinum/chrome
  
  while (points.length < 2400) {
    // Generate dome
    const yPrime = Math.random();
    const theta = Math.random() * Math.PI * 2;
    
    // radius decreases spherically
    const r = capRadius * Math.sqrt(1.0 - yPrime * yPrime);
    const y = topY + yPrime * capHeight;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    
    points.push({
      x,
      y,
      z,
      color: colorCap,
      isRotatable: 0.0
    });
  }
  
  // Small top knob (50 points)
  const knobCenterY = topY + capHeight + 0.04;
  const knobRadius = 0.08;
  while (points.length < 2450) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * Math.PI * 2;
    const phi = Math.acos(2.0 * v - 1.0);
    
    const x = knobRadius * Math.sin(phi) * Math.cos(theta);
    const z = knobRadius * Math.sin(phi) * Math.sin(theta);
    const y = knobCenterY + knobRadius * Math.cos(phi);
    
    points.push({
      x,
      y,
      z,
      color: colorCap,
      isRotatable: 0.0
    });
  }
  
  // 3. Generate bottom cap (450 points)
  // Dome starting at y = -0.75 and ending at y = -0.97
  const bottomY = -cylinderHeight / 2; // -0.75
  while (points.length < 2850) {
    const yPrime = Math.random();
    const theta = Math.random() * Math.PI * 2;
    
    const r = capRadius * Math.sqrt(1.0 - yPrime * yPrime);
    const y = bottomY - yPrime * capHeight;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    
    points.push({
      x,
      y,
      z,
      color: colorCap,
      isRotatable: 0.0
    });
  }
  
  // Small bottom knob (50 points)
  const bottomKnobCenterY = bottomY - capHeight - 0.04;
  while (points.length < 2900) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * Math.PI * 2;
    const phi = Math.acos(2.0 * v - 1.0);
    
    const x = knobRadius * Math.sin(phi) * Math.cos(theta);
    const z = knobRadius * Math.sin(phi) * Math.sin(theta);
    const y = bottomKnobCenterY + knobRadius * Math.cos(phi);
    
    points.push({
      x,
      y,
      z,
      color: colorCap,
      isRotatable: 0.0
    });
  }
  
  return points;
}

function HandsParticles({ points }: { points: BarberPolePoint[] }) {
  const pointsRef = useRef<THREE.Points>(null);
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const mouse3D = useRef(new THREE.Vector3(999, 999, 999));
  const [hovered, setHovered] = useState(false);
  const progressRef = useRef(0.0);
  const hoverFactorRef = useRef(0.0);

  const count = points.length;

  // Generate particle layouts
  const { aTargetPos, aRandomPos, aRandSize, aTargetColor, aIsRotatable } = useMemo(() => {
    // Stateless, pure deterministic pseudo-random generator
    const random = (val: number) => {
      const x = Math.sin(val) * 10000;
      return x - Math.floor(x);
    };

    const target = new Float32Array(count * 3);
    const randomPosArr = new Float32Array(count * 3);
    const randSize = new Float32Array(count);
    const targetColor = new Float32Array(count * 3);
    const isRotatable = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      
      // Target local positions (centered at X=0, Z=0)
      target[idx] = points[i].x;
      target[idx + 1] = points[i].y;
      target[idx + 2] = points[i].z;

      // Random scattered initial coordinates spanning the ENTIRE Hero section background
      randomPosArr[idx] = (random(i * 5 + 0.1) - 0.5) * 8.5; // Spans left-to-right (8.5 units)
      randomPosArr[idx + 1] = (random(i * 5 + 0.2) - 0.5) * 4.2; // Spans top-to-bottom (4.2 units)
      randomPosArr[idx + 2] = (random(i * 5 + 0.3) - 0.5) * 2.0 - 1.5; // Depth range

      // Random float offset
      randSize[i] = random(i * 5 + 0.4);

      // Target colors
      targetColor[idx] = points[i].color[0];
      targetColor[idx + 1] = points[i].color[1];
      targetColor[idx + 2] = points[i].color[2];

      // Is rotatable
      isRotatable[i] = points[i].isRotatable;
    }

    return {
      aTargetPos: new THREE.BufferAttribute(target, 3),
      aRandomPos: new THREE.BufferAttribute(randomPosArr, 3),
      aRandSize: new THREE.BufferAttribute(randSize, 1),
      aTargetColor: new THREE.BufferAttribute(targetColor, 3),
      aIsRotatable: new THREE.BufferAttribute(isRotatable, 1),
    };
  }, [points, count]);

  // Set buffer attributes programmatically for type safety
  useEffect(() => {
    if (geometryRef.current) {
      geometryRef.current.setAttribute('position', aRandomPos);
      geometryRef.current.setAttribute('aTargetPos', aTargetPos);
      geometryRef.current.setAttribute('aRandomPos', aRandomPos);
      geometryRef.current.setAttribute('aRandSize', aRandSize);
      geometryRef.current.setAttribute('aTargetColor', aTargetColor);
      geometryRef.current.setAttribute('aIsRotatable', aIsRotatable);
    }
  }, [aTargetPos, aRandomPos, aRandSize, aTargetColor, aIsRotatable]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uProgress: { value: 0.0 },
    uMouse: { value: new THREE.Vector3(999, 999, 999) },
    uHover: { value: 0.0 },
  }), []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const material = pointsRef.current.material as THREE.ShaderMaterial;
    const u = material.uniforms;

    u.uTime.value = state.clock.getElapsedTime();

    // Lerp progress to 1.0 (gradually forms the barber pole shape)
    progressRef.current = THREE.MathUtils.lerp(progressRef.current, 1.0, 0.012);
    u.uProgress.value = progressRef.current;

    // Lerp hover state transition
    const targetHover = hovered ? 1.0 : 0.0;
    hoverFactorRef.current = THREE.MathUtils.lerp(hoverFactorRef.current, targetHover, 0.1);
    u.uHover.value = hoverFactorRef.current;

    // Smoothly copy mouse coordinates
    u.uMouse.value.lerp(mouse3D.current, 0.15);
  });

  return (
    <>
      <points ref={pointsRef}>
        <bufferGeometry ref={geometryRef} />
        <shaderMaterial
          vertexShader={handsVertexShader}
          fragmentShader={handsFragmentShader}
          uniforms={uniforms}
          transparent={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Invisible plane to capture mouse intersections in 3D scene space */}
      <mesh
        position={[0, 0, 0]}
        onPointerMove={(e) => {
          mouse3D.current.copy(e.point);
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => {
          setHovered(false);
          mouse3D.current.set(999, 999, 999);
        }}
      >
        <planeGeometry args={[8, 8]} />
        <meshBasicMaterial transparent={true} opacity={0.0} depthWrite={false} />
      </mesh>
    </>
  );
}

// --- MAIN EXPORTED CANVAS COMPONENT ---

export default function HandsCanvas() {
  const points = useMemo(() => generateBarberPolePoints(), []);

  return (
    <div className="w-full h-full min-h-[500px] relative select-none">
      <Canvas camera={{ position: [0, 0, 2.5], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <HandsParticles points={points} />
      </Canvas>
    </div>
  );
}
