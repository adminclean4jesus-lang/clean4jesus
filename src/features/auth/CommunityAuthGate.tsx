import { MaterialCommunityIcons } from "@/components/MaterialCommunityIcon";
import { useMemo, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";

import { PrimaryButton } from "@/components/PrimaryButton";
import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import {
  CommunityLegalNoticeModal,
  type CommunityLegalDocument,
} from "@/features/auth/CommunityLegalNoticeModal";
import { PasswordChecklist } from "@/features/auth/PasswordChecklist";
import {
  AuthServiceError,
  requestPasswordReset,
  resendConfirmationEmail,
  signInWithEmail,
  signUpWithEmail,
} from "@/features/auth/authService";
import { signInWithGoogle } from "@/features/auth/socialAuthService";
import { captchaConfig, captchaConfigurationError } from "@/features/auth/captchaConfig";
import { TurnstileChallengeModal } from "@/features/auth/TurnstileChallengeModal";
import { fonts, ThemeColors } from "@/theme";
import { useI18n } from "@/features/i18n/I18nProvider";
import { getAuthText } from "@/features/i18n/authText";
import { getAuthAuxText, getAuthErrorMessage, getCaptchaConfigurationMessage } from "@/features/i18n/authAuxText";

export function CommunityAuthGate() {
  const { colors } = useAppAppearance();
  const { language, t } = useI18n();
  const copy = getAuthText(language);
  const auxCopy = getAuthAuxText(language);
  const styles = useCommunityAuthStyles();
  const [mode, setMode] = useState<"forgot" | "signIn" | "signUp">("signIn");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [socialSubmitting, setSocialSubmitting] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<"error" | "idle" | "sending" | "sent">("idle");
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);
  const [legalDocument, setLegalDocument] = useState<CommunityLegalDocument | null>(null);
  const [captchaVisible, setCaptchaVisible] = useState(false);
  const resendInFlight = useRef(false);
  const submitInFlight = useRef(false);

  async function handleSubmit() {
    if (submitInFlight.current) return;
    if (!email.trim() || (mode !== "forgot" && !password)) {
      Alert.alert(copy.missing, mode === "forgot" ? copy.emailRequired : copy.credentialsRequired);
      return;
    }
    if (mode !== "forgot" && !acceptedPolicies) {
      Alert.alert(copy.agreementTitle, copy.agreementBody);
      return;
    }
    if (mode === "signUp" && password !== passwordConfirmation) {
      Alert.alert(copy.passwordTitle, copy.passwordMismatch);
      return;
    }

    if (captchaConfig.enabled) {
      const configurationError = captchaConfigurationError();
      if (configurationError) {
        Alert.alert(copy.unavailable, getCaptchaConfigurationMessage(configurationError, language));
        return;
      }
      setCaptchaVisible(true);
      return;
    }

    await submitCredentials();
  }

  async function submitCredentials(captchaToken?: string) {
    if (submitInFlight.current) return;

    submitInFlight.current = true;
    setSubmitting(true);
    try {
      if (mode === "forgot") {
        await requestPasswordReset(email, captchaToken);
        Alert.alert(copy.checkEmail, copy.resetSent);
        setMode("signIn");
      } else if (mode === "signIn") {
        await signInWithEmail(email, password, language, captchaToken);
      } else {
        const result = await signUpWithEmail(displayName, email, password, language, captchaToken);
        if (result.requiresEmailConfirmation) {
          setConfirmationEmail(email.trim().toLowerCase());
          setResendStatus("idle");
          setMode("signIn");
        }
      }
    } catch (error) {
      if (mode === "signIn" && error instanceof AuthServiceError && error.code === "email_not_confirmed") {
        setConfirmationEmail(email.trim().toLowerCase());
        setResendStatus("idle");
      } else {
        Alert.alert(copy.failed, getAuthErrorMessage(error, language, copy.retry));
      }
    } finally {
      submitInFlight.current = false;
      setSubmitting(false);
    }
  }

  function handleCaptchaSolved(token: string) {
    setCaptchaVisible(false);
    void submitCredentials(token);
  }

  async function handleResendConfirmation() {
    if (!confirmationEmail || resendInFlight.current) return;
    resendInFlight.current = true;
    setResendStatus("sending");
    try {
      await resendConfirmationEmail(confirmationEmail);
      setResendStatus("sent");
    } catch {
      setResendStatus("error");
    } finally {
      resendInFlight.current = false;
    }
  }

  function changeConfirmationEmail() {
    setConfirmationEmail(null);
    setResendStatus("idle");
    setMode("signUp");
  }

  async function handleGoogleSignIn() {
    if (socialSubmitting || submitInFlight.current) return;
    if (!acceptedPolicies) {
      Alert.alert(copy.agreementTitle, copy.agreementBody);
      return;
    }
    setSocialSubmitting(true);
    try {
      await signInWithGoogle(language);
    } catch (error) {
      Alert.alert(
        copy.failed,
        getAuthErrorMessage(error, language, copy.retry),
      );
    } finally {
      setSocialSubmitting(false);
    }
  }

  if (confirmationEmail) {
    return (
      <View style={styles.card} testID="community-auth-gate">
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons color={colors.success} name="email-check-outline" size={28} />
        </View>
        <Text style={styles.eyebrow}>{copy.confirmAccount}</Text>
        <Text style={styles.title}>{copy.checkEmail}</Text>
        <Text style={styles.body}>{copy.sentLink}</Text>
        <Text selectable style={styles.confirmationEmail}>{confirmationEmail}</Text>
        <View style={styles.confirmationGuide}>
          <MaterialCommunityIcons color={colors.primaryDark} name="cellphone-check" size={20} />
          <Text style={styles.confirmationGuideText}>{copy.openSameDevice}</Text>
        </View>
        <Text style={styles.resendHelp}>{copy.spamHelp}</Text>
        <PrimaryButton
          disabled={resendStatus === "sending"}
          label={resendStatus === "sending" ? copy.resending : copy.resend}
          onPress={() => void handleResendConfirmation()}
          variant="ghost"
        />
        {resendStatus === "sent" ? (
          <Text accessibilityLiveRegion="polite" style={styles.resendSuccess}>{copy.resent}</Text>
        ) : resendStatus === "error" ? (
          <Text accessibilityLiveRegion="polite" style={styles.resendError}>{copy.resendError}</Text>
        ) : null}
        <Pressable accessibilityRole="button" onPress={changeConfirmationEmail}>
          <Text style={styles.textAction}>{copy.anotherEmail}</Text>
        </Pressable>
        <Text style={styles.privacy}>{copy.pending}</Text>
      </View>
    );
  }

  return (
    <View style={styles.card} testID="community-auth-gate">
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons color={colors.primaryDark} name="account-heart-outline" size={28} />
      </View>
      <Text style={styles.eyebrow}>{copy.protected}</Text>
      <Text style={styles.title}>
        {mode === "signIn" ? copy.signInTitle : mode === "signUp" ? copy.signUpTitle : copy.forgotTitle}
      </Text>
      <Text style={styles.body}>
        {copy.cardBody}
      </Text>

      {mode !== "forgot" ? (
        <View style={styles.segmented}>
          <ModeButton active={mode === "signIn"} label={copy.signIn} onPress={() => setMode("signIn")} />
          <ModeButton active={mode === "signUp"} label={copy.signUp} onPress={() => setMode("signUp")} />
        </View>
      ) : null}

      {mode !== "forgot" ? (
        <>
          <View style={styles.socialStack}>
            <SocialButton
              disabled={socialSubmitting || submitting}
              label={socialSubmitting ? copy.connecting : copy.google}
              onPress={() => void handleGoogleSignIn()}
            />
          </View>
          <Text style={styles.socialLegal}>
            {copy.googleConsent}
          </Text>
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{copy.orEmail}</Text>
            <View style={styles.dividerLine} />
          </View>
        </>
      ) : null}

      <View style={styles.form}>
        {mode === "signUp" ? (
          <Field
            autoCapitalize="words"
            label={copy.displayName}
            onChangeText={setDisplayName}
            placeholder={copy.displayNamePlaceholder}
            value={displayName}
          />
        ) : null}
        <Field
          autoCapitalize="none"
          keyboardType="email-address"
          label={copy.email}
          onChangeText={setEmail}
          placeholder={auxCopy.emailPlaceholder}
          value={email}
        />
        {mode !== "forgot" ? (
          <>
            <Field
              autoCapitalize="none"
              label={copy.password}
              onChangeText={setPassword}
              placeholder={copy.passwordHint}
              secureTextEntry
              value={password}
            />
            {mode === "signUp" ? (
              <>
                <Field
                  autoCapitalize="none"
                  label={copy.confirmPassword}
                  onChangeText={setPasswordConfirmation}
                  placeholder={copy.repeatPassword}
                  secureTextEntry
                  value={passwordConfirmation}
                />
                <PasswordChecklist displayName={displayName} email={email} password={password} />
              </>
            ) : null}
          </>
        ) : null}
      </View>

      {mode !== "forgot" ? (
        <View style={styles.consentWrap}>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: acceptedPolicies }}
            onPress={() => setAcceptedPolicies((current) => !current)}
            style={styles.consentRow}
          >
            <View style={[styles.checkbox, acceptedPolicies && styles.checkboxChecked]}>
              {acceptedPolicies ? <MaterialCommunityIcons color={colors.surface} name="check" size={16} /> : null}
            </View>
            <Text style={styles.consentText}>{copy.accept}</Text>
          </Pressable>
          <View style={styles.legalLinks}>
            <Pressable onPress={() => setLegalDocument("privacy")}><Text style={styles.legalLink}>{t(language, "legal.link.privacy")}</Text></Pressable>
            <Text style={styles.legalSeparator}>·</Text>
            <Pressable onPress={() => setLegalDocument("terms")}><Text style={styles.legalLink}>{t(language, "legal.link.terms")}</Text></Pressable>
            <Text style={styles.legalSeparator}>·</Text>
            <Pressable onPress={() => setLegalDocument("guidelines")}><Text style={styles.legalLink}>{t(language, "legal.link.guidelines")}</Text></Pressable>
          </View>
        </View>
      ) : null}

      <PrimaryButton
        disabled={submitting}
        label={submitting ? copy.connecting : mode === "signIn" ? copy.enter : mode === "signUp" ? copy.create : copy.sendLink}
        onPress={() => void handleSubmit()}
      />
      {mode === "signIn" ? (
        <Pressable accessibilityRole="button" onPress={() => setMode("forgot")}>
          <Text style={styles.textAction}>{copy.forgot}</Text>
        </Pressable>
      ) : mode === "forgot" ? (
        <Pressable accessibilityRole="button" onPress={() => setMode("signIn")}>
          <Text style={styles.textAction}>{copy.backSignIn}</Text>
        </Pressable>
      ) : null}
      <Text style={styles.privacy}>{copy.privacy}</Text>
      <CommunityLegalNoticeModal document={legalDocument} onClose={() => setLegalDocument(null)} />
      <TurnstileChallengeModal
        onCancel={() => setCaptchaVisible(false)}
        onSolved={handleCaptchaSolved}
        visible={captchaVisible}
      />
    </View>
  );
}

