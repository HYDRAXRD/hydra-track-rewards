import { useEffect, useState, useCallback } from "react";
import { createClientOnlyFn } from "@tanstack/react-start";
import {
  Twitter,
  Instagram,
  Music2,
  Send,
  Youtube,
  Heart,
  MessageCircle,
  Coins,
  Layers,
  Flame,
  CircleDot,
  Swords,
  Star,
  Gift,
  Trophy,
  Rocket,
  Zap,
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
  profileLabel?: string;
  profilePlaceholder?: string;
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
    profileLabel: "Your X (Twitter) profile",
    profilePlaceholder: "@yourhandle or https://x.com/yourhandle",
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
    profileLabel: "Your Instagram profile",
    profilePlaceholder: "@yourhandle or https://instagram.com/yourhandle",
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
    profileLabel: "Your TikTok profile",
    profilePlaceholder: "@yourhandle or https://tiktok.com/@yourhandle",
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
    profileLabel: "Your Telegram username",
    profilePlaceholder: "@yourusername",
  },
  {
    id: "yt-subscribe",
    title: "Subscribe to HYDRA on YouTube",
    description: "Subscribe to @HYDRAXRD on YouTube.",
    link: "https://www.youtube.com/@HYDRAXRD",
    reward: 100,
    category: "social",
    icon: Youtube,
    verifyMode: "manual",
    profileLabel: "Your YouTube channel",
    profilePlaceholder: "@yourchannel or channel URL",
  },
  {
    id: "x-like-share",
    title: "Like, Share & Comment pinned X post",
    description: "Like, repost and comment on the pinned HYDRA announcement on X.",
    link: "https://x.com/hydraxrd",
    reward: 150,
    category: "social",
    icon: Heart,
    verifyMode: "manual",
    profileLabel: "Link to your repost or comment",
    profilePlaceholder: "https://x.com/yourhandle/status/...",
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

/* ---------------- Custom activities (created by admin) ---------------- */

const CUSTOM_TASKS_KEY = "hydratrack:customtasks:v1";

export const CUSTOM_TASK_ICONS: Record<string, LucideIcon> = {
  Star,
  Gift,
  Trophy,
  Rocket,
  Zap,
  Coins,
  Flame,
  Swords,
};

export interface CustomTask {
  id: string;
  title: string;
  description: string;
  link: string;
  reward: number;
  category: TaskCategory;
  iconName: string;
  verifyMode: "manual" | "onchain" | "api";
  profileLabel?: string;
  profilePlaceholder?: string;
  createdAt: number;
}

// Custom tasks live in the cloud database so every participant sees the
// activities the admin creates. This in-memory cache keeps the synchronous
// helpers below working after the first load.
let customTaskCache: CustomTask[] = [];

export function readCustomTasks(): CustomTask[] {
  return customTaskCache;
}

export function setCustomTaskCache(tasks: CustomTask[]) {
  customTaskCache = tasks;
  if (typeof window !== "undefined") {
    localStorage.setItem(CUSTOM_TASKS_KEY, JSON.stringify(tasks));
    window.dispatchEvent(new Event("hydratrack:tasks-changed"));
  }
}

export function customToTask(c: CustomTask): Task {
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    link: c.link,
    reward: c.reward,
    category: c.category,
    icon: CUSTOM_TASK_ICONS[c.iconName] ?? Star,
    verifyMode: c.verifyMode,
    profileLabel: c.profileLabel,
    profilePlaceholder: c.profilePlaceholder,
  };
}

export function getAllTasks(): Task[] {
  return [...TASKS, ...customTaskCache.map(customToTask)];
}

