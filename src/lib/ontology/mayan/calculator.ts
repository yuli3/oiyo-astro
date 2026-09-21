import { GALACTIC_TONES, type MayanKin, SOLAR_SEALS } from "./types";

// Base Date: July 26, 1987 (Kin 34 - White Galactic Wizard)
const BASE_YEAR = 1987;
const BASE_MONTH_INDEX = 6;
const BASE_DAY_OF_MONTH = 26;
const BASE_KIN = 34;

/**
 * 달력 날짜를 일련번호로 바꾼다. 타임존·서머타임과 무관한 정수 연산이다.
 *
 * 2026-09-21: 예전에는 기준일을 `new Date(1987, 6, 26)` 로 모듈 로드 때 만들어
 * 두고 대상 날짜와 밀리초를 빼서 나눴다. 두 가지가 어긋났다.
 *   1) 기준일은 로드 시점의 타임존으로 굳는데 대상 날짜는 나중에 만들어진다.
 *      프로세스 안에서 TZ 가 달라지면 하루가 밀렸다.
 *   2) 로컬 자정끼리 빼면 서머타임 전환 구간에서 23시간·25시간이 나와
 *      floor 가 하루를 잘못 센다.
 * 같은 생년월일인데 보는 사람의 시간대에 따라 킨이 달라지는 버그였다.
 * 달력 성분만 읽어 정수로 세면 두 경우 모두 사라진다.
 */
function civilDayNumber(year: number, monthIndex: number, day: number): number {
  return Math.round(Date.UTC(year, monthIndex, day) / 86_400_000);
}

const BASE_DAY_NUMBER = civilDayNumber(BASE_YEAR, BASE_MONTH_INDEX, BASE_DAY_OF_MONTH);

export function calculateMayanKin(date: Date): MayanKin | null {
  // Check for Leap Day (Hunab Ku)
  if (
    isLeapYear(date.getFullYear()) &&
    date.getMonth() === 1 &&
    date.getDate() === 29
  ) {
    // Return special "0.0.Hunab Ku" object or null with flag?
    // For now, let's return null or a specific Kin 0 object?
    // Requirement says "0.0.Hunab Ku".
    // Types expect kinNumber. I'll make kinNumber 0.
    return {
      affirmation: "I am the Galactic Center. I am Timeless.",
      kinName: { en: "Hunab Ku", ko: "후납쿠" },
      kinNumber: 0,
      seal: {
        color: "white" as any,
        id: 0,
        key: "hunab_ku",
        keywords: ["Galactic Center", "Timelessness", "Void"],
        mayanName: "Hunab Ku",
        name: "Hunab Ku",
      },
      sealName: { en: "Hunab Ku", ko: "후납쿠" },
      tone: {
        key: "hunab_ku",
        keywords: ["Unity"],
        name: "Hunab Ku",
        number: 0,
      },
    };
  }

  const daysElapsed = getDreamspellDays(date);

  // Calculate Kin
  // Kin = ( (daysElapsed + BASE_KIN - 1) % 260 ) + 1
  let kin = (BASE_KIN + daysElapsed) % 260;
  if (kin <= 0) kin += 260; // Handle negative modulo for dates before 1987

  // Kin to Seal/Tone
  // Tone = ((Kin - 1) % 13) + 1
  const toneNum = ((kin - 1) % 13) + 1;
  const tone = GALACTIC_TONES.find((t) => t.number === toneNum)!;

  // Seal = ((Kin - 1) % 20) + 1
  const sealNum = ((kin - 1) % 20) + 1;
  const seal = SOLAR_SEALS.find((s) => s.id === sealNum)!;

  return {
    affirmation: `I ${tone.keywords[0]} in order to ${seal.keywords[2]}. ${tone.keywords[1]} ${seal.keywords[1]}. I seal the ${seal.keywords[0]} of ${seal.keywords[1]} with the ${tone.name} tone of ${tone.keywords[2]}.`,
    kinName: {
      en: `${tone.name} ${seal.name}`,
      ko: `${tone.name} ${seal.name}`, // Simplified for now, should ideally be translated
    },
    kinNumber: kin,
    seal: { ...seal, keywords: [...seal.keywords] },
    sealName: {
      en: seal.name,
      ko: seal.name,
    },
    tone: { ...tone, keywords: [...tone.keywords] },
  };
}

function getDreamspellDays(targetDate: Date): number {
  const tYear = targetDate.getFullYear();
  const bYear = BASE_YEAR;

  // Real Days Difference
  const targetDayNumber = civilDayNumber(tYear, targetDate.getMonth(), targetDate.getDate());
  const realDays = targetDayNumber - BASE_DAY_NUMBER;
  const earlier = Math.min(BASE_DAY_NUMBER, targetDayNumber);
  const later = Math.max(BASE_DAY_NUMBER, targetDayNumber);

  // Count Feb 29s in between
  // Start from 1988 (first leap after 1987)
  let leapDays = 0;

  // Determine direction
  const startYear = Math.min(bYear, tYear);
  const endYear = Math.max(bYear, tYear);

  for (let y = startYear; y <= endYear; y++) {
    if (isLeapYear(y)) {
      const feb29 = civilDayNumber(y, 1, 29);
      // Check if this Feb 29 is within the range, exclusive of both ends.
      if (feb29 > earlier && feb29 < later) {
        leapDays++;
      }
      // If target IS Feb 29, we handle it separately (Hunab Ku)
    }
  }

  return realDays >= 0 ? realDays - leapDays : realDays + leapDays;
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
