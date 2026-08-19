import type { SupportedLanguage } from "./i18n";

const copy = {
  es: {
    active: "Modo acompañado activo",
    activeBody: "Clean4Jesus confirma de forma periódica que Accesibilidad y la protección DNS sigan activas. Si la protección permanece interrumpida durante el periodo acordado, avisaremos a tu persona de confianza. Nunca compartimos actividad, aplicaciones ni contenido.",
    accept: "Aceptar modo acompañado",
    disable: "Desactivar modo acompañado",
    disabled: "Añade una capa de acompañamiento",
    disabledBody: "Tu persona de confianza debe aceptarlo antes de que este teléfono empiece a enviar comprobaciones técnicas privadas.",
    enable: "Solicitar modo acompañado",
    pendingGuardian: "Esperando aceptación de tu persona de confianza",
    pendingGuardianBody: "El modo no está activo todavía. La otra persona debe aceptar esta finalidad concreta.",
    pendingOwner: "Esta persona solicita modo acompañado",
    pendingOwnerBody: "Al aceptar, recibirás un correo genérico si su protección permanece interrumpida durante el periodo acordado. No verás contenido, actividad ni aplicaciones.",
  },
  en: {
    active: "Accompanied mode is active", activeBody: "Clean4Jesus periodically confirms that Accessibility and DNS protection remain active. If protection remains interrupted for the agreed period, we notify your trusted person. We never share activity, apps, or content.", accept: "Accept accompanied mode", disable: "Turn off accompanied mode", disabled: "Add a layer of support", disabledBody: "Your trusted person must accept before this phone starts sending private technical checks.", enable: "Request accompanied mode", pendingGuardian: "Waiting for your trusted person's acceptance", pendingGuardianBody: "The mode is not active yet. The other person must accept this specific purpose.", pendingOwner: "This person is requesting accompanied mode", pendingOwnerBody: "By accepting, you will receive a generic email if their protection remains interrupted for the agreed period. You will not see content, activity, or apps.",
  },
  fr: {
    active: "Mode accompagné actif", activeBody: "Clean4Jesus confirme périodiquement qu’Accessibilité et la protection DNS restent actives. Si la protection reste interrompue pendant la période convenue, la personne de confiance est avertie. Aucune activité, app ou contenu n’est partagé.", accept: "Accepter le mode accompagné", disable: "Désactiver le mode accompagné", disabled: "Ajouter une couche d’accompagnement", disabledBody: "Votre personne de confiance doit accepter avant que ce téléphone envoie des vérifications techniques privées.", enable: "Demander le mode accompagné", pendingGuardian: "En attente de l’acceptation de votre personne de confiance", pendingGuardianBody: "Le mode n’est pas encore actif.", pendingOwner: "Cette personne demande le mode accompagné", pendingOwnerBody: "En acceptant, vous recevrez un e-mail générique si sa protection reste interrompue pendant la période convenue.",
  },
  pt: {
    active: "Modo acompanhado ativo", activeBody: "O Clean4Jesus confirma periodicamente que Acessibilidade e a proteção DNS continuam ativas. Se a proteção ficar interrompida durante o período combinado, avisaremos a pessoa de confiança. Nunca compartilhamos atividade, apps ou conteúdo.", accept: "Aceitar modo acompanhado", disable: "Desativar modo acompanhado", disabled: "Adicione uma camada de acompanhamento", disabledBody: "Sua pessoa de confiança precisa aceitar antes que este telefone envie verificações técnicas privadas.", enable: "Solicitar modo acompanhado", pendingGuardian: "Aguardando a aceitação da sua pessoa de confiança", pendingGuardianBody: "O modo ainda não está ativo.", pendingOwner: "Esta pessoa solicita o modo acompanhado", pendingOwnerBody: "Ao aceitar, você receberá um e-mail genérico se a proteção dela continuar interrompida durante o período combinado.",
  },
} as const;

export const getAccompaniedModeText = (language: SupportedLanguage) => copy[language];
