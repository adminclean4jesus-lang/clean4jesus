import type { SupportedLanguage } from "./i18n";

const sharedItems = {
  es: ["Autenticación (Supabase + Google OAuth PKCE)", "Palabra (devocionales y planes con caché offline)", "Comunidad (testimonios, oraciones y moderación)", "Internacionalización (ES, EN, FR, PT-BR)", "Temas (modo claro y modo oscuro)"],
  en: ["Authentication (Supabase + Google OAuth PKCE)", "Word (devotionals and offline plan cache)", "Community (testimonies, prayers, and moderation)", "Localization (ES, EN, FR, PT-BR)", "Themes (light and dark mode)"],
  fr: ["Authentification (Supabase + Google OAuth PKCE)", "Parole (dévotionnels et plans hors ligne)", "Communauté (témoignages, prières et modération)", "Internationalisation (ES, EN, FR, PT-BR)", "Thèmes (clair et sombre)"],
  pt: ["Autenticação (Supabase + Google OAuth PKCE)", "Palavra (devocionais e planos offline)", "Comunidade (testemunhos, orações e moderação)", "Internacionalização (ES, EN, FR, PT-BR)", "Temas (claro e escuro)"],
} as const;

const copy = {
  es: { title: "Informe de preparación iOS", subtitle: "Estado de paridad y preparación técnica para la versión de iOS.", shared: "Capas listas (compartidas)", native: "Capa nativa iOS (Screen Time)", items: sharedItems.es, nativeItems: ["Contratos TypeScript y adaptadores", "Módulo Swift nativo", "Extensiones nativas de Screen Time", "App Group compartido", "Límites independientes por aplicación"], back: "Volver" },
  en: { title: "iOS readiness report", subtitle: "Parity and technical readiness for the iOS version.", shared: "Shared layers ready", native: "iOS native layer (Screen Time)", items: sharedItems.en, nativeItems: ["TypeScript contracts and adapters", "Native Swift module", "Screen Time native extensions", "Shared App Group", "Independent limits per app"], back: "Back" },
  fr: { title: "Rapport de préparation iOS", subtitle: "État de parité et de préparation technique pour iOS.", shared: "Couches partagées prêtes", native: "Couche native iOS (Screen Time)", items: sharedItems.fr, nativeItems: ["Contrats TypeScript et adaptateurs", "Module Swift natif", "Extensions natives Screen Time", "App Group partagé", "Limites indépendantes par app"], back: "Retour" },
  pt: { title: "Relatório de preparação do iOS", subtitle: "Estado de paridade e preparação técnica para iOS.", shared: "Camadas compartilhadas prontas", native: "Camada nativa do iOS (Screen Time)", items: sharedItems.pt, nativeItems: ["Contratos TypeScript e adaptadores", "Módulo Swift nativo", "Extensões nativas do Screen Time", "App Group compartilhado", "Limites independentes por app"], back: "Voltar" },
} as const;

export function getIosReadinessText(language: SupportedLanguage) {
  return copy[language];
}
