import { useEffect, useState } from 'react'
import ShareResultButton from '../shared/ShareResultButton'
import { recordTestResult } from '@/lib/user/test-results'
import { gaEvent } from '@/lib/analytics/ga-event'
import { RIASEC_COLORS, TYPE_DETAILS, type RiasecType, type TypeDetail } from './RiasecCareerTest'

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
  yourCode: string; topTypes: string; careers: string
  profile: string; note: string
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
    careers: '추천 직업 분야',
    profile: '6가지 흥미 프로필',
    note: 'Holland 직업 흥미 이론(RIASEC)에 기반한 간단 검사입니다. 하나의 참고 도구로 활용하세요.',
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
    careers: 'Recommended Career Fields',
    profile: '6-Dimension Interest Profile',
    note: 'A short version of Holland\'s RIASEC career interest theory. Use as one reference among many.',
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
    careers: 'おすすめ職業分野',
    profile: '6次元興味プロフィール',
    note: 'ホランドのRIASEC職業興味理論に基づく簡易検査です。一つの参考ツールとしてご活用ください。',
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
    careers: '推荐职业领域',
    profile: '6维度兴趣概况',
    note: '基于霍兰德RIASEC职业兴趣理论的简版测试，请作为参考工具使用。',
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
    careers: 'Domaines de carrière recommandés',
    profile: 'Profil d\'intérêt en 6 dimensions',
    note: 'Une version courte de la théorie RIASEC de Holland. À utiliser comme un outil de référence parmi d\'autres.',
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
    careers: 'Campos profesionales recomendados',
    profile: 'Perfil de interés en 6 dimensiones',
    note: 'Una versión corta de la teoría RIASEC de Holland. Úsala como una referencia más.',
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

