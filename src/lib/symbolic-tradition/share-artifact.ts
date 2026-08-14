import LZString from "lz-string";

import type { SymbolicComparisonProfile, SymbolicProfile } from "./types";

export const SYMBOLIC_SHARE_SCHEMA_VERSION = 1 as const;
export const SYMBOLIC_SHARE_FRAGMENT_KEY = "symbolic";
export const SYMBOLIC_SHARE_DEFAULT_TTL_DAYS = 7;
export const SYMBOLIC_SHARE_MAX_TTL_DAYS = 30;

export interface SymbolicShareArtifact {
  checksum: string;
  createdAt: string;
  expiresAt: string;
  profile: SymbolicComparisonProfile;
  schema: "oiyo.symbolic-share";
  schemaVersion: typeof SYMBOLIC_SHARE_SCHEMA_VERSION;
}

type ArtifactBody = Omit<SymbolicShareArtifact, "checksum">;

export type DecodeShareArtifactResult =
  | { artifact: SymbolicShareArtifact; ok: true }
  | { ok: false; reason: "damaged" | "expired" | "unsupported" };

function crc32(value: string): string {
  let crc = 0xffffffff;
  for (let index = 0; index < value.length; index += 1) {
    crc ^= value.charCodeAt(index);
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return ((crc ^ 0xffffffff) >>> 0).toString(16).padStart(8, "0");
}

function profileForShare(profile: SymbolicProfile): SymbolicComparisonProfile {
  return {
    chineseZodiac: profile.chineseZodiac,
    fiveElements: {
      dominant: profile.fiveElements.dominant,
      observedCoordinates: profile.fiveElements.observedCoordinates,
    },
    sunSign: profile.sunSign,
    yinYang: profile.yinYang,
  };
}

function hasComparisonProfile(value: unknown): value is SymbolicComparisonProfile {
  if (!value || typeof value !== "object") return false;
  const profile = value as Partial<SymbolicComparisonProfile>;
  return typeof profile.chineseZodiac?.branch === "string"
    && typeof profile.fiveElements?.dominant === "string"
    && (profile.fiveElements.observedCoordinates === 6 || profile.fiveElements.observedCoordinates === 8)
    && typeof profile.sunSign?.element === "string"
    && typeof profile.sunSign.modality === "string"
    && typeof profile.sunSign.sign === "string"
    && Number.isInteger(profile.yinYang?.yin)
    && Number.isInteger(profile.yinYang?.yang);
}

export function createSymbolicShareArtifact(
  profile: SymbolicProfile,
  options: { now?: Date; ttlDays?: number } = {},
): SymbolicShareArtifact {
  const now = options.now ?? new Date();
  const ttlDays = options.ttlDays ?? SYMBOLIC_SHARE_DEFAULT_TTL_DAYS;
  if (!Number.isInteger(ttlDays) || ttlDays < 1 || ttlDays > SYMBOLIC_SHARE_MAX_TTL_DAYS) {
    throw new RangeError(`Share artifact TTL must be between 1 and ${SYMBOLIC_SHARE_MAX_TTL_DAYS} days`);
  }
  const body: ArtifactBody = {
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + ttlDays * 86_400_000).toISOString(),
    profile: profileForShare(profile),
    schema: "oiyo.symbolic-share",
    schemaVersion: SYMBOLIC_SHARE_SCHEMA_VERSION,
  };
  const serialized = JSON.stringify(body);
  return { ...body, checksum: crc32(serialized) };
}

export function encodeSymbolicShareArtifact(artifact: SymbolicShareArtifact): string {
  return LZString.compressToEncodedURIComponent(JSON.stringify(artifact));
}

export function decodeSymbolicShareArtifact(
  encoded: string,
  options: { now?: Date } = {},
): DecodeShareArtifactResult {
  try {
    const serialized = LZString.decompressFromEncodedURIComponent(encoded);
    if (!serialized) return { ok: false, reason: "damaged" };
    const artifact = JSON.parse(serialized) as SymbolicShareArtifact;
    if (artifact.schema !== "oiyo.symbolic-share" || artifact.schemaVersion !== SYMBOLIC_SHARE_SCHEMA_VERSION) {
      return { ok: false, reason: "unsupported" };
    }
    if (!hasComparisonProfile(artifact.profile) || typeof artifact.createdAt !== "string" || typeof artifact.expiresAt !== "string") {
      return { ok: false, reason: "damaged" };
    }
    const { checksum, ...body } = artifact;
    if (typeof checksum !== "string" || crc32(JSON.stringify(body)) !== checksum) {
      return { ok: false, reason: "damaged" };
    }
    const now = options.now ?? new Date();
    if (!Number.isFinite(Date.parse(artifact.expiresAt)) || Date.parse(artifact.expiresAt) <= now.getTime()) {
      return { ok: false, reason: "expired" };
    }
    return { artifact, ok: true };
  } catch {
    return { ok: false, reason: "damaged" };
  }
}

export function symbolicShareFragment(artifact: SymbolicShareArtifact): string {
  return `#${SYMBOLIC_SHARE_FRAGMENT_KEY}=${encodeSymbolicShareArtifact(artifact)}`;
}

export function readSymbolicShareFragment(fragment: string, options: { now?: Date } = {}): DecodeShareArtifactResult | null {
  const params = new URLSearchParams(fragment.replace(/^#/, ""));
  const encoded = params.get(SYMBOLIC_SHARE_FRAGMENT_KEY);
  return encoded ? decodeSymbolicShareArtifact(encoded, options) : null;
}
