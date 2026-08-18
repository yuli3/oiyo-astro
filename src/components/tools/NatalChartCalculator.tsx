import { useEffect, useMemo, useState } from 'react';
import ShareResultButton from '../shared/ShareResultButton';
import CopyResultLink from '../shared/CopyResultLink';
import { BirthDateField, BirthTimeField } from '../shared/BirthDateField';
import { computeNatalChart, type NatalChart } from '../../lib/ontology/natal/calculator';
import { SIGN_INFO, CITIES, type NatalLocale } from '../../lib/ontology/natal/signs';
// `readResultCode` is kept for one thing only: reading pre-T6 `?d=&c=&t=`
// share links that may still be circulating, so they never 404. Natal no
// longer *writes* the query-param scheme — see the hash migration effect
// below and company-brain/AI-Sessions/wiki/decisions/oiyo-result-permalink-hash.md
// (2026-07-09 addendum: birth date/place/time in a plaintext query string is
// a PII surface for AI crawlers, which respect canonical less than search
// engines do).
import { readResultCode } from '../../lib/result-url';
import { decodeResult, writeResultHash } from '../../lib/result-permalink';
import { useProfilePrefill } from '../../lib/user/useProfilePrefill';
import { createBirthRecord, resolveZonedCivilTime } from '../../lib/user/birth-record';
import { gaEvent } from '../../lib/analytics/ga-event';

interface Props {
  locale: string;
}

// T6/#32 permalink tool id — must stay stable, it is embedded in shared URLs.
const PERMALINK_TOOL_ID = 'natal-chart';
// Birth date/time/place fully determine the chart (see `compute` below), so
// that is all the permalink needs to encode. `time: null` means "unknown".
interface PermalinkState {
  date: string;
  time: string | null;
  city: string;
}

const PRIVACY_NOTE: Record<NatalLocale, string> = {
  ko: '이 링크에는 입력한 생년월일·출생지·시각 정보가 포함됩니다.',
  en: 'This link contains the birth date, place, and time you entered.',
  ja: 'このリンクには入力した生年月日・出生地・時刻の情報が含まれます。',
  zh: '此链接包含您输入的出生日期、地点与时间信息。',
  fr: 'Ce lien contient la date, le lieu et l’heure de naissance que vous avez saisis.',
  es: 'Este enlace contiene la fecha, el lugar y la hora de nacimiento que ingresaste.',
};

