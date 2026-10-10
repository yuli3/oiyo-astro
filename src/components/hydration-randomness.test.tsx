// @vitest-environment jsdom
import React, { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import TypingTest from "./tests/TypingTest";
import TypingSpeedTest from "./tests/TypingSpeedTest";
import IncomeStatementGame from "./tools/IncomeStatementGame";
import { ACCOUNT_ITEMS, LINES } from "../lib/finance/income-statement";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

describe("randomized tools preserve the initial hydration contract", () => {
  for (const [name, Component] of [
    ["typing", TypingTest],
    ["typing speed", TypingSpeedTest],
    ["income statement", IncomeStatementGame],
  ] as const) {
    for (const locale of ["ko", "en", "ja", "zh", "fr", "es"] as const) {
    it(`${name}/${locale}: different server/client RNG does not replace server HTML`, async () => {
      const random = vi.spyOn(Math, "random").mockReturnValue(0);
      const container = document.createElement("div");
      document.body.append(container);
      const errors: unknown[] = [];
      let root: ReturnType<typeof hydrateRoot> | undefined;
      try {
        container.innerHTML = renderToString(<Component locale={locale} />);
        const serverText = container.textContent;
        expect(random).not.toHaveBeenCalled();
        random.mockReturnValue(0.99);
        await act(async () => {
          root = hydrateRoot(container, <Component locale={locale} />, {
            onRecoverableError: (error) => errors.push(error),
          });
        });
        expect(errors).toEqual([]);
        expect(random).toHaveBeenCalled();
        expect(container.textContent?.length).toBeGreaterThan(0);
        if (name !== "income statement") {
          expect(container.textContent).not.toBe(serverText);
        }
        if (locale === "en" && name !== "income statement") {
          vi.useFakeTimers();
          if (name === "typing speed") {
            const start = [...container.querySelectorAll("button")].find((b) => b.textContent === "Start");
            expect(start).toBeDefined();
            await act(async () => start?.click());
          }
          const input = container.querySelector("input, textarea");
          if (!(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement)) {
            throw new Error("Typing control was not rendered");
          }
          await act(async () => {
            const prototype = input instanceof HTMLInputElement ? HTMLInputElement.prototype : HTMLTextAreaElement.prototype;
            Object.getOwnPropertyDescriptor(prototype, "value")?.set?.call(input, "abc");
            input.dispatchEvent(new Event("input", { bubbles: true }));
          });
          expect(input.value).toBe("abc");
          expect([...container.querySelectorAll("p")].map((p) => p.textContent)).toContain("3");
          await act(async () => vi.advanceTimersByTime(1000));
          expect(container.textContent).toContain(name === "typing" ? "29s" : "59s");
        }
        if (locale === "en" && name === "income statement") {
          const current = container.querySelector("p.mb-4")?.textContent;
          const item = ACCOUNT_ITEMS.find((i) => current?.includes(i.name.en ?? "NO_MATCH"));
          if (!item) throw new Error("Current account was not rendered");
          const line = LINES.find((l) => l.id === item.line);
          const button = [...container.querySelectorAll("button")].find((b) => b.textContent === line?.label.en);
          expect(button).toBeDefined();
          await act(async () => button?.click());
          expect(container.textContent).toContain("1 / 8");
          expect(container.textContent).toContain("First-try correct: 1/8");
        }
      } finally {
        await act(async () => root?.unmount());
        container.remove();
        random.mockRestore();
        vi.useRealTimers();
      }
    });
    }
  }
});
