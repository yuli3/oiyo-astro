"use client";

import { m, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Pyramid, Sparkles, TreeDeciduous } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import React from "react";

import { BirthSymbol } from "@/lib/data-layer/shards/fate-symbols";
import { CelticTreeSign } from "@/lib/ontology/celtic/types";
import { EgyptianCoordinates } from "@/lib/ontology/egyptian/types";

interface MythicPantheonProps {
  mythos: {
    celtic: CelticTreeSign;
    egyptian: EgyptianCoordinates;
    symbols: BirthSymbol;
  };
}

export function MythicPantheon({ mythos }: MythicPantheonProps) {
  const locale = useLocale();
  const t = useTranslations("origin.pantheon");
  const tEgypt = useTranslations("egyptian");
  const tCeltic = useTranslations("celtic");
  const getLoc = (obj: any) => obj?.[locale] || obj?.en || "";

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-4 px-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-500/30" />
        <h2 className="text-sm uppercase tracking-[0.3em] text-amber-500/70 font-bold">
          {t("title")}
        </h2>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-500/30" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <TiltCard
          borderColor="border-amber-500/20"
          gradient="from-amber-900/40 to-yellow-900/40"
          icon={<Pyramid className="w-6 h-6 text-amber-200" />}
          subTitle={tEgypt(mythos.egyptian.patronDeity.nameKey as any)}
          title={t("egyptianGuardian")}
        >
          <div className="space-y-4">
            <p className="text-sm text-green-800/50 leading-relaxed italic">
              &quot;{tEgypt(mythos.egyptian.patronDeity.descriptionKey as any)}
              &quot;
            </p>
            <div className="text-xs text-amber-500/60 uppercase tracking-wider font-bold">
              {tEgypt(mythos.egyptian.patronDeity.attributesKey as any)}
            </div>
          </div>
        </TiltCard>

        <TiltCard
          borderColor="border-green-500/20"
          gradient="from-green-900/40 to-green-900/40"
          icon={<TreeDeciduous className="w-6 h-6 text-green-200" />}
          subTitle={tCeltic(mythos.celtic.treeKey as any)}
          title={t("celticTreeSign")}
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center text-green-200/50 text-xs uppercase tracking-widest font-mono">
              <span>{mythos.celtic.ogham}</span>
              <span>{tCeltic(mythos.celtic.archetypeKey as any)}</span>
            </div>
            <p className="text-sm text-green-800/50 leading-relaxed">
              {tCeltic(mythos.celtic.descriptionKey as any)}
            </p>
          </div>
        </TiltCard>

        <TiltCard
          borderColor="border-green-500/20"
          gradient="from-green-900/40 to-green-950/40"
          icon={<Sparkles className="w-6 h-6 text-green-200" />}
          subTitle={getLoc(mythos.symbols.star.name)}
          title={t("birthSymbols")}
        >
          <div className="space-y-3 pt-2">
            <SymbolRow
              desc={getLoc(mythos.symbols.stone.meaning)}
              label={t("symbols.Stone")}
              value={getLoc(mythos.symbols.stone.name)}
            />
            <SymbolRow
              desc={getLoc(mythos.symbols.flower.meaning)}
              label={t("symbols.Flower")}
              value={getLoc(mythos.symbols.flower.name)}
            />
            <SymbolRow
              desc={getLoc(mythos.symbols.star.meaning)}
              label={t("symbols.Star")}
              value={getLoc(mythos.symbols.star.name)}
            />
          </div>
        </TiltCard>
      </div>
    </div>
  );
}

function SymbolRow({
  desc,
  label,
  value,
}: {
  desc: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex justify-between items-baseline">
        <span className="text-xs text-green-600 uppercase tracking-wider">
          {label}
        </span>
        <span className="text-sm text-white font-medium">{value}</span>
      </div>
      <p className="text-xs text-green-200/60 text-right italic">{desc}</p>
    </div>
  );
}

function TiltCard({
  borderColor = "border-white/10",
  children,
  gradient = "from-white/5 to-white/0",
  icon,
  subTitle,
  title,
}: {
  borderColor?: string;
  children: React.ReactNode;
  gradient?: string;
  icon: React.ReactNode;
  subTitle: string;
  title: string;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct * 200);
    y.set(yPct * 200);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <m.div
      className={`relative h-full rounded-3xl border ${borderColor} bg-gradient-to-br ${gradient} backdrop-blur-xl p-8 transition-colors duration-200`}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
    >
      <div
        className="relative z-10 space-y-4"
        style={{ transform: "translateZ(20px)" }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xs uppercase tracking-widest text-green-600/60 font-bold mb-1">
              {title}
            </h3>
            <div className="text-2xl font-bold text-white">{subTitle}</div>
          </div>
          <div className={`p-3 rounded-2xl bg-white/5 border ${borderColor}`}>
            {icon}
          </div>
        </div>

        <div className="pt-2">{children}</div>
      </div>
    </m.div>
  );
}
