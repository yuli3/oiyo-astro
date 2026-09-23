import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { Questionnaire } from '@/components/ui/questionnaire'
import ShareResultButton from '../shared/ShareResultButton';
import ResultNextSteps from '../shared/ResultNextSteps';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip
} from 'recharts'

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
  careerDescription: string
  topCareers: string[]
  workStyle: string
  idealEnvironment: string
  workStrengths: string[]
  workWeaknesses: string[]
  careerTip: string
  avoidEnvironments: string[]
}

type Locale = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es' | 'zh' | 'fr' | 'es'

// ─── i18n Labels ──────────────────────────────────────────────────────────────
const LABELS: Record<Locale, {
  title: string
  subtitle: string
  questionOf: (cur: number, total: number) => string
  restart: string
  share: string
  shareMsg: string
  topCareers: string
  workStyle: string
  idealEnv: string
  workStrengths: string
  workWeaknesses: string
  careerTip: string
  avoidEnvs: string
  chartTitle: string
  yourType: string
}> = {
  ko: {
    title: 'MBTI 직업 적성 테스트',
    subtitle: '나에게 맞는 직업은 무엇일까요?',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '내 MBTI 직업 유형은',
    topCareers: '추천 직업',
    workStyle: '업무 스타일',
    idealEnv: '이상적인 환경',
    workStrengths: '직업적 강점',
    workWeaknesses: '직업적 약점',
    careerTip: '커리어 조언',
    avoidEnvs: '피하면 좋은 환경',
    chartTitle: '성향 분석',
    yourType: '나의 직업 유형',
  },
  en: {
    title: 'MBTI Career Test',
    subtitle: 'What career suits you best?',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My MBTI career type is',
    topCareers: 'Recommended Careers',
    workStyle: 'Work Style',
    idealEnv: 'Ideal Environment',
    workStrengths: 'Career Strengths',
    workWeaknesses: 'Career Weaknesses',
    careerTip: 'Career Tip',
    avoidEnvs: 'Environments to Avoid',
    chartTitle: 'Trait Analysis',
    yourType: 'Your Career Type',
  },
  ja: {
    title: 'MBTI 職業適性テスト',
    subtitle: 'あなたに合う職業は？',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '私のMBTIキャリアタイプは',
    topCareers: 'おすすめの職業',
    workStyle: '仕事スタイル',
    idealEnv: '理想的な環境',
    workStrengths: 'キャリアの強み',
    workWeaknesses: 'キャリアの弱み',
    careerTip: 'キャリアアドバイス',
    avoidEnvs: '避けたい環境',
    chartTitle: '傾向分析',
    yourType: '私の職業タイプ',
  },
  zh: {
    title: 'MBTI 职业适性测验',
    subtitle: '适合我的职业是什么？',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: '重新测验',
    share: '分享结果',
    shareMsg: '我的 MBTI 职业类型是',
    topCareers: '推荐职业',
    workStyle: '工作风格',
    idealEnv: '理想环境',
    workStrengths: '职业优势',
    workWeaknesses: '职业弱点',
    careerTip: '职涯建议',
    avoidEnvs: '最好避开的环境',
    chartTitle: '倾向分析',
    yourType: '我的职业类型',
  },
  fr: {
    title: 'Test d’orientation professionnelle MBTI',
    subtitle: 'Quel métier me correspond ?',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: 'Recommencer',
    share: 'Partager le résultat',
    shareMsg: 'Mon type professionnel MBTI',
    topCareers: 'Métiers suggérés',
    workStyle: 'Style de travail',
    idealEnv: 'Environnement idéal',
    workStrengths: 'Forces professionnelles',
    workWeaknesses: 'Faiblesses professionnelles',
    careerTip: 'Conseil de carrière',
    avoidEnvs: 'Environnements à éviter',
    chartTitle: 'Analyse des préférences',
    yourType: 'Mon type professionnel',
  },
  es: {
    title: 'Test de aptitud profesional MBTI',
    subtitle: '¿Qué profesión me encaja?',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: 'Repetir',
    share: 'Compartir resultado',
    shareMsg: 'Mi tipo profesional MBTI',
    topCareers: 'Profesiones recomendadas',
    workStyle: 'Estilo de trabajo',
    idealEnv: 'Entorno ideal',
    workStrengths: 'Fortalezas profesionales',
    workWeaknesses: 'Debilidades profesionales',
    careerTip: 'Consejo de carrera',
    avoidEnvs: 'Entornos que conviene evitar',
    chartTitle: 'Análisis de preferencias',
    yourType: 'Mi tipo profesional',
  },
}

