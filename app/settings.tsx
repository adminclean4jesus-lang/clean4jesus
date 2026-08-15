import { MaterialCommunityIcons } from "@/components/MaterialCommunityIcon";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, Switch, Text, View } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { AppLoadingExperience } from "@/components/AppLoadingExperience";
import { Screen } from "@/components/Screen";
import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { useI18n } from "@/features/i18n/I18nProvider";
import { supportedLanguages } from "@/features/i18n/i18n";
import { hasPin } from "@/features/pin/pinService";
import {
  copyPrivateDnsHost,
  openAndroidPrivateDnsSettings,
  privateDnsHost,
} from "@/features/shield/androidProtectionService";
import {
  isAccessibilityInterventionActive,
  isLocalDnsVpnActive,
} from "@/features/shield/localDnsVpnService";
import { getShieldState } from "@/features/shield/shieldService";
import { useShieldGate } from "@/features/shield/useShieldGate";
import { fonts, ThemeColors } from "@/theme";
import { getLegalAccessText } from "@/features/legal/legalAccessText";
import { getIosProtectionText } from "@/features/i18n/iosProtectionText";

type SettingsRowProps = {
  accessory?: React.ReactNode;
  expanded?: boolean;
  onPress?: () => void;
  subtitle: string;
  testID?: string;
  title: string;
};

