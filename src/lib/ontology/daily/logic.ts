/* eslint-disable no-restricted-syntax */
import { format } from "date-fns";

export interface LuckyFactors {
  color: { code: string; hex: string };
  item: { code: string; icon: string };
  keyword: { code: string };
}

export const DAILY_ZODIACS = [
  { date: "3/21-4/19", icon: "♈", id: "aries" },
  { date: "4/20-5/20", icon: "♉", id: "taurus" },
  { date: "5/21-6/21", icon: "♊", id: "gemini" },
  { date: "6/22-7/22", icon: "♋", id: "cancer" },
  { date: "7/23-8/22", icon: "♌", id: "leo" },
  { date: "8/23-9/22", icon: "♍", id: "virgo" },
  { date: "9/23-10/23", icon: "♎", id: "libra" },
  { date: "10/24-11/21", icon: "♏", id: "scorpio" },
  { date: "11/22-12/21", icon: "♐", id: "sagittarius" },
  { date: "12/22-1/19", icon: "♑", id: "capricorn" },
  { date: "1/20-2/18", icon: "♒", id: "aquarius" },
  { date: "2/19-3/20", icon: "♓", id: "pisces" },
];

const ITEMS = [
  { code: "clover", icon: "🍀" },
  { code: "diamond", icon: "💎" },
  { code: "star", icon: "🌟" },
  { code: "target", icon: "🎯" },
  { code: "key", icon: "🗝️" },
  { code: "phone", icon: "📱" },
  { code: "coffee", icon: "☕" },
  { code: "book", icon: "📚" },
];

const COLORS = [
  { code: "red", hex: "#FF6B6B" },
  { code: "navy", hex: "#4ECDC4" },
  { code: "gold", hex: "#FFE66D" },
  { code: "green", hex: "#A8E6CF" },
  { code: "pink", hex: "#D4A5A5" },
  { code: "amber", hex: "#9B59B6" },
];

const KEYWORDS = [
  { code: "courage" },
  { code: "patience" },
  { code: "wisdom" },
  { code: "harmony" },
  { code: "focus" },
  { code: "rest" },
];

export function calculateDailyDestiny(
  date: string,
  zodiacId: string,
): LuckyFactors {
  const hashString = date + zodiacId;
  let hash = 0;
  for (let i = 0; i < hashString.length; i++) {
    hash = (hash << 5) - hash + hashString.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  const absHash = Math.abs(hash);

  return {
    color: COLORS[absHash % COLORS.length],
    item: ITEMS[absHash % ITEMS.length],
    keyword: KEYWORDS[absHash % KEYWORDS.length],
  };
}

export function getTodayString() {
  return format(new Date(), "yyyy-MM-dd");
}
