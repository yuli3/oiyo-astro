'use client';
import ShareResultButton from '../shared/ShareResultButton'

import { useState } from "react";
import { Questionnaire } from "@/components/ui/questionnaire";

type SupportedLocale = "ko" | "en" | "ja" | "zh" | "fr" | "es";

interface Props {
  locale?: string;
}

type BlockerCategory = "notification" | "conversation" | "taskSwitching" | "environment";

interface QuestionOption {
  ko: string;
  en: string;
  ja: string;
  zh: string;
  fr: string;
  es: string;
  score: number;
}

interface Question {
  id: string;
  category: BlockerCategory;
  ko: string;
  en: string;
  ja: string;
  zh: string;
  fr: string;
  es: string;
  options: QuestionOption[];
}

const questions: Question[] = [
  {
    id: "q1", category: "notification",
    ko: "업무 중 알림(메시지, 이메일 등)이 울릴 때 나는?",
    en: "When a notification (message, email, etc.) goes off during work, I:",
    ja: "作業中に通知（メッセージ、メールなど）が鳴ったとき、私は？",
    zh: "工作时收到通知（消息、邮件等）时，我会：",
    fr: "Quand une notification (message, e-mail, etc.) arrive pendant que je travaille, je :",
    es: "Cuando aparece una notificación (mensaje, correo, etc.) mientras trabajo, yo:",
    options: [
      { ko: "즉시 확인하고 답장한다", en: "Check and reply immediately", ja: "すぐに確認して返信する", zh: "立刻查看并回复", fr: "Je vérifie et réponds tout de suite", es: "Lo reviso y respondo de inmediato", score: 9 },
      { ko: "잠깐 확인만 하고 나중에 답장한다", en: "Just check and reply later", ja: "少し確認して後で返信する", zh: "只看一眼，稍后再回复", fr: "Je regarde rapidement et réponds plus tard", es: "Solo lo reviso y respondo más tarde", score: 6 },
      { ko: "집중 중이면 무시하고 나중에 본다", en: "Ignore if focused and check later", ja: "集中中なら無視して後で確認する", zh: "如果正在专注，就先忽略，之后再看", fr: "Si je suis concentré, je l'ignore et regarde plus tard", es: "Si estoy concentrado, lo ignoro y lo reviso después", score: 3 },
      { ko: "방해금지 모드로 아예 안 본다", en: "Use do-not-disturb mode and don't look at all", ja: "おやすみモードで全く見ない", zh: "开启勿扰模式，完全不看", fr: "J'active le mode Ne pas déranger et ne regarde pas du tout", es: "Uso el modo no molestar y no lo miro", score: 1 },
    ],
  },
  {
    id: "q2", category: "notification",
    ko: "하루에 스마트폰을 몇 번이나 확인하나요?",
    en: "How many times a day do you check your smartphone?",
    ja: "1日に何回スマートフォンを確認しますか？",
    zh: "你一天会查看手机多少次？",
    fr: "Combien de fois par jour consultez-vous votre smartphone ?",
    es: "¿Cuántas veces al día revisas tu smartphone?",
    options: [
      { ko: "수시로 확인 (50회 이상)", en: "Constantly (50+ times)", ja: "常に確認（50回以上）", zh: "不停查看（50次以上）", fr: "En permanence (plus de 50 fois)", es: "Constantemente (más de 50 veces)", score: 10 },
      { ko: "자주 확인 (30-50회)", en: "Often (30-50 times)", ja: "頻繁に（30〜50回）", zh: "经常查看（30-50次）", fr: "Souvent (30 à 50 fois)", es: "A menudo (30-50 veces)", score: 7 },
      { ko: "가끔 확인 (10-30회)", en: "Sometimes (10-30 times)", ja: "時々（10〜30回）", zh: "偶尔查看（10-30次）", fr: "Parfois (10 à 30 fois)", es: "A veces (10-30 veces)", score: 4 },
      { ko: "필요할 때만 (10회 미만)", en: "Only when needed (under 10 times)", ja: "必要なときだけ（10回未満）", zh: "只在需要时查看（少于10次）", fr: "Seulement si nécessaire (moins de 10 fois)", es: "Solo cuando hace falta (menos de 10 veces)", score: 1 },
    ],
  },
  {
    id: "q3", category: "conversation",
    ko: "동료가 갑자기 말을 걸어올 때 나는?",
    en: "When a colleague suddenly starts talking to me, I:",
    ja: "同僚が突然話しかけてきたとき、私は？",
    zh: "同事突然来找我说话时，我会：",
    fr: "Quand un collègue me parle soudainement, je :",
    es: "Cuando un compañero empieza a hablarme de repente, yo:",
    options: [
      { ko: "하던 일을 멈추고 바로 대화한다", en: "Stop what I'm doing and talk right away", ja: "作業を止めてすぐに話す", zh: "停下手头工作，马上交谈", fr: "J'arrête ce que je fais et je parle tout de suite", es: "Dejo lo que estoy haciendo y hablo de inmediato", score: 8 },
      { ko: "잠깐만 하고 대화에 응한다", en: "Ask for a moment then talk", ja: "少し待ってもらってから話す", zh: "请对方稍等一下，然后交谈", fr: "Je demande un instant, puis je réponds", es: "Pido un momento y luego hablo", score: 6 },
      { ko: "지금 바쁘다고 나중에 얘기하자고 한다", en: "Say I'm busy and talk later", ja: "今忙しいと言って後で話す", zh: "说明现在很忙，约之后再聊", fr: "Je dis que je suis occupé et propose d'en parler plus tard", es: "Digo que estoy ocupado y propongo hablar después", score: 3 },
      { ko: "헤드폰으로 말 걸기 어렵게 한다", en: "Wear headphones to make it hard to approach", ja: "ヘッドフォンで話しかけにくくする", zh: "戴上耳机，让别人不太容易打扰", fr: "Je mets un casque pour être moins abordable", es: "Uso auriculares para que sea más difícil interrumpirme", score: 1 },
    ],
  },
  {
    id: "q4", category: "conversation",
    ko: "오픈 오피스에서 주변 대화 소리가 들릴 때?",
    en: "When you hear surrounding conversations in an open office:",
    ja: "オープンオフィスで周りの会話が聞こえるとき？",
    zh: "在开放式办公室听到周围谈话声时：",
    fr: "Quand vous entendez les conversations autour de vous dans un open space :",
    es: "Cuando escuchas conversaciones alrededor en una oficina abierta:",
    options: [
      { ko: "신경 쓰여서 집중이 안 된다", en: "I get distracted and can't concentrate", ja: "気になって集中できない", zh: "会被打扰，无法集中", fr: "Cela me distrait et je n'arrive pas à me concentrer", es: "Me distraigo y no puedo concentrarme", score: 9 },
      { ko: "가끔 방해되지만 어느 정도 적응했다", en: "Sometimes distracting but I've somewhat adapted", ja: "時々邪魔されるがある程度慣れた", zh: "有时会受影响，但已经有些适应", fr: "C'est parfois gênant, mais je me suis assez adapté", es: "A veces distrae, pero me he adaptado en parte", score: 5 },
      { ko: "음악으로 차단한다", en: "Block it with music", ja: "音楽でブロックする", zh: "用音乐隔绝声音", fr: "Je couvre le bruit avec de la musique", es: "Lo bloqueo con música", score: 3 },
      { ko: "전혀 신경 안 쓰인다", en: "Not bothered at all", ja: "全く気にならない", zh: "完全不在意", fr: "Cela ne me dérange pas du tout", es: "No me molesta en absoluto", score: 1 },
    ],
  },
  {
    id: "q5", category: "taskSwitching",
    ko: "하나의 업무를 하다가 다른 요청이 들어오면?",
    en: "When another request comes in while you're working on a task:",
    ja: "一つの作業中に別の依頼が来たとき？",
    zh: "正在处理一项工作时，又来了新的请求：",
    fr: "Quand une autre demande arrive pendant que vous travaillez sur une tâche :",
    es: "Cuando llega otra solicitud mientras estás trabajando en una tarea:",
    options: [
      { ko: "바로 새 업무로 전환한다", en: "Switch to the new task immediately", ja: "すぐに新しい作業に切り替える", zh: "立刻切换到新任务", fr: "Je passe immédiatement à la nouvelle tâche", es: "Cambio de inmediato a la nueva tarea", score: 10 },
      { ko: "현재 작업을 대충 마무리하고 전환한다", en: "Roughly finish current task and switch", ja: "現在の作業を大まかに終わらせて切り替える", zh: "把当前工作大致收尾后切换", fr: "Je termine rapidement la tâche en cours, puis je change", es: "Cierro la tarea actual por encima y cambio", score: 7 },
      { ko: "현재 작업의 단락을 끝내고 전환한다", en: "Finish current section and switch", ja: "現在の作業の段落を終えてから切り替える", zh: "完成当前小段后再切换", fr: "Je finis la section en cours avant de changer", es: "Termino la sección actual y luego cambio", score: 4 },
      { ko: "현재 작업을 완전히 끝낸 후 시작한다", en: "Start only after completely finishing the current task", ja: "現在の作業を完全に終えてから始める", zh: "完全完成当前工作后再开始", fr: "Je commence seulement après avoir terminé complètement la tâche en cours", es: "Empiezo solo después de terminar por completo la tarea actual", score: 2 },
    ],
  },
  {
    id: "q6", category: "taskSwitching",
    ko: "하루에 얼마나 많은 업무를 동시에 진행하나요?",
    en: "How many tasks do you run simultaneously in a day?",
    ja: "1日に何個の作業を同時に進めますか？",
    zh: "你一天会同时推进多少项任务？",
    fr: "Combien de tâches menez-vous en parallèle dans une journée ?",
    es: "¿Cuántas tareas llevas en paralelo durante un día?",
    options: [
      { ko: "5개 이상 동시 진행", en: "5 or more simultaneously", ja: "5つ以上同時進行", zh: "同时推进5项以上", fr: "5 ou plus en même temps", es: "5 o más a la vez", score: 10 },
      { ko: "3-4개 동시 진행", en: "3-4 simultaneously", ja: "3〜4個同時進行", zh: "同时推进3-4项", fr: "3 à 4 en même temps", es: "3-4 a la vez", score: 7 },
      { ko: "1-2개 집중", en: "Focus on 1-2", ja: "1〜2個に集中", zh: "专注于1-2项", fr: "Je me concentre sur 1 ou 2", es: "Me concentro en 1-2", score: 3 },
      { ko: "한 번에 하나만", en: "Only one at a time", ja: "一度に一つだけ", zh: "一次只做一项", fr: "Une seule à la fois", es: "Solo una a la vez", score: 1 },
    ],
  },
  {
    id: "q7", category: "environment",
    ko: "책상 주변이 어떤 상태인가요?",
    en: "What is the state of your desk area?",
    ja: "デスク周りはどんな状態ですか？",
    zh: "你的桌面周围是什么状态？",
    fr: "Dans quel état est votre espace de bureau ?",
    es: "¿En qué estado está tu zona de escritorio?",
    options: [
      { ko: "서류, 물건이 어질러져 있다", en: "Papers and items are scattered", ja: "書類や物が散乱している", zh: "文件和物品散乱摆放", fr: "Des papiers et objets sont éparpillés", es: "Hay papeles y objetos dispersos", score: 7 },
      { ko: "필요한 건 있지만 조금 지저분하다", en: "Needed items are there but slightly messy", ja: "必要なものはあるが少し散らかっている", zh: "需要的东西都在，但有点杂乱", fr: "J'ai ce qu'il faut, mais c'est un peu désordonné", es: "Tengo lo necesario, pero está algo desordenado", score: 5 },
      { ko: "정리되어 있고 필요한 것만 있다", en: "Organized with only what's needed", ja: "整理されて必要なものだけある", zh: "整理得当，只保留需要的东西", fr: "C'est rangé, avec seulement le nécessaire", es: "Está ordenado y solo tiene lo necesario", score: 2 },
      { ko: "미니멀하게 아무것도 없다", en: "Minimal — almost nothing", ja: "ミニマルで何もない", zh: "极简，几乎没有东西", fr: "Minimaliste, presque vide", es: "Minimalista, casi sin nada", score: 1 },
    ],
  },
  {
    id: "q8", category: "environment",
    ko: "회의나 미팅이 하루에 얼마나 자주 있나요?",
    en: "How often do you have meetings in a day?",
    ja: "1日に会議やミーティングはどのくらいありますか？",
    zh: "你一天中会议或沟通会有多频繁？",
    fr: "À quelle fréquence avez-vous des réunions dans une journée ?",
    es: "¿Con qué frecuencia tienes reuniones durante el día?",
    options: [
      { ko: "5개 이상 (거의 종일 회의)", en: "5 or more (almost all day)", ja: "5個以上（ほぼ終日会議）", zh: "5场以上（几乎整天开会）", fr: "5 ou plus (presque toute la journée)", es: "5 o más (casi todo el día)", score: 10 },
      { ko: "3-4개 (하루의 절반)", en: "3-4 (half the day)", ja: "3〜4個（半日）", zh: "3-4场（占半天）", fr: "3 à 4 (la moitié de la journée)", es: "3-4 (medio día)", score: 7 },
      { ko: "1-2개 (적당함)", en: "1-2 (appropriate)", ja: "1〜2個（適度）", zh: "1-2场（适中）", fr: "1 à 2 (raisonnable)", es: "1-2 (razonable)", score: 3 },
      { ko: "없거나 가끔 (집중 가능)", en: "None or rarely (can focus)", ja: "なしまたはたまに（集中できる）", zh: "没有或偶尔有（可以专注）", fr: "Aucune ou rarement (je peux me concentrer)", es: "Ninguna o rara vez (puedo concentrarme)", score: 1 },
    ],
  },
  {
    id: "q9", category: "notification",
    ko: "긴급하지 않은 메일이나 메시지가 왔을 때?",
    en: "When a non-urgent email or message arrives:",
    ja: "緊急でないメールやメッセージが来たとき？",
    zh: "收到不紧急的邮件或消息时：",
    fr: "Quand un e-mail ou un message non urgent arrive :",
    es: "Cuando llega un correo o mensaje no urgente:",
    options: [
      { ko: "바로 확인하고 처리한다", en: "Check and handle it right away", ja: "すぐに確認して処理する", zh: "马上查看并处理", fr: "Je le consulte et le traite tout de suite", es: "Lo reviso y lo resuelvo de inmediato", score: 8 },
      { ko: "확인만 하고 메모해둔다", en: "Just check and make a note", ja: "確認だけしてメモしておく", zh: "只查看，并记下来", fr: "Je regarde seulement et je prends une note", es: "Solo lo reviso y tomo nota", score: 5 },
      { ko: "정해진 시간에 일괄 처리한다", en: "Handle in batches at set times", ja: "決まった時間にまとめて処理する", zh: "在固定时间集中处理", fr: "Je le traite par lots à des horaires définis", es: "Lo gestiono por bloques en horarios definidos", score: 2 },
      { ko: "하루 종료 전에 확인한다", en: "Check before the end of the day", ja: "一日の終わりに確認する", zh: "在一天结束前查看", fr: "Je vérifie avant la fin de la journée", es: "Lo reviso antes de terminar el día", score: 1 },
    ],
  },
  {
    id: "q10", category: "taskSwitching",
    ko: "깊은 집중이 필요한 업무를 얼마나 자주 하나요?",
    en: "How often do you do work that requires deep focus?",
    ja: "深い集中が必要な作業をどのくらいの頻度でしますか？",
    zh: "你多常做需要深度专注的工作？",
    fr: "À quelle fréquence faites-vous un travail qui demande une concentration profonde ?",
    es: "¿Con qué frecuencia haces trabajo que requiere concentración profunda?",
    options: [
      { ko: "거의 없다 — 항상 분산되어 있다", en: "Rarely — always fragmented", ja: "ほとんどない — 常に分散している", zh: "几乎没有 — 总是被切碎", fr: "Rarement — mon temps est toujours fragmenté", es: "Rara vez — siempre estoy fragmentado", score: 9 },
      { ko: "가끔 — 집중할 시간이 부족하다", en: "Sometimes — not enough time to focus", ja: "時々 — 集中する時間が不足している", zh: "偶尔 — 专注时间不够", fr: "Parfois — je manque de temps pour me concentrer", es: "A veces — me falta tiempo para concentrarme", score: 7 },
      { ko: "자주 — 시간을 확보하려 노력한다", en: "Often — I try to secure time", ja: "頻繁に — 時間を確保しようとしている", zh: "经常 — 我会努力留出时间", fr: "Souvent — j'essaie de réserver du temps", es: "A menudo — intento reservar tiempo", score: 3 },
      { ko: "매일 — 시간 블록을 설정한다", en: "Daily — I set time blocks", ja: "毎日 — タイムブロックを設定する", zh: "每天 — 我会设置时间块", fr: "Chaque jour — je bloque du temps", es: "A diario — reservo bloques de tiempo", score: 1 },
    ],
  },
];

