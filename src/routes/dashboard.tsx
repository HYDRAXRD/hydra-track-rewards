import { createFileRoute } from "@tanstack/react-router";
import { useHydraStore, useAllTasks } from "@/lib/hydra-store";
import { TaskCard } from "@/components/TaskCard";
import { AdminPanel } from "@/components/AdminPanel";
import { ActivityManager } from "@/components/ActivityManager";
import { ClientConnectButton } from "@/components/ClientConnectButton";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Dashboard — Track Tasks & $HYDR Rewards | HydraTrack" },
      {
        name: "description",
        content:
          "Complete HYDRA social and on-chain quests, submit proof, and track your $HYDR rewards and progress in real time.",
      },
      { property: "og:title", content: "HydraTrack Dashboard — Earn $HYDR" },
      {
        property: "og:description",
        content:
          "Your HYDRA quest hub: social and on-chain tasks, verification status, and total $HYDR earned.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function DashboardPage() {
  const { wallet, hydrated, isAdmin } = useHydraStore();
  const tasks = useAllTasks();

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="container mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-lg text-muted-foreground mb-6">
          Connect your Radix wallet to view the dashboard.
        </p>
        <ClientConnectButton />
      </div>
    );
  }

  // Admin view
  if (isAdmin) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8 flex flex-col gap-6">
        <AdminPanel adminWallet={wallet} />
        <ActivityManager />
      </div>
    );
  }

  // Participant view
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Your Tasks</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Complete tasks to earn $HYDR rewards. Onchain tasks require a screenshot of your system access and wallet connection.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
