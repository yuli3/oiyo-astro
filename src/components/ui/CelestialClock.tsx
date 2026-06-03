import { useState, useEffect } from 'react'
import type { Locale } from '../../lib/i18n'

/* ── Solar calculations from Globe Dashboard (MIT spirit) ──────
   Computes the subsolar point and related astronomical data
   used in 명리학/사주 as seasonal/qi indicators.              */

function getSolarPosition(date: Date): { lon: number; lat: number; jieqi: string; jieqiName: Record<string, string> } {
  const JD = date.getTime() / 86400000 + 2440587.5
  const T = (JD - 2451545.0) / 36525
  const L0 = (280.46646 + T * (36000.76983 + T * 0.0003032)) % 360
  const M = (357.52911 + T * (35999.05029 - 0.0001537 * T)) % 360
  const Mr = M * Math.PI / 180
  const C = Math.sin(Mr) * (1.914602 - T * (0.004817 + 0.000014 * T))
    + Math.sin(2 * Mr) * (0.019993 - 0.000101 * T)
    + Math.sin(3 * Mr) * 0.000289
  const trueLong = L0 + C
  const omega = 125.04 - 1934.136 * T
  const lambda = trueLong - 0.00569 - 0.00478 * Math.sin(omega * Math.PI / 180)
  const eps = 23.439291 - T * (0.0130042 + T * (0.00000016 + T * 0.000000504))
  const lambdaR = lambda * Math.PI / 180
  const epsR = eps * Math.PI / 180
  const lat = Math.asin(Math.sin(epsR) * Math.sin(lambdaR)) * 180 / Math.PI
  const uth = date.getUTCHours() + date.getUTCMinutes() / 60
  let lon = ((12 - uth) * 15 + 540) % 360 - 180

  // Solar longitude (ecliptic) → 절기 (24 solar terms)
  const solarLon = ((lambda % 360) + 360) % 360
  const jieqiIndex = Math.floor(solarLon / 15) % 24
  const jieqiNames: Record<string, string>[] = [
    { ko: '소한', en: 'Minor Cold', ja: '小寒', cn: '小寒' },
    { ko: '대한', en: 'Major Cold', ja: '大寒', cn: '大寒' },
    { ko: '입춘', en: 'Start of Spring', ja: '立春', cn: '立春' },
    { ko: '우수', en: 'Rain Water', ja: '雨水', cn: '雨水' },
    { ko: '경칩', en: 'Awakening of Insects', ja: '啓蟄', cn: '惊蛰' },
    { ko: '춘분', en: 'Spring Equinox', ja: '春分', cn: '春分' },
    { ko: '청명', en: 'Clear and Bright', ja: '清明', cn: '清明' },
    { ko: '곡우', en: 'Grain Rain', ja: '穀雨', cn: '谷雨' },
    { ko: '입하', en: 'Start of Summer', ja: '立夏', cn: '立夏' },
    { ko: '소만', en: 'Grain Buds', ja: '小満', cn: '小满' },
    { ko: '망종', en: 'Grain in Ear', ja: '芒種', cn: '芒种' },
    { ko: '하지', en: 'Summer Solstice', ja: '夏至', cn: '夏至' },
    { ko: '소서', en: 'Minor Heat', ja: '小暑', cn: '小暑' },
    { ko: '대서', en: 'Major Heat', ja: '大暑', cn: '大暑' },
    { ko: '입추', en: 'Start of Autumn', ja: '立秋', cn: '立秋' },
    { ko: '처서', en: 'End of Heat', ja: '処暑', cn: '处暑' },
    { ko: '백로', en: 'White Dew', ja: '白露', cn: '白露' },
    { ko: '추분', en: 'Autumnal Equinox', ja: '秋分', cn: '秋分' },
    { ko: '한로', en: 'Cold Dew', ja: '寒露', cn: '寒露' },
    { ko: '상강', en: 'Frost\'s Descent', ja: '霜降', cn: '霜降' },
    { ko: '입동', en: 'Start of Winter', ja: '立冬', cn: '立冬' },
    { ko: '소설', en: 'Minor Snow', ja: '小雪', cn: '小雪' },
    { ko: '대설', en: 'Major Snow', ja: '大雪', cn: '大雪' },
    { ko: '동지', en: 'Winter Solstice', ja: '冬至', cn: '冬至' },
  ]

  return {
    lon,
    lat: parseFloat(lat.toFixed(1)),
    jieqi: jieqiNames[jieqiIndex].ko,
    jieqiName: jieqiNames[jieqiIndex],
  }
}

