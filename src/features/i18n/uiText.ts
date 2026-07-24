import type { SupportedLanguage } from "./i18n";

type UiTextKey =
  | "tabs.refuge"
  | "tabs.word"
  | "tabs.community"
  | "tabs.profile"
  | "refuge.loading"
  | "refuge.subtitle.ready"
  | "refuge.subtitle.partial"
  | "refuge.subtitle.paused"
  | "refuge.kicker.active"
  | "refuge.kicker.partial"
  | "refuge.kicker.paused"
  | "refuge.title.ready"
  | "refuge.title.start"
  | "refuge.body"
  | "refuge.coverage"
  | "refuge.layers.ready"
  | "refuge.layers.show"
  | "refuge.layers.missing"
  | "refuge.pin.ready"
  | "refuge.pin.create"
  | "refuge.vpn.ready"
  | "refuge.vpn.activate"
  | "refuge.accessibility.ready"
  | "refuge.accessibility.open"
  | "refuge.fall.button"
  | "refuge.fall.title"
  | "refuge.fall.body"
  | "word.loading"
  | "word.title"
  | "word.today"
  | "word.plans"
  | "word.todayLabel"
  | "word.readingTime"
  | "word.verse"
  | "word.apply"
  | "word.concreteStep"
  | "word.read"
  | "word.readDone"
  | "word.activePlans"
  | "word.activePlansTitle"
  | "word.activePlansBody"
  | "word.nextStep"
  | "word.startPlan"
  | "word.startPlanBody"
  | "word.explorePlans"
  | "word.catalog"
  | "word.catalogTitle"
  | "word.catalogBody"
  | "word.day"
  | "word.days"
  | "word.start"
  | "word.openPlan"
  | "community.loading"
  | "community.subtitle"
  | "community.title"
  | "community.pulse"
  | "community.pulseTitle"
  | "community.pulseBody"
  | "community.requests"
  | "community.prayers"
  | "community.replies"
  | "community.share"
  | "community.askPrayer"
  | "community.shareTestimony"
  | "community.all"
  | "community.prayer"
  | "community.testimonies"
  | "community.updates"
  | "community.retry"
  | "community.report"
  | "community.delete"
  | "community.cancel"
  | "community.reportSent"
  | "community.deletePost"
  | "community.noPostsTitle"
  | "community.noPostsBody"
  | "community.setupTitle"
  | "community.setupBody"
  | "community.setupStep1"
  | "community.setupStep2"
  | "community.setupStep3"
  | "profile.subtitle"
  | "profile.title"
  | "profile.identity"
  | "profile.changePhoto"
  | "profile.permissionTitle"
  | "profile.permissionBody"
  | "profile.savePhotoError"
  | "profile.photoErrorBody"
  | "profile.removePhoto"
  | "profile.photoLocal"
  | "profile.account"
  | "profile.accountHint"
  | "profile.settings"
  | "profile.settingsHint";

