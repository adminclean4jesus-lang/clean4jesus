import type { SupportedLanguage } from "@/features/i18n/i18n";
import type { DevotionalPlanSummary } from "@/types/devotionalPlan";

type FallbackPlan = Pick<DevotionalPlanSummary, "icon" | "id" | "tone"> & {
  titles: Record<SupportedLanguage, string>;
};

const fallbackPlans: FallbackPlan[] = [
  { id: "primeros-7-dias", icon: "seed-outline", tone: "success", titles: { es: "Primeros 7 días limpio", en: "Your first 7 clean days", fr: "Vos 7 premiers jours libres", pt: "Seus primeiros 7 dias limpos" } },
  { id: "cuando-recai", icon: "heart-broken-outline", tone: "accent", titles: { es: "Cuando recaí", en: "When I relapsed", fr: "Quand j'ai rechuté", pt: "Quando recaí" } },
  { id: "ansiedad-y-soledad", icon: "weather-night", tone: "primary", titles: { es: "Ansiedad y soledad", en: "Anxiety and loneliness", fr: "Anxiété et solitude", pt: "Ansiedade e solidão" } },
  { id: "identidad-en-cristo", icon: "account-heart-outline", tone: "success", titles: { es: "Identidad en Cristo", en: "Identity in Christ", fr: "Identité en Christ", pt: "Identidade em Cristo" } },
  { id: "pureza-digital", icon: "cellphone-lock", tone: "primary", titles: { es: "Pureza digital", en: "Digital purity", fr: "Pureté numérique", pt: "Pureza digital" } },
  { id: "volver-a-empezar", icon: "restart", tone: "accent", titles: { es: "Volver a empezar", en: "Begin again", fr: "Recommencer", pt: "Começar novamente" } },
  { id: "fortaleza-noche", icon: "moon-waning-crescent", tone: "primary", titles: { es: "Fortaleza para la noche", en: "Strength for the night", fr: "Force pour la nuit", pt: "Força para a noite" } },
  { id: "sanidad-verguenza", icon: "emoticon-outline", tone: "accent", titles: { es: "Sanidad de la vergüenza", en: "Healing from shame", fr: "Guérir de la honte", pt: "Cura da vergonha" } },
];

const genericCopy: Record<SupportedLanguage, { description: string; subtitle: string }> = {
  es: { description: "Un camino guiado de siete días para volver a caminar con Cristo.", subtitle: "Siete lecturas, un día a la vez." },
  en: { description: "A seven-day guided path to walk with Christ again.", subtitle: "Seven readings, one day at a time." },
  fr: { description: "Un parcours guidé de sept jours pour marcher de nouveau avec Christ.", subtitle: "Sept lectures, un jour à la fois." },
  pt: { description: "Um caminho guiado de sete dias para voltar a caminhar com Cristo.", subtitle: "Sete leituras, um dia de cada vez." },
};

export function getDevotionalCatalogFallback(language: SupportedLanguage): DevotionalPlanSummary[] {
  return fallbackPlans.map((plan) => ({
    dayCount: 7,
    dayTitles: [],
    description: genericCopy[language].description,
    icon: plan.icon,
    id: plan.id,
    subtitle: genericCopy[language].subtitle,
    title: plan.titles[language],
    tone: plan.tone,
  }));
}
