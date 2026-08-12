import { useHydraStore } from "@/lib/hydra-store";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "radix-connect-button": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

interface ConnectButtonProps {
  className?: string;
  showError?: boolean;
  fullWidth?: boolean;
  // legacy props kept for compatibility (ignored — styling is owned by Radix element)
  size?: "sm" | "default" | "lg";
  showAddress?: boolean;
  showDisconnect?: boolean;
}

export function ConnectButton({
  className,
  showError = true,
  fullWidth = false,
}: ConnectButtonProps) {
  const { wallet } = useHydraStore();
  const [connectError, setConnectError] = useState<string | null>(null);

  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        fullWidth ? "w-full items-stretch" : "items-center",
        className,
      )}
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
              const { connectWallet } = await import("@/lib/radix-connector");
              const result = await connectWallet();
              if (!result.ok) setConnectError(result.error);
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
