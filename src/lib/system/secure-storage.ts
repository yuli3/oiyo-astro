"use client";

/**
 * localStorage wrapper with light obfuscation — NOT encryption.
 *
 * The XOR keystream below uses a fixed, source-visible key: it only deters
 * casual devtools shoulder-surfing, not any real adversary. localStorage is
 * same-origin sandboxed by the browser; that is the actual security boundary.
 * All data stays on the user's device and is never sent to a server.
 * (Format kept as-is for backward compatibility with previously stored values.)
 */

const STORAGE_SECRET = "oiyo-storage-secret";
const ENCODE_PREFIX = "__enc__:";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function clearSecureItemsByPrefix(prefix: string): void {
  if (!isStorageAvailable()) return;

  const keys: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      keys.push(key);
    }
  }

  keys.forEach(removeSecureItem);
}

export function getSecureItem<T>(key: string, fallback: T): T {
  if (!isStorageAvailable()) return fallback;

  try {
    const stored = window.localStorage.getItem(key);
    if (stored === null) {
      return fallback;
    }

    const decrypted = decryptString(stored);

    if (decrypted !== null) {
      return JSON.parse(decrypted) as T;
    }

    // Legacy plain storage fallback
    try {
      const parsed = JSON.parse(stored) as T;
      // Migrate to encrypted storage
      setSecureItem(key, parsed);
      return parsed;
    } catch {
      const plainValue = stored as unknown as T;
      setSecureItem(key, plainValue);
      return plainValue;
    }
  } catch (error) {
    console.error("SecureStorage: Failed to read item", error);
    return fallback;
  }
}

export function removeSecureItem(key: string): void {
  if (!isStorageAvailable()) return;
  window.localStorage.removeItem(key);
}

export function setSecureItem<T>(
  key: string,
  value: null | T | undefined,
): void {
  if (!isStorageAvailable()) return;

  if (value === undefined || value === null) {
    window.localStorage.removeItem(key);
    return;
  }

  try {
    const json = JSON.stringify(value);
    const encrypted = encryptString(json);
    window.localStorage.setItem(key, encrypted);
  } catch (error) {
    console.error("SecureStorage: Failed to store item", error);
  }
}

function base64ToBytes(base64: string): Uint8Array {
  if (typeof window !== "undefined" && typeof window.atob === "function") {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(base64, "base64"));
  }

  throw new Error("Base64 decoding is not supported in this environment");
}

function bytesToBase64(bytes: Uint8Array): string {
  if (typeof window !== "undefined" && typeof window.btoa === "function") {
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }

  throw new Error("Base64 encoding is not supported in this environment");
}

function createKeyStream(length: number): Uint8Array {
  const seed = getEntropySeed();
  const seedBytes = encoder.encode(seed);
  const keyStream = new Uint8Array(length);

  let hash = 2166136261; // FNV-1a offset basis
  for (let i = 0; i < seedBytes.length; i++) {
    hash ^= seedBytes[i];
    hash = Math.imul(hash, 16777619);
  }

  for (let i = 0; i < length; i++) {
    hash ^= seedBytes[i % seedBytes.length] ^ (i & 0xff);
    hash = Math.imul(hash, 16777619) >>> 0;
    keyStream[i] = hash & 0xff;
  }

  return keyStream;
}

function decryptString(cipherText: string): null | string {
  if (!cipherText.startsWith(ENCODE_PREFIX)) {
    return null;
  }

  const payload = cipherText.slice(ENCODE_PREFIX.length);
  if (!payload) {
    return "";
  }

  const encryptedBytes = base64ToBytes(payload);
  const keyStream = createKeyStream(Math.max(1, encryptedBytes.length));
  const decrypted = new Uint8Array(encryptedBytes.length);

  for (let i = 0; i < encryptedBytes.length; i++) {
    decrypted[i] = encryptedBytes[i] ^ keyStream[i];
  }

  return decoder.decode(decrypted);
}

function encryptString(plainText: string): string {
  if (!plainText.length) {
    return ENCODE_PREFIX;
  }

  const data = encoder.encode(plainText);
  const keyStream = createKeyStream(Math.max(1, data.length));
  const encrypted = new Uint8Array(data.length);

  for (let i = 0; i < data.length; i++) {
    encrypted[i] = data[i] ^ keyStream[i];
  }

  return `${ENCODE_PREFIX}${bytesToBase64(encrypted)}`;
}

function getEntropySeed(): string {
  const navigatorInfo =
    typeof navigator !== "undefined" ? navigator.userAgent : "server";
  const locationInfo =
    typeof window !== "undefined" ? window.location.origin : "server";
  return `${STORAGE_SECRET}|${navigatorInfo}|${locationInfo}`;
}

function isStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const testKey = "__secure_storage_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export const secureStorage = {
  clearByPrefix: clearSecureItemsByPrefix,
  get: getSecureItem,
  remove: removeSecureItem,
  set: setSecureItem,
};