const en = {} as Record<UiTextKey, string>;
const strings: Record<SupportedLanguage, Record<UiTextKey, string>> = {
  es: {
    "tabs.refuge": "Refugio", "tabs.word": "Palabra", "tabs.community": "Comunidad", "tabs.profile": "Mi perfil",
    "refuge.loading": "Preparando tu refugio...", "refuge.subtitle.ready": "El refugio está encendido y el resto del día puede empezar.", "refuge.subtitle.partial": "Hay capas activas, pero todavía no todas. Termina la configuración con calma.", "refuge.subtitle.paused": "Activa el refugio para entrar con calma y claridad.",
    "refuge.kicker.active": "Refugio activo", "refuge.kicker.partial": "Protección parcial", "refuge.kicker.paused": "Refugio en pausa", "refuge.title.ready": "Protección lista para sostenerte", "refuge.title.start": "Primero encendemos el refugio", "refuge.body": "PIN, VPN local y Accesibilidad en un solo refugio. La protección base vive aquí, sin tocar DNS privado del sistema.", "refuge.coverage": "Cobertura del refugio", "refuge.layers.ready": "Todas las capas listas", "refuge.layers.show": "Ver capas de protección", "refuge.layers.missing": "Falta: {items}.", "refuge.pin.ready": "Listo", "refuge.pin.create": "Crear", "refuge.vpn.ready": "Activa", "refuge.vpn.activate": "Activar", "refuge.accessibility.ready": "Activa", "refuge.accessibility.open": "Abrir", "refuge.fall.button": "Registrar caída", "refuge.fall.title": "Caída registrada", "refuge.fall.body": "Tu racha se reinició con gracia. Hoy puedes volver a empezar.",
    "word.loading": "Preparando tu Palabra...", "word.title": "Devocional guiado", "word.today": "Hoy", "word.plans": "Planes", "word.todayLabel": "Palabra para hoy", "word.readingTime": "2-3 min", "word.verse": "Versículo del día", "word.apply": "Para aplicar", "word.concreteStep": "Paso concreto", "word.read": "Marcar lectura de hoy", "word.readDone": "Lectura registrada hoy", "word.activePlans": "Planes activos", "word.activePlansTitle": "Sigue solo lo que ya estás caminando", "word.activePlansBody": "Tus planes activos se quedan aquí. El resto vive en la pestaña de planes para no llenarte de ruido.", "word.nextStep": "Siguiente paso", "word.startPlan": "Empieza un plan cuando quieras profundizar", "word.startPlanBody": "No hace falta ver todo hoy. Entra a Planes, elige uno y la app te irá llevando día por día.", "word.explorePlans": "Explorar planes", "word.catalog": "Planes devocionales", "word.catalogTitle": "Elige un camino para esta semana", "word.catalogBody": "Siete lecturas, un solo día a la vez. Inscríbete y deja que el siguiente paso aparezca cuando corresponda.", "word.day": "día", "word.days": "días", "word.start": "Comenzar", "word.openPlan": "Abrir plan",
    "community.loading": "Preparando tu comunidad...", "community.subtitle": "Testimonios, oración y acompañamiento con personas reales.", "community.title": "No caminas solo", "community.pulse": "Pulso de hoy", "community.pulseTitle": "{days} días sosteniendo el camino", "community.pulseBody": "La meta no es aparentar fuerza. Es volver a la luz, pedir apoyo y responder con gracia.", "community.requests": "Pedidos", "community.prayers": "Oraciones", "community.replies": "Respuestas", "community.share": "Compartir", "community.askPrayer": "Pedir oración", "community.shareTestimony": "Contar un testimonio", "community.all": "Todo", "community.prayer": "Oración", "community.testimonies": "Testimonios", "community.updates": "Avances", "community.retry": "Intentar de nuevo", "community.report": "Reportar publicación", "community.delete": "Eliminar", "community.cancel": "Cancelar", "community.reportSent": "El reporte fue enviado para revisión.", "community.deletePost": "Puedes retirar tu publicación de la comunidad cuando lo necesites.", "community.noPostsTitle": "Aquí comienza algo bueno", "community.noPostsBody": "Comparte el primer pedido de oración o testimonio de este espacio.", "community.setupTitle": "La comunidad real está lista para conectarse", "community.setupBody": "Falta enlazar el proyecto Supabase. Hasta entonces no mostramos perfiles falsos ni guardamos publicaciones como si fueran reales.", "community.setupStep1": "Crear el proyecto Supabase.", "community.setupStep2": "Ejecutar la migración segura incluida.", "community.setupStep3": "Agregar la URL y la clave pública al entorno.",
    "profile.subtitle": "Tu identidad, tu comunidad y tus decisiones.", "profile.title": "Tu espacio", "profile.identity": "IDENTIDAD", "profile.changePhoto": "Cambiar foto de perfil", "profile.permissionTitle": "Permiso necesario", "profile.permissionBody": "Permite el acceso a tus fotos para elegir una imagen de perfil.", "profile.savePhotoError": "No pudimos guardar la foto", "profile.photoErrorBody": "Intenta elegirla nuevamente.", "profile.removePhoto": "Quitar foto", "profile.photoLocal": "Tu foto se guarda únicamente en este teléfono por ahora.", "profile.account": "Cuenta y comunidad", "profile.accountHint": "Gestiona lo que decides compartir.", "profile.settings": "Ajustes de la aplicación", "profile.settingsHint": "Protección, idioma, apariencia y opciones avanzadas.",
  },
  en: {
    "tabs.refuge": "Refuge", "tabs.word": "Word", "tabs.community": "Community", "tabs.profile": "My profile",
    "refuge.loading": "Preparing your refuge...", "refuge.subtitle.ready": "The refuge is on. The rest of the day can begin.", "refuge.subtitle.partial": "Some layers are active, but not all. Finish setup at your own pace.", "refuge.subtitle.paused": "Turn on the refuge to enter the day with calm and clarity.", "refuge.kicker.active": "Refuge active", "refuge.kicker.partial": "Partial protection", "refuge.kicker.paused": "Refuge paused", "refuge.title.ready": "Protection ready to support you", "refuge.title.start": "First, we turn on the refuge", "refuge.body": "PIN, local VPN, and Accessibility in one refuge. The base protection lives here without changing the system private DNS.", "refuge.coverage": "Refuge coverage", "refuge.layers.ready": "All layers ready", "refuge.layers.show": "View protection layers", "refuge.layers.missing": "Missing: {items}.", "refuge.pin.ready": "Ready", "refuge.pin.create": "Create", "refuge.vpn.ready": "Active", "refuge.vpn.activate": "Activate", "refuge.accessibility.ready": "Active", "refuge.accessibility.open": "Open", "refuge.fall.button": "Record a fall", "refuge.fall.title": "Fall recorded", "refuge.fall.body": "Your streak has been reset with grace. You can begin again today.",
    "word.loading": "Preparing your Word...", "word.title": "Guided devotional", "word.today": "Today", "word.plans": "Plans", "word.todayLabel": "Word for today", "word.readingTime": "2-3 min", "word.verse": "Verse of the day", "word.apply": "Put it into practice", "word.concreteStep": "Concrete step", "word.read": "Mark today's reading", "word.readDone": "Reading recorded today", "word.activePlans": "Active plans", "word.activePlansTitle": "Keep walking only what you have started", "word.activePlansBody": "Your active plans stay here. The rest lives in the plans tab so your day stays clear.", "word.nextStep": "Next step", "word.startPlan": "Start a plan when you want to go deeper", "word.startPlanBody": "You do not have to read everything today. Enter Plans, choose one, and the app will guide you day by day.", "word.explorePlans": "Explore plans", "word.catalog": "Devotional plans", "word.catalogTitle": "Choose a path for this week", "word.catalogBody": "Seven readings, one day at a time. Enroll and let the next step appear when it is time.", "word.day": "day", "word.days": "days", "word.start": "Start", "word.openPlan": "Open plan",
    "community.loading": "Preparing your community...", "community.subtitle": "Testimonies, prayer, and support from real people.", "community.title": "You do not walk alone", "community.pulse": "Today's pulse", "community.pulseTitle": "{days} days staying on the path", "community.pulseBody": "The goal is not to look strong. It is to return to the light, ask for support, and respond with grace.", "community.requests": "Requests", "community.prayers": "Prayers", "community.replies": "Replies", "community.share": "Share", "community.askPrayer": "Ask for prayer", "community.shareTestimony": "Share a testimony", "community.all": "All", "community.prayer": "Prayer", "community.testimonies": "Testimonies", "community.updates": "Updates", "community.retry": "Try again", "community.report": "Report post", "community.delete": "Delete", "community.cancel": "Cancel", "community.reportSent": "The report was sent for review.", "community.deletePost": "You can remove your post from the community whenever you need to.", "community.noPostsTitle": "Something good starts here", "community.noPostsBody": "Share the first prayer request or testimony in this space.", "community.setupTitle": "The real community is ready to connect", "community.setupBody": "The Supabase project still needs to be linked. Until then, we do not show fake profiles or store posts as if they were real.", "community.setupStep1": "Create the Supabase project.", "community.setupStep2": "Run the included safe migration.", "community.setupStep3": "Add the URL and public key to the environment.",
    "profile.subtitle": "Your identity, your community, and your decisions.", "profile.title": "Your space", "profile.identity": "IDENTITY", "profile.changePhoto": "Change profile photo", "profile.permissionTitle": "Permission needed", "profile.permissionBody": "Allow photo access to choose a profile image.", "profile.savePhotoError": "We could not save the photo", "profile.photoErrorBody": "Try choosing it again.", "profile.removePhoto": "Remove photo", "profile.photoLocal": "Your photo is stored on this phone only for now.", "profile.account": "Account and community", "profile.accountHint": "Manage what you choose to share.", "profile.settings": "App settings", "profile.settingsHint": "Protection, language, appearance, and advanced options.",
  },
  fr: {
    "tabs.refuge": "Refuge", "tabs.word": "Parole", "tabs.community": "Communauté", "tabs.profile": "Mon profil",
    "refuge.loading": "Préparation de votre refuge...", "refuge.subtitle.ready": "Le refuge est actif. Le reste de la journée peut commencer.", "refuge.subtitle.partial": "Certaines couches sont actives, mais pas toutes. Terminez la configuration à votre rythme.", "refuge.subtitle.paused": "Activez le refuge pour avancer avec calme et clarté.", "refuge.kicker.active": "Refuge actif", "refuge.kicker.partial": "Protection partielle", "refuge.kicker.paused": "Refuge en pause", "refuge.title.ready": "Protection prête à vous soutenir", "refuge.title.start": "Commençons par activer le refuge", "refuge.body": "PIN, VPN local et Accessibilité dans un seul refuge. La protection de base reste ici sans modifier le DNS privé du système.", "refuge.coverage": "Couverture du refuge", "refuge.layers.ready": "Toutes les couches sont prêtes", "refuge.layers.show": "Voir les couches de protection", "refuge.layers.missing": "Manquant : {items}.", "refuge.pin.ready": "Prêt", "refuge.pin.create": "Créer", "refuge.vpn.ready": "Active", "refuge.vpn.activate": "Activer", "refuge.accessibility.ready": "Active", "refuge.accessibility.open": "Ouvrir", "refuge.fall.button": "Enregistrer une chute", "refuge.fall.title": "Chute enregistrée", "refuge.fall.body": "Votre série a été réinitialisée avec grâce. Vous pouvez recommencer aujourd'hui.",
    "word.loading": "Préparation de votre Parole...", "word.title": "Dévotion guidée", "word.today": "Aujourd'hui", "word.plans": "Plans", "word.todayLabel": "La Parole du jour", "word.readingTime": "2-3 min", "word.verse": "Verset du jour", "word.apply": "Mettre en pratique", "word.concreteStep": "Étape concrète", "word.read": "Marquer la lecture du jour", "word.readDone": "Lecture enregistrée aujourd'hui", "word.activePlans": "Plans actifs", "word.activePlansTitle": "Continuez seulement ce que vous avez commencé", "word.activePlansBody": "Vos plans actifs restent ici. Le reste se trouve dans l'onglet des plans pour garder votre journée claire.", "word.nextStep": "Étape suivante", "word.startPlan": "Commencez un plan pour aller plus loin", "word.startPlanBody": "Il n'est pas nécessaire de tout lire aujourd'hui. Entrez dans Plans, choisissez-en un et l'application vous guidera jour après jour.", "word.explorePlans": "Explorer les plans", "word.catalog": "Plans dévotionnels", "word.catalogTitle": "Choisissez un chemin pour cette semaine", "word.catalogBody": "Sept lectures, un jour à la fois. Inscrivez-vous et laissez l'étape suivante apparaître au bon moment.", "word.day": "jour", "word.days": "jours", "word.start": "Commencer", "word.openPlan": "Ouvrir le plan",
    "community.loading": "Préparation de votre communauté...", "community.subtitle": "Témoignages, prière et soutien de personnes réelles.", "community.title": "Vous ne marchez pas seul", "community.pulse": "Le pouls du jour", "community.pulseTitle": "{days} jours sur le chemin", "community.pulseBody": "Le but n'est pas de paraître fort. C'est revenir à la lumière, demander du soutien et répondre avec grâce.", "community.requests": "Demandes", "community.prayers": "Prières", "community.replies": "Réponses", "community.share": "Partager", "community.askPrayer": "Demander une prière", "community.shareTestimony": "Partager un témoignage", "community.all": "Tout", "community.prayer": "Prière", "community.testimonies": "Témoignages", "community.updates": "Progrès", "community.retry": "Réessayer", "community.report": "Signaler la publication", "community.delete": "Supprimer", "community.cancel": "Annuler", "community.reportSent": "Le signalement a été envoyé pour examen.", "community.deletePost": "Vous pouvez retirer votre publication de la communauté quand vous le souhaitez.", "community.noPostsTitle": "Quelque chose de bon commence ici", "community.noPostsBody": "Partagez la première demande de prière ou le premier témoignage de cet espace.", "community.setupTitle": "La vraie communauté est prête à se connecter", "community.setupBody": "Le projet Supabase doit encore être relié. En attendant, aucun faux profil ni contenu fictif n'est présenté comme réel.", "community.setupStep1": "Créer le projet Supabase.", "community.setupStep2": "Exécuter la migration sécurisée incluse.", "community.setupStep3": "Ajouter l'URL et la clé publique à l'environnement.",
    "profile.subtitle": "Votre identité, votre communauté et vos décisions.", "profile.title": "Votre espace", "profile.identity": "IDENTITÉ", "profile.changePhoto": "Changer la photo de profil", "profile.permissionTitle": "Permission nécessaire", "profile.permissionBody": "Autorisez l'accès aux photos pour choisir une image de profil.", "profile.savePhotoError": "Impossible d'enregistrer la photo", "profile.photoErrorBody": "Essayez de la choisir à nouveau.", "profile.removePhoto": "Retirer la photo", "profile.photoLocal": "Votre photo est enregistrée sur ce téléphone uniquement pour le moment.", "profile.account": "Compte et communauté", "profile.accountHint": "Gérez ce que vous choisissez de partager.", "profile.settings": "Réglages de l'application", "profile.settingsHint": "Protection, langue, apparence et options avancées.",
  },
  pt: {
    ...en,
    "tabs.refuge": "Refúgio", "tabs.word": "Palavra", "tabs.community": "Comunidade", "tabs.profile": "Meu perfil",
    "refuge.loading": "Preparando seu refúgio...", "refuge.subtitle.ready": "O refúgio está ativo. O resto do dia pode começar.", "refuge.subtitle.partial": "Algumas camadas estão ativas, mas ainda não todas. Termine a configuração com calma.", "refuge.subtitle.paused": "Ative o refúgio para entrar no dia com calma e clareza.", "refuge.kicker.active": "Refúgio ativo", "refuge.kicker.partial": "Proteção parcial", "refuge.kicker.paused": "Refúgio em pausa", "refuge.title.ready": "Proteção pronta para sustentar você", "refuge.title.start": "Primeiro, ativamos o refúgio", "refuge.body": "PIN, VPN local e Acessibilidade em um só refúgio. A proteção base vive aqui, sem alterar o DNS privado do sistema.", "refuge.coverage": "Cobertura do refúgio", "refuge.layers.ready": "Todas as camadas prontas", "refuge.layers.show": "Ver camadas de proteção", "refuge.layers.missing": "Falta: {items}.", "refuge.pin.ready": "Pronto", "refuge.pin.create": "Criar", "refuge.vpn.ready": "Ativa", "refuge.vpn.activate": "Ativar", "refuge.accessibility.ready": "Ativa", "refuge.accessibility.open": "Abrir", "refuge.fall.button": "Registrar queda", "refuge.fall.title": "Queda registrada", "refuge.fall.body": "Sua sequência foi reiniciada com graça. Hoje você pode começar de novo.",
    "word.loading": "Preparando sua Palavra...", "word.title": "Devocional guiado", "word.today": "Hoje", "word.plans": "Planos", "word.todayLabel": "Palavra para hoje", "word.readingTime": "2-3 min", "word.verse": "Versículo do dia", "word.apply": "Para praticar", "word.concreteStep": "Passo concreto", "word.read": "Marcar leitura de hoje", "word.readDone": "Leitura registrada hoje", "word.activePlans": "Planos ativos", "word.activePlansTitle": "Continue apenas o que você já começou", "word.activePlansBody": "Seus planos ativos ficam aqui. O restante vive na aba de planos para não encher seu dia de ruído.", "word.nextStep": "Próximo passo", "word.startPlan": "Comece um plano quando quiser aprofundar", "word.startPlanBody": "Você não precisa ver tudo hoje. Entre em Planos, escolha um e o app guiará você dia após dia.", "word.explorePlans": "Explorar planos", "word.catalog": "Planos devocionais", "word.catalogTitle": "Escolha um caminho para esta semana", "word.catalogBody": "Sete leituras, um dia de cada vez. Inscreva-se e deixe o próximo passo aparecer no momento certo.", "word.day": "dia", "word.days": "dias", "word.start": "Começar", "word.openPlan": "Abrir plano",
    "community.loading": "Preparando sua comunidade...", "community.subtitle": "Testemunhos, oração e apoio de pessoas reais.", "community.title": "Você não caminha sozinho", "community.pulse": "Pulso de hoje", "community.pulseTitle": "{days} dias seguindo o caminho", "community.pulseBody": "A meta não é parecer forte. É voltar à luz, pedir apoio e responder com graça.", "community.requests": "Pedidos", "community.prayers": "Orações", "community.replies": "Respostas", "community.share": "Compartilhar", "community.askPrayer": "Pedir oração", "community.shareTestimony": "Compartilhar testemunho", "community.all": "Tudo", "community.prayer": "Oração", "community.testimonies": "Testemunhos", "community.updates": "Avanços", "community.retry": "Tentar novamente", "community.report": "Denunciar publicação", "community.delete": "Excluir", "community.cancel": "Cancelar", "community.reportSent": "A denúncia foi enviada para revisão.", "community.deletePost": "Você pode remover sua publicação da comunidade quando precisar.", "community.noPostsTitle": "Algo bom começa aqui", "community.noPostsBody": "Compartilhe o primeiro pedido de oração ou testemunho deste espaço.", "community.setupTitle": "A comunidade real está pronta para se conectar", "community.setupBody": "Ainda falta conectar o projeto Supabase. Até lá, não exibimos perfis falsos nem guardamos publicações como se fossem reais.", "community.setupStep1": "Criar o projeto Supabase.", "community.setupStep2": "Executar a migração segura incluída.", "community.setupStep3": "Adicionar a URL e a chave pública ao ambiente.",
    "profile.subtitle": "Sua identidade, sua comunidade e suas decisões.", "profile.title": "Seu espaço", "profile.identity": "IDENTIDADE", "profile.changePhoto": "Alterar foto de perfil", "profile.permissionTitle": "Permissão necessária", "profile.permissionBody": "Permita o acesso às suas fotos para escolher uma imagem de perfil.", "profile.savePhotoError": "Não foi possível salvar a foto", "profile.photoErrorBody": "Tente escolhê-la novamente.", "profile.removePhoto": "Remover foto", "profile.photoLocal": "Sua foto fica armazenada somente neste telefone por enquanto.", "profile.account": "Conta e comunidade", "profile.accountHint": "Gerencie o que você escolhe compartilhar.", "profile.settings": "Configurações do app", "profile.settingsHint": "Proteção, idioma, aparência e opções avançadas.",
  },
};

