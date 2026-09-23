import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { Questionnaire } from '@/components/ui/questionnaire'
import ShareResultButton from '../shared/ShareResultButton'

type SupportedLang = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'
type ColorType = 'red' | 'blue' | 'yellow' | 'green' | 'purple'

function lang(locale: string): SupportedLang {
  return (['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const).includes(locale as SupportedLang) ? (locale as SupportedLang) : 'en'
}

interface Question {
  id: string
  text: string
  options: { label: string; color: ColorType }[]
}

interface ColorResult {
  name: string; emoji: string; tagline: string; description: string
  strengths: string[]; growth: string[]; compatible: string[]
}

const COLOR_HEX: Record<ColorType, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  yellow: '#eab308',
  green: '#22c55e',
  purple: '#a855f7',
}

const LABELS: Record<SupportedLang, {
  title: string; subtitle: string
  questionOf: (c: number, t: number) => string
  restart: string; share: string; shareMsg: string
  yourColor: string; strengths: string; growth: string; compatible: string
  colorProfile: string; note: string
}> = {
  ko: {
    title: '컬러 성격 테스트',
    subtitle: '나를 대표하는 색깔은?',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '나의 컬러 성격은',
    yourColor: '나의 컬러 성격',
    strengths: '강점',
    growth: '성장 포인트',
    compatible: '잘 맞는 컬러',
    colorProfile: '컬러 프로필',
    note: '이 검사는 성격의 다양한 면을 탐색하는 도구입니다.',
  },
  en: {
    title: 'Color Personality Test',
    subtitle: 'What Color Are You?',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My color personality is',
    yourColor: 'Your Color Personality',
    strengths: 'Strengths',
    growth: 'Growth Areas',
    compatible: 'Compatible Colors',
    colorProfile: 'Color Profile',
    note: 'This test is a tool for exploring the many facets of your personality.',
  },
  ja: {
    title: 'カラー性格テスト',
    subtitle: '私を表す色は何？',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '私のカラー性格は',
    yourColor: 'あなたのカラー性格',
    strengths: '強み',
    growth: '成長ポイント',
    compatible: '相性の良いカラー',
    colorProfile: 'カラープロフィール',
    note: 'このテストは性格のさまざまな側面を探るツールです。',
  },
  zh: {
    title: '色彩性格测验',
    subtitle: '哪个颜色最像你？',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: '重新测验',
    share: '分享结果',
    shareMsg: '我的色彩性格是',
    yourColor: '我的色彩性格',
    strengths: '长处',
    growth: '可以练习的地方',
    compatible: '合得来的颜色',
    colorProfile: '色彩分布',
    note: '这个测验是用来看性格的不同面向，不是给你贴标签。',
  },
  fr: {
    title: 'Test des couleurs de personnalité',
    subtitle: 'Quelle couleur vous ressemble ?',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: 'Recommencer',
    share: 'Partager le résultat',
    shareMsg: 'Ma couleur de personnalité est',
    yourColor: 'Votre couleur de personnalité',
    strengths: 'Forces',
    growth: 'À travailler',
    compatible: 'Couleurs complémentaires',
    colorProfile: 'Profil de couleurs',
    note: 'Ce test explore différentes facettes de votre caractère ; ce n’est pas une étiquette.',
  },
  es: {
    title: 'Test de color y personalidad',
    subtitle: '¿Qué color se te parece?',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: 'Repetir',
    share: 'Compartir resultado',
    shareMsg: 'Mi color de personalidad es',
    yourColor: 'Tu color de personalidad',
    strengths: 'Fortalezas',
    growth: 'Para trabajar',
    compatible: 'Colores que encajan',
    colorProfile: 'Perfil de colores',
    note: 'Este test explora distintas caras de tu carácter; no es una etiqueta.',
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 'q1', text: '새로운 프로젝트를 시작할 때 나는…', options: [{ label: '바로 행동으로 옮긴다', color: 'red' }, { label: '철저히 계획을 세운다', color: 'blue' }, { label: '창의적인 아이디어를 낸다', color: 'yellow' }, { label: '팀원들의 의견을 먼저 듣는다', color: 'green' }, { label: '내면의 직관을 따른다', color: 'purple' }] },
    { id: 'q2', text: '친구들 사이에서 나는…', options: [{ label: '분위기를 이끄는 리더', color: 'red' }, { label: '신뢰받는 조언자', color: 'blue' }, { label: '웃음을 가져다주는 사람', color: 'yellow' }, { label: '모두를 배려하는 조율자', color: 'green' }, { label: '독창적인 관점을 가진 사람', color: 'purple' }] },
    { id: 'q3', text: '스트레스를 받을 때 나는…', options: [{ label: '운동이나 신체적 활동으로 해소한다', color: 'red' }, { label: '혼자 분석하며 해결책을 찾는다', color: 'blue' }, { label: '새로운 취미나 활동을 찾는다', color: 'yellow' }, { label: '가까운 사람과 이야기를 나눈다', color: 'green' }, { label: '혼자만의 시간을 갖고 명상한다', color: 'purple' }] },
    { id: 'q4', text: '이상적인 주말은…', options: [{ label: '스포츠나 야외 모험 활동', color: 'red' }, { label: '좋은 책이나 다큐멘터리 시청', color: 'blue' }, { label: '예술 활동이나 새로운 경험', color: 'yellow' }, { label: '가족, 친구들과의 모임', color: 'green' }, { label: '혼자만의 창작이나 탐구 시간', color: 'purple' }] },
    { id: 'q5', text: '나의 가장 큰 동기는…', options: [{ label: '성취와 결과를 만들어내는 것', color: 'red' }, { label: '진실과 지식을 추구하는 것', color: 'blue' }, { label: '가능성을 발견하고 표현하는 것', color: 'yellow' }, { label: '사람들에게 긍정적 영향을 미치는 것', color: 'green' }, { label: '깊은 의미와 영감을 찾는 것', color: 'purple' }] },
    { id: 'q6', text: '갈등이 생겼을 때 나는…', options: [{ label: '직접 맞서고 빠르게 해결한다', color: 'red' }, { label: '사실에 근거해 논리적으로 대화한다', color: 'blue' }, { label: '유머로 분위기를 부드럽게 만든다', color: 'yellow' }, { label: '양쪽 입장을 이해하려 노력한다', color: 'green' }, { label: '한 발짝 물러서 큰 그림을 본다', color: 'purple' }] },
    { id: 'q7', text: '나의 학습 스타일은…', options: [{ label: '직접 해보고 경험으로 배운다', color: 'red' }, { label: '체계적으로 분석하며 이해한다', color: 'blue' }, { label: '시각적이고 창의적인 방식으로 배운다', color: 'yellow' }, { label: '토론하고 가르치며 배운다', color: 'green' }, { label: '직관과 패턴 인식으로 배운다', color: 'purple' }] },
    { id: 'q8', text: '나를 가장 잘 표현하는 단어는…', options: [{ label: '역동적, 대담한, 행동적', color: 'red' }, { label: '신중한, 분석적, 신뢰할 수 있는', color: 'blue' }, { label: '낙관적, 창의적, 열정적', color: 'yellow' }, { label: '따뜻한, 공감하는, 조화로운', color: 'green' }, { label: '직관적, 신비로운, 독창적', color: 'purple' }] },
    { id: 'q9', text: '나의 의사결정 방식은…', options: [{ label: '빠르고 직관적으로 결정한다', color: 'red' }, { label: '모든 데이터를 검토한 후 결정한다', color: 'blue' }, { label: '가능성과 기회를 상상하며 결정한다', color: 'yellow' }, { label: '관계에 미치는 영향을 고려해 결정한다', color: 'green' }, { label: '내면의 깊은 감각을 신뢰해 결정한다', color: 'purple' }] },
    { id: 'q10', text: '나의 가장 큰 두려움은…', options: [{ label: '실패하거나 통제력을 잃는 것', color: 'red' }, { label: '틀리거나 비논리적으로 보이는 것', color: 'blue' }, { label: '지루함이나 제약을 받는 것', color: 'yellow' }, { label: '관계가 깨지거나 거절당하는 것', color: 'green' }, { label: '평범해지거나 개성을 잃는 것', color: 'purple' }] },
    { id: 'q11', text: '이상적인 직업 환경은…', options: [{ label: '빠르게 움직이고 도전이 있는 환경', color: 'red' }, { label: '체계적이고 전문성을 발휘할 수 있는 환경', color: 'blue' }, { label: '자유롭고 창의성을 발휘할 수 있는 환경', color: 'yellow' }, { label: '협력하고 사람들을 도울 수 있는 환경', color: 'green' }, { label: '독립적으로 깊이 있게 일할 수 있는 환경', color: 'purple' }] },
    { id: 'q12', text: '감사함을 표현할 때 나는…', options: [{ label: '구체적인 행동으로 보답한다', color: 'red' }, { label: '진심 어린 편지나 메시지를 쓴다', color: 'blue' }, { label: '신나는 이벤트나 깜짝 선물을 준비한다', color: 'yellow' }, { label: '따뜻한 말과 포옹으로 표현한다', color: 'green' }, { label: '특별하고 의미 있는 방식을 생각해낸다', color: 'purple' }] },
    { id: 'q13', text: '나의 에너지원은…', options: [{ label: '경쟁과 성취의 순간', color: 'red' }, { label: '새로운 지식을 발견하는 순간', color: 'blue' }, { label: '새로운 아이디어가 떠오를 때', color: 'yellow' }, { label: '누군가와 깊이 연결될 때', color: 'green' }, { label: '깊은 통찰과 의미를 발견할 때', color: 'purple' }] },
    { id: 'q14', text: '나는 리더로서…', options: [{ label: '결단력 있게 방향을 정하고 팀을 이끈다', color: 'red' }, { label: '데이터와 전략으로 체계적으로 이끈다', color: 'blue' }, { label: '비전과 열정으로 영감을 불어넣는다', color: 'yellow' }, { label: '각자의 강점을 살려주며 지원한다', color: 'green' }, { label: '직관적 통찰로 새로운 길을 제시한다', color: 'purple' }] },
    { id: 'q15', text: '나의 일상적인 모습은…', options: [{ label: '활동적이고 바쁘게 움직인다', color: 'red' }, { label: '계획대로 체계적으로 생활한다', color: 'blue' }, { label: '즉흥적이고 탐험을 즐긴다', color: 'yellow' }, { label: '사람들 곁에서 교류하며 지낸다', color: 'green' }, { label: '조용하지만 깊이 있게 사색한다', color: 'purple' }] },
  ],
  en: [
    { id: 'q1', text: 'When starting a new project, I…', options: [{ label: 'Jump into action immediately', color: 'red' }, { label: 'Plan everything thoroughly first', color: 'blue' }, { label: 'Generate creative new ideas', color: 'yellow' }, { label: 'Listen to the team\'s input first', color: 'green' }, { label: 'Follow my inner intuition', color: 'purple' }] },
    { id: 'q2', text: 'Among friends, I am…', options: [{ label: 'The energizing leader', color: 'red' }, { label: 'The trusted advisor', color: 'blue' }, { label: 'The one who brings laughter', color: 'yellow' }, { label: 'The caring peacekeeper', color: 'green' }, { label: 'The one with unique perspectives', color: 'purple' }] },
    { id: 'q3', text: 'When stressed, I…', options: [{ label: 'Release it through physical activity', color: 'red' }, { label: 'Analyze and find solutions alone', color: 'blue' }, { label: 'Find new hobbies or activities', color: 'yellow' }, { label: 'Talk it through with someone close', color: 'green' }, { label: 'Take solitary time to meditate', color: 'purple' }] },
    { id: 'q4', text: 'My ideal weekend involves…', options: [{ label: 'Sports or outdoor adventures', color: 'red' }, { label: 'A good book or documentary', color: 'blue' }, { label: 'Creative arts or new experiences', color: 'yellow' }, { label: 'Gathering with family and friends', color: 'green' }, { label: 'Solitary creative or exploratory time', color: 'purple' }] },
    { id: 'q5', text: 'My biggest motivation is…', options: [{ label: 'Creating achievements and results', color: 'red' }, { label: 'Pursuing truth and knowledge', color: 'blue' }, { label: 'Discovering and expressing possibilities', color: 'yellow' }, { label: 'Making a positive difference for people', color: 'green' }, { label: 'Finding deep meaning and inspiration', color: 'purple' }] },
    { id: 'q6', text: 'In conflicts, I…', options: [{ label: 'Confront directly and resolve quickly', color: 'red' }, { label: 'Reason logically based on facts', color: 'blue' }, { label: 'Use humor to ease the tension', color: 'yellow' }, { label: 'Try to understand both sides', color: 'green' }, { label: 'Step back and see the big picture', color: 'purple' }] },
    { id: 'q7', text: 'My learning style is…', options: [{ label: 'Hands-on, learning by doing', color: 'red' }, { label: 'Systematic analysis and understanding', color: 'blue' }, { label: 'Visual and creative approaches', color: 'yellow' }, { label: 'Discussion and teaching others', color: 'green' }, { label: 'Intuition and pattern recognition', color: 'purple' }] },
    { id: 'q8', text: 'Words that best describe me…', options: [{ label: 'Dynamic, bold, action-oriented', color: 'red' }, { label: 'Careful, analytical, reliable', color: 'blue' }, { label: 'Optimistic, creative, enthusiastic', color: 'yellow' }, { label: 'Warm, empathetic, harmonious', color: 'green' }, { label: 'Intuitive, mysterious, original', color: 'purple' }] },
    { id: 'q9', text: 'My decision-making style is…', options: [{ label: 'Fast and instinctive', color: 'red' }, { label: 'After reviewing all the data', color: 'blue' }, { label: 'Imagining possibilities and opportunities', color: 'yellow' }, { label: 'Considering impact on relationships', color: 'green' }, { label: 'Trusting a deep inner sense', color: 'purple' }] },
    { id: 'q10', text: 'My greatest fear is…', options: [{ label: 'Failure or losing control', color: 'red' }, { label: 'Being wrong or illogical', color: 'blue' }, { label: 'Boredom or being restricted', color: 'yellow' }, { label: 'Broken relationships or rejection', color: 'green' }, { label: 'Becoming ordinary or losing individuality', color: 'purple' }] },
    { id: 'q11', text: 'My ideal work environment is…', options: [{ label: 'Fast-paced with plenty of challenges', color: 'red' }, { label: 'Structured where expertise is valued', color: 'blue' }, { label: 'Free with room for creativity', color: 'yellow' }, { label: 'Collaborative where I help people', color: 'green' }, { label: 'Independent with deep, focused work', color: 'purple' }] },
    { id: 'q12', text: 'When expressing gratitude, I…', options: [{ label: 'Repay with concrete actions', color: 'red' }, { label: 'Write a sincere letter or message', color: 'blue' }, { label: 'Plan a fun event or surprise gift', color: 'yellow' }, { label: 'Express with warm words and a hug', color: 'green' }, { label: 'Think of something special and meaningful', color: 'purple' }] },
    { id: 'q13', text: 'My energy source is…', options: [{ label: 'Moments of competition and achievement', color: 'red' }, { label: 'Discovering new knowledge', color: 'blue' }, { label: 'When new ideas spring up', color: 'yellow' }, { label: 'Deeply connecting with someone', color: 'green' }, { label: 'Finding deep insight and meaning', color: 'purple' }] },
    { id: 'q14', text: 'As a leader, I…', options: [{ label: 'Set direction decisively and lead the team', color: 'red' }, { label: 'Lead systematically with data and strategy', color: 'blue' }, { label: 'Inspire with vision and enthusiasm', color: 'yellow' }, { label: 'Support each person\'s strengths', color: 'green' }, { label: 'Offer new paths through intuitive insight', color: 'purple' }] },
    { id: 'q15', text: 'My typical daily life is…', options: [{ label: 'Active and always moving', color: 'red' }, { label: 'Systematic, living by a plan', color: 'blue' }, { label: 'Spontaneous and exploratory', color: 'yellow' }, { label: 'Spent connecting with people', color: 'green' }, { label: 'Quiet but deeply contemplative', color: 'purple' }] },
  ],
  ja: [
    { id: 'q1', text: '新しいプロジェクトを始めるとき、私は…', options: [{ label: 'すぐに行動に移す', color: 'red' }, { label: '徹底的に計画を立てる', color: 'blue' }, { label: '創造的なアイデアを出す', color: 'yellow' }, { label: 'まずチームの意見を聞く', color: 'green' }, { label: '内なる直感に従う', color: 'purple' }] },
    { id: 'q2', text: '友人の中で私は…', options: [{ label: '場を盛り上げるリーダー', color: 'red' }, { label: '信頼されるアドバイザー', color: 'blue' }, { label: '笑いをもたらす存在', color: 'yellow' }, { label: 'みんなを気遣う調停役', color: 'green' }, { label: '独自の視点を持つ人', color: 'purple' }] },
    { id: 'q3', text: 'ストレスを感じたとき、私は…', options: [{ label: '身体的な活動で発散する', color: 'red' }, { label: '一人で分析して解決策を探す', color: 'blue' }, { label: '新しい趣味や活動を見つける', color: 'yellow' }, { label: '近しい人と話す', color: 'green' }, { label: '一人で瞑想する時間を持つ', color: 'purple' }] },
    { id: 'q4', text: '理想の週末は…', options: [{ label: 'スポーツやアウトドアの冒険', color: 'red' }, { label: '良い本やドキュメンタリー鑑賞', color: 'blue' }, { label: 'アート活動や新しい体験', color: 'yellow' }, { label: '家族や友人との集まり', color: 'green' }, { label: '一人での創作や探求の時間', color: 'purple' }] },
    { id: 'q5', text: '私の最大のモチベーションは…', options: [{ label: '成果と結果を生み出すこと', color: 'red' }, { label: '真実と知識を追求すること', color: 'blue' }, { label: '可能性を発見し表現すること', color: 'yellow' }, { label: '人々にポジティブな影響を与えること', color: 'green' }, { label: '深い意味とインスピレーションを見つけること', color: 'purple' }] },
    { id: 'q6', text: '対立が生じたとき、私は…', options: [{ label: '直接向き合い素早く解決する', color: 'red' }, { label: '事実に基づいて論理的に話す', color: 'blue' }, { label: 'ユーモアで雰囲気を和らげる', color: 'yellow' }, { label: '両方の立場を理解しようとする', color: 'green' }, { label: '一歩引いて大局を見る', color: 'purple' }] },
    { id: 'q7', text: '私の学習スタイルは…', options: [{ label: '実際にやってみて経験から学ぶ', color: 'red' }, { label: '体系的に分析して理解する', color: 'blue' }, { label: 'ビジュアルで創造的な方法で学ぶ', color: 'yellow' }, { label: 'ディスカッションして教えながら学ぶ', color: 'green' }, { label: '直感とパターン認識で学ぶ', color: 'purple' }] },
    { id: 'q8', text: '私を最もよく表す言葉は…', options: [{ label: 'ダイナミック、大胆、行動的', color: 'red' }, { label: '慎重、分析的、信頼できる', color: 'blue' }, { label: '楽観的、創造的、情熱的', color: 'yellow' }, { label: '温かい、共感的、調和的', color: 'green' }, { label: '直感的、神秘的、独創的', color: 'purple' }] },
    { id: 'q9', text: '私の意思決定スタイルは…', options: [{ label: '素早く直感的に決める', color: 'red' }, { label: 'すべてのデータを確認してから決める', color: 'blue' }, { label: '可能性と機会を想像して決める', color: 'yellow' }, { label: '関係への影響を考慮して決める', color: 'green' }, { label: '内なる深い感覚を信じて決める', color: 'purple' }] },
    { id: 'q10', text: '私の最大の恐れは…', options: [{ label: '失敗したりコントロールを失うこと', color: 'red' }, { label: '間違いや非論理的に見られること', color: 'blue' }, { label: '退屈や制約を受けること', color: 'yellow' }, { label: '関係が壊れたり拒絶されること', color: 'green' }, { label: '平凡になったり個性を失うこと', color: 'purple' }] },
    { id: 'q11', text: '理想の職場環境は…', options: [{ label: 'スピーディーでチャレンジングな環境', color: 'red' }, { label: '体系的で専門性を発揮できる環境', color: 'blue' }, { label: '自由で創造性を活かせる環境', color: 'yellow' }, { label: '協力して人を助けられる環境', color: 'green' }, { label: '独立して深く取り組める環境', color: 'purple' }] },
    { id: 'q12', text: '感謝を表すとき、私は…', options: [{ label: '具体的な行動で返す', color: 'red' }, { label: '心のこもった手紙やメッセージを書く', color: 'blue' }, { label: '楽しいイベントやサプライズを計画する', color: 'yellow' }, { label: '温かい言葉とハグで表す', color: 'green' }, { label: '特別で意味のある方法を考える', color: 'purple' }] },
    { id: 'q13', text: '私のエネルギー源は…', options: [{ label: '競争と成果の瞬間', color: 'red' }, { label: '新しい知識を発見する瞬間', color: 'blue' }, { label: '新しいアイデアが浮かぶとき', color: 'yellow' }, { label: '誰かと深くつながるとき', color: 'green' }, { label: '深い洞察と意味を発見するとき', color: 'purple' }] },
    { id: 'q14', text: 'リーダーとして私は…', options: [{ label: '決断力を持って方向を定めチームを率いる', color: 'red' }, { label: 'データと戦略で体系的に導く', color: 'blue' }, { label: 'ビジョンと情熱でインスピレーションを与える', color: 'yellow' }, { label: '各自の強みを活かしてサポートする', color: 'green' }, { label: '直感的洞察で新しい道を示す', color: 'purple' }] },
    { id: 'q15', text: '私の日常的な姿は…', options: [{ label: '活動的でいつも動き回っている', color: 'red' }, { label: '計画通りに体系的に生活する', color: 'blue' }, { label: '即興的で探索を楽しむ', color: 'yellow' }, { label: '人々と交流しながら過ごす', color: 'green' }, { label: '静かだが深く思索している', color: 'purple' }] },
  ],
  zh: [
    { id: 'q1', text: '开始一个新项目时，我会…', options: [{ label: '马上动手', color: 'red' }, { label: '先把计划做扎实', color: 'blue' }, { label: '抛出有创意的点子', color: 'yellow' }, { label: '先听听大家怎么说', color: 'green' }, { label: '跟着心里的直觉走', color: 'purple' }] },
    { id: 'q2', text: '在朋友里，我是…', options: [{ label: '带气氛的那个', color: 'red' }, { label: '大家信得过的军师', color: 'blue' }, { label: '把笑声带来的人', color: 'yellow' }, { label: '照顾到每个人的协调者', color: 'green' }, { label: '看事情角度独特的人', color: 'purple' }] },
    { id: 'q3', text: '压力大的时候，我会…', options: [{ label: '去运动，动一动就散了', color: 'red' }, { label: '自己拆解问题，找解法', color: 'blue' }, { label: '去找点新玩法', color: 'yellow' }, { label: '跟亲近的人说说话', color: 'green' }, { label: '独处一会儿，静一静', color: 'purple' }] },
    { id: 'q4', text: '理想的周末是…', options: [{ label: '运动或去野外冒险', color: 'red' }, { label: '读本好书或看纪录片', color: 'blue' }, { label: '做点创作或尝试新鲜事', color: 'yellow' }, { label: '和家人朋友聚一聚', color: 'green' }, { label: '自己安静地创作或钻研', color: 'purple' }] },
    { id: 'q5', text: '我最大的动力是…', options: [{ label: '做出成绩', color: 'red' }, { label: '把真相和知识弄明白', color: 'blue' }, { label: '发现并表达可能性', color: 'yellow' }, { label: '给别人带来好的影响', color: 'green' }, { label: '找到更深的意义与灵感', color: 'purple' }] },
    { id: 'q6', text: '起冲突时，我会…', options: [{ label: '正面处理，快点了结', color: 'red' }, { label: '摆事实，讲道理', color: 'blue' }, { label: '用玩笑把气氛松下来', color: 'yellow' }, { label: '试着理解两边的立场', color: 'green' }, { label: '退一步看整体', color: 'purple' }] },
    { id: 'q7', text: '我的学习方式是…', options: [{ label: '上手做，从经验里学', color: 'red' }, { label: '有条理地分析、理解', color: 'blue' }, { label: '用画面和创意的方式学', color: 'yellow' }, { label: '边讨论边教别人，学得快', color: 'green' }, { label: '靠直觉和找规律来学', color: 'purple' }] },
    { id: 'q8', text: '最像我的词是…', options: [{ label: '有劲、敢闯、行动派', color: 'red' }, { label: '审慎、会分析、靠得住', color: 'blue' }, { label: '乐观、有创意、热情', color: 'yellow' }, { label: '温暖、体贴、和气', color: 'green' }, { label: '直觉、神秘、独特', color: 'purple' }] },
    { id: 'q9', text: '我做决定时…', options: [{ label: '又快又凭直觉', color: 'red' }, { label: '把资料看完再定', color: 'blue' }, { label: '想着各种可能与机会', color: 'yellow' }, { label: '看这对关系有什么影响', color: 'green' }, { label: '相信心里那股深处的感觉', color: 'purple' }] },
    { id: 'q10', text: '我最怕的是…', options: [{ label: '失败，或失去掌控', color: 'red' }, { label: '弄错，或显得没逻辑', color: 'blue' }, { label: '无聊，或被框住', color: 'yellow' }, { label: '关系破裂，被拒绝', color: 'green' }, { label: '变得平庸，丢掉自己', color: 'purple' }] },
    { id: 'q11', text: '理想的工作环境是…', options: [{ label: '节奏快、有挑战', color: 'red' }, { label: '有制度、能发挥专业', color: 'blue' }, { label: '自由、能发挥创意', color: 'yellow' }, { label: '能协作、能帮到人', color: 'green' }, { label: '能独立、能做深的地方', color: 'purple' }] },
    { id: 'q12', text: '表达感谢时，我会…', options: [{ label: '用实际行动回报', color: 'red' }, { label: '写封真心的信或讯息', color: 'blue' }, { label: '办个惊喜或送个小礼', color: 'yellow' }, { label: '用温暖的话和拥抱', color: 'green' }, { label: '想一个特别又有意义的方式', color: 'purple' }] },
    { id: 'q13', text: '给我能量的时刻是…', options: [{ label: '竞争与拿下成果时', color: 'red' }, { label: '发现新知识时', color: 'blue' }, { label: '灵感冒出来的时候', color: 'yellow' }, { label: '跟人深深连上的时候', color: 'green' }, { label: '看懂更深的意义时', color: 'purple' }] },
    { id: 'q14', text: '作为带头的人，我…', options: [{ label: '果断定方向，带着走', color: 'red' }, { label: '靠数据和策略有章法地带', color: 'blue' }, { label: '用愿景和热情点燃大家', color: 'yellow' }, { label: '把各人的长处用起来', color: 'green' }, { label: '用直觉指出新的路', color: 'purple' }] },
    { id: 'q15', text: '我的日常是…', options: [{ label: '活跃，忙个不停', color: 'red' }, { label: '照计划，有条理', color: 'blue' }, { label: '随兴，爱探索', color: 'yellow' }, { label: '在人群里来往', color: 'green' }, { label: '安静，但想得深', color: 'purple' }] },
  ],
  fr: [
    { id: 'q1', text: 'Quand je lance un projet, je…', options: [{ label: 'passe à l’action tout de suite', color: 'red' }, { label: 'établis un plan solide', color: 'blue' }, { label: 'propose des idées neuves', color: 'yellow' }, { label: 'écoute d’abord l’équipe', color: 'green' }, { label: 'suis mon intuition', color: 'purple' }] },
    { id: 'q2', text: 'Entre amis, je suis…', options: [{ label: 'celui ou celle qui entraîne', color: 'red' }, { label: 'le conseil de confiance', color: 'blue' }, { label: 'celui ou celle qui fait rire', color: 'yellow' }, { label: 'le médiateur attentif à tous', color: 'green' }, { label: 'la personne au regard singulier', color: 'purple' }] },
    { id: 'q3', text: 'Sous pression, je…', options: [{ label: 'évacue par le sport ou le mouvement', color: 'red' }, { label: 'analyse seul jusqu’à la solution', color: 'blue' }, { label: 'cherche une activité nouvelle', color: 'yellow' }, { label: 'parle avec un proche', color: 'green' }, { label: 'm’isole et médite', color: 'purple' }] },
    { id: 'q4', text: 'Le week-end idéal, c’est…', options: [{ label: 'du sport ou une escapade dehors', color: 'red' }, { label: 'un bon livre ou un documentaire', color: 'blue' }, { label: 'une activité créative, quelque chose d’inédit', color: 'yellow' }, { label: 'un moment en famille ou entre amis', color: 'green' }, { label: 'du temps seul à créer ou à chercher', color: 'purple' }] },
    { id: 'q5', text: 'Ce qui me motive le plus, c’est…', options: [{ label: 'obtenir des résultats', color: 'red' }, { label: 'chercher le vrai et le savoir', color: 'blue' }, { label: 'découvrir et exprimer des possibles', color: 'yellow' }, { label: 'avoir un effet positif sur les gens', color: 'green' }, { label: 'trouver du sens et de l’inspiration', color: 'purple' }] },
    { id: 'q6', text: 'En cas de conflit, je…', options: [{ label: 'affronte et règle vite', color: 'red' }, { label: 'discute avec des faits, logiquement', color: 'blue' }, { label: 'détends l’atmosphère avec humour', color: 'yellow' }, { label: 'essaie de comprendre les deux camps', color: 'green' }, { label: 'prends du recul pour voir l’ensemble', color: 'purple' }] },
    { id: 'q7', text: 'Ma façon d’apprendre, c’est…', options: [{ label: 'faire et apprendre par l’expérience', color: 'red' }, { label: 'analyser méthodiquement', color: 'blue' }, { label: 'apprendre par le visuel et la création', color: 'yellow' }, { label: 'apprendre en discutant et en expliquant', color: 'green' }, { label: 'apprendre par intuition et par motifs', color: 'purple' }] },
    { id: 'q8', text: 'Le mot qui me décrit le mieux…', options: [{ label: 'dynamique, audacieux, en action', color: 'red' }, { label: 'posé, analytique, fiable', color: 'blue' }, { label: 'optimiste, créatif, enthousiaste', color: 'yellow' }, { label: 'chaleureux, empathique, apaisant', color: 'green' }, { label: 'intuitif, mystérieux, singulier', color: 'purple' }] },
    { id: 'q9', text: 'Je décide…', options: [{ label: 'vite et d’instinct', color: 'red' }, { label: 'après avoir examiné les données', color: 'blue' }, { label: 'en imaginant les possibles', color: 'yellow' }, { label: 'en pensant à l’effet sur la relation', color: 'green' }, { label: 'en me fiant à un ressenti profond', color: 'purple' }] },
    { id: 'q10', text: 'Ce que je crains le plus, c’est…', options: [{ label: 'l’échec ou la perte de contrôle', color: 'red' }, { label: 'me tromper ou paraître illogique', color: 'blue' }, { label: 'l’ennui ou les contraintes', color: 'yellow' }, { label: 'la rupture ou le rejet', color: 'green' }, { label: 'devenir banal, perdre ce qui me distingue', color: 'purple' }] },
    { id: 'q11', text: 'L’environnement de travail idéal…', options: [{ label: 'rapide, plein de défis', color: 'red' }, { label: 'structuré, où l’expertise compte', color: 'blue' }, { label: 'libre, où la création respire', color: 'yellow' }, { label: 'coopératif, où l’on aide les gens', color: 'green' }, { label: 'indépendant, où l’on creuse', color: 'purple' }] },
    { id: 'q12', text: 'Pour dire merci, je…', options: [{ label: 'rends la pareille en actes', color: 'red' }, { label: 'écris un mot sincère', color: 'blue' }, { label: 'prépare une surprise ou un cadeau', color: 'yellow' }, { label: 'dis des mots chaleureux, je prends dans les bras', color: 'green' }, { label: 'invente quelque chose d’unique et de juste', color: 'purple' }] },
    { id: 'q13', text: 'Ce qui me recharge, c’est…', options: [{ label: 'la compétition et la réussite', color: 'red' }, { label: 'découvrir un savoir nouveau', color: 'blue' }, { label: 'le moment où l’idée surgit', color: 'yellow' }, { label: 'un lien profond avec quelqu’un', color: 'green' }, { label: 'comprendre un sens caché', color: 'purple' }] },
    { id: 'q14', text: 'Comme responsable, je…', options: [{ label: 'tranche et mène le groupe', color: 'red' }, { label: 'pilote par les données et la stratégie', color: 'blue' }, { label: 'inspire par la vision et l’élan', color: 'yellow' }, { label: 'mets en valeur les forces de chacun', color: 'green' }, { label: 'ouvre une voie par l’intuition', color: 'purple' }] },
    { id: 'q15', text: 'Mon quotidien est…', options: [{ label: 'actif, bien rempli', color: 'red' }, { label: 'organisé, selon le plan', color: 'blue' }, { label: 'spontané, curieux', color: 'yellow' }, { label: 'entouré de gens', color: 'green' }, { label: 'calme, mais profond', color: 'purple' }] },
  ],
  es: [
    { id: 'q1', text: 'Cuando empiezo algo nuevo, yo…', options: [{ label: 'me pongo en marcha ya', color: 'red' }, { label: 'armo un plan sólido primero', color: 'blue' }, { label: 'suelto ideas nuevas', color: 'yellow' }, { label: 'escucho antes al equipo', color: 'green' }, { label: 'sigo lo que me dice la intuición', color: 'purple' }] },
    { id: 'q2', text: 'Entre amigos, soy…', options: [{ label: 'quien levanta el ambiente', color: 'red' }, { label: 'el consejo de confianza', color: 'blue' }, { label: 'quien trae la risa', color: 'yellow' }, { label: 'quien cuida que nadie quede fuera', color: 'green' }, { label: 'quien mira las cosas de otra manera', color: 'purple' }] },
    { id: 'q3', text: 'Con estrés, yo…', options: [{ label: 'lo suelto con deporte o movimiento', color: 'red' }, { label: 'lo analizo a solas hasta dar con la salida', color: 'blue' }, { label: 'busco algo nuevo que hacer', color: 'yellow' }, { label: 'lo hablo con alguien cercano', color: 'green' }, { label: 'me retiro un rato y respiro', color: 'purple' }] },
    { id: 'q4', text: 'El finde ideal es…', options: [{ label: 'deporte o una escapada al aire libre', color: 'red' }, { label: 'un buen libro o un documental', color: 'blue' }, { label: 'crear algo o probar algo nuevo', color: 'yellow' }, { label: 'una reunión con familia o amigos', color: 'green' }, { label: 'tiempo a solas para crear o indagar', color: 'purple' }] },
    { id: 'q5', text: 'Lo que más me mueve es…', options: [{ label: 'conseguir resultados', color: 'red' }, { label: 'ir detrás de la verdad y el saber', color: 'blue' }, { label: 'descubrir y expresar posibilidades', color: 'yellow' }, { label: 'dejar algo bueno en la gente', color: 'green' }, { label: 'encontrar sentido e inspiración', color: 'purple' }] },
    { id: 'q6', text: 'Si hay un conflicto, yo…', options: [{ label: 'lo afronto y lo cierro rápido', color: 'red' }, { label: 'hablo con datos y lógica', color: 'blue' }, { label: 'aflojo el ambiente con humor', color: 'yellow' }, { label: 'intento entender a las dos partes', color: 'green' }, { label: 'doy un paso atrás y miro el conjunto', color: 'purple' }] },
    { id: 'q7', text: 'Mi forma de aprender es…', options: [{ label: 'haciendo, por experiencia', color: 'red' }, { label: 'analizando con método', color: 'blue' }, { label: 'por lo visual y lo creativo', color: 'yellow' }, { label: 'discutiendo y explicando a otros', color: 'green' }, { label: 'por intuición y por patrones', color: 'purple' }] },
    { id: 'q8', text: 'La palabra que mejor me define…', options: [{ label: 'enérgico, audaz, de acción', color: 'red' }, { label: 'prudente, analítico, de fiar', color: 'blue' }, { label: 'optimista, creativo, entusiasta', color: 'yellow' }, { label: 'cálido, empático, conciliador', color: 'green' }, { label: 'intuitivo, misterioso, singular', color: 'purple' }] },
    { id: 'q9', text: 'Decido…', options: [{ label: 'rápido y por instinto', color: 'red' }, { label: 'después de revisar todos los datos', color: 'blue' }, { label: 'imaginando posibilidades', color: 'yellow' }, { label: 'pensando en cómo afecta a la relación', color: 'green' }, { label: 'confiando en una sensación honda', color: 'purple' }] },
    { id: 'q10', text: 'Lo que más temo es…', options: [{ label: 'fallar o perder el control', color: 'red' }, { label: 'equivocarme o parecer poco lógico', color: 'blue' }, { label: 'el aburrimiento o las ataduras', color: 'yellow' }, { label: 'que se rompa el vínculo o me rechacen', color: 'green' }, { label: 'volverme del montón y perder lo mío', color: 'purple' }] },
    { id: 'q11', text: 'El entorno de trabajo ideal es…', options: [{ label: 'rápido y con retos', color: 'red' }, { label: 'ordenado, donde valga el oficio', color: 'blue' }, { label: 'libre, donde la creatividad respire', color: 'yellow' }, { label: 'colaborativo, donde se ayuda', color: 'green' }, { label: 'independiente, para trabajar a fondo', color: 'purple' }] },
    { id: 'q12', text: 'Para dar las gracias, yo…', options: [{ label: 'lo devuelvo con hechos', color: 'red' }, { label: 'escribo unas líneas sinceras', color: 'blue' }, { label: 'monto una sorpresa o un detalle', color: 'yellow' }, { label: 'lo digo con palabras cálidas y un abrazo', color: 'green' }, { label: 'invento algo especial y con sentido', color: 'purple' }] },
    { id: 'q13', text: 'Lo que me carga las pilas es…', options: [{ label: 'competir y lograrlo', color: 'red' }, { label: 'descubrir algo que no sabía', color: 'blue' }, { label: 'el momento en que aparece la idea', color: 'yellow' }, { label: 'conectar de verdad con alguien', color: 'green' }, { label: 'entender un sentido más hondo', color: 'purple' }] },
    { id: 'q14', text: 'Como quien lleva el grupo, yo…', options: [{ label: 'marco el rumbo y tiro del carro', color: 'red' }, { label: 'llevo con datos y estrategia', color: 'blue' }, { label: 'inspiro con visión y entusiasmo', color: 'yellow' }, { label: 'saco lo mejor de cada uno', color: 'green' }, { label: 'abro camino con la intuición', color: 'purple' }] },
    { id: 'q15', text: 'Mi día a día es…', options: [{ label: 'activo, siempre en movimiento', color: 'red' }, { label: 'ordenado, según el plan', color: 'blue' }, { label: 'espontáneo, curioso', color: 'yellow' }, { label: 'entre gente, en contacto', color: 'green' }, { label: 'tranquilo, pero con hondura', color: 'purple' }] },
  ],
}

