"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

// Default Fallback Messages
const FALLBACK_MESSAGES = {
  general: "Aligning with the cosmos...",
  roots: "Connecting to ancient roots...",
  stars: "Tracing the stars...",
};

// Keys from system/loading.json
const MESSAGE_KEYS = [
  "general",
  "stars",
  "rainbow",
  "flowers",
  "fox",
  "stardust",
  "oracle",
  "cards",
  "moon",
  "dreams",
  "magic",
  "whale",
  "trees",
  "roots",
  "ontology",
  "resonance",
  "fortune",
  "finance",
  "cat_dog",
  "milky_way",
  "moonlight",
  "wave_secret",
  "saju",
];

interface PoeticLoaderProps {
  categoryId?: string;
  variant?: "default" | "inline" | "minimal";
}

export function PoeticLoader({
  categoryId,
  variant = "default",
}: PoeticLoaderProps = {}) {
  let t: (key: string) => string;
  let hasContext = true;

  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    t = useTranslations("loading");
  } catch {
    hasContext = false;
    // Fallback translation function
    t = (key: string) => (FALLBACK_MESSAGES as any)[key] || "Loading...";
  }

  const [keyIndex, setKeyIndex] = useState(0);

  // Shuffle keys on mount to provide variety, but keep restart consistent per session if needed
  const [shuffledKeys, setShuffledKeys] = useState<string[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time random shuffle on mount; no external system available
    setShuffledKeys([...MESSAGE_KEYS].sort(() => Math.random() - 0.5));
  }, []);

  useEffect(() => {
    if (shuffledKeys.length === 0) return;

    const timer = setInterval(() => {
      setKeyIndex((prev) => (prev + 1) % shuffledKeys.length);
    }, 3000); // 3 seconds per message for readability

    return () => clearInterval(timer);
  }, [shuffledKeys]);

  if (shuffledKeys.length === 0) return null;

  const currentKey = shuffledKeys[keyIndex];

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-[#f0f9f1] min-h-screen fixed inset-0 z-50">
      {/* Sacred Iconography */}
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full animate-pulse" />
        <div className="relative w-24 h-24 bg-white rounded-3xl border border-green-100 shadow-xl shadow-green-900/5 flex items-center justify-center">
          <Loader2
            className="w-10 h-10 text-green-600 animate-spin"
            strokeWidth={1.5}
          />
        </div>

        {/* Orbits */}
        <motion.div
          animate={{ rotate: 360 }}
          className="absolute -inset-4 border border-dashed border-green-300/30 rounded-full"
          transition={{ duration: 20, ease: "linear", repeat: Infinity }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          className="absolute -inset-8 border border-dotted border-green-200/20 rounded-full"
          transition={{ duration: 15, ease: "linear", repeat: Infinity }}
        />
      </div>

      {/* Poetic Text Carousel */}
      <div className="h-32 flex flex-col items-center justify-center max-w-md w-full px-4">
        <AnimatePresence mode="wait">
          <motion.div
            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            className="space-y-3"
            exit={{ filter: "blur(4px)", opacity: 0, y: -10 }}
            initial={{ filter: "blur(4px)", opacity: 0, y: 10 }}
            key={currentKey}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <p className="text-xl md:text-2xl font-serif text-green-900 leading-relaxed tracking-wide">
              {t(currentKey)}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Subtle Progress Bar */}
      <div className="mt-12 w-64 h-1 bg-green-100/50 rounded-full overflow-hidden">
        <motion.div
          animate={{ x: "100%" }}
          className="h-full bg-gradient-to-r from-green-400 to-teal-500"
          initial={{ x: "-100%" }}
          transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity }}
        />
      </div>
    </div>
  );
}
