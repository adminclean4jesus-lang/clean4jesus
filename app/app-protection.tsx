import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { InfoCard } from "@/components/InfoCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import {
  AppProtectionRule,
  disableAppProtectionRule,
  getAppProtectionRules,
  isAppProtectionAccessibilityEnabled,
  getNativeAppProtectionUsage,
  getTemporaryAppUnlocks,
  getPackagesForProtectedApp,
  getRuleForPackage,
  protectedApps,
  setAppProtectionRule,
  syncNativeAppProtectionRules,
} from "@/features/appProtection/appProtectionService";
import { requiresGuardianPin } from "@/features/appProtection/appProtectionPolicy";
import { useI18n } from "@/features/i18n/I18nProvider";
import { formatProtectionText, getProtectionText } from "@/features/i18n/protectionText";
import { getPinLockoutRemainingMs, hasPin, syncPinToNative, verifyPin } from "@/features/pin/pinService";
import { isCompletePin, normalizePinInput, pinLength } from "@/features/pin/pinValidation";
import { fonts, ThemeColors } from "@/theme";

const limitOptions = [10, 15, 20, 30, 45, 60, 90, 120];

export default function AppProtectionScreen() {
  const router = useRouter();
  const styles = useAppProtectionStyles();
  const { colors } = useAppAppearance();
  const { language } = useI18n();
  const copy = getProtectionText(language);
  const [rules, setRules] = useState<AppProtectionRule[]>([]);
  const [usageByPackage, setUsageByPackage] = useState<Record<string, number>>({});
  const [temporaryUnlocks, setTemporaryUnlocks] = useState<Record<string, number>>({});
  const [nativeReady, setNativeReady] = useState(false);
  const [pinReady, setPinReady] = useState(false);
  const [pinValue, setPinValue] = useState("");
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);
  const [pendingLabel, setPendingLabel] = useState("");
  const [pinError, setPinError] = useState("");

  const activeRules = useMemo(() => rules.filter((rule) => rule.enabled), [rules]);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        const saved = await getAppProtectionRules();
        const pinExists = await hasPin();
        setRules(saved);
        setPinReady(pinExists);
        await syncPinToNative();
        const synced = await syncNativeAppProtectionRules(saved);
        const accessibilityEnabled = await isAppProtectionAccessibilityEnabled();
        setNativeReady(synced && accessibilityEnabled);
        await refreshNativeState();
      })();
      const interval = setInterval(() => { void refreshNativeState(); }, 30_000);
      return () => clearInterval(interval);
    }, []),
  );

  async function refreshNativeState() {
    const packageNames = protectedApps.flatMap((app) => getPackagesForProtectedApp(app));
    const [usage, unlocks] = await Promise.all([
      getNativeAppProtectionUsage(packageNames),
      getTemporaryAppUnlocks(packageNames),
    ]);
    setUsageByPackage(Object.fromEntries(usage.map((item) => [item.packageName, item.usedMs])));
    setTemporaryUnlocks(Object.fromEntries(unlocks.map((item) => [item.packageName, Date.now() + item.remainingMs])));
  }

  async function applyRule(rule: AppProtectionRule) {
    try {
      const next = await setAppProtectionRule(rule);
      setRules(next);
      const synced = await syncNativeAppProtectionRules(next);
      const accessibilityEnabled = await isAppProtectionAccessibilityEnabled();
      setNativeReady(synced && accessibilityEnabled);
      await refreshNativeState();
    } catch {
      setNativeReady(false);
      Alert.alert(copy.appAlert, copy.savedNativePending);
    }
  }

  async function removeRule(packageName: string) {
    try {
      const next = await disableAppProtectionRule(packageName);
      setRules(next);
      const synced = await syncNativeAppProtectionRules(next);
      const accessibilityEnabled = await isAppProtectionAccessibilityEnabled();
      setNativeReady(synced && accessibilityEnabled);
      await refreshNativeState();
    } catch {
      setNativeReady(false);
      Alert.alert(copy.appAlert, copy.removedNativePending);
    }
  }

  function requestRuleChange(currentRule: AppProtectionRule | undefined, nextRule: AppProtectionRule | null) {
    if (!pinReady) {
      Alert.alert(copy.pinFirst, copy.pinFirstBody, [
        { text: copy.notNow, style: "cancel" },
        { text: copy.createPin, onPress: () => router.push("/pin-setup") },
      ]);
      return;
    }

    const action = async () => {
      if (nextRule) {
        await applyRule(nextRule);
      } else if (currentRule) {
        await removeRule(currentRule.packageName);
      }
    };

    if (requiresGuardianPin(currentRule, nextRule)) {
      setPinError("");
      setPinValue("");
      setPendingLabel(copy.defaultPinBody);
      setPendingAction(() => action);
      return;
    }

    void action();
  }

  async function confirmGuardianPin() {
    const valid = await verifyPin(pinValue);
    if (!valid) {
      const remainingMs = await getPinLockoutRemainingMs();
      setPinError(remainingMs > 0
        ? formatProtectionText(copy.tooMany, { seconds: Math.ceil(remainingMs / 1000) })
        : copy.wrongPin);
      setPinValue("");
      return;
    }

    const action = pendingAction;
    setPendingAction(null);
    setPendingLabel("");
    setPinValue("");
    setPinError("");
    await action?.();
  }

  return (
    <Screen>
      <AppHeader
        eyebrow={copy.eyebrow}
        icon="cellphone-lock"
        title={copy.title}
        subtitle={copy.subtitle}
      />

      <InfoCard tone="light" style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons color={colors.primaryDark} name="shield-lock-outline" size={24} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroLabel}>{copy.activeRules}</Text>
            <Text style={styles.heroTitle}>{activeRules.length}</Text>
          </View>
        </View>
        <Text style={styles.heroBody}>{copy.intro}</Text>
        <View style={[styles.statusPill, nativeReady ? styles.statusPillReady : styles.statusPillPending]}>
          <Text style={[styles.statusPillText, nativeReady ? styles.statusPillTextReady : styles.statusPillTextPending]}>
            {nativeReady ? copy.nativeReady : copy.nativePending}
          </Text>
        </View>
      </InfoCard>

      <InfoCard tone="outline" style={styles.noticeCard}>
        <Text style={styles.sectionLabel}>{copy.guardian}</Text>
        <Text style={styles.noticeText}>{copy.guardianBody}</Text>
        <Text style={styles.noticeMeta}>{copy.approximate}</Text>
      </InfoCard>

      {!pinReady ? (
        <InfoCard tone="outline" style={styles.pinGateCard}>
          <Text style={styles.sectionLabel}>{copy.before}</Text>
          <Text style={styles.noticeText}>{copy.beforeBody}</Text>
          <PrimaryButton label={copy.createPin} onPress={() => router.push("/pin-setup")} testID="app-protection-create-pin" />
        </InfoCard>
      ) : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{copy.vulnerable}</Text>
        <Text style={styles.sectionMeta}>{protectedApps.length} {copy.available}</Text>
      </View>

      {protectedApps.map((app) => {
        const rule = getRuleForPackage(rules, app.packageName);
        const blocked = rule?.mode === "blocked";
        const limited = rule?.mode === "limited";
        const limit = rule?.dailyLimitMinutes ?? 15;
        const usedMs = getPackagesForProtectedApp(app).reduce((total, packageName) => total + (usageByPackage[packageName] ?? 0), 0);
        const limitMs = limit * 60_000;
        const remainingMinutes = Math.max(0, Math.ceil((limitMs - usedMs) / 60_000));
        const usedMinutes = Math.max(0, Math.floor(usedMs / 60_000));
        const usageProgress = limited ? Math.min(1, usedMs / limitMs) : 0;
        const temporaryUntil = getPackagesForProtectedApp(app).reduce((latest, packageName) => Math.max(latest, temporaryUnlocks[packageName] ?? 0), 0);
        const temporaryMinutes = Math.max(0, Math.ceil((temporaryUntil - Date.now()) / 60_000));

        return (
          <InfoCard key={app.packageName} tone="light" style={[styles.appCard, rule && styles.appCardConfigured]}>
            <View style={styles.appHeader}>
              <View style={styles.appIcon}>
                <MaterialCommunityIcons color={colors.primary} name={app.category === "browser" ? "web" : "account-network-outline"} size={19} />
              </View>
              <View style={styles.appCopy}>
                <Text style={styles.appName}>{app.displayName}</Text>
                <Text style={styles.appRisk}>{getLocalizedRisk(app.category, app.packageName, copy)}</Text>
              </View>
              <View style={[styles.activePill, blocked && styles.blockedPill, limited && styles.limitedPill, !rule && styles.freePill]}>
                <Text style={[styles.activePillText, blocked && styles.blockedPillText, limited && styles.limitedPillText, !rule && styles.freePillText]}>
                  {temporaryMinutes > 0
                    ? `${copy.open} ${temporaryMinutes}m`
                    : blocked
                      ? copy.blocked
                      : limited
                        ? `${copy.todayApprox}: ${remainingMinutes}m`
                        : copy.free}
                </Text>
              </View>
            </View>

            {limited ? (
              <View style={styles.limitPanel}>
                <View style={styles.metricRow}>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricLabel}>{copy.usedToday}</Text>
                    <Text style={styles.metricValue}>{usedMinutes}m</Text>
                    <Text style={styles.metricMeta}>{formatProtectionText(copy.availableOf, { limit })}</Text>
                  </View>
                  <View style={[styles.metricCard, styles.metricCardAccent]}>
                    <Text style={styles.metricLabel}>{copy.remaining}</Text>
                    <Text style={styles.metricValue}>{remainingMinutes}m</Text>
                    <Text style={styles.metricMeta}>{copy.beforeIntervene}</Text>
                  </View>
                </View>

                <View style={styles.progressPanel}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>{copy.todayProgress}</Text>
                    <Text style={styles.progressValue}>{Math.round(usageProgress * 100)}%</Text>
                  </View>
                  <View style={styles.usageTrack}>
                    <View style={[styles.usageFill, { width: `${usageProgress * 100}%` }]} />
                  </View>
                  <View style={styles.progressMetaRow}>
                    <Text style={styles.progressMetaText}>{copy.approximateReading}</Text>
                    <Text style={styles.progressMetaStrong}>{formatProtectionText(copy.remainingShort, { minutes: remainingMinutes })}</Text>
                  </View>
                </View>

                <View style={styles.limitPickerHeader}>
                  <Text style={styles.limitPickerTitle}>{copy.adjustLimit}</Text>
                  <Text style={styles.limitPickerCaption}>{copy.noPinMinutes}</Text>
                </View>
                <View style={styles.limitRow}>
                  {limitOptions.map((option) => (
                    <Pressable
                      key={option}
                      onPress={() => requestRuleChange(rule, { dailyLimitMinutes: option, enabled: true, mode: "limited", packageName: app.packageName })}
                      style={({ pressed }) => [styles.limitChip, option === limit && styles.limitChipActive, pressed && styles.pressed]}
                    >
                      <Text style={[styles.limitChipText, option === limit && styles.limitChipTextActive]}>{option}m</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : blocked ? (
              <View style={[styles.statePanel, styles.statePanelBlocked]}>
                <Text style={styles.stateLabel}>{copy.totalIntervention}</Text>
                <Text style={styles.stateTitle}>{copy.blockTitle}</Text>
                <Text style={styles.stateBody}>{copy.blockBody}</Text>
              </View>
            ) : (
              <View style={styles.statePanel}>
                <Text style={styles.stateLabel}>{copy.unrestricted}</Text>
                <Text style={styles.stateTitle}>{copy.freeTitle}</Text>
                <Text style={styles.stateBody}>{copy.freeBody}</Text>
              </View>
            )}

            {blocked ? (
              <View style={styles.blockedActions}>
                <Pressable
                  onPress={() => requestRuleChange(rule, { dailyLimitMinutes: 30, enabled: true, mode: "limited", packageName: app.packageName })}
                  style={({ pressed }) => [styles.primaryInlineAction, pressed && styles.pressed]}
                >
                  <MaterialCommunityIcons color="#FFFFFF" name="shield-key-outline" size={16} />
                  <Text style={styles.primaryInlineActionText}>{copy.toLimit}</Text>
                </Pressable>
                <Pressable
                  onPress={() => requestRuleChange(rule, null)}
                  style={({ pressed }) => [styles.secondaryInlineAction, pressed && styles.pressed]}
                >
                  <Text style={styles.secondaryInlineActionText}>{copy.removeBlock}</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.modeRow}>
                <RuleButton
                  active={blocked}
                  icon="block-helper"
                  label={copy.block}
                  onPress={() => requestRuleChange(rule, { enabled: true, mode: "blocked", packageName: app.packageName })}
                />
                <RuleButton
                  active={limited}
                  icon="timer-sand"
                  label={copy.limit}
                  onPress={() => requestRuleChange(rule, { dailyLimitMinutes: limit, enabled: true, mode: "limited", packageName: app.packageName })}
                />
                <RuleButton
                  active={!rule}
                  icon="shield-off-outline"
                  label={copy.free}
                  onPress={() => requestRuleChange(rule, null)}
                />
              </View>
            )}
          </InfoCard>
        );
      })}

      <PrimaryButton
        label={copy.sync}
        onPress={() => {
          void (async () => {
            const ok = await syncNativeAppProtectionRules(rules);
            const accessibilityEnabled = await isAppProtectionAccessibilityEnabled();
            const ready = ok && accessibilityEnabled;
            setNativeReady(ready);
            Alert.alert(copy.appAlert, ready ? copy.rulesSent : copy.rulesLocal);
          })();
        }}
      />
      <PrimaryButton label={copy.back} onPress={() => router.back()} variant="ghost" />

      <Modal transparent animationType="fade" visible={Boolean(pendingAction)} onRequestClose={() => setPendingAction(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.pinSheet}>
            <View style={styles.pinIcon}>
              <MaterialCommunityIcons color={colors.primaryDark} name="shield-key-outline" size={22} />
            </View>
            <Text style={styles.pinTitle}>{copy.guardianPin}</Text>
            <Text style={styles.pinCopy}>
              {pendingLabel || copy.defaultPinBody}
            </Text>
            <TextInput
              autoFocus
              caretHidden
              inputMode="numeric"
              keyboardType="number-pad"
              maxLength={pinLength}
              onSubmitEditing={() => {
                if (isCompletePin(pinValue)) {
                  void confirmGuardianPin();
                }
              }}
              onChangeText={(value) => {
                setPinError("");
                setPinValue(normalizePinInput(value));
              }}
              placeholder="0000"
              placeholderTextColor={colors.mutedDark}
              returnKeyType="done"
              secureTextEntry
              selectionColor={colors.primary}
              style={styles.pinInput}
              value={pinValue}
            />
            {pinError ? <Text style={styles.pinError}>{pinError}</Text> : null}
            <View style={styles.pinActions}>
              <Pressable disabled={!isCompletePin(pinValue)} onPress={() => void confirmGuardianPin()} style={({ pressed }) => [styles.pinConfirm, !isCompletePin(pinValue) && styles.disabled, pressed && styles.pressed]}>
                <Text style={styles.pinConfirmText}>{copy.confirmPin}</Text>
              </Pressable>
              <Pressable onPress={() => setPendingAction(null)} style={({ pressed }) => [styles.pinCancel, pressed && styles.pressed]}>
                <Text style={styles.pinCancelText}>{copy.cancel}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function RuleButton({ active, icon, label, onPress }: { active: boolean; icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string; onPress: () => void }) {
  const styles = useAppProtectionStyles();
  const { colors } = useAppAppearance();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.ruleButton, active && styles.ruleButtonActive, pressed && styles.pressed]}>
      <MaterialCommunityIcons color={active ? colors.primaryDark : colors.muted} name={icon} size={15} />
      <Text style={[styles.ruleButtonText, active && styles.ruleButtonTextActive]}>{label}</Text>
    </Pressable>
  );
}

function getLocalizedRisk(category: string, packageName: string, copy: ReturnType<typeof getProtectionText>) {
  if (category === "browser") return copy.riskBrowser;
  if (packageName.toLowerCase().includes("telegram")) return copy.riskMessaging;
  return copy.riskSocial;
}

function useAppProtectionStyles() {
  const { colors } = useAppAppearance();
  return useMemo(() => createStyles(colors), [colors]);
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  heroCard: {
        gap: 10,
      },
      appCardConfigured: {
        borderLeftColor: colors.accent,
        borderLeftWidth: 3,
      },
  heroTop: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  heroIcon: {
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    borderRadius: 18,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  heroCopy: {
    flex: 1,
  },
  heroLabel: {
    color: colors.primary,
    fontFamily: fonts.label,
    fontSize: 10,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 33,
  },
  heroBody: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
  statusPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusPillReady: {
    backgroundColor: colors.successSoft,
  },
  statusPillPending: {
    backgroundColor: colors.partialSoft,
  },
  statusPillText: {
    fontFamily: fonts.heading,
    fontSize: 10.5,
  },
  statusPillTextReady: {
    color: colors.success,
  },
  statusPillTextPending: {
    color: colors.partial,
  },
  noticeCard: {
    gap: 8,
  },
  pinGateCard: {
    gap: 12,
  },
  sectionLabel: {
    color: colors.primary,
    fontFamily: fonts.label,
    fontSize: 10,
    textTransform: "uppercase",
  },
  noticeText: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
  noticeMeta: {
    color: colors.muted,
    fontFamily: fonts.bodyMedium,
    fontSize: 10.5,
    lineHeight: 15,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 17,
  },
  sectionMeta: {
    color: colors.muted,
    fontFamily: fonts.label,
    fontSize: 10,
    textTransform: "uppercase",
  },
  appCard: {
    gap: 12,
  },
  appHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  appIcon: {
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    borderRadius: 14,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  appCopy: {
    flex: 1,
    minWidth: 0,
  },
  appName: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 13,
  },
  appRisk: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 10.5,
    lineHeight: 15,
    marginTop: 2,
  },
  activePill: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  activePillText: {
    color: colors.primaryDark,
    fontFamily: fonts.heading,
    fontSize: 10,
  },
  blockedPill: {
    backgroundColor: "rgba(198, 40, 40, 0.1)",
  },
  blockedPillText: {
    color: colors.danger,
  },
  limitedPill: {
    backgroundColor: "rgba(26, 35, 126, 0.1)",
  },
  limitedPillText: {
    color: colors.primaryDark,
  },
  freePill: {
    backgroundColor: colors.surfaceAlt,
  },
  freePillText: {
    color: colors.muted,
  },
  modeRow: {
    flexDirection: "row",
    gap: 8,
  },
  ruleButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: 6,
  },
  ruleButtonActive: {
    backgroundColor: colors.surfaceAlt,
    borderColor: "rgba(26,35,126,0.22)",
  },
  ruleButtonText: {
    color: colors.muted,
    fontFamily: fonts.heading,
    fontSize: 10.5,
  },
  ruleButtonTextActive: {
    color: colors.primaryDark,
  },
  limitRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  limitPanel: {
    gap: 12,
  },
  blockedActions: {
    gap: 8,
  },
  statePanel: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  statePanelBlocked: {
    backgroundColor: "rgba(198, 40, 40, 0.05)",
    borderColor: "rgba(198, 40, 40, 0.16)",
  },
  stateLabel: {
    color: colors.primary,
    fontFamily: fonts.label,
    fontSize: 10,
    textTransform: "uppercase",
  },
  stateTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 13.5,
  },
  stateBody: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 10.5,
    lineHeight: 15,
  },
  metricRow: {
    flexDirection: "row",
    gap: 10,
  },
  metricCard: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    gap: 3,
    minHeight: 88,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  metricCardAccent: {
    backgroundColor: colors.surfaceAlt,
  },
  metricLabel: {
    color: colors.muted,
    fontFamily: fonts.label,
    fontSize: 10,
    textTransform: "uppercase",
  },
  metricValue: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 22,
    lineHeight: 28,
  },
  metricMeta: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 10.5,
    lineHeight: 15,
  },
  progressPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  progressHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabel: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 11.5,
  },
  progressValue: {
    color: colors.primaryDark,
    fontFamily: fonts.heading,
    fontSize: 11.5,
  },
  primaryInlineAction: {
    alignItems: "center",
    backgroundColor: colors.primaryDark,
    borderRadius: 16,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 14,
  },
  primaryInlineActionText: {
    color: "#FFFFFF",
    fontFamily: fonts.heading,
    fontSize: 12.5,
  },
  secondaryInlineAction: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 14,
  },
  secondaryInlineActionText: {
    color: colors.primaryDark,
    fontFamily: fonts.heading,
    fontSize: 12,
  },
  usageTrack: {
    backgroundColor: colors.empty,
    borderRadius: 999,
    height: 8,
    overflow: "hidden",
  },
  usageFill: {
    backgroundColor: colors.primaryDark,
    borderRadius: 999,
    height: "100%",
  },
  progressMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  progressMetaText: {
    color: colors.muted,
    fontFamily: fonts.body,
    flex: 1,
    fontSize: 10,
    lineHeight: 14,
  },
  progressMetaStrong: {
    color: colors.primaryDark,
    fontFamily: fonts.heading,
    fontSize: 10.5,
  },
  limitPickerHeader: {
    gap: 2,
  },
  limitPickerTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 11.5,
  },
  limitPickerCaption: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 10,
  },
  limitChip: {
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    minWidth: 48,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  limitChipActive: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  limitChipText: {
    color: colors.primaryDark,
    fontFamily: fonts.heading,
    fontSize: 11,
  },
  limitChipTextActive: {
    color: "#FFFFFF",
  },
  pressed: {
    opacity: 0.82,
  },
  modalOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(15,22,78,0.34)",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  pinSheet: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 28,
    borderWidth: 1,
    gap: 12,
    padding: 22,
    width: "100%",
  },
  pinIcon: {
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    borderRadius: 18,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  pinTitle: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 19,
    textAlign: "center",
  },
  pinCopy: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  pinInput: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 18,
    height: 50,
    letterSpacing: 8,
    textAlign: "center",
    width: "100%",
  },
  pinError: {
    color: colors.danger,
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    textAlign: "center",
  },
  pinActions: {
    gap: 10,
    width: "100%",
  },
  pinCancel: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 48,
    justifyContent: "center",
  },
  pinCancelText: {
    color: colors.primaryDark,
    fontFamily: fonts.heading,
    fontSize: 13,
  },
  pinConfirm: {
    alignItems: "center",
    backgroundColor: colors.primaryDark,
    borderRadius: 16,
    minHeight: 48,
    justifyContent: "center",
  },
  pinConfirmText: {
    color: colors.surface,
    fontFamily: fonts.heading,
    fontSize: 13,
  },
  disabled: {
    opacity: 0.42,
  },
  });
}
