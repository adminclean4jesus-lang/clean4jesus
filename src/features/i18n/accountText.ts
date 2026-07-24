import type { SupportedLanguage } from "@/features/i18n/i18n";

const es = {
  accountCommunity: "Cuenta y comunidad",
  connectionPending: "Conexión pendiente",
  connectionPendingBody: "La estructura segura ya está lista. Falta enlazar las credenciales públicas del proyecto Supabase.",
  portableSpace: "Tu espacio puede viajar contigo",
  portableSpaceBody: "Inicia sesión para participar en la comunidad. El escudo y tus lecturas locales siguen funcionando sin cuenta.",
  enterCommunity: "Ingresar desde Comunidad",
  loadingProfile: "Cargando perfil...",
  unavailableProfile: "Perfil no disponible",
  myProfile: "Mi perfil",
  loadErrorTitle: "No pudimos cargar tus datos",
  loadErrorBody: "Tu perfil no se puede editar hasta recuperarlos.",
  retry: "Reintentar",
  privacyBody: "Tu correo es privado. En la comunidad solo se muestran el nombre, la ciudad y la biografía que decidas compartir.",
  editProfile: "Editar perfil",
  signOutShort: "Salir",
  deleteMyAccount: "Eliminar mi cuenta",
  publicIdentity: "Identidad pública",
  closeEditor: "Cerrar editor",
  displayName: "Nombre visible",
  optionalCity: "Ciudad (opcional)",
  optionalBio: "Biografía (opcional)",
  saving: "Guardando...",
  saveProfile: "Guardar perfil",
  irreversibleAction: "Acción irreversible",
  deleteAccount: "Eliminar cuenta",
  closeDeletion: "Cerrar eliminación",
  deleteBody: "Se borrarán tu cuenta, perfil, publicaciones, comentarios y apoyos. Los reportes y registros de moderación ya creados pueden conservar copias del contenido, identificadores y decisiones para seguridad y auditoría. Tu escudo y lecturas locales no se borran.",
  deleteToken: "ELIMINAR",
  typeDeleteToken: "Escribe ELIMINAR",
  currentPassword: "Contraseña actual",
  deleting: "Eliminando...",
  deletePermanently: "Eliminar definitivamente",
  reviewNameTitle: "Revisa tu nombre",
  reviewNameBody: "El nombre visible debe tener al menos 2 caracteres.",
  profileUpdatedTitle: "Perfil actualizado",
  profileUpdatedBody: "Tu identidad visible en la comunidad quedó guardada.",
  saveErrorTitle: "No pudimos guardar",
  tryAgain: "Intenta nuevamente.",
  signOutTitle: "Cerrar sesión",
  signOutBody: "La protección local seguirá activa. Solo saldrás de la comunidad.",
  cancel: "Cancelar",
  signOutAction: "Cerrar sesión",
  signOutErrorTitle: "No pudimos salir",
  missingConfirmationTitle: "Falta confirmar",
  missingConfirmationBody: "Escribe {token} y tu contraseña actual.",
  deletedTitle: "Cuenta eliminada",
  deletedBody: "Tu cuenta y perfil público fueron eliminados. Los registros de moderación previos pueden conservar copias del contenido, identificadores y decisiones de seguridad. La protección local permanece en el dispositivo.",
  deleteErrorTitle: "No se eliminó la cuenta",
};

export type AccountText = typeof es;

