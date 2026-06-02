/**
 * Sharing Module Types
 * Comprehensive type definitions for social sharing features
 */

export interface InstagramTemplateOptions {
  backgroundColor?: string;
  includeQR?: boolean;
  resultDescription: string;
  resultEmoji: string;
  resultTitle: string;
  testName: string;
  userName?: string;
}

export interface KakaoShareData {
  buttonTitle?: string;
  description: string;
  imageUrl: string;
  link: {
    mobileWebUrl: string;
    webUrl: string;
  };
  title: string;
}

export interface QRCodeOptions {
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: "H" | "L" | "M" | "Q";
  margin?: number;
  size?: number;
}

export interface ShareAnalytics {
  locale: string;
  method: ShareMethod;
  platform?: SharePlatform;
  resultId: string;
  sessionId?: string;
  timestamp: Date;
  userId?: string;
}

export type ShareMethod =
  | "download"
  | "image"
  | "link"
  | "pdf"
  | "social"
  | "webshare";

export interface ShareOptions {
  customMessage?: string;
  includeQR?: boolean;
  locale?: string;
  method: ShareMethod;
  platform?: SharePlatform;
}

export type SharePlatform =
  | "copy"
  | "download"
  | "facebook"
  | "instagram"
  | "kakao"
  | "line"
  | "twitter"
  | "whatsapp";

export interface ShareResult {
  error?: string;
  method: ShareMethod;
  platform?: SharePlatform;
  shareToken?: string;
  success: boolean;
}
