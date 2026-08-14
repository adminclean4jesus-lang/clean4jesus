import type { SupportedLanguage } from "./i18n";

const copy = {
  es: {
    title: "Pausa antes de decidir",
    subtitle: "Esto no desbloquea la app. Toma un minuto para respirar y volver a lo que importa.",
    inhale: "Inhala",
    hold: "Sostén",
    exhale: "Exhala",
    complete: "Completado",
    verse: "No nos ha dado Dios espíritu de cobardía, sino de poder, de amor y de dominio propio. (2 Timoteo 1:7)",
    back: "Volver",
  },
  en: {
    title: "Pause before you decide",
    subtitle: "This does not unlock the app. Take one minute to breathe and return to what matters.",
    inhale: "Inhale",
    hold: "Hold",
    exhale: "Exhale",
    complete: "Complete",
    verse: "God has not given us a spirit of fear, but of power, love, and self-control. (2 Timothy 1:7)",
    back: "Back",
  },
  fr: {
    title: "Faites une pause avant de décider",
    subtitle: "Cette pause ne déverrouille pas l’app. Respirez une minute et revenez à l’essentiel.",
    inhale: "Inspirez",
    hold: "Retenez",
    exhale: "Expirez",
    complete: "Terminé",
    verse: "Dieu ne nous a pas donné un esprit de peur, mais de force, d’amour et de maîtrise de soi. (2 Timothée 1:7)",
    back: "Retour",
  },
  pt: {
    title: "Pare antes de decidir",
    subtitle: "Isso não desbloqueia o app. Respire por um minuto e volte ao que importa.",
    inhale: "Inspire",
    hold: "Segure",
    exhale: "Expire",
    complete: "Concluído",
    verse: "Deus não nos deu espírito de medo, mas de poder, amor e domínio próprio. (2 Timóteo 1:7)",
    back: "Voltar",
  },
} as const;

export function getIosRescueText(language: SupportedLanguage) {
  return copy[language];
}
