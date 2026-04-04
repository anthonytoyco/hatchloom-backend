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
  "CANVAS_BOARD",
  "CALCULATOR",
  "TEMPLATE_FORM",
  "DOWNLOAD",
  "IMAGE_PDF",
  "VIDEO_AUDIO",
  "SOCIAL_POST",
  "LOGO_BRAND",
  "SURVEY",
  "INVOICE",
  "QR_CODE",
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

function getToolLabel(toolType: ToolType) {
  return TOOL_META.find((tool) => tool.type === toolType)?.label ?? toolType
}

function getDuplicateToolMessage(toolType: ToolType) {
  return `You can only have one ${getToolLabel(toolType)} in your sandbox`
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
        <button
          onClick={onAddTool}
          className="flex items-center gap-1 font-heading text-[0.7rem] font-bold text-sandbox-green hover:opacity-80"
        >
          <Plus className="size-3" /> Add tool
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {tools.map((tool, idx) => {
          const meta = TOOL_META.find((m) => m.type === tool.toolType)
          if (!meta) return null
          const isNew = idx === tools.length - 1 && tools.length > 2
          return (
            <Link
              key={tool.id}
              to={`/sandboxes/${sandboxId}/tools/${tool.toolType}`}
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
  tools,
  onClose,
}: {
  open: boolean
  sandboxId: string
  tools: SandboxTool[]
  onClose: () => void
}) {
  const [selected, setSelected] = useState<ToolType | null>(null)
  const { mutateAsync, isPending } = useAddTool(sandboxId)
  const existingToolTypes = new Set(tools.map((tool) => tool.toolType))

  function handleClose() {
    setSelected(null)
    onClose()
  }

  async function handleAdd() {
    if (!selected) return
    if (existingToolTypes.has(selected)) {
      toast.error(getDuplicateToolMessage(selected))
      return
    }

    try {
      await mutateAsync({ toolType: selected })
      handleClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add tool")
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-black text-hatch-charcoal">
            Add a Tool 🛠
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Each sandbox can only have one of each tool type.
        </p>
        <div className="grid max-h-[380px] grid-cols-2 gap-2 overflow-y-auto py-2">
          {TOOL_META.map((m) => {
            const isAlreadyAdded = existingToolTypes.has(m.type)

            return (
              <button
                key={m.type}
                onClick={() => {
                  if (!IMPLEMENTED_TOOL_TYPES.includes(m.type)) {
                    toast.info(
                      `${m.label} is a placeholder tool and editor support is coming soon.`
                    )
                    return
                  }
                  if (isAlreadyAdded) {
                    toast.error(getDuplicateToolMessage(m.type))
                    return
                  }
                  setSelected(m.type)
                }}
                className={cn(
                  "flex items-start gap-2.5 rounded-xl border p-3 text-left transition-all",
                  isAlreadyAdded
                    ? "border-dashed border-amber-300 bg-amber-50/70"
                    : selected === m.type
                      ? "border-sandbox-green bg-green-50"
                      : "border-border hover:border-muted-foreground/30 hover:bg-hatch-bg"
                )}
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-orange-50">
                  <ToolIcon
                    name={m.icon}
                    className="size-4 text-hatch-orange"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-heading text-[0.78rem] font-bold text-hatch-charcoal">
                      {m.label}
                    </p>
                    {isAlreadyAdded ? (
                      <span className="shrink-0 rounded-full bg-white px-2 py-0.5 font-heading text-[0.58rem] font-extrabold tracking-[0.08em] text-amber-700 uppercase">
                        Added
                      </span>
                    ) : null}
                  </div>
                  <p className="text-[0.67rem] leading-snug text-muted-foreground">
                    {m.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
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
