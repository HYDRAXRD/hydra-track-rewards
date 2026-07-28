import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useHydraStore, shortAddr } from "@/lib/hydra-store";
import { Wallet, LogOut } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { wallet, connect, disconnect, hydrated } = useHydraStore();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 backdrop-blur-xl bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="grid h-9 w-9 place-items-center rounded-xl btn-gradient">
            <Droplets className="h-5 w-5" />
          </div>
          <span className="gradient-text">HydraTrack</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm">
          {[
            { to: "/", label: "Home" },
            { to: "/dashboard", label: "Dashboard" },
            { to: "/leaderboard", label: "Leaderboard" },
            { to: "/about", label: "About" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              activeProps={{ className: "px-3 py-2 rounded-md text-foreground bg-secondary" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {hydrated && wallet ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-xs font-mono text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-teal" />
                {shortAddr(wallet)}
              </span>
              <Button variant="ghost" size="icon" onClick={disconnect} title="Disconnect">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={connect}
              className="btn-gradient btn-gradient-hover border-0"
            >
              <Wallet className="h-4 w-4" /> Connect Wallet
            </Button>
          )}
          <button
            className="md:hidden p-2 rounded-md hover:bg-secondary"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            <div className="space-y-1">
              <span className="block h-0.5 w-5 bg-foreground" />
              <span className="block h-0.5 w-5 bg-foreground" />
              <span className="block h-0.5 w-5 bg-foreground" />
            </div>
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border/40 px-4 py-2 flex flex-col">
          {[
            { to: "/", label: "Home" },
            { to: "/dashboard", label: "Dashboard" },
            { to: "/leaderboard", label: "Leaderboard" },
            { to: "/about", label: "About" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="py-2 text-muted-foreground hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
