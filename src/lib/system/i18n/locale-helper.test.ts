import { describe, expect, it } from "vitest";

import type { Locale } from "@/i18n";

import {
  getBinaryLocaleText,
  getLocalizedText,
  getLocalizedTextWithFallback,
} from "./locale-helper";

describe("locale-helper", () => {
  const testContent = {
    cn: "中文",
    en: "English",
    es: "Español",
    fr: "Français",
    ja: "日本語",
    ko: "한국어",
  };

  describe("getLocalizedText", () => {
    it("should return correct text for each locale", () => {
      expect(getLocalizedText(testContent, "ko")).toBe("한국어");
      expect(getLocalizedText(testContent, "en")).toBe("English");
      expect(getLocalizedText(testContent, "ja")).toBe("日本語");
      expect(getLocalizedText(testContent, "cn")).toBe("中文");
      expect(getLocalizedText(testContent, "es")).toBe("Español");
      expect(getLocalizedText(testContent, "fr")).toBe("Français");
    });

    it("should work with complex objects", () => {
      const complexContent = {
        cn: { description: "描述", title: "标题" },
        en: { description: "Description", title: "Title" },
        es: { description: "Descripción", title: "Título" },
        fr: { description: "Description", title: "Titre" },
        ja: { description: "説明", title: "タイトル" },
        ko: { description: "설명", title: "제목" },
      };

      const result = getLocalizedText(complexContent, "ko");
      expect(result.title).toBe("제목");
      expect(result.description).toBe("설명");
    });

    it("should work with arrays", () => {
      const arrayContent = {
        cn: ["第一", "第二"],
        en: ["First", "Second"],
        es: ["Primero", "Segundo"],
        fr: ["Premier", "Deuxième"],
        ja: ["一番", "二番"],
        ko: ["첫째", "둘째"],
      };

      expect(getLocalizedText(arrayContent, "ko")).toEqual(["첫째", "둘째"]);
      expect(getLocalizedText(arrayContent, "en")).toEqual(["First", "Second"]);
    });
  });

  describe("getLocalizedTextWithFallback", () => {
    it("should return locale text when available", () => {
      const partialContent = {
        en: "English",
        ko: "한국어",
      };

      expect(getLocalizedTextWithFallback(partialContent, "ko")).toBe("한국어");
      expect(getLocalizedTextWithFallback(partialContent, "en")).toBe(
        "English",
      );
    });

    it("should fallback to English when locale not available", () => {
      const partialContent = {
        en: "English",
      };

      expect(getLocalizedTextWithFallback(partialContent, "ja")).toBe(
        "English",
      );
      expect(getLocalizedTextWithFallback(partialContent, "fr")).toBe(
        "English",
      );
    });

    it("should return undefined when no content available", () => {
      const emptyContent = {};

      expect(getLocalizedTextWithFallback(emptyContent, "ko")).toBeUndefined();
    });
  });

  describe("getBinaryLocaleText (deprecated)", () => {
    it("should return Korean for ko locale", () => {
      expect(getBinaryLocaleText("한국어", "English", "ko")).toBe("한국어");
    });

    it("should return English for non-ko locales", () => {
      expect(getBinaryLocaleText("한국어", "English", "en")).toBe("English");
      expect(getBinaryLocaleText("한국어", "English", "ja")).toBe("English");
      expect(getBinaryLocaleText("한국어", "English", "fr")).toBe("English");
    });
  });
});
