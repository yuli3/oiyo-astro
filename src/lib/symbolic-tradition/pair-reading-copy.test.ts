import { describe, expect, it } from "vitest";

import { fill, josa, PAIR_COPY_FULL, PAIR_NAME, type PairLang } from "./pair-reading-copy";

const LANGS: PairLang[] = ["ko", "en", "ja", "zh", "fr", "es"];

describe("두 사람 읽기 문장", () => {
  it("여섯 언어 모두 이름 스무 개를 같은 키로 갖는다", () => {
    const keys = Object.keys(PAIR_NAME.ko).sort();
    expect(keys).toHaveLength(20);
    for (const lang of LANGS) expect(Object.keys(PAIR_NAME[lang]).sort(), lang).toEqual(keys);
  });

  it("문장 안의 자리표시자가 언어마다 같다", () => {
    const tokens = (t: string) => [...t.matchAll(/\{(\w+)/g)].map((m) => m[1]).sort();
    const walk = (a: unknown, b: unknown, path: string) => {
      if (typeof a === "string") {
        expect(tokens(b as string), path).toEqual(tokens(a));
        return;
      }
      for (const key of Object.keys(a as object)) walk((a as never)[key], (b as never)[key], `${path}.${key}`);
    };
    for (const lang of LANGS) walk(PAIR_COPY_FULL.ko, PAIR_COPY_FULL[lang], lang);
  });

  it("한국어 조사는 이름 끝 글자로 고른다", () => {
    expect(josa("민지", "이/가")).toBe("민지가");
    expect(josa("준혁", "이/가")).toBe("준혁이");
    expect(josa("친구 1", "이/가")).toBe("친구 1이");
    expect(josa("친구 2", "이/가")).toBe("친구 2가");
    expect(fill("{a:이/가} {b}에게", { a: "나", b: "친구 3" })).toBe("내가 친구 3에게");
    expect(josa("나", "은/는")).toBe("나는");
  });

  it("다른 언어 문장에 한글이 섞이지 않는다", () => {
    const hangul = /[가-힣]/;
    const walk = (v: unknown, path: string) => {
      if (typeof v === "string") expect(hangul.test(v), `${path}: ${v}`).toBe(false);
      else for (const [k, x] of Object.entries(v as object)) walk(x, `${path}.${k}`);
    };
    for (const lang of LANGS.filter((l) => l !== "ko")) {
      walk(PAIR_COPY_FULL[lang], lang);
      walk(PAIR_NAME[lang], lang);
    }
  });
});
