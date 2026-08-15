import { MaterialCommunityIcons } from "@/components/MaterialCommunityIcon";
import { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Card } from "react-native-paper";

import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { hasPin, savePin, verifyPin } from "@/features/pin/pinService";
import { markIosPinSessionVerified } from "@/features/pin/pinSession";
import {
  isCompletePin,
  normalizePinInput,
  pinLength,
  pinsMatch,
} from "@/features/pin/pinValidation";
import { fonts, ThemeColors } from "@/theme";
import { useI18n } from "@/features/i18n/I18nProvider";
import { getPinText } from "@/features/i18n/pinText";

export default function PinSetupScreen() {
  const router = useRouter();
  const { colors } = useAppAppearance();
  const { language } = useI18n();
  const copy = getPinText(language);
  const styles = usePinSetupStyles();
  const { after } = useLocalSearchParams<{ after?: string }>();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [saving, setSaving] = useState(false);
  const [pinExists, setPinExists] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const canSave =
    pinsMatch(pin, confirmPin) &&
    (!pinExists || isCompletePin(currentPin)) &&
    !saving;

  useEffect(() => {
    void hasPin().then(setPinExists);
  }, []);

  async function handleSave() {
    if (!isCompletePin(pin) || !isCompletePin(confirmPin)) {
      Alert.alert(copy.incompleteTitle, copy.incompleteBody);
      return;
    }

    if (pin !== confirmPin) {
      Alert.alert(copy.mismatchTitle, copy.mismatchBody);
      return;
    }

    setSaving(true);
    try {
      if (pinExists && !(await verifyPin(currentPin))) {
        Alert.alert(copy.currentInvalidTitle, copy.currentInvalidBody);
        setCurrentPin("");
        return;
      }
      await savePin(pin);

      if (after === "shield-setup") {
        markIosPinSessionVerified();
        router.replace("/?setup=1");
        return;
      }

      router.replace(after === "ios-limit-configured" ? "/ios-protection" : "/");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.kicker}>{copy.security}</Text>
        <Text style={styles.title}>
          {pinExists ? copy.changeTitle : copy.createTitle}
        </Text>
        <Text style={styles.subtitle}>{copy.setupBody}</Text>
      </View>

      <Card mode="elevated" style={styles.card}>
        <Card.Content style={styles.form}>
          <View style={styles.cardAccent} />
          <View style={styles.helperRow}>
            <View style={styles.helperIcon}>
              <MaterialCommunityIcons
                color={colors.primaryDark}
                name="shield-key-outline"
                size={16}
              />
            </View>
            <View style={styles.helperCopy}>
              <Text style={styles.label}>{copy.newPin}</Text>
              <Text style={styles.helperText}>{copy.guardianHint}</Text>
            </View>
          </View>
          {pinExists ? (
            <>
              <Text style={styles.label}>{copy.currentPin}</Text>
              <TextInput
                accessibilityLabel={copy.currentPin}
                caretHidden
                inputMode="numeric"
                keyboardType="number-pad"
                maxLength={pinLength}
                onChangeText={(value) =>
                  setCurrentPin(normalizePinInput(value))
                }
                placeholder="1234"
                placeholderTextColor={colors.mutedDark}
                secureTextEntry
                style={styles.input}
                value={currentPin}
              />
              <PinDots value={currentPin} />
            </>
          ) : null}
          <TextInput
            accessibilityLabel={copy.newPin}
            autoFocus={!pinExists}
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
            testID="pin-setup-new"
            textContentType="oneTimeCode"
            value={pin}
          />
          <PinDots value={pin} />

          <Text style={styles.label}>{copy.confirmPin}</Text>
          <TextInput
            accessibilityLabel={copy.confirmNewPin}
            caretHidden
            inputMode="numeric"
            keyboardType="number-pad"
            maxLength={pinLength}
            onChangeText={(value) => setConfirmPin(normalizePinInput(value))}
            placeholder="1234"
            placeholderTextColor={colors.mutedDark}
            secureTextEntry
            selectionColor={colors.primary}
            style={styles.input}
            testID="pin-setup-confirm"
            textContentType="oneTimeCode"
            value={confirmPin}
          />
          <PinDots value={confirmPin} />
        </Card.Content>
      </Card>

      <PrimaryButton
        disabled={!canSave}
        label={saving ? copy.saving : copy.save}
        onPress={handleSave}
        testID="pin-setup-save"
      />
    </Screen>
  );
}

function PinDots({ value }: { value: string }) {
  const styles = usePinSetupStyles();
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

function usePinSetupStyles() {
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
      backgroundColor: colors.primary,
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
      backgroundColor: colors.surfaceAlt,
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
      paddingBottom: 6,
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
