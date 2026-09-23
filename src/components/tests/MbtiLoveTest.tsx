import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { Questionnaire } from '@/components/ui/questionnaire'
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip
} from 'recharts'
import ShareResultButton from '../shared/ShareResultButton'

// ─── Types ────────────────────────────────────────────────────────────────────
type Dim = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P'
type Score = Record<Dim, number>
type MBTIType =
  'INTJ'|'INTP'|'ENTJ'|'ENTP'|
  'INFJ'|'INFP'|'ENFJ'|'ENFP'|
  'ISTJ'|'ISFJ'|'ESTJ'|'ESFJ'|
  'ISTP'|'ISFP'|'ESTP'|'ESFP'

interface Option { text: string; score: Partial<Score> }
interface Question { id: string; text: string; options: Option[] }
interface ResultData {
  name: string
  loveStyle: string
  idealPartners: MBTIType[]
  loveLanguages: string[]
  strengths: string[]
  weaknesses: string[]
  datingTip: string
  cautionPoints: string[]
}

type Locale = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'

// ─── i18n Labels ──────────────────────────────────────────────────────────────
const LABELS: Record<Locale, {
  title: string; subtitle: string; instructions: string
  progress: (c: number, t: number) => string
  resultTitle: string; resultType: string
  loveStyle: string; idealPartners: string; loveLanguages: string
  strengths: string; weaknesses: string; datingTip: string; caution: string
  retake: string; share: string; copied: string
  chartEI: string; chartSN: string; chartTF: string; chartJP: string
}> = {
  ko: {
    title: 'MBTI 연애 유형 테스트',
    subtitle: '나는 어떤 연애를 하는 사람일까?',
    instructions: '연애할 때 또는 썸을 탈 때의 나를 떠올리며 솔직하게 답해주세요.',
    progress: (c, t) => `${c} / ${t}`,
    resultTitle: '나의 MBTI 연애 유형',
    resultType: '연애 유형',
    loveStyle: '연애 스타일',
    idealPartners: '잘 맞는 유형',
    loveLanguages: '사랑 표현 방식',
    strengths: '연애 강점',
    weaknesses: '연애 약점',
    datingTip: '연애 조언',
    caution: '주의할 점',
    retake: '다시 하기',
    share: '결과 공유',
    copied: '복사됨!',
    chartEI: '외향 ↔ 내향',
    chartSN: '감각 ↔ 직관',
    chartTF: '사고 ↔ 감정',
    chartJP: '판단 ↔ 인식',
  },
  en: {
    title: 'MBTI Love Type Test',
    subtitle: 'What kind of lover are you?',
    instructions: 'Think of how you act in a romantic relationship and answer honestly.',
    progress: (c, t) => `${c} of ${t}`,
    resultTitle: 'Your MBTI Love Type',
    resultType: 'Love Type',
    loveStyle: 'Love Style',
    idealPartners: 'Best Matches',
    loveLanguages: 'Love Languages',
    strengths: 'Relationship Strengths',
    weaknesses: 'Relationship Weaknesses',
    datingTip: 'Dating Advice',
    caution: 'Watch Out For',
    retake: 'Retake',
    share: 'Share Result',
    copied: 'Copied!',
    chartEI: 'E ↔ I',
    chartSN: 'S ↔ N',
    chartTF: 'T ↔ F',
    chartJP: 'J ↔ P',
  },
  ja: {
    title: 'MBTI 恋愛タイプテスト',
    subtitle: '私はどんな恋愛をする人？',
    instructions: '恋愛中や気になる人がいるときの自分を思い浮かべて答えてください。',
    progress: (c, t) => `${c} / ${t}`,
    resultTitle: '私のMBTI恋愛タイプ',
    resultType: '恋愛タイプ',
    loveStyle: '恋愛スタイル',
    idealPartners: '相性の良いタイプ',
    loveLanguages: '愛情表現',
    strengths: '恋愛での強み',
    weaknesses: '恋愛での弱み',
    datingTip: '恋愛アドバイス',
    caution: '注意すること',
    retake: 'もう一度',
    share: '結果をシェア',
    copied: 'コピーしました',
    chartEI: 'E ↔ I',
    chartSN: 'S ↔ N',
    chartTF: 'T ↔ F',
    chartJP: 'J ↔ P',
  },
  zh: {
    title: 'MBTI 恋爱类型测验',
    subtitle: '我是怎样谈恋爱的人？',
    instructions: '请回想恋爱中或暧昧期的自己，诚实作答。',
    progress: (c, t) => `${c} / ${t}`,
    resultTitle: '我的 MBTI 恋爱类型',
    resultType: '恋爱类型',
    loveStyle: '恋爱风格',
    idealPartners: '合得来的类型',
    loveLanguages: '表达爱的方式',
    strengths: '恋爱优势',
    weaknesses: '恋爱弱点',
    datingTip: '恋爱建议',
    caution: '需要留意',
    retake: '重新测验',
    share: '分享结果',
    copied: '已复制！',
    chartEI: '外向 ↔ 内向',
    chartSN: '实感 ↔ 直觉',
    chartTF: '思考 ↔ 情感',
    chartJP: '判断 ↔ 感知',
  },
  fr: {
    title: 'Test du type amoureux MBTI',
    subtitle: 'Quel genre d’amoureux suis-je ?',
    instructions: 'Pensez à vous en couple ou en pleine phase de séduction, et répondez franchement.',
    progress: (c, t) => `${c} / ${t}`,
    resultTitle: 'Mon type amoureux MBTI',
    resultType: 'Type amoureux',
    loveStyle: 'Style amoureux',
    idealPartners: 'Types compatibles',
    loveLanguages: 'Façons d’exprimer l’amour',
    strengths: 'Forces en amour',
    weaknesses: 'Faiblesses en amour',
    datingTip: 'Conseil amoureux',
    caution: 'Points de vigilance',
    retake: 'Recommencer',
    share: 'Partager le résultat',
    copied: 'Copié !',
    chartEI: 'Extraversion ↔ Introversion',
    chartSN: 'Sensation ↔ Intuition',
    chartTF: 'Pensée ↔ Sentiment',
    chartJP: 'Jugement ↔ Perception',
  },
  es: {
    title: 'Test del tipo amoroso MBTI',
    subtitle: '¿Qué clase de persona soy en el amor?',
    instructions: 'Piensa en cómo eres en pareja o cuando alguien te gusta, y responde con sinceridad.',
    progress: (c, t) => `${c} / ${t}`,
    resultTitle: 'Mi tipo amoroso MBTI',
    resultType: 'Tipo amoroso',
    loveStyle: 'Estilo amoroso',
    idealPartners: 'Tipos compatibles',
    loveLanguages: 'Formas de expresar amor',
    strengths: 'Fortalezas en el amor',
    weaknesses: 'Debilidades en el amor',
    datingTip: 'Consejo amoroso',
    caution: 'A tener en cuenta',
    retake: 'Repetir',
    share: 'Compartir resultado',
    copied: '¡Copiado!',
    chartEI: 'Extraversión ↔ Introversión',
    chartSN: 'Sensación ↔ Intuición',
    chartTF: 'Pensamiento ↔ Sentimiento',
    chartJP: 'Juicio ↔ Percepción',
  },
}

