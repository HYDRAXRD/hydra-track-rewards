import { useEffect, useState, type ComponentProps } from "react";
import { AlertCircle } from "lucide-react";
import { useHydraStore } from "@/lib/hydra-store";
import { cn } from "@/lib/utils";

// Define a tag personalizada para o TypeScript não reclamar
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

type ConnectButtonProps = ComponentProps<"div"> & {
  showError?: boolean;
  fullWidth?: boolean;
};

export function ClientConnectButton(props: ConnectButtonProps) {
  const { connectError } = useHydraStore();
  const [mounted, setMounted] = useState(false);
  const { showError = true, fullWidth = false, className, ...rest } = props;

  useEffect(() => {
    // 1. Marca como montado para renderizar o botão
    setMounted(true);

    // 2. Inicializa o Toolkit do Radix silenciosamente no fundo apenas no navegador
    // O Web Component <radix-connect-button /> ganha vida imediatamente após isso.
    let rdtInstance: any = null;
    let unsub: any = null;

    const initRadix = async () => {
      try {
        const { RadixDappToolkit, DataRequestBuilder, RadixNetwork } = await import(
          "@radixdlt/radix-dapp-toolkit"
        );
        
        const dAppAddress =
          (import.meta as any).env?.VITE_RADIX_DAPP_DEFINITION_ADDRESS ||
          "account_rdx129mjzn6j04zy5c7jq447y6r60485z7sd3zvqxah0jfv70k36en8vt9";

        rdtInstance = RadixDappToolkit({
          dAppDefinitionAddress: dAppAddress,
          networkId: RadixNetwork.Mainnet,
          applicationName: "HydraTrack",
          applicationVersion: "1.0.0",
        });

        rdtInstance.walletApi.setRequestData(DataRequestBuilder.accounts().exactly(1));

        // Sincroniza a conta conectada (se houver) com o nosso localStorage
        unsub = rdtInstance.walletApi.walletData$.subscribe((data: any) => {
          const address = data?.accounts?.[0]?.address ?? null;
          if (address) {
            localStorage.setItem("hydratrack:wallet", address);
          } else {
            localStorage.removeItem("hydratrack:wallet");
          }
          window.dispatchEvent(new Event("hydratrack:wallet-changed"));
        });

      } catch (error) {
        console.error("Erro ao inicializar o Radix:", error);
      }
    };

    initRadix();

    return () => {
      if (unsub && typeof unsub.unsubscribe === "function") {
        unsub.unsubscribe();
      }
    };
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          "h-[42px] min-w-[140px] animate-pulse rounded-md bg-secondary/50",
          fullWidth && "w-full",
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        fullWidth ? "w-full items-stretch" : "items-center",
        className
      )}
      {...rest}
    >
      {/* O Web Component NATIVO da Radix - Ele cria o botão com o layout e dropdown oficiais */}
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