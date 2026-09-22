import type { Texture } from "pixi.js";

import type { PixiModule } from "./usePixiStage";

/**
 * 부드러운 빛 알갱이 텍스처. 가운데가 밝고 가장자리로 사라진다. 흰색으로
 * 만들고 쓰는 쪽에서 tint 로 기운의 색을 입힌다 — 색마다 텍스처를 따로
 * 만들지 않는다.
 */
export function glowTexture(pixi: PixiModule, radius = 32): Texture {
  const size = radius * 2;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,255,255,0.75)");
  g.addColorStop(0.6, "rgba(255,255,255,0.18)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return pixi.Texture.from(canvas);
}

/** 오행 색. 우리 기운·오늘의 우리 화면과 같은 값이다. */
export const ELEMENT_HEX: Record<string, number> = {
  wood: 0x3f7a53,
  fire: 0xb4452f,
  earth: 0x8a6c3d,
  metal: 0x8d96a0,
  water: 0x3f6a94,
};

/** 밤하늘 무대 위에서 읽히도록 조금 밝힌 색. 알갱이·빛에 쓴다. */
export const ELEMENT_GLOW: Record<string, number> = {
  wood: 0x7fd39a,
  fire: 0xff8a66,
  earth: 0xe0b872,
  metal: 0xd5dde6,
  water: 0x8cc0f0,
};
