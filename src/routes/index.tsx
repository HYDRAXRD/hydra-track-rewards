import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useHydraStore, TASKS, TOTAL_REWARDS, shortAddr } from "@/lib/hydra-store";
import { ConnectButton } from "@/components/ConnectButton";
import {
  Wallet,
  Trophy,
  Sparkles,
  Zap,
  ShieldCheck,
  ArrowRight,
  Droplets,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HydraTrack — Engage. Earn. Grow with HYDRA." },
      {
        name: "description",
        content:
          "Earn $HYDR tokens by completing social and on-chain quests across the HYDRA ecosystem on Radix DLT.",
      },
      { property: "og:title", content: "HydraTrack — Engage. Earn. Grow with HYDRA." },
      {
        property: "og:description",
        content:
          "Complete social and on-chain quests across the HYDRA ecosystem and earn $HYDR rewards.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { wallet, totalEarned, completedCount } = useHydraStore();

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
            style={{ background: "var(--gradient-brand)" }} />
        </div>
        <div className="mx-auto max-w-6xl px-4 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-teal" />
            Powered by Radix DLT · HYDRA ecosystem
          </div>
          <h1 className="mt-6 text-5xl sm:text-6xl md:text-7xl font-black tracking-tight">
            <span className="gradient-text">Engage. Earn.</span>
            <br />
            Grow with HYDRA.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            HydraTrack is the community rewards hub for the HYDRA ecosystem.
            Complete social and on-chain quests, and earn $HYDR tokens directly to your Radix wallet.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {wallet ? (
              <Button asChild size="lg" className="btn-gradient btn-gradient-hover border-0">
                <Link to="/dashboard">
                  Open Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={connect}
                className="btn-gradient btn-gradient-hover border-0"
              >
                <Wallet className="h-4 w-4" /> Connect Radix Wallet
              </Button>
            )}
            <Button asChild size="lg" variant="outline">
              <Link to="/about">Learn about HYDRA</Link>
            </Button>
          </div>

          {wallet && (
            <div className="mx-auto mt-8 inline-flex items-center gap-4 rounded-2xl glass-card px-5 py-3 text-sm">
              <span className="font-mono text-muted-foreground">{shortAddr(wallet)}</span>
              <span className="h-4 w-px bg-border" />
              <span><span className="gradient-text font-bold">{totalEarned.toLocaleString()}</span> $HYDR earned</span>
              <span className="h-4 w-px bg-border" />
              <span>{completedCount}/{TASKS.length} tasks</span>
            </div>
          )}
        </div>

        {/* Stats strip */}
        <div className="mx-auto max-w-5xl px-4 pb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total rewards", value: `${TOTAL_REWARDS.toLocaleString()} $HYDR` },
              { label: "Quests available", value: TASKS.length },
              { label: "Networks", value: "Radix DLT" },
              { label: "Wallet", value: "Radix Connector" },
            ].map((s) => (
              <div key={s.label} className="glass-card rounded-xl p-4 text-center">
                <div className="text-xl font-bold">{s.value}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold">How it works</h2>
          <p className="mt-3 text-muted-foreground">
            Three simple steps to start earning $HYDR for supporting the HYDRA ecosystem.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            {
              icon: Wallet,
              title: "1. Connect wallet",
              text: "Link your Radix wallet with the Radix Wallet Connector. Your address is your identity across HydraTrack.",
            },
            {
              icon: Zap,
              title: "2. Complete quests",
              text: "Follow HYDRA on social, buy or stake $HYDR, use HydraBubbles, or win the Final Battle in Battle Arena.",
            },
            {
              icon: Trophy,
              title: "3. Earn & climb",
              text: "Every verified quest credits $HYDR to your balance. Rise through Bronze, Silver and Gold tiers on the leaderboard.",
            },
          ].map((c) => (
            <div key={c.title} className="glass-card rounded-2xl p-6">
              <div className="grid h-11 w-11 place-items-center rounded-xl btn-gradient">
                <c.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="mt-4 font-semibold text-lg">{c.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ecosystem */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-30 blur-3xl"
            style={{ background: "var(--gradient-brand)" }} />
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-teal">
                <Droplets className="h-3.5 w-3.5" /> The HYDRA ecosystem
              </div>
              <h2 className="mt-4 text-3xl md:text-4xl font-bold">
                A memecoin, a battle arena, an entire toolkit.
              </h2>
              <p className="mt-4 text-muted-foreground">
                HYDRA is more than a token — it's a growing suite of tools on Radix:
                HydraSwap for trading, HydraBubbles for market insights, the Burn Portal
                to reduce supply, DefiPlaza staking for yield, and Battle Arena where
                players compete for glory.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["HydraSwap", "HydraBubbles", "Burn Portal", "Battle Arena", "DefiPlaza"].map((n) => (
                  <span key={n} className="rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs">{n}</span>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <Button asChild variant="outline">
                  <a href="https://hydraxrd.com" target="_blank" rel="noreferrer">Visit hydraxrd.com</a>
                </Button>
                <Button asChild className="btn-gradient btn-gradient-hover border-0">
                  <Link to="/dashboard">Start earning</Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { title: "Social boost", reward: "300 $HYDR", desc: "6 social tasks" },
                { title: "Buy $HYDR", reward: "1,000 $HYDR", desc: "HydraSwap" },
                { title: "Stake $HYDR", reward: "1,000 $HYDR", desc: "DefiPlaza" },
                { title: "Burn $HYDR", reward: "1,000 $HYDR", desc: "Burn Portal" },
                { title: "HydraBubbles", reward: "100 $HYDR", desc: "Try the tool" },
                { title: "Battle Arena", reward: "250 $HYDR", desc: "Win Final Battle" },
              ].map((t) => (
                <div key={t.title} className="rounded-xl border border-border bg-background/60 p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">{t.desc}</div>
                  <div className="mt-1 font-semibold">{t.title}</div>
                  <div className="mt-2 text-sm gradient-text font-bold">+{t.reward}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <ShieldCheck className="mx-auto h-10 w-10 text-teal" />
        <h2 className="mt-4 text-3xl md:text-4xl font-bold">
          Ready to earn <span className="gradient-text">$HYDR</span>?
        </h2>
        <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
          Connect your Radix wallet, complete verified tasks, and grow with the HYDRA community.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          {wallet ? (
            <Button asChild size="lg" className="btn-gradient btn-gradient-hover border-0">
              <Link to="/dashboard">Go to Dashboard <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          ) : (
            <Button size="lg" onClick={connect} className="btn-gradient btn-gradient-hover border-0">
              <Wallet className="h-4 w-4" /> Connect Wallet
            </Button>
          )}
          <Button asChild size="lg" variant="outline">
            <Link to="/leaderboard">View Leaderboard</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
