import type { Locale } from '../i18n';

export interface TestSourceNote {
  basis: string[];
  caution: 'clinical' | 'reflection' | 'symbolic' | 'style' | 'finance';
}

export const TEST_SOURCE_NOTES: Record<string, TestSourceNote> = {
  adhd: {
    basis: ['Adult ADHD Self-Report Scale (ASRS v1.1)', 'WHO Composite International Diagnostic Interview screening structure'],
    caution: 'clinical',
  },
  anxiety: {
    basis: ['Generalized Anxiety Disorder 7-item scale (GAD-7)', 'brief anxiety screening literature'],
    caution: 'clinical',
  },
  'attachment-style': {
    basis: ['Bowlby attachment theory', 'Ainsworth attachment patterns', 'Experiences in Close Relationships (ECR) model'],
    caution: 'reflection',
  },
  'anger-style': {
    basis: ['Novaco anger model', 'State-Trait Anger Expression Inventory (STAXI) concepts'],
    caution: 'reflection',
  },
  authoritarian: {
    basis: ['Right-Wing Authoritarianism (RWA)', 'Social Dominance Orientation (SDO)', 'system justification theory'],
    caution: 'reflection',
  },
  big5: {
    basis: ['Big Five / Five-Factor Model', 'IPIP-style public-domain personality item structure'],
    caution: 'reflection',
  },
  burnout: {
    basis: ['Maslach Burnout Inventory (MBI) model', 'occupational stress and recovery literature'],
    caution: 'clinical',
  },
  'commute-mental': {
    basis: ['commuting stress research', 'work recovery and daily stress appraisal models'],
    caution: 'reflection',
  },
  depression: {
    basis: ['Patient Health Questionnaire-9 (PHQ-9)', 'brief depression screening literature'],
    caution: 'clinical',
  },
  empathy: {
    basis: ['Interpersonal Reactivity Index (IRI)', 'empathy quotient concepts'],
    caution: 'reflection',
  },
  enneagram: {
    basis: ['Enneagram nine-type tradition', 'modern personality typology interpretation'],
    caution: 'symbolic',
  },
  eq: {
    basis: ['Mayer-Salovey emotional intelligence model', 'Goleman emotional competence framework'],
    caution: 'reflection',
  },
  'inner-strength': {
    basis: ['VIA character strengths framework', 'resilience and strengths-based psychology'],
    caution: 'reflection',
  },
  'investment-type': {
    basis: ['risk tolerance questionnaires', 'behavioral finance bias research'],
    caution: 'finance',
  },
  'lazy-perfectionist': {
    basis: ['perfectionism coping literature', 'procrastination and self-regulation models'],
    caution: 'reflection',
  },
  lethargy: {
    basis: ['behavioral activation principles', 'stress recovery and sleep hygiene literature'],
    caution: 'clinical',
  },
  'love-language': {
    basis: ['five love languages framework', 'relationship communication research'],
    caution: 'reflection',
  },
  mbti: {
    basis: ['Jungian type theory', 'MBTI-style four preference axes'],
    caution: 'symbolic',
  },
  narcissism: {
    basis: ['Narcissistic Personality Inventory (NPI) concepts', 'grandiosity and vulnerability trait literature'],
    caution: 'clinical',
  },
  perfectionism: {
    basis: ['Frost Multidimensional Perfectionism Scale concepts', 'Almost Perfect Scale-Revised concepts'],
    caution: 'reflection',
  },
  'personal-color': {
    basis: ['seasonal color analysis tradition', 'personal styling color harmony principles'],
    caution: 'style',
  },
  political: {
    basis: ['two-axis political compass model', 'civic values and ideological orientation surveys'],
    caution: 'reflection',
  },
  'self-esteem': {
    basis: ['Rosenberg Self-Esteem Scale', 'self-worth and self-compassion research'],
    caution: 'reflection',
  },
  'sleep-type': {
    basis: ['Morningness-Eveningness Questionnaire concepts', 'Munich Chronotype Questionnaire concepts'],
    caution: 'reflection',
  },
  'social-anxiety': {
    basis: ['Social Interaction Anxiety Scale concepts', 'Liebowitz Social Anxiety Scale concepts'],
    caution: 'clinical',
  },
};

