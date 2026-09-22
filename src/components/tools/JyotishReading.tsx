"use client";

import { BirthDateField } from "@/components/shared/BirthDateField";
import {
  jyotishCoordinates,
  nakshatraLord,
  NAKSHATRA_SPAN,
  type JyotishCoordinates,
} from "@/lib/symbolic-tradition/jyotish";
import { grahaName, karanaName, nakshatraName, rashiName, yogaName } from "@/lib/symbolic-tradition/symbol-names";
import { CITIES } from "@/lib/ontology/natal/signs";
import { resolveBirthRecord } from "@/lib/user/birth-record";
import { useProfilePrefill } from "@/lib/user/useProfilePrefill";

/**
 * 인도 점성(조티샤)의 출생 좌표를 보여 준다.
 *
 * **시각과 도시가 없어도 화면이 선다.** 달은 하루에 13° 남짓 움직이므로 시각을
 * 모르면 그날 걸친 낙샤트라·라시를 후보로 모두 적고, 시각이 있어야 정해지는
 * 값(파다·티티·요가·카라나·라그나)은 아예 비운다. 모르는 것을 가운뎃값으로
 * 채워 하나처럼 보이게 하지 않는다.
 */

type Lang = "ko" | "en" | "ja" | "zh" | "fr" | "es";

