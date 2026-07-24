import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { InfoCard } from "@/components/InfoCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { deleteMyAccount, signOut } from "@/features/auth/authService";
import { useAuth } from "@/features/auth/AuthProvider";
import { getMyProfile, updateMyProfile } from "@/features/community/communityService";
import { formatAccountText, getAccountText } from "@/features/i18n/accountText";
import { getAuthErrorMessage } from "@/features/i18n/authAuxText";
import { useI18n } from "@/features/i18n/I18nProvider";
import { fonts, ThemeColors } from "@/theme";

type ProfileForm = {
  bio: string;
  city: string;
  displayName: string;
};

type ProfileLoadState = "error" | "loading" | "ready";

const emptyForm: ProfileForm = { bio: "", city: "", displayName: "" };

export function AccountSettingsCard() {
  const router = useRouter();
  const { language } = useI18n();
  const copy = getAccountText(language);
  const { colors } = useAppAppearance();
  const styles = useAccountSettingsStyles();
  const { status, user } = useAuth();
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [editorVisible, setEditorVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [profileLoadState, setProfileLoadState] = useState<ProfileLoadState>("loading");
  const [saving, setSaving] = useState(false);
  const activeProfileUserId = useRef<string | null>(null);
  const deleteInFlight = useRef(false);
  const profileRequestId = useRef(0);

  async function loadProfile(userId: string) {
    const requestId = ++profileRequestId.current;
    setProfileLoadState("loading");

    try {
      const profile = await getMyProfile(userId);
      if (activeProfileUserId.current !== userId || profileRequestId.current !== requestId) return;
      setForm({
        bio: profile.bio ?? "",
        city: profile.city ?? "",
        displayName: profile.display_name,
      });
      setProfileLoadState("ready");
    } catch {
      if (activeProfileUserId.current !== userId || profileRequestId.current !== requestId) return;
      setProfileLoadState("error");
    }
  }

  useEffect(() => {
    const userId = user?.id ?? null;
    profileRequestId.current += 1;
    activeProfileUserId.current = userId;
    setForm(emptyForm);
    setEditorVisible(false);
    setDeleteVisible(false);
    setDeleteConfirmation("");
    setDeletePassword("");
    setSaving(false);
    setDeleting(false);
    setProfileLoadState("loading");

    if (!userId) return undefined;

    void loadProfile(userId);

    return () => {
      profileRequestId.current += 1;
    };
  }, [user?.id]);

  async function saveProfile() {
    if (!user) return;
    const userId = user.id;
    if (form.displayName.trim().length < 2) {
      Alert.alert(copy.reviewNameTitle, copy.reviewNameBody);
      return;
    }

    setSaving(true);
    try {
      await updateMyProfile(userId, {
        bio: form.bio,
        city: form.city,
        display_name: form.displayName,
      });
      if (activeProfileUserId.current !== userId) return;
      setEditorVisible(false);
      Alert.alert(copy.profileUpdatedTitle, copy.profileUpdatedBody);
    } catch (error) {
      if (activeProfileUserId.current !== userId) return;
      Alert.alert(copy.saveErrorTitle, copy.tryAgain);
    } finally {
      setSaving(false);
    }
  }

  function confirmSignOut() {
    Alert.alert(copy.signOutTitle, copy.signOutBody, [
      { style: "cancel", text: copy.cancel },
      {
        style: "destructive",
        text: copy.signOutAction,
        onPress: () => void signOut().catch(() => Alert.alert(copy.signOutErrorTitle, copy.tryAgain)),
      },
    ]);
  }

  async function deleteAccount() {
    if (deleteInFlight.current) return;
    if (!user || deleteConfirmation !== copy.deleteToken || !deletePassword) {
      Alert.alert(copy.missingConfirmationTitle, formatAccountText(copy.missingConfirmationBody, { token: copy.deleteToken }));
      return;
    }
    const userId = user.id;
    deleteInFlight.current = true;
    setDeleting(true);
    try {
      await deleteMyAccount(userId, deletePassword);
      if (activeProfileUserId.current !== userId) return;
      setDeleteVisible(false);
      setDeleteConfirmation("");
      setDeletePassword("");
      Alert.alert(copy.deletedTitle, copy.deletedBody);
    } catch (error) {
      if (activeProfileUserId.current !== userId) return;
      Alert.alert(copy.deleteErrorTitle, getAuthErrorMessage(error, language, copy.tryAgain));
    } finally {
      deleteInFlight.current = false;
      if (activeProfileUserId.current === userId) {
        setDeleting(false);
      }
    }
  }

  if (status === "unconfigured") {
    return (
      <InfoCard style={styles.card} tone="outline">
        <AccountHeading icon="database-lock-outline" label={copy.accountCommunity} />
        <Text style={styles.title}>{copy.connectionPending}</Text>
        <Text style={styles.body}>{copy.connectionPendingBody}</Text>
      </InfoCard>
    );
  }

  if (status !== "authenticated" || !user) {
    return (
      <InfoCard style={styles.card} tone="outline">
        <AccountHeading icon="account-heart-outline" label={copy.accountCommunity} />
        <Text style={styles.title}>{copy.portableSpace}</Text>
        <Text style={styles.body}>{copy.portableSpaceBody}</Text>
        <PrimaryButton label={copy.enterCommunity} onPress={() => router.push("/(tabs)/community")} />
      </InfoCard>
    );
  }

  return (
    <>
      <InfoCard style={styles.card} tone="outline">
        <AccountHeading icon="account-check-outline" label={copy.accountCommunity} />
        <View style={styles.identityRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(form.displayName || user.email || "C").slice(0, 1).toUpperCase()}</Text>
          </View>
          <View style={styles.identityCopy}>
            <Text style={styles.title}>
              {profileLoadState === "loading" ? copy.loadingProfile : profileLoadState === "error" ? copy.unavailableProfile : form.displayName || copy.myProfile}
            </Text>
            <Text numberOfLines={1} style={styles.email}>{user.email}</Text>
          </View>
        </View>
        {profileLoadState === "error" ? (
          <View style={styles.loadError}>
            <View style={styles.loadErrorCopy}>
              <Text style={styles.loadErrorTitle}>{copy.loadErrorTitle}</Text>
              <Text style={styles.loadErrorBody}>{copy.loadErrorBody}</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={() => void loadProfile(user.id)} style={styles.retryButton} testID="retry-profile-load">
              <MaterialCommunityIcons color={colors.primaryDark} name="refresh" size={17} />
              <Text style={styles.retryLabel}>{copy.retry}</Text>
            </Pressable>
          </View>
        ) : null}
        <Text style={styles.body}>{copy.privacyBody}</Text>
        <View style={styles.buttonRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: profileLoadState !== "ready" }}
            disabled={profileLoadState !== "ready"}
            onPress={() => profileLoadState === "ready" && setEditorVisible(true)}
            style={[styles.secondaryButton, profileLoadState !== "ready" && styles.disabledButton]}
          >
            <MaterialCommunityIcons color={profileLoadState === "ready" ? colors.primaryDark : colors.muted} name="account-edit-outline" size={18} />
            <Text style={[styles.secondaryLabel, profileLoadState !== "ready" && styles.disabledLabel]}>{copy.editProfile}</Text>
          </Pressable>
          <Pressable onPress={confirmSignOut} style={styles.secondaryButton}>
            <MaterialCommunityIcons color={colors.danger} name="logout" size={18} />
            <Text style={[styles.secondaryLabel, styles.dangerLabel]}>{copy.signOutShort}</Text>
          </Pressable>
        </View>
        <Pressable accessibilityRole="button" onPress={() => setDeleteVisible(true)} style={styles.deleteButton}>
          <MaterialCommunityIcons color={colors.danger} name="account-remove-outline" size={17} />
          <Text style={styles.dangerLabel}>{copy.deleteMyAccount}</Text>
        </Pressable>
      </InfoCard>

      <Modal animationType="none" onRequestClose={() => setEditorVisible(false)} transparent visible={editorVisible}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalCopy}>
                <Text style={styles.modalEyebrow}>{copy.publicIdentity}</Text>
                <Text style={styles.modalTitle}>{copy.editProfile}</Text>
              </View>
              <Pressable accessibilityLabel={copy.closeEditor} onPress={() => setEditorVisible(false)} style={styles.closeButton}>
                <MaterialCommunityIcons color={colors.text} name="close" size={22} />
              </Pressable>
            </View>
            <ProfileField label={copy.displayName} maxLength={40} onChangeText={(value) => setForm((current) => ({ ...current, displayName: value }))} value={form.displayName} />
            <ProfileField label={copy.optionalCity} maxLength={80} onChangeText={(value) => setForm((current) => ({ ...current, city: value }))} value={form.city} />
            <ProfileField label={copy.optionalBio} maxLength={280} multiline onChangeText={(value) => setForm((current) => ({ ...current, bio: value }))} value={form.bio} />
            <Text style={styles.counter}>{form.bio.length}/280</Text>
            <PrimaryButton disabled={saving} label={saving ? copy.saving : copy.saveProfile} onPress={() => void saveProfile()} />
          </View>
        </View>
      </Modal>

      <Modal animationType="none" onRequestClose={() => !deleteInFlight.current && setDeleteVisible(false)} transparent visible={deleteVisible}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalCopy}>
                <Text style={styles.modalEyebrow}>{copy.irreversibleAction}</Text>
                <Text style={styles.modalTitle}>{copy.deleteAccount}</Text>
              </View>
              <Pressable accessibilityLabel={copy.closeDeletion} disabled={deleting} onPress={() => setDeleteVisible(false)} style={[styles.closeButton, deleting && styles.disabledButton]}>
                <MaterialCommunityIcons color={colors.text} name="close" size={22} />
              </Pressable>
            </View>
            <Text style={styles.body}>{copy.deleteBody}</Text>
            <ProfileField autoCapitalize="characters" editable={!deleting} label={copy.typeDeleteToken} onChangeText={setDeleteConfirmation} value={deleteConfirmation} />
            <ProfileField autoCapitalize="none" editable={!deleting} label={copy.currentPassword} onChangeText={setDeletePassword} secureTextEntry value={deletePassword} />
            <Pressable disabled={deleting} onPress={() => void deleteAccount()} style={styles.destructiveButton}>
              <Text style={styles.destructiveButtonText}>{deleting ? copy.deleting : copy.deletePermanently}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

