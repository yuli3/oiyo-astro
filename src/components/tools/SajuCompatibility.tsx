import { useState } from "react";
import { resolveYearStem } from "@/lib/ontology/saju/year-stem";
import { useProfilePrefill } from "@/lib/user/useProfilePrefill";
import type { Locale } from "../../i18n";

interface Props { locale: Locale; }

type Element = "Wood" | "Fire" | "Earth" | "Metal" | "Water";
type Relation = "generates" | "generated_by" | "conquers" | "conquered_by" | "same";

const ELEMENTS_LIST: Element[] = ["Wood", "Fire", "Earth", "Metal", "Water"];
const STEM_ELEMENT: Element[] = ["Wood","Wood","Fire","Fire","Earth","Earth","Metal","Metal","Water","Water"];
// Five-element generation cycle: Wood → Fire → Earth → Metal → Water → Wood
const GENERATES: Record<Element, Element> = {
  Wood: "Fire", Fire: "Earth", Earth: "Metal", Metal: "Water", Water: "Wood",
};
// Five-element conquest cycle: Wood → Earth → Water → Fire → Metal → Wood
const CONQUERS: Record<Element, Element> = {
  Wood: "Earth", Fire: "Metal", Earth: "Water", Metal: "Wood", Water: "Fire",
};

function getRelation(a: Element, b: Element): Relation {
  if (a === b) return "same";
  if (GENERATES[a] === b) return "generates";
  if (GENERATES[b] === a) return "generated_by";
  if (CONQUERS[a] === b) return "conquers";
  return "conquered_by";
}

const RELATION_SCORE: Record<Relation, number> = {
  generates: 88,
  generated_by: 82,
  same: 75,
  conquers: 52,
  conquered_by: 48,
};

const ELEM_EMOJIS: Record<Element, string> = { Wood: "🌿", Fire: "🔥", Earth: "🌍", Metal: "⚙️", Water: "💧" };

