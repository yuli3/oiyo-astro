import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { ScreeningQuestionnaire } from '@/components/ui/screening-questionnaire';
import ResultNextSteps from '../shared/ResultNextSteps';

type SupportedLang = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'
type Level = 'minimal' | 'mild' | 'moderate' | 'severe'

function lang(locale: string): SupportedLang {
  return (['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const).includes(locale as SupportedLang) ? (locale as SupportedLang) : 'en'
}

interface Question { id: string; text: string }
interface ResultData {
  title: string; subtitle: string; description: string
  tips: string[]; resources: string[]; affirmation: string
}

const LABELS: Record<SupportedLang, {
  title: string; subtitle: string; screeningNote: string
  questionOf: (c: number, t: number) => string
  scaleLabels: [string, string, string, string]
  restart: string
  yourLevel: string; tips: string; resources: string
  affirmation: string; scoreLabel: string; outOf: string
  note: string; compassion: string
}> = {
  ko: {
    title: '우울감 자가 점검 (PHQ-9)',
    subtitle: '내 마음 상태 확인하기',
    screeningNote: '이 검사는 선별 도구이며 진단이 아닙니다. 결과와 관계없이 마음이 힘들다면 전문가와 상담하세요.',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['전혀 없음', '며칠 동안', '절반 이상', '거의 매일'],
    restart: '다시 하기',
    yourLevel: '나의 점검 결과',
    tips: '도움이 되는 것들',
    resources: '전문 도움 받기',
    affirmation: '오늘의 메시지',
    scoreLabel: 'PHQ-9 점수',
    outOf: '/ 27점',
    note: '이 결과는 의사나 정신건강 전문가의 진단을 대체하지 않습니다.',
    compassion: '지금 이 검사를 하고 있다는 것 자체가 자신을 돌보려는 용기 있는 행동입니다.',
  },
  en: {
    title: 'Depression Screening (PHQ-9)',
    subtitle: 'Check Your Mental State',
    screeningNote: 'This is a screening tool, not a diagnosis. Whatever your result, please reach out to a professional if you\'re struggling.',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Not at all', 'Several days', 'More than half', 'Nearly every day'],
    restart: 'Retake',
    yourLevel: 'Your Screening Result',
    tips: 'Things That Help',
    resources: 'Get Professional Support',
    affirmation: 'Today\'s Message',
    scoreLabel: 'PHQ-9 Score',
    outOf: '/ 27',
    note: 'These results do not replace diagnosis by a doctor or mental health professional.',
    compassion: 'Taking this screening is itself a courageous act of self-care.',
  },
  ja: {
    title: 'うつ病スクリーニング (PHQ-9)',
    subtitle: '心の状態を確認する',
    screeningNote: 'これはスクリーニングツールであり、診断ではありません。結果に関係なく、辛いと感じたら専門家に相談してください。',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['全くない', '数日間', '半分以上', 'ほぼ毎日'],
    restart: 'もう一度',
    yourLevel: 'スクリーニング結果',
    tips: '役立つこと',
    resources: '専門的サポートを受ける',
    affirmation: '今日のメッセージ',
    scoreLabel: 'PHQ-9スコア',
    outOf: '/ 27点',
    note: 'この結果は医師や精神科専門家の診断に代わるものではありません。',
    compassion: 'このスクリーニングを受けることは、自分を大切にする勇気ある行動です。',
  },
  zh: {
    title: '抑郁情绪自我检查（PHQ-9）',
    subtitle: '看看我的心理状态',
    screeningNote: '本测验是筛查工具，不是诊断。无论结果如何，只要心里难受，就请找专业人士谈谈。',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['完全没有', '有几天', '一半以上的天数', '几乎每天'],
    restart: '重新测验',
    yourLevel: '我的检查结果',
    tips: '有帮助的事',
    resources: '寻求专业帮助',
    affirmation: '今天想对你说',
    scoreLabel: 'PHQ-9 分数',
    outOf: '/ 27 分',
    note: '本结果不能替代医生或精神卫生专业人士的诊断。',
    compassion: '此刻你在做这个检查，本身就是想照顾自己的勇敢之举。',
  },
  fr: {
    title: 'Auto-évaluation de l’humeur dépressive (PHQ-9)',
    subtitle: 'Faire le point sur mon état d’esprit',
    screeningNote: 'Ce test est un outil de dépistage, pas un diagnostic. Quel que soit le résultat, si vous allez mal, parlez-en à un professionnel.',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Jamais', 'Plusieurs jours', 'Plus de la moitié du temps', 'Presque tous les jours'],
    restart: 'Recommencer',
    yourLevel: 'Mon résultat',
    tips: 'Ce qui peut aider',
    resources: 'Obtenir une aide professionnelle',
    affirmation: 'Le message du jour',
    scoreLabel: 'Score PHQ-9',
    outOf: '/ 27 points',
    note: 'Ce résultat ne remplace pas le diagnostic d’un médecin ou d’un professionnel de santé mentale.',
    compassion: 'Faire ce test maintenant est déjà un geste courageux pour prendre soin de vous.',
  },
  es: {
    title: 'Autoevaluación del ánimo depresivo (PHQ-9)',
    subtitle: 'Revisa cómo está tu ánimo',
    screeningNote: 'Este test es una herramienta de cribado, no un diagnóstico. Sea cual sea el resultado, si lo estás pasando mal, habla con un profesional.',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Nunca', 'Varios días', 'Más de la mitad de los días', 'Casi todos los días'],
    restart: 'Repetir',
    yourLevel: 'Mi resultado',
    tips: 'Lo que puede ayudar',
    resources: 'Buscar ayuda profesional',
    affirmation: 'Mensaje de hoy',
    scoreLabel: 'Puntuación PHQ-9',
    outOf: '/ 27 puntos',
    note: 'Este resultado no sustituye el diagnóstico de un médico o de un profesional de salud mental.',
    compassion: 'Hacer este test ahora ya es un gesto valiente para cuidarte.',
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 'q1', text: '일을 하는 것에 대한 흥미나 즐거움이 거의 없다' },
    { id: 'q2', text: '기분이 가라앉거나, 우울하거나, 희망이 없다고 느낀다' },
    { id: 'q3', text: '잠들기 어렵거나, 자주 깨거나, 너무 많이 잔다' },
    { id: 'q4', text: '피곤하거나 에너지가 거의 없다고 느낀다' },
    { id: 'q5', text: '식욕이 거의 없거나 반대로 과식을 한다' },
    { id: 'q6', text: '자신이 나쁜 사람이라고 느끼거나, 자신을 실패자라고 생각하거나, 자신 또는 가족을 실망시켰다고 느낀다' },
    { id: 'q7', text: '신문 읽기나 TV 보기 같은 일상적인 일에 집중하기 어렵다' },
    { id: 'q8', text: '다른 사람들이 알아챌 정도로 움직임이나 말이 느려졌거나, 반대로 너무 안절부절하고 들떠 있다' },
    { id: 'q9', text: '죽는 것이 낫겠다거나 어떤 방식으로든 자해를 하고 싶다는 생각이 든다' },
  ],
  en: [
    { id: 'q1', text: 'Little interest or pleasure in doing things' },
    { id: 'q2', text: 'Feeling down, depressed, or hopeless' },
    { id: 'q3', text: 'Trouble falling or staying asleep, or sleeping too much' },
    { id: 'q4', text: 'Feeling tired or having little energy' },
    { id: 'q5', text: 'Poor appetite or overeating' },
    { id: 'q6', text: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down' },
    { id: 'q7', text: 'Trouble concentrating on things, such as reading or watching TV' },
    { id: 'q8', text: 'Moving or speaking so slowly that other people could have noticed; or the opposite — being so fidgety or restless' },
    { id: 'q9', text: 'Thoughts that you would be better off dead, or of hurting yourself' },
  ],
  ja: [
    { id: 'q1', text: '物事に対する興味や楽しみがほとんどない' },
    { id: 'q2', text: '気分が落ち込んでいる、憂うつ、または絶望的だと感じる' },
    { id: 'q3', text: '眠れない、途中で目が覚める、または眠りすぎる' },
    { id: 'q4', text: '疲れを感じたり、気力がほとんどない' },
    { id: 'q5', text: '食欲がほとんどない、または食べすぎる' },
    { id: 'q6', text: '自分をダメな人間だと思う、または自分や家族を失望させたと感じる' },
    { id: 'q7', text: '読書やテレビを見るなど、物事に集中することが難しい' },
    { id: 'q8', text: '他の人が気付くほど動作や言葉が遅くなった、またはその逆に落ち着きがなくなった' },
    { id: 'q9', text: '死んだほうがましだ、または自分を傷つけたいという気持ちがある' },
  ],
  zh: [
    { id: 'q1', text: '做事时几乎提不起兴趣或乐趣' },
    { id: 'q2', text: '感到心情低落、沮丧或绝望' },
    { id: 'q3', text: '难以入睡、容易醒，或睡得太多' },
    { id: 'q4', text: '感到疲倦或几乎没有精力' },
    { id: 'q5', text: '食欲很差，或反过来吃得太多' },
    { id: 'q6', text: '觉得自己很糟，或觉得自己是个失败者，让自己或家人失望了' },
    { id: 'q7', text: '难以专注于读报、看电视这类日常的事' },
    { id: 'q8', text: '动作或说话慢到别人都能察觉，或者反过来坐立不安、过度躁动' },
    { id: 'q9', text: '有“不如死了好”或想以某种方式伤害自己的念头' },
  ],
  fr: [
    { id: 'q1', text: 'Peu d’intérêt ou de plaisir à faire les choses' },
    { id: 'q2', text: 'Je me sens triste, déprimé ou désespéré' },
    { id: 'q3', text: 'J’ai du mal à m’endormir, je me réveille souvent, ou je dors trop' },
    { id: 'q4', text: 'Je me sens fatigué ou j’ai peu d’énergie' },
    { id: 'q5', text: 'J’ai peu d’appétit, ou au contraire je mange trop' },
    { id: 'q6', text: 'J’ai une mauvaise opinion de moi-même, je me sens nul ou j’ai l’impression d’avoir déçu ma famille ou moi-même' },
    { id: 'q7', text: 'J’ai du mal à me concentrer sur des choses ordinaires comme lire le journal ou regarder la télévision' },
    { id: 'q8', text: 'Je bouge ou parle si lentement que les autres l’ont remarqué, ou au contraire je suis si agité que je bouge plus que d’habitude' },
    { id: 'q9', text: 'Je pense qu’il vaudrait mieux mourir ou envisage de me faire du mal d’une manière ou d’une autre' },
  ],
  es: [
    { id: 'q1', text: 'Poco interés o placer en hacer las cosas' },
    { id: 'q2', text: 'Me siento decaído, deprimido o sin esperanza' },
    { id: 'q3', text: 'Me cuesta dormirme, me despierto a menudo o duermo demasiado' },
    { id: 'q4', text: 'Me siento cansado o con poca energía' },
    { id: 'q5', text: 'Tengo poco apetito o, al contrario, como en exceso' },
    { id: 'q6', text: 'Me siento mal conmigo mismo, siento que soy un fracaso o que he decepcionado a mi familia o a mí mismo' },
    { id: 'q7', text: 'Me cuesta concentrarme en cosas cotidianas como leer el periódico o ver la televisión' },
    { id: 'q8', text: 'Me muevo o hablo tan despacio que otros lo han notado, o al contrario, estoy tan inquieto que me muevo más de lo habitual' },
    { id: 'q9', text: 'Pienso que estaría mejor muerto o en hacerme daño de alguna manera' },
  ],
}

const RESULTS: Record<Level, Record<SupportedLang, ResultData>> = {
  minimal: {
    ko: {
      title: '최소 수준',
      subtitle: '현재 우울감이 최소한으로 나타나고 있습니다',
      description: '지금 이 순간 우울감은 낮은 수준입니다. 하지만 정신 건강은 늘 변할 수 있으며, 힘들 때는 언제든 도움을 구하는 것이 자연스럽고 용감한 일임을 기억하세요.',
      tips: ['규칙적인 수면과 식사 유지하기', '자신에게 친절하게 대하기', '즐거운 활동 꾸준히 하기', '신뢰할 수 있는 사람과 대화하기'],
      resources: ['정신건강 위기상담 전화: 1577-0199', '자살예방상담전화: 109 (24시간)', '정신건강복지센터 방문 상담'],
      affirmation: '지금 잘 지내고 있는 당신을 응원합니다. 자신을 돌보는 것은 언제나 가장 중요한 일입니다.',
    },
    en: {
      title: 'Minimal',
      subtitle: 'Depression symptoms are at a minimal level',
      description: 'Your depression indicators are currently low. Remember that mental health can shift, and reaching out for help is always a natural and courageous act.',
      tips: ['Maintain regular sleep and meals', 'Practice self-compassion', 'Keep enjoyable activities in your life', 'Connect with someone you trust'],
      resources: ['Crisis Text Line: Text HOME to 741741', 'National Suicide Prevention Lifeline: 988', 'Find a therapist: Psychology Today directory'],
      affirmation: 'Checking in with yourself is an act of wisdom. You\'re doing well by taking care of your mental health.',
    },
    ja: {
      title: '最小レベル',
      subtitle: 'うつ症状は最小限です',
      description: '現在うつの指標は低い水準です。心の健康はいつでも変わり得るものです。困ったときは躊躇わず助けを求めることを覚えておいてください。',
      tips: ['規則正しい睡眠と食事を維持する', '自分に優しくする', '楽しい活動を続ける', '信頼できる人と話す'],
      resources: ['こころの健康相談統一ダイヤル: 0570-064-556', 'いのちの電話: 0120-783-556', '精神保健福祉センターへの相談'],
      affirmation: '自分の心の状態を確認することは賢明な行動です。あなたは自分をよく大切にしています。',
    },
    zh: {
      title: '最低程度',
      subtitle: '目前的抑郁情绪很轻微',
      description: '此刻你的抑郁情绪处于低水平。但心理健康随时可能变化，请记得：难受的时候寻求帮助，是自然而勇敢的事。',
      tips: ['保持规律的睡眠和饮食', '善待自己', '持续做让你开心的活动', '和信任的人聊聊'],
      resources: ['全国心理援助热线：12356', '北京心理危机研究与干预中心：010-82951332（24 小时）', '当地精神卫生中心门诊咨询'],
      affirmation: '为现在过得不错的你加油。照顾好自己，永远是最重要的事。',
    },
    fr: {
      title: 'Niveau minimal',
      subtitle: 'L’humeur dépressive est actuellement minimale',
      description: 'En ce moment, votre humeur dépressive est faible. Mais la santé mentale peut toujours évoluer : souvenez-vous que demander de l’aide quand ça va mal est naturel et courageux.',
      tips: ['Garder un sommeil et des repas réguliers', 'Être bienveillant envers soi-même', 'Continuer les activités qui font plaisir', 'Parler à une personne de confiance'],
      resources: ['Numéro national de prévention du suicide : 3114 (24 h/24)', 'SOS Amitié : 09 72 39 40 50', 'Centre médico-psychologique (CMP) de votre secteur'],
      affirmation: 'Nous sommes contents que vous alliez bien. Prendre soin de soi reste toujours le plus important.',
    },
    es: {
      title: 'Nivel mínimo',
      subtitle: 'Tu ánimo depresivo es mínimo por ahora',
      description: 'En este momento tu ánimo depresivo es bajo. Pero la salud mental puede cambiar: recuerda que pedir ayuda cuando lo pasas mal es natural y valiente.',
      tips: ['Mantener horarios regulares de sueño y comidas', 'Tratarte con amabilidad', 'Seguir con actividades que disfrutas', 'Hablar con alguien de confianza'],
      resources: ['Línea de atención a la conducta suicida: 024 (24 h)', 'Teléfono de la Esperanza: 717 003 717', 'Centro de salud mental de tu zona'],
      affirmation: 'Nos alegra que estés bien. Cuidarte siempre es lo más importante.',
    },
  },
  mild: {
    ko: {
      title: '가벼운 범위',
      subtitle: '우울감 선별 점수가 가벼운 범위입니다',
      description: '가벼운 우울감은 매우 흔한 경험입니다. 이 시점에 자신을 돌보는 것이 중요합니다. 증상이 2주 이상 지속된다면 전문가 상담을 고려해보세요.',
      tips: ['하루 30분 이상 햇빛 받으며 걷기', '소셜 미디어 사용 시간 줄이기', '작은 성취감을 줄 수 있는 활동 찾기', '충분한 수면 (7-9시간) 확보하기', '커피와 알코올 줄이기'],
      resources: ['정신건강 위기상담 전화: 1577-0199', '자살예방상담전화: 109 (24시간)', '지역 정신건강복지센터 무료 상담 가능'],
      affirmation: '가벼운 우울감을 느끼는 것은 나약함이 아닙니다. 지금 이 감정을 인식하고 있다는 것만으로도 이미 용감한 첫걸음입니다.',
    },
    en: {
      title: 'Mild Range',
      subtitle: 'Your screening score is in the mild range',
      description: 'Mild depression is a very common experience. This is an important time to tend to yourself. If symptoms persist for more than two weeks, consider speaking with a professional.',
      tips: ['Walk in sunlight for 30+ minutes daily', 'Reduce social media usage', 'Find activities that give small accomplishments', 'Prioritize 7-9 hours of sleep', 'Limit caffeine and alcohol'],
      resources: ['Crisis Text Line: Text HOME to 741741', 'SAMHSA Helpline: 1-800-662-4357', 'Psychology Today therapist finder'],
      affirmation: 'Feeling mildly depressed doesn\'t mean you\'re weak. Noticing this feeling is already the first brave step.',
    },
    ja: {
      title: '軽度の範囲',
      subtitle: 'スクリーニングスコアは軽度の範囲です',
      description: '軽度のうつは非常によくある経験です。今、自分を大切にすることが重要です。症状が2週間以上続く場合は、専門家への相談を検討してください。',
      tips: ['毎日30分以上日光を浴びながら歩く', 'SNSの使用時間を減らす', '小さな達成感を得られる活動を見つける', '7〜9時間の十分な睡眠を確保する', 'カフェインとアルコールを控える'],
      resources: ['こころの健康相談統一ダイヤル: 0570-064-556', 'よりそいホットライン: 0120-279-338', '精神保健福祉センター'],
      affirmation: '軽いうつを感じることは弱さではありません。この感情に気づいていることが、すでに勇気ある最初の一歩です。',
    },
    zh: {
      title: '轻度范围',
      subtitle: '抑郁筛查分数处于轻度范围',
      description: '轻度的抑郁情绪是非常常见的经历。此时照顾好自己很重要。如果症状持续两周以上，可以考虑找专业人士咨询。',
      tips: ['每天在阳光下散步 30 分钟以上', '减少使用社交媒体的时间', '找一些能带来小小成就感的活动', '保证充足睡眠（7–9 小时）', '减少咖啡和酒精'],
      resources: ['全国心理援助热线：12356', '北京心理危机研究与干预中心：010-82951332（24 小时）', '当地精神卫生中心可提供咨询'],
      affirmation: '感到轻度抑郁不是软弱。能察觉到此刻的情绪，已经是勇敢的第一步。',
    },
    fr: {
      title: 'Plage légère',
      subtitle: 'Votre score de dépistage se situe dans la plage légère',
      description: 'Une humeur dépressive légère est une expérience très courante. C’est le moment de prendre soin de vous. Si les symptômes durent plus de deux semaines, envisagez de consulter un professionnel.',
      tips: ['Marcher au moins 30 minutes par jour à la lumière du jour', 'Réduire le temps passé sur les réseaux sociaux', 'Trouver des activités qui donnent un petit sentiment d’accomplissement', 'Dormir suffisamment (7 à 9 heures)', 'Réduire café et alcool'],
      resources: ['Numéro national de prévention du suicide : 3114 (24 h/24)', 'SOS Amitié : 09 72 39 40 50', 'Consultations possibles au CMP de votre secteur (gratuit)'],
      affirmation: 'Ressentir une humeur dépressive légère n’est pas une faiblesse. La reconnaître, c’est déjà un premier pas courageux.',
    },
    es: {
      title: 'Rango leve',
      subtitle: 'Tu puntuación de cribado está en el rango leve',
      description: 'Un ánimo depresivo leve es una experiencia muy común. Ahora es importante cuidarte. Si los síntomas duran más de dos semanas, plantéate consultar a un profesional.',
      tips: ['Caminar al menos 30 minutos al día con luz natural', 'Reducir el tiempo en redes sociales', 'Buscar actividades que den una pequeña sensación de logro', 'Dormir lo suficiente (7–9 horas)', 'Reducir café y alcohol'],
      resources: ['Línea de atención a la conducta suicida: 024 (24 h)', 'Teléfono de la Esperanza: 717 003 717', 'Consulta gratuita en el centro de salud mental de tu zona'],
      affirmation: 'Sentir un ánimo depresivo leve no es debilidad. Darte cuenta de ello ya es un primer paso valiente.',
    },
  },
  moderate: {
    ko: {
      title: '중간 범위',
      subtitle: '전문가의 도움을 받는 것을 권장합니다',
      description: '중등도 우울은 일상 기능에 영향을 미치는 수준입니다. 혼자 견디려 하지 마세요. 전문가의 도움을 받는 것은 매우 용기 있고 현명한 선택입니다.',
      tips: ['가능한 빨리 정신건강 전문가 상담 예약', '신뢰하는 가족이나 친구에게 솔직하게 털어놓기', '하루의 루틴을 최소한으로라도 유지하기', '음식과 수분 섭취에 주의 기울이기'],
      resources: ['정신건강 위기상담 전화: 1577-0199 (24시간)', '자살예방상담전화: 109 (24시간)', '국가 정신건강정보포털: www.mentalhealth.go.kr', '지역 정신건강복지센터 (무료 상담 가능)'],
      affirmation: '도움을 요청하는 것은 약함이 아니라 강함의 표시입니다. 당신은 더 나아질 수 있습니다.',
    },
    en: {
      title: 'Moderate Range',
      subtitle: 'Professional support is strongly recommended',
      description: 'Moderate depression affects daily functioning. Please don\'t try to cope alone. Seeking professional help is a courageous and wise choice.',
      tips: ['Schedule an appointment with a mental health professional as soon as possible', 'Open up to a trusted family member or friend', 'Maintain a minimal daily routine', 'Pay attention to eating and staying hydrated'],
      resources: ['Crisis Text Line: Text HOME to 741741', 'National Suicide Prevention Lifeline: 988', 'SAMHSA Helpline: 1-800-662-4357 (24/7)', 'Open Path Collective (affordable therapy)'],
      affirmation: 'Asking for help is not weakness — it is strength. You can get better.',
    },
    ja: {
      title: '中等度の範囲',
      subtitle: '専門家のサポートを強くお勧めします',
      description: '中等度のうつは日常機能に影響を及ぼすレベルです。一人で耐えようとしないでください。専門家の助けを求めることは非常に勇気ある賢明な選択です。',
      tips: ['できるだけ早く精神科や心療内科に予約を入れる', '信頼できる家族や友人に正直に打ち明ける', '最低限の日課を維持する', '食事と水分摂取に注意する'],
      resources: ['こころの健康相談統一ダイヤル: 0570-064-556', 'いのちの電話: 0120-783-556 (24時間)', 'よりそいホットライン: 0120-279-338', '精神科・心療内科への受診'],
      affirmation: '助けを求めることは弱さではなく強さです。あなたは良くなることができます。',
    },
    zh: {
      title: '中度范围',
      subtitle: '建议寻求专业人士的帮助',
      description: '中度抑郁已经会影响日常功能。请不要独自硬撑。寻求专业帮助是非常勇敢而明智的选择。',
      tips: ['尽快预约精神卫生专业人士', '坦白地向信任的家人或朋友倾诉', '哪怕最低限度，也要维持每天的作息', '注意进食和饮水'],
      resources: ['全国心理援助热线：12356', '北京心理危机研究与干预中心：010-82951332（24 小时）', '当地卫生健康委员会网站可查询精神卫生机构', '当地精神卫生中心（可提供咨询）'],
      affirmation: '求助不是软弱，而是力量的体现。你可以好起来。',
    },
    fr: {
      title: 'Plage modérée',
      subtitle: 'Nous vous conseillons de vous faire aider par un professionnel',
      description: 'Une dépression modérée affecte le fonctionnement quotidien. N’essayez pas de tenir seul. Se faire aider par un professionnel est un choix courageux et sensé.',
      tips: ['Prendre rendez-vous au plus vite avec un professionnel de santé mentale', 'Se confier franchement à un proche de confiance', 'Garder au moins une routine quotidienne minimale', 'Veiller à manger et à boire'],
      resources: ['Numéro national de prévention du suicide : 3114 (24 h/24)', 'SOS Amitié : 09 72 39 40 50', 'Informations sur la santé mentale : www.psycom.org', 'CMP de votre secteur (consultations gratuites)'],
      affirmation: 'Demander de l’aide n’est pas une faiblesse mais une force. Vous pouvez aller mieux.',
    },
    es: {
      title: 'Rango moderado',
      subtitle: 'Te recomendamos buscar ayuda profesional',
      description: 'La depresión moderada afecta al funcionamiento diario. No intentes aguantar a solas. Buscar ayuda profesional es una decisión valiente y sensata.',
      tips: ['Pedir cita cuanto antes con un profesional de salud mental', 'Contárselo con sinceridad a un familiar o amigo de confianza', 'Mantener al menos una rutina diaria mínima', 'Cuidar la comida y la hidratación'],
      resources: ['Línea de atención a la conducta suicida: 024 (24 h)', 'Teléfono de la Esperanza: 717 003 717', 'Confederación Salud Mental España: www.consaludmental.org', 'Centro de salud mental de tu zona (consulta gratuita)'],
      affirmation: 'Pedir ayuda no es debilidad, sino una muestra de fortaleza. Puedes mejorar.',
    },
  },
  severe: {
    ko: {
      title: '높은 범위',
      subtitle: '지금 바로 전문가의 도움을 받으세요',
      description: '지금 당신이 느끼는 것이 정말 힘들 수 있습니다. 이 점수는 진단이 아니지만, 혼자 감당하지 말고 지금 전문가나 위기 지원 서비스에 연락하세요.',
      tips: ['지금 즉시 전문가에게 연락하거나 응급실 방문', '혼자 있지 말고 믿을 수 있는 사람 곁에 있기', '자해나 자살에 대한 생각이 있다면 즉시 위기 전화 이용'],
      resources: ['자살예방상담전화: 109 (24시간, 무료)', '정신건강 위기상담: 1577-0199', '응급: 119 또는 가까운 응급실', '정신건강복지센터 위기 개입 서비스'],
      affirmation: '지금 이 순간 이 검사를 하고 있다는 것은 삶을 향한 당신의 의지입니다. 당신은 혼자가 아닙니다. 도움은 가까이에 있습니다.',
    },
    en: {
      title: 'High Range',
      subtitle: 'Please reach out for help right now',
      description: 'What you are feeling may be very difficult. This score is not a diagnosis, but you do not have to carry this alone. Please contact a professional or crisis support service right now.',
      tips: ['Contact a professional immediately or go to an emergency room', 'Don\'t be alone — stay with someone you trust', 'If you\'re having thoughts of self-harm or suicide, use a crisis line immediately'],
      resources: ['National Suicide Prevention Lifeline: 988 (24/7)', 'Crisis Text Line: Text HOME to 741741', 'Emergency: 911 or nearest ER', 'SAMHSA Helpline: 1-800-662-4357 (24/7)'],
      affirmation: 'The fact that you\'re taking this screening right now shows your will to live. You are not alone. Help is near.',
    },
    ja: {
      title: '高い範囲',
      subtitle: '今すぐ専門家に助けを求めてください',
      description: '今感じていることはとても辛いかもしれません。このスコアは診断ではありませんが、一人で抱え込まず、今すぐ専門家または危機サポートサービスに連絡してください。',
      tips: ['すぐに専門家に連絡するか救急外来を受診する', '一人でいないで、信頼できる人のそばにいる', '自傷や自殺の考えがある場合は今すぐ危機ダイヤルを使う'],
      resources: ['いのちの電話: 0120-783-556 (24時間)', 'よりそいホットライン: 0120-279-338', '緊急: 119または救急外来', '精神科・心療内科への緊急受診'],
      affirmation: '今このスクリーニングを受けていること自体が、生きようとするあなたの意志です。あなたは一人ではありません。助けはすぐそこにあります。',
    },
    zh: {
      title: '高度范围',
      subtitle: '请立即寻求专业人士的帮助',
      description: '你现在的感受可能真的很难熬。这个分数不是诊断，但请不要独自承受，现在就联系专业人士或危机支援服务。',
      tips: ['立即联系专业人士，或前往急诊', '不要独处，待在可信任的人身边', '如果有自伤或轻生的念头，请立即拨打危机热线'],
      resources: ['全国心理援助热线：12356（24 小时）', '北京心理危机研究与干预中心：010-82951332', '急救：120，或前往最近的医院急诊', '当地精神卫生中心的危机干预服务'],
      affirmation: '此刻你在做这个检查，就是你想活下去的意志。你不是一个人，帮助就在身边。',
    },
    fr: {
      title: 'Plage élevée',
      subtitle: 'Faites-vous aider par un professionnel dès maintenant',
      description: 'Ce que vous ressentez peut être vraiment très dur. Ce score n’est pas un diagnostic, mais ne portez pas cela seul : contactez dès maintenant un professionnel ou un service d’aide en situation de crise.',
      tips: ['Contacter tout de suite un professionnel ou se rendre aux urgences', 'Ne pas rester seul : rester auprès d’une personne de confiance', 'En cas de pensées d’automutilation ou de suicide, appeler immédiatement une ligne de crise'],
      resources: ['Numéro national de prévention du suicide : 3114 (24 h/24, gratuit)', 'SOS Amitié : 09 72 39 40 50', 'Urgences : 15 ou 112, ou le service d’urgences le plus proche', 'Cellules d’urgence médico-psychologique et CMP de votre secteur'],
      affirmation: 'Faire ce test en ce moment, c’est la preuve de votre volonté de vivre. Vous n’êtes pas seul. L’aide est tout près.',
    },
    es: {
      title: 'Rango alto',
      subtitle: 'Busca ayuda profesional ahora mismo',
      description: 'Lo que sientes ahora puede ser muy duro. Esta puntuación no es un diagnóstico, pero no cargues con ello a solas: contacta ya con un profesional o un servicio de atención en crisis.',
      tips: ['Contactar ya con un profesional o acudir a urgencias', 'No quedarte a solas: estar con alguien de confianza', 'Si tienes pensamientos de hacerte daño o de suicidio, llama de inmediato a una línea de crisis'],
      resources: ['Línea de atención a la conducta suicida: 024 (24 h, gratuita)', 'Teléfono de la Esperanza: 717 003 717', 'Emergencias: 112 o el servicio de urgencias más cercano', 'Atención en crisis de tu centro de salud mental'],
      affirmation: 'Hacer este test en este momento muestra tu voluntad de vivir. No estás solo. La ayuda está cerca.',
    },
  },
}

interface Props { locale?: string }

export default function DepressionScreeningTest({ locale: lp = 'ko' }: Props) {
  const locale = lang(lp ?? 'ko')
  const lb = LABELS[locale]
  const questions = QUESTIONS[locale]

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [result, setResult] = useState<{ level: Level; score: number } | null>(null)
  useRecordFinishedTest({ testId: "depression-screening", title: "DepressionScreeningTest", finished: Boolean(result) });

  function calcResult(ans: number[]): { level: Level; score: number } {
    const score = ans.reduce((s, v) => s + v, 0)
    const level: Level = score >= 15 ? 'severe' : score >= 10 ? 'moderate' : score >= 5 ? 'mild' : 'minimal'
    return { level, score }
  }

  function pick(val: number) {
    const newAns = [...answers, val]
    if (current + 1 >= questions.length) setResult(calcResult(newAns))
    setAnswers(newAns)
    setCurrent(current + 1)
  }

  function restart() { setAnswers([]); setCurrent(0); setResult(null) }

  const finished = current >= questions.length

  if (!finished) {
    const q = questions[current]
    const progress = Math.round((current / questions.length) * 100)
    return (
      <ScreeningQuestionnaire
        title={lb.title}
        subtitle={lb.subtitle}
        question={q.text}
        questionLabel={lb.questionOf(current + 1, questions.length)}
        progress={progress}
        options={lb.scaleLabels.map((label, value) => ({ label, value }))}
        screeningNote={lb.screeningNote}
        supportMessage={lb.compassion}
        onSelect={pick}
      />
    )
  }

  if (!result) return null
  const r = RESULTS[result.level][locale]
  const pct = Math.round((result.score / 27) * 100)
  const levelColors: Record<Level, string> = {
    minimal: '#22c55e',
    mild: '#84cc16',
    moderate: '#f59e0b',
    severe: '#ef4444',
  }
  const levelColor = levelColors[result.level]

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">{lb.yourLevel}</p>
        <div className="inline-block rounded-2xl px-5 py-2 text-xl font-bold text-white" style={{ backgroundColor: levelColor }}>{r.title}</div>
        <p className="font-medium text-muted-foreground">{r.subtitle}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{r.description}</p>
      </div>
      <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
        {lb.screeningNote}
      </p>
      <div className="rounded-xl border bg-card p-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{lb.scoreLabel}</span>
          <span className="text-lg font-bold" style={{ color: levelColor }}>{result.score} {lb.outOf}</span>
        </div>
        <div
          className="h-3 rounded-full bg-muted overflow-hidden"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={lb.scoreLabel}
        >
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: levelColor }} />
        </div>
      </div>
      <div className="rounded-xl border bg-card p-4 space-y-2">
        <h3 className="font-bold text-sm text-green-700">{lb.tips}</h3>
        <ul className="space-y-1">
          {r.tips.map(tip => (
            <li key={tip} className="text-sm text-muted-foreground flex gap-2">
              <span className="text-green-500 flex-none">→</span>{tip}
            </li>
          ))}
        </ul>
      </div>
      {(result.level === 'moderate' || result.level === 'severe') && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-2">
          <h3 className="font-bold text-sm text-red-700">{lb.resources}</h3>
          <ul className="space-y-1">
            {r.resources.map(res => (
              <li key={res} className="text-sm text-red-700 flex gap-2">
                <span className="flex-none">•</span>{res}
              </li>
            ))}
          </ul>
        </div>
      )}
      {(result.level === 'minimal' || result.level === 'mild') && (
        <div className="rounded-xl border border-green-200 bg-surface-subtle p-4 space-y-1">
          <h3 className="font-bold text-sm text-green-700">{lb.resources}</h3>
          <ul className="space-y-1">
            {r.resources.map(res => (
              <li key={res} className="text-sm text-green-700 flex gap-2">
                <span className="flex-none">•</span>{res}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-1">
        <h3 className="font-bold text-sm text-primary">{lb.affirmation}</h3>
        <p className="text-sm leading-relaxed">"{r.affirmation}"</p>
      </div>
      <p className="text-center text-xs text-muted-foreground">{lb.note}</p>
      <ResultNextSteps
        locale={locale}
        links={[
          { href: `/${locale}/breathing/timer/`, label: (({ ko: '🫁 호흡 타이머', en: '🫁 Breathing timer', ja: '🫁 呼吸タイマー', zh: '🫁 呼吸计时器', fr: '🫁 Minuteur de respiration', es: '🫁 Temporizador de respiración' } as Record<string, string>)[locale] ?? '🫁 Breathing timer') },
          { href: `/${locale}/self-esteem/test/`, label: (({ ko: '🌿 자존감 테스트', en: '🌿 Self-esteem test', ja: '🌿 自尊感情テスト', zh: '🌿 自尊测验', fr: '🌿 Test d’estime de soi', es: '🌿 Test de autoestima' } as Record<string, string>)[locale] ?? '🌿 Self-esteem test') },
          { href: `/${locale}/inner-strength/test/`, label: (({ ko: '🧠 내면 강점 테스트', en: '🧠 Inner strength test', ja: '🧠 内面の強さテスト', zh: '🧠 内在力量测验', fr: '🧠 Test de force intérieure', es: '🧠 Test de fuerza interior' } as Record<string, string>)[locale] ?? '🧠 Inner strength test') },
        ]}
      />
      <button
        onClick={restart}
        aria-label={lb.restart}
        className="w-full rounded-xl border bg-card px-4 py-2 text-sm font-bold hover:bg-accent transition-colors"
      >
        {lb.restart}
      </button>
    </div>
  )
}