const en: AccountText = {
  accountCommunity: "Account and community", connectionPending: "Connection pending", connectionPendingBody: "The secure structure is ready. The public Supabase project credentials still need to be connected.", portableSpace: "Your space can travel with you", portableSpaceBody: "Sign in to join the community. Your shield and local readings keep working without an account.", enterCommunity: "Sign in from Community", loadingProfile: "Loading profile...", unavailableProfile: "Profile unavailable", myProfile: "My profile", loadErrorTitle: "We couldn't load your data", loadErrorBody: "Your profile cannot be edited until the data is recovered.", retry: "Try again", privacyBody: "Your email is private. The community only shows the name, city, and bio you choose to share.", editProfile: "Edit profile", signOutShort: "Sign out", deleteMyAccount: "Delete my account", publicIdentity: "Public identity", closeEditor: "Close editor", displayName: "Display name", optionalCity: "City (optional)", optionalBio: "Bio (optional)", saving: "Saving...", saveProfile: "Save profile", irreversibleAction: "Irreversible action", deleteAccount: "Delete account", closeDeletion: "Close deletion", deleteBody: "Your account, profile, posts, comments, and support activity will be deleted. Existing reports and moderation records may retain copies of content, identifiers, and decisions for security and auditing. Your shield and local readings will not be deleted.", deleteToken: "DELETE", typeDeleteToken: "Type DELETE", currentPassword: "Current password", deleting: "Deleting...", deletePermanently: "Delete permanently", reviewNameTitle: "Check your name", reviewNameBody: "Your display name must contain at least 2 characters.", profileUpdatedTitle: "Profile updated", profileUpdatedBody: "Your public community identity has been saved.", saveErrorTitle: "We couldn't save", tryAgain: "Please try again.", signOutTitle: "Sign out", signOutBody: "Local protection will remain active. You will only leave the community.", cancel: "Cancel", signOutAction: "Sign out", signOutErrorTitle: "We couldn't sign you out", missingConfirmationTitle: "Confirmation required", missingConfirmationBody: "Type {token} and your current password.", deletedTitle: "Account deleted", deletedBody: "Your account and public profile were deleted. Previous moderation records may retain copies of content, identifiers, and security decisions. Local protection remains on this device.", deleteErrorTitle: "The account was not deleted",
};

const fr: AccountText = {
  accountCommunity: "Compte et communauté", connectionPending: "Connexion en attente", connectionPendingBody: "La structure sécurisée est prête. Il reste à connecter les identifiants publics du projet Supabase.", portableSpace: "Ton espace peut voyager avec toi", portableSpaceBody: "Connecte-toi pour participer à la communauté. Ton bouclier et tes lectures locales continuent de fonctionner sans compte.", enterCommunity: "Se connecter depuis Communauté", loadingProfile: "Chargement du profil...", unavailableProfile: "Profil indisponible", myProfile: "Mon profil", loadErrorTitle: "Nous n'avons pas pu charger tes données", loadErrorBody: "Ton profil ne peut pas être modifié avant leur récupération.", retry: "Réessayer", privacyBody: "Ton adresse e-mail reste privée. La communauté affiche seulement le nom, la ville et la biographie que tu choisis de partager.", editProfile: "Modifier le profil", signOutShort: "Déconnexion", deleteMyAccount: "Supprimer mon compte", publicIdentity: "Identité publique", closeEditor: "Fermer l'éditeur", displayName: "Nom affiché", optionalCity: "Ville (facultatif)", optionalBio: "Biographie (facultatif)", saving: "Enregistrement...", saveProfile: "Enregistrer le profil", irreversibleAction: "Action irréversible", deleteAccount: "Supprimer le compte", closeDeletion: "Fermer la suppression", deleteBody: "Ton compte, ton profil, tes publications, tes commentaires et tes soutiens seront supprimés. Les signalements et journaux de modération existants peuvent conserver des copies du contenu, des identifiants et des décisions à des fins de sécurité et d'audit. Ton bouclier et tes lectures locales ne seront pas supprimés.", deleteToken: "SUPPRIMER", typeDeleteToken: "Écris SUPPRIMER", currentPassword: "Mot de passe actuel", deleting: "Suppression...", deletePermanently: "Supprimer définitivement", reviewNameTitle: "Vérifie ton nom", reviewNameBody: "Le nom affiché doit comporter au moins 2 caractères.", profileUpdatedTitle: "Profil mis à jour", profileUpdatedBody: "Ton identité visible dans la communauté a été enregistrée.", saveErrorTitle: "Enregistrement impossible", tryAgain: "Réessaie.", signOutTitle: "Se déconnecter", signOutBody: "La protection locale restera active. Tu quitteras seulement la communauté.", cancel: "Annuler", signOutAction: "Se déconnecter", signOutErrorTitle: "Déconnexion impossible", missingConfirmationTitle: "Confirmation requise", missingConfirmationBody: "Écris {token} et ton mot de passe actuel.", deletedTitle: "Compte supprimé", deletedBody: "Ton compte et ton profil public ont été supprimés. Les anciens journaux de modération peuvent conserver des copies du contenu, des identifiants et des décisions de sécurité. La protection locale reste sur cet appareil.", deleteErrorTitle: "Le compte n'a pas été supprimé",
};

