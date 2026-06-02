/* eslint-disable no-restricted-syntax */
"use client";

import React, { forwardRef } from "react";

import { Locale } from "@/i18n";

import { TotalResonance } from "../types";

interface ResonanceArtifactTemplateProps {
  locale: Locale;
  result: TotalResonance;
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    borderBottom: "2px solid #f59e0b",
    marginBottom: "15mm",
    textAlign: "center",
  },
  narrative: {
    background: "#fffbeb",
    border: "1px solid #fef3c7",
    borderRadius: "4mm",
    marginBottom: "10mm",
    padding: "8mm",
    textAlign: "center",
  },
  page: {
    background: "#ffffff",
    color: "#1a1a1a",
    fontFamily: '"Noto Sans", sans-serif',
    minHeight: "297mm",
    padding: "20mm",
    position: "relative",
    width: "210mm",
  },
  title: {
    color: "#0f172a",
    fontSize: "28pt",
    fontWeight: 900,
    margin: "10px 0",
  },
};

export const ResonanceArtifactTemplate = forwardRef<
  HTMLDivElement,
  ResonanceArtifactTemplateProps
>(({ locale, result }, ref) => {
  const getLoc = (obj: any) => obj?.[locale] || obj?.en || "";

  return (
    <div ref={ref} style={styles.page}>
      <header style={styles.header}>
        <div
          style={{
            color: "#64748b",
            fontSize: "10pt",
            letterSpacing: "4px",
            textTransform: "uppercase",
          }}
        >
          Document of Sacred Harmony
        </div>
        <h1 style={styles.title}>{result.totalScore}% Resonance</h1>
      </header>

      {result.resonanceNarrative && (
        <section style={styles.narrative}>
          <div
            style={{
              color: "#b45309",
              fontSize: "10pt",
              marginBottom: "2mm",
              textTransform: "uppercase",
            }}
          >
            The Oracle&apos;s Synthesis
          </div>
          <p
            style={{
              color: "#92400e",
              fontSize: "14pt",
              fontWeight: 500,
              lineHeight: 1.5,
            }}
          >
            &quot;{getLoc(result.resonanceNarrative)}&quot;
          </p>
        </section>
      )}

      <div
        style={{ display: "grid", gap: "10mm", gridTemplateColumns: "1fr 1fr" }}
      >
        {result.dimensions.map((d) => (
          <div
            key={d.id}
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "3mm",
              padding: "6mm",
            }}
          >
            <div
              style={{
                color: "#94a3b8",
                fontSize: "8pt",
                textTransform: "uppercase",
              }}
            >
              {d.id}
            </div>
            <div style={{ fontSize: "14pt", fontWeight: "bold" }}>
              {d.score}%
            </div>
            <p style={{ color: "#444", fontSize: "10pt" }}>
              {getLoc(d.insight)}
            </p>
          </div>
        ))}
      </div>

      <footer
        style={{
          borderTop: "1px solid #eee",
          bottom: "20mm",
          color: "#999",
          fontSize: "8pt",
          paddingTop: "5mm",
          position: "absolute",
          textAlign: "center",
          width: "170mm",
        }}
      >
        Resonated in OIYO Hall of Destiny • Validated via Neural Origin Engine
      </footer>
    </div>
  );
});

ResonanceArtifactTemplate.displayName = "ResonanceArtifactTemplate";
