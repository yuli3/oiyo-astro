import { useEffect, useState } from 'react'
import ShareResultButton from '../shared/ShareResultButton'
import ResultNextSteps from '../shared/ResultNextSteps'
import RelatedReading from '../shared/RelatedReading';
import CopyResultLink from '../shared/CopyResultLink';
import { readResultCode, writeResultCode, clearResultCode } from '../../lib/result-url';
import { recordTestResult } from '@/lib/user/test-results';
import { gaEvent } from '@/lib/analytics/ga-event';
import {
  buildMbtiResult,
  mbtiPreferenceScores,
  mbtiTypeFromResponses,
  recordAssessmentResult,
} from '@/assessments';
import { interpretMBTIDeep } from '@/lib/engines/interpretation/engines/mbti-deep';

export type SupportedLang = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'
type DimKey = 'EI' | 'SN' | 'TF' | 'JP'
type DimValue = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P'
type MbtiType =
  'INTJ' | 'INTP' | 'ENTJ' | 'ENTP' |
  'INFJ' | 'INFP' | 'ENFJ' | 'ENFP' |
  'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ' |
  'ISTP' | 'ISFP' | 'ESTP' | 'ESFP'

export interface Question {
  id: string
  dim: DimKey
  text: string
  a: { text: string; value: DimValue }
  b: { text: string; value: DimValue }
}

interface Labels {
  title: string
  subtitle: string
  resultLabel: string
  progress: (answered: number, total: number) => string
  viewResult: string
  retake: string
  note: string
  deepTitle: string
  strengthsTitle: string
  challengesTitle: string
  cognitiveStackTitle: string
  growthTitle: string
  lifeTitle: string
  functionRole: { dominant: string; auxiliary: string; tertiary: string; inferior: string }
}

const COGNITIVE_STACK_BY_TYPE: Record<MbtiType, [string, string, string, string]> = {
  ISTJ: ['Si', 'Te', 'Fi', 'Ne'], ISFJ: ['Si', 'Fe', 'Ti', 'Ne'],
  INFJ: ['Ni', 'Fe', 'Ti', 'Se'], INTJ: ['Ni', 'Te', 'Fi', 'Se'],
  ISTP: ['Ti', 'Se', 'Ni', 'Fe'], ISFP: ['Fi', 'Se', 'Ni', 'Te'],
  INFP: ['Fi', 'Ne', 'Si', 'Te'], INTP: ['Ti', 'Ne', 'Si', 'Fe'],
  ESTP: ['Se', 'Ti', 'Fe', 'Ni'], ESFP: ['Se', 'Fi', 'Te', 'Ni'],
  ENFP: ['Ne', 'Fi', 'Te', 'Si'], ENTP: ['Ne', 'Ti', 'Fe', 'Si'],
  ESTJ: ['Te', 'Si', 'Ne', 'Fi'], ESFJ: ['Fe', 'Si', 'Ne', 'Ti'],
  ENFJ: ['Fe', 'Ni', 'Se', 'Ti'], ENTJ: ['Te', 'Ni', 'Se', 'Fi'],
}

const FALLBACK_LANG: SupportedLang = 'en'

