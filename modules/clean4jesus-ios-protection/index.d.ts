export type AuthorizationStatus = "not-determined" | "denied" | "approved";

export type SelectionSummary = {
  applications: number;
  categories: number;
  webDomains: number;
};

export type RefugeStatus = {
  monitoringActive: boolean;
  shieldActive: boolean;
  usageLimitMinutes: number;
  webFilterActive: boolean;
};

declare const Clean4JesusIosProtection: {
  activateRefuge(minutes: number): Promise<RefugeStatus>;
  applyShield(): Promise<SelectionSummary>;
  clearRefuge(): Promise<void>;
  clearShield(): Promise<void>;
  consumeRescueRequest(): Promise<boolean>;
  getAuthorizationStatus(): Promise<AuthorizationStatus>;
  getRefugeStatus(): Promise<RefugeStatus>;
  getSelectionSummary(): Promise<SelectionSummary>;
  getShieldStatus(): Promise<boolean>;
  presentFamilyActivityPicker(): Promise<SelectionSummary>;
  requestAuthorization(): Promise<AuthorizationStatus>;
  scheduleUsageLimit(minutes: number): Promise<void>;
  setLanguage(language: "es" | "en" | "fr" | "pt"): Promise<void>;
};

export default Clean4JesusIosProtection;
