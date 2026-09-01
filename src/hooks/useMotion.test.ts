/**
 * The motion contract has two halves. The CSS half lives in
 * src/styles/global.css; this is the JS half — the single primitive every
 * canvas/WebGL/rAF surface now reads.
 *
 * It is worth testing precisely *because* it is shared. Before consolidation
 * the same hook existed as eight byte-identical private copies plus three
 * inline `matchMedia` effects, and one of those never subscribed to changes at
 * all — turning the setting on mid-session left that scene animating.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import { prefersReducedMotion, reducedMotionStore } from "./useMotion";

type Listener = () => void;

function mockMatchMedia(reduce: boolean) {
  const listeners = new Set<Listener>();
  const queries: string[] = [];
  const mql = {
    get matches() {
      return reduce;
    },
    addEventListener: (_: string, cb: Listener) => listeners.add(cb),
    removeEventListener: (_: string, cb: Listener) => listeners.delete(cb),
  };
  vi.stubGlobal("window", {
    matchMedia: (query: string) => {
      queries.push(query);
      return mql;
    },
  });
  return {
    queries,
    listenerCount: () => listeners.size,
    change(next: boolean) {
      reduce = next;
      for (const cb of listeners) cb();
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("motion contract — JS half", () => {
  it("reads the preference the CSS half keys off", () => {
    const media = mockMatchMedia(true);
    expect(reducedMotionStore.getSnapshot()).toBe(true);
    // Same query string as the @media block in global.css; a mismatch here
    // would let the two halves disagree.
    expect(media.queries).toEqual(["(prefers-reduced-motion: reduce)"]);

    mockMatchMedia(false);
    expect(reducedMotionStore.getSnapshot()).toBe(false);
  });

  it("notifies subscribers when the preference changes mid-session", () => {
    const media = mockMatchMedia(false);
    const onChange = vi.fn();
    reducedMotionStore.subscribe(onChange);

    media.change(true);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(reducedMotionStore.getSnapshot()).toBe(true);
  });

  it("unsubscribes through the returned cleanup", () => {
    const media = mockMatchMedia(false);
    const unsubscribe = reducedMotionStore.subscribe(() => {});
    expect(media.listenerCount()).toBe(1);
    unsubscribe();
    expect(media.listenerCount()).toBe(0);
  });

  it("assumes no preference on the server, so SSR and hydration agree", () => {
    expect(reducedMotionStore.getServerSnapshot()).toBe(false);
  });

  it("gives imperative code the same answer", () => {
    // Event handlers (smooth scrolling) cannot call a hook and must not grow
    // their own matchMedia call to work around that.
    mockMatchMedia(true);
    expect(prefersReducedMotion()).toBe(true);
    mockMatchMedia(false);
    expect(prefersReducedMotion()).toBe(false);
  });
});
