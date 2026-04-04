import {
  ABSep,
  ActionBtn,
  type SaveState,
  Toast,
  ToolIcon,
} from "@/components/launchpad/tool-page/shared"
import { ToolContent } from "@/components/launchpad/tool-page/tool-contents"
import { useDeleteTool, useUpdateTool } from "@/hooks/use-mutations"
import { useSandbox } from "@/hooks/use-sandbox"
import { TOOL_META } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { ChevronRight, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { toast } from "sonner"

export function ToolPage() {
  const {
    sandboxId = "11111111-1111-1111-1111-111111111101",
    toolType = "POSTIT",
  } = useParams<{ sandboxId: string; toolType: string }>()
  const navigate = useNavigate()
  const { sandbox, tools } = useSandbox(sandboxId)
  const updateTool = useUpdateTool(sandboxId)
  const deleteTool = useDeleteTool(sandboxId)

  const meta = TOOL_META.find((m) => m.type === toolType)
  const tool = tools.find((t) => t.toolType === toolType)

  const pendingDataRef = useRef(tool?.data ?? "")

  const [saveState, setSaveState] = useState<SaveState>("saved")
  const [lastSaved, setLastSaved] = useState("5 min ago")
  const [saveTimer, setSaveTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null)

  const [inlineToast, setInlineToast] = useState({ msg: "", visible: false })
  const [toastTimer, setToastTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null)

  useEffect(() => {
    pendingDataRef.current = tool?.data ?? ""
  }, [tool?.id, tool?.data])

  useEffect(() => {
    return () => {
      if (saveTimer) clearTimeout(saveTimer)
      if (toastTimer) clearTimeout(toastTimer)
    }
  }, [saveTimer, toastTimer])

  function showToast(msg: string) {
    if (toastTimer) clearTimeout(toastTimer)
    setInlineToast({ msg, visible: true })
    const timer = setTimeout(
      () => setInlineToast((prev) => ({ ...prev, visible: false })),
      2500
    )
    setToastTimer(timer)
  }

  function markUnsaved(data: string) {
    pendingDataRef.current = data
    setSaveState("unsaved")
    setLastSaved("")
    if (saveTimer) clearTimeout(saveTimer)
    const timer = setTimeout(() => void doSave(), 2000)
    setSaveTimer(timer)
  }

  async function doSave() {
    if (!tool) return
    setSaveState("saving")
    try {
      await updateTool.mutateAsync({
        toolId: tool.id,
        data: pendingDataRef.current,
      })
      setSaveState("saved")
      setLastSaved("just now")
      showToast("💾 Saved")
    } catch {
      setSaveState("unsaved")
      showToast("❌ Save failed")
    }
  }

  async function handleDelete() {
    if (!tool) return
    if (saveTimer) clearTimeout(saveTimer)
    setSaveTimer(null)
    await deleteTool.mutateAsync(tool.id)
    void navigate(`/sandboxes/${sandboxId}`)
  }

  function handleClose() {
    void navigate(-1)
  }

  return (
    <div className="fixed inset-0 z-40 bg-[#1a1a2e]/60 backdrop-blur-[4px]">
      <div className="absolute inset-0" onClick={handleClose} />

      <div
        className="absolute top-10 left-1/2 flex h-[calc(100vh-56px)] w-[calc(100%-40px)] max-w-[1440px] -translate-x-1/2 flex-col overflow-hidden rounded-t-[18px] bg-card shadow-[0_-8px_60px_rgba(0,0,0,0.35)]"
        style={{
          animation: "toolPanelUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center gap-[0.35rem] border-b border-border bg-hatch-bg px-6 py-[0.4rem] text-[0.72rem] font-semibold text-muted-foreground">
          <Link to="/" className="text-hatch-pink hover:underline">
            🚀 LaunchPad
          </Link>
          <ChevronRight className="size-3 text-border" />
          <Link to="/" className="text-hatch-pink hover:underline">
            My Sandboxes
          </Link>
          <ChevronRight className="size-3 text-border" />
          <Link
            to={`/sandboxes/${sandboxId}`}
            className="text-hatch-pink hover:underline"
          >
            ♻️ {sandbox?.title ?? sandboxId}
          </Link>
          <ChevronRight className="size-3 text-border" />
          <span>{meta?.label ?? toolType}</span>
        </div>

        <div className="flex shrink-0 items-center gap-4 border-b border-border px-6 py-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-green-200 bg-green-50 text-[1.15rem]">
            {meta ? (
              <ToolIcon
                name={meta.icon}
                className="size-5 text-sandbox-green"
              />
            ) : (
              "🔧"
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-[1.05rem] font-black text-hatch-charcoal">
              {meta?.label ?? toolType}
            </p>
            <p className="text-[0.74rem] text-muted-foreground">
              {meta?.description}
            </p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 font-heading text-[0.65rem] font-bold text-hatch-orange">
            <span className="size-[6px] rounded-full bg-current" /> Active
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 font-heading text-[0.65rem] font-bold text-sky-600">
            ⚡ 10 XP
          </span>
          <button
            onClick={handleClose}
            className="flex size-[34px] shrink-0 items-center justify-center rounded-full border border-border bg-hatch-bg text-[0.95rem] text-muted-foreground transition-all hover:border-hatch-pink/50 hover:bg-rose-50 hover:text-hatch-pink"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-2 border-b border-border px-6 py-[0.4rem]">
          <div className="flex flex-1 items-center gap-2">
            <div className="flex items-center gap-1.5 text-[0.72rem] font-semibold">
              <span
                className={cn(
                  "size-[7px] rounded-full",
                  saveState === "saved" && "bg-sandbox-green",
                  saveState === "unsaved" && "bg-hatch-pink",
                  saveState === "saving" && "animate-pulse bg-hatch-orange"
                )}
              />
              <span className="text-muted-foreground">
                {saveState === "saved"
                  ? "Saved"
                  : saveState === "saving"
                    ? "Saving…"
                    : "Unsaved"}
              </span>
              {saveState === "saved" && lastSaved && (
                <span className="text-[0.68rem] text-muted-foreground/50">
                  · {lastSaved}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <ActionBtn emoji="✏️" label="Edit" active />
            <ActionBtn emoji="💾" label="Save" onClick={() => void doSave()} />
            <ABSep />
            <ActionBtn
              emoji="⬇️"
              label="Download"
              onClick={() =>
                toast.info(
                  "Placeholder: Download export is not implemented yet for this tool."
                )
              }
            />
            <ActionBtn
              emoji="📤"
              label="Export to…"
              onClick={() =>
                toast.info(
                  "Placeholder: Export destination flow is not implemented yet."
                )
              }
            />
            <ActionBtn
              emoji="🔗"
              label="Share link"
              onClick={() =>
                toast.info(
                  "Placeholder: Share-link generation is not implemented yet."
                )
              }
            />
            <ABSep />
            <ActionBtn
              emoji="📋"
              label="Duplicate"
              onClick={() =>
                toast.info(
                  "Placeholder: Tool duplication flow is not implemented yet."
                )
              }
            />
            <ActionBtn
              emoji="🗑️"
              label="Delete"
              onClick={() => void handleDelete()}
              danger
            />
          </div>
        </div>

        <ToolContent toolType={toolType} tool={tool} onUnsaved={markUnsaved} />

        <div className="flex shrink-0 items-center justify-between border-t border-border px-6 py-[0.55rem]">
          <span className="text-[0.72rem] text-muted-foreground/60">
            {meta?.label} · {tool ? "data loaded" : "no data yet"}
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="rounded-lg border border-border bg-card px-3.5 py-[0.4rem] font-heading text-[0.76rem] font-bold text-foreground transition-all hover:bg-hatch-bg"
            >
              Close
            </button>
            <button
              onClick={() => void doSave()}
              className="rounded-lg bg-sandbox-green px-4 py-[0.4rem] font-heading text-[0.76rem] font-bold text-white transition-all hover:bg-emerald-700"
            >
              💾 Save
            </button>
          </div>
        </div>
      </div>

      <Toast msg={inlineToast.msg} visible={inlineToast.visible} />
    </div>
  )
}
