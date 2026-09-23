import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import ShareResultButton from '../shared/ShareResultButton'
import { Questionnaire } from '@/components/ui/questionnaire'
import ResultShareImage from '../shared/ResultShareImage'

type SupportedLang = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'
type ControlLevel = 'building' | 'moderate' | 'strong' | 'high'
type Subscale = 'restraint' | 'focus'

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
  yourScore: string; overallLabel: string; restraintLabel: string; focusLabel: string
  outOf: string; tipsLabel: string; note: string
}> = {
  ko: {
    title: '자기통제력 테스트',
    subtitle: '나의 절제와 끈기는 얼마나 단단할까?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['전혀 아니다', '거의 아니다', '보통이다', '대체로 그렇다', '매우 그렇다'],
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '나의 자기통제력 점수는',
    yourScore: '나의 자기통제력 점수',
    overallLabel: '종합 자기통제력',
    restraintLabel: '충동 절제',
    focusLabel: '끈기·집중',
    outOf: '/ 5.0',
    tipsLabel: '성장 팁',
    note: '탱그니 외(Tangney et al.)의 단축 자기통제 척도(BSCS) 개념을 바탕으로 한 자가성찰용 테스트입니다. 전문적 진단을 대체하지 않습니다.',
  },
  en: {
    title: 'Self-Control Test',
    subtitle: 'How firm is your restraint and persistence?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Not at all', 'Hardly', 'Neutral', 'Mostly', 'Very much'],
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My self-control score is',
    yourScore: 'Your Self-Control Score',
    overallLabel: 'Overall Self-Control',
    restraintLabel: 'Impulse Restraint',
    focusLabel: 'Persistence & Focus',
    outOf: '/ 5.0',
    tipsLabel: 'Growth Tips',
    note: 'This self-reflection test is based on the Brief Self-Control Scale (BSCS) concept by Tangney et al. It does not replace professional assessment.',
  },
  ja: {
    title: 'セルフコントロール（自己統制）テスト',
    subtitle: 'あなたの抑制と粘り強さはどれほど強いか？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['全くない', 'ほとんどない', '普通', 'だいたいそう', 'とてもそう'],
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '私の自己統制スコアは',
    yourScore: 'あなたの自己統制スコア',
    overallLabel: '総合自己統制',
    restraintLabel: '衝動の抑制',
    focusLabel: '粘り強さ・集中',
    outOf: '/ 5.0',
    tipsLabel: '成長のヒント',
    note: 'このテストはTangneyらの短縮セルフコントロール尺度（BSCS）の概念に基づく自己省察用です。専門的な診断の代替ではありません。',
  },
  zh: {
    title: '自控力测验',
    subtitle: '我的克制和耐力有多稳？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['完全不是', '几乎不是', '一般', '大致是', '非常是'],
    restart: '重新测验',
    share: '分享结果',
    shareMsg: '我的自控力分数是',
    yourScore: '我的自控力分数',
    overallLabel: '综合自控力',
    restraintLabel: '冲动克制',
    focusLabel: '耐力与专注',
    outOf: '/ 5.0',
    tipsLabel: '成长建议',
    note: '本测验参考 Tangney 等人的简式自控量表（BSCS）概念，用于自我省思，不能替代专业评估。',
  },
  fr: {
    title: 'Test de maîtrise de soi',
    subtitle: 'À quel point ma retenue et ma persévérance tiennent-elles ?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Pas du tout', 'Presque pas', 'Neutre', 'Plutôt oui', 'Tout à fait'],
    restart: 'Recommencer',
    share: 'Partager le résultat',
    shareMsg: 'Mon score de maîtrise de soi',
    yourScore: 'Votre score de maîtrise de soi',
    overallLabel: 'Maîtrise de soi globale',
    restraintLabel: 'Retenue face à l’impulsion',
    focusLabel: 'Persévérance et concentration',
    outOf: '/ 5.0',
    tipsLabel: 'Piste de progrès',
    note: 'Ce test reprend les notions de l’échelle brève de maîtrise de soi (BSCS) de Tangney et al., à des fins de réflexion personnelle. Il ne remplace pas une évaluation professionnelle.',
  },
  es: {
    title: 'Test de autocontrol',
    subtitle: '¿Cuán firmes son mi contención y mi constancia?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Nada', 'Casi nada', 'Neutro', 'Más bien sí', 'Totalmente'],
    restart: 'Repetir',
    share: 'Compartir resultado',
    shareMsg: 'Mi puntuación de autocontrol',
    yourScore: 'Tu puntuación de autocontrol',
    overallLabel: 'Autocontrol global',
    restraintLabel: 'Contención del impulso',
    focusLabel: 'Constancia y concentración',
    outOf: '/ 5.0',
    tipsLabel: 'Para crecer',
    note: 'Este test recoge las ideas de la escala breve de autocontrol (BSCS) de Tangney y otros, para la reflexión personal. No sustituye una evaluación profesional.',
  },
}

