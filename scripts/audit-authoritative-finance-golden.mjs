#!/usr/bin/env node

import { computeSubtotals } from "../src/lib/finance/income-statement.ts";
import { computeRatioPercent } from "../src/lib/finance/financial-ratios.ts";

const input = await new Promise((resolve, reject) => {
  let body = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => { body += chunk; });
  process.stdin.on("end", () => resolve(body));
  process.stdin.on("error", reject);
});

const fixtures = JSON.parse(input);
const errors = [];
const FIXTURE_FIELDS = new Set([
  "id", "engine", "module", "export", "assetIds", "sourceImplementation",
  "operation", "inputs", "expected", "tolerance",
]);
const ENGINES = {
  "oiyo.compute-ratio-percent": {
    module: "src/lib/finance/financial-ratios.ts",
    export: "computeRatioPercent",
    sourceImplementation: "src/components/tools/FinancialRatioExplorer.tsx",
    operations: new Set(["divide-percent"]),
  },
  "oiyo.compute-income-statement-subtotals": {
    module: "src/lib/finance/income-statement.ts",
    export: "computeSubtotals",
    sourceImplementation: "src/components/tools/IncomeStatementGame.tsx",
    operations: new Set(["income-statement"]),
  },
};

function matches(actual, expected, tolerance) {
  if (expected && typeof expected === "object" && !Array.isArray(expected)) {
    return actual && typeof actual === "object"
      && Object.keys(actual).sort().join("|") === Object.keys(expected).sort().join("|")
      && Object.keys(expected).every((key) => matches(actual[key], expected[key], tolerance));
  }
  return typeof actual === "number" && typeof expected === "number"
    && Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance;
}

for (const fixture of fixtures.fixtures ?? []) {
  try {
    if (Object.keys(fixture).some((key) => !FIXTURE_FIELDS.has(key)) || FIXTURE_FIELDS.size !== Object.keys(fixture).length) {
      throw new Error("fixture fields do not match executable contract");
    }
    const engine = ENGINES[fixture.engine];
    if (!engine
      || fixture.module !== engine.module
      || fixture.export !== engine.export
      || fixture.sourceImplementation !== engine.sourceImplementation
      || !engine.operations.has(fixture.operation)
      || !Array.isArray(fixture.assetIds)
      || fixture.assetIds.length === 0
      || new Set(fixture.assetIds).size !== fixture.assetIds.length) {
      throw new Error("fixture engine/source binding mismatch");
    }
    let actual;
    if (fixture.operation === "divide-percent") {
      actual = computeRatioPercent(fixture.inputs.numerator, fixture.inputs.denominator);
    } else if (fixture.operation === "income-statement") {
      const i = fixture.inputs;
      actual = computeSubtotals([
        { id: "fixture-revenue", name: {}, amount: i.revenue, line: "revenue" },
        { id: "fixture-cogs", name: {}, amount: i.cogs, line: "cogs" },
        { id: "fixture-sga", name: {}, amount: i.sga, line: "sga" },
        { id: "fixture-nonop-income", name: {}, amount: i.nonOperatingIncome, line: "nonop_income" },
        { id: "fixture-nonop-expense", name: {}, amount: i.nonOperatingExpense, line: "nonop_expense" },
        { id: "fixture-tax", name: {}, amount: i.tax, line: "tax" },
      ]);
    } else {
      throw new Error(`unsupported operation: ${fixture.operation}`);
    }
    const tolerance = fixture.tolerance ?? 0;
    if (!matches(actual, fixture.expected, tolerance)) {
      errors.push(`golden fixture output mismatch: ${fixture.id}`);
    }
  } catch (error) {
    errors.push(`golden fixture invalid: ${fixture.id}: ${error.message}`);
  }
}

if (errors.length) {
  process.stderr.write(`${errors.join("\n")}\n`);
  process.exit(1);
}
process.stdout.write(`production finance golden PASS: ${(fixtures.fixtures ?? []).length} fixtures\n`);
