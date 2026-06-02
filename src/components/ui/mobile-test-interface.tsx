"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ButtonLoadingSpinner } from "@/components/ui/enhanced-loading-states";
import { SmoothProgressIndicator } from "@/components/ui/smooth-progress-indicator";
import { Locale } from "@/i18n";
import { commonTranslations } from "@/lib/system/i18n-utils";

interface MobileTestInterfaceProps {
  canGoBack?: boolean;
  className?: string;
  currentQuestion: number;
  isLastQuestion: boolean;
  locale: Locale;
  onNext: () => void;
  onOptionSelect: (optionId: string) => void;
  onPrevious: () => void;
  questions: MobileTestQuestion[];
  selectedOption: string;
}

interface MobileTestOption {
  emoji?: string;
  id: string;
  text: string;
}

interface MobileTestQuestion {
  emoji?: string;
  id: string;
  options: MobileTestOption[];
  text: string;
}

export function MobileTestInterface({
  canGoBack = true,
  className = "",
  currentQuestion,
  isLastQuestion,
  locale,
  onNext,
  onOptionSelect,
  onPrevious,
  questions,
  selectedOption,
}: MobileTestInterfaceProps) {
  const [touchStart, setTouchStart] = useState<null | number>(null);
  const [touchEnd, setTouchEnd] = useState<null | number>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null,
  );

  // Haptic feedback function
  const triggerHaptic = useCallback(
    (type: "heavy" | "light" | "medium" = "light") => {
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        switch (type) {
          case "heavy":
            navigator.vibrate([30, 10, 30]);
            break;
          case "light":
            navigator.vibrate(10);
            break;
          case "medium":
            navigator.vibrate(20);
            break;
        }
      }
    },
    [],
  );

  // Enhanced option selection with haptic feedback
  const handleOptionSelect = useCallback(
    (optionId: string) => {
      triggerHaptic("light");
      onOptionSelect(optionId);
    },
    [onOptionSelect, triggerHaptic],
  );

  // Enhanced navigation with haptic feedback
  const handleNext = useCallback(() => {
    if (!selectedOption) return;

    triggerHaptic("medium");
    setIsAnimating(true);
    setSwipeDirection("left");

    setTimeout(() => {
      onNext();
      setIsAnimating(false);
      setSwipeDirection(null);
    }, 200);
  }, [selectedOption, onNext, triggerHaptic]);

  const handlePrevious = useCallback(() => {
    if (!canGoBack || currentQuestion === 0) return;

    triggerHaptic("light");
    setIsAnimating(true);
    setSwipeDirection("right");

    setTimeout(() => {
      onPrevious();
      setIsAnimating(false);
      setSwipeDirection(null);
    }, 200);
  }, [canGoBack, currentQuestion, onPrevious, triggerHaptic]);

  const question = questions[currentQuestion];

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isRightSwipe && canGoBack && currentQuestion > 0) {
      handlePrevious();
    } else if (isLeftSwipe && selectedOption) {
      handleNext();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        if (selectedOption) {
          e.preventDefault();
          onNext();
        }
      } else if (e.key === "ArrowLeft" && canGoBack && currentQuestion > 0) {
        onPrevious();
      } else if (e.key === "ArrowRight" && selectedOption) {
        onNext();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [selectedOption, currentQuestion, canGoBack, onNext, onPrevious]);

  const getText = (key: string) => {
    if (key === "previous") return commonTranslations.previous[locale];
    if (key === "next") return commonTranslations.next[locale];
    if (key === "seeResults") return commonTranslations.seeResults[locale];
    if (key === "swipeHint") return commonTranslations.swipeToNavigate[locale];

    const texts = {
      questionOf: {
        cn: "问题",
        en: "Question",
        es: "Pregunta",
        fr: "Question",
        ja: "質問",
        ko: "문항",
      }[locale],
      selectOption: {
        cn: "请选择一个答案",
        en: "Please select an answer",
        es: "Por favor seleccione una respuesta",
        fr: "Veuillez sélectionner une réponse",
        ja: "回答を選択してください",
        ko: "답변을 선택해주세요",
      }[locale],
    };
    return (texts as any)[key] || key;
  };

  return (
    <div
      className={`max-w-2xl mx-auto ${className}`}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
    >
      {/* Enhanced Progress Section with Smooth Animations */}
      <div className="mb-4 md:mb-6">
        <SmoothProgressIndicator
          className="mb-4"
          currentStep={currentQuestion}
          isTransitioning={isAnimating}
          locale={locale}
          showPercentage={true}
          showStepCounter={true}
          size="md"
          totalSteps={questions.length}
        />

        {/* Swipe hint for mobile */}
        <p className="text-xs text-center text-green-600/60 mt-2 sm:hidden">
          {getText("swipeHint")}
        </p>
      </div>

      {/* Question Card with Enhanced Mobile Design */}
      <Card
        className={`bg-card border-border border-2 shadow-sm mb-6 overflow-hidden`}
      >
        <CardContent className="p-0">
          {/* Question Header */}
          <div className="p-4 sm:p-6 pb-3 sm:pb-4 text-center">
            {question.emoji && (
              <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 animate-pulse">
                {question.emoji}
              </div>
            )}
            <h2
              className={`text-lg sm:text-xl md:text-2xl font-bold text-foreground leading-tight px-2`}
            >
              {question.text}
            </h2>
          </div>

          {/* Options with Enhanced Touch Targets */}
          <div className="px-4 pb-6 space-y-3">
            {question.options.map((option) => (
              <button
                className={`w-full p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border-2 text-left transition-all duration-200 transform active:scale-[0.98] min-h-[60px] sm:min-h-[72px] ${
                  selectedOption === option.id
                    ? `border-primary/50 bg-gradient-to-r from-green-50 via-green-50 to-stone-50 shadow-lg`
                    : `border-green-50 hover:border-green-800/50 hover:bg-gray-50 bg-white`
                } ${isAnimating ? "pointer-events-none" : ""}`}
                disabled={isAnimating}
                key={option.id}
                onClick={() => handleOptionSelect(option.id)}
                style={{
                  boxShadow:
                    selectedOption === option.id
                      ? `0 8px 25px shadow-green-500/10`
                      : "0 2px 8px rgba(0,0,0,0.1)",
                  transform:
                    isAnimating && swipeDirection
                      ? `translateX(${swipeDirection === "left" ? "-100%" : "100%"})`
                      : undefined,
                }}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  {option.emoji && (
                    <span className="text-2xl sm:text-3xl md:text-4xl flex-shrink-0">
                      {option.emoji}
                    </span>
                  )}
                  <span
                    className={`font-medium text-sm sm:text-base md:text-lg leading-relaxed ${
                      selectedOption === option.id
                        ? "hsl(var(--foreground))"
                        : "text-green-950"
                    }`}
                  >
                    {option.text}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Navigation with Better Mobile UX */}
      <div className="flex justify-between items-center gap-4">
        {/* Previous Button */}
        <Button
          aria-label={getText("previous")}
          className="flex-1 max-w-32 h-12"
          disabled={!canGoBack || currentQuestion === 0 || isAnimating}
          onClick={handlePrevious}
          size="lg"
          variant="outline"
        >
          {isAnimating ? (
            <ButtonLoadingSpinner size={16} />
          ) : (
            <ChevronLeft className="w-6 h-6" />
          )}
        </Button>

        {/* Progress Dots (Mobile) */}
        <div className="hidden sm:flex gap-1 px-2">
          {questions.slice(0, Math.min(5, questions.length)).map((_, index) => (
            <div
              className={`w-2 h-2 rounded-full transition-colors ${
                index <= currentQuestion
                  ? "hsl(var(--primary))"
                  : "bg-green-800/50"
              }`}
              key={index}
              style={{
                backgroundColor:
                  index <= currentQuestion ? "hsl(var(--primary))" : undefined,
              }}
            />
          ))}
          {questions.length > 5 && (
            <span className="text-xs text-green-600/60 ml-1">...</span>
          )}
        </div>

        {/* Next Button */}
        <Button
          aria-label={isLastQuestion ? getText("seeResults") : getText("next")}
          className="flex-1 max-w-40 h-12 bg-gradient-to-r from-primary to-green-700 hover:from-green-700 to-primary text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          disabled={!selectedOption || isAnimating}
          onClick={handleNext}
          size="lg"
        >
          {isAnimating ? (
            <ButtonLoadingSpinner size={16} />
          ) : (
            <ChevronRight className="w-6 h-6" />
          )}
        </Button>
      </div>

      {/* Selection Prompt */}
      {!selectedOption && (
        <div className="mt-4 text-center">
          <p className={`text-sm text-muted-foreground animate-pulse`}>
            {getText("selectOption")}
          </p>
        </div>
      )}
    </div>
  );
}
