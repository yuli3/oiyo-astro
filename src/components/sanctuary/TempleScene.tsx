// 2026-11-09: premium procedural pass for the 산사 backdrop (threejs-aaa-graphics-builder: authored forms →
// materials → lighting → effects). 11-09 photoreal pass: the hall, pagoda and courtyard here are now the
// fallback; scanned heritage buildings from HeritageModels.tsx replace them once they load.
// Layout: hall at z≈-1.5, courtyard in front, pagoda left, old pine right, lotus-lantern strings overhead,
// layered ridgelines behind. Camera framing widens on narrow (phone) screens.
import { Suspense, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sparkles, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { BELL_POS, BellPavilion, ConeRoof, MyLanterns, useBellFocus } from './TempleRituals';
import HeritageTemple, { HeritageBoundary, ScannedBellRoof } from './HeritageModels';
import BuddhaHall from './BuddhaHall';
import { WalkingChestnut } from './Chestnut';
import { chestnut, type Spot } from './walk';

/** Scene palette (three.js material colours, not CSS theme colours). */
const P = {
  c000000: '#000000',
  c15130f: '#15130f',
  c17241d: '#17241d',
  c2a2a2a: '#2a2a2a',
  c2e7a66: '#2e7a66',
  c3e4348: '#3e4348',
  c3f454b: '#3f454b',
  c4a3426: '#4a3426',
  c4c5258: '#4c5258',
  c4f555b: '#4f555b',
  c5c6268: '#5c6268',
  c7a3324: '#7a3324',
  c7f8fb8: '#7f8fb8',
  c8a6a2a: '#8a6a2a',
  c8d8574: '#8d8574',
  c8f3a2c: '#8f3a2c',
  c9fb4ff: '#9fb4ff',
  c9fb7c9: '#9fb7c9',
  ca58a3a: '#a58a3a',
  ca8a291: '#a8a291',
  cb8c8ff: '#b8c8ff',
  cb9ad8f: '#b9ad8f',
  cd8d1bd: '#d8d1bd',
  cf6efd8: '#f6efd8',
  cffb04a: '#ffb04a',
  cffb357: '#ffb357',
  cffb35c: '#ffb35c',
  cffd59a: '#ffd59a',
  cffe9a8: '#ffe9a8',
  cffffff: '#ffffff',
} as const;

/* ---------- small helpers ---------- */

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

const texCache = new Map<string, THREE.CanvasTexture>();
function canvasTexture(key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, repeat?: [number, number]) {
  const hit = texCache.get(key);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d')!, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); }
  texCache.set(key, t);
  return t;
}

/** Soft radial blob: contact shadows, moon halo, mist. */
function blobTexture() {
  return canvasTexture('blob', 128, 128, (g, w, h) => {
    const grad = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.5, 'rgba(255,255,255,.45)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad; g.fillRect(0, 0, w, h);
  });
}

/** Clay roof tiles: down-slope furrows with darker gaps and faint moss. */
function tileTexture() {
  return canvasTexture('tiles', 256, 256, (g, w, h) => {
    const r = seeded(7);
    g.fillStyle = '#3a3f44'; g.fillRect(0, 0, w, h);
    const n = 8;
    for (let i = 0; i < n; i++) {
      const x = (i / n) * w;
      const grad = g.createLinearGradient(x, 0, x + w / n, 0);
      grad.addColorStop(0, '#1d2125'); grad.addColorStop(0.25, '#4b5157'); grad.addColorStop(0.55, '#5a6168'); grad.addColorStop(0.85, '#353a3f'); grad.addColorStop(1, '#1d2125');
      g.fillStyle = grad; g.fillRect(x, 0, w / n, h);
    }
    for (let y = 0; y < h; y += 16) { g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, y, w, 2); }
    for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(${60 + r() * 40},${80 + r() * 50},${60 + r() * 30},${r() * 0.12})`; g.fillRect(r() * w, r() * h, 2 + r() * 6, 2 + r() * 4); }
  }, [1, 1]);
}

/** Underside of the eaves: rafters over dancheong green, the colour you see looking up at a Korean hall. */
function rafterTexture() {
  return canvasTexture('rafters', 256, 64, (g, w, h) => {
    g.fillStyle = '#1f5a4c'; g.fillRect(0, 0, w, h);
    const n = 16;
    for (let i = 0; i < n; i++) {
      const x = (i + 0.5) * (w / n);
      g.fillStyle = '#2e7a66'; g.fillRect(x - 5, 0, 10, h);
      g.fillStyle = '#c7553f'; g.fillRect(x - 5, h - 14, 10, 6);
      g.fillStyle = '#e9e0c4'; g.fillRect(x - 5, h - 8, 10, 3);
    }
  }, [1, 1]);
}

/** Dancheong beam band: green ground, red/white/blue medallions. */
function dancheongTexture() {
  return canvasTexture('dancheong', 512, 64, (g, w, h) => {
    g.fillStyle = '#25695a'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#8f3a2c'; g.fillRect(0, 0, w, 6); g.fillRect(0, h - 6, w, 6);
    for (let i = 0; i < 8; i++) {
      const cx = (i + 0.5) * (w / 8), cy = h / 2;
      g.fillStyle = '#e9e0c4'; g.beginPath(); g.ellipse(cx, cy, 22, 18, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#c7553f'; g.beginPath(); g.ellipse(cx, cy, 15, 12, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#3a5fa8'; g.beginPath(); g.ellipse(cx, cy, 7, 6, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#f2c230'; g.beginPath(); g.arc(cx, cy, 2.5, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#e9e0c4'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(cx - 32, 10); g.lineTo(cx - 26, cy); g.lineTo(cx - 32, h - 10); g.stroke();
      g.beginPath(); g.moveTo(cx + 32, 10); g.lineTo(cx + 26, cy); g.lineTo(cx + 32, h - 10); g.stroke();
    }
  }, [1, 1]);
}

/** Front doors: five bays of lattice doors with lamplight behind hanji paper. */
function doorTexture() {
  return canvasTexture('doors', 640, 220, (g, w, h) => {
    g.fillStyle = '#4a1f17'; g.fillRect(0, 0, w, h);
    const bays = 5, bw = w / bays;
    for (let b = 0; b < bays; b++) {
      const glow = b === 2 ? 1 : 0.72;
      for (let leaf = 0; leaf < 2; leaf++) {
        const x0 = b * bw + 8 + leaf * (bw / 2 - 4), lw = bw / 2 - 12, y0 = 12, lh = h - 24;
        const grad = g.createRadialGradient(x0 + lw / 2, y0 + lh * 0.55, 4, x0 + lw / 2, y0 + lh * 0.55, lh * 0.8);
        grad.addColorStop(0, `rgba(255,${Math.round(214 * glow + 30)},${Math.round(150 * glow)},1)`);
        grad.addColorStop(1, `rgba(${Math.round(200 * glow)},${Math.round(120 * glow)},60,1)`);
        g.fillStyle = grad; g.fillRect(x0, y0, lw, lh);
        g.strokeStyle = '#5a271c'; g.lineWidth = 2.2;
        for (let gx = x0 + 7; gx < x0 + lw; gx += 7) { g.beginPath(); g.moveTo(gx, y0); g.lineTo(gx, y0 + lh * 0.72); g.stroke(); }
        for (let gy = y0 + 7; gy < y0 + lh * 0.72; gy += 7) { g.beginPath(); g.moveTo(x0, gy); g.lineTo(x0 + lw, gy); g.stroke(); }
        g.fillStyle = '#5a271c'; g.fillRect(x0, y0 + lh * 0.72, lw, lh * 0.28);
        g.strokeStyle = '#7a3a2a'; g.lineWidth = 4; g.strokeRect(x0, y0, lw, lh);
      }
    }
  });
}

/** Granite: speckled grey. */
function graniteTexture() {
  return canvasTexture('granite', 128, 128, (g, w, h) => {
    const r = seeded(3);
    g.fillStyle = '#8b8678'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1400; i++) { const v = 90 + r() * 90; g.fillStyle = `rgba(${v},${v - 4},${v - 12},.5)`; g.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2); }
  }, [2, 2]);
}

/** Raked courtyard sand with faint rake lines. */
function courtyardTexture() {
  return canvasTexture('court', 256, 256, (g, w, h) => {
    const r = seeded(11);
    g.fillStyle = '#6d675a'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) { const v = 80 + r() * 60; g.fillStyle = `rgba(${v},${v - 4},${v - 14},.35)`; g.fillRect(r() * w, r() * h, 1.5, 1.5); }
    g.strokeStyle = 'rgba(40,36,30,.18)'; g.lineWidth = 1;
    for (let y = 4; y < h; y += 8) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  }, [3, 2]);
}

/* ---------- authored geometry ---------- */

/**
 * Korean hip roof with concave slopes, eaves that lift toward the corners (앙곡) and corners that reach out in
 * plan (안허리곡). Grid spacing is equal in x and z so the hip creases fall on vertices.
 */
function roofSurface(L: number, D: number, H: number, lift: number, n = 24) {
  const d = (2 * D) / n;
  const nx = Math.round((2 * L) / d);
  const Lx = (nx * d) / 2;
  const height = (x: number, z: number) => {
    const ex = Lx - Math.abs(x), ez = D - Math.abs(z);
    const f = Math.min(1, Math.min(ex, ez) / D);
    const base = H * (0.3 * f + 0.7 * f * f);
    const edge = Math.max(Math.abs(x) / Lx, Math.abs(z) / D);
    const corner = Math.pow(Math.max(Math.pow(Math.abs(x) / Lx, 5), Math.pow(Math.abs(z) / D, 3) * 0.35), 1) * Math.pow(edge, 3);
    return base + lift * corner * Math.pow(1 - f, 2);
  };
  const geo = new THREE.PlaneGeometry(2 * Lx, 2 * D, nx, n);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const uv = geo.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const ex = Lx - Math.abs(x), ez = D - Math.abs(z);
    const f = Math.min(1, Math.min(ex, ez) / D);
    const reach = 1 + 0.05 * (1 - f) * Math.pow(Math.abs(x) / Lx, 4);
    pos.setXYZ(i, x * (1 + 0.025 * (1 - f) * Math.pow(Math.abs(z) / D, 2)), height(x, z), z * reach);
    // Tile furrows run down-slope: across x on front/back, across z on the hip ends.
    if (ez <= ex) uv.setXY(i, x * 1.6, f * 3); else uv.setXY(i, z * 1.6, f * 3);
  }
  geo.computeVertexNormals();
  return { geo, Lx, height };
}

/** Thin fascia band joining the roof edge to its underside so the eave has visible thickness. */
function fascia(top: THREE.BufferGeometry, thickness: number, segX: number, segZ: number) {
  const pos = top.attributes.position as THREE.BufferAttribute;
  const idx = (ix: number, iz: number) => iz * (segX + 1) + ix;
  const ring: number[] = [];
  for (let ix = 0; ix <= segX; ix++) ring.push(idx(ix, 0));
  for (let iz = 1; iz <= segZ; iz++) ring.push(idx(segX, iz));
  for (let ix = segX - 1; ix >= 0; ix--) ring.push(idx(ix, segZ));
  for (let iz = segZ - 1; iz >= 0; iz--) ring.push(idx(0, iz));
  const v: number[] = [];
  for (let i = 0; i < ring.length - 1; i++) {
    const a = ring[i], b = ring[i + 1];
    const ax = pos.getX(a), ay = pos.getY(a), az = pos.getZ(a), bx = pos.getX(b), by = pos.getY(b), bz = pos.getZ(b);
    v.push(ax, ay, az, bx, by, bz, bx, by - thickness, bz, ax, ay, az, bx, by - thickness, bz, ax, ay - thickness, az);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  g.computeVertexNormals();
  return g;
}

/** Column with entasis (배흘림): swells a third of the way up. */
function columnGeometry(h: number, r: number) {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    pts.push(new THREE.Vector2(r * (0.86 + 0.14 * Math.sin(Math.PI * Math.min(1, t * 1.5))), t * h));
  }
  return new THREE.LatheGeometry(pts, 10);
}

/** Lotus lantern: sphere with eight petal ribs. */
function lotusGeometry() {
  const g = new THREE.SphereGeometry(0.1, 14, 8);
  const p = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const phi = Math.atan2(v.z, v.x);
    const k = 1 + 0.1 * Math.abs(Math.sin(phi * 4)) - 0.05;
    v.x *= k; v.z *= k; v.y *= 0.85;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

/** Ridgeline silhouette strip from layered sine noise. */
function ridgeGeometry(width: number, base: number, amp: number, seed: number) {
  const r = seeded(seed);
  const ph = [r() * 6, r() * 6, r() * 6];
  const v: number[] = [];
  const steps = 320;
  for (let i = 0; i < steps; i++) {
    const x0 = -width / 2 + (i / steps) * width, x1 = -width / 2 + ((i + 1) / steps) * width;
    // Broad ridges plus finer octaves so the skyline reads as forested slopes, not paper cut-outs.
    const y = (x: number) => base + amp * (0.55 * Math.sin(x * 0.09 + ph[0]) + 0.3 * Math.sin(x * 0.23 + ph[1]) + 0.15 * Math.sin(x * 0.61 + ph[2]) + 0.6
      + 0.05 * Math.sin(x * 1.7 + ph[0] * 3) + 0.025 * Math.sin(x * 3.9 + ph[1] * 5) + 0.012 * Math.sin(x * 8.3 + ph[2] * 7));
    v.push(x0, -4, 0, x1, -4, 0, x1, y(x1), 0, x0, -4, 0, x1, y(x1), 0, x0, y(x0), 0);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  return g;
}

/* ---------- scene parts ---------- */

const M = {
  tile: () => new THREE.MeshStandardMaterial({ map: tileTexture(), roughness: 0.75, metalness: 0.05 }),
};

function Hall() {
  const roof = useMemo(() => {
    const D = 2.55, n = 24;
    const r = roofSurface(3.9, D, 1.45, 0.55, n);
    const segX = Math.round((2 * r.Lx) / ((2 * D) / n));
    const under = r.geo.clone();
    under.translate(0, -0.09, 0);
    const edge = fascia(r.geo, 0.09, segX, n);
    // Hip ridges: follow the surface from the ridge ends down to each corner.
    const ridgeHalf = r.Lx - D;
    const hips: THREE.BufferGeometry[] = [];
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 12; i++) {
        const t = i / 12;
        const x = sx * (ridgeHalf + t * D * 0.999), z = sz * t * D * 0.999;
        const f = 1 - t;
        pts.push(new THREE.Vector3(x * (1 + 0.025 * (1 - f) * t * t), r.height(x, z) + 0.05, z * (1 + 0.05 * (1 - f) * Math.pow(Math.abs(x) / r.Lx, 4))));
      }
      hips.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.06, 6));
    }
    // Round end tiles (막새) along the front and back eaves.
    const ends: THREE.Matrix4[] = [];
    for (const sz of [-1, 1]) for (let i = -14; i <= 14; i++) {
      const x = (i / 14.6) * r.Lx;
      const reach = 1 + 0.05 * Math.pow(Math.abs(x) / r.Lx, 4);
      const m = new THREE.Matrix4().compose(new THREE.Vector3(x, r.height(x, sz * D) - 0.03, sz * D * reach + sz * 0.02), new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)), new THREE.Vector3(1, 1, 1));
      ends.push(m);
    }
    return { ...r, under, edge, hips: mergeGeometries(hips), ridgeHalf, ends };
  }, []);
  const endRef = useRef<THREE.InstancedMesh>(null);
  useEffect(() => { const m = endRef.current; if (!m) return; roof.ends.forEach((mat, i) => m.setMatrixAt(i, mat)); m.instanceMatrix.needsUpdate = true; }, [roof]);

  const columns = useMemo(() => {
    const xs = [-2.4, -1.44, -0.48, 0.48, 1.44, 2.4];
    const list: [number, number][] = [];
    for (const x of xs) { list.push([x, 1.42]); list.push([x, -1.42]); }
    list.push([-2.4, 0], [2.4, 0]);
    return list;
  }, []);
  const colRef = useRef<THREE.InstancedMesh>(null);
  const colGeo = useMemo(() => columnGeometry(1.95, 0.13), []);
  useEffect(() => {
    const m = colRef.current; if (!m) return;
    columns.forEach(([x, z], i) => m.setMatrixAt(i, new THREE.Matrix4().makeTranslation(x, 0.58, z)));
    m.instanceMatrix.needsUpdate = true;
  }, [columns]);

  const brackets = useMemo(() => {
    const list: THREE.Matrix4[] = [];
    for (const z of [1.5, -1.5]) for (let i = 0; i <= 14; i++) list.push(new THREE.Matrix4().makeTranslation(-2.55 + (i / 14) * 5.1, 2.78, z));
    for (const x of [-2.55, 2.55]) for (let i = 1; i < 8; i++) list.push(new THREE.Matrix4().makeTranslation(x, 2.78, -1.5 + (i / 8) * 3));
    return list;
  }, []);
  const brRef = useRef<THREE.InstancedMesh>(null);
  useEffect(() => { const m = brRef.current; if (!m) return; brackets.forEach((b, i) => m.setMatrixAt(i, b)); m.instanceMatrix.needsUpdate = true; }, [brackets]);

  const tileMat = useMemo(() => M.tile(), []);
  const granite = useMemo(() => new THREE.MeshStandardMaterial({ map: graniteTexture(), roughness: 0.95 }), []);
  const dancheong = useMemo(() => { const t = dancheongTexture().clone(); t.repeat.set(3, 1); t.wrapS = THREE.RepeatWrapping; t.needsUpdate = true; return t; }, []);
  const doors = useMemo(() => doorTexture(), []);
  const plaque = useMemo(() => canvasTexture('plaque', 256, 96, (g, w, h) => {
    g.fillStyle = '#1d1712'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#c9a24a'; g.lineWidth = 6; g.strokeRect(5, 5, w - 10, h - 10);
    g.fillStyle = '#e2c271'; g.font = '600 58px "Noto Serif KR","Nanum Myeongjo",serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('休 息 堂', w / 2, h / 2 + 3);
  }), []);

  const roofY = 2.86;
  const sideTex = useMemo(() => { const t = rafterTexture().clone(); t.wrapS = THREE.RepeatWrapping; t.repeat.set(4, 1); t.needsUpdate = true; return t; }, []);

  return <group position={[0, 0, -1.5]}>
    {/* 기단: two stepped granite tiers and front stairs */}
    <mesh position={[0, 0.2, 0]} material={granite}><boxGeometry args={[6.6, 0.4, 4.3]} /></mesh>
    <mesh position={[0, 0.48, 0]} material={granite}><boxGeometry args={[6.2, 0.18, 3.9]} /></mesh>
    <mesh position={[0, 0.58, 0]}><boxGeometry args={[6.3, 0.04, 4.0]} /><meshStandardMaterial color={P.ca8a291} roughness={0.9} /></mesh>
    {[0, 1, 2].map((i) => <mesh key={i} position={[0, 0.1 + i * 0.17, 2.55 - i * 0.22]} material={granite}><boxGeometry args={[1.9, 0.2 + i * 0.0, 0.3]} /></mesh>)}
    {/* columns */}
    <instancedMesh ref={colRef} args={[colGeo, undefined, columns.length]}><meshStandardMaterial color={P.c7a3324} roughness={0.7} /></instancedMesh>
    {/* walls: plastered sides/back, lattice doors at the front */}
    <mesh position={[0, 1.55, 0]}><boxGeometry args={[4.75, 1.95, 2.75]} /><meshStandardMaterial color={P.cb9ad8f} roughness={0.95} /></mesh>
    <mesh position={[0, 1.47, 1.39]}><planeGeometry args={[4.8, 1.75]} /><meshStandardMaterial map={doors} emissiveMap={doors} emissive={P.cffffff} emissiveIntensity={0.85} roughness={0.8} /></mesh>
    {/* beams with dancheong, brackets */}
    <mesh position={[0, 2.62, 0]}><boxGeometry args={[5.15, 0.26, 3.1]} /><meshStandardMaterial map={dancheong} roughness={0.8} /></mesh>
    <instancedMesh ref={brRef} args={[undefined, undefined, brackets.length]}><boxGeometry args={[0.16, 0.2, 0.34]} /><meshStandardMaterial color={P.c2e7a66} roughness={0.8} /></instancedMesh>
    <mesh position={[0, 2.84, 0]}><boxGeometry args={[5.3, 0.1, 3.3]} /><meshStandardMaterial color={P.c8f3a2c} roughness={0.8} /></mesh>
    {/* plaque */}
    <mesh position={[0, 2.44, 1.58]}><planeGeometry args={[1.1, 0.42]} /><meshStandardMaterial map={plaque} emissiveMap={plaque} emissive={P.cffffff} emissiveIntensity={0.25} /></mesh>
    {/* roof */}
    <group position={[0, roofY, 0]}>
      <mesh geometry={roof.geo} material={tileMat} />
      <mesh geometry={roof.under}><meshStandardMaterial map={sideTex} side={THREE.BackSide} roughness={0.9} /></mesh>
      <mesh geometry={roof.edge}><meshStandardMaterial color={P.cd8d1bd} roughness={0.9} side={THREE.DoubleSide} /></mesh>
      <mesh geometry={roof.hips}><meshStandardMaterial color={P.c5c6268} roughness={0.8} /></mesh>
      {/* main ridge with white mortar line and upturned end ornaments (취두) */}
      <mesh position={[0, 1.55, 0]}><boxGeometry args={[roof.ridgeHalf * 2 + 0.3, 0.24, 0.3]} /><meshStandardMaterial color={P.c4c5258} roughness={0.8} /></mesh>
      <mesh position={[0, 1.47, 0]}><boxGeometry args={[roof.ridgeHalf * 2 + 0.32, 0.05, 0.32]} /><meshStandardMaterial color={P.cd8d1bd} /></mesh>
      {[-1, 1].map((s) => <mesh key={s} position={[s * (roof.ridgeHalf + 0.2), 1.72, 0]} rotation-z={-s * 0.35}><coneGeometry args={[0.13, 0.5, 6]} /><meshStandardMaterial color={P.c3e4348} roughness={0.8} /></mesh>)}
      <instancedMesh ref={endRef} args={[undefined, undefined, roof.ends.length]}><cylinderGeometry args={[0.07, 0.07, 0.05, 10]} /><meshStandardMaterial color={P.c4f555b} roughness={0.7} /></instancedMesh>
    </group>
    <WindChimes corners={[[-roof.Lx * 1.05, roofY + roof.height(roof.Lx, 2.55) - 0.1, 2.55 * 1.05], [roof.Lx * 1.05, roofY + roof.height(roof.Lx, 2.55) - 0.1, 2.55 * 1.05]]} />
  </group>;
}

/** 풍경: little fish-bells at the front eave corners, swaying in the breeze. */
function WindChimes({ corners }: { corners: [number, number, number][] }) {
  const refs = useRef<(THREE.Group | null)[]>([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    refs.current.forEach((g, i) => { if (g) { g.rotation.z = Math.sin(t * 1.3 + i * 1.7) * 0.18; g.rotation.x = Math.sin(t * 0.9 + i) * 0.1; } });
  });
  return <>{corners.map((p, i) => <group key={i} position={p} ref={(el) => { refs.current[i] = el; }}>
    <mesh position={[0, -0.12, 0]}><cylinderGeometry args={[0.006, 0.006, 0.24, 4]} /><meshBasicMaterial color={P.c2a2a2a} /></mesh>
    <mesh position={[0, -0.3, 0]}><cylinderGeometry args={[0.035, 0.06, 0.13, 8]} /><meshStandardMaterial color={P.c8a6a2a} metalness={0.7} roughness={0.35} /></mesh>
    <mesh position={[0, -0.46, 0]} rotation-z={Math.PI / 2}><coneGeometry args={[0.045, 0.16, 4]} /><meshStandardMaterial color={P.ca58a3a} metalness={0.7} roughness={0.35} /></mesh>
  </group>)}</>;
}

/** 삼층석탑: three-storey granite pagoda with upturned roof stones. */
function Pagoda({ position }: { position: [number, number, number] }) {
  const granite = useMemo(() => new THREE.MeshStandardMaterial({ map: graniteTexture(), roughness: 0.95 }), []);
  const roofStone = useMemo(() => {
    const r = roofSurface(0.62, 0.62, 0.2, 0.14, 8);
    const under = r.geo.clone(); under.translate(0, -0.07, 0); under.scale(1, 1, 1);
    const flip = under.index ? under.toNonIndexed() : under;
    // Reverse winding so the underside faces down.
    const p = flip.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i += 3) { const x = p.getX(i + 1), y = p.getY(i + 1), z = p.getZ(i + 1); p.setXYZ(i + 1, p.getX(i + 2), p.getY(i + 2), p.getZ(i + 2)); p.setXYZ(i + 2, x, y, z); }
    const parts = [r.geo.toNonIndexed(), flip, fascia(r.geo, 0.07, 8, 8)].map((g) => { if (g.attributes.uv) g.deleteAttribute('uv'); g.computeVertexNormals(); return g; });
    return mergeGeometries(parts);
  }, []);
  const storeys = [{ w: 0.62, h: 0.5 }, { w: 0.48, h: 0.32 }, { w: 0.42, h: 0.28 }];
  let y = 0.0;
  const parts: ReactNode[] = [];
  parts.push(<mesh key="b1" position={[0, 0.16, 0]} material={granite}><boxGeometry args={[1.6, 0.32, 1.6]} /></mesh>);
  parts.push(<mesh key="b2" position={[0, 0.5, 0]} material={granite}><boxGeometry args={[1.2, 0.36, 1.2]} /></mesh>);
  y = 0.68;
  storeys.forEach((s, i) => {
    parts.push(<mesh key={`s${i}`} position={[0, y + s.h / 2, 0]} material={granite}><boxGeometry args={[s.w, s.h, s.w]} /></mesh>);
    y += s.h;
    const k = s.w / 0.62 * 1.25;
    parts.push(<mesh key={`r${i}`} geometry={roofStone} material={granite} position={[0, y, 0]} scale={[k, 1, k]} />);
    y += 0.18;
  });
  parts.push(<mesh key="fin" position={[0, y + 0.25, 0]} material={granite}><cylinderGeometry args={[0.04, 0.08, 0.5, 8]} /></mesh>);
  parts.push(<mesh key="orb" position={[0, y + 0.55, 0]} material={granite}><sphereGeometry args={[0.07, 10, 8]} /></mesh>);
  return <group position={position}>{parts}<Contact size={2.4} /></group>;
}

/** 석등: octagonal stone lantern with glowing fire chamber. */
function StoneLantern({ position }: { position: [number, number, number] }) {
  const granite = useMemo(() => new THREE.MeshStandardMaterial({ map: graniteTexture(), roughness: 0.95 }), []);
  const flame = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => { if (flame.current) flame.current.intensity = 3.2 + Math.sin(clock.elapsedTime * 7) * 0.25 + Math.sin(clock.elapsedTime * 13.3) * 0.15; });
  return <group position={position}>
    <mesh position={[0, 0.1, 0]} material={granite}><cylinderGeometry args={[0.42, 0.46, 0.2, 8]} /></mesh>
    <mesh position={[0, 0.3, 0]} material={granite}><cylinderGeometry args={[0.3, 0.38, 0.2, 8]} /></mesh>
    <mesh position={[0, 0.85, 0]} material={granite}><cylinderGeometry args={[0.09, 0.11, 0.9, 8]} /></mesh>
    <mesh position={[0, 1.36, 0]} material={granite}><cylinderGeometry args={[0.32, 0.18, 0.14, 8]} /></mesh>
    <mesh position={[0, 1.62, 0]}><cylinderGeometry args={[0.2, 0.2, 0.38, 8]} /><meshStandardMaterial color={P.cffd59a} emissive={P.cffb04a} emissiveIntensity={2.2} /></mesh>
    {[0, 1, 2, 3].map((i) => <mesh key={i} position={[Math.cos(i * Math.PI / 2 + Math.PI / 4) * 0.21, 1.62, Math.sin(i * Math.PI / 2 + Math.PI / 4) * 0.21]} rotation-y={-(i * Math.PI / 2 + Math.PI / 4)} material={granite}><boxGeometry args={[0.04, 0.4, 0.12]} /></mesh>)}
    <mesh position={[0, 1.92, 0]} material={granite}><coneGeometry args={[0.46, 0.26, 8]} /></mesh>
    <mesh position={[0, 2.1, 0]} material={granite}><sphereGeometry args={[0.07, 8, 6]} /></mesh>
    <pointLight ref={flame} position={[0, 1.62, 0.35]} intensity={3.2} distance={7} decay={1.6} color={P.cffb357} />
    <Contact size={1.4} />
  </group>;
}

function Contact({ size, opacity = 0.55 }: { size: number; opacity?: number }) {
  return <mesh rotation-x={-Math.PI / 2} position={[0, 0.015, 0]}>
    <planeGeometry args={[size, size]} />
    <meshBasicMaterial map={blobTexture()} color={P.c000000} transparent opacity={opacity} depthWrite={false} />
  </mesh>;
}

/** Old pines: bent trunks with flat cloud-like needle pads (all trees share two draw calls). */
function Pines({ trees }: { trees: { x: number; z: number; s: number; lean: number; seed: number }[] }) {
  const { trunk, pads } = useMemo(() => {
    const trunks: THREE.BufferGeometry[] = [];
    const padMats: { m: THREE.Matrix4; c: THREE.Color }[] = [];
    for (const t of trees) {
      const r = seeded(t.seed);
      const pts: THREE.Vector3[] = [];
      const h = 3.2 * t.s;
      for (let i = 0; i <= 6; i++) {
        const k = i / 6;
        pts.push(new THREE.Vector3(t.x + Math.sin(k * 2.2 + t.seed) * 0.35 * t.s + t.lean * k * k * 1.4 * t.s, k * h, t.z + Math.cos(k * 1.7 + t.seed) * 0.2 * t.s));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      const tube = new THREE.TubeGeometry(curve, 12, 0.12 * t.s, 6);
      // taper: scale ring radius by height
      const p = tube.attributes.position as THREE.BufferAttribute;
      const c = new THREE.Vector3();
      for (let i = 0; i < p.count; i++) {
        const y = p.getY(i); const k = 1 - 0.65 * (y / h);
        const pt = curve.getPoint(Math.min(1, Math.max(0, y / h)));
        c.set(p.getX(i) - pt.x, 0, p.getZ(i) - pt.z);
        p.setX(i, pt.x + c.x * k); p.setZ(i, pt.z + c.z * k);
      }
      tube.computeVertexNormals();
      trunks.push(tube);
      const count = 10 + Math.floor(r() * 5);
      for (let i = 0; i < count; i++) {
        const k = 0.45 + (i / count) * 0.55;
        const at = curve.getPoint(k);
        const ang = r() * Math.PI * 2, out = (0.5 + r() * 0.9) * t.s * (1.1 - k * 0.5);
        const sc = (0.38 + r() * 0.3) * t.s * (1.2 - k * 0.4);
        padMats.push({
          m: new THREE.Matrix4().compose(new THREE.Vector3(at.x + Math.cos(ang) * out, at.y + r() * 0.2, at.z + Math.sin(ang) * out * 0.6), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, r() * 3, (r() - 0.5) * 0.2)), new THREE.Vector3(sc * 1.25, sc * 0.32, sc)),
          c: new THREE.Color().setHSL(0.3 + r() * 0.06, 0.28, 0.035 + r() * 0.025),
        });
      }
    }
    return { trunk: mergeGeometries(trunks), pads: padMats };
  }, [trees]);
  const padRef = useRef<THREE.InstancedMesh>(null);
  const padGeo = useMemo(() => {
    // Lumpy needle clusters: a subdivided ball pushed in and out so the silhouette is ragged, not a disc.
    const g = new THREE.IcosahedronGeometry(1, 3);
    const p = g.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const k = 1 + 0.18 * Math.sin(v.x * 9.1 + v.z * 4.3) * Math.cos(v.z * 7.7 - v.y * 3.1) + 0.1 * Math.sin(v.x * 23 + v.y * 17);
      p.setXYZ(i, v.x * k, v.y * k, v.z * k);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  useEffect(() => {
    const m = padRef.current; if (!m) return;
    pads.forEach((p, i) => { m.setMatrixAt(i, p.m); m.setColorAt(i, p.c); });
    m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [pads]);
  return <>
    <mesh geometry={trunk}><meshStandardMaterial color={P.c2a2a2a} roughness={0.95} /></mesh>
    <instancedMesh ref={padRef} args={[padGeo, undefined, pads.length]}><meshStandardMaterial roughness={0.95} /></instancedMesh>
  </>;
}

/** Strings of lotus lanterns across the courtyard, gently swaying. */
function LanternStrings() {
  const rows = useMemo(() => [
    // Hung under the front eaves, where temples string them for 부처님오신날; keeps the title area clear.
    { z: 1.15, y: 2.72, x0: -2.85, x1: 2.85, sag: 0.18, n: 13 },
  ], []);
  const palette = useMemo(() => ['#ff9eb5', '#ff7f8f', '#ffd27a', '#fff1c9', '#9fe0b4', '#ffb37a'].map((c) => new THREE.Color(c)), []);
  const items = useMemo(() => {
    const r = seeded(21);
    const list: { x: number; y: number; z: number; c: THREE.Color; ph: number }[] = [];
    for (const row of rows) for (let i = 0; i < row.n; i++) {
      const t = (i + 0.5) / row.n;
      list.push({ x: row.x0 + (row.x1 - row.x0) * t, y: row.y - row.sag * 4 * t * (1 - t) - 0.22, z: row.z, c: palette[Math.floor(r() * palette.length)], ph: r() * 6 });
    }
    return list;
  }, [rows, palette]);
  const wires = useMemo(() => mergeGeometries(rows.map((row) => {
    const pts = Array.from({ length: 13 }, (_, i) => { const t = i / 12; return new THREE.Vector3(row.x0 + (row.x1 - row.x0) * t, row.y - row.sag * 4 * t * (1 - t), row.z); });
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.008, 3);
  })), [rows]);
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => lotusGeometry(), []);
  const m4 = useMemo(() => new THREE.Matrix4(), []);
  useEffect(() => { const m = ref.current; if (!m) return; items.forEach((it, i) => m.setColorAt(i, it.c)); if (m.instanceColor) m.instanceColor.needsUpdate = true; }, [items]);
  useFrame(({ clock }) => {
    const m = ref.current; if (!m) return;
    const t = clock.elapsedTime;
    items.forEach((it, i) => { m4.makeRotationZ(Math.sin(t * 0.8 + it.ph) * 0.06); m4.setPosition(it.x + Math.sin(t * 0.8 + it.ph) * 0.015, it.y, it.z); m.setMatrixAt(i, m4); });
    m.instanceMatrix.needsUpdate = true;
  });
  return <>
    <mesh geometry={wires}><meshBasicMaterial color={P.c15130f} /></mesh>
    <instancedMesh ref={ref} args={[geo, undefined, items.length]} frustumCulled={false}><meshBasicMaterial toneMapped={false} /></instancedMesh>
  </>;
}

/** Gradient sky dome: deep indigo overhead to blue-teal at the horizon. */
function Sky() {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color('#070b22') }, mid: { value: new THREE.Color('#14244a') }, horizon: { value: new THREE.Color('#2f5566') } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 mid; uniform vec3 horizon; varying vec3 vP; void main(){ float h = clamp(vP.y, 0.0, 1.0); vec3 c = mix(horizon, mid, smoothstep(0.0, 0.18, h)); c = mix(c, top, smoothstep(0.18, 0.7, h)); gl_FragColor = vec4(c, 1.0); }',
  }), []);
  return <mesh material={mat}><sphereGeometry args={[90, 24, 16]} /></mesh>;
}

function Moon() {
  return <group position={[9, 12, -40]}>
    <sprite scale={[12, 12, 1]}><spriteMaterial map={blobTexture()} color={P.c9fb4ff} transparent opacity={0.28} depthWrite={false} fog={false} /></sprite>
    <mesh><circleGeometry args={[1.5, 40]} /><meshBasicMaterial color={P.cf6efd8} fog={false} toneMapped={false} /></mesh>
  </group>;
}

/** Layered ridgelines with mist bands between them (atmospheric perspective). */
function Mountains() {
  const layers = useMemo(() => [
    { z: -46, base: 4, amp: 9, color: '#2a4458', seed: 1 },
    { z: -36, base: 2, amp: 8, color: '#1d3445', seed: 2 },
    { z: -27, base: 0.5, amp: 6.5, color: '#14262f', seed: 3 },
    { z: -19, base: -0.3, amp: 4, color: '#0e1b1d', seed: 4 },
  ].map((l) => {
    // Vertical gradient: moonlit crests fading into mist at the foot of each ridge.
    const geo = ridgeGeometry(160, l.base, l.amp, l.seed);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const col = new Float32Array(pos.count * 3);
    const crest = new THREE.Color(l.color).multiplyScalar(1.35), foot = new THREE.Color(l.color).lerp(new THREE.Color(P.c9fb7c9), 0.18);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const k = THREE.MathUtils.smoothstep(pos.getY(i), -4, l.base + l.amp * 1.2);
      c.copy(foot).lerp(crest, k).toArray(col, i * 3);
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return { ...l, geo };
  }), []);
  const mist = useRef<THREE.Group>(null);
  useFrame(({ clock }) => { if (mist.current) mist.current.children.forEach((c, i) => { c.position.x = Math.sin(clock.elapsedTime * 0.03 + i * 2) * 6; }); });
  return <>
    {layers.map((l) => <mesh key={l.seed} geometry={l.geo} position={[0, 0, l.z]}><meshBasicMaterial vertexColors fog={false} /></mesh>)}
    <group ref={mist}>
      {[{ z: -40, y: 5, o: 0.16 }, { z: -31, y: 3, o: 0.14 }, { z: -22, y: 1.2, o: 0.12 }].map((m, i) =>
        <mesh key={i} position={[0, m.y, m.z]}><planeGeometry args={[120, 8]} /><meshBasicMaterial map={blobTexture()} color={P.c9fb7c9} transparent opacity={m.o} depthWrite={false} fog={false} /></mesh>)}
    </group>
  </>;
}

function Ground() {
  const court = useMemo(() => courtyardTexture(), []);
  const pavers = useMemo(() => {
    const r = seeded(5);
    return Array.from({ length: 9 }, (_, i) => new THREE.Matrix4().compose(new THREE.Vector3((r() - 0.5) * 0.08, 0.03, 1.35 + i * 0.62), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, (r() - 0.5) * 0.08, 0)), new THREE.Vector3(1, 1, 1)));
  }, []);
  const ref = useRef<THREE.InstancedMesh>(null);
  const granite = useMemo(() => new THREE.MeshStandardMaterial({ map: graniteTexture(), roughness: 0.95 }), []);
  useEffect(() => { const m = ref.current; if (!m) return; pavers.forEach((p, i) => m.setMatrixAt(i, p)); m.instanceMatrix.needsUpdate = true; }, [pavers]);
  return <>
    <mesh rotation-x={-Math.PI / 2}><planeGeometry args={[140, 140]} /><meshStandardMaterial color={P.c17241d} roughness={1} /></mesh>
    <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 1.2]}><planeGeometry args={[15, 9]} /><meshStandardMaterial map={court} roughness={1} /></mesh>
    <instancedMesh ref={ref} args={[undefined, granite, pavers.length]}><boxGeometry args={[1.3, 0.06, 0.52]} /></instancedMesh>
    {/* low stone-and-tile wall (담장) behind the hall */}
    <mesh position={[0, 0.55, -5.2]}><boxGeometry args={[18, 1.1, 0.4]} /><meshStandardMaterial color={P.c8d8574} roughness={1} /></mesh>
    <mesh position={[0, 1.18, -5.2]}><boxGeometry args={[18.4, 0.16, 0.7]} /><meshStandardMaterial color={P.c3f454b} roughness={0.8} /></mesh>
  </>;
}

/** Camera: slow breathing drift; pulls back on portrait screens so the whole hall stays in frame. */
function TempleCamera({ ring }: { ring: number }) {
  const { camera, size } = useThree();
  const look = useMemo(() => new THREE.Vector3(0, 2.1, -1.2), []);
  const focus = useBellFocus(ring);
  const follow = useRef(0);
  useFrame(({ clock }, dt) => {
    const portrait = size.width / size.height < 0.9;
    const dist = portrait ? 15.5 : 10.5;
    const t = clock.elapsedTime * 0.04;
    // After a bell strike, lean toward the pavilion (it sits off-frame on phones) and ease back.
    const f = focus(clock.elapsedTime) * (portrait ? 0.95 : 0.6);
    // Drift after the visitor's 밤톨 so it stays in frame when it walks to the pagoda or the bell.
    follow.current += (THREE.MathUtils.clamp(chestnut.x, -6.5, 5) * (portrait ? 0.62 : 0.32) - follow.current) * Math.min(1, dt * 1.5);
    const fx = BELL_POS[0] * f + follow.current * (1 - f);
    camera.position.set(Math.sin(t) * 1.6 * (1 - f) + fx, (portrait ? 2.6 : 2.3) + Math.sin(t * 1.7) * 0.12, look.z + dist + Math.cos(t * 0.6) * 0.3 - f * (portrait ? 4 : 1.5));
    camera.lookAt(look.x + fx, look.y + (portrait ? -0.25 : 0) - f * (portrait ? 1.7 : 1.1), look.z + f * 2.2);
  });
  return null;
}

function Exposure() {
  const { gl } = useThree();
  useEffect(() => { const prev = gl.toneMappingExposure; gl.toneMappingExposure = 1.25; return () => { gl.toneMappingExposure = prev; }; }, [gl]);
  return null;
}

/** The hand-built hall, pagoda and courtyard, shown while the scans load or if they fail. */
function HandBuilt() {
  return <><Ground /><Hall /><Pagoda position={[-4.5, 0, 0.7]} /></>;
}

type TempleProps = { lanterns?: number[]; ring?: number; spot?: Spot; inside?: boolean; bows?: number; onArrive?: (spot: Spot) => void };

export default function Temple(props: TempleProps) {
  // Inside the hall the whole courtyard is swapped for the interior (only one is drawn at a time).
  if (props.inside) return <><Exposure /><BuddhaHall bows={props.bows ?? 0} /></>;
  return <Courtyard {...props} />;
}

function Courtyard({ lanterns = [], ring = 0, spot = 'yard', onArrive }: TempleProps) {
  const pines = useMemo(() => [
    { x: 6.2, z: 0.8, s: 1.2, lean: -0.9, seed: 3 },
    { x: 10.5, z: 3.8, s: 1.2, lean: -0.7, seed: 23 },
    { x: -4.6, z: -6.5, s: 1.15, lean: 0.2, seed: 31 },
    { x: 4.2, z: -7.2, s: 1.25, lean: -0.2, seed: 37 },
    { x: -12, z: -6, s: 1.4, lean: 0.3, seed: 41 },
    { x: 12.5, z: -5, s: 1.4, lean: -0.4, seed: 43 },
    { x: 0.6, z: -9, s: 1.5, lean: 0.1, seed: 47 },
    { x: -2.8, z: -8.5, s: 1.2, lean: -0.2, seed: 53 },
  ], []);
  return <>
    <Exposure />
    <fog attach="fog" args={['#1b2c3a', 14, 48]} />
    <Sky />
    <Stars radius={70} depth={10} count={1400} factor={3} fade speed={0.3} />
    <Moon />
    <Mountains />
    <hemisphereLight args={['#5a6f9e', '#20180f', 0.9]} />
    <directionalLight position={[-10, 12, -8]} intensity={1.4} color={P.cb8c8ff} />
    <directionalLight position={[6, 5, 10]} intensity={0.35} color={P.c7f8fb8} />
    <pointLight position={[0, 1.6, 1.4]} intensity={6} distance={9} decay={1.5} color={P.cffb35c} />
    {/* Scanned heritage buildings stream in; the hand-built hall stands in until they arrive. */}
    <HeritageBoundary fallback={<HandBuilt />}>
      <Suspense fallback={<HandBuilt />}>
        <HeritageTemple />
      </Suspense>
    </HeritageBoundary>
    <StoneLantern position={[0, 0, 2.2]} />
    <Pines trees={pines} />
    <LanternStrings />
    <Sparkles count={36} scale={[14, 3, 10]} position={[0, 1.6, 1]} size={2.6} speed={0.25} color={P.cffe9a8} />
    <MyLanterns colors={lanterns} />
    <BellPavilion ring={ring} roof={<HeritageBoundary fallback={<ConeRoof />}><Suspense fallback={<ConeRoof />}><ScannedBellRoof width={2.5} /></Suspense></HeritageBoundary>} />
    <WalkingChestnut spot={spot} onArrive={onArrive} />
    <TempleCamera ring={ring} />
  </>;
}
