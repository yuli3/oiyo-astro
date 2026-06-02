/* eslint-disable no-restricted-syntax */
"use client";

import { AnimatePresence, m } from "framer-motion";
import { ArrowRight, RefreshCw, Sparkles, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useMemo, useState } from "react";

import {
  ErrorBoundary,
  withErrorBoundary,
} from "@/components/shared/ErrorBoundary";
import { Badge } from "@/components/ui/badge";
import { BotanicalProgress } from "@/components/ui/BotanicalProgress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ResonanceMandalaLazy } from "@/lib/system/lazy/dynamic-imports";

export interface DiagnosticOption {
  id: string;
  text: Record<string, string | undefined> | string;
}

export interface DiagnosticQuestion {
  id: string;
  options: DiagnosticOption[];
  text: Record<string, string | undefined> | string;
}

// Internal aliases for backward compatibility
type Option = DiagnosticOption;
type Question = DiagnosticQuestion;

interface TemplateADiagnosticProps<T> {
  badgeText: string;
  introText: string;
  locale: string;
  mandalaStyles?: (result: T) => React.CSSProperties;
  onCalculate: (answers: Record<string, string>) => T;
  questions: Question[];
  renderResult: (result: T) => React.ReactNode;
  storageKey?: string;
  themeColor?: string;
  title: string;
}

