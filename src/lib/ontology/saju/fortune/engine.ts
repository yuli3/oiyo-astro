/**
 * Saju Fortune Engine
 * The Grand Archive - Deep Interpretation Layer
 *
 * Provides comprehensive local interpretations for:
 * - Noble Person (귀인) Direction
 * - Marriage Fortune (결혼운)
 * - Career Fortune (관운)
 * - Academic Fortune (학업운)
 * - Life Event Timing (大運 / Great Luck Cycles)
 */

import type { LocalizedString } from "@/types/manifest";

import {
  BRANCH_ORDER,
  earthlyBranches,
  heavenlyStems,
  STEM_ORDER,
} from "../data";
import {
  EarthlyBranch,
  FiveElement,
  HeavenlyStem,
  type SajuResult,
  TenGod,
} from "../types";

// ============================================================================
// NOBLE PERSON (貴人 / 귀인) - The direction and element of your benefactors
// ============================================================================

export interface ComprehensiveSajuReading {
  academic: AcademicFortune;
  career: CareerFortune;
  marriage: MarriageFortune;
  noblePerson: NoblePerson;
}

interface AcademicFortune {
  learningStyle: LocalizedString;
  narrative: LocalizedString;
  sealStarPresence: boolean;
}

// ============================================================================
// MARRIAGE FORTUNE (結婚運 / 결혼운)
// ============================================================================

interface CareerFortune {
  aptitude: LocalizedString;
  dominantStar: null | TenGod;
  favorableIndustries: LocalizedString;
}

interface MarriageFortune {
  favorableYears: number[];
  partnerElement: FiveElement;
  partnerNarrative: LocalizedString;
  spousePalaceAnalysis: LocalizedString;
}

// ============================================================================
// CAREER FORTUNE (官運 / 관운)
// ============================================================================

interface NoblePerson {
  direction: LocalizedString;
  element: FiveElement;
  narrative: LocalizedString;
}

/**
 * Analyzes Academic Fortune based on Seal Stars (Jeong-In, Pyeon-In).
 */
export function calculateAcademicFortune(saju: SajuResult): AcademicFortune {
  const tenGods = [
    saju.year.tenGod,
    saju.month.tenGod,
    saju.hour.tenGod,
  ].filter(Boolean);
  const hasJeongIn = tenGods.includes(TenGod.JEONG_IN);
  const hasPyeonIn = tenGods.includes(TenGod.PYEON_IN);
  const sealStarPresence = hasJeongIn || hasPyeonIn;

  let narrative: LocalizedString;
  let learningStyle: LocalizedString;

  if (hasJeongIn && hasPyeonIn) {
    narrative = {
      en: "Your chart is exceptionally blessed with both Direct and Indirect Seal Stars. This indicates a profound affinity for knowledge, both academic and esoteric. You are destined to be a lifelong learner and potentially a teacher.",
      ko: "사주에 정인(正印)과 편인(偏印)이 모두 있어 학문적 축복이 뛰어납니다. 이는 학문적이든 비전적이든 지식에 대한 깊은 친화력을 나타냅니다. 당신은 평생 학습자이자 잠재적으로 가르치는 사람이 될 운명입니다.",
    };
    learningStyle = {
      en: "Blended: Thrives in both structured academics and self-directed exploration.",
      ko: "혼합형: 체계적 학문과 자기주도 탐구 모두에서 빛납니다.",
    };
  } else if (hasJeongIn) {
    narrative = {
      en: "The Direct Seal Star (Jeong-In) blesses your chart. You have a natural gift for formal education, academic achievement, and certification. Traditional institutions serve you well.",
      ko: "정인(正印)이 사주에 있습니다. 당신은 정규 교육, 학문적 성취, 자격증 취득에 타고난 재능이 있습니다. 전통적인 기관이 당신에게 유리합니다.",
    };
    learningStyle = {
      en: "Traditional: Excels in structured learning environments with clear curricula.",
      ko: "전통형: 명확한 커리큘럼이 있는 체계적 학습 환경에서 뛰어납니다.",
    };
  } else if (hasPyeonIn) {
    narrative = {
      en: "The Indirect Seal Star (Pyeon-In) graces your chart. Your intelligence is unconventional. You learn best through self-study, alternative methods, and exploring the uncharted.",
      ko: "편인(偏印)이 사주에 있습니다. 당신의 지성은 비전통적입니다. 독학, 대안적 방법, 그리고 미지의 영역 탐구를 통해 가장 잘 배웁니다.",
    };
    learningStyle = {
      en: "Alternative: Thrives with self-directed learning, mentorship, and esoteric studies.",
      ko: "대안형: 자기주도 학습, 멘토링, 비전 연구에서 빛납니다.",
    };
  } else {
    narrative = {
      en: "Seal Stars are not prominent in your chart. Academic success will depend more on effort and circumstance than innate affinity. Focus on practical, experience-based learning.",
      ko: "인성(印星)이 사주에 두드러지지 않습니다. 학문적 성공은 타고난 친화력보다 노력과 환경에 더 의존할 것입니다. 실용적, 경험 기반 학습에 집중하세요.",
    };
    learningStyle = {
      en: "Practical: Benefits from hands-on experience and real-world application over abstract study.",
      ko: "실용형: 추상적 연구보다 실습 경험과 현실 적용에서 유리합니다.",
    };
  }

  return {
    learningStyle,
    narrative,
    sealStarPresence,
  };
}

