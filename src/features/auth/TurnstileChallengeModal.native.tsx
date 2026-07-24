import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Modal, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

import { buildCaptchaChallengeUrl, captchaConfigurationError } from "@/features/auth/captchaConfig";
import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { fonts, ThemeColors } from "@/theme";
import { useI18n } from "@/features/i18n/I18nProvider";
import { getCommunityFlowText } from "@/features/i18n/communityFlowText";
import { getCaptchaConfigurationMessage } from "@/features/i18n/authAuxText";

type Props = {
  onCancel: () => void;
  onSolved: (token: string) => void;
  visible: boolean;
};

type ChallengeMessage = { type?: string; token?: string; message?: string };

export function TurnstileChallengeModal({ onCancel, onSolved, visible }: Props) {
  const { colors } = useAppAppearance();
  const { language } = useI18n();
  const copy = getCommunityFlowText(language);
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [loading, setLoading] = useState(true);
  const [challengeError, setChallengeError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const configurationError = captchaConfigurationError();
  const challengeUrl = visible && !configurationError ? buildCaptchaChallengeUrl() : null;

  useEffect(() => {
    if (!visible) return;
    setChallengeError(null);
    setLoading(true);
  }, [reloadKey, visible]);

  useEffect(() => {
    if (!visible || challengeError) return;
    const timeout = setTimeout(() => {
      setChallengeError(copy.captchaTimeout);
      setLoading(false);
    }, 120_000);
    return () => clearTimeout(timeout);
  }, [challengeError, reloadKey, visible]);

  function handleMessage(event: WebViewMessageEvent) {
    let payload: ChallengeMessage;
    try {
      payload = JSON.parse(event.nativeEvent.data) as ChallengeMessage;
    } catch {
      setChallengeError(copy.captchaInvalid);
      return;
    }

    if (payload.type === "token" && payload.token) {
      onSolved(payload.token);
      return;
    }
    if (payload.type === "expired") {
      setChallengeError(copy.captchaExpired);
      return;
    }
    if (payload.type === "error") {
      setChallengeError(copy.captchaFailed);
    }
  }

  const visibleError = configurationError ? getCaptchaConfigurationMessage(configurationError, language) : challengeError;

  function retryChallenge() {
    setReloadKey((current) => current + 1);
  }

  function allowNavigation(url: string) {
    if (url === "about:blank" || url === "about:srcdoc") return true;
    try {
      const host = new URL(url).hostname;
      return host === "verify.clean4jesus.com" || host === "challenges.cloudflare.com";
    } catch {
      return false;
    }
  }

  return (
    <Modal animationType="slide" onRequestClose={onCancel} presentationStyle="pageSheet" visible={visible}>
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.headingWrap}>
            <Text style={styles.eyebrow}>{copy.captchaEyebrow}</Text>
            <Text style={styles.title}>{copy.captchaTitle}</Text>
          </View>
          <Pressable accessibilityLabel={copy.captchaClose} accessibilityRole="button" onPress={onCancel} style={styles.closeButton}>
            <MaterialCommunityIcons color={colors.primaryDark} name="close" size={22} />
          </Pressable>
        </View>

        <Text style={styles.body}>{copy.captchaBody}</Text>

        <View style={styles.challengeFrame}>
          {visibleError ? (
            <View style={styles.stateWrap}>
              <MaterialCommunityIcons color={colors.danger} name="alert-circle-outline" size={28} />
              <Text accessibilityLiveRegion="polite" style={styles.errorText}>{visibleError}</Text>
              {!configurationError ? (
                <Pressable accessibilityRole="button" onPress={retryChallenge} style={styles.retryButton}>
                  <Text style={styles.retryText}>{copy.retry}</Text>
                </Pressable>
              ) : null}
              <Pressable accessibilityRole="button" onPress={onCancel}>
                <Text style={styles.cancelText}>{copy.cancel}</Text>
              </Pressable>
            </View>
          ) : challengeUrl ? (
            <>
              <WebView
                key={reloadKey}
                javaScriptEnabled
                domStorageEnabled
                onError={() => setChallengeError(copy.captchaLoad)}
                onHttpError={() => setChallengeError(copy.captchaHttp)}
                onLoadEnd={() => setLoading(false)}
                onMessage={handleMessage}
                onShouldStartLoadWithRequest={(request) => allowNavigation(request.url)}
                originWhitelist={["https://*", "about:blank", "about:srcdoc"]}
                source={{ uri: challengeUrl }}
                style={styles.webView}
              />
              {loading ? <ActivityIndicator color={colors.primary} size="large" style={styles.loader} /> : null}
            </>
          ) : null}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  screen: { backgroundColor: colors.background, flex: 1, gap: 18, padding: 22 },
  header: { alignItems: "flex-start", flexDirection: "row", gap: 16, justifyContent: "space-between" },
  headingWrap: { flex: 1, gap: 6 },
  eyebrow: { color: colors.primary, fontFamily: fonts.label, fontSize: 11, textTransform: "uppercase" },
  title: { color: colors.text, fontFamily: fonts.display, fontSize: 22, lineHeight: 29 },
  closeButton: { alignItems: "center", backgroundColor: colors.surfaceAlt, borderRadius: 18, height: 44, justifyContent: "center", width: 44 },
  body: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, lineHeight: 21 },
  challengeFrame: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 20, borderWidth: 1, flex: 1, minHeight: 280, overflow: "hidden" },
  webView: { backgroundColor: colors.surface, flex: 1 },
  loader: { ...StyleSheet.absoluteFillObject },
  stateWrap: { alignItems: "center", flex: 1, gap: 14, justifyContent: "center", padding: 30 },
  errorText: { color: colors.danger, fontFamily: fonts.bodyMedium, fontSize: 13, lineHeight: 20, textAlign: "center" },
  retryButton: { alignItems: "center", backgroundColor: colors.primaryDark, borderRadius: 14, minHeight: 46, justifyContent: "center", paddingHorizontal: 20 },
  retryText: { color: colors.surface, fontFamily: fonts.heading, fontSize: 12 },
  cancelText: { color: colors.primaryDark, fontFamily: fonts.heading, fontSize: 12 },
  });
}
