import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { NativeModules, Platform } from "react-native";

import { getSupabaseClient, getSupabaseFunctionUrl } from "@/lib/supabase";
import { deleteSecureItem, getSecureItem, setSecureItem } from "@/services/secureStorage";

const DEVICE_ID_KEY = "clean4jesus.accountability.deviceId";
const DEVICE_SECRET_KEY = "clean4jesus.accountability.deviceSecret";
const DEVICE_RELATIONSHIP_KEY = "clean4jesus.accountability.relationshipId";
const INVITE_CODE_KEY = "clean4jesus.accountability.inviteCode";
const INVITE_EXPIRES_KEY = "clean4jesus.accountability.inviteExpiresAt";

export type AccountabilityStatus = {
  alertsEnabled: boolean;
  connectionId: string | null;
  guardianName: string | null;
  inviteCode: string | null;
  inviteExpiresAt: string | null;
  role: "owner" | "guardian" | null;
  riskThreshold: number;
  protectionHealthGraceMinutes: number;
  protectionHealthStatus: "disabled" | "pending" | "active";
  status: "none" | "pending" | "accepted";
};

type NativeAccountabilityModule = {
  clearAccountabilityDevice?: () => Promise<boolean>;
  configureAccountabilityDevice?: (
    signalEndpoint: string,
    healthEndpoint: string,
    healthMonitoringEnabled: boolean,
    deviceId: string,
    secret: string,
  ) => Promise<boolean>;
};

const nativeModule = NativeModules.Clean4JesusVpn as NativeAccountabilityModule | undefined;

export async function getAccountabilityStatus() {
  const result = await invoke<{ relationships: Relationship[] }>("list");
  return mapStatus(result.relationships[0]);
}

export async function createTrustedPersonInvite() {
  const result = await invoke<{ relationshipId: string; shareCode: string; expiresAt: string }>("create", { consentVersion: 1 });
  await cachePendingInvite(result.shareCode, result.expiresAt);
  return {
    alertsEnabled: false,
    connectionId: result.relationshipId,
    guardianName: null,
    inviteCode: result.shareCode,
    inviteExpiresAt: result.expiresAt,
    role: "owner" as const,
    riskThreshold: 3,
    protectionHealthGraceMinutes: 30,
    protectionHealthStatus: "disabled" as const,
    status: "pending" as const,
  };
}

export async function acceptTrustedPersonInvite(code: string) {
  const result = await invoke<{ relationshipId: string }>("accept", {
    shareCode: code.trim().toUpperCase(),
    consentVersion: 1,
  });
  await clearPendingInviteCache();
  await registerGuardianPushToken(result.relationshipId);
  return getAccountabilityStatus();
}

export async function sendTrustedPersonInviteEmail(relationshipId: string, email: string, shareCode: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!relationshipId || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || !/^[A-Fa-f0-9]{20}$/.test(shareCode.trim())) {
    throw new Error("invalid_invite_email");
  }
  await invoke("sendInviteEmail", {
    relationshipId,
    email: normalizedEmail,
    shareCode: shareCode.trim().toUpperCase(),
  });
  return true;
}

export async function revokeTrustedConnection() {
  const status = await getAccountabilityStatus();
  if (!status.connectionId) return status;
  await invoke("revoke", { relationshipId: status.connectionId });
  await clearPendingInviteCache();
  await clearAccountabilityDevice();
  return getAccountabilityStatus();
}

export async function configureTrustedAlerts(alertsEnabled: boolean, riskThreshold: number) {
  const status = await getAccountabilityStatus();
  if (status.role !== "guardian" || status.status !== "accepted" || !status.connectionId) {
    throw new Error("Solo la persona de confianza puede cambiar está regla.");
  }
  await invoke("configureAlerts", { alertsEnabled, relationshipId: status.connectionId, riskThreshold });
  return getAccountabilityStatus();
}

export async function requestProtectionHealthMonitoring(graceMinutes = 30) {
  const status = await getAccountabilityStatus();
  if (status.role !== "owner" || status.status !== "accepted" || !status.connectionId) {
    throw new Error("Solo quien recibe acompañamiento puede solicitar este modo.");
  }
  await invoke("configureProtectionHealth", {
    enabled: true,
    graceMinutes,
    relationshipId: status.connectionId,
  });
  return getAccountabilityStatus();
}

export async function acceptProtectionHealthMonitoring() {
  const status = await getAccountabilityStatus();
  if (status.role !== "guardian" || status.status !== "accepted" || !status.connectionId) {
    throw new Error("Solo la persona de confianza puede aceptar este modo.");
  }
  await invoke("acceptProtectionHealth", { relationshipId: status.connectionId });
  return getAccountabilityStatus();
}

export async function disableProtectionHealthMonitoring() {
  const status = await getAccountabilityStatus();
  if (status.role !== "owner" || status.status !== "accepted" || !status.connectionId) {
    throw new Error("Solo quien recibe acompañamiento puede desactivar este modo.");
  }
  await invoke("configureProtectionHealth", {
    enabled: false,
    graceMinutes: status.protectionHealthGraceMinutes,
    relationshipId: status.connectionId,
  });
  return getAccountabilityStatus();
}

