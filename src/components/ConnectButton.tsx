import { Button } from "@/components/ui/button";
import { useHydraStore, shortAddr } from "@/lib/hydra-store";
import { Wallet, LogOut, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Size = "sm" | "default" | "lg";

interface ConnectButtonProps {
  size?: Size;
  className?: string;
  showAddress?: boolean;
  showDisconnect?: boolean;
  showError?: boolean;
  fullWidth?: boolean;
}

export function ConnectButton({
  size = "default",
  className,
  showAddress = true,
  showDisconnect = true,
  showError = true,
  fullWidth = false,
}: ConnectButtonProps) {
  const { wallet, hydrated, connect, disconnect, connecting, connectError } =
    useHydraStore();

  if (hydrated && wallet) {
    return (
      <div className={cn("flex items-center gap-2", fullWidth && "w-full justify-center", className)}>
        {showAddress && (
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-xs font-mono text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-teal" />
            {shortAddr(wallet)}
          </span>
        )}
        {showDisconnect && (
          <Button
            variant="ghost"
            size="icon"
            onClick={disconnect}
            title="Disconnect wallet"
            aria-label="Disconnect wallet"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", fullWidth && "w-full", className)}>
      <Button
        onClick={connect}
        size={size}
        disabled={connecting || !hydrated}
        className={cn("btn-gradient btn-gradient-hover border-0", fullWidth && "w-full")}
      >
        {connecting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Connecting…
          </>
        ) : (
          <>
            <Wallet className="h-4 w-4" /> Connect Wallet
          </>
        )}
      </Button>
      {showError && connectError && (
        <p className="inline-flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{connectError}</span>
        </p>
      )}
    </div>
  );
}
