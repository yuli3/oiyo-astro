// 2026-11-03: procedural 3D backdrops for the sanctuary (CHOSEUN: "산사, 물멍, 불멍, 불꽃놀이, 코스모스 3D로 확장").
// Everything is drawn from code (no downloaded models or textures), so it stays light and rights-clean.
// The canvas is decorative: pointer events pass through to the page and it is aria-hidden by the parent.
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { AdaptiveDpr, PerformanceMonitor, Sparkles, Stars } from '@react-three/drei';
import * as THREE from 'three';
import Temple from './TempleScene';

export type Scene3D = 'temple' | 'fire' | 'water' | 'fireworks' | 'cosmos';

/** Scene palette (three.js material colours, not CSS theme colours). */
const C = {
  c05060f: '#05060f',
  c06d6a0: '#06d6a0',
  c070a18: '#070a18',
  c0b0806: '#0b0806',
  c0b0d22: '#0b0d22',
  c0b1a24: '#0b1a24',
  c0d1020: '#0d1020',
  c0d1d1a: '#0d1d1a',
  c0f2229: '#0f2229',
  c102633: '#102633',
  c123f4a: '#123f4a',
  c14172c: '#14172c',
  c14302a: '#14302a',
  c17322b: '#17322b',
  c173a2c: '#173a2c',
  c191a3a: '#191a3a',
  c1b2140: '#1b2140',
  c1c3a32: '#1c3a32',
  c1d3328: '#1d3328',
  c1f2b1e: '#1f2b1e',
  c20170f: '#20170f',
  c2a2034: '#2a2034',
  c2a2f33: '#2a2f33',
  c2f6b5a: '#2f6b5a',
  c3b2416: '#3b2416',
  c4a3020: '#4a3020',
  c4f7a3a: '#4f7a3a',
  c5a1d06: '#5a1d06',
  c5a5a4f: '#5a5a4f',
  c5b5550: '#5b5550',
  c6a685d: '#6a685d',
  c6b2a22: '#6b2a22',
  c6d6a5e: '#6d6a5e',
  c6d7aa6: '#6d7aa6',
  c77756a: '#77756a',
  c7aa2ff: '#7aa2ff',
  c8a3a2c: '#8a3a2c',
  c8a5a00: '#8a5a00',
  c8fa2ff: '#8fa2ff',
  c9b1d0c: '#9b1d0c',
  c9fb7c9: '#9fb7c9',
  ca9c6d8: '#a9c6d8',
  cb23a8a: '#b23a8a',
  cc77dff: '#c77dff',
  cc9d6ff: '#c9d6ff',
  cc9d8ff: '#c9d8ff',
  cd6407c: '#d6407c',
  ce7c6ff: '#e7c6ff',
  cef476f: '#ef476f',
  cf1e7cc: '#f1e7cc',
  cf2c230: '#f2c230',
  cf3e6be: '#f3e6be',
  cf4c6dc: '#f4c6dc',
  cf4ecd2: '#f4ecd2',
  cf6c1d2: '#f6c1d2',
  cf6efd8: '#f6efd8',
  cf7a1c4: '#f7a1c4',
  cff8a1f: '#ff8a1f',
  cff9a3c: '#ff9a3c',
  cff9f1c: '#ff9f1c',
  cffa940: '#ffa940',
  cffb347: '#ffb347',
  cffb357: '#ffb357',
  cffb35c: '#ffb35c',
  cffb766: '#ffb766',
  cffcf7a: '#ffcf7a',
  cffd166: '#ffd166',
  cffd38a: '#ffd38a',
  cffd8e8: '#ffd8e8',
  cffd9a0: '#ffd9a0',
  cffe2c4: '#ffe2c4',
  cffe9a8: '#ffe9a8',
  cfff2b0: '#fff2b0',
  cfff4c2: '#fff4c2',
  cffffff: '#ffffff',
} as const;

let dotTexture: THREE.Texture | null = null;
/** Soft round sprite so points read as glows, not squares. */
function dot() {
  if (dotTexture) return dotTexture;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.35, 'rgba(255,255,255,.55)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  dotTexture = new THREE.CanvasTexture(c);
  return dotTexture;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/** Slow breathing drift of the camera around a target. */
function Drift({ target, radius, height, speed = 0.04 }: { target: [number, number, number]; radius: number; height: number; speed?: number }) {
  const { camera } = useThree();
  const look = useMemo(() => new THREE.Vector3(...target), [target]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed;
    camera.position.set(look.x + Math.sin(t) * radius * 0.25, height + Math.sin(t * 1.7) * 0.15, look.z + radius * Math.cos(t * 0.6) * 0.1 + radius);
    camera.lookAt(look);
  });
  return null;
}

