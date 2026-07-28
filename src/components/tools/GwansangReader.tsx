import { useState } from 'react'

type SupportedLang = 'ko' | 'en' | 'ja'
function lang(locale: string): SupportedLang {
  return (['ko', 'en', 'ja'] as const).includes(locale as SupportedLang) ? (locale as SupportedLang) : 'en'
}

type L = Record<SupportedLang, string>
interface Option { key: string; emoji: string; label: L; reading: L }
interface Area { id: string; label: L; options: Option[] }

const AREAS: Area[] = [
  {
    id: 'face', label: { ko: '얼굴형', en: 'Face shape', ja: '顔の形' },
    options: [
      { key: 'round', emoji: '🌕', label: { ko: '둥근형', en: 'Round', ja: '丸顔' }, reading: { ko: '원만하고 친화력이 좋으며 사람과 재물이 따르는 상입니다.', en: 'Harmonious and sociable — people and fortune tend to follow.', ja: '円満で親和力があり、人と財が集まる相です。' } },
      { key: 'square', emoji: '⬛', label: { ko: '각진형', en: 'Square', ja: '角顔' }, reading: { ko: '의지가 강하고 추진력이 있어 리더에 어울리는 상입니다.', en: 'Strong-willed and driven — a natural fit for leadership.', ja: '意志が強く推進力があり、リーダーに向く相です。' } },
      { key: 'oval', emoji: '🥚', label: { ko: '갸름형', en: 'Oval', ja: '面長' }, reading: { ko: '섬세하고 사고가 깊으며 예술·기획에 재능이 있는 상입니다.', en: 'Refined and thoughtful — gifted in art and planning.', ja: '繊細で思慮深く、芸術・企画に才のある相です。' } },
    ],
  },
  {
    id: 'forehead', label: { ko: '이마', en: 'Forehead', ja: '額' },
    options: [
      { key: 'wide', emoji: '🔆', label: { ko: '넓은 이마', en: 'Wide', ja: '広い額' }, reading: { ko: '총명하고 지혜로우며 초년운과 학업운이 좋은 상입니다.', en: 'Bright and wise — strong early-life and academic fortune.', ja: '聡明で知恵があり、若年運・学業運の良い相です。' } },
      { key: 'round', emoji: '🌗', label: { ko: '둥근 이마', en: 'Round', ja: '丸い額' }, reading: { ko: '낙천적이고 인복이 많아 주변의 도움을 잘 받는 상입니다.', en: 'Optimistic and well-liked — supported by those around you.', ja: '楽天的で人に恵まれ、周囲の助けを受ける相です。' } },
      { key: 'narrow', emoji: '🔅', label: { ko: '좁은 이마', en: 'Narrow', ja: '狭い額' }, reading: { ko: '집중력이 좋고 실속을 챙기며 꾸준히 성취하는 상입니다.', en: 'Focused and practical — achieves steadily over time.', ja: '集中力があり実利を重んじ、着実に成し遂げる相です。' } },
    ],
  },
  {
    id: 'eyebrows', label: { ko: '눈썹', en: 'Eyebrows', ja: '眉' },
    options: [
      { key: 'thick', emoji: '🪵', label: { ko: '짙은 눈썹', en: 'Thick', ja: '濃い眉' }, reading: { ko: '기개와 의지가 강하고 추진력이 넘치는 상입니다.', en: 'Spirited and determined — full of drive.', ja: '気概と意志が強く、推進力にあふれる相です。' } },
      { key: 'thin', emoji: '➰', label: { ko: '가는 눈썹', en: 'Thin', ja: '細い眉' }, reading: { ko: '섬세하고 감성이 풍부하며 미적 감각이 뛰어난 상입니다.', en: 'Delicate and emotionally rich — strong aesthetic sense.', ja: '繊細で感性豊か、美的感覚に優れた相です。' } },
      { key: 'straight', emoji: '➖', label: { ko: '일자 눈썹', en: 'Straight', ja: '一文字眉' }, reading: { ko: '결단력이 있고 강직하며 신뢰를 주는 상입니다.', en: 'Decisive and upright — inspires trust.', ja: '決断力があり剛直で、信頼を与える相です。' } },
    ],
  },
  {
    id: 'eyes', label: { ko: '눈', en: 'Eyes', ja: '目' },
    options: [
      { key: 'big', emoji: '👁️', label: { ko: '큰 눈', en: 'Large', ja: '大きい目' }, reading: { ko: '감수성이 풍부하고 표현력이 좋아 인기가 많은 상입니다.', en: 'Sensitive and expressive — naturally popular.', ja: '感受性が豊かで表現力があり、人気のある相です。' } },
      { key: 'narrow', emoji: '😌', label: { ko: '가는 눈', en: 'Narrow', ja: '細い目' }, reading: { ko: '통찰력이 깊고 신중하며 집중력이 뛰어난 상입니다.', en: 'Insightful and prudent — highly focused.', ja: '洞察力が深く慎重で、集中力に優れた相です。' } },
      { key: 'soft', emoji: '🙂', label: { ko: '처진 눈', en: 'Soft/downturned', ja: 'たれ目' }, reading: { ko: '온화하고 다정하여 사람들에게 편안함을 주는 상입니다.', en: 'Gentle and warm — puts people at ease.', ja: '穏やかで優しく、人に安心感を与える相です。' } },
    ],
  },
  {
    id: 'nose', label: { ko: '코', en: 'Nose', ja: '鼻' },
    options: [
      { key: 'big', emoji: '👃', label: { ko: '큰 코', en: 'Large', ja: '大きい鼻' }, reading: { ko: '자존감과 추진력이 강하고 재물운이 좋은 상입니다.', en: 'Strong self-esteem and drive — good wealth fortune.', ja: '自尊心と推進力が強く、財運の良い相です。' } },
      { key: 'high', emoji: '⛰️', label: { ko: '오똑한 코', en: 'High bridge', ja: '高い鼻' }, reading: { ko: '자긍심이 높고 명예를 중시하며 품격이 있는 상입니다.', en: 'Proud and honor-driven — carries dignity.', ja: '自負心が高く名誉を重んじ、品格のある相です。' } },
      { key: 'round', emoji: '🔵', label: { ko: '둥근 코', en: 'Round tip', ja: '丸い鼻' }, reading: { ko: '원만하고 친화적이며 재복과 인복이 따르는 상입니다.', en: 'Amiable and approachable — blessed with wealth and people.', ja: '円満で親しみやすく、財福と人福に恵まれる相です。' } },
    ],
  },
  {
    id: 'mouth', label: { ko: '입', en: 'Mouth', ja: '口' },
    options: [
      { key: 'big', emoji: '👄', label: { ko: '큰 입', en: 'Large', ja: '大きい口' }, reading: { ko: '대범하고 식복이 있으며 리더십이 돋보이는 상입니다.', en: 'Bold and abundant — leadership stands out.', ja: '大胆で食福があり、リーダーシップが際立つ相です。' } },
      { key: 'small', emoji: '👛', label: { ko: '작은 입', en: 'Small', ja: '小さい口' }, reading: { ko: '섬세하고 신중하며 자기 관리를 잘하는 상입니다.', en: 'Delicate and prudent — strong self-management.', ja: '繊細で慎重、自己管理に長けた相です。' } },
      { key: 'full', emoji: '💋', label: { ko: '도톰한 입술', en: 'Full lips', ja: '厚い唇' }, reading: { ko: '다정하고 표현이 풍부하며 인복이 많은 상입니다.', en: 'Affectionate and expressive — blessed with people.', ja: '情が深く表現豊かで、人に恵まれる相です。' } },
    ],
  },
]

