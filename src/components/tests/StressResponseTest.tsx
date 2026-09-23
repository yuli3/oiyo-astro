import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { Questionnaire } from '@/components/ui/questionnaire'
import ShareResultButton from '../shared/ShareResultButton'

type Locale = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'
type ResponseType = 'fight' | 'flight' | 'freeze' | 'fawn'

function lang(lp: string): Locale {
  return (['ko', 'en', 'ja', 'zh', 'fr', 'es'].includes(lp) ? lp : 'en') as Locale
}

interface TypeData {
  name: string
  keyword: string
  color: string
  emoji: string
  description: string
  bodySignals: string[]
  tips: string[]
  affirmation: string
}

const TYPE_DATA: Record<ResponseType, Record<Locale, TypeData>> = {
  fight: {
    ko: {
      name: '투쟁 반응', keyword: '싸움',
      color: '#ef4444',
      emoji: '🔥',
      description: '당신은 스트레스 상황에서 맞서 싸우는 반응을 보입니다. 위협이 느껴지면 공격적이거나 지배적인 행동으로 대응하려 합니다. 강한 의지와 용기의 표현이지만, 조절이 필요합니다.',
      bodySignals: ['심박수 증가', '근육 긴장', '목소리가 커짐', '주먹을 쥐거나 턱이 굳음'],
      tips: ['심호흡으로 즉각 반응을 늦추기', '신체 활동으로 에너지 방출', '반응하기 전 10초 기다리기', '자신의 분노 트리거 파악하기'],
      affirmation: '나의 강함은 통제될 때 가장 빛납니다.',
    },
    en: {
      name: 'Fight Response', keyword: 'Fight',
      color: '#ef4444',
      emoji: '🔥',
      description: 'You tend to confront and fight back under stress. When threatened, you respond with aggressive or dominant behavior. It reflects strong will and courage, but needs modulation.',
      bodySignals: ['Increased heart rate', 'Muscle tension', 'Louder voice', 'Clenched fists or jaw'],
      tips: ['Slow immediate reactions with deep breathing', 'Release energy through physical activity', 'Wait 10 seconds before responding', 'Identify your anger triggers'],
      affirmation: 'My strength shines brightest when controlled.',
    },
    ja: {
      name: '闘争反応', keyword: '戦い',
      color: '#ef4444',
      emoji: '🔥',
      description: 'あなたはストレス状況で立ち向かう反応を示します。脅威を感じると攻撃的または支配的な行動で対応しようとします。強い意志と勇気の表れですが、調整が必要です。',
      bodySignals: ['心拍数の増加', '筋肉の緊張', '声が大きくなる', '拳を握る・顎が固くなる'],
      tips: ['深呼吸で即座の反応を遅らせる', '身体活動でエネルギーを発散', '反応する前に10秒待つ', '自分の怒りのトリガーを把握する'],
      affirmation: '私の強さはコントロールされた時に最も輝きます。',
    },
    zh: {
      name: '战斗反应', keyword: '对抗',
      color: '#ef4444',
      emoji: '🔥',
      description: '在压力情境下，你会迎面对抗。一感到威胁，就想用强势或支配的行为回应。这是强大意志与勇气的体现，但需要调节。',
      bodySignals: ['心跳加快', '肌肉紧绷', '声音变大', '握拳或咬紧牙关'],
      tips: ['用深呼吸放慢即时反应', '通过身体活动释放能量', '回应前先等 10 秒', '找出自己的愤怒触发点'],
      affirmation: '我的强大，在被驾驭时最耀眼。',
    },
    fr: {
      name: 'Réaction de combat', keyword: 'Combattre',
      color: '#ef4444',
      emoji: '🔥',
      description: 'Face au stress, vous faites front. Dès que vous vous sentez menacé, vous réagissez par un comportement offensif ou dominant. C’est l’expression d’une grande volonté et de courage, mais elle demande à être régulée.',
      bodySignals: ['Accélération du rythme cardiaque', 'Tension musculaire', 'Voix qui monte', 'Poings serrés ou mâchoire crispée'],
      tips: ['Ralentir la réaction immédiate par une respiration profonde', 'Évacuer l’énergie par l’activité physique', 'Attendre 10 secondes avant de réagir', 'Repérer ce qui déclenche votre colère'],
      affirmation: 'Ma force brille le plus quand je la maîtrise.',
    },
    es: {
      name: 'Respuesta de lucha', keyword: 'Luchar',
      color: '#ef4444',
      emoji: '🔥',
      description: 'Ante el estrés, plantas cara. En cuanto sientes una amenaza, respondes con una conducta ofensiva o dominante. Es expresión de fuerza de voluntad y valentía, pero necesita regularse.',
      bodySignals: ['Aumento del ritmo cardiaco', 'Tensión muscular', 'Subida del tono de voz', 'Puños apretados o mandíbula tensa'],
      tips: ['Frenar la reacción inmediata con respiración profunda', 'Liberar la energía con actividad física', 'Esperar 10 segundos antes de reaccionar', 'Identificar tus desencadenantes de ira'],
      affirmation: 'Mi fuerza brilla más cuando la controlo.',
    },
  },
  flight: {
    ko: {
      name: '도피 반응', keyword: '도망',
      color: '#f97316',
      emoji: '💨',
      description: '당신은 스트레스 상황에서 피하거나 도망치는 반응을 보입니다. 위협을 피함으로써 안전을 찾으려 하며, 과도한 계획, 과로, 회피 행동이 나타날 수 있습니다.',
      bodySignals: ['불안과 안절부절', '빠른 호흡', '끊임없는 바쁨', '회피와 탈출 충동'],
      tips: ['안전하다는 것을 몸에 알려주기', '상황을 피하지 말고 직면해보기', '그라운딩 기법 연습', '불안의 원인 일지 작성'],
      affirmation: '나는 지금 안전합니다. 여기에 머물러도 됩니다.',
    },
    en: {
      name: 'Flight Response', keyword: 'Escape',
      color: '#f97316',
      emoji: '💨',
      description: 'You tend to avoid or flee stressful situations. You seek safety by avoiding threats, which can manifest as excessive planning, overwork, or avoidance behaviors.',
      bodySignals: ['Anxiety and restlessness', 'Rapid breathing', 'Constant busyness', 'Urge to avoid and escape'],
      tips: ['Tell your body you are safe', 'Try to face rather than avoid situations', 'Practice grounding techniques', 'Journal about the causes of anxiety'],
      affirmation: 'I am safe right now. It is okay to stay here.',
    },
    ja: {
      name: '逃走反応', keyword: '逃げ',
      color: '#f97316',
      emoji: '💨',
      description: 'あなたはストレス状況で逃げたり回避したりする反応を示します。脅威を避けることで安全を求め、過度な計画、過労、回避行動として現れることがあります。',
      bodySignals: ['不安と落ち着きのなさ', '呼吸が速くなる', '絶え間ない忙しさ', '回避と逃走の衝動'],
      tips: ['安全であることを体に伝える', '状況を避けずに向き合ってみる', 'グラウンディング技法を練習する', '不安の原因を日記に書く'],
      affirmation: '私は今安全です。ここにいても大丈夫です。',
    },
    zh: {
      name: '逃跑反应', keyword: '逃离',
      color: '#f97316',
      emoji: '💨',
      description: '在压力情境下，你会回避或逃开。你靠避开威胁来寻求安全，可能出现过度计划、过劳或回避行为。',
      bodySignals: ['焦虑、坐立不安', '呼吸急促', '停不下来的忙碌', '想回避、想逃走的冲动'],
      tips: ['告诉身体：现在是安全的', '别回避情境，试着面对', '练习着陆（grounding）技巧', '写下焦虑来源的日记'],
      affirmation: '我现在是安全的。我可以留在这里。',
    },
    fr: {
      name: 'Réaction de fuite', keyword: 'Fuir',
      color: '#f97316',
      emoji: '💨',
      description: 'Face au stress, vous évitez ou vous fuyez. Vous cherchez la sécurité en vous éloignant de la menace, ce qui peut se traduire par une planification excessive, du surmenage ou de l’évitement.',
      bodySignals: ['Anxiété et agitation', 'Respiration rapide', 'Activité incessante', 'Envie d’éviter et de s’échapper'],
      tips: ['Faire savoir à votre corps que vous êtes en sécurité', 'Affronter la situation au lieu de l’éviter', 'Pratiquer des techniques d’ancrage', 'Tenir un journal des sources d’anxiété'],
      affirmation: 'Je suis en sécurité maintenant. Je peux rester ici.',
    },
    es: {
      name: 'Respuesta de huida', keyword: 'Huir',
      color: '#f97316',
      emoji: '💨',
      description: 'Ante el estrés, evitas o huyes. Buscas seguridad alejándote de la amenaza, lo que puede traducirse en planificación excesiva, exceso de trabajo o conductas de evitación.',
      bodySignals: ['Ansiedad e inquietud', 'Respiración rápida', 'Estar siempre ocupado', 'Impulso de evitar y escapar'],
      tips: ['Hacerle saber a tu cuerpo que estás a salvo', 'Afrontar la situación en lugar de evitarla', 'Practicar técnicas de anclaje (grounding)', 'Llevar un diario de lo que te causa ansiedad'],
      affirmation: 'Ahora estoy a salvo. Puedo quedarme aquí.',
    },
  },
  freeze: {
    ko: {
      name: '경직 반응', keyword: '얼어붙음',
      color: '#607329',
      emoji: '🧊',
      description: '당신은 스트레스 상황에서 얼어붙거나 멈추는 반응을 보입니다. 압도적인 상황에서 몸과 마음이 일시 정지되며, 해리감, 무감각, 결정 마비가 나타날 수 있습니다.',
      bodySignals: ['몸이 굳어지거나 무거워짐', '멍하거나 해리감', '결정 불가능 상태', '시간이 느리게 흐르는 느낌'],
      tips: ['작은 신체 움직임부터 시작하기', '안전한 사람의 존재 확인하기', '감각에 집중하기 (5-4-3-2-1)', '트라우마 치료 전문가 상담 고려'],
      affirmation: '나는 움직일 수 있습니다. 조금씩이라도 괜찮습니다.',
    },
    en: {
      name: 'Freeze Response', keyword: 'Freeze',
      color: '#607329',
      emoji: '🧊',
      description: 'You tend to freeze or stop when stressed. In overwhelming situations, your body and mind temporarily pause, which can manifest as dissociation, numbness, or decision paralysis.',
      bodySignals: ['Body stiffening or feeling heavy', 'Dazed or dissociated', 'Unable to make decisions', 'Feeling time moves slowly'],
      tips: ['Start with small physical movements', 'Confirm the presence of a safe person', 'Focus on senses (5-4-3-2-1)', 'Consider consulting a trauma specialist'],
      affirmation: 'I can move. Even slowly, that is okay.',
    },
    ja: {
      name: '凍結反応', keyword: '固まり',
      color: '#607329',
      emoji: '🧊',
      description: 'あなたはストレス状況で固まったり止まったりする反応を示します。圧倒的な状況で体と心が一時停止し、解離感、無感覚、決断の麻痺として現れることがあります。',
      bodySignals: ['体が固まる・重くなる', '멍하거나멍해지る・解離感', '決断できない状態', '時間がゆっくり流れる感覚'],
      tips: ['小さな身体の動きから始める', '安全な人の存在を確認する', '感覚に集中する（5-4-3-2-1）', 'トラウマ専門家への相談を検討'],
      affirmation: '私は動けます。少しずつでも大丈夫です。',
    },
    zh: {
      name: '僵住反应', keyword: '冻结',
      color: '#607329',
      emoji: '🧊',
      description: '在压力情境下，你会僵住或停下来。面对压倒性的状况，身心会暂时停摆，可能出现解离感、麻木或决策瘫痪。',
      bodySignals: ['身体僵硬或沉重', '发呆或有解离感', '无法做决定', '觉得时间流得很慢'],
      tips: ['从小小的身体动作开始', '确认有让你安心的人在身边', '专注于感官（5-4-3-2-1）', '考虑咨询创伤治疗专业人士'],
      affirmation: '我可以动起来。一点一点也没关系。',
    },
    fr: {
      name: 'Réaction de figement', keyword: 'Se figer',
      color: '#607329',
      emoji: '🧊',
      description: 'Face au stress, vous vous figez ou vous arrêtez. Devant une situation écrasante, corps et esprit se mettent en pause ; dissociation, engourdissement ou paralysie décisionnelle peuvent apparaître.',
      bodySignals: ['Corps raide ou lourd', 'Esprit vide ou sensation de dissociation', 'Incapacité à décider', 'Impression que le temps ralentit'],
      tips: ['Commencer par de petits mouvements du corps', 'Vérifier la présence d’une personne rassurante', 'Se concentrer sur les sens (5-4-3-2-1)', 'Envisager un professionnel spécialisé dans le trauma'],
      affirmation: 'Je peux bouger. Même un tout petit peu, c’est bien.',
    },
    es: {
      name: 'Respuesta de congelación', keyword: 'Paralizarse',
      color: '#607329',
      emoji: '🧊',
      description: 'Ante el estrés, te quedas paralizado o te detienes. Ante una situación abrumadora, cuerpo y mente se ponen en pausa; pueden aparecer disociación, entumecimiento o parálisis para decidir.',
      bodySignals: ['Cuerpo rígido o pesado', 'Mente en blanco o sensación de disociación', 'Incapacidad para decidir', 'Sensación de que el tiempo va más lento'],
      tips: ['Empezar con pequeños movimientos del cuerpo', 'Comprobar que hay una persona segura cerca', 'Centrarte en los sentidos (5-4-3-2-1)', 'Plantearte consultar a un especialista en trauma'],
      affirmation: 'Puedo moverme. Aunque sea poco a poco, está bien.',
    },
  },
  fawn: {
    ko: {
      name: '순응 반응', keyword: '순응',
      color: '#22c55e',
      emoji: '🕊️',
      description: '당신은 스트레스 상황에서 타인을 달래고 맞추려는 반응을 보입니다. 갈등을 피하기 위해 자신의 필요를 억압하고 타인의 기대에 과도하게 맞추려 합니다.',
      bodySignals: ['억지 미소', '과도한 사과', '불편해도 동의', '자신의 감정 억압'],
      tips: ['내 감정과 필요 인식하기', '거절하는 연습 (작은 것부터)', '자기 자신에게 솔직해지기', '경계 설정과 자기 존중 연습'],
      affirmation: '나의 필요와 감정은 소중하며 표현할 가치가 있습니다.',
    },
    en: {
      name: 'Fawn Response', keyword: 'Appease',
      color: '#22c55e',
      emoji: '🕊️',
      description: 'You tend to pacify and accommodate others when stressed. You suppress your own needs and excessively conform to others\' expectations to avoid conflict.',
      bodySignals: ['Forced smile', 'Excessive apologizing', 'Agreeing when uncomfortable', 'Suppressing own emotions'],
      tips: ['Recognize your own emotions and needs', 'Practice saying no (start small)', 'Be honest with yourself', 'Practice boundary-setting and self-respect'],
      affirmation: 'My needs and feelings are precious and worth expressing.',
    },
    ja: {
      name: '服従反応', keyword: '順応',
      color: '#22c55e',
      emoji: '🕊️',
      description: 'あなたはストレス状況で他者をなだめ、合わせようとする反応を示します。対立を避けるために自分のニーズを抑圧し、他者の期待に過度に応えようとします。',
      bodySignals: ['無理な笑顔', '過度な謝罪', '不快でも同意する', '自分の感情を抑圧'],
      tips: ['自分の感情とニーズを認識する', '断る練習（小さなことから）', '自分自身に正直になる', '境界設定と自己尊重の練習'],
      affirmation: '私のニーズと感情は大切で、表現する価値があります。',
    },
    zh: {
      name: '讨好反应', keyword: '顺从',
      color: '#22c55e',
      emoji: '🕊️',
      description: '在压力情境下，你会去安抚、迎合别人。为了避开冲突，压抑自己的需要，过度迎合他人的期待。',
      bodySignals: ['勉强的微笑', '过度道歉', '不舒服也表示同意', '压抑自己的情绪'],
      tips: ['察觉自己的情绪和需要', '练习拒绝（从小事开始）', '对自己诚实', '练习设定界限与自我尊重'],
      affirmation: '我的需要和感受很重要，值得被表达。',
    },
    fr: {
      name: 'Réaction de complaisance', keyword: 'Se soumettre',
      color: '#22c55e',
      emoji: '🕊️',
      description: 'Face au stress, vous cherchez à apaiser les autres et à vous adapter à eux. Pour éviter le conflit, vous étouffez vos besoins et vous pliez excessivement à leurs attentes.',
      bodySignals: ['Sourire forcé', 'Excuses excessives', 'Accord malgré l’inconfort', 'Émotions refoulées'],
      tips: ['Reconnaître vos émotions et vos besoins', 'S’entraîner à refuser (en commençant petit)', 'Être honnête avec soi-même', 'Pratiquer la pose de limites et le respect de soi'],
      affirmation: 'Mes besoins et mes émotions comptent et méritent d’être exprimés.',
    },
    es: {
      name: 'Respuesta de complacencia', keyword: 'Complacer',
      color: '#22c55e',
      emoji: '🕊️',
      description: 'Ante el estrés, intentas calmar a los demás y adaptarte a ellos. Para evitar el conflicto, reprimes tus necesidades y te ajustas en exceso a sus expectativas.',
      bodySignals: ['Sonrisa forzada', 'Disculpas excesivas', 'Decir que sí aunque incomode', 'Reprimir las propias emociones'],
      tips: ['Reconocer tus emociones y necesidades', 'Practicar a decir que no (empezando por lo pequeño)', 'Ser sincero contigo mismo', 'Practicar poner límites y respetarte'],
      affirmation: 'Mis necesidades y emociones importan y merecen expresarse.',
    },
  },
}

