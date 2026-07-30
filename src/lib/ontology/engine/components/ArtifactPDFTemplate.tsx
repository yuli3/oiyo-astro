/* eslint-disable no-restricted-syntax */
"use client";

import React, { forwardRef } from "react";

import type { Locale } from "@/i18n";
import type { UniversalProfile } from "@/lib/ontology/engine/types";

interface Styles {
  card: React.CSSProperties;
  footer: React.CSSProperties;
  grid2: React.CSSProperties;
  header: React.CSSProperties;
  icon: React.CSSProperties;
  page: React.CSSProperties;
  section: React.CSSProperties;
  sectionTitle: React.CSSProperties;
  text: React.CSSProperties;
}

const styles: Styles = {
  card: {
    background: "#f9fafb",
    border: "1px solid #e5e5e5",
    borderRadius: "4mm",
    padding: "6mm",
  },
  footer: {
    borderTop: "1px solid #e5e5e5",
    bottom: "15mm",
    color: "#9ca3af",
    fontSize: "8pt",
    left: "20mm",
    paddingTop: "5mm",
    position: "absolute",
    right: "20mm",
    textAlign: "center",
  },
  grid2: {
    display: "grid",
    gap: "10mm",
    gridTemplateColumns: "1fr 1fr",
  },
  header: {
    borderBottom: "1px solid #e5e5e5",
    marginBottom: "15mm",
    paddingBottom: "10mm",
    textAlign: "center",
  },
  icon: {
    display: "block",
    fontSize: "24pt",
    marginBottom: "4mm",
  },
  page: {
    background: "#ffffff",
    color: "#1a1a1a",
    fontFamily: '"Noto Sans", sans-serif',
    minHeight: "297mm",
    overflow: "hidden",
    padding: "20mm",
    position: "relative",
    width: "210mm",
  },
  section: {
    marginBottom: "15mm",
    pageBreakInside: "avoid",
  },
  sectionTitle: {
    borderLeft: "4px solid #059669",
    color: "#059669", // Emerald-600
    fontSize: "14pt",
    fontWeight: "bold",
    letterSpacing: "2px",
    marginBottom: "5mm",
    paddingLeft: "4mm",
    textTransform: "uppercase",
  },
  text: {
    color: "#4b5563",
    fontSize: "11pt",
    lineHeight: 1.6,
  },
};

interface ArtifactPDFTemplateProps {
  locale: Locale;
  profile: UniversalProfile;
  prophecy?: string;
}

export const ArtifactPDFTemplate = forwardRef<
  HTMLDivElement,
  ArtifactPDFTemplateProps