// ─── Questions ────────────────────────────────────────────────────────────────
const QUESTIONS: Record<Locale, Question[]> = {
  ko: [
    {
      id: 'q1', text: '연인과 주말을 보낼 때 내가 더 끌리는 것은?',
      options: [
        { text: '친구들과 함께하는 활기찬 모임에 연인을 데려간다', score: { E: 2 } },
        { text: '둘만의 조용한 공간에서 영화를 보며 시간을 보낸다', score: { I: 2 } },
        { text: '상대가 원하는 것을 먼저 물어보고 맞춰준다', score: { F: 1 } },
        { text: '미리 계획해 둔 데이트 코스를 따라 즐긴다', score: { J: 1 } },
      ],
    },
    {
      id: 'q2', text: '연인과 다툰 직후 내가 취하는 행동은?',
      options: [
        { text: '문제의 원인을 분석하고 논리적 해결책을 찾는다', score: { T: 2 } },
        { text: '상대방 감정을 먼저 헤아리고 공감해준다', score: { F: 2 } },
        { text: '혼자 생각을 정리할 시간이 필요하다', score: { I: 1 } },
        { text: '바로 대화로 풀어야 직성이 풀린다', score: { E: 1 } },
      ],
    },
    {
      id: 'q3', text: '나는 주로 이런 방식으로 사랑을 표현한다',
      options: [
        { text: '실질적인 도움과 배려 있는 행동으로', score: { S: 1, T: 1 } },
        { text: '진심 어린 말로 직접 "사랑해"라고 표현한다', score: { F: 2 } },
        { text: '스킨십과 함께하는 시간으로', score: { F: 1, E: 1 } },
        { text: '상대 관심사를 기억하고 깜짝 선물을 준다', score: { S: 1, J: 1 } },
      ],
    },
    {
      id: 'q4', text: '새로운 연인을 만날 때 나의 방식은?',
      options: [
        { text: '다양한 사람들을 만나며 자연스럽게 인연을 찾는다', score: { E: 2 } },
        { text: '소수의 깊은 인연 안에서 파트너를 찾는다', score: { I: 2 } },
        { text: '소개팅이나 공통 관심사 모임을 선호한다', score: { E: 1 } },
        { text: '천천히 관찰하며 신중하게 마음을 연다', score: { I: 1, J: 1 } },
      ],
    },
    {
      id: 'q5', text: '연인과 미래에 대해 이야기할 때 나는?',
      options: [
        { text: '결혼, 거주지 등 구체적 계획을 일찍부터 논의한다', score: { J: 2 } },
        { text: '관계가 자연스럽게 흘러가는 대로 두자는 주의다', score: { P: 2 } },
        { text: '두 사람이 공유하는 꿈과 비전에 대해 이야기한다', score: { N: 1 } },
        { text: '현재 함께하는 매 순간에 더 집중한다', score: { S: 1, P: 1 } },
      ],
    },
    {
      id: 'q6', text: '연인이 힘들어할 때 내가 먼저 하는 것은?',
      options: [
        { text: '문제 해결 방법을 함께 찾아준다', score: { T: 2 } },
        { text: '무조건 곁에 있어주며 공감해준다', score: { F: 2 } },
        { text: '재미있는 활동으로 기분 전환을 도와준다', score: { E: 1, P: 1 } },
        { text: '상대가 무엇을 원하는지 직접 물어본다', score: { F: 1 } },
      ],
    },
    {
      id: 'q7', text: '연인과의 데이트를 계획하는 내 스타일은?',
      options: [
        { text: '식당 예약부터 이동 경로까지 미리 모두 정해둔다', score: { J: 2 } },
        { text: '그날 기분에 따라 즉흥적으로 결정한다', score: { P: 2 } },
        { text: '큰 틀만 잡아두고 세부사항은 유연하게 간다', score: { J: 1, P: 1 } },
        { text: '상대방이 원하는 대로 따라간다', score: { F: 1 } },
      ],
    },
    {
      id: 'q8', text: '장기 연애에서 나에게 더 중요한 것은?',
      options: [
        { text: '안정적인 일상과 믿을 수 있는 루틴', score: { S: 2, J: 1 } },
        { text: '함께 새로운 경험을 계속 쌓아가는 것', score: { N: 1, P: 1 } },
        { text: '깊은 감정적 연결과 서로에 대한 이해', score: { F: 2 } },
        { text: '함께 성장하고 발전해가는 방향성', score: { N: 2, T: 1 } },
      ],
    },
    {
      id: 'q9', text: '중요한 연애 결정을 내릴 때 나는?',
      options: [
        { text: '장단점을 이성적으로 분석하고 결정한다', score: { T: 2 } },
        { text: '감정과 직관을 가장 중요하게 여긴다', score: { F: 2 } },
        { text: '가까운 친구나 가족의 의견도 구한다', score: { E: 1, F: 1 } },
        { text: '충분한 시간을 두고 천천히 결정한다', score: { I: 1, J: 1 } },
      ],
    },
    {
      id: 'q10', text: '내가 가장 좋아하는 데이트 장소 유형은?',
      options: [
        { text: '단골 카페나 좋아하는 레스토랑 같은 편안한 곳', score: { S: 2 } },
        { text: '새로 생긴 팝업스토어나 색다른 경험을 주는 곳', score: { N: 1, P: 1 } },
        { text: '조용하게 오래 이야기할 수 있는 아늑한 공간', score: { I: 1, F: 1 } },
        { text: '함께 활동적으로 즐길 수 있는 곳', score: { E: 1 } },
      ],
    },
    {
      id: 'q11', text: '관계에서 큰 갈등이 생겼을 때 나는?',
      options: [
        { text: '원인을 파악하고 재발 방지 방법을 함께 정한다', score: { J: 2, T: 1 } },
        { text: '감정이 가라앉을 때까지 자연스럽게 기다린다', score: { P: 2 } },
        { text: '솔직하게 대화해서 바로 해결하고 싶다', score: { E: 1, F: 1 } },
        { text: '왜 이런 문제가 생겼는지 깊이 탐색한다', score: { N: 1, I: 1 } },
      ],
    },
    {
      id: 'q12', text: '연애에서 나만의 공간·시간에 대해 나는?',
      options: [
        { text: '재충전을 위한 혼자만의 시간이 반드시 필요하다', score: { I: 2 } },
        { text: '함께 있는 시간이 많을수록 더 행복하다', score: { E: 2 } },
        { text: '함께하되 각자의 취미 생활도 존중받고 싶다', score: { I: 1, P: 1 } },
        { text: '처음부터 서로의 공간 규칙을 정하는 것이 좋다', score: { J: 1 } },
      ],
    },
  ],
  en: [
    {
      id: 'q1', text: 'How do you prefer to spend the weekend with your partner?',
      options: [
        { text: 'Bring them along to a fun group outing with friends', score: { E: 2 } },
        { text: 'Stay in together, just the two of you, watching movies', score: { I: 2 } },
        { text: 'Ask what they want to do and follow their lead', score: { F: 1 } },
        { text: 'Follow a planned date itinerary you prepared in advance', score: { J: 1 } },
      ],
    },
    {
      id: 'q2', text: 'Right after an argument with your partner, you…',
      options: [
        { text: 'Analyze what went wrong and find a logical solution', score: { T: 2 } },
        { text: 'Focus on understanding their feelings first', score: { F: 2 } },
        { text: 'Need time alone to gather your thoughts', score: { I: 1 } },
        { text: 'Want to resolve it through immediate conversation', score: { E: 1 } },
      ],
    },
    {
      id: 'q3', text: 'How do you mainly express your love?',
      options: [
        { text: 'Through practical help and thoughtful actions', score: { S: 1, T: 1 } },
        { text: 'By saying "I love you" directly and sincerely', score: { F: 2 } },
        { text: 'Through physical affection and quality time together', score: { F: 1, E: 1 } },
        { text: 'By remembering their interests and surprising them with gifts', score: { S: 1, J: 1 } },
      ],
    },
    {
      id: 'q4', text: 'When meeting a potential new partner, you tend to…',
      options: [
        { text: 'Meet lots of people and let things happen naturally', score: { E: 2 } },
        { text: 'Find connections within a small, close-knit circle', score: { I: 2 } },
        { text: 'Prefer arranged meetings or shared-interest groups', score: { E: 1 } },
        { text: 'Observe carefully and open up slowly and deliberately', score: { I: 1, J: 1 } },
      ],
    },
    {
      id: 'q5', text: 'When discussing the future with your partner, you…',
      options: [
        { text: 'Discuss concrete plans like marriage and housing early on', score: { J: 2 } },
        { text: 'Prefer letting the relationship unfold naturally', score: { P: 2 } },
        { text: 'Talk about shared dreams and big-picture vision', score: { N: 1 } },
        { text: 'Focus on enjoying each present moment together', score: { S: 1, P: 1 } },
      ],
    },
    {
      id: 'q6', text: 'When your partner is struggling, your first instinct is to…',
      options: [
        { text: 'Help them find a practical solution to the problem', score: { T: 2 } },
        { text: 'Simply be there and listen with empathy', score: { F: 2 } },
        { text: 'Distract them with something fun to lift their mood', score: { E: 1, P: 1 } },
        { text: 'Ask what they need and act accordingly', score: { F: 1 } },
      ],
    },
    {
      id: 'q7', text: 'How do you approach planning a date?',
      options: [
        { text: 'Plan everything in advance: restaurant, route, timing', score: { J: 2 } },
        { text: 'Decide spontaneously based on the mood that day', score: { P: 2 } },
        { text: 'Set a rough outline and stay flexible on details', score: { J: 1, P: 1 } },
        { text: 'Let your partner decide and just go along', score: { F: 1 } },
      ],
    },
    {
      id: 'q8', text: 'In a long-term relationship, what matters more to you?',
      options: [
        { text: 'A stable routine and someone you can rely on', score: { S: 2, J: 1 } },
        { text: 'Constantly sharing new experiences together', score: { N: 1, P: 1 } },
        { text: 'Deep emotional connection and mutual understanding', score: { F: 2 } },
        { text: 'Growing and evolving together toward shared goals', score: { N: 2, T: 1 } },
      ],
    },
    {
      id: 'q9', text: 'When making an important relationship decision, you…',
      options: [
        { text: 'Weigh the pros and cons logically', score: { T: 2 } },
        { text: 'Trust your emotions and intuition above all', score: { F: 2 } },
        { text: 'Seek input from close friends or family', score: { E: 1, F: 1 } },
        { text: 'Take plenty of time before deciding', score: { I: 1, J: 1 } },
      ],
    },
    {
      id: 'q10', text: 'What kind of date spot do you enjoy most?',
      options: [
        { text: 'A familiar café or favorite restaurant — comfortable and cozy', score: { S: 2 } },
        { text: 'A new pop-up or unique experience you\'ve never tried', score: { N: 1, P: 1 } },
        { text: 'A quiet place where you can talk for hours', score: { I: 1, F: 1 } },
        { text: 'Somewhere active where you can do things together', score: { E: 1 } },
      ],
    },
    {
      id: 'q11', text: 'When a big conflict arises in the relationship, you…',
      options: [
        { text: 'Identify the cause and agree on how to prevent it recurring', score: { J: 2, T: 1 } },
        { text: 'Wait for things to cool down on their own', score: { P: 2 } },
        { text: 'Have an open conversation to resolve it right away', score: { E: 1, F: 1 } },
        { text: 'Explore the deeper root of why it happened', score: { N: 1, I: 1 } },
      ],
    },
    {
      id: 'q12', text: 'Regarding personal space in a relationship, you…',
      options: [
        { text: 'Absolutely need alone time to recharge', score: { I: 2 } },
        { text: 'Are happiest when you spend as much time together as possible', score: { E: 2 } },
        { text: 'Want to be together but also respect each other\'s hobbies', score: { I: 1, P: 1 } },
        { text: 'Prefer setting clear boundaries and routines from the start', score: { J: 1 } },
      ],
    },
  ],
  ja: [
    {
      id: 'q1', text: '恋人と週末を過ごすとき、あなたが惹かれるのは？',
      options: [
        { text: '友達との賑やかな集まりに恋人を連れて行く', score: { E: 2 } },
        { text: '二人だけの静かな空間で映画を見て過ごす', score: { I: 2 } },
        { text: '相手が何をしたいか先に聞いて合わせる', score: { F: 1 } },
        { text: '事前に計画したデートコースを楽しむ', score: { J: 1 } },
      ],
    },
    {
      id: 'q2', text: '恋人と喧嘩した直後、あなたがとる行動は？',
      options: [
        { text: '問題の原因を分析し、論理的な解決策を見つける', score: { T: 2 } },
        { text: '相手の気持ちを先に察して共感する', score: { F: 2 } },
        { text: '一人で考えをまとめる時間が必要', score: { I: 1 } },
        { text: 'すぐ話し合って解決したい', score: { E: 1 } },
      ],
    },
    {
      id: 'q3', text: '主にこんな方法で愛情を表現する',
      options: [
        { text: '実用的なサポートと思いやりのある行動で', score: { S: 1, T: 1 } },
        { text: '「好きだよ」と直接言葉で伝える', score: { F: 2 } },
        { text: 'スキンシップと一緒に過ごす時間で', score: { F: 1, E: 1 } },
        { text: '相手の関心を覚えて、サプライズプレゼントをする', score: { S: 1, J: 1 } },
      ],
    },
    {
      id: 'q4', text: '新しい恋人と出会うときのスタイルは？',
      options: [
        { text: '多くの人と会って自然に縁を探す', score: { E: 2 } },
        { text: '少数の深い縁の中でパートナーを見つける', score: { I: 2 } },
        { text: '合コンや共通の趣味サークルが好き', score: { E: 1 } },
        { text: 'ゆっくり観察しながら慎重に心を開く', score: { I: 1, J: 1 } },
      ],
    },
    {
      id: 'q5', text: '恋人と将来について話すとき、あなたは？',
      options: [
        { text: '結婚や住む場所など具体的な計画を早めに話し合う', score: { J: 2 } },
        { text: '関係が自然に流れるままにしたい派', score: { P: 2 } },
        { text: '二人が共有する夢やビジョンについて話す', score: { N: 1 } },
        { text: '今ともに過ごす一瞬一瞬に集中する', score: { S: 1, P: 1 } },
      ],
    },
    {
      id: 'q6', text: '恋人がつらそうなとき、まず最初にすることは？',
      options: [
        { text: '一緒に問題解決の方法を探す', score: { T: 2 } },
        { text: 'とにかくそばにいて共感する', score: { F: 2 } },
        { text: '楽しい活動で気分転換を助ける', score: { E: 1, P: 1 } },
        { text: '相手が何を求めているか直接聞く', score: { F: 1 } },
      ],
    },
    {
      id: 'q7', text: 'デートの計画を立てるスタイルは？',
      options: [
        { text: 'レストランの予約からルートまで全て事前に決める', score: { J: 2 } },
        { text: 'その日の気分に合わせて即興で決める', score: { P: 2 } },
        { text: '大枠だけ決めて細かいことは柔軟に', score: { J: 1, P: 1 } },
        { text: '相手の希望に合わせて従う', score: { F: 1 } },
      ],
    },
    {
      id: 'q8', text: '長期的な恋愛で大切なのは？',
      options: [
        { text: '安定した日常と信頼できるルーティン', score: { S: 2, J: 1 } },
        { text: '一緒に新しい体験を積み重ねること', score: { N: 1, P: 1 } },
        { text: '深い感情的なつながりと理解', score: { F: 2 } },
        { text: '共に成長・発展していく方向性', score: { N: 2, T: 1 } },
      ],
    },
    {
      id: 'q9', text: '大切な恋愛の決断を下すとき、あなたは？',
      options: [
        { text: '長所・短所を論理的に分析して決める', score: { T: 2 } },
        { text: '感情と直感を最も重視する', score: { F: 2 } },
        { text: '親しい友人や家族の意見も聞く', score: { E: 1, F: 1 } },
        { text: '十分な時間をかけてゆっくり決める', score: { I: 1, J: 1 } },
      ],
    },
    {
      id: 'q10', text: '好きなデートスポットは？',
      options: [
        { text: 'お気に入りのカフェやレストランなど落ち着く場所', score: { S: 2 } },
        { text: '新しいポップアップや珍しい体験ができる場所', score: { N: 1, P: 1 } },
        { text: '静かにゆっくり話せる居心地のよい空間', score: { I: 1, F: 1 } },
        { text: '一緒にアクティブに楽しめる場所', score: { E: 1 } },
      ],
    },
    {
      id: 'q11', text: '関係で大きな衝突が起きたとき、あなたは？',
      options: [
        { text: '原因を把握し、再発防止策を一緒に決める', score: { J: 2, T: 1 } },
        { text: '感情が落ち着くまで自然に待つ', score: { P: 2 } },
        { text: '率直に話し合ってすぐ解決したい', score: { E: 1, F: 1 } },
        { text: 'なぜこんな問題が起きたか深く掘り下げる', score: { N: 1, I: 1 } },
      ],
    },
    {
      id: 'q12', text: '恋愛における個人の空間について、あなたは？',
      options: [
        { text: '充電のための一人の時間が絶対に必要', score: { I: 2 } },
        { text: '一緒にいる時間が多ければ多いほど幸せ', score: { E: 2 } },
        { text: '一緒にいながら、それぞれの趣味も尊重してほしい', score: { I: 1, P: 1 } },
        { text: '最初からお互いの空間ルールを決めるのが好き', score: { J: 1 } },
      ],
    },
  ],
  zh: [
    {
      id: 'q1', text: '和恋人过周末时，我更被什么吸引？',
      options: [
        { text: '带恋人去参加和朋友们的热闹聚会', score: { E: 2 } },
        { text: '在只有两人的安静空间看电影', score: { I: 2 } },
        { text: '先问对方想做什么，再配合对方', score: { F: 1 } },
        { text: '按照事先计划好的约会路线享受', score: { J: 1 } },
      ],
    },
    {
      id: 'q2', text: '和恋人吵架后，我会？',
      options: [
        { text: '分析问题原因，找出合乎逻辑的解法', score: { T: 2 } },
        { text: '先体会对方的感受，表示理解', score: { F: 2 } },
        { text: '需要独自整理思绪的时间', score: { I: 1 } },
        { text: '要马上谈开才舒服', score: { E: 1 } },
      ],
    },
    {
      id: 'q3', text: '我通常这样表达爱',
      options: [
        { text: '用实际的帮助和体贴的行动', score: { S: 1, T: 1 } },
        { text: '用真心的话直接说“我爱你”', score: { F: 2 } },
        { text: '用肢体接触和相处的时间', score: { F: 1, E: 1 } },
        { text: '记住对方的兴趣，送上惊喜礼物', score: { S: 1, J: 1 } },
      ],
    },
    {
      id: 'q4', text: '认识新恋人时，我的方式是？',
      options: [
        { text: '见各种各样的人，自然地找到缘分', score: { E: 2 } },
        { text: '在少数深厚的关系里找伴侣', score: { I: 2 } },
        { text: '偏好相亲或共同兴趣的聚会', score: { E: 1 } },
        { text: '慢慢观察，谨慎地敞开心扉', score: { I: 1, J: 1 } },
      ],
    },
    {
      id: 'q5', text: '和恋人聊未来时，我会？',
      options: [
        { text: '很早就讨论结婚、住处等具体计划', score: { J: 2 } },
        { text: '主张让关系顺其自然', score: { P: 2 } },
        { text: '谈两人共同的梦想和愿景', score: { N: 1 } },
        { text: '更专注于在一起的每个当下', score: { S: 1, P: 1 } },
      ],
    },
    {
      id: 'q6', text: '恋人难过时，我会先？',
      options: [
        { text: '一起找解决问题的办法', score: { T: 2 } },
        { text: '无条件陪在身边，表示理解', score: { F: 2 } },
        { text: '用有趣的活动帮对方转换心情', score: { E: 1, P: 1 } },
        { text: '直接问对方想要什么', score: { F: 1 } },
      ],
    },
    {
      id: 'q7', text: '我规划约会的风格是？',
      options: [
        { text: '从餐厅预约到移动路线，全都事先定好', score: { J: 2 } },
        { text: '当天看心情即兴决定', score: { P: 2 } },
        { text: '只定大框架，细节保持弹性', score: { J: 1, P: 1 } },
        { text: '跟着对方想要的来', score: { F: 1 } },
      ],
    },
    {
      id: 'q8', text: '长期恋爱中，对我更重要的是？',
      options: [
        { text: '稳定的日常和可靠的习惯', score: { S: 2, J: 1 } },
        { text: '一起不断累积新的体验', score: { N: 1, P: 1 } },
        { text: '深刻的情感连结和对彼此的理解', score: { F: 2 } },
        { text: '一起成长进步的方向', score: { N: 2, T: 1 } },
      ],
    },
    {
      id: 'q9', text: '做重要的恋爱决定时，我会？',
      options: [
        { text: '理性分析利弊后决定', score: { T: 2 } },
        { text: '把情感和直觉看得最重', score: { F: 2 } },
        { text: '也会征求亲近的朋友或家人的意见', score: { E: 1, F: 1 } },
        { text: '留足时间，慢慢决定', score: { I: 1, J: 1 } },
      ],
    },
    {
      id: 'q10', text: '我最喜欢的约会地点类型是？',
      options: [
        { text: '常去的咖啡馆或喜欢的餐厅这类舒服的地方', score: { S: 2 } },
        { text: '新开的快闪店或能带来新鲜体验的地方', score: { N: 1, P: 1 } },
        { text: '能安静地久聊的温馨空间', score: { I: 1, F: 1 } },
        { text: '能一起活跃地玩的地方', score: { E: 1 } },
      ],
    },
    {
      id: 'q11', text: '关系中发生大冲突时，我会？',
      options: [
        { text: '找出原因，一起定下防止再发生的办法', score: { J: 2, T: 1 } },
        { text: '自然地等情绪平复下来', score: { P: 2 } },
        { text: '想坦率地谈，马上解决', score: { E: 1, F: 1 } },
        { text: '深入探究为什么会出现这个问题', score: { N: 1, I: 1 } },
      ],
    },
    {
      id: 'q12', text: '对于恋爱中属于自己的空间和时间，我……',
      options: [
        { text: '一定需要独处的时间来充电', score: { I: 2 } },
        { text: '在一起的时间越多越幸福', score: { E: 2 } },
        { text: '在一起的同时，也希望各自的兴趣被尊重', score: { I: 1, P: 1 } },
        { text: '一开始就定好彼此的空间规则比较好', score: { J: 1 } },
      ],
    },
  ],
  fr: [
    {
      id: 'q1', text: 'Pour un week-end en couple, qu’est-ce qui m’attire le plus ?',
      options: [
        { text: 'Emmener mon/ma partenaire à une soirée animée entre amis', score: { E: 2 } },
        { text: 'Regarder un film au calme, rien que nous deux', score: { I: 2 } },
        { text: 'Demander d’abord ce que l’autre veut et m’adapter', score: { F: 1 } },
        { text: 'Profiter d’une sortie planifiée à l’avance', score: { J: 1 } },
      ],
    },
    {
      id: 'q2', text: 'Juste après une dispute, je…',
      options: [
        { text: 'Analyse la cause et cherche une solution logique', score: { T: 2 } },
        { text: 'Accueille d’abord les émotions de l’autre avec empathie', score: { F: 2 } },
        { text: 'Ai besoin de temps seul pour mettre mes idées au clair', score: { I: 1 } },
        { text: 'Dois en parler tout de suite pour être apaisé', score: { E: 1 } },
      ],
    },
    {
      id: 'q3', text: 'J’exprime surtout mon amour…',
      options: [
        { text: 'Par une aide concrète et des gestes attentionnés', score: { S: 1, T: 1 } },
        { text: 'En disant sincèrement « je t’aime »', score: { F: 2 } },
        { text: 'Par la tendresse et le temps passé ensemble', score: { F: 1, E: 1 } },
        { text: 'En me souvenant de ses passions et en lui faisant la surprise d’un cadeau', score: { S: 1, J: 1 } },
      ],
    },
    {
      id: 'q4', text: 'Pour rencontrer quelqu’un, ma façon de faire :',
      options: [
        { text: 'Voir beaucoup de monde et laisser la rencontre se faire', score: { E: 2 } },
        { text: 'Chercher un partenaire parmi quelques liens profonds', score: { I: 2 } },
        { text: 'Préférer les rencontres arrangées ou les groupes d’intérêts communs', score: { E: 1 } },
        { text: 'Observer lentement et m’ouvrir avec prudence', score: { I: 1, J: 1 } },
      ],
    },
    {
      id: 'q5', text: 'Quand on parle d’avenir, je…',
      options: [
        { text: 'Discute tôt de projets concrets : mariage, lieu de vie', score: { J: 2 } },
        { text: 'Préfère laisser la relation suivre son cours', score: { P: 2 } },
        { text: 'Parle de nos rêves et de notre vision communs', score: { N: 1 } },
        { text: 'Me concentre davantage sur chaque instant partagé', score: { S: 1, P: 1 } },
      ],
    },
    {
      id: 'q6', text: 'Quand mon/ma partenaire va mal, je commence par…',
      options: [
        { text: 'Chercher avec lui/elle comment régler le problème', score: { T: 2 } },
        { text: 'Rester à ses côtés, sans condition, avec empathie', score: { F: 2 } },
        { text: 'L’aider à se changer les idées avec une activité amusante', score: { E: 1, P: 1 } },
        { text: 'Lui demander directement ce dont il/elle a besoin', score: { F: 1 } },
      ],
    },
    {
      id: 'q7', text: 'Mon style pour organiser un rendez-vous :',
      options: [
        { text: 'Tout prévoir, de la réservation au trajet', score: { J: 2 } },
        { text: 'Décider sur le moment, selon l’humeur', score: { P: 2 } },
        { text: 'Fixer les grandes lignes et rester souple sur les détails', score: { J: 1, P: 1 } },
        { text: 'Suivre ce que veut l’autre', score: { F: 1 } },
      ],
    },
    {
      id: 'q8', text: 'Dans une relation longue, ce qui compte le plus pour moi :',
      options: [
        { text: 'Un quotidien stable et des routines fiables', score: { S: 2, J: 1 } },
        { text: 'Continuer à vivre de nouvelles expériences ensemble', score: { N: 1, P: 1 } },
        { text: 'Un lien émotionnel profond et la compréhension mutuelle', score: { F: 2 } },
        { text: 'Une direction commune pour grandir et progresser', score: { N: 2, T: 1 } },
      ],
    },
    {
      id: 'q9', text: 'Pour une décision amoureuse importante, je…',
      options: [
        { text: 'Pèse rationnellement le pour et le contre', score: { T: 2 } },
        { text: 'Accorde la plus grande importance à mes émotions et à mon intuition', score: { F: 2 } },
        { text: 'Demande aussi l’avis d’amis proches ou de ma famille', score: { E: 1, F: 1 } },
        { text: 'Prends le temps et décide lentement', score: { I: 1, J: 1 } },
      ],
    },
    {
      id: 'q10', text: 'Mon type de lieu de rendez-vous préféré :',
      options: [
        { text: 'Un endroit confortable, comme notre café ou restaurant préféré', score: { S: 2 } },
        { text: 'Une boutique éphémère ou un lieu qui offre une expérience inédite', score: { N: 1, P: 1 } },
        { text: 'Un espace cosy où parler longtemps au calme', score: { I: 1, F: 1 } },
        { text: 'Un endroit où l’on peut faire des activités ensemble', score: { E: 1 } },
      ],
    },
    {
      id: 'q11', text: 'Quand un gros conflit éclate, je…',
      options: [
        { text: 'Cherche la cause et convient avec l’autre de comment éviter que ça se reproduise', score: { J: 2, T: 1 } },
        { text: 'Attends naturellement que les émotions retombent', score: { P: 2 } },
        { text: 'Veux en parler franchement et régler ça tout de suite', score: { E: 1, F: 1 } },
        { text: 'Explore en profondeur pourquoi ce problème est apparu', score: { N: 1, I: 1 } },
      ],
    },
    {
      id: 'q12', text: 'Au sujet de mon espace et de mon temps à moi en couple :',
      options: [
        { text: 'J’ai absolument besoin de temps seul pour me ressourcer', score: { I: 2 } },
        { text: 'Plus on passe de temps ensemble, plus je suis heureux', score: { E: 2 } },
        { text: 'Être ensemble, mais que nos loisirs respectifs soient respectés', score: { I: 1, P: 1 } },
        { text: 'Mieux vaut fixer dès le début des règles sur l’espace de chacun', score: { J: 1 } },
      ],
    },
  ],
  es: [
    {
      id: 'q1', text: 'Para un fin de semana en pareja, ¿qué me atrae más?',
      options: [
        { text: 'Llevar a mi pareja a una quedada animada con amigos', score: { E: 2 } },
        { text: 'Ver una película tranquilos, solos los dos', score: { I: 2 } },
        { text: 'Preguntar primero qué quiere el otro y adaptarme', score: { F: 1 } },
        { text: 'Disfrutar de un plan de cita organizado de antemano', score: { J: 1 } },
      ],
    },
    {
      id: 'q2', text: 'Justo después de una discusión, yo…',
      options: [
        { text: 'Analizo la causa y busco una solución lógica', score: { T: 2 } },
        { text: 'Primero comprendo cómo se siente el otro', score: { F: 2 } },
        { text: 'Necesito tiempo a solas para ordenar mis ideas', score: { I: 1 } },
        { text: 'Necesito hablarlo enseguida para quedarme tranquilo', score: { E: 1 } },
      ],
    },
    {
      id: 'q3', text: 'Suelo expresar el amor…',
      options: [
        { text: 'Con ayuda práctica y gestos considerados', score: { S: 1, T: 1 } },
        { text: 'Diciendo «te quiero» de corazón', score: { F: 2 } },
        { text: 'Con contacto físico y tiempo juntos', score: { F: 1, E: 1 } },
        { text: 'Recordando lo que le gusta y dándole un regalo sorpresa', score: { S: 1, J: 1 } },
      ],
    },
    {
      id: 'q4', text: 'Para conocer a alguien, mi forma es…',
      options: [
        { text: 'Conocer a mucha gente y que surja de forma natural', score: { E: 2 } },
        { text: 'Buscar pareja entre pocas relaciones profundas', score: { I: 2 } },
        { text: 'Preferir citas a ciegas o grupos de intereses comunes', score: { E: 1 } },
        { text: 'Observar despacio y abrirme con cautela', score: { I: 1, J: 1 } },
      ],
    },
    {
      id: 'q5', text: 'Cuando hablamos del futuro, yo…',
      options: [
        { text: 'Hablo pronto de planes concretos: boda, dónde vivir', score: { J: 2 } },
        { text: 'Prefiero dejar que la relación fluya', score: { P: 2 } },
        { text: 'Hablo de los sueños y la visión que compartimos', score: { N: 1 } },
        { text: 'Me centro más en cada momento que vivimos juntos', score: { S: 1, P: 1 } },
      ],
    },
    {
      id: 'q6', text: 'Cuando mi pareja lo pasa mal, lo primero que hago es…',
      options: [
        { text: 'Buscar juntos cómo resolver el problema', score: { T: 2 } },
        { text: 'Quedarme a su lado sin condiciones y comprenderle', score: { F: 2 } },
        { text: 'Ayudarle a despejarse con algo divertido', score: { E: 1, P: 1 } },
        { text: 'Preguntarle directamente qué necesita', score: { F: 1 } },
      ],
    },
    {
      id: 'q7', text: 'Mi estilo para planear una cita…',
      options: [
        { text: 'Lo dejo todo decidido, desde la reserva hasta el trayecto', score: { J: 2 } },
        { text: 'Decido sobre la marcha según el ánimo del día', score: { P: 2 } },
        { text: 'Fijo lo general y dejo flexibles los detalles', score: { J: 1, P: 1 } },
        { text: 'Sigo lo que quiera el otro', score: { F: 1 } },
      ],
    },
    {
      id: 'q8', text: 'En una relación larga, lo más importante para mí es…',
      options: [
        { text: 'Una rutina estable y costumbres fiables', score: { S: 2, J: 1 } },
        { text: 'Seguir acumulando experiencias nuevas juntos', score: { N: 1, P: 1 } },
        { text: 'Una conexión emocional profunda y comprensión mutua', score: { F: 2 } },
        { text: 'Una dirección común para crecer y avanzar', score: { N: 2, T: 1 } },
      ],
    },
    {
      id: 'q9', text: 'Ante una decisión amorosa importante, yo…',
      options: [
        { text: 'Analizo con la razón los pros y los contras', score: { T: 2 } },
        { text: 'Doy la máxima importancia a la emoción y la intuición', score: { F: 2 } },
        { text: 'También pido opinión a amigos cercanos o a la familia', score: { E: 1, F: 1 } },
        { text: 'Me tomo tiempo y decido despacio', score: { I: 1, J: 1 } },
      ],
    },
    {
      id: 'q10', text: 'Mi tipo de lugar favorito para una cita…',
      options: [
        { text: 'Un sitio cómodo, como nuestra cafetería o restaurante de siempre', score: { S: 2 } },
        { text: 'Una tienda efímera o un lugar con una experiencia diferente', score: { N: 1, P: 1 } },
        { text: 'Un espacio acogedor para charlar mucho rato con calma', score: { I: 1, F: 1 } },
        { text: 'Un lugar donde hacer actividades juntos', score: { E: 1 } },
      ],
    },
    {
      id: 'q11', text: 'Cuando surge un conflicto grande, yo…',
      options: [
        { text: 'Busco la causa y acordamos cómo evitar que se repita', score: { J: 2, T: 1 } },
        { text: 'Espero con naturalidad a que se calmen las emociones', score: { P: 2 } },
        { text: 'Quiero hablarlo con franqueza y resolverlo ya', score: { E: 1, F: 1 } },
        { text: 'Exploro a fondo por qué surgió el problema', score: { N: 1, I: 1 } },
      ],
    },
    {
      id: 'q12', text: 'Sobre mi espacio y mi tiempo propios en la relación…',
      options: [
        { text: 'Necesito sí o sí tiempo a solas para recargarme', score: { I: 2 } },
        { text: 'Cuanto más tiempo juntos, más feliz soy', score: { E: 2 } },
        { text: 'Estar juntos, pero que se respeten las aficiones de cada uno', score: { I: 1, P: 1 } },
        { text: 'Mejor fijar desde el principio normas sobre el espacio de cada uno', score: { J: 1 } },
      ],
    },
  ],
}

