'use client';

import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { Questionnaire } from '@/components/ui/questionnaire';
import ShareResultButton from '../shared/ShareResultButton';
import ResultNextSteps from '../shared/ResultNextSteps';

type SupportedLang = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es';

function lang(locale: string): SupportedLang {
  return (['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const).includes(locale as SupportedLang)
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
    name: { ko: '권위 복종 성향', en: 'Authoritarian Submission', ja: '権威への服従傾向', zh: '服从权威倾向', fr: 'Soumission à l’autorité', es: 'Sumisión a la autoridad' },
    desc: { ko: '기존 권위·제도를 비판 없이 따르는 경향', en: 'Tendency to uncritically defer to established authorities', ja: '既存の権威·制度を批判せずに従う傾向', zh: '不加批判地服从既有权威与制度的倾向', fr: 'Tendance à suivre sans esprit critique les autorités et institutions établies', es: 'Tendencia a seguir sin crítica a las autoridades e instituciones establecidas' },
    icon: '🏛️',
    low: { ko: '권위에 맹목적으로 복종하지 않고 독립적으로 판단합니다. 비판적 사고가 강한 편입니다.', en: 'You think independently rather than following authority blindly. Critical thinking is a strength.', ja: '盲目的に権威に従わず、独立して判断します。批判的思考が強い方です。', zh: '你不会盲目服从权威，而是独立判断。批判性思考较强。', fr: 'Vous jugez par vous-même plutôt que d’obéir aveuglément à l’autorité. L’esprit critique est l’une de vos forces.', es: 'Juzgas por tu cuenta en lugar de obedecer ciegamente a la autoridad. El pensamiento crítico es una de tus fortalezas.' },
    high: { ko: '권위와 제도에 대한 신뢰와 순응 성향이 높습니다. 간혹 비판적 질문을 허용하는 연습이 도움이 됩니다.', en: 'You show high deference to authority and institutions. Practicing critical questioning can be beneficial.', ja: '権威や制度への信頼と従順性が高いです。時に批判的な質問を許す練習が役立ちます。', zh: '你对权威与制度的信任和顺从程度较高。偶尔练习允许批判性的提问会有帮助。', fr: 'Vous faites preuve d’une grande confiance et d’une grande docilité envers l’autorité et les institutions. S’autoriser des questions critiques peut être utile.', es: 'Muestras mucha confianza y docilidad hacia la autoridad y las instituciones. Practicar la pregunta crítica puede ayudarte.' },
  },
  2: {
    name: { ko: '권위적 공격 성향', en: 'Authoritarian Aggression', ja: '権威的攻撃傾向', zh: '权威攻击倾向', fr: 'Agressivité autoritaire', es: 'Agresión autoritaria' },
    desc: { ko: '관습이나 규범을 어기는 사람을 처벌해야 한다는 성향', en: 'Tendency to believe those who violate norms should be punished harshly', ja: '慣習や規範を破る人を罰すべきという傾向', zh: '认为违反惯例或规范的人应受惩罚的倾向', fr: 'Tendance à penser que ceux qui transgressent les normes doivent être punis sévèrement', es: 'Tendencia a creer que quienes incumplen las normas deben ser castigados con dureza' },
    icon: '⚖️',
    low: { ko: '규범 이탈자에 대해 관용적인 태도를 가집니다. 처벌보다 이해와 대화를 선호합니다.', en: 'You show tolerance toward those who deviate from norms, preferring understanding over punishment.', ja: '規範逸脱者に対して寛容な態度を持ちます。処罰より理解と対話を好みます。', zh: '你对偏离规范的人态度宽容，比起惩罚更偏好理解与对话。', fr: 'Vous êtes tolérant envers ceux qui s’écartent des normes et préférez la compréhension et le dialogue à la sanction.', es: 'Eres tolerante con quienes se apartan de las normas y prefieres la comprensión y el diálogo al castigo.' },
    high: { ko: '규범을 어기는 사람에 대해 강한 처벌 의식이 있습니다. 관용과 복잡성을 허용하는 시각도 고려해보세요.', en: 'You have a strong sense that norm-breakers should be punished. Consider also allowing for nuance and tolerance.', ja: '規範を破る人への強い処罰意識があります。寛容さと複雑さを許す視点も考慮してみてください。', zh: '你对违反规范的人有强烈的惩罚意识。也考虑一下允许宽容与复杂性的视角吧。', fr: 'Vous avez un fort sentiment que ceux qui enfreignent les normes doivent être punis. Pensez aussi à laisser place à la nuance et à la tolérance.', es: 'Tienes un fuerte sentido de que quien rompe las normas debe ser castigado. Considera también dejar espacio a los matices y la tolerancia.' },
  },
  3: {
    name: { ko: '관습 고수 성향', en: 'Conventionalism', ja: '慣習固執傾向', zh: '固守惯例倾向', fr: 'Conventionnalisme', es: 'Convencionalismo' },
    desc: { ko: '전통적 가치와 사회 규범에 강하게 의존하는 경향', en: 'Heavy reliance on traditional values and established social norms', ja: '伝統的な価値観と社会規範に強く依存する傾向', zh: '强烈依赖传统价值和社会规范的倾向', fr: 'Forte dépendance aux valeurs traditionnelles et aux normes sociales établies', es: 'Fuerte dependencia de los valores tradicionales y las normas sociales establecidas' },
    icon: '🏺',
    low: { ko: '변화와 다양성을 수용합니다. 전통보다 혁신을 중시하는 편입니다.', en: 'You embrace change and diversity, favoring innovation over tradition.', ja: '変化と多様性を受け入れます。伝統よりも革新を重視する方です。', zh: '你接纳变化与多样性，比起传统更重视创新。', fr: 'Vous accueillez le changement et la diversité, et privilégiez l’innovation à la tradition.', es: 'Aceptas el cambio y la diversidad, y valoras más la innovación que la tradición.' },
    high: { ko: '전통과 관습에 높은 가치를 둡니다. 변화가 모두 진보는 아니지만 개방성도 중요합니다.', en: 'You place high value on tradition and custom. Not all change is progress, but openness matters too.', ja: '伝統と慣習に高い価値を置きます。変化がすべて進歩ではありませんが、開放性も重要です。', zh: '你高度重视传统与惯例。变化并非都是进步，但开放性也很重要。', fr: 'Vous accordez une grande valeur à la tradition et aux usages. Tout changement n’est pas un progrès, mais l’ouverture compte aussi.', es: 'Das mucho valor a la tradición y las costumbres. No todo cambio es progreso, pero la apertura también importa.' },
  },
  4: {
    name: { ko: '체제 정당화 성향', en: 'System Justification', ja: '体制正当化傾向', zh: '体制正当化倾向', fr: 'Justification du système', es: 'Justificación del sistema' },
    desc: { ko: '현존하는 사회 체제와 위계가 공정하다고 믿는 경향', en: 'Tendency to believe existing social hierarchies and systems are fair and legitimate', ja: '現存する社会体制と階層が公正だと信じる傾向', zh: '相信现存社会体制与等级是公正的倾向', fr: 'Tendance à croire que les hiérarchies et le système social existants sont justes et légitimes', es: 'Tendencia a creer que las jerarquías y el sistema social existentes son justos y legítimos' },
    icon: '🔑',
    low: { ko: '현 체제의 불평등과 구조적 문제를 인식하고 변화를 지지합니다.', en: 'You recognize inequality and structural problems in the current system and support change.', ja: '現体制の不平等と構造的問題を認識し、変化を支持します。', zh: '你察觉到现行体制的不平等与结构性问题，支持改变。', fr: 'Vous percevez les inégalités et les problèmes structurels du système actuel et soutenez le changement.', es: 'Reconoces la desigualdad y los problemas estructurales del sistema actual y apoyas el cambio.' },
    high: { ko: '현재의 사회 질서가 대체로 정당하다고 믿는 경향이 있습니다. 구조적 불평등에도 주의를 기울여보세요.', en: 'You tend to believe the current social order is largely legitimate. Try to also notice structural inequalities.', ja: '現在の社会秩序がおおむね正当だと信じる傾向があります。構造的不平等にも注意を向けてみてください。', zh: '你倾向相信现在的社会秩序大体正当。也试着留意结构性的不平等。', fr: 'Vous tendez à croire que l’ordre social actuel est en grande partie légitime. Essayez aussi de repérer les inégalités structurelles.', es: 'Tiendes a creer que el orden social actual es en gran medida legítimo. Intenta fijarte también en las desigualdades estructurales.' },
  },
};

const QUESTIONS: Question[] = [
  // Dim 1: Authoritarian Submission
  { id: 'q01', dim: 1, reversed: false, text: { ko: '사회의 지도자와 권위자들은 기본적으로 신뢰받아야 한다', en: 'Leaders and authority figures in society should fundamentally be trusted', ja: '社会の指導者や権威者は基本的に信頼されるべきだ', zh: '社会的领导者和权威人士基本上应当被信任', fr: 'Les dirigeants et figures d’autorité de la société méritent fondamentalement la confiance', es: 'Los líderes y las figuras de autoridad de la sociedad merecen, en esencia, confianza' } },
  { id: 'q02', dim: 1, reversed: false, text: { ko: '규칙은 그것이 불공평해 보여도 일단 따르는 것이 중요하다', en: 'It is important to follow rules even if they seem unfair', ja: 'ルールが不公平に見えても、従うことが大切だ', zh: '即使规则看起来不公平，先遵守也很重要', fr: 'Il est important de suivre les règles même si elles semblent injustes', es: 'Es importante cumplir las normas aunque parezcan injustas' } },
  { id: 'q03', dim: 1, reversed: true, text: { ko: '나는 권위자의 말이라도 스스로 판단해서 거부할 수 있다', en: 'I can reject an authority\'s statement by judging for myself', ja: '権威者の言葉でも、自分で判断して拒否できる', zh: '即使是权威人士的话，我也能自己判断后拒绝', fr: 'Je peux rejeter la parole d’une autorité en jugeant par moi-même', es: 'Puedo rechazar lo que dice una autoridad juzgando por mí mismo' } },
  { id: 'q04', dim: 1, reversed: false, text: { ko: '상위 기관의 결정에는 개인이 이의를 제기하지 않는 것이 바람직하다', en: 'It is desirable for individuals not to contest decisions from higher institutions', ja: '上位機関の決定には個人が異議を唱えないことが望ましい', zh: '个人最好不要对上级机构的决定提出异议', fr: 'Il est souhaitable que les individus ne contestent pas les décisions des instances supérieures', es: 'Es deseable que los individuos no cuestionen las decisiones de las instituciones superiores' } },
  { id: 'q05', dim: 1, reversed: true, text: { ko: '정부나 법률이 옳지 않다면 시민이 저항하는 것은 정당하다', en: 'If the government or laws are wrong, it is legitimate for citizens to resist', ja: '政府や法律が間違っていれば、市民が抵抗するのは正当だ', zh: '如果政府或法律不对，公民反抗是正当的', fr: 'Si le gouvernement ou les lois sont injustes, il est légitime que les citoyens résistent', es: 'Si el gobierno o las leyes son injustos, es legítimo que la ciudadanía se resista' } },
  // Dim 2: Authoritarian Aggression
  { id: 'q06', dim: 2, reversed: false, text: { ko: '사회적 규범을 어긴 사람은 엄하게 처벌받아야 한다', en: 'People who break social norms should be severely punished', ja: '社会的規範を破った人は厳しく罰せられるべきだ', zh: '违反社会规范的人应受到严厉惩罚', fr: 'Ceux qui enfreignent les normes sociales devraient être sévèrement punis', es: 'Quienes incumplen las normas sociales deberían ser castigados con severidad' } },
  { id: 'q07', dim: 2, reversed: false, text: { ko: '범죄자에 대한 처벌이 지금보다 훨씬 가혹해야 한다', en: 'Punishments for criminals should be much harsher than they are now', ja: '犯罪者への処罰は今よりもはるかに厳しくあるべきだ', zh: '对罪犯的惩罚应该比现在严厉得多', fr: 'Les peines infligées aux criminels devraient être bien plus sévères qu’aujourd’hui', es: 'Las penas para los delincuentes deberían ser mucho más duras que ahora' } },
  { id: 'q08', dim: 2, reversed: true, text: { ko: '잘못된 행동을 한 사람을 이해하고 회복시키는 것이 처벌보다 더 중요하다', en: 'Understanding and rehabilitating wrongdoers is more important than punishing them', ja: '間違いを犯した人を理解し、回復させることが処罰より重要だ', zh: '理解并帮助犯错的人改过，比惩罚更重要', fr: 'Comprendre et réinsérer ceux qui ont mal agi est plus important que les punir', es: 'Comprender y reinsertar a quien ha obrado mal es más importante que castigarle' } },
  { id: 'q09', dim: 2, reversed: false, text: { ko: '사회 질서를 해치는 집단은 강하게 억압해야 한다', en: 'Groups that harm social order should be strongly suppressed', ja: '社会秩序を乱す集団は強く抑圧すべきだ', zh: '危害社会秩序的群体应受到强力压制', fr: 'Les groupes qui nuisent à l’ordre social devraient être fermement réprimés', es: 'Los grupos que dañan el orden social deberían ser reprimidos con firmeza' } },
  { id: 'q10', dim: 2, reversed: true, text: { ko: '비주류 문화나 소수 집단의 생활 방식도 존중받아야 한다', en: 'The lifestyles of minority cultures and groups deserve respect', ja: '非主流文化や少数派集団の生活様式も尊重されるべきだ', zh: '非主流文化或少数群体的生活方式也应受到尊重', fr: 'Les modes de vie des cultures minoritaires ou marginales méritent aussi le respect', es: 'Los modos de vida de culturas minoritarias o no mayoritarias también merecen respeto' } },
  // Dim 3: Conventionalism
  { id: 'q11', dim: 3, reversed: false, text: { ko: '전통적인 가치관이 현대의 변화보다 더 중요하다', en: 'Traditional values are more important than modern changes', ja: '伝統的な価値観は現代の変化よりも重要だ', zh: '传统价值观比现代的变化更重要', fr: 'Les valeurs traditionnelles comptent plus que les changements modernes', es: 'Los valores tradicionales son más importantes que los cambios modernos' } },
  { id: 'q12', dim: 3, reversed: false, text: { ko: '사회는 오래된 관습과 도덕을 지키는 방향으로 나아가야 한다', en: 'Society should move in the direction of preserving old customs and morals', ja: '社会は古い慣習と道徳を守る方向へ進むべきだ', zh: '社会应朝着守护古老习俗与道德的方向前进', fr: 'La société devrait aller vers la préservation des coutumes et de la morale anciennes', es: 'La sociedad debería avanzar hacia la preservación de las costumbres y la moral antiguas' } },
  { id: 'q13', dim: 3, reversed: true, text: { ko: '성 역할과 가족 구조에 대한 사회의 정의는 시대에 따라 달라질 수 있다', en: 'Society\'s definitions of gender roles and family structures can change with the times', ja: 'ジェンダーの役割や家族構造の社会的定義は時代によって変わり得る', zh: '社会对性别角色和家庭结构的定义可以随时代改变', fr: 'La définition sociale des rôles de genre et de la famille peut évoluer avec le temps', es: 'La definición social de los roles de género y de la familia puede cambiar con los tiempos' } },
  { id: 'q14', dim: 3, reversed: false, text: { ko: '지나치게 빠른 사회 변화는 위험하다', en: 'Social change that is too rapid is dangerous', ja: '急激な社会変化は危険だ', zh: '过快的社会变化是危险的', fr: 'Un changement social trop rapide est dangereux', es: 'Un cambio social demasiado rápido es peligroso' } },
  { id: 'q15', dim: 3, reversed: true, text: { ko: '다양한 생활 방식과 가치관이 공존하는 사회가 더 건강하다', en: 'A society where diverse lifestyles and values coexist is healthier', ja: '多様な生き方と価値観が共存する社会の方が健全だ', zh: '多元生活方式与价值观共存的社会更健康', fr: 'Une société où coexistent des modes de vie et des valeurs variés est plus saine', es: 'Una sociedad donde conviven diversos modos de vida y valores es más sana' } },
  // Dim 4: System Justification
  { id: 'q16', dim: 4, reversed: false, text: { ko: '현재의 사회 체계는 대체로 공정하게 작동하고 있다', en: 'The current social system generally operates fairly', ja: '現在の社会システムはおおむね公平に機能している', zh: '现在的社会体系大体上运作公平', fr: 'Le système social actuel fonctionne globalement de manière juste', es: 'El sistema social actual funciona, en general, de forma justa' } },
  { id: 'q17', dim: 4, reversed: false, text: { ko: '사회적으로 성공한 사람들은 그럴 만한 노력을 했기 때문이다', en: 'Those who succeed socially have worked hard enough to deserve it', ja: '社会的に成功した人はそれだけの努力をしたからだ', zh: '社会上成功的人，是因为付出了相应的努力', fr: 'Ceux qui réussissent socialement ont fourni les efforts qui le justifient', es: 'Quienes triunfan socialmente han hecho méritos suficientes para ello' } },
  { id: 'q18', dim: 4, reversed: true, text: { ko: '현재의 경제·사회 구조는 특정 집단에게 불공평하게 유리하다', en: 'The current economic and social structure is unfairly advantageous to certain groups', ja: '現在の経済·社会構造は特定の集団に不公平に有利だ', zh: '现在的经济与社会结构不公平地偏袒特定群体', fr: 'La structure économique et sociale actuelle avantage injustement certains groupes', es: 'La estructura económica y social actual favorece injustamente a ciertos grupos' } },
  { id: 'q19', dim: 4, reversed: false, text: { ko: '기존 제도를 급진적으로 바꾸려는 시도는 사회를 불안정하게 만든다', en: 'Attempts to radically change existing institutions destabilize society', ja: '既存の制度を急進的に変えようとする試みは社会を不安定にする', zh: '激进地改变既有制度的尝试会让社会不稳定', fr: 'Vouloir changer radicalement les institutions existantes déstabilise la société', es: 'Intentar cambiar radicalmente las instituciones existentes desestabiliza la sociedad' } },
  { id: 'q20', dim: 4, reversed: true, text: { ko: '사회적 불평등을 줄이기 위해 구조적 변화가 필요하다', en: 'Structural change is necessary to reduce social inequality', ja: '社会的不平等を減らすために構造的変化が必要だ', zh: '为了减少社会不平等，结构性的改变是必要的', fr: 'Des changements structurels sont nécessaires pour réduire les inégalités sociales', es: 'Hacen falta cambios estructurales para reducir la desigualdad social' } },
];

const SCALE: Record<SupportedLang, string[]> = {
  ko: ['전혀 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
  en: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
  ja: ['全くそうでない', 'そうでない', '普通', 'そうだ', '非常にそうだ'],
  zh: ['完全不同意', '不同意', '中立', '同意', '非常同意'],
  fr: ['Pas du tout d’accord', 'Pas d’accord', 'Neutre', 'D’accord', 'Tout à fait d’accord'],
  es: ['Totalmente en desacuerdo', 'En desacuerdo', 'Neutral', 'De acuerdo', 'Totalmente de acuerdo'],
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
  zh: {
    title: '威权人格量表',
    subtitle: 'F 量表现代版——测量权威服从、攻击、惯例、体制正当化四个维度',
    progress: (a, b) => `${a} / ${b}`,
    restart: '重新测验',
    result: '我的结果',
    dimScores: '各维度得分',
    note: '※ 本测验是帮助认识自己的工具，不支持也不评判任何政治立场。',
  },
  fr: {
    title: 'Échelle de personnalité autoritaire',
    subtitle: 'Version modernisée de l’échelle F — mesure 4 dimensions : soumission, agressivité, conventionnalisme, justification du système',
    progress: (a, b) => `${a} / ${b}`,
    restart: 'Recommencer',
    result: 'Mon résultat',
    dimScores: 'Scores par dimension',
    note: '※ Ce test est un outil de connaissance de soi ; il ne soutient ni ne juge aucune position politique.',
  },
  es: {
    title: 'Escala de personalidad autoritaria',
    subtitle: 'Versión actualizada de la escala F — mide 4 dimensiones: sumisión, agresión, convencionalismo y justificación del sistema',
    progress: (a, b) => `${a} / ${b}`,
    restart: 'Repetir',
    result: 'Mi resultado',
    dimScores: 'Puntuación por dimensión',
    note: '※ Este test es una herramienta de autoconocimiento; no apoya ni juzga ninguna postura política.',
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
      ['낮음 (자율적)', 'text-green-700 bg-surface-subtle border-green-200', '권위에 덜 의존하고 독립적·비판적으로 판단합니다.'],
      ['보통', 'text-yellow-700 bg-yellow-50 border-yellow-200', '상황에 따라 권위를 따르기도, 독립적으로 판단하기도 합니다.'],
      ['높음 (권위 의존적)', 'text-orange-700 bg-orange-50 border-orange-200', '권위와 관습에 의존하는 경향이 강합니다.'],
      ['매우 높음', 'text-red-700 bg-red-50 border-red-200', '권위·관습·처벌에 대한 의존이 매우 강합니다.'],
    ],
    en: [
      ['Low (Autonomous)', 'text-green-700 bg-surface-subtle border-green-200', 'You rely less on authority and judge independently and critically.'],
      ['Moderate', 'text-yellow-700 bg-yellow-50 border-yellow-200', 'You sometimes defer to authority and sometimes judge independently.'],
      ['High (Authority-Dependent)', 'text-orange-700 bg-orange-50 border-orange-200', 'You show a strong tendency to rely on authority and convention.'],
      ['Very High', 'text-red-700 bg-red-50 border-red-200', 'You show very strong dependence on authority, convention, and punishment.'],
    ],
    ja: [
      ['低い（自律的）', 'text-green-700 bg-surface-subtle border-green-200', '権威への依存が少なく、独立的・批判的に判断します。'],
      ['普通', 'text-yellow-700 bg-yellow-50 border-yellow-200', '状況によって権威に従ったり、独立的に判断したりします。'],
      ['高い（権威依存的）', 'text-orange-700 bg-orange-50 border-orange-200', '権威や慣習に依存する傾向が強いです。'],
      ['非常に高い', 'text-red-700 bg-red-50 border-red-200', '権威・慣習・処罰への依存が非常に強いです。'],
    ],
    zh: [
      ['低（自主）', 'text-green-700 bg-surface-subtle border-green-200', '较少依赖权威，独立而有批判地判断。'],
      ['中等', 'text-yellow-700 bg-yellow-50 border-yellow-200', '视情况有时服从权威，有时独立判断。'],
      ['高（依赖权威）', 'text-orange-700 bg-orange-50 border-orange-200', '依赖权威与惯例的倾向较强。'],
      ['非常高', 'text-red-700 bg-red-50 border-red-200', '对权威、惯例与惩罚的依赖非常强。'],
    ],
    fr: [
      ['Faible (autonome)', 'text-green-700 bg-surface-subtle border-green-200', 'Vous dépendez peu de l’autorité et jugez de façon indépendante et critique.'],
      ['Modéré', 'text-yellow-700 bg-yellow-50 border-yellow-200', 'Selon les situations, vous suivez l’autorité ou jugez par vous-même.'],
      ['Élevé (dépendant de l’autorité)', 'text-orange-700 bg-orange-50 border-orange-200', 'Vous avez une forte tendance à vous appuyer sur l’autorité et les conventions.'],
      ['Très élevé', 'text-red-700 bg-red-50 border-red-200', 'Votre dépendance à l’autorité, aux conventions et à la sanction est très forte.'],
    ],
    es: [
      ['Bajo (autónomo)', 'text-green-700 bg-surface-subtle border-green-200', 'Dependes poco de la autoridad y juzgas de forma independiente y crítica.'],
      ['Moderado', 'text-yellow-700 bg-yellow-50 border-yellow-200', 'Según la situación, a veces sigues a la autoridad y a veces juzgas por tu cuenta.'],
      ['Alto (dependiente de la autoridad)', 'text-orange-700 bg-orange-50 border-orange-200', 'Tienes una fuerte tendencia a apoyarte en la autoridad y las convenciones.'],
      ['Muy alto', 'text-red-700 bg-red-50 border-red-200', 'Tu dependencia de la autoridad, las convenciones y el castigo es muy fuerte.'],
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
  useRecordFinishedTest({ testId: "authoritarian-scale", title: "AuthoritarianScaleTest", finished: Boolean(done) });

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
      <div className="space-y-6">
        <div className="rounded-2xl border-2 border-slate-200 bg-card p-6 text-center">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">{ui.result}</p>
          <div className={`inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 text-base font-black ${level.color}`}>
            {level.label}
          </div>
          <p className="mt-3 text-sm text-slate-600">{level.desc}</p>
          <div className="mt-3 text-2xl font-black text-slate-800">{overall}<span className="text-sm font-normal text-slate-400"> / 100</span></div>
        </div>

        <div className="rounded-2xl border-2 border-slate-100 bg-card p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">{ui.dimScores}</p>
          <div className="space-y-4">
            {dimScores.map(({ d, score }) => {
              const info = DIMS[d];
              return (
                <div key={d}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-slate-700">{info.icon} {info.name[l]}</span>
                    <span className="text-sm font-black text-slate-800">{score}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-slate-600 transition-all" style={{ width: `${score}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{score < 50 ? info.low[l] : info.high[l]}</p>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center px-2">{ui.note}</p>

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
            { href: `/${l}/political/test/`, label: ({ ko: '🗳️ 정치 나침반 테스트', en: '🗳️ Political compass test', ja: '🗳️ ポリティカルコンパス', zh: '🗳️ 政治坐标测验', fr: '🗳️ Test de la boussole politique', es: '🗳️ Test de la brújula política' } as const)[l] },
            { href: `/${l}/big5/test/`, label: ({ ko: '🧪 빅파이브 성격 테스트', en: '🧪 Big Five personality test', ja: '🧪 ビッグファイブ性格診断', zh: '🧪 大五人格测验', fr: '🧪 Test de personnalité Big Five', es: '🧪 Test de personalidad Big Five' } as const)[l] },
          ]}
        />

        <button
          onClick={restart}
          className="w-full rounded-xl border-2 border-slate-200 bg-card py-3 font-bold text-slate-600 transition hover:border-slate-400"
        >
          {ui.restart}
        </button>
      </div>
    );
  }

  const progress = Math.round((current / QUESTIONS.length) * 100);

  return (
    /* 문항별 차원 배지는 Questionnaire 에 슬롯이 없어 subtitle 로 합친다.
       배지를 그냥 버리면 사용자가 보던 정보가 사라진다. */
    <Questionnaire
      title={ui.title}
      subtitle={`${ui.subtitle} · ${DIMS[q.dim].icon} ${DIMS[q.dim].name[l]}`}
      question={q.text[l]}
      questionLabel={ui.progress(current + 1, QUESTIONS.length)}
      progress={progress}
      options={SCALE[l].map((label, i) => ({ label, value: i + 1 }))}
      selectedValue={answers[q.id]}
      previousLabel={({ ko: '이전 질문', en: 'Previous question', ja: '前の質問', zh: '上一题', fr: 'Question précédente', es: 'Pregunta anterior' } as const)[l]}
      onPrevious={current > 0 ? () => setCurrent(current - 1) : undefined}
      onSelect={choose}
    />
  );
}
