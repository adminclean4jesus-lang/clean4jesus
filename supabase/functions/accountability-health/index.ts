// Health check and scheduled delivery endpoint. It intentionally uses fetch
// instead of importing supabase-js so the function has a minimal boot surface.
const corsHeaders = {
  "Access-Control-Allow-Headers": "content-type, x-accountability-scheduler-secret",
  "Access-Control-Allow-Origin": "*",
};
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL");
  const secretKey = Deno.env.get("SUPABASE_SECRET_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !secretKey) return json({ error: "server_misconfigured" }, 500);
  const headers = { apikey: secretKey, Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" };

  if (request.headers.get("x-accountability-scheduler-secret")) return dispatchStaleProtectionAlerts(request, url, headers);
  const checkin = await readCheckin(request);
  if (!checkin) return json({ error: "invalid_checkin" }, 400);
  const response = await rpc(url, headers, "record_accountability_protection_health_checkin", {
    p_accessibility_enabled: checkin.accessibilityEnabled,
    p_device_id: checkin.deviceId,
    p_device_secret: checkin.secret,
    p_idempotency_key: checkin.idempotencyKey,
    p_vpn_enabled: checkin.vpnEnabled,
  });
  if (!response.ok) return json({ error: response.status === 401 ? "invalid_device_credential" : "checkin_rejected" }, response.status === 401 ? 401 : 400);
  const data = await response.json();
  return json({ accepted: data?.[0]?.accepted === true, duplicate: data?.[0]?.duplicate === true }, 202);
});

async function dispatchStaleProtectionAlerts(request, url, headers) {
  const expected = Deno.env.get("ACCOUNTABILITY_SCHEDULER_SECRET");
  if (!expected || request.headers.get("x-accountability-scheduler-secret") !== expected) return json({ error: "scheduler_unauthorized" }, 401);
  const queued = await rpc(url, headers, "queue_accountability_protection_health_alerts", {});
  if (!queued.ok) return json({ error: "queue_failed" }, 500);
  const rows = await queued.json();
  let emailSent = 0;
  for (const row of rows ?? []) {
    const userResponse = await fetch(`${url}/auth/v1/admin/users/${row.guardian_user_id}`, { headers });
    const userData = userResponse.ok ? await userResponse.json() : null;
    const email = userData?.user?.email;
    const delivered = Boolean(email && await sendHealthEmail(email));
    if (delivered) {
      emailSent += 1;
      await rpc(url, headers, "complete_accountability_protection_health_alert", { p_alert_id: row.alert_id, p_delivered: true });
    }
  }
  return json({ queued: (rows ?? []).length, emailSent }, 202);
}

async function rpc(url, headers, name, body) {
  return fetch(`${url}/rest/v1/rpc/${name}`, { method: "POST", headers, body: JSON.stringify(body) });
}

async function readCheckin(request) {
  try {
    const value = await request.json();
    const keys = Object.keys(value ?? {}).sort().join(",");
    if (keys !== "accessibilityEnabled,deviceId,idempotencyKey,secret,vpnEnabled") return null;
    if (typeof value.accessibilityEnabled !== "boolean" || typeof value.vpnEnabled !== "boolean") return null;
    if (typeof value.deviceId !== "string" || !uuidPattern.test(value.deviceId)) return null;
    if (typeof value.idempotencyKey !== "string" || !uuidPattern.test(value.idempotencyKey)) return null;
    if (typeof value.secret !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(value.secret)) return null;
    return value;
  } catch { return null; }
}

async function sendHealthEmail(to) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("ACCOUNTABILITY_FROM_EMAIL");
  if (!apiKey || !from) return false;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        subject: "Clean4Jesus: la protección necesita atención",
        text: "La persona que te eligió activó el modo acompañado. Clean4Jesus no ha podido confirmar que su protección siga activa durante el periodo acordado. No se comparte contenido, aplicaciones ni actividad. Entra a Clean4Jesus cuando puedas para acompañarla con respeto.",
      }),
    });
    return response.ok;
  } catch { return false; }
}

function json(body, status) {
  return new Response(JSON.stringify(body), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status });
}