export default function SettingsScreen() {
  const isIos = Platform.OS === "ios";
  const router = useRouter();
  const { checked } = useShieldGate();
  const { colors, isDark, preference, setPreference } = useAppAppearance();
  const { language, setLanguage, t } = useI18n();
  const iosProtectionCopy = getIosProtectionText(language);
  const styles = useMemo(() => createStyles(colors), [colors]);
  const legalCopy = getLegalAccessText(language);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [summary, setSummary] = useState({
    accessibility: false,
    pin: false,
    shield: false,
    vpn: false,
  });

  const refresh = useCallback(async () => {
    if (isIos) {
      setSummary({ accessibility: false, pin: await hasPin(), shield: false, vpn: false });
      return;
    }
    const [pin, shield, vpn, accessibility] = await Promise.all([
      hasPin(),
      getShieldState(),
      isLocalDnsVpnActive(),
      isAccessibilityInterventionActive(),
    ]);
    setSummary({
      accessibility,
      pin,
      shield: Boolean(shield.enabled),
      vpn,
    });
  }, [isIos]);

  useEffect(() => {
    void refresh();
  }, [refresh]);
  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  if (!checked) {
    return <AppLoadingExperience layout="contextual" message={t(language, "settings.status.preparing")} />;
  }

  const refugeReady = isIos
    ? summary.pin
    : summary.pin && summary.shield && summary.vpn && summary.accessibility;

  return (
    <Screen key={preference}>
      <AppHeader
        eyebrow={t(language, "settings.header.eyebrow")}
        onBack={() => router.back()}
        subtitle={t(language, "settings.header.subtitle")}
        title={t(language, "settings.header.title")}
      />

      <View style={styles.status}>
        <Text style={styles.statusLabel}>
          {refugeReady ? t(language, "settings.status.ready") : t(language, "settings.status.preparing")}
        </Text>
        <Text style={styles.statusBody}>
          {refugeReady
            ? t(language, "settings.status.readyBody")
            : t(language, "settings.status.preparingBody")}
        </Text>
      </View>

      <SettingsSection
        hint={t(language, "settings.section.protectionHint")}
        title={t(language, "settings.section.protection")}
      >
        <SettingsRow
          onPress={() => router.push(isIos ? "/ios-protection" : "/app-protection")}
          testID="settings-protection-apps"
          subtitle={isIos ? iosProtectionCopy.selectionHelp : t(language, "settings.row.appProtectionHint")}
          title={isIos ? iosProtectionCopy.title : t(language, "settings.row.appProtection")}
        />
        <SettingsRow
          onPress={() => router.push("/trusted-person")}
          testID="settings-trusted-person"
          subtitle={t(language, "settings.row.trustedPersonHint")}
          title={t(language, "settings.row.trustedPerson")}
        />
        {!isIos ? (
          <SettingsRow
            onPress={() => router.push("/interruption-settings")}
            testID="settings-interruption"
            subtitle={t(language, "settings.row.interruptionHint")}
            title={t(language, "settings.row.interruption")}
          />
        ) : null}
      </SettingsSection>

      <SettingsSection
        hint={t(language, "settings.section.preferencesHint")}
        title={t(language, "settings.section.preferences")}
      >
        <SettingsRow
          expanded={languageOpen}
          onPress={() => setLanguageOpen((open) => !open)}
          testID="settings-language"
          subtitle={
            language === "es"
              ? t(language, "settings.language.es")
              : language === "en"
                ? t(language, "settings.language.en")
                 : language === "fr" ? t(language, "settings.language.fr") : t(language, "settings.language.pt")
           }
           title={t(language, "settings.language.title")}
        />
        {languageOpen ? (
          <View style={styles.optionList}>
            {supportedLanguages.map((item) => {
              const selected = item === language;
              const label =
                item === "es" ? t(language, "settings.language.es") : item === "en" ? t(language, "settings.language.en") : item === "fr" ? t(language, "settings.language.fr") : t(language, "settings.language.pt");
              return (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  android_ripple={{ color: colors.surfaceAlt }}
                  key={item}
                  onPress={() => {
                    void setLanguage(item);
                    setLanguageOpen(false);
                  }}
                  style={[
                    styles.option,
                    selected && styles.optionSelected,
                  ]}
                >
                  <Text style={styles.optionText}>{label}</Text>
                  {selected ? (
                    <MaterialCommunityIcons
                      color={colors.primaryDark}
                      name="check"
                      size={18}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ) : null}
        <SettingsRow
          accessory={
            <Switch
              accessibilityLabel={t(language, "settings.row.darkMode")}
              accessibilityRole="switch"
              accessibilityState={{ checked: isDark }}
              ios_backgroundColor={colors.border}
              onValueChange={(enabled) => {
                void setPreference(enabled ? "dark" : "light");
              }}
              testID="settings-appearance-switch"
              thumbColor={isDark ? colors.onPrimary : "#FFFFFF"}
              trackColor={{ false: colors.border, true: colors.primary }}
              value={isDark}
            />
          }
          testID="settings-appearance"
          subtitle={isDark ? t(language, "settings.row.enabled") : t(language, "settings.row.disabled")}
          title={t(language, "settings.row.darkMode")}
        />
      </SettingsSection>

      <SettingsSection
        hint={t(language, "settings.section.securityHint")}
        title={t(language, "settings.section.security")}
      >
        <SettingsRow
          onPress={() => router.push("/pin-setup")}
          testID="settings-pin"
          subtitle={
            summary.pin
              ? t(language, "settings.row.updatePinHint")
              : t(language, "settings.row.createPinHint")
          }
          title={summary.pin ? t(language, "settings.row.changePin") : t(language, "settings.row.createPin")}
        />
      </SettingsSection>

      <SettingsSection
        hint={legalCopy.intro}
        title={legalCopy.title}
      >
        <SettingsRow
          onPress={() => router.push("/legal")}
          testID="settings-legal"
          subtitle={legalCopy.privacyHint}
          title={legalCopy.title}
        />
      </SettingsSection>

      {!isIos ? <SettingsSection
        hint={t(language, "settings.section.advancedHint")}
        title={t(language, "settings.section.advanced")}
      >
        <SettingsRow
          expanded={advancedOpen}
          onPress={() => setAdvancedOpen((open) => !open)}
          testID="settings-advanced"
          subtitle={t(language, "settings.row.advancedHint")}
          title={t(language, "settings.row.advanced")}
        />
        {advancedOpen ? (
          <View style={styles.advanced}>
            <Text style={styles.advancedBody}>
              {t(language, "settings.advanced.body")}
            </Text>
            <SettingsRow
              onPress={async () => {
                await copyPrivateDnsHost();
                Alert.alert(
                  t(language, "settings.advanced.hostCopiedTitle"),
                  t(language, "settings.advanced.hostCopiedBody"),
                );
              }}
              subtitle={privateDnsHost}
              title={t(language, "settings.advanced.copyHost")}
            />
            <SettingsRow
              onPress={() => void openAndroidPrivateDnsSettings()}
              subtitle={t(language, "settings.advanced.optionalConnectivity")}
              title={t(language, "settings.advanced.openPrivateDns")}
            />
          </View>
        ) : null}
      </SettingsSection> : null}
    </Screen>
  );
}

function SettingsSection({
  children,
  hint,
  title,
}: {
  children: React.ReactNode;
  hint: string;
  title: string;
}) {
  const { colors } = useAppAppearance();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>{title}</Text>
        <Text style={styles.sectionHint}>{hint}</Text>
      </View>
      <View style={styles.rows}>{children}</View>
    </View>
  );
}

function SettingsRow({
  accessory,
  expanded,
  onPress,
  subtitle,
  testID,
  title,
}: SettingsRowProps) {
  const { colors } = useAppAppearance();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityState={
        typeof expanded === "boolean" ? { expanded } : undefined
      }
      android_ripple={{ color: colors.surfaceAlt }}
      onPress={onPress}
      style={styles.row}
      testID={testID}
    >
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text numberOfLines={2} style={styles.rowSubtitle}>
          {subtitle}
        </Text>
      </View>
      {accessory ? <View style={styles.rowAccessory}>{accessory}</View> : null}
    </Pressable>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    status: {
      backgroundColor: colors.surfaceAlt,
      borderColor: colors.border,
      borderRadius: 16,
      borderWidth: 1,
      gap: 4,
      padding: 16,
    },
    statusLabel: {
      color: colors.text,
      fontFamily: fonts.heading,
      fontSize: 15,
    },
    statusBody: {
      color: colors.muted,
      fontFamily: fonts.body,
      fontSize: 12,
      lineHeight: 18,
    },
    section: {
      gap: 10,
    },
    sectionHeader: {
      gap: 3,
      paddingHorizontal: 2,
    },
    sectionLabel: {
      color: colors.primary,
      fontFamily: fonts.label,
      fontSize: 10,
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    sectionHint: {
      color: colors.muted,
      fontFamily: fonts.body,
      fontSize: 11.5,
      lineHeight: 17,
    },
    rows: {
      gap: 8,
    },
    row: {
      alignItems: "center",
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 14,
      borderWidth: 1,
      justifyContent: "center",
      minHeight: 70,
      paddingHorizontal: 16,
      paddingVertical: 13,
      flexDirection: "row",
      width: "100%",
    },
    rowCopy: {
      flex: 1,
      gap: 4,
    },
    rowAccessory: {
      marginLeft: 12,
    },
    rowTitle: {
      color: colors.text,
      fontFamily: fonts.heading,
      fontSize: 13.5,
      lineHeight: 18,
    },
    rowSubtitle: {
      color: colors.muted,
      fontFamily: fonts.body,
      fontSize: 11.5,
      lineHeight: 16,
    },
    optionList: {
      backgroundColor: colors.background,
      borderBottomColor: colors.border,
      borderBottomWidth: StyleSheet.hairlineWidth,
      gap: 6,
      padding: 10,
    },
    option: {
      alignItems: "center",
      borderColor: "transparent",
      borderRadius: 12,
      borderWidth: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      minHeight: 44,
      paddingHorizontal: 14,
    },
    optionSelected: {
      backgroundColor: colors.surfaceAlt,
      borderColor: colors.border,
    },
    optionText: {
      color: colors.text,
      fontFamily: fonts.bodyMedium,
      fontSize: 12.5,
    },
    advanced: {
      gap: 8,
    },
    advancedBody: {
      color: colors.muted,
      fontFamily: fonts.body,
      fontSize: 11.5,
      lineHeight: 18,
      paddingHorizontal: 2,
      paddingVertical: 4,
    },
  });
}
