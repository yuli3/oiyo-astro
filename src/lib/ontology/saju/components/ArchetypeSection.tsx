"use client";

import { m } from "framer-motion";
import { ArrowRight, Compass, Shield, Sparkles, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n";
import { ROUTES } from "@/registry/routes";

export function PrimalArchetypeSection() {
  const t = useTranslations("fortune");
  const locale = useLocale();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-gradient-to-b from-teal-300/10 via-transparent to-transparent blur-3xl opacity-50 mix-blend-multiply pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-100 shadow-sm backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span className="text-sm font-bold text-teal-800 uppercase tracking-wider">
              {t("primal-origin.landing.badge")}
            </span>
          </div>

          <h2 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight text-[#064e3b]">
            {t("primal-origin.landing.title")}
          </h2>

          <p className="text-xl text-green-800 font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
            {t("primal-origin.landing.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            {/* Note: We will need to route this to the new test location */}
            <Link href={ROUTES.ONTOLOGY.SAJU.path(locale as Locale)}>
              <Button
                className="h-16 px-10 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-lg shadow-xl shadow-teal-900/10 group transition-all hover:scale-105 active:scale-95"
                size="lg"
              >
                {t("primal-origin.landing.cta")}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Cards Grid as Visual */}
        <div className="grid gap-6 max-w-md mx-auto lg:max-w-none w-full">
          <FeatureCard
            description={t("primal-origin.landing.features.triple.desc")}
            icon={<Shield className="w-6 h-6" />}
            title={t("primal-origin.landing.features.triple.title")}
          />
          <FeatureCard
            description={t("primal-origin.landing.features.celestial.desc")}
            icon={<Compass className="w-6 h-6" />}
            title={t("primal-origin.landing.features.celestial.title")}
          />
          <FeatureCard
            description={t("primal-origin.landing.features.genetic.desc")}
            icon={<Star className="w-6 h-6" />}
            title={t("primal-origin.landing.features.genetic.title")}
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  description,
  icon,
  title,
}: {
  description: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <m.div
      className="p-6 rounded-3xl bg-white/40 border border-white/60 shadow-lg shadow-teal-900/5 backdrop-blur-xl flex items-start gap-4 hover:bg-white/60 transition-colors"
      initial={{ opacity: 0, x: 20 }}
      viewport={{ once: true }}
      whileInView={{ opacity: 1, x: 0 }}
    >
      <div className="p-3 shrink-0 rounded-2xl bg-teal-100 text-teal-700">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-bold text-[#064e3b] mb-1">{title}</h3>
        <p className="text-green-800/70 text-sm leading-relaxed font-medium">
          {description}
        </p>
      </div>
    </m.div>
  );
}
