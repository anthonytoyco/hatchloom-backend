import type { SandboxTool } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useCallback, useState } from "react"
import { toast } from "sonner"

type ElementType = "heading" | "body" | "image" | "shape" | "divider" | "icon"
type PageSize = "Letter" | "A4" | "Square" | "Story"
type Template = "Product Flyer" | "One-Pager" | "Price List" | "Social Post"

interface CanvasElement {
  id: string
  type: ElementType
  content: string
  x: number
  y: number
  color?: string
  fontSize?: number
  bold?: boolean
}

const TOOLBAR_ELEMENTS: { type: ElementType; icon: string; label: string }[] = [
  { type: "heading", icon: "🔤", label: "Heading" },
  { type: "body", icon: "📝", label: "Body Text" },
  { type: "image", icon: "🖼️", label: "Image" },
  { type: "shape", icon: "⬜", label: "Shape" },
  { type: "divider", icon: "➖", label: "Divider" },
  { type: "icon", icon: "⭐", label: "Icon" },
]

const TEMPLATES: { name: Template; bg: string }[] = [
  { name: "Product Flyer", bg: "from-amber-50 to-yellow-100" },
  { name: "One-Pager", bg: "from-green-50 to-emerald-100" },
  { name: "Price List", bg: "from-cyan-50 to-sky-100" },
  { name: "Social Post", bg: "from-rose-50 to-pink-100" },
]

const PAGE_SIZES: PageSize[] = ["Letter", "A4", "Square", "Story"]

const DEFAULT_ELEMENTS: CanvasElement[] = [
  {
    id: "e1",
    type: "heading",
    content: "🧈 Flavour Butter Co.",
    x: 40,
    y: 35,
    color: "#D97706",
    fontSize: 28,
    bold: true,
  },
  {
    id: "e2",
    type: "body",
    content: "Handmade artisan flavoured butters — made fresh by students",
    x: 40,
    y: 82,
    color: "#6B7280",
    fontSize: 13,
  },
  {
    id: "e3",
    type: "shape",
    content:
      "OUR FLAVOURS\n🧄 Garlic Herb  🍯 Honey Cinnamon\n🧂 Classic Salted  🌶️ Chili Lime",
    x: 40,
    y: 120,
    color: "#D97706",
    fontSize: 13,
  },
  {
    id: "e4",
    type: "image",
    content: "📷",
    x: 40,
    y: 295,
    color: "#9CA3AF",
    fontSize: 36,
  },
  {
    id: "e5",
    type: "image",
    content: "📷",
    x: 280,
    y: 295,
    color: "#9CA3AF",
    fontSize: 36,
  },
  {
    id: "e6",
    type: "shape",
    content:
      "$9 per jar\n3 for $24 · Available at school cafeteria every Wednesday",
    x: 40,
    y: 480,
    color: "#FFFFFF",
    fontSize: 13,
  },
]