const LABELS: Record<Locale, {
  title: string
  subtitle: string
  questionOf: (c: number, t: number) => string
  restart: string
  share: string
  shareMsg: string
  yourType: string
  bodySignals: string
  tips: string
  dimLabel: string
  note: string
  choose: string
}> = {
  ko: {
    title: '스트레스 반응 유형',
    subtitle: '나는 싸우나, 도망치나, 얼어붙나, 순응하나?',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '나의 스트레스 반응 유형은',
    yourType: '나의 스트레스 반응 유형',
    bodySignals: '신체 신호',
    tips: '대처 전략',
    dimLabel: '4가지 반응 유형 분포',
    note: '스트레스 반응은 생존 본능으로, 어떤 유형도 잘못된 것이 아닙니다. 자신을 이해하는 것이 첫 걸음입니다.',
    choose: '이 상황에서 나의 반응에 가장 가까운 것을 고르세요',
  },
  en: {
    title: 'Stress Response Type',
    subtitle: 'Do you fight, flee, freeze, or fawn?',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My stress response type is',
    yourType: 'Your Stress Response Type',
    bodySignals: 'Body Signals',
    tips: 'Coping Strategies',
    dimLabel: '4-Type Response Distribution',
    note: 'Stress responses are survival instincts — no type is wrong. Understanding yourself is the first step.',
    choose: 'Choose the response closest to yours in this situation',
  },
  ja: {
    title: 'ストレス反応タイプ',
    subtitle: '私は戦う？逃げる？固まる？従う？',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '私のストレス反応タイプは',
    yourType: '私のストレス反応タイプ',
    bodySignals: '身体サイン',
    tips: '対処戦略',
    dimLabel: '4タイプ反応分布',
    note: 'ストレス反応は生存本能であり、どのタイプも間違いではありません。自己理解が最初の一歩です。',
    choose: 'この状況での自分の反応に最も近いものを選んでください',
  },
  zh: {
    title: '压力反应类型',
    subtitle: '我会战斗、逃跑、僵住，还是讨好？',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: '重新测验',
    share: '分享结果',
    shareMsg: '我的压力反应类型是',
    yourType: '我的压力反应类型',
    bodySignals: '身体信号',
    tips: '应对策略',
    dimLabel: '四种反应类型分布',
    note: '压力反应是生存本能，哪一种都没有错。了解自己是第一步。',
    choose: '请选出最接近你在这种情境下反应的选项',
  },
  fr: {
    title: 'Type de réaction au stress',
    subtitle: 'Est-ce que je combats, fuis, me fige ou me soumets ?',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: 'Recommencer',
    share: 'Partager le résultat',
    shareMsg: 'Mon type de réaction au stress',
    yourType: 'Mon type de réaction au stress',
    bodySignals: 'Signaux du corps',
    tips: 'Stratégies pour faire face',
    dimLabel: 'Répartition des quatre types de réaction',
    note: 'La réaction au stress est un instinct de survie : aucun type n’est mauvais. Se comprendre est le premier pas.',
    choose: 'Choisissez la réaction la plus proche de la vôtre dans cette situation',
  },
  es: {
    title: 'Tipo de respuesta al estrés',
    subtitle: '¿Lucho, huyo, me paralizo o complazco?',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: 'Repetir',
    share: 'Compartir resultado',
    shareMsg: 'Mi tipo de respuesta al estrés',
    yourType: 'Mi tipo de respuesta al estrés',
    bodySignals: 'Señales del cuerpo',
    tips: 'Estrategias de afrontamiento',
    dimLabel: 'Distribución de los cuatro tipos de respuesta',
    note: 'La respuesta al estrés es un instinto de supervivencia: ningún tipo es incorrecto. Entenderte es el primer paso.',
    choose: 'Elige la opción más cercana a cómo reaccionarías en esta situación',
  },
}

