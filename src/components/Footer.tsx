import { Twitter, Instagram, Music2, Send, Globe, Droplets } from "lucide-react";

const socials = [
  { href: "https://x.com/hydraxrd", label: "X", icon: Twitter },
  { href: "https://www.instagram.com/hydraxrd", label: "Instagram", icon: Instagram },
  { href: "https://www.tiktok.com/@hydraxrd", label: "TikTok", icon: Music2 },
  { href: "https://t.me/hydraxrd", label: "Telegram", icon: Send },
  { href: "https://hydraxrd.com", label: "Website", icon: Globe },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border/40 bg-background/60">
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 font-bold text-lg">
            <div className="grid h-9 w-9 place-items-center rounded-xl btn-gradient">
              <Droplets className="h-5 w-5" />
            </div>
            <span className="gradient-text">HydraTrack</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            Engage. Earn. Grow with HYDRA — the memecoin battle ecosystem on Radix DLT.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Official links</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {socials.map((s) => (
              <li key={s.href}>
                <a
                  className="inline-flex items-center gap-2 hover:text-foreground"
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <s.icon className="h-4 w-4" /> {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Ecosystem</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a className="hover:text-foreground" href="https://hydraxrd.com/swap" target="_blank" rel="noreferrer">HydraSwap</a></li>
            <li><a className="hover:text-foreground" href="https://hydraxrd.com/burn" target="_blank" rel="noreferrer">Burn Portal</a></li>
            <li><a className="hover:text-foreground" href="https://hydraxrd.com/bubbles" target="_blank" rel="noreferrer">HydraBubbles</a></li>
            <li><a className="hover:text-foreground" href="https://hydraxrd.com/battlearena" target="_blank" rel="noreferrer">Battle Arena</a></li>
            <li><a className="hover:text-foreground" href="https://radix.defiplaza.net/" target="_blank" rel="noreferrer">DefiPlaza staking</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/40 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} HydraTrack — community rewards for the HYDRA ecosystem. Not affiliated with Radix Foundation.
      </div>
    </footer>
  );
}