function repairLegacyEncoding(value: string) {
  return value
    .replaceAll("Ã¡", "á").replaceAll("Ã©", "é").replaceAll("Ã­", "í").replaceAll("Ã³", "ó").replaceAll("Ãº", "ú")
    .replaceAll("Ã±", "ñ").replaceAll("Ã¼", "ü").replaceAll("Ã§", "ç").replaceAll("Ã ", "à").replaceAll("Ã¨", "è")
    .replaceAll("Ãª", "ê").replaceAll("Ã®", "î").replaceAll("Ã´", "ô").replaceAll("Ã¹", "ù").replaceAll("Ã¢", "â")
    .replaceAll("Ã‰", "É").replaceAll("Ã€", "À").replaceAll("Ã‡", "Ç").replaceAll("Ã‚", "Â")
    .replaceAll("Â ", " ").replaceAll("â€™", "’").replaceAll("â€“", "–").replaceAll("â€”", "—").replaceAll("â€œ", "“").replaceAll("â€\u009d", "”");
}

export function uiText(language: SupportedLanguage, key: UiTextKey, variables: Record<string, string | number> = {}) {
  let value = repairLegacyEncoding(strings[language][key] ?? (language === "pt" ? strings.en[key] : strings.es[key]));
  for (const [name, replacement] of Object.entries(variables)) value = value.replace(`{${name}}`, String(replacement));
  return value;
}

export type { UiTextKey };
