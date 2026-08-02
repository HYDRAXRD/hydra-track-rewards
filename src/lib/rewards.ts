// Builds and submits the $HYDR reward transaction through the Radix Wallet.
import { ADMIN_WALLET, HYDR_RESOURCE_ADDRESS } from "./hydra-store";

export interface RewardResult {
  ok: boolean;
  hash?: string;
  error?: string;
}

/** Radix Decimal literals must be plain decimal strings (no exponent, no separators). */
export function toDecimalString(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) return "0";
  // 18 is the max divisibility on Radix; trim trailing zeros.
  const fixed = amount.toFixed(Math.min(18, 8));
  return fixed.replace(/\.?0+$/, "") || "0";
}

export function isAccountAddress(addr: string): boolean {
  return /^account_rdx1[0-9a-z]{40,}$/.test(addr.trim());
}

export function buildRewardManifest(recipient: string, amount: number): string {
  const dec = toDecimalString(amount);
  return `CALL_METHOD
    Address("${ADMIN_WALLET}")
    "lock_fee"
    Decimal("5")
;
CALL_METHOD
    Address("${ADMIN_WALLET}")
    "withdraw"
    Address("${HYDR_RESOURCE_ADDRESS}")
    Decimal("${dec}")
;
TAKE_FROM_WORKTOP
    Address("${HYDR_RESOURCE_ADDRESS}")
    Decimal("${dec}")
    Bucket("reward_bucket")
;
CALL_METHOD
    Address("${recipient}")
    "try_deposit_or_abort"
    Bucket("reward_bucket")
    None
;
`;
}

export async function sendHydrReward(
  recipient: string,
  amount: number,
): Promise<RewardResult> {
  const to = recipient.trim();
  if (!isAccountAddress(to)) {
    return { ok: false, error: "Invalid recipient account address." };
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "Reward amount must be greater than zero." };
  }

  try {
    const { getRdt } = await import("./radix");
    const rdt = getRdt();
    if (!rdt) return { ok: false, error: "Radix Wallet connector unavailable." };

    const connected =
      rdt.walletApi.getWalletData()?.accounts?.[0]?.address ?? null;
    if (!connected) {
      return { ok: false, error: "Connect the admin wallet before sending rewards." };
    }
    if (connected !== ADMIN_WALLET) {
      return {
        ok: false,
        error: "Rewards can only be sent from the admin account.",
      };
    }

    const result = await rdt.walletApi.sendTransaction({
      transactionManifest: buildRewardManifest(to, amount),
      version: 1,
      message: `HydraTrack reward: ${toDecimalString(amount)} HYDR`,
    });

    if (result.isErr()) {
      const err = result.error as { message?: string; error?: string } | undefined;
      return {
        ok: false,
        error: err?.message || err?.error || "Transaction rejected in the wallet.",
      };
    }

    const value = result.value as { transactionIntentHash?: string } | undefined;
    return { ok: true, hash: value?.transactionIntentHash };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unexpected error sending the transaction.";
    return { ok: false, error: msg };
  }
}
