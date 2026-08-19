import { useEffect, useRef } from "react";
import { recordTestResult, type StoredTestResultKind } from "./test-results";

export function useRecordFinishedTest(opts: {
  testId: string;
  title: string;
  finished: boolean;
  resultLabel?: string;
  result?: unknown;
  locale?: string;
  kind?: StoredTestResultKind;
}) {
  const wrote = useRef(false);
  useEffect(() => {
    if (!opts.finished || wrote.current || !opts.testId) return;
    wrote.current = true;
    recordTestResult({
      kind: opts.kind ?? "psychometric",
      testId: opts.testId,
      title: opts.title,
      resultLabel: opts.resultLabel || "done",
      result: opts.result,
      locale: opts.locale,
    });
  }, [opts.finished, opts.testId, opts.title, opts.resultLabel, opts.result, opts.locale, opts.kind]);
}
