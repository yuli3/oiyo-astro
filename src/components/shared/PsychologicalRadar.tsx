"use client";

/* eslint-disable no-restricted-syntax */
import { m } from "framer-motion";
import { useEffect, useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

interface PsychologicalRadarProps {
  className?: string;
  color?: string;
  data: RadarDataPoint[];
}

interface RadarDataPoint {
  A: number; // The score (0-100 or normalized)
  fullMark: number;
  subject: string;
}

export function PsychologicalRadar({
  className = "",
  color = "#10b981",
  data,
}: PsychologicalRadarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  // Simple check for dark mode if class is present on html, or just default to light/neutral for now to avoid dependency
  // For V2 standards, we can assume tailwind dark mode class strategy

  // Recharts theming is tricky without context, using neutral colors for grid
  const gridColor = "#9ca3af";
  const textColor = "#6b7280";

  return (
    <div className={`relative w-full h-[300px] md:h-[400px] ${className}`}>
      {/* Mist Effect Background */}
      <m.div
        animate={{ opacity: [0.1, 0.15, 0.1], scale: [1, 1.1, 1] }}
        className="absolute inset-0 bg-gradient-radial from-current to-transparent opacity-10 pointer-events-none"
        style={{ color }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      <div className="w-full h-full">
        {mounted && (
          <ResponsiveContainer height="100%" width="100%">
            <RadarChart cx="50%" cy="50%" data={data} outerRadius="80%">
              <PolarGrid stroke={gridColor} />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: textColor, fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={30}
                axisLine={false}
                domain={[0, 100]}
                tick={false}
              />
              <Radar
                dataKey="A"
                fill={color}
                fillOpacity={0.4}
                isAnimationActive={true}
                name="Score"
                stroke={color}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
