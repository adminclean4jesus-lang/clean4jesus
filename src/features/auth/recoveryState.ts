import { authStorage } from "@/lib/supabaseStorage";

const RECOVERY_GRANT_KEY = "clean4jesus.auth.password-recovery.v1";
const RECOVERY_GRANT_LIFETIME_MS = 15 * 60 * 1000;

type RecoveryGrant = {
  expiresAt: number;
  userId: string;
};

export async function authorizePasswordRecovery(userId: string) {
  const grant: RecoveryGrant = {
    expiresAt: Date.now() + RECOVERY_GRANT_LIFETIME_MS,
    userId,
  };
  await authStorage.setItem(RECOVERY_GRANT_KEY, JSON.stringify(grant));
}

export async function clearPasswordRecovery() {
  await authStorage.removeItem(RECOVERY_GRANT_KEY);
}

export async function hasPasswordRecoveryAuthorization(userId: string) {
  const grant = await readGrant();
  if (!grant || grant.userId !== userId) {
    if (grant) {
      await clearPasswordRecovery();
    }
    return false;
  }
  return true;
}

async function readGrant(): Promise<RecoveryGrant | null> {
  const stored = await authStorage.getItem(RECOVERY_GRANT_KEY);
  if (!stored) {
    return null;
  }

  try {
    const candidate = JSON.parse(stored) as Partial<RecoveryGrant>;
    if (
      typeof candidate.userId !== "string"
      || typeof candidate.expiresAt !== "number"
      || candidate.expiresAt <= Date.now()
    ) {
      await clearPasswordRecovery();
      return null;
    }
    return candidate as RecoveryGrant;
  } catch {
    await clearPasswordRecovery();
    return null;
  }
}