const COPY: Record<Lang, {
  birthDate: string;
  nakshatra: string;
  pada: string;
  moonRashi: string;
  sunRashi: string;
  lord: string;
  tithi: string;
  yoga: string;
  karana: string;
  lagna: string;
  or: string;
  needTime: string;
  needCity: string;
  shukla: string;
  krishna: string;
  tithiValue: string;
  ayanamsa: string;
}> = {
  ko: {
    birthDate: "생년월일",
    nakshatra: "낙샤트라 (달이 머무는 별자리)",
    pada: "파다",
    moonRashi: "찬드라 라시 (달의 궁)",
    sunRashi: "수리야 라시 (해의 궁)",
    lord: "낙샤트라의 주인",
    tithi: "티티 (달의 날)",
    yoga: "요가",
    karana: "카라나",
    lagna: "라그나 (상승궁)",
    or: " 또는 ",
    needTime: "태어난 시각을 넣으면 파다·티티·요가·카라나까지 정해져요. 내 지도에서 시각을 더해 주세요.",
    needCity: "라그나(상승궁)는 태어난 곳의 하늘이라 출생도시가 있어야 세워요.",
    shukla: "슈클라 팍샤(차는 달)",
    krishna: "크리슈나 팍샤(기우는 달)",
    tithiValue: "{paksha} {n}번째",
    ayanamsa: "인도 점성은 별자리를 실제 별 위치에 맞춰 봅니다. 여기서는 인도 정부 역법이 쓰는 라히리 아야남샤로 서양 황도에서 약 24° 옮겨 셈했어요.",
  },
  en: {
    birthDate: "Birth date",
    nakshatra: "Nakshatra (the lunar mansion)",
    pada: "Pada",
    moonRashi: "Chandra rashi (Moon sign)",
    sunRashi: "Surya rashi (Sun sign)",
    lord: "Ruling graha",
    tithi: "Tithi (lunar day)",
    yoga: "Yoga",
    karana: "Karana",
    lagna: "Lagna (ascendant)",
    or: " or ",
    needTime: "Add your birth time and the pada, tithi, yoga and karana can be fixed too. You can add it on My Map.",
    needCity: "The lagna is the sky over your birthplace, so it needs your birth city.",
    shukla: "Shukla paksha (waxing)",
    krishna: "Krishna paksha (waning)",
    tithiValue: "{paksha}, day {n}",
    ayanamsa: "Vedic astrology measures signs against the actual stars. This chart uses the Lahiri ayanamsa of the Indian national calendar, about 24° back from the Western zodiac.",
  },
  ja: {
    birthDate: "生年月日",
    nakshatra: "ナクシャトラ（月の宿）",
    pada: "パーダ",
    moonRashi: "チャンドラ・ラーシ（月の宮）",
    sunRashi: "スーリヤ・ラーシ（太陽の宮）",
    lord: "支配星（グラハ）",
    tithi: "ティティ（月の日）",
    yoga: "ヨーガ",
    karana: "カラナ",
    lagna: "ラグナ（上昇宮）",
    or: " または ",
    needTime: "出生時刻を入れると、パーダ・ティティ・ヨーガ・カラナまで定まります。「私の地図」で追加できます。",
    needCity: "ラグナ（上昇宮）は出生地の空なので、出生都市が必要です。",
    shukla: "シュクラ・パクシャ（満ちる月）",
    krishna: "クリシュナ・パクシャ（欠ける月）",
    tithiValue: "{paksha} 第{n}日",
    ayanamsa: "インド占星術は実際の星の位置に合わせて宮を測ります。ここではインド国定暦のラヒリ・アヤナムシャを用い、西洋の黄道から約24°戻して計算しました。",
  },
  zh: {
    birthDate: "出生日期",
    nakshatra: "月宿（Nakshatra）",
    pada: "宿分（Pada）",
    moonRashi: "月亮星座（Chandra rashi）",
    sunRashi: "太阳星座（Surya rashi）",
    lord: "主星（Graha）",
    tithi: "太阴日（Tithi）",
    yoga: "瑜伽（Yoga）",
    karana: "半日（Karana）",
    lagna: "上升宫（Lagna）",
    or: " 或 ",
    needTime: "补上出生时间，宿分、太阴日、瑜伽与半日也能确定。可在“我的地图”中添加。",
    needCity: "上升宫是出生地的天空，需要出生城市。",
    shukla: "白分月（渐盈）",
    krishna: "黑分月（渐亏）",
    tithiValue: "{paksha} 第 {n} 日",
    ayanamsa: "印度占星按恒星实际位置划分星座。此处采用印度国定历的拉希里岁差修正，与西洋黄道相差约 24°。",
  },
  fr: {
    birthDate: "Date de naissance",
    nakshatra: "Nakshatra (demeure lunaire)",
    pada: "Pada",
    moonRashi: "Chandra rashi (signe lunaire)",
    sunRashi: "Surya rashi (signe solaire)",
    lord: "Graha maître",
    tithi: "Tithi (jour lunaire)",
    yoga: "Yoga",
    karana: "Karana",
    lagna: "Lagna (ascendant)",
    or: " ou ",
    needTime: "Ajoutez votre heure de naissance et le pada, le tithi, le yoga et le karana pourront aussi être fixés. C’est possible depuis Ma carte.",
    needCity: "Le lagna est le ciel de votre lieu de naissance : il faut votre ville de naissance.",
    shukla: "Shukla paksha (lune croissante)",
    krishna: "Krishna paksha (lune décroissante)",
    tithiValue: "{paksha}, {n}e jour",
    ayanamsa: "L’astrologie védique mesure les signes sur les étoiles réelles. Ce calcul emploie l’ayanamsa Lahiri du calendrier national indien, environ 24° en retrait du zodiaque occidental.",
  },
  es: {
    birthDate: "Fecha de nacimiento",
    nakshatra: "Nakshatra (mansión lunar)",
    pada: "Pada",
    moonRashi: "Chandra rashi (signo lunar)",
    sunRashi: "Surya rashi (signo solar)",
    lord: "Graha regente",
    tithi: "Tithi (día lunar)",
    yoga: "Yoga",
    karana: "Karana",
    lagna: "Lagna (ascendente)",
    or: " o ",
    needTime: "Añade tu hora de nacimiento y también podrán fijarse el pada, el tithi, el yoga y el karana. Puedes añadirla en Mi mapa.",
    needCity: "El lagna es el cielo de tu lugar de nacimiento, así que necesita tu ciudad natal.",
    shukla: "Shukla paksha (luna creciente)",
    krishna: "Krishna paksha (luna menguante)",
    tithiValue: "{paksha}, día {n}",
    ayanamsa: "La astrología védica mide los signos contra las estrellas reales. Esta carta usa el ayanamsa Lahiri del calendario nacional indio, unos 24° por detrás del zodiaco occidental.",
  },
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <li className="grid grid-cols-[8rem_1fr] gap-3 border-b border-violet-100 py-2.5 text-sm last:border-b-0 sm:grid-cols-[11rem_1fr]">
      <span className="font-bold text-violet-500">{label}</span>
      <span className="text-violet-900">{children}</span>
    </li>
  );
}

