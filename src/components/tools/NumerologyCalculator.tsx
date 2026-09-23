import { useState, useEffect } from "react";
import { birthdayNumberOf, lifePathOf, personalYearOf } from "@/lib/symbolic-tradition/numerology";
import type { Locale } from "../../i18n";
import { useProfilePrefill } from "../../lib/user/useProfilePrefill";
import { BirthDateField, ProfileNameField } from "../shared/BirthDateField";
import AnimatedNumber from "../ui/AnimatedNumber";
import NumerologyOrbit from "./numerology/NumerologyOrbit";
import type { NumerologyNode } from "./numerology/NumerologyOrbitScene";

interface Props {
  locale: Locale;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Reduce a number to a single digit (preserving 11, 22, 33 as master numbers) */
function reduceToDigit(n: number): number {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n).split("").reduce((s, d) => s + parseInt(d), 0);
  }
  return n;
}

/** Sum all digits in a string of numbers */
function digitSum(s: string): number {
  return s.split("").reduce((acc, ch) => acc + (parseInt(ch) || 0), 0);
}

/** Pythagorean letter-to-number mapping */
const LETTER_MAP: Record<string, number> = {
  a:1,b:2,c:3,d:4,e:5,f:6,g:7,h:8,i:9,
  j:1,k:2,l:3,m:4,n:5,o:6,p:7,q:8,r:9,
  s:1,t:2,u:3,v:4,w:5,x:6,y:7,z:8,
};

const VOWELS = new Set(["a","e","i","o","u"]);

/**
 * Life Path — symbolic-tradition/numerology 가 달력 문자열에서 바로 셈한다.
 * 여기서 `new Date(dateStr)` 로 셈하던 때는 서반구에서 하루 앞 날짜가 됐다.
 */
function calcLifePath(dateStr: string): number {
  return lifePathOf(dateStr);
}

/**
 * The Pythagorean map above only covers a-z, so a name written in Hangul,
 * kana or Hanzi reduces to an empty string. That used to flow through as 0,
 * and MEANINGS[0] does not exist, so three of the four result cards returned
 * null and simply vanished with no explanation. Callers now check this first
 * and say so instead.
 *
 * Deliberately NOT romanising automatically: Korean has competing systems
 * (Revised Romanization vs. the spelling on a passport), and picking one
 * silently would hand back a confidently wrong number, which is worse than
 * the missing cards it replaces.
 */
function latinLetters(name: string): string {
  return name.toLowerCase().replace(/[^a-z]/g, "");
}

/** Expression = sum of all letters in full name */
function calcExpression(name: string): number {
  const n = latinLetters(name);
  return reduceToDigit(digitSum(n.split("").map((c) => String(LETTER_MAP[c] || 0)).join("")));
}

/** Soul Urge = vowels only */
function calcSoulUrge(name: string): number {
  const vowelNums = name.toLowerCase().split("").filter((c) => VOWELS.has(c)).map((c) => LETTER_MAP[c] || 0);
  return reduceToDigit(vowelNums.reduce((a, b) => a + b, 0));
}

/** Personality = consonants only */
function calcPersonality(name: string): number {
  const consNums = name.toLowerCase().replace(/[^a-z]/g, "").split("").filter((c) => !VOWELS.has(c)).map((c) => LETTER_MAP[c] || 0);
  return reduceToDigit(consNums.reduce((a, b) => a + b, 0));
}

// ─── i18n ─────────────────────────────────────────────────────────────────────

