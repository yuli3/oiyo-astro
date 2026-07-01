import { Type, type Static } from "@sinclair/typebox";

// --- Shared Types ---

export const ElementType = Type.Union([
  Type.Literal("WOOD"),
  Type.Literal("FIRE"),
  Type.Literal("EARTH"),
  Type.Literal("METAL"),
  Type.Literal("WATER"),
]);

export const SeasonType = Type.Union([
  Type.Literal("SPRING"),
  Type.Literal("SUMMER"),
  Type.Literal("AUTUMN"),
  Type.Literal("WINTER"),
]);

// --- Biography Schemas ---

export const BirthstoneSchema = Type.Object({
  colorHex: Type.String({ pattern: "^#[0-9A-Fa-f]{6}$" }),
  elementMapping: ElementType,
  id: Type.String(),
  meaning: Type.String(),
  month: Type.Number({ maximum: 12, minimum: 1 }),
  name: Type.String(),
});

export const BirthflowerSchema = Type.Object({
  elementMapping: ElementType,
  id: Type.String(),
  languageOfFlowers: Type.String(),
  month: Type.Number({ maximum: 12, minimum: 1 }),
  name: Type.String(),
  season: SeasonType,
});

export type Birthflower = Static<typeof BirthflowerSchema>;
export type Birthstone = Static<typeof BirthstoneSchema>;

// --- Lifestyle Schemas ---

export const HobbySchema = Type.Object({
  category: Type.Union([
    Type.Literal("CREATIVE"),
    Type.Literal("PHYSICAL"),
    Type.Literal("INTELLECTUAL"),
    Type.Literal("SOCIAL"),
    Type.Literal("NATURE"),
  ]),
  id: Type.String(),
  name: Type.String(),
  tags: Type.Object({
    elements: Type.Array(ElementType),
    mbti: Type.Optional(Type.Array(Type.String())),
    riasec: Type.Optional(Type.Array(Type.String())),
  }),
});

export type Hobby = Static<typeof HobbySchema>;