function AccountHeading({ icon, label }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string }) {
  const { colors } = useAppAppearance();
  const styles = useAccountSettingsStyles();
  return (
    <View style={styles.heading}>
      <View style={styles.headingIcon}><MaterialCommunityIcons color={colors.primaryDark} name={icon} size={19} /></View>
      <Text style={styles.eyebrow}>{label}</Text>
    </View>
  );
}

function ProfileField({ label, ...inputProps }: { label: string } & React.ComponentProps<typeof TextInput>) {
  const { colors } = useAppAppearance();
  const styles = useAccountSettingsStyles();
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput {...inputProps} placeholderTextColor={colors.muted} selectionColor={colors.primary} style={[styles.input, inputProps.multiline && styles.multiline]} />
    </View>
  );
}

function useAccountSettingsStyles() {
  const { colors } = useAppAppearance();
  return useMemo(() => createStyles(colors), [colors]);
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  card: { gap: 12 },
  heading: { alignItems: "center", flexDirection: "row", gap: 9 },
  headingIcon: { alignItems: "center", backgroundColor: colors.surfaceAlt, borderRadius: 11, height: 34, justifyContent: "center", width: 34 },
  eyebrow: { color: colors.primary, fontFamily: fonts.label, fontSize: 10, textTransform: "uppercase" },
  title: { color: colors.text, fontFamily: fonts.heading, fontSize: 15 },
  body: { color: colors.muted, fontFamily: fonts.body, fontSize: 11.5, lineHeight: 18 },
  identityRow: { alignItems: "center", flexDirection: "row", gap: 11 },
  avatar: { alignItems: "center", backgroundColor: colors.surfaceAlt, borderRadius: 18, height: 48, justifyContent: "center", width: 48 },
  avatarText: { color: colors.primaryDark, fontFamily: fonts.display, fontSize: 18 },
  identityCopy: { flex: 1, gap: 3 },
  email: { color: colors.muted, fontFamily: fonts.body, fontSize: 10.5 },
  buttonRow: { flexDirection: "row", gap: 10 },
  secondaryButton: { alignItems: "center", borderColor: colors.border, borderRadius: 14, borderWidth: 1, flex: 1, flexDirection: "row", gap: 7, justifyContent: "center", minHeight: 44, paddingHorizontal: 10 },
  secondaryLabel: { color: colors.primaryDark, fontFamily: fonts.heading, fontSize: 11 },
  disabledButton: { opacity: 0.52 },
  disabledLabel: { color: colors.muted },
  dangerLabel: { color: colors.danger },
  loadError: { alignItems: "center", backgroundColor: colors.surfaceAlt, borderRadius: 14, flexDirection: "row", gap: 10, padding: 12 },
  loadErrorCopy: { flex: 1, gap: 3 },
  loadErrorTitle: { color: colors.text, fontFamily: fonts.heading, fontSize: 11 },
  loadErrorBody: { color: colors.muted, fontFamily: fonts.body, fontSize: 10, lineHeight: 15 },
  retryButton: { alignItems: "center", flexDirection: "row", gap: 5, minHeight: 38, paddingHorizontal: 6 },
  retryLabel: { color: colors.primaryDark, fontFamily: fonts.heading, fontSize: 10.5 },
  deleteButton: { alignItems: "center", alignSelf: "center", flexDirection: "row", gap: 7, minHeight: 40, paddingHorizontal: 10 },
  destructiveButton: { alignItems: "center", backgroundColor: colors.danger, borderRadius: 14, justifyContent: "center", minHeight: 48, paddingHorizontal: 14 },
  destructiveButtonText: { color: colors.surface, fontFamily: fonts.heading, fontSize: 12 },
  modalBackdrop: { backgroundColor: "rgba(0, 0, 0, 0.44)", flex: 1, justifyContent: "flex-end" },
  modalCard: { backgroundColor: colors.surface, borderTopLeftRadius: 26, borderTopRightRadius: 26, gap: 14, paddingBottom: 30, paddingHorizontal: 20, paddingTop: 20 },
  modalHeader: { alignItems: "center", flexDirection: "row" },
  modalCopy: { flex: 1, gap: 3 },
  modalEyebrow: { color: colors.primary, fontFamily: fonts.label, fontSize: 10, textTransform: "uppercase" },
  modalTitle: { color: colors.text, fontFamily: fonts.display, fontSize: 21 },
  closeButton: { alignItems: "center", borderColor: colors.border, borderRadius: 14, borderWidth: 1, height: 42, justifyContent: "center", width: 42 },
  field: { gap: 6 },
  fieldLabel: { color: colors.text, fontFamily: fonts.label, fontSize: 10.5 },
  input: { backgroundColor: colors.background, borderColor: colors.border, borderRadius: 14, borderWidth: 1, color: colors.text, fontFamily: fonts.body, fontSize: 13, minHeight: 48, paddingHorizontal: 13, paddingVertical: 11 },
  multiline: { minHeight: 96, textAlignVertical: "top" },
  counter: { color: colors.muted, fontFamily: fonts.body, fontSize: 10, marginTop: -10, textAlign: "right" },
  });
}
