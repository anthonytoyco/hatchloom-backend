import type { SandboxTool } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { toast } from "sonner"

type FileType = "doc" | "img" | "vid" | "link"

interface ProjectFile {
  id: string
  name: string
  type: FileType
  meta: string
  date: string
  icon: string
  iconBg: string
}

interface DownloadData {
  files: ProjectFile[]
}

const DEMO: DownloadData = {
  files: [
    {
      id: "f1",
      name: "Compostable_Materials_Research.pdf",
      type: "doc",
      meta: "PDF · 2.4 MB",
      date: "Feb 15",
      icon: "📄",
      iconBg: "bg-indigo-50 border-indigo-200",
    },
    {
      id: "f2",
      name: "Customer_Interview_Notes.docx",
      type: "doc",
      meta: "DOCX · 340 KB",
      date: "Feb 20",
      icon: "📝",
      iconBg: "bg-indigo-50 border-indigo-200",
    },
    {
      id: "f3",
      name: "Prototype_Wrapper_v1.png",
      type: "img",
      meta: "PNG · 1.8 MB",
      date: "Feb 18",
      icon: "🖼️",
      iconBg: "bg-amber-50 border-amber-200",
    },
    {
      id: "f4",
      name: "EcoWraps Supplier Website",
      type: "link",
      meta: "ecowraps.ca",
      date: "Feb 15",
      icon: "🔗",
      iconBg: "bg-cyan-50 border-cyan-200",
    },
  ],
}

const TAB_FILTERS: { key: string; label: string; emoji: string }[] = [
  { key: "all", label: "All", emoji: "📁" },
  { key: "doc", label: "Documents", emoji: "📄" },
  { key: "img", label: "Images", emoji: "🖼️" },
  { key: "vid", label: "Video / Audio", emoji: "🎬" },
  { key: "link", label: "Links", emoji: "🔗" },
]

