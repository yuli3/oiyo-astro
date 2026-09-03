import { useMemo, useState } from 'react';
import type { Locale } from '../../lib/i18n';

/**
 * 인지부조화 랩.
 *
 * blog 의 academy 글에 심겨 있던 실습(ko 전용, 색 하드코딩)을 oiyo 로 다시 만들었다.
 * 2026-09-03 주제 정렬 4단계 — 심리는 oiyo 소유 주제다.
 *
 * 원본과 달라진 것 셋:
 *  1) 6로케일. 원본은 한국어만 있었다.
 *  2) 색을 토큰으로. 원본은 green-600·amber-500·rose-600 을 직접 썼다.
 *  3) 긴장도 계산을 페스팅거(1957)의 정식화에 맞췄다. 그는 부조화의 크기를
 *     "부조화 인지가 전체 관련 인지에서 차지하는 비율"로 두고, 그 인지들이
 *     당사자에게 얼마나 중요한지로 가중한다고 했다. 원본은 임의의 곱셈식을
 *     썼는데, 여기서는 비율 × 중요도 형태로 바꾼다.
 *     다만 이 숫자는 설명을 위한 예시이지 측정값이 아니다 — 화면에도 그렇게 적는다.
 */

type ScenarioId = 'purchase' | 'habit' | 'group';
type StrategyId = 'behavior' | 'attitude' | 'trivialize' | 'add-cognition';

interface Inputs {
  /** 그 신념이 나에게 얼마나 중요한가 */
  importance: number;
  /** 신념과 행동이 얼마나 어긋나는가 */
  mismatch: number;
  /** 행동을 설명하는 다른 이유가 얼마나 있는가 */
  justification: number;
}

const L = <T,>(m: Record<Locale, T>, locale: Locale): T => m[locale] ?? m.en;

const UI: Record<Locale, {
  scenario: string; belief: string; behavior: string; importance: string;
  mismatch: string; justification: string; strategy: string; tension: string;
  before: string; after: string; reset: string; bands: [string, string, string];
  note: string; hint: string;
}> = {
  ko: { scenario: '상황', belief: '신념', behavior: '행동', importance: '이 신념의 중요도',
    mismatch: '신념과 행동의 어긋남', justification: '행동을 설명할 다른 이유',
    strategy: '부조화를 줄이는 방법', tension: '긴장도', before: '지금', after: '적용 후',
    reset: '처음으로', bands: ['낮음', '중간', '높음'],
    note: '이 숫자는 관계를 보여 주기 위한 예시입니다. 측정값이 아니며 사람을 평가하지 않습니다.',
    hint: '슬라이더를 움직여 보세요. 중요도가 0에 가까우면 아무리 어긋나도 긴장이 생기지 않습니다 — 페스팅거가 말한 지점입니다.' },
  en: { scenario: 'Situation', belief: 'Belief', behavior: 'Behaviour', importance: 'How much this belief matters',
    mismatch: 'Gap between belief and behaviour', justification: 'Other reasons that explain the behaviour',
    strategy: 'Ways to reduce dissonance', tension: 'Tension', before: 'Now', after: 'After applying',
    reset: 'Reset', bands: ['Low', 'Medium', 'High'],
    note: 'This number illustrates a relationship. It is not a measurement and it does not evaluate anyone.',
    hint: 'Move the sliders. When importance approaches zero, no tension appears however large the gap — that is Festinger’s point.' },
  ja: { scenario: '状況', belief: '信念', behavior: '行動', importance: 'この信念の重要度',
    mismatch: '信念と行動のずれ', justification: '行動を説明する他の理由',
    strategy: '不協和を減らす方法', tension: '緊張度', before: '現在', after: '適用後',
    reset: '最初へ', bands: ['低い', '中くらい', '高い'],
    note: 'この数値は関係を示すための例です。測定値ではなく、人を評価しません。',
    hint: 'スライダーを動かしてください。重要度が0に近づくと、どれだけずれても緊張は生じません — フェスティンガーが指摘した点です。' },
  zh: { scenario: '情境', belief: '信念', behavior: '行为', importance: '这个信念有多重要',
    mismatch: '信念与行为的落差', justification: '解释该行为的其他理由',
    strategy: '减少失调的方式', tension: '张力', before: '当前', after: '应用后',
    reset: '重置', bands: ['低', '中', '高'],
    note: '这个数字用于说明关系，不是测量值，也不评价任何人。',
    hint: '拖动滑块看看。当重要度接近零时，落差再大也不会产生张力——这正是费斯廷格指出的地方。' },
  fr: { scenario: 'Situation', belief: 'Croyance', behavior: 'Comportement', importance: "Importance de cette croyance",
    mismatch: 'Écart entre croyance et comportement', justification: 'Autres raisons qui expliquent le comportement',
    strategy: 'Façons de réduire la dissonance', tension: 'Tension', before: 'Maintenant', after: 'Après application',
    reset: 'Réinitialiser', bands: ['Faible', 'Moyenne', 'Élevée'],
    note: "Ce nombre illustre une relation. Ce n'est pas une mesure et il n'évalue personne.",
    hint: "Déplacez les curseurs. Quand l'importance approche de zéro, aucune tension n'apparaît quel que soit l'écart — c'est le point de Festinger." },
  es: { scenario: 'Situación', belief: 'Creencia', behavior: 'Conducta', importance: 'Cuánto importa esta creencia',
    mismatch: 'Distancia entre creencia y conducta', justification: 'Otras razones que explican la conducta',
    strategy: 'Formas de reducir la disonancia', tension: 'Tensión', before: 'Ahora', after: 'Tras aplicar',
    reset: 'Reiniciar', bands: ['Baja', 'Media', 'Alta'],
    note: 'Este número ilustra una relación. No es una medición y no evalúa a nadie.',
    hint: 'Mueve los controles. Cuando la importancia se acerca a cero, no aparece tensión por grande que sea la distancia: ese es el punto de Festinger.' },
};

