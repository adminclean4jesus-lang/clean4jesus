import { supabase } from "./supabase";

export type ModeratorRole = "admin" | "moderator";
export type CaseStatus = "dismissed" | "in_review" | "pending" | "resolved";
export type ModerationAction = "claim" | "hide_content" | "resolve_no_action" | "restore_content";
export type FalsePositiveReviewStatus = "confirmed_false_positive" | "in_review" | "kept_blocked" | "needs_evidence" | "pending";
export type FalsePositiveReviewAction = "claim" | "confirm_false_positive" | "keep_blocked" | "needs_evidence";

export type ModerationCase = {
  assigned_to: string | null;
  content_snapshot: string;
  created_at: string;
  id: string;
  reason_snapshot: string;
  report_count: number;
  status: CaseStatus;
  target_id: string;
  target_type: "comment" | "post";
  title_snapshot: string | null;
  version: number;
};

export type FalsePositiveReviewCase = {
  app_package: string;
  first_reported_at: string;
  id: string;
  last_reported_at: string;
  locale: "en" | "es" | "fr" | "pt";
  report_count: number;
  review_note: string | null;
  reviewed_at: string | null;
  rule_fingerprint: string;
  status: FalsePositiveReviewStatus;
  version: number;
};

export async function getModeratorAccess() {
  const { data, error } = await supabase.rpc("get_my_community_moderation_access");
  if (error) throw new Error(mapError(error.message));
  const access = data?.[0] as { assurance_level: string; role: ModeratorRole } | undefined;
  if (!access) throw new Error("Tu cuenta no tiene acceso a moderacion.");
  return access;
}

export async function listCases(status: CaseStatus) {
  const { data, error } = await supabase.functions.invoke("moderate-community", {
    body: { operation: "list", status },
  });
  if (error) throw new Error(await readFunctionError(error));
  return (data?.cases ?? []) as ModerationCase[];
}

export async function applyAction(moderationCase: ModerationCase, action: ModerationAction, note: string) {
  const { data, error } = await supabase.functions.invoke("moderate-community", {
    body: {
      action,
      caseId: moderationCase.id,
      expectedVersion: moderationCase.version,
      note,
      operation: "act",
      requestId: crypto.randomUUID(),
    },
  });
  if (error) throw new Error(await readFunctionError(error));
  return data?.result;
}

export async function listFalsePositiveCases(status: FalsePositiveReviewStatus) {
  const { data, error } = await supabase.functions.invoke("moderate-community", {
    body: { operation: "false_positive_list", status },
  });
  if (error) throw new Error(await readFunctionError(error));
  return (data?.cases ?? []) as FalsePositiveReviewCase[];
}

export async function applyFalsePositiveAction(
  reviewCase: FalsePositiveReviewCase,
  action: FalsePositiveReviewAction,
  note: string,
) {
  const { data, error } = await supabase.functions.invoke("moderate-community", {
    body: {
      action,
      caseId: reviewCase.id,
      expectedVersion: reviewCase.version,
      note,
      operation: "false_positive_act",
      requestId: crypto.randomUUID(),
    },
  });
  if (error) throw new Error(await readFunctionError(error));
  return data?.result;
}

async function readFunctionError(error: unknown) {
  if (error && typeof error === "object" && "context" in error) {
    const response = (error as { context?: unknown }).context;
    if (response instanceof Response) {
      try {
        const body = await response.clone().json() as { error?: string };
        if (body.error) return mapError(body.error);
      } catch {
        // Use the safe fallback below.
      }
    }
  }
  return "No pudimos completar la operacion de moderacion.";
}

function mapError(message: string) {
  if (message.includes("moderator_mfa_required")) return "Confirma tu codigo MFA para continuar.";
  if (message.includes("moderator_required")) return "Tu cuenta no tiene acceso a moderacion.";
  if (message.includes("version_conflict")) return "Otro moderador actualizo este caso. Recarga la cola.";
  if (message.includes("content_not_available")) return "El contenido ya no esta disponible.";
  if (message.includes("admin_mfa_required")) return "Restaurar exige una cuenta administradora con MFA.";
  if (message.includes("admin_required_for_false_positive_confirmation")) return "Confirmar un falso positivo exige una cuenta administradora con MFA.";
  if (message.includes("admin_required_to_keep_blocked")) return "Cerrar un caso como bloqueo correcto exige una cuenta administradora con MFA.";
  if (message.includes("invalid_false_positive_review_status")) return "El estado solicitado no es válido.";
  return "No pudimos completar la operacion de moderacion.";
}