export function TemplateADiagnostic<T>({
  badgeText,
  introText,
  locale,
  mandalaStyles,
  onCalculate,
  questions,
  renderResult,
  storageKey,
  themeColor = "green",
  title,
}: TemplateADiagnosticProps<T>) {
  const t = useTranslations("assessment");
  const tc = useTranslations("common");

  const [step, setStep] = useState<"intro" | "questions" | "result">("intro");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [calcError, setCalcError] = useState(false);

  // Persistence Logic
  React.useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(`oiyo_test_${storageKey}`);
      if (saved) {
        try {
          const {
            answers: savedAnswers,
            currentIdx: savedIdx,
            step: savedStep,
          } = JSON.parse(saved);
          if (savedAnswers && Object.keys(savedAnswers).length > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating state from localStorage on mount
            setAnswers(savedAnswers);
            if (savedStep === "result") {
              try {
                const res = onCalculate(savedAnswers);
                setResult(res);
              } catch (e) {
                console.error("onCalculate failed on restore", e);
              }
            }
          }
          if (savedIdx !== undefined) setCurrentIdx(savedIdx);
          if (savedStep) setStep(savedStep);
        } catch (e) {
          console.warn("Failed to restore test state", e);
        }
      }
    }
  }, [storageKey, onCalculate]);

  React.useEffect(() => {
    if (storageKey && step !== "intro") {
      const state = { answers, currentIdx, step };
      localStorage.setItem(`oiyo_test_${storageKey}`, JSON.stringify(state));
    }
  }, [storageKey, step, currentIdx, answers]);

  // Imperial Color Palette Enforcement
  const colorVariants: Record<string, any> = {
    amber: {
      badge: "bg-amber-100 text-amber-800 border-amber-200",
      button: "bg-amber-600 hover:bg-amber-700 shadow-amber-900/10",
      progress: "text-amber-600",
      text: "text-amber-700",
    },
    green: {
      badge: "bg-green-100 text-green-800 border-green-200",
      button: "bg-green-700 hover:bg-green-800 shadow-green-900/10",
      progress: "text-green-600",
      text: "text-green-700",
    },
    teal: {
      badge: "bg-teal-100 text-teal-800 border-teal-200",
      button: "bg-teal-600 hover:bg-teal-700 shadow-teal-900/10",
      progress: "text-teal-600",
      text: "text-teal-700",
    },
  };

  const theme = colorVariants[themeColor] || colorVariants.green;

  const handleAnswer = (questionId: string, optionId: string) => {
    const newAnswers = { ...answers, [questionId]: optionId };
    setAnswers(newAnswers);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      try {
        const res = onCalculate(newAnswers);
        setResult(res);
        setStep("result");
      } catch (e) {
        console.error("onCalculate failed", e);
        setCalcError(true);
      }
    }
  };

  const styles = useMemo(() => {
    const defaultMandala = {
      "--resonance-color": "#059669",
      "--resonance-color-secondary": "#10B981",
    };
    if (!result || !mandalaStyles) return defaultMandala;
    return mandalaStyles(result);
  }, [result, mandalaStyles]);

  return (
    <ErrorBoundary name={`TemplateA-${title}`}>
      <div className="relative w-full h-full bg-transparent text-[#064e3b] overflow-hidden font-sans selection:bg-green-200 selection:text-green-900">
        <div className="absolute inset-0 z-0 opacity-30 mix-blend-multiply pointer-events-none">
          <ResonanceMandalaLazy styles={styles as any} />
        </div>

        <main className="relative z-10 w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar flex items-center justify-center p-6">
          <section className="w-full max-w-4xl min-h-[50vh] flex flex-col items-center justify-center snap-center">
            <AnimatePresence mode="wait">
              {step === "intro" && (
                <m.article
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-xl text-center space-y-8"
                  exit={{ opacity: 0, y: -20 }}
                  initial={{ opacity: 0, y: 20 }}
                  key="intro"
                >
                  <Badge
                    className={`${theme.badge} px-6 py-2 uppercase tracking-[0.3em] font-black shadow-lg backdrop-blur-md rounded-full border-2`}
                  >
                    {badgeText}
                  </Badge>
                  <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none uppercase text-[#064e3b] drop-shadow-2xl">
                    {title}
                  </h1>
                  <div className="max-w-md mx-auto h-1 w-24 bg-gradient-to-r from-transparent via-green-900/20 to-transparent my-10" />
                  <p className="text-2xl md:text-3xl text-green-950/60 font-medium leading-relaxed font-serif">
                    {introText}
                  </p>
                  <Button
                    className={`h-20 px-16 text-2xl font-black tracking-widest uppercase ${theme.button} text-white rounded-full transition-all group shadow-2xl hover:scale-105 active:scale-95 mt-12 mb-10`}
                    onClick={() => setStep("questions")}
                  >
                    {t("start")}{" "}
                    <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </m.article>
              )}

              {step === "questions" && calcError && (
                <m.article
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-md text-center space-y-6"
                  exit={{ opacity: 0, y: 20 }}
                  initial={{ opacity: 0, y: -20 }}
                  key="calc-error"
                >
                  <div className="text-5xl">⚠️</div>
                  <p className="text-xl font-bold text-[#064e3b]">
                    {t("calcError")}
                  </p>
                  <Button
                    className={`h-14 px-10 font-black ${theme.button} text-white rounded-full`}
                    onClick={() => {
                      setCalcError(false);
                      setCurrentIdx(0);
                      setAnswers({});
                    }}
                  >
                    {t("calcErrorRetry")}
                  </Button>
                </m.article>
              )}

              {step === "questions" && !calcError && (
                <m.article
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full max-w-2xl space-y-12"
                  exit={{ opacity: 0, scale: 1.05 }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  key="questions"
                >
                  <div className="space-y-8 text-center flex flex-col items-center">
                    <BotanicalProgress
                      current={currentIdx + 1}
                      themeColor={themeColor}
                      total={questions.length}
                    />
                    <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#064e3b] font-serif">
                      {typeof questions[currentIdx]?.text === "string"
                        ? questions[currentIdx]?.text
                        : questions[currentIdx]?.text[locale] ||
                          questions[currentIdx]?.text["en"] ||
                          ""}
                    </h2>
                  </div>

                  <div className="grid gap-4">
                    {questions[currentIdx]?.options.map((opt) => (
                      <Button
                        aria-label={
                          typeof opt.text === "string"
                            ? opt.text
                            : opt.text[locale] || opt.text["en"] || ""
                        }
                        className="h-auto py-8 text-xl bg-white/40 border-white/20 hover:bg-white/80 hover:border-green-500/30 text-[#064e3b] justify-start px-10 rounded-[2rem] transition-all text-left whitespace-normal shadow-lg shadow-green-900/5 backdrop-blur-xl group relative overflow-hidden"
                        key={opt.id}
                        onClick={() =>
                          handleAnswer(questions[currentIdx].id, opt.id)
                        }
                        variant="ghost"
                      >
                        <m.div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <span className="relative z-10 font-bold font-serif text-2xl mr-4 opacity-20">
                          {opt.id.slice(-1).toUpperCase()}
                        </span>
                        <span className="relative z-10">
                          {typeof opt.text === "string"
                            ? opt.text
                            : opt.text[locale] || opt.text["en"] || ""}
                        </span>
                      </Button>
                    ))}
                  </div>
                </m.article>
              )}

              {step === "result" && result && (
                <m.article
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full max-w-4xl space-y-12 overflow-y-auto max-h-[90vh] no-scrollbar p-6 rounded-3xl"
                  initial={{ opacity: 0, scale: 0.9 }}
                  key="result"
                >
                  {renderResult(result)}
                  <div className="flex justify-center pb-12">
                    <Button
                      aria-label={tc("retry") || t("retake") || "Retry"}
                      className="rounded-full w-16 h-16 p-0 bg-white/60 hover:bg-white/80 text-green-900/40 hover:text-green-900 transition-all border border-green-900/5"
                      onClick={() => {
                        if (storageKey)
                          localStorage.removeItem(`oiyo_test_${storageKey}`);
                        setStep("intro");
                        setCurrentIdx(0);
                        setAnswers({});
                        setResult(null);
                      }}
                      variant="ghost"
                    >
                      <RefreshCw className="w-6 h-6" />
                      <span className="sr-only">
                        {tc("retry") || t("retake") || "Retry"}
                      </span>
                    </Button>
                  </div>
                </m.article>
              )}
            </AnimatePresence>
          </section>
        </main>
      </div>
    </ErrorBoundary>
  );
}
