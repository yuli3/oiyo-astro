// 2026-11-10: the visitor's own 밤톨 walking around the temple (CHOSEUN: "캐릭이 이동하면 어떨까요").
// Moves only on this device. Destinations come from buttons, so it works the same on phones and with a keyboard.
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { chestnut, groundAt, type Spot } from './walk';

const P = { shell: '#5e3519', tip: '#3d2213', base: '#d2ad84', leaf: '#6fa055', eye: '#1a0f08', cheek: '#e89a8a', shadow: '#000000' } as const;

type Pt = [number, number];
/** Front of the stone lantern: every walk passes through here so nobody cuts through the buildings. */
const FRONT: Pt = [0, 3.5];
export const PAGODA_CENTER: Pt = [-6.3, -0.2];
const PAGODA_R = 2.6;
/** Waypoints from FRONT to each spot (x, z in scene units). The hall path goes round the lantern and up the stairs. */
const ROUTES: Record<Spot, Pt[]> = {
  yard: [[1.1, 3.1]],
  pagoda: [[-3.4, 3.0]],
  bell: [[3.2, 3.3], [4.3, 2.8]],
  hall: [[0.75, 2.5], [0.55, 1.85], [0.1, 1.2], [0, 0.8]],
};
/** Which way to face on arrival (0 = toward the camera). */
const FACING: Record<Spot, number> = { yard: 0, pagoda: 0, bell: Math.PI, hall: Math.PI };
const SPEED = 1.2;

function routeBetween(from: Spot, to: Spot): Pt[] {
  if (from === to) return ROUTES[to].slice(-1);
  const back = ROUTES[from].slice(0, -1).reverse();
  return [...back, FRONT, ...ROUTES[to]];
}

function useFigure() {
  return useMemo(() => {
    const shell = new THREE.MeshStandardMaterial({ color: P.shell, roughness: 0.5, metalness: 0.02, emissive: P.shell, emissiveIntensity: 0.06 });
    const base = new THREE.MeshStandardMaterial({ color: P.base, roughness: 0.9 });
    const dark = new THREE.MeshStandardMaterial({ color: P.tip, roughness: 0.7 });
    const leaf = new THREE.MeshStandardMaterial({ color: P.leaf, roughness: 0.6 });
    const eye = new THREE.MeshBasicMaterial({ color: P.eye });
    const cheek = new THREE.MeshBasicMaterial({ color: P.cheek, transparent: true, opacity: 0.75 });
    return { shell, base, dark, leaf, eye, cheek };
  }, []);
}

/** The chestnut figure itself, about 0.45 units tall, facing +z. `bow` 0→1 tips it forward. */
export function ChestnutFigure({ walkPhase = 0, bow = 0 }: { walkPhase?: number; bow?: number }) {
  const m = useFigure();
  const step = Math.sin(walkPhase);
  return <group rotation-x={bow * 1.0} position={[0, Math.abs(step) * 0.035, 0]}>
    <group rotation-z={step * 0.08} position={[0, 0.2, 0]}>
      <mesh material={m.shell} scale={[1, 0.92, 0.95]}><sphereGeometry args={[0.2, 28, 20]} /></mesh>
      {/* pale base of the nut */}
      <mesh material={m.base} position={[0, -0.005, 0]} scale={[1.01, 0.93, 0.96]}><sphereGeometry args={[0.2, 28, 10, 0, Math.PI * 2, Math.PI * 0.64, Math.PI * 0.36]} /></mesh>
      <mesh material={m.dark} position={[0, 0.2, 0]}><coneGeometry args={[0.035, 0.08, 10]} /></mesh>
      <mesh material={m.leaf} position={[0.05, 0.215, -0.01]} rotation={[0.2, 0.6, -0.5]} scale={[1, 0.18, 0.55]}><sphereGeometry args={[0.08, 14, 8]} /></mesh>
      {[-1, 1].map((s) => <group key={s}>
        <mesh material={m.eye} position={[s * 0.062, 0.03, 0.182]}><sphereGeometry args={[0.018, 10, 8]} /></mesh>
        <mesh material={m.cheek} position={[s * 0.112, -0.012, 0.158]} scale={[1, 0.6, 0.4]}><sphereGeometry args={[0.024, 10, 8]} /></mesh>
      </group>)}
    </group>
    {/* little feet, stepping in turn */}
    {[-1, 1].map((s) => <mesh key={s} material={m.dark} position={[s * 0.07, 0.025, 0.02 + s * step * 0.04]} scale={[1, 0.55, 1.4]}><sphereGeometry args={[0.04, 10, 8]} /></mesh>)}
  </group>;
}

