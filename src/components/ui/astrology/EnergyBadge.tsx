"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/system/utils";

import { SystemIcon } from "./SystemIcon";

interface EnergyBadgeProps {
  className?: string;
  icon?: string;
  label: string;
  theme?: string;
}

const themeStyles: Record<string, string> = {
  default: "bg-stone-100 text-stone-800 border-stone-200 hover:bg-stone-200",
  earth: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200",
  fire: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
  metal: "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200",
  mystic: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200",
  water: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
  wood: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
};

export function EnergyBadge({
  className,
  icon,
  label,
  theme = "default",
}: EnergyBadgeProps) {
  const styleClass = themeStyles[theme] || themeStyles.default;

  return (
    <Badge
      className={cn(
        "gap-1.5 pl-2 pr-3 py-1 text-sm font-medium border",
        styleClass,
        className,
      )}
    >
      {icon && (
        <SystemIcon
          className="opacity-80"
          icon={icon}
          size="sm"
          theme={theme}
        />
      )}
      <span>{label}</span>
    </Badge>
  );
}
