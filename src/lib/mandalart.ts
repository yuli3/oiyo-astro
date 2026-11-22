/**
 * 만다라트(Mandal-Art) 2027 — 9×9 목표 계획표.
 * 가운데 칸 = 핵심 목표, 그 둘레 8칸 = 세부 목표, 세부 목표마다 실천 8개 → 81칸.
 * 저장은 이 브라우저(localStorage)에만 한다. 2026-11-22 다음 작업 2차 #2.
 */

export type Mandalart = { goal: string; subs: string[]; actions: string[][] };

/** 3×3 블록 위치(0~8)에서 세부 목표 번호. 가운데(4)는 핵심 목표 블록. */
export const BLOCK_TO_SUB: (number | null)[] = [0, 1, 2, 3, null, 4, 5, 6, 7];
export const SUB_TO_BLOCK = [0, 1, 2, 3, 5, 6, 7, 8];
export const MAX_LEN = 40;

export function emptyMandalart(): Mandalart {
  return { goal: '', subs: Array(8).fill(''), actions: Array.from({ length: 8 }, () => Array(8).fill('')) };
}

function clip(v: unknown): string {
  return typeof v === 'string' ? v.slice(0, MAX_LEN) : '';
}

/** 저장본·URL 등 외부 값을 안전한 모양으로 맞춘다. */
export function normalizeMandalart(raw: unknown): Mandalart {
  const m = emptyMandalart();
  if (!raw || typeof raw !== 'object') return m;
  const r = raw as Partial<Record<keyof Mandalart, unknown>>;
  m.goal = clip(r.goal);
  if (Array.isArray(r.subs)) for (let i = 0; i < 8; i++) m.subs[i] = clip(r.subs[i]);
  if (Array.isArray(r.actions)) {
    for (let i = 0; i < 8; i++) {
      const row = r.actions[i];
      if (Array.isArray(row)) for (let j = 0; j < 8; j++) m.actions[i][j] = clip(row[j]);
    }
  }
  return m;
}

/**
 * 81칸 격자(9행×9열)의 글자. 블록 b(0~8)의 칸 c(0~8)는 행 floor(b/3)*3+floor(c/3), 열 (b%3)*3+c%3.
 * 가운데 블록 둘레 8칸과 바깥 블록 가운데 칸은 같은 세부 목표를 보여 준다.
 */
export function cellText(m: Mandalart, block: number, cell: number): string {
  if (block === 4) {
    if (cell === 4) return m.goal;
    return m.subs[BLOCK_TO_SUB[cell]!];
  }
  const sub = BLOCK_TO_SUB[block]!;
  if (cell === 4) return m.subs[sub];
  return m.actions[sub][BLOCK_TO_SUB[cell]!];
}

export function gridRows(m: Mandalart): string[][] {
  const rows = Array.from({ length: 9 }, () => Array<string>(9).fill(''));
  for (let b = 0; b < 9; b++) {
    for (let c = 0; c < 9; c++) {
      rows[Math.floor(b / 3) * 3 + Math.floor(c / 3)][(b % 3) * 3 + (c % 3)] = cellText(m, b, c);
    }
  }
  return rows;
}

/** 채운 칸 수: 핵심 1 + 세부 8 + 실천 64 = 73칸 */
export function filledCount(m: Mandalart): { filled: number; total: number } {
  let filled = m.goal.trim() ? 1 : 0;
  for (const s of m.subs) if (s.trim()) filled++;
  for (const row of m.actions) for (const a of row) if (a.trim()) filled++;
  return { filled, total: 73 };
}

export function isEmptyMandalart(m: Mandalart): boolean {
  return filledCount(m).filled === 0;
}

/** 글자를 maxChars 안팎으로 줄바꿈(공백 우선, 없으면 글자 단위). 캔버스 그리기용. */
export function wrapText(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = '';
  const push = (s: string) => {
    if (s) lines.push(s);
  };
  for (const w of words) {
    if (w.length > maxChars) {
      push(cur);
      cur = '';
      for (let i = 0; i < w.length; i += maxChars) lines.push(w.slice(i, i + maxChars));
      cur = lines.pop() ?? '';
      continue;
    }
    if (!cur) cur = w;
    else if ((cur + ' ' + w).length <= maxChars) cur += ' ' + w;
    else {
      push(cur);
      cur = w;
    }
  }
  push(cur);
  if (lines.length > maxLines) {
    const out = lines.slice(0, maxLines);
    out[maxLines - 1] = out[maxLines - 1].slice(0, Math.max(1, maxChars - 1)) + '…';
    return out;
  }
  return lines;
}
