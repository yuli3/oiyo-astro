// 태어난 순간의 해·달 — 문구·장소·장면 색.
// shadcn lint forbids hex colours in JSX attributes, so every scene/card colour lives in SCENE here.
import { SIGN_INFO } from "../../../lib/ontology/natal/signs";
import type { PhaseKey } from "../../../lib/birth-sky";

export type L = "ko" | "en" | "ja" | "zh" | "fr" | "es";
export type Six = Record<L, string>;
export const LOCALES6 = ["ko", "en", "ja", "zh", "fr", "es"] as const;
export const toL = (locale: string): L => ((LOCALES6 as readonly string[]).includes(locale) ? (locale as L) : "en");
export const pick = <T,>(t: Record<L, T>, l: L): T => t[l] ?? t.en;
export const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""));

export const SCENE = {
  space: "#02030a",
  sunlight: "#fff4e0",
  sunCore: "#ffd27a",
  atmosphere: "#5aa8ff",
  marker: "#ff7a59",
  moonOrbit: "#8fa3c8",
  sunRay: "#ffcf73",
  milkyDim: "#5b6170",
  // card
  cardBg: "#05060f",
  cardText: "#f4f1ea",
  cardMuted: "#a9adbb",
  cardAccent: "#ffcf73",
  moonLit: "#f2eee2",
  moonDark: "#23252e",
  // horizon panorama sky by sun altitude
  skyDay: ["#3b82c4", "#a9d3f2"],
  skyTwilight: ["#1c2350", "#e9905a"],
  skyNight: ["#02030a", "#141a33"],
  ground: "#0d1410",
  groundLine: "#3d5245",
} as const;

export { PLACES, placeById } from "../../../lib/birth-sky-places";
export const defaultPlaceFor = (l: L) => ({ ko: "seoul", en: "london", ja: "tokyo", zh: "beijing", fr: "paris", es: "madrid" })[l];

export const SIGN_ORDER = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"] as const;
export const signName = (i: number, l: L) => {
  const s = SIGN_INFO[SIGN_ORDER[i]!];
  return `${s.emoji} ${s.name[l]}`;
};

// 24 solar terms from the spring equinox (sun longitude 0°, 15°, …).
export const TERMS: Record<L, string[]> = {
  ko: ["춘분", "청명", "곡우", "입하", "소만", "망종", "하지", "소서", "대서", "입추", "처서", "백로", "추분", "한로", "상강", "입동", "소설", "대설", "동지", "소한", "대한", "입춘", "우수", "경칩"],
  ja: ["春分", "清明", "穀雨", "立夏", "小満", "芒種", "夏至", "小暑", "大暑", "立秋", "処暑", "白露", "秋分", "寒露", "霜降", "立冬", "小雪", "大雪", "冬至", "小寒", "大寒", "立春", "雨水", "啓蟄"],
  zh: ["春分", "清明", "谷雨", "立夏", "小满", "芒种", "夏至", "小暑", "大暑", "立秋", "处暑", "白露", "秋分", "寒露", "霜降", "立冬", "小雪", "大雪", "冬至", "小寒", "大寒", "立春", "雨水", "惊蛰"],
  en: ["Spring Equinox", "Clear and Bright", "Grain Rain", "Start of Summer", "Grain Buds", "Grain in Ear", "Summer Solstice", "Minor Heat", "Major Heat", "Start of Autumn", "End of Heat", "White Dew", "Autumn Equinox", "Cold Dew", "Frost's Descent", "Start of Winter", "Minor Snow", "Major Snow", "Winter Solstice", "Minor Cold", "Major Cold", "Start of Spring", "Rain Water", "Awakening of Insects"],
  fr: ["Équinoxe de printemps", "Pure clarté", "Pluie des grains", "Début de l'été", "Petite abondance", "Grains en épi", "Solstice d'été", "Petite chaleur", "Grande chaleur", "Début de l'automne", "Fin de la chaleur", "Rosée blanche", "Équinoxe d'automne", "Rosée froide", "Descente du givre", "Début de l'hiver", "Petite neige", "Grande neige", "Solstice d'hiver", "Petit froid", "Grand froid", "Début du printemps", "Eau de pluie", "Réveil des insectes"],
  es: ["Equinoccio de primavera", "Claridad pura", "Lluvia de granos", "Inicio del verano", "Grano lleno", "Grano en espiga", "Solsticio de verano", "Calor menor", "Calor mayor", "Inicio del otoño", "Fin del calor", "Rocío blanco", "Equinoccio de otoño", "Rocío frío", "Descenso de la escarcha", "Inicio del invierno", "Nieve menor", "Nieve mayor", "Solsticio de invierno", "Frío menor", "Frío mayor", "Inicio de la primavera", "Agua de lluvia", "Despertar de los insectos"],
};

