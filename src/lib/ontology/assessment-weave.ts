import type { OntologySignal } from "@/assessments";

/**
 * 나의 지도 M4 (2026-09-28): 따로 보여 주던 검사 좌표를 한 문단으로 엮는다.
 *
 * 점수는 합치지 않는다 — "검사로 본 나"가 각 층을 따로 보여 주는 원칙을 그대로 둔다.
 * 여기서 하는 일은 서로 다른 층(성격·흥미·가치)이 같은 방향을 가리킬 때 그 사실과
 * 근거 좌표를 모아 말하는 것뿐이다.
 *
 * Big Five와 MBTI는 같은 성향을 두 번 재는 사이라(E↔E, N↔O, J↔C, F↔A) 둘을 한
 * 층으로 센다. 둘이 따로 맞았다고 "두 검사가 모였다"고 말하면 같은 증거를 두 번
 * 세는 셈이다 — 우리 원 렌즈의 겹침 검사(pair-reading A6)와 같은 이유다.
 */

export type WeaveTheme = "drive" | "connection" | "curiosity" | "structure";
export type WeaveLayer = "personality" | "interest" | "values";

export type WeaveEvidence =
  | { layer: "personality"; source: "big5"; dimension: "O" | "C" | "E" | "A"; value: number }
  | { layer: "personality"; source: "mbti"; pole: "E" | "N" | "F" | "J"; value: number }
  | { layer: "interest"; source: "riasec"; code: "R" | "I" | "A" | "S" | "E" | "C"; value: number }
  | { layer: "values"; source: "careerValues"; value: CareerValue; score: number };

export type CareerValue = "security" | "achievement" | "autonomy" | "service" | "creativity" | "status";

export interface WeaveReading {
  theme: WeaveTheme;
  layers: WeaveLayer[];
  evidence: WeaveEvidence[];
}

const THEMES: WeaveTheme[] = ["drive", "connection", "curiosity", "structure"];
const LAYERS: WeaveLayer[] = ["personality", "interest", "values"];

// 높다고 말할 기준. Big Five는 중간(50)에서 한 단계 벗어난 65, MBTI는 요약 카드가
// "경계"로 표시하는 37.5–62.5 밖, RIASEC·직업가치는 가장 높은 항목이 55/60을 넘을 때만.
const BIG5_HIGH = 65;
const MBTI_CLEAR = 62.5;
const RIASEC_TOP_MIN = 55;
const VALUE_TOP_MIN = 60;

const BIG5_THEME: Record<"O" | "C" | "E" | "A", WeaveTheme> = { E: "drive", A: "connection", O: "curiosity", C: "structure" };
// MBTI 신호 값은 축의 첫 극(E·S·T·J) 쪽 비율이다.
const MBTI_THEME: { axis: "EI" | "SN" | "TF" | "JP"; pole: "E" | "N" | "F" | "J"; firstPole: boolean; theme: WeaveTheme }[] = [
  { axis: "EI", pole: "E", firstPole: true, theme: "drive" },
  { axis: "TF", pole: "F", firstPole: false, theme: "connection" },
  { axis: "SN", pole: "N", firstPole: false, theme: "curiosity" },
  { axis: "JP", pole: "J", firstPole: true, theme: "structure" },
];
const RIASEC_THEME: Partial<Record<"R" | "I" | "A" | "S" | "E" | "C", WeaveTheme>> = { E: "drive", S: "connection", I: "curiosity", A: "curiosity", C: "structure" };
const VALUE_THEME: Record<CareerValue, WeaveTheme> = {
  achievement: "drive", status: "drive", service: "connection", creativity: "curiosity", autonomy: "curiosity", security: "structure",
};

function num(signals: readonly OntologySignal[], id: string): number | undefined {
  const signal = signals.find((row) => row.constructId === id);
  return typeof signal?.value === "number" ? Math.max(0, Math.min(100, signal.value)) : undefined;
}

function top<K extends string>(signals: readonly OntologySignal[], prefix: string, keys: readonly K[]): { key: K; value: number } | null {
  const rows = keys.map((key) => ({ key, value: num(signals, `${prefix}${key}`) }));
  if (rows.some((row) => row.value === undefined)) return null; // 검사를 끝까지 하지 않았으면 쓰지 않는다
  const sorted = (rows as { key: K; value: number }[]).sort((a, b) => b.value - a.value || keys.indexOf(a.key) - keys.indexOf(b.key));
  // 1위가 2위와 같으면 한쪽을 골라 말할 근거가 없다.
  return sorted[0].value > sorted[1].value ? sorted[0] : null;
}

export function weaveAssessmentSignals(signals: readonly OntologySignal[]): WeaveReading[] {
  const byTheme = new Map<WeaveTheme, WeaveEvidence[]>(THEMES.map((theme) => [theme, []]));

  for (const dimension of ["O", "C", "E", "A"] as const) {
    const value = num(signals, `psychology.big5.${dimension}`);
    if (value !== undefined && value >= BIG5_HIGH) byTheme.get(BIG5_THEME[dimension])!.push({ layer: "personality", source: "big5", dimension, value });
  }
  for (const rule of MBTI_THEME) {
    const raw = num(signals, `personality.mbti.preference.${rule.axis}`);
    if (raw === undefined) continue;
    const toward = rule.firstPole ? raw : 100 - raw;
    if (toward >= MBTI_CLEAR) byTheme.get(rule.theme)!.push({ layer: "personality", source: "mbti", pole: rule.pole, value: toward });
  }
  const riasec = top(signals, "vocation.riasec.", ["R", "I", "A", "S", "E", "C"] as const);
  if (riasec && riasec.value >= RIASEC_TOP_MIN && RIASEC_THEME[riasec.key]) {
    byTheme.get(RIASEC_THEME[riasec.key]!)!.push({ layer: "interest", source: "riasec", code: riasec.key, value: riasec.value });
  }
  // 직업가치 검사는 1순위 묶음(동점이면 여럿)만 신호로 남긴다. 묶음이 모두 같은 방향일 때만 쓴다.
  const valueRows = (Object.keys(VALUE_THEME) as CareerValue[])
    .map((key) => ({ key, value: num(signals, `values.work.${key}`) }))
    .filter((row): row is { key: CareerValue; value: number } => row.value !== undefined);
  const best = Math.max(-1, ...valueRows.map((row) => row.value));
  const leaders = valueRows.filter((row) => row.value === best);
  if (best >= VALUE_TOP_MIN && leaders.length > 0 && leaders.every((row) => VALUE_THEME[row.key] === VALUE_THEME[leaders[0].key])) {
    byTheme.get(VALUE_THEME[leaders[0].key])!.push({ layer: "values", source: "careerValues", value: leaders[0].key, score: best });
  }

  const readings: WeaveReading[] = [];
  for (const theme of THEMES) {
    const evidence = byTheme.get(theme)!;
    const layers = LAYERS.filter((layer) => evidence.some((row) => row.layer === layer));
    // 한 층만 가리키면 이미 그 검사 카드가 말하고 있다. 층이 둘 이상 겹칠 때만 엮는다.
    if (layers.length >= 2) readings.push({ theme, layers, evidence });
  }
  return readings.sort((a, b) => b.layers.length - a.layers.length || THEMES.indexOf(a.theme) - THEMES.indexOf(b.theme));
}
