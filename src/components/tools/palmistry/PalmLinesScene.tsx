"use client";

/**
 * Lazy-loaded three.js scene tracing the four palm lines as glowing 3D
 * tubes, built directly from PALM_LINES' real SVG cubic-bezier paths
 * (src/lib/ontology/palmistry/palm-lines.ts) rather than an abstract
 * layout -- the shapes match the flat illustration above this panel.
 * The selected line lifts toward the viewer and glows; the rest stay
 * flat and dim.
 */

import { Line, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { PalmLineId } from "../../../lib/ontology/palmistry/palm-lines";
import { useReducedMotion } from "@/hooks/useMotion";

const VIEWBOX_W = 300;
const VIEWBOX_H = 375;
const SCALE = 1 / 60;

/** Parses the subset of SVG path commands PALM_LINES actually uses (M, C, absolute). */
function samplePath(d: string, segmentsPerCurve = 24): [number, number][] {
  const tokens = d.match(/[MC][^MC]*/g) ?? [];
  const points: [number, number][] = [];
  let cur: [number, number] = [0, 0];

  for (const token of tokens) {
    const cmd = token[0];
    const nums = token
      .slice(1)
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);

    if (cmd === "M") {
      cur = [nums[0], nums[1]];
      points.push(cur);
    } else if (cmd === "C") {
      const [x1, y1, x2, y2, x, y] = nums;
      const p0 = cur;
      for (let i = 1; i <= segmentsPerCurve; i += 1) {
        const t = i / segmentsPerCurve;
        const mt = 1 - t;
        const px = mt * mt * mt * p0[0] + 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t * t * t * x;
        const py = mt * mt * mt * p0[1] + 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t * t * t * y;
        points.push([px, py]);
      }
      cur = [x, y];
    }
  }
  return points;
}

/** SVG (x, y) with y-down -> centered three.js (x, y) with y-up. */
function toWorld([x, y]: [number, number]): [number, number, number] {
  return [(x - VIEWBOX_W / 2) * SCALE, -(y - VIEWBOX_H / 2) * SCALE, 0];
}

export interface PalmLineDef {
  id: PalmLineId;
  color: string;
  path: string;
}

function TracedLine({ def, isActive, index }: { def: PalmLineDef; isActive: boolean; index: number }) {
  const group = useRef<THREE.Group>(null);
  const points = useMemo(() => samplePath(def.path).map(toWorld), [def.path]);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const targetZ = isActive ? 0.5 + Math.sin(clock.elapsedTime * 2) * 0.04 : 0;
    group.current.position.z += (targetZ - group.current.position.z) * 0.1;
  });

  return (
    <group ref={group} position={[0, 0, index * 0.02]}>
      <Line
        points={points}
        color={def.color}
        lineWidth={isActive ? 5 : 2}
        transparent
        opacity={isActive ? 1 : 0.35}
      />
    </group>
  );
}

function Scene({ lines, active, animate }: { lines: PalmLineDef[]; active: PalmLineId; animate: boolean }) {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (animate && group.current) group.current.rotation.y = Math.sin(Date.now() * 0.0002) * 0.15;
  });

  return (
    <group ref={group}>
      <ambientLight intensity={0.8} />
      {lines.map((line, index) => (
        <TracedLine key={line.id} def={line} isActive={line.id === active} index={index} />
      ))}
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
        rotateSpeed={0.5}
        makeDefault
      />
    </group>
  );
}

export interface PalmLinesSceneProps {
  lines: PalmLineDef[];
  active: PalmLineId;
  /** false when prefers-reduced-motion — renders one static frame. */
  animate?: boolean;
  /** Cap device pixel ratio on small screens. */
  maxDpr?: number;
}

export default function PalmLinesScene({ lines, active, animate: animateProp = true, maxDpr = 2 }: PalmLinesSceneProps) {
  // The CSS motion contract cannot reach inside a canvas — a scene that
  // rotates every frame has to read the preference itself. This also drops
  // the r3f frameloop to "demand", so nothing renders while idle.
  const reducedMotion = useReducedMotion();
  const animate = animateProp && !reducedMotion;
  return (
    <Canvas
      camera={{ position: [0, 0, 6.5], fov: 40 }}
      dpr={[1, maxDpr]}
      gl={{ antialias: true, powerPreference: "low-power" }}
      frameloop={animate ? "always" : "demand"}
      style={{ touchAction: "none" }}
    >
      <color attach="background" args={["#0f0b17"]} />
      <Scene lines={lines} active={active} animate={animate} />
    </Canvas>
  );
}
