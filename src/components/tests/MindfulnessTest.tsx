import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { Questionnaire } from '@/components/ui/questionnaire'
import ShareResultButton from '../shared/ShareResultButton'

type SupportedLang = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'
type Level = 'autopilot' | 'developing' | 'mindful' | 'deeply_present'

function lang(locale: string): SupportedLang {
  return (['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const).includes(locale as SupportedLang)
    ? (locale as SupportedLang)
    : 'en'
}

interface Question { id: string; text: string }
interface LevelData {
  title: string; subtitle: string; description: string
  insights: string[]; practices: string[]; affirmation: string
}

const LABELS: Record<SupportedLang, {
  title: string; subtitle: string; questionOf: (c: number, t: number) => string
  scaleLabels: [string, string, string, string, string, string]
  restart: string; share: string; shareMsg: string; yourLevel: string
  insights: string; practices: string; affirmation: string
  scoreLabel: string; outOf: string; note: string
}> = {
  ko: {
    title: '마음챙김 수준 테스트',
    subtitle: '나는 지금 이 순간에 얼마나 있는가?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['거의 항상', '매우 자주', '자주', '가끔', '드물게', '거의 없다'],
    restart: '다시 하기', share: '결과 공유', shareMsg: '나의 마음챙김 수준은',
    yourLevel: '나의 마음챙김 수준', insights: '현재 패턴', practices: '수련 방법',
    affirmation: '오늘의 메시지', scoreLabel: '마음챙김 점수', outOf: '/ 90점',
    note: '이 테스트는 MAAS(마음챙김 주의 인식 척도)를 기반으로 한 참고용 자가 진단입니다.',
  },
  en: {
    title: 'Mindfulness Test',
    subtitle: 'How Present Are You in the Moment?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Almost Always', 'Very Often', 'Often', 'Sometimes', 'Rarely', 'Almost Never'],
    restart: 'Retake', share: 'Share Result', shareMsg: 'My mindfulness level is',
    yourLevel: 'Your Mindfulness Level', insights: 'Current Patterns', practices: 'Practice Ideas',
    affirmation: "Today's Message", scoreLabel: 'Mindfulness Score', outOf: '/ 90',
    note: 'This test is based on the MAAS (Mindful Attention Awareness Scale) and is for reference only.',
  },
  ja: {
    title: 'マインドフルネステスト',
    subtitle: '私は今この瞬間にどのくらいいるか？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['ほぼいつも', '非常によく', 'よく', 'たまに', 'めったに', 'ほぼない'],
    restart: 'もう一度', share: '結果を共有', shareMsg: '私のマインドフルネスレベルは',
    yourLevel: 'マインドフルネスレベル', insights: '現在のパターン', practices: '実践方法',
    affirmation: '今日のメッセージ', scoreLabel: 'マインドフルネススコア', outOf: '/ 90点',
    note: 'このテストはMAAS（マインドフル注意・認識尺度）を参考にした自己診断です。',
  },
  zh: {
    title: '正念程度测验',
    subtitle: '此刻，我有多在场？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['几乎总是', '非常频繁', '经常', '偶尔', '很少', '几乎没有'],
    restart: '重新测验', share: '分享结果', shareMsg: '我的正念程度是',
    yourLevel: '我的正念程度', insights: '现在的模式', practices: '可以练的方法',
    affirmation: '今天想对你说', scoreLabel: '正念分数', outOf: '/ 90 分',
    note: '本测验参考 MAAS（正念注意觉知量表），属于参考性的自我观察。',
  },
  fr: {
    title: 'Test du niveau de pleine conscience',
    subtitle: 'À quel point suis-je présent à cet instant ?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Presque toujours', 'Très souvent', 'Souvent', 'Parfois', 'Rarement', 'Presque jamais'],
    restart: 'Recommencer', share: 'Partager le résultat', shareMsg: 'Mon niveau de présence',
    yourLevel: 'Votre niveau de présence', insights: 'Ce qui se passe en ce moment', practices: 'Pratiques possibles',
    affirmation: 'Un mot pour aujourd’hui', scoreLabel: 'Score de pleine conscience', outOf: '/ 90 points',
    note: 'Ce test s’inspire de l’échelle MAAS ; c’est une observation de soi, à titre indicatif.',
  },
  es: {
    title: 'Test de atención plena',
    subtitle: '¿Cuán presente estoy en este momento?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Casi siempre', 'Muy a menudo', 'A menudo', 'A veces', 'Rara vez', 'Casi nunca'],
    restart: 'Repetir', share: 'Compartir resultado', shareMsg: 'Mi nivel de presencia',
    yourLevel: 'Tu nivel de presencia', insights: 'Lo que pasa ahora', practices: 'Prácticas posibles',
    affirmation: 'Algo para hoy', scoreLabel: 'Puntuación de atención plena', outOf: '/ 90 puntos',
    note: 'Este test se inspira en la escala MAAS; es una autoobservación orientativa.',
  },
}

