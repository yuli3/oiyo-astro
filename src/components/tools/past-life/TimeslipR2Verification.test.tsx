// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, vi } from "vitest";
import SillaGolpum from "./SillaGolpum";
import France1789 from "./France1789";
import { renderCard, SaveCard, type CardSpec } from "./timeslip";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

describe("Timeslip Round 2 Verifications", () => {
  it("renders Silla commoner clothes when rank is null", () => {
    window.history.replaceState(null, "", "/?g=pyeongmin&d=3");
    const el = document.createElement("div");
    const root = createRoot(el);
    act(() => root.render(createElement(SillaGolpum, { locale: "ko" })));
    const img = el.querySelector('img[src$="robes/silla-commoner.webp"]');
    expect(img).not.toBeNull();
    expect(img?.getAttribute("alt")).toBe("평민의 삼베옷");
    expect(el.textContent).toContain("평민의 삼베옷");
    expect(el.textContent).toContain("AI 창작 삽화");
    act(() => root.unmount());
  });

  it("renders Silla official robe when rank is not null", () => {
    window.history.replaceState(null, "", "/?g=jingol&d=2");
    const el = document.createElement("div");
    const root = createRoot(el);
    act(() => root.render(createElement(SillaGolpum, { locale: "ko" })));
    const img = el.querySelector('img[src$="robes/silla-purple.webp"]');
    expect(img).not.toBeNull();
    act(() => root.unmount());
  });

  it("renders France clergy scene for clergy group", () => {
    window.history.replaceState(null, "", "/?f=clergy&v=0");
    const el = document.createElement("div");
    const root = createRoot(el);
    act(() => root.render(createElement(France1789, { locale: "ko" })));
    const img = el.querySelector('img[src$="france/first-estate.webp"]');
    expect(img).not.toBeNull();
    expect(img?.getAttribute("alt")).toBe("프랑스 성직자를 상상한 인물 그림");
    act(() => root.unmount());
  });

  it("renders France bourgeoisie scene for bourgeoisie group", () => {
    window.history.replaceState(null, "", "/?f=bourgeoisie&v=0");
    const el = document.createElement("div");
    const root = createRoot(el);
    act(() => root.render(createElement(France1789, { locale: "ko" })));
    const img = el.querySelector('img[src$="france/bourgeoisie.webp"]');
    expect(img).not.toBeNull();
    expect(img?.getAttribute("alt")).toBe("프랑스 부르주아를 상상한 인물 그림");
    act(() => root.unmount());
  });

  it("renders SaveCard with art preview and sets up canvas render with art", () => {
    const spec: CardSpec = {
      kicker: "1300년 전 · 신라 서라벌",
      title: "서라벌 백성",
      subtitle: "평민(3~1두품)",
      badge: "★ 흔함 · 3명 중 1명",
      lines: ["관등 없음 · 서라벌 백성", "평민의 삼베옷"],
      footer: "oiyo.net · 1300",
      accent: "#6b3d8f",
      art: "robes/silla-commoner.webp",
    };

    const el = document.createElement("div");
    const root = createRoot(el);
    act(() => root.render(createElement(SaveCard, { l: "ko", testId: "silla-golpum", filename: "test", spec })));
    const artImg = el.querySelector("img.timeslip-card-art");
    expect(artImg).not.toBeNull();
    expect(artImg?.getAttribute("src")).toContain("robes/silla-commoner.webp");
    expect(el.querySelector(".timeslip-card-copy")?.classList.contains("has-art")).toBe(true);

    // mock getContext for renderCard
    const mockCtx = {
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 0,
      font: "",
      textAlign: "",
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      drawImage: vi.fn(),
      measureText: vi.fn().mockReturnValue({ width: 100 }),
      fillText: vi.fn(),
    };
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(mockCtx as any);

    const fakeImg = new Image();
    Object.defineProperty(fakeImg, "naturalWidth", { value: 640 });
    Object.defineProperty(fakeImg, "naturalHeight", { value: 853 });
    const canvas = renderCard(spec, undefined, fakeImg);
    expect(canvas.width).toBe(720);
    expect(canvas.height).toBe(960);
    expect(mockCtx.drawImage).toHaveBeenCalled();
    act(() => root.unmount());
  });
});