const COPY: Record<NatalLocale, {
  title: string;
  subtitle: string;
  dateLabel: string;
  timeLabel: string;
  unknownTime: string;
  cityLabel: string;
  cityPlaceholder: string;
  submit: string;
  retake: string;
  needDate: string;
  needCity: string;
  timeZoneIssue: string;
  sun: string; sunSub: string;
  moon: string; moonSub: string;
  asc: string; ascSub: string;
  mercury: string; mercurySub: string;
  venus: string; venusSub: string;
  mars: string; marsSub: string;
  jupiter: string; jupiterSub: string;
  saturn: string; saturnSub: string;
  uranus: string; uranusSub: string;
  neptune: string; neptuneSub: string;
  pluto: string; plutoSub: string;
  ascNeedsTime: string;
  moonNote: string;
  retro: string;
  method: string;
  disclaimer: string;
  resultHeading: string;
  readMore: string;
  zodiacLink: string;
  degIn: (deg: string, sign: string) => string;
}> = {
  ko: {
    title: '출생 차트 — 태양·달·상승궁',
    subtitle: '생년월일·태어난 시각·출생지를 입력하면 점성술의 핵심 세 가지(태양·달·상승궁)를 계산합니다.',
    dateLabel: '생년월일', timeLabel: '태어난 시각', unknownTime: '시간 모름',
    cityLabel: '출생지', cityPlaceholder: '도시 선택',
    submit: '내 차트 보기', retake: '다시 입력',
    needDate: '생년월일을 입력해 주세요.', needCity: '출생지를 선택해 주세요.',
    timeZoneIssue: '이 시각은 출생지의 서머타임 전환과 겹칩니다. 시간을 모름으로 선택하거나 인접한 정확한 시각을 확인해 주세요.',
    sun: '태양', sunSub: '핵심 자아·정체성',
    moon: '달', moonSub: '감정·내면',
    asc: '상승궁', ascSub: '첫인상·겉으로 드러나는 태도',
    mercury: '수성', mercurySub: '사고·소통의 방식',
    venus: '금성', venusSub: '사랑·취향·끌림',
    mars: '화성', marsSub: '추진력·욕망·행동',
    jupiter: '목성', jupiterSub: '확장·행운·성장의 방향',
    saturn: '토성', saturnSub: '책임·한계·숙련의 과제',
    uranus: '천왕성', uranusSub: '변화·독창성·자유 (세대)',
    neptune: '해왕성', neptuneSub: '꿈·영성·상상 (세대)',
    pluto: '명왕성', plutoSub: '변형·재생·심층의 힘 (세대)',
    ascNeedsTime: '상승궁은 태어난 시각이 있어야 계산할 수 있어요.',
    moonNote: '시간을 모를 경우 달 별자리는 정오 기준 근사치이며, 별자리 경계 근처에서는 달라질 수 있습니다.',
    retro: '역행',
    method: '계산 방법: 행성 위치를 Meeus·Schlyter 천문 알고리즘으로 직접 계산하고 천체력과 대조 검증했습니다. (결과를 짐작하는 블랙박스가 아닙니다.)',
    disclaimer: '점성술은 자기 이해와 사색을 위한 상징 체계이며, 운명을 단정하는 도구가 아닙니다.',
    resultHeading: '나의 출생 차트',
    readMore: '점성술 사전에서 더 읽기 →',
    zodiacLink: '별자리 성격 자세히 보기 →',
    degIn: (deg, sign) => `${sign} ${deg}°`,
  },
  en: {
    title: 'Natal Chart — Sun, Moon & Rising',
    subtitle: 'Enter your birth date, time, and place to compute the three core points of astrology: Sun, Moon, and Rising sign.',
    dateLabel: 'Birth date', timeLabel: 'Birth time', unknownTime: 'Unknown time',
    cityLabel: 'Birthplace', cityPlaceholder: 'Select a city',
    submit: 'View my chart', retake: 'Start over',
    needDate: 'Please enter your birth date.', needCity: 'Please choose your birthplace.',
    timeZoneIssue: 'This local time overlaps a daylight-saving transition. Choose unknown time or confirm a nearby unambiguous time.',
    sun: 'Sun', sunSub: 'Core self & identity',
    moon: 'Moon', moonSub: 'Emotions & inner world',
    asc: 'Rising', ascSub: 'Outer style & first impression',
    mercury: 'Mercury', mercurySub: 'How you think & communicate',
    venus: 'Venus', venusSub: 'Love, taste & attraction',
    mars: 'Mars', marsSub: 'Drive, desire & action',
    jupiter: 'Jupiter', jupiterSub: 'Growth, luck & expansion',
    saturn: 'Saturn', saturnSub: 'Responsibility, limits & mastery',
    uranus: 'Uranus', uranusSub: 'Change, originality & freedom (generational)',
    neptune: 'Neptune', neptuneSub: 'Dreams, spirituality & imagination (generational)',
    pluto: 'Pluto', plutoSub: 'Transformation, rebirth & depth (generational)',
    ascNeedsTime: 'The Rising sign needs a birth time to be calculated.',
    moonNote: 'Without a birth time, the Moon sign is a noon-based approximation and may differ near sign boundaries.',
    retro: 'Retrograde',
    method: 'How it’s computed: planetary positions are calculated directly with Meeus/Schlyter astronomical algorithms and cross-checked against an ephemeris — not a black box.',
    disclaimer: 'Astrology is a symbolic language for self-reflection, not a tool that fixes your fate.',
    resultHeading: 'My natal chart',
    readMore: 'Read more in the astrology dictionary →',
    zodiacLink: 'See zodiac personality in detail →',
    degIn: (deg, sign) => `${sign} ${deg}°`,
  },
  ja: {
    title: '出生図 — 太陽・月・上昇宮',
    subtitle: '生年月日・生まれた時刻・出生地を入力すると、占星術の核となる三つ（太陽・月・上昇宮）を計算します。',
    dateLabel: '生年月日', timeLabel: '生まれた時刻', unknownTime: '時刻不明',
    cityLabel: '出生地', cityPlaceholder: '都市を選択',
    submit: '私のチャートを見る', retake: '入力し直す',
    needDate: '生年月日を入力してください。', needCity: '出生地を選択してください。',
    timeZoneIssue: 'この時刻は出生地のサマータイム切替と重なります。「時刻不明」を選ぶか、曖昧でない時刻を確認してください。',
    sun: '太陽', sunSub: '核となる自己・アイデンティティ',
    moon: '月', moonSub: '感情・内面',
    asc: '上昇宮', ascSub: '第一印象・外に現れる態度',
    mercury: '水星', mercurySub: '思考・コミュニケーションの仕方',
    venus: '金星', venusSub: '愛・好み・惹かれ方',
    mars: '火星', marsSub: '推進力・欲望・行動',
    jupiter: '木星', jupiterSub: '拡大・幸運・成長の方向',
    saturn: '土星', saturnSub: '責任・限界・熟練の課題',
    uranus: '天王星', uranusSub: '変化・独創性・自由（世代）',
    neptune: '海王星', neptuneSub: '夢・霊性・想像（世代）',
    pluto: '冥王星', plutoSub: '変容・再生・深層の力（世代）',
    ascNeedsTime: '上昇宮の計算には生まれた時刻が必要です。',
    moonNote: '時刻が不明な場合、月星座は正午基準の近似値で、星座の境界付近では変わることがあります。',
    retro: '逆行',
    method: '計算方法: 惑星の位置をMeeus・Schlyterの天文アルゴリズムで直接計算し、天体暦と照合して検証しています（ブラックボックスではありません）。',
    disclaimer: '占星術は自己理解と内省のための象徴体系であり、運命を断定する道具ではありません。',
    resultHeading: '私の出生図',
    readMore: '占星術辞典でさらに読む →',
    zodiacLink: '星座の性格を詳しく見る →',
    degIn: (deg, sign) => `${sign} ${deg}°`,
  },
  zh: {
    title: '出生星盘 — 太阳·月亮·上升',
    subtitle: '输入出生日期、时间与地点，计算占星学的三大核心：太阳、月亮与上升星座。',
    dateLabel: '出生日期', timeLabel: '出生时间', unknownTime: '时间未知',
    cityLabel: '出生地', cityPlaceholder: '选择城市',
    submit: '查看我的星盘', retake: '重新输入',
    needDate: '请输入出生日期。', needCity: '请选择出生地。',
    timeZoneIssue: '该当地时间与夏令时切换重叠。请选择时间未知，或确认一个无歧义的相邻时间。',
    sun: '太阳', sunSub: '核心自我·身份',
    moon: '月亮', moonSub: '情感·内在',
    asc: '上升', ascSub: '第一印象·外在态度',
    mercury: '水星', mercurySub: '思维与沟通方式',
    venus: '金星', venusSub: '爱情·品味·吸引力',
    mars: '火星', marsSub: '动力·欲望·行动',
    jupiter: '木星', jupiterSub: '扩展·幸运·成长方向',
    saturn: '土星', saturnSub: '责任·限制·磨砺课题',
    uranus: '天王星', uranusSub: '变革·独创·自由（世代）',
    neptune: '海王星', neptuneSub: '梦想·灵性·想象（世代）',
    pluto: '冥王星', plutoSub: '蜕变·重生·深层力量（世代）',
    ascNeedsTime: '上升星座需要出生时间才能计算。',
    moonNote: '若不知出生时间，月亮星座为正午近似值，在星座边界附近可能不同。',
    retro: '逆行',
    method: '计算方式：行星位置以 Meeus／Schlyter 天文算法直接计算，并与星历表交叉校验，并非黑箱。',
    disclaimer: '占星学是用于自我理解与省思的象征体系，并非断定命运的工具。',
    resultHeading: '我的出生星盘',
    readMore: '在占星辞典中阅读更多 →',
    zodiacLink: '查看星座性格详情 →',
    degIn: (deg, sign) => `${sign} ${deg}°`,
  },
  fr: {
    title: 'Thème natal — Soleil, Lune et Ascendant',
    subtitle: 'Saisissez votre date, heure et lieu de naissance pour calculer les trois points clés de l’astrologie : Soleil, Lune et Ascendant.',
    dateLabel: 'Date de naissance', timeLabel: 'Heure de naissance', unknownTime: 'Heure inconnue',
    cityLabel: 'Lieu de naissance', cityPlaceholder: 'Choisir une ville',
    submit: 'Voir mon thème', retake: 'Recommencer',
    needDate: 'Veuillez saisir votre date de naissance.', needCity: 'Veuillez choisir votre lieu de naissance.',
    timeZoneIssue: 'Cette heure locale chevauche un changement d’heure. Choisissez heure inconnue ou confirmez une heure voisine non ambiguë.',
    sun: 'Soleil', sunSub: 'Identité et moi profond',
    moon: 'Lune', moonSub: 'Émotions et monde intérieur',
    asc: 'Ascendant', ascSub: 'Style extérieur et première impression',
    mercury: 'Mercure', mercurySub: 'Façon de penser et communiquer',
    venus: 'Vénus', venusSub: 'Amour, goûts et attirance',
    mars: 'Mars', marsSub: 'Élan, désir et action',
    jupiter: 'Jupiter', jupiterSub: 'Croissance, chance et expansion',
    saturn: 'Saturne', saturnSub: 'Responsabilité, limites et maîtrise',
    uranus: 'Uranus', uranusSub: 'Changement, originalité et liberté (générationnel)',
    neptune: 'Neptune', neptuneSub: 'Rêves, spiritualité et imagination (générationnel)',
    pluto: 'Pluton', plutoSub: 'Transformation, renaissance et profondeur (générationnel)',
    ascNeedsTime: 'L’Ascendant nécessite une heure de naissance.',
    moonNote: 'Sans heure de naissance, le signe lunaire est une approximation à midi et peut varier près des limites de signe.',
    retro: 'Rétrograde',
    method: 'Méthode : les positions planétaires sont calculées directement avec les algorithmes astronomiques de Meeus/Schlyter et vérifiées par éphéméride — pas une boîte noire.',
    disclaimer: 'L’astrologie est un langage symbolique de réflexion personnelle, non un outil qui fixe le destin.',
    resultHeading: 'Mon thème natal',
    readMore: 'En savoir plus dans le dictionnaire d’astrologie →',
    zodiacLink: 'Voir la personnalité du signe en détail →',
    degIn: (deg, sign) => `${sign} ${deg}°`,
  },
  es: {
    title: 'Carta natal — Sol, Luna y Ascendente',
    subtitle: 'Introduce tu fecha, hora y lugar de nacimiento para calcular los tres puntos clave de la astrología: Sol, Luna y Ascendente.',
    dateLabel: 'Fecha de nacimiento', timeLabel: 'Hora de nacimiento', unknownTime: 'Hora desconocida',
    cityLabel: 'Lugar de nacimiento', cityPlaceholder: 'Elige una ciudad',
    submit: 'Ver mi carta', retake: 'Empezar de nuevo',
    needDate: 'Introduce tu fecha de nacimiento.', needCity: 'Elige tu lugar de nacimiento.',
    timeZoneIssue: 'Esta hora local coincide con un cambio de horario de verano. Elige hora desconocida o confirma una hora cercana no ambigua.',
    sun: 'Sol', sunSub: 'Identidad y yo esencial',
    moon: 'Luna', moonSub: 'Emociones y mundo interior',
    asc: 'Ascendente', ascSub: 'Estilo exterior y primera impresión',
    mercury: 'Mercurio', mercurySub: 'Cómo piensas y te comunicas',
    venus: 'Venus', venusSub: 'Amor, gustos y atracción',
    mars: 'Marte', marsSub: 'Impulso, deseo y acción',
    jupiter: 'Júpiter', jupiterSub: 'Crecimiento, suerte y expansión',
    saturn: 'Saturno', saturnSub: 'Responsabilidad, límites y maestría',
    uranus: 'Urano', uranusSub: 'Cambio, originalidad y libertad (generacional)',
    neptune: 'Neptuno', neptuneSub: 'Sueños, espiritualidad e imaginación (generacional)',
    pluto: 'Plutón', plutoSub: 'Transformación, renacimiento y profundidad (generacional)',
    ascNeedsTime: 'El Ascendente necesita una hora de nacimiento para calcularse.',
    moonNote: 'Sin hora de nacimiento, el signo lunar es una aproximación al mediodía y puede variar cerca de los límites de signo.',
    retro: 'Retrógrado',
    method: 'Cómo se calcula: las posiciones planetarias se calculan directamente con algoritmos astronómicos de Meeus/Schlyter y se cotejan con una efeméride — no es una caja negra.',
    disclaimer: 'La astrología es un lenguaje simbólico para la reflexión personal, no una herramienta que fija el destino.',
    resultHeading: 'Mi carta natal',
    readMore: 'Leer más en el diccionario de astrología →',
    zodiacLink: 'Ver la personalidad del signo en detalle →',
    degIn: (deg, sign) => `${sign} ${deg}°`,
  },
};

