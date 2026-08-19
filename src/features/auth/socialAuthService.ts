import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

import { authCallbackUrl } from "@/features/auth/authRedirect";
import { exchangeAuthCode } from "@/features/auth/authService";
import { getSupabaseClient } from "@/lib/supabase";
import type { SupportedLanguage } from "@/features/i18n/i18n";
import { recordLegalAcceptance } from "@/features/legal/legalPolicy";

WebBrowser.maybeCompleteAuthSession();

export async function signInWithGoogle(language: SupportedLanguage) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: authCallbackUrl,
      scopes: "email profile",
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    throw new Error(toFriendlyGoogleAuthMessage(error?.message));
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, authCallbackUrl);
  if (result.type === "cancel" || result.type === "dismiss") {
    return { cancelled: true };
  }
  if (result.type !== "success") {
    throw new Error("No pudimos completar el acceso. Intenta nuevamente.");
  }

  const parsed = Linking.parse(result.url);
  const providerError = readQueryValue(parsed.queryParams?.error_description);
  if (providerError) {
    throw new Error(toFriendlyGoogleAuthMessage(providerError));
  }

  const code = readQueryValue(parsed.queryParams?.code);
  if (!code) {
    throw new Error("Google no devolvió un código de acceso válido.");
  }

  await exchangeAuthCode(code, "oauth");
  await recordLegalAcceptance(language, "google_oauth");
  return { cancelled: false };
}

function readQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function toFriendlyGoogleAuthMessage(message = "") {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("provider is not enabled") ||
    normalized.includes("unsupported provider")
  ) {
    return "Google todavía no está habilitado en Supabase. Completa la configuración del proveedor antes de probarlo.";
  }
  if (normalized.includes("cancel") || normalized.includes("denied")) {
    return "El acceso con Google fue cancelado.";
  }
  if (normalized.includes("identity is already linked")) {
    return "Esa identidad de Google ya está vinculada a otra cuenta.";
  }
  return "No pudimos ingresar con Google. Revisa la conexión e intenta nuevamente.";
}
