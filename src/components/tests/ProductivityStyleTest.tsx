'use client';
import ShareResultButton from '../shared/ShareResultButton'

import { useState } from "react";

type SupportedLocale = "ko" | "en" | "ja" | "zh" | "fr" | "es";

interface Props {
  locale?: string;
}

type ProductivityType = "deepwork" | "multitasker" | "collaborator" | "flexible";

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
    type: ProductivityType;
  }[];
}

const questions: Question[] = [
  {
    ko: "업무 중 알림이 울릴 때 나는?",
    en: "When a notification goes off during work, I:",
    ja: "作業中に通知が来たとき、私は？",
    zh: "工作时收到通知，我会：",
    fr: "Quand une notification arrive pendant que je travaille, je :",
    es: "Cuando llega una notificación mientras trabajo, yo:",
    options: [
      { ko: "무시하고 나중에 몰아서 확인한다 — 방해받기 싫다", en: "Ignore it and check later in batch — I hate interruptions", ja: "無視して後でまとめて確認する — 邪魔されたくない", zh: "忽略它，稍后集中处理——我不喜欢被打断", fr: "Je l'ignore et je consulte plus tard en lot — je déteste les interruptions", es: "La ignoro y la reviso luego en bloque; odio las interrupciones", type: "deepwork" },
      { ko: "빠르게 확인하고 다른 업무로 넘어간다", en: "Quickly check and move to another task", ja: "素早く確認して別の作業へ移る", zh: "快速查看，然后转到另一项任务", fr: "Je vérifie rapidement puis je passe à une autre tâche", es: "La reviso rápido y paso a otra tarea", type: "multitasker" },
      { ko: "동료의 연락이면 바로 응답한다 — 협업이 중요하다", en: "Reply immediately if from a colleague — collaboration matters", ja: "同僚からなら即返信 — コラボが大事", zh: "如果是同事发来的，我会马上回复——协作很重要", fr: "Je réponds tout de suite si c'est un collègue — la collaboration compte", es: "Respondo de inmediato si es de un colega; colaborar importa", type: "collaborator" },
      { ko: "상황에 따라 다르게 대응한다", en: "Respond differently depending on the situation", ja: "状況によって対応を変える", zh: "根据情况采取不同处理方式", fr: "Je réagis différemment selon la situation", es: "Respondo de forma distinta según la situación", type: "flexible" },
    ],
  },
  {
    ko: "최고의 성과를 내는 환경은?",
    en: "The environment where I do my best work:",
    ja: "最高のパフォーマンスを発揮できる環境は？",
    zh: "我表现最好的工作环境是：",
    fr: "L'environnement où je travaille le mieux :",
    es: "El entorno donde trabajo mejor:",
    options: [
      { ko: "방해받지 않는 조용한 공간에서 긴 시간 집중", en: "Quiet space with no interruptions for long focus blocks", ja: "邪魔されない静かな空間で長時間集中", zh: "安静、不被打扰的空间，适合长时间专注", fr: "Un espace calme, sans interruptions, pour de longs blocs de concentration", es: "Un espacio tranquilo y sin interrupciones para largos bloques de concentración", type: "deepwork" },
      { ko: "여러 화면과 다양한 도구가 있는 역동적인 공간", en: "Dynamic space with multiple screens and varied tools", ja: "複数の画面と多様なツールがある動的な空間", zh: "有多个屏幕和多种工具的动态空间", fr: "Un espace dynamique avec plusieurs écrans et des outils variés", es: "Un espacio dinámico con varias pantallas y herramientas diversas", type: "multitasker" },
      { ko: "팀원들과 함께 브레인스토밍할 수 있는 협업 공간", en: "Collaborative space where I can brainstorm with teammates", ja: "チームメンバーとブレインストーミングできる共同作業空間", zh: "能和队友一起头脑风暴的协作空间", fr: "Un espace collaboratif où je peux brainstormer avec l'équipe", es: "Un espacio colaborativo donde puedo hacer lluvia de ideas con el equipo", type: "collaborator" },
      { ko: "카페, 도서관 등 장소를 바꿔가며 작업한다", en: "I change locations — cafes, libraries, wherever", ja: "カフェ、図書館など場所を変えながら作業する", zh: "我会换不同地点工作，比如咖啡馆、图书馆等", fr: "Je change de lieu : café, bibliothèque, peu importe", es: "Cambio de lugar: cafeterías, bibliotecas o donde sea", type: "flexible" },
    ],
  },
  {
    ko: "프로젝트를 시작할 때 나는?",
    en: "When starting a project, I:",
    ja: "プロジェクトを始めるとき、私は？",
    zh: "开始一个项目时，我会：",
    fr: "Quand je démarre un projet, je :",
    es: "Al empezar un proyecto, yo:",
    options: [
      { ko: "먼저 깊이 있는 리서치와 분석에 전용 시간을 확보한다", en: "First secure dedicated time for deep research and analysis", ja: "まず深いリサーチと分析のための専用時間を確保する", zh: "先为深入研究和分析预留专门时间", fr: "Je réserve d'abord du temps dédié à la recherche et à l'analyse approfondies", es: "Primero reservo tiempo dedicado para investigación y análisis profundos", type: "deepwork" },
      { ko: "여러 하위 작업을 동시에 시작하고 진행 상황을 추적한다", en: "Start multiple subtasks simultaneously and track progress", ja: "複数のサブタスクを同時に開始し進捗を追跡する", zh: "同时启动多个子任务，并跟踪进度", fr: "Je lance plusieurs sous-tâches en même temps et je suis l'avancement", es: "Inicio varias subtareas a la vez y hago seguimiento del progreso", type: "multitasker" },
      { ko: "팀원들과 킥오프 미팅을 열어 함께 계획을 세운다", en: "Hold a kickoff meeting with teammates to plan together", ja: "チームメンバーとキックオフミーティングを開き共に計画する", zh: "和队友开启动会议，一起制定计划", fr: "J'organise une réunion de lancement avec l'équipe pour planifier ensemble", es: "Hago una reunión inicial con el equipo para planificar juntos", type: "collaborator" },
      { ko: "큰 그림만 잡고 상황에 따라 유연하게 진행한다", en: "Grasp the big picture and proceed flexibly as situations unfold", ja: "大きな絵だけ把握し状況に応じて柔軟に進める", zh: "先把握大方向，再根据情况灵活推进", fr: "Je saisis la vue d'ensemble puis j'avance avec souplesse selon la situation", es: "Capto la visión general y avanzo con flexibilidad según evolucione la situación", type: "flexible" },
    ],
  },
  {
    ko: "업무에서 가장 큰 에너지를 얻는 순간은?",
    en: "The moment I get the most energy from work:",
    ja: "仕事から最も大きなエネルギーを得る瞬間は？",
    zh: "工作中最让我获得能量的时刻是：",
    fr: "Le moment où le travail me donne le plus d'énergie :",
    es: "El momento en que el trabajo me da más energía:",
    options: [
      { ko: "몰입 상태(플로우)에서 복잡한 문제를 완전히 해결했을 때", en: "When I completely solve a complex problem in a flow state", ja: "フロー状態で複雑な問題を完全に解決したとき", zh: "在心流状态中彻底解决复杂问题时", fr: "Quand je résous complètement un problème complexe en état de flow", es: "Cuando resuelvo por completo un problema complejo en estado de flow", type: "deepwork" },
      { ko: "여러 프로젝트를 효율적으로 동시에 진행할 때", en: "When I efficiently run multiple projects simultaneously", ja: "複数のプロジェクトを効率的に同時進行させたとき", zh: "高效地同时推进多个项目时", fr: "Quand je fais avancer efficacement plusieurs projets en même temps", es: "Cuando llevo varios proyectos a la vez de forma eficiente", type: "multitasker" },
      { ko: "팀과의 협업으로 혼자서는 불가능한 결과를 만들었을 때", en: "When collaboration produces results impossible alone", ja: "チームとの協力で一人では不可能な結果を生み出したとき", zh: "通过团队协作创造出单靠自己做不到的成果时", fr: "Quand la collaboration produit un résultat impossible à obtenir seul", es: "Cuando la colaboración genera resultados imposibles de lograr a solas", type: "collaborator" },
      { ko: "예상치 못한 상황에서도 유연하게 대처하여 성공했을 때", en: "When I succeed by adapting flexibly to unexpected situations", ja: "予想外の状況でも柔軟に対処して成功したとき", zh: "在意外情况下灵活应对并取得成功时", fr: "Quand je réussis en m'adaptant avec souplesse à l'imprévu", es: "Cuando tengo éxito al adaptarme con flexibilidad a situaciones inesperadas", type: "flexible" },
    ],
  },
  {
    ko: "일정 관리 방식은?",
    en: "My approach to scheduling:",
    ja: "スケジュール管理の方法は？",
    zh: "我的日程管理方式是：",
    fr: "Ma façon de gérer mon planning :",
    es: "Mi forma de organizar la agenda:",
    options: [
      { ko: "시간 블록을 설정하고 깊은 집중 시간을 보호한다", en: "Set time blocks and protect deep focus time", ja: "タイムブロックを設定し深い集中時間を守る", zh: "设置时间块，并保护深度专注时间", fr: "Je définis des blocs de temps et je protège mes moments de concentration profonde", es: "Defino bloques de tiempo y protejo el tiempo de concentración profunda", type: "deepwork" },
      { ko: "짧은 세션들로 여러 업무를 번갈아 처리한다", en: "Alternate between multiple tasks in short sessions", ja: "短いセッションで複数の作業を交互に処理する", zh: "用短时段在多项任务之间交替处理", fr: "J'alterne plusieurs tâches en sessions courtes", es: "Alterno entre varias tareas en sesiones cortas", type: "multitasker" },
      { ko: "팀 회의와 협업 시간을 중심으로 일정을 짠다", en: "Build my schedule around team meetings and collaboration", ja: "チームミーティングと協力時間を中心にスケジュールを組む", zh: "围绕团队会议和协作时间安排日程", fr: "J'organise mon planning autour des réunions d'équipe et des temps de collaboration", es: "Organizo mi agenda alrededor de reuniones de equipo y colaboración", type: "collaborator" },
      { ko: "그날의 에너지와 상황에 따라 즉흥적으로 조정한다", en: "Adjust spontaneously based on my energy and situation each day", ja: "その日のエネルギーと状況に応じて即興で調整する", zh: "根据当天的精力和情况即时调整", fr: "J'ajuste spontanément selon mon énergie et la situation du jour", es: "Ajusto espontáneamente según mi energía y la situación del día", type: "flexible" },
    ],
  },
  {
    ko: "새로운 아이디어는 어디서 가장 많이 나오나요?",
    en: "Where do most of my new ideas come from?",
    ja: "新しいアイデアはどこから最も多く生まれますか？",
    zh: "我的新想法大多来自哪里？",
    fr: "D'où viennent la plupart de mes nouvelles idées ?",
    es: "¿De dónde vienen la mayoría de mis ideas nuevas?",
    options: [
      { ko: "혼자 깊이 생각하거나 독서할 때", en: "When thinking deeply alone or reading", ja: "一人で深く考えているときや読書しているとき", zh: "独自深入思考或阅读时", fr: "Quand je réfléchis profondément seul ou que je lis", es: "Cuando pienso a fondo a solas o leo", type: "deepwork" },
      { ko: "여러 프로젝트 사이를 오가다가 연결 고리를 발견할 때", en: "When I notice connections while switching between projects", ja: "プロジェクト間を行き来しながら繋がりを発見したとき", zh: "在多个项目之间切换并发现关联时", fr: "Quand je repère des liens en passant d'un projet à l'autre", es: "Cuando descubro conexiones al cambiar entre proyectos", type: "multitasker" },
      { ko: "팀 브레인스토밍이나 대화를 통해", en: "Through team brainstorming or conversations", ja: "チームブレインストーミングや会話を通じて", zh: "通过团队头脑风暴或对话", fr: "Grâce aux brainstormings d'équipe ou aux conversations", es: "A través de lluvias de ideas en equipo o conversaciones", type: "collaborator" },
      { ko: "산책하거나 환경을 바꿀 때 갑자기 떠오른다", en: "Suddenly appear when walking or changing environments", ja: "散歩したり環境を変えたりしたとき突然浮かぶ", zh: "散步或改变环境时突然浮现", fr: "Elles surgissent quand je marche ou que je change d'environnement", es: "Aparecen de repente cuando camino o cambio de entorno", type: "flexible" },
    ],
  },
];

