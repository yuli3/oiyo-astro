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

  it("does not render an empty support notice", () => {
    const html = renderToStaticMarkup(
      <ScreeningQuestionnaire
        title="Burnout screening"
        subtitle="Check your exhaustion"
        question="Do you feel exhausted?"
        questionLabel="1 / 10"
        progress={0}
        options={[{ label: "Never", value: 0 }]}
        screeningNote="Seek professional support when symptoms are severe."
        onSelect={vi.fn()}
      />,
    );

    expect(html).not.toContain("border-green-200");
    expect(html).toContain("Seek professional support when symptoms are severe.");
  });
});
