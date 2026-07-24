const enabled = process.env.EXPO_PUBLIC_AUTH_CAPTCHA_ENABLED === "true";
const siteKey = process.env.EXPO_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";
const challengeUrl = process.env.EXPO_PUBLIC_TURNSTILE_CHALLENGE_URL?.trim()
  ?? "https://verify.clean4jesus.com/turnstile/";

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
