// Small helpers shared by the procedural sanctuary scenes (split out 2026-11-13).
import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

let dotTexture: THREE.Texture | null = null;
/** Soft round sprite so points read as glows, not squares. */
export function dot() {
  if (dotTexture) return dotTexture;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.35, 'rgba(255,255,255,.55)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  dotTexture = new THREE.CanvasTexture(c);
  return dotTexture;
}

export const rand = (a: number, b: number) => a + Math.random() * (b - a);

/** Slow breathing drift of the camera around a target. Only mounted in the 3D view, which reduced-motion visitors never get (prefersReducedMotion gate in Sanctuary.tsx). */
export function Drift({ target, radius, height, speed = 0.04, sway = 0.25 }: { target: [number, number, number]; radius: number; height: number; speed?: number; /** Sideways swing as a share of the radius. Keep small when something far away (moon, sun) must stay in a narrow phone frame. */ sway?: number }) {
  const { camera } = useThree();
  const look = useMemo(() => new THREE.Vector3(...target), [target]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed;
    camera.position.set(look.x + Math.sin(t) * radius * sway, height + Math.sin(t * 1.7) * 0.15, look.z + radius * Math.cos(t * 0.6) * 0.1 + radius);
    camera.lookAt(look);
  });
  return null;
}
