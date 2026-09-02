"use client";

import { m } from "framer-motion";
import { Sparkles } from "lucide-react";
import React from "react";

import { cn } from "@/lib/system/utils";

interface CoreNumberCardProps {
  color?: string;
  delay?: number;
  description: string;
  isMasterNumber?: boolean;
  number: number;
  title: string;
}

export function CoreNumberCard({
  color = "bg-primary",
  delay = 0,
  description,
  isMasterNumber = false,
  number,
  title,
}: CoreNumberCardProps) {
  return (
    <m.div
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "relative overflow-hidden rounded-3xl p-8 backdrop-blur-xl border transition-all duration-300",
        isMasterNumber
          ? "bg-amber-500/5 border-amber-500/20 shadow-xl shadow-amber-900/5"
          : "bg-white/40 border-green-500/10 hover:border-green-500/30",
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{
        boxShadow: "0 10px 30px -10px rgba(6, 78, 59, 0.1)",
        y: -5,
      }}
    >
      {/* Background glow effect */}
      <div
        className={cn(
          "absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[50px] opacity-10",
          isMasterNumber ? "bg-amber-500" : color,
        )}
      />

      <div className="relative z-10 flex flex-col items-center text-center gap-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-green-900/40">
          {title}
        </h3>

        <div className="relative">
          <span
            className={cn(
              "text-6xl font-black italic font-serif tracking-tighter bg-clip-text text-transparent bg-gradient-to-b",
              isMasterNumber
                ? "from-amber-600 to-amber-900 drop-shadow-sm"
                : "from-[#064e3b] to-green-600",
            )}
          >
            {number}
          </span>
          {isMasterNumber && (
            <m.div
              animate={{ rotate: 360 }}
              className="absolute -top-2 -right-4"
              transition={{ duration: 10, ease: "linear", repeat: Infinity }}
            >
              <Sparkles className="w-5 h-5 text-amber-500/50" />
            </m.div>
          )}
        </div>

        <p className="text-sm font-medium text-green-900/70 leading-relaxed font-serif">
          {description}
        </p>

        {isMasterNumber && (
          <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-amber-700 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            Master Number
          </div>
        )}
      </div>
    </m.div>
  );
}
