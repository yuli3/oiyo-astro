"use client";

/**
 * Lazy-loaded three.js scene for the tarot spread — an ambient arc of
 * glowing card panels that mirrors the flat card-flip grid above it.
 * Unrevealed cards sit dim and upright; once the player taps a card in
 * the flat grid, its 3D panel here lights up (amber for upright, rose
 * for reversed, matching the existing flip-card border colors) and
 * tilts to reflect the reversed draw.
 */

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/useMotion";

const ARC_DEGREES = 100;
const RADIUS = 3.1;
const CARD_W = 0.62;
const CARD_H = 0.94;

function cardPosition(index: number, count: number): [number, number, number] {
  if (count === 1) return [0, 0, 0];
  const spread = (ARC_DEGREES * Math.PI) / 180;
  const t = index / (count - 1) - 0.5;
  const angle = t * spread - Math.PI / 2;
  return [Math.cos(angle) * RADIUS, Math.sin(angle) * RADIUS + RADIUS, 0];
}

interface SpreadCardState {
  reversed: boolean;
  revealed: boolean;
}

function CardPanel({
  index,
  count,
  card,
}: {
  index: number;
  count: number;
  card: SpreadCardState;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const position = useMemo(() => cardPosition(index, count), [index, count]);
  const color = !card.revealed ? "#4d7c0f" : card.reversed ? "#fb7185" : "#facc15";

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    if (card.revealed) {
      const pulse = 1 + Math.sin(clock.elapsedTime * 2 + index) * 0.05;
      mesh.current.scale.set(pulse, pulse, 1);
    }
  });

  return (
    <group position={position} rotation={[0, 0, card.revealed && card.reversed ? Math.PI : 0]}>
      <mesh ref={mesh}>
        <boxGeometry args={[CARD_W, CARD_H, 0.04]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={card.revealed ? 0.9 : 0.25}
          roughness={0.35}
          metalness={0.15}
        />
      </mesh>
      {card.revealed && (
        <mesh scale={[1.35, 1.2, 1]}>
          <boxGeometry args={[CARD_W, CARD_H, 0.02]} />
          <meshBasicMaterial color={color} transparent opacity={0.16} depthWrite={false} />
        </mesh>
      )}
      <pointLight color={color} intensity={card.revealed ? 0.6 : 0.15} distance={2.8} />
    </group>
  );
}

function Scene({ cards, animate }: { cards: SpreadCardState[]; animate: boolean }) {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (animate && group.current) group.current.rotation.y = Math.sin(Date.now() * 0.00015) * 0.12;
  });

  return (
    <group ref={group}>
      <ambientLight intensity={0.6} />
      {cards.map((card, index) => (
        <CardPanel key={index} index={index} count={cards.length} card={card} />
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

export interface TarotSpreadSceneProps {
  cards: SpreadCardState[];
  /** false when prefers-reduced-motion — renders one static frame. */
  animate?: boolean;
  /** Cap device pixel ratio on small screens. */
  maxDpr?: number;
}

export default function TarotSpreadScene({ cards, animate: animateProp = true, maxDpr = 2 }: TarotSpreadSceneProps) {
  // The CSS motion contract cannot reach inside a canvas — a scene that
  // rotates every frame has to read the preference itself. This also drops
  // the r3f frameloop to "demand", so nothing renders while idle.
  const reducedMotion = useReducedMotion();
  const animate = animateProp && !reducedMotion;
  return (
    <Canvas
      camera={{ position: [0, 1.6, 6.2], fov: 42 }}
      dpr={[1, maxDpr]}
      gl={{ antialias: true, powerPreference: "low-power" }}
      frameloop={animate ? "always" : "demand"}
      style={{ touchAction: "none" }}
    >
      <color attach="background" args={["#0f1a08"]} />
      <Scene cards={cards} animate={animate} />
    </Canvas>
  );
}
