import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { AppLoadingExperience } from "@/components/AppLoadingExperience";
import { InfoCard } from "@/components/InfoCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { WordArtwork } from "@/components/WordArtwork";
import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { useDevotionalCatalog } from "@/features/devotionalPlans/DevotionalCatalogProvider";
import {
  getCurrentPlanDay,
  getDevotionalPlanProgress,
  getMissedPlanDaysCount,
  getSuggestedPlanDay,
} from "@/features/devotionalPlans/devotionalPlanService";
import { getPlanVisual, getThemeVisual } from "@/features/devotionalPlans/planVisuals";
import { getWordSecondaryText } from "@/features/i18n/wordSecondaryText";
import {
  emptyHabitState,
  getHabits,
  HabitState,
  markDevotionalRead,
  todayKey,
} from "@/features/habits/habitService";
import { useShieldGate } from "@/features/shield/useShieldGate";
import { useI18n } from "@/features/i18n/I18nProvider";
import { uiText } from "@/features/i18n/uiText";
import { flowText, languageLocale } from "@/features/i18n/flowText";
import { fonts, ThemeColors } from "@/theme";
import { DevotionalPlanEnrollment, DevotionalPlanProgress, DevotionalPlanSummary } from "@/types/devotionalPlan";

const planCardTones = {
  gold: { accent: "#A16E00", border: "#F0DDA6", surface: "#FFF9EA" },
  jade: { accent: "#177451", border: "#BEE3D0", surface: "#EEF9F3" },
  navy: { accent: "#254C91", border: "#C7D5F0", surface: "#F2F6FF" },
  rose: { accent: "#A33E59", border: "#F0C8D3", surface: "#FFF3F5" },
  violet: { accent: "#5D44B7", border: "#D8CEFF", surface: "#F6F3FF" },
} as const;

function getPlanCardTone(tone: keyof typeof planCardTones, isDark: boolean) {
  const light = planCardTones[tone];
  if (!isDark) return light;
  const dark = {
    gold: { border: "#5A4A22", surface: "#2A251A" },
    jade: { border: "#315E4A", surface: "#192D26" },
    navy: { border: "#3A4D73", surface: "#1D2638" },
    rose: { border: "#683746", surface: "#321E27" },
    violet: { border: "#4D426F", surface: "#28213B" },
  } as const;
  return { ...light, ...dark[tone] };
}

