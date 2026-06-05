'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// --- GLSL SHADERS ---

const hairVertexShader = `
  attribute vec3 aTargetPos;
  attribute vec3 aRandomPos;
  attribute float aRandSize;
  attribute vec3 aTargetColor;
  attribute float aIsHair;

  uniform float uProgress;
  uniform vec3 uMouse;
  uniform float uHover;
  uniform float uTime;

  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    vec3 localTarget = aTargetPos;
    
    // Wave the hair infinitely in 3D space if it is classified as hair
    if (aIsHair > 0.01) {
      // Wind speed (waving speed)
      float waveSpeed = 2.2;
      // Wavelength along the hair height
      float waveFreq = 4.5;
      
      // Wave horizontally (X axis)
      float waveX = sin(uTime * waveSpeed + localTarget.y * waveFreq) * 0.08 * aIsHair;
      // Wave vertically (Y axis, sutil bounce)
      float waveY = cos(uTime * waveSpeed * 0.6 + localTarget.x * 2.8) * 0.03 * aIsHair;
      // Also add Z depth wave for 3D volume waving
      float waveZ = sin(uTime * waveSpeed * 0.8 + localTarget.y * 3.0) * 0.04 * aIsHair;
      
      localTarget.x += waveX * uProgress;
      localTarget.y += waveY * uProgress;
      localTarget.z += waveZ * uProgress;
    }
    
    // 2. Shift the local coordinates to the target position on the right side of the screen
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
    
    // Subtle luxury sparkle/glimmer over time
    vColor = aTargetColor * (0.85 + 0.15 * sin(uTime * 4.5 + aRandSize * 12.0));
    
    // Fade in as transition completes
    vAlpha = smoothstep(0.0, 0.4, uProgress) * 0.85; // 85% opacity for high visibility
  }
`;

const hairFragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;
  
  void main() {
    // Glowing line color
    gl_FragColor = vec4(vColor, vAlpha * 0.95);
  }
