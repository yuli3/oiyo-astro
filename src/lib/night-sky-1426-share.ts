// 세종 8년 각 달 초하루의 일진(실록 기사에서 확인, public/data/sillok-1426.json의 shuo와 같다).
export const SHUO_1426 = ["丙申", "乙丑", "乙未", "甲子", "甲午", "癸亥", "壬辰", "壬戌", "辛卯", "辛酉", "庚寅", "庚申"] as const;

export type NightQuery = { month: number; day: number };

const DIM = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
export const dayOfYear = (m: number, d: number) => DIM.slice(0, m - 1).reduce((a, b) => a + b, 0) + d;

export const formatNight = (q: NightQuery) => `m=${q.month}&d=${q.day}`;
export function parseNight(search: string): NightQuery | null {
  const p = new URLSearchParams(search);
  const month = Number(p.get("m"));
  const day = Number(p.get("d"));
  if (!Number.isInteger(month) || !Number.isInteger(day) || month < 1 || month > 12 || day < 1 || day > DIM[month - 1]!) return null;
  return { month, day };
}