export function useAllTasks(): Task[] {
  const [tasks, setTasks] = useState<Task[]>(TASKS);
  useEffect(() => {
    let active = true;
    const load = async () => {
      const { fetchCustomTasks } = await import("./hydra-db");
      const custom = await fetchCustomTasks();
      customTaskCache = custom;
      if (active) setTasks([...TASKS, ...custom.map(customToTask)]);
    };
    load();
    const sync = () => {
      setTasks(getAllTasks());
      load();
    };
    window.addEventListener("hydratrack:tasks-changed", sync);
    return () => {
      active = false;
      window.removeEventListener("hydratrack:tasks-changed", sync);
    };
  }, []);
  return tasks;
}


// Admin wallet address - only this wallet can access the admin panel
export const ADMIN_WALLET = "account_rdx129mjzn6j04zy5c7jq447y6r60485z7sd3zvqxah0jfv70k36en8vt9";

// HYDR token resource address on Radix mainnet
export const HYDR_RESOURCE_ADDRESS = "resource_rdx1t4kc2yjdcqprwu70tahua3p8uwvjej9q3rktpxdr8p5pmcp4almd6r";

const WALLET_KEY = "hydratrack:wallet";
const TASKS_KEY = "hydratrack:completed:v3";
const PENDING_KEY = "hydratrack:pending:v3";
const ADMIN_SUBMISSIONS_KEY = "hydratrack:adminsubmissions:v1";

export interface PendingSubmission {
  handle: string;
  screenshot?: string; // base64 data URL for screenshot
  at: number;
  walletAddress: string;
}

export interface AdminSubmission {
  walletAddress: string;
  taskId: string;
  handle: string;
  screenshot?: string;
  at: number;
  status: "pending" | "approved" | "rejected";
  approvedAt?: number;
}

function readCompleted(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(TASKS_KEY) || "{}");
  } catch {
    return {};
  }
}

function readPending(): Record<string, PendingSubmission> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(PENDING_KEY) || "{}");
  } catch {
    return {};
  }
}

function readWallet(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(WALLET_KEY);
}

