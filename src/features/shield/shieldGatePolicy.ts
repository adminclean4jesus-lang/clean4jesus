type ProtectionGateState = {
  platform: string;
  iosProtectionEnabled: boolean;
  localShieldEnabled: boolean;
};

export function isProtectionGateEnabled({
  platform,
  iosProtectionEnabled,
  localShieldEnabled,
}: ProtectionGateState): boolean {
  return platform === "ios" ? iosProtectionEnabled : localShieldEnabled;
}
