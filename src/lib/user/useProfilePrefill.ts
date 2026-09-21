import { useEffect, useMemo, useState } from "react";
import {
  resolveBirthRecord,
  updateBirthRecordFromParts,
} from "./birth-record";
import { useUserStore, type UserProfile } from "./store/user-store";

export interface ParsedBirth {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number | null; // 0-23, null = unknown
  minute: number | null;
}

/**
 * profile.birthDate(ISO)+birthTime("HH:mm") → {year,month,day,hour,minute}
 *
 * 사용자가 입력한 값은 "출생지 벽시계"다. 저장된 instant는 출생지 표준시(기본 KST)
 * 기준으로 되읽어야 한다 — 방문자 브라우저 TZ로 읽으면 해외 사용자의 생시가 밀린다.
 */
export function parseBirth(profile: UserProfile): ParsedBirth | null {
  const record = resolveBirthRecord(profile);
  if (!record) return null;
  const [year, month, day] = record.civilDate.split("-").map(Number);
  const [hour, minute] = record.civilTime
    ? record.civilTime.split(":").map(Number)
    : [null, null];
  return { year, month, day, hour, minute };
}

/**
 * 세부 도구(사주·별자리·바이오리듬 등)가 온톨로지 프로필을 재사용하기 위한 훅.
 * - SSR/hydration 안전: 최초 렌더는 기본값, 마운트 후 store에서 채움(hasHydrated).
 * - saveBirth로 입력을 다시 store에 기록해 다른 도구로 전파.
 */
export function useProfilePrefill() {
  const profile = useUserStore((s) => s.profile);
  const setProfile = useUserStore((s) => s.setProfile);
  const saveBirthRecord = useUserStore((s) => s.saveBirthRecord);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  // parsed 는 반드시 메모해야 한다. parseBirth 는 호출할 때마다 새 객체
  // 리터럴을 만들고, 도구 9개가 이 값을 useEffect 의존성에 그대로 넣는다.
  // 메모하지 않으면 렌더마다 의존성이 달라져 프리필 effect 가 계속 다시
  // 돌고, 사용자가 화면에서 고른 값(출생 도시 등)을 저장된 프로필 값으로
  // 즉시 덮어쓴다 — 도시를 골라도 곧바로 지워지고 "도시를 골라 주세요"
  // 오류가 뜨는 증상이 이것이었다(2026-09-21 액땜 부적 도구에서 확인).
  // profile 은 zustand 셀렉터라 이미 안정적이므로 이 의존성으로 충분하다.
  const parsed = useMemo(
    () => (hydrated ? parseBirth(profile) : null),
    [hydrated, profile],
  );

  function saveBirth(input: {
    year: number;
    month: number;
    day: number;
    hour?: number | null;
    minute?: number | null;
    gender?: "male" | "female";
  }) {
    const { gender } = input;
    const record = updateBirthRecordFromParts(resolveBirthRecord(profile), input);
    saveBirthRecord(record);
    if (gender) setProfile({ gender });
  }

  return { hydrated, profile, parsed, saveBirth, saveBirthRecord, setProfile };
}
