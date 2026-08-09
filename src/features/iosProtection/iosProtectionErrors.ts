export class IosProtectionError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'IosProtectionError';
  }
}

export const IOS_PROTECTION_ERROR_CODES = {
  UNSUPPORTED_PLATFORM: 'UNSUPPORTED_PLATFORM',
  AUTHORIZATION_DENIED: 'AUTHORIZATION_DENIED',
  APP_GROUP_UNAVAILABLE: 'APP_GROUP_UNAVAILABLE',
  INVALID_PIN: 'INVALID_PIN',
  MODULE_NOT_FOUND: 'MODULE_NOT_FOUND',
  RESCUE_ACTIVE: 'RESCUE_ACTIVE',
} as const;
