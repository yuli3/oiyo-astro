import type { Locale } from '../../i18n';

export const BURNOUT_GUIDE_SLUG = 'magazine-burnout-guide';
export const BURNOUT_WHO_SOURCE = 'https://www.who.int/news-room/fact-sheets/detail/mental-health-at-work';

interface BurnoutReading {
  startTitle: string;
  startBody: string;
  guideLabel: string;
  supportTitle: string;
  personalTitle: string;
  personalBody: string;
  workTitle: string;
  workBody: string;
  helpTitle: string;
  helpBody: string;
  sourceLabel: string;
  collectionTitle: string;
}

const READING: Record<Locale, BurnoutReading> = {
  ko: {
    startTitle: '정의와 한계부터 읽어보세요',
    startBody: '번아웃은 WHO 정의에서 만성적인 직장 스트레스와 관련된 직업 현상이에요. 모든 피로나 공부·구직의 어려움을 같은 정의로 묶지는 않아요. 먼저 가이드에서 세 차원과 업무환경 여섯 영역을 구분해 보세요. 체크 개수나 고정 회복기간으로 자신을 진단하는 글이 아니에요.',
    guideLabel: '번아웃의 정의·업무환경·지원 가이드 읽기',
    supportTitle: '개인 지원과 업무 조정을 함께 살펴요',
    personalTitle: '내 상황을 설명할 자료',
    personalBody: '어떤 업무가 버거운지, 언제부터 달라졌는지, 생활에 어떤 영향이 있는지 정리해 보세요. 기록은 도움을 요청할 때 쓰는 자료이지 점수표가 아니에요. 기록 자체가 부담이면 자세히 작성하지 않고 상담해도 괜찮아요.',
    workTitle: '혼자 바꾸기 어려운 조건',
    workBody: '업무량·우선순위·인력·연락 시간은 다른 사람의 협력이 필요할 수 있어요. 가이드는 개인의 휴식뿐 아니라 조직과 논의할 조정도 다뤄요. 가능한 지원과 권리는 국가·고용 형태에 따라 다르며, 정해진 회복 속도를 보장하지 않아요.',
    helpTitle: '도움이 필요할 때',
    helpBody: '힘든 상태가 이어지거나 일상생활을 유지하기 어렵다면 의료·정신건강 전문가와 상의하세요. 다른 건강 문제도 함께 살펴볼 수 있어요. 지금 안전을 지키기 어렵다면 지역 응급 서비스에 즉시 연락하세요. 이 읽기 목록이나 관련 도구는 진단·치료를 대신하지 않아요.',
    sourceLabel: 'WHO의 직장 정신건강 안내',
    collectionTitle: '이 주제의 글 목록',
  },
  en: {
    startTitle: 'Start with the definition and its limits',
    startBody: 'In the WHO definition, burnout is an occupational phenomenon associated with chronic workplace stress. It does not cover every experience of fatigue or difficulty with studying and job searching. Start with the guide to distinguish three dimensions from six areas of work life. It does not diagnose you by a checklist count or a fixed recovery schedule.',
    guideLabel: 'Read the guide to burnout, work conditions, and support',
    supportTitle: 'Consider personal support and work adjustments together',
    personalTitle: 'Describe your situation',
    personalBody: 'Note which tasks feel difficult, when things changed, and how everyday life is affected. These notes are material for asking for support, not a scorecard. If keeping notes is burdensome, you can seek help without preparing a detailed record.',
    workTitle: 'Conditions you cannot change alone',
    workBody: 'Workload, priorities, staffing, and contact hours may require cooperation. The guide covers rest as well as adjustments to discuss with an organization. Available support and rights depend on the country and employment arrangement; no recovery speed is guaranteed.',
    helpTitle: 'When you need help',
    helpBody: 'If difficulties persist or interfere with everyday functioning, speak with a qualified health or mental health professional. Other health issues can be considered too. If you cannot keep yourself safe now, contact local emergency services immediately. This reading list and related tools do not replace diagnosis or treatment.',
    sourceLabel: 'WHO guidance on mental health at work',
    collectionTitle: 'Articles on this topic',
  },
  ja: {
    startTitle: '定義と適用範囲から読んでみましょう',
    startBody: 'WHOの定義では、バーンアウトは慢性的な職場ストレスに関係する職業上の現象です。あらゆる疲労や、勉強・就職活動の難しさを含む定義ではありません。まずガイドで3つの側面と職場環境の6領域を区別しましょう。チェック数や決まった回復期間で自己診断する記事ではありません。',
    guideLabel: 'バーンアウトの定義・職場環境・支援のガイドを読む',
    supportTitle: '個人への支援と職場の調整を一緒に考えます',
    personalTitle: '状況を伝えるための記録',
    personalBody: 'どの業務がつらいか、いつ変わったか、生活にどんな影響があるかを整理できます。相談のための資料であり、点数表ではありません。記録が負担なら、詳しいメモを用意せずに支援を求めても大丈夫です。',
    workTitle: '一人では変えにくい条件',
    workBody: '仕事量、優先順位、人員、連絡時間の調整には協力が必要な場合があります。ガイドは休息だけでなく、組織と相談する調整も扱います。利用できる支援や権利は国や雇用形態によって異なり、回復の速さを保証するものではありません。',
    helpTitle: '支援が必要なとき',
    helpBody: 'つらさが続いたり日常生活に支障があったりする場合は、医療やメンタルヘルスの専門家に相談してください。他の健康問題も確認できます。今すぐ安全を保てない場合は地域の救急サービスへ直ちに連絡してください。この一覧や関連ツールは診断・治療の代わりにはなりません。',
    sourceLabel: 'WHOの職場のメンタルヘルス案内',
    collectionTitle: 'このテーマの記事',
  },
  zh: {
    startTitle: '先了解定义和适用范围',
    startBody: '在WHO的定义中，职业倦怠是与长期工作压力相关的职业现象，并不涵盖所有疲劳或学习、求职的困难。您可以先阅读指南，区分三个维度与工作环境的六个领域。这不是根据符合项目的数量或固定恢复时间来作自我诊断的文章。',
    guideLabel: '阅读职业倦怠定义、工作条件与支持指南',
    supportTitle: '同时考虑个人支持与工作调整',
    personalTitle: '整理说明情况的材料',
    personalBody: '可以记录哪些任务让您吃力、何时开始变化、日常生活受到什么影响。这些是求助时沟通的材料，不是计分表。如果记录本身带来负担，不必准备详细日记也可以求助。',
    workTitle: '无法独自改变的条件',
    workBody: '工作量、优先级、人手和联系时间的调整可能需要他人配合。指南不仅谈休息，也谈可以与组织讨论的调整。可获得的支持和权利取决于所在国家和雇佣形式，不保证固定的恢复速度。',
    helpTitle: '需要帮助的时候',
    helpBody: '如果困难持续或影响日常生活，请咨询医疗或心理健康专业人员，也可以评估其他健康问题。如果您现在无法确保自身安全，请立即联系所在地的紧急救援服务。这份阅读列表和相关工具不能替代诊断或治疗。',
    sourceLabel: 'WHO的工作场所心理健康说明',
    collectionTitle: '本主题文章',
  },
  fr: {
    startTitle: 'Commencez par la définition et ses limites',
    startBody: 'Dans la définition de l’OMS, le burn-out est un phénomène professionnel lié à un stress chronique au travail. Il ne couvre pas toute fatigue ni toutes les difficultés des études ou de la recherche d’emploi. Le guide distingue trois dimensions et six domaines de la vie professionnelle, sans autodiagnostic fondé sur un nombre de réponses ou un calendrier de récupération.',
    guideLabel: 'Lire le guide sur le burn-out, le travail et le soutien',
    supportTitle: 'Associez soutien personnel et ajustements du travail',
    personalTitle: 'Décrire votre situation',
    personalBody: 'Vous pouvez noter les tâches difficiles, le début des changements et leurs effets sur la vie quotidienne. Ces notes servent à demander du soutien, pas à calculer un score. Si cela vous pèse, vous pouvez demander de l’aide sans préparer de journal détaillé.',
    workTitle: 'Les conditions qui ne dépendent pas de vous seul',
    workBody: 'La charge, les priorités, les effectifs et les horaires de contact peuvent nécessiter une coopération. Le guide traite du repos et des ajustements à discuter avec l’organisation. Les aides et les droits varient selon le pays et le statut d’emploi ; aucune vitesse de récupération n’est garantie.',
    helpTitle: 'Quand vous avez besoin d’aide',
    helpBody: 'Si les difficultés persistent ou affectent la vie quotidienne, consultez un professionnel de santé ou de santé mentale. D’autres problèmes de santé peuvent aussi être examinés. Si vous ne pouvez pas assurer votre sécurité maintenant, contactez immédiatement les services d’urgence locaux. Cette liste et les outils associés ne remplacent ni diagnostic ni traitement.',
    sourceLabel: 'L’OMS sur la santé mentale au travail',
    collectionTitle: 'Articles sur ce thème',
  },
  es: {
    startTitle: 'Empieza por la definición y sus límites',
    startBody: 'En la definición de la OMS, el burnout es un fenómeno ocupacional relacionado con el estrés crónico en el trabajo. No abarca toda fatiga ni todas las dificultades al estudiar o buscar empleo. La guía distingue tres dimensiones y seis áreas de la vida laboral, sin autodiagnóstico por número de respuestas ni plazos fijos de recuperación.',
    guideLabel: 'Leer la guía sobre burnout, trabajo y apoyo',
    supportTitle: 'Combina apoyo personal y ajustes laborales',
    personalTitle: 'Describe tu situación',
    personalBody: 'Puedes anotar qué tareas resultan difíciles, cuándo empezaron los cambios y cómo afectan a la vida diaria. Son materiales para pedir apoyo, no una puntuación. Si tomar notas añade carga, puedes pedir ayuda sin preparar un diario detallado.',
    workTitle: 'Condiciones que no puedes cambiar por tu cuenta',
    workBody: 'La carga, las prioridades, el personal y los horarios de contacto pueden requerir colaboración. La guía trata el descanso y los ajustes que se pueden discutir con la organización. El apoyo y los derechos dependen del país y de las condiciones de contratación; no se garantiza una velocidad de recuperación.',
    helpTitle: 'Cuando necesitas ayuda',
    helpBody: 'Si las dificultades persisten o interfieren en la vida cotidiana, consulta a un profesional sanitario o de salud mental. También se pueden valorar otros problemas de salud. Si ahora no puedes mantenerte a salvo, contacta inmediatamente con los servicios de emergencia locales. Esta lista y las herramientas relacionadas no sustituyen un diagnóstico ni un tratamiento.',
    sourceLabel: 'La OMS sobre salud mental en el trabajo',
    collectionTitle: 'Artículos sobre este tema',
  },
};

export function burnoutTopicReading(topic: string, locale: Locale, articleSlugs: readonly string[]) {
  // 2026-10-08: promote only a guide that actually exists in this locale's list.
  // Other topic archives retain their current output; this is not a diagnostic UI.
  if (topic !== 'burnout' || !articleSlugs.includes(BURNOUT_GUIDE_SLUG)) return undefined;
  return READING[locale];
}
