"use client";

import { m } from "framer-motion";
import { ArrowUpRight, BookOpen, Compass, Heart, Lock, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import React, { type ReactNode } from "react";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ROUTES } from "@/constants/routes";
import { Locale } from "@/i18n";
import { cn } from "@/lib/utils";

interface OntologyCardProps {
  children?: ReactNode; // Main content (Value)
  className?: string;
  colorTheme?:
    | "amber"
    | "blue"
    | "cyan"
    | "green"
    | "indigo"
    | "purple"
    | "rose"
    | "slate";
  colSpan?: 1 | 2;
  deepInsightSlug?: string;
  description: string;
  dialogContent?: ReactNode;
  href?: string;
  icon?: React.ElementType;
  iconNode?: ReactNode;
  rowSpan?: 1 | 2;
  subtitle?: string;
  title: string;
}

const themeStyles = {
  amber: {
    bg: "bg-[#fcfafa]",
    border: "border-amber-100",
    hoverBorder: "hover:border-amber-200",
    icon: "text-amber-700",
    iconBg: "bg-amber-50",
    text: "text-amber-950",
    textMuted: "text-amber-900/80",
  },
  blue: {
    bg: "bg-[#eff6ff]",
    border: "border-blue-100",
    hoverBorder: "hover:border-blue-200",
    icon: "text-blue-700",
    iconBg: "bg-blue-50",
    text: "text-blue-950",
    textMuted: "text-blue-900/80",
  },
  cyan: {
    bg: "bg-[#f0fdff]",
    border: "border-cyan-100",
    hoverBorder: "hover:border-cyan-200",
    icon: "text-cyan-700",
    iconBg: "bg-cyan-50",
    text: "text-cyan-950",
    textMuted: "text-cyan-900/80",
  },
  green: {
    bg: "bg-[#f0fdf4]",
    border: "border-green-100",
    hoverBorder: "hover:border-green-200",
    icon: "text-green-700",
    iconBg: "bg-green-50",
    text: "text-green-950",
    textMuted: "text-green-900/80",
  },
  indigo: {
    bg: "bg-[#eff6ff]",
    border: "border-indigo-100",
    hoverBorder: "hover:border-indigo-200",
    icon: "text-indigo-700",
    iconBg: "bg-indigo-50",
    text: "text-indigo-950",
    textMuted: "text-indigo-900/80",
  },
  purple: {
    bg: "bg-[#faf5ff]",
    border: "border-purple-100",
    hoverBorder: "hover:border-purple-200",
    icon: "text-purple-700",
    iconBg: "bg-purple-50",
    text: "text-purple-950",
    textMuted: "text-purple-900/80",
  },
  rose: {
    bg: "bg-[#fff1f2]",
    border: "border-rose-100",
    hoverBorder: "hover:border-rose-200",
    icon: "text-rose-700",
    iconBg: "bg-rose-50",
    text: "text-rose-950",
    textMuted: "text-rose-900/80",
  },
  slate: {
    bg: "bg-[#f8fafc]",
    border: "border-slate-100",
    hoverBorder: "hover:border-slate-200",
    icon: "text-slate-700",
    iconBg: "bg-slate-50",
    text: "text-slate-950",
    textMuted: "text-slate-900/80",
  },
};

export function OntologyCard({
  children,
  className,
  colorTheme = "green",
  colSpan = 1,
  deepInsightSlug,
  description,
  dialogContent,
  href,
  icon: Icon,
  iconNode,
  rowSpan = 1,
  subtitle,
  title,
}: OntologyCardProps) {
  const locale = useLocale();
  const styles = themeStyles[colorTheme];
  const t = useTranslations("dashboard");

  const CardContent = (
    <m.button
      className={cn(
        "relative group overflow-hidden rounded-[2rem] p-6 transition-all duration-300 flex flex-col justify-between h-full border shadow-sm hover:shadow-lg text-left w-full",
        styles.bg,
        styles.border,
        styles.hoverBorder,
        colSpan === 2 ? "md:col-span-2" : "md:col-span-1",
        rowSpan === 2 ? "md:row-span-2 min-h-[300px]" : "md:row-span-1",
        className,
      )}
      type="button"
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Background Icon (Decorative) - Only if Icon component is provided */}
      {Icon && (
        <div
          className={cn(
            "absolute -right-6 -bottom-6 opacity-5 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12",
            styles.text,
          )}
        >
          <Icon className="w-48 h-48" />
        </div>
      )}

      {/* Header */}
      <div className="relative z-10 flex justify-between items-start">
        <div className="flex items-center gap-3">
          {(Icon || iconNode) && (
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-inner",
                styles.iconBg,
              )}
            >
              {Icon ? (
                <Icon className={cn("w-5 h-5", styles.icon)} />
              ) : (
                iconNode
              )}
            </div>
          )}
          <div>
            <div
              className={cn(
                "text-[10px] font-black uppercase tracking-[0.2em] mb-0.5",
                styles.textMuted,
              )}
            >
              {subtitle || "Archetype"}
            </div>
            <h3
              className={cn(
                "text-lg font-bold font-serif italic leading-none",
                styles.text,
              )}
            >
              {title}
            </h3>
          </div>
        </div>

        <div
          className={cn(
            "opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full",
            styles.iconBg,
          )}
        >
          <ArrowUpRight className={cn("w-4 h-4", styles.icon)} />
        </div>
      </div>

      {/* Main Content (Children) */}
      <div className="relative z-10 mt-6 mb-4 flex-grow">{children}</div>

      {/* Footer / Description */}
      <div className="relative z-10 pt-4 border-t border-black/5">
        <p
          className={cn(
            "text-xs font-medium leading-relaxed",
            styles.textMuted,
          )}
        >
          {description}
        </p>
      </div>
    </m.button>
  );

  if (dialogContent) {
    return (
      <Dialog>
        <DialogTrigger asChild>{CardContent}</DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-3xl border-white/20">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-4">
              {(Icon || iconNode) && (
                <div
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg",
                    styles.iconBg,
                  )}
                >
                  {Icon ? (
                    <Icon className={cn("w-6 h-6", styles.icon)} />
                  ) : (
                    iconNode
                  )}
                </div>
              )}
              <div>
                <DialogTitle
                  className={cn(
                    "text-2xl font-serif italic font-black",
                    styles.text,
                  )}
                >
                  {title}
                </DialogTitle>
                <DialogDescription className="text-xs uppercase tracking-widest font-bold opacity-60">
                  {subtitle}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="mt-4 space-y-6">{dialogContent}</div>
        </DialogContent>
      </Dialog>
    );
  }

  return CardContent;
}