export function readAdminSubmissions(): AdminSubmission[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(ADMIN_SUBMISSIONS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveAdminSubmissions(subs: AdminSubmission[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADMIN_SUBMISSIONS_KEY, JSON.stringify(subs));
}

export function useHydraStore() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Record<string, number>>({});
  const [pending, setPending] = useState<Record<string, PendingSubmission>>({});
  const [hydrated, setHydrated] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const isAdmin = wallet === ADMIN_WALLET;

  useEffect(() => {
    setCompleted(readCompleted());
    setPending(readPending());
    setHydrated(true);

    let unsub: (() => void) | undefined;
    let cancelled = false;

    const initWallet = async () => {
      try {
        const rdt = await loadRadixToolkit();
        
        if (cancelled || !rdt) return;
        
        const sub = rdt.walletApi.walletData$.subscribe((data) => {
          const addr = data?.accounts?.[0]?.address ?? null;
          if (addr) {
            localStorage.setItem(WALLET_KEY, addr);
            setWallet(addr);
            setConnectError(null);
          } else {
            localStorage.removeItem(WALLET_KEY);
            setWallet(null);
          }
        });
        unsub = () => sub.unsubscribe();
      } catch (e: any) {
        console.error("Failed to load Radix toolkit", e);
        setConnectError("Wallet connector failed to load.");
      }
    };

    initWallet();

    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  // Load this wallet's submissions from the cloud so progress follows the
  // wallet across devices/browsers, not just this one.
  useEffect(() => {
    if (!wallet) return;
    let active = true;
    (async () => {
      const { fetchSubmissionsForWallet } = await import("./hydra-db");
      const subs = await fetchSubmissionsForWallet(wallet);
      if (!active) return;
      const nextCompleted: Record<string, number> = {};
      const nextPending: Record<string, PendingSubmission> = {};
      for (const s of subs) {
        if (s.status === "approved") {
          nextCompleted[s.taskId] = s.approvedAt ?? s.at;
        } else if (s.status === "pending") {
          nextPending[s.taskId] = {
            handle: s.handle,
            screenshot: s.screenshot,
            at: s.at,
            walletAddress: s.walletAddress,
          };
        }
      }
      setCompleted(nextCompleted);
      setPending(nextPending);
      localStorage.setItem(TASKS_KEY, JSON.stringify(nextCompleted));
      localStorage.setItem(PENDING_KEY, JSON.stringify(nextPending));
    })();
    return () => {
      active = false;
    };
  }, [wallet]);



  const connect = useCallback(async () => {
    setConnecting(true);
    setConnectError(null);
    try {
      const rdt = await loadRadixToolkit();
      if (!rdt) {
        setConnectError("Radix Wallet Connector unavailable in this environment.");
        return null;
      }
      const result = await rdt.walletApi.sendRequest();
      if (result.isErr()) {
        const err = result.error as { error?: string; message?: string } | undefined;
        setConnectError(err?.message || err?.error || "Wallet request was cancelled.");
        return null;
      }
      return result.value?.accounts?.[0]?.address ?? null;
    } catch (e: any) {
      setConnectError(e?.message || "Could not connect to the Radix Wallet.");
      return null;
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    const rdt = await loadRadixToolkit();
    rdt?.disconnect();
    localStorage.removeItem(WALLET_KEY);
    setWallet(null);
    setConnectError(null);
  }, []);

  const completeTask = useCallback((taskId: string) => {
    setCompleted((prev) => {
      if (prev[taskId]) return prev;
      const next = { ...prev, [taskId]: Date.now() };
      localStorage.setItem(TASKS_KEY, JSON.stringify(next));
      return next;
    });
    setPending((prev) => {
      if (!prev[taskId]) return prev;
      const next = { ...prev };
      delete next[taskId];
      localStorage.setItem(PENDING_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const submitForReview = useCallback((taskId: string, handle: string, screenshot?: string) => {
    if (!wallet) return;
    // Optimistic local state
    setPending((prev) => {
      const next = { ...prev, [taskId]: { handle, screenshot, at: Date.now(), walletAddress: wallet } };
      localStorage.setItem(PENDING_KEY, JSON.stringify(next));
      return next;
    });
    // Persist to the shared cloud database so the admin sees it from any device
    void (async () => {
      const { upsertSubmission } = await import("./hydra-db");
      await upsertSubmission({ walletAddress: wallet, taskId, handle, screenshot });
    })();
  }, [wallet]);


  const allTasks = useAllTasks();
  const totalEarned = allTasks.filter((t) => completed[t.id]).reduce(
    (s, t) => s + t.reward,
    0,
  );
  const totalPossible = allTasks.reduce((s, t) => s + t.reward, 0) || 1;
  const completedCount = Object.keys(completed).length;
  const pendingCount = Object.keys(pending).filter((id) => !completed[id]).length;
  const progress = Math.round((totalEarned / totalPossible) * 100);

  return {
    wallet,
    hydrated,
    completed,
    pending,
    totalEarned,
    completedCount,
    pendingCount,
    progress,
    connect,
    disconnect,
    completeTask,
    submitForReview,
    connecting,
    connectError,
    isAdmin,
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
  { addr: "rdx1qsp7f8k…hydra01", hydr: 0 },
  { addr: "rdx1qsp2m9d…hydra02", hydr: 0 },
  { addr: "rdx1qsp8kx3…hydra03", hydr: 0 },
  { addr: "rdx1qsp5vv1…hydra04", hydr: 0 },
  { addr: "rdx1qsp9nnq…hydra05", hydr: 0 },
  { addr: "rdx1qspa42w…hydra06", hydr: 0 },
  { addr: "rdx1qspb31l…hydra07", hydr: 0 },
  { addr: "rdx1qspc77e…hydra08", hydr: 0 },
  { addr: "rdx1qspd55r…hydra09", hydr: 0 },
  { addr: "rdx1qspe14y…hydra10", hydr: 0 },
];
const loadRadixToolkit = createClientOnlyFn(async () => {
  const { getRdt } = await import("./radix.client");
  return getRdt();
});
