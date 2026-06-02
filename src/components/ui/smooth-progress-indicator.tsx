/* eslint-disable no-restricted-syntax */
"use client";

import { AnimatePresence, m } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

// Circular Progress variant for different use cases
interface CircularProgressProps {
  className?: string;
  progress: number;
  showPercentage?: boolean;
  size?: number;
  strokeWidth?: number;
}

interface SmoothProgressIndicatorProps {
  className?: string;
  currentStep: number;
  isTransitioning?: boolean;
  locale?: string;
  showPercentage?: boolean;
  showStepCounter?: boolean;
  size?: "lg" | "md" | "sm";
  totalSteps: number;
}

export function CircularProgress({
  className = "",
  progress,
  showPercentage = true,
  size = 120,
  strokeWidth = 8,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={`relative ${className}`}
      style={{ height: size, width: size }}
    >
      <svg className="transform -rotate-90" height={size} width={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <m.circle
          animate={{ strokeDashoffset }}
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          initial={{ strokeDashoffset: circumference }}
          r={radius}
          stroke={"hsl(var(--primary))"}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          style={{
            strokeDasharray,
            strokeDashoffset,
          }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>

      {/* Percentage in center */}
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <m.span
            animate={{ scale: 1 }}
            className="text-2xl font-bold"
            initial={{ scale: 0 }}
            style={{ color: "hsl(var(--primary))" }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            {Math.round(progress)}%
          </m.span>
        </div>
      )}
    </div>
  );
}

export function SmoothProgressIndicator({
  className = "",
  currentStep,
  isTransitioning = false,
  locale = "ko",
  showPercentage = true,
  showStepCounter = true,
  size = "md",
  totalSteps,
}: SmoothProgressIndicatorProps) {
  const tUi = useTranslations("ui");
  const [displayProgress, setDisplayProgress] = useState(0);

  const actualProgress = ((currentStep + 1) / totalSteps) * 100;

  // Smooth animation for progress changes
  useEffect(() => {
    const animationDuration = isTransitioning ? 500 : 300;
    const startProgress = displayProgress;
    const endProgress = actualProgress;
    const startTime = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const newProgress =
        startProgress + (endProgress - startProgress) * easeOutQuart;

      setDisplayProgress(newProgress);

      if (progress < 1) {
        requestAnimationFrame(updateProgress);
      }
    };

    requestAnimationFrame(updateProgress);
  }, [actualProgress, isTransitioning, displayProgress]);

  const sizeConfig = {
    lg: {
      dotSize: "w-3 h-3",
      height: "h-4",
      spacing: "gap-2",
      textSize: "text-base",
    },
    md: {
      dotSize: "w-2 h-2",
      height: "h-3",
      spacing: "gap-1.5",
      textSize: "text-sm",
    },
    sm: {
      dotSize: "w-1.5 h-1.5",
      height: "h-2",
      spacing: "gap-1",
      textSize: "text-xs",
    },
  };

  const config = sizeConfig[size];

  const getText = (key: string) => {
    const texts: Record<string, string> = {
      of: tUi("progress.of"),
      progress: tUi("progress.progressLabel"),
      step: tUi("progress.stepLabel"),
    };
    return texts[key] ?? key;
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Step Counter and Percentage */}
      {(showStepCounter || showPercentage) && (
        <div className="flex justify-between items-center mb-3">
          {showStepCounter && (
            <div className={`${config.textSize} text-green-700 font-medium`}>
              <AnimatePresence mode="wait">
                <m.span
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  initial={{ opacity: 0, y: -10 }}
                  key={currentStep}
                  transition={{ duration: 0.2 }}
                >
                  {getText("step")} {currentStep + 1} {getText("of")}{" "}
                  {totalSteps}
                </m.span>
              </AnimatePresence>
            </div>
          )}

          {showPercentage && (
            <div
              className={`${config.textSize} font-bold`}
              style={{ color: "hsl(var(--primary))" }}
            >
              <AnimatePresence mode="wait">
                <m.span
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  key={Math.round(displayProgress)}
                  transition={{ duration: 0.2 }}
                >
                  {Math.round(displayProgress)}%
                </m.span>
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* Progress Bar Container */}
      <div className="relative">
        <div
          className={`w-full bg-green-50 rounded-full ${config.height} overflow-hidden`}
        >
          {/* Progress Fill */}
          <m.div
            animate={{ width: `${displayProgress}%` }}
            className={`${config.height} bg-gradient-to-r from-primary to-green-600 rounded-full`}
            initial={{ width: 0 }}
            style={{ width: `${displayProgress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />

          {/* Shimmer Effect */}
          {isTransitioning && (
            <m.div
              animate={{ x: "300%" }}
              className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              initial={{ x: "-100%" }}
              transition={{ duration: 1, ease: "linear", repeat: Infinity }}
            />
          )}
        </div>

        {/* Progress Indicator Dot */}
        <m.div
          animate={{ scale: 1 }}
          className={`absolute top-0 ${config.dotSize} bg-white rounded-full border-2 border-current transform -translate-y-0.5 shadow-lg`}
          initial={{ scale: 0 }}
          style={{
            color: "hsl(var(--primary))",
            left: `calc(${displayProgress}% - ${size === "sm" ? "3px" : size === "md" ? "4px" : "6px"})`,
          }}
          transition={{
            damping: 20,
            delay: 0.1,
            stiffness: 300,
            type: "spring",
          }}
        />
      </div>

      {/* Step Dots (for small number of steps) */}
      {totalSteps <= 8 && (
        <div className={`flex justify-center mt-4 ${config.spacing}`}>
          {Array.from({ length: totalSteps }, (_, index) => (
            <m.div
              animate={{ scale: 1 }}
              className={`${config.dotSize} rounded-full transition-colors duration-300`}
              initial={{ scale: 0 }}
              key={index}
              style={{
                backgroundColor:
                  index <= currentStep ? "hsl(var(--primary))" : "#e5e7eb",
              }}
              transition={{
                damping: 20,
                delay: index * 0.1,
                stiffness: 300,
                type: "spring",
              }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      )}

      {/* Motivational Progress Messages */}
      <AnimatePresence>
        {displayProgress >= 25 && displayProgress < 50 && (
          <m.div
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-center"
            exit={{ opacity: 0, y: -10 }}
            initial={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            <p className={`${config.textSize} text-green-600`}>
              {tUi("progress.greatStart")}
            </p>
          </m.div>
        )}

        {displayProgress >= 50 && displayProgress < 75 && (
          <m.div
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-center"
            exit={{ opacity: 0, y: -10 }}
            initial={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            <p className={`${config.textSize} text-green-600`}>
              {locale === "ko"
                ? "절반 이상 완료! 🎉"
                : "More than halfway there! 🎉"}
            </p>
          </m.div>
        )}

        {displayProgress >= 75 && displayProgress < 100 && (
          <m.div
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-center"
            exit={{ opacity: 0, y: -10 }}
            initial={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            <p className={`${config.textSize} text-green-600`}>
              {tUi("progress.almostThere")}
            </p>
          </m.div>
        )}

        {displayProgress >= 100 && (
          <m.div
            animate={{ opacity: 1, scale: 1 }}
            className="mt-3 text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            <p
              className={`${config.textSize} font-medium`}
              style={{ color: "hsl(var(--primary))" }}
            >
              {locale === "ko"
                ? "완료! 훌륭해요! 🎊"
                : "Complete! Excellent! 🎊"}
            </p>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
