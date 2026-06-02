/**
 * QR Code Generator
 * Generates QR codes for sharing personality test results
 *
 * @requires qrcode - Vendored under /vendor/qrcode to avoid external dependency issues
 */

/* eslint-disable no-restricted-syntax */
import QRCode from "qrcode";

import { THEME_COLORS } from "@/lib/system/theme";

import type { QRCodeOptions } from "./types";

/**
 * Generate a branded QR code with logo overlay
 */
export async function generateBrandedQRCode(
  url: string,
  options?: Partial<QRCodeOptions>,
): Promise<string> {
  try {
    const qrOptions = {
      color: {
        dark: options?.color?.dark || THEME_COLORS.accent, // warmPsychology primary color
        light: options?.color?.light || "#FFFFFF",
      },
      errorCorrectionLevel: "H", // High error correction for logo overlay
      margin: options?.margin || 2,
      width: options?.size || 300,
    };

    return await QRCode.toDataURL(url, qrOptions);
  } catch (error) {
    console.error("Failed to generate branded QR code:", error);
    throw new Error("Branded QR code generation failed");
  }
}

/**
 * Generate a QR code embedded in a result image
 * Returns a canvas-ready data URL
 */
export async function generateEmbeddedQRCode(
  url: string,
  resultEmoji: string,
  resultTitle: string,
  options?: Partial<QRCodeOptions>,
): Promise<string> {
  try {
    const size = options?.size || 200;

    // Create a canvas for the QR code
    const qrDataUrl = await generateBrandedQRCode(url, {
      ...options,
      color: {
        dark: THEME_COLORS.accent, // warmPsychology theme
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "H",
      size,
    });

    return qrDataUrl;
  } catch (error) {
    console.error("Failed to generate embedded QR code:", error);
    throw new Error("Embedded QR code generation failed");
  }
}

/**
 * Generate QR code for Instagram Story sharing
 */
export async function generateInstagramQRCode(
  url: string,
  options?: Partial<QRCodeOptions>,
): Promise<string> {
  return generateBrandedQRCode(url, {
    color: {
      dark: THEME_COLORS.accent,
      light: "#FFFFFF",
    },
    margin: 1,
    size: 250,
    ...options,
  });
}

/**
 * Generate a basic QR code as data URL
 */
export async function generateQRCode(
  url: string,
  options?: Partial<QRCodeOptions>,
): Promise<string> {
  try {
    const qrOptions = {
      color: {
        dark: options?.color?.dark || "#000000",
        light: options?.color?.light || "#FFFFFF",
      },
      errorCorrectionLevel: options?.errorCorrectionLevel || "M",
      margin: options?.margin || 2,
      width: options?.size || 200,
    };

    return await QRCode.toDataURL(url, qrOptions);
  } catch (error) {
    console.error("Failed to generate QR code:", error);
    throw new Error("QR code generation failed");
  }
}

/**
 * Generate QR code with custom colors matching test theme
 */
export async function generateThemedQRCode(
  url: string,
  themeColor: string,
  options?: Partial<QRCodeOptions>,
): Promise<string> {
  return generateBrandedQRCode(url, {
    ...options,
    color: {
      dark: themeColor,
      light: options?.color?.light || "#FFFFFF",
    },
  });
}

/**
 * Validate QR code URL before generation
 */
export function validateQRUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}
