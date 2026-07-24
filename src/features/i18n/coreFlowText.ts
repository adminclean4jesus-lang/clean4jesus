import type { SupportedLanguage } from "./i18n";

const es = {
  "common.cancel": "Cancelar",
  "common.save": "Guardar",
  "common.restore": "Restaurar",
  "common.back": "Volver",
  "common.retry": "Intentar nuevamente",
  "pin.setup.eyebrow": "Seguridad",
  "pin.setup.title": "Crea tu PIN de protección",
  "pin.setup.subtitle": "Cuatro dígitos para proteger los cambios sensibles.",
  "pin.setup.confirm": "Confirma el PIN",
  "pin.setup.save": "Guardar PIN",
  "pin.setup.mismatch": "Los PIN no coinciden.",
  "pin.setup.invalid": "Escribe exactamente cuatro dígitos.",
  "pin.verify.eyebrow": "Protección",
  "pin.verify.title": "Confirma tu PIN",
  "pin.verify.subtitle": "Este cambio requiere el código de protección.",
  "pin.verify.action": "Verificar PIN",
  "pin.verify.invalid": "PIN incorrecto.",
  "interruption.eyebrow": "Interrupción",
  "interruption.title": "Tu motivo para volver",
  "interruption.subtitle": "Personaliza la pausa sin compartir esta información con nadie.",
  "interruption.message": "Mensaje de la pantalla de interrupción",
  "interruption.save": "Guardar pantalla",
  "interruption.restore": "Restaurar diseño original",
  "interruption.savedTitle": "Pantalla guardada",
  "interruption.savedBody": "La próxima interrupción usará este mensaje y esta imagen solo en tu teléfono.",
  "interruption.restoreTitle": "Restaurar pantalla",
  "interruption.restoreBody": "Se quitarán tu mensaje y tu imagen personalizados.",
  "interruption.restoredTitle": "Pantalla restaurada",
  "interruption.restoredBody": "Volvimos al diseño original de Clean4Jesus.",
  "interruption.privacy": "La imagen permanece en el almacenamiento privado de Clean4Jesus. No se sube a Comunidad ni a Supabase.",
  "auth.email": "Correo",
  "auth.password": "Contraseña",
  "auth.signIn": "Ingresar",
  "auth.signUp": "Crear cuenta",
  "auth.google": "Continuar con Google",
  "auth.orEmail": "o usa tu correo",
  "auth.forgot": "Olvidé mi contraseña",
  "auth.passwordHint": "Mínimo 10 caracteres",
  "auth.communityButton": "Entrar a comunidad",
  "auth.consent": "Al continuar aceptas el aviso de privacidad y las reglas de comunidad. Google solo se usa para verificar tu identidad.",
  "auth.privacy": "La sesión se conserva de forma privada en este dispositivo y puedes cerrarla desde Ajustes.",
  "auth.cardEyebrow": "Comunidad protegida",
  "auth.cardTitle": "Vuelve a caminar acompañado",
  "auth.cardBody": "Tu cuenta permite conservar testimonios, pedidos de oración y respuestas. Tu correo nunca se muestra en el feed.",
  "auth.reset.check": "Revisa las contraseñas",
  "auth.reset.match": "Las dos contraseñas deben coincidir.",
  "auth.reset.success": "Contraseña actualizada",
  "auth.reset.successBody": "Tu cuenta vuelve a estar protegida.",
  "auth.reset.verifying": "Verificando recuperación",
  "auth.reset.expired": "Esta recuperación venció, ya fue usada o no fue verificada por Clean4Jesus.",
  "auth.reset.title": "Crea una nueva contraseña",
  "auth.reset.body": "Usa al menos 10 caracteres y evita reutilizar una contraseña de otra aplicación.",
  "auth.reset.new": "Nueva contraseña",
  "auth.reset.confirm": "Confirmar contraseña",
  "auth.reset.saving": "Guardando...",
  "auth.reset.save": "Guardar contraseña",
  "auth.backCommunity": "Volver a Comunidad",
  "runtime.checking": "Estamos revisando tu versión",
  "runtime.checkingBody": "Queremos asegurarnos de que entres con una app compatible con la protección y la comunidad actuales.",
  "runtime.failed": "No pudimos validar tu versión",
  "runtime.yourVersion": "Tu versión",
  "runtime.retry": "Volver a comprobar",
  "runtime.updateHelp": "Instala la APK más reciente que te compartamos para continuar.",
} as const;

