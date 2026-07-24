import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { AppLoadingExperience } from "@/components/AppLoadingExperience";
import { InfoCard } from "@/components/InfoCard";
import { Screen } from "@/components/Screen";
import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { useAuth } from "@/features/auth/AuthProvider";
import { CommunityAuthGate } from "@/features/auth/CommunityAuthGate";
import { CommunityCommentsModal } from "@/features/community/CommunityCommentsModal";
import { CommunityComposerModal } from "@/features/community/CommunityComposerModal";
import { CommunityReportModal } from "@/features/community/CommunityReportModal";
import {
  deleteCommunityPost,
  listCommunityPosts,
  reportCommunityContent,
  setPrayerSupport,
  type CommunityPost,
} from "@/features/community/communityService";
import { emptyHabitState, getHabits } from "@/features/habits/habitService";
import { useShieldGate } from "@/features/shield/useShieldGate";
import { useI18n } from "@/features/i18n/I18nProvider";
import { formatCommunitySecondaryText, getCommunitySecondaryText } from "@/features/i18n/communitySecondaryText";
import { languageLocale } from "@/features/i18n/flowText";
import { uiText } from "@/features/i18n/uiText";
import { getAuthSessionErrorMessage } from "@/features/i18n/authAuxText";
import { CommunityLegalGate } from "@/features/legal/CommunityLegalGate";
import { fonts, ThemeColors } from "@/theme";
import type { CommunityPostKind, CommunityReportReason } from "@/types/database";

type FeedFilter = "all" | CommunityPostKind;

