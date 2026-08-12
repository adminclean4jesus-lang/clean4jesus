export const supportedLanguages = ["es", "en", "fr", "pt"] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

export type TranslationKey =
  | "settings.language.title"
  | "settings.language.subtitle"
  | "settings.language.current"
  | "settings.language.note"
  | "settings.language.es"
  | "settings.language.en"
  | "settings.language.fr"
  | "settings.language.pt"
  | "settings.header.eyebrow"
  | "settings.header.title"
  | "settings.header.subtitle"
  | "settings.status.ready"
  | "settings.status.preparing"
  | "settings.status.readyBody"
  | "settings.status.preparingBody"
  | "settings.section.protection"
  | "settings.section.protectionHint"
  | "settings.row.appProtection"
  | "settings.row.appProtectionHint"
  | "settings.row.trustedPerson"
  | "settings.row.trustedPersonHint"
  | "settings.row.interruption"
  | "settings.row.interruptionHint"
  | "settings.section.preferences"
  | "settings.section.preferencesHint"
  | "settings.row.language"
  | "settings.row.darkMode"
  | "settings.row.enabled"
  | "settings.row.disabled"
  | "settings.section.security"
  | "settings.section.securityHint"
  | "settings.row.changePin"
  | "settings.row.createPin"
  | "settings.row.updatePinHint"
  | "settings.row.createPinHint"
  | "settings.section.advanced"
  | "settings.section.advancedHint"
  | "settings.row.advanced"
  | "settings.row.advancedHint"
  | "settings.advanced.body"
  | "settings.advanced.hostCopiedTitle"
  | "settings.advanced.hostCopiedBody"
  | "settings.advanced.copyHost"
  | "settings.advanced.openPrivateDns"
  | "settings.advanced.optionalConnectivity"
  | "legal.guidelines.eyebrow"
  | "legal.guidelines.title"
  | "legal.guidelines.p1"
  | "legal.guidelines.p2"
  | "legal.guidelines.p3"
  | "legal.privacy.eyebrow"
  | "legal.privacy.title"
  | "legal.privacy.p1"
  | "legal.privacy.p2"
  | "legal.privacy.p3"
  | "legal.terms.eyebrow"
  | "legal.terms.title"
  | "legal.terms.p1"
  | "legal.terms.p2"
  | "legal.terms.p3"
  | "legal.draftNotice"
  | "legal.openFull"
  | "legal.understood"
  | "legal.close"
  | "legal.link.privacy"
  | "legal.link.terms"
  | "legal.link.guidelines";

type TranslationTable = Record<TranslationKey, string>;

