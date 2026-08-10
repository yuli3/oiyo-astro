import { useEffect, useState } from 'react'
import { Questionnaire } from '@/components/ui/questionnaire'
import ShareResultButton from '../shared/ShareResultButton'
import { recordTestResult } from '@/lib/user/test-results'
import { gaEvent } from '@/lib/analytics/ga-event'
import { buildRiasecProfile, type RiasecType } from '../../lib/riasec-profile'
import {
  buildRiasecResult,
  recordAssessmentResult,
  riasecFullPlugin,
  type AssessmentLocale,
  type AssessmentResponses,
} from '@/assessments'

type SupportedLang = 'ko' | 'en' | 'ja'
// Exported so RiasecQuickTest.tsx (the 18-question /riasec-quick sibling) can
// reuse the type-level shape and the shared color palette/type descriptions
// below instead of duplicating them.
export type { RiasecType } from '../../lib/riasec-profile'

function lang(locale: string): SupportedLang {
  return (['ko', 'en', 'ja'] as const).includes(locale as SupportedLang) ? (locale as SupportedLang) : 'en'
}

interface Question { id: string; text: string; type: RiasecType }

export const RIASEC_COLORS: Record<RiasecType, string> = {
  R: '#f97316', I: '#3b82f6', A: '#a855f7', S: '#22c55e', E: '#ef4444', C: '#eab308'
}

