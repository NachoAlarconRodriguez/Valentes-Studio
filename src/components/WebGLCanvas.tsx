'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useUIStore } from '@/store/useUIStore';

// --- GLSL SHADERS ---

// Background Quad Shaders
const bgVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const bgFragmentShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform float uCurrentSection;
  uniform float uTargetSection;
  uniform float uTransition;
  uniform float uHoveredCardFactor;
  varying vec2 vUv;

  // 2D Perlin Noise Helper
  vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  vec2 fade(vec2 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }

  float snoise(vec2 P) {
    vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
    vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
    Pi = mod(Pi, 289.0);
    vec4 ix = Pi.xzxz;
    vec4 iy = Pi.yyww;
    vec4 fx = Pf.xzxz;
    vec4 fy = Pf.yyww;
    vec4 i = permute(permute(ix) + iy);
    vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0;
    vec4 gy = abs(gx) - 0.5;
    vec4 tx = floor(gx + 0.5);
    gx = gx - tx;
    vec2 g00 = vec2(gx.x, gy.x);
    vec2 g10 = vec2(gx.y, gy.y);
    vec2 g01 = vec2(gx.z, gy.z);
    vec2 g11 = vec2(gx.w, gy.w);
    vec4 norm = 1.79284291400159 - 0.85373472095314 * 
      vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
    g00 *= norm.x;
    g01 *= norm.y;
    g10 *= norm.z;
    g11 *= norm.w;
    float n00 = dot(g00, vec2(fx.x, fy.x));
    float n10 = dot(g10, vec2(fx.y, fy.y));
    float n01 = dot(g01, vec2(fx.z, fy.z));
    float n11 = dot(g11, vec2(fx.w, fy.w));
    vec2 fade_xy = fade(Pf.xy);
    vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
    float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
    return 2.3 * n_xy;
  }

  // Section 0: Home - Dark gold/amber fluid fluids
  vec3 getHomeBg(vec2 uv, float time, vec2 mouse) {
    vec2 uvDistorted = uv + 0.08 * vec2(
      snoise(uv * 1.5 + time * 0.08),
      snoise(uv * 1.5 - time * 0.07)
    );
    
    // Mouse interaction distortion
    float distToMouse = distance(uv, mouse);
    uvDistorted += 0.03 * (uv - mouse) * exp(-distToMouse * 5.0);

    float n1 = snoise(uvDistorted * 2.2 + time * 0.04);
    float n2 = snoise(uvDistorted * 4.5 - time * 0.09);
    
    float fluidPattern = n1 * 0.6 + n2 * 0.4;
    fluidPattern = smoothstep(-0.6, 0.8, fluidPattern);

    vec3 baseBg = vec3(0.067, 0.067, 0.067); // #111111
    vec3 goldColor = vec3(0.831, 0.686, 0.216); // #D4AF37
    vec3 bronzeColor = vec3(0.80, 0.50, 0.20); // #CD7F32
    
    vec3 fluidColor = mix(bronzeColor * 0.15, goldColor * 0.4, fluidPattern);
    return mix(baseBg, fluidColor, fluidPattern * 0.4);
  }

  // Section 1: Barbería - Horizontal soft gold spotlight gradient
  vec3 getBarberiaBg(vec2 uv, float time) {
    vec3 leftColor = vec3(0.067, 0.067, 0.067); // #111111 (deep charcoal)
    vec3 rightColor = vec3(0.14, 0.10, 0.05); // soft gold/bronze glow (#241A0D)
    return mix(leftColor, rightColor, uv.x);
  }

  // Section 2: Peluquería - Silky bronze waves
  vec3 getPeluqueriaBg(vec2 uv, float time) {
    vec3 baseBg = vec3(0.067, 0.067, 0.067);
    vec3 bronzeColor = vec3(0.80, 0.50, 0.20);
    
    // Multi-layered horizontal waves mimicking silky hair fibers
    float wave1 = sin(uv.x * 5.0 + uv.y * 3.0 + time * 0.3) * 0.5 + 0.5;
    float wave2 = cos(uv.x * 12.0 - uv.y * 5.0 - time * 0.5) * 0.5 + 0.5;
    float wave3 = sin(uv.y * 22.0 + time * 0.8) * 0.5 + 0.5;
    
    float silkPattern = (wave1 * 0.4 + wave2 * 0.4 + wave3 * 0.2);
    silkPattern = pow(silkPattern, 3.0); // Make waves sharper

    return mix(baseBg, bronzeColor * 0.25, silkPattern * 0.35);
  }

  // Section 3: Terapias - Flat black background
  vec3 getTerapiasBg(vec2 uv, float time) {
    return vec3(0.0, 0.0, 0.0);
  }

  vec3 getBgColor(float section, vec2 uv, float time, vec2 mouse) {
    if (section < 0.5) return getHomeBg(uv, time, mouse);
    if (section < 1.5) return getBarberiaBg(uv, time);
    if (section < 2.5) return getPeluqueriaBg(uv, time);
    return getTerapiasBg(uv, time);
  }

  void main() {
    vec3 colorCurrent = getBgColor(uCurrentSection, vUv, uTime, uMouse);
    vec3 colorTarget = getBgColor(uTargetSection, vUv, uTime, uMouse);
    vec3 finalBg = mix(colorCurrent, colorTarget, uTransition);
    
    // Dim the background during Bento Grid Hover
    float dimFactor = mix(1.0, 0.2, uHoveredCardFactor);
    gl_FragColor = vec4(finalBg * dimFactor, 1.0);
  }
