import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, Instances, Instance } from "@react-three/drei";
import * as THREE from "three";

interface DnaHelixProps {
  progressRef: React.MutableRefObject<number>;
  visibleRange: [number, number];
  reducedMotion: boolean;
  quality: number;
}

const TURNS = 6;
const HEIGHT = 26;
const RADIUS = 2.4;
const POINTS_PER_TURN = 24;
const SPINE_RADIUS = 0.16;

function strandPoints(phaseOffset: number) {
  const total = TURNS * POINTS_PER_TURN;
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= total; i++) {
    const t = i / total;
    const angle = t * TURNS * Math.PI * 2 + phaseOffset;
    const y = t * HEIGHT - HEIGHT / 2;
    points.push(new THREE.Vector3(Math.cos(angle) * RADIUS, y, Math.sin(angle) * RADIUS));
  }
  return points;
}

export function DnaHelix({ progressRef, visibleRange, reducedMotion, quality }: DnaHelixProps) {
  const groupRef = useRef<THREE.Group>(null);
  const spineMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const strandA = useMemo(() => strandPoints(0), []);
  const strandB = useMemo(() => strandPoints(Math.PI), []);

  // Rungs are full crossbars from strand to strand, passing through the
  // spine — this is what makes the center read as a continuous spinal
  // column instead of a sparse trail of floating dots. Merged into a single
  // LineSegments geometry (one draw call) instead of one <Line> per rung —
  // 60+ separate fat-line objects were a real GPU/CPU cost at full quality.
  const rungsGeometry = useMemo(() => {
    const count = Math.round(TURNS * 10 * quality);
    const positions = new Float32Array(count * 2 * 3);
    const colors = new Float32Array(count * 2 * 3);
    const colorA = new THREE.Color("#f0abfc");
    const colorB = new THREE.Color("#facc15");
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const angle = t * TURNS * Math.PI * 2;
      const y = t * HEIGHT - HEIGHT / 2;
      const fromX = Math.cos(angle) * RADIUS;
      const fromZ = Math.sin(angle) * RADIUS;
      const toX = Math.cos(angle + Math.PI) * RADIUS;
      const toZ = Math.sin(angle + Math.PI) * RADIUS;
      const c = i % 2 === 0 ? colorA : colorB;
      positions.set([fromX, y, fromZ, toX, y, toZ], i * 6);
      colors.set([c.r, c.g, c.b, c.r, c.g, c.b], i * 6);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [quality]);

  const vertebrae = useMemo(() => {
    const spacing = 1.0;
    const count = Math.round(HEIGHT / spacing);
    return Array.from({ length: count }, (_, i) => {
      const y = (i / (count - 1)) * HEIGHT - HEIGHT / 2;
      return { position: [0, y, 0] as [number, number, number] };
    });
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const [start, end] = visibleRange;
    const p = progressRef.current;
    const local = THREE.MathUtils.clamp((p - start) / (end - start), 0, 1);
    const fade = local < 0.85 ? 1 : 1 - (local - 0.85) / 0.15;
    groupRef.current.visible = p >= start - 0.05 && p <= end + 0.05;
    groupRef.current.position.z = -local * 18;
    if (!reducedMotion) {
      groupRef.current.rotation.y += delta * 0.12;
    }
    groupRef.current.traverse((child) => {
      const mat = (child as THREE.Mesh).material as THREE.Material | undefined;
      if (mat && "opacity" in mat) {
        (mat as THREE.MeshBasicMaterial).transparent = true;
        (mat as THREE.MeshBasicMaterial).opacity = Math.max(0, fade);
      }
    });
    if (spineMatRef.current) {
      spineMatRef.current.opacity = Math.max(0, fade);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central spinal column */}
      <mesh>
        <cylinderGeometry args={[SPINE_RADIUS, SPINE_RADIUS, HEIGHT, 16, 1]} />
        <meshBasicMaterial ref={spineMatRef} color="#f5f0ff" transparent toneMapped={false} />
      </mesh>
      {/* Vertebrae segments along the spine */}
      <Instances limit={vertebrae.length}>
        <torusGeometry args={[SPINE_RADIUS * 2.2, SPINE_RADIUS * 0.45, 8, 16]} />
        <meshBasicMaterial color="#c4b5fd" transparent toneMapped={false} />
        {vertebrae.map((v, i) => (
          <Instance key={i} position={v.position} rotation={[Math.PI / 2, 0, 0]} />
        ))}
      </Instances>
      <Line points={strandA} color="#a855f7" lineWidth={2.5} />
      <Line points={strandB} color="#22d3ee" lineWidth={2.5} />
      <lineSegments geometry={rungsGeometry}>
        <lineBasicMaterial vertexColors transparent toneMapped={false} />
      </lineSegments>
    </group>
  );
}
