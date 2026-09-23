import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import ShareResultButton from '../shared/ShareResultButton'
import { Questionnaire } from '@/components/ui/questionnaire'
import ResultShareImage from '../shared/ResultShareImage'

type SupportedLang = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'
type FomoLevel = 'free' | 'mild' | 'high' | 'intense'
type Subscale = 'exclusion' | 'connection'

function lang(locale: string): SupportedLang {
  return (['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const).includes(locale as SupportedLang)
    ? (locale as SupportedLang)
    : 'en'
}

interface Question {
  id: string
  subscale: Subscale
  reverse: boolean
  text: string
}

interface LevelData {
  icon: string; title: string; description: string; tips: string[]
}

const LABELS: Record<SupportedLang, {
  title: string; subtitle: string; questionOf: (c: number, t: number) => string
  scaleLabels: [string, string, string, string, string]
  restart: string; share: string; shareMsg: string
  yourScore: string; overallLabel: string; exclusionLabel: string; connectionLabel: string
  outOf: string; tipsLabel: string; note: string
}> = {
  ko: {
    title: 'FOMO 척도 테스트',
    subtitle: '나의 소외 불안(FOMO) 지수는?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['전혀 아니다', '거의 아니다', '가끔 그렇다', '자주 그렇다', '항상 그렇다'],
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '나의 FOMO 지수는',
    yourScore: '나의 FOMO 지수',
    overallLabel: '종합 FOMO 지수',
    exclusionLabel: '소외 불안',
    connectionLabel: '연결 강박',
    outOf: '/ 5.0',
    tipsLabel: '마음을 위한 팁',
    note: '프시빌스키 외(Przybylski et al., 2013)의 FoMO 척도 개념을 바탕으로 한 자가성찰용 테스트입니다. 전문적 진단을 대체하지 않습니다.',
  },
  en: {
    title: 'FOMO Scale Test',
    subtitle: 'How high is your Fear of Missing Out?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My FOMO score is',
    yourScore: 'Your FOMO Score',
    overallLabel: 'Overall FOMO Score',
    exclusionLabel: 'Fear of Exclusion',
    connectionLabel: 'Compulsion to Connect',
    outOf: '/ 5.0',
    tipsLabel: 'Tips for Your Mind',
    note: 'This self-reflection test is based on the FoMO Scale concept by Przybylski et al. (2013). It does not replace professional assessment.',
  },
  ja: {
    title: 'FOMO尺度テスト',
    subtitle: 'あなたの取り残される不安（FOMO）度は？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['全くない', 'ほとんどない', '時々ある', 'よくある', 'いつもある'],
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '私のFOMO度は',
    yourScore: 'あなたのFOMO度',
    overallLabel: '総合FOMO度',
    exclusionLabel: '疎外不安',
    connectionLabel: '接続強迫',
    outOf: '/ 5.0',
    tipsLabel: '心のためのヒント',
    note: 'このテストはPrzybylskiらのFoMO尺度（2013）の概念に基づく自己省察用です。専門的な診断の代替ではありません。',
  },
  zh: {
    title: '错失恐惧（FOMO）量表测验',
    subtitle: '我的错失焦虑有多高？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['完全不是', '几乎不是', '偶尔如此', '经常如此', '总是如此'],
    restart: '重新测验',
    share: '分享结果',
    shareMsg: '我的 FOMO 指数是',
    yourScore: '我的 FOMO 指数',
    overallLabel: '综合 FOMO 指数',
    exclusionLabel: '错失焦虑',
    connectionLabel: '连线强迫',
    outOf: '/ 5.0',
    tipsLabel: '给心里的建议',
    note: '本测验参考 Przybylski 等人（2013）的 FoMO 量表概念，用于自我省思，不能替代专业评估。',
  },
  fr: {
    title: 'Test de l’échelle FOMO',
    subtitle: 'Quel est mon niveau de peur de manquer quelque chose ?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Pas du tout', 'Presque pas', 'Parfois', 'Souvent', 'Toujours'],
    restart: 'Recommencer',
    share: 'Partager le résultat',
    shareMsg: 'Mon indice FOMO',
    yourScore: 'Votre indice FOMO',
    overallLabel: 'Indice FOMO global',
    exclusionLabel: 'Peur d’être mis à l’écart',
    connectionLabel: 'Besoin compulsif de rester connecté',
    outOf: '/ 5.0',
    tipsLabel: 'Un conseil pour l’esprit',
    note: 'Ce test reprend les notions de l’échelle FoMO de Przybylski et al. (2013), à des fins de réflexion personnelle. Il ne remplace pas une évaluation professionnelle.',
  },
  es: {
    title: 'Test de la escala FOMO',
    subtitle: '¿Cuánto miedo tengo a perderme algo?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Nada', 'Casi nada', 'A veces', 'A menudo', 'Siempre'],
    restart: 'Repetir',
    share: 'Compartir resultado',
    shareMsg: 'Mi índice FOMO',
    yourScore: 'Tu índice FOMO',
    overallLabel: 'Índice FOMO global',
    exclusionLabel: 'Miedo a quedarte fuera',
    connectionLabel: 'Necesidad compulsiva de estar conectado',
    outOf: '/ 5.0',
    tipsLabel: 'Un consejo para la cabeza',
    note: 'Este test recoge las ideas de la escala FoMO de Przybylski y otros (2013), para la reflexión personal. No sustituye una evaluación profesional.',
  },
}

