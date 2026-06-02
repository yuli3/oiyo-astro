"use client";

import { useTranslations } from "next-intl";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { BiorhythmData } from "@/lib/engines/biorhythm-engine";

interface BiorhythmChartProps {
  data: BiorhythmData[];
}

export function BiorhythmChart({ data }: BiorhythmChartProps) {
  const t = useTranslations("universal");

  const formatDate = (date: any) => {
    const d = new Date(date);
    return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
  };

  return (
    <div className="h-64 w-full min-h-[200px]">
      <ResponsiveContainer
        height="100%"
        width="100%"
        minWidth={0}
        minHeight={200}
      >
        <LineChart
          data={data}
          margin={{ bottom: 5, left: -20, right: 5, top: 5 }}
        >
          <CartesianGrid
            stroke="#e2e8f0"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            fontSize={10}
            stroke="#94a3b8"
            tickFormatter={formatDate}
            tickLine={false}
          />
          <YAxis domain={[-100, 100]} fontSize={10} hide stroke="#94a3b8" />
          <ReferenceLine stroke="#cbd5e1" strokeDasharray="3 3" y={0} />
          <ReferenceLine
            label={{
              fill: "#94a3b8",
              fontSize: 10,
              position: "top",
              value: "Today",
            }}
            stroke="#94a3b8"
            strokeDasharray="5 5"
            x={new Date().setHours(0, 0, 0, 0)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "none",
              borderRadius: "12px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              color: "#0f172a",
              fontSize: "12px",
            }}
            labelFormatter={(label) => formatDate(label)}
          />
          <Line
            dataKey="physical"
            dot={false}
            name={t("labels.physical")}
            stroke="#f43f5e"
            strokeWidth={2}
            type="monotone"
          />
          <Line
            dataKey="emotional"
            dot={false}
            name={t("labels.emotional")}
            stroke="#f59e0b"
            strokeWidth={2}
            type="monotone"
          />
          <Line
            dataKey="intellectual"
            dot={false}
            name={t("labels.intellectual")}
            stroke="#0ea5e9"
            strokeWidth={2}
            type="monotone"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