export function ImagePdfContent({
  onUnsaved,
}: {
  tool: SandboxTool
  onUnsaved: (data: string) => void
}) {
  const [elements, setElements] = useState<CanvasElement[]>(DEFAULT_ELEMENTS)
  const [selectedId, setSelectedId] = useState<string | null>("e1")
  const [template, setTemplate] = useState<Template>("Product Flyer")
  const [pageSize, setPageSize] = useState<PageSize>("Letter")

  const selected = elements.find((e) => e.id === selectedId)

  const addElement = useCallback(
    (type: ElementType) => {
      const defaults: Record<ElementType, Partial<CanvasElement>> = {
        heading: {
          content: "New Heading",
          color: "#1E1E2E",
          fontSize: 24,
          bold: true,
        },
        body: { content: "Add your text here", color: "#2D2D2D", fontSize: 13 },
        image: { content: "📷", color: "#9CA3AF", fontSize: 48 },
        shape: { content: "Shape", color: "#D97706", fontSize: 13 },
        divider: { content: "—", color: "#EDEEF2", fontSize: 13 },
        icon: { content: "⭐", color: "#D97706", fontSize: 32 },
      }
      const id = `el-${Date.now()}`
      const x = 40 + Math.random() * 100
      const y = 60 + Math.random() * 120
      const el: CanvasElement = {
        id,
        type,
        x,
        y,
        ...defaults[type],
      } as CanvasElement
      setElements((prev) => {
        const next = [...prev, el]
        onUnsaved(JSON.stringify(next))
        return next
      })
      setSelectedId(el.id)
      toast.info("Element added — click to edit")
    },
    [onUnsaved]
  )

  function updateSelected(patch: Partial<CanvasElement>) {
    if (!selectedId) return
    setElements((prev) => {
      const next = prev.map((e) =>
        e.id === selectedId ? { ...e, ...patch } : e
      )
      onUnsaved(JSON.stringify(next))
      return next
    })
  }

  function removeSelected() {
    if (!selectedId) return
    setElements((prev) => {
      const next = prev.filter((e) => e.id !== selectedId)
      onUnsaved(JSON.stringify(next))
      return next
    })
    setSelectedId(null)
  }

  const templateBg =
    TEMPLATES.find((t) => t.name === template)?.bg ??
    "from-amber-50 to-yellow-100"

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left toolbar */}
      <div className="flex w-50 shrink-0 flex-col gap-4 overflow-y-auto border-r border-border bg-hatch-bg p-3">
        <div>
          <p className="mb-2 font-heading text-[0.62rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
            Add Elements
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {TOOLBAR_ELEMENTS.map((el) => (
              <button
                key={el.type}
                onClick={() => addElement(el.type)}
                className="flex flex-col items-center gap-1 rounded-[8px] border border-border bg-card px-1 py-2 text-center transition-all hover:border-amber-300 hover:bg-amber-50"
              >
                <span className="text-[1.05rem]">{el.icon}</span>
                <span className="font-heading text-[0.58rem] font-bold text-muted-foreground">
                  {el.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 font-heading text-[0.62rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
            Templates
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {TEMPLATES.map((t) => (
              <button
                key={t.name}
                onClick={() => {
                  setTemplate(t.name)
                  toast.success(`Template applied: ${t.name}`)
                }}
                className={cn(
                  "flex aspect-3/4 items-center justify-center rounded-[8px] border p-1 text-center font-heading text-[0.58rem] font-bold text-muted-foreground transition-all",
                  `bg-linear-to-br ${t.bg}`,
                  template === t.name
                    ? "border-amber-400 shadow-sm"
                    : "border-border hover:border-amber-300"
                )}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 font-heading text-[0.62rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
            Page Size
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {PAGE_SIZES.map((s) => (
              <button
                key={s}
                onClick={() => setPageSize(s)}
                className={cn(
                  "rounded-[7px] border py-1.5 font-heading text-[0.68rem] font-bold transition-all",
                  pageSize === s
                    ? "border-amber-400 bg-amber-50 text-amber-700"
                    : "border-border bg-card text-muted-foreground hover:border-muted-foreground/30"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas area */}
      <div className="flex flex-1 items-start justify-center overflow-auto bg-[#E5E7EB] p-6">
        <div
          className={cn(
            "relative overflow-hidden rounded-sm bg-linear-to-b shadow-[0_8px_40px_rgba(0,0,0,0.12)]",
            templateBg
          )}
          style={{ width: 480, height: 620 }}
        >
          {elements.map((el) => (
            <div
              key={el.id}
              onClick={() => setSelectedId(el.id)}
              style={{
                left: el.x,
                top: el.y,
                color: el.color,
                fontSize: el.fontSize,
              }}
              className={cn(
                "absolute cursor-pointer rounded px-2 py-1 transition-all select-none",
                selectedId === el.id
                  ? "ring-2 ring-amber-400"
                  : "hover:ring-2 hover:ring-amber-200",
                el.type === "shape" &&
                  "min-w-50 rounded-[10px] border border-amber-200 bg-amber-50/80 px-3 py-2",
                el.type === "divider" &&
                  "h-px w-100 border-t border-current py-0"
              )}
            >
              {el.type === "image" ? (
                <div className="flex h-30 w-40 items-center justify-center rounded-[8px] border-2 border-dashed border-gray-300 bg-gray-50 text-4xl">
                  {el.content}
                </div>
              ) : el.type === "shape" ? (
                <div className="font-heading text-[0.75rem] leading-relaxed font-bold whitespace-pre-wrap">
                  {el.content}
                </div>
              ) : el.type === "divider" ? null : (
                <span
                  className={cn(
                    "whitespace-nowrap",
                    el.bold && "font-heading font-black",
                    el.type === "body" && "text-sm"
                  )}
                  style={{ fontSize: el.fontSize }}
                >
                  {el.content}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Properties panel */}
      <div className="flex w-47.5 shrink-0 flex-col gap-4 overflow-y-auto border-l border-border bg-hatch-bg p-3">
        {selected ? (
          <>
            <div>
              <p className="mb-1 font-heading text-[0.6rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
                Selected
              </p>
              <p className="font-heading text-[0.76rem] font-bold text-hatch-charcoal capitalize">
                {selected.type}
              </p>
            </div>

            <div>
              <p className="mb-1 font-heading text-[0.6rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
                Content
              </p>
              <textarea
                className="min-h-15 w-full resize-none rounded-[7px] border border-border bg-card px-2 py-1.5 text-[0.75rem] leading-relaxed outline-none focus:border-amber-400"
                value={selected.content}
                onChange={(e) => updateSelected({ content: e.target.value })}
              />
            </div>

            {selected.type !== "divider" && selected.type !== "image" && (
              <div>
                <p className="mb-1 font-heading text-[0.6rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
                  Font Size
                </p>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    className="w-14 rounded-[7px] border border-border bg-card px-2 py-1 text-[0.74rem] outline-none focus:border-amber-400"
                    value={selected.fontSize ?? 14}
                    onChange={(e) =>
                      updateSelected({
                        fontSize: parseInt(e.target.value) || 14,
                      })
                    }
                  />
                  <span className="text-[0.64rem] text-muted-foreground/60">
                    px
                  </span>
                </div>
              </div>
            )}

            <div>
              <p className="mb-1 font-heading text-[0.6rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
                Color
              </p>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  className="size-7 cursor-pointer rounded border border-border"
                  value={selected.color ?? "#1E1E2E"}
                  onChange={(e) => updateSelected({ color: e.target.value })}
                />
                <input
                  className="flex-1 rounded-[7px] border border-border bg-card px-2 py-1 font-mono text-[0.68rem] outline-none focus:border-amber-400"
                  value={selected.color ?? "#1E1E2E"}
                  onChange={(e) => updateSelected({ color: e.target.value })}
                />
              </div>
            </div>

            <div>
              <p className="mb-1 font-heading text-[0.6rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
                Actions
              </p>
              <div className="flex gap-1.5">
                <button
                  onClick={() => {
                    const copy = {
                      ...selected,
                      id: `el-${Date.now()}`,
                      x: selected.x + 10,
                      y: selected.y + 10,
                    }
                    setElements((prev) => {
                      const next = [...prev, copy]
                      onUnsaved(JSON.stringify(next))
                      return next
                    })
                    setSelectedId(copy.id)
                    toast.info("Element duplicated")
                  }}
                  className="flex-1 rounded-[7px] border border-border bg-card py-1.5 font-heading text-[0.65rem] font-bold transition-colors hover:bg-hatch-bg"
                >
                  Duplicate
                </button>
                <button
                  onClick={removeSelected}
                  className="flex-1 rounded-[7px] border border-border bg-card py-1.5 font-heading text-[0.65rem] font-bold text-hatch-pink transition-colors hover:border-hatch-pink/40 hover:bg-rose-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <span className="text-2xl">👆</span>
            <p className="font-heading text-[0.72rem] font-bold text-muted-foreground/60">
              Click an element to edit
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