// ─── Questions ────────────────────────────────────────────────────────────────
const QUESTIONS: Record<Locale, Question[]> = {
  ko: [
    {
      id: 'q1',
      text: '새 프로젝트가 시작될 때 나는...',
      options: [
        { text: '팀원들과 바로 아이디어를 나누며 흥분한다', score: { E: 2 } },
        { text: '혼자 충분히 구상한 뒤 의견을 낸다', score: { I: 2 } },
        { text: '전체 계획을 먼저 세우고 싶다', score: { J: 1, N: 1 } },
        { text: '일단 시작하며 방향을 잡아나간다', score: { P: 1, E: 1 } },
      ],
    },
    {
      id: 'q2',
      text: '업무에서 나는 주로 어떤 부분에서 만족감을 느끼나요?',
      options: [
        { text: '구체적인 문제를 해결하고 눈에 보이는 결과를 만들 때', score: { S: 2 } },
        { text: '새로운 아이디어나 가능성을 탐색할 때', score: { N: 2 } },
        { text: '사람들과 협력하며 함께 성장할 때', score: { F: 2 } },
        { text: '시스템이나 프로세스를 개선할 때', score: { T: 1, J: 1 } },
      ],
    },
    {
      id: 'q3',
      text: '직장에서 갈등이 생기면 나는...',
      options: [
        { text: '논리적으로 분석하고 객관적인 해결책을 제시한다', score: { T: 2 } },
        { text: '모두의 감정을 고려한 조화로운 해결을 찾는다', score: { F: 2 } },
        { text: '규칙이나 절차에 따라 처리한다', score: { J: 1, S: 1 } },
        { text: '상황에 따라 유연하게 대응한다', score: { P: 2 } },
      ],
    },
    {
      id: 'q4',
      text: '나에게 이상적인 업무 환경은?',
      options: [
        { text: '팀워크와 소통이 활발한 오픈 공간', score: { E: 2 } },
        { text: '집중할 수 있는 조용하고 독립적인 공간', score: { I: 2 } },
        { text: '체계적이고 안정적인 구조', score: { J: 1, S: 1 } },
        { text: '자유롭고 유연한 분위기', score: { P: 1, N: 1 } },
      ],
    },
    {
      id: 'q5',
      text: '나는 주로 어떻게 의사결정을 하나요?',
      options: [
        { text: '데이터와 논리를 기반으로 분석한다', score: { T: 2 } },
        { text: '나와 관련된 사람들에게 어떤 영향을 미칠지 고려한다', score: { F: 2 } },
        { text: '직관과 큰 그림을 본다', score: { N: 2 } },
        { text: '과거 경험과 실제 사례를 참고한다', score: { S: 2 } },
      ],
    },
    {
      id: 'q6',
      text: '업무 기한과 계획에 대해 나는...',
      options: [
        { text: '기한보다 일찍 완료하는 편이다', score: { J: 2 } },
        { text: '기한 직전에 집중력이 높아진다', score: { P: 2 } },
        { text: '상세한 일정표를 만들고 지킨다', score: { J: 2, S: 1 } },
        { text: '유연하게 우선순위를 조정한다', score: { P: 1, N: 1 } },
      ],
    },
    {
      id: 'q7',
      text: '나는 어떤 유형의 문제를 해결하는 것을 즐기나요?',
      options: [
        { text: '명확한 답이 있는 구체적인 문제', score: { S: 2, T: 1 } },
        { text: '정답이 없는 창의적인 도전', score: { N: 2, P: 1 } },
        { text: '사람들 사이의 관계나 소통 문제', score: { F: 2, E: 1 } },
        { text: '복잡한 시스템이나 전략적 과제', score: { N: 1, T: 1, J: 1 } },
      ],
    },
    {
      id: 'q8',
      text: '회의나 발표 상황에서 나는...',
      options: [
        { text: '적극적으로 의견을 개진하고 토론을 주도한다', score: { E: 2, T: 1 } },
        { text: '필요할 때만 발언하고 주로 듣는다', score: { I: 2 } },
        { text: '미리 준비한 내용을 체계적으로 전달한다', score: { J: 1, S: 1 } },
        { text: '흐름에 따라 즉흥적으로 기여한다', score: { P: 1, E: 1 } },
      ],
    },
    {
      id: 'q9',
      text: '장기 커리어 목표를 생각할 때 나는...',
      options: [
        { text: '10년 후 구체적인 포지션과 경로를 그린다', score: { J: 2, S: 1 } },
        { text: '큰 비전과 가능성에 집중하고 경로는 유연하게', score: { N: 2, P: 1 } },
        { text: '내가 사람들에게 미칠 긍정적 영향을 중심으로 생각한다', score: { F: 2 } },
        { text: '시장 가치와 성장 가능성을 분석한다', score: { T: 2 } },
      ],
    },
    {
      id: 'q10',
      text: '새로운 기술이나 방법을 배울 때 나는...',
      options: [
        { text: '단계별 매뉴얼을 따라 차근차근 익힌다', score: { S: 2, J: 1 } },
        { text: '원리를 이해한 뒤 응용법을 스스로 탐구한다', score: { N: 2, I: 1 } },
        { text: '동료와 함께 배우며 서로 가르쳐준다', score: { E: 2, F: 1 } },
        { text: '일단 해보면서 시행착오로 익힌다', score: { P: 2, E: 1 } },
      ],
    },
    {
      id: 'q11',
      text: '직업 선택에서 나에게 가장 중요한 것은?',
      options: [
        { text: '안정성과 명확한 역할', score: { S: 2, J: 1 } },
        { text: '창의성과 자율성', score: { N: 2, P: 1 } },
        { text: '사람들과의 관계와 사회적 기여', score: { F: 2, E: 1 } },
        { text: '성과와 전문성 개발', score: { T: 2, J: 1 } },
      ],
    },
    {
      id: 'q12',
      text: '업무에서 스트레스를 받을 때 나는...',
      options: [
        { text: '혼자 조용히 충전하는 시간이 필요하다', score: { I: 2 } },
        { text: '친구나 동료에게 이야기하며 해소한다', score: { E: 2 } },
        { text: '문제의 원인을 분석하고 해결책을 찾는다', score: { T: 2 } },
        { text: '즐거운 활동으로 기분을 전환한다', score: { F: 1, P: 1 } },
      ],
    },
  ],
  en: [
    {
      id: 'q1',
      text: 'When a new project starts, I...',
      options: [
        { text: 'Get excited sharing ideas with teammates right away', score: { E: 2 } },
        { text: 'Think things through alone before sharing my views', score: { I: 2 } },
        { text: 'Want to plan everything out first', score: { J: 1, N: 1 } },
        { text: 'Just start and figure out direction along the way', score: { P: 1, E: 1 } },
      ],
    },
    {
      id: 'q2',
      text: 'At work, I feel most satisfied when...',
      options: [
        { text: 'Solving concrete problems and seeing tangible results', score: { S: 2 } },
        { text: 'Exploring new ideas and possibilities', score: { N: 2 } },
        { text: 'Collaborating with people and growing together', score: { F: 2 } },
        { text: 'Improving systems or processes', score: { T: 1, J: 1 } },
      ],
    },
    {
      id: 'q3',
      text: 'When workplace conflict arises, I...',
      options: [
        { text: 'Analyze logically and propose objective solutions', score: { T: 2 } },
        { text: 'Look for a harmonious resolution considering everyone\'s feelings', score: { F: 2 } },
        { text: 'Follow rules or procedures to handle it', score: { J: 1, S: 1 } },
        { text: 'Respond flexibly based on the situation', score: { P: 2 } },
      ],
    },
    {
      id: 'q4',
      text: 'My ideal work environment is...',
      options: [
        { text: 'An open space with active teamwork and communication', score: { E: 2 } },
        { text: 'A quiet, independent space to focus', score: { I: 2 } },
        { text: 'A structured, stable organization', score: { J: 1, S: 1 } },
        { text: 'A free, flexible atmosphere', score: { P: 1, N: 1 } },
      ],
    },
    {
      id: 'q5',
      text: 'How do I usually make decisions?',
      options: [
        { text: 'Analyze based on data and logic', score: { T: 2 } },
        { text: 'Consider how it affects the people involved', score: { F: 2 } },
        { text: 'Trust intuition and look at the big picture', score: { N: 2 } },
        { text: 'Reference past experiences and real cases', score: { S: 2 } },
      ],
    },
    {
      id: 'q6',
      text: 'Regarding deadlines and planning, I...',
      options: [
        { text: 'Tend to finish before the deadline', score: { J: 2 } },
        { text: 'Get focused right before the deadline', score: { P: 2 } },
        { text: 'Create detailed schedules and stick to them', score: { J: 2, S: 1 } },
        { text: 'Flexibly adjust priorities as needed', score: { P: 1, N: 1 } },
      ],
    },
    {
      id: 'q7',
      text: 'I enjoy solving these types of problems...',
      options: [
        { text: 'Concrete problems with clear answers', score: { S: 2, T: 1 } },
        { text: 'Creative challenges without a single right answer', score: { N: 2, P: 1 } },
        { text: 'Relationship or communication issues between people', score: { F: 2, E: 1 } },
        { text: 'Complex systems or strategic challenges', score: { N: 1, T: 1, J: 1 } },
      ],
    },
    {
      id: 'q8',
      text: 'In meetings or presentations, I...',
      options: [
        { text: 'Actively share opinions and lead discussions', score: { E: 2, T: 1 } },
        { text: 'Mostly listen and speak only when needed', score: { I: 2 } },
        { text: 'Systematically deliver prepared content', score: { J: 1, S: 1 } },
        { text: 'Contribute spontaneously based on the flow', score: { P: 1, E: 1 } },
      ],
    },
    {
      id: 'q9',
      text: 'When thinking about long-term career goals, I...',
      options: [
        { text: 'Picture a specific position and path 10 years ahead', score: { J: 2, S: 1 } },
        { text: 'Focus on a big vision and keep the path flexible', score: { N: 2, P: 1 } },
        { text: 'Think about the positive impact I\'ll have on people', score: { F: 2 } },
        { text: 'Analyze market value and growth potential', score: { T: 2 } },
      ],
    },
    {
      id: 'q10',
      text: 'When learning a new skill or method, I...',
      options: [
        { text: 'Follow step-by-step manuals carefully', score: { S: 2, J: 1 } },
        { text: 'Understand the principles, then explore applications myself', score: { N: 2, I: 1 } },
        { text: 'Learn together with colleagues and teach each other', score: { E: 2, F: 1 } },
        { text: 'Just try it and learn through trial and error', score: { P: 2, E: 1 } },
      ],
    },
    {
      id: 'q11',
      text: 'In choosing a career, what matters most to me?',
      options: [
        { text: 'Stability and clearly defined roles', score: { S: 2, J: 1 } },
        { text: 'Creativity and autonomy', score: { N: 2, P: 1 } },
        { text: 'Relationships and social contribution', score: { F: 2, E: 1 } },
        { text: 'Achievement and professional development', score: { T: 2, J: 1 } },
      ],
    },
    {
      id: 'q12',
      text: 'When I feel stressed at work, I...',
      options: [
        { text: 'Need quiet time alone to recharge', score: { I: 2 } },
        { text: 'Talk it out with friends or colleagues', score: { E: 2 } },
        { text: 'Analyze the root cause and find a solution', score: { T: 2 } },
        { text: 'Switch off with enjoyable activities', score: { F: 1, P: 1 } },
      ],
    },
  ],
  ja: [
    {
      id: 'q1',
      text: '新しいプロジェクトが始まる時、私は...',
      options: [
        { text: 'すぐチームメンバーとアイデアを共有して興奮する', score: { E: 2 } },
        { text: '一人で十分に考えてから意見を出す', score: { I: 2 } },
        { text: '全体の計画を先に立てたい', score: { J: 1, N: 1 } },
        { text: 'まず始めながら方向性を決めていく', score: { P: 1, E: 1 } },
      ],
    },
    {
      id: 'q2',
      text: '仕事で最も満足感を感じるのはいつですか？',
      options: [
        { text: '具体的な問題を解決して目に見える結果を作る時', score: { S: 2 } },
        { text: '新しいアイデアや可能性を探る時', score: { N: 2 } },
        { text: '人々と協力して一緒に成長する時', score: { F: 2 } },
        { text: 'システムやプロセスを改善する時', score: { T: 1, J: 1 } },
      ],
    },
    {
      id: 'q3',
      text: '職場で衝突が起きた時、私は...',
      options: [
        { text: '論理的に分析して客観的な解決策を提案する', score: { T: 2 } },
        { text: '全員の感情を考慮した調和的な解決を探す', score: { F: 2 } },
        { text: 'ルールや手順に従って処理する', score: { J: 1, S: 1 } },
        { text: '状況に応じて柔軟に対応する', score: { P: 2 } },
      ],
    },
    {
      id: 'q4',
      text: '私にとって理想的な職場環境は？',
      options: [
        { text: 'チームワークとコミュニケーションが活発なオープンな場所', score: { E: 2 } },
        { text: '集中できる静かで独立した空間', score: { I: 2 } },
        { text: '体系的で安定した組織構造', score: { J: 1, S: 1 } },
        { text: '自由で柔軟な雰囲気', score: { P: 1, N: 1 } },
      ],
    },
    {
      id: 'q5',
      text: '私は主にどのように意思決定しますか？',
      options: [
        { text: 'データと論理をもとに分析する', score: { T: 2 } },
        { text: '関係する人々への影響を考える', score: { F: 2 } },
        { text: '直感と全体像を重視する', score: { N: 2 } },
        { text: '過去の経験と実際の事例を参考にする', score: { S: 2 } },
      ],
    },
    {
      id: 'q6',
      text: '締め切りと計画について、私は...',
      options: [
        { text: '締め切りより早く完了する傾向がある', score: { J: 2 } },
        { text: '締め切り直前に集中力が上がる', score: { P: 2 } },
        { text: '詳細なスケジュールを作り守る', score: { J: 2, S: 1 } },
        { text: '柔軟に優先順位を調整する', score: { P: 1, N: 1 } },
      ],
    },
    {
      id: 'q7',
      text: 'どのタイプの問題を解くのが好きですか？',
      options: [
        { text: '明確な答えのある具体的な問題', score: { S: 2, T: 1 } },
        { text: '正解のないクリエイティブな挑戦', score: { N: 2, P: 1 } },
        { text: '人間関係やコミュニケーションの問題', score: { F: 2, E: 1 } },
        { text: '複雑なシステムや戦略的な課題', score: { N: 1, T: 1, J: 1 } },
      ],
    },
    {
      id: 'q8',
      text: '会議やプレゼンの場面で、私は...',
      options: [
        { text: '積極的に意見を述べ、議論を主導する', score: { E: 2, T: 1 } },
        { text: '必要な時だけ発言し、主に聞く', score: { I: 2 } },
        { text: '事前に準備した内容を体系的に伝える', score: { J: 1, S: 1 } },
        { text: '流れに合わせて即興で貢献する', score: { P: 1, E: 1 } },
      ],
    },
    {
      id: 'q9',
      text: '長期的なキャリア目標を考える時、私は...',
      options: [
        { text: '10年後の具体的なポジションと経路を描く', score: { J: 2, S: 1 } },
        { text: '大きなビジョンに集中し、経路は柔軟に', score: { N: 2, P: 1 } },
        { text: '人々への良い影響を中心に考える', score: { F: 2 } },
        { text: '市場価値と成長可能性を分析する', score: { T: 2 } },
      ],
    },
    {
      id: 'q10',
      text: '新しい技術や方法を学ぶ時、私は...',
      options: [
        { text: 'ステップごとのマニュアルを丁寧に従う', score: { S: 2, J: 1 } },
        { text: '原理を理解してから応用を自分で探る', score: { N: 2, I: 1 } },
        { text: '同僚と一緒に学び、教え合う', score: { E: 2, F: 1 } },
        { text: 'とりあえずやってみて試行錯誤で身につける', score: { P: 2, E: 1 } },
      ],
    },
    {
      id: 'q11',
      text: '職業選択で最も重視することは？',
      options: [
        { text: '安定性と明確な役割', score: { S: 2, J: 1 } },
        { text: '創造性と自律性', score: { N: 2, P: 1 } },
        { text: '人との関係や社会貢献', score: { F: 2, E: 1 } },
        { text: '成果と専門性の向上', score: { T: 2, J: 1 } },
      ],
    },
    {
      id: 'q12',
      text: '仕事でストレスを感じた時、私は...',
      options: [
        { text: '一人で静かに充電する時間が必要', score: { I: 2 } },
        { text: '友人や同僚に話して解消する', score: { E: 2 } },
        { text: '原因を分析して解決策を見つける', score: { T: 2 } },
        { text: '楽しい活動で気分転換する', score: { F: 1, P: 1 } },
      ],
    },
  ],
  zh: [
    {
      id: 'q1',
      text: '新项目开始时，我会……',
      options: [
        { text: '马上和队员分享点子，兴奋不已', score: { E: 2 } },
        { text: '自己充分构思后再提出意见', score: { I: 2 } },
        { text: '想先把整体计划定好', score: { J: 1, N: 1 } },
        { text: '先开始做，边做边找方向', score: { P: 1, E: 1 } },
      ],
    },
    {
      id: 'q2',
      text: '工作中，我主要在哪方面感到满足？',
      options: [
        { text: '解决具体问题、做出看得见的成果时', score: { S: 2 } },
        { text: '探索新想法或可能性时', score: { N: 2 } },
        { text: '和人合作、一起成长时', score: { F: 2 } },
        { text: '改善系统或流程时', score: { T: 1, J: 1 } },
      ],
    },
    {
      id: 'q3',
      text: '职场上起冲突时，我会……',
      options: [
        { text: '用逻辑分析，提出客观的解法', score: { T: 2 } },
        { text: '找出顾及每个人感受的和谐解法', score: { F: 2 } },
        { text: '依照规则或程序处理', score: { J: 1, S: 1 } },
        { text: '视情况灵活应对', score: { P: 2 } },
      ],
    },
    {
      id: 'q4',
      text: '对我来说理想的工作环境是？',
      options: [
        { text: '团队合作与沟通热络的开放空间', score: { E: 2 } },
        { text: '能专注的安静独立空间', score: { I: 2 } },
        { text: '有系统而稳定的结构', score: { J: 1, S: 1 } },
        { text: '自由而弹性的氛围', score: { P: 1, N: 1 } },
      ],
    },
    {
      id: 'q5',
      text: '我主要怎么做决定？',
      options: [
        { text: '以数据和逻辑分析', score: { T: 2 } },
        { text: '考虑会对相关的人造成什么影响', score: { F: 2 } },
        { text: '看直觉和大局', score: { N: 2 } },
        { text: '参考过去的经验和实际案例', score: { S: 2 } },
      ],
    },
    {
      id: 'q6',
      text: '对工作期限和计划，我……',
      options: [
        { text: '往往比期限提早完成', score: { J: 2 } },
        { text: '越接近期限越专注', score: { P: 2 } },
        { text: '做详细的日程表并遵守', score: { J: 2, S: 1 } },
        { text: '灵活调整优先顺序', score: { P: 1, N: 1 } },
      ],
    },
    {
      id: 'q7',
      text: '我喜欢解决哪种问题？',
      options: [
        { text: '有明确答案的具体问题', score: { S: 2, T: 1 } },
        { text: '没有标准答案的创意挑战', score: { N: 2, P: 1 } },
        { text: '人与人之间的关系或沟通问题', score: { F: 2, E: 1 } },
        { text: '复杂的系统或战略课题', score: { N: 1, T: 1, J: 1 } },
      ],
    },
    {
      id: 'q8',
      text: '开会或发表时，我会……',
      options: [
        { text: '积极提出意见，主导讨论', score: { E: 2, T: 1 } },
        { text: '只在需要时发言，多半在听', score: { I: 2 } },
        { text: '有系统地传达事先准备的内容', score: { J: 1, S: 1 } },
        { text: '跟着气氛即兴贡献', score: { P: 1, E: 1 } },
      ],
    },
    {
      id: 'q9',
      text: '思考长期职涯目标时，我会……',
      options: [
        { text: '描绘十年后具体的职位和路径', score: { J: 2, S: 1 } },
        { text: '专注于大愿景和可能性，路径保持弹性', score: { N: 2, P: 1 } },
        { text: '以我能给人带来的正面影响为中心', score: { F: 2 } },
        { text: '分析市场价值和成长潜力', score: { T: 2 } },
      ],
    },
    {
      id: 'q10',
      text: '学新技术或新方法时，我会……',
      options: [
        { text: '照着分步骤的手册一步步学', score: { S: 2, J: 1 } },
        { text: '理解原理后自己探索应用', score: { N: 2, I: 1 } },
        { text: '和同事一起学、互相教', score: { E: 2, F: 1 } },
        { text: '先做了再说，从试错中学', score: { P: 2, E: 1 } },
      ],
    },
    {
      id: 'q11',
      text: '选择职业时，对我最重要的是？',
      options: [
        { text: '稳定与明确的角色', score: { S: 2, J: 1 } },
        { text: '创造力与自主权', score: { N: 2, P: 1 } },
        { text: '与人的关系和社会贡献', score: { F: 2, E: 1 } },
        { text: '成果与专业成长', score: { T: 2, J: 1 } },
      ],
    },
    {
      id: 'q12',
      text: '工作压力大时，我会……',
      options: [
        { text: '需要独自安静充电的时间', score: { I: 2 } },
        { text: '找朋友或同事聊聊来纾解', score: { E: 2 } },
        { text: '分析问题原因，找出解法', score: { T: 2 } },
        { text: '用开心的活动转换心情', score: { F: 1, P: 1 } },
      ],
    },
  ],
  fr: [
    {
      id: 'q1',
      text: 'Quand un nouveau projet démarre, je…',
      options: [
        { text: 'Partage tout de suite mes idées avec l’équipe, plein d’enthousiasme', score: { E: 2 } },
        { text: 'Réfléchis d’abord seul avant de donner mon avis', score: { I: 2 } },
        { text: 'Veux d’abord établir le plan d’ensemble', score: { J: 1, N: 1 } },
        { text: 'Commence et trouve la direction en avançant', score: { P: 1, E: 1 } },
      ],
    },
    {
      id: 'q2',
      text: 'Qu’est-ce qui vous satisfait le plus au travail ?',
      options: [
        { text: 'Résoudre des problèmes concrets et obtenir des résultats visibles', score: { S: 2 } },
        { text: 'Explorer de nouvelles idées ou possibilités', score: { N: 2 } },
        { text: 'Collaborer et grandir avec les autres', score: { F: 2 } },
        { text: 'Améliorer un système ou un processus', score: { T: 1, J: 1 } },
      ],
    },
    {
      id: 'q3',
      text: 'Face à un conflit au travail, je…',
      options: [
        { text: 'Analyse logiquement et propose une solution objective', score: { T: 2 } },
        { text: 'Cherche une solution harmonieuse qui tienne compte des émotions de chacun', score: { F: 2 } },
        { text: 'Suis les règles et les procédures', score: { J: 1, S: 1 } },
        { text: 'M’adapte avec souplesse selon la situation', score: { P: 2 } },
      ],
    },
    {
      id: 'q4',
      text: 'Votre environnement de travail idéal ?',
      options: [
        { text: 'Un espace ouvert, avec beaucoup d’échanges et de travail d’équipe', score: { E: 2 } },
        { text: 'Un espace calme et indépendant pour se concentrer', score: { I: 2 } },
        { text: 'Une structure organisée et stable', score: { J: 1, S: 1 } },
        { text: 'Une ambiance libre et flexible', score: { P: 1, N: 1 } },
      ],
    },
    {
      id: 'q5',
      text: 'Comment prenez-vous surtout vos décisions ?',
      options: [
        { text: 'J’analyse à partir de données et de logique', score: { T: 2 } },
        { text: 'Je pense à l’effet sur les personnes concernées', score: { F: 2 } },
        { text: 'Je regarde l’intuition et la vue d’ensemble', score: { N: 2 } },
        { text: 'Je m’appuie sur l’expérience passée et des cas concrets', score: { S: 2 } },
      ],
    },
    {
      id: 'q6',
      text: 'Face aux délais et aux plans, je…',
      options: [
        { text: 'Termine généralement en avance', score: { J: 2 } },
        { text: 'Suis plus concentré à l’approche de l’échéance', score: { P: 2 } },
        { text: 'Établis un planning détaillé et je m’y tiens', score: { J: 2, S: 1 } },
        { text: 'Réajuste mes priorités avec souplesse', score: { P: 1, N: 1 } },
      ],
    },
    {
      id: 'q7',
      text: 'Quel type de problème aimez-vous résoudre ?',
      options: [
        { text: 'Des problèmes concrets avec une réponse claire', score: { S: 2, T: 1 } },
        { text: 'Des défis créatifs sans bonne réponse unique', score: { N: 2, P: 1 } },
        { text: 'Des problèmes de relations ou de communication', score: { F: 2, E: 1 } },
        { text: 'Des systèmes complexes ou des enjeux stratégiques', score: { N: 1, T: 1, J: 1 } },
      ],
    },
    {
      id: 'q8',
      text: 'En réunion ou en présentation, je…',
      options: [
        { text: 'Donne activement mon avis et mène la discussion', score: { E: 2, T: 1 } },
        { text: 'Ne parle que si nécessaire et écoute surtout', score: { I: 2 } },
        { text: 'Transmets avec méthode ce que j’ai préparé', score: { J: 1, S: 1 } },
        { text: 'Contribue spontanément selon le fil de la discussion', score: { P: 1, E: 1 } },
      ],
    },
    {
      id: 'q9',
      text: 'Quand je pense à mes objectifs de carrière à long terme, je…',
      options: [
        { text: 'Dessine un poste et un parcours précis à dix ans', score: { J: 2, S: 1 } },
        { text: 'Me concentre sur une grande vision et garde un chemin souple', score: { N: 2, P: 1 } },
        { text: 'Pense d’abord à l’impact positif que je peux avoir sur les autres', score: { F: 2 } },
        { text: 'Analyse la valeur sur le marché et le potentiel de progression', score: { T: 2 } },
      ],
    },
    {
      id: 'q10',
      text: 'Pour apprendre une nouvelle technique ou méthode, je…',
      options: [
        { text: 'Suis un manuel étape par étape', score: { S: 2, J: 1 } },
        { text: 'Comprends le principe puis explore seul les applications', score: { N: 2, I: 1 } },
        { text: 'Apprends avec des collègues et on s’enseigne mutuellement', score: { E: 2, F: 1 } },
        { text: 'Essaie directement et apprends par essais et erreurs', score: { P: 2, E: 1 } },
      ],
    },
    {
      id: 'q11',
      text: 'Le plus important pour moi dans le choix d’un métier ?',
      options: [
        { text: 'La stabilité et un rôle clair', score: { S: 2, J: 1 } },
        { text: 'La créativité et l’autonomie', score: { N: 2, P: 1 } },
        { text: 'Les relations humaines et la contribution sociale', score: { F: 2, E: 1 } },
        { text: 'Les résultats et le développement de l’expertise', score: { T: 2, J: 1 } },
      ],
    },
    {
      id: 'q12',
      text: 'Quand le travail me stresse, je…',
      options: [
        { text: 'Ai besoin de temps seul, au calme, pour recharger', score: { I: 2 } },
        { text: 'Évacue en parlant à un ami ou un collègue', score: { E: 2 } },
        { text: 'Analyse la cause et cherche une solution', score: { T: 2 } },
        { text: 'Change d’air avec une activité agréable', score: { F: 1, P: 1 } },
      ],
    },
  ],
  es: [
    {
      id: 'q1',
      text: 'Cuando empieza un proyecto nuevo, yo…',
      options: [
        { text: 'Comparto enseguida ideas con el equipo, emocionado', score: { E: 2 } },
        { text: 'Lo pienso bien a solas antes de opinar', score: { I: 2 } },
        { text: 'Quiero fijar primero el plan general', score: { J: 1, N: 1 } },
        { text: 'Empiezo y voy encontrando el rumbo', score: { P: 1, E: 1 } },
      ],
    },
    {
      id: 'q2',
      text: '¿Qué te da más satisfacción en el trabajo?',
      options: [
        { text: 'Resolver problemas concretos y lograr resultados visibles', score: { S: 2 } },
        { text: 'Explorar ideas o posibilidades nuevas', score: { N: 2 } },
        { text: 'Colaborar y crecer con otras personas', score: { F: 2 } },
        { text: 'Mejorar un sistema o un proceso', score: { T: 1, J: 1 } },
      ],
    },
    {
      id: 'q3',
      text: 'Cuando surge un conflicto en el trabajo, yo…',
      options: [
        { text: 'Analizo con lógica y propongo una solución objetiva', score: { T: 2 } },
        { text: 'Busco una solución armoniosa que tenga en cuenta los sentimientos de todos', score: { F: 2 } },
        { text: 'Lo gestiono según las normas y los procedimientos', score: { J: 1, S: 1 } },
        { text: 'Respondo con flexibilidad según la situación', score: { P: 2 } },
      ],
    },
    {
      id: 'q4',
      text: '¿Tu entorno de trabajo ideal?',
      options: [
        { text: 'Un espacio abierto con mucho trabajo en equipo y comunicación', score: { E: 2 } },
        { text: 'Un espacio tranquilo e independiente para concentrarme', score: { I: 2 } },
        { text: 'Una estructura organizada y estable', score: { J: 1, S: 1 } },
        { text: 'Un ambiente libre y flexible', score: { P: 1, N: 1 } },
      ],
    },
    {
      id: 'q5',
      text: '¿Cómo sueles tomar decisiones?',
      options: [
        { text: 'Analizo con datos y lógica', score: { T: 2 } },
        { text: 'Pienso en cómo afectará a las personas implicadas', score: { F: 2 } },
        { text: 'Miro la intuición y el panorama general', score: { N: 2 } },
        { text: 'Me baso en experiencias pasadas y casos reales', score: { S: 2 } },
      ],
    },
    {
      id: 'q6',
      text: 'Con los plazos y la planificación, yo…',
      options: [
        { text: 'Suelo terminar antes de tiempo', score: { J: 2 } },
        { text: 'Me concentro más justo antes del plazo', score: { P: 2 } },
        { text: 'Hago un calendario detallado y lo cumplo', score: { J: 2, S: 1 } },
        { text: 'Ajusto las prioridades con flexibilidad', score: { P: 1, N: 1 } },
      ],
    },
    {
      id: 'q7',
      text: '¿Qué tipo de problemas disfrutas resolviendo?',
      options: [
        { text: 'Problemas concretos con una respuesta clara', score: { S: 2, T: 1 } },
        { text: 'Retos creativos sin una única respuesta', score: { N: 2, P: 1 } },
        { text: 'Problemas de relación o comunicación entre personas', score: { F: 2, E: 1 } },
        { text: 'Sistemas complejos o retos estratégicos', score: { N: 1, T: 1, J: 1 } },
      ],
    },
    {
      id: 'q8',
      text: 'En reuniones o presentaciones, yo…',
      options: [
        { text: 'Doy mi opinión activamente y llevo el debate', score: { E: 2, T: 1 } },
        { text: 'Hablo solo cuando hace falta y sobre todo escucho', score: { I: 2 } },
        { text: 'Transmito con orden lo que he preparado', score: { J: 1, S: 1 } },
        { text: 'Aporto de forma espontánea según el hilo', score: { P: 1, E: 1 } },
      ],
    },
    {
      id: 'q9',
      text: 'Cuando pienso en mis metas profesionales a largo plazo, yo…',
      options: [
        { text: 'Dibujo un puesto y una trayectoria concretos a diez años', score: { J: 2, S: 1 } },
        { text: 'Me centro en una gran visión y mantengo flexible el camino', score: { N: 2, P: 1 } },
        { text: 'Pienso sobre todo en el impacto positivo que puedo tener', score: { F: 2 } },
        { text: 'Analizo el valor de mercado y el potencial de crecimiento', score: { T: 2 } },
      ],
    },
    {
      id: 'q10',
      text: 'Cuando aprendo una técnica o un método nuevo, yo…',
      options: [
        { text: 'Sigo un manual paso a paso', score: { S: 2, J: 1 } },
        { text: 'Entiendo el principio y exploro yo solo las aplicaciones', score: { N: 2, I: 1 } },
        { text: 'Aprendo con compañeros y nos enseñamos mutuamente', score: { E: 2, F: 1 } },
        { text: 'Lo pruebo directamente y aprendo por ensayo y error', score: { P: 2, E: 1 } },
      ],
    },
    {
      id: 'q11',
      text: '¿Lo más importante para mí al elegir profesión?',
      options: [
        { text: 'Estabilidad y un rol claro', score: { S: 2, J: 1 } },
        { text: 'Creatividad y autonomía', score: { N: 2, P: 1 } },
        { text: 'Relaciones humanas y contribución social', score: { F: 2, E: 1 } },
        { text: 'Resultados y desarrollo profesional', score: { T: 2, J: 1 } },
      ],
    },
    {
      id: 'q12',
      text: 'Cuando el trabajo me estresa, yo…',
      options: [
        { text: 'Necesito tiempo a solas y en calma para recargarme', score: { I: 2 } },
        { text: 'Me desahogo hablando con amigos o compañeros', score: { E: 2 } },
        { text: 'Analizo la causa y busco una solución', score: { T: 2 } },
        { text: 'Cambio de aires con una actividad agradable', score: { F: 1, P: 1 } },
      ],
    },
  ],
}

