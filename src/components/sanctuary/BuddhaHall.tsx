// 2026-11-10: inside the main hall (법당 안), CHOSEUN: "불당도 구현하면 좋겠어요".
// Shown only when the visitor walks their 밤톨 into the hall, so the Buddha is never in the default view
// (plan 2026-11-03: keep the default scene a non-religious "rest"). The room is drawn from code and does not
// copy a specific temple. The statue is 국가유산청's 3D model of a Silla stone seated Vairocana Buddha
// (석조비로자나불좌상, KOGL Type 1, see public/models/sanctuary/SOURCES.md), with pedestal and halo.
// While it loads, or if it fails, a gilded Buddha drawn from code (lotus pedestal, flame mandorla) stands in.
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { ChestnutFigure } from './Chestnut';
import { HeritageBoundary } from './HeritageModels';

const BUDDHA_URL = '/models/sanctuary/buddha.glb';
const withMeshopt = (loader: GLTFLoader) => { loader.setMeshoptDecoder(MeshoptDecoder); };
/** Start downloading the statue (about 2 MB) once the visitor heads for the hall, not on every page view. */
export function preloadBuddha() { useLoader.preload(GLTFLoader, BUDDHA_URL, withMeshopt); }

const P = {
  bg: '#0d0806', ceilingTint: '#7a7470', gold: '#d1a04a', goldDeep: '#8a6224', hair: '#22305a', urna: '#f3e6c0', feature: '#6b4518',
  floor: '#5a3a22', floorLine: '#3a2414', wall: '#3c1f17', wallPanel: '#5a2a1e', plaster: '#5e5446', column: '#7a2f22',
  altar: '#5e2a1c', dancheongA: '#25695a', dancheongB: '#c7553f', dancheongC: '#e9e0c4', dancheongD: '#3a5fa8',
  candle: '#f5ecd8', flame: '#ffd27a', flameCore: '#fff4d6', light: '#ffb35c', cushion: '#7a2430', cushionEdge: '#c9a24a',
  smoke: '#d8d2c8', taenghwa: '#6b1e17', taenghwaGold: '#c9a24a', taenghwaGreen: '#2e5a48', hemiSky: '#6a4a38', hemiGround: '#1a0f0a',
  lanterns: ['#ff9eb5', '#ff7f8f', '#ffd27a', '#fff1c9', '#9fe0b4', '#ffb37a'],
} as const;

const texCache = new Map<string, THREE.CanvasTexture>();
function canvasTexture(key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, repeat: [number, number] = [1, 1]) {
  const hit = texCache.get(key); if (hit) return hit;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); if (g) draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); t.anisotropy = 4;
  texCache.set(key, t);
  return t;
}

/** 마루: long polished planks with darker seams and grain streaks. */
function floorTexture() {
  return canvasTexture('maru', 512, 512, (g, w, h) => {
    g.fillStyle = P.floor; g.fillRect(0, 0, w, h);
    let seed = 7; const r = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let x = 0; x < w; x += 64) {
      g.fillStyle = `rgba(255,220,180,${0.03 + r() * 0.06})`; g.fillRect(x, 0, 64, h);
      for (let i = 0; i < 18; i++) { g.strokeStyle = `rgba(40,20,8,${0.08 + r() * 0.12})`; g.lineWidth = 1; g.beginPath(); const gx = x + r() * 64; g.moveTo(gx, 0); g.bezierCurveTo(gx + 4, h * 0.3, gx - 4, h * 0.7, gx + 2, h); g.stroke(); }
      g.fillStyle = P.floorLine; g.fillRect(x, 0, 2, h);
      const cut = r() * h; g.fillRect(x, cut, 64, 2);
    }
  }, [6, 5]);
}

