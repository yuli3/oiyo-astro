import { useMemo } from "react";

import { useUserHistory } from "./useUserHistory";

export interface UserProgress {
  loading: boolean;
  progress: {
    big5: boolean;
    mbti: boolean;
    saju: boolean;
    tci: boolean;
  };
}

export function useUserProgress(): UserProgress {
  const { history, loading } = useUserHistory();

  const progress = useMemo(() => {
    const completedTypes = new Set(history.map((r) => r.subtype));

    return {
      big5: completedTypes.has("big5"),
      mbti: completedTypes.has("mbti"),
      saju: completedTypes.has("saju"),
      tci: completedTypes.has("tci"),
    };
  }, [history]);

  return { loading, progress };
}