const SCENARIOS: Array<{ id: ScenarioId; label: Record<Locale, string>; belief: Record<Locale, string>; behavior: Record<Locale, string>; inputs: Inputs }> = [
  {
    id: 'purchase',
    label: { ko: '고가 구매', en: 'An expensive purchase', ja: '高額の買い物', zh: '高价消费', fr: 'Un achat coûteux', es: 'Una compra cara' },
    belief: { ko: '불필요한 소비는 줄여야 한다', en: 'I should cut unnecessary spending', ja: '不要な消費は減らすべきだ', zh: '我应该减少不必要的消费', fr: 'Je devrais réduire les dépenses inutiles', es: 'Debería reducir el gasto innecesario' },
    behavior: { ko: '충동적으로 비싼 물건을 샀다', en: 'I impulsively bought something expensive', ja: '衝動的に高い物を買った', zh: '我冲动买了昂贵的东西', fr: "J'ai acheté quelque chose de cher sur un coup de tête", es: 'Compré algo caro por impulso' },
    inputs: { importance: 72, mismatch: 78, justification: 22 },
  },
  {
    id: 'habit',
    label: { ko: '생활 습관', en: 'A daily habit', ja: '生活習慣', zh: '生活习惯', fr: 'Une habitude quotidienne', es: 'Un hábito diario' },
    belief: { ko: '건강을 위해 규칙적으로 자야 한다', en: 'I should sleep regularly for my health', ja: '健康のために規則正しく寝るべきだ', zh: '为了健康我应该规律作息', fr: 'Je devrais dormir régulièrement pour ma santé', es: 'Debería dormir con regularidad por salud' },
    behavior: { ko: '오늘도 늦게까지 영상을 봤다', en: 'I stayed up late watching videos again', ja: '今日も遅くまで動画を見た', zh: '今天又熬夜看视频', fr: 'Je suis encore resté tard devant des vidéos', es: 'Otra vez me quedé viendo vídeos hasta tarde' },
    inputs: { importance: 84, mismatch: 66, justification: 18 },
  },
  {
    id: 'group',
    label: { ko: '집단 의견', en: 'Group opinion', ja: '集団の意見', zh: '群体意见', fr: "L'avis du groupe", es: 'La opinión del grupo' },
    belief: { ko: '내 판단을 솔직하게 말해야 한다', en: 'I should say what I actually think', ja: '自分の判断を正直に言うべきだ', zh: '我应该坦率说出自己的判断', fr: 'Je devrais dire ce que je pense vraiment', es: 'Debería decir lo que realmente pienso' },
    behavior: { ko: '회의에서 다수 의견에 맞췄다', en: 'I went along with the majority in the meeting', ja: '会議で多数意見に合わせた', zh: '在会议上顺从了多数意见', fr: "Je me suis rangé à l'avis majoritaire en réunion", es: 'Me sumé a la mayoría en la reunión' },
    inputs: { importance: 64, mismatch: 58, justification: 48 },
  },
];

