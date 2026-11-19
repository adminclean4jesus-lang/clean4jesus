import Constants from "expo-constants";

type PublicCaptchaConfig = {
  challengeUrl?: string;
  enabled?: boolean;
  siteKey?: string;
};

const publicCaptcha = (Constants.expoConfig?.extra?.authCaptcha ?? {}) as PublicCaptchaConfig;
const enabledFromEnvironment = process.env.EXPO_PUBLIC_AUTH_CAPTCHA_ENABLED;
const enabled = enabledFromEnvironment === "true"
  || (enabledFromEnvironment !== "false" && publicCaptcha.enabled === true);
const siteKey = (process.env.EXPO_PUBLIC_TURNSTILE_SITE_KEY ?? publicCaptcha.siteKey ?? "").trim();
const challengeUrl = (process.env.EXPO_PUBLIC_TURNSTILE_CHALLENGE_URL
  ?? publicCaptcha.challengeUrl
  ?? "https://verify.clean4jesus.com/turnstile/").trim();

export const captchaConfig = {
  challengeUrl,
  enabled,
  siteKey,
} as const;

export type CaptchaConfigurationError = "captcha_https_required" | "captcha_site_key_missing";

export function captchaConfigurationError(): CaptchaConfigurationError | null {
  if (!enabled) return null;
  if (!siteKey) return "captcha_site_key_missing";
  if (!challengeUrl.startsWith("https://")) return "captcha_https_required";
  return null;
}

export function buildCaptchaChallengeUrl() {
  const error = captchaConfigurationError();
  if (error) throw new Error(error);

  const separator = challengeUrl.includes("?") ? "&" : "?";
  return `${challengeUrl}${separator}sitekey=${encodeURIComponent(siteKey)}&action=auth`;
}
