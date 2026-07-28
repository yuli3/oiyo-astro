"use client";

import { AnimatePresence, m } from "framer-motion";
import Fuse from "fuse.js";
import {
  ArrowRight,
  BookOpen,
  Command,
  Layout,
  Search,
  X,
  Zap,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { useUserHistory } from "@/hooks/useUserHistory";
import { getSearchableItems, SearchResult } from "@/lib/system/search-data";

interface GlobalSearchProps {
  locale: string;
}

export function GlobalSearch({ locale }: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const { history } = useUserHistory();
  const searchableItems = useMemo(
    () => getSearchableItems(locale, history),
    [locale, history],
  );
  const fuse = useMemo(
    () =>
      new Fuse(searchableItems, {
        keys: ["title", "description", "keywords"],
        threshold: 0.3,
      }),
    [searchableItems],
  );

  const results = useMemo(() => {
    if (query.trim() === "") {
      // Prioritize Recommended Content
      const recommendedIds = ["daily", "mbti", "saju", "resonance"];

      const recommendations = searchableItems
        .filter((item) => recommendedIds.includes(item.id))
        .sort(
          (a, b) => recommendedIds.indexOf(a.id) - recommendedIds.indexOf(b.id),
        );

      // Fill remaining spots with other hubs
      const otherHubs = searchableItems
        .filter(
          (item) => item.type === "hub" && !recommendedIds.includes(item.id),
        )
        .slice(0, 5 - recommendations.length);

      return [...recommendations, ...otherHubs];
    } else {
      const searchRes = fuse.search(query).map((r) => r.item);
      return searchRes.slice(0, 8);
    }
  }, [query, fuse, searchableItems]);

  // Reset selection when query changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (item: SearchResult) => {
    setIsOpen(false);
    router.push(item.href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === "Enter" && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    }
  };

  return (
    <>
      <button
        aria-label="Search the sanctuary (⌘K)"
        className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-green-50 text-green-950 rounded-full transition-all border border-green-100 hover:border-green-200 shadow-sm group"
        onClick={() => setIsOpen(true)}
      >
        <Search className="w-4 h-4 group-hover:text-green-600 transition-colors" />
        <span className="text-xs font-black hidden md:inline uppercase tracking-widest text-[#064e3b]">
          Search
        </span>
        <kbd className="hidden md:flex h-5 select-none items-center gap-1 rounded border border-green-200 bg-green-50 px-1.5 font-mono text-[10px] font-medium text-green-950 opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 font-sans">
            <m.div
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-green-900/20 backdrop-blur-md"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            <m.div
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative w-full max-w-2xl bg-white/95 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(6,78,59,0.1)] overflow-hidden border border-white/60 backdrop-blur-3xl"
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              initial={{ opacity: 0, scale: 0.98, y: -10 }}
            >
              <div className="p-6 border-b border-green-100 flex items-center gap-4 bg-green-50/50">
                <Search className="w-6 h-6 text-green-500 ml-2" />
                <input
                  className="flex-1 bg-transparent border-none outline-none text-xl font-bold text-[#064e3b] placeholder:text-green-950/60 py-2"
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Navigate the Sanctum..."
                  ref={inputRef}
                  value={query}
                />
                <button
                  aria-label="Close search"
                  className="p-2 hover:bg-green-100 rounded-2xl transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-5 h-5 text-green-950" />
                </button>
              </div>

              <div className="max-h-[450px] overflow-y-auto p-4 scrollbar-hide">
                {results.length > 0 ? (
                  <div className="space-y-2">
                    {results.map((item, index) => {
                      const isSelected = index === selectedIndex;
                      return (
                        <div
                          className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border ${
                            isSelected
                              ? "bg-[#064e3b] border-[#064e3b] text-white shadow-lg shadow-green-900/20"
                              : "bg-white border-green-100 text-green-800 hover:bg-green-50"
                          }`}
                          key={`${item.id}-${index}`}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setSelectedIndex(index)}
                        >
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm transition-colors ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : "bg-green-50 text-green-700"
                            }`}
                          >
                            {(() => {
                              // If it's a known Lucide icon, render it
                              // Convert kebab-case (e.g. layout-grid) to PascalCase (LayoutGrid)
                              const pascalName = item.emoji
                                .split("-")
                                .map(
                                  (part) =>
                                    part.charAt(0).toUpperCase() +
                                    part.slice(1),
                                )
                                .join("");

                              // @ts-ignore - Dynamic access to Lucide icons
                              const IconComponent =
                                (LucideIcons as any)[pascalName] ||
                                (LucideIcons as any)[item.emoji];

                              if (IconComponent) {
                                return <IconComponent className="w-6 h-6" />;
                              }
                              // Fallback to text (emoji char)
                              return item.emoji;
                            })()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3
                                className={`font-black text-lg truncate ${isSelected ? "text-white" : "text-[#064e3b]"}`}
                              >
                                {item.title}
                              </h3>
                              <Badge
                                className={`text-[10px] h-4 px-1.5 ${
                                  item.type === "hub"
                                    ? "bg-amber-100 text-amber-700 border-amber-200"
                                    : item.type === "artifact"
                                      ? "bg-green-100 text-green-700 border-green-200"
                                      : "bg-green-100 text-green-700 border-green-200"
                                }`}
                              >
                                {item.type.toUpperCase()}
                              </Badge>
                            </div>
                            <p
                              className={`text-sm font-medium truncate font-sans ${isSelected ? "text-green-100" : "text-green-950/70"}`}
                            >
                              {item.description}
                            </p>
                          </div>
                          {isSelected && (
                            <m.div
                              animate={{ opacity: 1, x: 0 }}
                              initial={{ opacity: 0, x: -10 }}
                            >
                              <ArrowRight className="w-5 h-5 text-green-200" />
                            </m.div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-20 text-center space-y-6">
                    <div className="inline-block p-6 bg-green-50 rounded-full border border-green-100">
                      <Layout className="w-10 h-10 text-green-300" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[#064e3b] font-black text-xl">
                        No paths found
                      </p>
                      <p className="text-green-800 text-sm">
                        The oracle has no records for &quot;{query}&quot;
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5 bg-green-50 text-[10px] font-black uppercase tracking-[0.2em] text-[#064e3b]/40 flex items-center justify-between border-t border-green-100">
                <div className="flex gap-6">
                  <span className="flex items-center gap-2 px-2 py-1 bg-white border border-green-100 rounded-md shadow-sm">
                    <Command className="w-3 h-3" /> Enter to select
                  </span>
                  <span className="flex items-center gap-2 px-2 py-1 bg-white border border-green-100 rounded-md shadow-sm">
                    <ArrowRight className="w-3 h-3 rotate-90" /> Navigate
                  </span>
                </div>
                <span className="opacity-60">SSOT | Discovery Engine</span>
              </div>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md border font-black uppercase tracking-tighter ${className}`}
    >
      {children}
    </span>
  );
}
