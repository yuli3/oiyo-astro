// 나의 한 해 결산 카드 — 이 브라우저에 남은 검사 결과만 읽는다(서버 전송 없음).
// 2026-11-03 세운 결재(company-brain think-tank/2026-11-03-oiyo-series-more-content.md 3번).
//
// 같은 검사를 여러 번 했으면 가장 최근 것 하나만 쓴다. 결산은 "올해 나를
// 설명한 조각들"이지 기록 전체가 아니다.
import type { StoredTestResult } from './user/test-results';

export interface RecapItem {
  testId: string;
  title: string;
  resultLabel: string;
  sourcePath?: string;
  createdAt: string;
}

export interface YearRecap {
  year: number;
  /** 올해 끝낸 검사 횟수(같은 검사 반복 포함). */
  totalRuns: number;
  /** 서로 다른 검사 수. */
  distinctTests: number;
  /** 검사마다 가장 최근 결과, 최근 순. */
  items: RecapItem[];
}

/** 일부 검사는 제목 자리에 컴포넌트 이름(LoveLanguageTest)을 남긴다. 그건 보여 주지 않는다. */
function displayTitle(title: string): string {
  return /^[A-Z][A-Za-z0-9]+$/.test(title) ? '' : title;
}

export function buildYearRecap(results: StoredTestResult[], year: number, limit = 6): YearRecap {
  const inYear = results
    .filter((r) => typeof r.createdAt === 'string' && r.createdAt.startsWith(`${year}-`) && r.testId && r.resultLabel)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const seen = new Set<string>();
  const latest: RecapItem[] = [];
  for (const r of inYear) {
    // useRecordFinishedTest 의 기본값 'done' 은 "끝냈다"만 남긴 기록이라 카드에 쓸 결과가 없다.
    if (seen.has(r.testId) || r.resultLabel === 'done') continue;
    seen.add(r.testId);
    latest.push({ testId: r.testId, title: displayTitle(r.title), resultLabel: r.resultLabel, sourcePath: r.sourcePath, createdAt: r.createdAt });
  }
  return { year, totalRuns: inYear.length, distinctTests: latest.length, items: latest.slice(0, limit) };
}

/**
 * 다음 해 키워드 인덱스. 결과 라벨에서 정해지므로 같은 결과면 같은 키워드다
 * (새로고침마다 바뀌면 운세처럼 읽힌다). 예측이 아니라 카드의 마무리 문장이다.
 */
export function recapKeywordIndex(items: RecapItem[], size: number): number {
  const seed = items.map((i) => `${i.testId}:${i.resultLabel}`).sort().join('|');
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % size;
}
