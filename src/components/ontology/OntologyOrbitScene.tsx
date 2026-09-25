import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/useMotion";
import { mulberry32 } from "@/lib/reincarnation-particles";

/**
 * 관계 궤도의 3D 무대(Three.js). 상태·그래프 논리는 `OntologyRelationOrbit` 이
 * 그대로 갖고, 여기서는 그리기만 한다.
 *
 * - 가운데 별 = 지금 초점("나" 또는 고른 노드). 주위를 알갱이가 감싼다.
 * - 고리 = 초점의 이웃. 기울어진 궤도 위를 천천히 돌고, 버튼에 손을 올리면 멈춘다.
 * - 초점이 바뀌면 새 이웃이 가운데에서 궤도로 퍼져 나가고 빛이 그 방향으로 튄다.
 *
 * 노드 이름표는 실제 <button> 이라 키보드·화면 읽기 도구로 그대로 쓸 수 있다.
 * 감축 선호·WebGL 없음에서는 부모가 이 무대 대신 평면 무대를 그린다.
 */

export interface OrbitSceneNode {
  id: string;
  icon: string;
  label: string;
}

interface Props {
  focusKey: string;
  centerIcon: string;
  centerLabel: string;
  ring: OrbitSceneNode[];
  onSelect: (id: string) => void;
}

const RING_R = 1.75;
const PALETTE = ["#16a34a", "#0ea5e9", "#8b5cf6", "#f59e0b", "#e11d48", "#14b8a6"];

const VERT = /* glsl */ `
  attribute float aAlpha;
  attribute float aSize;
  attribute vec3 aColor;
  uniform float uPixelRatio;
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio / max(0.3, -mv.z);
    vAlpha = aAlpha;
    vColor = aColor;
  }
`;

const FRAG = /* glsl */ `
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(vColor, smoothstep(0.5, 0.1, d) * vAlpha);
  }
`;

function makePoints(count: number, pixelRatio: number) {
  const position = new Float32Array(count * 3);
  const alpha = new Float32Array(count);
  const size = new Float32Array(count);
  const color = new Float32Array(count * 3);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
  geometry.setAttribute("aAlpha", new THREE.BufferAttribute(alpha, 1));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  geometry.setAttribute("aColor", new THREE.BufferAttribute(color, 3));
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 4);
  // 밝은 카드 위라 더하기 혼합 대신 보통 혼합 — 더하면 하얗게 날아간다.
  const material = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: { uPixelRatio: { value: pixelRatio } },
    transparent: true,
    depthWrite: false,
  });
  return { geometry, material, position, alpha, size, color };
}

function dirty(geometry: THREE.BufferGeometry, ...names: string[]) {
  for (const name of names) (geometry.getAttribute(name) as THREE.BufferAttribute).needsUpdate = true;
}

/** 초점 별을 감싸는 알갱이 껍질. */
function CoreHalo({ reducedMotion }: { reducedMotion: boolean }) {
  const pixelRatio = useThree((s) => s.viewport.dpr);
  const pack = useMemo(() => {
    const count = 360;
    const p = makePoints(count, pixelRatio);
    const rand = mulberry32(3);
    const seeds = new Float32Array(count * 4);
    const c = new THREE.Color("#22c55e");
    const v = new THREE.Color("#a78bfa");
    for (let i = 0; i < count; i += 1) {
      seeds.set([rand() * Math.PI * 2, Math.acos(2 * rand() - 1), 0.42 + rand() * 0.32, 0.2 + rand() * 0.6], i * 4);
      p.size[i] = 8 + rand() * 9;
      const mix = c.clone().lerp(v, rand() * 0.6);
      p.color.set([mix.r, mix.g, mix.b], i * 3);
    }
    return { ...p, seeds, count };
  }, [pixelRatio]);
  useEffect(() => () => {
    pack.geometry.dispose();
    pack.material.dispose();
  }, [pack]);

  useFrame((state) => {
    const t = reducedMotion ? 0 : state.clock.elapsedTime;
    const { seeds, position, alpha, count, geometry } = pack;
    for (let i = 0; i < count; i += 1) {
      const theta = seeds[i * 4] + t * seeds[i * 4 + 3];
      const phi = seeds[i * 4 + 1];
      const r = seeds[i * 4 + 2] + Math.sin(t * 1.3 + i) * 0.02;
      position[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      position[i * 3 + 1] = r * Math.cos(phi);
      position[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      alpha[i] = 0.35 + 0.3 * Math.sin(t * 2 + i * 1.7);
    }
    dirty(geometry, "position", "aAlpha");
  });

  return <points geometry={pack.geometry} material={pack.material} />;
}

/** 궤도 선과 그 위의 먼지. */
function OrbitTrack() {
  const pixelRatio = useThree((s) => s.viewport.dpr);
  const line = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i += 1) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * RING_R, 0, Math.sin(a) * RING_R));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);
  const dust = useMemo(() => {
    const count = 420;
    const p = makePoints(count, pixelRatio);
    const rand = mulberry32(11);
    const c = new THREE.Color("#4ade80");
    for (let i = 0; i < count; i += 1) {
      const a = rand() * Math.PI * 2;
      const r = RING_R + (rand() - 0.5) * 0.22;
      p.position.set([Math.cos(a) * r, (rand() - 0.5) * 0.08, Math.sin(a) * r], i * 3);
      p.alpha[i] = 0.2 + rand() * 0.35;
      p.size[i] = 5 + rand() * 5;
      p.color.set([c.r, c.g, c.b], i * 3);
    }
    return p;
  }, [pixelRatio]);
  useEffect(() => () => {
    line.dispose();
    dust.geometry.dispose();
    dust.material.dispose();
  }, [line, dust]);

  return (
    <group>
      <lineLoop geometry={line}>
        <lineBasicMaterial color="#86efac" transparent opacity={0.55} />
      </lineLoop>
      <points geometry={dust.geometry} material={dust.material} />
    </group>
  );
}

