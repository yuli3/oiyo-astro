"use client";

import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { cn } from "@/lib/system/utils";

interface SystemIconProps {
  className?: string;
  icon: string;
  size?: "lg" | "md" | "sm" | "xl";
  theme?: string; // e.g., "fire", "water", "metal"
}

const sizeClasses = {
  lg: "w-8 h-8",
  md: "w-6 h-6",
  sm: "w-4 h-4",
  xl: "w-12 h-12",
};

const themeGlows: Record<string, string> = {
  default: "text-stone-500",
  earth: "text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.5)]",
  fire: "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]",
  metal: "text-slate-400 drop-shadow-[0_0_8px_rgba(148,163,184,0.5)]",
  mystic: "text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]",
  water: "text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]",
  wood: "text-green-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]",
};

export function SystemIcon({
  className,
  icon,
  size = "md",
  theme = "default",
}: SystemIconProps) {
  const glowClass = themeGlows[theme] || themeGlows.default;

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className,
      )}
    >
      <DynamicIcon
        className={cn(
          sizeClasses[size],
          glowClass,
          "transition-all duration-300",
        )}
        name={icon}
      />
    </div>
  );
}