export const PHASE_EMOJI: Record<PhaseKey, string> = { new: "🌑", waxingCrescent: "🌒", firstQuarter: "🌓", waxingGibbous: "🌔", full: "🌕", waningGibbous: "🌖", lastQuarter: "🌗", waningCrescent: "🌘" };

export const PHASES: Record<PhaseKey, Six> = {
  new: { ko: "삭(새 달)", en: "New moon", ja: "新月", zh: "新月", fr: "Nouvelle lune", es: "Luna nueva" },
  waxingCrescent: { ko: "초승달", en: "Waxing crescent", ja: "三日月", zh: "峨眉月", fr: "Premier croissant", es: "Luna creciente" },
  firstQuarter: { ko: "상현달", en: "First quarter", ja: "上弦の月", zh: "上弦月", fr: "Premier quartier", es: "Cuarto creciente" },
  waxingGibbous: { ko: "차오르는 달", en: "Waxing gibbous", ja: "十三夜の月", zh: "盈凸月", fr: "Gibbeuse croissante", es: "Gibosa creciente" },
  full: { ko: "보름달", en: "Full moon", ja: "満月", zh: "满月", fr: "Pleine lune", es: "Luna llena" },
  waningGibbous: { ko: "기우는 달", en: "Waning gibbous", ja: "寝待月", zh: "亏凸月", fr: "Gibbeuse décroissante", es: "Gibosa menguante" },
  lastQuarter: { ko: "하현달", en: "Last quarter", ja: "下弦の月", zh: "下弦月", fr: "Dernier quartier", es: "Cuarto menguante" },
  waningCrescent: { ko: "그믐달", en: "Waning crescent", ja: "有明の月", zh: "残月", fr: "Dernier croissant", es: "Luna menguante" },
};

export const DIRS: Record<L, string[]> = {
  ko: ["북쪽", "북동쪽", "동쪽", "남동쪽", "남쪽", "남서쪽", "서쪽", "북서쪽"],
  en: ["north", "northeast", "east", "southeast", "south", "southwest", "west", "northwest"],
  ja: ["北", "北東", "東", "南東", "南", "南西", "西", "北西"],
  zh: ["北方", "东北", "东方", "东南", "南方", "西南", "西方", "西北"],
  fr: ["nord", "nord-est", "est", "sud-est", "sud", "sud-ouest", "ouest", "nord-ouest"],
  es: ["norte", "noreste", "este", "sureste", "sur", "suroeste", "oeste", "noroeste"],
};

export const CARDINAL: Record<L, [string, string, string, string]> = {
  ko: ["북", "동", "남", "서"],
  en: ["N", "E", "S", "W"],
  ja: ["北", "東", "南", "西"],
  zh: ["北", "东", "南", "西"],
  fr: ["N", "E", "S", "O"],
  es: ["N", "E", "S", "O"],
};

