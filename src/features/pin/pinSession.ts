let iosPinSessionVerified = false;
const IOS_SENSITIVE_ACTION_TTL_MS = 60_000;

export type IosSensitiveAction =
  | "edit-ios-limits"
  | "edit-ios-selection";

let pendingIosSensitiveAction: {
  action: IosSensitiveAction;
  expiresAt: number;
} | null = null;

export function isIosPinSessionVerified(): boolean {
  return iosPinSessionVerified;
}

export function markIosPinSessionVerified(): void {
  iosPinSessionVerified = true;
}

export function grantIosSensitiveAction(
  action: IosSensitiveAction,
  now = Date.now(),
): void {
  pendingIosSensitiveAction = {
    action,
    expiresAt: now + IOS_SENSITIVE_ACTION_TTL_MS,
  };
}

export function consumeIosSensitiveAction(
  now = Date.now(),
): IosSensitiveAction | null {
  const pendingAction = pendingIosSensitiveAction;
  pendingIosSensitiveAction = null;

  if (!pendingAction || now > pendingAction.expiresAt) return null;
  return pendingAction.action;
}