export default function CommunityScreen() {
  const { colors } = useAppAppearance();
  const { language } = useI18n();
  const copy = getCommunitySecondaryText(language);
  const styles = useCommunityStyles();
  const { checked } = useShieldGate();
  const { error: authError, refresh: refreshAuth, status, user } = useAuth();
  const [cleanStreak, setCleanStreak] = useState(0);
  const [filter, setFilter] = useState<FeedFilter>("all");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [composerVisible, setComposerVisible] = useState(false);
  const [composerKind, setComposerKind] = useState<CommunityPostKind>("prayer");
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [reportTarget, setReportTarget] = useState<{ postId: string } | null>(null);
  const [submittingReport, setSubmittingReport] = useState(false);
  const feedRequestId = useRef(0);
  const prayerRequests = useRef(new Set<string>());

  useEffect(() => {
    void getHabits().then((state) => setCleanStreak(state.cleanStreak)).catch(() => setCleanStreak(emptyHabitState.cleanStreak));
  }, []);

  const refreshFeed = useCallback(async () => {
    if (!user) return;
    const requestId = ++feedRequestId.current;
    setLoadingFeed(true);
    setFeedError(null);
    try {
      const nextPosts = await listCommunityPosts(user.id, filter === "all" ? undefined : filter, copy.defaultCommunity);
      if (requestId === feedRequestId.current) setPosts(nextPosts);
    } catch {
      if (requestId === feedRequestId.current) {
        setFeedError(copy.connection);
      }
    } finally {
      if (requestId === feedRequestId.current) setLoadingFeed(false);
    }
  }, [filter, user]);

  useFocusEffect(
    useCallback(() => {
      if (status === "authenticated") void refreshFeed();
    }, [refreshFeed, status]),
  );

  const metrics = useMemo(
    () => ({
      comments: posts.reduce((sum, post) => sum + post.commentCount, 0),
      prayers: posts.reduce((sum, post) => sum + post.prayerCount, 0),
      requests: posts.filter((post) => post.kind === "prayer").length,
    }),
    [posts],
  );

  if (!checked || status === "loading") {
    return <AppLoadingExperience layout="contextual" message={uiText(language, "community.loading")} />;
  }

  if (status === "unconfigured") {
    return (
      <Screen>
        <AppHeader eyebrow={uiText(language, "tabs.community")} icon="account-group-outline" subtitle={uiText(language, "community.subtitle")} title={uiText(language, "community.title")} />
        <SupabaseSetupCard />
      </Screen>
    );
  }

  if (status === "anonymous") {
    return (
      <Screen>
        <AppHeader eyebrow={uiText(language, "tabs.community")} icon="account-group-outline" subtitle={uiText(language, "community.subtitle")} title={uiText(language, "community.title")} />
        <CommunityAuthGate />
      </Screen>
    );
  }

  if (!user) {
    return <AppLoadingExperience layout="contextual" message={uiText(language, "community.loading")} />;
  }

  const authenticatedUser = user;

  function openComposer(kind: CommunityPostKind) {
    setComposerKind(kind);
    setComposerVisible(true);
  }

  async function togglePrayer(post: CommunityPost) {
    if (prayerRequests.current.has(post.id)) return;
    prayerRequests.current.add(post.id);
    const nextActive = !post.prayedByMe;
    setPosts((current) => current.map((item) => item.id === post.id ? {
      ...item,
      prayedByMe: nextActive,
      prayerCount: Math.max(0, item.prayerCount + (nextActive ? 1 : -1)),
    } : item));

    try {
      await setPrayerSupport(post.id, authenticatedUser.id, nextActive);
    } catch {
      setPosts((current) => current.map((item) => item.id === post.id ? post : item));
      Alert.alert(copy.updateError, copy.retry);
    } finally {
      prayerRequests.current.delete(post.id);
    }
  }

  function openPostActions(post: CommunityPost) {
    if (!post.ownedByMe) {
      setReportTarget({ postId: post.id });
      return;
    }

    Alert.alert(copy.yourPost, copy.removePostBody, [
      { style: "cancel", text: copy.cancel },
      { style: "destructive", text: copy.delete, onPress: () => void removePost(post.id) },
    ]);
  }

  async function removePost(postId: string) {
    try {
      await deleteCommunityPost(postId, authenticatedUser.id);
      setPosts((current) => current.filter((post) => post.id !== postId));
    } catch {
      Alert.alert(copy.deleteError, copy.retry);
    }
  }

  async function submitReport(reason: CommunityReportReason) {
    if (!reportTarget) return;
    const targetPostId = reportTarget.postId;
    setSubmittingReport(true);
    try {
      await reportCommunityContent({ postId: targetPostId, reason, userId: authenticatedUser.id });
      setReportTarget((current) => current?.postId === targetPostId ? null : current);
      Alert.alert(copy.reportThanks, copy.reportSent);
    } catch {
      Alert.alert(copy.reportError, copy.retry);
    } finally {
      setSubmittingReport(false);
    }
  }

  return (
    <CommunityLegalGate>
      <Screen>
        <AppHeader eyebrow={uiText(language, "tabs.community")} icon="account-group-outline" subtitle={uiText(language, "community.subtitle")} title={uiText(language, "community.title")} />

        {authError ? <FeedMessage icon="shield-alert-outline" message={getAuthSessionErrorMessage(authError, language) ?? copy.connection} onPress={() => void refreshAuth()} title={copy.session} /> : null}

        <InfoCard style={styles.heroCard} tone="light">
          <Text style={styles.sectionEyebrow}>{uiText(language, "community.pulse")}</Text>
          <Text style={styles.heroTitle}>{uiText(language, "community.pulseTitle", { days: cleanStreak })}</Text>
          <Text style={styles.heroBody}>{uiText(language, "community.pulseBody")}</Text>
          <View style={styles.metricRow}>
            <Metric icon="hands-pray" label={uiText(language, "community.requests")} value={metrics.requests} />
            <Metric icon="heart-outline" label={uiText(language, "community.prayers")} value={metrics.prayers} />
            <Metric icon="reply-outline" label={uiText(language, "community.replies")} value={metrics.comments} />
          </View>
        </InfoCard>

        <InfoCard style={styles.actionsCard} tone="outline">
          <Text style={styles.sectionEyebrow}>{uiText(language, "community.share")}</Text>
          <QuickAction icon="hands-pray" label={uiText(language, "community.askPrayer")} onPress={() => openComposer("prayer")} />
          <QuickAction icon="message-text-outline" label={uiText(language, "community.shareTestimony")} onPress={() => openComposer("testimony")} />
        </InfoCard>

        <View style={styles.filterRow} testID="community-filters">
          <FilterChip active={filter === "all"} label={uiText(language, "community.all")} onPress={() => setFilter("all")} />
          <FilterChip active={filter === "prayer"} label={uiText(language, "community.prayer")} onPress={() => setFilter("prayer")} />
          <FilterChip active={filter === "testimony"} label={uiText(language, "community.testimonies")} onPress={() => setFilter("testimony")} />
          <FilterChip active={filter === "update"} label={uiText(language, "community.updates")} onPress={() => setFilter("update")} />
        </View>

        {feedError ? <FeedMessage icon="wifi-alert" message={feedError} onPress={() => void refreshFeed()} title={copy.connection} /> : null}
        {!feedError && loadingFeed && posts.length === 0 ? <FeedMessage icon="cloud-sync-outline" message={copy.loadingBody} title={copy.loading} /> : null}
        {!feedError && !loadingFeed && posts.length === 0 ? <FeedMessage icon="sprout-outline" message={uiText(language, "community.noPostsBody")} title={uiText(language, "community.noPostsTitle")} /> : null}

        <View style={styles.feed}>
          {posts.map((post) => (
            <InfoCard key={post.id} style={styles.postCard} tone="light">
              <View style={styles.postHeader}>
                <View style={styles.avatar}><Text style={styles.avatarText}>{post.author.display_name.slice(0, 1).toUpperCase()}</Text></View>
                <View style={styles.postMeta}>
                  <Text style={styles.postName}>{post.author.display_name}</Text>
                  <Text style={styles.postSubmeta}>{post.author.city || copy.defaultCommunity} · {formatRelativeDate(post.createdAt, language, copy)}</Text>
                </View>
                <Pressable accessibilityLabel={post.ownedByMe ? copy.ownPostOptions : copy.reportPost} onPress={() => openPostActions(post)} style={styles.moreButton} testID="community-post-actions">
                  <MaterialCommunityIcons color={colors.muted} name="dots-horizontal" size={20} />
                </Pressable>
              </View>
              <KindChip kind={post.kind} />
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postBody}>{post.body}</Text>
              <View style={styles.postFooter}>
                <PostAction active={post.prayedByMe} icon={post.prayedByMe ? "heart" : "heart-outline"} label={`${copy.pray} ${post.prayerCount}`} onPress={() => void togglePrayer(post)} />
                <PostAction icon="reply-outline" label={`${copy.reply} ${post.commentCount}`} onPress={() => setSelectedPost(post)} />
              </View>
            </InfoCard>
          ))}
        </View>
      </Screen>

      <CommunityComposerModal initialKind={composerKind} onClose={() => setComposerVisible(false)} onPublished={() => void refreshFeed()} userId={authenticatedUser.id} visible={composerVisible} />
      <CommunityCommentsModal onClose={() => setSelectedPost(null)} onCommentAdded={() => void refreshFeed()} post={selectedPost} userId={authenticatedUser.id} />
      <CommunityReportModal onClose={() => setReportTarget(null)} onSubmit={submitReport} submitting={submittingReport} visible={Boolean(reportTarget)} />
    </CommunityLegalGate>
  );
}

