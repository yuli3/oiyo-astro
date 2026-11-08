/**
 * AIEO & SEO FAQPage JSON-LD Builder
 * Generates schema.org FAQPage structured data for Google SGE, Perplexity, and Copilot.
 * Integrates theoretical/academic basis from TestSourceNotes to provide authoritative citations.
 */

import type { Locale } from '../../i18n';
import type { TestSourceNote } from '../../data/test-source-notes';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqPageSchema {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }>;
}

const FAQ_TRANSLATIONS: Record<
  Locale,
  {
    basisQuestion: (title: string) => string;
    basisAnswer: (title: string, basisList: string, cautionText: string) => string;
    howToUseQuestion: string;
    howToUseAnswer: string;
    clinicalQuestion: string;
    clinicalAnswer: (isClinical: boolean) => string;
  }
> = {
  ko: {
    basisQuestion: (title) => `${title}의 학술적·이론적 배경은 무엇인가요?`,
    basisAnswer: (title, basisList, cautionText) =>
      `${title}은(는) ${basisList} 등의 검증된 심리학·통계학 모델 및 연구 문헌을 참고하여 설계되었습니다. ${cautionText}`,
    howToUseQuestion: '검사 결과는 어떻게 해석하고 일상에서 활용할 수 있나요?',
    howToUseAnswer:
      '검사 결과는 개인의 현재 심리적 성향, 인지 반응, 강점 및 취약점을 파악하는 자가 성찰 지표입니다. 결과를 바탕으로 감정 조절, 스트레스 완화, 대인관계 개선 및 업무 습관 피드백에 활용할 수 있습니다.',
    clinicalQuestion: '이 검사는 병원이나 전문 기관의 진료를 대체할 수 있나요?',
    clinicalAnswer: (isClinical) =>
      isClinical
        ? '본 검사는 선별(Screening) 및 자기이해를 돕기 위한 보조 도구이며, 정신건강의학과의 공식 임상 진단을 대신할 수 없습니다. 심각한 불편감이나 고통이 지속될 경우 공인된 전문가와의 상담을 권장합니다.'
        : '본 검사는 교육 및 자기성찰(Self-reflection) 목적으로 제공되며, 의료적 진단이나 법적 판단의 근거로 사용될 수 없습니다.',
  },
  en: {
    basisQuestion: (title) => `What is the theoretical and academic basis for ${title}?`,
    basisAnswer: (title, basisList, cautionText) =>
      `${title} is designed referencing validated psychological and statistical models including ${basisList}. ${cautionText}`,
    howToUseQuestion: 'How should the test results be interpreted and utilized in daily life?',
    howToUseAnswer:
      'The results serve as self-reflection indicators to help you understand your cognitive tendencies, emotional patterns, and behavioral strengths. Use these insights for stress management, relationship communication, and productive habit formation.',
    clinicalQuestion: 'Does this test substitute for professional clinical or medical diagnosis?',
    clinicalAnswer: (isClinical) =>
      isClinical
        ? 'This assessment is a self-reflection and screening aid, not a substitute for formal diagnostic evaluation by licensed mental health professionals. If symptoms persist or cause distress, please consult a healthcare provider.'
        : 'This tool is provided strictly for educational and personal reflection purposes and does not constitute medical or psychological diagnosis.',
  },
  ja: {
    basisQuestion: (title) => `${title}の学術的・理論的背景は何ですか？`,
    basisAnswer: (title, basisList, cautionText) =>
      `${title}は、${basisList}などの検証された心理学・統計学モデルおよび学術文献を参考にして設計されています。${cautionText}`,
    howToUseQuestion: '診断結果はどのように解釈し、日常生活で活用できますか？',
    howToUseAnswer:
      '診断結果は、個人の現在の心理的傾向、認知パターン、強みや課題を理解するための自己探求指標です。感情のセルフケア、人間関係の改善、仕事の習慣見直しに役立てることができます。',
    clinicalQuestion: 'この診断は医療機関による正式な臨床診断の代わりになりますか？',
    clinicalAnswer: (isClinical) =>
      isClinical
        ? '本診断は自己理解とスクリー닝のための参考ツールであり、医療機関での正式な診断に代わるものではありません。心身の不調が続く場合は、専門医へのご相談をお勧めします。'
        : '本ツールは教育および自己探求を目的として提供されており、医学的診断や法的判断の根拠となるものではありません。',
  },
  zh: {
    basisQuestion: (title) => `${title}的学术与理论背景是什么？`,
    basisAnswer: (title, basisList, cautionText) =>
      `${title}参考了包括 ${basisList} 在内的经验证的心理学与统计学模型进行构建。${cautionText}`,
    howToUseQuestion: '测试结果应如何解读与在日常生活中应用？',
    howToUseAnswer:
      '测试结果作为自我觉察与反思的参考指标，帮助您了解当前的心理偏好、认知反应和行为特征。可用于压力调节、人际沟通改善以及提升自我效能感。',
    clinicalQuestion: '该测试可以替代专业医疗或临床诊断吗？',
    clinicalAnswer: (isClinical) =>
      isClinical
        ? '本测试仅作为辅助了解自我及初步筛查的工具，不能替代精神科医生或临床心理师的正式诊断。若感到持续困扰，建议寻求专业医疗机构帮助。'
        : '本工具仅供个人反思与教育参考，不构成任何医疗或心理临床诊断。',
  },
  fr: {
    basisQuestion: (title) => `Quel est le fondement théorique et académique de ${title} ?`,
    basisAnswer: (title, basisList, cautionText) =>
      `${title} a été conçu en s'appuyant sur des modèles psychologiques et statistiques validés, notamment ${basisList}. ${cautionText}`,
    howToUseQuestion: 'Comment interpréter et utiliser les résultats dans la vie quotidienne ?',
    howToUseAnswer:
      'Les résultats constituent des repères d’auto-évaluation pour mieux cerner vos schémas cognitifs, vos réactions émotionnelles et vos atouts. Ils peuvent être utilisés pour guider votre équilibre de vie et vos relations.',
    clinicalQuestion: 'Ce test remplace-t-il une consultation ou un diagnostic médical ?',
    clinicalAnswer: (isClinical) =>
      isClinical
        ? 'Cette évaluation est un outil de réflexion personnelle et ne remplace pas un diagnostic clinique établi par un professionnel de santé qualifié.'
        : 'Cet outil est proposé à des fins purement éducatives et de réflexion personnelle, sans valeur de diagnostic médical.',
  },
  es: {
    basisQuestion: (title) => `¿Cuál es la base teórica y académica de ${title}?`,
    basisAnswer: (title, basisList, cautionText) =>
      `${title} está diseñado sobre la base de modelos psicológicos y estadísticos contrastados, incluyendo ${basisList}. ${cautionText}`,
    howToUseQuestion: '¿Cómo deben interpretarse y aplicarse los resultados en el día a día?',
    howToUseAnswer:
      'Los resultados sirven como indicadores de autoconocimiento para identificar tendencias cognitivas, patrones emocionales y fortalezas personales en el manejo del estrés y las relaciones.',
    clinicalQuestion: '¿Este test sustituye un diagnóstico clínico o médico profesional?',
    clinicalAnswer: (isClinical) =>
      isClinical
        ? 'Esta prueba es una herramienta de apoyo para el autoconocimiento y no reemplaza el diagnóstico clínico de un profesional de la salud mental.'
        : 'Esta herramienta se ofrece con fines educativos y de autorreflexión personal, sin constituir un diagnóstico médico.',
  },
};

