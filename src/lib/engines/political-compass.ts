export const POLITICAL_STEP_KEYS = [
  ["s1_1", "s1_2", "s1_3", "s1_4", "s1_5", "s1_6", "s1_7", "s1_8", "s1_9", "s1_10"],
  ["s2_1", "s2_2", "s2_3", "s2_4", "s2_5", "s2_6", "s2_7", "s2_8", "s2_9"],
  ["s3_1", "s3_2", "s3_3", "s3_4", "s3_5", "s3_6", "s3_7", "s3_8", "s3_9", "s3_10", "s3_11"],
  ["s4_1", "s4_2", "s4_3", "s4_4", "s4_5", "s4_6", "s4_7", "s4_8", "s4_9", "s4_10", "s4_11"],
] as const;

export const POLITICAL_REVERSED_ITEMS = new Set([
  "s1_3", "s1_5", "s1_8", "s1_9", "s1_10",
  "s2_4", "s2_6", "s2_7", "s2_9",
  "s3_6", "s3_7", "s3_8", "s3_9", "s3_10",
  "s4_1", "s4_2", "s4_3", "s4_4",
]);

const LOW_CODES = ["E", "T", "N", "A"] as const;
const HIGH_CODES = ["M", "P", "G", "L"] as const;

export type PoliticalAnswers = Record<string, string>;

export function scorePoliticalCompass(answers: PoliticalAnswers): string {
  return POLITICAL_STEP_KEYS.map((keys, axis) => {
    const values = keys.map((key) => {
      const raw = Number(answers[key]);
      if (!Number.isInteger(raw) || raw < 1 || raw > 3) {
        throw new Error(`Missing or invalid political response: ${key}`);
      }
      return POLITICAL_REVERSED_ITEMS.has(key) ? 4 - raw : raw;
    });
    const sum = values.reduce((total, value) => total + value, 0);
    const midpoint = keys.length * 2;
    if (sum === midpoint) return "?";
    return sum > midpoint ? HIGH_CODES[axis] : LOW_CODES[axis];
  }).join("");
}