const T: Record<SupportedLang, { title: string; subtitle: string; pick: string; result: string; reset: string; summary: string; note: string }> = {
  ko: { title: '관상 자가진단', subtitle: '얼굴 부위를 골라 전통 관상으로 보는 나의 기질',
    pick: '각 부위에서 나와 가장 가까운 모습을 골라보세요', result: '관상 보기', reset: '다시 선택',
    summary: '종합하면, 당신의 얼굴에는 위와 같은 기질과 운의 흐름이 어우러져 있습니다. 관상은 고정된 운명이 아니라, 표정과 마음가짐으로 가꿔지는 것입니다.',
    note: '전통 관상(觀相) 해석을 바탕으로 한 참고·재미용 콘텐츠입니다. 외모로 사람을 단정하지 않으며, 절대적 해석이 아닙니다.' },
  en: { title: 'Face Reading (Gwansang)', subtitle: 'Pick your features and read your temperament through traditional Korean physiognomy',
    pick: 'Choose the closest match for each feature', result: 'Read my face', reset: 'Choose again',
    summary: 'In sum, your face weaves together the temperaments and fortunes above. Physiognomy is not a fixed fate — it is shaped by your expression and your heart.',
    note: 'Reference / for-fun content based on traditional Korean physiognomy (Gwansang). It does not judge people by looks and is not an absolute reading.' },
  ja: { title: '観相セルフ診断', subtitle: '顔のパーツを選んで、伝統的な観相で見る自分の気質',
    pick: '各パーツで自分に最も近いものを選んでください', result: '観相を見る', reset: '選び直す',
    summary: '総合すると、あなたの顔には上記の気質と運の流れが織り込まれています。観相は固定された運命ではなく、表情と心がけで育てるものです。',
    note: '伝統的な観相に基づく参考・娯楽用コンテンツです。外見で人を断定するものではなく、絶対的な解釈ではありません。' },
}

