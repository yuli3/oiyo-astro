/* eslint-disable no-restricted-syntax */
"use client";

import { AnimatePresence, m } from "framer-motion";
import html2canvas from "html2canvas";
import {
  Check,
  Copy,
  Download,
  Facebook,
  Instagram,
  Loader2,
  MessageCircle,
  Share2,
  Sparkles,
  Twitter,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";

import type { Locale } from "@/i18n";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface PersonalityResult {
  category: string;
  color: string;
  description: string;
  emoji: string;
  score?: number;
  title: string;
  traits: string[];
  type: string;
}

export interface ShareableResultProps {
  className?: string;
  locale: Locale;
  onShare?: (platform: string) => void;
  result: PersonalityResult;
  testName: string;
  userName?: string;
}

interface ShareResult {
  imageBlob?: Blob;
  imageUrl?: string;
  platformTexts?: Record<string, string>;
  shareText: string;
  shareUrl: string;
}

const SOCIAL_PLATFORMS = {
  facebook: {
    color: "#1877F2",
    icon: Facebook,
    name: "Facebook",
    textColor: "#FFFFFF",
    urlTemplate: (text: string, url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
  },
  instagram: {
    color: "#E4405F",
    icon: Instagram,
    name: "Instagram",
    textColor: "#FFFFFF",
    urlTemplate: null, // Instagram requires image sharing via native apps
  },
  kakaotalk: {
    color: "#FEE500",
    icon: MessageCircle,
    name: "KakaoTalk",
    textColor: "#000000",
    urlTemplate: null, // KakaoTalk uses native sharing
  },
  twitter: {
    color: "#1DA1F2",
    icon: Twitter,
    name: "Twitter",
    textColor: "#FFFFFF",
    urlTemplate: (text: string, url: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
};

export function EnhancedResultSharing({
  className = "",
  locale,
  onShare,
  result,
  testName,
  userName,
}: ShareableResultProps) {
  const tUi = useTranslations("ui");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareResult, setShareResult] = useState<null | ShareResult>(null);

  const resultRef = useRef<HTMLDivElement>(null);

  // Generate share content based on personality result
  const generateShareContent = useCallback((): ShareResult => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const testUrl = `${baseUrl}/${locale}/${testName}`;

    const shareTexts = {
      zh: {
        default: `${result.emoji} ${result.title}\n\n${result.description}\n\n✨ ${result.traits.slice(0, 2).join(", ")}\n\n快来测试一下吧！ 👉 oiyo.net\n\n#性格测试 #OIYO`,
        facebook: `朋友们，刚做了 ${testName}，结果太棒了！ 🤯\n\n✨ 我的类型: ${result.title} ${result.emoji}\n\n${result.description}\n\n主要特征: ${result.traits.slice(0, 3).join(", ")}\n\n你也应该尝试一下！`,
        instagram: `${result.emoji} ${result.title}\n\n刚做了 ${testName}，哇...出奇地准！ 😅\n\n✨ 主要特征: ${result.traits.slice(0, 2).join(", ")}\n\n#性格测试 #${testName.replace(/\s+/g, "")} #OIYO #自我发现 #心理学`,
        kakaotalk: `🎯 得到了我的 ${testName} 结果！\n\n✨ ${result.title} ${result.emoji}\n\n${result.description.slice(0, 80)}...\n\n令人惊讶的结果！你也试一试吧！ 🤔\n\n👉 oiyo.net`,
        twitter: `${result.emoji} ${result.title}\n\n${testName} 测试结果！\n${result.description.slice(0, 100)}...\n\n#性格测试 #OIYO`,
      },
      en: {
        default: `${result.emoji} ${result.title}\n\n${result.description}\n\n✨ ${result.traits.slice(0, 2).join(", ")}\n\nTake the test yourself! 👉 oiyo.net\n\n#PersonalityTest #OIYO`,
        facebook: `Friends, just took the ${testName} and the results are amazing! 🤯\n\n✨ My type: ${result.title} ${result.emoji}\n\n${result.description}\n\nKey traits: ${result.traits.slice(0, 3).join(", ")}\n\nYou should try it too!`,
        instagram: `${result.emoji} ${result.title}\n\nJust took the ${testName} and wow... surprisingly accurate! 😅\n\n✨ Key traits: ${result.traits.slice(0, 2).join(", ")}\n\n#PersonalityTest #${testName.replace(/\s+/g, "")} #OIYO #SelfDiscovery #Psychology #PersonalityAnalysis`,
        kakaotalk: `🎯 Got my ${testName} results!\n\n✨ ${result.title} ${result.emoji}\n\n${result.description.slice(0, 80)}...\n\nSurprising results! Try it yourself! 🤔\n\n👉 oiyo.net`,
        twitter: `${result.emoji} ${result.title}\n\n${testName} results!\n${result.description.slice(0, 100)}...\n\n#PersonalityTest #OIYO`,
      },
      es: {
        default: `${result.emoji} ${result.title}\n\n${result.description}\n\n✨ ${result.traits.slice(0, 2).join(", ")}\n\n¡Haz el test tú mismo! 👉 oiyo.net\n\n#TestDePersonalidad #OIYO`,
        facebook: `Amigos, acabo de hacer el ${testName} y los resultados son increíbles! 🤯\n\n✨ Mi tipo: ${result.title} ${result.emoji}\n\n${result.description}\n\nRasgos clave: ${result.traits.slice(0, 3).join(", ")}\n\n¡Deberías probarlo también!`,
        instagram: `${result.emoji} ${result.title}\n\nAcabo de hacer el ${testName} y wow... ¡sorprendentemente preciso! 😅\n\n✨ Rasgos clave: ${result.traits.slice(0, 2).join(", ")}\n\n#TestDePersonalidad #${testName.replace(/\s+/g, "")} #OIYO #DescubrimientoPersonal #Psicología`,
        kakaotalk: `🎯 ¡Obtuve mis resultados de ${testName}!\n\n✨ ${result.title} ${result.emoji}\n\n${result.description.slice(0, 80)}...\n\n¡Resultados sorprendentes! ¡Pruébalo tú mismo! 🤔\n\n👉 oiyo.net`,
        twitter: `${result.emoji} ${result.title}\n\n¡Resultados de ${testName}!\n${result.description.slice(0, 100)}...\n\n#TestDePersonalidad #OIYO`,
      },
      fr: {
        default: `${result.emoji} ${result.title}\n\n${result.description}\n\n✨ ${result.traits.slice(0, 2).join(", ")}\n\nFaites le test vous-même ! 👉 oiyo.net\n\n#TestDePersonnalité #OIYO`,
        facebook: `Les amis, je viens de passer le ${testName} et les résultats sont incroyables ! 🤯\n\n✨ Mon type : ${result.title} ${result.emoji}\n\n${result.description}\n\nTraits clés : ${result.traits.slice(0, 3).join(", ")}\n\nVous devriez l'essayer aussi !`,
        instagram: `${result.emoji} ${result.title}\n\nJe viens de passer le ${testName} et wow... étonnamment précis ! 😅\n\n✨ Traits clés : ${result.traits.slice(0, 2).join(", ")}\n\n#TestDePersonnalité #${testName.replace(/\s+/g, "")} #OIYO #DécouverteDeSoi #Psychologie`,
        kakaotalk: `🎯 J'ai obtenu mes résultats ${testName} !\n\n✨ ${result.title} ${result.emoji}\n\n${result.description.slice(0, 80)}...\n\nRésultats surprenants ! Essayez vous-même ! 🤔\n\n👉 oiyo.net`,
        twitter: `${result.emoji} ${result.title}\n\nRésultats du ${testName} !\n${result.description.slice(0, 100)}...\n\n#TestDePersonnalité #OIYO`,
      },
      ja: {
        default: `${result.emoji} ${result.title}\n\n${result.description}\n\n✨ ${result.traits.slice(0, 2).join(", ")}\n\nあなたも診断してみてください！ 👉 oiyo.net\n\n#性格診断 #OIYO`,
        facebook: `${testName} を受けましたが、結果が素晴らしいです！ 🤯\n\n✨ 私のタイプ: ${result.title} ${result.emoji}\n\n${result.description}\n\n主な特徴: ${result.traits.slice(0, 3).join(", ")}\n\nあなたも試してみてください！`,
        instagram: `${result.emoji} ${result.title}\n\n${testName} を受けたところ、驚くほど正確でした！ 😅\n\n✨ 主な特徴: ${result.traits.slice(0, 2).join(", ")}\n\n#性格診断 #${testName.replace(/\s+/g, "")} #OIYO #自己啓発 #心理学`,
        kakaotalk: `🎯 ${testName} 結果が出ました！\n\n✨ ${result.title} ${result.emoji}\n\n${result.description.slice(0, 80)}...\n\n驚きの結果です！あなたも試してみてください！ 🤔\n\n👉 oiyo.net`,
        twitter: `${result.emoji} ${result.title}\n\n${testName} 診断結果！\n${result.description.slice(0, 100)}...\n\n#性格診断 #OIYO`,
      },
      ko: {
        default: `${result.emoji} ${result.title}\n\n${result.description}\n\n✨ ${result.traits.slice(0, 2).join(", ")}\n\n당신도 테스트해보세요! 👉 oiyo.net\n\n#성격테스트 #OIYO`,
        facebook: `친구들아, ${testName} 해봤는데 결과가 신기해! 🤯\n\n✨ 내 유형: ${result.title} ${result.emoji}\n\n${result.description}\n\n주요 특징: ${result.traits.slice(0, 3).join(", ")}\n\n여러분도 한번 해보세요!`,
        instagram: `${result.emoji} ${result.title}\n\n${testName} 결과가 나왔는데... 생각보다 정확하네? 😅\n\n✨ 주요 특징: ${result.traits.slice(0, 2).join(", ")}\n\n#성격테스트 #${testName.replace(/\s+/g, "")} #오이요 #OIYO #성격분석 #자기계발 #심리테스트`,
        kakaotalk: `🎯 ${testName} 결과가 나왔어요!\n\n✨ ${result.title} ${result.emoji}\n\n${result.description.slice(0, 80)}...\n\n나도 예상 못한 결과였는데, 여러분도 한번 해보세요! 🤔\n\n👉 oiyo.net`,
        twitter: `${result.emoji} ${result.title}\n\n${testName} 테스트 결과!\n${result.description.slice(0, 100)}...\n\n#성격테스트 #OIYO`,
      },
    };

    const content = shareTexts[locale];
    const shareText = content.default;

    return {
      platformTexts: content,
      shareText,
      shareUrl: testUrl,
    };
  }, [result, locale, testName]);

  // Generate screenshot of result
  const generateScreenshot = useCallback(async (): Promise<Blob | null> => {
    if (!resultRef.current) return null;

    try {
      setIsGenerating(true);

      const canvas = await html2canvas(resultRef.current, {
        allowTaint: true,
        background: "#ffffff",
        height: 1080,
        useCORS: true,
        width: 1080,
      });

      return new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (blob) => {
            resolve(blob!);
          },
          "image/png",
          1.0,
        );
      });
    } catch (error) {
      console.error("Error generating screenshot:", error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Handle Web Share API
  const handleNativeShare = useCallback(async () => {
    if (!navigator.share) return false;

    try {
      setIsSharing(true);
      const content = generateShareContent();
      const imageBlob = await generateScreenshot();

      const shareData: ShareData = {
        text: content.shareText,
        title: result.title,
        url: content.shareUrl,
      };

      // Add image if available and supported
      if (
        imageBlob &&
        "canShare" in navigator &&
        navigator.canShare({
          files: [new File([imageBlob], "result.png", { type: "image/png" })],
        })
      ) {
        shareData.files = [
          new File([imageBlob], "personality-result.png", {
            type: "image/png",
          }),
        ];
      }

      await navigator.share(shareData);
      onShare?.("native");
      return true;
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Error sharing:", error);
      }
      return false;
    } finally {
      setIsSharing(false);
    }
  }, [result, generateShareContent, generateScreenshot, onShare]);

  // Handle platform-specific sharing
  const handlePlatformShare = useCallback(
    async (platform: keyof typeof SOCIAL_PLATFORMS) => {
      const content = generateShareContent();
      const platformConfig = SOCIAL_PLATFORMS[platform];
      const platformText =
        content.platformTexts?.[platform] || content.shareText;

      onShare?.(platform);

      if (platform === "kakaotalk") {
        // For KakaoTalk, use native Web Share API or copy to clipboard
        if (navigator.share) {
          try {
            await navigator.share({
              text: platformText,
              title: result.title,
              url: content.shareUrl,
            });
            return;
          } catch {
            // Fallback to copying text
          }
        }
        await navigator.clipboard.writeText(platformText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      }

      if (platform === "instagram") {
        // For Instagram, generate image and copy text
        const imageBlob = await generateScreenshot();
        if (imageBlob) {
          const imageUrl = URL.createObjectURL(imageBlob);
          setShareResult({ ...content, imageBlob, imageUrl });

          // Copy Instagram-optimized text to clipboard
          await navigator.clipboard.writeText(platformText);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
        return;
      }

      if (platformConfig.urlTemplate) {
        const shareUrl = platformConfig.urlTemplate(
          platformText,
          content.shareUrl,
        );
        window.open(shareUrl, "_blank", "width=600,height=400");
      }
    },
    [result.title, generateShareContent, generateScreenshot, onShare],
  );

  // Handle copy to clipboard
  const handleCopy = useCallback(async () => {
    try {
      const content = generateShareContent();
      await navigator.clipboard.writeText(
        `${content.shareText}\n\n${content.shareUrl}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onShare?.("copy");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  }, [generateShareContent, onShare]);

  // Handle download image
  const handleDownload = useCallback(async () => {
    const imageBlob = await generateScreenshot();
    if (imageBlob) {
      const url = URL.createObjectURL(imageBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${testName}-result.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      onShare?.("download");
    }
  }, [generateScreenshot, testName, onShare]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Social Sharing Prompt */}
      <m.div
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-xl from-background to-secondary/30 border border-border relative overflow-hidden`}
        initial={{ opacity: 0, y: 20 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-pink-500/10" />
        <div className="relative flex items-center gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h3 className={`text-lg font-semibold text-foreground mb-2`}>
              {locale === "ko"
                ? "결과를 친구들과 공유해보세요!"
                : locale === "ja"
                  ? "結果を友達と共有しましょう！"
                  : locale === "zh"
                    ? "与朋友分享你的结果！"
                    : "Share Your Results!"}
            </h3>
            <p className={`text-sm text-muted-foreground`}>
              {locale === "ko"
                ? "김*영님처럼 여러분의 특별한 성격 결과를 자랑해보세요 ✨"
                : locale === "ja"
                  ? "あなたの特別な結果を共有しましょう ✨"
                  : locale === "zh"
                    ? "分享你独特的性格测试结果 ✨"
                    : "Show off your unique personality results ✨"}
            </p>
          </div>
        </div>
      </m.div>

      {/* Shareable Result Card */}
      <m.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        ref={resultRef}
        transition={{ duration: 0.6 }}
      >
        <Card className="w-full max-w-lg mx-auto overflow-hidden border-2 shadow-xl">
          {/* Header with gradient */}
          <div
            className="h-20 bg-gradient-to-r from-amber-500 to-pink-500 relative"
            style={{
              background: `linear-gradient(135deg, ${result.color}DD, ${result.color}88)`,
            }}
          >
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
            <div className="relative h-full flex items-center justify-between px-6">
              <div className="text-white">
                <p className="text-sm font-medium opacity-90">
                  {locale === "ko"
                    ? "OIYO 성격테스트"
                    : "OIYO Personality Test"}
                </p>
                <p className="text-xs opacity-75">
                  {locale === "ko"
                    ? "당신의 성격을 발견하세요"
                    : "Discover Your Personality"}
                </p>
              </div>
              <div className="text-4xl">{result.emoji}</div>
            </div>
          </div>

          <CardContent className="p-6 text-center space-y-4">
            {/* User name if provided */}
            {userName && (
              <p className="text-sm text-green-700">
                {locale === "ko"
                  ? `${userName}님의 결과`
                  : `${userName}'s Result`}
              </p>
            )}

            {/* Result type */}
            <Badge
              className="text-lg px-4 py-2 font-bold"
              style={{
                backgroundColor: `${result.color}20`,
                border: `2px solid ${result.color}40`,
                color: result.color,
              }}
            >
              {result.type}
            </Badge>

            {/* Title */}
            <h2 className="text-2xl font-bold text-green-900 leading-tight">
              {result.title}
            </h2>

            {/* Description */}
            <p className="text-green-700 text-sm leading-relaxed">
              {result.description}
            </p>

            {/* Top traits */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-green-800">
                {tUi("sharing.keyTraits")}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {result.traits.slice(0, 3).map((trait, index) => (
                  <Badge
                    className="text-xs"
                    key={index}
                    style={{ borderColor: result.color, color: result.color }}
                    variant="outline"
                  >
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Score if available */}
            {result.score && (
              <div className="text-center">
                <p className="text-sm text-green-700">
                  {tUi("sharing.matchScore")}
                </p>
                <p
                  className="text-3xl font-bold"
                  style={{ color: result.color }}
                >
                  {result.score}%
                </p>
              </div>
            )}

            {/* CTA */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-green-600">
                {locale === "ko"
                  ? "당신도 테스트해보세요 → oiyo.kr"
                  : "Take the test yourself → oiyo.kr"}
              </p>
            </div>
          </CardContent>
        </Card>
      </m.div>

      {/* Sharing Controls */}
      <div className="space-y-4">
        {/* Primary Share Button */}
        <Button
          className="w-full bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 text-white font-semibold py-3"
          disabled={isSharing || isGenerating}
          onClick={handleNativeShare}
        >
          {isSharing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Share2 className="w-4 h-4 mr-2" />
          )}
          {tUi("sharing.shareResult")}
        </Button>

        {/* Platform Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(SOCIAL_PLATFORMS).map(([key, platform]) => {
            const IconComponent = platform.icon;
            return (
              <Button
                className="flex items-center gap-2 py-2"
                disabled={isGenerating}
                key={key}
                onClick={() =>
                  handlePlatformShare(key as keyof typeof SOCIAL_PLATFORMS)
                }
                style={{
                  borderColor: platform.color,
                  color: platform.color,
                }}
                variant="outline"
              >
                <IconComponent className="w-4 h-4" />
                {platform.name}
              </Button>
            );
          })}
        </div>

        {/* Utility Buttons */}
        <div className="flex gap-3">
          <Button
            className="flex-1 flex items-center gap-2"
            disabled={isGenerating}
            onClick={handleCopy}
            variant="outline"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied
              ? tUi("sharing.copied")
              : locale === "ko"
                ? "텍스트 복사"
                : "Copy Text"}
          </Button>

          <Button
            className="flex-1 flex items-center gap-2"
            disabled={isGenerating}
            onClick={handleDownload}
            variant="outline"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {tUi("sharing.saveImage")}
          </Button>
        </div>
      </div>

      {/* Instagram Image Preview */}
      <AnimatePresence>
        {shareResult?.imageUrl && (
          <m.div
            animate={{ height: "auto", opacity: 1 }}
            className="space-y-3"
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
          >
            <div className="text-center">
              <h4 className="font-medium text-green-900">
                {locale === "ko"
                  ? "Instagram 공유용 이미지"
                  : "Instagram Share Image"}
              </h4>
              <p className="text-sm text-green-700">
                {locale === "ko"
                  ? "이미지를 길게 누르고 저장한 후 Instagram에 업로드하세요"
                  : "Long press to save image, then upload to Instagram"}
              </p>
            </div>
            <div className="flex justify-center">
              <Image
                alt="Shareable result"
                className="max-w-xs rounded-lg shadow-md"
                height={300}
                src={shareResult.imageUrl || ""}
                width={300}
              />
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Simplified version for quick sharing
export function QuickShareButton({
  className = "",
  locale,
  result,
  testName,
}: {
  className?: string;
  locale: Locale;
  result: PersonalityResult;
  testName: string;
}) {
  const tUi = useTranslations("ui");
  const [isSharing, setIsSharing] = useState(false);

  const handleQuickShare = async () => {
    if (!navigator.share) return;

    try {
      setIsSharing(true);
      const baseUrl =
        typeof window !== "undefined" ? window.location.origin : "";
      const shareText =
        locale === "ko"
          ? `나의 ${result.title} 성격 결과! ${result.emoji} 당신도 테스트해보세요!`
          : `My ${result.title} personality result! ${result.emoji} Take the test yourself!`;

      await navigator.share({
        text: shareText,
        title: result.title,
        url: `${baseUrl}/${locale}/${testName}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Button
      className={`flex items-center gap-2 ${className}`}
      disabled={isSharing}
      onClick={handleQuickShare}
      variant="outline"
    >
      {isSharing ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Share2 className="w-4 h-4" />
      )}
      {tUi("sharing.share")}
    </Button>
  );
}