const RESULTS: Record<ColorType, Record<SupportedLang, ColorResult>> = {
  red: {
    ko: { name: '열정의 레드', emoji: '🔴', tagline: '당신은 열정과 에너지로 세상을 바꾸는 사람', description: '레드 타입은 강한 추진력과 행동 지향적인 에너지를 가지고 있습니다. 목표가 생기면 즉시 행동하고, 도전을 두려워하지 않습니다. 당신의 열정은 주변 사람들에게 활력을 불어넣습니다.', strengths: ['강한 추진력과 실행력', '도전을 두려워하지 않는 용기', '목표 지향적인 집중력', '열정적인 에너지로 팀을 고무시킴'], growth: ['충동적 결정 전 잠시 멈추기', '타인의 의견에 더 귀 기울이기', '속도보다 지속성 키우기'], compatible: ['블루 - 전략적 보완', '그린 - 감정적 균형'] },
    en: { name: 'Passionate Red', emoji: '🔴', tagline: 'You change the world with passion and energy', description: 'Red types have strong drive and action-oriented energy. When they have a goal, they act immediately and don\'t fear challenges. Your passion infuses vitality into those around you.', strengths: ['Strong drive and execution', 'Courage to face challenges', 'Goal-oriented focus', 'Inspiring enthusiasm that motivates teams'], growth: ['Pause before impulsive decisions', 'Listen more to others\' perspectives', 'Build sustainability over speed'], compatible: ['Blue — strategic balance', 'Green — emotional grounding'] },
    ja: { name: '情熱のレッド', emoji: '🔴', tagline: '情熱とエネルギーで世界を変える人', description: 'レッドタイプは強い推進力と行動指向のエネルギーを持っています。目標ができればすぐに行動し、挑戦を恐れません。あなたの情熱は周りの人々に活力を与えます。', strengths: ['強い推進力と実行力', '挑戦を恐れない勇気', '目標志向の集中力', '熱意でチームを鼓舞する'], growth: ['衝動的な決定の前に一息つく', '他者の意見にもっと耳を傾ける', 'スピードより継続性を育てる'], compatible: ['ブルー — 戦略的補完', 'グリーン — 感情的バランス'] },
    zh: { name: '热情红', emoji: '🔴', tagline: '你是用热情和行动改变周遭的人', description: '红色型的人推力强，想到就动。目标一立就往前走，也不怕迎面而来的挑战。你的热度会传给旁边的人。', strengths: ['推得动，也做得出来', '不怕碰硬', '盯住目标不放', '热度能带起一群人'], growth: ['冲动下决定前，先停三秒', '多听听别人怎么说', '把速度换一点耐久'], compatible: ['蓝 — 补上策略', '绿 — 把情绪拉回平衡'] },
    fr: { name: 'Rouge passion', emoji: '🔴', tagline: 'Vous changez ce qui vous entoure par l’élan', description: 'Le rouge avance : l’idée vient, l’action suit. Un objectif posé, vous y allez, et les obstacles ne vous effraient pas. Votre énergie se communique.', strengths: ['De l’élan et de l’exécution', 'Le cran d’affronter', 'Concentration sur l’objectif', 'Une énergie qui entraîne le groupe'], growth: ['Marquer un temps avant une décision impulsive', 'Écouter davantage l’avis des autres', 'Troquer un peu de vitesse contre de l’endurance'], compatible: ['Bleu — complète la stratégie', 'Vert — ramène l’équilibre émotionnel'] },
    es: { name: 'Rojo pasión', emoji: '🔴', tagline: 'Cambias lo que te rodea con empuje', description: 'El rojo se mueve: se le ocurre y actúa. Con una meta delante vas a por ella, y los obstáculos no te asustan. Tu energía se contagia.', strengths: ['Empuje y ejecución', 'Agallas para afrontar', 'Foco en la meta', 'Una energía que arrastra al grupo'], growth: ['Parar un segundo antes de decidir en caliente', 'Escuchar más a los demás', 'Cambiar algo de velocidad por constancia'], compatible: ['Azul — completa la estrategia', 'Verde — devuelve el equilibrio'] },
  },
  blue: {
    ko: { name: '신뢰의 블루', emoji: '🔵', tagline: '당신은 논리와 신뢰로 세상을 탐구하는 사람', description: '블루 타입은 분석적이고 체계적인 사고를 가지고 있습니다. 정확성을 중시하며 깊이 있는 지식을 추구합니다. 당신은 신뢰할 수 있는 존재로, 복잡한 문제를 명쾌하게 해결하는 능력이 있습니다.', strengths: ['정밀한 분석력과 논리적 사고', '신뢰성과 일관성', '깊이 있는 전문 지식 추구', '복잡한 문제 해결 능력'], growth: ['완벽주의에서 벗어나 유연성 키우기', '감정과 직관에도 공간 주기', '빠른 의사결정 연습하기'], compatible: ['레드 - 실행력 보완', '퍼플 - 통찰력 결합'] },
    en: { name: 'Trustworthy Blue', emoji: '🔵', tagline: 'You explore the world through logic and trust', description: 'Blue types have analytical and systematic thinking. They value accuracy and pursue in-depth knowledge. You are a reliable presence with the ability to solve complex problems with clarity.', strengths: ['Precise analytical and logical thinking', 'Reliability and consistency', 'Pursuit of deep expertise', 'Complex problem-solving ability'], growth: ['Release perfectionism and develop flexibility', 'Give space to emotions and intuition', 'Practice faster decision-making'], compatible: ['Red — execution complement', 'Purple — combining insight'] },
    ja: { name: '信頼のブルー', emoji: '🔵', tagline: '論理と信頼で世界を探求する人', description: 'ブルータイプは分析的で体系的な思考を持っています。正確さを重視し、深い知識を追求します。あなたは信頼できる存在で、複雑な問題を明快に解決する能力があります。', strengths: ['精密な分析力と論理的思考', '信頼性と一貫性', '深い専門知識の追求', '複雑な問題解決能力'], growth: ['完璧主義を手放して柔軟性を養う', '感情と直感にも空間を与える', '素早い意思決定を練習する'], compatible: ['レッド — 実行力の補完', 'パープル — 洞察力の結合'] },
    zh: { name: '信任蓝', emoji: '🔵', tagline: '你是用逻辑和可靠去弄懂世界的人', description: '蓝色型的人想得有条理，看重准确，愿意往深里钻。你是别人信得过的那个，复杂的事到你手上会被理清。', strengths: ['分析细，逻辑清楚', '可靠，前后一致', '肯把专业做深', '能解开复杂的结'], growth: ['从完美主义里松一点手', '也给情绪和直觉留位置', '练习快一点做决定'], compatible: ['红 — 补上执行', '紫 — 加上洞察'] },
    fr: { name: 'Bleu confiance', emoji: '🔵', tagline: 'Vous comprenez le monde par la logique et la fiabilité', description: 'Le bleu pense avec méthode, tient à l’exactitude et cherche à aller au fond. On vous fait confiance : ce qui est embrouillé s’éclaircit entre vos mains.', strengths: ['Analyse fine et logique claire', 'Fiabilité et constance', 'Goût de l’expertise approfondie', 'Capacité à démêler le complexe'], growth: ['Desserrer un peu le perfectionnisme', 'Laisser place à l’émotion et à l’intuition', 'S’entraîner à décider plus vite'], compatible: ['Rouge — complète l’exécution', 'Violet — ajoute l’intuition'] },
    es: { name: 'Azul confianza', emoji: '🔵', tagline: 'Entiendes el mundo con lógica y fiabilidad', description: 'El azul piensa con método, cuida la exactitud y quiere llegar al fondo. La gente confía en ti: lo enredado se aclara en tus manos.', strengths: ['Análisis fino y lógica clara', 'Fiable y constante', 'Te gusta profundizar en lo tuyo', 'Sabes desenredar lo complejo'], growth: ['Aflojar un poco el perfeccionismo', 'Dejar sitio a la emoción y la intuición', 'Practicar decidir más rápido'], compatible: ['Rojo — completa la ejecución', 'Morado — aporta la intuición'] },
  },
  yellow: {
    ko: { name: '창의의 옐로우', emoji: '🟡', tagline: '당신은 창의와 낙관으로 가능성을 여는 사람', description: '옐로우 타입은 넘치는 창의성과 낙관적인 에너지를 가지고 있습니다. 새로운 아이디어를 끊임없이 생성하고, 삶의 즐거움을 만들어냅니다. 당신의 밝은 에너지는 주변을 환하게 밝힙니다.', strengths: ['풍부한 창의성과 상상력', '낙관적인 에너지와 유머', '새로운 가능성을 발견하는 능력', '사람들에게 영감을 주는 열정'], growth: ['시작한 것을 완성하는 지속성 키우기', '현실적인 계획 수립 연습하기', '집중력 향상 전략 개발하기'], compatible: ['그린 - 안정감 제공', '퍼플 - 창의적 시너지'] },
    en: { name: 'Creative Yellow', emoji: '🟡', tagline: 'You open possibilities with creativity and optimism', description: 'Yellow types overflow with creativity and optimistic energy. They constantly generate new ideas and create joy in life. Your bright energy lights up everyone around you.', strengths: ['Rich creativity and imagination', 'Optimistic energy and humor', 'Ability to discover new possibilities', 'Inspiring enthusiasm'], growth: ['Build perseverance to finish what you start', 'Practice creating realistic plans', 'Develop focus and follow-through strategies'], compatible: ['Green — providing stability', 'Purple — creative synergy'] },
    ja: { name: '創造のイエロー', emoji: '🟡', tagline: '創造と楽観で可能性を開く人', description: 'イエロータイプは溢れる創造性と楽観的なエネルギーを持っています。常に新しいアイデアを生み出し、人生の楽しさを作り出します。あなたの明るいエネルギーは周りを照らします。', strengths: ['豊かな創造性と想像力', '楽観的なエネルギーとユーモア', '新しい可能性を発見する能力', 'インスピレーションを与える情熱'], growth: ['始めたことを完成させる継続性を養う', '現実的な計画立案を練習する', '集中力向上戦略を開発する'], compatible: ['グリーン — 安定感の提供', 'パープル — 創造的シナジー'] },
    zh: { name: '创意黄', emoji: '🟡', tagline: '你是用创意和乐观把可能性打开的人', description: '黄色型的人点子多，情绪也亮。新想法一个接一个，日子被你过出乐趣来。你的亮度会把周围照暖。', strengths: ['点子多，想象力足', '乐观，带幽默', '看得到新的可能', '热情能给人灵感'], growth: ['把开了头的事做完', '练习把计划落到实处', '找到让自己专注的办法'], compatible: ['绿 — 给出安稳', '紫 — 创意上互相点火'] },
    fr: { name: 'Jaune créatif', emoji: '🟡', tagline: 'Vous ouvrez des possibles par l’imagination et l’optimisme', description: 'Le jaune déborde d’idées et d’allant. Les projets naissent les uns après les autres et la vie prend du goût. Votre éclat réchauffe autour de vous.', strengths: ['Imagination abondante', 'Optimisme et humour', 'Sait voir des possibles neufs', 'Un enthousiasme qui inspire'], growth: ['Terminer ce qui a été commencé', 'S’exercer à des plans réalistes', 'Trouver ses propres appuis pour se concentrer'], compatible: ['Vert — apporte la stabilité', 'Violet — la création s’enflamme à deux'] },
    es: { name: 'Amarillo creativo', emoji: '🟡', tagline: 'Abres posibilidades con imaginación y optimismo', description: 'El amarillo desborda ideas y ánimo. Los proyectos van saliendo uno tras otro y la vida coge sabor. Tu brillo calienta lo que tienes alrededor.', strengths: ['Imaginación de sobra', 'Optimismo y humor', 'Ves posibilidades nuevas', 'Un entusiasmo que inspira'], growth: ['Terminar lo que empiezas', 'Practicar planes realistas', 'Buscar tus apoyos para concentrarte'], compatible: ['Verde — aporta calma', 'Morado — la creatividad se enciende a dos'] },
  },
  green: {
    ko: { name: '조화의 그린', emoji: '🟢', tagline: '당신은 공감과 조화로 관계를 가꾸는 사람', description: '그린 타입은 깊은 공감 능력과 따뜻한 마음을 가지고 있습니다. 사람들 사이의 조화를 소중히 여기고, 타인을 돕는 데서 진정한 기쁨을 느낍니다. 당신의 따뜻함은 모든 관계를 치유합니다.', strengths: ['깊은 공감 능력과 감수성', '갈등 해결과 중재 능력', '진정성 있는 관계 형성', '타인의 성장을 지원하는 능력'], growth: ['자신의 필요와 경계 인식하기', '갈등 회피보다 건강한 대립 연습하기', '타인의 기대에 덜 의존하기'], compatible: ['레드 - 활력 제공', '옐로우 - 긍정 에너지'] },
    en: { name: 'Harmonious Green', emoji: '🟢', tagline: 'You nurture relationships with empathy and harmony', description: 'Green types have deep empathy and warmth. They treasure harmony between people and find genuine joy in helping others. Your warmth heals every relationship.', strengths: ['Deep empathy and sensitivity', 'Conflict resolution and mediation', 'Building authentic relationships', 'Supporting others\' growth'], growth: ['Recognize your own needs and boundaries', 'Practice healthy confrontation over avoidance', 'Depend less on others\' expectations'], compatible: ['Red — providing vitality', 'Yellow — positive energy'] },
    ja: { name: '調和のグリーン', emoji: '🟢', tagline: '共感と調和で関係を育む人', description: 'グリーンタイプは深い共感能力と温かさを持っています。人々の間の調和を大切にし、他者を助けることに真の喜びを感じます。あなたの温かさはすべての関係を癒します。', strengths: ['深い共感能力と感受性', '対立解決と仲裁能力', '真正性のある関係構築', '他者の成長をサポートする能力'], growth: ['自分のニーズと境界を認識する', '回避より健全な対立を練習する', '他者の期待への依存を減らす'], compatible: ['レッド — 活力の提供', 'イエロー — ポジティブエネルギー'] },
    zh: { name: '和谐绿', emoji: '🟢', tagline: '你是用共情和和气把关系养起来的人', description: '绿色型的人心是暖的，也读得懂别人的情绪。你看重人与人之间的和睦，帮到别人时真的会开心。', strengths: ['共情深，感受细', '能化解矛盾、能居中', '关系真诚，交得长久', '愿意托着别人成长'], growth: ['认出自己的需要和界线', '与其回避，不如练习健康的对峙', '少一点依赖别人的期待'], compatible: ['红 — 带来活力', '黄 — 带来亮色'] },
    fr: { name: 'Vert harmonie', emoji: '🟢', tagline: 'Vous faites grandir les liens par l’empathie et l’entente', description: 'Le vert a le cœur chaud et lit bien les émotions des autres. L’entente entre les gens compte pour vous, et aider fait une vraie joie.', strengths: ['Empathie profonde et sensibilité', 'Sait apaiser et servir de pont', 'Des liens sincères et durables', 'Soutient la croissance des autres'], growth: ['Reconnaître ses propres besoins et limites', 'S’exercer au désaccord sain plutôt qu’à l’évitement', 'Moins dépendre des attentes des autres'], compatible: ['Rouge — apporte l’énergie', 'Jaune — apporte la lumière'] },
    es: { name: 'Verde armonía', emoji: '🟢', tagline: 'Cuidas los vínculos con empatía y buen trato', description: 'El verde tiene el corazón cálido y lee bien lo que sienten los demás. Te importa que la gente se entienda, y ayudar te alegra de verdad.', strengths: ['Empatía honda y sensibilidad', 'Sabes calmar y hacer de puente', 'Vínculos sinceros y duraderos', 'Sostienes el crecimiento ajeno'], growth: ['Reconocer lo que necesitas y tus límites', 'Practicar el desacuerdo sano en vez de evitarlo', 'Depender menos de lo que esperan de ti'], compatible: ['Rojo — trae energía', 'Amarillo — trae luz'] },
  },
  purple: {
    ko: { name: '직관의 퍼플', emoji: '🟣', tagline: '당신은 직관과 신비로 깊이를 탐구하는 사람', description: '퍼플 타입은 예리한 직관과 깊은 통찰력을 가지고 있습니다. 표면 너머를 보는 능력을 가지고 있으며, 독창적인 관점으로 세상을 이해합니다. 당신의 존재는 주변에 신비로운 깊이를 더합니다.', strengths: ['예리한 직관과 패턴 인식', '깊은 통찰력과 창의적 사고', '독창적인 관점과 개성', '심층적인 의미 탐구 능력'], growth: ['생각을 행동으로 연결하는 연습', '타인과의 소통 채널 넓히기', '자기 아이디어를 적극적으로 공유하기'], compatible: ['블루 - 논리적 보완', '옐로우 - 창의적 폭발'] },
    en: { name: 'Intuitive Purple', emoji: '🟣', tagline: 'You explore depths with intuition and mystery', description: 'Purple types have sharp intuition and deep insight. They can see beyond the surface and understand the world through a uniquely original lens. Your presence adds mysterious depth to everything around you.', strengths: ['Sharp intuition and pattern recognition', 'Deep insight and creative thinking', 'Unique perspective and individuality', 'Ability to explore deep meaning'], growth: ['Practice connecting thoughts to actions', 'Broaden communication channels with others', 'Actively share your ideas'], compatible: ['Blue — logical complement', 'Yellow — creative explosion'] },
    ja: { name: '直感のパープル', emoji: '🟣', tagline: '直感と神秘で深みを探求する人', description: 'パープルタイプは鋭い直感と深い洞察力を持っています。表面の向こうを見る能力を持ち、独創的な視点で世界を理解します。あなたの存在は周りに神秘的な深みを加えます。', strengths: ['鋭い直感とパターン認識', '深い洞察力と創造的思考', '独創的な視点と個性', '深い意味を探求する能力'], growth: ['思考を行動につなげる練習をする', '他者とのコミュニケーションチャネルを広げる', '自分のアイデアを積極的に共有する'], compatible: ['ブルー — 論理的補完', 'イエロー — 創造的爆発'] },
    zh: { name: '直觉紫', emoji: '🟣', tagline: '你是靠直觉和好奇往深处走的人', description: '紫色型的人感觉敏锐，看得到表面底下的东西。你理解世界的角度跟别人不太一样，身上带一点神秘。', strengths: ['直觉准，能看出规律', '洞察深，想法独到', '角度独特，有个性', '愿意追问意义'], growth: ['把想法接到行动上', '把跟人沟通的路拓宽', '更主动地把自己的想法说出来'], compatible: ['蓝 — 补上逻辑', '黄 — 创意上放大'] },
    fr: { name: 'Violet intuitif', emoji: '🟣', tagline: 'Vous allez vers le fond, guidé par l’intuition', description: 'Le violet perçoit finement et voit sous la surface. Votre façon de comprendre le monde ne ressemble pas tout à fait à celle des autres ; il s’en dégage un peu de mystère.', strengths: ['Intuition juste, lecture des motifs', 'Regard profond et original', 'Point de vue singulier', 'Goût de chercher le sens'], growth: ['Relier les idées à des actes', 'Élargir les canaux vers les autres', 'Partager ses idées plus activement'], compatible: ['Bleu — complète la logique', 'Jaune — amplifie la création'] },
    es: { name: 'Morado intuitivo', emoji: '🟣', tagline: 'Vas al fondo guiado por la intuición', description: 'El morado percibe fino y ve bajo la superficie. Tu manera de entender el mundo no se parece del todo a la de los demás; deja un aire de misterio.', strengths: ['Intuición certera, ves patrones', 'Mirada honda y original', 'Punto de vista propio', 'Ganas de buscar el sentido'], growth: ['Conectar las ideas con los actos', 'Abrir más canales hacia los demás', 'Compartir tus ideas con más iniciativa'], compatible: ['Azul — completa la lógica', 'Amarillo — amplifica la creatividad'] },
  },
}

