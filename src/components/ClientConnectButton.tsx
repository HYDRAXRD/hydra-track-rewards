import { useEffect, useState, type ComponentProps, type ComponentType } from "react";
import { createIsomorphicFn } from "@tanstack/react-start";
import { cn } from "@/lib/utils";

type ConnectButtonProps = ComponentProps<"div"> & {
  showError?: boolean;
  fullWidth?: boolean;
  size?: "sm" | "default" | "lg";
};

export function ClientConnectButton(props: ConnectButtonProps) {
  const [mounted, setMounted] = useState(false);
  const [Button, setButton] = useState<ComponentType<ConnectButtonProps> | null>(null);

  // A abordagem OBRIGATÓRIA do TanStack Start para não dar erro de import-protection
  const loadButton = createIsomorphicFn()
    .client(async () => {
      const mod = await import("./ClientConnectButton.client");
      return mod.ClientConnectButton;
    })
    .server(() => {
      return null;
    });

  useEffect(() => {
    setMounted(true);
    void Promise.resolve(loadButton()).then((mod) => {
      if (mod) setButton(() => mod);
    });
  }, [loadButton]);

  const fallback = (
    <div
      className={cn(
        "h-[42px] min-w-[140px] animate-pulse rounded-md bg-secondary/50",
        props.fullWidth && "w-full",
        props.className
      )}
    />
  );

  // Se não montou ou o botão não carregou, mostra o fallback cinza (seguro no SSR)
  if (!mounted || !Button) return fallback;

  return <Button {...props} />;
}