import { createHmac, randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !publishableKey || !serviceRoleKey) {
  console.error("Faltan SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY y SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

if (url.includes("supabase.co") && process.env.ALLOW_REMOTE_SECURITY_TEST !== "true") {
  console.error("Prueba remota bloqueada. Define ALLOW_REMOTE_SECURITY_TEST=true conscientemente.");
  process.exit(1);
}

const admin = createClient(url, serviceRoleKey, clientOptions());
const suffix = randomUUID();
const password = `C4J-${randomUUID()}-secure`;
const identities = ["author", "member", "moderator", "rate", "revoked", "deleted"].map((role) => ({
  email: `negative-${role}-${suffix}@example.invalid`,
  id: null,
  role,
  token: null,
}));
const postIds = new Set();
const reportIds = new Set();
const deletedUserIds = new Set();

try {
  console.log("QA negativa 1/8: preparando identidades aisladas...");
  for (const identity of identities) {
    const { data, error } = await admin.auth.admin.createUser({
      email: identity.email,
      email_confirm: true,
      password,
      user_metadata: { display_name: `Negative ${identity.role}` },
    });
    if (error || !data.user) throw error ?? new Error(`No se creo ${identity.role}`);
    identity.id = data.user.id;

    const client = createClient(url, publishableKey, clientOptions());
    const { data: sessionData, error: signInError } = await client.auth.signInWithPassword({
      email: identity.email,
      password,
    });
    if (signInError || !sessionData.session) throw signInError ?? new Error(`No inicio sesion ${identity.role}`);
    identity.client = client;
    identity.token = sessionData.session.access_token;
  }

  const author = byRole("author");
  const member = byRole("member");
  const moderator = byRole("moderator");
  const rate = byRole("rate");
  const revoked = byRole("revoked");
  const deleted = byRole("deleted");

  console.log("QA negativa 2/8: rechazando hijos y edicion de una publicacion oculta...");
  const hiddenPost = await createPost(author, "Oculta QA", "Contenido oculto reservado para contratos negativos.");
  await mustSucceed(
    admin.from("community_posts").update({ status: "hidden" }).eq("id", hiddenPost.id),
    "ocultar publicacion de QA",
  );
  await expectDatabaseError(
    member.client.from("community_prayers").insert({ post_id: hiddenPost.id, user_id: member.id }),
    "42501",
    "crear apoyo hijo de un post oculto",
  );
  await expectDatabaseError(
    member.client.from("community_comments").insert({
      author_id: member.id,
      body: "Respuesta que no debe existir.",
      post_id: hiddenPost.id,
    }),
    "42501",
    "crear comentario hijo de un post oculto",
  );
  await expectDatabaseError(
    author.client
      .from("community_posts")
      .update({ body: "Edicion prohibida de contenido ya oculto." })
      .eq("id", hiddenPost.id)
      .select("id")
      .single(),
    "PGRST116",
    "editar una publicacion oculta",
  );

  console.log("QA negativa 3/8: validando expected_version null...");
  const moderatedPost = await createPost(author, "Moderacion QA", "Contenido para validar moderacion e idempotencia estricta.");
  await mustSucceed(
    member.client.from("community_reports").insert({
      details: "Detalle durable unico de la prueba negativa.",
      post_id: moderatedPost.id,
      reason: "spam",
      reporter_id: member.id,
    }),
    "crear reporte de QA como miembro",
  );
  const report = await insertOne(
    admin
      .from("community_reports")
      .select("id, content_snapshot, author_id_snapshot, details")
      .eq("reporter_id", member.id)
      .eq("target_id", moderatedPost.id)
      .single(),
    "verificar reporte de QA como servicio",
  );
  reportIds.add(report.id);
  await mustSucceed(
    admin.rpc("service_set_community_moderator", {
      p_active: true,
      p_role: "moderator",
      p_user_id: moderator.id,
    }),
    "asignar rol temporal",
  );
  await promoteModeratorToAal2(moderator);
  const queue = await expectEdgeSuccess(
    moderator.token,
    "moderate-community",
    { operation: "list", status: "pending" },
    "listar cola",
  );
  const moderationCase = queue.cases?.find((item) => item.target_id === moderatedPost.id);
  if (!moderationCase) throw new Error("La cola no devolvio el caso temporal.");

  await expectEdgeError(
    moderator.token,
    "moderate-community",
    {
      action: "hide_content",
      caseId: moderationCase.id,
      expectedVersion: null,
      note: "Version nula deliberada.",
      operation: "act",
      requestId: randomUUID(),
    },
    400,
    "invalid_moderation_action",
    "aceptar expected_version null",
  );

  console.log("QA negativa 4/8: rechazando reutilizacion idempotente con otro payload...");
  const requestId = randomUUID();
  await expectEdgeSuccess(
    moderator.token,
    "moderate-community",
    {
      action: "hide_content",
      caseId: moderationCase.id,
      expectedVersion: moderationCase.version,
      note: "Ocultamiento original de QA.",
      operation: "act",
      requestId,
    },
    "aplicar moderacion original",
  );
  await expectEdgeError(
    moderator.token,
    "moderate-community",
    {
      action: "resolve_no_action",
      caseId: moderationCase.id,
      expectedVersion: moderationCase.version,
      note: "Payload distinto con la misma llave.",
      operation: "act",
      requestId,
    },
    409,
    "idempotency_mismatch",
    "reutilizar requestId con otro payload",
  );

  console.log("QA negativa 5/8: conservando evidencia y rechazando ocultamiento ficticio...");
  await mustSucceed(admin.from("community_posts").delete().eq("id", moderatedPost.id), "borrar contenido reportado");
  postIds.delete(moderatedPost.id);
  const durableReport = await insertOne(
    admin
      .from("community_reports")
      .select("id, post_id, target_id, content_snapshot, author_id_snapshot, details")
      .eq("id", report.id)
      .single(),
    "leer evidencia durable",
  );
  assertEqual(durableReport.post_id, null, "La FK del reporte no se libero tras borrar el contenido.");
  assertEqual(durableReport.target_id, moderatedPost.id, "Se perdio el identificador durable del objetivo.");
  assertEqual(durableReport.content_snapshot, moderatedPost.body, "Se perdio el contenido capturado.");
  assertEqual(durableReport.author_id_snapshot, author.id, "Se perdio el autor capturado.");
  assertEqual(durableReport.details, report.details, "Se perdio el detalle aportado por el reportante.");

  const deletedBeforeAction = await createPost(
    author,
    "Objetivo eliminado QA",
    "Este contenido desaparecera antes de que el moderador intente ocultarlo.",
  );
  await mustSucceed(
    member.client.from("community_reports").insert({
      details: "Caso para evitar un exito de moderacion ficticio.",
      post_id: deletedBeforeAction.id,
      reason: "spam",
      reporter_id: member.id,
    }),
    "reportar objetivo que sera eliminado",
  );
  const deletedTargetReport = await insertOne(
    admin
      .from("community_reports")
      .select("id")
      .eq("reporter_id", member.id)
      .eq("target_id", deletedBeforeAction.id)
      .single(),
    "obtener reporte del objetivo que sera eliminado",
  );
  reportIds.add(deletedTargetReport.id);
  const queueBeforeDelete = await expectEdgeSuccess(
    moderator.token,
    "moderate-community",
    { operation: "list", status: "pending" },
    "listar caso antes de borrar objetivo",
  );
  const deletedTargetCase = queueBeforeDelete.cases?.find((item) => item.target_id === deletedBeforeAction.id);
  if (!deletedTargetCase) throw new Error("No aparecio el caso del objetivo que sera eliminado.");
  await mustSucceed(admin.from("community_posts").delete().eq("id", deletedBeforeAction.id), "borrar objetivo antes de moderar");
  postIds.delete(deletedBeforeAction.id);
  await expectEdgeError(
    moderator.token,
    "moderate-community",
    {
      action: "hide_content",
      caseId: deletedTargetCase.id,
      expectedVersion: deletedTargetCase.version,
      note: "No debe registrarse un ocultamiento inexistente.",
      operation: "act",
      requestId: randomUUID(),
    },
    409,
    "content_not_available",
    "ocultar contenido que ya no existe",
  );

  console.log("QA negativa 6/8: forzando el limite bajo concurrencia...");
  for (let index = 0; index < 4; index += 1) {
    await createPost(rate, `Rate base ${index}`, `Escritura base ${index} para preparar la ventana concurrente.`);
  }
  const concurrentResults = await Promise.all(
    [0, 1].map((index) =>
      rate.client
        .from("community_posts")
        .insert({
          author_id: rate.id,
          body: `Escritura concurrente ${index} que compite por el ultimo cupo.`,
          kind: "update",
          title: `Rate concurrente ${index}`,
        })
        .select("id"),
    ),
  );
  const accepted = concurrentResults.filter((result) => !result.error);
  const rejected = concurrentResults.filter((result) => result.error);
  for (const result of accepted) {
    for (const row of result.data ?? []) postIds.add(row.id);
  }
  if (accepted.length !== 1 || rejected.length !== 1) {
    throw new Error(`Rate limit concurrente roto: aceptadas=${accepted.length}, rechazadas=${rejected.length}.`);
  }
  assertDatabaseError(rejected[0].error, "P0001", "community_rate_limit", "limite concurrente");

  console.log("QA negativa 7/8: invalidando un JWT cuya sesion fue revocada...");
  await mustSucceed(
    admin.rpc("service_set_community_moderator", {
      p_active: true,
      p_role: "moderator",
      p_user_id: revoked.id,
    }),
    "asignar rol al moderador que sera revocado",
  );
  await promoteModeratorToAal2(revoked);
  const revokedToken = revoked.token;
  await mustSucceed(
    revoked.client.rpc("list_community_moderation_cases_v2", { p_limit: 1, p_status: "pending" }),
    "confirmar acceso antes de revocar la sesion",
  );
  await mustSucceed(revoked.client.auth.signOut({ scope: "global" }), "revocar la sesion temporal");
  const revokedTokenClient = createClient(url, publishableKey, {
    ...clientOptions(),
    global: { headers: { Authorization: `Bearer ${revokedToken}` } },
  });
  const { data: revokedProfiles, error: revokedReadError } = await revokedTokenClient
    .from("profiles")
    .select("id")
    .limit(1);
  if (revokedReadError) {
    throw new Error(`La lectura post-revocacion no pudo evaluarse: ${revokedReadError.code}/${revokedReadError.message}`);
  }
  if ((revokedProfiles ?? []).length !== 0) {
    throw new Error("RLS roto: un JWT de una sesion revocada todavia pudo leer perfiles.");
  }
  await expectDatabaseError(
    revokedTokenClient.rpc("list_community_moderation_cases_v2", { p_limit: 1, p_status: "pending" }),
    "42501",
    "listar moderacion con una sesion revocada",
  );
  await expectDatabaseError(
    revokedTokenClient.rpc("list_community_posts_public", { p_kind: null }),
    "42501",
    "listar el feed con una sesion revocada",
  );
  await expectDatabaseError(
    revokedTokenClient.rpc("list_community_comments_public", { p_post_id: hiddenPost.id }),
    "42501",
    "listar comentarios con una sesion revocada",
  );
  await expectDatabaseError(
    revokedTokenClient.rpc("get_community_engagement", { p_post_ids: [hiddenPost.id] }),
    "42501",
    "leer engagement con una sesion revocada",
  );

  console.log("QA negativa 8/8: invalidando el JWT despues del borrado...");
  await expectEdgeSuccess(
    deleted.token,
    "delete-account",
    { password, userId: deleted.id },
    "borrar identidad por Edge Function",
  );
  deletedUserIds.add(deleted.id);
  const staleTokenClient = createClient(url, publishableKey, {
    ...clientOptions(),
    global: { headers: { Authorization: `Bearer ${deleted.token}` } },
  });
  const { data: staleProfiles, error: staleReadError } = await staleTokenClient
    .from("profiles")
    .select("id")
    .limit(1);
  if (staleReadError) {
    throw new Error(`La lectura post-borrado no pudo evaluarse: ${staleReadError.code}/${staleReadError.message}`);
  }
  if ((staleProfiles ?? []).length !== 0) {
    throw new Error("RLS roto: un JWT de usuario borrado todavia pudo leer perfiles.");
  }
  await expectEdgeError(
    deleted.token,
    "moderate-community",
    { operation: "list", status: "pending" },
    401,
    "invalid_session",
    "usar un JWT despues de borrar su usuario",
  );

  console.log("PASS: contratos negativos remotos y codigos exactos verificados.");
} finally {
  const cleanupErrors = [];
  if (reportIds.size > 0) {
    const { error } = await admin.from("community_reports").delete().in("id", [...reportIds]);
    if (error) cleanupErrors.push(`reports: ${error.message}`);
  }
  if (postIds.size > 0) {
    const { error } = await admin.from("community_posts").delete().in("id", [...postIds]);
    if (error) cleanupErrors.push(`posts: ${error.message}`);
  }
  for (const identity of identities) {
    if (!identity.id || deletedUserIds.has(identity.id)) continue;
    const { error } = await admin.auth.admin.deleteUser(identity.id);
    if (error) cleanupErrors.push(`${identity.role}: ${error.message}`);
  }
  if (cleanupErrors.length > 0) {
    throw new Error(`Cleanup remoto incompleto: ${cleanupErrors.join("; ")}`);
  }
}

function clientOptions() {
  return { auth: { autoRefreshToken: false, persistSession: false } };
}

function byRole(role) {
  return identities.find((identity) => identity.role === role);
}

async function promoteModeratorToAal2(identity) {
  const { data: enrollment, error: enrollmentError } = await identity.client.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: `QA ${identity.role}`,
  });
  if (enrollmentError || !enrollment) throw enrollmentError ?? new Error("No se creo el factor MFA temporal.");

  let verified = false;
  let lastError = null;
  for (const offset of [0, -1, 1]) {
    const code = generateTotp(enrollment.totp.secret, offset);
    const { error } = await identity.client.auth.mfa.challengeAndVerify({ factorId: enrollment.id, code });
    if (!error) {
      verified = true;
      break;
    }
    lastError = error;
  }
  if (!verified) throw lastError ?? new Error("No se verifico MFA temporal.");

  const { data: sessionData, error: sessionError } = await identity.client.auth.getSession();
  if (sessionError || !sessionData.session) throw sessionError ?? new Error("No se obtuvo sesion AAL2.");
  identity.token = sessionData.session.access_token;
}

