import { createClient } from "@supabase/supabase-js";
import { createHmac, randomUUID } from "node:crypto";

const url = process.env.SUPABASE_URL;
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !publishableKey || !serviceRoleKey) {
  console.error("Faltan SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY y SUPABASE_SERVICE_ROLE_KEY en la terminal de QA.");
  process.exit(1);
}

if (url.includes("supabase.co") && process.env.ALLOW_REMOTE_SECURITY_TEST !== "true") {
  console.error("Prueba remota bloqueada. Usa Supabase local o define ALLOW_REMOTE_SECURITY_TEST=true conscientemente.");
  process.exit(1);
}

const admin = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
const suffix = randomUUID();
const password = `C4J-${randomUUID()}-secure`;
const users = [
  { email: `security-a-${suffix}@example.invalid`, name: "Security A" },
  { email: `security-b-${suffix}@example.invalid`, name: "Security B" },
];
const createdIds = [];
const deletedIds = new Set();

try {
  console.log("QA 1/9: creando identidades temporales...");
  for (const user of users) {
    const { data, error } = await admin.auth.admin.createUser({
      email: user.email,
      email_confirm: true,
      password,
      user_metadata: { display_name: user.name },
    });
    if (error || !data.user) throw error ?? new Error("No se creo el usuario de QA");
    createdIds.push(data.user.id);
  }

  const clients = users.map(() => createClient(url, publishableKey, { auth: { autoRefreshToken: false, persistSession: false } }));
  for (let index = 0; index < clients.length; index += 1) {
    const { error } = await clients[index].auth.signInWithPassword({ email: users[index].email, password });
    if (error) throw error;
  }

  const [userA, userB] = createdIds;
  console.log("QA 2/9: verificando aislamiento RLS...");
  await expectSuccess(clients[0].from("profiles").update({ display_name: "Nombre seguro" }).eq("id", userA), "editar perfil propio");
  await expectDenied(clients[0].from("profiles").update({ display_name: "Intrusion" }).eq("id", userB).select(), "editar perfil ajeno");
  await expectDenied(
    clients[0].from("profiles").update({ clean_streak: 99999 }).eq("id", userA).select("id"),
    "falsificar racha",
  );
  const { data: foreignProfiles, error: foreignProfileError } = await clients[0]
    .from("profiles")
    .select("id, display_name, city, bio")
    .eq("id", userB);
  if (foreignProfileError || (foreignProfiles ?? []).length !== 0) {
    throw foreignProfileError ?? new Error("Privacidad rota: fue posible enumerar el perfil de otro miembro.");
  }

  const { data: post, error: postError } = await clients[0]
    .from("community_posts")
    .insert({ author_id: userA, body: "Publicacion creada por la prueba de seguridad.", kind: "update", title: "Prueba RLS" })
    .select("id")
    .single();
  if (postError || !post) throw postError ?? new Error("No se creo la publicacion de QA");

  await expectDatabaseError(
    clients[0].from("community_posts").select("author_id").eq("id", post.id),
    "42501",
    "leer el UUID del autor desde el feed",
  );
  const { data: publicFeed, error: publicFeedError } = await clients[0].rpc("list_community_posts_public", {
    p_kind: null,
  });
  const projectedPost = publicFeed?.find((item) => item.id === post.id);
  if (publicFeedError || !projectedPost) {
    throw publicFeedError ?? new Error("La proyeccion publica no devolvio la publicacion de QA.");
  }
  if ("author_id" in projectedPost || "profile_id" in projectedPost || projectedPost.author_display_name !== "Nombre seguro") {
    throw new Error(`Proyeccion publica insegura o incompleta: ${JSON.stringify(projectedPost)}.`);
  }

  await expectDenied(clients[1].from("community_posts").update({ body: "Intrusion ajena" }).eq("id", post.id).select(), "editar publicacion ajena");
  await expectDenied(
    clients[0].from("community_posts").update({ status: "hidden" }).eq("id", post.id).select("id"),
    "cambiar estado de moderacion desde el cliente",
  );

  const { error: nonModeratorError } = await clients[0].functions.invoke("moderate-community", {
    body: { operation: "list", status: "pending" },
  });
  await expectFunctionError(nonModeratorError, 403, "moderator_required", "abrir la cola sin rol");

  console.log("QA 3/9: verificando privacidad agregada del apoyo en oracion...");
  await expectSuccess(
    clients[0].from("community_prayers").insert({ post_id: post.id, user_id: userA }),
    "registrar apoyo del autor",
  );
  await expectSuccess(
    clients[1].from("community_prayers").insert({ post_id: post.id, user_id: userB }),
    "registrar apoyo de otro miembro",
  );
  await expectDatabaseError(
    clients[0].from("community_prayers").select("post_id, user_id").eq("post_id", post.id),
    "42501",
    "leer identidades de apoyo en oracion",
  );
  const { data: engagement, error: engagementError } = await clients[0].rpc("get_community_engagement", {
    p_post_ids: [post.id],
  });
  if (engagementError || engagement?.length !== 1) {
    throw engagementError ?? new Error("La RPC agregada no devolvio la publicacion de QA.");
  }
  const aggregate = engagement[0];
  if (aggregate.prayer_count !== 2 || aggregate.comment_count !== 0 || aggregate.prayed_by_me !== true) {
    throw new Error(`Agregado comunitario incorrecto: ${JSON.stringify(aggregate)}.`);
  }
  if ("user_id" in aggregate || "author_id" in aggregate) {
    throw new Error("Privacidad rota: la RPC agregada expuso una identidad.");
  }

  const { data: comment, error: commentError } = await clients[1]
    .from("community_comments")
    .insert({ author_id: userB, body: "Respuesta publica sin identidad estable.", post_id: post.id })
    .select("id")
    .single();
  if (commentError || !comment) throw commentError ?? new Error("No se creo el comentario de QA.");
  await expectDatabaseError(
    clients[0].from("community_comments").select("author_id").eq("id", comment.id),
    "42501",
    "leer el UUID del autor de un comentario",
  );
  const { data: publicComments, error: publicCommentsError } = await clients[0].rpc(
    "list_community_comments_public",
    { p_post_id: post.id },
  );
  const projectedComment = publicComments?.find((item) => item.id === comment.id);
  if (publicCommentsError || !projectedComment) {
    throw publicCommentsError ?? new Error("La proyeccion publica no devolvio el comentario de QA.");
  }
  if ("author_id" in projectedComment || "profile_id" in projectedComment || projectedComment.owned_by_me !== false) {
    throw new Error(`Proyeccion publica de comentario insegura: ${JSON.stringify(projectedComment)}.`);
  }

  const anonymous = createClient(url, publishableKey, { auth: { autoRefreshToken: false, persistSession: false } });
  await expectDatabaseError(
    anonymous.rpc("list_community_posts_public", { p_kind: null }),
    "42501",
    "listar el feed sin sesion",
  );
  await expectDatabaseError(
    anonymous.rpc("list_community_comments_public", { p_post_id: post.id }),
    "42501",
    "listar comentarios sin sesion",
  );

  console.log("QA 4/9: creando reporte y rol temporal...");
  const { data: report, error: reportError } = await clients[1]
    .from("community_reports")
    .insert({ post_id: post.id, reason: "spam", reporter_id: userB })
    .select("id")
    .single();
  if (reportError || !report) throw reportError ?? new Error("No se creo el reporte de QA");

  const { error: roleError } = await admin.rpc("service_set_community_moderator", {
    p_active: true,
    p_role: "moderator",
    p_user_id: userB,
  });
  if (roleError) throw roleError;

  await promoteModeratorToAal2(clients[1]);

  const { data: queueResult, error: queueError } = await clients[1].functions.invoke("moderate-community", {
    body: { operation: "list", status: "pending" },
  });
  const moderationCase = queueResult?.cases?.find((item) => item.target_id === post.id);
  if (queueError || !moderationCase) {
    throw new Error(`La cola de moderacion no devolvio el reporte: ${queueError?.message ?? "sin detalle"}`);
  }

  console.log("QA 5/9: aplicando moderacion atomica...");
  const requestId = randomUUID();
  const { error: actionError } = await clients[1].functions.invoke("moderate-community", {
    body: {
      action: "hide_content",
      caseId: moderationCase.id,
      expectedVersion: moderationCase.version,
      note: "Contenido ocultado por la prueba adversarial.",
      operation: "act",
      requestId,
    },
  });
  if (actionError) {
    throw new Error(`La accion de moderacion fallo: ${await describeFunctionError(actionError)}`);
  }

  console.log("QA 6/9: verificando idempotencia y concurrencia...");
  const { error: retryError } = await clients[1].functions.invoke("moderate-community", {
    body: {
      action: "hide_content",
      caseId: moderationCase.id,
      expectedVersion: moderationCase.version,
      note: "Contenido ocultado por la prueba adversarial.",
      operation: "act",
      requestId,
    },
  });
  if (retryError) throw new Error(`La idempotencia fallo: ${retryError.message}`);

  const { error: staleActionError } = await clients[1].functions.invoke("moderate-community", {
    body: {
      action: "resolve_no_action",
      caseId: moderationCase.id,
      expectedVersion: moderationCase.version,
      note: "Intento con una version obsoleta.",
      operation: "act",
      requestId: randomUUID(),
    },
  });
  await expectFunctionError(staleActionError, 409, "version_conflict", "usar una version obsoleta");

  console.log("QA 7/9: comprobando estado y separacion de roles...");
  const { data: moderatedPost, error: moderatedPostError } = await admin
    .from("community_posts")
    .select("status")
    .eq("id", post.id)
    .single();
  if (moderatedPostError || moderatedPost?.status !== "hidden") {
    throw new Error("La accion respondio, pero la publicacion no quedo oculta.");
  }

  const { error: restoreError } = await clients[1].functions.invoke("moderate-community", {
    body: {
      action: "restore_content",
      caseId: moderationCase.id,
      expectedVersion: moderationCase.version + 1,
      note: "Un moderador normal no debe restaurar.",
      operation: "act",
      requestId: randomUUID(),
    },
  });
  await expectFunctionError(restoreError, 403, "admin_mfa_required", "restaurar sin rol admin y MFA");

  console.log("QA 8/9: verificando eliminacion de cuenta...");
  const { error: wrongPasswordError } = await clients[0].functions.invoke("delete-account", {
    body: { password: `${password}-incorrecta`, userId: userA },
  });
  await expectFunctionError(wrongPasswordError, 403, "reauthentication_failed", "borrar sin reautenticacion valida");

  const { error: deletionError } = await clients[0].functions.invoke("delete-account", {
    body: { password, userId: userA },
  });
  if (deletionError) throw new Error(`Fallo delete-account: ${deletionError.message}`);
  const { data: deletedUserLookup, error: deletedUserError } = await admin.auth.admin.getUserById(userA);
  if (!deletedUserError || deletedUserLookup.user) {
    throw new Error("La Edge Function respondio, pero la cuenta siguio existiendo.");
  }
  deletedIds.add(userA);

  console.log("QA 9/9: completada; limpiando identidad restante...");
  console.log("PASS: privacidad agregada, aislamiento, moderacion atomica, auditoria y eliminacion protegidos.");
} finally {
  for (const userId of createdIds) {
    if (!deletedIds.has(userId)) await admin.auth.admin.deleteUser(userId);
  }
}

