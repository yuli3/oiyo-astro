// 내가 태어난 해 — 대한민국 연도별 출생아 수·합계출산율 (ko 전용). 2026-11-21.
// 출처: 1970~2024 = e-나라지표 「출생아 수와 합계출산율」(국가데이터처 2024년 출생통계 확정) 천 명 값과
// 반올림 범위가 맞는 위키백과 '대한민국의 인구' 표의 정확한 수. 1950~1969 = 위키백과 표만.
// 2003·2019 출생아 수는 두 출처가 어긋나 e-나라지표 천 명 값(approx)을 쓴다. 빈 합계출산율은 추측으로 채우지 않는다.

export interface BirthYear {
  year: number;
  births: number;
  approx?: true;
  tfr?: number;
}

export const BIRTH_YEARS: BirthYear[] = [
  { year: 1950, births: 633976, tfr: 5.05 },
  { year: 1951, births: 675666 },
  { year: 1952, births: 722018 },
  { year: 1953, births: 777186 },
  { year: 1954, births: 839293 },
  { year: 1955, births: 908134, tfr: 6.33 },
  { year: 1956, births: 945990 },
  { year: 1957, births: 963952 },
  { year: 1958, births: 993628 },
  { year: 1959, births: 1016173 },
  { year: 1960, births: 1080535, tfr: 6.16 },
  { year: 1961, births: 1046086, tfr: 5.99 },
  { year: 1962, births: 1036659, tfr: 5.79 },
  { year: 1963, births: 1033220, tfr: 5.57 },
  { year: 1964, births: 1001833, tfr: 5.36 },
  { year: 1965, births: 996052, tfr: 5.16 },
  { year: 1966, births: 1030245, tfr: 4.99 },
  { year: 1967, births: 1005293, tfr: 4.84 },
  { year: 1968, births: 1043321, tfr: 4.72 },
  { year: 1969, births: 1044943, tfr: 4.62 },
  { year: 1970, births: 1006645, tfr: 4.530 },
  { year: 1971, births: 1024773, tfr: 4.540 },
  { year: 1972, births: 952780, tfr: 4.120 },
  { year: 1973, births: 965521, tfr: 4.070 },
  { year: 1974, births: 922823, tfr: 3.770 },
  { year: 1975, births: 874030, tfr: 3.430 },
  { year: 1976, births: 796331, tfr: 3.000 },
  { year: 1977, births: 825339, tfr: 2.990 },
  { year: 1978, births: 750728, tfr: 2.640 },
  { year: 1979, births: 862669, tfr: 2.900 },
  { year: 1980, births: 862835, tfr: 2.820 },
  { year: 1981, births: 867409, tfr: 2.570 },
  { year: 1982, births: 848312, tfr: 2.390 },
  { year: 1983, births: 769155, tfr: 2.060 },
  { year: 1984, births: 674793, tfr: 1.740 },
  { year: 1985, births: 655489, tfr: 1.660 },
  { year: 1986, births: 636019, tfr: 1.580 },
  { year: 1987, births: 623831, tfr: 1.530 },
  { year: 1988, births: 633092, tfr: 1.550 },
  { year: 1989, births: 639431, tfr: 1.560 },
  { year: 1990, births: 649738, tfr: 1.570 },
  { year: 1991, births: 709275, tfr: 1.710 },
  { year: 1992, births: 730678, tfr: 1.760 },
  { year: 1993, births: 715826, tfr: 1.654 },
  { year: 1994, births: 721185, tfr: 1.656 },
  { year: 1995, births: 715020, tfr: 1.634 },
  { year: 1996, births: 691226, tfr: 1.574 },
  { year: 1997, births: 675394, tfr: 1.537 },
  { year: 1998, births: 641594, tfr: 1.464 },
  { year: 1999, births: 620668, tfr: 1.425 },
  { year: 2000, births: 640089, tfr: 1.480 },
  { year: 2001, births: 559934, tfr: 1.309 },
  { year: 2002, births: 496911, tfr: 1.178 },
  { year: 2003, births: 495000, approx: true, tfr: 1.191 },
  { year: 2004, births: 476958, tfr: 1.164 },
  { year: 2005, births: 438707, tfr: 1.085 },
  { year: 2006, births: 451759, tfr: 1.132 },
  { year: 2007, births: 496822, tfr: 1.259 },
  { year: 2008, births: 465892, tfr: 1.192 },
  { year: 2009, births: 444849, tfr: 1.149 },
  { year: 2010, births: 470171, tfr: 1.226 },
  { year: 2011, births: 471265, tfr: 1.244 },
  { year: 2012, births: 484550, tfr: 1.297 },
  { year: 2013, births: 436455, tfr: 1.187 },
  { year: 2014, births: 435435, tfr: 1.205 },
  { year: 2015, births: 438420, tfr: 1.239 },
  { year: 2016, births: 406243, tfr: 1.172 },
  { year: 2017, births: 357771, tfr: 1.052 },
  { year: 2018, births: 326822, tfr: 0.977 },
  { year: 2019, births: 302700, approx: true, tfr: 0.918 },
  { year: 2020, births: 272337, tfr: 0.837 },
  { year: 2021, births: 260562, tfr: 0.808 },
  { year: 2022, births: 249186, tfr: 0.778 },
  { year: 2023, births: 229971, tfr: 0.721 },
  { year: 2024, births: 238300, tfr: 0.748 },
];

