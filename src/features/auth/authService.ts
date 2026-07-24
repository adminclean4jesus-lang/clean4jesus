import { getSupabaseClient } from "@/lib/supabase";
import { authCallbackUrl, recoveryCallbackUrl } from "@/features/auth/authRedirect";
import {
  authorizePasswordRecovery,
  clearPasswordRecovery,
  hasPasswordRecoveryAuthorization,
} from "@/features/auth/recoveryState";
import { clearAccountabilityDevice } from "@/features/accountability/accountabilityService";
import { MIN_PASSWORD_LENGTH, validatePassword } from "@/features/auth/passwordPolicy";
import type { SupportedLanguage } from "@/features/i18n/i18n";
import {
  legalSignupMetadata,
  recordLegalAcceptance,
} from "@/features/legal/legalPolicy";

export type AuthServiceErrorCode =
  | "access_failed"
  | "already_registered"
  | "captcha_failed"
  | "delete_failed"
  | "delete_unconfirmed"
  | "display_name_invalid"
  | "email_invalid"
  | "email_not_authorized"
  | "email_not_confirmed"
  | "email_rate_limited"
  | "email_send_failed"
  | "invalid_credentials"
  | "password_recovery_invalid"
  | "password_update_failed"
  | "reauthentication_failed"
  | "sign_out_failed"
  | "weak_password";

export class AuthServiceError extends Error {
  constructor(public readonly code: AuthServiceErrorCode, legacyMessage: string = code) {
    super(legacyMessage);
    this.name = "AuthServiceError";
  }
}

export async function signInWithEmail(
  email: string,
  password: string,
  language: SupportedLanguage,
  captchaToken?: string,
) {
  const { error } = await getSupabaseClient().auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
    options: captchaToken ? { captchaToken } : undefined,
  });

  if (error) {
    throw toAuthServiceError(error.message);
  }

  await recordLegalAcceptance(language, "email_signin");
}

export async function signUpWithEmail(
  displayName: string,
  email: string,
  password: string,
  language: SupportedLanguage,
  captchaToken?: string,
) {
  const cleanName = displayName.trim();
  const normalizedEmail = email.trim().toLowerCase();
  if (cleanName.length < 2) {
    throw new AuthServiceError("display_name_invalid", "Escribe un nombre de al menos 2 caracteres.");
  }
  const passwordValidation = validatePassword(password, { displayName: cleanName, email: normalizedEmail });
  if (!passwordValidation.valid) {
    throw new AuthServiceError("weak_password", passwordValidation.message);
  }

  const { data, error } = await getSupabaseClient().auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      captchaToken,
      data: {
        display_name: cleanName,
        ...legalSignupMetadata(language),
      },
      emailRedirectTo: authCallbackUrl,
    },
  });

  if (error) {
    throw toAuthServiceError(error.message);
  }

  return { requiresEmailConfirmation: !data.session };
}

export async function resendConfirmationEmail(email: string) {
  const { error } = await getSupabaseClient().auth.resend({
    email: normalizeEmail(email),
    options: { emailRedirectTo: authCallbackUrl },
    type: "signup",
  });
  if (error) {
    throw toAuthServiceError(error.message);
  }
}

export async function requestPasswordReset(email: string, captchaToken?: string) {
  const { error } = await getSupabaseClient().auth.resetPasswordForEmail(normalizeEmail(email), {
    captchaToken,
    redirectTo: recoveryCallbackUrl(),
  });
  if (error) {
    throw toAuthServiceError(error.message);
  }
}

export async function exchangeAuthCode(code: string) {
  const supabase = getSupabaseClient();
  let recoveryUserId: string | null = null;
  const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") {
      recoveryUserId = session?.user.id ?? null;
    }
  });

  await clearPasswordRecovery();
  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data.session || !data.user) {
      throw new AuthServiceError("password_recovery_invalid", "El enlace vencio o ya fue usado. Solicita uno nuevo.");
    }

    const isPasswordRecovery = recoveryUserId === data.user.id;
    if (isPasswordRecovery) {
      await authorizePasswordRecovery(data.user.id);
    }
    return { isPasswordRecovery };
  } finally {
    listener.subscription.unsubscribe();
  }
}

