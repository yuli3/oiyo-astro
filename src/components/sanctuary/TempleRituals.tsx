// 2026-11-09: small rituals in the temple scene (CHOSEUN picked "연등 달기·범종 상호작용").
// Both run on the device only: the lantern colours live in localStorage, nothing is sent anywhere.
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/** Lantern colours offered to visitors; index order matches copy.lanternColors. */
export const LANTERN_COLORS = ['#ff9eb5', '#ff7f8f', '#ffd27a', '#fff1c9', '#9fe0b4', '#ffb37a'] as const;
export const MAX_LANTERNS = 12;
/** Where the bell pavilion stands; the camera leans toward it when the bell is struck. */
export const BELL_POS: [number, number, number] = [4.3, 0, 1.3];

const P = {
  wire: '#15130f', post: '#5a2a1e', stone: '#8d8574', bronze: '#55624a', bronzeHi: '#c9a24a', log: '#6b4a2e', rope: '#c8b98f', tile: '#3f454b', ring: '#ffe2b0',
} as const;

/* ---------- 내 연등: my own lantern string ---------- */

// Slots fill from the middle outward so the first lantern hangs in front of the door.
const SLOT_ORDER = [5, 6, 4, 7, 3, 8, 2, 9, 1, 10, 0, 11];
const STRING = { z: 2.75, y: 3.0, x0: -2.5, x1: 2.5, sag: 0.28 };

function lanternGeometry() {
  const g = new THREE.SphereGeometry(0.12, 16, 10);
  const p = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const k = 0.95 + 0.1 * Math.abs(Math.sin(Math.atan2(v.z, v.x) * 4));
    p.setXYZ(i, v.x * k, v.y * 0.88, v.z * k);
  }
  g.computeVertexNormals();
  return g;
}

let haloTex: THREE.Texture | null = null;
function halo() {
  if (haloTex) return haloTex;
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,.9)'); grad.addColorStop(0.4, 'rgba(255,255,255,.25)'); grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad; g.fillRect(0, 0, 64, 64);
  haloTex = new THREE.CanvasTexture(c);
  return haloTex;
}

function slotPos(slot: number) {
  const t = (slot + 0.5) / MAX_LANTERNS;
  return new THREE.Vector3(STRING.x0 + (STRING.x1 - STRING.x0) * t, STRING.y - STRING.sag * 4 * t * (1 - t) - 0.2, STRING.z);
}

/** Back-out spring: overshoots a little, then settles (game-feel "pop"). */
function popIn(t: number) {
  if (t >= 1) return 1;
  const c = 2.2;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
}