export default function JyotishReading({ locale = "ko" }: { locale?: string }) {
  const lang = (["ko", "en", "ja", "zh", "fr", "es"].includes(locale) ? locale : "en") as Lang;
  const t = COPY[lang];
  const { parsed, profile } = useProfilePrefill();

  if (!parsed) {
    return (
      <div className="rounded-2xl bg-violet-50 p-5">
        <BirthDateField id="jyotish-birth-date" locale={locale} label={t.birthDate} value="" onChange={() => {}} className="w-full" />
      </div>
    );
  }

  const record = resolveBirthRecord(profile);
  const civilTime = parsed.hour === null
    ? null
    : `${String(parsed.hour).padStart(2, "0")}:${String(parsed.minute ?? 0).padStart(2, "0")}`;
  // 저장된 출생 기록은 경도만 들고 있다. 라그나는 위도도 있어야 해서 저장된
  // 시간대·경도와 맞는 도시를 찾는다 — 사주·부적 화면이 쓰는 방법과 같다.
  const city = CITIES.find((candidate) => candidate.zoneId === record?.zoneId && candidate.lon === record?.longitude) ?? null;
  const coordinates: JyotishCoordinates = jyotishCoordinates({
    civilDate: record?.civilDate ?? `${parsed.year}-${String(parsed.month).padStart(2, "0")}-${String(parsed.day).padStart(2, "0")}`,
    civilTime,
    utcOffsetMinutes: record?.utcOffsetMinutesAtBirth ?? null,
    latitude: city?.lat ?? null,
    longitude: record?.longitude ?? null,
  });

  const nak = coordinates.nakshatra.map((n) => nakshatraName(n, lang)).join(t.or);
  const moon = coordinates.moonRashi.map((r) => rashiName(r, lang)).join(t.or);
  const lords = coordinates.nakshatra
    .map((n) => grahaName(nakshatraLord(n), lang))
    .filter((name, index, list) => list.indexOf(name) === index)
    .join(t.or);
  const tithi = coordinates.tithi === null
    ? null
    : t.tithiValue
      .replace("{paksha}", coordinates.tithi <= 15 ? t.shukla : t.krishna)
      .replace("{n}", String(coordinates.tithi <= 15 ? coordinates.tithi : coordinates.tithi - 15));

  return (
    <div className="rounded-2xl bg-violet-50 p-5">
      <ul className="m-0 list-none p-0">
        <Row label={t.nakshatra}>
          <span className="font-black">{nak}</span>
          {coordinates.pada !== null && <span className="text-violet-500"> · {t.pada} {coordinates.pada}/4</span>}
        </Row>
        <Row label={t.lord}>{lords}</Row>
        <Row label={t.moonRashi}>{moon}</Row>
        <Row label={t.sunRashi}>{rashiName(coordinates.sunRashi, lang)}</Row>
        {tithi && <Row label={t.tithi}>{tithi}</Row>}
        {coordinates.yoga !== null && <Row label={t.yoga}>{yogaName(coordinates.yoga, lang)}</Row>}
        {coordinates.karana !== null && <Row label={t.karana}>{karanaName(coordinates.karana, lang)}</Row>}
        {coordinates.lagna !== null && <Row label={t.lagna}>{rashiName(coordinates.lagna, lang)}</Row>}
      </ul>
      {civilTime === null && <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">{t.needTime}</p>}
      {civilTime !== null && coordinates.lagna === null && <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">{t.needCity}</p>}
      <p className="mt-4 text-xs leading-6 text-violet-500">
        {t.ayanamsa} <span className="whitespace-nowrap">({NAKSHATRA_SPAN.toFixed(2)}° = 1 nakshatra)</span>
      </p>
    </div>
  );
}
