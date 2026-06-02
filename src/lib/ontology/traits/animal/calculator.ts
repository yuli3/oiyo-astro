import type { AnimalTestResult, AnimalType } from "./types";

export function calculateAnimalType(answers: AnimalType[]): AnimalTestResult {
  // Count occurrences of each animal
  const scores: Record<AnimalType, number> = {
    bear: 0,
    cat: 0,
    dog: 0,
    dolphin: 0,
    eagle: 0,
    fox: 0,
    lion: 0,
    owl: 0,
    panda: 0,
    rabbit: 0,
    tiger: 0,
    wolf: 0,
  };

  answers.forEach((animal) => {
    scores[animal] += 1;
  });

  // Sort by score
  const sortedAnimals = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .map(([animal]) => animal as AnimalType);

  const primaryAnimal = sortedAnimals[0];
  const secondaryAnimal = sortedAnimals[1];

  return {
    primaryAnimal,
    scores,
    secondaryAnimal,
  };
}

export function getCompatibilityScore(
  animal1: AnimalType,
  animal2: AnimalType,
): number {
  // Compatibility matrix
  const compatibilityMatrix: Record<AnimalType, Record<AnimalType, number>> = {
    bear: {
      bear: 80,
      cat: 65,
      dog: 75,
      dolphin: 80,
      eagle: 40,
      fox: 45,
      lion: 55,
      owl: 60,
      panda: 95,
      rabbit: 95,
      tiger: 60,
      wolf: 55,
    },
    cat: {
      bear: 65,
      cat: 70,
      dog: 90,
      dolphin: 65,
      eagle: 45,
      fox: 75,
      lion: 40,
      owl: 85,
      panda: 95,
      rabbit: 80,
      tiger: 55,
      wolf: 60,
    },
    dog: {
      bear: 75,
      cat: 90,
      dog: 80,
      dolphin: 85,
      eagle: 55,
      fox: 75,
      lion: 50,
      owl: 40,
      panda: 70,
      rabbit: 95,
      tiger: 60,
      wolf: 45,
    },
    dolphin: {
      bear: 80,
      cat: 65,
      dog: 85,
      dolphin: 80,
      eagle: 55,
      fox: 90,
      lion: 60,
      owl: 40,
      panda: 75,
      rabbit: 75,
      tiger: 65,
      wolf: 35,
    },
    eagle: {
      bear: 40,
      cat: 45,
      dog: 55,
      dolphin: 55,
      eagle: 75,
      fox: 65,
      lion: 95,
      owl: 85,
      panda: 45,
      rabbit: 50,
      tiger: 85,
      wolf: 85,
    },
    fox: {
      bear: 45,
      cat: 75,
      dog: 75,
      dolphin: 90,
      eagle: 65,
      fox: 70,
      lion: 70,
      owl: 95,
      panda: 55,
      rabbit: 65,
      tiger: 50,
      wolf: 85,
    },
    lion: {
      bear: 55,
      cat: 40,
      dog: 50,
      dolphin: 60,
      eagle: 95,
      fox: 70,
      lion: 75,
      owl: 65,
      panda: 55,
      rabbit: 45,
      tiger: 85,
      wolf: 80,
    },
    owl: {
      bear: 60,
      cat: 85,
      dog: 40,
      dolphin: 40,
      eagle: 85,
      fox: 95,
      lion: 65,
      owl: 75,
      panda: 65,
      rabbit: 65,
      tiger: 60,
      wolf: 95,
    },
    panda: {
      bear: 95,
      cat: 95,
      dog: 70,
      dolphin: 75,
      eagle: 45,
      fox: 55,
      lion: 55,
      owl: 65,
      panda: 80,
      rabbit: 85,
      tiger: 90,
      wolf: 50,
    },
    rabbit: {
      bear: 95,
      cat: 80,
      dog: 95,
      dolphin: 75,
      eagle: 50,
      fox: 65,
      lion: 45,
      owl: 65,
      panda: 85,
      rabbit: 70,
      tiger: 90,
      wolf: 40,
    },
    tiger: {
      bear: 60,
      cat: 55,
      dog: 60,
      dolphin: 65,
      eagle: 85,
      fox: 50,
      lion: 85,
      owl: 60,
      panda: 90,
      rabbit: 90,
      tiger: 75,
      wolf: 50,
    },
    wolf: {
      bear: 55,
      cat: 60,
      dog: 45,
      dolphin: 35,
      eagle: 85,
      fox: 85,
      lion: 80,
      owl: 95,
      panda: 50,
      rabbit: 40,
      tiger: 50,
      wolf: 70,
    },
  };

  return compatibilityMatrix[animal1][animal2];
}
