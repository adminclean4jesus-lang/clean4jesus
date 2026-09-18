import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.5";

// Deploy with --no-verify-jwt; this handler verifies the user session with Auth.

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Origin": "*",
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const pushTokenPattern = /^(ExponentPushToken|ExpoPushToken)\[[A-Za-z0-9_-]+\]$/;

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const authorization = request.headers.get("Authorization");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const publishableKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY");
  if (!authorization?.startsWith("Bearer ")) return json({ error: "missing_authorization" }, 401);
  if (!supabaseUrl || !publishableKey) return json({ error: "server_misconfigured" }, 500);

  const client = createClient(supabaseUrl, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: authorization } },
  });
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) return json({ error: "invalid_session" }, 401);

  const body = await readObject(request);
  if (!body || typeof body.operation !== "string") return json({ error: "invalid_request" }, 400);

  if (body.operation === "create") {
    if (!hasOnlyKeys(body, ["operation", "consentVersion"]) || body.consentVersion !== 1) {
      return json({ error: "invalid_consent" }, 400);
    }
    const { data, error } = await client.rpc("create_accountability_relationship", {
      p_consent_version: body.consentVersion,
    });
    if (error) return databaseError(error);
    const created = data?.[0];
    return json({
      relationshipId: created?.relationship_id,
      shareCode: created?.share_code,
      expiresAt: created?.expires_at,
    }, 201);
  }

  if (body.operation === "accept") {
    if (
      !hasOnlyKeys(body, ["operation", "shareCode", "consentVersion"])
      || typeof body.shareCode !== "string"
      || !/^[A-Fa-f0-9]{20}$/.test(body.shareCode.trim())
      || body.consentVersion !== 1
    ) return json({ error: "invalid_acceptance" }, 400);
    const { data, error } = await client.rpc("accept_accountability_relationship", {
      p_share_code: body.shareCode,
      p_consent_version: body.consentVersion,
    });
    if (error) return databaseError(error);
    return json({ relationshipId: data }, 200);
  }

  if (body.operation === "sendInviteEmail") {
    if (
      !hasOnlyKeys(body, ["operation", "relationshipId", "email", "shareCode"])
      || typeof body.relationshipId !== "string"
      || !uuidPattern.test(body.relationshipId)
      || typeof body.email !== "string"
      || body.email.trim().length > 320
      || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())
      || typeof body.shareCode !== "string"
      || !/^[A-Fa-f0-9]{20}$/.test(body.shareCode.trim())
    ) return json({ error: "invalid_invite_email" }, 400);

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const from = Deno.env.get("ACCOUNTABILITY_FROM_EMAIL");
    if (!resendKey || !from) return json({ error: "email_delivery_not_configured" }, 503);

    const { data: canSend, error: validationError } = await client.rpc("validate_accountability_invite_delivery", {
      p_relationship_id: body.relationshipId,
      p_share_code: body.shareCode.trim().toUpperCase(),
    });
    if (validationError) return databaseError(validationError);
    if (canSend !== true) return json({ error: "invite_not_available" }, 403);

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: [body.email.trim().toLowerCase()],
          subject: "Invitación para acompañar en Clean4Jesus",
          text: `Te invitaron a ser persona de confianza en Clean4Jesus. Crea o inicia sesión en la aplicación y usa este código de una sola vez: ${body.shareCode.trim().toUpperCase()}. El código expira en 24 horas.`,
        }),
      });
      if (!response.ok) return json({ error: "email_delivery_failed" }, 502);
      return json({ sent: true }, 202);
    } catch {
      return json({ error: "email_delivery_failed" }, 502);
    }
  }

  if (body.operation === "requestGuardianPin") {
    if (
      !hasOnlyKeys(body, ["operation", "email"])
      || typeof body.email !== "string"
      || body.email.trim().length > 320
      || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())
    ) return json({ error: "invalid_guardian_email" }, 400);
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const from = Deno.env.get("ACCOUNTABILITY_FROM_EMAIL");
    if (!resendKey || !from) return json({ error: "email_delivery_not_configured" }, 503);
    const token = createUrlToken();
    const tokenHash = `\\x${await sha256Hex(token)}`;
    const { data, error } = await client.rpc("create_guardian_pin_request", {
      p_guardian_email: body.email.trim().toLowerCase(),
      p_confirmation_token_hash: tokenHash,
    });
    if (error) return databaseError(error);
    const request = data?.[0];
    const confirmationUrl = `${supabaseUrl}/functions/v1/guardian-pin-confirmation?token=${encodeURIComponent(token)}`;
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from, to: [body.email.trim().toLowerCase()],
          subject: "Confirma tu acompañamiento en Clean4Jesus",
          text: `Alguien te eligió como persona de confianza en Clean4Jesus. Si aceptas guardar su PIN de protección, confirma aquí: ${confirmationUrl}. No necesitas descargar una aplicación. Este enlace expira en 24 horas.`,
          html: guardianConfirmationEmail(confirmationUrl),
        }),
      });
      if (!response.ok) {
        await discardGuardianPinRequest(client, tokenHash);
        return json({ error: "email_delivery_failed" }, 502);
      }
    } catch {
      await discardGuardianPinRequest(client, tokenHash);
      return json({ error: "email_delivery_failed" }, 502);
    }
    return json({ status: request?.status ?? "pending", expiresAt: request?.expires_at ?? null }, 202);
  }

  if (body.operation === "getGuardianPinStatus") {
    if (!hasOnlyKeys(body, ["operation"]) && !hasOnlyKeys(body, ["operation", "includePinHash"]) || body.includePinHash !== undefined && body.includePinHash !== true) {
      return json({ error: "invalid_guardian_pin_status" }, 400);
    }
    const { data, error } = await client.rpc("get_my_guardian_pin_request", { p_include_pin_hash: body.includePinHash === true });
    if (error) return databaseError(error);
    const request = data?.[0];
    return json({ status: request?.status ?? "none", expiresAt: request?.expires_at ?? null, ...(body.includePinHash === true && request?.pin_hash ? { pinHash: request.pin_hash } : {}) }, 200);
  }

  if (body.operation === "cancelGuardianPin") {
    if (!hasOnlyKeys(body, ["operation"])) return json({ error: "invalid_guardian_pin_cancellation" }, 400);
    const { error } = await client.rpc("cancel_my_guardian_pin_request");
    if (error) return databaseError(error);
    return json({ status: "cancelled", expiresAt: null }, 200);
  }

  if (body.operation === "list") {
    if (!hasOnlyKeys(body, ["operation"])) return json({ error: "invalid_request" }, 400);
    const { data, error } = await client.rpc("list_my_accountability_relationships");
    if (error) return databaseError(error);
    return json({ relationships: data ?? [] }, 200);
  }

  if (body.operation === "revoke") {
    if (!validUuidOperation(body, "relationshipId")) return json({ error: "invalid_revoke" }, 400);
    const { error } = await client.rpc("revoke_accountability_relationship", {
      p_relationship_id: body.relationshipId,
    });
    if (error) return databaseError(error);
    return json({ revoked: true }, 200);
  }

  if (body.operation === "configureAlerts") {
    if (
      !hasOnlyKeys(body, ["operation", "relationshipId", "alertsEnabled", "riskThreshold"])
      || typeof body.relationshipId !== "string"
      || !uuidPattern.test(body.relationshipId)
      || typeof body.alertsEnabled !== "boolean"
      || typeof body.riskThreshold !== "number"
      || !Number.isInteger(body.riskThreshold)
      || body.riskThreshold < 3
      || body.riskThreshold > 10
    ) return json({ error: "invalid_alert_configuration" }, 400);
    const { data, error } = await client.rpc("configure_accountability_alerts", {
      p_relationship_id: body.relationshipId,
      p_alerts_enabled: body.alertsEnabled,
      p_risk_threshold: body.riskThreshold,
    });
    if (error) return databaseError(error);
    return json({ configured: data === true }, 200);
  }

  if (body.operation === "configureProtectionHealth") {
    if (
      !hasOnlyKeys(body, ["operation", "relationshipId", "enabled", "graceMinutes"])
      || typeof body.relationshipId !== "string"
      || !uuidPattern.test(body.relationshipId)
      || typeof body.enabled !== "boolean"
      || typeof body.graceMinutes !== "number"
      || !Number.isInteger(body.graceMinutes)
      || body.graceMinutes < 30
      || body.graceMinutes > 1440
    ) return json({ error: "invalid_protection_health_configuration" }, 400);
    const { data, error } = await client.rpc("configure_accountability_protection_health", {
      p_enabled: body.enabled,
      p_grace_minutes: body.graceMinutes,
      p_relationship_id: body.relationshipId,
    });
    if (error) return databaseError(error);
    return json({ status: data }, 200);
  }

  if (body.operation === "acceptProtectionHealth") {
    if (!validUuidOperation(body, "relationshipId")) return json({ error: "invalid_protection_health_acceptance" }, 400);
    const { data, error } = await client.rpc("accept_accountability_protection_health", {
      p_relationship_id: body.relationshipId,
    });
    if (error) return databaseError(error);
    return json({ status: data }, 200);
  }

  if (body.operation === "registerPushToken") {
    if (
      !hasOnlyKeys(body, ["operation", "relationshipId", "expoPushToken"])
      || typeof body.relationshipId !== "string"
      || !uuidPattern.test(body.relationshipId)
      || typeof body.expoPushToken !== "string"
      || !pushTokenPattern.test(body.expoPushToken)
    ) return json({ error: "invalid_push_token" }, 400);
    const { data, error } = await client.rpc("register_accountability_guardian_push_token", {
      p_relationship_id: body.relationshipId,
      p_expo_push_token: body.expoPushToken,
    });
    if (error) return databaseError(error);
    return json({ pushTokenId: data }, 200);
  }

  if (body.operation === "unregisterPushToken") {
    if (!validUuidOperation(body, "pushTokenId")) return json({ error: "invalid_push_token" }, 400);
    const { data, error } = await client.rpc("unregister_accountability_guardian_push_token", {
      p_push_token_id: body.pushTokenId,
    });
    if (error) return databaseError(error);
    return json({ removed: data === true }, 200);
  }

  if (body.operation === "registerOwnerDevice") {
    if (!validUuidOperation(body, "relationshipId")) return json({ error: "invalid_device" }, 400);
    const deviceId = crypto.randomUUID();
    const deviceSecret = createDeviceSecret();
    const { error } = await client.rpc("register_accountability_owner_device", {
      p_relationship_id: body.relationshipId,
      p_device_id: deviceId,
      p_device_secret: deviceSecret,
    });
    if (error) return databaseError(error);
    return json({ deviceId, deviceSecret }, 201);
  }

  if (body.operation === "revokeOwnerDevice") {
    if (!validUuidOperation(body, "deviceId")) return json({ error: "invalid_device" }, 400);
    const { data, error } = await client.rpc("revoke_accountability_owner_device", {
      p_device_id: body.deviceId,
    });
    if (error) return databaseError(error);
    return json({ revoked: data === true }, 200);
  }

  return json({ error: "unsupported_operation" }, 400);
});