export function MyLanterns({ colors }: { colors: number[] }) {
  const { clock } = useThree();
  const births = useRef<number[]>([]);
  const first = useRef(true);
  // New lanterns get a birth time; ones restored from storage appear already settled.
  useEffect(() => {
    const now = clock.elapsedTime;
    if (births.current.length > colors.length) births.current = births.current.slice(births.current.length - colors.length);
    while (births.current.length < colors.length) births.current.push(first.current ? -100 : now);
    first.current = false;
  }, [colors, clock]);
  const geo = useMemo(() => lanternGeometry(), []);
  const groups = useRef<(THREE.Group | null)[]>([]);
  const wire = useMemo(() => {
    const pts = Array.from({ length: 13 }, (_, i) => { const t = i / 12; return new THREE.Vector3(STRING.x0 + (STRING.x1 - STRING.x0) * t, STRING.y - STRING.sag * 4 * t * (1 - t), STRING.z); });
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.008, 3);
  }, []);
  useFrame(({ clock: c }) => {
    const now = c.elapsedTime;
    groups.current.forEach((g, i) => {
      if (!g) return;
      const age = now - (births.current[i] ?? -100);
      const k = popIn(Math.min(1, age / 0.7));
      const base = slotPos(SLOT_ORDER[i]);
      const drop = Math.max(0, 1 - age / 0.7) * 0.7;
      g.position.set(base.x + Math.sin(now * 0.8 + i) * 0.012, base.y + drop * drop, base.z);
      g.rotation.z = Math.sin(now * 0.8 + i * 1.3) * 0.06 + Math.max(0, 1 - age / 1.6) * Math.sin(age * 9) * 0.25;
      g.scale.setScalar(Math.max(0.001, k));
      const glow = g.children[2] as THREE.Sprite | undefined;
      if (glow) (glow.material as THREE.SpriteMaterial).opacity = 0.45 + Math.max(0, 1 - age / 1.2) * 0.55 + Math.sin(now * 1.4 + i) * 0.05;
    });
  });
  if (!colors.length) return null;
  return <>
    <mesh geometry={wire}><meshBasicMaterial color={P.wire} /></mesh>
    {colors.map((ci, i) => {
      const col = LANTERN_COLORS[ci % LANTERN_COLORS.length];
      return <group key={i} ref={(el) => { groups.current[i] = el; }}>
        <mesh position={[0, 0.17, 0]}><cylinderGeometry args={[0.005, 0.005, 0.12, 3]} /><meshBasicMaterial color={P.wire} /></mesh>
        <mesh geometry={geo}><meshBasicMaterial color={col} toneMapped={false} /></mesh>
        <sprite scale={[0.75, 0.75, 1]}><spriteMaterial map={halo()} color={col} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.45} /></sprite>
        <mesh position={[0, -0.15, 0]}><coneGeometry args={[0.03, 0.12, 5]} /><meshBasicMaterial color={col} toneMapped={false} /></mesh>
      </group>;
    })}
  </>;
}

/* ---------- 범종각: bell pavilion ---------- */

function bellGeometry() {
  // Korean bell profile (bottom → top): flared lip, long straight body, rounded shoulder.
  const pts = [[0.4, 0], [0.4, 0.06], [0.35, 0.2], [0.32, 0.45], [0.31, 0.68], [0.29, 0.8], [0.22, 0.87], [0.0, 0.89]].map(([r, y]) => new THREE.Vector2(r, y));
  return new THREE.LatheGeometry(pts, 20);
}

const STRIKE_AT = 0.55; // seconds from the tap until the log meets the bell

