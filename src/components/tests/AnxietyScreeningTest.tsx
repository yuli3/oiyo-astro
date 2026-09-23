import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { ScreeningQuestionnaire } from '@/components/ui/screening-questionnaire';
import ShareResultButton from '../shared/ShareResultButton';
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
  restart: string; share: string; shareMsg: string
  yourLevel: string; tips: string; resources: string
  affirmation: string; scoreLabel: string; outOf: string
  note: string; compassion: string
}> = {
  ko: {
    title: '불안감 자가 점검 (GAD-7)',
    subtitle: '내 불안 수준 확인하기',
    screeningNote: '이 검사는 선별 도구이며 진단이 아닙니다. 불안이 일상을 방해한다면 전문가와 상담하세요.',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['전혀 없음', '며칠 동안', '절반 이상', '거의 매일'],
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '나의 불안 점검 결과',
    yourLevel: '나의 점검 결과',
    tips: '불안 완화에 도움이 되는 것들',
    resources: '전문 도움 받기',
    affirmation: '오늘의 메시지',
    scoreLabel: 'GAD-7 점수',
    outOf: '/ 21점',
    note: '이 결과는 의사나 정신건강 전문가의 진단을 대체하지 않습니다.',
    compassion: '불안을 느끼는 것은 매우 자연스러운 인간의 경험입니다. 지금 이 검사를 하는 것은 자신을 이해하려는 용감한 행동입니다.',
  },
  en: {
    title: 'Anxiety Screening (GAD-7)',
    subtitle: 'Check Your Anxiety Level',
    screeningNote: 'This is a screening tool, not a diagnosis. If anxiety is interfering with daily life, please consult a professional.',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Not at all', 'Several days', 'More than half', 'Nearly every day'],
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My anxiety screening result',
    yourLevel: 'Your Screening Result',
    tips: 'Things That Help With Anxiety',
    resources: 'Get Professional Support',
    affirmation: 'Today\'s Message',
    scoreLabel: 'GAD-7 Score',
    outOf: '/ 21',
    note: 'These results do not replace diagnosis by a doctor or mental health professional.',
    compassion: 'Feeling anxious is a very natural human experience. Taking this screening is a brave act of self-understanding.',
  },
  ja: {
    title: '不安スクリーニング (GAD-7)',
    subtitle: '不安レベルを確認する',
    screeningNote: 'これはスクリーニングツールであり、診断ではありません。不安が日常生活に支障をきたす場合は専門家に相談してください。',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['全くない', '数日間', '半分以上', 'ほぼ毎日'],
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '不安スクリーニングの結果',
    yourLevel: 'スクリーニング結果',
    tips: '不安を和らげるのに役立つこと',
    resources: '専門的サポートを受ける',
    affirmation: '今日のメッセージ',
    scoreLabel: 'GAD-7スコア',
    outOf: '/ 21点',
    note: 'この結果は医師や精神科専門家の診断に代わるものではありません。',
    compassion: '不安を感じることは非常に自然な人間の経験です。このスクリーニングを受けることは、自分を理解しようとする勇気ある行動です。',
  },
  zh: {
    title: '焦虑自我检查（GAD-7）',
    subtitle: '看看我的焦虑程度',
    screeningNote: '本测验是筛查工具，不是诊断。若焦虑影响到日常生活，请找专业人士咨询。',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['完全没有', '有几天', '一半以上的天数', '几乎每天'],
    restart: '重新测验',
    share: '分享结果',
    shareMsg: '我的焦虑检查结果',
    yourLevel: '我的检查结果',
    tips: '有助于缓解焦虑的方法',
    resources: '寻求专业帮助',
    affirmation: '今天想对你说',
    scoreLabel: 'GAD-7 分数',
    outOf: '/ 21 分',
    note: '本结果不能替代医生或精神卫生专业人士的诊断。',
    compassion: '感到焦虑是非常自然的人类经验。现在做这个检查，是想了解自己的勇敢之举。',
  },
  fr: {
    title: 'Auto-évaluation de l’anxiété (GAD-7)',
    subtitle: 'Évaluer mon niveau d’anxiété',
    screeningNote: 'Ce test est un outil de dépistage, pas un diagnostic. Si l’anxiété perturbe votre quotidien, parlez-en à un professionnel.',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Jamais', 'Plusieurs jours', 'Plus de la moitié du temps', 'Presque tous les jours'],
    restart: 'Recommencer',
    share: 'Partager le résultat',
    shareMsg: 'Mon résultat d’auto-évaluation de l’anxiété',
    yourLevel: 'Mon résultat',
    tips: 'Ce qui aide à apaiser l’anxiété',
    resources: 'Obtenir une aide professionnelle',
    affirmation: 'Le message du jour',
    scoreLabel: 'Score GAD-7',
    outOf: '/ 21 points',
    note: 'Ce résultat ne remplace pas le diagnostic d’un médecin ou d’un professionnel de santé mentale.',
    compassion: 'Ressentir de l’anxiété est une expérience humaine tout à fait naturelle. Faire ce test, c’est déjà un geste courageux pour mieux vous comprendre.',
  },
  es: {
    title: 'Autoevaluación de la ansiedad (GAD-7)',
    subtitle: 'Conoce tu nivel de ansiedad',
    screeningNote: 'Este test es una herramienta de cribado, no un diagnóstico. Si la ansiedad interfiere en tu día a día, consulta a un profesional.',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Nunca', 'Varios días', 'Más de la mitad de los días', 'Casi todos los días'],
    restart: 'Repetir',
    share: 'Compartir resultado',
    shareMsg: 'Mi resultado de la autoevaluación de ansiedad',
    yourLevel: 'Mi resultado',
    tips: 'Lo que ayuda a calmar la ansiedad',
    resources: 'Buscar ayuda profesional',
    affirmation: 'Mensaje de hoy',
    scoreLabel: 'Puntuación GAD-7',
    outOf: '/ 21 puntos',
    note: 'Este resultado no sustituye el diagnóstico de un médico o de un profesional de salud mental.',
    compassion: 'Sentir ansiedad es una experiencia humana muy natural. Hacer este test ya es un gesto valiente para entenderte mejor.',
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 'q1', text: '초조하거나, 불안하거나, 또는 과도하게 긴장된 느낌이 든다' },
    { id: 'q2', text: '걱정을 멈추거나 조절하기 어렵다' },
    { id: 'q3', text: '다양한 일들에 대해 과도하게 걱정한다' },
    { id: 'q4', text: '긴장을 풀거나 편안하게 있기가 어렵다' },
    { id: 'q5', text: '안절부절 못하거나 가만히 있지 못할 정도로 불안하다' },
    { id: 'q6', text: '짜증이 나거나 쉽게 화가 난다' },
    { id: 'q7', text: '무언가 끔찍한 일이 일어날 것 같은 두려움이 든다' },
  ],
  en: [
    { id: 'q1', text: 'Feeling nervous, anxious, or on edge' },
    { id: 'q2', text: 'Not being able to stop or control worrying' },
    { id: 'q3', text: 'Worrying too much about different things' },
    { id: 'q4', text: 'Trouble relaxing' },
    { id: 'q5', text: 'Being so restless that it\'s hard to sit still' },
    { id: 'q6', text: 'Becoming easily annoyed or irritable' },
    { id: 'q7', text: 'Feeling afraid, as if something awful might happen' },
  ],
  ja: [
    { id: 'q1', text: 'そわそわしたり、不安になったり、過度に緊張している' },
    { id: 'q2', text: '心配するのをやめたり、コントロールしたりするのが難しい' },
    { id: 'q3', text: 'さまざまなことについて過度に心配している' },
    { id: 'q4', text: 'リラックスしたり、落ち着いたりするのが難しい' },
    { id: 'q5', text: 'じっとしていられないほど落ち着きがない' },
    { id: 'q6', text: 'イライラしたり、怒りっぽくなっている' },
    { id: 'q7', text: '何か恐ろしいことが起きそうな恐怖を感じる' },
  ],
  zh: [
    { id: 'q1', text: '感到紧张、不安或过度绷紧' },
    { id: 'q2', text: '无法停止或控制担忧' },
    { id: 'q3', text: '对各种各样的事情过度担忧' },
    { id: 'q4', text: '很难放松下来' },
    { id: 'q5', text: '坐立不安，焦虑到无法静下来' },
    { id: 'q6', text: '容易烦躁或发火' },
    { id: 'q7', text: '感到好像有什么可怕的事要发生' },
  ],
  fr: [
    { id: 'q1', text: 'Je me sens nerveux, anxieux ou très tendu' },
    { id: 'q2', text: 'Je n’arrive pas à arrêter ou à contrôler mes inquiétudes' },
    { id: 'q3', text: 'Je m’inquiète trop à propos de différentes choses' },
    { id: 'q4', text: 'J’ai du mal à me détendre' },
    { id: 'q5', text: 'Je suis si agité que j’ai du mal à tenir en place' },
    { id: 'q6', text: 'Je deviens facilement contrarié ou irritable' },
    { id: 'q7', text: 'J’ai peur que quelque chose de terrible arrive' },
  ],
  es: [
    { id: 'q1', text: 'Me siento nervioso, ansioso o muy tenso' },
    { id: 'q2', text: 'No puedo dejar de preocuparme ni controlar la preocupación' },
    { id: 'q3', text: 'Me preocupo demasiado por distintas cosas' },
    { id: 'q4', text: 'Me cuesta relajarme' },
    { id: 'q5', text: 'Estoy tan inquieto que me cuesta quedarme quieto' },
    { id: 'q6', text: 'Me enfado o me irrito con facilidad' },
    { id: 'q7', text: 'Siento miedo de que vaya a pasar algo terrible' },
  ],
}