const pt: AccountText = {
  accountCommunity: "Conta e comunidade", connectionPending: "Conexão pendente", connectionPendingBody: "A estrutura segura está pronta. Falta conectar as credenciais públicas do projeto Supabase.", portableSpace: "Seu espaço pode viajar com você", portableSpaceBody: "Entre para participar da comunidade. Seu escudo e suas leituras locais continuam funcionando sem uma conta.", enterCommunity: "Entrar pela Comunidade", loadingProfile: "Carregando perfil...", unavailableProfile: "Perfil indisponível", myProfile: "Meu perfil", loadErrorTitle: "Não conseguimos carregar seus dados", loadErrorBody: "Seu perfil não pode ser editado até que os dados sejam recuperados.", retry: "Tentar novamente", privacyBody: "Seu e-mail é privado. A comunidade mostra apenas o nome, a cidade e a biografia que você decidir compartilhar.", editProfile: "Editar perfil", signOutShort: "Sair", deleteMyAccount: "Excluir minha conta", publicIdentity: "Identidade pública", closeEditor: "Fechar editor", displayName: "Nome de exibição", optionalCity: "Cidade (opcional)", optionalBio: "Biografia (opcional)", saving: "Salvando...", saveProfile: "Salvar perfil", irreversibleAction: "Ação irreversível", deleteAccount: "Excluir conta", closeDeletion: "Fechar exclusão", deleteBody: "Sua conta, perfil, publicações, comentários e apoios serão excluídos. Denúncias e registros de moderação existentes podem manter cópias do conteúdo, identificadores e decisões para segurança e auditoria. Seu escudo e suas leituras locais não serão excluídos.", deleteToken: "EXCLUIR", typeDeleteToken: "Digite EXCLUIR", currentPassword: "Senha atual", deleting: "Excluindo...", deletePermanently: "Excluir definitivamente", reviewNameTitle: "Revise seu nome", reviewNameBody: "O nome de exibição deve ter pelo menos 2 caracteres.", profileUpdatedTitle: "Perfil atualizado", profileUpdatedBody: "Sua identidade visível na comunidade foi salva.", saveErrorTitle: "Não conseguimos salvar", tryAgain: "Tente novamente.", signOutTitle: "Sair", signOutBody: "A proteção local continuará ativa. Você sairá apenas da comunidade.", cancel: "Cancelar", signOutAction: "Sair", signOutErrorTitle: "Não conseguimos encerrar a sessão", missingConfirmationTitle: "Confirmação necessária", missingConfirmationBody: "Digite {token} e sua senha atual.", deletedTitle: "Conta excluída", deletedBody: "Sua conta e seu perfil público foram excluídos. Registros anteriores de moderação podem manter cópias do conteúdo, identificadores e decisões de segurança. A proteção local permanece neste dispositivo.", deleteErrorTitle: "A conta não foi excluída",
};

const copies: Record<SupportedLanguage, AccountText> = { en, es, fr, pt };

export function getAccountText(language: SupportedLanguage): AccountText {
  return copies[language];
}

export function formatAccountText(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce((result, [key, value]) => result.replaceAll(`{${key}}`, value), template);
}