const categoryInfo: Record<BlockerCategory, {
  emoji: string;
  color: string;
  ko: { title: string; action: string };
  en: { title: string; action: string };
  ja: { title: string; action: string };
  zh: { title: string; action: string };
  fr: { title: string; action: string };
  es: { title: string; action: string };
}> = {
  notification: { emoji: "🔔", color: "#ef4444", ko: { title: "알림 방해", action: "방해금지 모드 활성화 및 알림 정리" }, en: { title: "Notification Distraction", action: "Activate do-not-disturb and clean up notifications" }, ja: { title: "通知の妨害", action: "おやすみモードを有効にして通知を整理する" }, zh: { title: "通知干扰", action: "开启勿扰模式，并整理通知设置" }, fr: { title: "Distraction par les notifications", action: "Activer le mode Ne pas déranger et trier les notifications" }, es: { title: "Distracción por notificaciones", action: "Activar el modo no molestar y ordenar las notificaciones" } },
  conversation: { emoji: "💬", color: "#f59e0b", ko: { title: "대화/소음 방해", action: "집중 시간대 설정 및 팀 공유" }, en: { title: "Conversation/Noise", action: "Set focused hours and share with team" }, ja: { title: "会話/騒音の妨害", action: "集中時間帯を設定してチームと共有する" }, zh: { title: "对话/噪音干扰", action: "设置专注时段，并与团队共享" }, fr: { title: "Conversation/Bruit", action: "Définir des plages de concentration et les partager avec l'équipe" }, es: { title: "Conversación/Ruido", action: "Definir horas de concentración y compartirlas con el equipo" } },
  taskSwitching: { emoji: "🔀", color: "#8b5cf6", ko: { title: "업무 전환 방해", action: "타임블로킹 및 우선순위 관리" }, en: { title: "Task Switching", action: "Time-blocking and priority management" }, ja: { title: "タスク切り替えの妨害", action: "タイムブロッキングと優先順位管理" }, zh: { title: "任务切换干扰", action: "使用时间块，并管理优先级" }, fr: { title: "Changement de tâche", action: "Utiliser le time blocking et gérer les priorités" }, es: { title: "Cambio de tareas", action: "Usar bloques de tiempo y gestionar prioridades" } },
  environment: { emoji: "🏢", color: "#06b6d4", ko: { title: "환경 방해", action: "물리적 환경 개선 및 불필요한 회의 제거" }, en: { title: "Environment", action: "Improve physical environment and cut unnecessary meetings" }, ja: { title: "環境の妨害", action: "物理的環境の改善と不要な会議の削減" }, zh: { title: "环境干扰", action: "改善物理环境，并减少不必要的会议" }, fr: { title: "Environnement", action: "Améliorer l'environnement physique et supprimer les réunions inutiles" }, es: { title: "Entorno", action: "Mejorar el entorno físico y eliminar reuniones innecesarias" } },
};