// ─── Results Data ─────────────────────────────────────────────────────────────
const RESULTS: Record<MBTIType, Record<Locale, ResultData>> = {
  INTJ: {
    ko: {
      name: '전략적 설계자',
      careerDescription: '장기 비전을 세우고 체계적으로 실행하는 능력이 탁월합니다. 복잡한 시스템을 분석하고 최적화하는 것을 즐깁니다.',
      topCareers: ['전략 컨설턴트', '데이터 과학자', '소프트웨어 아키텍트', '연구원', '투자 분석가'],
      workStyle: '독립적으로 깊이 있는 작업을 선호하며, 장기 목표를 향해 체계적으로 진행합니다.',
      idealEnvironment: '자율성이 보장되고 성과로 평가받는 환경. 지적 도전이 지속적으로 주어지는 곳.',
      workStrengths: ['전략적 사고', '복잡한 문제 해결', '장기 계획 수립', '독립적 작업'],
      workWeaknesses: ['세부 사항 간과 가능성', '팀 소통 부족', '지나친 완벽주의'],
      careerTip: '뛰어난 전략가이지만, 실행 단계에서 팀과의 소통을 강화하세요. 피드백을 수용하는 유연성이 성공의 열쇠입니다.',
      avoidEnvironments: ['단순 반복 업무', '과도한 소셜 상호작용 요구', '창의성이 억압되는 환경'],
    },
    en: {
      name: 'Strategic Architect',
      careerDescription: 'Exceptional at setting long-term visions and executing systematically. Enjoys analyzing and optimizing complex systems.',
      topCareers: ['Strategy Consultant', 'Data Scientist', 'Software Architect', 'Researcher', 'Investment Analyst'],
      workStyle: 'Prefers independent, deep work and progresses systematically toward long-term goals.',
      idealEnvironment: 'Autonomy-guaranteed environment evaluated on results. Continuous intellectual challenges.',
      workStrengths: ['Strategic thinking', 'Complex problem solving', 'Long-term planning', 'Independent work'],
      workWeaknesses: ['May overlook details', 'Insufficient team communication', 'Excessive perfectionism'],
      careerTip: 'A brilliant strategist, but strengthen communication with your team during execution. Flexibility in receiving feedback is the key to success.',
      avoidEnvironments: ['Repetitive simple tasks', 'Excessive social interaction requirements', 'Environments suppressing creativity'],
    },
    ja: {
      name: '戦略的設計者',
      careerDescription: '長期ビジョンを描き体系的に実行する能力に優れています。複雑なシステムを分析・最適化することを楽しみます。',
      topCareers: ['戦略コンサルタント', 'データサイエンティスト', 'ソフトウェアアーキテクト', '研究者', '投資アナリスト'],
      workStyle: '独立して深く作業することを好み、長期目標に向けて体系的に進めます。',
      idealEnvironment: '自律性が保証され成果で評価される環境。継続的な知的挑戦がある場所。',
      workStrengths: ['戦略的思考', '複雑な問題解決', '長期計画策定', '独立した作業'],
      workWeaknesses: ['細部を見落とす可能性', 'チームとのコミュニケーション不足', '過度な完璧主義'],
      careerTip: '優れた戦略家ですが、実行段階でチームとのコミュニケーションを強化しましょう。フィードバックを受け入れる柔軟性が成功の鍵です。',
      avoidEnvironments: ['単純繰り返し作業', '過度な社交的交流の要求', '創造性が抑圧される環境'],
    },
    zh: {
      name: '战略设计师',
      careerDescription: '擅长设定长期愿景并有系统地执行。喜欢分析并优化复杂的系统。',
      topCareers: ['战略顾问', '数据科学家', '软件架构师', '研究员', '投资分析师'],
      workStyle: '偏好独立、深入的工作，有系统地朝长期目标推进。',
      idealEnvironment: '有自主权、以成果评价的环境。能持续获得智识挑战的地方。',
      workStrengths: ['战略思维', '解决复杂问题', '制定长期计划', '独立工作'],
      workWeaknesses: ['可能忽略细节', '团队沟通不足', '过度完美主义'],
      careerTip: '你是出色的战略家，但在执行阶段要加强与团队的沟通。接纳反馈的弹性是成功的关键。',
      avoidEnvironments: ['单调重复的工作', '要求过多社交互动', '压抑创造力的环境'],
    },
    fr: {
      name: 'Architecte stratégique',
      careerDescription: 'Vous excellez à fixer une vision à long terme et à l’exécuter avec méthode. Vous aimez analyser et optimiser des systèmes complexes.',
      topCareers: ['Consultant en stratégie', 'Data scientist', 'Architecte logiciel', 'Chercheur', 'Analyste en investissement'],
      workStyle: 'Vous préférez un travail autonome et approfondi, et avancez méthodiquement vers des objectifs à long terme.',
      idealEnvironment: 'Un environnement autonome où l’on est évalué sur les résultats, avec des défis intellectuels constants.',
      workStrengths: ['Pensée stratégique', 'Résolution de problèmes complexes', 'Planification à long terme', 'Travail autonome'],
      workWeaknesses: ['Risque de négliger les détails', 'Communication d’équipe insuffisante', 'Perfectionnisme excessif'],
      careerTip: 'Vous êtes un excellent stratège ; renforcez la communication avec l’équipe lors de l’exécution. La souplesse face aux retours est la clé du succès.',
      avoidEnvironments: ['Les tâches simples et répétitives', 'Des interactions sociales excessives', 'Un environnement qui étouffe la créativité'],
    },
    es: {
      name: 'Arquitecto estratégico',
      careerDescription: 'Destacas fijando una visión a largo plazo y ejecutándola con método. Disfrutas analizando y optimizando sistemas complejos.',
      topCareers: ['Consultor de estrategia', 'Científico de datos', 'Arquitecto de software', 'Investigador', 'Analista de inversiones'],
      workStyle: 'Prefieres el trabajo autónomo y profundo, y avanzas con método hacia metas a largo plazo.',
      idealEnvironment: 'Un entorno con autonomía, evaluado por resultados y con retos intelectuales constantes.',
      workStrengths: ['Pensamiento estratégico', 'Resolución de problemas complejos', 'Planificación a largo plazo', 'Trabajo autónomo'],
      workWeaknesses: ['Puedes pasar por alto los detalles', 'Poca comunicación con el equipo', 'Perfeccionismo excesivo'],
      careerTip: 'Eres un gran estratega; refuerza la comunicación con el equipo en la fase de ejecución. La flexibilidad para aceptar opiniones es la clave del éxito.',
      avoidEnvironments: ['Tareas simples y repetitivas', 'Exigencia excesiva de interacción social', 'Entornos que reprimen la creatividad'],
    },
  },
  INTP: {
    ko: {
      name: '논리적 탐구자',
      careerDescription: '복잡한 이론과 아이디어를 탐구하는 것을 즐깁니다. 지적 호기심이 강하고 혁신적인 해결책을 찾아냅니다.',
      topCareers: ['소프트웨어 개발자', '철학자/학자', '수학자', '시스템 분석가', '과학 연구원'],
      workStyle: '이론적 분석을 깊이 파고들며, 독립적으로 자신만의 속도로 작업합니다.',
      idealEnvironment: '지적 자유가 보장되고 아이디어를 실험할 수 있는 환경.',
      workStrengths: ['논리적 분석', '혁신적 사고', '패턴 인식', '객관적 평가'],
      workWeaknesses: ['완성보다 탐구에 집중', '실용적 세부사항 간과', '팀 작업 시 소통 부족'],
      careerTip: '뛰어난 분석력을 실제 결과물로 연결하는 훈련이 필요합니다. 마감 기한을 존중하는 습관을 기르세요.',
      avoidEnvironments: ['엄격한 규칙 중심 환경', '창의성이 없는 단순 작업', '지나친 사교 요구'],
    },
    en: {
      name: 'Logical Explorer',
      careerDescription: 'Loves exploring complex theories and ideas. Driven by intellectual curiosity to find innovative solutions.',
      topCareers: ['Software Developer', 'Philosopher/Scholar', 'Mathematician', 'Systems Analyst', 'Scientific Researcher'],
      workStyle: 'Dives deeply into theoretical analysis, working independently at their own pace.',
      idealEnvironment: 'Environment with intellectual freedom and ability to experiment with ideas.',
      workStrengths: ['Logical analysis', 'Innovative thinking', 'Pattern recognition', 'Objective evaluation'],
      workWeaknesses: ['Focused on exploration over completion', 'May overlook practical details', 'Communication gaps in team work'],
      careerTip: 'Practice connecting your brilliant analytical skills to tangible outcomes. Develop habits of respecting deadlines.',
      avoidEnvironments: ['Rigid rule-based environments', 'Simple tasks without creativity', 'Excessive socializing requirements'],
    },
    ja: {
      name: '論理的探求者',
      careerDescription: '複雑な理論やアイデアを探求することを楽しみます。知的好奇心が強く、革新的な解決策を見つけます。',
      topCareers: ['ソフトウェア開発者', '哲学者/学者', '数学者', 'システムアナリスト', '科学研究者'],
      workStyle: '理論的分析を深く掘り下げ、独立して自分のペースで作業します。',
      idealEnvironment: '知的自由が保証されアイデアを実験できる環境。',
      workStrengths: ['論理的分析', '革新的思考', 'パターン認識', '客観的評価'],
      workWeaknesses: ['完成より探求に集中', '実用的な細部を見落とす', 'チーム作業でのコミュニケーション不足'],
      careerTip: '優れた分析力を実際の成果物に結びつける練習が必要です。締め切りを守る習慣を身につけましょう。',
      avoidEnvironments: ['厳格なルール中心の環境', '創造性のない単純作業', '過度な社交の要求'],
    },
    zh: {
      name: '逻辑探索者',
      careerDescription: '喜欢探究复杂的理论与想法。求知欲强，能找出创新的解法。',
      topCareers: ['软件开发者', '哲学家/学者', '数学家', '系统分析师', '科学研究员'],
      workStyle: '深入钻研理论分析，按自己的节奏独立工作。',
      idealEnvironment: '保障智识自由、能实验想法的环境。',
      workStrengths: ['逻辑分析', '创新思维', '辨识模式', '客观评估'],
      workWeaknesses: ['专注探索胜过完成', '忽略实际细节', '团队合作时沟通不足'],
      careerTip: '需要练习把出色的分析力落实为具体成果。养成尊重截止日期的习惯吧。',
      avoidEnvironments: ['以严格规则为中心的环境', '没有创意的单调工作', '过多的社交要求'],
    },
    fr: {
      name: 'Explorateur logique',
      careerDescription: 'Vous aimez explorer des théories et des idées complexes. Très curieux intellectuellement, vous trouvez des solutions innovantes.',
      topCareers: ['Développeur logiciel', 'Philosophe / universitaire', 'Mathématicien', 'Analyste systèmes', 'Chercheur scientifique'],
      workStyle: 'Vous creusez l’analyse théorique et travaillez seul, à votre rythme.',
      idealEnvironment: 'Un environnement de liberté intellectuelle où l’on peut expérimenter ses idées.',
      workStrengths: ['Analyse logique', 'Pensée innovante', 'Repérage de schémas', 'Évaluation objective'],
      workWeaknesses: ['Plus attiré par l’exploration que par l’aboutissement', 'Néglige les détails pratiques', 'Communication insuffisante en équipe'],
      careerTip: 'Entraînez-vous à transformer votre sens de l’analyse en résultats concrets. Prenez l’habitude de respecter les délais.',
      avoidEnvironments: ['Les environnements régis par des règles strictes', 'Les tâches simples sans créativité', 'Les exigences sociales excessives'],
    },
    es: {
      name: 'Explorador lógico',
      careerDescription: 'Disfrutas explorando teorías e ideas complejas. Tienes mucha curiosidad intelectual y encuentras soluciones innovadoras.',
      topCareers: ['Desarrollador de software', 'Filósofo / académico', 'Matemático', 'Analista de sistemas', 'Investigador científico'],
      workStyle: 'Profundizas en el análisis teórico y trabajas de forma independiente, a tu ritmo.',
      idealEnvironment: 'Un entorno con libertad intelectual donde se puedan experimentar ideas.',
      workStrengths: ['Análisis lógico', 'Pensamiento innovador', 'Reconocimiento de patrones', 'Evaluación objetiva'],
      workWeaknesses: ['Te centras más en explorar que en terminar', 'Pasas por alto detalles prácticos', 'Poca comunicación en equipo'],
      careerTip: 'Necesitas entrenar la conversión de tu gran capacidad analítica en resultados concretos. Cultiva el hábito de respetar los plazos.',
      avoidEnvironments: ['Entornos regidos por normas estrictas', 'Tareas simples sin creatividad', 'Exigencias sociales excesivas'],
    },
  },
  ENTJ: {
    ko: {
      name: '대담한 리더',
      careerDescription: '목표 지향적이며 결단력이 있습니다. 조직을 이끌고 성과를 극대화하는 것에 타고난 능력이 있습니다.',
      topCareers: ['CEO/경영자', '프로젝트 매니저', '변호사', '기업 컨설턴트', '금융 디렉터'],
      workStyle: '빠른 의사결정으로 팀을 이끌고, 높은 기준을 설정하며 결과를 추구합니다.',
      idealEnvironment: '도전적 목표가 있고 리더십을 발휘할 수 있는 환경.',
      workStrengths: ['강력한 리더십', '전략적 비전', '결단력', '성과 극대화'],
      workWeaknesses: ['팀원 감정 무시 가능성', '과도한 통제', '인내심 부족'],
      careerTip: '리더십은 강점이지만, 팀원의 의견을 듣고 공감하는 능력을 개발하면 훨씬 더 강력한 리더가 됩니다.',
      avoidEnvironments: ['수동적인 역할', '창의성이 제한된 환경', '느린 의사결정 구조'],
    },
    en: {
      name: 'Bold Leader',
      careerDescription: 'Goal-oriented and decisive. Has a natural ability to lead organizations and maximize performance.',
      topCareers: ['CEO/Executive', 'Project Manager', 'Lawyer', 'Business Consultant', 'Finance Director'],
      workStyle: 'Leads teams with quick decisions, sets high standards, and drives results.',
      idealEnvironment: 'Environment with challenging goals where leadership can be exercised.',
      workStrengths: ['Strong leadership', 'Strategic vision', 'Decisiveness', 'Performance maximization'],
      workWeaknesses: ['May ignore team emotions', 'Excessive control', 'Impatience'],
      careerTip: 'Leadership is your strength, but developing the ability to listen and empathize with team members will make you an even more powerful leader.',
      avoidEnvironments: ['Passive roles', 'Environments with limited creativity', 'Slow decision-making structures'],
    },
    ja: {
      name: '大胆なリーダー',
      careerDescription: '目標志向で決断力があります。組織を率いて成果を最大化する天賦の才があります。',
      topCareers: ['CEO/経営者', 'プロジェクトマネージャー', '弁護士', 'ビジネスコンサルタント', 'ファイナンスディレクター'],
      workStyle: '素早い意思決定でチームを率い、高い基準を設定して結果を追求します。',
      idealEnvironment: '挑戦的な目標があり、リーダーシップを発揮できる環境。',
      workStrengths: ['強力なリーダーシップ', '戦略的ビジョン', '決断力', '成果の最大化'],
      workWeaknesses: ['チームメンバーの感情を無視する可能性', '過度な管理', '忍耐力不足'],
      careerTip: 'リーダーシップは強みですが、チームメンバーの意見を聞いて共感する能力を開発すると、さらに強力なリーダーになれます。',
      avoidEnvironments: ['受動的な役割', '創造性が制限された環境', '意思決定が遅い構造'],
    },
    zh: {
      name: '大胆的领导者',
      careerDescription: '目标导向、有决断力。天生擅长带领组织、把成果最大化。',
      topCareers: ['首席执行官/经营者', '项目经理', '律师', '企业顾问', '财务总监'],
      workStyle: '以快速决策带领团队，设定高标准并追求结果。',
      idealEnvironment: '有挑战性目标、能发挥领导力的环境。',
      workStrengths: ['强大的领导力', '战略愿景', '决断力', '成果最大化'],
      workWeaknesses: ['可能忽视队员的感受', '过度掌控', '缺乏耐心'],
      careerTip: '领导力是你的优势，但若培养倾听与共情队员的能力，你会成为更强大的领导者。',
      avoidEnvironments: ['被动的角色', '限制创造力的环境', '决策缓慢的结构'],
    },
    fr: {
      name: 'Leader audacieux',
      careerDescription: 'Orienté objectifs et résolu, vous avez un talent naturel pour diriger une organisation et maximiser les résultats.',
      topCareers: ['PDG / dirigeant', 'Chef de projet', 'Avocat', 'Consultant en entreprise', 'Directeur financier'],
      workStyle: 'Vous menez l’équipe par des décisions rapides, fixez des standards élevés et visez les résultats.',
      idealEnvironment: 'Un environnement avec des objectifs ambitieux où exercer son leadership.',
      workStrengths: ['Leadership fort', 'Vision stratégique', 'Détermination', 'Maximisation des résultats'],
      workWeaknesses: ['Risque de négliger les émotions de l’équipe', 'Contrôle excessif', 'Manque de patience'],
      careerTip: 'Votre leadership est une force ; en développant l’écoute et l’empathie envers l’équipe, vous deviendrez un leader bien plus puissant.',
      avoidEnvironments: ['Les rôles passifs', 'Les environnements qui limitent la créativité', 'Les structures de décision lentes'],
    },
    es: {
      name: 'Líder audaz',
      careerDescription: 'Orientado a objetivos y decidido, tienes un talento natural para dirigir organizaciones y maximizar resultados.',
      topCareers: ['CEO / directivo', 'Jefe de proyecto', 'Abogado', 'Consultor de empresa', 'Director financiero'],
      workStyle: 'Guías al equipo con decisiones rápidas, fijas estándares altos y buscas resultados.',
      idealEnvironment: 'Un entorno con metas retadoras donde ejercer el liderazgo.',
      workStrengths: ['Liderazgo fuerte', 'Visión estratégica', 'Determinación', 'Maximización de resultados'],
      workWeaknesses: ['Puedes ignorar los sentimientos del equipo', 'Control excesivo', 'Falta de paciencia'],
      careerTip: 'Tu liderazgo es una fortaleza; si desarrollas la escucha y la empatía con el equipo, serás un líder mucho más fuerte.',
      avoidEnvironments: ['Roles pasivos', 'Entornos que limitan la creatividad', 'Estructuras de decisión lentas'],
    },
  },
  ENTP: {
    ko: {
      name: '혁신적 사상가',
      careerDescription: '기존 방식에 도전하고 새로운 아이디어를 제시합니다. 창의적 토론과 혁신을 즐깁니다.',
      topCareers: ['기업가/스타트업 창업자', '마케터', '변호사', '크리에이티브 디렉터', '제품 관리자'],
      workStyle: '아이디어를 빠르게 생성하고 다양한 관점을 탐색합니다. 틀에 얽매이지 않습니다.',
      idealEnvironment: '창의성과 토론이 장려되고 혁신이 가능한 환경.',
      workStrengths: ['창의적 문제 해결', '설득력', '아이디어 생성', '빠른 적응'],
      workWeaknesses: ['마무리 약함', '세부 실행 계획 부족', '일관성 유지 어려움'],
      careerTip: '아이디어를 실행으로 옮기는 역량 강화가 필요합니다. 완성의 기쁨을 경험할수록 더 큰 성공을 이룰 수 있습니다.',
      avoidEnvironments: ['단조로운 반복 작업', '엄격한 위계 구조', '변화가 없는 환경'],
    },
    en: {
      name: 'Innovative Thinker',
      careerDescription: 'Challenges existing methods and proposes new ideas. Enjoys creative debate and innovation.',
      topCareers: ['Entrepreneur/Startup Founder', 'Marketer', 'Lawyer', 'Creative Director', 'Product Manager'],
      workStyle: 'Rapidly generates ideas and explores diverse perspectives. Not bound by convention.',
      idealEnvironment: 'Environment where creativity and debate are encouraged and innovation is possible.',
      workStrengths: ['Creative problem solving', 'Persuasiveness', 'Idea generation', 'Quick adaptation'],
      workWeaknesses: ['Weak at follow-through', 'Lacks detailed execution plans', 'Difficulty maintaining consistency'],
      careerTip: 'Strengthen your ability to convert ideas into execution. The more you experience the joy of completion, the greater success you\'ll achieve.',
      avoidEnvironments: ['Monotonous repetitive tasks', 'Strict hierarchical structures', 'Environments resistant to change'],
    },
    ja: {
      name: '革新的思想家',
      careerDescription: '既存の方法に挑戦し新しいアイデアを提案します。創造的な討論と革新を楽しみます。',
      topCareers: ['起業家/スタートアップ創業者', 'マーケター', '弁護士', 'クリエイティブディレクター', 'プロダクトマネージャー'],
      workStyle: 'アイデアを素早く生成し、多様な観点を探索します。型にはまりません。',
      idealEnvironment: '創造性と討論が奨励され、革新が可能な環境。',
      workStrengths: ['創造的問題解決', '説得力', 'アイデア生成', '素早い適応'],
      workWeaknesses: ['締めくくりが弱い', '詳細な実行計画の欠如', '一貫性を保つのが難しい'],
      careerTip: 'アイデアを実行に移す能力を強化する必要があります。完成の喜びを経験するほど、より大きな成功を収めることができます。',
      avoidEnvironments: ['単調な繰り返し作業', '厳格な階層構造', '変化のない環境'],
    },
    zh: {
      name: '创新思想家',
      careerDescription: '挑战既有方式、提出新想法。享受有创意的讨论与创新。',
      topCareers: ['企业家/初创创始人', '营销人员', '律师', '创意总监', '产品经理'],
      workStyle: '快速产生想法、探索多元观点，不受框架束缚。',
      idealEnvironment: '鼓励创意与讨论、能实现创新的环境。',
      workStrengths: ['创意解决问题', '说服力', '产生点子', '快速适应'],
      workWeaknesses: ['收尾较弱', '缺乏具体执行计划', '难以保持一致'],
      careerTip: '需要加强把点子付诸实行的能力。越多体会完成的喜悦，就越能取得更大的成功。',
      avoidEnvironments: ['单调重复的工作', '严格的层级结构', '一成不变的环境'],
    },
    fr: {
      name: 'Penseur innovant',
      careerDescription: 'Vous remettez en cause les méthodes établies et proposez des idées neuves. Vous aimez les débats créatifs et l’innovation.',
      topCareers: ['Entrepreneur / fondateur de start-up', 'Marketeur', 'Avocat', 'Directeur de création', 'Chef de produit'],
      workStyle: 'Vous générez des idées rapidement et explorez de multiples points de vue, sans vous laisser enfermer dans un cadre.',
      idealEnvironment: 'Un environnement qui encourage créativité et débat, où l’innovation est possible.',
      workStrengths: ['Résolution créative de problèmes', 'Force de persuasion', 'Génération d’idées', 'Adaptation rapide'],
      workWeaknesses: ['Finition fragile', 'Manque de plan d’exécution détaillé', 'Difficulté à rester constant'],
      careerTip: 'Renforcez votre capacité à passer de l’idée à l’action. Plus vous goûterez la joie de terminer, plus vous réussirez.',
      avoidEnvironments: ['Les tâches monotones et répétitives', 'Les hiérarchies rigides', 'Les environnements sans changement'],
    },
    es: {
      name: 'Pensador innovador',
      careerDescription: 'Desafías los métodos establecidos y propones ideas nuevas. Disfrutas del debate creativo y la innovación.',
      topCareers: ['Emprendedor / fundador de startup', 'Profesional del marketing', 'Abogado', 'Director creativo', 'Product manager'],
      workStyle: 'Generas ideas con rapidez y exploras múltiples perspectivas sin atarte a moldes.',
      idealEnvironment: 'Un entorno que fomente la creatividad y el debate, donde la innovación sea posible.',
      workStrengths: ['Resolución creativa de problemas', 'Capacidad de persuasión', 'Generación de ideas', 'Adaptación rápida'],
      workWeaknesses: ['Te cuesta rematar', 'Falta de un plan de ejecución detallado', 'Dificultad para mantener la constancia'],
      careerTip: 'Necesitas reforzar la capacidad de llevar las ideas a la práctica. Cuanto más disfrutes de terminar, mayor será tu éxito.',
      avoidEnvironments: ['Tareas monótonas y repetitivas', 'Jerarquías rígidas', 'Entornos sin cambios'],
    },
  },
  INFJ: {
    ko: {
      name: '통찰력 있는 조언자',
      careerDescription: '깊은 통찰력으로 사람들을 돕고 의미 있는 변화를 만들어냅니다. 타인의 잠재력을 발견하는 탁월한 능력이 있습니다.',
      topCareers: ['상담사/심리치료사', '작가', '교육자', '사회복지사', 'HR 전문가'],
      workStyle: '의미 있는 일에 깊이 몰입하며, 사람들에게 긍정적 영향을 미치는 것을 목표로 합니다.',
      idealEnvironment: '가치와 목적이 일치하고 사람을 돕는 환경.',
      workStrengths: ['공감 능력', '통찰력', '의미 추구', '장기 비전'],
      workWeaknesses: ['번아웃 위험', '갈등 회피', '지나친 이상주의'],
      careerTip: '타인을 돕는 것이 특기이지만, 자신을 먼저 돌보는 것이 지속 가능한 성공의 기초입니다.',
      avoidEnvironments: ['가치와 충돌하는 환경', '극도로 경쟁적인 문화', '지나치게 실용적인 접근만 하는 곳'],
    },
    en: {
      name: 'Insightful Counselor',
      careerDescription: 'Helps people with deep insight and creates meaningful change. Has exceptional ability to discover others\' potential.',
      topCareers: ['Counselor/Psychotherapist', 'Writer', 'Educator', 'Social Worker', 'HR Professional'],
      workStyle: 'Deeply immerses in meaningful work, aiming to have a positive impact on people.',
      idealEnvironment: 'Environment aligned with values and purpose, focused on helping people.',
      workStrengths: ['Empathy', 'Insight', 'Pursuit of meaning', 'Long-term vision'],
      workWeaknesses: ['Risk of burnout', 'Conflict avoidance', 'Excessive idealism'],
      careerTip: 'Helping others is your specialty, but taking care of yourself first is the foundation of sustainable success.',
      avoidEnvironments: ['Environments conflicting with values', 'Extremely competitive cultures', 'Places with purely pragmatic approaches'],
    },
    ja: {
      name: '洞察力あるアドバイザー',
      careerDescription: '深い洞察力で人々を助け、意味ある変化を生み出します。他者の可能性を発見する卓越した能力があります。',
      topCareers: ['カウンセラー/心理療法士', '作家', '教育者', 'ソーシャルワーカー', 'HR専門家'],
      workStyle: '意味のある仕事に深く没入し、人々にポジティブな影響を与えることを目標とします。',
      idealEnvironment: '価値観と目的が一致し、人を助ける環境。',
      workStrengths: ['共感能力', '洞察力', '意味の追求', '長期ビジョン'],
      workWeaknesses: ['バーンアウトリスク', '葛藤回避', '過度な理想主義'],
      careerTip: '他者を助けることが得意ですが、まず自分を大切にすることが持続可能な成功の基礎です。',
      avoidEnvironments: ['価値観と衝突する環境', '極度に競争的な文化', '実用的なアプローチだけの場所'],
    },
    zh: {
      name: '富有洞察力的顾问',
      careerDescription: '以深刻的洞察帮助人、带来有意义的改变。有发现他人潜力的卓越能力。',
      topCareers: ['咨询师/心理治疗师', '作家', '教育工作者', '社会工作者', '人力资源专家'],
      workStyle: '深深投入有意义的工作，以给人正面影响为目标。',
      idealEnvironment: '价值与目标一致、能帮助人的环境。',
      workStrengths: ['共情能力', '洞察力', '追求意义', '长期愿景'],
      workWeaknesses: ['有倦怠风险', '回避冲突', '过度理想主义'],
      careerTip: '帮助别人是你的专长，但先照顾好自己，才是可持续成功的基础。',
      avoidEnvironments: ['与价值观冲突的环境', '极度竞争的文化', '只讲求实用的地方'],
    },
    fr: {
      name: 'Conseiller perspicace',
      careerDescription: 'Grâce à une intuition profonde, vous aidez les autres et suscitez des changements qui ont du sens. Vous savez remarquablement déceler le potentiel d’autrui.',
      topCareers: ['Conseiller / psychothérapeute', 'Écrivain', 'Enseignant', 'Travailleur social', 'Spécialiste RH'],
      workStyle: 'Vous vous investissez pleinement dans un travail qui a du sens, avec pour but d’avoir une influence positive.',
      idealEnvironment: 'Un environnement aligné sur vos valeurs, où l’on aide les gens.',
      workStrengths: ['Empathie', 'Perspicacité', 'Quête de sens', 'Vision à long terme'],
      workWeaknesses: ['Risque d’épuisement', 'Évitement des conflits', 'Idéalisme excessif'],
      careerTip: 'Aider les autres est votre talent, mais prendre soin de vous d’abord est la base d’une réussite durable.',
      avoidEnvironments: ['Les environnements contraires à vos valeurs', 'Les cultures ultra-compétitives', 'Les lieux purement utilitaristes'],
    },
    es: {
      name: 'Consejero perspicaz',
      careerDescription: 'Con una intuición profunda ayudas a las personas y generas cambios con sentido. Tienes un talento especial para descubrir el potencial ajeno.',
      topCareers: ['Orientador / psicoterapeuta', 'Escritor', 'Docente', 'Trabajador social', 'Especialista en RR. HH.'],
      workStyle: 'Te entregas a un trabajo con sentido, con el objetivo de influir positivamente en las personas.',
      idealEnvironment: 'Un entorno alineado con tus valores y propósito, donde se ayude a la gente.',
      workStrengths: ['Empatía', 'Perspicacia', 'Búsqueda de sentido', 'Visión a largo plazo'],
      workWeaknesses: ['Riesgo de agotamiento', 'Evitas los conflictos', 'Idealismo excesivo'],
      careerTip: 'Ayudar a los demás es tu especialidad, pero cuidarte primero es la base de un éxito sostenible.',
      avoidEnvironments: ['Entornos que chocan con tus valores', 'Culturas extremadamente competitivas', 'Lugares con un enfoque puramente práctico'],
    },
  },
  INFP: {
    ko: {
      name: '이상적인 창조자',
      careerDescription: '개인의 가치와 진정성을 중시하며 창의적 표현을 통해 세상에 기여합니다.',
      topCareers: ['작가/시인', '예술가/디자이너', '상담사', '사회 활동가', '교사'],
      workStyle: '자신의 가치와 일치하는 프로젝트에서 최고의 창의성을 발휘합니다.',
      idealEnvironment: '자율성과 창의적 자유가 보장되고 의미 있는 작업을 하는 환경.',
      workStrengths: ['창의성', '공감 능력', '진정성', '개인 가치 중심'],
      workWeaknesses: ['현실적 제약 무시', '비판에 민감', '완성도 집착으로 인한 지연'],
      careerTip: '창의성이 최대 강점이지만, 실용적 기술을 보완하면 더 큰 영향력을 발휘할 수 있습니다.',
      avoidEnvironments: ['가치와 상충하는 업무', '엄격한 위계질서', '창의성이 억압되는 환경'],
    },
    en: {
      name: 'Idealistic Creator',
      careerDescription: 'Values personal integrity and contributes to the world through creative expression.',
      topCareers: ['Writer/Poet', 'Artist/Designer', 'Counselor', 'Social Activist', 'Teacher'],
      workStyle: 'Shows greatest creativity in projects aligned with personal values.',
      idealEnvironment: 'Environment with autonomy, creative freedom, and meaningful work.',
      workStrengths: ['Creativity', 'Empathy', 'Authenticity', 'Values-centered approach'],
      workWeaknesses: ['Ignoring practical constraints', 'Sensitive to criticism', 'Delays from perfectionism'],
      careerTip: 'Creativity is your greatest strength, but supplementing with practical skills will multiply your impact.',
      avoidEnvironments: ['Work conflicting with values', 'Strict hierarchies', 'Environments suppressing creativity'],
    },
    ja: {
      name: '理想的なクリエイター',
      careerDescription: '個人の価値観と誠実さを重視し、創造的な表現を通じて世界に貢献します。',
      topCareers: ['作家/詩人', 'アーティスト/デザイナー', 'カウンセラー', '社会活動家', '教師'],
      workStyle: '個人の価値観と一致するプロジェクトで最大の創造性を発揮します。',
      idealEnvironment: '自律性と創造的自由が保証され、意味のある作業ができる環境。',
      workStrengths: ['創造性', '共感能力', '誠実さ', '個人の価値観中心'],
      workWeaknesses: ['現実的制約を無視', '批判に敏感', '完璧主義による遅延'],
      careerTip: '創造性が最大の強みですが、実用的なスキルを補うとより大きな影響力を発揮できます。',
      avoidEnvironments: ['価値観と相反する業務', '厳格な階層秩序', '創造性が抑圧される環境'],
    },
    zh: {
      name: '理想主义创造者',
      careerDescription: '重视个人价值与真诚，通过创意表达为世界做出贡献。',
      topCareers: ['作家/诗人', '艺术家/设计师', '咨询师', '社会活动家', '教师'],
      workStyle: '在与自身价值观一致的项目中，发挥最大的创造力。',
      idealEnvironment: '保障自主与创作自由、能做有意义工作的环境。',
      workStrengths: ['创造力', '共情能力', '真诚', '以个人价值为中心'],
      workWeaknesses: ['忽视现实限制', '对批评敏感', '执着于完成度而拖延'],
      careerTip: '创造力是你最大的优势，再补上实用技能，就能发挥更大的影响力。',
      avoidEnvironments: ['与价值观冲突的工作', '严格的上下级秩序', '压抑创造力的环境'],
    },
    fr: {
      name: 'Créateur idéaliste',
      careerDescription: 'Vous tenez à vos valeurs et à l’authenticité, et contribuez au monde par l’expression créative.',
      topCareers: ['Écrivain / poète', 'Artiste / designer', 'Conseiller', 'Militant associatif', 'Enseignant'],
      workStyle: 'Vous déployez toute votre créativité dans des projets alignés sur vos valeurs.',
      idealEnvironment: 'Un environnement d’autonomie et de liberté créative, avec un travail qui a du sens.',
      workStrengths: ['Créativité', 'Empathie', 'Authenticité', 'Centré sur ses valeurs'],
      workWeaknesses: ['Néglige les contraintes réelles', 'Sensibilité à la critique', 'Retards dus à la quête de perfection'],
      careerTip: 'La créativité est votre plus grande force ; en y ajoutant des compétences pratiques, votre influence grandira.',
      avoidEnvironments: ['Les tâches contraires à vos valeurs', 'Les hiérarchies strictes', 'Les environnements qui étouffent la créativité'],
    },
    es: {
      name: 'Creador idealista',
      careerDescription: 'Valoras tus principios y la autenticidad, y contribuyes al mundo a través de la expresión creativa.',
      topCareers: ['Escritor / poeta', 'Artista / diseñador', 'Orientador', 'Activista social', 'Docente'],
      workStyle: 'Das lo mejor de tu creatividad en proyectos alineados con tus valores.',
      idealEnvironment: 'Un entorno con autonomía y libertad creativa, con un trabajo que tenga sentido.',
      workStrengths: ['Creatividad', 'Empatía', 'Autenticidad', 'Centrado en tus valores'],
      workWeaknesses: ['Ignoras las limitaciones reales', 'Sensibilidad a la crítica', 'Retrasos por obsesión con el acabado'],
      careerTip: 'La creatividad es tu mayor fortaleza; si la completas con habilidades prácticas, tendrás más influencia.',
      avoidEnvironments: ['Tareas que chocan con tus valores', 'Jerarquías estrictas', 'Entornos que reprimen la creatividad'],
    },
  },
  ENFJ: {
    ko: {
      name: '카리스마 있는 교육자',
      careerDescription: '사람들을 감화시키고 성장을 이끄는 뛰어난 능력이 있습니다. 팀의 잠재력을 최대한 끌어냅니다.',
      topCareers: ['교사/교수', '코치/멘토', '인사 담당자', '비영리 단체 리더', '커뮤니케이션 전문가'],
      workStyle: '사람들과 깊이 연결되며 팀의 성장과 화합을 중시합니다.',
      idealEnvironment: '사람들과 협력하며 의미 있는 변화를 만드는 환경.',
      workStrengths: ['리더십', '공감 능력', '의사소통', '팀 동기 부여'],
      workWeaknesses: ['자신의 필요 무시', '갈등 회피', '타인의 감정에 지나치게 영향받음'],
      careerTip: '다른 사람을 이끄는 능력은 탁월하지만, 자신의 경계를 설정하고 자기 자신을 돌보는 것도 중요합니다.',
      avoidEnvironments: ['고립된 작업', '경쟁 중심 문화', '인간관계가 없는 환경'],
    },
    en: {
      name: 'Charismatic Educator',
      careerDescription: 'Has exceptional ability to inspire and lead people\'s growth. Maximizes team potential.',
      topCareers: ['Teacher/Professor', 'Coach/Mentor', 'HR Manager', 'Non-profit Leader', 'Communications Expert'],
      workStyle: 'Connects deeply with people and values team growth and harmony.',
      idealEnvironment: 'Environment creating meaningful change through collaboration with people.',
      workStrengths: ['Leadership', 'Empathy', 'Communication', 'Team motivation'],
      workWeaknesses: ['Ignores own needs', 'Avoids conflict', 'Overly influenced by others\' emotions'],
      careerTip: 'Your ability to lead others is exceptional, but setting personal boundaries and self-care is equally important.',
      avoidEnvironments: ['Isolated work', 'Competition-focused culture', 'Environments without human connection'],
    },
    ja: {
      name: 'カリスマ的教育者',
      careerDescription: '人々を感化させ、成長を導く卓越した能力があります。チームの潜在力を最大限に引き出します。',
      topCareers: ['教師/教授', 'コーチ/メンター', '人事担当者', '非営利団体リーダー', 'コミュニケーション専門家'],
      workStyle: '人々と深くつながり、チームの成長と調和を重視します。',
      idealEnvironment: '人々と協力して意味のある変化を作る環境。',
      workStrengths: ['リーダーシップ', '共感能力', 'コミュニケーション', 'チームの動機付け'],
      workWeaknesses: ['自分のニーズを無視', '葛藤回避', '他者の感情に過度に影響される'],
      careerTip: '人を率いる能力は卓越していますが、自分の境界を設定し、自己ケアも重要です。',
      avoidEnvironments: ['孤立した作業', '競争中心の文化', '人間関係のない環境'],
    },
    zh: {
      name: '有魅力的教育者',
      careerDescription: '有感化他人、引领成长的出色能力，能把团队的潜力发挥到极致。',
      topCareers: ['教师/教授', '教练/导师', '人事负责人', '非营利组织领导者', '沟通专家'],
      workStyle: '和人深度连结，重视团队的成长与和谐。',
      idealEnvironment: '和人合作、创造有意义改变的环境。',
      workStrengths: ['领导力', '共情能力', '沟通', '激励团队'],
      workWeaknesses: ['忽略自己的需要', '回避冲突', '过度受他人情绪影响'],
      careerTip: '你带领他人的能力很出色，但设定自己的界限、照顾好自己也很重要。',
      avoidEnvironments: ['孤立的工作', '以竞争为中心的文化', '没有人际关系的环境'],
    },
    fr: {
      name: 'Éducateur charismatique',
      careerDescription: 'Vous avez un talent remarquable pour inspirer les gens et les faire grandir. Vous tirez le meilleur du potentiel d’une équipe.',
      topCareers: ['Enseignant / professeur', 'Coach / mentor', 'Responsable RH', 'Dirigeant d’association', 'Spécialiste de la communication'],
      workStyle: 'Vous créez des liens profonds et tenez à la croissance et à l’harmonie de l’équipe.',
      idealEnvironment: 'Un environnement où l’on collabore avec les gens pour créer un changement qui a du sens.',
      workStrengths: ['Leadership', 'Empathie', 'Communication', 'Motivation de l’équipe'],
      workWeaknesses: ['Néglige ses propres besoins', 'Évitement des conflits', 'Trop influencé par les émotions des autres'],
      careerTip: 'Votre capacité à entraîner les autres est remarquable, mais poser vos limites et prendre soin de vous compte aussi.',
      avoidEnvironments: ['Le travail isolé', 'Les cultures axées sur la compétition', 'Les environnements sans relations humaines'],
    },
    es: {
      name: 'Educador carismático',
      careerDescription: 'Tienes un gran talento para inspirar a las personas y guiar su crecimiento. Sacas lo mejor del potencial del equipo.',
      topCareers: ['Docente / profesor', 'Coach / mentor', 'Responsable de RR. HH.', 'Líder de una ONG', 'Especialista en comunicación'],
      workStyle: 'Conectas a fondo con las personas y valoras el crecimiento y la armonía del equipo.',
      idealEnvironment: 'Un entorno donde colaborar con la gente para crear cambios con sentido.',
      workStrengths: ['Liderazgo', 'Empatía', 'Comunicación', 'Motivación del equipo'],
      workWeaknesses: ['Ignoras tus propias necesidades', 'Evitas los conflictos', 'Te afectan demasiado las emociones ajenas'],
      careerTip: 'Tu capacidad de guiar a otros es excelente, pero también es importante poner límites y cuidarte.',
      avoidEnvironments: ['Trabajo aislado', 'Culturas centradas en la competencia', 'Entornos sin relaciones humanas'],
    },
  },
  ENFP: {
    ko: {
      name: '열정적인 활동가',
      careerDescription: '창의성과 열정으로 사람들을 영감시킵니다. 다양한 가능성을 탐색하며 세상을 더 나은 곳으로 만듭니다.',
      topCareers: ['마케터', '저널리스트', '기업가', '크리에이터/콘텐츠 제작자', '상담사'],
      workStyle: '열정적으로 아이디어를 추구하며, 다양한 사람들과 에너지를 교환합니다.',
      idealEnvironment: '창의성과 다양성이 존중되고 사람들과 활발히 교류할 수 있는 환경.',
      workStrengths: ['창의성', '열정', '대인 관계', '영감 제공'],
      workWeaknesses: ['집중력 유지 어려움', '세부 실행 약함', '감정적 결정'],
      careerTip: '열정이 최대 강점이지만, 한 가지에 집중하고 마무리하는 능력을 키우면 훨씬 큰 성과를 낼 수 있습니다.',
      avoidEnvironments: ['단조롭고 반복적인 업무', '창의성 없는 환경', '지나치게 경직된 구조'],
    },
    en: {
      name: 'Enthusiastic Activist',
      careerDescription: 'Inspires people with creativity and passion. Explores diverse possibilities to make the world a better place.',
      topCareers: ['Marketer', 'Journalist', 'Entrepreneur', 'Creator/Content Producer', 'Counselor'],
      workStyle: 'Passionately pursues ideas and exchanges energy with diverse people.',
      idealEnvironment: 'Environment valuing creativity and diversity, with active interaction with people.',
      workStrengths: ['Creativity', 'Passion', 'Interpersonal skills', 'Inspiring others'],
      workWeaknesses: ['Difficulty maintaining focus', 'Weak at detailed execution', 'Emotional decision-making'],
      careerTip: 'Passion is your greatest strength, but developing the ability to focus on one thing and follow through will produce much greater results.',
      avoidEnvironments: ['Monotonous and repetitive tasks', 'Environments without creativity', 'Overly rigid structures'],
    },
    ja: {
      name: '情熱的な活動家',
      careerDescription: '創造性と情熱で人々にインスピレーションを与えます。様々な可能性を探求して世界をより良い場所にします。',
      topCareers: ['マーケター', 'ジャーナリスト', '起業家', 'クリエイター/コンテンツ制作者', 'カウンセラー'],
      workStyle: '情熱的にアイデアを追求し、多様な人々とエネルギーを交換します。',
      idealEnvironment: '創造性と多様性が尊重され、人々と活発に交流できる環境。',
      workStrengths: ['創造性', '情熱', '対人関係', 'インスピレーション提供'],
      workWeaknesses: ['集中力の維持が難しい', '詳細な実行が弱い', '感情的な意思決定'],
      careerTip: '情熱が最大の強みですが、一つのことに集中して仕上げる能力を伸ばすと、はるかに大きな成果が得られます。',
      avoidEnvironments: ['単調で繰り返しの多い業務', '創造性のない環境', '過度に硬直した構造'],
    },
    zh: {
      name: '热情的活动家',
      careerDescription: '以创意和热情激励人。探索多种可能，让世界变得更好。',
      topCareers: ['营销人员', '记者', '企业家', '创作者/内容制作人', '咨询师'],
      workStyle: '热情地追求想法，和各种各样的人交换能量。',
      idealEnvironment: '尊重创意与多样性、能和人热络交流的环境。',
      workStrengths: ['创造力', '热情', '人际关系', '给人灵感'],
      workWeaknesses: ['难以保持专注', '具体执行较弱', '情绪化决定'],
      careerTip: '热情是你最大的优势，若培养专注于一件事并完成的能力，就能取得更大的成果。',
      avoidEnvironments: ['单调重复的工作', '没有创意的环境', '过度僵化的结构'],
    },
    fr: {
      name: 'Militant enthousiaste',
      careerDescription: 'Par votre créativité et votre passion, vous inspirez les autres. Vous explorez de multiples possibilités pour rendre le monde meilleur.',
      topCareers: ['Marketeur', 'Journaliste', 'Entrepreneur', 'Créateur de contenu', 'Conseiller'],
      workStyle: 'Vous poursuivez vos idées avec passion et échangez de l’énergie avec des gens très variés.',
      idealEnvironment: 'Un environnement qui respecte créativité et diversité, avec beaucoup d’échanges.',
      workStrengths: ['Créativité', 'Passion', 'Relations humaines', 'Source d’inspiration'],
      workWeaknesses: ['Difficulté à rester concentré', 'Faible sur l’exécution détaillée', 'Décisions émotionnelles'],
      careerTip: 'La passion est votre plus grande force ; en apprenant à vous concentrer sur une chose et à la terminer, vous obtiendrez bien plus.',
      avoidEnvironments: ['Les tâches monotones et répétitives', 'Les environnements sans créativité', 'Les structures trop rigides'],
    },
    es: {
      name: 'Activista entusiasta',
      careerDescription: 'Inspiras a la gente con creatividad y pasión. Exploras múltiples posibilidades para hacer del mundo un lugar mejor.',
      topCareers: ['Profesional del marketing', 'Periodista', 'Emprendedor', 'Creador de contenido', 'Orientador'],
      workStyle: 'Persigues tus ideas con pasión e intercambias energía con personas muy diversas.',
      idealEnvironment: 'Un entorno que respete la creatividad y la diversidad, con mucho trato con la gente.',
      workStrengths: ['Creatividad', 'Pasión', 'Relaciones personales', 'Inspirar a otros'],
      workWeaknesses: ['Te cuesta mantener la concentración', 'Flojo en la ejecución de detalles', 'Decisiones emocionales'],
      careerTip: 'La pasión es tu mayor fortaleza; si aprendes a centrarte en una cosa y terminarla, lograrás mucho más.',
      avoidEnvironments: ['Tareas monótonas y repetitivas', 'Entornos sin creatividad', 'Estructuras demasiado rígidas'],
    },
  },
  ISTJ: {
    ko: {
      name: '신뢰할 수 있는 실무자',
      careerDescription: '책임감 있고 꼼꼼하며 체계적으로 일을 처리합니다. 신뢰와 안정성을 기반으로 조직에 크게 기여합니다.',
      topCareers: ['회계사/세무사', '공무원', '프로젝트 매니저', '품질 관리 전문가', '의사/간호사'],
      workStyle: '명확한 역할과 책임 속에서 체계적이고 꼼꼼하게 업무를 수행합니다.',
      idealEnvironment: '안정적이고 예측 가능한 환경, 명확한 규칙과 절차가 있는 곳.',
      workStrengths: ['신뢰성', '꼼꼼함', '책임감', '체계적 업무 처리'],
      workWeaknesses: ['변화에 느린 적응', '혁신보다 전통 선호', '지나친 규칙 의존'],
      careerTip: '탁월한 실무 능력을 가지고 있습니다. 변화와 혁신에 조금 더 열린 자세를 취하면 더 큰 기회를 잡을 수 있습니다.',
      avoidEnvironments: ['불안정하고 예측 불가능한 환경', '지속적인 변화를 요구하는 곳', '구조 없는 자유로운 환경'],
    },
    en: {
      name: 'Reliable Practitioner',
      careerDescription: 'Responsible, meticulous, and systematic. Makes major contributions to organizations based on trust and stability.',
      topCareers: ['Accountant/Tax Specialist', 'Civil Servant', 'Project Manager', 'Quality Control Expert', 'Doctor/Nurse'],
      workStyle: 'Performs tasks systematically and meticulously within clear roles and responsibilities.',
      idealEnvironment: 'Stable, predictable environment with clear rules and procedures.',
      workStrengths: ['Reliability', 'Meticulousness', 'Responsibility', 'Systematic task management'],
      workWeaknesses: ['Slow to adapt to change', 'Prefers tradition over innovation', 'Excessive rule dependence'],
      careerTip: 'You have exceptional practical abilities. Being more open to change and innovation will help you seize greater opportunities.',
      avoidEnvironments: ['Unstable, unpredictable environments', 'Places requiring constant change', 'Unstructured free-form environments'],
    },
    ja: {
      name: '信頼できる実務者',
      careerDescription: '責任感があり、几帳面で体系的に仕事を処理します。信頼と安定性をもとに組織に大きく貢献します。',
      topCareers: ['会計士/税理士', '公務員', 'プロジェクトマネージャー', '品質管理専門家', '医師/看護師'],
      workStyle: '明確な役割と責任の中で体系的かつ几帳面に業務を遂行します。',
      idealEnvironment: '安定していて予測可能な環境、明確なルールと手順がある場所。',
      workStrengths: ['信頼性', '几帳面さ', '責任感', '体系的な業務処理'],
      workWeaknesses: ['変化への適応が遅い', '革新より伝統を好む', '過度なルール依存'],
      careerTip: '卓越した実務能力を持っています。変化と革新にもう少しオープンな姿勢をとると、より大きなチャンスをつかめます。',
      avoidEnvironments: ['不安定で予測不可能な環境', '継続的な変化を要求する場所', '構造のない自由な環境'],
    },
    zh: {
      name: '可靠的实务者',
      careerDescription: '有责任感、细心、有条理地处理事情。以信任与稳定为基础，为组织做出重大贡献。',
      topCareers: ['会计师/税务师', '公务员', '项目经理', '品质管理专家', '医生/护士'],
      workStyle: '在明确的角色与责任中，有系统、细致地完成工作。',
      idealEnvironment: '稳定、可预测，有明确规则和程序的环境。',
      workStrengths: ['可靠', '细致', '责任感', '有条理地处理工作'],
      workWeaknesses: ['适应变化较慢', '比起创新更偏好传统', '过度依赖规则'],
      careerTip: '你有出色的实务能力。对变化和创新再开放一点，就能抓住更大的机会。',
      avoidEnvironments: ['不稳定、无法预测的环境', '要求持续变化的地方', '没有结构的自由环境'],
    },
    fr: {
      name: 'Praticien fiable',
      careerDescription: 'Responsable, minutieux et méthodique, vous contribuez beaucoup à l’organisation grâce à la confiance et à la stabilité.',
      topCareers: ['Comptable / fiscaliste', 'Fonctionnaire', 'Chef de projet', 'Spécialiste qualité', 'Médecin / infirmier'],
      workStyle: 'Vous travaillez avec méthode et minutie dans un cadre de rôles et responsabilités clairs.',
      idealEnvironment: 'Un environnement stable et prévisible, avec des règles et procédures claires.',
      workStrengths: ['Fiabilité', 'Minutie', 'Sens des responsabilités', 'Travail méthodique'],
      workWeaknesses: ['S’adapte lentement au changement', 'Préfère la tradition à l’innovation', 'Dépendance excessive aux règles'],
      careerTip: 'Vous avez d’excellentes compétences pratiques. En vous ouvrant un peu plus au changement et à l’innovation, vous saisirez de plus grandes occasions.',
      avoidEnvironments: ['Les environnements instables et imprévisibles', 'Les lieux qui exigent un changement permanent', 'Les environnements libres sans structure'],
    },
    es: {
      name: 'Profesional fiable',
      careerDescription: 'Responsable, minucioso y metódico, contribuyes mucho a la organización gracias a la confianza y la estabilidad.',
      topCareers: ['Contable / asesor fiscal', 'Funcionario', 'Jefe de proyecto', 'Especialista en calidad', 'Médico / enfermero'],
      workStyle: 'Trabajas con método y minuciosidad dentro de roles y responsabilidades claros.',
      idealEnvironment: 'Un entorno estable y previsible, con normas y procedimientos claros.',
      workStrengths: ['Fiabilidad', 'Minuciosidad', 'Responsabilidad', 'Trabajo metódico'],
      workWeaknesses: ['Te adaptas despacio al cambio', 'Prefieres la tradición a la innovación', 'Dependencia excesiva de las normas'],
      careerTip: 'Tienes una gran capacidad práctica. Si te abres un poco más al cambio y la innovación, podrás aprovechar mayores oportunidades.',
      avoidEnvironments: ['Entornos inestables e imprevisibles', 'Lugares que exigen cambios continuos', 'Entornos libres sin estructura'],
    },
  },
  ISFJ: {
    ko: {
      name: '헌신적인 보호자',
      careerDescription: '다른 사람을 돕고 지원하는 것에서 큰 의미를 찾습니다. 온화하고 꼼꼼하며 헌신적입니다.',
      topCareers: ['간호사', '사회복지사', '초등학교 교사', '행정 전문가', '상담사'],
      workStyle: '팀의 필요에 세심하게 반응하며, 배경에서 조용히 하지만 중요한 역할을 담당합니다.',
      idealEnvironment: '사람을 직접 돕고, 안정적이며 조화로운 환경.',
      workStrengths: ['공감 능력', '세심함', '신뢰성', '팀 지원'],
      workWeaknesses: ['자기 주장 부족', '변화 적응 어려움', '과도한 자기 희생'],
      careerTip: '다른 사람을 잘 돌보는 당신, 자신의 필요와 경계도 소중히 여기는 것을 잊지 마세요.',
      avoidEnvironments: ['갈등이 잦은 환경', '지나치게 경쟁적인 문화', '인간관계가 없는 고립된 작업'],
    },
    en: {
      name: 'Devoted Protector',
      careerDescription: 'Finds deep meaning in helping and supporting others. Warm, meticulous, and dedicated.',
      topCareers: ['Nurse', 'Social Worker', 'Elementary School Teacher', 'Administrative Professional', 'Counselor'],
      workStyle: 'Responds sensitively to team needs, playing quiet but important roles behind the scenes.',
      idealEnvironment: 'Directly helping people in a stable, harmonious environment.',
      workStrengths: ['Empathy', 'Sensitivity', 'Reliability', 'Team support'],
      workWeaknesses: ['Lack of assertiveness', 'Difficulty adapting to change', 'Excessive self-sacrifice'],
      careerTip: 'You care well for others — don\'t forget to also value your own needs and boundaries.',
      avoidEnvironments: ['Conflict-prone environments', 'Overly competitive cultures', 'Isolated work without human connection'],
    },
    ja: {
      name: '献身的な保護者',
      careerDescription: '他者を助け、支援することに深い意義を見出します。温かく、几帳面で、献身的です。',
      topCareers: ['看護師', 'ソーシャルワーカー', '小学校教師', '行政専門家', 'カウンセラー'],
      workStyle: 'チームのニーズに細やかに対応し、陰ながら重要な役割を担います。',
      idealEnvironment: '人を直接助け、安定していて調和のある環境。',
      workStrengths: ['共感能力', '細やかさ', '信頼性', 'チームサポート'],
      workWeaknesses: ['自己主張の欠如', '変化への適応が難しい', '過度な自己犠牲'],
      careerTip: '他者をよく気遣うあなた、自分のニーズと境界も大切にすることを忘れないでください。',
      avoidEnvironments: ['葛藤が多い環境', '過度に競争的な文化', '人間関係のない孤立した作業'],
    },
    zh: {
      name: '尽心的守护者',
      careerDescription: '在帮助、支持别人中找到很大的意义。温和、细心而尽心尽力。',
      topCareers: ['护士', '社会工作者', '小学教师', '行政专家', '咨询师'],
      workStyle: '细心回应团队的需要，在幕后安静地扮演重要角色。',
      idealEnvironment: '能直接帮助人、稳定而和谐的环境。',
      workStrengths: ['共情能力', '细心', '可靠', '支持团队'],
      workWeaknesses: ['自我主张不足', '难以适应变化', '过度自我牺牲'],
      careerTip: '善于照顾别人的你，也别忘了珍惜自己的需要与界限。',
      avoidEnvironments: ['冲突频繁的环境', '过度竞争的文化', '没有人际关系的孤立工作'],
    },
    fr: {
      name: 'Protecteur dévoué',
      careerDescription: 'Vous trouvez beaucoup de sens à aider et soutenir les autres. Doux, minutieux et dévoué.',
      topCareers: ['Infirmier', 'Travailleur social', 'Professeur des écoles', 'Spécialiste administratif', 'Conseiller'],
      workStyle: 'Attentif aux besoins de l’équipe, vous jouez en coulisse un rôle discret mais essentiel.',
      idealEnvironment: 'Un environnement stable et harmonieux où l’on aide directement les gens.',
      workStrengths: ['Empathie', 'Attention aux détails', 'Fiabilité', 'Soutien à l’équipe'],
      workWeaknesses: ['Manque d’affirmation de soi', 'Difficulté à s’adapter au changement', 'Excès d’abnégation'],
      careerTip: 'Vous prenez si bien soin des autres ; n’oubliez pas de respecter aussi vos propres besoins et limites.',
      avoidEnvironments: ['Les environnements conflictuels', 'Les cultures trop compétitives', 'Le travail isolé sans relations humaines'],
    },
    es: {
      name: 'Protector entregado',
      careerDescription: 'Encuentras mucho sentido en ayudar y apoyar a los demás. Eres amable, minucioso y entregado.',
      topCareers: ['Enfermero', 'Trabajador social', 'Maestro de primaria', 'Especialista administrativo', 'Orientador'],
      workStyle: 'Atento a las necesidades del equipo, desempeñas entre bastidores un papel discreto pero clave.',
      idealEnvironment: 'Un entorno estable y armonioso donde ayudar directamente a las personas.',
      workStrengths: ['Empatía', 'Atención al detalle', 'Fiabilidad', 'Apoyo al equipo'],
      workWeaknesses: ['Poca asertividad', 'Te cuesta adaptarte al cambio', 'Sacrificio personal excesivo'],
      careerTip: 'Cuidas muy bien de los demás; no olvides valorar también tus propias necesidades y límites.',
      avoidEnvironments: ['Entornos con conflictos frecuentes', 'Culturas demasiado competitivas', 'Trabajo aislado sin relaciones humanas'],
    },
  },
  ESTJ: {
    ko: {
      name: '효율적인 관리자',
      careerDescription: '체계와 질서를 유지하며 팀을 효율적으로 운영합니다. 목표 달성에 강한 의지와 실행력을 보입니다.',
      topCareers: ['관리자/매니저', '군 장교', '법률가', '재무 관리자', '운영 디렉터'],
      workStyle: '명확한 목표와 기준을 설정하고 팀이 이를 달성하도록 이끕니다.',
      idealEnvironment: '명확한 위계와 역할이 있고 성과가 인정받는 환경.',
      workStrengths: ['조직력', '실행력', '리더십', '문제 해결'],
      workWeaknesses: ['유연성 부족', '감정보다 논리 우선', '변화에 저항'],
      careerTip: '탁월한 관리 능력을 가지고 있습니다. 팀원의 감정과 상황을 더 세심히 배려하면 더욱 강력한 리더가 됩니다.',
      avoidEnvironments: ['모호하고 비구조적인 환경', '일관성 없는 기준', '잦은 방향 전환'],
    },
    en: {
      name: 'Efficient Administrator',
      careerDescription: 'Maintains order and runs teams efficiently. Shows strong will and execution in achieving goals.',
      topCareers: ['Manager/Administrator', 'Military Officer', 'Lawyer', 'Finance Manager', 'Operations Director'],
      workStyle: 'Sets clear goals and standards, leading teams to achieve them.',
      idealEnvironment: 'Environment with clear hierarchy, roles, and recognized performance.',
      workStrengths: ['Organization', 'Execution', 'Leadership', 'Problem solving'],
      workWeaknesses: ['Lack of flexibility', 'Logic over emotions', 'Resistance to change'],
      careerTip: 'You have exceptional management abilities. Being more mindful of team members\' emotions and circumstances will make you an even stronger leader.',
      avoidEnvironments: ['Ambiguous, unstructured environments', 'Inconsistent standards', 'Frequent changes in direction'],
    },
    ja: {
      name: '効率的な管理者',
      careerDescription: '体系と秩序を維持してチームを効率的に運営します。目標達成に強い意志と実行力を示します。',
      topCareers: ['マネージャー/管理者', '軍将校', '法律家', '財務マネージャー', '運営ディレクター'],
      workStyle: '明確な目標と基準を設定し、チームがそれを達成するよう導きます。',
      idealEnvironment: '明確な階層と役割があり、成果が認められる環境。',
      workStrengths: ['組織力', '実行力', 'リーダーシップ', '問題解決'],
      workWeaknesses: ['柔軟性の欠如', '感情より論理優先', '変化への抵抗'],
      careerTip: '卓越した管理能力を持っています。チームメンバーの感情と状況をより細やかに配慮すると、さらに強力なリーダーになれます。',
      avoidEnvironments: ['曖昧で非構造的な環境', '一貫性のない基準', '頻繁な方向転換'],
    },
    zh: {
      name: '高效的管理者',
      careerDescription: '维持体系与秩序，高效地运营团队。对达成目标有强烈的意志与执行力。',
      topCareers: ['管理者/经理', '军官', '法律工作者', '财务经理', '运营总监'],
      workStyle: '设定明确的目标和标准，带领团队达成。',
      idealEnvironment: '有明确层级与角色、成果会被认可的环境。',
      workStrengths: ['组织力', '执行力', '领导力', '解决问题'],
      workWeaknesses: ['缺乏弹性', '理性优先于情感', '抗拒变化'],
      careerTip: '你有出色的管理能力。更细心地体谅队员的感受和处境，会成为更强大的领导者。',
      avoidEnvironments: ['模糊、缺乏结构的环境', '标准不一致', '方向频繁改变'],
    },
    fr: {
      name: 'Gestionnaire efficace',
      careerDescription: 'Vous maintenez structure et ordre et gérez l’équipe efficacement. Vous montrez une forte volonté et une grande capacité d’exécution pour atteindre les objectifs.',
      topCareers: ['Manager', 'Officier militaire', 'Juriste', 'Responsable financier', 'Directeur des opérations'],
      workStyle: 'Vous fixez des objectifs et des critères clairs et menez l’équipe à les atteindre.',
      idealEnvironment: 'Un environnement avec une hiérarchie et des rôles clairs, où les résultats sont reconnus.',
      workStrengths: ['Sens de l’organisation', 'Capacité d’exécution', 'Leadership', 'Résolution de problèmes'],
      workWeaknesses: ['Manque de souplesse', 'La logique avant les émotions', 'Résistance au changement'],
      careerTip: 'Vous êtes un excellent gestionnaire. En tenant davantage compte des émotions et de la situation de l’équipe, vous deviendrez un leader encore plus fort.',
      avoidEnvironments: ['Les environnements flous et peu structurés', 'Les critères incohérents', 'Les changements de cap fréquents'],
    },
    es: {
      name: 'Gestor eficiente',
      careerDescription: 'Mantienes el orden y la estructura y diriges el equipo con eficacia. Muestras una gran voluntad y capacidad de ejecución para alcanzar metas.',
      topCareers: ['Gerente / mánager', 'Oficial militar', 'Jurista', 'Responsable financiero', 'Director de operaciones'],
      workStyle: 'Fijas objetivos y criterios claros y guías al equipo para cumplirlos.',
      idealEnvironment: 'Un entorno con jerarquía y roles claros donde se reconozcan los resultados.',
      workStrengths: ['Capacidad de organización', 'Capacidad de ejecución', 'Liderazgo', 'Resolución de problemas'],
      workWeaknesses: ['Falta de flexibilidad', 'La lógica antes que las emociones', 'Resistencia al cambio'],
      careerTip: 'Tienes una gran capacidad de gestión. Si tienes más en cuenta los sentimientos y la situación del equipo, serás un líder aún más fuerte.',
      avoidEnvironments: ['Entornos ambiguos y poco estructurados', 'Criterios incoherentes', 'Cambios de rumbo frecuentes'],
    },
  },
  ESFJ: {
    ko: {
      name: '따뜻한 외교관',
      careerDescription: '사람들을 돌보고 화합을 이끄는 것을 즐깁니다. 팀의 분위기와 인간관계를 긍정적으로 만드는 특별한 재능이 있습니다.',
      topCareers: ['의료 전문가', '교사', '이벤트 플래너', '고객 서비스 매니저', '인사 담당자'],
      workStyle: '사람들과 긴밀히 협력하며 팀의 화합과 모두의 필요를 충족시킵니다.',
      idealEnvironment: '따뜻하고 협력적인 팀 환경, 사람들과 직접 소통할 수 있는 곳.',
      workStrengths: ['대인 관계', '팀워크', '배려심', '화합 촉진'],
      workWeaknesses: ['갈등 회피', '비판에 민감', '자기 필요 무시'],
      careerTip: '사람들을 돌보는 뛰어난 능력을 가지고 있습니다. 가끔은 자신의 필요와 의견을 먼저 내세우는 연습이 필요합니다.',
      avoidEnvironments: ['고립된 작업', '갈등이 많은 환경', '인간관계가 없는 곳'],
    },
    en: {
      name: 'Warm Diplomat',
      careerDescription: 'Enjoys caring for people and fostering harmony. Has a special talent for positively shaping team atmosphere and relationships.',
      topCareers: ['Healthcare Professional', 'Teacher', 'Event Planner', 'Customer Service Manager', 'HR Professional'],
      workStyle: 'Closely collaborates with people, fulfilling team harmony and everyone\'s needs.',
      idealEnvironment: 'Warm, collaborative team environment where direct communication with people is possible.',
      workStrengths: ['Interpersonal skills', 'Teamwork', 'Caring nature', 'Harmony promotion'],
      workWeaknesses: ['Conflict avoidance', 'Sensitive to criticism', 'Ignores own needs'],
      careerTip: 'You have outstanding ability to care for people. Practice occasionally prioritizing your own needs and opinions.',
      avoidEnvironments: ['Isolated work', 'Conflict-ridden environments', 'Places without human connection'],
    },
    ja: {
      name: '温かい外交官',
      careerDescription: '人々を気遣い、調和を促すことを楽しみます。チームの雰囲気と人間関係をポジティブにする特別な才能があります。',
      topCareers: ['医療専門家', '教師', 'イベントプランナー', 'カスタマーサービスマネージャー', '人事担当者'],
      workStyle: '人々と緊密に協力し、チームの調和とみんなのニーズを満たします。',
      idealEnvironment: '温かく協力的なチーム環境、人々と直接コミュニケーションできる場所。',
      workStrengths: ['対人関係', 'チームワーク', '思いやり', '調和の促進'],
      workWeaknesses: ['葛藤回避', '批判に敏感', '自分のニーズを無視'],
      careerTip: '人々を気遣う卓越した能力があります。時には自分のニーズと意見を先に出す練習が必要です。',
      avoidEnvironments: ['孤立した作業', '葛藤の多い環境', '人間関係のない場所'],
    },
    zh: {
      name: '温暖的外交家',
      careerDescription: '喜欢照顾人、促成和谐。有让团队气氛与人际关系变得正向的特别才能。',
      topCareers: ['医疗专业人员', '教师', '活动策划', '客户服务经理', '人事负责人'],
      workStyle: '和人紧密合作，满足团队的和谐与每个人的需要。',
      idealEnvironment: '温暖协作的团队环境，能直接和人沟通的地方。',
      workStrengths: ['人际关系', '团队合作', '体贴', '促进和谐'],
      workWeaknesses: ['回避冲突', '对批评敏感', '忽略自己的需要'],
      careerTip: '你有照顾人的出色能力。偶尔也需要练习先提出自己的需要和意见。',
      avoidEnvironments: ['孤立的工作', '冲突多的环境', '没有人际关系的地方'],
    },
    fr: {
      name: 'Diplomate chaleureux',
      careerDescription: 'Vous aimez prendre soin des gens et favoriser l’harmonie. Vous avez un talent particulier pour rendre positifs l’ambiance d’équipe et les relations.',
      topCareers: ['Professionnel de santé', 'Enseignant', 'Organisateur d’événements', 'Responsable du service client', 'Responsable RH'],
      workStyle: 'Vous collaborez étroitement avec les autres et veillez à l’harmonie de l’équipe et aux besoins de chacun.',
      idealEnvironment: 'Une équipe chaleureuse et coopérative, où l’on échange directement avec les gens.',
      workStrengths: ['Relations humaines', 'Esprit d’équipe', 'Attention aux autres', 'Favorise l’harmonie'],
      workWeaknesses: ['Évitement des conflits', 'Sensibilité à la critique', 'Néglige ses propres besoins'],
      careerTip: 'Vous savez remarquablement prendre soin des autres. Entraînez-vous parfois à faire passer vos besoins et vos avis en premier.',
      avoidEnvironments: ['Le travail isolé', 'Les environnements conflictuels', 'Les lieux sans relations humaines'],
    },
    es: {
      name: 'Diplomático cálido',
      careerDescription: 'Disfrutas cuidando de las personas y favoreciendo la armonía. Tienes un talento especial para crear buen ambiente y buenas relaciones en el equipo.',
      topCareers: ['Profesional sanitario', 'Docente', 'Organizador de eventos', 'Responsable de atención al cliente', 'Responsable de RR. HH.'],
      workStyle: 'Colaboras estrechamente con la gente y cuidas la armonía del equipo y las necesidades de todos.',
      idealEnvironment: 'Un equipo cálido y colaborativo, donde se trate directamente con la gente.',
      workStrengths: ['Relaciones personales', 'Trabajo en equipo', 'Consideración', 'Fomento de la armonía'],
      workWeaknesses: ['Evitas los conflictos', 'Sensibilidad a la crítica', 'Ignoras tus propias necesidades'],
      careerTip: 'Tienes una gran capacidad para cuidar de los demás. A veces conviene practicar poner primero tus necesidades y opiniones.',
      avoidEnvironments: ['Trabajo aislado', 'Entornos con muchos conflictos', 'Lugares sin relaciones humanas'],
    },
  },
  ISTP: {
    ko: {
      name: '현실적인 문제 해결사',
      careerDescription: '실용적이고 분석적이며, 손으로 직접 문제를 해결하는 것을 즐깁니다. 위기 상황에서 침착하고 효율적으로 대응합니다.',
      topCareers: ['엔지니어', '기술자/정비사', '외과 의사', '경찰관/소방관', '데이터 분석가'],
      workStyle: '독립적으로 실용적 문제를 해결하며, 이론보다 실제 경험을 중시합니다.',
      idealEnvironment: '실질적 문제 해결이 가능하고, 자율성이 보장되는 환경.',
      workStrengths: ['실용적 문제 해결', '위기 대응', '분석력', '집중력'],
      workWeaknesses: ['장기 계획 약함', '사교적 상황 불편', '감정 표현 부족'],
      careerTip: '뛰어난 실무 능력을 가지고 있습니다. 장기 목표를 설정하고 팀과의 소통을 강화하면 더 큰 성과를 낼 수 있습니다.',
      avoidEnvironments: ['지나친 사교 요구', '추상적이고 이론 중심 업무', '엄격한 관료주의'],
    },
    en: {
      name: 'Practical Problem Solver',
      careerDescription: 'Practical, analytical, and enjoys solving problems hands-on. Responds calmly and efficiently in crises.',
      topCareers: ['Engineer', 'Technician/Mechanic', 'Surgeon', 'Police Officer/Firefighter', 'Data Analyst'],
      workStyle: 'Solves practical problems independently, valuing real experience over theory.',
      idealEnvironment: 'Environment allowing concrete problem-solving with guaranteed autonomy.',
      workStrengths: ['Practical problem solving', 'Crisis response', 'Analytical skills', 'Focus'],
      workWeaknesses: ['Weak at long-term planning', 'Uncomfortable in social situations', 'Limited emotional expression'],
      careerTip: 'You have outstanding practical abilities. Setting long-term goals and strengthening team communication will yield greater results.',
      avoidEnvironments: ['Excessive social demands', 'Abstract, theory-heavy work', 'Strict bureaucracy'],
    },
    ja: {
      name: '現実的な問題解決者',
      careerDescription: '実用的で分析的、手を使って直接問題を解決することを楽しみます。危機状況で冷静かつ効率的に対応します。',
      topCareers: ['エンジニア', '技術者/整備士', '外科医', '警察官/消防士', 'データアナリスト'],
      workStyle: '独立して実用的な問題を解決し、理論より実際の経験を重視します。',
      idealEnvironment: '実質的な問題解決ができ、自律性が保証される環境。',
      workStrengths: ['実用的問題解決', '危機対応', '分析力', '集中力'],
      workWeaknesses: ['長期計画が弱い', '社交的状況が不得意', '感情表現の不足'],
      careerTip: '卓越した実務能力があります。長期目標を設定してチームとのコミュニケーションを強化すると、より大きな成果が出ます。',
      avoidEnvironments: ['過度な社交の要求', '抽象的で理論中心の業務', '厳格な官僚主義'],
    },
    zh: {
      name: '务实的问题解决者',
      careerDescription: '务实而善于分析，喜欢亲手解决问题。在危机中沉着而高效地应对。',
      topCareers: ['工程师', '技师/维修师', '外科医生', '警察/消防员', '数据分析师'],
      workStyle: '独立解决实际问题，重视实际经验胜过理论。',
      idealEnvironment: '能解决实际问题、保障自主的环境。',
      workStrengths: ['务实地解决问题', '危机应对', '分析力', '专注力'],
      workWeaknesses: ['长期规划较弱', '在社交场合不自在', '情绪表达不足'],
      careerTip: '你有出色的实务能力。设定长期目标、加强与团队的沟通，就能取得更大的成果。',
      avoidEnvironments: ['过多的社交要求', '抽象、以理论为主的工作', '严格的官僚作风'],
    },
    fr: {
      name: 'Résolveur pragmatique',
      careerDescription: 'Pratique et analytique, vous aimez résoudre les problèmes de vos mains. En situation de crise, vous réagissez avec calme et efficacité.',
      topCareers: ['Ingénieur', 'Technicien / mécanicien', 'Chirurgien', 'Policier / pompier', 'Analyste de données'],
      workStyle: 'Vous résolvez seul des problèmes concrets et privilégiez l’expérience pratique à la théorie.',
      idealEnvironment: 'Un environnement autonome où l’on résout des problèmes concrets.',
      workStrengths: ['Résolution pratique des problèmes', 'Gestion de crise', 'Esprit d’analyse', 'Concentration'],
      workWeaknesses: ['Faible en planification à long terme', 'Mal à l’aise en société', 'Peu d’expression émotionnelle'],
      careerTip: 'Vous avez d’excellentes compétences pratiques. En fixant des objectifs à long terme et en communiquant davantage avec l’équipe, vous obtiendrez plus.',
      avoidEnvironments: ['Les exigences sociales excessives', 'Les tâches abstraites et théoriques', 'La bureaucratie rigide'],
    },
    es: {
      name: 'Solucionador práctico',
      careerDescription: 'Práctico y analítico, disfrutas resolviendo problemas con tus propias manos. En una crisis respondes con calma y eficacia.',
      topCareers: ['Ingeniero', 'Técnico / mecánico', 'Cirujano', 'Policía / bombero', 'Analista de datos'],
      workStyle: 'Resuelves problemas prácticos de forma independiente y valoras más la experiencia real que la teoría.',
      idealEnvironment: 'Un entorno con autonomía donde resolver problemas concretos.',
      workStrengths: ['Resolución práctica de problemas', 'Respuesta ante crisis', 'Capacidad analítica', 'Concentración'],
      workWeaknesses: ['Flojo en planificación a largo plazo', 'Incomodidad en situaciones sociales', 'Poca expresión emocional'],
      careerTip: 'Tienes una gran capacidad práctica. Si fijas metas a largo plazo y refuerzas la comunicación con el equipo, lograrás más.',
      avoidEnvironments: ['Exigencias sociales excesivas', 'Tareas abstractas y teóricas', 'Burocracia rígida'],
    },
  },
  ISFP: {
    ko: {
      name: '유연한 예술가',
      careerDescription: '감각적이고 예술적이며, 아름다움을 통해 세상을 표현합니다. 현재 순간에 충실하며 개인의 가치를 중시합니다.',
      topCareers: ['디자이너', '예술가', '뮤지션', '수의사', '물리치료사'],
      workStyle: '유연하게 일하며 자신만의 방식으로 창의적 문제를 해결합니다.',
      idealEnvironment: '창의적 자유가 있고 자신의 속도로 일할 수 있는 환경.',
      workStrengths: ['창의성', '감각적 민감성', '유연성', '개인 가치 중심'],
      workWeaknesses: ['장기 계획 약함', '자기 주장 부족', '갈등 회피'],
      careerTip: '창의적 재능이 뛰어납니다. 자신의 작품과 의견을 더 적극적으로 표현하고 공유하는 것이 커리어 성장의 열쇠입니다.',
      avoidEnvironments: ['엄격한 일정 중심', '창의성 없는 환경', '지나치게 경쟁적인 문화'],
    },
    en: {
      name: 'Flexible Artist',
      careerDescription: 'Sensory, artistic, expressing the world through beauty. Present-focused and values personal integrity.',
      topCareers: ['Designer', 'Artist', 'Musician', 'Veterinarian', 'Physical Therapist'],
      workStyle: 'Works flexibly and solves creative problems in their own way.',
      idealEnvironment: 'Environment with creative freedom to work at their own pace.',
      workStrengths: ['Creativity', 'Sensory sensitivity', 'Flexibility', 'Values-centered approach'],
      workWeaknesses: ['Weak at long-term planning', 'Lack of assertiveness', 'Conflict avoidance'],
      careerTip: 'Your creative talent is outstanding. Expressing and sharing your work and opinions more proactively is the key to career growth.',
      avoidEnvironments: ['Strict schedule-focused environments', 'Environments without creativity', 'Overly competitive cultures'],
    },
    ja: {
      name: '柔軟なアーティスト',
      careerDescription: '感覚的で芸術的、美を通して世界を表現します。現在の瞬間に忠実で個人の価値観を重視します。',
      topCareers: ['デザイナー', 'アーティスト', 'ミュージシャン', '獣医師', '理学療法士'],
      workStyle: '柔軟に働き、自分なりの方法で創造的な問題を解決します。',
      idealEnvironment: '創造的自由があり、自分のペースで働ける環境。',
      workStrengths: ['創造性', '感覚的敏感さ', '柔軟性', '個人の価値観中心'],
      workWeaknesses: ['長期計画が弱い', '自己主張の欠如', '葛藤回避'],
      careerTip: '創造的な才能が優れています。自分の作品と意見をより積極的に表現・共有することがキャリア成長の鍵です。',
      avoidEnvironments: ['厳格なスケジュール中心', '創造性のない環境', '過度に競争的な文化'],
    },
    zh: {
      name: '灵活的艺术家',
      careerDescription: '感性而富艺术气质，用美来表达世界。忠于当下，重视个人价值。',
      topCareers: ['设计师', '艺术家', '音乐人', '兽医', '物理治疗师'],
      workStyle: '弹性地工作，用自己的方式解决创意问题。',
      idealEnvironment: '有创作自由、能按自己节奏工作的环境。',
      workStrengths: ['创造力', '感官敏锐', '弹性', '以个人价值为中心'],
      workWeaknesses: ['长期规划较弱', '自我主张不足', '回避冲突'],
      careerTip: '你的创意才华很出色。更积极地表达和分享自己的作品与意见，是职涯成长的关键。',
      avoidEnvironments: ['以严格日程为中心', '没有创意的环境', '过度竞争的文化'],
    },
    fr: {
      name: 'Artiste souple',
      careerDescription: 'Sensible et artiste, vous exprimez le monde à travers la beauté. Vous vivez pleinement l’instant et tenez à vos valeurs.',
      topCareers: ['Designer', 'Artiste', 'Musicien', 'Vétérinaire', 'Kinésithérapeute'],
      workStyle: 'Vous travaillez avec souplesse et résolvez les problèmes créatifs à votre manière.',
      idealEnvironment: 'Un environnement de liberté créative, où l’on travaille à son rythme.',
      workStrengths: ['Créativité', 'Sensibilité sensorielle', 'Souplesse', 'Centré sur ses valeurs'],
      workWeaknesses: ['Faible en planification à long terme', 'Manque d’affirmation de soi', 'Évitement des conflits'],
      careerTip: 'Votre talent créatif est remarquable. Exprimer et partager davantage vos créations et vos avis est la clé de votre évolution.',
      avoidEnvironments: ['Les plannings stricts', 'Les environnements sans créativité', 'Les cultures trop compétitives'],
    },
    es: {
      name: 'Artista flexible',
      careerDescription: 'Sensible y artístico, expresas el mundo a través de la belleza. Vives plenamente el presente y valoras tus principios.',
      topCareers: ['Diseñador', 'Artista', 'Músico', 'Veterinario', 'Fisioterapeuta'],
      workStyle: 'Trabajas con flexibilidad y resuelves problemas creativos a tu manera.',
      idealEnvironment: 'Un entorno con libertad creativa donde trabajar a tu ritmo.',
      workStrengths: ['Creatividad', 'Sensibilidad sensorial', 'Flexibilidad', 'Centrado en tus valores'],
      workWeaknesses: ['Flojo en planificación a largo plazo', 'Poca asertividad', 'Evitas los conflictos'],
      careerTip: 'Tu talento creativo es excelente. Expresar y compartir más tus obras y opiniones es la clave de tu crecimiento profesional.',
      avoidEnvironments: ['Horarios estrictos', 'Entornos sin creatividad', 'Culturas demasiado competitivas'],
    },
  },
  ESTP: {
    ko: {
      name: '역동적인 기업가',
      careerDescription: '빠른 상황 판단과 행동력으로 즉각적인 문제를 해결합니다. 에너지 넘치고 현실적이며 위험을 감수합니다.',
      topCareers: ['영업 전문가', '기업가', '운동선수/코치', '응급구조사', '부동산 중개인'],
      workStyle: '빠르게 행동하며 실용적 결과를 추구합니다. 현장에서 직접 성과를 만듭니다.',
      idealEnvironment: '역동적이고 변화무쌍한 환경, 즉각적인 결과가 보이는 곳.',
      workStrengths: ['행동력', '위기 대응', '협상력', '현실 감각'],
      workWeaknesses: ['장기 계획 약함', '세부 사항 간과', '충동적 결정'],
      careerTip: '빠른 행동력이 최대 강점입니다. 장기적 관점과 세부 계획을 보완하면 훨씬 더 큰 성과를 낼 수 있습니다.',
      avoidEnvironments: ['느리고 반복적인 업무', '이론 중심 환경', '지나치게 규칙적인 구조'],
    },
    en: {
      name: 'Dynamic Entrepreneur',
      careerDescription: 'Solves immediate problems with quick situational assessment and action. Energetic, realistic, and risk-taking.',
      topCareers: ['Sales Professional', 'Entrepreneur', 'Athlete/Coach', 'Emergency Responder', 'Real Estate Agent'],
      workStyle: 'Acts quickly and pursues practical results. Creates results directly in the field.',
      idealEnvironment: 'Dynamic, ever-changing environment where immediate results are visible.',
      workStrengths: ['Action-oriented', 'Crisis response', 'Negotiation skills', 'Practical sense'],
      workWeaknesses: ['Weak at long-term planning', 'May overlook details', 'Impulsive decisions'],
      careerTip: 'Your quick action is your greatest strength. Supplementing with long-term perspective and detailed planning will produce much greater results.',
      avoidEnvironments: ['Slow, repetitive tasks', 'Theory-heavy environments', 'Overly rule-based structures'],
    },
    ja: {
      name: 'ダイナミックな起業家',
      careerDescription: '素早い状況判断と行動力で即座の問題を解決します。エネルギッシュで現実的、リスクを取ります。',
      topCareers: ['営業専門家', '起業家', 'アスリート/コーチ', '救急救命士', '不動産仲介人'],
      workStyle: '素早く行動して実用的な結果を追求します。現場で直接成果を作ります。',
      idealEnvironment: 'ダイナミックで変化に富んだ環境、即座の結果が見える場所。',
      workStrengths: ['行動力', '危機対応', '交渉力', '現実感覚'],
      workWeaknesses: ['長期計画が弱い', '細部を見落とす', '衝動的な決定'],
      careerTip: '素早い行動力が最大の強みです。長期的な視点と詳細な計画を補うと、はるかに大きな成果が得られます。',
      avoidEnvironments: ['遅くて繰り返しの多い業務', '理論中心の環境', '過度にルール化された構造'],
    },
    zh: {
      name: '充满活力的企业家',
      careerDescription: '凭快速的判断和行动力解决眼前的问题。精力充沛、务实，敢于冒险。',
      topCareers: ['销售专家', '企业家', '运动员/教练', '急救员', '房地产经纪人'],
      workStyle: '行动迅速，追求实际结果，在现场直接做出成绩。',
      idealEnvironment: '动态多变、能立刻看到结果的环境。',
      workStrengths: ['行动力', '危机应对', '谈判力', '现实感'],
      workWeaknesses: ['长期规划较弱', '忽略细节', '冲动决定'],
      careerTip: '快速行动是你最大的优势。补上长期视角和细节规划，就能取得更大的成果。',
      avoidEnvironments: ['缓慢重复的工作', '以理论为主的环境', '过度规律的结构'],
    },
    fr: {
      name: 'Entrepreneur dynamique',
      careerDescription: 'Par votre jugement rapide et votre sens de l’action, vous réglez les problèmes sur-le-champ. Énergique et réaliste, vous acceptez de prendre des risques.',
      topCareers: ['Commercial', 'Entrepreneur', 'Sportif / entraîneur', 'Secouriste', 'Agent immobilier'],
      workStyle: 'Vous agissez vite et visez des résultats concrets, obtenus directement sur le terrain.',
      idealEnvironment: 'Un environnement dynamique et changeant, où les résultats sont immédiats.',
      workStrengths: ['Sens de l’action', 'Gestion de crise', 'Talent de négociation', 'Sens des réalités'],
      workWeaknesses: ['Faible en planification à long terme', 'Néglige les détails', 'Décisions impulsives'],
      careerTip: 'Votre rapidité d’action est votre plus grande force. En y ajoutant une vision à long terme et des plans détaillés, vous obtiendrez bien plus.',
      avoidEnvironments: ['Les tâches lentes et répétitives', 'Les environnements théoriques', 'Les structures trop réglées'],
    },
    es: {
      name: 'Emprendedor dinámico',
      careerDescription: 'Con juicio rápido y capacidad de acción, resuelves los problemas al momento. Eres enérgico, realista y asumes riesgos.',
      topCareers: ['Profesional de ventas', 'Emprendedor', 'Deportista / entrenador', 'Técnico de emergencias', 'Agente inmobiliario'],
      workStyle: 'Actúas con rapidez y buscas resultados prácticos, logrados directamente sobre el terreno.',
      idealEnvironment: 'Un entorno dinámico y cambiante donde los resultados se ven enseguida.',
      workStrengths: ['Capacidad de acción', 'Respuesta ante crisis', 'Capacidad de negociación', 'Sentido de la realidad'],
      workWeaknesses: ['Flojo en planificación a largo plazo', 'Pasas por alto los detalles', 'Decisiones impulsivas'],
      careerTip: 'Tu rapidez de acción es tu mayor fortaleza. Si la completas con visión a largo plazo y planes detallados, lograrás mucho más.',
      avoidEnvironments: ['Tareas lentas y repetitivas', 'Entornos teóricos', 'Estructuras demasiado regladas'],
    },
  },
  ESFP: {
    ko: {
      name: '즉흥적인 엔터테이너',
      careerDescription: '사람들을 즐겁게 하고 현재 순간을 충실히 삽니다. 에너지와 열정으로 주변 분위기를 밝게 만듭니다.',
      topCareers: ['연예인/배우', '이벤트 코디네이터', '판매원', '관광 가이드', '아동 교육자'],
      workStyle: '즉흥적이고 활기차며, 사람들과의 상호작용에서 에너지를 얻습니다.',
      idealEnvironment: '활발하고 사교적이며 즉각적인 피드백이 있는 환경.',
      workStrengths: ['대인 관계', '즉흥성', '열정', '현재 집중'],
      workWeaknesses: ['장기 계획 약함', '세부 실행 부족', '집중력 유지 어려움'],
      careerTip: '사람을 즐겁게 하는 타고난 재능이 있습니다. 커리어의 지속 성장을 위해 장기 목표와 계획을 세우는 습관을 기르세요.',
      avoidEnvironments: ['고립된 반복 업무', '지나친 규칙과 형식', '사람 없는 환경'],
    },
    en: {
      name: 'Spontaneous Entertainer',
      careerDescription: 'Brings joy to people and lives in the present moment. Brightens the atmosphere with energy and passion.',
      topCareers: ['Entertainer/Actor', 'Event Coordinator', 'Salesperson', 'Tour Guide', 'Children\'s Educator'],
      workStyle: 'Spontaneous and energetic, gaining energy from interactions with people.',
      idealEnvironment: 'Active, social environment with immediate feedback.',
      workStrengths: ['Interpersonal skills', 'Spontaneity', 'Passion', 'Present-focused'],
      workWeaknesses: ['Weak at long-term planning', 'Insufficient detailed execution', 'Difficulty maintaining focus'],
      careerTip: 'You have a natural talent for bringing joy to people. Develop habits of setting long-term goals and plans for sustained career growth.',
      avoidEnvironments: ['Isolated repetitive tasks', 'Excessive rules and formality', 'Environments without people'],
    },
    ja: {
      name: '即興のエンターテイナー',
      careerDescription: '人々を楽しませ、現在の瞬間を充実して生きます。エネルギーと情熱で周りの雰囲気を明るくします。',
      topCareers: ['芸能人/俳優', 'イベントコーディネーター', '販売員', '観光ガイド', '幼児教育者'],
      workStyle: '即興的でエネルギッシュ、人との交流からエネルギーを得ます。',
      idealEnvironment: '活発で社交的で、即座のフィードバックがある環境。',
      workStrengths: ['対人関係', '即興性', '情熱', '現在への集中'],
      workWeaknesses: ['長期計画が弱い', '詳細な実行が不足', '集中力の維持が難しい'],
      careerTip: '人を楽しませる天性の才能があります。キャリアの継続的成長のために、長期目標と計画を立てる習慣を身につけましょう。',
      avoidEnvironments: ['孤立した繰り返し業務', '過度なルールと形式', '人がいない環境'],
    },
    zh: {
      name: '即兴的娱乐家',
      careerDescription: '让人开心，充实地活在当下。以能量和热情点亮周围的气氛。',
      topCareers: ['艺人/演员', '活动协调员', '销售员', '导游', '儿童教育者'],
      workStyle: '即兴而活泼，从与人的互动中获得能量。',
      idealEnvironment: '活泼、社交性强、能立即得到反馈的环境。',
      workStrengths: ['人际关系', '即兴', '热情', '专注当下'],
      workWeaknesses: ['长期规划较弱', '具体执行不足', '难以保持专注'],
      careerTip: '你有让人开心的天赋。为了职涯的持续成长，养成设定长期目标和计划的习惯吧。',
      avoidEnvironments: ['孤立的重复工作', '过多的规则和形式', '没有人的环境'],
    },
    fr: {
      name: 'Artiste spontané',
      careerDescription: 'Vous aimez divertir les gens et vivez pleinement le moment présent. Votre énergie et votre enthousiasme illuminent l’ambiance.',
      topCareers: ['Artiste de scène / acteur', 'Coordinateur d’événements', 'Vendeur', 'Guide touristique', 'Éducateur pour enfants'],
      workStyle: 'Spontané et plein d’entrain, vous puisez votre énergie dans les interactions avec les autres.',
      idealEnvironment: 'Un environnement animé et sociable, avec des retours immédiats.',
      workStrengths: ['Relations humaines', 'Spontanéité', 'Enthousiasme', 'Concentration sur l’instant'],
      workWeaknesses: ['Faible en planification à long terme', 'Exécution détaillée insuffisante', 'Difficulté à rester concentré'],
      careerTip: 'Vous avez un talent naturel pour faire plaisir aux gens. Pour faire durer votre progression, prenez l’habitude de fixer des objectifs et des plans à long terme.',
      avoidEnvironments: ['Les tâches répétitives et isolées', 'Trop de règles et de formalités', 'Les environnements sans personne'],
    },
    es: {
      name: 'Animador espontáneo',
      careerDescription: 'Te encanta hacer disfrutar a la gente y vives el presente al máximo. Con tu energía y entusiasmo alegras el ambiente.',
      topCareers: ['Artista / actor', 'Coordinador de eventos', 'Vendedor', 'Guía turístico', 'Educador infantil'],
      workStyle: 'Espontáneo y lleno de vida, te cargas de energía interactuando con la gente.',
      idealEnvironment: 'Un entorno animado y sociable, con respuesta inmediata.',
      workStrengths: ['Relaciones personales', 'Espontaneidad', 'Entusiasmo', 'Concentración en el presente'],
      workWeaknesses: ['Flojo en planificación a largo plazo', 'Poca ejecución de detalles', 'Te cuesta mantener la concentración'],
      careerTip: 'Tienes un talento natural para hacer disfrutar a la gente. Para seguir creciendo profesionalmente, cultiva el hábito de fijar metas y planes a largo plazo.',
      avoidEnvironments: ['Tareas repetitivas y aisladas', 'Demasiadas normas y formalidades', 'Entornos sin gente'],
    },
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcMBTI(answers: Partial<Score>[]): { type: MBTIType; scores: Score } {
  const s: Score = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 }
  for (const a of answers) {
    for (const [k, v] of Object.entries(a)) s[k as Dim] += v as number
  }
  const type = (
    (s.E >= s.I ? 'E' : 'I') +
    (s.S >= s.N ? 'S' : 'N') +
    (s.T >= s.F ? 'T' : 'F') +
    (s.J >= s.P ? 'J' : 'P')
  ) as MBTIType
  return { type, scores: s }
}

function dimPct(a: number, b: number): number {
  const total = a + b
  if (total === 0) return 50
  return Math.round((a / total) * 100)
}

// ─── Component ────────────────────────────────────────────────────────────────
interface Props { locale?: string }

export default function MbtiCareerTest({ locale: localeProp = 'ko' }: Props) {
  // zh/fr/es 카피가 아직 없다. 없는 로케일은 en 으로 떨어뜨린다 —
  // 'ko' 로 떨어뜨리면 중국어·프랑스어·스페인어 사용자에게 한국어가 그대로 나간다.
  const locale: Locale = (['ko', 'en', 'ja', 'zh', 'fr', 'es'].includes(localeProp) ? localeProp : 'en') as Locale
  const lb = LABELS[locale]
  const questions = QUESTIONS[locale]

  const [current, setCurrent] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search)
      if (p.get('type')) return questions.length
    }
    return 0
  })
  const [selected, setSelected] = useState<number | null>(null)
  // 고른 선택지의 인덱스를 남긴다. 점수 객체만 쌓으면 어느 항목을 골랐는지 복원할 수 없어
  // 되돌아갔을 때 선택 표시가 되지 않는다.
  const [answers, setAnswers] = useState<number[]>([])
  const [result, setResult] = useState<{ type: MBTIType; scores: Score } | null>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search)
      const t = p.get('type') as MBTIType | null
      if (t && RESULTS[t]) {
        const empty: Score = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 }
        return { type: t, scores: empty }
      }
    }
    return null
  })
  useRecordFinishedTest({ testId: "mbti-career", title: "MbtiCareerTest", finished: Boolean(result) });

  const finished = current >= questions.length

  function pickOption(idx: number) {
    if (selected !== null) return
    setSelected(idx)
    const newAnswers = answers.slice(0, current)
    newAnswers[current] = idx
    setTimeout(() => {
      if (current + 1 >= questions.length) {
        setResult(calcMBTI(newAnswers.map((optIdx, i) => questions[i].options[optIdx].score)))
      }
      setAnswers(newAnswers)
      setCurrent(current + 1)
      setSelected(null)
    }, 280)
  }

  function restart() {
    setAnswers([])
    setCurrent(0)
    setSelected(null)
    setResult(null)
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }

  function share() {
    if (!result) return
    const url = `${window.location.origin}${window.location.pathname}?type=${result.type}`
    const text = `${lb.shareMsg} ${result.type} (${RESULTS[result.type][locale].name})`
    if (navigator.share) {
      navigator.share({ title: lb.title, text, url })
    } else {
      navigator.clipboard.writeText(url)
    }
  }

  // ── Question view ───────────────────────────────────────────────────────────
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
          selected !== null ? selected + 1 : answers[current] === undefined ? undefined : answers[current] + 1
        }
        previousLabel={({ ko: '이전 질문', en: 'Previous question', ja: '前の質問', zh: '上一题', fr: 'Question précédente', es: 'Pregunta anterior' } as Record<string, string>)[locale] ?? 'Previous question'}
        onPrevious={current > 0 && selected === null ? () => setCurrent(current - 1) : undefined}
        onSelect={(value) => pickOption(value - 1)}
      />
    )
  }

  // ── Result view ─────────────────────────────────────────────────────────────
  if (!result) return null
  const r = RESULTS[result.type][locale]
  const s = result.scores
  const chartData = [
    { dim: 'E↔I', value: dimPct(s.E, s.I) },
    { dim: 'S↔N', value: dimPct(s.S, s.N) },
    { dim: 'T↔F', value: dimPct(s.T, s.F) },
    { dim: 'J↔P', value: dimPct(s.J, s.P) },
  ]

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">{lb.yourType}</p>
        <div className="inline-block rounded-full bg-primary/10 px-5 py-2 text-3xl font-bold text-primary">
          {result.type}
        </div>
        <h2 className="text-xl font-semibold">{r.name}</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">{r.careerDescription}</p>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <p className="text-xs text-muted-foreground text-center mb-2">{lb.chartTitle}</p>
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="dim" tick={{ fontSize: 12 }} />
            <Radar
              dataKey="value"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.25}
            />
            <Tooltip formatter={((v: number) => `${v}%`) as any} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-2">
        <h3 className="font-semibold text-sm">{lb.topCareers}</h3>
        <div className="flex flex-wrap gap-2">
          {r.topCareers.map((c) => (
            <span key={c} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {c}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        <div className="rounded-xl border bg-card p-4 space-y-1">
          <h3 className="font-semibold text-sm">{lb.workStyle}</h3>
          <p className="text-sm text-muted-foreground">{r.workStyle}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 space-y-1">
          <h3 className="font-semibold text-sm">{lb.idealEnv}</h3>
          <p className="text-sm text-muted-foreground">{r.idealEnvironment}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border bg-card p-4 space-y-2">
          <h3 className="font-semibold text-sm text-green-600">{lb.workStrengths}</h3>
          <ul className="space-y-1">
            {r.workStrengths.map((s) => (
              <li key={s} className="text-xs text-muted-foreground flex items-start gap-1">
                <span className="text-green-500 mt-0.5">+</span>{s}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border bg-card p-4 space-y-2">
          <h3 className="font-semibold text-sm text-amber-600">{lb.workWeaknesses}</h3>
          <ul className="space-y-1">
            {r.workWeaknesses.map((w) => (
              <li key={w} className="text-xs text-muted-foreground flex items-start gap-1">
                <span className="text-amber-500 mt-0.5">△</span>{w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-1">
        <h3 className="font-semibold text-sm text-primary">{lb.careerTip}</h3>
        <p className="text-sm">{r.careerTip}</p>
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-2">
        <h3 className="font-semibold text-sm text-muted-foreground">{lb.avoidEnvs}</h3>
        <ul className="space-y-1">
          {r.avoidEnvironments.map((e) => (
            <li key={e} className="text-xs text-muted-foreground flex items-start gap-1">
              <span className="text-red-400 mt-0.5">✕</span>{e}
            </li>
          ))}
        </ul>
      </div>

      <ShareResultButton
        locale={locale}
        heading={lb.title}
        resultTitle={`${result.type} - ${r.name}`}
        emoji="💼"
        description={r.careerDescription}
      />
      <ResultNextSteps
        locale={locale}
        links={[
          { href: `/${locale}/mbti/test/`, label: ({ ko: '🧩 MBTI 성격 테스트', en: '🧩 MBTI personality test', ja: '🧩 MBTI性格テスト', zh: '🧩 MBTI 性格测验', fr: '🧩 Test de personnalité MBTI', es: '🧩 Test de personalidad MBTI' } as Record<string, string>)[locale] ?? '🧩 MBTI personality test' },
          { href: `/${locale}/ontology/life-purpose/`, label: ({ ko: '🧭 삶의 목적 지도', en: '🧭 Life purpose map', ja: '🧭 人生の目的マップ', zh: '🧭 人生目的地图', fr: '🧭 Carte du sens de la vie', es: '🧭 Mapa del propósito vital' } as Record<string, string>)[locale] ?? '🧭 Life purpose map' },
          { href: `/${locale}/big5/test/`, label: ({ ko: '🧬 Big5 성격 테스트', en: '🧬 Big Five personality test', ja: '🧬 Big5性格テスト', zh: '🧬 大五人格测验', fr: '🧬 Test de personnalité Big Five', es: '🧬 Test de personalidad Big Five' } as Record<string, string>)[locale] ?? '🧬 Big Five personality test' },
        ]}
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
