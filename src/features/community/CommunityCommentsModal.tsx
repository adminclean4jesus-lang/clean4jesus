import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import {
  createCommunityComment,
  deleteCommunityComment,
  listCommunityComments,
  reportCommunityContent,
  type CommunityComment,
  type CommunityPost,
} from "@/features/community/communityService";
import { CommunityReportModal } from "@/features/community/CommunityReportModal";
import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { useI18n } from "@/features/i18n/I18nProvider";
import { getCommunitySecondaryText } from "@/features/i18n/communitySecondaryText";
import { fonts, ThemeColors } from "@/theme";
import type { CommunityReportReason } from "@/types/database";

type Props = {
  onClose: () => void;
  onCommentAdded: () => void;
  post: CommunityPost | null;
  userId: string;
};

export function CommunityCommentsModal({ onClose, onCommentAdded, post, userId }: Props) {
  const { colors } = useAppAppearance();
  const { language } = useI18n();
  const copy = getCommunitySecondaryText(language);
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reportCommentId, setReportCommentId] = useState<string | null>(null);
  const [submittingReport, setSubmittingReport] = useState(false);
  const commentsRequestId = useRef(0);

  async function refresh() {
    if (!post) return;
    const requestId = ++commentsRequestId.current;
    setLoading(true);
    setLoadError(null);
    try {
      const nextComments = await listCommunityComments(post.id, copy.defaultCommunity);
      if (requestId === commentsRequestId.current) setComments(nextComments);
    } catch {
      if (requestId === commentsRequestId.current) {
        setLoadError(copy.retry);
      }
    } finally {
      if (requestId === commentsRequestId.current) setLoading(false);
    }
  }

  useEffect(() => {
    if (post) void refresh();
    return () => {
      commentsRequestId.current += 1;
    };
  }, [post?.id]);

  async function submit() {
    if (!post) return;
    setSubmitting(true);
    try {
      await createCommunityComment(post.id, userId, body);
      setBody("");
      await refresh();
      onCommentAdded();
    } catch {
      Alert.alert(copy.replyError, copy.retry);
    } finally {
      setSubmitting(false);
    }
  }

  function openCommentActions(comment: CommunityComment) {
    if (!comment.ownedByMe) {
      setReportCommentId(comment.id);
      return;
    }
    Alert.alert(copy.yourReply, copy.removeReplyBody, [
      { style: "cancel", text: copy.cancel },
      { style: "destructive", text: copy.delete, onPress: () => void removeComment(comment.id) },
    ]);
  }

  async function removeComment(commentId: string) {
    try {
      await deleteCommunityComment(commentId, userId);
      setComments((current) => current.filter((comment) => comment.id !== commentId));
      onCommentAdded();
    } catch {
      Alert.alert(copy.deleteCommentError, copy.retry);
    }
  }

  async function submitCommentReport(reason: CommunityReportReason) {
    if (!reportCommentId) return;
    const targetCommentId = reportCommentId;
    setSubmittingReport(true);
    try {
      await reportCommunityContent({ commentId: targetCommentId, reason, userId });
      setReportCommentId((current) => current === targetCommentId ? null : current);
      Alert.alert(copy.reportThanks, copy.reportSent);
    } catch {
      Alert.alert(copy.reportError, copy.retry);
    } finally {
      setSubmittingReport(false);
    }
  }

  return (
    <Modal animationType="none" onRequestClose={onClose} presentationStyle="pageSheet" visible={Boolean(post)}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>{copy.commentsEyebrow}</Text>
            <Text numberOfLines={2} style={styles.title}>{post?.title}</Text>
          </View>
          <Pressable accessibilityLabel={copy.closeReplies} onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons color={colors.text} name="close" size={22} />
          </Pressable>
        </View>

        <FlatList
          contentContainerStyle={styles.list}
          data={comments}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={loadError
            ? <View style={styles.errorState}><Text style={styles.empty}>{loadError}</Text><Pressable onPress={() => void refresh()}><Text style={styles.retry}>{copy.retryAction}</Text></Pressable></View>
            : <Text style={styles.empty}>{loading ? copy.loadingReplies : copy.firstReply}</Text>}
          renderItem={({ item }) => (
            <View style={styles.comment}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{item.author.display_name.slice(0, 1).toUpperCase()}</Text></View>
              <View style={styles.commentCopy}>
                <Text style={styles.name}>{item.author.display_name}</Text>
                <Text style={styles.body}>{item.body}</Text>
              </View>
              <Pressable accessibilityLabel={item.ownedByMe ? copy.ownReplyOptions : copy.reportReply} onPress={() => openCommentActions(item)} style={styles.commentAction}>
                <MaterialCommunityIcons color={colors.muted} name="dots-horizontal" size={19} />
              </Pressable>
            </View>
          )}
        />

        <View style={styles.composer}>
          <TextInput
            maxLength={1000}
            multiline
            onChangeText={setBody}
            placeholder={copy.replyPlaceholder}
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={body}
          />
          <Pressable disabled={submitting} onPress={() => void submit()} style={styles.sendButton}>
            <MaterialCommunityIcons color={colors.surface} name="send" size={19} />
          </Pressable>
        </View>
        <CommunityReportModal onClose={() => setReportCommentId(null)} onSubmit={submitCommentReport} submitting={submittingReport} visible={Boolean(reportCommentId)} />
      </KeyboardAvoidingView>
    </Modal>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  screen: { backgroundColor: colors.background, flex: 1, paddingTop: 24 },
  header: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", gap: 12, padding: 18 },
  headerCopy: { flex: 1, gap: 3 },
  eyebrow: { color: colors.primary, fontFamily: fonts.label, fontSize: 10, textTransform: "uppercase" },
  title: { color: colors.text, fontFamily: fonts.heading, fontSize: 18, lineHeight: 22 },
  closeButton: { alignItems: "center", backgroundColor: colors.surface, borderRadius: 18, height: 40, justifyContent: "center", width: 40 },
  list: { flexGrow: 1, gap: 12, padding: 18 },
  empty: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, lineHeight: 20, paddingVertical: 32, textAlign: "center" },
  errorState: { alignItems: "center", gap: 6 },
  retry: { color: colors.primaryDark, fontFamily: fonts.heading, fontSize: 12 },
  comment: { alignItems: "flex-start", flexDirection: "row", gap: 10 },
  avatar: { alignItems: "center", backgroundColor: colors.surfaceAlt, borderRadius: 15, height: 36, justifyContent: "center", width: 36 },
  avatarText: { color: colors.primaryDark, fontFamily: fonts.display, fontSize: 14 },
  commentCopy: { backgroundColor: colors.surface, borderRadius: 16, flex: 1, gap: 4, padding: 12 },
  name: { color: colors.text, fontFamily: fonts.heading, fontSize: 12 },
  body: { color: colors.muted, fontFamily: fonts.body, fontSize: 12.5, lineHeight: 19 },
  commentAction: { alignItems: "center", height: 36, justifyContent: "center", width: 36 },
  composer: { alignItems: "flex-end", backgroundColor: colors.surface, borderTopColor: colors.border, borderTopWidth: 1, flexDirection: "row", gap: 10, padding: 14 },
  input: { backgroundColor: colors.background, borderColor: colors.border, borderRadius: 16, borderWidth: 1, color: colors.text, flex: 1, fontFamily: fonts.body, fontSize: 13, maxHeight: 110, minHeight: 48, paddingHorizontal: 13, paddingVertical: 12 },
  sendButton: { alignItems: "center", backgroundColor: colors.primaryDark, borderRadius: 16, height: 48, justifyContent: "center", width: 48 },
  });
}
