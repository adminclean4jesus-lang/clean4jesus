import { MaterialCommunityIcons } from "@/components/MaterialCommunityIcon";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { AppLoadingExperience } from "@/components/AppLoadingExperience";
import { InfoCard } from "@/components/InfoCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { WordArtwork } from "@/components/WordArtwork";
import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { useDevotionalCatalog } from "@/features/devotionalPlans/DevotionalCatalogProvider";
import { useDevotionalPlanDetail } from "@/features/devotionalPlans/useDevotionalPlanDetail";
import {
  enrollDevotionalPlan,
  getCurrentPlanDay,
  getDevotionalPlanProgress,
  getMissedPlanDaysCount,
  getPlanDayDate,
  getSuggestedPlanDay,
} from "@/features/devotionalPlans/devotionalPlanService";
import { syncDevotionalReminder } from "@/features/devotionalPlans/devotionalReminderService";
import { getPlanVisual } from "@/features/devotionalPlans/planVisuals";
import { useI18n } from "@/features/i18n/I18nProvider";
import { flowText, languageLocale } from "@/features/i18n/flowText";
import type { SupportedLanguage } from "@/features/i18n/i18n";
import { uiText } from "@/features/i18n/uiText";
import { useShieldGate } from "@/features/shield/useShieldGate";
import { fonts, ThemeColors } from "@/theme";
import { DevotionalPlanEnrollment } from "@/types/devotionalPlan";

