"use client";

import { m } from "framer-motion";
import { Activity, Calendar, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BiorhythmState,
  calculateBiorhythm,
  getBiorhythmInterpretation,
} from "@/lib/ontology/saju/biorhythm";
import { useUserProfile } from "@/lib/user/context/UserContext";

export function BiorhythmSection() {
  const t = useTranslations("fortune"); // Falling back to shared key
  // Ideally we should have 'ontology.biorhythm' but using 'fortune' or 'daily' for now

  const { profile } = useUserProfile();
  const [date, setDate] = useState<string>("");

  const biorhythm = date ? calculateBiorhythm(new Date(date)) : null;

  useEffect(() => {
    if (profile.birthDate && !date) {
      const d = new Date(profile.birthDate);
      if (!isNaN(d.getTime())) {
        const newDate = d.toISOString().split("T")[0];
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (newDate !== date) setDate(newDate);
      }
    }
  }, [profile.birthDate, date]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-[#042f24] text-white overflow-hidden">
      {/* Dark Theme specific for Biorhythm to show "Pulse" */}
      <div className="absolute inset-0 bg-[#064e3b]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-900/20 via-[#042f24] to-[#042f24]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-300 text-xs font-bold uppercase tracking-widest">
            <Activity className="w-3 h-3" /> Vitality Pulse
          </div>
          <h2 className="text-4xl md:text-6xl font-black italic tracking-tight">
            Cosmic Biorhythm
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            Monitor the sinusoidal flows of your Physical, Emotional, and
            Intellectual energy cycles.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-md">
            <div className="space-y-2">
              <Label className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                Birth Date Reference
              </Label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  className="bg-slate-900/50 border-white/10 text-white pl-12 h-12"
                  onChange={(e) => setDate(e.target.value)}
                  type="date"
                  value={date}
                />
              </div>
            </div>

            {biorhythm && (
              <div className="space-y-6 pt-4">
                <BioBar
                  color="bg-green-500"
                  label="Physical"
                  value={biorhythm.physical}
                />
                <BioBar
                  color="bg-rose-500"
                  label="Emotional"
                  value={biorhythm.emotional}
                />
                <BioBar
                  color="bg-cyan-500"
                  label="Intellectual"
                  value={biorhythm.intellectual}
                />
              </div>
            )}
          </div>

          <div className="space-y-6">
            {biorhythm ? (
              <>
                <BioCard
                  color="text-green-400"
                  desc="Body resilience, strength, and immunity."
                  title="Physical State"
                  value={biorhythm.physical}
                />
                <BioCard
                  color="text-rose-400"
                  desc="Mood stability, creativity, and perception."
                  title="Emotional State"
                  value={biorhythm.emotional}
                />
                <BioCard
                  color="text-cyan-400"
                  desc="Analytical thinking, logic, and focus."
                  title="Intellectual State"
                  value={biorhythm.intellectual}
                />
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 min-h-[300px]">
                <Info className="w-12 h-12 opacity-20" />
                <p>Enter your birth date to visualize your cycles</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BioBar({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-bold text-slate-300">{label}</span>
        <span className="font-mono text-slate-400">{value}%</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden relative">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20" />{" "}
        {/* Center line */}
        <m.div
          animate={{
            width: `${Math.abs(value) / 2}%`,
            x: value < 0 ? "-100%" : "0%",
          }}
          className={`h-full absolute left-1/2 top-0 ${color}`}
          initial={{ width: 0, x: "-50%" }}
          style={{ transformOrigin: "left" }}
        />
      </div>
    </div>
  );
}

function BioCard({
  color,
  desc,
  title,
  value,
}: {
  color: string;
  desc: string;
  title: string;
  value: number;
}) {
  const interp = getBiorhythmInterpretation(value);
  return (
    <m.div
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5"
      initial={{ opacity: 0, y: 10 }}
    >
      <div className={`text-2xl font-black ${color} w-16 text-center`}>
        {value > 0 ? "+" : ""}
        {value}
      </div>
      <div>
        <h4 className="font-bold text-white leading-none mb-1">{title}</h4>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          {interp.description}
        </div>
        <p className="text-sm text-slate-500 leading-tight">{desc}</p>
      </div>
    </m.div>
  );
}
