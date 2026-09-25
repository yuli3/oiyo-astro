"use client";

/**
 * Lazy-loaded three.js scene for the saju Five Elements (오행) balance.
 *
 * Nodes sit on a pentagon in the canonical Wu Xing order
 * [Wood, Fire, Earth, Metal, Water]. Connecting adjacent nodes traces the
 * generating cycle (相生: Wood→Fire→Earth→Metal→Water→Wood); connecting
 * every second node traces the controlling cycle (相剋), the classic
 * five-element star. Node size reflects how many of the four pillars'
 * eight stem/branch slots landed on that element.
 */

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/useMotion";
import { planElementFlow } from "./element-flow";

export const ELEMENT_ORDER = ["Wood", "Fire", "Earth", "Metal", "Water"] as const;
export type ElementKey = (typeof ELEMENT_ORDER)[number];

const ELEMENT_HEX: Record<ElementKey, string> = {
  Wood: "#4ade80",
  Fire: "#f87171",
  Earth: "#facc15",
  Metal: "#e5e7eb",
  Water: "#38bdf8",
};

const RADIUS = 2.6;
const BASE_SIZE = 0.28;
const SIZE_PER_COUNT = 0.16;

function nodePosition(index: number): [number, number, number] {
  const angle = (index / ELEMENT_ORDER.length) * Math.PI * 2 - Math.PI / 2;
  return [Math.cos(angle) * RADIUS, Math.sin(angle) * RADIUS, 0];
}

function ringGeometry(indices: number[]): THREE.BufferGeometry {
  const positions: number[] = [];
  for (const i of indices) {
    const [x, y, z] = nodePosition(i);
    positions.push(x, y, z);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return geo;
}

function ElementNode({
  index,
  el,
  count,
  maxCount,
  dominant,
  missing,
}: {
  index: number;
  el: ElementKey;
  count: number;
  maxCount: number;
  dominant: boolean;
  missing: boolean;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const position = useMemo(() => nodePosition(index), [index]);
  const size = missing ? BASE_SIZE * 0.55 : BASE_SIZE + SIZE_PER_COUNT * (maxCount > 0 ? count / maxCount : 0) * 3;
  const color = ELEMENT_HEX[el];

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    if (dominant) {
      const pulse = 1 + Math.sin(clock.elapsedTime * 2.2) * 0.08;
      mesh.current.scale.setScalar(pulse);
    }
  });

  return (
    <group position={position}>
      <mesh ref={mesh}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={missing ? 0.15 : dominant ? 1.1 : 0.55}
          roughness={0.35}
          metalness={0.1}
          transparent={missing}
          opacity={missing ? 0.35 : 1}
        />
      </mesh>
      {dominant && (
        <mesh scale={1.8}>
          <sphereGeometry args={[size, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.14} depthWrite={false} />
        </mesh>
      )}
      <pointLight color={color} intensity={missing ? 0.1 : 0.6} distance={4} />
    </group>
  );
}

/**
 * 상생 고리를 따라 흐르는 빛 알갱이. 간선마다 낳는 쪽 오행 개수에 비례하고,
 * 받을 오행이 비어 있으면 그 앞(85%)에서 멈춰 쌓이며 흐려진다.
 */
function GenerationFlow({ elementCount, animate }: { elementCount: Record<string, number>; animate: boolean }) {
  const plan = useMemo(() => planElementFlow(elementCount), [elementCount]);
  const pack = useMemo(() => {
    const particles = plan.flatMap((edge) =>
      Array.from({ length: edge.particles }, (_, i) => ({
        edge,
        offset: (i + Math.random() * 0.6) / Math.max(1, edge.particles),
        speed: 0.12 + Math.random() * 0.08,
        wobble: Math.random() * Math.PI * 2,
      })),
    );
    const position = new Float32Array(particles.length * 3);
    const color = new Float32Array(particles.length * 3);
    particles.forEach((p, i) => {
      const c = new THREE.Color(ELEMENT_HEX[ELEMENT_ORDER[p.edge.from]]);
      color.set([c.r, c.g, c.b], i * 3);
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(color, 3));
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), RADIUS * 2);
    return { particles, position, geometry };
  }, [plan]);
  useEffect(() => () => pack.geometry.dispose(), [pack]);

  const place = (t: number) => {
    pack.particles.forEach((p, i) => {
      let f = (p.offset + t * p.speed) % 1;
      // 받을 기운이 없으면 끝까지 가지 못하고 앞에서 쌓인다.
      if (p.edge.blocked) f = Math.min(f * 1.15, 0.85);
      const [ax, ay] = nodePosition(p.edge.from);
      const [bx, by] = nodePosition(p.edge.to);
      // 고리 바깥으로 살짝 부푼 곡선을 따라간다.
      const bulge = Math.sin(f * Math.PI) * 0.35;
      const mx = (ax + bx) / 2;
      const my = (ay + by) / 2;
      const len = Math.hypot(mx, my) || 1;
      pack.position[i * 3] = ax + (bx - ax) * f + (mx / len) * bulge;
      pack.position[i * 3 + 1] = ay + (by - ay) * f + (my / len) * bulge;
      pack.position[i * 3 + 2] = Math.sin(t * 1.5 + p.wobble) * 0.08;
    });
    (pack.geometry.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
  };

  useFrame(({ clock }) => place(animate ? clock.elapsedTime : 2));

  return (
    <points geometry={pack.geometry}>
      <pointsMaterial vertexColors size={0.17} sizeAttenuation transparent opacity={0.85} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function Scene({
  elementCount,
  dominantElement,
  missingElements,
  animate,
}: {
  elementCount: Record<string, number>;
  dominantElement: string;
  missingElements: string[];
  animate: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const maxCount = Math.max(1, ...ELEMENT_ORDER.map((el) => elementCount[el] || 0));

  const generatingGeo = useMemo(() => ringGeometry([0, 1, 2, 3, 4, 0]), []);
  const controllingGeo = useMemo(() => ringGeometry([0, 2, 4, 1, 3, 0]), []);

  useFrame((_, delta) => {
    if (animate && group.current) group.current.rotation.z += delta * 0.06;
  });

  return (
    <group ref={group}>
      <ambientLight intensity={0.55} />
      <lineLoop geometry={generatingGeo}>
        <lineBasicMaterial color="#fde68a" transparent opacity={0.5} />
      </lineLoop>
      <lineSegments geometry={controllingGeo}>
        <lineBasicMaterial color="#fca5a5" transparent opacity={0.28} />
      </lineSegments>
      <GenerationFlow elementCount={elementCount} animate={animate} />
      {ELEMENT_ORDER.map((el, index) => (
        <ElementNode
          key={el}
          index={index}
          el={el}
          count={elementCount[el] || 0}
          maxCount={maxCount}
          dominant={el === dominantElement}
          missing={missingElements.includes(el)}
        />
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

export interface FiveElementsOrbitSceneProps {
  elementCount: Record<string, number>;
  dominantElement: string;
  missingElements: string[];
  /** false when prefers-reduced-motion — renders one static frame. */
  animate?: boolean;
  /** Cap device pixel ratio on small screens. */
  maxDpr?: number;
}

export default function FiveElementsOrbitScene({
  elementCount,
  dominantElement,
  missingElements,
  animate: animateProp = true,
  maxDpr = 2,
}: FiveElementsOrbitSceneProps) {
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
      <color attach="background" args={["#0b1220"]} />
      <Scene
        elementCount={elementCount}
        dominantElement={dominantElement}
        missingElements={missingElements}
        animate={animate}
      />
    </Canvas>
  );
}
