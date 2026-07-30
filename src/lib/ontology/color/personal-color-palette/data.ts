/* eslint-disable no-restricted-syntax */
import type {
  ColorPalette,
  FontRecommendation,
  ImageMood,
  Question,
  ToneType,
} from "./types";

export const questions: Question[] = [
  {
    category: "Skin Tone",
    id: 1,
    options: [
      { emoji: "🌸", points: 3, season: "spring", text: "questions.q1.a" },
      { emoji: "☀️", points: 3, season: "summer", text: "questions.q1.b" },
      { emoji: "🍂", points: 3, season: "autumn", text: "questions.q1.c" },
      { emoji: "❄️", points: 3, season: "winter", text: "questions.q1.d" },
    ],
    text: "questions.q1.text",
  },
  {
    category: "Hair Color",
    id: 2,
    options: [
      { emoji: "🌼", points: 2, season: "spring", text: "questions.q2.a" },
      { emoji: "🌿", points: 2, season: "summer", text: "questions.q2.b" },
      { emoji: "🍁", points: 2, season: "autumn", text: "questions.q2.c" },
      { emoji: "🖤", points: 2, season: "winter", text: "questions.q2.d" },
    ],
    text: "questions.q2.text",
  },
  {
    category: "Eye Color",
    id: 3,
    options: [
      { emoji: "✨", points: 2, season: "spring", text: "questions.q3.a" },
      { emoji: "💙", points: 2, season: "summer", text: "questions.q3.b" },
      { emoji: "🟤", points: 2, season: "autumn", text: "questions.q3.c" },
      { emoji: "⚫", points: 2, season: "winter", text: "questions.q3.d" },
    ],
    text: "questions.q3.text",
  },
  {
    category: "Best Colors",
    id: 4,
    options: [
      { emoji: "🌈", points: 3, season: "spring", text: "questions.q4.a" },
      { emoji: "💜", points: 3, season: "summer", text: "questions.q4.b" },
      { emoji: "🧡", points: 3, season: "autumn", text: "questions.q4.c" },
      { emoji: "🔴", points: 3, season: "winter", text: "questions.q4.d" },
    ],
    text: "questions.q4.text",
  },
  {
    category: "Metal Preference",
    id: 5,
    options: [
      { emoji: "🥇", points: 2, season: "spring", text: "questions.q5.a" },
      { emoji: "🥈", points: 2, season: "summer", text: "questions.q5.b" },
      { emoji: "🟡", points: 2, season: "autumn", text: "questions.q5.c" },
      { emoji: "⚪", points: 2, season: "winter", text: "questions.q5.d" },
    ],
    text: "questions.q5.text",
  },
  {
    category: "Mood Preference",
    id: 6,
    options: [
      { emoji: "🌟", points: 2, season: "spring", text: "questions.q6.a" },
      { emoji: "🌊", points: 2, season: "summer", text: "questions.q6.b" },
      { emoji: "🌾", points: 2, season: "autumn", text: "questions.q6.c" },
      { emoji: "🌌", points: 2, season: "winter", text: "questions.q6.d" },
    ],
    text: "questions.q6.text",
  },
  {
    category: "Style Preference",
    id: 7,
    options: [
      { emoji: "🎀", points: 2, season: "spring", text: "questions.q7.a" },
      { emoji: "🦋", points: 2, season: "summer", text: "questions.q7.b" },
      { emoji: "🍄", points: 2, season: "autumn", text: "questions.q7.c" },
      { emoji: "💎", points: 2, season: "winter", text: "questions.q7.d" },
    ],
    text: "questions.q7.text",
  },
  {
    category: "Vibe Check",
    id: 8,
    options: [
      { emoji: "🌻", points: 2, season: "spring", text: "questions.q8.a" },
      { emoji: "🌸", points: 2, season: "summer", text: "questions.q8.b" },
      { emoji: "🍂", points: 2, season: "autumn", text: "questions.q8.c" },
      { emoji: "❄️", points: 2, season: "winter", text: "questions.q8.d" },
    ],
    text: "questions.q8.text",
  },
];

