export interface SacredCity {
  id: string;
  longitude: number;
  name: Record<string, string>;
  timezone: string;
}

export const SACRED_CITIES: SacredCity[] = [
  {
    id: "seoul",
    longitude: 126.978,
    name: {
      zh: "首尔",
      en: "Seoul",
      es: "Seúl",
      fr: "Séoul",
      ja: "ソウル",
      ko: "서울",
    },
    timezone: "Asia/Seoul",
  },
  {
    id: "tokyo",
    longitude: 139.6917,
    name: {
      zh: "东京",
      en: "Tokyo",
      es: "Tokio",
      fr: "Tokyo",
      ja: "東京",
      ko: "도쿄",
    },
    timezone: "Asia/Tokyo",
  },
  {
    id: "beijing",
    longitude: 116.4074,
    name: {
      zh: "北京",
      en: "Beijing",
      es: "Pekín",
      fr: "Pékin",
      ja: "北京",
      ko: "베이징",
    },
    timezone: "Asia/Shanghai",
  },
  {
    id: "new_york",
    longitude: -74.006,
    name: {
      zh: "纽约",
      en: "New York",
      es: "Nueva York",
      fr: "New York",
      ja: "ニューヨーク",
      ko: "뉴욕",
    },
    timezone: "America/New_York",
  },
  {
    id: "london",
    longitude: -0.1278,
    name: {
      zh: "伦敦",
      en: "London",
      es: "Londres",
      fr: "Londres",
      ja: "ロンドン",
      ko: "런던",
    },
    timezone: "Europe/London",
  },
  {
    id: "paris",
    longitude: 2.3522,
    name: {
      zh: "巴黎",
      en: "Paris",
      es: "París",
      fr: "Paris",
      ja: "パリ",
      ko: "파리",
    },
    timezone: "Europe/Paris",
  },
  {
    id: "los_angeles",
    longitude: -118.2437,
    name: {
      zh: "洛杉矶",
      en: "Los Angeles",
      es: "Los Ángeles",
      fr: "Los Angeles",
      ja: "ロサンゼルス",
      ko: "로스앤젤레스",
    },
    timezone: "America/Los_Angeles",
  },
  {
    id: "sydney",
    longitude: 151.2093,
    name: {
      zh: "悉尼",
      en: "Sydney",
      es: "Sídney",
      fr: "Sydney",
      ja: "シドニー",
      ko: "시드니",
    },
    timezone: "Australia/Sydney",
  },
];
