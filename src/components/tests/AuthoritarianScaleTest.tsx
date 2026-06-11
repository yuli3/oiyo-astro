'use client';

import { useState } from 'react';
import ShareResultButton from '../shared/ShareResultButton';
import ResultNextSteps from '../shared/ResultNextSteps';
import RelatedReading from '../shared/RelatedReading';

type SupportedLang = 'ko' | 'en' | 'ja';

function lang(locale: string): SupportedLang {
  return (['ko', 'en', 'ja'] as const).includes(locale as SupportedLang)
    ? (locale as SupportedLang)
    : 'en';
}

interface Question {
  id: string;
  dim: 1 | 2 | 3 | 4;
  reversed: boolean;
  text: Record<SupportedLang, string>;
}

interface DimInfo {
  name: Record<SupportedLang, string>;
  desc: Record<SupportedLang, string>;
  icon: string;
  low: Record<SupportedLang, string>;
  high: Record<SupportedLang, string>;
}

const DIMS: Record<1 | 2 | 3 | 4, DimInfo> = {
  1: {
    name: { ko: '권위 복종 성향', en: 'Authoritarian Submission', ja: '権威への服従傾向' },
    desc: { ko: '기존 권위·제도를 비판 없이 따르는 경향', en: 'Tendency to uncritically defer to established authorities', ja: '既存の権威·制度を批判せずに従う傾向' },
    icon: '🏛️',
    low: { ko: '권위에 맹목적으로 복종하지 않고 독립적으로 판단합니다. 비판적 사고가 강한 편입니다.', en: 'You think independently rather than following authority blindly. Critical thinking is a strength.', ja: '盲目的に権威に従わず、独立して判断します。批判的思考が強い方です。' },
    high: { ko: '권위와 제도에 대한 신뢰와 순응 성향이 높습니다. 간혹 비판적 질문을 허용하는 연습이 도움이 됩니다.', en: 'You show high deference to authority and institutions. Practicing critical questioning can be beneficial.', ja: '権威や制度への信頼と従順性が高いです。時に批判的な質問を許す練習が役立ちます。' },
  },
  2: {
    name: { ko: '권위적 공격 성향', en: 'Authoritarian Aggression', ja: '権威的攻撃傾向' },
    desc: { ko: '관습이나 규범을 어기는 사람을 처벌해야 한다는 성향', en: 'Tendency to believe those who violate norms should be punished harshly', ja: '慣習や規範を破る人を罰すべきという傾向' },
    icon: '⚖️',
    low: { ko: '규범 이탈자에 대해 관용적인 태도를 가집니다. 처벌보다 이해와 대화를 선호합니다.', en: 'You show tolerance toward those who deviate from norms, preferring understanding over punishment.', ja: '規範逸脱者に対して寛容な態度を持ちます。処罰より理解と対話を好みます。' },
    high: { ko: '규범을 어기는 사람에 대해 강한 처벌 의식이 있습니다. 관용과 복잡성을 허용하는 시각도 고려해보세요.', en: 'You have a strong sense that norm-breakers should be punished. Consider also allowing for nuance and tolerance.', ja: '規範を破る人への強い処罰意識があります。寛容さと複雑さを許す視点も考慮してみてください。' },
  },
  3: {
    name: { ko: '관습 고수 성향', en: 'Conventionalism', ja: '慣習固執傾向' },
    desc: { ko: '전통적 가치와 사회 규범에 강하게 의존하는 경향', en: 'Heavy reliance on traditional values and established social norms', ja: '伝統的な価値観と社会規範に強く依存する傾向' },
    icon: '🏺',
    low: { ko: '변화와 다양성을 수용합니다. 전통보다 혁신을 중시하는 편입니다.', en: 'You embrace change and diversity, favoring innovation over tradition.', ja: '変化と多様性を受け入れます。伝統よりも革新を重視する方です。' },
    high: { ko: '전통과 관습에 높은 가치를 둡니다. 변화가 모두 진보는 아니지만 개방성도 중요합니다.', en: 'You place high value on tradition and custom. Not all change is progress, but openness matters too.', ja: '伝統と慣習に高い価値を置きます。変化がすべて進歩ではありませんが、開放性も重要です。' },
  },
  4: {
    name: { ko: '체제 정당화 성향', en: 'System Justification', ja: '体制正当化傾向' },
    desc: { ko: '현존하는 사회 체제와 위계가 공정하다고 믿는 경향', en: 'Tendency to believe existing social hierarchies and systems are fair and legitimate', ja: '現存する社会体制と階層が公正だと信じる傾向' },
    icon: '🔑',
    low: { ko: '현 체제의 불평등과 구조적 문제를 인식하고 변화를 지지합니다.', en: 'You recognize inequality and structural problems in the current system and support change.', ja: '現体制の不平等と構造的問題を認識し、変化を支持します。' },
    high: { ko: '현재의 사회 질서가 대체로 정당하다고 믿는 경향이 있습니다. 구조적 불평등에도 주의를 기울여보세요.', en: 'You tend to believe the current social order is largely legitimate. Try to also notice structural inequalities.', ja: '現在の社会秩序がおおむね正当だと信じる傾向があります。構造的不平等にも注意を向けてみてください。' },
  },
};

