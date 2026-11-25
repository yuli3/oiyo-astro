// 공유 카드(1080×1350 PNG): 3D 장면 스냅샷 + 해·달 요약. 브라우저 2D canvas로만 만든다(서버 없음).
import type { BirthSky } from "../../../lib/birth-sky";
import { SCENE } from "./data";

/**
 * Lit part of a moon disc of radius r, with the Sun toward +x.
 * Limb: right half circle. Terminator: half ellipse with x-radius r·|1−2k|,
 * bulging left when more than half is lit (gibbous), right when less (crescent).
 */
export function moonPhasePath(r: number, illumination: number): string {
  const k = Math.min(1, Math.max(0, illumination));
  const rx = Math.max(0.001, r * Math.abs(1 - 2 * k));
  return `M 0 ${-r} A ${r} ${r} 0 0 1 0 ${r} A ${rx} ${r} 0 0 ${k > 0.5 ? 1 : 0} 0 ${-r} Z`;
}

const FONT = "system-ui, -apple-system, 'Apple SD Gothic Neo', 'Noto Sans KR', 'Hiragino Sans', 'PingFang SC', sans-serif";

export async function drawShareCard(input: {
  scene: HTMLCanvasElement | null;
  sky: BirthSky;
  lat: number;
  title: string;
  kicker: string;
  sunLine: string;
  termLine: string;
  moonLine: string;
  moonPosLine: string;
  footer: string;
}): Promise<string> {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.fillStyle = SCENE.cardBg;
  ctx.fillRect(0, 0, W, H);

  // 3D snapshot, cover-fit into the top square
  const art = 1000;
  if (input.scene && input.scene.width > 0) {
    const s = input.scene;
    const scale = Math.max(W / s.width, art / s.height);
    const dw = s.width * scale;
    const dh = s.height * scale;
    try {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, W, art);
      ctx.clip();
      ctx.drawImage(s, (W - dw) / 2, (art - dh) / 2, dw, dh);
      ctx.restore();
    } catch {
      /* tainted or lost context: card without the scene */
    }
  }
  const fade = ctx.createLinearGradient(0, art - 380, 0, art);
  fade.addColorStop(0, "rgba(5,6,15,0)");
  fade.addColorStop(1, SCENE.cardBg);
  ctx.fillStyle = fade;
  ctx.fillRect(0, art - 380, W, 380);
  const topFade = ctx.createLinearGradient(0, 0, 0, 220);
  topFade.addColorStop(0, "rgba(5,6,15,0.85)");
  topFade.addColorStop(1, "rgba(5,6,15,0)");
  ctx.fillStyle = topFade;
  ctx.fillRect(0, 0, W, 220);

  const pad = 72;
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = SCENE.cardAccent;
  ctx.font = `700 40px ${FONT}`;
  ctx.fillText(input.title, pad, 96);
  ctx.fillStyle = SCENE.cardText;
  ctx.font = `800 50px ${FONT}`;
  wrap(ctx, input.kicker, pad, 164, W - pad * 2, 60, 2);

  // moon phase icon
  const r = 64;
  const cx = W - pad - r;
  const cy = 860;
  ctx.save();
  ctx.translate(cx, cy);
  // As seen from the birthplace: waxing is lit on the right in the northern hemisphere, left in the southern.
  const waning = input.sky.moon.elongation > 180;
  if (waning !== input.lat < 0) ctx.scale(-1, 1);
  ctx.fillStyle = SCENE.moonDark;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = SCENE.moonLit;
  ctx.shadowColor = SCENE.moonLit;
  ctx.shadowBlur = 24;
  ctx.fill(new Path2D(moonPhasePath(r, input.sky.moon.illumination)));
  ctx.restore();

  let y = 1010;
  ctx.fillStyle = SCENE.cardText;
  ctx.font = `700 40px ${FONT}`;
  y = wrap(ctx, input.sunLine, pad, y, W - pad * 2, 50, 2) + 16;
  ctx.fillStyle = SCENE.cardMuted;
  ctx.font = `500 32px ${FONT}`;
  y = wrap(ctx, input.termLine, pad, y, W - pad * 2, 42, 2) + 30;
  ctx.fillStyle = SCENE.cardText;
  ctx.font = `700 40px ${FONT}`;
  y = wrap(ctx, input.moonLine, pad, y, W - pad * 2, 50, 2) + 16;
  ctx.fillStyle = SCENE.cardMuted;
  ctx.font = `500 32px ${FONT}`;
  wrap(ctx, input.moonPosLine, pad, y, W - pad * 2, 42, 1);

  ctx.fillStyle = SCENE.cardAccent;
  ctx.font = `700 30px ${FONT}`;
  ctx.textAlign = "right";
  ctx.fillText(input.footer, W - pad, H - 48);
  ctx.textAlign = "left";

  return canvas.toDataURL("image/png");
}

/** Greedy wrap by characters (works for CJK and spaced scripts). Returns the next baseline. */
function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, lh: number, maxLines: number): number {
  const words = /\s/.test(text) ? text.split(/(\s+)/) : [...text];
  let line = "";
  let lines = 0;
  for (let i = 0; i < words.length; i++) {
    const w = words[i]!;
    const next = line + w;
    if (ctx.measureText(next).width > max && line.trim()) {
      ctx.fillText(line.trim(), x, y);
      y += lh;
      lines++;
      line = w.trimStart();
      if (lines >= maxLines - 1) {
        // last line: take the rest, ellipsised if needed
        const rest = (line + words.slice(i + 1).join("")).trim();
        let s = rest;
        while (ctx.measureText(s).width > max && s.length > 1) s = s.slice(0, -2) + "…";
        ctx.fillText(s, x, y);
        return y + lh;
      }
    } else {
      line = next;
    }
  }
  if (line.trim()) {
    ctx.fillText(line.trim(), x, y);
    y += lh;
  }
  return y;
}