function getLunarPhase(date: Date): { phase: number; emoji: string; name: Record<string, string> } {
  // Simplified lunar phase (days since known new moon 2000-01-06)
  const known = new Date('2000-01-06T18:14:00Z').getTime()
  const synodic = 29.53058867
  const diff = (date.getTime() - known) / 86400000
  const phase = ((diff % synodic) + synodic) % synodic
  const pct = phase / synodic

  const phases: Array<{ min: number; max: number; emoji: string; name: Record<string, string> }> = [
    { min: 0,    max: 0.03, emoji: '🌑', name: { ko: '삭(신월)',  en: 'New Moon',       ja: '新月',   cn: '新月' } },
    { min: 0.03, max: 0.22, emoji: '🌒', name: { ko: '초승달',    en: 'Waxing Crescent', ja: '三日月', cn: '峨眉月' } },
    { min: 0.22, max: 0.28, emoji: '🌓', name: { ko: '상현달',    en: 'First Quarter',   ja: '上弦',   cn: '上弦月' } },
    { min: 0.28, max: 0.47, emoji: '🌔', name: { ko: '보름 전',   en: 'Waxing Gibbous',  ja: '十三夜', cn: '盈凸月' } },
    { min: 0.47, max: 0.53, emoji: '🌕', name: { ko: '망(보름)',  en: 'Full Moon',       ja: '満月',   cn: '满月' } },
    { min: 0.53, max: 0.72, emoji: '🌖', name: { ko: '보름 후',   en: 'Waning Gibbous',  ja: '十六夜', cn: '亏凸月' } },
    { min: 0.72, max: 0.78, emoji: '🌗', name: { ko: '하현달',    en: 'Last Quarter',    ja: '下弦',   cn: '下弦月' } },
    { min: 0.78, max: 0.97, emoji: '🌘', name: { ko: '그믐 전',   en: 'Waning Crescent', ja: '有明月', cn: '残月' } },
    { min: 0.97, max: 1.0,  emoji: '🌑', name: { ko: '그믐',      en: 'Dark Moon',       ja: '晦日',   cn: '晦月' } },
  ]

  const p = phases.find(p => pct >= p.min && pct < p.max) ?? phases[0]
  return { phase: parseFloat((pct * 100).toFixed(0)), emoji: p.emoji, name: p.name }
}

/* ── UI strings ─────────────────────────────────────────────── */
const LABELS: Record<string, Record<string, string>> = {
  title: { ko: '천문 시각', en: 'Celestial Time', ja: '天文時刻', cn: '天文时刻' },
  subtitle: { ko: '명리학의 근간인 절기와 천체 위치를 실시간으로 확인합니다', en: 'Real-time solar term and celestial position — the astronomical foundation of BaZi', ja: '四柱推命の基盤となる節気と天体位置をリアルタイムで確認', cn: '实时查看四柱命理基础的节气与天体位置' },
  solarTerm: { ko: '현재 절기', en: 'Current Solar Term', ja: '現在の節気', cn: '当前节气' },
  lunarPhase: { ko: '달의 위상', en: 'Lunar Phase', ja: '月の位相', cn: '月相' },
  solarLon: { ko: '태양 황경', en: 'Solar Longitude', ja: '太陽黄経', cn: '太阳黄经' },
  subLat: { ko: '태양 직하점 위도', en: 'Sub-solar Latitude', ja: '太陽直下点緯度', cn: '日下点纬度' },
  note: { ko: '절기는 사주 해석의 기준이 됩니다. 새로운 절기가 시작되면 년주·월주가 바뀝니다.', en: 'Solar terms are the foundation of BaZi interpretation. A new term shifts the Year and Month Pillars.', ja: '節気は四柱推命の解釈基準です。新しい節気が始まると年柱・月柱が変わります。', cn: '节气是八字解读的基础。每逢节气交替，年柱和月柱随之改变。' },
  yangPhase: { ko: '양기 고조', en: 'Yang Peak', ja: '陽気最盛', cn: '阳气最盛' },
  yinPhase: { ko: '음기 고조', en: 'Yin Peak', ja: '陰気最盛', cn: '阴气最盛' },
  qiBalance: { ko: '음양 균형', en: 'Yin-Yang Balance', ja: '陰陽バランス', cn: '阴阳平衡' },
}

function L(key: string, locale: string): string {
  return LABELS[key]?.[locale] ?? LABELS[key]?.en ?? key
}

interface Props { locale?: Locale }

