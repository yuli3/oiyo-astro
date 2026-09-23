import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { Questionnaire } from '@/components/ui/questionnaire'
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip
} from 'recharts'
import ShareResultButton from '../shared/ShareResultButton'
import ResultSymbol, { resultSymbolSrc } from '../shared/ResultSymbol'

// ─── Types ────────────────────────────────────────────────────────────────────
type DiscType = 'D' | 'I' | 'S' | 'C'
type Scores = Record<DiscType, number>
type Locale = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'

interface Option { text: string; disc: DiscType }
interface Question { id: string; text: string; options: Option[] }
interface ResultData {
  title: string
  subtitle: string
  description: string
  keywords: string[]
  strengths: string[]
  weaknesses: string[]
  workStyle: string
  communication: string
  tip: string
}

const DISC_COLORS: Record<DiscType, string> = {
  D: '#ef4444',
  I: '#f59e0b',
  S: '#22c55e',
  C: '#3b82f6',
}

const LABELS: Record<Locale, {
  title: string
  subtitle: string
  questionOf: (c: number, t: number) => string
  restart: string
  share: string
  shareMsg: string
  yourType: string
  keywords: string
  strengths: string
  weaknesses: string
  workStyle: string
  communication: string
  tip: string
  chartTitle: string
  pct: string
}> = {
  ko: {
    title: 'DISC 성격 유형 테스트',
    subtitle: '나의 행동 방식과 소통 스타일은?',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '내 DISC 유형은',
    yourType: '나의 DISC 유형',
    keywords: '핵심 키워드',
    strengths: '강점',
    weaknesses: '약점',
    workStyle: '업무 스타일',
    communication: '소통 방식',
    tip: '성장 조언',
    chartTitle: 'DISC 성향 분석',
    pct: '%',
  },
  en: {
    title: 'DISC Personality Test',
    subtitle: 'What\'s your behavior and communication style?',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My DISC type is',
    yourType: 'Your DISC Type',
    keywords: 'Key Traits',
    strengths: 'Strengths',
    weaknesses: 'Weaknesses',
    workStyle: 'Work Style',
    communication: 'Communication Style',
    tip: 'Growth Tip',
    chartTitle: 'DISC Profile',
    pct: '%',
  },
  ja: {
    title: 'DISCパーソナリティテスト',
    subtitle: 'あなたの行動スタイルとコミュニケーションは？',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '私のDISCタイプは',
    yourType: '私のDISCタイプ',
    keywords: 'キーワード',
    strengths: '強み',
    weaknesses: '弱み',
    workStyle: '仕事スタイル',
    communication: 'コミュニケーション',
    tip: '成長のアドバイス',
    chartTitle: 'DISCプロファイル',
    pct: '%',
  },
  zh: {
    title: 'DISC 性格类型测验',
    subtitle: '我的行为方式与沟通风格是？',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: '重新测验',
    share: '分享结果',
    shareMsg: '我的 DISC 类型是',
    yourType: '我的 DISC 类型',
    keywords: '核心关键词',
    strengths: '优势',
    weaknesses: '弱点',
    workStyle: '工作风格',
    communication: '沟通方式',
    tip: '成长建议',
    chartTitle: 'DISC 倾向分析',
    pct: '%',
  },
  fr: {
    title: 'Test de personnalité DISC',
    subtitle: 'Quel est mon style de comportement et de communication ?',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: 'Recommencer',
    share: 'Partager le résultat',
    shareMsg: 'Mon type DISC',
    yourType: 'Mon type DISC',
    keywords: 'Mots-clés',
    strengths: 'Forces',
    weaknesses: 'Faiblesses',
    workStyle: 'Style de travail',
    communication: 'Mode de communication',
    tip: 'Conseils pour progresser',
    chartTitle: 'Analyse du profil DISC',
    pct: '%',
  },
  es: {
    title: 'Test de personalidad DISC',
    subtitle: '¿Cuál es mi estilo de conducta y de comunicación?',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: 'Repetir',
    share: 'Compartir resultado',
    shareMsg: 'Mi tipo DISC',
    yourType: 'Mi tipo DISC',
    keywords: 'Palabras clave',
    strengths: 'Fortalezas',
    weaknesses: 'Debilidades',
    workStyle: 'Estilo de trabajo',
    communication: 'Forma de comunicarse',
    tip: 'Consejos para crecer',
    chartTitle: 'Análisis del perfil DISC',
    pct: '%',
  },
}

