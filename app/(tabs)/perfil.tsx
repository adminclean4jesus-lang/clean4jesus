import { MaterialCommunityIcons } from "@/components/MaterialCommunityIcon";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";

import { AccountSettingsCard } from "@/features/auth/AccountSettingsCard";
import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { useAuth } from "@/features/auth/AuthProvider";
import { getProfileAvatarUri, removeProfileAvatar, saveProfileAvatar } from "@/features/profile/profileAvatarService";
import { AppHeader } from "@/components/AppHeader";
import { InfoCard } from "@/components/InfoCard";
import { Screen } from "@/components/Screen";
import { fonts, ThemeColors } from "@/theme";
import { useI18n } from "@/features/i18n/I18nProvider";
import { uiText } from "@/features/i18n/uiText";

export default function PerfilScreen() {
  const router = useRouter();
  const { colors } = useAppAppearance();
  const { user } = useAuth();
  const { language } = useI18n();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const userId = user?.id ?? null;
  const name = String(user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Tu espacio");

  useEffect(() => {
    void getProfileAvatarUri(userId).then(setAvatarUri);
  }, [userId]);

  async function chooseAvatar() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(uiText(language, "profile.permissionTitle"), uiText(language, "profile.permissionBody"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ["images"],
      quality: 0.78,
    });
    if (result.canceled) return;

    const uri = result.assets[0]?.uri;
    if (uri) {
      try {
        setAvatarUri(await saveProfileAvatar(uri, userId));
      } catch {
        Alert.alert(uiText(language, "profile.savePhotoError"), uiText(language, "profile.photoErrorBody"));
      }
    }
  }

  async function clearAvatar() {
    await removeProfileAvatar(userId);
    setAvatarUri(null);
  }

  return (
    <Screen>
      <AppHeader
        eyebrow={uiText(language, "tabs.profile")}
        icon="account-circle-outline"
        subtitle={uiText(language, "profile.subtitle")}
        title={uiText(language, "profile.title")}
        titleTrailing={(
          <Pressable accessibilityLabel={uiText(language, "profile.settings")} accessibilityRole="button" onPress={() => router.push("/settings")} style={[styles.gearButton, { backgroundColor: colors.surface, borderColor: colors.border }]} testID="profile-open-settings">
            <MaterialCommunityIcons color={colors.primaryDark} name="cog-outline" size={22} />
          </Pressable>
        )}
      />

      <InfoCard style={styles.hero} tone="light">
        <View style={styles.heroRow}>
          <Pressable accessibilityLabel={uiText(language, "profile.changePhoto")} accessibilityRole="button" onPress={() => void chooseAvatar()} style={styles.avatarPressable}>
            {avatarUri ? <Image source={{ uri: avatarUri }} style={styles.avatarImage} /> : <Text style={styles.avatarInitial}>{name.slice(0, 1).toUpperCase()}</Text>}
            <View style={[styles.avatarEdit, { backgroundColor: colors.primaryDark }]}>
              <MaterialCommunityIcons color="#FFFFFF" name="camera-outline" size={13} />
            </View>
          </Pressable>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>{uiText(language, "profile.identity")}</Text>
            <Text numberOfLines={1} style={styles.name}>{name}</Text>
            <Text style={styles.description}>{uiText(language, "profile.photoLocal")}</Text>
            {avatarUri ? <Pressable accessibilityRole="button" onPress={() => void clearAvatar()}><Text style={styles.removeAvatar}>{uiText(language, "profile.removePhoto")}</Text></Pressable> : null}
          </View>
        </View>
      </InfoCard>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>{uiText(language, "profile.account")}</Text>
        <Text style={styles.sectionHint}>{uiText(language, "profile.accountHint")}</Text>
      </View>
      <AccountSettingsCard />

      <Pressable accessibilityRole="button" onPress={() => router.push("/settings")} style={[styles.settingsLink, { backgroundColor: colors.surface, borderColor: colors.border }]} testID="profile-settings-link">
        <View style={[styles.settingsIcon, { backgroundColor: colors.surfaceAlt }]}>
          <MaterialCommunityIcons color={colors.primaryDark} name="cog-outline" size={20} />
        </View>
        <View style={styles.settingsCopy}>
          <Text style={styles.settingsTitle}>{uiText(language, "profile.settings")}</Text>
          <Text style={styles.settingsSubtitle}>{uiText(language, "profile.settingsHint")}</Text>
        </View>
        <MaterialCommunityIcons color={colors.muted} name="chevron-right" size={22} />
      </Pressable>
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    gearButton: { alignItems: "center", borderRadius: 14, borderWidth: 1, height: 42, justifyContent: "center", width: 42 },
    hero: { gap: 0, padding: 18 },
    heroRow: { alignItems: "center", flexDirection: "row", gap: 15 },
    avatarPressable: { height: 78, position: "relative", width: 78 },
    avatarImage: { backgroundColor: colors.surfaceAlt, borderRadius: 39, height: 78, width: 78 },
    avatarInitial: { backgroundColor: colors.primaryDark, borderRadius: 39, color: "#FFFFFF", fontFamily: fonts.display, fontSize: 29, height: 78, lineHeight: 78, overflow: "hidden", textAlign: "center", width: 78 },
    avatarEdit: { alignItems: "center", borderColor: colors.surface, borderRadius: 14, borderWidth: 3, bottom: -2, height: 28, justifyContent: "center", position: "absolute", right: -2, width: 28 },
    heroCopy: { flex: 1, gap: 5 },
    eyebrow: { color: colors.primary, fontFamily: fonts.label, fontSize: 10, letterSpacing: 0.8 },
    name: { color: colors.text, fontFamily: fonts.display, fontSize: 22 },
    description: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, lineHeight: 17 },
    removeAvatar: { color: colors.primaryDark, fontFamily: fonts.bodyMedium, fontSize: 11 },
    sectionHeader: { gap: 3, paddingHorizontal: 2 },
    sectionLabel: { color: colors.primary, fontFamily: fonts.label, fontSize: 10, letterSpacing: 0.8, textTransform: "uppercase" },
    sectionHint: { color: colors.muted, fontFamily: fonts.body, fontSize: 12 },
    settingsLink: { alignItems: "center", borderRadius: 18, borderWidth: 1, flexDirection: "row", gap: 12, minHeight: 76, paddingHorizontal: 14, paddingVertical: 12 },
    settingsIcon: { alignItems: "center", borderRadius: 14, height: 44, justifyContent: "center", width: 44 },
    settingsCopy: { flex: 1, gap: 4 },
    settingsTitle: { color: colors.text, fontFamily: fonts.heading, fontSize: 14 },
    settingsSubtitle: { color: colors.muted, fontFamily: fonts.body, fontSize: 11.5, lineHeight: 16 },
  });
}