const UI: Record<Locale, {
  title: string;
  subtitle: string;
  nameLabel: string;
  namePlaceholder: string;
  dateLabel: string;
  calcBtn: string;
  resetBtn: string;
  lifePathLabel: string;
  expressionLabel: string;
  soulUrgeLabel: string;
  personalityLabel: string;
  masterNote: string;
  keywordsLabel: string;
  meaningLabel: string;
  challengeLabel: string;
  giftLabel: string;
  latinRequired: string;
  birthdayLabel: string;
  personalYearLabel: string;
  personalYearNote: string;
  dateOnlyHint: string;
}> = {
  ko: {
    title: "수비학 계산기",
    subtitle: "생년월일과 이름으로 생명수·표현수·영혼수·성격수 분석",
    nameLabel: "영문 이름 (풀네임)",
    namePlaceholder: "예: Kim Minsu",
    dateLabel: "생년월일",
    calcBtn: "수비학 분석",
    resetBtn: "다시 분석",
    lifePathLabel: "생명수 (Life Path)",
    expressionLabel: "표현수 (Expression)",
    soulUrgeLabel: "영혼수 (Soul Urge)",
    personalityLabel: "성격수 (Personality)",
    masterNote: "마스터 넘버",
    keywordsLabel: "키워드",
    meaningLabel: "의미",
    challengeLabel: "과제",
    giftLabel: "재능",
    latinRequired: "표현수·영혼수·성격수는 로마자 표기로 계산합니다. 이름을 영문으로 입력하면 함께 보여드릴게요. 생명수는 생년월일만으로 계산되어 아래에 그대로 나옵니다.",
    birthdayLabel: "생일수 (Birthday)",
    personalYearLabel: "{year}년의 개인년",
    personalYearNote: "개인년은 아홉 해를 한 바퀴로 도는 주기예요. 해가 바뀌면 값도 바뀌어요.",
    dateOnlyHint: "생명수·생일수·개인년은 생년월일만으로 나와요. 이름은 넣지 않아도 괜찮아요.",
  },
  en: {
    title: "Numerology Calculator",
    subtitle: "Discover your Life Path, Expression, Soul Urge & Personality numbers",
    nameLabel: "Full Name (in English)",
    namePlaceholder: "e.g. John Smith",
    dateLabel: "Date of Birth",
    calcBtn: "Calculate",
    resetBtn: "Recalculate",
    lifePathLabel: "Life Path Number",
    expressionLabel: "Expression Number",
    soulUrgeLabel: "Soul Urge Number",
    personalityLabel: "Personality Number",
    masterNote: "Master Number",
    keywordsLabel: "Keywords",
    meaningLabel: "Meaning",
    challengeLabel: "Challenge",
    giftLabel: "Gift",
    latinRequired: "Expression, Soul Urge, and Personality are calculated from Latin letters. Enter your name in Latin script to see them. Life Path comes from your birth date alone and is shown below.",
    birthdayLabel: "Birthday Number",
    personalYearLabel: "Personal Year {year}",
    personalYearNote: "The personal year runs in a nine-year cycle, so this number changes each January.",
    dateOnlyHint: "Life path, birthday number and personal year come from the date alone — a name is optional.",
  },
  ja: {
    title: "数秘術計算機",
    subtitle: "生年月日と名前でライフパス・表現数・魂の数・個性数を分析",
    nameLabel: "英語フルネーム",
    namePlaceholder: "例: Tanaka Yuki",
    dateLabel: "生年月日",
    calcBtn: "数秘術を計算",
    resetBtn: "再計算",
    lifePathLabel: "ライフパスナンバー",
    expressionLabel: "表現数",
    soulUrgeLabel: "魂の数",
    personalityLabel: "個性数",
    masterNote: "マスターナンバー",
    keywordsLabel: "キーワード",
    meaningLabel: "意味",
    challengeLabel: "課題",
    giftLabel: "才能",
    latinRequired: "表現数・魂の数・個性数はローマ字表記から計算します。お名前をローマ字で入力すると表示されます。ライフパスは生年月日だけで計算されるため、下にそのまま表示されます。",
    birthdayLabel: "誕生日数（Birthday）",
    personalYearLabel: "{year}年のパーソナルイヤー",
    personalYearNote: "パーソナルイヤーは九年でひと回りする周期です。年が変われば数も変わります。",
    dateOnlyHint: "ライフパス・誕生日数・パーソナルイヤーは生年月日だけで出ます。名前は任意です。",
  },
  fr: {
    title: "Calculateur de Numérologie",
    subtitle: "Découvrez votre chemin de vie, nombre d'expression, d'âme et de personnalité",
    nameLabel: "Nom complet (en lettres latines)",
    namePlaceholder: "ex: Jean Dupont",
    dateLabel: "Date de naissance",
    calcBtn: "Calculer",
    resetBtn: "Recalculer",
    lifePathLabel: "Chemin de Vie",
    expressionLabel: "Nombre d'Expression",
    soulUrgeLabel: "Nombre d'Âme",
    personalityLabel: "Nombre de Personnalité",
    masterNote: "Nombre Maître",
    keywordsLabel: "Mots-clés",
    meaningLabel: "Signification",
    challengeLabel: "Défi",
    giftLabel: "Don",
    latinRequired: "Les nombres d'Expression, d'Âme et de Personnalité se calculent à partir de l'alphabet latin. Saisissez votre nom en caractères latins pour les afficher. Le Chemin de Vie ne dépend que de la date de naissance et reste affiché ci-dessous.",
    birthdayLabel: "Nombre du jour de naissance",
    personalYearLabel: "Année personnelle {year}",
    personalYearNote: "L’année personnelle suit un cycle de neuf ans : ce nombre change chaque janvier.",
    dateOnlyHint: "Chemin de vie, nombre du jour et année personnelle ne dépendent que de la date ; le nom est facultatif.",
  },
  es: {
    title: "Calculadora de Numerología",
    subtitle: "Descubre tu Camino de Vida, Expresión, Deseo del Alma y Personalidad",
    nameLabel: "Nombre completo (en letras latinas)",
    namePlaceholder: "ej: Juan García",
    dateLabel: "Fecha de nacimiento",
    calcBtn: "Calcular",
    resetBtn: "Recalcular",
    lifePathLabel: "Camino de Vida",
    expressionLabel: "Número de Expresión",
    soulUrgeLabel: "Deseo del Alma",
    personalityLabel: "Número de Personalidad",
    masterNote: "Número Maestro",
    keywordsLabel: "Palabras clave",
    meaningLabel: "Significado",
    challengeLabel: "Desafío",
    giftLabel: "Don",
    latinRequired: "Los números de Expresión, Deseo del Alma y Personalidad se calculan con el alfabeto latino. Escribe tu nombre en caracteres latinos para verlos. El Camino de Vida solo depende de la fecha de nacimiento y aparece abajo.",
    birthdayLabel: "Número del día de nacimiento",
    personalYearLabel: "Año personal {year}",
    personalYearNote: "El año personal sigue un ciclo de nueve años, así que este número cambia cada enero.",
    dateOnlyHint: "Camino de vida, número del día y año personal salen solo de la fecha; el nombre es opcional.",
  },
  zh: {
    title: "数字命理计算器",
    subtitle: "通过生日和姓名计算生命数、表达数、灵魂数和个性数",
    nameLabel: "英文全名",
    namePlaceholder: "例: Wang Fang",
    dateLabel: "出生日期",
    calcBtn: "计算",
    resetBtn: "重新计算",
    lifePathLabel: "生命灵数",
    expressionLabel: "表达数",
    soulUrgeLabel: "灵魂冲动数",
    personalityLabel: "个性数",
    masterNote: "主数",
    keywordsLabel: "关键词",
    meaningLabel: "含义",
    challengeLabel: "挑战",
    giftLabel: "天赋",
    latinRequired: "表达数、灵魂冲动数与个性数以拉丁字母计算。请用英文拼写输入姓名即可显示。生命灵数仅依出生日期计算，仍会显示在下方。",
    birthdayLabel: "生日数（Birthday）",
    personalYearLabel: "{year} 年的个人年",
    personalYearNote: "个人年以九年为一个循环，跨年之后数字就会改变。",
    dateOnlyHint: "生命数、生日数与个人年只需生日即可计算，姓名可留空。",
  },
};

interface NumberMeaning {
  color: string;
  bg: string;
  keywords: Record<Locale, string[]>;
  meaning: Record<Locale, string>;
  challenge: Record<Locale, string>;
  gift: Record<Locale, string>;
}

