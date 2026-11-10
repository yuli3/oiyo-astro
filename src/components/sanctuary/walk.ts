// 2026-11-10: shared walking state for the 밤톨 in the temple scene (CHOSEUN: "캐릭이 이동하면 어떨까요").
// Everything here stays on the device: no position is sent anywhere.
import * as THREE from 'three';
import { acceleratedRaycast, MeshBVH } from 'three-mesh-bvh';

export type Spot = 'yard' | 'pagoda' | 'bell' | 'hall';
export const SPOTS: Spot[] = ['yard', 'pagoda', 'bell', 'hall'];

/** Surfaces the 밤톨 can stand on (the scanned courtyards). Registered by HeritageModels once they load. */
const surfaces = new Set<THREE.Object3D>();

/** Give every mesh under `root` a BVH so ground lookups stay cheap, and register it as walkable. */
export function addWalkable(root: THREE.Object3D) {
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || mesh.geometry.boundsTree) return;
    mesh.geometry.boundsTree = new MeshBVH(mesh.geometry);
    mesh.raycast = acceleratedRaycast;
  });
  surfaces.add(root);
  return () => { surfaces.delete(root); };
}

const ray = new THREE.Raycaster();
ray.firstHitOnly = true;
const from = new THREE.Vector3();
const down = new THREE.Vector3(0, -1, 0);

/** Height of whatever is underfoot at (x, z); the open courtyard is y=0. */
export function groundAt(x: number, z: number) {
  if (!surfaces.size) return 0;
  from.set(x, 12, z);
  ray.set(from, down);
  const hit = ray.intersectObjects([...surfaces], true)[0];
  return hit ? Math.max(0, hit.point.y) : 0;
}

/** Where the 밤톨 is now; kept outside React so it survives going into the hall and back. */
export const chestnut = { x: 1.1, z: 3.1, y: 0, heading: 0, moving: false };
