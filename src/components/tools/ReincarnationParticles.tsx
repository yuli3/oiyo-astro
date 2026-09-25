import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { latLonToCartesian, type WeightMode } from "../../lib/reincarnation";
import { birthsPerSecond, buildDust, mulberry32, type BorderRings } from "../../lib/reincarnation-particles";

/**
 * 환생 지구본의 파티클 층.
 *
 * - BirthDust: 가중치(출생·인구)에 비례해 나라 경계 안에 뿌린 점. 데이터 그 자체다.
 * - BirthFlashes: 신생아 모드에서 실제 초당 출생 수로 먼지 점 하나를 반짝인다.
 *   먼지가 이미 출생 비례라 점을 균등하게 고르면 출생 가중 위치가 된다.
 * - SoulStream: 지구 주위를 도는 영혼 무리. 환생하면 추첨된 나라로 쏟아져 내려앉는다.
 *   연출일 뿐 추첨은 이미 끝나 있다 — 파티클은 결과를 바꾸지 않는다.
 * 모두 지구 group 안에 두어 지구가 돌아도 나라 좌표가 고정된다.
 */

const POINT_VERTEX = /* glsl */ `
  attribute float aAlpha;
  attribute float aHeat;
  attribute float aSize;
  uniform float uPixelRatio;
  varying float vAlpha;
  varying float vHeat;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio / max(0.2, -mv.z);
    vAlpha = aAlpha;
    vHeat = aHeat;
  }
`;

const POINT_FRAGMENT = /* glsl */ `
  uniform vec3 uCool;
  uniform vec3 uHot;
  varying float vAlpha;
  varying float vHeat;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.0, d);
    vec3 color = mix(uCool, uHot, vHeat) + vec3(core * core * 0.35);
    gl_FragColor = vec4(color, core * vAlpha);
  }
`;