function lang(locale?: string): SupportedLang {
  return (['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const).includes(locale as SupportedLang)
    ? (locale as SupportedLang)
    : FALLBACK_LANG
}

function sl(value: Partial<Record<SupportedLang, string>>, locale: SupportedLang): string {
  return value[locale] ?? value.en ?? value.ko ?? ''
}

const LABELS: Record<SupportedLang, Labels> = {
  ko: {
    title: 'MBTI 성격 테스트',
    subtitle: '16개의 질문으로 나의 네 가지 성격 선호를 확인하세요.',
    resultLabel: '나의 MBTI 유형',
    progress: (answered, total) => `${answered} / ${total} 완료`,
    viewResult: '결과 보기',
    retake: '다시 하기',
    note: '이 테스트는 자기이해를 위한 간단한 성향 도구이며 전문 심리검사를 대체하지 않습니다.',
    deepTitle: '더 깊은 해석',
    strengthsTitle: '강점',
    challengesTitle: '성장 과제',
    cognitiveStackTitle: '인지기능 스택',
    growthTitle: '성장 경로',
    lifeTitle: '삶에 미치는 영향',
    functionRole: { dominant: '주기능', auxiliary: '부기능', tertiary: '3차기능', inferior: '열등기능' },
  },
  en: {
    title: 'MBTI Personality Test',
    subtitle: 'Answer 16 questions to map your four personality preferences.',
    resultLabel: 'Your MBTI Type',
    progress: (answered, total) => `${answered} / ${total} answered`,
    viewResult: 'View Result',
    retake: 'Retake',
    note: 'This is a lightweight self-reflection tool and does not replace a professional psychological assessment.',
    deepTitle: 'Deeper Interpretation',
    strengthsTitle: 'Strengths',
    challengesTitle: 'Growth Challenges',
    cognitiveStackTitle: 'Cognitive Function Stack',
    growthTitle: 'Growth Path',
    lifeTitle: 'Life Implications',
    functionRole: { dominant: 'Dominant', auxiliary: 'Auxiliary', tertiary: 'Tertiary', inferior: 'Inferior' },
  },
  ja: {
    title: 'MBTI 性格テスト',
    subtitle: '16の質問で4つの性格傾向を確認しましょう。',
    resultLabel: 'あなたのMBTIタイプ',
    progress: (answered, total) => `${answered} / ${total} 完了`,
    viewResult: '結果を見る',
    retake: 'もう一度',
    note: 'このテストは自己理解のための簡易ツールであり、専門的な心理検査の代替ではありません。',
    deepTitle: 'より深い解釈',
    strengthsTitle: '強み',
    challengesTitle: '成長課題',
    cognitiveStackTitle: '認知機能スタック',
    growthTitle: '成長への道',
    lifeTitle: '人生への影響',
    functionRole: { dominant: '主機能', auxiliary: '補助機能', tertiary: '第三機能', inferior: '劣等機能' },
  },
  zh: {
    title: 'MBTI 性格测试',
    subtitle: '通过16个问题了解你的四项性格偏好。',
    resultLabel: '你的MBTI类型',
    progress: (answered, total) => `已完成 ${answered} / ${total}`,
    viewResult: '查看结果',
    retake: '重新测试',
    note: '本测试是用于自我理解的简易工具，不能替代专业心理评估。',
    deepTitle: '更深层的解读',
    strengthsTitle: '优势',
    challengesTitle: '成长课题',
    cognitiveStackTitle: '认知功能栈',
    growthTitle: '成长路径',
    lifeTitle: '对人生的影响',
    functionRole: { dominant: '主导功能', auxiliary: '辅助功能', tertiary: '第三功能', inferior: '劣势功能' },
  },
  fr: {
    title: 'Test de Personnalité MBTI',
    subtitle: 'Répondez à 16 questions pour situer vos quatre préférences.',
    resultLabel: 'Votre type MBTI',
    progress: (answered, total) => `${answered} / ${total} réponses`,
    viewResult: 'Voir le résultat',
    retake: 'Recommencer',
    note: 'Ce test est un outil léger de réflexion personnelle et ne remplace pas une évaluation psychologique professionnelle.',
    deepTitle: 'Interprétation approfondie',
    strengthsTitle: 'Forces',
    challengesTitle: 'Défis de croissance',
    cognitiveStackTitle: 'Pile de fonctions cognitives',
    growthTitle: 'Voie de croissance',
    lifeTitle: 'Implications pour la vie',
    functionRole: { dominant: 'Dominante', auxiliary: 'Auxiliaire', tertiary: 'Tertiaire', inferior: 'Inférieure' },
  },
  es: {
    title: 'Test de Personalidad MBTI',
    subtitle: 'Responde 16 preguntas para mapear tus cuatro preferencias.',
    resultLabel: 'Tu tipo MBTI',
    progress: (answered, total) => `${answered} / ${total} respondidas`,
    viewResult: 'Ver resultado',
    retake: 'Repetir',
    note: 'Este test es una herramienta ligera de autoconocimiento y no reemplaza una evaluación psicológica profesional.',
    deepTitle: 'Interpretación más profunda',
    strengthsTitle: 'Fortalezas',
    challengesTitle: 'Desafíos de crecimiento',
    cognitiveStackTitle: 'Pila de funciones cognitivas',
    growthTitle: 'Camino de crecimiento',
    lifeTitle: 'Implicaciones para la vida',
    functionRole: { dominant: 'Dominante', auxiliary: 'Auxiliar', tertiary: 'Terciaria', inferior: 'Inferior' },
  },
}

export const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 'q1', dim: 'EI', text: '에너지가 떨어졌을 때 나는 보통...', a: { text: '사람들과 만나 이야기하며 회복한다', value: 'E' }, b: { text: '혼자 조용히 쉬며 회복한다', value: 'I' } },
    { id: 'q2', dim: 'SN', text: '새로운 정보를 볼 때 먼저 끌리는 것은?', a: { text: '구체적인 사실과 실제 사례', value: 'S' }, b: { text: '패턴, 의미, 가능성', value: 'N' } },
    { id: 'q3', dim: 'TF', text: '중요한 결정을 내릴 때 더 신뢰하는 기준은?', a: { text: '논리와 일관성', value: 'T' }, b: { text: '가치와 사람에게 미칠 영향', value: 'F' } },
    { id: 'q4', dim: 'JP', text: '일정과 계획에 대한 나의 감각은?', a: { text: '미리 정리해두면 마음이 편하다', value: 'J' }, b: { text: '상황에 맞춰 바꿀 여지가 있어야 편하다', value: 'P' } },
    { id: 'q5', dim: 'EI', text: '모임에서 나는 주로...', a: { text: '여러 사람과 폭넓게 대화한다', value: 'E' }, b: { text: '소수와 깊게 대화한다', value: 'I' } },
    { id: 'q6', dim: 'SN', text: '문제를 해결할 때 선호하는 출발점은?', a: { text: '이미 검증된 방법과 절차', value: 'S' }, b: { text: '새로운 가설과 큰 그림', value: 'N' } },
    { id: 'q7', dim: 'TF', text: '갈등 상황에서 내가 먼저 찾는 것은?', a: { text: '공정하고 객관적인 해결책', value: 'T' }, b: { text: '관계의 회복과 정서적 균형', value: 'F' } },
    { id: 'q8', dim: 'JP', text: '여행을 준비할 때 나는...', a: { text: '동선과 예약을 미리 정한다', value: 'J' }, b: { text: '핵심만 정하고 즉흥을 즐긴다', value: 'P' } },
    { id: 'q9', dim: 'EI', text: '아이디어를 정리할 때 더 자연스러운 방식은?', a: { text: '말하면서 생각이 선명해진다', value: 'E' }, b: { text: '생각한 뒤 말해야 선명하다', value: 'I' } },
    { id: 'q10', dim: 'SN', text: '설명을 들을 때 더 좋은 방식은?', a: { text: '단계별 예시와 세부사항', value: 'S' }, b: { text: '원리와 전체 구조', value: 'N' } },
    { id: 'q11', dim: 'TF', text: '피드백을 줄 때 내가 더 신경 쓰는 것은?', a: { text: '정확하고 솔직한 개선점', value: 'T' }, b: { text: '받는 사람이 감당할 수 있는 표현', value: 'F' } },
    { id: 'q12', dim: 'JP', text: '마감이 다가오면 나는...', a: { text: '미리 끝내고 수정한다', value: 'J' }, b: { text: '막판 집중력으로 처리한다', value: 'P' } },
    { id: 'q13', dim: 'EI', text: '긴 하루 뒤 더 끌리는 선택은?', a: { text: '가벼운 만남이나 대화', value: 'E' }, b: { text: '나만의 공간과 침묵', value: 'I' } },
    { id: 'q14', dim: 'SN', text: '나는 보통...', a: { text: '현재 가능한 것에 집중한다', value: 'S' }, b: { text: '앞으로 가능해질 것에 집중한다', value: 'N' } },
    { id: 'q15', dim: 'TF', text: '좋은 판단이란?', a: { text: '감정보다 기준이 흔들리지 않는 것', value: 'T' }, b: { text: '상황과 사람의 맥락을 살피는 것', value: 'F' } },
    { id: 'q16', dim: 'JP', text: '선택지를 대하는 나의 방식은?', a: { text: '빨리 결정하고 실행한다', value: 'J' }, b: { text: '가능성을 더 열어둔다', value: 'P' } },
  ],
  en: [
    { id: 'q1', dim: 'EI', text: 'When your energy is low, you usually...', a: { text: 'Recharge by talking with people', value: 'E' }, b: { text: 'Recharge through quiet time alone', value: 'I' } },
    { id: 'q2', dim: 'SN', text: 'When you meet new information, what grabs you first?', a: { text: 'Concrete facts and real examples', value: 'S' }, b: { text: 'Patterns, meanings, and possibilities', value: 'N' } },
    { id: 'q3', dim: 'TF', text: 'For important decisions, you trust...', a: { text: 'Logic and consistency', value: 'T' }, b: { text: 'Values and impact on people', value: 'F' } },
    { id: 'q4', dim: 'JP', text: 'Your natural feel for plans is...', a: { text: 'Clear structure helps me relax', value: 'J' }, b: { text: 'Room to adapt helps me relax', value: 'P' } },
    { id: 'q5', dim: 'EI', text: 'At gatherings, you tend to...', a: { text: 'Talk broadly with many people', value: 'E' }, b: { text: 'Talk deeply with a few people', value: 'I' } },
    { id: 'q6', dim: 'SN', text: 'When solving problems, you prefer starting from...', a: { text: 'Proven methods and procedures', value: 'S' }, b: { text: 'New hypotheses and the big picture', value: 'N' } },
    { id: 'q7', dim: 'TF', text: 'In conflict, you first look for...', a: { text: 'A fair and objective solution', value: 'T' }, b: { text: 'Relational repair and emotional balance', value: 'F' } },
    { id: 'q8', dim: 'JP', text: 'When planning travel, you...', a: { text: 'Set the route and bookings early', value: 'J' }, b: { text: 'Keep the essentials and improvise', value: 'P' } },
    { id: 'q9', dim: 'EI', text: 'Your ideas become clearer when...', a: { text: 'You talk them through', value: 'E' }, b: { text: 'You think before speaking', value: 'I' } },
    { id: 'q10', dim: 'SN', text: 'A helpful explanation gives you...', a: { text: 'Step-by-step examples and details', value: 'S' }, b: { text: 'Principles and overall structure', value: 'N' } },
    { id: 'q11', dim: 'TF', text: 'When giving feedback, you focus more on...', a: { text: 'Accurate, honest improvement points', value: 'T' }, b: { text: 'Words the person can receive well', value: 'F' } },
    { id: 'q12', dim: 'JP', text: 'As a deadline approaches, you...', a: { text: 'Finish early and revise', value: 'J' }, b: { text: 'Use last-minute focus', value: 'P' } },
    { id: 'q13', dim: 'EI', text: 'After a long day, you are more drawn to...', a: { text: 'A light hangout or conversation', value: 'E' }, b: { text: 'Your own space and silence', value: 'I' } },
    { id: 'q14', dim: 'SN', text: 'You usually focus on...', a: { text: 'What is practical now', value: 'S' }, b: { text: 'What could become possible', value: 'N' } },
    { id: 'q15', dim: 'TF', text: 'Good judgment means...', a: { text: 'Keeping standards steady beyond emotion', value: 'T' }, b: { text: 'Reading the context and people involved', value: 'F' } },
    { id: 'q16', dim: 'JP', text: 'With options, you prefer to...', a: { text: 'Decide and move quickly', value: 'J' }, b: { text: 'Keep possibilities open longer', value: 'P' } },
  ],
  ja: [],
  zh: [],
  fr: [],
  es: [],
}