`;

// --- PARTICLES / LINES ENGINE ---

interface HairPoint {
  x: number;
  y: number;
  hairStrength: number;
}

interface HairSegment {
  p1: HairPoint;
  p2: HairPoint;
}

function HairLines({ segments }: { segments: HairSegment[] }) {
  const linesRef = useRef<THREE.LineSegments>(null);
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const mouse3D = useRef(new THREE.Vector3(999, 999, 999));
  const [hovered, setHovered] = useState(false);
  const progressRef = useRef(0.0);
  const hoverFactorRef = useRef(0.0);

  const count = segments.length * 2;

  // Generate attribute layouts for line endpoints
  const { aTargetPos, aRandomPos, aRandSize, aTargetColor, aIsHair } = useMemo(() => {
    // Stateless, pure deterministic pseudo-random generator
    const random = (val: number) => {
      const x = Math.sin(val) * 10000;
      return x - Math.floor(x);
    };

    const target = new Float32Array(count * 3);
    const randomPosArr = new Float32Array(count * 3);
    const randSize = new Float32Array(count);
    const targetColor = new Float32Array(count * 3);
    const isHair = new Float32Array(count);

    // Luxury copper/peach/bronze colors
    const colorCopper: [number, number, number] = [0.80, 0.50, 0.20]; // #CD7F32 (Bronze/Copper)
    const colorDeepCopper: [number, number, number] = [0.58, 0.32, 0.14]; // Deep Copper
    const colorPeachGold: [number, number, number] = [0.88, 0.68, 0.50]; // Light peach / rose gold

    for (let i = 0; i < segments.length; i++) {
      const idx1 = i * 2 * 3;
      const idx2 = (i * 2 + 1) * 3;
      const p1 = segments[i].p1;
      const p2 = segments[i].p2;

      // Keep endpoints close in random scatter coordinates so lines start as small points and stretch out
      const randX = (random(i * 9 + 0.1) - 0.5) * 8.5;
      const randY = (random(i * 9 + 0.2) - 0.5) * 4.2;
      const randZ = (random(i * 9 + 0.3) - 0.5) * 2.0 - 1.5;

      const rSize = random(i * 9 + 0.4);

      const rColor = random(i * 9 + 0.5);
      let color = colorCopper;
      if (rColor < 0.4) {
        color = colorDeepCopper;
      } else if (rColor < 0.7) {
        color = colorPeachGold;
      }

      // First endpoint (p1)
      target[idx1] = p1.x;
      target[idx1 + 1] = p1.y;
      target[idx1 + 2] = (random(i * 9 + 0.6) - 0.5) * 0.03;

      randomPosArr[idx1] = randX;
      randomPosArr[idx1 + 1] = randY;
      randomPosArr[idx1 + 2] = randZ;

      randSize[i * 2] = rSize;

      targetColor[idx1] = color[0];
      targetColor[idx1 + 1] = color[1];
      targetColor[idx1 + 2] = color[2];

      isHair[i * 2] = p1.hairStrength;

      // Second endpoint (p2)
      target[idx2] = p2.x;
      target[idx2 + 1] = p2.y;
      target[idx2 + 2] = (random(i * 9 + 0.7) - 0.5) * 0.03;

      randomPosArr[idx2] = randX;
      randomPosArr[idx2 + 1] = randY;
      randomPosArr[idx2 + 2] = randZ;

      randSize[i * 2 + 1] = rSize;

      targetColor[idx2] = color[0];
      targetColor[idx2 + 1] = color[1];
      targetColor[idx2 + 2] = color[2];

      isHair[i * 2 + 1] = p2.hairStrength;
    }

    return {
      aTargetPos: new THREE.BufferAttribute(target, 3),
      aRandomPos: new THREE.BufferAttribute(randomPosArr, 3),
      aRandSize: new THREE.BufferAttribute(randSize, 1),
      aTargetColor: new THREE.BufferAttribute(targetColor, 3),
      aIsHair: new THREE.BufferAttribute(isHair, 1),
    };
  }, [segments, count]);

  // Set buffer attributes programmatically
  useEffect(() => {
    if (geometryRef.current) {
      geometryRef.current.setAttribute('position', aRandomPos);
      geometryRef.current.setAttribute('aTargetPos', aTargetPos);
      geometryRef.current.setAttribute('aRandomPos', aRandomPos);
      geometryRef.current.setAttribute('aRandSize', aRandSize);
      geometryRef.current.setAttribute('aTargetColor', aTargetColor);
      geometryRef.current.setAttribute('aIsHair', aIsHair);
    }
  }, [aTargetPos, aRandomPos, aRandSize, aTargetColor, aIsHair]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uProgress: { value: 0.0 },
    uMouse: { value: new THREE.Vector3(999, 999, 999) },
    uHover: { value: 0.0 },
  }), []);

  useFrame((state) => {
    if (!linesRef.current) return;
    const material = linesRef.current.material as THREE.ShaderMaterial;
    const u = material.uniforms;

    u.uTime.value = state.clock.getElapsedTime();

    // Lerp progress to 1.0 (gradually forms the shape)
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
      <lineSegments ref={linesRef}>
        <bufferGeometry ref={geometryRef} />
        <shaderMaterial
          vertexShader={hairVertexShader}
          fragmentShader={hairFragmentShader}
          uniforms={uniforms}
          transparent={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

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

export default function HairCanvas() {
  const [segments, setSegments] = useState<HairSegment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    img.src = '/hair-silhouette.png';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Scale down image to load a performant subset of coordinates (~110 width)
      const width = 110;
      const height = Math.round((img.height / img.width) * width);
      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;

      const extractedSegments: HairSegment[] = [];

      const addHorizontalSegments = (y: number, startX: number, endX: number) => {
        const step = 1.5;
        const pts: HairPoint[] = [];
        for (let x = startX; x <= endX; x += step) {
          const nx = (x / width - 0.5) * 2.3;
          const ny = (0.5 - y / height) * 2.3 * (img.height / img.width);
          
          // Map coordinates relative to the face profile
          // Face profile (nose, lips, chin) is generally situated around:
          // x between -0.45 and -0.05, y between -0.22 and 0.28
          const isFace = nx < -0.05 && ny > -0.22 && ny < 0.28;
          
          let hairStrength = 0.0;
          if (!isFace) {
            // Strength of waving effect (0.1 to 1.0)
            // Hair waves more towards the right (back flow) and down (ends)
            hairStrength = Math.min(1.0, Math.max(0.1, (nx + 0.1) * 0.8 + Math.max(0, -ny) * 0.6));
          }
          
          pts.push({ x: nx, y: ny, hairStrength });
        }
        
        // Ensure the end point is included
        const lastX = endX;
        const lastNx = (lastX / width - 0.5) * 2.3;
        const lastNy = (0.5 - y / height) * 2.3 * (img.height / img.width);
        const lastIsFace = lastNx < -0.05 && lastNy > -0.22 && lastNy < 0.28;
        let lastHairStrength = 0.0;
        if (!lastIsFace) {
          lastHairStrength = Math.min(1.0, Math.max(0.1, (lastNx + 0.1) * 0.8 + Math.max(0, -lastNy) * 0.6));
        }
        
        if (pts.length > 0 && Math.abs(pts[pts.length - 1].x - lastNx) > 0.01) {
          pts.push({ x: lastNx, y: lastNy, hairStrength: lastHairStrength });
        }

        for (let j = 0; j < pts.length - 1; j++) {
          extractedSegments.push({ p1: pts[j], p2: pts[j + 1] });
        }
      };

      for (let y = 0; y < height; y++) {
        let inWhite = false;
        let startX = 0;
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];

          const brightness = (r + g + b) / 3;
          const isWhite = a > 150 && brightness > 150;

          if (isWhite && !inWhite) {
            inWhite = true;
            startX = x;
          } else if (!isWhite && inWhite) {
            inWhite = false;
            addHorizontalSegments(y, startX, x - 1);
          }
        }
        if (inWhite) {
          addHorizontalSegments(y, startX, width - 1);
        }
      }

      setSegments(extractedSegments);
      setLoading(false);
    };
    img.onerror = () => {
      console.error("Failed to load hair-silhouette.png");
      setLoading(false);
    };
  }, []);

  if (loading || segments.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span className="w-6 h-6 border-2 border-bronze border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[500px] relative select-none">
      <Canvas camera={{ position: [0, 0, 2.5], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <HairLines segments={segments} />
      </Canvas>
    </div>
  );
}
