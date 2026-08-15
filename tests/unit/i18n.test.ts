import { describe, expect, it } from "vitest";

import { detectSystemLanguage, normalizeLanguage, supportedLanguages, translate } from "../../src/features/i18n/i18n";

describe("i18n", () => {
  it("supports the beta languages", () => {
    expect(supportedLanguages).toEqual(["es", "en", "fr", "pt"]);
  });

  it("normalizes regional language tags", () => {
    expect(normalizeLanguage("es-CO")).toBe("es");
    expect(normalizeLanguage("en-US")).toBe("en");
    expect(normalizeLanguage("fr-FR")).toBe("fr");
    expect(normalizeLanguage("pt-BR")).toBe("pt");
  });

  it("falls back to Spanish for unsupported languages", () => {
    expect(normalizeLanguage("de-DE")).toBe("es");
    expect(normalizeLanguage(null)).toBe("es");
  });

  it("reads the native device locale instead of Intl", () => {
    expect(detectSystemLanguage(() => [{ languageCode: "es", languageTag: "es-CO" }])).toBe("es");
    expect(detectSystemLanguage(() => [{ languageCode: "en", languageTag: "en-US" }])).toBe("en");
  });

  it("keeps language labels available in all supported languages", () => {
    for (const language of supportedLanguages) {
      expect(translate(language, "settings.language.es")).toBeTruthy();
      expect(translate(language, "settings.language.en")).toBeTruthy();
      expect(translate(language, "settings.language.fr")).toBeTruthy();
    }
  });
});
