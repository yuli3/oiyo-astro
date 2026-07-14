import type { AssessmentLocale } from "../../core";

import type { LifeValueId } from "./data";

export type LifeValueCardCopy = readonly [title: string, cue: string];

export const LIFE_VALUES_CARD_COPY: Record<
  LifeValueId,
  Record<AssessmentLocale, LifeValueCardCopy>
> = {
  autonomy: { ko: ["자율", "내 방식과 선택권"], en: ["Autonomy", "Choice in how I live and work"], ja: ["自律", "自分の方法と選択権"], zh: ["自主", "按自己的方式做选择"], fr: ["Autonomie", "Choisir ma façon de vivre et travailler"], es: ["Autonomía", "Elegir cómo vivir y trabajar"] },
  security: { ko: ["안정", "예측 가능성과 안전망"], en: ["Security", "Predictability and a safety net"], ja: ["安定", "予測可能性と安心"], zh: ["安定", "可预期性与安全感"], fr: ["Sécurité", "Prévisibilité et filet de sécurité"], es: ["Seguridad", "Previsibilidad y respaldo"] },
  growth: { ko: ["성장", "더 넓어지고 배우는 삶"], en: ["Growth", "Learning and expanding my capacity"], ja: ["成長", "学び、可能性を広げる"], zh: ["成长", "学习并拓展能力"], fr: ["Croissance", "Apprendre et élargir mes capacités"], es: ["Crecimiento", "Aprender y ampliar mis capacidades"] },
  mastery: { ko: ["숙련", "한 분야를 깊이 익힘"], en: ["Mastery", "Becoming deeply capable at something"], ja: ["熟達", "一つの分野を深く磨く"], zh: ["精进", "深入掌握一项能力"], fr: ["Maîtrise", "Développer une compétence en profondeur"], es: ["Dominio", "Desarrollar una capacidad a fondo"] },
  creativity: { ko: ["창의", "새로운 것을 만들고 표현함"], en: ["Creativity", "Making and expressing something new"], ja: ["創造性", "新しいものを作り表現する"], zh: ["创造", "创造并表达新事物"], fr: ["Créativité", "Créer et exprimer du nouveau"], es: ["Creatividad", "Crear y expresar algo nuevo"] },
  contribution: { ko: ["기여", "사람과 사회에 보탬이 됨"], en: ["Contribution", "Helping people or the wider world"], ja: ["貢献", "人や社会の役に立つ"], zh: ["贡献", "帮助他人或社会"], fr: ["Contribution", "Aider les autres ou la société"], es: ["Contribución", "Ayudar a otros o a la sociedad"] },
  belonging: { ko: ["소속", "함께하고 받아들여지는 감각"], en: ["Belonging", "Feeling included and connected"], ja: ["所属", "受け入れられ、つながる感覚"], zh: ["归属", "被接纳并与人相连"], fr: ["Appartenance", "Me sentir inclus et relié"], es: ["Pertenencia", "Sentirme incluido y conectado"] },
  family: { ko: ["가족", "가까운 사람을 돌보고 함께함"], en: ["Family", "Caring for and being with close people"], ja: ["家族", "大切な人を支え共にいる"], zh: ["家庭", "照顾并陪伴亲近的人"], fr: ["Famille", "Prendre soin de mes proches"], es: ["Familia", "Cuidar y acompañar a mis cercanos"] },
  wellbeing: { ko: ["건강", "몸과 마음을 돌보는 여유"], en: ["Wellbeing", "Caring for body and mind"], ja: ["健やかさ", "心身を大切にする余裕"], zh: ["身心健康", "照顾身体与内心"], fr: ["Bien-être", "Prendre soin du corps et de l’esprit"], es: ["Bienestar", "Cuidar cuerpo y mente"] },
  balance: { ko: ["균형", "삶의 여러 영역에 공간을 둠"], en: ["Balance", "Making room for different parts of life"], ja: ["バランス", "人生の各領域に余白を持つ"], zh: ["平衡", "为生活各领域留出空间"], fr: ["Équilibre", "Faire place aux différents domaines de vie"], es: ["Equilibrio", "Dar espacio a las áreas de la vida"] },
  achievement: { ko: ["성취", "목표를 이루고 진전을 확인함"], en: ["Achievement", "Reaching goals and seeing progress"], ja: ["達成", "目標を実現し進歩を確かめる"], zh: ["成就", "实现目标并看到进展"], fr: ["Accomplissement", "Atteindre des objectifs et progresser"], es: ["Logro", "Alcanzar metas y ver progreso"] },
  recognition: { ko: ["인정", "노력과 성과를 알아봐 줌"], en: ["Recognition", "Having effort and results acknowledged"], ja: ["承認", "努力と成果を認められる"], zh: ["认可", "努力与成果被看见"], fr: ["Reconnaissance", "Voir mes efforts reconnus"], es: ["Reconocimiento", "Que valoren mi esfuerzo y resultados"] },
  influence: { ko: ["영향력", "결정과 변화에 목소리를 냄"], en: ["Influence", "Having a voice in decisions and change"], ja: ["影響力", "決定や変化に声を持つ"], zh: ["影响力", "在决策与改变中发声"], fr: ["Influence", "Avoir une voix dans les décisions"], es: ["Influencia", "Tener voz en decisiones y cambios"] },
  variety: { ko: ["다양성", "새로운 경험과 변화가 있음"], en: ["Variety", "New experiences and changing rhythms"], ja: ["多様性", "新しい経験と変化がある"], zh: ["多样", "拥有新体验与变化"], fr: ["Variété", "Vivre de nouvelles expériences"], es: ["Variedad", "Vivir experiencias y ritmos nuevos"] },
  curiosity: { ko: ["호기심", "질문하고 탐구하는 즐거움"], en: ["Curiosity", "The pleasure of asking and exploring"], ja: ["好奇心", "問い、探究する喜び"], zh: ["好奇", "提问与探索的乐趣"], fr: ["Curiosité", "Le plaisir de questionner et explorer"], es: ["Curiosidad", "El placer de preguntar y explorar"] },
  integrity: { ko: ["진실성", "말과 행동을 신념에 맞춤"], en: ["Integrity", "Aligning actions with what I stand for"], ja: ["誠実さ", "信念と言動を一致させる"], zh: ["正直一致", "让行动符合信念"], fr: ["Intégrité", "Aligner mes actes avec mes convictions"], es: ["Integridad", "Alinear mis actos con mis convicciones"] },
  meaning: { ko: ["의미", "왜 하는지 납득되는 방향"], en: ["Meaning", "A direction that feels worth pursuing"], ja: ["意味", "取り組む理由に納得できる方向"], zh: ["意义", "值得投入的方向"], fr: ["Sens", "Une direction qui mérite mon engagement"], es: ["Sentido", "Una dirección que merece mi esfuerzo"] },
  "financial-freedom": { ko: ["경제적 여유", "돈 때문에 선택이 막히지 않음"], en: ["Financial freedom", "Having choices not ruled by money"], ja: ["経済的余裕", "お金だけで選択を縛られない"], zh: ["财务余裕", "不让金钱限制选择"], fr: ["Liberté financière", "Ne pas laisser l’argent limiter mes choix"], es: ["Libertad financiera", "Que el dinero no limite mis opciones"] },
};

export function lifeValueCardCopy(id: LifeValueId, locale: AssessmentLocale): LifeValueCardCopy {
  return LIFE_VALUES_CARD_COPY[id][locale];
}
