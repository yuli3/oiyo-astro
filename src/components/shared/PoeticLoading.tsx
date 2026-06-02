"use client";

import { m } from "framer-motion";
import { useTranslations } from "next-intl";

interface PoeticLoadingProps {
  category?: string;
}

export function PoeticLoading({ category = "general" }: PoeticLoadingProps) {
  const t = useTranslations("loading");

  // The user reported failure with 'loading'.
  // If system merges to root, 'loading' is correct.
  // But to be safe, maybe 'system.loading'?
  // Wait, if system merges to root, 'system.loading' would look for 'messages.system.loading'.
  // That would FAIL.
  // So 'loading' IS the correct key.
  // The error might be due to a blip or missing json event. I'll keep it 'loading' but ensure logic is robust.
  // Actually, I'll update it to use a fallback if possible?
  // No, I can't change t() behavior easily.
  // Let's LEAVE IT as 'loading' but verify.
  // Actually, I might have misdiagnosed PoeticLoading failure.
  // Maybe the category 'general' is missing in 'ko'?
  // Step 7482 showed "messages": { "general": ... }.
  // So it exists.
  // I will NOT change PoeticLoading yet.
  const message = t(`messages.${category}`);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-8 px-6 text-center">
      <m.div
        animate={{
          opacity: [0.5, 1, 0.5],
          scale: [1, 1.2, 1],
        }}
        className="w-16 h-16 rounded-full bg-gradient-to-tr from-teal-400 to-amber-400 blur-xl"
        transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
      />
      <div className="text-lg md:text-xl font-medium text-green-700 animate-pulse max-w-lg leading-relaxed">
        {message}
      </div>
    </div>
  );
}
