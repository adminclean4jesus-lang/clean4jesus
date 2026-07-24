import type { AuthServiceErrorCode } from "@/features/auth/authService";
import type { AuthSessionErrorCode } from "@/features/auth/authSession";
import type { SupportedLanguage } from "./i18n";

const copy = {
  es: {
    close: "Cerrar",
    callbackFailed: "No pudimos verificar el enlace.",
    callbackMissing: "El enlace no contiene un código válido.",
    callbackRejected: "El enlace fue rechazado o venció. Solicita uno nuevo.",
    emailPlaceholder: "tu@correo.com",
    resetFailed: "No pudimos actualizar",
    resetInvalid: "Este enlace de recuperación no es válido o ya fue usado. Solicita uno nuevo.",
    resetRetry: "No pudimos cambiar la contraseña. Revisa la conexión e intenta otra vez.",
    turnstileNativeBody: "Abre este flujo desde el build Android para completar la comprobación segura.",
    turnstileTitle: "Verificación disponible en la app móvil",
    turnstileWebBody: "Este flujo CAPTCHA se valida dentro del build Android. La consola interna usa su propio acceso web con MFA.",
    captchaConfig: { captcha_https_required: "La verificación humana requiere una dirección HTTPS.", captcha_site_key_missing: "Falta configurar la clave pública de Turnstile." },
    authErrors: {
      access_failed: "No pudimos completar el acceso. Intenta nuevamente.",
      already_registered: "Ese correo ya tiene una cuenta.",
      captcha_failed: "No pudimos completar la verificación humana. Intenta nuevamente.",
      delete_failed: "No pudimos eliminar la cuenta. Intenta nuevamente o contacta soporte.",
      delete_unconfirmed: "No pudimos confirmar la eliminación. Intenta nuevamente o contacta soporte.",
      display_name_invalid: "Escribe un nombre de al menos 2 caracteres.",
      email_invalid: "Escribe un correo válido.",
      email_not_authorized: "El servicio de correo aún está en modo interno. Contacta al equipo de Clean4Jesus.",
      email_not_confirmed: "Confirma tu correo antes de iniciar sesión.",
      email_rate_limited: "Espera un momento antes de solicitar otro correo.",
      email_send_failed: "No pudimos enviar el correo. Intenta de nuevo en unos minutos.",
      invalid_credentials: "El correo o la contraseña no coinciden.",
      password_recovery_invalid: "Este enlace de recuperación no es válido o ya fue usado. Solicita uno nuevo.",
      password_update_failed: "No pudimos cambiar la contraseña. Revisa la conexión e intenta otra vez.",
      reauthentication_failed: "La contraseña no coincide. No se eliminó nada.",
      sign_out_failed: "No pudimos cerrar la sesión. Intenta de nuevo.",
      weak_password: "La contraseña debe tener al menos 10 caracteres, una letra y un número.",
    },
    sessionErrors: {
      offline_session_preserved: "Estás sin conexión. Conservamos tu sesión protegida en este dispositivo.",
      session_expired: "La sesión venció. Ingresa nuevamente.",
      session_verification_failed: "No pudimos verificar la sesión guardada.",
    },
  },
  en: {
    close: "Close",
    callbackFailed: "We couldn't verify the link.",
    callbackMissing: "The link does not contain a valid code.",
    callbackRejected: "The link was rejected or has expired. Request a new one.",
    emailPlaceholder: "you@example.com",
    resetFailed: "We couldn't update your password",
    resetInvalid: "This recovery link is invalid or has already been used. Request a new one.",
    resetRetry: "We couldn't change your password. Check your connection and try again.",
    turnstileNativeBody: "Open this flow from the Android build to complete the secure verification.",
    turnstileTitle: "Verification available in the mobile app",
    turnstileWebBody: "This CAPTCHA flow is verified inside the Android build. The internal console uses its own web access with MFA.",
    captchaConfig: { captcha_https_required: "Human verification requires an HTTPS address.", captcha_site_key_missing: "The public Turnstile key is missing." },
    authErrors: {
      access_failed: "We couldn't complete sign-in. Try again.", already_registered: "That email already has an account.", captcha_failed: "We couldn't complete the human verification. Try again.", delete_failed: "We couldn't delete the account. Try again or contact support.", delete_unconfirmed: "We couldn't confirm account deletion. Try again or contact support.", display_name_invalid: "Enter a name with at least 2 characters.", email_invalid: "Enter a valid email address.", email_not_authorized: "Email service is still in internal mode. Contact the Clean4Jesus team.", email_not_confirmed: "Confirm your email before signing in.", email_rate_limited: "Wait a moment before requesting another email.", email_send_failed: "We couldn't send the email. Try again in a few minutes.", invalid_credentials: "The email or password doesn't match.", password_recovery_invalid: "This recovery link is invalid or has already been used. Request a new one.", password_update_failed: "We couldn't change your password. Check your connection and try again.", reauthentication_failed: "The password doesn't match. Nothing was deleted.", sign_out_failed: "We couldn't sign you out. Try again.", weak_password: "Your password must contain at least 10 characters, one letter, and one number.",
    },
    sessionErrors: { offline_session_preserved: "You're offline. We kept your protected session on this device.", session_expired: "Your session expired. Sign in again.", session_verification_failed: "We couldn't verify the saved session." },
  },
  fr: {
    close: "Fermer",
    callbackFailed: "Impossible de vérifier le lien.",
    callbackMissing: "Le lien ne contient pas de code valide.",
    callbackRejected: "Le lien a été refusé ou a expiré. Demandez-en un nouveau.",
    emailPlaceholder: "vous@exemple.fr",
    resetFailed: "Impossible de mettre à jour le mot de passe",
    resetInvalid: "Ce lien de récupération est invalide ou a déjà été utilisé. Demandez-en un nouveau.",
    resetRetry: "Impossible de modifier le mot de passe. Vérifiez votre connexion et réessayez.",
    turnstileNativeBody: "Ouvrez ce parcours depuis la version Android pour effectuer la vérification sécurisée.",
    turnstileTitle: "Vérification disponible dans l'application mobile",
    turnstileWebBody: "Ce parcours CAPTCHA est validé dans la version Android. La console interne utilise son propre accès web avec MFA.",
    captchaConfig: { captcha_https_required: "La vérification humaine exige une adresse HTTPS.", captcha_site_key_missing: "La clé publique Turnstile n'est pas configurée." },
    authErrors: {
      access_failed: "Impossible de terminer la connexion. Réessayez.", already_registered: "Une compte existe déjà avec cette adresse.", captcha_failed: "Impossible de terminer la vérification humaine. Réessayez.", delete_failed: "Impossible de supprimer le compte. Réessayez ou contactez l'assistance.", delete_unconfirmed: "Impossible de confirmer la suppression. Réessayez ou contactez l'assistance.", display_name_invalid: "Saisissez un nom d'au moins 2 caractères.", email_invalid: "Saisissez une adresse e-mail valide.", email_not_authorized: "Le service e-mail est encore en mode interne. Contactez l'équipe Clean4Jesus.", email_not_confirmed: "Confirmez votre adresse e-mail avant de vous connecter.", email_rate_limited: "Patientez avant de demander un nouvel e-mail.", email_send_failed: "Impossible d'envoyer l'e-mail. Réessayez dans quelques minutes.", invalid_credentials: "L'adresse e-mail ou le mot de passe ne correspond pas.", password_recovery_invalid: "Ce lien de récupération est invalide ou déjà utilisé. Demandez-en un nouveau.", password_update_failed: "Impossible de modifier le mot de passe. Vérifiez votre connexion et réessayez.", reauthentication_failed: "Le mot de passe ne correspond pas. Rien n'a été supprimé.", sign_out_failed: "Impossible de vous déconnecter. Réessayez.", weak_password: "Le mot de passe doit contenir au moins 10 caractères, une lettre et un chiffre.",
    },
    sessionErrors: { offline_session_preserved: "Vous êtes hors ligne. Votre session protégée reste conservée sur cet appareil.", session_expired: "Votre session a expiré. Reconnectez-vous.", session_verification_failed: "Impossible de vérifier la session enregistrée." },
  },
  pt: {
    close: "Fechar",
    callbackFailed: "Não foi possível verificar o link.",
    callbackMissing: "O link não contém um código válido.",
    callbackRejected: "O link foi recusado ou expirou. Solicite um novo.",
    emailPlaceholder: "voce@exemplo.com",
    resetFailed: "Não foi possível atualizar a senha",
    resetInvalid: "Este link de recuperação é inválido ou já foi usado. Solicite um novo.",
    resetRetry: "Não foi possível alterar a senha. Verifique sua conexão e tente novamente.",
    turnstileNativeBody: "Abra este fluxo pelo build Android para concluir a verificação segura.",
    turnstileTitle: "Verificação disponível no aplicativo móvel",
    turnstileWebBody: "Este fluxo CAPTCHA é validado no build Android. O console interno usa seu próprio acesso web com MFA.",
    captchaConfig: { captcha_https_required: "A verificação humana exige um endereço HTTPS.", captcha_site_key_missing: "A chave pública do Turnstile não foi configurada." },
    authErrors: {
      access_failed: "Não foi possível concluir o acesso. Tente novamente.", already_registered: "Esse e-mail já possui uma conta.", captcha_failed: "Não foi possível concluir a verificação humana. Tente novamente.", delete_failed: "Não foi possível excluir a conta. Tente novamente ou fale com o suporte.", delete_unconfirmed: "Não foi possível confirmar a exclusão. Tente novamente ou fale com o suporte.", display_name_invalid: "Digite um nome com pelo menos 2 caracteres.", email_invalid: "Digite um e-mail válido.", email_not_authorized: "O serviço de e-mail ainda está em modo interno. Fale com a equipe Clean4Jesus.", email_not_confirmed: "Confirme seu e-mail antes de entrar.", email_rate_limited: "Aguarde um momento antes de solicitar outro e-mail.", email_send_failed: "Não foi possível enviar o e-mail. Tente novamente em alguns minutos.", invalid_credentials: "O e-mail ou a senha não conferem.", password_recovery_invalid: "Este link de recuperação é inválido ou já foi usado. Solicite um novo.", password_update_failed: "Não foi possível alterar a senha. Verifique sua conexão e tente novamente.", reauthentication_failed: "A senha não confere. Nada foi excluído.", sign_out_failed: "Não foi possível sair. Tente novamente.", weak_password: "A senha deve ter pelo menos 10 caracteres, uma letra e um número.",
    },
    sessionErrors: { offline_session_preserved: "Você está sem conexão. Mantivemos sua sessão protegida neste dispositivo.", session_expired: "Sua sessão expirou. Entre novamente.", session_verification_failed: "Não foi possível verificar a sessão salva." },
  },
} as const;

export function getAuthAuxText(language: SupportedLanguage) {
  return copy[language];
}

export function getAuthErrorMessage(error: unknown, language: SupportedLanguage, fallback: string) {
  const code = error && typeof error === "object" && "code" in error
    ? (error as { code?: AuthServiceErrorCode }).code
    : undefined;
  return code ? copy[language].authErrors[code] ?? fallback : fallback;
}

export function getAuthSessionErrorMessage(code: AuthSessionErrorCode | null, language: SupportedLanguage) {
  return code ? copy[language].sessionErrors[code] : null;
}

export function getCaptchaConfigurationMessage(code: "captcha_https_required" | "captcha_site_key_missing", language: SupportedLanguage) {
  return copy[language].captchaConfig[code];
}
