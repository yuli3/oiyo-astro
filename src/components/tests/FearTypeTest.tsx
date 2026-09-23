import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { Questionnaire } from '@/components/ui/questionnaire'
import ShareResultButton from '../shared/ShareResultButton'

type FearType = 'rejection' | 'failure' | 'loss' | 'unknown' | 'judgment'
type SupportedLang = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'

function lang(locale: string): SupportedLang {
  return (['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const).includes(locale as SupportedLang) ? (locale as SupportedLang) : 'en'
}

interface Option { type: FearType; text: string }
interface Question { id: string; text: string; options: Option[] }
interface ResultData {
  title: string
  subtitle: string
  coreDescription: string
  traits: string[]
  growth: string
  affirmation: string
}

const LABELS: Record<SupportedLang, {
  title: string
  subtitle: string
  questionOf: (c: number, t: number) => string
  restart: string
  share: string
  shareMsg: string
  yourType: string
  traits: string
  growth: string
  affirmation: string
  distribution: string
  note: string
}> = {
  ko: {
    title: '두려움 유형 테스트',
    subtitle: '나를 가장 두렵게 하는 것은?',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '나의 핵심 두려움 유형은',
    yourType: '나의 두려움 유형',
    traits: '주요 특성',
    growth: '성장 포인트',
    affirmation: '당신에게',
    distribution: '두려움 분포',
    note: '이 결과는 자기 이해를 위한 참고 자료입니다. 두려움은 모두가 가지고 있으며, 이해함으로써 성장할 수 있습니다.',
  },
  en: {
    title: 'Fear Type Test',
    subtitle: 'What Scares You the Most?',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My core fear type is',
    yourType: 'Your Fear Type',
    traits: 'Key Traits',
    growth: 'Growth Point',
    affirmation: 'For You',
    distribution: 'Fear Distribution',
    note: 'This result is for self-understanding. Everyone has fears — recognizing them is how we grow.',
  },
  ja: {
    title: '恐怖タイプテスト',
    subtitle: '何が最も怖いですか？',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '私のコア恐怖タイプは',
    yourType: '恐怖タイプ',
    traits: '主な特性',
    growth: '成長ポイント',
    affirmation: 'あなたへ',
    distribution: '恐怖の分布',
    note: 'この結果は自己理解のための参考情報です。恐怖は誰もが持つもの — 理解することで成長できます。',
  },
  zh: {
    title: '恐惧类型测验',
    subtitle: '最让我害怕的是什么？',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: '重新测验',
    share: '分享结果',
    shareMsg: '我的核心恐惧类型是',
    yourType: '我的恐惧类型',
    traits: '主要特点',
    growth: '成长要点',
    affirmation: '写给你',
    distribution: '恐惧分布',
    note: '本结果是帮助认识自己的参考。每个人都有恐惧，理解它就能成长。',
  },
  fr: {
    title: 'Test du type de peur',
    subtitle: 'Qu’est-ce qui me fait le plus peur ?',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: 'Recommencer',
    share: 'Partager le résultat',
    shareMsg: 'Mon type de peur principal',
    yourType: 'Mon type de peur',
    traits: 'Traits principaux',
    growth: 'Pistes de croissance',
    affirmation: 'Pour vous',
    distribution: 'Répartition des peurs',
    note: 'Ce résultat est un repère pour mieux vous connaître. Tout le monde a des peurs, et les comprendre permet de grandir.',
  },
  es: {
    title: 'Test del tipo de miedo',
    subtitle: '¿Qué es lo que más miedo me da?',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: 'Repetir',
    share: 'Compartir resultado',
    shareMsg: 'Mi tipo de miedo principal',
    yourType: 'Mi tipo de miedo',
    traits: 'Rasgos principales',
    growth: 'Claves para crecer',
    affirmation: 'Para ti',
    distribution: 'Distribución de los miedos',
    note: 'Este resultado es una referencia para conocerte mejor. Todo el mundo tiene miedos, y comprenderlos permite crecer.',
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    {
      id: 'q1', text: '새로운 아이디어를 떠올렸을 때 가장 먼저 드는 생각은?',
      options: [
        { type: 'rejection', text: '사람들이 이상하게 볼 것 같다' },
        { type: 'failure', text: '잘못되면 어떡하지?' },
        { type: 'loss', text: '너무 많은 것을 포기해야 할 것 같다' },
        { type: 'unknown', text: '결과를 전혀 예측할 수 없어 불안하다' },
      ],
    },
    {
      id: 'q2', text: '친한 사람과 다퉜을 때 가장 두려운 것은?',
      options: [
        { type: 'rejection', text: '그 사람이 나를 떠날 것 같다' },
        { type: 'failure', text: '내가 잘못했다는 것을 인정해야 하는 것' },
        { type: 'loss', text: '관계 자체를 잃을 것 같다' },
        { type: 'judgment', text: '다른 사람들이 내 편이 아닐 것 같다' },
      ],
    },
    {
      id: 'q3', text: '발표나 시험을 앞두고 가장 걱정되는 것은?',
      options: [
        { type: 'rejection', text: '잘 못하면 무시당할 것 같다' },
        { type: 'failure', text: '실수해서 망칠 것 같다' },
        { type: 'unknown', text: '어떤 결과가 나올지 전혀 모르겠다' },
        { type: 'judgment', text: '사람들에게 부족하게 보일 것 같다' },
      ],
    },
    {
      id: 'q4', text: '직장이나 학교에서 의견을 말하기 어려운 이유는?',
      options: [
        { type: 'rejection', text: '튀어 보여서 소외될 것 같아서' },
        { type: 'failure', text: '틀렸을 때의 창피함이 두려워서' },
        { type: 'unknown', text: '어떤 반응이 올지 예측이 안 돼서' },
        { type: 'judgment', text: '비판받거나 조롱당할 것 같아서' },
      ],
    },
    {
      id: 'q5', text: '관계에서 가장 힘든 상황은?',
      options: [
        { type: 'rejection', text: '상대가 나를 멀리하거나 연락이 뜸해질 때' },
        { type: 'failure', text: '내가 실망시켰다는 걸 알았을 때' },
        { type: 'loss', text: '특별한 관계가 변하거나 끝날 것 같을 때' },
        { type: 'unknown', text: '관계의 방향이 불확실할 때' },
      ],
    },
    {
      id: 'q6', text: '결정을 내리기 어려운 가장 큰 이유는?',
      options: [
        { type: 'rejection', text: '선택 때문에 누군가를 잃을 것 같아서' },
        { type: 'failure', text: '잘못된 선택을 할까 봐' },
        { type: 'loss', text: '무언가를 포기해야 해서' },
        { type: 'judgment', text: '다른 사람들이 내 선택을 비웃을 것 같아서' },
      ],
    },
    {
      id: 'q7', text: 'SNS에 글을 올리기 꺼려지는 이유는?',
      options: [
        { type: 'rejection', text: '관심을 받지 못할 것 같아서' },
        { type: 'failure', text: '완벽하지 않은 것을 올리기 싫어서' },
        { type: 'loss', text: '프라이버시를 잃을 것 같아서' },
        { type: 'judgment', text: '비판적인 댓글이 달릴 것 같아서' },
      ],
    },
    {
      id: 'q8', text: '혼자 있을 때 자주 드는 두려운 생각은?',
      options: [
        { type: 'rejection', text: '결국 아무도 나를 진정으로 원하지 않는다' },
        { type: 'failure', text: '나는 충분히 잘 하고 있지 않다' },
        { type: 'loss', text: '소중한 것들이 사라질 것 같다' },
        { type: 'judgment', text: '사람들이 나의 진짜 모습을 알면 실망할 것이다' },
      ],
    },
    {
      id: 'q9', text: '새로운 환경(새 직장, 이사)이 어려운 이유는?',
      options: [
        { type: 'rejection', text: '아무도 나를 좋아하지 않을 것 같아서' },
        { type: 'failure', text: '적응을 잘 못 할 것 같아서' },
        { type: 'loss', text: '익숙한 것들을 잃는 것이 두려워서' },
        { type: 'unknown', text: '어떤 곳인지 전혀 알 수 없어서' },
      ],
    },
    {
      id: 'q10', text: '나의 비밀이나 약점이 알려질까 봐 두려운 이유는?',
      options: [
        { type: 'rejection', text: '그것 때문에 버림받을 것 같아서' },
        { type: 'failure', text: '나의 실패가 드러나는 것 같아서' },
        { type: 'judgment', text: '나를 다르게 볼 것 같아서' },
        { type: 'unknown', text: '어떤 반응이 올지 전혀 모르겠다' },
      ],
    },
    {
      id: 'q11', text: '성공에 가까워질수록 오히려 불안해지는 이유는?',
      options: [
        { type: 'rejection', text: '성공 후 더 높은 기대를 받을 것이 두렵다' },
        { type: 'failure', text: '성공해도 언젠가 무너질 것 같다' },
        { type: 'loss', text: '성공이 지금의 나를 바꿔버릴 것 같다' },
        { type: 'judgment', text: '질투나 비판을 받을 것 같다' },
      ],
    },
    {
      id: 'q12', text: '가장 감동적인 이야기 유형은?',
      options: [
        { type: 'rejection', text: '혼자였던 사람이 진정한 사랑을 찾는 이야기' },
        { type: 'failure', text: '실패를 딛고 성공을 이루는 이야기' },
        { type: 'loss', text: '잃었던 것을 되찾는 이야기' },
        { type: 'unknown', text: '불확실한 세계에서 답을 찾는 이야기' },
      ],
    },
    {
      id: 'q13', text: '누군가에게 부탁하기 어려운 이유는?',
      options: [
        { type: 'rejection', text: '거절당할 것 같아서' },
        { type: 'failure', text: '부탁 자체가 내 무능함을 드러내는 것 같아서' },
        { type: 'judgment', text: '약해 보일 것 같아서' },
        { type: 'unknown', text: '어떤 반응이 올지 예측이 안 돼서' },
      ],
    },
    {
      id: 'q14', text: '오래된 관계나 습관을 바꾸지 못하는 이유는?',
      options: [
        { type: 'rejection', text: '변화가 관계에서의 거절로 이어질 것 같아서' },
        { type: 'loss', text: '익숙한 것을 잃고 싶지 않아서' },
        { type: 'unknown', text: '변화 후 어떻게 될지 몰라서' },
        { type: 'failure', text: '변화를 시도했다가 실패할 것 같아서' },
      ],
    },
    {
      id: 'q15', text: '꿈을 추구하지 못하는 가장 큰 이유는?',
      options: [
        { type: 'rejection', text: '꿈을 말하면 비웃음 당할 것 같아서' },
        { type: 'failure', text: '실패가 너무 두려워서' },
        { type: 'loss', text: '안정적인 것을 포기해야 해서' },
        { type: 'unknown', text: '어떻게 될지 전혀 예측이 안 돼서' },
      ],
    },
    {
      id: 'q16', text: '감사함을 표현하거나 친밀함을 드러내기 어려운 이유는?',
      options: [
        { type: 'rejection', text: '감정을 보여줬다가 외면당할 것 같아서' },
        { type: 'failure', text: '어색하게 표현해서 망칠 것 같아서' },
        { type: 'judgment', text: '감정적인 사람으로 보일 것 같아서' },
        { type: 'unknown', text: '상대가 어떻게 반응할지 몰라서' },
      ],
    },
  ],
  en: [
    {
      id: 'q1', text: 'When you come up with a new idea, the first thought is...',
      options: [
        { type: 'rejection', text: 'People will think it\'s weird' },
        { type: 'failure', text: 'What if it goes wrong?' },
        { type: 'loss', text: 'I\'d have to give up too much' },
        { type: 'unknown', text: 'I can\'t predict the outcome at all' },
      ],
    },
    {
      id: 'q2', text: 'What scares you most after an argument with someone close?',
      options: [
        { type: 'rejection', text: 'They might leave me' },
        { type: 'failure', text: 'Having to admit I was wrong' },
        { type: 'loss', text: 'Losing the relationship itself' },
        { type: 'judgment', text: 'Others won\'t take my side' },
      ],
    },
    {
      id: 'q3', text: 'Before a presentation or exam, your biggest worry is...',
      options: [
        { type: 'rejection', text: 'Being dismissed if I do poorly' },
        { type: 'failure', text: 'Making a mistake and ruining it' },
        { type: 'unknown', text: 'I have no idea what the outcome will be' },
        { type: 'judgment', text: 'Looking inadequate to others' },
      ],
    },
    {
      id: 'q4', text: 'Why is it hard to voice your opinion at work or school?',
      options: [
        { type: 'rejection', text: 'Standing out might lead to being excluded' },
        { type: 'failure', text: 'The shame of being wrong is too great' },
        { type: 'unknown', text: 'I can\'t predict how people will react' },
        { type: 'judgment', text: 'I might be criticized or mocked' },
      ],
    },
    {
      id: 'q5', text: 'The hardest situation in a relationship is...',
      options: [
        { type: 'rejection', text: 'When someone starts pulling away from me' },
        { type: 'failure', text: 'When I realize I\'ve let someone down' },
        { type: 'loss', text: 'When a special relationship seems to be ending' },
        { type: 'unknown', text: 'When the direction of a relationship is unclear' },
      ],
    },
    {
      id: 'q6', text: 'The main reason it\'s hard to make decisions is...',
      options: [
        { type: 'rejection', text: 'My choice might cost me someone' },
        { type: 'failure', text: 'Fear of choosing wrong' },
        { type: 'loss', text: 'Something has to be given up' },
        { type: 'judgment', text: 'Others might laugh at my decision' },
      ],
    },
    {
      id: 'q7', text: 'Why do you hesitate to post on social media?',
      options: [
        { type: 'rejection', text: 'I might not get any attention' },
        { type: 'failure', text: 'I don\'t want to post anything imperfect' },
        { type: 'loss', text: 'I could lose my privacy' },
        { type: 'judgment', text: 'I might get critical comments' },
      ],
    },
    {
      id: 'q8', text: 'A fear that comes up often when you\'re alone...',
      options: [
        { type: 'rejection', text: 'Nobody truly wants me around' },
        { type: 'failure', text: 'I\'m not doing well enough' },
        { type: 'loss', text: 'The things I love will disappear' },
        { type: 'judgment', text: 'People would be disappointed if they saw the real me' },
      ],
    },
    {
      id: 'q9', text: 'Why is a new environment (new job, moving) difficult?',
      options: [
        { type: 'rejection', text: 'Nobody will like me there' },
        { type: 'failure', text: 'I might fail to adapt' },
        { type: 'loss', text: 'I\'m afraid of losing what\'s familiar' },
        { type: 'unknown', text: 'I have no idea what it\'s like' },
      ],
    },
    {
      id: 'q10', text: 'Why are you afraid of your secrets or weaknesses being exposed?',
      options: [
        { type: 'rejection', text: 'I might be abandoned because of them' },
        { type: 'failure', text: 'It feels like my failures would be on display' },
        { type: 'judgment', text: 'People would see me differently' },
        { type: 'unknown', text: 'I have no idea how people would react' },
      ],
    },
    {
      id: 'q11', text: 'Why does anxiety increase as you get closer to success?',
      options: [
        { type: 'rejection', text: 'Success brings even higher expectations I might not meet' },
        { type: 'failure', text: 'Even if I succeed, I\'ll eventually collapse' },
        { type: 'loss', text: 'Success might change who I am' },
        { type: 'judgment', text: 'I\'ll attract envy or criticism' },
      ],
    },
    {
      id: 'q12', text: 'What kind of story moves you most?',
      options: [
        { type: 'rejection', text: 'A lonely person finding true love' },
        { type: 'failure', text: 'Overcoming failure to achieve success' },
        { type: 'loss', text: 'Reclaiming what was once lost' },
        { type: 'unknown', text: 'Finding answers in an uncertain world' },
      ],
    },
    {
      id: 'q13', text: 'Why is it hard to ask someone for help?',
      options: [
        { type: 'rejection', text: 'They might say no' },
        { type: 'failure', text: 'Asking reveals my incompetence' },
        { type: 'judgment', text: 'I\'ll look weak' },
        { type: 'unknown', text: 'I can\'t predict their reaction' },
      ],
    },
    {
      id: 'q14', text: 'Why can\'t you change a long-standing relationship or habit?',
      options: [
        { type: 'rejection', text: 'Change might lead to being rejected in that relationship' },
        { type: 'loss', text: 'I don\'t want to lose what\'s familiar' },
        { type: 'unknown', text: 'I don\'t know what will happen after change' },
        { type: 'failure', text: 'I might attempt change and fail' },
      ],
    },
    {
      id: 'q15', text: 'The biggest reason you can\'t pursue your dreams...',
      options: [
        { type: 'rejection', text: 'People will laugh at me if I say my dream out loud' },
        { type: 'failure', text: 'I\'m too afraid of failure' },
        { type: 'loss', text: 'I\'d have to give up security' },
        { type: 'unknown', text: 'I have no idea how things will turn out' },
      ],
    },
    {
      id: 'q16', text: 'Why is it hard to express gratitude or closeness?',
      options: [
        { type: 'rejection', text: 'Showing emotion might lead to being ignored' },
        { type: 'failure', text: 'I might express it awkwardly and ruin the moment' },
        { type: 'judgment', text: 'I\'ll seem too emotional' },
        { type: 'unknown', text: 'I don\'t know how the other person will respond' },
      ],
    },
  ],
  ja: [
    {
      id: 'q1', text: '新しいアイデアを思いついたとき、最初に浮かぶ考えは？',
      options: [
        { type: 'rejection', text: '変に思われそう' },
        { type: 'failure', text: 'うまくいかなかったらどうしよう' },
        { type: 'loss', text: '多くのものを犠牲にしなければならない' },
        { type: 'unknown', text: '結果が全く予測できなくて不安' },
      ],
    },
    {
      id: 'q2', text: '親しい人とけんかしたとき、最も怖いことは？',
      options: [
        { type: 'rejection', text: 'その人が去っていきそう' },
        { type: 'failure', text: '自分が間違っていたと認めなければならないこと' },
        { type: 'loss', text: '関係そのものを失いそう' },
        { type: 'judgment', text: '他の人が自分の味方でないと感じる' },
      ],
    },
    {
      id: 'q3', text: '発表や試験を前にして最も心配なことは？',
      options: [
        { type: 'rejection', text: 'うまくできなければ軽視されそう' },
        { type: 'failure', text: 'ミスして台無しにしそう' },
        { type: 'unknown', text: 'どんな結果になるか全くわからない' },
        { type: 'judgment', text: '人に不十分に見られそう' },
      ],
    },
    {
      id: 'q4', text: '職場や学校で意見を言いにくい理由は？',
      options: [
        { type: 'rejection', text: '目立って仲間外れにされそうだから' },
        { type: 'failure', text: '間違えたときの恥ずかしさが怖くて' },
        { type: 'unknown', text: 'どんな反応が来るか予測できなくて' },
        { type: 'judgment', text: '批判されたりバカにされそうだから' },
      ],
    },
    {
      id: 'q5', text: '関係で最も辛い状況は？',
      options: [
        { type: 'rejection', text: '相手が距離を置いたり連絡が減ったとき' },
        { type: 'failure', text: '相手を失望させたと気づいたとき' },
        { type: 'loss', text: '大切な関係が変わったり終わりそうなとき' },
        { type: 'unknown', text: '関係の行方が不確かなとき' },
      ],
    },
    {
      id: 'q6', text: '決断しにくい最大の理由は？',
      options: [
        { type: 'rejection', text: '選択によって誰かを失いそうだから' },
        { type: 'failure', text: '間違った選択をするかもしれないから' },
        { type: 'loss', text: '何かを諦めなければならないから' },
        { type: 'judgment', text: '他の人に選択をバカにされそうだから' },
      ],
    },
    {
      id: 'q7', text: 'SNSに投稿するのをためらう理由は？',
      options: [
        { type: 'rejection', text: '関心を持ってもらえなさそうだから' },
        { type: 'failure', text: '完璧でないものを載せたくないから' },
        { type: 'loss', text: 'プライバシーを失いそうだから' },
        { type: 'judgment', text: '批判的なコメントが来そうだから' },
      ],
    },
    {
      id: 'q8', text: '一人でいるときによく浮かぶ怖い考えは？',
      options: [
        { type: 'rejection', text: '誰も本当に自分を必要としていない' },
        { type: 'failure', text: '十分にうまくやれていない' },
        { type: 'loss', text: '大切なものが消えていきそう' },
        { type: 'judgment', text: '本当の自分を知ったら皆失望する' },
      ],
    },
    {
      id: 'q9', text: '新しい環境（新しい職場、引っ越し）が難しい理由は？',
      options: [
        { type: 'rejection', text: '誰にも好かれなさそうだから' },
        { type: 'failure', text: 'うまく適応できなさそうだから' },
        { type: 'loss', text: '慣れ親しんだものを失うのが怖いから' },
        { type: 'unknown', text: 'どんな場所か全くわからないから' },
      ],
    },
    {
      id: 'q10', text: '秘密や弱点が知られることを恐れる理由は？',
      options: [
        { type: 'rejection', text: 'それで見捨てられそうだから' },
        { type: 'failure', text: '自分の失敗が露わになる感じがするから' },
        { type: 'judgment', text: '自分を違う目で見られそうだから' },
        { type: 'unknown', text: 'どんな反応が来るか全くわからない' },
      ],
    },
    {
      id: 'q11', text: '成功に近づくほどかえって不安になる理由は？',
      options: [
        { type: 'rejection', text: '成功後により高い期待を持たれるのが怖い' },
        { type: 'failure', text: '成功してもいつか崩れそう' },
        { type: 'loss', text: '成功が今の自分を変えてしまいそう' },
        { type: 'judgment', text: '嫉妬や批判を受けそう' },
      ],
    },
    {
      id: 'q12', text: '最も感動する物語のタイプは？',
      options: [
        { type: 'rejection', text: '孤独だった人が本当の愛を見つける話' },
        { type: 'failure', text: '失敗を乗り越えて成功を掴む話' },
        { type: 'loss', text: '失ったものを取り戻す話' },
        { type: 'unknown', text: '不確かな世界の中で答えを探す話' },
      ],
    },
    {
      id: 'q13', text: '誰かにお願いしにくい理由は？',
      options: [
        { type: 'rejection', text: '断られそうだから' },
        { type: 'failure', text: 'お願い自体が自分の無能さを示す気がするから' },
        { type: 'judgment', text: '弱く見えそうだから' },
        { type: 'unknown', text: 'どんな反応が来るか予測できないから' },
      ],
    },
    {
      id: 'q14', text: '長年の関係や習慣を変えられない理由は？',
      options: [
        { type: 'rejection', text: '変化が関係での拒絶につながりそうだから' },
        { type: 'loss', text: '慣れ親しんだものを失いたくないから' },
        { type: 'unknown', text: '変化後どうなるかわからないから' },
        { type: 'failure', text: '変化を試みて失敗しそうだから' },
      ],
    },
    {
      id: 'q15', text: '夢を追いかけられない最大の理由は？',
      options: [
        { type: 'rejection', text: '夢を言ったら笑われそうだから' },
        { type: 'failure', text: '失敗がとても怖いから' },
        { type: 'loss', text: '安定したものを諦めなければならないから' },
        { type: 'unknown', text: 'どうなるか全く予測できないから' },
      ],
    },
    {
      id: 'q16', text: '感謝や親しみを表現しにくい理由は？',
      options: [
        { type: 'rejection', text: '感情を見せたら無視されそうだから' },
        { type: 'failure', text: '不自然に表現して台無しにしそうだから' },
        { type: 'judgment', text: '感情的な人に見えそうだから' },
        { type: 'unknown', text: '相手がどう反応するかわからないから' },
      ],
    },
  ],
  zh: [
    {
      id: 'q1', text: '想到一个新点子时，你第一个念头是？',
      options: [
        { type: 'rejection', text: '别人可能会觉得我很奇怪' },
        { type: 'failure', text: '要是出错了怎么办？' },
        { type: 'loss', text: '好像要放弃太多东西' },
        { type: 'unknown', text: '完全无法预测结果，让我不安' },
      ],
    },
    {
      id: 'q2', text: '和亲近的人吵架时，你最怕的是？',
      options: [
        { type: 'rejection', text: '那个人好像会离开我' },
        { type: 'failure', text: '必须承认是我错了' },
        { type: 'loss', text: '好像会失去这段关系本身' },
        { type: 'judgment', text: '其他人好像不会站在我这边' },
      ],
    },
    {
      id: 'q3', text: '面对报告或考试时，你最担心的是？',
      options: [
        { type: 'rejection', text: '做不好会被看不起' },
        { type: 'failure', text: '会因为失误而搞砸' },
        { type: 'unknown', text: '完全不知道会是什么结果' },
        { type: 'judgment', text: '在别人眼里显得不够好' },
      ],
    },
    {
      id: 'q4', text: '在公司或学校难以发表意见的原因是？',
      options: [
        { type: 'rejection', text: '怕显得突出而被孤立' },
        { type: 'failure', text: '怕说错时的难堪' },
        { type: 'unknown', text: '预测不到会有什么反应' },
        { type: 'judgment', text: '怕被批评或嘲笑' },
      ],
    },
    {
      id: 'q5', text: '在关系中最难受的情况是？',
      options: [
        { type: 'rejection', text: '对方疏远我、联系变少的时候' },
        { type: 'failure', text: '发现我让对方失望的时候' },
        { type: 'loss', text: '特别的关系好像要改变或结束的时候' },
        { type: 'unknown', text: '关系的方向不明确的时候' },
      ],
    },
    {
      id: 'q6', text: '难以做决定的最大原因是？',
      options: [
        { type: 'rejection', text: '怕因为这个选择失去某个人' },
        { type: 'failure', text: '怕做出错误的选择' },
        { type: 'loss', text: '因为必须放弃某些东西' },
        { type: 'judgment', text: '怕别人嘲笑我的选择' },
      ],
    },
    {
      id: 'q7', text: '不愿在社交媒体上发文的原因是？',
      options: [
        { type: 'rejection', text: '怕得不到关注' },
        { type: 'failure', text: '不想发不完美的东西' },
        { type: 'loss', text: '怕失去隐私' },
        { type: 'judgment', text: '怕出现批评的留言' },
      ],
    },
    {
      id: 'q8', text: '独处时常冒出的可怕念头是？',
      options: [
        { type: 'rejection', text: '到头来没有人真正想要我' },
        { type: 'failure', text: '我做得还不够好' },
        { type: 'loss', text: '珍贵的东西好像会消失' },
        { type: 'judgment', text: '别人要是知道真实的我会失望' },
      ],
    },
    {
      id: 'q9', text: '新环境（新工作、搬家）让你为难的原因是？',
      options: [
        { type: 'rejection', text: '怕没人会喜欢我' },
        { type: 'failure', text: '怕自己适应不好' },
        { type: 'loss', text: '害怕失去熟悉的一切' },
        { type: 'unknown', text: '完全不知道那会是什么样的地方' },
      ],
    },
    {
      id: 'q10', text: '害怕秘密或弱点被知道的原因是？',
      options: [
        { type: 'rejection', text: '怕因此被抛弃' },
        { type: 'failure', text: '好像会暴露我的失败' },
        { type: 'judgment', text: '怕别人对我另眼相看' },
        { type: 'unknown', text: '完全不知道会有什么反应' },
      ],
    },
    {
      id: 'q11', text: '越接近成功反而越不安的原因是？',
      options: [
        { type: 'rejection', text: '怕成功后被寄予更高的期待' },
        { type: 'failure', text: '就算成功，总有一天也会崩塌' },
        { type: 'loss', text: '怕成功会改变现在的我' },
        { type: 'judgment', text: '怕招来嫉妒或批评' },
      ],
    },
    {
      id: 'q12', text: '最打动你的故事类型是？',
      options: [
        { type: 'rejection', text: '孤单的人找到真爱的故事' },
        { type: 'failure', text: '跨越失败取得成功的故事' },
        { type: 'loss', text: '找回失去之物的故事' },
        { type: 'unknown', text: '在不确定的世界里寻找答案的故事' },
      ],
    },
    {
      id: 'q13', text: '难以开口请人帮忙的原因是？',
      options: [
        { type: 'rejection', text: '怕被拒绝' },
        { type: 'failure', text: '请求本身好像暴露了我的无能' },
        { type: 'judgment', text: '怕显得软弱' },
        { type: 'unknown', text: '预测不到会有什么反应' },
      ],
    },
    {
      id: 'q14', text: '无法改变旧关系或旧习惯的原因是？',
      options: [
        { type: 'rejection', text: '怕改变会导致在关系中被拒绝' },
        { type: 'loss', text: '不想失去熟悉的东西' },
        { type: 'unknown', text: '不知道改变后会怎样' },
        { type: 'failure', text: '怕尝试改变后失败' },
      ],
    },
    {
      id: 'q15', text: '无法追求梦想的最大原因是？',
      options: [
        { type: 'rejection', text: '怕说出梦想会被嘲笑' },
        { type: 'failure', text: '太害怕失败' },
        { type: 'loss', text: '因为要放弃安稳的东西' },
        { type: 'unknown', text: '完全预测不到会怎样' },
      ],
    },
    {
      id: 'q16', text: '难以表达感谢或亲密的原因是？',
      options: [
        { type: 'rejection', text: '怕表露情感后被冷落' },
        { type: 'failure', text: '怕表达得笨拙而搞砸' },
        { type: 'judgment', text: '怕显得太情绪化' },
        { type: 'unknown', text: '不知道对方会怎么反应' },
      ],
    },
  ],
  fr: [
    {
      id: 'q1', text: 'Quand une nouvelle idée vous vient, quelle est votre première pensée ?',
      options: [
        { type: 'rejection', text: 'Les gens vont me trouver bizarre' },
        { type: 'failure', text: 'Et si ça tournait mal ?' },
        { type: 'loss', text: 'J’ai l’impression de devoir renoncer à trop de choses' },
        { type: 'unknown', text: 'Je suis inquiet de ne pas pouvoir prévoir le résultat' },
      ],
    },
    {
      id: 'q2', text: 'Après une dispute avec un proche, qu’est-ce qui vous fait le plus peur ?',
      options: [
        { type: 'rejection', text: 'Que cette personne me quitte' },
        { type: 'failure', text: 'Devoir reconnaître que j’ai eu tort' },
        { type: 'loss', text: 'Perdre la relation elle-même' },
        { type: 'judgment', text: 'Que les autres ne soient pas de mon côté' },
      ],
    },
    {
      id: 'q3', text: 'Avant une présentation ou un examen, qu’est-ce qui vous inquiète le plus ?',
      options: [
        { type: 'rejection', text: 'Être méprisé si je rate' },
        { type: 'failure', text: 'Tout gâcher en faisant une erreur' },
        { type: 'unknown', text: 'Ne pas savoir du tout quel sera le résultat' },
        { type: 'judgment', text: 'Paraître insuffisant aux yeux des autres' },
      ],
    },
    {
      id: 'q4', text: 'Pourquoi est-il difficile de donner votre avis au travail ou à l’école ?',
      options: [
        { type: 'rejection', text: 'Par peur de me démarquer et d’être mis à l’écart' },
        { type: 'failure', text: 'Par peur d’avoir honte si je me trompe' },
        { type: 'unknown', text: 'Parce que je ne peux pas prévoir les réactions' },
        { type: 'judgment', text: 'Par peur d’être critiqué ou moqué' },
      ],
    },
    {
      id: 'q5', text: 'La situation la plus difficile dans une relation ?',
      options: [
        { type: 'rejection', text: 'Quand l’autre s’éloigne ou donne moins de nouvelles' },
        { type: 'failure', text: 'Quand je découvre que je l’ai déçu' },
        { type: 'loss', text: 'Quand une relation spéciale semble changer ou prendre fin' },
        { type: 'unknown', text: 'Quand la direction de la relation est incertaine' },
      ],
    },
    {
      id: 'q6', text: 'La principale raison qui rend une décision difficile ?',
      options: [
        { type: 'rejection', text: 'La peur de perdre quelqu’un à cause de mon choix' },
        { type: 'failure', text: 'La peur de faire le mauvais choix' },
        { type: 'loss', text: 'Devoir renoncer à quelque chose' },
        { type: 'judgment', text: 'La peur que les autres se moquent de mon choix' },
      ],
    },
    {
      id: 'q7', text: 'Pourquoi hésitez-vous à publier sur les réseaux ?',
      options: [
        { type: 'rejection', text: 'Par peur de ne pas avoir d’attention' },
        { type: 'failure', text: 'Je ne veux pas publier quelque chose d’imparfait' },
        { type: 'loss', text: 'Par peur de perdre ma vie privée' },
        { type: 'judgment', text: 'Par peur des commentaires critiques' },
      ],
    },
    {
      id: 'q8', text: 'Quelle pensée effrayante vous vient souvent quand vous êtes seul ?',
      options: [
        { type: 'rejection', text: 'Au fond, personne ne veut vraiment de moi' },
        { type: 'failure', text: 'Je ne fais pas assez bien les choses' },
        { type: 'loss', text: 'Ce qui m’est cher va disparaître' },
        { type: 'judgment', text: 'Si les gens voyaient qui je suis vraiment, ils seraient déçus' },
      ],
    },
    {
      id: 'q9', text: 'Pourquoi un nouvel environnement (nouveau travail, déménagement) est-il difficile ?',
      options: [
        { type: 'rejection', text: 'J’ai peur que personne ne m’apprécie' },
        { type: 'failure', text: 'J’ai peur de mal m’adapter' },
        { type: 'loss', text: 'J’ai peur de perdre ce qui m’est familier' },
        { type: 'unknown', text: 'Je ne sais pas du tout à quoi m’attendre' },
      ],
    },
    {
      id: 'q10', text: 'Pourquoi craignez-vous que vos secrets ou faiblesses soient connus ?',
      options: [
        { type: 'rejection', text: 'Par peur d’être abandonné à cause d’eux' },
        { type: 'failure', text: 'Parce que mes échecs seraient exposés' },
        { type: 'judgment', text: 'Parce qu’on me regarderait autrement' },
        { type: 'unknown', text: 'Parce que je ne sais pas du tout comment on réagirait' },
      ],
    },
    {
      id: 'q11', text: 'Pourquoi l’anxiété monte-t-elle à mesure que le succès approche ?',
      options: [
        { type: 'rejection', text: 'J’ai peur des attentes encore plus élevées après le succès' },
        { type: 'failure', text: 'Même en réussissant, j’ai l’impression que tout s’effondrera un jour' },
        { type: 'loss', text: 'J’ai peur que le succès change qui je suis' },
        { type: 'judgment', text: 'J’ai peur de la jalousie ou des critiques' },
      ],
    },
    {
      id: 'q12', text: 'Le type d’histoire qui vous touche le plus ?',
      options: [
        { type: 'rejection', text: 'Une personne seule qui trouve le véritable amour' },
        { type: 'failure', text: 'Quelqu’un qui surmonte l’échec pour réussir' },
        { type: 'loss', text: 'Retrouver ce qu’on avait perdu' },
        { type: 'unknown', text: 'Trouver des réponses dans un monde incertain' },
      ],
    },
    {
      id: 'q13', text: 'Pourquoi est-il difficile de demander de l’aide ?',
      options: [
        { type: 'rejection', text: 'Par peur d’un refus' },
        { type: 'failure', text: 'Parce que demander semble révéler mon incompétence' },
        { type: 'judgment', text: 'Par peur de paraître faible' },
        { type: 'unknown', text: 'Parce que je ne peux pas prévoir la réaction' },
      ],
    },
    {
      id: 'q14', text: 'Pourquoi ne parvenez-vous pas à changer de vieilles relations ou habitudes ?',
      options: [
        { type: 'rejection', text: 'Le changement pourrait mener à un rejet dans la relation' },
        { type: 'loss', text: 'Je ne veux pas perdre ce qui m’est familier' },
        { type: 'unknown', text: 'Je ne sais pas ce qui arrivera après le changement' },
        { type: 'failure', text: 'J’ai peur d’échouer en essayant de changer' },
      ],
    },
    {
      id: 'q15', text: 'La principale raison qui vous empêche de poursuivre vos rêves ?',
      options: [
        { type: 'rejection', text: 'Si j’en parle, on va se moquer de moi' },
        { type: 'failure', text: 'J’ai trop peur d’échouer' },
        { type: 'loss', text: 'Je devrais renoncer à ce qui est stable' },
        { type: 'unknown', text: 'Je ne peux absolument pas prévoir ce qui arrivera' },
      ],
    },
    {
      id: 'q16', text: 'Pourquoi est-il difficile d’exprimer votre gratitude ou votre affection ?',
      options: [
        { type: 'rejection', text: 'Par peur d’être ignoré après avoir montré mes émotions' },
        { type: 'failure', text: 'Par peur de tout gâcher en m’exprimant maladroitement' },
        { type: 'judgment', text: 'Par peur de paraître trop émotif' },
        { type: 'unknown', text: 'Parce que je ne sais pas comment l’autre réagira' },
      ],
    },
  ],
  es: [
    {
      id: 'q1', text: 'Cuando se te ocurre una idea nueva, ¿qué piensas primero?',
      options: [
        { type: 'rejection', text: 'La gente me verá como alguien raro' },
        { type: 'failure', text: '¿Y si sale mal?' },
        { type: 'loss', text: 'Siento que tendría que renunciar a demasiado' },
        { type: 'unknown', text: 'Me inquieta no poder prever el resultado' },
      ],
    },
    {
      id: 'q2', text: 'Tras discutir con alguien cercano, ¿qué te da más miedo?',
      options: [
        { type: 'rejection', text: 'Que esa persona me deje' },
        { type: 'failure', text: 'Tener que admitir que me equivoqué' },
        { type: 'loss', text: 'Perder la relación en sí' },
        { type: 'judgment', text: 'Que los demás no estén de mi parte' },
      ],
    },
    {
      id: 'q3', text: 'Ante una presentación o un examen, ¿qué te preocupa más?',
      options: [
        { type: 'rejection', text: 'Que me menosprecien si lo hago mal' },
        { type: 'failure', text: 'Estropearlo todo por un error' },
        { type: 'unknown', text: 'No tener ni idea de cuál será el resultado' },
        { type: 'judgment', text: 'Parecer insuficiente ante los demás' },
      ],
    },
    {
      id: 'q4', text: '¿Por qué te cuesta opinar en el trabajo o en clase?',
      options: [
        { type: 'rejection', text: 'Por miedo a destacar y quedar aislado' },
        { type: 'failure', text: 'Por miedo a la vergüenza de equivocarme' },
        { type: 'unknown', text: 'Porque no puedo prever la reacción' },
        { type: 'judgment', text: 'Por miedo a que me critiquen o se burlen' },
      ],
    },
    {
      id: 'q5', text: '¿La situación más difícil en una relación?',
      options: [
        { type: 'rejection', text: 'Cuando el otro se aleja o escribe menos' },
        { type: 'failure', text: 'Cuando descubro que le he decepcionado' },
        { type: 'loss', text: 'Cuando una relación especial parece cambiar o terminar' },
        { type: 'unknown', text: 'Cuando no está claro hacia dónde va la relación' },
      ],
    },
    {
      id: 'q6', text: '¿La mayor razón por la que te cuesta decidir?',
      options: [
        { type: 'rejection', text: 'Perder a alguien por mi elección' },
        { type: 'failure', text: 'Elegir mal' },
        { type: 'loss', text: 'Tener que renunciar a algo' },
        { type: 'judgment', text: 'Que los demás se rían de mi elección' },
      ],
    },
    {
      id: 'q7', text: '¿Por qué te cuesta publicar en redes sociales?',
      options: [
        { type: 'rejection', text: 'Por miedo a no recibir atención' },
        { type: 'failure', text: 'No quiero publicar algo imperfecto' },
        { type: 'loss', text: 'Por miedo a perder mi privacidad' },
        { type: 'judgment', text: 'Por miedo a comentarios críticos' },
      ],
    },
    {
      id: 'q8', text: '¿Qué pensamiento aterrador te viene a menudo cuando estás solo?',
      options: [
        { type: 'rejection', text: 'Al final, nadie me quiere de verdad' },
        { type: 'failure', text: 'No lo estoy haciendo lo bastante bien' },
        { type: 'loss', text: 'Lo que me importa va a desaparecer' },
        { type: 'judgment', text: 'Si la gente conociera mi verdadero yo, se decepcionaría' },
      ],
    },
    {
      id: 'q9', text: '¿Por qué te cuesta un entorno nuevo (trabajo nuevo, mudanza)?',
      options: [
        { type: 'rejection', text: 'Me da miedo no caerle bien a nadie' },
        { type: 'failure', text: 'Me da miedo no adaptarme' },
        { type: 'loss', text: 'Me da miedo perder lo conocido' },
        { type: 'unknown', text: 'No tengo ni idea de cómo será' },
      ],
    },
    {
      id: 'q10', text: '¿Por qué temes que se conozcan tus secretos o debilidades?',
      options: [
        { type: 'rejection', text: 'Por miedo a que me abandonen por ello' },
        { type: 'failure', text: 'Porque quedarían expuestos mis fracasos' },
        { type: 'judgment', text: 'Porque me verían de otra manera' },
        { type: 'unknown', text: 'Porque no tengo ni idea de cómo reaccionarían' },
      ],
    },
    {
      id: 'q11', text: '¿Por qué te inquietas más cuanto más cerca está el éxito?',
      options: [
        { type: 'rejection', text: 'Me asustan las expectativas más altas tras el éxito' },
        { type: 'failure', text: 'Aunque triunfe, siento que algún día se derrumbará' },
        { type: 'loss', text: 'Temo que el éxito cambie quien soy' },
        { type: 'judgment', text: 'Temo la envidia o las críticas' },
      ],
    },
    {
      id: 'q12', text: '¿El tipo de historia que más te emociona?',
      options: [
        { type: 'rejection', text: 'Alguien solo que encuentra el amor verdadero' },
        { type: 'failure', text: 'Superar el fracaso y alcanzar el éxito' },
        { type: 'loss', text: 'Recuperar lo que se había perdido' },
        { type: 'unknown', text: 'Encontrar respuestas en un mundo incierto' },
      ],
    },
    {
      id: 'q13', text: '¿Por qué te cuesta pedir ayuda?',
      options: [
        { type: 'rejection', text: 'Por miedo a que me digan que no' },
        { type: 'failure', text: 'Pedir parece mostrar mi incompetencia' },
        { type: 'judgment', text: 'Por miedo a parecer débil' },
        { type: 'unknown', text: 'Porque no puedo prever la reacción' },
      ],
    },
    {
      id: 'q14', text: '¿Por qué no consigues cambiar relaciones o hábitos antiguos?',
      options: [
        { type: 'rejection', text: 'El cambio podría llevar a un rechazo en la relación' },
        { type: 'loss', text: 'No quiero perder lo conocido' },
        { type: 'unknown', text: 'No sé qué pasará tras el cambio' },
        { type: 'failure', text: 'Temo fracasar si intento cambiar' },
      ],
    },
    {
      id: 'q15', text: '¿La mayor razón por la que no persigues tus sueños?',
      options: [
        { type: 'rejection', text: 'Si los cuento, se reirán de mí' },
        { type: 'failure', text: 'Me da demasiado miedo fracasar' },
        { type: 'loss', text: 'Tendría que renunciar a lo estable' },
        { type: 'unknown', text: 'No puedo prever en absoluto qué pasará' },
      ],
    },
    {
      id: 'q16', text: '¿Por qué te cuesta expresar gratitud o cercanía?',
      options: [
        { type: 'rejection', text: 'Por miedo a que me ignoren tras mostrar mis emociones' },
        { type: 'failure', text: 'Por miedo a estropearlo expresándome con torpeza' },
        { type: 'judgment', text: 'Por miedo a parecer demasiado emocional' },
        { type: 'unknown', text: 'Porque no sé cómo reaccionará el otro' },
      ],
    },
  ],
}

const RESULTS: Record<FearType, Record<SupportedLang, ResultData>> = {
  rejection: {
    ko: {
      title: '💔 거절 공포형',
      subtitle: '사랑받지 못할까 두려운 당신',
      coreDescription: '핵심 두려움은 버림받음과 소속감의 상실입니다. 관계에서 깊은 연결을 원하지만, 거절에 대한 두려움이 오히려 진정한 연결을 방해하기도 합니다.',
      traits: ['관계에 깊이 투자함', '승인 욕구가 강함', '갈등을 회피하는 경향', '혼자 남겨지는 것에 민감'],
      growth: '자기 자신을 먼저 수용하는 연습이 필요합니다. 나를 사랑해주는 사람은 나의 실수에도 곁에 있습니다. 모든 사람의 승인을 받을 필요는 없습니다.',
      affirmation: '당신은 무언가를 해냈기 때문이 아니라, 존재 자체로 사랑받을 자격이 있습니다.',
    },
    en: {
      title: '💔 Fear of Rejection',
      subtitle: 'Afraid of not being loved',
      coreDescription: 'Your core fear is abandonment and losing a sense of belonging. You crave deep connection in relationships, but fear of rejection can paradoxically prevent authentic bonds.',
      traits: ['Deeply invested in relationships', 'Strong need for approval', 'Tendency to avoid conflict', 'Sensitive to being left behind'],
      growth: 'Practice self-acceptance first. The people who truly love you stay through your mistakes. You don\'t need everyone\'s approval to be worthy.',
      affirmation: 'You deserve love not because of what you achieve, but simply because you exist.',
    },
    ja: {
      title: '💔 拒絶恐怖型',
      subtitle: '愛されないことを恐れるあなた',
      coreDescription: 'コアの恐怖は見捨てられることと所属感の喪失です。関係で深いつながりを求めますが、拒絶への恐怖が逆に本物のつながりを妨げることもあります。',
      traits: ['関係に深く投資する', '承認欲求が強い', '葛藤を回避する傾向', '一人にされることに敏感'],
      growth: 'まず自己受容の練習が必要です。本当に愛してくれる人はあなたのミスがあっても傍にいます。全員の承認を得る必要はありません。',
      affirmation: 'あなたは何かを達成したからではなく、存在するだけで愛される価値があります。',
    },
    zh: {
      title: '💔 害怕被拒绝型',
      subtitle: '害怕不被爱的你',
      coreDescription: '核心恐惧是被抛弃与失去归属。你渴望关系中的深度连结，但对拒绝的恐惧有时反而妨碍了真正的连结。',
      traits: ['对关系投入很深', '认可需求强烈', '倾向回避冲突', '对被独自留下很敏感'],
      growth: '需要先练习接纳自己。爱你的人，在你犯错时也会在你身边。你不需要得到每个人的认可。',
      affirmation: '你值得被爱，不是因为你做到了什么，而是因为你本身。',
    },
    fr: {
      title: '💔 Peur du rejet',
      subtitle: 'Vous qui craignez de ne pas être aimé',
      coreDescription: 'Votre peur centrale est l’abandon et la perte d’appartenance. Vous désirez des liens profonds, mais la peur du rejet peut justement entraver une vraie connexion.',
      traits: ['Un fort investissement dans les relations', 'Un grand besoin d’approbation', 'Une tendance à éviter les conflits', 'Une sensibilité à l’idée d’être laissé seul'],
      growth: 'Entraînez-vous d’abord à vous accepter vous-même. Ceux qui vous aiment restent à vos côtés même quand vous vous trompez. Vous n’avez pas besoin de l’approbation de tout le monde.',
      affirmation: 'Vous méritez d’être aimé non pour ce que vous accomplissez, mais pour ce que vous êtes.',
    },
    es: {
      title: '💔 Miedo al rechazo',
      subtitle: 'Tú, que temes no ser querido',
      coreDescription: 'Tu miedo central es el abandono y la pérdida de pertenencia. Deseas conexiones profundas, pero el miedo al rechazo a veces impide precisamente una conexión real.',
      traits: ['Te implicas mucho en las relaciones', 'Gran necesidad de aprobación', 'Tendencia a evitar conflictos', 'Sensibilidad a quedarte solo'],
      growth: 'Necesitas practicar primero aceptarte a ti mismo. Quien te quiere sigue a tu lado aunque te equivoques. No necesitas la aprobación de todo el mundo.',
      affirmation: 'Mereces amor no por lo que logras, sino por quien eres.',
    },
  },
  failure: {
    ko: {
      title: '📉 실패 공포형',
      subtitle: '충분히 좋아야 한다는 압박',
      coreDescription: '핵심 두려움은 불충분함과 무능함입니다. 높은 기준을 갖고 끊임없이 노력하지만, 실수나 실패에 극도로 민감합니다.',
      traits: ['완벽주의적 성향', '높은 성취 기준 보유', '비판에 민감', '실수를 오래 곱씹는 경향'],
      growth: '실수를 학습의 과정으로 재정의하세요. 완벽하게 준비될 때까지 기다리면 시작 자체를 못 할 수 있습니다. 실패는 종착지가 아닌 과정입니다.',
      affirmation: '당신의 가치는 성과가 아닌 존재 자체에 있습니다. 충분히 좋은 것으로도 충분합니다.',
    },
    en: {
      title: '📉 Fear of Failure',
      subtitle: 'The pressure to always be good enough',
      coreDescription: 'Your core fear is inadequacy and incompetence. You hold high standards and strive constantly, but are extremely sensitive to mistakes and failure.',
      traits: ['Perfectionist tendencies', 'Very high achievement standards', 'Sensitive to criticism', 'Tendency to ruminate on mistakes'],
      growth: 'Redefine mistakes as part of the learning process. Waiting until you\'re perfectly ready may mean never starting. Failure is a waypoint, not a destination.',
      affirmation: 'Your worth exists in who you are, not what you produce. Good enough truly is enough.',
    },
    ja: {
      title: '📉 失敗恐怖型',
      subtitle: '十分でなければというプレッシャー',
      coreDescription: 'コアの恐怖は不十分さと無能さです。高い基準を持ち絶え間なく努力しますが、ミスや失敗に対して極度に敏感です。',
      traits: ['完璧主義の傾向', '高い達成基準', '批判に敏感', 'ミスをいつまでも引きずる傾向'],
      growth: 'ミスを学習過程として再定義しましょう。完璧な準備ができるまで待っていると、始めること自体ができなくなります。失敗は終着点ではなく過程です。',
      affirmation: 'あなたの価値は成果ではなく存在そのものにあります。十分によいことで十分です。',
    },
    zh: {
      title: '📉 害怕失败型',
      subtitle: '“必须够好”的压力',
      coreDescription: '核心恐惧是不够好与无能。你标准很高、不断努力，却对失误和失败极度敏感。',
      traits: ['完美主义倾向', '成就标准很高', '对批评敏感', '会反复咀嚼失误'],
      growth: '把失误重新定义为学习的过程。如果等到完美准备好才开始，可能永远开始不了。失败不是终点，而是过程。',
      affirmation: '你的价值在于你本身，而不是成果。“够好”就已经足够。',
    },
    fr: {
      title: '📉 Peur de l’échec',
      subtitle: 'La pression d’être « assez bien »',
      coreDescription: 'Votre peur centrale est l’insuffisance et l’incompétence. Vous avez des exigences élevées et faites sans cesse des efforts, mais vous êtes extrêmement sensible aux erreurs et aux échecs.',
      traits: ['Tendance perfectionniste', 'Des standards de réussite élevés', 'Sensibilité à la critique', 'Tendance à ressasser ses erreurs'],
      growth: 'Redéfinissez l’erreur comme une étape d’apprentissage. À attendre d’être parfaitement prêt, on risque de ne jamais commencer. L’échec n’est pas une destination, c’est un passage.',
      affirmation: 'Votre valeur tient à ce que vous êtes, pas à vos résultats. « Assez bien », c’est assez.',
    },
    es: {
      title: '📉 Miedo al fracaso',
      subtitle: 'La presión de tener que ser «suficientemente bueno»',
      coreDescription: 'Tu miedo central es la insuficiencia y la incompetencia. Tienes estándares altos y te esfuerzas sin parar, pero eres extremadamente sensible a los errores y fracasos.',
      traits: ['Tendencia perfeccionista', 'Estándares de logro altos', 'Sensibilidad a la crítica', 'Tendencia a darle vueltas a los errores'],
      growth: 'Redefine el error como parte del aprendizaje. Si esperas a estar perfectamente preparado, puede que nunca empieces. El fracaso no es el destino, es el camino.',
      affirmation: 'Tu valor está en quién eres, no en tus resultados. «Suficientemente bueno» ya es suficiente.',
    },
  },
  loss: {
    ko: {
      title: '🌊 상실 공포형',
      subtitle: '잃지 않으려 꽉 쥐는 당신',
      coreDescription: '핵심 두려움은 통제력과 소중한 것들의 상실입니다. 안전하다고 느끼는 것들을 보존하려는 강한 욕구가 있습니다.',
      traits: ['통제 욕구가 강함', '변화에 저항함', '소중한 것에 집착하는 경향', '이별과 끝맺음이 유독 힘듦'],
      growth: '손에 쥔 것을 놓을 때 더 많은 것이 들어옵니다. 모든 것을 통제할 수 없다는 사실을 받아들이는 것이 자유로 가는 길입니다.',
      affirmation: '잃는 것이 두려운 만큼 당신이 그것을 얼마나 소중히 여기는지를 보여줍니다. 그 마음은 아름다운 강점입니다.',
    },
    en: {
      title: '🌊 Fear of Loss',
      subtitle: 'Holding on tight so nothing slips away',
      coreDescription: 'Your core fear is losing control and losing what matters most to you. You have a strong drive to preserve what feels safe and familiar.',
      traits: ['Strong need for control', 'Resistance to change', 'Tendency to cling to what\'s dear', 'Goodbyes and endings are especially hard'],
      growth: 'When you open your hands and let go, more can enter. Accepting that you cannot control everything is the path to freedom.',
      affirmation: 'How much you fear loss reflects how deeply you love. That depth is a beautiful strength.',
    },
    ja: {
      title: '🌊 喪失恐怖型',
      subtitle: '失わないようにしっかり握るあなた',
      coreDescription: 'コアの恐怖はコントロールの喪失と大切なものを失うことです。安全だと感じるものを守ろうとする強い欲求があります。',
      traits: ['コントロール欲求が強い', '変化に抵抗する', '大切なものに執着する傾向', '別れや終わりが特につらい'],
      growth: '手を開いて手放すとき、より多くのものが入ってきます。すべてをコントロールできないという事実を受け入れることが自由への道です。',
      affirmation: '失うことを恐れるほど、あなたがそれをどれほど大切にしているかを示しています。その深さは美しい強さです。',
    },
    zh: {
      title: '🌊 害怕失去型',
      subtitle: '紧紧抓住、不愿失去的你',
      coreDescription: '核心恐惧是失去掌控和珍贵的东西。你有强烈的欲望，想保住让你感到安全的一切。',
      traits: ['掌控欲强', '抗拒变化', '容易执着于珍贵之物', '离别与结束格外难熬'],
      growth: '放开手中的东西，才能迎来更多。接受无法掌控一切，是通往自由的路。',
      affirmation: '你有多害怕失去，就说明你有多珍惜。这份心意是美好的优势。',
    },
    fr: {
      title: '🌊 Peur de la perte',
      subtitle: 'Vous qui serrez fort pour ne rien perdre',
      coreDescription: 'Votre peur centrale est la perte de contrôle et de ce qui vous est cher. Vous avez un fort besoin de préserver ce qui vous donne un sentiment de sécurité.',
      traits: ['Un fort besoin de contrôle', 'Une résistance au changement', 'Une tendance à s’attacher à ce qui est précieux', 'Des séparations et des fins particulièrement difficiles'],
      growth: 'En desserrant la main, on laisse entrer davantage. Accepter qu’on ne peut pas tout contrôler est le chemin de la liberté.',
      affirmation: 'Votre peur de perdre montre à quel point vous tenez aux choses. Cette sensibilité est une belle force.',
    },
    es: {
      title: '🌊 Miedo a la pérdida',
      subtitle: 'Tú, que aprietas fuerte para no perder nada',
      coreDescription: 'Tu miedo central es perder el control y lo que te importa. Tienes una fuerte necesidad de conservar lo que te da seguridad.',
      traits: ['Fuerte necesidad de control', 'Resistencia al cambio', 'Tendencia a aferrarte a lo valioso', 'Las despedidas y los finales te cuestan especialmente'],
      growth: 'Cuando sueltas lo que tienes en la mano, entra más. Aceptar que no puedes controlarlo todo es el camino hacia la libertad.',
      affirmation: 'Cuanto más temes perder, más demuestras lo que valoras. Ese sentimiento es una hermosa fortaleza.',
    },
  },
  unknown: {
    ko: {
      title: '🌑 불확실성 공포형',
      subtitle: '예측 불가능함이 가장 두려운 당신',
      coreDescription: '핵심 두려움은 미지와 변화입니다. 확실성을 강렬하게 원하며, 정보를 수집하고 결정을 분석하는 데 많은 에너지를 씁니다.',
      traits: ['계획적이고 철저한 준비', '정보 과다 수집 경향', '결정 지연 (분석 마비)', '예측 가능한 환경 선호'],
      growth: '확실성 없이도 한 발 내딛는 연습이 필요합니다. 모든 것을 알아야 시작할 수 있는 건 아닙니다. 불확실함 속에도 삶은 계속됩니다.',
      affirmation: '모르는 것이 두려운 만큼 당신은 신중하고 사려깊습니다. 그 신중함을 믿고 한 발 나아가도 괜찮습니다.',
    },
    en: {
      title: '🌑 Fear of the Unknown',
      subtitle: 'Uncertainty is your greatest fear',
      coreDescription: 'Your core fear is the unfamiliar and change. You crave certainty intensely, investing great energy in gathering information and analyzing every decision.',
      traits: ['Thorough planner', 'Tendency to over-research', 'Decision delay (analysis paralysis)', 'Strong preference for predictable environments'],
      growth: 'Practice taking one step forward even without certainty. You don\'t need to know everything before you begin. Life continues even inside uncertainty.',
      affirmation: 'Your fear of the unknown reflects how thoughtful and careful you are. Trust that carefulness and take the next step.',
    },
    ja: {
      title: '🌑 不確実性恐怖型',
      subtitle: '予測不可能なことが最も怖いあなた',
      coreDescription: 'コアの恐怖は未知と変化です。確実性を強く求め、情報収集や決断の分析に多くのエネルギーを使います。',
      traits: ['計画的で徹底的な準備', '情報過多収集の傾向', '決断の先延ばし（分析麻痺）', '予測可能な環境を強く好む'],
      growth: '確実性がなくても一歩踏み出す練習が必要です。すべてを知ってから始める必要はありません。不確実な中でも人生は続きます。',
      affirmation: '未知を恐れるほどあなたは慎重で思慮深い。その慎重さを信じて一歩進んでも大丈夫です。',
    },
    zh: {
      title: '🌑 害怕不确定型',
      subtitle: '最怕无法预测的你',
      coreDescription: '核心恐惧是未知与变化。你强烈渴望确定性，花很多精力收集信息、分析决定。',
      traits: ['有计划、准备周全', '容易过度收集信息', '决定拖延（分析瘫痪）', '偏好可预测的环境'],
      growth: '需要练习在没有确定性时也迈出一步。不是非得全部弄清楚才能开始。在不确定中，生活依然继续。',
      affirmation: '你有多怕未知，就有多谨慎体贴。相信这份谨慎，往前迈一步也没关系。',
    },
    fr: {
      title: '🌑 Peur de l’incertitude',
      subtitle: 'Vous que l’imprévisible effraie le plus',
      coreDescription: 'Votre peur centrale est l’inconnu et le changement. Vous désirez intensément la certitude et consacrez beaucoup d’énergie à collecter des informations et à analyser vos décisions.',
      traits: ['Planification et préparation minutieuses', 'Tendance à accumuler trop d’informations', 'Décisions repoussées (paralysie par l’analyse)', 'Préférence pour les environnements prévisibles'],
      growth: 'Entraînez-vous à avancer d’un pas même sans certitude. Il n’est pas nécessaire de tout savoir pour commencer. La vie continue aussi dans l’incertitude.',
      affirmation: 'Votre peur de l’inconnu fait de vous quelqu’un de prudent et réfléchi. Vous pouvez faire confiance à cette prudence et avancer d’un pas.',
    },
    es: {
      title: '🌑 Miedo a la incertidumbre',
      subtitle: 'Tú, a quien lo imprevisible asusta más',
      coreDescription: 'Tu miedo central es lo desconocido y el cambio. Deseas intensamente la certeza y dedicas mucha energía a reunir información y analizar decisiones.',
      traits: ['Planificación y preparación minuciosas', 'Tendencia a acumular demasiada información', 'Decisiones aplazadas (parálisis por análisis)', 'Preferencia por entornos previsibles'],
      growth: 'Necesitas practicar dar un paso aunque no haya certeza. No hace falta saberlo todo para empezar. La vida sigue también en la incertidumbre.',
      affirmation: 'Cuanto más temes lo desconocido, más prudente y reflexivo eres. Puedes confiar en esa prudencia y dar un paso adelante.',
    },
  },
  judgment: {
    ko: {
      title: '👁️ 평가 공포형',
      subtitle: '남의 눈이 두려운 당신',
      coreDescription: '핵심 두려움은 비판·수치심·남의 판단입니다. 다른 사람들이 자신을 어떻게 볼지에 대한 의식이 강하며, 이로 인해 자기 표현이 억제될 수 있습니다.',
      traits: ['높은 사회적 인식', '자기검열 경향', '이미지 관리에 에너지 소비', '군중 앞에서 긴장'],
      growth: '당신을 가장 가혹하게 비판하는 사람은 당신 자신일 수 있습니다. 다른 사람들은 당신이 생각하는 것만큼 당신에게 집중하지 않습니다.',
      affirmation: '타인의 시선을 신경 쓰는 당신은 그만큼 섬세하고 공감 능력이 높은 사람입니다. 그 감수성이 당신의 강점입니다.',
    },
    en: {
      title: '👁️ Fear of Judgment',
      subtitle: 'Living under the weight of others\' eyes',
      coreDescription: 'Your core fear is criticism, shame, and the judgment of others. You have heightened awareness of how you appear to others, which can suppress authentic self-expression.',
      traits: ['High social awareness', 'Strong self-censorship tendency', 'Energy spent on managing image', 'Anxiety in crowds or spotlight'],
      growth: 'The harshest critic of you is probably you. Other people are not watching you as closely as you imagine.',
      affirmation: 'Your sensitivity to others\' perspectives makes you deeply empathetic. That sensitivity is a genuine gift.',
    },
    ja: {
      title: '👁️ 評価恐怖型',
      subtitle: '他人の目が怖いあなた',
      coreDescription: 'コアの恐怖は批判・羞恥心・他者の評価です。他人にどう見られるかへの意識が強く、それが真の自己表現を抑制することがあります。',
      traits: ['高い社会的意識', '強い自己検閲傾向', 'イメージ管理にエネルギーを使う', '人前での緊張'],
      growth: 'あなたを最も厳しく批判しているのは自分自身かもしれません。他の人はあなたが思うほどあなたに注目していません。',
      affirmation: '他者の視線を気にするあなたはそれだけ繊細で共感力が高い。その感受性があなたの強みです。',
    },
    zh: {
      title: '👁️ 害怕评价型',
      subtitle: '害怕别人眼光的你',
      coreDescription: '核心恐惧是批评、羞耻和他人的评判。你很在意别人怎么看你，可能因此压抑自我表达。',
      traits: ['社会意识很强', '倾向自我审查', '在形象管理上耗费精力', '在众人面前紧张'],
      growth: '对你最苛刻的批评者，可能就是你自己。别人并没有你以为的那么关注你。',
      affirmation: '在意别人眼光的你，同样是细腻、共情能力很强的人。这份敏感是你的优势。',
    },
    fr: {
      title: '👁️ Peur du jugement',
      subtitle: 'Vous qui craignez le regard des autres',
      coreDescription: 'Votre peur centrale est la critique, la honte et le jugement d’autrui. Vous êtes très conscient de la façon dont les autres vous voient, ce qui peut freiner votre expression.',
      traits: ['Grande conscience sociale', 'Tendance à l’autocensure', 'De l’énergie dépensée à soigner son image', 'Nervosité devant un public'],
      growth: 'Votre critique le plus sévère, c’est peut-être vous. Les autres ne vous observent pas autant que vous le pensez.',
      affirmation: 'Si vous êtes attentif au regard des autres, c’est aussi que vous êtes délicat et empathique. Cette sensibilité est votre force.',
    },
    es: {
      title: '👁️ Miedo al juicio',
      subtitle: 'Tú, que temes la mirada de los demás',
      coreDescription: 'Tu miedo central es la crítica, la vergüenza y el juicio ajeno. Eres muy consciente de cómo te ven los demás, y eso puede frenar tu forma de expresarte.',
      traits: ['Gran conciencia social', 'Tendencia a la autocensura', 'Energía gastada en cuidar la imagen', 'Nervios delante de la gente'],
      growth: 'Quizá tu crítico más duro seas tú. Los demás no se fijan en ti tanto como crees.',
      affirmation: 'Si te importa la mirada ajena, es porque eres sensible y empático. Esa sensibilidad es tu fortaleza.',
    },
  },
}

const TYPE_COLORS: Record<FearType, string> = {
  rejection: '#f43f5e',
  failure: '#f59e0b',
  loss: '#06b6d4',
  unknown: '#5B915F',
  judgment: '#607329',
}

interface Props { locale?: string }

export default function FearTypeTest({ locale: lp = 'ko' }: Props) {
  const locale = lang(lp ?? 'ko')
  const lb = LABELS[locale]
  const questions = QUESTIONS[locale]

  const [current, setCurrent] = useState(0)
  const [counts, setCounts] = useState<Record<FearType, number>>({
    rejection: 0, failure: 0, loss: 0, unknown: 0, judgment: 0,
  })
  const [result, setResult] = useState<FearType | null>(null)
  useRecordFinishedTest({ testId: "fear-type", title: "FearTypeTest", finished: Boolean(result) });

  function calcResult(c: Record<FearType, number>): FearType {
    const types: FearType[] = ['rejection', 'failure', 'loss', 'unknown', 'judgment']
    return types.reduce((best, t) => c[t] > c[best] ? t : best, 'failure' as FearType)
  }

  function pick(type: FearType) {
    const newCounts = { ...counts, [type]: counts[type] + 1 }
    setCounts(newCounts)
    if (current + 1 >= questions.length) setResult(calcResult(newCounts))
    setCurrent(current + 1)
  }

  function restart() {
    setCurrent(0)
    setCounts({ rejection: 0, failure: 0, loss: 0, unknown: 0, judgment: 0 })
    setResult(null)
  }

  function share() {
    if (!result) return
    const url = window.location.href
    const text = `${lb.shareMsg} — ${RESULTS[result][locale].title}`
    if (navigator.share) navigator.share({ title: lb.title, text, url })
    else navigator.clipboard.writeText(url)
  }

  const finished = current >= questions.length
  const progress = Math.round((current / questions.length) * 100)

  if (!finished) {
    const q = questions[current]
    return (
      <Questionnaire
        title={lb.title}
        subtitle={lb.subtitle}
        question={q.text}
        questionLabel={lb.questionOf(current + 1, questions.length)}
        progress={progress}
        options={q.options.map((opt) => ({ label: opt.text, value: opt.type }))}
        note={lb.note}
        onSelect={pick}
      />
    )
  }

  if (!result) return null
  const r = RESULTS[result][locale]
  const color = TYPE_COLORS[result]
  const total = Object.values(counts).reduce((s, v) => s + v, 0)
  const fearTypes: FearType[] = ['rejection', 'failure', 'loss', 'unknown', 'judgment']

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">{lb.yourType}</p>
        <div
          className="inline-block rounded-full px-5 py-2 text-xl font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {r.title}
        </div>
        <p className="font-bold text-muted-foreground">{r.subtitle}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{r.coreDescription}</p>
      </div>

      <div className="rounded-2xl border bg-card p-4 space-y-3">
        <h3 className="font-bold text-sm">{lb.distribution}</h3>
        {fearTypes.map(t => {
          const pct = total > 0 ? Math.round((counts[t] / total) * 100) : 0
          return (
            <div key={t} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold" style={{ color: TYPE_COLORS[t] }}>
                  {RESULTS[t][locale].title}
                </span>
                <span className="text-muted-foreground">{pct}%</span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-2 rounded-full bg-muted overflow-hidden"
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: TYPE_COLORS[t] }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-2xl border bg-card p-4 space-y-2">
        <h3 className="font-bold text-sm">{lb.traits}</h3>
        <ul className="space-y-1">
          {r.traits.map(t => (
            <li key={t} className="text-sm text-muted-foreground flex gap-2">
              <span style={{ color }}>•</span>{t}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border bg-card p-4 space-y-2">
        <h3 className="font-bold text-sm text-green-600">{lb.growth}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{r.growth}</p>
      </div>

      <div className="rounded-2xl border p-4 space-y-2" style={{ borderColor: color + '40', backgroundColor: color + '0d' }}>
        <h3 className="font-bold text-sm" style={{ color }}>{lb.affirmation}</h3>
        <p className="text-sm leading-relaxed" style={{ color }}>{r.affirmation}</p>
      </div>

      <p className="text-center text-xs text-muted-foreground">{lb.note}</p>

      <div className="flex gap-3">
        <button
          onClick={restart}
          className="flex-1 rounded-xl border bg-card px-4 py-2 text-sm font-bold hover:bg-accent transition-colors"
          aria-label={lb.restart}
        >
          {lb.restart}
        </button>
        <button
          onClick={share}
          className="flex-1 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-bold hover:opacity-90 transition-opacity"
          aria-label={lb.share}
        >
          {lb.share}
        </button>
      </div>
      <ShareResultButton locale={locale} heading={lb.title} resultTitle={r.title} />
    </div>
  )
}