const QUESTIONS: Record<Locale, Question[]> = {
  ko: [
    {
      id: 'q1',
      text: '새로운 일을 시작할 때 나는...',
      options: [
        { text: '빠르게 결정하고 바로 행동에 옮긴다', disc: 'D' },
        { text: '사람들에게 아이디어를 공유하며 흥분한다', disc: 'I' },
        { text: '모든 것을 신중히 준비한 뒤 시작한다', disc: 'S' },
        { text: '세부 계획과 자료를 충분히 검토한다', disc: 'C' },
      ],
    },
    {
      id: 'q2',
      text: '팀 프로젝트에서 나는 주로...',
      options: [
        { text: '목표를 설정하고 팀을 이끄는 역할을 한다', disc: 'D' },
        { text: '팀 분위기를 띄우고 모두를 격려한다', disc: 'I' },
        { text: '팀원들을 지원하며 안정적인 역할을 맡는다', disc: 'S' },
        { text: '데이터와 세부 사항을 분석하는 역할을 한다', disc: 'C' },
      ],
    },
    {
      id: 'q3',
      text: '갈등이 생겼을 때 나는...',
      options: [
        { text: '직접적으로 맞서 빠르게 해결하려 한다', disc: 'D' },
        { text: '분위기를 부드럽게 만들고 모두가 웃도록 한다', disc: 'I' },
        { text: '인내하며 조화로운 해결책을 찾는다', disc: 'S' },
        { text: '사실과 논리를 기반으로 분석하고 해결한다', disc: 'C' },
      ],
    },
    {
      id: 'q4',
      text: '나에게 가장 중요한 것은...',
      options: [
        { text: '결과와 성과', disc: 'D' },
        { text: '인정과 즐거움', disc: 'I' },
        { text: '안정과 신뢰', disc: 'S' },
        { text: '정확성과 품질', disc: 'C' },
      ],
    },
    {
      id: 'q5',
      text: '나의 가장 큰 두려움은...',
      options: [
        { text: '실패하거나 통제력을 잃는 것', disc: 'D' },
        { text: '거절당하거나 무시당하는 것', disc: 'I' },
        { text: '갑작스러운 변화나 불안정', disc: 'S' },
        { text: '비판받거나 틀리는 것', disc: 'C' },
      ],
    },
    {
      id: 'q6',
      text: '의사소통할 때 나는...',
      options: [
        { text: '직접적이고 간결하게 요점만 말한다', disc: 'D' },
        { text: '열정적이고 표현이 풍부하게 이야기한다', disc: 'I' },
        { text: '부드럽고 배려하며 차분하게 말한다', disc: 'S' },
        { text: '정확하고 사실 중심으로 조심스럽게 말한다', disc: 'C' },
      ],
    },
    {
      id: 'q7',
      text: '스트레스를 받을 때 나는...',
      options: [
        { text: '더 통제적이거나 과격해진다', disc: 'D' },
        { text: '감정적이 되거나 산만해진다', disc: 'I' },
        { text: '안으로 감추고 참는다', disc: 'S' },
        { text: '더 완벽주의적이 되거나 과도하게 분석한다', disc: 'C' },
      ],
    },
    {
      id: 'q8',
      text: '새로운 사람을 만날 때 나는...',
      options: [
        { text: '목적을 가지고 만나며 능력을 파악하려 한다', disc: 'D' },
        { text: '친근하게 다가가 금방 친해진다', disc: 'I' },
        { text: '조심스럽게 다가가며 천천히 신뢰를 쌓는다', disc: 'S' },
        { text: '관찰하고 상대를 분석한 후 다가간다', disc: 'C' },
      ],
    },
    {
      id: 'q9',
      text: '나의 이상적인 환경은...',
      options: [
        { text: '도전적인 목표와 자율성이 있는 환경', disc: 'D' },
        { text: '사람들과 활발히 교류하는 환경', disc: 'I' },
        { text: '안정적이고 예측 가능한 환경', disc: 'S' },
        { text: '체계적이고 정확성을 중시하는 환경', disc: 'C' },
      ],
    },
    {
      id: 'q10',
      text: '결정을 내릴 때 나는...',
      options: [
        { text: '빠르고 단호하게 결정한다', disc: 'D' },
        { text: '직감과 사람들의 반응을 보고 결정한다', disc: 'I' },
        { text: '신중하게 생각하고 다른 사람의 의견을 듣는다', disc: 'S' },
        { text: '충분한 정보와 분석 후 결정한다', disc: 'C' },
      ],
    },
    {
      id: 'q11',
      text: '일이 잘 안 풀릴 때 나는...',
      options: [
        { text: '더 강하게 밀어붙이거나 다른 방법을 찾는다', disc: 'D' },
        { text: '누군가에게 이야기하며 해소한다', disc: 'I' },
        { text: '인내하며 계속 노력한다', disc: 'S' },
        { text: '문제를 분석하고 원인을 파악한다', disc: 'C' },
      ],
    },
    {
      id: 'q12',
      text: '내가 리더라면 나는...',
      options: [
        { text: '명확한 목표를 설정하고 팀을 강하게 이끈다', disc: 'D' },
        { text: '팀원들에게 영감을 주고 열정을 불어넣는다', disc: 'I' },
        { text: '팀원들이 편안하게 일할 수 있도록 지원한다', disc: 'S' },
        { text: '높은 기준을 세우고 품질을 유지한다', disc: 'C' },
      ],
    },
  ],
  en: [
    {
      id: 'q1',
      text: 'When starting something new, I...',
      options: [
        { text: 'Decide quickly and take action immediately', disc: 'D' },
        { text: 'Get excited and share ideas with people', disc: 'I' },
        { text: 'Carefully prepare everything before starting', disc: 'S' },
        { text: 'Review detailed plans and materials thoroughly', disc: 'C' },
      ],
    },
    {
      id: 'q2',
      text: 'In a team project, I usually...',
      options: [
        { text: 'Set goals and take the lead', disc: 'D' },
        { text: 'Energize the team and encourage everyone', disc: 'I' },
        { text: 'Support teammates and take stable roles', disc: 'S' },
        { text: 'Analyze data and handle details', disc: 'C' },
      ],
    },
    {
      id: 'q3',
      text: 'When conflict arises, I...',
      options: [
        { text: 'Confront it directly and resolve it quickly', disc: 'D' },
        { text: 'Soften the mood and make everyone smile', disc: 'I' },
        { text: 'Patiently search for a harmonious solution', disc: 'S' },
        { text: 'Analyze based on facts and logic', disc: 'C' },
      ],
    },
    {
      id: 'q4',
      text: 'What matters most to me is...',
      options: [
        { text: 'Results and achievement', disc: 'D' },
        { text: 'Recognition and enjoyment', disc: 'I' },
        { text: 'Stability and trust', disc: 'S' },
        { text: 'Accuracy and quality', disc: 'C' },
      ],
    },
    {
      id: 'q5',
      text: 'My biggest fear is...',
      options: [
        { text: 'Failing or losing control', disc: 'D' },
        { text: 'Being rejected or ignored', disc: 'I' },
        { text: 'Sudden change or instability', disc: 'S' },
        { text: 'Being criticized or being wrong', disc: 'C' },
      ],
    },
    {
      id: 'q6',
      text: 'When communicating, I...',
      options: [
        { text: 'Am direct and concise, getting straight to the point', disc: 'D' },
        { text: 'Talk with passion and rich expression', disc: 'I' },
        { text: 'Speak gently, thoughtfully, and calmly', disc: 'S' },
        { text: 'Am precise and fact-focused, speaking carefully', disc: 'C' },
      ],
    },
    {
      id: 'q7',
      text: 'When I\'m under stress, I...',
      options: [
        { text: 'Become more controlling or aggressive', disc: 'D' },
        { text: 'Become emotional or scattered', disc: 'I' },
        { text: 'Internalize it and endure silently', disc: 'S' },
        { text: 'Become more perfectionist or over-analyze', disc: 'C' },
      ],
    },
    {
      id: 'q8',
      text: 'When meeting new people, I...',
      options: [
        { text: 'Meet with purpose, assessing their capabilities', disc: 'D' },
        { text: 'Approach warmly and quickly become friends', disc: 'I' },
        { text: 'Approach cautiously and slowly build trust', disc: 'S' },
        { text: 'Observe and analyze before getting close', disc: 'C' },
      ],
    },
    {
      id: 'q9',
      text: 'My ideal environment is...',
      options: [
        { text: 'Challenging goals with autonomy', disc: 'D' },
        { text: 'Active interaction with people', disc: 'I' },
        { text: 'Stable and predictable conditions', disc: 'S' },
        { text: 'Systematic and accuracy-valuing', disc: 'C' },
      ],
    },
    {
      id: 'q10',
      text: 'When making decisions, I...',
      options: [
        { text: 'Decide quickly and decisively', disc: 'D' },
        { text: 'Go by intuition and observe people\'s reactions', disc: 'I' },
        { text: 'Think carefully and listen to others\' opinions', disc: 'S' },
        { text: 'Decide after gathering sufficient information and analysis', disc: 'C' },
      ],
    },
    {
      id: 'q11',
      text: 'When things don\'t go well, I...',
      options: [
        { text: 'Push harder or find a different approach', disc: 'D' },
        { text: 'Talk to someone to release the tension', disc: 'I' },
        { text: 'Patiently keep trying', disc: 'S' },
        { text: 'Analyze the problem and identify the root cause', disc: 'C' },
      ],
    },
    {
      id: 'q12',
      text: 'As a leader, I...',
      options: [
        { text: 'Set clear goals and lead the team firmly', disc: 'D' },
        { text: 'Inspire and ignite passion in team members', disc: 'I' },
        { text: 'Support team members to work comfortably', disc: 'S' },
        { text: 'Establish high standards and maintain quality', disc: 'C' },
      ],
    },
  ],
  ja: [
    {
      id: 'q1',
      text: '何か新しいことを始める時、私は...',
      options: [
        { text: 'すぐに決断して行動する', disc: 'D' },
        { text: 'みんなにアイデアを共有して盛り上がる', disc: 'I' },
        { text: '準備を整えてから慎重に始める', disc: 'S' },
        { text: '詳細な計画と資料を十分に確認する', disc: 'C' },
      ],
    },
    {
      id: 'q2',
      text: 'チームプロジェクトでは...',
      options: [
        { text: '目標を設定してリードする', disc: 'D' },
        { text: 'チームの雰囲気を高めてみんなを応援する', disc: 'I' },
        { text: 'チームメンバーをサポートして安定した役割を担う', disc: 'S' },
        { text: 'データや詳細を分析する', disc: 'C' },
      ],
    },
    {
      id: 'q3',
      text: '葛藤が起きた時、私は...',
      options: [
        { text: '直接対峙して素早く解決しようとする', disc: 'D' },
        { text: '雰囲気を和ませてみんなを笑わせる', disc: 'I' },
        { text: '忍耐強く調和のとれた解決策を探す', disc: 'S' },
        { text: '事実と論理に基づいて分析・解決する', disc: 'C' },
      ],
    },
    {
      id: 'q4',
      text: '私にとって最も大切なのは...',
      options: [
        { text: '結果と成果', disc: 'D' },
        { text: '認められることと楽しむこと', disc: 'I' },
        { text: '安定と信頼', disc: 'S' },
        { text: '正確さと品質', disc: 'C' },
      ],
    },
    {
      id: 'q5',
      text: '最も恐れていることは...',
      options: [
        { text: '失敗またはコントロールを失うこと', disc: 'D' },
        { text: '拒絶または無視されること', disc: 'I' },
        { text: '急な変化や不安定さ', disc: 'S' },
        { text: '批判されることや間違えること', disc: 'C' },
      ],
    },
    {
      id: 'q6',
      text: 'コミュニケーションする時、私は...',
      options: [
        { text: '直接的で簡潔に要点だけ話す', disc: 'D' },
        { text: '情熱的で表現豊かに話す', disc: 'I' },
        { text: '穏やかで思いやりを持って話す', disc: 'S' },
        { text: '正確で事実中心に慎重に話す', disc: 'C' },
      ],
    },
    {
      id: 'q7',
      text: 'ストレスを受けた時、私は...',
      options: [
        { text: 'より支配的になったり攻撃的になる', disc: 'D' },
        { text: '感情的になったり散漫になる', disc: 'I' },
        { text: '内に秘めて我慢する', disc: 'S' },
        { text: 'より完璧主義的になったり過度に分析する', disc: 'C' },
      ],
    },
    {
      id: 'q8',
      text: '新しい人と出会う時、私は...',
      options: [
        { text: '目的を持って相手の能力を見極めようとする', disc: 'D' },
        { text: '親しみやすく接してすぐに仲良くなる', disc: 'I' },
        { text: '慎重に近づいてゆっくり信頼を築く', disc: 'S' },
        { text: '観察・分析してから近づく', disc: 'C' },
      ],
    },
    {
      id: 'q9',
      text: '理想的な環境は...',
      options: [
        { text: '挑戦的な目標と自律性がある環境', disc: 'D' },
        { text: '人々と活発に交流できる環境', disc: 'I' },
        { text: '安定していて予測可能な環境', disc: 'S' },
        { text: '体系的で正確さを重視する環境', disc: 'C' },
      ],
    },
    {
      id: 'q10',
      text: '意思決定をする時、私は...',
      options: [
        { text: '素早く断固として決める', disc: 'D' },
        { text: '直感と人々の反応を見て決める', disc: 'I' },
        { text: '慎重に考えて他の人の意見を聞く', disc: 'S' },
        { text: '十分な情報と分析の後に決める', disc: 'C' },
      ],
    },
    {
      id: 'q11',
      text: 'うまくいかない時、私は...',
      options: [
        { text: 'もっと強く押すか別の方法を探す', disc: 'D' },
        { text: '誰かに話して解消する', disc: 'I' },
        { text: '忍耐強く努力し続ける', disc: 'S' },
        { text: '問題を分析して原因を特定する', disc: 'C' },
      ],
    },
    {
      id: 'q12',
      text: 'リーダーなら、私は...',
      options: [
        { text: '明確な目標を設定してチームを強く導く', disc: 'D' },
        { text: 'チームメンバーにインスピレーションを与える', disc: 'I' },
        { text: 'チームメンバーが快適に働けるようサポートする', disc: 'S' },
        { text: '高い基準を設けて品質を維持する', disc: 'C' },
      ],
    },
  ],
  zh: [
    {
      id: 'q1',
      text: '开始一件新事情时，我会……',
      options: [
        { text: '迅速决定，马上行动', disc: 'D' },
        { text: '兴奋地和大家分享想法', disc: 'I' },
        { text: '把一切都谨慎准备好再开始', disc: 'S' },
        { text: '充分检视详细计划和资料', disc: 'C' },
      ],
    },
    {
      id: 'q2',
      text: '在团队项目中，我通常……',
      options: [
        { text: '设定目标，带领团队', disc: 'D' },
        { text: '炒热团队气氛，鼓励每个人', disc: 'I' },
        { text: '支持队友，担任稳定的角色', disc: 'S' },
        { text: '负责分析数据和细节', disc: 'C' },
      ],
    },
    {
      id: 'q3',
      text: '发生冲突时，我会……',
      options: [
        { text: '直接面对，想快速解决', disc: 'D' },
        { text: '缓和气氛，让大家都笑出来', disc: 'I' },
        { text: '耐心寻找和谐的解决办法', disc: 'S' },
        { text: '以事实和逻辑分析并解决', disc: 'C' },
      ],
    },
    {
      id: 'q4',
      text: '对我来说最重要的是……',
      options: [
        { text: '结果与成绩', disc: 'D' },
        { text: '认可与乐趣', disc: 'I' },
        { text: '稳定与信任', disc: 'S' },
        { text: '准确与品质', disc: 'C' },
      ],
    },
    {
      id: 'q5',
      text: '我最大的恐惧是……',
      options: [
        { text: '失败或失去掌控', disc: 'D' },
        { text: '被拒绝或被忽视', disc: 'I' },
        { text: '突如其来的变化或不稳定', disc: 'S' },
        { text: '被批评或出错', disc: 'C' },
      ],
    },
    {
      id: 'q6',
      text: '沟通时，我会……',
      options: [
        { text: '直接简洁，只讲重点', disc: 'D' },
        { text: '充满热情、表达丰富地说', disc: 'I' },
        { text: '温和体贴、平静地说', disc: 'S' },
        { text: '准确、以事实为中心、谨慎地说', disc: 'C' },
      ],
    },
    {
      id: 'q7',
      text: '有压力时，我会……',
      options: [
        { text: '变得更想掌控或更激烈', disc: 'D' },
        { text: '变得情绪化或分心', disc: 'I' },
        { text: '藏在心里忍着', disc: 'S' },
        { text: '变得更完美主义或过度分析', disc: 'C' },
      ],
    },
    {
      id: 'q8',
      text: '认识新朋友时，我会……',
      options: [
        { text: '带着目的去见，想了解对方的能力', disc: 'D' },
        { text: '亲切地靠近，很快就熟了', disc: 'I' },
        { text: '谨慎地接近，慢慢建立信任', disc: 'S' },
        { text: '先观察、分析对方再靠近', disc: 'C' },
      ],
    },
    {
      id: 'q9',
      text: '我理想的环境是……',
      options: [
        { text: '有挑战性目标和自主权的环境', disc: 'D' },
        { text: '和人热络交流的环境', disc: 'I' },
        { text: '稳定、可预测的环境', disc: 'S' },
        { text: '有条理、重视准确的环境', disc: 'C' },
      ],
    },
    {
      id: 'q10',
      text: '做决定时，我会……',
      options: [
        { text: '快速果断地决定', disc: 'D' },
        { text: '凭直觉和别人的反应来决定', disc: 'I' },
        { text: '慎重思考，听取别人的意见', disc: 'S' },
        { text: '在充分的信息和分析后决定', disc: 'C' },
      ],
    },
    {
      id: 'q11',
      text: '事情不顺时，我会……',
      options: [
        { text: '更用力推进，或找别的方法', disc: 'D' },
        { text: '找人聊聊来纾解', disc: 'I' },
        { text: '耐心地继续努力', disc: 'S' },
        { text: '分析问题，找出原因', disc: 'C' },
      ],
    },
    {
      id: 'q12',
      text: '如果我是领导，我会……',
      options: [
        { text: '设定明确目标，强力带领团队', disc: 'D' },
        { text: '给队员灵感，注入热情', disc: 'I' },
        { text: '支持队员，让他们工作得安心', disc: 'S' },
        { text: '设定高标准，维持品质', disc: 'C' },
      ],
    },
  ],
  fr: [
    {
      id: 'q1',
      text: 'Quand je commence quelque chose de nouveau…',
      options: [
        { text: 'Je décide vite et passe tout de suite à l’action', disc: 'D' },
        { text: 'Je partage mes idées avec enthousiasme', disc: 'I' },
        { text: 'Je prépare tout soigneusement avant de commencer', disc: 'S' },
        { text: 'J’examine en détail le plan et la documentation', disc: 'C' },
      ],
    },
    {
      id: 'q2',
      text: 'Dans un projet d’équipe, je suis plutôt…',
      options: [
        { text: 'Celui qui fixe les objectifs et mène l’équipe', disc: 'D' },
        { text: 'Celui qui met l’ambiance et encourage tout le monde', disc: 'I' },
        { text: 'Celui qui soutient les autres et assure la stabilité', disc: 'S' },
        { text: 'Celui qui analyse les données et les détails', disc: 'C' },
      ],
    },
    {
      id: 'q3',
      text: 'Face à un conflit…',
      options: [
        { text: 'Je l’affronte directement pour le régler vite', disc: 'D' },
        { text: 'J’allège l’atmosphère et fais rire tout le monde', disc: 'I' },
        { text: 'Je cherche patiemment une solution harmonieuse', disc: 'S' },
        { text: 'J’analyse et je résous à partir des faits et de la logique', disc: 'C' },
      ],
    },
    {
      id: 'q4',
      text: 'Ce qui compte le plus pour moi…',
      options: [
        { text: 'Les résultats et les performances', disc: 'D' },
        { text: 'La reconnaissance et le plaisir', disc: 'I' },
        { text: 'La stabilité et la confiance', disc: 'S' },
        { text: 'La précision et la qualité', disc: 'C' },
      ],
    },
    {
      id: 'q5',
      text: 'Ma plus grande peur…',
      options: [
        { text: 'Échouer ou perdre le contrôle', disc: 'D' },
        { text: 'Être rejeté ou ignoré', disc: 'I' },
        { text: 'Un changement brutal ou l’instabilité', disc: 'S' },
        { text: 'Être critiqué ou me tromper', disc: 'C' },
      ],
    },
    {
      id: 'q6',
      text: 'Quand je communique…',
      options: [
        { text: 'Je vais droit au but, de façon concise', disc: 'D' },
        { text: 'Je parle avec passion et beaucoup d’expressivité', disc: 'I' },
        { text: 'Je parle avec douceur, attention et calme', disc: 'S' },
        { text: 'Je parle avec précision et prudence, en m’appuyant sur les faits', disc: 'C' },
      ],
    },
    {
      id: 'q7',
      text: 'Sous le stress…',
      options: [
        { text: 'Je deviens plus contrôlant ou plus brusque', disc: 'D' },
        { text: 'Je deviens émotif ou dispersé', disc: 'I' },
        { text: 'Je garde tout pour moi et je prends sur moi', disc: 'S' },
        { text: 'Je deviens plus perfectionniste ou j’analyse à l’excès', disc: 'C' },
      ],
    },
    {
      id: 'q8',
      text: 'Quand je rencontre quelqu’un…',
      options: [
        { text: 'J’y vais avec un objectif et cherche à cerner ses compétences', disc: 'D' },
        { text: 'Je vais vers l’autre chaleureusement et sympathise vite', disc: 'I' },
        { text: 'J’approche prudemment et bâtis la confiance lentement', disc: 'S' },
        { text: 'J’observe et j’analyse avant d’aller vers l’autre', disc: 'C' },
      ],
    },
    {
      id: 'q9',
      text: 'Mon environnement idéal…',
      options: [
        { text: 'Des objectifs ambitieux et de l’autonomie', disc: 'D' },
        { text: 'Beaucoup d’échanges avec les autres', disc: 'I' },
        { text: 'Stable et prévisible', disc: 'S' },
        { text: 'Structuré et attaché à la précision', disc: 'C' },
      ],
    },
    {
      id: 'q10',
      text: 'Pour prendre une décision…',
      options: [
        { text: 'Je décide vite et fermement', disc: 'D' },
        { text: 'Je me fie à mon intuition et aux réactions des autres', disc: 'I' },
        { text: 'Je réfléchis soigneusement et écoute l’avis des autres', disc: 'S' },
        { text: 'Je décide après avoir réuni assez d’informations et d’analyses', disc: 'C' },
      ],
    },
    {
      id: 'q11',
      text: 'Quand les choses se passent mal…',
      options: [
        { text: 'Je pousse plus fort ou cherche une autre voie', disc: 'D' },
        { text: 'J’en parle à quelqu’un pour évacuer', disc: 'I' },
        { text: 'Je persévère avec patience', disc: 'S' },
        { text: 'J’analyse le problème et en cherche la cause', disc: 'C' },
      ],
    },
    {
      id: 'q12',
      text: 'Si j’étais leader…',
      options: [
        { text: 'Je fixerais des objectifs clairs et mènerais l’équipe avec fermeté', disc: 'D' },
        { text: 'J’inspirerais les autres et leur transmettrais mon enthousiasme', disc: 'I' },
        { text: 'Je soutiendrais l’équipe pour qu’elle travaille sereinement', disc: 'S' },
        { text: 'Je fixerais des standards élevés et maintiendrais la qualité', disc: 'C' },
      ],
    },
  ],
  es: [
    {
      id: 'q1',
      text: 'Cuando empiezo algo nuevo…',
      options: [
        { text: 'Decido rápido y paso enseguida a la acción', disc: 'D' },
        { text: 'Comparto mis ideas con entusiasmo', disc: 'I' },
        { text: 'Lo preparo todo con cuidado antes de empezar', disc: 'S' },
        { text: 'Reviso a fondo el plan y los materiales', disc: 'C' },
      ],
    },
    {
      id: 'q2',
      text: 'En un proyecto de equipo, suelo…',
      options: [
        { text: 'Fijar objetivos y liderar al equipo', disc: 'D' },
        { text: 'Animar el ambiente y motivar a todos', disc: 'I' },
        { text: 'Apoyar a los demás y dar estabilidad', disc: 'S' },
        { text: 'Analizar los datos y los detalles', disc: 'C' },
      ],
    },
    {
      id: 'q3',
      text: 'Cuando surge un conflicto…',
      options: [
        { text: 'Lo afronto de frente para resolverlo rápido', disc: 'D' },
        { text: 'Suavizo el ambiente y hago reír a todos', disc: 'I' },
        { text: 'Busco con paciencia una solución armoniosa', disc: 'S' },
        { text: 'Lo analizo y resuelvo con hechos y lógica', disc: 'C' },
      ],
    },
    {
      id: 'q4',
      text: 'Lo más importante para mí es…',
      options: [
        { text: 'Los resultados y el rendimiento', disc: 'D' },
        { text: 'El reconocimiento y la diversión', disc: 'I' },
        { text: 'La estabilidad y la confianza', disc: 'S' },
        { text: 'La precisión y la calidad', disc: 'C' },
      ],
    },
    {
      id: 'q5',
      text: 'Mi mayor miedo es…',
      options: [
        { text: 'Fracasar o perder el control', disc: 'D' },
        { text: 'Que me rechacen o me ignoren', disc: 'I' },
        { text: 'Un cambio repentino o la inestabilidad', disc: 'S' },
        { text: 'Que me critiquen o equivocarme', disc: 'C' },
      ],
    },
    {
      id: 'q6',
      text: 'Cuando me comunico…',
      options: [
        { text: 'Voy al grano, de forma directa y breve', disc: 'D' },
        { text: 'Hablo con pasión y mucha expresividad', disc: 'I' },
        { text: 'Hablo con suavidad, consideración y calma', disc: 'S' },
        { text: 'Hablo con precisión y cautela, basándome en hechos', disc: 'C' },
      ],
    },
    {
      id: 'q7',
      text: 'Cuando estoy estresado…',
      options: [
        { text: 'Me vuelvo más controlador o brusco', disc: 'D' },
        { text: 'Me pongo emocional o me disperso', disc: 'I' },
        { text: 'Me lo guardo y aguanto', disc: 'S' },
        { text: 'Me vuelvo más perfeccionista o analizo en exceso', disc: 'C' },
      ],
    },
    {
      id: 'q8',
      text: 'Cuando conozco a alguien…',
      options: [
        { text: 'Voy con un objetivo e intento calibrar su capacidad', disc: 'D' },
        { text: 'Me acerco con simpatía y enseguida conecto', disc: 'I' },
        { text: 'Me acerco con cautela y construyo la confianza poco a poco', disc: 'S' },
        { text: 'Observo y analizo antes de acercarme', disc: 'C' },
      ],
    },
    {
      id: 'q9',
      text: 'Mi entorno ideal es…',
      options: [
        { text: 'Con objetivos retadores y autonomía', disc: 'D' },
        { text: 'Con mucho trato con la gente', disc: 'I' },
        { text: 'Estable y previsible', disc: 'S' },
        { text: 'Organizado y que valore la precisión', disc: 'C' },
      ],
    },
    {
      id: 'q10',
      text: 'Al tomar una decisión…',
      options: [
        { text: 'Decido rápido y con firmeza', disc: 'D' },
        { text: 'Me guío por la intuición y la reacción de los demás', disc: 'I' },
        { text: 'Lo pienso con calma y escucho otras opiniones', disc: 'S' },
        { text: 'Decido tras reunir suficiente información y análisis', disc: 'C' },
      ],
    },
    {
      id: 'q11',
      text: 'Cuando las cosas no salen bien…',
      options: [
        { text: 'Presiono más o busco otro camino', disc: 'D' },
        { text: 'Lo hablo con alguien para desahogarme', disc: 'I' },
        { text: 'Sigo esforzándome con paciencia', disc: 'S' },
        { text: 'Analizo el problema y busco la causa', disc: 'C' },
      ],
    },
    {
      id: 'q12',
      text: 'Si yo fuera líder…',
      options: [
        { text: 'Fijaría objetivos claros y guiaría al equipo con firmeza', disc: 'D' },
        { text: 'Inspiraría al equipo y le contagiaría entusiasmo', disc: 'I' },
        { text: 'Apoyaría al equipo para que trabaje a gusto', disc: 'S' },
        { text: 'Fijaría estándares altos y cuidaría la calidad', disc: 'C' },
      ],
    },
  ],
}

