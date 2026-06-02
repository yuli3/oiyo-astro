"use client";

import { m } from "framer-motion";
import React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/system/utils";

interface ResultCardProps {
  actionLabel?: string;
  className?: string;
  delay?: number;
  description?: string;
  icon?: React.ReactNode;
  onAction?: () => void;
  subtitle: string;
  title: string;
  value: string;
  variant?: "amber" | "green" | "orange" | "teal";
}

export const ResultCard: React.FC<ResultCardProps> = ({
  actionLabel,
  className,
  delay = 0,
  description,
  icon,
  onAction,
  subtitle,
  title,
  value,
  variant = "green",
}) => {
  const variantStyles = {
    amber: "from-amber-500/10 hover:from-amber-500/20",
    green: "from-green-500/10 hover:from-green-500/20",
    orange: "from-orange-500/10 hover:from-orange-500/20",
    teal: "from-teal-500/10 hover:from-teal-500/20",
  };

  const textStyles = {
    amber: "text-amber-600 dark:text-amber-400",
    green: "text-green-600 dark:text-green-400",
    orange: "text-orange-600 dark:text-orange-400",
    teal: "text-teal-600 dark:text-teal-400",
  };

  return (
    <m.div
      initial={{ opacity: 0, scale: 0.95 }}
      transition={{ delay, duration: 0.5 }}
      viewport={{ once: true }}
      whileInView={{ opacity: 1, scale: 1 }}
    >
      <Card
        className={cn(
          "relative overflow-hidden group transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 border border-border bg-card rounded-[2rem]",
          className,
        )}
      >
        <div
          className={cn(
            "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 transition-colors duration-500 bg-gradient-to-br",
            variantStyles[variant],
          )}
        />

        <CardContent className="p-8 relative z-10">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
              {title}
            </h3>
            {icon && (
              <span className="text-2xl grayscale group-hover:grayscale-0 transition-all duration-500">
                {icon}
              </span>
            )}
          </div>

          <div className="mb-6">
            <div
              className={cn(
                "text-5xl font-black tracking-tighter mb-1 font-serif",
                textStyles[variant],
              )}
            >
              {value}
            </div>
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest opacity-60">
              {subtitle}
            </p>
          </div>

          {description && (
            <p className="text-sm text-green-900/70 leading-relaxed mb-6 font-medium">
              {description}
            </p>
          )}

          {onAction && (
            <button
              className={cn(
                "text-xs font-black uppercase tracking-widest hover:underline underline-offset-8 transition-all",
                textStyles[variant],
              )}
              onClick={onAction}
            >
              {actionLabel || "Explore Details →"}
            </button>
          )}
        </CardContent>
      </Card>
    </m.div>
  );
};
