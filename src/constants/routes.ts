import { ROUTES as REGISTRY_ROUTES } from "@/registry/routes";

/**
 * OIYO Route Glossary
 * Re-exporting from Registry to maintain SSOT.
 */
export const ROUTES = REGISTRY_ROUTES;
export type AppRoute = typeof ROUTES;
