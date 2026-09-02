import { useState } from 'react'
import { BirthDateField, ProfileGenderField, ProfileTimeField } from '../shared/BirthDateField'
import { birthCivilToInstant } from '../../lib/ontology/kernel/time'
import { calculateSaju, analyzeSaju, STANDARD_MERIDIAN_KST } from '../../lib/ontology/saju/logic'
import { FiveElement } from '../../lib/ontology/saju/types'

type SupportedLang = 'ko' | 'en' | 'ja'
function lang(locale: string): SupportedLang {
  return (['ko', 'en', 'ja'] as const).includes(locale as SupportedLang) ? (locale as SupportedLang) : 'en'
}

const ORDER: FiveElement[] = [FiveElement.WOOD, FiveElement.FIRE, FiveElement.EARTH, FiveElement.METAL, FiveElement.WATER]

const EL_COLOR: Record<FiveElement, string> = {
  [FiveElement.WOOD]: '#10b981',
  [FiveElement.FIRE]: '#ef4444',
  [FiveElement.EARTH]: '#f59e0b',
  [FiveElement.METAL]: '#a1a1aa',
  [FiveElement.WATER]: '#3b82f6',
}

const EL_NAME: Record<FiveElement, Record<SupportedLang, string>> = {
  [FiveElement.WOOD]: { ko: '목(木)', en: 'Wood (木)', ja: '木' },
  [FiveElement.FIRE]: { ko: '화(火)', en: 'Fire (火)', ja: '火' },
  [FiveElement.EARTH]: { ko: '토(土)', en: 'Earth (土)', ja: '土' },
  [FiveElement.METAL]: { ko: '금(金)', en: 'Metal (金)', ja: '金' },
  [FiveElement.WATER]: { ko: '수(水)', en: 'Water (水)', ja: '水' },
}

interface Remedy { colorName: string; direction: string; season: string; energy: string; people: string; items: string[]; advice: string }