export const C = {
  date: { ko: "태어난 날", en: "Birth date", ja: "生年月日", zh: "出生日期", fr: "Date de naissance", es: "Fecha de nacimiento" },
  time: { ko: "태어난 시각", en: "Birth time", ja: "出生時刻", zh: "出生时间", fr: "Heure de naissance", es: "Hora de nacimiento" },
  unknown: { ko: "시각을 몰라요 (낮 12시로 그려요)", en: "I don't know the time (drawn at noon)", ja: "時刻が分からない（正午で描きます）", zh: "不知道时间（按中午12点画）", fr: "Heure inconnue (dessiné à midi)", es: "No sé la hora (se dibuja a mediodía)" },
  place: { ko: "태어난 곳", en: "Birthplace", ja: "出生地", zh: "出生地", fr: "Lieu de naissance", es: "Lugar de nacimiento" },
  go: { ko: "그 순간의 우주 보기", en: "Show that moment in space", ja: "その瞬間の宇宙を見る", zh: "看那一刻的宇宙", fr: "Voir cet instant dans l'espace", es: "Ver ese instante en el espacio" },
  invalid: { ko: "1800–2200년 사이의 날짜를 넣어 주세요.", en: "Please enter a date between 1800 and 2200.", ja: "1800〜2200年の日付を入れてください。", zh: "请输入1800至2200年之间的日期。", fr: "Saisissez une date entre 1800 et 2200.", es: "Introduce una fecha entre 1800 y 2200." },
  nonexistent: { ko: "그 시각은 서머타임 전환으로 시계에 없던 시각이에요. 한 시간 뒤로 넣어 보세요.", en: "That time was skipped by a daylight-saving change. Try one hour later.", ja: "その時刻は夏時間の切り替えで存在しません。1時間後で試してください。", zh: "该时刻因夏令时调整并不存在，请往后推一小时。", fr: "Cette heure n'a pas existé (passage à l'heure d'été). Essayez une heure plus tard.", es: "Esa hora no existió por el cambio de horario. Prueba una hora después." },
  ambiguous: { ko: "서머타임이 끝나 같은 시각이 두 번 있었던 날이에요. 앞의 시각으로 그렸어요.", en: "Clocks went back that night, so this time happened twice; the earlier one is shown.", ja: "夏時間終了で同じ時刻が2回ありました。早い方で描いています。", zh: "当晚夏令时结束，该时刻出现两次，按较早的一次画。", fr: "Heure vécue deux fois (fin de l'heure d'été) : la première est affichée.", es: "Esa hora ocurrió dos veces (fin del horario de verano); se muestra la primera." },
  kicker: { ko: "{date} {time} · {place}", en: "{date} {time} · {place}", ja: "{date} {time}・{place}", zh: "{date} {time}·{place}", fr: "{date} {time} · {place}", es: "{date} {time} · {place}" },
  sunTitle: { ko: "해", en: "Sun", ja: "太陽", zh: "太阳", fr: "Soleil", es: "Sol" },
  moonTitle: { ko: "달", en: "Moon", ja: "月", zh: "月亮", fr: "Lune", es: "Luna" },
  above: { ko: "{dir} 하늘, 고도 {alt}°", en: "{alt}° up in the {dir}", ja: "{dir}の空、高度{alt}°", zh: "{dir}天空，高度{alt}°", fr: "à {alt}° de haut, côté {dir}", es: "a {alt}° de altura hacia el {dir}" },
  below: { ko: "지평선 아래 {alt}° ({dir})", en: "{alt}° below the horizon ({dir})", ja: "地平線の下{alt}°（{dir}）", zh: "地平线下{alt}°（{dir}）", fr: "{alt}° sous l'horizon ({dir})", es: "{alt}° bajo el horizonte ({dir})" },
  day: { ko: "해가 떠 있던 낮", en: "Daytime: the Sun was up", ja: "太陽が出ていた昼", zh: "白天，太阳在天上", fr: "En journée : le Soleil était levé", es: "De día: el Sol estaba arriba" },
  twilight: { ko: "해가 막 지거나 뜨던 박명", en: "Twilight: the Sun just below the horizon", ja: "日の出・日の入り前後の薄明", zh: "晨昏蒙影，太阳刚在地平线下", fr: "Crépuscule : le Soleil juste sous l'horizon", es: "Crepúsculo: el Sol justo bajo el horizonte" },
  night: { ko: "해가 지구 반대편에 있던 밤", en: "Night: the Sun was on the far side of Earth", ja: "太陽が地球の裏側にあった夜", zh: "夜晚，太阳在地球另一侧", fr: "Nuit : le Soleil de l'autre côté de la Terre", es: "Noche: el Sol al otro lado de la Tierra" },
  term: { ko: "절기 {t} · 태양 황경 {lon}°", en: "Solar term {t} · Sun at {lon}° ecliptic longitude", ja: "節気{t}・太陽黄経{lon}°", zh: "节气{t}·太阳黄经{lon}°", fr: "Terme solaire {t} · Soleil à {lon}° de longitude", es: "Término solar {t} · Sol a {lon}° de longitud" },
  sign: { ko: "태양 별자리 {s}", en: "Sun sign {s}", ja: "太陽星座 {s}", zh: "太阳星座 {s}", fr: "Signe solaire {s}", es: "Signo solar {s}" },
  moonPhase: { ko: "{p} · 밝은 면 {i}% · 월령 {age}일", en: "{p} · {i}% lit · {age} days old", ja: "{p}・輝面{i}%・月齢{age}", zh: "{p}·亮面{i}%·月龄{age}天", fr: "{p} · {i} % éclairée · {age} jours", es: "{p} · {i} % iluminada · {age} días" },
  moonDist: { ko: "지구에서 {km} km", en: "{km} km from Earth", ja: "地球から{km} km", zh: "距地球{km}公里", fr: "à {km} km de la Terre", es: "a {km} km de la Tierra" },
  moonSign: { ko: "달 별자리 {s}", en: "Moon sign {s}", ja: "月星座 {s}", zh: "月亮星座 {s}", fr: "Signe lunaire {s}", es: "Signo lunar {s}" },
  viewSpace: { ko: "우주에서", en: "From space", ja: "宇宙から", zh: "从太空", fr: "Depuis l'espace", es: "Desde el espacio" },
  viewMoon: { ko: "내 자리에서 달", en: "Moon from my spot", ja: "私の場所から月", zh: "从我所在看月亮", fr: "La Lune depuis chez moi", es: "La Luna desde mi lugar" },
  viewSun: { ko: "내 자리에서 해", en: "Sun from my spot", ja: "私の場所から太陽", zh: "从我所在看太阳", fr: "Le Soleil depuis chez moi", es: "El Sol desde mi lugar" },
  sceneLabel: { ko: "태어난 순간 지구·달·해 3D 장면", en: "3D scene of Earth, Moon and Sun at the moment of birth", ja: "誕生の瞬間の地球・月・太陽の3D", zh: "出生瞬间的地球、月亮、太阳三维场景", fr: "Scène 3D de la Terre, de la Lune et du Soleil à la naissance", es: "Escena 3D de la Tierra, la Luna y el Sol al nacer" },
  sceneHint: { ko: "끌어서 돌리고, 두 손가락으로 확대해요. 달까지 거리와 크기는 보기 좋게 줄였어요. 방향은 실제와 같아요.", en: "Drag to orbit, pinch to zoom. Distances and sizes are shrunk to fit; every direction is real.", ja: "ドラッグで回転、ピンチで拡大。距離と大きさは縮めていますが、向きは実際と同じです。", zh: "拖动旋转，双指缩放。距离和大小已缩小，方向与真实一致。", fr: "Glissez pour tourner, pincez pour zoomer. Distances et tailles réduites ; les directions sont réelles.", es: "Arrastra para girar, pellizca para ampliar. Distancias y tamaños reducidos; las direcciones son reales." },
  belowNote: { ko: "지금 고른 쪽은 지평선 아래라 지구에 가려 보여요. 그때 그 자리에선 보이지 않았다는 뜻이에요.", en: "That body was below the horizon, so Earth hides it: it could not be seen from there at that moment.", ja: "地平線の下なので地球に隠れています。その時その場所からは見えませんでした。", zh: "它在地平线下，被地球挡住了：那一刻在那里看不到。", fr: "Sous l'horizon, la Terre le cache : invisible de là à cet instant.", es: "Estaba bajo el horizonte y la Tierra lo tapa: no se veía desde allí." },
  horizonTitle: { ko: "출생지에서 본 하늘 (360° 지평선)", en: "The sky from the birthplace (360° horizon)", ja: "出生地から見た空（360°地平線）", zh: "从出生地看的天空（360°地平线）", fr: "Le ciel depuis le lieu de naissance (horizon 360°)", es: "El cielo desde el lugar de nacimiento (horizonte 360°)" },
  share: { ko: "공유 카드 만들기", en: "Make a share card", ja: "シェアカードを作る", zh: "生成分享卡片", fr: "Créer une carte à partager", es: "Crear tarjeta para compartir" },
  saveImage: { ko: "이미지 저장", en: "Save image", ja: "画像を保存", zh: "保存图片", fr: "Enregistrer l'image", es: "Guardar imagen" },
  shareImage: { ko: "바로 공유", en: "Share", ja: "共有", zh: "分享", fr: "Partager", es: "Compartir" },
  copyLink: { ko: "이 순간 링크 복사", en: "Copy link to this moment", ja: "この瞬間のリンクをコピー", zh: "复制此刻链接", fr: "Copier le lien de cet instant", es: "Copiar enlace a este instante" },
  copied: { ko: "복사했어요", en: "Copied", ja: "コピーしました", zh: "已复制", fr: "Copié", es: "Copiado" },
  linkNote: { ko: "링크에는 날짜·시각·도시가 들어가요. 원할 때만 나눠 주세요.", en: "The link contains the date, time and city. Share it only if you want to.", ja: "リンクには日付・時刻・都市が入ります。", zh: "链接包含日期、时间和城市，请按需分享。", fr: "Le lien contient la date, l'heure et la ville.", es: "El enlace incluye fecha, hora y ciudad." },
  cardTitle: { ko: "내가 태어난 순간의 해와 달", en: "The Sun and Moon when I was born", ja: "私が生まれた瞬間の太陽と月", zh: "我出生那一刻的太阳和月亮", fr: "Le Soleil et la Lune à ma naissance", es: "El Sol y la Luna cuando nací" },
  sajuTitle: { ko: "사주와 이어 보기", en: "Connect it to Saju", ja: "四柱推命とつなげる", zh: "与八字联系起来", fr: "Lien avec le Saju", es: "Conexión con el Saju" },
  saju: { ko: "사주의 달(월주)은 음력 날짜가 아니라 태양 황경, 곧 절기로 바뀌어요. 태어날 때 해가 {t} 자리에 있었으니, 사주 월주도 이 절기를 기준으로 세워져요. 입력한 생일은 사주 계산기로 그대로 넘어가니 버튼만 누르면 여덟 글자를 볼 수 있어요.", en: "In Saju, the month pillar changes with the Sun's ecliptic longitude (the solar terms), not the lunar date. The Sun stood in {t} when you were born, so your month pillar is set from that term. Check your eight characters with the same date and time in the Saju calculator.", ja: "四柱推命の月柱は旧暦ではなく太陽黄経（節気）で切り替わります。誕生時、太陽は{t}にありました。同じ日時で四柱を確かめてみましょう。", zh: "八字的月柱不按农历，而按太阳黄经（节气）交替。你出生时太阳在{t}，月柱就以此节气为准。用同样的日期时间在八字计算器里看看。", fr: "Dans le Saju, le pilier du mois suit la longitude du Soleil (termes solaires), pas la date lunaire. À votre naissance, le Soleil était en {t}. Vérifiez vos huit caractères avec la même date.", es: "En el Saju, el pilar del mes sigue la longitud del Sol (términos solares), no la fecha lunar. Al nacer, el Sol estaba en {t}. Comprueba tus ocho caracteres con la misma fecha." },
  sajuCta: { ko: "사주 계산기로 가기", en: "Open the Saju calculator", ja: "四柱推命計算機へ", zh: "打开八字计算器", fr: "Ouvrir le calculateur Saju", es: "Abrir la calculadora Saju" },
  natalCta: { ko: "행성까지 출생 차트 보기", en: "See all planets in a natal chart", ja: "惑星まで出生図で見る", zh: "在出生星盘看全部行星", fr: "Voir toutes les planètes (thème natal)", es: "Ver todos los planetas (carta natal)" },
  loading: { ko: "우주를 그리는 중…", en: "Drawing space…", ja: "宇宙を描いています…", zh: "正在绘制宇宙…", fr: "Dessin de l'espace…", es: "Dibujando el espacio…" },
  noWebgl: { ko: "이 기기에선 3D를 그릴 수 없어 아래 하늘 그림만 보여요.", en: "3D isn't available on this device; the sky panorama below still works.", ja: "この端末では3Dを表示できません。下の空の図は使えます。", zh: "此设备无法显示3D，下方天空图仍可用。", fr: "3D indisponible sur cet appareil ; le panorama ci-dessous fonctionne.", es: "3D no disponible en este dispositivo; el panorama de abajo funciona." },
  credit: { ko: "지구·달·해 표면 이미지: Solar System Scope (CC BY 4.0, NASA 자료 기반). 위치 계산: astronomy-engine (MIT).", en: "Surface maps: Solar System Scope (CC BY 4.0, based on NASA data). Positions: astronomy-engine (MIT).", ja: "表面画像：Solar System Scope（CC BY 4.0、NASA資料）。位置計算：astronomy-engine（MIT）。", zh: "表面图像：Solar System Scope（CC BY 4.0，基于NASA数据）。位置计算：astronomy-engine（MIT）。", fr: "Textures : Solar System Scope (CC BY 4.0, d'après la NASA). Positions : astronomy-engine (MIT).", es: "Texturas: Solar System Scope (CC BY 4.0, datos de la NASA). Posiciones: astronomy-engine (MIT)." },
  you: { ko: "출생지", en: "You", ja: "出生地", zh: "出生地", fr: "Vous", es: "Tú" },
  toSun: { ko: "해 쪽", en: "To the Sun", ja: "太陽の方向", zh: "太阳方向", fr: "Vers le Soleil", es: "Hacia el Sol" },
} satisfies Record<string, Six>;