function SupabaseSetupCard() {
  const { colors } = useAppAppearance();
  const { language } = useI18n();
  const styles = useCommunityStyles();
  return (
    <InfoCard style={styles.setupCard} tone="outline" testID="community-supabase-setup">
      <View style={styles.setupIcon}><MaterialCommunityIcons color={colors.primaryDark} name="database-lock-outline" size={28} /></View>
      <Text style={styles.heroTitle}>{uiText(language, "community.setupTitle")}</Text>
      <Text style={styles.heroBody}>{uiText(language, "community.setupBody")}</Text>
      <View style={styles.setupStep}><Text style={styles.stepNumber}>1</Text><Text style={styles.stepText}>{uiText(language, "community.setupStep1")}</Text></View>
      <View style={styles.setupStep}><Text style={styles.stepNumber}>2</Text><Text style={styles.stepText}>{uiText(language, "community.setupStep2")}</Text></View>
      <View style={styles.setupStep}><Text style={styles.stepNumber}>3</Text><Text style={styles.stepText}>{uiText(language, "community.setupStep3")}</Text></View>
    </InfoCard>
  );
}

function Metric({ icon, label, value }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string; value: number }) {
  const { colors } = useAppAppearance();
  const styles = useCommunityStyles();
  return <View style={styles.metric}><MaterialCommunityIcons color={colors.primaryDark} name={icon} size={16} /><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

function QuickAction({ icon, label, onPress }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string; onPress: () => void }) {
  const { colors } = useAppAppearance();
  const styles = useCommunityStyles();
  return <Pressable onPress={onPress} style={styles.quickAction}><View style={styles.quickIcon}><MaterialCommunityIcons color={colors.primaryDark} name={icon} size={19} /></View><Text style={styles.quickLabel}>{label}</Text><MaterialCommunityIcons color={colors.muted} name="chevron-right" size={20} /></Pressable>;
}

