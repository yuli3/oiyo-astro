import { useEffect, useState } from "react";
import {
  createBirthRecordFromParts,
  resolveBirthRecord,
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

  const parsed = hydrated ? parseBirth(profile) : null;

  function saveBirth(input: {
    year: number;
    month: number;
    day: number;
    hour?: number | null;
    minute?: number | null;
    gender?: "male" | "female";
  }) {
    const { gender } = input;
    const record = createBirthRecordFromParts(input);
    saveBirthRecord(record);
    if (gender) setProfile({ gender });
  }

  return { hydrated, profile, parsed, saveBirth, saveBirthRecord, setProfile };
}