function generateTotp(secret, windowOffset = 0) {
  const key = decodeBase32(secret);
  const counter = Math.floor(Date.now() / 30_000) + windowOffset;
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac("sha1", key).update(buffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary = ((digest[offset] & 0x7f) << 24)
    | ((digest[offset + 1] & 0xff) << 16)
    | ((digest[offset + 2] & 0xff) << 8)
    | (digest[offset + 3] & 0xff);
  return String(binary % 1_000_000).padStart(6, "0");
}

function decodeBase32(value) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const character of value.toUpperCase().replace(/=+$/g, "")) {
    const index = alphabet.indexOf(character);
    if (index < 0) throw new Error("Secreto TOTP invalido.");
    bits += index.toString(2).padStart(5, "0");
  }
  const bytes = [];
  for (let index = 0; index + 8 <= bits.length; index += 8) {
    bytes.push(Number.parseInt(bits.slice(index, index + 8), 2));
  }
  return Buffer.from(bytes);
}

async function createPost(identity, title, body) {
  const post = await insertOne(
    identity.client
      .from("community_posts")
      .insert({ author_id: identity.id, body, kind: "update", title })
      .select("id, body")
      .single(),
    `crear ${title}`,
  );
  postIds.add(post.id);
  return post;
}

async function insertOne(query, label) {
  const { data, error } = await query;
  if (error || !data) throw error ?? new Error(`Sin datos al ${label}.`);
  return data;
}