const ui = {
  ko: { title: "집중력 방해 요인 테스트", subtitle: "무엇이 나의 포커스를 막는가?", progress: (c: number, t: number) => `${c} / ${t}`, resultTitle: "나의 집중 방해 분석 결과", topBlockersLabel: "즉시 개선해야 할 방해 요소", actionPlanLabel: "개선 액션 플랜", restart: "다시 분석하기", share: "결과 공유", copied: "복사됨!", scoreLabel: "카테고리별 방해 점수" },
  en: { title: "Focus Blocker Test", subtitle: "What's blocking my focus?", progress: (c: number, t: number) => `${c} / ${t}`, resultTitle: "My Focus Blocker Analysis", topBlockersLabel: "Top Blockers to Address", actionPlanLabel: "Action Plan", restart: "Analyze Again", share: "Share Result", copied: "Copied!", scoreLabel: "Blocker Score by Category" },
  ja: { title: "集中力妨害要因テスト", subtitle: "何が私のフォーカスを妨げているか？", progress: (c: number, t: number) => `${c} / ${t}`, resultTitle: "私の集中妨害分析結果", topBlockersLabel: "すぐに改善すべき妨害要素", actionPlanLabel: "改善アクションプラン", restart: "再度分析する", share: "結果をシェア", copied: "コピーされました！", scoreLabel: "カテゴリ別妨害スコア" },
  zh: { title: "专注力干扰因素测试", subtitle: "是什么阻碍了我的专注？", progress: (c: number, t: number) => `${c} / ${t}`, resultTitle: "我的专注干扰分析结果", topBlockersLabel: "最需要优先处理的干扰", actionPlanLabel: "改善行动计划", restart: "重新分析", share: "分享结果", copied: "已复制！", scoreLabel: "各类别干扰分数" },
  fr: { title: "Test des obstacles à la concentration", subtitle: "Qu'est-ce qui bloque ma concentration ?", progress: (c: number, t: number) => `${c} / ${t}`, resultTitle: "Mon analyse des obstacles à la concentration", topBlockersLabel: "Principaux obstacles à traiter", actionPlanLabel: "Plan d'action", restart: "Analyser à nouveau", share: "Partager le résultat", copied: "Copié !", scoreLabel: "Score d'obstacle par catégorie" },
  es: { title: "Test de bloqueadores de concentración", subtitle: "¿Qué está bloqueando mi concentración?", progress: (c: number, t: number) => `${c} / ${t}`, resultTitle: "Mi análisis de bloqueadores de concentración", topBlockersLabel: "Principales bloqueadores a abordar", actionPlanLabel: "Plan de acción", restart: "Analizar de nuevo", share: "Compartir resultado", copied: "¡Copiado!", scoreLabel: "Puntuación de bloqueadores por categoría" },
};