const RESULTS: Record<Level, Record<SupportedLang, ResultData>> = {
  minimal: {
    ko: {
      title: '최소 수준',
      subtitle: '불안 수준이 정상 범위 내에 있습니다',
      description: '현재 불안 수준은 낮습니다. 일상적인 긴장과 불안은 삶의 자연스러운 부분이며, 지금은 잘 조절되고 있는 것으로 보입니다.',
      tips: ['규칙적인 신체 활동 유지하기', '마음 챙김 또는 깊은 호흡 연습', '충분한 수면 확보하기', '카페인 섭취량 적절히 조절하기'],
      resources: ['정신건강 위기상담: 1577-0199', '자살예방상담전화: 109', '정신건강복지센터 방문 상담'],
      affirmation: '일상의 불안을 잘 관리하고 있습니다. 자신에게 친절하게 대하는 것을 잊지 마세요.',
    },
    en: {
      title: 'Minimal',
      subtitle: 'Anxiety is within a normal range',
      description: 'Your anxiety level is currently low. Everyday tension and worry are natural parts of life, and yours appears well-managed right now.',
      tips: ['Maintain regular physical activity', 'Practice mindfulness or deep breathing', 'Prioritize quality sleep', 'Monitor caffeine intake'],
      resources: ['Crisis Text Line: Text HOME to 741741', 'SAMHSA Helpline: 1-800-662-4357', 'Psychology Today therapist finder'],
      affirmation: 'You\'re managing everyday anxiety well. Remember to be kind to yourself.',
    },
    ja: {
      title: '最小レベル',
      subtitle: '不安は正常な範囲内です',
      description: '現在の不安レベルは低いです。日常的な緊張や心配は人生の自然な部分であり、今はうまく管理されているようです。',
      tips: ['定期的な身体活動を維持する', 'マインドフルネスや深呼吸を練習する', '質の良い睡眠を確保する', 'カフェインの摂取量を管理する'],
      resources: ['こころの健康相談統一ダイヤル: 0570-064-556', 'よりそいホットライン: 0120-279-338', '精神保健福祉センター'],
      affirmation: '日常の不安をうまく管理しています。自分に優しくすることを忘れないでください。',
    },
    zh: {
      title: '最低程度',
      subtitle: '焦虑程度在正常范围内',
      description: '目前的焦虑程度很低。日常的紧张与不安是生活的自然部分，现在看起来调节得很好。',
      tips: ['保持规律的身体活动', '练习正念或深呼吸', '保证充足睡眠', '适度控制咖啡因摄入'],
      resources: ['全国心理援助热线：12356', '北京心理危机研究与干预中心：010-82951332', '当地精神卫生中心门诊咨询'],
      affirmation: '你把日常的焦虑管理得很好。别忘了善待自己。',
    },
    fr: {
      title: 'Niveau minimal',
      subtitle: 'Votre anxiété se situe dans la plage normale',
      description: 'Votre niveau d’anxiété est faible. Les tensions et inquiétudes du quotidien font naturellement partie de la vie, et elles semblent bien régulées en ce moment.',
      tips: ['Maintenir une activité physique régulière', 'Pratiquer la pleine conscience ou la respiration profonde', 'Dormir suffisamment', 'Modérer la caféine'],
      resources: ['Numéro national de prévention du suicide : 3114', 'SOS Amitié : 09 72 39 40 50', 'Centre médico-psychologique (CMP) de votre secteur'],
      affirmation: 'Vous gérez bien l’anxiété du quotidien. N’oubliez pas d’être bienveillant envers vous-même.',
    },
    es: {
      title: 'Nivel mínimo',
      subtitle: 'Tu ansiedad está dentro del rango normal',
      description: 'Tu nivel de ansiedad es bajo. La tensión y la preocupación cotidianas son parte natural de la vida, y ahora parecen bien reguladas.',
      tips: ['Mantener actividad física regular', 'Practicar atención plena o respiración profunda', 'Dormir lo suficiente', 'Moderar la cafeína'],
      resources: ['Línea de atención a la conducta suicida: 024', 'Teléfono de la Esperanza: 717 003 717', 'Centro de salud mental de tu zona'],
      affirmation: 'Estás gestionando bien la ansiedad cotidiana. No olvides tratarte con amabilidad.',
    },
  },
  mild: {
    ko: {
      title: '가벼운 불안',
      subtitle: '불안이 가끔 일상에 영향을 미치고 있습니다',
      description: '가벼운 불안은 매우 흔하며 여러 가지 방법으로 관리할 수 있습니다. 증상이 2주 이상 지속된다면 전문가 상담을 고려해보세요.',
      tips: ['복식 호흡: 4초 들이쉬고, 4초 참고, 6초 내쉬기', '점진적 근육 이완법 연습하기', '규칙적인 운동 (특히 유산소)', '걱정 일기 쓰기로 생각 정리하기', '수면 루틴 확립하기'],
      resources: ['정신건강 위기상담: 1577-0199', '자살예방상담전화: 109', '지역 정신건강복지센터 무료 상담'],
      affirmation: '불안은 당신이 무언가를 소중히 여기고 있다는 신호이기도 합니다. 자신을 판단하지 말고, 친구를 대하듯 자신에게 친절하세요.',
    },
    en: {
      title: 'Mild Anxiety',
      subtitle: 'Anxiety occasionally affects your daily life',
      description: 'Mild anxiety is very common and manageable. If symptoms persist for more than two weeks, consider speaking with a professional.',
      tips: ['Box breathing: inhale 4s, hold 4s, exhale 6s', 'Practice progressive muscle relaxation', 'Regular aerobic exercise', 'Keep a worry journal to organize thoughts', 'Establish a consistent sleep routine'],
      resources: ['Crisis Text Line: Text HOME to 741741', 'SAMHSA Helpline: 1-800-662-4357', 'Psychology Today therapist finder'],
      affirmation: 'Anxiety can also be a signal that you care deeply about something. Don\'t judge yourself — treat yourself with the kindness you\'d give a friend.',
    },
    ja: {
      title: '軽度の不安',
      subtitle: '不安が時々日常生活に影響を与えています',
      description: '軽度の不安は非常に一般的で、様々な方法で管理できます。症状が2週間以上続く場合は、専門家への相談を検討してください。',
      tips: ['腹式呼吸: 4秒吸って、4秒止めて、6秒吐く', '漸進的筋弛緩法を練習する', '定期的な有酸素運動', '心配日記で思考を整理する', '一貫した睡眠ルーティンを確立する'],
      resources: ['こころの健康相談統一ダイヤル: 0570-064-556', 'よりそいホットライン: 0120-279-338', '精神保健福祉センター'],
      affirmation: '不安はあなたが何かを大切にしているサインでもあります。自分を責めず、友達に接するように自分に優しくしてください。',
    },
    zh: {
      title: '轻度焦虑',
      subtitle: '焦虑有时会影响日常生活',
      description: '轻度焦虑非常常见，可以用多种方法管理。如果症状持续两周以上，可以考虑找专业人士咨询。',
      tips: ['腹式呼吸：吸气 4 秒、屏住 4 秒、呼气 6 秒', '练习渐进式肌肉放松', '规律运动（尤其是有氧运动）', '写担忧日记，整理思绪', '建立睡眠习惯'],
      resources: ['全国心理援助热线：12356', '北京心理危机研究与干预中心：010-82951332', '当地精神卫生中心门诊咨询'],
      affirmation: '焦虑也是你珍视某些东西的信号。别评判自己，像对待朋友一样善待自己。',
    },
    fr: {
      title: 'Anxiété légère',
      subtitle: 'L’anxiété affecte parfois votre quotidien',
      description: 'L’anxiété légère est très fréquente et se gère de plusieurs façons. Si les symptômes durent plus de deux semaines, envisagez de consulter un professionnel.',
      tips: ['Respiration abdominale : inspirer 4 s, retenir 4 s, expirer 6 s', 'Pratiquer la relaxation musculaire progressive', 'Faire de l’exercice régulièrement (surtout d’endurance)', 'Tenir un journal des inquiétudes pour clarifier ses pensées', 'Instaurer une routine de sommeil'],
      resources: ['Numéro national de prévention du suicide : 3114', 'SOS Amitié : 09 72 39 40 50', 'Centre médico-psychologique (CMP) de votre secteur'],
      affirmation: 'L’anxiété signale aussi que quelque chose compte pour vous. Ne vous jugez pas : soyez bienveillant envers vous-même comme envers un ami.',
    },
    es: {
      title: 'Ansiedad leve',
      subtitle: 'La ansiedad afecta a veces a tu día a día',
      description: 'La ansiedad leve es muy común y se puede manejar de varias formas. Si los síntomas duran más de dos semanas, plantéate consultar a un profesional.',
      tips: ['Respiración abdominal: inhala 4 s, retén 4 s, exhala 6 s', 'Practicar la relajación muscular progresiva', 'Hacer ejercicio con regularidad (sobre todo aeróbico)', 'Escribir un diario de preocupaciones para ordenar las ideas', 'Establecer una rutina de sueño'],
      resources: ['Línea de atención a la conducta suicida: 024', 'Teléfono de la Esperanza: 717 003 717', 'Centro de salud mental de tu zona'],
      affirmation: 'La ansiedad también indica que algo te importa. No te juzgues: trátate con la amabilidad con que tratarías a un amigo.',
    },
  },
  moderate: {
    ko: {
      title: '중등도 불안',
      subtitle: '전문가의 도움을 받는 것을 권장합니다',
      description: '중등도 불안은 일상 기능에 상당한 영향을 미치고 있습니다. 인지행동치료(CBT)나 약물치료가 효과적일 수 있습니다. 혼자 감당하려 하지 마세요.',
      tips: ['가능한 빨리 정신건강 전문가 상담 예약하기', 'CBT 기반 자조 앱 활용 (예: Woebot, Headspace)', '카페인, 알코올, 과도한 뉴스 소비 줄이기', '매일 같은 시간에 자고 일어나기'],
      resources: ['정신건강 위기상담: 1577-0199 (24시간)', '자살예방상담전화: 109', '국가 정신건강정보포털: www.mentalhealth.go.kr', '지역 정신건강복지센터 (무료 상담)'],
      affirmation: '도움을 구하는 것은 용기 있는 행동입니다. 불안은 치료 가능하며, 당신은 더 편안해질 수 있습니다.',
    },
    en: {
      title: 'Moderate Anxiety',
      subtitle: 'Professional support is strongly recommended',
      description: 'Moderate anxiety is significantly affecting your daily functioning. CBT (cognitive behavioral therapy) or medication may help. You don\'t have to manage this alone.',
      tips: ['Schedule an appointment with a mental health professional soon', 'Try CBT-based self-help apps (e.g., Woebot, Headspace)', 'Reduce caffeine, alcohol, and excessive news consumption', 'Wake and sleep at consistent times daily'],
      resources: ['Crisis Text Line: Text HOME to 741741', 'SAMHSA Helpline: 1-800-662-4357 (24/7)', 'Anxiety and Depression Association of America: adaa.org', 'Open Path Collective (affordable therapy)'],
      affirmation: 'Seeking help is courageous. Anxiety is treatable, and you can feel more at ease.',
    },
    ja: {
      title: '中等度の不安',
      subtitle: '専門家のサポートを強くお勧めします',
      description: '中等度の不安は日常機能に相当な影響を与えています。認知行動療法（CBT）や薬物療法が効果的な場合があります。一人で抱え込まないでください。',
      tips: ['できるだけ早く精神科や心療内科に予約を入れる', 'CBTベースのアプリを活用する', 'カフェイン、アルコール、過剰なニュース消費を減らす', '毎日同じ時間に寝起きする'],
      resources: ['こころの健康相談統一ダイヤル: 0570-064-556', 'よりそいホットライン: 0120-279-338 (24時間)', '精神保健福祉センター', '精神科・心療内科への受診'],
      affirmation: '助けを求めることは勇気ある行動です。不安は治療可能で、あなたはより楽に感じることができます。',
    },
    zh: {
      title: '中度焦虑',
      subtitle: '建议寻求专业人士的帮助',
      description: '中度焦虑已经明显影响日常功能。认知行为疗法（CBT）或药物治疗可能有效。请不要独自承受。',
      tips: ['尽快预约精神卫生专业人士', '使用基于 CBT 的自助应用（如 Woebot、Headspace）', '减少咖啡因、酒精和过量的新闻', '每天在同一时间睡觉和起床'],
      resources: ['全国心理援助热线：12356', '北京心理危机研究与干预中心：010-82951332（24 小时）', '全国精神卫生中心名录可在当地卫生健康委员会网站查询', '当地精神卫生中心门诊咨询'],
      affirmation: '寻求帮助是勇敢的行动。焦虑是可以治疗的，你可以变得更轻松。',
    },
    fr: {
      title: 'Anxiété modérée',
      subtitle: 'Nous vous conseillons de vous faire aider par un professionnel',
      description: 'L’anxiété modérée pèse nettement sur le fonctionnement quotidien. Les thérapies cognitivo-comportementales (TCC) ou un traitement médicamenteux peuvent être efficaces. N’essayez pas d’y faire face seul.',
      tips: ['Prendre rendez-vous au plus vite avec un professionnel de santé mentale', 'Utiliser une application d’auto-aide fondée sur les TCC (ex. Woebot, Headspace)', 'Réduire caféine, alcool et consommation excessive d’actualités', 'Se coucher et se lever chaque jour à la même heure'],
      resources: ['Numéro national de prévention du suicide : 3114 (24 h/24)', 'SOS Amitié : 09 72 39 40 50', 'Informations sur la santé mentale : www.psycom.org', 'Centre médico-psychologique (CMP) de votre secteur (gratuit)'],
      affirmation: 'Demander de l’aide est un acte courageux. L’anxiété se soigne, et vous pouvez vous sentir mieux.',
    },
    es: {
      title: 'Ansiedad moderada',
      subtitle: 'Te recomendamos buscar ayuda profesional',
      description: 'La ansiedad moderada afecta de forma notable a tu funcionamiento diario. La terapia cognitivo-conductual (TCC) o la medicación pueden ser eficaces. No intentes cargar con ello a solas.',
      tips: ['Pedir cita cuanto antes con un profesional de salud mental', 'Usar una app de autoayuda basada en TCC (p. ej., Woebot, Headspace)', 'Reducir cafeína, alcohol y el exceso de noticias', 'Acostarte y levantarte cada día a la misma hora'],
      resources: ['Línea de atención a la conducta suicida: 024 (24 h)', 'Teléfono de la Esperanza: 717 003 717', 'Confederación Salud Mental España: www.consaludmental.org', 'Centro de salud mental de tu zona (gratuito)'],
      affirmation: 'Pedir ayuda es un acto valiente. La ansiedad tiene tratamiento y puedes llegar a sentirte mejor.',
    },
  },
  severe: {
    ko: {
      title: '심각한 수준',
      subtitle: '지금 바로 전문가의 도움을 받으세요',
      description: '심각한 불안은 삶의 질에 크게 영향을 미치고 있습니다. 이는 의학적 치료가 필요한 상태입니다. 전문가의 도움을 통해 반드시 나아질 수 있습니다.',
      tips: ['지금 즉시 정신건강 전문가에게 연락하거나 응급실 방문', '패닉 어택이 심각하다면 즉시 응급 지원 요청', '혼자 있지 말고 믿을 수 있는 사람 곁에 있기'],
      resources: ['정신건강 위기상담: 1577-0199 (24시간)', '자살예방상담전화: 109', '응급: 119 또는 가까운 응급실'],
      affirmation: '극심한 불안을 느끼고 있는 지금도, 당신은 혼자가 아닙니다. 도움을 요청하는 것은 약함이 아닌 강함입니다.',
    },
    en: {
      title: 'Severe',
      subtitle: 'Please reach out for professional help now',
      description: 'Severe anxiety is significantly impacting your quality of life. This requires professional medical support. Help is available and you can get better.',
      tips: ['Contact a mental health professional immediately or go to an ER', 'If panic attacks are severe, seek emergency support', 'Don\'t be alone — stay with someone you trust'],
      resources: ['Crisis Text Line: Text HOME to 741741', 'National Anxiety Hotline: 1-800-522-4700', 'Emergency: 911 or nearest ER', 'SAMHSA Helpline: 1-800-662-4357 (24/7)'],
      affirmation: 'Even in the grip of severe anxiety, you are not alone. Asking for help is not weakness — it is strength.',
    },
    ja: {
      title: '重篤なレベル',
      subtitle: '今すぐ専門家に助けを求めてください',
      description: '重度の不安は生活の質に大きく影響しています。専門的な医療支援が必要な状態です。助けは必ずあり、あなたは良くなることができます。',
      tips: ['今すぐ精神科に連絡するか救急外来を受診する', 'パニック発作が深刻な場合は緊急サポートを求める', '一人でいないで信頼できる人のそばにいる'],
      resources: ['こころの健康相談統一ダイヤル: 0570-064-556', 'いのちの電話: 0120-783-556 (24時間)', 'よりそいホットライン: 0120-279-338', '緊急: 119または救急外来'],
      affirmation: '極度の不安を感じている今でも、あなたは一人ではありません。助けを求めることは弱さではなく強さです。',
    },
    zh: {
      title: '严重程度',
      subtitle: '请立即寻求专业人士的帮助',
      description: '严重的焦虑正在大大影响生活质量。这是需要医学治疗的状态。借助专业帮助，一定能好起来。',
      tips: ['立即联系精神卫生专业人士，或前往急诊', '如果惊恐发作很严重，请立即寻求紧急救助', '不要独处，待在可信任的人身边'],
      resources: ['全国心理援助热线：12356（24 小时）', '北京心理危机研究与干预中心：010-82951332', '急救：120，或前往最近的医院急诊'],
      affirmation: '即使在感到极度焦虑的此刻，你也不是一个人。求助不是软弱，而是力量。',
    },
    fr: {
      title: 'Niveau sévère',
      subtitle: 'Faites-vous aider par un professionnel dès maintenant',
      description: 'Une anxiété sévère pèse fortement sur la qualité de vie. C’est un état qui nécessite un traitement médical. Avec une aide professionnelle, les choses peuvent vraiment s’améliorer.',
      tips: ['Contactez tout de suite un professionnel de santé mentale ou rendez-vous aux urgences', 'Si une crise de panique est sévère, demandez immédiatement une aide d’urgence', 'Ne restez pas seul : restez auprès d’une personne de confiance'],
      resources: ['Numéro national de prévention du suicide : 3114 (24 h/24)', 'SOS Amitié : 09 72 39 40 50', 'Urgences : 15 ou 112, ou le service d’urgences le plus proche'],
      affirmation: 'Même maintenant, au cœur d’une anxiété intense, vous n’êtes pas seul. Demander de l’aide n’est pas une faiblesse, c’est une force.',
    },
    es: {
      title: 'Nivel grave',
      subtitle: 'Busca ayuda profesional ahora mismo',
      description: 'La ansiedad grave está afectando mucho a tu calidad de vida. Es un estado que requiere tratamiento médico. Con ayuda profesional, puedes mejorar de verdad.',
      tips: ['Contacta ya con un profesional de salud mental o acude a urgencias', 'Si un ataque de pánico es grave, pide ayuda de emergencia de inmediato', 'No te quedes a solas: quédate con alguien de confianza'],
      resources: ['Línea de atención a la conducta suicida: 024 (24 h)', 'Teléfono de la Esperanza: 717 003 717', 'Emergencias: 112 o el servicio de urgencias más cercano'],
      affirmation: 'Incluso ahora, en medio de una ansiedad intensa, no estás solo. Pedir ayuda no es debilidad, es fortaleza.',
    },
  },
}

