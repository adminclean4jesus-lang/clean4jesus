import { MaterialCommunityIcons } from "@/components/MaterialCommunityIcon";
import { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Card } from "react-native-paper";

import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { getPinLockoutRemainingMs, verifyPin } from "@/features/pin/pinService";
import { markIosPinSessionVerified } from "@/features/pin/pinSession";
import {
  isCompletePin,
  normalizePinInput,
  pinLength,
} from "@/features/pin/pinValidation";
import { disableShield } from "@/features/shield/shieldService";
import { fonts, ThemeColors } from "@/theme";
import { useI18n } from "@/features/i18n/I18nProvider";
import { getPinText } from "@/features/i18n/pinText";

export default function PinVerifyScreen() {
  const router = useRouter();
  const { colors } = useAppAppearance();
  const { language } = useI18n();
  const copy = getPinText(language);
  const styles = usePinVerifyStyles();
  const { action, minutes } = useLocalSearchParams<{
    action?: string;
    minutes?: string;
  }>();
  const [pin, setPin] = useState("");

  async function handleVerify() {
    const valid = await verifyPin(pin);

    if (!valid) {
      const remainingMs = await getPinLockoutRemainingMs();
      Alert.alert(
        remainingMs > 0 ? copy.lockedTitle : copy.wrongTitle,
        remainingMs > 0 ? copy.wait(Math.ceil(remainingMs / 1000)) : copy.retry,
      );
      setPin("");
      return;
    }

    if (action === "disable-shield") {
      await disableShield();
    }

    if (action === "activate-ios-refuge") {
      const parsedMinutes = Number(minutes);
      if (
        !Number.isInteger(parsedMinutes) ||
        parsedMinutes < 1 ||
        parsedMinutes > 1_440
      ) {
        Alert.alert("Clean4Jesus", "El límite diario no es válido.");
        return;
      }
      return;
    }

    if (action === "disable-ios-refuge") {
      return;
    }

    if (action === "edit-ios-limits") {
      router.replace("/ios-protection?editLimits=1");
      return;
    }

    if (action === "edit-ios-selection") {
      router.replace("/ios-protection?editSelection=1");
      return;
    }

    if (action === "enter-ios-refuge") {
      markIosPinSessionVerified();
      router.replace("/");
      return;
    }

    router.replace("/(tabs)");
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.kicker}>Clean4Jesus</Text>
        <Text style={styles.title}>{copy.verifyTitle}</Text>
        <Text style={styles.subtitle}>{copy.verifyBody}</Text>
      </View>

      <Card mode="elevated" style={styles.card}>
        <Card.Content style={styles.form}>
          <View style={styles.cardAccent} />
          <View style={styles.helperRow}>
            <View style={styles.helperIcon}>
              <MaterialCommunityIcons
                color={colors.primaryDark}
                name="lock-check-outline"
                size={16}
              />
            </View>
            <View style={styles.helperCopy}>
              <Text style={styles.label}>{copy.accessPin}</Text>
              <Text style={styles.helperText}>{copy.verifyHint}</Text>
            </View>
          </View>
          <TextInput
            autoFocus
            caretHidden
            inputMode="numeric"
            keyboardType="number-pad"
            maxLength={pinLength}
            onChangeText={(value) => setPin(normalizePinInput(value))}
            placeholder="1234"
            placeholderTextColor={colors.mutedDark}
            secureTextEntry
            selectionColor={colors.primary}
            style={styles.input}
            textContentType="oneTimeCode"
            value={pin}
          />
          <PinDots value={pin} />
        </Card.Content>
      </Card>

      <PrimaryButton
        disabled={!isCompletePin(pin)}
        label={copy.verify}
        onPress={handleVerify}
      />
    </Screen>
  );
}

function PinDots({ value }: { value: string }) {
  const styles = usePinVerifyStyles();
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: pinLength }).map((_, index) => (
        <View
          key={index}
          style={[styles.dot, index < value.length ? styles.dotFilled : null]}
        />
      ))}
    </View>
  );
}

function usePinVerifyStyles() {
  const { colors } = useAppAppearance();
  return useMemo(() => createStyles(colors), [colors]);
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    header: {
      gap: 8,
    },
    kicker: {
      color: colors.accent,
      fontFamily: fonts.label,
      fontSize: 11,
      textTransform: "uppercase",
    },
    title: {
      color: colors.text,
      fontFamily: fonts.display,
      fontSize: 22,
      lineHeight: 27,
    },
    subtitle: {
      color: colors.muted,
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      lineHeight: 18,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      borderColor: colors.border,
      borderWidth: 1,
      elevation: 2,
    },
    form: {
      gap: 10,
    },
    cardAccent: {
      backgroundColor: colors.accent,
      borderRadius: 999,
      height: 4,
      width: 44,
    },
    helperRow: {
      alignItems: "center",
      flexDirection: "row",
      gap: 10,
    },
    helperIcon: {
      alignItems: "center",
      backgroundColor: colors.accentSoft,
      borderColor: colors.border,
      borderRadius: 14,
      borderWidth: 1,
      height: 34,
      justifyContent: "center",
      width: 34,
    },
    helperCopy: {
      flex: 1,
      gap: 2,
    },
    label: {
      color: colors.muted,
      fontFamily: fonts.label,
      fontSize: 10,
      textTransform: "uppercase",
    },
    helperText: {
      color: colors.muted,
      fontFamily: "Inter_400Regular",
      fontSize: 11.5,
      lineHeight: 16,
    },
    input: {
      backgroundColor: colors.surfaceAlt,
      borderColor: colors.border,
      borderRadius: 16,
      borderWidth: 1,
      color: colors.text,
      fontFamily: fonts.display,
      fontSize: 18,
      height: 50,
      includeFontPadding: false,
      letterSpacing: 8,
      textAlign: "center",
    },
    dotsRow: {
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
      justifyContent: "center",
      paddingTop: 12,
    },
    dot: {
      backgroundColor: "#CFD7D6",
      borderRadius: 5,
      height: 8,
      width: 8,
    },
    dotFilled: {
      backgroundColor: colors.primary,
    },
  });
}
