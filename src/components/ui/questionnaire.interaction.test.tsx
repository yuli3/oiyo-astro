// @vitest-environment jsdom
import * as React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Questionnaire } from "./questionnaire";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

describe("Questionnaire interaction boundary", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.useRealTimers();
  });

  const props = {
    title: "Reflection",
    subtitle: "Choose one answer",
    question: "A delayed question",
    questionLabel: "1 / 2",
    progress: 0,
    options: [{ label: "First", value: 1 }, { label: "Second", value: 2 }],
  };

  function choice(index = 0) {
    const button = container.querySelectorAll("fieldset button")[index];
    if (!(button instanceof HTMLButtonElement)) throw new Error("Choice button missing");
    return button;
  }

  it("accepts only the first answer while the parent has not advanced", () => {
    const onSelect = vi.fn();
    act(() => root.render(<Questionnaire {...props} onSelect={onSelect} />));
    act(() => {
      choice().click();
      choice(1).click();
      choice().click();
    });
    expect(onSelect.mock.calls).toEqual([[1]]);
  });

  it("stays locked across answer-only rerenders and unlocks identical-text next and previous questions", () => {
    const onSelect = vi.fn();
    const onPrevious = vi.fn();
    act(() => root.render(<Questionnaire {...props} onSelect={onSelect} onPrevious={onPrevious} previousLabel="Previous" />));
    act(() => {
      choice().click();
      const previous = container.querySelector("button:not(fieldset button)");
      if (!(previous instanceof HTMLButtonElement)) throw new Error("Previous missing");
      previous.click();
    });
    expect(onPrevious).not.toHaveBeenCalled();
    act(() => root.render(<Questionnaire {...props} selectedValue={1} onSelect={onSelect} onPrevious={onPrevious} previousLabel="Previous" />));
    expect(choice().disabled).toBe(true);
    act(() => choice(1).click());
    expect(onSelect.mock.calls).toEqual([[1]]);

    act(() => root.render(<Questionnaire {...props} questionLabel="2 / 2" onSelect={onSelect} />));
    expect(choice().disabled).toBe(false);
    expect(document.activeElement?.tagName).toBe("LEGEND");
    act(() => choice(1).click());
    expect(onSelect.mock.calls).toEqual([[1], [2]]);

    act(() => root.render(<Questionnaire {...props} selectedValue={1} onSelect={onSelect} />));
    expect(choice().disabled).toBe(false);
    expect(choice().getAttribute("aria-pressed")).toBe("true");
    act(() => choice(1).click());
    expect(onSelect.mock.calls).toEqual([[1], [2], [2]]);
  });

  it("finishes a delayed two-question parent once without changing the stored values", () => {
    vi.useFakeTimers();
    const completed = vi.fn();
    function DelayedParent() {
      const [index, setIndex] = React.useState(0);
      const [answers, setAnswers] = React.useState<number[]>([]);
      if (index === 2) return <p>Result</p>;
      return <Questionnaire {...props} questionLabel={`${index + 1} / 2`} selectedValue={answers[index]} onSelect={(value) => {
        const next = answers.slice(0, index);
        next[index] = value;
        setAnswers(next);
        setTimeout(() => {
          if (index === 1) completed(next);
          setIndex(index + 1);
        }, 280);
      }} />;
    }
    act(() => root.render(<DelayedParent />));
    act(() => { choice().click(); choice(1).click(); });
    expect(choice().disabled).toBe(true);
    act(() => vi.advanceTimersByTime(280));
    expect(choice().disabled).toBe(false);
    act(() => { choice(1).click(); choice().click(); });
    act(() => vi.advanceTimersByTime(280));
    expect(container.textContent).toBe("Result");
    expect(completed.mock.calls).toEqual([[[1, 2]]]);
  });

  it("allows retry after the parent synchronously rejects an answer", () => {
    const rejection = new Error("Expected parent rejection");
    const observed: unknown[] = [];
    const onError = (event: ErrorEvent) => {
      if (event.error !== rejection) return;
      observed.push(event.error);
      event.preventDefault();
    };
    const onSelect = vi.fn().mockImplementationOnce(() => { throw rejection; });
    window.addEventListener("error", onError);
    try {
      act(() => root.render(<Questionnaire {...props} onSelect={onSelect} />));
      act(() => choice().click());
      expect(observed).toEqual([rejection]);
      expect(choice().disabled).toBe(false);
      act(() => choice(1).click());
      expect(onSelect.mock.calls).toEqual([[1], [2]]);
    } finally {
      window.removeEventListener("error", onError);
    }
  });
});
