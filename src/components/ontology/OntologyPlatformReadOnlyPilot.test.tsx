import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { OntologyPlatformReadOnlyPilot } from "./OntologyPlatformReadOnlyPilot";

describe("OntologyPlatformReadOnlyPilot", () => {
  it("renders a loading boundary without embedding relationship data or a career conclusion", () => {
    const html = renderToStaticMarkup(<OntologyPlatformReadOnlyPilot locale="en" />);

    expect(html).toContain("Read-only relationship preview");
    expect(html).toContain("Loading relationship data.");
    expect(html).toContain("does not make a career-fit or personal conclusion");
    expect(html).toContain('aria-pressed="true"');
    expect(html).not.toContain("occupation.");
  });
});
