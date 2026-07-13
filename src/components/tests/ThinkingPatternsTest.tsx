'use client';
import ShareResultButton from '../shared/ShareResultButton'

import { useState } from "react";

type SupportedLocale = "ko" | "en" | "ja" | "zh" | "fr" | "es";

interface Props {
  locale?: string;
}

type ThinkingType = "analytical" | "creative" | "practical" | "relational";

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
    type: ThinkingType;
  }[];
}

const questions: Question[] = [
  {
    ko: "복잡한 문제가 주어졌을 때 나는?",
    en: "When given a complex problem, I:",
    ja: "複雑な問題が与えられたとき、私は？",
    zh: "面对复杂问题时，我会？",
    fr: "Face à un problème complexe, je :",
    es: "Cuando tengo un problema complejo, yo:",
    options: [
      { ko: "데이터와 증거를 수집하고 체계적으로 분석한다", en: "Collect data and evidence, then analyze systematically", ja: "データと証拠を収集し体系的に分析する", zh: "收集数据和证据，然后系统地分析", fr: "Recueillir des données et des preuves, puis analyser de façon structurée", es: "Reunir datos y evidencias, y analizarlos de forma sistemática", type: "analytical" },
      { ko: "새로운 관점과 비유적 사고로 창의적 해결책을 찾는다", en: "Find creative solutions through new perspectives and analogical thinking", ja: "新しい視点と比喩的思考で創造的な解決策を見つける", zh: "用新视角和类比思维寻找创造性解决方案", fr: "Trouver des solutions créatives grâce à de nouveaux angles et à la pensée analogique", es: "Buscar soluciones creativas con nuevas perspectivas y pensamiento analógico", type: "creative" },
      { ko: "실제로 작동하는 실용적인 해결책을 빠르게 찾는다", en: "Quickly find practical solutions that actually work", ja: "実際に機能する実用的な解決策を素早く見つける", zh: "快速找到真正可行的实用方案", fr: "Trouver rapidement des solutions pratiques qui fonctionnent vraiment", es: "Encontrar rápido soluciones prácticas que funcionen de verdad", type: "practical" },
      { ko: "사람들의 의견을 수렴하고 모두에게 좋은 방법을 찾는다", en: "Gather people's opinions and find what's good for everyone", ja: "人々の意見を集め全員に良い方法を見つける", zh: "听取大家的意见，找到对所有人都好的办法", fr: "Recueillir les avis et chercher ce qui convient à tout le monde", es: "Recoger opiniones y encontrar lo mejor para todos", type: "relational" },
    ],
  },
  {
    ko: "결정을 내릴 때 가장 중요하게 생각하는 것은?",
    en: "What matters most when making decisions?",
    ja: "決定を下すとき最も重要に思うことは？",
    zh: "做决定时，你最看重什么？",
    fr: "Qu'est-ce qui compte le plus quand vous prenez une décision ?",
    es: "¿Qué es lo más importante al tomar decisiones?",
    options: [
      { ko: "논리와 데이터 — 객관적 사실에 기반한 결정", en: "Logic and data — decisions based on objective facts", ja: "論理とデータ — 客観的事実に基づく決定", zh: "逻辑与数据 — 基于客观事实的决定", fr: "La logique et les données — une décision fondée sur des faits objectifs", es: "La lógica y los datos — decisiones basadas en hechos objetivos", type: "analytical" },
      { ko: "직관과 가능성 — 새로운 기회를 만드는 결정", en: "Intuition and possibility — decisions that create new opportunities", ja: "直感と可能性 — 新しい機会を生み出す決定", zh: "直觉与可能性 — 创造新机会的决定", fr: "L'intuition et les possibilités — une décision qui ouvre de nouvelles occasions", es: "La intuición y la posibilidad — decisiones que crean nuevas oportunidades", type: "creative" },
      { ko: "결과와 효율 — 실제로 효과가 있는 결정", en: "Outcome and efficiency — decisions that actually work", ja: "結果と効率 — 実際に効果がある決定", zh: "结果与效率 — 实际有效的决定", fr: "Le résultat et l'efficacité — une décision qui marche concrètement", es: "El resultado y la eficiencia — decisiones que funcionan en la práctica", type: "practical" },
      { ko: "관계와 영향 — 사람들에게 미치는 영향을 고려한 결정", en: "Relationships and impact — decisions considering effects on people", ja: "関係と影響 — 人々への影響を考慮した決定", zh: "关系与影响 — 考虑对他人影响的决定", fr: "Les relations et l'impact — une décision qui tient compte des personnes", es: "Las relaciones y el impacto — decisiones que consideran a las personas", type: "relational" },
    ],
  },
  {
    ko: "새로운 아이디어를 설명할 때 나는?",
    en: "When explaining a new idea, I:",
    ja: "新しいアイデアを説明するとき、私は？",
    zh: "解释一个新想法时，我会？",
    fr: "Quand j'explique une nouvelle idée, je :",
    es: "Cuando explico una idea nueva, yo:",
    options: [
      { ko: "구조화된 논거와 데이터로 설득한다", en: "Convince with structured arguments and data", ja: "構造化された論拠とデータで説得する", zh: "用结构化论据和数据来说服", fr: "Convaincre avec des arguments structurés et des données", es: "Convencer con argumentos estructurados y datos", type: "analytical" },
      { ko: "스토리와 비유로 감각적으로 전달한다", en: "Communicate sensorially with stories and analogies", ja: "ストーリーと比喩で感覚的に伝える", zh: "用故事和比喻进行有画面感的表达", fr: "Transmettre l'idée de façon évocatrice avec des histoires et des analogies", es: "Transmitirla de forma evocadora con historias y analogías", type: "creative" },
      { ko: "구체적인 예시와 실행 방법을 보여준다", en: "Show concrete examples and how to implement", ja: "具体的な例と実行方法を示す", zh: "展示具体例子和执行方法", fr: "Montrer des exemples concrets et la manière de passer à l'action", es: "Mostrar ejemplos concretos y cómo llevarla a la práctica", type: "practical" },
      { ko: "청중의 반응을 보며 맞춤형으로 설명한다", en: "Explain customized based on audience reactions", ja: "聴衆の反応を見ながらカスタマイズして説明する", zh: "观察听众反应，并调整说明方式", fr: "Adapter mon explication aux réactions du public", es: "Adaptar la explicación según las reacciones del público", type: "relational" },
    ],
  },
  {
    ko: "팀에서 갈등이 생겼을 때 나의 역할은?",
    en: "My role when conflict arises in a team:",
    ja: "チームで対立が生じたとき私の役割は？",
    zh: "团队出现冲突时，我的角色是？",
    fr: "Quand un conflit apparaît dans une équipe, mon rôle est de :",
    es: "Cuando surge un conflicto en un equipo, mi papel es:",
    options: [
      { ko: "객관적인 사실을 정리하고 논리적인 해결책을 제안한다", en: "Organize objective facts and propose logical solutions", ja: "客観的な事実を整理し論理的な解決策を提案する", zh: "梳理客观事实，并提出合乎逻辑的解决方案", fr: "Organiser les faits objectifs et proposer une solution logique", es: "Ordenar los hechos objetivos y proponer soluciones lógicas", type: "analytical" },
      { ko: "새로운 관점을 제시하고 창의적인 타협점을 찾는다", en: "Present new perspectives and find creative compromises", ja: "新しい視点を提示し創造的な妥協点を見つける", zh: "提出新视角，寻找有创造性的折中方案", fr: "Apporter de nouveaux points de vue et trouver des compromis créatifs", es: "Aportar nuevas perspectivas y encontrar acuerdos creativos", type: "creative" },
      { ko: "실행 가능한 해결책에 초점을 맞추고 빠르게 진행한다", en: "Focus on actionable solutions and move forward quickly", ja: "実行可能な解決策に焦点を当て素早く進める", zh: "聚焦可执行的解决方案，并快速推进", fr: "Me concentrer sur des solutions applicables et avancer rapidement", es: "Centrarme en soluciones accionables y avanzar rápido", type: "practical" },
      { ko: "모든 사람의 감정과 입장을 이해하고 중재한다", en: "Understand everyone's feelings and positions and mediate", ja: "全員の感情と立場を理解して仲裁する", zh: "理解每个人的感受和立场，并进行协调", fr: "Comprendre les émotions et positions de chacun, puis servir de médiateur", es: "Entender los sentimientos y posturas de todos, y mediar", type: "relational" },
    ],
  },
  {
    ko: "학습하는 방식은?",
    en: "My learning style:",
    ja: "学習するスタイルは？",
    zh: "我的学习方式是？",
    fr: "Ma façon d'apprendre :",
    es: "Mi forma de aprender:",
    options: [
      { ko: "원리를 이해하고 체계적으로 정리하며 학습한다", en: "Learn by understanding principles and organizing them systematically", ja: "原理を理解し体系的に整理して学ぶ", zh: "通过理解原理并系统整理来学习", fr: "Apprendre en comprenant les principes et en les organisant méthodiquement", es: "Aprender entendiendo los principios y organizándolos de forma sistemática", type: "analytical" },
      { ko: "다양한 분야를 넘나들며 새로운 연결 고리를 발견한다", en: "Discover new connections by crossing various domains", ja: "様々な分野を横断して新しい繋がりを発見する", zh: "跨越不同领域，发现新的连接", fr: "Découvrir de nouveaux liens en passant d'un domaine à l'autre", es: "Descubrir nuevas conexiones entre distintos campos", type: "creative" },
      { ko: "직접 해보면서 경험을 통해 빠르게 습득한다", en: "Quickly acquire through hands-on experience", ja: "直接やってみて経験を通じて素早く習得する", zh: "通过亲自实践和经验快速掌握", fr: "Assimiler rapidement en pratiquant et en expérimentant", es: "Aprender rápido mediante la práctica y la experiencia directa", type: "practical" },
      { ko: "다른 사람들과 토론하고 공유하며 학습한다", en: "Learn by discussing and sharing with others", ja: "他の人と議論し共有しながら学ぶ", zh: "通过与他人讨论和分享来学习", fr: "Apprendre en discutant et en partageant avec les autres", es: "Aprender conversando y compartiendo con otras personas", type: "relational" },
    ],
  },
  {
    ko: "프레젠테이션을 준비할 때 나는?",
    en: "When preparing a presentation, I:",
    ja: "プレゼンテーションを準備するとき、私は？",
    zh: "准备演示时，我会？",
    fr: "Quand je prépare une présentation, je :",
    es: "Cuando preparo una presentación, yo:",
    options: [
      { ko: "정확한 데이터와 논리적 흐름을 최우선으로 한다", en: "Prioritize accurate data and logical flow above all", ja: "正確なデータと論理的な流れを最優先にする", zh: "把准确的数据和清晰的逻辑流程放在首位", fr: "Donner la priorité aux données exactes et à un fil logique clair", es: "Priorizar datos precisos y un flujo lógico claro", type: "analytical" },
      { ko: "시각적으로 매력적이고 독창적인 방식으로 전달한다", en: "Communicate in visually appealing and original ways", ja: "視覚的に魅力的で独創的な方法で伝える", zh: "用有视觉吸引力且独特的方式表达", fr: "Communiquer de manière visuellement attractive et originale", es: "Comunicar de forma visualmente atractiva y original", type: "creative" },
      { ko: "핵심만 간결하게 담아 실용적으로 구성한다", en: "Organize practically with only the essentials concisely", ja: "核心だけを簡潔にまとめて実用的に構成する", zh: "只保留重点，简洁且实用地组织内容", fr: "Structurer de façon pratique, avec l'essentiel seulement", es: "Organizarla de forma práctica, con solo lo esencial", type: "practical" },
      { ko: "청중을 잘 이해하고 공감할 수 있게 구성한다", en: "Understand the audience and structure it for empathy", ja: "聴衆をよく理解し共感できるように構成する", zh: "充分理解听众，并设计出能引发共鸣的内容", fr: "Bien comprendre le public et construire une présentation qui crée de l'empathie", es: "Entender bien al público y estructurarla para generar empatía", type: "relational" },
    ],
  },
];