const CAUTION_TEXT: Record<TestSourceNote['caution'], Record<Locale, string>> = {
  clinical: {
    ko: '이 검사는 자기 점검용 선별 참고 자료이며 의학적 진단을 대체하지 않습니다. 일상 기능에 어려움이 있거나 위험 신호가 있다면 전문가 상담을 우선하세요.',
    en: 'This is a self-check screening reference, not a medical diagnosis. If symptoms affect daily life or feel unsafe, professional support comes first.',
    ja: 'これは自己点検のための参考スクリーニングであり、医学的診断ではありません。生活に支障がある場合は専門家への相談を優先してください。',
    zh: '这是自我检查用的筛查参考，并非医学诊断。如影响日常生活或出现危险信号，请优先寻求专业帮助。',
    fr: "Ceci est un repère d'auto-évaluation, pas un diagnostic médical. Si les symptômes perturbent le quotidien, consultez un professionnel.",
    es: 'Es una referencia de autoevaluación, no un diagnóstico médico. Si afecta tu vida diaria, prioriza el apoyo profesional.',
  },
  reflection: {
    ko: '결과는 고정된 성격 판정이 아니라 자기이해를 돕는 참고 신호입니다. 실제 선택에는 상황, 경험, 주변 피드백을 함께 보세요.',
    en: 'Results are reflection signals, not fixed labels. Use them alongside context, experience, and feedback from people who know you.',
    ja: '結果は固定ラベルではなく自己理解の手がかりです。状況・経験・周囲のフィードバックと合わせて読んでください。',
    zh: '结果是自我理解的参考信号，而非固定标签。请结合情境、经验与他人反馈理解。',
    fr: "Les résultats sont des signaux de réflexion, pas des étiquettes fixes. Lisez-les avec votre contexte et vos expériences.",
    es: 'Los resultados son señales para reflexionar, no etiquetas fijas. Úsalos junto con tu contexto y experiencia.',
  },
  symbolic: {
    ko: '이 검사는 대중적 유형 언어를 자기 성찰용으로 재구성한 것입니다. 사람을 단정하거나 중요한 결정을 대신하는 근거로 쓰지 마세요.',
    en: 'This test adapts popular type language for reflection. Do not use it to define a person or replace important decisions.',
    ja: 'このテストは一般的なタイプ言語を自己省察向けに再構成したものです。人を断定したり重要な判断の代わりにしないでください。',
    zh: '本测试将流行类型语言改编为自我反思工具。请勿用来定义他人或替代重要决策。',
    fr: "Ce test adapte un langage typologique populaire pour l'introspection. Il ne doit pas définir une personne ni remplacer une décision importante.",
    es: 'Este test adapta un lenguaje tipológico popular para la reflexión. No debe definir a una persona ni reemplazar decisiones importantes.',
  },
  style: {
    ko: '색채·스타일 이론은 과학적 진단이 아니라 취향 탐색 도구입니다. 결과는 어울림을 실험하는 출발점으로만 사용하세요.',
    en: 'Color and style theory is a preference exploration tool, not a scientific diagnosis. Treat results as a starting point for trying looks.',
    ja: '色彩・スタイル理論は科学的診断ではなく好みを探る道具です。結果は試すための出発点として使ってください。',
    zh: '色彩与风格理论不是科学诊断，而是探索偏好的工具。请把结果作为尝试搭配的起点。',
    fr: "La théorie couleur/style explore les préférences, ce n'est pas un diagnostic scientifique. Utilisez le résultat comme point de départ.",
    es: 'La teoría de color y estilo explora preferencias, no es un diagnóstico científico. Usa el resultado como punto de partida.',
  },
  finance: {
    ko: '투자 성향 결과는 교육용 자기 점검이며 금융 조언이 아닙니다. 실제 투자 판단은 개인 재무상황과 전문가 조언을 함께 고려하세요.',
    en: 'Investment-style results are educational self-checks, not financial advice. Real decisions should consider your finances and qualified advice.',
    ja: '投資タイプの結果は教育目的の自己点検であり金融助言ではありません。実際の判断は個人状況と専門助言を考慮してください。',
    zh: '投资类型结果仅为教育性自检，不构成金融建议。实际投资应结合个人财务状况与专业建议。',
    fr: "Le résultat d'investissement est éducatif, pas un conseil financier. Décidez avec votre situation et un avis qualifié.",
    es: 'El resultado de inversión es educativo, no asesoría financiera. Decide considerando tu situación y consejo cualificado.',
  },
};

export function getTestSourceNote(pathWithoutLocale: string): TestSourceNote | undefined {
  const parts = pathWithoutLocale.split('/').filter(Boolean);
  if (parts.at(-1) !== 'test') return undefined;
  return TEST_SOURCE_NOTES[parts.slice(0, -1).join('/')];
}

export function getCautionText(caution: TestSourceNote['caution'], locale: Locale): string {
  return CAUTION_TEXT[caution][locale] ?? CAUTION_TEXT[caution].en;
}