// zh/fr/es descriptions + careers, extending TYPE_DETAILS (ko/en/ja) from
// RiasecCareerTest.tsx so the two components share one source for those
// three locales instead of duplicating them.
const TYPE_DETAILS_EXTRA: Record<RiasecType, Record<'zh' | 'fr' | 'es', TypeDetail>> = {
  R: {
    zh: { description: '现实型偏爱具体而实用的活动。他们喜欢操作工具和机械，或发挥身体技能，从创造看得见的成果中获得满足感。', careers: ['工程师', '建筑师', '医生/外科医生', '农业专家', '运动员', '飞行员', '技工', '消防员', '军人'] },
    fr: { description: 'Les types réalistes préfèrent les activités concrètes et pratiques. Ils aiment travailler avec des outils et des machines ou mettre en œuvre des compétences physiques, trouvant satisfaction à créer des résultats tangibles.', careers: ['Ingénieur', 'Architecte', 'Médecin/Chirurgien', 'Spécialiste agricole', 'Athlète', 'Pilote', 'Mécanicien', 'Pompier', 'Militaire'] },
    es: { description: 'Los tipos realistas prefieren actividades concretas y prácticas. Disfrutan trabajando con herramientas y máquinas o aplicando habilidades físicas, y encuentran satisfacción al crear resultados tangibles.', careers: ['Ingeniero', 'Arquitecto', 'Médico/Cirujano', 'Especialista agrícola', 'Atleta', 'Piloto', 'Mecánico', 'Bombero', 'Militar'] },
  },
  I: {
    zh: { description: '研究型拥有强烈的求知欲，喜欢分析性思考。他们在理解复杂问题和发现新知识的过程中获得深深的满足感。', careers: ['研究员/科学家', '医生', '数据分析师', '心理学家', '哲学家', '经济学家', '统计学家', '程序员', '天文学家'] },
    fr: { description: 'Les types investigateurs ont une forte curiosité intellectuelle et aiment la pensée analytique. Ils tirent une profonde satisfaction de la compréhension de problèmes complexes et de la découverte de nouvelles connaissances.', careers: ['Chercheur/Scientifique', 'Médecin', 'Analyste de données', 'Psychologue', 'Philosophe', 'Économiste', 'Statisticien', 'Programmeur', 'Astronome'] },
    es: { description: 'Los tipos investigadores tienen una fuerte curiosidad intelectual y disfrutan del pensamiento analítico. Obtienen una profunda satisfacción al comprender problemas complejos y descubrir nuevos conocimientos.', careers: ['Investigador/Científico', 'Médico', 'Analista de datos', 'Psicólogo', 'Filósofo', 'Economista', 'Estadístico', 'Programador', 'Astrónomo'] },
  },
  A: {
    zh: { description: '艺术型重视创造性的自我表达，在能够发挥独创性的环境中如鱼得水。他们对美和美感十分敏锐，在自由的创作活动中获得最大的满足。', careers: ['艺术家/设计师', '作家', '音乐家', '演员', '摄影师', '建筑设计师', 'UX设计师', '广告创意人员', '电影导演'] },
    fr: { description: "Les types artistiques valorisent l'expression créative de soi et s'épanouissent dans des environnements où l'originalité peut s'exprimer. Sensibles à la beauté et à l'esthétique, ils trouvent leur plus grand épanouissement dans la création libre.", careers: ['Artiste/Designer', 'Écrivain', 'Musicien', 'Acteur', 'Photographe', 'Designer architectural', 'Designer UX', 'Créatif publicitaire', 'Réalisateur'] },
    es: { description: 'Los tipos artísticos valoran la autoexpresión creativa y prosperan en entornos donde se ejerce la originalidad. Son sensibles a la belleza y la estética, y encuentran su mayor satisfacción en la creación libre.', careers: ['Artista/Diseñador', 'Escritor', 'Músico', 'Actor', 'Fotógrafo', 'Diseñador arquitectónico', 'Diseñador UX', 'Creativo publicitario', 'Director de cine'] },
  },
  S: {
    zh: { description: '社会型从帮助、教导和支持他人中找到意义。他们富有同理心，善于合作，在以人为本的活动中获得最大的回报。', careers: ['教师/教授', '咨询师/治疗师', '社会工作者', '医疗专业人员', '教练', '人力资源专员', '非营利组织活动家', '护士', '社区经理'] },
    fr: { description: "Les types sociaux trouvent un sens en aidant, enseignant et soutenant les autres. Dotés d'une forte empathie et d'un esprit de coopération, ils tirent leur plus grande récompense des activités centrées sur l'humain.", careers: ['Enseignant/Professeur', 'Conseiller/Thérapeute', 'Travailleur social', 'Professionnel de santé', 'Coach', 'Professionnel RH', 'Militant associatif', 'Infirmier', 'Community manager'] },
    es: { description: 'Los tipos sociales encuentran sentido en ayudar, enseñar y apoyar a las personas. Tienen una fuerte empatía y tendencias cooperativas, y hallan su mayor recompensa en actividades centradas en las personas.', careers: ['Profesor/Docente', 'Consejero/Terapeuta', 'Trabajador social', 'Profesional de la salud', 'Entrenador/Coach', 'Profesional de RR.HH.', 'Activista sin fines de lucro', 'Enfermero', 'Gestor comunitario'] },
  },
  E: {
    zh: { description: '进取型喜欢发挥领导力和影响力，从说服他人和达成目标中获得能量。他们富有竞争意识、雄心勃勃，非常注重结果。', careers: ['企业主/CEO', '销售专员', '市场营销人员', '律师', '政治家', '投资人', '项目经理', '房地产专业人员', '创业者'] },
    fr: { description: 'Les types entreprenants aiment exercer le leadership et l\'influence, puisant leur énergie dans la persuasion et l\'atteinte d\'objectifs. Ils sont compétitifs, ambitieux et fortement orientés vers les résultats.', careers: ['Chef d\'entreprise/PDG', 'Commercial', 'Marketeur', 'Avocat', 'Homme/Femme politique', 'Investisseur', 'Chef de projet', 'Professionnel de l\'immobilier', 'Fondateur de startup'] },
    es: { description: 'Los tipos emprendedores disfrutan ejerciendo liderazgo e influencia, y obtienen energía al persuadir a otros y alcanzar metas. Son competitivos, ambiciosos y muy orientados a los resultados.', careers: ['Empresario/CEO', 'Profesional de ventas', 'Especialista en marketing', 'Abogado', 'Político', 'Inversor', 'Gerente de proyectos', 'Profesional inmobiliario', 'Fundador de startup'] },
  },
  C: {
    zh: { description: '常规型重视准确性、结构和秩序。他们乐于遵守规则并关注细节，在有条理的环境中产出可靠的成果。', careers: ['会计师/税务专员', '行政专员', '数据管理员', '质量管理员', '图书管理员', '银行职员', '保险专员', '审计师', '公共行政人员'] },
    fr: { description: 'Les types conventionnels valorisent la précision, la structure et l\'ordre. Ils se sentent à l\'aise en suivant des règles et en portant attention aux détails, produisant des résultats fiables dans des environnements organisés.', careers: ['Comptable/Fiscaliste', 'Professionnel administratif', 'Gestionnaire de données', 'Contrôleur qualité', 'Bibliothécaire', 'Banquier', 'Professionnel de l\'assurance', 'Auditeur', 'Administrateur public'] },
    es: { description: 'Los tipos convencionales valoran la precisión, la estructura y el orden. Se sienten cómodos siguiendo reglas y prestando atención a los detalles, y producen resultados fiables en entornos organizados.', careers: ['Contador/Especialista fiscal', 'Profesional administrativo', 'Gestor de datos', 'Controlador de calidad', 'Bibliotecario', 'Banquero', 'Profesional de seguros', 'Auditor', 'Administrador público'] },
  },
}