const es: TranslationTable = {
  "settings.language.title": "Idioma",
  "settings.language.subtitle": "Clean4Jesus se prepara para beta en español, inglés, francés y portugués.",
  "settings.language.current": "Actual",
  "settings.language.note": "La traducción completa se publicará por etapas para proteger las pantallas aprobadas.",
  "settings.language.es": "Español",
  "settings.language.en": "English",
  "settings.language.fr": "Français",
  "settings.language.pt": "Português",
  "settings.header.eyebrow": "Mi perfil",
  "settings.header.title": "Ajustes",
  "settings.header.subtitle": "Decide cómo quieres cuidar este dispositivo.",
  "settings.status.ready": "Refugio listo",
  "settings.status.preparing": "Refugio en preparación",
  "settings.status.readyBody": "Las capas principales de protección están activas.",
  "settings.status.preparingBody": "Completa las capas pendientes desde Refugio.",
  "settings.section.protection": "Protección",
  "settings.section.protectionHint": "Lo esencial para tu protección diaria",
  "settings.row.appProtection": "Protección de apps",
  "settings.row.appProtectionHint": "Límites y bloqueos en redes y navegadores",
  "settings.row.trustedPerson": "Persona de confianza",
  "settings.row.trustedPersonHint": "Consentimiento, vínculo y alertas privadas",
  "settings.row.interruption": "Pantalla de interrupción",
  "settings.row.interruptionHint": "Tu frase e imagen para volver a lo importante",
  "settings.section.preferences": "Preferencias",
  "settings.section.preferencesHint": "Elige cómo se ve y se expresa Clean4Jesus",
  "settings.row.language": "Idioma",
  "settings.row.darkMode": "Modo oscuro",
  "settings.row.enabled": "Activado",
  "settings.row.disabled": "Desactivado",
  "settings.section.security": "Seguridad",
  "settings.section.securityHint": "Código que protege cambios sensibles",
  "settings.row.changePin": "Cambiar PIN",
  "settings.row.createPin": "Crear PIN",
  "settings.row.updatePinHint": "Actualiza tu código de protección",
  "settings.row.createPinHint": "Crea tu código de protección",
  "settings.section.advanced": "Avanzado",
  "settings.section.advancedHint": "Opciones que pueden afectar la conectividad",
  "settings.row.advanced": "Ajustes avanzados",
  "settings.row.advancedHint": "DNS privado y compatibilidad de red",
  "settings.advanced.body": "El DNS privado es opcional. Puede reforzar el filtro, pero en algunas redes afecta los datos móviles o ciertas aplicaciones.",
  "settings.advanced.hostCopiedTitle": "DNS avanzado",
  "settings.advanced.hostCopiedBody": "Host copiado. Úsalo solo si tu red lo soporta.",
  "settings.advanced.copyHost": "Copiar host DNS",
  "settings.advanced.openPrivateDns": "Abrir DNS privado",
  "settings.advanced.optionalConnectivity": "Opcional: puede afectar la conectividad",
  "legal.guidelines.eyebrow": "Reglas de comunidad",
  "legal.guidelines.title": "Cuidamos este espacio juntos",
  "legal.guidelines.p1": "Comparte con verdad y respeto. No publiques contenido sexual, acoso, amenazas, spam ni datos privados de otra persona.",
  "legal.guidelines.p2": "Los reportes son confidenciales y pueden llevar a ocultar contenido. Clean4Jesus no reemplaza atención médica, psicológica, pastoral ni de emergencia.",
  "legal.guidelines.p3": "Este es un resumen para pruebas internas. Las reglas y la edad mínima deben quedar aprobadas antes de una beta pública.",
  "legal.privacy.eyebrow": "Aviso de privacidad",
  "legal.privacy.title": "Tu correo no aparece en el feed",
  "legal.privacy.p1": "Supabase gestiona tu correo, credenciales y sesión. La comunidad conserva tu nombre visible, perfil opcional, publicaciones, comentarios, apoyos y reportes.",
  "legal.privacy.p2": "El Refugio puede usar Accesibilidad y una VPN local, permisos profundos que observan elementos visibles o enrutan DNS solo para protegerte. No los usamos para robar información, registrar pulsaciones, leer contraseñas, operar bancos, enviar mensajes ni crear perfiles publicitarios. El historial de navegación, mensajes, búsquedas y contenido detectado permanecen en tu dispositivo.",
  "legal.privacy.p3": "La Comunidad sí conserva publicaciones, comentarios y reportes para funcionar y moderar. Un reporte voluntario de falso positivo solo puede incluir una huella técnica y metadatos mínimos, nunca el contenido capturado. Puedes eliminar tu cuenta desde Ajustes; la evidencia restringida de moderación puede conservarse hasta 24 meses.",
  "legal.terms.eyebrow": "Términos de uso",
  "legal.terms.title": "Usa Clean4Jesus con responsabilidad",
  "legal.terms.p1": "Clean4Jesus ofrece herramientas de protección digital, contenido cristiano y comunidad. No garantiza que toda detección sea perfecta ni reemplaza ayuda profesional.",
  "legal.terms.p2": "Debes proteger tus credenciales y usar la comunidad con respeto. No publiques contenido sexual, amenazas, acoso, spam ni información privada de terceros.",
  "legal.terms.p3": "Estos términos son un resumen de pruebas. La versión pública deberá incluir responsable legal, jurisdicción, edad mínima, contacto y fecha de vigencia.",
  "legal.draftNotice": "Resumen de la versión pública vigente desde el 23 de julio de 2026.",
  "legal.openFull": "Leer documento completo",
  "legal.understood": "Entendido",
  "legal.close": "Cerrar aviso",
  "legal.link.privacy": "Aviso de privacidad",
  "legal.link.terms": "Términos de uso",
  "legal.link.guidelines": "Reglas de comunidad",
};

