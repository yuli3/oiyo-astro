/**
 * Renders a branded test-result card to a canvas and shares/downloads it.
 *
 * 1080×1350 (4:5) — fits Instagram/X/KakaoTalk previews. Family olive/green
 * palette per DESIGN.md. No external deps; system fonts only.
 */

export interface ShareCardPayload {
  /** Small uppercase heading, e.g. "MBTI 성격 테스트" */
  heading: string;
  /** Big result line, e.g. "INFP — 중재자" */
  resultTitle: string;
  emoji?: string;
  symbolSrc?: string;
  visual?:
    | { kind: 'riasec'; scores: Record<'R' | 'I' | 'A' | 'S' | 'E' | 'C', number> }
    | { kind: 'attachment'; anxiety: number; avoidance: number; anxietyLabel: string; avoidanceLabel: string };
  /** Wrapped body text under the title */
  description?: string;
  /** Shown in the footer, e.g. "oiyo.net/ko/mbti/test" */
  url: string;
}

const W = 1080;
const H = 1350;
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif";

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const lines: string[] = [];
  // Korean/CJK has no reliable word boundaries — wrap per character cluster,
  // but prefer space boundaries when present.
  const words = text.split(/(\s+)/);
  let line = '';
  for (const word of words) {
    if (ctx.measureText(line + word).width <= maxWidth) {
      line += word;
      continue;
    }
    if (line.trim()) lines.push(line.trim());
    if (ctx.measureText(word).width <= maxWidth) {
      line = word;
      continue;
    }
    // single overlong token (CJK run) — break per character
    line = '';
    for (const ch of word) {
      if (ctx.measureText(line + ch).width > maxWidth) {
        lines.push(line);
        line = ch;
      } else {
        line += ch;
      }
    }
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`image load failed: ${src}`));
    image.src = src;
  });
}

