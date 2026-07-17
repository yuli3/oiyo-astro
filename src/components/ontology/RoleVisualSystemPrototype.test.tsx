import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { RoleVisualSystemPrototype } from "./RoleVisualSystemPrototype";
import {
  resolveRoleVisualLiveMessage,
  transitionRoleVisualInteraction,
  type RoleVisualActivationTrigger,
} from "../../lib/role-visual-system";

describe("RoleVisualSystemPrototype", () => {
  const messages = { idle: "idle message", saved: "saved message", shared: "shared message" };

  it.each(["click", "Enter", "Space"] satisfies RoleVisualActivationTrigger[])(
    "treats %s activation as the same saved/share transition",
    (trigger) => {
      const saved = transitionRoleVisualInteraction("idle", { type: "activate", target: "saved", trigger });
      const shared = transitionRoleVisualInteraction(saved, { type: "activate", target: "shared", trigger });

      expect(saved).toBe("saved");
      expect(shared).toBe("shared");
      expect(resolveRoleVisualLiveMessage(saved, messages)).toBe("saved message");
      expect(resolveRoleVisualLiveMessage(shared, messages)).toBe("shared message");
    },
  );

  it("resets the interaction message when the scenario changes", () => {
    expect(transitionRoleVisualInteraction("shared", { type: "reset", trigger: "scenario-change" })).toBe("idle");
    expect(resolveRoleVisualLiveMessage("idle", messages)).toBe("idle message");
  });

  it("renders text-only score meaning and accessible native interaction contracts", () => {
    const html = renderToStaticMarkup(<RoleVisualSystemPrototype locale="en" />);

    expect(html).toContain("Role-result visual experiment");
    expect(html).toContain("One signal is relatively clear");
    expect(html).toContain("Score 84/100");
    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-valuenow="84"');
    expect(html).toContain('aria-valuetext="84/100"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain("Nothing has been saved or shared.");
    expect(html).toContain("prefers-reduced-motion: reduce");
  });
});
