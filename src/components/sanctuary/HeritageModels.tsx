// 2026-11-09: photoreal pass for the 산사 (CHOSEUN: "좀 더 photo realistic 한 느낌으로").
// Real heritage buildings scanned by 국가유산청 (KOGL Type 1, attribution shown in the page footer) plus
// Poly Haven CC0 ground and stone textures. Sources and conversion notes: public/models/sanctuary/SOURCES.md.
// Each scan is a diorama: the building on a block of ground with black "skirt" walls down to y=0.
// At load we turn those skirts into granite retaining walls and, for the pagoda, crop the oversized slab.
import { Component, useEffect, useMemo, type ReactNode } from 'react';
import { addWalkable } from './walk';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

const MODELS = '/models/sanctuary/';
const TEX = '/textures/sanctuary/';
/** Scene units per metre: the layout (rituals, camera, lanterns) was authored at half scale. */
export const HERITAGE_SCALE = 0.5;

const withMeshopt = (loader: GLTFLoader) => { loader.setMeshoptDecoder(MeshoptDecoder); };

type PbrSet = { map: THREE.Texture; normalMap: THREE.Texture; aoRoughness: THREE.Texture };

function usePbr(name: string, repeat: number): PbrSet {
  const [map, normalMap, aoRoughness] = useLoader(THREE.TextureLoader, [`${TEX}${name}_diff_1k.webp`, `${TEX}${name}_nor_gl_1k.webp`, `${TEX}${name}_arm_1k.webp`]);
  return useMemo(() => {
    map.colorSpace = THREE.SRGBColorSpace;
    for (const t of [map, normalMap, aoRoughness]) {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(repeat, repeat);
      t.anisotropy = 4;
      t.needsUpdate = true;
    }
    return { map, normalMap, aoRoughness };
  }, [map, normalMap, aoRoughness, repeat]);
}

function pbrMaterial(set: PbrSet, tint: THREE.ColorRepresentation, normalScale = 1) {
  // ARM packs AO in R, roughness in G, metalness in B; we read roughness from it and skip metalness.
  return new THREE.MeshStandardMaterial({
    map: set.map, normalMap: set.normalMap, normalScale: new THREE.Vector2(normalScale, normalScale),
    roughnessMap: set.aoRoughness, aoMap: set.aoRoughness, aoMapIntensity: 0.8, roughness: 1, metalness: 0, color: tint,
  });
}

type PrepOptions = { crop?: number; minY?: number; wall: THREE.Material | null; tint: THREE.ColorRepresentation };

/**
 * Split each scanned mesh into the photo-textured surface and its boundary skirt.
 * Skirt triangles (vertical, on the bounding box sides) become a separate granite wall mesh with
 * world-space UVs; the bottom face and anything beyond `crop` metres from the centre is dropped.
 */
function prepareDiorama(src: THREE.Object3D, { crop, minY, wall, tint }: PrepOptions) {
  const root = new THREE.Group();
  src.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(src);
  const eps = 0.15;
  const onSide = (v: THREE.Vector3) => Math.abs(v.x - box.min.x) < eps || Math.abs(v.x - box.max.x) < eps || Math.abs(v.z - box.min.z) < eps || Math.abs(v.z - box.max.z) < eps;
  const wallPos: number[] = [];
  const wallUv: number[] = [];
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), n = new THREE.Vector3(), e1 = new THREE.Vector3(), e2 = new THREE.Vector3();
  src.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const geo = mesh.geometry;
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const index = geo.index ? Array.from(geo.index.array) : Array.from({ length: pos.count }, (_, i) => i);
    const world = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) { a.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld); world[i * 3] = a.x; world[i * 3 + 1] = a.y; world[i * 3 + 2] = a.z; }
    const keep: number[] = [];
    for (let t = 0; t < index.length; t += 3) {
      const i0 = index[t]!, i1 = index[t + 1]!, i2 = index[t + 2]!;
      a.fromArray(world, i0 * 3); b.fromArray(world, i1 * 3); c.fromArray(world, i2 * 3);
      n.crossVectors(e1.subVectors(b, a), e2.subVectors(c, a)).normalize();
      if (n.y < -0.5 && a.y < 0.05 && b.y < 0.05 && c.y < 0.05) continue; // bottom of the block
      if (Math.abs(n.y) < 0.35 && onSide(a) && onSide(b) && onSide(c)) {
        for (const v of [a, b, c]) {
          wallPos.push(v.x, v.y, v.z);
          // Wrap the stone texture around the block: run along whichever side the vertex is on.
          const along = Math.abs(n.x) > Math.abs(n.z) ? v.z : v.x;
          wallUv.push(along / 2, v.y / 2);
        }
        continue;
      }
      if (minY !== undefined && Math.min(a.y, b.y, c.y) < minY) continue;
      if (crop !== undefined) {
        const cx = (a.x + b.x + c.x) / 3, cz = (a.z + b.z + c.z) / 3;
        if (cx * cx + cz * cz > crop * crop) continue;
      }
      keep.push(i0, i1, i2);
    }
    // Compact to the vertices still in use so bounds (and memory) reflect what is drawn.
    const remap = new Int32Array(pos.count).fill(-1);
    const uvSrc = geo.attributes.uv as THREE.BufferAttribute | undefined;
    const outPos: number[] = [], outUv: number[] = [], outIdx: number[] = [];
    for (const i of keep) {
      if (remap[i] < 0) {
        remap[i] = outPos.length / 3;
        outPos.push(world[i * 3], world[i * 3 + 1], world[i * 3 + 2]);
        if (uvSrc) outUv.push(uvSrc.getX(i), uvSrc.getY(i));
      }
      outIdx.push(remap[i]);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(outPos, 3));
    if (uvSrc) g.setAttribute('uv', new THREE.Float32BufferAttribute(outUv, 2));
    g.setIndex(outIdx);
    g.computeVertexNormals();
    const old = mesh.material as THREE.MeshStandardMaterial;
    const mat = new THREE.MeshStandardMaterial({ map: old.map, roughness: 0.92, metalness: 0, color: tint });
    if (mat.map) mat.map.anisotropy = 4;
    const out = new THREE.Mesh(g, mat);
    out.receiveShadow = true;
    out.castShadow = true;
    root.add(out);
  });
  if (wall && wallPos.length) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(wallPos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(wallUv, 2));
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, wall);
    m.receiveShadow = true;
    root.add(m);
  }
  return root;
}

