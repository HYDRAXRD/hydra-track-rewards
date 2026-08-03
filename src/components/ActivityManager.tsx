import { useEffect, useState } from "react";
import { Plus, Trash2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  CUSTOM_TASK_ICONS,
  setCustomTaskCache,
  type CustomTask,
  type TaskCategory,
} from "@/lib/hydra-store";
import {
  fetchCustomTasks,
  insertCustomTask,
  deleteCustomTask,
} from "@/lib/hydra-db";


const ICON_NAMES = Object.keys(CUSTOM_TASK_ICONS);

function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40) || "task"
  );
}

export function ActivityManager() {
  const [tasks, setTasks] = useState<CustomTask[]>([]);
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [reward, setReward] = useState("100");
  const [category, setCategory] = useState<TaskCategory>("social");
  const [iconName, setIconName] = useState(ICON_NAMES[0]);
  const [profileLabel, setProfileLabel] = useState("");
  const [profilePlaceholder, setProfilePlaceholder] = useState("");

  useEffect(() => {
    setTasks(readCustomTasks());
  }, []);

  const reset = () => {
    setTitle("");
    setDescription("");
    setLink("");
    setReward("100");
    setCategory("social");
    setIconName(ICON_NAMES[0]);
    setProfileLabel("");
    setProfilePlaceholder("");
  };

  const canSave =
    title.trim() && description.trim() && link.trim() && Number(reward) > 0;

  const addTask = () => {
    if (!canSave) return;
    const existing = readCustomTasks();
    let id = slugify(title);
    if (existing.some((t) => t.id === id)) id = `${id}-${Date.now().toString(36).slice(-4)}`;
    const next: CustomTask[] = [
      ...existing,
      {
        id,
        title: title.trim(),
        description: description.trim(),
        link: link.trim(),
        reward: Number(reward),
        category,
        iconName,
        verifyMode: "manual",
        profileLabel: profileLabel.trim() || undefined,
        profilePlaceholder: profilePlaceholder.trim() || undefined,
        createdAt: Date.now(),
      },
    ];
    saveCustomTasks(next);
    setTasks(next);
    reset();
    setOpen(false);
  };

  const removeTask = (id: string) => {
    const next = readCustomTasks().filter((t) => t.id !== id);
    saveCustomTasks(next);
    setTasks(next);
  };

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple/20">
            <PlusCircle className="h-5 w-5" style={{ color: "oklch(0.78 0.2 300)" }} />
          </div>
          <div>
            <h2 className="font-bold text-lg">Activities &amp; Rewards</h2>
            <p className="text-xs text-muted-foreground">
              Create new tasks and set their $HYDR reward for all participants.
            </p>
          </div>
        </div>
        <Button
          size="sm"
          className="btn-gradient btn-gradient-hover border-0 gap-1.5"
          onClick={() => setOpen((v) => !v)}
        >
          <Plus className="h-4 w-4" /> {open ? "Close" : "New activity"}
        </Button>
      </div>

      {open && (
        <div className="rounded-xl border border-border/50 p-4 flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Share the HYDRA meme contest" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">Reward ($HYDR)</label>
              <Input
                type="number"
                min={1}
                value={reward}
                onChange={(e) => setReward(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">Description / requirement</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Post a HYDRA meme and share the link."
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">Link</label>
            <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="h-9 rounded-md border border-input bg-background/60 px-3 text-sm"
              >
                <option value="social">Social</option>
                <option value="onchain">On-chain</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">Icon</label>
              <select
                value={iconName}
                onChange={(e) => setIconName(e.target.value)}
                className="h-9 rounded-md border border-input bg-background/60 px-3 text-sm"
              >
                {ICON_NAMES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {category === "social" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground">Proof field label (optional)</label>
                <Input
                  value={profileLabel}
                  onChange={(e) => setProfileLabel(e.target.value)}
                  placeholder="Your X profile"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground">Proof field placeholder (optional)</label>
                <Input
                  value={profilePlaceholder}
                  onChange={(e) => setProfilePlaceholder(e.target.value)}
                  placeholder="@yourhandle"
                />
              </div>
            </div>
          )}

          <p className="text-[11px] text-muted-foreground">
            On-chain activities ask participants for a transaction id; social activities ask for the profile/proof field above.
          </p>

          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => { reset(); setOpen(false); }}>
              Cancel
            </Button>
            <Button size="sm" disabled={!canSave} onClick={addTask} className="btn-gradient btn-gradient-hover border-0">
              Create activity
            </Button>
          </div>
        </div>
      )}

      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">No custom activities yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {tasks.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-background/50 p-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{t.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {t.category === "social" ? "Social" : "On-chain"} · {t.link}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge className="border-0 text-xs" style={{ background: "var(--gradient-brand)", color: "white" }}>
                  +{t.reward.toLocaleString("en-US")} $HYDR
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 border-red-500/40 text-red-400 hover:bg-red-500/10"
                  onClick={() => removeTask(t.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
