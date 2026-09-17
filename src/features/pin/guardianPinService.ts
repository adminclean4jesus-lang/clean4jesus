import { getSupabaseClient } from "@/lib/supabase";

import { savePinHash } from "./pinService";

export type GuardianPinRequestStatus = {
  expiresAt: string | null;
  status: "none" | "pending" | "confirmed" | "cancelled" | "expired";
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function requestGuardianPin(email: string): Promise<GuardianPinRequestStatus> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!emailPattern.test(normalizedEmail) || normalizedEmail.length > 320) throw new Error("invalid_guardian_email");
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
  if (error || !data || typeof data !== "object") throw new Error("guardian_pin_request_failed");
  const response = data as Partial<GuardianPinRequestStatus>;
  if (!isStatus(response.status)) throw new Error("guardian_pin_response_invalid");
  return { expiresAt: typeof response.expiresAt === "string" ? response.expiresAt : null, status: response.status };
}

function isStatus(value: unknown): value is GuardianPinRequestStatus["status"] {
  return value === "none" || value === "pending" || value === "confirmed" || value === "cancelled" || value === "expired";
}
