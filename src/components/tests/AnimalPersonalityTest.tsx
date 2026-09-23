import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { Questionnaire } from '@/components/ui/questionnaire'
import ShareResultButton from '../shared/ShareResultButton'

type SupportedLang = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'
type AnimalType = 'eagle' | 'wolf' | 'fox' | 'bear' | 'dolphin' | 'owl' | 'tiger' | 'rabbit'

function lang(locale: string): SupportedLang {
  return (['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const).includes(locale as SupportedLang) ? (locale as SupportedLang) : 'en'
}

interface Question {
  id: string; text: string
  options: { label: string; animal: AnimalType }[]
}

interface AnimalResult {
  name: string; emoji: string; tagline: string; description: string
  strengths: string[]; shadow: string[]; compatible: string[]
}

const LABELS: Record<SupportedLang, {
  title: string; subtitle: string
  questionOf: (c: number, t: number) => string
  restart: string; share: string; shareMsg: string
  yourAnimal: string; strengths: string; shadow: string; compatible: string
  note: string
}> = {
  ko: {
    title: '나의 정신 동물 테스트',
    subtitle: '내 본능을 대표하는 동물은?',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '나의 정신 동물은',
    yourAnimal: '나의 정신 동물',
    strengths: '핵심 강점',
    shadow: '그림자 면',
    compatible: '잘 맞는 동물',
    note: '이 테스트는 당신의 본능적 성격 패턴을 탐색하는 도구입니다.',
  },
  en: {
    title: 'Spirit Animal Test',
    subtitle: 'What Animal Represents You?',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My spirit animal is',
    yourAnimal: 'Your Spirit Animal',
    strengths: 'Core Strengths',
    shadow: 'Shadow Side',
    compatible: 'Compatible Animals',
    note: 'This test explores your instinctive personality patterns.',
  },
  ja: {
    title: '私の精神動物テスト',
    subtitle: '私の本能を表す動物は？',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '私の精神動物は',
    yourAnimal: 'あなたの精神動物',
    strengths: '核心的強み',
    shadow: 'シャドウ面',
    compatible: '相性の良い動物',
    note: 'このテストはあなたの本能的な性格パターンを探るツールです。',
  },  zh: {
    title: '我的守护动物测验',
    subtitle: '哪种动物最像你的本能？',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: '重新测验',
    share: '分享结果',
    shareMsg: '我的守护动物是',
    yourAnimal: '我的守护动物',
    strengths: '核心长处',
    shadow: '暗面',
    compatible: '合得来的动物',
    note: '这个测验是用来看你本能反应的倾向，不是给性格下定论。',
  },
  fr: {
    title: 'Test de l’animal totem',
    subtitle: 'Quel animal ressemble le plus à votre instinct ?',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: 'Recommencer',
    share: 'Partager le résultat',
    shareMsg: 'Mon animal totem est',
    yourAnimal: 'Votre animal totem',
    strengths: 'Forces principales',
    shadow: 'Face d’ombre',
    compatible: 'Animaux complémentaires',
    note: 'Ce test explore vos réflexes instinctifs ; il ne conclut rien sur votre personnalité.',
  },
  es: {
    title: 'Test del animal interior',
    subtitle: '¿Qué animal se parece más a tu instinto?',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: 'Repetir',
    share: 'Compartir resultado',
    shareMsg: 'Mi animal interior es',
    yourAnimal: 'Tu animal interior',
    strengths: 'Fortalezas principales',
    shadow: 'Cara en sombra',
    compatible: 'Animales que encajan',
    note: 'Este test explora tus reacciones instintivas; no dictamina cómo eres.',
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 'q1', text: '중요한 결정을 내릴 때 나는…', options: [{ label: '멀리서 전체 그림을 본다', animal: 'eagle' }, { label: '신뢰하는 사람들과 의논한다', animal: 'wolf' }, { label: '모든 각도를 영리하게 계산한다', animal: 'fox' }, { label: '내 직감과 경험을 믿는다', animal: 'bear' }] },
    { id: 'q2', text: '나의 사교 방식은…', options: [{ label: '혼자이든 함께이든 자유롭다', animal: 'eagle' }, { label: '소수의 깊은 관계를 선호한다', animal: 'wolf' }, { label: '넓고 다양한 인맥을 갖는다', animal: 'fox' }, { label: '많은 친구들과 활발히 교류한다', animal: 'dolphin' }] },
    { id: 'q3', text: '어려운 상황에서 나의 대응은…', options: [{ label: '높은 관점에서 해결책을 찾는다', animal: 'eagle' }, { label: '팀을 모아 함께 돌파한다', animal: 'wolf' }, { label: '지혜롭게 우회로를 찾는다', animal: 'fox' }, { label: '단단하게 버티고 정면 돌파한다', animal: 'bear' }] },
    { id: 'q4', text: '나의 에너지 스타일은…', options: [{ label: '차갑고 집중된 고독한 에너지', animal: 'owl' }, { label: '뜨겁고 폭발적인 용기 에너지', animal: 'tiger' }, { label: '빠르고 민첩한 회피 에너지', animal: 'rabbit' }, { label: '따뜻하고 연결된 사회적 에너지', animal: 'dolphin' }] },
    { id: 'q5', text: '리더십에 대한 나의 태도는…', options: [{ label: '비전을 제시하며 조용히 이끈다', animal: 'eagle' }, { label: '팀을 충성스럽게 하나로 모은다', animal: 'wolf' }, { label: '상황을 전략적으로 움직인다', animal: 'fox' }, { label: '힘과 경험으로 앞에서 이끈다', animal: 'bear' }] },
    { id: 'q6', text: '내가 가장 즐기는 활동은…', options: [{ label: '높은 목표를 향해 도전하기', animal: 'eagle' }, { label: '가족이나 친한 그룹과 함께 시간 보내기', animal: 'wolf' }, { label: '새로운 사람을 만나고 교류하기', animal: 'dolphin' }, { label: '지식을 탐구하고 독서하기', animal: 'owl' }] },
    { id: 'q7', text: '나의 의사소통 스타일은…', options: [{ label: '간결하고 핵심적인 소통', animal: 'eagle' }, { label: '직접적이고 강렬한 소통', animal: 'tiger' }, { label: '영리하고 설득력 있는 소통', animal: 'fox' }, { label: '친절하고 재미있는 소통', animal: 'dolphin' }] },
    { id: 'q8', text: '내가 화가 났을 때는…', options: [{ label: '조용히 물러나 혼자 처리한다', animal: 'owl' }, { label: '그 즉시 폭발적으로 표현한다', animal: 'tiger' }, { label: '감정을 숨기고 전략적으로 대응한다', animal: 'fox' }, { label: '울거나 도망치고 싶다', animal: 'rabbit' }] },
    { id: 'q9', text: '성공에 대한 나의 정의는…', options: [{ label: '높은 곳에서 내 비전을 실현하는 것', animal: 'eagle' }, { label: '내 무리/팀이 함께 성장하는 것', animal: 'wolf' }, { label: '목적한 것을 영리하게 달성하는 것', animal: 'fox' }, { label: '두려움 없이 도전을 극복하는 것', animal: 'tiger' }] },
    { id: 'q10', text: '나는 스트레스를 풀 때…', options: [{ label: '혼자 자연 속을 걷거나 높은 곳에 간다', animal: 'eagle' }, { label: '신뢰하는 사람과 깊은 대화를 한다', animal: 'wolf' }, { label: '수영이나 물과 관련된 활동을 즐긴다', animal: 'dolphin' }, { label: '조용한 공간에서 사색하거나 독서한다', animal: 'owl' }] },
    { id: 'q11', text: '새로운 환경에서 나는…', options: [{ label: '먼저 전체를 파악하고 행동한다', animal: 'eagle' }, { label: '신중하게 관찰하다 친해진다', animal: 'wolf' }, { label: '빠르게 분위기를 읽고 적응한다', animal: 'fox' }, { label: '활발하게 먼저 다가간다', animal: 'dolphin' }] },
    { id: 'q12', text: '나의 가장 큰 강점은…', options: [{ label: '멀리 보는 비전과 통찰력', animal: 'eagle' }, { label: '흔들리지 않는 충성과 신뢰성', animal: 'wolf' }, { label: '깊은 지혜와 지식', animal: 'owl' }, { label: '무한한 용기와 대담함', animal: 'tiger' }] },
    { id: 'q13', text: '내가 두려워하는 것은…', options: [{ label: '자유를 잃고 제약받는 것', animal: 'eagle' }, { label: '내 무리/팀이 배신하거나 분열되는 것', animal: 'wolf' }, { label: '빠른 변화나 새로운 것', animal: 'rabbit' }, { label: '약하게 보이거나 지는 것', animal: 'tiger' }] },
    { id: 'q14', text: '나의 직관에 대해서는…', options: [{ label: '강력하고 거의 항상 맞다', animal: 'eagle' }, { label: '사람에 관해서는 믿을 수 있다', animal: 'wolf' }, { label: '패턴과 동기를 꿰뚫어 본다', animal: 'fox' }, { label: '위험을 감지하는 것이 예민하다', animal: 'rabbit' }] },
    { id: 'q15', text: '나의 일상적인 삶의 페이스는…', options: [{ label: '천천히, 하지만 확실하게', animal: 'bear' }, { label: '빠르고 민첩하게', animal: 'rabbit' }, { label: '팀과 함께 리드미컬하게', animal: 'dolphin' }, { label: '내 속도로, 필요할 때 폭발적으로', animal: 'tiger' }] },
    { id: 'q16', text: '나는 혼자 있을 때…', options: [{ label: '재충전되고 맑아진다', animal: 'eagle' }, { label: '무리가 그리워지고 연락하고 싶다', animal: 'wolf' }, { label: '깊이 사고하고 공부한다', animal: 'owl' }, { label: '안전하고 편안하다', animal: 'rabbit' }] },
  ],
  en: [
    { id: 'q1', text: 'When making an important decision, I…', options: [{ label: 'See the big picture from a distance', animal: 'eagle' }, { label: 'Consult people I trust', animal: 'wolf' }, { label: 'Calculate every angle cleverly', animal: 'fox' }, { label: 'Trust my gut and experience', animal: 'bear' }] },
    { id: 'q2', text: 'My social style is…', options: [{ label: 'Comfortable alone or with others', animal: 'eagle' }, { label: 'I prefer a few deep relationships', animal: 'wolf' }, { label: 'I have a wide, diverse network', animal: 'fox' }, { label: 'I actively engage with many friends', animal: 'dolphin' }] },
    { id: 'q3', text: 'In difficult situations, I…', options: [{ label: 'Find solutions from a higher vantage point', animal: 'eagle' }, { label: 'Rally the team to break through together', animal: 'wolf' }, { label: 'Wisely find a workaround', animal: 'fox' }, { label: 'Hold firm and push straight through', animal: 'bear' }] },
    { id: 'q4', text: 'My energy style is…', options: [{ label: 'Cool, focused, solitary energy', animal: 'owl' }, { label: 'Hot, explosive, courageous energy', animal: 'tiger' }, { label: 'Fast, nimble, evasive energy', animal: 'rabbit' }, { label: 'Warm, connected, social energy', animal: 'dolphin' }] },
    { id: 'q5', text: 'My attitude toward leadership is…', options: [{ label: 'Lead quietly with a clear vision', animal: 'eagle' }, { label: 'Loyally unite the team as one', animal: 'wolf' }, { label: 'Move situations strategically', animal: 'fox' }, { label: 'Lead from the front with strength', animal: 'bear' }] },
    { id: 'q6', text: 'My favorite activity is…', options: [{ label: 'Challenging toward high goals', animal: 'eagle' }, { label: 'Spending time with close family or group', animal: 'wolf' }, { label: 'Meeting new people and socializing', animal: 'dolphin' }, { label: 'Exploring knowledge and reading', animal: 'owl' }] },
    { id: 'q7', text: 'My communication style is…', options: [{ label: 'Concise and to the point', animal: 'eagle' }, { label: 'Direct and intense', animal: 'tiger' }, { label: 'Clever and persuasive', animal: 'fox' }, { label: 'Friendly and fun', animal: 'dolphin' }] },
    { id: 'q8', text: 'When I\'m angry, I…', options: [{ label: 'Quietly withdraw and process alone', animal: 'owl' }, { label: 'Express it explosively right away', animal: 'tiger' }, { label: 'Hide the emotion and respond strategically', animal: 'fox' }, { label: 'Want to cry or escape', animal: 'rabbit' }] },
    { id: 'q9', text: 'My definition of success is…', options: [{ label: 'Realizing my vision from a high place', animal: 'eagle' }, { label: 'My group/team growing together', animal: 'wolf' }, { label: 'Cleverly achieving what I set out to do', animal: 'fox' }, { label: 'Overcoming challenges without fear', animal: 'tiger' }] },
    { id: 'q10', text: 'To relieve stress, I…', options: [{ label: 'Walk in nature or go somewhere high', animal: 'eagle' }, { label: 'Have a deep conversation with a trusted person', animal: 'wolf' }, { label: 'Enjoy swimming or water activities', animal: 'dolphin' }, { label: 'Reflect or read in a quiet space', animal: 'owl' }] },
    { id: 'q11', text: 'In a new environment, I…', options: [{ label: 'First assess the whole, then act', animal: 'eagle' }, { label: 'Observe carefully before warming up', animal: 'wolf' }, { label: 'Quickly read the atmosphere and adapt', animal: 'fox' }, { label: 'Actively approach people first', animal: 'dolphin' }] },
    { id: 'q12', text: 'My greatest strength is…', options: [{ label: 'Far-reaching vision and insight', animal: 'eagle' }, { label: 'Unwavering loyalty and reliability', animal: 'wolf' }, { label: 'Deep wisdom and knowledge', animal: 'owl' }, { label: 'Boundless courage and boldness', animal: 'tiger' }] },
    { id: 'q13', text: 'What I fear most is…', options: [{ label: 'Losing freedom and being constrained', animal: 'eagle' }, { label: 'Betrayal or fracture within my group/team', animal: 'wolf' }, { label: 'Rapid change or new things', animal: 'rabbit' }, { label: 'Appearing weak or losing', animal: 'tiger' }] },
    { id: 'q14', text: 'Regarding my intuition…', options: [{ label: 'It\'s powerful and almost always right', animal: 'eagle' }, { label: 'I can trust it about people', animal: 'wolf' }, { label: 'I can see through patterns and motives', animal: 'fox' }, { label: 'I\'m sensitive to detecting danger', animal: 'rabbit' }] },
    { id: 'q15', text: 'My everyday life pace is…', options: [{ label: 'Slow, but sure', animal: 'bear' }, { label: 'Fast and nimble', animal: 'rabbit' }, { label: 'Rhythmic, together with the team', animal: 'dolphin' }, { label: 'My own pace, explosive when needed', animal: 'tiger' }] },
    { id: 'q16', text: 'When I\'m alone, I…', options: [{ label: 'Recharge and become clearer', animal: 'eagle' }, { label: 'Miss the group and want to reach out', animal: 'wolf' }, { label: 'Think deeply and study', animal: 'owl' }, { label: 'Feel safe and comfortable', animal: 'rabbit' }] },
  ],
  ja: [
    { id: 'q1', text: '重要な決断をするとき、私は…', options: [{ label: '遠くから全体像を見る', animal: 'eagle' }, { label: '信頼する人々に相談する', animal: 'wolf' }, { label: 'あらゆる角度を賢く計算する', animal: 'fox' }, { label: '直感と経験を信じる', animal: 'bear' }] },
    { id: 'q2', text: '私の社交スタイルは…', options: [{ label: '一人でも大勢でも自由に対応できる', animal: 'eagle' }, { label: '少数の深い関係を好む', animal: 'wolf' }, { label: '広く多様な人脈を持つ', animal: 'fox' }, { label: '多くの友人と積極的に交流する', animal: 'dolphin' }] },
    { id: 'q3', text: '困難な状況での私の対応は…', options: [{ label: '高い視点から解決策を見つける', animal: 'eagle' }, { label: 'チームをまとめて一緒に突破する', animal: 'wolf' }, { label: '賢く迂回路を見つける', animal: 'fox' }, { label: 'しっかり耐えて正面突破する', animal: 'bear' }] },
    { id: 'q4', text: '私のエネルギースタイルは…', options: [{ label: 'クールで集中した孤独なエネルギー', animal: 'owl' }, { label: '熱く爆発的な勇気のエネルギー', animal: 'tiger' }, { label: '速く機敏な回避エネルギー', animal: 'rabbit' }, { label: '温かく繋がった社会的エネルギー', animal: 'dolphin' }] },
    { id: 'q5', text: 'リーダーシップに対する私の姿勢は…', options: [{ label: 'ビジョンを示して静かに導く', animal: 'eagle' }, { label: 'チームを忠実に一つにまとめる', animal: 'wolf' }, { label: '状況を戦略的に動かす', animal: 'fox' }, { label: '力と経験で前に立って導く', animal: 'bear' }] },
    { id: 'q6', text: '最も楽しい活動は…', options: [{ label: '高い目標に向けてチャレンジする', animal: 'eagle' }, { label: '家族や親しいグループと時間を過ごす', animal: 'wolf' }, { label: '新しい人に会って交流する', animal: 'dolphin' }, { label: '知識を探求して読書する', animal: 'owl' }] },
    { id: 'q7', text: '私のコミュニケーションスタイルは…', options: [{ label: '簡潔で要点を突いた伝え方', animal: 'eagle' }, { label: '直接的で力強い伝え方', animal: 'tiger' }, { label: '賢く説得力ある伝え方', animal: 'fox' }, { label: '親切で楽しい伝え方', animal: 'dolphin' }] },
    { id: 'q8', text: '怒ったとき、私は…', options: [{ label: '静かに引いて一人で処理する', animal: 'owl' }, { label: 'すぐに爆発的に表現する', animal: 'tiger' }, { label: '感情を隠して戦略的に対応する', animal: 'fox' }, { label: '泣きたい、逃げたいと感じる', animal: 'rabbit' }] },
    { id: 'q9', text: '成功の定義は…', options: [{ label: '高い場所から自分のビジョンを実現すること', animal: 'eagle' }, { label: '仲間/チームが一緒に成長すること', animal: 'wolf' }, { label: '目的を賢く達成すること', animal: 'fox' }, { label: '恐れずに挑戦を乗り越えること', animal: 'tiger' }] },
    { id: 'q10', text: 'ストレスを発散するとき…', options: [{ label: '自然の中を歩いたり高い場所に行く', animal: 'eagle' }, { label: '信頼できる人と深く話す', animal: 'wolf' }, { label: '水泳や水に関するアクティビティを楽しむ', animal: 'dolphin' }, { label: '静かな場所で思索したり読書する', animal: 'owl' }] },
    { id: 'q11', text: '新しい環境では…', options: [{ label: 'まず全体を把握してから行動する', animal: 'eagle' }, { label: 'じっくり観察してから打ち解ける', animal: 'wolf' }, { label: '素早く雰囲気を読んで適応する', animal: 'fox' }, { label: '積極的に先に声をかける', animal: 'dolphin' }] },
    { id: 'q12', text: '私の最大の強みは…', options: [{ label: '遠くを見通すビジョンと洞察力', animal: 'eagle' }, { label: '揺るぎない忠誠と信頼性', animal: 'wolf' }, { label: '深い知恵と知識', animal: 'owl' }, { label: '無限の勇気と大胆さ', animal: 'tiger' }] },
    { id: 'q13', text: '最も恐れることは…', options: [{ label: '自由を失い制約されること', animal: 'eagle' }, { label: '仲間/チームの裏切りや分裂', animal: 'wolf' }, { label: '急激な変化や新しいこと', animal: 'rabbit' }, { label: '弱く見られること、負けること', animal: 'tiger' }] },
    { id: 'q14', text: '自分の直感については…', options: [{ label: '強力でほぼ常に正しい', animal: 'eagle' }, { label: '人に関しては信頼できる', animal: 'wolf' }, { label: 'パターンと動機を見抜ける', animal: 'fox' }, { label: '危険を感知するのが鋭い', animal: 'rabbit' }] },
    { id: 'q15', text: '日常生活のペースは…', options: [{ label: 'ゆっくりだが確実に', animal: 'bear' }, { label: '速く機敏に', animal: 'rabbit' }, { label: 'チームとリズミカルに', animal: 'dolphin' }, { label: '自分のペースで、必要な時に爆発的に', animal: 'tiger' }] },
    { id: 'q16', text: '一人でいるとき…', options: [{ label: '充電されて頭が澄み渡る', animal: 'eagle' }, { label: '仲間が恋しくなって連絡したくなる', animal: 'wolf' }, { label: '深く考えたり学んだりする', animal: 'owl' }, { label: '安全で心地よい', animal: 'rabbit' }] },
  ],
  zh: [
    { id: 'q1', text: '做重要决定时，我会…', options: [{ label: '拉远一点看整体', animal: 'eagle' }, { label: '找信得过的人商量', animal: 'wolf' }, { label: '把各个角度都算一遍', animal: 'fox' }, { label: '相信自己的直觉和经验', animal: 'bear' }] },
    { id: 'q2', text: '我的社交方式是…', options: [{ label: '一个人或一群人都自在', animal: 'eagle' }, { label: '偏好少而深的关系', animal: 'wolf' }, { label: '人脉广而杂', animal: 'fox' }, { label: '和很多朋友热络往来', animal: 'dolphin' }] },
    { id: 'q3', text: '遇到难处时，我会…', options: [{ label: '站高一点找解法', animal: 'eagle' }, { label: '把人聚起来一起闯', animal: 'wolf' }, { label: '聪明地绕个路', animal: 'fox' }, { label: '稳住阵脚，正面硬扛', animal: 'bear' }] },
    { id: 'q4', text: '我的能量是…', options: [{ label: '冷静、专注、独来独往', animal: 'owl' }, { label: '火热、爆发、有胆气', animal: 'tiger' }, { label: '轻快、灵巧、懂得闪', animal: 'rabbit' }, { label: '温暖、连结、爱热闹', animal: 'dolphin' }] },
    { id: 'q5', text: '对带人这件事，我…', options: [{ label: '给出方向，安静地领', animal: 'eagle' }, { label: '把团队牢牢聚成一体', animal: 'wolf' }, { label: '看局势下棋', animal: 'fox' }, { label: '凭实力和经验走在前面', animal: 'bear' }] },
    { id: 'q6', text: '我最享受的事是…', options: [{ label: '朝着高目标去挑战', animal: 'eagle' }, { label: '和家人或死党待着', animal: 'wolf' }, { label: '认识新朋友、聊开', animal: 'dolphin' }, { label: '钻研知识、看书', animal: 'owl' }] },
    { id: 'q7', text: '我说话的方式是…', options: [{ label: '简短，直指重点', animal: 'eagle' }, { label: '直接，力道足', animal: 'tiger' }, { label: '聪明，有说服力', animal: 'fox' }, { label: '亲切，带点好玩', animal: 'dolphin' }] },
    { id: 'q8', text: '我生气的时候会…', options: [{ label: '安静退开，自己消化', animal: 'owl' }, { label: '当场就炸出来', animal: 'tiger' }, { label: '先藏住情绪，再想对策', animal: 'fox' }, { label: '想哭，或想躲开', animal: 'rabbit' }] },
    { id: 'q9', text: '我心里的成功是…', options: [{ label: '站到高处，把想做的做成', animal: 'eagle' }, { label: '我这群人一起长大', animal: 'wolf' }, { label: '用巧劲把事办成', animal: 'fox' }, { label: '不怕难，把关卡跨过去', animal: 'tiger' }] },
    { id: 'q10', text: '压力大时，我会…', options: [{ label: '一个人去走走，或爬高处', animal: 'eagle' }, { label: '找信得过的人深聊', animal: 'wolf' }, { label: '游泳，或去玩水', animal: 'dolphin' }, { label: '找个安静角落发呆、读书', animal: 'owl' }] },
    { id: 'q11', text: '到了新环境，我会…', options: [{ label: '先把全局摸清再动', animal: 'eagle' }, { label: '先观察，再慢慢靠近', animal: 'wolf' }, { label: '很快读懂气氛，跟上', animal: 'fox' }, { label: '主动先开口', animal: 'dolphin' }] },
    { id: 'q12', text: '我最大的长处是…', options: [{ label: '看得远，想得透', animal: 'eagle' }, { label: '忠诚，靠得住', animal: 'wolf' }, { label: '学识深，想得细', animal: 'owl' }, { label: '胆子大，敢上', animal: 'tiger' }] },
    { id: 'q13', text: '我最怕的是…', options: [{ label: '失去自由，被绑住', animal: 'eagle' }, { label: '自己人背叛或散掉', animal: 'wolf' }, { label: '变化太快，全是新的', animal: 'rabbit' }, { label: '显得弱，或输掉', animal: 'tiger' }] },
    { id: 'q14', text: '说到直觉，我…', options: [{ label: '很准，几乎八九不离十', animal: 'eagle' }, { label: '看人这件事特别准', animal: 'wolf' }, { label: '能看穿套路和动机', animal: 'fox' }, { label: '对危险特别敏感', animal: 'rabbit' }] },
    { id: 'q15', text: '我日常的节奏是…', options: [{ label: '慢，但踏实', animal: 'bear' }, { label: '快，而且灵活', animal: 'rabbit' }, { label: '跟着大家的拍子走', animal: 'dolphin' }, { label: '按自己的节奏，该冲就冲', animal: 'tiger' }] },
    { id: 'q16', text: '一个人待着时，我…', options: [{ label: '会充电，脑子更清楚', animal: 'eagle' }, { label: '会想念同伴，想联络', animal: 'wolf' }, { label: '会想得深，顺手翻书', animal: 'owl' }, { label: '觉得安全又舒服', animal: 'rabbit' }] },
  ],
  fr: [
    { id: 'q1', text: 'Pour une décision importante, je…', options: [{ label: 'prends du recul et vois l’ensemble', animal: 'eagle' }, { label: 'en parle à des gens de confiance', animal: 'wolf' }, { label: 'pèse chaque angle avec soin', animal: 'fox' }, { label: 'me fie à mon instinct et à l’expérience', animal: 'bear' }] },
    { id: 'q2', text: 'Côté relations, je suis…', options: [{ label: 'à l’aise seul comme en groupe', animal: 'eagle' }, { label: 'plutôt quelques liens profonds', animal: 'wolf' }, { label: 'entouré d’un réseau large et varié', animal: 'fox' }, { label: 'très actif avec beaucoup d’amis', animal: 'dolphin' }] },
    { id: 'q3', text: 'Face à une difficulté, je…', options: [{ label: 'cherche la solution d’un point de vue plus haut', animal: 'eagle' }, { label: 'rassemble l’équipe pour passer ensemble', animal: 'wolf' }, { label: 'trouve un contournement malin', animal: 'fox' }, { label: 'tiens bon et fonce tout droit', animal: 'bear' }] },
    { id: 'q4', text: 'Mon énergie est…', options: [{ label: 'froide, concentrée, solitaire', animal: 'owl' }, { label: 'chaude, explosive, courageuse', animal: 'tiger' }, { label: 'rapide, agile, sur le qui-vive', animal: 'rabbit' }, { label: 'chaleureuse, reliée, sociable', animal: 'dolphin' }] },
    { id: 'q5', text: 'Face au fait de mener, je…', options: [{ label: 'donne le cap et guide en silence', animal: 'eagle' }, { label: 'soude l’équipe avec loyauté', animal: 'wolf' }, { label: 'déplace les situations avec stratégie', animal: 'fox' }, { label: 'avance devant, par la force et l’expérience', animal: 'bear' }] },
    { id: 'q6', text: 'Ce que je préfère, c’est…', options: [{ label: 'viser haut et relever un défi', animal: 'eagle' }, { label: 'du temps avec mes proches', animal: 'wolf' }, { label: 'rencontrer du monde et échanger', animal: 'dolphin' }, { label: 'explorer un sujet, lire', animal: 'owl' }] },
    { id: 'q7', text: 'Ma façon de parler est…', options: [{ label: 'brève, droit au but', animal: 'eagle' }, { label: 'directe et intense', animal: 'tiger' }, { label: 'fine et persuasive', animal: 'fox' }, { label: 'chaleureuse et drôle', animal: 'dolphin' }] },
    { id: 'q8', text: 'Quand je suis en colère, je…', options: [{ label: 'me retire pour digérer seul', animal: 'owl' }, { label: 'l’exprime sur-le-champ', animal: 'tiger' }, { label: 'garde l’émotion pour moi et réponds avec tactique', animal: 'fox' }, { label: 'ai envie de pleurer ou de fuir', animal: 'rabbit' }] },
    { id: 'q9', text: 'Pour moi, réussir c’est…', options: [{ label: 'réaliser ma vision, vu de haut', animal: 'eagle' }, { label: 'grandir avec les miens', animal: 'wolf' }, { label: 'arriver à mes fins avec adresse', animal: 'fox' }, { label: 'franchir l’obstacle sans céder à la peur', animal: 'tiger' }] },
    { id: 'q10', text: 'Pour évacuer la pression, je…', options: [{ label: 'marche dans la nature ou monte en hauteur', animal: 'eagle' }, { label: 'parle longuement avec quelqu’un de confiance', animal: 'wolf' }, { label: 'nage ou vais près de l’eau', animal: 'dolphin' }, { label: 'médite ou lis au calme', animal: 'owl' }] },
    { id: 'q11', text: 'Dans un lieu nouveau, je…', options: [{ label: 'observe l’ensemble avant d’agir', animal: 'eagle' }, { label: 'regarde d’abord, m’approche ensuite', animal: 'wolf' }, { label: 'saisis vite l’ambiance et m’adapte', animal: 'fox' }, { label: 'vais vers les gens le premier', animal: 'dolphin' }] },
    { id: 'q12', text: 'Ma plus grande force, c’est…', options: [{ label: 'la vision au loin et l’intuition juste', animal: 'eagle' }, { label: 'la loyauté et la fiabilité', animal: 'wolf' }, { label: 'la profondeur du savoir', animal: 'owl' }, { label: 'le cran et l’audace', animal: 'tiger' }] },
    { id: 'q13', text: 'Ce que je crains le plus, c’est…', options: [{ label: 'perdre ma liberté', animal: 'eagle' }, { label: 'la trahison ou la division des miens', animal: 'wolf' }, { label: 'un changement trop rapide', animal: 'rabbit' }, { label: 'paraître faible ou perdre', animal: 'tiger' }] },
    { id: 'q14', text: 'Quant à mon intuition…', options: [{ label: 'elle est forte et se trompe rarement', animal: 'eagle' }, { label: 'je m’y fie surtout pour juger les gens', animal: 'wolf' }, { label: 'je perçois les schémas et les intentions', animal: 'fox' }, { label: 'je repère le danger très tôt', animal: 'rabbit' }] },
    { id: 'q15', text: 'Mon rythme quotidien est…', options: [{ label: 'lent mais sûr', animal: 'bear' }, { label: 'rapide et agile', animal: 'rabbit' }, { label: 'rythmé, au pas du groupe', animal: 'dolphin' }, { label: 'le mien, avec des pointes quand il faut', animal: 'tiger' }] },
    { id: 'q16', text: 'Quand je suis seul, je…', options: [{ label: 'recharge et vois plus clair', animal: 'eagle' }, { label: 'pense aux miens et j’ai envie d’appeler', animal: 'wolf' }, { label: 'réfléchis en profondeur et j’étudie', animal: 'owl' }, { label: 'me sens en sécurité, tranquille', animal: 'rabbit' }] },
  ],
  es: [
    { id: 'q1', text: 'Ante una decisión importante, yo…', options: [{ label: 'me alejo y miro el conjunto', animal: 'eagle' }, { label: 'lo consulto con gente de confianza', animal: 'wolf' }, { label: 'calculo todos los ángulos', animal: 'fox' }, { label: 'me fío de mi instinto y mi experiencia', animal: 'bear' }] },
    { id: 'q2', text: 'Mi forma de relacionarme es…', options: [{ label: 'estar a gusto solo o acompañado', animal: 'eagle' }, { label: 'preferir pocos vínculos profundos', animal: 'wolf' }, { label: 'tener una red amplia y variada', animal: 'fox' }, { label: 'moverme mucho con muchos amigos', animal: 'dolphin' }] },
    { id: 'q3', text: 'Ante una dificultad, yo…', options: [{ label: 'busco la salida desde una mirada más alta', animal: 'eagle' }, { label: 'junto al equipo y lo cruzamos juntos', animal: 'wolf' }, { label: 'encuentro un rodeo inteligente', animal: 'fox' }, { label: 'aguanto firme y voy de frente', animal: 'bear' }] },
    { id: 'q4', text: 'Mi energía es…', options: [{ label: 'fría, concentrada, solitaria', animal: 'owl' }, { label: 'caliente, explosiva, valiente', animal: 'tiger' }, { label: 'rápida, ágil, escurridiza', animal: 'rabbit' }, { label: 'cálida, conectada, sociable', animal: 'dolphin' }] },
    { id: 'q5', text: 'Sobre liderar, yo…', options: [{ label: 'marco el rumbo y guío sin ruido', animal: 'eagle' }, { label: 'uno al equipo con lealtad', animal: 'wolf' }, { label: 'muevo la situación con estrategia', animal: 'fox' }, { label: 'voy delante, con fuerza y oficio', animal: 'bear' }] },
    { id: 'q6', text: 'Lo que más disfruto es…', options: [{ label: 'ir a por una meta alta', animal: 'eagle' }, { label: 'estar con los míos', animal: 'wolf' }, { label: 'conocer gente y charlar', animal: 'dolphin' }, { label: 'meterme en un tema y leer', animal: 'owl' }] },
    { id: 'q7', text: 'Mi manera de hablar es…', options: [{ label: 'breve y al grano', animal: 'eagle' }, { label: 'directa e intensa', animal: 'tiger' }, { label: 'aguda y persuasiva', animal: 'fox' }, { label: 'cercana y divertida', animal: 'dolphin' }] },
    { id: 'q8', text: 'Cuando me enfado, yo…', options: [{ label: 'me retiro y lo proceso a solas', animal: 'owl' }, { label: 'lo suelto en el momento', animal: 'tiger' }, { label: 'guardo la emoción y respondo con cabeza', animal: 'fox' }, { label: 'tengo ganas de llorar o de irme', animal: 'rabbit' }] },
    { id: 'q9', text: 'Para mí el éxito es…', options: [{ label: 'sacar adelante mi visión desde arriba', animal: 'eagle' }, { label: 'crecer junto a los míos', animal: 'wolf' }, { label: 'conseguir lo que quiero con maña', animal: 'fox' }, { label: 'superar el reto sin miedo', animal: 'tiger' }] },
    { id: 'q10', text: 'Para soltar el estrés, yo…', options: [{ label: 'camino por el campo o subo a un sitio alto', animal: 'eagle' }, { label: 'hablo largo con alguien de confianza', animal: 'wolf' }, { label: 'nado o me voy al agua', animal: 'dolphin' }, { label: 'leo o pienso en un rincón tranquilo', animal: 'owl' }] },
    { id: 'q11', text: 'En un sitio nuevo, yo…', options: [{ label: 'primero capto el conjunto y luego actúo', animal: 'eagle' }, { label: 'observo y me acerco despacio', animal: 'wolf' }, { label: 'leo el ambiente rápido y me adapto', animal: 'fox' }, { label: 'doy el primer paso y saludo', animal: 'dolphin' }] },
    { id: 'q12', text: 'Mi mayor fortaleza es…', options: [{ label: 'ver lejos y con criterio', animal: 'eagle' }, { label: 'la lealtad y ser de fiar', animal: 'wolf' }, { label: 'el saber hondo', animal: 'owl' }, { label: 'el coraje y la audacia', animal: 'tiger' }] },
    { id: 'q13', text: 'Lo que más temo es…', options: [{ label: 'perder la libertad', animal: 'eagle' }, { label: 'que los míos se rompan o me fallen', animal: 'wolf' }, { label: 'que todo cambie demasiado rápido', animal: 'rabbit' }, { label: 'parecer débil o perder', animal: 'tiger' }] },
    { id: 'q14', text: 'Sobre mi intuición…', options: [{ label: 'es fuerte y casi siempre acierta', animal: 'eagle' }, { label: 'con las personas me fío de ella', animal: 'wolf' }, { label: 'veo patrones e intenciones', animal: 'fox' }, { label: 'detecto el peligro enseguida', animal: 'rabbit' }] },
    { id: 'q15', text: 'Mi ritmo diario es…', options: [{ label: 'lento pero seguro', animal: 'bear' }, { label: 'rápido y ágil', animal: 'rabbit' }, { label: 'acompasado con el grupo', animal: 'dolphin' }, { label: 'el mío, con acelerones cuando toca', animal: 'tiger' }] },
    { id: 'q16', text: 'Cuando estoy a solas, yo…', options: [{ label: 'recargo y veo más claro', animal: 'eagle' }, { label: 'echo de menos a los míos y quiero llamar', animal: 'wolf' }, { label: 'pienso hondo y estudio', animal: 'owl' }, { label: 'me siento seguro y a gusto', animal: 'rabbit' }] },
  ],
}

const RESULTS: Record<AnimalType, Record<SupportedLang, AnimalResult>> = {
  eagle: {
    ko: { name: '독수리', emoji: '🦅', tagline: '높이 날아 멀리 보는 비전가', description: '독수리 정신을 가진 당신은 넓은 시야로 멀리를 내다보는 능력을 가지고 있습니다. 독립적이고 자유롭게 사고하며, 높은 목표를 향해 집중하는 타고난 비전가입니다.', strengths: ['탁월한 전략적 시야', '독립적인 의사결정 능력', '높은 목표를 향한 집중력', '혼자 있어도 강한 내적 안정감'], shadow: ['가까운 관계에서 감정 표현 부족', '다른 사람의 속도를 기다리기 어려움', '완벽주의적 경향'], compatible: ['늑대 (충성으로 보완)', '부엉이 (지혜로 결합)'] },
    en: { name: 'Eagle', emoji: '🦅', tagline: 'The visionary who flies high and sees far', description: 'With an eagle spirit, you have the ability to see far with a broad view. You think independently and freely, a natural visionary who focuses on high goals.', strengths: ['Outstanding strategic vision', 'Independent decision-making', 'Intense focus on high goals', 'Strong inner stability even when alone'], shadow: ['May lack emotional expression in close relationships', 'Struggles to wait for others\' pace', 'Perfectionistic tendencies'], compatible: ['Wolf (loyal complement)', 'Owl (wisdom synergy)'] },
    ja: { name: 'ワシ', emoji: '🦅', tagline: '高く飛んで遠くを見るビジョナリー', description: 'ワシの精神を持つあなたは、広い視野で遠くを見通す能力があります。独立的で自由に思考し、高い目標に集中する生まれながらのビジョナリーです。', strengths: ['卓越した戦略的視野', '独立した意思決定能力', '高い目標への集中力', '一人でも強い内的安定感'], shadow: ['近い関係での感情表現の不足', '他者のペースを待つのが難しい', '完璧主義的傾向'], compatible: ['オオカミ（忠誠で補完）', 'フクロウ（知恵で結合）'] },
    zh: { name: '鹰', emoji: '🦅', tagline: '飞得高、看得远的远见者', description: '带着鹰的本能，你习惯拉远距离去看整体。想法独立，方向自己定，是天生盯着高目标走的人。', strengths: ['战略眼光好', '能自己拍板', '对高目标盯得住', '独处也稳得住'], shadow: ['亲近的关系里少表达情绪', '不容易等别人的节奏', '有完美主义的倾向'], compatible: ['狼（用忠诚补上）', '猫头鹰（智慧相合）'] },
    fr: { name: 'Aigle', emoji: '🦅', tagline: 'Le visionnaire qui monte haut et voit loin', description: 'Avec l’instinct de l’aigle, vous prenez de la hauteur pour embrasser l’ensemble. Vous pensez par vous-même et gardez le cap sur des objectifs élevés.', strengths: ['Vue stratégique remarquable', 'Décide seul, sans hésiter', 'Tient le cap sur de grands objectifs', 'Solide intérieurement, même isolé'], shadow: ['Peu d’expression des émotions dans l’intime', 'Difficile d’attendre le rythme des autres', 'Tendance au perfectionnisme'], compatible: ['Loup (la loyauté en complément)', 'Hibou (la sagesse en écho)'] },
    es: { name: 'Águila', emoji: '🦅', tagline: 'La mirada que sube alto y ve lejos', description: 'Con el instinto del águila, tomas distancia para ver el conjunto. Piensas por tu cuenta y sostienes el rumbo hacia metas altas.', strengths: ['Mirada estratégica', 'Decides por tu cuenta', 'Sostienes metas altas', 'Estable incluso en soledad'], shadow: ['Expresas poco en lo cercano', 'Te cuesta esperar el ritmo ajeno', 'Tiendes al perfeccionismo'], compatible: ['Lobo (la lealtad que completa)', 'Búho (la sabiduría que acompaña)'] },
  },
  wolf: {
    ko: { name: '늑대', emoji: '🐺', tagline: '무리를 이끄는 충성의 수호자', description: '늑대 정신을 가진 당신은 깊은 충성심과 강한 유대감을 가지고 있습니다. 신뢰하는 사람들을 위해 모든 것을 다하며, 집단의 조화와 보호를 가장 중요하게 여깁니다.', strengths: ['흔들리지 않는 충성과 신뢰성', '팀 빌딩과 단합 능력', '위기 상황에서의 보호 본능', '깊고 오래가는 인간 관계'], shadow: ['자신의 필요보다 집단을 우선하는 경향', '배신에 대한 깊은 상처', '변화에 대한 저항'], compatible: ['독수리 (비전 제시)', '곰 (힘으로 보호)'] },
    en: { name: 'Wolf', emoji: '🐺', tagline: 'The loyal guardian who leads the pack', description: 'With a wolf spirit, you have deep loyalty and strong bonds. You give everything for those you trust, and value the harmony and protection of your group above all.', strengths: ['Unwavering loyalty and reliability', 'Team building and unity', 'Protective instinct in crisis', 'Deep and lasting relationships'], shadow: ['Tendency to prioritize group over own needs', 'Deep wounds from betrayal', 'Resistance to change'], compatible: ['Eagle (vision providing)', 'Bear (protective strength)'] },
    ja: { name: 'オオカミ', emoji: '🐺', tagline: '群れを率いる忠誠の守護者', description: 'オオカミの精神を持つあなたは、深い忠誠心と強い絆を持っています。信頼する人々のためにすべてを尽くし、集団の調和と保護を最も大切にします。', strengths: ['揺るぎない忠誠と信頼性', 'チームビルディングと団結力', '危機状況での保護本能', '深く長続きする人間関係'], shadow: ['自分のニーズより集団を優先する傾向', '裏切りによる深い傷', '変化への抵抗'], compatible: ['ワシ（ビジョン提供）', 'クマ（力で守る）'] },
    zh: { name: '狼', emoji: '🐺', tagline: '带着群走的忠诚守护者', description: '带着狼的本能，你重情义，也重承诺。为信得过的人可以全力以赴，把群体的和睦和安全放在前头。', strengths: ['忠诚，靠得住', '能把人拢成一队', '危急时护人的本能强', '关系深而长久'], shadow: ['常把群体放在自己前面', '被辜负时伤得很深', '对变动有抵触'], compatible: ['鹰（给出方向）', '熊（用厚实护住）'] },
    fr: { name: 'Loup', emoji: '🐺', tagline: 'Le gardien loyal qui tient la meute', description: 'Avec l’instinct du loup, vous avez le sens du lien et de la parole donnée. Pour ceux en qui vous croyez, vous allez jusqu’au bout ; l’entente et la protection du groupe passent d’abord.', strengths: ['Loyauté inébranlable', 'Sait souder une équipe', 'Instinct de protection dans la crise', 'Liens profonds et durables'], shadow: ['Fait passer le groupe avant soi', 'Blessure profonde en cas de trahison', 'Résistance au changement'], compatible: ['Aigle (donne le cap)', 'Ours (protège par sa solidité)'] },
    es: { name: 'Lobo', emoji: '🐺', tagline: 'El guardián leal que sostiene a la manada', description: 'Con el instinto del lobo, te tomas en serio el vínculo y la palabra dada. Por los tuyos lo das todo, y la armonía y el cuidado del grupo van primero.', strengths: ['Lealtad que no se mueve', 'Sabes unir a un equipo', 'Instinto de proteger en la crisis', 'Vínculos hondos y duraderos'], shadow: ['Pones al grupo antes que a ti', 'La traición te hiere hondo', 'Te resistes a los cambios'], compatible: ['Águila (marca el rumbo)', 'Oso (protege con su solidez)'] },
  },
  fox: {
    ko: { name: '여우', emoji: '🦊', tagline: '재치와 전략으로 길을 여는 지략가', description: '여우 정신을 가진 당신은 날카로운 지성과 뛰어난 적응력을 가지고 있습니다. 상황을 빠르게 읽고 최선의 방법을 찾아내는 타고난 전략가이자 문제 해결사입니다.', strengths: ['빠른 상황 파악 능력', '뛰어난 적응력과 유연성', '설득력 있는 소통 능력', '창의적인 문제 해결'], shadow: ['지나친 계산과 영리함이 불신을 부를 수 있음', '자신의 진의를 숨기는 경향', '단기적 이익에 집중할 때 장기 관계 손상 가능'], compatible: ['독수리 (비전 결합)', '돌고래 (소셜 보완)'] },
    en: { name: 'Fox', emoji: '🦊', tagline: 'The clever strategist who opens paths with wit', description: 'With a fox spirit, you have sharp intelligence and exceptional adaptability. You\'re a natural strategist and problem-solver who quickly reads situations and finds the best approach.', strengths: ['Quick situational awareness', 'Exceptional adaptability and flexibility', 'Persuasive communication', 'Creative problem-solving'], shadow: ['Over-calculation can invite distrust', 'Tendency to hide true intentions', 'Focusing on short-term gains can damage long-term relationships'], compatible: ['Eagle (vision combination)', 'Dolphin (social complement)'] },
    ja: { name: 'キツネ', emoji: '🦊', tagline: '機知と戦略で道を開く策略家', description: 'キツネの精神を持つあなたは、鋭い知性と優れた適応力を持っています。状況を素早く読み取り最善の方法を見つける、生まれながらの戦略家で問題解決者です。', strengths: ['素早い状況把握能力', '優れた適応力と柔軟性', '説得力のあるコミュニケーション', 'クリエイティブな問題解決'], shadow: ['過度な計算が不信を招く可能性', '真意を隠す傾向', '短期的利益への集中が長期関係を損なう可能性'], compatible: ['ワシ（ビジョン結合）', 'イルカ（社交補完）'] },
    zh: { name: '狐狸', emoji: '🦊', tagline: '靠机敏和策略开路的谋士', description: '带着狐狸的本能，你读局势快，脑子转得也快。遇事先找最省力的那条路，是天生的解题人。', strengths: ['很快看懂局面', '适应力强，转得快', '说话有说服力', '解法常有巧思'], shadow: ['算得太精会招来不信任', '不太愿意露出真意', '只盯短利时会伤到长远的关系'], compatible: ['鹰（视野相合）', '海豚（补上人情味）'] },
    fr: { name: 'Renard', emoji: '🦊', tagline: 'Le stratège qui ouvre la voie par l’astuce', description: 'Avec l’instinct du renard, vous lisez vite une situation et trouvez le chemin le plus sûr. Vous résolvez les problèmes par l’adresse plus que par la force.', strengths: ['Lecture rapide des situations', 'Grande faculté d’adaptation', 'Parole persuasive', 'Solutions inventives'], shadow: ['Trop de calcul peut éveiller la méfiance', 'Tendance à cacher ses vraies intentions', 'Le gain court terme peut coûter la relation'], compatible: ['Aigle (la vision en écho)', 'Dauphin (la chaleur en complément)'] },
    es: { name: 'Zorro', emoji: '🦊', tagline: 'El estratega que abre camino con ingenio', description: 'Con el instinto del zorro, lees rápido la situación y das con el camino más eficaz. Resuelves más por maña que por fuerza.', strengths: ['Lees rápido el terreno', 'Te adaptas con soltura', 'Hablas de forma convincente', 'Soluciones con chispa'], shadow: ['Calcular de más despierta desconfianza', 'Sueles guardarte lo que piensas', 'Mirar solo el corto plazo desgasta vínculos'], compatible: ['Águila (la mirada que acompaña)', 'Delfín (la calidez que completa)'] },
  },
  bear: {
    ko: { name: '곰', emoji: '🐻', tagline: '든든한 힘과 경험으로 지켜주는 수호자', description: '곰 정신을 가진 당신은 든든한 힘과 깊은 안정감을 가지고 있습니다. 주변 사람들에게 의지가 되는 존재이며, 내가 사랑하는 것들을 끝까지 보호하는 수호자입니다.', strengths: ['흔들리지 않는 내적 안정감', '보호와 지원의 강한 본능', '실용적이고 믿음직한 실행력', '어려운 상황에서도 버티는 인내력'], shadow: ['변화를 수용하는 데 시간이 필요', '고집스러울 수 있음', '에너지를 보존하려는 경향이 게으르게 보일 수 있음'], compatible: ['늑대 (팀 조화)', '독수리 (비전 제공)'] },
    en: { name: 'Bear', emoji: '🐻', tagline: 'The steadfast guardian who protects with strength and experience', description: 'With a bear spirit, you carry solid strength and deep stability. You are someone others lean on, a guardian who protects everything you love to the very end.', strengths: ['Unwavering inner stability', 'Strong protective and supportive instincts', 'Practical and reliable execution', 'Patience to endure even in hardship'], shadow: ['Needs time to accept change', 'Can be stubborn', 'Energy conservation can appear as laziness'], compatible: ['Wolf (team harmony)', 'Eagle (vision providing)'] },
    ja: { name: 'クマ', emoji: '🐻', tagline: '強さと経験で守る頼もしい守護者', description: 'クマの精神を持つあなたは、確かな力と深い安定感を持っています。周りの人々が頼りにする存在であり、愛するものを最後まで守る守護者です。', strengths: ['揺るぎない内的安定感', '保護と支援の強い本能', '実用的で信頼できる実行力', '困難な状況でも耐える忍耐力'], shadow: ['変化を受け入れるのに時間が必要', '頑固になることがある', 'エネルギー保存の傾向が怠けに見える場合がある'], compatible: ['オオカミ（チームの調和）', 'ワシ（ビジョン提供）'] },
    zh: { name: '熊', emoji: '🐻', tagline: '用厚实和经验护着人的守护者', description: '带着熊的本能，你稳，也扛得住。周围的人把你当依靠，而你会护住自己在乎的东西，直到最后。', strengths: ['心里稳，不容易晃', '护人、撑人的本能强', '做事踏实可靠', '难处也耐得住'], shadow: ['接受改变需要时间', '有时候固执', '省力气的样子容易被看成懒'], compatible: ['狼（把队伍调顺）', '鹰（给出方向）'] },
    fr: { name: 'Ours', emoji: '🐻', tagline: 'Le protecteur solide, fort de son expérience', description: 'Avec l’instinct de l’ours, vous êtes stable et vous tenez. On s’appuie sur vous, et vous protégez jusqu’au bout ce qui vous tient à cœur.', strengths: ['Assise intérieure solide', 'Fort instinct de protection', 'Fiable et concret dans l’action', 'Endurance dans la difficulté'], shadow: ['Le changement demande du temps', 'Peut devenir têtu', 'Économiser son énergie peut passer pour de la paresse'], compatible: ['Loup (accorde le groupe)', 'Aigle (donne le cap)'] },
    es: { name: 'Oso', emoji: '🐻', tagline: 'El protector sólido, con oficio y aguante', description: 'Con el instinto del oso, eres estable y aguantas. La gente se apoya en ti, y proteges hasta el final lo que te importa.', strengths: ['Base interior firme', 'Instinto de proteger y sostener', 'Fiable y práctico al actuar', 'Aguante en lo difícil'], shadow: ['Necesitas tiempo para el cambio', 'A veces te pones terco', 'Guardar fuerzas puede parecer pereza'], compatible: ['Lobo (acompasa al grupo)', 'Águila (marca el rumbo)'] },
  },
  dolphin: {
    ko: { name: '돌고래', emoji: '🐬', tagline: '기쁨과 연결로 세상을 밝히는 사교가', description: '돌고래 정신을 가진 당신은 뛰어난 소통 능력과 밝은 에너지를 가지고 있습니다. 사람들과의 연결에서 진정한 기쁨을 찾으며, 어디서든 밝은 분위기를 만들어냅니다.', strengths: ['뛰어난 소통과 공감 능력', '협업하고 팀을 하나로 만드는 힘', '긍정적이고 활력 있는 에너지', '다양한 사람들과의 빠른 연결'], shadow: ['혼자 있을 때 에너지 저하', '깊이보다 넓이를 선택할 때가 있음', '과도한 낙관주의로 문제를 과소평가'], compatible: ['여우 (전략적 보완)', '곰 (든든한 지지)'] },
    en: { name: 'Dolphin', emoji: '🐬', tagline: 'The social light who brightens the world with joy', description: 'With a dolphin spirit, you have outstanding communication skills and bright energy. You find genuine joy in connecting with people and create a positive atmosphere wherever you go.', strengths: ['Outstanding communication and empathy', 'Power to collaborate and unite teams', 'Positive and vibrant energy', 'Quick connection with diverse people'], shadow: ['Energy dips when alone', 'Sometimes chooses breadth over depth', 'Excessive optimism can underestimate problems'], compatible: ['Fox (strategic complement)', 'Bear (steady support)'] },
    ja: { name: 'イルカ', emoji: '🐬', tagline: '喜びと繋がりで世界を明るくする社交家', description: 'イルカの精神を持つあなたは、優れたコミュニケーション能力と明るいエネルギーを持っています。人々との繋がりに真の喜びを見出し、どこでも明るい雰囲気を作り出します。', strengths: ['優れたコミュニケーションと共感能力', '協力してチームを一つにする力', 'ポジティブで活力あるエネルギー', '多様な人々との素早い繋がり'], shadow: ['一人でいるとエネルギーが低下', '深さより広さを選ぶことがある', '過度な楽観主義で問題を軽視することがある'], compatible: ['キツネ（戦略的補完）', 'グリーンタイプ（感情的サポート）'] },
    zh: { name: '海豚', emoji: '🐬', tagline: '用欢快和连结点亮场子的社交家', description: '带着海豚的本能，你会说话，也带得动气氛。跟人连上线这件事本身就让你高兴，走到哪儿都能把场子弄暖。', strengths: ['会沟通，也共情', '能把人拉成一队', '正向，有活力', '跟各种人都能很快熟'], shadow: ['独处时电量掉得快', '有时选广度，少了深度', '太乐观会低估问题'], compatible: ['狐狸（策略上互补）', '熊（稳稳托住）'] },
    fr: { name: 'Dauphin', emoji: '🐬', tagline: 'Le sociable qui éclaire par la joie et le lien', description: 'Avec l’instinct du dauphin, vous savez parler aux gens et changer l’ambiance. Le lien lui-même vous réjouit, et vous réchauffez les lieux où vous passez.', strengths: ['Communique et comprend l’autre', 'Fait tenir un groupe ensemble', 'Énergie positive et entraînante', 'Se lie vite avec des profils variés'], shadow: ['La solitude vide vite la batterie', 'Parfois la largeur plutôt que la profondeur', 'L’optimisme peut minimiser un problème'], compatible: ['Renard (complément stratégique)', 'Ours (appui tranquille)'] },
    es: { name: 'Delfín', emoji: '🐬', tagline: 'El sociable que ilumina con alegría y vínculo', description: 'Con el instinto del delfín, sabes hablar con la gente y cambiar el ambiente. El vínculo en sí te alegra, y caldeas los sitios por donde pasas.', strengths: ['Comunicas y empatizas', 'Sabes cohesionar un grupo', 'Energía positiva y contagiosa', 'Conectas rápido con gente distinta'], shadow: ['A solas se te baja la batería', 'A veces eliges amplitud antes que hondura', 'El optimismo te hace restar importancia'], compatible: ['Zorro (complemento estratégico)', 'Oso (apoyo tranquilo)'] },
  },
  owl: {
    ko: { name: '부엉이', emoji: '🦉', tagline: '지혜와 깊은 사색으로 진실을 찾는 탐구자', description: '부엉이 정신을 가진 당신은 깊은 지혜와 예리한 관찰력을 가지고 있습니다. 표면 아래를 꿰뚫어 보고 진실을 찾는 타고난 탐구자이며, 지식을 축적하는 것에서 큰 기쁨을 느낍니다.', strengths: ['깊은 지혜와 분석적 사고', '뛰어난 관찰력과 통찰력', '독립적인 학습 능력', '신중하고 균형 잡힌 판단'], shadow: ['과도한 분석이 행동을 막을 수 있음', '사교적 상황에서 에너지 소모', '감정 표현의 어려움'], compatible: ['독수리 (행동력 보완)', '늑대 (유대감 제공)'] },
    en: { name: 'Owl', emoji: '🦉', tagline: 'The seeker who finds truth through wisdom and deep thought', description: 'With an owl spirit, you have deep wisdom and sharp observation. You\'re a natural seeker who sees beneath the surface to find truth, and you find great joy in accumulating knowledge.', strengths: ['Deep wisdom and analytical thinking', 'Outstanding observation and insight', 'Independent learning ability', 'Careful and balanced judgment'], shadow: ['Excessive analysis can block action', 'Social situations drain energy', 'Difficulty expressing emotions'], compatible: ['Eagle (action complement)', 'Wolf (bonding support)'] },
    ja: { name: 'フクロウ', emoji: '🦉', tagline: '知恵と深い思索で真実を求める探求者', description: 'フクロウの精神を持つあなたは、深い知恵と鋭い観察力を持っています。表面の下を見抜いて真実を探す生まれながらの探求者であり、知識を蓄積することに大きな喜びを感じます。', strengths: ['深い知恵と分析的思考', '優れた観察力と洞察力', '独立した学習能力', '慎重でバランスの取れた判断'], shadow: ['過度な分析が行動を妨げることがある', '社交的な状況でエネルギーを消耗', '感情表現の難しさ'], compatible: ['ワシ（行動力の補完）', 'オオカミ（絆の提供）'] },
    zh: { name: '猫头鹰', emoji: '🦉', tagline: '靠智慧和深思找真相的探究者', description: '带着猫头鹰的本能，你看得细，也想得深。你想知道表面底下是什么，积累知识本身就让你满足。', strengths: ['思考深，分析强', '观察入微，看得透', '自己就能学起来', '判断审慎又平衡'], shadow: ['想太多会挡住行动', '社交场合耗电', '不太容易说出情绪'], compatible: ['鹰（补上行动力）', '狼（带来归属感）'] },
    fr: { name: 'Hibou', emoji: '🦉', tagline: 'Le chercheur qui va au vrai par la réflexion', description: 'Avec l’instinct du hibou, vous observez finement et vous pensez en profondeur. Vous voulez savoir ce qu’il y a sous la surface, et apprendre vous suffit déjà.', strengths: ['Pensée profonde et analytique', 'Observation et intuition fines', 'Apprend seul, sans qu’on le pousse', 'Jugement prudent et équilibré'], shadow: ['Trop analyser bloque l’action', 'Les situations sociales épuisent', 'Difficulté à dire ses émotions'], compatible: ['Aigle (apporte l’élan d’agir)', 'Loup (apporte l’appartenance)'] },
    es: { name: 'Búho', emoji: '🦉', tagline: 'El indagador que llega a la verdad pensando', description: 'Con el instinto del búho, observas fino y piensas hondo. Quieres saber qué hay debajo de la superficie, y aprender ya te compensa.', strengths: ['Pensamiento hondo y analítico', 'Observas con finura', 'Aprendes por tu cuenta', 'Juicio prudente y equilibrado'], shadow: ['Analizar de más frena la acción', 'Lo social te consume', 'Te cuesta decir lo que sientes'], compatible: ['Águila (aporta el impulso)', 'Lobo (aporta pertenencia)'] },
  },
  tiger: {
    ko: { name: '호랑이', emoji: '🐯', tagline: '두려움 없는 용기로 길을 여는 전사', description: '호랑이 정신을 가진 당신은 타오르는 용기와 강렬한 집중력을 가지고 있습니다. 장애물 앞에서도 주저하지 않으며, 자신이 옳다고 믿는 것을 위해 당당히 나서는 타고난 전사입니다.', strengths: ['두려움 없는 용기와 대담함', '목표를 향한 폭발적인 집중력', '강한 개인 영역과 자아 의식', '부당함에 맞서는 정의감'], shadow: ['충동성과 과도한 지배욕', '협업보다 단독 행동 선호', '패배를 받아들이기 어려움'], compatible: ['늑대 (팀 역학 보완)', '부엉이 (전략적 사고 제공)'] },
    en: { name: 'Tiger', emoji: '🐯', tagline: 'The fearless warrior who blazes a trail with courage', description: 'With a tiger spirit, you burn with courage and fierce focus. You don\'t hesitate in the face of obstacles, and you step forward boldly for what you believe is right — a natural warrior.', strengths: ['Fearless courage and boldness', 'Explosive focus toward goals', 'Strong personal territory and self-awareness', 'Sense of justice that confronts wrongdoing'], shadow: ['Impulsivity and excessive dominance', 'Prefers solo action over collaboration', 'Difficulty accepting defeat'], compatible: ['Wolf (team dynamic complement)', 'Owl (strategic thinking)'] },
    ja: { name: 'トラ', emoji: '🐯', tagline: '恐れ知らずの勇気で道を切り開く戦士', description: 'トラの精神を持つあなたは、燃え盛る勇気と激しい集中力を持っています。障害を前にしても躊躇せず、正しいと信じることのために堂々と前に出る、生まれながらの戦士です。', strengths: ['恐れ知らずの勇気と大胆さ', '目標への爆発的な集中力', '強い個人領域と自我意識', '不正に立ち向かう正義感'], shadow: ['衝動性と過度な支配欲', '協力より単独行動を好む', '敗北を受け入れるのが難しい'], compatible: ['オオカミ（チームダイナミック補完）', 'フクロウ（戦略的思考提供）'] },
    zh: { name: '老虎', emoji: '🐯', tagline: '不怕难、敢开路的战士', description: '带着老虎的本能，你有胆气，也专注得起来。拦路的东西挡不住你，认定是对的事，你会站到前面去。', strengths: ['胆子大，敢上', '盯目标时爆发力强', '界线清楚，自我分明', '见不公会出声'], shadow: ['容易冲动，也想掌控', '偏好单打，少了协作', '不太咽得下失败'], compatible: ['狼（补上团队感）', '猫头鹰（提供谋略）'] },
    fr: { name: 'Tigre', emoji: '🐯', tagline: 'Le combattant qui ouvre la voie sans trembler', description: 'Avec l’instinct du tigre, vous avez du cran et une concentration qui brûle. Les obstacles ne vous arrêtent pas, et vous montez au front pour ce que vous croyez juste.', strengths: ['Courage et audace', 'Concentration explosive sur l’objectif', 'Limites claires, moi affirmé', 'Sens de la justice face à l’injuste'], shadow: ['Impulsivité et besoin de contrôle', 'Préfère agir seul plutôt qu’à plusieurs', 'Accepte mal la défaite'], compatible: ['Loup (apporte le collectif)', 'Hibou (apporte la stratégie)'] },
    es: { name: 'Tigre', emoji: '🐯', tagline: 'El luchador que abre camino sin temblar', description: 'Con el instinto del tigre, tienes agallas y una concentración que arde. Los obstáculos no te frenan, y das la cara por lo que crees justo.', strengths: ['Coraje y audacia', 'Concentración explosiva en la meta', 'Límites claros, yo definido', 'Sentido de la justicia'], shadow: ['Impulso y ganas de controlar', 'Prefieres ir solo antes que en equipo', 'Te cuesta encajar la derrota'], compatible: ['Lobo (aporta lo colectivo)', 'Búho (aporta la estrategia)'] },
  },
  rabbit: {
    ko: { name: '토끼', emoji: '🐰', tagline: '민첩함과 세심함으로 세상을 누비는 자', description: '토끼 정신을 가진 당신은 뛰어난 민첩성과 세심한 감수성을 가지고 있습니다. 변화에 빠르게 적응하고, 주변의 미묘한 변화를 재빠르게 감지하는 섬세한 관찰자입니다.', strengths: ['뛰어난 민첩성과 빠른 적응력', '섬세한 감수성과 공감 능력', '위험을 미리 감지하는 직관', '창의적이고 다재다능한 능력'], shadow: ['빠른 의사 결정이 필요한 순간 망설임', '과도한 걱정과 불안 경향', '자신의 필요를 뒤로 미루는 습관'], compatible: ['곰 (안정감 제공)', '독수리 (큰 그림 제시)'] },
    en: { name: 'Rabbit', emoji: '🐰', tagline: 'The agile, sensitive explorer of the world', description: 'With a rabbit spirit, you have outstanding agility and delicate sensitivity. You adapt quickly to change and are a perceptive observer who rapidly detects subtle shifts in your environment.', strengths: ['Outstanding agility and quick adaptation', 'Delicate sensitivity and empathy', 'Intuition that senses danger in advance', 'Creative and versatile abilities'], shadow: ['Hesitation when fast decisions are needed', 'Tendency toward excessive worry and anxiety', 'Habit of pushing own needs aside'], compatible: ['Bear (providing stability)', 'Eagle (showing the big picture)'] },
    ja: { name: 'ウサギ', emoji: '🐰', tagline: '機敏さと繊細さで世界を駆け巡る者', description: 'ウサギの精神を持つあなたは、優れた機敏さと繊細な感受性を持っています。変化に素早く適応し、周囲の微妙な変化をいち早く感知する繊細な観察者です。', strengths: ['優れた機敏さと素早い適応力', '繊細な感受性と共感能力', '危険を事前に感知する直感', 'クリエイティブで多才な能力'], shadow: ['素早い決断が必要な瞬間の躊躇', '過度な心配と不安の傾向', '自分のニーズを後回しにする習慣'], compatible: ['クマ（安定感の提供）', 'ワシ（大局の提示）'] },
    zh: { name: '兔', emoji: '🐰', tagline: '靠灵巧和细腻穿行的敏锐者', description: '带着兔的本能，你反应快，也感觉得细。环境一变你马上跟上，周围那点微妙的动静你先察觉。', strengths: ['动作快，适应也快', '感觉细腻，能共情', '对危险有先觉', '点子多，什么都能上手'], shadow: ['需要当场决断时会犹豫', '容易担心、容易不安', '习惯把自己的需要往后放'], compatible: ['熊（给出安稳）', '鹰（给出大方向）'] },
    fr: { name: 'Lapin', emoji: '🐰', tagline: 'Le vif qui avance par l’agilité et la finesse', description: 'Avec l’instinct du lapin, vous réagissez vite et sentez fin. Vous vous ajustez au changement sans délai et percevez avant les autres les signaux discrets.', strengths: ['Agilité et adaptation rapides', 'Sensibilité fine et empathie', 'Perçoit le danger en avance', 'Créatif et polyvalent'], shadow: ['Hésite quand il faut trancher vite', 'Inquiétude et anxiété faciles', 'Remet ses propres besoins à plus tard'], compatible: ['Ours (apporte la stabilité)', 'Aigle (donne la vue d’ensemble)'] },
    es: { name: 'Conejo', emoji: '🐰', tagline: 'El ágil que avanza con finura y reflejos', description: 'Con el instinto del conejo, reaccionas rápido y sientes fino. Te ajustas al cambio enseguida y captas antes que nadie las señales pequeñas.', strengths: ['Agilidad y adaptación rápidas', 'Sensibilidad fina y empatía', 'Detectas el peligro a tiempo', 'Creativo y polivalente'], shadow: ['Dudas cuando hay que decidir ya', 'Te preocupas y te inquietas fácil', 'Dejas lo tuyo para después'], compatible: ['Oso (aporta calma)', 'Águila (aporta la visión amplia)'] },
  },
}

interface Props { locale?: string }

export default function AnimalPersonalityTest({ locale: lp = 'ko' }: Props) {
  const locale = lang(lp ?? 'ko')
  const lb = LABELS[locale]
  const questions = QUESTIONS[locale]

  const [current, setCurrent] = useState(0)
  const [scores, setScores] = useState<Record<AnimalType, number>>({ eagle: 0, wolf: 0, fox: 0, bear: 0, dolphin: 0, owl: 0, tiger: 0, rabbit: 0 })
  const [result, setResult] = useState<AnimalType | null>(null)
  useRecordFinishedTest({ testId: "animal-personality", title: "AnimalPersonalityTest", finished: Boolean(result) });

  function pick(animal: AnimalType) {
    const newScores = { ...scores, [animal]: scores[animal] + 1 }
    if (current + 1 >= questions.length) {
      const dominant = (Object.keys(newScores) as AnimalType[]).reduce((a, b) => newScores[a] >= newScores[b] ? a : b)
      setResult(dominant)
    }
    setScores(newScores)
    setCurrent(current + 1)
  }

  function restart() { setScores({ eagle: 0, wolf: 0, fox: 0, bear: 0, dolphin: 0, owl: 0, tiger: 0, rabbit: 0 }); setCurrent(0); setResult(null) }

  function share() {
    if (!result) return
    const url = window.location.href
    const text = `${lb.shareMsg} — ${RESULTS[result][locale].name} ${RESULTS[result][locale].emoji}`
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
        options={q.options.map((opt) => ({
          label: `${RESULTS[opt.animal][locale].emoji} ${opt.label}`,
          value: opt.animal,
        }))}
        note={lb.note}
        onSelect={pick}
      />
    )
  }

  if (!result) return null
  const r = RESULTS[result][locale]

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">{lb.yourAnimal}</p>
        <div className="text-6xl">{r.emoji}</div>
        <h2 className="text-2xl font-bold">{r.name}</h2>
        <p className="font-medium text-muted-foreground">{r.tagline}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{r.description}</p>
      </div>
      <div className="rounded-xl border bg-card p-4 space-y-2">
        <h3 className="font-bold text-sm text-green-700">{lb.strengths}</h3>
        <ul className="space-y-1">{r.strengths.map(s => <li key={s} className="text-sm text-muted-foreground flex gap-2"><span className="text-green-500 flex-none">→</span>{s}</li>)}</ul>
      </div>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
        <h3 className="font-bold text-sm text-amber-700">{lb.shadow}</h3>
        <ul className="space-y-1">{r.shadow.map(s => <li key={s} className="text-sm text-amber-700 flex gap-2"><span className="flex-none">•</span>{s}</li>)}</ul>
      </div>
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
        <h3 className="font-bold text-sm text-primary">{lb.compatible}</h3>
        <ul className="space-y-1">{r.compatible.map(c => <li key={c} className="text-sm text-muted-foreground flex gap-2"><span className="text-primary flex-none">•</span>{c}</li>)}</ul>
      </div>
      <p className="text-center text-xs text-muted-foreground">{lb.note}</p>
      <ShareResultButton
        locale={lp}
        heading={lb.yourAnimal}
        emoji={r.emoji}
        resultTitle={r.name}
        description={r.tagline}
      />
      <div className="flex gap-3">
        <button onClick={restart} aria-label={lb.restart} className="flex-1 rounded-xl border bg-card px-4 py-2 text-sm font-bold hover:bg-accent transition-colors">{lb.restart}</button>
        <button onClick={share} aria-label={lb.share} className="flex-1 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-bold hover:opacity-90 transition-opacity">{lb.share}</button>
      </div>
    </div>
  )
}