export const BORN_FIRST = BIRTH_YEARS[0].year;
export const BORN_LAST = BIRTH_YEARS[BIRTH_YEARS.length - 1].year;
export const BORN_SOURCE_ENARA = 'https://www.index.go.kr/unity/potal/eNara/sub/showStblGams3.do?stts_cd=142801&idx_cd=1428&freq=Y&period=1970:2024';
export const BORN_SOURCE_WIKI = 'https://ko.wikipedia.org/wiki/%EB%8C%80%ED%95%9C%EB%AF%BC%EA%B5%AD%EC%9D%98_%EC%9D%B8%EA%B5%AC';
export const BORN_LIMIT =
  '출생아 수는 그해 대한민국에서 신고된 출생을 센 통계예요. 1970년 이전은 공식 출생통계 시계열 밖의 값이고, 2003·2019년은 천 명 단위 값이라 "약"을 붙였어요. 고른 해는 이 브라우저 밖으로 보내지 않아요.';

const ANIMALS = [
  { id: 'rat', name: '쥐', emoji: '🐭' },
  { id: 'ox', name: '소', emoji: '🐮' },
  { id: 'tiger', name: '호랑이', emoji: '🐯' },
  { id: 'rabbit', name: '토끼', emoji: '🐰' },
  { id: 'dragon', name: '용', emoji: '🐲' },
  { id: 'snake', name: '뱀', emoji: '🐍' },
  { id: 'horse', name: '말', emoji: '🐴' },
  { id: 'goat', name: '양', emoji: '🐑' },
  { id: 'monkey', name: '원숭이', emoji: '🐵' },
  { id: 'rooster', name: '닭', emoji: '🐔' },
  { id: 'dog', name: '개', emoji: '🐶' },
  { id: 'pig', name: '돼지', emoji: '🐷' },
] as const;

/** 양력 해 기준 띠. 설(음력 1/1) 전에 태어났으면 앞 해 띠라서 화면에 따로 안내한다. */
export function animalFor(year: number) {
  return ANIMALS[(((year - 4) % 12) + 12) % 12];
}

export function findBirthYear(year: number): BirthYear | undefined {
  return BIRTH_YEARS.find((b) => b.year === year);
}

/** 출생아 수 순위 (1 = 가장 많이 태어난 해). */
export function birthRank(year: number): number {
  const me = findBirthYear(year);
  if (!me) throw new Error(`no data for ${year}`);
  return BIRTH_YEARS.filter((b) => b.births > me.births).length + 1;
}

export interface BornYearCard {
  data: BirthYear;
  rank: number;
  total: number;
  vsLatest: number; // 최근 해(2024) 대비 배수
  animal: (typeof ANIMALS)[number];
  peak: BirthYear;
  low: BirthYear;
  decade: { avg: number; from: number; to: number };
}

export function makeBornYearCard(year: number): BornYearCard {
  const data = findBirthYear(year);
  if (!data) throw new Error(`no data for ${year}`);
  const latest = BIRTH_YEARS[BIRTH_YEARS.length - 1];
  const sorted = [...BIRTH_YEARS].sort((a, b) => b.births - a.births);
  const from = Math.floor(year / 10) * 10;
  const to = Math.min(from + 9, BORN_LAST);
  const inDecade = BIRTH_YEARS.filter((b) => b.year >= from && b.year <= to);
  return {
    data,
    rank: birthRank(year),
    total: BIRTH_YEARS.length,
    vsLatest: Math.round((data.births / latest.births) * 10) / 10,
    animal: animalFor(year),
    peak: sorted[0],
    low: sorted[sorted.length - 1],
    decade: { avg: Math.round(inDecade.reduce((s, b) => s + b.births, 0) / inDecade.length), from, to },
  };
}

/** 435,435 → "43만 5,435명", approx 면 "약 49만 5천 명" */
export function formatBirths(b: BirthYear): string {
  const man = Math.floor(b.births / 10000);
  const rest = b.births % 10000;
  if (b.approx) {
    const cheon = Math.round(rest / 1000);
    return `약 ${man}만${cheon ? ` ${cheon}천` : ''} 명`;
  }
  return `${man}만${rest ? ` ${rest.toLocaleString('ko-KR')}` : ''}명`;
}
