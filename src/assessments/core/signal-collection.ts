import { listAssessmentResults } from "./persistence";
import type { AssessmentPlugin } from "./plugin";
import { getAssessmentPlugin } from "./registry";
import type { CanonicalAssessmentResult } from "./result";
import type { OntologySignal } from "./ontology";

export type AssessmentPluginLookup = (id: string) => AssessmentPlugin | undefined;

/**
 * Convert the newest result for each assessment into ontology signals.
 *
 * Result history remains available for trend views, while the current ontology
 * avoids treating repeated completions of the same instrument as independent
 * evidence. Unknown or temporarily broken plugins are isolated from the rest.
 */
export function ontologySignalsFromResults(
  results: readonly CanonicalAssessmentResult[],
  lookup: AssessmentPluginLookup = getAssessmentPlugin,
  now: Date = new Date(),
): OntologySignal[] {
  const newestByAssessment = new Map<string, CanonicalAssessmentResult>();

  for (const result of results) {
    const current = newestByAssessment.get(result.assessmentId);
    if (!current || result.completedAt > current.completedAt) {
      newestByAssessment.set(result.assessmentId, result);
    }
  }

  const candidates = [...newestByAssessment.values()].flatMap((result) => {
    const plugin = lookup(result.assessmentId);
    if (!plugin) return [];
    try {
      return plugin.ontology.toSignals(result);
    } catch {
      return [];
    }
  }).filter((signal) => !signal.expiresAt || signal.expiresAt > now.toISOString());

  // Multiple instruments can measure the same construct (for example a
  // detailed and a quick RIASEC form). Keep the higher-confidence signal;
  // when confidence is equal, keep the more recent observation.
  const bestByConstruct = new Map<string, OntologySignal>();
  for (const signal of candidates) {
    const current = bestByConstruct.get(signal.constructId);
    if (
      !current ||
      signal.confidence > current.confidence ||
      (signal.confidence === current.confidence && signal.observedAt > current.observedAt)
    ) {
      bestByConstruct.set(signal.constructId, signal);
    }
  }

  return [...bestByConstruct.values()];
}

export function collectAssessmentSignals(
  lookup: AssessmentPluginLookup = getAssessmentPlugin,
): OntologySignal[] {
  return ontologySignalsFromResults(listAssessmentResults(), lookup);
}
