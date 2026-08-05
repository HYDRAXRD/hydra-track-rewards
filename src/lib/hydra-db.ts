// Shared cloud storage for submissions, payouts and custom activities.
// Sensitive tables are not reachable from the browser: all writes and all
// submission/payout reads go through server functions that authorize the
// admin server-side. Only the public task catalog is read directly.
import { supabase } from "@/integrations/supabase/client";
import {
  submitSubmissionFn,
  listMySubmissionsFn,
  listAllSubmissionsFn,
  setSubmissionStatusFn,
  listPayoutsFn,
  recordPayoutFn,
  createCustomTaskFn,
  deleteCustomTaskFn,
} from "@/lib/hydra-api.functions";
import type { AdminSubmission, CustomTask, TaskCategory } from "./hydra-store";

export interface Payout {
  walletAddress: string;
  amount: number;
  txHash: string | null;
  createdAt: number;
}

/* ------------------------------ admin session ------------------------------ */

const ADMIN_SECRET_KEY = "hydratrack:adminsecret";
const ADMIN_WALLET_KEY = "hydratrack:wallet:v3";

export function setAdminSecret(secret: string) {
  if (typeof window === "undefined") return;
  if (secret) localStorage.setItem(ADMIN_SECRET_KEY, secret);
  else localStorage.removeItem(ADMIN_SECRET_KEY);
}

export function getAdminSecret(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(ADMIN_SECRET_KEY) ?? "";
}

function adminCreds() {
  const adminWallet =
    typeof window === "undefined"
      ? ""
      : localStorage.getItem(ADMIN_WALLET_KEY) ?? "";
  return { adminWallet, adminSecret: getAdminSecret() };
}

type Row = {
  wallet_address: string;
  task_id: string;
  handle: string | null;
  screenshot: string | null;
  status: string | null;
  created_at: string;
  reviewed_at: string | null;
};

function toSubmission(r: Row): AdminSubmission {
  return {
    walletAddress: r.wallet_address,
    taskId: r.task_id,
    handle: r.handle ?? "",
    screenshot: r.screenshot ?? undefined,
    at: new Date(r.created_at).getTime(),
    status: (r.status as AdminSubmission["status"]) ?? "pending",
    approvedAt: r.reviewed_at ? new Date(r.reviewed_at).getTime() : undefined,
  };
}

/* -------------------------------- submissions ------------------------------- */

export async function fetchSubmissions(): Promise<AdminSubmission[]> {
  try {
    const rows = await listAllSubmissionsFn({ data: adminCreds() });
    return (rows as Row[]).map(toSubmission);
  } catch (e) {
    console.error("[hydra-db] fetchSubmissions", e);
    return [];
  }
}

export async function fetchSubmissionsForWallet(
  wallet: string,
): Promise<AdminSubmission[]> {
  try {
    const rows = await listMySubmissionsFn({ data: { walletAddress: wallet } });
    return (rows as Row[]).map(toSubmission);
  } catch (e) {
    console.error("[hydra-db] fetchSubmissionsForWallet", e);
    return [];
  }
}

export async function upsertSubmission(input: {
  walletAddress: string;
  taskId: string;
  handle: string;
  screenshot?: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    return await submitSubmissionFn({ data: input });
  } catch (e) {
    console.error("[hydra-db] upsertSubmission", e);
    return { ok: false, error: "Could not save your submission." };
  }
}

export async function setSubmissionStatus(
  walletAddress: string,
  taskId: string,
  status: "approved" | "rejected",
): Promise<{ ok: boolean; error?: string }> {
  try {
    return await setSubmissionStatusFn({
      data: { ...adminCreds(), walletAddress, taskId, status },
    });
  } catch (e) {
    console.error("[hydra-db] setSubmissionStatus", e);
    return { ok: false, error: "Not authorized to review submissions." };
  }
}

/* --------------------------------- payouts --------------------------------- */

export async function fetchPayouts(): Promise<Payout[]> {
  try {
    const rows = await listPayoutsFn({ data: adminCreds() });
    return (rows as Array<{
      wallet_address: string;
      amount: number | string;
      tx_hash: string | null;
      created_at: string;
    }>).map((r) => ({
      walletAddress: r.wallet_address,
      amount: Number(r.amount),
      txHash: r.tx_hash,
      createdAt: new Date(r.created_at).getTime(),
    }));
  } catch (e) {
    console.error("[hydra-db] fetchPayouts", e);
    return [];
  }
}

export async function recordPayout(
  walletAddress: string,
  amount: number,
  txHash?: string,
): Promise<void> {
  try {
    await recordPayoutFn({
      data: { ...adminCreds(), walletAddress, amount, txHash },
    });
  } catch (e) {
    console.error("[hydra-db] recordPayout", e);
  }
}

/* ------------------------------ custom tasks ------------------------------- */

export async function fetchCustomTasks(): Promise<CustomTask[]> {
  const { data, error } = await supabase
    .from("custom_tasks")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) {
    console.error("[hydra-db] fetchCustomTasks", error);
    return [];
  }
  return (data ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description ?? "",
    link: r.link ?? "",
    reward: Number(r.reward),
    category: (r.category as TaskCategory) ?? "social",
    iconName: r.icon_name ?? "Star",
    verifyMode: (r.verify_mode as CustomTask["verifyMode"]) ?? "manual",
    profileLabel: r.profile_label ?? undefined,
    profilePlaceholder: r.profile_placeholder ?? undefined,
    createdAt: new Date(r.created_at).getTime(),
  }));
}

export async function insertCustomTask(
  task: CustomTask,
): Promise<{ ok: boolean; error?: string }> {
  try {
    return await createCustomTaskFn({
      data: {
        ...adminCreds(),
        id: task.id,
        title: task.title,
        description: task.description,
        link: task.link,
        reward: task.reward,
        category: task.category,
        iconName: task.iconName,
        verifyMode: task.verifyMode === "auto" ? "auto" : "manual",
        profileLabel: task.profileLabel,
        profilePlaceholder: task.profilePlaceholder,
      },
    });
  } catch (e) {
    console.error("[hydra-db] insertCustomTask", e);
    return { ok: false, error: "Not authorized to create activities." };
  }
}

export async function deleteCustomTask(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    return await deleteCustomTaskFn({ data: { ...adminCreds(), id } });
  } catch (e) {
    console.error("[hydra-db] deleteCustomTask", e);
    return { ok: false, error: "Not authorized to delete activities." };
  }
}
