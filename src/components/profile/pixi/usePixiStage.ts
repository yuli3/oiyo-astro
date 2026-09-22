"use client";

/**
 * 우리의 지도 그림(A1~A6)이 함께 쓰는 PixiJS 무대.
 *
 * - **지연 로드.** pixi.js 는 무겁다. 무대가 화면에 들어올 때 처음 import 한다.
 *   초기 페이로드에 넣지 않는다.
 * - **감축 선호.** 움직임을 줄여 달라면 한 장면만 그리고 멈춘다. 그림이 싣는
 *   정보(막힌 자리, 누가 부푸나)는 정지 장면에도 남도록 각 그림이 짠다.
 * - **화면 밖이면 멈춘다.** 스크롤로 벗어난 무대는 프레임을 돌리지 않는다.
 *
 * draw 는 매 프레임 (무대, 초) 를 받는다. 장면은 draw 가 스스로 만들고 지운다.
 */
import { useEffect, useRef, type RefObject } from "react";

import { useReducedMotion } from "@/hooks/useMotion";

import type { Application } from "pixi.js";

export type PixiModule = typeof import("pixi.js");

export interface PixiScene {
  /** 첫 프레임 전에 한 번. 장면 객체를 만들어 돌려준다. */
  setup: (app: Application, pixi: PixiModule) => void;
  /** 매 프레임. t 는 시작 후 초, size 는 CSS 픽셀 한 변 */
  frame: (t: number, size: { width: number; height: number }) => void;
}

/** 감축 선호일 때 그리는 정지 장면의 시각. 흐름이 한 바퀴 돌아 자리 잡은 뒤다. */
const STILL_AT = 6;

export function usePixiStage(host: RefObject<HTMLDivElement | null>, scene: () => PixiScene, deps: unknown[]): void {
  const reduce = useReducedMotion();
  const sceneRef = useRef(scene);
  sceneRef.current = scene;

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let app: Application | null = null;
    let disposed = false;
    let visible = false;
    let started = 0;
    let current: PixiScene | null = null;

    const size = () => ({ width: el.clientWidth, height: el.clientHeight });
    const tick = () => {
      if (!app || !current) return;
      current.frame((performance.now() - started) / 1000, size());
    };

    const boot = async () => {
      const pixi = await import("pixi.js");
      if (disposed) return;
      const instance = new pixi.Application();
      await instance.init({
        resizeTo: el,
        backgroundAlpha: 0,
        antialias: true,
        autoDensity: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
      });
      if (disposed) {
        instance.destroy(true, { children: true });
        return;
      }
      app = instance;
      instance.canvas.setAttribute("aria-hidden", "true");
      instance.canvas.style.display = "block";
      el.appendChild(instance.canvas);
      current = sceneRef.current();
      current.setup(instance, pixi);
      started = performance.now();
      if (reduce) {
        instance.ticker.stop();
        current.frame(STILL_AT, size());
        instance.render();
      } else {
        instance.ticker.add(tick);
        if (!visible) instance.ticker.stop();
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !app && !disposed) void boot();
      if (app && !reduce) {
        if (visible) app.ticker.start();
        else app.ticker.stop();
      }
    }, { rootMargin: "120px" });
    observer.observe(el);

    return () => {
      disposed = true;
      observer.disconnect();
      if (app) {
        app.destroy(true, { children: true });
        app = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, ...deps]);
}