const LEVEL_DATA: Record<FomoLevel, Record<SupportedLang, LevelData>> = {
  free: {
    ko: {
      icon: '🍃',
      title: '자유로운 마음형',
      description: 'FOMO가 낮은 편입니다. 남과 비교하기보다 자신의 현재에 집중하며, 연결되지 않은 시간도 편안하게 즐깁니다.',
      tips: [
        '지금의 건강한 거리감을 의식적으로 지켜 나가세요.',
        '가끔 느끼는 소외감은 자연스러운 감정으로 받아들이세요.',
        '오프라인의 깊은 관계와 경험에 계속 투자하세요.',
      ],
    },
    en: {
      icon: '🍃',
      title: 'Free Mind',
      description: 'Your FOMO is low. Rather than comparing yourself to others, you focus on your own present and comfortably enjoy time spent disconnected.',
      tips: [
        'Consciously maintain the healthy distance you already have.',
        'Accept the occasional pang of missing out as a natural feeling.',
        'Keep investing in deep offline relationships and experiences.',
      ],
    },
    ja: {
      icon: '🍃',
      title: '自由な心型',
      description: 'FOMOは低めです。他人と比べるより自分の現在に集中し、つながっていない時間も心地よく楽しめます。',
      tips: [
        '今ある健康的な距離感を意識して守りましょう。',
        '時々感じる疎外感は自然な感情として受け入れましょう。',
        'オフラインの深い関係や経験に投資し続けましょう。',
      ],
    },
    zh: {
      icon: '🍃',
      title: '心里自在型',
      description: '你的 FOMO 偏低。比起跟人比较，你更专注在自己的当下，也能自在地享受没有连线的时间。',
      tips: [
        '有意识地守住现在这份健康的距离。',
        '偶尔冒出来的落单感，当成自然的情绪接住就好。',
        '继续把心力投到线下的深关系和真实的体验上。',
      ],
    },
    fr: {
      icon: '🍃',
      title: 'L’esprit libre',
      description: 'Votre FOMO est bas. Plutôt que de vous comparer, vous restez dans votre présent et vous savourez tranquillement les temps déconnectés.',
      tips: [
        'Préservez consciemment cette distance saine.',
        'Accueillez comme naturel le sentiment d’exclusion qui passe parfois.',
        'Continuez d’investir dans des liens profonds et des expériences hors ligne.',
      ],
    },
    es: {
      icon: '🍃',
      title: 'Mente libre',
      description: 'Tu FOMO es bajo. Antes que compararte, te quedas en tu presente y disfrutas con calma los ratos desconectado.',
      tips: [
        'Cuida conscientemente esa distancia sana.',
        'Acoge como natural la sensación de quedarte fuera que aparece a veces.',
        'Sigue invirtiendo en vínculos hondos y experiencias fuera de la pantalla.',
      ],
    },
  },
  mild: {
    ko: {
      icon: '🌤️',
      title: '가벼운 FOMO형',
      description: '대부분의 사람이 경험하는 일상적인 수준의 소외 불안입니다. 가끔 비교나 확인 욕구가 올라오지만 잘 조절하고 있습니다.',
      tips: [
        '비교가 시작될 때 "내 기준은 무엇인가" 자문해 보세요.',
        '알림을 묶어서 정해진 시간에만 확인해 보세요.',
        'SNS 피드와 실제 삶의 차이를 의식적으로 떠올리세요.',
      ],
    },
    en: {
      icon: '🌤️',
      title: 'Mild FOMO',
      description: 'An everyday level of fear of missing out that most people experience. Comparison and checking urges arise sometimes, but you manage them well.',
      tips: [
        'When comparison starts, ask yourself "what is my own standard?"',
        'Batch notifications and check them only at set times.',
        'Consciously remind yourself of the gap between feeds and real life.',
      ],
    },
    ja: {
      icon: '🌤️',
      title: '軽いFOMO型',
      description: '多くの人が経験する日常的なレベルの疎外不安です。時々比較や確認の欲求が出ますが、うまく調整できています。',
      tips: [
        '比較が始まったら「自分の基準は何か」と自問しましょう。',
        '通知をまとめて決まった時間だけ確認しましょう。',
        'SNSのフィードと実生活の差を意識的に思い出しましょう。',
      ],
    },
    zh: {
      icon: '🌤️',
      title: '轻度 FOMO 型',
      description: '这是大多数人都会有的日常程度。比较和想确认的冲动偶尔冒出来，但你控得住。',
      tips: [
        '比较一冒头，就问自己一句「我的标准是什么」。',
        '把通知收拢起来，只在固定的时间看。',
        '有意识地提醒自己：动态和真实的生活并不一样。',
      ],
    },
    fr: {
      icon: '🌤️',
      title: 'FOMO léger',
      description: 'C’est le niveau ordinaire que la plupart des gens connaissent. L’envie de comparer ou de vérifier monte parfois, mais vous la gérez bien.',
      tips: [
        'Dès que la comparaison démarre, demandez-vous : « quel est mon critère ? ».',
        'Regroupez les notifications et ne les consultez qu’à des moments définis.',
        'Rappelez-vous volontairement l’écart entre un fil d’actualité et la vraie vie.',
      ],
    },
    es: {
      icon: '🌤️',
      title: 'FOMO leve',
      description: 'Es el nivel corriente que siente la mayoría. A veces sube el impulso de comparar o comprobar, pero lo manejas bien.',
      tips: [
        'En cuanto empieza la comparación, pregúntate «¿cuál es mi criterio?».',
        'Agrupa las notificaciones y míralas solo a horas fijadas.',
        'Recuérdate a propósito la diferencia entre un feed y la vida real.',
      ],
    },
  },
  high: {
    ko: {
      icon: '📲',
      title: '높은 FOMO형',
      description: '소외 불안과 확인 욕구가 뚜렷합니다. 남들과의 비교나 "놓칠까 봐"라는 마음이 일상과 휴식을 자주 방해할 수 있습니다.',
      tips: [
        '하루 중 알림을 완전히 끄는 시간을 정해 보세요.',
        '"놓쳐도 괜찮다(JOMO)"를 의도적으로 연습하세요.',
        '비교를 부추기는 계정을 정리하거나 음소거하세요.',
      ],
    },
    en: {
      icon: '📲',
      title: 'High FOMO',
      description: 'Fear of exclusion and the urge to check are pronounced. Comparison and the feeling of "what if I miss out" may frequently disrupt your daily life and rest.',
      tips: [
        'Set a window each day where notifications are fully off.',
        'Deliberately practice the "joy of missing out" (JOMO).',
        'Unfollow or mute accounts that fuel comparison.',
      ],
    },
    ja: {
      icon: '📲',
      title: '高いFOMO型',
      description: '疎外不安と確認欲求がはっきりしています。比較や「逃すかも」という気持ちが日常や休息をしばしば妨げる可能性があります。',
      tips: [
        '一日の中で通知を完全に切る時間を決めましょう。',
        '「逃しても大丈夫（JOMO）」を意図的に練習しましょう。',
        '比較をあおるアカウントを整理またはミュートしましょう。',
      ],
    },
    zh: {
      icon: '📲',
      title: '高 FOMO 型',
      description: '错失焦虑和想确认的冲动很明显。跟别人比较，或是「怕错过」的心情，可能常常打断你的日常和休息。',
      tips: [
        '每天定一段完全关掉通知的时间。',
        '刻意练习「错过也没关系」（JOMO）。',
        '把那些引你比较的帐号整理掉，或静音。',
      ],
    },
    fr: {
      icon: '📲',
      title: 'FOMO élevé',
      description: 'La peur de manquer et le besoin de vérifier sont nets. La comparaison et la crainte de « rater quelque chose » viennent souvent perturber votre quotidien et votre repos.',
      tips: [
        'Définissez chaque jour une plage où les notifications sont totalement coupées.',
        'Entraînez-vous volontairement au « plaisir de manquer » (JOMO).',
        'Faites le tri ou mettez en sourdine les comptes qui nourrissent la comparaison.',
      ],
    },
    es: {
      icon: '📲',
      title: 'FOMO alto',
      description: 'El miedo a perderte algo y las ganas de comprobar son claros. Compararte y temer «perderte algo» interrumpen a menudo tu día y tu descanso.',
      tips: [
        'Fija cada día un rato con las notificaciones totalmente apagadas.',
        'Practica a propósito el «gusto por perderse cosas» (JOMO).',
        'Limpia o silencia las cuentas que alimentan la comparación.',
      ],
    },
  },
  intense: {
    ko: {
      icon: '🌀',
      title: 'FOMO 과민형',
      description: '소외 불안이 매우 강합니다. 끊임없는 확인과 비교가 마음의 에너지를 크게 소모하고 있을 가능성이 높습니다.',
      tips: [
        '하루 한 시간이라도 완전한 디지털 디톡스로 시작해 보세요.',
        '불안의 뿌리(인정 욕구·외로움 등)를 들여다보세요.',
        '혼자 조절이 힘들다면 상담 등 전문적 도움을 고려하세요.',
      ],
    },
    en: {
      icon: '🌀',
      title: 'Intense FOMO',
      description: 'Your fear of missing out is very strong. Constant checking and comparison are likely draining a large amount of your mental energy.',
      tips: [
        'Start with even one hour a day of full digital detox.',
        'Look into the roots of the anxiety (need for approval, loneliness, etc.).',
        'If self-regulation is hard, consider professional help such as counseling.',
      ],
    },
    ja: {
      icon: '🌀',
      title: 'FOMO過敏型',
      description: '疎外不安が非常に強いです。絶え間ない確認と比較が心のエネルギーを大きく消耗している可能性が高いです。',
      tips: [
        '一日1時間でも完全なデジタルデトックスから始めましょう。',
        '不安の根（承認欲求・孤独など）を見つめましょう。',
        '一人で調整が難しい場合はカウンセリングなど専門的な助けを検討しましょう。',
      ],
    },
    zh: {
      icon: '🌀',
      title: 'FOMO 过敏型',
      description: '错失焦虑非常强。不停地确认和比较，很可能正在大量消耗你的心力。',
      tips: [
        '先从每天一小时的彻底断线开始。',
        '看一看焦虑的根在哪（想被认可、孤单等）。',
        '一个人难以调节时，考虑咨询等专业协助。',
      ],
    },
    fr: {
      icon: '🌀',
      title: 'FOMO intense',
      description: 'La peur de manquer est très forte. Les vérifications et les comparaisons incessantes consomment probablement beaucoup de votre énergie mentale.',
      tips: [
        'Commencez par une heure par jour de déconnexion complète.',
        'Regardez la racine de l’anxiété (besoin de reconnaissance, solitude…).',
        'Si vous n’y arrivez pas seul, envisagez un accompagnement professionnel.',
      ],
    },
    es: {
      icon: '🌀',
      title: 'FOMO intenso',
      description: 'El miedo a perderte algo es muy fuerte. Comprobar y comparar sin parar probablemente consume mucha de tu energía mental.',
      tips: [
        'Empieza por una hora al día de desconexión completa.',
        'Mira dónde está la raíz de la ansiedad (necesidad de reconocimiento, soledad…).',
        'Si no puedes solo, valora acompañamiento profesional.',
      ],
    },
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 'e1', subscale: 'exclusion', reverse: false, text: '친구들이 나 없이 즐거운 시간을 보낼까 봐 신경 쓰인다' },
    { id: 'e2', subscale: 'exclusion', reverse: false, text: '남들이 나보다 더 풍요로운 경험을 한다고 느낀다' },
    { id: 'e3', subscale: 'exclusion', reverse: false, text: '내가 모르는 사이 중요한 일이 일어날까 봐 불안하다' },
    { id: 'e4', subscale: 'exclusion', reverse: false, text: '다른 사람의 일상(여행·모임)을 보면 나만 뒤처진 기분이 든다' },
    { id: 'e5', subscale: 'exclusion', reverse: false, text: '초대받지 못한 모임이 있으면 마음이 많이 쓰인다' },
    { id: 'e6', subscale: 'exclusion', reverse: false, text: '트렌드나 유행을 놓치는 것이 두렵다' },
    { id: 'e7', subscale: 'exclusion', reverse: false, text: '남들이 다 아는 것을 나만 모를까 봐 걱정된다' },
    { id: 'c1', subscale: 'connection', reverse: false, text: '자리를 비웠을 때 무슨 일이 있었는지 계속 확인하고 싶다' },
    { id: 'c2', subscale: 'connection', reverse: false, text: '식사나 모임 중에도 SNS·메시지를 확인하게 된다' },
    { id: 'c3', subscale: 'connection', reverse: false, text: '알림이 오면 바로 확인하지 않으면 불안하다' },
    { id: 'c4', subscale: 'connection', reverse: false, text: '휴가나 휴식 중에도 온라인 소식을 계속 확인한다' },
    { id: 'c5', subscale: 'connection', reverse: false, text: 'SNS를 한동안 못 보면 답답하거나 초조하다' },
    { id: 'c6', subscale: 'connection', reverse: false, text: '자기 전이나 일어나자마자 가장 먼저 피드를 확인한다' },
    { id: 'c7', subscale: 'connection', reverse: false, text: '좋아요·댓글·반응을 자주 확인하게 된다' },
  ],
  en: [
    { id: 'e1', subscale: 'exclusion', reverse: false, text: 'I worry that my friends are having fun without me' },
    { id: 'e2', subscale: 'exclusion', reverse: false, text: 'I feel others are having more rewarding experiences than me' },
    { id: 'e3', subscale: 'exclusion', reverse: false, text: 'I get anxious that something important might happen without me knowing' },
    { id: 'e4', subscale: 'exclusion', reverse: false, text: "Seeing others' lives (trips, gatherings) makes me feel left behind" },
    { id: 'e5', subscale: 'exclusion', reverse: false, text: 'It bothers me a lot when there is a gathering I was not invited to' },
    { id: 'e6', subscale: 'exclusion', reverse: false, text: 'I am afraid of missing out on trends' },
    { id: 'e7', subscale: 'exclusion', reverse: false, text: 'I worry that I am the only one who does not know what everyone else knows' },
    { id: 'c1', subscale: 'connection', reverse: false, text: 'When I have been away, I keep wanting to check what happened' },
    { id: 'c2', subscale: 'connection', reverse: false, text: 'I end up checking social media or messages even during meals or gatherings' },
    { id: 'c3', subscale: 'connection', reverse: false, text: 'I feel anxious if I do not check a notification right away' },
    { id: 'c4', subscale: 'connection', reverse: false, text: 'I keep checking online updates even during vacations or rest' },
    { id: 'c5', subscale: 'connection', reverse: false, text: 'I feel restless when I cannot check social media for a while' },
    { id: 'c6', subscale: 'connection', reverse: false, text: 'I check my feed first thing before sleeping or right after waking up' },
    { id: 'c7', subscale: 'connection', reverse: false, text: 'I frequently check likes, comments, and reactions' },
  ],
  ja: [
    { id: 'e1', subscale: 'exclusion', reverse: false, text: '友人が自分抜きで楽しい時間を過ごしていないか気になる' },
    { id: 'e2', subscale: 'exclusion', reverse: false, text: '他人が自分より充実した経験をしていると感じる' },
    { id: 'e3', subscale: 'exclusion', reverse: false, text: '知らないうちに重要なことが起きるのではと不安になる' },
    { id: 'e4', subscale: 'exclusion', reverse: false, text: '他人の日常（旅行・集まり）を見ると自分だけ遅れている気がする' },
    { id: 'e5', subscale: 'exclusion', reverse: false, text: '招待されなかった集まりがあると気になって仕方ない' },
    { id: 'e6', subscale: 'exclusion', reverse: false, text: 'トレンドや流行を逃すことが怖い' },
    { id: 'e7', subscale: 'exclusion', reverse: false, text: 'みんなが知っていることを自分だけ知らないのではと心配になる' },
    { id: 'c1', subscale: 'connection', reverse: false, text: '席を外していた時に何があったか確認し続けたくなる' },
    { id: 'c2', subscale: 'connection', reverse: false, text: '食事や集まりの最中でもSNSやメッセージを確認してしまう' },
    { id: 'c3', subscale: 'connection', reverse: false, text: '通知が来るとすぐ確認しないと不安になる' },
    { id: 'c4', subscale: 'connection', reverse: false, text: '休暇や休息中でもオンラインの情報を確認し続ける' },
    { id: 'c5', subscale: 'connection', reverse: false, text: 'SNSをしばらく見られないと落ち着かない' },
    { id: 'c6', subscale: 'connection', reverse: false, text: '寝る前や起きてすぐにまずフィードを確認する' },
    { id: 'c7', subscale: 'connection', reverse: false, text: 'いいね・コメント・反応を頻繁に確認してしまう' },
  ],
  zh: [
    { id: 'e1', subscale: 'exclusion', reverse: false, text: '我会在意朋友们没有我也玩得开心' },
    { id: 'e2', subscale: 'exclusion', reverse: false, text: '我觉得别人过得比我更精彩' },
    { id: 'e3', subscale: 'exclusion', reverse: false, text: '我担心在我不知道的时候，重要的事正在发生' },
    { id: 'e4', subscale: 'exclusion', reverse: false, text: '看到别人的日常（旅行、聚会），我会觉得只有我落后' },
    { id: 'e5', subscale: 'exclusion', reverse: false, text: '有没被邀请的聚会时，我会很在意' },
    { id: 'e6', subscale: 'exclusion', reverse: false, text: '我怕错过潮流或正在流行的东西' },
    { id: 'e7', subscale: 'exclusion', reverse: false, text: '我担心大家都知道的事，只有我不知道' },
    { id: 'c1', subscale: 'connection', reverse: false, text: '我离开一会儿后，会一直想确认发生了什么' },
    { id: 'c2', subscale: 'connection', reverse: false, text: '吃饭或聚会时，我也会去看社群或讯息' },
    { id: 'c3', subscale: 'connection', reverse: false, text: '有通知来时，不马上看我会不安' },
    { id: 'c4', subscale: 'connection', reverse: false, text: '就算在休假或休息，我也会一直刷线上的消息' },
    { id: 'c5', subscale: 'connection', reverse: false, text: '一阵子没看社群，我会闷得慌或心急' },
    { id: 'c6', subscale: 'connection', reverse: false, text: '睡前或一醒来，我第一件事就是刷动态' },
    { id: 'c7', subscale: 'connection', reverse: false, text: '我常去确认按赞、留言和回应' },
  ],
  fr: [
    { id: 'e1', subscale: 'exclusion', reverse: false, text: 'Cela me travaille que mes amis s’amusent sans moi' },
    { id: 'e2', subscale: 'exclusion', reverse: false, text: 'J’ai le sentiment que les autres vivent des choses plus riches que moi' },
    { id: 'e3', subscale: 'exclusion', reverse: false, text: 'J’ai peur qu’il se passe quelque chose d’important sans que je le sache' },
    { id: 'e4', subscale: 'exclusion', reverse: false, text: 'En voyant le quotidien des autres (voyages, sorties), j’ai l’impression d’être seul à la traîne' },
    { id: 'e5', subscale: 'exclusion', reverse: false, text: 'Quand il y a une sortie où je ne suis pas invité, cela me préoccupe beaucoup' },
    { id: 'e6', subscale: 'exclusion', reverse: false, text: 'J’ai peur de rater une tendance ou ce qui est en vogue' },
    { id: 'e7', subscale: 'exclusion', reverse: false, text: 'Je crains d’être le seul à ne pas savoir ce que tout le monde sait' },
    { id: 'c1', subscale: 'connection', reverse: false, text: 'Après une absence, je veux sans cesse vérifier ce qui s’est passé' },
    { id: 'c2', subscale: 'connection', reverse: false, text: 'Même pendant un repas ou une sortie, je consulte les réseaux ou mes messages' },
    { id: 'c3', subscale: 'connection', reverse: false, text: 'Si je ne regarde pas tout de suite une notification, je me sens mal' },
    { id: 'c4', subscale: 'connection', reverse: false, text: 'Même en vacances ou au repos, je continue de suivre l’actualité en ligne' },
    { id: 'c5', subscale: 'connection', reverse: false, text: 'Rester un moment sans réseaux me rend fébrile' },
    { id: 'c6', subscale: 'connection', reverse: false, text: 'Avant de dormir ou au réveil, mon premier geste est de regarder mon fil' },
    { id: 'c7', subscale: 'connection', reverse: false, text: 'Je vérifie souvent les mentions j’aime, les commentaires et les réactions' },
  ],
  es: [
    { id: 'e1', subscale: 'exclusion', reverse: false, text: 'Me afecta que mis amigos se diviertan sin mí' },
    { id: 'e2', subscale: 'exclusion', reverse: false, text: 'Siento que los demás viven cosas más ricas que yo' },
    { id: 'e3', subscale: 'exclusion', reverse: false, text: 'Me inquieta que pase algo importante sin que yo lo sepa' },
    { id: 'e4', subscale: 'exclusion', reverse: false, text: 'Al ver el día a día de otros (viajes, quedadas), siento que solo yo me quedo atrás' },
    { id: 'e5', subscale: 'exclusion', reverse: false, text: 'Si hay una quedada a la que no me invitan, me preocupa bastante' },
    { id: 'e6', subscale: 'exclusion', reverse: false, text: 'Me da miedo perderme una tendencia o lo que está de moda' },
    { id: 'e7', subscale: 'exclusion', reverse: false, text: 'Temo ser el único que no sabe lo que todos saben' },
    { id: 'c1', subscale: 'connection', reverse: false, text: 'Después de ausentarme, quiero comprobar sin parar qué ha pasado' },
    { id: 'c2', subscale: 'connection', reverse: false, text: 'Incluso comiendo o en una quedada, miro redes o mensajes' },
    { id: 'c3', subscale: 'connection', reverse: false, text: 'Si no miro una notificación al momento, me inquieto' },
    { id: 'c4', subscale: 'connection', reverse: false, text: 'Aunque esté de vacaciones o descansando, sigo mirando lo que pasa en línea' },
    { id: 'c5', subscale: 'connection', reverse: false, text: 'Estar un rato sin redes me pone nervioso' },
    { id: 'c6', subscale: 'connection', reverse: false, text: 'Antes de dormir o al despertar, lo primero que hago es mirar el feed' },
    { id: 'c7', subscale: 'connection', reverse: false, text: 'Compruebo a menudo los me gusta, los comentarios y las reacciones' },
  ],
}

