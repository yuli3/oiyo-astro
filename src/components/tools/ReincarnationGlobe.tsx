import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { REINCARNATION_COUNTRIES, latLonToCartesian, type ReincarnationCountry } from "../../lib/reincarnation";

const EARTH_MAP = "/textures/earth-blue-marble.jpg";

interface Props {
  focusIso3?: string;
  homeIso3?: string;
  hitIso3: string[];
  yaw: number;
  onSelect: (iso2: string) => void;
}

function BareEarth() {
  return (
    <mesh>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial color="#0f2744" roughness={0.85} metalness={0.1} />
    </mesh>
  );
}

function TexturedEarth() {
  const map = useTexture(EARTH_MAP);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;
  return (
    <mesh>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial map={map} roughness={0.92} metalness={0.04} />
    </mesh>
  );
}

function lookQuaternion(lat: number, lon: number, yawDeg: number): THREE.Quaternion {
  const [x, y, z] = latLonToCartesian(lat, lon);
  const face = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(x, y, z).normalize(),
    new THREE.Vector3(0, 0, 1),
  );
  const spin = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), (yawDeg * Math.PI) / 180);
  return spin.multiply(face);
}

function Earth({
  focus,
  homeIso3,
  hit,
  yaw,
  onSelect,
}: {
  focus?: ReincarnationCountry;
  homeIso3?: string;
  hit: Set<string>;
  yaw: number;
  onSelect: (iso2: string) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const target = useMemo(
    () => lookQuaternion(focus?.lat ?? 20, focus?.lon ?? 20, yaw),
    [focus?.iso3, focus?.lat, focus?.lon, yaw],
  );

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.quaternion.slerp(target, 1 - Math.exp(-4 * delta));
  });

  const points = useMemo(
    () =>
      REINCARNATION_COUNTRIES.filter((row) => row.lat != null && row.lon != null).map((row) => ({
        row,
        position: latLonToCartesian(row.lat as number, row.lon as number, 1.02),
      })),
    [],
  );

  return (
    <group ref={group}>
      <Suspense fallback={<BareEarth />}>
        <TexturedEarth />
      </Suspense>
      <mesh>
        <sphereGeometry args={[1.04, 32, 32]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.08} />
      </mesh>
      {points.map(({ row, position }) => {
        const active = focus?.iso3 === row.iso3 || hit.has(row.iso3);
        const isHome = homeIso3 === row.iso3;
        return (
          <mesh
            key={row.iso3}
            position={position}
            onClick={(event) => {
              event.stopPropagation();
              onSelect(row.iso2);
            }}
          >
            <sphereGeometry args={[active ? 0.028 : isHome ? 0.02 : 0.01, 8, 8]} />
            <meshBasicMaterial color={active ? "#34d399" : isHome ? "#fbbf24" : "#94a3b8"} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function ReincarnationGlobe({ focusIso3, homeIso3, hitIso3, yaw, onSelect }: Props) {
  const focus = REINCARNATION_COUNTRIES.find((row) => row.iso3 === focusIso3);
  const hit = useMemo(() => new Set(hitIso3), [hitIso3]);

  return (
    <div>
      <div className="h-80 w-full overflow-hidden rounded-2xl bg-slate-950 sm:h-96">
        <Canvas camera={{ position: [0, 0, 2.6], fov: 40 }} dpr={[1, 1.5]}>
          <color attach="background" args={["#020617"]} />
          <ambientLight intensity={0.55} />
          <directionalLight position={[3, 2, 4]} intensity={1.35} />
          <Earth focus={focus} homeIso3={homeIso3} hit={hit} yaw={yaw} onSelect={onSelect} />
          <OrbitControls enablePan={false} enableZoom={false} rotateSpeed={0.6} />
        </Canvas>
      </div>
      <p className="mt-2 text-[11px] leading-5 text-slate-400">
        <a
          className="underline decoration-slate-300 underline-offset-2 hover:text-slate-600"
          href="https://visibleearth.nasa.gov/images/57752/blue-marble-land-surface-shallow-water-and-shaded-topography"
        >
          NASA Blue Marble
        </a>
        {" · "}NASA / GSFC / Reto Stöckli · public domain
      </p>
    </div>
  );
}