/** Coffered ceiling with dancheong rosettes. */
function ceilingTexture() {
  return canvasTexture('ceiling', 256, 256, (g, w, h) => {
    g.fillStyle = P.dancheongA; g.fillRect(0, 0, w, h);
    g.fillStyle = P.dancheongB; g.fillRect(0, 0, w, 14); g.fillRect(0, 0, 14, h);
    const cx = w / 2 + 7, cy = h / 2 + 7;
    for (const [rad, col] of [[90, P.dancheongC], [70, P.dancheongB], [48, P.dancheongD], [26, P.dancheongC], [10, P.flame]] as const) {
      g.fillStyle = col; g.beginPath();
      for (let i = 0; i <= 16; i++) { const a = (i / 16) * Math.PI * 2; const rr = rad * (i % 2 ? 0.82 : 1); g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
      g.fill();
    }
  }, [8, 6]);
}

/** Frieze band (dancheong) for the altar front and beams. */
function dancheongBand() {
  return canvasTexture('dancheong-band', 512, 64, (g, w, h) => {
    g.fillStyle = P.dancheongA; g.fillRect(0, 0, w, h);
    g.fillStyle = P.dancheongB; g.fillRect(0, 0, w, 6); g.fillRect(0, h - 6, w, 6);
    for (let i = 0; i < 8; i++) {
      const cx = (i + 0.5) * (w / 8), cy = h / 2;
      for (const [rx, ry, col] of [[22, 18, P.dancheongC], [15, 12, P.dancheongB], [7, 6, P.dancheongD]] as const) { g.fillStyle = col; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.fill(); }
    }
  }, [3, 1]);
}

/** 광배: flame mandorla, painted gold on deep red with concentric halos. Alpha shapes the outline. */
function mandorlaTexture() {
  return canvasTexture('mandorla', 512, 768, (g, w, h) => {
    const cx = w / 2;
    g.beginPath();
    g.moveTo(cx, 6);
    g.bezierCurveTo(cx + w * 0.32, h * 0.18, cx + w * 0.5, h * 0.55, cx + w * 0.46, h * 0.98);
    g.lineTo(cx - w * 0.46, h * 0.98);
    g.bezierCurveTo(cx - w * 0.5, h * 0.55, cx - w * 0.32, h * 0.18, cx, 6);
    g.closePath();
    g.save(); g.clip();
    g.fillStyle = P.taenghwa; g.fillRect(0, 0, w, h);
    // flame tongues around the rim
    g.strokeStyle = P.taenghwaGold; g.lineWidth = 3;
    for (let i = 0; i < 46; i++) {
      const t = i / 46; const a = Math.PI * (0.05 + t * 0.9);
      const x = cx + Math.cos(a) * w * 0.43, y = h * 0.62 - Math.sin(a) * h * 0.56;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 10, y - 18, x - 4, y - 34); g.stroke();
    }
    // body halo and head halo
    for (const [cy, rad] of [[h * 0.68, w * 0.36], [h * 0.3, w * 0.2]] as const) {
      for (let k = 0; k < 4; k++) { g.strokeStyle = k % 2 ? P.taenghwaGreen : P.taenghwaGold; g.lineWidth = 6 - k; g.beginPath(); g.arc(cx, cy, rad - k * 12, 0, Math.PI * 2); g.stroke(); }
    }
    g.restore();
    g.strokeStyle = P.taenghwaGold; g.lineWidth = 8;
    g.beginPath(); g.moveTo(cx, 6); g.bezierCurveTo(cx + w * 0.32, h * 0.18, cx + w * 0.5, h * 0.55, cx + w * 0.46, h * 0.98); g.moveTo(cx, 6); g.bezierCurveTo(cx - w * 0.32, h * 0.18, cx - w * 0.5, h * 0.55, cx - w * 0.46, h * 0.98); g.stroke();
  });
}

/** 후불탱화 stand-in: an abstract painted panel (no figures), red ground with gold and green roundels. */
function backPanelTexture() {
  return canvasTexture('back-panel', 512, 384, (g, w, h) => {
    g.fillStyle = P.taenghwa; g.fillRect(0, 0, w, h);
    g.strokeStyle = P.taenghwaGold; g.lineWidth = 10; g.strokeRect(10, 10, w - 20, h - 20);
    let seed = 3; const r = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    g.globalAlpha = 0.55;
    for (let i = 0; i < 14; i++) {
      const x = 40 + r() * (w - 80), y = 40 + r() * (h - 80), rad = 8 + r() * 14;
      g.fillStyle = r() > 0.5 ? P.taenghwaGreen : P.wallPanel; g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.fill();
      g.strokeStyle = P.taenghwaGold; g.lineWidth = 2; g.beginPath(); g.arc(x, y, rad + 3, 0, Math.PI * 2); g.stroke();
    }
  });
}