const QUESTIONS: Question[] = [
  // Dim 1: Authoritarian Submission
  { id: 'q01', dim: 1, reversed: false, text: { ko: '사회의 지도자와 권위자들은 기본적으로 신뢰받아야 한다', en: 'Leaders and authority figures in society should fundamentally be trusted', ja: '社会の指導者や権威者は基本的に信頼されるべきだ' } },
  { id: 'q02', dim: 1, reversed: false, text: { ko: '규칙은 그것이 불공평해 보여도 일단 따르는 것이 중요하다', en: 'It is important to follow rules even if they seem unfair', ja: 'ルールが不公平に見えても、従うことが大切だ' } },
  { id: 'q03', dim: 1, reversed: true, text: { ko: '나는 권위자의 말이라도 스스로 판단해서 거부할 수 있다', en: 'I can reject an authority\'s statement by judging for myself', ja: '権威者の言葉でも、自分で判断して拒否できる' } },
  { id: 'q04', dim: 1, reversed: false, text: { ko: '상위 기관의 결정에는 개인이 이의를 제기하지 않는 것이 바람직하다', en: 'It is desirable for individuals not to contest decisions from higher institutions', ja: '上位機関の決定には個人が異議を唱えないことが望ましい' } },
  { id: 'q05', dim: 1, reversed: true, text: { ko: '정부나 법률이 옳지 않다면 시민이 저항하는 것은 정당하다', en: 'If the government or laws are wrong, it is legitimate for citizens to resist', ja: '政府や法律が間違っていれば、市民が抵抗するのは正当だ' } },
  // Dim 2: Authoritarian Aggression
  { id: 'q06', dim: 2, reversed: false, text: { ko: '사회적 규범을 어긴 사람은 엄하게 처벌받아야 한다', en: 'People who break social norms should be severely punished', ja: '社会的規範を破った人は厳しく罰せられるべきだ' } },
  { id: 'q07', dim: 2, reversed: false, text: { ko: '범죄자에 대한 처벌이 지금보다 훨씬 가혹해야 한다', en: 'Punishments for criminals should be much harsher than they are now', ja: '犯罪者への処罰は今よりもはるかに厳しくあるべきだ' } },
  { id: 'q08', dim: 2, reversed: true, text: { ko: '잘못된 행동을 한 사람을 이해하고 회복시키는 것이 처벌보다 더 중요하다', en: 'Understanding and rehabilitating wrongdoers is more important than punishing them', ja: '間違いを犯した人を理解し、回復させることが処罰より重要だ' } },
  { id: 'q09', dim: 2, reversed: false, text: { ko: '사회 질서를 해치는 집단은 강하게 억압해야 한다', en: 'Groups that harm social order should be strongly suppressed', ja: '社会秩序を乱す集団は強く抑圧すべきだ' } },
  { id: 'q10', dim: 2, reversed: true, text: { ko: '비주류 문화나 소수 집단의 생활 방식도 존중받아야 한다', en: 'The lifestyles of minority cultures and groups deserve respect', ja: '非主流文化や少数派集団の生活様式も尊重されるべきだ' } },
  // Dim 3: Conventionalism
  { id: 'q11', dim: 3, reversed: false, text: { ko: '전통적인 가치관이 현대의 변화보다 더 중요하다', en: 'Traditional values are more important than modern changes', ja: '伝統的な価値観は現代の変化よりも重要だ' } },
  { id: 'q12', dim: 3, reversed: false, text: { ko: '사회는 오래된 관습과 도덕을 지키는 방향으로 나아가야 한다', en: 'Society should move in the direction of preserving old customs and morals', ja: '社会は古い慣習と道徳を守る方向へ進むべきだ' } },
  { id: 'q13', dim: 3, reversed: true, text: { ko: '성 역할과 가족 구조에 대한 사회의 정의는 시대에 따라 달라질 수 있다', en: 'Society\'s definitions of gender roles and family structures can change with the times', ja: 'ジェンダーの役割や家族構造の社会的定義は時代によって変わり得る' } },
  { id: 'q14', dim: 3, reversed: false, text: { ko: '지나치게 빠른 사회 변화는 위험하다', en: 'Social change that is too rapid is dangerous', ja: '急激な社会変化は危険だ' } },
  { id: 'q15', dim: 3, reversed: true, text: { ko: '다양한 생활 방식과 가치관이 공존하는 사회가 더 건강하다', en: 'A society where diverse lifestyles and values coexist is healthier', ja: '多様な生き方と価値観が共存する社会の方が健全だ' } },
  // Dim 4: System Justification
  { id: 'q16', dim: 4, reversed: false, text: { ko: '현재의 사회 체계는 대체로 공정하게 작동하고 있다', en: 'The current social system generally operates fairly', ja: '現在の社会システムはおおむね公平に機能している' } },
  { id: 'q17', dim: 4, reversed: false, text: { ko: '사회적으로 성공한 사람들은 그럴 만한 노력을 했기 때문이다', en: 'Those who succeed socially have worked hard enough to deserve it', ja: '社会的に成功した人はそれだけの努力をしたからだ' } },
  { id: 'q18', dim: 4, reversed: true, text: { ko: '현재의 경제·사회 구조는 특정 집단에게 불공평하게 유리하다', en: 'The current economic and social structure is unfairly advantageous to certain groups', ja: '現在の経済·社会構造は特定の集団に不公平に有利だ' } },
  { id: 'q19', dim: 4, reversed: false, text: { ko: '기존 제도를 급진적으로 바꾸려는 시도는 사회를 불안정하게 만든다', en: 'Attempts to radically change existing institutions destabilize society', ja: '既存の制度を急進的に変えようとする試みは社会を不安定にする' } },
  { id: 'q20', dim: 4, reversed: true, text: { ko: '사회적 불평등을 줄이기 위해 구조적 변화가 필요하다', en: 'Structural change is necessary to reduce social inequality', ja: '社会的不平等を減らすために構造的変化が必要だ' } },
];

