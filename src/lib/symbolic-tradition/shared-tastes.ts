/**
 * 두 사람 보기의 취향 겹쳐 보기 (P13).
 *
 * 2026-09-30 세운 결정: 상대의 검사 결과는 어디에도 저장되지 않으므로, 친구 링크를 만드는
 * 사람이 "결과도 함께 보내기"를 켰을 때만 결과 요약을 링크에 담는다. 서버에 저장하지 않고
 * 기존 암호화 링크에 실린다. 담는 것은 검사 id·검사 이름·결과 라벨뿐이고 문항 응답은 없다.
 *
 * 취향으로 볼 검사만 허용 목록에 둔다. 정치 성향(political-compass)은 kind 가 같은
 * preference 여도 민감해서 빼고, MBTI 는 P12(MBTI 렌즈 보류)에 따라 뺀다.
 */
import type { StoredTestResult } from "@/lib/user/test-results";

export const SHARED_TASTE_TEST_IDS = ["music-taste", "friendship-style", "life-values", "career-values"] as const;
const ALLOWED = new Set<string>(SHARED_TASTE_TEST_IDS);
const MAX_TEXT = 60;

export interface SharedTaste {
  testId: string;
  title: string;
  label: string;
}

export interface TasteRow {
  testId: string;
  title: string;
  a: string | null;
  b: string | null;
}

const clean = (value: string) => value.replace(/\s+/g, " ").trim().slice(0, MAX_TEXT);

/** 이 브라우저에 저장된 결과 중 허용된 취향 검사의 최신 결과만 고른다. */
export function collectMyTastes(results: StoredTestResult[]): SharedTaste[] {
  const latest = new Map<string, StoredTestResult>();
  for (const result of results) {
    if (!ALLOWED.has(result.testId) || !result.resultLabel?.trim()) continue;
    const prev = latest.get(result.testId);
    if (!prev || prev.createdAt < result.createdAt) latest.set(result.testId, result);
  }
  return SHARED_TASTE_TEST_IDS.flatMap((testId) => {
    const hit = latest.get(testId);
    return hit ? [{ testId, title: clean(hit.title || testId), label: clean(hit.resultLabel) }] : [];
  });
}

/** 링크에서 받은 값을 검증한다. 허용 목록 밖·빈 값·중복은 버린다. */
export function parseSharedTastes(value: unknown): SharedTaste[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const out: SharedTaste[] = [];
  for (const item of value.slice(0, SHARED_TASTE_TEST_IDS.length)) {
    if (!item || typeof item !== "object") continue;
    const { testId, title, label } = item as Partial<SharedTaste>;
    if (typeof testId !== "string" || !ALLOWED.has(testId) || seen.has(testId)) continue;
    if (typeof title !== "string" || typeof label !== "string" || !label.trim()) continue;
    seen.add(testId);
    out.push({ testId, title: clean(title) || testId, label: clean(label) });
  }
  return out;
}

/** 두 사람의 취향을 검사별 한 줄로 맞춘다. 한쪽에만 있으면 다른 쪽은 null. */
export function pairTasteRows(a: SharedTaste[] = [], b: SharedTaste[] = []): TasteRow[] {
  const byA = new Map(a.map((t) => [t.testId, t]));
  const byB = new Map(b.map((t) => [t.testId, t]));
  return SHARED_TASTE_TEST_IDS.flatMap((testId) => {
    const ta = byA.get(testId);
    const tb = byB.get(testId);
    if (!ta && !tb) return [];
    return [{ testId, title: (ta ?? tb)!.title, a: ta?.label ?? null, b: tb?.label ?? null }];
  });
}
