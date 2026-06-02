/* eslint-disable no-restricted-syntax */
"use client";

import { m } from "framer-motion";
import {
  ChevronLeft,
  Settings as SettingsIcon,
  Sparkles,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

import { withErrorBoundary } from "@/components/shared/ErrorBoundary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ResonanceMandalaLazy } from "@/lib/system/lazy/dynamic-imports";

interface TemplateCUserBaseProps {
  actions?: React.ReactNode;
  auraColor?: string; // hex
  backPath?: string;
  children: React.ReactNode;
  icon?: React.ElementType;
  subtitle: string;
  title: string;
}

export const TemplateCUserBase = withErrorBoundary(
  function TemplateCUserBase({
    actions,
    auraColor = "#059669", // Emerald default
    backPath,
    children,
    icon: Icon = Sparkles,
    subtitle,
    title,
  }: TemplateCUserBaseProps) {
    const router = useRouter();

    return (
      <div className="min-h-screen bg-[#f0f9f1] font-sans text-[#064e3b] relative overflow-hidden">
        {/* Dynamic Aura Background */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-multiply">
          <ResonanceMandalaLazy
            styles={
              {
                "--resonance-blur": "150px",
                "--resonance-color": auraColor,
                "--resonance-opacity": "0.4",
              } as any
            }
          />
          <div className="absolute inset-0 bg-[#f0f9f1]/80" />
        </div>

        <div className="relative z-10 p-6 md:p-12 max-w-5xl mx-auto space-y-12">
          <header className="space-y-6">
            <div className="flex items-center justify-between">
              {backPath ? (
                <Button
                  className="text-green-900/70 hover:text-green-900 rounded-full hover:bg-green-900/5 -ml-4 gap-2"
                  onClick={() => router.push(backPath)}
                  variant="ghost"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-widest">
                    Back
                  </span>
                </Button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">{actions}</div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-white/60 border border-white/60 backdrop-blur-md shadow-sm">
                  <Icon className="w-6 h-6" style={{ color: auraColor }} />
                </div>
                <Badge className="bg-white/60 border-white/60 text-green-800 hover:bg-white/80 px-3 py-1 uppercase tracking-widest font-black text-[10px] shadow-sm">
                  Sanctuary User Space
                </Badge>
              </div>

              <div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-tight text-[#064e3b] drop-shadow-sm">
                  {title}
                </h1>
                <p className="text-lg text-green-900 font-serif mt-2 max-w-2xl">
                  {subtitle}
                </p>
              </div>
            </div>
          </header>

          <m.div
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-8"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.1 }}
          >
            {children}
          </m.div>
        </div>
      </div>
    );
  },
  {
    message:
      "We could not stabilize the user space. Please refresh to re-enter.",
    title: "Sanctuary Access Error",
  },
);