const results: Record<ThinkingType, {
  emoji: string;
  color: string;
  ko: { title: string; subtitle: string; description: string; traits: string[]; careers: string };
  en: { title: string; subtitle: string; description: string; traits: string[]; careers: string };
  ja: { title: string; subtitle: string; description: string; traits: string[]; careers: string };
  zh: { title: string; subtitle: string; description: string; traits: string[]; careers: string };
  fr: { title: string; subtitle: string; description: string; traits: string[]; careers: string };
  es: { title: string; subtitle: string; description: string; traits: string[]; careers: string };
}> = {
  analytical: {
    emoji: "📊",
    color: "#3b82f6",
    ko: { title: "분석적 사고가", subtitle: "논리적인 문제 해결사", description: "체계적인 사고, 데이터 분석, 논리적 추론에 뛰어납니다. 증거에 기반하여 결정하고 복잡한 문제를 관리 가능한 요소로 세분화합니다.", traits: ["데이터 기반 의사결정", "복잡한 문제를 논리적 단계로 분해", "증거 기반 접근 방식 선호"], careers: "데이터 과학자, 연구원, 재무 분석가, 엔지니어" },
    en: { title: "Analytical Thinker", subtitle: "Logical Problem Solver", description: "You excel at systematic thinking, data analysis, and logical reasoning. You make evidence-based decisions and break complex problems into manageable components.", traits: ["Data-driven decision making", "Breaks complex problems into logical steps", "Prefers evidence-based approaches"], careers: "Data Scientist, Researcher, Financial Analyst, Engineer" },
    ja: { title: "分析的思考者", subtitle: "論理的な問題解決者", description: "体系的な思考、データ分析、論理的推論に優れています。証拠に基づいて決定し、複雑な問題を管理可能な要素に分解します。", traits: ["データ駆動の意思決定", "複雑な問題を論理的なステップに分解", "証拠ベースのアプローチを好む"], careers: "データサイエンティスト、研究者、財務アナリスト、エンジニア" },
    zh: { title: "分析型思考者", subtitle: "逻辑型问题解决者", description: "你擅长系统性思考、数据分析和逻辑推理。你会基于证据做决定，并把复杂问题拆解成可处理的组成部分。", traits: ["以数据驱动决策", "把复杂问题拆解为逻辑步骤", "偏好基于证据的方法"], careers: "数据科学家、研究员、财务分析师、工程师" },
    fr: { title: "Penseur analytique", subtitle: "Résolveur logique de problèmes", description: "Vous excellez dans la pensée structurée, l'analyse de données et le raisonnement logique. Vous prenez des décisions fondées sur les preuves et décomposez les problèmes complexes en éléments maîtrisables.", traits: ["Décision guidée par les données", "Décompose les problèmes complexes en étapes logiques", "Préfère les approches fondées sur des preuves"], careers: "Data scientist, chercheur, analyste financier, ingénieur" },
    es: { title: "Pensador analítico", subtitle: "Solucionador lógico de problemas", description: "Destacas en el pensamiento sistemático, el análisis de datos y el razonamiento lógico. Tomas decisiones basadas en evidencias y divides problemas complejos en partes manejables.", traits: ["Toma de decisiones basada en datos", "Divide problemas complejos en pasos lógicos", "Prefiere enfoques basados en evidencias"], careers: "Científico de datos, investigador, analista financiero, ingeniero" },
  },
  creative: {
    emoji: "🎨",
    color: "#ec4899",
    ko: { title: "창의적 사고가", subtitle: "혁신적인 비저너리", description: "혁신, 거시적 사고, 관습에 얽매이지 않는 해결책으로 성장합니다. 남들이 놓치는 연결 고리를 보고 독특한 각도에서 도전에 접근합니다.", traits: ["혁신적인 아이디어 창출", "거시적인 패턴과 미래 가능성으로 사고", "관습에서 벗어난 창의적 각도로 접근"], careers: "디자이너, 마케터, 기업가, 작가" },
    en: { title: "Creative Thinker", subtitle: "Innovative Visionary", description: "You thrive through innovation, big-picture thinking, and unconventional solutions. You see connections others miss and approach challenges from unique angles.", traits: ["Generates innovative ideas", "Thinks in big-picture patterns and future possibilities", "Approaches with creative unconventional angles"], careers: "Designer, Marketer, Entrepreneur, Writer" },
    ja: { title: "創造的思考者", subtitle: "革新的なビジョナリー", description: "革新、大局的思考、型にはまらない解決策で成長します。他者が見逃す繋がりを見て、独自の角度から挑戦に取り組みます。", traits: ["革新的なアイデアを生み出す", "大局的なパターンと将来の可能性で考える", "型破りな創造的角度からアプローチ"], careers: "デザイナー、マーケター、起業家、ライター" },
    zh: { title: "创造型思考者", subtitle: "创新型愿景者", description: "你在创新、全局思考和非传统解决方案中表现出色。你能看见别人忽略的连接，并从独特角度处理挑战。", traits: ["产生创新想法", "以全局模式和未来可能性来思考", "用有创造力的非传统角度切入"], careers: "设计师、营销人员、创业者、作家" },
    fr: { title: "Penseur créatif", subtitle: "Visionnaire innovant", description: "Vous vous épanouissez dans l'innovation, la vision d'ensemble et les solutions non conventionnelles. Vous voyez des liens que d'autres manquent et abordez les défis sous des angles uniques.", traits: ["Génère des idées innovantes", "Pense en grands schémas et en possibilités futures", "Aborde les sujets avec des angles créatifs et non conventionnels"], careers: "Designer, marketeur, entrepreneur, écrivain" },
    es: { title: "Pensador creativo", subtitle: "Visionario innovador", description: "Creces con la innovación, la visión global y las soluciones poco convencionales. Ves conexiones que otros pasan por alto y abordas los retos desde ángulos únicos.", traits: ["Genera ideas innovadoras", "Piensa en patrones amplios y posibilidades futuras", "Aborda los retos desde ángulos creativos y poco convencionales"], careers: "Diseñador, especialista en marketing, emprendedor, escritor" },
  },
  practical: {
    emoji: "⚙️",
    color: "#10b981",
    ko: { title: "실천적 사고가", subtitle: "행동 중심의 실행가", description: "현실적으로 작동하는 것에 집중합니다. 실행력이 뛰어나며 이론적 논의보다 가시적 결과를 중요하게 여깁니다.", traits: ["결과 중심적 사고", "직접 해보는 학습과 실생활 적용 선호", "행동 중심적이며 효율적인 해결책 실행"], careers: "프로젝트 매니저, 운영 관리자, 컨설턴트" },
    en: { title: "Practical Thinker", subtitle: "Action-Oriented Executor", description: "You focus on what actually works in reality. You have strong execution ability and value tangible results over theoretical discussions.", traits: ["Results-oriented thinking", "Prefers hands-on learning and real-world application", "Action-oriented with efficient solution execution"], careers: "Project Manager, Operations Manager, Consultant" },
    ja: { title: "実践的思考者", subtitle: "行動中心の実行者", description: "現実に機能することに集中します。実行力が優れており、理論的な議論より目に見える結果を重視します。", traits: ["結果指向の思考", "直接やってみる学習と実世界への適用を好む", "行動指向で効率的な解決策の実行"], careers: "プロジェクトマネージャー、運営マネージャー、コンサルタント" },
    zh: { title: "实践型思考者", subtitle: "行动导向的执行者", description: "你关注现实中真正有效的做法。你有很强的执行力，比起理论讨论，更重视看得见的结果。", traits: ["结果导向的思考", "偏好动手学习和现实应用", "行动导向，能高效执行解决方案"], careers: "项目经理、运营经理、顾问" },
    fr: { title: "Penseur pratique", subtitle: "Exécutant orienté action", description: "Vous vous concentrez sur ce qui fonctionne réellement. Vous avez une forte capacité d'exécution et accordez plus de valeur aux résultats tangibles qu'aux discussions théoriques.", traits: ["Pensée orientée résultats", "Préfère l'apprentissage par la pratique et l'application concrète", "Orienté action, avec une exécution efficace des solutions"], careers: "Chef de projet, responsable des opérations, consultant" },
    es: { title: "Pensador práctico", subtitle: "Ejecutor orientado a la acción", description: "Te centras en lo que realmente funciona en la realidad. Tienes una gran capacidad de ejecución y valoras los resultados tangibles por encima de las discusiones teóricas.", traits: ["Pensamiento orientado a resultados", "Prefiere aprender haciendo y aplicar en el mundo real", "Orientado a la acción, con ejecución eficiente de soluciones"], careers: "Gerente de proyecto, gerente de operaciones, consultor" },
  },
  relational: {
    emoji: "🤝",
    color: "#f59e0b",
    ko: { title: "관계적 사고가", subtitle: "협력적인 커넥터", description: "사람을 이해하고 합의를 도출하며 모두에게 도움이 되는 해결책을 찾는 데 뛰어납니다. 공감 능력과 협력적 접근으로 조화로운 결과를 만듭니다.", traits: ["강한 대인 관계 기술과 공감 능력", "합의 도출과 윈윈 해결책 발견", "논리적 분석과 인간적 영향 사이의 균형 고려"], careers: "HR 관리자, 상담사, 교사, 팀 리더" },
    en: { title: "Relational Thinker", subtitle: "Collaborative Connector", description: "You excel at understanding people, building consensus, and finding solutions that help everyone. Your empathy creates harmonious outcomes.", traits: ["Strong interpersonal skills with excellent empathy", "Builds consensus and finds win-win solutions", "Balances logical analysis and human impact"], careers: "HR Manager, Counselor, Teacher, Team Leader" },
    ja: { title: "関係的思考者", subtitle: "協力的なコネクター", description: "人を理解し、合意を形成し、全員に役立つ解決策を見つけることに優れています。共感力と協力的アプローチで調和のある結果を生み出します。", traits: ["強い対人スキルと優れた共感力", "合意形成とウィンウィン解決策の発見", "論理的分析と人間的影響のバランス考慮"], careers: "HRマネージャー、カウンセラー、教師、チームリーダー" },
    zh: { title: "关系型思考者", subtitle: "协作型连接者", description: "你擅长理解他人、建立共识，并寻找对所有人都有帮助的解决方案。你的同理心和协作方式能创造更和谐的结果。", traits: ["强大的人际能力和出色的同理心", "建立共识并发现双赢方案", "平衡逻辑分析与人的影响"], careers: "人力资源经理、咨询师、教师、团队负责人" },
    fr: { title: "Penseur relationnel", subtitle: "Connecteur collaboratif", description: "Vous excellez à comprendre les personnes, à construire le consensus et à trouver des solutions utiles à tous. Votre empathie et votre approche collaborative créent des résultats harmonieux.", traits: ["Fortes compétences relationnelles et grande empathie", "Construit le consensus et trouve des solutions gagnant-gagnant", "Équilibre l'analyse logique et l'impact humain"], careers: "Responsable RH, conseiller, enseignant, chef d'équipe" },
    es: { title: "Pensador relacional", subtitle: "Conector colaborativo", description: "Destacas al comprender a las personas, crear consenso y encontrar soluciones que ayuden a todos. Tu empatía y tu enfoque colaborativo generan resultados armoniosos.", traits: ["Fuertes habilidades interpersonales y gran empatía", "Construye consenso y encuentra soluciones ganar-ganar", "Equilibra el análisis lógico con el impacto humano"], careers: "Gerente de RR. HH., consejero, profesor, líder de equipo" },
  },
};

