import React from "react";

import { CategoryId } from "@/config/categories";
import { Locale } from "@/i18n";

export type { CategoryId };

// The 9+ Domain Sovereignty Architecture
export type DomainId =
  | "company" // The Entity
  | "legal" // The Law
  | "ontology" // The Self
  | "premium" // The Value
  | "resonance" // The Other (Relationships)
  | "sanctuary" // The Inner Space
  | "synergy" // The Group/Force
  | "system" // The Machine
  | "user" // The Human
  | "wisdom"; // The Knowledge

export interface DomainManifest {
  component: {
    display: string;
    path: string;
  };
  correlationWeights: {
    baseWeight: number;
    synergyPairs: Record<string, number>;
  };
  i18nNamespace: string;
  id: string;
  styling: {
    auraColor: string;
    frequency: number;
    icon: string;
  };
  version: string;
}
export interface FeatureManifest {
  badge?: "beta" | "new" | "updated" | "viral";
  categories?: string[]; // Legacy support
  category?: CategoryId[]; // Sub-categories for UI grouping
  color?: string; // Theme Color (Tailwind class or hex)
  description?: LocalizedString; // Legacy Support
  descriptionKey?: string; // i18n Key (SSOT)

  domain?: DomainId; // Core Domain (Optional for migration)
  icon:
    | React.ComponentType<{ [key: string]: unknown; className?: string }>
    | string; // Primary Icon (LucideIcon | string)
  id: string;

  isPaid?: boolean;
  isPremium?: boolean; // Legacy support included
  name?: LocalizedString; // Legacy Support
  nameKey?: string; // i18n Key (SSOT)

  path: string; // Actual URL path (e.g. /ontology/saju)

  // Opt-in: result view supports a stateless, shareable #r= permalink (T6/#32).
  // See company-brain/AI-Sessions/wiki/decisions/oiyo-result-permalink-hash.md.
  permalink?: boolean;

  searchKeywords?: Record<string, string[]> | string[]; // Legacy Support
  // Localized Metadata (replaces seo.config.ts)
  seo: {
    description?: LocalizedString;
    descriptionKey?: string;

    keywords?: LocalizedString | LocalizedString[] | LocalizedStringArray;
    keywordsKey?: string;

    priority?: number; // 0.0 to 1.0

    title?: LocalizedString;
    titleKey?: string;
  };
  // Status Flags
  status: "archived" | "beta" | "development" | "production";
}

export type { Locale };

export type LocalizedContent = LocalizedString;
export type LocalizedString = Partial<Record<string, string>> & {
  en: string;
  ko: string;
};

export type LocalizedStringArray = Partial<Record<string, string[]>> & {
  en: string[];
  ko: string[];
};

// Backward compatibility alias
export type LocalizedText = LocalizedString;
