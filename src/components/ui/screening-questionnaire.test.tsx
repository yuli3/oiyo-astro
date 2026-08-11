import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ScreeningQuestionnaire } from "./screening-questionnaire";

describe("ScreeningQuestionnaire", () => {
  it("keeps screening limits and support copy next to the accessible question", () => {
    const html = renderToStaticMarkup(
      <ScreeningQuestionnaire
        title="Anxiety screening"
        subtitle="Check your recent experience"
        question="How often have you felt anxious?"
        questionLabel="1 / 7"
        progress={0}
        options={[{ label: "Not at all", value: 0 }, { label: "Nearly every day", value: 3 }]}
        screeningNote="This screening is not a diagnosis."
        supportMessage="Professional support is available."
        onSelect={vi.fn()}
      />,
    );

    expect(html).toContain("<fieldset");
    expect(html).toContain("<legend");
    expect(html).toContain('aria-valuenow="0"');
    expect(html).toContain("This screening is not a diagnosis.");
    expect(html).toContain("Professional support is available.");
  });
});
