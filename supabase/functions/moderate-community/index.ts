import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.5";

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Origin": "*",
};

const actions = new Set(["claim", "hide_content", "restore_content", "resolve_no_action"]);
const falsePositiveActions = new Set(["claim", "needs_evidence", "confirm_false_positive", "keep_blocked"]);

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const authorization = request.headers.get("Authorization");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const publishableKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!authorization?.startsWith("Bearer ")) return json({ error: "missing_authorization" }, 401);
  if (!supabaseUrl || !publishableKey) return json({ error: "server_misconfigured" }, 500);

  const client = createClient(supabaseUrl, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: authorization } },
  });
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) return json({ error: "invalid_session" }, 401);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  if (body.operation === "list") {
    const status = typeof body.status === "string" ? body.status : "pending";
    const { data, error } = await client.rpc("list_community_moderation_cases_v2", {
      p_limit: 50,
      p_status: status,
    });
    if (error) return mapDatabaseError(error);
    return json({ cases: data ?? [] }, 200);
  }

  if (body.operation === "act") {
    const caseId = typeof body.caseId === "string" ? body.caseId : "";
    const expectedVersion = typeof body.expectedVersion === "number" ? body.expectedVersion : 0;
    const action = typeof body.action === "string" ? body.action : "";
    const note = typeof body.note === "string" ? body.note.trim() : "";
    const requestId = typeof body.requestId === "string" ? body.requestId : "";
    if (!isUuid(caseId) || !isUuid(requestId) || expectedVersion < 1 || !actions.has(action) || note.length < 3 || note.length > 500) {
      return json({ error: "invalid_moderation_action" }, 400);
    }

    const { data, error } = await client.rpc("apply_community_moderation_v2", {
      p_action: action,
      p_case_id: caseId,
      p_expected_version: expectedVersion,
      p_note: note,
      p_request_id: requestId,
    });
    if (error) return mapDatabaseError(error);
    return json({ result: data }, 200);
  }

  if (body.operation === "false_positive_list") {
    const status = typeof body.status === "string" ? body.status : "pending";
    const { data, error } = await client.rpc("list_false_positive_review_cases", {
      p_limit: 50,
      p_status: status,
    });
    if (error) return mapDatabaseError(error);
    return json({ cases: data ?? [] }, 200);
  }

  if (body.operation === "false_positive_act") {
    const caseId = typeof body.caseId === "string" ? body.caseId : "";
    const expectedVersion = typeof body.expectedVersion === "number" ? body.expectedVersion : 0;
    const action = typeof body.action === "string" ? body.action : "";
    const note = typeof body.note === "string" ? body.note.trim() : "";
    const requestId = typeof body.requestId === "string" ? body.requestId : "";
    if (!isUuid(caseId) || !isUuid(requestId) || expectedVersion < 1 || !falsePositiveActions.has(action) || note.length < 3 || note.length > 500) {
      return json({ error: "invalid_false_positive_review_action" }, 400);
    }

    const { data, error } = await client.rpc("apply_false_positive_review", {
      p_action: action,
      p_case_id: caseId,
      p_expected_version: expectedVersion,
      p_note: note,
      p_request_id: requestId,
    });
    if (error) return mapDatabaseError(error);
    return json({ result: data }, 200);
  }

  return json({ error: "unsupported_operation" }, 400);
});

function mapDatabaseError(error: { code?: string; message: string }) {
  const { code, message } = error;
  if (message.includes("moderator_mfa_required") || message.includes("admin_mfa_required")) {
    return json({ error: message.includes("admin_mfa_required") ? "admin_mfa_required" : "moderator_mfa_required" }, 403);
  }
  if (message.includes("moderator_required")) {
    return json({ error: "moderator_required" }, 403);
  }
  if (message.includes("admin_required_for_false_positive_confirmation")) {
    return json({ error: "admin_required_for_false_positive_confirmation" }, 403);
  }
  if (message.includes("admin_required_to_keep_blocked")) {
    return json({ error: "admin_required_to_keep_blocked" }, 403);
  }
  if (code === "40001" || message.includes("version_conflict")) {
    return json({ error: "version_conflict" }, 409);
  }
  if (message.includes("idempotency_key_payload_mismatch")) {
    return json({ error: "idempotency_mismatch" }, 409);
  }
  if (message.includes("content_no_longer_exists") || message.includes("content_parent_not_published")) {
    return json({ error: "content_not_available" }, 409);
  }
  if (message.includes("not_found")) return json({ error: "not_found" }, 404);
  return json({ error: "moderation_failed" }, 400);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function json(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}
