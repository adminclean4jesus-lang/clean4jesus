import { getRuntimePlatform } from "@/features/platform/runtimePlatform";
import { getJson, setJson, storageKeys } from "../../services/storage";

export type DnsProvider = "cloudflare-family" | "cleanbrowsing" | "nextdns";

export const dnsProviders: Record<DnsProvider, { label: string; primary: string; secondary: string }> = {
  "cloudflare-family": {
    label: "Cloudflare Family",
    primary: "1.1.1.3",
    secondary: "1.0.0.3",
  },
  cleanbrowsing: {
    label: "CleanBrowsing Family",
    primary: "185.228.168.168",
    secondary: "185.228.169.168",
  },
  nextdns: {
    label: "NextDNS",
    primary: "45.90.28.0",
    secondary: "45.90.30.0",
  },
};

export type ShieldNativeStatus = "not-configured" | "active" | "error";

export type ShieldState = {
  enabled: boolean;
  setupComplete: boolean;
  provider: DnsProvider;
  primaryDns: string;
  secondaryDns: string;
  nativeStatus: ShieldNativeStatus;
  statusMessage: string;
  activatedAt: string | null;
  disabledAt: string | null;
};

const defaultProvider: DnsProvider = "cloudflare-family";

function normalizeProvider(provider?: DnsProvider): DnsProvider {
  if (!provider || provider === "cleanbrowsing") {
    return defaultProvider;
  }

  return provider;
}

const defaultShieldState: ShieldState = {
  activatedAt: null,
  disabledAt: null,
  enabled: false,
  setupComplete: false,
  nativeStatus: "not-configured",
  primaryDns: dnsProviders[defaultProvider].primary,
  provider: defaultProvider,
  secondaryDns: dnsProviders[defaultProvider].secondary,
  statusMessage: "Refugio apagado. Primero confirma tus permisos y luego encendemos la protección.",
};

export function isShieldReady(state: ShieldState): boolean {
  return state.enabled && state.setupComplete;
}

export async function getShieldState(): Promise<ShieldState> {
  if (getRuntimePlatform() === "ios") {
    return unsupportedIosState();
  }

  const storedState = await getJson<ShieldState | null>(storageKeys.shieldState, null);

  if (storedState) {
    const provider = normalizeProvider(storedState.provider);
    const setupComplete = Boolean(storedState.setupComplete);
    return {
      ...defaultShieldState,
      ...storedState,
      enabled: setupComplete && Boolean(storedState.enabled),
      setupComplete,
      primaryDns: dnsProviders[provider].primary,
      provider,
      secondaryDns: dnsProviders[provider].secondary,
    };
  }

  return defaultShieldState;
}

export async function getShieldEnabled(): Promise<boolean> {
  return isShieldReady(await getShieldState());
}

export async function prepareShield(provider: DnsProvider = defaultProvider): Promise<ShieldState> {
  if (getRuntimePlatform() === "ios") {
    return unsupportedIosState();
  }

  const selectedProvider = dnsProviders[provider];
  const next: ShieldState = {
    activatedAt: null,
    disabledAt: null,
    enabled: false,
    setupComplete: false,
    nativeStatus: "not-configured",
    primaryDns: selectedProvider.primary,
    provider,
    secondaryDns: selectedProvider.secondary,
    statusMessage: "Refugio preparado. Sigue los pasos de DNS y accesibilidad para activarlo de verdad.",
  };

  await setJson(storageKeys.shieldState, next);
  await setJson(storageKeys.shieldEnabled, false);
  return next;
}

export async function enableShield(provider: DnsProvider = defaultProvider): Promise<ShieldState> {
  if (getRuntimePlatform() === "ios") {
    return unsupportedIosState();
  }

  const selectedProvider = dnsProviders[provider];
  const next: ShieldState = {
    activatedAt: new Date().toISOString(),
    disabledAt: null,
    enabled: true,
    setupComplete: true,
    nativeStatus: "not-configured",
    primaryDns: selectedProvider.primary,
    provider,
    secondaryDns: selectedProvider.secondary,
    statusMessage: "Protección activa en estado local. Si aun no completaste DNS y accesibilidad, vuelve a los pasos del refugio.",
  };

  await setJson(storageKeys.shieldState, next);
  await setJson(storageKeys.shieldEnabled, true);
  return next;
}

export async function disableShield(): Promise<ShieldState> {
  if (getRuntimePlatform() === "ios") {
    return unsupportedIosState();
  }

  const current = await getShieldState();
  const next: ShieldState = {
    ...current,
    disabledAt: new Date().toISOString(),
    enabled: false,
    setupComplete: current.setupComplete,
    nativeStatus: "not-configured",
    statusMessage: "Escudo desactivado. El estado quedo guardado localmente.",
  };

  await setJson(storageKeys.shieldState, next);
  await setJson(storageKeys.shieldEnabled, false);
  return next;
}

function unsupportedIosState(): ShieldState {
  return {
    ...defaultShieldState,
    statusMessage: "La protección nativa de iPhone todavía no está configurada en este dispositivo.",
  };
}
