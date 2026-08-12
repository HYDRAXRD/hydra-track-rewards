import "@tanstack/react-start/client-only";

import type { RadixDappToolkit as RDT } from "@radixdlt/radix-dapp-toolkit";

let rdt: RDT | null = null;

const DAPP_DEFINITION_ADDRESS =
  (import.meta as any).env?.VITE_RADIX_DAPP_DEFINITION_ADDRESS ||
  "account_rdx129mjzn6j04zy5c7jq447y6r60485z7sd3zvqxah0jfv70k36en8vt9";

async function getRdt(): Promise<RDT> {
  if (rdt) return rdt;
  const { RadixDappToolkit, DataRequestBuilder, RadixNetwork } = await import(
    "@radixdlt/radix-dapp-toolkit"
  );
  rdt = RadixDappToolkit({
    dAppDefinitionAddress: DAPP_DEFINITION_ADDRESS,
    networkId: RadixNetwork.Mainnet,
    applicationName: "HydraTrack",
    applicationVersion: "1.0.0",
  });
  rdt.walletApi.setRequestData(DataRequestBuilder.accounts().exactly(1));
  return rdt;
}

export async function connectWallet() {
  const connector = await getRdt();
  const result = await connector.walletApi.sendRequest();
  if (result.isErr()) {
    const err = result.error as { error?: string; message?: string } | undefined;
    return {
      ok: false as const,
      error: err?.message || err?.error || "Wallet request was cancelled.",
    };
  }
  const address = result.value?.accounts?.[0]?.address ?? null;
  if (address) localStorage.setItem("hydratrack:wallet", address);
  window.dispatchEvent(new Event("hydratrack:wallet-changed"));
  return { ok: true as const, address };
}

export async function disconnectWallet() {
  const connector = await getRdt().catch(() => null);
  connector?.disconnect();
  localStorage.removeItem("hydratrack:wallet");
  window.dispatchEvent(new Event("hydratrack:wallet-changed"));
}