interface Props { locale?: string }

export default function AnxietyScreeningTest({ locale: lp = 'ko' }: Props) {
  const locale = lang(lp ?? 'ko')
  const lb = LABELS[locale]
  const questions = QUESTIONS[locale]

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [result, setResult] = useState<{ level: Level; score: number } | null>(null)
  useRecordFinishedTest({ testId: "anxiety-screening", title: "AnxietyScreeningTest", finished: Boolean(result) });

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

  function share() {
    if (!result) return
    const url = window.location.href
    const text = `${lb.shareMsg} — ${RESULTS[result.level][locale].title}`
    if (navigator.share) navigator.share({ title: lb.title, text, url })
    else navigator.clipboard.writeText(url)
  }

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
  const pct = Math.round((result.score / 21) * 100)
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
        <div className="rounded-xl border border-green-200 bg-surface-subtle p-4 space-y-2">
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
      <ShareResultButton
        locale={locale}
        heading={lb.title}
        resultTitle={r.title}
        emoji={result.level === 'severe' ? '🚨' : result.level === 'moderate' ? '🌧️' : result.level === 'mild' ? '🌤️' : '🍃'}
        description={r.description}
      />
      <ResultNextSteps
        locale={locale}
        links={[
          { href: `/${locale}/breathing/timer/`, label: locale === 'ko' ? '🫁 호흡 타이머' : locale === 'ja' ? '🫁 呼吸タイマー' : '🫁 Breathing timer' },
          { href: `/${locale}/inner-strength/test/`, label: locale === 'ko' ? '🧠 내면 강점 테스트' : locale === 'ja' ? '🧠 内面の強さテスト' : '🧠 Inner strength test' },
          { href: `/${locale}/habit-builder/guide/`, label: locale === 'ko' ? '✅ 습관 만들기 가이드' : locale === 'ja' ? '✅ 習慣づくりガイド' : '✅ Habit builder guide' },
        ]}
      />
      <div className="flex gap-3">
        <button onClick={restart} aria-label={lb.restart} className="flex-1 rounded-xl border bg-card px-4 py-2 text-sm font-bold hover:bg-accent transition-colors">{lb.restart}</button>
        <button onClick={share} aria-label={lb.share} className="flex-1 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-bold hover:opacity-90 transition-opacity">{lb.share}</button>
      </div>
    </div>
  )
}
