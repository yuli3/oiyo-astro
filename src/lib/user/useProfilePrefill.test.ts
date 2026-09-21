/**
 * useProfilePrefill 의 parsed 안정성 회귀.
 *
 * 2026-09-21: 도구에서 출생 도시를 골라도 즉시 지워지고 "도시를 골라 주세요"
 * 오류가 뜨는 버그가 있었다. 원인은 parseBirth 가 호출마다 새 객체 리터럴을
 * 돌려주는데, 도구 9개가 그 값을 useEffect 의존성에 그대로 넣은 것이었다.
 * 렌더마다 의존성이 바뀌니 프리필 effect 가 계속 다시 돌아 사용자의 선택을
 * 저장된 프로필 값으로 덮어썼다.
 *
 * 이 테스트 환경은 node 라 훅을 렌더할 수 없다(테스트용 React 렌더러를
 * 이것 하나 때문에 들이지 않는다). 그래서 두 가지로 나눠 잠근다.
 *  1. parseBirth 가 새 객체를 준다는 사실 자체 — 메모가 필요한 이유
 *  2. 훅이 실제로 메모하고 있다는 사실 — 원본에서 확인
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { parseBirth } from "./useProfilePrefill";
import type { UserProfile } from "./store/user-store";

const profile = {
  birthDate: "2002-09-01",
  birthTime: "09:00",
} as unknown as UserProfile;

describe("useProfilePrefill — parsed 안정성", () => {
  it("parseBirth 는 값은 같지만 매번 다른 객체를 준다", () => {
    const a = parseBirth(profile);
    const b = parseBirth(profile);
    expect(a).toEqual(b);
    // 이것이 메모가 필요한 이유다. 값이 같아도 의존성 비교는 참조로 한다.
    expect(a).not.toBe(b);
  });

  it("parseBirth 는 저장된 생년월일시를 그대로 읽는다", () => {
    expect(parseBirth(profile)).toMatchObject({
      year: 2002,
      month: 9,
      day: 1,
      hour: 9,
    });
  });

  it("훅이 parsed 를 메모한다", () => {
    // 메모를 걷어내면 9개 도구에서 사용자의 선택이 다시 덮어써진다.
    // 그 증상은 node 테스트로 잡히지 않으므로 원본에서 직접 확인한다.
    const src = readFileSync(new URL("./useProfilePrefill.ts", import.meta.url), "utf8");
    expect(src).toMatch(/const parsed = useMemo\(/);
  });
});