interface Scenario {
  id: string
  text: Record<Locale, string>
  options: Array<{ type: ResponseType; text: Record<Locale, string> }>
}

const SCENARIOS: Scenario[] = [
  {
    id: 's1',
    text: {
      ko: '상사가 회의에서 당신의 아이디어를 공개적으로 비판했습니다.',
      en: 'Your boss publicly criticized your idea in a meeting.',
      ja: '上司が会議であなたのアイデアを公の場で批判しました。',
      zh: '上司在会议上公开批评了你的想法。',
      fr: 'Votre supérieur a critiqué votre idée publiquement en réunion.',
      es: 'Tu jefe ha criticado tu idea en público durante una reunión.',
    },
    options: [
      { type: 'fight', text: { ko: '즉시 반박하고 내 의견을 강하게 주장한다', en: 'Immediately argue back and strongly assert my view', ja: 'すぐに反論して自分の意見を強く主張する', zh: '立刻反驳，强烈坚持自己的意见', fr: 'Je réplique aussitôt et défends fermement mon avis', es: 'Replico enseguida y defiendo con fuerza mi opinión' } },
      { type: 'flight', text: { ko: '회의가 끝난 후 조용히 자리를 피한다', en: 'Quietly leave after the meeting', ja: '会議が終わった後静かに席を離れる', zh: '会议结束后悄悄离开', fr: 'Je m’éclipse discrètement après la réunion', es: 'Me escabullo en silencio tras la reunión' } },
      { type: 'freeze', text: { ko: '아무 말도 못하고 멍하니 있다', en: 'Stay speechless and dazed', ja: '何も言えず茫然としている', zh: '一句话都说不出，愣在那里', fr: 'Je reste sans voix, sonné', es: 'Me quedo sin palabras, aturdido' } },
      { type: 'fawn', text: { ko: '"맞아요, 제가 잘못 생각했네요"라고 동의한다', en: 'Agree: "You\'re right, I was wrong to think that"', ja: '「そうですね、私の考えが間違っていました」と同意する', zh: '附和说：“对，是我想错了”', fr: 'J’acquiesce : « Vous avez raison, je me suis trompé »', es: 'Le doy la razón: «Tiene razón, me equivoqué»' } },
    ],
  },
  {
    id: 's2',
    text: {
      ko: '중요한 발표 직전에 기술 오류가 발생했습니다.',
      en: 'A technical error occurs right before an important presentation.',
      ja: '重要なプレゼンの直前に技術的なエラーが発生しました。',
      zh: '重要发表前一刻出现了技术故障。',
      fr: 'Une panne technique survient juste avant une présentation importante.',
      es: 'Justo antes de una presentación importante surge un fallo técnico.',
    },
    options: [
      { type: 'fight', text: { ko: '빠르게 문제를 직접 해결하려 한다', en: 'Try to solve the problem directly and quickly', ja: '素早く問題を自分で解決しようとする', zh: '想自己迅速把问题解决', fr: 'J’essaie de régler le problème moi-même, vite', es: 'Intento resolver el problema yo mismo, rápido' } },
      { type: 'flight', text: { ko: '발표를 미루거나 취소하고 싶다', en: 'Want to postpone or cancel the presentation', ja: 'プレゼンを延期またはキャンセルしたくなる', zh: '想推迟或取消发表', fr: 'J’ai envie de reporter ou d’annuler la présentation', es: 'Quiero aplazar o cancelar la presentación' } },
      { type: 'freeze', text: { ko: '어떻게 해야 할지 몰라 얼어붙는다', en: 'Freeze, not knowing what to do', ja: 'どうすればいいかわからず固まってしまう', zh: '不知道该怎么办，僵住了', fr: 'Je me fige, sans savoir quoi faire', es: 'Me bloqueo sin saber qué hacer' } },
      { type: 'fawn', text: { ko: '다른 사람에게 미안하다고 과도하게 사과한다', en: 'Apologize excessively to others', ja: '他の人に過度に謝り続ける', zh: '对别人过度地道歉', fr: 'Je m’excuse exagérément auprès des autres', es: 'Pido perdón en exceso a los demás' } },
    ],
  },
  {
    id: 's3',
    text: {
      ko: '친한 친구가 갑자기 연락을 끊었습니다.',
      en: 'A close friend suddenly stops contacting you.',
      ja: '親しい友人が突然連絡を絶ちました。',
      zh: '要好的朋友突然不再联系你。',
      fr: 'Un ami proche cesse soudain de vous donner des nouvelles.',
      es: 'Un amigo cercano deja de repente de escribirte.',
    },
    options: [
      { type: 'fight', text: { ko: '왜 그러는지 바로 따져 묻는다', en: 'Immediately confront them to ask why', ja: 'すぐになぜなのかを問い詰める', zh: '马上质问对方为什么', fr: 'Je lui demande tout de suite des comptes', es: 'Le pregunto enseguida por qué' } },
      { type: 'flight', text: { ko: '상처받지 않으려 바쁘게 지내며 잊으려 한다', en: 'Stay busy to avoid being hurt and try to forget', ja: '傷つかないように忙しく過ごして忘れようとする', zh: '为了不受伤，让自己忙起来试着忘掉', fr: 'Pour ne pas souffrir, je m’occupe et j’essaie d’oublier', es: 'Para no sufrir, me mantengo ocupado e intento olvidarlo' } },
      { type: 'freeze', text: { ko: '어떻게 해야 할지 몰라 그냥 기다린다', en: 'Just wait, not knowing what to do', ja: 'どうすればいいかわからずただ待つ', zh: '不知道该怎么办，只能等着', fr: 'Ne sachant pas quoi faire, j’attends', es: 'Sin saber qué hacer, espero' } },
      { type: 'fawn', text: { ko: '내가 뭘 잘못했나 생각하며 먼저 사과한다', en: 'Think about what I did wrong and apologize first', ja: '自分が何かしたかと考えて先に謝る', zh: '想着是不是自己做错了什么，先道歉', fr: 'Je me demande ce que j’ai fait de mal et m’excuse le premier', es: 'Pienso qué he hecho mal y me disculpo primero' } },
    ],
  },
  {
    id: 's4',
    text: {
      ko: '업무가 너무 많아 기한을 지킬 수 없을 것 같습니다.',
      en: 'You have too much work and cannot meet the deadline.',
      ja: '業務が多すぎて締め切りに間に合いそうにありません。',
      zh: '工作太多，好像赶不上截止日期。',
      fr: 'Vous avez tant de travail que vous risquez de ne pas tenir les délais.',
      es: 'Tienes tanto trabajo que parece imposible llegar al plazo.',
    },
    options: [
      { type: 'fight', text: { ko: '상사에게 업무량이 과하다고 직접 말한다', en: 'Directly tell your boss the workload is excessive', ja: '上司に業務量が多すぎると直接伝える', zh: '直接告诉上司工作量太大', fr: 'Je dis franchement à mon supérieur que la charge est excessive', es: 'Le digo directamente a mi jefe que la carga es excesiva' } },
      { type: 'flight', text: { ko: '야근을 반복하며 어떻게든 피하려 한다', en: 'Repeat overtime, trying to avoid it somehow', ja: '残業を繰り返しながらなんとか避けようとする', zh: '反复加班，想方设法躲过去', fr: 'J’enchaîne les heures sup pour m’en sortir coûte que coûte', es: 'Hago horas extra una y otra vez para salir como sea' } },
      { type: 'freeze', text: { ko: '무엇부터 해야 할지 몰라 아무것도 못 한다', en: 'Can\'t do anything, not knowing where to start', ja: '何から始めればいいかわからず何もできない', zh: '不知道从哪里开始，什么都做不了', fr: 'Je ne sais pas par où commencer et je ne fais rien', es: 'No sé por dónde empezar y no hago nada' } },
      { type: 'fawn', text: { ko: '"괜찮아요"라고 하고 혼자 다 감당한다', en: 'Say "It\'s fine" and handle everything alone', ja: '「大丈夫です」と言って一人ですべてこなす', zh: '说“没关系”，一个人全扛下来', fr: 'Je dis « ça va » et j’assume tout seul', es: 'Digo «no pasa nada» y cargo con todo yo solo' } },
    ],
  },
  {
    id: 's5',
    text: {
      ko: '파트너와 심각한 의견 충돌이 생겼습니다.',
      en: 'A serious disagreement arises with your partner.',
      ja: 'パートナーと深刻な意見の対立が起きました。',
      zh: '和伴侣发生了严重的意见冲突。',
      fr: 'Un désaccord sérieux éclate avec votre partenaire.',
      es: 'Surge un desacuerdo serio con tu pareja.',
    },
    options: [
      { type: 'fight', text: { ko: '내 주장을 끝까지 굽히지 않는다', en: 'Never back down from my position', ja: '自分の主張を最後まで曲げない', zh: '坚持自己的主张到底', fr: 'Je ne cède pas d’un pouce', es: 'No cedo en mi postura hasta el final' } },
      { type: 'flight', text: { ko: '화가 나면 자리를 피하거나 대화를 끊는다', en: 'When angry, leave or cut off the conversation', ja: '腹が立つと席を離れるか会話を打ち切る', zh: '一生气就走开或中断对话', fr: 'Quand je suis en colère, je m’en vais ou je coupe la conversation', es: 'Si me enfado, me voy o corto la conversación' } },
      { type: 'freeze', text: { ko: '아무 말도 나오지 않고 멍하게 있다', en: 'No words come out, just stare blankly', ja: '何も言葉が出ず茫然としている', zh: '什么话都说不出来，愣在那里', fr: 'Aucun mot ne sort, je reste figé', es: 'No me sale nada y me quedo en blanco' } },
      { type: 'fawn', text: { ko: '갈등을 피하려 내 감정을 억누르고 양보한다', en: 'Suppress my feelings and give in to avoid conflict', ja: '対立を避けるために自分の感情を抑えて譲歩する', zh: '为了避开冲突，压下情绪让步', fr: 'Pour éviter le conflit, je ravale mes émotions et je cède', es: 'Para evitar el conflicto, reprimo lo que siento y cedo' } },
    ],
  },
  {
    id: 's6',
    text: {
      ko: '낯선 사람이 많은 파티에 혼자 도착했습니다.',
      en: 'You arrive alone at a party with many strangers.',
      ja: '知らない人が多いパーティーに一人で到着しました。',
      zh: '你独自来到一个满是陌生人的派对。',
      fr: 'Vous arrivez seul à une fête pleine d’inconnus.',
      es: 'Llegas solo a una fiesta llena de desconocidos.',
    },
    options: [
      { type: 'fight', text: { ko: '적극적으로 대화를 시작하며 공간을 장악한다', en: 'Actively start conversations and dominate the space', ja: '積極的に会話を始めてスペースを制する', zh: '主动开启话题，掌控全场', fr: 'J’engage la conversation et prends ma place dans la pièce', es: 'Empiezo conversaciones y me adueño del espacio' } },
      { type: 'flight', text: { ko: '핑계를 대고 일찍 자리를 뜬다', en: 'Make an excuse and leave early', ja: '言い訳をして早めに席を立つ', zh: '找个借口提早离开', fr: 'Je trouve une excuse pour partir tôt', es: 'Pongo una excusa y me voy pronto' } },
      { type: 'freeze', text: { ko: '구석에서 아무것도 못 하고 서 있다', en: 'Stand in a corner, unable to do anything', ja: '隅っこで何もできずに立っている', zh: '在角落里站着什么都做不了', fr: 'Je reste dans un coin sans rien pouvoir faire', es: 'Me quedo en un rincón sin poder hacer nada' } },
      { type: 'fawn', text: { ko: '모든 사람을 기쁘게 하려 지나치게 친절하게 굴다 지친다', en: 'Exhaust myself trying to please everyone by being overly kind', ja: '全員を喜ばせようと過度に親切にして疲れてしまう', zh: '想让每个人都开心，过度热情到筋疲力尽', fr: 'Je veux plaire à tout le monde, je suis trop aimable et je m’épuise', es: 'Intento agradar a todos siendo demasiado amable y acabo agotado' } },
    ],
  },
  {
    id: 's7',
    text: {
      ko: '자신에 대한 부정적인 소문을 들었습니다.',
      en: 'You hear negative rumors about yourself.',
      ja: '自分についての否定的な噂を聞きました。',
      zh: '你听到了关于自己的负面传闻。',
      fr: 'Vous entendez une rumeur négative à votre sujet.',
      es: 'Te enteras de un rumor negativo sobre ti.',
    },
    options: [
      { type: 'fight', text: { ko: '소문의 출처를 찾아 직접 해결한다', en: 'Find the source and address it directly', ja: '噂の出所を突き止めて直接対処する', zh: '找出传闻的来源，亲自解决', fr: 'Je remonte à la source et règle le problème moi-même', es: 'Busco el origen del rumor y lo resuelvo yo mismo' } },
      { type: 'flight', text: { ko: '신경 안 쓴다고 하지만 사람들을 멀리한다', en: 'Say I don\'t care but distance from people', ja: '気にしないと言いながら人々から距離を置く', zh: '嘴上说不在意，却和人拉开距离', fr: 'Je dis que ça m’est égal, mais je prends mes distances', es: 'Digo que no me importa, pero me alejo de la gente' } },
      { type: 'freeze', text: { ko: '아무것도 할 수 없고 무기력하게 느낀다', en: 'Feel helpless and unable to do anything', ja: '何もできず無力感を感じる', zh: '什么都做不了，感到无力', fr: 'Je ne peux rien faire et me sens impuissant', es: 'No puedo hacer nada y me siento impotente' } },
      { type: 'fawn', text: { ko: '모두에게 좋게 보이려 더 열심히 맞춰준다', en: 'Try harder to please everyone and look good to them', ja: 'みんなによく見られようとさらに一生懸命に合わせる', zh: '为了在大家眼里显得好，更努力地迎合', fr: 'Je redouble d’efforts pour plaire à tout le monde', es: 'Me esfuerzo aún más por agradar a todos' } },
    ],
  },
  {
    id: 's8',
    text: {
      ko: '건강 검진에서 걱정되는 수치가 나왔습니다.',
      en: 'A health check reveals concerning values.',
      ja: '健康診断で心配な数値が出ました。',
      zh: '体检出现了令人担心的数值。',
      fr: 'Un bilan de santé révèle un résultat inquiétant.',
      es: 'Un chequeo médico muestra un valor preocupante.',
    },
    options: [
      { type: 'fight', text: { ko: '즉시 의사에게 자세히 따지고 대책을 세운다', en: 'Immediately question the doctor in detail and make a plan', ja: 'すぐに医師に詳しく問い詰めて対策を立てる', zh: '马上仔细追问医生，制定对策', fr: 'Je questionne aussitôt le médecin en détail et établis un plan', es: 'Pregunto enseguida al médico con detalle y hago un plan' } },
      { type: 'flight', text: { ko: '생각하기 싫어 바쁘게 생활하며 잊으려 한다', en: 'Stay busy to forget rather than think about it', ja: '考えたくないので忙しく過ごして忘れようとする', zh: '不想去想，让自己忙起来试着忘掉', fr: 'Je ne veux pas y penser : je m’occupe pour oublier', es: 'No quiero pensarlo: me mantengo ocupado para olvidarlo' } },
      { type: 'freeze', text: { ko: '충격에 다음 행동을 취하지 못하고 멍하다', en: 'Shocked and unable to take the next step, feeling dazed', ja: 'ショックで次の行動が取れず呆然としている', zh: '受到冲击，愣住了，不知道下一步', fr: 'Sous le choc, je reste hébété sans rien faire', es: 'Del susto, me quedo en blanco sin dar el siguiente paso' } },
      { type: 'fawn', text: { ko: '가족들을 걱정시키지 않으려 괜찮다고 한다', en: 'Say I\'m fine to avoid worrying my family', ja: '家族を心配させないように大丈夫だと言う', zh: '为了不让家人担心，说自己没事', fr: 'Je dis que tout va bien pour ne pas inquiéter ma famille', es: 'Digo que estoy bien para no preocupar a mi familia' } },
    ],
  },
  {
    id: 's9',
    text: {
      ko: '중요한 결정을 빠르게 내려야 하는 상황입니다.',
      en: 'You must make an important decision quickly.',
      ja: '重要な決断を素早く下さなければならない状況です。',
      zh: '你必须迅速做出一个重要的决定。',
      fr: 'Vous devez prendre vite une décision importante.',
      es: 'Tienes que tomar rápido una decisión importante.',
    },
    options: [
      { type: 'fight', text: { ko: '빠르고 단호하게 결정하고 실행한다', en: 'Decide quickly and decisively, then act', ja: '素早く断固として決め、実行する', zh: '快速果断地决定并执行', fr: 'Je décide vite, fermement, et j’agis', es: 'Decido rápido y con firmeza, y lo ejecuto' } },
      { type: 'flight', text: { ko: '결정을 미루거나 다른 사람에게 넘기고 싶다', en: 'Want to postpone or hand off to someone else', ja: '決断を先延ばしにするか他の人に任せたい', zh: '想拖延决定，或交给别人', fr: 'J’ai envie de repousser la décision ou de la confier à quelqu’un', es: 'Quiero aplazar la decisión o dejársela a otro' } },
      { type: 'freeze', text: { ko: '선택지들 앞에서 아무것도 결정하지 못한다', en: 'Unable to decide among the options', ja: '選択肢の前で何も決められない', zh: '面对各种选项，什么都决定不了', fr: 'Face aux options, je n’arrive à rien décider', es: 'Ante las opciones, no consigo decidir nada' } },
      { type: 'fawn', text: { ko: '다른 사람들의 의견에 따라 결정한다', en: 'Decide based on others\' opinions', ja: '他の人の意見に従って決める', zh: '按照别人的意见来决定', fr: 'Je décide selon l’avis des autres', es: 'Decido según la opinión de los demás' } },
    ],
  },
  {
    id: 's10',
    text: {
      ko: '누군가가 공공장소에서 당신을 무시하는 발언을 했습니다.',
      en: 'Someone dismisses you with a comment in a public place.',
      ja: '誰かが公の場所であなたを軽視する発言をしました。',
      zh: '有人在公共场合说了轻视你的话。',
      fr: 'Quelqu’un vous rabaisse en public.',
      es: 'Alguien te menosprecia en público.',
    },
    options: [
      { type: 'fight', text: { ko: '그 자리에서 바로 반박하고 자신을 지킨다', en: 'Immediately push back and defend myself on the spot', ja: 'その場ですぐに反論して自分を守る', zh: '当场反驳，维护自己', fr: 'Je réplique sur-le-champ et me défends', es: 'Replico en el acto y me defiendo' } },
      { type: 'flight', text: { ko: '아무 말도 하지 않고 그 자리를 피한다', en: 'Say nothing and leave the scene', ja: '何も言わずにその場を離れる', zh: '一句话不说，离开现场', fr: 'Je ne dis rien et je m’en vais', es: 'No digo nada y me voy' } },
      { type: 'freeze', text: { ko: '뭐라고 해야 할지 몰라 아무 반응도 못 한다', en: 'Can\'t react, not knowing what to say', ja: '何を言えばいいかわからず何の反応もできない', zh: '不知道该说什么，毫无反应', fr: 'Je ne sais pas quoi dire et ne réagis pas', es: 'No sé qué decir y no reacciono' } },
      { type: 'fawn', text: { ko: '상대방의 기분을 맞추려 미소 짓거나 동의한다', en: 'Smile or agree to appease the other person', ja: '相手の機嫌を取ろうと微笑んだり同意したりする', zh: '为了顺着对方的心情，微笑或附和', fr: 'Je souris ou j’acquiesce pour ménager l’autre', es: 'Sonrío o le doy la razón para contentar al otro' } },
    ],
  },
  {
    id: 's11',
    text: {
      ko: '재정적인 어려움이 예상치 못하게 닥쳤습니다.',
      en: 'An unexpected financial difficulty hits you.',
      ja: '経済的な困難が予期せず訪れました。',
      zh: '突然遭遇了意料之外的经济困难。',
      fr: 'Des difficultés financières imprévues vous tombent dessus.',
      es: 'Te llegan de golpe dificultades económicas inesperadas.',
    },
    options: [
      { type: 'fight', text: { ko: '즉시 수입을 늘릴 방법을 찾고 행동한다', en: 'Immediately find ways to increase income and act', ja: 'すぐに収入を増やす方法を見つけて行動する', zh: '马上找增加收入的办法并行动', fr: 'Je cherche tout de suite comment augmenter mes revenus et j’agis', es: 'Busco enseguida cómo aumentar mis ingresos y actúo' } },
      { type: 'flight', text: { ko: '현실을 직면하기 싫어 소비를 피하거나 과소비한다', en: 'Avoid reality by underspending or overspending', ja: '現実に向き合いたくなくて節約するか過消費する', zh: '不想面对现实，要么回避花钱，要么反而乱花', fr: 'Pour ne pas regarder la réalité en face, j’évite toute dépense ou je dépense trop', es: 'Para no enfrentarme a la realidad, evito gastar o gasto de más' } },
      { type: 'freeze', text: { ko: '무기력하고 어떻게 해야 할지 모르겠다', en: 'Feel helpless and don\'t know what to do', ja: '無力感を感じ、どうすればいいかわからない', zh: '感到无力，不知道该怎么办', fr: 'Je me sens impuissant, sans savoir quoi faire', es: 'Me siento impotente y no sé qué hacer' } },
      { type: 'fawn', text: { ko: '가족이나 친구들에게 부담 주지 않으려 괜찮다고 한다', en: 'Say I\'m fine to not burden family or friends', ja: '家族や友人に負担をかけまいと大丈夫だと言う', zh: '为了不给家人朋友添负担，说自己没事', fr: 'Je dis que ça va pour ne pas peser sur ma famille ou mes amis', es: 'Digo que estoy bien para no cargar a familia o amigos' } },
    ],
  },
  {
    id: 's12',
    text: {
      ko: '기대하던 프로젝트가 갑자기 취소되었습니다.',
      en: 'A project you were looking forward to is suddenly canceled.',
      ja: '楽しみにしていたプロジェクトが突然キャンセルされました。',
      zh: '期待已久的项目突然被取消了。',
      fr: 'Un projet que vous attendiez est soudain annulé.',
      es: 'Un proyecto que esperabas se cancela de repente.',
    },
    options: [
      { type: 'fight', text: { ko: '취소 이유를 따지고 재고를 요청한다', en: 'Challenge the reason for cancellation and request reconsideration', ja: 'キャンセルの理由を問い詰めて再考を求める', zh: '追问取消的理由，要求重新考虑', fr: 'Je demande les raisons et une reconsidération', es: 'Pregunto el motivo y pido que se reconsidere' } },
      { type: 'flight', text: { ko: '실망감을 다른 활동에 몰두해 잊으려 한다', en: 'Throw myself into other activities to forget the disappointment', ja: '失望感を別の活動に没頭して忘れようとする', zh: '埋头做别的事，想忘掉失望', fr: 'Je me plonge dans d’autres activités pour oublier ma déception', es: 'Me vuelco en otras actividades para olvidar la decepción' } },
      { type: 'freeze', text: { ko: '받아들이지 못하고 멍하게 앉아 있다', en: 'Sit dazed, unable to accept it', ja: '受け入れられず呆然と座っている', zh: '无法接受，愣愣地坐着', fr: 'Je n’arrive pas à l’accepter et je reste assis, hébété', es: 'No consigo aceptarlo y me quedo sentado, aturdido' } },
      { type: 'fawn', text: { ko: '"괜찮아요"라고 하며 담당자를 위로한다', en: 'Say "It\'s okay" and comfort the person in charge', ja: '「大丈夫です」と言って担当者を慰める', zh: '说着“没关系”，反过来安慰负责人', fr: 'Je dis « ce n’est pas grave » et je console le responsable', es: 'Digo «no pasa nada» y consuelo al responsable' } },
    ],
  },
  {
    id: 's13',
    text: {
      ko: '의료 응급 상황이 눈앞에 펼쳐졌습니다.',
      en: 'A medical emergency unfolds before your eyes.',
      ja: '医療緊急事態が目の前で起きました。',
      zh: '眼前发生了医疗紧急状况。',
      fr: 'Une urgence médicale survient sous vos yeux.',
      es: 'Ante tus ojos se produce una emergencia médica.',
    },
    options: [
      { type: 'fight', text: { ko: '즉시 119에 전화하고 상황을 지휘한다', en: 'Immediately call emergency services and take charge', ja: 'すぐに119番に電話して状況を指揮する', zh: '马上拨打 120，指挥现场', fr: 'J’appelle aussitôt le 15 et je prends la situation en main', es: 'Llamo enseguida al 112 y dirijo la situación' } },
      { type: 'flight', text: { ko: '당황해서 그 자리를 피하고 싶어진다', en: 'Get flustered and want to flee the scene', ja: '慌てのその場を避けたくなる', zh: '慌了，想离开现场', fr: 'Paniqué, j’ai envie de quitter les lieux', es: 'Del pánico, quiero irme de allí' } },
      { type: 'freeze', text: { ko: '어떻게 해야 할지 몰라 발이 붙어 움직이지 못한다', en: 'Can\'t move, feet planted, not knowing what to do', ja: 'どうすればいいかわからず足がすくんで動けない', zh: '不知道该怎么办，脚像钉住一样动不了', fr: 'Je ne sais pas quoi faire, mes pieds restent cloués au sol', es: 'No sé qué hacer y me quedo clavado sin moverme' } },
      { type: 'fawn', text: { ko: '다른 사람들이 괜찮은지 살피느라 나는 후순위가 된다', en: 'Check on others first, making myself secondary', ja: '他の人が大丈夫かを確認することを優先して自分は後回しになる', zh: '忙着照顾别人是否还好，把自己放到最后', fr: 'Je veille à ce que les autres aillent bien et je passe après', es: 'Me ocupo de ver si los demás están bien y yo quedo para después' } },
    ],
  },
  {
    id: 's14',
    text: {
      ko: '장기간 하던 일이 갑자기 없어졌습니다.',
      en: 'A job or project you\'ve done for a long time suddenly ends.',
      ja: '長期間してきた仕事が突然なくなりました。',
      zh: '长期从事的工作突然没了。',
      fr: 'Un travail que vous faisiez depuis longtemps disparaît soudain.',
      es: 'Un trabajo que hacías desde hace mucho desaparece de repente.',
    },
    options: [
      { type: 'fight', text: { ko: '즉시 다음 기회를 찾아 적극 행동한다', en: 'Immediately seek the next opportunity and act actively', ja: 'すぐに次の機会を探して積極的に行動する', zh: '马上寻找下一个机会，积极行动', fr: 'Je cherche aussitôt une nouvelle occasion et je passe à l’action', es: 'Busco enseguida la siguiente oportunidad y me pongo en marcha' } },
      { type: 'flight', text: { ko: '현실에서 도피해 과도한 취미 활동에 빠진다', en: 'Escape reality and dive into excessive hobbies', ja: '現実から逃げて過度な趣味活動に没頭する', zh: '逃避现实，过度沉迷于兴趣爱好', fr: 'Je fuis la réalité en me jetant à corps perdu dans mes loisirs', es: 'Huyo de la realidad refugiándome en exceso en mis aficiones' } },
      { type: 'freeze', text: { ko: '무기력하게 무엇도 시작할 수 없다', en: 'Feel helplessly unable to start anything', ja: '無力で何も始められない', zh: '感到无力，什么都开始不了', fr: 'Je me sens impuissant et n’arrive à rien entreprendre', es: 'Me siento impotente y no consigo empezar nada' } },
      { type: 'fawn', text: { ko: '다른 사람 눈에 약해 보이지 않으려 괜찮은 척한다', en: 'Pretend to be fine to not appear weak to others', ja: '他人に弱く見られないよう大丈夫なふりをする', zh: '为了不在别人眼里显得软弱，装作没事', fr: 'Je fais comme si tout allait bien pour ne pas paraître faible', es: 'Finjo que estoy bien para no parecer débil' } },
    ],
  },
  {
    id: 's15',
    text: {
      ko: '가까운 사람에게 크게 상처를 받았습니다.',
      en: 'You are deeply hurt by someone close to you.',
      ja: '身近な人に大きく傷つけられました。',
      zh: '你被亲近的人深深伤害了。',
      fr: 'Un proche vous a profondément blessé.',
      es: 'Alguien cercano te ha herido profundamente.',
    },
    options: [
      { type: 'fight', text: { ko: '상처를 준 사람에게 직접 마주하고 따진다', en: 'Directly confront and challenge the person who hurt me', ja: '傷つけた人に直接向き合って問い詰める', zh: '直接找伤害你的人当面理论', fr: 'J’affronte directement la personne qui m’a blessé', es: 'Me enfrento directamente a quien me hizo daño' } },
      { type: 'flight', text: { ko: '거리를 두고 관계를 회피한다', en: 'Distance myself and avoid the relationship', ja: '距離を置いて関係を回避する', zh: '拉开距离，回避这段关系', fr: 'Je prends mes distances et j’évite la relation', es: 'Pongo distancia y evito la relación' } },
      { type: 'freeze', text: { ko: '감정이 마비되고 아무것도 느껴지지 않는다', en: 'Emotions go numb and I feel nothing', ja: '感情が麻痺して何も感じられない', zh: '情绪麻木，什么都感觉不到', fr: 'Mes émotions sont engourdies, je ne ressens plus rien', es: 'Se me anestesian las emociones y no siento nada' } },
      { type: 'fawn', text: { ko: '내가 뭔가 잘못한 게 있을 거라며 스스로를 탓한다', en: 'Blame myself thinking I must have done something wrong', ja: '自分が何か悪いことをしたはずだと自分を責める', zh: '觉得一定是自己哪里做错了，责怪自己', fr: 'Je me dis que j’ai dû faire quelque chose de mal et je m’en veux', es: 'Pienso que algo habré hecho mal y me culpo' } },
    ],
  },
  {
    id: 's16',
    text: {
      ko: '오랫동안 원하던 기회가 갑자기 눈앞에 왔습니다.',
      en: 'A long-sought opportunity suddenly appears before you.',
      ja: '長い間望んでいた機会が突然目の前に現れました。',
      zh: '期盼已久的机会突然出现在眼前。',
      fr: 'Une occasion longtemps espérée se présente soudain.',
      es: 'Una oportunidad que llevabas mucho tiempo esperando aparece de repente.',
    },
    options: [
      { type: 'fight', text: { ko: '즉시 잡으려 행동한다', en: 'Act immediately to seize it', ja: 'すぐに掴もうと行動する', zh: '马上行动抓住它', fr: 'J’agis tout de suite pour la saisir', es: 'Actúo enseguida para aprovecharla' } },
      { type: 'flight', text: { ko: '실패가 두려워 핑계를 찾는다', en: 'Look for excuses out of fear of failure', ja: '失敗が怖くて言い訳を探す', zh: '害怕失败，开始找借口', fr: 'Par peur d’échouer, je me cherche des excuses', es: 'Por miedo a fracasar, busco excusas' } },
      { type: 'freeze', text: { ko: '어떻게 해야 할지 몰라 결정을 못 한다', en: 'Unable to decide, not knowing what to do', ja: 'どうすればいいかわからず決断できない', zh: '不知道该怎么办，下不了决定', fr: 'Je ne sais pas quoi faire et n’arrive pas à décider', es: 'No sé qué hacer y no consigo decidir' } },
      { type: 'fawn', text: { ko: '내가 받을 자격이 있나 의심하며 주저한다', en: 'Hesitate, doubting if I deserve it', ja: '自分にそれを受ける資格があるか疑って躊躇する', zh: '怀疑自己是否配得上，犹豫不决', fr: 'Je doute de la mériter et j’hésite', es: 'Dudo de merecerla y titubeo' } },
    ],
  },
]

