import type { DevotionalPlan } from "@/types/devotionalPlan";
import type { Devotional } from "@/types/devotional";
import devotionalsEs from "@/data/devotionals.json";
import devotionalsEn from "@/data/translations/devotionals.en.json";
import devotionalsFr from "@/data/translations/devotionals.fr.json";
import devotionalsPt from "@/data/translations/devotionals.pt.json";
import plansEn from "@/data/translations/devotionalPlans.en.json";
import plansFr from "@/data/translations/devotionalPlans.fr.json";
import plansPt from "@/data/translations/devotionalPlans.pt.json";
import type { SupportedLanguage } from "./i18n";

export type LocalizedText = Partial<Record<SupportedLanguage, string>> & { es: string };

export function localize(value: string | Partial<LocalizedText>, language: SupportedLanguage) {
  if (typeof value === "string") return value;
  return value[language] ?? value.es ?? value.en ?? value.fr ?? value.pt ?? "";
}

type PlanCopy = { title: LocalizedText; subtitle: LocalizedText; description: LocalizedText };

const planCopy: Record<string, PlanCopy> = {
  "primeros-7-dias": {
    title: { es: "Primeros 7 días limpio", en: "First 7 days clean", fr: "Les 7 premiers jours libres" },
    subtitle: { es: "Siete pasos pequeños pueden convertirse en un nuevo comienzo.", en: "Seven small steps can become a new beginning.", fr: "Sept petits pas peuvent devenir un nouveau départ." },
    description: { es: "Un camino sencillo para volver a ordenar tus pantallas y caminar con Cristo, un día a la vez.", en: "A simple path to reorder your screens and walk with Christ, one day at a time.", fr: "Un chemin simple pour remettre de l'ordre dans vos écrans et marcher avec Christ, un jour à la fois." },
  },
  "cuando-recai": {
    title: { es: "Cuando recaí", en: "When I fell again", fr: "Après une rechute" },
    subtitle: { es: "La vergüenza no tiene la última palabra cuando vuelves a la luz.", en: "Shame does not have the final word when you return to the light.", fr: "La honte n'a pas le dernier mot lorsque vous revenez à la lumière." },
    description: { es: "Un plan para volver a Dios después de una caída, sin negar el pecado ni rendirte a la vergüenza.", en: "A plan to return to God after a fall without denying sin or surrendering to shame.", fr: "Un plan pour revenir à Dieu après une chute, sans nier le péché ni céder à la honte." },
  },
  "ansiedad-y-soledad": {
    title: { es: "Ansiedad y soledad", en: "Anxiety and loneliness", fr: "Anxiété et solitude" },
    subtitle: { es: "Cuando el vacío aprieta, Cristo sigue siendo refugio cercano.", en: "When emptiness presses in, Christ remains a near refuge.", fr: "Quand le vide serre le cœur, Christ reste un refuge proche." },
    description: { es: "Siete lecturas para reconocer ansiedad, soledad y necesidad afectiva sin correr a contenido que te daña.", en: "Seven readings to name anxiety, loneliness, and unmet needs without running to harmful content.", fr: "Sept lectures pour reconnaître l'anxiété, la solitude et les besoins affectifs sans courir vers ce qui blesse." },
  },
  "identidad-en-cristo": {
    title: { es: "Identidad en Cristo", en: "Identity in Christ", fr: "Identité en Christ" },
    subtitle: { es: "No eres tu peor momento; eres alguien llamado por Cristo.", en: "You are not your worst moment; you are called by Christ.", fr: "Vous n'êtes pas votre pire moment ; Christ vous appelle." },
    description: { es: "Un plan para recordar quién eres en Cristo cuando la culpa intenta definirte.", en: "A plan to remember who you are in Christ when guilt tries to define you.", fr: "Un plan pour vous rappeler qui vous êtes en Christ lorsque la culpabilité veut vous définir." },
  },
  "pureza-digital": {
    title: { es: "Pureza digital", en: "Digital purity", fr: "Pureté numérique" },
    subtitle: { es: "No todo merece disciplinar tu atención; Cristo sí.", en: "Not everything deserves your attention; Christ does.", fr: "Tout ne mérite pas votre attention ; Christ, oui." },
    description: { es: "Un plan práctico para formar una relación más santa, libre y consciente con el celular.", en: "A practical plan for a holier, freer, more conscious relationship with your phone.", fr: "Un plan pratique pour une relation plus sainte, libre et consciente avec votre téléphone." },
  },
  "volver-a-empezar": {
    title: { es: "Volver a empezar", en: "Start again", fr: "Recommencer" },
    subtitle: { es: "Dios también trabaja en los regresos humildes y nada teatrales.", en: "God also works through humble, untheatrical returns.", fr: "Dieu agit aussi dans les retours humbles et sans théâtre." },
    description: { es: "Para temporadas donde perdiste ritmo y necesitas regresar sin drama, pero con firmeza.", en: "For seasons when you lost rhythm and need to return without drama, but with resolve.", fr: "Pour les saisons où vous avez perdu le rythme et devez revenir sans drame, mais avec fermeté." },
  },
  "fortaleza-noche": {
    title: { es: "Fortaleza para la noche", en: "Strength for the night", fr: "Force pour la nuit" },
    subtitle: { es: "Prepara la hora vulnerable antes de que el impulso tome el frente.", en: "Prepare for the vulnerable hour before the impulse takes over.", fr: "Préparez l'heure vulnérable avant que l'impulsion ne prenne le dessus." },
    description: { es: "Lecturas para las horas donde cansancio, silencio y celular se vuelven peligrosos.", en: "Readings for the hours when fatigue, silence, and your phone become dangerous.", fr: "Des lectures pour les heures où fatigue, silence et téléphone deviennent dangereux." },
  },
  "sanidad-verguenza": {
    title: { es: "Sanidad de la vergüenza", en: "Healing from shame", fr: "Guérir de la honte" },
    subtitle: { es: "La gracia no te cubre para esconderte, sino para restaurarte.", en: "Grace does not cover you to hide you, but to restore you.", fr: "La grâce ne vous couvre pas pour vous cacher, mais pour vous restaurer." },
    description: { es: "Un camino para dejar de vivir definido por culpa, secreto y autodesprecio.", en: "A path away from being defined by guilt, secrecy, and self-contempt.", fr: "Un chemin pour ne plus être défini par la culpabilité, le secret et le mépris de soi." },
  },
};