export default function DevotionalScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppAppearance();
  const { language } = useI18n();
  const { dailyDevotional: devotional, plans: localizedPlans } = useDevotionalCatalog();
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(languageLocale(language), {
    day: "numeric",
    month: "long",
    weekday: "long",
  }), [language]);
  const styles = useDevotionalStyles();
  const { width: viewportWidth } = useWindowDimensions();
  const { checked } = useShieldGate();
  const [habits, setHabits] = useState<HabitState | null>(null);
  const [planProgress, setPlanProgress] = useState<DevotionalPlanProgress>({});
  const [viewMode, setViewMode] = useState<"today" | "plans">("today");
  const today = todayKey();
  const secondaryCopy = getWordSecondaryText(language);
  const planCardArtworkWidth = Math.max(240, Math.min(viewportWidth - 64, 520));
  const devotionalVisual = getThemeVisual(devotional.theme, language);
  const readToday = habits?.lastDevotionalReadDate === today;

  const activePlan = useMemo(() => {
    const enrolled = localizedPlans
      .map((plan) => ({
        completed: planProgress[plan.id]?.completedDays.length ?? 0,
        enrollment: planProgress[plan.id],
        plan,
      }))
      .filter((item) => item.enrollment)
      .sort((left, right) => {
        const leftRatio = left.completed / left.plan.dayCount;
        const rightRatio = right.completed / right.plan.dayCount;
        return rightRatio - leftRatio;
      });

    return enrolled[0] ?? null;
  }, [localizedPlans, planProgress]);

  const activePlans = useMemo(() => {
    return localizedPlans
      .map((plan) => ({
        enrollment: planProgress[plan.id],
        plan,
      }))
      .filter((item): item is { enrollment: DevotionalPlanEnrollment; plan: DevotionalPlanSummary } => Boolean(item.enrollment))
      .sort((left, right) => {
        const leftCompleted = left.enrollment.completedDays.length / left.plan.dayCount;
        const rightCompleted = right.enrollment.completedDays.length / right.plan.dayCount;
        return rightCompleted - leftCompleted;
      });
  }, [localizedPlans, planProgress]);

  const highlightedPlans = useMemo(() => {
    return [...localizedPlans].sort((left, right) => {
      const leftEnrollment = planProgress[left.id];
      const rightEnrollment = planProgress[right.id];
      if (leftEnrollment && !rightEnrollment) {
        return -1;
      }
      if (!leftEnrollment && rightEnrollment) {
        return 1;
      }
      return left.title.localeCompare(right.title);
    });
  }, [localizedPlans, planProgress]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      void (async () => {
        try {
          const [next, progress] = await Promise.all([
            getHabits(),
            getDevotionalPlanProgress(),
          ]);

          if (!active) {
            return;
          }

          setHabits(next);
          setPlanProgress(progress);
        } catch {
          if (!active) {
            return;
          }

          setHabits(emptyHabitState);
          setPlanProgress({});
        }
      })();

      return () => {
        active = false;
      };
    }, []),
  );

  function handleModeChange(nextMode: "today" | "plans") {
    if (nextMode === viewMode) {
      return;
    }
    setViewMode(nextMode);
  }

  async function handleRead() {
    setHabits(await markDevotionalRead());
  }

  if (!checked || !habits) {
    return <AppLoadingExperience layout="contextual" message={uiText(language, "word.loading")} />;
  }

  return (
    <Screen>
      <AppHeader
        eyebrow={uiText(language, "tabs.word")}
        icon="book-open-page-variant-outline"
        subtitle={dateFormatter.format(new Date())}
        title={uiText(language, "word.title")}
        titleTrailing={<StreakBadge days={habits.cleanStreak} />}
      />

      <View style={styles.modeSwitch}>
        <ModeChip active={viewMode === "today"} label={uiText(language, "word.today")} onPress={() => handleModeChange("today")} testID="devotional-mode-today" />
        <ModeChip active={viewMode === "plans"} label={uiText(language, "word.plans")} onPress={() => handleModeChange("plans")} testID="devotional-mode-plans" />
      </View>

      <View style={styles.contentStack}>
      {viewMode === "today" ? (
        <>
          <View style={styles.heroShell}>
            <LinearGradient
              colors={isDark ? [colors.surface, colors.surfaceAlt, colors.surface] : [colors.surface, "#EEF2FF", colors.surface]}
              style={styles.heroCard}
            >
              <View style={styles.heroHeader}>
                <View style={styles.heroTextBlock}>
                  <Text style={styles.heroEyebrow}>{uiText(language, "word.todayLabel")}</Text>
                  <Text style={styles.heroTitle}>{devotional.title}</Text>
                  <Text style={styles.heroBody}>{devotionalVisual.promise}</Text>
                  <View style={styles.heroTagRow}>
                    <View style={styles.themeChip}>
                      <MaterialCommunityIcons color={colors.primaryDark} name="star-four-points-outline" size={14} />
                      <Text style={styles.themeChipText}>{devotional.theme}</Text>
                    </View>
                    <View style={styles.readingChip}>
                      <Text style={styles.readingChipText}>{uiText(language, "word.readingTime")}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.heroArtworkFrame}>
                  <WordArtwork height={156} motif={devotionalVisual.motif} tone={devotionalVisual.tone} width={156} />
                </View>
              </View>

              <View style={styles.versePanel}>
                <Text style={styles.verseKicker}>{uiText(language, "word.verse")}</Text>
                <Text style={styles.verseText}>"{devotional.verse}"</Text>
                <Text style={styles.verseReference}>{devotional.reference}</Text>
              </View>

              <View style={styles.narrativeStrip}>
                <View style={styles.narrativeBadge}>
                  <MaterialCommunityIcons color={colors.primary} name="leaf" size={16} />
                </View>
                <View style={styles.narrativeCopy}>
                  <Text style={styles.narrativeTitle}>{devotionalVisual.kicker}</Text>
                  <Text numberOfLines={4} style={styles.narrativeBody}>
                      {readToday
                       ? secondaryCopy.readDoneBody
                      : devotional.reflection}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          <View>
          <InfoCard style={styles.reflectCard} tone="light">
            <View style={styles.sectionTitleRow}>
              <MaterialCommunityIcons color={colors.primary} name="compass-outline" size={18} />
              <Text style={styles.sectionEyebrow}>{uiText(language, "word.apply")}</Text>
            </View>
            <Text style={styles.reflectQuestion}>{devotional.question}</Text>
            <View style={styles.practicePanel}>
              <Text style={styles.practiceKicker}>{uiText(language, "word.concreteStep")}</Text>
              <Text style={styles.practiceText}>{devotional.practice}</Text>
            </View>
          </InfoCard>
          </View>

          <View>
            <PrimaryButton
              disabled={readToday}
              label={readToday ? uiText(language, "word.readDone") : uiText(language, "word.read")}
              onPress={handleRead}
            />
          </View>

          <View style={styles.planHeader}>
            <View style={styles.planHeaderCopy}>
              <Text style={styles.sectionEyebrow}>{uiText(language, "word.activePlans")}</Text>
              <Text style={styles.planHeaderTitle}>{uiText(language, "word.activePlansTitle")}</Text>
              <Text style={styles.planHeaderBody}>
                {uiText(language, "word.activePlansBody")}
              </Text>
            </View>
            <Pressable onPress={() => handleModeChange("plans")} style={({ pressed }) => [styles.planCounter, pressed && styles.planCounterPressed]} testID="devotional-open-plans">
              <Text style={styles.planCounterText}>{uiText(language, "word.plans")}</Text>
            </Pressable>
          </View>

          {activePlan ? (
            <View>
              <PlanSpotlightCard
                completed={activePlan.completed}
                enrollment={activePlan.enrollment}
                onPress={() => router.push(`/plans/${activePlan.plan.id}`)}
                plan={activePlan.plan}
                progress={activePlan.plan.dayCount ? activePlan.completed / activePlan.plan.dayCount : 0}
              />
            </View>
          ) : (
            <View>
              <InfoCard style={styles.emptyPlanCard} tone="outline">
                <View style={styles.emptyPlanTop}>
                  <View style={styles.emptyPlanIcon}>
                    <MaterialCommunityIcons color={colors.primaryDark} name="book-heart-outline" size={20} />
                  </View>
                  <View style={styles.emptyPlanCopy}>
                    <Text style={styles.sectionEyebrow}>{uiText(language, "word.nextStep")}</Text>
                    <Text style={styles.emptyPlanTitle}>{uiText(language, "word.startPlan")}</Text>
                    <Text style={styles.emptyPlanBody}>
                      {uiText(language, "word.startPlanBody")}
                    </Text>
                  </View>
                </View>
                <PrimaryButton label={uiText(language, "word.explorePlans")} onPress={() => handleModeChange("plans")} />
              </InfoCard>
            </View>
          )}

          {activePlans.length > 1 ? (
            <View style={styles.activeList}>
              {activePlans.slice(1, 3).map(({ enrollment, plan }) => (
                <ActivePlanRow
                  enrollment={enrollment}
                  key={plan.id}
                  onPress={() => router.push(`/plans/${plan.id}`)}
                  plan={plan}
                />
              ))}
            </View>
          ) : null}
        </>
      ) : (
        <>
          <View style={styles.planCatalogHeader}>
            <View style={styles.planHeaderCopy}>
              <Text style={styles.sectionEyebrow}>{uiText(language, "word.catalog")}</Text>
              <Text style={styles.planHeaderTitle}>{uiText(language, "word.catalogTitle")}</Text>
              <Text style={styles.planHeaderBody}>
                {uiText(language, "word.catalogBody")}
              </Text>
            </View>
            <View style={styles.planCounter}>
              <Text style={styles.planCounterText}>{flowText(language, "plan.activeCount", { count: activePlans.length })}</Text>
            </View>
          </View>

          <View style={styles.planCatalog}>
            {highlightedPlans.map((plan) => {
              const enrollment = planProgress[plan.id];
              const completed = enrollment?.completedDays.length ?? 0;
              const visual = getPlanVisual(plan.id, language);
              const tone = getPlanCardTone(visual.tone, isDark);
              const displayPlan = plan;

              return (
                <Pressable
                  key={plan.id}
                  onPress={() => router.push(`/plans/${plan.id}`)}
                  style={({ pressed }) => [
                    styles.planCard,
                    { backgroundColor: tone.surface, borderColor: tone.border },
                    pressed && styles.planRowPressed,
                  ]}
                  testID={`plan-catalog-row-${plan.id}`}
                >
                  <View pointerEvents="none" style={[styles.planAccent, { backgroundColor: tone.accent }]} />
                  <View pointerEvents="none" style={styles.planCardVisual} testID={`plan-catalog-art-${plan.id}`}>
                    <WordArtwork height={96} motif={visual.motif} tone={visual.tone} width={planCardArtworkWidth} />
                  </View>
                  <View style={styles.planCardBody}>
                    <View style={styles.planCardCopy}>
                      <Text style={[styles.planKicker, { color: tone.accent }]}>{visual.kicker}</Text>
                      <Text numberOfLines={2} style={styles.planTitle} testID={`plan-catalog-title-${plan.id}`}>{displayPlan.title}</Text>
                      <Text numberOfLines={3} style={styles.planSubtitle}>{displayPlan.subtitle}</Text>
                    </View>
                    <View style={[styles.planCardFooter, { borderTopColor: tone.border }]}>
                      <View style={styles.planMetaRow}>
                        <Text style={styles.planMetaText}>{plan.dayCount} {uiText(language, "word.days")}</Text>
                        <View style={styles.planMetaDot} />
                        <Text numberOfLines={1} style={[styles.planMetaText, enrollment && styles.planMetaTextActive]}>
                          {enrollment ? `${completed}/${plan.dayCount}` : uiText(language, "word.start")}
                        </Text>
                      </View>
                      <View style={styles.planOpenAction}>
                        <Text style={[styles.planOpenText, { color: tone.accent }]}>{uiText(language, "word.openPlan")}</Text>
                        <MaterialCommunityIcons color={tone.accent} name="arrow-right" size={18} />
                      </View>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </>
      )}
      </View>
    </Screen>
  );
}

function StreakBadge({ days }: { days: number }) {
  const { colors } = useAppAppearance();
  const { language } = useI18n();
  const styles = useDevotionalStyles();
  return (
    <View style={styles.streakBadge}>
      <MaterialCommunityIcons color={colors.partial} name="fire" size={16} />
      <Text style={styles.streakBadgeValue}>{days}</Text>
      <Text style={styles.streakBadgeLabel}>{uiText(language, days === 1 ? "word.day" : "word.days")}</Text>
    </View>
  );
}

function ModeChip({ active, label, onPress, testID }: { active: boolean; label: string; onPress: () => void; testID: string }) {
  const styles = useDevotionalStyles();
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [styles.modeChip, active && styles.modeChipActive, pressed && styles.modeChipPressed]}
      testID={testID}
    >
      <Text style={[styles.modeChipText, active && styles.modeChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function PlanSpotlightCard({
  completed,
  enrollment,
  onPress,
  plan,
  progress,
}: {
  completed: number;
  enrollment: DevotionalPlanEnrollment | null | undefined;
  onPress: () => void;
  plan: DevotionalPlanSummary;
  progress: number;
}) {
  const { colors } = useAppAppearance();
  const { language } = useI18n();
  const styles = useDevotionalStyles();
  const visual = getPlanVisual(plan.id, language);
  const nextDay = getSuggestedPlanDay(plan.id, enrollment);
  const nextReading = nextDay ? plan.dayTitles.find((day) => day.day === nextDay) : null;
  const missedDays = getMissedPlanDaysCount(plan.id, enrollment);
  const currentDay = enrollment ? getCurrentPlanDay(enrollment) : null;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.spotlightCard, pressed && styles.planRowPressed]}>
      <LinearGradient
        colors={[colors.surfaceAlt, colors.surface, colors.accentSoft]}
        style={styles.spotlightGradient}
      >
        <View style={styles.spotlightTop}>
          <View style={styles.spotlightCopy}>
            <Text style={styles.sectionEyebrow}>{flowText(language, "plan.continue")}</Text>
            <Text style={styles.spotlightTitle}>{plan.title}</Text>
            <Text style={styles.spotlightBody}>{visual.promise}</Text>
          </View>
          <View style={styles.spotlightArtFrame}>
            <WordArtwork height={112} motif={visual.motif} tone={visual.tone} width={112} />
          </View>
        </View>
        <View style={styles.spotlightFooter}>
          <View style={styles.spotlightProgress}>
            <Text style={styles.spotlightMeta}>{missedDays > 0 ? flowText(language, "plan.resume") : flowText(language, "plan.currentDay")}</Text>
            <Text style={styles.spotlightValue}>{nextDay ?? Math.min(completed + 1, plan.dayCount)}</Text>
          </View>
          <View style={styles.spotlightProgress}>
            <Text style={styles.spotlightMeta}>{flowText(language, "plan.progressShort")}</Text>
            <Text style={styles.spotlightValue}>{Math.round(progress * 100)}%</Text>
          </View>
        </View>
        {nextReading ? (
          <View style={styles.spotlightThread}>
            <Text style={styles.spotlightThreadLabel}>
              {missedDays > 0 ? flowText(language, "plan.pendingShort", { count: missedDays }) : flowText(language, "plan.nextReading")}
            </Text>
            <Text style={styles.spotlightThreadTitle}>
              {flowText(language, "day.day")} {nextReading.day}: {nextReading.title}
            </Text>
            <Text style={styles.spotlightThreadBody}>
              {currentDay && nextReading.day < currentDay
                ? flowText(language, "plan.returnCalmly")
                : plan.subtitle}
            </Text>
          </View>
        ) : null}
      </LinearGradient>
    </Pressable>
  );
}

function ActivePlanRow({
  enrollment,
  onPress,
  plan,
}: {
  enrollment: DevotionalPlanEnrollment;
  onPress: () => void;
  plan: DevotionalPlanSummary;
}) {
  const { colors } = useAppAppearance();
  const { language } = useI18n();
  const styles = useDevotionalStyles();
  const suggestedDay = getSuggestedPlanDay(plan.id, enrollment);
  const missedDays = getMissedPlanDaysCount(plan.id, enrollment);
  const nextDay = suggestedDay ? plan.dayTitles.find((day) => day.day === suggestedDay) : null;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.activeRowCard, pressed && styles.planRowPressed]}>
      <View style={styles.activeRowCopy}>
        <Text style={styles.activeRowKicker}>{missedDays > 0 ? flowText(language, "plan.resume") : flowText(language, "plan.active")}</Text>
        <Text style={styles.activeRowTitle}>{plan.title}</Text>
        <Text numberOfLines={2} style={styles.activeRowBody}>
          {nextDay ? `${flowText(language, "day.day")} ${nextDay.day}: ${nextDay.title}` : plan.description}
        </Text>
      </View>
      <MaterialCommunityIcons color={colors.primary} name="chevron-right" size={20} />
    </Pressable>
  );
}