const CAUTION_LABELS: Record<Locale, Record<string, string>> = {
  ko: {
    clinical: '본 검사는 임상 스크리닝 문헌을 반영한 자가 보고 척도입니다.',
    reflection: '본 검사는 교육적 자기성찰(Self-reflection)을 돕기 위해 구성되었습니다.',
    symbolic: '본 검사는 전통 상징 체계 및 심리 투사를 탐구하는 탐색적 도구입니다.',
    style: '본 검사는 개인의 선호 및 행동 스타일을 시각화하는 지표입니다.',
  },
  en: {
    clinical: 'This tool is a self-report instrument reflecting clinical screening literature.',
    reflection: 'This tool is structured for educational self-reflection.',
    symbolic: 'This tool explores traditional symbolic frameworks and psychological projection.',
    style: 'This tool visualizes individual preferences and behavioral styles.',
  },
  ja: {
    clinical: '本診断は臨床スクリーニング文献を反映した自己報告式の指標です。',
    reflection: '本診断は教育的な自己探求（セルフリフレクション）を支援する構成です。',
    symbolic: '本ツールは伝統的な象徴体系と心理的投影を探求するものです。',
    style: '個人の好みや行動スタイルを可視化する指標です。',
  },
  zh: {
    clinical: '本测评是参考临床筛查文献制定的自评量表。',
    reflection: '本测评旨在促进教育性自我反思。',
    symbolic: '本测评用于探索传统象征体系与心理投射。',
    style: '用于展示个人偏好与行为模式的参考指标。',
  },
  fr: {
    clinical: 'Cet outil est un instrument d’auto-évaluation inspiré de la littérature clinique.',
    reflection: 'Cet outil est conçu pour encourager l’introspection et la réflexion personnelle.',
    symbolic: 'Cet outil explore les systèmes symboliques traditionnels et la projection psychologique.',
    style: 'Indicateur visualisant les préférences et styles de comportement personnels.',
  },
  es: {
    clinical: 'Esta evaluación es un instrumento de autoinforme basado en literatura clínica.',
    reflection: 'Esta prueba está diseñada para fomentar la autorreflexión personal y educativa.',
    symbolic: 'Esta herramienta explora marcos simbólicos tradicionales y proyección psicológica.',
    style: 'Indicador que visualiza preferencias y estilos de conducta individuales.',
  },
};

export function buildFaqJsonLd(options: {
  title: string;
  locale: Locale;
  pathname?: string;
  testSourceNote?: TestSourceNote | null;
  customFaq?: FaqItem[];
}): FaqPageSchema | null {
  const { title, locale, testSourceNote, customFaq } = options;

  let entities: FaqItem[] = [];

  if (customFaq && customFaq.length > 0) {
    entities = customFaq;
  } else if (testSourceNote && testSourceNote.basis && testSourceNote.basis.length > 0) {
    const loc = FAQ_TRANSLATIONS[locale] ? locale : 'en';
    const trans = FAQ_TRANSLATIONS[loc];

    // Localized basis list if available, otherwise default basis
    const basisItems =
      testSourceNote.basisByLocale && testSourceNote.basisByLocale[loc]
        ? testSourceNote.basisByLocale[loc]
        : testSourceNote.basis;
    const basisList = basisItems.join(', ');

    const cautionType = testSourceNote.caution || 'reflection';
    const cautionText =
      (CAUTION_LABELS[loc] && CAUTION_LABELS[loc][cautionType]) ||
      CAUTION_LABELS['en'][cautionType] ||
      '';

    const isClinical = cautionType === 'clinical';

    entities = [
      {
        question: trans.basisQuestion(title),
        answer: trans.basisAnswer(title, basisList, cautionText),
      },
      {
        question: trans.howToUseQuestion,
        answer: trans.howToUseAnswer,
      },
      {
        question: trans.clinicalQuestion,
        answer: trans.clinicalAnswer(isClinical),
      },
    ];
  } else {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entities.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}
