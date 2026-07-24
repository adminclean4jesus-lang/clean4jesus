import type { SupportedLanguage } from "./i18n";

const copy = {
  es: {
    security: "Seguridad", createTitle: "Crea tu PIN de protección", changeTitle: "Cambia el PIN de protección",
    setupBody: "Cuatro dígitos que idealmente conserva tu persona de confianza.", newPin: "Nuevo PIN",
    guardianHint: "Lo ideal es que este PIN lo conserve tu persona de confianza.", currentPin: "PIN actual",
    confirmPin: "Confirmar PIN", confirmNewPin: "Confirmar nuevo PIN", saving: "Guardando...", save: "Guardar PIN",
    incompleteTitle: "PIN incompleto", incompleteBody: "El PIN debe tener exactamente 4 dígitos.",
    mismatchTitle: "No coincide", mismatchBody: "Confirma el mismo PIN para guardarlo.",
    currentInvalidTitle: "PIN actual incorrecto", currentInvalidBody: "Pídele a tu persona de confianza que confirme el PIN vigente.",
    verifyTitle: "Verifica tu PIN", verifyBody: "Este paso te ayuda a elegir con claridad, no por impulso.",
    accessPin: "PIN de acceso", verifyHint: "Confirma tu identidad antes de cambiar el estado del refugio.", verify: "Verificar",
    lockedTitle: "PIN temporalmente bloqueado", wrongTitle: "PIN incorrecto", retry: "Inténtalo de nuevo.",
    wait: (seconds: number) => `Espera ${seconds} segundos antes de intentarlo de nuevo.`,
  },
  en: {
    security: "Security", createTitle: "Create your protection PIN", changeTitle: "Change your protection PIN",
    setupBody: "Four digits ideally kept by your trusted person.", newPin: "New PIN",
    guardianHint: "Ideally, your trusted person should keep this PIN.", currentPin: "Current PIN",
    confirmPin: "Confirm PIN", confirmNewPin: "Confirm new PIN", saving: "Saving...", save: "Save PIN",
    incompleteTitle: "Incomplete PIN", incompleteBody: "The PIN must contain exactly 4 digits.",
    mismatchTitle: "PINs do not match", mismatchBody: "Enter the same PIN again to save it.",
    currentInvalidTitle: "Incorrect current PIN", currentInvalidBody: "Ask your trusted person to confirm the current PIN.",
    verifyTitle: "Verify your PIN", verifyBody: "This step helps you choose clearly, not on impulse.",
    accessPin: "Access PIN", verifyHint: "Confirm your identity before changing the refuge status.", verify: "Verify",
    lockedTitle: "PIN temporarily locked", wrongTitle: "Incorrect PIN", retry: "Try again.",
    wait: (seconds: number) => `Wait ${seconds} seconds before trying again.`,
  },
  fr: {
    security: "Sécurité", createTitle: "Créez votre PIN de protection", changeTitle: "Modifiez votre PIN de protection",
    setupBody: "Quatre chiffres, idéalement conservés par votre personne de confiance.", newPin: "Nouveau PIN",
    guardianHint: "Idéalement, votre personne de confiance conserve ce PIN.", currentPin: "PIN actuel",
    confirmPin: "Confirmer le PIN", confirmNewPin: "Confirmer le nouveau PIN", saving: "Enregistrement...", save: "Enregistrer le PIN",
    incompleteTitle: "PIN incomplet", incompleteBody: "Le PIN doit contenir exactement 4 chiffres.",
    mismatchTitle: "Les PIN ne correspondent pas", mismatchBody: "Saisissez le même PIN pour l'enregistrer.",
    currentInvalidTitle: "PIN actuel incorrect", currentInvalidBody: "Demandez à votre personne de confiance de confirmer le PIN actuel.",
    verifyTitle: "Vérifiez votre PIN", verifyBody: "Cette étape vous aide à choisir avec clarté, sans impulsivité.",
    accessPin: "PIN d'accès", verifyHint: "Confirmez votre identité avant de modifier l'état du refuge.", verify: "Vérifier",
    lockedTitle: "PIN temporairement bloqué", wrongTitle: "PIN incorrect", retry: "Réessayez.",
    wait: (seconds: number) => `Attendez ${seconds} secondes avant de réessayer.`,
  },
  pt: {
    security: "Segurança", createTitle: "Crie seu PIN de proteção", changeTitle: "Altere seu PIN de proteção",
    setupBody: "Quatro dígitos, idealmente guardados por sua pessoa de confiança.", newPin: "Novo PIN",
    guardianHint: "O ideal é que sua pessoa de confiança guarde este PIN.", currentPin: "PIN atual",
    confirmPin: "Confirmar PIN", confirmNewPin: "Confirmar novo PIN", saving: "Salvando...", save: "Salvar PIN",
    incompleteTitle: "PIN incompleto", incompleteBody: "O PIN deve ter exatamente 4 dígitos.",
    mismatchTitle: "Os PINs não coincidem", mismatchBody: "Digite o mesmo PIN novamente para salvá-lo.",
    currentInvalidTitle: "PIN atual incorreto", currentInvalidBody: "Peça à sua pessoa de confiança para confirmar o PIN atual.",
    verifyTitle: "Verifique seu PIN", verifyBody: "Esta etapa ajuda você a escolher com clareza, não por impulso.",
    accessPin: "PIN de acesso", verifyHint: "Confirme sua identidade antes de alterar o estado do refúgio.", verify: "Verificar",
    lockedTitle: "PIN temporariamente bloqueado", wrongTitle: "PIN incorreto", retry: "Tente novamente.",
    wait: (seconds: number) => `Aguarde ${seconds} segundos antes de tentar novamente.`,
  },
} as const;

export function getPinText(language: SupportedLanguage) {
  return copy[language];
}
