"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/useMotion";

export type ChakraKey =
  | "crown"
  | "thirdEye"
  | "throat"
  | "heart"
  | "solarPlexus"
  | "sacral"
  | "root";

export interface ChakraMeta {
  key: ChakraKey;
  sanskrit: string;
  nameKo: string;
  nameEn: string;
  y: number;
  colorHex: number;
  elementKo: string;
  elementEn: string;
  frequencyHz: number;
  note: string;
}

export const CHAKRA_LIST: ChakraMeta[] = [
  {
    key: "crown",
    sanskrit: "Sahasrara (सहस्रार)",
    nameKo: "사하스라라 (왕관/정수리)",
    nameEn: "Crown Chakra",
    y: 2.2,
    colorHex: 0x9333ea, // Violet
    elementKo: "우주 의식 (Cosmos)",
    elementEn: "Cosmic Consciousness",
    frequencyHz: 963,
    note: "B",
  },
  {
    key: "thirdEye",
    sanskrit: "Ajna (आज्ञा)",
    nameKo: "아즈나 (제3의 눈/미간)",
    nameEn: "Third Eye Chakra",
    y: 1.5,
    colorHex: 0x4f46e5, // Indigo
    elementKo: "빛 / 직관 (Light)",
    elementEn: "Light & Intuition",
    frequencyHz: 852,
    note: "A",
  },
  {
    key: "throat",
    sanskrit: "Vishuddha (विशुद्ध)",
    nameKo: "비슈다 (목/인후)",
    nameEn: "Throat Chakra",
    y: 0.8,
    colorHex: 0x06b6d4, // Cyan
    elementKo: "에테르 / 금(金) (Ether)",
    elementEn: "Ether & Metal",
    frequencyHz: 741,
    note: "G",
  },
  {
    key: "heart",
    sanskrit: "Anahata (अनाहत)",
    nameKo: "아나하타 (가슴/심장)",
    nameEn: "Heart Chakra",
    y: 0.0,
    colorHex: 0x10b981, // Emerald Green
    elementKo: "공기 / 목(木) (Air/Wood)",
    elementEn: "Air & Wood",
    frequencyHz: 639,
    note: "F",
  },
  {
    key: "solarPlexus",
    sanskrit: "Manipura (मणिपूर)",
    nameKo: "마니푸라 (태양신경총/명치)",
    nameEn: "Solar Plexus Chakra",
    y: -0.7,
    colorHex: 0xf59e0b, // Amber Yellow
    elementKo: "불 / 화(火) (Fire)",
    elementEn: "Fire",
    frequencyHz: 528,
    note: "E",
  },
  {
    key: "sacral",
    sanskrit: "Svadhisthana (स्वाधिष्ठान)",
    nameKo: "스와디스타나 (천골/단전)",
    nameEn: "Sacral Chakra",
    y: -1.4,
    colorHex: 0xf97316, // Vibrant Orange
    elementKo: "물 / 수(水) (Water)",
    elementEn: "Water",
    frequencyHz: 417,
    note: "D",
  },
  {
    key: "root",
    sanskrit: "Muladhara (मूलाधार)",
    nameKo: "물라다라 (뿌리/미골)",
    nameEn: "Root Chakra",
    y: -2.1,
    colorHex: 0xef4444, // Grounded Red
    elementKo: "대지 / 토(土) (Earth)",
    elementEn: "Earth",
    frequencyHz: 396,
    note: "C",
  },
];

interface SceneProps {
  selectedChakra: ChakraKey | null;
  onSelectChakra: (key: ChakraKey) => void;
  autoRotate?: boolean;
  vitalityLevel?: number; // 0.5 to 2.0
}

function CentralSushumnaSpire({ vitality = 1.0 }: { vitality: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime() * vitality;
    const pulse = 1 + Math.sin(t * 2) * 0.06;
    meshRef.current.scale.set(pulse, 1, pulse);
  });

  return (
    <mesh ref={meshRef} position={[0, 0.05, 0]}>
      <cylinderGeometry args={[0.07, 0.09, 4.8, 24]} />
      <meshStandardMaterial
        color={0xffffff}
        emissive={0x60a5fa}
        emissiveIntensity={0.6}
        roughness={0.2}
        metalness={0.3}
        transparent
        opacity={0.4}
      />
    </mesh>
  );
}

