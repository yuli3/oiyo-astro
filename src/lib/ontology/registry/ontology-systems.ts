// SSR-friendly catalog of ontology systems, grouped by the 3+4 IA lanes.
// This is the declarative "그릇" backbone: the dashboard maps over it instead of
// hand-wiring cards. Heavy per-system engines/narratives stay in OntologyClient
// (deep dive); this catalog drives the crawlable lane grid + input gating + the
// wiki/blog explanation bridge.
import type { Locale } from '../../../i18n';

export type Lane = 'innate' | 'test' | 'chosen';
export type Requires = 'birthDate' | 'birthTime' | 'name' | 'bloodType' | 'testResult' | 'none';

export interface OntologySystem {
  id: string;
  lane: Lane;
  emoji: string;
  /** localStorage signal the client uses to mark this recorded. */
  requires: Requires;
  /** test-results kind or testId to detect completion (lane 'test'). */
  testId?: string;
  /**
   * Ontology tool/route to open (locale-prefixed at render). Omit it when no
   * such route exists yet: four cards used to point at /ontology itself, so
   * clicking them reloaded the page the user was already on. A card with
   * nowhere to go now renders as an unclickable "planned" row instead, and is
   * left out of the completion denominator.
   */
  href?: (l: Locale) => string;
  /** wiki definition slug for the explanation bridge (P1-C / Lever 4). */
  wikiSlug?: string;
  name: Record<Locale, string>;
}

const L = (ko: string, en: string, ja: string, zh: string, fr: string, es: string): Record<Locale, string> =>
  ({ ko, en, ja, zh, fr, es });

// ── Lane 1: 타고난 것 (input-derived from birthdate/name/bloodtype) ──
const INNATE: OntologySystem[] = [
  { id: 'saju', lane: 'innate', emoji: '🔮', requires: 'birthDate', href: (l) => `/${l}/saju/calculator`, wikiSlug: 'meaning-of-saju-60gapja', name: L('사주팔자', 'Saju (Four Pillars)', '四柱推命', '四柱八字', 'Saju (Quatre Piliers)', 'Saju (Cuatro Pilares)') },
  { id: 'ohaeng', lane: 'innate', emoji: '🌳', requires: 'birthDate', href: (l) => `/${l}/saju/calculator`, name: L('오행·십성', 'Five Elements', '五行・十神', '五行十神', 'Cinq Éléments', 'Cinco Elementos') },
  { id: 'astrology', lane: 'innate', emoji: '♈', requires: 'birthDate', href: (l) => `/${l}/zodiac/personality`, wikiSlug: 'meaning-of-astrology', name: L('서양 점성술', 'Western Astrology', '西洋占星術', '西方占星', 'Astrologie occidentale', 'Astrología occidental') },
  { id: 'natal', lane: 'innate', emoji: '🌌', requires: 'birthTime', href: (l) => `/${l}/natal/chart`, wikiSlug: 'meaning-of-astrology', name: L('출생 차트', 'Natal Chart', '出生図', '出生星盘', 'Thème natal', 'Carta natal') },
  { id: 'chinese-zodiac', lane: 'innate', emoji: '🐉', requires: 'birthDate', href: (l) => `/${l}/chinese-zodiac`, wikiSlug: 'meaning-of-chinese-zodiac-dragon', name: L('띠(십이지)', 'Chinese Zodiac', '干支・十二支', '生肖', 'Zodiaque chinois', 'Zodíaco chino') },
  { id: 'ziwei', lane: 'innate', emoji: '⭐', requires: 'birthTime', name: L('자미두수', 'Zi Wei Dou Shu', '紫微斗数', '紫微斗数', 'Zi Wei Dou Shu', 'Zi Wei Dou Shu') },
  { id: 'numerology', lane: 'innate', emoji: '🔢', requires: 'birthDate', href: (l) => `/${l}/numerology/calculator`, wikiSlug: 'meaning-of-numerology', name: L('수비학', 'Numerology', '数秘術', '数字命理', 'Numérologie', 'Numerología') },
  { id: 'mayan', lane: 'innate', emoji: '🗿', requires: 'birthDate', name: L('마야 달력', 'Mayan (Tzolkin)', 'マヤ暦', '玛雅历', 'Maya (Tzolkin)', 'Maya (Tzolkin)') },
  { id: 'celtic', lane: 'innate', emoji: '🌲', requires: 'birthDate', name: L('켈트 나무점', 'Celtic Tree', 'ケルト樹木', '凯尔特树历', 'Arbre celtique', 'Árbol celta') },
  { id: 'biorhythm', lane: 'innate', emoji: '📈', requires: 'birthDate', href: (l) => `/${l}/today`, name: L('바이오리듬', 'Biorhythm', 'バイオリズム', '生物节律', 'Biorythme', 'Biorritmo') },
  { id: 'onomancy', lane: 'innate', emoji: '✍️', requires: 'name', href: (l) => `/${l}/onomancy`, name: L('성명학(이름)', 'Name (Onomancy)', '姓名判断', '姓名学', 'Onomancie (nom)', 'Onomancia (nombre)') },
  { id: 'blood-type', lane: 'innate', emoji: '🩸', requires: 'bloodType', href: (l) => `/${l}/blood-type`, wikiSlug: 'meaning-of-blood-type-a', name: L('혈액형', 'Blood Type', '血液型', '血型', 'Groupe sanguin', 'Grupo sanguíneo') },
  { id: 'palmistry', lane: 'innate', emoji: '🖐️', requires: 'none', href: (l) => `/${l}/palmistry/explore`, wikiSlug: 'meaning-of-palmistry', name: L('손금·관상', 'Palmistry', '手相', '手相', 'Chiromancie', 'Quiromancia') },
  { id: 'tarot', lane: 'innate', emoji: '🃏', requires: 'none', href: (l) => `/${l}/tarot/reading`, wikiSlug: 'meaning-of-tarot', name: L('타로', 'Tarot', 'タロット', '塔罗', 'Tarot', 'Tarot') },
];