const results: Record<ProductivityType, {
  emoji: string;
  color: string;
  ko: { title: string; subtitle: string; description: string; traits: string[] };
  en: { title: string; subtitle: string; description: string; traits: string[] };
  ja: { title: string; subtitle: string; description: string; traits: string[] };
  zh: { title: string; subtitle: string; description: string; traits: string[] };
  fr: { title: string; subtitle: string; description: string; traits: string[] };
  es: { title: string; subtitle: string; description: string; traits: string[] };
}> = {
  deepwork: {
    emoji: "🎯",
    color: "#6366f1",
    ko: { title: "몰입형 전사", subtitle: "집중력의 대가", description: "방해받지 않는 긴 시간 동안 집중할 때 최상의 성과를 냅니다. 복잡한 문제를 깊이 파고들 때 최고의 역량을 발휘합니다. 알림은 당신의 적이며, 플로우 상태는 당신의 초능력입니다.", traits: ["방해 요소가 최소화된 환경에서 최고 효율", "높은 인지력이 필요한 복잡한 업무를 위해 전용 시간 블록 활용", "단일 업무에 대한 지속적이고 집중적인 몰입으로 성과 달성"] },
    en: { title: "Deep Work Warrior", subtitle: "Master of Focus", description: "You perform at your best when you can focus for long uninterrupted blocks. You excel at diving deep into complex problems. Notifications are your enemy and flow state is your superpower.", traits: ["Peak efficiency in environments with minimal distractions", "Uses dedicated time blocks for complex tasks requiring high cognition", "Achieves results through sustained, intense focus on a single task"] },
    ja: { title: "没入型ウォリアー", subtitle: "集中の達人", description: "邪魔されない長い時間集中できるとき最高のパフォーマンスを発揮します。複雑な問題に深く入り込むとき最高の能力を発揮します。通知はあなたの敵で、フロー状態はあなたの超能力です。", traits: ["妨害要素が最小化された環境で最高効率", "高い認知力が必要な複雑な作業のための専用タイムブロック活用", "単一タスクへの持続的な集中でパフォーマンス達成"] },
    zh: { title: "深度工作战士", subtitle: "专注力大师", description: "当你能在不被打扰的长时间段里专注时，会发挥最佳表现。你擅长深入钻研复杂问题。通知是你的敌人，而心流状态就是你的超能力。", traits: ["在干扰最少的环境中效率最高", "为需要高认知投入的复杂任务使用专门时间块", "通过对单一任务持续而强烈的专注取得成果"] },
    fr: { title: "Guerrier du deep work", subtitle: "Maître de la concentration", description: "Vous donnez le meilleur de vous-même quand vous pouvez vous concentrer longtemps sans interruption. Vous excellez quand il faut plonger dans des problèmes complexes. Les notifications sont votre ennemi, et l'état de flow est votre superpouvoir.", traits: ["Efficacité maximale dans les environnements avec peu de distractions", "Utilise des blocs de temps dédiés pour les tâches complexes à forte charge cognitive", "Obtient des résultats grâce à une concentration soutenue et intense sur une seule tâche"] },
    es: { title: "Guerrero del trabajo profundo", subtitle: "Maestro del enfoque", description: "Rindes al máximo cuando puedes concentrarte durante bloques largos y sin interrupciones. Sobresales al profundizar en problemas complejos. Las notificaciones son tu enemigo y el estado de flow es tu superpoder.", traits: ["Máxima eficiencia en entornos con distracciones mínimas", "Usa bloques de tiempo dedicados para tareas complejas de alta carga cognitiva", "Logra resultados mediante una concentración sostenida e intensa en una sola tarea"] },
  },
  multitasker: {
    emoji: "🎪",
    color: "#f59e0b",
    ko: { title: "멀티태스킹 달인", subtitle: "맥락 전환의 귀재", description: "다양한 업무를 동시에 처리하며 활력을 얻습니다. 한 번에 여러 가지 일을 관리하는 데 능숙하며 역동적인 환경을 좋아합니다.", traits: ["여러 프로젝트와 우선순위를 동시에 관리하는 데 탁월함", "다양성과 각기 다른 업무 유형 간의 전환을 통해 활력을 얻음", "다양한 책임이 부여되는 역동적인 환경에서 최고의 역량 발휘"] },
    en: { title: "Multitasking Maven", subtitle: "Context Switching Genius", description: "You thrive by handling multiple tasks simultaneously. You are skilled at managing many things at once and love dynamic environments.", traits: ["Excellent at managing multiple projects and priorities simultaneously", "Energized by variety and switching between different task types", "Performs best in dynamic environments with diverse responsibilities"] },
    ja: { title: "マルチタスクの達人", subtitle: "コンテキスト切替の天才", description: "複数のタスクを同時に処理することで活力を得ます。一度に多くのことを管理するのが得意で、動的な環境が好きです。", traits: ["複数のプロジェクトと優先事項を同時に管理するのに優れている", "多様性と異なるタスクタイプの切り替えからエネルギーを得る", "多様な責任が与えられる動的な環境で最高のパフォーマンス"] },
    zh: { title: "多任务达人", subtitle: "情境切换高手", description: "你会在同时处理多项任务时进入状态。你擅长一次管理很多事情，也喜欢充满变化的动态环境。", traits: ["擅长同时管理多个项目和优先事项", "从多样性以及不同任务类型之间的切换中获得能量", "在职责多元、节奏动态的环境中表现最佳"] },
    fr: { title: "Virtuose du multitâche", subtitle: "Génie du changement de contexte", description: "Vous vous épanouissez en gérant plusieurs tâches en même temps. Vous savez garder beaucoup de sujets en main et vous aimez les environnements dynamiques.", traits: ["Excellent dans la gestion simultanée de plusieurs projets et priorités", "Stimulé par la variété et le passage d'un type de tâche à l'autre", "Donne le meilleur dans les environnements dynamiques aux responsabilités variées"] },
    es: { title: "Experto en multitarea", subtitle: "Genio del cambio de contexto", description: "Te activas al manejar varias tareas al mismo tiempo. Se te da bien gestionar muchas cosas a la vez y te gustan los entornos dinámicos.", traits: ["Excelente para gestionar varios proyectos y prioridades simultáneamente", "Se energiza con la variedad y el cambio entre distintos tipos de tareas", "Rinde mejor en entornos dinámicos con responsabilidades diversas"] },
  },
  collaborator: {
    emoji: "🤝",
    color: "#10b981",
    ko: { title: "소셜 협업가", subtitle: "최강의 팀 플레이어", description: "다른 사람들과 함께 일할 때 최고의 성과를 냅니다. 브레인스토밍 세션은 당신에게 에너지를 주며, 공동의 목표에서 동기를 얻습니다.", traits: ["협업 세션을 통해 최고의 아이디어와 에너지를 얻음", "그룹 브레인스토밍과 팀 단위 문제 해결을 선호함", "공동의 목표와 팀워크를 통해 강한 의욕과 책임감을 느낌"] },
    en: { title: "Social Collaborator", subtitle: "Ultimate Team Player", description: "You perform at your best when working with others. Brainstorming sessions energize you, and shared goals motivate you.", traits: ["Gets best ideas and energy through collaborative sessions", "Prefers group brainstorming and team-based problem solving", "Feels strong motivation and accountability through shared goals"] },
    ja: { title: "ソーシャルコラボレーター", subtitle: "最強のチームプレイヤー", description: "他の人と一緒に作業するとき最高のパフォーマンスを発揮します。ブレインストーミングセッションはエネルギーを与え、共通の目標が動機になります。", traits: ["協力セッションで最高のアイデアとエネルギーを得る", "グループブレインストーミングとチームベースの問題解決を好む", "共通の目標とチームワークで強いモチベーションと責任感を感じる"] },
    zh: { title: "社交协作者", subtitle: "终极团队成员", description: "和他人一起工作时，你会发挥最佳表现。头脑风暴能给你能量，共同目标会激励你前进。", traits: ["通过协作会议获得最佳想法和能量", "偏好小组头脑风暴和团队式问题解决", "从共同目标和团队合作中感到强烈动力与责任感"] },
    fr: { title: "Collaborateur social", subtitle: "Joueur d'équipe ultime", description: "Vous êtes au meilleur de votre forme quand vous travaillez avec les autres. Les séances de brainstorming vous dynamisent, et les objectifs partagés vous motivent.", traits: ["Trouve ses meilleures idées et son énergie dans les sessions collaboratives", "Préfère le brainstorming en groupe et la résolution de problèmes en équipe", "Ressent une forte motivation et une responsabilité accrue grâce aux objectifs partagés"] },
    es: { title: "Colaborador social", subtitle: "El mejor jugador de equipo", description: "Rindes al máximo cuando trabajas con otras personas. Las sesiones de lluvia de ideas te dan energía y los objetivos compartidos te motivan.", traits: ["Obtiene sus mejores ideas y energía en sesiones colaborativas", "Prefiere la lluvia de ideas en grupo y la resolución de problemas en equipo", "Siente fuerte motivación y responsabilidad a través de objetivos compartidos"] },
  },
  flexible: {
    emoji: "🌊",
    color: "#06b6d4",
    ko: { title: "유연한 적응가", subtitle: "흐름의 마스터", description: "어떤 상황에서도 잘 적응하며 즉흥성을 즐깁니다. 자신의 에너지 레벨과 상황 변화에 맞춰 유연하게 일하는 것을 선호합니다.", traits: ["변하는 우선순위와 예상치 못한 업무에 매끄럽게 적응함", "경직된 일정보다 자연스러운 에너지 리듬에 맞춰 업무 수행", "모호한 상황에 유연하며 다양한 접근 방식을 시도하는 것을 즐김"] },
    en: { title: "Flexible Adapter", subtitle: "Master of Flow", description: "You adapt well to any situation and enjoy improvising. You prefer to work flexibly according to your energy levels and changing circumstances.", traits: ["Smoothly adapts to shifting priorities and unexpected tasks", "Works according to natural energy rhythms rather than rigid schedules", "Comfortable with ambiguity and enjoys trying different approaches"] },
    ja: { title: "フレキシブルアダプター", subtitle: "フローのマスター", description: "どんな状況にもうまく適応し即興を楽しみます。エネルギーレベルと変化する状況に合わせて柔軟に働くことを好みます。", traits: ["変化する優先事項と予期しないタスクにスムーズに適応する", "硬直したスケジュールよりも自然なエネルギーリズムに従って作業", "曖昧さに柔軟で様々なアプローチを試みることを楽しむ"] },
    zh: { title: "灵活适应者", subtitle: "节奏掌控者", description: "你能很好地适应各种情况，也享受即兴发挥。你更喜欢根据自己的精力水平和变化的环境灵活工作。", traits: ["能顺畅适应变化的优先事项和意外任务", "相比僵硬日程，更按自然精力节奏工作", "面对模糊情况也自在，并喜欢尝试不同方法"] },
    fr: { title: "Adaptateur flexible", subtitle: "Maître du flow", description: "Vous vous adaptez bien à toutes les situations et vous aimez improviser. Vous préférez travailler avec souplesse selon votre niveau d'énergie et l'évolution du contexte.", traits: ["S'adapte facilement aux priorités changeantes et aux tâches imprévues", "Travaille selon ses rythmes naturels d'énergie plutôt qu'avec un planning rigide", "À l'aise avec l'ambiguïté et curieux d'essayer différentes approches"] },
    es: { title: "Adaptador flexible", subtitle: "Maestro del flow", description: "Te adaptas bien a cualquier situación y disfrutas improvisar. Prefieres trabajar con flexibilidad según tus niveles de energía y las circunstancias cambiantes.", traits: ["Se adapta con fluidez a prioridades cambiantes y tareas inesperadas", "Trabaja según ritmos naturales de energía más que con horarios rígidos", "Se siente cómodo con la ambigüedad y disfruta probar distintos enfoques"] },
  },
};