const en: TranslationTable = {
  ...es,
  "settings.language.title": "Language",
  "settings.language.subtitle": "Clean4Jesus is being prepared for beta in Spanish, English, French, and Portuguese.",
  "settings.language.current": "Current",
  "settings.language.note": "Full translation will ship in stages to protect approved screens.",
  "settings.language.es": "Spanish",
  "settings.language.en": "English",
  "settings.language.fr": "French",
  "settings.language.pt": "Portuguese",
  "settings.header.eyebrow": "My profile",
  "settings.header.title": "Settings",
  "settings.header.subtitle": "Choose how you want to care for this device.",
  "settings.status.ready": "Refuge ready",
  "settings.status.preparing": "Refuge in progress",
  "settings.status.readyBody": "The main protection layers are active.",
  "settings.status.preparingBody": "Complete the pending layers from Refuge.",
  "settings.section.protection": "Protection",
  "settings.section.protectionHint": "The essentials for daily protection",
  "settings.row.appProtection": "App protection",
  "settings.row.appProtectionHint": "Limits and blocks for social apps and browsers",
  "settings.row.trustedPerson": "Trusted person",
  "settings.row.trustedPersonHint": "Consent, connection, and private alerts",
  "settings.row.interruption": "Interruption screen",
  "settings.row.interruptionHint": "Your phrase and image to return to what matters",
  "settings.section.preferences": "Preferences",
  "settings.section.preferencesHint": "Choose how Clean4Jesus looks and speaks",
  "settings.row.language": "Language",
  "settings.row.darkMode": "Dark mode",
  "settings.row.enabled": "On",
  "settings.row.disabled": "Off",
  "settings.section.security": "Security",
  "settings.section.securityHint": "Code that protects sensitive changes",
  "settings.row.changePin": "Change PIN",
  "settings.row.createPin": "Create PIN",
  "settings.row.updatePinHint": "Update your protection code",
  "settings.row.createPinHint": "Create your protection code",
  "settings.section.advanced": "Advanced",
  "settings.section.advancedHint": "Options that may affect connectivity",
  "settings.row.advanced": "Advanced settings",
  "settings.row.advancedHint": "Private DNS and network compatibility",
  "settings.advanced.body": "Private DNS is optional. It may strengthen filtering, but on some networks it affects mobile data or certain apps.",
  "settings.advanced.hostCopiedTitle": "Advanced DNS",
  "settings.advanced.hostCopiedBody": "Host copied. Use it only if your network supports it.",
  "settings.advanced.copyHost": "Copy DNS host",
  "settings.advanced.openPrivateDns": "Open private DNS",
  "settings.advanced.optionalConnectivity": "Optional: may affect connectivity",
  "legal.guidelines.eyebrow": "Community guidelines",
  "legal.guidelines.title": "We care for this space together",
  "legal.guidelines.p1": "Share with truth and respect. Do not post sexual content, harassment, threats, spam, or another person's private data.",
  "legal.guidelines.p2": "Reports are confidential and may result in content being hidden. Clean4Jesus does not replace medical, psychological, pastoral, or emergency care.",
  "legal.guidelines.p3": "This is an internal testing summary. The guidelines and minimum age must be approved before a public beta.",
  "legal.privacy.eyebrow": "Privacy notice",
  "legal.privacy.title": "Your email does not appear in the feed",
  "legal.privacy.p1": "Supabase manages your email, credentials, and session. The community stores your display name, optional profile, posts, comments, reactions, and reports.",
  "legal.privacy.p2": "The Shield may use Accessibility and a local VPN, deep permissions that observe visible elements or route DNS only to protect you. We do not use them to steal information, record keystrokes, read passwords, operate banks, send messages, or create advertising profiles. Browsing history, messages, searches, and detected content stay on your device.",
  "legal.privacy.p3": "The Community does store posts, comments, and reports to operate and moderate the space. A voluntary false-positive report may include only a technical fingerprint and minimal metadata, never captured content. You can delete your account from Settings; restricted moderation evidence may be retained for up to 24 months.",
  "legal.terms.eyebrow": "Terms of use",
  "legal.terms.title": "Use Clean4Jesus responsibly",
  "legal.terms.p1": "Clean4Jesus provides digital protection tools, Christian content, and community. It does not guarantee perfect detection and does not replace professional help.",
  "legal.terms.p2": "Protect your credentials and use the community respectfully. Do not post sexual content, threats, harassment, spam, or another person's private information.",
  "legal.terms.p3": "These terms are a testing summary. The public version must include the legal entity, jurisdiction, minimum age, contact, and effective date.",
  "legal.draftNotice": "Summary of the public version effective July 23, 2026.",
  "legal.openFull": "Read full document",
  "legal.understood": "Got it",
  "legal.close": "Close notice",
  "legal.link.privacy": "Privacy notice",
  "legal.link.terms": "Terms of use",
  "legal.link.guidelines": "Community guidelines",
};