const ELEMENT_BG: Record<string, string> = {
  fire: 'bg-orange-50 border-orange-200',
  earth: 'bg-amber-50 border-amber-200',
  air: 'bg-sky-50 border-sky-200',
  water: 'bg-indigo-50 border-indigo-200',
};

interface FormState { date: string; time: string; unknown: boolean; city: string; }

export default function NatalChartCalculator({ locale }: Props) {
  const t = COPY[(locale as NatalLocale)] ?? COPY.en;
  const loc = (Object.prototype.hasOwnProperty.call(COPY, locale) ? locale : 'en') as NatalLocale;

  const [form, setForm] = useState<FormState>({ date: '', time: '', unknown: false, city: '' });
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ chart: NatalChart; hasTime: boolean } | null>(null);

  // 온톨로지 프로필의 생년월일·시·출생지를 재사용(URL 복원이 없을 때만) — 재입력 제거.
  const { parsed, saveBirthRecord, profile, setProfile } = useProfilePrefill();
  useEffect(() => {
    if (!parsed) return;
    setForm((f) => {
      if (f.date || window.location.hash.startsWith('#r=') || readResultCode('d')) return f; // URL 복원(해시/레거시 쿼리)·기존 입력 우선
      const date = `${parsed.year}-${String(parsed.month).padStart(2, '0')}-${String(parsed.day).padStart(2, '0')}`;
      const hasHour = parsed.hour !== null;
      const city = !f.city && profile.birthCityId && CITIES.some((x) => x.id === profile.birthCityId)
        ? profile.birthCityId
        : f.city;
      return { ...f, date, time: hasHour ? `${String(parsed.hour).padStart(2, '0')}:${String(parsed.minute ?? 0).padStart(2, '0')}` : '', unknown: !hasHour, city };
    });
  }, [parsed, profile.birthCityId]);

  // Restore a shared chart on mount. Two sources, tried in order:
  // 1) `#r=` permalink hash (T6/#32) — the current scheme, never sent to the
  //    server, so it carries no PII exposure.
  // 2) Legacy `?d=YYYY-MM-DD&t=HH:MM&c=cityId` query params (pre-T6 links
  //    that may still be shared around). If found, restore from them exactly
  //    as before, then migrate the URL in place: write the same state into
  //    the `#r=` hash and strip the plaintext query keys, so the address bar
  //    never keeps showing birth date/time/place. See T6 addendum decision.
  useEffect(() => {
    const decoded = decodeResult<PermalinkState>(window.location.hash);
    if (decoded?.toolId === PERMALINK_TOOL_ID && decoded.state) {
      const s = decoded.state;
      const city = CITIES.find((x) => x.id === s.city);
      if (city && /^\d{4}-\d{2}-\d{2}$/.test(s.date)) {
        const hasTime = !!s.time && /^\d{2}:\d{2}$/.test(s.time);
        setForm({ date: s.date, time: hasTime ? s.time! : '', unknown: !hasTime, city: s.city });
        compute(s.date, hasTime ? s.time! : '', city, hasTime);
      }
      return;
    }

    const d = readResultCode('d');
    const c = readResultCode('c');
    if (!d || !c) return;
    const city = CITIES.find((x) => x.id === c);
    if (!city || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return;
    const time = readResultCode('t');
    const hasTime = !!time && /^\d{2}:\d{2}$/.test(time);
    setForm({ date: d, time: hasTime ? time! : '', unknown: !hasTime, city: c });
    compute(d, hasTime ? time! : '', city, hasTime);

    writeResultHash<PermalinkState>(PERMALINK_TOOL_ID, { date: d, time: hasTime ? time! : null, city: c });
    const url = new URL(window.location.href);
    url.searchParams.delete('d');
    url.searchParams.delete('c');
    url.searchParams.delete('t');
    window.history.replaceState(null, '', url.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function compute(date: string, time: string, city: (typeof CITIES)[number], hasTime: boolean) {
    const resolution = resolveZonedCivilTime({
      civilDate: date,
      civilTime: hasTime ? time : '12:00',
      zoneId: city.zoneId,
    });
    if (resolution.status !== 'resolved') {
      setError(t.timeZoneIssue);
      return null;
    }
    const chart = computeNatalChart({ date: resolution.instant, latitude: city.lat, longitude: city.lon });
    setResult({ chart, hasTime });
    return resolution;
  }

  function onSubmit() {
    setError(null);
    if (!form.date) { setError(t.needDate); return; }
    if (!form.city) { setError(t.needCity); return; }
    const city = CITIES.find((x) => x.id === form.city);
    if (!city) { setError(t.needCity); return; }
    const hasTime = !form.unknown && !!form.time;
    const resolution = compute(form.date, form.time, city, hasTime);
    if (!resolution) return;
    // 민간시각·IANA 지역·당시 오프셋·경도를 하나의 원자적 기록으로 저장한다.
    saveBirthRecord(createBirthRecord({
      civilDate: form.date,
      civilTime: hasTime ? form.time : null,
      longitude: city.lon,
      needsConfirmation: false,
      provenance: 'user-confirmed-v2',
      utcOffsetMinutesAtBirth: resolution.offsetMinutes,
      zoneId: city.zoneId,
    }));
    // Feeds back into the ontology profile so its birth-input card shows the
    // same confirmed city rather than only date/time (2026-07-30 unification).
    setProfile({ birthCityId: form.city });
    writeResultHash<PermalinkState>(PERMALINK_TOOL_ID, { date: form.date, time: hasTime ? form.time : null, city: form.city });
    gaEvent('test_completed', { test_id: 'natal' });
  }

  function reset() {
    setResult(null);
    setError(null);
  }

  const shareDesc = useMemo(() => {
    if (!result) return '';
    const s = SIGN_INFO[result.chart.sun.sign].name[loc];
    const m = SIGN_INFO[result.chart.moon.sign].name[loc];
    const parts = [`${t.sun} ${s}`, `${t.moon} ${m}`];
    if (result.hasTime) parts.push(`${t.asc} ${SIGN_INFO[result.chart.ascendant.sign].name[loc]}`);
    return parts.join(' · ');
  }, [result, loc, t]);

  if (result) {
    const { chart, hasTime } = result;
    // Astrology dictionary pages exist in ko (all), en & ja (all 10 planets).
    // Use the reader's locale when a translation exists, else fall back to ko.
    const wikiLoc = loc === 'en' || loc === 'ja' ? loc : 'ko';
    const rows: { key: string; label: string; sub: string; signKey: typeof chart.sun.sign; deg: number; show: boolean; wiki?: string; retro?: boolean }[] = [
      { key: 'sun', label: t.sun, sub: t.sunSub, signKey: chart.sun.sign, deg: chart.sun.degreeInSign, show: true, wiki: `https://wiki.oiyo.net/${wikiLoc}/meaning-of-astro-sun-in-${chart.sun.sign}/` },
      { key: 'moon', label: t.moon, sub: t.moonSub, signKey: chart.moon.sign, deg: chart.moon.degreeInSign, show: true, wiki: `https://wiki.oiyo.net/${wikiLoc}/meaning-of-astro-moon-in-${chart.moon.sign}/` },
      { key: 'asc', label: t.asc, sub: t.ascSub, signKey: chart.ascendant.sign, deg: chart.ascendant.degreeInSign, show: hasTime },
      { key: 'mercury', label: t.mercury, sub: t.mercurySub, signKey: chart.mercury.sign, deg: chart.mercury.degreeInSign, show: true, retro: chart.mercury.retrograde, wiki: `https://wiki.oiyo.net/${wikiLoc}/meaning-of-astro-mercury-in-${chart.mercury.sign}/` },
      { key: 'venus', label: t.venus, sub: t.venusSub, signKey: chart.venus.sign, deg: chart.venus.degreeInSign, show: true, retro: chart.venus.retrograde, wiki: `https://wiki.oiyo.net/${wikiLoc}/meaning-of-astro-venus-in-${chart.venus.sign}/` },
      { key: 'mars', label: t.mars, sub: t.marsSub, signKey: chart.mars.sign, deg: chart.mars.degreeInSign, show: true, retro: chart.mars.retrograde, wiki: `https://wiki.oiyo.net/${wikiLoc}/meaning-of-astro-mars-in-${chart.mars.sign}/` },
      { key: 'jupiter', label: t.jupiter, sub: t.jupiterSub, signKey: chart.jupiter.sign, deg: chart.jupiter.degreeInSign, show: true, retro: chart.jupiter.retrograde, wiki: `https://wiki.oiyo.net/${wikiLoc}/meaning-of-astro-jupiter-in-${chart.jupiter.sign}/` },
      { key: 'saturn', label: t.saturn, sub: t.saturnSub, signKey: chart.saturn.sign, deg: chart.saturn.degreeInSign, show: true, retro: chart.saturn.retrograde, wiki: `https://wiki.oiyo.net/${wikiLoc}/meaning-of-astro-saturn-in-${chart.saturn.sign}/` },
      { key: 'uranus', label: t.uranus, sub: t.uranusSub, signKey: chart.uranus.sign, deg: chart.uranus.degreeInSign, show: true, retro: chart.uranus.retrograde, wiki: `https://wiki.oiyo.net/${wikiLoc}/meaning-of-astro-uranus-in-${chart.uranus.sign}/` },
      { key: 'neptune', label: t.neptune, sub: t.neptuneSub, signKey: chart.neptune.sign, deg: chart.neptune.degreeInSign, show: true, retro: chart.neptune.retrograde, wiki: `https://wiki.oiyo.net/${wikiLoc}/meaning-of-astro-neptune-in-${chart.neptune.sign}/` },
      { key: 'pluto', label: t.pluto, sub: t.plutoSub, signKey: chart.pluto.sign, deg: chart.pluto.degreeInSign, show: true, retro: chart.pluto.retrograde, wiki: `https://wiki.oiyo.net/${wikiLoc}/meaning-of-astro-pluto-in-${chart.pluto.sign}/` },
    ];
    return (
      <section className="mx-auto w-full max-w-xl">
        <header className="mb-5 text-center">
          <h2 className="text-2xl font-extrabold text-indigo-900">{t.resultHeading}</h2>
        </header>
        <div className="space-y-3">
          {rows.map((r) => {
            const info = SIGN_INFO[r.signKey];
            if (!r.show) {
              return (
                <div key={r.key} className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500">
                  <span className="font-bold">{r.label}</span> · {t.ascNeedsTime}
                </div>
              );
            }
            return (
              <article key={r.key} className={`rounded-2xl border p-4 ${ELEMENT_BG[info.element]}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{r.label}</p>
                    <p className="text-[11px] text-slate-400">{r.sub}</p>
                  </div>
                  <span className="text-3xl" aria-hidden="true">{info.emoji}</span>
                </div>
                <p className="mt-2 text-2xl font-black text-slate-900">
                  {t.degIn(r.deg.toFixed(1), info.name[loc])}
                  {r.retro && (
                    <span className="ml-2 align-middle rounded bg-rose-100 px-1.5 py-0.5 text-xs font-bold text-rose-700" title={t.retro}>℞ {t.retro}</span>
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-600">{info.trait[loc]}</p>
                {r.wiki && (
                  <a href={r.wiki} className="mt-2 inline-block text-xs font-bold text-indigo-700 hover:underline">{t.readMore}</a>
                )}
              </article>
            );
          })}
        </div>

        {!hasTime && (
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-center text-xs text-amber-800">{t.moonNote}</p>
        )}

        <ShareResultButton
          locale={loc}
          heading={t.title}
          resultTitle={`${SIGN_INFO[chart.sun.sign].name[loc]} ${t.sun}`}
          emoji={SIGN_INFO[chart.sun.sign].emoji}
          description={shareDesc}
          onShareClick={() => gaEvent('share_click', { test_id: 'natal' })}
        />
        <CopyResultLink locale={loc} onCopyClick={() => gaEvent('share_click', { test_id: 'natal' })} />
        <p className="mt-1.5 text-center text-xs text-amber-600">{PRIVACY_NOTE[loc]}</p>

        <div className="mt-5 text-center text-sm">
          <a href={`/${loc}/zodiac/personality`} className="font-semibold text-indigo-600 hover:underline">{t.zodiacLink}</a>
        </div>

        <p className="mt-5 rounded-xl bg-slate-50 p-3 text-center text-xs text-slate-500">{t.method}</p>
        <p className="mt-2 text-center text-xs text-slate-400">{t.disclaimer}</p>

        <button
          type="button"
          onClick={reset}
          className="mt-4 w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-700"
        >
          {t.retake}
        </button>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-xl">
      <header className="mb-6 text-center">
        <h2 className="text-2xl font-extrabold text-indigo-900">{t.title}</h2>
        <p className="mt-2 text-sm text-slate-600">{t.subtitle}</p>
      </header>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <BirthDateField
          id="natal-birth-date"
          locale={locale}
          label={t.dateLabel}
          value={form.date}
          onChange={(v) => setForm((f) => ({ ...f, date: v }))}
        />

        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-green-600">{t.timeLabel}</span>
            <label className="flex items-center gap-1.5 text-xs text-slate-500">
              <input
                type="checkbox"
                checked={form.unknown}
                onChange={(e) => setForm((f) => ({ ...f, unknown: e.target.checked }))}
              />
              {t.unknownTime}
            </label>
          </div>
          <BirthTimeField
            id="natal-birth-time"
            value={form.time}
            disabled={form.unknown}
            onChange={(v) => setForm((f) => ({ ...f, time: v }))}
          />
        </div>

        <label className="block">
          <span className="text-sm font-bold text-slate-700">{t.cityLabel}</span>
          <select
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">{t.cityPlaceholder}</option>
            {CITIES.map((c) => (
              <option key={c.id} value={c.id}>{c.label[loc]}</option>
            ))}
          </select>
        </label>

        {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}

        <button
          type="button"
          onClick={onSubmit}
          className="w-full rounded-xl bg-indigo-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-800"
        >
          ✨ {t.submit}
        </button>
      </div>

      <p className="mt-4 text-center text-xs text-slate-400">{t.disclaimer}</p>
    </section>
  );
}