const ui: Record<SupportedLocale, { title: string; subtitle: string; progress: (c: number, t: number) => string; resultTitle: string; traitsLabel: string; careersLabel: string; restart: string; share: string; copied: string }> = {
  ko: { title: "사고 패턴 테스트", subtitle: "나는 어떻게 생각하는가?", progress: (c: number, t: number) => `${c} / ${t}`, resultTitle: "나의 사고 스타일", traitsLabel: "나의 인지적 강점", careersLabel: "어울리는 직업", restart: "다시 하기", share: "결과 공유", copied: "복사됨!" },
  en: { title: "Thinking Patterns Test", subtitle: "How do I think?", progress: (c: number, t: number) => `${c} / ${t}`, resultTitle: "My Thinking Style", traitsLabel: "My Cognitive Strengths", careersLabel: "Fitting Careers", restart: "Restart", share: "Share Result", copied: "Copied!" },
  ja: { title: "思考パターンテスト", subtitle: "私はどのように考えるか？", progress: (c: number, t: number) => `${c} / ${t}`, resultTitle: "私の思考スタイル", traitsLabel: "私の認知的強み", careersLabel: "合う職業", restart: "もう一度", share: "結果をシェア", copied: "コピーされました！" },
  zh: { title: "思维模式测试", subtitle: "我是如何思考的？", progress: (c: number, t: number) => `${c} / ${t}`, resultTitle: "我的思维风格", traitsLabel: "我的认知优势", careersLabel: "适合的职业", restart: "重新开始", share: "分享结果", copied: "已复制！" },
  fr: { title: "Test des modes de pensée", subtitle: "Comment est-ce que je pense ?", progress: (c: number, t: number) => `${c} / ${t}`, resultTitle: "Mon style de pensée", traitsLabel: "Mes forces cognitives", careersLabel: "Métiers adaptés", restart: "Recommencer", share: "Partager le résultat", copied: "Copié !" },
  es: { title: "Test de patrones de pensamiento", subtitle: "¿Cómo pienso?", progress: (c: number, t: number) => `${c} / ${t}`, resultTitle: "Mi estilo de pensamiento", traitsLabel: "Mis fortalezas cognitivas", careersLabel: "Carreras afines", restart: "Reiniciar", share: "Compartir resultado", copied: "¡Copiado!" },
};