function blobTexture() {
  return canvasTexture('hall-blob', 64, 64, (g, w, h) => {
    const grad = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    grad.addColorStop(0, 'rgba(255,255,255,1)'); grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad; g.fillRect(0, 0, w, h);
  });
}

/** Capsule between two points (for arms). */
function limb(a: THREE.Vector3, b: THREE.Vector3, r: number) {
  const len = a.distanceTo(b);
  const g = new THREE.CapsuleGeometry(r, len, 6, 12);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  g.applyQuaternion(q);
  const mid = a.clone().add(b).multiplyScalar(0.5);
  g.translate(mid.x, mid.y, mid.z);
  return g;
}

/** Seated Buddha in meditation, about 1.45 units tall from the lap; origin at the top of the pedestal. */
function SeatedBuddha() {
  const mats = useMemo(() => ({
    gold: new THREE.MeshStandardMaterial({ color: P.gold, metalness: 1, roughness: 0.3 }),
    deep: new THREE.MeshStandardMaterial({ color: P.goldDeep, metalness: 0.9, roughness: 0.45 }),
    hair: new THREE.MeshStandardMaterial({ color: P.hair, metalness: 0.2, roughness: 0.55 }),
    feature: new THREE.MeshStandardMaterial({ color: P.feature, metalness: 0.6, roughness: 0.5 }),
    urna: new THREE.MeshStandardMaterial({ color: P.urna, metalness: 0.3, roughness: 0.3, emissive: P.urna, emissiveIntensity: 0.25 }),
  }), []);
  const geo = useMemo(() => {
    const torso = new THREE.LatheGeometry([[0, 0], [0.3, 0], [0.31, 0.15], [0.34, 0.38], [0.41, 0.6], [0.43, 0.7], [0.32, 0.79], [0.12, 0.83], [0, 0.84]].map(([x, y]) => new THREE.Vector2(x, y)), 32);
    torso.scale(1, 1, 0.62);
    // Hair of small snail-shell curls: a bumpy cap over the crown.
    const hair = new THREE.SphereGeometry(0.212, 40, 24, 0, Math.PI * 2, 0, 1.35);
    const p = hair.attributes.position as THREE.BufferAttribute; const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const k = 1 + 0.035 * Math.sin(v.x * 95) * Math.sin(v.y * 95) * Math.sin(v.z * 95); p.setXYZ(i, v.x * k, v.y * k, v.z * k); }
    hair.computeVertexNormals();
    const L = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
    const arms = [-1, 1].flatMap((s) => [limb(L(s * 0.43, 0.9, 0.02), L(s * 0.47, 0.5, 0.12), 0.115), limb(L(s * 0.47, 0.5, 0.12), L(s * 0.16, 0.36, 0.3), 0.1)]);
    const eye = new THREE.TorusGeometry(0.034, 0.0055, 6, 16, Math.PI);
    const mouth = new THREE.TorusGeometry(0.03, 0.005, 6, 16, Math.PI);
    return { torso, hair, arms, eye, mouth };
  }, []);
  return <group>
    {/* crossed legs and lap */}
    <mesh material={mats.gold} position={[0, 0.15, 0.08]} scale={[0.62, 0.17, 0.4]}><sphereGeometry args={[1, 40, 20]} /></mesh>
    {/* crossed shins and knees under the robe */}
    {[-1, 1].map((s) => <group key={s}>
      <mesh material={mats.gold} position={[s * 0.2, 0.2, 0.26]} rotation={[0, s * 0.32, 0]} scale={[0.46, 0.12, 0.15]}><sphereGeometry args={[1, 32, 16]} /></mesh>
      <mesh material={mats.gold} position={[s * 0.6, 0.16, 0.12]} scale={[1, 0.85, 1]}><sphereGeometry args={[0.15, 24, 16]} /></mesh>
    </group>)}
    <mesh material={mats.gold} geometry={geo.torso} position={[0, 0.2, 0]} />
    {geo.arms.map((g, i) => <mesh key={i} material={mats.gold} geometry={g} />)}
    {/* hands resting in the lap, thumbs touching (선정인) */}
    <mesh material={mats.gold} position={[0, 0.33, 0.31]} scale={[0.2, 0.06, 0.12]}><sphereGeometry args={[1, 24, 14]} /></mesh>
    <mesh material={mats.gold} position={[0, 1.08, 0]}><cylinderGeometry args={[0.1, 0.12, 0.16, 20]} /></mesh>
    <group position={[0, 1.3, 0]} scale={1.22}>
      <mesh material={mats.gold} scale={[0.95, 1.12, 1]}><sphereGeometry args={[0.2, 36, 24]} /></mesh>
      <mesh material={mats.hair} geometry={geo.hair} position={[0, 0.03, -0.01]} />
      {/* 육계 (crown protuberance) and its jewel */}
      <mesh material={mats.hair} position={[0, 0.25, -0.01]}><sphereGeometry args={[0.1, 24, 16]} /></mesh>
      <mesh material={mats.urna} position={[0, 0.2, 0.1]}><sphereGeometry args={[0.03, 12, 8]} /></mesh>
      {/* long earlobes */}
      {[-1, 1].map((s) => <mesh key={s} material={mats.gold} position={[s * 0.18, -0.04, 0]} scale={[0.45, 1.9, 0.8]}><sphereGeometry args={[0.05, 14, 10]} /></mesh>)}
      {/* lowered eyes, urna, nose and a quiet smile */}
      {[-1, 1].map((s) => <mesh key={`e${s}`} material={mats.feature} geometry={geo.eye} position={[s * 0.07, 0.0, 0.178]} rotation={[0, 0, Math.PI]} />)}
      <mesh material={mats.urna} position={[0, 0.07, 0.19]}><sphereGeometry args={[0.012, 10, 8]} /></mesh>
      <mesh material={mats.gold} position={[0, -0.04, 0.2]} rotation-x={-0.25}><coneGeometry args={[0.025, 0.08, 10]} /></mesh>
      <mesh material={mats.feature} geometry={geo.mouth} position={[0, -0.11, 0.17]} rotation={[0, 0, Math.PI]} scale={[1, 0.5, 1]} />
    </group>
  </group>;
}