function useDiorama(file: string, opts: Omit<PrepOptions, 'wall'>, wall: THREE.Material | null) {
  const gltf = useLoader(GLTFLoader, `${MODELS}${file}`, withMeshopt);
  const { crop, minY, tint } = opts;
  return useMemo(() => prepareDiorama(gltf.scene, { crop, minY, tint, wall }), [gltf, crop, minY, tint, wall]);
}

/**
 * The tiled roof of the scanned stele pavilion, cut above its walls, re-centred and sized to cap the
 * bell pavilion's four posts. Shares the pavilion download with the background building.
 */
export function ScannedBellRoof({ width }: { width: number }) {
  const roof = useDiorama('pavilion.glb', { tint: TINT, minY: 4.35 }, null);
  const fit = useMemo(() => {
    const box = new THREE.Box3().setFromObject(roof);
    const size = box.getSize(new THREE.Vector3());
    const k = width / Math.max(size.x, size.z);
    // Scans only captured the roof from above: draw both faces so it reads from under the eaves too.
    roof.traverse((o) => { const m = (o as THREE.Mesh).material as THREE.Material | undefined; if (m) m.side = THREE.DoubleSide; });
    return { k, offset: [-(box.min.x + box.max.x) / 2 * k, -box.min.y * k, -(box.min.z + box.max.z) / 2 * k] as [number, number, number] };
  }, [roof, width]);
  return <primitive object={roof} position={fit.offset} scale={fit.k} />;
}

/** Placement of each scan: position in scene units, raw-metre height of its courtyard (sunk to y=0), yaw. */
export const HERITAGE_LAYOUT = {
  hall: { pos: [-0.25, 0, -0.75] as const, floor: 1.95, yaw: 0 },
  pagoda: { pos: [-6.3, 0, -0.2] as const, floor: 0.12, yaw: 0.35, crop: 5.0, scale: 0.42 },
  pavilion: { pos: [8.6, 0, -3.6] as const, floor: 2.3, yaw: -0.55 },
};

/** Night tint applied on top of the daylight photo textures (scans were captured in sun). */
const TINT = '#c9d2e6';
const GROUND_TINT = '#8d93a0';

export default function HeritageTemple() {
  const granite = usePbr('granite_tile_04', 1);
  const sandMap = useLoader(THREE.TextureLoader, `${TEX}gravelly_sand_diff_1k.webp`);
  const wall = useMemo(() => pbrMaterial(granite, TINT, 0.8), [granite]);
  const ground = useMemo(() => {
    // Albedo only: at night the courtyard is mostly in shade, so its normal/ARM maps weren't worth the download.
    sandMap.colorSpace = THREE.SRGBColorSpace;
    sandMap.wrapS = sandMap.wrapT = THREE.RepeatWrapping;
    sandMap.repeat.set(34, 34);
    sandMap.anisotropy = 4;
    sandMap.needsUpdate = true;
    return new THREE.MeshStandardMaterial({ map: sandMap, color: GROUND_TINT, roughness: 1, metalness: 0 });
  }, [sandMap]);
  const hall = useDiorama('hall.glb', { tint: TINT }, wall);
  const pagoda = useDiorama('pagoda.glb', { tint: TINT, crop: HERITAGE_LAYOUT.pagoda.crop }, wall);
  const pavilion = useDiorama('pavilion.glb', { tint: TINT }, wall);
  // The 밤톨 walks on the scanned courtyards (hall terrace, pagoda yard); the flat ground is y=0.
  useEffect(() => { const a = addWalkable(hall), b = addWalkable(pagoda); return () => { a(); b(); }; }, [hall, pagoda]);
  const s = HERITAGE_SCALE;
  const place = (k: keyof typeof HERITAGE_LAYOUT) => {
    const l = HERITAGE_LAYOUT[k];
    // The pagoda is drawn a little under true scale so it doesn't tower over the hall in a tight frame.
    const k2 = 'scale' in l ? l.scale : s;
    return { position: [l.pos[0], l.pos[1] - l.floor * k2, l.pos[2]] as [number, number, number], rotation: [0, l.yaw, 0] as [number, number, number], scale: k2 };
  };
  return <>
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, 0]} material={ground} receiveShadow><planeGeometry args={[140, 140]} /></mesh>
    <primitive object={hall} {...place('hall')} />
    <primitive object={pagoda} {...place('pagoda')} />
    <primitive object={pavilion} {...place('pavilion')} />
  </>;
}

/** If a scan or texture fails to download, keep the hand-built scene instead of breaking the page. */
export class HeritageBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
