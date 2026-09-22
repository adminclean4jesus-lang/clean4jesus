import type { SupportedLanguage } from "./i18n";

type SetupCopy = {
  accessibility: {
    action: string;
    checking: string;
    description: string;
    done: string;
    first: string;
    second: string;
    third: string;
    title: string;
  };
  back: string;
  blocked: { body: string; title: string };
  brand: string;
  step: (current: number) => string;
  vpn: {
    action: string;
    checking: string;
    description: string;
    done: string;
    first: string;
    second: string;
    third: string;
    title: string;
  };
};

const copy: Record<SupportedLanguage, SetupCopy> = {
  es: {
    brand: "Configurar tu refugio",
    back: "Volver",
    step: (current) => `Paso ${current} de 2`,
    blocked: { title: "Aún falta una capa", body: "Completa este paso antes de continuar al Refugio." },
    vpn: {
      title: "Primero activemos tu VPN local",
      description: "La VPN local sostiene la protección base en este teléfono.",
      first: "Toca “Activar VPN local”.",
      second: "Acepta la ventana de Android para Clean4Jesus.",
      third: "Cuando veas que está activa, continúa.",
      action: "Activar VPN local",
      done: "Continuar con Accesibilidad",
      checking: "Comprobando VPN…",
    },
    accessibility: {
      title: "Ahora activemos Accesibilidad",
      description: "Esta capa muestra la pantalla de interrupción en navegadores y redes sociales protegidas.",
      first: "Toca “Abrir Accesibilidad”.",
      second: "Busca Clean4Jesus y activa “Usar Clean4Jesus”.",
      third: "Vuelve aquí y toca “Entrar a Clean4Jesus”.",
      action: "Abrir Accesibilidad",
      done: "Entrar a Clean4Jesus",
      checking: "Comprobando Accesibilidad…",
    },
  },
  en: {
    brand: "Set up your refuge", back: "Back", step: (current) => `Step ${current} of 2`,
    blocked: { title: "One layer is still missing", body: "Complete this step before entering the refuge." },
    vpn: { title: "First, enable your local VPN", description: "The local VPN provides base protection on this phone.", first: "Tap “Enable local VPN”.", second: "Accept Android's Clean4Jesus prompt.", third: "Continue when it is active.", action: "Enable local VPN", done: "Continue to Accessibility", checking: "Checking VPN…" },
    accessibility: { title: "Now enable Accessibility", description: "This layer shows the interruption screen in protected browsers and social apps.", first: "Tap “Open Accessibility”.", second: "Find Clean4Jesus and enable “Use Clean4Jesus”.", third: "Return here and tap “Enter Clean4Jesus”.", action: "Open Accessibility", done: "Enter Clean4Jesus", checking: "Checking Accessibility…" },
  },
  fr: {
    brand: "Configurer votre refuge", back: "Retour", step: (current) => `Étape ${current} sur 2`,
    blocked: { title: "Une couche manque encore", body: "Terminez cette étape avant d’entrer dans le refuge." },
    vpn: { title: "Activons d’abord votre VPN local", description: "Le VPN local assure la protection de base sur ce téléphone.", first: "Touchez « Activer le VPN local ».", second: "Acceptez la fenêtre Android de Clean4Jesus.", third: "Continuez lorsqu’il est actif.", action: "Activer le VPN local", done: "Continuer vers Accessibilité", checking: "Vérification du VPN…" },
    accessibility: { title: "Activez maintenant Accessibilité", description: "Cette couche affiche l’écran d’interruption dans les navigateurs et réseaux sociaux protégés.", first: "Touchez « Ouvrir Accessibilité ».", second: "Trouvez Clean4Jesus et activez le service.", third: "Revenez ici et touchez « Entrer dans Clean4Jesus ».", action: "Ouvrir Accessibilité", done: "Entrer dans Clean4Jesus", checking: "Vérification de l’accessibilité…" },
  },
  pt: {
    brand: "Configurar seu refúgio", back: "Voltar", step: (current) => `Passo ${current} de 2`,
    blocked: { title: "Ainda falta uma camada", body: "Conclua esta etapa antes de entrar no refúgio." },
    vpn: { title: "Primeiro vamos ativar sua VPN local", description: "A VPN local sustenta a proteção base neste telefone.", first: "Toque em “Ativar VPN local”.", second: "Aceite a janela Android do Clean4Jesus.", third: "Continue quando ela estiver ativa.", action: "Ativar VPN local", done: "Continuar para Acessibilidade", checking: "Verificando VPN…" },
    accessibility: { title: "Agora ative Acessibilidade", description: "Esta camada mostra a tela de interrupção em navegadores e redes sociais protegidas.", first: "Toque em “Abrir Acessibilidade”.", second: "Encontre Clean4Jesus e ative o serviço.", third: "Volte aqui e toque em “Entrar no Clean4Jesus”.", action: "Abrir Acessibilidade", done: "Entrar no Clean4Jesus", checking: "Verificando Acessibilidade…" },
  },
};

export function getAndroidSetupText(language: SupportedLanguage): SetupCopy {
  return copy[language];
}