// ============================================================================
// ACADEMIC FORTUNE (學業運 / 학업운)
// ============================================================================

/**
 * Analyzes Career Fortune based on Month Pillar and dominant Ten God.
 */
export function calculateCareerFortune(saju: SajuResult): CareerFortune {
  // The Month Pillar (especially Ten God from Month Stem) often indicates career pattern
  const monthTenGod = saju.month.tenGod || null;

  const careerNarrativeMap: Record<
    TenGod,
    { aptitude: LocalizedString; industries: LocalizedString }
  > = {
    [TenGod.BI_GYEON]: {
      aptitude: {
        en: "Entrepreneurship and self-directed work. You thrive when you are your own boss.",
        ko: "창업과 자기 주도적 일. 당신은 스스로 보스일 때 빛납니다.",
      },
      industries: {
        en: "Freelance, Consulting, Startups, Solo Practice",
        ko: "프리랜서, 컨설팅, 스타트업, 1인 전문직",
      },
    },
    [TenGod.GEOP_JAE]: {
      aptitude: {
        en: "Competitive fields requiring drive and assertiveness.",
        ko: "추진력과 적극성이 요구되는 경쟁적인 분야.",
      },
      industries: {
        en: "Sales, Trading, Investment Banking, Sports",
        ko: "영업, 트레이딩, 투자은행, 스포츠",
      },
    },
    [TenGod.JEONG_GWAN]: {
      aptitude: {
        en: "Structured hierarchies and formal recognition.",
        ko: "체계적인 위계와 공식적인 인정.",
      },
      industries: {
        en: "Government, Law, Corporate Management, Academia",
        ko: "공무원, 법조계, 기업 경영진, 학계",
      },
    },
    [TenGod.JEONG_IN]: {
      aptitude: {
        en: "Traditional knowledge transmission and mentorship.",
        ko: "전통적 지식 전수와 멘토링.",
      },
      industries: {
        en: "Education, Publishing, Research, Counseling",
        ko: "교육, 출판, 연구, 상담",
      },
    },
    [TenGod.JEONG_JAE]: {
      aptitude: {
        en: "Stable wealth accumulation through diligence.",
        ko: "근면함을 통한 안정적인 부의 축적.",
      },
      industries: {
        en: "Accounting, Finance, Retail Management",
        ko: "회계, 금융, 소매 관리",
      },
    },
    [TenGod.PYEON_GWAN]: {
      aptitude: {
        en: "High-pressure roles requiring resilience.",
        ko: "회복탄력성이 요구되는 고압적 역할.",
      },
      industries: {
        en: "Military, Emergency Services, Crisis Management",
        ko: "군대, 응급 서비스, 위기 관리",
      },
    },
    [TenGod.PYEON_IN]: {
      aptitude: {
        en: "Unconventional learning and esoteric knowledge.",
        ko: "비전통적 학습과 비전 지식.",
      },
      industries: {
        en: "Alternative Medicine, Occult Arts, Research",
        ko: "대체의학, 신비학, 연구",
      },
    },
    [TenGod.PYEON_JAE]: {
      aptitude: {
        en: "Speculative and high-risk ventures.",
        ko: "투기적이고 고위험 사업.",
      },
      industries: {
        en: "Venture Capital, Real Estate, Entertainment",
        ko: "벤처 캐피탈, 부동산, 엔터테인먼트",
      },
    },
    [TenGod.SANG_GWAN]: {
      aptitude: {
        en: "Disruptive innovation and challenging conventions.",
        ko: "파괴적 혁신과 관습에 도전.",
      },
      industries: {
        en: "Tech Startups, Activism, Avant-Garde Design",
        ko: "테크 스타트업, 사회운동, 아방가르드 디자인",
      },
    },
    [TenGod.SIK_SIN]: {
      aptitude: {
        en: "Creative expression and comfort industries.",
        ko: "창의적 표현과 안락함 관련 산업.",
      },
      industries: {
        en: "Arts, Content Creation, Culinary, Wellness",
        ko: "예술, 콘텐츠 제작, 요리, 웰니스",
      },
    },
  };

  const defaultCareer = {
    aptitude: {
      en: "Your career path is flexible, shaped by accumulated experience.",
      ko: "직업 경로는 유연하며 축적된 경험에 의해 형성됩니다.",
    },
    industries: {
      en: "Various fields depending on life circumstances",
      ko: "삶의 상황에 따라 다양한 분야",
    },
  };

  const careerData = monthTenGod
    ? careerNarrativeMap[monthTenGod]
    : defaultCareer;

  return {
    aptitude: careerData.aptitude,
    dominantStar: monthTenGod,
    favorableIndustries: careerData.industries,
  };
}

