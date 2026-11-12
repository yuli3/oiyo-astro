import { describe, expect, it } from "vitest";
import { GET } from "../pages/knowledge/tools.json";

// 2026-11-12: /knowledge/tools.json shipped `count: 0` (build-only; see scripts/audit-knowledge-catalog.mjs) because the "[locale]" glob
// was read as a character class. Guard the catalog against going empty again.
describe("/knowledge/tools.json", () => {
  it("lists the real localized tool and test routes", async () => {
    const response = await GET({} as Parameters<typeof GET>[0]);
    const body = await response.json();
    expect(body.count).toBeGreaterThan(100);
    expect(body.itemListElement).toHaveLength(body.count);
    const ids = body.itemListElement.map((tool: { id: string }) => tool.id);
    expect(ids).toContain("mbti-love-test");
    expect(ids).toContain("saju/calculator");
    expect(ids.some((id: string) => id.includes("["))).toBe(false);
    expect(ids).not.toContain("about");
  });
});
