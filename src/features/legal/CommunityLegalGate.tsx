import { MaterialCommunityIcons } from "@/components/MaterialCommunityIcon";
import * as Linking from "expo-linking";
import type { PropsWithChildren } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { useI18n } from "@/features/i18n/I18nProvider";
import { getLegalAccessText } from "@/features/legal/legalAccessText";
import {
  hasCurrentLegalAcceptance,
  LEGAL_URLS,
  recordLegalAcceptance,
} from "@/features/legal/legalPolicy";
import { fonts, ThemeColors } from "@/theme";

type GateStatus = "accepted" | "checking" | "error" | "required" | "saving";

export function CommunityLegalGate({ children }: PropsWithChildren) {
  const { colors } = useAppAppearance();
  const { language } = useI18n();
  const copy = getLegalAccessText(language);
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [checked, setChecked] = useState(false);
  const [status, setStatus] = useState<GateStatus>("checking");

  const verify = useCallback(async () => {
    setStatus("checking");
    try {
      setStatus(await hasCurrentLegalAcceptance() ? "accepted" : "required");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void verify();
  }, [verify]);

  async function accept() {
    if (!checked || status === "saving") return;
    setStatus("saving");
    try {
      await recordLegalAcceptance(language, "reconsent");
      setStatus("accepted");
    } catch {
      setStatus("error");
    }
  }

  if (status === "accepted") return children;

  return (
    <View style={styles.card} testID="community-legal-gate">
      <View style={styles.icon}>
        <MaterialCommunityIcons color={colors.primaryDark} name="shield-check-outline" size={28} />
      </View>
      <Text style={styles.title}>{copy.reconsentTitle}</Text>
      <Text style={styles.body}>
        {status === "error" ? copy.checkError : copy.reconsentBody}
      </Text>
      <View style={styles.links}>
        <LegalLink label={copy.privacy} url={LEGAL_URLS.privacy} />
        <LegalLink label={copy.terms} url={LEGAL_URLS.terms} />
        <LegalLink label={copy.guidelines} url={LEGAL_URLS.guidelines} />
      </View>
      {status !== "error" ? (
        <>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked }}
            onPress={() => setChecked((value) => !value)}
            style={styles.consent}
          >
            <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
              {checked ? <MaterialCommunityIcons color="#FFFFFF" name="check" size={16} /> : null}
            </View>
            <Text style={styles.consentText}>{copy.accept}</Text>
          </Pressable>
          <PrimaryButton
            disabled={!checked || status === "saving"}
            label={copy.acceptAction}
            onPress={() => void accept()}
          />
        </>
      ) : (
        <PrimaryButton label={copy.retry} onPress={() => void verify()} variant="ghost" />
      )}
    </View>
  );
}

function LegalLink({ label, url }: { label: string; url: string }) {
  const { colors } = useAppAppearance();
  return (
    <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(url)}>
      <Text style={{ color: colors.primaryDark, fontFamily: fonts.heading, fontSize: 12, textDecorationLine: "underline" }}>
        {label}
      </Text>
    </Pressable>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    body: { color: colors.muted, fontFamily: fonts.body, fontSize: 13.5, lineHeight: 21 },
    card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 22, borderWidth: 1, gap: 16, padding: 20 },
    checkbox: { alignItems: "center", borderColor: colors.border, borderRadius: 6, borderWidth: 1, height: 22, justifyContent: "center", width: 22 },
    checkboxChecked: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
    consent: { alignItems: "flex-start", flexDirection: "row", gap: 10 },
    consentText: { color: colors.text, flex: 1, fontFamily: fonts.body, fontSize: 11.5, lineHeight: 18 },
    icon: { alignItems: "center", backgroundColor: colors.surfaceAlt, borderRadius: 16, height: 52, justifyContent: "center", width: 52 },
    links: { gap: 10 },
    title: { color: colors.text, fontFamily: fonts.display, fontSize: 22, lineHeight: 28 },
  });
}
