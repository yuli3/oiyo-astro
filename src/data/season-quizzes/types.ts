// 시즌 유형 테스트 공통 형식 (2026-11-22). 연말·새해 검색 수요를 겨냥한 재미용 테스트 묶음.
// 테스트마다 데이터 파일 하나, 화면은 components/tests/SeasonTypeQuiz.tsx 하나를 같이 쓴다.
// 결과 = 가장 많이 고른 유형, 동점이면 가장 최근 답(크리스마스 테스트와 같은 규칙).
export type QuizLang = "ko" | "en" | "ja" | "zh" | "fr" | "es";
export const QUIZ_LANGS: QuizLang[] = ["ko", "en", "ja", "zh", "fr", "es"];

export interface QuizQuestion<T extends string> { text: string; options: [string, T][] }
export interface QuizResult<T extends string> { emoji: string; title: string; tagline: string; description: string; tip: string; match: T }
export interface QuizUi { title: string; subtitle: string; note: string; your: string; tip: string; match: string }
export interface QuizPage { title: string; description: string; intro: string; typesTitle: string; faqs: [string, string][] }

export interface SeasonQuiz<T extends string = string> {
  /** analytics test_id 이자 URL slug. */
  id: string;
  slug: string;
  types: T[];
  ui: Record<QuizLang, QuizUi>;
  questions: Record<QuizLang, QuizQuestion<T>[]>;
  results: Record<T, Record<QuizLang, QuizResult<T>>>;
  page: Record<QuizLang, QuizPage>;
}

/** 가장 많이 고른 유형. 동점이면 마지막 문항에 가까운 답이 이긴다(최근 선택 우선). */
export function majorityType<T extends string>(votes: T[]): T {
  const counts = new Map<T, number>();
  votes.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1));
  const max = Math.max(...counts.values());
  for (let i = votes.length - 1; i >= 0; i--) if (counts.get(votes[i]) === max) return votes[i];
  return votes[votes.length - 1];
}

export function toLang(locale: string): QuizLang {
  return (QUIZ_LANGS as string[]).includes(locale) ? (locale as QuizLang) : "en";
}
