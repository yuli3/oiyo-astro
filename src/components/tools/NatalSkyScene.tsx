import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useReducedMotion } from "../../hooks/useMotion";
import { eclipticAngle, placeSkyBodies } from "../../lib/ontology/natal/sky-layout";
import { mulberry32 } from "../../lib/reincarnation-particles";

/**
 * 출생차트 3D 천구(Three.js). 태어난 순간 황도 위 천체 자리를 그대로 그린다.
 *
 * - 황도 고리: 12별자리 호, 원소 색(불·흙·공기·물).
 * - 천체: 실제 황경 자리. 가까운 천체는 위로 쌓는다(`placeSkyBodies`).
 *   ASC 가 있으면 왼쪽(9시)에 두고, 없으면 양자리 0°를 왼쪽에 둔다.
 * - 처음 열면 천체가 가운데에서 나선을 그리며 제자리로 간다. 역행 천체는 반대로 흐르는
 *   꼬리를 남긴다. 천체를 누르면 아래 설명 카드로 이동한다.
 * 감축 선호면 제자리에 멈춘 한 장면만 그린다.
 */

export interface SkyBody {
  key: string;
  label: string;
  longitude: number;
  retrograde?: boolean;
}

export interface SkySign {
  key: string;
  emoji: string;
  name: string;
  element: "fire" | "earth" | "air" | "water";
}

interface Props {
  bodies: SkyBody[];
  signs: SkySign[];
  ascendant?: number | null;
  ascLabel?: string;
  onSelect: (key: string) => void;
}

const R = 1.9;
const STACK_STEP = 0.2;

const ELEMENT_COLOR: Record<SkySign["element"], string> = {
  fire: "#fb923c",
  earth: "#a3e635",
  air: "#7dd3fc",
  water: "#818cf8",
};

const BODY_COLOR: Record<string, string> = {
  sun: "#fde047",
  moon: "#e2e8f0",
  mercury: "#cbd5e1",
  venus: "#f9a8d4",
  mars: "#f87171",
  jupiter: "#fdba74",
  saturn: "#d6c49a",
  uranus: "#67e8f9",
  neptune: "#60a5fa",
  pluto: "#c084fc",
};

const BODY_SIZE: Record<string, number> = { sun: 0.13, moon: 0.1, jupiter: 0.1, saturn: 0.095 };

function ringPoint(angle: number, radius: number, y = 0): [number, number, number] {
  return [Math.cos(angle) * radius, y, -Math.sin(angle) * radius];
}

function SignArcs({ signs, ascendant }: { signs: SkySign[]; ascendant?: number | null }) {
  const arcs = useMemo(
    () =>
      signs.map((sign, i) => {
        const start = eclipticAngle(i * 30, ascendant);
        const geometry = new THREE.TorusGeometry(R, 0.018, 6, 48, (30 * Math.PI) / 180 - 0.03);
        return { sign, start, geometry, mid: eclipticAngle(i * 30 + 15, ascendant) };
      }),
    [signs, ascendant],
  );
  useEffect(() => () => arcs.forEach((arc) => arc.geometry.dispose()), [arcs]);

  return (
    <group>
      {arcs.map(({ sign, start, geometry, mid }) => (
        <group key={sign.key}>
          {/* 토러스는 xy 평면이라 황도(xz)로 눕히고, 호의 시작을 별자리 0°에 맞춘다. */}
          <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, start + 0.015]}>
            <meshBasicMaterial color={ELEMENT_COLOR[sign.element]} transparent opacity={0.75} />
          </mesh>
          <Html center position={ringPoint(mid, R + 0.32, 0)} zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
            <span title={sign.name} className="text-sm leading-none" style={{ color: ELEMENT_COLOR[sign.element] }}>
              {sign.emoji}
            </span>
          </Html>
        </group>
      ))}
    </group>
  );
}