const MEANINGS: Record<number, NumberMeaning> = {
  1: {
    color: "text-red-700", bg: "bg-red-50 border-red-200",
    keywords: {
      ko: ["독립심", "리더십", "개척정신", "자신감"],
      en: ["Independence", "Leadership", "Pioneer", "Confidence"],
      ja: ["独立心", "リーダーシップ", "開拓精神", "自信"],
      fr: ["Indépendance", "Leadership", "Pionnier", "Confiance"],
      es: ["Independencia", "Liderazgo", "Pionero", "Confianza"],
      zh: ["独立", "领导力", "开拓精神", "自信"],
    },
    meaning: {
      ko: "당신은 타고난 리더입니다. 독창적인 아이디어와 강한 의지로 새로운 길을 개척합니다.",
      en: "You are a born leader. With original ideas and strong will, you blaze new trails.",
      ja: "あなたは生まれながらのリーダーです。独創的なアイデアと強い意志で新しい道を切り開きます。",
      fr: "Vous êtes un leader né. Avec des idées originales et une forte volonté, vous tracez de nouveaux chemins.",
      es: "Eres un líder nato. Con ideas originales y fuerte voluntad, abres nuevos caminos.",
      zh: "你是天生的领导者。以独创的想法和强大的意志力开辟新道路。",
    },
    challenge: {
      ko: "독선과 고집을 경계하고 타인의 의견을 경청하는 연습이 필요합니다.",
      en: "Beware of stubbornness and self-righteousness; practice listening to others.",
      ja: "独善と頑固さに注意し、他者の意見に耳を傾ける練習が必要です。",
      fr: "Méfiez-vous de l'entêtement ; pratiquez l'écoute des autres.",
      es: "Cuidado con la terquedad; practica escuchar a los demás.",
      zh: "警惕固执自以为是，需要练习倾听他人意见。",
    },
    gift: {
      ko: "강한 추진력과 독창성으로 아무도 가지 않은 길을 만들어냅니다.",
      en: "Strong drive and originality allow you to create paths no one else has walked.",
      ja: "強い推進力と独創性で、誰も歩んでいない道を作り出します。",
      fr: "Force de caractère et originalité pour créer des voies inédites.",
      es: "Fuerte impulso y originalidad para crear caminos que nadie ha recorrido.",
      zh: "强大的驱动力和独创性让你能走出前人未走过的路。",
    },
  },
  2: {
    color: "text-pink-700", bg: "bg-pink-50 border-pink-200",
    keywords: {
      ko: ["협력", "균형", "감수성", "외교적"],
      en: ["Cooperation", "Balance", "Sensitivity", "Diplomatic"],
      ja: ["協力", "バランス", "感受性", "外交的"],
      fr: ["Coopération", "Équilibre", "Sensibilité", "Diplomatique"],
      es: ["Cooperación", "Equilibrio", "Sensibilidad", "Diplomático"],
      zh: ["合作", "平衡", "感受性", "外交手腕"],
    },
    meaning: {
      ko: "당신은 뛰어난 중재자이자 파트너입니다. 관계의 조화를 추구하고 섬세한 감수성으로 주변을 편안하게 합니다.",
      en: "You are an excellent mediator and partner. You seek harmony in relationships and put others at ease with your delicate sensitivity.",
      ja: "あなたは優れた調停者でありパートナーです。関係の調和を求め、繊細な感受性で周囲を和ませます。",
      fr: "Vous êtes un excellent médiateur et partenaire. Vous recherchez l'harmonie et mettez les autres à l'aise.",
      es: "Eres un excelente mediador y compañero. Buscas la armonía y pones a los demás a gusto.",
      zh: "你是出色的调解者和伙伴。追求关系中的和谐，用细腻的感受力让周围的人感到轻松。",
    },
    challenge: {
      ko: "지나친 의존과 우유부단함을 극복하고 자신의 목소리를 낼 용기가 필요합니다.",
      en: "Overcome excessive dependence and indecisiveness; find the courage to speak your truth.",
      ja: "過度な依存と優柔不断を克服し、自分の声を出す勇気が必要です。",
      fr: "Surmontez dépendance excessive et indécision; osez exprimer votre vérité.",
      es: "Supera la dependencia excesiva e indecisión; encuentra el valor para expresar tu verdad.",
      zh: "克服过度依赖和优柔寡断，需要勇气说出自己的想法。",
    },
    gift: {
      ko: "타인의 감정을 깊이 이해하는 공감 능력과 갈등을 조율하는 탁월한 능력을 가졌습니다.",
      en: "Deep empathy and exceptional ability to mediate conflicts.",
      ja: "他者の感情を深く理解する共感能力と、対立を調整する卓越した能力を持っています。",
      fr: "Empathie profonde et capacité exceptionnelle à résoudre les conflits.",
      es: "Profunda empatía y excepcional capacidad para mediar conflictos.",
      zh: "深刻理解他人情感的同理心和化解冲突的卓越能力。",
    },
  },
  3: {
    color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200",
    keywords: {
      ko: ["창의성", "표현력", "사교성", "낙관주의"],
      en: ["Creativity", "Expression", "Sociability", "Optimism"],
      ja: ["創造性", "表現力", "社交性", "楽観主義"],
      fr: ["Créativité", "Expression", "Sociabilité", "Optimisme"],
      es: ["Creatividad", "Expresión", "Sociabilidad", "Optimismo"],
      zh: ["创造力", "表达能力", "社交性", "乐观主义"],
    },
    meaning: {
      ko: "당신은 빛나는 창의적 표현자입니다. 예술, 글쓰기, 말하기 등으로 세상에 기쁨을 전합니다.",
      en: "You are a radiant creative expresser. You bring joy to the world through art, writing, and communication.",
      ja: "あなたは輝く創造的な表現者です。芸術、文章、話し言葉で世界に喜びをもたらします。",
      fr: "Vous êtes un brillant expressif créatif. Vous apportez joie au monde par l'art et la communication.",
      es: "Eres un brillante expresor creativo. Llevas alegría al mundo a través del arte y la comunicación.",
      zh: "你是闪耀的创意表达者。通过艺术、写作和沟通为世界带来快乐。",
    },
    challenge: {
      ko: "에너지를 분산하지 않고 한 가지에 집중하는 능력을 키워야 합니다.",
      en: "Develop the ability to focus on one thing rather than scattering your energy.",
      ja: "エネルギーを分散させず、一つのことに集中する能力を育てる必要があります。",
      fr: "Développez la capacité de vous concentrer plutôt que de disperser votre énergie.",
      es: "Desarrolla la capacidad de concentrarte en una cosa en lugar de dispersar tu energía.",
      zh: "需要培养专注于一件事的能力，而不是分散精力。",
    },
    gift: {
      ko: "타고난 유머와 창의력으로 어디서든 분위기를 밝히는 에너지를 가졌습니다.",
      en: "Natural humor and creativity that brightens any atmosphere.",
      ja: "生まれながらのユーモアと創造力で、どこでも雰囲気を明るくするエネルギーを持っています。",
      fr: "Humour naturel et créativité qui illuminent n'importe quelle atmosphère.",
      es: "Humor natural y creatividad que iluminan cualquier ambiente.",
      zh: "天生的幽默感和创造力，能在任何地方活跃气氛。",
    },
  },
  4: {
    color: "text-green-700", bg: "bg-surface-subtle border-green-200",
    keywords: {
      ko: ["안정", "실용성", "성실함", "체계적"],
      en: ["Stability", "Practicality", "Diligence", "Systematic"],
      ja: ["安定", "実用性", "誠実さ", "体系的"],
      fr: ["Stabilité", "Praticité", "Diligence", "Systématique"],
      es: ["Estabilidad", "Practicidad", "Diligencia", "Sistemático"],
      zh: ["稳定", "实用性", "勤勉", "系统性"],
    },
    meaning: {
      ko: "당신은 신뢰할 수 있는 건축가입니다. 체계적이고 성실한 노력으로 단단한 기반을 쌓아갑니다.",
      en: "You are a trustworthy builder. Through systematic and diligent effort, you lay a solid foundation.",
      ja: "あなたは信頼できる建築家です。体系的で誠実な努力で確かな基盤を築いていきます。",
      fr: "Vous êtes un bâtisseur fiable. Par l'effort systématique et diligent, vous posez des bases solides.",
      es: "Eres un constructor confiable. Con esfuerzo sistemático y diligente, construyes una base sólida.",
      zh: "你是值得信赖的建造者。通过系统性的努力奠定坚实基础。",
    },
    challenge: {
      ko: "지나친 경직성과 변화 거부를 극복하고 유연성을 키워야 합니다.",
      en: "Overcome excessive rigidity and resistance to change by cultivating flexibility.",
      ja: "過度な硬直性と変化への抵抗を克服し、柔軟性を育てる必要があります。",
      fr: "Surmontez la rigidité excessive et la résistance au changement en cultivant la flexibilité.",
      es: "Supera la rigidez excesiva y la resistencia al cambio cultivando flexibilidad.",
      zh: "需要克服过度刻板和对变化的抗拒，培养灵活性。",
    },
    gift: {
      ko: "어떤 프로젝트든 끝까지 완성하는 놀라운 인내력과 실행력을 가졌습니다.",
      en: "Remarkable perseverance and execution ability to see any project through to completion.",
      ja: "どんなプロジェクトも最後まで完成させる驚くべき忍耐力と実行力を持っています。",
      fr: "Persévérance remarquable pour mener n'importe quel projet à terme.",
      es: "Perseverancia y capacidad de ejecución para completar cualquier proyecto.",
      zh: "无论什么项目都能坚持到底完成的惊人耐力和执行力。",
    },
  },
  5: {
    color: "text-blue-700", bg: "bg-blue-50 border-blue-200",
    keywords: {
      ko: ["자유", "모험", "변화", "적응력"],
      en: ["Freedom", "Adventure", "Change", "Adaptability"],
      ja: ["自由", "冒険", "変化", "適応力"],
      fr: ["Liberté", "Aventure", "Changement", "Adaptabilité"],
      es: ["Libertad", "Aventura", "Cambio", "Adaptabilidad"],
      zh: ["自由", "冒险", "变化", "适应力"],
    },
    meaning: {
      ko: "당신은 자유로운 모험가입니다. 변화를 두려워하지 않고 다양한 경험을 통해 인생을 풍요롭게 합니다.",
      en: "You are a free-spirited adventurer. Unafraid of change, you enrich life through varied experiences.",
      ja: "あなたは自由な冒険家です。変化を恐れず、様々な経験を通して人生を豊かにします。",
      fr: "Vous êtes un aventurier libre. Sans craindre le changement, vous enrichissez la vie d'expériences variées.",
      es: "Eres un aventurero libre. Sin miedo al cambio, enriqueces tu vida con experiencias variadas.",
      zh: "你是自由奔放的冒险家。不惧变化，通过丰富的经历丰富人生。",
    },
    challenge: {
      ko: "충동적 결정과 집중력 부족을 극복하고 하나의 방향으로 나아가는 힘을 길러야 합니다.",
      en: "Overcome impulsive decisions and lack of focus; build the strength to move in one direction.",
      ja: "衝動的な決断と集中力不足を克服し、一つの方向に進む力を育てる必要があります。",
      fr: "Surmontez les décisions impulsives et le manque de concentration; bâtissez la force d'aller dans une direction.",
      es: "Supera decisiones impulsivas y falta de concentración; desarrolla la fuerza de ir en una dirección.",
      zh: "需要克服冲动的决定和缺乏专注，培养朝一个方向前进的力量。",
    },
    gift: {
      ko: "어떤 상황에서도 빠르게 적응하고 새로운 가능성을 발견하는 탁월한 감각을 가졌습니다.",
      en: "Exceptional sense of adapting quickly and discovering new possibilities in any situation.",
      ja: "どんな状況でも素早く適応し、新たな可能性を見出す卓越した感覚を持っています。",
      fr: "Sens exceptionnel d'adaptation rapide et de découverte de nouvelles possibilités.",
      es: "Excepcional sentido de adaptación rápida y descubrimiento de nuevas posibilidades.",
      zh: "在任何情况下都能快速适应并发现新可能性的卓越感知力。",
    },
  },
  6: {
    color: "text-rose-700", bg: "bg-rose-50 border-rose-200",
    keywords: {
      ko: ["가정", "책임감", "봉사", "사랑"],
      en: ["Home", "Responsibility", "Service", "Love"],
      ja: ["家庭", "責任感", "奉仕", "愛"],
      fr: ["Foyer", "Responsabilité", "Service", "Amour"],
      es: ["Hogar", "Responsabilidad", "Servicio", "Amor"],
      zh: ["家庭", "责任感", "服务", "爱"],
    },
    meaning: {
      ko: "당신은 타고난 보호자이자 치유자입니다. 가족과 공동체를 위해 헌신하며 사랑으로 세상을 더 따뜻하게 합니다.",
      en: "You are a born protector and healer. Devoted to family and community, you make the world warmer with love.",
      ja: "あなたは生まれながらの守護者であり癒し手です。家族とコミュニティに献身し、愛で世界を温かくします。",
      fr: "Vous êtes un protecteur et guérisseur né. Dévoué à la famille et la communauté, vous réchauffez le monde.",
      es: "Eres un protector y sanador nato. Dedicado a la familia y comunidad, haces el mundo más cálido.",
      zh: "你是天生的保护者和治愈者。为家人和社区奉献，以爱让世界更温暖。",
    },
    challenge: {
      ko: "자신을 희생하는 과도한 봉사에서 벗어나 건강한 경계를 설정하는 법을 배워야 합니다.",
      en: "Learn to set healthy boundaries instead of over-sacrificing yourself in service.",
      ja: "自己犠牲的な奉仕から離れ、健全な境界を設定する方法を学ぶ必要があります。",
      fr: "Apprenez à poser des limites saines plutôt que de trop vous sacrifier.",
      es: "Aprende a establecer límites saludables en lugar de sacrificarte demasiado.",
      zh: "需要学会设立健康的界限，而非过度牺牲自己去服务他人。",
    },
    gift: {
      ko: "무조건적인 사랑과 깊은 치유 능력으로 상처받은 영혼을 위로합니다.",
      en: "Unconditional love and deep healing ability to comfort wounded souls.",
      ja: "無条件の愛と深い癒しの能力で傷ついた魂を慰めます。",
      fr: "Amour inconditionnel et profonde capacité de guérison pour réconforter les âmes blessées.",
      es: "Amor incondicional y profunda capacidad curativa para consolar almas heridas.",
      zh: "无条件的爱和深刻的治愈能力，能安慰受伤的灵魂。",
    },
  },
  7: {
    color: "text-green-700", bg: "bg-surface-subtle border-green-200",
    keywords: {
      ko: ["지혜", "분석", "영성", "내향성"],
      en: ["Wisdom", "Analysis", "Spirituality", "Introspection"],
      ja: ["知恵", "分析", "霊性", "内向性"],
      fr: ["Sagesse", "Analyse", "Spiritualité", "Introspection"],
      es: ["Sabiduría", "Análisis", "Espiritualidad", "Introspección"],
      zh: ["智慧", "分析", "灵性", "内省"],
    },
    meaning: {
      ko: "당신은 진실을 탐구하는 철학자입니다. 깊은 사색과 분석으로 인생의 숨겨진 의미를 찾아갑니다.",
      en: "You are a philosopher seeking truth. Deep reflection and analysis guide you to life's hidden meanings.",
      ja: "あなたは真実を探求する哲学者です。深い思索と分析で人生の隠れた意味を探っていきます。",
      fr: "Vous êtes un philosophe en quête de vérité. La réflexion profonde vous guide vers les sens cachés.",
      es: "Eres un filósofo en busca de la verdad. La reflexión profunda te guía hacia los significados ocultos.",
      zh: "你是探寻真理的哲学家。通过深刻的沉思和分析，寻找生命的隐藏意义。",
    },
    challenge: {
      ko: "고립과 불신을 극복하고 타인과의 진정한 연결을 두려워하지 않는 용기가 필요합니다.",
      en: "Overcome isolation and mistrust; find the courage to genuinely connect with others.",
      ja: "孤立と不信を克服し、他者との真のつながりを恐れない勇気が必要です。",
      fr: "Surmontez l'isolement et la méfiance; trouvez le courage de vous connecter vraiment.",
      es: "Supera el aislamiento y la desconfianza; encuentra el valor de conectarte genuinamente.",
      zh: "需要克服孤立和不信任，勇于与他人建立真正的联结。",
    },
    gift: {
      ko: "남들이 보지 못하는 패턴을 발견하고 깊은 진리를 꿰뚫어 보는 탁월한 직관력을 가졌습니다.",
      en: "Exceptional intuition to discover patterns others miss and pierce deep truths.",
      ja: "他の人が見えないパターンを発見し、深い真実を見抜く卓越した直観力を持っています。",
      fr: "Intuition exceptionnelle pour découvrir des schémas que les autres manquent.",
      es: "Intuición excepcional para descubrir patrones que otros no ven.",
      zh: "发现他人看不到的规律、洞察深层真理的卓越直觉力。",
    },
  },
  8: {
    color: "text-amber-700", bg: "bg-amber-50 border-amber-200",
    keywords: {
      ko: ["성공", "권력", "물질", "야망"],
      en: ["Success", "Power", "Abundance", "Ambition"],
      ja: ["成功", "権力", "豊かさ", "野心"],
      fr: ["Succès", "Pouvoir", "Abondance", "Ambition"],
      es: ["Éxito", "Poder", "Abundancia", "Ambición"],
      zh: ["成功", "权力", "丰盛", "野心"],
    },
    meaning: {
      ko: "당신은 세상을 움직이는 힘을 가진 사람입니다. 강한 야망과 실행력으로 물질적·정신적 성공을 이룹니다.",
      en: "You have the power to move the world. Strong ambition and execution lead you to material and spiritual success.",
      ja: "あなたは世界を動かす力を持つ人物です。強い野心と実行力で物質的・精神的成功を収めます。",
      fr: "Vous avez le pouvoir de changer le monde. Forte ambition et exécution mènent au succès.",
      es: "Tienes el poder de mover el mundo. Fuerte ambición y ejecución te llevan al éxito.",
      zh: "你拥有影响世界的力量。强大的野心和执行力带领你走向物质和精神上的成功。",
    },
    challenge: {
      ko: "권력과 물질에 집착하지 않고 그것을 더 큰 선을 위해 사용하는 지혜가 필요합니다.",
      en: "Wisdom to use power and material success for greater good rather than clinging to them.",
      ja: "権力と物質への執着を手放し、より大きな善のために使う知恵が必要です。",
      fr: "Sagesse pour utiliser pouvoir et succès pour le bien commun plutôt que de s'y accrocher.",
      es: "Sabiduría para usar el poder y el éxito para el bien mayor en lugar de aferrarte a ellos.",
      zh: "需要智慧地使用权力和物质成功，为更大的善服务，而非执着于此。",
    },
    gift: {
      ko: "어떤 분야에서든 최고의 자리에 오를 수 있는 탁월한 전략적 사고와 실행 능력을 가졌습니다.",
      en: "Exceptional strategic thinking and execution to rise to the top in any field.",
      ja: "どんな分野でも最高の地位に上れる卓越した戦略的思考と実行能力を持っています。",
      fr: "Pensée stratégique et exécution exceptionnelles pour atteindre le sommet.",
      es: "Pensamiento estratégico y ejecución excepcionales para llegar a la cima.",
      zh: "在任何领域都能登顶的卓越战略思维和执行能力。",
    },
  },
  9: {
    color: "text-teal-700", bg: "bg-teal-50 border-teal-200",
    keywords: {
      ko: ["인도주의", "완성", "지혜", "자비"],
      en: ["Humanitarianism", "Completion", "Wisdom", "Compassion"],
      ja: ["人道主義", "完成", "知恵", "慈悲"],
      fr: ["Humanitarisme", "Achèvement", "Sagesse", "Compassion"],
      es: ["Humanitarismo", "Completitud", "Sabiduría", "Compasión"],
      zh: ["人道主义", "完成", "智慧", "慈悲"],
    },
    meaning: {
      ko: "당신은 인류를 품는 넓은 마음의 소유자입니다. 오래된 지혜와 깊은 자비로 세상에 봉사하는 사명을 지닙니다.",
      en: "You have a heart that embraces all of humanity. With ancient wisdom and deep compassion, you are called to serve the world.",
      ja: "あなたは人類を包む広い心の持ち主です。深い知恵と深い慈悲で世界に奉仕する使命を持っています。",
      fr: "Vous avez un cœur qui embrasse l'humanité. Sagesse ancienne et compassion profonde vous appellent à servir.",
      es: "Tienes un corazón que abraza a toda la humanidad. Sabiduría antigua y compasión profunda te llaman a servir.",
      zh: "你有一颗包容全人类的广阔心灵。以深邃的智慧和慈悲，承担服务世界的使命。",
    },
    challenge: {
      ko: "과거에 대한 집착과 감정적 상처를 놓아버리고 앞으로 나아가는 용기가 필요합니다.",
      en: "Release attachment to the past and emotional wounds; find courage to move forward.",
      ja: "過去への執着と感情的な傷を手放し、前に進む勇気が必要です。",
      fr: "Lâchez les attachements du passé et les blessures émotionnelles pour avancer.",
      es: "Suelta el apego al pasado y las heridas emocionales; encuentra valor para avanzar.",
      zh: "需要放下对过去的执着和情感创伤，勇于前行。",
    },
    gift: {
      ko: "삶의 모든 경험을 통합하여 타인의 길을 밝혀주는 지혜의 등불이 됩니다.",
      en: "Integrating all life experiences to become a light of wisdom that illuminates others' paths.",
      ja: "人生のすべての経験を統合し、他者の道を照らす知恵の灯台となります。",
      fr: "Intégrer toutes les expériences de vie pour devenir un phare de sagesse.",
      es: "Integrar todas las experiencias de vida para convertirse en un faro de sabiduría.",
      zh: "整合所有人生经验，成为照亮他人道路的智慧灯塔。",
    },
  },
  11: {
    color: "text-green-700", bg: "bg-surface-subtle border-green-200",
    keywords: {
      ko: ["영감", "직관", "이상주의", "영성"],
      en: ["Inspiration", "Intuition", "Idealism", "Spirituality"],
      ja: ["インスピレーション", "直感", "理想主義", "霊性"],
      fr: ["Inspiration", "Intuition", "Idéalisme", "Spiritualité"],
      es: ["Inspiración", "Intuición", "Idealismo", "Espiritualidad"],
      zh: ["灵感", "直觉", "理想主义", "灵性"],
    },
    meaning: {
      ko: "당신은 11의 마스터 넘버를 가진 타고난 영감의 채널입니다. 높은 직관력과 영적 통찰로 인류에게 빛을 가져다줍니다.",
      en: "You carry the Master Number 11 — a natural channel of inspiration. Your high intuition and spiritual insight bring light to humanity.",
      ja: "あなたはマスターナンバー11を持つ、生まれながらのインスピレーションのチャンネルです。高い直感力と霊的洞察で人類に光をもたらします。",
      fr: "Vous portez le Nombre Maître 11 — un canal d'inspiration naturel. Votre haute intuition apporte lumière à l'humanité.",
      es: "Llevas el Número Maestro 11 — canal natural de inspiración. Tu alta intuición trae luz a la humanidad.",
      zh: "你拥有主数11——天生的灵感传递渠道。高度直觉和灵性洞察为人类带来光明。",
    },
    challenge: {
      ko: "극도의 민감성과 내면의 갈등을 다스리고 높은 이상을 현실에 접지시키는 능력이 필요합니다.",
      en: "Managing extreme sensitivity and inner conflict; grounding high ideals into reality.",
      ja: "極度の感受性と内面の葛藤をコントロールし、高い理想を現実に接地させる能力が必要です。",
      fr: "Gérer l'hypersensibilité et les conflits intérieurs; ancrer les idéaux élevés dans la réalité.",
      es: "Manejar la extrema sensibilidad y conflictos internos; aterrizar los altos ideales en la realidad.",
      zh: "需要管理极度敏感和内心冲突，将崇高理想落实于现实。",
    },
    gift: {
      ko: "강렬한 직관과 영감으로 많은 사람들의 삶에 영향을 미치는 선지자적 능력을 가졌습니다.",
      en: "Prophetic ability to influence many lives through intense intuition and inspiration.",
      ja: "強い直感とインスピレーションで多くの人の人生に影響を与える先見的な能力を持っています。",
      fr: "Capacité prophétique d'influencer de nombreuses vies par l'intuition et l'inspiration.",
      es: "Capacidad profética de influir en muchas vidas a través de la intuición e inspiración.",
      zh: "以强烈的直觉和灵感影响众多人生的先知般的能力。",
    },
  },
  22: {
    color: "text-orange-700", bg: "bg-orange-50 border-orange-200",
    keywords: {
      ko: ["마스터 건축가", "실용적 이상주의", "대규모 비전", "변혁"],
      en: ["Master Builder", "Practical Idealism", "Grand Vision", "Transformation"],
      ja: ["マスタービルダー", "実践的理想主義", "大きなビジョン", "変革"],
      fr: ["Maître Bâtisseur", "Idéalisme pratique", "Grande vision", "Transformation"],
      es: ["Maestro Constructor", "Idealismo práctico", "Gran visión", "Transformación"],
      zh: ["大师建筑者", "实用理想主义", "宏大愿景", "变革"],
    },
    meaning: {
      ko: "당신은 22의 마스터 넘버, 마스터 건축가입니다. 원대한 비전을 현실로 구현하는 탁월한 능력으로 세상을 변화시킵니다.",
      en: "You carry Master Number 22 — the Master Builder. You transform the world by manifesting grand visions into reality.",
      ja: "あなたはマスターナンバー22、マスタービルダーです。壮大なビジョンを現実に具現化する卓越した能力で世界を変えます。",
      fr: "Vous portez le Nombre Maître 22 — le Maître Bâtisseur. Vous transformez le monde en manifestant de grandes visions.",
      es: "Llevas el Número Maestro 22 — el Maestro Constructor. Transformas el mundo materializando grandes visiones.",
      zh: "你拥有主数22——大师建筑者。将宏大愿景化为现实的卓越能力改变着世界。",
    },
    challenge: {
      ko: "거대한 잠재력에 짓눌리지 않고 한 걸음씩 현실적인 계획으로 실현하는 균형 감각이 필요합니다.",
      en: "Balance is needed to not be overwhelmed by vast potential — realize it step by step with realistic plans.",
      ja: "巨大な可能性に押し潰されず、一歩一歩現実的な計画で実現するバランス感覚が必要です。",
      fr: "Équilibre nécessaire pour ne pas être écrasé par un potentiel immense — réalisez-le pas à pas.",
      es: "Equilibrio para no ser abrumado por el vasto potencial — realizarlo paso a paso.",
      zh: "需要平衡感，不被巨大潜力压倒，而是一步一步用实际计划去实现。",
    },
    gift: {
      ko: "인류 역사에 기여하는 불멸의 작품을 남길 수 있는 마스터 빌더의 능력을 타고났습니다.",
      en: "Born with the Master Builder's ability to leave lasting works that contribute to human history.",
      ja: "人類の歴史に貢献する不朽の作品を残せるマスタービルダーの能力を持って生まれました。",
      fr: "Don du Maître Bâtisseur pour laisser des œuvres immortelles qui contribuent à l'histoire humaine.",
      es: "Don del Maestro Constructor para dejar obras inmortales que contribuyan a la historia humana.",
      zh: "天生具备大师建筑者的能力，能留下对人类历史有贡献的不朽作品。",
    },
  },
  33: {
    color: "text-green-700", bg: "bg-surface-subtle border-green-200",
    keywords: {
      ko: ["마스터 교사", "무조건적 사랑", "희생", "치유"],
      en: ["Master Teacher", "Unconditional Love", "Sacrifice", "Healing"],
      ja: ["マスターティーチャー", "無条件の愛", "犠牲", "癒し"],
      fr: ["Maître Enseignant", "Amour inconditionnel", "Sacrifice", "Guérison"],
      es: ["Maestro Instructor", "Amor incondicional", "Sacrificio", "Sanación"],
      zh: ["大师教师", "无条件的爱", "牺牲", "治愈"],
    },
    meaning: {
      ko: "당신은 33의 마스터 넘버, 마스터 교사입니다. 무조건적인 사랑으로 인류를 가르치고 치유하는 숭고한 사명을 지닙니다.",
      en: "You carry Master Number 33 — the Master Teacher. Your sublime mission is to teach and heal humanity with unconditional love.",
      ja: "あなたはマスターナンバー33、マスターティーチャーです。無条件の愛で人類を教え癒す崇高な使命を持っています。",
      fr: "Vous portez le Nombre Maître 33 — le Maître Enseignant. Votre mission sublime est d'enseigner et guérir avec amour inconditionnel.",
      es: "Llevas el Número Maestro 33 — el Maestro Instructor. Tu misión sublime es enseñar y sanar con amor incondicional.",
      zh: "你拥有主数33——大师教师。以无条件的爱教导和治愈人类是你崇高的使命。",
    },
    challenge: {
      ko: "자신을 돌보면서 타인을 섬기는 균형을 찾고, 자기 소진 없이 사랑을 나눌 방법을 찾아야 합니다.",
      en: "Find balance between caring for yourself and serving others; share love without self-depletion.",
      ja: "自分をケアしながら他者に奉仕するバランスを見つけ、自己消耗せずに愛を分かち合う方法を見つける必要があります。",
      fr: "Trouver équilibre entre prendre soin de soi et servir les autres sans s'épuiser.",
      es: "Encontrar equilibrio entre cuidarte y servir a otros; compartir amor sin agotarte.",
      zh: "在照顾自己和服务他人之间找到平衡，在不自我耗竭的情况下分享爱。",
    },
    gift: {
      ko: "존재 자체로 주변을 치유하고 영감을 주는 신성한 빛과 같은 존재입니다.",
      en: "Your very existence heals and inspires — you are like a divine light.",
      ja: "存在するだけで周囲を癒しインスピレーションを与える、神聖な光のような存在です。",
      fr: "Votre existence même guérit et inspire — vous êtes comme une lumière divine.",
      es: "Tu propia existencia sana e inspira — eres como una luz divina.",
      zh: "你的存在本身就能治愈和激励他人，如同神圣的光芒。",
    },
  },
};

