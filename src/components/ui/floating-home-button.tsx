"use client";
import { m, useScroll, useTransform } from "framer-motion";
import { Home } from "lucide-react";
import Link from "next/link";
import React from "react";

import type { Locale } from "@/i18n";

import { ROUTES } from "@/registry/routes";

export const FloatingHomeButton = ({ locale }: { locale: string }) => {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 200], [0, 1]);
  const pointerEvents = useTransform(scrollY, [0, 200], ["none", "auto"]);

  return (
    <m.div
      className="fixed bottom-6 right-6 z-40"
      style={{ opacity, pointerEvents: pointerEvents as any }}
    >
      <Link
        aria-label="Return to Ontology Home"
        href={ROUTES.ONTOLOGY.ROOT.path(locale as Locale)}
      >
        <div className="w-12 h-12 bg-background border border-border rounded-full flex items-center justify-center transition-colors hover:bg-muted text-foreground">
          <Home aria-hidden="true" className="w-5 h-5" />
        </div>
      </Link>
    </m.div>
  );
};