function StarDust({ reducedMotion }: { reducedMotion: boolean }) {
  const geometry = useMemo(() => {
    const rand = mulberry32(21);
    const count = 900;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      const r = 6 + rand() * 8;
      pos.set([r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta)], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  const ref = useRef<THREE.Points>(null);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame((_, delta) => {
    if (!reducedMotion && ref.current) ref.current.rotation.y += delta * 0.01;
  });
  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial color="#e2e8f0" size={0.035} sizeAttenuation transparent opacity={0.7} depthWrite={false} />
    </points>
  );
}

const TRAIL = 36;

function Planets({
  bodies,
  ascendant,
  reducedMotion,
  onSelect,
}: {
  bodies: SkyBody[];
  ascendant?: number | null;
  reducedMotion: boolean;
  onSelect: (key: string) => void;
}) {
  const placed = useMemo(() => placeSkyBodies(bodies, ascendant), [bodies, ascendant]);
  const refs = useRef<(THREE.Group | null)[]>([]);
  const clock = useThree((s) => s.clock);
  const born = useRef(clock.elapsedTime);
  useEffect(() => {
    born.current = clock.elapsedTime;
  }, [placed, clock]);

  // 천체마다 꼬리 알갱이 — 이동 중엔 지나온 길, 자리 잡은 뒤엔 황도를 따라 흐른다(역행은 반대로).
  const trail = useMemo(() => {
    const count = placed.length * TRAIL;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    placed.forEach((body, b) => {
      const c = new THREE.Color(BODY_COLOR[body.key] ?? "#ffffff");
      for (let i = 0; i < TRAIL; i += 1) col.set([c.r, c.g, c.b], (b * TRAIL + i) * 3);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 4);
    return { g, pos };
  }, [placed]);
  useEffect(() => () => trail.g.dispose(), [trail]);

  const positionAt = (i: number, k: number): [number, number, number] => {
    const body = placed[i];
    const e = 1 - Math.pow(1 - k, 3);
    // 나선: 가운데에서 한 바퀴 돌며 제자리 각도로 간다.
    const angle = body.angle - (1 - e) * Math.PI * 1.5;
    return ringPoint(angle, R * e, body.stack * STACK_STEP * e);
  };

  useFrame((state) => {
    const since = state.clock.elapsedTime - born.current;
    placed.forEach((body, i) => {
      const k = reducedMotion ? 1 : Math.min(1, Math.max(0, (since - i * 0.08) / 1.6));
      const node = refs.current[i];
      if (node) node.position.set(...positionAt(i, k));
      for (let j = 0; j < TRAIL; j += 1) {
        const idx = (i * TRAIL + j) * 3;
        let p: [number, number, number];
        if (reducedMotion) {
          p = [0, -100, 0];
        } else if (k < 1) {
          p = positionAt(i, Math.max(0, k - j * 0.012));
        } else {
          // 자리 잡은 뒤: 황도를 따라 짧게 흐르는 꼬리. 역행이면 반대쪽으로 흐른다.
          const flow = ((state.clock.elapsedTime * 0.35 + j / TRAIL) % 1) * 0.28;
          const dir = body.retrograde ? 1 : -1;
          p = ringPoint(body.angle + dir * flow, R, body.stack * STACK_STEP);
        }
        trail.pos[idx] = p[0];
        trail.pos[idx + 1] = p[1];
        trail.pos[idx + 2] = p[2];
      }
    });
    (trail.g.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
  });

  return (
    <group>
      <points geometry={trail.g}>
        <pointsMaterial vertexColors size={0.03} sizeAttenuation transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      {placed.map((body, i) => {
        const source = bodies.find((b) => b.key === body.key)!;
        const color = BODY_COLOR[body.key] ?? "#ffffff";
        return (
          <group
            key={body.key}
            ref={(el) => {
              refs.current[i] = el;
            }}
          >
            {body.stack > 0 ? (
              <mesh position={[0, (-body.stack * STACK_STEP) / 2, 0]}>
                <cylinderGeometry args={[0.004, 0.004, body.stack * STACK_STEP, 4]} />
                <meshBasicMaterial color={color} transparent opacity={0.35} />
              </mesh>
            ) : null}
            <mesh>
              <sphereGeometry args={[BODY_SIZE[body.key] ?? 0.075, 24, 24]} />
              <meshBasicMaterial color={color} />
            </mesh>
            <Html center position={[0, 0.2, 0]} zIndexRange={[20, 0]}>
              <button
                type="button"
                onClick={() => onSelect(body.key)}
                className="whitespace-nowrap rounded-full bg-slate-900/70 px-1.5 py-0.5 text-[10px] font-bold text-white ring-1 ring-white/20 hover:bg-slate-800"
              >
                {source.label}
                {source.retrograde ? " ℞" : ""}
              </button>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

export default function NatalSkyScene({ bodies, signs, ascendant, ascLabel, onSelect }: Props) {
  const reducedMotion = useReducedMotion();
  return (
    <div className="relative h-80 w-full overflow-hidden rounded-2xl bg-slate-950 sm:h-96">
      <Canvas camera={{ position: [0, 3.2, 4.4], fov: 42 }} dpr={[1, 1.75]}>
        <color attach="background" args={["#020617"]} />
        <StarDust reducedMotion={reducedMotion} />
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[R - 0.05, 64]} />
          <meshBasicMaterial color="#0f172a" transparent opacity={0.55} />
        </mesh>
        <SignArcs signs={signs} ascendant={ascendant} />
        {ascendant != null ? (
          <group>
            <mesh position={ringPoint(Math.PI, R / 2)} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.006, 0.006, R, 6]} />
              <meshBasicMaterial color="#fef08a" transparent opacity={0.6} />
            </mesh>
            <Html center position={ringPoint(Math.PI, R - 0.35, 0.12)} zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
              <span className="whitespace-nowrap text-[10px] font-black text-yellow-200">{ascLabel ?? "ASC"}</span>
            </Html>
          </group>
        ) : null}
        <Planets bodies={bodies} ascendant={ascendant} reducedMotion={reducedMotion} onSelect={onSelect} />
        <OrbitControls enablePan={false} enableZoom={false} rotateSpeed={0.5} autoRotate={!reducedMotion} autoRotateSpeed={0.35} />
      </Canvas>
    </div>
  );
}
