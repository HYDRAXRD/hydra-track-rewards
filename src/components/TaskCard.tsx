import { useState, useRef } from "react";
import { ExternalLink, Check, Loader2, ShieldCheck, Clock, Upload, ImageIcon, X } from "lucide-react";
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
  const needsScreenshot = isOnchain && task.id === "bubbles";
  const needsTxid = isOnchain && !needsScreenshot;
  const needsInput = isSocialManual || isOnchain;

  const [submitting, setSubmitting] = useState(false);
  const [visited, setVisited] = useState(false);
  const [handle, setHandle] = useState("");
  const [screenshot, setScreenshot] = useState<string | undefined>(undefined);
  const [screenshotName, setScreenshotName] = useState("");
  const [popup, setPopup] = useState<null | "pending" | "done">(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const Icon = task.icon;

  const status = isDone
    ? "Completed"
    : isPending
      ? "Pending manual review"
      : submitting
        ? "Submitting"
        : "Not Started";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshotName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setScreenshot(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearScreenshot = () => {
    setScreenshot(undefined);
    setScreenshotName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = () => {
    if (!wallet) return;
    if (needsInput) {
      if (isOnchain && !screenshot) return;
      if (isSocialManual && !handle.trim()) return;
      setSubmitting(true);
      setTimeout(() => {
        submitForReview(task.id, isOnchain ? (screenshotName || "screenshot") : handle.trim(), screenshot);
        setSubmitting(false);
        setPopup("pending");
        setTimeout(() => setPopup(null), 1600);
      }, 600);
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      completeTask(task.id);
      setPopup("done");
      setTimeout(() => setPopup(null), 1400);
    }, 1200);
  };

  const canSubmit = wallet && !submitting && (
    isOnchain ? Boolean(screenshot) :
    isSocialManual ? Boolean(handle.trim()) :
    (task.verifyMode !== "manual" || visited)
  );

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

      {/* Social tasks: text input for handle */}
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

      {/* Onchain tasks: screenshot upload */}
      {isOnchain && !isDone && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">
            Screenshot of system access & wallet connection
          </label>
          {isPending && pendingSub?.screenshot ? (
            <div className="flex items-center gap-2 rounded-lg bg-yellow-300/10 border border-yellow-300/30 p-2">
              <ImageIcon className="h-4 w-4 text-yellow-300 shrink-0" />
              <span className="text-xs text-yellow-300/90 truncate">{pendingSub.handle}</span>
            </div>
          ) : !isPending ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={submitting || !wallet}
              />
              {screenshot ? (
                <div className="relative rounded-lg overflow-hidden border border-teal/30">
                  <img src={screenshot} alt="Screenshot preview" className="w-full max-h-40 object-cover" />
                  <button
                    onClick={clearScreenshot}
                    className="absolute top-1 right-1 rounded-full bg-black/70 p-1 hover:bg-black"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                    <p className="text-[11px] text-white/80 truncate">{screenshotName}</p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={submitting || !wallet}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-lg border-2 border-dashed p-4 transition-colors",
                    wallet
                      ? "border-teal/40 hover:border-teal/70 cursor-pointer"
                      : "border-muted/30 cursor-not-allowed opacity-50"
                  )}
                >
                  <Upload className="h-6 w-6 text-teal/60" />
                  <span className="text-xs text-muted-foreground text-center">
                    Click to upload a screenshot<br />
                    <span className="text-teal/70">showing system access &amp; wallet connected</span>
                  </span>
                </button>
              )}
            </>
          ) : null}
          {isPending && (
            <p className="text-[11px] text-yellow-300/90">
              Screenshot submitted · reward credited once approved by admin
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
              disabled={!canSubmit}
              className="btn-gradient btn-gradient-hover border-0"
              title={
                !wallet
                  ? "Connect your wallet first"
                  : isOnchain && !screenshot
                    ? "Upload a screenshot to submit"
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
                  {needsInput ? "Submitting" : "Verifying"}
                </>
              ) : needsInput ? (
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
