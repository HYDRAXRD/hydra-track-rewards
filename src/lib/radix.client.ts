import type { RadixDappToolkit as RDT } from "@radixdlt/radix-dapp-toolkit";

let rdt: RDT | null = null;

const DAPP_DEFINITION_ADDRESS =
  (import.meta as any).env?.VITE_RADIX_DAPP_DEFINITION_ADDRESS ||
  "account_rdx129mjzn6j04zy5c7jq447y6r60485z7sd3zvqxah0jfv70k36en8vt9";

export async function getRdt(): Promise<RDT | null> {
  if (typeof window === "undefined") return null;
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
