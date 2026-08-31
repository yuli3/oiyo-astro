import { useEffect, useState } from 'react'
import { Questionnaire } from '@/components/ui/questionnaire'
import ShareResultButton from '../shared/ShareResultButton'
import { recordTestResult } from '@/lib/user/test-results'
import { gaEvent } from '@/lib/analytics/ga-event'
import { RIASEC_COLORS, TYPE_DETAILS, type TypeDetail } from './RiasecCareerTest'
import { buildRiasecProfile, RIASEC_TYPES, type RiasecType } from '../../lib/riasec-profile'
import {
  buildRiasecResult,
  recordAssessmentResult,
  riasecQuickPlugin,
  type AssessmentResponses,
} from '@/assessments'

// /riasec-quick — the 18-question (3/type) sibling of the 24-question
// RiasecCareerTest.tsx. Shares RIASEC_COLORS/TYPE_DETAILS/RiasecType from
// that component (imported above) instead of redefining them; everything
// locale/copy/question-specific below is quick-test-only.
type QuickLang = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'

function lang(locale: string): QuickLang {
  return (['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const).includes(locale as QuickLang) ? (locale as QuickLang) : 'en'
}

interface Question { id: string; text: string; type: RiasecType }

const LABELS: Record<QuickLang, {
  title: string; subtitle: string
  questionOf: (c: number, t: number) => string
  scaleLabels: [string, string, string, string, string]
  restart: string; share: string; shareMsg: string
  yourCode: string; topTypes: string; environments: string
  profile: string; note: string; mixedTitle: string; mixedBody: string
  clearBody: string; lowFlatBody: string; rawRange: (min: number, max: number) => string
  tryNext: string
  detailedCta: string; detailedSub: string
  typeNames: Record<RiasecType, string>
  typeFull: Record<RiasecType, string>
}> = {
  ko: {
    title: 'RIASEC 직업 흥미 빠른 검사',
    subtitle: '18문항으로 3분 만에 알아보기',
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
    mixedTitle: '여러 흥미가 함께 나타난 혼합 프로필', mixedBody: '점수 차이가 작아 하나의 유형으로 단정하기 어렵습니다. 상위 흥미가 함께 쓰이는 환경을 비교해 보세요.',
    clearBody: '현재 응답에서는 아래 흥미가 비교적 뚜렷합니다. 직업명보다 실제 업무와 환경을 기준으로 확인하세요.',
    lowFlatBody: '전반적인 점수가 낮고 비슷합니다. 코드보다 작은 활동 실험부터 시작하세요.',
    rawRange: (min, max) => `유형별 원점수 범위 ${min}–${max}점`, tryNext: '관심 가는 활동 하나를 20분 체험하고 에너지와 몰입도를 기록해 보세요.',
    detailedCta: '24문항 정밀 검사로 더 자세히 알아보기 →',
    detailedSub: '문항을 늘려 유형별 점수를 더 정교하게 확인할 수 있어요',
    typeNames: { R: '현실형', I: '탐구형', A: '예술형', S: '사회형', E: '진취형', C: '관습형' },
    typeFull: { R: 'Realistic', I: 'Investigative', A: 'Artistic', S: 'Social', E: 'Enterprising', C: 'Conventional' },
  },
  en: {
    title: 'RIASEC Quick Career Test',
    subtitle: 'Find your Holland Code in 18 questions',
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
    mixedTitle: 'A blended interest profile', mixedBody: 'The gaps are too small for a single-type claim. Compare settings where your leading interests can work together.',
    clearBody: 'These interests are relatively distinct here. Check real tasks and settings rather than treating job titles as prescriptions.',
    lowFlatBody: 'Scores are low and similar overall. Start with a small activity experiment rather than a code.',
    rawRange: (min, max) => `Raw score range per type: ${min}–${max}`, tryNext: 'Try one appealing activity for 20 minutes and note your energy and engagement.',
    detailedCta: 'Get a deeper read with the 24-question test →',
    detailedSub: 'More questions give a more precise score per type',
    typeNames: { R: 'Realistic', I: 'Investigative', A: 'Artistic', S: 'Social', E: 'Enterprising', C: 'Conventional' },
    typeFull: { R: 'Realistic', I: 'Investigative', A: 'Artistic', S: 'Social', E: 'Enterprising', C: 'Conventional' },
  },
  ja: {
    title: 'RIASEC 職業興味 クイック検査',
    subtitle: '18問・3分でわかる',
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
    mixedTitle: '複数の興味が表れた混合プロフィール', mixedBody: '得点差が小さいため、一つのタイプに断定できません。上位の興味を組み合わせられる環境を比べましょう。',
    clearBody: '今回の回答では次の興味が比較的明確です。職業名ではなく実際の作業と環境で確かめてください。',
    lowFlatBody: '全体の得点が低く似ています。コードより小さな活動実験から始めましょう。',
    rawRange: (min, max) => `タイプ別の素点範囲 ${min}–${max}点`, tryNext: '気になる活動を一つ20分試し、エネルギーと集中度を記録してみましょう。',
    detailedCta: '24問の精密検査でさらに詳しく →',
    detailedSub: '問題数を増やしてタイプ別スコアをより精密に確認できます',
    typeNames: { R: '現実型', I: '研究型', A: '芸術型', S: '社会型', E: '企業型', C: '慣習型' },
    typeFull: { R: 'Realistic', I: 'Investigative', A: 'Artistic', S: 'Social', E: 'Enterprising', C: 'Conventional' },
  },
  zh: {
    title: 'RIASEC职业兴趣快速测试',
    subtitle: '18道题，3分钟了解自己',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['完全不是', '有点不是', '一般', '有点是', '非常是'],
    restart: '重新测试',
    share: '分享结果',
    shareMsg: '我的RIASEC霍兰德代码',
    yourCode: '我的霍兰德代码',
    topTypes: '主要类型说明',
    environments: '你可能偏好的工作环境示例',
    profile: '6维度兴趣概况',
    note: '本结果仅用于非诊断性的兴趣反思，不判定职业适配度或能力。',
    mixedTitle: '多种兴趣并存的混合画像', mixedBody: '分数差距较小，不宜断定为单一类型。请比较能结合主要兴趣的工作环境。',
    clearBody: '本次回答中这些兴趣相对突出。请根据实际任务和环境探索，而不是把职业名称当作结论。',
    lowFlatBody: '整体分数较低且接近。与其依赖代码，不如先做一个小型活动实验。',
    rawRange: (min, max) => `各类型原始分范围：${min}–${max}`, tryNext: '选择一项感兴趣的活动体验20分钟，并记录精力和投入感。',
    detailedCta: '用24题精密测试深入了解 →',
    detailedSub: '题目更多，各类型得分也更精确',
    typeNames: { R: '现实型', I: '研究型', A: '艺术型', S: '社会型', E: '企业型', C: '传统型' },
    typeFull: { R: 'Realistic', I: 'Investigative', A: 'Artistic', S: 'Social', E: 'Enterprising', C: 'Conventional' },
  },
  fr: {
    title: 'Test rapide RIASEC',
    subtitle: 'Découvrez votre code Holland en 18 questions',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Pas du tout', 'Un peu pas', 'Neutre', 'Plutôt', 'Tout à fait'],
    restart: 'Recommencer',
    share: 'Partager le résultat',
    shareMsg: 'Mon code Holland RIASEC',
    yourCode: 'Mon code Holland',
    topTypes: 'Description des types principaux',
    environments: 'Exemples d’environnements de travail possibles',
    profile: 'Profil d\'intérêt en 6 dimensions',
    note: 'Ce résultat est une réflexion non diagnostique sur les intérêts; il ne détermine ni aptitude ni capacité.',
    mixedTitle: 'Un profil d’intérêts mixte', mixedBody: 'Les écarts sont trop faibles pour conclure à un seul type. Comparez des contextes qui combinent vos intérêts principaux.',
    clearBody: 'Ces intérêts ressortent relativement ici. Explorez les tâches et contextes réels plutôt que de prescrire un métier.',
    lowFlatBody: 'Les scores sont globalement faibles et proches. Commencez par une petite expérience d’activité plutôt que par un code.',
    rawRange: (min, max) => `Plage du score brut par type : ${min}–${max}`, tryNext: 'Essayez une activité attirante pendant 20 minutes et notez votre énergie et votre engagement.',
    detailedCta: 'Approfondir avec le test complet de 24 questions →',
    detailedSub: 'Plus de questions donnent un score plus précis par type',
    typeNames: { R: 'Réaliste', I: 'Investigateur', A: 'Artistique', S: 'Social', E: 'Entreprenant', C: 'Conventionnel' },
    typeFull: { R: 'Realistic', I: 'Investigative', A: 'Artistic', S: 'Social', E: 'Enterprising', C: 'Conventional' },
  },
  es: {
    title: 'Test rápido RIASEC',
    subtitle: 'Descubre tu código Holland en 18 preguntas',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Para nada', 'Un poco no', 'Neutral', 'Algo', 'Mucho'],
    restart: 'Repetir',
    share: 'Compartir resultado',
    shareMsg: 'Mi código Holland RIASEC',
    yourCode: 'Mi código Holland',
    topTypes: 'Descripción de tipos principales',
    environments: 'Ejemplos de entornos de trabajo que podrías preferir',
    profile: 'Perfil de interés en 6 dimensiones',
    note: 'Este resultado es una reflexión no diagnóstica sobre intereses; no determina aptitud ni capacidad profesional.',
    mixedTitle: 'Un perfil de intereses combinado', mixedBody: 'Las diferencias son demasiado pequeñas para afirmar un solo tipo. Compara entornos que combinen tus intereses principales.',
    clearBody: 'Estos intereses destacan relativamente aquí. Explora tareas y entornos reales en vez de tomar títulos profesionales como prescripción.',
    lowFlatBody: 'Las puntuaciones son bajas y similares en general. Empieza con un pequeño experimento de actividad en lugar de un código.',
    rawRange: (min, max) => `Rango de puntuación bruta por tipo: ${min}–${max}`, tryNext: 'Prueba una actividad atractiva durante 20 minutos y anota tu energía e implicación.',
    detailedCta: 'Profundiza con el test completo de 24 preguntas →',
    detailedSub: 'Más preguntas dan una puntuación más precisa por tipo',
    typeNames: { R: 'Realista', I: 'Investigador', A: 'Artístico', S: 'Social', E: 'Emprendedor', C: 'Convencional' },
    typeFull: { R: 'Realistic', I: 'Investigative', A: 'Artistic', S: 'Social', E: 'Enterprising', C: 'Conventional' },
  },
}

// 18 questions = 3 per type, selected from RiasecCareerTest.tsx's 24
// (the clearest/most representative 3 of each type's original 4; ko/en/ja
// text is copied verbatim from there, zh/fr/es are new translations of the
// same picked items).
const QUESTIONS: Record<QuickLang, Question[]> = {
  ko: [
    { id: 'R1', text: '기계나 도구를 조작하고 수리하는 것을 즐긴다', type: 'R' },
    { id: 'R3', text: '직접 손을 사용해 무언가를 만들거나 조립하는 것이 좋다', type: 'R' },
    { id: 'R4', text: '실질적이고 구체적인 문제를 해결하는 것이 즐겁다', type: 'R' },
    { id: 'I1', text: '복잡한 문제를 분석하고 원리를 이해하는 것이 즐겁다', type: 'I' },
    { id: 'I2', text: '과학적 실험이나 연구 활동에 흥미를 느낀다', type: 'I' },
    { id: 'I4', text: '데이터를 수집하고 분석해 결론을 도출하는 것이 만족스럽다', type: 'I' },
    { id: 'A1', text: '음악, 미술, 글쓰기 등 창의적 활동에서 기쁨을 느낀다', type: 'A' },
    { id: 'A2', text: '나만의 독창적인 방식으로 무언가를 표현하고 싶다', type: 'A' },
    { id: 'A3', text: '아름다움, 미적 감각, 디자인에 깊은 관심이 있다', type: 'A' },
    { id: 'S1', text: '사람들을 가르치거나 돕고 상담하는 것이 보람 있다', type: 'S' },
    { id: 'S2', text: '팀워크와 협력을 통해 함께 문제를 해결하는 것이 좋다', type: 'S' },
    { id: 'S3', text: '다른 사람의 감정에 공감하고 지원하는 것이 자연스럽다', type: 'S' },
    { id: 'E1', text: '사람들을 설득하고 리드하는 것이 즐겁다', type: 'E' },
    { id: 'E2', text: '목표를 세우고 전략적으로 추진하는 것이 자연스럽다', type: 'E' },
    { id: 'E3', text: '새로운 사업 아이디어나 기회를 발견하는 것이 설레인다', type: 'E' },
    { id: 'C1', text: '체계적이고 정확하게 업무를 처리하는 것이 편하다', type: 'C' },
    { id: 'C3', text: '데이터, 숫자, 기록을 정리하는 것이 만족스럽다', type: 'C' },
    { id: 'C4', text: '세부사항에 주의를 기울이고 오류를 찾아내는 것이 자연스럽다', type: 'C' },
  ],
  en: [
    { id: 'R1', text: 'I enjoy operating and repairing machines or tools', type: 'R' },
    { id: 'R3', text: 'I enjoy making or assembling things with my hands', type: 'R' },
    { id: 'R4', text: 'I find it satisfying to solve practical, concrete problems', type: 'R' },
    { id: 'I1', text: 'I enjoy analyzing complex problems and understanding their principles', type: 'I' },
    { id: 'I2', text: 'I\'m interested in scientific experiments or research activities', type: 'I' },
    { id: 'I4', text: 'I find it satisfying to collect data, analyze it, and draw conclusions', type: 'I' },
    { id: 'A1', text: 'I feel joy in creative activities like music, art, or writing', type: 'A' },
    { id: 'A2', text: 'I want to express myself in my own unique way', type: 'A' },
    { id: 'A3', text: 'I have a deep interest in beauty, aesthetics, and design', type: 'A' },
    { id: 'S1', text: 'Teaching, helping, or counseling people feels rewarding', type: 'S' },
    { id: 'S2', text: 'I enjoy solving problems collaboratively through teamwork', type: 'S' },
    { id: 'S3', text: 'Empathizing with and supporting others comes naturally to me', type: 'S' },
    { id: 'E1', text: 'I enjoy persuading and leading people', type: 'E' },
    { id: 'E2', text: 'Setting goals and pursuing them strategically feels natural', type: 'E' },
    { id: 'E3', text: 'Discovering new business ideas or opportunities excites me', type: 'E' },
    { id: 'C1', text: 'I\'m comfortable handling tasks in an organized, accurate way', type: 'C' },
    { id: 'C3', text: 'Organizing data, numbers, and records feels satisfying', type: 'C' },
    { id: 'C4', text: 'Paying attention to details and catching errors comes naturally', type: 'C' },
  ],
  ja: [
    { id: 'R1', text: '機械や道具を操作・修理することを楽しむ', type: 'R' },
    { id: 'R3', text: '手を使って何かを作ったり組み立てたりするのが好きだ', type: 'R' },
    { id: 'R4', text: '実際的で具体的な問題を解決するのが楽しい', type: 'R' },
    { id: 'I1', text: '複雑な問題を分析し、原理を理解することが楽しい', type: 'I' },
    { id: 'I2', text: '科学的な実験や研究活動に興味を感じる', type: 'I' },
    { id: 'I4', text: 'データを収集・分析して結論を導くことが満足できる', type: 'I' },
    { id: 'A1', text: '音楽、美術、執筆などの創造的活動に喜びを感じる', type: 'A' },
    { id: 'A2', text: '自分独自の方法で何かを表現したい', type: 'A' },
    { id: 'A3', text: '美しさ、美的感覚、デザインに深い関心がある', type: 'A' },
    { id: 'S1', text: '人を教えたり助けたり相談に乗ることにやりがいを感じる', type: 'S' },
    { id: 'S2', text: 'チームワークと協力で一緒に問題解決するのが好きだ', type: 'S' },
    { id: 'S3', text: '他者の感情に共感してサポートするのが自然にできる', type: 'S' },
    { id: 'E1', text: '人を説得したりリードしたりするのが楽しい', type: 'E' },
    { id: 'E2', text: '目標を立てて戦略的に推進するのが自然にできる', type: 'E' },
    { id: 'E3', text: '新しいビジネスアイデアや機会を発見することに興奮する', type: 'E' },
    { id: 'C1', text: '体系的かつ正確に業務を処理するのが得意だ', type: 'C' },
    { id: 'C3', text: 'データ、数字、記録を整理することに満足感がある', type: 'C' },
    { id: 'C4', text: '細部に注意を払い誤りを見つけるのが自然にできる', type: 'C' },
  ],
  zh: [
    { id: 'R1', text: '我喜欢操作和维修机械或工具', type: 'R' },
    { id: 'R3', text: '我喜欢亲手制作或组装东西', type: 'R' },
    { id: 'R4', text: '解决实际具体的问题让我感到满足', type: 'R' },
    { id: 'I1', text: '分析复杂问题并理解其原理让我感到愉快', type: 'I' },
    { id: 'I2', text: '我对科学实验或研究活动很感兴趣', type: 'I' },
    { id: 'I4', text: '收集数据、分析并得出结论让我感到满足', type: 'I' },
    { id: 'A1', text: '音乐、美术、写作等创意活动让我感到快乐', type: 'A' },
    { id: 'A2', text: '我想用自己独特的方式表达自我', type: 'A' },
    { id: 'A3', text: '我对美、美感和设计有浓厚的兴趣', type: 'A' },
    { id: 'S1', text: '教导、帮助或辅导他人让我感到有意义', type: 'S' },
    { id: 'S2', text: '我喜欢通过团队合作共同解决问题', type: 'S' },
    { id: 'S3', text: '我很自然地能理解并支持他人的情感', type: 'S' },
    { id: 'E1', text: '说服和带领他人让我感到愉快', type: 'E' },
    { id: 'E2', text: '设定目标并有策略地推进对我来说很自然', type: 'E' },
    { id: 'E3', text: '发现新的商业创意或机会让我感到兴奋', type: 'E' },
    { id: 'C1', text: '系统而准确地处理工作让我感到自在', type: 'C' },
    { id: 'C3', text: '整理数据、数字和记录让我感到满足', type: 'C' },
    { id: 'C4', text: '关注细节并发现错误对我来说很自然', type: 'C' },
  ],
  fr: [
    { id: 'R1', text: "J'aime manier et réparer des machines ou des outils", type: 'R' },
    { id: 'R3', text: 'J\'aime fabriquer ou assembler des choses de mes mains', type: 'R' },
    { id: 'R4', text: 'Résoudre des problèmes pratiques et concrets me satisfait', type: 'R' },
    { id: 'I1', text: "J'aime analyser des problèmes complexes et comprendre leurs principes", type: 'I' },
    { id: 'I2', text: "Les expériences scientifiques et les activités de recherche m'intéressent", type: 'I' },
    { id: 'I4', text: 'Recueillir des données, les analyser et en tirer des conclusions me satisfait', type: 'I' },
    { id: 'A1', text: "Les activités créatives comme la musique, l'art ou l'écriture me procurent de la joie", type: 'A' },
    { id: 'A2', text: "Je veux m'exprimer à ma façon, de manière unique", type: 'A' },
    { id: 'A3', text: "J'ai un vif intérêt pour la beauté, l'esthétique et le design", type: 'A' },
    { id: 'S1', text: 'Enseigner, aider ou conseiller les autres est gratifiant pour moi', type: 'S' },
    { id: 'S2', text: "J'aime résoudre des problèmes en équipe, par la collaboration", type: 'S' },
    { id: 'S3', text: 'Comprendre et soutenir les émotions des autres me vient naturellement', type: 'S' },
    { id: 'E1', text: "J'aime persuader et diriger les autres", type: 'E' },
    { id: 'E2', text: 'Fixer des objectifs et les poursuivre stratégiquement me vient naturellement', type: 'E' },
    { id: 'E3', text: "Découvrir de nouvelles idées ou opportunités d'affaires m'enthousiasme", type: 'E' },
    { id: 'C1', text: 'Je me sens à l\'aise pour traiter les tâches de façon organisée et précise', type: 'C' },
    { id: 'C3', text: 'Organiser des données, des chiffres et des dossiers me satisfait', type: 'C' },
    { id: 'C4', text: 'Prêter attention aux détails et repérer les erreurs me vient naturellement', type: 'C' },
  ],
  es: [
    { id: 'R1', text: 'Disfruto usando y reparando máquinas o herramientas', type: 'R' },
    { id: 'R3', text: 'Me gusta hacer o ensamblar cosas con mis propias manos', type: 'R' },
    { id: 'R4', text: 'Me resulta satisfactorio resolver problemas prácticos y concretos', type: 'R' },
    { id: 'I1', text: 'Disfruto analizando problemas complejos y comprendiendo sus principios', type: 'I' },
    { id: 'I2', text: 'Me interesan los experimentos científicos y las actividades de investigación', type: 'I' },
    { id: 'I4', text: 'Me satisface recopilar datos, analizarlos y sacar conclusiones', type: 'I' },
    { id: 'A1', text: 'Las actividades creativas como la música, el arte o la escritura me traen alegría', type: 'A' },
    { id: 'A2', text: 'Quiero expresarme a mi manera única', type: 'A' },
    { id: 'A3', text: 'Tengo un profundo interés por la belleza, la estética y el diseño', type: 'A' },
    { id: 'S1', text: 'Enseñar, ayudar o aconsejar a las personas me resulta gratificante', type: 'S' },
    { id: 'S2', text: 'Me gusta resolver problemas en equipo, de forma colaborativa', type: 'S' },
    { id: 'S3', text: 'Empatizar y apoyar a los demás me resulta natural', type: 'S' },
    { id: 'E1', text: 'Disfruto persuadiendo y liderando a otras personas', type: 'E' },
    { id: 'E2', text: 'Fijar metas y perseguirlas de forma estratégica me resulta natural', type: 'E' },
    { id: 'E3', text: 'Descubrir nuevas ideas u oportunidades de negocio me entusiasma', type: 'E' },
    { id: 'C1', text: 'Me siento cómodo gestionando tareas de forma organizada y precisa', type: 'C' },
    { id: 'C3', text: 'Organizar datos, números y registros me resulta satisfactorio', type: 'C' },
    { id: 'C4', text: 'Prestar atención a los detalles y detectar errores me resulta natural', type: 'C' },
  ],
}

// zh/fr/es descriptions + work-environment examples, extending TYPE_DETAILS (ko/en/ja) from
// RiasecCareerTest.tsx so the two components share one source for those
// three locales instead of duplicating them.
const TYPE_DETAILS_EXTRA: Record<RiasecType, Record<'zh' | 'fr' | 'es', TypeDetail>> = {
  R: {
    zh: { description: '现实型兴趣可能更接近具体、实用的活动、工具使用和看得见的成果。', environments: ['动手制作和检查的现场', '使用工具或设备的实践环境', '直接解决具体问题的工作'] },
    fr: { description: 'Les intérêts réalistes peuvent correspondre aux activités concrètes, à l’usage d’outils et aux résultats visibles.', environments: ['fabrication et contrôle pratiques', 'contextes avec outils ou équipements', 'travail qui résout directement des problèmes concrets'] },
    es: { description: 'Los intereses realistas pueden relacionarse con actividades concretas, uso de herramientas y resultados visibles.', environments: ['fabricación e inspección práctica', 'entornos con herramientas o equipos', 'trabajo que resuelve problemas concretos directamente'] },
  },
  I: {
    zh: { description: '研究型兴趣可能更接近深入提问、分析证据和理解原理。', environments: ['有时间研究和检验假设', '以数据和证据判断的工作', '持续探索复杂问题的空间'] },
    fr: { description: 'Les intérêts investigateurs peuvent correspondre aux questions approfondies, à l’analyse des preuves et à la compréhension des mécanismes.', environments: ['temps pour rechercher et tester des hypothèses', 'travail analytique fondé sur les preuves', 'espace pour explorer des problèmes complexes'] },
    es: { description: 'Los intereses investigadores pueden relacionarse con preguntas profundas, análisis de evidencias y comprensión de principios.', environments: ['tiempo para investigar y probar hipótesis', 'trabajo analítico basado en evidencias', 'espacio para explorar problemas complejos'] },
  },
  A: {
    zh: { description: '艺术型兴趣可能更接近原创表达，以及为开放性问题创造新答案。', environments: ['表达方式有自主空间的项目', '用文字、图像或声音塑造创意', '处理没有唯一答案的问题'] },
    fr: { description: 'Les intérêts artistiques peuvent correspondre à l’expression originale et aux réponses nouvelles à des problèmes ouverts.', environments: ['projets laissant de la liberté d’expression', 'création d’idées par les mots, l’image ou le son', 'problèmes ouverts sans réponse unique'] },
    es: { description: 'Los intereses artísticos pueden relacionarse con la expresión original y respuestas nuevas a problemas abiertos.', environments: ['proyectos con libertad expresiva', 'ideas creadas con palabras, imágenes o sonido', 'problemas abiertos sin una única respuesta'] },
  },
  S: {
    zh: { description: '社会型兴趣可能更接近帮助他人学习、理解并通过合作解决问题。', environments: ['重视讲解和反馈的团队', '支持他人成长过程的工作', '关系与合作重要的服务环境'] },
    fr: { description: 'Les intérêts sociaux peuvent correspondre à aider les autres à apprendre, comprendre et résoudre ensemble des problèmes.', environments: ['équipes axées sur l’explication et le retour', 'travail qui soutient la progression d’autrui', 'services où relations et coopération comptent'] },
    es: { description: 'Los intereses sociales pueden relacionarse con ayudar a aprender, comprender y resolver problemas en colaboración.', environments: ['equipos centrados en explicación y feedback', 'trabajo que apoya el progreso de otras personas', 'servicios donde importan relaciones y cooperación'] },
  },
  E: {
    zh: { description: '进取型兴趣可能更接近设定方向、说服他人并组织资源执行。', environments: ['负责决策和推进的项目', '提出想法并建立共识的工作', '目标和反馈清晰的环境'] },
    fr: { description: 'Les intérêts entreprenants peuvent correspondre à définir une direction, convaincre et organiser des ressources pour agir.', environments: ['projets avec responsabilité de décision', 'travail qui propose des idées et construit l’accord', 'contextes aux objectifs et retours clairs'] },
    es: { description: 'Los intereses emprendedores pueden relacionarse con marcar dirección, persuadir y organizar recursos para actuar.', environments: ['proyectos con responsabilidad de decisión', 'trabajo que propone ideas y crea acuerdos', 'entornos con objetivos y feedback claros'] },
  },
  C: {
    zh: { description: '常规型兴趣可能更接近准确整理信息、改进流程并保持可靠运作。', environments: ['标准和角色清晰的运营环境', '分类资料并检查错误的工作', '提高重复流程准确性的项目'] },
    fr: { description: 'Les intérêts conventionnels peuvent correspondre à organiser précisément l’information, améliorer les procédures et fiabiliser les opérations.', environments: ['opérations aux rôles et normes clairs', 'classement d’informations et contrôle d’erreurs', 'projets rendant les processus répétables plus précis'] },
    es: { description: 'Los intereses convencionales pueden relacionarse con organizar información, mejorar procesos y mantener operaciones fiables.', environments: ['operaciones con roles y normas claros', 'clasificación de información y revisión de errores', 'proyectos que hacen más precisos los procesos repetibles'] },
  },
}

const QUICK_TYPE_DETAILS: Record<RiasecType, Record<QuickLang, TypeDetail>> = RIASEC_TYPES.reduce(
  (acc, type) => {
    acc[type] = { ...TYPE_DETAILS[type], ...TYPE_DETAILS_EXTRA[type] }
    return acc
  },
  {} as Record<RiasecType, Record<QuickLang, TypeDetail>>,
)

interface Props { locale?: string }

export default function RiasecQuickTest({ locale: lp = 'ko' }: Props) {
  const locale = lang(lp ?? 'ko')
  const lb = LABELS[locale]
  const questions = QUESTIONS[locale]

  const [current, setCurrent] = useState(0)
  const [scores, setScores] = useState<Record<RiasecType, number>>({ R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 })
  const [responses, setResponses] = useState<AssessmentResponses>({})
  const [done, setDone] = useState(false)

  function pick(val: number) {
    if (Object.keys(responses).length === 0) gaEvent('test_started', { test_id: 'riasec-quick' })
    const q = questions[current]
    const newScores = { ...scores, [q.type]: scores[q.type] + val }
    setResponses({ ...responses, [q.id]: val })
    if (current + 1 >= questions.length) { setScores(newScores); setDone(true) }
    else { setScores(newScores); setCurrent(current + 1) }
  }

  function restart() { setScores({ R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }); setResponses({}); setCurrent(0); setDone(false) }

  // Record the result once, when the quiz is actually finished. testId is
  // 'riasec-quick' (not 'riasec') so it never overwrites/merges with the
  // 24-question test's history in oiyo:test-results:v1.
  useEffect(() => {
    if (!done) return
    const profile = buildRiasecProfile(scores, { min: 3, max: 15 })
    recordTestResult({
      kind: 'psychometric',
      testId: 'riasec-quick',
      title: lb.title,
      resultLabel: profile.isMixed ? lb.mixedTitle : profile.code,
      inputs: { scores },
      result: { code: profile.code, scores, interpretation: profile.isMixed ? 'mixed' : 'clear' },
      locale,
      sourcePath: `/${locale}/riasec-quick`,
    })
    recordAssessmentResult(buildRiasecResult(riasecQuickPlugin, responses, {
      locale,
      sourcePath: `/${locale}/riasec-quick`,
    }))
    gaEvent('test_completed', { test_id: 'riasec-quick' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])

  function share() {
    gaEvent('share_click', { test_id: 'riasec-quick' })
    const profile = buildRiasecProfile(scores, { min: 3, max: 15 })
    const url = `${window.location.origin}${window.location.pathname}`
    const text = `${lb.shareMsg}: ${profile.isMixed ? lb.mixedTitle : profile.code}`
    if (navigator.share) navigator.share({ title: lb.title, text, url })
    else navigator.clipboard.writeText(url)
  }

  if (!done) {
    const q = questions[current]
    const progress = Math.round((current / questions.length) * 100)
    return (
      /* 문항별 RIASEC 유형 배지는 Questionnaire 에 슬롯이 없어 subtitle 로 합친다.
         배지를 그냥 버리면 사용자가 보던 정보가 사라진다. */
      <Questionnaire
        title={lb.title}
        subtitle={`${lb.subtitle} · ${lb.typeNames[q.type]}`}
        question={q.text}
        questionLabel={lb.questionOf(current + 1, questions.length)}
        progress={progress}
        options={lb.scaleLabels.map((label, i) => ({ label, value: i + 1 }))}
        selectedValue={typeof responses[q.id] === 'number' ? (responses[q.id] as number) : undefined}
        note={lb.note}
        onSelect={pick}
      />
    )
  }

  const resultProfile = buildRiasecProfile(scores, { min: 3, max: 15 })
  const sorted = resultProfile.ranked.map(({ type }) => type)
  const topCode = resultProfile.code
  const resultTitle = resultProfile.isMixed ? lb.mixedTitle : topCode
  const resultBody = resultProfile.isLowFlat ? lb.lowFlatBody : resultProfile.isMixed ? lb.mixedBody : lb.clearBody
  const interpretationTypes = resultProfile.interpretationTypes
  const minScore = 3
  const maxScore = 15 // 3 questions/type * 5-point scale

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
          <p className="text-sm text-muted-foreground leading-relaxed">{QUICK_TYPE_DETAILS[type][locale].description}</p>
          <h4 className="font-bold text-xs text-muted-foreground mt-2">{lb.environments}</h4>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {QUICK_TYPE_DETAILS[type][locale].environments.map(environment => <li key={environment}>{environment}</li>)}
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
      <a
        href={`/${locale}/riasec-career-test`}
        className="block rounded-xl border-2 border-dashed border-primary/30 bg-card px-4 py-3 text-center text-sm font-bold text-primary hover:bg-accent transition-colors"
      >
        {lb.detailedCta}
        <span className="block text-xs font-normal text-muted-foreground mt-1">{lb.detailedSub}</span>
      </a>
      <div className="flex gap-3">
        <button onClick={restart} aria-label={lb.restart} className="min-h-11 flex-1 rounded-xl border bg-card px-4 py-2 text-sm font-bold hover:bg-accent transition-colors">{lb.restart}</button>
        <button onClick={share} aria-label={lb.share} className="min-h-11 flex-1 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-bold hover:opacity-90 transition-opacity">{lb.share}</button>
      </div>
    </div>
  )
}
