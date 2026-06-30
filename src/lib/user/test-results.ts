export type StoredTestResultKind =
  | 'psychometric'
  | 'mystic'
  | 'ontology'
  | 'fortune'
  | 'preference'
  | 'skill'
  | 'other';

export interface StoredTestResultInput {
  kind: StoredTestResultKind;
  testId: string;
  title: string;
  resultLabel: string;
  inputs?: unknown;
  result?: unknown;
  locale?: string;
  sourcePath?: string;
}

export interface StoredTestResult extends StoredTestResultInput {
  createdAt: string;
  id: string;
}

export const OIYO_TEST_RESULTS_STORAGE_KEY = 'oiyo:test-results:v1';
export const OIYO_TEST_RESULTS_UPDATED_EVENT = 'oiyo:test-results-updated';
const MAX_RESULTS = 200;

function safeArray(value: unknown): StoredTestResult[] {
  return Array.isArray(value) ? value.filter((item): item is StoredTestResult => Boolean(item && typeof item === 'object' && 'id' in item)) : [];
}

export function listStoredTestResults(): StoredTestResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(OIYO_TEST_RESULTS_STORAGE_KEY);
    if (!raw) return [];
    return safeArray(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function recordTestResult(input: StoredTestResultInput): StoredTestResult | null {
  if (typeof window === 'undefined') return null;
  try {
    const createdAt = new Date().toISOString();
    const id = `${input.testId}:${createdAt}`;
    const entry: StoredTestResult = { ...input, createdAt, id };
    const next = [entry, ...listStoredTestResults()].slice(0, MAX_RESULTS);
    window.localStorage.setItem(OIYO_TEST_RESULTS_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(OIYO_TEST_RESULTS_UPDATED_EVENT, { detail: entry }));
    return entry;
  } catch {
    return null;
  }
}

export function clearStoredTestResults() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(OIYO_TEST_RESULTS_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(OIYO_TEST_RESULTS_UPDATED_EVENT));
  } catch {
    // Ignore storage failures.
  }
}