const LABELS: Record<SupportedLang, {
  title: string; subtitle: string
  questionOf: (c: number, t: number) => string
  scaleLabels: [string, string, string, string, string]
  restart: string; share: string; shareMsg: string
  yourCode: string; topTypes: string; environments: string
  profile: string; note: string; mixedTitle: string; mixedBody: string
  clearBody: string; lowFlatBody: string; rawRange: (min: number, max: number) => string
  tryNext: string
  typeNames: Record<RiasecType, string>
  typeFull: Record<RiasecType, string>
}> = {
  ko: {
    title: 'RIASEC 직업 흥미 유형 검사',
    subtitle: '내게 맞는 직업 찾기',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['전혀 아님', '약간 아님', '보통', '약간 그럼', '매우 그럼'],
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '나의 RIASEC 직업 흥미 유형',
    yourCode: '나의 Holland 코드',
    topTypes: '상위 유형 설명',
    environments: '선호할 수 있는 업무환경 예시',
    profile: '6가지 흥미 프로필',
    note: '이 결과는 흥미를 돌아보는 비진단 참고 자료이며 직업 적합성이나 능력을 판정하지 않습니다.',
    mixedTitle: '여러 흥미가 함께 나타난 혼합 프로필',
    mixedBody: '점수 차이가 작아 하나의 유형으로 단정하기 어렵습니다. 상위 흥미가 함께 쓰이는 업무환경을 비교해 보세요.',
    clearBody: '현재 응답에서는 아래 흥미가 비교적 뚜렷합니다. 직업명이 아니라 실제 업무환경과 활동을 기준으로 확인해 보세요.',
    lowFlatBody: '전반적인 점수가 낮고 비슷합니다. 피로·경험 부족·문항 맥락의 영향일 수 있으므로 코드보다 작은 활동 실험부터 시작하세요.',
    rawRange: (min, max) => `유형별 원점수 범위 ${min}–${max}점`,
    tryNext: '다음 1주 동안 관심 가는 활동 하나를 20분 체험하고, 에너지와 몰입도를 기록해 보세요.',
    typeNames: { R: '현실형', I: '탐구형', A: '예술형', S: '사회형', E: '진취형', C: '관습형' },
    typeFull: { R: 'Realistic', I: 'Investigative', A: 'Artistic', S: 'Social', E: 'Enterprising', C: 'Conventional' },
  },
  en: {
    title: 'RIASEC Career Interest Test',
    subtitle: 'Holland Code Career Guide',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Not at all', 'Slightly not', 'Neutral', 'Somewhat', 'Very much'],
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My RIASEC Holland Code',
    yourCode: 'My Holland Code',
    topTypes: 'Top Type Descriptions',
    environments: 'Work-environment examples you may prefer',
    profile: '6-Dimension Interest Profile',
    note: 'This is a non-diagnostic reflection on interests; it does not determine career fit or ability.',
    mixedTitle: 'A blended interest profile',
    mixedBody: 'The score gaps are too small for a single-type claim. Compare environments where your leading interests can work together.',
    clearBody: 'These interests are relatively distinct in this response. Check real tasks and environments rather than treating job titles as prescriptions.',
    lowFlatBody: 'Scores are low and similar overall. Fatigue, limited exposure, or item context may matter, so begin with a small activity experiment instead of a code.',
    rawRange: (min, max) => `Raw score range per type: ${min}–${max}`,
    tryNext: 'This week, try one appealing activity for 20 minutes and note your energy and engagement.',
    typeNames: { R: 'Realistic', I: 'Investigative', A: 'Artistic', S: 'Social', E: 'Enterprising', C: 'Conventional' },
    typeFull: { R: 'Realistic', I: 'Investigative', A: 'Artistic', S: 'Social', E: 'Enterprising', C: 'Conventional' },
  },
  ja: {
    title: 'RIASEC 職業興味検査',
    subtitle: '自分に合った職業を見つける',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['全くない', 'あまりない', '普通', '少しある', 'とてもある'],
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '私のRIASECホランドコード',
    yourCode: '私のホランドコード',
    topTypes: 'トップタイプの説明',
    environments: '好む可能性のある仕事環境の例',
    profile: '6次元興味プロフィール',
    note: 'この結果は興味を振り返る非診断的な参考資料であり、職業適性や能力を判定するものではありません。',
    mixedTitle: '複数の興味が表れた混合プロフィール',
    mixedBody: '得点差が小さいため、一つのタイプに断定できません。上位の興味を組み合わせられる仕事環境を比べてみましょう。',
    clearBody: '今回の回答では次の興味が比較的明確です。職業名ではなく、実際の作業や環境を基準に確かめてください。',
    lowFlatBody: '全体の得点が低く似ています。疲労、経験不足、設問の文脈も影響し得るため、コードより小さな活動実験から始めましょう。',
    rawRange: (min, max) => `タイプ別の素点範囲 ${min}–${max}点`,
    tryNext: '今週、気になる活動を一つ20分試し、エネルギーと集中度を記録してみましょう。',
    typeNames: { R: '現実型', I: '研究型', A: '芸術型', S: '社会型', E: '企業型', C: '慣習型' },
    typeFull: { R: 'Realistic', I: 'Investigative', A: 'Artistic', S: 'Social', E: 'Enterprising', C: 'Conventional' },
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 'R1', text: '기계나 도구를 조작하고 수리하는 것을 즐긴다', type: 'R' },
    { id: 'R2', text: '야외에서 신체를 사용하는 활동을 좋아한다', type: 'R' },
    { id: 'R3', text: '직접 손을 사용해 무언가를 만들거나 조립하는 것이 좋다', type: 'R' },
    { id: 'R4', text: '실질적이고 구체적인 문제를 해결하는 것이 즐겁다', type: 'R' },
    { id: 'I1', text: '복잡한 문제를 분석하고 원리를 이해하는 것이 즐겁다', type: 'I' },
    { id: 'I2', text: '과학적 실험이나 연구 활동에 흥미를 느낀다', type: 'I' },
    { id: 'I3', text: '새로운 이론이나 개념을 탐구하는 것이 좋다', type: 'I' },
    { id: 'I4', text: '데이터를 수집하고 분석해 결론을 도출하는 것이 만족스럽다', type: 'I' },
    { id: 'A1', text: '음악, 미술, 글쓰기 등 창의적 활동에서 기쁨을 느낀다', type: 'A' },
    { id: 'A2', text: '나만의 독창적인 방식으로 무언가를 표현하고 싶다', type: 'A' },
    { id: 'A3', text: '아름다움, 미적 감각, 디자인에 깊은 관심이 있다', type: 'A' },
    { id: 'A4', text: '정해진 규칙보다 자유롭게 창조하는 것을 선호한다', type: 'A' },
    { id: 'S1', text: '사람들을 가르치거나 돕고 상담하는 것이 보람 있다', type: 'S' },
    { id: 'S2', text: '팀워크와 협력을 통해 함께 문제를 해결하는 것이 좋다', type: 'S' },
    { id: 'S3', text: '다른 사람의 감정에 공감하고 지원하는 것이 자연스럽다', type: 'S' },
    { id: 'S4', text: '사회적 문제에 관심을 갖고 기여하고 싶다', type: 'S' },
    { id: 'E1', text: '사람들을 설득하고 리드하는 것이 즐겁다', type: 'E' },
    { id: 'E2', text: '목표를 세우고 전략적으로 추진하는 것이 자연스럽다', type: 'E' },
    { id: 'E3', text: '새로운 사업 아이디어나 기회를 발견하는 것이 설레인다', type: 'E' },
    { id: 'E4', text: '경쟁 상황에서 더 의욕이 솟는다', type: 'E' },
    { id: 'C1', text: '체계적이고 정확하게 업무를 처리하는 것이 편하다', type: 'C' },
    { id: 'C2', text: '규칙과 절차를 따르는 것이 안정감을 준다', type: 'C' },
    { id: 'C3', text: '데이터, 숫자, 기록을 정리하는 것이 만족스럽다', type: 'C' },
    { id: 'C4', text: '세부사항에 주의를 기울이고 오류를 찾아내는 것이 자연스럽다', type: 'C' },
  ],
  en: [
    { id: 'R1', text: 'I enjoy operating and repairing machines or tools', type: 'R' },
    { id: 'R2', text: 'I like physical activities outdoors', type: 'R' },
    { id: 'R3', text: 'I enjoy making or assembling things with my hands', type: 'R' },
    { id: 'R4', text: 'I find it satisfying to solve practical, concrete problems', type: 'R' },
    { id: 'I1', text: 'I enjoy analyzing complex problems and understanding their principles', type: 'I' },
    { id: 'I2', text: 'I\'m interested in scientific experiments or research activities', type: 'I' },
    { id: 'I3', text: 'I enjoy exploring new theories and concepts', type: 'I' },
    { id: 'I4', text: 'I find it satisfying to collect data, analyze it, and draw conclusions', type: 'I' },
    { id: 'A1', text: 'I feel joy in creative activities like music, art, or writing', type: 'A' },
    { id: 'A2', text: 'I want to express myself in my own unique way', type: 'A' },
    { id: 'A3', text: 'I have a deep interest in beauty, aesthetics, and design', type: 'A' },
    { id: 'A4', text: 'I prefer creating freely over following fixed rules', type: 'A' },
    { id: 'S1', text: 'Teaching, helping, or counseling people feels rewarding', type: 'S' },
    { id: 'S2', text: 'I enjoy solving problems collaboratively through teamwork', type: 'S' },
    { id: 'S3', text: 'Empathizing with and supporting others comes naturally to me', type: 'S' },
    { id: 'S4', text: 'I\'m interested in social issues and want to contribute', type: 'S' },
    { id: 'E1', text: 'I enjoy persuading and leading people', type: 'E' },
    { id: 'E2', text: 'Setting goals and pursuing them strategically feels natural', type: 'E' },
    { id: 'E3', text: 'Discovering new business ideas or opportunities excites me', type: 'E' },
    { id: 'E4', text: 'I feel more motivated in competitive situations', type: 'E' },
    { id: 'C1', text: 'I\'m comfortable handling tasks in an organized, accurate way', type: 'C' },
    { id: 'C2', text: 'Following rules and procedures gives me a sense of stability', type: 'C' },
    { id: 'C3', text: 'Organizing data, numbers, and records feels satisfying', type: 'C' },
    { id: 'C4', text: 'Paying attention to details and catching errors comes naturally', type: 'C' },
  ],
  ja: [
    { id: 'R1', text: '機械や道具を操作・修理することを楽しむ', type: 'R' },
    { id: 'R2', text: '屋外で身体を使う活動が好きだ', type: 'R' },
    { id: 'R3', text: '手を使って何かを作ったり組み立てたりするのが好きだ', type: 'R' },
    { id: 'R4', text: '実際的で具体的な問題を解決するのが楽しい', type: 'R' },
    { id: 'I1', text: '複雑な問題を分析し、原理を理解することが楽しい', type: 'I' },
    { id: 'I2', text: '科学的な実験や研究活動に興味を感じる', type: 'I' },
    { id: 'I3', text: '新しい理論や概念を探求することが好きだ', type: 'I' },
    { id: 'I4', text: 'データを収集・分析して結論を導くことが満足できる', type: 'I' },
    { id: 'A1', text: '音楽、美術、執筆などの創造的活動に喜びを感じる', type: 'A' },
    { id: 'A2', text: '自分独自の方法で何かを表現したい', type: 'A' },
    { id: 'A3', text: '美しさ、美的感覚、デザインに深い関心がある', type: 'A' },
    { id: 'A4', text: '決まったルールより自由に創造することを好む', type: 'A' },
    { id: 'S1', text: '人を教えたり助けたり相談に乗ることにやりがいを感じる', type: 'S' },
    { id: 'S2', text: 'チームワークと協力で一緒に問題解決するのが好きだ', type: 'S' },
    { id: 'S3', text: '他者の感情に共感してサポートするのが自然にできる', type: 'S' },
    { id: 'S4', text: '社会的問題に関心を持ち貢献したい', type: 'S' },
    { id: 'E1', text: '人を説得したりリードしたりするのが楽しい', type: 'E' },
    { id: 'E2', text: '目標を立てて戦略的に推進するのが自然にできる', type: 'E' },
    { id: 'E3', text: '新しいビジネスアイデアや機会を発見することに興奮する', type: 'E' },
    { id: 'E4', text: '競争状況でより意欲が湧く', type: 'E' },
    { id: 'C1', text: '体系的かつ正確に業務を処理するのが得意だ', type: 'C' },
    { id: 'C2', text: 'ルールや手順に従うことで安心感を得る', type: 'C' },
    { id: 'C3', text: 'データ、数字、記録を整理することに満足感がある', type: 'C' },
    { id: 'C4', text: '細部に注意を払い誤りを見つけるのが自然にできる', type: 'C' },
  ],
}

