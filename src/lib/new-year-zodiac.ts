// 2027 お正月(ja)·春节(zh) 페이지용 띠·나이 계산 (2026-11-21). 순수 함수.
// 띠 경계: 일본 연하장 관습은 양력 1월 1일, 중국 생肖는 춘절(음력 1월 1일) 기준이라 호출하는 쪽에서 고른다.
export const BRANCH_JA = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;
export const ANIMAL_JA = ["ねずみ", "うし", "とら", "うさぎ", "たつ", "へび", "うま", "ひつじ", "さる", "とり", "いぬ", "いのしし"] as const;
export const ANIMAL_ZH = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"] as const;
export const STEM = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;

const mod = (n: number, m: number) => ((n % m) + m) % m;
export const branchIndex = (year: number) => mod(year - 4, 12);
export const stemOf = (year: number) => STEM[mod(year - 4, 10)];
export const ganzhi = (year: number) => `${stemOf(year)}${BRANCH_JA[branchIndex(year)]}`;

/** 같은 띠로 태어난 해들(그 해 기준 나이 0~100) */
export function sameSignYears(target: number): { year: number; age: number }[] {
  const out: { year: number; age: number }[] = [];
  for (let y = target; target - y <= 100; y -= 12) out.push({ year: y, age: target - y });
  return out.slice(1);
}

export type Sex = "m" | "f";
/** 일본 厄年(数え年). 本厄·前厄·後厄. 지역·사찰마다 조금씩 달라요. */
const YAKU: Record<Sex, number[]> = { m: [25, 42, 61], f: [19, 33, 37, 61] };
const TAIYAKU: Record<Sex, number> = { m: 42, f: 33 };
export function yakudoshi(birthYear: number, sex: Sex, year = 2027): { kazoe: number; kind: "hon" | "mae" | "ato" | null; taiyaku: boolean } {
  const kazoe = year - birthYear + 1;
  for (const a of YAKU[sex]) {
    if (kazoe === a) return { kazoe, kind: "hon", taiyaku: a === TAIYAKU[sex] };
    if (kazoe === a - 1) return { kazoe, kind: "mae", taiyaku: a === TAIYAKU[sex] };
    if (kazoe === a + 1) return { kazoe, kind: "ato", taiyaku: a === TAIYAKU[sex] };
  }
  return { kazoe, kind: null, taiyaku: false };
}

/** 춘절 날짜(양력). 생년 판정용 1940~2030. 출처: 중국 농력(紫金山天文台) 기준 일반 표 */
export const CHUNJIE: Record<number, string> = {
  1940: "02-08", 1941: "01-27", 1942: "02-15", 1943: "02-05", 1944: "01-25", 1945: "02-13", 1946: "02-02", 1947: "01-22", 1948: "02-10", 1949: "01-29",
  1950: "02-17", 1951: "02-06", 1952: "01-27", 1953: "02-14", 1954: "02-03", 1955: "01-24", 1956: "02-12", 1957: "01-31", 1958: "02-18", 1959: "02-08",
  1960: "01-28", 1961: "02-15", 1962: "02-05", 1963: "01-25", 1964: "02-13", 1965: "02-02", 1966: "01-21", 1967: "02-09", 1968: "01-30", 1969: "02-17",
  1970: "02-06", 1971: "01-27", 1972: "02-15", 1973: "02-03", 1974: "01-23", 1975: "02-11", 1976: "01-31", 1977: "02-18", 1978: "02-07", 1979: "01-28",
  1980: "02-16", 1981: "02-05", 1982: "01-25", 1983: "02-13", 1984: "02-02", 1985: "02-20", 1986: "02-09", 1987: "01-29", 1988: "02-17", 1989: "02-06",
  1990: "01-27", 1991: "02-15", 1992: "02-04", 1993: "01-23", 1994: "02-10", 1995: "01-31", 1996: "02-19", 1997: "02-07", 1998: "01-28", 1999: "02-16",
  2000: "02-05", 2001: "01-24", 2002: "02-12", 2003: "02-01", 2004: "01-22", 2005: "02-09", 2006: "01-29", 2007: "02-18", 2008: "02-07", 2009: "01-26",
  2010: "02-14", 2011: "02-03", 2012: "01-23", 2013: "02-10", 2014: "01-31", 2015: "02-19", 2016: "02-08", 2017: "01-28", 2018: "02-16", 2019: "02-05",
  2020: "01-25", 2021: "02-12", 2022: "02-01", 2023: "01-22", 2024: "02-10", 2025: "01-29", 2026: "02-17", 2027: "02-06", 2028: "01-26", 2029: "02-13", 2030: "02-03",
};

/** 생일(YYYY-MM-DD) → 중국 생肖. 춘절 전에 태어났으면 전해 띠. 표 밖이면 null */
export function shengxiao(birth: string): { animal: string; lunarYear: number } | null {
  const y = Number(birth.slice(0, 4));
  const cj = CHUNJIE[y];
  if (!cj) return null;
  const ly = birth.slice(5) < cj ? y - 1 : y;
  return { animal: ANIMAL_ZH[branchIndex(ly)], lunarYear: ly };
}
