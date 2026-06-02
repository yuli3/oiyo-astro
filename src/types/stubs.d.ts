/**
 * Type Stubs for Missing Modules
 *
 * These declarations resolve TS2307 errors for modules that are either:
 * 1. Legacy code awaiting refactoring
 * 2. External dependencies without type definitions
 * 3. Modules that have been moved/renamed during cleanup
 *
 * TODO: Replace each stub with proper type definitions as modules are restored
 */

// ═══════════════════════════════════════════════════════════════
// Engines & Core Systems
// ═══════════════════════════════════════════════════════════════

declare module "@/hooks/use-auth-sync" {
  export const useAuthSync: () => void;
  export default useAuthSync;
}

declare module "../hooks/useOntologyContext" {
  export const useOntologyContext: () => unknown;
  export default useOntologyContext;
}

declare module "../components/ontology/ContextualInsight" {
  const ContextualInsight: React.FC<Record<string, unknown>>;
  export default ContextualInsight;
}

declare module "./PrimalArchetypeSection" {
  const PrimalArchetypeSection: React.FC<Record<string, unknown>>;
  export default PrimalArchetypeSection;
}

// ═══════════════════════════════════════════════════════════════
// Primal Core & Manifest
// ═══════════════════════════════════════════════════════════════

declare module "../../primal-core/name-analysis" {
  export const nameAnalysis: unknown;
  export default nameAnalysis;
}

declare module "../manifest-types" {
  export interface ManifestType {
    [key: string]: unknown;
  }
}