/** 연화대: two tiers of lotus petals over an octagonal base. Top of the pedestal at y = 0.55. */
function LotusPedestal() {
  const gold = useMemo(() => new THREE.MeshStandardMaterial({ color: P.gold, metalness: 1, roughness: 0.35 }), []);
  const petals = useMemo(() => {
    const list: THREE.Matrix4[] = [];
    for (const [n, rad, y, tilt, s] of [[18, 0.66, 0.36, 0.55, 1], [14, 0.52, 0.44, 0.35, 0.85], [20, 0.62, 0.16, -0.55, 0.9]] as const) {
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + (y > 0.4 ? Math.PI / n : 0);
        const e = new THREE.Euler(tilt, -a + Math.PI / 2, 0, 'YXZ');
        list.push(new THREE.Matrix4().compose(new THREE.Vector3(Math.cos(a) * rad, y, Math.sin(a) * rad), new THREE.Quaternion().setFromEuler(e), new THREE.Vector3(s, s, s)));
      }
    }
    return list;
  }, []);
  const ref = useRef<THREE.InstancedMesh>(null);
  const petalGeo = useMemo(() => { const g = new THREE.SphereGeometry(1, 16, 12); g.scale(0.15, 0.26, 0.05); g.translate(0, 0.12, 0); return g; }, []);
  useEffect(() => { const m = ref.current; if (!m) return; petals.forEach((p, i) => m.setMatrixAt(i, p)); m.instanceMatrix.needsUpdate = true; }, [petals]);
  return <group>
    <mesh material={gold} position={[0, 0.08, 0]}><cylinderGeometry args={[0.8, 0.86, 0.16, 8]} /></mesh>
    <mesh material={gold} position={[0, 0.3, 0]}><cylinderGeometry args={[0.55, 0.6, 0.3, 24]} /></mesh>
    <instancedMesh ref={ref} args={[petalGeo, gold, petals.length]} />
  </group>;
}

