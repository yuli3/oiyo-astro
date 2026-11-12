#!/usr/bin/env node
// 2026-11-12: /knowledge/tools.json shipped `count: 0` for weeks. The "[locale]" glob is read as a
// character class only in the production build (vitest/dev matched fine), so only the built file
// can prove the catalog is real. Run after `npm run build`.
import { readFileSync } from "node:fs";

const MIN_TOOLS = 100;
const body = JSON.parse(readFileSync("dist/knowledge/tools.json", "utf8"));
const ids = (body.itemListElement || []).map((tool) => tool.id);
const problems = [];
if (body.count !== ids.length) problems.push(`count ${body.count} != items ${ids.length}`);
if (ids.length < MIN_TOOLS) problems.push(`only ${ids.length} tools (expected >= ${MIN_TOOLS})`);
if (ids.some((id) => id.includes("["))) problems.push("dynamic route leaked into the catalog");
if (problems.length) {
  console.error(`audit:knowledge-catalog failed: ${problems.join("; ")}`);
  process.exit(1);
}
console.log(`audit:knowledge-catalog ok: ${ids.length} tools`);