const portuguesePlanCopy: Record<string, { title: string; subtitle: string; description: string }> = {
  "primeros-7-dias": { title: "Primeiros 7 dias limpo", subtitle: "Sete pequenos passos podem se tornar um novo começo.", description: "Um caminho simples para reorganizar suas telas e caminhar com Cristo, um dia de cada vez." },
  "cuando-recai": { title: "Quando eu caí", subtitle: "A vergonha não tem a palavra final quando você volta para a luz.", description: "Um plano para voltar a Deus depois de uma queda, sem negar o pecado nem se render à vergonha." },
  "ansiedad-y-soledad": { title: "Ansiedade e solidão", subtitle: "Quando o vazio aperta, Cristo continua sendo um refúgio próximo.", description: "Sete leituras para reconhecer ansiedade, solidão e necessidades afetivas sem correr para conteúdos que machucam." },
  "identidad-en-cristo": { title: "Identidade em Cristo", subtitle: "Você não é o seu pior momento; é alguém chamado por Cristo.", description: "Um plano para lembrar quem você é em Cristo quando a culpa tenta definir você." },
  "pureza-digital": { title: "Pureza digital", subtitle: "Nem tudo merece disciplinar sua atenção; Cristo, sim.", description: "Um plano prático para formar uma relação mais santa, livre e consciente com o celular." },
  "volver-a-empezar": { title: "Começar de novo", subtitle: "Deus também trabalha nos retornos humildes e sem teatro.", description: "Para temporadas em que você perdeu o ritmo e precisa voltar sem drama, mas com firmeza." },
  "fortaleza-noche": { title: "Força para a noite", subtitle: "Prepare a hora vulnerável antes que o impulso assuma o controle.", description: "Leituras para as horas em que cansaço, silêncio e celular se tornam perigosos." },
  "sanidad-verguenza": { title: "Cura da vergonha", subtitle: "A graça não cobre você para esconder, mas para restaurar.", description: "Um caminho para deixar de viver definido por culpa, segredo e desprezo por si mesmo." },
};

export function localizePlan(plan: DevotionalPlan, language: SupportedLanguage): DevotionalPlan {
  const translatedPlans = {
    en: plansEn,
    fr: plansFr,
    pt: plansPt,
  } as const;
  const translated = language === "es"
    ? undefined
    : translatedPlans[language][plan.id as keyof (typeof translatedPlans)[typeof language]];

  if (translated) {
    return {
      ...plan,
      title: translated.title,
      subtitle: translated.subtitle,
      description: translated.description,
      days: translated.days,
    } as DevotionalPlan;
  }

  const copy = planCopy[plan.id];
  if (!copy) return plan;
  const portuguese = language === "pt" ? portuguesePlanCopy[plan.id] : undefined;
  return {
    ...plan,
    title: portuguese?.title ?? localize(copy.title, language),
    subtitle: portuguese?.subtitle ?? localize(copy.subtitle, language),
    description: portuguese?.description ?? localize(copy.description, language),
  };
}

const localizedDevotionals: Record<SupportedLanguage, Devotional[]> = {
  es: devotionalsEs as Devotional[],
  en: devotionalsEn as Devotional[],
  fr: devotionalsFr as Devotional[],
  pt: devotionalsPt as Devotional[],
};

export function getLocalizedDevotionals(language: SupportedLanguage): Devotional[] {
  return localizedDevotionals[language];
}