>(({ locale, profile, prophecy }, ref) => {
  const getLoc = (obj: any) => obj?.[locale] || obj?.en || "";
  const [year, month, day] = profile.input.civilDate.split("-").map(Number);
  const dateStr = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, day)));

  return (
    <div className="pdf-container" ref={ref} style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div
          style={{
            color: "#9ca3af",
            fontSize: "10pt",
            letterSpacing: "3px",
            marginBottom: "4mm",
            textTransform: "uppercase",
          }}
        >
          Universal Origin of
        </div>
        <h1
          style={{
            color: "#111827",
            fontSize: "32pt",
            fontWeight: 700,
            margin: 0,
          }}
        >
          {profile.input.fullName || "The Seeker"}
        </h1>
        <div style={{ color: "#6b7280", fontSize: "12pt", marginTop: "4mm" }}>
          {dateStr} • {profile.cosmic?.season}
        </div>
      </header>

      {/* 1. Prophecy */}
      {prophecy && (
        <section
          style={{
            ...styles.section,
            background: "#f0fdf4",
            borderRadius: "4mm",
            padding: "10mm",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              color: "#059669",
              fontSize: "12pt",
              fontStyle: "italic",
              marginBottom: "4mm",
            }}
          >
            The Oracle&apos;s Voice
          </h2>
          <p
            style={{
              color: "#064e3b",
              fontSize: "18pt",
              fontWeight: 500,
              lineHeight: 1.4,
            }}
          >
            &quot;{prophecy}&quot;
          </p>
        </section>
      )}

      {/* 2. Primal Ontology */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>I. Primal Architecture</h2>
        <div style={styles.grid2}>
          <div style={styles.card}>
            <span style={styles.icon}>🌞</span>
            <h3 style={{ fontSize: "12pt", fontWeight: "bold" }}>
              Western Zodiac
            </h3>
            <p
              style={{
                color: "#059669",
                fontSize: "16pt",
                fontWeight: "bold",
                margin: "4mm 0",
              }}
            >
              {getLoc(profile.westernZodiac.name)}
            </p>
            <p style={styles.text}>{getLoc(profile.westernZodiac.traits[0])}</p>
          </div>
          <div style={styles.card}>
            <span style={styles.icon}>🌚</span>
            <h3 style={{ fontSize: "12pt", fontWeight: "bold" }}>
              Saju Day Master
            </h3>
            <p
              style={{
                color: "#059669",
                fontSize: "16pt",
                fontWeight: "bold",
                margin: "4mm 0",
              }}
            >
              {profile.saju.dayMaster} ({profile.saju.year.heavenlyStem})
            </p>
            <p style={styles.text}>
              Core Element: {profile.saju.year.heavenlyStem}
            </p>
          </div>
        </div>
      </section>

      {/* 3. Mythic Lineage */}
      {profile.mythos && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>II. Mythic Lineage</h2>
          <div style={styles.grid2}>
            {/* Egyptian */}
            <div style={styles.card}>
              <span style={styles.icon}>𓂀</span>
              <h3
                style={{
                  fontSize: "10pt",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
              >
                Egyptian Guardian
              </h3>
              <p
                style={{
                  color: "#059669",
                  fontSize: "14pt",
                  fontWeight: "bold",
                  margin: "2mm 0",
                }}
              >
                {profile.mythos.egyptian.patronDeity.name}
              </p>
              <p style={{ fontSize: "10pt" }}>
                {profile.mythos.egyptian.decan.name}
              </p>
            </div>
            {/* Celtic */}
            <div style={styles.card}>
              <span style={styles.icon}>🌳</span>
              <h3
                style={{
                  fontSize: "10pt",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
              >
                Celtic Tree
              </h3>
              <p
                style={{
                  color: "#059669",
                  fontSize: "14pt",
                  fontWeight: "bold",
                  margin: "2mm 0",
                }}
              >
                {profile.mythos.celtic.tree}
              </p>
              <p style={{ fontSize: "10pt" }}>{profile.mythos.celtic.name}</p>
            </div>
            {/* Star */}
            <div style={styles.card}>
              <span style={styles.icon}>✨</span>
              <h3
                style={{
                  fontSize: "10pt",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
              >
                Natal Star
              </h3>
              <p
                style={{
                  color: "#059669",
                  fontSize: "14pt",
                  fontWeight: "bold",
                  margin: "2mm 0",
                }}
              >
                {getLoc(profile.mythos.symbols?.star?.name)}
              </p>
              <p style={{ fontSize: "10pt" }}>
                {getLoc(profile.mythos.symbols?.star?.meaning)}
              </p>
            </div>
            {/* Stone/Flower */}
            <div style={styles.card}>
              <span style={styles.icon}>💎</span>
              <h3
                style={{
                  fontSize: "10pt",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
              >
                Birth Symbols
              </h3>
              <div style={{ fontSize: "10pt" }}>
                <div>
                  Stone: <b>{getLoc(profile.mythos.birthstone?.name)}</b>
                </div>
                <div>
                  Flower: <b>{getLoc(profile.mythos.birthflower?.name)}</b>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. Cosmic Constants */}
      {profile.cosmic && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>III. Cosmic Coordinates</h2>
          <div
            style={{
              ...styles.card,
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              textAlign: "center",
            }}
          >
            <div>
              <div
                style={{
                  color: "#6b7280",
                  fontSize: "8pt",
                  textTransform: "uppercase",
                }}
              >
                Velocity
              </div>
              <div style={{ fontSize: "12pt", fontWeight: "bold" }}>
                {profile.cosmic.orbitalVelocity} km/s
              </div>
            </div>
            <div>
              <div
                style={{
                  color: "#6b7280",
                  fontSize: "8pt",
                  textTransform: "uppercase",
                }}
              >
                Galactic
              </div>
              <div style={{ fontSize: "12pt", fontWeight: "bold" }}>
                {profile.cosmic.galacticVelocity} km/s
              </div>
            </div>
            <div>
              <div
                style={{
                  color: "#6b7280",
                  fontSize: "8pt",
                  textTransform: "uppercase",
                }}
              >
                Axial Tilt
              </div>
              <div style={{ fontSize: "12pt", fontWeight: "bold" }}>
                {profile.cosmic.axialTilt}°
              </div>
            </div>
            <div>
              <div
                style={{
                  color: "#6b7280",
                  fontSize: "8pt",
                  textTransform: "uppercase",
                }}
              >
                Sun Dist.
              </div>
              <div style={{ fontSize: "12pt", fontWeight: "bold" }}>
                {(profile.cosmic.distanceFromSun / 1000000).toFixed(1)}M km
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={styles.footer}>
        Generated by OIYO Universal Origin Engine • {new Date().getFullYear()} •
        Securely validated via Blockchain ID
      </footer>
    </div>
  );
});

ArtifactPDFTemplate.displayName = "ArtifactPDFTemplate";