// MAAS items are reverse-scored: answering "Almost Always" (index 0, value 1)
// means LOW mindfulness. We store raw answer (1–6) and final score = sum of answers.
// Higher sum = higher mindfulness. Scale: 1=Almost Always (worst) to 6=Almost Never (best).
const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 'q1',  text: '어떤 감정을 경험하고 있는지 모른 채 시간이 지나있다' },
    { id: 'q2',  text: '물건을 어디 뒀는지 기억이 안 나서 찾게 된다' },
    { id: 'q3',  text: '하고 있는 일에 집중하지 못하고 다른 생각을 한다' },
    { id: 'q4',  text: '어디로 가는지 생각 없이 자동으로 걸어가고 있다' },
    { id: 'q5',  text: '과거나 미래 걱정 때문에 현재 순간을 즐기지 못한다' },
    { id: 'q6',  text: '대화 중에 상대방이 한 말을 금방 잊어버린다' },
    { id: 'q7',  text: '목적지에 도착했는데 어떻게 왔는지 기억이 없다' },
    { id: 'q8',  text: '하던 일을 마치고 나서도 그 기억이 잘 나지 않는다' },
    { id: 'q9',  text: '현재 하고 있는 일보다 다른 무언가를 생각하고 있다' },
    { id: 'q10', text: '몸의 긴장이나 불편함을 느끼다가 얼마 지나서야 알아차린다' },
    { id: 'q11', text: '의식하지 않고 음식을 먹거나 음료를 마신다' },
    { id: 'q12', text: '계획에 지나치게 집중하느라 지금을 놓친다' },
    { id: 'q13', text: '반복적인 생각이나 걱정이 머릿속을 맴돈다' },
    { id: 'q14', text: '무언가를 하면서 동시에 다른 일을 생각한다' },
    { id: 'q15', text: '감각(냄새, 소리, 촉감 등)을 의식적으로 느끼지 못하고 지나친다' },
  ],
  en: [
    { id: 'q1',  text: 'Time passes without me being aware of what I am feeling' },
    { id: 'q2',  text: 'I misplace things and have to search for them' },
    { id: 'q3',  text: 'I find myself on autopilot while doing something' },
    { id: 'q4',  text: 'I walk somewhere without paying attention to the journey' },
    { id: 'q5',  text: 'Worries about the past or future prevent me from enjoying the present' },
    { id: 'q6',  text: 'I quickly forget what someone said during a conversation' },
    { id: 'q7',  text: 'I arrive somewhere and cannot recall how I got there' },
    { id: 'q8',  text: 'After completing a task, I have little memory of doing it' },
    { id: 'q9',  text: 'My mind is somewhere else while I am doing something' },
    { id: 'q10', text: 'I notice physical tension or discomfort only long after it started' },
    { id: 'q11', text: 'I eat or drink without being aware of what I am consuming' },
    { id: 'q12', text: 'I get so focused on a future goal that I miss what is happening now' },
    { id: 'q13', text: 'Repetitive thoughts or worries loop through my mind' },
    { id: 'q14', text: 'I do one thing while thinking about something else entirely' },
    { id: 'q15', text: 'I pass through sensory experiences (smell, sound, touch) without noticing them' },
  ],
  ja: [
    { id: 'q1',  text: '自分がどんな感情を感じているか気づかずに時間が過ぎる' },
    { id: 'q2',  text: '物をどこに置いたか覚えていなくて探すことになる' },
    { id: 'q3',  text: 'していることに集中できず、他のことを考えている' },
    { id: 'q4',  text: 'どこへ行くか考えずに自動的に歩いている' },
    { id: 'q5',  text: '過去や将来の心配で今この瞬間を楽しめない' },
    { id: 'q6',  text: '会話中に相手が言ったことをすぐ忘れてしまう' },
    { id: 'q7',  text: '目的地に着いたのに、どうやって来たか覚えていない' },
    { id: 'q8',  text: 'やり終えた後もその記憶があまりない' },
    { id: 'q9',  text: 'していることより他の何かを考えている' },
    { id: 'q10', text: '体の緊張や不快感を感じてから、しばらく後に気づく' },
    { id: 'q11', text: '意識せずに食事や飲み物を口にする' },
    { id: 'q12', text: '計画に集中しすぎて今この瞬間を見逃す' },
    { id: 'q13', text: '繰り返す考えや心配が頭の中を巡る' },
    { id: 'q14', text: '何かをしながら同時に別のことを考える' },
    { id: 'q15', text: '感覚（匂い、音、触感など）を意識せずに通り過ぎる' },
  ],
  zh: [
    { id: 'q1',  text: '时间过去了，我却不知道自己当时在感受什么' },
    { id: 'q2',  text: '东西放哪了想不起来，得到处找' },
    { id: 'q3',  text: '做着事却分心，脑子跑到别处' },
    { id: 'q4',  text: '没想着要去哪，脚就自动走了' },
    { id: 'q5',  text: '被过去或对未来的担心占住，享受不了当下' },
    { id: 'q6',  text: '聊着天，对方刚说的话很快就忘了' },
    { id: 'q7',  text: '到了目的地，却想不起自己是怎么来的' },
    { id: 'q8',  text: '事情做完了，过程却记不太清' },
    { id: 'q9',  text: '手上在做这件事，心里想的是别的' },
    { id: 'q10', text: '身体的紧绷或不舒服，过了好一会儿才察觉' },
    { id: 'q11', text: '吃东西、喝东西时是无意识的' },
    { id: 'q12', text: '太盯着计划，把此刻放掉了' },
    { id: 'q13', text: '同一个念头或担心在脑子里绕来绕去' },
    { id: 'q14', text: '一边做事，一边想着另一件事' },
    { id: 'q15', text: '气味、声音、触感就那样过去了，没有留意' },
  ],
  fr: [
    { id: 'q1',  text: 'Le temps passe et je ne sais pas ce que je ressentais' },
    { id: 'q2',  text: 'Je ne sais plus où j’ai posé les choses et je dois les chercher' },
    { id: 'q3',  text: 'Je fais quelque chose mais mon esprit est ailleurs' },
    { id: 'q4',  text: 'Je marche en pilotage automatique, sans penser où je vais' },
    { id: 'q5',  text: 'Le passé ou les soucis d’avenir m’empêchent de profiter du présent' },
    { id: 'q6',  text: 'En pleine conversation, j’oublie vite ce que l’autre vient de dire' },
    { id: 'q7',  text: 'J’arrive quelque part sans me rappeler comment j’y suis venu' },
    { id: 'q8',  text: 'Une fois la tâche finie, je m’en souviens mal' },
    { id: 'q9',  text: 'Je pense à autre chose que ce que je suis en train de faire' },
    { id: 'q10', text: 'Je remarque une tension ou une gêne du corps longtemps après' },
    { id: 'q11', text: 'Je mange ou je bois sans y prêter attention' },
    { id: 'q12', text: 'À trop me concentrer sur le plan, je manque l’instant' },
    { id: 'q13', text: 'Une pensée ou une inquiétude tourne en boucle' },
    { id: 'q14', text: 'Je fais une chose en pensant à une autre' },
    { id: 'q15', text: 'Les odeurs, les sons, les textures passent sans que je les remarque' },
  ],
  es: [
    { id: 'q1',  text: 'Pasa el tiempo y no sé qué estaba sintiendo' },
    { id: 'q2',  text: 'No recuerdo dónde dejé las cosas y tengo que buscarlas' },
    { id: 'q3',  text: 'Estoy haciendo algo pero la cabeza se va a otro sitio' },
    { id: 'q4',  text: 'Camino en piloto automático, sin pensar adónde voy' },
    { id: 'q5',  text: 'El pasado o la preocupación por el futuro no me dejan disfrutar el presente' },
    { id: 'q6',  text: 'En plena conversación olvido enseguida lo que acaban de decirme' },
    { id: 'q7',  text: 'Llego a un sitio sin recordar cómo he llegado' },
    { id: 'q8',  text: 'Termino algo y luego lo recuerdo mal' },
    { id: 'q9',  text: 'Pienso en otra cosa distinta de lo que estoy haciendo' },
    { id: 'q10', text: 'Noto la tensión o molestia del cuerpo mucho después' },
    { id: 'q11', text: 'Como o bebo sin prestar atención' },
    { id: 'q12', text: 'De tanto mirar el plan, me pierdo el momento' },
    { id: 'q13', text: 'Un pensamiento o una preocupación da vueltas sin parar' },
    { id: 'q14', text: 'Hago una cosa mientras pienso en otra' },
    { id: 'q15', text: 'Los olores, los sonidos y las texturas pasan sin que los note' },
  ],
}

