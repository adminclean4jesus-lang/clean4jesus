import type { SupportedLanguage } from "@/features/i18n/i18n";
import type { Devotional } from "@/types/devotional";

const fallback: Record<SupportedLanguage, Devotional> = {
  es: {
    id: "offline-light",
    title: "Ven a la luz",
    verse: "El que practica la verdad viene a la luz.",
    reference: "Juan 3:21",
    reflection: "La oscuridad promete privacidad, pero termina quitando paz. Venir a la luz no significa exhibirte; significa dejar de vivir dividido. La luz de Cristo no humilla a quien viene con arrepentimiento: revela para sanar. Hoy puedes tomar una acción visible de cuidado y volver a caminar acompañado.",
    question: "¿Qué acción visible puedes tomar hoy para caminar en luz?",
    prayer: "Jesús, quiero vivir entero delante de ti. Sácame de lo oculto y enséñame a amar la verdad.",
    theme: "verdad",
    practice: "Haz una acción visible de cuidado: elimina un acceso, activa una capa o comparte tu decisión.",
  },
  en: {
    id: "offline-light",
    title: "Come into the light",
    verse: "Whoever lives by the truth comes into the light.",
    reference: "John 3:21",
    reflection: "Darkness promises privacy, but it eventually steals peace. Coming into the light does not mean exposing yourself; it means no longer living divided. Christ's light does not humiliate those who come in repentance: it reveals in order to heal. Today you can take one visible step of care and walk with others again.",
    question: "What visible action can you take today to walk in the light?",
    prayer: "Jesus, I want to live wholly before you. Bring me out of hiding and teach me to love the truth.",
    theme: "truth",
    practice: "Take one visible step of care: remove an access point, enable a protection layer, or share your decision.",
  },
  fr: {
    id: "offline-light",
    title: "Viens à la lumière",
    verse: "Celui qui agit selon la vérité vient à la lumière.",
    reference: "Jean 3:21",
    reflection: "L'obscurité promet l'intimité, mais elle finit par voler la paix. Venir à la lumière ne signifie pas s'exposer; cela signifie cesser de vivre divisé. La lumière du Christ n'humilie pas celui qui vient avec repentance: elle révèle pour guérir. Aujourd'hui, tu peux poser un geste visible de protection et reprendre la marche accompagné.",
    question: "Quelle action visible peux-tu entreprendre aujourd'hui pour marcher dans la lumière?",
    prayer: "Jésus, je veux vivre pleinement devant toi. Fais-moi sortir de ce qui est caché et apprends-moi à aimer la vérité.",
    theme: "vérité",
    practice: "Pose un geste visible: supprime un accès, active une protection ou partage ta décision.",
  },
  pt: {
    id: "offline-light",
    title: "Venha para a luz",
    verse: "Quem pratica a verdade vem para a luz.",
    reference: "João 3:21",
    reflection: "A escuridão promete privacidade, mas acaba tirando a paz. Vir para a luz não significa se expor; significa parar de viver dividido. A luz de Cristo não humilha quem vem com arrependimento: ela revela para curar. Hoje você pode tomar uma atitude visível de cuidado e voltar a caminhar acompanhado.",
    question: "Que ação visível você pode realizar hoje para andar na luz?",
    prayer: "Jesus, quero viver por inteiro diante de ti. Tire-me do oculto e ensine-me a amar a verdade.",
    theme: "verdade",
    practice: "Tome uma atitude visível de cuidado: remova um acesso, ative uma camada ou compartilhe sua decisão.",
  },
};

export function getDailyDevotionalFallback(language: SupportedLanguage): Devotional {
  return fallback[language];
}
