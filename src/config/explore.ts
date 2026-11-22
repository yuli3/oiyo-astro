import type { Locale } from "@/i18n";
import { localePath } from "@/i18n";

// 2026-11-22 UI·UX 대수선: 홈 "둘러보기"·헤더 서랍·푸터가 같은 목록을 쓴다.
// 그동안 타임슬립(600년 전), 꿈 해몽, 시즌 페이지는 홈·내비 어디에도 입구가 없어
// 검색으로만 들어올 수 있었다. 한곳에서 정의해 세 곳의 이름·순서가 어긋나지 않게 한다.

type L10n = Record<Locale, string>;

export interface ExploreLink {
  key: string;
  href: string;
  title: string;
  description: string;
}

const pick = (map: L10n, locale: Locale) => map[locale] ?? map.en;

const EXPLORE: { key: string; path: string; title: L10n; description: L10n }[] = [
  {
    key: "timeslip",
    path: "/past-life-1426/",
    title: { ko: "타임슬립 600년 전", en: "Timeslip: 600 years ago", ja: "タイムスリップ600年前", zh: "穿越600年前", fr: "Voyage 600 ans en arrière", es: "Viaje 600 años atrás" },
    description: { ko: "조선·유럽·미국 기록으로 떠나는 시간 여행", en: "Time travel through Joseon, European and US records", ja: "朝鮮・欧州・米国の記録で時間旅行", zh: "借朝鲜、欧洲、美国史料穿越时空", fr: "Voyage dans le temps à travers les archives", es: "Viaje en el tiempo con archivos históricos" },
  },
  {
    key: "reincarnation",
    path: "/reincarnation-country",
    title: { ko: "환생 나라 뽑기", en: "Reincarnation country", ja: "転生する国", zh: "投胎国家", fr: "Pays de réincarnation", es: "País de reencarnación" },
    description: { ko: "실제 출생 수 비중으로 다시 태어날 나라를", en: "A country drawn by real birth shares", ja: "実際の出生数の割合で国を引く", zh: "按真实出生比重抽国家", fr: "Un pays tiré selon les naissances réelles", es: "Un país según nacimientos reales" },
  },
  {
    key: "dream",
    path: "/dream",
    title: { ko: "꿈 해몽", en: "Dream meanings", ja: "夢占い", zh: "解梦", fr: "Signification des rêves", es: "Significado de los sueños" },
    description: { ko: "꿈 상징을 전통 해석과 심리학으로 함께", en: "Dream symbols, read through tradition and psychology", ja: "夢の象徴を伝統と心理学で読む", zh: "用传统与心理学解读梦的象征", fr: "Symboles lus par la tradition et la psychologie", es: "Símbolos leídos desde la tradición y la psicología" },
  },
  {
    key: "tarot",
    path: "/tarot/reading",
    title: { ko: "타로 리딩", en: "Tarot reading", ja: "タロットリーディング", zh: "塔罗牌解读", fr: "Tirage de tarot", es: "Lectura de tarot" },
    description: { ko: "카드 세 장으로 지금의 흐름 읽기", en: "Three cards on where things stand", ja: "3枚のカードで今の流れを読む", zh: "三张牌读懂当下", fr: "Trois cartes sur le moment présent", es: "Tres cartas sobre tu momento" },
  },
];

export function exploreLinks(locale: Locale): ExploreLink[] {
  return EXPLORE.map((item) => ({
    key: item.key,
    href: localePath(locale, item.path),
    title: pick(item.title, locale),
    description: pick(item.description, locale),
  }));
}

// 시즌 페이지는 로케일마다 있는 것이 다르다(예: 토정비결은 ko, お正月 은 ja 전용).
// 없는 로케일에 링크를 내면 404 라서 실제 getStaticPaths 와 같은 표를 둔다.
// 시즌이 지나면 이 표만 바꾸면 홈·서랍이 함께 바뀐다.
const SEASON: Record<Locale, { path: string; title: string }[]> = {
  ko: [
    { path: "/new-year-2027", title: "2027 신년운세" },
    { path: "/sunrise-2027", title: "새해 첫 일출 시각" },
    { path: "/tojeong-2027", title: "2027 토정비결" },
    { path: "/sebaetdon-2027", title: "설날 세뱃돈 계산" },
    { path: "/mandalart-2027", title: "2027 만다라트 계획표" },
    { path: "/calendar-2027", title: "2027 달력" },
  ],
  ja: [
    { path: "/new-year-2027", title: "2027年の運勢" },
    { path: "/oshogatsu-2027", title: "2027 お正月" },
    { path: "/sunrise-2027", title: "初日の出の時刻" },
    { path: "/setsubun-2027", title: "2027 節分" },
    { path: "/mandalart-2027", title: "マンダラチャート" },
  ],
  zh: [
    { path: "/new-year-2027", title: "2027 运势" },
    { path: "/chunjie-2027", title: "2027 春节" },
    { path: "/mandalart-2027", title: "曼陀罗九宫格" },
  ],
  en: [{ path: "/new-year-2027", title: "2027 horoscopes" }, { path: "/mandalart-2027", title: "Mandalart goal chart" }],
  fr: [{ path: "/new-year-2027", title: "Horoscope 2027" }, { path: "/mandalart-2027", title: "Mandalart 2027" }],
  es: [{ path: "/new-year-2027", title: "Horóscopo 2027" }, { path: "/mandalart-2027", title: "Mandalart 2027" }],
};

export const seasonHeading: L10n = { ko: "2027 새해 준비", en: "Getting ready for 2027", ja: "2027年の準備", zh: "迎接2027", fr: "Préparer 2027", es: "Preparando 2027" };

export function seasonLinks(locale: Locale): { href: string; title: string }[] {
  return (SEASON[locale] ?? SEASON.en).map((s) => ({ href: localePath(locale, s.path), title: s.title }));
}
