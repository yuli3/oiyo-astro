"use client";

import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/system/utils";

interface ReasoningBubbleProps {
  className?: string;
  explanation: string;
  primarySource: string;
}

export function ReasoningBubble({
  className,
  explanation,
  primarySource,
}: ReasoningBubbleProps) {
  // NOTE: If using i18n keys for static labels, connect here.
  // For now assuming static string or passed prop.

  return (
    <div
      className={cn(
        "relative group flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border border-indigo-100/50 backdrop-blur-sm",
        "hover:from-indigo-100/50 hover:to-purple-100/50 transition-colors duration-300",
        className,
      )}
    >
      <div className="flex-shrink-0 mt-0.5">
        <Sparkles className="w-4 h-4 text-purple-500" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
          Because of {primarySource}
        </div>
        <p className="text-sm text-stone-600 leading-relaxed italic">
          &quot;{explanation}&quot;
        </p>
      </div>
    </div>
  );
}