// ── Lane 2: 테스트로 드러난 것 (require a questionnaire) ──
const TEST: OntologySystem[] = [
  { id: 'mbti', lane: 'test', emoji: '🧠', requires: 'testResult', testId: 'mbti', href: (l) => `/${l}/mbti/test`, wikiSlug: 'meaning-of-mbti', name: L('MBTI', 'MBTI', 'MBTI', 'MBTI', 'MBTI', 'MBTI') },
  { id: 'big5', lane: 'test', emoji: '🌊', requires: 'testResult', testId: 'big5', href: (l) => `/${l}/big5/test`, name: L('빅파이브', 'Big Five', 'ビッグファイブ', '大五人格', 'Big Five', 'Big Five') },
  { id: 'enneagram', lane: 'test', emoji: '🔵', requires: 'testResult', testId: 'enneagram', href: (l) => `/${l}/enneagram/test`, wikiSlug: 'meaning-of-enneagram', name: L('에니어그램', 'Enneagram', 'エニアグラム', '九型人格', 'Ennéagramme', 'Eneagrama') },
  { id: 'riasec', lane: 'test', emoji: '🧭', requires: 'testResult', testId: 'riasec', href: (l) => `/${l}/riasec-career-test`, wikiSlug: 'meaning-of-riasec', name: L('직업흥미(RIASEC)', 'RIASEC', 'RIASEC', 'RIASEC 霍兰德', 'RIASEC', 'RIASEC') },
  { id: 'riasec-quick', lane: 'test', emoji: '🧭', requires: 'testResult', testId: 'riasec-quick', href: (l) => `/${l}/riasec-quick`, wikiSlug: 'meaning-of-riasec', name: L('직업흥미 빠른검사', 'RIASEC (Quick)', 'RIASEC(クイック)', 'RIASEC 快速版', 'RIASEC (rapide)', 'RIASEC (rápido)') },
  { id: 'tci', lane: 'test', emoji: '🧬', requires: 'testResult', testId: 'tci', href: (l) => `/${l}/tci-personality-test`, name: L('기질·성격(TCI)', 'TCI', 'TCI気質', 'TCI气质', 'TCI', 'TCI') },
  { id: 'hexaco', lane: 'test', emoji: '⬡', requires: 'testResult', testId: 'hexaco', href: (l) => `/${l}/hexaco-personality-test`, name: L('HEXACO', 'HEXACO', 'HEXACO', 'HEXACO', 'HEXACO', 'HEXACO') },
  { id: 'political', lane: 'test', emoji: '🗳️', requires: 'testResult', testId: 'political', href: (l) => `/${l}/political/test`, name: L('정치성향', 'Political Values', '政治的傾向', '政治倾向', 'Valeurs politiques', 'Valores políticos') },
  { id: 'economics', lane: 'test', emoji: '📊', requires: 'testResult', testId: 'economics', href: (l) => `/${l}/economics-school-test`, name: L('경제관', 'Economic View', '経済観', '经济观', 'Vision économique', 'Visión económica') },
  { id: 'joseon', lane: 'test', emoji: '🏯', requires: 'testResult', testId: 'joseon', href: (l) => `/${l}/joseon-faction-test`, name: L('조선붕당', 'Joseon Factions', '朝鮮の党派', '朝鲜党派', 'Factions Joseon', 'Facciones Joseon') },
];

