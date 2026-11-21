// 수능 끝난 수험생용: 홀랜드(RIASEC) 흥미 코드 두 글자 → 어울리는 계열·학과 예시 (2026-11-21).
// 학과 예시는 일반적으로 쓰이는 연결이며 정답이 아니에요. 코드 순서(1·2순위)에 따라 가중을 다르게 둬요.
export type Riasec = "R" | "I" | "A" | "S" | "E" | "C";
export const RIASEC: Riasec[] = ["R", "I", "A", "S", "E", "C"];
export const RIASEC_KO: Record<Riasec, { name: string; like: string }> = {
  R: { name: "현실형", like: "손으로 만들고 고치기, 기계·동식물·몸 쓰는 일" },
  I: { name: "탐구형", like: "왜 그런지 파고들기, 실험·분석·문제 풀이" },
  A: { name: "예술형", like: "표현하고 만들기, 글·그림·음악·디자인" },
  S: { name: "사회형", like: "사람을 돕고 가르치기, 상담·돌봄·교육" },
  E: { name: "진취형", like: "이끌고 설득하기, 기획·발표·창업" },
  C: { name: "관습형", like: "정리하고 꼼꼼히 관리하기, 숫자·문서·규칙" },
};
export interface MajorGroup { field: string; majors: string[]; codes: Riasec[] }
export const MAJOR_GROUPS: MajorGroup[] = [
  { field: "공학", majors: ["기계공학", "전기전자공학", "건축학", "토목·환경공학"], codes: ["R", "I"] },
  { field: "컴퓨터·데이터", majors: ["컴퓨터공학", "소프트웨어", "인공지능", "통계·데이터사이언스"], codes: ["I", "C", "R"] },
  { field: "자연과학", majors: ["물리학", "화학", "생명과학", "수학"], codes: ["I"] },
  { field: "의약·보건", majors: ["의예·치의예·한의예", "약학", "간호학", "물리치료·임상병리"], codes: ["I", "S", "R"] },
  { field: "농림·생명자원", majors: ["식품공학", "원예·산림", "동물자원", "수의예"], codes: ["R", "I"] },
  { field: "디자인·미술", majors: ["시각디자인", "산업디자인", "회화·조소", "패션디자인"], codes: ["A", "R"] },
  { field: "미디어·콘텐츠", majors: ["미디어커뮤니케이션", "영상·영화", "문예창작", "게임콘텐츠"], codes: ["A", "E"] },
  { field: "음악·공연", majors: ["실용음악", "연극영화", "무용", "작곡"], codes: ["A", "S"] },
  { field: "인문", majors: ["국어국문", "영어영문", "사학", "철학"], codes: ["A", "I", "S"] },
  { field: "교육", majors: ["초등교육", "유아교육", "특수교육", "교과교육(국·영·수 등)"], codes: ["S", "A"] },
  { field: "사회·복지", majors: ["사회복지", "심리학", "아동·가족학", "상담"], codes: ["S", "I"] },
  { field: "경영·경제", majors: ["경영학", "경제학", "무역·국제통상", "호텔·관광경영"], codes: ["E", "C"] },
  { field: "법·행정·정치", majors: ["법학", "행정학", "정치외교", "경찰행정"], codes: ["E", "S", "C"] },
  { field: "회계·금융", majors: ["회계·세무", "금융·보험", "부동산", "경영정보"], codes: ["C", "E"] },
  { field: "체육", majors: ["체육교육", "스포츠과학", "운동재활", "레저스포츠"], codes: ["R", "S"] },
];

/** 1순위 코드는 2점, 2순위는 1점. 계열 코드 목록 앞쪽일수록 조금 더 쳐줘요. */
export function rankMajors(first: Riasec, second: Riasec | null, limit = 5): (MajorGroup & { score: number })[] {
  return MAJOR_GROUPS.map((g) => {
    const w = (c: Riasec) => {
      const i = g.codes.indexOf(c);
      return i < 0 ? 0 : 1 - i * 0.2;
    };
    return { ...g, score: 2 * w(first) + (second && second !== first ? w(second) : 0) };
  })
    .filter((g) => g.score > 0)
    .sort((a, b) => b.score - a.score || a.field.localeCompare(b.field, "ko"))
    .slice(0, limit);
}
