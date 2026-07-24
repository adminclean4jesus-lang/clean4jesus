import { getJson, setJson, storageKeys } from "@/services/storage";

export type BankingModeState = {
  active: boolean;
  startedAt: string | null;
  endedAt: string | null;
};

const defaultBankingModeState: BankingModeState = {
  active: false,
  endedAt: null,
  startedAt: null,
};

export async function getBankingModeState(): Promise<BankingModeState> {
  return getJson<BankingModeState>(storageKeys.bankingMode, defaultBankingModeState);
}

export async function startBankingMode(): Promise<BankingModeState> {
  const next: BankingModeState = {
    active: true,
    endedAt: null,
    startedAt: new Date().toISOString(),
  };

  await setJson(storageKeys.bankingMode, next);
  return next;
}

export async function finishBankingMode(): Promise<BankingModeState> {
  const current = await getBankingModeState();
  const next: BankingModeState = {
    ...current,
    active: false,
    endedAt: new Date().toISOString(),
  };

  await setJson(storageKeys.bankingMode, next);
  return next;
}
