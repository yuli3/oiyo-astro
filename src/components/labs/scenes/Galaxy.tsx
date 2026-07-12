import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import "./GlowPointsMaterial";

interface GalaxyProps {
  progressRef: React.MutableRefObject<number>;
  visibleRange: [number, number];
  reducedMotion: boolean;
  quality: number;
}

const BRANCHES = 4;
const SPIN = 1.4;
const RANDOMNESS = 0.35;

export function Galaxy({ progressRef, visibleRange, reducedMotion, quality }: GalaxyProps) {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const count = Math.round(16000 * quality);
    const radiusMax = 10;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const inner = new THREE.Color("#facc15");
    const outer = new THREE.Color("#6366f1");

    for (let i = 0; i < count; i++) {
      const radius = Math.random() * radiusMax;
      const branchAngle = ((i % BRANCHES) / BRANCHES) * Math.PI * 2;
      const spinAngle = radius * SPIN;

      const randomX = (Math.random() - 0.5) * RANDOMNESS * radius;
      const randomY = (Math.random() - 0.5) * RANDOMNESS * radius * 0.4;
      const randomZ = (Math.random() - 0.5) * RANDOMNESS * radius;

      const angle = branchAngle + spinAngle;
      positions[i * 3] = Math.cos(angle) * radius + randomX;
      positions[i * 3 + 1] = randomY;
      positions[i * 3 + 2] = Math.sin(angle) * radius + randomZ;

      const mixed = inner.clone().lerp(outer, radius / radiusMax);
      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [quality]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const [start, end] = visibleRange;
    const p = progressRef.current;
    const local = THREE.MathUtils.clamp((p - start) / (end - start), 0, 1);
    const fadeIn = Math.min(1, local / 0.2);

    groupRef.current.visible = p >= start - 0.05;
    groupRef.current.position.z = -10 + local * 6;
    groupRef.current.rotation.x = THREE.MathUtils.degToRad(20) - local * 0.15;

    if (!reducedMotion && pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.05;
    }
    if (matRef.current) {
      matRef.current.uniforms.uOpacity.value = fadeIn * 0.9;
    }
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef} geometry={geometry}>
        <glowPointsMaterial
          ref={matRef}
          uSize={4}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>
    </group>
  );
}
