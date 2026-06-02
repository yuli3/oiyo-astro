/**
 * Kakao Share Integration
 * Provides rich Kakao Talk sharing with custom templates
 */

import type { KakaoShareData } from "./types";

// Declare Kakao SDK types
declare global {
  interface Window {
    Kakao: {
      init: (appKey: string) => void;
      isInitialized: () => boolean;
      Share: {
        sendCustom: (options: KakaoCustomShareOptions) => void;
        sendDefault: (options: KakaoShareOptions) => void;
      };
    };
  }
}

interface KakaoCustomShareOptions {
  templateArgs: Record<string, string>;
  templateId: number;
}

interface KakaoShareOptions {
  buttons?: Array<{
    link: {
      mobileWebUrl: string;
      webUrl: string;
    };
    title: string;
  }>;
  content: {
    description: string;
    imageUrl: string;
    link: {
      mobileWebUrl: string;
      webUrl: string;
    };
    title: string;
  };
  objectType: "commerce" | "feed" | "list" | "location" | "text";
}

/**
 * Initialize Kakao SDK
 */
export function initKakaoSDK(): boolean {
  const appKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;

  if (!appKey) {
    console.warn("Kakao app key not configured");
    return false;
  }

  if (typeof window === "undefined") {
    return false;
  }

  if (!window.Kakao) {
    console.warn("Kakao SDK not loaded");
    return false;
  }

  if (!window.Kakao.isInitialized()) {
    window.Kakao.init(appKey);
  }

  return window.Kakao.isInitialized();
}

/**
 * Check if Kakao SDK is available
 */
export function isKakaoAvailable(): boolean {
  return typeof window !== "undefined" && !!window.Kakao;
}

/**
 * Load Kakao SDK dynamically
 */
export function loadKakaoSDK(): Promise<boolean> {
  return new Promise((resolve) => {
    if (isKakaoAvailable()) {
      resolve(initKakaoSDK());
      return;
    }

    const script = document.createElement("script");
    script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";
    script.integrity =
      "sha384-DKYJZ8NLiK8MN4/C5P2dtSmLQ4KwPaoqAfyA/DfmEc1VDxu4yyC7wy6K1Hs90nka";
    script.crossOrigin = "anonymous";
    script.async = true;

    script.onload = () => {
      resolve(initKakaoSDK());
    };

    script.onerror = () => {
      console.error("Failed to load Kakao SDK");
      resolve(false);
    };

    document.head.appendChild(script);
  });
}

/**
 * Share personality test result with rich preview
 */
export async function sharePersonalityResult({
  imageUrl,
  locale = "ko",
  resultDescription,
  resultEmoji,
  resultTitle,
  shareUrl,
  testName,
}: {
  imageUrl: string;
  locale?: string;
  resultDescription: string;
  resultEmoji: string;
  resultTitle: string;
  shareUrl: string;
  testName: string;
}): Promise<boolean> {
  const messages = {
    en: {
      button: "Take the test",
      description: `${testName} Result: ${resultDescription}`,
      title: `${resultEmoji} ${resultTitle}`,
    },
    ko: {
      button: "나도 테스트하기",
      description: `${testName} 결과: ${resultDescription}`,
      title: `${resultEmoji} ${resultTitle}`,
    },
  };

  const msg = messages[locale as keyof typeof messages] || messages.ko;

  return shareViaKakao({
    buttonTitle: msg.button,
    description: msg.description,
    imageUrl,
    link: {
      mobileWebUrl: shareUrl,
      webUrl: shareUrl,
    },
    title: msg.title,
  });
}

/**
 * Share test result via Kakao Talk
 */
export async function shareViaKakao(data: KakaoShareData): Promise<boolean> {
  try {
    if (!initKakaoSDK()) {
      throw new Error("Kakao SDK not initialized");
    }

    const shareOptions: KakaoShareOptions = {
      buttons: [
        {
          link: {
            mobileWebUrl: data.link.mobileWebUrl,
            webUrl: data.link.webUrl,
          },
          title: data.buttonTitle || "나도 테스트하기",
        },
      ],
      content: {
        description: data.description,
        imageUrl: data.imageUrl,
        link: {
          mobileWebUrl: data.link.mobileWebUrl,
          webUrl: data.link.webUrl,
        },
        title: data.title,
      },
      objectType: "feed",
    };

    window.Kakao.Share.sendDefault(shareOptions);
    return true;
  } catch (error) {
    console.error("Kakao share failed:", error);
    return false;
  }
}