// Color Palette Definitions
export const colorPalettes: Record<ToneType, ColorPalette> = {
  "bright-spring": {
    accent: "Turquoise",
    hex: { accent: "#4ECDC4", primary: "#FF6B6B", secondary: "#FFD93D" },
    primary: "Coral Pink",
    secondary: "Bright Yellow",
  },
  "bright-winter": {
    accent: "Hot Pink",
    hex: { accent: "#FF69B4", primary: "#4169E1", secondary: "#FFFFFF" },
    primary: "Royal Blue",
    secondary: "Pure White",
  },
  "cool-summer": {
    accent: "Slate Blue",
    hex: { accent: "#6A7B9E", primary: "#D8A7A7", secondary: "#A8ABAD" },
    primary: "Dusty Rose",
    secondary: "Cool Gray",
  },
  "cool-winter": {
    accent: "Pure Black",
    hex: { accent: "#000000", primary: "#000080", secondary: "#E0FFFF" },
    primary: "Navy Blue",
    secondary: "Icy Blue",
  },
  "light-summer": {
    accent: "Rose Pink",
    hex: { accent: "#FFB6C1", primary: "#C8A2C8", secondary: "#B0C4DE" },
    primary: "Lavender",
    secondary: "Soft Blue",
  },
  "soft-autumn": {
    accent: "Mustard",
    hex: { accent: "#E1B42F", primary: "#C85C4A", secondary: "#9CA777" },
    primary: "Terracotta",
    secondary: "Olive Green",
  },
  "warm-autumn": {
    accent: "Deep Gold",
    hex: { accent: "#B8860B", primary: "#CC5500", secondary: "#8B4513" },
    primary: "Burnt Orange",
    secondary: "Warm Brown",
  },
  "warm-spring": {
    accent: "Golden Yellow",
    hex: { accent: "#FFD700", primary: "#FFB88C", secondary: "#F8E9D1" },
    primary: "Peach",
    secondary: "Warm Beige",
  },
};

// Font Recommendations
export const fontRecommendations: Record<ToneType, FontRecommendation> = {
  "bright-spring": {
    accent: "Pacifico",
    body: "Open Sans",
    description: "fonts.bright_spring",
    display: "Quicksand",
  },
  "bright-winter": {
    accent: "Allura",
    body: "Roboto",
    description: "fonts.bright_winter",
    display: "Montserrat",
  },
  "cool-summer": {
    accent: "Tangerine",
    body: "Merriweather",
    description: "fonts.cool_summer",
    display: "Raleway",
  },
  "cool-winter": {
    accent: "Great Vibes",
    body: "PT Sans",
    description: "fonts.cool_winter",
    display: "Oswald",
  },
  "light-summer": {
    accent: "Satisfy",
    body: "Georgia",
    description: "fonts.light_summer",
    display: "Playfair Display",
  },
  "soft-autumn": {
    accent: "Yellowtail",
    body: "Crimson Text",
    description: "fonts.soft_autumn",
    display: "Libre Baskerville",
  },
  "warm-autumn": {
    accent: "Kaushan Script",
    body: "Source Serif Pro",
    description: "fonts.warm_autumn",
    display: "Roboto Slab",
  },
  "warm-spring": {
    accent: "Dancing Script",
    body: "Lato",
    description: "fonts.warm_spring",
    display: "Poppins",
  },
};

// Image Mood Recommendations
export const imageMoods: Record<ToneType, ImageMood> = {
  "bright-spring": {
    atmosphere: "moods.bright_spring",
    keywords: ["bright", "cheerful", "energetic", "playful", "colorful"],
    style: "Fresh & Vibrant",
  },
  "bright-winter": {
    atmosphere: "moods.bright_winter",
    keywords: ["striking", "vivid", "confident", "modern", "dynamic"],
    style: "Bold & Dramatic",
  },
  "cool-summer": {
    atmosphere: "moods.cool_summer",
    keywords: ["serene", "refined", "classic", "muted", "graceful"],
    style: "Calm & Sophisticated",
  },
  "cool-winter": {
    atmosphere: "moods.cool_winter",
    keywords: ["minimalist", "sharp", "sophisticated", "powerful", "clean"],
    style: "Sleek & Elegant",
  },
  "light-summer": {
    atmosphere: "moods.light_summer",
    keywords: ["pastel", "dreamy", "gentle", "elegant", "delicate"],
    style: "Soft & Romantic",
  },
  "soft-autumn": {
    atmosphere: "moods.soft_autumn",
    keywords: ["organic", "warm", "grounded", "rustic", "harmonious"],
    style: "Earthy & Natural",
  },
  "warm-autumn": {
    atmosphere: "moods.warm_autumn",
    keywords: ["luxurious", "deep", "warm", "comfortable", "abundant"],
    style: "Rich & Inviting",
  },
  "warm-spring": {
    atmosphere: "moods.warm_spring",
    keywords: ["sunny", "welcoming", "cozy", "optimistic", "natural"],
    style: "Warm & Friendly",
  },
};
