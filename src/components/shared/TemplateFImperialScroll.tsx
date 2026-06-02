/* eslint-disable no-restricted-syntax */
"use client";

import { m, useScroll, useSpring } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Feather,
  MoreHorizontal,
  Share2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";

import { withErrorBoundary } from "@/components/shared/ErrorBoundary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResonanceMandalaLazy } from "@/lib/system/lazy/dynamic-imports";

interface OracleNote {
  content: string;
  id: string;
  triggerParagraphIndex: number; // Index of paragraph to trigger note
}

interface TemplateFImperialScrollProps {
  author?: string;
  background?: React.ReactNode;
  children?: React.ReactNode;
  content?: React.ReactNode; // MDX Content or text (Reading Mode)
  locale: string;
  mode?: "scroll" | "snap"; // scroll: reading, snap: section-based
  onBack?: () => void;
  oracleNotes?: OracleNote[];
  readingTime?: number;
  sections?: Array<{
    component: React.ReactNode;
    icon?: React.ReactNode;
    id: string;
    subtitle?: string;
    title: string;
  }>;
  subtitle: string;
  tags?: string[];
  themeColor?: string;
  title: string;
}

export const TemplateFImperialScroll = withErrorBoundary(
  function TemplateFImperialScroll({
    author,
    background,
    children,
    content,
    locale,
    mode = "scroll",
    onBack,
    oracleNotes = [],
    readingTime,
    sections = [],
    subtitle,
    tags = [],
    themeColor = "#10B981",
    title,
  }: TemplateFImperialScrollProps) {
    const t = useTranslations("common");
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
      damping: 30,
      restDelta: 0.001,
      stiffness: 100,
    });

    const [activeNote, setActiveNote] = useState<null | OracleNote>(null);

    // Imperial Theme Styles
    const bgStyle = { backgroundColor: "#f0f9f1", color: "#064e3b" };
    const accentColor = themeColor;

    return (
      <div
        className={`min-h-dvh font-serif selection:bg-green-200 selection:text-green-900 pb-safe ${mode === "snap" ? "h-dvh overflow-y-scroll snap-y snap-mandatory no-scrollbar" : ""}`}
        style={bgStyle}
      >
        {/* Progression Bar */}
        <m.div
          className="fixed top-0 left-0 right-0 h-1 bg-green-700 origin-left z-50"
          style={{ scaleX }}
        />

        {/* Navigation Header (Sticky) */}
        <header className="fixed top-0 left-0 right-0 z-40 bg-[#f0f9f1]/80 backdrop-blur-md border-b border-green-900/5 px-6 py-4 flex items-center justify-between">
          <Button
            className="hover:bg-green-900/5 rounded-full"
            onClick={onBack}
            size="icon"
            variant="ghost"
          >
            <ArrowLeft className="w-5 h-5 text-green-800" />
          </Button>
          <span className="text-xs font-black uppercase tracking-[0.2em] text-green-800/40 hidden md:block">
            {t("scroll.title")}
          </span>
          <div className="flex gap-2">
            <Button
              className="hover:bg-green-900/5 rounded-full"
              size="icon"
              variant="ghost"
            >
              <Share2 className="w-4 h-4 text-green-800" />
            </Button>
            <Button
              className="hover:bg-green-900/5 rounded-full"
              size="icon"
              variant="ghost"
            >
              <BookOpen className="w-4 h-4 text-green-800" />
            </Button>
          </div>
        </header>

        <main className={`relative ${mode === "snap" ? "" : "pt-32 pb-32"}`}>
          {/* Background Layer */}
          <div className="fixed inset-0 pointer-events-none z-0">
            {background ? (
              background
            ) : (
              <div className="opacity-5 w-full h-full">
                <ResonanceMandalaLazy
                  styles={{ "--resonance-color": accentColor } as any}
                />
              </div>
            )}
          </div>

          {mode === "scroll" ? (
            <>
              <article className="relative z-10 max-w-3xl mx-auto px-6 md:px-12 space-y-16">
                {/* Header */}
                <header className="text-center space-y-8">
                  <div className="flex gap-2 justify-center">
                    {tags.map((tag) => (
                      <Badge
                        className="border-green-900/20 text-green-700 uppercase tracking-wider text-[10px]"
                        key={tag}
                        variant="outline"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight text-[#064e3b]">
                    {title}
                  </h1>
                  <p className="text-xl md:text-2xl text-green-800/70 font-sans font-light leading-relaxed max-w-2xl mx-auto">
                    {subtitle}
                  </p>
                  {author && (
                    <div className="flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest text-green-900/40 font-sans">
                      <Feather className="w-4 h-4" />
                      <span>{author}</span>
                      {readingTime && <span>• {readingTime} min read</span>}
                    </div>
                  )}
                </header>

                <div className="prose prose-xl prose-green prose-headings:font-serif prose-headings:font-black prose-p:font-serif prose-p:leading-[2] text-green-900/80 mx-auto">
                  {content}
                </div>

                <footer className="pt-24 text-center space-y-8 border-t border-green-200">
                  <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center text-green-800">
                    <Feather className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-green-900/40">
                    {t("scroll.end")}
                  </p>
                </footer>
              </article>
              {children}
            </>
          ) : (
            <div className="h-full">
              {/* Snap Sections (from Template B) */}
              <section className="h-dvh snap-start flex flex-col items-center justify-center p-8 pb-safe relative">
                <div className="relative z-10 text-center space-y-8 max-w-4xl">
                  <m.div
                    animate={{ opacity: 1 }}
                    initial={{ opacity: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Badge
                      className="px-4 py-1 uppercase tracking-widest font-black mb-6 border-2"
                      style={{ borderColor: accentColor, color: accentColor }}
                      variant="outline"
                    >
                      {t("scroll.visualization")}
                    </Badge>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-none text-[#064e3b]">
                      {title}
                    </h1>
                    <p className="text-xl md:text-2xl text-green-800/70 font-serif mt-6">
                      {subtitle}
                    </p>
                  </m.div>
                </div>
              </section>

              {sections.map((section, idx) => (
                <section
                  className="min-h-screen snap-start flex items-center justify-center p-4 md:p-12 relative"
                  key={section.id}
                >
                  <div className="absolute top-24 left-12 flex items-center gap-3 opacity-30">
                    <span className="text-6xl font-black text-green-900/5">
                      {(idx + 1).toString().padStart(2, "0")}
                    </span>
                    <div className="text-sm font-bold uppercase tracking-widest">
                      <div style={{ color: accentColor }}>{section.title}</div>
                      <div className="text-green-800/40 text-[10px]">
                        {section.subtitle}
                      </div>
                    </div>
                  </div>
                  <m.div
                    className="w-full max-w-5xl bg-white/60 border border-white/60 rounded-[3rem] p-6 md:p-12 backdrop-blur-3xl shadow-xl shadow-green-900/5"
                    initial={{ opacity: 0, y: 30 }}
                    transition={{ duration: 0.8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                  >
                    {section.component}
                  </m.div>
                </section>
              ))}
            </div>
          )}

          {/* Oracle Notes Sidebar (Draft Implementation) */}
          {oracleNotes.length > 0 && (
            <aside className="hidden xl:block fixed right-8 top-1/4 w-64 space-y-4 pointer-events-none">
              {oracleNotes.map((note) => (
                <m.div
                  className="bg-white/80 backdrop-blur shadow-sm p-6 rounded-2xl border border-green-100 text-sm text-green-800 font-sans pointer-events-auto"
                  initial={{ opacity: 0, x: 20 }}
                  key={note.id}
                  viewport={{ margin: "-20% 0px -20% 0px" }}
                  whileInView={{ opacity: 1, x: 0 }}
                >
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-green-500">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Oracle Note
                  </div>
                  {note.content}
                </m.div>
              ))}
            </aside>
          )}
        </main>
      </div>
    );
  },
  {
    message: "The scroll's ink has faded. We are restoring the text.", // Hardcoded fallback for error boundary
    title: "Scroll Unreadable",
  },
);
