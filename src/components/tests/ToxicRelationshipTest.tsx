import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { ScreeningQuestionnaire } from '@/components/ui/screening-questionnaire'
import ShareResultButton from '../shared/ShareResultButton'

type SupportedLang = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'
type Level = 'healthy' | 'some_flags' | 'notable' | 'high_toxicity'

function lang(locale: string): SupportedLang {
  return (['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const).includes(locale as SupportedLang)
    ? (locale as SupportedLang)
    : 'en'
}

interface Question { id: string; text: string }
interface LevelData {
  title: string; subtitle: string; description: string
  patterns: string[]; steps: string[]; encouragement: string
}

const LABELS: Record<SupportedLang, {
  title: string; subtitle: string; questionOf: (c: number, t: number) => string
  choiceLabels: [string, string, string, string]
  restart: string; share: string; shareMsg: string; yourLevel: string
  patterns: string; steps: string; encouragement: string
  scoreLabel: string; outOf: string; note: string; disclaimer: string
}> = {
  ko: {
    title: '관계 독성 패턴 테스트',
    subtitle: '내 관계는 건강한가요?',
    questionOf: (c, t) => `${c} / ${t}`,
    choiceLabels: ['전혀 그렇지 않다', '가끔 그렇다', '자주 그렇다', '항상 그렇다'],
    restart: '다시 하기', share: '결과 공유', shareMsg: '내 관계 패턴 테스트 결과는',
    yourLevel: '관계 패턴 결과', patterns: '발견된 패턴', steps: '다음 단계',
    encouragement: '당신에게', scoreLabel: '패턴 점수', outOf: '/ 45점',
    note: '이 테스트는 관계 패턴 인식을 돕기 위한 것입니다. 결과는 단순한 참고 자료입니다.',
    disclaimer: '어떤 결과가 나오든, 더 건강한 관계를 원하는 마음 자체가 중요합니다. 전문 상담은 언제나 좋은 선택입니다.',
  },
  en: {
    title: 'Relationship Pattern Test',
    subtitle: 'Is My Relationship Healthy?',
    questionOf: (c, t) => `${c} / ${t}`,
    choiceLabels: ['Not at all', 'Sometimes', 'Often', 'Always'],
    restart: 'Retake', share: 'Share Result', shareMsg: 'My relationship pattern result is',
    yourLevel: 'Relationship Pattern Result', patterns: 'Patterns Found', steps: 'Next Steps',
    encouragement: 'For You', scoreLabel: 'Pattern Score', outOf: '/ 45',
    note: 'This test is designed to help you recognize relationship patterns. Results are for reference only.',
    disclaimer: 'Whatever your result, the desire for a healthier relationship is what matters most. Professional counseling is always a good choice.',
  },
  ja: {
    title: '関係の毒性パターンテスト',
    subtitle: '私の関係は健全ですか？',
    questionOf: (c, t) => `${c} / ${t}`,
    choiceLabels: ['全くそうでない', 'たまにそうだ', 'よくそうだ', 'いつもそうだ'],
    restart: 'もう一度', share: '結果を共有', shareMsg: '私の関係パターンの結果は',
    yourLevel: '関係パターンの結果', patterns: '発見されたパターン', steps: '次のステップ',
    encouragement: 'あなたへ', scoreLabel: 'パターンスコア', outOf: '/ 45点',
    note: 'このテストは関係パターンの認識を助けるためのものです。結果は参考程度としてください。',
    disclaimer: 'どんな結果であっても、より健全な関係を求める気持ち自体が大切です。専門カウンセリングはいつでも良い選択です。',
  },
  zh: {
    title: '关系有害模式测验',
    subtitle: '我的关系健康吗？',
    questionOf: (c, t) => `${c} / ${t}`,
    choiceLabels: ['完全不是', '有时如此', '经常如此', '总是如此'],
    restart: '重新测验', share: '分享结果', shareMsg: '我的关系模式测验结果是',
    yourLevel: '关系模式结果', patterns: '发现的模式', steps: '下一步',
    encouragement: '写给你', scoreLabel: '模式分数', outOf: '/ 45 分',
    note: '本测验用于帮助觉察关系模式，结果仅供参考。',
    disclaimer: '无论结果如何，想要更健康关系的这份心意本身就很重要。专业咨询永远是好选择。',
  },
  fr: {
    title: 'Test des schémas relationnels toxiques',
    subtitle: 'Ma relation est-elle saine ?',
    questionOf: (c, t) => `${c} / ${t}`,
    choiceLabels: ['Pas du tout', 'Parfois', 'Souvent', 'Toujours'],
    restart: 'Recommencer', share: 'Partager le résultat', shareMsg: 'Mon résultat au test des schémas relationnels',
    yourLevel: 'Résultat des schémas relationnels', patterns: 'Schémas repérés', steps: 'Prochaines étapes',
    encouragement: 'Pour vous', scoreLabel: 'Score des schémas', outOf: '/ 45 points',
    note: 'Ce test vise à vous aider à repérer des schémas relationnels. Le résultat n’est qu’un repère.',
    disclaimer: 'Quel que soit le résultat, vouloir une relation plus saine est déjà important. Consulter un professionnel est toujours un bon choix.',
  },
  es: {
    title: 'Test de patrones de relación tóxica',
    subtitle: '¿Es sana mi relación?',
    questionOf: (c, t) => `${c} / ${t}`,
    choiceLabels: ['Nada', 'A veces', 'A menudo', 'Siempre'],
    restart: 'Repetir', share: 'Compartir resultado', shareMsg: 'Mi resultado del test de patrones de relación',
    yourLevel: 'Resultado de patrones de relación', patterns: 'Patrones detectados', steps: 'Próximos pasos',
    encouragement: 'Para ti', scoreLabel: 'Puntuación de patrones', outOf: '/ 45 puntos',
    note: 'Este test busca ayudarte a reconocer patrones en la relación. El resultado es solo una referencia.',
    disclaimer: 'Sea cual sea el resultado, desear una relación más sana ya es importante. Consultar a un profesional siempre es una buena opción.',
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 'q1',  text: '상대방이 내 감정이나 의견을 무시하거나 묵살한다' },
    { id: 'q2',  text: '관계 안에서 내가 잘못했다는 느낌을 자주 받는다' },
    { id: 'q3',  text: '상대방이 나를 비판하거나 비하하는 말을 자주 한다' },
    { id: 'q4',  text: '내 친구나 가족과의 관계가 이 사람으로 인해 멀어졌다' },
    { id: 'q5',  text: '상대방의 기분이나 반응이 두렵거나 예측하기 어렵다' },
    { id: 'q6',  text: '내 결정이나 생활에 대해 과도한 통제를 받는다고 느낀다' },
    { id: 'q7',  text: '관계에서 내 필요나 바람은 항상 뒷전이 된다' },
    { id: 'q8',  text: '상대방과 갈등이 생기면 내가 먼저 사과하게 된다' },
    { id: 'q9',  text: '이 관계를 떠나고 싶지만 두렵거나 죄책감이 든다' },
    { id: 'q10', text: '상대방이 나의 성공이나 행복을 진심으로 기뻐하지 않는다' },
    { id: 'q11', text: '관계 안에서 나 자신을 표현하기 어렵다' },
    { id: 'q12', text: '이 관계가 나를 지치게 만든다' },
    { id: 'q13', text: '상대방의 행동이나 말로 인해 자존감이 낮아진다' },
    { id: 'q14', text: '상대방이 나를 가스라이팅한다는 느낌이 든다' },
    { id: 'q15', text: '이 관계에서 행복보다 걱정이나 불안을 더 자주 느낀다' },
  ],
  en: [
    { id: 'q1',  text: 'The other person dismisses or ignores my feelings or opinions' },
    { id: 'q2',  text: 'I often feel like I am in the wrong in this relationship' },
    { id: 'q3',  text: 'The other person frequently criticizes or belittles me' },
    { id: 'q4',  text: 'My relationships with friends or family have grown distant because of this person' },
    { id: 'q5',  text: 'I find the other person\'s mood or reactions frightening or unpredictable' },
    { id: 'q6',  text: 'I feel excessively controlled in my decisions or daily life' },
    { id: 'q7',  text: 'My needs and wishes are always put last in this relationship' },
    { id: 'q8',  text: 'When conflict arises, I end up being the one who apologizes first' },
    { id: 'q9',  text: 'I want to leave this relationship but feel afraid or guilty' },
    { id: 'q10', text: 'The other person does not genuinely celebrate my successes or happiness' },
    { id: 'q11', text: 'I find it difficult to express myself within this relationship' },
    { id: 'q12', text: 'This relationship leaves me feeling drained' },
    { id: 'q13', text: 'My self-esteem has lowered because of things this person says or does' },
    { id: 'q14', text: 'I sometimes feel like I am being gaslighted by this person' },
    { id: 'q15', text: 'In this relationship, I feel worry or anxiety more often than happiness' },
  ],
  ja: [
    { id: 'q1',  text: '相手が私の感情や意見を無視したり軽視したりする' },
    { id: 'q2',  text: 'この関係の中で、よく自分が悪いと感じる' },
    { id: 'q3',  text: '相手が頻繁に私を批判したり貶めたりする' },
    { id: 'q4',  text: 'この人のせいで友人や家族との関係が遠くなった' },
    { id: 'q5',  text: '相手の気分や反応が恐ろしく、予測しにくい' },
    { id: 'q6',  text: '私の決断や生活について過度にコントロールされている' },
    { id: 'q7',  text: 'この関係では私のニーズや望みはいつも後回しにされる' },
    { id: 'q8',  text: '対立が起きると、いつも私が先に謝ることになる' },
    { id: 'q9',  text: 'この関係を離れたいが、怖さや罪悪感がある' },
    { id: 'q10', text: '相手が私の成功や幸福を心から喜んでくれない' },
    { id: 'q11', text: 'この関係の中で自分を表現しにくい' },
    { id: 'q12', text: 'この関係が私を疲弊させる' },
    { id: 'q13', text: '相手の言動によって自己肯定感が下がった' },
    { id: 'q14', text: '相手にガスライティングされていると感じることがある' },
    { id: 'q15', text: 'この関係では幸せより心配や不安をより多く感じる' },
  ],
  zh: [
    { id: 'q1',  text: '对方无视或否定我的感受和意见' },
    { id: 'q2',  text: '在这段关系里，我常觉得是我做错了' },
    { id: 'q3',  text: '对方常说批评或贬低我的话' },
    { id: 'q4',  text: '因为这个人，我和朋友、家人的关系变远了' },
    { id: 'q5',  text: '对方的情绪或反应让我害怕，或难以预测' },
    { id: 'q6',  text: '我觉得自己的决定或生活受到过度控制' },
    { id: 'q7',  text: '在关系里，我的需要和愿望总是被放在最后' },
    { id: 'q8',  text: '和对方起冲突时，总是我先道歉' },
    { id: 'q9',  text: '我想离开这段关系，但又害怕或内疚' },
    { id: 'q10', text: '对方不会真心为我的成功或幸福高兴' },
    { id: 'q11', text: '在这段关系里，我很难表达自己' },
    { id: 'q12', text: '这段关系让我精疲力尽' },
    { id: 'q13', text: '对方的言行让我的自尊变低' },
    { id: 'q14', text: '我觉得对方在对我进行“煤气灯”式操控' },
    { id: 'q15', text: '在这段关系里，我感到担心或不安的时候比幸福更多' },
  ],
  fr: [
    { id: 'q1',  text: 'L’autre ignore ou balaie mes émotions et mes opinions' },
    { id: 'q2',  text: 'Dans cette relation, j’ai souvent l’impression d’être en tort' },
    { id: 'q3',  text: 'L’autre me critique ou me rabaisse souvent' },
    { id: 'q4',  text: 'Mes liens avec mes amis ou ma famille se sont distendus à cause de cette personne' },
    { id: 'q5',  text: 'L’humeur ou les réactions de l’autre me font peur ou sont imprévisibles' },
    { id: 'q6',  text: 'Je sens que mes décisions ou ma vie sont excessivement contrôlées' },
    { id: 'q7',  text: 'Dans la relation, mes besoins et envies passent toujours en dernier' },
    { id: 'q8',  text: 'En cas de conflit, c’est moi qui finis par m’excuser en premier' },
    { id: 'q9',  text: 'Je voudrais quitter cette relation, mais j’ai peur ou je culpabilise' },
    { id: 'q10', text: 'L’autre ne se réjouit pas sincèrement de mes réussites ou de mon bonheur' },
    { id: 'q11', text: 'J’ai du mal à m’exprimer dans cette relation' },
    { id: 'q12', text: 'Cette relation m’épuise' },
    { id: 'q13', text: 'Les paroles ou actes de l’autre font baisser mon estime de moi' },
    { id: 'q14', text: 'J’ai l’impression que l’autre me manipule en me faisant douter de moi (gaslighting)' },
    { id: 'q15', text: 'Dans cette relation, je ressens plus souvent de l’inquiétude ou de l’anxiété que du bonheur' },
  ],
  es: [
    { id: 'q1',  text: 'El otro ignora o desprecia mis emociones y opiniones' },
    { id: 'q2',  text: 'En esta relación siento a menudo que soy yo quien hace mal las cosas' },
    { id: 'q3',  text: 'El otro me critica o me menosprecia a menudo' },
    { id: 'q4',  text: 'Mi relación con amigos o familia se ha distanciado por esta persona' },
    { id: 'q5',  text: 'El estado de ánimo o las reacciones del otro me dan miedo o son imprevisibles' },
    { id: 'q6',  text: 'Siento que controlan en exceso mis decisiones o mi vida' },
    { id: 'q7',  text: 'En la relación, mis necesidades y deseos siempre quedan en último lugar' },
    { id: 'q8',  text: 'Cuando hay conflicto, acabo siendo yo quien se disculpa primero' },
    { id: 'q9',  text: 'Quiero dejar esta relación, pero tengo miedo o me siento culpable' },
    { id: 'q10', text: 'El otro no se alegra de verdad de mis logros o mi felicidad' },
    { id: 'q11', text: 'Me cuesta expresarme en esta relación' },
    { id: 'q12', text: 'Esta relación me agota' },
    { id: 'q13', text: 'Lo que el otro dice o hace hace que baje mi autoestima' },
    { id: 'q14', text: 'Siento que el otro me hace luz de gas (gaslighting)' },
    { id: 'q15', text: 'En esta relación siento preocupación o ansiedad más a menudo que felicidad' },
  ],
}

const RESULTS: Record<Level, Record<SupportedLang, LevelData>> = {
  healthy: {
    ko: {
      title: '건강한 관계', subtitle: '이 관계는 전반적으로 건강해 보입니다',
      description: '현재 관계에서 큰 독성 패턴이 발견되지 않았습니다. 서로를 존중하고 각자의 필요를 배려하는 균형 잡힌 관계 패턴을 보이고 있습니다.',
      patterns: ['상호 존중의 흔적', '건강한 경계 유지', '서로의 독립성 인정', '갈등을 건설적으로 해결'],
      steps: ['지금의 건강한 패턴을 의식적으로 유지하기', '소통과 경청을 꾸준히 연습하기', '서로의 성장을 지지하기'],
      encouragement: '당신은 건강한 관계를 만들어가고 있습니다. 관계도 꾸준한 돌봄이 필요합니다. 지금의 노력을 이어가세요.',
    },
    en: {
      title: 'Healthy Relationship', subtitle: 'This relationship appears generally healthy',
      description: 'No major toxic patterns were detected in your current relationship. You show a balanced pattern of mutual respect and consideration for each other\'s needs.',
      patterns: ['Signs of mutual respect', 'Healthy boundaries maintained', 'Each person\'s independence is acknowledged', 'Conflict handled constructively'],
      steps: ['Consciously maintain your healthy patterns', 'Keep practicing communication and listening', 'Support each other\'s growth'],
      encouragement: 'You are building a healthy relationship. Relationships still need ongoing care. Keep up the effort you are putting in.',
    },
    ja: {
      title: '健全な関係', subtitle: 'この関係は全体的に健全に見えます',
      description: '現在の関係に大きな毒性パターンは見つかりませんでした。お互いを尊重し、それぞれのニーズを配慮したバランスの取れた関係パターンを示しています。',
      patterns: ['相互尊重の跡', '健全な境界の維持', 'お互いの独立性を認める', '葛藤を建設的に解決'],
      steps: ['今の健全なパターンを意識的に維持する', 'コミュニケーションと傾聴を継続的に練習する', 'お互いの成長を支持する'],
      encouragement: 'あなたは健全な関係を築いています。関係にも継続的なケアが必要です。今の努力を続けてください。',
    },
    zh: {
      title: '健康的关系', subtitle: '这段关系整体上看起来很健康',
      description: '目前的关系中没有发现明显的有害模式。你们表现出互相尊重、顾及彼此需要的平衡关系。',
      patterns: ['相互尊重的痕迹', '维持健康的界限', '认可彼此的独立', '建设性地解决冲突'],
      steps: ['有意识地维持现在的健康模式', '持续练习沟通与倾听', '支持彼此的成长'],
      encouragement: '你正在经营一段健康的关系。关系也需要持续照顾，把现在的努力继续下去吧。',
    },
    fr: {
      title: 'Relation saine', subtitle: 'Cette relation paraît globalement saine',
      description: 'Aucun schéma toxique important n’apparaît dans votre relation actuelle. Elle montre un équilibre fait de respect mutuel et d’attention aux besoins de chacun.',
      patterns: ['Des signes de respect mutuel', 'Des limites saines', 'Une indépendance reconnue de part et d’autre', 'Des conflits résolus de façon constructive'],
      steps: ['Entretenir consciemment ces schémas sains', 'Pratiquer régulièrement la communication et l’écoute', 'Soutenir la croissance de chacun'],
      encouragement: 'Vous construisez une relation saine. Une relation demande aussi un soin régulier : continuez vos efforts.',
    },
    es: {
      title: 'Relación sana', subtitle: 'En general, esta relación parece sana',
      description: 'No aparecen patrones tóxicos importantes en tu relación actual. Muestra un equilibrio de respeto mutuo y atención a las necesidades de cada uno.',
      patterns: ['Señales de respeto mutuo', 'Límites sanos', 'Independencia reconocida por ambas partes', 'Conflictos resueltos de forma constructiva'],
      steps: ['Mantener conscientemente estos patrones sanos', 'Practicar con constancia la comunicación y la escucha', 'Apoyar el crecimiento del otro'],
      encouragement: 'Estás construyendo una relación sana. Las relaciones también necesitan cuidado constante: sigue con tu esfuerzo.',
    },
  },
  some_flags: {
    ko: {
      title: '주의 신호 있음', subtitle: '일부 패턴에 주의가 필요합니다',
      description: '몇 가지 주의할 만한 패턴들이 발견되었습니다. 이 패턴들이 관계에 영향을 주고 있을 수 있습니다. 이 시점에서 대화나 경계 설정이 도움이 될 수 있습니다.',
      patterns: ['가끔 소통에 어려움', '경계가 흐릿한 경우가 있음', '일부 불균형한 역동', '감정 소진 경험'],
      steps: ['파트너와 솔직한 대화 시도', '자신의 필요와 경계 명확히 하기', '관계 상담을 고려해보기', '친한 사람과 이야기 나누기'],
      encouragement: '신호를 알아차리는 것이 첫 번째 용기입니다. 당신은 더 나은 관계를 받을 자격이 있습니다.',
    },
    en: {
      title: 'Some Red Flags', subtitle: 'Some patterns need attention',
      description: 'A few concerning patterns have been identified. These may be affecting your relationship. At this point, honest conversation or boundary-setting could be helpful.',
      patterns: ['Occasional communication difficulties', 'Boundaries can be blurry at times', 'Some imbalanced dynamics', 'Experiences of emotional depletion'],
      steps: ['Try having an honest conversation with your partner', 'Clarify your own needs and limits', 'Consider relationship counseling', 'Talk to someone you trust'],
      encouragement: 'Noticing the signals is the first act of courage. You deserve a better relationship.',
    },
    ja: {
      title: '注意サインあり', subtitle: '一部のパターンに注意が必要です',
      description: 'いくつかの気になるパターンが見つかりました。これらが関係に影響している可能性があります。この時点で、率直な対話や境界設定が助けになるかもしれません。',
      patterns: ['時々コミュニケーションの困難', '境界が曖昧になることがある', '一部アンバランスなダイナミクス', '感情消耗の経験'],
      steps: ['パートナーと率直な対話を試みる', '自分のニーズと限界を明確にする', '関係カウンセリングを検討する', '信頼できる人に話す'],
      encouragement: 'サインに気づくことが最初の勇気です。あなたはより良い関係を受け取る資格があります。',
    },
    zh: {
      title: '有警示信号', subtitle: '有些模式需要留意',
      description: '发现了几个值得注意的模式，可能正在影响你们的关系。这时候，好好谈谈或设定界限会有帮助。',
      patterns: ['偶尔沟通困难', '有时界限模糊', '部分不平衡的互动', '有过情绪耗竭的经历'],
      steps: ['试着和伴侣坦诚对话', '厘清自己的需要和界限', '考虑关系咨询', '和亲近的人聊聊'],
      encouragement: '察觉到信号是第一份勇气。你值得拥有更好的关系。',
    },
    fr: {
      title: 'Signaux d’alerte', subtitle: 'Certains schémas méritent votre attention',
      description: 'Quelques schémas préoccupants sont apparus et pourraient peser sur la relation. À ce stade, une conversation ou la définition de limites peut aider.',
      patterns: ['Des difficultés de communication par moments', 'Des limites parfois floues', 'Une dynamique en partie déséquilibrée', 'Des épisodes d’épuisement émotionnel'],
      steps: ['Tenter une conversation franche avec votre partenaire', 'Clarifier vos besoins et vos limites', 'Envisager une thérapie de couple', 'En parler à un proche'],
      encouragement: 'Repérer les signaux est un premier acte de courage. Vous méritez une relation meilleure.',
    },
    es: {
      title: 'Señales de alerta', subtitle: 'Algunos patrones merecen atención',
      description: 'Han aparecido algunos patrones preocupantes que podrían estar afectando a la relación. En este punto, hablar o poner límites puede ayudar.',
      patterns: ['Dificultades de comunicación a veces', 'Límites a veces difusos', 'Una dinámica en parte desequilibrada', 'Episodios de agotamiento emocional'],
      steps: ['Intentar una conversación sincera con tu pareja', 'Aclarar tus necesidades y límites', 'Plantearte terapia de pareja', 'Hablarlo con alguien cercano'],
      encouragement: 'Reconocer las señales es el primer acto de valentía. Mereces una relación mejor.',
    },
  },
  notable: {
    ko: {
      title: '패턴 주의', subtitle: '여러 독성 패턴이 관찰됩니다',
      description: '상당수의 독성 패턴이 발견되었습니다. 이 관계가 당신의 정서적 안녕에 영향을 미치고 있을 가능성이 높습니다. 이 패턴들은 변화 가능하지만, 적극적인 노력이 필요합니다.',
      patterns: ['반복적인 경계 침해', '감정적 소진이 지속됨', '자존감 저하 경험', '관계 내 불균형한 힘의 역동'],
      steps: ['전문 상담사와 상담 고려하기', '신뢰할 수 있는 지지 네트워크 찾기', '자신의 필요를 최우선으로 두기', '관계의 지속 여부를 차분히 평가하기'],
      encouragement: '이 결과는 당신이 나쁜 사람임을 의미하지 않습니다. 도움을 요청하는 것은 강함의 표시입니다.',
    },
    en: {
      title: 'Notable Patterns', subtitle: 'Several toxic patterns are observed',
      description: 'A significant number of toxic patterns have been found. This relationship is likely affecting your emotional wellbeing. These patterns can change, but active effort is needed.',
      patterns: ['Repeated boundary violations', 'Ongoing emotional exhaustion', 'Experiences of lowered self-esteem', 'Imbalanced power dynamics in the relationship'],
      steps: ['Consider speaking with a professional counselor', 'Seek a trustworthy support network', 'Put your own needs first', 'Calmly assess whether to continue this relationship'],
      encouragement: 'This result does not mean you are a bad person. Asking for help is a sign of strength.',
    },
    ja: {
      title: 'パターン注意', subtitle: '複数の毒性パターンが観察されます',
      description: 'かなりの数の毒性パターンが見つかりました。この関係があなたの感情的な幸福に影響している可能性が高いです。これらのパターンは変えられますが、積極的な努力が必要です。',
      patterns: ['繰り返す境界侵害', '感情的消耗が続いている', '自己肯定感低下の経験', '関係内の不均衡な力のダイナミクス'],
      steps: ['専門カウンセラーとの相談を検討する', '信頼できるサポートネットワークを探す', '自分のニーズを最優先にする', '関係を続けるかどうか冷静に評価する'],
      encouragement: 'この結果はあなたが悪い人だということではありません。助けを求めることは強さの表れです。',
    },
    zh: {
      title: '模式需留意', subtitle: '观察到多种有害模式',
      description: '发现了相当多的有害模式。这段关系很可能正在影响你的情绪健康。这些模式可以改变，但需要积极的努力。',
      patterns: ['反复的界限侵犯', '持续的情绪耗竭', '自尊下降', '关系中不平衡的权力动态'],
      steps: ['考虑找专业咨询师谈谈', '寻找可信任的支持网络', '把自己的需要放在第一位', '冷静评估是否要继续这段关系'],
      encouragement: '这个结果不代表你是坏人。求助是力量的体现。',
    },
    fr: {
      title: 'Schémas préoccupants', subtitle: 'Plusieurs schémas toxiques sont observés',
      description: 'De nombreux schémas toxiques sont apparus. Cette relation pèse probablement sur votre bien-être émotionnel. Ces schémas peuvent changer, mais cela demande des efforts actifs.',
      patterns: ['Des limites franchies à répétition', 'Un épuisement émotionnel persistant', 'Une baisse de l’estime de soi', 'Une dynamique de pouvoir déséquilibrée'],
      steps: ['Envisager de consulter un thérapeute', 'Chercher un réseau de soutien de confiance', 'Placer vos besoins en priorité', 'Évaluer calmement s’il faut poursuivre la relation'],
      encouragement: 'Ce résultat ne signifie pas que vous êtes quelqu’un de mauvais. Demander de l’aide est un signe de force.',
    },
    es: {
      title: 'Patrones preocupantes', subtitle: 'Se observan varios patrones tóxicos',
      description: 'Han aparecido bastantes patrones tóxicos. Es probable que esta relación esté afectando a tu bienestar emocional. Estos patrones pueden cambiar, pero requieren un esfuerzo activo.',
      patterns: ['Límites traspasados una y otra vez', 'Agotamiento emocional persistente', 'Baja autoestima', 'Una dinámica de poder desequilibrada'],
      steps: ['Plantearte consultar a un terapeuta', 'Buscar una red de apoyo de confianza', 'Poner tus necesidades en primer lugar', 'Valorar con calma si continuar la relación'],
      encouragement: 'Este resultado no significa que seas mala persona. Pedir ayuda es una muestra de fortaleza.',
    },
  },
  high_toxicity: {
    ko: {
      title: '독성 관계', subtitle: '지금 당신에게 가장 중요한 것은 당신 자신입니다',
      description: '높은 수준의 독성 패턴이 발견되었습니다. 이 관계는 당신의 정서적·심리적 건강에 심각한 영향을 미치고 있을 수 있습니다. 이 결과를 혼자 감당하지 마세요.',
      patterns: ['지속적인 정서적 피해', '심각한 경계 침해', '자기 가치감 손상', '관계 탈출이 어렵다는 느낌'],
      steps: ['안전한 전문가(상담사, 심리사)에게 연락하기', '신뢰할 수 있는 사람에게 현재 상황 알리기', '자신의 안전을 최우선으로 판단하기', '혼자서 해결하려 하지 않기'],
      encouragement: '당신은 이 상황에서 혼자가 아닙니다. 어떤 결과든, 당신은 존중받고 사랑받을 자격이 있습니다. 도움을 구하는 것은 용기 있는 행동입니다.',
    },
    en: {
      title: 'High Toxicity', subtitle: 'Right now, the most important thing is you',
      description: 'A high level of toxic patterns has been found. This relationship may be seriously affecting your emotional and psychological health. Do not carry this result alone.',
      patterns: ['Ongoing emotional harm', 'Serious boundary violations', 'Damaged sense of self-worth', 'A feeling of being unable to leave'],
      steps: ['Reach out to a safe professional (counselor, therapist)', 'Let someone you trust know your current situation', 'Prioritize your own safety above all', 'Do not try to handle this alone'],
      encouragement: 'You are not alone in this. Whatever your result, you deserve to be respected and loved. Seeking help is an act of courage.',
    },
    ja: {
      title: '毒性関係', subtitle: '今あなたにとって最も大切なのはあなた自身です',
      description: '高いレベルの毒性パターンが見つかりました。この関係はあなたの感情的・心理的健康に深刻な影響を与えている可能性があります。この結果を一人で抱えないでください。',
      patterns: ['継続的な感情的被害', '深刻な境界侵害', '自己価値感の損傷', '関係から抜け出せないという感覚'],
      steps: ['安全な専門家（カウンセラー、心理士）に連絡する', '信頼できる人に現在の状況を伝える', '自分の安全を最優先に判断する', '一人で解決しようとしない'],
      encouragement: 'あなたはこの状況で一人ではありません。どんな結果でも、あなたは尊重され愛される資格があります。助けを求めることは勇気ある行動です。',
    },
    zh: {
      title: '有害的关系', subtitle: '现在对你最重要的，是你自己',
      description: '发现了高度的有害模式。这段关系可能正在严重影响你的情绪和心理健康。请不要独自承受这个结果。',
      patterns: ['持续的情绪伤害', '严重的界限侵犯', '自我价值感受损', '觉得很难离开这段关系'],
      steps: ['联系可信赖的专业人士（咨询师、心理师）', '把目前的情况告诉可信任的人', '以自己的安全为最优先来判断', '不要试图独自解决'],
      encouragement: '在这件事上你并不孤单。无论结果如何，你都值得被尊重、被爱。求助是勇敢的行动。',
    },
    fr: {
      title: 'Relation toxique', subtitle: 'Ce qui compte le plus maintenant, c’est vous',
      description: 'Des schémas toxiques de haut niveau sont apparus. Cette relation peut nuire gravement à votre santé émotionnelle et psychologique. Ne portez pas ce résultat seul.',
      patterns: ['Des blessures émotionnelles persistantes', 'Des limites gravement franchies', 'Une estime de soi abîmée', 'Le sentiment qu’il est difficile de partir'],
      steps: ['Contacter un professionnel de confiance (thérapeute, psychologue)', 'Informer une personne de confiance de votre situation', 'Faire de votre sécurité la priorité absolue', 'Ne pas essayer de tout régler seul'],
      encouragement: 'Vous n’êtes pas seul face à cela. Quel que soit le résultat, vous méritez d’être respecté et aimé. Demander de l’aide est un acte courageux.',
    },
    es: {
      title: 'Relación tóxica', subtitle: 'Ahora lo más importante eres tú',
      description: 'Han aparecido patrones tóxicos de nivel alto. Esta relación puede estar afectando gravemente a tu salud emocional y psicológica. No cargues con este resultado a solas.',
      patterns: ['Daño emocional persistente', 'Límites gravemente traspasados', 'Autoestima dañada', 'Sensación de que es difícil salir de la relación'],
      steps: ['Contactar con un profesional de confianza (terapeuta, psicólogo)', 'Contarle tu situación a alguien de confianza', 'Poner tu seguridad como máxima prioridad', 'No intentar resolverlo a solas'],
      encouragement: 'No estás solo en esto. Sea cual sea el resultado, mereces respeto y cariño. Pedir ayuda es un acto valiente.',
    },
  },
}

function getLevel(score: number): Level {
  if (score <= 10) return 'healthy'
  if (score <= 22) return 'some_flags'
  if (score <= 35) return 'notable'
  return 'high_toxicity'
}

interface Props { locale?: string }

export default function ToxicRelationshipTest({ locale: lp = 'ko' }: Props) {
  const locale = lang(lp)
  const lb = LABELS[locale]
  const questions = QUESTIONS[locale]

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [result, setResult] = useState<{ level: Level; score: number } | null>(null)
  useRecordFinishedTest({ testId: "toxic-relationship", title: "ToxicRelationshipTest", finished: Boolean(result) });

  function pick(val: number) {
    const newAns = [...answers, val]
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
      <ScreeningQuestionnaire
        title={lb.title}
        subtitle={lb.subtitle}
        question={q.text}
        questionLabel={lb.questionOf(current + 1, questions.length)}
        progress={progress}
        options={lb.choiceLabels.map((label, value) => ({ label, value, indicator: value + 1 }))}
        screeningNote={lb.note}
        supportMessage={lb.disclaimer}
        onSelect={pick}
      />
    )
  }

  if (!result) return null
  const r = RESULTS[result.level][locale]
  const pct = Math.round((result.score / 45) * 100)
  const levelColors: Record<Level, string> = {
    healthy: '#22c55e', some_flags: '#f59e0b', notable: '#f97316', high_toxicity: '#ef4444',
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
        <h3 className="font-bold text-sm">{lb.patterns}</h3>
        <ul className="space-y-1">
          {r.patterns.map(p => (
            <li key={p} className="text-sm flex gap-2" style={{ color: 'var(--muted-foreground, #6b7280)' }}><span>•</span>{p}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border p-4 space-y-2" style={{ backgroundColor: 'var(--card, #fff)' }}>
        <h3 className="font-bold text-sm" style={{ color: '#16a34a' }}>{lb.steps}</h3>
        <ul className="space-y-1">
          {r.steps.map(s => (
            <li key={s} className="text-sm flex gap-2" style={{ color: 'var(--muted-foreground, #6b7280)' }}><span style={{ color: '#22c55e' }}>→</span>{s}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border p-4 space-y-1" style={{ borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' }}>
        <h3 className="font-bold text-sm" style={{ color: '#16a34a' }}>{lb.encouragement}</h3>
        <p className="text-sm" style={{ color: '#15803d' }}>"{r.encouragement}"</p>
      </div>

      <div className="rounded-xl border p-3" style={{ borderColor: '#fde68a', backgroundColor: '#fffbeb' }}>
        <p className="text-xs" style={{ color: '#92400e' }}>{lb.disclaimer}</p>
      </div>

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
