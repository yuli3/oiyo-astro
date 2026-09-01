"use client";

/**
 * Lazy-loaded three.js scene for the Celtic tree (Ogham) calendar wheel.
 *
 * The 13 lunar-month trees plus the intercalary Nameless Day are placed
 * evenly around the annual cycle in their real calendar order
 * (CELTIC_TREES is already ordered Dec 24 -> Dec 23). The user's own tree
 * is highlighted.
 */

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/useMotion";

const RADIUS = 2.8;
const BASE_SIZE = 0.2;

function nodePosition(index: number, total: number): [number, number, number] {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  return [Math.cos(angle) * RADIUS, Math.sin(angle) * RADIUS, 0];
}

function TreeNode({ index, total, isMine }: { index: number; total: number; isMine: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  const position = useMemo(() => nodePosition(index, total), [index, total]);
  const color = isMine ? "#facc15" : "#4d7c0f";

  useFrame(({ clock }) => {
    if (!mesh.current || !isMine) return;
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.2) * 0.12;
    mesh.current.scale.setScalar(pulse);
  });

  return (
    <group position={position}>
      <mesh ref={mesh}>
        <sphereGeometry args={[isMine ? BASE_SIZE * 1.6 : BASE_SIZE, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isMine ? 1.2 : 0.4}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>
      {isMine && (
        <mesh scale={2}>
          <sphereGeometry args={[BASE_SIZE, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.18} depthWrite={false} />
        </mesh>
      )}
      <pointLight color={color} intensity={isMine ? 0.7 : 0.2} distance={3.5} />
    </group>
  );
}

function ringGeometry(total: number): THREE.BufferGeometry {
  const positions: number[] = [];
  for (let i = 0; i <= total; i += 1) {
    const [x, y, z] = nodePosition(i % total, total);
    positions.push(x, y, z);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return geo;
}

function Scene({ total, myIndex, animate }: { total: number; myIndex: number; animate: boolean }) {
  const group = useRef<THREE.Group>(null);
  const ring = useMemo(() => ringGeometry(total), [total]);

  useFrame((_, delta) => {
    if (animate && group.current) group.current.rotation.z += delta * 0.04;
  });

  return (
    <group ref={group}>
      <ambientLight intensity={0.55} />
      <lineLoop geometry={ring}>
        <lineBasicMaterial color="#a3e635" transparent opacity={0.4} />
      </lineLoop>
      {Array.from({ length: total }, (_, index) => (
        <TreeNode key={index} index={index} total={total} isMine={index === myIndex} />
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

export interface CelticWheelSceneProps {
  total: number;
  myIndex: number;
  /** false when prefers-reduced-motion — renders one static frame. */
  animate?: boolean;
  /** Cap device pixel ratio on small screens. */
  maxDpr?: number;
}

export default function CelticWheelScene({ total, myIndex, animate: animateProp = true, maxDpr = 2 }: CelticWheelSceneProps) {
  // The CSS motion contract cannot reach inside a canvas — a scene that
  // rotates every frame has to read the preference itself. This also drops
  // the r3f frameloop to "demand", so nothing renders while idle.
  const reducedMotion = useReducedMotion();
  const animate = animateProp && !reducedMotion;
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 42 }}
      dpr={[1, maxDpr]}
      gl={{ antialias: true, powerPreference: "low-power" }}
      frameloop={animate ? "always" : "demand"}
      style={{ touchAction: "none" }}
    >
      <color attach="background" args={["#0f1a08"]} />
      <Scene total={total} myIndex={myIndex} animate={animate} />
    </Canvas>
  );
}