/**
 * Analyzes Marriage Fortune based on Spouse Palace (Day Branch) and Hour Pillar.
 */
export function calculateMarriageFortune(saju: SajuResult): MarriageFortune {
  const spousePalace = saju.day.earthlyBranch; // Spouse Palace = Day Branch
  const spousePalaceElement =
    earthlyBranches[spousePalace]?.element || FiveElement.EARTH;

  // Partner Element is typically the element that harmonizes with Spouse Palace
  const partnerElementMap: Record<FiveElement, FiveElement> = {
    [FiveElement.EARTH]: FiveElement.FIRE, // Fire produces Earth
    [FiveElement.FIRE]: FiveElement.WOOD, // Wood feeds Fire
    [FiveElement.METAL]: FiveElement.EARTH, // Earth produces Metal
    [FiveElement.WATER]: FiveElement.METAL, // Metal produces Water
    [FiveElement.WOOD]: FiveElement.WATER, // Water nurtures Wood
  };
  const partnerElement = partnerElementMap[spousePalaceElement];

  // Simplified favorable year calculation based on partner element's branch years
  const currentYear = new Date().getFullYear();
  const favorableYears: number[] = [];
  for (let y = currentYear; y <= currentYear + 15; y++) {
    const yearBranchIndex = (y - 4) % 12; // Simplified Ganzhi year calculation
    const yearBranch =
      BRANCH_ORDER[
        yearBranchIndex < 0 ? yearBranchIndex + 12 : yearBranchIndex
      ];
    if (yearBranch && earthlyBranches[yearBranch]?.element === partnerElement) {
      favorableYears.push(y);
    }
  }

  const partnerNarrativeMap: Record<FiveElement, LocalizedString> = {
    [FiveElement.EARTH]: {
      en: "Your ideal partner brings stability and practicality. They are reliable, patient, and grounded. Look for someone who values security and steady growth.",
      ko: "이상적인 배우자는 안정감과 실용성을 가져옵니다. 그들은 믿음직하고, 인내심 있으며, 현실적입니다. 안정과 꾸준한 성장을 중시하는 사람을 찾으세요.",
    },
    [FiveElement.FIRE]: {
      en: "Your ideal partner is passionate and inspiring. They bring warmth, excitement, and visibility. Look for someone with creative energy and leadership.",
      ko: "이상적인 배우자는 열정적이고 영감을 주는 사람입니다. 그들은 따뜻함, 설렘, 그리고 존재감을 가져옵니다. 창의적 에너지와 리더십을 가진 사람을 찾으세요.",
    },
    [FiveElement.METAL]: {
      en: "Your ideal partner values clarity and integrity. They are decisive and principled. Look for someone who brings structure and refinement to your life.",
      ko: "이상적인 배우자는 명료함과 정직함을 중시합니다. 그들은 결단력 있고 원칙적입니다. 삶에 체계와 정제를 가져오는 사람을 찾으세요.",
    },
    [FiveElement.WATER]: {
      en: "Your ideal partner is wise and adaptable. They bring depth, intuition, and flexibility. Look for someone with intellectual depth and emotional intelligence.",
      ko: "이상적인 배우자는 지혜롭고 유연합니다. 그들은 깊이, 직관, 그리고 융통성을 가져옵니다. 지적 깊이와 감성 지능을 가진 사람을 찾으세요.",
    },
    [FiveElement.WOOD]: {
      en: "Your ideal partner is growth-oriented and benevolent. They bring expansion and new beginnings. Look for someone who is nurturing and optimistic.",
      ko: "이상적인 배우자는 성장 지향적이고 자비롭습니다. 그들은 확장과 새로운 시작을 가져옵니다. 양육적이고 낙관적인 사람을 찾으세요.",
    },
  };

  const spousePalaceNarrativeMap: Record<FiveElement, LocalizedString> = {
    [FiveElement.EARTH]: {
      en: "Your Spouse Palace is Earth: You value stability and loyalty above all in marriage. Your partner should be a steadfast anchor, providing a secure emotional foundation.",
      ko: "배우자궁이 토(土): 당신은 결혼에서 무엇보다 안정과 충성을 중시합니다. 배우자는 확고한 버팀목이 되어 안정적인 정서적 기반을 제공해야 합니다.",
    },
    [FiveElement.FIRE]: {
      en: "Your Spouse Palace is Fire: You crave passion and excitement in marriage. The relationship should be dynamic, with your partner being a source of warmth and inspiration.",
      ko: "배우자궁이 화(火): 당신은 결혼에서 열정과 설렘을 갈망합니다. 관계는 역동적이어야 하며, 배우자는 따뜻함과 영감의 원천이 되어야 합니다.",
    },
    [FiveElement.METAL]: {
      en: "Your Spouse Palace is Metal: You appreciate refinement and integrity in a partner. The relationship values clarity, fairness, and high standards.",
      ko: "배우자궁이 금(金): 당신은 배우자에게서 세련됨과 정직함을 높이 평가합니다. 관계는 명료함, 공정함, 그리고 높은 기준을 중시합니다.",
    },
    [FiveElement.WATER]: {
      en: "Your Spouse Palace is Water: You seek depth and adaptability. The ideal marriage is one of intellectual connection and emotional flow, adapting to life's currents together.",
      ko: "배우자궁이 수(水): 당신은 깊이와 적응력을 추구합니다. 이상적인 결혼은 지적 연결과 정서적 흐름으로, 삶의 흐름에 함께 적응하는 것입니다.",
    },
    [FiveElement.WOOD]: {
      en: "Your Spouse Palace (Day Branch) is Wood: You seek a partner who grows with you, bringing vitality and new beginnings into your life. The relationship thrives on mutual development.",
      ko: "배우자궁(일지)이 목(木): 당신은 함께 성장하며, 삶에 활력과 새로운 시작을 가져오는 배우자를 원합니다. 관계는 상호 발전으로 번성합니다.",
    },
  };

  return {
    favorableYears: favorableYears.slice(0, 3), // Top 3 years
    partnerElement,
    partnerNarrative: partnerNarrativeMap[partnerElement],
    spousePalaceAnalysis: spousePalaceNarrativeMap[spousePalaceElement],
  };
}