export interface TypeDetail { description: string; environments: string[] }
// ko/en/ja only — RiasecQuickTest.tsx extends this with zh/fr/es entries
// rather than duplicating these three locales' text.
export const TYPE_DETAILS: Record<RiasecType, Record<SupportedLang, TypeDetail>> = {
  R: {
    ko: { description: '현실형 흥미는 구체적이고 실용적인 활동, 도구 사용, 눈에 보이는 결과물과 가까울 수 있습니다.', environments: ['손으로 만들고 점검하는 현장', '도구·장비를 다루는 실습 환경', '구체적인 문제를 바로 해결하는 업무'] },
    en: { description: 'Realistic interests can align with concrete, practical activity, tool use, and visible outcomes.', environments: ['hands-on building and inspection', 'practical settings with tools or equipment', 'work that solves concrete problems directly'] },
    ja: { description: '現実型の興味は、具体的で実践的な活動、道具の使用、目に見える成果と結びつくことがあります。', environments: ['手を動かして作り点検する現場', '道具や設備を扱う実習環境', '具体的な問題を直接解決する仕事'] },
  },
  I: {
    ko: { description: '탐구형 흥미는 질문을 깊게 파고들고 자료를 분석하며 원리를 이해하는 활동과 가까울 수 있습니다.', environments: ['충분히 조사하고 가설을 검토하는 환경', '데이터와 근거로 판단하는 업무', '복잡한 문제를 혼자 깊게 탐색할 시간'] },
    en: { description: 'Investigative interests can align with deep questions, evidence analysis, and understanding how things work.', environments: ['time to research and test hypotheses', 'evidence-led analytical work', 'space for sustained exploration of complex problems'] },
    ja: { description: '研究型の興味は、問いを深く掘り下げ、資料を分析し、原理を理解する活動と結びつくことがあります。', environments: ['十分に調べ仮説を検討できる環境', 'データと根拠で判断する仕事', '複雑な問題を深く探究する時間'] },
  },
  A: {
    ko: { description: '예술형 흥미는 새로운 방식으로 표현하고 모호한 문제에 독창적인 답을 만드는 활동과 가까울 수 있습니다.', environments: ['표현 방식에 재량이 있는 프로젝트', '글·이미지·소리로 아이디어를 만드는 환경', '정답이 하나가 아닌 문제를 다루는 업무'] },
    en: { description: 'Artistic interests can align with original expression and creating fresh responses to open-ended problems.', environments: ['projects with freedom over expression', 'work that shapes ideas through words, images, or sound', 'open-ended problems without one fixed answer'] },
    ja: { description: '芸術型の興味は、新しい方法で表現し、曖昧な課題に独自の答えを作る活動と結びつくことがあります。', environments: ['表現方法に裁量があるプロジェクト', '言葉・画像・音でアイデアを形にする環境', '正解が一つではない課題を扱う仕事'] },
  },
  S: {
    ko: { description: '사회형 흥미는 사람의 성장과 이해를 돕고 협력으로 문제를 푸는 활동과 가까울 수 있습니다.', environments: ['설명하고 피드백을 주고받는 팀', '사람의 변화 과정을 지원하는 업무', '관계와 협력이 중요한 서비스 환경'] },
    en: { description: 'Social interests can align with helping people learn, understand, and solve problems collaboratively.', environments: ['teams built around explanation and feedback', 'work that supports another person’s progress', 'service settings where relationships and cooperation matter'] },
    ja: { description: '社会型の興味は、人の成長や理解を助け、協力して問題を解く活動と結びつくことがあります。', environments: ['説明とフィードバックを交わすチーム', '人の変化の過程を支える仕事', '関係と協力が重要なサービス環境'] },
  },
  E: {
    ko: { description: '진취형 흥미는 목표를 정하고 사람을 설득하며 자원을 모아 실행하는 활동과 가까울 수 있습니다.', environments: ['의사결정과 추진 책임이 있는 프로젝트', '아이디어를 제안하고 합의를 만드는 업무', '성과 목표와 피드백이 분명한 환경'] },
    en: { description: 'Enterprising interests can align with setting direction, persuading others, and organizing resources for action.', environments: ['projects with ownership for decisions and momentum', 'work that pitches ideas and builds agreement', 'settings with clear goals and feedback'] },
    ja: { description: '企業型の興味は、目標を定め、人を説得し、資源を集めて実行する活動と結びつくことがあります。', environments: ['意思決定と推進の責任があるプロジェクト', 'アイデアを提案し合意を作る仕事', '成果目標とフィードバックが明確な環境'] },
  },
  C: {
    ko: { description: '관습형 흥미는 정보를 정확히 정리하고 절차를 개선하며 안정적으로 운영하는 활동과 가까울 수 있습니다.', environments: ['기준과 역할이 명확한 운영 환경', '자료를 분류하고 오류를 점검하는 업무', '반복 과정을 더 정확하게 만드는 프로젝트'] },
    en: { description: 'Conventional interests can align with organizing information accurately, improving procedures, and keeping operations reliable.', environments: ['operations with clear roles and standards', 'work that classifies information and checks errors', 'projects that make repeatable processes more accurate'] },
    ja: { description: '慣習型の興味は、情報を正確に整理し、手順を改善し、安定して運用する活動と結びつくことがあります。', environments: ['基準と役割が明確な運用環境', '資料を分類し誤りを確認する仕事', '反復工程をより正確にするプロジェクト'] },
  },
}