/* ---------- 산사 (temple at night): see TempleScene.tsx ---------- */

/* ---------- 불멍 (campfire) ---------- */

function Flames({ count = 520 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const state = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const life = new Float32Array(count);
    const max = new Float32Array(count);
    for (let i = 0; i < count; i++) { life[i] = Math.random(); max[i] = rand(0.6, 1.3); }
    return { pos, col, vel, life, max };
  }, [count]);
  const hot = useMemo(() => new THREE.Color(C.cfff2b0), []);
  const mid = useMemo(() => new THREE.Color(C.cff8a1f), []);
  const cool = useMemo(() => new THREE.Color(C.c9b1d0c), []);
  const tmp = useMemo(() => new THREE.Color(), []);
  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    const { pos, col, vel, life, max } = state;
    for (let i = 0; i < count; i++) {
      const k = i * 3;
      life[i] += d / max[i];
      if (life[i] >= 1) {
        life[i] = 0;
        const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 0.45;
        pos[k] = Math.cos(a) * r; pos[k + 1] = 0.25; pos[k + 2] = Math.sin(a) * r;
        vel[k] = -pos[k] * 0.9; vel[k + 1] = rand(0.9, 1.7); vel[k + 2] = -pos[k + 2] * 0.9;
      }
      pos[k] += vel[k] * d + Math.sin(life[i] * 9 + i) * 0.003;
      pos[k + 1] += vel[k + 1] * d;
      pos[k + 2] += vel[k + 2] * d;
      const l = life[i];
      if (l < 0.35) tmp.copy(hot).lerp(mid, l / 0.35); else tmp.copy(mid).lerp(cool, (l - 0.35) / 0.65);
      const fade = 1 - l;
      col[k] = tmp.r * fade; col[k + 1] = tmp.g * fade; col[k + 2] = tmp.b * fade;
    }
    const g = ref.current?.geometry;
    if (g) { g.attributes.position.needsUpdate = true; g.attributes.color.needsUpdate = true; }
  });
  return <points ref={ref}>
    <bufferGeometry>
      <bufferAttribute attach="attributes-position" args={[state.pos, 3]} />
      <bufferAttribute attach="attributes-color" args={[state.col, 3]} />
    </bufferGeometry>
    <pointsMaterial map={dot()} size={0.55} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} />
  </points>;
}

function FireLight() {
  const ref = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (ref.current) ref.current.intensity = 6 + Math.sin(t * 7.3) * 0.8 + Math.sin(t * 13.1) * 0.5;
  });
  return <pointLight ref={ref} position={[0, 0.9, 0]} distance={14} decay={1.6} color={C.cff9a3c} />;
}

function Fire() {
  const logs = [0, 1, 2, 3, 4].map((i) => i * (Math.PI * 2) / 5);
  const stones = Array.from({ length: 12 }, (_, i) => (i / 12) * Math.PI * 2);
  return <>
    <color attach="background" args={[C.c0b0806]} />
    <fog attach="fog" args={[C.c0b0806, 6, 22]} />
    <ambientLight intensity={0.12} color={C.c6d7aa6} />
    <Stars radius={50} depth={15} count={1200} factor={3} fade speed={0.2} />
    <mesh rotation-x={-Math.PI / 2}><circleGeometry args={[30, 48]} /><meshStandardMaterial color={C.c20170f} /></mesh>
    {logs.map((a, i) => <mesh key={i} position={[Math.cos(a) * 0.35, 0.22, Math.sin(a) * 0.35]} rotation={[0, -a, Math.PI / 2.6]}>
      <cylinderGeometry args={[0.09, 0.11, 1.1, 8]} /><meshStandardMaterial color={C.c3b2416} emissive={C.c5a1d06} emissiveIntensity={0.6} />
    </mesh>)}
    {stones.map((a, i) => <mesh key={i} position={[Math.cos(a) * 0.95, 0.1, Math.sin(a) * 0.95]} scale={[1, 0.7, 1]}>
      <dodecahedronGeometry args={[0.17, 0]} /><meshStandardMaterial color={C.c5b5550} flatShading />
    </mesh>)}
    {/* simple seat logs around the fire */}
    {[-1, 1].map((s) => <mesh key={s} position={[s * 2.4, 0.2, 0.6]} rotation={[Math.PI / 2, 0, 0.2 * s]}><cylinderGeometry args={[0.2, 0.2, 1.6, 10]} /><meshStandardMaterial color={C.c4a3020} /></mesh>)}
    <Flames />
    <Sparkles count={40} scale={[2, 4, 2]} position={[0, 2.4, 0]} size={2.5} speed={0.8} color={C.cffb766} />
    <FireLight />
    <Drift target={[0, 0.7, 0]} radius={4.2} height={1.8} speed={0.05} />
  </>;
}