function HelicalKundaliniNadis({ vitality = 1.0 }: { vitality: number }) {
  const idaRef = useRef<THREE.Points>(null);
  const pingalaRef = useRef<THREE.Points>(null);

  const { idaPoints, pingalaPoints } = useMemo(() => {
    const count = 180;
    const ida = new Float32Array(count * 3);
    const pingala = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const progress = i / count;
      const y = -2.3 + progress * 4.6;
      const angle = progress * Math.PI * 8; // 4 full double helix twists
      const radius = 0.35 + Math.sin(progress * Math.PI) * 0.15;

      // Ida (Moon / Yin)
      ida[i * 3] = Math.cos(angle) * radius;
      ida[i * 3 + 1] = y;
      ida[i * 3 + 2] = Math.sin(angle) * radius;

      // Pingala (Sun / Yang)
      pingala[i * 3] = Math.cos(angle + Math.PI) * radius;
      pingala[i * 3 + 1] = y;
      pingala[i * 3 + 2] = Math.sin(angle + Math.PI) * radius;
    }

    return { idaPoints: ida, pingalaPoints: pingala };
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * vitality * 0.5;
    if (idaRef.current) idaRef.current.rotation.y = t;
    if (pingalaRef.current) pingalaRef.current.rotation.y = -t;
  });

  return (
    <group>
      <points ref={idaRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[idaPoints, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          color={0x38bdf8} // Lunar Blue
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <points ref={pingalaRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[pingalaPoints, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          color={0xfb923c} // Solar Gold
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

function ChakraNode({
  chakra,
  isSelected,
  onPointerDown,
  vitality = 1.0,
}: {
  chakra: ChakraMeta;
  isSelected: boolean;
  onPointerDown: () => void;
  vitality: number;
}) {
  const orbRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * vitality;
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.8;
      ringRef.current.rotation.x = Math.PI / 2 + Math.sin(t * 1.5) * 0.15;
    }
    if (orbRef.current) {
      const breath = 1 + Math.sin(t * 3 + chakra.y) * 0.08;
      const targetScale = isSelected ? breath * 1.4 : breath;
      orbRef.current.scale.set(targetScale, targetScale, targetScale);
    }
  });

  return (
    <group position={[0, chakra.y, 0]}>
      {/* Central Energy Sphere */}
      <mesh
        ref={orbRef}
        onPointerDown={(e) => {
          e.stopPropagation();
          onPointerDown();
        }}
      >
        <sphereGeometry args={[0.22, 28, 28]} />
        <meshStandardMaterial
          color={chakra.colorHex}
          emissive={chakra.colorHex}
          emissiveIntensity={isSelected ? 1.5 : 0.7}
          roughness={0.15}
          metalness={0.2}
        />
      </mesh>

      {/* Lotus Aura Ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[0.42, 0.02, 16, 32]} />
        <meshBasicMaterial
          color={chakra.colorHex}
          transparent
          opacity={isSelected ? 0.9 : 0.45}
        />
      </mesh>

      {/* Selected Indicator Beacon */}
      {isSelected && (
        <pointLight
          color={chakra.colorHex}
          intensity={2.0}
          distance={2.5}
        />
      )}
    </group>
  );
}

function FiveElementsOrbit({ vitality = 1.0 }: { vitality: number }) {
  const orbitGroupRef = useRef<THREE.Group>(null);

  const elements = useMemo(
    () => [
      { name: "목(木)", color: 0x22c55e, angle: 0 },
      { name: "화(火)", color: 0xef4444, angle: (Math.PI * 2 * 1) / 5 },
      { name: "토(土)", color: 0xeab308, angle: (Math.PI * 2 * 2) / 5 },
      { name: "금(金)", color: 0x94a3b8, angle: (Math.PI * 2 * 3) / 5 },
      { name: "수(水)", color: 0x0ea5e9, angle: (Math.PI * 2 * 4) / 5 },
    ],
    []
  );

  useFrame((state) => {
    if (!orbitGroupRef.current) return;
    orbitGroupRef.current.rotation.y = state.clock.getElapsedTime() * vitality * 0.35;
  });

  return (
    <group ref={orbitGroupRef} position={[0, 0, 0]}>
      {elements.map((el, i) => {
        const radius = 1.6;
        const x = Math.cos(el.angle) * radius;
        const z = Math.sin(el.angle) * radius;
        return (
          <group key={i} position={[x, 0, z]}>
            <mesh>
              <sphereGeometry args={[0.09, 16, 16]} />
              <meshStandardMaterial
                color={el.color}
                emissive={el.color}
                emissiveIntensity={0.8}
                roughness={0.3}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function EnergyTotemSceneContent({
  selectedChakra,
  onSelectChakra,
  autoRotate = true,
  vitalityLevel = 1.0,
}: SceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current || !autoRotate) return;
    const t = state.clock.getElapsedTime() * vitalityLevel;
    groupRef.current.rotation.y = t * 0.2;
  });

  return (
    <group ref={groupRef}>
      <CentralSushumnaSpire vitality={vitalityLevel} />
      <HelicalKundaliniNadis vitality={vitalityLevel} />
      <FiveElementsOrbit vitality={vitalityLevel} />

      {CHAKRA_LIST.map((chakra) => (
        <ChakraNode
          key={chakra.key}
          chakra={chakra}
          isSelected={selectedChakra === chakra.key}
          onPointerDown={() => onSelectChakra(chakra.key)}
          vitality={vitalityLevel}
        />
      ))}
    </group>
  );
}

export default function EnergyChakraTotem3DScene({
  selectedChakra,
  onSelectChakra,
  autoRotate = true,
  vitalityLevel = 1.0,
}: SceneProps) {
  const reducedMotion = useReducedMotion();
  const shouldAnimate = autoRotate && !reducedMotion;

  return (
    <Canvas
      className="w-full h-full touch-none"
      camera={{ position: [3.2, 0.4, 4.2], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: "low-power" }}
    >
      <color attach="background" args={[0x070a13]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[4, 6, 4]} intensity={1.2} />
      <directionalLight position={[-4, -4, -3]} intensity={0.6} color={0x6366f1} />

      <EnergyTotemSceneContent
        selectedChakra={selectedChakra}
        onSelectChakra={onSelectChakra}
        autoRotate={shouldAnimate}
        vitalityLevel={reducedMotion ? 0.2 : vitalityLevel}
      />

      <OrbitControls
        enablePan={false}
        minDistance={2.8}
        maxDistance={7.5}
        target={[0, 0.1, 0]}
      />
    </Canvas>
  );
}
