export interface ColorPersonalityResult {
  primaryColor: ColorType;
  secondaryColor: ColorType;
  // We remove text fields. UI will derive them from keys.
  // For backward compat or ease, we could methods to get keys? No, just IDs.
}

export interface ColorQuestion {
  id: string; // Used for translation key: colorPersonality.questions.{id}.text
  options: {
    id: string; // Used for translation key: colorPersonality.questions.{id}.options.{id}
    weights: Partial<Record<ColorType, number>>;
  }[];
}

export type ColorType =
  | "black"
  | "blue"
  | "brown"
  | "gray"
  | "green"
  | "red"
  | "violet"
  | "yellow";
