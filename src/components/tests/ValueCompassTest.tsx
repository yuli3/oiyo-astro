'use client';
import ShareResultButton from '../shared/ShareResultButton'

import { useState } from "react";

type SupportedLocale = "ko" | "en" | "ja" | "zh" | "fr" | "es";

interface Props {
  locale?: string;
}

type ValueDimension = "equality" | "liberty" | "tradition" | "global";

interface Question {
  ko: string;
  en: string;
  ja: string;
  zh: string;
  fr: string;
  es: string;
  options: {
    ko: string;
    en: string;
    ja: string;
    zh: string;
    fr: string;
    es: string;
    scores: Record<ValueDimension, number>;
  }[];
}

const questions: Question[] = [
  {
    ko: "사회에서 정부의 역할에 대해 어떻게 생각하나요?",
    en: "What do you think about the role of government in society?",
    ja: "社会における政府の役割についてどう思いますか？",
    zh: "你如何看待政府在社会中的角色？",
    fr: "Que pensez-vous du rôle du gouvernement dans la société ?",
    es: "¿Qué piensas sobre el papel del gobierno en la sociedad?",
    options: [
      { ko: "모두를 위한 평등한 기회를 보장해야 한다", en: "Should ensure equal opportunities for everyone", ja: "全員のための平等な機会を保障すべきだ", zh: "应保障每个人都有平等机会", fr: "Il devrait garantir des chances égales pour tous", es: "Debería garantizar igualdad de oportunidades para todos", scores: { equality: 2, liberty: 0, tradition: 0, global: 1 } },
      { ko: "개인의 자유를 최대한 보장해야 한다", en: "Should maximize individual freedom", ja: "個人の自由を最大限保障すべきだ", zh: "应最大限度保障个人自由", fr: "Il devrait maximiser la liberté individuelle", es: "Debería maximizar la libertad individual", scores: { equality: 0, liberty: 2, tradition: 0, global: 0 } },
      { ko: "전통적 사회 질서를 유지해야 한다", en: "Should maintain traditional social order", ja: "伝統的な社会秩序を維持すべきだ", zh: "应维护传统社会秩序", fr: "Il devrait préserver l'ordre social traditionnel", es: "Debería mantener el orden social tradicional", scores: { equality: 0, liberty: 0, tradition: 2, global: 0 } },
      { ko: "국제 협력과 글로벌 문제 해결에 앞장서야 한다", en: "Should lead in international cooperation and global issues", ja: "国際協力とグローバル問題解決に率先すべきだ", zh: "应带头推动国际合作和解决全球问题", fr: "Il devrait jouer un rôle moteur dans la coopération internationale et les enjeux mondiaux", es: "Debería liderar la cooperación internacional y la solución de problemas globales", scores: { equality: 0, liberty: 0, tradition: 0, global: 2 } },
    ],
  },
  {
    ko: "경제 시스템에 대한 나의 관점은?",
    en: "My view on economic systems:",
    ja: "経済システムに対する私の見解は？",
    zh: "我对经济体系的看法是？",
    fr: "Mon point de vue sur les systèmes économiques :",
    es: "Mi visión sobre los sistemas económicos:",
    options: [
      { ko: "부의 재분배와 복지 확대가 필요하다", en: "Wealth redistribution and welfare expansion are needed", ja: "富の再分配と福祉拡充が必要だ", zh: "需要财富再分配和扩大福利", fr: "La redistribution des richesses et l'extension de la protection sociale sont nécessaires", es: "Se necesitan redistribución de la riqueza y ampliación del bienestar social", scores: { equality: 2, liberty: 0, tradition: 0, global: 0 } },
      { ko: "자유 시장이 가장 효율적인 시스템이다", en: "Free market is the most efficient system", ja: "自由市場が最も効率的なシステムだ", zh: "自由市场是最高效的体系", fr: "Le marché libre est le système le plus efficace", es: "El libre mercado es el sistema más eficiente", scores: { equality: 0, liberty: 2, tradition: 1, global: 0 } },
      { ko: "안정적이고 검증된 시스템을 유지해야 한다", en: "Stable and proven systems should be maintained", ja: "安定した実証済みのシステムを維持すべきだ", zh: "应维持稳定且经过验证的体系", fr: "Les systèmes stables et éprouvés devraient être maintenus", es: "Deberían mantenerse los sistemas estables y probados", scores: { equality: 0, liberty: 0, tradition: 2, global: 0 } },
      { ko: "글로벌 경제 협력과 자유 무역이 중요하다", en: "Global economic cooperation and free trade are important", ja: "グローバル経済協力と自由貿易が重要だ", zh: "全球经济合作和自由贸易很重要", fr: "La coopération économique mondiale et le libre-échange sont importants", es: "La cooperación económica global y el libre comercio son importantes", scores: { equality: 0, liberty: 1, tradition: 0, global: 2 } },
    ],
  },
  {
    ko: "사회 변화에 대해 어떻게 생각하나요?",
    en: "What do you think about social change?",
    ja: "社会変化についてどう思いますか？",
    zh: "你如何看待社会变化？",
    fr: "Que pensez-vous du changement social ?",
    es: "¿Qué piensas sobre el cambio social?",
    options: [
      { ko: "구조적 불평등을 해소하기 위한 적극적 변화가 필요하다", en: "Active change to address structural inequality is needed", ja: "構造的不平等を解消するための積極的変化が必要だ", zh: "需要积极变革来解决结构性不平等", fr: "Un changement actif est nécessaire pour répondre aux inégalités structurelles", es: "Se necesita un cambio activo para abordar la desigualdad estructural", scores: { equality: 2, liberty: 0, tradition: 0, global: 1 } },
      { ko: "변화는 자연스럽게 개인의 선택을 통해 이루어진다", en: "Change happens naturally through individual choices", ja: "変化は自然に個人の選択を通じて起きる", zh: "变化会通过个人选择自然发生", fr: "Le changement se fait naturellement à travers les choix individuels", es: "El cambio ocurre de forma natural a través de las decisiones individuales", scores: { equality: 0, liberty: 2, tradition: 0, global: 0 } },
      { ko: "급격한 변화보다 점진적이고 신중한 접근이 낫다", en: "A gradual, careful approach is better than rapid change", ja: "急激な変化より段階的で慎重なアプローチが良い", zh: "渐进而谨慎的方法比快速变革更好", fr: "Une approche progressive et prudente vaut mieux qu'un changement rapide", es: "Un enfoque gradual y cuidadoso es mejor que un cambio rápido", scores: { equality: 0, liberty: 0, tradition: 2, global: 0 } },
      { ko: "글로벌 관점에서 모든 사람에게 이로운 변화를 추구해야 한다", en: "Change that benefits everyone from a global perspective", ja: "グローバルな観点で全員に利益をもたらす変化を追求すべきだ", zh: "应从全球视角追求有益于所有人的变化", fr: "Il faut rechercher des changements bénéfiques à tous dans une perspective mondiale", es: "Hay que buscar cambios que beneficien a todos desde una perspectiva global", scores: { equality: 1, liberty: 0, tradition: 0, global: 2 } },
    ],
  },
  {
    ko: "환경 문제에 대한 나의 입장은?",
    en: "My position on environmental issues:",
    ja: "環境問題に対する私の立場は？",
    zh: "我对环境问题的立场是？",
    fr: "Ma position sur les enjeux environnementaux :",
    es: "Mi postura sobre los problemas ambientales:",
    options: [
      { ko: "환경 보호 비용을 부유층이 더 부담해야 한다", en: "The wealthy should bear more of the environmental costs", ja: "環境保護コストを富裕層がより多く負担すべきだ", zh: "富裕阶层应承担更多环境保护成本", fr: "Les plus aisés devraient assumer une plus grande part des coûts environnementaux", es: "Las personas más ricas deberían asumir más costos ambientales", scores: { equality: 2, liberty: 0, tradition: 0, global: 1 } },
      { ko: "시장 메커니즘으로 환경 문제를 해결할 수 있다", en: "Market mechanisms can solve environmental problems", ja: "市場メカニズムで環境問題を解決できる", zh: "市场机制可以解决环境问题", fr: "Les mécanismes de marché peuvent résoudre les problèmes environnementaux", es: "Los mecanismos de mercado pueden resolver los problemas ambientales", scores: { equality: 0, liberty: 2, tradition: 0, global: 0 } },
      { ko: "자연과 조화로운 전통적 삶의 방식을 회복해야 한다", en: "We should restore traditional ways of living in harmony with nature", ja: "自然と調和した伝統的な生き方を回復すべきだ", zh: "我们应恢复与自然和谐共处的传统生活方式", fr: "Nous devrions retrouver des modes de vie traditionnels en harmonie avec la nature", es: "Deberíamos recuperar formas de vida tradicionales en armonía con la naturaleza", scores: { equality: 0, liberty: 0, tradition: 2, global: 1 } },
      { ko: "국제 협약과 공동 대응이 핵심이다", en: "International agreements and joint response are key", ja: "国際協定と共同対応が核心だ", zh: "国际协议和共同应对是关键", fr: "Les accords internationaux et l'action commune sont essentiels", es: "Los acuerdos internacionales y la respuesta conjunta son clave", scores: { equality: 0, liberty: 0, tradition: 0, global: 2 } },
    ],
  },
  {
    ko: "교육에 대한 나의 관점은?",
    en: "My view on education:",
    ja: "教育に対する私の見解は？",
    zh: "我对教育的看法是？",
    fr: "Mon point de vue sur l'éducation :",
    es: "Mi visión sobre la educación:",
    options: [
      { ko: "모든 아이에게 동등한 교육 기회가 보장되어야 한다", en: "Equal educational opportunities must be guaranteed for all children", ja: "すべての子供に平等な教育機会が保障されるべきだ", zh: "必须保障所有儿童享有平等的教育机会", fr: "Des chances éducatives égales doivent être garanties à tous les enfants", es: "Deben garantizarse oportunidades educativas iguales para todos los niños", scores: { equality: 2, liberty: 0, tradition: 0, global: 1 } },
      { ko: "교육 선택의 자유와 경쟁이 품질을 높인다", en: "Freedom of choice and competition in education raise quality", ja: "教育選択の自由と競争が質を高める", zh: "教育选择自由和竞争能提高质量", fr: "La liberté de choix et la concurrence dans l'éducation améliorent la qualité", es: "La libertad de elección y la competencia en educación elevan la calidad", scores: { equality: 0, liberty: 2, tradition: 0, global: 0 } },
      { ko: "검증된 전통 교육 방식이 여전히 효과적이다", en: "Proven traditional education methods are still effective", ja: "実証済みの伝統的な教育方法がまだ効果的だ", zh: "经过验证的传统教育方法仍然有效", fr: "Les méthodes éducatives traditionnelles éprouvées restent efficaces", es: "Los métodos educativos tradicionales probados siguen siendo eficaces", scores: { equality: 0, liberty: 0, tradition: 2, global: 0 } },
      { ko: "글로벌 시민으로서의 역량을 키우는 교육이 중요하다", en: "Education that builds capacity as global citizens is important", ja: "グローバル市民としての能力を育む教育が重要だ", zh: "培养全球公民能力的教育很重要", fr: "Une éducation qui développe les compétences de citoyen du monde est importante", es: "Es importante una educación que desarrolle capacidades de ciudadanía global", scores: { equality: 1, liberty: 0, tradition: 0, global: 2 } },
    ],
  },
  {
    ko: "다양성과 문화에 대한 나의 관점은?",
    en: "My view on diversity and culture:",
    ja: "多様性と文化に対する私の見解は？",
    zh: "我对多样性与文化的看法是？",
    fr: "Mon point de vue sur la diversité et la culture :",
    es: "Mi visión sobre la diversidad y la cultura:",
    options: [
      { ko: "모든 문화와 정체성이 동등하게 존중받아야 한다", en: "All cultures and identities should be equally respected", ja: "すべての文化とアイデンティティが平等に尊重されるべきだ", zh: "所有文化和身份都应得到平等尊重", fr: "Toutes les cultures et identités devraient être respectées de manière égale", es: "Todas las culturas e identidades deberían ser respetadas por igual", scores: { equality: 2, liberty: 1, tradition: 0, global: 1 } },
      { ko: "개인이 자신의 정체성을 자유롭게 선택할 수 있어야 한다", en: "Individuals should be free to choose their own identity", ja: "個人が自分のアイデンティティを自由に選べるべきだ", zh: "个人应能自由选择自己的身份认同", fr: "Les individus devraient être libres de choisir leur propre identité", es: "Las personas deberían poder elegir libremente su propia identidad", scores: { equality: 0, liberty: 2, tradition: 0, global: 0 } },
      { ko: "전통 문화와 공동체 정체성을 지켜야 한다", en: "Traditional culture and community identity should be preserved", ja: "伝統文化とコミュニティのアイデンティティを守るべきだ", zh: "应守护传统文化和共同体身份", fr: "La culture traditionnelle et l'identité communautaire devraient être préservées", es: "La cultura tradicional y la identidad comunitaria deberían preservarse", scores: { equality: 0, liberty: 0, tradition: 2, global: 0 } },
      { ko: "다양한 문화의 공존이 사회를 풍요롭게 한다", en: "Coexistence of diverse cultures enriches society", ja: "多様な文化の共存が社会を豊かにする", zh: "多元文化共存会让社会更丰富", fr: "La coexistence de cultures diverses enrichit la société", es: "La coexistencia de culturas diversas enriquece la sociedad", scores: { equality: 1, liberty: 0, tradition: 0, global: 2 } },
    ],
  },
];

