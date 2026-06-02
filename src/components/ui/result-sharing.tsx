/* eslint-disable no-restricted-syntax */
"use client";

import html2canvas from "html2canvas";
import {
  Camera,
  Check,
  Copy,
  Download,
  Instagram,
  MessageCircle,
  Share2,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ResultSharingProps {
  className?: string;
  customContent?: React.ReactNode;
  description: string;
  emoji: string;
  locale: string;
  resultType: string;
  shareUrl?: string;
  testName: string;
  title: string;
}

export function ResultSharing({
  className = "",
  customContent,
  description,
  emoji,
  locale,
  resultType,
  shareUrl,
  testName,
  title,
}: ResultSharingProps) {
  const tUi = useTranslations("ui");
  const [copied, setCopied] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const shareText =
    locale === "ko"
      ? `내 ${testName} 결과: ${resultType}! ${description} 🎯 당신도 테스트해보세요!`
      : `My ${testName} result: ${resultType}! ${description} 🎯 Take the test yourself!`;

  const currentUrl =
    shareUrl || (typeof window !== "undefined" ? window.location.href : "");
  const fullShareText = `${shareText}\n\n${currentUrl}`;

  // Web Share API
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          text: shareText,
          title: `${testName} Result`,
          url: currentUrl,
        });
      } catch {
        console.log("Share cancelled");
      }
    } else {
      // Fallback to copy
      handleCopyToClipboard();
    }
  };

  // Copy to clipboard
  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullShareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Failed to copy");
    }
  };

  // Generate and download image
  const handleDownloadImage = async () => {
    if (!resultRef.current) return;

    setIsGeneratingImage(true);
    try {
      const canvas = await html2canvas(resultRef.current, {
        allowTaint: true,
        background: "#ffffff",
        height: 600,
        useCORS: true,
        width: 800,
      });

      const link = document.createElement("a");
      link.download = `${testName.replace(/\s+/g, "-").toLowerCase()}-result.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch {
      console.error("Failed to generate image");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // KakaoTalk sharing
  const handleKakaoTalkShare = () => {
    const shareMsg =
      locale === "ko"
        ? `${emoji} ${resultType}\n\n${description}\n\n나도 ${testName} 해봤는데 정말 정확해요! 당신도 해보세요 👇`
        : `${emoji} ${resultType}\n\n${description}\n\nI took the ${testName} and it's so accurate! Try it yourself 👇`;

    const fullMessage = `${shareMsg}\n\n${currentUrl}`;

    // Check if on mobile for KakaoTalk app sharing
    const isMobile =
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );

    if (isMobile) {
      // Try KakaoTalk URL scheme first
      const kakaoUrl = `kakaotalk://share?text=${encodeURIComponent(fullMessage)}`;
      window.location.href = kakaoUrl;

      // Fallback after a short delay
      setTimeout(() => {
        handleCopyToClipboard();
      }, 2000);
    } else {
      // Desktop fallback - copy to clipboard
      navigator.clipboard.writeText(fullMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // Instagram sharing (generate square image)
  const handleInstagramShare = async () => {
    if (!resultRef.current) return;

    setIsGeneratingImage(true);
    try {
      const canvas = await html2canvas(resultRef.current, {
        allowTaint: true,
        background: "#ffffff",
        height: 800, // Square for Instagram
        useCORS: true,
        width: 800,
      });

      // Try to use Web Share API for mobile
      if (navigator.share && "canShare" in navigator) {
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], `${testName}-result.png`, {
              type: "image/png",
            });
            try {
              await navigator.share({
                files: [file],
                text: shareText,
                title: `${testName} Result`,
              });
            } catch {
              // Fallback to download
              const link = document.createElement("a");
              link.download = `${testName}-instagram.png`;
              link.href = canvas.toDataURL();
              link.click();
            }
          }
        });
      } else {
        // Fallback - download square image
        const link = document.createElement("a");
        link.download = `${testName}-instagram.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    } catch {
      console.error("Failed to generate Instagram image");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className={className}>
      {/* Shareable Result Card */}
      <Card
        className={`bg-card border-border border-2 shadow-sm mb-6`}
        ref={resultRef}
        style={{ boxShadow: `0 20px 40px shadow-green-500/10` }}
      >
        <CardContent className="p-8 text-center">
          {/* Header */}
          <div className="mb-6">
            <div className="text-7xl mb-4">{emoji}</div>
            <h2 className={`text-3xl font-bold text-foreground mb-2`}>
              {resultType}
            </h2>
            <p className={`text-lg text-muted-foreground mb-4`}>{title}</p>
            <p className={`text-primary leading-relaxed mb-6`}>{description}</p>
          </div>

          {/* Custom Content */}
          {customContent && <div className="mb-6">{customContent}</div>}

          {/* Branding */}
          <div className={`pt-6 border-t border-border border-opacity-20`}>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">🦉</span>
              <span className={`font-bold text-foreground`}>Oiyo.net</span>
              <span className={`text-muted-foreground`}>- {testName}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Proof Section */}
      <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-orange-700">
            <Users className="w-5 h-5" />
            <span className="font-semibold">
              {locale === "ko"
                ? "다른 사람들도 공유했어요!"
                : "Others shared their results too!"}
            </span>
          </div>
          <div className="text-sm text-green-600">
            {locale === "ko"
              ? "김*영님, 박*수님, 이*희님 외 1,234명이 결과를 공유했습니다"
              : "Kim*young, Park*soo, Lee*hee and 1,234 others shared their results"}
          </div>
          <div className="text-xs text-orange-500">
            {locale === "ko"
              ? "💡 결과를 공유하고 친구들과 성격 궁합을 확인해보세요!"
              : "💡 Share your results and check personality compatibility with friends!"}
          </div>
        </div>
      </div>

      {/* Sharing Actions */}
      <div className="space-y-4">
        {/* Primary Sharing Buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          {/* KakaoTalk Share (Primary for Korean users) */}
          <Button
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium flex-1 min-w-0"
            onClick={handleKakaoTalkShare}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {tUi("sharing.kakaoShare")}
          </Button>

          {/* Instagram Share */}
          <Button
            className="bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 text-white flex-1 min-w-0"
            disabled={isGeneratingImage}
            onClick={handleInstagramShare}
          >
            <Instagram className="w-4 h-4 mr-2" />
            {tUi("sharing.instagram")}
          </Button>

          {/* Native Share (Mobile) */}
          {typeof navigator !== "undefined" && "share" in navigator && (
            <Button
              className={`bg-gradient-to-r from-primary to-green-700 hover:from-green-700 to-primary text-white flex-1 min-w-0`}
              onClick={handleNativeShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              {tUi("sharing.moreApps")}
            </Button>
          )}
        </div>

        {/* Secondary Actions */}
        <div className="flex flex-wrap gap-2 justify-center">
          {/* Copy Link */}
          <Button
            className={`${copied ? "bg-green-50 border-green-200 text-green-700" : ""}`}
            onClick={handleCopyToClipboard}
            size="sm"
            variant="outline"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                {tUi("sharing.copied")}
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                {tUi("sharing.copyLink")}
              </>
            )}
          </Button>

          {/* Download Image */}
          <Button
            disabled={isGeneratingImage}
            onClick={handleDownloadImage}
            size="sm"
            variant="outline"
          >
            {isGeneratingImage ? (
              <>
                <Camera className="w-4 h-4 mr-2 animate-spin" />
                {tUi("sharing.creating")}
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                {tUi("sharing.saveImage")}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Social Share Buttons (Desktop) */}
      {typeof navigator !== "undefined" && !navigator.share && (
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          <Button
            className="bg-blue-50 hover:bg-blue-100 text-teal-600 border-blue-200"
            onClick={() => {
              const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`;
              window.open(twitterUrl, "_blank", "noopener,noreferrer");
            }}
            size="sm"
            variant="outline"
          >
            {tUi("sharing.twitter")}
          </Button>

          <Button
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
            onClick={() => {
              const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
              window.open(facebookUrl, "_blank", "noopener,noreferrer");
            }}
            size="sm"
            variant="outline"
          >
            {tUi("sharing.facebook")}
          </Button>

          <Button
            className="bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200"
            onClick={() => {
              const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
              window.open(linkedinUrl, "_blank", "noopener,noreferrer");
            }}
            size="sm"
            variant="outline"
          >
            LinkedIn
          </Button>
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 text-center">
        <p className={`text-sm text-muted-foreground`}>
          {locale === "ko"
            ? '💡 모바일에서는 "공유하기" 버튼을 사용하여 앱으로 직접 공유할 수 있어요!'
            : '💡 On mobile, use the "Share" button to share directly to your favorite apps!'}
        </p>
      </div>
    </div>
  );
}

// Hook for easier integration
export function useResultSharing(testName: string, locale: string) {
  const generateShareableContent = (_result: Record<string, unknown>) => {
    const shareText =
      locale === "ko"
        ? `내 ${testName} 결과를 확인해보세요! 🎯`
        : `Check out my ${testName} result! 🎯`;

    return {
      text: shareText,
      title: `${testName} Result`,
      url: typeof window !== "undefined" ? window.location.href : "",
    };
  };

  return { generateShareableContent };
}
