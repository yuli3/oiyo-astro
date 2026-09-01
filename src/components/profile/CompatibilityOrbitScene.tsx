"use client";

/**
 * Lazy-loaded three.js scene for the multi-person compatibility orbit.
 * Imported dynamically by CompatibilityOrbit.tsx so the heavy
 * three/@react-three bundles stay out of the initial page payload.
 */

import { OrbitControls, Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import type { OrbitLayout } from "@/lib/symbolic-tradition/orbit-layout";
import { useReducedMotion } from "@/hooks/useMotion";

const SUN_COLOR = "#f59e0b";

interface BodyPosition {
  x: number;
  y: number;
  z: number;
}

function bodyPosition(
  body: OrbitLayout["bodies"][number],
  t: number,
): BodyPosition {
  const angle = body.phase + t * body.speed;
  const x = Math.cos(angle) * body.radius;
  const z = Math.sin(angle) * body.radius;
  // Apply orbital plane tilts.
  const cosX = Math.cos(body.inclinationX);
  const sinX = Math.sin(body.inclinationX);
  const y1 = -z * sinX;
  const z1 = z * cosX;
  return { x, y: y1, z: z1 };
}

function Planet({ body, timeRef }: { body: OrbitLayout["bodies"][number]; timeRef: React.MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!group.current) return;
    const pos = bodyPosition(body, timeRef.current);
    group.current.position.set(pos.x, pos.y, pos.z);
  });
  return (
    <group ref={group}>
      <mesh castShadow={false}>
        <sphereGeometry args={[body.size, 32, 32]} />
        <meshStandardMaterial
          color={body.color}
          emissive={body.color}
          emissiveIntensity={0.25 + body.glow * 0.9}
          roughness={0.35}
          metalness={0.15}
        />
      </mesh>
      {/* Harmony halo — brighter for closer relationships. */}
      <mesh scale={1.5 + body.glow * 0.7}>
        <sphereGeometry args={[body.size, 16, 16]} />
        <meshBasicMaterial color={body.color} transparent opacity={0.08 + body.glow * 0.14} depthWrite={false} />
      </mesh>
      <pointLight color={body.color} intensity={0.4 + body.glow * 1.2} distance={3} />
    </group>
  );
}

function OrbitRing({ radius, inclinationX, inclinationZ }: { radius: number; inclinationX: number; inclinationZ: number }) {
  const geometry = useMemo(() => {
    const segments = 128;
    const positions = new Float32Array(segments * 3);
    for (let i = 0; i < segments; i += 1) {
      const angle = (i / segments) * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    const attr = new THREE.BufferAttribute(positions, 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", attr);
    return geo;
  }, [radius]);
  const rotation = useMemo(
    () => new THREE.Euler(inclinationX, 0, inclinationZ),
    [inclinationX, inclinationZ],
  );
  return (
    <lineLoop geometry={geometry} rotation={rotation}>
      <lineBasicMaterial color="#a3c96a" transparent opacity={0.28} />
    </lineLoop>
  );
}

/** Pulsing energy arc connecting the two bodies in pair mode. */
function PairArc({ layout, timeRef }: { layout: Extract<Layout, { mode: "pair" }>; timeRef: React.MutableRefObject<number> }) {
  const lineRef = useRef<THREE.Line>(null);
  const geometry = useMemo(() => new THREE.BufferGeometry(), []);
  const material = useRef<THREE.LineBasicMaterial>(null);
  const curve = useMemo(() => new THREE.QuadraticBezierCurve3(new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()), []);

  useFrame(() => {
    if (!lineRef.current) return;
    const [left, right] = layout.bodies.map((body) => bodyPosition(body, timeRef.current));
    const midY = 1.4 + layout.pairHarmony / 100;
    curve.v0.set(left.x, left.y, left.z);
    curve.v1.set((left.x + right.x) / 2, midY, (left.z + right.z) / 2);
    curve.v2.set(right.x, right.y, right.z);
    const points = curve.getPoints(48);
    geometry.setFromPoints(points);
    if (material.current) {
      material.current.opacity = 0.45 + 0.25 * Math.sin(timeRef.current * 2.4);
    }
  });

  return (
    <line ref={lineRef} geometry={geometry}>
      <lineBasicMaterial ref={material} color="#d9f99d" transparent opacity={0.6} />
    </line>
  );
}

type Layout = OrbitLayout;

function Scene({ layout, animate }: { layout: Layout; animate: boolean }) {
  const timeRef = useRef(0);
  const sun = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (animate) timeRef.current += delta;
    if (sun.current) sun.current.rotation.y += animate ? delta * 0.15 : 0;
  });
  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight position={[0, 0, 0]} intensity={2.4} distance={22} color={SUN_COLOR} />
      {/* Central person rendered as the sun. */}
      <mesh ref={sun}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial
          color={SUN_COLOR}
          emissive={SUN_COLOR}
          emissiveIntensity={1.5}
          roughness={0.4}
        />
      </mesh>
      <mesh scale={1.25}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial color="#fde68a" transparent opacity={0.12} depthWrite={false} />
      </mesh>
      <Stars radius={40} depth={20} count={900} factor={3} fade speed={animate ? 0.6 : 0} />
      {layout.bodies.map((body) => (
        <group key={body.id}>
          {layout.mode === "system" && (
            <OrbitRing radius={body.radius} inclinationX={body.inclinationX} inclinationZ={body.inclinationZ} />
          )}
          <Planet body={body} timeRef={timeRef} />
        </group>
      ))}
      {layout.mode === "pair" && <PairArc layout={layout} timeRef={timeRef} />}
      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={5}
        maxDistance={18}
        rotateSpeed={0.55}
        makeDefault
      />
    </>
  );
}

export interface CompatibilityOrbitSceneProps {
  layout: OrbitLayout;
  /** false when prefers-reduced-motion — renders one static frame. */
  animate?: boolean;
  /** Cap device pixel ratio on small screens. */
  maxDpr?: number;
}

export default function CompatibilityOrbitScene({ layout, animate: animateProp = true, maxDpr = 2 }: CompatibilityOrbitSceneProps) {
  // The CSS motion contract cannot reach inside a canvas — a scene that
  // rotates every frame has to read the preference itself. This also drops
  // the r3f frameloop to "demand", so nothing renders while idle.
  const reducedMotion = useReducedMotion();
  const animate = animateProp && !reducedMotion;
  return (
    <Canvas
      camera={{ position: [0, 6.5, 12], fov: 46 }}
      dpr={[1, maxDpr]}
      gl={{ antialias: true, powerPreference: "low-power" }}
      frameloop={animate ? "always" : "demand"}
      style={{ touchAction: "none" }}
    >
      <color attach="background" args={["#0b1220"]} />
      <fog attach="fog" args={["#0b1220", 18, 42]} />
      <Scene layout={layout} animate={animate} />
    </Canvas>
  );
}