// ─── Results Data ─────────────────────────────────────────────────────────────
const RESULTS: Record<Locale, Record<MBTIType, ResultData>> = {
  ko: {
    INTJ: {
      name: '전략적 로맨티스트',
      loveStyle: '독립적이고 신중하게 사랑을 선택하지만, 한 번 마음을 열면 깊고 헌신적인 파트너가 됩니다. 감정보다 행동으로 사랑을 증명하는 유형입니다.',
      idealPartners: ['ENFP', 'ENTP'],
      loveLanguages: ['인정하는 말', '함께하는 시간'],
      strengths: ['깊은 충성심과 헌신', '지적 대화로 관계 성장', '장기적이고 안정적인 파트너십'],
      weaknesses: ['감정 표현이 서툶', '완벽주의적 기대로 갈등 유발', '혼자만의 시간 필요로 인한 오해'],
      datingTip: '감사함과 애정을 직접 말로 표현하는 연습을 해보세요. 행동만으로는 상대에게 충분히 전달되지 않을 수 있습니다.',
      cautionPoints: ['감정 표현 부족으로 인한 거리감', '지나치게 높은 기준 설정'],
    },
    INTP: {
      name: '철학적 동반자',
      loveStyle: '지적 연결을 사랑의 기반으로 삼으며, 서로를 진정으로 이해하고 성장하는 동반자 관계를 추구합니다.',
      idealPartners: ['ENTJ', 'ENFJ'],
      loveLanguages: ['인정하는 말', '함께하는 시간'],
      strengths: ['깊은 이해와 수용', '유연하고 비판단적인 태도', '창의적이고 흥미로운 대화'],
      weaknesses: ['감정 표현 어려움', '즉흥적 결정 불편', '현실적 세부 배려 소홀'],
      datingTip: '상대방의 감정적 필요를 논리로 분석하기 전에 먼저 공감해주는 연습을 해보세요.',
      cautionPoints: ['감정보다 분석이 앞서 상대를 차갑게 느끼게 할 수 있음'],
    },
    ENTJ: {
      name: '주도적 파트너',
      loveStyle: '관계도 목표처럼 접근하며, 두 사람이 함께 성장하고 발전하는 강한 파트너십을 추구합니다.',
      idealPartners: ['INFP', 'INTP'],
      loveLanguages: ['인정하는 말', '봉사 행위'],
      strengths: ['강한 추진력과 리드', '명확한 미래 비전 공유', '상대의 성장을 적극 지원'],
      weaknesses: ['지배적이고 통제적 경향', '감정보다 효율 우선', '상대 페이스 무시 가능성'],
      datingTip: '관계는 프로젝트가 아닙니다. 상대방의 속도를 존중하고, 때로는 그냥 함께 있어주는 것만으로도 충분합니다.',
      cautionPoints: ['지나치게 주도적으로 상대를 압박할 수 있음', '감정적 필요를 약점으로 볼 수 있음'],
    },
    ENTP: {
      name: '자유로운 토론자',
      loveStyle: '지적 자극과 유머를 통해 관계를 발전시키며, 서로 도전하고 성장하는 역동적인 관계를 좋아합니다.',
      idealPartners: ['INFJ', 'INTJ'],
      loveLanguages: ['인정하는 말', '함께하는 시간'],
      strengths: ['창의적이고 신선한 데이트 아이디어', '지적 자극과 재미', '위트와 유머로 관계 활성화'],
      weaknesses: ['일관성과 안정성 부족', '감정적 깊이 회피 경향', '토론이 싸움으로 번질 수 있음'],
      datingTip: '상대방이 토론보다 공감을 원하는 순간을 알아채는 감수성을 키워보세요.',
      cautionPoints: ['논쟁을 즐기다 상대를 피곤하게 할 수 있음'],
    },
    INFJ: {
      name: '깊은 영혼의 연인',
      loveStyle: '단 한 명의 진정한 영혼의 동반자를 찾으며, 표면적 연결 너머의 깊고 의미 있는 관계를 추구합니다.',
      idealPartners: ['ENFP', 'ENTP'],
      loveLanguages: ['함께하는 시간', '인정하는 말'],
      strengths: ['깊은 공감과 이해', '헌신적이고 진지한 사랑', '파트너 성장 적극 지원'],
      weaknesses: ['완벽한 관계에 대한 이상주의', '혼자만의 회복 시간 필요', '상처를 오랫동안 기억함'],
      datingTip: '완벽한 관계를 기대하기보다, 현실적인 파트너와 함께 성장하는 과정 자체를 즐겨보세요.',
      cautionPoints: ['이상적인 파트너상에 맞지 않으면 쉽게 실망', '너무 많이 주다가 감정 소진'],
    },
    INFP: {
      name: '낭만적 이상주의자',
      loveStyle: '진정성과 감정적 깊이를 무엇보다 중시하며, 서로의 영혼이 연결된 특별하고 아름다운 사랑을 꿈꿉니다.',
      idealPartners: ['ENFJ', 'ENTJ'],
      loveLanguages: ['인정하는 말', '선물'],
      strengths: ['진정성 있는 깊은 감정 표현', '파트너의 독특함을 소중히 여김', '깊은 공감 능력'],
      weaknesses: ['현실적 갈등 회피 경향', '감정 기복이 큼', '이상화로 인한 실망'],
      datingTip: '현실적인 갈등도 관계의 일부임을 받아들이세요. 완벽하지 않아도 진심이 담긴 관계가 더 오래 지속됩니다.',
      cautionPoints: ['파트너를 이상화하다 쉽게 실망함', '갈등 시 회피 경향'],
    },
    ENFJ: {
      name: '헌신적 사랑의 설계자',
      loveStyle: '파트너의 행복과 성장을 삶의 중심에 두며, 깊고 따뜻한 헌신으로 아름다운 관계를 만들어냅니다.',
      idealPartners: ['INFP', 'ISFP'],
      loveLanguages: ['인정하는 말', '함께하는 시간'],
      strengths: ['깊은 공감과 이해', '헌신적이고 따뜻한 사랑', '상대 잠재력 발견과 지원'],
      weaknesses: ['자기 희생이 과도함', '비판에 지나치게 민감', '자신의 필요를 뒤로 미룸'],
      datingTip: '상대를 돌보는 만큼 자신의 감정과 필요도 챙기는 것이 더 건강하고 지속 가능한 관계를 만들어줍니다.',
      cautionPoints: ['너무 많이 줘서 감정 소진', '인정받지 못하면 깊은 상처'],
    },
    ENFP: {
      name: '열정적 자유 영혼',
      loveStyle: '처음 만남부터 깊은 연결을 추구하며, 상대의 가능성과 내면 세계를 함께 탐험하는 것을 사랑합니다.',
      idealPartners: ['INTJ', 'INFJ'],
      loveLanguages: ['인정하는 말', '신체 접촉'],
      strengths: ['열정적인 구애와 감정 표현', '창의적인 데이트 아이디어', '상대의 잠재력 발견'],
      weaknesses: ['감정 기복이 큼', '일관성이 부족할 수 있음', '새로운 것에 금방 흥미 변함'],
      datingTip: '이미 곁에 있는 파트너와의 깊이를 더 쌓아가는 것이 진정한 사랑의 성숙입니다.',
      cautionPoints: ['초반 열정이 시간 지나면 식을 수 있음', '상대를 이상화하다 실망하는 패턴'],
    },
    ISTJ: {
      name: '신뢰할 수 있는 든든한 파트너',
      loveStyle: '말보다 행동으로 사랑을 증명하며, 안정적이고 믿을 수 있는 관계를 꾸준히 만들어갑니다.',
      idealPartners: ['ESFP', 'ESTP'],
      loveLanguages: ['봉사 행위', '함께하는 시간'],
      strengths: ['흔들리지 않는 신뢰성', '책임감 있는 파트너십', '안정적이고 예측 가능한 관계'],
      weaknesses: ['감정 표현이 서툶', '변화와 즉흥성 어려움', '로맨틱한 제스처 부족'],
      datingTip: "'사랑해'라는 한마디가 상대에게 큰 선물이 될 수 있습니다. 말로 표현하는 것도 연습해보세요.",
      cautionPoints: ['감정 표현 부족으로 차갑게 느껴질 수 있음'],
    },
    ISFJ: {
      name: '따뜻한 수호자',
      loveStyle: '세심하게 상대를 배려하며, 안정적이고 따뜻한 가정 같은 관계를 만들어갑니다.',
      idealPartners: ['ESTP', 'ESFP'],
      loveLanguages: ['봉사 행위', '선물'],
      strengths: ['세심하고 꼼꼼한 배려', '안정적이고 헌신적인 관계', '상대를 기억하고 챙기는 다정함'],
      weaknesses: ['자신의 필요 표현 어려움', '갈등 회피로 인한 불만 축적', '변화에 대한 불안'],
      datingTip: '당신의 감정과 필요도 소중합니다. 표현하지 않으면 상대는 당신의 마음을 알 수 없습니다.',
      cautionPoints: ['자기 감정을 억누르다 번아웃', '갈등을 피하려다 불만이 쌓임'],
    },
    ESTJ: {
      name: '책임감 있는 관계 리더',
      loveStyle: '관계에서 역할과 책임을 명확히 하며, 함께 목표를 이루어가는 실질적이고 든든한 파트너십을 추구합니다.',
      idealPartners: ['ISFP', 'ISTP'],
      loveLanguages: ['봉사 행위', '인정하는 말'],
      strengths: ['신뢰할 수 있는 책임감', '명확하고 직접적인 소통', '현실적 문제 해결 능력'],
      weaknesses: ['지나치게 통제적', '감정보다 논리와 효율 우선', '유연성 부족'],
      datingTip: '모든 것을 효율적으로 해결하려 하지 말고, 때로는 상대방의 감정에 그냥 함께 있어주는 것만으로도 충분합니다.',
      cautionPoints: ['과도하게 관계를 관리하려는 경향'],
    },
    ESFJ: {
      name: '사랑으로 가득 찬 돌봄이',
      loveStyle: '상대방의 모든 것을 알고 싶어하며, 관계를 위해 아낌없이 헌신합니다.',
      idealPartners: ['ISFP', 'ISTP'],
      loveLanguages: ['봉사 행위', '함께하는 시간'],
      strengths: ['따뜻하고 환대하는 태도', '세심하고 꼼꼼한 배려', '관계 화합 분위기 조성'],
      weaknesses: ['타인의 인정과 승인 의존', '갈등 회피 경향', '자기 희생이 과도함'],
      datingTip: '상대방의 인정에 덜 의존하는 연습을 해보세요. 당신의 가치는 누군가의 반응에 달려있지 않습니다.',
      cautionPoints: ['인정받지 못하면 불안과 상처', '자신을 잃고 상대에게 지나치게 맞춤'],
    },
    ISTP: {
      name: '자유로운 현실주의자',
      loveStyle: '독립성을 유지하면서 실용적인 방식으로 사랑을 표현하며, 자유롭고 강요 없는 관계를 선호합니다.',
      idealPartners: ['ESTJ', 'ESFJ'],
      loveLanguages: ['신체 접촉', '봉사 행위'],
      strengths: ['실용적 문제 해결', '상대의 독립성 존중', '위기 상황에서 침착함'],
      weaknesses: ['감정 표현이 매우 어려움', '장기 계획 논의 회피', '너무 독립적으로 상대가 소외감 느낄 수 있음'],
      datingTip: '침묵은 때로 거리감으로 느껴질 수 있습니다. 상대방에게 조금씩이라도 감정을 표현하는 연습을 해보세요.',
      cautionPoints: ['감정 표현 없어 상대가 확인 불안 느낄 수 있음', '너무 독립적으로 관계 단절 위험'],
    },
    ISFP: {
      name: '조용한 감성 예술가',
      loveStyle: '섬세하고 진정성 있게 사랑하며, 아름다운 순간들을 함께 만들어가고 현재에 충실한 감성적 관계를 추구합니다.',
      idealPartners: ['ENFJ', 'ENTJ'],
      loveLanguages: ['신체 접촉', '선물'],
      strengths: ['섬세하고 아름다운 감성', '자유롭고 비판단적인 사랑', '현재 순간에 충실'],
      weaknesses: ['미래 계획 논의 회피', '갈등 상황에서 회피 경향', '깊은 감정 표현이 어려움'],
      datingTip: '갈등을 피하면 문제가 사라지지 않습니다. 조용하게라도 자신의 감정을 나눠보세요.',
      cautionPoints: ['갈등 회피로 불만이 쌓임', '감정 표현 어려워 상대가 오해'],
    },
    ESTP: {
      name: '짜릿한 어드벤처 연인',
      loveStyle: '자발적이고 활기차게 관계를 즐기며, 함께 새로운 경험과 스릴을 나누는 것을 사랑합니다.',
      idealPartners: ['ISFJ', 'ISTJ'],
      loveLanguages: ['신체 접촉', '선물'],
      strengths: ['활기차고 재미있는 데이트', '즉흥적이고 자유로운 관계', '현재를 즐기는 능력'],
      weaknesses: ['미래 계획이나 안정성 소홀', '깊은 감정 대화 회피', '지루함에 쉽게 취약'],
      datingTip: '흥분과 새로움 너머에 있는 깊은 연결도 관계를 풍요롭게 합니다. 파트너와 진지한 대화 시간을 만들어보세요.',
      cautionPoints: ['안정성 부족으로 상대 불안 유발', '지루해지면 관계 이탈 위험'],
    },
    ESFP: {
      name: '삶을 사랑하는 자유 영혼',
      loveStyle: '열정적이고 따뜻하게 사랑을 표현하며, 파트너와 함께라면 어떤 일상도 특별한 모험이 됩니다.',
      idealPartners: ['ISFJ', 'ISTJ'],
      loveLanguages: ['신체 접촉', '선물'],
      strengths: ['넘치는 활기와 열정', '따뜻하고 솔직한 감정 표현', '현재 순간의 행복 극대화'],
      weaknesses: ['장기 계획 어려움', '감정 기복이 큼', '미래보다 현재에만 집중'],
      datingTip: '지금 이 순간의 행복만큼 파트너와의 미래도 함께 그려보세요.',
      cautionPoints: ['현재 중심으로 미래 약속 어려움', '감정 기복으로 상대 혼란'],
    },
  },
  en: {
    INTJ: {
      name: 'Strategic Romantic',
      loveStyle: 'Selective and independent in choosing a partner, but once committed, you become a deeply loyal and devoted lover who expresses love through actions.',
      idealPartners: ['ENFP', 'ENTP'],
      loveLanguages: ['Words of Affirmation', 'Quality Time'],
      strengths: ['Deep loyalty and dedication', 'Intellectual growth through conversation', 'Long-term stable partnership'],
      weaknesses: ['Difficulty expressing emotions', 'Perfectionist expectations causing friction', 'Need for alone time misread as distance'],
      datingTip: 'Practice expressing gratitude and affection verbally. Your actions alone may not fully communicate how you feel.',
      cautionPoints: ['Perceived emotional distance due to low expression', 'Setting standards too high'],
    },
    INTP: {
      name: 'Philosophical Companion',
      loveStyle: 'You base love on intellectual connection, seeking a partnership where you truly understand each other and grow together.',
      idealPartners: ['ENTJ', 'ENFJ'],
      loveLanguages: ['Words of Affirmation', 'Quality Time'],
      strengths: ['Deep understanding and acceptance', 'Non-judgmental and flexible attitude', 'Creative and stimulating conversation'],
      weaknesses: ['Difficulty with emotional expression', 'Discomfort with spontaneous decisions', 'Neglecting small practical gestures'],
      datingTip: 'Try to empathize with your partner\'s emotional needs before analyzing them logically.',
      cautionPoints: ['Over-analyzing can feel cold to partners'],
    },
    ENTJ: {
      name: 'Decisive Partner',
      loveStyle: 'You approach relationships like goals, seeking a strong partnership where both people grow and achieve together.',
      idealPartners: ['INFP', 'INTP'],
      loveLanguages: ['Words of Affirmation', 'Acts of Service'],
      strengths: ['Strong drive and leadership', 'Clear shared vision for the future', 'Actively supports partner\'s growth'],
      weaknesses: ['Tendency to be dominant or controlling', 'Prioritizing efficiency over emotions', 'May ignore partner\'s pace'],
      datingTip: 'A relationship is not a project. Respect your partner\'s pace — sometimes just being present is enough.',
      cautionPoints: ['Can inadvertently pressure partners', 'May treat emotional needs as weaknesses'],
    },
    ENTP: {
      name: 'Free-Spirited Debater',
      loveStyle: 'You build relationships through intellectual stimulation and humor, loving dynamic connections where both partners challenge each other.',
      idealPartners: ['INFJ', 'INTJ'],
      loveLanguages: ['Words of Affirmation', 'Quality Time'],
      strengths: ['Creative and fresh date ideas', 'Intellectual stimulation and fun', 'Wit and humor keep the relationship alive'],
      weaknesses: ['Inconsistency and instability', 'Tendency to avoid emotional depth', 'Debates can turn into arguments'],
      datingTip: 'Develop the sensitivity to know when your partner wants empathy, not debate.',
      cautionPoints: ['May exhaust partners with constant debate'],
    },
    INFJ: {
      name: 'Deep Soul Lover',
      loveStyle: 'You seek one true soulmate, pursuing deep and meaningful connection that goes beyond the surface.',
      idealPartners: ['ENFP', 'ENTP'],
      loveLanguages: ['Quality Time', 'Words of Affirmation'],
      strengths: ['Deep empathy and understanding', 'Devoted and serious love', 'Actively supports partner\'s growth'],
      weaknesses: ['Idealism about perfect relationships', 'Needs alone time to recover', 'Holds onto hurt for a long time'],
      datingTip: 'Rather than expecting a perfect relationship, enjoy the process of growing together with a real, imperfect partner.',
      cautionPoints: ['Easily disappointed when partners don\'t match ideals', 'Risk of emotional burnout from giving too much'],
    },
    INFP: {
      name: 'Romantic Idealist',
      loveStyle: 'You value authenticity and emotional depth above all, dreaming of a love where two souls are truly connected.',
      idealPartners: ['ENFJ', 'ENTJ'],
      loveLanguages: ['Words of Affirmation', 'Gifts'],
      strengths: ['Genuine and deep emotional expression', 'Cherishes what makes each partner unique', 'Deep empathy'],
      weaknesses: ['Tends to avoid real conflict', 'Emotional ups and downs', 'Disappointment from over-idealizing'],
      datingTip: 'Accept that real conflict is part of every relationship. An imperfect but sincere bond lasts longer.',
      cautionPoints: ['Over-idealizes partners, then gets disappointed', 'Tends to withdraw during conflict'],
    },
    ENFJ: {
      name: 'Devoted Love Architect',
      loveStyle: 'You center your life around your partner\'s happiness and growth, creating a beautiful relationship through warm and dedicated love.',
      idealPartners: ['INFP', 'ISFP'],
      loveLanguages: ['Words of Affirmation', 'Quality Time'],
      strengths: ['Deep empathy and understanding', 'Devoted and warm love', 'Helps partner discover their potential'],
      weaknesses: ['Gives too much of themselves', 'Overly sensitive to criticism', 'Neglects own needs'],
      datingTip: 'Taking care of your own feelings and needs is what creates a healthier, more sustainable relationship.',
      cautionPoints: ['Risk of emotional burnout from over-giving', 'Deeply hurt when not appreciated'],
    },
    ENFP: {
      name: 'Passionate Free Spirit',
      loveStyle: 'From the very first meeting, you seek deep connection, loving to explore your partner\'s potential and inner world together.',
      idealPartners: ['INTJ', 'INFJ'],
      loveLanguages: ['Words of Affirmation', 'Physical Touch'],
      strengths: ['Passionate pursuit and emotional expression', 'Creative date ideas', 'Sees and nurtures partner\'s potential'],
      weaknesses: ['Emotional ups and downs', 'May lack consistency', 'Interests shift easily toward new things'],
      datingTip: 'Building deeper depth with the partner already beside you is the true maturity of love.',
      cautionPoints: ['Early passion may fade over time', 'Pattern of idealizing then being disappointed'],
    },
    ISTJ: {
      name: 'Dependable Steady Partner',
      loveStyle: 'You prove your love through actions rather than words, steadily building a stable and trustworthy relationship.',
      idealPartners: ['ESFP', 'ESTP'],
      loveLanguages: ['Acts of Service', 'Quality Time'],
      strengths: ['Unwavering reliability', 'Responsible partnership', 'Stable and predictable relationship'],
      weaknesses: ['Difficulty expressing emotions', 'Struggles with change and spontaneity', 'Lacks romantic gestures'],
      datingTip: '"I love you" can be a huge gift to your partner. Practice expressing it in words too.',
      cautionPoints: ['Emotional reserve can come across as cold'],
    },
    ISFJ: {
      name: 'Warm Guardian',
      loveStyle: 'You care for your partner with meticulous attention, creating a warm, stable relationship that feels like home.',
      idealPartners: ['ESTP', 'ESFP'],
      loveLanguages: ['Acts of Service', 'Gifts'],
      strengths: ['Meticulous care and attention', 'Stable and devoted relationship', 'Remembers and cherishes details about partner'],
      weaknesses: ['Difficulty expressing own needs', 'Avoids conflict — resentment builds up', 'Anxious about change'],
      datingTip: 'Your feelings and needs matter too. If you don\'t express them, your partner won\'t know.',
      cautionPoints: ['Suppresses feelings until burnout', 'Avoiding conflict lets resentment accumulate'],
    },
    ESTJ: {
      name: 'Responsible Relationship Leader',
      loveStyle: 'You define clear roles and responsibilities in relationships, seeking a practical and solid partnership built around shared goals.',
      idealPartners: ['ISFP', 'ISTP'],
      loveLanguages: ['Acts of Service', 'Words of Affirmation'],
      strengths: ['Trustworthy responsibility', 'Clear and direct communication', 'Practical problem-solving'],
      weaknesses: ['Tendency to be overly controlling', 'Logic and efficiency over feelings', 'Lack of flexibility'],
      datingTip: 'You don\'t need to solve everything efficiently. Sometimes just being with your partner emotionally is enough.',
      cautionPoints: ['Tendency to over-manage the relationship'],
    },
    ESFJ: {
      name: 'Love-Filled Caregiver',
      loveStyle: 'You want to know everything about your partner and give generously to the relationship. Love is at the center of your life.',
      idealPartners: ['ISFP', 'ISTP'],
      loveLanguages: ['Acts of Service', 'Quality Time'],
      strengths: ['Warm and welcoming attitude', 'Meticulous care and attention', 'Creates harmonious relationship atmosphere'],
      weaknesses: ['Dependent on others\' approval', 'Avoids conflict', 'Over-sacrifices for others'],
      datingTip: 'Practice depending less on your partner\'s validation. Your value is not determined by their reactions.',
      cautionPoints: ['Deeply hurt when not appreciated', 'May lose sense of self by over-accommodating'],
    },
    ISTP: {
      name: 'Free-Spirited Realist',
      loveStyle: 'You maintain independence while expressing love in practical ways, preferring a relationship free from pressure and control.',
      idealPartners: ['ESTJ', 'ESFJ'],
      loveLanguages: ['Physical Touch', 'Acts of Service'],
      strengths: ['Practical problem-solving', 'Respects partner\'s independence', 'Calm and steady in a crisis'],
      weaknesses: ['Great difficulty with emotional expression', 'Avoids discussing long-term plans', 'Too independent — partner may feel excluded'],
      datingTip: 'Silence can feel like distance. Practice expressing your feelings to your partner, even a little.',
      cautionPoints: ['Lack of emotional expression can cause partner anxiety', 'Risk of disconnection due to extreme independence'],
    },
    ISFP: {
      name: 'Quiet Emotional Artist',
      loveStyle: 'You love with sensitivity and authenticity, seeking an emotionally rich relationship focused on beautiful shared moments.',
      idealPartners: ['ENFJ', 'ENTJ'],
      loveLanguages: ['Physical Touch', 'Gifts'],
      strengths: ['Delicate and beautiful sensitivity', 'Free and non-judgmental love', 'Fully present in the moment'],
      weaknesses: ['Avoids discussing future plans', 'Withdraws during conflict', 'Difficulty expressing deep feelings'],
      datingTip: 'Avoiding conflict doesn\'t make problems disappear. Share your feelings quietly but honestly.',
      cautionPoints: ['Conflict avoidance lets resentment build', 'Emotional withdrawal causes misunderstandings'],
    },
    ESTP: {
      name: 'Thrilling Adventure Lover',
      loveStyle: 'You enjoy relationships spontaneously and energetically, loving to share new experiences and excitement with your partner.',
      idealPartners: ['ISFJ', 'ISTJ'],
      loveLanguages: ['Physical Touch', 'Gifts'],
      strengths: ['Energetic and fun dates', 'Spontaneous and free relationship style', 'Lives fully in the present'],
      weaknesses: ['Neglects future planning and stability', 'Avoids deep emotional conversations', 'Gets bored easily'],
      datingTip: 'The deep connection beyond the thrill of novelty also enriches a relationship. Make time for serious talks.',
      cautionPoints: ['Lack of stability can make partners anxious', 'May disengage when boredom sets in'],
    },
    ESFP: {
      name: 'Life-Loving Free Spirit',
      loveStyle: 'You express love passionately and warmly — with your partner, even ordinary days feel like special adventures.',
      idealPartners: ['ISFJ', 'ISTJ'],
      loveLanguages: ['Physical Touch', 'Gifts'],
      strengths: ['Overflowing energy and passion', 'Warm and honest emotional expression', 'Maximizes joy in the present moment'],
      weaknesses: ['Struggles with long-term planning', 'Emotional ups and downs', 'Focuses on present rather than future'],
      datingTip: 'Paint a picture of the future with your partner too. Planning and making promises is also a form of love.',
      cautionPoints: ['Difficulty making future commitments', 'Mood swings can confuse partners'],
    },
  },
  ja: {
    INTJ: {
      name: '戦略的ロマンチスト',
      loveStyle: '慎重に愛を選びますが、一度心を開いたら深く献身的なパートナーになります。感情より行動で愛を証明するタイプです。',
      idealPartners: ['ENFP', 'ENTP'],
      loveLanguages: ['肯定の言葉', '充実した時間'],
      strengths: ['深い忠誠心と献身', '知的対話で関係を深める', '長期的で安定したパートナーシップ'],
      weaknesses: ['感情表現が苦手', '完璧主義的な期待が摩擦を生む', '一人の時間が必要で誤解されやすい'],
      datingTip: '感謝や愛情を言葉で直接伝える練習をしてみてください。行動だけでは相手に伝わらないことがあります。',
      cautionPoints: ['感情表現不足による疎遠感', '基準が高すぎる'],
    },
    INTP: {
      name: '哲学的な伴侶',
      loveStyle: '知的なつながりを愛の基盤とし、お互いを真に理解し成長できる関係を求めます。',
      idealPartners: ['ENTJ', 'ENFJ'],
      loveLanguages: ['肯定の言葉', '充実した時間'],
      strengths: ['深い理解と受容', '柔軟で非判断的な態度', '創造的で刺激的な会話'],
      weaknesses: ['感情表現が難しい', '即興的な決定が苦手', '実務的な細やかな配慮が不足しがち'],
      datingTip: '相手の感情的ニーズを論理で分析する前に、まず共感してみましょう。',
      cautionPoints: ['分析が先走り、相手を冷たく感じさせることがある'],
    },
    ENTJ: {
      name: '主導的なパートナー',
      loveStyle: '関係も目標のようにアプローチし、二人が共に成長・発展する強いパートナーシップを求めます。',
      idealPartners: ['INFP', 'INTP'],
      loveLanguages: ['肯定の言葉', '行動・奉仕'],
      strengths: ['強い推進力とリード力', '明確な将来ビジョンの共有', '相手の成長を積極的にサポート'],
      weaknesses: ['支配的・コントロール的な傾向', '感情より効率を優先', '相手のペースを無視する可能性'],
      datingTip: '関係はプロジェクトではありません。相手のペースを尊重し、ただそばにいるだけでも十分なことがあります。',
      cautionPoints: ['主導しすぎて相手にプレッシャーを与える可能性'],
    },
    ENTP: {
      name: '自由な討論者',
      loveStyle: '知的刺激とユーモアで関係を深め、互いに挑戦し成長するダイナミックな関係が好きです。',
      idealPartners: ['INFJ', 'INTJ'],
      loveLanguages: ['肯定の言葉', '充実した時間'],
      strengths: ['斬新で創造的なデートのアイデア', '知的刺激と楽しさ', 'ウィットとユーモアで関係を活性化'],
      weaknesses: ['一貫性と安定性の欠如', '感情的な深みを避ける傾向', '討論が喧嘩になることがある'],
      datingTip: '相手が討論より共感を求めている瞬間を察する感受性を磨いてみましょう。',
      cautionPoints: ['議論を楽しみすぎて相手を疲れさせることがある'],
    },
    INFJ: {
      name: '深い魂の恋人',
      loveStyle: '真のソウルメイトを求め、表面的なつながりを超えた深く意味ある関係を追求します。',
      idealPartners: ['ENFP', 'ENTP'],
      loveLanguages: ['充実した時間', '肯定の言葉'],
      strengths: ['深い共感と理解', '献身的で真剣な愛', '相手の成長を積極的にサポート'],
      weaknesses: ['完璧な関係へのイデアリズム', '一人で回復する時間が必要', '傷を長く覚えている'],
      datingTip: '完璧な関係を求めるより、現実的なパートナーと共に成長する過程を楽しんでみてください。',
      cautionPoints: ['理想のパートナー像に合わないとすぐ失望する', '与えすぎて感情燃え尽きのリスク'],
    },
    INFP: {
      name: 'ロマンチックな理想主義者',
      loveStyle: '誠実さと感情的な深さを何より大切にし、魂が繋がる特別で美しい愛を夢見ています。',
      idealPartners: ['ENFJ', 'ENTJ'],
      loveLanguages: ['肯定の言葉', 'プレゼント'],
      strengths: ['誠実で深い感情表現', 'パートナーの独自性を大切にする', '深い共感力'],
      weaknesses: ['現実的な葛藤を避ける傾向', '感情の波が大きい', '理想化による失望'],
      datingTip: '現実の葛藤も関係の一部だと受け入れてみてください。完璧でなくても誠実な関係の方が長続きします。',
      cautionPoints: ['パートナーを理想化してすぐ失望するパターン', '葛藤時に引きこもる傾向'],
    },
    ENFJ: {
      name: '献身的な愛の設計者',
      loveStyle: 'パートナーの幸福と成長を生活の中心に置き、深く温かな献身で美しい関係を作り上げます。',
      idealPartners: ['INFP', 'ISFP'],
      loveLanguages: ['肯定の言葉', '充実した時間'],
      strengths: ['深い共感と理解', '献身的で温かな愛', '相手の潜在力を発見してサポート'],
      weaknesses: ['自己犠牲が過大', '批判に過敏', '自分のニーズを後回しにする'],
      datingTip: '相手を気遣うのと同じくらい、自分の感情やニーズも大切にすることがより健全で持続可能な関係を作ります。',
      cautionPoints: ['与えすぎて感情燃え尽き', '認められないと深く傷つく'],
    },
    ENFP: {
      name: '情熱的な自由な魂',
      loveStyle: '出会いの瞬間から深いつながりを求め、相手の可能性と内面世界を共に探求することを愛します。',
      idealPartners: ['INTJ', 'INFJ'],
      loveLanguages: ['肯定の言葉', 'スキンシップ'],
      strengths: ['情熱的なアプローチと感情表現', '創造的なデートのアイデア', '相手の潜在力を発見する'],
      weaknesses: ['感情の波が大きい', '一貫性が欠けることがある', '新しいことにすぐ興味が移る'],
      datingTip: '今そばにいるパートナーとの深みをさらに積み上げることが、真の愛の成熟です。',
      cautionPoints: ['初期の情熱が時間とともに薄れる可能性', '理想化してから失望するパターン'],
    },
    ISTJ: {
      name: '信頼できる頼れるパートナー',
      loveStyle: '言葉より行動で愛を証明し、安定していて信頼できる関係を地道に作り続けます。',
      idealPartners: ['ESFP', 'ESTP'],
      loveLanguages: ['行動・奉仕', '充実した時間'],
      strengths: ['揺るぎない信頼性', '責任感のあるパートナーシップ', '安定した予測可能な関係'],
      weaknesses: ['感情表現が苦手', '変化と即興性が苦手', 'ロマンチックなジェスチャーが少ない'],
      datingTip: '「好きだよ」の一言が相手への大きなプレゼントになります。言葉で表現することも練習してみてください。',
      cautionPoints: ['感情表現不足で冷たく感じられることがある'],
    },
    ISFJ: {
      name: '温かな守護者',
      loveStyle: '相手を細やかに気遣い、安定していて温かい家庭のような関係を作り上げます。',
      idealPartners: ['ESTP', 'ESFP'],
      loveLanguages: ['行動・奉仕', 'プレゼント'],
      strengths: ['細やかで丁寧な気遣い', '安定した献身的な関係', '相手を覚えて大切にする優しさ'],
      weaknesses: ['自分のニーズを表現しにくい', '葛藤回避による不満の蓄積', '変化への不安'],
      datingTip: 'あなたの感情やニーズも大切です。表現しないと相手にはわかりません。',
      cautionPoints: ['感情を抑えすぎてバーンアウト', '葛藤を避けて不満が溜まる'],
    },
    ESTJ: {
      name: '責任感ある関係のリーダー',
      loveStyle: '関係における役割と責任を明確にし、共に目標を達成する実用的で頼りになるパートナーシップを求めます。',
      idealPartners: ['ISFP', 'ISTP'],
      loveLanguages: ['行動・奉仕', '肯定の言葉'],
      strengths: ['信頼できる責任感', '明確で直接的なコミュニケーション', '現実的な問題解決力'],
      weaknesses: ['過度にコントロールしようとする', '感情より論理と効率を優先', '柔軟性の欠如'],
      datingTip: '何でも効率的に解決しようとせず、時には相手の感情にただ寄り添うだけでも十分です。',
      cautionPoints: ['関係を管理しすぎる傾向'],
    },
    ESFJ: {
      name: '愛情あふれる世話焼き',
      loveStyle: '相手のすべてを知りたがり、関係のために惜しみなく献身します。愛することと愛されることが人生の中心です。',
      idealPartners: ['ISFP', 'ISTP'],
      loveLanguages: ['行動・奉仕', '充実した時間'],
      strengths: ['温かく歓迎的な態度', '細やかで丁寧な気遣い', '関係の調和を作る'],
      weaknesses: ['他者の承認に依存', '葛藤回避の傾向', '自己犠牲が過大'],
      datingTip: '相手の承認への依存を減らす練習をしてみましょう。あなたの価値は誰かの反応次第ではありません。',
      cautionPoints: ['認められないと不安や傷つきが生じる', '自分を失って相手に合わせすぎる'],
    },
    ISTP: {
      name: '自由な現実主義者',
      loveStyle: '独立性を保ちながら実用的な方法で愛を表現し、自由でプレッシャーのない関係を好みます。',
      idealPartners: ['ESTJ', 'ESFJ'],
      loveLanguages: ['スキンシップ', '行動・奉仕'],
      strengths: ['実用的な問題解決', '相手の独立性を尊重', '危機的状況での冷静さ'],
      weaknesses: ['感情表現が非常に苦手', '長期的な計画の話し合いを避ける', '独立的すぎて相手が孤独感を感じる可能性'],
      datingTip: '沈黙は時に距離感に感じられます。少しずつでも感情を表現する練習をしてみましょう。',
      cautionPoints: ['感情表現がなく相手が不安を感じることがある'],
    },
    ISFP: {
      name: '静かな感性の芸術家',
      loveStyle: '繊細で誠実に愛し、美しい瞬間を共に作り、今この瞬間を大切にする感性的な関係を求めます。',
      idealPartners: ['ENFJ', 'ENTJ'],
      loveLanguages: ['スキンシップ', 'プレゼント'],
      strengths: ['繊細で美しい感性', '自由で非判断的な愛', '今この瞬間を大切にする'],
      weaknesses: ['将来の計画の話し合いを避ける', '葛藤時に引きこもる傾向', '深い感情表現が苦手'],
      datingTip: '葛藤を避けても問題は消えません。静かにでも自分の気持ちを分かち合いましょう。',
      cautionPoints: ['葛藤回避で不満が溜まる', '感情表現が苦手で相手が誤解する'],
    },
    ESTP: {
      name: 'スリリングな冒険家の恋人',
      loveStyle: '自発的で活気よく関係を楽しみ、パートナーと新しい体験やスリルを共有することを愛します。',
      idealPartners: ['ISFJ', 'ISTJ'],
      loveLanguages: ['スキンシップ', 'プレゼント'],
      strengths: ['活気ある楽しいデート', '自発的で自由な関係', '今この瞬間を楽しむ能力'],
      weaknesses: ['将来の計画や安定性がおろそか', '深い感情の対話を避ける', '飽きやすい'],
      datingTip: '興奮や新鮮さの向こうにある深いつながりも関係を豊かにします。パートナーと真剣な対話の時間を作ってみましょう。',
      cautionPoints: ['安定性の欠如でパートナーが不安になる', '飽きると関係から離れるリスク'],
    },
    ESFP: {
      name: '人生を愛する自由な魂',
      loveStyle: '情熱的で温かく愛情を表現し、パートナーと一緒なら日常のどんな瞬間も特別な冒険になります。',
      idealPartners: ['ISFJ', 'ISTJ'],
      loveLanguages: ['スキンシップ', 'プレゼント'],
      strengths: ['溢れるエネルギーと情熱', '温かく率直な感情表現', '今この瞬間の幸せを最大化'],
      weaknesses: ['長期計画が苦手', '感情の波が大きい', '将来よりも今に集中'],
      datingTip: '今この瞬間の幸せと同様に、パートナーとの未来も一緒に描いてみましょう。',
      cautionPoints: ['将来の約束が難しい', '感情の波でパートナーが混乱することがある'],
    },
  },
  zh: {
    INTJ: {
      name: '战略型浪漫主义者',
      loveStyle: '独立而谨慎地选择爱，但一旦敞开心扉，就会成为深情而忠诚的伴侣。是用行动而非情绪来证明爱的类型。',
      idealPartners: ['ENFP', 'ENTP'],
      loveLanguages: ['肯定的言语', '精心的时刻'],
      strengths: ['深厚的忠诚与投入', '以智识对话让关系成长', '长期而稳定的伴侣关系'],
      weaknesses: ['不擅表达情感', '完美主义的期待引发冲突', '需要独处时间而造成误会'],
      datingTip: '练习用言语直接表达感谢和爱意吧。只靠行动，对方可能感受不够。',
      cautionPoints: ['情感表达不足造成的距离感', '把标准定得太高'],
    },
    INTP: {
      name: '哲学型伴侣',
      loveStyle: '以智识连结为爱的基础，追求真正理解彼此、一起成长的伴侣关系。',
      idealPartners: ['ENTJ', 'ENFJ'],
      loveLanguages: ['肯定的言语', '精心的时刻'],
      strengths: ['深刻的理解与包容', '灵活、不评判的态度', '有创意又有趣的对话'],
      weaknesses: ['难以表达情感', '对即兴的决定感到不自在', '疏于现实细节的体贴'],
      datingTip: '在用逻辑分析对方的情感需要之前，先练习共情吧。',
      cautionPoints: ['分析先于情感，可能让对方觉得冷淡'],
    },
    ENTJ: {
      name: '主导型伴侣',
      loveStyle: '把关系也当成目标来经营，追求两人一起成长、进步的强大伙伴关系。',
      idealPartners: ['INFP', 'INTP'],
      loveLanguages: ['肯定的言语', '服务的行动'],
      strengths: ['强大的推动力与引领', '分享清晰的未来愿景', '积极支持对方的成长'],
      weaknesses: ['有支配与控制的倾向', '效率优先于情感', '可能忽视对方的步调'],
      datingTip: '关系不是项目。尊重对方的步调，有时只是陪在身边就足够了。',
      cautionPoints: ['可能过度主导，给对方压力', '可能把情感需要看成弱点'],
    },
    ENTP: {
      name: '自由的辩论家',
      loveStyle: '以智识刺激和幽默推进关系，喜欢彼此挑战、一起成长的动态关系。',
      idealPartners: ['INFJ', 'INTJ'],
      loveLanguages: ['肯定的言语', '精心的时刻'],
      strengths: ['有创意又新鲜的约会点子', '智识刺激与乐趣', '用机智和幽默让关系活络'],
      weaknesses: ['缺乏一致性与稳定', '倾向回避情感深度', '辩论可能演变成争吵'],
      datingTip: '培养一份敏感度，察觉对方想要共情而不是辩论的时刻。',
      cautionPoints: ['享受争论，可能让对方疲惫'],
    },
    INFJ: {
      name: '灵魂深处的恋人',
      loveStyle: '寻找唯一真正的灵魂伴侣，追求超越表面连结、深刻而有意义的关系。',
      idealPartners: ['ENFP', 'ENTP'],
      loveLanguages: ['精心的时刻', '肯定的言语'],
      strengths: ['深厚的共情与理解', '投入而认真的爱', '积极支持伴侣成长'],
      weaknesses: ['对完美关系的理想主义', '需要独处恢复的时间', '久久记得受过的伤'],
      datingTip: '与其期待完美的关系，不如享受和真实的伴侣一起成长的过程。',
      cautionPoints: ['对方不符理想形象时容易失望', '付出太多而情绪耗竭'],
    },
    INFP: {
      name: '浪漫的理想主义者',
      loveStyle: '最重视真诚与情感深度，梦想着灵魂相连、特别而美好的爱。',
      idealPartners: ['ENFJ', 'ENTJ'],
      loveLanguages: ['肯定的言语', '礼物'],
      strengths: ['真诚而深刻的情感表达', '珍惜伴侣的独特', '深厚的共情能力'],
      weaknesses: ['倾向回避现实冲突', '情绪起伏大', '因理想化而失望'],
      datingTip: '接受现实中的冲突也是关系的一部分。即使不完美，真心的关系更长久。',
      cautionPoints: ['把伴侣理想化后容易失望', '冲突时倾向回避'],
    },
    ENFJ: {
      name: '全心之爱的设计师',
      loveStyle: '把伴侣的幸福和成长放在生活中心，以深厚温暖的投入经营美好的关系。',
      idealPartners: ['INFP', 'ISFP'],
      loveLanguages: ['肯定的言语', '精心的时刻'],
      strengths: ['深厚的共情与理解', '投入而温暖的爱', '发现并支持对方的潜力'],
      weaknesses: ['过度自我牺牲', '对批评过度敏感', '把自己的需要往后放'],
      datingTip: '照顾对方的同时，也照顾好自己的情绪和需要，关系会更健康、更长久。',
      cautionPoints: ['付出太多而情绪耗竭', '得不到认可时深受伤害'],
    },
    ENFP: {
      name: '热情的自由灵魂',
      loveStyle: '从第一次见面就追求深度连结，喜欢和对方一起探索彼此的可能性与内心世界。',
      idealPartners: ['INTJ', 'INFJ'],
      loveLanguages: ['肯定的言语', '身体的接触'],
      strengths: ['热情的追求与情感表达', '有创意的约会点子', '发现对方的潜力'],
      weaknesses: ['情绪起伏大', '可能缺乏一致性', '对新事物很快就兴趣转移'],
      datingTip: '和身边已有的伴侣累积更深的关系，才是真爱的成熟。',
      cautionPoints: ['初期的热情时间久了可能冷却', '把对方理想化后失望的模式'],
    },
    ISTJ: {
      name: '可靠的坚实伴侣',
      loveStyle: '用行动而非言语证明爱，持续经营稳定、可信赖的关系。',
      idealPartners: ['ESFP', 'ESTP'],
      loveLanguages: ['服务的行动', '精心的时刻'],
      strengths: ['坚定不移的可靠', '有责任感的伙伴关系', '稳定、可预测的关系'],
      weaknesses: ['不擅表达情感', '难以应对变化与即兴', '缺少浪漫的表示'],
      datingTip: '一句“我爱你”对对方可能是很大的礼物。也练习用言语表达吧。',
      cautionPoints: ['情感表达不足，可能显得冷淡'],
    },
    ISFJ: {
      name: '温暖的守护者',
      loveStyle: '细心体贴对方，经营稳定温暖、像家一样的关系。',
      idealPartners: ['ESTP', 'ESFP'],
      loveLanguages: ['服务的行动', '礼物'],
      strengths: ['细致周到的体贴', '稳定而投入的关系', '记得并照顾对方的温柔'],
      weaknesses: ['难以表达自己的需要', '回避冲突而累积不满', '对变化感到不安'],
      datingTip: '你的感受和需要也很珍贵。不说出来，对方就无法知道你的心。',
      cautionPoints: ['压抑自己的情绪而倦怠', '想避开冲突却累积了不满'],
    },
    ESTJ: {
      name: '有责任感的关系领导者',
      loveStyle: '在关系中厘清角色与责任，追求一起达成目标、务实而可靠的伙伴关系。',
      idealPartners: ['ISFP', 'ISTP'],
      loveLanguages: ['服务的行动', '肯定的言语'],
      strengths: ['值得信赖的责任感', '清楚直接的沟通', '务实解决问题的能力'],
      weaknesses: ['过度控制', '逻辑与效率优先于情感', '缺乏弹性'],
      datingTip: '别想把一切都高效解决，有时只是陪着对方的情绪就足够了。',
      cautionPoints: ['倾向过度管理关系'],
    },
    ESFJ: {
      name: '充满爱的照顾者',
      loveStyle: '想了解对方的一切，为了关系毫无保留地付出。',
      idealPartners: ['ISFP', 'ISTP'],
      loveLanguages: ['服务的行动', '精心的时刻'],
      strengths: ['温暖好客的态度', '细致周到的体贴', '营造关系和谐的氛围'],
      weaknesses: ['依赖他人的认可', '倾向回避冲突', '过度自我牺牲'],
      datingTip: '练习少依赖对方的认可。你的价值不取决于别人的反应。',
      cautionPoints: ['得不到认可就不安、受伤', '失去自我、过度迎合对方'],
    },
    ISTP: {
      name: '自由的现实主义者',
      loveStyle: '在保持独立的同时，以务实的方式表达爱，偏好自由、不勉强的关系。',
      idealPartners: ['ESTJ', 'ESFJ'],
      loveLanguages: ['身体的接触', '服务的行动'],
      strengths: ['务实地解决问题', '尊重对方的独立', '危机中沉着冷静'],
      weaknesses: ['非常难以表达情感', '回避讨论长期计划', '太独立可能让对方感到被冷落'],
      datingTip: '沉默有时会被感受为距离。练习一点一点向对方表达情感吧。',
      cautionPoints: ['没有情感表达，对方可能缺乏安全感', '太独立，有关系断裂的风险'],
    },
    ISFP: {
      name: '安静的感性艺术家',
      loveStyle: '细腻而真诚地爱，和对方一起创造美好的瞬间，追求活在当下的感性关系。',
      idealPartners: ['ENFJ', 'ENTJ'],
      loveLanguages: ['身体的接触', '礼物'],
      strengths: ['细腻美好的感性', '自由而不评判的爱', '活在当下'],
      weaknesses: ['回避讨论未来计划', '冲突时倾向回避', '难以表达深层情感'],
      datingTip: '回避冲突，问题并不会消失。哪怕安静地，也试着分享自己的感受。',
      cautionPoints: ['回避冲突而累积不满', '难以表达情感，对方容易误会'],
    },
    ESTP: {
      name: '刺激的冒险恋人',
      loveStyle: '自发而充满活力地享受关系，喜欢和对方分享新的体验与刺激。',
      idealPartners: ['ISFJ', 'ISTJ'],
      loveLanguages: ['身体的接触', '礼物'],
      strengths: ['活泼有趣的约会', '即兴而自由的关系', '享受当下的能力'],
      weaknesses: ['疏于未来计划或稳定', '回避深入的情感对话', '容易厌倦'],
      datingTip: '超越兴奋与新鲜的深度连结，也能让关系更丰富。和伴侣安排认真谈话的时间吧。',
      cautionPoints: ['缺乏稳定让对方不安', '一厌倦就有离开关系的风险'],
    },
    ESFP: {
      name: '热爱生活的自由灵魂',
      loveStyle: '热情温暖地表达爱，只要和伴侣在一起，再平凡的日常都是特别的冒险。',
      idealPartners: ['ISFJ', 'ISTJ'],
      loveLanguages: ['身体的接触', '礼物'],
      strengths: ['满满的活力与热情', '温暖坦率的情感表达', '把当下的幸福最大化'],
      weaknesses: ['难以做长期计划', '情绪起伏大', '只专注现在而非未来'],
      datingTip: '像珍惜此刻的幸福一样，也和伴侣一起描绘未来吧。',
      cautionPoints: ['以当下为中心，难以许下未来的承诺', '情绪起伏让对方困惑'],
    },
  },
  fr: {
    INTJ: {
      name: 'Romantique stratège',
      loveStyle: 'Vous choisissez l’amour de façon indépendante et prudente, mais une fois que vous vous ouvrez, vous devenez un partenaire profond et dévoué. Vous prouvez votre amour par les actes plutôt que par les émotions.',
      idealPartners: ['ENFP', 'ENTP'],
      loveLanguages: ['Paroles valorisantes', 'Moments de qualité'],
      strengths: ['Loyauté et engagement profonds', 'Faire grandir la relation par des échanges intellectuels', 'Un partenariat stable et durable'],
      weaknesses: ['Maladresse à exprimer ses émotions', 'Des attentes perfectionnistes sources de conflit', 'Des malentendus liés au besoin de solitude'],
      datingTip: 'Entraînez-vous à dire directement votre gratitude et votre affection. Les actes seuls ne suffisent pas toujours à les transmettre.',
      cautionPoints: ['Une distance due au manque d’expression émotionnelle', 'Des exigences trop élevées'],
    },
    INTP: {
      name: 'Compagnon philosophe',
      loveStyle: 'Vous fondez l’amour sur le lien intellectuel et recherchez une relation où l’on se comprend vraiment et où l’on grandit ensemble.',
      idealPartners: ['ENTJ', 'ENFJ'],
      loveLanguages: ['Paroles valorisantes', 'Moments de qualité'],
      strengths: ['Compréhension et acceptation profondes', 'Une attitude souple et sans jugement', 'Des conversations créatives et passionnantes'],
      weaknesses: ['Difficulté à exprimer ses émotions', 'Malaise face aux décisions spontanées', 'Peu d’attention aux détails concrets'],
      datingTip: 'Avant d’analyser logiquement les besoins émotionnels de l’autre, entraînez-vous d’abord à faire preuve d’empathie.',
      cautionPoints: ['L’analyse passe avant l’émotion et peut paraître froide'],
    },
    ENTJ: {
      name: 'Partenaire moteur',
      loveStyle: 'Vous abordez la relation comme un objectif et recherchez un partenariat fort où l’on grandit et progresse à deux.',
      idealPartners: ['INFP', 'INTP'],
      loveLanguages: ['Paroles valorisantes', 'Services rendus'],
      strengths: ['Grand dynamisme et sens de l’initiative', 'Une vision claire et partagée de l’avenir', 'Un soutien actif à l’épanouissement de l’autre'],
      weaknesses: ['Tendance à dominer et contrôler', 'L’efficacité avant l’émotion', 'Risque d’ignorer le rythme de l’autre'],
      datingTip: 'Une relation n’est pas un projet. Respectez le rythme de l’autre ; parfois, être simplement présent suffit.',
      cautionPoints: ['Risque de mettre trop de pression sur l’autre', 'Risque de voir les besoins émotionnels comme une faiblesse'],
    },
    ENTP: {
      name: 'Débatteur libre',
      loveStyle: 'Vous faites évoluer la relation par la stimulation intellectuelle et l’humour, et aimez les relations dynamiques où l’on se challenge et grandit ensemble.',
      idealPartners: ['INFJ', 'INTJ'],
      loveLanguages: ['Paroles valorisantes', 'Moments de qualité'],
      strengths: ['Des idées de sorties créatives et originales', 'Stimulation intellectuelle et plaisir', 'L’esprit et l’humour qui animent la relation'],
      weaknesses: ['Manque de constance et de stabilité', 'Tendance à éviter la profondeur émotionnelle', 'Un débat qui peut tourner à la dispute'],
      datingTip: 'Développez la sensibilité de repérer les moments où l’autre veut de l’empathie plutôt qu’un débat.',
      cautionPoints: ['Aimer la controverse peut fatiguer l’autre'],
    },
    INFJ: {
      name: 'Amoureux de l’âme',
      loveStyle: 'Vous cherchez un seul véritable âme sœur et une relation profonde qui dépasse les liens superficiels.',
      idealPartners: ['ENFP', 'ENTP'],
      loveLanguages: ['Moments de qualité', 'Paroles valorisantes'],
      strengths: ['Empathie et compréhension profondes', 'Un amour dévoué et sérieux', 'Un soutien actif à l’épanouissement du partenaire'],
      weaknesses: ['Idéalisme sur la relation parfaite', 'Besoin de temps seul pour se ressourcer', 'Garde longtemps en mémoire les blessures'],
      datingTip: 'Plutôt que d’attendre une relation parfaite, savourez le chemin parcouru avec un partenaire réel.',
      cautionPoints: ['Déception rapide si l’autre ne correspond pas à l’idéal', 'Épuisement émotionnel à force de trop donner'],
    },
    INFP: {
      name: 'Idéaliste romantique',
      loveStyle: 'Vous placez l’authenticité et la profondeur émotionnelle au-dessus de tout et rêvez d’un amour unique où les âmes se rejoignent.',
      idealPartners: ['ENFJ', 'ENTJ'],
      loveLanguages: ['Paroles valorisantes', 'Cadeaux'],
      strengths: ['Expression sincère et profonde des émotions', 'Vous chérissez la singularité de l’autre', 'Grande empathie'],
      weaknesses: ['Tendance à éviter les conflits concrets', 'Humeur très changeante', 'Déceptions dues à l’idéalisation'],
      datingTip: 'Acceptez que les conflits fassent partie de la relation. Même imparfaite, une relation sincère dure plus longtemps.',
      cautionPoints: ['Idéaliser l’autre puis être vite déçu', 'Tendance à fuir en cas de conflit'],
    },
    ENFJ: {
      name: 'Architecte d’un amour dévoué',
      loveStyle: 'Vous placez le bonheur et l’épanouissement de votre partenaire au cœur de votre vie et bâtissez une belle relation par un engagement profond et chaleureux.',
      idealPartners: ['INFP', 'ISFP'],
      loveLanguages: ['Paroles valorisantes', 'Moments de qualité'],
      strengths: ['Empathie et compréhension profondes', 'Un amour dévoué et chaleureux', 'Déceler et soutenir le potentiel de l’autre'],
      weaknesses: ['Sacrifice de soi excessif', 'Sensibilité excessive à la critique', 'Fait passer ses besoins au second plan'],
      datingTip: 'Prendre soin de vos propres émotions et besoins autant que de l’autre rend la relation plus saine et plus durable.',
      cautionPoints: ['Épuisement émotionnel à force de trop donner', 'Blessure profonde en l’absence de reconnaissance'],
    },
    ENFP: {
      name: 'Âme libre passionnée',
      loveStyle: 'Dès la première rencontre, vous cherchez un lien profond et aimez explorer avec l’autre ses possibilités et son monde intérieur.',
      idealPartners: ['INTJ', 'INFJ'],
      loveLanguages: ['Paroles valorisantes', 'Toucher physique'],
      strengths: ['Une cour passionnée et des émotions exprimées', 'Des idées de sorties créatives', 'Déceler le potentiel de l’autre'],
      weaknesses: ['Humeur très changeante', 'Peut manquer de constance', 'Intérêt vite déplacé vers la nouveauté'],
      datingTip: 'Approfondir le lien avec le partenaire qui est déjà là, c’est la maturité d’un amour véritable.',
      cautionPoints: ['La passion du début peut retomber avec le temps', 'Idéaliser l’autre puis être déçu, de façon répétée'],
    },
    ISTJ: {
      name: 'Partenaire solide et fiable',
      loveStyle: 'Vous prouvez votre amour par les actes plus que par les mots et construisez patiemment une relation stable et digne de confiance.',
      idealPartners: ['ESFP', 'ESTP'],
      loveLanguages: ['Services rendus', 'Moments de qualité'],
      strengths: ['Une fiabilité inébranlable', 'Un partenariat responsable', 'Une relation stable et prévisible'],
      weaknesses: ['Maladresse à exprimer ses émotions', 'Difficulté avec le changement et l’imprévu', 'Peu de gestes romantiques'],
      datingTip: 'Un simple « je t’aime » peut être un grand cadeau pour l’autre. Entraînez-vous aussi à le dire.',
      cautionPoints: ['Le manque d’expression peut sembler froid'],
    },
    ISFJ: {
      name: 'Protecteur chaleureux',
      loveStyle: 'Attentionné envers l’autre, vous construisez une relation stable et chaleureuse, comme un foyer.',
      idealPartners: ['ESTP', 'ESFP'],
      loveLanguages: ['Services rendus', 'Cadeaux'],
      strengths: ['Une attention minutieuse', 'Une relation stable et dévouée', 'La tendresse de se souvenir et de prendre soin'],
      weaknesses: ['Difficulté à exprimer ses besoins', 'Frustrations accumulées à force d’éviter les conflits', 'Inquiétude face au changement'],
      datingTip: 'Vos émotions et vos besoins comptent aussi. Si vous ne les exprimez pas, l’autre ne peut pas les connaître.',
      cautionPoints: ['Épuisement à force de refouler ses émotions', 'Frustrations accumulées en évitant les conflits'],
    },
    ESTJ: {
      name: 'Leader responsable du couple',
      loveStyle: 'Vous clarifiez rôles et responsabilités dans la relation et recherchez un partenariat concret et solide, tourné vers des objectifs communs.',
      idealPartners: ['ISFP', 'ISTP'],
      loveLanguages: ['Services rendus', 'Paroles valorisantes'],
      strengths: ['Une responsabilité digne de confiance', 'Une communication claire et directe', 'Résolution pratique des problèmes'],
      weaknesses: ['Trop contrôlant', 'Logique et efficacité avant l’émotion', 'Manque de souplesse'],
      datingTip: 'Ne cherchez pas à tout régler efficacement ; parfois, rester simplement présent aux émotions de l’autre suffit.',
      cautionPoints: ['Tendance à trop gérer la relation'],
    },
    ESFJ: {
      name: 'Soignant plein d’amour',
      loveStyle: 'Vous voulez tout savoir de l’autre et vous investissez sans compter dans la relation.',
      idealPartners: ['ISFP', 'ISTP'],
      loveLanguages: ['Services rendus', 'Moments de qualité'],
      strengths: ['Une attitude chaleureuse et accueillante', 'Une attention minutieuse', 'Une ambiance harmonieuse dans la relation'],
      weaknesses: ['Dépendance à la reconnaissance des autres', 'Tendance à éviter les conflits', 'Sacrifice de soi excessif'],
      datingTip: 'Entraînez-vous à moins dépendre de la reconnaissance de l’autre. Votre valeur ne dépend pas de ses réactions.',
      cautionPoints: ['Anxiété et blessure sans reconnaissance', 'Se perdre en s’adaptant trop à l’autre'],
    },
    ISTP: {
      name: 'Réaliste libre',
      loveStyle: 'Vous gardez votre indépendance tout en exprimant votre amour de façon pratique, et préférez une relation libre et sans contrainte.',
      idealPartners: ['ESTJ', 'ESFJ'],
      loveLanguages: ['Toucher physique', 'Services rendus'],
      strengths: ['Résolution pratique des problèmes', 'Respect de l’indépendance de l’autre', 'Calme en situation de crise'],
      weaknesses: ['Grande difficulté à exprimer ses émotions', 'Évite de parler des projets à long terme', 'Trop d’indépendance peut faire se sentir délaissé l’autre'],
      datingTip: 'Le silence peut parfois sembler de la distance. Entraînez-vous à exprimer vos émotions, même un peu.',
      cautionPoints: ['Sans expression émotionnelle, l’autre peut manquer d’assurance', 'Trop d’indépendance risque de rompre le lien'],
    },
    ISFP: {
      name: 'Artiste sensible et discret',
      loveStyle: 'Vous aimez avec délicatesse et sincérité, créez ensemble de beaux moments et recherchez une relation sensible, ancrée dans le présent.',
      idealPartners: ['ENFJ', 'ENTJ'],
      loveLanguages: ['Toucher physique', 'Cadeaux'],
      strengths: ['Une sensibilité délicate et belle', 'Un amour libre et sans jugement', 'Vivre pleinement l’instant'],
      weaknesses: ['Évite de parler de l’avenir', 'Tendance à fuir les conflits', 'Difficulté à exprimer ses émotions profondes'],
      datingTip: 'Éviter un conflit ne le fait pas disparaître. Partagez vos émotions, même doucement.',
      cautionPoints: ['Frustrations accumulées en évitant les conflits', 'Des malentendus faute d’exprimer ses émotions'],
    },
    ESTP: {
      name: 'Amoureux aventurier',
      loveStyle: 'Spontané et plein d’énergie, vous aimez partager avec l’autre de nouvelles expériences et des sensations fortes.',
      idealPartners: ['ISFJ', 'ISTJ'],
      loveLanguages: ['Toucher physique', 'Cadeaux'],
      strengths: ['Des sorties vivantes et amusantes', 'Une relation spontanée et libre', 'Le talent de profiter de l’instant'],
      weaknesses: ['Néglige l’avenir et la stabilité', 'Évite les conversations émotionnelles profondes', 'Vite lassé'],
      datingTip: 'Au-delà de l’excitation et de la nouveauté, un lien profond enrichit aussi la relation. Prévoyez des moments de conversation sérieuse avec votre partenaire.',
      cautionPoints: ['Le manque de stabilité peut inquiéter l’autre', 'Risque de quitter la relation par ennui'],
    },
    ESFP: {
      name: 'Âme libre qui aime la vie',
      loveStyle: 'Vous exprimez votre amour avec passion et chaleur ; avec votre partenaire, chaque quotidien devient une aventure spéciale.',
      idealPartners: ['ISFJ', 'ISTJ'],
      loveLanguages: ['Toucher physique', 'Cadeaux'],
      strengths: ['Énergie et enthousiasme débordants', 'Expression chaleureuse et franche des émotions', 'Maximiser le bonheur de l’instant'],
      weaknesses: ['Difficulté à planifier à long terme', 'Humeur très changeante', 'Concentré sur le présent plus que sur l’avenir'],
      datingTip: 'Autant que le bonheur de l’instant, imaginez aussi l’avenir avec votre partenaire.',
      cautionPoints: ['Difficulté à s’engager pour l’avenir', 'Des sautes d’humeur qui déroutent l’autre'],
    },
  },
  es: {
    INTJ: {
      name: 'Romántico estratega',
      loveStyle: 'Eliges el amor de forma independiente y prudente, pero cuando te abres te conviertes en una pareja profunda y entregada. Demuestras el amor con hechos más que con emociones.',
      idealPartners: ['ENFP', 'ENTP'],
      loveLanguages: ['Palabras de afirmación', 'Tiempo de calidad'],
      strengths: ['Lealtad y compromiso profundos', 'Hacer crecer la relación con conversaciones intelectuales', 'Una relación estable y duradera'],
      weaknesses: ['Torpeza al expresar emociones', 'Expectativas perfeccionistas que generan conflictos', 'Malentendidos por la necesidad de estar a solas'],
      datingTip: 'Practica expresar con palabras tu gratitud y tu cariño. Los hechos por sí solos pueden no llegar del todo al otro.',
      cautionPoints: ['Distancia por falta de expresión emocional', 'Estándares demasiado altos'],
    },
    INTP: {
      name: 'Compañero filósofo',
      loveStyle: 'Basas el amor en la conexión intelectual y buscas una relación en la que os entendáis de verdad y crezcáis juntos.',
      idealPartners: ['ENTJ', 'ENFJ'],
      loveLanguages: ['Palabras de afirmación', 'Tiempo de calidad'],
      strengths: ['Comprensión y aceptación profundas', 'Una actitud flexible y sin juicios', 'Conversaciones creativas e interesantes'],
      weaknesses: ['Dificultad para expresar emociones', 'Incomodidad ante decisiones espontáneas', 'Descuido de los detalles prácticos'],
      datingTip: 'Antes de analizar con lógica las necesidades emocionales del otro, practica primero la empatía.',
      cautionPoints: ['El análisis por delante de la emoción puede parecer frío'],
    },
    ENTJ: {
      name: 'Pareja que lidera',
      loveStyle: 'Enfocas la relación como una meta y buscas una alianza fuerte en la que ambos crezcáis y avancéis.',
      idealPartners: ['INFP', 'INTP'],
      loveLanguages: ['Palabras de afirmación', 'Actos de servicio'],
      strengths: ['Gran empuje y liderazgo', 'Una visión de futuro clara y compartida', 'Apoyo activo al crecimiento del otro'],
      weaknesses: ['Tendencia a dominar y controlar', 'La eficiencia antes que la emoción', 'Puedes ignorar el ritmo del otro'],
      datingTip: 'Una relación no es un proyecto. Respeta el ritmo del otro; a veces basta con estar a su lado.',
      cautionPoints: ['Puedes presionar demasiado al otro', 'Puedes ver las necesidades emocionales como una debilidad'],
    },
    ENTP: {
      name: 'Polemista libre',
      loveStyle: 'Haces avanzar la relación con estímulo intelectual y humor, y te gustan las relaciones dinámicas en las que os retáis y crecéis juntos.',
      idealPartners: ['INFJ', 'INTJ'],
      loveLanguages: ['Palabras de afirmación', 'Tiempo de calidad'],
      strengths: ['Ideas de citas creativas y originales', 'Estímulo intelectual y diversión', 'Ingenio y humor que animan la relación'],
      weaknesses: ['Falta de constancia y estabilidad', 'Tendencia a evitar la profundidad emocional', 'Los debates pueden acabar en discusión'],
      datingTip: 'Cultiva la sensibilidad de notar cuándo el otro quiere empatía en lugar de debate.',
      cautionPoints: ['Disfrutar discutiendo puede cansar al otro'],
    },
    INFJ: {
      name: 'Amante del alma',
      loveStyle: 'Buscas una única alma gemela verdadera y una relación profunda y significativa más allá de lo superficial.',
      idealPartners: ['ENFP', 'ENTP'],
      loveLanguages: ['Tiempo de calidad', 'Palabras de afirmación'],
      strengths: ['Empatía y comprensión profundas', 'Un amor entregado y serio', 'Apoyo activo al crecimiento de la pareja'],
      weaknesses: ['Idealismo sobre la relación perfecta', 'Necesidad de tiempo a solas para recuperarte', 'Recuerdas las heridas durante mucho tiempo'],
      datingTip: 'En lugar de esperar una relación perfecta, disfruta del camino de crecer con una pareja real.',
      cautionPoints: ['Te decepcionas fácilmente si no encaja con tu ideal', 'Agotamiento emocional por dar demasiado'],
    },
    INFP: {
      name: 'Idealista romántico',
      loveStyle: 'Valoras por encima de todo la autenticidad y la profundidad emocional, y sueñas con un amor especial en el que las almas se conecten.',
      idealPartners: ['ENFJ', 'ENTJ'],
      loveLanguages: ['Palabras de afirmación', 'Regalos'],
      strengths: ['Expresión emocional sincera y profunda', 'Valoras la singularidad de tu pareja', 'Gran empatía'],
      weaknesses: ['Tendencia a evitar los conflictos reales', 'Altibajos emocionales fuertes', 'Decepciones por idealizar'],
      datingTip: 'Acepta que los conflictos también forman parte de la relación. Aunque no sea perfecta, una relación sincera dura más.',
      cautionPoints: ['Idealizas a tu pareja y te decepcionas con facilidad', 'Tendencia a evitar el conflicto'],
    },
    ENFJ: {
      name: 'Arquitecto de un amor entregado',
      loveStyle: 'Pones la felicidad y el crecimiento de tu pareja en el centro de tu vida y construyes una relación bonita con una entrega profunda y cálida.',
      idealPartners: ['INFP', 'ISFP'],
      loveLanguages: ['Palabras de afirmación', 'Tiempo de calidad'],
      strengths: ['Empatía y comprensión profundas', 'Un amor entregado y cálido', 'Descubrir y apoyar el potencial del otro'],
      weaknesses: ['Sacrificio personal excesivo', 'Sensibilidad excesiva a la crítica', 'Dejas tus necesidades para después'],
      datingTip: 'Cuidar de tus propias emociones y necesidades tanto como de las del otro hace la relación más sana y duradera.',
      cautionPoints: ['Agotamiento emocional por dar demasiado', 'Heridas profundas si no te reconocen'],
    },
    ENFP: {
      name: 'Espíritu libre apasionado',
      loveStyle: 'Desde el primer encuentro buscas una conexión profunda y te encanta explorar junto al otro sus posibilidades y su mundo interior.',
      idealPartners: ['INTJ', 'INFJ'],
      loveLanguages: ['Palabras de afirmación', 'Contacto físico'],
      strengths: ['Cortejo apasionado y expresión emocional', 'Ideas de citas creativas', 'Descubrir el potencial del otro'],
      weaknesses: ['Altibajos emocionales fuertes', 'Puede faltar constancia', 'El interés cambia rápido hacia lo nuevo'],
      datingTip: 'Profundizar el vínculo con la pareja que ya tienes al lado es la madurez del amor verdadero.',
      cautionPoints: ['La pasión inicial puede enfriarse con el tiempo', 'Un patrón de idealizar al otro y decepcionarse'],
    },
    ISTJ: {
      name: 'Pareja sólida y fiable',
      loveStyle: 'Demuestras el amor con hechos más que con palabras y construyes con constancia una relación estable y de confianza.',
      idealPartners: ['ESFP', 'ESTP'],
      loveLanguages: ['Actos de servicio', 'Tiempo de calidad'],
      strengths: ['Fiabilidad inquebrantable', 'Una relación responsable', 'Una relación estable y previsible'],
      weaknesses: ['Torpeza al expresar emociones', 'Dificultad con el cambio y la improvisación', 'Pocos gestos románticos'],
      datingTip: 'Un simple «te quiero» puede ser un gran regalo para el otro. Practica también decirlo.',
      cautionPoints: ['La falta de expresión puede parecer frialdad'],
    },
    ISFJ: {
      name: 'Protector cálido',
      loveStyle: 'Atento con el otro, construyes una relación estable y cálida, como un hogar.',
      idealPartners: ['ESTP', 'ESFP'],
      loveLanguages: ['Actos de servicio', 'Regalos'],
      strengths: ['Consideración minuciosa', 'Una relación estable y entregada', 'La ternura de recordar y cuidar al otro'],
      weaknesses: ['Dificultad para expresar tus necesidades', 'Malestar acumulado por evitar conflictos', 'Inquietud ante los cambios'],
      datingTip: 'Tus emociones y necesidades también importan. Si no las expresas, el otro no puede conocerlas.',
      cautionPoints: ['Agotamiento por reprimir tus emociones', 'Malestar acumulado por evitar conflictos'],
    },
    ESTJ: {
      name: 'Líder responsable de la relación',
      loveStyle: 'Aclaras roles y responsabilidades en la relación y buscas una alianza práctica y sólida para lograr metas juntos.',
      idealPartners: ['ISFP', 'ISTP'],
      loveLanguages: ['Actos de servicio', 'Palabras de afirmación'],
      strengths: ['Responsabilidad de confianza', 'Comunicación clara y directa', 'Capacidad práctica para resolver problemas'],
      weaknesses: ['Demasiado controlador', 'La lógica y la eficiencia antes que la emoción', 'Falta de flexibilidad'],
      datingTip: 'No intentes resolverlo todo con eficiencia; a veces basta con acompañar las emociones del otro.',
      cautionPoints: ['Tendencia a gestionar en exceso la relación'],
    },
    ESFJ: {
      name: 'Cuidador lleno de amor',
      loveStyle: 'Quieres saberlo todo del otro y te entregas sin reservas a la relación.',
      idealPartners: ['ISFP', 'ISTP'],
      loveLanguages: ['Actos de servicio', 'Tiempo de calidad'],
      strengths: ['Actitud cálida y acogedora', 'Consideración minuciosa', 'Crear un ambiente de armonía en la relación'],
      weaknesses: ['Dependencia del reconocimiento ajeno', 'Tendencia a evitar conflictos', 'Sacrificio personal excesivo'],
      datingTip: 'Practica depender menos del reconocimiento del otro. Tu valor no depende de la reacción de nadie.',
      cautionPoints: ['Ansiedad y heridas si no te reconocen', 'Perderte adaptándote en exceso al otro'],
    },
    ISTP: {
      name: 'Realista libre',
      loveStyle: 'Mantienes tu independencia mientras expresas el amor de forma práctica, y prefieres una relación libre y sin presiones.',
      idealPartners: ['ESTJ', 'ESFJ'],
      loveLanguages: ['Contacto físico', 'Actos de servicio'],
      strengths: ['Resolución práctica de problemas', 'Respeto por la independencia del otro', 'Calma en situaciones de crisis'],
      weaknesses: ['Gran dificultad para expresar emociones', 'Evitas hablar de planes a largo plazo', 'Tanta independencia puede hacer que el otro se sienta apartado'],
      datingTip: 'El silencio a veces se siente como distancia. Practica expresar tus emociones, aunque sea poco a poco.',
      cautionPoints: ['Sin expresión emocional, el otro puede sentirse inseguro', 'Riesgo de ruptura del vínculo por exceso de independencia'],
    },
    ISFP: {
      name: 'Artista sensible y discreto',
      loveStyle: 'Amas con delicadeza y autenticidad, creas momentos bonitos juntos y buscas una relación sensible, centrada en el presente.',
      idealPartners: ['ENFJ', 'ENTJ'],
      loveLanguages: ['Contacto físico', 'Regalos'],
      strengths: ['Una sensibilidad delicada y bella', 'Un amor libre y sin juicios', 'Vivir plenamente el presente'],
      weaknesses: ['Evitas hablar de planes de futuro', 'Tendencia a evitar los conflictos', 'Dificultad para expresar emociones profundas'],
      datingTip: 'Evitar un conflicto no hace que desaparezca. Comparte lo que sientes, aunque sea en voz baja.',
      cautionPoints: ['Malestar acumulado por evitar conflictos', 'Malentendidos por la dificultad de expresarte'],
    },
    ESTP: {
      name: 'Amante aventurero',
      loveStyle: 'Disfrutas de la relación de forma espontánea y llena de energía, y te encanta compartir experiencias nuevas y emociones fuertes.',
      idealPartners: ['ISFJ', 'ISTJ'],
      loveLanguages: ['Contacto físico', 'Regalos'],
      strengths: ['Citas animadas y divertidas', 'Una relación espontánea y libre', 'Capacidad de disfrutar del presente'],
      weaknesses: ['Descuidas el futuro y la estabilidad', 'Evitas conversaciones emocionales profundas', 'Te aburres con facilidad'],
      datingTip: 'Más allá de la emoción y la novedad, una conexión profunda también enriquece la relación. Reserva tiempo para conversaciones serias con tu pareja.',
      cautionPoints: ['La falta de estabilidad puede inquietar al otro', 'Riesgo de abandonar la relación por aburrimiento'],
    },
    ESFP: {
      name: 'Espíritu libre enamorado de la vida',
      loveStyle: 'Expresas el amor con pasión y calidez; con tu pareja, cualquier día se convierte en una aventura especial.',
      idealPartners: ['ISFJ', 'ISTJ'],
      loveLanguages: ['Contacto físico', 'Regalos'],
      strengths: ['Energía y entusiasmo desbordantes', 'Expresión emocional cálida y sincera', 'Maximizar la felicidad del presente'],
      weaknesses: ['Dificultad para planificar a largo plazo', 'Altibajos emocionales fuertes', 'Te centras en el presente más que en el futuro'],
      datingTip: 'Tanto como la felicidad de este momento, imagina también el futuro junto a tu pareja.',
      cautionPoints: ['Te cuesta comprometerte con el futuro', 'Tus altibajos pueden confundir al otro'],
    },
  },
}

