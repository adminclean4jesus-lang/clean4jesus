import { describe, expect, it } from "vitest";

import { getLocalizedDevotionals, localize, localizePlan } from "@/features/i18n/localizedContent";
import { detectSystemLanguage, normalizeLanguage, resolveStartupLanguage, supportedLanguages } from "@/features/i18n/i18n";
import { uiText } from "@/features/i18n/uiText";
import { devotionalPlans } from "@/data/devotionalPlans";

describe("cobertura base de idiomas", () => {
  it("mantiene los labels principales disponibles en los cuatro idiomas", () => {
    for (const language of supportedLanguages) {
      expect(uiText(language, "tabs.refuge")).toBeTruthy();
      expect(uiText(language, "tabs.word")).toBeTruthy();
      expect(uiText(language, "tabs.community")).toBeTruthy();
      expect(uiText(language, "tabs.profile")).toBeTruthy();
      expect(uiText(language, "word.catalogBody")).toBeTruthy();
    }
  });

  it("sustituye variables y usa español como fallback de contenido", () => {
    expect(uiText("en", "community.pulseTitle", { days: 4 })).toContain("4");
    expect(localize({ es: "Texto base" }, "fr")).toBe("Texto base");
    expect(localize({ es: "Español", fr: "Français" }, "fr")).toBe("Français");
  });

  it("normaliza variantes regionales y detecta un idioma soportado del sistema", () => {
    expect(normalizeLanguage("pt-BR")).toBe("pt");
    expect(normalizeLanguage("fr_CA")).toBe("fr");
    expect(supportedLanguages).toContain(detectSystemLanguage());
  });

  it("usa el idioma del celular hasta que el usuario elige otro expresamente", () => {
    expect(resolveStartupLanguage({ manuallySelected: false, storedLanguage: "en", systemLanguage: "es" })).toBe("es");
    expect(resolveStartupLanguage({ manuallySelected: true, storedLanguage: "en", systemLanguage: "es" })).toBe("en");
  });

  it("usa singular y plural correctos para los días", () => {
    for (const language of supportedLanguages) {
      expect(uiText(language, "word.day")).not.toBe(uiText(language, "word.days"));
    }
  });
  it("localiza los metadatos de planes en portugués", () => {
    expect(localizePlan(devotionalPlans[0], "pt").title).toBe("Primeiros 7 dias limpos");
  });

  it("entrega los 8 planes y sus 56 lecturas completas en cada idioma", () => {
    for (const language of supportedLanguages) {
      const plans = devotionalPlans.map((plan) => localizePlan(plan, language));
      expect(plans).toHaveLength(8);
      expect(plans.flatMap((plan) => plan.days)).toHaveLength(56);

      for (const day of plans.flatMap((plan) => plan.days)) {
        for (const field of ["title", "verse", "reflection", "question", "prayer", "practice"] as const) {
          expect(day[field].trim()).not.toBe("");
        }
      }
    }
  });

  it("entrega los 7 devocionales diarios completos en cada idioma", () => {
    for (const language of supportedLanguages) {
      const localized = getLocalizedDevotionals(language);
      expect(localized).toHaveLength(7);
      expect(localized.every((devotional) => devotional.title && devotional.reflection && devotional.question)).toBe(true);
    }
  });

  it("no cae silenciosamente al español para el contenido editorial conocido", () => {
    const spanishPlan = localizePlan(devotionalPlans[0], "es");
    const spanishDevotional = getLocalizedDevotionals("es")[0];

    for (const language of ["en", "fr", "pt"] as const) {
      const translatedPlan = localizePlan(devotionalPlans[0], language);
      const translatedDevotional = getLocalizedDevotionals(language)[0];
      expect(translatedPlan.days[0].reflection).not.toBe(spanishPlan.days[0].reflection);
      expect(translatedPlan.days[0].prayer).not.toBe(spanishPlan.days[0].prayer);
      expect(translatedDevotional.reflection).not.toBe(spanishDevotional.reflection);
    }
  });
});
