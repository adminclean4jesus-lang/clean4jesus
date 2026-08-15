import type { IosSelectionSummary } from "@/features/iosProtection/iosProtectionTypes";
import type { SupportedLanguage } from "./i18n";

const statusLabels = {
  es: { incompatible: "No compatible", not_configured: "Sin configurar", permission_denied: "Permiso rechazado", permission_granted: "Autorizado", protection_active: "Protección activa", protection_paused: "Protección en pausa", unknown: "Desconocido", unverified: "Sin verificar" },
  en: { incompatible: "Not supported", not_configured: "Not configured", permission_denied: "Permission denied", permission_granted: "Authorized", protection_active: "Protection active", protection_paused: "Protection paused", unknown: "Unknown", unverified: "Unverified" },
  fr: { incompatible: "Non compatible", not_configured: "Non configuré", permission_denied: "Autorisation refusée", permission_granted: "Autorisé", protection_active: "Protection active", protection_paused: "Protection en pause", unknown: "Inconnu", unverified: "Non vérifié" },
  pt: { incompatible: "Não compatível", not_configured: "Não configurado", permission_denied: "Permissão negada", permission_granted: "Autorizado", protection_active: "Proteção ativa", protection_paused: "Proteção pausada", unknown: "Desconhecido", unverified: "Não verificado" },
} as const;

