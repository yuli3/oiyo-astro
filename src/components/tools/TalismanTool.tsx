/**
 * 액땜 부적 도구.
 *
 * 생년월일시를 받아 사주에서 보완할 오행을 찾고, 그 오행과 만세력·서양 점성·
 * 켈트·마야의 표기를 한 판에 새겨 부적을 그린다. 같은 생년월일시는 언제나 같은
 * 부적을 낸다 — 난수를 쓰지 않는다.
 *
 * 판 위의 표시는 전부 실재하는 문자다. 근거는 lib/talisman/sources.ts 에 있고,
 * 이 화면은 그것을 사람이 읽을 수 있게 풀어 준다("왜 이 모양인가"를 답하지
 * 못하는 결과는 내지 않는다).
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { BirthDateField, ProfileTimeField } from '../shared/BirthDateField'
import CityField from '../shared/CityField'
import { calculateBirthSaju } from '../../lib/ontology/saju/birth-contract'
import { analyzeSaju } from '../../lib/ontology/saju/logic'
import { FiveElement } from '../../lib/ontology/saju/types'
import { CITIES, type City } from '../../lib/ontology/natal/signs'
import {
  createBirthRecord,
  resolveBirthLocation,
  resolveBirthRecord,
  updateBirthRecordFromParts,
  type BirthRecordV2,
} from '../../lib/user/birth-record'
import { useProfilePrefill } from '../../lib/user/useProfilePrefill'
import { drawTalisman } from '../../lib/talisman/draw'
import { ELEMENT_SYMBOLS } from '../../lib/talisman/symbols'
import { BRANCH_ANIMAL, TRIGRAM, ZODIAC_NAME, readingFromBirth, type TalismanReading } from '../../lib/talisman/sources'
import ResultSymbol from '../shared/ResultSymbol'

type L = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'
const lang = (locale: string): L =>
  (['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const).includes(locale as L) ? (locale as L) : 'en'

const T: Record<L, Record<string, string>> = {
  ko: {
    title: '액땜 부적',
    subtitle: '생년월일시를 넣으면, 그 사주에 모자란 기운을 채우는 부적을 한 장 써 드려요.',
    draw: '부적 쓰기',
    redraw: '다시 쓰기',
    timeRequired: '태어난 시각을 넣어 주세요. 시주가 부적의 네 기둥 중 하나예요.',
    cityRequired: '태어난 도시를 골라 주세요. 경도가 있어야 사주가 정확해져요.',
    invalid: '그 날짜와 시각은 계산할 수 없어요. 다시 확인해 주세요.',
    reading: '이 부적에 새긴 것',
    pillars: '만세력 · 사주 네 기둥',
    element: '보완하는 오행',
    trigram: '팔괘',
    zodiac: '황도 12궁',
    ogham: '켈트 오검',
    tone: '마야 촐킨 음조',
    tail: '꼬리 글',
    download: 'SVG 내려받기',
    downloadPng: 'PNG 내려받기',
    note: '이 부적은 상징 디자인이에요. 특정 종파의 부적을 옮겨 그린 것이 아니고, 주술적 효험을 주장하지 않아요. 판에 올린 표시는 모두 실제로 쓰이는 문자에서 가져왔어요.',
    yearP: '년주', monthP: '월주', dayP: '일주', hourP: '시주',
  },
  en: {
    title: 'Warding Talisman',
    subtitle: 'Enter your birth date and time, and we draw one talisman for the energy your chart lacks.',
    draw: 'Draw the talisman',
    redraw: 'Draw again',
    timeRequired: 'Please enter your birth time — the hour pillar is one of the four on the talisman.',
    cityRequired: 'Please pick your birth city. Longitude is what makes the chart accurate.',
    invalid: 'That date and time cannot be computed. Please check them.',
    reading: 'What is inscribed here',
    pillars: 'Ten-thousand-year calendar · Four Pillars',
    element: 'Element being replenished',
    trigram: 'Trigram',
    zodiac: 'Zodiac sign',
    ogham: 'Celtic Ogham',
    tone: 'Mayan Tzolkin tone',
    tail: 'Closing phrase',
    download: 'Download SVG',
    downloadPng: 'Download PNG',
    note: 'This is a symbolic design. It does not copy any tradition’s actual talisman and claims no magical effect. Every mark on it comes from a writing system that is really used.',
    yearP: 'Year', monthP: 'Month', dayP: 'Day', hourP: 'Hour',
  },
  ja: {
    title: '厄除けの符',
    subtitle: '生年月日時を入れると、その四柱に足りない気を補う符を一枚書きます。',
    draw: '符を書く',
    redraw: 'もう一度書く',
    timeRequired: '生まれた時刻を入れてください。時柱は符の四本の柱のひとつです。',
    cityRequired: '生まれた都市を選んでください。経度があって四柱が正確になります。',
    invalid: 'その日付と時刻は計算できません。ご確認ください。',
    reading: 'この符に刻んだもの',
    pillars: '万年暦 · 四柱',
    element: '補う五行',
    trigram: '八卦',
    zodiac: '黄道十二宮',
    ogham: 'ケルト・オガム',
    tone: 'マヤ ツォルキンの音',
    tail: '結びの句',
    download: 'SVG をダウンロード',
    downloadPng: 'PNG をダウンロード',
    note: 'これは象徴のデザインです。特定の宗派の符を写したものではなく、呪術的な効果を主張しません。符の上の印はすべて実在する表記から取っています。',
    yearP: '年柱', monthP: '月柱', dayP: '日柱', hourP: '時柱',
  },
  zh: {
    title: '消灾符',
    subtitle: '输入生辰，我们为你写一张补足命盘所缺之气的符。',
    draw: '写符',
    redraw: '重新写',
    timeRequired: '请输入出生时刻。时柱是符上四柱之一。',
    cityRequired: '请选择出生城市。有经度才能算准四柱。',
    invalid: '该日期与时刻无法计算，请再确认。',
    reading: '这张符上刻了什么',
    pillars: '万年历 · 四柱',
    element: '所补五行',
    trigram: '八卦',
    zodiac: '黄道十二宫',
    ogham: '凯尔特欧甘文',
    tone: '玛雅卓尔金音调',
    tail: '结语',
    download: '下载 SVG',
    downloadPng: '下载 PNG',
    note: '这是象征设计，并非摹写某一宗派的实际符箓，也不主张法术效力。符上的每个记号都取自真实使用的书写系统。',
    yearP: '年柱', monthP: '月柱', dayP: '日柱', hourP: '时柱',
  },
  fr: {
    title: 'Talisman de protection',
    subtitle: 'Indiquez votre date et heure de naissance : nous traçons un talisman pour l’énergie qui manque à votre thème.',
    draw: 'Tracer le talisman',
    redraw: 'Tracer à nouveau',
    timeRequired: 'Indiquez votre heure de naissance — le pilier horaire est l’un des quatre du talisman.',
    cityRequired: 'Choisissez votre ville de naissance. C’est la longitude qui rend le thème exact.',
    invalid: 'Cette date et cette heure ne peuvent pas être calculées. Vérifiez-les.',
    reading: 'Ce qui est inscrit ici',
    pillars: 'Calendrier des dix mille ans · Quatre Piliers',
    element: 'Élément renforcé',
    trigram: 'Trigramme',
    zodiac: 'Signe du zodiaque',
    ogham: 'Ogham celtique',
    tone: 'Ton Tzolkin maya',
    tail: 'Formule finale',
    download: 'Télécharger le SVG',
    downloadPng: 'Télécharger le PNG',
    note: 'Ceci est un design symbolique. Il ne copie le talisman réel d’aucune tradition et ne revendique aucun effet magique. Chaque marque provient d’une écriture réellement employée.',
    yearP: 'Année', monthP: 'Mois', dayP: 'Jour', hourP: 'Heure',
  },
  es: {
    title: 'Talismán de protección',
    subtitle: 'Introduce tu fecha y hora de nacimiento: trazamos un talismán para la energía que le falta a tu carta.',
    draw: 'Trazar el talismán',
    redraw: 'Trazar de nuevo',
    timeRequired: 'Introduce tu hora de nacimiento: el pilar horario es uno de los cuatro del talismán.',
    cityRequired: 'Elige tu ciudad de nacimiento. La longitud es lo que hace exacta la carta.',
    invalid: 'Esa fecha y hora no se pueden calcular. Revísalas.',
    reading: 'Lo que está inscrito aquí',
    pillars: 'Calendario de diez mil años · Cuatro Pilares',
    element: 'Elemento que se refuerza',
    trigram: 'Trigrama',
    zodiac: 'Signo del zodiaco',
    ogham: 'Ogham celta',
    tone: 'Tono Tzolkin maya',
    tail: 'Frase final',
    download: 'Descargar SVG',
    downloadPng: 'Descargar PNG',
    note: 'Es un diseño simbólico. No copia el talismán real de ninguna tradición ni afirma efecto mágico alguno. Cada marca procede de una escritura realmente usada.',
    yearP: 'Año', monthP: 'Mes', dayP: 'Día', hourP: 'Hora',
  },
}

export default function TalismanTool({ locale = 'ko' }: { locale?: string }) {
  const l = lang(locale)
  const t = T[l]
  const today = new Date()

  const [year, setYear] = useState(1995)
  const [month, setMonth] = useState(1)
  const [day, setDay] = useState(1)
  const [hour, setHour] = useState<number | null>(null)
  const [minute, setMinute] = useState<number | null>(null)
  const [cityId, setCityId] = useState('')
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [savedLocationRecord, setSavedLocationRecord] = useState<BirthRecordV2 | null>(null)
  const [ignoreProfileLocation, setIgnoreProfileLocation] = useState(false)
  const [error, setError] = useState('')
  const [reading, setReading] = useState<TalismanReading | null>(null)
  const { profile, parsed, saveBirthRecord } = useProfilePrefill()
  const svgRef = useRef<HTMLDivElement>(null)

  // 프로필 프리필은 사용자가 손대기 전까지만 적용한다. useProfilePrefill 이
  // 렌더마다 새 profile 객체를 주기 때문에, 의존성만 걸어 두면 사용자가 고른
  // 도시를 곧바로 덮어써 "골라도 지워지는" 입력이 된다 — 2026-09-21 확인.
  const touched = useRef(false)

  useEffect(() => {
    if (!parsed || touched.current) return
    setYear(parsed.year)
    setMonth(parsed.month)
    setDay(parsed.day)
    setHour(parsed.hour)
    setMinute(parsed.hour === null ? null : (parsed.minute ?? 0))
    const record = resolveBirthRecord(profile)
    const city = CITIES.find((c) => c.zoneId === record?.zoneId && c.lon === record?.longitude) ?? null
    setSelectedCity(city)
    setCityId(city?.id ?? '')
    setSavedLocationRecord(city ? null : (record?.zoneId ? record : null))
    setIgnoreProfileLocation(false)
  }, [parsed, profile])

  const reset = () => { touched.current = true; setReading(null); setError('') }

  function compute() {
    setError('')
    if (hour === null) { setError(t.timeRequired); setReading(null); return }
    const clampedDay = Math.min(day, new Date(year, month, 0).getDate())
    const civilDate = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(clampedDay).padStart(2, '0')}`
    const civilTime = `${String(hour).padStart(2, '0')}:${String(minute ?? 0).padStart(2, '0')}`
    try {
      let record: BirthRecordV2
      if (selectedCity) {
        const location = resolveBirthLocation({ civilDate, civilTime, longitude: selectedCity.lon, zoneId: selectedCity.zoneId })
        if (location.status !== 'resolved') throw new RangeError('invalid-local-time')
        record = createBirthRecord({ civilDate, civilTime, ...location.location })
      } else {
        record = updateBirthRecordFromParts(
          savedLocationRecord ?? (ignoreProfileLocation ? null : resolveBirthRecord(profile)),
          { year, month, day: clampedDay, hour, minute },
        )
      }
      const resolution = calculateBirthSaju(record)
      if (resolution.status !== 'resolved' || !resolution.standard.hour) { setError(t.cityRequired); setReading(null); return }
      const analysis = analyzeSaju({
        birthDate: resolution.instant,
        day: resolution.standard.day,
        dayMaster: resolution.standard.day.heavenlyStem,
        gender: 'male',
        hour: resolution.standard.hour,
        isLunar: false,
        month: resolution.standard.month,
        year: resolution.standard.year,
      })
      setReading(readingFromBirth({
        date: new Date(year, month - 1, clampedDay),
        hour,
        element: analysis.weakElement,
      }))
      saveBirthRecord(record)
    } catch {
      setError(selectedCity || savedLocationRecord ? t.invalid : t.cityRequired)
      setReading(null)
    }
  }

  const svg = useMemo(() => (reading ? drawTalisman(reading) : ''), [reading])
  const sym = reading ? ELEMENT_SYMBOLS[reading.element] : null
  const fileBase = `oiyo-talisman-${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`

  function downloadSvg() {
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
    triggerDownload(URL.createObjectURL(blob), `${fileBase}.svg`, true)
  }

  function downloadPng() {
    // 부적은 인쇄해 붙이거나 잠금화면에 쓰는 물건이라 화면 해상도로는 모자란다.
    // 3배로 올려 굽는다.
    const scale = 3
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 200 * scale
      canvas.height = 340 * scale
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      triggerDownload(canvas.toDataURL('image/png'), `${fileBase}.png`, false)
    }
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  }

  function triggerDownload(href: string, name: string, revoke: boolean) {
    const a = document.createElement('a')
    a.href = href
    a.download = name
    a.click()
    if (revoke) URL.revokeObjectURL(href)
  }

  const rows = reading && sym
    ? [
        [t.element, `${sym.name[l] ?? sym.name.en} — ${sym.meaning[l] ?? sym.meaning.en}`],
        [t.pillars, `${t.yearP} ${reading.pillars[0]} · ${t.monthP} ${reading.pillars[1]} · ${t.dayP} ${reading.pillars[2]} · ${t.hourP} ${reading.pillars[3]}`],
        [t.trigram, TRIGRAM[reading.element]],
        [t.zodiac, `${reading.zodiac}︎`],
        [t.ogham, reading.ogham],
        [t.tone, String(reading.tone)],
        [t.tail, sym.tailGlyphs],
      ]
    : []

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">{t.subtitle}</p>
      </div>

      <div className="rounded-2xl border bg-card p-5 space-y-4">
        <BirthDateField
          id="talisman-birth-date"
          locale={l as any}
          value={`${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`}
          onChange={(v) => {
            const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v)
            if (!m) return
            setYear(Number(m[1])); setMonth(Number(m[2])); setDay(Number(m[3])); reset()
          }}
        />
        <ProfileTimeField
          locale={l as any}
          value={hour === null ? '' : `${String(hour).padStart(2, '0')}:${String(minute ?? 0).padStart(2, '0')}`}
          onChange={(v) => {
            if (!v) { setHour(null); setMinute(null); reset(); return }
            const m = /^(\d{2}):(\d{2})$/.exec(v)
            if (m) { setHour(Number(m[1])); setMinute(Number(m[2])); reset() }
          }}
        />
        <CityField
          id="talisman-birth-city"
          locale={l}
          value={cityId}
          selected={selectedCity}
          required
          onChange={(id, city) => {
            setCityId(id); setSelectedCity(city); setSavedLocationRecord(null)
            setIgnoreProfileLocation(!city); reset()
          }}
        />
        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium leading-6 text-red-800">{error}</p>
        )}
        <button
          type="button"
          onClick={compute}
          className="min-h-12 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {reading ? t.redraw : t.draw}
        </button>
      </div>

      {reading && (
        <>
          <div className="flex justify-center">
            <div
              ref={svgRef}
              className="rounded-lg shadow-lg [&>svg]:h-auto [&>svg]:w-[240px] sm:[&>svg]:w-[280px]"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={downloadSvg}
              className="min-h-11 rounded-xl border border-primary/40 px-4 text-sm font-bold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {t.download}
            </button>
            <button
              type="button"
              onClick={downloadPng}
              className="min-h-11 rounded-xl border border-primary/40 px-4 text-sm font-bold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {t.downloadPng}
            </button>
          </div>

          <div className="rounded-2xl border bg-card p-5 space-y-3">
            <h2 className="text-sm font-bold">{t.reading}</h2>
            {/* 일지의 12지신과 태양 궁 — 이미 그려 둔 결과 심볼 에셋을 쓴다.
                부적 판에는 문자만 올리므로(지어낸 그림 금지) 그림은 여기 둔다. */}
            <div className="flex justify-center gap-6 pb-1">
              {[
                [BRANCH_ANIMAL[reading.pillars[2][1]], 'chinese-zodiac' as const, t.dayP],
                [ZODIAC_NAME[reading.zodiac], 'western-zodiac' as const, t.zodiac],
              ].map(([variant, id, label]) =>
                variant ? (
                  <figure key={id} className="m-0 text-center">
                    <ResultSymbol id={id} variant={variant} fallback="○" className="mx-auto h-16 w-16" />
                    <figcaption className="mt-1 text-[11px] text-muted-foreground">{label}</figcaption>
                  </figure>
                ) : null,
              )}
            </div>
            <dl className="space-y-2">
              {rows.map(([k, v]) => (
                <div key={k} className="flex gap-3 border-b border-border/50 pb-2 last:border-0 last:pb-0">
                  <dt className="w-28 shrink-0 text-xs font-bold text-muted-foreground">{k}</dt>
                  <dd className="min-w-0 flex-1 break-words text-sm">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </>
      )}

      <p className="text-center text-xs leading-relaxed text-muted-foreground">{t.note}</p>
    </div>
  )
}
