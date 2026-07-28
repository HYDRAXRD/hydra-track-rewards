import { useEffect } from "react";
import { useHydraStore } from "@/lib/hydra-store";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const { connectError } = useHydraStore();

  // Ensure the Radix dApp Toolkit is initialized so the <radix-connect-button>
  // custom element is registered by the toolkit.
  useEffect(() => {
    import("@/lib/radix").then(({ getRdt }) => getRdt()).catch(() => {});
  }, []);

  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        fullWidth ? "w-full items-stretch" : "items-center",
        className,
      )}
    >
      <radix-connect-button />
      {showError && connectError && (
        <p className="inline-flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{connectError}</span>
        </p>
      )}
    </div>
  );
}
