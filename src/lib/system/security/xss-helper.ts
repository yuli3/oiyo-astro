/**
 * Security utilities for XSS prevention and sanitization.
 */

/**
 * Sanitizes a string for safe inclusion in JSON-LD or script tags.
 * Replaces characters that could be used to break out of a script context.
 */
export function sanitizeJsonLdField(text: string): string {
  if (!text) return text;

  // Replace </script> with a safely escaped version to prevent script injection
  // This is the most common vector in JSON-LD script blocks
  return text.replace(/<\/script/gi, "<\\/script");
}

/**
 * Deeply sanitizes an object for JSON-LD.
 */
export function sanitizeJsonLdObject<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "string") {
    return sanitizeJsonLdField(obj) as any;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeJsonLdObject(item)) as any;
  }

  if (typeof obj === "object") {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeJsonLdObject(value);
    }
    return sanitized as T;
  }

  return obj;
}