export function BellPavilion({ ring }: { ring: number }) {
  const { clock } = useThree();
  const start = useRef(-100);
  const mounted = useRef(false);
  useEffect(() => { if (mounted.current) start.current = clock.elapsedTime; mounted.current = true; }, [ring, clock]);
  const bellGeo = useMemo(() => bellGeometry(), []);
  const bell = useRef<THREE.Group>(null);
  const log = useRef<THREE.Group>(null);
  const rings = useRef<(THREE.Mesh | null)[]>([]);
  const light = useRef<THREE.PointLight>(null);
  useFrame(({ clock: c }) => {
    const age = c.elapsedTime - start.current;
    // Striker: pull back, then swing into the bell, then settle.
    let swing = 0;
    if (age < STRIKE_AT - 0.15) swing = 0.42 * Math.sin((age / (STRIKE_AT - 0.15)) * Math.PI / 2);
    else if (age < STRIKE_AT) swing = 0.42 * (1 - (age - (STRIKE_AT - 0.15)) / 0.15) - 0.04;
    else if (age < STRIKE_AT + 2) swing = -0.04 + Math.sin((age - STRIKE_AT) * 5) * 0.12 * Math.exp(-(age - STRIKE_AT) * 2.2);
    if (log.current) log.current.rotation.z = swing;
    const after = age - STRIKE_AT;
    if (bell.current) bell.current.rotation.z = after > 0 && after < 8 ? Math.sin(after * 4.2) * 0.05 * Math.exp(-after * 0.6) : 0;
    rings.current.forEach((m, i) => {
      if (!m) return;
      const t = after - i * 0.6;
      const on = t > 0 && t < 3.2;
      m.visible = on;
      if (on) { const s = 0.5 + t * 1.6; m.scale.set(s, s, s); (m.material as THREE.MeshBasicMaterial).opacity = 0.5 * (1 - t / 3.2); }
    });
    if (light.current) light.current.intensity = after > 0 && after < 3 ? 2.5 * Math.exp(-after * 1.4) : 0;
  });
  const posts: [number, number][] = [[-0.75, -0.75], [0.75, -0.75], [-0.75, 0.75], [0.75, 0.75]];
  return <group position={BELL_POS}>
    <mesh position={[0, 0.1, 0]}><boxGeometry args={[2, 0.2, 2]} /><meshStandardMaterial color={P.stone} roughness={1} /></mesh>
    {posts.map(([x, z], i) => <mesh key={i} position={[x, 1.15, z]}><cylinderGeometry args={[0.07, 0.08, 1.9, 8]} /><meshStandardMaterial color={P.post} roughness={0.8} /></mesh>)}
    <mesh position={[0, 2.12, 0]}><boxGeometry args={[1.7, 0.1, 1.7]} /><meshStandardMaterial color={P.post} roughness={0.8} /></mesh>
    <mesh position={[0, 2.42, 0]} rotation-y={Math.PI / 4}><coneGeometry args={[1.55, 0.55, 4, 1]} /><meshStandardMaterial color={P.tile} roughness={0.8} flatShading /></mesh>
    <mesh position={[0, 1.98, 0]}><boxGeometry args={[1.5, 0.08, 0.1]} /><meshStandardMaterial color={P.post} /></mesh>
    <group ref={bell} position={[0, 1.95, 0]}>
      <mesh position={[0, -0.05, 0]}><torusGeometry args={[0.06, 0.02, 6, 12]} /><meshStandardMaterial color={P.bronze} metalness={0.8} roughness={0.45} /></mesh>
      <mesh geometry={bellGeo} position={[0, -1.0, 0]}><meshStandardMaterial color={P.bronze} metalness={0.75} roughness={0.42} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, -0.72, 0.305]}><circleGeometry args={[0.07, 12]} /><meshStandardMaterial color={P.bronzeHi} metalness={0.8} roughness={0.35} /></mesh>
      <pointLight ref={light} position={[0, -0.6, 0.6]} intensity={0} distance={4} color={P.ring} />
    </group>
    {/* 당목: wooden log hung by two ropes, swinging about the beam */}
    <group ref={log} position={[0.8, 1.98, 0]}>
      {[-0.25, 0.25].map((x) => <mesh key={x} position={[x, -0.36, 0]}><cylinderGeometry args={[0.008, 0.008, 0.72, 3]} /><meshBasicMaterial color={P.rope} /></mesh>)}
      <mesh position={[0, -0.72, 0]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.07, 0.08, 0.9, 10]} /><meshStandardMaterial color={P.log} roughness={0.9} /></mesh>
    </group>
    {[0, 1].map((i) => <mesh key={i} ref={(el) => { rings.current[i] = el; }} position={[0, 1.3, 0]} rotation-x={Math.PI / 2} visible={false}>
      <torusGeometry args={[0.5, 0.012, 6, 48]} /><meshBasicMaterial color={P.ring} transparent opacity={0} depthWrite={false} toneMapped={false} />
    </mesh>)}
  </group>;
}

/** 0→1→0 bump used by the camera to lean toward the bell for a few seconds after a strike. */
export function useBellFocus(ring: number) {
  const { clock } = useThree();
  const start = useRef(-100);
  const mounted = useRef(false);
  useEffect(() => { if (mounted.current) start.current = clock.elapsedTime; mounted.current = true; }, [ring, clock]);
  return (now: number) => {
    const t = now - start.current;
    if (t < 0 || t > 6) return 0;
    const up = Math.min(1, t / 0.9), down = t > 4 ? 1 - (t - 4) / 2 : 1;
    const s = Math.min(up, down);
    return s * s * (3 - 2 * s);
  };
}
