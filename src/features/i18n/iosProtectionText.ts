import type { IosSelectionSummary } from "@/features/iosProtection/iosProtectionTypes";
import type { SupportedLanguage } from "./i18n";

const statusLabels = {
  es: {
    incompatible: "No compatible",
    not_configured: "Sin configurar",
    permission_denied: "Permiso rechazado",
    permission_granted: "Autorizado",
    protection_active: "Protección activa",
    protection_paused: "Protección en pausa",
    unknown: "Desconocido",
    unverified: "Sin verificar",
  },
  en: {
    incompatible: "Not supported",
    not_configured: "Not configured",
    permission_denied: "Permission denied",
    permission_granted: "Authorized",
    protection_active: "Protection active",
    protection_paused: "Protection paused",
    unknown: "Unknown",
    unverified: "Unverified",
  },
  fr: {
    incompatible: "Non compatible",
    not_configured: "Non configuré",
    permission_denied: "Autorisation refusée",
    permission_granted: "Autorisé",
    protection_active: "Protection active",
    protection_paused: "Protection en pause",
    unknown: "Inconnu",
    unverified: "Non vérifié",
  },
  pt: {
    incompatible: "Não compatível",
    not_configured: "Não configurado",
    permission_denied: "Permissão negada",
    permission_granted: "Autorizado",
    protection_active: "Proteção ativa",
    protection_paused: "Proteção pausada",
    unknown: "Desconhecido",
    unverified: "Não verificado",
  },
} as const;

type StatusKey = keyof (typeof statusLabels)["es"];

