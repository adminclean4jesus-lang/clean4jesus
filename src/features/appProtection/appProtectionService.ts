import { NativeModules, Platform } from "react-native";

import { getJson, setJson } from "@/services/storage";

export type AppProtectionMode = "blocked" | "limited";

export type ProtectedApp = {
  aliases?: string[];
  category: "browser" | "social";
  displayName: string;
  packageName: string;
  riskLabel: string;
};

export type AppProtectionRule = {
  dailyLimitMinutes?: number;
  enabled: boolean;
  mode: AppProtectionMode;
  packageName: string;
};

export type AppProtectionUsage = {
  packageName: string;
  usedMs: number;
};

export type TemporaryAppUnlock = {
  packageName: string;
  remainingMs: number;
};

type NativeAppProtection = {
  getAppProtectionUsage?: (packageNamesJson: string) => Promise<string>;
  getTemporaryAppUnlocks?: (packageNamesJson: string) => Promise<string>;
  isAccessibilityInterventionEnabled?: () => Promise<boolean>;
  syncAppProtectionRules?: (rulesJson: string) => Promise<boolean>;
};

const storageKey = "clean4jesus.appProtection.rules.v1";

const nativeModule = NativeModules.Clean4JesusVpn as NativeAppProtection | undefined;

export const protectedApps: ProtectedApp[] = [
  { aliases: ["com.x.android"], category: "social", displayName: "X / Twitter", packageName: "com.twitter.android", riskLabel: "Scroll, tendencias y busquedas vulnerables" },
  { aliases: ["com.ss.android.ugc.trill"], category: "social", displayName: "TikTok", packageName: "com.zhiliaoapp.musically", riskLabel: "Videos cortos y contenido sugerido" },
  { category: "social", displayName: "Instagram", packageName: "com.instagram.android", riskLabel: "Reels, explorar y mensajes" },
  { category: "social", displayName: "Reddit", packageName: "com.reddit.frontpage", riskLabel: "Comunidades y busquedas sensibles" },
  { aliases: ["org.telegram.messenger.web"], category: "social", displayName: "Telegram", packageName: "org.telegram.messenger", riskLabel: "Canales, grupos y enlaces privados" },
  { category: "social", displayName: "Facebook", packageName: "com.facebook.katana", riskLabel: "Feed, grupos y videos sugeridos" },
  { aliases: ["com.chrome.beta", "com.chrome.dev"], category: "browser", displayName: "Chrome", packageName: "com.android.chrome", riskLabel: "Navegador principal" },
  { category: "browser", displayName: "Brave", packageName: "com.brave.browser", riskLabel: "Navegador alternativo" },
  { category: "browser", displayName: "Firefox", packageName: "org.mozilla.firefox", riskLabel: "Navegador alternativo" },
  { category: "browser", displayName: "Edge", packageName: "com.microsoft.emmx", riskLabel: "Navegador alternativo" },
];

export async function getAppProtectionRules(): Promise<AppProtectionRule[]> {
  const parsed = await getJson<AppProtectionRule[]>(storageKey, []);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((rule) => typeof rule.packageName === "string" && typeof rule.enabled === "boolean");
}

export async function saveAppProtectionRules(rules: AppProtectionRule[]): Promise<void> {
  const normalized = normalizeRules(rules);
  await setJson(storageKey, normalized);
  await syncNativeAppProtectionRules(normalized);
}

export async function setAppProtectionRule(nextRule: AppProtectionRule): Promise<AppProtectionRule[]> {
  const rules = await getAppProtectionRules();
  const next = normalizeRules([
    ...rules.filter((rule) => rule.packageName !== nextRule.packageName),
    nextRule,
  ]);
  await saveAppProtectionRules(next);
  return next;
}

export async function disableAppProtectionRule(packageName: string): Promise<AppProtectionRule[]> {
  const rules = await getAppProtectionRules();
  const next = rules.filter((rule) => rule.packageName !== packageName);
  await saveAppProtectionRules(next);
  return next;
}

export function getRuleForPackage(rules: AppProtectionRule[], packageName: string): AppProtectionRule | undefined {
  return rules.find((rule) => rule.packageName === packageName && rule.enabled);
}

export async function syncNativeAppProtectionRules(rules?: AppProtectionRule[]): Promise<boolean> {
  if (Platform.OS !== "android" || !nativeModule?.syncAppProtectionRules) {
    return false;
  }

  const activeRules = expandRulesForNative(normalizeRules(rules ?? (await getAppProtectionRules())));
  return nativeModule.syncAppProtectionRules(JSON.stringify(activeRules));
}

export async function getNativeAppProtectionUsage(packageNames: string[]): Promise<AppProtectionUsage[]> {
  if (Platform.OS !== "android" || !nativeModule?.getAppProtectionUsage) {
    return [];
  }

  try {
    const raw = await nativeModule.getAppProtectionUsage(JSON.stringify(Array.from(new Set(packageNames))));
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const candidate = item as Partial<AppProtectionUsage>;
      if (typeof candidate.packageName !== "string" || typeof candidate.usedMs !== "number") return [];
      return [{ packageName: candidate.packageName, usedMs: Math.max(0, candidate.usedMs) }];
    });
  } catch {
    return [];
  }
}

export async function getTemporaryAppUnlocks(packageNames: string[]): Promise<TemporaryAppUnlock[]> {
  if (Platform.OS !== "android" || !nativeModule?.getTemporaryAppUnlocks) return [];
  try {
    const raw = await nativeModule.getTemporaryAppUnlocks(JSON.stringify(Array.from(new Set(packageNames))));
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const candidate = item as Partial<TemporaryAppUnlock>;
      if (typeof candidate.packageName !== "string" || typeof candidate.remainingMs !== "number") return [];
      return [{ packageName: candidate.packageName, remainingMs: candidate.remainingMs }];
    });
  } catch {
    return [];
  }
}

export async function isAppProtectionAccessibilityEnabled(): Promise<boolean> {
  if (Platform.OS !== "android" || !nativeModule?.isAccessibilityInterventionEnabled) {
    return false;
  }

  try {
    return await nativeModule.isAccessibilityInterventionEnabled();
  } catch {
    return false;
  }
}

export function getPackagesForProtectedApp(app: ProtectedApp): string[] {
  return [app.packageName, ...(app.aliases ?? [])];
}

function normalizeRules(rules: AppProtectionRule[]): AppProtectionRule[] {
  const supportedPackages = new Set(protectedApps.map((app) => app.packageName));
  const byPackage = new Map<string, AppProtectionRule>();

  for (const rule of rules) {
    if (!supportedPackages.has(rule.packageName) || !rule.enabled) continue;
    byPackage.set(rule.packageName, {
      dailyLimitMinutes: rule.mode === "limited" ? clampLimit(rule.dailyLimitMinutes) : undefined,
      enabled: true,
      mode: rule.mode === "limited" ? "limited" : "blocked",
      packageName: rule.packageName,
    });
  }

  return Array.from(byPackage.values()).sort((a, b) => a.packageName.localeCompare(b.packageName));
}

function clampLimit(value?: number): number {
  if (!value || Number.isNaN(value)) return 15;
  return Math.min(240, Math.max(5, Math.round(value)));
}

function expandRulesForNative(rules: AppProtectionRule[]): AppProtectionRule[] {
  const aliasesByPackage = new Map(protectedApps.map((app) => [app.packageName, app.aliases ?? []]));

  return rules.flatMap((rule) => [
    rule,
    ...(aliasesByPackage.get(rule.packageName) ?? []).map((packageName) => ({
      ...rule,
      packageName,
    })),
  ]);
}