const REMEDY: Record<FiveElement, Record<SupportedLang, Remedy>> = {
  [FiveElement.WOOD]: {
    ko: { colorName: '초록·청록색', direction: '동쪽', season: '봄', energy: '성장·생명력·유연함', people: '목(木) 기운이 강한 사람 — 따뜻하고 성장 지향적이며 배움을 즐기는 사람',
      items: ['초록 식물·나무 소품 곁에 두기', '목재 가구·천연 소재 활용', '독서와 새로운 배움', '아침 산책과 숲', '신맛 음식(매실·식초·녹색 채소)'],
      advice: '새로운 시작과 꾸준한 배움이 당신의 부족한 생명력을 채워줍니다.' },
    en: { colorName: 'green / teal', direction: 'East', season: 'spring', energy: 'growth, vitality, flexibility', people: 'people strong in Wood — warm, growth-oriented, and fond of learning',
      items: ['keep green plants and wooden items nearby', 'use wooden furniture and natural materials', 'reading and learning something new', 'morning walks and forests', 'sour foods (plum, vinegar, greens)'],
      advice: 'Fresh starts and steady learning replenish the vitality you lack.' },
    ja: { colorName: '緑・青緑', direction: '東', season: '春', energy: '成長・生命力・柔軟さ', people: '木の気が強い人 — 温かく成長志向で学びを好む人',
      items: ['緑の植物・木の小物をそばに', '木製家具・天然素材を活用', '読書と新しい学び', '朝の散歩と森', '酸味の食べ物（梅・酢・緑の野菜）'],
      advice: '新しい始まりと着実な学びが、あなたに足りない生命力を満たします。' },
  },
  [FiveElement.FIRE]: {
    ko: { colorName: '빨강·주황색', direction: '남쪽', season: '여름', energy: '열정·표현·활력', people: '화(火) 기운이 강한 사람 — 밝고 활기차며 표현이 풍부한 사람',
      items: ['따뜻한 조명과 촛불', '빨강·주황 포인트 소품', '운동과 활발한 활동', '햇빛 쬐기', '쓴맛 음식(커피·나물)'],
      advice: '열정을 표현하고 사람들과 어울리는 시간이 당신의 부족한 활력을 채워줍니다.' },
    en: { colorName: 'red / orange', direction: 'South', season: 'summer', energy: 'passion, expression, vitality', people: 'people strong in Fire — bright, energetic, and expressive',
      items: ['warm lighting and candles', 'red/orange accent items', 'exercise and lively activity', 'sunlight', 'bitter foods (coffee, leafy greens)'],
      advice: 'Expressing passion and connecting with people replenish the vitality you lack.' },
    ja: { colorName: '赤・オレンジ', direction: '南', season: '夏', energy: '情熱・表現・活力', people: '火の気が強い人 — 明るく活気があり表現豊かな人',
      items: ['暖かい照明とキャンドル', '赤・オレンジの小物', '運動と活発な活動', '日光を浴びる', '苦味の食べ物（コーヒー・山菜）'],
      advice: '情熱を表現し人と関わる時間が、あなたに足りない活力を満たします。' },
  },
  [FiveElement.EARTH]: {
    ko: { colorName: '노랑·황토색', direction: '중앙', season: '환절기', energy: '안정·신뢰·중심', people: '토(土) 기운이 강한 사람 — 든든하고 신뢰감 있으며 포용하는 사람',
      items: ['도자기·흙 소재 소품', '노랑·베이지 톤 인테리어', '규칙적인 생활 리듬', '자연·흙과 가까이', '단맛 음식(곡물·고구마·대추)'],
      advice: '꾸준한 루틴과 안정된 환경이 당신의 부족한 중심을 채워줍니다.' },
    en: { colorName: 'yellow / ochre', direction: 'Center', season: 'transition seasons', energy: 'stability, trust, centeredness', people: 'people strong in Earth — dependable, trustworthy, and embracing',
      items: ['ceramic and earthen items', 'yellow/beige tones', 'a regular daily rhythm', 'closeness to nature and soil', 'sweet foods (grains, sweet potato, jujube)'],
      advice: 'Steady routines and a stable environment replenish the center you lack.' },
    ja: { colorName: '黄・黄土色', direction: '中央', season: '季節の変わり目', energy: '安定・信頼・中心', people: '土の気が強い人 — 頼もしく信頼でき包容力のある人',
      items: ['陶器・土の素材の小物', '黄・ベージュのトーン', '規則的な生活リズム', '自然・土と近づく', '甘味の食べ物（穀物・さつまいも・なつめ）'],
      advice: '着実なルーティンと安定した環境が、あなたに足りない中心を満たします。' },
  },
  [FiveElement.METAL]: {
    ko: { colorName: '흰색·은색', direction: '서쪽', season: '가을', energy: '결단·질서·정제', people: '금(金) 기운이 강한 사람 — 명료하고 원칙 있으며 깔끔한 사람',
      items: ['금속·은색 소품', '흰색 정돈된 공간', '정리정돈과 규칙', '깊은 호흡·명상', '매운맛 음식(생강·마늘·무)'],
      advice: '정리하고 비우며 원칙을 세우는 일이 당신의 부족한 결단력을 채워줍니다.' },
    en: { colorName: 'white / silver', direction: 'West', season: 'autumn', energy: 'decisiveness, order, refinement', people: 'people strong in Metal — clear, principled, and tidy',
      items: ['metal/silver items', 'clean white spaces', 'organizing and structure', 'deep breathing and meditation', 'pungent foods (ginger, garlic, radish)'],
      advice: 'Decluttering and setting clear principles replenish the resolve you lack.' },
    ja: { colorName: '白・銀色', direction: '西', season: '秋', energy: '決断・秩序・洗練', people: '金の気が強い人 — 明晰で原則があり清潔な人',
      items: ['金属・銀色の小物', '白く整った空間', '整理整頓と規則', '深い呼吸・瞑想', '辛味の食べ物（生姜・にんにく・大根）'],
      advice: '整理し手放し原則を立てることが、あなたに足りない決断力を満たします。' },
  },
  [FiveElement.WATER]: {
    ko: { colorName: '검정·남색', direction: '북쪽', season: '겨울', energy: '지혜·유연·휴식', people: '수(水) 기운이 강한 사람 — 깊이 있고 지혜로우며 차분한 사람',
      items: ['물·어항·분수 가까이', '검정·남색 포인트', '충분한 휴식과 수면', '명상과 사색', '짠맛 음식(해조류·콩)'],
      advice: '깊이 쉬고 사색하며 흐름에 맡기는 일이 당신의 부족한 지혜를 채워줍니다.' },
    en: { colorName: 'black / navy', direction: 'North', season: 'winter', energy: 'wisdom, flow, rest', people: 'people strong in Water — deep, wise, and calm',
      items: ['be near water, aquariums, fountains', 'black/navy accents', 'ample rest and sleep', 'meditation and reflection', 'salty foods (seaweed, beans)'],
      advice: 'Deep rest, reflection, and going with the flow replenish the wisdom you lack.' },
    ja: { colorName: '黒・紺色', direction: '北', season: '冬', energy: '知恵・柔軟・休息', people: '水の気が強い人 — 深く知恵があり落ち着いた人',
      items: ['水・水槽・噴水のそばに', '黒・紺のポイント', '十分な休息と睡眠', '瞑想と思索', '塩味の食べ物（海藻・豆）'],
      advice: '深く休み思索し流れに任せることが、あなたに足りない知恵を満たします。' },
  },
}