const dimensionInfo: Record<ValueDimension, {
  emoji: string;
  color: string;
  ko: { title: string; description: string };
  en: { title: string; description: string };
  ja: { title: string; description: string };
  zh: { title: string; description: string };
  fr: { title: string; description: string };
  es: { title: string; description: string };
}> = {
  equality: { emoji: "⚖️", color: "#10b981", ko: { title: "평등 지향", description: "모든 사람의 평등한 기회와 공정한 사회를 중시합니다. 구조적 불평등 해소와 사회적 약자 보호에 관심이 많습니다." }, en: { title: "Equality Oriented", description: "You value equal opportunities and a fair society for everyone. You care about addressing structural inequality and protecting the vulnerable." }, ja: { title: "平等志向", description: "すべての人の平等な機会と公正な社会を重視します。構造的不平等の解消と社会的弱者の保護に関心があります。" }, zh: { title: "平等导向", description: "你重视每个人的平等机会和公平社会。你关心结构性不平等的解决，以及对弱势群体的保护。" }, fr: { title: "Orientation égalité", description: "Vous accordez de l'importance à l'égalité des chances et à une société juste pour tous. Vous êtes sensible aux inégalités structurelles et à la protection des personnes vulnérables." }, es: { title: "Orientación a la igualdad", description: "Valoras la igualdad de oportunidades y una sociedad justa para todos. Te importa abordar la desigualdad estructural y proteger a las personas vulnerables." } },
  liberty: { emoji: "🦅", color: "#f59e0b", ko: { title: "자유 지향", description: "개인의 자유와 자율성을 최고 가치로 봅니다. 정부 개입을 최소화하고 개인이 스스로 선택할 권리를 중시합니다." }, en: { title: "Liberty Oriented", description: "You see individual freedom and autonomy as the highest value. You favor minimal government intervention and the right to make one's own choices." }, ja: { title: "自由志向", description: "個人の自由と自律性を最高の価値と見なします。政府の介入を最小化し、個人が自ら選択する権利を重視します。" }, zh: { title: "自由导向", description: "你把个人自由和自主性视为最高价值。你倾向于减少政府干预，并重视个人自己做选择的权利。" }, fr: { title: "Orientation liberté", description: "Vous considérez la liberté individuelle et l'autonomie comme des valeurs centrales. Vous préférez limiter l'intervention de l'État et défendre le droit de chacun à choisir par lui-même." }, es: { title: "Orientación a la libertad", description: "Ves la libertad individual y la autonomía como valores máximos. Prefieres una intervención gubernamental mínima y valoras el derecho de cada persona a elegir por sí misma." } },
  tradition: { emoji: "🏛️", color: "#8b5cf6", ko: { title: "전통 지향", description: "검증된 전통과 사회 질서의 안정성을 중시합니다. 급격한 변화보다 점진적이고 신중한 접근을 선호합니다." }, en: { title: "Tradition Oriented", description: "You value proven traditions and the stability of social order. You prefer gradual, careful approaches over rapid change." }, ja: { title: "伝統志向", description: "実証済みの伝統と社会秩序の安定性を重視します。急激な変化より段階的で慎重なアプローチを好みます。" }, zh: { title: "传统导向", description: "你重视经过验证的传统和社会秩序的稳定。相比快速变化，你更偏好渐进、谨慎的做法。" }, fr: { title: "Orientation tradition", description: "Vous valorisez les traditions éprouvées et la stabilité de l'ordre social. Vous préférez les approches progressives et prudentes aux changements rapides." }, es: { title: "Orientación a la tradición", description: "Valoras las tradiciones probadas y la estabilidad del orden social. Prefieres enfoques graduales y cuidadosos antes que cambios rápidos." } },
  global: { emoji: "🌍", color: "#3b82f6", ko: { title: "글로벌 지향", description: "국제 협력과 글로벌 관점을 중시합니다. 국경을 초월한 공동 문제 해결과 다양한 문화의 공존을 지향합니다." }, en: { title: "Globally Oriented", description: "You value international cooperation and a global perspective. You pursue cross-border problem solving and coexistence of diverse cultures." }, ja: { title: "グローバル志向", description: "国際協力とグローバルな視点を重視します。国境を超えた共同問題解決と多様な文化の共存を目指します。" }, zh: { title: "全球导向", description: "你重视国际合作和全球视角。你追求跨越国界的共同问题解决，以及多元文化的共存。" }, fr: { title: "Orientation mondiale", description: "Vous accordez de l'importance à la coopération internationale et à une perspective globale. Vous recherchez des solutions transfrontalières et la coexistence de cultures diverses." }, es: { title: "Orientación global", description: "Valoras la cooperación internacional y una perspectiva global. Buscas resolver problemas más allá de las fronteras y favorecer la coexistencia de culturas diversas." } },
};