export async function updatePassword(password: string) {
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    throw new AuthServiceError("weak_password", passwordValidation.message);
  }
  const supabase = getSupabaseClient();
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user.id;
  if (!userId || !await hasPasswordRecoveryAuthorization(userId)) {
    throw new AuthServiceError("password_recovery_invalid", "Este enlace de recuperación no es válido o ya fue usado. Solicita uno nuevo.");
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    throw new AuthServiceError("password_update_failed", "No pudimos cambiar la contraseña. Revisa la conexión e intenta otra vez.");
  }
  await clearPasswordRecovery();
}

export async function deleteMyAccount(userId: string, password: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke("delete-account", {
    body: { password, userId },
  });
  if (error) {
    if (await readFunctionErrorCode(error) === "reauthentication_failed") {
      throw new AuthServiceError("reauthentication_failed", "La contraseña no coincide. No se elimino nada.");
    }
    throw new AuthServiceError("delete_failed", "No pudimos eliminar la cuenta. Intenta nuevamente o contacta soporte.");
  }
  if (!data?.deleted) {
    throw new AuthServiceError("delete_unconfirmed", "No pudimos confirmar la eliminación. Intenta nuevamente o contacta soporte.");
  }
  await clearAccountabilityDevice();
  await supabase.auth.signOut({ scope: "local" });
}

export async function signOut() {
  await clearAccountabilityDevice();
  const { error } = await getSupabaseClient().auth.signOut({ scope: "local" });
  if (error) {
    throw new AuthServiceError("sign_out_failed", "No pudimos cerrar la sesión. Intenta de nuevo.");
  }
}

function toFriendlyAuthMessage(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) {
    return "El correo o la contraseña no coinciden.";
  }
  if (normalized.includes("already registered")) {
    return "Ese correo ya tiene una cuenta.";
  }
  if (normalized.includes("valid email")) {
    return "Escribe un correo valido.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Confirma tu correo antes de iniciar sesión.";
  }
  if (normalized.includes("email address not authorized")) {
    return "El servicio de correo aún está en modo interno. Contacta al equipo de Clean4Jesus.";
  }
  if (normalized.includes("error sending confirmation email") || normalized.includes("email provider")) {
    return "No pudimos enviar el correo. Intenta de nuevo en unos minutos.";
  }
  if (normalized.includes("rate limit") || normalized.includes("security purposes")) {
    return "Espera un momento antes de solicitar otro correo.";
  }
  if (normalized.includes("weak password")) {
    return "Elige una contraseña más larga y difícil de adivinar.";
  }
  if (normalized.includes("captcha")) {
    return "No pudimos completar la verificación humana. Intenta nuevamente.";
  }
  return "No pudimos completar el acceso. Intenta nuevamente.";
}

function toAuthServiceError(message: string) {
  const normalized = message.toLowerCase();
  const code: AuthServiceErrorCode = normalized.includes("invalid login credentials")
    ? "invalid_credentials"
    : normalized.includes("already registered")
      ? "already_registered"
      : normalized.includes("invalid email")
        ? "email_invalid"
        : normalized.includes("email not confirmed")
          ? "email_not_confirmed"
          : normalized.includes("email address not authorized")
            ? "email_not_authorized"
            : normalized.includes("error sending") || normalized.includes("confirmation email")
              ? "email_send_failed"
              : normalized.includes("rate limit") || normalized.includes("after 60 seconds")
                ? "email_rate_limited"
                : normalized.includes("password") && (normalized.includes("weak") || normalized.includes("characters"))
                  ? "weak_password"
                  : normalized.includes("captcha") || normalized.includes("challenge")
                    ? "captcha_failed"
                    : "access_failed";
  return new AuthServiceError(code, toFriendlyAuthMessage(message));
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function readFunctionErrorCode(error: unknown) {
  if (!error || typeof error !== "object" || !("context" in error)) {
    return null;
  }

  const context = (error as { context?: unknown }).context;
  if (!(context instanceof Response)) {
    return null;
  }

  try {
    const body = await context.clone().json() as { error?: unknown };
    return typeof body.error === "string" ? body.error : null;
  } catch {
    return null;
  }
}
