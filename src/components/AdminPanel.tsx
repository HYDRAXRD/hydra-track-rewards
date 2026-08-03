import { useState, useCallback, useEffect } from "react";
import { Check, X, ShieldCheck, Loader2, User, ChevronDown, ChevronUp, ExternalLink, Send, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getAllTasks,
  setCustomTaskCache,
  type AdminSubmission,
} from "@/lib/hydra-store";
import {
  fetchSubmissions,
  fetchPayouts,
  fetchCustomTasks,
  setSubmissionStatus,
  recordPayout,
} from "@/lib/hydra-db";
import { sendHydrReward } from "@/lib/rewards";
import { cn } from "@/lib/utils";



function shortAddr(a: string) {
  return a.length > 14 ? `${a.slice(0, 8)}…${a.slice(-6)}` : a;
}

function getTaskTitle(taskId: string) {
  return getAllTasks().find((t) => t.id === taskId)?.title ?? taskId;
}

function getTaskReward(taskId: string) {
  return getAllTasks().find((t) => t.id === taskId)?.reward ?? 0;
}

interface ParticipantGroup {
  walletAddress: string;
  submissions: AdminSubmission[];
  totalReward: number;
  allApproved: boolean;
  hasPending: boolean;
}

function groupByParticipant(subs: AdminSubmission[]): ParticipantGroup[] {
  const map = new Map<string, AdminSubmission[]>();
  for (const s of subs) {
    if (!map.has(s.walletAddress)) map.set(s.walletAddress, []);
    map.get(s.walletAddress)!.push(s);
  }
  return Array.from(map.entries()).map(([walletAddress, submissions]) => {
    const approved = submissions.filter((s) => s.status === "approved");
    const pending = submissions.filter((s) => s.status === "pending");
    const totalReward = approved.reduce((acc, s) => acc + getTaskReward(s.taskId), 0);
    const allApproved = pending.length === 0 && approved.length > 0 && submissions.every(s => s.status === "approved");
    const hasPending = pending.length > 0;
    return { walletAddress, submissions, totalReward, allApproved, hasPending };
  });
}

const REWARDS_SENT_KEY = "hydratrack:rewardssent:v1";

function readSentRewards(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(REWARDS_SENT_KEY) || "{}");
  } catch {
    return {};
  }
}


