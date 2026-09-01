"use client";

/**
 * Lazy-loaded three.js scene for the Zi Wei Dou Shu (자미두수) 12-palace wheel.
 *
 * Palaces are placed by their earthly-branch `index` (0-11), which is the
 * canonical position used in traditional Zi Wei charts — this is not a
 * decorative order, it is the actual chart layout. Node size reflects how
 * many stars landed in that palace; the life palace (命宮) is highlighted.
 */

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import type { Palace, PalaceKey } from "@/lib/ontology/ziwei/types";
import { useReducedMotion } from "@/hooks/useMotion";

const RADIUS = 2.8;
const BASE_SIZE = 0.16;
const SIZE_PER_STAR = 0.05;

function nodePosition(index: number): [number, number, number] {
  const angle = (index / 12) * Math.PI * 2 - Math.PI / 2;
  return [Math.cos(angle) * RADIUS, Math.sin(angle) * RADIUS, 0];
}

function PalaceNode({ palace, isLife }: { palace: Palace; isLife: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  const position = useMemo(() => nodePosition(palace.index), [palace.index]);
  const size = BASE_SIZE + SIZE_PER_STAR * palace.stars.length;
  const color = isLife ? "#c084fc" : palace.stars.length > 0 ? "#a78bfa" : "#4c1d95";

  useFrame(({ clock }) => {
    if (!mesh.current || !isLife) return;
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.2) * 0.1;
    mesh.current.scale.setScalar(pulse);
  });

  return (
    <group position={position}>
      <mesh ref={mesh}>
        <sphereGeometry args={[size, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isLife ? 1.1 : 0.4 + palace.stars.length * 0.08}
          roughness={0.4}
          metalness={0.15}
        />
      </mesh>
      {isLife && (
        <mesh scale={1.9}>
          <sphereGeometry args={[size, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.16} depthWrite={false} />
        </mesh>
      )}
      <pointLight color={color} intensity={isLife ? 0.7 : 0.25} distance={3.5} />
    </group>
  );
}

function ringGeometry(): THREE.BufferGeometry {
  const segments = 12;
  const positions: number[] = [];
  for (let i = 0; i <= segments; i += 1) {
    const [x, y, z] = nodePosition(i % segments);
    positions.push(x, y, z);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return geo;
}

function Scene({ palaces, lifeKey, animate }: { palaces: Record<PalaceKey, Palace>; lifeKey: PalaceKey; animate: boolean }) {
  const group = useRef<THREE.Group>(null);
  const ring = useMemo(() => ringGeometry(), []);

  useFrame((_, delta) => {
    if (animate && group.current) group.current.rotation.z += delta * 0.05;
  });

  return (
    <group ref={group}>
      <ambientLight intensity={0.5} />
      <lineLoop geometry={ring}>
        <lineBasicMaterial color="#c4b5fd" transparent opacity={0.35} />
      </lineLoop>
      {Object.values(palaces).map((palace) => (
        <PalaceNode key={palace.key} palace={palace} isLife={palace.key === lifeKey} />
      ))}
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
        rotateSpeed={0.5}
        makeDefault
      />
    </group>
  );
}

export interface ZiWeiWheelSceneProps {
  palaces: Record<PalaceKey, Palace>;
  lifeKey: PalaceKey;
  /** false when prefers-reduced-motion — renders one static frame. */
  animate?: boolean;
  /** Cap device pixel ratio on small screens. */
  maxDpr?: number;
}

export default function ZiWeiWheelScene({ palaces, lifeKey, animate: animateProp = true, maxDpr = 2 }: ZiWeiWheelSceneProps) {
  // The CSS motion contract cannot reach inside a canvas — a scene that
  // rotates every frame has to read the preference itself. This also drops
  // the r3f frameloop to "demand", so nothing renders while idle.
  const reducedMotion = useReducedMotion();
  const animate = animateProp && !reducedMotion;
  return (
    <Canvas
      camera={{ position: [0, 0, 7.5], fov: 42 }}
      dpr={[1, maxDpr]}
      gl={{ antialias: true, powerPreference: "low-power" }}
      frameloop={animate ? "always" : "demand"}
      style={{ touchAction: "none" }}
    >
      <color attach="background" args={["#1e1033"]} />
      <Scene palaces={palaces} lifeKey={lifeKey} animate={animate} />
    </Canvas>
  );
}