const RESULTS: Record<DiscType, Record<Locale, ResultData>> = {
  D: {
    ko: {
      title: 'D형 — 주도형',
      subtitle: '결과를 향해 단호하게 나아가는 리더',
      description: '주도형은 도전을 즐기고 결과 지향적입니다. 직접적이고 단호하며, 통제권을 갖는 것을 선호합니다. 장애물을 극복하는 것에서 동기를 얻으며, 빠른 결정과 실행을 중시합니다.',
      keywords: ['결단력', '직접성', '독립성', '경쟁심', '목표 지향'],
      strengths: ['빠른 의사결정', '강한 리더십', '결과 추구', '압박 속에서도 침착'],
      weaknesses: ['타인 감정 무시 가능', '지나친 통제', '인내심 부족', '세부 사항 간과'],
      workStyle: '빠르게 결정하고 직접 실행합니다. 목표를 명확히 설정하고 팀을 강하게 이끌며, 관료적 절차보다 결과를 중시합니다.',
      communication: '직접적이고 간결합니다. 요점만 말하고 불필요한 형식을 싫어합니다. 이메일보다 직접 대화를 선호합니다.',
      tip: '타인의 감정과 의견에 더 귀 기울이는 연습을 해보세요. 팀원의 기여를 인정하면 더 강력한 리더가 됩니다.',
    },
    en: {
      title: 'D — Dominant',
      subtitle: 'A decisive leader driving toward results',
      description: 'Dominant types enjoy challenges and are results-oriented. They are direct and decisive, preferring to be in control. They\'re motivated by overcoming obstacles and prioritize quick decisions and action.',
      keywords: ['Decisiveness', 'Directness', 'Independence', 'Competitiveness', 'Goal-orientation'],
      strengths: ['Quick decision-making', 'Strong leadership', 'Result-driven', 'Calm under pressure'],
      weaknesses: ['May ignore others\' emotions', 'Excessive control', 'Impatience', 'Overlooking details'],
      workStyle: 'Makes fast decisions and executes directly. Sets clear goals, leads strongly, and values results over bureaucratic process.',
      communication: 'Direct and concise. Gets to the point and dislikes unnecessary formality. Prefers face-to-face over email.',
      tip: 'Practice listening more to others\' emotions and opinions. Acknowledging team contributions will make you an even stronger leader.',
    },
    ja: {
      title: 'D型 — 主導型',
      subtitle: '結果に向かって断固と進むリーダー',
      description: '主導型は挑戦を楽しみ、結果志向です。直接的で断固とし、コントロール権を持つことを好みます。障害を乗り越えることから動機を得て、素早い決断と実行を重視します。',
      keywords: ['決断力', '直接性', '独立性', '競争心', '目標志向'],
      strengths: ['素早い意思決定', '強いリーダーシップ', '結果追求', 'プレッシャーの中でも冷静'],
      weaknesses: ['他者の感情を無視する可能性', '過度な管理', '忍耐力不足', '細部を見落とす'],
      workStyle: '素早く決断して直接実行します。明確な目標を設定してチームを強く率い、官僚的手続きより結果を重視します。',
      communication: '直接的で簡潔です。要点だけ話し、不必要な形式を嫌います。メールより直接対話を好みます。',
      tip: '他者の感情と意見にもっと耳を傾ける練習をしましょう。チームメンバーの貢献を認めると、より強力なリーダーになれます。',
    },
    zh: {
      title: 'D 型 — 支配型',
      subtitle: '果断迈向结果的领导者',
      description: '支配型喜欢挑战、重视结果。直接而果断，偏好掌握主导权。从克服障碍中获得动力，重视快速决策与执行。',
      keywords: ['果断', '直接', '独立', '好胜', '目标导向'],
      strengths: ['决策迅速', '领导力强', '追求结果', '压力下依然沉着'],
      weaknesses: ['可能忽视他人的感受', '过度掌控', '缺乏耐心', '忽略细节'],
      workStyle: '快速决定、亲自执行。明确设定目标、强力带领团队，比起官僚程序更重视结果。',
      communication: '直接简洁，只讲重点，不喜欢多余的形式。比起邮件，更喜欢当面交谈。',
      tip: '练习多倾听别人的感受和意见。肯定队员的贡献，会让你成为更强大的领导者。',
    },
    fr: {
      title: 'Type D — Dominant',
      subtitle: 'Un leader qui avance résolument vers les résultats',
      description: 'Le profil dominant aime les défis et vise les résultats. Direct et résolu, il préfère avoir le contrôle. Il tire sa motivation du dépassement des obstacles et valorise la rapidité de décision et d’exécution.',
      keywords: ['Détermination', 'Franchise', 'Indépendance', 'Esprit de compétition', 'Orientation objectifs'],
      strengths: ['Décisions rapides', 'Fort leadership', 'Recherche de résultats', 'Calme sous pression'],
      weaknesses: ['Peut négliger les émotions des autres', 'Contrôle excessif', 'Manque de patience', 'Néglige les détails'],
      workStyle: 'Décide vite et exécute lui-même. Fixe des objectifs clairs, mène l’équipe avec fermeté et privilégie les résultats aux procédures.',
      communication: 'Direct et concis. Va à l’essentiel et déteste le formalisme inutile. Préfère la conversation directe aux e-mails.',
      tip: 'Entraînez-vous à mieux écouter les émotions et les avis des autres. Reconnaître la contribution de l’équipe fera de vous un leader encore plus fort.',
    },
    es: {
      title: 'Tipo D — Dominante',
      subtitle: 'Un líder que avanza con decisión hacia los resultados',
      description: 'El perfil dominante disfruta los retos y se orienta a resultados. Es directo y decidido, y prefiere tener el control. Se motiva superando obstáculos y valora decidir y ejecutar rápido.',
      keywords: ['Determinación', 'Franqueza', 'Independencia', 'Competitividad', 'Orientación a objetivos'],
      strengths: ['Decisiones rápidas', 'Liderazgo fuerte', 'Búsqueda de resultados', 'Calma bajo presión'],
      weaknesses: ['Puede pasar por alto los sentimientos ajenos', 'Control excesivo', 'Falta de paciencia', 'Descuida los detalles'],
      workStyle: 'Decide rápido y ejecuta en persona. Fija objetivos claros, guía al equipo con firmeza y valora más los resultados que los trámites.',
      communication: 'Directo y conciso. Va al grano y detesta las formalidades innecesarias. Prefiere hablar en persona antes que por correo.',
      tip: 'Practica escuchar más los sentimientos y opiniones de los demás. Reconocer las aportaciones del equipo te hará un líder aún más fuerte.',
    },
  },
  I: {
    ko: {
      title: 'I형 — 사교형',
      subtitle: '열정과 긍정으로 사람을 이끄는 에너자이저',
      description: '사교형은 낙관적이고 외향적이며, 사람들과 함께할 때 에너지를 얻습니다. 설득력이 강하고 영감을 주는 능력이 탁월합니다. 팀의 분위기를 밝게 만들고 관계를 통해 동기를 부여합니다.',
      keywords: ['열정', '긍정성', '사교성', '창의성', '영향력'],
      strengths: ['뛰어난 설득력', '팀 동기 부여', '창의적 아이디어', '긍정 에너지'],
      weaknesses: ['세부 사항과 후속 조치 약함', '감정적 결정', '집중력 유지 어려움', '과도한 낙관주의'],
      workStyle: '사람들과 협력하며 아이디어를 나눕니다. 창의적 환경에서 최고의 성과를 내며, 단조로운 작업보다 다양한 프로젝트를 선호합니다.',
      communication: '열정적이고 표현이 풍부합니다. 이야기와 감정을 통해 소통하며, 칭찬과 인정에 잘 반응합니다.',
      tip: '세부 사항과 마감 기한 관리를 강화하세요. 뛰어난 아이디어를 실행으로 연결하면 더 큰 영향력을 발휘할 수 있습니다.',
    },
    en: {
      title: 'I — Influential',
      subtitle: 'An energizer who leads people with passion and positivity',
      description: 'Influential types are optimistic and outgoing, energized by being with people. They\'re highly persuasive with exceptional ability to inspire. They brighten team atmosphere and motivate through relationships.',
      keywords: ['Enthusiasm', 'Positivity', 'Sociability', 'Creativity', 'Influence'],
      strengths: ['Outstanding persuasiveness', 'Team motivation', 'Creative ideas', 'Positive energy'],
      weaknesses: ['Weak on details and follow-through', 'Emotional decision-making', 'Difficulty maintaining focus', 'Excessive optimism'],
      workStyle: 'Collaborates with people and shares ideas. Achieves best results in creative environments and prefers varied projects over monotonous tasks.',
      communication: 'Enthusiastic and expressive. Communicates through stories and emotions, responds well to praise and recognition.',
      tip: 'Strengthen your management of details and deadlines. Connecting your brilliant ideas to execution will amplify your impact.',
    },
    ja: {
      title: 'I型 — 社交型',
      subtitle: '情熱と前向きさで人を導くエナジャイザー',
      description: '社交型は楽観的で外向的、人々と一緒にいる時にエネルギーを得ます。説得力が強く、インスピレーションを与える能力に優れています。チームの雰囲気を明るくし、関係を通じて動機を与えます。',
      keywords: ['情熱', '前向きさ', '社交性', '創造性', '影響力'],
      strengths: ['卓越した説得力', 'チームの動機付け', '創造的アイデア', 'ポジティブエネルギー'],
      weaknesses: ['細部とフォローアップが弱い', '感情的な意思決定', '集中力の維持が難しい', '過度な楽観主義'],
      workStyle: '人々と協力してアイデアを共有します。創造的な環境で最高の成果を出し、単調な作業より多様なプロジェクトを好みます。',
      communication: '情熱的で表現豊かです。物語と感情を通じてコミュニケーションし、褒め言葉と認定によく反応します。',
      tip: '細部と締め切り管理を強化しましょう。優れたアイデアを実行に結びつけると、より大きな影響力を発揮できます。',
    },
    zh: {
      title: 'I 型 — 影响型',
      subtitle: '以热情与正能量带动人的活力源',
      description: '影响型乐观外向，和人在一起时获得能量。说服力强，激励人心的能力出众。能让团队气氛明亮，通过关系激发动力。',
      keywords: ['热情', '积极', '善交际', '创意', '影响力'],
      strengths: ['出色的说服力', '激励团队', '创意点子', '正能量'],
      weaknesses: ['细节与后续跟进较弱', '情绪化决定', '难以保持专注', '过度乐观'],
      workStyle: '和人合作、分享点子。在有创意的环境里表现最好，比起单调的工作，更喜欢多样的项目。',
      communication: '热情而富有表现力。通过故事和情感沟通，对称赞与认可反应热烈。',
      tip: '加强细节与截止日期的管理。把出色的点子落实为执行，就能发挥更大的影响力。',
    },
    fr: {
      title: 'Type I — Influent',
      subtitle: 'Un énergiseur qui entraîne les autres par son enthousiasme',
      description: 'Le profil influent est optimiste et extraverti ; il se ressource au contact des autres. Très persuasif, il excelle à inspirer. Il égaye l’ambiance de l’équipe et motive par la relation.',
      keywords: ['Enthousiasme', 'Positivité', 'Sociabilité', 'Créativité', 'Influence'],
      strengths: ['Grand pouvoir de persuasion', 'Motive l’équipe', 'Idées créatives', 'Énergie positive'],
      weaknesses: ['Faible sur les détails et le suivi', 'Décisions émotionnelles', 'Du mal à rester concentré', 'Optimisme excessif'],
      workStyle: 'Collabore et partage ses idées. Donne le meilleur dans un environnement créatif et préfère des projets variés aux tâches monotones.',
      communication: 'Passionné et expressif. Communique par les récits et les émotions, et réagit bien aux compliments et à la reconnaissance.',
      tip: 'Renforcez la gestion des détails et des délais. En transformant vos excellentes idées en actions, vous gagnerez encore en influence.',
    },
    es: {
      title: 'Tipo I — Influyente',
      subtitle: 'Un dinamizador que arrastra a la gente con entusiasmo',
      description: 'El perfil influyente es optimista y extrovertido; se carga de energía con los demás. Muy persuasivo, destaca inspirando. Alegra el ambiente del equipo y motiva a través de las relaciones.',
      keywords: ['Entusiasmo', 'Positividad', 'Sociabilidad', 'Creatividad', 'Influencia'],
      strengths: ['Gran capacidad de persuasión', 'Motiva al equipo', 'Ideas creativas', 'Energía positiva'],
      weaknesses: ['Flojo en detalles y seguimiento', 'Decisiones emocionales', 'Le cuesta mantener la concentración', 'Optimismo excesivo'],
      workStyle: 'Colabora y comparte ideas. Rinde al máximo en entornos creativos y prefiere proyectos variados a tareas monótonas.',
      communication: 'Apasionado y expresivo. Se comunica con historias y emociones, y responde bien a los elogios y al reconocimiento.',
      tip: 'Refuerza la gestión de detalles y plazos. Si conviertes tus grandes ideas en acción, tendrás aún más influencia.',
    },
  },
  S: {
    ko: {
      title: 'S형 — 안정형',
      subtitle: '신뢰와 안정으로 팀을 지탱하는 조력자',
      description: '안정형은 인내심이 강하고 신뢰할 수 있는 팀 플레이어입니다. 조화와 안정을 중시하며, 팀의 균형을 유지하는 데 탁월합니다. 일관성과 협력을 통해 꾸준한 성과를 만들어냅니다.',
      keywords: ['신뢰성', '인내', '팀워크', '안정성', '협력'],
      strengths: ['뛰어난 신뢰성', '강한 팀 지원', '일관된 성과', '뛰어난 경청 능력'],
      weaknesses: ['변화에 느린 적응', '자기 주장 부족', '지나친 위험 회피', '갈등 회피'],
      workStyle: '체계적이고 꾸준하게 일합니다. 안정적인 환경에서 최고의 성과를 내며, 갑작스러운 변화보다 예측 가능한 루틴을 선호합니다.',
      communication: '부드럽고 배려하며 적극적으로 경청합니다. 조화를 중시하며, 갈등을 피하려 합니다.',
      tip: '자신의 의견을 더 적극적으로 표현하고, 변화에 유연하게 대응하는 연습이 필요합니다. 당신의 안정성은 팀의 큰 자산입니다.',
    },
    en: {
      title: 'S — Steady',
      subtitle: 'A reliable supporter who anchors the team with trust and stability',
      description: 'Steady types are patient and reliable team players. They value harmony and stability, excelling at maintaining team balance. They create consistent results through cooperation and reliability.',
      keywords: ['Reliability', 'Patience', 'Teamwork', 'Stability', 'Cooperation'],
      strengths: ['Outstanding reliability', 'Strong team support', 'Consistent performance', 'Excellent listening skills'],
      weaknesses: ['Slow to adapt to change', 'Lack of assertiveness', 'Excessive risk-aversion', 'Conflict avoidance'],
      workStyle: 'Works systematically and steadily. Achieves best results in stable environments and prefers predictable routines over sudden change.',
      communication: 'Gentle and thoughtful, actively listens. Values harmony and tends to avoid conflict.',
      tip: 'Practice expressing your opinions more assertively and being flexible with change. Your stability is a great asset to any team.',
    },
    ja: {
      title: 'S型 — 安定型',
      subtitle: '信頼と安定でチームを支える協力者',
      description: '安定型は忍耐強く信頼できるチームプレイヤーです。調和と安定を重視し、チームのバランスを保つことに優れています。一貫性と協力を通じて安定した成果を生み出します。',
      keywords: ['信頼性', '忍耐', 'チームワーク', '安定性', '協力'],
      strengths: ['卓越した信頼性', '強いチームサポート', '一貫した成果', '優れた傾聴能力'],
      weaknesses: ['変化への適応が遅い', '自己主張の欠如', '過度なリスク回避', '葛藤回避'],
      workStyle: '体系的で着実に働きます。安定した環境で最高の成果を出し、急な変化より予測可能なルーティンを好みます。',
      communication: '穏やかで思いやりがあり、積極的に傾聴します。調和を重視し、葛藤を避けようとします。',
      tip: '自分の意見をより積極的に表現して、変化に柔軟に対応する練習が必要です。あなたの安定性はチームの大きな資産です。',
    },
    zh: {
      title: 'S 型 — 稳健型',
      subtitle: '以信任与稳定支撑团队的协助者',
      description: '稳健型耐心强、值得信赖，是优秀的团队成员。重视和谐与稳定，擅长维持团队平衡。以一致性与合作创造稳定的成果。',
      keywords: ['可靠', '耐心', '团队合作', '稳定', '合作'],
      strengths: ['非常可靠', '有力地支持团队', '成果稳定一致', '出色的倾听能力'],
      weaknesses: ['适应变化较慢', '自我主张不足', '过度规避风险', '回避冲突'],
      workStyle: '有系统、稳扎稳打地工作。在稳定环境中表现最好，比起突如其来的变化，更喜欢可预测的日常。',
      communication: '温和体贴，积极倾听。重视和谐，尽量避免冲突。',
      tip: '需要练习更积极地表达自己的意见，灵活应对变化。你的稳定是团队的一大资产。',
    },
    fr: {
      title: 'Type S — Stable',
      subtitle: 'Un soutien qui porte l’équipe par sa fiabilité et sa stabilité',
      description: 'Le profil stable est patient et fiable, un vrai joueur d’équipe. Attaché à l’harmonie et à la stabilité, il excelle à maintenir l’équilibre du groupe et produit des résultats réguliers par la constance et la coopération.',
      keywords: ['Fiabilité', 'Patience', 'Esprit d’équipe', 'Stabilité', 'Coopération'],
      strengths: ['Grande fiabilité', 'Soutien solide de l’équipe', 'Résultats réguliers', 'Excellente écoute'],
      weaknesses: ['S’adapte lentement au changement', 'Manque d’affirmation de soi', 'Aversion excessive au risque', 'Évite les conflits'],
      workStyle: 'Travaille avec méthode et constance. Donne le meilleur dans un cadre stable et préfère les routines prévisibles aux changements brusques.',
      communication: 'Doux, attentionné, à l’écoute active. Attaché à l’harmonie, il cherche à éviter les conflits.',
      tip: 'Entraînez-vous à exprimer davantage votre avis et à accueillir le changement avec souplesse. Votre stabilité est un atout précieux pour l’équipe.',
    },
    es: {
      title: 'Tipo S — Estable',
      subtitle: 'Un apoyo que sostiene al equipo con confianza y estabilidad',
      description: 'El perfil estable es paciente y fiable, un gran compañero de equipo. Valora la armonía y la estabilidad, destaca manteniendo el equilibrio del grupo y logra resultados constantes con coherencia y cooperación.',
      keywords: ['Fiabilidad', 'Paciencia', 'Trabajo en equipo', 'Estabilidad', 'Cooperación'],
      strengths: ['Gran fiabilidad', 'Fuerte apoyo al equipo', 'Resultados constantes', 'Excelente capacidad de escucha'],
      weaknesses: ['Se adapta despacio al cambio', 'Poca asertividad', 'Aversión excesiva al riesgo', 'Evita los conflictos'],
      workStyle: 'Trabaja de forma sistemática y constante. Rinde al máximo en entornos estables y prefiere rutinas previsibles a los cambios repentinos.',
      communication: 'Suave, atento y con escucha activa. Valora la armonía e intenta evitar los conflictos.',
      tip: 'Practica expresar más tu opinión y adaptarte con flexibilidad a los cambios. Tu estabilidad es un gran activo para el equipo.',
    },
  },
  C: {
    ko: {
      title: 'C형 — 신중형',
      subtitle: '정확성과 품질로 완성도를 높이는 분석가',
      description: '신중형은 분석적이고 세심하며, 정확성을 중시합니다. 높은 기준을 세우고 품질에 집중합니다. 체계적인 접근과 세부 사항에 대한 집중으로 복잡한 문제를 해결합니다.',
      keywords: ['정확성', '분석력', '품질', '체계성', '완벽주의'],
      strengths: ['뛰어난 분석력', '높은 품질 기준', '체계적 문제 해결', '신중한 의사결정'],
      weaknesses: ['과도한 완벽주의', '변화에 저항', '결정 지연', '비판에 민감'],
      workStyle: '데이터와 사실을 기반으로 꼼꼼하게 작업합니다. 충분한 시간과 정보를 갖고 높은 품질의 결과를 만들어냅니다.',
      communication: '정확하고 사실 중심으로 소통합니다. 감정보다 논리를 선호하며, 증거와 데이터를 중시합니다.',
      tip: '완벽하지 않아도 충분히 좋은 결과를 인정하는 연습이 필요합니다. 때로는 빠른 실행이 완벽한 계획보다 더 가치 있습니다.',
    },
    en: {
      title: 'C — Conscientious',
      subtitle: 'An analyst who raises quality through accuracy and precision',
      description: 'Conscientious types are analytical, meticulous, and value accuracy. They set high standards and focus on quality. They solve complex problems through systematic approaches and attention to detail.',
      keywords: ['Accuracy', 'Analytical thinking', 'Quality', 'Systematization', 'Perfectionism'],
      strengths: ['Outstanding analytical skills', 'High quality standards', 'Systematic problem-solving', 'Careful decision-making'],
      weaknesses: ['Excessive perfectionism', 'Resistance to change', 'Decision delays', 'Sensitive to criticism'],
      workStyle: 'Works meticulously based on data and facts. Produces high-quality results given sufficient time and information.',
      communication: 'Communicates precisely, fact-based. Prefers logic over emotion, values evidence and data.',
      tip: 'Practice accepting results that are good enough even if not perfect. Sometimes quick execution is more valuable than the perfect plan.',
    },
    ja: {
      title: 'C型 — 慎重型',
      subtitle: '正確さと品質で完成度を高めるアナリスト',
      description: '慎重型は分析的で細やかで、正確さを重視します。高い基準を設けて品質に集中します。体系的アプローチと細部への注目で複雑な問題を解決します。',
      keywords: ['正確さ', '分析力', '品質', '体系性', '完璧主義'],
      strengths: ['卓越した分析力', '高い品質基準', '体系的問題解決', '慎重な意思決定'],
      weaknesses: ['過度な完璧主義', '変化への抵抗', '決断の遅れ', '批判に敏感'],
      workStyle: 'データと事実に基づいて丁寧に作業します。十分な時間と情報をもって高品質の結果を生み出します。',
      communication: '正確で事実中心に話します。感情より論理を好み、証拠とデータを重視します。',
      tip: '完璧でなくても十分良い結果を認める練習が必要です。時に素早い実行が完璧な計画より価値があります。',
    },
    zh: {
      title: 'C 型 — 谨慎型',
      subtitle: '以准确与品质提升完成度的分析者',
      description: '谨慎型善于分析、细心，重视准确。设定高标准，专注于品质。以有系统的方法和对细节的专注解决复杂问题。',
      keywords: ['准确', '分析力', '品质', '条理', '完美主义'],
      strengths: ['出色的分析力', '高品质标准', '有系统地解决问题', '慎重决策'],
      weaknesses: ['过度完美主义', '抗拒变化', '决定拖延', '对批评敏感'],
      workStyle: '以数据和事实为基础，细致地工作。给足时间和信息，就能做出高品质的成果。',
      communication: '准确、以事实为中心地沟通。比起情感更偏好逻辑，重视证据和数据。',
      tip: '需要练习接受“不完美但够好”的结果。有时，快速执行比完美计划更有价值。',
    },
    fr: {
      title: 'Type C — Consciencieux',
      subtitle: 'Un analyste qui élève le niveau par la précision et la qualité',
      description: 'Le profil consciencieux est analytique, minutieux et attaché à la précision. Il fixe des standards élevés et se concentre sur la qualité. Méthode et souci du détail lui permettent de résoudre des problèmes complexes.',
      keywords: ['Précision', 'Esprit d’analyse', 'Qualité', 'Méthode', 'Perfectionnisme'],
      strengths: ['Excellente capacité d’analyse', 'Standards de qualité élevés', 'Résolution méthodique des problèmes', 'Décisions réfléchies'],
      weaknesses: ['Perfectionnisme excessif', 'Résistance au changement', 'Décisions repoussées', 'Sensibilité à la critique'],
      workStyle: 'Travaille minutieusement à partir de données et de faits. Avec assez de temps et d’informations, il produit des résultats de grande qualité.',
      communication: 'Communique avec précision, à partir des faits. Préfère la logique aux émotions et accorde de l’importance aux preuves et aux données.',
      tip: 'Entraînez-vous à accepter un résultat assez bon, même s’il n’est pas parfait. Parfois, agir vite vaut mieux qu’un plan parfait.',
    },
    es: {
      title: 'Tipo C — Concienzudo',
      subtitle: 'Un analista que eleva el nivel con precisión y calidad',
      description: 'El perfil concienzudo es analítico, minucioso y valora la precisión. Fija estándares altos y se centra en la calidad. Resuelve problemas complejos con método y atención al detalle.',
      keywords: ['Precisión', 'Capacidad analítica', 'Calidad', 'Método', 'Perfeccionismo'],
      strengths: ['Gran capacidad analítica', 'Estándares de calidad altos', 'Resolución sistemática de problemas', 'Decisiones prudentes'],
      weaknesses: ['Perfeccionismo excesivo', 'Resistencia al cambio', 'Decisiones aplazadas', 'Sensibilidad a la crítica'],
      workStyle: 'Trabaja con minuciosidad a partir de datos y hechos. Con tiempo e información suficientes, logra resultados de gran calidad.',
      communication: 'Se comunica con precisión y basándose en hechos. Prefiere la lógica a las emociones y valora las pruebas y los datos.',
      tip: 'Practica aceptar un resultado suficientemente bueno aunque no sea perfecto. A veces actuar rápido vale más que un plan perfecto.',
    },
  },
}

