/**
 * 수비학 — 생년월일에서 나오는 수(생명수·생일수·개인년).
 *
 * 달력 날짜 문자열(YYYY-MM-DD)에서 바로 셈한다. 2026-09-22 전 수비학 페이지는
 * `new Date("YYYY-MM-DD")`(UTC 자정)를 만들고 지역 시간으로 날짜를 읽어서,
 * 서반구(미주 등)에서는 하루 앞 날짜로 셈했다 — 1990-05-17 이 뉴욕에서는
 * 16일이 되어 생명수 5 가 4 로 나왔다.
 *
 * 이름에서 나오는 수(표현수·영혼수)는 여기서 다루지 않는다. 알파벳 기준이라
 * 한글 이름은 로마자 표기에 따라 값이 달라지므로, 전용 페이지에서 사용자가
 * 로마자 이름을 직접 넣을 때만 셈한다(2026-09-22 세운 결정).
 */

const MASTER = new Set([11, 22, 33]);

/** 한 자리로 줄인다. 마스터 수 11·22·33 은 남긴다(피타고라스 수비학의 관례). */
export function reduceNumber(n: number, keepMaster = true): number {
  let x = n;
  while (x > 9 && !(keepMaster && MASTER.has(x))) {
    x = String(x).split("").reduce((s, d) => s + Number(d), 0);
  }
  return x;
}

function parts(civilDate: string): [number, number, number] {
  const [y, m, d] = civilDate.split("-").map(Number);
  return [y, m, d];
}

/** 생명수 — 월·일·연을 각각 줄인 뒤 더해 다시 줄인다 */
export function lifePathOf(civilDate: string): number {
  const [y, m, d] = parts(civilDate);
  return reduceNumber(reduceNumber(m) + reduceNumber(d) + reduceNumber(y));
}

/** 생일수 — 태어난 날(1~31)을 줄인 값. 11·22 는 남는다 */
export function birthdayNumberOf(civilDate: string): number {
  return reduceNumber(parts(civilDate)[2]);
}

/** 개인년 — 태어난 월·일 + 올해 연도. 오늘 날짜(달력)로 올해를 정한다 */
export function personalYearOf(civilDate: string, todayCivil: string): number {
  const [, m, d] = parts(civilDate);
  const [year] = parts(todayCivil);
  return reduceNumber(reduceNumber(m) + reduceNumber(d) + reduceNumber(year), false);
}
