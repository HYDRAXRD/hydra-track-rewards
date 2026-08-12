import { useEffect, useState, type ComponentType } from "react";
import { createIsomorphicFn } from "@tanstack/react-start";

type AdminPanelProps = { adminWallet: string };

export function AdminPanel(props: AdminPanelProps) {
  const [mounted, setMounted] = useState(false);
  const [Panel, setPanel] = useState<ComponentType<AdminPanelProps> | null>(null);
  const loadPanel = createIsomorphicFn()
    .client(async () => (await import("./AdminPanel.client")).AdminPanel)
    .server(() => null);

  useEffect(() => {
    setMounted(true);
    void loadPanel().then((mod) => {
      setPanel(() => mod);
    });
  }, [loadPanel]);

  if (!mounted || !Panel) return null;
  return <Panel {...props} />;
}
