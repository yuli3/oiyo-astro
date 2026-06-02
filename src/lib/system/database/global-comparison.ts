import type { GlobalAverageData } from "@/lib/ontology/global-comparison/types";
import type {
  ApiResponse,
  TestResultAggregateRow,
  TestResultOverviewStatsRow,
} from "@/types/database";

import { handleDatabaseError, supabase } from "@/lib/system/supabase";

const VALID_REGIONS: Set<GlobalAverageData["region"]> = new Set([
  "africa",
  "asia",
  "europe",
  "global",
  "north_america",
  "oceania",
  "south_america",
]);

interface GetTestAggregatesParams {
  personalityType?: string;
  testSlug: string;
}

export async function getGlobalOverviewStats(): Promise<
  ApiResponse<TestResultOverviewStatsRow>
> {
  try {
    const { data, error } = await (supabase as any)
      .from("test_result_overview_stats")
      .select("*")
      .single();

    if (error) {
      return { error: handleDatabaseError(error) };
    }

    return { data: data ?? undefined };
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}

export async function getTestAggregates(
  params: GetTestAggregatesParams,
): Promise<ApiResponse<GlobalAverageData[]>> {
  try {
    let query = (supabase as any)
      .from("test_result_aggregates")
      .select("*")
      .eq("test_slug", params.testSlug);

    if (params.personalityType) {
      query = query.eq("result_type", params.personalityType);
    }

    const { data, error } = await query;

    if (error) {
      return { error: handleDatabaseError(error) };
    }

    const aggregates = (data ?? [])
      .map(mapAggregateRow)
      .filter(
        (row: GlobalAverageData | null): row is GlobalAverageData =>
          row !== null,
      );

    return { data: aggregates };
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}

function mapAggregateRow(
  row: TestResultAggregateRow,
): GlobalAverageData | null {
  if (!row.test_slug || !row.result_type || !row.region) {
    return null;
  }

  const averageScore = toNumber(row.average_score);
  const stdDeviation = toNumber(row.standard_deviation);

  if (averageScore === null || stdDeviation === null) {
    return null;
  }

  return {
    averageScore,
    lastUpdated: row.last_updated ?? new Date().toISOString(),
    percentileRanges: {
      p10: toNumber(row.percentile_10) ?? averageScore,
      p25: toNumber(row.percentile_25) ?? averageScore,
      p50: toNumber(row.percentile_50) ?? averageScore,
      p75: toNumber(row.percentile_75) ?? averageScore,
      p90: toNumber(row.percentile_90) ?? averageScore,
    },
    personalityType: row.result_type,
    region: normalizeRegion(row.region),
    sampleSize: row.sample_size ?? 0,
    standardDeviation: stdDeviation,
    testType: row.test_slug,
  };
}

function normalizeRegion(region: null | string): GlobalAverageData["region"] {
  if (region && VALID_REGIONS.has(region as GlobalAverageData["region"])) {
    return region as GlobalAverageData["region"];
  }

  return "global";
}

function toNumber(value: null | string): null | number {
  if (value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
