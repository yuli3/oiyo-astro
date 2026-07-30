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
  const expression = calculateExpressionNumber(fullName);
  const soulUrge = calculateSoulUrgeNumber(fullName);
  const personality = calculatePersonalityNumber(fullName);
  const birthday = birthDate.getDate();
  const personalYear = calculatePersonalYearNumber(birthDate);

  const getMeaning = (num: number) => {
    return (
      NUMEROLOGY_MEANINGS[num] ||
      NUMEROLOGY_MEANINGS[reduceToSingleDigit(num, false)]
    );
  };

  const lpMeaning = getMeaning(lifePath);

  return {
    birthDate: birthDate.toISOString(),
    birthdayNumber: birthday,
    expression,
    // Persistence fields
    lifePath,
    meanings: {
      birthdayMeaning: getMeaning(birthday),
      expressionMeaning: getMeaning(expression),
      lifePathMeaning: lpMeaning,
      personalityMeaning: getMeaning(personality),
      personalYearMeaning:
        PERSONAL_YEAR_MEANINGS[personalYear] ||
        PERSONAL_YEAR_MEANINGS[reduceToSingleDigit(personalYear)],
      soulUrgeMeaning: getMeaning(soulUrge),
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
      dominantNumbers: [lifePath, expression].filter((n) => n > 0),
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

function calculateExpressionNumber(name: string): number {
  const total = name
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .split("")
    .reduce((sum, char) => sum + (LETTER_TO_NUMBER[char] || 0), 0);
  return reduceToSingleDigit(total, true);
}

function calculatePersonalityNumber(name: string): number {
  const total = name
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
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
  const total = name
    .toUpperCase()
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