type CoreFlowKey = keyof typeof es;
type CoreFlowTable = Record<CoreFlowKey, string>;

const en: CoreFlowTable = {
  "common.cancel": "Cancel", "common.save": "Save", "common.restore": "Restore", "common.back": "Back", "common.retry": "Try again",
  "pin.setup.eyebrow": "Security", "pin.setup.title": "Create your protection PIN", "pin.setup.subtitle": "Four digits to protect sensitive changes.", "pin.setup.confirm": "Confirm PIN", "pin.setup.save": "Save PIN", "pin.setup.mismatch": "The PINs do not match.", "pin.setup.invalid": "Enter exactly four digits.",
  "pin.verify.eyebrow": "Protection", "pin.verify.title": "Confirm your PIN", "pin.verify.subtitle": "This change requires the protection code.", "pin.verify.action": "Verify PIN", "pin.verify.invalid": "Incorrect PIN.",
  "interruption.eyebrow": "Interruption", "interruption.title": "Your reason to return", "interruption.subtitle": "Personalize this pause without sharing it with anyone.", "interruption.message": "Interruption screen message", "interruption.save": "Save screen", "interruption.restore": "Restore original design", "interruption.savedTitle": "Screen saved", "interruption.savedBody": "The next interruption will use this message and image only on your phone.", "interruption.restoreTitle": "Restore screen", "interruption.restoreBody": "Your custom message and image will be removed.", "interruption.restoredTitle": "Screen restored", "interruption.restoredBody": "The original Clean4Jesus design is back.", "interruption.privacy": "The image stays in Clean4Jesus private storage. It is not uploaded to Community or Supabase.",
  "auth.email": "Email", "auth.password": "Password", "auth.signIn": "Sign in", "auth.signUp": "Create account", "auth.google": "Continue with Google", "auth.orEmail": "or use your email", "auth.forgot": "Forgot my password", "auth.passwordHint": "At least 10 characters", "auth.communityButton": "Enter community", "auth.consent": "By continuing, you accept the privacy notice and community guidelines. Google is used only to verify your identity.", "auth.privacy": "Your session is stored privately on this device and you can sign out from Settings.", "auth.cardEyebrow": "Protected community", "auth.cardTitle": "Walk with support again", "auth.cardBody": "Your account keeps your testimonies, prayer requests, and replies. Your email is never shown in the feed.",
  "auth.reset.check": "Check your passwords", "auth.reset.match": "Both passwords must match.", "auth.reset.success": "Password updated", "auth.reset.successBody": "Your account is protected again.", "auth.reset.verifying": "Verifying recovery", "auth.reset.expired": "This recovery link expired, was already used, or was not verified by Clean4Jesus.", "auth.reset.title": "Create a new password", "auth.reset.body": "Use at least 10 characters and avoid reusing a password from another app.", "auth.reset.new": "New password", "auth.reset.confirm": "Confirm password", "auth.reset.saving": "Saving...", "auth.reset.save": "Save password", "auth.backCommunity": "Back to Community",
  "runtime.checking": "Checking your version", "runtime.checkingBody": "We are making sure your app is compatible with the current protection and community.", "runtime.failed": "We could not validate your version", "runtime.yourVersion": "Your version", "runtime.retry": "Check again", "runtime.updateHelp": "Install the latest APK shared with you to continue.",
};