async function mustSucceed(query, label) {
  const { error } = await query;
  if (error) throw new Error(`Fallo al ${label}: ${error.code}/${error.message}`);
}

async function expectDatabaseError(query, expectedCode, label) {
  const { data, error } = await query;
  if (!error) {
    const rows = Array.isArray(data) ? data.length : data ? 1 : 0;
    throw new Error(`Seguridad rota al ${label}: operacion aceptada (${rows} filas).`);
  }
  assertDatabaseError(error, expectedCode, null, label);
}

function assertDatabaseError(error, expectedCode, expectedMessage, label) {
  if (error?.code !== expectedCode || (expectedMessage && !error.message?.includes(expectedMessage))) {
    throw new Error(
      `Rechazo incorrecto al ${label}: esperado ${expectedCode}/${expectedMessage ?? "*"}, recibido ${error?.code ?? "sin_codigo"}/${error?.message ?? "sin_mensaje"}.`,
    );
  }
}

async function invokeEdge(token, functionName, body) {
  const response = await fetch(`${url}/functions/v1/${functionName}`, {
    body: JSON.stringify(body),
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: publishableKey,
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`${functionName} devolvio HTTP ${response.status} sin JSON.`);
  }
  return { payload, status: response.status };
}

async function expectEdgeSuccess(token, functionName, body, label) {
  const result = await invokeEdge(token, functionName, body);
  if (result.status < 200 || result.status >= 300) {
    throw new Error(`Fallo al ${label}: ${result.status}/${result.payload?.error ?? "sin_codigo"}.`);
  }
  return result.payload;
}

async function expectEdgeError(token, functionName, body, expectedStatus, expectedCode, label) {
  const result = await invokeEdge(token, functionName, body);
  if (result.status !== expectedStatus || result.payload?.error !== expectedCode) {
    throw new Error(
      `Rechazo incorrecto al ${label}: esperado ${expectedStatus}/${expectedCode}, recibido ${result.status}/${result.payload?.error ?? "sin_codigo"}.`,
    );
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) throw new Error(`${message} Esperado=${expected}, recibido=${actual}.`);
}