const LEVEL_DATA: Record<ControlLevel, Record<SupportedLang, LevelData>> = {
  building: {
    ko: {
      icon: '🌱',
      title: '형성 단계',
      description: '아직 충동을 조절하고 끈기를 발휘하는 힘이 자라는 중입니다. 자기통제는 근육처럼 작은 연습으로 단단해집니다.',
      tips: [
        '유혹을 의지로 누르기보다 환경에서 미리 치우세요.',
        '아주 작은 목표를 정해 "해냈다"를 반복 경험하세요.',
        '"5분만 더" 규칙으로 미루는 충동을 넘겨 보세요.',
      ],
    },
    en: {
      icon: '🌱',
      title: 'Building',
      description: 'Your power to restrain impulses and persist is still growing. Self-control, like a muscle, gets firmer with small practice.',
      tips: [
        'Remove temptations from your environment rather than fighting them with willpower.',
        'Set tiny goals and repeatedly experience "I did it."',
        'Use the "just 5 more minutes" rule to get past the urge to delay.',
      ],
    },
    ja: {
      icon: '🌱',
      title: '形成段階',
      description: '衝動を抑え粘り強さを発揮する力がまだ育っている途中です。自己統制は筋肉のように小さな練習で強くなります。',
      tips: [
        '誘惑を意志で抑えるより環境からあらかじめ取り除きましょう。',
        'ごく小さな目標を決めて「できた」を繰り返し経験しましょう。',
        '「あと5分」ルールで先延ばしの衝動を乗り越えましょう。',
      ],
    },
    zh: {
      icon: '🌱',
      title: '正在形成',
      description: '克制冲动、保持耐力的力气还在长。自控像肌肉，靠小小的练习一点点变结实。',
      tips: [
        '与其用意志压住诱惑，不如先从环境里把它拿走。',
        '把目标定得很小，反覆累积「我做到了」。',
        '用「再五分钟」的规则，把想拖的那股劲儿撑过去。',
      ],
    },
    fr: {
      icon: '🌱',
      title: 'En construction',
      description: 'La force de contenir l’impulsion et de tenir dans la durée est encore en train de pousser. La maîtrise de soi se renforce comme un muscle, par de petits exercices.',
      tips: [
        'Plutôt que de résister par la volonté, retirez d’abord la tentation de votre environnement.',
        'Fixez des objectifs très petits et répétez l’expérience du « j’y suis arrivé ».',
        'Utilisez la règle des « cinq minutes de plus » pour passer l’envie de remettre à plus tard.',
      ],
    },
    es: {
      icon: '🌱',
      title: 'En construcción',
      description: 'La fuerza para contener el impulso y sostener el esfuerzo todavía está creciendo. El autocontrol se fortalece como un músculo, con ejercicios pequeños.',
      tips: [
        'Antes que resistir por voluntad, quita la tentación del entorno.',
        'Ponte metas muy pequeñas y repite la experiencia de «lo he conseguido».',
        'Usa la regla de «cinco minutos más» para pasar las ganas de aplazar.',
      ],
    },
  },
  moderate: {
    ko: {
      icon: '🌿',
      title: '안정 자기통제형',
      description: '대체로 충동을 잘 조절하고 할 일을 해냅니다. 가끔 흔들리지만 회복하는 힘이 있는 건강한 수준입니다.',
      tips: [
        '잘 무너지는 상황(시간·장소·기분)을 파악해 미리 대비하세요.',
        '습관을 의지가 아닌 루틴·신호로 자동화하세요.',
        '성공 경험을 기록해 자기통제 자신감을 키우세요.',
      ],
    },
    en: {
      icon: '🌿',
      title: 'Steady Self-Control',
      description: 'You generally restrain impulses and get things done. You waver sometimes but recover—a healthy level.',
      tips: [
        'Identify situations where you slip (time, place, mood) and prepare in advance.',
        'Automate habits through routines and cues rather than willpower.',
        'Log your successes to build self-control confidence.',
      ],
    },
    ja: {
      icon: '🌿',
      title: '安定自己統制型',
      description: 'おおむね衝動をうまく抑え、やるべきことをこなします。時々揺らぎますが回復する力がある健康的なレベルです。',
      tips: [
        '崩れやすい状況（時間・場所・気分）を把握して備えましょう。',
        '習慣を意志ではなくルーティンや合図で自動化しましょう。',
        '成功体験を記録して自己統制の自信を育てましょう。',
      ],
    },
    zh: {
      icon: '🌿',
      title: '稳定的自控型',
      description: '大体上你控得住冲动，也把该做的做完。偶尔会晃，但有回得来的力气，属于健康的程度。',
      tips: [
        '摸清自己容易垮掉的场合（时间、地点、心情），提前准备。',
        '把习惯交给流程和提示，而不是交给意志。',
        '把成功的经验记下来，养出对自己的信心。',
      ],
    },
    fr: {
      icon: '🌿',
      title: 'Maîtrise stable',
      description: 'Dans l’ensemble, vous contenez bien l’impulsion et vous faites ce qu’il y a à faire. Il vous arrive de vaciller, mais vous savez revenir : c’est un niveau sain.',
      tips: [
        'Repérez les situations où vous craquez (heure, lieu, humeur) et préparez-les à l’avance.',
        'Confiez l’habitude à une routine et à des signaux plutôt qu’à la volonté.',
        'Notez vos réussites pour nourrir votre confiance.',
      ],
    },
    es: {
      icon: '🌿',
      title: 'Autocontrol estable',
      description: 'En general contienes bien el impulso y sacas lo que hay que sacar. A veces te tambaleas, pero sabes volver: es un nivel sano.',
      tips: [
        'Identifica las situaciones en que flaqueas (hora, lugar, ánimo) y prepáralas antes.',
        'Deja el hábito en manos de una rutina y unas señales, no de la voluntad.',
        'Anota tus logros para alimentar la confianza.',
      ],
    },
  },
  strong: {
    ko: {
      icon: '🛡️',
      title: '강한 자기통제형',
      description: '충동 절제와 끈기가 강합니다. 장기 목표를 위해 당장의 유혹을 잘 미루고 꾸준히 실천합니다.',
      tips: [
        '이 힘을 의미 있는 장기 목표에 투자하세요.',
        '통제가 경직·억압으로 가지 않게 쉼과 즐거움도 허락하세요.',
        '주변에 좋은 습관 시스템을 나눠 보세요.',
      ],
    },
    en: {
      icon: '🛡️',
      title: 'Strong Self-Control',
      description: 'Your impulse restraint and persistence are strong. You delay immediate temptation for long-term goals and follow through steadily.',
      tips: [
        'Invest this strength in meaningful long-term goals.',
        'Allow rest and joy so control does not become rigidity or suppression.',
        'Share your good habit systems with others.',
      ],
    },
    ja: {
      icon: '🛡️',
      title: '強い自己統制型',
      description: '衝動の抑制と粘り強さが強いです。長期目標のために目先の誘惑をうまく先送りし着実に実践します。',
      tips: [
        'この力を意味ある長期目標に投資しましょう。',
        '統制が硬直や抑圧にならないよう休みと楽しみも許しましょう。',
        '周囲に良い習慣の仕組みを分かち合いましょう。',
      ],
    },
    zh: {
      icon: '🛡️',
      title: '强自控型',
      description: '克制和耐力都很强。为了长期的目标，你能把眼前的诱惑往后放，也做得持续。',
      tips: [
        '把这份力气投到真正要紧的长期目标上。',
        '别让控制变成僵硬和压抑，也给自己休息和乐趣。',
        '把好用的习惯系统分给身边的人。',
      ],
    },
    fr: {
      icon: '🛡️',
      title: 'Maîtrise forte',
      description: 'Votre retenue et votre persévérance sont solides. Pour un objectif lointain, vous savez différer la tentation et tenir dans la durée.',
      tips: [
        'Investissez cette force dans des objectifs de long terme qui comptent vraiment.',
        'Veillez à ce que la maîtrise ne devienne pas rigidité : accordez-vous du repos et du plaisir.',
        'Partagez vos systèmes d’habitudes autour de vous.',
      ],
    },
    es: {
      icon: '🛡️',
      title: 'Autocontrol fuerte',
      description: 'Tu contención y tu constancia son sólidas. Por una meta lejana sabes aplazar la tentación y sostener el esfuerzo.',
      tips: [
        'Invierte esa fuerza en metas de largo plazo que de verdad importen.',
        'Cuida que el control no se vuelva rigidez: date descanso y gusto.',
        'Comparte tus sistemas de hábitos con quienes te rodean.',
      ],
    },
  },
  high: {
    ko: {
      icon: '🏔️',
      title: '최상위 자기통제형',
      description: '매우 높은 자기통제력을 지녔습니다. 강력한 절제력이지만, 지나친 통제가 경직과 번아웃으로 가지 않도록 균형이 필요합니다.',
      tips: [
        '계획에 "여백"과 즉흥의 즐거움을 의도적으로 넣으세요.',
        '통제 욕구가 완벽주의·자기비판으로 번지지 않게 점검하세요.',
        '쉬는 것도 능력임을 받아들이고 회복을 계획하세요.',
      ],
    },
    en: {
      icon: '🏔️',
      title: 'Very High Self-Control',
      description: 'You possess very high self-control. A powerful restraint, but balance is needed so over-control does not lead to rigidity and burnout.',
      tips: [
        'Intentionally build "white space" and spontaneous joy into your plans.',
        'Check that the need for control does not spread into perfectionism or self-criticism.',
        'Accept that resting is also a skill, and plan recovery.',
      ],
    },
    ja: {
      icon: '🏔️',
      title: '最高自己統制型',
      description: '非常に高い自己統制力を持っています。強力な抑制力ですが、過度な統制が硬直やバーンアウトにつながらないようバランスが必要です。',
      tips: [
        '計画に「余白」と即興の楽しみを意図的に入れましょう。',
        '統制欲求が完璧主義や自己批判に広がらないか点検しましょう。',
        '休むことも能力だと受け入れ回復を計画しましょう。',
      ],
    },
    zh: {
      icon: '🏔️',
      title: '顶级自控型',
      description: '你的自控力非常高。这是很强的克制力，但控得太紧会带来僵硬和耗竭，需要保持平衡。',
      tips: [
        '有意在计划里留白，也留一点随兴的乐趣。',
        '检查一下，控制的欲望有没有变成完美主义和自我批评。',
        '把「休息也是能力」接受下来，把恢复排进计划。',
      ],
    },
    fr: {
      icon: '🏔️',
      title: 'Maîtrise très élevée',
      description: 'Votre maîtrise de soi est très forte. C’est une belle puissance de retenue, mais un contrôle trop serré mène à la rigidité et à l’épuisement : il faut de l’équilibre.',
      tips: [
        'Ménagez volontairement du blanc dans vos plans, et un peu de spontanéité.',
        'Vérifiez que le besoin de contrôle ne glisse pas vers le perfectionnisme et l’autocritique.',
        'Acceptez que se reposer soit aussi une compétence, et planifiez la récupération.',
      ],
    },
    es: {
      icon: '🏔️',
      title: 'Autocontrol muy alto',
      description: 'Tu autocontrol es muy alto. Es una gran capacidad de contención, pero un control demasiado apretado lleva a la rigidez y al agotamiento: hace falta equilibrio.',
      tips: [
        'Deja huecos a propósito en los planes, y algo de espontaneidad.',
        'Revisa que la necesidad de control no derive en perfeccionismo y autocrítica.',
        'Acepta que descansar también es una habilidad y planifica la recuperación.',
      ],
    },
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 'r1', subscale: 'restraint', reverse: false, text: '유혹이 있어도 잘 참는 편이다' },
    { id: 'r2', subscale: 'restraint', reverse: false, text: '충동적으로 행동하기보다 한 번 더 생각한다' },
    { id: 'r3', subscale: 'restraint', reverse: false, text: '나쁜 습관을 끊거나 줄이는 데 큰 어려움이 없다' },
    { id: 'r4', subscale: 'restraint', reverse: false, text: '화가 나도 즉흥적으로 반응하지 않는다' },
    { id: 'r5', subscale: 'restraint', reverse: false, text: '당장 즐거워도 장기적으로 해로운 일은 피한다' },
    { id: 'r6', subscale: 'restraint', reverse: false, text: '하지 말아야 할 것을 잘 절제한다' },
    { id: 'r7', subscale: 'restraint', reverse: false, text: '감정에 휩쓸리지 않고 침착함을 유지한다' },
    { id: 'f1', subscale: 'focus', reverse: false, text: '해야 할 일을 미루지 않고 해내는 편이다' },
    { id: 'f2', subscale: 'focus', reverse: false, text: '목표를 위해 당장의 즐거움을 미룰 수 있다' },
    { id: 'f3', subscale: 'focus', reverse: false, text: '집중이 필요할 때 잘 집중한다' },
    { id: 'f4', subscale: 'focus', reverse: false, text: '규칙적인 습관을 잘 유지한다' },
    { id: 'f5', subscale: 'focus', reverse: false, text: '시작한 일을 끝까지 마무리하는 편이다' },
    { id: 'f6', subscale: 'focus', reverse: false, text: '산만해져도 다시 할 일로 돌아온다' },
    { id: 'f7', subscale: 'focus', reverse: false, text: '계획한 것을 꾸준히 실천한다' },
  ],
  en: [
    { id: 'r1', subscale: 'restraint', reverse: false, text: 'I resist temptations well' },
    { id: 'r2', subscale: 'restraint', reverse: false, text: 'I think twice rather than act impulsively' },
    { id: 'r3', subscale: 'restraint', reverse: false, text: 'I have little trouble breaking or reducing bad habits' },
    { id: 'r4', subscale: 'restraint', reverse: false, text: 'I do not react impulsively even when angry' },
    { id: 'r5', subscale: 'restraint', reverse: false, text: 'I avoid things harmful in the long run even if pleasant now' },
    { id: 'r6', subscale: 'restraint', reverse: false, text: 'I restrain myself well from things I should not do' },
    { id: 'r7', subscale: 'restraint', reverse: false, text: 'I stay calm without being swept away by emotion' },
    { id: 'f1', subscale: 'focus', reverse: false, text: 'I get things done without putting them off' },
    { id: 'f2', subscale: 'focus', reverse: false, text: 'I can delay immediate pleasure for a goal' },
    { id: 'f3', subscale: 'focus', reverse: false, text: 'I concentrate well when focus is needed' },
    { id: 'f4', subscale: 'focus', reverse: false, text: 'I maintain regular habits well' },
    { id: 'f5', subscale: 'focus', reverse: false, text: 'I tend to finish what I start' },
    { id: 'f6', subscale: 'focus', reverse: false, text: 'Even when distracted, I return to the task' },
    { id: 'f7', subscale: 'focus', reverse: false, text: 'I steadily carry out what I planned' },
  ],
  ja: [
    { id: 'r1', subscale: 'restraint', reverse: false, text: '誘惑があってもよく我慢する方だ' },
    { id: 'r2', subscale: 'restraint', reverse: false, text: '衝動的に行動するよりもう一度考える' },
    { id: 'r3', subscale: 'restraint', reverse: false, text: '悪い習慣を断つ・減らすのに大きな苦労がない' },
    { id: 'r4', subscale: 'restraint', reverse: false, text: '怒っても衝動的に反応しない' },
    { id: 'r5', subscale: 'restraint', reverse: false, text: '今は楽しくても長期的に有害なことは避ける' },
    { id: 'r6', subscale: 'restraint', reverse: false, text: 'してはいけないことをよく自制する' },
    { id: 'r7', subscale: 'restraint', reverse: false, text: '感情に流されず冷静さを保つ' },
    { id: 'f1', subscale: 'focus', reverse: false, text: 'やるべきことを先延ばしせずこなす方だ' },
    { id: 'f2', subscale: 'focus', reverse: false, text: '目標のために目先の楽しみを後回しにできる' },
    { id: 'f3', subscale: 'focus', reverse: false, text: '集中が必要な時によく集中する' },
    { id: 'f4', subscale: 'focus', reverse: false, text: '規則的な習慣をよく維持する' },
    { id: 'f5', subscale: 'focus', reverse: false, text: '始めたことを最後までやり遂げる方だ' },
    { id: 'f6', subscale: 'focus', reverse: false, text: '気が散っても再びやるべきことに戻る' },
    { id: 'f7', subscale: 'focus', reverse: false, text: '計画したことを着実に実践する' },
  ],
  zh: [
    { id: 'r1', subscale: 'restraint', reverse: false, text: '就算有诱惑，我也忍得住' },
    { id: 'r2', subscale: 'restraint', reverse: false, text: '比起冲动行事，我会先多想一下' },
    { id: 'r3', subscale: 'restraint', reverse: false, text: '戒掉或减少坏习惯，对我不算太难' },
    { id: 'r4', subscale: 'restraint', reverse: false, text: '就算生气，我也不会当场就反应' },
    { id: 'r5', subscale: 'restraint', reverse: false, text: '就算眼前开心，长期有害的事我会避开' },
    { id: 'r6', subscale: 'restraint', reverse: false, text: '该忍住的事，我克制得住' },
    { id: 'r7', subscale: 'restraint', reverse: false, text: '不被情绪冲走，能保持冷静' },
    { id: 'f1', subscale: 'focus', reverse: false, text: '该做的事我不太拖' },
    { id: 'f2', subscale: 'focus', reverse: false, text: '为了目标，我能把眼前的享乐往后放' },
    { id: 'f3', subscale: 'focus', reverse: false, text: '需要专注时，我专注得起来' },
    { id: 'f4', subscale: 'focus', reverse: false, text: '规律的习惯我维持得住' },
    { id: 'f5', subscale: 'focus', reverse: false, text: '开了头的事，我会做完' },
    { id: 'f6', subscale: 'focus', reverse: false, text: '就算分心了，也能回到手上的事' },
    { id: 'f7', subscale: 'focus', reverse: false, text: '计划好的事，我会持续做下去' },
  ],
  fr: [
    { id: 'r1', subscale: 'restraint', reverse: false, text: 'Même face à la tentation, je tiens bon' },
    { id: 'r2', subscale: 'restraint', reverse: false, text: 'Plutôt que d’agir sur l’impulsion, je réfléchis une fois de plus' },
    { id: 'r3', subscale: 'restraint', reverse: false, text: 'Arrêter ou réduire une mauvaise habitude ne m’est pas très difficile' },
    { id: 'r4', subscale: 'restraint', reverse: false, text: 'Même en colère, je ne réagis pas sur le coup' },
    { id: 'r5', subscale: 'restraint', reverse: false, text: 'Même si c’est agréable sur le moment, j’évite ce qui nuit à long terme' },
    { id: 'r6', subscale: 'restraint', reverse: false, text: 'Je sais me retenir de ce qu’il ne faut pas faire' },
    { id: 'r7', subscale: 'restraint', reverse: false, text: 'Je garde mon calme sans me laisser emporter par l’émotion' },
    { id: 'f1', subscale: 'focus', reverse: false, text: 'Je ne remets pas à plus tard ce qu’il faut faire' },
    { id: 'f2', subscale: 'focus', reverse: false, text: 'Pour un objectif, je sais différer un plaisir immédiat' },
    { id: 'f3', subscale: 'focus', reverse: false, text: 'Quand il faut se concentrer, j’y arrive' },
    { id: 'f4', subscale: 'focus', reverse: false, text: 'Je tiens des habitudes régulières' },
    { id: 'f5', subscale: 'focus', reverse: false, text: 'Ce que je commence, je le termine' },
    { id: 'f6', subscale: 'focus', reverse: false, text: 'Même distrait, je reviens à ce que je faisais' },
    { id: 'f7', subscale: 'focus', reverse: false, text: 'Ce que j’ai prévu, je le fais dans la durée' },
  ],
  es: [
    { id: 'r1', subscale: 'restraint', reverse: false, text: 'Aunque haya tentación, aguanto' },
    { id: 'r2', subscale: 'restraint', reverse: false, text: 'Antes de actuar por impulso, lo pienso una vez más' },
    { id: 'r3', subscale: 'restraint', reverse: false, text: 'Dejar o reducir un mal hábito no me cuesta demasiado' },
    { id: 'r4', subscale: 'restraint', reverse: false, text: 'Aunque me enfade, no reacciono en caliente' },
    { id: 'r5', subscale: 'restraint', reverse: false, text: 'Aunque apetezca ahora, evito lo que a la larga hace daño' },
    { id: 'r6', subscale: 'restraint', reverse: false, text: 'Sé contenerme con lo que no conviene' },
    { id: 'r7', subscale: 'restraint', reverse: false, text: 'Mantengo la calma sin dejarme arrastrar por la emoción' },
    { id: 'f1', subscale: 'focus', reverse: false, text: 'No aplazo lo que hay que hacer' },
    { id: 'f2', subscale: 'focus', reverse: false, text: 'Por una meta, sé dejar para después un gusto inmediato' },
    { id: 'f3', subscale: 'focus', reverse: false, text: 'Cuando hay que concentrarse, lo consigo' },
    { id: 'f4', subscale: 'focus', reverse: false, text: 'Mantengo hábitos regulares' },
    { id: 'f5', subscale: 'focus', reverse: false, text: 'Lo que empiezo, lo acabo' },
    { id: 'f6', subscale: 'focus', reverse: false, text: 'Aunque me distraiga, vuelvo a lo que estaba haciendo' },
    { id: 'f7', subscale: 'focus', reverse: false, text: 'Lo que planeo, lo sostengo en el tiempo' },
  ],
}