function validUuidOperation(body: Record<string, unknown>, key: string) {
  return hasOnlyKeys(body, ["operation", key])
    && typeof body[key] === "string"
    && uuidPattern.test(body[key]);
}

function hasOnlyKeys(body: Record<string, unknown>, expected: string[]) {
  const keys = Object.keys(body).sort();
  return keys.length === expected.length && keys.every((key, index) => key === [...expected].sort()[index]);
}

async function readObject(request: Request) {
  try {
    const value = await request.json();
    return value && typeof value === "object" && !Array.isArray(value)
      ? value as Record<string, unknown>
      : null;
  } catch {
    return null;
  }
}

function createDeviceSecret() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function createUrlToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function createGuardianPin() {
  const values = crypto.getRandomValues(new Uint32Array(8));
  return [...values].map((value) => String(value % 10)).join("");
}

async function sha256Hex(value: string) {
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function guardianConfirmationEmail(url: string) {
  return `<div style="background:#f4f6fa;padding:28px 12px;font-family:Arial,sans-serif;color:#102a63"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center"><table role="presentation" width="600" style="max-width:600px;background:#fff;border-radius:24px;overflow:hidden"><tr><td style="background:#0d2860;padding:32px;text-align:center"><img src="https://clean4jesus.com/icon.png" width="56" height="56" alt="Clean4Jesus" style="display:block;margin:0 auto 14px"/><div style="color:#fff;font-size:26px;font-weight:700">Clean4Jesus</div></td></tr><tr><td style="padding:34px"><h1 style="font-size:25px;margin:0 0 16px">Te eligieron como persona de confianza</h1><p style="font-size:16px;line-height:1.6">Al confirmar, recibirás un PIN de protección para ayudar a alguien a pausar decisiones impulsivas. No necesitas descargar una aplicación.</p><p style="font-size:16px;line-height:1.6">Acepta solo si quieres acompañar esta decisión. Podrás ignorar este correo si no deseas hacerlo.</p><p style="margin:28px 0"><a href="${url}" style="background:#d99a20;color:#102a63;padding:14px 22px;border-radius:12px;text-decoration:none;font-weight:700">Confirmar acompañamiento</a></p><p style="font-size:13px;color:#52627e">Este enlace vence en 24 horas. Que Cristo guíe cada decisión.</p></td></tr></table></td></tr></table></div>`;
}

function databaseError(error: { code?: string; message: string }) {
  if (error.code === "42501") return json({ error: "forbidden" }, 403);
  if (error.code === "P0002") return json({ error: "not_found" }, 404);
  if (error.code === "23505") return json({ error: "conflict" }, 409);
  if (error.code === "22023" && error.message.includes("guardian_pin_request_rate_limited")) {
    return json({ error: "guardian_pin_request_rate_limited" }, 429);
  }
  if (error.code === "22023" && error.message.includes("invalid_guardian_pin_request")) {
    return json({ error: "invalid_guardian_email" }, 400);
  }
  if (error.code === "PGRST202" || /guardian_pin_request/i.test(error.message) && /not find|schema cache/i.test(error.message)) {
    return json({ error: "guardian_pin_backend_not_ready" }, 503);
  }
  if (error.code === "22023") return json({ error: "invalid_request" }, 400);
  return json({ error: "accountability_operation_failed" }, 400);
}

async function discardGuardianPinRequest(
  client: ReturnType<typeof createClient>,
  tokenHash: string,
) {
  const { error } = await client.rpc("discard_my_guardian_pin_request", {
    p_confirmation_token_hash: tokenHash,
  });
  if (error) console.error("guardian_pin_cleanup_failed", error.code);
}

function json(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}
