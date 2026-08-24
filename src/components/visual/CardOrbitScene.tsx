"use client";

/**
 * Reusable three.js scene: cards orbiting a center like planets.
 * Domain-agnostic — astrology/saju/palja/celtic/maya/numerology all pass
 * their own card list. No physics engine: orbital motion is pure
 * angle/trig (same approach as CompatibilityOrbitScene), so it stays
 * light and deterministic. Add a physics lib only if cards ever need to
 * collide or be thrown — plain revolution doesn't need one.
 */

import { Billboard, RoundedBox, Stars, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group, MutableRefObject } from "three";
import * as THREE from "three";

export interface CardOrbitItem {
  id: string;
  /** Short glyph/symbol shown on the card face (emoji or 1-2 chars). */
  glyph: string;
  /** Accent color for the card glow and border. */
  color: string;
  /** Orbit radius. Auto-assigned by ring if omitted. */
  radius?: number;
  /** Radians/sec. Auto-assigned if omitted (outer rings drift slower). */
  speed?: number;
  /** Starting angle in radians. Auto-spread evenly if omitted. */
  phase?: number;
  /** Card width/height in scene units. Default 0.9. */
  size?: number;
}

interface LaidOutCard extends Required<Pick<CardOrbitItem, "radius" | "speed" | "phase" | "size">> {
  id: string;
  glyph: string;
  color: string;
}

/** Spread cards evenly across up to 3 concentric rings when radius/speed/phase aren't given. */
function layoutCards(cards: CardOrbitItem[]): LaidOutCard[] {
  const RING_RADII = [2.2, 3.4, 4.6];
  const ringCounts = cards.length <= 6 ? [cards.length] : cards.length <= 12 ? [6, cards.length - 6] : [6, 6, cards.length - 12];

  let cursor = 0;
  const laidOut: LaidOutCard[] = [];
  ringCounts.forEach((count, ringIndex) => {
    for (let i = 0; i < count; i += 1) {
      const card = cards[cursor];
      cursor += 1;
      laidOut.push({
        id: card.id,
        glyph: card.glyph,
        color: card.color,
        radius: card.radius ?? RING_RADII[ringIndex],
        speed: card.speed ?? 0.18 - ringIndex * 0.04,
        phase: card.phase ?? (2 * Math.PI * i) / count + ringIndex * 0.4,
        size: card.size ?? 0.9,
      });
    }
  });
  return laidOut;
}

function OrbitRing({ radius }: { radius: number }) {
  const geometry = useMemo(() => {
    const segments = 96;
    const positions = new Float32Array(segments * 3);
    for (let i = 0; i < segments; i += 1) {
      const angle = (i / segments) * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [radius]);
  return (
    <lineLoop geometry={geometry}>
      <lineBasicMaterial color="#a3c96a" transparent opacity={0.22} />
    </lineLoop>
  );
}

function OrbitingCard({ card, timeRef }: { card: LaidOutCard; timeRef: MutableRefObject<number> }) {
  const group = useRef<Group>(null);
  useFrame(() => {
    if (!group.current) return;
    const angle = card.phase + timeRef.current * card.speed;
    group.current.position.set(Math.cos(angle) * card.radius, Math.sin(angle * 0.6) * 0.3, Math.sin(angle) * card.radius);
  });
  return (
    <group ref={group}>
      <Billboard>
        <RoundedBox args={[card.size, card.size * 1.4, 0.05]} radius={0.08} smoothness={4}>
          <meshStandardMaterial color="#111827" emissive={card.color} emissiveIntensity={0.35} roughness={0.4} metalness={0.2} />
        </RoundedBox>
        <Text fontSize={card.size * 0.55} color={card.color} anchorX="center" anchorY="middle" position={[0, 0, 0.04]}>
          {card.glyph}
        </Text>
        <pointLight color={card.color} intensity={0.6} distance={2.2} />
      </Billboard>
    </group>
  );
}

function Scene({ cards, animate }: { cards: LaidOutCard[]; animate: boolean }) {
  const timeRef = useRef(0);
  const core = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (animate) timeRef.current += delta;
    if (core.current) core.current.rotation.y += animate ? delta * 0.12 : 0;
  });
  const rings = useMemo(() => [...new Set(cards.map((c) => c.radius))], [cards]);

  return (
    <>
      <ambientLight intensity={0.32} />
      <pointLight position={[0, 0, 0]} intensity={2} distance={20} color="#d9f99d" />
      <mesh ref={core}>
        <icosahedronGeometry args={[0.55, 1]} />
        <meshStandardMaterial color="#a3c96a" emissive="#a3c96a" emissiveIntensity={1.1} roughness={0.35} wireframe />
      </mesh>
      <Stars radius={40} depth={20} count={700} factor={3} fade speed={animate ? 0.5 : 0} />
      {rings.map((radius) => (
        <OrbitRing key={radius} radius={radius} />
      ))}
      {cards.map((card) => (
        <OrbitingCard key={card.id} card={card} timeRef={timeRef} />
      ))}
    </>
  );
}

export interface CardOrbitSceneProps {
  cards: CardOrbitItem[];
  /** false when prefers-reduced-motion — renders one static frame. */
  animate?: boolean;
  /** Cap device pixel ratio on small screens. */
  maxDpr?: number;
}

export default function CardOrbitScene({ cards, animate = true, maxDpr = 2 }: CardOrbitSceneProps) {
  const laidOut = useMemo(() => layoutCards(cards), [cards]);
  return (
    <Canvas
      camera={{ position: [0, 4.5, 9], fov: 46 }}
      dpr={[1, maxDpr]}
      gl={{ antialias: true, powerPreference: "low-power" }}
      frameloop={animate ? "always" : "demand"}
      style={{ touchAction: "none" }}
    >
      <color attach="background" args={["#0b1220"]} />
      <fog attach="fog" args={["#0b1220", 16, 38]} />
      <Scene cards={laidOut} animate={animate} />
    </Canvas>
  );
}
