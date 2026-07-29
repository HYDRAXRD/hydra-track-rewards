// Radix dApp Toolkit singleton (browser-only).
// Replace VITE_RADIX_DAPP_DEFINITION_ADDRESS with your project's own dApp
// definition account address (mainnet) to identify HydraTrack in Radix Wallet.
import {
  RadixDappToolkit,
  DataRequestBuilder,
  RadixNetwork,
  type RadixDappToolkit as RDT,
} from "@radixdlt/radix-dapp-toolkit";

let rdt: RDT | null = null;

// A well-known HYDRA-related dApp definition on Mainnet can be swapped in via
// the env var below. Fallback is a public placeholder — connect still works but
// the wallet UI will show "Unknown dApp".
const DAPP_DEFINITION_ADDRESS =
  (import.meta as any).env?.VITE_RADIX_DAPP_DEFINITION_ADDRESS ||
  "account_rdx129mjzn6j04zy5c7jq447y6r60485z7sd3zvqxah0jfv70k36en8vt9";

export function getRdt(): RDT | null {
  if (typeof window === "undefined") return null;
  if (rdt) return rdt;
  rdt = RadixDappToolkit({
    dAppDefinitionAddress: DAPP_DEFINITION_ADDRESS,
    networkId: RadixNetwork.Mainnet,
    applicationName: "HydraTrack",
    applicationVersion: "1.0.0",
  });
  rdt.walletApi.setRequestData(DataRequestBuilder.accounts().exactly(1));
  return rdt;
}