interface Props { locale?: string }

export default function GwansangReader({ locale: lp = 'ko' }: Props) {
  const l = lang(lp ?? 'ko')
  const t = T[l]
  const [sel, setSel] = useState<Record<string, string>>({})
  const [done, setDone] = useState(false)

  const allPicked = AREAS.every((a) => sel[a.id])

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">{t.subtitle}</p>
      </div>

      {!done && (
        <>
          <p className="text-center text-xs text-muted-foreground">{t.pick}</p>
          {AREAS.map((a) => (
            <div key={a.id} className="rounded-xl border bg-card p-4">
              <p className="text-sm font-bold mb-2">{a.label[l]}</p>
              <div className="grid grid-cols-3 gap-2">
                {a.options.map((o) => (
                  <button key={o.key} onClick={() => setSel((s) => ({ ...s, [a.id]: o.key }))}
                    aria-pressed={sel[a.id] === o.key}
                    className={`rounded-lg border px-2 py-3 text-center transition-colors ${sel[a.id] === o.key ? 'border-green-500 bg-green-50' : 'hover:bg-accent'}`}>
                    <div className="text-2xl mb-1">{o.emoji}</div>
                    <div className="text-xs font-medium">{o.label[l]}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button onClick={() => setDone(true)} disabled={!allPicked}
            className="w-full rounded-xl bg-green-600 text-white px-4 py-3 text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40">
            {t.result}
          </button>
        </>
      )}

      {done && (
        <>
          <div className="space-y-3">
            {AREAS.map((a) => {
              const o = a.options.find((x) => x.key === sel[a.id])
              if (!o) return null
              return (
                <div key={a.id} className="rounded-xl border bg-card p-4 flex gap-3 items-start">
                  <span className="text-2xl flex-none">{o.emoji}</span>
                  <div>
                    <p className="text-xs font-bold text-green-600">{a.label[l]} · {o.label[l]}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">{o.reading[l]}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="rounded-xl bg-green-50 border border-green-100 p-4">
            <p className="text-sm text-green-900 leading-relaxed">{t.summary}</p>
          </div>
          <button onClick={() => { setDone(false); setSel({}) }}
            className="w-full rounded-xl border bg-card px-4 py-2.5 text-sm font-bold hover:bg-accent transition-colors">
            {t.reset}
          </button>
        </>
      )}

      <p className="text-center text-xs text-muted-foreground leading-relaxed">{t.note}</p>
    </div>
  )
}