const ui = {
  ko: { title: "생산성 유형 테스트", subtitle: "나는 어떻게 일할 때 최고인가?", progress: (c: number, t: number) => `${c} / ${t}`, resultTitle: "나의 생산성 스타일", traitsLabel: "나의 업무 특성", restart: "다시 하기", share: "결과 공유", copied: "복사됨!" },
  en: { title: "Productivity Style Test", subtitle: "When am I at my best?", progress: (c: number, t: number) => `${c} / ${t}`, resultTitle: "My Productivity Style", traitsLabel: "My Work Traits", restart: "Restart", share: "Share Result", copied: "Copied!" },
  ja: { title: "生産性スタイルテスト", subtitle: "どのように働くとき最高か？", progress: (c: number, t: number) => `${c} / ${t}`, resultTitle: "私の生産性スタイル", traitsLabel: "私の仕事の特性", restart: "もう一度", share: "結果をシェア", copied: "コピーされました！" },
  zh: { title: "生产力风格测试", subtitle: "我怎样工作时状态最好？", progress: (c: number, t: number) => `${c} / ${t}`, resultTitle: "我的生产力风格", traitsLabel: "我的工作特征", restart: "重新开始", share: "分享结果", copied: "已复制！" },
  fr: { title: "Test de style de productivité", subtitle: "Quand suis-je au meilleur de moi-même ?", progress: (c: number, t: number) => `${c} / ${t}`, resultTitle: "Mon style de productivité", traitsLabel: "Mes traits de travail", restart: "Recommencer", share: "Partager le résultat", copied: "Copié !" },
  es: { title: "Test de estilo de productividad", subtitle: "¿Cuándo estoy en mi mejor momento?", progress: (c: number, t: number) => `${c} / ${t}`, resultTitle: "Mi estilo de productividad", traitsLabel: "Mis rasgos de trabajo", restart: "Reiniciar", share: "Compartir resultado", copied: "¡Copiado!" },
};