// ── Lane 3: 실제 나의 것 (self-chosen — mindmap builder) ──
const CHOSEN: OntologySystem[] = [
  { id: 'keywords', lane: 'chosen', emoji: '🏷️', requires: 'none', href: (l) => `/${l}/ontology`, name: L('강점 키워드', 'Strength Keywords', '強みキーワード', '优势关键词', 'Mots-clés forces', 'Palabras clave') },
  { id: 'activities', lane: 'chosen', emoji: '🎯', requires: 'none', href: (l) => `/${l}/ontology`, name: L('하고 싶은 활동', 'Activities', 'やりたい活動', '想做的活动', 'Activités', 'Actividades') },
  { id: 'values', lane: 'chosen', emoji: '💎', requires: 'none', href: (l) => `/${l}/ontology`, name: L('가치관', 'Values', '価値観', '价值观', 'Valeurs', 'Valores') },
  { id: 'life-sentence', lane: 'chosen', emoji: '📜', requires: 'none', href: (l) => `/${l}/ontology`, name: L('삶의 문장', 'Life Sentence', '人生の一文', '人生格言', 'Phrase de vie', 'Frase de vida') },
];

export const ONTOLOGY_SYSTEMS: OntologySystem[] = [...INNATE, ...TEST, ...CHOSEN];
export const laneOf = (lane: Lane) => ONTOLOGY_SYSTEMS.filter((s) => s.lane === lane);

export const LANE_META: Record<Lane, { emoji: string; name: Record<Locale, string>; sub: Record<Locale, string> }> = {
  innate: { emoji: '🌱', name: L('타고난 것', 'What you were born with', '生まれ持ったもの', '与生俱来', 'Ce qui est inné', 'Lo innato'), sub: L('생년월일·시간·이름에서 계산되는 좌표', 'Coordinates from your birth date, time & name', '生年月日・時間・名前から', '来自生辰与姓名', 'À partir de votre naissance', 'A partir de tu nacimiento') },
  test: { emoji: '🧪', name: L('테스트로 드러난 것', 'What tests reveal', 'テストで分かるもの', '测验揭示', 'Ce que les tests révèlent', 'Lo que revelan los tests'), sub: L('검사 결과로 확인되는 좌표', 'Coordinates confirmed by assessments', '検査結果で確認', '由测验确认', 'Confirmé par les tests', 'Confirmado por tests') },
  chosen: { emoji: '🎨', name: L('실제 나의 것', 'What you choose', '実際の自分', '真实的我', 'Ce que vous choisissez', 'Lo que eliges'), sub: L('내가 직접 고르는 좌표', 'Coordinates you choose yourself', '自分で選ぶ', '你自己选择', 'Vous les choisissez', 'Tú los eliges') },
};
