import { describe, expect, it } from "vitest";

import { LOCALES } from "@/i18n";
import { HARMONY_INDEX_TABLE } from "./index";
import { PAIR_COPY } from "./pair-copy";
import { COMPATIBILITY_LENSES } from "./types";

/**
 * 관계 해설의 완전성 계약.
 *
 * 왜 있나: 2026-09-04 에 두 번 물렸다.
 *   ① `PAIR` 이 한국어 전용이라 ja/zh/fr/es 사용자가 선을 누르면 한국어가
 *      나왔다. 화면은 멀쩡해 보여서 브라우저로 눌러보고서야 알았다.
 *   ② 관계 이름이 렌즈를 넘어 충돌했다(`same` ← 오행·띠). 띠가 같아서 나온
 *      선에 오행 해설이 붙었는데, fallback 이 있으니 아무것도 안 깨졌다.
 *
 * 둘 다 "조용히 틀린" 부류다. 새 렌즈를 더할 때 같은 일이 반복되지 않도록,
 * 렌즈가 낼 수 있는 모든 관계가 모든 로케일에 있는지 기계가 센다.
 */
describe("pair copy contract", () => {
  it("covers every lens × relation × locale", () => {
    const missing: string[] = [];
    for (const lens of COMPATIBILITY_LENSES) {
      for (const relation of Object.keys(HARMONY_INDEX_TABLE[lens])) {
        const key = `${lens}:${relation}` as const;
        for (const locale of LOCALES) {
          if (!PAIR_COPY[locale]?.[key]) missing.push(`${locale} / ${key}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it("has no copy for a relation no lens can emit", () => {
    const emitted = new Set(
      COMPATIBILITY_LENSES.flatMap((lens) =>
        Object.keys(HARMONY_INDEX_TABLE[lens]).map((relation) => `${lens}:${relation}`),
      ),
    );
    const stale: string[] = [];
    for (const locale of LOCALES) {
      for (const key of Object.keys(PAIR_COPY[locale])) {
        if (!emitted.has(key)) stale.push(`${locale} / ${key}`);
      }
    }
    expect(stale).toEqual([]);
  });

  it("fills every field, in every locale", () => {
    const blank: string[] = [];
    for (const locale of LOCALES) {
      for (const [key, copy] of Object.entries(PAIR_COPY[locale])) {
        for (const field of ["ask", "care", "help", "label"] as const) {
          if (!copy[field]?.trim()) blank.push(`${locale} / ${key} / ${field}`);
        }
      }
    }
    expect(blank).toEqual([]);
  });

  it("does not reuse one locale's wording in another", () => {
    // ko 문구를 그대로 복사해 두고 번역했다고 넘어가는 사고를 막는다.
    const ko = PAIR_COPY.ko;
    const copied: string[] = [];
    for (const locale of LOCALES) {
      if (locale === "ko") continue;
      for (const [key, copy] of Object.entries(PAIR_COPY[locale])) {
        if (ko[key] && copy.label === ko[key].label) copied.push(`${locale} / ${key}`);
      }
    }
    expect(copied).toEqual([]);
  });
});