`;

// Particle System Shaders
const particleVertexShader = `
  attribute vec3 aPosHome;
  attribute vec3 aPosBarberia;
  attribute vec3 aPosPeluqueria;
  attribute vec3 aPosTerapias;
  attribute vec3 aRand; // x: size offset, y: speed offset, z: phase offset
  
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uCurrentSection;
  uniform float uTargetSection;
  uniform float uTransition;
  uniform vec3 uHoveredCardCenter;
  uniform float uHoveredCardFactor;
  uniform float uIsMobile;

  varying vec3 vColor;
  varying float vAlpha;

  vec3 getPosition(float section) {
    if (section < 0.5) return aPosHome;
    if (section < 1.5) return aPosBarberia;
    if (section < 2.5) return aPosPeluqueria;
    return aPosTerapias;
  }

  void main() {
    // 1. Get positions for source and target states
    vec3 posCurrent = getPosition(uCurrentSection);
    vec3 posTarget = getPosition(uTargetSection);
    
    // 2. Interpolate between layouts
    vec3 basePos = mix(posCurrent, posTarget, uTransition);
    
    // 3. Apply individual particle movement (idle drift)
    float t = uTime * (0.15 + aRand.y * 0.1);
    vec3 drift = vec3(
      sin(t + aRand.z * 6.28) * 0.15,
      cos(t * 0.8 + aRand.z * 6.28) * 0.15,
      sin(t * 1.2 - aRand.z * 6.28) * 0.1
    );
    
    // Section-specific minor dynamics
    if (uTargetSection < 0.5) {
      // Home: mouse attraction
      vec2 ndcMouse = uMouse * vec2(2.5, 1.5); // scale mouse space
      float distToMouse = distance(basePos.xy, ndcMouse);
      float pullStrength = exp(-distToMouse * 2.0) * 0.3 * (1.0 - uIsMobile);
      basePos.xy += (ndcMouse - basePos.xy) * pullStrength;
    } else if (uTargetSection > 2.5) {
      // Terapias: scale breathing
      float breathe = sin(uTime * 0.8 + aRand.z * 3.14) * 0.08 + 1.0;
      basePos.xy *= breathe;
    }
    
    vec3 finalPos = basePos + drift;

    // 4. Gravity pull to hovered Bento card center
    if (uHoveredCardFactor > 0.01) {
      // Pull strength differs by particle (some respond highly, some stay)
      float pullProp = fract(aRand.z * 100.0); // 0.0 to 1.0 unique per particle
      
      // Pull factor for this specific particle
      float individualPull = uHoveredCardFactor * smoothstep(0.1, 0.9, pullProp);
      
      // Interpolate towards card center
      finalPos = mix(finalPos, uHoveredCardCenter + drift * 0.5, individualPull);
    }
    
    // 5. Output projection
    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Calculate point size based on depth and screen resolution (smaller, delicate stars)
    float sizeModifier = mix(1.0, 0.6, uIsMobile);
    gl_PointSize = (12.0 + aRand.x * 8.0) * sizeModifier / -mvPosition.z;

    // 6. Color and Alpha mapping (Dynamic shift to copper on Peluquería, silver on Terapias)
    vec3 goldColor = vec3(0.831, 0.686, 0.216); // #D4AF37 (Warm Luxury Gold)
    vec3 bronzeColor = vec3(0.80, 0.50, 0.20); // #CD7F32 (Bronze)
    vec3 copperColor = vec3(0.72, 0.38, 0.18); // #B8612E (Deep Copper)
    vec3 silverColor = vec3(0.88, 0.88, 0.85); // #E2E0D8 (Platinum/Silver)
    vec3 slateSilverColor = vec3(0.61, 0.64, 0.69); // #9CA3AF (Slate Silver)
    
    float targetIsPelu = step(1.5, uTargetSection) * step(uTargetSection, 2.5);
    float currentIsPelu = step(1.5, uCurrentSection) * step(uCurrentSection, 2.5);
    float isPelu = mix(currentIsPelu, targetIsPelu, uTransition);
    
    float targetIsTerapia = step(2.5, uTargetSection);
    float currentIsTerapia = step(2.5, uCurrentSection);
    float isTerapia = mix(currentIsTerapia, targetIsTerapia, uTransition);
    
    vec3 colorNormal = mix(goldColor, bronzeColor, fract(aRand.x * 37.0));
    vec3 colorPelu = mix(bronzeColor, copperColor, fract(aRand.x * 37.0));
    vec3 colorTerapia = mix(silverColor, slateSilverColor, fract(aRand.x * 37.0));
    
    vec3 colorTemp = mix(colorNormal, colorPelu, isPelu);
    vColor = mix(colorTemp, colorTerapia, isTerapia);
    
    // Fade out particles that are far or when close to camera
    vAlpha = smoothstep(-8.0, -1.0, mvPosition.z) * smoothstep(0.0, -4.5, mvPosition.z);
    
    // Smoothly fade out particles when transitioning to Barberia or Terapias
    float targetIsBarberia = step(0.5, uTargetSection) * step(uTargetSection, 1.5);
    float currentIsBarberia = step(0.5, uCurrentSection) * step(uCurrentSection, 1.5);
    float isBarberia = mix(currentIsBarberia, targetIsBarberia, uTransition);

    vAlpha *= (1.0 - isBarberia) * (1.0 - isTerapia);
    
    // Brighten particles during card hover to look like concentrated energy
    if (uHoveredCardFactor > 0.01) {
      float pullProp = fract(aRand.z * 100.0);
      if (pullProp > 0.4) {
        vAlpha *= mix(1.0, 1.5, uHoveredCardFactor);
      }
    }
  }
