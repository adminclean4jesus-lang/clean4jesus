import { getSupabaseClient } from "@/lib/supabase";

import { savePinHash } from "./pinService";

export type GuardianPinRequestStatus = {
  expiresAt: string | null;
  status: "none" | "pending" | "confirmed" | "cancelled" | "expired";
};

export type GuardianPinErrorCode =
  | "sign_in_required"
  | "invalid_email"
  | "backend_not_ready"
  | "email_delivery_not_configured"
  | "email_delivery_failed"
  | "rate_limited"
  | "request_failed";

export class GuardianPinError extends Error {
  constructor(readonly code: GuardianPinErrorCode) {
    super(code);
    this.name = "GuardianPinError";
  }
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function requestGuardianPin(email: string): Promise<GuardianPinRequestStatus> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!emailPattern.test(normalizedEmail) || normalizedEmail.length > 320) throw new Error("invalid_guardian_email");
  const { data } = await getSupabaseClient().auth.getSession();
  if (!data.session) throw new GuardianPinError("sign_in_required");
  return invokeStatus("requestGuardianPin", { email: normalizedEmail });
}

export async function getGuardianPinRequestStatus(): Promise<GuardianPinRequestStatus> {
  return invokeStatus("getGuardianPinStatus");
}

export async function cancelGuardianPinRequest(): Promise<void> {
  await invokeStatus("cancelGuardianPin");
}

/** Returns true only after a confirmed verifier is safely synced to the device. */
export async function syncConfirmedGuardianPin(): Promise<boolean> {
  const { data, error } = await getSupabaseClient().functions.invoke("accountability", {
    body: { operation: "getGuardianPinStatus", includePinHash: true },
  });
  if (error || !data || typeof data !== "object") throw new Error("guardian_pin_status_unavailable");
  const response = data as GuardianPinRequestStatus & { pinHash?: unknown };
  if (response.status !== "confirmed" || typeof response.pinHash !== "string") return false;
  await savePinHash(response.pinHash);
  return true;
}

async function invokeStatus(operation: string, extra: Record<string, unknown> = {}) {
  const { data, error } = await getSupabaseClient().functions.invoke("accountability", { body: { operation, ...extra } });
  if (error || !data || typeof data !== "object") throw new GuardianPinError(await errorCode(error));
  const response = data as Partial<GuardianPinRequestStatus>;
  if (!isStatus(response.status)) throw new Error("guardian_pin_response_invalid");
  return { expiresAt: typeof response.expiresAt === "string" ? response.expiresAt : null, status: response.status };
}

async function errorCode(error: unknown): Promise<GuardianPinErrorCode> {
  const response = typeof error === "object" && error !== null && "context" in error ? (error as { context?: unknown }).context : null;
  const backendCode = await readBackendErrorCode(response);
  if (backendCode === "missing_authorization" || backendCode === "invalid_session") return "sign_in_required";
  if (backendCode === "invalid_guardian_email") return "invalid_email";
  if (backendCode === "guardian_pin_backend_not_ready" || backendCode === "accountability_operation_failed" || backendCode === "unsupported_operation") return "backend_not_ready";
  if (backendCode === "email_delivery_not_configured") return "email_delivery_not_configured";
  if (backendCode === "email_delivery_failed") return "email_delivery_failed";
  if (backendCode === "guardian_pin_request_rate_limited") return "rate_limited";
  return "request_failed";
}

async function readBackendErrorCode(response: unknown): Promise<string | null> {
  if (!response || typeof response !== "object") return null;
  try {
    const clone = "clone" in response && typeof response.clone === "function"
      ? response.clone()
      : response;
    if ("json" in clone && typeof clone.json === "function") {
      const body = await clone.json() as { error?: unknown };
      return typeof body?.error === "string" ? body.error : null;
    }
  } catch { /* try text fallback */ }
  try {
    if ("text" in response && typeof response.text === "function") {
      const raw = await response.text();
      const body = JSON.parse(raw) as { error?: unknown };
      return typeof body?.error === "string" ? body.error : null;
    }
  } catch { /* fall through */ }
  return null;
}

function isStatus(value: unknown): value is GuardianPinRequestStatus["status"] {
  return value === "none" || value === "pending" || value === "confirmed" || value === "cancelled" || value === "expired";
}
