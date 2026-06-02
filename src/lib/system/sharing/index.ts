/**
 * Sharing Module Main Export
 * Centralized exports for all sharing functionality
 */

// Instagram Templates
export {
  downloadInstagramStory,
  generateInstagramHTML,
  generateInstagramStory,
  generateInstagramStoryWithQR,
  INSTAGRAM_STORY_DIMENSIONS,
} from "./instagram-template";

// Kakao Share
export {
  initKakaoSDK,
  isKakaoAvailable,
  loadKakaoSDK,
  sharePersonalityResult,
  shareViaKakao,
} from "./kakao-share";

// QR Code Generation
export {
  generateBrandedQRCode,
  generateEmbeddedQRCode,
  generateInstagramQRCode,
  generateQRCode,
  generateThemedQRCode,
  validateQRUrl,
} from "./qr-generator";

// Analytics
export {
  getShareStatistics,
  getTrendingShareMethods,
  getUserShareCount,
  trackShareEvent,
  trackViralFeature,
} from "./share-analytics";

// Types
export type {
  InstagramTemplateOptions,
  KakaoShareData,
  QRCodeOptions,
  ShareAnalytics,
  ShareMethod,
  ShareOptions,
  SharePlatform,
  ShareResult,
} from "./types";

// Viral Features
export {
  compareResults,
  createComparisonInvite,
  generateComparisonImage,
  generateFriendCode,
  getComparisonByCode,
  getPopularComparisons,
} from "./viral-features";
export type { ComparisonData, ComparisonResult } from "./viral-features";