function calcLevel(score: number): FomoLevel {
  if (score <= 2.3) return 'free'
  if (score <= 3.2) return 'mild'
  if (score <= 4.0) return 'high'
  return 'intense'
}

function adjustScore(raw: number, reverse: boolean): number {
  return reverse ? 6 - raw : raw
}

interface Props { locale?: string }

export default function FomoTest({ locale: lp = 'ko' }: Props) {
  const l = lang(lp ?? 'ko')
  const lb = LABELS[l]
  const questions = QUESTIONS[l]

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [done, setDone] = useState(false)
  useRecordFinishedTest({ testId: "fomo", title: "FomoTest", finished: Boolean(done) });

  function pick(val: number) {
    const next = answers.slice(0, current)
    next[current] = val
    if (current + 1 >= questions.length) {
      setAnswers(next)
      setDone(true)
    } else {
      setAnswers(next)
      setCurrent(current + 1)
    }
  }

  function previous() {
    if (current === 0) return
    setCurrent(current - 1)
  }

  function restart() { setAnswers([]); setCurrent(0); setDone(false) }

  function calcScores(ans: number[]) {
    const adjusted = questions.map((q, i) => adjustScore(ans[i] ?? 1, q.reverse))
    const eItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'exclusion')
    const cItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'connection')
    const eScore = eItems.reduce((s, x) => s + x.adj, 0) / eItems.length
    const cScore = cItems.reduce((s, x) => s + x.adj, 0) / cItems.length
    const overall = (eScore + cScore) / 2
    return { eScore, cScore, overall }
  }

  function share() {
    const { overall } = calcScores(answers)
    const url = window.location.href
    const level = calcLevel(overall)
    const text = `${lb.shareMsg} ${overall.toFixed(1)} ${lb.outOf} — ${LEVEL_DATA[level][l].title}`
    if (navigator.share) navigator.share({ title: lb.title, text, url })
    else navigator.clipboard.writeText(url)
  }

  if (!done) {
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
        previousLabel={l === 'ko' ? '이전 질문' : l === 'ja' ? '前の質問' : 'Previous question'}
        onPrevious={current > 0 ? previous : undefined}
        onSelect={pick}
      />
    )
  }

  const { eScore, cScore, overall } = calcScores(answers)
  const level = calcLevel(overall)
  const ld = LEVEL_DATA[level][l]
  const overallPct = Math.round(((overall - 1) / 4) * 100)
  const ePct = Math.round(((eScore - 1) / 4) * 100)
  const cPct = Math.round(((cScore - 1) / 4) * 100)

  const levelColors: Record<FomoLevel, string> = {
    free: '#10b981',
    mild: '#0ea5e9',
    high: '#f59e0b',
    intense: '#ef4444',
  }
  const color = levelColors[level]

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">{lb.yourScore}</p>
        <div
          className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-xl font-bold text-white"
          style={{ backgroundColor: color }}
        >
          <span>{ld.icon}</span>
          <span>{ld.title}</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{ld.description}</p>
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold">{lb.overallLabel}</span>
            <span className="text-lg font-bold" style={{ color }}>{overall.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-3 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={overallPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.overallLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${overallPct}%`, backgroundColor: color }} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-muted-foreground">{lb.exclusionLabel}</span>
            <span className="font-bold" style={{ color }}>{eScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={ePct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.exclusionLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${ePct}%`, backgroundColor: color }} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-muted-foreground">{lb.connectionLabel}</span>
            <span className="font-bold" style={{ color }}>{cScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={cPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.connectionLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${cPct}%`, backgroundColor: color }} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-2">
        <h3 className="font-bold text-sm text-green-600">{lb.tipsLabel}</h3>
        <ul className="space-y-1">
          {ld.tips.map(tip => (
            <li key={tip} className="text-sm text-muted-foreground flex gap-2">
              <span className="text-green-500">→</span>{tip}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-center text-xs text-muted-foreground">{lb.note}</p>
      <ResultShareImage title={lb.title} level={ld.title} score={overall} color={color} icon={ld.icon} locale={l} />
      <div className="flex gap-3">
        <button
          onClick={restart}
          aria-label={lb.restart}
          className="flex-1 rounded-xl border bg-card px-4 py-2 text-sm font-bold hover:bg-accent transition-colors"
        >
          {lb.restart}
        </button>
        <button
          onClick={share}
          aria-label={lb.share}
          className="flex-1 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-bold hover:opacity-90 transition-opacity"
        >
          {lb.share}
        </button>
      </div>
        <ShareResultButton locale={lp} heading={lb.title} resultTitle={ld.title} />
    </div>
  )
}