/** Lotus lanterns hung in rows from the ceiling. */
function CeilingLanterns() {
  const items = useMemo(() => {
    let seed = 11; const r = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const list: { p: THREE.Vector3; c: THREE.Color; ph: number }[] = [];
    for (let row = 0; row < 3; row++) for (let i = 0; i < 13; i++) {
      list.push({ p: new THREE.Vector3(-4.8 + i * 0.8 + (row % 2) * 0.4, 3.85 - r() * 0.12, -2.4 + row * 0.75), c: new THREE.Color(P.lanterns[Math.floor(r() * P.lanterns.length)]).multiplyScalar(0.85), ph: r() * 6 });
    }
    return list;
  }, []);
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(0.11, 16, 10);
    const p = g.attributes.position as THREE.BufferAttribute; const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const k = 0.95 + 0.12 * Math.abs(Math.sin(Math.atan2(v.z, v.x) * 4)); p.setXYZ(i, v.x * k, v.y * 0.85, v.z * k); }
    g.computeVertexNormals();
    return g;
  }, []);
  const ref = useRef<THREE.InstancedMesh>(null);
  const m4 = useMemo(() => new THREE.Matrix4(), []);
  useEffect(() => { const m = ref.current; if (!m) return; items.forEach((it, i) => m.setColorAt(i, it.c)); if (m.instanceColor) m.instanceColor.needsUpdate = true; }, [items]);
  useFrame(({ clock }) => {
    const m = ref.current; if (!m) return;
    items.forEach((it, i) => { m4.makeRotationY(clock.elapsedTime * 0.1 + it.ph); m4.setPosition(it.p.x, it.p.y + Math.sin(clock.elapsedTime * 0.6 + it.ph) * 0.015, it.p.z); m.setMatrixAt(i, m4); });
    m.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[geo, undefined, items.length]} frustumCulled={false}><meshBasicMaterial toneMapped={false} /></instancedMesh>;
}

function Candle({ position }: { position: [number, number, number] }) {
  const light = useRef<THREE.PointLight>(null);
  const flame = useRef<THREE.Mesh>(null);
  const seed = position[0];
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + seed * 3;
    const k = 1 + Math.sin(t * 9) * 0.06 + Math.sin(t * 23) * 0.04;
    if (light.current) light.current.intensity = 2.4 * k;
    if (flame.current) flame.current.scale.set(1, k, 1);
  });
  return <group position={position}>
    <mesh position={[0, 0.16, 0]}><cylinderGeometry args={[0.045, 0.05, 0.32, 16]} /><meshStandardMaterial color={P.candle} roughness={0.6} emissive={P.flame} emissiveIntensity={0.15} /></mesh>
    <mesh ref={flame} position={[0, 0.37, 0]}><sphereGeometry args={[0.025, 10, 8]} /><meshBasicMaterial color={P.flameCore} toneMapped={false} /></mesh>
    <sprite position={[0, 0.38, 0]} scale={[0.35, 0.45, 1]}><spriteMaterial map={blobTexture()} color={P.flame} transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>
    <pointLight ref={light} position={[0, 0.45, 0.15]} intensity={2.4} distance={6} decay={1.6} color={P.light} />
  </group>;
}

/** Incense smoke: a few soft puffs rising and fading. */
function Incense({ position }: { position: [number, number, number] }) {
  const puffs = useRef<(THREE.Sprite | null)[]>([]);
  useFrame(({ clock }) => {
    puffs.current.forEach((s, i) => {
      if (!s) return;
      const t = ((clock.elapsedTime * 0.18 + i / 6) % 1);
      s.position.set(Math.sin(t * 6 + i) * 0.06 * t, 0.15 + t * 1.3, 0);
      s.scale.setScalar(0.08 + t * 0.4);
      (s.material as THREE.SpriteMaterial).opacity = 0.22 * Math.sin(t * Math.PI);
    });
  });
  return <group position={position}>
    <mesh position={[0, 0.05, 0]}><cylinderGeometry args={[0.12, 0.09, 0.1, 20]} /><meshStandardMaterial color={P.goldDeep} metalness={0.8} roughness={0.4} /></mesh>
    <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.004, 0.004, 0.22, 4]} /><meshBasicMaterial color={P.feature} /></mesh>
    {Array.from({ length: 6 }, (_, i) => <sprite key={i} ref={(el) => { puffs.current[i] = el; }}><spriteMaterial map={blobTexture()} color={P.smoke} transparent opacity={0} depthWrite={false} /></sprite>)}
  </group>;
}

