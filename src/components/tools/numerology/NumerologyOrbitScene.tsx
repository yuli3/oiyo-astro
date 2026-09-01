"use client";

/**
 * Lazy-loaded three.js scene for the numerology result set — an arc of
 * glowing spheres, one per computed number (Life Path always present,
 * Expression/Soul Urge/Personality only when the name has Latin letters).
 * Sphere size scales with the number's value; master numbers (11/22/33)
 * glow gold instead of violet.
 */

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/useMotion";

const ARC_DEGREES = 90;
const RADIUS = 2.9;
const BASE_RADIUS = 0.28;

function nodePosition(index: number, count: number): [number, number, number] {
  if (count === 1) return [0, 0, 0];
  const spread = (ARC_DEGREES * Math.PI) / 180;
  const t = index / (count - 1) - 0.5;
  const angle = t * spread - Math.PI / 2;
  return [Math.cos(angle) * RADIUS, Math.sin(angle) * RADIUS + RADIUS, 0];
}

export interface NumerologyNode {
  value: number;
  isMaster: boolean;
}

function NumberSphere({ index, count, node }: { index: number; count: number; node: NumerologyNode }) {
  const mesh = useRef<THREE.Mesh>(null);
  const position = useMemo(() => nodePosition(index, count), [index, count]);
  const color = node.isMaster ? "#facc15" : "#a78bfa";
  // 1..33 (master numbers) mapped into a readable sphere-size range.
  const size = BASE_RADIUS * (0.7 + Math.min(node.value, 33) / 33);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const pulse = 1 + Math.sin(clock.elapsedTime * (node.isMaster ? 2.4 : 1.4) + index) * 0.08;
    mesh.current.scale.setScalar(pulse);
  });

  return (
    <group position={position}>
      <mesh ref={mesh}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={node.isMaster ? 1.1 : 0.55}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>
      {node.isMaster && (
        <mesh scale={1.8}>
          <sphereGeometry args={[size, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.2} depthWrite={false} />
        </mesh>
      )}
      <pointLight color={color} intensity={node.isMaster ? 0.8 : 0.4} distance={3.2} />
    </group>
  );
}

function Scene({ nodes, animate }: { nodes: NumerologyNode[]; animate: boolean }) {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (animate && group.current) group.current.rotation.y += delta * 0.05;
  });

  return (
    <group ref={group}>
      <ambientLight intensity={0.6} />
      {nodes.map((node, index) => (
        <NumberSphere key={index} index={index} count={nodes.length} node={node} />
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

export interface NumerologyOrbitSceneProps {
  nodes: NumerologyNode[];
  /** false when prefers-reduced-motion — renders one static frame. */
  animate?: boolean;
  /** Cap device pixel ratio on small screens. */
  maxDpr?: number;
}

export default function NumerologyOrbitScene({ nodes, animate: animateProp = true, maxDpr = 2 }: NumerologyOrbitSceneProps) {
  // The CSS motion contract cannot reach inside a canvas — a scene that
  // rotates every frame has to read the preference itself. This also drops
  // the r3f frameloop to "demand", so nothing renders while idle.
  const reducedMotion = useReducedMotion();
  const animate = animateProp && !reducedMotion;
  return (
    <Canvas
      camera={{ position: [0, 1.6, 6.4], fov: 42 }}
      dpr={[1, maxDpr]}
      gl={{ antialias: true, powerPreference: "low-power" }}
      frameloop={animate ? "always" : "demand"}
      style={{ touchAction: "none" }}
    >
      <color attach="background" args={["#140f24"]} />
      <Scene nodes={nodes} animate={animate} />
    </Canvas>
  );
}