const RESULTS: Record<Level, Record<SupportedLang, LevelData>> = {
  autopilot: {
    ko: {
      title: '자동조종 상태', subtitle: '마음이 자주 현재를 떠나 있습니다',
      description: '현재 순간보다 과거나 미래에 마음이 머무는 시간이 많습니다. 자동적인 생각의 흐름에 따라 움직이고 있어, 지금 이 순간의 경험을 충분히 느끼지 못하고 있습니다. 이것은 누구에게나 일어나는 자연스러운 상태입니다.',
      insights: ['자동적 사고 패턴이 강함', '현재 감각보다 생각에 집중', '반추와 걱정이 많음', '순간 인식이 낮은 편'],
      practices: ['하루 3분 호흡 관찰부터 시작하기', '밥 먹을 때 음식의 맛에만 집중하기', '걸을 때 발이 땅에 닿는 감각 느끼기', '알람을 맞춰두고 현재 감각 체크하기'],
      affirmation: '지금 이 순간, 당신이 이 질문을 하고 있다는 것 자체가 시작입니다. 마음챙김은 완벽하지 않아도 됩니다.',
    },
    en: {
      title: 'Autopilot Mode', subtitle: 'Your mind frequently drifts away from the present',
      description: 'You spend more mental time in the past or future than in the present. You are largely moving on autopilot, and the richness of each moment may often go unnoticed. This is a very common human experience.',
      insights: ['Strong automatic thought patterns', 'More focused on thoughts than sensations', 'Frequent rumination and worry', 'Low moment-to-moment awareness'],
      practices: ['Start with 3-minute breath observation daily', 'Focus only on the taste of food during meals', 'Feel the sensation of your feet touching the ground when walking', 'Set alarms to briefly check in with your senses'],
      affirmation: 'The fact that you are asking this question right now is itself a beginning. Mindfulness does not need to be perfect.',
    },
    ja: {
      title: 'オートパイロット状態', subtitle: '心が頻繁に今から離れています',
      description: '今この瞬間よりも、過去や未来に心が留まる時間が多いです。自動的な思考の流れに従って動いており、今この瞬間の体験を十分に感じられていません。これは誰にでも起こる自然な状態です。',
      insights: ['自動的思考パターンが強い', '感覚より思考に集中', '反芻と心配が多い', '瞬間の気づきが低い'],
      practices: ['毎日3分間の呼吸観察から始める', '食事中は食べ物の味だけに集中する', '歩くとき足が地面に触れる感覚を感じる', 'アラームを設定して感覚をチェックする'],
      affirmation: '今この瞬間にこの問いを立てていること自体が始まりです。マインドフルネスは完璧でなくていいです。',
    },
    zh: {
      title: '自动驾驶状态', subtitle: '心常常不在此刻',
      description: '比起当下，你的心更多停在过去或未来。被自动的念头带着走，此刻的体验没能好好感受到。这在谁身上都会发生，很自然。',
      insights: ['自动化的想法占上风', '注意力偏向念头，少在感官', '反刍和担心比较多', '对当下的觉察偏低'],
      practices: ['每天先从三分钟观呼吸开始', '吃饭时只专心在食物的味道上', '走路时感觉脚接触地面', '设个提醒，定时回来感受当下'],
      affirmation: '此刻你正在问这个问题，这本身就是开始。正念不必做到完美。',
    },
    fr: {
      title: 'Pilotage automatique', subtitle: 'L’esprit quitte souvent le présent',
      description: 'Votre esprit séjourne plus dans le passé ou l’avenir que dans l’instant. Porté par le flot automatique des pensées, vous ne ressentez pas pleinement ce qui se passe maintenant. C’est un état très ordinaire.',
      insights: ['Des schémas de pensée automatiques dominants', 'L’attention va aux pensées plus qu’aux sensations', 'Beaucoup de rumination et d’inquiétude', 'Une conscience du moment plutôt basse'],
      practices: ['Commencer par trois minutes d’attention au souffle', 'Ne se concentrer que sur le goût, pendant le repas', 'Sentir le contact du pied au sol en marchant', 'Mettre une alarme pour revenir aux sensations du moment'],
      affirmation: 'Le fait même de vous poser la question est un début. La pleine conscience n’a pas à être parfaite.',
    },
    es: {
      title: 'Piloto automático', subtitle: 'La mente se va a menudo del presente',
      description: 'Tu mente está más en el pasado o en el futuro que en el momento. Llevado por el flujo automático de los pensamientos, no acabas de sentir lo que pasa ahora. Es un estado muy común.',
      insights: ['Predominan los patrones de pensamiento automáticos', 'La atención va a los pensamientos más que a las sensaciones', 'Bastante rumiación y preocupación', 'Conciencia del momento más bien baja'],
      practices: ['Empezar por tres minutos de atención a la respiración', 'Al comer, concentrarte solo en el sabor', 'Al caminar, sentir el pie que toca el suelo', 'Poner una alarma para volver a las sensaciones del momento'],
      affirmation: 'El hecho mismo de preguntártelo ya es un comienzo. La atención plena no tiene que ser perfecta.',
    },
  },
  developing: {
    ko: {
      title: '발전 중', subtitle: '마음챙김의 씨앗이 자라고 있습니다',
      description: '가끔은 현재 순간을 의식하지만, 아직 자동적 사고 패턴이 자주 개입합니다. 마음챙김을 향해 나아가고 있는 과도기 단계입니다. 의도적인 연습이 이 상태를 크게 변화시킬 수 있습니다.',
      insights: ['순간 인식이 점차 늘고 있음', '때때로 현재에 집중하는 능력 발현', '연습에 따라 빠르게 발전 가능', '자기 인식이 높아지는 시기'],
      practices: ['명상 앱으로 5-10분 하루 시작하기', '감사 일지 쓰기', '자연 속 걷기를 마음챙김 실천으로 활용', '감정 레이블링 연습하기'],
      affirmation: '변화는 이미 시작되었습니다. 조금씩, 매일 조금씩 현재에 더 머무르게 됩니다.',
    },
    en: {
      title: 'Developing', subtitle: 'Seeds of mindfulness are growing',
      description: 'You occasionally notice the present moment, but automatic thought patterns still frequently intervene. You are in a transitional phase moving toward greater mindfulness. Intentional practice can bring rapid improvement from here.',
      insights: ['Moment awareness is gradually increasing', 'Ability to focus on the present emerges at times', 'Capable of quick development with practice', 'Self-awareness is growing'],
      practices: ['Use a meditation app for 5-10 minutes to start each day', 'Keep a gratitude journal', 'Use walks in nature as mindfulness practice', 'Practice labeling your emotions'],
      affirmation: 'Change has already begun. Day by day, you will find yourself more present.',
    },
    ja: {
      title: '発展中', subtitle: 'マインドフルネスの種が育っています',
      description: '時々今この瞬間を意識しますが、まだ自動的思考パターンが頻繁に介入します。マインドフルネスへと向かう過渡期です。意図的な練習がこの状態を大きく変えることができます。',
      insights: ['瞬間の気づきが徐々に増加', '時々現在に集中する能力が現れる', '練習次第で素早く発展可能', '自己認識が高まっている時期'],
      practices: ['瞑想アプリで1日5〜10分から始める', '感謝日記をつける', '自然の中の散歩をマインドフルネス実践に活用', '感情ラベリングを練習する'],
      affirmation: '変化はすでに始まっています。少しずつ、毎日少しずつ、より現在にいられるようになります。',
    },
    zh: {
      title: '成长中', subtitle: '正念的种子在长',
      description: '有时候你能意识到当下，但自动的念头还常常插进来。你正走在路上，属于过渡的阶段。刻意练习能让这个状态变化不少。',
      insights: ['对当下的觉察在慢慢变多', '偶尔能把注意力放回此刻', '只要练，进步会很快', '自我觉察正在提高的时期'],
      practices: ['用冥想应用每天做五到十分钟', '写感谢日记', '把在自然里散步当成练习', '练习给情绪命名'],
      affirmation: '变化已经开始了。一点一点，每天多留在当下一点。',
    },
    fr: {
      title: 'En développement', subtitle: 'La graine de la présence pousse',
      description: 'Vous percevez parfois l’instant, mais les pensées automatiques s’invitent encore souvent. Vous êtes dans une phase de transition, et une pratique volontaire peut beaucoup changer cet état.',
      insights: ['La conscience du moment augmente peu à peu', 'Par moments, l’attention revient au présent', 'Des progrès rapides avec de la pratique', 'Une période où la conscience de soi grandit'],
      practices: ['Cinq à dix minutes par jour avec une application de méditation', 'Tenir un journal de gratitude', 'Faire de la marche en nature une pratique', 'S’exercer à nommer ses émotions'],
      affirmation: 'Le changement a déjà commencé. Peu à peu, chaque jour, vous restez un peu plus dans le présent.',
    },
    es: {
      title: 'En desarrollo', subtitle: 'La semilla de la presencia crece',
      description: 'A veces percibes el momento, pero los pensamientos automáticos siguen colándose. Estás en una fase de transición, y practicar a propósito puede cambiar bastante este estado.',
      insights: ['La conciencia del momento va creciendo', 'A ratos la atención vuelve al presente', 'Con práctica, el avance es rápido', 'Una etapa en que crece la conciencia de uno mismo'],
      practices: ['Cinco o diez minutos al día con una app de meditación', 'Llevar un diario de gratitud', 'Convertir el paseo por la naturaleza en práctica', 'Practicar ponerle nombre a las emociones'],
      affirmation: 'El cambio ya empezó. Poco a poco, cada día te quedas un poco más en el presente.',
    },
  },
  mindful: {
    ko: {
      title: '마음챙김형', subtitle: '현재 순간과 꽤 잘 연결되어 있습니다',
      description: '일상에서 현재 순간을 인식하는 능력이 잘 발달되어 있습니다. 생각이 떠오를 때 그것을 알아차리고, 감각과 감정에 주의를 기울이는 습관이 형성되어 있습니다.',
      insights: ['안정적인 현재 인식 능력', '감각과 감정에 주의 기울임', '자동 반응보다 의식적 반응', '스트레스 회복력이 높은 편'],
      practices: ['더 깊은 명상 수련으로 발전시키기', '마음챙김을 어려운 순간에 적용하기', '다른 사람과 함께 실천 공유하기', '자기 연민 수련 추가하기'],
      affirmation: '당신은 이미 현재와 좋은 관계를 맺고 있습니다. 이 능력은 당신과 주변을 동시에 풍요롭게 합니다.',
    },
    en: {
      title: 'Mindful', subtitle: 'You are fairly well connected to the present moment',
      description: 'Your ability to notice the present moment is well developed in daily life. You have built habits of noticing when thoughts arise, and paying attention to sensations and emotions.',
      insights: ['Stable present-moment awareness', 'Attention to sensations and emotions', 'Conscious responses over automatic reactions', 'Higher stress resilience'],
      practices: ['Advance to deeper meditation practice', 'Apply mindfulness in difficult moments', 'Share practice with others', 'Add self-compassion exercises'],
      affirmation: 'You already have a good relationship with the present. This ability enriches both you and those around you.',
    },
    ja: {
      title: 'マインドフル型', subtitle: '今この瞬間とかなりよくつながっています',
      description: '日常で今この瞬間を認識する能力がよく発達しています。思考が浮かんだとき気づき、感覚と感情に注意を向ける習慣が形成されています。',
      insights: ['安定した現在の気づき', '感覚と感情への注意', '自動反応より意識的な反応', 'ストレス回復力が高い'],
      practices: ['より深い瞑想の修練に進む', '難しい瞬間にマインドフルネスを適用する', '他の人と実践を共有する', '自己慈悲の修練を追加する'],
      affirmation: 'あなたはすでに現在と良い関係を築いています。この能力はあなたと周囲を同時に豊かにします。',
    },
    zh: {
      title: '正念型', subtitle: '和当下连得不错',
      description: '在日常里，你对当下的觉察发展得不错。念头冒出来时你能看见它，也习惯把注意力放在感受和情绪上。',
      insights: ['对当下的觉察是稳的', '留意得到感觉和情绪', '比起自动反应，更多是有意识的回应', '从压力中恢复的力量较好'],
      practices: ['用更深的冥想把它带得更远', '把正念用在难的时刻', '和别人一起分享练习', '再加上自我体谅的练习'],
      affirmation: '你已经和当下建立了不错的关系。这份能力同时滋养你和周围的人。',
    },
    fr: {
      title: 'Présent', subtitle: 'Vous êtes plutôt bien relié à l’instant',
      description: 'Au quotidien, votre conscience du moment est bien développée. Vous repérez les pensées qui surgissent et vous avez pris l’habitude d’accorder de l’attention aux sensations et aux émotions.',
      insights: ['Une conscience du moment stable', 'De l’attention aux sensations et aux émotions', 'Des réponses conscientes plutôt que des réactions automatiques', 'Une bonne capacité à récupérer du stress'],
      practices: ['Approfondir avec une pratique de méditation plus soutenue', 'Appliquer la présence aux moments difficiles', 'Partager la pratique avec d’autres', 'Y ajouter la bienveillance envers soi'],
      affirmation: 'Vous entretenez déjà une belle relation avec le présent. Cette capacité nourrit à la fois vous et votre entourage.',
    },
    es: {
      title: 'Presente', subtitle: 'Estás bastante bien conectado con el momento',
      description: 'En el día a día tu conciencia del presente está bien desarrollada. Ves los pensamientos cuando aparecen y tienes el hábito de atender a las sensaciones y las emociones.',
      insights: ['Conciencia del momento estable', 'Atiendes a sensaciones y emociones', 'Respuestas conscientes antes que reacciones automáticas', 'Buena capacidad de recuperarte del estrés'],
      practices: ['Profundizar con una práctica de meditación más sostenida', 'Llevar la presencia a los momentos difíciles', 'Compartir la práctica con otros', 'Añadirle la amabilidad contigo mismo'],
      affirmation: 'Ya mantienes una buena relación con el presente. Esa capacidad alimenta a la vez a ti y a los tuyos.',
    },
  },
  deeply_present: {
    ko: {
      title: '깊은 현재형', subtitle: '지금 이 순간을 깊이 살고 있습니다',
      description: '일상에서 현재 순간과 깊이 연결되어 있습니다. 생각, 감각, 감정의 흐름을 자연스럽게 관찰하며 살아가는 능력이 높습니다. 이 수준의 마음챙김은 꾸준한 연습과 자기 인식의 결과입니다.',
      insights: ['높은 수준의 현재 인식', '자동적 반응에서 자유로움', '감정과 생각을 관찰자 시각으로 봄', '내면의 평온이 안정적'],
      practices: ['더 깊은 수련 방식 탐색(명상 리트릿 등)', '주변 사람들과 마음챙김 나누기', '자기 연민과 공감 수련 심화', '어려운 감정과의 작업 심화'],
      affirmation: '당신의 현존은 그 자체로 주변 사람들에게 선물입니다. 이 능력을 소중히 가꾸어 나가세요.',
    },
    en: {
      title: 'Deeply Present', subtitle: 'You live deeply in the present moment',
      description: 'You are deeply connected to the present moment in daily life. You have a high capacity to naturally observe the flow of thoughts, sensations, and emotions. This level of mindfulness is the result of consistent practice and self-awareness.',
      insights: ['High-level present-moment awareness', 'Freedom from automatic reactions', 'Observer perspective on thoughts and emotions', 'Stable inner calm'],
      practices: ['Explore deeper practices (retreats, etc.)', 'Share mindfulness with those around you', 'Deepen self-compassion and empathy work', 'Work with difficult emotions at depth'],
      affirmation: 'Your presence is itself a gift to those around you. Cherish and continue nurturing this ability.',
    },
    ja: {
      title: '深い現在型', subtitle: '今この瞬間を深く生きています',
      description: '日常で今この瞬間と深くつながっています。思考、感覚、感情の流れを自然に観察しながら生きる能力が高いです。このレベルのマインドフルネスは、継続的な練習と自己認識の結果です。',
      insights: ['高水準の現在の気づき', '自動的反応からの自由', '思考と感情を観察者の視点で見る', '内面の平静が安定している'],
      practices: ['より深い修練法を探索（リトリートなど）', '周囲の人々とマインドフルネスを分かち合う', '自己慈悲と共感の修練を深める', '難しい感情との作業を深める'],
      affirmation: 'あなたの現在への存在は、それ自体が周囲への贈り物です。この能力を大切に育てていってください。',
    },
    zh: {
      title: '深度在场', subtitle: '你把此刻活得很深',
      description: '在日常里，你和当下连得很深。能自然地观察念头、感觉和情绪的流动。这个程度的正念，是长期练习和自我觉察的结果。',
      insights: ['对当下的觉察程度高', '不被自动反应牵着走', '能以观察者的角度看念头和情绪', '内在的平静比较稳'],
      practices: ['去探索更深的练习方式（如禅修营）', '把正念分给身边的人', '把自我体谅和同理练得更深', '深入处理难的情绪'],
      affirmation: '你的在场本身，对身边的人就是一份礼物。好好把这份能力养着。',
    },
    fr: {
      title: 'Profondément présent', subtitle: 'Vous vivez l’instant en profondeur',
      description: 'Au quotidien, vous êtes profondément relié au présent. Vous observez naturellement le flux des pensées, des sensations et des émotions. Ce niveau de présence est le fruit d’une pratique constante et d’une conscience de soi travaillée.',
      insights: ['Un haut degré de conscience du moment', 'Libre des réactions automatiques', 'Vous regardez pensées et émotions en observateur', 'Un calme intérieur stable'],
      practices: ['Explorer des formes de pratique plus profondes (retraites, par exemple)', 'Partager la présence avec votre entourage', 'Approfondir la bienveillance et l’empathie', 'Travailler plus loin avec les émotions difficiles'],
      affirmation: 'Votre présence est en elle-même un cadeau pour les autres. Continuez à cultiver cette capacité.',
    },
    es: {
      title: 'Profundamente presente', subtitle: 'Vives el momento con hondura',
      description: 'En el día a día estás profundamente conectado con el presente. Observas con naturalidad el flujo de pensamientos, sensaciones y emociones. Este nivel de presencia es fruto de práctica constante y de conciencia de uno mismo.',
      insights: ['Alto grado de conciencia del momento', 'Libre de las reacciones automáticas', 'Miras pensamientos y emociones como observador', 'Calma interior estable'],
      practices: ['Explorar prácticas más profundas (retiros, por ejemplo)', 'Compartir la presencia con los tuyos', 'Profundizar en la amabilidad y la empatía', 'Trabajar más a fondo con las emociones difíciles'],
      affirmation: 'Tu presencia ya es un regalo para quienes te rodean. Sigue cultivando esa capacidad.',
    },
  },
}

