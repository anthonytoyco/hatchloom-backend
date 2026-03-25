import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAddTool } from "@/hooks/use-mutations"
import { TOOL_META } from "@/lib/mock-data"
import type { SandboxTool, ToolType } from "@/lib/types"
import { cn } from "@/lib/utils"
import * as Icons from "lucide-react"
import { Plus } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router"
import { toast } from "sonner"

const IMPLEMENTED_TOOL_TYPES: ToolType[] = [
  "POSTIT",
  "CHECKLIST",
  "GUIDED_QA",
  "DECK",
]

function ToolIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (
    Icons as unknown as Record<
      string,
      React.ComponentType<{ className?: string }>
    >
  )[name]
  if (!Icon) return <span className="size-5" />
  return <Icon className={className} />
}

export function ActiveToolsCard({
  tools,
  sandboxId,
  onAddTool,
}: {
  tools: SandboxTool[]
  sandboxId: string
  onAddTool: () => void
}) {
  return (
    <div className="rounded-[14px] border border-border bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-heading text-[0.85rem] font-extrabold text-hatch-charcoal">
            🛠 Active Tools
          </span>
          <span className="rounded-full bg-muted px-[0.45rem] py-0.5 font-heading text-[0.65rem] font-bold text-muted-foreground/60">
            {tools.length}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onAddTool}
            className="flex items-center gap-1 font-heading text-[0.7rem] font-bold text-sandbox-green hover:opacity-80"
          >
            <Plus className="size-3" /> Add tool
          </button>
          <button
            onClick={() =>
              toast.info(
                "Placeholder: full Active Tools index view is not wired yet."
              )
            }
            className="font-heading text-[0.7rem] font-bold text-hatch-pink hover:opacity-80"
          >
            See all →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {tools.map((tool, idx) => {
          const meta = TOOL_META.find((m) => m.type === tool.toolType)
          if (!meta) return null
          const isNew = idx === tools.length - 1 && tools.length > 2
          return (
            <Link
              key={tool.id}
              to={`/launchpad/sandboxes/${sandboxId}/tools/${tool.toolType}`}
              className="group flex items-center gap-2.5 rounded-[10px] border border-border bg-hatch-bg px-3 py-2.5 transition-all hover:border-sandbox-green hover:bg-white hover:shadow-[0_2px_8px_rgba(5,150,105,0.1)]"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-orange-50">
                <ToolIcon
                  name={meta.icon}
                  className="size-4 text-hatch-orange"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-heading text-[0.78rem] font-bold text-hatch-charcoal">
                  {meta.label}
                </p>
                <p className="truncate text-[0.65rem] text-muted-foreground">
                  {meta.description}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded px-1.5 py-0.5 font-heading text-[0.55rem] font-extrabold",
                  isNew
                    ? "bg-rose-50 text-hatch-pink"
                    : "bg-green-50 text-green-700"
                )}
              >
                {isNew ? "New" : "Active"}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function AddToolDialog({
  open,
  sandboxId,
  onClose,
}: {
  open: boolean
  sandboxId: string
  onClose: () => void
}) {
  const [selected, setSelected] = useState<ToolType | null>(null)
  const { mutateAsync, isPending } = useAddTool(sandboxId)

  async function handleAdd() {
    if (!selected) return
    await mutateAsync({ toolType: selected })
    onClose()
    setSelected(null)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-black text-hatch-charcoal">
            Add a Tool 🛠
          </DialogTitle>
        </DialogHeader>
        <div className="grid max-h-[380px] grid-cols-2 gap-2 overflow-y-auto py-2">
          {TOOL_META.map((m) => (
            <button
              key={m.type}
              onClick={() => {
                if (!IMPLEMENTED_TOOL_TYPES.includes(m.type)) {
                  toast.info(
                    `${m.label} is a placeholder tool and editor support is coming soon.`
                  )
                  return
                }
                setSelected(m.type)
              }}
              className={cn(
                "flex items-start gap-2.5 rounded-xl border p-3 text-left transition-all",
                selected === m.type
                  ? "border-sandbox-green bg-green-50"
                  : "border-border hover:border-muted-foreground/30 hover:bg-hatch-bg"
              )}
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-orange-50">
                <ToolIcon name={m.icon} className="size-4 text-hatch-orange" />
              </div>
              <div>
                <p className="font-heading text-[0.78rem] font-bold text-hatch-charcoal">
                  {m.label}
                </p>
                <p className="text-[0.67rem] leading-snug text-muted-foreground">
                  {m.description}
                </p>
              </div>
            </button>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!selected || isPending}
            onClick={() => void handleAdd()}
            className="bg-sandbox-green text-white hover:bg-emerald-700"
          >
            Add Tool
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
