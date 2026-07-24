import { getSupabaseClient } from "@/lib/supabase";
import type { CommunityPostKind, CommunityReportReason, Database } from "@/types/database";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export type CommunityPost = {
  author: Pick<ProfileRow, "avatar_url" | "city" | "display_name">;
  body: string;
  commentCount: number;
  createdAt: string;
  id: string;
  kind: CommunityPostKind;
  ownedByMe: boolean;
  prayedByMe: boolean;
  prayerCount: number;
  title: string;
};

export type CommunityComment = {
  author: Pick<ProfileRow, "avatar_url" | "display_name">;
  body: string;
  createdAt: string;
  id: string;
  ownedByMe: boolean;
};

export async function getMyProfile(userId: string) {
  const { data, error } = await getSupabaseClient()
    .from("profiles")
    .select("id, display_name, city, bio, avatar_url, created_at, updated_at")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error("No pudimos cargar tu perfil.");
  }
  return data;
}

export async function updateMyProfile(
  userId: string,
  values: Pick<ProfileRow, "bio" | "city" | "display_name">,
) {
  const { error } = await getSupabaseClient()
    .from("profiles")
    .update({
      bio: values.bio?.trim() || null,
      city: values.city?.trim() || null,
      display_name: values.display_name.trim(),
    })
    .eq("id", userId);

  if (error) {
    throw new Error("No pudimos guardar tu perfil.");
  }
}

export async function listCommunityPosts(_userId: string, kind?: CommunityPostKind, fallbackAuthor = "Clean4Jesus") {
  const supabase = getSupabaseClient();
  const { data: posts, error } = await supabase.rpc("list_community_posts_public", {
    p_kind: kind ?? null,
  });
  if (error) {
    throw new Error("No pudimos cargar la comunidad.");
  }
  if (!posts?.length) {
    return [];
  }

  const postIds = posts.map((post) => post.id);
  const { data: engagement, error: engagementError } = await supabase.rpc("get_community_engagement", {
    p_post_ids: postIds,
  });

  if (engagementError) {
    throw new Error("No pudimos completar las reacciones de la comunidad.");
  }

  return posts.map<CommunityPost>((post) => {
    const postEngagement = engagement?.find((item) => item.post_id === post.id);
    return {
      author: {
        avatar_url: post.author_avatar_url,
        city: post.author_city,
        display_name: post.author_display_name || fallbackAuthor,
      },
      body: post.body,
      commentCount: postEngagement?.comment_count ?? 0,
      createdAt: post.created_at,
      id: post.id,
      kind: post.kind,
      ownedByMe: post.owned_by_me,
      prayedByMe: postEngagement?.prayed_by_me ?? false,
      prayerCount: postEngagement?.prayer_count ?? 0,
      title: post.title,
    };
  });
}

export async function createCommunityPost(
  userId: string,
  values: { body: string; kind: CommunityPostKind; title: string },
) {
  const title = values.title.trim();
  const body = values.body.trim();
  if (title.length < 3 || body.length < 10) {
    throw new Error("Escribe un titulo y un mensaje un poco más completos.");
  }

  const { error } = await getSupabaseClient().from("community_posts").insert({
    author_id: userId,
    body,
    kind: values.kind,
    title,
  });
  if (error) {
    throw new Error(toCommunityWriteMessage(error.message, "No pudimos publicar tu mensaje."));
  }
}

export async function setPrayerSupport(postId: string, userId: string, active: boolean) {
  const supabase = getSupabaseClient();
  const result = active
    ? await supabase.from("community_prayers").insert({ post_id: postId, user_id: userId })
    : await supabase.from("community_prayers").delete().eq("post_id", postId).eq("user_id", userId);

  if (result.error && result.error.code !== "23505") {
    throw new Error("No pudimos actualizar tu apoyo en oración.");
  }
}

export async function listCommunityComments(postId: string, fallbackAuthor = "Clean4Jesus") {
  const { data, error } = await getSupabaseClient().rpc("list_community_comments_public", {
    p_post_id: postId,
  });

  if (error) {
    throw new Error("No pudimos cargar las respuestas.");
  }

  return (data ?? []).map<CommunityComment>((comment) => ({
    author: {
      avatar_url: comment.author_avatar_url,
      display_name: comment.author_display_name || fallbackAuthor,
    },
    body: comment.body,
    createdAt: comment.created_at,
    id: comment.id,
    ownedByMe: comment.owned_by_me,
  }));
}

export async function createCommunityComment(postId: string, userId: string, body: string) {
  const cleanBody = body.trim();
  if (cleanBody.length < 2) {
    throw new Error("Escribe una respuesta antes de enviarla.");
  }

  const { error } = await getSupabaseClient().from("community_comments").insert({
    author_id: userId,
    body: cleanBody,
    post_id: postId,
  });
  if (error) {
    throw new Error(toCommunityWriteMessage(error.message, "No pudimos publicar tu respuesta."));
  }
}

function toCommunityWriteMessage(message: string, fallback: string) {
  if (message.includes("community_rate_limit")) {
    return "Hiciste varios envios seguidos. Espera unos minutos antes de continuar.";
  }
  return fallback;
}

export async function reportCommunityPost(
  postId: string,
  userId: string,
  reason: CommunityReportReason,
) {
  return submitCommunityReport({ post_id: postId }, userId, reason, "está publicación");
}

export async function reportCommunityComment(
  commentId: string,
  userId: string,
  reason: CommunityReportReason,
) {
  return submitCommunityReport({ comment_id: commentId }, userId, reason, "este comentario");
}

export async function reportCommunityContent(
  input:
    | { commentId: string; reason: CommunityReportReason; userId: string }
    | { postId: string; reason: CommunityReportReason; userId: string },
) {
  return "commentId" in input
    ? reportCommunityComment(input.commentId, input.userId, input.reason)
    : reportCommunityPost(input.postId, input.userId, input.reason);
}

export async function deleteOwnCommunityPost(postId: string) {
  const { error } = await getSupabaseClient().from("community_posts").delete().eq("id", postId);
  if (error) {
    throw new Error("No pudimos borrar tu publicación.");
  }
}

export async function deleteOwnCommunityComment(commentId: string) {
  const { error } = await getSupabaseClient().from("community_comments").delete().eq("id", commentId);
  if (error) {
    throw new Error("No pudimos borrar tu comentario.");
  }
}

export async function deleteCommunityPost(postId: string, _userId: string) {
  return deleteOwnCommunityPost(postId);
}

export async function deleteCommunityComment(commentId: string, _userId: string) {
  return deleteOwnCommunityComment(commentId);
}

async function submitCommunityReport(
  target: { comment_id: string } | { post_id: string },
  userId: string,
  reason: CommunityReportReason,
  targetLabel: string,
) {
  const { error } = await getSupabaseClient().from("community_reports").insert({
    reason,
    reporter_id: userId,
    ...target,
  });
  if (error) {
    if (error.code === "23505") {
      throw new Error(`Ya enviaste un reporte sobre ${targetLabel}.`);
    }
    throw new Error("No pudimos enviar el reporte.");
  }
}