export default function FocusBlockerTest({ locale: localeProp }: Props) {
  const lp = (localeProp ?? "en").toLowerCase();
  const locale: SupportedLocale = (["ko", "en", "ja", "zh", "fr", "es"].includes(lp) ? lp : "en") as SupportedLocale;
  const tx = ui[locale];

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<{ category: BlockerCategory; score: number }[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);

  function pick(category: BlockerCategory, score: number) {
    // 되돌아가서 다시 고르면 그 뒤 응답은 버린다 — 이어붙이기(append)면 되돌리기가 성립하지 않는다.
    const next = answers.slice(0, idx);
    next[idx] = { category, score };
    if (next.length < questions.length) {
      setAnswers(next);
      setTimeout(() => setIdx(idx + 1), 280);
    } else {
      setAnswers(next);
      setShowResult(true);
    }
  }

  function restart() {
    setIdx(0);
    setAnswers([]);
    setShowResult(false);
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

  if (showResult) {
    const catScores: Record<BlockerCategory, number> = { notification: 0, conversation: 0, taskSwitching: 0, environment: 0 };
    const catCounts: Record<BlockerCategory, number> = { notification: 0, conversation: 0, taskSwitching: 0, environment: 0 };
    answers.forEach(({ category, score }) => { catScores[category] += score; catCounts[category]++; });
    const catAvg: Record<BlockerCategory, number> = {
      notification: catCounts.notification > 0 ? catScores.notification / catCounts.notification : 0,
      conversation: catCounts.conversation > 0 ? catScores.conversation / catCounts.conversation : 0,
      taskSwitching: catCounts.taskSwitching > 0 ? catScores.taskSwitching / catCounts.taskSwitching : 0,
      environment: catCounts.environment > 0 ? catScores.environment / catCounts.environment : 0,
    };
    const sorted = (Object.keys(catAvg) as BlockerCategory[]).sort((a, b) => catAvg[b] - catAvg[a]);
    const maxScore = Math.max(...Object.values(catAvg), 1);

    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 p-6 text-center">
          <p className="text-sm font-medium text-orange-600 mb-1">{tx.resultTitle}</p>
          <div className="text-5xl mb-2">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900">{categoryInfo[sorted[0]][locale].title}</h2>
          <p className="mt-2 text-sm text-gray-600">{locale === "ko" ? "가장 큰 방해 요소" : locale === "ja" ? "最大の妨害要素" : locale === "zh" ? "最大的干扰因素" : locale === "fr" ? "Votre principal obstacle" : locale === "es" ? "Tu principal bloqueador" : "Your biggest blocker"}</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-semibold text-gray-700">{tx.scoreLabel}</h3>
          <div className="space-y-3">
            {sorted.map((cat) => {
              const ci = categoryInfo[cat];
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">{ci.emoji} {ci[locale].title}</span>
                    <span className="text-xs text-gray-400">{Math.round((catAvg[cat] / 10) * 100)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${(catAvg[cat] / maxScore) * 100}%`, backgroundColor: ci.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-semibold text-gray-700">{tx.actionPlanLabel}</h3>
          <div className="space-y-2">
            {sorted.slice(0, 3).map((cat, rank) => {
              const ci = categoryInfo[cat];
              return (
                <div key={cat} className="flex items-start gap-3 rounded-lg p-3" style={{ backgroundColor: `${ci.color}10` }}>
                  <span className="flex-shrink-0 font-bold text-sm" style={{ color: ci.color }}>#{rank + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{ci.emoji} {ci[locale].title}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{ci[locale].action}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={restart} className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50">{tx.restart}</button>
          <button onClick={share} className="flex-1 rounded-xl py-3 text-sm font-medium text-white transition bg-orange-500 hover:bg-orange-600">{copied ? tx.copied : tx.share}</button>
        </div>
        <ShareResultButton locale={localeProp ?? 'ko'} heading={tx.title} resultTitle={categoryInfo[sorted[0]][locale].title} />
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
      options={q.options.map((opt, i) => ({ label: opt[locale], value: i + 1 }))}
      selectedValue={
        answers[idx] === undefined
          ? undefined
          : q.options.findIndex((opt) => opt.score === answers[idx].score) + 1
      }
      previousLabel={locale === "ko" ? "이전 질문" : locale === "ja" ? "前の質問" : "Previous question"}
      onPrevious={idx > 0 ? () => setIdx(idx - 1) : undefined}
      onSelect={(value) => pick(q.category, q.options[value - 1].score)}
    />
  );
}
