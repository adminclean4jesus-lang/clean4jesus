import type { SupportedLanguage } from "@/features/i18n/i18n";

export type PlanVisualTone = "navy" | "gold" | "jade" | "violet" | "rose";

export type PlanVisual = {
  kicker: string;
  promise: string;
  motif: "seed" | "restoration" | "night" | "identity" | "shield" | "path" | "lamp" | "healing";
  tone: PlanVisualTone;
};

const planVisuals: Record<string, PlanVisual> = {
  "ansiedad-y-soledad": { kicker: "Respira y vuelve", motif: "night", promise: "Cuando el vacío aprieta, Cristo sigue siendo refugio cercano.", tone: "violet" },
  "cuando-recai": { kicker: "Levántate en verdad", motif: "restoration", promise: "La vergüenza no tiene la última palabra cuando vuelves a la luz.", tone: "rose" },
  "fortaleza-noche": { kicker: "Guarda la noche", motif: "lamp", promise: "Prepara la hora vulnerable antes de que el impulso tome el frente.", tone: "navy" },
  "identidad-en-cristo": { kicker: "Tu nombre real", motif: "identity", promise: "No eres tu peor momento; eres alguien llamado por Cristo.", tone: "gold" },
  "primeros-7-dias": { kicker: "Base de libertad", motif: "seed", promise: "Siete pasos pequeños pueden convertirse en un nuevo comienzo real.", tone: "jade" },
  "pureza-digital": { kicker: "Ordena tus pantallas", motif: "shield", promise: "No todo merece discipular tu atención; Cristo sí.", tone: "navy" },
  "sanidad-verguenza": { kicker: "Cara al Padre", motif: "healing", promise: "La gracia no te cubre para esconderte, sino para restaurarte.", tone: "rose" },
  "volver-a-empezar": { kicker: "Comienza otra vez", motif: "path", promise: "Dios también trabaja en los regresos humildes y nada teatrales.", tone: "gold" },
};

const translatedPlanCopy: Record<Exclude<SupportedLanguage, "es">, Record<string, Pick<PlanVisual, "kicker" | "promise">>> = {
  en: {
    "ansiedad-y-soledad": { kicker: "Breathe and return", promise: "When emptiness presses in, Christ remains a refuge close at hand." },
    "cuando-recai": { kicker: "Rise in truth", promise: "Shame does not have the final word when you return to the light." },
    "fortaleza-noche": { kicker: "Guard the night", promise: "Prepare for the vulnerable hour before the impulse takes over." },
    "identidad-en-cristo": { kicker: "Your true name", promise: "You are not your worst moment; you are someone called by Christ." },
    "primeros-7-dias": { kicker: "A foundation for freedom", promise: "Seven small steps can become a real new beginning." },
    "pureza-digital": { kicker: "Order your screens", promise: "Not everything deserves to disciple your attention; Christ does." },
    "sanidad-verguenza": { kicker: "Before the Father", promise: "Grace does not cover you so you can hide, but so you can be restored." },
    "volver-a-empezar": { kicker: "Begin again", promise: "God also works through humble, untheatrical returns." },
  },
  fr: {
    "ansiedad-y-soledad": { kicker: "Respirez et revenez", promise: "Quand le vide serre le cœur, Christ reste un refuge proche." },
    "cuando-recai": { kicker: "Relevez-vous dans la vérité", promise: "La honte n'a pas le dernier mot lorsque vous revenez à la lumière." },
    "fortaleza-noche": { kicker: "Gardez la nuit", promise: "Préparez l'heure vulnérable avant que l'impulsion ne prenne le dessus." },
    "identidad-en-cristo": { kicker: "Votre vrai nom", promise: "Vous n'êtes pas votre pire moment ; Christ vous appelle." },
    "primeros-7-dias": { kicker: "Une base de liberté", promise: "Sept petits pas peuvent devenir un véritable nouveau départ." },
    "pureza-digital": { kicker: "Ordonnez vos écrans", promise: "Tout ne mérite pas de former votre attention ; Christ, oui." },
    "sanidad-verguenza": { kicker: "Devant le Père", promise: "La grâce ne vous couvre pas pour vous cacher, mais pour vous restaurer." },
    "volver-a-empezar": { kicker: "Recommencez", promise: "Dieu agit aussi dans les retours humbles et sans théâtre." },
  },
  pt: {
    "ansiedad-y-soledad": { kicker: "Respire e volte", promise: "Quando o vazio aperta, Cristo continua sendo um refúgio próximo." },
    "cuando-recai": { kicker: "Levante-se na verdade", promise: "A vergonha não tem a palavra final quando você volta para a luz." },
    "fortaleza-noche": { kicker: "Guarde a noite", promise: "Prepare a hora vulnerável antes que o impulso assuma o controle." },
    "identidad-en-cristo": { kicker: "Seu verdadeiro nome", promise: "Você não é o seu pior momento; é alguém chamado por Cristo." },
    "primeros-7-dias": { kicker: "Base de liberdade", promise: "Sete pequenos passos podem se tornar um verdadeiro novo começo." },
    "pureza-digital": { kicker: "Organize suas telas", promise: "Nem tudo merece discipular sua atenção; Cristo, sim." },
    "sanidad-verguenza": { kicker: "Diante do Pai", promise: "A graça não cobre você para esconder, mas para restaurar." },
    "volver-a-empezar": { kicker: "Comece novamente", promise: "Deus também trabalha nos retornos humildes e sem teatro." },
  },
};