interface Props { locale?: string }

export default function RiasecCareerTest({ locale: lp = 'ko' }: Props) {
  const locale = lang(lp ?? 'ko')
  const resultLocale = (['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const).includes(lp as AssessmentLocale)
    ? lp as AssessmentLocale
    : 'en'
  const lb = LABELS[locale]
  const questions = QUESTIONS[locale]

  const [current, setCurrent] = useState(0)
  const [scores, setScores] = useState<Record<RiasecType, number>>({ R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 })
  const [responses, setResponses] = useState<AssessmentResponses>({})
  const [done, setDone] = useState(false)

  function pick(val: number) {
    const q = questions[current]
    const newScores = { ...scores, [q.type]: scores[q.type] + val }
    setResponses({ ...responses, [q.id]: val })
    if (current + 1 >= questions.length) { setScores(newScores); setDone(true) }
    else { setScores(newScores); setCurrent(current + 1) }
  }

  function previous() {
    if (current === 0) return
    const previousQuestion = questions[current - 1]
    const previousValue = responses[previousQuestion.id] ?? 0
    setScores({ ...scores, [previousQuestion.type]: scores[previousQuestion.type] - previousValue })
    setCurrent(current - 1)
  }

  function restart() { setScores({ R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }); setResponses({}); setCurrent(0); setDone(false) }

  // Record the result once, when the quiz is actually finished.
  useEffect(() => {
    if (!done) return
    const profile = buildRiasecProfile(scores, { min: 4, max: 20 })
    recordTestResult({
      kind: 'psychometric',
      testId: 'riasec',
      title: lb.title,
      resultLabel: profile.isMixed ? lb.mixedTitle : profile.code,
      inputs: { scores },
      result: { code: profile.code, scores, interpretation: profile.isMixed ? 'mixed' : 'clear' },
      locale: resultLocale,
      sourcePath: `/${resultLocale}/riasec-career-test`,
    })
    recordAssessmentResult(buildRiasecResult(riasecFullPlugin, responses, {
      locale: resultLocale,
      sourcePath: `/${resultLocale}/riasec-career-test`,
    }))
    gaEvent('test_completed', { test_id: 'riasec' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])

  function share() {
    gaEvent('share_click', { test_id: 'riasec' })
    const profile = buildRiasecProfile(scores, { min: 4, max: 20 })
    const url = `${window.location.origin}${window.location.pathname}`
    const text = `${lb.shareMsg}: ${profile.isMixed ? lb.mixedTitle : profile.code}`
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
        question={`${lb.typeNames[q.type]} · ${q.text}`}
        questionLabel={lb.questionOf(current + 1, questions.length)}
        progress={progress}
        options={lb.scaleLabels.map((label, i) => ({ label, value: i + 1 }))}
        selectedValue={responses[q.id]}
        note={lb.note}
        previousLabel={locale === 'ko' ? '이전 질문' : locale === 'ja' ? '前の質問' : 'Previous question'}
        onPrevious={current > 0 ? previous : undefined}
        onSelect={pick}
      />
    )
  }

  const resultProfile = buildRiasecProfile(scores, { min: 4, max: 20 })
  const sorted = resultProfile.ranked.map(({ type }) => type)
  const topCode = resultProfile.code
  const resultTitle = resultProfile.isMixed ? lb.mixedTitle : topCode
  const resultBody = resultProfile.isLowFlat ? lb.lowFlatBody : resultProfile.isMixed ? lb.mixedBody : lb.clearBody
  const interpretationTypes = resultProfile.interpretationTypes
  const minScore = 4
  const maxScore = 20

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">{resultProfile.isMixed ? lb.mixedTitle : lb.yourCode}</p>
        {!resultProfile.isMixed && <div className="text-4xl font-bold tracking-widest">{topCode.split('').map(c => (
          <span key={c} style={{ color: RIASEC_COLORS[c as RiasecType] }}>{c}</span>
        ))}</div>}
        <p className="text-sm text-muted-foreground">{resultBody}</p>
      </div>
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h3 className="font-bold text-sm">{lb.profile}</h3>
        <p className="text-xs text-muted-foreground">{lb.rawRange(minScore, maxScore)}</p>
        <dl className="space-y-3">
        {resultProfile.ranked.map(({ type, score, percent }) => {
          return (
            <div key={type} className="space-y-1">
              <div className="flex justify-between text-xs">
                <dt className="font-bold" style={{ color: RIASEC_COLORS[type] }}>{type} — {lb.typeNames[type]}</dt>
                <dd>{score}/{maxScore} ({percent}%)</dd>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden" aria-hidden="true">
                <div className="h-full rounded-full transition-all duration-500 motion-reduce:transition-none" style={{ width: `${percent}%`, backgroundColor: RIASEC_COLORS[type] }} />
              </div>
            </div>
          )
        })}
        </dl>
      </div>
      {interpretationTypes.map(type => (
        <div key={type} className="rounded-xl border bg-card p-4 space-y-2">
          <h3 className="font-bold text-sm" style={{ color: RIASEC_COLORS[type] }}>{lb.typeNames[type]} ({lb.typeFull[type]})</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{TYPE_DETAILS[type][locale].description}</p>
          <h4 className="font-bold text-xs text-muted-foreground mt-2">{lb.environments}</h4>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {TYPE_DETAILS[type][locale].environments.map(environment => <li key={environment}>{environment}</li>)}
          </ul>
        </div>
      ))}
      <p className="rounded-xl border bg-muted/40 p-4 text-sm">{lb.tryNext}</p>
      <p className="text-center text-xs text-muted-foreground">{lb.note}</p>
      <ShareResultButton
        locale={locale}
        heading={lb.yourCode}
        emoji="🧭"
        resultTitle={resultTitle}
        description={resultProfile.isMixed ? lb.mixedBody : sorted.slice(0, 3).map(t => lb.typeNames[t]).join(' · ')}
      />
      <div className="flex gap-3">
        <button onClick={restart} aria-label={lb.restart} className="min-h-11 flex-1 rounded-xl border bg-card px-4 py-2 text-sm font-bold hover:bg-accent transition-colors">{lb.restart}</button>
        <button onClick={share} aria-label={lb.share} className="min-h-11 flex-1 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-bold hover:opacity-90 transition-opacity">{lb.share}</button>
      </div>
    </div>
  )
}
