import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, View } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { InfoCard } from "@/components/InfoCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import {
  acceptTrustedPersonInvite,
  acceptProtectionHealthMonitoring,
  AccountabilityStatus,
  requestProtectionHealthMonitoring,
  configureTrustedAlerts,
  createTrustedPersonInvite,
  getAccountabilityStatus,
  registerGuardianPushToken,
  registerOwnerDevice,
  revokeTrustedConnection,
} from "@/features/accountability/accountabilityService";
import { getAccompaniedModeText } from "@/features/i18n/accompaniedModeText";
import { hasPin } from "@/features/pin/pinService";
import { useAuth } from "@/features/auth/AuthProvider";
import { useI18n } from "@/features/i18n/I18nProvider";
import { formatTrustedPersonText, getTrustedPersonText } from "@/features/i18n/trustedPersonText";
import { languageLocale } from "@/features/i18n/flowText";
import { fonts, ThemeColors } from "@/theme";

export default function TrustedPersonScreen() {
  const router = useRouter();
  const styles = useTrustedPersonStyles();
  const { colors } = useAppAppearance();
  const { language } = useI18n();
  const copy = getTrustedPersonText(language);
  const accompaniedCopy = getAccompaniedModeText(language);
  const { status: authStatus } = useAuth();
  const [status, setStatus] = useState<AccountabilityStatus | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [connectionReady, setConnectionReady] = useState<boolean | null>(null);

  const refresh = useCallback(async () => {
    if (authStatus !== "authenticated") return;
    setLoading(true);
    setLoadError(false);
    try {
      const next = await getAccountabilityStatus();
      setStatus(next);
      if (next.status === "accepted" && next.connectionId) {
        const ready = next.role === "owner"
          ? await registerOwnerDevice()
          : await registerGuardianPushToken(next.connectionId);
        setConnectionReady(ready);
      } else {
        setConnectionReady(null);
      }
    } catch {
      setLoadError(true);
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, [authStatus]);

  useEffect(() => { void refresh(); }, [refresh]);

  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    try {
      await action();
      await refresh();
      Alert.alert(copy.ready, success);
    } catch {
      Alert.alert(copy.actionError, copy.tryAgain);
    } finally { setBusy(false); }
  }

  if (authStatus !== "authenticated") {
    return (
      <Screen>
        <AppHeader eyebrow={copy.eyebrow} icon="account-heart-outline" onBack={() => router.back()} title={copy.title} subtitle={copy.signedOutSubtitle} />
        <InfoCard tone="light" style={styles.card}>
          <Text style={styles.title}>{copy.signInTitle}</Text>
          <Text style={styles.body}>{copy.signInBody}</Text>
          <PrimaryButton label={copy.goCommunity} onPress={() => router.replace("/(tabs)/community")} />
        </InfoCard>
      </Screen>
    );
  }

  return (
    <Screen>
      <AppHeader eyebrow={copy.eyebrow} icon="account-heart-outline" onBack={() => router.back()} title={copy.title} subtitle={copy.subtitle} />

      <InfoCard tone="light" style={styles.card}>
        <Text style={styles.label}>{copy.how}</Text>
        <Text style={styles.title}>{copy.privacyTitle}</Text>
        <Text style={styles.body}>{copy.privacyBody}</Text>
      </InfoCard>

      {loading ? (
        <InfoCard tone="outline" style={styles.centerCard}>
          <ActivityIndicator color={colors.primaryDark} />
          <Text style={styles.body}>{copy.checking}</Text>
        </InfoCard>
      ) : loadError ? (
        <InfoCard tone="outline" style={styles.card}>
          <Text style={styles.title}>{copy.loadTitle}</Text>
          <Text style={styles.body}>{copy.loadBody}</Text>
          <PrimaryButton label={copy.retry} onPress={() => void refresh()} />
        </InfoCard>
      ) : status?.status === "accepted" ? (
        <InfoCard tone="outline" style={styles.card}>
          <Text style={styles.label}>{copy.active}</Text>
          <Text style={styles.title}>
            {status.role === "guardian"
              ? status.guardianName ? formatTrustedPersonText(copy.accompanyingNamed, { name: status.guardianName }) : copy.accompanying
              : status.guardianName ?? copy.trustedPerson}
          </Text>
          <Text style={styles.body}>
            {status.alertsEnabled
              ? formatTrustedPersonText(copy.alertsActive, { count: status.riskThreshold })
              : copy.alertsPaused} {copy.privacySuffix}
          </Text>
          {connectionReady === false ? (
            <View style={styles.warning}>
              <Text style={styles.warningTitle}>{copy.connectPhone}</Text>
              <Text style={styles.body}>
                {status.role === "guardian"
                  ? copy.guardianConnect
                  : copy.ownerConnect}
              </Text>
              <PrimaryButton label={copy.retry} onPress={() => void refresh()} variant="ghost" />
            </View>
          ) : connectionReady ? (
            <Text style={styles.ready}>
              {status.role === "guardian"
                ? copy.guardianReady
                : copy.ownerReady}
            </Text>
          ) : null}
          {status.role === "guardian" ? (
            <View style={styles.alertRules}>
              <Text style={styles.label}>{copy.alertRule}</Text>
              {[3, 5].map((threshold) => (
                <PrimaryButton
                  key={threshold}
                  disabled={busy}
                  label={formatTrustedPersonText(copy.threshold, { count: threshold })}
                  onPress={() => void run(
                    () => configureTrustedAlerts(true, threshold),
                    formatTrustedPersonText(copy.thresholdSaved, { count: threshold }),
                  )}
                  variant={status.alertsEnabled && status.riskThreshold === threshold ? "primary" : "ghost"}
                />
              ))}
              <PrimaryButton
                disabled={busy || !status.alertsEnabled}
                label={copy.pauseAlerts}
                onPress={() => void run(
                  () => configureTrustedAlerts(false, status.riskThreshold),
                  copy.pausedSaved,
                )}
                variant="ghost"
              />
            </View>
          ) : null}
          <View style={styles.modeCard}>
            <Text style={styles.label}>{status.protectionHealthStatus === "active" ? accompaniedCopy.active : status.protectionHealthStatus === "pending" ? (status.role === "guardian" ? accompaniedCopy.pendingOwner : accompaniedCopy.pendingGuardian) : accompaniedCopy.disabled}</Text>
            <Text style={styles.body}>{status.protectionHealthStatus === "active" ? accompaniedCopy.activeBody : status.protectionHealthStatus === "pending" ? (status.role === "guardian" ? accompaniedCopy.pendingOwnerBody : accompaniedCopy.pendingGuardianBody) : accompaniedCopy.disabledBody}</Text>
            {status.role === "owner" && status.protectionHealthStatus === "disabled" ? <PrimaryButton disabled={busy} label={accompaniedCopy.enable} onPress={() => void run(() => requestProtectionHealthMonitoring(), accompaniedCopy.pendingGuardian)} /> : null}
            {status.role === "guardian" && status.protectionHealthStatus === "pending" ? <PrimaryButton disabled={busy} label={accompaniedCopy.accept} onPress={() => void run(acceptProtectionHealthMonitoring, accompaniedCopy.active)} /> : null}
            {status.role === "owner" && status.protectionHealthStatus === "active" ? <PrimaryButton disabled={busy} label={accompaniedCopy.disable} onPress={() => void hasPin().then((ready) => ready ? router.push("/pin-verify?action=disable-accompanied-mode") : Alert.alert(copy.phoneFailed, "Crea el PIN del guardián antes de cambiar este modo."))} variant="ghost" /> : null}
          </View>
          {status.role === "owner" ? <PrimaryButton disabled={busy} label={copy.preparePhone} onPress={() => void registerOwnerDevice().then((ok) => {
            setConnectionReady(ok);
            Alert.alert(ok ? copy.phoneReady : copy.phoneFailed, ok ? copy.phoneReadyBody : copy.phoneFailedBody);
          })} /> : null}
          <PrimaryButton disabled={busy} label={copy.revoke} onPress={() => Alert.alert(copy.revoke, copy.revokeBody, [{ text: copy.cancel, style: "cancel" }, { text: copy.revokeAction, style: "destructive", onPress: () => void run(revokeTrustedConnection, copy.revoked) }])} variant="danger" />
        </InfoCard>
      ) : status?.status === "pending" && status.role === "owner" ? (
        <InfoCard tone="outline" style={styles.card}>
          <Text style={styles.label}>{copy.pending}</Text>
          <Text style={styles.title}>{copy.pendingTitle}</Text>
          <Text style={styles.body}>{status.inviteCode ? copy.shareCode : copy.hiddenCode}</Text>
          {status.inviteCode ? <Text accessibilityLabel={formatTrustedPersonText(copy.inviteCodeA11y, { code: status.inviteCode })} selectable style={styles.code}>{status.inviteCode}</Text> : null}
          {status.inviteExpiresAt ? <Text style={styles.expiry}>{formatTrustedPersonText(copy.expires, { date: new Date(status.inviteExpiresAt).toLocaleString(languageLocale(language)) })}</Text> : null}
          {status.inviteCode ? <PrimaryButton label={copy.copyCode} onPress={() => { void Clipboard.setStringAsync(status.inviteCode!); Alert.alert(copy.copied, copy.copiedBody); }} /> : null}
          <PrimaryButton disabled={busy} label={copy.newCode} onPress={() => void run(createTrustedPersonInvite, copy.newCodeBody)} />
          <PrimaryButton disabled={busy} label={copy.cancelInvite} onPress={() => Alert.alert(copy.cancelInvite, copy.cancelInviteBody, [{ text: copy.back, style: "cancel" }, { text: copy.cancelInvite, style: "destructive", onPress: () => void run(revokeTrustedConnection, copy.inviteCancelled) }])} variant="ghost" />
        </InfoCard>
      ) : (
        <>
          <InfoCard tone="outline" style={styles.card}>
            <Text style={styles.label}>{copy.receive}</Text>
            <Text style={styles.title}>{copy.createPrivate}</Text>
            <Text style={styles.body}>{copy.createPrivateBody}</Text>
            {status?.inviteCode ? <Text selectable style={styles.code}>{status.inviteCode}</Text> : null}
            <PrimaryButton disabled={busy} label={status?.inviteCode ? copy.copyCode : copy.createCode} onPress={() => {
              if (status?.inviteCode) {
                void Clipboard.setStringAsync(status.inviteCode);
                Alert.alert(copy.copied, copy.copiedBody);
              } else {
                void run(createTrustedPersonInvite, copy.created);
              }
            }} />
          </InfoCard>

          <InfoCard tone="outline" style={styles.card}>
            <Text style={styles.label}>{copy.accompany}</Text>
            <Text style={styles.title}>{copy.consentTitle}</Text>
            <Text style={styles.body}>{copy.consentBody}</Text>
            <TextInput accessibilityLabel={copy.inviteCodeA11y.replace(" {code}", "")} autoCapitalize="characters" maxLength={20} onChangeText={setCode} placeholder={copy.code} placeholderTextColor={colors.muted} style={styles.input} value={code} />
            <PrimaryButton disabled={busy || code.trim().length !== 20} label={copy.accept} onPress={() => void run(() => acceptTrustedPersonInvite(code), copy.accepted)} />
          </InfoCard>
        </>
      )}
    </Screen>
  );
}

function useTrustedPersonStyles() {
  const { colors } = useAppAppearance();
  return useMemo(() => createStyles(colors), [colors]);
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  card: { gap: 12 },
  label: { color: colors.primary, fontFamily: fonts.label, fontSize: 10 },
  title: { color: colors.text, fontFamily: fonts.display, fontSize: 20 },
  body: { color: colors.muted, fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20 },
  code: { color: colors.primaryDark, fontFamily: fonts.display, fontSize: 28, letterSpacing: 4, textAlign: "center" },
  expiry: { color: colors.muted, fontFamily: "Inter_400Regular", fontSize: 11.5, lineHeight: 16, textAlign: "center" },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, color: colors.text, fontFamily: fonts.heading, fontSize: 18, minHeight: 52, paddingHorizontal: 16, textAlign: "center" },
  alertRules: { gap: 10 },
  modeCard: { backgroundColor: colors.accentSoft, borderColor: colors.border, borderRadius: 14, borderWidth: 1, gap: 9, padding: 12 },
  centerCard: { alignItems: "center", gap: 12 },
  ready: { color: colors.success, fontFamily: fonts.heading, fontSize: 12 },
  warning: { backgroundColor: colors.accentSoft, borderRadius: 14, gap: 8, padding: 12 },
  warningTitle: { color: colors.text, fontFamily: fonts.heading, fontSize: 14 },
  });
}
