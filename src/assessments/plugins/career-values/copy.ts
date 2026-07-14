import type { AssessmentLocale } from "../../core";

export const CAREER_VALUE_IDS = [
  "security", "achievement", "autonomy", "service", "creativity", "status",
] as const;

export type CareerValueId = (typeof CAREER_VALUE_IDS)[number];

type DimensionCopy = { name: string; description: string; environments: string[] };
type CareerValuesCopy = {
  title: string; subtitle: string; questionOf: (current: number, total: number) => string;
  scaleLabels: string[]; restart: string; share: string; copied: string; shareFailed: string;
  resultTitle: string; topGroup: string; profile: string; environments: string;
  reflection: string; disclaimer: string; tieNote: string;
  dimensions: Record<CareerValueId, DimensionCopy>;
};

export const CAREER_VALUES_COPY: Record<AssessmentLocale, CareerValuesCopy> = {
  ko: {
    title: "직업 가치관 탐색", subtitle: "일하는 환경에서 무엇을 중요하게 여기는지 돌아봅니다.", questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ["전혀 중요하지 않다", "별로 중요하지 않다", "보통이다", "꽤 중요하다", "매우 중요하다"],
    restart: "다시 하기", share: "결과 공유", copied: "결과가 복사되었습니다.", shareFailed: "공유하지 못했습니다.",
    resultTitle: "현재의 직업 가치관", topGroup: "상위 가치군", profile: "6차원 분포", environments: "살펴볼 업무환경 특징",
    reflection: "상위 가치가 실제로 존중되었던 경험과, 다음 선택에서 확인할 질문을 한 가지씩 적어 보세요.",
    disclaimer: "OIYO가 만든 18문항 자기성찰 도구입니다. 검증된 심리척도·진단·직업 적합도·채용 판단이 아니며 특정 직업을 추천하지 않습니다.",
    tieNote: "같은 점수는 공동 순위로 표시합니다.",
    dimensions: {
      security: { name: "안정성", description: "예측 가능성과 지속 가능한 조건을 중요하게 보는 경향", environments: ["명확한 계약과 역할", "예측 가능한 일정", "복지·안전망이 투명한 조직"] },
      achievement: { name: "성취", description: "도전적인 목표와 진척의 확인을 중요하게 보는 경향", environments: ["명확한 목표", "구체적인 피드백", "성과와 학습을 확인할 수 있는 구조"] },
      autonomy: { name: "자율성", description: "일하는 방법과 판단의 재량을 중요하게 보는 경향", environments: ["방법을 선택할 재량", "유연한 과정과 일정", "과도한 미세관리 없이 책임지는 문화"] },
      service: { name: "기여", description: "다른 사람과 공동체에 미치는 긍정적 영향을 중요하게 보는 경향", environments: ["사용자·공동체의 효익이 보이는 일", "윤리적 사명", "직접적인 도움의 피드백"] },
      creativity: { name: "창의성", description: "새로운 아이디어와 다양한 문제 해결을 중요하게 보는 경향", environments: ["아이디어를 시험할 여지", "다양한 문제", "만들고 표현할 공간"] },
      status: { name: "인정", description: "책임, 기여와 성장을 가시적으로 인정받는 것을 중요하게 보는 경향", environments: ["책임 범위가 분명한 역할", "공정한 인정 체계", "성장·리더십 기회"] },
    },
  },
  en: {
    title: "Career Values Reflection", subtitle: "Reflect on what matters to you in a work environment.", questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ["Not important at all", "Slightly important", "Neutral", "Quite important", "Very important"],
    restart: "Retake", share: "Share result", copied: "Result copied.", shareFailed: "Could not share.",
    resultTitle: "Your current work values", topGroup: "Top value group", profile: "Six-dimension profile", environments: "Work-environment features to explore",
    reflection: "Recall when these values were respected, then write one question to ask before your next work decision.",
    disclaimer: "An original 18-item OIYO reflection tool—not a validated scale, diagnosis, career-fit or hiring decision. It does not recommend specific occupations.",
    tieNote: "Equal scores share the same rank.",
    dimensions: {
      security: { name: "Security", description: "A preference for predictability and sustainable conditions", environments: ["Clear contracts and roles", "Predictable schedules", "Transparent benefits and safety nets"] },
      achievement: { name: "Achievement", description: "A preference for challenging goals and visible progress", environments: ["Clear goals", "Specific feedback", "Structures that reveal results and learning"] },
      autonomy: { name: "Autonomy", description: "A preference for discretion in methods and decisions", environments: ["Choice over methods", "Flexible processes or schedules", "Accountability without micromanagement"] },
      service: { name: "Contribution", description: "A preference for positive impact on people or communities", environments: ["Visible user or community benefit", "An ethical mission", "Direct feedback about whom the work helps"] },
      creativity: { name: "Creativity", description: "A preference for new ideas and varied problem-solving", environments: ["Room to test ideas", "Varied problems", "Space to make and express"] },
      status: { name: "Recognition", description: "A preference for visible recognition of responsibility, contribution, and growth", environments: ["Roles with clear responsibility", "Fair recognition systems", "Growth or leadership opportunities"] },
    },
  },
  ja: {
    title: "仕事の価値観リフレクション", subtitle: "働く環境で何を大切にするか振り返ります。", questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ["全く重要でない", "あまり重要でない", "どちらでもない", "かなり重要", "とても重要"], restart: "もう一度", share: "結果を共有", copied: "結果をコピーしました。", shareFailed: "共有できませんでした。", resultTitle: "現在の仕事の価値観", topGroup: "上位の価値群", profile: "6次元プロフィール", environments: "確認したい職場環境の特徴", reflection: "価値が尊重された経験と、次の選択で確認する質問を一つずつ書きましょう。", disclaimer: "OIYO独自の18項目の自己省察ツールです。検証済み尺度・診断・職業適合・採用判断ではなく、特定の職業を推薦しません。", tieNote: "同点は同順位で表示します。",
    dimensions: {
      security: { name: "安定性", description: "予測可能で持続できる条件を重視する傾向", environments: ["明確な契約と役割", "予測しやすい予定", "福利厚生と安全網が透明な組織"] }, achievement: { name: "達成", description: "挑戦的な目標と進捗の確認を重視する傾向", environments: ["明確な目標", "具体的なフィードバック", "成果と学びが見える仕組み"] }, autonomy: { name: "自律性", description: "方法と判断の裁量を重視する傾向", environments: ["方法を選ぶ裁量", "柔軟なプロセスや予定", "細かな管理なしで責任を持つ文化"] }, service: { name: "貢献", description: "人や地域への良い影響を重視する傾向", environments: ["利用者や地域への効果が見える仕事", "倫理的な使命", "誰を助けたか分かる反応"] }, creativity: { name: "創造性", description: "新しい発想と多様な問題解決を重視する傾向", environments: ["発想を試せる余地", "多様な問題", "制作と表現の空間"] }, status: { name: "承認", description: "責任・貢献・成長が目に見えて認められることを重視する傾向", environments: ["責任範囲が明確な役割", "公正な承認制度", "成長やリーダーシップの機会"] },
    },
  },
  zh: {
    title: "职业价值观反思", subtitle: "回顾你在工作环境中看重什么。", questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ["完全不重要", "不太重要", "一般", "比较重要", "非常重要"], restart: "重新测试", share: "分享结果", copied: "结果已复制。", shareFailed: "无法分享。", resultTitle: "你当前的工作价值观", topGroup: "高分价值组", profile: "六维分布", environments: "可进一步了解的工作环境特征", reflection: "回想这些价值曾被尊重的经历，并为下次工作选择写下一个要确认的问题。", disclaimer: "这是OIYO原创的18题自我反思工具，不是经验证的量表、诊断、职业适配或招聘判断，也不推荐特定职业。", tieNote: "同分项目并列显示。",
    dimensions: {
      security: { name: "稳定", description: "重视可预测性与可持续条件的倾向", environments: ["清晰的合同与职责", "可预测的日程", "福利与保障透明的组织"] }, achievement: { name: "成就", description: "重视挑战目标与可见进展的倾向", environments: ["明确的目标", "具体的反馈", "能看见成果与学习的机制"] }, autonomy: { name: "自主", description: "重视工作方法与判断自主权的倾向", environments: ["选择方法的空间", "灵活的流程或日程", "无需过度微观管理的负责文化"] }, service: { name: "贡献", description: "重视对他人或社群产生积极影响的倾向", environments: ["用户或社群收益清晰的工作", "符合伦理的使命", "能了解工作帮助了谁的反馈"] }, creativity: { name: "创造", description: "重视新想法与多样问题解决的倾向", environments: ["试验想法的空间", "多样的问题", "创作与表达的余地"] }, status: { name: "认可", description: "重视责任、贡献与成长得到公开认可的倾向", environments: ["责任清晰的角色", "公平的认可机制", "成长或领导机会"] },
    },
  },
  fr: {
    title: "Réflexion sur les valeurs professionnelles", subtitle: "Réfléchissez à ce qui compte dans votre environnement de travail.", questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ["Pas important du tout", "Peu important", "Neutre", "Assez important", "Très important"], restart: "Recommencer", share: "Partager", copied: "Résultat copié.", shareFailed: "Partage impossible.", resultTitle: "Vos valeurs professionnelles actuelles", topGroup: "Groupe de valeurs dominant", profile: "Profil en six dimensions", environments: "Caractéristiques d’environnement à explorer", reflection: "Repérez une expérience où ces valeurs ont été respectées et une question à poser avant votre prochaine décision professionnelle.", disclaimer: "Outil de réflexion original OIYO en 18 items : ni échelle validée, ni diagnostic, ni décision d’adéquation ou de recrutement. Il ne recommande aucun métier.", tieNote: "Les scores égaux partagent le même rang.",
    dimensions: {
      security: { name: "Sécurité", description: "Préférence pour la prévisibilité et des conditions durables", environments: ["Contrats et rôles clairs", "Horaires prévisibles", "Avantages et protections transparents"] }, achievement: { name: "Accomplissement", description: "Préférence pour les objectifs stimulants et les progrès visibles", environments: ["Objectifs clairs", "Retours précis", "Résultats et apprentissages visibles"] }, autonomy: { name: "Autonomie", description: "Préférence pour la latitude dans les méthodes et décisions", environments: ["Choix des méthodes", "Processus ou horaires flexibles", "Responsabilité sans microgestion"] }, service: { name: "Contribution", description: "Préférence pour un impact positif sur autrui ou la collectivité", environments: ["Bénéfice visible pour les usagers", "Mission éthique", "Retour direct sur les personnes aidées"] }, creativity: { name: "Créativité", description: "Préférence pour les idées nouvelles et les problèmes variés", environments: ["Possibilité de tester des idées", "Problèmes variés", "Espace pour créer et s’exprimer"] }, status: { name: "Reconnaissance", description: "Préférence pour une reconnaissance visible des responsabilités, contributions et progrès", environments: ["Rôles aux responsabilités claires", "Systèmes de reconnaissance équitables", "Possibilités d’évolution ou de leadership"] },
    },
  },
  es: {
    title: "Reflexión sobre valores profesionales", subtitle: "Reflexiona sobre lo que valoras en un entorno laboral.", questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ["Nada importante", "Poco importante", "Neutral", "Bastante importante", "Muy importante"], restart: "Repetir", share: "Compartir", copied: "Resultado copiado.", shareFailed: "No se pudo compartir.", resultTitle: "Tus valores laborales actuales", topGroup: "Grupo de valores principal", profile: "Perfil de seis dimensiones", environments: "Características del entorno que puedes explorar", reflection: "Recuerda cuándo se respetaron estos valores y escribe una pregunta para tu próxima decisión laboral.", disclaimer: "Herramienta original de reflexión OIYO con 18 ítems; no es una escala validada, diagnóstico ni decisión de ajuste o contratación. No recomienda profesiones concretas.", tieNote: "Las puntuaciones iguales comparten rango.",
    dimensions: {
      security: { name: "Seguridad", description: "Preferencia por la previsibilidad y condiciones sostenibles", environments: ["Contratos y funciones claras", "Horarios previsibles", "Beneficios y protección transparentes"] }, achievement: { name: "Logro", description: "Preferencia por metas exigentes y progreso visible", environments: ["Metas claras", "Comentarios específicos", "Estructuras que muestran resultados y aprendizaje"] }, autonomy: { name: "Autonomía", description: "Preferencia por decidir métodos y criterios", environments: ["Elección de métodos", "Procesos u horarios flexibles", "Responsabilidad sin microgestión"] }, service: { name: "Contribución", description: "Preferencia por un impacto positivo en personas o comunidades", environments: ["Beneficio visible para usuarios o comunidad", "Misión ética", "Comentarios directos sobre a quién ayuda el trabajo"] }, creativity: { name: "Creatividad", description: "Preferencia por ideas nuevas y problemas variados", environments: ["Espacio para probar ideas", "Problemas variados", "Libertad para crear y expresarse"] }, status: { name: "Reconocimiento", description: "Preferencia por el reconocimiento visible de responsabilidad, contribución y crecimiento", environments: ["Funciones con responsabilidad clara", "Sistemas de reconocimiento justos", "Oportunidades de crecimiento o liderazgo"] },
    },
  },
};

export function careerValuesCopy(locale: AssessmentLocale = "en"): CareerValuesCopy {
  return CAREER_VALUES_COPY[locale];
}
