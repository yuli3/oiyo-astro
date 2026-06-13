import type { SignKey } from './calculator';

export type NatalLocale = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es';

export interface SignInfo {
  emoji: string;
  element: 'fire' | 'earth' | 'air' | 'water';
  /** Display name per locale. */
  name: Record<NatalLocale, string>;
  /** One-line trait per locale (short). */
  trait: Record<NatalLocale, string>;
}

export const SIGN_INFO: Record<SignKey, SignInfo> = {
  aries: {
    emoji: '♈', element: 'fire',
    name: { ko: '양자리', en: 'Aries', ja: '牡羊座', zh: '白羊座', fr: 'Bélier', es: 'Aries' },
    trait: { ko: '추진력 있고 직진하는', en: 'bold and pioneering', ja: '行動的で先駆的な', zh: '果敢而开拓的', fr: 'audacieux et pionnier', es: 'audaz y pionero' },
  },
  taurus: {
    emoji: '♉', element: 'earth',
    name: { ko: '황소자리', en: 'Taurus', ja: '牡牛座', zh: '金牛座', fr: 'Taureau', es: 'Tauro' },
    trait: { ko: '안정적이고 끈기 있는', en: 'steady and grounded', ja: '安定して粘り強い', zh: '稳定而坚韧的', fr: 'stable et tenace', es: 'estable y constante' },
  },
  gemini: {
    emoji: '♊', element: 'air',
    name: { ko: '쌍둥이자리', en: 'Gemini', ja: '双子座', zh: '双子座', fr: 'Gémeaux', es: 'Géminis' },
    trait: { ko: '호기심 많고 재치 있는', en: 'curious and quick-witted', ja: '好奇心旺盛で機知に富む', zh: '好奇而机敏的', fr: 'curieux et vif', es: 'curioso e ingenioso' },
  },
  cancer: {
    emoji: '♋', element: 'water',
    name: { ko: '게자리', en: 'Cancer', ja: '蟹座', zh: '巨蟹座', fr: 'Cancer', es: 'Cáncer' },
    trait: { ko: '다정하고 보호하는', en: 'caring and protective', ja: '思いやり深く守る', zh: '体贴而守护的', fr: 'attentionné et protecteur', es: 'afectuoso y protector' },
  },
  leo: {
    emoji: '♌', element: 'fire',
    name: { ko: '사자자리', en: 'Leo', ja: '獅子座', zh: '狮子座', fr: 'Lion', es: 'Leo' },
    trait: { ko: '당당하고 따뜻한', en: 'confident and warm', ja: '堂々として温かい', zh: '自信而温暖的', fr: 'confiant et chaleureux', es: 'seguro y cálido' },
  },
  virgo: {
    emoji: '♍', element: 'earth',
    name: { ko: '처녀자리', en: 'Virgo', ja: '乙女座', zh: '处女座', fr: 'Vierge', es: 'Virgo' },
    trait: { ko: '섬세하고 분석적인', en: 'precise and analytical', ja: '繊細で分析的な', zh: '细致而分析的', fr: 'précis et analytique', es: 'meticuloso y analítico' },
  },
  libra: {
    emoji: '♎', element: 'air',
    name: { ko: '천칭자리', en: 'Libra', ja: '天秤座', zh: '天秤座', fr: 'Balance', es: 'Libra' },
    trait: { ko: '균형 잡힌 조화로운', en: 'balanced and harmonious', ja: 'バランスが取れ調和的な', zh: '平衡而和谐的', fr: 'équilibré et harmonieux', es: 'equilibrado y armonioso' },
  },
  scorpio: {
    emoji: '♏', element: 'water',
    name: { ko: '전갈자리', en: 'Scorpio', ja: '蠍座', zh: '天蝎座', fr: 'Scorpion', es: 'Escorpio' },
    trait: { ko: '깊이 있고 강렬한', en: 'intense and deep', ja: '深く強烈な', zh: '深刻而强烈的', fr: 'intense et profond', es: 'intenso y profundo' },
  },
  sagittarius: {
    emoji: '♐', element: 'fire',
    name: { ko: '사수자리', en: 'Sagittarius', ja: '射手座', zh: '射手座', fr: 'Sagittaire', es: 'Sagitario' },
    trait: { ko: '자유롭고 모험적인', en: 'free-spirited and adventurous', ja: '自由で冒険的な', zh: '自由而冒险的', fr: 'libre et aventureux', es: 'libre y aventurero' },
  },
  capricorn: {
    emoji: '♑', element: 'earth',
    name: { ko: '염소자리', en: 'Capricorn', ja: '山羊座', zh: '摩羯座', fr: 'Capricorne', es: 'Capricornio' },
    trait: { ko: '성실하고 책임감 강한', en: 'disciplined and responsible', ja: '誠実で責任感が強い', zh: '自律而负责的', fr: 'discipliné et responsable', es: 'disciplinado y responsable' },
  },
  aquarius: {
    emoji: '♒', element: 'air',
    name: { ko: '물병자리', en: 'Aquarius', ja: '水瓶座', zh: '水瓶座', fr: 'Verseau', es: 'Acuario' },
    trait: { ko: '독창적이고 자유로운', en: 'original and independent', ja: '独創的で自由な', zh: '独创而独立的', fr: 'original et indépendant', es: 'original e independiente' },
  },
  pisces: {
    emoji: '♓', element: 'water',
    name: { ko: '물고기자리', en: 'Pisces', ja: '魚座', zh: '双鱼座', fr: 'Poissons', es: 'Piscis' },
    trait: { ko: '공감 능력 있고 상상력 풍부한', en: 'empathic and imaginative', ja: '共感力豊かで想像的な', zh: '富有同理心而想象力丰富的', fr: 'empathique et imaginatif', es: 'empático e imaginativo' },
  },
};

