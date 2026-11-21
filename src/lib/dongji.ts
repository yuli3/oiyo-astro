// 동지 팥죽 한 해 정리 (ko 전용 세시풍속 시리즈 마지막 편, 2026-11-21).
// 기획: company-brain think-tank/2026-11-03-oiyo-other-series-brainstorm.md 2번(세시풍속 시리즈).
//
// 동지 날짜와 음력 날짜는 2026-11-21 solarlunar(중국 달력, UTC+8)로 뽑아 아래 표에 고정했다.
// 중국·한국 달력은 합삭이나 절입이 15~16시 UTC 사이에 들 때만 하루가 갈린다(tojeong.ts 주석).
// 2026년은 음력 11월 합삭(12-09 00:52 UTC)과 동지(12-21 20:50 UTC = 12-22 05:50 KST)가 그 구간 밖이라
// 한국 날짜와 같다. 2025년 애동지(음력 11월 2일)는 지난해 발표와 같다. 2027년 이후 줄은 그해
// 한국천문연구원 월력 자료로 다시 확인한 뒤 화면 문구에 쓴다(지금은 연도표에만 보인다).

export type DongjiKind = 'ae' | 'jung' | 'no';

export interface DongjiYear {
  year: number;
  /** 양력 12월 날짜 */
  day: number;
  weekday: string;
  /** 음력 11월 며칠 */
  lunarDay: number;
}

export const DONGJI_YEARS: readonly DongjiYear[] = [
  { year: 2025, day: 21, weekday: '일', lunarDay: 2 },
  { year: 2026, day: 22, weekday: '화', lunarDay: 14 },
  { year: 2027, day: 22, weekday: '수', lunarDay: 25 },
  { year: 2028, day: 21, weekday: '목', lunarDay: 6 },
  { year: 2029, day: 21, weekday: '금', lunarDay: 17 },
  { year: 2030, day: 22, weekday: '일', lunarDay: 28 },
];

export const DONGJI_THIS_YEAR = 2026;

/** 음력 11월 초순(1~10일) 애동지, 중순(11~20일) 중동지, 그 뒤 노동지. */
export function dongjiKind(lunarDay: number): DongjiKind {
  if (!Number.isInteger(lunarDay) || lunarDay < 1 || lunarDay > 30) throw new RangeError('lunarDay');
  if (lunarDay <= 10) return 'ae';
  if (lunarDay <= 20) return 'jung';
  return 'no';
}

export const DONGJI_KIND_LABEL: Record<DongjiKind, { name: string; food: string }> = {
  ae: { name: '애동지', food: '팥죽 대신 팥시루떡' },
  jung: { name: '중동지', food: '팥죽' },
  no: { name: '노동지', food: '팥죽' },
};

/** 동지 팥죽 새알심은 새해 세는 나이만큼 먹는다고 전한다. */
export function saealsimCount(birthYear: number, nextYear = DONGJI_THIS_YEAR + 1): number {
  if (!Number.isInteger(birthYear) || birthYear < 1900 || birthYear > nextYear) throw new RangeError('birthYear');
  return nextYear - birthYear + 1;
}

export interface DongjiChoice {
  id: string;
  label: string;
  emoji: string;
}

/** 붉은 팥에 실어 보낼 올해의 것 (최대 2개). */
export const SEND_AWAY: readonly DongjiChoice[] = [
  { id: 'delay', label: '미뤄 둔 일', emoji: '📦' },
  { id: 'worry', label: '쌓인 걱정', emoji: '🌧️' },
  { id: 'tired', label: '지친 몸', emoji: '🛌' },
  { id: 'hurt', label: '서운했던 마음', emoji: '💔' },
  { id: 'spend', label: '충동구매', emoji: '🛍️' },
  { id: 'night', label: '밤샘과 늦잠', emoji: '🌙' },
  { id: 'compare', label: '남과 비교하는 버릇', emoji: '🪞' },
  { id: 'clutter', label: '묵은 짐', emoji: '🧺' },
];

export interface DongjiWish extends DongjiChoice {
  /** 결과 카드 한 줄 (OIYO 작성) */
  line: string;
  /** 동지부터 설까지 해 볼 작은 일 */
  action: string;
}

/** 2027년에 들일 것 (1개). */
export const BRING_IN: readonly DongjiWish[] = [
  { id: 'health', label: '건강', emoji: '🌿', line: '따뜻한 죽 한 그릇처럼, 몸을 먼저 데우는 해', action: '동지부터 설까지 하루 20분 걷기' },
  { id: 'people', label: '좋은 사람', emoji: '🤝', line: '팥죽을 나눠 먹듯, 곁을 나누는 해', action: '올해 고마웠던 한 사람에게 연락하기' },
  { id: 'money', label: '넉넉한 살림', emoji: '🪙', line: '새알심을 하나씩 빚듯, 차곡차곡 모으는 해', action: '1월 고정 지출 하나 줄이기' },
  { id: 'learn', label: '배움', emoji: '📚', line: '긴 밤에 책력을 펼치듯, 새로 배우는 해', action: '배우고 싶은 것 하나 적고 첫 수업 찾기' },
  { id: 'rest', label: '쉼', emoji: '🍵', line: '가장 긴 밤을 지나 해가 길어지듯, 숨 고르는 해', action: '한 주에 하루는 일정 비우기' },
  { id: 'courage', label: '용기', emoji: '🔥', line: '붉은 팥이 어둠을 물리치듯, 한 걸음 내딛는 해', action: '미뤄 둔 도전 하나 날짜 정하기' },
  { id: 'travel', label: '새로운 곳', emoji: '🧭', line: '해가 다시 길어지듯, 바깥으로 나가는 해', action: '가 보고 싶은 곳 하나 달력에 적기' },
  { id: 'order', label: '정돈', emoji: '🗂️', line: '묵은 해를 씻어 내듯, 가볍게 정리하는 해', action: '서랍 하나, 휴대폰 사진첩 한 달 치 정리' },
];

export const DONGJI_LIMIT =
  '동지 팥죽 카드는 세시풍속을 재미로 옮긴 놀이예요. 앞일을 점치지 않고, 고른 것은 이 브라우저 밖으로 보내지 않아요.';

export interface DongjiCard {
  count: number;
  send: DongjiChoice[];
  bring: DongjiWish;
  kind: DongjiKind;
}

export function makeDongjiCard(birthYear: number, sendIds: string[], bringId: string): DongjiCard {
  const send = [...new Set(sendIds)].map((id) => SEND_AWAY.find((c) => c.id === id)).filter((c): c is DongjiChoice => Boolean(c));
  if (send.length < 1 || send.length > 2) throw new RangeError('send');
  const bring = BRING_IN.find((c) => c.id === bringId);
  if (!bring) throw new RangeError('bring');
  const thisYear = DONGJI_YEARS.find((y) => y.year === DONGJI_THIS_YEAR)!;
  return { count: saealsimCount(birthYear), send, bring, kind: dongjiKind(thisYear.lunarDay) };
}