/* ---------- 물멍 (water) ---------- */

function Waves() {
  const geom = useMemo(() => {
    const g = new THREE.PlaneGeometry(60, 60, 90, 90);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const base = useMemo(() => Float32Array.from(geom.attributes.position.array), [geom]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const p = geom.attributes.position.array as Float32Array;
    for (let i = 0; i < p.length; i += 3) {
      const x = base[i], z = base[i + 2];
      p[i + 1] = Math.sin(x * 0.35 + t * 0.6) * 0.12 + Math.sin(z * 0.5 + t * 0.9) * 0.08 + Math.sin((x + z) * 0.9 + t * 1.4) * 0.03;
    }
    geom.attributes.position.needsUpdate = true;
  });
  return <mesh geometry={geom}><meshStandardMaterial color={C.c123f4a} metalness={0.25} roughness={0.65} flatShading /></mesh>;
}

function FloatingLanterns() {
  const ref = useRef<THREE.Group>(null);
  const items = useMemo(() => Array.from({ length: 9 }, () => ({ x: rand(-6, 6), z: rand(-12, 2), p: Math.random() * 6 })), []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    ref.current?.children.forEach((c, i) => {
      const it = items[i];
      c.position.set(it.x + Math.sin(t * 0.1 + it.p) * 0.4, 0.12 + Math.sin(t * 0.8 + it.p) * 0.06, it.z + ((t * 0.08 + it.p) % 4) - 2);
    });
  });
  return <group ref={ref}>{items.map((_, i) => <mesh key={i}><sphereGeometry args={[0.14, 12, 12]} /><meshStandardMaterial color={C.cffd9a0} emissive={C.cffb35c} emissiveIntensity={1.6} /></mesh>)}</group>;
}

function Water() {
  return <>
    <color attach="background" args={[C.c0b1a24]} />
    <fog attach="fog" args={[C.c102633, 10, 40]} />
    <ambientLight intensity={0.25} color={C.ca9c6d8} />
    <directionalLight position={[0, 6, -20]} intensity={0.4} color={C.cf1e7cc} />
    <Stars radius={70} depth={20} count={1800} factor={3} fade speed={0.2} />
    <mesh position={[0, 7, -30]}><sphereGeometry args={[1.8, 32, 32]} /><meshBasicMaterial color={C.cf6efd8} fog={false} /></mesh>
    {/* moon path on the water */}
    <mesh position={[0, 0.2, -12]} rotation-x={-Math.PI / 2}><planeGeometry args={[1.6, 34]} /><meshBasicMaterial color={C.cf3e6be} transparent opacity={0.07} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
    {[[-14, -26, 10, 5], [12, -28, 12, 6]].map(([x, z, r, h], i) => <mesh key={i} position={[x, h / 2 - 0.3, z]}><coneGeometry args={[r, h, 5]} /><meshStandardMaterial color={C.c0f2229} flatShading /></mesh>)}
    <Waves />
    <FloatingLanterns />
    <Drift target={[0, 0.4, -6]} radius={7} height={1.6} speed={0.03} />
  </>;
}

/* ---------- 불꽃놀이 (fireworks) ---------- */

const PALETTE = [C.cffd166, C.cef476f, C.c06d6a0, C.c7aa2ff, C.cffffff, C.cff9f1c, C.cc77dff];

