let iosPinSessionVerified = false;

export function isIosPinSessionVerified(): boolean {
  return iosPinSessionVerified;
}

export function markIosPinSessionVerified(): void {
  iosPinSessionVerified = true;
}