export function AdminPanel({ adminWallet }: { adminWallet: string }) {
  const [submissions, setSubmissions] = useState<AdminSubmission[]>(() => readAdminSubmissions());
  const [expandedWallet, setExpandedWallet] = useState<string | null>(null);
  const [sendingTokens, setSendingTokens] = useState<string | null>(null);
  const [sentWallets, setSentWallets] = useState<Record<string, string>>(() => readSentRewards());
  const [txError, setTxError] = useState<string | null>(null);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setSubmissions(readAdminSubmissions());
    setSentWallets(readSentRewards());
  }, []);

  const updateSubmissionStatus = (walletAddress: string, taskId: string, status: "approved" | "rejected") => {
    const updated = submissions.map((s) =>
      s.walletAddress === walletAddress && s.taskId === taskId
        ? { ...s, status, approvedAt: status === "approved" ? Date.now() : undefined }
        : s
    );
    setSubmissions(updated);
    saveAdminSubmissions(updated);
  };

  const handleSendTokens = async (participant: ParticipantGroup) => {
    setTxError(null);
    if (sentWallets[participant.walletAddress]) {
      setTxError("Rewards were already sent to this participant.");
      return;
    }
    setSendingTokens(participant.walletAddress);
    const res = await sendHydrReward(participant.walletAddress, participant.totalReward);
    setSendingTokens(null);
    if (res.ok) {
      const next = { ...sentWallets, [participant.walletAddress]: res.hash ?? "sent" };
      setSentWallets(next);
      localStorage.setItem(REWARDS_SENT_KEY, JSON.stringify(next));
    } else {
      setTxError(res.error ?? "Transaction failed.");
    }
  };


  const groups = groupByParticipant(submissions);
  const pendingCount = submissions.filter((s) => s.status === "pending").length;

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal/20">
            <ShieldCheck className="h-5 w-5 text-teal" style={{ color: "oklch(0.85 0.15 195)" }} />
          </div>
          <div>
            <h2 className="font-bold text-lg">Admin Panel</h2>
            <p className="text-xs text-muted-foreground">
              Connected as: <span className="font-mono text-teal/80" style={{ color: "oklch(0.85 0.15 195)" }}>{shortAddr(adminWallet)}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <Badge className="bg-yellow-300/20 text-yellow-300 border-yellow-300/30">
              {pendingCount} pending
            </Badge>
          )}
          <Button size="sm" variant="outline" onClick={refresh}>
            Refresh
          </Button>
        </div>
      </div>

      {txError && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 p-3">
          <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-xs text-red-300">{txError}</p>
        </div>
      )}



      {groups.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <User className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No submissions yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {groups.map((group) => (
            <div
              key={group.walletAddress}
              className={cn(
                "rounded-xl border p-4 flex flex-col gap-3 transition-all",
                group.allApproved
                  ? "border-teal/40 bg-teal/5"
                  : group.hasPending
                    ? "border-yellow-300/40 bg-yellow-300/5"
                    : "border-border/50"
              )}
            >
              {/* Participant header */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono text-sm">{shortAddr(group.walletAddress)}</span>
                  <span className="text-[10px] text-muted-foreground hidden sm:inline">
                    ({group.walletAddress})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={cn(
                      "text-xs",
                      group.allApproved
                        ? "bg-teal/20 text-teal border-teal/30"
                        : group.hasPending
                          ? "bg-yellow-300/20 text-yellow-300 border-yellow-300/30"
                          : "bg-muted/20"
                    )}
                    style={group.allApproved ? { color: "oklch(0.85 0.15 195)" } : {}}
                  >
                    {group.allApproved ? "All Approved" : group.hasPending ? "Has Pending" : "Reviewed"}
                  </Badge>
                  <button
                    onClick={() => setExpandedWallet(
                      expandedWallet === group.walletAddress ? null : group.walletAddress
                    )}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {expandedWallet === group.walletAddress
                      ? <ChevronUp className="h-4 w-4" />
                      : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded task list */}
              {expandedWallet === group.walletAddress && (
                <div className="flex flex-col gap-2 mt-1">
                  {group.submissions.map((sub) => (
                    <div
                      key={sub.taskId}
                      className={cn(
                        "flex flex-col gap-2 rounded-lg p-3",
                        sub.status === "approved"
                          ? "bg-teal/10 border border-teal/20"
                          : sub.status === "rejected"
                            ? "bg-red-500/10 border border-red-500/20"
                            : "bg-background/50 border border-border/40"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium">{getTaskTitle(sub.taskId)}</span>
                          <span className="text-xs text-muted-foreground">
                            Reward: <span className="font-semibold text-teal/80" style={{ color: "oklch(0.85 0.15 195)" }}>+{getTaskReward(sub.taskId).toLocaleString("en-US")} $HYDR</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {sub.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                className="h-7 px-2 bg-teal/20 text-teal border-teal/30 hover:bg-teal/30"
                                style={{ color: "oklch(0.85 0.15 195)" }}
                                onClick={() => updateSubmissionStatus(sub.walletAddress, sub.taskId, "approved")}
                              >
                                <Check className="h-3.5 w-3.5" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 border-red-500/40 text-red-400 hover:bg-red-500/10"
                                onClick={() => updateSubmissionStatus(sub.walletAddress, sub.taskId, "rejected")}
                              >
                                <X className="h-3.5 w-3.5" /> Reject
                              </Button>
                            </>
                          )}
                          {sub.status === "approved" && (
                            <Badge className="bg-teal/20 border-teal/30 text-xs" style={{ color: "oklch(0.85 0.15 195)" }}>
                              <Check className="h-3 w-3 mr-1" /> Approved
                            </Badge>
                          )}
                          {sub.status === "rejected" && (
                            <Badge className="bg-red-500/20 border-red-500/30 text-red-400 text-xs">
                              <X className="h-3 w-3 mr-1" /> Rejected
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Submission evidence */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] text-muted-foreground">Submitted:</span>
                        {sub.screenshot ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedScreenshot(sub.screenshot!)}
                              className="rounded overflow-hidden border border-border/50 hover:border-teal/50 transition-colors max-w-[120px]"
                            >
                              <img
                                src={sub.screenshot}
                                alt="Submitted screenshot"
                                className="w-full h-16 object-cover"
                              />
                            </button>
                            <span className="text-xs text-muted-foreground">
                              {sub.handle}<br />
                              <span className="text-[10px]">{new Date(sub.at).toLocaleString("en-US")}</span>
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-mono bg-background/50 rounded px-2 py-1 border border-border/40">
                            {sub.handle}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Send approved rewards */}
                  {group.totalReward > 0 && (
                    <div className="mt-2 p-3 rounded-lg bg-teal/10 border border-teal/30 flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "oklch(0.85 0.15 195)" }}>
                            {group.hasPending ? "Approved tasks ready to pay" : "All tasks approved!"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Total reward: <span className="font-bold" style={{ color: "oklch(0.85 0.15 195)" }}>{group.totalReward.toLocaleString("en-US")} $HYDR</span>
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleSendTokens(group)}
                          disabled={sendingTokens === group.walletAddress || Boolean(sentWallets[group.walletAddress])}
                          className="btn-gradient btn-gradient-hover border-0 gap-2"
                        >
                          {sendingTokens === group.walletAddress ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
                          ) : sentWallets[group.walletAddress] ? (
                            <><Check className="h-4 w-4" /> Tokens Sent!</>
                          ) : (
                            <><Send className="h-4 w-4" /> Send {group.totalReward.toLocaleString("en-US")} $HYDR</>
                          )}
                        </Button>
                      </div>
                      {sentWallets[group.walletAddress] && sentWallets[group.walletAddress] !== "sent" && (
                        <a
                          href={`https://dashboard.radixdlt.com/transaction/${sentWallets[group.walletAddress]}`}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-[11px] font-mono underline text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                        >
                          View transaction <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  )}

                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Screenshot lightbox */}
      {selectedScreenshot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedScreenshot(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] p-2" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedScreenshot}
              alt="Full screenshot"
              className="rounded-xl max-w-full max-h-[85vh] object-contain"
            />
            <button
              onClick={() => setSelectedScreenshot(null)}
              className="absolute -top-3 -right-3 rounded-full bg-black border border-border p-1.5 hover:bg-zinc-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
