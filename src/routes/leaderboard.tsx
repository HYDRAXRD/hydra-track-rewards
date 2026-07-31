import { createFileRoute } from "@tanstack/react-router";
import {
  LEADERBOARD_MOCK,
  useHydraStore,
  shortAddr,
  tierFor,
} from "@/lib/hydra-store";
import { Trophy, Medal, Award } from "lucide-react";
import { useMemo } from "react";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — HydraTrack" },
      {
        name: "description",
        content:
          "See the top HYDRA community members ranked by total $HYDR earned through HydraTrack quests.",
      },
      { property: "og:title", content: "HydraTrack Leaderboard" },
      {
        property: "og:description",
        content: "Top earners in the HYDRA ecosystem, ranked by $HYDR rewards.",
      },
    ],
  }),
  component: Leaderboard,
});

function Leaderboard() {
  const { wallet, totalEarned } = useHydraStore();

  const rows = useMemo(() => {
    const base = [...LEADERBOARD_MOCK];
    if (wallet) {
      base.push({ addr: wallet, hydr: totalEarned });
    }
    return base.sort((a, b) => b.hydr - a.hydr).slice(0, 20);
  }, [wallet, totalEarned]);

  const myRank = wallet
    ? rows.findIndex((r) => r.addr === wallet) + 1
    : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-teal">
          <Trophy className="h-3.5 w-3.5" /> Community rankings
        </div>
        <h1 className="mt-4 text-4xl md:text-5xl font-black">
          <span className="gradient-text">Top HYDRA</span> earners
        </h1>
        <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
          Public leaderboard of HydraTrack users by total $HYDR earned. Complete more quests to climb the ranks.
        </p>
      </div>

      {wallet && (
        <div className="mt-8 glass-card rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Your rank</div>
            <div className="mt-1 text-2xl font-bold">
              {myRank ? `#${myRank}` : "Unranked"}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Your balance</div>
            <div className="mt-1 text-2xl font-bold gradient-text">
              {totalEarned.toLocaleString("en-US")} $HYDR
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 glass-card rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[60px_1fr_120px_100px] px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground border-b border-border/50">
          <div>Rank</div>
          <div>Wallet</div>
          <div className="text-right">$HYDR</div>
          <div className="text-right">Tier</div>
        </div>
        {rows.map((r, i) => {
          const t = tierFor(r.hydr);
          const isMe = wallet && r.addr === wallet;
          const RankIcon = i === 0 ? Trophy : i === 1 ? Medal : i === 2 ? Award : null;
          return (
            <div
              key={r.addr + i}
              className={`grid grid-cols-[60px_1fr_120px_100px] items-center px-5 py-3 border-b border-border/30 last:border-0 ${
                isMe ? "bg-primary/10" : ""
              }`}
            >
              <div className="flex items-center gap-1 font-semibold">
                {RankIcon ? (
                  <RankIcon
                    className={`h-4 w-4 ${
                      i === 0 ? "text-yellow-300" : i === 1 ? "text-slate-300" : "text-amber-500"
                    }`}
                  />
                ) : null}
                {i + 1}
              </div>
              <div className="font-mono text-sm truncate">
                {shortAddr(r.addr)} {isMe && <span className="text-teal ml-2 text-xs">(you)</span>}
              </div>
              <div className="text-right font-bold">{r.hydr.toLocaleString("en-US")}</div>
              <div className={`text-right text-xs font-semibold ${t.color}`}>{t.name}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-3 gap-3">
        {[
          { name: "Bronze", req: "500+ $HYDR", color: "text-amber-500" },
          { name: "Silver", req: "1,500+ $HYDR", color: "text-slate-200" },
          { name: "Gold", req: "3,000+ $HYDR", color: "text-yellow-300" },
        ].map((t) => (
          <div key={t.name} className="glass-card rounded-xl p-4 text-center">
            <Trophy className={`mx-auto h-5 w-5 ${t.color}`} />
            <div className="mt-2 font-semibold">{t.name}</div>
            <div className="text-xs text-muted-foreground">{t.req}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