// Curated birthplaces: { label, latitude (N+), longitude (E+), standard UTC offset hours }.
// Offset is the location's standard (non-DST) zone; users can fine-tune time if needed.
export interface City {
  id: string;
  label: Record<NatalLocale, string>;
  lat: number;
  lon: number;
  tz: number;
}

export const CITIES: City[] = [
  { id: 'seoul', label: { ko: '서울', en: 'Seoul', ja: 'ソウル', zh: '首尔', fr: 'Séoul', es: 'Seúl' }, lat: 37.5665, lon: 126.978, tz: 9 },
  { id: 'busan', label: { ko: '부산', en: 'Busan', ja: '釜山', zh: '釜山', fr: 'Busan', es: 'Busan' }, lat: 35.1796, lon: 129.0756, tz: 9 },
  { id: 'tokyo', label: { ko: '도쿄', en: 'Tokyo', ja: '東京', zh: '东京', fr: 'Tokyo', es: 'Tokio' }, lat: 35.6762, lon: 139.6503, tz: 9 },
  { id: 'osaka', label: { ko: '오사카', en: 'Osaka', ja: '大阪', zh: '大阪', fr: 'Osaka', es: 'Osaka' }, lat: 34.6937, lon: 135.5023, tz: 9 },
  { id: 'beijing', label: { ko: '베이징', en: 'Beijing', ja: '北京', zh: '北京', fr: 'Pékin', es: 'Pekín' }, lat: 39.9042, lon: 116.4074, tz: 8 },
  { id: 'shanghai', label: { ko: '상하이', en: 'Shanghai', ja: '上海', zh: '上海', fr: 'Shanghai', es: 'Shanghái' }, lat: 31.2304, lon: 121.4737, tz: 8 },
  { id: 'taipei', label: { ko: '타이베이', en: 'Taipei', ja: '台北', zh: '台北', fr: 'Taipei', es: 'Taipéi' }, lat: 25.033, lon: 121.5654, tz: 8 },
  { id: 'hongkong', label: { ko: '홍콩', en: 'Hong Kong', ja: '香港', zh: '香港', fr: 'Hong Kong', es: 'Hong Kong' }, lat: 22.3193, lon: 114.1694, tz: 8 },
  { id: 'singapore', label: { ko: '싱가포르', en: 'Singapore', ja: 'シンガポール', zh: '新加坡', fr: 'Singapour', es: 'Singapur' }, lat: 1.3521, lon: 103.8198, tz: 8 },
  { id: 'bangkok', label: { ko: '방콕', en: 'Bangkok', ja: 'バンコク', zh: '曼谷', fr: 'Bangkok', es: 'Bangkok' }, lat: 13.7563, lon: 100.5018, tz: 7 },
  { id: 'delhi', label: { ko: '뉴델리', en: 'New Delhi', ja: 'ニューデリー', zh: '新德里', fr: 'New Delhi', es: 'Nueva Delhi' }, lat: 28.6139, lon: 77.209, tz: 5.5 },
  { id: 'dubai', label: { ko: '두바이', en: 'Dubai', ja: 'ドバイ', zh: '迪拜', fr: 'Dubaï', es: 'Dubái' }, lat: 25.2048, lon: 55.2708, tz: 4 },
  { id: 'london', label: { ko: '런던', en: 'London', ja: 'ロンドン', zh: '伦敦', fr: 'Londres', es: 'Londres' }, lat: 51.5074, lon: -0.1278, tz: 0 },
  { id: 'paris', label: { ko: '파리', en: 'Paris', ja: 'パリ', zh: '巴黎', fr: 'Paris', es: 'París' }, lat: 48.8566, lon: 2.3522, tz: 1 },
  { id: 'berlin', label: { ko: '베를린', en: 'Berlin', ja: 'ベルリン', zh: '柏林', fr: 'Berlin', es: 'Berlín' }, lat: 52.52, lon: 13.405, tz: 1 },
  { id: 'madrid', label: { ko: '마드리드', en: 'Madrid', ja: 'マドリード', zh: '马德里', fr: 'Madrid', es: 'Madrid' }, lat: 40.4168, lon: -3.7038, tz: 1 },
  { id: 'moscow', label: { ko: '모스크바', en: 'Moscow', ja: 'モスクワ', zh: '莫斯科', fr: 'Moscou', es: 'Moscú' }, lat: 55.7558, lon: 37.6173, tz: 3 },
  { id: 'newyork', label: { ko: '뉴욕', en: 'New York', ja: 'ニューヨーク', zh: '纽约', fr: 'New York', es: 'Nueva York' }, lat: 40.7128, lon: -74.006, tz: -5 },
  { id: 'losangeles', label: { ko: '로스앤젤레스', en: 'Los Angeles', ja: 'ロサンゼルス', zh: '洛杉矶', fr: 'Los Angeles', es: 'Los Ángeles' }, lat: 34.0522, lon: -118.2437, tz: -8 },
  { id: 'sydney', label: { ko: '시드니', en: 'Sydney', ja: 'シドニー', zh: '悉尼', fr: 'Sydney', es: 'Sídney' }, lat: -33.8688, lon: 151.2093, tz: 10 },
  { id: 'saopaulo', label: { ko: '상파울루', en: 'São Paulo', ja: 'サンパウロ', zh: '圣保罗', fr: 'São Paulo', es: 'São Paulo' }, lat: -23.5505, lon: -46.6333, tz: -3 },
  { id: 'mexicocity', label: { ko: '멕시코시티', en: 'Mexico City', ja: 'メキシコシティ', zh: '墨西哥城', fr: 'Mexico', es: 'Ciudad de México' }, lat: 19.4326, lon: -99.1332, tz: -6 },
];