export default function ThinkingPatternsTest({ locale: localeProp }: Props) {
  const lp = (localeProp ?? "en").toLowerCase();
  const locale: SupportedLocale = (["ko", "en", "ja", "zh", "fr", "es"].includes(lp) ? lp : "en") as SupportedLocale;
  const tx = ui[locale];

  const [idx, setIdx] = useState(0);
  const [scores, setScores] = useState<Record<ThinkingType, number>>({ analytical: 0, creative: 0, practical: 0, relational: 0 });
  const [result, setResult] = useState<ThinkingType | null>(null);
  const [copied, setCopied] = useState(false);

  function pick(type: ThinkingType) {
    const next = { ...scores, [type]: scores[type] + 1 };
    const total = Object.values(next).reduce((a, b) => a + b, 0);
    if (total < questions.length) {
      setScores(next);
      setTimeout(() => setIdx(total), 280);
    } else {
      setScores(next);
      const winner = (Object.keys(next) as ThinkingType[]).reduce((a, b) => next[a] >= next[b] ? a : b);
      setResult(winner);
    }
  }

  function restart() {
    setIdx(0);
    setScores({ analytical: 0, creative: 0, practical: 0, relational: 0 });
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
    const r = results[result];
    const rd = r[locale];
    const maxScore = Math.max(...Object.values(scores), 1);

    return (
      <div className="space-y-6">
        <div className="rounded-2xl p-6 text-center" style={{ background: `linear-gradient(135deg, ${r.color}18, ${r.color}08)`, border: `1px solid ${r.color}30` }}>
          <p className="text-sm font-medium text-gray-500 mb-1">{tx.resultTitle}</p>
          <div className="text-5xl mb-2">{r.emoji}</div>
          <h2 className="text-2xl font-bold text-gray-900">{rd.title}</h2>
          <p className="mt-1 text-sm font-medium" style={{ color: r.color }}>{rd.subtitle}</p>
          <p className="mt-3 text-sm text-gray-600">{rd.description}</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">{tx.traitsLabel}</h3>
            <div className="space-y-1">
              {rd.traits.map((t, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="flex-shrink-0 font-bold" style={{ color: r.color }}>✓</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700">{tx.careersLabel}</h3>
            <p className="mt-1 text-sm text-gray-600">{rd.careers}</p>
          </div>
          <div>
            <div className="space-y-2">
              {(Object.keys(scores) as ThinkingType[]).map((type) => (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-lg w-6">{results[type].emoji}</span>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${(scores[type] / maxScore) * 100}%`, backgroundColor: results[type].color }} />
                  </div>
                  <span className="text-xs text-gray-400 w-4">{scores[type]}</span>
                </div>
              ))}
            </div>
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
          <div className="h-full rounded-full bg-pink-500 transition-all duration-300" style={{ width: `${(idx / questions.length) * 100}%` }} />
        </div>
        <span className="text-sm text-gray-500">{tx.progress(idx + 1, questions.length)}</span>
      </div>
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <p className="mb-5 text-center text-lg font-medium text-gray-800">{q[locale]}</p>
        <div className="space-y-3">
          {q.options.map((opt, i) => (
            <button key={i} onClick={() => pick(opt.type)} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-left text-sm text-gray-700 transition hover:border-pink-300 hover:bg-pink-50">
              {opt[locale]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