// ============================================================================
// COMPREHENSIVE SAJU READING - Aggregates all fortune readings
// ============================================================================

/**
 * Calculates the Noble Person (Gui-In) based on Day Master.
 * In Saju, Noble Persons are those who provide unexpected help and support.
 */
export function calculateNoblePerson(saju: SajuResult): NoblePerson {
  const dayMaster = saju.dayMaster;

  // Noble Person lookup table based on Day Master
  // This is a simplified version; full implementation would include Time Pillar
  const noblePersonMap: Partial<
    Record<HeavenlyStem, { direction: string; element: FiveElement }>
  > = {
    [HeavenlyStem.BYEONG]: { direction: "west", element: FiveElement.METAL },
    [HeavenlyStem.EUL]: { direction: "southwest", element: FiveElement.EARTH },
    [HeavenlyStem.GAP]: { direction: "southwest", element: FiveElement.EARTH },
    [HeavenlyStem.GI]: { direction: "north", element: FiveElement.WATER },
    [HeavenlyStem.GYE]: { direction: "south", element: FiveElement.FIRE },
    [HeavenlyStem.GYEONG]: {
      direction: "northeast",
      element: FiveElement.EARTH,
    },
    [HeavenlyStem.IM]: { direction: "south", element: FiveElement.FIRE },
    [HeavenlyStem.JEONG]: { direction: "west", element: FiveElement.METAL },
    [HeavenlyStem.MU]: { direction: "north", element: FiveElement.WATER },
    [HeavenlyStem.SIN]: { direction: "northeast", element: FiveElement.EARTH },
  };

  const data = noblePersonMap[dayMaster] || {
    direction: "center",
    element: FiveElement.EARTH,
  };

  const directionTranslations: Record<string, LocalizedString> = {
    center: { en: "Center", ko: "중앙" },
    north: { en: "North", ko: "북쪽" },
    northeast: { en: "Northeast", ko: "동북쪽" },
    south: { en: "South", ko: "남쪽" },
    southwest: { en: "Southwest", ko: "서남쪽" },
    west: { en: "West", ko: "서쪽" },
  };

  const narrativeMap: Record<FiveElement, LocalizedString> = {
    [FiveElement.EARTH]: {
      en: "Your noble persons are practical, grounded individuals. They bring stability and trust. Look for them in professions related to land, agriculture, or management.",
      ko: "당신의 귀인은 실용적이고 현실감 있는 사람들입니다. 그들은 안정과 신뢰를 가져옵니다. 토지, 농업, 또는 경영 관련 분야에서 찾으세요.",
    },
    [FiveElement.FIRE]: {
      en: "Your noble persons are passionate and charismatic. They inspire action and visibility. Look for them in creative industries, publicity, or leadership roles.",
      ko: "당신의 귀인은 열정적이고 카리스마 있는 사람들입니다. 그들은 행동과 가시성을 고취합니다. 창작 산업, 홍보, 또는 리더십 역할에서 찾으세요.",
    },
    [FiveElement.METAL]: {
      en: "Your noble persons are decisive and principled. They bring clarity and justice. Look for them in law, finance, or precision-based fields.",
      ko: "당신의 귀인은 결단력 있고 원칙적인 사람들입니다. 그들은 명료함과 정의를 가져옵니다. 법률, 금융, 또는 정밀 분야에서 찾으세요.",
    },
    [FiveElement.WATER]: {
      en: "Your noble persons are wise and adaptable. They bring deep insight and strategic thinking. Look for them in intelligence, research, or consultancy.",
      ko: "당신의 귀인은 지혜롭고 유연한 사람들입니다. 그들은 깊은 통찰력과 전략적 사고를 가져옵니다. 정보, 연구, 또는 컨설팅 분야에서 찾으세요.",
    },
    [FiveElement.WOOD]: {
      en: "Your noble persons are growth-oriented and benevolent. They bring expansion and opportunity. Look for them in education, healthcare, or social causes.",
      ko: "당신의 귀인은 성장 지향적이고 자비로운 사람들입니다. 그들은 확장과 기회를 가져옵니다. 교육, 의료, 또는 사회 운동 분야에서 찾으세요.",
    },
  };

  return {
    direction:
      directionTranslations[data.direction] || directionTranslations.center,
    element: data.element,
    narrative: narrativeMap[data.element],
  };
}

export function generateComprehensiveSajuReading(
  saju: SajuResult,
): ComprehensiveSajuReading {
  return {
    academic: calculateAcademicFortune(saju),
    career: calculateCareerFortune(saju),
    marriage: calculateMarriageFortune(saju),
    noblePerson: calculateNoblePerson(saju),
  };
}
