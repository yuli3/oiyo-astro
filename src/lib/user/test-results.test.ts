import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  OIYO_TEST_RESULTS_STORAGE_KEY,
  listStoredTestResults,
  recordTestResult,
  removeStoredTestInputs,
} from './test-results';

describe('test result history storage', () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal('window', {
      dispatchEvent: vi.fn(),
      localStorage: {
        getItem: vi.fn((key: string) => store.get(key) ?? null),
        setItem: vi.fn((key: string, value: string) => { store.set(key, value); }),
        removeItem: vi.fn((key: string) => { store.delete(key); }),
      },
    });
    vi.stubGlobal('CustomEvent', class CustomEvent<T = unknown> {
      detail: T;
      type: string;
      constructor(type: string, init?: { detail?: T }) {
        this.type = type;
        this.detail = init?.detail as T;
      }
    });
  });

  it('records heterogeneous tests and mystic ontology results in newest-first history', () => {
    recordTestResult({
      kind: 'psychometric',
      testId: 'political-compass',
      title: '정치성향',
      resultLabel: 'ETGL',
      inputs: { answers: { s1_1: '3' } },
      result: { code: 'ETGL' },
    });
    recordTestResult({
      kind: 'mystic',
      testId: 'mayan-kin',
      title: '마야 킨',
      resultLabel: 'KIN 42',
      inputs: { birthDate: '1990-01-01' },
      result: { kin: 42 },
    });

    const raw = window.localStorage.getItem(OIYO_TEST_RESULTS_STORAGE_KEY);
    expect(raw).toContain('political-compass');
    expect(raw).toContain('mayan-kin');

    const results = listStoredTestResults();
    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({ kind: 'mystic', testId: 'mayan-kin', resultLabel: 'KIN 42' });
    expect(results[1]).toMatchObject({ kind: 'psychometric', testId: 'political-compass', resultLabel: 'ETGL' });
    expect(results[0].createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(results[0].id).toContain('mayan-kin');
  });

  it('removes legacy inputs only from the requested test history', () => {
    recordTestResult({
      kind: 'preference',
      testId: 'political-compass',
      title: 'Political compass',
      resultLabel: 'ETGL',
      inputs: { answers: { s1_1: '3' } },
      result: { code: 'ETGL' },
    });
    recordTestResult({
      kind: 'mystic',
      testId: 'mayan-kin',
      title: 'Mayan kin',
      resultLabel: 'KIN 42',
      inputs: { birthDate: '1990-01-01' },
    });

    expect(removeStoredTestInputs('political-compass')).toBe(1);

    const [mayan, political] = listStoredTestResults();
    expect(mayan.inputs).toEqual({ birthDate: '1990-01-01' });
    expect(political).not.toHaveProperty('inputs');
    expect(political.result).toEqual({ code: 'ETGL' });
    expect(removeStoredTestInputs('political-compass')).toBe(0);
  });
});
