import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, ExternalLink, Droplets } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About & FAQ — HydraTrack" },
      {
        name: "description",
        content:
          "Learn about the HYDRA ecosystem on Radix DLT — HydraSwap, Battle Arena, HydraBubbles, DefiPlaza staking — and how HydraTrack rewards work.",
      },
      { property: "og:title", content: "About HydraTrack & the HYDRA ecosystem" },
      {
        property: "og:description",
        content: "Everything you need to know about HYDRA, $HYDR and HydraTrack rewards.",
      },
    ],
  }),
  component: About,
});

const ecosystem = [
  {
    name: "HydraSwap",
    desc: "The native DEX interface for trading $HYDR on Radix DLT.",
    href: "https://hydraxrd.com/swap",
  },
  {
    name: "Battle Arena",
    desc: "PvP memecoin battle game where players compete to win the Final Battle and rewards.",
    href: "https://hydraxrd.com/battlearena",
  },
  {
    name: "HydraBubbles",
    desc: "A live market visualization tool for the HYDRA ecosystem and Radix tokens.",
    href: "https://hydraxrd.com/bubbles",
  },
  {
    name: "Burn Portal",
    desc: "Send $HYDR to the burn address to permanently reduce total supply.",
    href: "https://hydraxrd.com/burn",
  },
  {
    name: "DefiPlaza staking",
    desc: "Provide liquidity for the $HYDR pool on DefiPlaza and earn yield.",
    href: "https://radix.defiplaza.net/",
  },
];

const faqs = [
  {
    q: "What is HydraTrack?",
    a: "HydraTrack is a social and on-chain engagement platform that rewards HYDRA community members with $HYDR tokens for completing verified tasks — like following HYDRA on social, buying or staking $HYDR, or winning the Final Battle in Battle Arena.",
  },
  {
    q: "What is $HYDR?",
    a: "$HYDR is the native token of the HYDRA memecoin battle ecosystem on Radix DLT. It is used across HydraSwap, DefiPlaza staking, the Burn Portal, and as the reward currency inside HydraTrack.",
  },
  {
    q: "How does verification work?",
    a: "Social tasks require a manual confirmation after opening the link. On-chain tasks are verified against the Radix Gateway API (buys, stakes, burns, tool interactions). Battle Arena victories are verified via the Battle Arena game API when available, otherwise manually.",
  },
  {
    q: "Do I need a Radix wallet?",
    a: "Yes. Connect any Radix-compatible wallet through the Radix Wallet Connector. Your address is your HydraTrack identity — progress and $HYDR are tied to it.",
  },
  {
    q: "How are rewards distributed?",
    a: "Every verified task credits $HYDR to your HydraTrack balance and updates your leaderboard rank. Distribution of on-chain $HYDR rewards is subject to the HYDRA team's official reward campaigns.",
  },
  {
    q: "Are HydraTrack and HYDRA official?",
    a: "HydraTrack is a community rewards hub for the HYDRA ecosystem. All official HYDRA links, socials and tools are available on hydraxrd.com.",
  },
];

function About() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-teal">
          <Droplets className="h-3.5 w-3.5" /> About HYDRA & HydraTrack
        </div>
        <h1 className="mt-4 text-4xl md:text-5xl font-black">
          The <span className="gradient-text">HYDRA</span> ecosystem
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          HYDRA is a memecoin battle project on Radix DLT with a full suite of community tools.
          HydraTrack rewards users who engage with these tools and grow the community.
        </p>
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Ecosystem tools</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {ecosystem.map((e) => (
            <a
              key={e.name}
              href={e.href}
              target="_blank"
              rel="noreferrer noopener"
              className="glass-card rounded-2xl p-5 hover:border-primary/50 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold">{e.name}</div>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-teal" />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{e.desc}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-bold mb-4">Frequently asked questions</h2>
        <div className="glass-card rounded-2xl divide-y divide-border/50 overflow-hidden">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <button
                key={f.q}
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between p-5">
                  <span className="font-medium">{f.q}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      isOpen && "rotate-180",
                    )}
                  />
                </div>
                {isOpen && (
                  <p className="px-5 pb-5 text-sm text-muted-foreground -mt-2">{f.a}</p>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-14 text-center">
        <p className="text-sm text-muted-foreground">
          Official website:{" "}
          <a href="https://hydraxrd.com" target="_blank" rel="noreferrer" className="text-teal hover:underline">
            hydraxrd.com
          </a>
        </p>
      </section>
    </div>
  );
}
