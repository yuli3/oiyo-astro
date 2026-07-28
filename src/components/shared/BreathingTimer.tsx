"use client";

import { AnimatePresence, m } from "framer-motion";
import { Wind } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";

export type BreathingPhase = "exhale" | "hold" | "idle" | "inhale";

interface BreathingTimerProps {
  onComplete?: () => void;
}

const CYCLE_DURATION = {
  exhale: 8000,
  hold: 7000,
  inhale: 4000,
};

export const BreathingTimer: React.FC<BreathingTimerProps> = ({
  onComplete,
}) => {
  const t = useTranslations("anxietyRelief");

  const [phase, setPhase] = useState<BreathingPhase>("idle");
  const [cycleCount, setCycleCount] = useState(0);
  const [isActive, setIsActive] = useState(false);

  // Sacred Affirmations - Rotating wisdom from 6-locale translations
  const affirmations = [
    t("affirmations.1"),
    t("affirmations.2"),
    t("affirmations.3"),
    t("affirmations.4"),
    t("affirmations.5"),
  ];
  const currentAffirmation = affirmations[cycleCount % affirmations.length];

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isActive) {
      if (phase === "inhale") {
        timeout = setTimeout(() => setPhase("hold"), CYCLE_DURATION.inhale);
      } else if (phase === "hold") {
        timeout = setTimeout(() => setPhase("exhale"), CYCLE_DURATION.hold);
      } else if (phase === "exhale") {
        timeout = setTimeout(() => {
          setCycleCount((c) => c + 1);
          setPhase("inhale");
        }, CYCLE_DURATION.exhale);
      }
    } else {
      if (phase !== "idle") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPhase("idle");
        setCycleCount(0);
      }
    }

    return () => clearTimeout(timeout);
  }, [phase, isActive]);

  const toggleTimer = () => {
    if (!isActive) {
      setIsActive(true);
      setPhase("inhale");
    } else {
      setIsActive(false);
    }
  };

  const circleVariants = {
    exhale: {
      opacity: 0.6,
      scale: 1.0,
      transition: { duration: 8, ease: "easeInOut" as const },
    },
    hold: { opacity: 0.9, scale: 2.0, transition: { duration: 7 } },
    idle: {
      opacity: 0.8,
      scale: 1,
      transition: { duration: 1, type: "spring" as const },
    },
    inhale: {
      opacity: 1,
      scale: 2.0,
      transition: { duration: 4, ease: "easeInOut" as const },
    },
  };

  const textVariants = {
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    initial: { opacity: 0, y: 20 },
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-[500px] overflow-hidden rounded-[3rem] bg-white/60 border border-green-100 shadow-xl shadow-green-900/5 backdrop-blur-3xl">
      {/* Dynamic Mirror Aura Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <m.div
          animate={{
            opacity: [0.05, 0.1, 0.05],
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
          }}
          className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full bg-green-500/20 blur-[120px]"
          transition={{ duration: 10, ease: "easeInOut", repeat: Infinity }}
        />
        <m.div
          animate={{
            opacity: [0.05, 0.1, 0.05],
            scale: [1.2, 1, 1.2],
            x: [0, -50, 0],
          }}
          className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] rounded-full bg-amber-500/20 blur-[120px]"
          transition={{ duration: 12, ease: "easeInOut", repeat: Infinity }}
        />
      </div>

      {/* Main Breathing Circle (The Pulse) */}
      <m.div
        animate={phase}
        className="relative z-10 w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-2xl"
        variants={circleVariants}
      >
        <div className="absolute inset-0 bg-white/20 rounded-full blur-md" />
        <div className="relative z-20 text-white/40">
          <Wind className="w-8 h-8 animate-pulse" />
        </div>
      </m.div>

      {/* Instruction & Affirmation Text */}
      <div className="absolute z-20 flex flex-col items-center bottom-12 w-full px-6 text-center">
        <AnimatePresence mode="wait">
          <m.div
            animate="animate"
            className="space-y-4"
            exit="exit"
            initial="initial"
            key={phase}
            transition={{ duration: 0.8, ease: "easeOut" }}
            variants={textVariants}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-green-700/40">
              {isActive ? t(`phases.${phase}`) : "Ritual of Breath"}
            </p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-[#064e3b] font-serif">
              {isActive ? t(`phases.${phase}`) : t("title")}
            </h2>
            {isActive && (
              <m.p
                animate={{ opacity: 1 }}
                className="text-green-800 text-lg font-light"
                initial={{ opacity: 0 }}
              >
                {currentAffirmation}
              </m.p>
            )}
          </m.div>
        </AnimatePresence>

        <div className="pt-12">
          {!isActive ? (
            <m.button
              className="px-12 py-5 bg-[#064e3b] text-white rounded-full font-black tracking-widest uppercase text-[10px] shadow-xl shadow-green-900/20 hover:bg-green-800 transition-all font-sans"
              onClick={toggleTimer}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Initiate Ritual
            </m.button>
          ) : (
            <m.button
              className="px-8 py-3 rounded-full border border-green-200 text-green-800/40 hover:text-green-800 hover:bg-green-50 transition-all text-[10px] font-black uppercase tracking-widest font-sans"
              onClick={toggleTimer}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Conclude
            </m.button>
          )}
        </div>
      </div>

      {/* Progress Indicator */}
      {isActive && (
        <div className="absolute top-12 flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-green-900/20">
          <div className="w-8 h-px bg-green-900/10" />
          Cycle {cycleCount + 1}
          <div className="w-8 h-px bg-green-900/10" />
        </div>
      )}
    </div>
  );
};
