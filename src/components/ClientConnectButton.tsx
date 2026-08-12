import { useEffect, useState, type ComponentType, type ComponentProps } from "react";

type ConnectButtonProps = ComponentProps<"div"> & {
  showError?: boolean;
  fullWidth?: boolean;
};

export function ClientConnectButton(props: ConnectButtonProps) {
  const [ConnectButton, setConnectButton] = useState<null | ComponentType<{
    className?: string;
    showError?: boolean;
    fullWidth?: boolean;
  }>>(null);

  useEffect(() => {
    let active = true;
    import("./ConnectButton").then((mod) => {
      if (!active) return;
      setConnectButton(() => mod.ConnectButton);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!ConnectButton) {
    return <div {...props} />;
  }

  const { showError, fullWidth, ...rest } = props;
  return <ConnectButton showError={showError} fullWidth={fullWidth} {...rest} />;
}
