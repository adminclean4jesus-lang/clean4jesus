import { getRuntimePlatform, RuntimePlatform } from "@/features/platform/runtimePlatform";

export type ProtectionPlatformCapability = {
  available: boolean;
  id: "app-shielding" | "content-filtering" | "custom-interruption" | "usage-limits";
  label: string;
  requiresAppleEntitlement?: boolean;
};

export type ProtectionPlatformDescriptor = {
  id: "android" | "ios" | "web";
  isNativeProtectionAvailable: boolean;
  setupRoute: "/" | "/ios-protection";
  capabilities: ProtectionPlatformCapability[];
};

/**
 * This is the only shared description of the protection surface. Android keeps
 * its proven native engine; iOS can only declare a capability once Apple has
 * granted it and the native extension has passed device validation.
 */
export function getProtectionPlatformDescriptor(platform: RuntimePlatform = getRuntimePlatform()): ProtectionPlatformDescriptor {
  if (platform === "android") {
    return {
      id: "android",
      isNativeProtectionAvailable: true,
      setupRoute: "/",
      capabilities: [
        { available: true, id: "content-filtering", label: "VPN local y filtro DNS" },
        { available: true, id: "custom-interruption", label: "Interrupción personalizada" },
        { available: true, id: "usage-limits", label: "Límites y bloqueo de apps" },
      ],
    };
  }

  if (platform === "ios") {
    return {
      id: "ios",
      isNativeProtectionAvailable: false,
      setupRoute: "/ios-protection",
      capabilities: [
        { available: false, id: "app-shielding", label: "Escudo de apps", requiresAppleEntitlement: true },
        { available: false, id: "usage-limits", label: "Límites de tiempo", requiresAppleEntitlement: true },
        { available: false, id: "custom-interruption", label: "Pantalla de protección", requiresAppleEntitlement: true },
        { available: false, id: "content-filtering", label: "Filtro de red", requiresAppleEntitlement: true },
      ],
    };
  }

  return {
    id: "web",
    isNativeProtectionAvailable: false,
    setupRoute: "/",
    capabilities: [],
  };
}