const fr: CoreFlowTable = {
  "common.cancel": "Annuler", "common.save": "Enregistrer", "common.restore": "Restaurer", "common.back": "Retour", "common.retry": "Réessayer",
  "pin.setup.eyebrow": "Sécurité", "pin.setup.title": "Créez votre PIN de protection", "pin.setup.subtitle": "Quatre chiffres pour protéger les changements sensibles.", "pin.setup.confirm": "Confirmer le PIN", "pin.setup.save": "Enregistrer le PIN", "pin.setup.mismatch": "Les PIN ne correspondent pas.", "pin.setup.invalid": "Saisissez exactement quatre chiffres.",
  "pin.verify.eyebrow": "Protection", "pin.verify.title": "Confirmez votre PIN", "pin.verify.subtitle": "Ce changement nécessite le code de protection.", "pin.verify.action": "Vérifier le PIN", "pin.verify.invalid": "PIN incorrect.",
  "interruption.eyebrow": "Interruption", "interruption.title": "Votre raison de revenir", "interruption.subtitle": "Personnalisez cette pause sans partager ces informations.", "interruption.message": "Message de l'écran d'interruption", "interruption.save": "Enregistrer l'écran", "interruption.restore": "Restaurer le design original", "interruption.savedTitle": "Écran enregistré", "interruption.savedBody": "La prochaine interruption utilisera ce message et cette image uniquement sur votre téléphone.", "interruption.restoreTitle": "Restaurer l'écran", "interruption.restoreBody": "Votre message et votre image personnalisés seront supprimés.", "interruption.restoredTitle": "Écran restauré", "interruption.restoredBody": "Le design original de Clean4Jesus est rétabli.", "interruption.privacy": "L'image reste dans le stockage privé de Clean4Jesus. Elle n'est envoyée ni à la Communauté ni à Supabase.",
  "auth.email": "E-mail", "auth.password": "Mot de passe", "auth.signIn": "Se connecter", "auth.signUp": "Créer un compte", "auth.google": "Continuer avec Google", "auth.orEmail": "ou utilisez votre e-mail", "auth.forgot": "Mot de passe oublié", "auth.passwordHint": "Au moins 10 caractères", "auth.communityButton": "Entrer dans la communauté", "auth.consent": "En continuant, vous acceptez l'avis de confidentialité et les règles de la communauté. Google sert uniquement à vérifier votre identité.", "auth.privacy": "Votre session est conservée de façon privée sur cet appareil et vous pouvez vous déconnecter depuis les Réglages.", "auth.cardEyebrow": "Communauté protégée", "auth.cardTitle": "Marchez de nouveau accompagné", "auth.cardBody": "Votre compte conserve vos témoignages, demandes de prière et réponses. Votre e-mail n'apparaît jamais dans le fil.",
  "auth.reset.check": "Vérifiez les mots de passe", "auth.reset.match": "Les deux mots de passe doivent correspondre.", "auth.reset.success": "Mot de passe mis à jour", "auth.reset.successBody": "Votre compte est de nouveau protégé.", "auth.reset.verifying": "Vérification de la récupération", "auth.reset.expired": "Ce lien a expiré, a déjà été utilisé ou n'a pas été vérifié par Clean4Jesus.", "auth.reset.title": "Créez un nouveau mot de passe", "auth.reset.body": "Utilisez au moins 10 caractères et évitez de réutiliser un mot de passe d'une autre application.", "auth.reset.new": "Nouveau mot de passe", "auth.reset.confirm": "Confirmer le mot de passe", "auth.reset.saving": "Enregistrement...", "auth.reset.save": "Enregistrer le mot de passe", "auth.backCommunity": "Retour à la Communauté",
  "runtime.checking": "Vérification de votre version", "runtime.checkingBody": "Nous vérifions que votre application est compatible avec la protection et la communauté actuelles.", "runtime.failed": "Impossible de valider votre version", "runtime.yourVersion": "Votre version", "runtime.retry": "Vérifier à nouveau", "runtime.updateHelp": "Installez le dernier APK qui vous a été partagé pour continuer.",
};