const SCALE: Record<SupportedLang, string[]> = {
  ko: ['전혀 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
  en: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
  ja: ['全くそうでない', 'そうでない', '普通', 'そうだ', '非常にそうだ'],
};

const UI: Record<SupportedLang, {
  title: string; subtitle: string; progress: (a: number, b: number) => string;
  restart: string; result: string; dimScores: string; note: string;
}> = {
  ko: {
    title: '권위주의 성격 척도',
    subtitle: 'F-Scale 현대화 버전 — 권위 복종·공격·관습·체제정당화 4차원 측정',
    progress: (a, b) => `${a} / ${b}`,
    restart: '다시 하기',
    result: '나의 결과',
    dimScores: '차원별 점수',
    note: '※ 이 테스트는 자기 이해를 위한 도구이며, 어떤 정치적 입장을 지지하거나 판단하지 않습니다.',
  },
  en: {
    title: 'Authoritarian Personality Scale',
    subtitle: 'Modernized F-Scale — Measures 4 Dimensions: Submission, Aggression, Conventionalism, System Justification',
    progress: (a, b) => `${a} / ${b}`,
    restart: 'Retake',
    result: 'Your Results',
    dimScores: 'Scores by Dimension',
    note: '※ This test is a self-understanding tool and does not endorse or judge any political position.',
  },
  ja: {
    title: '権威主義的性格尺度',
    subtitle: 'Fスケール現代化版 — 服従·攻撃·慣習·体制正当化の4次元測定',
    progress: (a, b) => `${a} / ${b}`,
    restart: 'もう一度',
    result: '私の結果',
    dimScores: '次元別スコア',
    note: '※このテストは自己理解のためのツールであり、いかなる政治的立場を支持または判断するものではありません。',
  },
};

function computeScore(answers: Record<string, number>, dim: 1 | 2 | 3 | 4): number {
  const qs = QUESTIONS.filter((q) => q.dim === dim);
  let sum = 0;
  for (const q of qs) {
    const raw = answers[q.id] ?? 3;
    sum += q.reversed ? 6 - raw : raw;
  }
  return Math.round((sum / (qs.length * 5)) * 100);
}

function overallLevel(score: number, l: SupportedLang): { label: string; color: string; desc: string } {
  const levels: Record<SupportedLang, [string, string, string][]> = {
    ko: [
      ['낮음 (자율적)', 'text-green-700 bg-green-50 border-green-200', '권위에 덜 의존하고 독립적·비판적으로 판단합니다.'],
      ['보통', 'text-yellow-700 bg-yellow-50 border-yellow-200', '상황에 따라 권위를 따르기도, 독립적으로 판단하기도 합니다.'],
      ['높음 (권위 의존적)', 'text-orange-700 bg-orange-50 border-orange-200', '권위와 관습에 의존하는 경향이 강합니다.'],
      ['매우 높음', 'text-red-700 bg-red-50 border-red-200', '권위·관습·처벌에 대한 의존이 매우 강합니다.'],
    ],
    en: [
      ['Low (Autonomous)', 'text-green-700 bg-green-50 border-green-200', 'You rely less on authority and judge independently and critically.'],
      ['Moderate', 'text-yellow-700 bg-yellow-50 border-yellow-200', 'You sometimes defer to authority and sometimes judge independently.'],
      ['High (Authority-Dependent)', 'text-orange-700 bg-orange-50 border-orange-200', 'You show a strong tendency to rely on authority and convention.'],
      ['Very High', 'text-red-700 bg-red-50 border-red-200', 'You show very strong dependence on authority, convention, and punishment.'],
    ],
    ja: [
      ['低い（自律的）', 'text-green-700 bg-green-50 border-green-200', '権威への依存が少なく、独立的・批判的に判断します。'],
      ['普通', 'text-yellow-700 bg-yellow-50 border-yellow-200', '状況によって権威に従ったり、独立的に判断したりします。'],
      ['高い（権威依存的）', 'text-orange-700 bg-orange-50 border-orange-200', '権威や慣習に依存する傾向が強いです。'],
      ['非常に高い', 'text-red-700 bg-red-50 border-red-200', '権威・慣習・処罰への依存が非常に強いです。'],
    ],
  };
  const idx = score < 35 ? 0 : score < 55 ? 1 : score < 70 ? 2 : 3;
  const [label, color, desc] = levels[l][idx];
  return { label, color, desc };
}

export default function AuthoritarianScaleTest({ locale }: { locale: string }) {
  const l = lang(locale);
  const ui = UI[l];
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);

  const q = QUESTIONS[current];

  function choose(val: number) {
    const next = { ...answers, [q.id]: val };
    setAnswers(next);
    if (current + 1 < QUESTIONS.length) {
      setCurrent(current + 1);
    } else {
      setDone(true);
    }
  }

  function restart() {
    setCurrent(0);
    setAnswers({});
    setDone(false);
  }

  if (done) {
    const dimScores = ([1, 2, 3, 4] as const).map((d) => ({ d, score: computeScore(answers, d) }));
    const overall = Math.round(dimScores.reduce((s, x) => s + x.score, 0) / 4);
    const level = overallLevel(overall, l);

    return (
      <div class="space-y-6">
        <div class="rounded-2xl border-2 border-slate-200 bg-white p-6 text-center">
          <p class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">{ui.result}</p>
          <div class={`inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 text-base font-black ${level.color}`}>
            {level.label}
          </div>
          <p class="mt-3 text-sm text-slate-600">{level.desc}</p>
          <div class="mt-3 text-2xl font-black text-slate-800">{overall}<span class="text-sm font-normal text-slate-400"> / 100</span></div>
        </div>

        <div class="rounded-2xl border-2 border-slate-100 bg-white p-5">
          <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">{ui.dimScores}</p>
          <div class="space-y-4">
            {dimScores.map(({ d, score }) => {
              const info = DIMS[d];
              return (
                <div key={d}>
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-sm font-bold text-slate-700">{info.icon} {info.name[l]}</span>
                    <span class="text-sm font-black text-slate-800">{score}</span>
                  </div>
                  <div class="h-2 w-full rounded-full bg-slate-100">
                    <div class="h-2 rounded-full bg-slate-600 transition-all" style={{ width: `${score}%` }} />
                  </div>
                  <p class="mt-1 text-xs text-slate-500">{score < 50 ? info.low[l] : info.high[l]}</p>
                </div>
              );
            })}
          </div>
        </div>

        <p class="text-xs text-slate-400 text-center px-2">{ui.note}</p>

        <ShareResultButton
          locale={locale}
          heading={ui.title}
          resultTitle={`${level.label} · ${overall}/100`}
          emoji="🧭"
          description={level.desc}
        />

        <ResultNextSteps
          locale={locale}
          links={[
            { href: `/${l}/political/test`, label: l === 'ko' ? '🗳️ 정치 나침반 테스트' : '🗳️ Political compass test' },
            { href: `/${l}/big5/test`, label: l === 'ko' ? '🧪 빅파이브 성격 테스트' : '🧪 Big Five personality test' },
          ]}
        />
        <RelatedReading locale={locale} topic="authoritarian" />

        <button
          onClick={restart}
          class="w-full rounded-xl border-2 border-slate-200 bg-white py-3 font-bold text-slate-600 transition hover:border-slate-400"
        >
          {ui.restart}
        </button>
      </div>
    );
  }

  const progress = Math.round((current / QUESTIONS.length) * 100);

  return (
    <div class="space-y-6">
      <div class="text-center">
        <h1 class="text-2xl font-black text-slate-900">{ui.title}</h1>
        <p class="mt-1 text-sm text-slate-500">{ui.subtitle}</p>
      </div>

      <div class="flex items-center gap-3">
        <div class="h-2 flex-1 rounded-full bg-slate-100">
          <div class="h-2 rounded-full bg-slate-700 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <span class="text-xs font-mono text-slate-400">{ui.progress(current + 1, QUESTIONS.length)}</span>
      </div>

      <div class="rounded-2xl border-2 border-slate-200 bg-white p-6">
        <p class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          {DIMS[q.dim].icon} {DIMS[q.dim].name[l]}
        </p>
        <p class="text-base font-bold leading-relaxed text-slate-900">{q.text[l]}</p>
      </div>

      <div class="grid grid-cols-5 gap-2">
        {SCALE[l].map((label, i) => (
          <button
            key={i}
            onClick={() => choose(i + 1)}
            class="flex flex-col items-center gap-1 rounded-xl border-2 border-slate-200 bg-white p-2 transition hover:border-slate-600 hover:bg-slate-50 active:scale-95"
          >
            <span class="text-lg font-black text-slate-700">{i + 1}</span>
            <span class="text-center text-[10px] leading-tight text-slate-500">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