/**
 * 개인년 1~9. 생명수의 뜻(타고난 결)과 다른 축이다 — 올해 어느 계절에
 * 서 있는지를 말한다. 아홉 해가 한 바퀴이고, 해가 바뀌면 값이 바뀐다.
 */
const PERSONAL_YEAR: Record<number, Record<Locale, string>> = {
  1: {
    ko: "새로 시작하는 해예요. 씨앗을 고르고 첫걸음을 떼기 좋아요.",
    en: "A year of beginnings. Choose the seed and take the first step.",
    ja: "始まりの年です。種を選び、最初の一歩を踏み出すのに向きます。",
    fr: "Une année de commencements : choisissez la graine et faites le premier pas.",
    es: "Un año de comienzos: elige la semilla y da el primer paso.",
    zh: "开始之年。选定种子，踏出第一步。",
  },
  2: {
    ko: "기다리고 맞추는 해예요. 혼자 밀기보다 곁의 사람과 보폭을 맞춰요.",
    en: "A year of pacing and partnering. Match steps with others instead of pushing alone.",
    ja: "待って合わせる年です。ひとりで押すより、隣の人と歩幅を合わせて。",
    fr: "Une année d’ajustement : accordez votre pas à celui des autres plutôt que de forcer seul.",
    es: "Un año de ajuste: acompasa tu ritmo con otros en vez de empujar en solitario.",
    zh: "等待与协调之年。与其独自推进，不如与身边的人同步。",
  },
  3: {
    ko: "표현하는 해예요. 말과 작품으로 밖에 내보일 때 힘이 붙어요.",
    en: "A year of expression. Things gather force when you put them out in words or work.",
    ja: "表現する年です。言葉や作品として外に出すと力がつきます。",
    fr: "Une année d’expression : ce que vous sortez en mots ou en œuvres prend de la force.",
    es: "Un año de expresión: lo que sacas en palabras u obras cobra fuerza.",
    zh: "表达之年。以言语或作品示人，力量才会聚起来。",
  },
  4: {
    ko: "다지는 해예요. 재미는 적어도 틀과 습관을 세우면 뒤가 편해져요.",
    en: "A year of groundwork. Less fun, but the structures and habits you set now carry you later.",
    ja: "固める年です。派手さはなくても、仕組みと習慣を作ると後が楽になります。",
    fr: "Une année de fondations : peu spectaculaire, mais les cadres posés maintenant vous porteront.",
    es: "Un año de cimientos: poco vistoso, pero las estructuras que fijes ahora te sostendrán.",
    zh: "扎根之年。虽不热闹，但此时建立的架构与习惯会撑住往后。",
  },
  5: {
    ko: "바뀌는 해예요. 자리·일·관계가 움직이니 너무 꽉 쥐지 않는 게 좋아요.",
    en: "A year of change. Places, work and ties shift — hold them loosely.",
    ja: "変わる年です。場所も仕事も関係も動くので、握りしめすぎないこと。",
    fr: "Une année de changement : lieux, travail et liens bougent — ne serrez pas trop fort.",
    es: "Un año de cambio: lugares, trabajo y vínculos se mueven; no aprietes demasiado.",
    zh: "变动之年。位置、工作与关系都在移动，别抓得太紧。",
  },
  6: {
    ko: "책임의 해예요. 집과 사람을 돌보는 일이 늘고, 그만큼 기대도 받아요.",
    en: "A year of responsibility. Home and people ask more of you, and more is expected in return.",
    ja: "責任の年です。家や人を世話することが増え、その分期待も受けます。",
    fr: "Une année de responsabilité : le foyer et les proches demandent davantage, et l’on attend autant de vous.",
    es: "Un año de responsabilidad: la casa y la gente piden más, y también se espera más de ti.",
    zh: "承担之年。照顾家与人的事变多，别人对你的期待也变多。",
  },
  7: {
    ko: "안으로 들어가는 해예요. 배우고 정리하고 혼자 생각할 시간이 필요해요.",
    en: "A year of turning inward. You need time to study, sort things out and think alone.",
    ja: "内に向かう年です。学び、整理し、ひとりで考える時間が要ります。",
    fr: "Une année tournée vers l’intérieur : il faut du temps pour apprendre, trier et penser seul.",
    es: "Un año hacia dentro: hace falta tiempo para estudiar, ordenar y pensar a solas.",
    zh: "向内之年。需要时间学习、整理，并独自思考。",
  },
  8: {
    ko: "거두는 해예요. 쌓아 온 것이 성과와 돈으로 드러나요.",
    en: "A year of harvest. What you have built shows up as results and money.",
    ja: "収穫の年です。積み上げてきたものが成果やお金として表れます。",
    fr: "Une année de récolte : ce que vous avez bâti se traduit en résultats et en argent.",
    es: "Un año de cosecha: lo construido aparece como resultados y dinero.",
    zh: "收成之年。累积下来的东西会化为成果与金钱。",
  },
  9: {
    ko: "마무리하는 해예요. 끝낼 것을 끝내야 다음 한 바퀴가 가볍게 시작돼요.",
    en: "A year of closing. Finish what should end, and the next cycle starts light.",
    ja: "締めくくる年です。終えるべきものを終えると、次の巡りが軽く始まります。",
    fr: "Une année de clôture : achevez ce qui doit finir, et le cycle suivant commencera léger.",
    es: "Un año de cierre: termina lo que debe acabar y el siguiente ciclo empezará ligero.",
    zh: "收尾之年。该结束的结束了，下一轮才会轻松开始。",
  },
};