const RIASEC_TYPES: RiasecType[] = ['R', 'I', 'A', 'S', 'E', 'C']
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
  const [done, setDone] = useState(false)

  function pick(val: number) {
    const q = questions[current]
    const newScores = { ...scores, [q.type]: scores[q.type] + val }
    if (current + 1 >= questions.length) { setScores(newScores); setDone(true) }
    else { setScores(newScores); setCurrent(current + 1) }
  }

  function restart() { setScores({ R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }); setCurrent(0); setDone(false) }

  // Record the result once, when the quiz is actually finished. testId is
  // 'riasec-quick' (not 'riasec') so it never overwrites/merges with the
  // 24-question test's history in oiyo:test-results:v1.
  useEffect(() => {
    if (!done) return
    const sorted = (Object.keys(scores) as RiasecType[]).sort((a, b) => scores[b] - scores[a])
    const code = sorted.slice(0, 3).join('')
    recordTestResult({
      kind: 'psychometric',
      testId: 'riasec-quick',
      title: lb.title,
      resultLabel: code,
      inputs: { scores },
      result: { code, scores },
      locale,
      sourcePath: `/${locale}/riasec-quick`,
    })
    gaEvent('test_completed', { test_id: 'riasec-quick' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])

  function share() {
    gaEvent('share_click', { test_id: 'riasec-quick' })
    const sorted = (Object.keys(scores) as RiasecType[]).sort((a, b) => scores[b] - scores[a])
    const code = sorted.slice(0, 3).join('')
    const url = window.location.href
    const text = `${lb.shareMsg}: ${code}`
    if (navigator.share) navigator.share({ title: lb.title, text, url })
    else navigator.clipboard.writeText(url)
  }

  if (!done) {
    const q = questions[current]
    const progress = Math.round((current / questions.length) * 100)
    return (
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">{lb.title}</h1>
          <p className="text-muted-foreground text-sm">{lb.subtitle}</p>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{lb.questionOf(current + 1, questions.length)}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: RIASEC_COLORS[q.type] }} />
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 text-center">
          <span className="text-xs font-bold px-2 py-1 rounded-full text-white mb-3 inline-block" style={{ backgroundColor: RIASEC_COLORS[q.type] }}>{lb.typeNames[q.type]}</span>
          <p className="text-lg font-medium leading-relaxed mt-2">{q.text}</p>
        </div>
        <div className="grid gap-2">
          {lb.scaleLabels.map((label, i) => (
            <button key={i} onClick={() => pick(i + 1)} aria-label={label}
              className="w-full rounded-xl border bg-card px-4 py-3 text-left text-sm hover:bg-accent hover:border-primary/50 transition-colors flex items-center gap-3">
              <span className="w-7 h-7 rounded-full border-2 border-primary/30 flex items-center justify-center text-xs font-bold text-primary flex-none">{i + 1}</span>
              {label}
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground">{lb.note}</p>
      </div>
    )
  }

  const sorted = (Object.keys(scores) as RiasecType[]).sort((a, b) => scores[b] - scores[a])
  const topCode = sorted.slice(0, 3).join('')
  const maxScore = 15 // 3 questions/type * 5-point scale

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">{lb.yourCode}</p>
        <div className="text-4xl font-bold tracking-widest">{topCode.split('').map(c => (
          <span key={c} style={{ color: RIASEC_COLORS[c as RiasecType] }}>{c}</span>
        ))}</div>
        <p className="text-sm text-muted-foreground">{sorted.slice(0, 3).map(t => lb.typeNames[t]).join(' · ')}</p>
      </div>
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h3 className="font-bold text-sm">{lb.profile}</h3>
        {sorted.map(type => {
          const pct = Math.round((scores[type] / maxScore) * 100)
          return (
            <div key={type} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold" style={{ color: RIASEC_COLORS[type] }}>{type} — {lb.typeNames[type]}</span>
                <span>{scores[type]}/{maxScore}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={lb.typeNames[type]}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: RIASEC_COLORS[type] }} />
              </div>
            </div>
          )
        })}
      </div>
      {sorted.slice(0, 2).map(type => (
        <div key={type} className="rounded-xl border bg-card p-4 space-y-2">
          <h3 className="font-bold text-sm" style={{ color: RIASEC_COLORS[type] }}>{lb.typeNames[type]} ({lb.typeFull[type]})</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{QUICK_TYPE_DETAILS[type][locale].description}</p>
          <h4 className="font-bold text-xs text-muted-foreground mt-2">{lb.careers}</h4>
          <p className="text-sm text-muted-foreground">{QUICK_TYPE_DETAILS[type][locale].careers.join(' · ')}</p>
        </div>
      ))}
      <p className="text-center text-xs text-muted-foreground">{lb.note}</p>
      <ShareResultButton
        locale={locale}
        heading={lb.yourCode}
        emoji="🧭"
        resultTitle={topCode}
        description={sorted.slice(0, 3).map(t => `${lb.typeNames[t]} ${scores[t]}/${maxScore}`).join(' · ')}
      />
      <a
        href={`/${locale}/riasec-career-test`}
        className="block rounded-xl border-2 border-dashed border-primary/30 bg-card px-4 py-3 text-center text-sm font-bold text-primary hover:bg-accent transition-colors"
      >
        {lb.detailedCta}
        <span className="block text-xs font-normal text-muted-foreground mt-1">{lb.detailedSub}</span>
      </a>
      <div className="flex gap-3">
        <button onClick={restart} aria-label={lb.restart} className="flex-1 rounded-xl border bg-card px-4 py-2 text-sm font-bold hover:bg-accent transition-colors">{lb.restart}</button>
        <button onClick={share} aria-label={lb.share} className="flex-1 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-bold hover:opacity-90 transition-opacity">{lb.share}</button>
      </div>
    </div>
  )
}