function useDevotionalStyles() {
  const { colors, isDark } = useAppAppearance();
  return useMemo(() => createStyles(colors, isDark), [colors, isDark]);
}

function createStyles(colors: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
  loading: {
    color: colors.muted,
    fontFamily: fonts.body,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.accentSoft,
    borderColor: colors.partialSoft,
    borderRadius: 999,
    borderWidth: 1,
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  streakBadgeValue: {
    color: colors.partial,
    fontFamily: fonts.display,
    fontSize: 13,
    lineHeight: 16,
  },
  streakBadgeLabel: {
    color: colors.partial,
    fontFamily: fonts.label,
    fontSize: 10,
    textTransform: "lowercase",
  },
  modeSwitch: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    padding: 4,
  },
  contentStack: {
    gap: 24,
  },
  modeChip: {
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 10,
    flex: 1,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  modeChipActive: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  modeChipPressed: {
    opacity: 0.84,
  },
  modeChipText: {
    color: colors.primaryDark,
    fontFamily: fonts.bodyMedium,
    fontSize: 12.5,
    textAlign: "center",
  },
  modeChipTextActive: {
    color: "#FFFFFF",
    fontFamily: fonts.label,
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
  heroHeader: {
    gap: 14,
  },
  heroTextBlock: {
    gap: 10,
  },
  heroEyebrow: {
    color: colors.primary,
    fontFamily: fonts.label,
    fontSize: 11,
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
  heroTagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  themeChip: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  themeChipText: {
    color: colors.primaryDark,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
  },
  readingChip: {
    alignSelf: "flex-start",
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  readingChipText: {
    color: colors.partial,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
  },
  heroArtworkFrame: {
    alignSelf: "center",
    borderRadius: 26,
    overflow: "hidden",
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
  verseText: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 20,
    fontStyle: "italic",
    lineHeight: 30,
  },
  verseReference: {
    color: colors.primaryDark,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
  },
  narrativeStrip: {
    flexDirection: "row",
    gap: 12,
  },
  narrativeBadge: {
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    borderRadius: 18,
    height: 38,
    justifyContent: "center",
    marginTop: 2,
    width: 38,
  },
  narrativeCopy: {
    flex: 1,
    gap: 4,
  },
  narrativeTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 16,
    lineHeight: 20,
  },
  narrativeBody: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 21,
  },
  sectionEyebrow: {
    color: colors.primary,
    fontFamily: fonts.label,
    fontSize: 10.5,
    textTransform: "uppercase",
  },
  reflectCard: {
    gap: 12,
  },
  sectionTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  reflectQuestion: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 19,
    lineHeight: 28,
  },
  practicePanel: {
    backgroundColor: colors.surface,
    borderColor: colors.partialSoft,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    padding: 14,
  },
  practiceKicker: {
    color: colors.partial,
    fontFamily: fonts.label,
    fontSize: 10,
    textTransform: "uppercase",
  },
  practiceText: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 21,
  },
  spotlightCard: {
    borderRadius: 24,
    overflow: "hidden",
  },
  spotlightGradient: {
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  spotlightTop: {
    flexDirection: "row",
    gap: 12,
  },
  spotlightCopy: {
    flex: 1,
    gap: 6,
  },
  spotlightTitle: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 21,
    lineHeight: 25,
  },
  spotlightBody: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 20,
  },
  spotlightArtFrame: {
    alignSelf: "center",
    borderRadius: 20,
    overflow: "hidden",
  },
  spotlightFooter: {
    flexDirection: "row",
    gap: 10,
  },
  spotlightProgress: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    padding: 12,
  },
  spotlightMeta: {
    color: colors.muted,
    fontFamily: fonts.label,
    fontSize: 10,
    textTransform: "uppercase",
  },
  spotlightValue: {
    color: colors.primaryDark,
    fontFamily: fonts.display,
    fontSize: 20,
  },
  spotlightThread: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    gap: 4,
    padding: 12,
  },
  spotlightThreadLabel: {
    color: colors.primary,
    fontFamily: fonts.label,
    fontSize: 10,
    textTransform: "uppercase",
  },
  spotlightThreadTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 15,
    lineHeight: 20,
  },
  spotlightThreadBody: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 19,
  },
  emptyPlanCard: {
    gap: 12,
  },
  emptyPlanTop: {
    flexDirection: "row",
    gap: 12,
  },
  emptyPlanIcon: {
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    borderRadius: 18,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  emptyPlanCopy: {
    flex: 1,
    gap: 4,
  },
  emptyPlanTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 17,
    lineHeight: 21,
  },
  emptyPlanBody: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 20,
  },
  planHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 16,
    justifyContent: "space-between",
  },
  planHeaderCopy: {
    flex: 1,
    minWidth: 0,
  },
  planHeaderTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 18,
    lineHeight: 22,
    marginTop: 3,
  },
  planHeaderBody: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 19,
    marginTop: 6,
  },
  planCounter: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    flexShrink: 0,
    minWidth: 82,
    marginTop: 2,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  planCounterPressed: {
    opacity: 0.82,
  },
  planCounterText: {
    color: colors.primaryDark,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    textAlign: "center",
  },
  planCatalogHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 16,
    justifyContent: "space-between",
  },
  planCatalog: {
    gap: 14,
  },
  activeList: {
    gap: 10,
  },
  activeRowCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    padding: 14,
  },
  activeRowCopy: {
    flex: 1,
    gap: 4,
  },
  activeRowKicker: {
    color: colors.primary,
    fontFamily: fonts.label,
    fontSize: 10,
    textTransform: "uppercase",
  },
  activeRowTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 16,
    lineHeight: 20,
  },
  activeRowBody: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 18,
  },
  planCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    overflow: "hidden",
  },
  planAccent: {
    height: 5,
    width: "100%",
  },
  planCardVisual: {
    alignItems: "center",
    alignSelf: "stretch",
    borderRadius: 18,
    height: 96,
    marginHorizontal: 14,
    marginTop: 14,
    overflow: "hidden",
  },
  planCardBody: {
    padding: 18,
  },
  planCardCopy: {
    gap: 7,
    minWidth: 0,
  },
  planCardFooter: {
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 12,
  },
  planRowPressed: {
    opacity: 0.88,
  },
  planKicker: {
    color: colors.primary,
    fontFamily: fonts.label,
    fontSize: 10,
    textTransform: "uppercase",
  },
  planTitle: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 19,
    lineHeight: 24,
  },
  planSubtitle: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 18,
  },
  planMetaRow: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 7,
    minWidth: 0,
  },
  planMetaText: {
    color: colors.muted,
    fontFamily: fonts.bodyMedium,
    fontSize: 11.5,
  },
  planMetaTextActive: {
    color: colors.success,
  },
  planMetaDot: {
    backgroundColor: colors.border,
    borderRadius: 999,
    height: 4,
    width: 4,
  },
  planOpenAction: {
    alignItems: "center",
    flexShrink: 0,
    flexDirection: "row",
    gap: 4,
  },
  planOpenText: {
    color: colors.primaryDark,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
  },
  });
}
