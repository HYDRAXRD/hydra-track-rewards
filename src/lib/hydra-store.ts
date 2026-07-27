import { useEffect, useState, useCallback } from "react";
import {
  Twitter,
  Instagram,
  Music2,
  Send,
  Heart,
  MessageCircle,
  Coins,
  Layers,
  Flame,
  CircleDot,
  Swords,
  type LucideIcon,
} from "lucide-react";

export type TaskCategory = "social" | "onchain";

export interface Task {
  id: string;
  title: string;
  description: string;
  link: string;
  reward: number;
  category: TaskCategory;
  icon: LucideIcon;
  verifyMode: "manual" | "onchain" | "api";
}

export const TASKS: Task[] = [
  {
    id: "x-follow",
    title: "Follow HYDRA on X",
    description: "Follow @hydraxrd on X (Twitter) to stay updated.",
    link: "https://x.com/hydraxrd",
    reward: 50,
    category: "social",
    icon: Twitter,
    verifyMode: "manual",
  },
  {
    id: "ig-follow",
    title: "Follow HYDRA on Instagram",
    description: "Follow @hydraxrd on Instagram.",
    link: "https://www.instagram.com/hydraxrd",
    reward: 50,
    category: "social",
    icon: Instagram,
    verifyMode: "manual",
  },
  {
    id: "tt-follow",
    title: "Follow HYDRA on TikTok",
    description: "Follow @hydraxrd on TikTok.",
    link: "https://www.tiktok.com/@hydraxrd",
    reward: 50,
    category: "social",
    icon: Music2,
    verifyMode: "manual",
  },
  {
    id: "tg-join",
    title: "Join HYDRA Telegram",
    description: "Join the official HYDRA Telegram community.",
    link: "https://t.me/hydraxrd",
    reward: 50,
    category: "social",
    icon: Send,
    verifyMode: "manual",
  },
  {
    id: "x-like-share",
    title: "Like & Share pinned X post",
    description: "Like and repost the pinned HYDRA announcement on X.",
    link: "https://x.com/hydraxrd",
    reward: 50,
    category: "social",
    icon: Heart,
    verifyMode: "manual",
  },
  {
    id: "x-comment",
    title: "Comment on featured X post",
    description: "Leave a thoughtful comment on the featured HYDRA post.",
    link: "https://x.com/hydraxrd",
    reward: 50,
    category: "social",
    icon: MessageCircle,
    verifyMode: "manual",
  },
  {
    id: "buy-hydr",
    title: "Buy 1,000,000 $HYDR",
    description: "Purchase at least 1,000,000 $HYDR on HydraSwap.",
    link: "https://hydraxrd.com/swap",
    reward: 1000,
    category: "onchain",
    icon: Coins,
    verifyMode: "onchain",
  },
  {
    id: "stake-hydr",
    title: "Stake 100,000 $HYDR on DefiPlaza",
    description: "Provide at least 100,000 $HYDR into the DefiPlaza $HYDR pool.",
    link: "https://radix.defiplaza.net/",
    reward: 1000,
    category: "onchain",
    icon: Layers,
    verifyMode: "onchain",
  },
  {
    id: "burn-hydr",
    title: "Burn 100,000 $HYDR",
    description: "Send at least 100,000 $HYDR to the burn portal.",
    link: "https://hydraxrd.com/burn",
    reward: 1000,
    category: "onchain",
    icon: Flame,
    verifyMode: "onchain",
  },
  {
    id: "bubbles",
    title: "Use HydraBubbles",
    description: "Explore the market with the HydraBubbles visual tool.",
    link: "https://hydraxrd.com/bubbles",
    reward: 100,
    category: "onchain",
    icon: CircleDot,
    verifyMode: "onchain",
  },
  {
    id: "battle-arena",
    title: "Win the Final Battle",
    description: "Achieve a Final Battle victory in Battle Arena.",
    link: "https://hydraxrd.com/battlearena",
    reward: 250,
    category: "onchain",
    icon: Swords,
    verifyMode: "api",
  },
];

export const TOTAL_REWARDS = TASKS.reduce((s, t) => s + t.reward, 0);

const WALLET_KEY = "hydratrack:wallet";
const TASKS_KEY = "hydratrack:completed";

function readCompleted(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(TASKS_KEY) || "{}");
  } catch {
    return {};
  }
}

function readWallet(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(WALLET_KEY);
}

export function useHydraStore() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Record<string, number>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setWallet(readWallet());
    setCompleted(readCompleted());
    setHydrated(true);
    const onStorage = () => {
      setWallet(readWallet());
      setCompleted(readCompleted());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const connect = useCallback(() => {
    // Mock Radix wallet connect: generate a plausible rdx1... address
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let addr = "rdx1qsp";
    for (let i = 0; i < 54; i++) addr += chars[Math.floor(Math.random() * chars.length)];
    localStorage.setItem(WALLET_KEY, addr);
    setWallet(addr);
    return addr;
  }, []);

  const disconnect = useCallback(() => {
    localStorage.removeItem(WALLET_KEY);
    setWallet(null);
  }, []);

  const completeTask = useCallback((taskId: string) => {
    setCompleted((prev) => {
      if (prev[taskId]) return prev;
      const next = { ...prev, [taskId]: Date.now() };
      localStorage.setItem(TASKS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const totalEarned = TASKS.filter((t) => completed[t.id]).reduce(
    (s, t) => s + t.reward,
    0,
  );
  const completedCount = Object.keys(completed).length;
  const progress = Math.round((totalEarned / TOTAL_REWARDS) * 100);

  return {
    wallet,
    hydrated,
    completed,
    totalEarned,
    completedCount,
    progress,
    connect,
    disconnect,
    completeTask,
  };
}

export function tierFor(hydr: number): { name: string; color: string; next?: number } {
  if (hydr >= 3000) return { name: "Gold", color: "text-yellow-300" };
  if (hydr >= 1500) return { name: "Silver", color: "text-slate-200", next: 3000 };
  if (hydr >= 500) return { name: "Bronze", color: "text-amber-500", next: 1500 };
  return { name: "Unranked", color: "text-muted-foreground", next: 500 };
}

export function shortAddr(a: string) {
  return a.length > 14 ? `${a.slice(0, 8)}…${a.slice(-6)}` : a;
}

export const LEADERBOARD_MOCK = [
  { addr: "rdx1qsp7f8k…hydra01", hydr: 3850 },
  { addr: "rdx1qsp2m9d…hydra02", hydr: 3400 },
  { addr: "rdx1qsp8kx3…hydra03", hydr: 2950 },
  { addr: "rdx1qsp5vv1…hydra04", hydr: 2700 },
  { addr: "rdx1qsp9nnq…hydra05", hydr: 2300 },
  { addr: "rdx1qspa42w…hydra06", hydr: 1850 },
  { addr: "rdx1qspb31l…hydra07", hydr: 1500 },
  { addr: "rdx1qspc77e…hydra08", hydr: 1200 },
  { addr: "rdx1qspd55r…hydra09", hydr: 900 },
  { addr: "rdx1qspe14y…hydra10", hydr: 650 },
];
