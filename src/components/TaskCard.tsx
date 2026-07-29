import { useState } from "react";
import { ExternalLink, Check, Loader2, ShieldCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useHydraStore, type Task } from "@/lib/hydra-store";
import { cn } from "@/lib/utils";

export function TaskCard({ task }: { task: Task }) {
  const { wallet, completed, pending, completeTask, submitForReview } = useHydraStore();
  const isDone = Boolean(completed[task.id]);
  const pendingSub = pending?.[task.id];
  const isPending = Boolean(pendingSub) && !isDone;
  const isSocialManual = task.category === "social" && task.verifyMode === "manual";
  const isOnchain = task.category === "onchain";
  const needsInput = isSocialManual || isOnchain;

  const [submitting, setSubmitting] = useState(false);
  const [visited, setVisited] = useState(false);
  const [handle, setHandle] = useState("");
  const [popup, setPopup] = useState<null | "pending" | "done">(null);
  const Icon = task.icon;

  const status = isDone
    ? "Completed"
    : isPending
      ? "Pending manual review"
      : submitting
        ? "Submitting"
        : "Not Started";

  const handleSubmit = () => {
    if (!wallet) return;
    if (needsInput) {
      const value = handle.trim();
      if (!value) return;
      setSubmitting(true);
      setTimeout(() => {
        submitForReview(task.id, value);
        setSubmitting(false);
        setPopup("pending");
        setTimeout(() => setPopup(null), 1600);
      }, 600);
      return;
    }
    // Fallback: auto-complete
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      completeTask(task.id);
      setPopup("done");
      setTimeout(() => setPopup(null), 1400);
    }, 1200);
  };

  return (
    <div
      className={cn(
        "relative glass-card rounded-2xl p-5 flex flex-col gap-4 transition-all",
        isDone && "ring-1 ring-teal/50",
        isPending && "ring-1 ring-yellow-300/50",
      )}
    >
      {popup === "done" && (
        <div className="pointer-events-none absolute right-4 top-4 reward-pop text-teal font-bold">
          +{task.reward.toLocaleString()} $HYDR
        </div>
      )}
      {popup === "pending" && (
        <div className="pointer-events-none absolute right-4 top-4 reward-pop text-yellow-300 font-semibold text-sm">
          Sent for review
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "grid h-11 w-11 place-items-center rounded-xl",
              task.category === "social"
                ? "bg-purple/20 text-purple"
                : "bg-teal/20 text-teal",
            )}
            style={{
              color: task.category === "social" ? "oklch(0.78 0.2 300)" : "oklch(0.85 0.15 195)",
            }}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold leading-tight">{task.title}</h3>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mt-0.5">
              {task.category === "social" ? "Social" : "On-chain"} · {task.verifyMode}
            </p>
          </div>
        </div>
        <Badge
          className="border-0 text-xs font-semibold whitespace-nowrap"
          style={{
            background: "var(--gradient-brand)",
            color: "white",
          }}
        >
          +{task.reward.toLocaleString()} $HYDR
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground">{task.description}</p>

      {isSocialManual && !isDone && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">
            {task.profileLabel ?? "Your profile"}
          </label>
          <Input
            value={isPending ? pendingSub!.handle : handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder={task.profilePlaceholder ?? "@yourhandle"}
            disabled={isPending || submitting || !wallet}
            className="bg-background/60"
          />
          {isPending && (
            <p className="text-[11px] text-yellow-300/90">
              Submitted for manual review · reward credited once approved
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-xs font-medium",
            isDone
              ? "text-teal"
              : isPending || submitting
                ? "text-yellow-300"
                : "text-muted-foreground",
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              isDone
                ? "bg-teal"
                : isPending || submitting
                  ? "bg-yellow-300 animate-pulse"
                  : "bg-muted-foreground",
            )}
          />
          {status}
        </span>

        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <a
              href={task.link}
              target="_blank"
              rel="noreferrer noopener"
              onClick={() => setVisited(true)}
            >
              Open <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
          {isDone ? (
            <Button size="sm" disabled className="bg-teal/20 text-teal border-0">
              <Check className="h-4 w-4" /> Done
            </Button>
          ) : isPending ? (
            <Button size="sm" disabled className="bg-yellow-300/20 text-yellow-300 border-0">
              <Clock className="h-4 w-4" /> Pending
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={
                !wallet ||
                submitting ||
                (isSocialManual ? !handle.trim() : task.verifyMode === "manual" && !visited)
              }
              className="btn-gradient btn-gradient-hover border-0"
              title={
                !wallet
                  ? "Connect your wallet first"
                  : isSocialManual && !handle.trim()
                    ? "Enter your profile to submit"
                    : task.verifyMode === "manual" && !visited
                      ? "Open the link first"
                      : ""
              }
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isSocialManual ? "Submitting" : "Verifying"}
                </>
              ) : isSocialManual ? (
                <>
                  <ShieldCheck className="h-4 w-4" /> Submit for review
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" /> Verify
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
