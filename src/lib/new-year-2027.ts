// 2027 신년운세 모음의 계산. 생년월일 하나로 띠·별자리·개인년을 함께 낸다.
//
// 띠는 양력 생년이 아니라 음력 새해(설) 기준이다. 1~2월생은 설 이전이면 앞 해 띠라서
// solarlunar 로 음력 연도를 구한다(중국 달력이라 설 당일 전후 하루는 한국과 다를 수 있다).
import solarlunar from 'solarlunar';

import { animalOf, signOf } from '@/lib/fortune/periodic';
import { personalYearOf } from '@/lib/symbolic-tradition/numerology';

export const NEW_YEAR = 2027;
/** 2027 丁未년의 띠 번호(양=7). */
export const YEAR_ANIMAL = 7;

/** 2027년과 띠의 전통적 관계. 양(未) 기준: 같은 띠, 충(丑), 형(丑·戌), 해(子), 원진(子), 파(戌), 합(午·卯·亥). */
export type Relation = 'same' | 'clash' | 'harm' | 'punish' | 'harmony' | 'none';

export function relationTo2027(animal: number): Relation {
  if (animal === 7) return 'same';
  if (animal === 1) return 'clash'; // 丑未沖 (丑戌未 삼형에도 든다)
  if (animal === 0) return 'harm'; // 子未害 (원진이기도 하다)
  if (animal === 10) return 'punish'; // 丑戌未 삼형, 戌未破
  if (animal === 6 || animal === 3 || animal === 11) return 'harmony'; // 午未合, 亥卯未 삼합
  return 'none';
}

export interface NewYearProfile {
  animal: number;
  /** 음력 기준으로 앞 해 띠가 된 경우 */
  beforeLunarNewYear: boolean;
  sign: number;
  personalYear: number;
  relation: Relation;
}

export function newYearProfile(year: number, month: number, day: number): NewYearProfile {
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) throw new RangeError('date');
  const lunar = solarlunar.solar2lunar(year, month, day);
  const lunarYear = lunar === -1 ? year : lunar.lYear;
  const animal = animalOf(lunarYear);
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return {
    animal,
    beforeLunarNewYear: lunarYear !== year,
    sign: signOf(month, day),
    personalYear: personalYearOf(`${year}-${mm}-${dd}`, `${NEW_YEAR}-06-01`),
    relation: relationTo2027(animal),
  };
}