QUESTIONS.ja = QUESTIONS.en
QUESTIONS.zh = QUESTIONS.en
QUESTIONS.fr = QUESTIONS.en
QUESTIONS.es = QUESTIONS.en

export const TYPE_PROFILES: Record<MbtiType, { emoji: string; en: string; ko: string; desc: Record<SupportedLang, string> }> = {
  INTJ: { emoji: '🏛️', en: 'Architect', ko: '전략가', desc: { ko: '독립적이고 장기적 관점이 강한 전략형입니다. 복잡한 구조를 읽고 체계적인 해법을 만드는 데 강합니다.', en: 'Independent, strategic, and long-range in perspective. You are strong at reading complex systems and building structured solutions.', ja: '独立心が強く、長期的な視点を持つ戦略型です。複雑な構造を読み、体系的な解決策を作ることが得意です。', zh: '独立、战略性强，擅长理解复杂系统并设计结构化方案。', fr: 'Indépendant et stratégique, vous excellez à lire des systèmes complexes et à construire des solutions structurées.', es: 'Independiente y estratégico, destacas al leer sistemas complejos y crear soluciones estructuradas.' } },
  INTP: { emoji: '🔬', en: 'Logician', ko: '논리술사', desc: { ko: '호기심이 많고 분석적인 탐구형입니다. 아이디어의 원리와 모순을 깊게 파고드는 편입니다.', en: 'Curious and analytical. You like to explore principles, inconsistencies, and abstract ideas deeply.', ja: '好奇心が強く分析的な探究型です。原理や矛盾、抽象的なアイデアを深く掘り下げます。', zh: '好奇且善于分析，喜欢深入探索原则、矛盾和抽象想法。', fr: 'Curieux et analytique, vous aimez explorer les principes, les incohérences et les idées abstraites.', es: 'Curioso y analítico, disfrutas explorar principios, contradicciones e ideas abstractas.' } },
  ENTJ: { emoji: '⚡', en: 'Commander', ko: '지휘관', desc: { ko: '목표 지향적이고 추진력이 강한 리더형입니다. 구조를 만들고 사람과 자원을 움직이는 데 능합니다.', en: 'Goal-oriented and forceful. You are skilled at creating structure and moving people and resources toward outcomes.', ja: '目標志向で推進力のあるリーダー型です。構造を作り、人や資源を成果へ動かすことが得意です。', zh: '目标导向、行动力强，擅长建立结构并推动人与资源达成结果。', fr: 'Orienté objectif, vous savez créer une structure et mobiliser personnes et ressources.', es: 'Orientado a objetivos, sabes crear estructura y movilizar personas y recursos.' } },
  ENTP: { emoji: '🎭', en: 'Debater', ko: '발명가', desc: { ko: '아이디어와 토론을 즐기는 실험형입니다. 기존 관점을 뒤집고 새 가능성을 찾는 데 활력이 납니다.', en: 'Inventive and debate-friendly. You get energy from challenging assumptions and spotting new possibilities.', ja: 'アイデアと議論を楽しむ実験型です。前提を問い直し、新しい可能性を見つけます。', zh: '富有创意、喜欢辩论，善于挑战假设并发现新可能。', fr: 'Inventif et amateur de débat, vous aimez défier les hypothèses et repérer de nouvelles possibilités.', es: 'Inventivo y debatidor, disfrutas desafiar supuestos y detectar nuevas posibilidades.' } },
  INFJ: { emoji: '🌿', en: 'Advocate', ko: '옹호자', desc: { ko: '깊은 통찰과 공감이 강한 비전형입니다. 의미 있는 변화와 조용한 영향력을 추구합니다.', en: 'Insightful and empathic. You seek meaningful change and often influence others in a quiet, focused way.', ja: '洞察力と共感力の強いビジョン型です。意味ある変化と静かな影響力を求めます。', zh: '富有洞察和共情，追求有意义的改变，并以安静专注的方式影响他人。', fr: 'Perspicace et empathique, vous recherchez un changement significatif et une influence calme.', es: 'Perspicaz y empático, buscas cambios significativos e influencia tranquila.' } },
  INFP: { emoji: '🌸', en: 'Mediator', ko: '중재자', desc: { ko: '가치와 진정성을 중시하는 이상형입니다. 자신의 의미 체계에 맞는 선택을 오래 고민합니다.', en: 'Idealistic and values-led. You care about authenticity and choices that fit your inner meaning system.', ja: '価値観と本物らしさを大切にする理想型です。内なる意味に合う選択を重視します。', zh: '理想主义且重视价值，关心真实感和符合内在意义的选择。', fr: 'Idéaliste et guidé par vos valeurs, vous recherchez l’authenticité et le sens intérieur.', es: 'Idealista y guiado por valores, buscas autenticidad y sentido interior.' } },
  ENFJ: { emoji: '🌟', en: 'Protagonist', ko: '주인공', desc: { ko: '사람의 성장을 돕는 협력적 리더형입니다. 분위기와 동기를 읽고 팀을 북돋웁니다.', en: 'A people-focused leader. You read motivation and atmosphere well and help groups grow together.', ja: '人の成長を支える協力的なリーダー型です。動機や雰囲気を読み取り、集団を励まします。', zh: '以人为中心的领导者，擅长读懂动机和氛围，帮助团队共同成长。', fr: 'Leader centré sur les personnes, vous lisez bien les motivations et aidez les groupes à grandir.', es: 'Líder centrado en personas, lees motivaciones y ayudas a los grupos a crecer.' } },
  ENFP: { emoji: '🎨', en: 'Campaigner', ko: '활동가', desc: { ko: '열정적이고 가능성을 잘 발견하는 연결형입니다. 사람과 아이디어를 엮어 새로운 흐름을 만듭니다.', en: 'Energetic and possibility-driven. You connect people and ideas to create new momentum.', ja: '情熱的で可能性を見つけるのが得意な接続型です。人とアイデアを結びつけます。', zh: '充满热情、善于发现可能性，能连接人与想法创造新动力。', fr: 'Énergique et porté par les possibilités, vous connectez personnes et idées.', es: 'Energético y orientado a posibilidades, conectas personas e ideas.' } },
  ISTJ: { emoji: '🛡️', en: 'Logistician', ko: '현실주의자', desc: { ko: '책임감과 정확성이 강한 실무형입니다. 검증된 방식으로 안정적인 결과를 만드는 데 강합니다.', en: 'Responsible and precise. You create stable results through proven methods and careful execution.', ja: '責任感と正確性の強い実務型です。検証された方法で安定した成果を出します。', zh: '负责且精准，擅长用经过验证的方法创造稳定结果。', fr: 'Responsable et précis, vous produisez des résultats stables par des méthodes éprouvées.', es: 'Responsable y preciso, produces resultados estables con métodos probados.' } },
  ISFJ: { emoji: '🏠', en: 'Defender', ko: '수호자', desc: { ko: '세심하고 헌신적인 보호형입니다. 사람들의 필요를 기억하고 안정감을 만드는 데 능합니다.', en: 'Careful and devoted. You notice people’s needs and create a steady sense of support.', ja: '細やかで献身的な保護型です。人の必要を覚え、安心感を作ります。', zh: '细心且投入，能察觉他人需要并创造稳定支持感。', fr: 'Attentionné et dévoué, vous percevez les besoins des autres et créez un soutien stable.', es: 'Cuidadoso y dedicado, percibes necesidades y creas apoyo estable.' } },
  ESTJ: { emoji: '⚖️', en: 'Executive', ko: '경영자', desc: { ko: '질서와 실행을 중시하는 관리자형입니다. 기준을 세우고 현실적인 성과를 이끌어냅니다.', en: 'Orderly and execution-focused. You set standards and drive practical outcomes.', ja: '秩序と実行を重視する管理型です。基準を定め、実用的な成果を導きます。', zh: '重视秩序和执行，善于设定标准并推动实际成果。', fr: 'Structuré et tourné vers l’exécution, vous fixez des standards et obtenez des résultats concrets.', es: 'Ordenado y orientado a ejecución, estableces estándares y logras resultados prácticos.' } },
  ESFJ: { emoji: '💛', en: 'Consul', ko: '집정관', desc: { ko: '관계와 책임을 중시하는 협력형입니다. 주변의 기대를 살피고 조화를 만드는 데 강합니다.', en: 'Relational and responsible. You notice expectations around you and build harmony through practical care.', ja: '関係と責任を重視する協力型です。周囲の期待を読み、調和を作ります。', zh: '重视关系与责任，能察觉周围期待并通过实际关怀建立和谐。', fr: 'Relationnel et responsable, vous créez de l’harmonie par une attention concrète.', es: 'Relacional y responsable, creas armonía mediante cuidado práctico.' } },
  ISTP: { emoji: '🔧', en: 'Virtuoso', ko: '장인', desc: { ko: '관찰력과 문제 해결력이 강한 실험형입니다. 직접 다뤄보며 구조와 작동 원리를 파악합니다.', en: 'Observant and hands-on. You understand systems by testing how they actually work.', ja: '観察力と問題解決力の強い実験型です。実際に触りながら仕組みを理解します。', zh: '观察敏锐、动手能力强，通过实际测试理解系统如何运作。', fr: 'Observateur et pratique, vous comprenez les systèmes en testant leur fonctionnement réel.', es: 'Observador y práctico, entiendes sistemas probando cómo funcionan.' } },
  ISFP: { emoji: '🎵', en: 'Adventurer', ko: '모험가', desc: { ko: '감각과 가치가 섬세한 표현형입니다. 조용하지만 자신만의 미감과 선택 기준이 분명합니다.', en: 'Sensitive, aesthetic, and values-aware. Quietly, you have a clear sense of what feels right.', ja: '感覚と価値観が繊細な表現型です。静かでも自分の美意識と基準があります。', zh: '敏感、有美感且重视价值，安静但有清晰的内在判断。', fr: 'Sensible et esthétique, vous avez un sens clair de ce qui sonne juste.', es: 'Sensible y estético, tienes un sentido claro de lo que se siente correcto.' } },
  ESTP: { emoji: '🚀', en: 'Entrepreneur', ko: '사업가', desc: { ko: '상황 판단과 행동력이 빠른 현실형입니다. 지금 보이는 기회를 붙잡고 직접 움직입니다.', en: 'Fast, realistic, and action-oriented. You seize visible opportunities and learn through movement.', ja: '判断と行動が速い現実型です。目の前の機会をつかみ、動きながら学びます。', zh: '快速、现实、行动导向，善于抓住眼前机会并在行动中学习。', fr: 'Rapide, réaliste et orienté action, vous saisissez les occasions visibles.', es: 'Rápido, realista y orientado a acción, aprovechas oportunidades visibles.' } },
  ESFP: { emoji: '🎉', en: 'Entertainer', ko: '연예인', desc: { ko: '현재의 분위기와 경험을 잘 살리는 표현형입니다. 사람들과 함께 활력을 만들고 즐거움을 나눕니다.', en: 'Expressive and present-focused. You create energy with people and bring experiences to life.', ja: '現在の雰囲気と経験を活かす表現型です。人と一緒に活力を生みます。', zh: '善于表达且关注当下，能与人共同创造活力并点亮体验。', fr: 'Expressif et présent, vous créez de l’énergie avec les autres.', es: 'Expresivo y presente, creas energía con otras personas.' } },
}