function Fireworks({ max = 2400 }: { max?: number }) {
  const ref = useRef<THREE.Points>(null);
  const s = useMemo(() => ({
    pos: new Float32Array(max * 3), col: new Float32Array(max * 3), vel: new Float32Array(max * 3),
    base: new Float32Array(max * 3), life: new Float32Array(max).fill(1), dur: new Float32Array(max).fill(1),
    next: 0, timer: 0.4,
    rockets: [] as { p: THREE.Vector3; v: THREE.Vector3; top: number; color: THREE.Color }[],
  }), [max]);
  const c = useMemo(() => new THREE.Color(), []);
  const burst = (at: THREE.Vector3, color: THREE.Color) => {
    const n = Math.floor(rand(140, 220));
    const speed = rand(2.6, 4);
    const second = new THREE.Color(PALETTE[Math.floor(Math.random() * PALETTE.length)]);
    for (let j = 0; j < n; j++) {
      const i = s.next; s.next = (s.next + 1) % max;
      const k = i * 3;
      const u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2, r = Math.sqrt(1 - u * u);
      const sp = speed * rand(0.85, 1);
      s.pos[k] = at.x; s.pos[k + 1] = at.y; s.pos[k + 2] = at.z;
      s.vel[k] = r * Math.cos(a) * sp; s.vel[k + 1] = u * sp; s.vel[k + 2] = r * Math.sin(a) * sp;
      c.copy(j % 3 ? color : second);
      s.base[k] = c.r; s.base[k + 1] = c.g; s.base[k + 2] = c.b;
      s.life[i] = 0; s.dur[i] = rand(1.6, 2.6);
    }
  };
  useFrame((_, dt) => {
    const d = Math.min(dt, 0.1);
    s.timer -= d;
    if (s.timer <= 0) {
      s.timer = rand(0.7, 1.9);
      s.rockets.push({ p: new THREE.Vector3(rand(-6, 6), 0, rand(-11, -6)), v: new THREE.Vector3(rand(-0.4, 0.4), rand(6.5, 8), 0), top: rand(4.2, 6.8), color: new THREE.Color(PALETTE[Math.floor(Math.random() * PALETTE.length)]) });
    }
    s.rockets = s.rockets.filter((r) => {
      r.p.addScaledVector(r.v, d);
      r.v.y -= 2.2 * d;
      // a short spark trail while the shell climbs
      const i = s.next; s.next = (s.next + 1) % max; const k = i * 3;
      s.pos[k] = r.p.x; s.pos[k + 1] = r.p.y; s.pos[k + 2] = r.p.z; s.vel[k] = 0; s.vel[k + 1] = -0.3; s.vel[k + 2] = 0;
      s.base[k] = 1; s.base[k + 1] = 0.75; s.base[k + 2] = 0.45; s.life[i] = 0; s.dur[i] = 0.45;
      if (r.p.y >= r.top || r.v.y <= 0.5) { burst(r.p, r.color); return false; }
      return true;
    });
    for (let i = 0; i < max; i++) {
      const k = i * 3;
      if (s.life[i] >= 1) { s.col[k] = s.col[k + 1] = s.col[k + 2] = 0; continue; }
      s.life[i] = Math.min(1, s.life[i] + d / s.dur[i]);
      s.vel[k] *= 0.985; s.vel[k + 1] = s.vel[k + 1] * 0.985 - 1.6 * d; s.vel[k + 2] *= 0.985;
      s.pos[k] += s.vel[k] * d; s.pos[k + 1] += s.vel[k + 1] * d; s.pos[k + 2] += s.vel[k + 2] * d;
      const l = s.life[i];
      const f = 1.6 * Math.pow(1 - l, 1.5) * (0.75 + 0.25 * Math.sin(l * 60 + i));
      s.col[k] = s.base[k] * f; s.col[k + 1] = s.base[k + 1] * f; s.col[k + 2] = s.base[k + 2] * f;
    }
    const g = ref.current?.geometry;
    if (g) { g.attributes.position.needsUpdate = true; g.attributes.color.needsUpdate = true; }
  });
  return <points ref={ref} frustumCulled={false}>
    <bufferGeometry>
      <bufferAttribute attach="attributes-position" args={[s.pos, 3]} />
      <bufferAttribute attach="attributes-color" args={[s.col, 3]} />
    </bufferGeometry>
    <pointsMaterial map={dot()} size={0.6} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} />
  </points>;
}

