import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.5";

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Origin": "*",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return json({ error: "missing_authorization" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const publicKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !serviceRoleKey || !publicKey) {
    return json({ error: "server_misconfigured" }, 500);
  }

  const deletionRequest = await readDeletionRequest(request);
  if (!deletionRequest) {
    return json({ error: "invalid_password_body" }, 400);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const token = authorization.slice("Bearer ".length);
  const { data, error: userError } = await admin.auth.getUser(token);
  if (userError || !data.user) {
    return json({ error: "invalid_session" }, 401);
  }
  if (data.user.id !== deletionRequest.userId) {
    return json({ error: "session_changed" }, 409);
  }
  if (!data.user.email) {
    return json({ error: "password_reauthentication_unavailable" }, 403);
  }

  const verifier = createClient(supabaseUrl, publicKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: reauthenticated, error: reauthenticationError } = await verifier.auth.signInWithPassword({
    email: data.user.email,
    password: deletionRequest.password,
  });
  if (reauthenticationError || reauthenticated.user?.id !== data.user.id) {
    if (reauthenticated.session) {
      await verifier.auth.signOut({ scope: "local" });
    }
    return json({ error: "reauthentication_failed" }, 403);
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(data.user.id);
  if (deleteError) {
    await verifier.auth.signOut({ scope: "local" });
    return json({ error: "delete_failed" }, 500);
  }

  return json({ deleted: true }, 200);
});

function json(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

async function readDeletionRequest(request: Request) {
  try {
    const body = await request.json() as { password?: unknown; userId?: unknown };
    if (
      typeof body.password !== "string"
      || body.password.length < 1
      || body.password.length > 1024
      || typeof body.userId !== "string"
      || body.userId.length < 1
      || body.userId.length > 128
    ) {
      return null;
    }
    return { password: body.password, userId: body.userId };
  } catch {
    return null;
  }
}
