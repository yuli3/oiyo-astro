import { ErrorScope } from "./types";

export const ERROR_CODES = {
  // API (API)
  BAD_REQUEST: `${ErrorScope.API}-001`,
  // LIFESTYLE (LIFE)
  CALCULATION_FAILED: `${ErrorScope.LIFESTYLE}-001`,
  DB_ERROR: `${ErrorScope.DATA}-003`,

  FORBIDDEN: `${ErrorScope.AUTH}-002`,
  // SYSTEM (SYS)
  INTERNAL_SERVER_ERROR: `${ErrorScope.SYSTEM}-001`,
  INVALID_FORMAT: `${ErrorScope.DATA}-002`,

  INVALID_INPUT: `${ErrorScope.LIFESTYLE}-002`,
  INVALID_TOKEN: `${ErrorScope.AUTH}-003`,
  METHOD_NOT_ALLOWED: `${ErrorScope.API}-002`,

  // DATA (DATA)
  MISSING_DATA: `${ErrorScope.DATA}-001`,
  NOT_FOUND: `${ErrorScope.SYSTEM}-002`,
  RATE_LIMIT_EXCEEDED: `${ErrorScope.API}-003`,

  TRANSLATION_MISSING: `${ErrorScope.LIFESTYLE}-003`,
  // AUTH (AUTH)
  UNAUTHORIZED: `${ErrorScope.AUTH}-001`,
  UNEXPECTED_ERROR: `${ErrorScope.SYSTEM}-999`,
} as const;
