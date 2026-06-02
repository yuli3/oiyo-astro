import { getOrCreateSessionId } from "@/lib/system/supabase";

export interface TestResultData {
  completionTimeSeconds?: number;
  locale: string;
  responses: Record<string, unknown>;
  result: {
    descriptionEn?: string;
    descriptionKo?: string;
    details?: Record<string, unknown>;
    percentageScores?: Record<string, number>;
    score?: number;
    titleEn?: string;
    titleKo?: string;
    type: string;
  };
  sessionId?: string;
  testId?: string; // Supabase UUID or slug fallback
  testSlug?: string;
  userId?: string;
}

interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  success: boolean;
}

type RawResultDetails = null | {
  details?: null | Record<string, unknown>;
  score?: null | number;
};

type RawTestResultRow = {
  completion_time_seconds?: null | number;
  created_at: string;
  id: string;
  locale?: null | string;
  percentage_scores?: null | Record<string, number>;
  personality_tests?: null | UserTestResult["test"];
  raw_answers?: null | Record<string, unknown>;
  result?: RawResultDetails;
  result_description_en?: null | string;
  result_description_ko?: null | string;
  result_title_en?: null | string;
  result_title_ko?: null | string;
  result_type: string;
  score?: null | number;
  session_id?: null | string;
  test?: null | UserTestResult["test"];
  test_id?: null | string;
  test_slug?: null | string;
  user_id?: null | string;
};

const SAVE_ENDPOINT = "/api/personality-tests/save-result";
const RESULTS_ENDPOINT = "/api/personality-tests/results";

export interface UserTestResult {
  completion_time_seconds?: null | number;
  created_at: string;
  id: string;
  locale: string;
  percentage_scores: Record<string, number>;
  raw_answers: Record<string, unknown>;
  result: {
    descriptionEn?: string;
    descriptionKo?: string;
    details?: Record<string, unknown>;
    percentageScores: Record<string, number>;
    score?: number;
    titleEn?: string;
    titleKo?: string;
    type: string;
  };
  session_id?: null | string;
  test?: null | {
    id?: string;
    name_en?: string;
    name_ko?: string;
    question_count?: number;
    short_description_en?: string;
    short_description_ko?: string;
    slug?: string;
  };
  test_id?: null | string;
  test_slug: string;
  user_id?: null | string;
}

export async function getUserTestResults(
  limit: number = 50,
): Promise<UserTestResult[]> {
  const params = new URLSearchParams();
  params.set("limit", String(Math.min(limit, 100)));

  const response = await fetch(`${RESULTS_ENDPOINT}?${params.toString()}`, {
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    method: "GET",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => undefined)) as
      | ApiResponse
      | undefined;
    throw new Error(body?.error ?? "Failed to load test results");
  }

  const payload = (await response.json()) as ApiResponse<RawTestResultRow[]>;
  const rows = payload.data ?? [];

  return rows.map((row) => mapResultRow(row));
}

export async function saveTestResult(testResult: TestResultData) {
  const sessionId = testResult.sessionId ?? getOrCreateSessionId();

  const payload = {
    completionTime: testResult.completionTimeSeconds,
    locale: testResult.locale,
    percentageScores: testResult.result.percentageScores ?? {},
    rawAnswers: testResult.responses,
    resultDescriptionEn: testResult.result.descriptionEn,
    resultDescriptionKo: testResult.result.descriptionKo,
    resultTitleEn: testResult.result.titleEn,
    resultTitleKo: testResult.result.titleKo,
    resultType: testResult.result.type,
    sessionId,
    testId: testResult.testId,
    testSlug: testResult.testSlug,
    userId: testResult.userId ?? null,
  };

  const response = await fetch(SAVE_ENDPOINT, {
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => undefined)) as
      | ApiResponse
      | undefined;
    throw new Error(body?.error ?? "Failed to save test result");
  }

  const result = (await response.json()) as ApiResponse;
  return result.data;
}

function mapResultRow(row: RawTestResultRow): UserTestResult {
  const testMeta = row.personality_tests ?? row.test ?? null;
  const testSlug = testMeta?.slug ?? row.test_slug ?? row.test_id ?? "";

  const rawAnswers = row.raw_answers ?? {};
  const percentageScores = row.percentage_scores ?? {};
  const resultDetails = row.result ?? null;
  const resultScore = resultDetails?.score ?? row.score ?? undefined;
  const resultAdditionalDetails = resultDetails?.details ?? null;
  const hasRawAnswers = Object.keys(rawAnswers).length > 0;
  const detailsPayload =
    resultAdditionalDetails ?? (hasRawAnswers ? rawAnswers : undefined);

  return {
    completion_time_seconds: row.completion_time_seconds ?? null,
    created_at: row.created_at,
    id: row.id,
    locale: row.locale ?? "en",
    percentage_scores: percentageScores,
    raw_answers: rawAnswers,
    result: {
      descriptionEn: row.result_description_en ?? undefined,
      descriptionKo: row.result_description_ko ?? undefined,
      details: detailsPayload,
      percentageScores,
      score: typeof resultScore === "number" ? resultScore : undefined,
      titleEn: row.result_title_en ?? undefined,
      titleKo: row.result_title_ko ?? undefined,
      type: row.result_type,
    },
    session_id: row.session_id ?? null,
    test: testMeta,
    test_id: row.test_id,
    test_slug: testSlug,
    user_id: row.user_id ?? null,
  };
}
