import { useEffect, useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { Questionnaire } from '@/components/ui/questionnaire'
import ShareResultButton from '../shared/ShareResultButton'
import ResultNextSteps from '../shared/ResultNextSteps'
import CopyResultLink from '../shared/CopyResultLink';
import { readResultCode, writeResultCode, clearResultCode } from '../../lib/result-url';

type Chronotype = 'lion' | 'bear' | 'wolf' | 'dolphin'
type SupportedLang = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'

function lang(locale: string): SupportedLang {
  return (['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const).includes(locale as SupportedLang) ? (locale as SupportedLang) : 'en'
}

interface Option { type: Chronotype; text: string }
interface Question { id: string; text: string; options: Option[] }
interface ResultData {
  title: string
  subtitle: string
  description: string
  optimalSleep: string
  traits: string[]
  tips: string[]
}

const LABELS: Record<SupportedLang, {
  title: string
  subtitle: string
  questionOf: (c: number, t: number) => string
  restart: string
  share: string
  shareMsg: string
  yourType: string
  optimalSleep: string
  traits: string
  tips: string
  note: string
}> = {
  ko: {
    title: '수면 크로노타입 테스트',
    subtitle: '나는 사자형, 곰형, 늑대형, 돌고래형?',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '나의 수면 크로노타입은',
    yourType: '나의 크로노타입',
    optimalSleep: '최적 수면 시간',
    traits: '주요 특성',
    tips: '실천 팁',
    note: '이 테스트는 Dr. Michael Breus의 크로노타입 모델을 기반으로 합니다. 전문적 진단을 대체하지 않습니다.',
  },
  en: {
    title: 'Sleep Chronotype Test',
    subtitle: 'Are You a Lion, Bear, Wolf, or Dolphin?',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My sleep chronotype is',
    yourType: 'Your Chronotype',
    optimalSleep: 'Optimal Sleep Window',
    traits: 'Key Traits',
    tips: 'Practical Tips',
    note: 'Based on Dr. Michael Breus\'s chronotype model. Not a substitute for professional diagnosis.',
  },
  ja: {
    title: '睡眠クロノタイプテスト',
    subtitle: 'ライオン型、クマ型、オオカミ型、イルカ型？',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '私の睡眠クロノタイプは',
    yourType: '私のクロノタイプ',
    optimalSleep: '最適な睡眠時間帯',
    traits: '主な特性',
    tips: '実践アドバイス',
    note: 'Dr. Michael Breusのクロノタイプモデルに基づいています。専門的診断の代替ではありません。',
  },
  zh: {
    title: '睡眠时型测验',
    subtitle: '我是狮子型、熊型、狼型，还是海豚型？',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: '重新测验',
    share: '分享结果',
    shareMsg: '我的睡眠时型是',
    yourType: '我的时型',
    optimalSleep: '最适合的睡眠时段',
    traits: '主要特征',
    tips: '实践建议',
    note: '本测验参考 Michael Breus 博士的时型模型，不能替代专业评估。',
  },
  fr: {
    title: 'Test du chronotype de sommeil',
    subtitle: 'Suis-je lion, ours, loup ou dauphin ?',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: 'Recommencer',
    share: 'Partager le résultat',
    shareMsg: 'Mon chronotype de sommeil',
    yourType: 'Votre chronotype',
    optimalSleep: 'Créneau de sommeil optimal',
    traits: 'Traits principaux',
    tips: 'Conseils pratiques',
    note: 'Ce test s’appuie sur le modèle des chronotypes du Dr Michael Breus. Il ne remplace pas une évaluation professionnelle.',
  },
  es: {
    title: 'Test de cronotipo de sueño',
    subtitle: '¿Soy león, oso, lobo o delfín?',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: 'Repetir',
    share: 'Compartir resultado',
    shareMsg: 'Mi cronotipo de sueño',
    yourType: 'Tu cronotipo',
    optimalSleep: 'Franja de sueño óptima',
    traits: 'Rasgos principales',
    tips: 'Consejos prácticos',
    note: 'Este test se apoya en el modelo de cronotipos del Dr. Michael Breus. No sustituye una evaluación profesional.',
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    {
      id: 'q1', text: '알람 없이 자연스럽게 일어나는 시간은?',
      options: [
        { type: 'lion', text: '오전 5–6시' },
        { type: 'bear', text: '오전 7–8시' },
        { type: 'wolf', text: '오전 9–10시 이후' },
        { type: 'dolphin', text: '시간이 불규칙하고 항상 피곤하다' },
      ],
    },
    {
      id: 'q2', text: '가장 집중력이 높은 시간대는?',
      options: [
        { type: 'lion', text: '오전 8–10시' },
        { type: 'bear', text: '오전 10시–오후 2시' },
        { type: 'wolf', text: '오후 6시 이후' },
        { type: 'dolphin', text: '특정 시간 없이 들쑥날쑥하다' },
      ],
    },
    {
      id: 'q3', text: '주말 아침 자유 시간이 생기면...',
      options: [
        { type: 'lion', text: '평소와 같은 시간에 일어나 아침을 즐긴다' },
        { type: 'bear', text: '평소보다 1–2시간 늦게 일어난다' },
        { type: 'wolf', text: '가능한 한 늦게까지 잔다' },
        { type: 'dolphin', text: '오래 자도 개운하지 않다' },
      ],
    },
    {
      id: 'q4', text: '저녁 식사 후 에너지 상태는?',
      options: [
        { type: 'lion', text: '피곤해지고 일찍 잠자리에 들고 싶다' },
        { type: 'bear', text: '여전히 활동적이지만 밤 10시쯤 졸리다' },
        { type: 'wolf', text: '오히려 활기차지고 창의력이 올라간다' },
        { type: 'dolphin', text: '일정하지 않고 피로감이 지속된다' },
      ],
    },
    {
      id: 'q5', text: '잠드는 데 걸리는 시간은?',
      options: [
        { type: 'lion', text: '누으면 금방 잠든다 (5–10분)' },
        { type: 'bear', text: '15–20분 정도 걸린다' },
        { type: 'wolf', text: '30분 이상 걸리거나 밤늦게야 잠온다' },
        { type: 'dolphin', text: '잠들기 어렵고 자다가 자주 깬다' },
      ],
    },
    {
      id: 'q6', text: '가장 선호하는 회의/약속 시간대는?',
      options: [
        { type: 'lion', text: '이른 오전 (8–10시)' },
        { type: 'bear', text: '오전 중반~점심 (10시~12시)' },
        { type: 'wolf', text: '오후 늦게~저녁 (5시 이후)' },
        { type: 'dolphin', text: '스케줄 자체가 스트레스다' },
      ],
    },
    {
      id: 'q7', text: '아침에 일어났을 때의 상태는?',
      options: [
        { type: 'lion', text: '바로 활기차게 하루를 시작할 수 있다' },
        { type: 'bear', text: '15–30분이면 완전히 깨어난다' },
        { type: 'wolf', text: '오전 내내 안개 속에 있는 것 같다' },
        { type: 'dolphin', text: '제대로 잔 것 같지 않아 항상 피곤하다' },
      ],
    },
    {
      id: 'q8', text: '밤 11시에 재미있는 파티가 시작된다면...',
      options: [
        { type: 'lion', text: '이미 졸려서 일찍 자거나 피하고 싶다' },
        { type: 'bear', text: '참석하지만 자정쯤 집에 가고 싶다' },
        { type: 'wolf', text: '밤이 깊을수록 더 즐거워진다' },
        { type: 'dolphin', text: '가고 싶지만 다음 날 피로가 걱정된다' },
      ],
    },
    {
      id: 'q9', text: '창의적인 작업이나 글쓰기를 할 때 최고 컨디션은?',
      options: [
        { type: 'lion', text: '이른 아침' },
        { type: 'bear', text: '오전 중반' },
        { type: 'wolf', text: '저녁이나 늦은 밤' },
        { type: 'dolphin', text: '예측 불가 — 가끔 밤에, 가끔 새벽에' },
      ],
    },
    {
      id: 'q10', text: '커피나 카페인 의존도는?',
      options: [
        { type: 'lion', text: '거의 필요 없다' },
        { type: 'bear', text: '아침에 1–2잔 정도' },
        { type: 'wolf', text: '오후에도 마신다' },
        { type: 'dolphin', text: '없으면 하루를 버티기 힘들다' },
      ],
    },
    {
      id: 'q11', text: '여행지에서 시차 적응은?',
      options: [
        { type: 'lion', text: '현지 시간에 빠르게 적응한다' },
        { type: 'bear', text: '며칠이면 괜찮아진다' },
        { type: 'wolf', text: '오히려 야간 시간대가 있는 곳이 편하다' },
        { type: 'dolphin', text: '시차와 상관없이 항상 잠을 못 잔다' },
      ],
    },
    {
      id: 'q12', text: '운동하기 가장 좋은 시간은?',
      options: [
        { type: 'lion', text: '이른 아침' },
        { type: 'bear', text: '오전 늦게~점심 전후' },
        { type: 'wolf', text: '오후 늦게~저녁' },
        { type: 'dolphin', text: '운동해도 잠이 안 오거나 너무 각성된다' },
      ],
    },
    {
      id: 'q13', text: '이상적인 취침 시간은?',
      options: [
        { type: 'lion', text: '오후 9시–10시' },
        { type: 'bear', text: '밤 10시–11시' },
        { type: 'wolf', text: '자정 이후' },
        { type: 'dolphin', text: '규칙적인 취침 시간을 유지하기 어렵다' },
      ],
    },
    {
      id: 'q14', text: '낮잠에 대한 나의 태도는?',
      options: [
        { type: 'lion', text: '낮잠을 자면 오히려 밤 수면이 방해된다' },
        { type: 'bear', text: '20–30분 낮잠으로 오후 활력을 찾는다' },
        { type: 'wolf', text: '낮잠을 자면 오후를 완전히 날릴 것 같아 무섭다' },
        { type: 'dolphin', text: '낮잠을 자고 싶지만 자도 개운하지 않다' },
      ],
    },
    {
      id: 'q15', text: '밤에 할 일 목록을 보면...',
      options: [
        { type: 'lion', text: '내일 아침 일찍 시작하면 다 할 수 있겠다' },
        { type: 'bear', text: '저녁에 일부 처리하고 내일 마무리하면 된다' },
        { type: 'wolf', text: '밤에 하는 게 훨씬 잘 된다' },
        { type: 'dolphin', text: '걱정이 앞서 잠을 못 잘 것 같다' },
      ],
    },
    {
      id: 'q16', text: '주중 vs 주말 수면 패턴은?',
      options: [
        { type: 'lion', text: '거의 같다' },
        { type: 'bear', text: '주말에 1–2시간 늦게 잔다' },
        { type: 'wolf', text: '주말엔 훨씬 늦게 자고 늦게 일어난다' },
        { type: 'dolphin', text: '주중이든 주말이든 잠을 제대로 못 잔다' },
      ],
    },
  ],
  en: [
    {
      id: 'q1', text: 'When do you naturally wake up without an alarm?',
      options: [
        { type: 'lion', text: '5–6 AM' },
        { type: 'bear', text: '7–8 AM' },
        { type: 'wolf', text: '9–10 AM or later' },
        { type: 'dolphin', text: 'Irregular — and always tired' },
      ],
    },
    {
      id: 'q2', text: 'When is your peak focus and concentration?',
      options: [
        { type: 'lion', text: '8–10 AM' },
        { type: 'bear', text: '10 AM–2 PM' },
        { type: 'wolf', text: 'After 6 PM' },
        { type: 'dolphin', text: 'No consistent peak — it varies erratically' },
      ],
    },
    {
      id: 'q3', text: 'On a free weekend morning, you...',
      options: [
        { type: 'lion', text: 'Wake at your usual time and enjoy the morning' },
        { type: 'bear', text: 'Sleep 1–2 hours later than usual' },
        { type: 'wolf', text: 'Sleep in as long as possible' },
        { type: 'dolphin', text: 'Sleep long but still feel unrefreshed' },
      ],
    },
    {
      id: 'q4', text: 'Your energy level after dinner?',
      options: [
        { type: 'lion', text: 'Getting tired — ready for bed soon' },
        { type: 'bear', text: 'Still active but sleepy around 10 PM' },
        { type: 'wolf', text: 'Energized — creativity peaks at night' },
        { type: 'dolphin', text: 'Inconsistent and persistently fatigued' },
      ],
    },
    {
      id: 'q5', text: 'How long does it take you to fall asleep?',
      options: [
        { type: 'lion', text: 'Almost immediately (5–10 min)' },
        { type: 'bear', text: 'About 15–20 minutes' },
        { type: 'wolf', text: '30+ minutes, or only late at night' },
        { type: 'dolphin', text: 'Difficult to fall asleep and I wake often' },
      ],
    },
    {
      id: 'q6', text: 'Your preferred meeting or appointment time?',
      options: [
        { type: 'lion', text: 'Early morning (8–10 AM)' },
        { type: 'bear', text: 'Mid-morning to lunch (10 AM–12 PM)' },
        { type: 'wolf', text: 'Late afternoon or evening (after 5 PM)' },
        { type: 'dolphin', text: 'Scheduling itself is stressful' },
      ],
    },
    {
      id: 'q7', text: 'How do you feel when you first wake up?',
      options: [
        { type: 'lion', text: 'Alert and ready to go immediately' },
        { type: 'bear', text: 'Fully awake within 15–30 minutes' },
        { type: 'wolf', text: 'Foggy all morning' },
        { type: 'dolphin', text: 'Always tired regardless of sleep duration' },
      ],
    },
    {
      id: 'q8', text: 'A fun party starts at 11 PM — you...',
      options: [
        { type: 'lion', text: 'Skip it — already sleepy by then' },
        { type: 'bear', text: 'Attend but want to leave around midnight' },
        { type: 'wolf', text: 'Get more energized as the night goes on' },
        { type: 'dolphin', text: 'Want to go but worry about next-day fatigue' },
      ],
    },
    {
      id: 'q9', text: 'When are you at your creative or writing best?',
      options: [
        { type: 'lion', text: 'Early morning' },
        { type: 'bear', text: 'Mid-morning' },
        { type: 'wolf', text: 'Evening or late at night' },
        { type: 'dolphin', text: 'Unpredictable — sometimes midnight, sometimes dawn' },
      ],
    },
    {
      id: 'q10', text: 'Your caffeine dependency?',
      options: [
        { type: 'lion', text: 'Rarely need it' },
        { type: 'bear', text: '1–2 cups in the morning' },
        { type: 'wolf', text: 'Drink it into the afternoon' },
        { type: 'dolphin', text: 'Can\'t function without it' },
      ],
    },
    {
      id: 'q11', text: 'How do you handle jet lag when traveling?',
      options: [
        { type: 'lion', text: 'Adapt to local time quickly' },
        { type: 'bear', text: 'Usually fine within a few days' },
        { type: 'wolf', text: 'Actually feel better in later time zones' },
        { type: 'dolphin', text: 'Sleep poorly regardless of time zone' },
      ],
    },
    {
      id: 'q12', text: 'Your best time to exercise?',
      options: [
        { type: 'lion', text: 'Early morning' },
        { type: 'bear', text: 'Late morning or around lunch' },
        { type: 'wolf', text: 'Late afternoon or evening' },
        { type: 'dolphin', text: 'Exercise leaves me too wired to sleep' },
      ],
    },
    {
      id: 'q13', text: 'Your ideal bedtime?',
      options: [
        { type: 'lion', text: '9–10 PM' },
        { type: 'bear', text: '10–11 PM' },
        { type: 'wolf', text: 'Past midnight' },
        { type: 'dolphin', text: 'Hard to maintain a consistent bedtime' },
      ],
    },
    {
      id: 'q14', text: 'Your attitude toward napping?',
      options: [
        { type: 'lion', text: 'Naps disrupt my night sleep' },
        { type: 'bear', text: 'A 20–30 min nap refreshes my afternoon' },
        { type: 'wolf', text: 'Afraid napping will ruin my whole afternoon' },
        { type: 'dolphin', text: 'I nap but still wake up tired' },
      ],
    },
    {
      id: 'q15', text: 'Looking at your to-do list at night, you think...',
      options: [
        { type: 'lion', text: 'I\'ll tackle it early tomorrow morning' },
        { type: 'bear', text: 'Get some done tonight, finish tomorrow' },
        { type: 'wolf', text: 'Night is when I do my best work' },
        { type: 'dolphin', text: 'Worrying about it will keep me awake' },
      ],
    },
    {
      id: 'q16', text: 'Your weekday vs weekend sleep pattern?',
      options: [
        { type: 'lion', text: 'Nearly identical' },
        { type: 'bear', text: '1–2 hours later on weekends' },
        { type: 'wolf', text: 'Much later to bed and up on weekends' },
        { type: 'dolphin', text: 'Poor sleep regardless of the day' },
      ],
    },
  ],
  ja: [
    {
      id: 'q1', text: 'アラームなしで自然に目覚める時間は？',
      options: [
        { type: 'lion', text: '午前5–6時' },
        { type: 'bear', text: '午前7–8時' },
        { type: 'wolf', text: '午前9–10時以降' },
        { type: 'dolphin', text: '時間が不規則でいつも疲れている' },
      ],
    },
    {
      id: 'q2', text: '最も集中力が高い時間帯は？',
      options: [
        { type: 'lion', text: '午前8–10時' },
        { type: 'bear', text: '午前10時〜午後2時' },
        { type: 'wolf', text: '午後6時以降' },
        { type: 'dolphin', text: '決まった時間がなくバラバラ' },
      ],
    },
    {
      id: 'q3', text: '週末の朝に自由な時間ができたら…',
      options: [
        { type: 'lion', text: '普段通りの時間に起きて朝を楽しむ' },
        { type: 'bear', text: '普段より1–2時間遅く起きる' },
        { type: 'wolf', text: 'できる限り遅くまで寝る' },
        { type: 'dolphin', text: '長く寝ても疲れが取れない' },
      ],
    },
    {
      id: 'q4', text: '夕食後のエネルギー状態は？',
      options: [
        { type: 'lion', text: '疲れてきて早く寝たくなる' },
        { type: 'bear', text: 'まだ活動的だが夜10時頃眠くなる' },
        { type: 'wolf', text: '逆に活力が増し創造力が上がる' },
        { type: 'dolphin', text: '一定でなく疲労感が続く' },
      ],
    },
    {
      id: 'q5', text: '眠りにつくまでどのくらいかかりますか？',
      options: [
        { type: 'lion', text: 'すぐ眠れる（5–10分）' },
        { type: 'bear', text: '15–20分程度' },
        { type: 'wolf', text: '30分以上、または深夜になってから' },
        { type: 'dolphin', text: 'なかなか眠れず夜中に何度も目が覚める' },
      ],
    },
    {
      id: 'q6', text: '会議やアポの希望時間帯は？',
      options: [
        { type: 'lion', text: '早朝（8–10時）' },
        { type: 'bear', text: '午前中〜昼（10時〜12時）' },
        { type: 'wolf', text: '夕方〜夜（17時以降）' },
        { type: 'dolphin', text: 'スケジュール自体がストレス' },
      ],
    },
    {
      id: 'q7', text: '朝起きたときの状態は？',
      options: [
        { type: 'lion', text: 'すぐ活発に動き出せる' },
        { type: 'bear', text: '15–30分で完全に目が覚める' },
        { type: 'wolf', text: '午前中ずっと頭がぼんやりしている' },
        { type: 'dolphin', text: 'ちゃんと寝た気がしなくていつも疲れている' },
      ],
    },
    {
      id: 'q8', text: '夜11時に楽しいパーティが始まるとしたら…',
      options: [
        { type: 'lion', text: 'もう眠いので早めに寝るか避けたい' },
        { type: 'bear', text: '参加するが深夜0時頃には帰りたい' },
        { type: 'wolf', text: '夜が深まるほど楽しくなる' },
        { type: 'dolphin', text: '行きたいが翌日の疲労が心配' },
      ],
    },
    {
      id: 'q9', text: 'クリエイティブな作業や文章を書くベストタイムは？',
      options: [
        { type: 'lion', text: '早朝' },
        { type: 'bear', text: '午前中' },
        { type: 'wolf', text: '夕方や深夜' },
        { type: 'dolphin', text: '予測不可能 — 時に深夜、時に明け方' },
      ],
    },
    {
      id: 'q10', text: 'カフェインへの依存度は？',
      options: [
        { type: 'lion', text: 'ほとんど必要ない' },
        { type: 'bear', text: '朝に1–2杯程度' },
        { type: 'wolf', text: '午後も飲む' },
        { type: 'dolphin', text: 'ないと一日が乗り越えられない' },
      ],
    },
    {
      id: 'q11', text: '旅行先での時差ぼけは？',
      options: [
        { type: 'lion', text: '現地時間にすぐ慣れる' },
        { type: 'bear', text: '数日で慣れる' },
        { type: 'wolf', text: 'むしろ夜型の時間帯が楽' },
        { type: 'dolphin', text: '時差に関係なくいつも眠れない' },
      ],
    },
    {
      id: 'q12', text: '運動に最適な時間は？',
      options: [
        { type: 'lion', text: '早朝' },
        { type: 'bear', text: '午前遅め〜昼前後' },
        { type: 'wolf', text: '夕方遅め〜夜' },
        { type: 'dolphin', text: '運動すると眠れなくなるか過覚醒になる' },
      ],
    },
    {
      id: 'q13', text: '理想的な就寝時間は？',
      options: [
        { type: 'lion', text: '午後9–10時' },
        { type: 'bear', text: '夜10–11時' },
        { type: 'wolf', text: '深夜以降' },
        { type: 'dolphin', text: '規則的な就寝時間を維持しにくい' },
      ],
    },
    {
      id: 'q14', text: '昼寝に対する姿勢は？',
      options: [
        { type: 'lion', text: '昼寝すると夜の睡眠が乱れる' },
        { type: 'bear', text: '20–30分の昼寝で午後の活力が戻る' },
        { type: 'wolf', text: '昼寝したら午後を丸ごと無駄にしそうで怖い' },
        { type: 'dolphin', text: '昼寝しても疲れが取れない' },
      ],
    },
    {
      id: 'q15', text: '夜にToDoリストを見ると…',
      options: [
        { type: 'lion', text: '明日の朝早く始めれば全部できる' },
        { type: 'bear', text: '今夜一部やって明日仕上げればいい' },
        { type: 'wolf', text: '夜の方がはかどる' },
        { type: 'dolphin', text: '心配で眠れなくなりそう' },
      ],
    },
    {
      id: 'q16', text: '平日と週末の睡眠パターンは？',
      options: [
        { type: 'lion', text: 'ほぼ同じ' },
        { type: 'bear', text: '週末は1–2時間遅く寝る' },
        { type: 'wolf', text: '週末はかなり遅く寝て遅く起きる' },
        { type: 'dolphin', text: '平日も週末もちゃんと眠れない' },
      ],
    },
  ],
  zh: [
    {
      id: 'q1', text: '不用闹钟时，你自然醒的时间是？',
      options: [
        { type: 'lion', text: '早上五到六点' },
        { type: 'bear', text: '早上七到八点' },
        { type: 'wolf', text: '早上九到十点以后' },
        { type: 'dolphin', text: '时间不规律，而且总是累' },
      ],
    },
    {
      id: 'q2', text: '你注意力最好的时段是？',
      options: [
        { type: 'lion', text: '上午八到十点' },
        { type: 'bear', text: '上午十点到下午两点' },
        { type: 'wolf', text: '晚上六点以后' },
        { type: 'dolphin', text: '没有固定时段，起伏不定' },
      ],
    },
    {
      id: 'q3', text: '周末早上多出空闲时，你会…',
      options: [
        { type: 'lion', text: '照平常时间起床，享受早晨' },
        { type: 'bear', text: '比平常晚起一两个小时' },
        { type: 'wolf', text: '能睡多晚就睡多晚' },
        { type: 'dolphin', text: '睡再久也不清爽' },
      ],
    },
    {
      id: 'q4', text: '晚餐后你的精神状态是？',
      options: [
        { type: 'lion', text: '开始犯困，想早点上床' },
        { type: 'bear', text: '还算有劲，但十点左右会困' },
        { type: 'wolf', text: '反而更精神，创意也上来' },
        { type: 'dolphin', text: '起伏不定，疲惫一直挂着' },
      ],
    },
    {
      id: 'q5', text: '你入睡需要多久？',
      options: [
        { type: 'lion', text: '躺下很快就着（五到十分钟）' },
        { type: 'bear', text: '大约十五到二十分钟' },
        { type: 'wolf', text: '超过三十分钟，或要很晚才有睡意' },
        { type: 'dolphin', text: '难入睡，而且中途常醒' },
      ],
    },
    {
      id: 'q6', text: '你最偏好的会议或约见时段是？',
      options: [
        { type: 'lion', text: '一早（八到十点）' },
        { type: 'bear', text: '上午中段到中午（十点到十二点）' },
        { type: 'wolf', text: '傍晚以后（五点之后）' },
        { type: 'dolphin', text: '安排日程这件事本身就让我有压力' },
      ],
    },
    {
      id: 'q7', text: '早上醒来时你的状态是？',
      options: [
        { type: 'lion', text: '马上就能精神地开始一天' },
        { type: 'bear', text: '十五到三十分钟就完全清醒' },
        { type: 'wolf', text: '整个上午都像在雾里' },
        { type: 'dolphin', text: '好像没睡好，总是累' },
      ],
    },
    {
      id: 'q8', text: '如果晚上十一点有个好玩的聚会…',
      options: [
        { type: 'lion', text: '已经困了，想早睡或干脆不去' },
        { type: 'bear', text: '会去，但半夜就想回家' },
        { type: 'wolf', text: '夜越深越开心' },
        { type: 'dolphin', text: '想去，但担心隔天会累' },
      ],
    },
    {
      id: 'q9', text: '做创作或写东西时，你状态最好的是？',
      options: [
        { type: 'lion', text: '清早' },
        { type: 'bear', text: '上午中段' },
        { type: 'wolf', text: '晚上或深夜' },
        { type: 'dolphin', text: '说不准——有时深夜，有时凌晨' },
      ],
    },
    {
      id: 'q10', text: '你对咖啡或咖啡因的依赖？',
      options: [
        { type: 'lion', text: '几乎不需要' },
        { type: 'bear', text: '早上一两杯' },
        { type: 'wolf', text: '下午也会喝' },
        { type: 'dolphin', text: '没有就撑不过一天' },
      ],
    },
    {
      id: 'q11', text: '出门旅行时，你倒时差的情况？',
      options: [
        { type: 'lion', text: '很快适应当地时间' },
        { type: 'bear', text: '几天就好了' },
        { type: 'wolf', text: '反而有夜间时段的地方更舒服' },
        { type: 'dolphin', text: '跟时差无关，我一直睡不好' },
      ],
    },
    {
      id: 'q12', text: '最适合你运动的时间是？',
      options: [
        { type: 'lion', text: '清早' },
        { type: 'bear', text: '上午晚些到午前后' },
        { type: 'wolf', text: '下午晚些到傍晚' },
        { type: 'dolphin', text: '运动完反而睡不着或太亢奋' },
      ],
    },
    {
      id: 'q13', text: '你理想的就寝时间是？',
      options: [
        { type: 'lion', text: '晚上九到十点' },
        { type: 'bear', text: '晚上十到十一点' },
        { type: 'wolf', text: '午夜之后' },
        { type: 'dolphin', text: '很难维持规律的就寝时间' },
      ],
    },
    {
      id: 'q14', text: '你对午睡的看法是？',
      options: [
        { type: 'lion', text: '午睡会影响晚上的睡眠' },
        { type: 'bear', text: '二十到三十分钟的午睡能让下午回神' },
        { type: 'wolf', text: '怕一睡就把整个下午报销，所以不敢睡' },
        { type: 'dolphin', text: '想睡，但睡了也不清爽' },
      ],
    },
    {
      id: 'q15', text: '晚上看着待办清单时，你会想…',
      options: [
        { type: 'lion', text: '明早早点开始就都做得完' },
        { type: 'bear', text: '晚上先处理一部分，明天收尾' },
        { type: 'wolf', text: '晚上做反而效率高得多' },
        { type: 'dolphin', text: '会先担心起来，大概会睡不着' },
      ],
    },
    {
      id: 'q16', text: '你平日和周末的睡眠差别是？',
      options: [
        { type: 'lion', text: '几乎一样' },
        { type: 'bear', text: '周末晚睡一两个小时' },
        { type: 'wolf', text: '周末晚得多，起得也晚' },
        { type: 'dolphin', text: '不管平日还是周末，都睡不好' },
      ],
    },
  ],
  fr: [
    {
      id: 'q1', text: 'Sans réveil, à quelle heure vous levez-vous naturellement ?',
      options: [
        { type: 'lion', text: 'Entre 5 h et 6 h' },
        { type: 'bear', text: 'Entre 7 h et 8 h' },
        { type: 'wolf', text: 'À partir de 9 h ou 10 h' },
        { type: 'dolphin', text: 'À des heures irrégulières, et toujours fatigué' },
      ],
    },
    {
      id: 'q2', text: 'À quel moment votre concentration est-elle la meilleure ?',
      options: [
        { type: 'lion', text: 'Entre 8 h et 10 h' },
        { type: 'bear', text: 'Entre 10 h et 14 h' },
        { type: 'wolf', text: 'Après 18 h' },
        { type: 'dolphin', text: 'Sans horaire fixe, cela varie' },
      ],
    },
    {
      id: 'q3', text: 'Un matin de week-end libre, vous…',
      options: [
        { type: 'lion', text: 'vous levez à l’heure habituelle et savourez la matinée' },
        { type: 'bear', text: 'vous levez une ou deux heures plus tard' },
        { type: 'wolf', text: 'dormez le plus tard possible' },
        { type: 'dolphin', text: 'dormez longtemps sans vous sentir frais' },
      ],
    },
    {
      id: 'q4', text: 'Après le dîner, votre énergie est…',
      options: [
        { type: 'lion', text: 'en baisse, vous avez envie de vous coucher tôt' },
        { type: 'bear', text: 'encore bonne, mais le sommeil vient vers 22 h' },
        { type: 'wolf', text: 'plutôt en hausse, avec un regain de créativité' },
        { type: 'dolphin', text: 'irrégulière, avec une fatigue persistante' },
      ],
    },
    {
      id: 'q5', text: 'Combien de temps mettez-vous à vous endormir ?',
      options: [
        { type: 'lion', text: 'Je m’endors vite une fois couché (5 à 10 minutes)' },
        { type: 'bear', text: 'Environ 15 à 20 minutes' },
        { type: 'wolf', text: 'Plus de 30 minutes, ou le sommeil ne vient que tard' },
        { type: 'dolphin', text: 'J’ai du mal à m’endormir et je me réveille souvent' },
      ],
    },
    {
      id: 'q6', text: 'Quel créneau préférez-vous pour une réunion ou un rendez-vous ?',
      options: [
        { type: 'lion', text: 'Tôt le matin (8 h à 10 h)' },
        { type: 'bear', text: 'En milieu de matinée jusqu’à midi' },
        { type: 'wolf', text: 'En fin d’après-midi ou le soir (après 17 h)' },
        { type: 'dolphin', text: 'Le fait même de planifier me stresse' },
      ],
    },
    {
      id: 'q7', text: 'Au réveil, votre état est…',
      options: [
        { type: 'lion', text: 'immédiatement actif, prêt à démarrer' },
        { type: 'bear', text: 'complètement réveillé en 15 à 30 minutes' },
        { type: 'wolf', text: 'dans le brouillard toute la matinée' },
        { type: 'dolphin', text: 'fatigué, comme si je n’avais pas dormi' },
      ],
    },
    {
      id: 'q8', text: 'Si une soirée sympa commence à 23 h…',
      options: [
        { type: 'lion', text: 'j’ai déjà sommeil, je préfère me coucher ou décliner' },
        { type: 'bear', text: 'j’y vais, mais je veux rentrer vers minuit' },
        { type: 'wolf', text: 'plus la nuit avance, plus j’en profite' },
        { type: 'dolphin', text: 'j’ai envie d’y aller, mais je crains la fatigue du lendemain' },
      ],
    },
    {
      id: 'q9', text: 'Pour créer ou écrire, votre meilleure forme est…',
      options: [
        { type: 'lion', text: 'tôt le matin' },
        { type: 'bear', text: 'en milieu de matinée' },
        { type: 'wolf', text: 'le soir ou tard dans la nuit' },
        { type: 'dolphin', text: 'imprévisible — parfois la nuit, parfois à l’aube' },
      ],
    },
    {
      id: 'q10', text: 'Votre rapport au café ou à la caféine ?',
      options: [
        { type: 'lion', text: 'Je n’en ai presque pas besoin' },
        { type: 'bear', text: 'Une ou deux tasses le matin' },
        { type: 'wolf', text: 'J’en bois aussi l’après-midi' },
        { type: 'dolphin', text: 'Sans caféine, je ne tiens pas la journée' },
      ],
    },
    {
      id: 'q11', text: 'En voyage, votre adaptation au décalage horaire ?',
      options: [
        { type: 'lion', text: 'Je m’aligne vite sur l’heure locale' },
        { type: 'bear', text: 'Quelques jours et ça va' },
        { type: 'wolf', text: 'Je me sens même mieux là où la vie est nocturne' },
        { type: 'dolphin', text: 'Décalage ou pas, je dors mal de toute façon' },
      ],
    },
    {
      id: 'q12', text: 'Le meilleur moment pour faire du sport ?',
      options: [
        { type: 'lion', text: 'Tôt le matin' },
        { type: 'bear', text: 'En fin de matinée ou autour de midi' },
        { type: 'wolf', text: 'En fin d’après-midi ou le soir' },
        { type: 'dolphin', text: 'Après le sport, je ne trouve pas le sommeil ou je suis trop excité' },
      ],
    },
    {
      id: 'q13', text: 'Votre heure de coucher idéale ?',
      options: [
        { type: 'lion', text: 'Entre 21 h et 22 h' },
        { type: 'bear', text: 'Entre 22 h et 23 h' },
        { type: 'wolf', text: 'Après minuit' },
        { type: 'dolphin', text: 'J’ai du mal à tenir une heure régulière' },
      ],
    },
    {
      id: 'q14', text: 'Votre rapport à la sieste ?',
      options: [
        { type: 'lion', text: 'Une sieste perturbe ma nuit' },
        { type: 'bear', text: '20 à 30 minutes me relancent pour l’après-midi' },
        { type: 'wolf', text: 'J’ai peur de perdre tout l’après-midi, alors j’évite' },
        { type: 'dolphin', text: 'J’aimerais dormir, mais la sieste ne me repose pas' },
      ],
    },
    {
      id: 'q15', text: 'Le soir, devant votre liste de tâches, vous vous dites…',
      options: [
        { type: 'lion', text: 'en démarrant tôt demain matin, je viendrai à bout de tout' },
        { type: 'bear', text: 'j’en fais une partie ce soir et je termine demain' },
        { type: 'wolf', text: 'le soir, je travaille bien mieux' },
        { type: 'dolphin', text: 'l’inquiétude monte et je risque de mal dormir' },
      ],
    },
    {
      id: 'q16', text: 'Vos habitudes de sommeil en semaine et le week-end ?',
      options: [
        { type: 'lion', text: 'Presque identiques' },
        { type: 'bear', text: 'Je me couche une ou deux heures plus tard le week-end' },
        { type: 'wolf', text: 'Beaucoup plus tard le week-end, et je me lève tard' },
        { type: 'dolphin', text: 'Semaine ou week-end, je dors mal' },
      ],
    },
  ],
  es: [
    {
      id: 'q1', text: 'Sin despertador, ¿a qué hora te levantas de forma natural?',
      options: [
        { type: 'lion', text: 'Entre las 5 y las 6' },
        { type: 'bear', text: 'Entre las 7 y las 8' },
        { type: 'wolf', text: 'A partir de las 9 o las 10' },
        { type: 'dolphin', text: 'A horas irregulares, y siempre cansado' },
      ],
    },
    {
      id: 'q2', text: '¿En qué franja te concentras mejor?',
      options: [
        { type: 'lion', text: 'Entre las 8 y las 10' },
        { type: 'bear', text: 'Entre las 10 y las 14' },
        { type: 'wolf', text: 'A partir de las 18' },
        { type: 'dolphin', text: 'Sin franja fija, va cambiando' },
      ],
    },
    {
      id: 'q3', text: 'Una mañana libre de fin de semana, tú…',
      options: [
        { type: 'lion', text: 'te levantas a la hora de siempre y disfrutas la mañana' },
        { type: 'bear', text: 'te levantas una o dos horas más tarde' },
        { type: 'wolf', text: 'duermes hasta lo más tarde posible' },
        { type: 'dolphin', text: 'duermes mucho y aun así no te despejas' },
      ],
    },
    {
      id: 'q4', text: 'Después de cenar, tu energía está…',
      options: [
        { type: 'lion', text: 'de bajada, con ganas de acostarte pronto' },
        { type: 'bear', text: 'aún bien, pero sobre las 22 te entra el sueño' },
        { type: 'wolf', text: 'más bien alta, con un repunte creativo' },
        { type: 'dolphin', text: 'irregular, con un cansancio que no se va' },
      ],
    },
    {
      id: 'q5', text: '¿Cuánto tardas en dormirte?',
      options: [
        { type: 'lion', text: 'Me duermo rápido al acostarme (5 a 10 minutos)' },
        { type: 'bear', text: 'Unos 15 a 20 minutos' },
        { type: 'wolf', text: 'Más de 30 minutos, o el sueño llega muy tarde' },
        { type: 'dolphin', text: 'Me cuesta dormirme y me despierto a menudo' },
      ],
    },
    {
      id: 'q6', text: '¿Qué franja prefieres para una reunión o una cita?',
      options: [
        { type: 'lion', text: 'Temprano (de 8 a 10)' },
        { type: 'bear', text: 'De media mañana a mediodía' },
        { type: 'wolf', text: 'A última hora de la tarde (después de las 17)' },
        { type: 'dolphin', text: 'Planificar la agenda ya me estresa de por sí' },
      ],
    },
    {
      id: 'q7', text: 'Al despertar, tu estado es…',
      options: [
        { type: 'lion', text: 'activo enseguida, listo para empezar' },
        { type: 'bear', text: 'despierto del todo en 15 a 30 minutos' },
        { type: 'wolf', text: 'como en niebla toda la mañana' },
        { type: 'dolphin', text: 'cansado, como si no hubiera dormido' },
      ],
    },
    {
      id: 'q8', text: 'Si una fiesta apetecible empieza a las 23…',
      options: [
        { type: 'lion', text: 'ya tengo sueño, prefiero acostarme o no ir' },
        { type: 'bear', text: 'voy, pero sobre medianoche quiero volver' },
        { type: 'wolf', text: 'cuanto más avanza la noche, mejor lo paso' },
        { type: 'dolphin', text: 'me apetece ir, pero temo el cansancio del día siguiente' },
      ],
    },
    {
      id: 'q9', text: 'Para crear o escribir, tu mejor momento es…',
      options: [
        { type: 'lion', text: 'muy temprano' },
        { type: 'bear', text: 'a media mañana' },
        { type: 'wolf', text: 'por la noche o de madrugada' },
        { type: 'dolphin', text: 'impredecible: a veces de noche, a veces al amanecer' },
      ],
    },
    {
      id: 'q10', text: '¿Cuánto dependes del café o la cafeína?',
      options: [
        { type: 'lion', text: 'Casi no la necesito' },
        { type: 'bear', text: 'Una o dos tazas por la mañana' },
        { type: 'wolf', text: 'También tomo por la tarde' },
        { type: 'dolphin', text: 'Sin ella no aguanto el día' },
      ],
    },
    {
      id: 'q11', text: 'De viaje, ¿cómo llevas el cambio de horario?',
      options: [
        { type: 'lion', text: 'Me ajusto rápido a la hora local' },
        { type: 'bear', text: 'Con unos días ya estoy bien' },
        { type: 'wolf', text: 'Incluso estoy mejor donde la vida es más nocturna' },
        { type: 'dolphin', text: 'Con o sin cambio horario, duermo mal igual' },
      ],
    },
    {
      id: 'q12', text: '¿Cuál es tu mejor hora para hacer deporte?',
      options: [
        { type: 'lion', text: 'Muy temprano' },
        { type: 'bear', text: 'A última hora de la mañana o al mediodía' },
        { type: 'wolf', text: 'A última hora de la tarde' },
        { type: 'dolphin', text: 'Después del deporte no me duermo o me quedo demasiado activado' },
      ],
    },
    {
      id: 'q13', text: '¿Tu hora ideal de acostarte?',
      options: [
        { type: 'lion', text: 'Entre las 21 y las 22' },
        { type: 'bear', text: 'Entre las 22 y las 23' },
        { type: 'wolf', text: 'Después de medianoche' },
        { type: 'dolphin', text: 'Me cuesta mantener una hora regular' },
      ],
    },
    {
      id: 'q14', text: '¿Qué opinas de la siesta?',
      options: [
        { type: 'lion', text: 'La siesta me estropea la noche' },
        { type: 'bear', text: '20 o 30 minutos me devuelven la tarde' },
        { type: 'wolf', text: 'Temo perder la tarde entera, así que la evito' },
        { type: 'dolphin', text: 'Me apetece, pero la siesta no me repone' },
      ],
    },
    {
      id: 'q15', text: 'Por la noche, mirando la lista de tareas, piensas…',
      options: [
        { type: 'lion', text: 'empezando pronto mañana, lo saco todo' },
        { type: 'bear', text: 'hago una parte esta noche y mañana lo cierro' },
        { type: 'wolf', text: 'de noche rindo mucho mejor' },
        { type: 'dolphin', text: 'me entra la preocupación y seguramente dormiré mal' },
      ],
    },
    {
      id: 'q16', text: '¿Cómo es tu sueño entre semana y el fin de semana?',
      options: [
        { type: 'lion', text: 'Casi igual' },
        { type: 'bear', text: 'El fin de semana me acuesto una o dos horas más tarde' },
        { type: 'wolf', text: 'El fin de semana mucho más tarde, y me levanto tarde' },
        { type: 'dolphin', text: 'Entre semana o el fin de semana, duermo mal igual' },
      ],
    },
  ],
}

const RESULTS: Record<Chronotype, Record<SupportedLang, ResultData>> = {
  lion: {
    ko: {
      title: '🦁 사자형',
      subtitle: '이른 아침을 지배하는 리더',
      description: '새벽에 가장 명료하고 생산적입니다. 목표 지향적이고 규칙적인 생활을 선호하며, 다른 사람들이 잠든 새벽에 최고의 성과를 냅니다.',
      optimalSleep: '오후 10시 ~ 오전 6시',
      traits: ['아침형 인간', '규칙적·예측 가능한 생활', '목표 지향적', '이른 저녁부터 에너지 저하'],
      tips: ['저녁 약속이 많은 사람들을 이해하는 마음 갖기', '늦은 야간 활동 시 이튿날 회복 시간 확보', '오후 2시 이후 카페인 자제', '취침 전 스크린 사용 최소화'],
    },
    en: {
      title: '🦁 Lion',
      subtitle: 'The early-morning leader',
      description: 'You are sharpest and most productive in the early hours. Goal-driven, disciplined, and consistent — you achieve your best work while others are still asleep.',
      optimalSleep: '10 PM – 6 AM',
      traits: ['True morning person', 'Consistent, predictable schedule', 'Goal-oriented achiever', 'Energy fades in the evening'],
      tips: ['Be patient with night owls in your life', 'Buffer recovery time after late-night events', 'Avoid caffeine after 2 PM', 'Minimize screens before your early bedtime'],
    },
    ja: {
      title: '🦁 ライオン型',
      subtitle: '早朝を制するリーダー',
      description: '早朝に最も明晰で生産性が高まります。目標志向で規律正しく、他の人が眠っている時間帯に最高のパフォーマンスを発揮します。',
      optimalSleep: '午後10時〜午前6時',
      traits: ['完全な朝型人間', '規則的で予測可能な生活', '目標志向', '夕方にエネルギーが低下'],
      tips: ['夜型の人への理解を深める', '遅い夜間活動後の翌日に回復時間を確保する', '午後2時以降のカフェインを控える', '早い就寝前のスクリーン使用を最小限に'],
    },
    zh: {
      title: '🦁 狮子型',
      subtitle: '主宰清晨的领导者',
      description: '你在清晨最清醒也最有产出。你目标感强，偏好规律的生活，在别人还在睡的时候做出最好的成绩。',
      optimalSleep: '晚上十点 ~ 早上六点',
      traits: ['早起型', '规律、可预期的生活', '目标导向', '傍晚起精神就开始下滑'],
      tips: ['对那些晚上有约的人，多一点体谅', '有夜间活动时，隔天记得留恢复的时间', '下午两点后别再碰咖啡因', '睡前尽量少看屏幕'],
    },
    fr: {
      title: '🦁 Lion',
      subtitle: 'Le meneur qui règne sur le petit matin',
      description: 'C’est à l’aube que vous êtes le plus clair et le plus productif. Orienté objectifs, vous préférez une vie régulière et donnez le meilleur pendant que les autres dorment.',
      optimalSleep: '22 h ~ 6 h',
      traits: ['Du matin', 'Vie régulière et prévisible', 'Orienté objectifs', 'L’énergie baisse dès le début de soirée'],
      tips: ['Comprendre ceux dont les rendez-vous sont le soir', 'Après une soirée tardive, prévoir un temps de récupération le lendemain', 'Éviter la caféine après 14 h', 'Réduire les écrans avant le coucher'],
    },
    es: {
      title: '🦁 León',
      subtitle: 'El líder que domina la madrugada',
      description: 'Es al amanecer cuando estás más lúcido y produces más. Orientado a metas, prefieres una vida regular y rindes al máximo mientras los demás duermen.',
      optimalSleep: '22:00 ~ 6:00',
      traits: ['Madrugador', 'Vida regular y previsible', 'Orientado a metas', 'La energía baja ya al caer la tarde'],
      tips: ['Comprender a quienes quedan por la noche', 'Tras una noche larga, reservar tiempo de recuperación al día siguiente', 'Evitar la cafeína después de las 14', 'Reducir pantallas antes de dormir'],
    },
  },
  bear: {
    ko: {
      title: '🐻 곰형',
      subtitle: '태양 리듬을 따르는 균형인',
      description: '가장 일반적인 수면 유형입니다. 사회적 리듬과 잘 맞고, 9–5 시스템에 자연스럽게 적응합니다. 유연하고 사교적인 성격으로 다양한 상황에 적응력이 높습니다.',
      optimalSleep: '오후 11시 ~ 오전 7시',
      traits: ['유연하고 적응력 높음', '사교적', '중간 수준의 안정적 생산성', '점심 후 에너지 소폭 저하'],
      tips: ['점심 후 에너지 저하 시 10–20분 파워냅이 효과적', '오전 중반 중요 업무 배치', '오후 1–3시 루틴 작업 처리', '주말 수면 과도한 연장 주의'],
    },
    en: {
      title: '🐻 Bear',
      subtitle: 'The balanced solar-rhythm follower',
      description: 'The most common chronotype. You sync naturally with the sun and social schedules, thriving in typical 9-to-5 structures. Adaptable, social, and consistently productive throughout the day.',
      optimalSleep: '11 PM – 7 AM',
      traits: ['Flexible and adaptable', 'Social and cooperative', 'Stable mid-range productivity', 'Slight energy dip after lunch'],
      tips: ['A 10–20 min power nap combats the post-lunch slump', 'Schedule important tasks for mid-morning', 'Use 1–3 PM for routine work', 'Avoid oversleeping on weekends'],
    },
    ja: {
      title: '🐻 クマ型',
      subtitle: '太陽のリズムに従うバランス型',
      description: '最も一般的なクロノタイプです。社会的なリズムや9–5のスケジュールに自然に合います。柔軟で社交的、安定した生産性を発揮します。',
      optimalSleep: '午後11時〜午前7時',
      traits: ['柔軟で適応力が高い', '社交的で協調性がある', '安定した中程度の生産性', '昼食後にエネルギーが少し低下'],
      tips: ['昼食後の眠気に10–20分のパワーナップが効果的', '重要な作業は午前中に配置', '午後1–3時はルーティン作業に', '週末の寝過ぎに注意'],
    },
    zh: {
      title: '🐻 熊型',
      subtitle: '跟着太阳走的均衡者',
      description: '这是最常见的一型。你和社会的节奏对得上，自然适应朝九晚五。性格灵活又好相处，对各种场合适应力强。',
      optimalSleep: '晚上十一点 ~ 早上七点',
      traits: ['灵活，适应力强', '好相处', '中等而稳定的产出', '午饭后精神会小幅下滑'],
      tips: ['午后犯困时，十到二十分钟的小睡很有效', '把重要的工作排在上午中段', '下午一到三点处理例行事务', '周末别把睡眠拉得太长'],
    },
    fr: {
      title: '🐻 Ours',
      subtitle: 'L’équilibré qui suit le rythme du soleil',
      description: 'C’est le chronotype le plus répandu. Vous êtes accordé au rythme social et vous adaptez naturellement à un horaire de bureau. Souple et sociable, vous vous adaptez à bien des situations.',
      optimalSleep: '23 h ~ 7 h',
      traits: ['Souple et adaptable', 'Sociable', 'Une productivité moyenne et stable', 'Légère baisse d’énergie après le déjeuner'],
      tips: ['En cas de coup de barre, une sieste de 10 à 20 minutes fait effet', 'Placer les tâches importantes en milieu de matinée', 'Traiter les tâches de routine entre 13 h et 15 h', 'Éviter de trop prolonger le sommeil le week-end'],
    },
    es: {
      title: '🐻 Oso',
      subtitle: 'El equilibrado que sigue el ritmo del sol',
      description: 'Es el cronotipo más común. Vas acompasado con el ritmo social y te adaptas con naturalidad al horario de oficina. Flexible y sociable, te amoldas a muchas situaciones.',
      optimalSleep: '23:00 ~ 7:00',
      traits: ['Flexible y adaptable', 'Sociable', 'Productividad media y estable', 'Ligera bajada después de comer'],
      tips: ['Si llega el bajón, una siesta de 10 a 20 minutos funciona', 'Colocar lo importante a media mañana', 'Dejar lo rutinario entre las 13 y las 15', 'No alargar demasiado el sueño el fin de semana'],
    },
  },
  wolf: {
    ko: {
      title: '🐺 늑대형',
      subtitle: '밤을 사랑하는 창의적 야행성',
      description: '저녁에 창의력과 에너지가 정점에 달합니다. 즉흥적이고 독창적인 성향이 강하며, 사회적 기대와 생체 리듬이 충돌할 수 있어 유연한 근무 환경이 이상적입니다.',
      optimalSleep: '자정 ~ 오전 8시',
      traits: ['창의적·즉흥적', '야행성', '저녁에 에너지 최고조', '아침 적응 느림'],
      tips: ['9–5 시스템이 어렵다면 유연 근무 활용', '커피는 오후 2시 전에만', '중요한 결정은 오전이 아닌 오후에', '수면 시간이 사회와 맞지 않아도 자신을 탓하지 말 것'],
    },
    en: {
      title: '🐺 Wolf',
      subtitle: 'The creative night owl',
      description: 'Your creativity and energy peak in the evening. Spontaneous and original, you thrive after sundown. The clash between your biology and social schedules can be real — flexible work arrangements are your best friend.',
      optimalSleep: 'Midnight – 8 AM',
      traits: ['Creative and spontaneous', 'Night owl by nature', 'Peak energy in the evening', 'Slow to adapt in the morning'],
      tips: ['Advocate for flexible hours if a 9–5 is draining you', 'Cut off caffeine by 2 PM', 'Reserve important decisions for afternoon', 'Your late schedule is biological, not a character flaw'],
    },
    ja: {
      title: '🐺 オオカミ型',
      subtitle: '夜を愛するクリエイティブな夜型',
      description: '夕方から夜にかけて創造力とエネルギーが最高潮になります。即興的で独創的な性格で、夜に最も輝きます。社会的スケジュールと生体リズムが合わないことがあるため、柔軟な働き方が理想的です。',
      optimalSleep: '深夜〜午前8時',
      traits: ['クリエイティブで即興的', '典型的な夜型', '夕方〜夜にエネルギーが最高潮', '朝の適応が遅い'],
      tips: ['9–5が辛ければフレックス勤務を活用する', 'カフェインは午後2時まで', '重要な判断は午後に', '夜型は性格の問題ではなく生物学的なもの'],
    },
    zh: {
      title: '🐺 狼型',
      subtitle: '爱着夜晚的创意夜行者',
      description: '你的创意和精力在晚上到达高点。你偏即兴、有独创性，社会的时间表和你的生理节奏容易打架，弹性的工作环境最适合你。',
      optimalSleep: '午夜 ~ 早上八点',
      traits: ['有创意、即兴', '夜行', '傍晚精力最旺', '早上启动慢'],
      tips: ['如果朝九晚五太难，尽量用弹性工时', '咖啡只在下午两点前喝', '重要的决定放在下午，而不是上午', '作息和社会对不上，别因此责怪自己'],
    },
    fr: {
      title: '🐺 Loup',
      subtitle: 'Le créatif nocturne qui aime la nuit',
      description: 'Votre créativité et votre énergie culminent le soir. Spontané et inventif, vous vivez souvent un décalage entre les attentes sociales et votre horloge : un cadre souple vous convient mieux.',
      optimalSleep: 'Minuit ~ 8 h',
      traits: ['Créatif et spontané', 'Nocturne', 'Énergie au sommet le soir', 'Démarrage lent le matin'],
      tips: ['Si le rythme de bureau est difficile, chercher des horaires souples', 'Le café seulement avant 14 h', 'Prendre les décisions importantes l’après-midi plutôt que le matin', 'Ne pas se reprocher un rythme qui ne colle pas à celui des autres'],
    },
    es: {
      title: '🐺 Lobo',
      subtitle: 'El creativo nocturno que ama la noche',
      description: 'Tu creatividad y tu energía llegan al máximo por la noche. Espontáneo e inventivo, sueles vivir un desfase entre lo que espera la sociedad y tu reloj interno: un marco flexible te viene mejor.',
      optimalSleep: 'Medianoche ~ 8:00',
      traits: ['Creativo y espontáneo', 'Nocturno', 'Energía máxima por la noche', 'Arranque lento por la mañana'],
      tips: ['Si el horario de oficina cuesta, busca flexibilidad', 'Café solo antes de las 14', 'Tomar las decisiones importantes por la tarde, no por la mañana', 'No culparte por un ritmo que no encaja con el de los demás'],
    },
  },
  dolphin: {
    ko: {
      title: '🐬 돌고래형',
      subtitle: '예민한 감각의 가벼운 잠꾼',
      description: '수면 효율이 낮고 불안 성향이 있어 쉽게 잠들거나 깊이 잠들기 어렵습니다. 지적이고 예민하며 완벽주의적 성향이 있습니다. 수면 위생 관리가 다른 유형보다 훨씬 중요합니다.',
      optimalSleep: '오전 11시 30분 ~ 오전 6시 30분 (권장)',
      traits: ['지적·예민·완벽주의', '수면 효율 낮음', '불안 성향', '낮 동안 피로 지속'],
      tips: ['취침 1시간 전 화면 끄기', '침실 온도 낮추기 (18–19°C)', '수면 루틴 엄격히 지키기', '카페인을 정오 이후 완전 차단', '수면 전문가 상담 고려'],
    },
    en: {
      title: '🐬 Dolphin',
      subtitle: 'The light, anxious sleeper',
      description: 'Light sleep efficiency, anxiety tendencies, and difficulty staying asleep characterize this type. Highly intelligent and perfectionistic, you are often alert when you should be asleep. Sleep hygiene is far more critical for you than for other types.',
      optimalSleep: '11:30 PM – 6:30 AM (recommended)',
      traits: ['Intellectual, sensitive, perfectionist', 'Low sleep efficiency', 'Anxiety-prone', 'Persistent daytime fatigue'],
      tips: ['Turn off all screens 1 hour before bed', 'Keep your bedroom cool (65–67°F / 18–19°C)', 'Maintain a strict sleep routine', 'Cut off caffeine entirely after noon', 'Consider consulting a sleep specialist'],
    },
    ja: {
      title: '🐬 イルカ型',
      subtitle: '繊細な感覚を持つ軽眠者',
      description: '睡眠効率が低く不安傾向があり、眠りにつくのも深く眠るのも難しいタイプです。知的で繊細な完璧主義者が多く、眠るべき時間に過覚醒になりがちです。睡眠衛生の管理が他のどのタイプよりも重要です。',
      optimalSleep: '午後11時30分〜午前6時30分（推奨）',
      traits: ['知的・繊細・完璧主義', '睡眠効率が低い', '不安傾向あり', '日中の疲労が続く'],
      tips: ['就寝1時間前にすべての画面をオフ', '寝室の温度を低めに保つ（18–19°C）', '厳格な睡眠ルーティンを維持', '正午以降のカフェインを完全にカット', '睡眠専門家への相談を検討'],
    },
    zh: {
      title: '🐬 海豚型',
      subtitle: '感觉敏锐的浅眠者',
      description: '你的睡眠效率偏低，也带点容易紧张的倾向，不容易入睡或睡得深。你聪明、敏感，也有完美主义的一面。睡眠卫生对你比其他型都更要紧。',
      optimalSleep: '早上十一点半 ~ 早上六点半（建议）',
      traits: ['聪明、敏感、完美主义', '睡眠效率低', '容易紧张', '白天疲惫感持续'],
      tips: ['睡前一小时关掉屏幕', '把卧室温度调低（18–19°C）', '严格守住睡前的固定流程', '中午之后完全不碰咖啡因', '考虑找睡眠专科咨询'],
    },
    fr: {
      title: '🐬 Dauphin',
      subtitle: 'Le dormeur léger, aux sens très fins',
      description: 'Votre efficacité de sommeil est faible et une tendance anxieuse rend l’endormissement et le sommeil profond difficiles. Vif et sensible, vous avez aussi un côté perfectionniste. L’hygiène de sommeil compte pour vous plus que pour les autres.',
      optimalSleep: '11 h 30 ~ 6 h 30 (recommandé)',
      traits: ['Vif, sensible, perfectionniste', 'Faible efficacité de sommeil', 'Tendance anxieuse', 'Fatigue persistante dans la journée'],
      tips: ['Éteindre les écrans une heure avant le coucher', 'Baisser la température de la chambre (18–19 °C)', 'Tenir strictement le rituel du coucher', 'Aucune caféine après midi', 'Envisager un avis auprès d’un spécialiste du sommeil'],
    },
    es: {
      title: '🐬 Delfín',
      subtitle: 'El de sueño ligero y sentidos finos',
      description: 'Tu eficiencia de sueño es baja y una tendencia a la inquietud hace difícil dormirte o dormir profundo. Despierto y sensible, también tienes un lado perfeccionista. La higiene del sueño te importa más que a otros tipos.',
      optimalSleep: '11:30 ~ 6:30 (recomendado)',
      traits: ['Despierto, sensible, perfeccionista', 'Baja eficiencia de sueño', 'Tendencia a la inquietud', 'Cansancio que se prolonga durante el día'],
      tips: ['Apagar pantallas una hora antes de dormir', 'Bajar la temperatura del dormitorio (18–19 °C)', 'Mantener con rigor el ritual de acostarte', 'Nada de cafeína después del mediodía', 'Valorar consultar a un especialista del sueño'],
    },
  },
}

const TYPE_COLORS: Record<Chronotype, string> = {
  lion: '#f59e0b',
  bear: '#84cc16',
  wolf: '#5B915F',
  dolphin: '#06b6d4',
}

interface Props { locale?: string; showHeading?: boolean }

export default function SleepChronotypeTest({ locale: lp = 'ko', showHeading = true }: Props) {
  const locale = lang(lp ?? 'ko')
  const lb = LABELS[locale]
  const questions = QUESTIONS[locale]

  // Restore a shared result directly from the URL (?type=wolf).
  const initType = (): Chronotype | null => {
    const c = readResultCode('type')
    return c && (['lion', 'bear', 'wolf', 'dolphin'] as string[]).includes(c) ? (c as Chronotype) : null
  }
  const restored = initType()
  const [current, setCurrent] = useState(restored ? questions.length : 0)
  const [counts, setCounts] = useState<Record<Chronotype, number>>({ lion: 0, bear: 0, wolf: 0, dolphin: 0 })
  const [result, setResult] = useState<Chronotype | null>(restored)
  useRecordFinishedTest({ testId: "sleep-chronotype", title: "SleepChronotypeTest", finished: Boolean(result) });

  function calcResult(c: Record<Chronotype, number>): Chronotype {
    const types: Chronotype[] = ['lion', 'bear', 'wolf', 'dolphin']
    return types.reduce((best, t) => c[t] > c[best] ? t : best, 'bear' as Chronotype)
  }

  function pick(type: Chronotype) {
    const newCounts = { ...counts, [type]: counts[type] + 1 }
    setCounts(newCounts)
    if (current + 1 >= questions.length) {
      setResult(calcResult(newCounts))
    }
    setCurrent(current + 1)
  }

  // Keep the URL in sync with the result so it is shareable/revisitable.
  useEffect(() => {
    if (result) writeResultCode('type', result)
  }, [result])

  function restart() {
    setCurrent(0)
    setCounts({ lion: 0, bear: 0, wolf: 0, dolphin: 0 })
    setResult(null)
    clearResultCode('type')
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
        <p className="text-sm text-muted-foreground leading-relaxed">{r.description}</p>
      </div>

      <div className="rounded-2xl border bg-card p-4 space-y-3">
        {(['lion', 'bear', 'wolf', 'dolphin'] as Chronotype[]).map((t) => {
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
        <h3 className="font-bold text-sm">{lb.optimalSleep}</h3>
        <p className="text-sm text-muted-foreground">{r.optimalSleep}</p>
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
        <h3 className="font-bold text-sm text-green-600">{lb.tips}</h3>
        <ul className="space-y-1">
          {r.tips.map(tip => (
            <li key={tip} className="text-sm text-muted-foreground flex gap-2">
              <span className="text-green-500">→</span>{tip}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-center text-xs text-muted-foreground">{lb.note}</p>

      <ShareResultButton
        locale={locale}
        heading={lb.title}
        resultTitle={r.title}
        emoji={{ lion: '🦁', bear: '🐻', wolf: '🐺', dolphin: '🐬' }[result]}
        description={r.subtitle}
      />
      <CopyResultLink locale={locale} />
      <ResultNextSteps
        locale={locale}
        links={[
          { href: `/${locale}/routine/builder/`, label: locale === 'ko' ? '📋 루틴 빌더' : locale === 'ja' ? '📋 ルーティンビルダー' : '📋 Routine builder' },
          { href: `/${locale}/habit-builder/30-days/`, label: locale === 'ko' ? '📅 30일 습관 만들기' : locale === 'ja' ? '📅 30日習慣づくり' : '📅 30-day habit builder' },
          { href: `/${locale}/burnout/test/`, label: locale === 'ko' ? '😰 번아웃 테스트' : locale === 'ja' ? '😰 バーンアウトテスト' : '😰 Burnout test' },
        ]}
      />

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
    </div>
  )
}
