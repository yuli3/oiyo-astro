import { describe, expect, it } from "vitest";

import { CorrelationEngine } from "../correlation-engine";

describe("CorrelationEngine Import Test", () => {
  it("should import without hanging", () => {
    expect(CorrelationEngine).toBeDefined();
  });
});
