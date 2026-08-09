import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { Questionnaire } from "./questionnaire";

describe("Questionnaire", () => {
  it("renders the accessible questionnaire contract", () => {
    const html = renderToStaticMarkup(
      <Questionnaire
        title="Career values"
        subtitle="Choose what matters"
        question="How important is autonomy?"
        questionLabel="2 / 18"
        progress={6}
        options={[
          { label: "Not important", value: 1 },
          { label: "Very important", value: 5 },
        ]}
        selectedValue={5}
        note="Reflection only"
        previousLabel="Previous"
        onPrevious={vi.fn()}
        onSelect={vi.fn()}
      />,
    );

    expect(html).toContain("<fieldset");
    expect(html).toContain("<legend");
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('aria-valuenow="6"');
    expect(html).toContain("Previous");
    expect(html).toContain("Reflection only");
  });
});