function FireworksScene() {
  return <>
    <color attach="background" args={[C.c05060f]} />
    <ambientLight intensity={0.2} />
    <Stars radius={70} depth={20} count={1000} factor={2.5} fade speed={0.2} />
    {/* city-hill silhouette and a calm river that catches the colours */}
    {Array.from({ length: 18 }, (_, i) => <mesh key={i} position={[-17 + i * 2, 0.6 + ((i * 7) % 5) * 0.35, -16]}><boxGeometry args={[1.6, 1.2 + ((i * 7) % 5) * 0.7, 1]} /><meshStandardMaterial color={C.c0d1020} emissive={C.c1b2140} emissiveIntensity={0.25} /></mesh>)}
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, -4]}><planeGeometry args={[80, 30]} /><meshStandardMaterial color={C.c070a18} metalness={0.9} roughness={0.35} /></mesh>
    <Fireworks />
    <Drift target={[0, 4.5, -10]} radius={8} height={1.4} speed={0.02} />
  </>;
}

/* ---------- 코스모스 (cosmos flower field under the Milky Way) ---------- */

function petalGeometry() {
  const shapes: THREE.Shape[] = [];
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    const s = new THREE.Shape();
    s.absellipse(Math.cos(a) * 0.11, Math.sin(a) * 0.11, 0.1, 0.045, 0, Math.PI * 2, false, a);
    shapes.push(s);
  }
  const g = new THREE.ShapeGeometry(shapes, 6);
  g.rotateX(-Math.PI / 2 + 0.5);
  return g;
}

function CosmosField({ count = 520 }: { count?: number }) {
  const heads = useRef<THREE.InstancedMesh>(null);
  const stems = useRef<THREE.InstancedMesh>(null);
  const centers = useRef<THREE.InstancedMesh>(null);
  const petals = useMemo(petalGeometry, []);
  const data = useMemo(() => Array.from({ length: count }, () => {
    const z = rand(-18, 3);
    return { x: rand(-14, 14), z, h: rand(0.7, 1.4), p: Math.random() * 6, y: Math.random() * Math.PI * 2, s: rand(0.8, 1.25) };
  }), [count]);
  const colors = useMemo(() => [C.cf7a1c4, C.cffffff, C.cd6407c, C.cf4c6dc, C.cb23a8a].map((h) => new THREE.Color(h)), []);
  useEffect(() => {
    data.forEach((_, i) => heads.current?.setColorAt(i, colors[i % colors.length]));
    if (heads.current?.instanceColor) heads.current.instanceColor.needsUpdate = true;
  }, [data, colors]);
  const o = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    data.forEach((f, i) => {
      const sway = Math.sin(t * 0.9 + f.p + f.x * 0.25) * 0.12;
      const tx = f.x + Math.sin(sway) * f.h, ty = Math.cos(sway) * f.h;
      o.position.set(f.x + Math.sin(sway) * f.h / 2, ty / 2, f.z); o.rotation.set(0, 0, -sway); o.scale.set(1, f.h, 1); o.updateMatrix();
      stems.current?.setMatrixAt(i, o.matrix);
      o.position.set(tx, ty, f.z); o.rotation.set(0, f.y, -sway); o.scale.setScalar(f.s); o.updateMatrix();
      heads.current?.setMatrixAt(i, o.matrix);
      o.position.y += 0.02; o.updateMatrix();
      centers.current?.setMatrixAt(i, o.matrix);
    });
    for (const m of [heads.current, stems.current, centers.current]) if (m) m.instanceMatrix.needsUpdate = true;
  });
  return <>
    <instancedMesh ref={stems} args={[undefined, undefined, count]} frustumCulled={false}><cylinderGeometry args={[0.012, 0.016, 1, 4]} /><meshStandardMaterial color={C.c4f7a3a} /></instancedMesh>
    <instancedMesh ref={heads} args={[petals, undefined, count]} frustumCulled={false}><meshStandardMaterial side={THREE.DoubleSide} roughness={0.8} /></instancedMesh>
    <instancedMesh ref={centers} args={[undefined, undefined, count]} frustumCulled={false}><sphereGeometry args={[0.035, 8, 6]} /><meshStandardMaterial color={C.cf2c230} emissive={C.c8a5a00} emissiveIntensity={0.4} /></instancedMesh>
  </>;
}

