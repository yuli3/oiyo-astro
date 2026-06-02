/**
 * Domain Manifest Interface
 * The Single Source of Truth (SSOT) for all ontology domains in OIYO.
 */

export interface DomainManifest {
  // Component Mapping
  component: {
    display: string; // Component name to render in UCL
    path: string; // Relative path from src/components
  };
  // Engine Integration
  correlationWeights: {
    baseWeight: number; // Influence on the Universal Correlation Index (0 to 1.0)
    synergyPairs: Record<string, number>; // Synergy boost when paired with other domain IDs
  };
  i18nNamespace: string; // prefix for sharded translation keys (e.g. 'ontology.ziwei')

  id: string; // unique domain identifier (e.g. 'ziwei')

  // Visual & Aesthetic Signature
  styling: {
    auraColor: string; // Primary hex or CSS color variable
    frequency: number; // Wave frequency for ResonanceMandala (0.1 to 2.0)
    icon?: string; // Lucide icon name or path
    secondaryColor?: string;
  };

  version: string; // schema version
}