function ModeButton({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  const styles = useCommunityAuthStyles();
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.modeButton, active && styles.modeButtonActive]}
    >
      <Text style={[styles.modeText, active && styles.modeTextActive]}>{label}</Text>
    </Pressable>
  );
}

function SocialButton({
  disabled,
  label,
  onPress,
}: {
  disabled: boolean;
  label: string;
  onPress: () => void;
}) {
  const styles = useCommunityAuthStyles();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      android_ripple={{ color: "#E8EAED" }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.socialButton,
        disabled && styles.socialButtonDisabled,
      ]}
    >
      <View style={styles.socialButtonContent}>
        <View
          accessible={false}
          importantForAccessibility="no"
          style={styles.googleMark}
          testID="google-brand-icon"
        >
          <GoogleMark />
        </View>
        <Text numberOfLines={1} style={styles.socialButtonText}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function GoogleMark() {
  return <SvgXml height={20} width={20} xml={GOOGLE_MARK_SVG} />;
}

const GOOGLE_MARK_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 118 120">
    <path fill="#4285F4" d="M117.6 61.364c0-4.255-.382-8.346-1.091-12.273H60V72.3h32.291c-1.391 7.5-5.618 13.855-11.973 18.109v15.055H99.71c11.345-10.445 17.891-25.827 17.891-44.1Z"/>
    <path fill="#34A853" d="M60 120c16.2 0 29.782-5.373 39.709-14.536L80.318 90.409C74.945 94.009 68.073 96.136 60 96.136c-15.627 0-28.855-10.554-33.573-24.736L6.382 71.4v15.545C16.255 106.555 36.545 120 60 120Z"/>
    <path fill="#FBBC05" d="M26.427 71.4A35.59 35.59 0 0 1 24.545 60c0-3.955.682-7.8 1.882-11.4V33.055H6.382A59.73 59.73 0 0 0 0 60a59.73 59.73 0 0 0 6.382 26.945L26.427 71.4Z"/>
    <path fill="#EA4335" d="M60 23.864c8.809 0 16.718 3.027 22.936 8.972l17.21-17.209C89.754 5.945 76.173 0 60 0 36.545 0 16.255 13.445 6.382 33.055L26.427 48.6C31.145 34.418 44.373 23.864 60 23.864Z"/>
  </svg>
