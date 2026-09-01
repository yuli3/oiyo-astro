import type { Locale } from '../../../i18n';

export const JOURNEY_IDS = ['personality', 'hobbies', 'life-purpose', 'luck'] as const;

export type JourneyId = (typeof JOURNEY_IDS)[number];

const MAP_LABEL: Record<Locale, string> = {
  ko: '전체 지도',
  en: 'Full map',
  ja: '全体マップ',
  zh: '完整地图',
  fr: 'Carte complète',
  es: 'Mapa completo',
};

const ZONE_LABEL: Record<JourneyId, Record<Locale, string>> = {
  personality: {
    ko: '내 지도의 성격 구역',
    en: 'Personality area of my map',
    ja: '私の地図の性格エリア',
    zh: '我的地图·性格区域',
    fr: 'Zone personnalité de ma carte',
    es: 'Zona de personalidad de mi mapa',
  },
  hobbies: {
    ko: '내 지도의 취미 구역',
    en: 'Hobbies area of my map',
    ja: '私の地図の趣味エリア',
    zh: '我的地图·兴趣区域',
    fr: 'Zone loisirs de ma carte',
    es: 'Zona de aficiones de mi mapa',
  },
  'life-purpose': {
    ko: '내 지도의 삶의 방향 구역',
    en: 'Life-purpose area of my map',
    ja: '私の地図の生きる目的エリア',
    zh: '我的地图·人生方向区域',
    fr: 'Zone sens de la vie de ma carte',
    es: 'Zona de propósito vital de mi mapa',
  },
  luck: {
    ko: '내 지도의 행운 구역',
    en: 'Luck area of my map',
    ja: '私の地図の運のエリア',
    zh: '我的地图·运势区域',
    fr: 'Zone chance de ma carte',
    es: 'Zona de suerte de mi mapa',
  },
};

export function journeyNavigation(locale: Locale, journeyId: JourneyId) {
  return {
    mapHref: `/${locale}/ontology/`,
    mapLabel: MAP_LABEL[locale],
    zoneLabel: ZONE_LABEL[journeyId][locale],
  };
}
