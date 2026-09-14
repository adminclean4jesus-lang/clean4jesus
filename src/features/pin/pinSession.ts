const IOS_PIN_SESSION_TTL_MS = 60_000;
let iosPinSessionVerifiedAt = 0;
type IosPinEditAction = "edit-ios-limits" | "edit-ios-selection";
let iosPinSessionAction: IosPinEditAction | null = null;

export function isIosPinSessionVerified(action: IosPinEditAction): boolean {
  return iosPinSessionAction === action
    && iosPinSessionVerifiedAt > 0
    && Date.now() - iosPinSessionVerifiedAt < IOS_PIN_SESSION_TTL_MS;
}

export function markIosPinSessionVerified(action: IosPinEditAction): void {
  iosPinSessionAction = action;
  iosPinSessionVerifiedAt = Date.now();
}

export function consumeIosPinSessionVerified(action: IosPinEditAction): boolean {
  const verified = isIosPinSessionVerified(action);
  iosPinSessionVerifiedAt = 0;
  iosPinSessionAction = null;
  return verified;
}
