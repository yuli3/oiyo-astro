import { useEffect, useState } from "react";
import { useUserStore, type UserProfile } from "./store/user-store";

export interface ParsedBirth {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number | null; // 0-23, null = unknown
  minute: number | null;
}

/** profile.birthDate(ISO)+birthTime("HH:mm") → {year,month,day,hour,minute} */
export function parseBirth(profile: UserProfile): ParsedBirth | null {
  if (!profile.birthDate) return null;
  const d = new Date(profile.birthDate);
  if (isNaN(d.getTime())) return null;
  let hour: number | null = null;
  let minute: number | null = null;
  if (profile.birthTime && /^\d{1,2}:\d{1,2}/.test(profile.birthTime)) {
    const [h, m] = profile.birthTime.split(":");
    hour = Number(h);
    minute = Number(m);
  } else if (d.getHours() !== 12 || d.getMinutes() !== 0) {
    // birthDate가 시각까지 담고 있으면 사용(12:00은 "시간 모름" 관례라 제외)
    hour = d.getHours();
    minute = d.getMinutes();
  }
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate(), hour, minute };
}

/**
 * 세부 도구(사주·별자리·바이오리듬 등)가 온톨로지 프로필을 재사용하기 위한 훅.
 * - SSR/hydration 안전: 최초 렌더는 기본값, 마운트 후 store에서 채움(hasHydrated).
 * - saveBirth로 입력을 다시 store에 기록해 다른 도구로 전파.
 */
export function useProfilePrefill() {
  const profile = useUserStore((s) => s.profile);
  const setProfile = useUserStore((s) => s.setProfile);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  const parsed = hydrated ? parseBirth(profile) : null;

  function saveBirth(input: {
    year: number;
    month: number;
    day: number;
    hour?: number | null;
    gender?: "male" | "female";
  }) {
    const { year, month, day, hour, gender } = input;
    const hasHour = hour !== null && hour !== undefined;
    const birthDate = new Date(year, month - 1, day, hasHour ? (hour as number) : 12).toISOString();
    const updates: Partial<UserProfile> = { birthDate };
    if (hasHour) updates.birthTime = `${String(hour).padStart(2, "0")}:00`;
    if (gender) updates.gender = gender;
    setProfile(updates);
  }

  return { hydrated, profile, parsed, saveBirth, setProfile };
}
