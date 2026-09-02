import { useState, useEffect } from "react";
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import ShareResultButton from '../shared/ShareResultButton'
import { Questionnaire } from '@/components/ui/questionnaire'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type SupportedLocale = "ko" | "en" | "ja" | "zh" | "fr" | "es";

interface Props {
  locale?: string;
}

type WorkStyle = "planner" | "adapter" | "collaborator" | "independent" | "perfectionist";

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
    type: WorkStyle;
  }[];
}

const questions: Question[] = [
  {
    ko: "프로젝트를 시작할 때 당신은?",
    en: "When starting a project, you:",
    ja: "プロジェクトを始めるとき、あなたは？",
    zh: "开始一个项目时，你会：",
    fr: "Quand vous démarrez un projet, vous :",
    es: "Cuando empiezas un proyecto, tú:",
    options: [
      { ko: "먼저 전체 계획과 일정표를 작성한다", en: "First create a full plan and schedule", ja: "まず全体の計画とスケジュール表を作成する", zh: "先制定完整计划和时间表", fr: "Commencer par établir un plan complet et un calendrier", es: "Primero crear un plan completo y un calendario", type: "planner" },
      { ko: "일단 시작하고 상황에 따라 방향을 조정한다", en: "Start first and adjust direction as things unfold", ja: "とりあえず始めて、状況に応じて方向を調整する", zh: "先开始做，再根据情况调整方向", fr: "Commencer, puis ajuster la direction selon l'évolution", es: "Empezar y ajustar el rumbo según avance la situación", type: "adapter" },
      { ko: "팀원들과 역할과 방향에 대해 충분히 논의한다", en: "Discuss roles and direction thoroughly with team members", ja: "チームメンバーと役割と方向について十分に話し合う", zh: "和团队成员充分讨论角色与方向", fr: "Discuter en profondeur des rôles et de la direction avec l'équipe", es: "Hablar a fondo con el equipo sobre roles y dirección", type: "collaborator" },
      { ko: "혼자 아이디어를 구상하고 자신만의 방식으로 접근한다", en: "Brainstorm ideas alone and approach it in my own way", ja: "一人でアイデアを構想し、自分なりの方法でアプローチする", zh: "独自构思想法，并按自己的方式推进", fr: "Réfléchir seul aux idées et l'aborder à ma façon", es: "Pensar ideas a solas y abordarlo a mi manera", type: "independent" },
      { ko: "모든 세부 사항을 검토하고 최선의 시작점을 찾는다", en: "Review all details and find the best starting point", ja: "すべての詳細を検討し、最善のスタート地点を見つける", zh: "审查所有细节，找到最佳起点", fr: "Examiner tous les détails et trouver le meilleur point de départ", es: "Revisar todos los detalles y encontrar el mejor punto de partida", type: "perfectionist" },
    ],
  },
  {
    ko: "업무 중 예상치 못한 변경 사항이 생겼을 때 당신은?",
    en: "When unexpected changes arise during work, you:",
    ja: "業務中に予期しない変更が生じたとき、あなたは？",
    zh: "工作中出现意外变更时，你会：",
    fr: "Quand des changements imprévus surviennent au travail, vous :",
    es: "Cuando surgen cambios inesperados durante el trabajo, tú:",
    options: [
      { ko: "계획을 수정하고 새로운 일정을 만든다", en: "Revise the plan and create a new schedule", ja: "計画を修正して新しいスケジュールを作成する", zh: "修改计划并制定新的时间安排", fr: "Réviser le plan et créer un nouveau calendrier", es: "Revisar el plan y crear un nuevo calendario", type: "planner" },
      { ko: "빠르게 새로운 상황에 적응해 계속 진행한다", en: "Quickly adapt to the new situation and keep going", ja: "素早く新しい状況に適応して続ける", zh: "快速适应新情况并继续推进", fr: "M'adapter rapidement à la nouvelle situation et continuer", es: "Adaptarme rápido a la nueva situación y seguir adelante", type: "adapter" },
      { ko: "팀과 상황을 공유하고 함께 해결책을 찾는다", en: "Share the situation with the team and find solutions together", ja: "チームと状況を共有して一緒に解決策を探す", zh: "和团队分享情况，并一起寻找解决方案", fr: "Partager la situation avec l'équipe et chercher des solutions ensemble", es: "Compartir la situación con el equipo y buscar soluciones juntos", type: "collaborator" },
      { ko: "스스로 새로운 접근법을 생각해내 실행한다", en: "Think up a new approach myself and execute it", ja: "自分で新しいアプローチを考え出して実行する", zh: "自己想出新的做法并执行", fr: "Imaginer moi-même une nouvelle approche et la mettre en œuvre", es: "Idear por mi cuenta un nuevo enfoque y ejecutarlo", type: "independent" },
      { ko: "변경 사항이 품질에 미치는 영향을 꼼꼼히 검토한다", en: "Carefully examine the impact of changes on quality", ja: "変更が品質に与える影響を丁寧に検討する", zh: "仔细评估变更对质量的影响", fr: "Examiner attentivement l'impact des changements sur la qualité", es: "Examinar con cuidado el impacto de los cambios en la calidad", type: "perfectionist" },
    ],
  },
  {
    ko: "가장 생산적으로 일할 수 있는 환경은?",
    en: "The environment where you're most productive:",
    ja: "最も生産的に働ける環境は？",
    zh: "你最有生产力的工作环境是：",
    fr: "L'environnement où vous êtes le plus productif :",
    es: "El entorno en el que eres más productivo:",
    options: [
      { ko: "해야 할 일 목록과 마감일이 명확한 구조화된 환경", en: "Structured environment with clear to-do lists and deadlines", ja: "やることリストと締め切りが明確な構造化された環境", zh: "待办事项和截止日期清晰的结构化环境", fr: "Un cadre structuré avec des listes de tâches et des échéances claires", es: "Un entorno estructurado con listas de tareas y plazos claros", type: "planner" },
      { ko: "유연한 근무 방식과 다양한 업무가 혼재하는 환경", en: "Flexible work style with diverse tasks mixed together", ja: "柔軟な働き方と多様な業務が混在する環境", zh: "工作方式灵活、任务多样交织的环境", fr: "Un mode de travail flexible avec des tâches variées", es: "Un estilo de trabajo flexible con tareas variadas", type: "adapter" },
      { ko: "팀워크와 아이디어 공유가 활발한 환경", en: "Environment with active teamwork and idea sharing", ja: "チームワークとアイデア共有が活発な環境", zh: "团队合作和想法分享活跃的环境", fr: "Un environnement où le travail d'équipe et le partage d'idées sont actifs", es: "Un entorno con trabajo en equipo e intercambio activo de ideas", type: "collaborator" },
      { ko: "방해받지 않고 집중할 수 있는 조용한 환경", en: "Quiet environment where I can focus without interruption", ja: "邪魔されずに集中できる静かな環境", zh: "安静、不受打扰、能专注的环境", fr: "Un environnement calme où je peux me concentrer sans interruption", es: "Un entorno tranquilo donde puedo concentrarme sin interrupciones", type: "independent" },
      { ko: "완성도 높은 결과물을 낼 수 있는 충분한 시간과 자원", en: "Sufficient time and resources to produce high-quality output", ja: "高品質な成果物を出せる十分な時間とリソース", zh: "有充足时间和资源产出高质量成果的环境", fr: "Assez de temps et de ressources pour produire un travail de grande qualité", es: "Tiempo y recursos suficientes para producir resultados de alta calidad", type: "perfectionist" },
    ],
  },
  {
    ko: "피드백을 받았을 때 당신은?",
    en: "When receiving feedback, you:",
    ja: "フィードバックを受けたとき、あなたは？",
    zh: "收到反馈时，你会：",
    fr: "Quand vous recevez un retour, vous :",
    es: "Cuando recibes feedback, tú:",
    options: [
      { ko: "피드백을 정리하고 개선 계획에 반영한다", en: "Organize feedback and incorporate it into improvement plans", ja: "フィードバックを整理して改善計画に反映する", zh: "整理反馈，并纳入改进计划", fr: "Organiser le retour et l'intégrer dans un plan d'amélioration", es: "Organizar el feedback e incorporarlo al plan de mejora", type: "planner" },
      { ko: "좋은 부분은 취하고 맞지 않는 부분은 유연하게 조정한다", en: "Take the useful parts and flexibly adjust what doesn't fit", ja: "良い部分は取り入れ、合わない部分は柔軟に調整する", zh: "采纳有用部分，灵活调整不适合的部分", fr: "Garder ce qui est utile et ajuster avec souplesse ce qui ne convient pas", es: "Tomar lo útil y ajustar con flexibilidad lo que no encaja", type: "adapter" },
      { ko: "피드백을 준 사람과 더 깊이 논의해 이해를 높인다", en: "Discuss further with the feedback giver to deepen understanding", ja: "フィードバックをくれた人とより深く議論して理解を深める", zh: "和给出反馈的人进一步讨论，加深理解", fr: "Échanger davantage avec la personne qui a donné le retour pour mieux comprendre", es: "Conversar más con quien dio el feedback para entender mejor", type: "collaborator" },
      { ko: "나의 판단과 비교해 가장 타당한 방향을 결정한다", en: "Compare with my own judgment and decide the most valid direction", ja: "自分の判断と比較して最も妥当な方向を決める", zh: "与自己的判断对照，决定最合理的方向", fr: "Comparer avec mon propre jugement et choisir la direction la plus pertinente", es: "Compararlo con mi propio criterio y decidir el rumbo más válido", type: "independent" },
      { ko: "모든 피드백을 세심하게 검토하고 완벽하게 반영하려 한다", en: "Carefully review all feedback and try to incorporate it perfectly", ja: "すべてのフィードバックを慎重に検討し、完璧に反映しようとする", zh: "细致审查所有反馈，并努力完美落实", fr: "Examiner soigneusement tous les retours et essayer de les intégrer parfaitement", es: "Revisar todo el feedback con cuidado e intentar incorporarlo perfectamente", type: "perfectionist" },
    ],
  },
  {
    ko: "업무에서 가장 보람을 느끼는 순간은?",
    en: "The moment you feel most rewarded at work:",
    ja: "仕事で最もやりがいを感じる瞬間は？",
    zh: "工作中让你最有成就感的时刻是：",
    fr: "Le moment où vous vous sentez le plus valorisé au travail :",
    es: "El momento en el que te sientes más realizado en el trabajo:",
    options: [
      { ko: "세운 계획대로 프로젝트가 잘 완료됐을 때", en: "When a project is completed well according to plan", ja: "立てた計画通りにプロジェクトがうまく完了したとき", zh: "项目按计划顺利完成时", fr: "Quand un projet se termine bien selon le plan prévu", es: "Cuando un proyecto se completa bien según lo planeado", type: "planner" },
      { ko: "예상치 못한 상황에서 유연하게 해결했을 때", en: "When I flexibly solved an unexpected situation", ja: "予期しない状況で柔軟に解決したとき", zh: "灵活解决意外情况时", fr: "Quand je résous avec souplesse une situation imprévue", es: "Cuando resuelvo con flexibilidad una situación inesperada", type: "adapter" },
      { ko: "팀이 함께 어려운 목표를 달성했을 때", en: "When the team achieves a difficult goal together", ja: "チームが一緒に難しい目標を達成したとき", zh: "团队一起达成困难目标时", fr: "Quand l'équipe atteint ensemble un objectif difficile", es: "Cuando el equipo alcanza junto una meta difícil", type: "collaborator" },
      { ko: "내 아이디어로 독립적으로 문제를 해결했을 때", en: "When I independently solved a problem with my own idea", ja: "自分のアイデアで独立して問題を解決したとき", zh: "用自己的想法独立解决问题时", fr: "Quand je résous un problème de façon autonome grâce à mon idée", es: "Cuando resuelvo un problema de forma independiente con mi propia idea", type: "independent" },
      { ko: "최고 품질의 결과물을 완성했을 때", en: "When I've completed work of the highest quality", ja: "最高品質の成果物を完成させたとき", zh: "完成最高质量的成果时", fr: "Quand je termine un livrable de très grande qualité", es: "Cuando completo un resultado de la máxima calidad", type: "perfectionist" },
    ],
  },
  {
    ko: "마감이 촉박할 때 당신은?",
    en: "When a deadline is tight, you:",
    ja: "締め切りが差し迫ったとき、あなたは？",
    zh: "截止日期很紧时，你会：",
    fr: "Quand une échéance est serrée, vous :",
    es: "Cuando el plazo es ajustado, tú:",
    options: [
      { ko: "우선순위를 재조정하고 긴급 계획을 세운다", en: "Reprioritize and create an emergency plan", ja: "優先順位を再調整して緊急計画を立てる", zh: "重新调整优先级并制定应急计划", fr: "Réévaluer les priorités et établir un plan d'urgence", es: "Reordenar prioridades y crear un plan de emergencia", type: "planner" },
      { ko: "빠르게 핵심만 처리하고 나머지는 나중으로 미룬다", en: "Quickly handle the essentials and defer the rest", ja: "素早く核心だけ対処し、残りは後回しにする", zh: "快速处理核心部分，其余延后", fr: "Traiter vite l'essentiel et remettre le reste à plus tard", es: "Resolver rápido lo esencial y dejar el resto para después", type: "adapter" },
      { ko: "팀에 상황을 알리고 도움을 요청한다", en: "Inform the team of the situation and ask for help", ja: "チームに状況を知らせ、助けを求める", zh: "告知团队情况并请求帮助", fr: "Informer l'équipe de la situation et demander de l'aide", es: "Informar al equipo de la situación y pedir ayuda", type: "collaborator" },
      { ko: "집중 모드로 들어가 혼자 해결한다", en: "Enter concentration mode and solve it alone", ja: "集中モードに入り、一人で解決する", zh: "进入专注模式，独自解决", fr: "Passer en mode concentration et le résoudre seul", es: "Entrar en modo concentración y resolverlo a solas", type: "independent" },
      { ko: "품질을 타협하지 않으려다가 매우 힘들어진다", en: "Struggle intensely trying not to compromise quality", ja: "品質を妥協しないようにしていると非常に辛くなる", zh: "因不愿妥协质量而变得非常吃力", fr: "Me retrouver sous forte pression en essayant de ne pas sacrifier la qualité", es: "Pasarlo muy mal intentando no comprometer la calidad", type: "perfectionist" },
    ],
  },
];

