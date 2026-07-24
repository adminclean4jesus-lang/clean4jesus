import { getDevotionalCatalogSnapshot } from "@/features/devotionalPlans/devotionalCatalogStore";
import { DevotionalPlanEnrollment, DevotionalPlanProgress } from "@/types/devotionalPlan";
import { DevotionalReminderTarget } from "@/types/devotionalReminder";
import type { SupportedLanguage } from "@/features/i18n/i18n";
import { languageLocale } from "@/features/i18n/flowText";
import type { DevotionalPlanSummary } from "@/types/devotionalPlan";
import { getMissedPlanDaysCount, getSuggestedPlanDay } from "./devotionalPlanService";

type ActivePlanEntry = {
  enrollment: DevotionalPlanEnrollment;
  plan: DevotionalPlanSummary;
};

export function formatReminderTime(hour: number, minute: number, language: SupportedLanguage = "es") {
  return new Intl.DateTimeFormat(languageLocale(language), {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2026, 0, 1, hour, minute));
}

export function getDevotionalReminderTarget(progress: DevotionalPlanProgress, language: SupportedLanguage = "es"): DevotionalReminderTarget {
  const catalog = getDevotionalCatalogSnapshot(language);
  const activePlans = catalog
    .map((plan) => {
      const enrollment = progress[plan.id];
      if (!enrollment || enrollment.completedDays.length >= plan.dayCount) {
        return null;
      }

      return {
        enrollment,
        plan,
      };
    })
    .filter((item): item is ActivePlanEntry => Boolean(item))
    .sort((left, right) => String(right.enrollment.startedAt).localeCompare(String(left.enrollment.startedAt)));

  if (activePlans.length === 0) {
    const daily = {
      es: ["Palabra para hoy", "Vuelve a tu lectura guiada", "Tu lectura de hoy y el siguiente paso te esperan."],
      en: ["Word for today", "Return to your guided reading", "Today's reading and your next step are waiting."],
      fr: ["Parole du jour", "Revenez à votre lecture guidée", "La lecture du jour et votre prochaine étape vous attendent."],
      pt: ["Palavra para hoje", "Volte à sua leitura guiada", "A leitura de hoje e seu próximo passo estão esperando."],
    }[language];
    return {
      activePlanCount: 0,
      body: daily[2],
      kind: "daily",
      route: "/(tabs)/devotional",
      subtitle: daily[1],
      title: daily[0],
    };
  }

  const prioritized = activePlans
    .map((item) => {
      const suggestedDay = getSuggestedPlanDay(item.plan.id, item.enrollment) ?? 1;
      const missedDays = getMissedPlanDaysCount(item.plan.id, item.enrollment);
      const planDay = item.plan.dayTitles.find((day) => day.day === suggestedDay)
        ?? { day: suggestedDay, title: `${{ es: "Día", en: "Day", fr: "Jour", pt: "Dia" }[language]} ${suggestedDay}` };

      return {
        ...item,
        missedDays,
        planDay,
        suggestedDay,
      };
    })
    .sort((left, right) => {
      if (right.missedDays !== left.missedDays) {
        return right.missedDays - left.missedDays;
      }

      if (left.suggestedDay !== right.suggestedDay) {
        return left.suggestedDay - right.suggestedDay;
      }

      return String(right.enrollment.startedAt).localeCompare(String(left.enrollment.startedAt));
    });

  const current = prioritized[0]!;
  const extraCount = activePlans.length - 1;
  const dayWord = { es: "día", en: "day", fr: "jour", pt: "dia" }[language];
  const body = current.missedDays > 0
    ? {
        es: `Retoma el día ${current.suggestedDay}: ${current.planDay.title}. Tienes ${current.missedDays} lectura(s) pendiente(s) y hoy puedes volver con calma.`,
        en: `Return to day ${current.suggestedDay}: ${current.planDay.title}. You have ${current.missedDays} pending reading(s), and you can return calmly today.`,
        fr: `Reprenez au jour ${current.suggestedDay} : ${current.planDay.title}. Vous avez ${current.missedDays} lecture(s) en attente et vous pouvez revenir calmement aujourd'hui.`,
        pt: `Retome o dia ${current.suggestedDay}: ${current.planDay.title}. Você tem ${current.missedDays} leitura(s) pendente(s) e pode voltar com calma hoje.`,
      }[language]
    : extraCount > 0
      ? {
          es: `Sigue ${current.plan.title} en el día ${current.suggestedDay}. También tienes ${extraCount} plan(es) activo(s).`,
          en: `Continue ${current.plan.title} on day ${current.suggestedDay}. You also have ${extraCount} other active plan(s).`,
          fr: `Continuez ${current.plan.title} au jour ${current.suggestedDay}. Vous avez aussi ${extraCount} autre(s) plan(s) actif(s).`,
          pt: `Continue ${current.plan.title} no dia ${current.suggestedDay}. Você também tem ${extraCount} outro(s) plano(s) ativo(s).`,
        }[language]
      : {
          es: `Hoy te espera el día ${current.suggestedDay}: ${current.planDay.title}.`,
          en: `Day ${current.suggestedDay} is waiting for you today: ${current.planDay.title}.`,
          fr: `Le jour ${current.suggestedDay} vous attend aujourd'hui : ${current.planDay.title}.`,
          pt: `O dia ${current.suggestedDay} espera por você hoje: ${current.planDay.title}.`,
        }[language];

  return {
    activePlanCount: activePlans.length,
    body,
    day: current.suggestedDay,
    dayTitle: current.planDay.title,
    kind: "plan",
    missedDays: current.missedDays,
    planId: current.plan.id,
    route: `/plans/${current.plan.id}/day/${current.suggestedDay}`,
    subtitle: current.missedDays > 0
      ? { es: `Retoma tu plan desde el día ${current.suggestedDay}`, en: `Return to your plan from day ${current.suggestedDay}`, fr: `Reprenez votre plan au jour ${current.suggestedDay}`, pt: `Retome seu plano no dia ${current.suggestedDay}` }[language]
      : `${dayWord.charAt(0).toUpperCase()}${dayWord.slice(1)} ${current.suggestedDay}: ${current.planDay.title}`,
    title: extraCount > 0
      ? { es: `Tienes ${activePlans.length} planes activos`, en: `You have ${activePlans.length} active plans`, fr: `Vous avez ${activePlans.length} plans actifs`, pt: `Você tem ${activePlans.length} planos ativos` }[language]
      : current.plan.title,
  };
}
