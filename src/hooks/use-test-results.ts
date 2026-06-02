"use client";

import { useUser } from "@clerk/nextjs";
import { useCallback, useState } from "react";

import {
  getUserTestResults,
  saveTestResult,
} from "@/lib/system/database/results";

export interface TestResult {
  locale: string;
  responses: Record<string, unknown>;
  result: {
    details?: Record<string, unknown>;
    score?: number;
    type: string;
  };
  sessionId?: string;
  testId: string;
  testSlug: string;
  userId?: string;
}

export function useTestResults() {
  const { isSignedIn, user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);

  const saveResult = useCallback(
    async (testResult: TestResult) => {
      setLoading(true);
      setError(null);

      try {
        const userId = isSignedIn ? user?.id : undefined;
        const sessionId = !isSignedIn ? generateSessionId() : undefined;

        const result = await saveTestResult({
          ...testResult,
          sessionId,
          testId: testResult.testId,
          testSlug: testResult.testSlug,
          userId,
        });

        setLoading(false);
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to save test result";
        setError(message);
        setLoading(false);
        throw err;
      }
    },
    [user, isSignedIn],
  );

  const getUserResults = useCallback(async () => {
    if (!isSignedIn || !user?.id) {
      throw new Error("User must be signed in to get results");
    }

    setLoading(true);
    setError(null);

    try {
      const results = await getUserTestResults();
      setLoading(false);
      return results;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to get test results";
      setError(message);
      setLoading(false);
      throw err;
    }
  }, [user, isSignedIn]);

  return {
    error,
    getUserResults,
    isSignedIn,
    loading,
    saveResult,
  };
}

// Generate a simple session ID for anonymous users
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