interface Props { locale?: string }

export default function ColorPersonalityTest({ locale: lp = 'ko' }: Props) {
  const locale = lang(lp ?? 'ko')
  const lb = LABELS[locale]
  const questions = QUESTIONS[locale]

  const [current, setCurrent] = useState(0)
  const [scores, setScores] = useState<Record<ColorType, number>>({ red: 0, blue: 0, yellow: 0, green: 0, purple: 0 })
  const [result, setResult] = useState<ColorType | null>(null)
  useRecordFinishedTest({ testId: "color-personality", title: "ColorPersonalityTest", finished: Boolean(result) });

  function pick(color: ColorType) {
    const newScores = { ...scores, [color]: scores[color] + 1 }
    if (current + 1 >= questions.length) {
      const dominant = (Object.keys(newScores) as ColorType[]).reduce((a, b) => newScores[a] >= newScores[b] ? a : b)
      setResult(dominant)
    }
    setScores(newScores)
    setCurrent(current + 1)
  }

  function restart() { setScores({ red: 0, blue: 0, yellow: 0, green: 0, purple: 0 }); setCurrent(0); setResult(null) }

  function share() {
    if (!result) return
    const url = window.location.href
    const text = `${lb.shareMsg} — ${RESULTS[result][locale].name}`
    if (navigator.share) navigator.share({ title: lb.title, text, url })
    else navigator.clipboard.writeText(url)
  }

  const finished = current >= questions.length
  const colorNames: Record<ColorType, Record<SupportedLang, string>> = {
    red: { ko: '레드', en: 'Red', ja: 'レッド', zh: '红色', fr: 'Rouge', es: 'Rojo' },
    blue: { ko: '블루', en: 'Blue', ja: 'ブルー', zh: '蓝色', fr: 'Bleu', es: 'Azul' },
    yellow: { ko: '옐로우', en: 'Yellow', ja: 'イエロー', zh: '黄色', fr: 'Jaune', es: 'Amarillo' },
    green: { ko: '그린', en: 'Green', ja: 'グリーン', zh: '绿色', fr: 'Vert', es: 'Verde' },
    purple: { ko: '퍼플', en: 'Purple', ja: 'パープル', zh: '紫色', fr: 'Violet', es: 'Morado' },
  }

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
        options={q.options.map((opt) => ({ label: opt.label, value: opt.color }))}
        note={lb.note}
        onSelect={pick}
      />
    )
  }

  if (!result) return null
  const r = RESULTS[result][locale]
  const total = questions.length

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">{lb.yourColor}</p>
        <div className="text-5xl">{r.emoji}</div>
        <div className="inline-block rounded-2xl px-5 py-2 text-xl font-bold text-white" style={{ backgroundColor: COLOR_HEX[result] }}>{r.name}</div>
        <p className="font-medium text-muted-foreground">{r.tagline}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{r.description}</p>
      </div>
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h3 className="font-bold text-sm">{lb.colorProfile}</h3>
        {(Object.keys(scores) as ColorType[]).map(c => {
          const pct = Math.round((scores[c] / total) * 100)
          return (
            <div key={c} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium">{colorNames[c][locale]}</span>
                <span>{scores[c]}/{total}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={colorNames[c][locale]}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: COLOR_HEX[c] }} />
              </div>
            </div>
          )
        })}
      </div>
      <div className="rounded-xl border bg-card p-4 space-y-2">
        <h3 className="font-bold text-sm text-green-700">{lb.strengths}</h3>
        <ul className="space-y-1">{r.strengths.map(s => <li key={s} className="text-sm text-muted-foreground flex gap-2"><span className="text-green-500 flex-none">→</span>{s}</li>)}</ul>
      </div>
      <div className="rounded-xl border bg-card p-4 space-y-2">
        <h3 className="font-bold text-sm text-amber-600">{lb.growth}</h3>
        <ul className="space-y-1">{r.growth.map(g => <li key={g} className="text-sm text-muted-foreground flex gap-2"><span className="text-amber-500 flex-none">→</span>{g}</li>)}</ul>
      </div>
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
        <h3 className="font-bold text-sm text-primary">{lb.compatible}</h3>
        <ul className="space-y-1">{r.compatible.map(c => <li key={c} className="text-sm text-muted-foreground flex gap-2"><span className="text-primary flex-none">•</span>{c}</li>)}</ul>
      </div>
      <p className="text-center text-xs text-muted-foreground">{lb.note}</p>
      <ShareResultButton
        locale={lp}
        heading={lb.yourColor}
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
