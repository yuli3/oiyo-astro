/* eslint-disable no-restricted-syntax */
"use client";

import { m } from "framer-motion";
import {
  Droplets,
  Flame,
  Gem,
  Info,
  Leaf,
  Minus,
  Mountain,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FiveElement } from "@/lib/ontology/saju/types";

type ChartDatum = {
  element: FiveElement;
  fullName: string;
  name: string;
  value: number;
};

interface FiveElementsChartProps {
  analysis: Record<FiveElement, number>;
  className?: string;
  dominantElement: FiveElement;
  interactive?: boolean;
  locale: string;
  showInterpretation?: boolean;
}

const getElementIcon = (
  element: FiveElement,
  size: "lg" | "md" | "sm" = "md",
) => {
  const sizeClass =
    size === "sm" ? "w-4 h-4" : size === "lg" ? "w-8 h-8" : "w-6 h-6";

  switch (element) {
    case FiveElement.EARTH:
      return <Mountain className={`${sizeClass} text-yellow-600`} />;
    case FiveElement.FIRE:
      return <Flame className={`${sizeClass} text-red-600`} />;
    case FiveElement.METAL:
      return <Gem className={`${sizeClass} text-green-700`} />;
    case FiveElement.WATER:
      return <Droplets className={`${sizeClass} text-sky-600`} />;
    case FiveElement.WOOD:
      return <Leaf className={`${sizeClass} text-green-600`} />;
    default:
      return <Info className={`${sizeClass} text-green-600`} />;
  }
};

const getElementColor = (element: FiveElement) => {
  const colors = {
    [FiveElement.EARTH]: {
      bg: "#fffbeb",
      border: "#fcd34d",
      primary: "#d97706",
      secondary: "#b45309",
    },
    [FiveElement.FIRE]: {
      bg: "#fff1f2",
      border: "#fda4af",
      primary: "#e11d48",
      secondary: "#be123c",
    },
    [FiveElement.METAL]: {
      bg: "#f8fafc",
      border: "#cbd5e1",
      primary: "#475569",
      secondary: "#334155",
    },
    [FiveElement.WATER]: {
      bg: "#f0f9ff",
      border: "#7dd3fc",
      primary: "#0284c7",
      secondary: "#0369a1",
    },
    [FiveElement.WOOD]: {
      bg: "#ecfdf5",
      border: "#6ee7b7",
      primary: "#059669",
      secondary: "#16a34a",
    },
  };
  return colors[element] || colors[FiveElement.WATER];
};

const getElementStatus = (element: FiveElement, value: number) => {
  if (value >= 25) return "strong";
  if (value >= 15) return "balanced";
  return "weak";
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "strong":
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    case "weak":
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    default:
      return <Minus className="w-4 h-4 text-green-700" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "strong":
      return "text-green-600 bg-green-100";
    case "weak":
      return "text-red-600 bg-red-100";
    default:
      return "text-green-700 bg-gray-100";
  }
};

