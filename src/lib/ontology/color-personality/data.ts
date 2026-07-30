import type { ColorQuestion, ColorType } from "./types";

export const COLOR_QUESTIONS: ColorQuestion[] = [
  {
    id: "cp_1",
    options: [
      { id: "a", weights: { blue: 3, gray: 1 } },
      { id: "b", weights: { red: 3, yellow: 1 } },
      { id: "c", weights: { brown: 1, green: 3 } },
    ],
  },
  {
    id: "cp_2",
    options: [
      { id: "a", weights: { blue: 1, gray: 3 } },
      { id: "b", weights: { black: 1, red: 3 } },
      { id: "c", weights: { violet: 1, yellow: 3 } },
    ],
  },
  {
    id: "cp_3",
    options: [
      { id: "a", weights: { blue: 3 } },
      { id: "b", weights: { red: 3 } },
      { id: "c", weights: { yellow: 3 } },
    ],
  },
  {
    id: "cp_4",
    options: [
      { id: "a", weights: { blue: 2, green: 2 } },
      { id: "b", weights: { red: 2, violet: 2 } },
      { id: "c", weights: { black: 1, violet: 3 } },
    ],
  },
  {
    id: "cp_5",
    options: [
      { id: "a", weights: { blue: 1, gray: 3 } },
      { id: "b", weights: { brown: 3 } },
      { id: "c", weights: { red: 2, yellow: 2 } },
    ],
  },
  {
    id: "cp_6",
    options: [
      { id: "a", weights: { blue: 2, green: 2 } },
      { id: "b", weights: { black: 3, red: 1 } },
      { id: "c", weights: { yellow: 3 } },
    ],
  },
  {
    id: "cp_7",
    options: [
      { id: "a", weights: { black: 2, gray: 2 } },
      { id: "b", weights: { yellow: 3 } },
      { id: "c", weights: { blue: 2, green: 2 } },
    ],
  },
  {
    id: "cp_8",
    options: [
      { id: "a", weights: { blue: 3 } },
      { id: "b", weights: { violet: 2, yellow: 2 } },
      { id: "c", weights: { red: 3 } },
    ],
  },
  {
    id: "cp_9",
    options: [
      { id: "a", weights: { blue: 3, gray: 1 } },
      { id: "b", weights: { red: 2, yellow: 2 } },
      { id: "c", weights: { green: 3 } },
    ],
  },
  {
    id: "cp_10",
    options: [
      { id: "a", weights: { blue: 1, brown: 3 } },
      { id: "b", weights: { yellow: 3 } },
      { id: "c", weights: { red: 3 } },
    ],
  },
  {
    id: "cp_11",
    options: [
      { id: "a", weights: { blue: 3, gray: 1 } },
      { id: "b", weights: { violet: 3 } },
      { id: "c", weights: { brown: 2, red: 1 } },
    ],
  },
  {
    id: "cp_12",
    options: [
      { id: "a", weights: { blue: 1, green: 3 } },
      { id: "b", weights: { red: 3 } },
      { id: "c", weights: { violet: 1, yellow: 3 } },
    ],
  },
];

// No need for COLOR_RESULTS with text anymore, as text is in i18n
