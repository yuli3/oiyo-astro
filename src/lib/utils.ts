import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(
  date: Date | number | string,
  locale: string = "en",
) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}


/**
 * MDX 컴포넌트 props 안의 짧은 마크다운을 HTML 로 편다.
 * blog 에서 함께 옮겨 온 표·카드 컴포넌트들이 이 함수를 쓴다(2026-09-03 4단계).
 * 본문 파서를 거치지 않는 문자열이므로 HTML 이스케이프를 먼저 한다.
 */
export function inlineMd(text: string): string {
  if (!text) return "";
  return text
    // Escape HTML entities first
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // **bold**
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // *italic* (not preceded/followed by another *)
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>")
    // `code`
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // line breaks
    .replace(/\n/g, "<br>");
}
