// 태어난 순간의 해·달 — three.js 장면. lazy chunk라 입력을 마친 사람에게만 three가 내려간다.
//
// 좌표: lib/birth-sky.ts 머리말. 지구 중심, y = 북극, 지구 메시를 GAST만큼 돌려서 출생지가
// 그 순간 실제로 해·달을 향한 각도를 갖게 한다. 달은 방향은 실제, 거리·크기는 줄였다.
// 해는 같은 방향 먼 곳에 두고 그 방향의 평행광으로 지구 낮·밤과 달의 위상을 함께 만든다
// (위상이 따로 그린 그림이 아니라 같은 빛이 만든 결과다).
// 표면 이미지: Solar System Scope (CC BY 4.0, NASA 자료 기반). public/textures/birth-sky/SOURCE.txt.
import { Suspense, useEffect, useMemo, useRef, type ComponentRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Line, OrbitControls, useTexture } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { AdditiveBlending, BackSide, Color, SRGBColorSpace, Vector3, type Group, type Texture } from "three";
import { rotateY, surfaceLocal, type BirthSky, type Vec3 } from "../../../lib/birth-sky";
import { SCENE } from "./data";

export type ViewMode = "space" | "moon" | "sun";

interface Props {
  sky: BirthSky;
  lat: number;
  lon: number;
  view: ViewMode;
  labels: { you: string; moon: string; sun: string };
  onCanvas?: (canvas: HTMLCanvasElement) => void;
}

const DEG = Math.PI / 180;
const TEX = "/textures/birth-sky/";
const SUN_DISTANCE = 70;
const SUN_RADIUS = 3.2;
const MOON_RADIUS = 0.3;

/** Real lunar distance is ~60 Earth radii; drawn at 6% so Earth and Moon share a phone-sized frame. */
export function moonSceneDistance(km: number): number {
  return (km / 6371) * 0.06;
}

function srgb(...ts: Texture[]) {
  for (const t of ts) {
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = 4;
  }
}

function useReducedMotion(): boolean {
  return useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);
}

const v3 = (v: Vec3, s = 1) => new Vector3(v[0] * s, v[1] * s, v[2] * s);

/* ---------- Earth ---------- */

