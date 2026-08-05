import { MaterialCommunityIcons } from "@/components/MaterialCommunityIcon";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

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
  completeDevotionalPlanDay,
  getCurrentPlanDay,
  getDevotionalPlanProgress,
  getPlanDayDate,
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

export default function DevotionalPlanDayScreen() {
  const { colors, isDark } = useAppAppearance();
  const { language } = useI18n();
  const { plans } = useDevotionalCatalog();
  const styles = usePlanDayStyles();
  const { day, id } = useLocalSearchParams<{ day: string; id: string }>();
  const router = useRouter();
  const { checked } = useShieldGate();
  const planId = String(id);
  const dayNumber = Number(day);
  const summary = useMemo(() => plans.find((item) => item.id === planId) ?? null, [planId, plans]);
  const { loading: detailLoading, plan } = useDevotionalPlanDetail(summary ? planId : null);
  const planDay = plan?.days.find((item) => item.day === dayNumber) ?? null;
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

  if (!plan || !planDay || !enrollment) {
    return (
      <Screen>
        <AppHeader eyebrow={uiText(language, "tabs.word")} icon="book-open-page-variant-outline" title={uiText(language, "word.openPlan")} />
        <InfoCard tone="outline">
          <Text style={styles.bodyText}>{flowText(language, "day.enrollFirst")}</Text>
        </InfoCard>
        <PrimaryButton label={flowText(language, "day.back")} onPress={() => router.replace(`/plans/${planId}`)} />
      </Screen>
    );
  }

  const resolvedPlan = plan;
  const resolvedPlanDay = resolvedPlan.days.find((item) => item.day === dayNumber) ?? resolvedPlan.days[0];
  const visual = getPlanVisual(resolvedPlan.id, language);
  const scheduled = getPlanDayDate(enrollment, resolvedPlanDay.day);
  const currentDay = getCurrentPlanDay(enrollment);
  const completed = enrollment.completedDays.includes(resolvedPlanDay.day);
  const nextDay = resolvedPlan.days.find((item) => item.day === resolvedPlanDay.day + 1);
  const completedRatio = resolvedPlan.days.length ? enrollment.completedDays.length / resolvedPlan.days.length : 0;

  async function handleComplete() {
    const next = await completeDevotionalPlanDay(planId, resolvedPlanDay.day);
    setEnrollment(next);
    await syncDevotionalReminder({
      ...(await getDevotionalPlanProgress()),
      [planId]: next,
    });
    router.replace(`/plans/${planId}`);
  }

  return (
    <Screen>
      <AppHeader
        eyebrow={flowText(language, "day.of", { day: resolvedPlanDay.day, total: resolvedPlan.days.length })}
        icon={resolvedPlan.icon as keyof typeof MaterialCommunityIcons.glyphMap}
        subtitle={scheduled ? formatPlanDate(scheduled, language) : resolvedPlan.title}
        title={resolvedPlanDay.title}
      />

      <View style={styles.readerShell}>
        <LinearGradient colors={isDark ? [colors.surface, colors.surfaceAlt, colors.surface] : [colors.surface, "#EEF2FF", colors.surface]} style={styles.readerCard}>
          <View style={styles.readerTop}>
            <View style={styles.readerCopy}>
              <Text style={styles.readerEyebrow}>{flowText(language, completed ? "day.completed" : currentDay === resolvedPlanDay.day ? "day.today" : "day.planReading")}</Text>
              <Text style={styles.readerPlanTitle}>{resolvedPlan.title}</Text>
              <Text style={styles.readerBody}>{visual.promise}</Text>
            </View>
            <View style={styles.readerArt}>
              <WordArtwork height={120} motif={visual.motif} tone={visual.tone} width={120} />
            </View>
          </View>

          <View style={styles.progressSummary}>
            <View style={styles.progressCard}>
              <Text style={styles.metricLabel}>{flowText(language, "day.day")}</Text>
              <Text style={styles.metricValue}>{resolvedPlanDay.day}</Text>
            </View>
            <View style={styles.progressCard}>
              <Text style={styles.metricLabel}>{flowText(language, "plan.progress")}</Text>
              <Text style={styles.metricValue}>{Math.round(completedRatio * 100)}%</Text>
            </View>
          </View>

          <View style={styles.versePanel}>
              <Text style={styles.verseKicker}>{flowText(language, "day.base")}</Text>
            <Text style={styles.verse}>{resolvedPlanDay.verse}</Text>
            <Text style={styles.reference}>{resolvedPlanDay.reference}</Text>
          </View>

          <View style={styles.reflectionWrap}>
          {resolvedPlanDay.reflection.split("\n\n").map((paragraph) => (
              <Text key={paragraph.slice(0, 42)} style={styles.reflection}>
                {paragraph}
              </Text>
            ))}
          </View>

          <InfoCard style={styles.applicationCard} tone="light">
            <Text style={styles.blockLabel}>{uiText(language, "word.apply")}</Text>
            <Text style={styles.question}>{resolvedPlanDay.question}</Text>
          </InfoCard>

          <View style={styles.practiceCard}>
            <Text style={styles.blockLabelGold}>{uiText(language, "word.concreteStep")}</Text>
            <Text style={styles.practiceText}>{resolvedPlanDay.practice}</Text>
          </View>

          <InfoCard style={styles.prayerCard} tone="outline">
            <View style={styles.prayerHeader}>
              <MaterialCommunityIcons color={colors.primary} name="hands-pray" size={18} />
              <Text style={styles.blockLabel}>{flowText(language, "day.prayer")}</Text>
            </View>
            <Text style={styles.prayerText}>{resolvedPlanDay.prayer}</Text>
          </InfoCard>

          {completed ? (
            <InfoCard style={styles.completionCard} tone="outline">
              <Text style={styles.completionTitle}>{flowText(language, "day.alreadyDone")}</Text>
              <Text style={styles.completionText}>
                {flowText(language, "day.alreadyDoneBody")}
              </Text>
            </InfoCard>
          ) : null}

          <PrimaryButton
            label={flowText(language, completed ? "day.back" : "day.markDone")}
            onPress={completed ? () => router.replace(`/plans/${resolvedPlan.id}`) : handleComplete}
          />

          {!completed && nextDay ? (
            <View style={styles.nextCard}>
              <Text style={styles.nextLabel}>{flowText(language, "day.next")}</Text>
              <Text style={styles.nextTitle}>{flowText(language, "day.day")} {nextDay.day}: {nextDay.title}</Text>
              <Text style={styles.nextText}>
                {flowText(language, "day.nextBody")}
              </Text>
            </View>
          ) : null}
        </LinearGradient>
      </View>
    </Screen>
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

function usePlanDayStyles() {
  const { colors, isDark } = useAppAppearance();
  return useMemo(() => createStyles(colors, isDark), [colors, isDark]);
}

function createStyles(colors: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
  loading: {
    color: colors.muted,
    fontFamily: fonts.body,
  },
  readerShell: {
    borderRadius: 28,
    overflow: "hidden",
  },
  readerCard: {
    borderColor: colors.border,
    borderRadius: 28,
    borderWidth: 1,
    gap: 16,
    padding: 18,
  },
  readerTop: {
    flexDirection: "row",
    gap: 12,
  },
  readerCopy: {
    flex: 1,
    gap: 6,
  },
  readerEyebrow: {
    color: colors.primary,
    fontFamily: fonts.label,
    fontSize: 10.5,
    textTransform: "uppercase",
  },
  readerPlanTitle: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 24,
    lineHeight: 28,
  },
  readerBody: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 21,
  },
  readerArt: {
    alignSelf: "center",
    borderRadius: 22,
    overflow: "hidden",
  },
  progressSummary: {
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
    fontSize: 21,
  },
  versePanel: {
    backgroundColor: isDark ? "#2D2A20" : "#FCF9EF",
    borderColor: colors.partialSoft,
    borderRadius: 24,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  verseKicker: {
    color: colors.partial,
    fontFamily: fonts.label,
    fontSize: 10,
    textTransform: "uppercase",
  },
  verse: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 20,
    fontStyle: "italic",
    lineHeight: 30,
  },
  reference: {
    color: colors.primaryDark,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
  },
  reflectionWrap: {
    gap: 14,
  },
  reflection: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 25,
  },
  applicationCard: {
    gap: 8,
  },
  blockLabel: {
    color: colors.primary,
    fontFamily: fonts.label,
    fontSize: 10.5,
    textTransform: "uppercase",
  },
  blockLabelGold: {
    color: colors.partial,
    fontFamily: fonts.label,
    fontSize: 10.5,
    textTransform: "uppercase",
  },
  question: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 18,
    lineHeight: 26,
  },
  practiceCard: {
    backgroundColor: isDark ? "#2D2A20" : "#FFFBF1",
    borderColor: colors.partialSoft,
    borderRadius: 22,
    borderWidth: 1,
    gap: 6,
    padding: 14,
  },
  practiceText: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 21,
  },
  prayerCard: {
    gap: 10,
  },
  prayerHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  prayerText: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 21,
  },
  completionCard: {
    gap: 6,
  },
  completionTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 16,
  },
  completionText: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 20,
  },
  nextCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 18,
    gap: 4,
    padding: 14,
  },
  nextLabel: {
    color: colors.primary,
    fontFamily: fonts.label,
    fontSize: 10,
    textTransform: "uppercase",
  },
  nextTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 16,
    lineHeight: 20,
  },
  nextText: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 12.8,
    lineHeight: 20,
  },
  bodyText: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 20,
  },
  });
}
