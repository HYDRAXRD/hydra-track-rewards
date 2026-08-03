// Shared cloud storage for submissions, payouts and custom activities.
// Everything is keyed by the participant's Radix wallet address so the admin
// can review work sent from any device/browser.
import { supabase } from "@/integrations/supabase/client";
import type { AdminSubmission, CustomTask, TaskCategory } from "./hydra-store";

export interface Payout {
  walletAddress: string;
  amount: number;
  txHash: string | null;
  createdAt: number;
}

/* -------------------------------- submissions ------------------------------- */

export async function fetchSubmissions(): Promise<AdminSubmission[]> {
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[hydra-db] fetchSubmissions", error);
    return [];
  }
  return (data ?? []).map((r) => ({
    walletAddress: r.wallet_address,
    taskId: r.task_id,
    handle: r.handle ?? "",
    screenshot: r.screenshot ?? undefined,
    at: new Date(r.created_at).getTime(),
    status: (r.status as AdminSubmission["status"]) ?? "pending",
    approvedAt: r.reviewed_at ? new Date(r.reviewed_at).getTime() : undefined,
  }));
}

export async function fetchSubmissionsForWallet(
  wallet: string,
): Promise<AdminSubmission[]> {
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("wallet_address", wallet);
  if (error) {
    console.error("[hydra-db] fetchSubmissionsForWallet", error);
    return [];
  }
  return (data ?? []).map((r) => ({
    walletAddress: r.wallet_address,
    taskId: r.task_id,
    handle: r.handle ?? "",
    screenshot: r.screenshot ?? undefined,
    at: new Date(r.created_at).getTime(),
    status: (r.status as AdminSubmission["status"]) ?? "pending",
    approvedAt: r.reviewed_at ? new Date(r.reviewed_at).getTime() : undefined,
  }));
}

export async function upsertSubmission(input: {
  walletAddress: string;
  taskId: string;
  handle: string;
  screenshot?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from("submissions").upsert(
    {
      wallet_address: input.walletAddress,
      task_id: input.taskId,
      handle: input.handle,
      screenshot: input.screenshot ?? null,
      status: "pending",
      reviewed_at: null,
    },
    { onConflict: "wallet_address,task_id" },
  );
  if (error) {
    console.error("[hydra-db] upsertSubmission", error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function setSubmissionStatus(
  walletAddress: string,
  taskId: string,
  status: "approved" | "rejected",
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase
    .from("submissions")
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq("wallet_address", walletAddress)
    .eq("task_id", taskId);
  if (error) {
    console.error("[hydra-db] setSubmissionStatus", error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/* --------------------------------- payouts --------------------------------- */

export async function fetchPayouts(): Promise<Payout[]> {
  const { data, error } = await supabase.from("reward_payouts").select("*");
  if (error) {
    console.error("[hydra-db] fetchPayouts", error);
    return [];
  }
  return (data ?? []).map((r) => ({
    walletAddress: r.wallet_address,
    amount: Number(r.amount),
    txHash: r.tx_hash,
    createdAt: new Date(r.created_at).getTime(),
  }));
}

export async function recordPayout(
  walletAddress: string,
  amount: number,
  txHash?: string,
): Promise<void> {
  const { error } = await supabase.from("reward_payouts").insert({
    wallet_address: walletAddress,
    amount,
    tx_hash: txHash ?? null,
  });
  if (error) console.error("[hydra-db] recordPayout", error);
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

export async function insertCustomTask(task: CustomTask): Promise<void> {
  const { error } = await supabase.from("custom_tasks").insert({
    id: task.id,
    title: task.title,
    description: task.description,
    link: task.link,
    reward: task.reward,
    category: task.category,
    icon_name: task.iconName,
    verify_mode: task.verifyMode,
    profile_label: task.profileLabel ?? null,
    profile_placeholder: task.profilePlaceholder ?? null,
  });
  if (error) console.error("[hydra-db] insertCustomTask", error);
}

export async function deleteCustomTask(id: string): Promise<void> {
  const { error } = await supabase.from("custom_tasks").delete().eq("id", id);
  if (error) console.error("[hydra-db] deleteCustomTask", error);
}
