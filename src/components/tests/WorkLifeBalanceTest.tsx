import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { Questionnaire } from '@/components/ui/questionnaire'
import ShareResultButton from '../shared/ShareResultButton'

type SupportedLang = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'
function lang(locale: string): SupportedLang {
  return (['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const).includes(locale as SupportedLang) ? (locale as SupportedLang) : 'en'
}

type Domain = 'workDemand' | 'personalTime' | 'recovery' | 'meaning'
type OverallLevel = 'imbalanced' | 'strained' | 'developing' | 'balanced'

interface Question { id: string; text: string; domain: Domain; reversed?: boolean }

const DOMAIN_COLORS: Record<Domain, string> = {
  workDemand: '#ef4444',
  personalTime: '#3b82f6',
  recovery: '#22c55e',
  meaning: '#1C8292',
}

const LABELS: Record<SupportedLang, {
  title: string; subtitle: string; note: string
  questionOf: (c: number, t: number) => string
  scaleLabels: [string, string, string, string, string]
  restart: string; share: string; shareMsg: string
  yourBalance: string; domainProfile: string
  overallLevel: string; guidance: string; attentionDomain: string
  scoreLabel: string; outOf: string
  domainNames: Record<Domain, string>
}> = {
  ko: {
    title: '일·생활 균형 테스트',
    subtitle: '나의 워라밸 점수는?',
    note: '이 테스트는 일과 삶의 균형을 탐색하는 자가 진단 도구입니다.',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['전혀 아님', '약간 아님', '보통', '약간 그럼', '매우 그럼'],
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '나의 워라밸 점수',
    yourBalance: '나의 일·생활 균형',
    domainProfile: '영역별 균형 프로필',
    overallLevel: '전체 균형 수준',
    guidance: '균형을 위한 조언',
    attentionDomain: '가장 주의가 필요한 영역',
    scoreLabel: '워라밸 점수',
    outOf: '/ 80점',
    domainNames: {
      workDemand: '업무 부담',
      personalTime: '개인 시간',
      recovery: '회복력',
      meaning: '의미와 목적',
    },
  },
  en: {
    title: 'Work-Life Balance Test',
    subtitle: "What's Your Balance Score?",
    note: 'This is a self-assessment tool for exploring work-life balance.',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Not at all', 'Slightly not', 'Neutral', 'Somewhat', 'Very much'],
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My work-life balance score',
    yourBalance: 'My Work-Life Balance',
    domainProfile: 'Balance Profile by Domain',
    overallLevel: 'Overall Balance Level',
    guidance: 'Guidance for Better Balance',
    attentionDomain: 'Domain Needing Most Attention',
    scoreLabel: 'Balance Score',
    outOf: '/ 80',
    domainNames: {
      workDemand: 'Work Demand',
      personalTime: 'Personal Time',
      recovery: 'Recovery',
      meaning: 'Meaning & Purpose',
    },
  },
  ja: {
    title: 'ワークライフバランステスト',
    subtitle: '私のバランススコアは？',
    note: 'このテストはワークライフバランスを探る自己診断ツールです。',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['全くない', 'あまりない', '普通', '少しある', 'とてもある'],
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '私のワークライフバランススコア',
    yourBalance: '仕事・生活のバランス',
    domainProfile: '領域別バランスプロフィール',
    overallLevel: '全体的なバランスレベル',
    guidance: 'バランス改善のアドバイス',
    attentionDomain: '最も注意が必要な領域',
    scoreLabel: 'バランススコア',
    outOf: '/ 80点',
    domainNames: {
      workDemand: '業務負担',
      personalTime: '個人時間',
      recovery: '回復力',
      meaning: '意味と目的',
    },
  },
  zh: {
    title: '工作与生活平衡测验',
    subtitle: '我的工作生活平衡几分？',
    note: '本测验是探索工作与生活平衡的自我检查工具。',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['完全不是', '有点不是', '一般', '有点是', '非常是'],
    restart: '重新测验',
    share: '分享结果',
    shareMsg: '我的工作生活平衡分数',
    yourBalance: '我的工作与生活平衡',
    domainProfile: '各领域平衡概况',
    overallLevel: '整体平衡程度',
    guidance: '给平衡的建议',
    attentionDomain: '最需要留意的领域',
    scoreLabel: '平衡分数',
    outOf: '/ 80 分',
    domainNames: {
      workDemand: '工作负担',
      personalTime: '个人时间',
      recovery: '恢复力',
      meaning: '意义与目的',
    },
  },
  fr: {
    title: 'Test d’équilibre vie pro / vie perso',
    subtitle: 'Quel est mon score d’équilibre ?',
    note: 'Ce test est un outil d’auto-évaluation pour explorer l’équilibre entre travail et vie personnelle.',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Pas du tout', 'Plutôt pas', 'Moyennement', 'Plutôt oui', 'Tout à fait'],
    restart: 'Recommencer',
    share: 'Partager le résultat',
    shareMsg: 'Mon score d’équilibre vie pro / vie perso',
    yourBalance: 'Mon équilibre travail-vie',
    domainProfile: 'Profil d’équilibre par domaine',
    overallLevel: 'Niveau d’équilibre global',
    guidance: 'Conseils pour l’équilibre',
    attentionDomain: 'Domaine qui demande le plus d’attention',
    scoreLabel: 'Score d’équilibre',
    outOf: '/ 80 points',
    domainNames: {
      workDemand: 'Charge de travail',
      personalTime: 'Temps personnel',
      recovery: 'Récupération',
      meaning: 'Sens et objectifs',
    },
  },
  es: {
    title: 'Test de equilibrio entre trabajo y vida',
    subtitle: '¿Cuál es mi puntuación de equilibrio?',
    note: 'Este test es una herramienta de autoevaluación para explorar el equilibrio entre trabajo y vida personal.',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Nada', 'Un poco no', 'A medias', 'Un poco sí', 'Totalmente'],
    restart: 'Repetir',
    share: 'Compartir resultado',
    shareMsg: 'Mi puntuación de equilibrio trabajo-vida',
    yourBalance: 'Mi equilibrio entre trabajo y vida',
    domainProfile: 'Perfil de equilibrio por áreas',
    overallLevel: 'Nivel de equilibrio global',
    guidance: 'Consejos para el equilibrio',
    attentionDomain: 'Área que más atención necesita',
    scoreLabel: 'Puntuación de equilibrio',
    outOf: '/ 80 puntos',
    domainNames: {
      workDemand: 'Carga de trabajo',
      personalTime: 'Tiempo personal',
      recovery: 'Recuperación',
      meaning: 'Sentido y propósito',
    },
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 'w1', text: '일이 끝난 후에도 업무 생각이 머릿속을 떠나지 않는다', domain: 'workDemand', reversed: true },
    { id: 'w2', text: '업무 시간이 예상보다 훨씬 길어질 때가 많다', domain: 'workDemand', reversed: true },
    { id: 'w3', text: '일로 인한 스트레스가 가정생활이나 개인 시간에 영향을 준다', domain: 'workDemand', reversed: true },
    { id: 'w4', text: '쉬는 날에도 업무 연락을 확인하거나 응답해야 한다는 압박이 있다', domain: 'workDemand', reversed: true },
    { id: 'p1', text: '가족이나 친구와 의미 있는 시간을 충분히 보낼 수 있다', domain: 'personalTime' },
    { id: 'p2', text: '취미나 개인적 관심사에 시간을 투자한다', domain: 'personalTime' },
    { id: 'p3', text: '일 이외의 나만의 삶이 있다고 느낀다', domain: 'personalTime' },
    { id: 'p4', text: '스스로를 위한 즐거운 활동을 규칙적으로 한다', domain: 'personalTime' },
    { id: 'r1', text: '충분한 수면을 취하고 있다', domain: 'recovery' },
    { id: 'r2', text: '피로가 쌓여도 회복할 수 있는 시간이 있다', domain: 'recovery' },
    { id: 'r3', text: '주말이나 휴일에 진정한 휴식을 취할 수 있다', domain: 'recovery' },
    { id: 'r4', text: '일주일에 적어도 몇 번 신체 활동을 한다', domain: 'recovery' },
    { id: 'm1', text: '현재 하는 일이 의미 있다고 느낀다', domain: 'meaning' },
    { id: 'm2', text: '직업적 목표와 개인적 가치관이 일치한다', domain: 'meaning' },
    { id: 'm3', text: '일과 삶 모두에서 성장하고 있다고 느낀다', domain: 'meaning' },
    { id: 'm4', text: '미래에 대한 긍정적인 기대감이 있다', domain: 'meaning' },
  ],
  en: [
    { id: 'w1', text: 'After work ends, I can\'t stop thinking about work', domain: 'workDemand', reversed: true },
    { id: 'w2', text: 'Work hours often run much longer than expected', domain: 'workDemand', reversed: true },
    { id: 'w3', text: 'Work-related stress affects my home life or personal time', domain: 'workDemand', reversed: true },
    { id: 'w4', text: 'I feel pressure to check or respond to work messages even on days off', domain: 'workDemand', reversed: true },
    { id: 'p1', text: 'I spend meaningful time with family or friends', domain: 'personalTime' },
    { id: 'p2', text: 'I invest time in hobbies or personal interests', domain: 'personalTime' },
    { id: 'p3', text: 'I feel I have a personal life beyond work', domain: 'personalTime' },
    { id: 'p4', text: 'I regularly do enjoyable activities for myself', domain: 'personalTime' },
    { id: 'r1', text: 'I get enough sleep', domain: 'recovery' },
    { id: 'r2', text: 'Even when tired, I have time to recover', domain: 'recovery' },
    { id: 'r3', text: 'I can genuinely rest on weekends or holidays', domain: 'recovery' },
    { id: 'r4', text: 'I engage in physical activity at least a few times a week', domain: 'recovery' },
    { id: 'm1', text: 'I find my current work meaningful', domain: 'meaning' },
    { id: 'm2', text: 'My career goals align with my personal values', domain: 'meaning' },
    { id: 'm3', text: 'I feel I\'m growing in both work and personal life', domain: 'meaning' },
    { id: 'm4', text: 'I have a positive sense of anticipation about the future', domain: 'meaning' },
  ],
  ja: [
    { id: 'w1', text: '仕事が終わっても業務のことが頭から離れない', domain: 'workDemand', reversed: true },
    { id: 'w2', text: '勤務時間が予想よりはるかに長くなることが多い', domain: 'workDemand', reversed: true },
    { id: 'w3', text: '仕事のストレスが家庭生活や個人時間に影響する', domain: 'workDemand', reversed: true },
    { id: 'w4', text: '休日でも仕事の連絡を確認・返信しなければならないプレッシャーがある', domain: 'workDemand', reversed: true },
    { id: 'p1', text: '家族や友人と意義ある時間を十分に過ごせている', domain: 'personalTime' },
    { id: 'p2', text: '趣味や個人的な関心に時間を投資している', domain: 'personalTime' },
    { id: 'p3', text: '仕事以外の自分の生活があると感じる', domain: 'personalTime' },
    { id: 'p4', text: '自分のために楽しい活動を定期的に行っている', domain: 'personalTime' },
    { id: 'r1', text: '十分な睡眠が取れている', domain: 'recovery' },
    { id: 'r2', text: '疲れが溜まっても回復できる時間がある', domain: 'recovery' },
    { id: 'r3', text: '週末や休日に本当の休息が取れる', domain: 'recovery' },
    { id: 'r4', text: '週に少なくとも数回は身体活動をしている', domain: 'recovery' },
    { id: 'm1', text: '現在の仕事に意味を感じている', domain: 'meaning' },
    { id: 'm2', text: 'キャリアの目標と個人的な価値観が一致している', domain: 'meaning' },
    { id: 'm3', text: '仕事でも個人生活でも成長していると感じる', domain: 'meaning' },
    { id: 'm4', text: '将来に対してポジティブな期待感がある', domain: 'meaning' },
  ],
  zh: [
    { id: 'w1', text: '下班后，工作的事还是一直在脑子里转', domain: 'workDemand', reversed: true },
    { id: 'w2', text: '工作时间常常比预期长很多', domain: 'workDemand', reversed: true },
    { id: 'w3', text: '工作压力影响到家庭生活或个人时间', domain: 'workDemand', reversed: true },
    { id: 'w4', text: '休息日也有必须查看或回复工作消息的压力', domain: 'workDemand', reversed: true },
    { id: 'p1', text: '我能和家人朋友共度足够有意义的时间', domain: 'personalTime' },
    { id: 'p2', text: '我会把时间投入到兴趣或个人爱好上', domain: 'personalTime' },
    { id: 'p3', text: '我觉得自己在工作之外有属于自己的生活', domain: 'personalTime' },
    { id: 'p4', text: '我会规律地做让自己开心的活动', domain: 'personalTime' },
    { id: 'r1', text: '我的睡眠是充足的', domain: 'recovery' },
    { id: 'r2', text: '即使疲劳累积，也有时间恢复', domain: 'recovery' },
    { id: 'r3', text: '周末或假日能真正休息', domain: 'recovery' },
    { id: 'r4', text: '我每周至少运动几次', domain: 'recovery' },
    { id: 'm1', text: '我觉得现在做的事有意义', domain: 'meaning' },
    { id: 'm2', text: '职业目标和个人价值观是一致的', domain: 'meaning' },
    { id: 'm3', text: '我觉得自己在工作和生活上都在成长', domain: 'meaning' },
    { id: 'm4', text: '我对未来有正面的期待', domain: 'meaning' },
  ],
  fr: [
    { id: 'w1', text: 'Même après le travail, je n’arrive pas à décrocher', domain: 'workDemand', reversed: true },
    { id: 'w2', text: 'Mes journées de travail durent souvent bien plus que prévu', domain: 'workDemand', reversed: true },
    { id: 'w3', text: 'Le stress du travail empiète sur ma vie de famille ou mon temps personnel', domain: 'workDemand', reversed: true },
    { id: 'w4', text: 'Même les jours de repos, je me sens obligé de consulter ou répondre aux messages professionnels', domain: 'workDemand', reversed: true },
    { id: 'p1', text: 'Je peux passer suffisamment de temps de qualité avec ma famille ou mes amis', domain: 'personalTime' },
    { id: 'p2', text: 'Je consacre du temps à mes loisirs ou centres d’intérêt', domain: 'personalTime' },
    { id: 'p3', text: 'J’ai le sentiment d’avoir une vie à moi en dehors du travail', domain: 'personalTime' },
    { id: 'p4', text: 'Je fais régulièrement des activités agréables pour moi', domain: 'personalTime' },
    { id: 'r1', text: 'Je dors suffisamment', domain: 'recovery' },
    { id: 'r2', text: 'Quand la fatigue s’accumule, j’ai le temps de récupérer', domain: 'recovery' },
    { id: 'r3', text: 'Je peux vraiment me reposer le week-end ou les jours fériés', domain: 'recovery' },
    { id: 'r4', text: 'Je fais une activité physique au moins quelques fois par semaine', domain: 'recovery' },
    { id: 'm1', text: 'J’ai le sentiment que mon travail a du sens', domain: 'meaning' },
    { id: 'm2', text: 'Mes objectifs professionnels rejoignent mes valeurs personnelles', domain: 'meaning' },
    { id: 'm3', text: 'J’ai le sentiment de progresser au travail comme dans la vie', domain: 'meaning' },
    { id: 'm4', text: 'J’envisage l’avenir de façon positive', domain: 'meaning' },
  ],
  es: [
    { id: 'w1', text: 'Incluso después del trabajo, no consigo desconectar', domain: 'workDemand', reversed: true },
    { id: 'w2', text: 'La jornada laboral suele alargarse mucho más de lo previsto', domain: 'workDemand', reversed: true },
    { id: 'w3', text: 'El estrés del trabajo afecta a mi vida familiar o a mi tiempo personal', domain: 'workDemand', reversed: true },
    { id: 'w4', text: 'Incluso en días libres siento presión por revisar o responder mensajes del trabajo', domain: 'workDemand', reversed: true },
    { id: 'p1', text: 'Puedo pasar suficiente tiempo de calidad con mi familia o amigos', domain: 'personalTime' },
    { id: 'p2', text: 'Dedico tiempo a mis aficiones o intereses personales', domain: 'personalTime' },
    { id: 'p3', text: 'Siento que tengo una vida propia fuera del trabajo', domain: 'personalTime' },
    { id: 'p4', text: 'Hago con regularidad actividades que disfruto', domain: 'personalTime' },
    { id: 'r1', text: 'Duermo lo suficiente', domain: 'recovery' },
    { id: 'r2', text: 'Cuando se acumula el cansancio, tengo tiempo para recuperarme', domain: 'recovery' },
    { id: 'r3', text: 'Puedo descansar de verdad los fines de semana o festivos', domain: 'recovery' },
    { id: 'r4', text: 'Hago actividad física al menos unas cuantas veces por semana', domain: 'recovery' },
    { id: 'm1', text: 'Siento que mi trabajo tiene sentido', domain: 'meaning' },
    { id: 'm2', text: 'Mis metas profesionales encajan con mis valores personales', domain: 'meaning' },
    { id: 'm3', text: 'Siento que crezco tanto en el trabajo como en la vida', domain: 'meaning' },
    { id: 'm4', text: 'Tengo expectativas positivas sobre el futuro', domain: 'meaning' },
  ],
}

interface LevelData { title: string; subtitle: string; description: string; guidance: string[] }
const OVERALL_RESULTS: Record<OverallLevel, Record<SupportedLang, LevelData>> = {
  imbalanced: {
    ko: {
      title: '심각한 불균형',
      subtitle: '지금 일·생활 균형이 많이 무너진 상태입니다',
      description: '현재 일과 삶의 균형이 크게 무너져 있습니다. 이 상태가 지속되면 번아웃, 건강 문제, 관계 손상으로 이어질 수 있습니다. 지금 즉각적인 변화가 필요합니다.',
      guidance: ['업무 외 시간 최소 하나의 고정 "쉼" 시간 만들기', '현재 일정에서 제거할 수 있는 것 리스트업', '신뢰하는 사람이나 상담사와 현 상황 공유하기', '작은 회복 루틴부터 시작하기 (15분 산책, 조기 취침)'],
    },
    en: {
      title: 'Serious Imbalance',
      subtitle: 'Your work-life balance is significantly disrupted',
      description: 'Your work-life balance is significantly off right now. If this continues, it can lead to burnout, health problems, and relationship damage. Immediate change is needed.',
      guidance: ['Create at least one fixed "rest" period outside work hours', 'List what can be eliminated from your current schedule', 'Share your situation with a trusted person or counselor', 'Start with small recovery routines (15-min walk, earlier sleep)'],
    },
    ja: {
      title: '深刻な不均衡',
      subtitle: '仕事・生活のバランスが大きく崩れています',
      description: '現在、仕事と生活のバランスが大きく崩れています。この状態が続くと、バーンアウト、健康問題、関係の損傷につながる可能性があります。今すぐ変化が必要です。',
      guidance: ['勤務時間外に少なくとも一つの固定「休息」時間を作る', '現在のスケジュールから削除できるものをリストアップ', '信頼できる人やカウンセラーに現状を共有する', '小さな回復ルーティンから始める（15分の散歩、早めの就寝）'],
    },
    zh: {
      title: '严重失衡',
      subtitle: '现在工作与生活的平衡已经严重失守',
      description: '目前工作与生活的平衡严重失衡。如果持续下去，可能导致倦怠、健康问题和关系受损。现在需要立即做出改变。',
      guidance: ['在工作之外，至少固定一段“休息”时间', '列出目前日程里可以删掉的事', '和信任的人或咨询师聊聊现在的状况', '从小小的恢复习惯开始（散步 15 分钟、早点睡）'],
    },
    fr: {
      title: 'Déséquilibre marqué',
      subtitle: 'Votre équilibre entre travail et vie personnelle est fortement ébranlé',
      description: 'L’équilibre entre travail et vie personnelle est très dégradé. Si cela dure, cela peut mener à l’épuisement, à des problèmes de santé et à des relations abîmées. Un changement immédiat s’impose.',
      guidance: ['Bloquer au moins un créneau de « pause » fixe en dehors du travail', 'Lister ce qui peut être retiré de votre emploi du temps', 'Parler de votre situation à une personne de confiance ou à un professionnel', 'Commencer par une petite routine de récupération (15 minutes de marche, se coucher plus tôt)'],
    },
    es: {
      title: 'Desequilibrio grave',
      subtitle: 'Tu equilibrio entre trabajo y vida está muy deteriorado',
      description: 'El equilibrio entre trabajo y vida está muy deteriorado. Si continúa, puede llevar al agotamiento, a problemas de salud y a relaciones dañadas. Hace falta un cambio inmediato.',
      guidance: ['Reservar al menos un rato fijo de «descanso» fuera del trabajo', 'Hacer una lista de lo que puedes quitar de tu agenda', 'Compartir tu situación con alguien de confianza o con un profesional', 'Empezar con una pequeña rutina de recuperación (15 minutos de paseo, acostarte antes)'],
    },
  },
  strained: {
    ko: {
      title: '불안정한 균형',
      subtitle: '균형이 흔들리고 있습니다',
      description: '일과 삶의 균형이 불안정한 상태입니다. 어떤 영역은 괜찮지만 다른 영역이 부담이 되고 있습니다. 지금 의도적인 조정이 필요한 시점입니다.',
      guidance: ['가장 취약한 영역에 우선 집중하기', '매주 "균형 점검" 시간 10분 갖기', '회복에 도움이 되는 활동 하나를 일과에 추가하기', '디지털 기기 사용 시간 의도적으로 제한하기'],
    },
    en: {
      title: 'Strained Balance',
      subtitle: 'Your balance is wavering',
      description: 'Your work-life balance is unstable. Some areas are okay, but others are becoming a burden. Now is the time for intentional adjustment.',
      guidance: ['Focus first on your most vulnerable area', 'Have a 10-minute "balance check" each week', 'Add one recovery-supporting activity to your routine', 'Intentionally limit your digital device usage time'],
    },
    ja: {
      title: '不安定なバランス',
      subtitle: 'バランスが揺らいでいます',
      description: '仕事と生活のバランスが不安定な状態です。いくつかの領域は大丈夫ですが、他の領域が負担になっています。今、意図的な調整が必要な時期です。',
      guidance: ['最も脆弱な領域に優先的に集中する', '毎週「バランスチェック」の10分を持つ', '回復に役立つ活動を一つ日課に加える', 'デジタル機器の使用時間を意図的に制限する'],
    },
    zh: {
      title: '不稳定的平衡',
      subtitle: '平衡正在动摇',
      description: '工作与生活的平衡不太稳定。有些领域还好，但另一些正成为负担。现在是需要有意识调整的时候。',
      guidance: ['优先关注最薄弱的领域', '每周留 10 分钟做“平衡检查”', '在日常中加入一项有助恢复的活动', '有意识地限制使用电子设备的时间'],
    },
    fr: {
      title: 'Équilibre fragile',
      subtitle: 'Votre équilibre vacille',
      description: 'Votre équilibre entre travail et vie personnelle est instable. Certains domaines vont bien, d’autres deviennent pesants. C’est le moment de faire des ajustements volontaires.',
      guidance: ['Vous concentrer d’abord sur le domaine le plus fragile', 'Prendre 10 minutes chaque semaine pour faire le point sur votre équilibre', 'Ajouter à votre journée une activité qui aide à récupérer', 'Limiter volontairement le temps passé sur les écrans'],
    },
    es: {
      title: 'Equilibrio inestable',
      subtitle: 'Tu equilibrio se tambalea',
      description: 'Tu equilibrio entre trabajo y vida es inestable. Algunas áreas van bien, pero otras empiezan a pesar. Es momento de hacer ajustes conscientes.',
      guidance: ['Centrarte primero en el área más frágil', 'Reservar 10 minutos a la semana para revisar tu equilibrio', 'Añadir a tu día una actividad que ayude a recuperarte', 'Limitar conscientemente el tiempo con dispositivos digitales'],
    },
  },
  developing: {
    ko: {
      title: '발전 중인 균형',
      subtitle: '균형을 잡아가고 있습니다',
      description: '전반적으로 균형을 잡아가고 있지만, 아직 최적화의 여지가 있습니다. 지금의 방향은 맞습니다. 조금 더 세밀하게 조정하면 더 좋은 균형을 이룰 수 있습니다.',
      guidance: ['현재 잘 되고 있는 것들을 의식적으로 유지하기', '개선 여지가 있는 영역 하나씩 접근하기', '일과 삶 모두에서 "충분히 좋다"는 기준 설정하기', '자신의 에너지 패턴에 맞는 일정 최적화'],
    },
    en: {
      title: 'Developing Balance',
      subtitle: 'You are finding your balance',
      description: 'You\'re generally finding your balance, but there is still room for optimization. You\'re heading in the right direction. A bit more fine-tuning can achieve an even better balance.',
      guidance: ['Consciously maintain what is already working well', 'Approach areas with room for improvement one at a time', 'Set a "good enough" standard in both work and life', 'Optimize your schedule to match your energy patterns'],
    },
    ja: {
      title: '発展中のバランス',
      subtitle: 'バランスを取りつつあります',
      description: '全般的にバランスを取りつつありますが、まだ最適化の余地があります。今の方向性は正しいです。もう少し細かく調整すれば、より良いバランスを実現できます。',
      guidance: ['うまくいっていることを意識的に維持する', '改善余地のある領域に一つずつアプローチする', '仕事でも生活でも「十分に良い」の基準を設定する', '自分のエネルギーパターンに合ったスケジュールを最適化する'],
    },
    zh: {
      title: '逐步建立的平衡',
      subtitle: '正在找到平衡',
      description: '整体上正在找到平衡，但还有优化空间。现在的方向是对的，再细致地调整一下，就能达到更好的平衡。',
      guidance: ['有意识地维持目前做得好的部分', '一次处理一个有改进空间的领域', '在工作和生活上都设定“够好了”的标准', '按照自己的能量模式优化日程'],
    },
    fr: {
      title: 'Équilibre en construction',
      subtitle: 'Vous êtes en train de trouver l’équilibre',
      description: 'Dans l’ensemble, vous trouvez votre équilibre, mais il reste une marge d’amélioration. La direction est la bonne : quelques réglages plus fins vous mèneront à un meilleur équilibre.',
      guidance: ['Préserver consciemment ce qui fonctionne déjà', 'Aborder un par un les domaines à améliorer', 'Fixer un niveau « suffisamment bien » au travail comme dans la vie', 'Organiser votre emploi du temps selon vos pics d’énergie'],
    },
    es: {
      title: 'Equilibrio en desarrollo',
      subtitle: 'Estás encontrando el equilibrio',
      description: 'En general estás encontrando el equilibrio, pero aún hay margen de mejora. Vas en la dirección correcta: con ajustes más finos lograrás un equilibrio mejor.',
      guidance: ['Mantener conscientemente lo que ya funciona', 'Abordar una a una las áreas con margen de mejora', 'Fijar un listón de «suficientemente bien» en el trabajo y en la vida', 'Organizar tu agenda según tus patrones de energía'],
    },
  },
  balanced: {
    ko: {
      title: '균형 잡힌 삶',
      subtitle: '훌륭한 워라밸을 유지하고 있습니다',
      description: '현재 일과 삶의 균형이 건강하게 유지되고 있습니다. 이 균형을 지속적으로 의식하고 유지하는 것이 중요합니다. 변화하는 상황 속에서도 이 균형을 지켜나가세요.',
      guidance: ['현재 균형을 가능하게 하는 요소들을 파악하고 보호하기', '새로운 도전에 직면할 때 균형이 흔들리지 않도록 주의하기', '주변 사람들에게도 균형 잡힌 삶의 패턴 나누기', '정기적인 자기 점검으로 균형 모니터링'],
    },
    en: {
      title: 'Balanced Life',
      subtitle: 'You are maintaining excellent work-life balance',
      description: 'Your work-life balance is currently healthy and well-maintained. It\'s important to continue consciously maintaining this balance. Keep protecting it even as circumstances change.',
      guidance: ['Identify and protect the factors that make your current balance possible', 'Be careful not to let balance waver when facing new challenges', 'Share balanced life patterns with those around you', 'Use regular self-checks to monitor your balance'],
    },
    ja: {
      title: 'バランスの取れた生活',
      subtitle: '優れたワークライフバランスを維持しています',
      description: '現在、仕事と生活のバランスが健全に維持されています。このバランスを継続的に意識して維持することが重要です。状況が変わっても、このバランスを守り続けてください。',
      guidance: ['現在のバランスを可能にしている要素を把握して保護する', '新しい課題に直面したときもバランスが崩れないよう注意する', '周りの人々にもバランスの取れた生活パターンを共有する', '定期的な自己チェックでバランスをモニタリングする'],
    },
    zh: {
      title: '平衡的生活',
      subtitle: '你维持着很好的工作生活平衡',
      description: '目前工作与生活的平衡保持得很健康。持续留意并维持这份平衡很重要。在变化的环境中也请守住它。',
      guidance: ['找出并守护让现在平衡成为可能的因素', '面对新挑战时，留意别让平衡被打乱', '也和身边的人分享平衡生活的方式', '定期自我检查，关注平衡状况'],
    },
    fr: {
      title: 'Une vie équilibrée',
      subtitle: 'Vous maintenez un excellent équilibre',
      description: 'Votre équilibre entre travail et vie personnelle est sain. L’important est de continuer à y prêter attention et à l’entretenir, même quand la situation change.',
      guidance: ['Identifier et protéger ce qui rend cet équilibre possible', 'Veiller à ce que les nouveaux défis ne le fassent pas vaciller', 'Partager avec votre entourage vos façons de vivre équilibrées', 'Faire régulièrement le point pour suivre votre équilibre'],
    },
    es: {
      title: 'Una vida equilibrada',
      subtitle: 'Mantienes un equilibrio excelente',
      description: 'Tu equilibrio entre trabajo y vida es sano. Lo importante es seguir atento a él y cuidarlo, incluso cuando cambian las circunstancias.',
      guidance: ['Identificar y proteger lo que hace posible este equilibrio', 'Vigilar que los nuevos retos no lo desestabilicen', 'Compartir con tu entorno tus hábitos de vida equilibrada', 'Revisarte con regularidad para seguir tu equilibrio'],
    },
  },
}

interface Props { locale?: string }

export default function WorkLifeBalanceTest({ locale: lp = 'ko' }: Props) {
  const locale = lang(lp ?? 'en')
  const lb = LABELS[locale]
  const questions = QUESTIONS[locale]

  const [current, setCurrent] = useState(0)
  const [domainScores, setDomainScores] = useState<Record<Domain, number>>({ workDemand: 0, personalTime: 0, recovery: 0, meaning: 0 })
  const [done, setDone] = useState(false)
  useRecordFinishedTest({ testId: "work-life-balance", title: "WorkLifeBalanceTest", finished: Boolean(done) });

  function pick(val: number) {
    const q = questions[current]
    const score = q.reversed ? (6 - (val + 1)) : (val + 1)
    const newScores = { ...domainScores, [q.domain]: domainScores[q.domain] + score }
    if (current + 1 >= questions.length) { setDomainScores(newScores); setDone(true) }
    else { setDomainScores(newScores); setCurrent(current + 1) }
  }

  function restart() { setDomainScores({ workDemand: 0, personalTime: 0, recovery: 0, meaning: 0 }); setCurrent(0); setDone(false) }

  function getLevel(total: number): OverallLevel {
    if (total >= 65) return 'balanced'
    if (total >= 50) return 'developing'
    if (total >= 35) return 'strained'
    return 'imbalanced'
  }

  function share() {
    const total = Object.values(domainScores).reduce((s, v) => s + v, 0)
    const level = getLevel(total)
    const url = window.location.href
    const text = `${lb.shareMsg} — ${OVERALL_RESULTS[level][locale].title}`
    if (navigator.share) navigator.share({ title: lb.title, text, url }).catch(() => {})
    else navigator.clipboard.writeText(url).catch(() => {})
  }

  if (!done) {
    const q = questions[current]
    const progress = Math.round((current / questions.length) * 100)
    return (
      /* 문항별 도메인 배지는 Questionnaire 에 슬롯이 없어 subtitle 로 합친다.
         배지를 그냥 버리면 사용자가 보던 정보가 사라진다. */
      <Questionnaire
        title={lb.title}
        subtitle={`${lb.subtitle} · ${lb.domainNames[q.domain]}`}
        question={q.text}
        questionLabel={lb.questionOf(current + 1, questions.length)}
        progress={progress}
        options={lb.scaleLabels.map((label, i) => ({ label, value: i + 1 }))}
        note={lb.note}
        onSelect={(value) => pick(value - 1)}
      />
    )
  }

  const total = Object.values(domainScores).reduce((s, v) => s + v, 0)
  const level = getLevel(total)
  const r = OVERALL_RESULTS[level][locale]
  const maxPerDomain = 20
  const levelColor: Record<OverallLevel, string> = {
    imbalanced: '#ef4444',
    strained: '#f59e0b',
    developing: '#84cc16',
    balanced: '#22c55e',
  }
  const color = levelColor[level]
  const totalPct = Math.round((total / 80) * 100)

  // Find domain needing most attention (lowest score)
  const lowestDomain = (Object.keys(domainScores) as Domain[]).reduce((a, b) => domainScores[a] <= domainScores[b] ? a : b)

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">{lb.yourBalance}</p>
        <div
          className="inline-block rounded-full px-5 py-2 text-xl font-bold text-white"
          style={{ backgroundColor: color }}
          role="status"
          aria-live="polite"
        >
          {r.title}
        </div>
        <p className="font-bold text-muted-foreground">{r.subtitle}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{r.description}</p>
      </div>

      <div className="rounded-2xl border bg-card p-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold">{lb.scoreLabel}</span>
          <span className="text-lg font-bold" style={{ color }}>{total} {lb.outOf}</span>
        </div>
        <div
          className="h-3 rounded-full bg-muted overflow-hidden"
          role="progressbar"
          aria-valuenow={total}
          aria-valuemin={16}
          aria-valuemax={80}
          aria-label={lb.scoreLabel}
        >
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${totalPct}%`, backgroundColor: color }} />
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-4 space-y-3">
        <h3 className="font-bold text-sm">{lb.domainProfile}</h3>
        {(Object.keys(domainScores) as Domain[]).map(domain => {
          const pct = Math.round((domainScores[domain] / maxPerDomain) * 100)
          return (
            <div key={domain} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold" style={{ color: DOMAIN_COLORS[domain] }}>{lb.domainNames[domain]}</span>
                <span>{domainScores[domain]}/{maxPerDomain}</span>
              </div>
              <div
                className="h-2 rounded-full bg-muted overflow-hidden"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={lb.domainNames[domain]}
              >
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: DOMAIN_COLORS[domain] }} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 flex items-center gap-3">
        <span className="text-xs font-bold text-amber-800">{lb.attentionDomain}:</span>
        <span
          className="text-xs font-bold px-2 py-1 rounded-full text-white"
          style={{ backgroundColor: DOMAIN_COLORS[lowestDomain] }}
        >
          {lb.domainNames[lowestDomain]}
        </span>
      </div>

      <div className="rounded-2xl border border-green-200 bg-surface-subtle p-4 space-y-2">
        <h3 className="font-bold text-sm text-green-800">{lb.guidance}</h3>
        <ul className="space-y-1">
          {r.guidance.map((g, i) => (
            <li key={i} className="text-sm text-green-900 flex gap-2">
              <span className="text-green-600 flex-none">→</span>{g}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-center text-xs text-muted-foreground">{lb.note}</p>

      <div className="flex gap-3">
        <button
          onClick={restart}
          aria-label={lb.restart}
          className="flex-1 rounded-xl border bg-card px-4 py-2 text-sm font-bold hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
        >
          {lb.restart}
        </button>
        <button
          onClick={share}
          aria-label={lb.share}
          className="flex-1 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-bold hover:bg-primary-strong transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
        >
          {lb.share}
        </button>
      </div>
      <ShareResultButton locale={lp} heading={lb.title} resultTitle={r.title} />
    </div>
  )
}
