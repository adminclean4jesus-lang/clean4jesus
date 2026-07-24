import * as Linking from "expo-linking";
import { PropsWithChildren, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { APP_VERSION_LABEL } from "@/config/appInfo";
import { PrimaryButton } from "@/components/PrimaryButton";
import { type RuntimeGateRecord } from "@/features/runtime/versionGateLogic";
import { Screen } from "@/components/Screen";
import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { fetchRuntimeGate } from "@/features/runtime/versionGateService";
import { fonts, ThemeColors } from "@/theme";
import { useI18n } from "@/features/i18n/I18nProvider";
import { getSecondaryText } from "@/features/i18n/secondaryText";

type GateState =
  | { status: "checking" }
  | { status: "pass" }
  | { message: string; status: "error" }
  | { gate: RuntimeGateRecord; status: "hard_block" };

export function VersionGateProvider({ children }: PropsWithChildren) {
  const { colors } = useAppAppearance();
  const { language } = useI18n();
  const copy = getSecondaryText(language);
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [state, setState] = useState<GateState>({ status: "checking" });
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    if (process.env.EXPO_PUBLIC_E2E === "true") {
      setState({ status: "pass" });
      return () => {
        mounted.current = false;
      };
    }
    void loadGate();
    return () => {
      mounted.current = false;
    };
  }, []);

  async function loadGate() {
    try {
      const platform = Platform.OS === "ios" ? "ios" : "android";
      const decision = await fetchRuntimeGate(platform);
      if (!mounted.current) return;

      if (decision.status === "hard_block") {
        setState({ gate: decision.gate, status: "hard_block" });
        return;
      }

      setState({ status: "pass" });
    } catch {
      if (!mounted.current) return;
      setState({ message: copy.runtimeFailed, status: "error" });
    }
  }

  if (state.status === "checking") {
    return (
      <Screen scroll={false}>
        <View style={styles.centered}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{copy.runtimeBadge}</Text>
          </View>
          <ActivityIndicator color={colors.primaryDark} size="small" />
          <Text style={styles.title}>{copy.runtimeChecking}</Text>
          <Text style={styles.body}>{copy.runtimeCheckingBody}</Text>
        </View>
      </Screen>
    );
  }

  if (state.status === "error") {
    return (
      <Screen scroll={false}>
        <View style={styles.centered}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{copy.runtimePending}</Text>
          </View>
          <Text style={styles.title}>{copy.runtimeFailed}</Text>
          <Text style={styles.body}>{state.message}</Text>
          <PrimaryButton label={copy.retry} onPress={() => void loadGate()} />
          {children}
        </View>
      </Screen>
    );
  }

  if (state.status === "hard_block") {
    return <UpdateRequiredScreen gate={state.gate} onRetry={() => void loadGate()} />;
  }

  return children;
}

function UpdateRequiredScreen({ gate, onRetry }: { gate: RuntimeGateRecord; onRetry: () => void }) {
  const { colors } = useAppAppearance();
  const { language } = useI18n();
  const copy = getSecondaryText(language);
  const styles = useMemo(() => createStyles(colors), [colors]);
  async function handleUpdate() {
    if (gate.update_url) {
      await Linking.openURL(gate.update_url);
    }
  }

  return (
    <Screen scroll={false}>
      <View style={styles.centered}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{copy.runtimeRequired}</Text>
        </View>
        <Text style={styles.title}>{language === "es" ? gate.title : copy.runtimeRequired}</Text>
        <Text style={styles.body}>{language === "es" ? gate.message : copy.updateHelp}</Text>

        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>{copy.yourVersion}</Text>
            <Text style={styles.infoValue}>{APP_VERSION_LABEL}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>{copy.minimum}</Text>
            <Text style={styles.infoValue}>v{gate.minimum_supported_version}</Text>
          </View>
        </View>

        <PrimaryButton
          label={gate.update_url ? copy.update : copy.understood}
          onPress={() => void handleUpdate()}
        />
        <PrimaryButton label={copy.retry} onPress={onRetry} variant="ghost" />

        {!gate.update_url ? (
          <Text style={styles.helper}>{copy.updateHelp}</Text>
        ) : null}
      </View>
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 8,
    gap: 14,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeText: {
    color: colors.primaryDark,
    fontFamily: fonts.heading,
    fontSize: 12,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 34,
  },
  body: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 24,
  },
  infoGrid: {
    flexDirection: "row",
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 6,
  },
  infoLabel: {
    color: colors.muted,
    fontFamily: fonts.label,
    fontSize: 11,
    textTransform: "uppercase",
  },
  infoValue: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 20,
  },
  helper: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  });
}