const STRATEGIES: Array<{ id: StrategyId; label: Record<Locale, string>; desc: Record<Locale, string>; apply: (i: Inputs) => Inputs }> = [
  {
    id: 'behavior',
    label: { ko: '행동 바꾸기', en: 'Change the behaviour', ja: '行動を変える', zh: '改变行为', fr: 'Changer le comportement', es: 'Cambiar la conducta' },
    desc: { ko: '다음 행동을 신념에 맞춰 어긋남을 직접 줄입니다.', en: 'Bring the next action in line with the belief, reducing the gap directly.', ja: '次の行動を信念に合わせ、ずれを直接減らします。', zh: '让下一次行为贴合信念，直接缩小落差。', fr: "Aligner l'action suivante sur la croyance, réduisant l'écart directement.", es: 'Alinear la próxima acción con la creencia, reduciendo la distancia directamente.' },
    apply: (i) => ({ ...i, mismatch: Math.max(0, i.mismatch - 46) }),
  },
  {
    id: 'attitude',
    label: { ko: '태도 바꾸기', en: 'Change the attitude', ja: '態度を変える', zh: '改变态度', fr: "Changer l'attitude", es: 'Cambiar la actitud' },
    desc: { ko: '행동에 맞도록 기존 신념을 수정합니다. 실험에서 가장 자주 관찰된 경로입니다.', en: 'Revise the belief to fit the behaviour — the route most often observed in experiments.', ja: '行動に合うよう既存の信念を修正します。実験で最も多く観察された経路です。', zh: '修改原有信念以配合行为——这是实验中最常观察到的路径。', fr: "Réviser la croyance pour qu'elle colle au comportement — la voie la plus souvent observée." , es: 'Revisar la creencia para que encaje con la conducta: la vía más observada en los experimentos.' },
    apply: (i) => ({ ...i, mismatch: Math.max(0, i.mismatch - 34) }),
  },
  {
    id: 'trivialize',
    label: { ko: '중요도 낮추기', en: 'Trivialise it', ja: '重要度を下げる', zh: '降低重要性', fr: 'Banaliser', es: 'Restarle importancia' },
    desc: { ko: '갈등하는 신념이 원래 그렇게 중요하지 않았다고 해석합니다.', en: 'Decide the conflicting belief was never that important.', ja: '対立する信念はもともとそれほど重要ではなかったと解釈します。', zh: '把冲突的信念解释成本来就没那么重要。', fr: "Décider que la croyance en conflit n'était pas si importante.", es: 'Interpretar que la creencia en conflicto nunca fue tan importante.' },
    apply: (i) => ({ ...i, importance: Math.max(0, i.importance - 38) }),
  },
  {
    id: 'add-cognition',
    label: { ko: '새 이유 더하기', en: 'Add a new reason', ja: '新しい理由を足す', zh: '增加新理由', fr: 'Ajouter une raison', es: 'Añadir una razón' },
    desc: { ko: '행동을 설명하는 다른 이유를 보탭니다. 합리화로 이어지기도 합니다.', en: 'Add another reason that explains the behaviour. This can also become rationalisation.', ja: '行動を説明する別の理由を足します。合理化につながることもあります。', zh: '补上解释行为的其他理由。这也可能变成合理化。', fr: "Ajouter une autre raison qui explique le comportement. Cela peut aussi devenir de la rationalisation.", es: 'Añadir otra razón que explique la conducta. También puede volverse racionalización.' },
    apply: (i) => ({ ...i, justification: Math.min(100, i.justification + 44) }),
  },
];

/**
 * 페스팅거(1957)는 부조화의 크기를 부조화 인지의 비율로 두고 중요도로 가중했다.
 * 여기서 justification 은 협화(consonant) 인지의 양에 해당하므로 분모로 들어간다.
 */