const ui = {
  ko: { title: "가치관 나침반 테스트", subtitle: "나를 이끄는 핵심 가치는?", progress: (c: number, t: number) => `${c} / ${t}`, resultTitle: "나의 가치 나침반", allDimensions: "가치 차원 분포", restart: "다시 하기", share: "결과 공유", copied: "복사됨!" },
  en: { title: "Value Compass Test", subtitle: "What core values guide me?", progress: (c: number, t: number) => `${c} / ${t}`, resultTitle: "My Value Compass", allDimensions: "Value Dimension Distribution", restart: "Restart", share: "Share Result", copied: "Copied!" },
  ja: { title: "バリューコンパステスト", subtitle: "私を導く核心的価値は？", progress: (c: number, t: number) => `${c} / ${t}`, resultTitle: "私のバリューコンパス", allDimensions: "価値次元の分布", restart: "もう一度", share: "結果をシェア", copied: "コピーされました！" },
  zh: { title: "价值观指南针测试", subtitle: "引导我的核心价值是什么？", progress: (c: number, t: number) => `${c} / ${t}`, resultTitle: "我的价值指南针", allDimensions: "价值维度分布", restart: "重新开始", share: "分享结果", copied: "已复制！" },
  fr: { title: "Test de boussole des valeurs", subtitle: "Quelles valeurs fondamentales me guident ?", progress: (c: number, t: number) => `${c} / ${t}`, resultTitle: "Ma boussole des valeurs", allDimensions: "Répartition des dimensions de valeur", restart: "Recommencer", share: "Partager le résultat", copied: "Copié !" },
  es: { title: "Test de brújula de valores", subtitle: "¿Qué valores centrales me guían?", progress: (c: number, t: number) => `${c} / ${t}`, resultTitle: "Mi brújula de valores", allDimensions: "Distribución de dimensiones de valor", restart: "Reiniciar", share: "Compartir resultado", copied: "¡Copiado!" },
};

