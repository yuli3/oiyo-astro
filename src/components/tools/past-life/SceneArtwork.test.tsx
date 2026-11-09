// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { PAST_LIFE_ART, PAST_LIFE_ART_NOTE, franceArtFor } from "../../../data/past-life-art";
import { FR_GROUPS } from "../../../lib/past-life-eras";
import { JOSEON_POSTS, JOSEON_PROVINCES } from "../../../data/past-life-1426";
import SceneArtwork from "./SceneArtwork";
import France1789 from "./France1789";
import JoseonPastLife from "./JoseonPastLife";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const locales = ["ko", "en", "ja", "zh", "fr", "es"] as const;

describe("released time-slip artwork", () => {
  for (const locale of locales) {
    it(`${locale}: real initial pages retain controls, a localized scene and a fiction caption`, () => {
      for (const Component of [JoseonPastLife, France1789]) {
        const container = document.createElement("div");
        container.innerHTML = renderToStaticMarkup(createElement(Component, { locale }));
        const image = container.querySelector("img");
        expect(image?.getAttribute("alt")?.length).toBeGreaterThan(5);
        expect(image?.getAttribute("width")).toBe("1248");
        expect(image?.getAttribute("height")).toBe("832");
        expect(image?.getAttribute("loading")).toBe("lazy");
        expect(container.querySelector("figcaption")?.textContent).toBe(PAST_LIFE_ART_NOTE[locale]);
        expect(container.querySelector("button")).not.toBeNull();
      }
    });
  }

  it("all public assets exist as native-size WebP, with no unreviewed batch referenced", () => {
    for (const asset of Object.values(PAST_LIFE_ART)) {
      const filename = `public/images/past-life-1426/${asset.file}`;
      expect(existsSync(filename)).toBe(true);
      const bytes = readFileSync(filename);
      expect(bytes.subarray(0, 4).toString()).toBe("RIFF");
      expect(bytes.subarray(8, 12).toString()).toBe("WEBP");
      expect(bytes.length).toBeLessThan(240_000);
      expect(asset.file).not.toMatch(/silla|us\/|florence|official|clerk/);
    }
    expect(franceArtFor("clergy")).toBe("franceClergy");
    expect(franceArtFor("bourgeoisie")).toBe("franceBourgeois");
    expect(franceArtFor("nobility")).toBe("franceNoble");
    expect(franceArtFor("peasants")).toBe("francePeasant");
    expect(franceArtFor("urban")).toBe("franceWorkers");
  });
});

describe("actual result and broken-image boundaries", () => {
  let container: HTMLDivElement;
  let root: Root;
  beforeEach(() => {
    window.history.replaceState(null, "", "/ko/france-1789/");
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    window.history.replaceState(null, "", "/");
  });

  for (const group of FR_GROUPS) {
    it(`${group}: a saved share URL renders the correct scene without altering the result`, () => {
      window.history.replaceState(null, "", `/ko/france-1789/?f=${group}&v=1`);
      act(() => root.render(createElement(France1789, { locale: "ko" })));
      const figure = container.querySelector("[data-timeslip-scene]");
      expect(figure?.getAttribute("data-timeslip-scene")).toBe(franceArtFor(group));
      expect(window.location.search).toBe(`?f=${group}&v=1`);
      expect(container.querySelectorAll("section").length).toBeGreaterThan(0);
      expect(container.textContent).toContain("삼부회");
    });
  }

  it("a Joseon shared result keeps its rank/robe/tablet text and identity diagram without the figure SVG", () => {
    const post = JOSEON_POSTS[0];
    window.history.replaceState(null, "", `/ko/joseon-1426/?j=${post.id}&p=${JOSEON_PROVINCES[0].id}`);
    act(() => root.render(createElement(JoseonPastLife, { locale: "ko" })));
    expect(container.textContent).toContain(post.ko);
    expect(container.textContent).toContain("홍포");
    expect(container.textContent).toContain("상아 홀");
    expect(container.querySelector('img[src$="hopae/wood-blank.webp"]')).not.toBeNull();
    expect(container.querySelector('svg[viewBox="0 0 160 360"]')).toBeNull();
    expect(container.querySelector('svg[viewBox="0 0 160 200"]')).toBeNull();
  });

  it("hides a failed picture, preserves the caption, and loads the next scene", () => {
    act(() => root.render(createElement(SceneArtwork, { scene: "franceNoble", locale: "en" })));
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    act(() => img?.dispatchEvent(new Event("error")));
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("figcaption")?.textContent).toBe(PAST_LIFE_ART_NOTE.en);
    act(() => root.render(createElement(SceneArtwork, { scene: "francePeasant", locale: "en" })));
    expect(container.querySelector("img")?.getAttribute("src")).toContain("peasant.webp");
  });
});