const fr: TranslationTable = {
  ...en,
  "settings.language.title": "Langue",
  "settings.language.subtitle": "Clean4Jesus se prépare pour une bêta en espagnol, anglais, français et portugais.",
  "settings.language.current": "Actuelle",
  "settings.language.note": "La traduction complète sera publiée par étapes pour protéger les écrans approuvés.",
  "settings.language.es": "Espagnol",
  "settings.language.en": "Anglais",
  "settings.language.fr": "Français",
  "settings.language.pt": "Portugais",
  "settings.header.eyebrow": "Mon profil",
  "settings.header.title": "Réglages",
  "settings.header.subtitle": "Choisissez comment prendre soin de cet appareil.",
  "settings.status.ready": "Refuge prêt",
  "settings.status.preparing": "Refuge en préparation",
  "settings.status.readyBody": "Les principales couches de protection sont actives.",
  "settings.status.preparingBody": "Terminez les couches en attente depuis Refuge.",
  "settings.section.protection": "Protection",
  "settings.section.protectionHint": "L'essentiel pour votre protection quotidienne",
  "settings.row.appProtection": "Protection des apps",
  "settings.row.appProtectionHint": "Limites et blocages pour les réseaux et navigateurs",
  "settings.row.trustedPerson": "Personne de confiance",
  "settings.row.trustedPersonHint": "Consentement, lien et alertes privées",
  "settings.row.interruption": "Écran d'interruption",
  "settings.row.interruptionHint": "Votre phrase et votre image pour revenir à l'essentiel",
  "settings.section.preferences": "Préférences",
  "settings.section.preferencesHint": "Choisissez l'apparence et le langage de Clean4Jesus",
  "settings.row.language": "Langue",
  "settings.row.darkMode": "Mode sombre",
  "settings.row.enabled": "Activé",
  "settings.row.disabled": "Désactivé",
  "settings.section.security": "Sécurité",
  "settings.section.securityHint": "Code qui protège les changements sensibles",
  "settings.row.changePin": "Changer le PIN",
  "settings.row.createPin": "Créer un PIN",
  "settings.row.updatePinHint": "Mettre à jour votre code de protection",
  "settings.row.createPinHint": "Créer votre code de protection",
  "settings.section.advanced": "Avancé",
  "settings.section.advancedHint": "Options pouvant affecter la connectivité",
  "settings.row.advanced": "Réglages avancés",
  "settings.row.advancedHint": "DNS privé et compatibilité réseau",
  "settings.advanced.body": "Le DNS privé est optionnel. Il peut renforcer le filtrage, mais sur certains réseaux il affecte les données mobiles ou certaines apps.",
  "settings.advanced.hostCopiedTitle": "DNS avancé",
  "settings.advanced.hostCopiedBody": "Hôte copié. Utilisez-le seulement si votre réseau le prend en charge.",
  "settings.advanced.copyHost": "Copier l'hôte DNS",
  "settings.advanced.openPrivateDns": "Ouvrir le DNS privé",
  "settings.advanced.optionalConnectivity": "Optionnel : peut affecter la connectivité",
  "legal.guidelines.eyebrow": "Règles de communauté",
  "legal.guidelines.title": "Prenons soin de cet espace ensemble",
  "legal.guidelines.p1": "Partagez avec vérité et respect. Ne publiez pas de contenu sexuel, de harcèlement, de menaces, de spam ou les données privées d'une autre personne.",
  "legal.guidelines.p2": "Les signalements sont confidentiels et peuvent entraîner le masquage d'un contenu. Clean4Jesus ne remplace pas les soins médicaux, psychologiques, pastoraux ou d'urgence.",
  "legal.guidelines.p3": "Voici un résumé pour les tests internes. Les règles et l'âge minimum doivent être approuvés avant une bêta publique.",
  "legal.privacy.eyebrow": "Avis de confidentialité",
  "legal.privacy.title": "Votre e-mail n'apparaît pas dans le fil",
  "legal.privacy.p1": "Supabase gère votre e-mail, vos identifiants et votre session. La communauté conserve votre nom, votre profil facultatif, vos publications, commentaires, réactions et signalements.",
  "legal.privacy.p2": "Le Refuge peut utiliser l'Accessibilité et un VPN local, des permissions profondes qui observent les éléments visibles ou acheminent le DNS uniquement pour vous protéger. Nous ne les utilisons pas pour voler des informations, enregistrer les touches, lire des mots de passe, opérer des banques, envoyer des messages ou créer des profils publicitaires. L'historique de navigation, les messages, les recherches et les contenus détectés restent sur votre appareil.",
  "legal.privacy.p3": "La Communauté conserve les publications, commentaires et signalements pour fonctionner et modérer cet espace. Un signalement volontaire de faux positif peut inclure uniquement une empreinte technique et des métadonnées minimales, jamais le contenu capturé. Vous pouvez supprimer votre compte depuis les réglages; les preuves de modération restreintes peuvent être conservées jusqu'à 24 mois.",
  "legal.terms.eyebrow": "Conditions d'utilisation",
  "legal.terms.title": "Utilisez Clean4Jesus avec responsabilité",
  "legal.terms.p1": "Clean4Jesus propose des outils de protection numérique, du contenu chrétien et une communauté. La détection n'est pas parfaite et l'application ne remplace pas une aide professionnelle.",
  "legal.terms.p2": "Protégez vos identifiants et utilisez la communauté avec respect. Ne publiez pas de contenu sexuel, de menaces, de harcèlement, de spam ou d'informations privées de tiers.",
  "legal.terms.p3": "Ces conditions sont un résumé de test. La version publique devra préciser l'entité responsable, la juridiction, l'âge minimum, le contact et la date d'entrée en vigueur.",
  "legal.draftNotice": "Résumé de la version publique en vigueur depuis le 23 juillet 2026.",
  "legal.openFull": "Lire le document complet",
  "legal.understood": "Compris",
  "legal.close": "Fermer l'avis",
  "legal.link.privacy": "Avis de confidentialité",
  "legal.link.terms": "Conditions d'utilisation",
  "legal.link.guidelines": "Règles de communauté",
};

