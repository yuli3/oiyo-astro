// 2027 정월대보름 부럼·달 소원 (ko 전용 세시풍속 시리즈, 2026-11-21).
// 기획: company-brain think-tank/2026-11-03-oiyo-other-series-brainstorm.md 2번.
// 날짜: 2027 음력 정월 초하루 = 2027-02-07(tojeong.ts 의 KASI 대조 표), 보름 = 2027-02-21(일).
// 새 페이지는 1월 중순까지 색인돼야 해서 미리 연다.

export const DAEBOREUM_YEAR = 2027;
export const DAEBOREUM_DATE = { month: 2, day: 21, weekday: '일' } as const;

export interface Bureom {
  id: string;
  label: string;
  emoji: string;
  /** 깨물며 비는 것 (OIYO 작성) */
  wish: string;
}

/** 부럼: 이를 튼튼히 하고 한 해 부스럼을 막는다고 깨무는 견과. */
export const BUREOM: readonly Bureom[] = [
  { id: 'walnut', label: '호두', emoji: '🌰', wish: '단단한 껍질처럼 흔들리지 않는 한 해' },
  { id: 'peanut', label: '땅콩', emoji: '🥜', wish: '두 알이 한 껍질에 들듯 좋은 짝과 함께하는 한 해' },
  { id: 'chestnut', label: '밤', emoji: '🌰', wish: '알이 꽉 차듯 하는 일마다 속이 찬 한 해' },
  { id: 'pinenut', label: '잣', emoji: '🌲', wish: '작아도 고소하게, 작은 기쁨이 많은 한 해' },
  { id: 'gingko', label: '은행', emoji: '🍂', wish: '오래 사는 나무처럼 몸과 마음이 오래가는 한 해' },
];

export interface MoonWish {
  id: string;
  label: string;
  emoji: string;
  line: string;
}

export const MOON_WISHES: readonly MoonWish[] = [
  { id: 'health', label: '건강', emoji: '🌿', line: '보름달처럼 둥글게, 아프지 않고 꽉 찬 한 해' },
  { id: 'family', label: '가족', emoji: '🏠', line: '오곡밥을 나누듯 식구가 함께 웃는 한 해' },
  { id: 'love', label: '사랑', emoji: '💞', line: '달빛 아래 마음이 닿는 한 해' },
  { id: 'money', label: '재물', emoji: '🪙', line: '달이 차오르듯 살림이 조금씩 불어나는 한 해' },
  { id: 'exam', label: '합격', emoji: '📝', line: '귀밝이술처럼 좋은 소식이 먼저 들리는 한 해' },
  { id: 'work', label: '일', emoji: '💼', line: '달집이 타오르듯 하는 일에 불이 붙는 한 해' },
  { id: 'friend', label: '친구', emoji: '🤝', line: '더위를 사고팔던 이웃처럼 웃을 친구가 많은 한 해' },
  { id: 'peace', label: '마음의 평화', emoji: '🕊️', line: '정월 보름밤처럼 환하고 고요한 한 해' },
];

export const DAEBOREUM_LIMIT =
  '부럼·달 소원 카드는 세시풍속을 재미로 옮긴 놀이예요. 앞일을 점치지 않고, 고른 것은 이 브라우저 밖으로 보내지 않아요.';

export interface DaeboreumCard {
  bureom: Bureom;
  wish: MoonWish;
  /** 공유 문구: 더위팔기 */
  heatLine: string;
}

export function makeDaeboreumCard(bureomId: string, wishId: string): DaeboreumCard {
  const bureom = BUREOM.find((b) => b.id === bureomId);
  const wish = MOON_WISHES.find((w) => w.id === wishId);
  if (!bureom || !wish) throw new RangeError('choice');
  return { bureom, wish, heatLine: '내 더위 사 가라! 2027 정월대보름 부럼 카드' };
}
