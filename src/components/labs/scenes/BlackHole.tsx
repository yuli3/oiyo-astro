import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import "./GlowPointsMaterial";

interface BlackHoleProps {
  progressRef: React.MutableRefObject<number>;
  visibleRange: [number, number];
  reducedMotion: boolean;
  quality: number;
}

export function BlackHole({ progressRef, visibleRange, reducedMotion, quality }: BlackHoleProps) {
  const groupRef = useRef<THREE.Group>(null);
  const diskRef = useRef<THREE.Points>(null);
  const horizonRef = useRef<THREE.Mesh>(null);
  const ringMatRef = useRef<THREE.ShaderMaterial>(null);

  const diskGeometry = useMemo(() => {
    const count = Math.round(3200 * quality);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const inner = 2.2;
    const outer = 5.5;
    const hot = new THREE.Color("#fff7cf");
    const cool = new THREE.Color("#7c3aed");
    for (let i = 0; i < count; i++) {
      const radius = inner + Math.pow(Math.random(), 1.5) * (outer - inner);
      const angle = Math.random() * Math.PI * 2;
      const wobble = (Math.random() - 0.5) * 0.35 * (radius / outer);
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = wobble;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      const t = 1 - (radius - inner) / (outer - inner);
      const mixed = cool.clone().lerp(hot, t);
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
    const fadeIn = Math.min(1, local / 0.15);
    const fadeOut = local > 0.85 ? 1 - (local - 0.85) / 0.15 : 1;
    const fade = Math.max(0, Math.min(fadeIn, fadeOut));

    groupRef.current.visible = p >= start - 0.05 && p <= end + 0.05;
    // Closest approach stops a few units short of the camera (z=8) so the
    // wide accretion disk never sweeps directly through the lens — doing so
    // packed thousands of additive-blended points into a few screen pixels
    // and blew out to solid white regardless of per-particle alpha.
    groupRef.current.position.z = -10 + local * 15;

    if (!reducedMotion && diskRef.current) {
      diskRef.current.rotation.y += delta * 0.35;
    }
    if (horizonRef.current) {
      const scale = 1 + local * 0.25;
      horizonRef.current.scale.setScalar(scale);
    }
    if (ringMatRef.current) {
      ringMatRef.current.uniforms.uOpacity.value = fade * 0.32;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={horizonRef}>
        <sphereGeometry args={[1.1, 48, 48]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <points ref={diskRef} geometry={diskGeometry} rotation={[Math.PI / 2.6, 0, 0]}>
        <glowPointsMaterial
          ref={ringMatRef}
          uSize={2.25}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>
      <pointLight color="#fbbf24" intensity={4} distance={12} />
    </group>
  );
}