const tables = {
  es: {
    title: "Refugio Clean4Jesus para iOS", subtitle: "Protección basada en Screen Time y Family Controls de Apple.", stateTitle: "Estado de protección", currentState: "Estado actual", active: "Protección activa", selectionTitle: "Apps y categorías protegidas", selectionHelp: "Apple oculta los nombres por privacidad; aquí verás cuántos elementos quedaron guardados.", limitTitle: "Límites por aplicación", limitHelp: "Elige un tiempo distinto para cada app. El uso se reinicia cada día.", configureLimits: "Configurar tiempos por app", configuredLimits: (configured: number, total: number) => `${configured} de ${total} apps configuradas`, limitPrivacy: "Apple mantiene privadas tus selecciones. Clean4Jesus no envía esta información.", limitCounterPending: "El contador de uso necesita una extensión adicional firmada por Apple y todavía no está activo en esta build.", limitErrorTitle: "No se pudieron guardar los límites", limitErrorBody: "Elige al menos una app y vuelve a intentarlo.", shieldTitle: "Límite diario alcanzado", shieldMessage: "Ya usaste el tiempo que elegiste para esta app. Tu refugio sigue activo.", shieldPrimaryAction: "Cerrar aplicación", shieldSecondaryAction: "", chooseSelection: "Elegir apps y categorías", changeSelection: "Cambiar apps y categorías", selectionSaved: "Selección guardada", selectionSavedBody: "Ahora asigna un tiempo distinto a cada app.", authorizeFirstTitle: "Primero autoriza Family Controls", authorizeFirstBody: "Apple debe conceder el permiso antes de elegir apps, categorías o sitios.", pickerErrorTitle: "No se pudo abrir el selector", pickerErrorBody: "Comprueba que Family Controls siga autorizado y vuelve a intentarlo.", capabilities: "Capacidades del dispositivo", managedSettings: "Ajustes administrados", appGroup: "Grupo compartido", supported: "Soportado", unavailable: "No disponible", configured: "Configurado", pending: "Pendiente", authorize: "Autorizar Family Controls con Apple", requestErrorTitle: "No se pudo solicitar Family Controls", requestDeniedTitle: "Family Controls no fue autorizado", requestDeniedBody: "Apple no confirmó la autorización. Vuelve a solicitarla y revisa el mensaje del sistema.", managedTitle: "Protección administrada", managedBody: "Para desactivarla se requiere el PIN de seguridad.", activateFirstTitle: "Primero autoriza Family Controls", activateFirstBody: "Solicita el permiso de Apple antes de activar la protección.", activateErrorTitle: "No se pudo activar la protección", activateErrorBody: "Elige apps, configura sus tiempos y vuelve a intentarlo.", readiness: "Ver diagnóstico de iOS", loading: "Cargando protección iOS...",
  },
  en: {
    title: "Clean4Jesus Refuge for iOS", subtitle: "Protection powered by Apple Screen Time and Family Controls.", stateTitle: "Protection status", currentState: "Current status", active: "Protection active", selectionTitle: "Protected apps and categories", selectionHelp: "Apple hides names for privacy; this summary shows how many items are saved.", limitTitle: "Limits per app", limitHelp: "Choose a different daily time for each app. Usage resets every day.", configureLimits: "Configure time per app", configuredLimits: (configured: number, total: number) => `${configured} of ${total} apps configured`, limitPrivacy: "Apple keeps your selections private. Clean4Jesus does not send this information.", limitCounterPending: "Usage counters require an additional Apple-signed extension and are not active in this build yet.", limitErrorTitle: "Could not save limits", limitErrorBody: "Choose at least one app and try again.", shieldTitle: "Daily limit reached", shieldMessage: "You used the time you chose for this app. Your refuge remains active.", shieldPrimaryAction: "Close app", shieldSecondaryAction: "", chooseSelection: "Choose apps and categories", changeSelection: "Change apps and categories", selectionSaved: "Selection saved", selectionSavedBody: "Now assign a different time to each app.", authorizeFirstTitle: "Authorize Family Controls first", authorizeFirstBody: "Apple must grant permission before you choose apps, categories, or sites.", pickerErrorTitle: "Could not open the selector", pickerErrorBody: "Check that Family Controls is still authorized and try again.", capabilities: "Device capabilities", managedSettings: "Managed Settings", appGroup: "Shared group", supported: "Supported", unavailable: "Unavailable", configured: "Configured", pending: "Pending", authorize: "Authorize Family Controls with Apple", requestErrorTitle: "Could not request Family Controls", requestDeniedTitle: "Family Controls was not authorized", requestDeniedBody: "Apple did not confirm authorization. Request it again and review the system message.", managedTitle: "Managed protection", managedBody: "Your security PIN is required to disable it.", activateFirstTitle: "Authorize Family Controls first", activateFirstBody: "Request Apple permission before activating protection.", activateErrorTitle: "Could not activate protection", activateErrorBody: "Choose apps, configure their times, and try again.", readiness: "View iOS diagnostics", loading: "Loading iOS protection...",
  },
  fr: {
    title: "Refuge Clean4Jesus pour iOS", subtitle: "Protection basée sur Screen Time et Family Controls d’Apple.", stateTitle: "État de la protection", currentState: "État actuel", active: "Protection active", selectionTitle: "Apps et catégories protégées", selectionHelp: "Apple masque les noms pour protéger votre vie privée ; ce résumé indique le nombre d’éléments enregistrés.", limitTitle: "Limites par app", limitHelp: "Choisissez un temps différent pour chaque app. L’usage est réinitialisé chaque jour.", configureLimits: "Configurer le temps par app", configuredLimits: (configured: number, total: number) => `${configured} sur ${total} apps configurées`, limitPrivacy: "Apple garde vos sélections privées. Clean4Jesus n’envoie pas ces informations.", limitCounterPending: "Les compteurs nécessitent une extension supplémentaire signée par Apple et ne sont pas encore actifs dans cette version.", limitErrorTitle: "Impossible d’enregistrer les limites", limitErrorBody: "Choisissez au moins une app et réessayez.", shieldTitle: "Limite quotidienne atteinte", shieldMessage: "Vous avez utilisé le temps choisi pour cette app. Votre refuge reste actif.", shieldPrimaryAction: "Fermer l’app", shieldSecondaryAction: "", chooseSelection: "Choisir les apps et catégories", changeSelection: "Modifier les apps et catégories", selectionSaved: "Sélection enregistrée", selectionSavedBody: "Attribuez maintenant un temps différent à chaque app.", authorizeFirstTitle: "Autorisez d’abord Family Controls", authorizeFirstBody: "Apple doit accorder l’autorisation avant de choisir apps, catégories ou sites.", pickerErrorTitle: "Impossible d’ouvrir le sélecteur", pickerErrorBody: "Vérifiez que Family Controls est toujours autorisé et réessayez.", capabilities: "Capacités de l’appareil", managedSettings: "Réglages administrés", appGroup: "Groupe partagé", supported: "Pris en charge", unavailable: "Indisponible", configured: "Configuré", pending: "En attente", authorize: "Autoriser Family Controls avec Apple", requestErrorTitle: "Impossible de demander Family Controls", requestDeniedTitle: "Family Controls n’a pas été autorisé", requestDeniedBody: "Apple n’a pas confirmé l’autorisation. Réessayez et consultez le message système.", managedTitle: "Protection administrée", managedBody: "Le PIN est requis pour la désactiver.", activateFirstTitle: "Autorisez d’abord Family Controls", activateFirstBody: "Demandez l’autorisation Apple avant d’activer la protection.", activateErrorTitle: "Impossible d’activer la protection", activateErrorBody: "Choisissez des apps, configurez leurs temps et réessayez.", readiness: "Voir le diagnostic iOS", loading: "Chargement de la protection iOS...",
  },
  pt: {
    title: "Refúgio Clean4Jesus para iOS", subtitle: "Proteção baseada no Screen Time e Family Controls da Apple.", stateTitle: "Estado da proteção", currentState: "Estado atual", active: "Proteção ativa", selectionTitle: "Apps e categorias protegidas", selectionHelp: "A Apple oculta os nomes por privacidade; este resumo mostra quantos itens foram salvos.", limitTitle: "Limites por app", limitHelp: "Escolha um tempo diferente para cada app. O uso reinicia todos os dias.", configureLimits: "Configurar tempo por app", configuredLimits: (configured: number, total: number) => `${configured} de ${total} apps configurados`, limitPrivacy: "A Apple mantém suas seleções privadas. O Clean4Jesus não envia essas informações.", limitCounterPending: "Os contadores exigem uma extensão adicional assinada pela Apple e ainda não estão ativos nesta versão.", limitErrorTitle: "Não foi possível salvar os limites", limitErrorBody: "Escolha pelo menos um app e tente novamente.", shieldTitle: "Limite diário atingido", shieldMessage: "Você usou o tempo escolhido para este app. Seu refúgio continua ativo.", shieldPrimaryAction: "Fechar app", shieldSecondaryAction: "", chooseSelection: "Escolher apps e categorias", changeSelection: "Alterar apps e categorias", selectionSaved: "Seleção salva", selectionSavedBody: "Agora atribua um tempo diferente a cada app.", authorizeFirstTitle: "Autorize o Family Controls primeiro", authorizeFirstBody: "A Apple precisa conceder permissão antes de escolher apps, categorias ou sites.", pickerErrorTitle: "Não foi possível abrir o seletor", pickerErrorBody: "Verifique se o Family Controls continua autorizado e tente novamente.", capabilities: "Recursos do dispositivo", managedSettings: "Ajustes gerenciados", appGroup: "Grupo compartilhado", supported: "Compatível", unavailable: "Indisponível", configured: "Configurado", pending: "Pendente", authorize: "Autorizar Family Controls com a Apple", requestErrorTitle: "Não foi possível solicitar Family Controls", requestDeniedTitle: "Family Controls não foi autorizado", requestDeniedBody: "A Apple não confirmou a autorização. Solicite novamente e revise a mensagem do sistema.", managedTitle: "Proteção gerenciada", managedBody: "O PIN é necessário para desativá-la.", activateFirstTitle: "Autorize o Family Controls primeiro", activateFirstBody: "Solicite a permissão da Apple antes de ativar a proteção.", activateErrorTitle: "Não foi possível ativar a proteção", activateErrorBody: "Escolha apps, configure seus tempos e tente novamente.", readiness: "Ver diagnóstico do iOS", loading: "Carregando proteção do iOS...",
  },
} as const;