export function getPlanVisual(planId: string, language: SupportedLanguage = "es"): PlanVisual {
  const base = planVisuals[planId] ?? { kicker: "Camino guiado", motif: "path", promise: "Un recorrido breve para volver a caminar con Cristo de forma práctica.", tone: "navy" };
  const translated = language === "es" ? undefined : translatedPlanCopy[language][planId];
  return translated ? { ...base, ...translated } : base;
}

export function getThemeVisual(theme: string, language: SupportedLanguage = "es"): PlanVisual {
  const normalized = theme.trim().toLowerCase();
  const category = ["pureza", "purity", "pureté"].some((term) => normalized.includes(term))
    ? "purity"
    : ["fortaleza", "strength", "force", "força"].some((term) => normalized.includes(term))
      ? "strength"
      : ["gracia", "grace", "grâce", "graça", "esperanza", "hope", "espoir", "esperança"].some((term) => normalized.includes(term))
        ? "grace"
        : ["comunidad", "community", "communauté", "comunidade"].some((term) => normalized.includes(term))
          ? "community"
          : "default";
  const visual = {
    purity: { motif: "shield", tone: "navy" },
    strength: { motif: "lamp", tone: "gold" },
    grace: { motif: "restoration", tone: "rose" },
    community: { motif: "identity", tone: "jade" },
    default: { motif: "seed", tone: "violet" },
  } as const;
  const copy = {
    es: { purity: ["Guarda el interior", "La pureza empieza donde decides qué discipula tu mirada."], strength: ["Mantente firme", "La salida suele aparecer primero como una decisión pequeña y fiel."], grace: ["Vuelve sin teatro", "La misericordia de hoy también sirve para seguir caminando."], community: ["No caminas solo", "Dios suele sostener lo que amas a través de personas reales."], default: ["Palabra para hoy", "Una lectura breve para volver a centrar el corazón en Cristo."] },
    en: { purity: ["Guard your inner life", "Purity begins with what you allow to shape your eyes."], strength: ["Stand firm", "The way out often begins with one small, faithful decision."], grace: ["Return honestly", "Today's mercy is also enough to keep walking."], community: ["You do not walk alone", "God often sustains what you love through real people."], default: ["Word for today", "A short reading to recenter your heart on Christ."] },
    fr: { purity: ["Gardez votre vie intérieure", "La pureté commence par ce qui forme votre regard."], strength: ["Tenez ferme", "La sortie commence souvent par une petite décision fidèle."], grace: ["Revenez avec sincérité", "La miséricorde d'aujourd'hui suffit aussi pour continuer."], community: ["Vous ne marchez pas seul", "Dieu soutient souvent ce que vous aimez à travers des personnes réelles."], default: ["La Parole du jour", "Une courte lecture pour recentrer votre cœur sur Christ."] },
    pt: { purity: ["Guarde seu interior", "A pureza começa com o que você permite discipular o seu olhar."], strength: ["Permaneça firme", "A saída costuma começar com uma decisão pequena e fiel."], grace: ["Volte com sinceridade", "A misericórdia de hoje também basta para continuar caminhando."], community: ["Você não caminha sozinho", "Deus costuma sustentar o que você ama por meio de pessoas reais."], default: ["Palavra para hoje", "Uma breve leitura para recentrar seu coração em Cristo."] },
  } as const;
  const [kicker, promise] = copy[language][category];
  return { ...visual[category], kicker, promise };
}
