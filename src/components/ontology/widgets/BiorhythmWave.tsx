"use client";

import { m } from "framer-motion";
import { useMemo } from "react";

interface BiorhythmWaveProps {
  emotional: number;
  intellectual: number;
  physical: number;
}

export function BiorhythmWave({
  emotional,
  intellectual,
  physical,
}: BiorhythmWaveProps) {
  // Generate SVG paths for sine waves
  const generateWavePath = (amplitude: number, phase: number = 0) => {
    const points: string[] = [];
    const steps = 100;
    const width = 300;
    const centerY = 60;
    const maxAmplitude = 40;

    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * width;
      const normalizedAmp = (amplitude / 100) * maxAmplitude;
      const y =
        centerY - Math.sin((i / steps) * Math.PI * 2 + phase) * normalizedAmp;
      points.push(`${i === 0 ? "M" : "L"} ${x},${y}`);
    }

    return points.join(" ");
  };

  const waves = useMemo(
    () => [
      {
        color: "#f43f5e",
        label: "Physical",
        path: generateWavePath(physical, 0),
        value: physical,
      },
      {
        color: "#f59e0b",
        label: "Emotional",
        path: generateWavePath(emotional, Math.PI * 0.33),
        value: emotional,
      },
      {
        color: "#0ea5e9",
        label: "Intellectual",
        path: generateWavePath(intellectual, Math.PI * 0.66),
        value: intellectual,
      },
    ],
    [physical, emotional, intellectual],
  );

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 to-white rounded-2xl p-6 border border-slate-100">
      <svg
        className="w-full h-32"
        preserveAspectRatio="none"
        viewBox="0 0 300 120"
      >
        {/* Center line */}
        <line
          stroke="#cbd5e1"
          strokeDasharray="4 4"
          strokeWidth="1"
          x1="0"
          x2="300"
          y1="60"
          y2="60"
        />

        {/* Sine waves */}
        {waves.map((wave, idx) => (
          <m.path
            animate={{ opacity: 1, pathLength: 1 }}
            d={wave.path}
            fill="none"
            initial={{ opacity: 0, pathLength: 0 }}
            key={wave.label}
            stroke={wave.color}
            strokeLinecap="round"
            strokeWidth="2.5"
            transition={{ delay: idx * 0.2, duration: 1.5, ease: "easeInOut" }}
          />
        ))}
      </svg>

      {/* Legend */}
      <div className="flex justify-around mt-4 text-xs">
        {waves.map((wave) => (
          <div className="flex items-center gap-2" key={wave.label}>
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: wave.color }}
            />
            <span className="font-medium text-slate-600">
              {wave.label} ({wave.value > 0 ? "+" : ""}
              {wave.value}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