export function DownloadContent({
  tool,
  onUnsaved,
}: {
  tool: SandboxTool
  onUnsaved: (data: string) => void
}) {
  const initial: DownloadData = (() => {
    try {
      const parsed = JSON.parse(tool.data ?? "{}") as DownloadData
      if (parsed.files) return parsed
      return DEMO
    } catch {
      return DEMO
    }
  })()

  const [data, setData] = useState<DownloadData>(initial)
  const [activeTab, setActiveTab] = useState("all")
  const [dragging, setDragging] = useState(false)
  const [linkInput, setLinkInput] = useState("")
  const [showLinkInput, setShowLinkInput] = useState(false)

  function removeFile(id: string) {
    setData((prev) => {
      const next = { files: prev.files.filter((f) => f.id !== id) }
      onUnsaved(JSON.stringify(next))
      return next
    })
    toast.success("File removed.")
  }

  function addLink() {
    if (!linkInput.trim()) return
    let name = linkInput.trim()
    let meta = name
    try {
      const url = new URL(name)
      meta = url.hostname
      name = url.hostname.replace("www.", "")
    } catch {
      // not a valid URL — use raw input as name
    }
    const file: ProjectFile = {
      id: `f-${Date.now()}`,
      name,
      type: "link",
      meta,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      icon: "🔗",
      iconBg: "bg-cyan-50 border-cyan-200",
    }
    setData((prev) => {
      const next = { files: [...prev.files, file] }
      onUnsaved(JSON.stringify(next))
      return next
    })
    setLinkInput("")
    setShowLinkInput(false)
    toast.success("Link added!")
  }

  const filtered =
    activeTab === "all"
      ? data.files
      : activeTab === "vid"
        ? []
        : data.files.filter((f) => f.type === activeTab)

  const counts: Record<string, number> = {
    all: data.files.length,
    doc: data.files.filter((f) => f.type === "doc").length,
    img: data.files.filter((f) => f.type === "img").length,
    vid: 0,
    link: data.files.filter((f) => f.type === "link").length,
  }

  return (
    <div className="flex flex-1 justify-center overflow-auto px-6 py-5">
      <div className="w-full max-w-200">
        {/* Type tabs */}
        <div className="mb-4 flex flex-wrap gap-2">
          {TAB_FILTERS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 rounded-[9px] border px-3.5 py-2 font-heading text-[0.74rem] font-bold transition-all",
                activeTab === tab.key
                  ? "border-sandbox-green bg-green-50 text-sandbox-green"
                  : "border-border bg-card text-muted-foreground hover:border-muted-foreground/30"
              )}
            >
              {tab.emoji} {tab.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-px text-[0.58rem] font-extrabold",
                  activeTab === tab.key
                    ? "bg-sandbox-green/15 text-sandbox-green"
                    : "bg-hatch-bg text-muted-foreground/60"
                )}
              >
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Drop zone */}
        <div
          className={cn(
            "mb-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-hatch-bg px-6 py-8 text-center transition-all",
            dragging
              ? "border-sandbox-green bg-green-50"
              : "border-border hover:border-sandbox-green hover:bg-green-50"
          )}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            toast.info(
              "File received! (Upload wired in backend integration phase)"
            )
          }}
        >
          <div className="mb-2 text-4xl">📂</div>
          <p className="font-heading text-[0.9rem] font-extrabold text-hatch-charcoal">
            Drop files here
          </p>
          <p className="mt-1 text-[0.75rem] text-muted-foreground">
            or choose an option below
          </p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() =>
                toast.info("File upload wired in backend integration phase")
              }
              className="rounded-[8px] bg-sandbox-green px-4 py-2 font-heading text-[0.74rem] font-bold text-white transition-colors hover:bg-emerald-700"
            >
              📄 Upload File
            </button>
            <button
              onClick={() => setShowLinkInput((v) => !v)}
              className="rounded-[8px] border border-border bg-card px-4 py-2 font-heading text-[0.74rem] font-bold text-foreground transition-colors hover:bg-hatch-bg"
            >
              🔗 Add Link
            </button>
          </div>

          {showLinkInput && (
            <div
              className="mt-3 flex w-full max-w-sm gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                className="flex-1 rounded-[8px] border border-border bg-card px-3 py-1.5 text-[0.78rem] outline-none focus:border-sandbox-green"
                placeholder="Paste a URL..."
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addLink()
                }}
                autoFocus
              />
              <button
                onClick={addLink}
                className="rounded-[8px] bg-sandbox-green px-3 py-1.5 font-heading text-[0.74rem] font-bold text-white hover:bg-emerald-700"
              >
                Add
              </button>
            </div>
          )}
        </div>

        {/* File list */}
        {activeTab === "vid" ? (
          <div className="rounded-xl border border-border py-12 text-center">
            <div className="mb-2 text-4xl">🎬</div>
            <p className="font-heading text-[0.88rem] font-extrabold text-muted-foreground">
              No videos or audio yet
            </p>
            <p className="mt-1 text-[0.74rem] text-muted-foreground">
              Record a pitch video or upload a clip to get started
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-border py-12 text-center">
            <div className="mb-2 text-4xl">📭</div>
            <p className="font-heading text-[0.88rem] font-extrabold text-muted-foreground">
              Nothing here yet
            </p>
          </div>
        ) : (
          <div>
            <p className="mb-2 flex items-center gap-1.5 font-heading text-[0.72rem] font-extrabold text-hatch-charcoal">
              Attached Files
              <span className="rounded-full bg-hatch-bg px-1.5 py-px text-[0.6rem] font-bold text-muted-foreground/50">
                {filtered.length}
              </span>
            </p>
            <div className="flex flex-col gap-2">
              {filtered.map((file) => (
                <div
                  key={file.id}
                  className="group flex items-center gap-3 rounded-[10px] border border-border bg-hatch-bg px-3.5 py-2.5 transition-all hover:border-muted-foreground/20 hover:shadow-sm"
                >
                  <div
                    className={cn(
                      "flex size-9.5 shrink-0 items-center justify-center rounded-[9px] border text-[1.1rem]",
                      file.iconBg
                    )}
                  >
                    {file.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-heading text-[0.78rem] font-bold text-hatch-charcoal">
                      {file.name}
                    </p>
                    <p className="flex gap-2 text-[0.66rem] text-muted-foreground/60">
                      <span>{file.meta}</span>
                      <span>Added {file.date}</span>
                    </p>
                  </div>
                  <div className="flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                    {file.type === "link" ? (
                      <button
                        onClick={() => toast.info("Opening link...")}
                        className="flex size-7 items-center justify-center rounded-md border border-border bg-card text-[0.7rem] transition-colors hover:bg-hatch-bg"
                      >
                        ↗
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() =>
                            toast.info(
                              "Download wired in backend integration phase"
                            )
                          }
                          className="flex size-7 items-center justify-center rounded-md border border-border bg-card text-[0.7rem] transition-colors hover:bg-hatch-bg"
                        >
                          ⬇️
                        </button>
                        <button
                          onClick={() =>
                            toast.info(
                              "Preview wired in backend integration phase"
                            )
                          }
                          className="flex size-7 items-center justify-center rounded-md border border-border bg-card text-[0.7rem] transition-colors hover:bg-hatch-bg"
                        >
                          👁
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => removeFile(file.id)}
                      className="flex size-7 items-center justify-center rounded-md border border-border bg-card text-[0.7rem] transition-colors hover:border-hatch-pink hover:bg-rose-50 hover:text-hatch-pink"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="mt-3 text-right text-[0.68rem] text-muted-foreground/40">
          Files · {data.files.length} attached
        </p>
      </div>
    </div>
  )
}
