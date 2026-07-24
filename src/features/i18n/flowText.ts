import type { SupportedLanguage } from "./i18n";

const es = {
  "plan.notFound": "No encontramos este plan devocional.",
  "plan.thread": "Hilo conductor",
  "plan.duration": "Duración",
  "plan.progress": "Avance",
  "plan.resume": "Retoma",
  "plan.active": "Activo",
  "plan.continue": "Continúa tu plan",
  "plan.currentDay": "Día actual",
  "plan.progressShort": "Avance",
  "plan.nextReading": "Siguiente lectura",
  "plan.pendingShort": "{count} lectura(s) pendiente(s)",
  "plan.returnCalmly": "No tienes que correr. Vuelve a este punto y sigue el hilo con calma.",
  "plan.activeCount": "{count} activos",
  "plan.continueToday": "Sigue hoy",
  "plan.pending": "Tienes {count} lectura(s) pendiente(s). No necesitas correr; vuelve al siguiente paso.",
  "plan.openOne": "Abre una sola lectura, márcala al final y deja que el plan te lleve día por día.",
  "plan.enrollHelp": "Te inscribes una vez y luego vas leyendo cada día a tu ritmo, sin ver todo de golpe.",
  "plan.enroll": "Inscribirme y empezar día 1",
  "plan.started": "Empezaste el {date}. Lo importante no es correr; es volver hoy.",
  "plan.readToday": "Leer hoy",
  "plan.today": "Hoy",
  "plan.journey": "Recorrido",
  "plan.yourProgress": "Tu progreso día por día",
  "plan.preview": "Lo que vas a caminar",
  "plan.completedBody": "Esta lectura ya quedó marcada y sigue disponible para releer con calma.",
  "plan.missedBody": "Se quedó pendiente. Puedes retomarla ahora sin perder el hilo del plan.",
  "plan.todayBody": "Esta es la lectura que te toca abrir hoy.",
  "plan.status.completed": "Listo",
  "plan.status.preview": "Vista",
  "plan.status.missed": "Pend.",
  "plan.status.today": "Hoy",
  "plan.status.upcoming": "Luego",
  "day.enrollFirst": "Inscríbete primero al plan para abrir esta lectura.",
  "day.back": "Volver al plan",
  "day.of": "Día {day} de {total}",
  "day.completed": "Lectura completada",
  "day.today": "Lectura de hoy",
  "day.planReading": "Lectura del plan",
  "day.day": "Día",
  "day.base": "Lectura base",
  "day.prayer": "Oración guiada",
  "day.alreadyDone": "Este día ya quedó marcado.",
  "day.alreadyDoneBody": "Puedes volver al plan para seguir tu recorrido o releer esta misma página con calma.",
  "day.markDone": "Marcar día como terminado",
  "day.next": "Sigue después",
  "day.nextBody": "Cuando cierres este día, volverás al plan y el siguiente quedará listo para abrirse.",
  "common.cancel": "Cancelar",
  "common.retry": "Intentar nuevamente",
  "common.back": "Volver",
} as const;

type FlowTextKey = keyof typeof es;
type FlowTable = Record<FlowTextKey, string>;

const en: FlowTable = {
  "plan.active": "Active", "plan.continue": "Continue your plan", "plan.currentDay": "Current day", "plan.progressShort": "Progress", "plan.nextReading": "Next reading", "plan.pendingShort": "{count} pending reading(s)", "plan.returnCalmly": "There is no need to rush. Return here and continue calmly.", "plan.activeCount": "{count} active",
  "plan.notFound": "We could not find this devotional plan.", "plan.thread": "Guiding thread", "plan.duration": "Duration", "plan.progress": "Progress", "plan.resume": "Pick it up", "plan.continueToday": "Continue today", "plan.pending": "You have {count} pending reading(s). You do not need to rush; return to the next step.", "plan.openOne": "Open one reading, mark it at the end, and let the plan guide you day by day.", "plan.enrollHelp": "Enroll once, then read one day at your own pace without seeing everything at once.", "plan.enroll": "Enroll and start day 1", "plan.started": "You started on {date}. The goal is not to rush; it is to return today.", "plan.readToday": "Read today", "plan.today": "Today", "plan.journey": "Journey", "plan.yourProgress": "Your day-by-day progress", "plan.preview": "What you will walk through", "plan.completedBody": "This reading is already marked and remains available for a calm reread.", "plan.missedBody": "This reading is pending. You can pick it up now without losing the thread.", "plan.todayBody": "This is the reading set for you today.", "plan.status.completed": "Done", "plan.status.preview": "Preview", "plan.status.missed": "Pending", "plan.status.today": "Today", "plan.status.upcoming": "Later", "day.enrollFirst": "Enroll in the plan before opening this reading.", "day.back": "Back to plan", "day.of": "Day {day} of {total}", "day.completed": "Reading completed", "day.today": "Today's reading", "day.planReading": "Plan reading", "day.day": "Day", "day.base": "Base reading", "day.prayer": "Guided prayer", "day.alreadyDone": "This day is already marked.", "day.alreadyDoneBody": "Return to the plan to continue, or reread this page at your own pace.", "day.markDone": "Mark day as complete", "day.next": "Coming next", "day.nextBody": "After completing this day, you will return to the plan and the next reading will be ready.", "common.cancel": "Cancel", "common.retry": "Try again", "common.back": "Back",
};