const pt: CoreFlowTable = {
  "common.cancel": "Cancelar", "common.save": "Salvar", "common.restore": "Restaurar", "common.back": "Voltar", "common.retry": "Tentar novamente",
  "pin.setup.eyebrow": "Segurança", "pin.setup.title": "Crie seu PIN de proteção", "pin.setup.subtitle": "Quatro dígitos para proteger alterações sensíveis.", "pin.setup.confirm": "Confirmar PIN", "pin.setup.save": "Salvar PIN", "pin.setup.mismatch": "Os PINs não coincidem.", "pin.setup.invalid": "Digite exatamente quatro números.",
  "pin.verify.eyebrow": "Proteção", "pin.verify.title": "Confirme seu PIN", "pin.verify.subtitle": "Esta alteração exige o código de proteção.", "pin.verify.action": "Verificar PIN", "pin.verify.invalid": "PIN incorreto.",
  "interruption.eyebrow": "Interrupção", "interruption.title": "Seu motivo para voltar", "interruption.subtitle": "Personalize esta pausa sem compartilhar essas informações.", "interruption.message": "Mensagem da tela de interrupção", "interruption.save": "Salvar tela", "interruption.restore": "Restaurar design original", "interruption.savedTitle": "Tela salva", "interruption.savedBody": "A próxima interrupção usará esta mensagem e imagem somente no seu telefone.", "interruption.restoreTitle": "Restaurar tela", "interruption.restoreBody": "Sua mensagem e imagem personalizadas serão removidas.", "interruption.restoredTitle": "Tela restaurada", "interruption.restoredBody": "O design original do Clean4Jesus foi restaurado.", "interruption.privacy": "A imagem fica no armazenamento privado do Clean4Jesus. Ela não é enviada à Comunidade nem ao Supabase.",
  "auth.email": "E-mail", "auth.password": "Senha", "auth.signIn": "Entrar", "auth.signUp": "Criar conta", "auth.google": "Continuar com Google", "auth.orEmail": "ou use seu e-mail", "auth.forgot": "Esqueci minha senha", "auth.passwordHint": "No mínimo 10 caracteres", "auth.communityButton": "Entrar na comunidade", "auth.consent": "Ao continuar, você aceita o aviso de privacidade e as regras da comunidade. O Google é usado somente para verificar sua identidade.", "auth.privacy": "Sua sessão fica armazenada de forma privada neste dispositivo e você pode sair em Configurações.", "auth.cardEyebrow": "Comunidade protegida", "auth.cardTitle": "Volte a caminhar acompanhado", "auth.cardBody": "Sua conta mantém testemunhos, pedidos de oração e respostas. Seu e-mail nunca aparece no feed.",
  "auth.reset.check": "Confira as senhas", "auth.reset.match": "As duas senhas devem coincidir.", "auth.reset.success": "Senha atualizada", "auth.reset.successBody": "Sua conta está protegida novamente.", "auth.reset.verifying": "Verificando recuperação", "auth.reset.expired": "Este link expirou, já foi usado ou não foi verificado pelo Clean4Jesus.", "auth.reset.title": "Crie uma nova senha", "auth.reset.body": "Use pelo menos 10 caracteres e evite reutilizar a senha de outro aplicativo.", "auth.reset.new": "Nova senha", "auth.reset.confirm": "Confirmar senha", "auth.reset.saving": "Salvando...", "auth.reset.save": "Salvar senha", "auth.backCommunity": "Voltar à Comunidade",
  "runtime.checking": "Verificando sua versão", "runtime.checkingBody": "Estamos confirmando que seu aplicativo é compatível com a proteção e a comunidade atuais.", "runtime.failed": "Não foi possível validar sua versão", "runtime.yourVersion": "Sua versão", "runtime.retry": "Verificar novamente", "runtime.updateHelp": "Instale o APK mais recente compartilhado com você para continuar.",
};

const tables: Record<SupportedLanguage, CoreFlowTable> = { es, en, fr, pt };

export function coreFlowText(language: SupportedLanguage, key: CoreFlowKey) {
  return tables[language][key];
}

export type { CoreFlowKey };