function MilkyWay() {
  const geom = useMemo(() => {
    const n = 2600, p = new Float32Array(n * 3), c = new Float32Array(n * 3);
    const tint = [new THREE.Color(C.cc9d6ff), new THREE.Color(C.cffe2c4), new THREE.Color(C.ce7c6ff)];
    for (let i = 0; i < n; i++) {
      const along = rand(-60, 60), across = (Math.random() + Math.random() + Math.random() - 1.5) * 4;
      p[i * 3] = along; p[i * 3 + 1] = 14 + along * 0.25 + across; p[i * 3 + 2] = -40 + across * 2;
      const col = tint[i % 3]; const b = rand(0.3, 1);
      c[i * 3] = col.r * b; c[i * 3 + 1] = col.g * b; c[i * 3 + 2] = col.b * b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    g.setAttribute('color', new THREE.BufferAttribute(c, 3));
    return g;
  }, []);
  return <points geometry={geom}><pointsMaterial map={dot()} size={0.45} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} fog={false} /></points>;
}

function Cosmos() {
  return <>
    <color attach="background" args={[C.c0b0d22]} />
    <fog attach="fog" args={[C.c191a3a, 10, 34]} />
    <hemisphereLight args={[C.c8fa2ff, C.c2a2034, 0.55]} />
    <directionalLight position={[-4, 6, 6]} intensity={0.6} color={C.cffd8e8} />
    <Stars radius={80} depth={25} count={2200} factor={3.5} fade speed={0.4} />
    <MilkyWay />
    <mesh rotation-x={-Math.PI / 2}><planeGeometry args={[80, 80]} /><meshStandardMaterial color={C.c1f2b1e} /></mesh>
    {[[-16, -30, 12, 6], [6, -32, 15, 7]].map(([x, z, r, h], i) => <mesh key={i} position={[x, h / 2 - 0.3, z]}><coneGeometry args={[r, h, 6]} /><meshStandardMaterial color={C.c14172c} flatShading /></mesh>)}
    <CosmosField />
    <Sparkles count={40} scale={[16, 3, 12]} position={[0, 1.6, -6]} size={2.5} speed={0.3} color={C.cfff4c2} />
    <Drift target={[0, 1.2, -6]} radius={6} height={1.9} speed={0.035} />
  </>;
}

/** Dev-only renderer counts for the canvas inspector (threejs-aaa-graphics-builder budgets). */
function Diagnostics() {
  const { gl } = useThree();
  useFrame(({ clock }) => {
    if (!import.meta.env.DEV || Math.floor(clock.elapsedTime * 2) % 2) return;
    const i = gl.info;
    (window as unknown as Record<string, unknown>).__THREE_GAME_DIAGNOSTICS__ = {
      renderer: { calls: i.render.calls, triangles: i.render.triangles, geometries: i.memory.geometries, textures: i.memory.textures, dpr: gl.getPixelRatio() },
    };
  });
  return null;
}

/** Stop drawing while the tab is hidden or the backdrop is scrolled out of view (saves battery on phones). */
function useVisible(ref: RefObject<HTMLDivElement | null>) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    let onScreen = true;
    const update = () => setVisible(onScreen && document.visibilityState === 'visible');
    const io = new IntersectionObserver(([e]) => { onScreen = !!e?.isIntersecting; update(); });
    if (ref.current) io.observe(ref.current);
    document.addEventListener('visibilitychange', update);
    return () => { io.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, [ref]);
  return visible;
}

export default function SanctuaryScene3D({ scene }: { scene: Scene3D }) {
  const wrap = useRef<HTMLDivElement>(null);
  const visible = useVisible(wrap);
  // Start at up to 1.5x pixel ratio; drop to 1x if the device can't hold its frame rate, and back up when it recovers.
  const [dpr, setDpr] = useState(1.5);
  return <div ref={wrap} className="absolute inset-0 pointer-events-none"><Canvas
    dpr={[1, dpr]}
    frameloop={visible ? 'always' : 'never'}
    camera={{ position: [0, 2, 8], fov: 50, near: 0.1, far: 200 }}
    gl={{ antialias: true, powerPreference: 'low-power' }}
    className="absolute! inset-0 pointer-events-none"
  >
    <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} />
    <AdaptiveDpr pixelated={false} />
    <Diagnostics />
    {scene === 'temple' && <Temple />}
    {scene === 'fire' && <Fire />}
    {scene === 'water' && <Water />}
    {scene === 'fireworks' && <FireworksScene />}
    {scene === 'cosmos' && <Cosmos />}
  </Canvas></div>;
}