async function expectSuccess(query, label) {
  const { error } = await query;
  if (error) throw new Error(`Fallo al ${label}: ${error.message}`);
}

async function expectDenied(query, label) {
  const { data, error } = await query;
  if (error && !["42501", "PGRST116"].includes(error.code)) {
    throw new Error(`No se pudo verificar ${label}: ${error.code}/${error.message}`);
  }
  const touchedRows = Array.isArray(data) ? data.length : 0;
  if (!error && touchedRows > 0) {
    throw new Error(`RLS roto: fue posible ${label}.`);
  }
}

async function expectDatabaseError(query, expectedCode, label) {
  const { error } = await query;
  if (!error || error.code !== expectedCode) {
    throw new Error(
      `Rechazo incorrecto al ${label}: esperado ${expectedCode}, recibido ${error?.code ?? "sin_error"}/${error?.message ?? "operacion aceptada"}.`,
    );
  }
}

async function describeFunctionError(error) {
  const response = error?.context;
  if (response && typeof response.clone === "function") {
    try {
      const payload = await response.clone().json();
      return `${error.message} (${JSON.stringify(payload)})`;
    } catch {
      // Fall through to the stable SDK message when the response has no JSON body.
    }
  }
  return error?.message ?? "error desconocido";
}

async function expectFunctionError(error, expectedStatus, expectedCode, label) {
  if (!error) {
    throw new Error(`Seguridad rota: fue posible ${label}.`);
  }
  const response = error.context;
  if (!response || typeof response.clone !== "function") {
    throw new Error(`Prueba inconclusa al ${label}: no hubo respuesta HTTP verificable.`);
  }

  let payload;
  try {
    payload = await response.clone().json();
  } catch {
    throw new Error(`Prueba inconclusa al ${label}: la respuesta no fue JSON.`);
  }

  if (response.status !== expectedStatus || payload?.error !== expectedCode) {
    throw new Error(
      `Rechazo incorrecto al ${label}: esperado ${expectedStatus}/${expectedCode}, recibido ${response.status}/${payload?.error ?? "sin_codigo"}.`,
    );
  }
}

