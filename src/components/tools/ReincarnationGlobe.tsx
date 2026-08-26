import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls, useTexture } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { REINCARNATION_COUNTRIES, latLonToCartesian, type ReincarnationCountry } from "../../lib/reincarnation";
import { useReducedMotion } from "../../hooks/useMotion";

type BorderRings = Record<string, number[][][]>;

const EARTH_MAP = "/textures/earth-blue-marble.jpg";

interface Props {
  focusIso3?: string;
  focusLabel?: string;
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

function useBorderRings(): BorderRings | null {
  const [data, setData] = useState<BorderRings | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch("/data/reincarnation-borders.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json && typeof json === "object") setData(json as BorderRings);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return data;
}

function ringToSpherePositions(ring: number[][], radius: number): number[] {
  const positions: number[] = [];
  for (let i = 0; i < ring.length - 1; i += 1) {
    const a = latLonToCartesian(ring[i][1], ring[i][0], radius);
    const b = latLonToCartesian(ring[i + 1][1], ring[i + 1][0], radius);
    positions.push(...a, ...b);
  }
  return positions;
}

function fillGeometry(ring: number[][], radius: number): THREE.BufferGeometry | null {
  if (ring.length < 4) return null;
  try {
    const shape = new THREE.Shape();
    ring.forEach(([lon, lat], index) => {
      if (index === 0) shape.moveTo(lon, lat);
      else shape.lineTo(lon, lat);
    });
    const geometry = new THREE.ShapeGeometry(shape);
    const pos = geometry.getAttribute("position");
    for (let i = 0; i < pos.count; i += 1) {
      const lon = pos.getX(i);
      const lat = pos.getY(i);
      const [x, y, z] = latLonToCartesian(lat, lon, radius);
      pos.setXYZ(i, x, y, z);
    }
    pos.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
  } catch {
    return null;
  }
}

function CountryBorders({
  borders,
  focusIso3,
  homeIso3,
  hit,
  onSelect,
}: {
  borders: BorderRings;
  focusIso3?: string;
  homeIso3?: string;
  hit: Set<string>;
  onSelect: (iso2: string) => void;
}) {
  const outline = useMemo(() => {
    const positions: number[] = [];
    for (const rings of Object.values(borders)) {
      for (const ring of rings) positions.push(...ringToSpherePositions(ring, 1.003));
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return geometry;
  }, [borders]);

  const highlighted = useMemo(() => {
    const ids = new Set<string>();
    if (focusIso3) ids.add(focusIso3);
    if (homeIso3) ids.add(homeIso3);
    for (const iso3 of hit) ids.add(iso3);
    return [...ids].flatMap((iso3) => {
      const rings = borders[iso3];
      if (!rings) return [];
      const country = REINCARNATION_COUNTRIES.find((row) => row.iso3 === iso3);
      return rings
        .map((ring) => ({ iso3, iso2: country?.iso2, geometry: fillGeometry(ring, 1.006) }))
        .filter((entry) => entry.geometry);
    });
  }, [borders, focusIso3, homeIso3, hit]);

  useEffect(() => {
    return () => {
      outline.dispose();
      for (const entry of highlighted) entry.geometry?.dispose();
    };
  }, [outline, highlighted]);

  return (
    <group>
      <lineSegments geometry={outline}>
        <lineBasicMaterial color="#94a3b8" transparent opacity={0.32} />
      </lineSegments>
      {highlighted.map((entry, index) => {
        const active = entry.iso3 === focusIso3 || hit.has(entry.iso3);
        const isHome = entry.iso3 === homeIso3 && !active;
        return (
          <mesh
            key={`${entry.iso3}-${index}`}
            geometry={entry.geometry!}
            onClick={(event) => {
              event.stopPropagation();
              if (entry.iso2) onSelect(entry.iso2);
            }}
          >
            <meshBasicMaterial
              color={active ? "#34d399" : isHome ? "#fbbf24" : "#94a3b8"}
              transparent
              opacity={active ? 0.48 : 0.28}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function lookQuaternion(lat: number, lon: number, yawDeg: number): THREE.Quaternion {
  const [x, y, z] = latLonToCartesian(lat, lon);
  const face = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(x, y, z).normalize(),
    new THREE.Vector3(0, 0, 1),
  );
  // Twist around the view axis so the country stays centered while the globe spins.
  const twist = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), (yawDeg * Math.PI) / 180);
  return twist.multiply(face);
}

function CountryPin({
  position,
  active,
  isHome,
  label,
}: {
  position: [number, number, number];
  active: boolean;
  isHome: boolean;
  label?: string;
}) {
  const outward = useMemo(() => {
    const dir = new THREE.Vector3(...position).normalize();
    return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  }, [position]);
  const color = active ? "#34d399" : isHome ? "#fbbf24" : "#94a3b8";
  const scale = active ? 1 : isHome ? 0.72 : 0.45;
  return (
    <group position={position} quaternion={outward}>
      <mesh position={[0, active ? 0.05 : 0.02, 0]}>
        <coneGeometry args={[0.018 * scale, 0.055 * scale, 10]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {active ? (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.03, 0.042, 24]} />
          <meshBasicMaterial color="#34d399" side={THREE.DoubleSide} />
        </mesh>
      ) : null}
      {active && label ? (
        <Html center sprite distanceFactor={2.8} style={{ pointerEvents: "none" }}>
          <div className="whitespace-nowrap rounded-full bg-emerald-600/95 px-2 py-0.5 text-[11px] font-bold text-white shadow">
            {label}
          </div>
        </Html>
      ) : null}
    </group>
  );
}

function Earth({
  focus,
  focusLabel,
  homeIso3,
  hit,
  yaw,
  reducedMotion,
  borders,
  onSelect,
}: {
  focus?: ReincarnationCountry;
  focusLabel?: string;
  homeIso3?: string;
  hit: Set<string>;
  yaw: number;
  reducedMotion: boolean;
  borders: BorderRings | null;
  onSelect: (iso2: string) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const target = useMemo(
    () => lookQuaternion(focus?.lat ?? 20, focus?.lon ?? 20, yaw),
    [focus?.iso3, focus?.lat, focus?.lon, yaw],
  );

  useFrame((_, delta) => {
    if (!group.current) return;
    if (reducedMotion) {
      group.current.quaternion.copy(target);
      return;
    }
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
      {borders ? (
        <CountryBorders borders={borders} focusIso3={focus?.iso3} homeIso3={homeIso3} hit={hit} onSelect={onSelect} />
      ) : null}
      {points.map(({ row, position }) => {
        const active = focus?.iso3 === row.iso3;
        const isHit = hit.has(row.iso3);
        const isHome = homeIso3 === row.iso3;
        if (!active && !isHit && !isHome) {
          if (borders?.[row.iso3]) return null;
          return (
            <mesh
              key={row.iso3}
              position={position}
              onClick={(event) => {
                event.stopPropagation();
                onSelect(row.iso2);
              }}
            >
              <sphereGeometry args={[0.008, 6, 6]} />
              <meshBasicMaterial color="#64748b" transparent opacity={0.35} />
            </mesh>
          );
        }
        return (
          <group
            key={row.iso3}
            onClick={(event) => {
              event.stopPropagation();
              onSelect(row.iso2);
            }}
          >
            <CountryPin
              position={position}
              active={active || isHit}
              isHome={isHome && !active}
              label={active ? focusLabel : undefined}
            />
          </group>
        );
      })}
    </group>
  );
}

export default function ReincarnationGlobe({ focusIso3, focusLabel, homeIso3, hitIso3, yaw, onSelect }: Props) {
  const focus = REINCARNATION_COUNTRIES.find((row) => row.iso3 === focusIso3);
  const hit = useMemo(() => new Set(hitIso3), [hitIso3]);
  const reducedMotion = useReducedMotion();
  const borders = useBorderRings();

  return (
    <div>
      <div className="h-80 w-full overflow-hidden rounded-2xl bg-slate-950 sm:h-96">
        <Canvas camera={{ position: [0, 0, 2.6], fov: 40 }} dpr={[1, 1.5]}>
          <color attach="background" args={["#020617"]} />
          <ambientLight intensity={0.55} />
          <directionalLight position={[3, 2, 4]} intensity={1.35} />
          <Earth
            focus={focus}
            focusLabel={focusLabel}
            homeIso3={homeIso3}
            hit={hit}
            yaw={yaw}
            reducedMotion={reducedMotion}
            borders={borders}
            onSelect={onSelect}
          />
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
        {" · "}
        <a
          className="underline decoration-slate-300 underline-offset-2 hover:text-slate-600"
          href="https://www.naturalearthdata.com/"
        >
          Natural Earth
        </a>
        {" 110m borders"}
      </p>
    </div>
  );
}