export default function CelestialClock({ locale = 'ko' }: Props) {
  const [solar, setSolar] = useState<ReturnType<typeof getSolarPosition> | null>(null)
  const [lunar, setLunar] = useState<ReturnType<typeof getLunarPhase> | null>(null)
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    function update() {
      const d = new Date()
      setSolar(getSolarPosition(d))
      setLunar(getLunarPhase(d))
      setNow(d)
    }
    update()
    const id = setInterval(update, 60000)
    return () => clearInterval(id)
  }, [])

  if (!solar || !lunar || !now) {
    return (
      <div className="h-32 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl animate-pulse" />
    )
  }

  const loc = (locale as string).slice(0, 2) as 'ko' | 'en' | 'ja' | 'cn'
  const solarLon = ((solar.lat >= 0) ? 1 : -1) * Math.abs(solar.lat)

  // Yang/Yin strength: Northern summer = yang peak, winter = yin peak
  const yangStrength = Math.max(0, Math.min(100, Math.round(50 + solar.lat * 2)))

  const timeStr = now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  const dateStr = now.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #07050d 0%, #0d0a1e 50%, #07050d 100%)',
        borderRadius: 16,
        padding: '20px 24px',
        color: '#efe9da',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(239,233,218,0.1)',
      }}
    >
      {/* Starfield */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.4,
        backgroundImage: 'radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,.7), transparent), radial-gradient(1px 1px at 35% 70%, rgba(255,255,255,.5), transparent), radial-gradient(1px 1px at 60% 15%, rgba(255,255,255,.6), transparent), radial-gradient(1px 1px at 80% 55%, rgba(255,255,255,.5), transparent), radial-gradient(1px 1px at 90% 80%, rgba(255,255,255,.6), transparent)',
      }} />

      {/* Sun orbit visual */}
      <div style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', opacity: 0.12 }}>
        <svg width={100} height={100} viewBox="0 0 100 100">
          <circle cx={50} cy={50} r={46} fill="none" stroke="#c9a55c" strokeWidth={0.5} strokeDasharray="3 3" />
          <circle cx={50} cy={50} r={30} fill="none" stroke="#c9a55c" strokeWidth={0.3} strokeDasharray="2 4" />
          <circle cx={50} cy={50} r={8} fill="#c9a55c" opacity={0.6} />
          {/* Sun dot on outer orbit */}
          <circle
            cx={50 + 46 * Math.cos((solar.lon + 90) * Math.PI / 180)}
            cy={50 + 46 * Math.sin((solar.lon + 90) * Math.PI / 180)}
            r={4} fill="#fbbf24" opacity={0.9}
          />
        </svg>
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, opacity: 0.7 }}>☀</span>
              <span style={{ fontFamily: 'ui-monospace', fontSize: 10, letterSpacing: '0.2em', color: '#c9a55c', textTransform: 'uppercase' }}>
                {L('title', loc)}
              </span>
            </div>
            <div style={{ fontFamily: 'ui-monospace', fontSize: 11, color: 'rgba(239,233,218,0.5)', marginTop: 4 }}>
              {dateStr}
            </div>
          </div>
          <div style={{ fontFamily: 'ui-monospace', fontSize: 18, letterSpacing: '0.05em', color: '#efe9da' }}>
            {timeStr}
          </div>
        </div>

        {/* Data grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px 20px', marginBottom: 14 }}>
          {/* Solar term */}
          <div>
            <div style={{ fontFamily: 'ui-monospace', fontSize: 9, letterSpacing: '0.2em', color: 'rgba(239,233,218,0.4)', textTransform: 'uppercase', marginBottom: 3 }}>
              {L('solarTerm', loc)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 18 }}>🌱</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, color: '#c9a55c' }}>{solar.jieqiName[loc] ?? solar.jieqi}</div>
              </div>
            </div>
          </div>

          {/* Lunar phase */}
          <div>
            <div style={{ fontFamily: 'ui-monospace', fontSize: 9, letterSpacing: '0.2em', color: 'rgba(239,233,218,0.4)', textTransform: 'uppercase', marginBottom: 3 }}>
              {L('lunarPhase', loc)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 18 }}>{lunar.emoji}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#efe9da' }}>{lunar.name[loc] ?? lunar.name.en}</div>
              </div>
            </div>
          </div>

          {/* Solar longitude */}
          <div>
            <div style={{ fontFamily: 'ui-monospace', fontSize: 9, letterSpacing: '0.2em', color: 'rgba(239,233,218,0.4)', textTransform: 'uppercase', marginBottom: 3 }}>
              {L('solarLon', loc)}
            </div>
            <div style={{ fontFamily: 'ui-monospace', fontSize: 14, color: '#efe9da' }}>
              {solar.lon.toFixed(1)}°
            </div>
          </div>

          {/* Sub-solar latitude */}
          <div>
            <div style={{ fontFamily: 'ui-monospace', fontSize: 9, letterSpacing: '0.2em', color: 'rgba(239,233,218,0.4)', textTransform: 'uppercase', marginBottom: 3 }}>
              {L('subLat', loc)}
            </div>
            <div style={{ fontFamily: 'ui-monospace', fontSize: 14, color: '#efe9da' }}>
              {solar.lat > 0 ? '+' : ''}{solar.lat}°
            </div>
          </div>
        </div>

        {/* Yang/Yin bar */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'ui-monospace', fontSize: 9, letterSpacing: '0.14em', color: 'rgba(239,233,218,0.4)', textTransform: 'uppercase', marginBottom: 6 }}>
            <span style={{ color: '#c9a55c' }}>☀ {L('yangPhase', loc)}</span>
            <span>{L('qiBalance', loc)} · {yangStrength}%</span>
            <span style={{ color: '#7eb6d4' }}>☽ {L('yinPhase', loc)}</span>
          </div>
          <div style={{ height: 4, background: 'rgba(239,233,218,0.08)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${yangStrength}%`, background: 'linear-gradient(90deg, #c9a55c, #fbbf24)', borderRadius: 4 }} />
          </div>
        </div>

        {/* Note */}
        <div style={{ fontFamily: 'ui-monospace', fontSize: 9, letterSpacing: '0.08em', color: 'rgba(239,233,218,0.3)', lineHeight: 1.6 }}>
          {L('note', loc)}
        </div>
      </div>
    </div>
  )
}
