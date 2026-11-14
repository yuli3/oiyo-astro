"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/useMotion";

export type ElementKey = "Wood" | "Fire" | "Earth" | "Metal" | "Water";

export const ELEMENT_HEX: Record<ElementKey, number> = {
  Wood: 0x22c55e,
  Fire: 0xef4444,
  Earth: 0xeab308,
  Metal: 0x94a3b8,
  Water: 0x0ea5e9,
};

export const ELEMENT_NAMES: Record<ElementKey, { ko: string; hanja: string; en: string }> = {
  Wood: { ko: "목 (나무)", hanja: "木", en: "Wood" },
  Fire: { ko: "화 (불)", hanja: "火", en: "Fire" },
  Earth: { ko: "토 (흙)", hanja: "土", en: "Earth" },
  Metal: { ko: "금 (쇠)", hanja: "金", en: "Metal" },
  Water: { ko: "수 (물)", hanja: "水", en: "Water" },
};

interface Props {
  elementCount: Record<string, number>;
  dominantElement?: string;
  focusedElement?: ElementKey | null;
  onSelectElement?: (element: ElementKey) => void;
  autoRotate?: boolean;
}

const CUBE_POSITIONS: [number, number, number][] = [];
for (let x = -1; x <= 1; x++) {
  for (let y = -1; y <= 1; y++) {
    for (let z = -1; z <= 1; z++) {
      if (x === 0 && y === 0 && z === 0) continue; // Skip center for core
      CUBE_POSITIONS.push([x * 0.95, y * 0.95, z * 0.95]);
    }
  }
}

function MiniCube({
  position,
  element,
  isFocused,
  onPointerDown,
}: {
  position: [number, number, number];
  element: ElementKey;
  isFocused: boolean;
  onPointerDown: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = ELEMENT_HEX[element];

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerDown={(e) => {
        e.stopPropagation();
        onPointerDown();
      }}
    >
      <boxGeometry args={[0.85, 0.85, 0.85]} />
      <meshStandardMaterial
        color={color}
        roughness={0.25}
        metalness={0.65}
        emissive={color}
        emissiveIntensity={isFocused ? 0.6 : 0.15}
      />
    </mesh>
  );
}

function EnergyCore({ dominantElement }: { dominantElement?: string }) {
  const coreRef = useRef<THREE.Mesh>(null);
  const elementKey = (dominantElement ?? "Wood") as ElementKey;
  const hex = ELEMENT_HEX[elementKey] ?? 0x22c55e;

  useFrame((state) => {
    if (!coreRef.current) return;
    const t = state.clock.getElapsedTime();
    const s = 0.9 + Math.sin(t * 3) * 0.12;
    coreRef.current.scale.set(s, s, s);
  });

  return (
    <mesh ref={coreRef} position={[0, 0, 0]}>
      <octahedronGeometry args={[0.55, 0]} />
      <meshStandardMaterial
        color={hex}
        emissive={hex}
        emissiveIntensity={1.2}
        roughness={0.1}
        metalness={0.9}
        wireframe
      />
    </mesh>
  );
}

function FloatingWisps({ elementCount }: { elementCount: Record<string, number> }) {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 40;

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const elements: ElementKey[] = ["Wood", "Fire", "Earth", "Metal", "Water"];

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 2.2 + Math.random() * 0.8;
      const y = (Math.random() - 0.5) * 3;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(angle) * radius;

      const el = elements[i % elements.length];
      const c = new THREE.Color(ELEMENT_HEX[el]);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    return { positions: pos, colors: col };
  }, [elementCount]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function CubeScene({
  elementCount,
  dominantElement,
  focusedElement,
  onSelectElement,
  autoRotate,
}: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const elementsList: ElementKey[] = ["Wood", "Fire", "Earth", "Metal", "Water"];

  const assignedElements = useMemo(() => {
    const pool: ElementKey[] = [];
    for (const el of elementsList) {
      const count = Math.max(1, elementCount[el] ?? 1);
      for (let i = 0; i < count; i++) {
        pool.push(el);
      }
    }
    return CUBE_POSITIONS.map((_, idx) => pool[idx % pool.length]);
  }, [elementCount]);

  useFrame((state) => {
    if (!groupRef.current || !autoRotate) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.25;
    groupRef.current.rotation.x = Math.sin(t * 0.15) * 0.15;
  });

  return (
    <group ref={groupRef}>
      {CUBE_POSITIONS.map((pos, idx) => {
        const el = assignedElements[idx];
        const isFocused = !focusedElement || focusedElement === el;
        return (
          <MiniCube
            key={idx}
            position={pos}
            element={el}
            isFocused={isFocused}
            onPointerDown={() => onSelectElement?.(el)}
          />
        );
      })}
      <EnergyCore dominantElement={dominantElement} />
      <FloatingWisps elementCount={elementCount} />
    </group>
  );
}

export default function SajuElementCube3DScene({
  elementCount,
  dominantElement,
  focusedElement,
  onSelectElement,
  autoRotate = true,
}: Props) {
  const reducedMotion = useReducedMotion();
  const shouldAnimate = autoRotate && !reducedMotion;

  return (
    <Canvas
      className="w-full h-full touch-none"
      camera={{ position: [3.8, 2.8, 4.5], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: "low-power" }}
    >
      <color attach="background" args={[0x090d16]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} />
      <pointLight position={[-4, -4, -4]} intensity={0.6} color={0x38bdf8} />
      <pointLight position={[4, -4, 4]} intensity={0.6} color={0xf87171} />

      <CubeScene
        elementCount={elementCount}
        dominantElement={dominantElement}
        focusedElement={focusedElement}
        onSelectElement={onSelectElement}
        autoRotate={shouldAnimate}
      />

      <OrbitControls
        enablePan={false}
        minDistance={3.5}
        maxDistance={9}
        autoRotate={false}
      />
    </Canvas>
  );
}