type StatusKey = keyof (typeof statusLabels)["es"];

function status(language: SupportedLanguage, value?: string) {
  const key = (value && value in statusLabels[language] ? value : "unknown") as StatusKey;
  return statusLabels[language][key];
}

function selection(language: SupportedLanguage, value: IosSelectionSummary) {
  const labels = {
    es: ["app", "apps", "categoría", "categorías", "sitio", "sitios"],
    en: ["app", "apps", "category", "categories", "site", "sites"],
    fr: ["app", "apps", "catégorie", "catégories", "site", "sites"],
    pt: ["app", "apps", "categoria", "categorias", "site", "sites"],
  }[language];
  return `${value.applications} ${value.applications === 1 ? labels[0] : labels[1]} · ${value.categories} ${value.categories === 1 ? labels[2] : labels[3]} · ${value.webDomains} ${value.webDomains === 1 ? labels[4] : labels[5]}`;
}

export function getIosProtectionText(language: SupportedLanguage) {
  const guardianCopy = {
    es: {
      guardianSetupTitle: "Protege los cambios con un PIN",
      guardianSetupBody: "Tu primer límite ya quedó configurado. Ahora crea el PIN que guardará tu persona de confianza para proteger cambios futuros.",
      guardianSetupRequiredBody: "Antes de volver a cambiar límites o apps, crea el PIN de tu persona de confianza.",
      createGuardianPin: "Crear PIN del guardián",
    },
    en: {
      guardianSetupTitle: "Protect changes with a PIN",
      guardianSetupBody: "Your first limit is configured. Now create the PIN your trusted person will keep to protect future changes.",
      guardianSetupRequiredBody: "Create your trusted person's PIN before changing limits or apps again.",
      createGuardianPin: "Create guardian PIN",
    },
    fr: {
      guardianSetupTitle: "Protégez les modifications avec un PIN",
      guardianSetupBody: "Votre première limite est configurée. Créez maintenant le PIN que conservera votre personne de confiance.",
      guardianSetupRequiredBody: "Créez le PIN de votre personne de confiance avant de modifier à nouveau les limites ou les apps.",
      createGuardianPin: "Créer le PIN du gardien",
    },
    pt: {
      guardianSetupTitle: "Proteja as alterações com um PIN",
      guardianSetupBody: "Seu primeiro limite foi configurado. Agora crie o PIN que sua pessoa de confiança guardará para proteger mudanças futuras.",
      guardianSetupRequiredBody: "Crie o PIN da sua pessoa de confiança antes de alterar limites ou apps novamente.",
      createGuardianPin: "Criar PIN do guardião",
    },
  } as const;

  return {
    ...tables[language],
    ...guardianCopy[language],
    selection: (value: IosSelectionSummary) => selection(language, value),
    status: (value?: string) => status(language, value),
  };
}
