/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { AnimatePresence, m } from "framer-motion";
import {
  Brain,
  Compass,
  Heart,
  Loader2,
  Sparkles,
  Stars,
  Target,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

interface LoadingStateProps {
  className?: string;
  duration?: number;
  locale?: string;
  message?: string;
  progress?: number;
  submessage?: string;
  variant?: "analysis" | "default" | "minimal" | "personality" | "result";
}

// Page Loading Overlay
interface PageLoadingProps {
  isLoading: boolean;
  locale?: string;
  message?: string;
  variant?: "analysis" | "default" | "personality" | "result";
}

// Skeleton Loading Components
interface SkeletonProps {
  className?: string;
  variant?: "avatar" | "button" | "card" | "text";
}

// Quick Loading Indicators for buttons and small components
export function ButtonLoadingSpinner({ size = 16 }: { size?: number }) {
  return (
    <m.div
      animate={{ rotate: 360 }}
      className="inline-block"
      transition={{ duration: 1, ease: "linear", repeat: Infinity }}
    >
      <Loader2 size={size} />
    </m.div>
  );
}

export function EnhancedLoadingStates({
  className = "",
  duration = 3000,
  locale = "ko",
  message,
  progress,
  submessage,
  variant = "default",
}: LoadingStateProps) {
  const t = useTranslations("common");
  const [displayText, setDisplayText] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const getText = useCallback(
    (key: string) => t(`loading.${key}` as any) || key,
    [t],
  );

  // Use translation keys directly
  const loadingMessages = useMemo(
    () => [
      t("loading.analyzing"),
      t("loading.calculating"),
      t("loading.processing"),
      t("loading.generating"),
      t("loading.almostDone"),
    ],
    [t],
  );

  const personalityMessages = useMemo(
    () => [
      t("loading.personalityAnalysis"),
      t("loading.responseAnalysis"),
      t("loading.typeMatching"),
      t("loading.preparingResults"),
    ],
    [t],
  );

  useEffect(() => {
    const messages =
      variant === "personality" ? personalityMessages : loadingMessages;
    const stepDuration = duration / messages.length;

    // Set initial message
    setDisplayText(messages[0]);

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = (prev + 1) % messages.length;
        setDisplayText(messages[next]);
        return next;
      });
    }, stepDuration);

    return () => clearInterval(interval);
  }, [duration, variant, loadingMessages, personalityMessages]);

  const variants = {
    analysis: {
      animation: "bounce",
      color: "hsl(var(--primary))",
      icon: <Target className="w-8 h-8" />,
    },
    default: {
      animation: "spin",
      color: "hsl(var(--primary))",
      icon: <Loader2 className="w-8 h-8 animate-spin" />,
    },
    minimal: {
      animation: "pulse",
      color: "hsl(var(--muted-foreground))",
      icon: <Loader2 className="w-4 h-4 animate-spin" />,
    },
    personality: {
      animation: "floating",
      color: "hsl(var(--secondary))",
      icon: <Brain className="w-8 h-8" />,
    },
    result: {
      animation: "scale",
      color: "hsl(var(--accent))",
      icon: <Sparkles className="w-8 h-8" />,
    },
  };

  const currentVariant = variants[variant] || variants.default;

  return (
    <div
      className={`flex flex-col items-center justify-center space-y-4 p-8 text-center ${className}`}
    >
      {/* Icon Animation */}
      <m.div
        animate={{
          opacity: [0.8, 1, 0.8],
          scale: [1, 1.1, 1],
        }}
        className={`p-4 rounded-full bg-primary/5 ${currentVariant.color}`}
        transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
      >
        {currentVariant.icon}
      </m.div>

      {/* Progress Message */}
      <div className="space-y-2 max-w-xs">
        <h3 className="text-lg font-medium tracking-tight">
          {message || displayText}
        </h3>
        {submessage && (
          <p className="text-sm text-muted-foreground animate-pulse">
            {submessage}
          </p>
        )}
      </div>

      {/* Progress Bar (Optional) */}
      {progress !== undefined && (
        <div className="w-48 h-1 bg-primary/10 rounded-full overflow-hidden">
          <m.div
            animate={{ width: `${progress}%` }}
            className="h-full bg-primary"
            initial={{ width: 0 }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}

      {/* Detailed Steps (for Analysis variant) */}
      {variant === "analysis" && (
        <div className="flex gap-2 pt-4">
          {[0, 1, 2, 3].map((i) => (
            <m.div
              animate={{
                opacity: currentStep === i ? 1 : 0.3,
                scale: currentStep === i ? 1.2 : 1,
              }}
              className="w-2 h-2 rounded-full bg-primary"
              key={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function PageLoadingOverlay({
  isLoading,
  locale = "ko",
  message,
  variant = "default",
}: PageLoadingProps) {
  const t = useTranslations("common");
  const getText = (key: string) => t(`loading.${key}` as any) || key;

  return (
    <AnimatePresence>
      {isLoading && (
        <m.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
        >
          <div className="bg-card border shadow-2xl rounded-3xl p-8 max-w-sm w-full mx-4">
            <EnhancedLoadingStates message={message} variant={variant} />
            <div className="mt-4 text-center text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
              <span>{getText("please_wait")}</span>
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}

export function Skeleton({ className = "", variant = "text" }: SkeletonProps) {
  const variants = {
    avatar: "w-12 h-12 rounded-full",
    button: "w-24 h-10 rounded-md",
    card: "w-full h-48 rounded-xl",
    text: "w-full h-4 rounded-md",
  };

  return (
    <div
      className={`bg-muted animate-pulse ${variants[variant]} ${className}`}
    />
  );
}
