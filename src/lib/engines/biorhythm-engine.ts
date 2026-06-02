export interface BiorhythmAnalysis {
  isPositive: boolean;
  level: "critical" | "high" | "low" | "medium";
  phase: "negative" | "positive";
  strength: number;
  value: number;
}

export interface BiorhythmData {
  date: Date;
  emotional: number;
  intellectual: number;
  physical: number;
}

export interface BiorhythmResults {
  criticalDays: {
    date: Date;
    isZeroCrossing: boolean;
    type: "emotional" | "intellectual" | "physical";
  }[];
  forecast: BiorhythmData[];
  today: BiorhythmData;
}

/**
 * Calculates Biorhythm cycles for a given birth date and target date.
 * Cycles: Physical (23d), Emotional (28d), Intellectual (33d)
 */
export function calculateBiorhythm(
  birthDate: Date,
  targetDate: Date,
): BiorhythmData {
  const daysSinceBirth = Math.floor(
    (targetDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  // Biorhythm cycles (in days)
  const PHYSICAL_CYCLE = 23;
  const EMOTIONAL_CYCLE = 28;
  const INTELLECTUAL_CYCLE = 33;

  // Calculate biorhythm values (-100 to +100)
  const physical = Math.round(
    Math.sin((2 * Math.PI * daysSinceBirth) / PHYSICAL_CYCLE) * 100,
  );
  const emotional = Math.round(
    Math.sin((2 * Math.PI * daysSinceBirth) / EMOTIONAL_CYCLE) * 100,
  );
  const intellectual = Math.round(
    Math.sin((2 * Math.PI * daysSinceBirth) / INTELLECTUAL_CYCLE) * 100,
  );

  return {
    date: new Date(targetDate),
    emotional,
    intellectual,
    physical,
  };
}

/**
 * Calculates a range of biorhythm values for visualization.
 */
export function calculateBiorhythmRange(
  birthDate: Date,
  startDate: Date,
  endDate: Date,
): BiorhythmData[] {
  const results: BiorhythmData[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    results.push(calculateBiorhythm(birthDate, new Date(current)));
    current.setDate(current.getDate() + 1);
  }

  return results;
}

/**
 * Generates biorhythm forecast for a given range of days.
 */
export function generateBiorhythmForecast(
  birthDate: Date,
  days: number = 30,
): BiorhythmResults {
  const today = new Date();
  const todayData = calculateBiorhythm(birthDate, today);

  const forecast: BiorhythmData[] = [];
  const criticalDays: BiorhythmResults["criticalDays"] = [];

  // Generate forecast for next 'days' days
  for (let i = 0; i <= days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const data = calculateBiorhythm(birthDate, date);
    forecast.push(data);

    // Find critical days (zero crossings and peaks/valleys)
    if (i > 0) {
      const prevData = forecast[i - 1];

      // Check for zero crossings
      if (
        (prevData.physical > 0 && data.physical <= 0) ||
        (prevData.physical < 0 && data.physical >= 0)
      ) {
        criticalDays.push({
          date: new Date(date),
          isZeroCrossing: true,
          type: "physical",
        });
      }
      if (
        (prevData.emotional > 0 && data.emotional <= 0) ||
        (prevData.emotional < 0 && data.emotional >= 0)
      ) {
        criticalDays.push({
          date: new Date(date),
          isZeroCrossing: true,
          type: "emotional",
        });
      }
      if (
        (prevData.intellectual > 0 && data.intellectual <= 0) ||
        (prevData.intellectual < 0 && data.intellectual >= 0)
      ) {
        criticalDays.push({
          date: new Date(date),
          isZeroCrossing: true,
          type: "intellectual",
        });
      }

      // Check for peaks (value > 90) and valleys (value < -90)
      if (Math.abs(data.physical) > 90) {
        criticalDays.push({
          date: new Date(date),
          isZeroCrossing: false,
          type: "physical",
        });
      }
      if (Math.abs(data.emotional) > 90) {
        criticalDays.push({
          date: new Date(date),
          isZeroCrossing: false,
          type: "emotional",
        });
      }
      if (Math.abs(data.intellectual) > 90) {
        criticalDays.push({
          date: new Date(date),
          isZeroCrossing: false,
          type: "intellectual",
        });
      }
    }
  }

  return {
    criticalDays,
    forecast,
    today: todayData,
  };
}

export function getBiorhythmAdvice(
  type: "emotional" | "intellectual" | "physical",
  value: number,
) {
  const interpretation = getBiorhythmInterpretation(value);
  const { isPositive, level } = interpretation;

  // Simple advice logic that can be translated in the component
  return {
    isPositive,
    key: `${type}.${level}.${isPositive ? "positive" : "negative"}`,
    level,
  };
}

export function getBiorhythmInterpretation(value: number): BiorhythmAnalysis {
  const strength = Math.abs(value);
  const isPositive = value > 0;

  let level: "critical" | "high" | "low" | "medium";
  if (strength < 25) level = "low";
  else if (strength < 75) level = "medium";
  else if (strength < 90) level = "high";
  else level = "critical";

  return {
    isPositive,
    level,
    phase: isPositive ? "positive" : "negative",
    strength,
    value,
  };
}
