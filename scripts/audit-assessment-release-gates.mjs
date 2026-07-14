import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

import {
  ASSESSMENT_RELEASE_GATES,
  assertAssessmentReleaseGate,
  localizedAssessmentPath,
} from "../config/assessment-release-gates.js";

const root = resolve(import.meta.dirname, "..");
const errors = [];
for (const gate of ASSESSMENT_RELEASE_GATES) assertAssessmentReleaseGate(gate);

const sitemapFiles = readdirSync(resolve(root, "dist")).filter((name) => /^sitemap.*\.xml$/.test(name));
if (sitemapFiles.length === 0) errors.push("build produced no sitemap XML files");
const sitemapPaths = new Set(sitemapFiles.flatMap((name) => {
  const xml = readFileSync(resolve(root, "dist", name), "utf8");
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((match) => new URL(match[1]).pathname.replace(/\/$/, ""));
}));

let auditedRoutes = 0;
for (const gate of ASSESSMENT_RELEASE_GATES) for (const locale of gate.locales) {
  auditedRoutes += 1;
  const routePath = localizedAssessmentPath(locale, gate);
  const canonicalPath = new URL(gate.canonicalPattern.replace("{locale}", locale)).pathname.replace(/\/$/, "");
  if (gate.routeType !== "bridge" && routePath !== canonicalPath) errors.push(`${locale}: execution route and canonical pattern drift`);

  const artifactPath = resolve(root, "dist", ...routePath.split("/").filter(Boolean), "index.html");
  let html = "";
  try {
    html = readFileSync(artifactPath, "utf8");
  } catch {
    errors.push(`missing build artifact: ${artifactPath}`);
    continue;
  }
  const hasNoindex = [...html.matchAll(/<meta\b[^>]*>/gi)].some(([tag]) =>
    /\bname=["']robots["']/i.test(tag) && /\bcontent=["'][^"']*\bnoindex\b[^"']*["']/i.test(tag),
  );
  const inSitemap = sitemapPaths.has(routePath);
  const canonicalHref = [...html.matchAll(/<link\b[^>]*>/gi)]
    .map(([tag]) => tag)
    .find((tag) => /\brel=["']canonical["']/i.test(tag))
    ?.match(/\bhref=["']([^"']+)["']/i)?.[1];
  if (!canonicalHref || new URL(canonicalHref).pathname.replace(/\/$/, "") !== canonicalPath) {
    errors.push(`${routePath} canonical does not match release gate`);
  }

  if (gate.indexable) {
    if (hasNoindex) errors.push(`${routePath} is indexable but still has noindex`);
    if (!inSitemap) errors.push(`${routePath} is indexable but absent from sitemap`);
  } else {
    if (!hasNoindex) errors.push(`${routePath} is non-indexable but lacks robots noindex`);
    if (inSitemap) errors.push(`${routePath} is non-indexable but appears in sitemap`);
  }
}

if (errors.length) {
  console.error(`assessment release gate audit: ${errors.length} error(s)`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`assessment release gate audit: ${ASSESSMENT_RELEASE_GATES.length} assessments / ${auditedRoutes} locale routes consistent, 0 errors`);
