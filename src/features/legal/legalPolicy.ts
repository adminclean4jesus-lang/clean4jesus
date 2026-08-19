import type { SupportedLanguage } from "@/features/i18n/i18n";
import { getSupabaseClient } from "@/lib/supabase";

export const LEGAL_BUNDLE_VERSION = "2026-07-23";
export const PRIVACY_POLICY_VERSION = "1.1";
export const TERMS_VERSION = "1.0";
export const COMMUNITY_GUIDELINES_VERSION = "1.0";

export const LEGAL_URLS = {
  accountDeletion: "https://legal.clean4jesus.com/eliminar-cuenta",
  guidelines: "https://legal.clean4jesus.com/comunidad",
  privacy: "https://legal.clean4jesus.com/privacidad",
  support: "https://legal.clean4jesus.com/soporte",
  terms: "https://legal.clean4jesus.com/terminos",
} as const;

export type LegalConsentSource =
  | "email_signin"
  | "email_signup"
  | "google_oauth"
  | "reconsent";

export function legalSignupMetadata(language: SupportedLanguage) {
  return {
    age_over_18: true,
    community_guidelines_version: COMMUNITY_GUIDELINES_VERSION,
    legal_accepted: true,
    legal_bundle_version: LEGAL_BUNDLE_VERSION,
    legal_locale: language,
    privacy_policy_version: PRIVACY_POLICY_VERSION,
    terms_version: TERMS_VERSION,
  };
}

export async function recordLegalAcceptance(
  language: SupportedLanguage,
  source: LegalConsentSource,
) {
  const supabase = getSupabaseClient();
  let lastError: unknown = null;

  // On mobile, exchangeCodeForSession can resolve just before the persisted
  // auth session is visible to the RPC client. Give the session a short,
  // bounded retry window instead of turning a successful Google login into a
  // misleading recovery-link error.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) {
      const { error } = await supabase.rpc("record_legal_consent", {
        requested_locale: language,
        requested_source: source,
      });
      if (!error) return;
      lastError = error;
    }
    if (attempt < 2) {
      await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }

  void lastError;
  throw new Error("No pudimos registrar el acuerdo legal. Intenta nuevamente.");
}

export async function hasCurrentLegalAcceptance() {
  const { data, error } = await getSupabaseClient().rpc(
    "has_current_legal_consent",
  );

  if (error) {
    throw new Error("No pudimos verificar el acuerdo legal.");
  }

  return data === true;
}
