import * as Notifications from "expo-notifications";
import { AndroidNotificationPriority, PermissionStatus, SchedulableTriggerInputTypes } from "expo-notifications";
import { Linking, Platform } from "react-native";

import { getDevotionalCatalogSnapshot } from "@/features/devotionalPlans/devotionalCatalogStore";
import { getDevotionalPlanProgress } from "@/features/devotionalPlans/devotionalPlanService";
import { getJson, setJson, storageKeys } from "@/services/storage";
import { normalizeLanguage } from "@/features/i18n/i18n";
import { DevotionalPlanProgress } from "@/types/devotionalPlan";
import { DevotionalReminderSettings } from "@/types/devotionalReminder";

import { getDevotionalReminderTarget } from "./devotionalReminderPolicy";

const REMINDER_CHANNEL_ID = "devotional-reminders";
const DEFAULT_HOUR = 20;
const DEFAULT_MINUTE = 30;

const defaultSettings: DevotionalReminderSettings = {
  enabled: false,
  hour: DEFAULT_HOUR,
  minute: DEFAULT_MINUTE,
  scheduledNotificationId: null,
};

type PermissionSnapshot = "undetermined" | "denied" | "granted";
let previewNotificationId: string | null = null;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    priority: AndroidNotificationPriority.HIGH,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function ensureDevotionalReminderChannel() {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    importance: Notifications.AndroidImportance.HIGH,
    lightColor: "#071F52",
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    name: "Clean4Jesus",
    showBadge: false,
    sound: "default",
    vibrationPattern: [0, 180, 80, 180],
  });
}

export async function getDevotionalReminderPermissionStatus(): Promise<PermissionSnapshot> {
  if (Platform.OS === "web") {
    return "granted";
  }

  const permissions = await Notifications.getPermissionsAsync();
  if (permissions.granted || permissions.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return "granted";
  }

  if (permissions.status === PermissionStatus.DENIED) {
    return "denied";
  }

  return "undetermined";
}

async function requestDevotionalReminderPermission(): Promise<PermissionSnapshot> {
  if (Platform.OS === "web") {
    return "granted";
  }

  await ensureDevotionalReminderChannel();

  const current = await getDevotionalReminderPermissionStatus();
  if (current === "granted" || current === "denied") {
    return current;
  }

  const requested = await Notifications.requestPermissionsAsync();
  if (requested.granted || requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return "granted";
  }

  if (requested.status === PermissionStatus.DENIED) {
    return "denied";
  }

  return "undetermined";
}

export async function primeDevotionalReminderPermissionsOnLaunch(): Promise<PermissionSnapshot> {
  if (Platform.OS === "web") {
    return "granted";
  }

  await ensureDevotionalReminderChannel();
  const current = await getDevotionalReminderPermissionStatus();
  if (current !== "undetermined") {
    return current;
  }

  return requestDevotionalReminderPermission();
}

export async function getDevotionalReminderSettings(): Promise<DevotionalReminderSettings> {
  return getJson<DevotionalReminderSettings>(storageKeys.devotionalReminderSettings, defaultSettings);
}

async function saveDevotionalReminderSettings(settings: DevotionalReminderSettings) {
  await setJson(storageKeys.devotionalReminderSettings, settings);
  return settings;
}

async function cancelScheduledReminderById(identifier: string | null) {
  if (!identifier || Platform.OS === "web") {
    return;
  }

  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch {
    // Ignore stale ids from previous installs or cleared schedules.
  }
}

function buildDailyTrigger(hour: number, minute: number): Notifications.NotificationTriggerInput {
  if (Platform.OS === "android") {
    return {
      channelId: REMINDER_CHANNEL_ID,
      hour,
      minute,
      type: SchedulableTriggerInputTypes.DAILY,
    };
  }

  return {
    channelId: REMINDER_CHANNEL_ID,
    hour,
    minute,
    repeats: true,
    type: SchedulableTriggerInputTypes.CALENDAR,
  };
}

async function buildReminderContent(progress: DevotionalPlanProgress): Promise<Notifications.NotificationContentInput> {
  const language = normalizeLanguage(await getJson<string | null>(storageKeys.languagePreference, null));
  const target = getDevotionalReminderTarget(progress, language);

  return {
    body: target.body,
    color: "#071F52",
    data: {
      route: target.route,
      reminderKind: target.kind,
      source: "scheduled-devotional-reminder",
    },
    priority: AndroidNotificationPriority.HIGH,
    sound: true,
    subtitle: target.subtitle,
    title: target.title,
  };
}

async function scheduleDailyReminder(settings: DevotionalReminderSettings, progress: DevotionalPlanProgress) {
  if (Platform.OS === "web") {
    return null;
  }

  await ensureDevotionalReminderChannel();

  return Notifications.scheduleNotificationAsync({
    content: await buildReminderContent(progress),
    trigger: buildDailyTrigger(settings.hour, settings.minute),
  });
}