function pointMaterial(cool: string, hot: string, pixelRatio: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: POINT_VERTEX,
    fragmentShader: POINT_FRAGMENT,
    uniforms: {
      uPixelRatio: { value: pixelRatio },
      uCool: { value: new THREE.Color(cool) },
      uHot: { value: new THREE.Color(hot) },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

function pointGeometry(count: number): {
  geometry: THREE.BufferGeometry;
  position: Float32Array;
  alpha: Float32Array;
  heat: Float32Array;
  size: Float32Array;
} {
  const position = new Float32Array(count * 3);
  const alpha = new Float32Array(count);
  const heat = new Float32Array(count);
  const size = new Float32Array(count);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
  geometry.setAttribute("aAlpha", new THREE.BufferAttribute(alpha, 1));
  geometry.setAttribute("aHeat", new THREE.BufferAttribute(heat, 1));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  // 파티클이 구 밖으로 날아다니므로 절두체 컬링에 잘리지 않게 한다.
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 3);
  return { geometry, position, alpha, heat, size };
}

function markDirty(geometry: THREE.BufferGeometry, ...names: string[]) {
  for (const name of names) (geometry.getAttribute(name) as THREE.BufferAttribute).needsUpdate = true;
}

export function BirthDust({
  mode,
  borders,
  reducedMotion,
  onDots,
}: {
  mode: WeightMode;
  borders: BorderRings | null;
  reducedMotion: boolean;
  onDots?: (positions: Float32Array) => void;
}) {
  const pixelRatio = useThree((state) => state.viewport.dpr);
  const bundle = useMemo(() => {
    const dots = buildDust(mode, borders);
    const pack = pointGeometry(dots.length);
    const phase = new Float32Array(dots.length);
    const rand = mulberry32(7);
    dots.forEach((dot, i) => {
      const [x, y, z] = latLonToCartesian(dot.lat, dot.lon, 1.009);
      pack.position.set([x, y, z], i * 3);
      phase[i] = rand() * Math.PI * 2;
      pack.size[i] = 3.2 + rand() * 1.6;
      pack.alpha[i] = 0.7;
    });
    return { ...pack, phase, count: dots.length };
  }, [mode, borders]);
  const material = useMemo(
    () => pointMaterial(mode === "births" ? "#34d399" : "#7dd3fc", "#fef3c7", pixelRatio),
    [mode, pixelRatio],
  );
  const born = useRef(0);

  useEffect(() => {
    born.current = 0;
    onDots?.(bundle.position);
    return () => bundle.geometry.dispose();
  }, [bundle, onDots]);
  useEffect(() => () => material.dispose(), [material]);

  useFrame((state, delta) => {
    // 모드를 바꾸면 새 분포가 0에서 떠오른다.
    born.current = Math.min(1, born.current + delta * (reducedMotion ? 100 : 0.9));
    const t = state.clock.elapsedTime;
    const { alpha, phase, count, geometry } = bundle;
    for (let i = 0; i < count; i += 1) {
      const twinkle = reducedMotion ? 0.8 : 0.55 + 0.45 * Math.sin(t * 1.4 + phase[i]);
      alpha[i] = twinkle * 0.75 * born.current;
    }
    markDirty(geometry, "aAlpha");
  });

  return <points geometry={bundle.geometry} material={material} renderOrder={2} />;
}

const FLASH_POOL = 48;
const FLASH_LIFE = 1.1;

export function BirthFlashes({ dots, active }: { dots: Float32Array | null; active: boolean }) {
  const pixelRatio = useThree((state) => state.viewport.dpr);
  const pack = useMemo(() => pointGeometry(FLASH_POOL), []);
  const material = useMemo(() => pointMaterial("#fde68a", "#ffffff", pixelRatio), [pixelRatio]);
  const age = useRef(new Float32Array(FLASH_POOL).fill(FLASH_LIFE));
  const cursor = useRef(0);
  const debt = useRef(0);
  const rate = useMemo(() => birthsPerSecond(), []);

  useEffect(() => () => pack.geometry.dispose(), [pack]);
  useEffect(() => () => material.dispose(), [material]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    const ages = age.current;
    if (active && dots && dots.length >= 3) {
      debt.current += delta * rate;
      while (debt.current >= 1) {
        debt.current -= 1;
        const slot = cursor.current;
        cursor.current = (cursor.current + 1) % FLASH_POOL;
        const index = Math.floor(Math.random() * (dots.length / 3)) * 3;
        pack.position[slot * 3] = dots[index] * 1.004;
        pack.position[slot * 3 + 1] = dots[index + 1] * 1.004;
        pack.position[slot * 3 + 2] = dots[index + 2] * 1.004;
        ages[slot] = 0;
      }
    }
    for (let i = 0; i < FLASH_POOL; i += 1) {
      ages[i] = Math.min(FLASH_LIFE, ages[i] + delta);
      const k = ages[i] / FLASH_LIFE;
      pack.alpha[i] = k >= 1 ? 0 : Math.sin(Math.PI * Math.min(1, k * 2.2)) * (1 - k);
      pack.size[i] = 10 + 26 * k;
      pack.heat[i] = 1 - k;
    }
    markDirty(pack.geometry, "position", "aAlpha", "aSize", "aHeat");
  });

  return <points geometry={pack.geometry} material={material} renderOrder={3} />;
}

const SOUL_COUNT = 1100;
const TRAVEL = 1.25;
const BURST = 0.85;
const REBORN = 1.4;