export default function DevotionalPlanDetailScreen() {
  const { colors, isDark } = useAppAppearance();
  const { language } = useI18n();
  const { plans } = useDevotionalCatalog();
  const styles = usePlanDetailStyles();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { checked } = useShieldGate();
  const planId = String(id);
  const summary = useMemo(() => plans.find((item) => item.id === planId) ?? null, [planId, plans]);
  const { error: detailError, loading: detailLoading, plan, reload } = useDevotionalPlanDetail(summary ? planId : null);
  const [enrollment, setEnrollment] = useState<DevotionalPlanEnrollment | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void (async () => {
        const progress = await getDevotionalPlanProgress();
        if (active) {
          setEnrollment(progress[planId] ?? null);
        }
      })();

      return () => {
        active = false;
      };
    }, [planId]),
  );

  if (!checked) {
    return <AppLoadingExperience layout="contextual" message={uiText(language, "word.loading")} />;
  }

  if (summary && detailLoading && !plan) {
    return <AppLoadingExperience layout="contextual" message={uiText(language, "word.loading")} />;
  }

  if (!summary) {
    return (
      <Screen>
        <AppHeader eyebrow={uiText(language, "tabs.word")} icon="book-open-page-variant-outline" title={uiText(language, "word.openPlan")} />
        <InfoCard tone="outline">
          <Text style={styles.bodyText}>{flowText(language, "plan.notFound")}</Text>
        </InfoCard>
      </Screen>
    );
  }

  if (!plan || detailError) {
    return (
      <Screen>
        <AppHeader eyebrow={uiText(language, "word.catalog")} icon="cloud-download-outline" title={summary.title} />
        <InfoCard tone="outline">
          <Text style={styles.bodyText}>{downloadCopy(language)}</Text>
        </InfoCard>
        <PrimaryButton label={retryCopy(language)} onPress={() => void reload()} />
      </Screen>
    );
  }

  const resolvedPlan = plan;
  const visual = getPlanVisual(resolvedPlan.id, language);
  const completedCount = enrollment?.completedDays.length ?? 0;
  const progress = completedCount / resolvedPlan.days.length;
  const currentDay = getCurrentPlanDay(enrollment);
  const nextDayNumber = getSuggestedPlanDay(resolvedPlan.id, enrollment);
  const missedDays = getMissedPlanDaysCount(resolvedPlan.id, enrollment);
  const nextDay = nextDayNumber ? resolvedPlan.days.find((day) => day.day === nextDayNumber) : null;
  const todayPlanDay = currentDay
    ? resolvedPlan.days.find((day) => day.day === Math.min(currentDay, resolvedPlan.days.length))
    : null;

  async function handleEnroll() {
    const next = await enrollDevotionalPlan(resolvedPlan.id);
    setEnrollment(next);
    await syncDevotionalReminder({
      ...(await getDevotionalPlanProgress()),
      [resolvedPlan.id]: next,
    });
    router.push(`/plans/${resolvedPlan.id}/day/1`);
  }

  function openDay(day: number) {
    if (!enrollment) {
      return;
    }
    router.push(`/plans/${planId}/day/${day}`);
  }

  return (
    <Screen>
      <AppHeader
        eyebrow={uiText(language, "word.catalog")}
        icon={resolvedPlan.icon as keyof typeof MaterialCommunityIcons.glyphMap}
        subtitle={resolvedPlan.subtitle}
        title={resolvedPlan.title}
      />

      <View style={styles.heroShell}>
        <LinearGradient colors={isDark ? [colors.surface, colors.surfaceAlt, colors.surface] : [colors.surface, "#EEF2FF", colors.surface]} style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroEyebrow}>{visual.kicker}</Text>
              <Text style={styles.heroTitle}>{resolvedPlan.title}</Text>
              <Text style={styles.heroBody}>{visual.promise}</Text>
              <Text style={styles.heroDescription}>{resolvedPlan.description}</Text>
            </View>
            <View style={styles.heroArt}>
              <WordArtwork height={134} motif={visual.motif} tone={visual.tone} width={134} />
            </View>
          </View>

          <View style={styles.threadBox}>
            <Text style={styles.threadLabel}>{flowText(language, "plan.thread")}</Text>
            <Text style={styles.threadText}>{resolvedPlan.days[0]?.practice ?? resolvedPlan.description}</Text>
          </View>

          <View style={styles.progressRow}>
            <View style={styles.progressCard}>
              <Text style={styles.metricLabel}>{flowText(language, "plan.duration")}</Text>
              <Text style={styles.metricValue}>{resolvedPlan.days.length} {uiText(language, "word.days")}</Text>
            </View>
            <View style={styles.progressCard}>
              <Text style={styles.metricLabel}>{flowText(language, "plan.progress")}</Text>
              <Text style={styles.metricValue}>{Math.round(progress * 100)}%</Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
          </View>

          {enrollment && nextDay ? (
            <View style={styles.statusStrip}>
              <View style={styles.statusStripCopy}>
                <Text style={styles.statusStripLabel}>{flowText(language, missedDays > 0 ? "plan.resume" : "plan.continueToday")}</Text>
                <Text style={styles.statusStripTitle}>
                  {flowText(language, "day.day")} {nextDay.day}: {nextDay.title}
                </Text>
                <Text style={styles.statusStripBody}>
                  {flowText(language, missedDays > 0 ? "plan.pending" : "plan.openOne", { count: missedDays })}
                </Text>
              </View>
            </View>
          ) : null}

          {!enrollment ? (
            <View style={styles.ctaBlock}>
              <Text style={styles.helperText}>
                {flowText(language, "plan.enrollHelp")}
              </Text>
              <PrimaryButton label={flowText(language, "plan.enroll")} onPress={handleEnroll} />
            </View>
          ) : (
            <View style={styles.ctaBlock}>
              <Text style={styles.helperText}>
                {flowText(language, "plan.started", { date: formatPlanDate(enrollment.startedAt, language) })}
              </Text>
            </View>
          )}
        </LinearGradient>
      </View>

      {enrollment && todayPlanDay ? (
        <View>
          <Pressable
            onPress={() => openDay(todayPlanDay.day)}
            style={({ pressed }) => [styles.todayCard, pressed && styles.pressed]}
          >
            <LinearGradient colors={isDark ? ["#2D2A20", colors.surface] : ["rgba(249,168,37,0.08)", colors.surface]} style={styles.todayGradient}>
              <View style={styles.todayHeader}>
                <View>
                  <Text style={styles.sectionEyebrow}>{flowText(language, "plan.readToday")}</Text>
                  <Text style={styles.todayTitle}>{flowText(language, "day.day")} {todayPlanDay.day}: {todayPlanDay.title}</Text>
                </View>
                <View style={styles.todayBadge}>
                  <Text style={styles.todayBadgeText}>{flowText(language, "plan.today")}</Text>
                </View>
              </View>
              <Text style={styles.todayBody}>{todayPlanDay.verse}</Text>
              <Text style={styles.todayMeta}>{todayPlanDay.reference}</Text>
            </LinearGradient>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionEyebrow}>{flowText(language, "plan.journey")}</Text>
          <Text style={styles.sectionTitle}>{flowText(language, enrollment ? "plan.yourProgress" : "plan.preview")}</Text>
        </View>
        <Text style={styles.sectionCounter}>{completedCount}/{resolvedPlan.days.length}</Text>
      </View>

      <View style={styles.dayList}>
        {resolvedPlan.days.map((day) => {
          const scheduled = getPlanDayDate(enrollment, day.day);
          const status = getDayStatus(enrollment, day.day, currentDay);
          const isCurrent = status === "today";

          return (
            <Pressable
              key={day.day}
              disabled={!enrollment}
              onPress={() => openDay(day.day)}
              style={({ pressed }) => [
                styles.dayCard,
                isCurrent && styles.dayCardCurrent,
                status === "completed" && styles.dayCardCompleted,
                !enrollment && styles.dayCardLocked,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.dayLeading}>
                <View style={[styles.dayNumber, isCurrent && styles.dayNumberCurrent, status === "completed" && styles.dayNumberCompleted]}>
                  {status === "completed" ? (
                    <MaterialCommunityIcons color={colors.success} name="check" size={18} />
                  ) : (
                    <Text style={[styles.dayNumberText, isCurrent && styles.dayNumberTextCurrent]}>{day.day}</Text>
                  )}
                </View>
                <View style={styles.dayCopy}>
                  <View style={styles.dayTitleRow}>
                    <Text style={styles.dayTitle}>{day.title}</Text>
                    <StatusPill language={language} status={status} />
                  </View>
                  <Text style={styles.daySubtitle}>{scheduled ? formatPlanDate(scheduled, language) : day.reference}</Text>
                  <Text numberOfLines={2} style={styles.dayBody}>
                    {status === "completed"
                      ? flowText(language, "plan.completedBody")
                      : status === "missed"
                        ? flowText(language, "plan.missedBody")
                        : status === "today"
                          ? flowText(language, "plan.todayBody")
                          : day.verse}
                  </Text>
                </View>
              </View>
              <MaterialCommunityIcons color={enrollment ? colors.primary : colors.mutedDark} name="chevron-right" size={20} />
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

function downloadCopy(language: SupportedLanguage) {
  return {
    es: "Este plan todavía no está guardado en el teléfono. Conéctate a internet para descargarlo; después podrás leerlo sin conexión.",
    en: "This plan is not saved on your phone yet. Connect to the internet to download it; afterward you can read it offline.",
    fr: "Ce plan n'est pas encore enregistré sur votre téléphone. Connectez-vous pour le télécharger; vous pourrez ensuite le lire hors ligne.",
    pt: "Este plano ainda não está salvo no seu telefone. Conecte-se à internet para baixá-lo; depois você poderá lê-lo offline.",
  }[language];
}

function retryCopy(language: SupportedLanguage) {
  return { es: "Descargar plan", en: "Download plan", fr: "Télécharger le plan", pt: "Baixar plano" }[language];
}

function getDayStatus(enrollment: DevotionalPlanEnrollment | null, day: number, currentDay: number | null) {
  if (!enrollment) {
    return "locked" as const;
  }
  if (enrollment.completedDays.includes(day)) {
    return "completed" as const;
  }
  if (currentDay && day < currentDay) {
    return "missed" as const;
  }
  if (currentDay === day) {
    return "today" as const;
  }
  return "upcoming" as const;
}

function StatusPill({ language, status }: { language: SupportedLanguage; status: ReturnType<typeof getDayStatus> }) {
  const styles = usePlanDetailStyles();
  const label = {
    completed: flowText(language, "plan.status.completed"),
    locked: flowText(language, "plan.status.preview"),
    missed: flowText(language, "plan.status.missed"),
    today: flowText(language, "plan.status.today"),
    upcoming: flowText(language, "plan.status.upcoming"),
  }[status];

  return (
    <View style={[styles.statusPill, styles[`status_${status}`]]}>
      <Text style={[styles.statusText, status === "completed" && styles.statusTextCompleted]}>{label}</Text>
    </View>
  );
}

function formatPlanDate(dateKeyValue: string, language: SupportedLanguage) {
  const [year, month, day] = dateKeyValue.split("-").map(Number);
  return new Intl.DateTimeFormat(languageLocale(language), {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function usePlanDetailStyles() {
  const { colors, isDark } = useAppAppearance();
  return useMemo(() => createStyles(colors, isDark), [colors, isDark]);
}

function createStyles(colors: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
  loading: {
    color: colors.muted,
    fontFamily: fonts.body,
  },
  heroShell: {
    borderRadius: 28,
    overflow: "hidden",
  },
  heroCard: {
    borderColor: colors.border,
    borderRadius: 28,
    borderWidth: 1,
    gap: 16,
    padding: 18,
  },
  heroTop: {
    flexDirection: "row",
    gap: 12,
  },
  heroCopy: {
    flex: 1,
    gap: 8,
  },
  heroEyebrow: {
    color: colors.primary,
    fontFamily: fonts.label,
    fontSize: 10.5,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 32,
  },
  heroBody: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
  },
  heroDescription: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 21,
  },
  heroArt: {
    alignSelf: "center",
    borderRadius: 24,
    overflow: "hidden",
  },
  threadBox: {
    backgroundColor: isDark ? "#2D2A20" : "#FCF9EF",
    borderColor: colors.partialSoft,
    borderRadius: 22,
    borderWidth: 1,
    gap: 6,
    padding: 14,
  },
  threadLabel: {
    color: colors.partial,
    fontFamily: fonts.label,
    fontSize: 10,
    textTransform: "uppercase",
  },
  threadText: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 21,
  },
  progressRow: {
    flexDirection: "row",
    gap: 10,
  },
  progressCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    padding: 12,
  },
  metricLabel: {
    color: colors.muted,
    fontFamily: fonts.label,
    fontSize: 10,
    textTransform: "uppercase",
  },
  metricValue: {
    color: colors.primaryDark,
    fontFamily: fonts.display,
    fontSize: 20,
  },
  progressTrack: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    height: 8,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: colors.primaryDark,
    borderRadius: 999,
    height: "100%",
  },
  statusStrip: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
  },
  statusStripCopy: {
    gap: 4,
  },
  statusStripLabel: {
    color: colors.primary,
    fontFamily: fonts.label,
    fontSize: 10,
    textTransform: "uppercase",
  },
  statusStripTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 16,
    lineHeight: 21,
  },
  statusStripBody: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 19,
  },
  ctaBlock: {
    gap: 10,
  },
  helperText: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 20,
  },
  todayCard: {
    borderRadius: 24,
    overflow: "hidden",
  },
  todayGradient: {
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  todayHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionEyebrow: {
    color: colors.primary,
    fontFamily: fonts.label,
    fontSize: 10.5,
    textTransform: "uppercase",
  },
  todayTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 20,
    lineHeight: 25,
    marginTop: 2,
  },
  todayBadge: {
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  todayBadgeText: {
    color: colors.partial,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
  },
  todayBody: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 16,
    fontStyle: "italic",
    lineHeight: 24,
  },
  todayMeta: {
    color: colors.primaryDark,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 18,
    lineHeight: 22,
    marginTop: 2,
  },
  sectionCounter: {
    color: colors.primaryDark,
    fontFamily: fonts.display,
    fontSize: 24,
  },
  dayList: {
    gap: 10,
  },
  dayCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    padding: 14,
  },
  dayCardCurrent: {
    backgroundColor: isDark ? "#2D2A20" : "#FBF8EE",
    borderColor: colors.partialSoft,
  },
  dayCardCompleted: {
    backgroundColor: colors.successSoft,
    borderColor: colors.successSoft,
  },
  dayCardLocked: {
    opacity: 0.74,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  dayLeading: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
  },
  dayNumber: {
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    borderRadius: 18,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  dayNumberCurrent: {
    backgroundColor: colors.accentSoft,
  },
  dayNumberCompleted: {
    backgroundColor: colors.successSoft,
  },
  dayNumberText: {
    color: colors.primaryDark,
    fontFamily: fonts.display,
    fontSize: 16,
  },
  dayNumberTextCurrent: {
    color: colors.partial,
  },
  dayCopy: {
    flex: 1,
    gap: 4,
  },
  dayTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  dayTitle: {
    color: colors.text,
    flex: 1,
    fontFamily: fonts.heading,
    fontSize: 16,
    lineHeight: 21,
  },
  daySubtitle: {
    color: colors.primaryDark,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
  },
  dayBody: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 19,
  },
  statusPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  status_locked: {
    backgroundColor: colors.surfaceAlt,
  },
  status_upcoming: {
    backgroundColor: colors.surfaceAlt,
  },
  status_today: {
    backgroundColor: colors.accentSoft,
  },
  status_missed: {
    backgroundColor: isDark ? "#38232A" : "#FFF1F1",
  },
  status_completed: {
    backgroundColor: colors.successSoft,
  },
  statusText: {
    color: colors.primaryDark,
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
  },
  statusTextCompleted: {
    color: colors.success,
  },
  bodyText: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 20,
  },
  });
}