const BURST = 260;

/** 초점이 바뀌면 가운데에서 새 이웃 쪽으로 빛이 튄다. */
function FocusBurst({ focusKey, directions }: { focusKey: string; directions: THREE.Vector3[] }) {
  const pixelRatio = useThree((s) => s.viewport.dpr);
  const clock = useThree((s) => s.clock);
  const pack = useMemo(() => makePoints(BURST, pixelRatio), [pixelRatio]);
  const vel = useMemo(() => new Float32Array(BURST * 3), []);
  const started = useRef(-10);
  const first = useRef(true);
  useEffect(() => () => {
    pack.geometry.dispose();
    pack.material.dispose();
  }, [pack]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      if (!directions.length) return;
    }
    started.current = clock.elapsedTime;
    const rand = Math.random;
    const colors = PALETTE.map((hex) => new THREE.Color(hex));
    for (let i = 0; i < BURST; i += 1) {
      const slot = directions.length ? i % directions.length : -1;
      const dir = slot >= 0 ? directions[slot].clone() : new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5);
      dir.normalize().add(new THREE.Vector3(rand() - 0.5, (rand() - 0.5) * 0.6, rand() - 0.5).multiplyScalar(0.55));
      const speed = 1.2 + rand() * 1.6;
      vel.set([dir.x * speed, dir.y * speed, dir.z * speed], i * 3);
      pack.position.set([0, 0, 0], i * 3);
      pack.size[i] = 12 + rand() * 14;
      const c = colors[slot >= 0 ? slot % colors.length : i % colors.length];
      pack.color.set([c.r, c.g, c.b], i * 3);
    }
    dirty(pack.geometry, "aSize", "aColor");
    // 초점이 바뀔 때만 — directions 는 그 결과라 따로 기다리지 않는다.
  }, [focusKey]);

  useFrame((state, rawDelta) => {
    const since = state.clock.elapsedTime - started.current;
    const live = since >= 0 && since < 1.3;
    const dt = Math.min(rawDelta, 0.05);
    const drag = Math.exp(-2.2 * dt);
    for (let i = 0; i < BURST; i += 1) {
      if (!live) {
        pack.alpha[i] = 0;
        continue;
      }
      vel[i * 3] *= drag;
      vel[i * 3 + 1] *= drag;
      vel[i * 3 + 2] *= drag;
      pack.position[i * 3] += vel[i * 3] * dt;
      pack.position[i * 3 + 1] += vel[i * 3 + 1] * dt;
      pack.position[i * 3 + 2] += vel[i * 3 + 2] * dt;
      pack.alpha[i] = 1 - Math.pow(since / 1.3, 2);
    }
    dirty(pack.geometry, "position", "aAlpha");
  });

  return <points geometry={pack.geometry} material={pack.material} />;
}