export default function ProductivityStyleTest({ locale: localeProp }: Props) {
  const lp = (localeProp ?? "en").toLowerCase();
  const locale: SupportedLocale = (["ko", "en", "ja", "zh", "fr", "es"].includes(lp) ? lp : "en") as SupportedLocale;
  const tx = ui[locale];

  const [idx, setIdx] = useState(0);
  const [scores, setScores] = useState<Record<ProductivityType, number>>({ deepwork: 0, multitasker: 0, collaborator: 0, flexible: 0 });
  const [result, setResult] = useState<ProductivityType | null>(null);
  const [copied, setCopied] = useState(false);

  function pick(type: ProductivityType) {
    const next = { ...scores, [type]: scores[type] + 1 };
    const total = Object.values(next).reduce((a, b) => a + b, 0);
    if (total < questions.length) {
      setScores(next);
      setTimeout(() => setIdx(total), 280);
    } else {
      setScores(next);
      const winner = (Object.keys(next) as ProductivityType[]).reduce((a, b) => next[a] >= next[b] ? a : b);
      setResult(winner);
    }
  }

  function restart() {
    setIdx(0);
    setScores({ deepwork: 0, multitasker: 0, collaborator: 0, flexible: 0 });
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

    return (
      <div className="space-y-6">
        <div className="rounded-2xl p-6 text-center" style={{ background: `linear-gradient(135deg, ${r.color}18, ${r.color}08)`, border: `1px solid ${r.color}30` }}>
          <p className="text-sm font-medium text-gray-500 mb-1">{tx.resultTitle}</p>
          <div className="text-5xl mb-2">{r.emoji}</div>
          <h2 className="text-2xl font-bold text-gray-900">{rd.title}</h2>
          <p className="mt-1 text-sm font-medium" style={{ color: r.color }}>{rd.subtitle}</p>
          <p className="mt-3 text-sm text-gray-600">{rd.description}</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-semibold text-gray-700">{tx.traitsLabel}</h3>
          <div className="space-y-2">
            {rd.traits.map((trait, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="flex-shrink-0 font-bold" style={{ color: r.color }}>✦</span>
                <span>{trait}</span>
              </div>
            ))}
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
          <div className="h-full rounded-full bg-indigo-500 transition-all duration-300" style={{ width: `${(idx / questions.length) * 100}%` }} />
        </div>
        <span className="text-sm text-gray-500">{tx.progress(idx + 1, questions.length)}</span>
      </div>
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <p className="mb-5 text-center text-lg font-medium text-gray-800">{q[locale]}</p>
        <div className="space-y-3">
          {q.options.map((opt, i) => (
            <button key={i} onClick={() => pick(opt.type)} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-left text-sm text-gray-700 transition hover:border-indigo-300 hover:bg-indigo-50">
              {opt[locale]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