/** Soft reflections for the gilding, generated in the browser (no download). */
function RoomReflections() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    const prev = scene.environment, prevI = scene.environmentIntensity;
    scene.environment = env; scene.environmentIntensity = 0.28;
    return () => { scene.environment = prev; scene.environmentIntensity = prevI; env.dispose(); pmrem.dispose(); };
  }, [gl, scene]);
  return null;
}

function HallCamera() {
  const { camera, size } = useThree();
  useFrame(({ clock }) => {
    const portrait = size.width / size.height < 0.9;
    const t = clock.elapsedTime * 0.05;
    // Phones: the statue sits lower in frame so it shows between the scene buttons and the ritual panel.
    camera.position.set(Math.sin(t) * 0.35, portrait ? 1.7 : 1.55, portrait ? 7.2 : 4.7);
    camera.lookAt(0, portrait ? 2.2 : 1.65, -2.3);
  });
  return null;
}

/** The visitor's 밤톨 on a cushion facing the Buddha; each `bows` increment plays one bow. */
function BowingChestnut({ bows }: { bows: number }) {
  const { clock } = useThree();
  const start = useRef(-100);
  const first = useRef(true);
  const fig = useRef<THREE.Group>(null);
  useEffect(() => { if (first.current) { first.current = false; return; } start.current = clock.elapsedTime; }, [bows, clock]);
  useFrame(({ clock: c }) => {
    const t = c.elapsedTime - start.current;
    const k = t > 0 && t < 2.2 ? Math.sin(Math.min(1, t / 2.2) * Math.PI) : 0;
    if (fig.current) { fig.current.rotation.x = k * 1.05; fig.current.position.z = -k * 0.08; }
  });
  return <group position={[0, 0.09, 0.6]} rotation-y={Math.PI} scale={1.1}>
    <group ref={fig}><ChestnutFigure /></group>
  </group>;
}

/** The 국가유산청 model: 2.92 m tall with pedestal and halo, face toward +Z, base at y=0. */
function ScannedBuddha() {
  const gltf = useLoader(GLTFLoader, BUDDHA_URL, withMeshopt);
  const statue = useMemo(() => {
    const root = gltf.scene.clone(true);
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const mat = m.material as THREE.MeshStandardMaterial;
      if (mat.map) mat.map.anisotropy = 4;
      mat.envMapIntensity = 0.6;
    });
    return root;
  }, [gltf]);
  // 0.9 keeps the halo clear of the ceiling lanterns and the face in frame on phones.
  return <primitive object={statue} scale={0.9} />;
}

/** Stand-in drawn from code, shown while the scan loads or if it cannot be fetched. */
function DrawnBuddha({ mandorla }: { mandorla: THREE.Texture }) {
  return <>
    <group scale={0.9}><LotusPedestal /></group>
    <group position={[0, 0.5, 0]} scale={1.3}><SeatedBuddha /></group>
    <mesh position={[0, 1.85, -0.55]} scale={1.22}><planeGeometry args={[2.3, 3.2]} /><meshStandardMaterial map={mandorla} transparent alphaTest={0.5} metalness={0.3} roughness={0.6} emissive={P.taenghwaGold} emissiveIntensity={0.04} emissiveMap={mandorla} side={THREE.DoubleSide} /></mesh>
  </>;
}