const results: Record<WorkStyle, {
  emoji: string;
  color: string;
  ko: { title: string; description: string; ideal: string; challenge: string; tip: string };
  en: { title: string; description: string; ideal: string; challenge: string; tip: string };
  ja: { title: string; description: string; ideal: string; challenge: string; tip: string };
  zh: { title: string; description: string; ideal: string; challenge: string; tip: string };
  fr: { title: string; description: string; ideal: string; challenge: string; tip: string };
  es: { title: string; description: string; ideal: string; challenge: string; tip: string };
}> = {
  planner: {
    emoji: "📋",
    color: "#3b82f6",
    ko: { title: "체계적 계획가", description: "당신은 명확한 목표, 상세한 계획, 체계적인 실행을 선호합니다. 구조와 질서 속에서 최고의 성과를 냅니다.", ideal: "프로젝트 관리, 장기 전략 수립, 복잡한 다단계 업무", challenge: "예상치 못한 변화 시 유연성 부족, 과도한 계획으로 실행 지연 가능", tip: "'완벽한 계획'보다 '충분한 계획 후 실행'으로 접근하면 더 효율적입니다." },
    en: { title: "Systematic Planner", description: "You prefer clear goals, detailed plans, and systematic execution. You produce the best work within structure and order.", ideal: "Project management, long-term strategy, complex multi-step tasks", challenge: "Lack of flexibility with unexpected changes; excessive planning may delay execution", tip: "Approaching it as 'sufficient planning then execute' rather than 'perfect plan' is more efficient." },
    ja: { title: "体系的なプランナー", description: "明確な目標、詳細な計画、体系的な実行を好みます。構造と秩序の中で最高のパフォーマンスを発揮します。", ideal: "プロジェクト管理、長期戦略策定、複雑な多段階業務", challenge: "予期しない変化時の柔軟性不足、過度な計画が実行を遅らせる可能性", tip: "「完璧な計画」より「十分な計画後に実行」でアプローチすると効率的です。" },
    zh: { title: "系统型规划者", description: "你偏好清晰的目标、详细的计划和有条理的执行。在结构和秩序中，你能产出最佳成果。", ideal: "项目管理、长期战略规划、复杂的多步骤任务", challenge: "面对意外变化时可能缺乏灵活性；过度规划可能延迟执行", tip: "比起追求“完美计划”，以“充分计划后执行”的方式推进会更高效。" },
    fr: { title: "Planificateur systématique", description: "Vous préférez les objectifs clairs, les plans détaillés et une exécution structurée. Vous donnez le meilleur de vous-même dans un cadre ordonné.", ideal: "Gestion de projet, stratégie à long terme, tâches complexes en plusieurs étapes", challenge: "Manque de souplesse face aux imprévus ; une planification excessive peut retarder l'exécution", tip: "Penser en termes de « plan suffisant puis exécution » plutôt que de « plan parfait » sera plus efficace." },
    es: { title: "Planificador sistemático", description: "Prefieres objetivos claros, planes detallados y una ejecución sistemática. Produces tu mejor trabajo dentro de la estructura y el orden.", ideal: "Gestión de proyectos, estrategia a largo plazo, tareas complejas de varios pasos", challenge: "Falta de flexibilidad ante cambios inesperados; planificar en exceso puede retrasar la ejecución", tip: "Enfocarlo como “planificar lo suficiente y ejecutar” en vez de buscar el “plan perfecto” resulta más eficiente." },
  },
  adapter: {
    emoji: "🌊",
    color: "#10b981",
    ko: { title: "유연한 적응가", description: "당신은 변화를 두려워하지 않고 새로운 상황에 빠르게 적응합니다. 다양한 환경에서 유연하게 기여할 수 있습니다.", ideal: "스타트업, 변화가 많은 프로젝트, 다양한 역할", challenge: "구조 부족 시 산만해질 수 있음, 일관성 유지가 어려울 수 있음", tip: "최소한의 루틴과 체크포인트를 설정해두면 유연성과 일관성을 함께 가질 수 있습니다." },
    en: { title: "Flexible Adapter", description: "You don't fear change and quickly adapt to new situations. You can contribute flexibly in diverse environments.", ideal: "Startups, high-change projects, diverse roles", challenge: "Can become unfocused without structure; consistency may be difficult to maintain", tip: "Setting minimal routines and checkpoints lets you have both flexibility and consistency." },
    ja: { title: "柔軟な適応者", description: "変化を恐れず、新しい状況に素早く適応します。多様な環境で柔軟に貢献できます。", ideal: "スタートアップ、変化の多いプロジェクト、多様な役割", challenge: "構造がないと散漫になる可能性、一貫性の維持が難しいことも", tip: "最小限のルーティンとチェックポイントを設定することで、柔軟性と一貫性を両立できます。" },
    zh: { title: "灵活适应者", description: "你不害怕变化，能快速适应新情况。你可以在多样化的环境中灵活贡献。", ideal: "创业公司、变化频繁的项目、多元角色", challenge: "缺少结构时可能变得分散；保持一致性可能较难", tip: "设定最低限度的例行流程和检查点，可以同时保有灵活性与一致性。" },
    fr: { title: "Adaptateur flexible", description: "Vous ne craignez pas le changement et vous vous adaptez vite aux nouvelles situations. Vous pouvez contribuer avec souplesse dans des environnements variés.", ideal: "Startups, projets très changeants, rôles polyvalents", challenge: "Peut perdre le fil sans structure ; la constance peut être difficile à maintenir", tip: "Mettre en place quelques routines et points de contrôle vous permet de garder à la fois souplesse et régularité." },
    es: { title: "Adaptador flexible", description: "No temes al cambio y te adaptas rápido a nuevas situaciones. Puedes aportar con flexibilidad en entornos diversos.", ideal: "Startups, proyectos con mucho cambio, roles variados", challenge: "Puede dispersarse sin estructura; mantener la constancia puede ser difícil", tip: "Definir rutinas mínimas y puntos de control te permite combinar flexibilidad y consistencia." },
  },
  collaborator: {
    emoji: "🤝",
    color: "#435D31",
    ko: { title: "협력 중심형", description: "당신은 팀워크에서 에너지를 얻고, 함께 만드는 것의 가치를 압니다. 관계 구축과 공동 문제 해결에 탁월합니다.", ideal: "팀 프로젝트, 크로스 펑셔널 협업, 고객 관계 업무", challenge: "혼자 해야 하는 업무에 어려움, 의견 충돌 시 결정이 늦어질 수 있음", tip: "혼자 하는 시간에도 가치 있는 것들을 찾아보세요. 독립적 작업 능력은 협력을 더 강하게 만듭니다." },
    en: { title: "Collaboration-Centered", description: "You gain energy from teamwork and understand the value of creating things together. You excel at relationship building and collaborative problem-solving.", ideal: "Team projects, cross-functional collaboration, customer relationship work", challenge: "Difficulty with solo tasks; decisions may slow down during disagreements", tip: "Find value in solo work too. Independent work capacity makes collaboration even stronger." },
    ja: { title: "協力中心型", description: "チームワークからエネルギーを得て、一緒に作ることの価値を理解しています。関係構築と共同問題解決に優れています。", ideal: "チームプロジェクト、クロスファンクショナルな協力、顧客関係業務", challenge: "一人でやる業務に困難、意見の対立時に決定が遅れることがある", tip: "一人でする時間にも価値あるものを見つけましょう。独立した作業能力は協力をより強くします。" },
    zh: { title: "协作中心型", description: "你从团队合作中获得能量，也理解共同创造的价值。你擅长建立关系和协作解决问题。", ideal: "团队项目、跨职能协作、客户关系类工作", challenge: "独自完成任务时可能吃力；意见冲突时决策可能变慢", tip: "也试着在独立工作时间中找到价值。独立作业能力会让协作更有力量。" },
    fr: { title: "Centré sur la collaboration", description: "Vous tirez de l'énergie du travail d'équipe et vous comprenez la valeur de créer ensemble. Vous excellez dans la construction de relations et la résolution collaborative des problèmes.", ideal: "Projets d'équipe, collaboration transverse, relation client", challenge: "Difficulté avec les tâches en solo ; les décisions peuvent ralentir en cas de désaccord", tip: "Cherchez aussi ce qui a de la valeur dans le travail seul. L'autonomie rend la collaboration encore plus forte." },
    es: { title: "Centrado en la colaboración", description: "Obtienes energía del trabajo en equipo y entiendes el valor de crear junto a otros. Destacas construyendo relaciones y resolviendo problemas de forma colaborativa.", ideal: "Proyectos de equipo, colaboración interfuncional, trabajo de relación con clientes", challenge: "Dificultad con tareas en solitario; las decisiones pueden ralentizarse ante desacuerdos", tip: "Encuentra también valor en el trabajo individual. La capacidad de trabajar de forma independiente fortalece aún más la colaboración." },
  },
  independent: {
    emoji: "🦅",
    color: "#f59e0b",
    ko: { title: "독립적 자율형", description: "당신은 자신만의 방식으로 문제를 해결하는 것을 선호합니다. 자율성 있는 환경에서 창의적인 해결책을 만들어냅니다.", ideal: "연구, 창작 업무, 전문 컨설팅, 프리랜서", challenge: "팀 협력이 필요한 상황에서 어려움, 피드백 수용이 도전적일 수 있음", tip: "독립성을 유지하면서도 적절한 시점에 타인의 관점을 적극적으로 구하는 습관이 결과를 높입니다." },
    en: { title: "Independent Self-Directed", description: "You prefer solving problems in your own way. You create creative solutions in environments with autonomy.", ideal: "Research, creative work, specialist consulting, freelancing", challenge: "Difficulty when team collaboration is needed; accepting feedback can be challenging", tip: "While maintaining independence, habitually seeking others' perspectives at key moments elevates results." },
    ja: { title: "独立した自律型", description: "自分なりの方法で問題を解決することを好みます。自律性のある環境で創造的な解決策を生み出します。", ideal: "研究、創作業務、専門コンサルティング、フリーランス", challenge: "チームの協力が必要な状況での困難、フィードバックの受け入れが挑戦的なことも", tip: "独立性を保ちながら、適切なタイミングで他者の視点を積極的に求める習慣が結果を高めます。" },
    zh: { title: "独立自主型", description: "你偏好用自己的方式解决问题。在有自主权的环境中，你能创造出富有创意的解决方案。", ideal: "研究、创作工作、专业咨询、自由职业", challenge: "在需要团队协作的情况下可能遇到困难；接受反馈可能具有挑战性", tip: "在保持独立性的同时，养成在关键时刻主动寻求他人视角的习惯，会提升最终结果。" },
    fr: { title: "Indépendant et autonome", description: "Vous préférez résoudre les problèmes à votre manière. Dans un environnement qui vous laisse de l'autonomie, vous créez des solutions originales.", ideal: "Recherche, travail créatif, conseil spécialisé, freelance", challenge: "Difficulté lorsque la collaboration d'équipe est nécessaire ; recevoir du feedback peut être exigeant", tip: "Tout en gardant votre indépendance, demander activement d'autres points de vue aux moments clés améliore les résultats." },
    es: { title: "Independiente y autodirigido", description: "Prefieres resolver problemas a tu manera. En entornos con autonomía, generas soluciones creativas.", ideal: "Investigación, trabajo creativo, consultoría especializada, freelance", challenge: "Dificultad cuando se necesita colaboración de equipo; aceptar feedback puede ser desafiante", tip: "Mantener tu independencia y, a la vez, buscar otras perspectivas en momentos clave eleva la calidad de los resultados." },
  },
  perfectionist: {
    emoji: "💎",
    color: "#ef4444",
    ko: { title: "완벽 추구형", description: "당신은 높은 기준과 품질을 추구합니다. 세부 사항에 주의를 기울이고 오류를 최소화하는 데 탁월합니다.", ideal: "품질 관리, 정밀 작업, 법률·의료·회계 등 오류가 치명적인 분야", challenge: "완벽주의로 인한 지연, 번아웃 위험, 완료보다 완벽을 추구", tip: "\"완료가 완벽보다 낫다(Done is better than perfect)\" — 이 원칙을 의식적으로 연습해보세요. 80%에서 출시하고 개선하는 것이 더 효율적입니다." },
    en: { title: "Quality Perfectionist", description: "You pursue high standards and quality. You excel at paying attention to details and minimizing errors.", ideal: "Quality control, precision work, fields where errors are critical (law, medicine, accounting)", challenge: "Delays from perfectionism, burnout risk, pursuing perfection over completion", tip: "'Done is better than perfect' — consciously practice this principle. Launching at 80% and improving is more efficient." },
    ja: { title: "完璧追求型", description: "高い基準と品質を追求します。細部に注意を払い、エラーを最小化することに優れています。", ideal: "品質管理、精密作業、法律・医療・会計などエラーが致命的な分野", challenge: "完璧主義による遅延、バーンアウトリスク、完了より完璧を追求", tip: "「完了は完璧より優れている（Done is better than perfect）」— この原則を意識的に練習しましょう。80%で出して改善する方が効率的です。" },
    zh: { title: "质量完美主义者", description: "你追求高标准和高质量。你擅长关注细节，并尽量减少错误。", ideal: "质量管理、精密工作、法律/医疗/会计等错误代价高的领域", challenge: "完美主义导致延迟、存在倦怠风险、比起完成更追求完美", tip: "“完成比完美更重要（Done is better than perfect）”——有意识地练习这个原则。先以80%的完成度发布再改进，往往更高效。" },
    fr: { title: "Perfectionniste de la qualité", description: "Vous recherchez des standards élevés et un haut niveau de qualité. Vous excellez dans l'attention aux détails et la réduction des erreurs.", ideal: "Contrôle qualité, travail de précision, domaines où les erreurs sont critiques (droit, médecine, comptabilité)", challenge: "Retards liés au perfectionnisme, risque d'épuisement, recherche de la perfection au détriment de l'achèvement", tip: "« Mieux vaut terminé que parfait » — entraînez-vous consciemment à appliquer ce principe. Livrer à 80 % puis améliorer est souvent plus efficace." },
    es: { title: "Perfeccionista de la calidad", description: "Buscas estándares altos y calidad. Destacas prestando atención a los detalles y minimizando errores.", ideal: "Control de calidad, trabajo de precisión, campos donde los errores son críticos (derecho, medicina, contabilidad)", challenge: "Retrasos por perfeccionismo, riesgo de agotamiento, buscar la perfección por encima de terminar", tip: "“Hecho es mejor que perfecto” — practica este principio de forma consciente. Lanzar al 80% y mejorar después suele ser más eficiente." },
  },
};