const EARTH_VERT = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vPosW;
void main() {
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vPosW = wp.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const EARTH_FRAG = /* glsl */ `
uniform sampler2D dayMap;
uniform sampler2D nightMap;
uniform sampler2D cloudMap;
uniform vec3 sunDir;
uniform float cloudShift;
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vPosW;
void main() {
  vec3 n = normalize(vNormalW);
  float d = dot(n, normalize(sunDir));
  vec3 day = texture2D(dayMap, vUv).rgb;
  vec3 night = texture2D(nightMap, vUv).rgb;
  float cloud = texture2D(cloudMap, vUv + vec2(cloudShift, 0.0)).r;
  vec3 lit = mix(day, vec3(1.0), cloud * 0.8) * (0.03 + 1.1 * max(d, 0.0));
  vec3 dark = day * 0.008 + night * 2.4 * (1.0 - cloud * 0.7);
  // warm band along the terminator: sunrise / sunset line
  float dusk = exp(-pow(d / 0.05, 2.0)) * 0.12;
  vec3 col = mix(dark, lit, smoothstep(-0.1, 0.16, d)) + vec3(1.0, 0.45, 0.2) * dusk;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

const ATMO_FRAG = /* glsl */ `
uniform vec3 glow;
uniform vec3 sunDir;
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vPosW;
void main() {
  vec3 n = normalize(vNormalW);
  vec3 v = normalize(cameraPosition - vPosW);
  float rim = pow(1.0 - max(dot(n, v), 0.0), 3.0);
  float sun = smoothstep(-0.35, 0.6, dot(n, normalize(sunDir)));
  gl_FragColor = vec4(glow * rim * sun * 1.5, rim * sun);
  #include <colorspace_fragment>
}`;

function Earth({ sunDir, still }: { sunDir: Vec3; still: boolean }) {
  const [day, night, clouds] = useTexture([`${TEX}earth-day.webp`, `${TEX}earth-night.webp`, `${TEX}earth-clouds.webp`], (ts) =>
    srgb(...(ts as Texture[]).slice(0, 2)),
  );
  const uniforms = useMemo(
    () => ({ dayMap: { value: day }, nightMap: { value: night }, cloudMap: { value: clouds }, sunDir: { value: v3(sunDir) }, cloudShift: { value: 0 } }),
    [day, night, clouds, sunDir],
  );
  const atmo = useMemo(() => ({ glow: { value: new Color(SCENE.atmosphere) }, sunDir: { value: v3(sunDir) } }), [sunDir]);
  useFrame((_, dt) => {
    if (!still) uniforms.cloudShift.value = (uniforms.cloudShift.value + dt * 0.0015) % 1;
  });
  return (
    <>
      <mesh>
        <sphereGeometry args={[1, 96, 48]} />
        <shaderMaterial vertexShader={EARTH_VERT} fragmentShader={EARTH_FRAG} uniforms={uniforms} />
      </mesh>
      <mesh scale={1.05}>
        <sphereGeometry args={[1, 64, 32]} />
        <shaderMaterial vertexShader={EARTH_VERT} fragmentShader={ATMO_FRAG} uniforms={atmo} transparent blending={AdditiveBlending} depthWrite={false} />
      </mesh>
    </>
  );
}

function Marker({ lat, lon, label, show }: { lat: number; lon: number; label: string; show: boolean }) {
  const p = surfaceLocal(lat, lon);
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.scale.setScalar(1 + 0.25 * Math.sin(clock.elapsedTime * 3));
  });
  return (
    <group position={p}>
      <group ref={ref}>
        <mesh>
          <sphereGeometry args={[0.025, 16, 8]} />
          <meshBasicMaterial color={new Color(SCENE.marker).multiplyScalar(2.2)} toneMapped={false} />
        </mesh>
      </group>
      <Line points={[[0, 0, 0], [p[0] * 0.12, p[1] * 0.12, p[2] * 0.12]]} color={SCENE.marker} lineWidth={2} />
      <Html center position={[p[0] * 0.17, p[1] * 0.17, p[2] * 0.17]} zIndexRange={[10, 0]}>
        <span className={show ? "rounded-md bg-background/85 px-2 py-0.5 text-xs font-bold whitespace-nowrap text-foreground" : "hidden"}>{label}</span>
      </Html>
    </group>
  );
}

/* ---------- Moon & Sun ---------- */

function Moon({ pos }: { pos: Vector3 }) {
  const map = useTexture(`${TEX}moon.webp`, (t) => srgb(t as Texture));
  const ref = useRef<Group>(null);
  // Tidal lock: the near side (texture longitude 0, +x of the sphere) faces Earth.
  useEffect(() => {
    if (!ref.current) return;
    ref.current.lookAt(0, 0, 0);
    ref.current.rotateY(-Math.PI / 2);
  }, [pos]);
  return (
    <group ref={ref} position={pos}>
      <mesh>
        <sphereGeometry args={[MOON_RADIUS, 64, 32]} />
        <meshStandardMaterial map={map} roughness={1} metalness={0} />
      </mesh>
    </group>
  );
}

const SUN_GLOW = new Color(SCENE.sunCore).multiplyScalar(3.4);

function Sun({ pos }: { pos: Vector3 }) {
  const map = useTexture(`${TEX}sun.webp`, (t) => srgb(t as Texture));
  return (
    <mesh position={pos}>
      <sphereGeometry args={[SUN_RADIUS, 48, 24]} />
      <meshBasicMaterial map={map} color={SUN_GLOW} toneMapped={false} />
    </mesh>
  );
}

function MilkyWay() {
  const map = useTexture(`${TEX}milky-way.webp`, (t) => srgb(t as Texture));
  return (
    <mesh>
      <sphereGeometry args={[400, 48, 24]} />
      <meshBasicMaterial map={map} side={BackSide} color={SCENE.milkyDim} toneMapped={false} depthWrite={false} />
    </mesh>
  );
}

function MoonOrbit({ normal, radius }: { normal: Vec3; radius: number }) {
  const points = useMemo(() => {
    const n = v3(normal).normalize();
    const a = new Vector3(0, 1, 0).cross(n);
    if (a.lengthSq() < 1e-6) a.set(1, 0, 0);
    a.normalize();
    const b = n.clone().cross(a).normalize();
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 180; i++) {
      const t = (i / 180) * Math.PI * 2;
      const p = a.clone().multiplyScalar(Math.cos(t) * radius).add(b.clone().multiplyScalar(Math.sin(t) * radius));
      pts.push([p.x, p.y, p.z]);
    }
    return pts;
  }, [normal, radius]);
  return <Line points={points} color={SCENE.moonOrbit} lineWidth={0.8} transparent opacity={0.45} dashed dashSize={0.25} gapSize={0.18} />;
}

/* ---------- Camera ---------- */

function CameraRig({ view, marker, moonPos, sunPos, still }: { view: ViewMode; marker: Vector3; moonPos: Vector3; sunPos: Vector3; still: boolean }) {
  const { camera } = useThree();
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const goal = useMemo(() => {
    if (view === "space") {
      // Side-on to the Earth–Moon line so both fit, turned toward the birthplace's side of Earth.
      const m = moonPos.clone().normalize();
      const side = m.clone().cross(new Vector3(0, 1, 0));
      if (side.lengthSq() < 1e-6) side.set(1, 0, 0);
      side.normalize();
      if (side.dot(marker) < 0) side.negate();
      const target = moonPos.clone().multiplyScalar(0.45);
      const dir = side.add(marker.clone().normalize().multiplyScalar(0.35)).add(new Vector3(0, 0.3, 0)).normalize();
      return { pos: target.clone().add(dir.multiplyScalar(moonPos.length() * 1.55 + 1)), target };
    }
    const target = view === "moon" ? moonPos : sunPos;
    const up = marker.clone().normalize();
    return { pos: up.clone().multiplyScalar(1.012), target: target.clone() };
  }, [view, marker, moonPos, sunPos]);
  const progress = useRef(still ? 1 : 0);
  const from = useRef({ pos: new Vector3(), target: new Vector3() });

  useEffect(() => {
    from.current.pos.copy(camera.position);
    from.current.target.copy(controls.current?.target ?? new Vector3());
    progress.current = still ? 1 : 0;
    if (still) {
      camera.position.copy(goal.pos);
      controls.current?.target.copy(goal.target);
    }
    // surface views look along the local vertical: keep "up" as the zenith so the horizon is level
    camera.up.copy(view === "space" ? new Vector3(0, 1, 0) : marker.clone().normalize());
  }, [goal, camera, still, view, marker]);

  useFrame((_, dt) => {
    const c = controls.current;
    if (!c) return;
    if (progress.current < 1) {
      progress.current = Math.min(1, progress.current + dt / 1.6);
      const t = 1 - Math.pow(1 - progress.current, 3);
      camera.position.lerpVectors(from.current.pos, goal.pos, t);
      c.target.lerpVectors(from.current.target, goal.target, t);
    }
    // OrbitControls.update() clamps distance and assumes a y-up frame; the surface views
    // (looking at a Sun 70 units away, zenith as "up") aim the camera directly instead.
    if (view === "space") c.update();
    else camera.lookAt(c.target);
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enabled={view === "space"}
      enablePan={false}
      minDistance={1.6}
      maxDistance={60}
      enableDamping
      dampingFactor={0.08}
    />
  );
}

/* ---------- Scene ---------- */

export default function BirthSkyScene({ sky, lat, lon, view, labels, onCanvas }: Props) {
  const still = useReducedMotion();
  const moonPos = useMemo(() => v3(sky.moon.dir, moonSceneDistance(sky.moon.distanceKm)), [sky]);
  const sunPos = useMemo(() => v3(sky.sun.dir, SUN_DISTANCE), [sky]);
  const marker = useMemo(() => v3(rotateY(surfaceLocal(lat, lon), sky.gastDeg)), [lat, lon, sky]);
  const startPos = useMemo(() => marker.clone().normalize().multiplyScalar(40).add(new Vector3(0, 12, 0)), [marker]);

  return (
    <Canvas
      camera={{ position: [startPos.x, startPos.y, startPos.z], fov: 45, near: 0.002, far: 1200 }}
      dpr={[1, 2]}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
      onCreated={({ gl }) => onCanvas?.(gl.domElement)}
    >
      <color attach="background" args={[SCENE.space]} />
      <ambientLight intensity={0.04} />
      <directionalLight position={sunPos} intensity={3.2} color={SCENE.sunlight} />
      <Suspense fallback={null}>
        <MilkyWay />
      </Suspense>
      <Suspense fallback={null}>
        <Sun pos={sunPos} />
      </Suspense>
      <group rotation={[0, sky.gastDeg * DEG, 0]}>
        <Suspense fallback={null}>
          <Earth sunDir={sky.sun.dir} still={still} />
        </Suspense>
        <Marker lat={lat} lon={lon} label={labels.you} show={view === "space"} />
      </group>
      <Suspense fallback={null}>
        <Moon pos={moonPos} />
      </Suspense>
      {view === "space" && <MoonOrbit normal={sky.moon.orbitNormal} radius={moonPos.length()} />}
      <Html center position={moonPos.clone().add(new Vector3(0, MOON_RADIUS + 0.35, 0))} zIndexRange={[10, 0]}>
        <span className={view === "space" ? "rounded-md bg-background/85 px-2 py-0.5 text-xs font-bold whitespace-nowrap text-foreground" : "hidden"}>{labels.moon}</span>
      </Html>
      <Html center position={sky.sun.dir.map((x) => x * 9) as Vec3} zIndexRange={[10, 0]}>
        <span className={view === "space" ? "rounded-md bg-background/70 px-2 py-0.5 text-xs whitespace-nowrap text-foreground" : "hidden"}>{labels.sun} →</span>
      </Html>
      <CameraRig view={view} marker={marker} moonPos={moonPos} sunPos={sunPos} still={still} />
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.2} intensity={1.2} radius={0.8} />
      </EffectComposer>
    </Canvas>
  );
}