export async function syncDevotionalReminder(progress?: DevotionalPlanProgress): Promise<DevotionalReminderSettings> {
  const [settings, resolvedProgress] = await Promise.all([
    getDevotionalReminderSettings(),
    progress ? Promise.resolve(progress) : getDevotionalPlanProgress(),
  ]);

  if (Platform.OS === "web") {
    return settings;
  }

  await cancelScheduledReminderById(settings.scheduledNotificationId);

  if (!settings.enabled) {
    return saveDevotionalReminderSettings({
      ...settings,
      scheduledNotificationId: null,
    });
  }

  const permission = await getDevotionalReminderPermissionStatus();
  if (permission !== "granted") {
    return saveDevotionalReminderSettings({
      ...settings,
      enabled: false,
      scheduledNotificationId: null,
    });
  }

  const scheduledNotificationId = await scheduleDailyReminder(settings, resolvedProgress);
  return saveDevotionalReminderSettings({
    ...settings,
    scheduledNotificationId,
  });
}

export async function enableDevotionalReminder(progress?: DevotionalPlanProgress): Promise<{
  granted: boolean;
  settings: DevotionalReminderSettings;
}> {
  const permission = await requestDevotionalReminderPermission();
  const current = await getDevotionalReminderSettings();

  if (permission !== "granted") {
    const settings = await saveDevotionalReminderSettings({
      ...current,
      enabled: false,
      scheduledNotificationId: null,
    });

    return {
      granted: false,
      settings,
    };
  }

  const base = await saveDevotionalReminderSettings({
    ...current,
    enabled: true,
  });
  const settings = await syncDevotionalReminder(progress);

  return {
    granted: true,
    settings: {
      ...base,
      ...settings,
    },
  };
}

export async function disableDevotionalReminder(): Promise<DevotionalReminderSettings> {
  const current = await getDevotionalReminderSettings();
  await cancelScheduledReminderById(current.scheduledNotificationId);

  return saveDevotionalReminderSettings({
    ...current,
    enabled: false,
    scheduledNotificationId: null,
  });
}

export async function updateDevotionalReminderTime(
  hour: number,
  minute: number,
  progress?: DevotionalPlanProgress,
): Promise<DevotionalReminderSettings> {
  const current = await getDevotionalReminderSettings();
  await saveDevotionalReminderSettings({
    ...current,
    hour,
    minute,
  });

  return syncDevotionalReminder(progress);
}

async function buildPlanPreviewNotificationContent(): Promise<Notifications.NotificationContentInput> {
  const [progress, storedLanguage] = await Promise.all([
    getDevotionalPlanProgress(),
    getJson<string | null>(storageKeys.languagePreference, null),
  ]);
  const language = normalizeLanguage(storedLanguage);
  const target = getDevotionalReminderTarget(progress, language);

  if (target.kind === "plan") {
    return {
      body: target.body,
      color: "#071F52",
      data: {
        route: target.route,
        reminderKind: "plan-preview",
        source: "test-devotional-reminder",
      },
      priority: AndroidNotificationPriority.HIGH,
      sound: true,
      subtitle: target.subtitle,
      title: target.title,
    };
  }

  const fallbackPlan = getDevotionalCatalogSnapshot(language)[0];
  if (!fallbackPlan) {
    throw new Error("No devotional plan is available for the notification preview");
  }
  const fallbackBody = {
    es: `Ejemplo de recordatorio: vuelve a ${fallbackPlan.title} y continúa con la lectura de hoy.`,
    en: `Reminder example: return to ${fallbackPlan.title} and continue today's reading.`,
    fr: `Exemple de rappel : revenez à ${fallbackPlan.title} et continuez la lecture du jour.`,
    pt: `Exemplo de lembrete: volte a ${fallbackPlan.title} e continue a leitura de hoje.`,
  }[language];
  return {
    body: fallbackBody,
    color: "#071F52",
    data: {
      route: `/plans/${fallbackPlan.id}`,
      reminderKind: "plan-preview",
      source: "test-devotional-reminder",
    },
    priority: AndroidNotificationPriority.HIGH,
    sound: true,
    subtitle: { es: "Recordatorio de plan", en: "Plan reminder", fr: "Rappel de plan", pt: "Lembrete do plano" }[language],
    title: fallbackPlan.title,
  };
}

export async function sendTestDevotionalNotification(): Promise<{ ok: boolean }> {
  if (Platform.OS === "web") {
    return { ok: false };
  }

  await ensureDevotionalReminderChannel();

  const permission = await getDevotionalReminderPermissionStatus();
  if (permission !== "granted") {
    return { ok: false };
  }

  await cancelScheduledReminderById(previewNotificationId);
  const content = await buildPlanPreviewNotificationContent();
  previewNotificationId = await Notifications.scheduleNotificationAsync({
    content,
    trigger: {
      channelId: REMINDER_CHANNEL_ID,
      seconds: 2,
      type: SchedulableTriggerInputTypes.TIME_INTERVAL,
    },
  });

  return { ok: true };
}

export async function openNotificationSettings() {
  if (Platform.OS === "android") {
    try {
      const IntentLauncher = await import("expo-intent-launcher");
      await IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.APP_NOTIFICATION_SETTINGS, {
        extra: {
          "android.provider.extra.APP_PACKAGE": "com.clean4jesus.app",
        },
      });
      return;
    } catch {
      // Fallback below.
    }
  }

  await Linking.openSettings();
}
