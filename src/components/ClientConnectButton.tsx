import { useEffect, useState, type ComponentProps, type ComponentType } from "react";
import { createIsomorphicFn } from "@tanstack/react-start";

type ConnectButtonProps = ComponentProps<"div"> & {
  showError?: boolean;
  fullWidth?: boolean;
};

export function ClientConnectButton(props: ConnectButtonProps) {
  const [mounted, setMounted] = useState(false);
  const [Button, setButton] = useState<ComponentType<ConnectButtonProps> | null>(null);
  const loadButton = createIsomorphicFn()
    .client(async () => (await import("./ClientConnectButton.client")).ClientConnectButton)
    .server(() => null);

  useEffect(() => {
    setMounted(true);
    void loadButton().then((mod) => {
      setButton(() => mod);
    });
  }, [loadButton]);

  if (!mounted || !Button) return null;
  return <Button {...props} />;
}