function calcLevel(score: number): ControlLevel {
  if (score <= 2.5) return 'building'
  if (score <= 3.5) return 'moderate'
  if (score <= 4.3) return 'strong'
  return 'high'
}

function adjustScore(raw: number, reverse: boolean): number {
  return reverse ? 6 - raw : raw
}

interface Props { locale?: string }

export default function SelfControlTest({ locale: lp = 'ko' }: Props) {
  const l = lang(lp ?? 'ko')
  const lb = LABELS[l]
  const questions = QUESTIONS[l]

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [done, setDone] = useState(false)
  useRecordFinishedTest({ testId: "self-control", title: "SelfControlTest", finished: Boolean(done) });

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
    const rItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'restraint')
    const fItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'focus')
    const rScore = rItems.reduce((s, x) => s + x.adj, 0) / rItems.length
    const fScore = fItems.reduce((s, x) => s + x.adj, 0) / fItems.length
    const overall = (rScore + fScore) / 2
    return { rScore, fScore, overall }
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
        previousLabel={(({ ko: '이전 질문', en: 'Previous question', ja: '前の質問', zh: '上一题', fr: 'Question précédente', es: 'Pregunta anterior' } as Record<string, string>)[l] ?? 'Previous question')}
        onPrevious={current > 0 ? previous : undefined}
        onSelect={pick}
      />
    )
  }

  const { rScore, fScore, overall } = calcScores(answers)
  const level = calcLevel(overall)
  const ld = LEVEL_DATA[level][l]
  const overallPct = Math.round(((overall - 1) / 4) * 100)
  const rPct = Math.round(((rScore - 1) / 4) * 100)
  const fPct = Math.round(((fScore - 1) / 4) * 100)

  const levelColors: Record<ControlLevel, string> = {
    building: '#6ee7b7',
    moderate: '#34d399',
    strong: '#10b981',
    high: '#059669',
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
            <span className="font-bold text-muted-foreground">{lb.restraintLabel}</span>
            <span className="font-bold" style={{ color }}>{rScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={rPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.restraintLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${rPct}%`, backgroundColor: color }} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-muted-foreground">{lb.focusLabel}</span>
            <span className="font-bold" style={{ color }}>{fScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={fPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.focusLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${fPct}%`, backgroundColor: color }} />
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
