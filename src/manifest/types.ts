import { type TSchema, Type } from "@sinclair/typebox";

/**
 * The structure of an i18n Manifest file.
 * It can be flat or nested sections.
 */
export type I18nManifest = Record<string, ManifestItem>;

/**
 * Base definition for a Manifest Item
 */
export interface ManifestItem<T = unknown> {
  /**
   * The default value (usually English).
   * This serves as the fallback and the source of truth for the type.
   */
  defaultValue?: T;

  /**
   * Human-readable description of what this key is for.
   * This is crucial for context during translation or usage.
   */
  desc: string;

  /**
   * Optional list of parameters if the value is a template string.
   * Example: ["name", "date"] for "Hello {name}, it is {date}"
   */
  params?: string[];

  /**
   * Optional schema for validation (e.g., for API responses or complex objects).
   * If not provided, the type is inferred from defaultValue.
   */
  schema?: TSchema;

  /**
   * Optional stability level.
   * - stable: Safe to use, unlikely to change.
   * - experimental: Might change or be removed.
   * - deprecated: Should not be used in new code.
   */
  stability?: "deprecated" | "experimental" | "stable";
}

/**
 * A collection of Manifest Items.
 * Used to group related keys (e.g., by component or page).
 */
export type ManifestSection = Record<string, ManifestItem>;