async function promoteModeratorToAal2(client) {
  const { data: enrollment, error: enrollmentError } = await client.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: `Clean4Jesus security QA ${suffix.slice(0, 8)}`,
  });
  if (enrollmentError || !enrollment?.totp?.secret || !enrollment.id) {
    throw enrollmentError ?? new Error("No se pudo enrolar el segundo factor temporal de QA.");
  }

  const { data: challenge, error: challengeError } = await client.auth.mfa.challenge({ factorId: enrollment.id });
  if (challengeError || !challenge?.id) {
    throw challengeError ?? new Error("No se pudo crear el desafio MFA de QA.");
  }

  let lastError;
  for (const windowOffset of [0, -1, 1]) {
    const code = createTotp(enrollment.totp.secret, windowOffset);
    const { error } = await client.auth.mfa.verify({
      challengeId: challenge.id,
      code,
      factorId: enrollment.id,
    });
    if (!error) return;
    lastError = error;
  }

  throw lastError ?? new Error("No se pudo verificar el segundo factor temporal de QA.");
}

function createTotp(secret, windowOffset = 0) {
  const key = decodeBase32(secret);
  const counter = Math.floor(Date.now() / 30_000) + windowOffset;
  const message = Buffer.alloc(8);
  message.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac("sha1", key).update(message).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const value =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);
  return String(value % 1_000_000).padStart(6, "0");
}

function decodeBase32(value) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const normalized = value.toUpperCase().replace(/=+$/u, "").replace(/\s+/gu, "");
  let bits = "";
  for (const character of normalized) {
    const index = alphabet.indexOf(character);
    if (index < 0) throw new Error("Supabase devolvio un secreto TOTP invalido.");
    bits += index.toString(2).padStart(5, "0");
  }
  const bytes = [];
  for (let index = 0; index + 8 <= bits.length; index += 8) {
    bytes.push(Number.parseInt(bits.slice(index, index + 8), 2));
  }
  return Buffer.from(bytes);
}