// ─── Sub-component ────────────────────────────────────────────────────────────

function NumberCard({
  label,
  number,
  ui,
  locale,
  isMaster,
}: {
  label: string;
  number: number;
  ui: typeof UI[Locale];
  locale: Locale;
  isMaster: boolean;
}) {
  const m = MEANINGS[number];
  if (!m) return null;
  const challenge = m.challenge[locale];
  const gift = m.gift[locale];
  return (
    <div className={`rounded-xl border-2 p-4 space-y-3 ${m.bg}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
        {isMaster && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/60 ${m.color}`}>
            ✨ {ui.masterNote}
          </span>
        )}
      </div>
      <AnimatedNumber
        value={number}
        locales={locale}
        className={`text-5xl font-black ${m.color}`}
      />
      <div className="flex flex-wrap gap-1">
        {m.keywords[locale].map((k) => (
          <span key={k} className={`px-2 py-0.5 rounded-full text-xs font-medium bg-white/70 ${m.color}`}>
            {k}
          </span>
        ))}
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{m.meaning[locale]}</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-white/60 p-2">
          <p className="text-xs font-semibold text-gray-500 mb-1">🎁 {ui.giftLabel}</p>
          <p className="text-xs text-gray-700">{gift}</p>
        </div>
        <div className="rounded-lg bg-white/60 p-2">
          <p className="text-xs font-semibold text-gray-500 mb-1">⚡ {ui.challengeLabel}</p>
          <p className="text-xs text-gray-700">{challenge}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function NumerologyCalculator({ locale }: Props) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [result, setResult] = useState<{
    lifePath: number;
    birthday: number;
    personalYear: number;
    thisYear: number;
    // null when the name carries no Latin letters — see latinLetters().
    expression: null | number;
    soulUrge: null | number;
    personality: null | number;
  } | null>(null);
  const ui = UI[locale];

  // 온톨로지 프로필의 이름·생년월일 재사용 — 재입력 제거.
  const { profile, parsed, saveBirth, setProfile } = useProfilePrefill();
  useEffect(() => {
    if (parsed) setDate((d) => d || `${parsed.year}-${String(parsed.month).padStart(2, "0")}-${String(parsed.day).padStart(2, "0")}`);
    if (profile.name && latinLetters(profile.name)) setName((n) => n || profile.name!);
  }, [parsed, profile.name]);

  function calculate() {
    // 생명수·생일수·개인년은 날짜만으로 정해진다. 이름을 요구하면 로마자
    // 이름이 없는 사람은 날짜 수까지 못 보게 된다 — 이름은 선택이다.
    if (!date) return;
    // 이름·생년월일을 프로필에 저장 → 다른 도구로 전파.
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [yy, mm, dd] = date.split("-").map(Number);
      saveBirth({ year: yy, month: mm, day: dd });
    }
    if (name.trim()) setProfile({ name: name.trim() });
    const hasLetters = latinLetters(name).length > 0;
    const today = new Date();
    const todayCivil = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    setResult({
      lifePath: calcLifePath(date),
      birthday: birthdayNumberOf(date),
      personalYear: personalYearOf(date, todayCivil),
      thisYear: today.getFullYear(),
      expression: hasLetters ? calcExpression(name) : null,
      soulUrge: hasLetters ? calcSoulUrge(name) : null,
      personality: hasLetters ? calcPersonality(name) : null,
    });
  }

  const MASTER = new Set([11, 22, 33]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">{ui.title}</h1>
        <p className="mt-1 text-gray-500 text-sm">{ui.subtitle}</p>
      </div>

      {/* Inputs */}
      <div className="rounded-xl border border-gray-200 p-4 space-y-4">
        <ProfileNameField
          label={ui.nameLabel}
          locale={locale}
          value={name}
          onChange={setName}
          warning={latinLetters(name) ? undefined : ui.latinRequired}
        />
        <p className="text-xs leading-6 text-gray-500 [word-break:keep-all]">{ui.dateOnlyHint}</p>
        <BirthDateField
          id="numerology-birth-date"
          locale={locale}
          label={ui.dateLabel}
          value={date}
          onChange={setDate}
        />
        <button
          onClick={result ? () => setResult(null) : calculate}
          disabled={!date}
          className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary-strong disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {result ? ui.resetBtn : ui.calcBtn}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <NumerologyOrbit
            locale={locale}
            nodes={[result.lifePath, result.expression, result.soulUrge, result.personality]
              .filter((n): n is number => n !== null)
              .map((value): NumerologyNode => ({ value, isMaster: MASTER.has(value) }))}
          />
          <NumberCard
            label={ui.lifePathLabel}
            number={result.lifePath}
            ui={ui}
            locale={locale}
            isMaster={MASTER.has(result.lifePath)}
          />
          <NumberCard
            label={ui.birthdayLabel}
            number={result.birthday}
            ui={ui}
            locale={locale}
            isMaster={MASTER.has(result.birthday)}
          />
          <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {ui.personalYearLabel.replace("{year}", String(result.thisYear))}
            </p>
            <p className="mt-1 text-5xl font-black text-violet-700">{result.personalYear}</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">{PERSONAL_YEAR[result.personalYear]?.[locale]}</p>
            <p className="mt-2 text-xs leading-5 text-gray-500">{ui.personalYearNote}</p>
          </div>
          {result.expression === null && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900 [word-break:keep-all]">
              {ui.latinRequired}
            </p>
          )}
          {result.expression !== null && (
          <NumberCard
            label={ui.expressionLabel}
            number={result.expression}
            ui={ui}
            locale={locale}
            isMaster={MASTER.has(result.expression)}
          />
          )}
          {result.soulUrge !== null && (
          <NumberCard
            label={ui.soulUrgeLabel}
            number={result.soulUrge}
            ui={ui}
            locale={locale}
            isMaster={MASTER.has(result.soulUrge)}
          />
          )}
          {result.personality !== null && (
          <NumberCard
            label={ui.personalityLabel}
            number={result.personality}
            ui={ui}
            locale={locale}
            isMaster={MASTER.has(result.personality)}
          />
          )}
        </div>
      )}
    </div>
  );
}