const DIMENSIONS: Record<DimKey, [DimValue, DimValue]> = {
  EI: ['E', 'I'],
  SN: ['S', 'N'],
  TF: ['T', 'F'],
  JP: ['J', 'P'],
}

export default function MbtiPersonalityTest({ locale }: { locale?: string }) {
  const l = lang(locale)
  const labels = LABELS[l]
  const questions = QUESTIONS[l].length > 0 ? QUESTIONS[l] : QUESTIONS.en
  const [answers, setAnswers] = useState<Record<string, DimValue>>({})
  const [showResult, setShowResult] = useState(false)
  // A shared/revisited result type read from the URL (?type=INTJ), independent of answers.
  const [forcedType, setForcedType] = useState<MbtiType | null>(null)

  // On mount, restore a shared result directly from the URL.
  useEffect(() => {
    const code = readResultCode('type')?.toUpperCase()
    if (code && Object.prototype.hasOwnProperty.call(TYPE_PROFILES, code)) {
      setForcedType(code as MbtiType)
      setShowResult(true)
    }
  }, [])

  const answeredCount = Object.keys(answers).length
  const isComplete = answeredCount === questions.length

  const computedType = (isComplete ? mbtiTypeFromResponses(answers) : 'ESTJ') as MbtiType
  const mbtiType = forcedType ?? computedType
  const preferenceScores = isComplete ? mbtiPreferenceScores(answers) : null

  const profile = TYPE_PROFILES[mbtiType]
  const title = l === 'ko' ? `${mbtiType} - ${profile?.ko}` : `${mbtiType} - ${profile?.en}`
  const deep = interpretMBTIDeep(mbtiType, COGNITIVE_STACK_BY_TYPE[mbtiType], l)

  // Keep the URL in sync with the visible result so it is shareable/revisitable.
  useEffect(() => {
    if (showResult && (isComplete || forcedType) && profile) {
      writeResultCode('type', mbtiType)
    }
  }, [showResult, isComplete, forcedType, mbtiType, profile])

  // Record the result once, only for an actual completion (not a shared-link revisit via forcedType).
  useEffect(() => {
    if (!showResult || !isComplete || !profile) return
    recordTestResult({
      kind: 'psychometric',
      testId: 'mbti',
      title: labels.title,
      resultLabel: title,
      inputs: { answers },
      result: { type: mbtiType },
      locale: l,
      sourcePath: `/${l}/mbti/test`,
    })
    recordAssessmentResult(buildMbtiResult(answers, {
      locale: l,
      sourcePath: `/${l}/mbti/test`,
    }))
    gaEvent('test_completed', { test_id: 'mbti' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResult, isComplete])

  if (showResult && (isComplete || forcedType) && profile) {
    return (
      <section className="not-prose rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">{labels.resultLabel}</p>
          <div className="mt-4 text-6xl" aria-hidden="true">{profile.emoji}</div>
          <h2 className="mt-4 text-3xl font-black text-slate-950">{title}</h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-700">{profile.desc[l]}</p>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-4">
          {Object.entries(DIMENSIONS).map(([dim, values]) => (
            <div key={dim} className="rounded-xl bg-slate-50 p-4 text-center">
              <p className="text-xs font-semibold text-slate-500">{dim}</p>
              <p className="mt-1 text-2xl font-black text-slate-900">{mbtiType.includes(values[0]) ? values[0] : values[1]}</p>
              {preferenceScores && (
                <>
                  <p className="mt-1 text-[11px] font-semibold text-slate-500">
                    {values[0]} {preferenceScores[dim as DimKey]}% · {values[1]} {100 - preferenceScores[dim as DimKey]}%
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
                    <div className="h-full bg-blue-600" style={{ width: `${preferenceScores[dim as DimKey]}%` }} />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        <p className="mt-6 rounded-xl bg-blue-50 p-4 text-sm leading-6 text-blue-950">{labels.note}</p>

        <section className="mt-8 border-t border-slate-200 pt-6">
          <h3 className="text-xl font-black text-slate-950">{labels.deepTitle}</h3>
          <p className="mt-3 leading-7 text-slate-700">{sl(deep.typeNarrative, l)}</p>
          <p className="mt-3 leading-7 text-slate-600">{sl(deep.worldview, l)}</p>

          <details className="group mt-5 rounded-xl border border-slate-200 p-4">
            <summary className="cursor-pointer list-none font-bold text-slate-900">{labels.strengthsTitle} / {labels.challengesTitle}</summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <ul className="space-y-2 text-sm leading-6 text-slate-700">
                {deep.strengths.map((s, i) => <li key={i}>· {sl(s, l)}</li>)}
              </ul>
              <ul className="space-y-2 text-sm leading-6 text-slate-700">
                {deep.challenges.map((c, i) => <li key={i}>· {sl(c, l)}</li>)}
              </ul>
            </div>
          </details>

          <details className="group mt-3 rounded-xl border border-slate-200 p-4">
            <summary className="cursor-pointer list-none font-bold text-slate-900">{labels.cognitiveStackTitle}</summary>
            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              {([
                ['dominant', deep.cognitiveStack.dominant],
                ['auxiliary', deep.cognitiveStack.auxiliary],
                ['tertiary', deep.cognitiveStack.tertiary],
                ['inferior', deep.cognitiveStack.inferior],
              ] as const).map(([role, fn]) => (
                <div key={role} className="rounded-lg bg-slate-50 p-3 text-center">
                  <p className="text-[11px] font-semibold text-slate-500">{labels.functionRole[role]}</p>
                  <p className="mt-1 text-lg font-black text-slate-900">{fn.code}</p>
                  <p className="mt-1 text-xs text-slate-600">{sl(fn.name, l)}</p>
                </div>
              ))}
            </div>
          </details>

          <details className="group mt-3 rounded-xl border border-slate-200 p-4">
            <summary className="cursor-pointer list-none font-bold text-slate-900">{labels.growthTitle} / {labels.lifeTitle}</summary>
            <p className="mt-3 text-sm leading-6 text-slate-700">{sl(deep.growthPath, l)}</p>
            <p className="mt-3 text-sm leading-6 text-slate-700">{sl(deep.lifeImplications, l)}</p>
          </details>
        </section>

        <ShareResultButton
          locale={l}
          heading={labels.title}
          resultTitle={title}
          emoji={profile.emoji}
          description={profile.desc[l]}
          onShareClick={() => gaEvent('share_click', { test_id: 'mbti' })}
        />
        <CopyResultLink locale={l} onCopyClick={() => gaEvent('share_click', { test_id: 'mbti' })} />
        <ResultNextSteps
          locale={l}
          links={[
            { href: `https://wiki.oiyo.net/ko/mbti-dict-${mbtiType.toLowerCase()}/`, label: `📖 ${mbtiType} 유형 사전`, external: true, locales: ['ko'] },
            { href: `/${l}/mbti/hobbies`, label: l === 'ko' ? `✨ ${mbtiType} 추천 취미` : `✨ ${mbtiType} hobbies` },
            { href: `https://blog.oiyo.net/${l}/mbti-compatibility/`, label: l === 'ko' ? '💞 유형 궁합 보기' : '💞 Type compatibility', external: true },
          ]}
        />
        <RelatedReading locale={l} topic="mbti" />
        <button
          type="button"
          onClick={() => { setAnswers({}); setShowResult(false); setForcedType(null); clearResultCode('type') }}
          className="mt-6 w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
        >
          {labels.retake}
        </button>
      </section>
    )
  }

  return (
    <section className="not-prose rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="text-center">
        <h2 className="text-3xl font-black text-slate-950">{labels.title}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">{labels.subtitle}</p>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
        </div>
        <p className="mt-2 text-xs font-semibold text-slate-500">{labels.progress(answeredCount, questions.length)}</p>
      </div>

      <div className="mt-8 space-y-6">
        {questions.map((q, index) => (
          <div key={q.id} className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-bold leading-6 text-slate-900">{index + 1}. {q.text}</p>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {[q.a, q.b].map((option) => (
                <button
                  key={`${q.id}-${option.value}`}
                  type="button"
                  onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: option.value }))}
                  className={`rounded-xl border px-4 py-3 text-left text-sm leading-6 transition ${
                    answers[q.id] === option.value
                      ? 'border-blue-600 bg-blue-600 font-bold text-white shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled={!isComplete}
        onClick={() => setShowResult(true)}
        className={`mt-8 w-full rounded-xl px-5 py-3 text-sm font-bold transition ${
          isComplete
            ? 'bg-slate-950 text-white hover:bg-slate-800'
            : 'cursor-not-allowed bg-slate-200 text-slate-400'
        }`}
      >
        {labels.viewResult}
      </button>
    </section>
  )
}
