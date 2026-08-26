import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Line, OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { latLonToCartesian } from '../../lib/reincarnation';
import type { City } from '../../lib/ontology/natal/signs';
import type { CartoBody, CartoMeridian, CartoHorizon, GeoPoint } from '../../lib/ontology/natal/astrocartography';

const EARTH_MAP = '/textures/earth-blue-marble.jpg';
const R = 1.001;

function BareEarth() {
  return (
    <mesh>
      <sphereGeometry args={[1, 48, 48]} />
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

function meridianPoints(lon: number): [number, number, number][] {
  const pts: [number, number, number][] = [];
  for (let lat = -89; lat <= 89; lat += 2) pts.push(latLonToCartesian(lat, lon, R));
  return pts;
}

function toPoints(pts: GeoPoint[]): [number, number, number][] {
  return pts.map((p) => latLonToCartesian(p.lat, p.lon, R));
}

function BodyLines({ meridian, horizon, color }: { meridian: CartoMeridian; horizon?: CartoHorizon; color: string }) {
  const mcPts = useMemo(() => meridianPoints(meridian.mcLon), [meridian.mcLon]);
  const icPts = useMemo(() => meridianPoints(meridian.icLon), [meridian.icLon]);
  const ascPts = useMemo(() => (horizon ? toPoints(horizon.asc) : []), [horizon]);
  const dscPts = useMemo(() => (horizon ? toPoints(horizon.dsc) : []), [horizon]);

  return (
    <>
      <Line points={mcPts} color={color} lineWidth={2.2} />
      <Line points={icPts} color={color} lineWidth={1.4} dashed dashSize={0.03} gapSize={0.02} transparent opacity={0.7} />
      {ascPts.length >= 2 && <Line points={ascPts} color={color} lineWidth={1.6} />}
      {dscPts.length >= 2 && (
        <Line points={dscPts} color={color} lineWidth={1.2} dashed dashSize={0.02} gapSize={0.015} transparent opacity={0.75} />
      )}
    </>
  );
}

export default function AstroCartoGlobe({
  lines,
  curves,
  city,
  colors,
}: {
  lines: CartoMeridian[];
  curves: CartoHorizon[];
  city: City;
  colors: Record<CartoBody, string>;
}) {
  const cityPos = useMemo(() => latLonToCartesian(city.lat, city.lon, 1.02), [city.lat, city.lon]);

  return (
    <div className="h-80 w-full cursor-grab touch-none overflow-hidden rounded-2xl bg-slate-950 active:cursor-grabbing sm:h-96">
      <Canvas camera={{ position: [0, 0, 2.6], fov: 40 }} dpr={[1, 1.5]}>
        <color attach="background" args={['#020617']} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 2, 4]} intensity={1.3} />
        <Suspense fallback={<BareEarth />}>
          <TexturedEarth />
        </Suspense>
        {lines.map((l) => (
          <BodyLines key={l.body} meridian={l} horizon={curves.find((c) => c.body === l.body)} color={colors[l.body]} />
        ))}
        <mesh position={cityPos}>
          <sphereGeometry args={[0.02, 12, 12]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
        <OrbitControls enablePan={false} enableZoom enableDamping rotateSpeed={0.5} minDistance={1.4} maxDistance={4} />
      </Canvas>
    </div>
  );
}
