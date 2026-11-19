export const legacyPinLength = 4;
export const pinLength = 8;

export function normalizePinInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, pinLength);
}

export function isCompletePin(value: string): boolean {
  return /^\d{4}$/.test(value) || /^\d{8}$/.test(value);
}

export function pinsMatch(pin: string, confirmPin: string): boolean {
  return isCompletePin(pin) && pin === confirmPin;
}