const fr: FlowTable = {
  "plan.active": "Actif", "plan.continue": "Continuez votre plan", "plan.currentDay": "Jour actuel", "plan.progressShort": "Progression", "plan.nextReading": "Lecture suivante", "plan.pendingShort": "{count} lecture(s) en attente", "plan.returnCalmly": "Inutile de courir. Revenez ici et poursuivez calmement.", "plan.activeCount": "{count} actifs",
  "plan.notFound": "Ce plan de lecture est introuvable.", "plan.thread": "Fil conducteur", "plan.duration": "Durée", "plan.progress": "Progression", "plan.resume": "Reprendre", "plan.continueToday": "Continuer aujourd'hui", "plan.pending": "Vous avez {count} lecture(s) en attente. Inutile de courir ; reprenez simplement l'étape suivante.", "plan.openOne": "Ouvrez une seule lecture, marquez-la à la fin et laissez le plan vous guider jour après jour.", "plan.enrollHelp": "Inscrivez-vous une fois, puis avancez un jour à la fois, à votre rythme.", "plan.enroll": "M'inscrire et commencer le jour 1", "plan.started": "Vous avez commencé le {date}. L'essentiel n'est pas d'aller vite, mais de revenir aujourd'hui.", "plan.readToday": "Lire aujourd'hui", "plan.today": "Aujourd'hui", "plan.journey": "Parcours", "plan.yourProgress": "Votre progression jour après jour", "plan.preview": "Ce que vous allez parcourir", "plan.completedBody": "Cette lecture est déjà marquée et reste disponible pour être relue calmement.", "plan.missedBody": "Cette lecture est en attente. Vous pouvez la reprendre sans perdre le fil.", "plan.todayBody": "Voici la lecture prévue pour vous aujourd'hui.", "plan.status.completed": "Fait", "plan.status.preview": "Aperçu", "plan.status.missed": "En attente", "plan.status.today": "Aujourd'hui", "plan.status.upcoming": "Plus tard", "day.enrollFirst": "Inscrivez-vous d'abord au plan pour ouvrir cette lecture.", "day.back": "Retour au plan", "day.of": "Jour {day} sur {total}", "day.completed": "Lecture terminée", "day.today": "Lecture du jour", "day.planReading": "Lecture du plan", "day.day": "Jour", "day.base": "Lecture de base", "day.prayer": "Prière guidée", "day.alreadyDone": "Ce jour est déjà marqué.", "day.alreadyDoneBody": "Revenez au plan pour continuer ou relisez cette page à votre rythme.", "day.markDone": "Marquer le jour comme terminé", "day.next": "Ensuite", "day.nextBody": "Après avoir terminé ce jour, vous reviendrez au plan et la prochaine lecture sera prête.", "common.cancel": "Annuler", "common.retry": "Réessayer", "common.back": "Retour",
};

const pt: FlowTable = {
  "plan.active": "Ativo", "plan.continue": "Continue seu plano", "plan.currentDay": "Dia atual", "plan.progressShort": "Progresso", "plan.nextReading": "Próxima leitura", "plan.pendingShort": "{count} leitura(s) pendente(s)", "plan.returnCalmly": "Não precisa correr. Volte a este ponto e continue com calma.", "plan.activeCount": "{count} ativos",
  "plan.notFound": "Não encontramos este plano devocional.", "plan.thread": "Fio condutor", "plan.duration": "Duração", "plan.progress": "Progresso", "plan.resume": "Retome", "plan.continueToday": "Continue hoje", "plan.pending": "Você tem {count} leitura(s) pendente(s). Não precisa correr; volte ao próximo passo.", "plan.openOne": "Abra uma leitura, marque-a no final e deixe o plano guiar você dia após dia.", "plan.enrollHelp": "Inscreva-se uma vez e depois leia um dia de cada vez, no seu ritmo.", "plan.enroll": "Inscrever-me e começar o dia 1", "plan.started": "Você começou em {date}. O importante não é correr; é voltar hoje.", "plan.readToday": "Ler hoje", "plan.today": "Hoje", "plan.journey": "Caminho", "plan.yourProgress": "Seu progresso dia após dia", "plan.preview": "O que você vai percorrer", "plan.completedBody": "Esta leitura já foi marcada e continua disponível para ser relida com calma.", "plan.missedBody": "Esta leitura ficou pendente. Você pode retomá-la sem perder o fio do plano.", "plan.todayBody": "Esta é a leitura reservada para você hoje.", "plan.status.completed": "Concluído", "plan.status.preview": "Prévia", "plan.status.missed": "Pendente", "plan.status.today": "Hoje", "plan.status.upcoming": "Depois", "day.enrollFirst": "Inscreva-se primeiro no plano para abrir esta leitura.", "day.back": "Voltar ao plano", "day.of": "Dia {day} de {total}", "day.completed": "Leitura concluída", "day.today": "Leitura de hoje", "day.planReading": "Leitura do plano", "day.day": "Dia", "day.base": "Leitura base", "day.prayer": "Oração guiada", "day.alreadyDone": "Este dia já foi marcado.", "day.alreadyDoneBody": "Volte ao plano para continuar ou releia esta página com calma.", "day.markDone": "Marcar dia como concluído", "day.next": "A seguir", "day.nextBody": "Ao concluir este dia, você voltará ao plano e a próxima leitura estará pronta.", "common.cancel": "Cancelar", "common.retry": "Tentar novamente", "common.back": "Voltar",
};

const tables: Record<SupportedLanguage, FlowTable> = { es, en, fr, pt };

export function flowText(language: SupportedLanguage, key: FlowTextKey, variables: Record<string, string | number> = {}) {
  let value = tables[language][key];
  for (const [name, replacement] of Object.entries(variables)) value = value.replaceAll(`{${name}}`, String(replacement));
  return value;
}

export function languageLocale(language: SupportedLanguage) {
  return { es: "es-CO", en: "en-US", fr: "fr-FR", pt: "pt-BR" }[language];
}

export type { FlowTextKey };