export default function BuddhaHall({ bows }: { bows: number }) {
  const floor = useMemo(() => floorTexture(), []);
  const ceiling = useMemo(() => ceilingTexture(), []);
  const band = useMemo(() => dancheongBand(), []);
  const mandorla = useMemo(() => mandorlaTexture(), []);
  const panel = useMemo(() => backPanelTexture(), []);
  const ALTAR_Z = -2.3, ALTAR_TOP = 0.85;
  return <>
    <color attach="background" args={[P.bg]} />
    <RoomReflections />
    <HallCamera />
    <hemisphereLight args={[P.hemiSky, P.hemiGround, 0.5]} />
    {/* warm light falling on the statue from the front, as from the open doors and lamps */}
    <pointLight position={[0, 3.4, -0.4]} intensity={5} distance={5} decay={1.4} color={P.light} />
    <pointLight position={[0, 2.6, 2.5]} intensity={2} distance={8} decay={1.5} color={P.light} />
    {/* room */}
    <mesh rotation-x={-Math.PI / 2}><planeGeometry args={[11, 9]} /><meshStandardMaterial map={floor} roughness={0.42} metalness={0.05} /></mesh>
    <mesh rotation-x={Math.PI / 2} position={[0, 4.2, 0]}><planeGeometry args={[11, 9]} /><meshStandardMaterial map={ceiling} color={P.ceilingTint} roughness={0.8} /></mesh>
    <mesh position={[0, 2.1, -3.6]}><planeGeometry args={[11, 4.2]} /><meshStandardMaterial color={P.wall} roughness={0.9} /></mesh>
    <mesh position={[0, 2.2, -3.55]}><planeGeometry args={[5.2, 3.6]} /><meshStandardMaterial map={panel} roughness={0.85} /></mesh>
    {[-1, 1].map((s) => <mesh key={s} position={[s * 5.5, 2.1, 0]} rotation-y={-s * Math.PI / 2}><planeGeometry args={[9, 4.2]} /><meshStandardMaterial color={P.plaster} roughness={0.95} /></mesh>)}
    {[-1, 1].flatMap((s) => [-1.6, 1.5].map((z) => <mesh key={`${s}${z}`} position={[s * 2.9, 2.1, z]}><cylinderGeometry args={[0.17, 0.19, 4.2, 20]} /><meshStandardMaterial color={P.column} roughness={0.7} /></mesh>))}
    {[-1.6, 1.5].map((z) => <mesh key={`b${z}`} position={[0, 3.95, z]}><boxGeometry args={[11, 0.28, 0.24]} /><meshStandardMaterial map={band} roughness={0.8} /></mesh>)}
    {/* 수미단 (altar) with dancheong front */}
    <mesh position={[0, ALTAR_TOP / 2, ALTAR_Z]}><boxGeometry args={[3, ALTAR_TOP, 1.4]} /><meshStandardMaterial color={P.altar} roughness={0.7} /></mesh>
    <mesh position={[0, ALTAR_TOP * 0.55, ALTAR_Z + 0.705]}><planeGeometry args={[2.9, 0.42]} /><meshStandardMaterial map={band} roughness={0.75} /></mesh>
    <group position={[0, ALTAR_TOP, ALTAR_Z - 0.15]}>
      <HeritageBoundary fallback={<DrawnBuddha mandorla={mandorla} />}>
        <Suspense fallback={<DrawnBuddha mandorla={mandorla} />}><ScannedBuddha /></Suspense>
      </HeritageBoundary>
    </group>
    {/* offerings on the front of the altar */}
    <group position={[0, ALTAR_TOP, ALTAR_Z + 0.5]}>
      <Candle position={[-1.0, 0, 0]} />
      <Candle position={[1.0, 0, 0]} />
      <Incense position={[0, 0, 0.05]} />
    </group>
    <CeilingLanterns />
    {/* 방석 for the visitor */}
    <mesh position={[0, 0.045, 0.6]}><boxGeometry args={[0.8, 0.09, 0.8]} /><meshStandardMaterial color={P.cushion} roughness={0.85} /></mesh>
    <mesh position={[0, 0.092, 0.6]} rotation-x={-Math.PI / 2}><ringGeometry args={[0.32, 0.36, 4, 1, Math.PI / 4]} /><meshStandardMaterial color={P.cushionEdge} roughness={0.6} /></mesh>
    <BowingChestnut bows={bows} />
  </>;
}