export async function registerOwnerDevice() {
  if (Platform.OS !== "android") return false;
  const status = await getAccountabilityStatus();
  if (status.role !== "owner" || status.status !== "accepted" || !status.connectionId) return false;
  const existingDeviceId = await getSecureItem(DEVICE_ID_KEY);
  const existingSecret = await getSecureItem(DEVICE_SECRET_KEY);
  const existingRelationshipId = await getSecureItem(DEVICE_RELATIONSHIP_KEY);
  if (existingDeviceId && existingSecret && existingRelationshipId === status.connectionId) {
    return nativeModule?.configureAccountabilityDevice?.(
      getSupabaseFunctionUrl("accountability-signal"),
      getSupabaseFunctionUrl("accountability-health"),
      status.protectionHealthStatus === "active",
      existingDeviceId,
      existingSecret,
    ) ?? false;
  }
  await clearAccountabilityDevice();
  const registration = await invoke<{ deviceId: string; deviceSecret: string }>("registerOwnerDevice", { relationshipId: status.connectionId });
  const deviceId = registration.deviceId;
  const secret = registration.deviceSecret;
  await setSecureItem(DEVICE_ID_KEY, deviceId);
  await setSecureItem(DEVICE_SECRET_KEY, secret);
  await setSecureItem(DEVICE_RELATIONSHIP_KEY, status.connectionId);
  return nativeModule?.configureAccountabilityDevice?.(
    getSupabaseFunctionUrl("accountability-signal"),
    getSupabaseFunctionUrl("accountability-health"),
    status.protectionHealthStatus === "active",
    deviceId,
    secret,
  ) ?? false;
}

export async function registerGuardianPushToken(relationshipId: string) {
  if (Platform.OS === "web") return false;
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("risk-alerts", {
      importance: Notifications.AndroidImportance.HIGH,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE,
      name: "Acompañamiento privado",
      vibrationPattern: [0, 250, 180, 250],
    });
  }
  const permissions = await Notifications.getPermissionsAsync();
  const granted = permissions.granted ? permissions : await Notifications.requestPermissionsAsync();
  if (!granted.granted) return false;
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return false;
  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  await invoke("registerPushToken", { relationshipId, expoPushToken: token });
  return true;
}

export async function clearAccountabilityDevice() {
  if (Platform.OS === "android") {
    await nativeModule?.clearAccountabilityDevice?.();
  }
  await Promise.all([
    deleteSecureItem(DEVICE_ID_KEY),
    deleteSecureItem(DEVICE_SECRET_KEY),
    deleteSecureItem(DEVICE_RELATIONSHIP_KEY),
  ]);
  return true;
}

type Relationship = {
  acceptedAt: string | null;
  alertsEnabled: boolean;
  id: string;
  otherUserId?: string | null;
  protectionHealthGraceMinutes?: number;
  protectionHealthStatus?: "disabled" | "pending" | "active";
  riskThreshold: number;
  role: "owner" | "guardian";
  status: "pending" | "accepted" | "revoked";
};

async function mapStatus(relationship?: Relationship): Promise<AccountabilityStatus> {
  if (!relationship || relationship.status === "revoked") {
    await clearPendingInviteCache();
    return { alertsEnabled: false, connectionId: null, guardianName: null, inviteCode: null, inviteExpiresAt: null, role: null, riskThreshold: 3, protectionHealthGraceMinutes: 30, protectionHealthStatus: "disabled", status: "none" };
  }
  const [inviteCode, inviteExpiresAt, guardianName] = await Promise.all([
    relationship.role === "owner" && relationship.status === "pending" ? getSecureItem(INVITE_CODE_KEY) : Promise.resolve(null),
    relationship.role === "owner" && relationship.status === "pending" ? getSecureItem(INVITE_EXPIRES_KEY) : Promise.resolve(null),
    relationship.otherUserId ? getOtherDisplayName(relationship.otherUserId) : Promise.resolve(null),
  ]);

  if (!(relationship.role === "owner" && relationship.status === "pending")) {
    await clearPendingInviteCache();
  }

  return {
    alertsEnabled: relationship.status === "accepted" && relationship.alertsEnabled,
    connectionId: relationship.id,
    guardianName,
    inviteCode,
    inviteExpiresAt,
    role: relationship.role,
    riskThreshold: relationship.riskThreshold ?? 3,
    protectionHealthGraceMinutes: relationship.protectionHealthGraceMinutes ?? 30,
    protectionHealthStatus: relationship.protectionHealthStatus ?? "disabled",
    status: relationship.status,
  };
}

async function invoke<T = unknown>(operation: string, payload: Record<string, unknown> = {}) {
  const { data, error } = await getSupabaseClient().functions.invoke("accountability", {
    body: { operation, ...payload },
  });
  if (error) throw new Error("No pudimos completar esta acción. Revisa tu conexión e intenta de nuevo.");
  return data as T;
}

async function cachePendingInvite(inviteCode: string, inviteExpiresAt: string) {
  await Promise.all([
    setSecureItem(INVITE_CODE_KEY, inviteCode),
    setSecureItem(INVITE_EXPIRES_KEY, inviteExpiresAt),
  ]);
}

async function clearPendingInviteCache() {
  await Promise.all([
    deleteSecureItem(INVITE_CODE_KEY),
    deleteSecureItem(INVITE_EXPIRES_KEY),
  ]);
}

async function getOtherDisplayName(userId: string) {
  const { data } = await getSupabaseClient()
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .maybeSingle();
  return data?.display_name ?? null;
}