function FilterChip({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  const styles = useCommunityStyles();
  return <Pressable onPress={onPress} style={[styles.filterChip, active && styles.filterChipActive]}><Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text></Pressable>;
}

function KindChip({ kind }: { kind: CommunityPostKind }) {
  const styles = useCommunityStyles();
  const { language } = useI18n();
  const labels = { prayer: uiText(language, "community.prayer"), testimony: uiText(language, "community.testimonies"), update: uiText(language, "community.updates") };
  return <View style={[styles.kindChip, kind === "prayer" && styles.kindPrayer, kind === "testimony" && styles.kindTestimony]}><Text style={styles.kindText}>{labels[kind]}</Text></View>;
}

function PostAction({ active = false, icon, label, onPress }: { active?: boolean; icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string; onPress: () => void }) {
  const { colors } = useAppAppearance();
  const styles = useCommunityStyles();
  return <Pressable onPress={onPress} style={[styles.postAction, active && styles.postActionActive]}><MaterialCommunityIcons color={active ? colors.primary : colors.primaryDark} name={icon} size={17} /><Text style={[styles.postActionText, active && styles.postActionTextActive]}>{label}</Text></Pressable>;
}

function FeedMessage({ icon, message, onPress, title }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; message: string; onPress?: () => void; title: string }) {
  const { colors } = useAppAppearance();
  const { language } = useI18n();
  const copy = getCommunitySecondaryText(language);
  const styles = useCommunityStyles();
  return <InfoCard style={styles.messageCard} tone="outline"><MaterialCommunityIcons color={colors.primaryDark} name={icon} size={26} /><Text style={styles.messageTitle}>{title}</Text><Text style={styles.messageBody}>{message}</Text>{onPress ? <Pressable onPress={onPress}><Text style={styles.retryText}>{copy.retryAction}</Text></Pressable> : null}</InfoCard>;
}

function formatRelativeDate(value: string, language: ReturnType<typeof useI18n>["language"], copy: ReturnType<typeof getCommunitySecondaryText>) {
  const date = new Date(value);
  const diffMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (diffMinutes < 1) return copy.now;
  if (diffMinutes < 60) return formatCommunitySecondaryText(copy.minutesAgo, { count: diffMinutes });
  const hours = Math.floor(diffMinutes / 60);
  if (hours < 24) return formatCommunitySecondaryText(copy.hoursAgo, { count: hours });
  return date.toLocaleDateString(languageLocale(language), { day: "numeric", month: "short" });
}

