import {
  LETTER_TO_NUMBER,
  NUMEROLOGY_MEANINGS,
  PERSONAL_YEAR_MEANINGS,
  VOWELS,
} from "./data";
import type { NumerologyInput, NumerologyReading } from "./types";

export function calculateLifePathNumber(date: Date): number {
  const day = reduceToSingleDigit(date.getDate(), true);
  const month = reduceToSingleDigit(date.getMonth() + 1, true);
  const year = reduceToSingleDigit(date.getFullYear(), true);
  return reduceToSingleDigit(day + month + year, true);
}

export function calculateNumerology(input: NumerologyInput): NumerologyReading {
  const { birthDate, fullName } = input;
  const lifePath = calculateLifePathNumber(birthDate);
  // Three of the numbers come from the name, and the Pythagorean table only
  // covers A-Z. A name with none of those letters has no expression, soul
  // urge or personality number to give, so we return null rather than the 0
  // these functions used to produce — 0 has no meaning entry, and callers
  // ended up rendering a blank or silently dropping the card.
  //
  // We do not romanise automatically. Korean alone has competing systems
  // (Revised Romanization vs. whatever is on a passport), and choosing one
  // silently would return a confidently wrong number instead of nothing.
  const hasLatinLetters = latinLetters(fullName).length > 0;
  const expression = hasLatinLetters ? calculateExpressionNumber(fullName) : null;
  const soulUrge = hasLatinLetters ? calculateSoulUrgeNumber(fullName) : null;
  const personality = hasLatinLetters ? calculatePersonalityNumber(fullName) : null;
  const birthday = birthDate.getDate();
  const personalYear = calculatePersonalYearNumber(birthDate);

  const getMeaning = (num: number) => {
    return (
      NUMEROLOGY_MEANINGS[num] ||
      NUMEROLOGY_MEANINGS[reduceToSingleDigit(num, false)]
    );
  };
  // Kept separate so lifePath and birthday — which always exist — do not
  // inherit the null the name-derived numbers can carry.
  const getMeaningOrNull = (num: null | number) =>
    num === null ? null : getMeaning(num);

  const lpMeaning = getMeaning(lifePath);

  return {
    birthDate: birthDate.toISOString(),
    birthdayNumber: birthday,
    expression,
    // Persistence fields
    lifePath,
    meanings: {
      birthdayMeaning: getMeaning(birthday),
      expressionMeaning: getMeaningOrNull(expression),
      lifePathMeaning: lpMeaning,
      personalityMeaning: getMeaningOrNull(personality),
      personalYearMeaning:
        PERSONAL_YEAR_MEANINGS[personalYear] ||
        PERSONAL_YEAR_MEANINGS[reduceToSingleDigit(personalYear)],
      soulUrgeMeaning: getMeaningOrNull(soulUrge),
    },
    // Detailed analysis
    numbers: {
      birthdayNumber: birthday,
      expressionNumber: expression,
      lifePathNumber: lifePath,
      personalityNumber: personality,
      personalYearNumber: personalYear,
      soulUrgeNumber: soulUrge,
    },
    overallAnalysis: {
      dominantNumbers: [lifePath, expression].filter(
        (n): n is number => n !== null && n > 0,
      ),
      lifeTheme: lpMeaning.name,
      personalYear: {
        description: PERSONAL_YEAR_MEANINGS[personalYear]?.description || {
          en: "",
          ko: "",
        },
        number: personalYear,
        theme: PERSONAL_YEAR_MEANINGS[personalYear]?.theme || {
          en: "",
          ko: "",
        },
      },
      recommendations: lpMeaning.description,
      vibrationalResonance: {
        description: {
          en: "Your existence is aligned with the divine geometric frequencies of the universe.",
          ko: "당신의 존재는 우주의 신성한 기하학적 주파수와 정렬되어 있습니다.",
        },
        frequency: lifePath * 111.1,
      },
    },

    personality,
    soulUrge,
    userName: fullName,
  };
}

/** The letters the Pythagorean table can actually map, uppercased. */
function latinLetters(name: string): string {
  return name.toUpperCase().replace(/[^A-Z]/g, "");
}

function calculateExpressionNumber(name: string): number {
  const total = latinLetters(name)
    .split("")
    .reduce((sum, char) => sum + (LETTER_TO_NUMBER[char] || 0), 0);
  return reduceToSingleDigit(total, true);
}

function calculatePersonalityNumber(name: string): number {
  const total = latinLetters(name)
    .split("")
    .filter((char) => !VOWELS.includes(char))
    .reduce((sum, char) => sum + (LETTER_TO_NUMBER[char] || 0), 0);
  return reduceToSingleDigit(total, true);
}

function calculatePersonalYearNumber(birthDate: Date): number {
  const day = birthDate.getDate();
  const month = birthDate.getMonth() + 1;
  const year = new Date().getFullYear();
  const total = day + month + year;
  return reduceToSingleDigit(total);
}

function calculateSoulUrgeNumber(name: string): number {
  const total = latinLetters(name)
    .split("")
    .filter((char) => VOWELS.includes(char))
    .reduce((sum, char) => sum + (LETTER_TO_NUMBER[char] || 0), 0);
  return reduceToSingleDigit(total, true);
}

function reduceToSingleDigit(num: number, allowMaster: boolean = true): number {
  let current = num;
  while (current > 9) {
    if (allowMaster && (current === 11 || current === 22 || current === 33)) {
      return current;
    }
    current = current
      .toString()
      .split("")
      .reduce((sum, digit) => sum + parseInt(digit, 10), 0);
  }
  return current;
}
