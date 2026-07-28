import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TaskCard } from "@/components/TaskCard";
import { ConnectButton } from "@/components/ConnectButton";
import {
  useHydraStore,
  TASKS,
  TOTAL_REWARDS,
  shortAddr,
  tierFor,
} from "@/lib/hydra-store";
import { Copy, Wallet, Trophy, CheckCircle2, Clock } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — HydraTrack" },
      {
        name: "description",
        content:
          "Track your $HYDR rewards, complete social and on-chain quests, and monitor your progress across the HYDRA ecosystem.",
      },
      { property: "og:title", content: "HydraTrack Dashboard" },
      {
        property: "og:description",
        content: "Your HYDRA rewards, quests, and progress in one place.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const {
    wallet,
    hydrated,
    totalEarned,
    completedCount,
    progress,
    completed,
  } = useHydraStore();
  const [filter, setFilter] = useState<"all" | "social" | "onchain">("all");
  const [copied, setCopied] = useState(false);
  const tier = tierFor(totalEarned);

  const tasks = useMemo(
    () => (filter === "all" ? TASKS : TASKS.filter((t) => t.category === filter)),
    [filter],
  );
  const history = TASKS.filter((t) => completed[t.id])
    .map((t) => ({ ...t, at: completed[t.id] }))
    .sort((a, b) => b.at - a.at);

  const copy = async () => {
    if (!wallet) return;
    await navigator.clipboard.writeText(wallet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  if (hydrated && !wallet) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="glass-card rounded-3xl p-10">
          <Wallet className="mx-auto h-10 w-10 text-teal" />
          <h1 className="mt-4 text-2xl font-bold">Connect your Radix wallet</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your wallet address is your HydraTrack identity. Connect to start
            completing quests and earning $HYDR.
          </p>
          <div className="mt-6 flex justify-center">
            <ConnectButton size="lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Wallet header */}
      <div className="glass-card rounded-3xl p-6 md:p-8 relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-30 blur-3xl"
          style={{ background: "var(--gradient-brand)" }} />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
              Connected wallet
              <span className={`inline-flex items-center gap-1 rounded-full border border-border bg-background/60 px-2 py-0.5 ${tier.color}`}>
                <Trophy className="h-3 w-3" /> {tier.name}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="font-mono text-lg break-all">{wallet ? shortAddr(wallet) : "—"}</span>
              <Button size="icon" variant="ghost" onClick={copy}>
                <Copy className="h-4 w-4" />
              </Button>
              {copied && <span className="text-xs text-teal">copied</span>}
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Overall progress</span>
                <span className="font-semibold">
                  {completedCount}/{TASKS.length} quests · {progress}%
                </span>
              </div>
              <Progress value={progress} className="h-2 bg-secondary" />
              {tier.next && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {(tier.next - totalEarned).toLocaleString()} $HYDR to reach next tier
                </p>
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-background/60 p-5 flex flex-col justify-center">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Total earned
            </div>
            <div className="mt-1 text-4xl font-black gradient-text">
              {totalEarned.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              of {TOTAL_REWARDS.toLocaleString()} $HYDR available
            </div>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link to="/leaderboard">See leaderboard</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-10 flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold">Quests</h2>
        <div className="inline-flex rounded-lg border border-border bg-secondary/50 p-1 text-sm">
          {(
            [
              { k: "all", l: "All" },
              { k: "social", l: "Social" },
              { k: "onchain", l: "On-chain" },
            ] as const
          ).map((f) => (
            <button
              key={f.k}
              onClick={() => setFilter(f.k)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filter === f.k
                  ? "btn-gradient text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.l}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tasks.map((t) => (
          <TaskCard key={t.id} task={t} />
        ))}
      </div>

      {/* History */}
      <div className="mt-14">
        <h2 className="text-2xl font-bold mb-4">Task history</h2>
        <div className="glass-card rounded-2xl divide-y divide-border/50 overflow-hidden">
          {history.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Clock className="h-4 w-4" /> No completed tasks yet — start with a social quest.
            </div>
          ) : (
            history.map((h) => (
              <div key={h.id} className="flex items-center gap-3 p-4">
                <CheckCircle2 className="h-5 w-5 text-teal shrink-0" />
                <div className="flex-1">
                  <div className="font-medium">{h.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(h.at).toLocaleString()}
                  </div>
                </div>
                <span className="text-sm font-semibold gradient-text">
                  +{h.reward.toLocaleString()} $HYDR
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
