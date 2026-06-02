/**
 * Kabbalah Types
 * The Grand Archive - Esoteric Mapping
 */

export interface KabbalahCoordinates {
  lifePathNumber: number;
  pathDescription: string;
  sephira: Sephira;
}

export interface Sephira {
  color: string;
  id: string;
  meaning: string;
  name: string;
  tarot: string;
}
