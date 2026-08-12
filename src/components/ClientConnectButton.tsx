import { useState, type ComponentProps } from "react";
import { AlertCircle } from "lucide-react";
import { useHydraStore } from "@/lib/hydra-store";
import { cn } from "@/lib/utils";

type ConnectButtonProps = ComponentProps<"div"> & {
  showError?: boolean;
  fullWidth?: boolean;
};

export function ClientConnectButton(props: ConnectButtonProps) {
  const { wallet } = useHydraStore();
  const [connectError, setConnectError] = useState<string | null>(null);
  const { showError = true, fullWidth = false, className, ...rest } = props;

  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        fullWidth ? "w-full items-stretch" : "items-center",
        className,
      )}
      {...rest}
    >
      {wallet ? (
        <div className="rounded-md border border-border bg-secondary/60 px-3 py-2 text-sm">
          Wallet connected
        </div>
      ) : (
        <button
          type="button"
          className="rounded-md border border-border bg-secondary/60 px-3 py-2 text-sm"
          onClick={async () => {
            setConnectError(null);
            try {
              const { RadixDappToolkit, DataRequestBuilder, RadixNetwork } = await import("@radixdlt/radix-dapp-toolkit");
              const connector = RadixDappToolkit({
                dAppDefinitionAddress:
                  "account_rdx129mjzn6j04zy5c7jq447y6r60485z7sd3zvqxah0jfv70k36en8vt9",
                networkId: RadixNetwork.Mainnet,
                applicationName: "HydraTrack",
                applicationVersion: "1.0.0",
              });
              connector.walletApi.setRequestData(DataRequestBuilder.accounts().exactly(1));
              const result = await connector.walletApi.sendRequest();
              if (result.isErr()) {
                const err = result.error as { error?: string; message?: string } | undefined;
                setConnectError(err?.message || err?.error || "Wallet request was cancelled.");
                return;
              }
              const address = result.value?.accounts?.[0]?.address ?? null;
              if (address) localStorage.setItem("hydratrack:wallet", address);
              window.dispatchEvent(new Event("hydratrack:wallet-changed"));
            } catch (error) {
              setConnectError(error instanceof Error ? error.message : "Could not connect wallet.");
            }
          }}
        >
          Connect Wallet
        </button>
      )}
      {showError && connectError && (
        <p className="inline-flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{connectError}</span>
        </p>
      )}
    </div>
  );
}
