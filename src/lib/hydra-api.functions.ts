// Server-side data access for HydraTrack.
// The database tables are locked down (no anon/authenticated access); every
// read/write goes through these server functions so that admin-only actions
// can be authorized on the server instead of trusting the browser.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ADMIN_WALLET =
  "account_rdx129mjzn6j04zy5c7jq447y6r60485z7sd3zvqxah0jfv70k36en8vt9";

const walletSchema = z.string().trim().min(10).max(120);
const taskIdSchema = z.string().trim().min(1).max(80);

const adminSchema = z.object({
  adminWallet: walletSchema,
  adminSecret: z.string().min(1).max(512),
});

// Returns false instead of throwing: a thrown error crosses the RPC boundary
// as an unhandled runtime error and blanks the page.
function isAdmin(input: { adminWallet: string; adminSecret: string }) {
  const secret = process.env["ADMIN_PANEL_SECRET"];
  if (!secret) return false;
  return input.adminWallet === ADMIN_WALLET && input.adminSecret === secret;
}

const NOT_AUTHORIZED = { ok: false as const, error: "Not authorized." };

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/* -------------------------------- participant ------------------------------- */

export const submitSubmissionFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        walletAddress: walletSchema,
        taskId: taskIdSchema,
        handle: z.string().max(200).default(""),
        screenshot: z.string().max(3_000_000).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    const { error } = await db.from("submissions").upsert(
      {
        wallet_address: data.walletAddress,
        task_id: data.taskId,
        handle: data.handle ?? "",
        screenshot: data.screenshot ?? null,
        status: "pending",
        reviewed_at: null,
      },
      { onConflict: "wallet_address,task_id" },
    );
    if (error) {
      console.error("[hydra-api] submitSubmission", error);
      return { ok: false as const, error: "Could not save your submission." };
    }
    return { ok: true as const };
  });

export const listMySubmissionsFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ walletAddress: walletSchema }).parse(data),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: rows, error } = await db
      .from("submissions")
      .select("wallet_address,task_id,handle,screenshot,status,created_at,reviewed_at")
      .eq("wallet_address", data.walletAddress);
    if (error) {
      console.error("[hydra-api] listMySubmissions", error);
      return [];
    }
    return rows ?? [];
  });

/* ----------------------------------- admin ---------------------------------- */

export const checkAdminFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => adminSchema.parse(data))
  .handler(async ({ data }) => ({ ok: isAdmin(data) }));

export const listAllSubmissionsFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => adminSchema.parse(data))
  .handler(async ({ data }) => {
    if (!isAdmin(data)) return [];
    const db = await admin();
    const { data: rows, error } = await db
      .from("submissions")
      .select("wallet_address,task_id,handle,screenshot,status,created_at,reviewed_at")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[hydra-api] listAllSubmissions", error);
      return [];
    }
    return rows ?? [];
  });

export const setSubmissionStatusFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    adminSchema
      .extend({
        walletAddress: walletSchema,
        taskId: taskIdSchema,
        status: z.enum(["approved", "rejected"]),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    if (!isAdmin(data)) return NOT_AUTHORIZED;
    const db = await admin();
    const { error } = await db
      .from("submissions")
      .update({ status: data.status, reviewed_at: new Date().toISOString() })
      .eq("wallet_address", data.walletAddress)
      .eq("task_id", data.taskId);
    if (error) {
      console.error("[hydra-api] setSubmissionStatus", error);
      return { ok: false as const, error: "Could not save the review." };
    }
    return { ok: true as const };
  });

export const listPayoutsFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => adminSchema.parse(data))
  .handler(async ({ data }) => {
    if (!isAdmin(data)) return [];
    const db = await admin();
    const { data: rows, error } = await db
      .from("reward_payouts")
      .select("wallet_address,amount,tx_hash,created_at");
    if (error) {
      console.error("[hydra-api] listPayouts", error);
      return [];
    }
    return rows ?? [];
  });

export const recordPayoutFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    adminSchema
      .extend({
        walletAddress: walletSchema,
        amount: z.number().finite().nonnegative(),
        txHash: z.string().max(200).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    if (!isAdmin(data)) return NOT_AUTHORIZED;
    const db = await admin();
    const { error } = await db.from("reward_payouts").insert({
      wallet_address: data.walletAddress,
      amount: data.amount,
      tx_hash: data.txHash ?? null,
    });
    if (error) {
      console.error("[hydra-api] recordPayout", error);
      return { ok: false as const, error: "Could not record the payout." };
    }
    return { ok: true as const };
  });

export const createCustomTaskFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    adminSchema
      .extend({
        id: taskIdSchema,
        title: z.string().trim().min(1).max(200),
        description: z.string().max(1000).default(""),
        link: z.string().trim().url().max(500),
        reward: z.number().finite().positive().max(1_000_000_000),
        category: z.enum(["social", "onchain"]),
        iconName: z.string().trim().min(1).max(60),
        verifyMode: z.enum(["manual", "api", "onchain"]).default("manual"),
        profileLabel: z.string().max(120).optional(),
        profilePlaceholder: z.string().max(120).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    if (!isAdmin(data)) return NOT_AUTHORIZED;
    const db = await admin();
    const { error } = await db.from("custom_tasks").insert({
      id: data.id,
      title: data.title,
      description: data.description,
      link: data.link,
      reward: data.reward,
      category: data.category,
      icon_name: data.iconName,
      verify_mode: data.verifyMode,
      profile_label: data.profileLabel ?? null,
      profile_placeholder: data.profilePlaceholder ?? null,
    });
    if (error) {
      console.error("[hydra-api] createCustomTask", error);
      return { ok: false as const, error: "Could not create the activity." };
    }
    return { ok: true as const };
  });

export const deleteCustomTaskFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    adminSchema.extend({ id: taskIdSchema }).parse(data),
  )
  .handler(async ({ data }) => {
    if (!isAdmin(data)) return NOT_AUTHORIZED;
    const db = await admin();
    const { error } = await db.from("custom_tasks").delete().eq("id", data.id);
    if (error) {
      console.error("[hydra-api] deleteCustomTask", error);
      return { ok: false as const, error: "Could not delete the activity." };
    }
    return { ok: true as const };
  });