function RingNodes({
  ring,
  focusKey,
  paused,
  reducedMotion,
  onSelect,
  onHover,
}: {
  ring: OrbitSceneNode[];
  focusKey: string;
  paused: boolean;
  reducedMotion: boolean;
  onSelect: (id: string) => void;
  onHover: (on: boolean) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const spread = useRef(0);
  const clock = useThree((s) => s.clock);
  const born = useRef(clock.elapsedTime);
  const refs = useRef<(THREE.Group | null)[]>([]);

  useEffect(() => {
    born.current = clock.elapsedTime;
    spread.current = reducedMotion ? 1 : 0;
  }, [focusKey, clock, reducedMotion]);

  useFrame((state, delta) => {
    if (!group.current) return;
    if (!paused && !reducedMotion) group.current.rotation.y += delta * 0.14;
    const since = state.clock.elapsedTime - born.current;
    refs.current.forEach((node, i) => {
      if (!node) return;
      // 가운데에서 궤도로 차례로 퍼져 나간다.
      const k = reducedMotion ? 1 : Math.min(1, Math.max(0, (since - i * 0.07) / 0.7));
      const e = 1 - Math.pow(1 - k, 3);
      const a = (i / Math.max(1, ring.length)) * Math.PI * 2 - Math.PI / 2;
      node.position.set(Math.cos(a) * RING_R * e, 0, Math.sin(a) * RING_R * e);
      node.scale.setScalar(0.3 + 0.7 * e);
    });
  });

  return (
    <group ref={group}>
      {ring.map((node, i) => (
        <group
          key={`${focusKey}-${node.id}`}
          ref={(el) => {
            refs.current[i] = el;
          }}
        >
          <mesh>
            <sphereGeometry args={[0.085, 24, 24]} />
            <meshStandardMaterial color={PALETTE[i % PALETTE.length]} roughness={0.35} emissive={PALETTE[i % PALETTE.length]} emissiveIntensity={0.25} />
          </mesh>
          <Html center position={[0, 0.3, 0]} zIndexRange={[20, 0]}>
            <button
              type="button"
              onClick={() => onSelect(node.id)}
              onPointerEnter={() => onHover(true)}
              onPointerLeave={() => onHover(false)}
              onFocus={() => onHover(true)}
              onBlur={() => onHover(false)}
              className="flex w-20 flex-col items-center gap-0.5 rounded-xl bg-white/90 px-1.5 py-1 text-center shadow-sm ring-1 ring-green-100 backdrop-blur transition hover:ring-green-400 focus-visible:outline-2 focus-visible:outline-green-700"
            >
              <span className="text-base leading-none">{node.icon}</span>
              <span className="line-clamp-2 text-[10px] font-bold leading-tight text-green-800">{node.label}</span>
            </button>
          </Html>
        </group>
      ))}
    </group>
  );
}

export default function OntologyOrbitScene({ focusKey, centerIcon, centerLabel, ring, onSelect }: Props) {
  const reducedMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const directions = useMemo(
    () =>
      ring.map((_, i) => {
        const a = (i / Math.max(1, ring.length)) * Math.PI * 2 - Math.PI / 2;
        return new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
      }),
    [ring],
  );

  return (
    <div className="relative h-80 w-full overflow-hidden rounded-2xl bg-gradient-to-b from-green-50/60 to-card">
      <Canvas camera={{ position: [0, 1.9, 4.3], fov: 42 }} dpr={[1, 1.75]} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[2, 4, 3]} intensity={1.1} />
        <group position={[0, -0.15, 0]}>
          <mesh>
            <sphereGeometry args={[0.3, 48, 48]} />
            <meshStandardMaterial color="#15803d" emissive="#22c55e" emissiveIntensity={0.35} roughness={0.3} />
          </mesh>
          <CoreHalo reducedMotion={reducedMotion} />
          <Html center position={[0, 0, 0]} zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
            <span className="text-2xl leading-none drop-shadow">{centerIcon}</span>
          </Html>
          <Html center position={[0, -0.52, 0]} zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
            <span className="whitespace-nowrap rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-black text-green-900 shadow-sm ring-1 ring-green-100">
              {centerLabel}
            </span>
          </Html>
          <OrbitTrack />
          <RingNodes
            ring={ring}
            focusKey={focusKey}
            paused={paused}
            reducedMotion={reducedMotion}
            onSelect={onSelect}
            onHover={setPaused}
          />
          {!reducedMotion ? <FocusBurst focusKey={focusKey} directions={directions} /> : null}
        </group>
      </Canvas>
    </div>
  );
}