const ELEM_COLORS: Record<Element, { bg: string; text: string; border: string }> = {
  Wood:  { bg: "bg-surface-subtle",  text: "text-green-700",  border: "border-green-200" },
  Fire:  { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200" },
  Earth: { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200" },
  Metal: { bg: "bg-gray-50",   text: "text-gray-700",   border: "border-gray-300" },
  Water: { bg: "bg-surface-subtle",   text: "text-green-700",   border: "border-green-200" },
};

const STEM_NAMES: Record<Locale, string[]> = {
  ko: ['갑','을','병','정','무','기','경','신','임','계'],
  en: ['Jiǎ','Yǐ','Bǐng','Dīng','Wù','Jǐ','Gēng','Xīn','Rén','Guǐ'],
  ja: ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'],
  zh: ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'],
  fr: ['Jiǎ','Yǐ','Bǐng','Dīng','Wù','Jǐ','Gēng','Xīn','Rén','Guǐ'],
  es: ['Jiǎ','Yǐ','Bǐng','Dīng','Wù','Jǐ','Gēng','Xīn','Rén','Guǐ'],
};

const ELEM_NAMES: Record<Element, Record<Locale, string>> = {
  Wood:  { ko: "목(木)", en: "Wood 木", ja: "木", zh: "木", fr: "Bois 木", es: "Madera 木" },
  Fire:  { ko: "화(火)", en: "Fire 火", ja: "火", zh: "火", fr: "Feu 火",  es: "Fuego 火" },
  Earth: { ko: "토(土)", en: "Earth 土", ja: "土", zh: "土", fr: "Terre 土", es: "Tierra 土" },
  Metal: { ko: "금(金)", en: "Metal 金", ja: "金", zh: "金", fr: "Métal 金", es: "Metal 金" },
  Water: { ko: "수(水)", en: "Water 水", ja: "水", zh: "水", fr: "Eau 水",  es: "Agua 水" },
};

// ─── Compatibility texts ───────────────────────────────────────────────────────
// Indexed by [relation] for locale, with a and b element labels inserted at runtime

type CompatText = { title: string; summary: string; strength: string; advice: string };

const COMPAT_TEXTS: Record<Locale, Record<Relation, (a: string, b: string) => CompatText>> = {
  ko: {
    generates: (a, b) => ({
      title: `${a} → ${b} 상생(相生) ★★★★★`,
      summary: `${a}이(가) ${b}을(를) 키워주는 아름다운 관계입니다. 한쪽이 자연스럽게 상대방에게 힘이 되고 성장을 돕습니다.`,
      strength: "서로에게 동기를 부여하고 성장시키는 힘이 있습니다. 한 사람의 에너지가 상대의 재능을 꽃피웁니다.",
      advice: "이 관계의 장점을 살리되, 주는 사람이 소진되지 않도록 균형을 잡아가세요.",
    }),
    generated_by: (a, b) => ({
      title: `${b} → ${a} 상생(相生) ★★★★★`,
      summary: `${b}이(가) ${a}을(를) 키워주는 아름다운 관계입니다. 한쪽이 자연스럽게 상대방에게 힘이 되고 성장을 돕습니다.`,
      strength: "서로에게 동기를 부여하고 성장시키는 힘이 있습니다. 한 사람의 에너지가 상대의 재능을 꽃피웁니다.",
      advice: "이 관계의 장점을 살리되, 주는 사람이 소진되지 않도록 균형을 잡아가세요.",
    }),
    same: (a, _b) => ({
      title: `${a} + ${a} 비화(比和) ★★★★☆`,
      summary: `같은 오행끼리의 만남. 서로를 깊이 이해하고 공감대가 넓어 편안하지만, 때로는 변화와 자극이 필요합니다.`,
      strength: "서로의 성격을 직관적으로 이해합니다. 함께 있을 때 편안하고 자연스럽습니다.",
      advice: "비슷함의 장점을 누리되, 상대방에게서 다양성을 기대하지 않도록 열린 마음을 가지세요.",
    }),
    conquers: (a, b) => ({
      title: `${a} 克 ${b} 상극(相克) ★★☆☆☆`,
      summary: `${a}이(가) ${b}을(를) 제압하는 관계입니다. 갈등이 생기기 쉽고 에너지 충돌이 있을 수 있습니다.`,
      strength: "도전적인 관계지만, 서로의 약점을 보완하고 성장을 자극하는 측면도 있습니다.",
      advice: "상대방의 에너지와 가치관을 존중하고, 지배하려는 욕구를 내려놓는 것이 관계를 발전시킵니다.",
    }),
    conquered_by: (a, b) => ({
      title: `${b} 克 ${a} 상극(相克) ★★☆☆☆`,
      summary: `${b}이(가) ${a}을(를) 제압하는 관계입니다. 갈등이 생기기 쉽고 에너지 충돌이 있을 수 있습니다.`,
      strength: "도전적인 관계지만, 서로의 약점을 보완하고 성장을 자극하는 측면도 있습니다.",
      advice: "상대방의 에너지와 가치관을 존중하고, 지배하려는 욕구를 내려놓는 것이 관계를 발전시킵니다.",
    }),
  },
  en: {
    generates: (a, b) => ({
      title: `${a} → ${b} Generation ★★★★★`,
      summary: `${a} naturally nurtures and grows ${b}. One person instinctively supports and energizes the other.`,
      strength: "You motivate each other and help talents flourish. A deeply supportive, growth-oriented bond.",
      advice: "Embrace this gift, but ensure the giver doesn't become depleted. Balance give and take.",
    }),
    generated_by: (a, b) => ({
      title: `${b} → ${a} Generation ★★★★★`,
      summary: `${b} naturally nurtures and grows ${a}. One person instinctively supports and energizes the other.`,
      strength: "You motivate each other and help talents flourish. A deeply supportive, growth-oriented bond.",
      advice: "Embrace this gift, but ensure the giver doesn't become depleted. Balance give and take.",
    }),
    same: (a, _b) => ({
      title: `${a} + ${a} Harmony ★★★★☆`,
      summary: `Same element union. Deep mutual understanding and easy rapport, though the relationship may need external stimulation to grow.`,
      strength: "You intuitively understand each other. Comfortable and natural together.",
      advice: "Enjoy the comfort of similarity, but stay open to different perspectives to avoid stagnation.",
    }),
    conquers: (a, b) => ({
      title: `${a} Conquers ${b} ★★☆☆☆`,
      summary: `${a} tends to overpower ${b}'s energy. Conflicts can arise from differing values and approaches.`,
      strength: "The tension can actually drive growth. You challenge each other's assumptions.",
      advice: "Release the need to dominate. Respect each other's values and energy to transform tension into growth.",
    }),
    conquered_by: (a, b) => ({
      title: `${b} Conquers ${a} ★★☆☆☆`,
      summary: `${b} tends to overpower ${a}'s energy. Conflicts can arise from differing values and approaches.`,
      strength: "The tension can actually drive growth. You challenge each other's assumptions.",
      advice: "Release the need to dominate. Respect each other's values and energy to transform tension into growth.",
    }),
  },
  ja: {
    generates: (a, b) => ({
      title: `${a} → ${b} 相生(そうせい) ★★★★★`,
      summary: `${a}が${b}を育む美しい関係です。一方が自然に相手の力となり、成長を助けます。`,
      strength: "互いに動機を与え、才能を開花させる力があります。",
      advice: "この関係の長所を活かしながら、与える側が消耗しないようバランスを取りましょう。",
    }),
    generated_by: (a, b) => ({
      title: `${b} → ${a} 相生(そうせい) ★★★★★`,
      summary: `${b}が${a}を育む美しい関係です。一方が自然に相手の力となり、成長を助けます。`,
      strength: "互いに動機を与え、才能を開花させる力があります。",
      advice: "この関係の長所を活かしながら、与える側が消耗しないようバランスを取りましょう。",
    }),
    same: (a, _b) => ({
      title: `${a} + ${a} 比和(ひわ) ★★★★☆`,
      summary: `同じ五行同士の出会い。深い理解と共感がありますが、変化や刺激が必要なこともあります。`,
      strength: "互いの性格を直感的に理解します。一緒にいると自然で心地よいです。",
      advice: "似ていることの利点を享受しながら、多様性を求める開かれた心を持ちましょう。",
    }),
    conquers: (a, b) => ({
      title: `${a} 克 ${b} 相克(そうこく) ★★☆☆☆`,
      summary: `${a}が${b}を制するような関係。価値観や接し方の衝突が生まれやすいです。`,
      strength: "挑戦的な関係ですが、互いの弱点を補い成長を促す面もあります。",
      advice: "支配しようとする欲求を手放し、相手のエネルギーと価値観を尊重しましょう。",
    }),
    conquered_by: (a, b) => ({
      title: `${b} 克 ${a} 相克(そうこく) ★★☆☆☆`,
      summary: `${b}が${a}を制するような関係。価値観や接し方の衝突が生まれやすいです。`,
      strength: "挑戦的な関係ですが、互いの弱点を補い成長を促す面もあります。",
      advice: "支配しようとする欲求を手放し、相手のエネルギーと価値観を尊重しましょう。",
    }),
  },
  zh: {
    generates: (a, b) => ({
      title: `${a} → ${b} 相生 ★★★★★`,
      summary: `${a}自然滋养${b}，一方直觉地支持另一方，助其成长。`,
      strength: "相互激励，让彼此的才华得以绽放，是深度支持、成长导向的关系。",
      advice: "珍惜这段关系，同时注意付出者不要过度消耗，保持给与和接受的平衡。",
    }),
    generated_by: (a, b) => ({
      title: `${b} → ${a} 相生 ★★★★★`,
      summary: `${b}自然滋养${a}，一方直觉地支持另一方，助其成长。`,
      strength: "相互激励，让彼此的才华得以绽放，是深度支持、成长导向的关系。",
      advice: "珍惜这段关系，同时注意付出者不要过度消耗，保持给与和接受的平衡。",
    }),
    same: (a, _b) => ({
      title: `${a} + ${a} 比和 ★★★★☆`,
      summary: `同一五行的相遇。彼此理解深刻，相处融洽，但有时需要外部刺激以促进成长。`,
      strength: "直觉上理解对方，相处自然舒适。",
      advice: "享受相似带来的舒适感，同时保持开放心态接纳不同观点，避免停滞。",
    }),
    conquers: (a, b) => ({
      title: `${a} 克 ${b} 相克 ★★☆☆☆`,
      summary: `${a}倾向于压制${b}的能量，价值观和方式的不同容易引发冲突。`,
      strength: "这种张力实际上能促进成长，相互挑战彼此的假设。",
      advice: "放下控制欲，尊重对方的价值观和能量，将紧张转化为成长动力。",
    }),
    conquered_by: (a, b) => ({
      title: `${b} 克 ${a} 相克 ★★☆☆☆`,
      summary: `${b}倾向于压制${a}的能量，价值观和方式的不同容易引发冲突。`,
      strength: "这种张力实际上能促进成长，相互挑战彼此的假设。",
      advice: "放下控制欲，尊重对方的价值观和能量，将紧张转化为成长动力。",
    }),
  },
  fr: {
    generates: (a, b) => ({
      title: `${a} → ${b} Génération ★★★★★`,
      summary: `${a} nourrit naturellement ${b}. L'un soutient et énergise instinctivement l'autre.`,
      strength: "Vous vous motivez mutuellement et faites s'épanouir vos talents. Un lien profondément solidaire.",
      advice: "Chérissez ce don, mais assurez-vous que celui qui donne ne s'épuise pas. Équilibrez donner et recevoir.",
    }),
    generated_by: (a, b) => ({
      title: `${b} → ${a} Génération ★★★★★`,
      summary: `${b} nourrit naturellement ${a}. L'un soutient et énergise instinctivement l'autre.`,
      strength: "Vous vous motivez mutuellement et faites s'épanouir vos talents. Un lien profondément solidaire.",
      advice: "Chérissez ce don, mais assurez-vous que celui qui donne ne s'épuise pas. Équilibrez donner et recevoir.",
    }),
    same: (a, _b) => ({
      title: `${a} + ${a} Harmonie ★★★★☆`,
      summary: `Union d'éléments identiques. Compréhension mutuelle profonde et rapport facile, bien que la relation puisse avoir besoin de stimulation externe.`,
      strength: "Vous vous comprenez intuitivement. Naturel et confortable ensemble.",
      advice: "Profitez du confort de la similitude, mais restez ouverts à des perspectives différentes pour éviter la stagnation.",
    }),
    conquers: (a, b) => ({
      title: `${a} Contrôle ${b} ★★☆☆☆`,
      summary: `${a} a tendance à dominer l'énergie de ${b}. Des conflits peuvent surgir de valeurs et d'approches différentes.`,
      strength: "La tension peut stimuler la croissance. Vous remettez en question les présupposés de l'autre.",
      advice: "Renoncez au besoin de dominer. Respectez les valeurs et l'énergie de l'autre pour transformer la tension en croissance.",
    }),
    conquered_by: (a, b) => ({
      title: `${b} Contrôle ${a} ★★☆☆☆`,
      summary: `${b} a tendance à dominer l'énergie de ${a}. Des conflits peuvent surgir de valeurs et d'approches différentes.`,
      strength: "La tension peut stimuler la croissance. Vous remettez en question les présupposés de l'autre.",
      advice: "Renoncez au besoin de dominer. Respectez les valeurs et l'énergie de l'autre pour transformer la tension en croissance.",
    }),
  },
  es: {
    generates: (a, b) => ({
      title: `${a} → ${b} Generación ★★★★★`,
      summary: `${a} nutre naturalmente a ${b}. Uno apoya e impulsa instintivamente al otro.`,
      strength: "Se motivan mutuamente y hacen florecer los talentos del otro. Un vínculo profundamente solidario.",
      advice: "Aprecien este regalo, pero asegúrense de que quien da no se agote. Equilibren dar y recibir.",
    }),
    generated_by: (a, b) => ({
      title: `${b} → ${a} Generación ★★★★★`,
      summary: `${b} nutre naturalmente a ${a}. Uno apoya e impulsa instintivamente al otro.`,
      strength: "Se motivan mutuamente y hacen florecer los talentos del otro. Un vínculo profundamente solidario.",
      advice: "Aprecien este regalo, pero asegúrense de que quien da no se agote. Equilibren dar y recibir.",
    }),
    same: (a, _b) => ({
      title: `${a} + ${a} Armonía ★★★★☆`,
      summary: `Unión del mismo elemento. Comprensión mutua profunda y fácil rapport, aunque la relación puede necesitar estimulación externa.`,
      strength: "Se comprenden intuitivamente. Natural y cómodos juntos.",
      advice: "Disfruten la comodidad de la similitud, pero manténganse abiertos a perspectivas diferentes para evitar el estancamiento.",
    }),
    conquers: (a, b) => ({
      title: `${a} Conquista a ${b} ★★☆☆☆`,
      summary: `${a} tiende a dominar la energía de ${b}. Pueden surgir conflictos por valores y enfoques diferentes.`,
      strength: "La tensión puede impulsar el crecimiento. Se desafían mutuamente las suposiciones.",
      advice: "Renuncien a la necesidad de dominar. Respeten los valores y la energía del otro para transformar la tensión en crecimiento.",
    }),
    conquered_by: (a, b) => ({
      title: `${b} Conquista a ${a} ★★☆☆☆`,
      summary: `${b} tiende a dominar la energía de ${a}. Pueden surgir conflictos por valores y enfoques diferentes.`,
      strength: "La tensión puede impulsar el crecimiento. Se desafían mutuamente las suposiciones.",
      advice: "Renuncien a la necesidad de dominar. Respeten los valores y la energía del otro para transformar la tensión en crecimiento.",
    }),
  },
};

const SCORE_COLOR = (score: number) =>
  score >= 80 ? "text-green-600" : score >= 65 ? "text-amber-600" : "text-red-500";

const UI: Record<Locale, {
  title: string; subtitle: string;
  person1: string; person2: string;
  birthYear: string; calcBtn: string; resetBtn: string;
  score: string; relation: string; strength: string; advice: string;
  elemLabel: string;
  yearOnlyNote: string;
}> = {
  ko: { title: "사주 궁합", subtitle: "오행 기반 두 사람의 사주 궁합 분석", person1: "첫 번째 사람", person2: "두 번째 사람", birthYear: "태어난 해", calcBtn: "궁합 보기", resetBtn: "다시 하기", score: "궁합 점수", relation: "오행 관계", strength: "강점", advice: "조언", elemLabel: "오행", yearOnlyNote: "태어난 해만으로 계산했습니다. 사주의 연주는 입춘(2월 4일 무렵)에 바뀌므로, 1~2월 초 출생이면 실제와 다를 수 있습니다. 정확한 값은 사주 계산기에서 생년월일로 확인하세요." },
  en: { title: "Saju Compatibility", subtitle: "Five-element compatibility analysis for two people", person1: "Person 1", person2: "Person 2", birthYear: "Birth Year", calcBtn: "Check Compatibility", resetBtn: "Try Again", score: "Compatibility Score", relation: "Element Relationship", strength: "Strength", advice: "Advice", elemLabel: "Element", yearOnlyNote: "Calculated from the birth year alone. The Saju year pillar turns at Ipchun (around February 4), so a birth in January or early February may differ. Use the Saju calculator with a full birth date for the accurate value." },
  ja: { title: "四柱相性診断", subtitle: "五行に基づく二人の相性分析", person1: "1人目", person2: "2人目", birthYear: "生まれ年", calcBtn: "相性を見る", resetBtn: "やり直す", score: "相性スコア", relation: "五行の関係", strength: "強み", advice: "アドバイス", elemLabel: "五行", yearOnlyNote: "生まれ年のみで計算しました。四柱の年柱は立春（2月4日頃）に変わるため、1月〜2月初旬生まれは実際と異なる場合があります。正確な値は四柱計算機で生年月日からご確認ください。" },
  zh: { title: "四柱合婚", subtitle: "基于五行的两人相性分析", person1: "第一人", person2: "第二人", birthYear: "出生年份", calcBtn: "查看合婚", resetBtn: "重新开始", score: "相性分数", relation: "五行关系", strength: "优势", advice: "建议", elemLabel: "五行", yearOnlyNote: "仅根据出生年份计算。四柱的年柱在立春（2月4日前后）更替，因此1月至2月初出生者可能与实际不同。请在四柱计算器中输入完整出生日期以获得准确值。" },
  fr: { title: "Compatibilité Saju", subtitle: "Analyse de compatibilité par les cinq éléments", person1: "Personne 1", person2: "Personne 2", birthYear: "Année de naissance", calcBtn: "Vérifier la compatibilité", resetBtn: "Réessayer", score: "Score de compatibilité", relation: "Relation élémentaire", strength: "Point fort", advice: "Conseil", elemLabel: "Élément", yearOnlyNote: "Calculé à partir de la seule année de naissance. Le pilier de l’année change à Ipchun (vers le 4 février) : une naissance en janvier ou début février peut donc différer. Utilisez le calculateur Saju avec la date complète." },
  es: { title: "Compatibilidad Saju", subtitle: "Análisis de compatibilidad por los cinco elementos", person1: "Persona 1", person2: "Persona 2", birthYear: "Año de nacimiento", calcBtn: "Ver compatibilidad", resetBtn: "Intentar de nuevo", score: "Puntuación de compatibilidad", relation: "Relación elemental", strength: "Fortaleza", advice: "Consejo", elemLabel: "Elemento", yearOnlyNote: "Calculado solo con el año de nacimiento. El pilar del año cambia en Ipchun (hacia el 4 de febrero), así que un nacimiento en enero o principios de febrero puede diferir. Usa la calculadora Saju con la fecha completa." },
};

interface Result {
  el1: Element; stemIdx1: number;
  el2: Element; stemIdx2: number;
  relation: Relation;
  score: number;
  compat: CompatText;
  /** false 면 연도만으로 낸 값이라 입춘 경계가 적용되지 않았다. */
  solarAccurate: boolean;
}

export default function SajuCompatibility({ locale }: Props) {
  const ui = UI[locale] ?? UI.en;
  const currentYear = new Date().getFullYear();
  // 프로필에 생년월일이 있으면 연주를 절기 기준으로 정확히 낸다(본인 연도에 한해).
  const { parsed } = useProfilePrefill();
  const [year1, setYear1] = useState<number | null>(null);
  const [year2, setYear2] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const yearOptions = Array.from({ length: currentYear - 1923 }, (_, i) => currentYear - i);

  function calculate() {
    if (!year1 || !year2) return;
    const r1 = resolveYearStem(year1, parsed);
    const r2 = resolveYearStem(year2, parsed);
    const si1 = r1.stemIdx, si2 = r2.stemIdx;
    // 둘 중 하나라도 연도만으로 냈으면 한계를 알린다.
    const solarAccurate = r1.solarAccurate && r2.solarAccurate;
    const el1 = STEM_ELEMENT[si1];
    const el2 = STEM_ELEMENT[si2];
    const relation = getRelation(el1, el2);
    const score = RELATION_SCORE[relation];
    const aName = ELEM_NAMES[el1][locale];
    const bName = ELEM_NAMES[el2][locale];
    const compat = (COMPAT_TEXTS[locale] ?? COMPAT_TEXTS.en)[relation](aName, bName);
    setResult({ el1, stemIdx1: si1, el2, stemIdx2: si2, relation, score, compat, solarAccurate });
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">{ui.title}</h1>
        <p className="text-sm text-gray-500">{ui.subtitle}</p>
      </div>

      {!result ? (
        <div className="bg-card border border-gray-200 rounded-2xl p-6 space-y-5">
          {([1, 2] as const).map((n) => {
            const year = n === 1 ? year1 : year2;
            const setYear = n === 1 ? setYear1 : setYear2;
            const label = n === 1 ? ui.person1 : ui.person2;
            return (
              <div key={n} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">{label} — {ui.birthYear}</label>
                <select
                  value={year ?? ""}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-300"
                >
                  <option value="">—</option>
                  {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            );
          })}
          <button
            onClick={calculate}
            disabled={!year1 || !year2}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {ui.calcBtn}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Element pair display */}
          <div className="grid grid-cols-2 gap-3">
            {([1, 2] as const).map((n) => {
              const el = n === 1 ? result.el1 : result.el2;
              const si = n === 1 ? result.stemIdx1 : result.stemIdx2;
              const year = n === 1 ? year1! : year2!;
              const colors = ELEM_COLORS[el];
              return (
                <div key={n} className={`${colors.bg} ${colors.border} border rounded-2xl p-4 text-center space-y-1`}>
                  <div className="text-xs text-gray-500">{n === 1 ? ui.person1 : ui.person2}</div>
                  <div className="text-3xl">{ELEM_EMOJIS[el]}</div>
                  <div className={`font-bold ${colors.text}`}>{ELEM_NAMES[el][locale]}</div>
                  <div className="text-xs text-gray-500">{STEM_NAMES[locale][si]}({year})</div>
                </div>
              );
            })}
          </div>

          {/* Score */}
          <div className="bg-card border border-gray-100 rounded-2xl p-5 text-center shadow-sm space-y-1">
            {!result.solarAccurate && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-5 text-amber-900">
                {ui.yearOnlyNote}
              </p>
            )}
            <div className="text-sm text-gray-500">{ui.score}</div>
            <div className={`text-5xl font-black ${SCORE_COLOR(result.score)}`}>{result.score}</div>
            <div className="text-sm text-gray-500">/ 100</div>
          </div>

          {/* Compatibility detail */}
          <div className="bg-card border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-800 text-base">{result.compat.title}</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{result.compat.summary}</p>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-semibold text-gray-700">✨ {ui.strength}: </span>
                <span className="text-gray-600">{result.compat.strength}</span>
              </div>
              <div className="text-sm">
                <span className="font-semibold text-gray-700">💡 {ui.advice}: </span>
                <span className="text-gray-600">{result.compat.advice}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => { setResult(null); setYear1(null); setYear2(null); }}
            className="w-full border border-gray-300 text-gray-600 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
          >
            {ui.resetBtn}
          </button>
        </div>
      )}
    </div>
  );
}