interface Props { locale?: string }

export default function DiscPersonalityTest({ locale: lp = 'ko' }: Props) {
  const locale: Locale = (['ko', 'en', 'ja', 'zh', 'fr', 'es'].includes(lp) ? lp : 'en') as Locale
  const lb = LABELS[locale]
  const questions = QUESTIONS[locale]

  const initResult = (): { type: DiscType; scores: Scores } | null => {
    if (typeof window === 'undefined') return null
    const p = new URLSearchParams(window.location.search)
    const t = p.get('disc') as DiscType | null
    if (t && RESULTS[t]) return { type: t, scores: { D: 0, I: 0, S: 0, C: 0 } }
    return null
  }

  const [current, setCurrent] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search)
      if (p.get('disc')) return questions.length
    }
    return 0
  })
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<DiscType[]>([])
  const [result, setResult] = useState<{ type: DiscType; scores: Scores } | null>(initResult)
  useRecordFinishedTest({ testId: "disc-personality", title: "DiscPersonalityTest", finished: Boolean(result) });

  function calcResult(ans: DiscType[]): { type: DiscType; scores: Scores } {
    const scores: Scores = { D: 0, I: 0, S: 0, C: 0 }
    for (const a of ans) scores[a]++
    const type = (Object.keys(scores) as DiscType[]).reduce((a, b) => scores[a] >= scores[b] ? a : b)
    return { type, scores }
  }

  function pick(idx: number) {
    if (selected !== null) return
    setSelected(idx)
    // 되돌아가서 다시 고르면 그 뒤 응답은 버린다 — 이어붙이기(append)면 되돌리기가 성립하지 않는다.
    const newAns = answers.slice(0, current)
    newAns[current] = questions[current].options[idx].disc
    setTimeout(() => {
      if (current + 1 >= questions.length) setResult(calcResult(newAns))
      setAnswers(newAns)
      setCurrent(current + 1)
      setSelected(null)
    }, 280)
  }

  function restart() {
    setAnswers([]); setCurrent(0); setSelected(null); setResult(null)
    if (typeof window !== 'undefined') window.history.replaceState({}, '', window.location.pathname)
  }

  function share() {
    if (!result) return
    const url = `${window.location.origin}${window.location.pathname}?disc=${result.type}`
    const text = `${lb.shareMsg} ${result.type}형 (${RESULTS[result.type][locale].title})`
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
        options={q.options.map((opt, i) => ({ label: opt.text, value: i + 1 }))}
        selectedValue={
          selected !== null
            ? selected + 1
            : answers[current] === undefined
              ? undefined
              : q.options.findIndex((opt) => opt.disc === answers[current]) + 1
        }
        previousLabel={locale === 'ko' ? '이전 질문' : locale === 'ja' ? '前の質問' : 'Previous question'}
        onPrevious={current > 0 && selected === null ? () => setCurrent(current - 1) : undefined}
        onSelect={(value) => pick(value - 1)}
      />
    )
  }

  if (!result) return null
  const r = RESULTS[result.type][locale]
  const color = DISC_COLORS[result.type]
  const total = questions.length
  const chartData: { subject: string; value: number }[] = (Object.keys(result.scores) as DiscType[]).map(k => ({
    subject: k,
    value: Math.round((result.scores[k] / total) * 100),
  }))

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">{lb.yourType}</p>
        <ResultSymbol id="disc" variant={result.type} fallback={result.type} className="mx-auto h-28 w-28" />
        <div className="inline-flex items-center gap-2 rounded-full px-6 py-2 text-2xl font-bold text-white"
          style={{ backgroundColor: color }}>
          {result.type}
        </div>
        <h2 className="text-lg font-semibold">{r.title}</h2>
        <p className="text-muted-foreground font-medium text-sm">{r.subtitle}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{r.description}</p>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <p className="text-xs text-muted-foreground text-center mb-2">{lb.chartTitle}</p>
        <ResponsiveContainer width="100%" height={200}>
          <RadarChart data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 14, fontWeight: 700 }} />
            <Radar dataKey="value" stroke={color} fill={color} fillOpacity={0.3} />
            <Tooltip formatter={((v: number) => `${v}${lb.pct}`) as any} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-2">
        <h3 className="font-semibold text-sm">{lb.keywords}</h3>
        <div className="flex flex-wrap gap-2">
          {r.keywords.map(k => (
            <span key={k} className="rounded-full px-3 py-1 text-xs font-medium text-white"
              style={{ backgroundColor: color }}>{k}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border bg-card p-4 space-y-2">
          <h3 className="font-semibold text-sm text-green-600">{lb.strengths}</h3>
          <ul className="space-y-1">
            {r.strengths.map(s => <li key={s} className="text-xs text-muted-foreground flex gap-1"><span className="text-green-500">+</span>{s}</li>)}
          </ul>
        </div>
        <div className="rounded-xl border bg-card p-4 space-y-2">
          <h3 className="font-semibold text-sm text-amber-600">{lb.weaknesses}</h3>
          <ul className="space-y-1">
            {r.weaknesses.map(w => <li key={w} className="text-xs text-muted-foreground flex gap-1"><span className="text-amber-500">△</span>{w}</li>)}
          </ul>
        </div>
      </div>

      <div className="grid gap-3">
        <div className="rounded-xl border bg-card p-4 space-y-1">
          <h3 className="font-semibold text-sm">{lb.workStyle}</h3>
          <p className="text-sm text-muted-foreground">{r.workStyle}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 space-y-1">
          <h3 className="font-semibold text-sm">{lb.communication}</h3>
          <p className="text-sm text-muted-foreground">{r.communication}</p>
        </div>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-1">
        <h3 className="font-semibold text-sm text-primary">{lb.tip}</h3>
        <p className="text-sm">{r.tip}</p>
      </div>

      <ShareResultButton
        locale={locale}
        heading={lb.title}
        resultTitle={`${result.type} — ${r.title}`}
        description={chartData.map(d => `${d.subject} ${d.value}%`).join(' · ')}
        symbolSrc={resultSymbolSrc('disc', result.type)}
        analyticsId="disc-personality"
      />

      <div className="flex gap-3">
        <button onClick={restart}
          className="flex-1 rounded-lg border bg-card px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">
          {lb.restart}
        </button>
        <button onClick={share}
          className="flex-1 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity">
          {lb.share}
        </button>
      </div>
    </div>
  )
}