// ─── MBTI Calculation ─────────────────────────────────────────────────────────
function calcMBTI(answers: Partial<Score>[]): { type: MBTIType; scores: Score } {
  const s: Score = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 }
  answers.forEach(a => {
    (Object.keys(a) as Dim[]).forEach(k => { s[k] += (a[k] ?? 0) })
  })
  const type = (
    (s.E >= s.I ? 'E' : 'I') +
    (s.S >= s.N ? 'S' : 'N') +
    (s.T >= s.F ? 'T' : 'F') +
    (s.J >= s.P ? 'J' : 'P')
  ) as MBTIType
  return { type, scores: s }
}

function dimPct(a: number, b: number) {
  const total = a + b
  return total === 0 ? 50 : Math.round((a / total) * 100)
}

// ─── Component ────────────────────────────────────────────────────────────────
interface Props { locale?: string }

export default function MbtiLoveTest({ locale = 'ko' }: Props) {
  // 없는 로케일은 en 으로 (ko 로 떨어뜨리면 타 로케일에 한국어가 노출된다)
  const lang = (['ko', 'en', 'ja', 'zh', 'fr', 'es'].includes(locale) ? locale : 'en') as Locale
  const t = LABELS[lang]
  const questions = QUESTIONS[lang]

  const [step, setStep] = useState<'test' | 'result'>('test')
  const [current, setCurrent] = useState(0)
  // 고른 선택지의 인덱스를 남긴다. 점수 객체만 쌓으면 어느 항목을 골랐는지 복원할 수 없어
  // 되돌아갔을 때 선택 표시가 되지 않는다.
  const [answers, setAnswers] = useState<number[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [result, setResult] = useState<{ type: MBTIType; scores: Score } | null>(null)
  useRecordFinishedTest({ testId: "mbti-love", title: "MbtiLoveTest", finished: Boolean(result) });
  const [copied, setCopied] = useState(false)

  const q = questions[current]

  function pick(idx: number) {
    if (selected !== null) return
    setSelected(idx)
    const newAnswers = answers.slice(0, current)
    newAnswers[current] = idx

    setTimeout(() => {
      if (current + 1 < questions.length) {
        setCurrent(c => c + 1)
        setAnswers(newAnswers)
        setSelected(null)
      } else {
        const r = calcMBTI(newAnswers.map((optIdx, i) => questions[i].options[optIdx].score))
        setResult(r)
        setStep('result')
      }
    }, 280)
  }

  function restart() {
    setCurrent(0)
    setAnswers([])
    setSelected(null)
    setResult(null)
    setStep('test')
  }

  function shareResult() {
    if (!result) return
    const url = `${window.location.href.split('?')[0]}?type=${result.type}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }

  // ── Result View ──────────────────────────────────────────────────────────────
  if (step === 'result' && result) {
    const data = RESULTS[lang][result.type]
    const { scores: s } = result
    const chartData = [
      { dim: t.chartEI, value: dimPct(s.E, s.I), label: `E ${dimPct(s.E, s.I)}%` },
      { dim: t.chartSN, value: dimPct(s.S, s.N), label: `S ${dimPct(s.S, s.N)}%` },
      { dim: t.chartTF, value: dimPct(s.T, s.F), label: `T ${dimPct(s.T, s.F)}%` },
      { dim: t.chartJP, value: dimPct(s.J, s.P), label: `J ${dimPct(s.J, s.P)}%` },
    ]

    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{t.resultTitle}</p>
          <div className="inline-block bg-primary text-primary-foreground text-4xl font-black px-6 py-2 rounded-lg">
            {result.type}
          </div>
          <p className="text-xl font-bold">{data.name}</p>
        </div>

        {/* Radar Chart */}
        <div className="bg-card border rounded-xl p-4">
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={chartData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="dim" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Radar name="score" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} strokeWidth={2} />
              <Tooltip formatter={((v: number) => `${v}%`) as any} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Love Style */}
        <div className="bg-card border rounded-xl p-5 space-y-2">
          <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">{t.loveStyle}</h3>
          <p className="text-sm leading-relaxed">{data.loveStyle}</p>
        </div>

        {/* Ideal Partners + Love Languages */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">{t.idealPartners}</h3>
            <div className="flex flex-wrap gap-1.5">
              {data.idealPartners.map(p => (
                <span key={p} className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded">{p}</span>
              ))}
            </div>
          </div>
          <div className="bg-card border rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">{t.loveLanguages}</h3>
            <div className="space-y-1">
              {data.loveLanguages.map(l => (
                <p key={l} className="text-xs">{l}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-card border rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-green-600">{t.strengths}</h3>
            <ul className="space-y-1">
              {data.strengths.map((s, i) => (
                <li key={i} className="text-xs flex gap-1.5"><span className="text-green-500 mt-0.5">✓</span>{s}</li>
              ))}
            </ul>
          </div>
          <div className="bg-card border rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-amber-600">{t.weaknesses}</h3>
            <ul className="space-y-1">
              {data.weaknesses.map((w, i) => (
                <li key={i} className="text-xs flex gap-1.5"><span className="text-amber-500 mt-0.5">△</span>{w}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Dating Tip */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 space-y-1">
          <h3 className="font-bold text-sm text-primary">{t.datingTip}</h3>
          <p className="text-sm leading-relaxed">{data.datingTip}</p>
        </div>

        {/* Caution */}
        <div className="bg-card border rounded-xl p-4 space-y-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">{t.caution}</h3>
          <ul className="space-y-1">
            {data.cautionPoints.map((c, i) => (
              <li key={i} className="text-xs flex gap-1.5"><span className="text-muted-foreground">·</span>{c}</li>
            ))}
          </ul>
        </div>

        <ShareResultButton
          locale={lang}
          heading={t.resultTitle}
          emoji="💘"
          resultTitle={`${result.type} — ${data.name}`}
          description={chartData.map(d => d.label).join(' · ')}
        />

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={restart}
            className="flex-1 border border-border rounded-lg py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            {t.retake}
          </button>
          <button
            onClick={shareResult}
            className="flex-1 bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {copied ? t.copied : t.share}
          </button>
        </div>
      </div>
    )
  }

  // ── Test View ────────────────────────────────────────────────────────────────
  const progress = Math.round((current / questions.length) * 100)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{t.title}</p>
        <p className="text-sm text-muted-foreground">{t.instructions}</p>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{t.progress(current + 1, questions.length)}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Questionnaire
        title={t.title}
        subtitle={t.instructions}
        question={q.text}
        questionLabel={t.progress(current + 1, questions.length)}
        progress={progress}
        options={q.options.map((opt, idx) => ({ label: opt.text, value: idx + 1 }))}
        selectedValue={
          selected !== null ? selected + 1 : answers[current] === undefined ? undefined : answers[current] + 1
        }
        previousLabel={({ ko: '이전 질문', en: 'Previous question', ja: '前の質問', zh: '上一题', fr: 'Question précédente', es: 'Pregunta anterior' } as Record<string, string>)[locale] ?? 'Previous question'}
        onPrevious={current > 0 && selected === null ? () => setCurrent(c => c - 1) : undefined}
        onSelect={(value) => pick(value - 1)}
      />
    </div>
  )
}