function useCommunityStyles() {
  const { colors } = useAppAppearance();
  return useMemo(() => createStyles(colors), [colors]);
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  heroCard: { gap: 12 },
  sectionEyebrow: { color: colors.primary, fontFamily: fonts.label, fontSize: 10.5, textTransform: "uppercase" },
  heroTitle: { color: colors.text, fontFamily: fonts.display, fontSize: 22, lineHeight: 27 },
  heroBody: { color: colors.muted, fontFamily: fonts.body, fontSize: 13.5, lineHeight: 21 },
  metricRow: { flexDirection: "row", gap: 8 },
  metric: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, flex: 1, gap: 4, minHeight: 78, padding: 10 },
  metricValue: { color: colors.text, fontFamily: fonts.display, fontSize: 17 },
  metricLabel: { color: colors.muted, fontFamily: fonts.label, fontSize: 9, textTransform: "uppercase" },
  actionsCard: { gap: 9 },
  quickAction: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 10, padding: 12 },
  quickIcon: { alignItems: "center", backgroundColor: colors.surfaceAlt, borderRadius: 12, height: 36, justifyContent: "center", width: 36 },
  quickLabel: { color: colors.text, flex: 1, fontFamily: fonts.heading, fontSize: 14 },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  filterChip: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  filterChipActive: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
  filterText: { color: colors.primaryDark, fontFamily: fonts.bodyMedium, fontSize: 11.5 },
  filterTextActive: { color: colors.surface },
  feed: { gap: 12 },
  postCard: { gap: 10 },
  postHeader: { alignItems: "center", flexDirection: "row", gap: 9 },
  avatar: { alignItems: "center", backgroundColor: colors.surfaceAlt, borderRadius: 16, height: 42, justifyContent: "center", width: 42 },
  avatarText: { color: colors.primaryDark, fontFamily: fonts.display, fontSize: 17 },
  postMeta: { flex: 1, gap: 3, minWidth: 0 },
  postName: { color: colors.text, fontFamily: fonts.heading, fontSize: 13.5 },
  postSubmeta: { color: colors.muted, fontFamily: fonts.body, fontSize: 10.5 },
  moreButton: { alignItems: "center", height: 38, justifyContent: "center", width: 38 },
  kindChip: { alignSelf: "flex-start", backgroundColor: colors.surfaceAlt, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  kindPrayer: { backgroundColor: "rgba(249,168,37,0.14)" },
  kindTestimony: { backgroundColor: "rgba(46,125,50,0.11)" },
  kindText: { color: colors.primaryDark, fontFamily: fonts.label, fontSize: 9.5, textTransform: "uppercase" },
  postTitle: { color: colors.text, fontFamily: fonts.heading, fontSize: 17, lineHeight: 21 },
  postBody: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, lineHeight: 20 },
  postFooter: { flexDirection: "row", gap: 8 },
  postAction: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, flex: 1, flexDirection: "row", gap: 7, justifyContent: "center", minHeight: 42 },
  postActionActive: { backgroundColor: "rgba(249,168,37,0.10)", borderColor: "rgba(249,168,37,0.28)" },
  postActionText: { color: colors.text, fontFamily: fonts.heading, fontSize: 11.5 },
  postActionTextActive: { color: colors.primary },
  messageCard: { alignItems: "center", gap: 8, paddingVertical: 22 },
  messageTitle: { color: colors.text, fontFamily: fonts.heading, fontSize: 16, textAlign: "center" },
  messageBody: { color: colors.muted, fontFamily: fonts.body, fontSize: 12.5, lineHeight: 19, textAlign: "center" },
  retryText: { color: colors.primaryDark, fontFamily: fonts.heading, fontSize: 12, marginTop: 4 },
  setupCard: { gap: 12 },
  setupIcon: { alignItems: "center", backgroundColor: colors.surfaceAlt, borderRadius: 18, height: 54, justifyContent: "center", width: 54 },
  setupStep: { alignItems: "center", flexDirection: "row", gap: 10 },
  stepNumber: { color: colors.surface, backgroundColor: colors.primaryDark, borderRadius: 999, fontFamily: fonts.label, fontSize: 10, lineHeight: 24, textAlign: "center", width: 24 },
  stepText: { color: colors.text, flex: 1, fontFamily: fonts.body, fontSize: 12.5 },
  });
}
