import { describe, expect, it } from "vitest";

import { routeTransitionName } from "./view-transition-name";

describe("routeTransitionName", () => {
  it("produces a valid CSS custom-ident", () => {
    // Custom-idents cannot start with a digit and cannot contain slashes.
    for (const path of ["/ko/big5/test", "/en/16-personalities/", "/ja/x"]) {
      expect(routeTransitionName(path)).toMatch(/^[a-z][a-z0-9-]*$/);
    }
  });

  it("gives the same name in every locale", () => {
    // The pair is matched by name across a navigation. A Korean listing card
    // and the Korean page share a name; so do the English ones — and both
    // resolve to the same name, so the mapping stays one rule, not six.
    const ko = routeTransitionName("/ko/attachment-style/test/");
    expect(ko).toBe(routeTransitionName("/en/attachment-style/test/"));
    expect(ko).toBe("route-attachment-style-test");
  });

  it("distinguishes routes that share a prefix", () => {
    // Two names colliding in one document makes the browser skip the whole
    // transition, so distinctness is not cosmetic.
    expect(routeTransitionName("/ko/mbti/test")).not.toBe(
      routeTransitionName("/ko/mbti/career"),
    );
  });

  it("handles the locale root", () => {
    expect(routeTransitionName("/ko/")).toBe("route-home");
  });
});