`;

type FieldProps = {
  autoCapitalize: "none" | "sentences" | "words";
  keyboardType?: "default" | "email-address";
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  value: string;
};

function Field({ label, ...props }: FieldProps) {
  const { colors } = useAppAppearance();
  const styles = useCommunityAuthStyles();
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor={colors.muted}
        selectionColor={colors.primary}
        style={styles.input}
      />
    </View>
  );
}

function useCommunityAuthStyles() {
  const { colors } = useAppAppearance();
  return useMemo(() => createStyles(colors), [colors]);
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    gap: 14,
    padding: 20,
  },
  iconWrap: {
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    borderRadius: 18,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  eyebrow: {
    color: colors.primary,
    fontFamily: fonts.label,
    fontSize: 11,
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 23,
    lineHeight: 28,
  },
  body: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 21,
  },
  confirmationEmail: { color: colors.text, fontFamily: fonts.heading, fontSize: 13, lineHeight: 20 },
  confirmationGuide: { alignItems: "center", backgroundColor: colors.surfaceAlt, borderRadius: 14, flexDirection: "row", gap: 10, padding: 13 },
  confirmationGuideText: { color: colors.text, flex: 1, fontFamily: fonts.bodyMedium, fontSize: 12, lineHeight: 18 },
  resendHelp: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, lineHeight: 17 },
  resendSuccess: { color: colors.success, fontFamily: fonts.bodyMedium, fontSize: 11, lineHeight: 17, textAlign: "center" },
  resendError: { color: colors.danger, fontFamily: fonts.bodyMedium, fontSize: 11, lineHeight: 17, textAlign: "center" },
  segmented: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 14,
    flexDirection: "row",
    padding: 4,
  },
  socialStack: {
    gap: 9,
  },
  socialButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#747775",
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 12,
    width: "100%",
  },
  socialButtonContent: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    maxWidth: "100%",
  },
  googleMark: {
    alignItems: "center",
    flexShrink: 0,
    height: 20,
    justifyContent: "center",
    width: 20,
  },
  socialButtonText: {
    color: "#1F1F1F",
    flexShrink: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
  },
  socialButtonDisabled: {
    opacity: 0.55,
  },
  socialLegal: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 10,
    lineHeight: 15,
    textAlign: "center",
  },
  divider: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  dividerLine: {
    backgroundColor: colors.border,
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerText: {
    color: colors.muted,
    fontFamily: fonts.label,
    fontSize: 10,
  },
  modeButton: {
    alignItems: "center",
    borderRadius: 11,
    flex: 1,
    paddingVertical: 10,
  },
  modeButtonActive: { backgroundColor: colors.surface },
  modeText: { color: colors.muted, fontFamily: fonts.bodyMedium, fontSize: 12 },
  modeTextActive: { color: colors.primaryDark },
  form: { gap: 12 },
  consentWrap: { gap: 9 },
  consentRow: { alignItems: "flex-start", flexDirection: "row", gap: 10 },
  checkbox: { alignItems: "center", borderColor: colors.border, borderRadius: 6, borderWidth: 1, height: 22, justifyContent: "center", width: 22 },
  checkboxChecked: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
  consentText: { color: colors.text, flex: 1, fontFamily: fonts.body, fontSize: 11.5, lineHeight: 18 },
  legalLinks: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: 7, paddingLeft: 32 },
  legalLink: { color: colors.primaryDark, fontFamily: fonts.heading, fontSize: 10.5, textDecorationLine: "underline" },
  legalSeparator: { color: colors.muted, fontFamily: fonts.body, fontSize: 11 },
  fieldWrap: { gap: 6 },
  fieldLabel: { color: colors.text, fontFamily: fonts.label, fontSize: 11 },
  input: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 14,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  privacy: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 10.5,
    lineHeight: 16,
    textAlign: "center",
  },
  textAction: { color: colors.primaryDark, fontFamily: fonts.heading, fontSize: 12, textAlign: "center" },
  });
}