function drawProfileVisual(ctx: CanvasRenderingContext2D, visual: NonNullable<ShareCardPayload['visual']>, centerY: number) {
  const cx = W / 2;
  if (visual.kind === 'riasec') {
    const types = ['R', 'I', 'A', 'S', 'E', 'C'] as const;
    const point = (index: number, radius: number) => {
      const angle = (Math.PI * 2 * index) / 6 - Math.PI / 2;
      return [cx + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius] as const;
    };
    ctx.strokeStyle = '#c7c9bd';
    ctx.lineWidth = 3;
    for (const radius of [70, 130, 190]) {
      ctx.beginPath();
      types.forEach((_, index) => { const [x, y] = point(index, radius); index ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
      ctx.closePath(); ctx.stroke();
    }
    ctx.beginPath();
    types.forEach((type, index) => { const radius = 35 + Math.max(0, Math.min(100, visual.scores[type])) * 1.55; const [x, y] = point(index, radius); index ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.closePath(); ctx.fillStyle = 'rgba(67,93,49,0.22)'; ctx.fill(); ctx.strokeStyle = '#435d31'; ctx.lineWidth = 7; ctx.stroke();
    ctx.fillStyle = '#35452b'; ctx.font = `800 30px ${FONT}`;
    types.forEach((type, index) => { const [x, y] = point(index, 225); ctx.fillText(`${type} ${Math.round(visual.scores[type])}`, x, y + 10); });
    return;
  }
  const left = cx - 205; const top = centerY - 205; const size = 410;
  ctx.fillStyle = '#f7f7f2'; ctx.fillRect(left, top, size, size);
  ctx.strokeStyle = '#a8a29e'; ctx.lineWidth = 3; ctx.setLineDash([12, 12]);
  ctx.beginPath(); ctx.moveTo(cx, top); ctx.lineTo(cx, top + size); ctx.moveTo(left, centerY); ctx.lineTo(left + size, centerY); ctx.stroke(); ctx.setLineDash([]);
  const x = left + Math.max(0, Math.min(100, visual.avoidance)) * 4.1;
  const y = top + size - Math.max(0, Math.min(100, visual.anxiety)) * 4.1;
  ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI * 2); ctx.fillStyle = '#435d31'; ctx.fill();
  ctx.fillStyle = '#35452b'; ctx.font = `700 26px ${FONT}`;
  ctx.fillText(`${visual.avoidanceLabel} ${Math.round(visual.avoidance)}%`, cx, top + size + 46);
  ctx.save(); ctx.translate(left - 46, centerY); ctx.rotate(-Math.PI / 2); ctx.fillText(`${visual.anxietyLabel} ${Math.round(visual.anxiety)}%`, 0, 0); ctx.restore();
}

export async function renderShareCard(payload: ShareCardPayload): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.reject(new Error('canvas unsupported'));

  // ── Background: warm off-white with soft olive wash ──
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#fbfbf6');
  bg.addColorStop(1, '#eef1e2');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle decorative circles
  ctx.fillStyle = 'rgba(101,163,13,0.07)';
  ctx.beginPath();
  ctx.arc(W * 0.9, H * 0.08, 220, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(W * 0.06, H * 0.92, 260, 0, Math.PI * 2);
  ctx.fill();

  // ── Card frame ──
  const pad = 72;
  ctx.strokeStyle = 'rgba(77,124,15,0.35)';
  ctx.lineWidth = 3;
  ctx.strokeRect(pad, pad, W - pad * 2, H - pad * 2);

  ctx.textAlign = 'center';

  // ── Brand ──
  ctx.fillStyle = '#23241f';
  ctx.font = `900 54px ${FONT}`;
  ctx.fillText('OIYO', W / 2, 200);
  ctx.fillStyle = '#4d7c0f';
  ctx.font = `700 26px ${FONT}`;
  ctx.fillText('· · ·', W / 2, 244);

  // ── Heading ──
  ctx.fillStyle = '#4d7c0f';
  ctx.font = `800 36px ${FONT}`;
  ctx.fillText(payload.heading, W / 2, 330);

  // ── Result visual ──
  let y = 470;
  if (payload.symbolSrc) {
    const image = await loadImage(payload.symbolSrc);
    ctx.drawImage(image, W / 2 - 135, 385, 270, 270);
    y = 735;
  } else if (payload.visual) {
    drawProfileVisual(ctx, payload.visual, 560);
    y = 830;
  } else if (payload.emoji) {
    ctx.font = `160px ${FONT}`;
    ctx.fillText(payload.emoji, W / 2, 560);
    y = 680;
  }

  // ── Result title (wrap if needed) ──
  ctx.fillStyle = '#23241f';
  ctx.font = `900 72px ${FONT}`;
  const titleLines = wrapText(ctx, payload.resultTitle, W - pad * 2 - 60);
  for (const line of titleLines.slice(0, 3)) {
    ctx.fillText(line, W / 2, y);
    y += 90;
  }

  // ── Divider ──
  y += 10;
  ctx.strokeStyle = 'rgba(77,124,15,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 60, y);
  ctx.lineTo(W / 2 + 60, y);
  ctx.stroke();
  y += 70;

  // ── Description ──
  if (payload.description) {
    ctx.fillStyle = '#4a4c42';
    ctx.font = `500 38px ${FONT}`;
    const descLines = wrapText(ctx, payload.description, W - pad * 2 - 100);
    for (const line of descLines.slice(0, 6)) {
      ctx.fillText(line, W / 2, y);
      y += 58;
    }
  }

  // ── Footer URL ──
  ctx.fillStyle = '#4d7c0f';
  ctx.font = `700 34px ${FONT}`;
  ctx.fillText(payload.url, W / 2, H - 130);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
      'image/png',
    );
  });
}

/**
 * Share via the Web Share API when files are supported (mobile),
 * otherwise download the PNG. Returns 'shared' | 'downloaded'.
 */
export async function shareResultImage(
  payload: ShareCardPayload,
  filename = 'oiyo-result.png',
): Promise<'shared' | 'downloaded'> {
  const blob = await renderShareCard(payload);
  const file = new File([blob], filename, { type: 'image/png' });

  if (
    typeof navigator !== 'undefined' &&
    'canShare' in navigator &&
    navigator.canShare?.({ files: [file] })
  ) {
    try {
      await navigator.share({ files: [file], title: payload.resultTitle });
      return 'shared';
    } catch (err) {
      // user cancelled → fall through to download only on real errors
      if ((err as Error)?.name === 'AbortError') return 'shared';
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return 'downloaded';
}
