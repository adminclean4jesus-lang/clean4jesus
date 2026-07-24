import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.5";

const corsHeaders = {
  "Access-Control-Allow-Headers": "apikey, content-type, x-client-info",
  "Access-Control-Allow-Origin": "*",
};

const hashPattern = /^[0-9a-f]{32,128}$/i;
const deviceHashPattern = /^[0-9a-f]{64}$/i;
const packagePattern = /^[A-Za-z0-9_.-]{1,255}$/;
const versionPattern = /^[A-Za-z0-9.+_-]{1,32}$/;
const locales = new Set(["es", "en", "fr", "pt"]);

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const expectedKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY");
  const suppliedKey = request.headers.get("apikey") ?? "";
  if (!suppliedKey || (expectedKey && suppliedKey !== expectedKey)) {
    return json({ error: "invalid_client_key" }, 401);
  }

  const body = await readReport(request);
  if (!body) return json({ error: "invalid_report" }, 400);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SECRET_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return json({ error: "server_misconfigured" }, 500);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error: countError } = await admin
    .from("false_positive_reports")
    .select("id", { count: "exact", head: true })
    .eq("device_id_hash", body.device_id_hash)
    .gte("created_at", cutoff);
  if (countError) return json({ error: "report_unavailable" }, 503);
  if ((count ?? 0) >= 10) return json({ error: "rate_limited" }, 429);

  const { error } = await admin.from("false_positive_reports").insert(body);
  if (error) return json({ error: "report_rejected" }, 400);
  return json({ accepted: true }, 202);
});

async function readReport(request: Request) {
  try {
    const value = await request.json() as Record<string, unknown>;
    const keys = Object.keys(value).sort();
    if (keys.join(",") !== "app_package,app_version,device_id_hash,locale,rule_fingerprint,source") return null;
    if (typeof value.device_id_hash !== "string" || !deviceHashPattern.test(value.device_id_hash)) return null;
    if (typeof value.rule_fingerprint !== "string" || !hashPattern.test(value.rule_fingerprint)) return null;
    if (typeof value.app_package !== "string" || !packagePattern.test(value.app_package)) return null;
    if (typeof value.app_version !== "string" || !versionPattern.test(value.app_version)) return null;
    if (typeof value.locale !== "string" || !locales.has(value.locale)) return null;
    if (value.source !== "native_interruption") return null;
    return {
      device_id_hash: value.device_id_hash.toLowerCase(),
      app_package: value.app_package,
      rule_fingerprint: value.rule_fingerprint.toLowerCase(),
      locale: value.locale,
      app_version: value.app_version,
      source: value.source,
    };
  } catch {
    return null;
  }
}

function json(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}
