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
      || body.graceMinutes < 60
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

function databaseError(error: { code?: string; message: string }) {
  if (error.code === "42501") return json({ error: "forbidden" }, 403);
  if (error.code === "P0002") return json({ error: "not_found" }, 404);
  if (error.code === "23505") return json({ error: "conflict" }, 409);
  if (error.code === "22023") return json({ error: "invalid_request" }, 400);
  return json({ error: "accountability_operation_failed" }, 400);
}

function json(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}