`;

const particleFragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;
  
  void main() {
    // Render soft circular particles
    float dist = distance(gl_PointCoord, vec2(0.5));
    if (dist > 0.5) discard;
    
    float strength = smoothstep(0.5, 0.15, dist);
    
    // Subtle golden glow
    gl_FragColor = vec4(vColor, vAlpha * strength * 0.25);
  }
`;

// --- THREEJS INNER COMPONENTS ---

// 1. Background Plane Quad Component
function BackgroundQuad() {
  const { viewport } = useThree();
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { currentTheme, hoveredCard } = useUIStore();
  
  const targetSectionRef = useRef(0);
  const currentSectionRef = useRef(0);
  const transitionRef = useRef(1.0);
  
  const mouseRef = useRef(new THREE.Vector2(0, 0));
  const smoothMouseRef = useRef(new THREE.Vector2(0, 0));

  // Sync route to section index
  const sectionIndex = useMemo(() => {
    switch (currentTheme) {
      case 'home': return 0;
      case 'barberia': return 1;
      case 'peluqueria': return 2;
      case 'terapias': return 3;
      default: return 0;
    }
  }, [currentTheme]);

  useEffect(() => {
    if (sectionIndex !== targetSectionRef.current) {
      currentSectionRef.current = targetSectionRef.current;
      targetSectionRef.current = sectionIndex;
      transitionRef.current = 0.0;
    }
  }, [sectionIndex]);

  // Track mouse coordinates
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX / window.innerWidth;
      mouseRef.current.y = 1.0 - (e.clientY / window.innerHeight); // Invert Y for WebGL
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    if (!materialRef.current) return;
    
    const u = materialRef.current.uniforms;
    u.uTime.value = state.clock.getElapsedTime();
    
    // Smooth mouse coordinates
    smoothMouseRef.current.lerp(mouseRef.current, 0.08);
    u.uMouse.value.copy(smoothMouseRef.current);
    
    // Handle transition interpolation
    if (transitionRef.current < 1.0) {
      transitionRef.current += 0.02; // Transition speed
      if (transitionRef.current > 1.0) transitionRef.current = 1.0;
    }
    
    u.uCurrentSection.value = currentSectionRef.current;
    u.uTargetSection.value = targetSectionRef.current;
    u.uTransition.value = transitionRef.current;

    // Handle bento hover factor transition
    const targetHoverFactor = hoveredCard ? 1.0 : 0.0;
    u.uHoveredCardFactor.value = THREE.MathUtils.lerp(
      u.uHoveredCardFactor.value,
      targetHoverFactor,
      0.08
    );
  });

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(window?.innerWidth || 1024, window?.innerHeight || 768) },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uCurrentSection: { value: 0 },
    uTargetSection: { value: 0 },
    uTransition: { value: 1.0 },
    uHoveredCardFactor: { value: 0.0 }
  }), []);

  useEffect(() => {
    const handleResize = () => {
      if (materialRef.current) {
        materialRef.current.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate viewport boundaries at plane distance (distance = 6 from camera at z=1)
  const w = viewport.width * 6;
  const h = viewport.height * 6;

  return (
    <mesh position={[0, 0, -5]}>
      <planeGeometry args={[w, h]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={bgVertexShader}
        fragmentShader={bgFragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

// 2. Interactive Particles Component
interface ParticlesProps {
  count: number;
  isMobile: boolean;
}

function Particles({ count, isMobile }: ParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const { currentTheme, hoveredCard } = useUIStore();
  
  const targetSectionRef = useRef(0);
  const currentSectionRef = useRef(0);
  const transitionRef = useRef(1.0);
  
  const mouseRef = useRef(new THREE.Vector2(0, 0));
  const smoothMouseRef = useRef(new THREE.Vector2(0, 0));
  const hoveredCardCenterRef = useRef(new THREE.Vector3(0, 0, 0));

  // Determine section index
  const sectionIndex = useMemo(() => {
    switch (currentTheme) {
      case 'home': return 0;
      case 'barberia': return 1;
      case 'peluqueria': return 2;
      case 'terapias': return 3;
      default: return 0;
    }
  }, [currentTheme]);

  useEffect(() => {
    if (sectionIndex !== targetSectionRef.current) {
      currentSectionRef.current = targetSectionRef.current;
      targetSectionRef.current = sectionIndex;
      transitionRef.current = 0.0;
    }
  }, [sectionIndex]);

  // Set card centers in R3F 3D coordinate space for Bento Hover effect
  useEffect(() => {
    if (hoveredCard === 'barberia') {
      hoveredCardCenterRef.current.set(-1.2, 0.2, -2.0); // Left of screen
    } else if (hoveredCard === 'peluqueria') {
      hoveredCardCenterRef.current.set(0.0, 0.4, -2.0);  // Center
    } else if (hoveredCard === 'terapias') {
      hoveredCardCenterRef.current.set(1.2, -0.2, -2.0); // Right of screen
    }
  }, [hoveredCard]);

  // Mouse Listener
  useEffect(() => {
    if (isMobile) return; // Disable mouse move calculation on mobile to save CPU/GPU cycles
    
    const handleMouseMove = (e: MouseEvent) => {
      // Normalized coordinates (-1 to 1)
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile]);

  // Generate particle layouts on GPU using custom attributes
  const { aPosHome, aPosBarberia, aPosPeluqueria, aPosTerapias, aRand } = useMemo(() => {
    // Stateless, pure deterministic pseudo-random generator
    const random = (val: number) => {
      const x = Math.sin(val) * 10000;
      return x - Math.floor(x);
    };

    const home = new Float32Array(count * 3);
    const barberia = new Float32Array(count * 3);
    const peluqueria = new Float32Array(count * 3);
    const terapias = new Float32Array(count * 3);
    const rand = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      
      // Random indices
      const randX = random(i * 3 + 0.1);
      const randY = random(i * 3 + 0.2);
      const randZ = random(i * 3 + 0.3);
      
      rand[idx] = randX;     // Size scale offset
      rand[idx + 1] = randY; // Drift speed offset
      rand[idx + 2] = randZ; // Random phase angle offset

      // 1. HOME Layout: Wide ring with hollow center to clear heading text
      const angle = randX * Math.PI * 2;
      const radius = 1.1 + randY * 2.2; // Hollow core of 1.1 extending outwards
      home[idx] = Math.cos(angle) * radius * 1.6; // stretched horizontally
      home[idx + 1] = Math.sin(angle) * radius * 1.1; // stretched vertically
      home[idx + 2] = -2.5 - randZ * 1.5; // depth spread

      // 2. BARBERIA Layout: 3D Hexagonal Honeycomb LED Mesh
      const colCount = 10;
      const rowCount = 8;
      const hexRadius = 0.28;
      const spacingX = hexRadius * 1.5;
      const spacingY = hexRadius * 1.732;

      // Deterministic random selection for this particle
      const col = Math.floor(random(i * 15 + 0.1) * colCount) - colCount / 2;
      const row = Math.floor(random(i * 15 + 0.2) * rowCount) - rowCount / 2;
      const edge = Math.floor(random(i * 15 + 0.3) * 6);
      const t = random(i * 15 + 0.4); // position along the edge (0 to 1)

      // Hexagon center
      const cx = col * spacingX;
      // Shift every second column vertically to interlock hexagons
      const cy = row * spacingY + (Math.abs(col) % 2 === 1 ? spacingY * 0.5 : 0);

      // Start and end angle of the edge
      const angle1 = (edge * Math.PI) / 3;
      const angle2 = (((edge + 1) % 6) * Math.PI) / 3;

      const x1 = cx + hexRadius * Math.cos(angle1);
      const y1 = cy + hexRadius * Math.sin(angle1);

      const x2 = cx + hexRadius * Math.cos(angle2);
      const y2 = cy + hexRadius * Math.sin(angle2);

      // Interpolate along the edge
      barberia[idx] = x1 + (x2 - x1) * t;
      barberia[idx + 1] = y1 + (y2 - y1) * t;
      // Add depth spread and a tiny jitter to make it look organic
      barberia[idx + 2] = -2.8 + (random(i * 15 + 0.5) - 0.5) * 0.4;

      // 3. PELUQUERIA Layout: Silky overlapping waves
      // Distribute points along longitudinal wave paths
      const u = i / count;
      const waveLayer = Math.floor(randX * 8); // 8 separate layers/locks of hair
      const waveOffset = randY * 0.6 - 0.3;
      const xVal = (u - 0.5) * 4.0;
      
      peluqueria[idx] = xVal;
      peluqueria[idx + 1] = Math.sin(xVal * 2.0 + waveLayer * 0.8) * 0.4 + waveOffset;
      peluqueria[idx + 2] = -3.0 + Math.cos(xVal * 1.5 + waveLayer) * 0.3;

      // 4. TERAPIAS Layout: Radial Mandala Concentric Circles
      const ring = i % 8; // 8 concentric circles
      const ringRadius = (ring + 1) * 0.22;
      const ringAngle = (i / count) * Math.PI * 2 * (8 / (ring + 1)) + randY * 0.1;
      
      terapias[idx] = Math.cos(ringAngle) * ringRadius;
      terapias[idx + 1] = Math.sin(ringAngle) * ringRadius;
      terapias[idx + 2] = -3.0 + randZ * 0.2;
    }

    return {
      aPosHome: new THREE.BufferAttribute(home, 3),
      aPosBarberia: new THREE.BufferAttribute(barberia, 3),
      aPosPeluqueria: new THREE.BufferAttribute(peluqueria, 3),
      aPosTerapias: new THREE.BufferAttribute(terapias, 3),
      aRand: new THREE.BufferAttribute(rand, 3)
    };
  }, [count]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uCurrentSection: { value: 0 },
    uTargetSection: { value: 0 },
    uTransition: { value: 1.0 },
    uHoveredCardCenter: { value: new THREE.Vector3(0, 0, 0) },
    uHoveredCardFactor: { value: 0.0 },
    uIsMobile: { value: 0.0 }
  }), []);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const material = pointsRef.current.material as THREE.ShaderMaterial;
    const u = material.uniforms;

    u.uTime.value = state.clock.getElapsedTime();
    u.uIsMobile.value = isMobile ? 1.0 : 0.0;

    // Smooth mouse coordinates or simulate drift on mobile
    if (isMobile) {
      // Autonomous slow circular wave for mobile
      const t = state.clock.getElapsedTime() * 0.3;
      mouseRef.current.set(Math.sin(t) * 0.5, Math.cos(t * 0.8) * 0.3);
      smoothMouseRef.current.copy(mouseRef.current);
    } else {
      smoothMouseRef.current.lerp(mouseRef.current, 0.05);
    }
    u.uMouse.value.copy(smoothMouseRef.current);

    // Section transition
    if (transitionRef.current < 1.0) {
      transitionRef.current += 0.015; // smooth slow layout transition
      if (transitionRef.current > 1.0) transitionRef.current = 1.0;
    }

    u.uCurrentSection.value = currentSectionRef.current;
    u.uTargetSection.value = targetSectionRef.current;
    u.uTransition.value = transitionRef.current;

    // Bento Hover state gravitational pull
    const targetHoverFactor = hoveredCard ? 1.0 : 0.0;
    u.uHoveredCardFactor.value = THREE.MathUtils.lerp(
      u.uHoveredCardFactor.value,
      targetHoverFactor,
      0.08
    );
    u.uHoveredCardCenter.value.lerp(hoveredCardCenterRef.current, 0.08);
  });

  const geometryRef = useRef<THREE.BufferGeometry>(null);

  useEffect(() => {
    if (geometryRef.current) {
      geometryRef.current.setAttribute('position', aPosHome);
      geometryRef.current.setAttribute('aPosHome', aPosHome);
      geometryRef.current.setAttribute('aPosBarberia', aPosBarberia);
      geometryRef.current.setAttribute('aPosPeluqueria', aPosPeluqueria);
      geometryRef.current.setAttribute('aPosTerapias', aPosTerapias);
      geometryRef.current.setAttribute('aRand', aRand);
    }
  }, [aPosHome, aPosBarberia, aPosPeluqueria, aPosTerapias, aRand]);

  return (
    <points ref={pointsRef}>
      <bufferGeometry ref={geometryRef} />
      <shaderMaterial
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        depthTest={true}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// --- GLOBAL EXPORTABLE CANVAS WRAPPER ---

export function WebGLCanvas() {
  const [isMobile, setIsMobile] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reduce particle count on mobile for performance optimization (60FPS)
  const particleCount = useMemo(() => {
    return isMobile ? 4000 : 12000;
  }, [isMobile]);

  if (!hasMounted) return null;

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none -z-10 bg-bg-base">
      <Canvas
        camera={{ position: [0, 0, 1], fov: 60, near: 0.1, far: 100 }}
        dpr={isMobile ? 1 : [1, 2]} // limit device pixel ratio on mobile to 1 to reduce load
        gl={{
          antialias: !isMobile, // disable antialias on mobile for extra performance
          alpha: false,
          stencil: false,
          depth: true,
          powerPreference: 'high-performance'
        }}
      >
        <BackgroundQuad />
        <Particles count={particleCount} isMobile={isMobile} />
      </Canvas>
    </div>
  );
}

export default WebGLCanvas;
