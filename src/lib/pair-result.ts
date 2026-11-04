// 둘이 하는 결과 링크 — 내 결과 코드를 주소에 실어 보내면, 받은 사람이 같은
// 테스트를 끝낸 뒤 두 결과를 겹쳐 본다.
//
// 왜 서버 저장이 아니라 주소인가(2026-11-03 세운 결재, company-brain
// think-tank/2026-11-03-oiyo-series-more-content.md 1번): 결과 코드는 MBTI
// 네 글자·사랑의 언어 한 단어처럼 이미 공개 공유 링크(?type=, ?lang=)에 싣던
// 값이라 새 개인정보가 없다. 이름·답변·생년월일은 싣지 않는다.
//
// `pair` 는 기존 결과 공유 파라미터와 일부러 다른 키다. `?type=` 은 "이 결과를
// 그대로 보여 줘"라서 받은 사람이 테스트를 건너뛰게 된다. 이 링크의 목적은
// 받은 사람이 직접 테스트를 끝내게 하는 것이다.

export const PAIR_PARAM = 'pair';

export function readPairCode(search: string, isValid: (code: string) => boolean): string | null {
  const raw = new URLSearchParams(search).get(PAIR_PARAM);
  if (!raw) return null;
  const code = raw.trim();
  return code && isValid(code) ? code : null;
}

/** 받는 사람용 주소: 테스트 페이지 + pair 하나. 내 결과(?type= 등)는 빼서 바로 문항부터 시작하게 한다. */
export function buildPairUrl(origin: string, pathname: string, code: string): string {
  return `${origin}${pathname}?${PAIR_PARAM}=${encodeURIComponent(code)}`;
}

export type MbtiDim = 'EI' | 'SN' | 'TF' | 'JP';
export const MBTI_DIMS: readonly MbtiDim[] = ['EI', 'SN', 'TF', 'JP'];

export function isMbtiCode(code: string): boolean {
  return /^[EI][SN][TF][JP]$/.test(code.toUpperCase());
}

export interface MbtiDimCompare {
  dim: MbtiDim;
  mine: string;
  theirs: string;
  same: boolean;
}

export function compareMbti(mine: string, theirs: string): MbtiDimCompare[] {
  const a = mine.toUpperCase();
  const b = theirs.toUpperCase();
  return MBTI_DIMS.map((dim, i) => ({ dim, mine: a[i], theirs: b[i], same: a[i] === b[i] }));
}

export const LOVE_LANGS = ['words', 'acts', 'gifts', 'time', 'touch'] as const;
export type LoveLang = (typeof LOVE_LANGS)[number];

export function isLoveLang(code: string): code is LoveLang {
  return (LOVE_LANGS as readonly string[]).includes(code);
}