export default function ValueCompassTest({ locale: localeProp }: Props) {
  const lp = (localeProp ?? "en").toLowerCase();
  const locale: SupportedLocale = (["ko", "en", "ja", "zh", "fr", "es"].includes(lp) ? lp : "en") as SupportedLocale;
  const tx = ui[locale];

  const [idx, setIdx] = useState(0);
  const [scores, setScores] = useState<Record<ValueDimension, number>>({ equality: 0, liberty: 0, tradition: 0, global: 0 });
  const [result, setResult] = useState<ValueDimension | null>(null);
  const [copied, setCopied] = useState(false);

  function pick(optScores: Record<ValueDimension, number>) {
    const next: Record<ValueDimension, number> = {
      equality: scores.equality + optScores.equality,
      liberty: scores.liberty + optScores.liberty,
      tradition: scores.tradition + optScores.tradition,
      global: scores.global + optScores.global,
    };
    const answered = idx + 1;
    if (answered < questions.length) {
      setScores(next);
      setTimeout(() => setIdx(answered), 280);
    } else {
      setScores(next);
      const winner = (Object.keys(next) as ValueDimension[]).reduce((a, b) => next[a] >= next[b] ? a : b);
      setResult(winner);
    }
  }

  function restart() {
    setIdx(0);
    setScores({ equality: 0, liberty: 0, tradition: 0, global: 0 });
    setResult(null);
  }

  async function share() {
    if (navigator.share) {
      await navigator.share({ title: tx.title, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (result) {
    const r = dimensionInfo[result];
    const rd = r[locale];
    const maxScore = Math.max(...Object.values(scores), 1);

    return (
      <div className="space-y-6">
        <div className="rounded-2xl p-6 text-center" style={{ background: `linear-gradient(135deg, ${r.color}18, ${r.color}08)`, border: `1px solid ${r.color}30` }}>
          <p className="text-sm font-medium text-gray-500 mb-1">{tx.resultTitle}</p>
          <div className="text-5xl mb-2">{r.emoji}</div>
          <h2 className="text-2xl font-bold text-gray-900">{rd.title}</h2>
          <p className="mt-3 text-sm text-gray-600">{rd.description}</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-semibold text-gray-700">{tx.allDimensions}</h3>
          <div className="space-y-3">
            {(Object.keys(scores) as ValueDimension[]).map((dim) => {
              const di = dimensionInfo[dim];
              return (
                <div key={dim}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">{di.emoji} {di[locale].title}</span>
                    <span className="text-xs text-gray-400">{scores[dim]}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${(scores[dim] / maxScore) * 100}%`, backgroundColor: di.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={restart} className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50">{tx.restart}</button>
          <button onClick={share} className="flex-1 rounded-xl py-3 text-sm font-medium text-white transition" style={{ backgroundColor: r.color }}>{copied ? tx.copied : tx.share}</button>
        </div>
        <ShareResultButton locale={localeProp ?? 'ko'} heading={tx.title} resultTitle={rd.title} emoji={r.emoji} />
      </div>
    );
  }

  const q = questions[idx];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">{tx.title}</h1>
        <p className="mt-1 text-gray-500">{tx.subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-green-500 transition-all duration-300" style={{ width: `${(idx / questions.length) * 100}%` }} />
        </div>
        <span className="text-sm text-gray-500">{tx.progress(idx + 1, questions.length)}</span>
      </div>
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <p className="mb-5 text-center text-lg font-medium text-gray-800">{q[locale]}</p>
        <div className="space-y-3">
          {q.options.map((opt, i) => (
            <button key={i} onClick={() => pick(opt.scores)} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-left text-sm text-gray-700 transition hover:border-green-300 hover:bg-green-50">
              {opt[locale]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