const t = {
  ko: {
    title: "업무 스타일 테스트",
    subtitle: "나는 어떻게 일하는가?",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "나의 업무 스타일",
    ideal: "적합한 업무 환경",
    challenge: "도전 영역",
    tip: "성장 팁",
    scoreLabel: "스타일별 점수",
    restart: "다시 하기",
    share: "결과 공유",
    copied: "복사됨!",
  },
  en: {
    title: "Work Style Test",
    subtitle: "How Do You Work?",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "Your Work Style",
    ideal: "Ideal Work Environment",
    challenge: "Challenge Areas",
    tip: "Growth Tip",
    scoreLabel: "Score by Style",
    restart: "Restart",
    share: "Share Result",
    copied: "Copied!",
  },
  ja: {
    title: "仕事スタイルテスト",
    subtitle: "あなたはどのように仕事をしますか？",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "あなたの仕事スタイル",
    ideal: "理想的な仕事環境",
    challenge: "挑戦領域",
    tip: "成長のヒント",
    scoreLabel: "スタイル別スコア",
    restart: "もう一度",
    share: "結果をシェア",
    copied: "コピーされました！",
  },
  zh: {
    title: "工作风格测试",
    subtitle: "你是如何工作的？",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "你的工作风格",
    ideal: "理想工作环境",
    challenge: "挑战领域",
    tip: "成长建议",
    scoreLabel: "各风格得分",
    restart: "重新开始",
    share: "分享结果",
    copied: "已复制！",
  },
  fr: {
    title: "Test de style de travail",
    subtitle: "Comment travaillez-vous ?",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "Votre style de travail",
    ideal: "Environnement de travail idéal",
    challenge: "Points de défi",
    tip: "Conseil de progression",
    scoreLabel: "Score par style",
    restart: "Recommencer",
    share: "Partager le résultat",
    copied: "Copié !",
  },
  es: {
    title: "Test de estilo de trabajo",
    subtitle: "¿Cómo trabajas?",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "Tu estilo de trabajo",
    ideal: "Entorno de trabajo ideal",
    challenge: "Áreas de desafío",
    tip: "Consejo de crecimiento",
    scoreLabel: "Puntuación por estilo",
    restart: "Reiniciar",
    share: "Compartir resultado",
    copied: "¡Copiado!",
  },
};

