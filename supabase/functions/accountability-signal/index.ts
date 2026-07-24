import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.5";

// Deploy with --no-verify-jwt; this endpoint authenticates a private device credential.

const corsHeaders = {
  "Access-Control-Allow-Headers": "apikey, content-type, x-client-info",
  "Access-Control-Allow-Origin": "*",
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const body = await readSignal(request);
  if (!body) return json({ error: "invalid_signal" }, 400);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SECRET_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return json({ error: "server_misconfigured" }, 500);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await admin.rpc("process_accountability_risk_signal_v2", {
    p_device_id: body.deviceId,
    p_device_secret: body.secret,
    p_idempotency_key: body.idempotencyKey,
  });
  if (error) {
    if (error.code === "28000") return json({ error: "invalid_device_credential" }, 401);
    if (error.code === "42501") return json({ error: "relationship_not_accepted" }, 403);
    return json({ error: "signal_rejected" }, 400);
  }

  const result = data?.[0] as SignalResult | undefined;
  let notified = false;
  if (result?.should_notify && result.push_tokens.length > 0) {
    notified = await sendGenericPush(result.push_tokens);
    if (result.dispatch_id) {
      await admin.rpc("complete_accountability_notification_dispatch", {
        p_dispatch_id: result.dispatch_id,
        p_delivered: notified,
      });
    }
  }

  return json({ accepted: true, duplicate: result?.duplicate === true, notified }, 202);
});

type SignalResult = {
  duplicate: boolean;
  dispatch_id: string | null;
  should_notify: boolean;
  push_tokens: string[];
};

async function readSignal(request: Request) {
  try {
    const value = await request.json() as Record<string, unknown>;
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const keys = Object.keys(value).sort();
    if (keys.join(",") !== "deviceId,idempotencyKey,secret") return null;
    if (typeof value.deviceId !== "string" || !uuidPattern.test(value.deviceId)) return null;
    if (typeof value.idempotencyKey !== "string" || !uuidPattern.test(value.idempotencyKey)) return null;
    if (typeof value.secret !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(value.secret)) return null;
    return {
      deviceId: value.deviceId,
      idempotencyKey: value.idempotencyKey,
      secret: value.secret,
    };
  } catch {
    return null;
  }
}

async function sendGenericPush(tokens: string[]) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const expoAccessToken = Deno.env.get("EXPO_ACCESS_TOKEN");
  if (expoAccessToken) headers.Authorization = `Bearer ${expoAccessToken}`;

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers,
      body: JSON.stringify(tokens.map((token) => ({
        to: token,
        sound: "default",
        title: "Clean4Jesus",
        body: "Tu persona de confianza puede necesitar acompanamiento. Entra cuando puedas.",
        channelId: "risk-alerts",
        data: { type: "accountability_check_in" },
      }))),
    });
    if (!response.ok) return false;
    const payload = await response.json() as { data?: Array<{ status?: string }> };
    return payload.data?.some((ticket) => ticket.status === "ok") === true;
  } catch {
    return false;
  }
}

function json(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}