/**
 * Walks the 밤톨 to `spot` along fixed paths; at the pagoda it keeps circling clockwise (탑돌이).
 * Calls `onArrive` once when it reaches a spot (the page uses it to step inside the hall).
 */
export function WalkingChestnut({ spot, onArrive }: { spot: Spot; onArrive?: (spot: Spot) => void }) {
  const { size } = useThree();
  const group = useRef<THREE.Group>(null);
  const figure = useRef<THREE.Group>(null);
  const shadow = useRef<THREE.Mesh>(null);
  const prev = useRef<Spot>(spot);
  const queue = useRef<Pt[]>([]);
  const orbit = useRef<number | null>(null);
  const arrived = useRef(true);
  const phase = useRef(0);
  const arrive = useRef(onArrive);
  arrive.current = onArrive;

  useEffect(() => {
    queue.current = routeBetween(prev.current, spot);
    orbit.current = null;
    arrived.current = false;
    prev.current = spot;
  }, [spot]);

  useFrame((_, dt) => {
    const g = group.current; if (!g) return;
    const step = Math.min(dt, 0.1) * SPEED;
    let dx = 0, dz = 0;
    const next = queue.current[0];
    if (next) {
      dx = next[0] - chestnut.x; dz = next[1] - chestnut.z;
      const d = Math.hypot(dx, dz);
      if (d <= step) { chestnut.x = next[0]; chestnut.z = next[1]; queue.current.shift(); }
      else { chestnut.x += (dx / d) * step; chestnut.z += (dz / d) * step; }
      if (!queue.current.length && spot === 'pagoda') orbit.current = Math.atan2(chestnut.z - PAGODA_CENTER[1], chestnut.x - PAGODA_CENTER[0]);
    } else if (orbit.current !== null) {
      // Clockwise seen from above, pagoda on the right shoulder, as in 탑돌이.
      const target = orbit.current + step / PAGODA_R;
      const nx = PAGODA_CENTER[0] + Math.cos(target) * PAGODA_R, nz = PAGODA_CENTER[1] + Math.sin(target) * PAGODA_R;
      dx = nx - chestnut.x; dz = nz - chestnut.z;
      const d = Math.hypot(dx, dz);
      if (d <= step * 1.5) orbit.current = target;
      chestnut.x += d > 0 ? (dx / d) * Math.min(step, d) : 0; chestnut.z += d > 0 ? (dz / d) * Math.min(step, d) : 0;
    }
    const moving = dx !== 0 || dz !== 0;
    chestnut.moving = moving;
    if (!moving && !arrived.current && !queue.current.length) { arrived.current = true; arrive.current?.(spot); }
    const want = moving ? Math.atan2(dx, dz) : FACING[spot];
    let diff = want - chestnut.heading;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    chestnut.heading += diff * Math.min(1, dt * 8);
    chestnut.y += (groundAt(chestnut.x, chestnut.z) - chestnut.y) * Math.min(1, dt * 10);
    phase.current = moving ? phase.current + dt * 11 : phase.current * 0.85;
    const s = size.width / size.height < 0.9 ? 1.45 : 1;
    g.position.set(chestnut.x, chestnut.y, chestnut.z);
    g.rotation.y = chestnut.heading;
    g.scale.setScalar(s);
    const f = figure.current;
    if (f) {
      const st = Math.sin(phase.current);
      f.position.y = Math.abs(st) * 0.035;
      f.rotation.z = st * 0.08;
    }
    if (shadow.current) shadow.current.scale.setScalar(1 - Math.abs(Math.sin(phase.current)) * 0.12);
  });

  return <group ref={group}>
    <group ref={figure}><ChestnutFigure /></group>
    <mesh ref={shadow} rotation-x={-Math.PI / 2} position={[0, 0.012, 0]}>
      <circleGeometry args={[0.2, 24]} /><meshBasicMaterial color={P.shadow} transparent opacity={0.35} depthWrite={false} />
    </mesh>
    {/* faint warm light so the little one reads at night */}
    <pointLight position={[0, 0.7, 0.5]} intensity={0.6} distance={1.6} decay={2} color={P.cheek} />
  </group>;
}