export default function WorkStyleTest({ locale: localeProp }: Props) {

  const lp = (localeProp ?? "en").toLowerCase();
  const locale: SupportedLocale = (["ko", "en", "ja", "zh", "fr", "es"].includes(lp) ? lp : "en") as SupportedLocale;
  const tx = t[locale];

  const [idx, setIdx] = useState(0);
  const [scores, setScores] = useState<Record<WorkStyle, number>>({ planner: 0, adapter: 0, collaborator: 0, independent: 0, perfectionist: 0 });
  const [result, setResult] = useState<WorkStyle | null>(null);
  useRecordFinishedTest({ testId: "work-style", title: "WorkStyleTest", finished: Boolean(result) });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const ws = p.get("ws") as WorkStyle | null;
    if (ws && results[ws]) setResult(ws);
  }, []);

  function pick(type: WorkStyle) {
    const next = { ...scores, [type]: scores[type] + 1 };
    const answeredCount = Object.values(next).reduce((a, b) => a + b, 0);
    if (answeredCount < questions.length) {
      setScores(next);
      setTimeout(() => setIdx(answeredCount), 280);
    } else {
      setScores(next);
      const winner = (Object.keys(next) as WorkStyle[]).reduce((a, b) => next[a] >= next[b] ? a : b);
      setResult(winner);
      const url = new URL(window.location.href);
      url.searchParams.set("ws", winner);
      window.history.replaceState({}, "", url.toString());
    }
  }

  function restart() {
    setIdx(0);
    setScores({ planner: 0, adapter: 0, collaborator: 0, independent: 0, perfectionist: 0 });
    setResult(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("ws");
    window.history.replaceState({}, "", url.toString());
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) { await navigator.share({ title: tx.title, url }); }
    else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }

  const typeLabels: Record<WorkStyle, string> = {
    planner: locale === "ko" ? "계획가" : locale === "ja" ? "プランナー" : locale === "zh" ? "规划者" : locale === "fr" ? "Planificateur" : locale === "es" ? "Planificador" : "Planner",
    adapter: locale === "ko" ? "적응가" : locale === "ja" ? "適応者" : locale === "zh" ? "适应者" : locale === "fr" ? "Adaptateur" : locale === "es" ? "Adaptador" : "Adapter",
    collaborator: locale === "ko" ? "협력자" : locale === "ja" ? "協力者" : locale === "zh" ? "协作者" : locale === "fr" ? "Collaborateur" : locale === "es" ? "Colaborador" : "Collaborator",
    independent: locale === "ko" ? "독립형" : locale === "ja" ? "独立型" : locale === "zh" ? "独立型" : locale === "fr" ? "Indépendant" : locale === "es" ? "Independiente" : "Independent",
    perfectionist: locale === "ko" ? "완벽형" : locale === "ja" ? "完璧型" : locale === "zh" ? "完美型" : locale === "fr" ? "Perfectionniste" : locale === "es" ? "Perfeccionista" : "Perfectionist",
  };

  if (result) {
    const r = results[result];
    const rd = r[locale];
    const radarData = (Object.keys(scores) as WorkStyle[]).map((k) => ({
      subject: typeLabels[k],
      score: scores[k],
      fullMark: questions.length,
    }));

    return (
      <div className="space-y-6">
        <div className="rounded-2xl p-6 text-center" style={{ background: `${r.color}12`, border: `1px solid ${r.color}40` }}>
          <p className="mb-1 text-sm font-medium text-gray-500">{tx.resultTitle}</p>
          <div className="mb-2 text-5xl">{r.emoji}</div>
          <h2 className="text-2xl font-bold text-gray-900">{rd.title}</h2>
          <p className="mt-3 text-gray-600">{rd.description}</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-card p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-semibold text-green-700">🎯 {tx.ideal}</h3>
            <p className="mt-1 text-sm text-gray-600">{rd.ideal}</p>
          </div>
          <div>
            <h3 className="font-semibold text-orange-600">⚡ {tx.challenge}</h3>
            <p className="mt-1 text-sm text-gray-600">{rd.challenge}</p>
          </div>
          <div className="rounded-lg p-4" style={{ background: `${r.color}10` }}>
            <h3 className="font-semibold" style={{ color: r.color }}>💡 {tx.tip}</h3>
            <p className="mt-1 text-sm text-gray-700">{rd.tip}</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-card p-5 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-700">{tx.scoreLabel}</h3>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
              <Radar dataKey="score" stroke={r.color} fill={r.color} fillOpacity={0.3} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
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
    <Questionnaire
      title={tx.title}
      subtitle={tx.subtitle}
      question={q[locale]}
      questionLabel={tx.progress(idx + 1, questions.length)}
      progress={Math.round((idx / questions.length) * 100)}
      options={q.options.map((opt) => ({ label: opt[locale], value: opt.type }))}
      onSelect={pick}
    />
  );
}