const L: Record<SupportedLang, {
  title: string; subtitle: string; year: string; month: string; day: string; hour: string; hourUnknown: string;
  gender: string; male: string; female: string; calc: string; recompute: string;
  distribution: string; lacking: string; lackingNone: string; prescription: string;
  colorLabel: string; directionLabel: string; seasonLabel: string; numberLabel: string;
  energyLabel: string; peopleLabel: string; itemsLabel: string; note: string;
}> = {
  ko: { title: '나의 보완 기운', subtitle: '사주 오행으로 보는, 나에게 부족한 기운을 채우는 색·방향·사람',
    year: '태어난 해', month: '월', day: '일', hour: '시(선택)', hourUnknown: '모름',
    gender: '성별', male: '남', female: '여', calc: '내 보완 기운 보기', recompute: '다시 계산',
    distribution: '나의 오행 분포', lacking: '가장 부족한 기운', lackingNone: '오행이 비교적 고르게 갖춰져 있어요. 아래는 상대적으로 약한 기운의 보완법입니다.',
    prescription: '보완 처방', colorLabel: '보완 색', directionLabel: '이로운 방향', seasonLabel: '기운의 계절', numberLabel: '행운 숫자',
    energyLabel: '채워지는 기운', peopleLabel: '함께하면 좋은 사람', itemsLabel: '보완하는 색·기운·아이템',
    note: '전통 명리학의 오행 균형 이론을 바탕으로 한 참고용 콘텐츠입니다. 절대적 해석이 아니며 재미와 자기성찰을 위한 것입니다.' },
  en: { title: 'My Complementary Energy', subtitle: 'The color, direction & people that fill what your Five-Element chart lacks',
    year: 'Birth year', month: 'Month', day: 'Day', hour: 'Hour (optional)', hourUnknown: 'Unknown',
    gender: 'Gender', male: 'M', female: 'F', calc: 'See my complementary energy', recompute: 'Recompute',
    distribution: 'My Five-Element balance', lacking: 'Your most lacking energy', lackingNone: 'Your elements are fairly balanced. Below is the remedy for your relatively weaker energy.',
    prescription: 'Your Remedy', colorLabel: 'Color', directionLabel: 'Favorable direction', seasonLabel: 'Season of energy', numberLabel: 'Lucky number',
    energyLabel: 'Energy you gain', peopleLabel: 'People good to be with', itemsLabel: 'Colors, energy & items that help',
    note: 'Reference content based on the traditional Five-Element balance theory. Not an absolute reading — for fun and self-reflection.' },
  ja: { title: '私の補完する気', subtitle: '四柱の五行で見る、自分に足りない気を満たす色・方向・人',
    year: '生まれた年', month: '月', day: '日', hour: '時(任意)', hourUnknown: '不明',
    gender: '性別', male: '男', female: '女', calc: '私の補完する気を見る', recompute: '再計算',
    distribution: '私の五行バランス', lacking: '最も足りない気', lackingNone: '五行は比較的整っています。以下は相対的に弱い気の補完法です。',
    prescription: '補完の処方', colorLabel: '補う色', directionLabel: '吉方位', seasonLabel: '気の季節', numberLabel: 'ラッキーナンバー',
    energyLabel: '満たされる気', peopleLabel: '一緒にいると良い人', itemsLabel: '補う色・気・アイテム',
    note: '伝統的な命理学の五行バランス理論に基づく参考用コンテンツです。絶対的な解釈ではなく、楽しみと自己省察のためのものです。' },
}

interface Props { locale?: string }