const pt: TranslationTable = {
  ...en,
  "settings.language.title": "Idioma",
  "settings.language.subtitle": "O Clean4Jesus está sendo preparado para beta em espanhol, inglês, francês e português.",
  "settings.language.current": "Atual",
  "settings.language.note": "A tradução completa será publicada por etapas para proteger as telas aprovadas.",
  "settings.language.es": "Espanhol",
  "settings.language.en": "Inglês",
  "settings.language.fr": "Francês",
  "settings.language.pt": "Português",
  "settings.header.eyebrow": "Meu perfil",
  "settings.header.title": "Configurações",
  "settings.header.subtitle": "Escolha como cuidar deste dispositivo.",
  "settings.status.ready": "Refúgio pronto",
  "settings.status.preparing": "Refúgio em preparação",
  "settings.status.readyBody": "As principais camadas de proteção estão ativas.",
  "settings.status.preparingBody": "Conclua as camadas pendentes em Refúgio.",
  "settings.section.protection": "Proteção",
  "settings.section.protectionHint": "O essencial para sua proteção diária",
  "settings.row.appProtection": "Proteção de apps",
  "settings.row.appProtectionHint": "Limites e bloqueios para redes sociais e navegadores",
  "settings.row.trustedPerson": "Pessoa de confiança",
  "settings.row.trustedPersonHint": "Consentimento, vínculo e alertas privados",
  "settings.row.interruption": "Tela de interrupção",
  "settings.row.interruptionHint": "Sua frase e imagem para voltar ao que importa",
  "settings.section.preferences": "Preferências",
  "settings.section.preferencesHint": "Escolha como o Clean4Jesus aparece e fala",
  "settings.row.language": "Idioma",
  "settings.row.darkMode": "Modo escuro",
  "settings.row.enabled": "Ativado",
  "settings.row.disabled": "Desativado",
  "settings.section.security": "Segurança",
  "settings.section.securityHint": "Código que protege mudanças sensíveis",
  "settings.row.changePin": "Alterar PIN",
  "settings.row.createPin": "Criar PIN",
  "settings.row.updatePinHint": "Atualize seu código de proteção",
  "settings.row.createPinHint": "Crie seu código de proteção",
  "settings.section.advanced": "Avançado",
  "settings.section.advancedHint": "Opções que podem afetar a conexão",
  "settings.row.advanced": "Configurações avançadas",
  "settings.row.advancedHint": "DNS privado e compatibilidade de rede",
  "settings.advanced.body": "O DNS privado é opcional. Ele pode reforçar o filtro, mas em algumas redes afeta os dados móveis ou certos apps.",
  "settings.advanced.hostCopiedTitle": "DNS avançado",
  "settings.advanced.hostCopiedBody": "Host copiado. Use-o apenas se sua rede for compatível.",
  "settings.advanced.copyHost": "Copiar host DNS",
  "settings.advanced.openPrivateDns": "Abrir DNS privado",
  "settings.advanced.optionalConnectivity": "Opcional: pode afetar a conexão",
  "legal.guidelines.eyebrow": "Regras da comunidade",
  "legal.guidelines.title": "Cuidamos deste espaço juntos",
  "legal.guidelines.p1": "Compartilhe com verdade e respeito. Não publique conteúdo sexual, assédio, ameaças, spam ou dados privados de outra pessoa.",
  "legal.guidelines.p2": "As denúncias são confidenciais e podem ocultar conteúdo. O Clean4Jesus não substitui atendimento médico, psicológico, pastoral ou de emergência.",
  "legal.guidelines.p3": "Este é um resumo para testes internos. As regras e a idade mínima devem ser aprovadas antes do beta público.",
  "legal.privacy.eyebrow": "Aviso de privacidade",
  "legal.privacy.title": "Seu e-mail não aparece no feed",
  "legal.privacy.p1": "O Supabase gerencia seu e-mail, credenciais e sessão. A comunidade guarda seu nome público, perfil opcional, publicações, comentários, apoios e denúncias.",
  "legal.privacy.p2": "O Refúgio pode usar Acessibilidade e uma VPN local, permissões profundas que observam elementos visíveis ou encaminham DNS apenas para proteger você. Não usamos isso para roubar informações, registrar teclas, ler senhas, operar bancos, enviar mensagens ou criar perfis publicitários. O histórico de navegação, mensagens, buscas e conteúdo detectado permanecem no dispositivo.",
  "legal.privacy.p3": "A Comunidade guarda publicações, comentários e denúncias para funcionar e moderar esse espaço. Uma denúncia voluntária de falso positivo pode incluir apenas uma impressão técnica e metadados mínimos, nunca o conteúdo capturado. Você pode excluir sua conta em Configurações; evidências restritas de moderação podem ser mantidas por até 24 meses.",
  "legal.terms.eyebrow": "Termos de uso",
  "legal.terms.title": "Use o Clean4Jesus com responsabilidade",
  "legal.terms.p1": "O Clean4Jesus oferece ferramentas de proteção digital, conteúdo cristão e comunidade. Não garante detecção perfeita nem substitui ajuda profissional.",
  "legal.terms.p2": "Proteja suas credenciais e use a comunidade com respeito. Não publique conteúdo sexual, ameaças, assédio, spam ou informações privadas de terceiros.",
  "legal.terms.p3": "Estes termos são um resumo de testes. A versão pública deverá incluir responsável legal, jurisdição, idade mínima, contato e data de vigência.",
  "legal.draftNotice": "Resumo da versão pública vigente desde 23 de julho de 2026.",
  "legal.openFull": "Ler documento completo",
  "legal.understood": "Entendi",
  "legal.close": "Fechar aviso",
  "legal.link.privacy": "Aviso de privacidade",
  "legal.link.terms": "Termos de uso",
  "legal.link.guidelines": "Regras da comunidade",
};

const translations: Record<SupportedLanguage, TranslationTable> = { es, en, fr, pt };

export function isSupportedLanguage(value: string | null | undefined): value is SupportedLanguage {
  return supportedLanguages.includes(value as SupportedLanguage);
}

export function normalizeLanguage(value: string | null | undefined): SupportedLanguage {
  if (!value) return "es";
  const normalized = value.toLowerCase().split(/[-_]/)[0];
  return isSupportedLanguage(normalized) ? normalized : "es";
}

export function detectSystemLanguage(): SupportedLanguage {
  try {
    return normalizeLanguage(Intl.DateTimeFormat().resolvedOptions().locale);
  } catch {
    return "es";
  }
}

export function resolveStartupLanguage({
  manuallySelected,
  storedLanguage,
  systemLanguage,
}: {
  manuallySelected: boolean;
  storedLanguage: string | null;
  systemLanguage: SupportedLanguage;
}): SupportedLanguage {
  return manuallySelected && storedLanguage
    ? normalizeLanguage(storedLanguage)
    : systemLanguage;
}

export function translate(language: SupportedLanguage, key: TranslationKey) {
  return translations[language][key] ?? translations.es[key];
}
