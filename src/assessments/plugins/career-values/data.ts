import type { AssessmentLocale, AssessmentLocaleBundle, InstrumentDefinition } from "../../core";
import { CAREER_VALUES_RELEASE_GATE } from "../../../../config/assessment-release-gates.js";
import { CAREER_VALUE_IDS, CAREER_VALUES_COPY, type CareerValueId } from "./copy";

const ITEM_DIMENSIONS: CareerValueId[] = CAREER_VALUE_IDS.flatMap((id) => [id, id, id]);

const PROMPTS: Record<AssessmentLocale, string[]> = {
  ko: ["직업 안정성과 꾸준한 수입이 중요하다", "예측 가능한 업무 환경에서 안정감을 느낀다", "장기적으로 지속 가능한 고용 조건을 중요하게 본다", "목표 달성과 진척을 확인하는 것이 중요하다", "도전적인 목표를 향할 때 동기가 생긴다", "내 기여가 결과로 이어지는 것을 확인하고 싶다", "내 방식으로 일할 수 있는 자유가 중요하다", "업무 시간이나 과정에 어느 정도 선택권이 있으면 좋다", "세세한 지시보다 스스로 판단할 여지를 원한다", "다른 사람에게 도움이 되는 일이 의미 있다", "내 일이 사회나 공동체에 긍정적 영향을 주는 것이 중요하다", "도움이 필요한 사람을 지원하는 일에서 보람을 느낀다", "새로운 아이디어를 내고 문제를 다르게 풀기를 즐긴다", "기존 방식뿐 아니라 새로운 접근을 시험하고 싶다", "독창적으로 만들거나 표현할 수 있는 환경을 원한다", "나의 책임과 기여가 인정받는 것이 중요하다", "역할과 책임의 성장이 가시적으로 드러나는 것을 중요하게 본다", "전문성과 성과에 대한 존중을 받고 싶다"],
  en: ["Job stability and steady income matter to me", "I feel at ease in a predictable work environment", "I value employment conditions that are sustainable over time", "Reaching goals and seeing progress matter to me", "Challenging goals motivate me", "I want to see how my contribution affects outcomes", "Freedom to choose how I work matters to me", "I value some choice over my schedule or process", "I prefer room for judgment over detailed instructions", "Work that helps other people feels meaningful", "It matters that my work benefits society or a community", "I find meaning in supporting people who need help", "I enjoy generating ideas and solving problems differently", "I want to test new approaches as well as established ones", "I value room to make or express something original", "Recognition of my responsibility and contribution matters", "I value visible growth in role and responsibility", "I want my expertise and results to be respected"],
  ja: ["仕事の安定と継続的な収入を大切にする", "予測しやすい職場環境に安心を感じる", "長く続けられる雇用条件を重視する", "目標達成と進捗の確認を大切にする", "挑戦的な目標に意欲が湧く", "自分の貢献が結果につながることを確認したい", "自分の方法で働く自由を大切にする", "時間やプロセスにある程度の選択権がほしい", "細かな指示より自分で判断する余地がほしい", "人を助ける仕事に意味を感じる", "仕事が社会や地域に良い影響を与えることを大切にする", "助けを必要とする人を支えることにやりがいを感じる", "新しい発想や違う問題解決を楽しむ", "既存の方法だけでなく新しい方法も試したい", "独自に作ったり表現したりできる環境を望む", "責任と貢献が認められることを大切にする", "役割と責任の成長が見えることを重視する", "専門性と成果を尊重されたい"],
  zh: ["我重视工作的稳定性和持续收入", "在可预测的工作环境中我更安心", "我重视长期可持续的雇佣条件", "实现目标并看到进展对我很重要", "有挑战性的目标会激励我", "我希望看到自己的贡献如何影响结果", "能选择工作方式对我很重要", "我希望对日程或流程有一定选择权", "比起细致指令，我更希望有自主判断空间", "能帮助他人的工作对我有意义", "我重视工作对社会或社群的积极影响", "支持需要帮助的人让我感到有意义", "我喜欢提出新想法并用不同方式解决问题", "我想在既有方法之外尝试新方法", "我重视能够原创或表达的空间", "我的责任与贡献得到认可很重要", "我重视角色和责任的成长能够被看见", "我希望专业能力和成果受到尊重"],
  fr: ["La stabilité de l’emploi et un revenu régulier comptent pour moi", "Je me sens à l’aise dans un environnement prévisible", "Je valorise des conditions d’emploi durables", "Atteindre des objectifs et voir les progrès compte pour moi", "Les objectifs stimulants me motivent", "Je veux voir l’effet de ma contribution sur les résultats", "La liberté de choisir ma façon de travailler compte pour moi", "Je souhaite une certaine latitude sur les horaires ou le processus", "Je préfère une marge de jugement à des instructions détaillées", "Un travail qui aide autrui a du sens pour moi", "Il importe que mon travail bénéficie à la société ou à une communauté", "Soutenir des personnes qui en ont besoin me paraît utile", "J’aime produire des idées et résoudre les problèmes autrement", "Je veux essayer de nouvelles approches en plus des méthodes établies", "Je valorise un espace pour créer ou m’exprimer de façon originale", "La reconnaissance de mes responsabilités et contributions compte", "Je valorise une progression visible du rôle et des responsabilités", "Je souhaite que mon expertise et mes résultats soient respectés"],
  es: ["La estabilidad laboral y unos ingresos constantes son importantes para mí", "Me siento cómodo en un entorno de trabajo previsible", "Valoro condiciones laborales sostenibles a largo plazo", "Alcanzar metas y ver el progreso es importante para mí", "Las metas exigentes me motivan", "Quiero ver cómo mi contribución afecta los resultados", "Tener libertad para elegir cómo trabajo es importante", "Valoro cierta elección sobre el horario o el proceso", "Prefiero margen de criterio a instrucciones detalladas", "Un trabajo que ayuda a otras personas tiene sentido para mí", "Me importa que mi trabajo beneficie a la sociedad o comunidad", "Apoyar a personas que necesitan ayuda me resulta significativo", "Disfruto generando ideas y resolviendo problemas de otra manera", "Quiero probar enfoques nuevos además de los establecidos", "Valoro el espacio para crear o expresarme con originalidad", "Me importa que se reconozcan mi responsabilidad y contribución", "Valoro que el crecimiento de mi función y responsabilidad sea visible", "Quiero que se respeten mi experiencia y resultados"],
};

