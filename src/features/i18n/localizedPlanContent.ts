import { devotionalPlans } from "@/data/devotionalPlans";
import plansEn from "@/data/translations/devotionalPlans.en.json";
import plansFr from "@/data/translations/devotionalPlans.fr.json";
import plansPt from "@/data/translations/devotionalPlans.pt.json";
import type { DevotionalPlan } from "@/types/devotionalPlan";
import type { SupportedLanguage } from "./i18n";

const translatedPlans = { en: plansEn, fr: plansFr, pt: plansPt } as const;

export function localizePlan(plan: DevotionalPlan, language: SupportedLanguage): DevotionalPlan {
  if (language === "es") return plan;
  const translations = translatedPlans[language] as Record<string, Omit<DevotionalPlan, "id" | "tone" | "icon">>;
  const translated = translations[plan.id];
  return translated ? ({ ...plan, ...translated } as DevotionalPlan) : plan;
}

export function getLocalizedPlanFallback(language: SupportedLanguage): DevotionalPlan[] {
  return devotionalPlans.map((plan) => localizePlan(plan, language));
}