function status(language: SupportedLanguage, value?: string) {
  const key = (value && value in statusLabels[language]
    ? value
    : "unknown") as StatusKey;
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

const tables = {
  es: {
    title: "Refugio Clean4Jesus para iOS",
    subtitle: "Protección basada en Screen Time y Family Controls de Apple.",
    stateTitle: "Estado de protección",
    currentState: "Estado actual",
    active: "Protección activa",
    selectionTitle: "Apps y categorías protegidas",
    selectionHelp: "Apple oculta los nombres por privacidad; aquí verás cuántos elementos quedaron guardados.",
    chooseSelection: "Elegir apps y categorías",
    changeSelection: "Cambiar apps y categorías",
    selectionSaved: "Selección guardada",
    selectionSavedBody: "La selección de Screen Time quedó guardada en este iPhone.",
    authorizeFirstTitle: "Primero autoriza Family Controls",
    authorizeFirstBody: "Apple debe conceder el permiso antes de elegir apps, categorías o sitios.",
    pickerErrorTitle: "No se pudo abrir el selector",
    pickerErrorBody: "Comprueba que Family Controls siga autorizado y vuelve a intentarlo.",
    capabilities: "Capacidades del dispositivo",
    managedSettings: "Ajustes administrados",
    appGroup: "Grupo compartido",
    supported: "Soportado",
    unavailable: "No disponible",
    configured: "Configurado",
    pending: "Pendiente",
    authorize: "Autorizar Family Controls con Apple",
    requestErrorTitle: "No se pudo solicitar Family Controls",
    requestDeniedTitle: "Family Controls no fue autorizado",
    requestDeniedBody: "Apple no confirmó la autorización. Vuelve a solicitarla y revisa el mensaje del sistema.",
    managedTitle: "Protección administrada",
    managedBody: "Para pausarla se requiere el PIN de seguridad.",
    activateFirstTitle: "Primero autoriza Family Controls",
    activateFirstBody: "Solicita el permiso de Apple antes de activar la protección.",
    activateErrorTitle: "No se pudo activar la protección",
    activateErrorBody: "Selecciona al menos una app, categoría o sitio y vuelve a intentarlo.",
    rescue: "Respirar 60 segundos",
    readiness: "Ver diagnóstico de iOS",
    loading: "Cargando protección iOS...",
  },
  en: {
    title: "Clean4Jesus Refuge for iOS", subtitle: "Protection powered by Apple Screen Time and Family Controls.", stateTitle: "Protection status", currentState: "Current status", active: "Protection active", selectionTitle: "Protected apps and categories", selectionHelp: "Apple hides names for privacy; this summary shows how many items are saved.", chooseSelection: "Choose apps and categories", changeSelection: "Change apps and categories", selectionSaved: "Selection saved", selectionSavedBody: "Your Screen Time selection was saved on this iPhone.", authorizeFirstTitle: "Authorize Family Controls first", authorizeFirstBody: "Apple must grant permission before you choose apps, categories, or sites.", pickerErrorTitle: "Could not open the selector", pickerErrorBody: "Check that Family Controls is still authorized and try again.", capabilities: "Device capabilities", managedSettings: "Managed Settings", appGroup: "Shared group", supported: "Supported", unavailable: "Unavailable", configured: "Configured", pending: "Pending", authorize: "Authorize Family Controls with Apple", requestErrorTitle: "Could not request Family Controls", requestDeniedTitle: "Family Controls was not authorized", requestDeniedBody: "Apple did not confirm authorization. Request it again and review the system message.", managedTitle: "Managed protection", managedBody: "Your security PIN is required to pause it.", activateFirstTitle: "Authorize Family Controls first", activateFirstBody: "Request Apple permission before activating protection.", activateErrorTitle: "Could not activate protection", activateErrorBody: "Select at least one app, category, or site and try again.", rescue: "Breathe for 60 seconds", readiness: "View iOS diagnostics", loading: "Loading iOS protection...",
  },
  fr: {
    title: "Refuge Clean4Jesus pour iOS", subtitle: "Protection basée sur Screen Time et Family Controls d’Apple.", stateTitle: "État de la protection", currentState: "État actuel", active: "Protection active", selectionTitle: "Apps et catégories protégées", selectionHelp: "Apple masque les noms pour protéger votre vie privée ; ce résumé indique le nombre d’éléments enregistrés.", chooseSelection: "Choisir les apps et catégories", changeSelection: "Modifier les apps et catégories", selectionSaved: "Sélection enregistrée", selectionSavedBody: "La sélection Screen Time a été enregistrée sur cet iPhone.", authorizeFirstTitle: "Autorisez d’abord Family Controls", authorizeFirstBody: "Apple doit accorder l’autorisation avant de choisir des apps, catégories ou sites.", pickerErrorTitle: "Impossible d’ouvrir le sélecteur", pickerErrorBody: "Vérifiez que Family Controls est toujours autorisé et réessayez.", capabilities: "Capacités de l’appareil", managedSettings: "Réglages administrés", appGroup: "Groupe partagé", supported: "Pris en charge", unavailable: "Indisponible", configured: "Configuré", pending: "En attente", authorize: "Autoriser Family Controls avec Apple", requestErrorTitle: "Impossible de demander Family Controls", requestDeniedTitle: "Family Controls n’a pas été autorisé", requestDeniedBody: "Apple n’a pas confirmé l’autorisation. Réessayez et consultez le message système.", managedTitle: "Protection administrée", managedBody: "Le PIN de sécurité est requis pour la suspendre.", activateFirstTitle: "Autorisez d’abord Family Controls", activateFirstBody: "Demandez l’autorisation Apple avant d’activer la protection.", activateErrorTitle: "Impossible d’activer la protection", activateErrorBody: "Sélectionnez au moins une app, catégorie ou site et réessayez.", rescue: "Respirer pendant 60 secondes", readiness: "Voir le diagnostic iOS", loading: "Chargement de la protection iOS...",
  },
  pt: {
    title: "Refúgio Clean4Jesus para iOS", subtitle: "Proteção baseada no Screen Time e Family Controls da Apple.", stateTitle: "Estado da proteção", currentState: "Estado atual", active: "Proteção ativa", selectionTitle: "Apps e categorias protegidas", selectionHelp: "A Apple oculta os nomes por privacidade; este resumo mostra quantos itens foram salvos.", chooseSelection: "Escolher apps e categorias", changeSelection: "Alterar apps e categorias", selectionSaved: "Seleção salva", selectionSavedBody: "A seleção do Screen Time foi salva neste iPhone.", authorizeFirstTitle: "Autorize o Family Controls primeiro", authorizeFirstBody: "A Apple precisa conceder permissão antes de escolher apps, categorias ou sites.", pickerErrorTitle: "Não foi possível abrir o seletor", pickerErrorBody: "Verifique se o Family Controls continua autorizado e tente novamente.", capabilities: "Recursos do dispositivo", managedSettings: "Ajustes gerenciados", appGroup: "Grupo compartilhado", supported: "Compatível", unavailable: "Indisponível", configured: "Configurado", pending: "Pendente", authorize: "Autorizar Family Controls com a Apple", requestErrorTitle: "Não foi possível solicitar Family Controls", requestDeniedTitle: "Family Controls não foi autorizado", requestDeniedBody: "A Apple não confirmou a autorização. Solicite novamente e revise a mensagem do sistema.", managedTitle: "Proteção gerenciada", managedBody: "O PIN de segurança é necessário para pausá-la.", activateFirstTitle: "Autorize o Family Controls primeiro", activateFirstBody: "Solicite a permissão da Apple antes de ativar a proteção.", activateErrorTitle: "Não foi possível ativar a proteção", activateErrorBody: "Selecione pelo menos um app, categoria ou site e tente novamente.", rescue: "Respirar por 60 segundos", readiness: "Ver diagnóstico do iOS", loading: "Carregando proteção do iOS...",
  },
} as const;

export function getIosProtectionText(language: SupportedLanguage) {
  return {
    ...tables[language],
    selection: (value: IosSelectionSummary) => selection(language, value),
    status: (value?: string) => status(language, value),
  };
}