export const CAREER_VALUES_INSTRUMENT: InstrumentDefinition = {
  items: ITEM_DIMENSIONS.map((dimension, index) => ({ constructId: `values.work.${dimension}`, id: `q${index + 1}`, promptKey: `items.q${index + 1}`, required: true, responseScaleId: "importance-1-5" })),
  responseScales: [{ id: "importance-1-5", kind: "likert", min: 1, max: 5 }],
  version: "career-values-oiyo-18-v1",
};

export function careerValueDimensionForItem(itemId: string): CareerValueId | undefined {
  const index = Number(itemId.slice(1)) - 1;
  return Number.isInteger(index) ? ITEM_DIMENSIONS[index] : undefined;
}

export function careerValuesPrompts(locale: AssessmentLocale): string[] { return PROMPTS[locale]; }

export function careerValuesLocaleBundle(): AssessmentLocaleBundle {
  return Object.fromEntries(Object.entries(CAREER_VALUES_COPY).map(([locale, copy]) => [locale, {
    content: { name: copy.title, description: copy.subtitle, disclaimer: copy.disclaimer, seoTitle: copy.title, seoDescription: copy.subtitle, strings: Object.fromEntries(PROMPTS[locale as AssessmentLocale].map((prompt, index) => [`items.q${index + 1}`, prompt])) },
    status: CAREER_VALUES_RELEASE_GATE.localeStatuses[locale as AssessmentLocale],
  }])) as AssessmentLocaleBundle;
}

export const CAREER_VALUES_ITEM_PROVENANCE = "All 18 items and the six OIYO dimensions are original reflection content. They do not reproduce the O*NET Work Importance Locator or CareerOneStop Work Values Matcher, and the instrument has not been psychometrically validated.";