const CustomTooltip = ({
  active,
  payload,
  t,
}: {
  active?: boolean;
  payload?: { payload: ChartDatum }[];
  t: any;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const color = getElementColor(data.element);

    return (
      <div
        className="p-3 rounded-lg border shadow-lg"
        style={{ backgroundColor: color.bg, borderColor: color.border }}
      >
        <div className="flex items-center gap-2 mb-1">
          {getElementIcon(data.element)}
          <span className="font-medium">{data.fullName}</span>
        </div>
        <div className="text-sm">
          <span className="font-medium">{Math.round(data.value)}%</span>
          <span className="text-green-700 ml-1">
            (
            {t(`elements.status.${getElementStatus(data.element, data.value)}`)}
            )
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export function FiveElementsChart({
  analysis,
  className = "",
  dominantElement,
  interactive = true,
  locale,
  showInterpretation = true,
}: FiveElementsChartProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedElement, setSelectedElement] = useState<FiveElement | null>(
    null,
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const [viewMode, setViewMode] = useState<"balance" | "chart" | "cycle">(
    "chart",
  );
  const t = useTranslations("saju");

  // Convert map to array for Recharts
  const chartData: ChartDatum[] = [
    {
      element: FiveElement.WOOD,
      fullName: t("elements.wood.name"),
      name: t("elements.wood.short"),
      value: analysis[FiveElement.WOOD],
    },
    {
      element: FiveElement.FIRE,
      fullName: t("elements.fire.name"),
      name: t("elements.fire.short"),
      value: analysis[FiveElement.FIRE],
    },
    {
      element: FiveElement.EARTH,
      fullName: t("elements.earth.name"),
      name: t("elements.earth.short"),
      value: analysis[FiveElement.EARTH],
    },
    {
      element: FiveElement.METAL,
      fullName: t("elements.metal.name"),
      name: t("elements.metal.short"),
      value: analysis[FiveElement.METAL],
    },
    {
      element: FiveElement.WATER,
      fullName: t("elements.water.name"),
      name: t("elements.water.short"),
      value: analysis[FiveElement.WATER],
    },
  ];

  // Element Relationships
  const elementRelationships: {
    destruction: Record<FiveElement, FiveElement>;
    generation: Record<FiveElement, FiveElement>;
  } = {
    destruction: {
      [FiveElement.EARTH]: FiveElement.WATER,
      [FiveElement.FIRE]: FiveElement.METAL,
      [FiveElement.METAL]: FiveElement.WOOD,
      [FiveElement.WATER]: FiveElement.FIRE,
      [FiveElement.WOOD]: FiveElement.EARTH,
    },
    generation: {
      [FiveElement.EARTH]: FiveElement.METAL,
      [FiveElement.FIRE]: FiveElement.EARTH,
      [FiveElement.METAL]: FiveElement.WATER,
      [FiveElement.WATER]: FiveElement.WOOD,
      [FiveElement.WOOD]: FiveElement.FIRE,
    },
  };

  return (
    <div className={className} lang={locale}>
      {/* View Mode Selection */}
      {interactive && (
        <div className="flex gap-2 mb-4">
          <Button
            onClick={() => setViewMode("chart")}
            size="sm"
            variant={viewMode === "chart" ? "default" : "outline"}
          >
            {t("elements.viewModes.chart")}
          </Button>
          <Button
            onClick={() => setViewMode("balance")}
            size="sm"
            variant={viewMode === "balance" ? "default" : "outline"}
          >
            {t("elements.viewModes.balance")}
          </Button>
          <Button
            onClick={() => setViewMode("cycle")}
            size="sm"
            variant={viewMode === "cycle" ? "default" : "outline"}
          >
            {t("elements.viewModes.cycle")}
          </Button>
        </div>
      )}

      {/* Chart View */}
      {viewMode === "chart" && (
        <Card className="p-6">
          <div className="h-80">
            {mounted && (
              <ResponsiveContainer height="100%" width="100%">
                <RadarChart data={chartData}>
                  <PolarGrid />
                  <PolarAngleAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fontWeight: "bold" }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 40]}
                    tick={{ fontSize: 10 }}
                  />
                  <Radar
                    dataKey="value"
                    fill={"#10B981"}
                    fillOpacity={0.3}
                    name={t("elements.chartLabel")}
                    stroke={"#10B981"}
                    strokeWidth={2}
                  />
                  <Tooltip content={<CustomTooltip t={t} />} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      )}

      {/* Balance View */}
      {viewMode === "balance" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chartData.map((item) => {
            const status = getElementStatus(item.element, item.value);
            const color = getElementColor(item.element);
            const isSelected = selectedElement === item.element;

            return (
              <m.div
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected
                    ? "border-green-500 shadow-lg"
                    : "border-green-50 hover:border-green-800/50"
                }`}
                key={item.element}
                layoutId={`element-${item.element}`}
                onClick={() =>
                  setSelectedElement(isSelected ? null : item.element)
                }
                style={{ backgroundColor: color.bg }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getElementIcon(item.element)}
                    <span className="font-medium">{item.fullName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(status)}
                    <Badge className={`text-xs ${getStatusColor(status)}`}>
                      {Math.round(item.value)}%
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="w-full bg-surface-subtle rounded-full h-2">
                    <m.div
                      animate={{
                        width: `${Math.min((item.value / 40) * 100, 100)}%`,
                      }}
                      className="h-2 rounded-full"
                      initial={{ width: 0 }}
                      style={{ backgroundColor: color.primary }}
                      transition={{ delay: 0.2, duration: 1 }}
                    />
                  </div>

                  {isSelected && (
                    <m.div
                      animate={{ height: "auto", opacity: 1 }}
                      className="mt-3 pt-3 border-t"
                      exit={{ height: 0, opacity: 0 }}
                      initial={{ height: 0, opacity: 0 }}
                    >
                      <p className="text-sm text-green-700">
                        {t(`elements.${item.element}.characteristics`)}
                      </p>
                      <div className="mt-2">
                        <span className="text-xs font-medium text-green-600">
                          {t("elements.influence")}:
                        </span>
                        <p className="text-xs text-green-700 mt-1">
                          {t(`elements.${item.element}.influence`)}
                        </p>
                      </div>
                    </m.div>
                  )}
                </div>
              </m.div>
            );
          })}
        </div>
      )}

      {/* Cycle View */}
      {viewMode === "cycle" && (
        <Card className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold mb-2">
              {t("elements.cycle.title")}
            </h3>
            <p className="text-sm text-green-700">
              {t("elements.cycle.description")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Generation */}
            <div>
              <h4 className="font-medium text-green-600 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {t("elements.cycle.generation")}
              </h4>
              <div className="space-y-2">
                {Object.entries(elementRelationships.generation).map(
                  ([from, to]) => (
                    <div
                      className="flex items-center gap-3 p-2 bg-surface-subtle rounded"
                      key={`${from}-${to}`}
                    >
                      <div className="flex items-center gap-2">
                        {getElementIcon(from as FiveElement, "sm")}
                        <span className="text-sm font-medium">
                          {t(`elements.${from}.short`)}
                        </span>
                      </div>
                      <span className="text-green-600">→</span>
                      <div className="flex items-center gap-2">
                        {getElementIcon(to as FiveElement, "sm")}
                        <span className="text-sm font-medium">
                          {t(`elements.${to}.short`)}
                        </span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* Destruction */}
            <div>
              <h4 className="font-medium text-red-600 mb-3 flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                {t("elements.cycle.destruction")}
              </h4>
              <div className="space-y-2">
                {Object.entries(elementRelationships.destruction).map(
                  ([from, to]) => (
                    <div
                      className="flex items-center gap-3 p-2 bg-red-50 rounded"
                      key={`${from}-${to}`}
                    >
                      <div className="flex items-center gap-2">
                        {getElementIcon(from as FiveElement, "sm")}
                        <span className="text-sm font-medium">
                          {t(`elements.${from}.short`)}
                        </span>
                      </div>
                      <span className="text-red-600">⚡</span>
                      <div className="flex items-center gap-2">
                        {getElementIcon(to as FiveElement, "sm")}
                        <span className="text-sm font-medium">
                          {t(`elements.${to}.short`)}
                        </span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Interpretation Section */}
      {showInterpretation && (
        <Card className="p-4 mt-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Info className="w-4 h-4" />
            {t("elements.interpretation.title")}
          </h4>
          <div className="space-y-3">
            <div className="p-3 bg-surface-subtle rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                {getElementIcon(dominantElement, "sm")}
                <span className="text-sm font-medium text-green-900">
                  {t("elements.interpretation.dominant")}
                </span>
              </div>
              <p className="text-sm text-green-800">
                {t(`elements.${dominantElement}.dominantTraits`)}
              </p>
            </div>

            {/* Balance Advice */}
            <div className="p-3 bg-yellow-50 rounded-lg">
              <h5 className="text-sm font-medium text-yellow-900 mb-1">
                {t("elements.interpretation.balanceAdvice")}
              </h5>
              <p className="text-sm text-yellow-800">
                {t("elements.interpretation.balanceDescription")}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