function tension({ importance, mismatch, justification }: Inputs): number {
  const dissonant = mismatch;
  const consonant = justification;
  if (dissonant + consonant === 0) return 0;
  const ratio = dissonant / (dissonant + consonant);
  return Math.round(ratio * importance);
}

function band(score: number, locale: Locale): { label: string; tone: string } {
  const b = L(UI, locale).bands;
  if (score < 25) return { label: b[0], tone: 'bg-primary' };
  if (score < 55) return { label: b[1], tone: 'bg-accent' };
  return { label: b[2], tone: 'bg-destructive' };
}

interface Props { locale: Locale }

export default function CognitiveDissonanceLab({ locale }: Props) {
  const ui = L(UI, locale);
  const [scenarioId, setScenarioId] = useState<ScenarioId>('purchase');
  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;
  const [inputs, setInputs] = useState<Inputs>(scenario.inputs);
  const [strategyId, setStrategyId] = useState<StrategyId>('behavior');
  const strategy = STRATEGIES.find((s) => s.id === strategyId)!;

  const before = useMemo(() => tension(inputs), [inputs]);
  const after = useMemo(() => tension(strategy.apply(inputs)), [inputs, strategy]);
  const bBefore = band(before, locale);
  const bAfter = band(after, locale);

  const pick = (id: ScenarioId) => {
    const s = SCENARIOS.find((x) => x.id === id)!;
    setScenarioId(id);
    setInputs(s.inputs);
  };

  const slider = (key: keyof Inputs, label: string) => (
    <label className="block">
      <span className="flex items-baseline justify-between text-sm font-medium text-foreground">
        {label}<span className="tabular-nums text-muted-foreground">{inputs[key]}</span>
      </span>
      <input
        type="range" min={0} max={100} value={inputs[key]}
        onChange={(e) => setInputs({ ...inputs, [key]: Number(e.currentTarget.value) })}
        className="mt-2 w-full accent-[var(--primary)]"
        aria-label={label}
      />
    </label>
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap gap-2">
        {SCENARIOS.map((s) => (
          <button
            key={s.id} type="button" onClick={() => pick(s.id)}
            aria-pressed={s.id === scenarioId}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              s.id === scenarioId ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-foreground'
            }`}
          >{L(s.label, locale)}</button>
        ))}
      </div>

      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <div className="rounded-lg bg-surface-subtle p-3">
          <dt className="font-semibold text-foreground">{ui.belief}</dt>
          <dd className="mt-1 text-muted-foreground">{L(scenario.belief, locale)}</dd>
        </div>
        <div className="rounded-lg bg-surface-subtle p-3">
          <dt className="font-semibold text-foreground">{ui.behavior}</dt>
          <dd className="mt-1 text-muted-foreground">{L(scenario.behavior, locale)}</dd>
        </div>
      </dl>

      <div className="mt-5 grid gap-4">
        {slider('importance', ui.importance)}
        {slider('mismatch', ui.mismatch)}
        {slider('justification', ui.justification)}
      </div>

      <p className="mt-4 text-sm leading-6 text-muted-foreground">{ui.hint}</p>

      <fieldset className="mt-6">
        <legend className="text-sm font-semibold text-foreground">{ui.strategy}</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {STRATEGIES.map((s) => (
            <button
              key={s.id} type="button" onClick={() => setStrategyId(s.id)}
              aria-pressed={s.id === strategyId}
              className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                s.id === strategyId ? 'border-primary bg-surface-subtle' : 'border-border bg-background'
              }`}
            >
              <span className="font-semibold text-foreground">{L(s.label, locale)}</span>
              <span className="mt-1 block leading-6 text-muted-foreground">{L(s.desc, locale)}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {[{ t: ui.before, v: before, b: bBefore }, { t: ui.after, v: after, b: bAfter }].map((row) => (
          <div key={row.t} className="rounded-xl border border-border p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">{row.t} · {ui.tension}</span>
              <span className="text-2xl font-bold tabular-nums text-foreground">{row.v}</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className={`h-full ${row.b.tone}`} style={{ width: `${row.v}%` }} />
            </div>
            <span className="mt-1 block text-xs text-muted-foreground">{row.b.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-xs leading-5 text-muted-foreground">{ui.note}</p>
        <button
          type="button" onClick={() => pick(scenarioId)}
          className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-sm text-foreground"
        >{ui.reset}</button>
      </div>
    </div>
  );
}
