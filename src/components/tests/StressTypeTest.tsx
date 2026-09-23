import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import ShareResultButton from '../shared/ShareResultButton'
import { Questionnaire } from '@/components/ui/questionnaire'

type StressType = 'fighter' | 'freezer' | 'fleeer' | 'fixer'
type SupportedLang = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'

function lang(locale: string): SupportedLang {
  return (['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const).includes(locale as SupportedLang)
    ? (locale as SupportedLang)
    : 'en'
}

interface Option {
  label: string
  type: StressType
}

interface Question {
  id: string
  text: string
  options: Option[]
}

interface ResultData {
  icon: string
  title: string
  subtitle: string
  description: string
  strengths: string[]
  caution: string
  tip: string
}

const LABELS: Record<SupportedLang, {
  title: string
  subtitle: string
  questionOf: (c: number, t: number) => string
  restart: string
  share: string
  shareMsg: string
  yourType: string
  strengths: string
  caution: string
  tip: string
  note: string
}> = {
  ko: {
    title: '스트레스 유형 테스트',
    subtitle: '나는 어떻게 스트레스를 받나?',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '나의 스트레스 반응 유형은',
    yourType: '나의 스트레스 유형',
    strengths: '강점',
    caution: '주의',
    tip: '팁',
    note: '이 결과는 참고용이며 전문적 심리 진단을 대체하지 않습니다.',
  },
  en: {
    title: 'Stress Response Type Test',
    subtitle: 'How do you handle stress?',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My stress response type is',
    yourType: 'Your Stress Type',
    strengths: 'Strengths',
    caution: 'Watch Out',
    tip: 'Tip',
    note: 'This result is for reference only and does not replace professional psychological diagnosis.',
  },
  ja: {
    title: 'ストレスタイプテスト',
    subtitle: 'あなたのストレス反応パターンは？',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '私のストレス反応タイプは',
    yourType: 'あなたのストレスタイプ',
    strengths: '強み',
    caution: '注意',
    tip: 'ヒント',
    note: 'この結果は参考用であり、専門的な心理診断の代替ではありません。',
  },
  zh: {
    title: '压力反应类型测验',
    subtitle: '我是怎么受压力的？',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: '重新测验',
    share: '分享结果',
    shareMsg: '我的压力反应类型是',
    yourType: '我的压力类型',
    strengths: '长处',
    caution: '留意',
    tip: '建议',
    note: '本结果仅供参考，不能替代专业的心理评估。',
  },
  fr: {
    title: 'Test du type de réaction au stress',
    subtitle: 'Comment est-ce que je vis le stress ?',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: 'Recommencer',
    share: 'Partager le résultat',
    shareMsg: 'Mon type de réaction au stress',
    yourType: 'Votre type de stress',
    strengths: 'Forces',
    caution: 'À surveiller',
    tip: 'Conseil',
    note: 'Ce résultat est indicatif et ne remplace pas une évaluation psychologique professionnelle.',
  },
  es: {
    title: 'Test del tipo de reacción al estrés',
    subtitle: '¿Cómo me afecta el estrés?',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: 'Repetir',
    share: 'Compartir resultado',
    shareMsg: 'Mi tipo de reacción al estrés',
    yourType: 'Tu tipo de estrés',
    strengths: 'Fortalezas',
    caution: 'Atención',
    tip: 'Consejo',
    note: 'Este resultado es orientativo y no sustituye una evaluación psicológica profesional.',
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    {
      id: 'q1',
      text: '중요한 마감일이 갑자기 당겨졌을 때 나는...',
      options: [
        { label: '즉시 행동을 취하고 다른 사람들에게 도움을 요청한다', type: 'fighter' },
        { label: '어디서부터 시작해야 할지 몰라 멍하니 있는다', type: 'freezer' },
        { label: '잠깐 기분 전환을 하고 나중에 처리한다', type: 'fleeer' },
        { label: '우선순위를 재정렬하고 계획을 즉시 수정한다', type: 'fixer' },
      ],
    },
    {
      id: 'q2',
      text: '직장이나 학교에서 비판을 받으면...',
      options: [
        { label: '즉시 반박하거나 자신을 변호한다', type: 'fighter' },
        { label: '아무 말도 못하고 내면에서 무너진다', type: 'freezer' },
        { label: '대화를 빨리 끝내고 그 자리를 피한다', type: 'fleeer' },
        { label: '비판의 타당성을 분석하고 개선점을 찾는다', type: 'fixer' },
      ],
    },
    {
      id: 'q3',
      text: '예상치 못한 큰 문제가 생겼을 때...',
      options: [
        { label: '곧바로 문제와 맞서며 해결을 주도한다', type: 'fighter' },
        { label: '공황 상태에 빠지고 결정하기 어렵다', type: 'freezer' },
        { label: '잠시 현실에서 벗어나고 싶어진다', type: 'fleeer' },
        { label: '문제를 분석하고 단계적 해결책을 만든다', type: 'fixer' },
      ],
    },
    {
      id: 'q4',
      text: '인간관계에서 갈등이 생기면...',
      options: [
        { label: '바로 대면해서 해결하려 한다', type: 'fighter' },
        { label: '어떻게 해야 할지 몰라 그냥 관계를 피한다', type: 'freezer' },
        { label: '상황이 자연스럽게 해결될 때까지 기다린다', type: 'fleeer' },
        { label: '두 사람의 입장을 분석하고 논리적으로 중재한다', type: 'fixer' },
      ],
    },
    {
      id: 'q5',
      text: '잠들기 전 스트레스를 받으면...',
      options: [
        { label: '누군가와 이야기하거나 행동으로 해소한다', type: 'fighter' },
        { label: '생각이 꼬리를 물고 잠들기 어렵다', type: 'freezer' },
        { label: '유튜브나 SNS를 보다 잠든다', type: 'fleeer' },
        { label: '내일 할 일 목록을 적고 마음을 정리한다', type: 'fixer' },
      ],
    },
    {
      id: 'q6',
      text: '실수를 했을 때 나의 반응은...',
      options: [
        { label: '즉시 수습하고 책임을 진다', type: 'fighter' },
        { label: '자책감에 사로잡혀 오래 괴로워한다', type: 'freezer' },
        { label: '생각하기 싫어서 다른 것에 집중한다', type: 'fleeer' },
        { label: '왜 실수가 생겼는지 원인을 파악한다', type: 'fixer' },
      ],
    },
    {
      id: 'q7',
      text: '스트레스를 받을 때 몸의 반응은...',
      options: [
        { label: '심박수가 오르고 에너지가 솟구친다', type: 'fighter' },
        { label: '몸이 굳고 아무것도 하기 싫어진다', type: 'freezer' },
        { label: '어딘가로 떠나고 싶다는 생각이 든다', type: 'fleeer' },
        { label: '빠르게 생각이 돌아가고 계획을 세우기 시작한다', type: 'fixer' },
      ],
    },
    {
      id: 'q8',
      text: '과중한 업무를 받았을 때...',
      options: [
        { label: '불만을 표시하고 업무량 조정을 요청한다', type: 'fighter' },
        { label: '어디서 시작해야 할지 몰라 일을 미룬다', type: 'freezer' },
        { label: '일을 쪼개서 조금씩 피해 가며 처리한다', type: 'fleeer' },
        { label: '즉시 우선순위를 정하고 일정을 짠다', type: 'fixer' },
      ],
    },
    {
      id: 'q9',
      text: '스트레스 해소 방법으로 가장 끌리는 것은?',
      options: [
        { label: '운동, 스포츠 등 신체 활동', type: 'fighter' },
        { label: '침대에서 쉬거나 아무것도 하지 않기', type: 'freezer' },
        { label: '게임, 드라마, 음식 등 현실 도피', type: 'fleeer' },
        { label: '독서, 계획 세우기, 문제 분석', type: 'fixer' },
      ],
    },
    {
      id: 'q10',
      text: '스트레스가 쌓이면 주변 사람에게...',
      options: [
        { label: '짜증이나 분노로 표출된다', type: 'fighter' },
        { label: '말이 없어지고 혼자 있고 싶어진다', type: 'freezer' },
        { label: '없는 척 밝게 행동한다', type: 'fleeer' },
        { label: '조언을 구하거나 상황을 설명한다', type: 'fixer' },
      ],
    },
    {
      id: 'q11',
      text: '어렵고 하기 싫은 일을 앞두고...',
      options: [
        { label: '빨리 끝내버리려고 돌진한다', type: 'fighter' },
        { label: '자꾸 미루다가 마지막에 밀린다', type: 'freezer' },
        { label: '먼저 쉬운 일들을 처리하며 피한다', type: 'fleeer' },
        { label: '하기 싫어도 먼저 계획부터 세운다', type: 'fixer' },
      ],
    },
    {
      id: 'q12',
      text: '위기 상황에서 당신의 역할은?',
      options: [
        { label: '팀을 이끌고 결단을 내린다', type: 'fighter' },
        { label: '다른 사람이 결정해주길 기다린다', type: 'freezer' },
        { label: '그 상황을 가능하면 빨리 빠져나온다', type: 'fleeer' },
        { label: '정보를 모으고 최선의 해결책을 분석한다', type: 'fixer' },
      ],
    },
  ],
  en: [
    {
      id: 'q1',
      text: 'An important deadline is suddenly moved up. You...',
      options: [
        { label: 'Take action immediately and ask others for help', type: 'fighter' },
        { label: "Freeze — you don't know where to start", type: 'freezer' },
        { label: 'Take a quick break to clear your head and deal with it later', type: 'fleeer' },
        { label: 'Reprioritize and revise your plan immediately', type: 'fixer' },
      ],
    },
    {
      id: 'q2',
      text: 'You receive criticism at work or school. You...',
      options: [
        { label: 'Immediately push back or defend yourself', type: 'fighter' },
        { label: "Say nothing but fall apart on the inside", type: 'freezer' },
        { label: 'End the conversation quickly and leave the situation', type: 'fleeer' },
        { label: 'Analyze whether the criticism is valid and find room to improve', type: 'fixer' },
      ],
    },
    {
      id: 'q3',
      text: 'An unexpected major problem arises. You...',
      options: [
        { label: 'Confront the problem head-on and take charge', type: 'fighter' },
        { label: 'Panic and struggle to make decisions', type: 'freezer' },
        { label: 'Want to escape reality for a while', type: 'fleeer' },
        { label: 'Analyze the problem and build a step-by-step solution', type: 'fixer' },
      ],
    },
    {
      id: 'q4',
      text: 'A conflict arises in a relationship. You...',
      options: [
        { label: 'Face it directly and try to resolve it immediately', type: 'fighter' },
        { label: "Don't know what to do so you just avoid the person", type: 'freezer' },
        { label: 'Wait for things to resolve themselves naturally', type: 'fleeer' },
        { label: 'Analyze both perspectives and mediate logically', type: 'fixer' },
      ],
    },
    {
      id: 'q5',
      text: "You're stressed before bed. You...",
      options: [
        { label: 'Talk to someone or release it through physical activity', type: 'fighter' },
        { label: 'Your thoughts spiral and you struggle to sleep', type: 'freezer' },
        { label: 'Watch YouTube or scroll social media until you fall asleep', type: 'fleeer' },
        { label: "Write tomorrow's to-do list and settle your mind", type: 'fixer' },
      ],
    },
    {
      id: 'q6',
      text: 'You make a mistake. Your reaction is...',
      options: [
        { label: 'Fix it immediately and take responsibility', type: 'fighter' },
        { label: 'Get stuck in self-blame and suffer for a long time', type: 'freezer' },
        { label: "Focus on something else because you don't want to think about it", type: 'fleeer' },
        { label: 'Figure out why the mistake happened', type: 'fixer' },
      ],
    },
    {
      id: 'q7',
      text: "Your body's reaction to stress is...",
      options: [
        { label: 'Heart rate rises and energy surges', type: 'fighter' },
        { label: 'Body tenses and you want to do nothing', type: 'freezer' },
        { label: 'You feel a strong urge to go somewhere and escape', type: 'fleeer' },
        { label: 'Your mind races and you start making plans', type: 'fixer' },
      ],
    },
    {
      id: 'q8',
      text: 'You receive an overwhelming workload. You...',
      options: [
        { label: 'Express dissatisfaction and request a workload adjustment', type: 'fighter' },
        { label: "Procrastinate because you don't know where to start", type: 'freezer' },
        { label: 'Break the work into pieces and avoid it bit by bit', type: 'fleeer' },
        { label: 'Immediately prioritize and plan your schedule', type: 'fixer' },
      ],
    },
    {
      id: 'q9',
      text: 'The stress relief method you are most drawn to is...',
      options: [
        { label: 'Physical activity — exercise, sports', type: 'fighter' },
        { label: 'Resting in bed or doing absolutely nothing', type: 'freezer' },
        { label: 'Escaping reality — games, TV shows, food', type: 'fleeer' },
        { label: 'Reading, planning, or analyzing a problem', type: 'fixer' },
      ],
    },
    {
      id: 'q10',
      text: 'When stress builds up, you tend to...',
      options: [
        { label: 'Release it as irritation or anger toward others', type: 'fighter' },
        { label: 'Go quiet and want to be alone', type: 'freezer' },
        { label: 'Pretend everything is fine and act upbeat', type: 'fleeer' },
        { label: 'Ask for advice or explain the situation', type: 'fixer' },
      ],
    },
    {
      id: 'q11',
      text: 'Facing a task you find difficult and unpleasant, you...',
      options: [
        { label: 'Charge in to get it over with as fast as possible', type: 'fighter' },
        { label: 'Keep putting it off until the last minute', type: 'freezer' },
        { label: 'Handle the easier tasks first and avoid the hard one', type: 'fleeer' },
        { label: 'Make a plan first even though you hate it', type: 'fixer' },
      ],
    },
    {
      id: 'q12',
      text: 'In a crisis situation, your role is...',
      options: [
        { label: 'Lead the team and make decisions', type: 'fighter' },
        { label: 'Wait for someone else to decide', type: 'freezer' },
        { label: 'Get out of the situation as fast as possible', type: 'fleeer' },
        { label: 'Gather information and analyze the best solution', type: 'fixer' },
      ],
    },
  ],
  ja: [
    {
      id: 'q1',
      text: '重要な締め切りが急に前倒しになったとき、あなたは...',
      options: [
        { label: '即座に行動し、周りに助けを求める', type: 'fighter' },
        { label: 'どこから始めればいいかわからず、呆然としている', type: 'freezer' },
        { label: '気分転換してから後で処理する', type: 'fleeer' },
        { label: '優先順位を組み直して計画を即座に修正する', type: 'fixer' },
      ],
    },
    {
      id: 'q2',
      text: '職場や学校で批判を受けたら...',
      options: [
        { label: 'すぐに反論したり自分を弁護する', type: 'fighter' },
        { label: '何も言えず内側で崩れてしまう', type: 'freezer' },
        { label: '会話を早く終わらせてその場を離れる', type: 'fleeer' },
        { label: '批判の妥当性を分析して改善点を見つける', type: 'fixer' },
      ],
    },
    {
      id: 'q3',
      text: '予期せぬ大きな問題が発生したとき...',
      options: [
        { label: 'すぐに問題に立ち向かって解決をリードする', type: 'fighter' },
        { label: 'パニック状態になり決断が難しい', type: 'freezer' },
        { label: 'しばらく現実から逃げ出したくなる', type: 'fleeer' },
        { label: '問題を分析して段階的な解決策を作る', type: 'fixer' },
      ],
    },
    {
      id: 'q4',
      text: '人間関係で摩擦が生じたら...',
      options: [
        { label: 'すぐに対面して解決しようとする', type: 'fighter' },
        { label: 'どうすればいいかわからず、その人を避けてしまう', type: 'freezer' },
        { label: '状況が自然に解決するまで待つ', type: 'fleeer' },
        { label: '双方の立場を分析して論理的に仲裁する', type: 'fixer' },
      ],
    },
    {
      id: 'q5',
      text: '寝る前にストレスを感じたら...',
      options: [
        { label: '誰かと話すか行動で発散する', type: 'fighter' },
        { label: '考えが止まらず眠れない', type: 'freezer' },
        { label: 'YouTubeやSNSを見ながら寝落ちする', type: 'fleeer' },
        { label: '明日のToDoリストを書いて気持ちを整理する', type: 'fixer' },
      ],
    },
    {
      id: 'q6',
      text: 'ミスをしたときの反応は...',
      options: [
        { label: 'すぐに収拾して責任を取る', type: 'fighter' },
        { label: '自責感にとらわれて長く苦しむ', type: 'freezer' },
        { label: '考えたくないので他のことに集中する', type: 'fleeer' },
        { label: 'なぜミスが起きたか原因を探る', type: 'fixer' },
      ],
    },
    {
      id: 'q7',
      text: 'ストレスを受けたときの体の反応は...',
      options: [
        { label: '心拍数が上がりエネルギーが湧いてくる', type: 'fighter' },
        { label: '体が固まり何もしたくなくなる', type: 'freezer' },
        { label: 'どこかへ逃げ出したいと思う', type: 'fleeer' },
        { label: '思考が素早く回り始め、計画を立て始める', type: 'fixer' },
      ],
    },
    {
      id: 'q8',
      text: '過重な業務を受けたとき...',
      options: [
        { label: '不満を示して業務量の調整を求める', type: 'fighter' },
        { label: 'どこから始めればいいかわからず先延ばしにする', type: 'freezer' },
        { label: '仕事を細切れにして少しずつ避けながら処理する', type: 'fleeer' },
        { label: '即座に優先順位を決めてスケジュールを立てる', type: 'fixer' },
      ],
    },
    {
      id: 'q9',
      text: 'ストレス解消法として最も惹かれるものは？',
      options: [
        { label: '運動・スポーツなどの身体活動', type: 'fighter' },
        { label: 'ベッドで休む、または何もしない', type: 'freezer' },
        { label: 'ゲーム・ドラマ・食べ物などで現実逃避', type: 'fleeer' },
        { label: '読書、計画立て、問題分析', type: 'fixer' },
      ],
    },
    {
      id: 'q10',
      text: 'ストレスが溜まると、周りの人に...',
      options: [
        { label: 'イライラや怒りとして出てしまう', type: 'fighter' },
        { label: '無口になり一人でいたくなる', type: 'freezer' },
        { label: '何もないふりをして明るく振る舞う', type: 'fleeer' },
        { label: 'アドバイスを求めたり状況を説明する', type: 'fixer' },
      ],
    },
    {
      id: 'q11',
      text: '難しくてやりたくない仕事を前にして...',
      options: [
        { label: '早く終わらせようと突進する', type: 'fighter' },
        { label: '何度も先延ばしにして最後に追い込まれる', type: 'freezer' },
        { label: '先に簡単な仕事を片付けて避ける', type: 'fleeer' },
        { label: '嫌でも先に計画から立てる', type: 'fixer' },
      ],
    },
    {
      id: 'q12',
      text: '危機的状況におけるあなたの役割は？',
      options: [
        { label: 'チームをリードして決断を下す', type: 'fighter' },
        { label: '誰かが決めてくれるのを待つ', type: 'freezer' },
        { label: 'できるだけ早くその状況から抜け出す', type: 'fleeer' },
        { label: '情報を集め最善の解決策を分析する', type: 'fixer' },
      ],
    },
  ],
  zh: [
    {
      id: 'q1',
      text: '重要的截止日期突然提前时，我会…',
      options: [
        { label: '马上行动，并找人帮忙', type: 'fighter' },
        { label: '不知道该从哪开始，愣在那儿', type: 'freezer' },
        { label: '先散个心，之后再处理', type: 'fleeer' },
        { label: '重排优先级，立刻改计划', type: 'fixer' },
      ],
    },
    {
      id: 'q2',
      text: '在公司或学校被批评时，我会…',
      options: [
        { label: '当场反驳，或替自己辩解', type: 'fighter' },
        { label: '说不出话，心里塌下去', type: 'freezer' },
        { label: '尽快把话题结束，离开那个场合', type: 'fleeer' },
        { label: '分析批评有没有道理，找可以改的地方', type: 'fixer' },
      ],
    },
    {
      id: 'q3',
      text: '突然出了大问题时，我会…',
      options: [
        { label: '立刻迎上去，带头解决', type: 'fighter' },
        { label: '慌了，很难做决定', type: 'freezer' },
        { label: '很想暂时离开现实一下', type: 'fleeer' },
        { label: '分析问题，做出一步步的解法', type: 'fixer' },
      ],
    },
    {
      id: 'q4',
      text: '人际关系起冲突时，我会…',
      options: [
        { label: '直接面对，想把它解决', type: 'fighter' },
        { label: '不知道怎么办，干脆躲开这段关系', type: 'freezer' },
        { label: '等事情自然过去', type: 'fleeer' },
        { label: '分析双方的立场，讲道理地居中', type: 'fixer' },
      ],
    },
    {
      id: 'q5',
      text: '睡前有压力时，我会…',
      options: [
        { label: '找人说说，或用行动把它散掉', type: 'fighter' },
        { label: '想法一个接一个，睡不着', type: 'freezer' },
        { label: '刷影片或社群，刷到睡着', type: 'fleeer' },
        { label: '写下明天要做的事，把心整理一下', type: 'fixer' },
      ],
    },
    {
      id: 'q6',
      text: '犯了错时，我的反应是…',
      options: [
        { label: '马上补救，承担责任', type: 'fighter' },
        { label: '陷在自责里，难受很久', type: 'freezer' },
        { label: '不想再想，把注意力转到别的事', type: 'fleeer' },
        { label: '弄清楚错是怎么发生的', type: 'fixer' },
      ],
    },
    {
      id: 'q7',
      text: '有压力时，我身体的反应是…',
      options: [
        { label: '心跳变快，力气一下子冒上来', type: 'fighter' },
        { label: '身体僵住，什么都不想做', type: 'freezer' },
        { label: '很想去哪儿走一走', type: 'fleeer' },
        { label: '脑子转得飞快，开始做计划', type: 'fixer' },
      ],
    },
    {
      id: 'q8',
      text: '被丢了过重的工作时，我会…',
      options: [
        { label: '把不满说出来，要求调整工作量', type: 'fighter' },
        { label: '不知道从哪开始，把事情往后拖', type: 'freezer' },
        { label: '把事情切开，能躲一点是一点', type: 'fleeer' },
        { label: '马上定优先级，排出时程', type: 'fixer' },
      ],
    },
    {
      id: 'q9',
      text: '消解压力的方式里，你最想选…',
      options: [
        { label: '运动、球类等身体活动', type: 'fighter' },
        { label: '在床上休息，什么都不做', type: 'freezer' },
        { label: '游戏、剧、吃的，先离现实远一点', type: 'fleeer' },
        { label: '看书、做计划、分析问题', type: 'fixer' },
      ],
    },
    {
      id: 'q10',
      text: '压力一堆起来，对身边的人我会…',
      options: [
        { label: '用烦躁或发火表现出来', type: 'fighter' },
        { label: '话变少，只想一个人待着', type: 'freezer' },
        { label: '装作没事，表现得很开朗', type: 'fleeer' },
        { label: '找人讨主意，或把情况说清楚', type: 'fixer' },
      ],
    },
    {
      id: 'q11',
      text: '面对又难又不想做的事时，我会…',
      options: [
        { label: '冲上去，想快点做完', type: 'fighter' },
        { label: '一拖再拖，最后被赶着做', type: 'freezer' },
        { label: '先做容易的事，绕开它', type: 'fleeer' },
        { label: '就算不想做，也先把计划排出来', type: 'fixer' },
      ],
    },
    {
      id: 'q12',
      text: '在危机里，你的角色是？',
      options: [
        { label: '带着队伍，做出决断', type: 'fighter' },
        { label: '等别人来拿主意', type: 'freezer' },
        { label: '尽快从那个情况里抽身', type: 'fleeer' },
        { label: '收集资讯，分析出最好的解法', type: 'fixer' },
      ],
    },
  ],
  fr: [
    {
      id: 'q1',
      text: 'Quand une échéance importante est soudain avancée, je…',
      options: [
        { label: 'passe à l’action tout de suite et je demande de l’aide', type: 'fighter' },
        { label: 'reste figé, sans savoir par où commencer', type: 'freezer' },
        { label: 'me change les idées et je m’en occupe plus tard', type: 'fleeer' },
        { label: 'réorganise les priorités et je révise le plan aussitôt', type: 'fixer' },
      ],
    },
    {
      id: 'q2',
      text: 'Quand on me critique au travail ou à l’école, je…',
      options: [
        { label: 'réplique aussitôt ou je me défends', type: 'fighter' },
        { label: 'n’arrive pas à répondre et je m’effondre intérieurement', type: 'freezer' },
        { label: 'abrège la conversation et je quitte les lieux', type: 'fleeer' },
        { label: 'examine si la critique est fondée et ce que je peux améliorer', type: 'fixer' },
      ],
    },
    {
      id: 'q3',
      text: 'Quand un gros problème surgit sans prévenir, je…',
      options: [
        { label: 'l’affronte tout de suite et je prends la résolution en main', type: 'fighter' },
        { label: 'panique et j’ai du mal à décider', type: 'freezer' },
        { label: 'ai envie de m’éloigner un moment de la réalité', type: 'fleeer' },
        { label: 'analyse la situation et je construis une solution par étapes', type: 'fixer' },
      ],
    },
    {
      id: 'q4',
      text: 'Quand un conflit éclate dans mes relations, je…',
      options: [
        { label: 'l’affronte directement pour le régler', type: 'fighter' },
        { label: 'ne sais pas quoi faire et j’évite la relation', type: 'freezer' },
        { label: 'attends que la situation se règle d’elle-même', type: 'fleeer' },
        { label: 'analyse les deux positions et je joue la médiation', type: 'fixer' },
      ],
    },
    {
      id: 'q5',
      text: 'Quand le stress monte au moment de dormir, je…',
      options: [
        { label: 'en parle à quelqu’un ou je l’évacue par l’action', type: 'fighter' },
        { label: 'enchaîne les pensées et je n’arrive pas à dormir', type: 'freezer' },
        { label: 'regarde des vidéos ou les réseaux jusqu’à m’endormir', type: 'fleeer' },
        { label: 'écris la liste du lendemain pour me poser', type: 'fixer' },
      ],
    },
    {
      id: 'q6',
      text: 'Quand je fais une erreur, ma réaction est de…',
      options: [
        { label: 'réparer tout de suite et d’assumer', type: 'fighter' },
        { label: 'me reprocher longtemps ce qui s’est passé', type: 'freezer' },
        { label: 'penser à autre chose pour ne pas y revenir', type: 'fleeer' },
        { label: 'comprendre pourquoi l’erreur est arrivée', type: 'fixer' },
      ],
    },
    {
      id: 'q7',
      text: 'Sous stress, mon corps réagit ainsi :',
      options: [
        { label: 'le cœur s’accélère et l’énergie monte d’un coup', type: 'fighter' },
        { label: 'le corps se fige et je n’ai envie de rien', type: 'freezer' },
        { label: 'j’ai envie de partir quelque part', type: 'fleeer' },
        { label: 'les idées défilent vite et je commence à planifier', type: 'fixer' },
      ],
    },
    {
      id: 'q8',
      text: 'Quand la charge de travail devient trop lourde, je…',
      options: [
        { label: 'dis mon désaccord et je demande un ajustement', type: 'fighter' },
        { label: 'ne sais pas par où commencer et je repousse', type: 'freezer' },
        { label: 'découpe le travail et j’évite ce que je peux', type: 'fleeer' },
        { label: 'fixe aussitôt les priorités et j’établis un planning', type: 'fixer' },
      ],
    },
    {
      id: 'q9',
      text: 'Pour évacuer le stress, ce qui m’attire le plus :',
      options: [
        { label: 'le sport, l’activité physique', type: 'fighter' },
        { label: 'me reposer au lit, ne rien faire', type: 'freezer' },
        { label: 'jeux, séries, nourriture : m’échapper un moment', type: 'fleeer' },
        { label: 'lire, planifier, analyser le problème', type: 'fixer' },
      ],
    },
    {
      id: 'q10',
      text: 'Quand le stress s’accumule, avec mon entourage je…',
      options: [
        { label: 'le montre par de l’irritation ou de la colère', type: 'fighter' },
        { label: 'parle moins et je veux rester seul', type: 'freezer' },
        { label: 'fais comme si de rien n’était et j’affiche de la bonne humeur', type: 'fleeer' },
        { label: 'demande conseil ou j’explique la situation', type: 'fixer' },
      ],
    },
    {
      id: 'q11',
      text: 'Face à une tâche difficile et ingrate, je…',
      options: [
        { label: 'fonce pour en finir vite', type: 'fighter' },
        { label: 'repousse jusqu’à me retrouver pris de court', type: 'freezer' },
        { label: 'commence par les tâches faciles pour l’éviter', type: 'fleeer' },
        { label: 'établis d’abord un plan, même sans envie', type: 'fixer' },
      ],
    },
    {
      id: 'q12',
      text: 'En situation de crise, votre rôle est de…',
      options: [
        { label: 'mener l’équipe et trancher', type: 'fighter' },
        { label: 'attendre que quelqu’un décide', type: 'freezer' },
        { label: 'sortir de la situation au plus vite', type: 'fleeer' },
        { label: 'rassembler les informations et chercher la meilleure solution', type: 'fixer' },
      ],
    },
  ],
  es: [
    {
      id: 'q1',
      text: 'Cuando una fecha importante se adelanta de golpe, yo…',
      options: [
        { label: 'me pongo en marcha ya y pido ayuda', type: 'fighter' },
        { label: 'me quedo en blanco, sin saber por dónde empezar', type: 'freezer' },
        { label: 'me despejo un rato y lo atiendo después', type: 'fleeer' },
        { label: 'reordeno prioridades y cambio el plan al momento', type: 'fixer' },
      ],
    },
    {
      id: 'q2',
      text: 'Cuando me critican en el trabajo o en clase, yo…',
      options: [
        { label: 'respondo al momento o me defiendo', type: 'fighter' },
        { label: 'no consigo decir nada y por dentro me hundo', type: 'freezer' },
        { label: 'corto la conversación y me voy de ahí', type: 'fleeer' },
        { label: 'miro si la crítica tiene razón y qué puedo mejorar', type: 'fixer' },
      ],
    },
    {
      id: 'q3',
      text: 'Cuando surge un problema grande de repente, yo…',
      options: [
        { label: 'lo afronto ya y lidero la solución', type: 'fighter' },
        { label: 'me entra el pánico y me cuesta decidir', type: 'freezer' },
        { label: 'tengo ganas de alejarme un rato de la realidad', type: 'fleeer' },
        { label: 'analizo la situación y armo una solución por pasos', type: 'fixer' },
      ],
    },
    {
      id: 'q4',
      text: 'Cuando hay un conflicto en mis relaciones, yo…',
      options: [
        { label: 'lo afronto de frente para resolverlo', type: 'fighter' },
        { label: 'no sé qué hacer y acabo evitando la relación', type: 'freezer' },
        { label: 'espero a que se resuelva solo', type: 'fleeer' },
        { label: 'analizo las dos posturas y medio con razones', type: 'fixer' },
      ],
    },
    {
      id: 'q5',
      text: 'Si me llega el estrés antes de dormir, yo…',
      options: [
        { label: 'lo hablo con alguien o lo descargo con acción', type: 'fighter' },
        { label: 'encadeno pensamientos y no consigo dormir', type: 'freezer' },
        { label: 'miro vídeos o redes hasta que me duermo', type: 'fleeer' },
        { label: 'escribo la lista de mañana y me ordeno la cabeza', type: 'fixer' },
      ],
    },
    {
      id: 'q6',
      text: 'Cuando cometo un error, mi reacción es…',
      options: [
        { label: 'arreglarlo ya y asumirlo', type: 'fighter' },
        { label: 'quedarme mucho tiempo reprochándomelo', type: 'freezer' },
        { label: 'pensar en otra cosa para no darle vueltas', type: 'fleeer' },
        { label: 'entender por qué ocurrió', type: 'fixer' },
      ],
    },
    {
      id: 'q7',
      text: 'Con estrés, mi cuerpo reacciona así:',
      options: [
        { label: 'se me acelera el pulso y sube la energía', type: 'fighter' },
        { label: 'el cuerpo se agarrota y no me apetece nada', type: 'freezer' },
        { label: 'me entran ganas de irme a algún sitio', type: 'fleeer' },
        { label: 'las ideas van rápido y empiezo a planificar', type: 'fixer' },
      ],
    },
    {
      id: 'q8',
      text: 'Cuando la carga de trabajo se vuelve excesiva, yo…',
      options: [
        { label: 'digo que no me parece y pido ajustarla', type: 'fighter' },
        { label: 'no sé por dónde empezar y lo aplazo', type: 'freezer' },
        { label: 'lo trocero y esquivo lo que puedo', type: 'fleeer' },
        { label: 'fijo prioridades enseguida y hago un calendario', type: 'fixer' },
      ],
    },
    {
      id: 'q9',
      text: 'Para soltar el estrés, lo que más me atrae es…',
      options: [
        { label: 'el deporte o la actividad física', type: 'fighter' },
        { label: 'descansar en la cama, no hacer nada', type: 'freezer' },
        { label: 'juegos, series, comida: escaparme un rato', type: 'fleeer' },
        { label: 'leer, planificar, analizar el problema', type: 'fixer' },
      ],
    },
    {
      id: 'q10',
      text: 'Cuando el estrés se acumula, con los demás yo…',
      options: [
        { label: 'lo muestro con irritación o enfado', type: 'fighter' },
        { label: 'hablo menos y quiero estar solo', type: 'freezer' },
        { label: 'hago como si nada y me muestro animado', type: 'fleeer' },
        { label: 'pido consejo o explico la situación', type: 'fixer' },
      ],
    },
    {
      id: 'q11',
      text: 'Ante algo difícil y que no me apetece, yo…',
      options: [
        { label: 'me lanzo para acabarlo cuanto antes', type: 'fighter' },
        { label: 'lo aplazo hasta que me pilla el tiempo', type: 'freezer' },
        { label: 'empiezo por lo fácil para esquivarlo', type: 'fleeer' },
        { label: 'aunque no me apetezca, primero hago un plan', type: 'fixer' },
      ],
    },
    {
      id: 'q12',
      text: 'En una crisis, tu papel es…',
      options: [
        { label: 'llevar al equipo y decidir', type: 'fighter' },
        { label: 'esperar a que alguien decida', type: 'freezer' },
        { label: 'salir de esa situación cuanto antes', type: 'fleeer' },
        { label: 'reunir información y analizar la mejor salida', type: 'fixer' },
      ],
    },
  ],
}

const RESULTS: Record<StressType, Record<SupportedLang, ResultData>> = {
  fighter: {
    ko: {
      icon: '⚔️',
      title: '전투형',
      subtitle: '맞서는 전사',
      description: '스트레스에 정면으로 맞서는 강한 에너지를 가졌습니다. 문제가 생기면 즉각적으로 행동하고 결단을 내립니다.',
      strengths: ['결단력', '행동력', '리더십'],
      caution: '충동적 반응이 인간관계를 해칠 수 있습니다.',
      tip: '반응 전 3초 멈춤 연습으로 충동을 조절하세요.',
    },
    en: {
      icon: '⚔️',
      title: 'Fighter',
      subtitle: 'The Confronting Warrior',
      description: 'You have strong energy to face stress head-on. When problems arise, you act immediately and make decisive moves.',
      strengths: ['Decisiveness', 'Action-oriented', 'Leadership'],
      caution: 'Impulsive reactions can damage relationships.',
      tip: 'Practice pausing for 3 seconds before reacting to manage impulses.',
    },
    ja: {
      icon: '⚔️',
      title: '戦闘型',
      subtitle: '立ち向かう戦士',
      description: 'ストレスに正面から立ち向かう強いエネルギーを持っています。問題が起きると即座に行動し、決断を下します。',
      strengths: ['決断力', '行動力', 'リーダーシップ'],
      caution: '衝動的な反応が人間関係を傷つける可能性があります。',
      tip: '反応する前に3秒止まる練習で衝動をコントロールしましょう。',
    },
    zh: {
      icon: '⚔️',
      title: '迎战型',
      subtitle: '正面迎上的战士',
      description: '你有正面迎向压力的强劲能量。出了问题就立刻行动，也拿得出决断。',
      strengths: ['决断力', '行动力', '领导力'],
      caution: '冲动的反应可能会伤到人际关系。',
      tip: '反应前先停三秒，练习把冲动收住。',
    },
    fr: {
      icon: '⚔️',
      title: 'Combattant',
      subtitle: 'Le guerrier qui fait face',
      description: 'Vous affrontez le stress de front, avec beaucoup d’énergie. Dès qu’un problème surgit, vous agissez et vous tranchez.',
      strengths: ['Décision', 'Capacité d’action', 'Leadership'],
      caution: 'Une réaction impulsive peut abîmer vos relations.',
      tip: 'Entraînez-vous à marquer trois secondes avant de réagir.',
    },
    es: {
      icon: '⚔️',
      title: 'Combativo',
      subtitle: 'El guerrero que planta cara',
      description: 'Afrontas el estrés de frente, con mucha energía. En cuanto surge un problema, actúas y decides.',
      strengths: ['Decisión', 'Capacidad de acción', 'Liderazgo'],
      caution: 'Una reacción impulsiva puede dañar tus vínculos.',
      tip: 'Practica parar tres segundos antes de reaccionar.',
    },
  },
  freezer: {
    ko: {
      icon: '🧊',
      title: '동결형',
      subtitle: '얼어붙은 사슴',
      description: '스트레스 앞에서 동작이 멈추는 경향이 있습니다. 과부하가 걸리면 판단이 어려워지고 몸이 굳습니다.',
      strengths: ['신중함', '감수성', '깊은 공감'],
      caution: '마비 상태가 상황을 더 악화시킬 수 있습니다.',
      tip: '아주 작은 첫 행동 하나만 하기로 목표를 잡아보세요.',
    },
    en: {
      icon: '🧊',
      title: 'Freezer',
      subtitle: 'The Deer in Headlights',
      description: 'You tend to freeze up under stress. When overloaded, decision-making becomes hard and your body locks up.',
      strengths: ['Thoughtfulness', 'Sensitivity', 'Deep empathy'],
      caution: 'The paralysis state can make things worse.',
      tip: 'Set a goal to take just one very small first action.',
    },
    ja: {
      icon: '🧊',
      title: '凍結型',
      subtitle: '凍りついた鹿',
      description: 'ストレスの前で動作が止まる傾向があります。過負荷になると判断が難しくなり、体が固まります。',
      strengths: ['慎重さ', '感受性', '深い共感力'],
      caution: '麻痺状態が状況をさらに悪化させる可能性があります。',
      tip: 'まずとても小さな最初の一歩だけ踏み出すことを目標にしましょう。',
    },
    zh: {
      icon: '🧊',
      title: '冻结型',
      subtitle: '愣住的鹿',
      description: '面对压力时，你容易停住不动。一旦超载，判断变难，身体也跟着僵住。',
      strengths: ['审慎', '感受细腻', '共情深'],
      caution: '僵住的状态可能会让情况变得更糟。',
      tip: '把目标定成「只做第一个很小的动作」。',
    },
    fr: {
      icon: '🧊',
      title: 'Figé',
      subtitle: 'Le cerf immobile',
      description: 'Face au stress, vous avez tendance à vous immobiliser. En surcharge, décider devient difficile et le corps se raidit.',
      strengths: ['Prudence', 'Sensibilité', 'Empathie profonde'],
      caution: 'L’immobilisation peut aggraver la situation.',
      tip: 'Fixez-vous pour objectif un seul tout petit premier geste.',
    },
    es: {
      icon: '🧊',
      title: 'Congelado',
      subtitle: 'El ciervo inmóvil',
      description: 'Ante el estrés tiendes a quedarte quieto. Con sobrecarga, decidir se hace difícil y el cuerpo se agarrota.',
      strengths: ['Prudencia', 'Sensibilidad', 'Empatía honda'],
      caution: 'Quedarte inmóvil puede empeorar la situación.',
      tip: 'Ponte como meta un único primer gesto muy pequeño.',
    },
  },
  fleeer: {
    ko: {
      icon: '🦅',
      title: '회피형',
      subtitle: '자유로운 이탈자',
      description: '스트레스를 피하고 기분 전환으로 에너지를 회복합니다. 현실에서 잠시 거리를 두는 것이 자연스러운 패턴입니다.',
      strengths: ['유연성', '자기 보호 본능', '회복력'],
      caution: '문제가 해결되지 않고 쌓일 수 있습니다.',
      tip: '일시적 도피 후 반드시 문제로 돌아오는 루틴을 만드세요.',
    },
    en: {
      icon: '🦅',
      title: 'Fleer',
      subtitle: 'The Free Escapist',
      description: 'You avoid stress and recharge through distraction. Putting temporary distance from reality is your natural pattern.',
      strengths: ['Flexibility', 'Self-protection instinct', 'Resilience'],
      caution: 'Problems can pile up without being resolved.',
      tip: 'Build a routine that always brings you back to the problem after a short escape.',
    },
    ja: {
      icon: '🦅',
      title: '回避型',
      subtitle: '自由な離脱者',
      description: 'ストレスを避け、気分転換でエネルギーを回復します。現実から一時的に距離を置くことが自然なパターンです。',
      strengths: ['柔軟性', '自己保護本能', '回復力'],
      caution: '問題が解決されず積み上がる可能性があります。',
      tip: '一時的な逃避の後、必ず問題に戻るルーティンを作りましょう。',
    },
    zh: {
      icon: '🦅',
      title: '回避型',
      subtitle: '自由的抽身者',
      description: '你会先躲开压力，靠转换心情把力气找回来。暂时和现实拉开距离，是你自然的模式。',
      strengths: ['弹性', '自我保护的本能', '恢复力'],
      caution: '问题没被解决，可能会越积越多。',
      tip: '给自己定个规矩：暂时逃开之后，一定要回到问题上。',
    },
    fr: {
      icon: '🦅',
      title: 'Fuyant',
      subtitle: 'Celui qui prend le large',
      description: 'Vous évitez d’abord le stress et vous récupérez en changeant d’air. Prendre un peu de distance avec la réalité est votre schéma naturel.',
      strengths: ['Souplesse', 'Instinct de préservation', 'Capacité de récupération'],
      caution: 'Les problèmes non traités peuvent s’accumuler.',
      tip: 'Instaurez une règle : après la pause, revenir au problème.',
    },
    es: {
      icon: '🦅',
      title: 'Evitativo',
      subtitle: 'Quien se aparta un rato',
      description: 'Primero esquivas el estrés y recuperas fuerzas cambiando de aire. Tomar distancia de la realidad es tu patrón natural.',
      strengths: ['Flexibilidad', 'Instinto de protegerte', 'Capacidad de recuperarte'],
      caution: 'Los problemas sin tratar pueden acumularse.',
      tip: 'Ponte una regla: después de la pausa, volver al problema.',
    },
  },
  fixer: {
    ko: {
      icon: '🔧',
      title: '해결형',
      subtitle: '분석하는 문제 해결사',
      description: '스트레스를 문제로 보고 즉각 해결책을 찾습니다. 체계적으로 상황을 분석하고 실행 계획을 만듭니다.',
      strengths: ['체계적 사고', '계획력', '효율성'],
      caution: '과도한 분석이 오히려 피로를 유발할 수 있습니다.',
      tip: '때로는 해결 없이 그냥 느끼는 것도 괜찮습니다.',
    },
    en: {
      icon: '🔧',
      title: 'Fixer',
      subtitle: 'The Analytical Problem-Solver',
      description: 'You treat stress as a problem to be solved and immediately seek solutions. You systematically analyze situations and build action plans.',
      strengths: ['Systematic thinking', 'Planning ability', 'Efficiency'],
      caution: 'Over-analysis can itself cause exhaustion.',
      tip: "Sometimes it's okay to just feel without solving.",
    },
    ja: {
      icon: '🔧',
      title: '解決型',
      subtitle: '分析する問題解決者',
      description: 'ストレスを問題として捉え、即座に解決策を探します。体系的に状況を分析し、実行計画を作ります。',
      strengths: ['体系的思考', '計画力', '効率性'],
      caution: '過度な分析がかえって疲労を引き起こす可能性があります。',
      tip: '時には解決せずにただ感じることも大切です。',
    },
    zh: {
      icon: '🔧',
      title: '解决型',
      subtitle: '会分析的解题者',
      description: '你把压力看成问题，马上去找解法。你会有条理地分析状况，并做出执行计划。',
      strengths: ['有条理的思考', '计划力', '效率'],
      caution: '分析过头，反而会让人更累。',
      tip: '有时候不必解决，只是去感受，也没关系。',
    },
    fr: {
      icon: '🔧',
      title: 'Solutionneur',
      subtitle: 'Celui qui analyse et résout',
      description: 'Vous voyez le stress comme un problème et vous cherchez aussitôt une solution. Vous analysez la situation avec méthode et bâtissez un plan d’action.',
      strengths: ['Pensée structurée', 'Capacité à planifier', 'Efficacité'],
      caution: 'Trop analyser peut au contraire épuiser.',
      tip: 'Parfois, ressentir sans chercher à résoudre suffit.',
    },
    es: {
      icon: '🔧',
      title: 'Resolutivo',
      subtitle: 'Quien analiza y resuelve',
      description: 'Ves el estrés como un problema y buscas solución enseguida. Analizas la situación con método y armas un plan.',
      strengths: ['Pensamiento estructurado', 'Capacidad de planificar', 'Eficacia'],
      caution: 'Analizar de más puede cansar todavía más.',
      tip: 'A veces está bien solo sentir, sin resolver.',
    },
  },
}

function calcResult(answers: StressType[]): StressType {
  const counts: Record<StressType, number> = { fighter: 0, freezer: 0, fleeer: 0, fixer: 0 }
  for (const a of answers) counts[a]++
  return (Object.entries(counts) as [StressType, number][]).reduce(
    (best, [type, count]) => (count > counts[best] ? type : best),
    'fixer' as StressType,
  )
}

const TYPE_COLORS: Record<StressType, string> = {
  fighter: '#ef4444',
  freezer: '#60a5fa',
  fleeer: '#f59e0b',
  fixer: '#22c55e',
}

interface Props { locale?: string }

export default function StressTypeTest({ locale: lp = 'ko' }: Props) {
  const locale = lang(lp ?? 'ko')
  const lb = LABELS[locale]
  const questions = QUESTIONS[locale]

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<StressType[]>([])
  const [result, setResult] = useState<StressType | null>(null)
  useRecordFinishedTest({ testId: "stress-type", title: "StressTypeTest", finished: Boolean(result) });

  function pick(type: StressType) {
    const newAnswers = answers.slice(0, current)
    newAnswers[current] = type
    if (current + 1 >= questions.length) setResult(calcResult(newAnswers))
    setAnswers(newAnswers)
    setCurrent(current + 1)
  }

  function previous() {
    if (current === 0) return
    setCurrent(current - 1)
  }

  function restart() {
    setAnswers([])
    setCurrent(0)
    setResult(null)
  }

  function share() {
    if (!result) return
    const url = window.location.href
    const text = `${lb.shareMsg} — ${RESULTS[result][locale].icon} ${RESULTS[result][locale].title}`
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
        options={q.options.map((opt) => ({ label: opt.label, value: opt.type }))}
        selectedValue={answers[current]}
        note={lb.note}
        previousLabel={locale === 'ko' ? '이전 질문' : locale === 'ja' ? '前の質問' : 'Previous question'}
        onPrevious={current > 0 ? previous : undefined}
        onSelect={pick}
      />
    )
  }

  if (!result) return null

  const r = RESULTS[result][locale]
  const color = TYPE_COLORS[result]

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">{lb.yourType}</p>
        <div className="text-5xl">{r.icon}</div>
        <div
          className="inline-block rounded-full px-5 py-2 text-xl font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {r.title}
        </div>
        <p className="font-medium text-muted-foreground">{r.subtitle}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{r.description}</p>
      </div>
      <div className="rounded-xl border bg-card p-4 space-y-2">
        <h3 className="font-semibold text-sm">{lb.strengths}</h3>
        <div className="flex flex-wrap gap-2">
          {r.strengths.map((s) => (
            <span
              key={s}
              className="rounded-full px-3 py-1 text-xs font-medium text-white"
              style={{ backgroundColor: color }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-1">
        <h3 className="font-semibold text-sm text-amber-700">{lb.caution}</h3>
        <p className="text-sm text-amber-700">{r.caution}</p>
      </div>
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-1">
        <h3 className="font-semibold text-sm text-primary">{lb.tip}</h3>
        <p className="text-sm text-muted-foreground">{r.tip}</p>
      </div>
      <p className="text-center text-xs text-muted-foreground">{lb.note}</p>
      <ShareResultButton
        locale={lp}
        heading={lb.yourType}
        emoji={r.icon}
        resultTitle={r.title}
        description={r.subtitle}
      />
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
    </div>
  )
}
