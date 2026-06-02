/**
 * Ontology Kernel - Universal Mathematics
 * Core utility functions for modular arithmetic and circular coordinate systems.
 */

/**
 * Calculates the shortest distance between two circular points.
 */
export function circularDistance(a: number, b: number, max: number): number {
  const diff = Math.abs(a - b);
  return Math.min(diff, max - diff);
}

/**
 * Clamps a value between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Normalizes an angle to the range [0, 360).
 */
export function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

/**
 * Normalizes a value to a modular range [min, max].
 * Useful for 1-indexed systems like Nakshatras (1-27) or Solar Terms (1-24).
 */
export function normalizeModular(
  value: number,
  min: number,
  max: number,
): number {
  const range = max - min + 1;
  const normalized = ((((value - min) % range) + range) % range) + min;
  return normalized;
}