function easeInOut(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function easeOut(x: number) {
  return 1 - Math.pow(1 - x, 3);
}

/**
 * 추첨 한 번(drawKey)마다 영혼 무리가 targets로 흩어져 내려앉는다.
 * 여러 번 환생하면 무리가 목적지 수만큼 나뉜다.
 */
export function SoulStream({ targets, drawKey }: { targets: [number, number, number][]; drawKey: number }) {
  const pixelRatio = useThree((state) => state.viewport.dpr);
  const clock = useThree((state) => state.clock);
  const pack = useMemo(() => pointGeometry(SOUL_COUNT), []);
  const material = useMemo(() => pointMaterial("#c4b5fd", "#fde68a", pixelRatio), [pixelRatio]);

  const orbit = useMemo(() => {
    const rand = mulberry32(42);
    const u = new Float32Array(SOUL_COUNT * 3);
    const v = new Float32Array(SOUL_COUNT * 3);
    const radius = new Float32Array(SOUL_COUNT);
    const speed = new Float32Array(SOUL_COUNT);
    const phase = new Float32Array(SOUL_COUNT);
    const axis = new THREE.Vector3();
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    for (let i = 0; i < SOUL_COUNT; i += 1) {
      // 궤도면을 적도 쪽으로 약간 모아 은하 띠처럼 보이게 한다.
      axis.set((rand() - 0.5) * 0.9, 1, (rand() - 0.5) * 0.9).normalize();
      a.set(1, 0, 0).cross(axis);
      if (a.lengthSq() < 1e-4) a.set(0, 0, 1).cross(axis);
      a.normalize();
      b.copy(axis).cross(a).normalize();
      u.set([a.x, a.y, a.z], i * 3);
      v.set([b.x, b.y, b.z], i * 3);
      radius[i] = 1.3 + Math.pow(rand(), 1.6) * 0.75;
      speed[i] = (0.06 + rand() * 0.16) * (rand() < 0.85 ? 1 : -1);
      phase[i] = rand() * Math.PI * 2;
      pack.size[i] = 2.4 + rand() * 3.2;
    }
    return { u, v, radius, speed, phase };
  }, [pack]);

  const flight = useMemo(
    () => ({
      launch: new Float32Array(SOUL_COUNT).fill(-1),
      captured: new Uint8Array(SOUL_COUNT),
      start: new Float32Array(SOUL_COUNT * 3),
      ctrl: new Float32Array(SOUL_COUNT * 3),
      end: new Float32Array(SOUL_COUNT * 3),
      burst: new Float32Array(SOUL_COUNT * 3),
      dur: new Float32Array(SOUL_COUNT),
    }),
    [],
  );

  useEffect(() => () => pack.geometry.dispose(), [pack]);
  useEffect(() => () => material.dispose(), [material]);

  const lastKey = useRef(drawKey);
  useEffect(() => {
    if (drawKey === lastKey.current) return;
    lastKey.current = drawKey;
    if (!targets.length) return;
    const now = clock.elapsedTime;
    const rand = Math.random;
    const dir = new THREE.Vector3();
    const jitter = new THREE.Vector3();
    for (let i = 0; i < SOUL_COUNT; i += 1) {
      const [tx, ty, tz] = targets[i % targets.length];
      dir.set(tx, ty, tz).normalize();
      flight.launch[i] = now + rand() * 0.6;
      flight.captured[i] = 0;
      flight.dur[i] = TRAVEL * (0.85 + rand() * 0.3);
      flight.end.set([tx, ty, tz], i * 3);
      jitter.set(rand() - 0.5, rand() - 0.5, rand() - 0.5).multiplyScalar(0.7);
      flight.ctrl.set([dir.x * 1.9 + jitter.x, dir.y * 1.9 + jitter.y, dir.z * 1.9 + jitter.z], i * 3);
      jitter.set(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize().addScaledVector(dir, 0.6).normalize();
      flight.burst.set([jitter.x, jitter.y, jitter.z], i * 3);
    }
  }, [drawKey, targets, clock, flight]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const { u, v, radius, speed, phase } = orbit;
    const { position, alpha, heat } = pack;
    for (let i = 0; i < SOUL_COUNT; i += 1) {
      const i3 = i * 3;
      const angle = phase[i] + speed[i] * t;
      const c = Math.cos(angle) * radius[i];
      const s = Math.sin(angle) * radius[i];
      const hx = u[i3] * c + v[i3] * s;
      const hy = u[i3 + 1] * c + v[i3 + 1] * s;
      const hz = u[i3 + 2] * c + v[i3 + 2] * s;
      const idleAlpha = 0.28 + 0.2 * Math.sin(t * 0.9 + phase[i] * 3);

      const launch = flight.launch[i];
      const since = launch < 0 ? -1 : t - launch;
      if (since < 0) {
        position[i3] = hx;
        position[i3 + 1] = hy;
        position[i3 + 2] = hz;
        alpha[i] = idleAlpha;
        heat[i] = 0;
        continue;
      }
      if (!flight.captured[i]) {
        // 출발 순간의 자리에서 떠난다 — 다시 환생하면 날던 자리에서 방향을 튼다.
        flight.start[i3] = position[i3];
        flight.start[i3 + 1] = position[i3 + 1];
        flight.start[i3 + 2] = position[i3 + 2];
        flight.captured[i] = 1;
      }
      const dur = flight.dur[i];
      if (since < dur) {
        const k = easeInOut(since / dur);
        const a = (1 - k) * (1 - k);
        const b = 2 * (1 - k) * k;
        const cc = k * k;
        for (let axis = 0; axis < 3; axis += 1) {
          position[i3 + axis] =
            a * flight.start[i3 + axis] + b * flight.ctrl[i3 + axis] + cc * flight.end[i3 + axis];
        }
        alpha[i] = 0.45 + 0.5 * k;
        heat[i] = k;
        continue;
      }
      if (since < dur + BURST) {
        const k = (since - dur) / BURST;
        const push = easeOut(k) * 0.26;
        for (let axis = 0; axis < 3; axis += 1) {
          position[i3 + axis] = flight.end[i3 + axis] + flight.burst[i3 + axis] * push;
        }
        alpha[i] = 0.95 * (1 - k);
        heat[i] = 1 - k * 0.4;
        continue;
      }
      const k = Math.min(1, (since - dur - BURST) / REBORN);
      position[i3] = hx;
      position[i3 + 1] = hy;
      position[i3 + 2] = hz;
      alpha[i] = idleAlpha * k;
      heat[i] = 0;
      if (k >= 1) flight.launch[i] = -1;
    }
    markDirty(pack.geometry, "position", "aAlpha", "aHeat");
  });

  return <points geometry={pack.geometry} material={material} renderOrder={4} />;
}

/** 영혼이 닿는 순간 나라 위에 퍼지는 고리. */
export function ArrivalRings({ targets, drawKey }: { targets: [number, number, number][]; drawKey: number }) {
  const clock = useThree((state) => state.clock);
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const started = useRef(-1);
  const unique = useMemo(() => {
    const seen = new Set<string>();
    return targets.filter((point) => {
      const key = point.map((n) => n.toFixed(3)).join(",");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [targets]);
  const orient = useMemo(
    () =>
      unique.map((point) =>
        new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(...point).normalize()),
      ),
    [unique],
  );

  const lastKey = useRef(drawKey);
  useEffect(() => {
    if (drawKey === lastKey.current) return;
    lastKey.current = drawKey;
    started.current = clock.elapsedTime + TRAVEL * 0.95;
  }, [drawKey, clock]);

  useFrame((state) => {
    const since = started.current < 0 ? -1 : state.clock.elapsedTime - started.current;
    refs.current.forEach((mesh, index) => {
      if (!mesh) return;
      const local = since - index * 0.05;
      const visible = local >= 0 && local < 1.6;
      mesh.visible = visible;
      if (!visible) return;
      const k = local / 1.6;
      mesh.scale.setScalar(0.02 + easeOut(k) * 0.3);
      (mesh.material as THREE.MeshBasicMaterial).opacity = 0.85 * (1 - k);
    });
  });

  return (
    <group>
      {unique.map((point, index) => (
        <mesh
          key={`${drawKey}-${index}`}
          ref={(node) => {
            refs.current[index] = node;
          }}
          position={point}
          quaternion={orient[index]}
          visible={false}
        >
          <ringGeometry args={[0.82, 1, 48]} />
          <meshBasicMaterial
            color="#fde68a"
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

/** 배경 별. 지구 group 밖에 두어 지구가 돌아도 하늘은 천천히만 흐른다. */
export function StarField({ reducedMotion }: { reducedMotion: boolean }) {
  const pixelRatio = useThree((state) => state.viewport.dpr);
  const pack = useMemo(() => {
    const count = 1400;
    const next = pointGeometry(count);
    const rand = mulberry32(9);
    for (let i = 0; i < count; i += 1) {
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      const r = 14 + rand() * 18;
      next.position.set(
        [r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta)],
        i * 3,
      );
      next.alpha[i] = 0.25 + rand() * 0.6;
      next.size[i] = 18 + rand() * 40;
      next.heat[i] = rand() * 0.6;
    }
    next.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 40);
    return next;
  }, []);
  const material = useMemo(() => pointMaterial("#94a3b8", "#fef9c3", pixelRatio), [pixelRatio]);
  const ref = useRef<THREE.Points>(null);

  useEffect(() => () => pack.geometry.dispose(), [pack]);
  useEffect(() => () => material.dispose(), [material]);

  useFrame((_, delta) => {
    if (!reducedMotion && ref.current) ref.current.rotation.y += delta * 0.006;
  });

  return <points ref={ref} geometry={pack.geometry} material={material} renderOrder={0} />;
}