function getLevel(score: number): Level {
  if (score <= 30) return 'autopilot'
  if (score <= 50) return 'developing'
  if (score <= 70) return 'mindful'
  return 'deeply_present'
}

interface Props { locale?: string }

export default function MindfulnessTest({ locale: lp = 'ko' }: Props) {
  const locale = lang(lp)
  const lb = LABELS[locale]
  const questions = QUESTIONS[locale]

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [result, setResult] = useState<{ level: Level; score: number } | null>(null)
  useRecordFinishedTest({ testId: "mindfulness", title: "MindfulnessTest", finished: Boolean(result) });

  function pick(val: number) {
    // val is index 0–5; score value is index+1 (1=Almost Always to 6=Almost Never)
    const scoreVal = val + 1
    // 되돌아가서 다시 고르면 그 뒤 응답은 버린다 — 이어붙이기(append)면 되돌리기가 성립하지 않는다.
    const newAns = answers.slice(0, current)
    newAns[current] = scoreVal
    if (current + 1 >= questions.length) {
      const total = newAns.reduce((s, v) => s + v, 0)
      setResult({ level: getLevel(total), score: total })
    }
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
      <Questionnaire
        title={lb.title}
        subtitle={lb.subtitle}
        question={q.text}
        questionLabel={lb.questionOf(current + 1, questions.length)}
        progress={progress}
        options={lb.scaleLabels.map((label, i) => ({ label, value: i + 1 }))}
        selectedValue={answers[current]}
        note={lb.note}
        previousLabel={(({ ko: '이전 질문', en: 'Previous question', ja: '前の質問', zh: '上一题', fr: 'Question précédente', es: 'Pregunta anterior' } as Record<string, string>)[locale] ?? 'Previous question')}
        onPrevious={current > 0 ? () => setCurrent(current - 1) : undefined}
        onSelect={(value) => pick(value - 1)}
      />
    )
  }

  if (!result) return null
  const r = RESULTS[result.level][locale]
  const pct = Math.round((result.score / 90) * 100)
  const levelColors: Record<Level, string> = {
    autopilot: '#94a3b8', developing: '#f59e0b', mindful: '#22c55e', deeply_present: '#16a34a',
  }
  const color = levelColors[result.level]

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm" style={{ color: 'var(--muted-foreground, #6b7280)' }}>{lb.yourLevel}</p>
        <div className="inline-block rounded-full px-5 py-2 text-xl font-bold text-white" style={{ backgroundColor: color }}>
          {r.title}
        </div>
        <p className="font-bold" style={{ color: 'var(--muted-foreground, #6b7280)' }}>{r.subtitle}</p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground, #6b7280)' }}>{r.description}</p>
      </div>

      <div className="rounded-xl border p-4 space-y-2" style={{ backgroundColor: 'var(--card, #fff)' }}>
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold">{lb.scoreLabel}</span>
          <span className="text-lg font-bold" style={{ color }}>{result.score} {lb.outOf}</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={lb.scoreLabel}
          className="h-3 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--muted, #e5e7eb)' }}
        >
          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
        </div>
      </div>

      <div className="rounded-xl border p-4 space-y-2" style={{ backgroundColor: 'var(--card, #fff)' }}>
        <h3 className="font-bold text-sm">{lb.insights}</h3>
        <ul className="space-y-1">
          {r.insights.map(s => (
            <li key={s} className="text-sm flex gap-2" style={{ color: 'var(--muted-foreground, #6b7280)' }}><span>•</span>{s}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border p-4 space-y-2" style={{ backgroundColor: 'var(--card, #fff)' }}>
        <h3 className="font-bold text-sm" style={{ color: '#16a34a' }}>{lb.practices}</h3>
        <ul className="space-y-1">
          {r.practices.map(p => (
            <li key={p} className="text-sm flex gap-2" style={{ color: 'var(--muted-foreground, #6b7280)' }}><span style={{ color: '#22c55e' }}>→</span>{p}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border p-4 space-y-1" style={{ borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' }}>
        <h3 className="font-bold text-sm" style={{ color: '#16a34a' }}>{lb.affirmation}</h3>
        <p className="text-sm" style={{ color: '#15803d' }}>"{r.affirmation}"</p>
      </div>

      <p className="text-center text-xs" style={{ color: 'var(--muted-foreground, #6b7280)' }}>{lb.note}</p>

      <div className="flex gap-3">
        <button
          onClick={restart}
          aria-label={lb.restart}
          className="flex-1 rounded-lg border px-4 py-2 text-sm font-bold transition-colors"
          style={{ backgroundColor: 'var(--card, #fff)' }}
        >{lb.restart}</button>
        <button
          onClick={share}
          aria-label={lb.share}
          className="flex-1 rounded-lg px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#16a34a' }}
        >{lb.share}</button>
      </div>
      <ShareResultButton locale={lp} heading={lb.title} resultTitle={r.title} />
    </div>
  )
}