export default function ElementalRemedyTool({ locale: lp = 'ko' }: Props) {
  const l = lang(lp ?? 'ko')
  const t = L[l]
  const now = new Date()
  const [year, setYear] = useState(1995)
  const [month, setMonth] = useState(6)
  const [day, setDay] = useState(15)
  const [hour, setHour] = useState<number | null>(null)
  const [gender, setGender] = useState<'male' | 'female'>('female')
  const [done, setDone] = useState(false)

  const daysInMonth = new Date(year, month, 0).getDate()

  function compute() {
    const clampedDay = Math.min(day, daysInMonth)
    if (day !== clampedDay) setDay(clampedDay)
    setDone(true)
  }

  let analysis: ReturnType<typeof analyzeSaju> | null = null
  if (done) {
    try {
      const birth = birthCivilToInstant({
        day: Math.min(day, daysInMonth),
        hour: hour ?? 12,
        minute: 0,
        month,
        year,
      })
      const saju = calculateSaju(birth, false, gender, STANDARD_MERIDIAN_KST)
      analysis = analyzeSaju(saju)
    } catch {
      analysis = null
    }
  }

  const weak = analysis?.weakElement ?? FiveElement.WOOD
  const counts = analysis?.elementCounts
  const maxCount = counts ? Math.max(...ORDER.map((e) => counts[e]), 1) : 1
  const r = REMEDY[weak][l]
  const luckyNumber = analysis?.luckyAttributes?.number
  const isBalanced = counts ? Math.max(...ORDER.map((e) => counts[e])) - Math.min(...ORDER.map((e) => counts[e])) <= 1 : false

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">{t.subtitle}</p>
      </div>

      <div className="rounded-2xl border bg-card p-5 space-y-4">
        <BirthDateField
          id="elemental-birth-date"
          locale={l}
          value={`${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`}
          onChange={(v) => {
            const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v)
            if (!m) return
            setYear(Number(m[1]))
            setMonth(Number(m[2]))
            setDay(Number(m[3]))
            setDone(false)
          }}
        />
        <ProfileTimeField
          locale={l}
          value={hour === null ? '' : `${String(hour).padStart(2, '0')}:00`}
          onChange={(v) => {
            if (!v) { setHour(null); setDone(false); return }
            const m = /^(\d{2}):/.exec(v)
            if (m) { setHour(Number(m[1])); setDone(false) }
          }}
        />
        <ProfileGenderField
          locale={l}
          label={t.gender}
          value={gender}
          onChange={(g) => {
            if (g === 'male' || g === 'female') setGender(g)
            setDone(false)
          }}
        />
        <button onClick={compute}
          className="w-full rounded-xl bg-primary text-primary-foreground px-4 py-3 text-sm font-bold hover:opacity-90 transition-opacity">
          {done ? t.recompute : t.calc}
        </button>
      </div>

      {done && counts && (
        <>
          <div className="rounded-2xl border bg-card p-5 space-y-3">
            <h2 className="text-sm font-bold">{t.distribution}</h2>
            <div className="space-y-2">
              {ORDER.map((e) => (
                <div key={e} className="flex items-center gap-3">
                  <span className="w-12 text-xs font-bold" style={{ color: EL_COLOR[e] }}>{EL_NAME[e][l]}</span>
                  <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(counts[e] / maxCount) * 100}%`, backgroundColor: EL_COLOR[e] }} />
                  </div>
                  <span className="w-6 text-right text-xs font-bold text-muted-foreground">{counts[e]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">{t.lacking}</p>
            <div className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-xl font-bold text-white"
              style={{ backgroundColor: EL_COLOR[weak] }}>
              <span>{EL_NAME[weak][l]}</span>
            </div>
            {isBalanced && <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">{t.lackingNone}</p>}
          </div>

          <div className="rounded-2xl border bg-card p-5 space-y-4">
            <h2 className="font-bold text-green-600">{t.prescription}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border p-3 text-center">
                <p className="text-[11px] text-muted-foreground mb-1">{t.colorLabel}</p>
                <div className="w-6 h-6 rounded-full mx-auto mb-1 border" style={{ backgroundColor: EL_COLOR[weak] }} />
                <p className="text-xs font-bold">{r.colorName}</p>
              </div>
              <div className="rounded-xl border p-3 text-center">
                <p className="text-[11px] text-muted-foreground mb-1">{t.directionLabel}</p>
                <p className="text-lg">🧭</p>
                <p className="text-xs font-bold">{r.direction}</p>
              </div>
              <div className="rounded-xl border p-3 text-center">
                <p className="text-[11px] text-muted-foreground mb-1">{t.seasonLabel}</p>
                <p className="text-lg">🌿</p>
                <p className="text-xs font-bold">{r.season}</p>
              </div>
              <div className="rounded-xl border p-3 text-center">
                <p className="text-[11px] text-muted-foreground mb-1">{t.numberLabel}</p>
                <p className="text-lg">🔢</p>
                <p className="text-xs font-bold">{luckyNumber ?? '-'}</p>
              </div>
            </div>

            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-[11px] text-muted-foreground mb-1">{t.energyLabel}</p>
              <p className="text-sm font-medium">{r.energy}</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-[11px] text-muted-foreground mb-1">{t.peopleLabel}</p>
              <p className="text-sm">{r.people}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground mb-2">{t.itemsLabel}</p>
              <ul className="space-y-1">
                {r.items.map((it) => (
                  <li key={it} className="text-sm text-muted-foreground flex gap-2"><span className="text-green-500">→</span>{it}</li>
                ))}
              </ul>
            </div>
            <p className="text-sm font-medium text-green-700 leading-relaxed">{r.advice}</p>
          </div>
        </>
      )}

      <p className="text-center text-xs text-muted-foreground leading-relaxed">{t.note}</p>
    </div>
  )
}
