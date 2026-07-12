import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import type * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DnaHelix } from "./scenes/DnaHelix";
import { BlackHole } from "./scenes/BlackHole";
import { Galaxy } from "./scenes/Galaxy";

gsap.registerPlugin(ScrollTrigger);

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// Scroll progress (0..1) ranges each scene is visible for. Overlapping
// ranges cross-fade between sections instead of hard-cutting.
const RANGE_HELIX: [number, number] = [0, 0.38];
const RANGE_BLACKHOLE: [number, number] = [0.3, 0.7];
const RANGE_GALAXY: [number, number] = [0.62, 1];

interface CopyBlock {
  start: number;
  end: number;
  eyebrow: string;
  title: string;
  body: string;
}

const COPY: CopyBlock[] = [
  {
    start: 0,
    end: 0.14,
    eyebrow: "ORIGIN",
    title: "당신은 하나의 나선에서 시작되었습니다",
    body: "유전자, 그리고 태어난 순간의 좌표 — 바꿀 수 없는 처음의 배열.",
  },
  {
    start: 0.14,
    end: 0.32,
    eyebrow: "BORN SELF",
    title: "태어난 나",
    body: "사주와 별자리가 기록한, 당신이 선택하지 않은 시작.",
  },
  {
    start: 0.32,
    end: 0.5,
    eyebrow: "PRESENT SELF",
    title: "현재의 나",
    body: "선택이 통과하는 특이점 — 지금 당신이 서 있는 사건의 지평선.",
  },
  {
    start: 0.5,
    end: 0.64,
    eyebrow: "DESTINY",
    title: "운명은 다시 쓰입니다",
    body: "타로와 점성술이 가리키는 건 정해진 결말이 아니라, 갈라지는 가능성들.",
  },
  {
    start: 0.64,
    end: 0.84,
    eyebrow: "FUTURE SELF",
    title: "미래의 나",
    body: "아직 흩어지지 않은, 무수한 가능성의 나선.",
  },
  {
    start: 0.84,
    end: 1,
    eyebrow: "OIYO",
    title: "우리가 당신을 읽는 언어",
    body: "타로, 사주, 점성술, 별자리, 신화, 그리고 우리가 만든 테스트들 — OIYO는 이 모든 언어로 당신을 해석합니다.",
  },
];

function CameraRig({
  progressRef,
  reducedMotion,
}: {
  progressRef: React.MutableRefObject<number>;
  reducedMotion: boolean;
}) {
  const { camera } = useThree();
  useFrame(() => {
    const p = progressRef.current;
    const warp = !reducedMotion && p > 0.4 && p < 0.6 ? 1 - Math.abs(p - 0.5) / 0.1 : 0;
    const targetFov = 50 + warp * 18;
    const cam = camera as THREE.PerspectiveCamera;
    if (Math.abs(cam.fov - targetFov) > 0.05) {
      cam.fov += (targetFov - cam.fov) * 0.08;
      cam.updateProjectionMatrix();
    }
  });
  return null;
}

function Scene({
  progressRef,
  reducedMotion,
  quality,
}: {
  progressRef: React.MutableRefObject<number>;
  reducedMotion: boolean;
  quality: number;
}) {
  return (
    <>
      <color attach="background" args={["#050014"]} />
      <fogExp2 attach="fog" args={["#050014", 0.03]} />
      <ambientLight intensity={0.4} />
      <Stars radius={80} depth={40} count={reducedMotion ? 800 : 2500} factor={2.5} fade speed={reducedMotion ? 0 : 0.5} />
      <CameraRig progressRef={progressRef} reducedMotion={reducedMotion} />
      <DnaHelix progressRef={progressRef} visibleRange={RANGE_HELIX} reducedMotion={reducedMotion} quality={quality} />
      <BlackHole progressRef={progressRef} visibleRange={RANGE_BLACKHOLE} reducedMotion={reducedMotion} quality={quality} />
      <Galaxy progressRef={progressRef} visibleRange={RANGE_GALAXY} reducedMotion={reducedMotion} quality={quality} />
      <EffectComposer multisampling={0}>
        <Bloom
          intensity={0.28}
          luminanceThreshold={0.55}
          luminanceSmoothing={0.25}
          mipmapBlur
          radius={0.4}
        />
        <ChromaticAberration
          offset={[0.0002, 0.0004]}
          blendFunction={BlendFunction.NORMAL}
          radialModulation={false}
          modulationOffset={0}
        />
        <Vignette eskil={false} offset={0.25} darkness={0.75} />
        <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.12} />
      </EffectComposer>
    </>
  );
}

export function CosmicIntroExperience() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const textRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [quality, setQuality] = useState(1);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 768px)");
    setReducedMotion(motionQuery.matches);
    setQuality(mobileQuery.matches ? 0.4 : 1);
  }, []);

  useLayoutEffect(() => {
    if (!wrapperRef.current) return;

    const ctx = gsap.context(() => {
      // Text opacity is a pure function of the same `progress` (0..1) that
      // drives the 3D scene — computed directly in onUpdate rather than via
      // separate per-block ScrollTriggers. A prior version used "{X}% top"
      // sub-triggers, but that syntax is calibrated against the trigger's
      // full height while the master trigger's 0..1 progress is calibrated
      // against (height - viewport height); the two units don't match, so
      // anything scheduled past ~80% became scroll-unreachable (the closing
      // block never appeared). Single source of truth avoids that entirely.
      const FADE = 0.15; // fraction of a block's own [start,end] window spent fading in/out
      const applyProgress = (p: number) => {
        progressRef.current = p;
        COPY.forEach((block, i) => {
          const el = textRefs.current[i];
          if (!el) return;
          const isFirst = i === 0;
          const isLast = i === COPY.length - 1;
          const local = clamp01((p - block.start) / (block.end - block.start));
          const fadeIn = isFirst ? 1 : Math.min(1, local / FADE);
          const fadeOut = isLast ? 1 : local < 1 - FADE ? 1 : (1 - local) / FADE;
          const opacity = p < block.start || p > block.end ? 0 : Math.max(0, Math.min(fadeIn, fadeOut));
          el.style.opacity = String(opacity);
          el.style.transform = `translateY(${(1 - opacity) * 16}px)`;
        });
      };

      const master = ScrollTrigger.create({
        trigger: wrapperRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.4,
        onUpdate: (self) => applyProgress(self.progress),
      });
      applyProgress(master.progress);

      return () => master.kill();
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapperRef} className="relative" style={{ height: "500vh", background: "#050014" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <Canvas camera={{ position: [0, 0, 8], fov: 50 }} dpr={quality < 1 ? [1, 1.25] : [1, 1.5]}>
          <Scene progressRef={progressRef} reducedMotion={reducedMotion} quality={quality} />
        </Canvas>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
          {COPY.map((block, i) => (
            <div
              key={block.title}
              ref={(el) => {
                textRefs.current[i] = el;
              }}
              className="absolute max-w-xl text-center break-keep opacity-0"
            >
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-8 py-7 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:px-10 sm:py-8">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-300/80">
                  {block.eyebrow}
                </p>
                <h2 className="mb-4 text-2xl font-bold tracking-tight text-white sm:text-4xl">
                  {block.title}
                </h2>
                <p className="text-sm leading-relaxed text-violet-100/80 sm:text-lg">{block.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