const RESPONSE_TYPES: ResponseType[] = ['fight', 'flight', 'freeze', 'fawn']

interface Props { locale?: string }

export default function StressResponseTest({ locale: lp = 'ko' }: Props) {
  const locale = lang(lp)
  const lb = LABELS[locale]

  const [current, setCurrent] = useState(0)
  const [counts, setCounts] = useState<Partial<Record<ResponseType, number>>>({})
  const [result, setResult] = useState<ResponseType | null>(null)
  useRecordFinishedTest({ testId: "stress-response", title: "StressResponseTest", finished: Boolean(result) });

  function pick(type: ResponseType) {
    const newCounts = { ...counts, [type]: (counts[type] ?? 0) + 1 }
    if (current + 1 >= SCENARIOS.length) {
      const dominant = RESPONSE_TYPES.reduce(
        (a, t) => ((newCounts[t] ?? 0) > (newCounts[a] ?? 0) ? t : a),
        'fight' as ResponseType
      )
      setResult(dominant)
    }
    setCounts(newCounts)
    setCurrent(current + 1)
  }

  function restart() {
    setCurrent(0)
    setCounts({})
    setResult(null)
  }

  function share() {
    if (!result) return
    const url = window.location.href
    const t = TYPE_DATA[result][locale]
    const text = `${lb.shareMsg} — ${t.name} (${t.keyword})`
    if (navigator.share) navigator.share({ title: lb.title, text, url })
    else navigator.clipboard.writeText(url)
  }

  const finished = current >= SCENARIOS.length

  if (finished && result) {
    const t = TYPE_DATA[result][locale]
    const total = SCENARIOS.length

    return (
      <div className="space-y-6" aria-live="polite">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">{lb.title}</h1>
          <p className="text-sm text-muted-foreground">{lb.yourType}</p>
          <div
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-xl font-bold text-white"
            style={{ backgroundColor: t.color }}
          >
            <span aria-hidden="true">{t.emoji}</span>
            {t.name}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{t.description}</p>
        </div>

        <div className="rounded-xl border bg-card p-4 space-y-3">
          <h3 className="font-semibold text-sm">{lb.dimLabel}</h3>
          {RESPONSE_TYPES.map(rt => {
            const count = counts[rt] ?? 0
            const pct = Math.round((count / total) * 100)
            const d = TYPE_DATA[rt][locale]
            return (
              <div key={rt} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="flex items-center gap-1">
                    <span aria-hidden="true">{d.emoji}</span>
                    <span className="font-medium">{d.name}</span>
                  </span>
                  <span className="font-bold" style={{ color: d.color }}>{pct}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: d.color }}
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={d.name}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="rounded-xl border bg-card p-4 space-y-2">
          <h3 className="font-semibold text-sm">{lb.bodySignals}</h3>
          <ul className="space-y-1">
            {t.bodySignals.map(s => (
              <li key={s} className="text-sm text-muted-foreground flex gap-2">
                <span>•</span>{s}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border bg-card p-4 space-y-2">
          <h3 className="font-semibold text-sm text-green-600">{lb.tips}</h3>
          <ul className="space-y-1">
            {t.tips.map(tip => (
              <li key={tip} className="text-sm text-muted-foreground flex gap-2">
                <span style={{ color: t.color }}>→</span>{tip}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="rounded-xl p-4"
          style={{ border: `1px solid ${t.color}40`, background: `${t.color}08` }}
        >
          <p className="text-sm text-center" style={{ color: t.color }}>"{t.affirmation}"</p>
        </div>

        <p className="text-center text-xs text-muted-foreground">{lb.note}</p>

        <div className="flex gap-3">
          <button
            onClick={restart}
            className="flex-1 rounded-lg border bg-card px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
          >
            {lb.restart}
          </button>
          <button
            onClick={share}
            className="flex-1 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {lb.share}
          </button>
        </div>
        <ShareResultButton locale={lp} heading={lb.title} resultTitle={t.name} />
      </div>
    )
  }

  const s = SCENARIOS[current]
  const progress = Math.round((current / SCENARIOS.length) * 100)

  return (
    <Questionnaire<string>
      title={lb.title}
      subtitle={lb.subtitle}
      question={s.text[locale]}
      questionLabel={lb.questionOf(current + 1, SCENARIOS.length)}
      progress={progress}
      options={s.options.map((opt) => ({ label: opt.text[locale], value: opt.type }))}
      note={lb.note}
      onSelect={(value) => pick(value as ResponseType)}
    />
  )
}
