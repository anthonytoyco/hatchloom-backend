import type { SandboxTool } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useCallback, useEffect, useRef, useState } from "react"
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
  width?: number
  height?: number
  color?: string
  fontSize?: number
  bold?: boolean
}

interface MakerData {
  elements: CanvasElement[]
  selectedId: string | null
  template: Template
  pageSize: PageSize
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
    width: 280,
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
    width: 420,
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
    width: 320,
    height: 120,
    color: "#D97706",
    fontSize: 13,
  },
  {
    id: "e4",
    type: "image",
    content: "📷",
    x: 40,
    y: 295,
    width: 180,
    height: 130,
    color: "#9CA3AF",
    fontSize: 36,
  },
  {
    id: "e5",
    type: "image",
    content: "📷",
    x: 280,
    y: 295,
    width: 180,
    height: 130,
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
    width: 340,
    height: 90,
    color: "#FFFFFF",
    fontSize: 13,
  },
]

const PAGE_DIMENSIONS: Record<PageSize, { width: number; height: number }> = {
  Letter: { width: 480, height: 620 },
  A4: { width: 460, height: 650 },
  Square: { width: 520, height: 520 },
  Story: { width: 360, height: 640 },
}

function defaultSizeFor(type: ElementType) {
  switch (type) {
    case "image":
      return { width: 180, height: 130 }
    case "shape":
      return { width: 220, height: 90 }
    case "divider":
      return { width: 220, height: 2 }
    case "icon":
      return { width: 48, height: 48 }
    case "heading":
      return { width: 240, height: 48 }
    case "body":
      return { width: 220, height: 80 }
  }
}

function hydrateMakerData(tool: SandboxTool): MakerData {
  const fallback: MakerData = {
    elements: DEFAULT_ELEMENTS,
    selectedId: "e1",
    template: "Product Flyer",
    pageSize: "Letter",
  }

  if (!tool.data) return fallback

  try {
    const parsed = JSON.parse(tool.data) as MakerData | CanvasElement[]
    if (Array.isArray(parsed)) {
      return {
        ...fallback,
        elements: parsed.map((element) => ({
          ...element,
          ...defaultSizeFor(element.type),
          width: element.width ?? defaultSizeFor(element.type).width,
          height: element.height ?? defaultSizeFor(element.type).height,
        })),
      }
    }

    return {
      elements:
        parsed.elements?.map((element) => ({
          ...element,
          width: element.width ?? defaultSizeFor(element.type).width,
          height: element.height ?? defaultSizeFor(element.type).height,
        })) ?? fallback.elements,
      selectedId: parsed.selectedId ?? fallback.selectedId,
      template: parsed.template ?? fallback.template,
      pageSize: parsed.pageSize ?? fallback.pageSize,
    }
  } catch {
    return fallback
  }
}

export function ImagePdfContent({
  tool,
  onUnsaved,
}: {
  tool: SandboxTool
  onUnsaved: (data: string) => void
}) {
  const initial = hydrateMakerData(tool)
  const [elements, setElements] = useState<CanvasElement[]>(initial.elements)
  const [selectedId, setSelectedId] = useState<string | null>(
    initial.selectedId
  )
  const [template, setTemplate] = useState<Template>(initial.template)
  const [pageSize, setPageSize] = useState<PageSize>(initial.pageSize)
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const elementsRef = useRef(elements)
  const nextIdRef = useRef(elements.length + 1)
  const dragRef = useRef<{
    id: string
    offsetX: number
    offsetY: number
  } | null>(null)

  const selected = elements.find((e) => e.id === selectedId)

  useEffect(() => {
    elementsRef.current = elements
  }, [elements])

  const persist = useCallback(
    (
      nextElements: CanvasElement[],
      nextSelectedId = selectedId,
      nextTemplate = template,
      nextPageSize = pageSize
    ) => {
      onUnsaved(
        JSON.stringify({
          elements: nextElements,
          selectedId: nextSelectedId,
          template: nextTemplate,
          pageSize: nextPageSize,
        })
      )
    },
    [onUnsaved, pageSize, selectedId, template]
  )

  useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      if (!dragRef.current || !canvasRef.current) return
      const dragged = elementsRef.current.find(
        (element) => element.id === dragRef.current?.id
      )
      if (!dragged) return

      const rect = canvasRef.current.getBoundingClientRect()
      const width = dragged.width ?? defaultSizeFor(dragged.type).width
      const height = dragged.height ?? defaultSizeFor(dragged.type).height
      const nextX = Math.max(
        0,
        Math.min(
          rect.width - width,
          event.clientX - rect.left - dragRef.current.offsetX
        )
      )
      const nextY = Math.max(
        0,
        Math.min(
          rect.height - height,
          event.clientY - rect.top - dragRef.current.offsetY
        )
      )

      setElements((prev) =>
        prev.map((element) =>
          element.id === dragRef.current?.id
            ? { ...element, x: nextX, y: nextY }
            : element
        )
      )
    }

    function handleMouseUp() {
      if (!dragRef.current) return
      dragRef.current = null
      persist(elementsRef.current)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [persist])

  function addElement(type: ElementType) {
    const size = defaultSizeFor(type)
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
      divider: { content: "—", color: "#E5E7EB", fontSize: 13 },
      icon: { content: "⭐", color: "#D97706", fontSize: 32 },
    }

    const nextId = `el-${nextIdRef.current}`
    nextIdRef.current += 1
    const offset = elementsRef.current.length * 24

    const element: CanvasElement = {
      id: nextId,
      type,
      x: 40 + (offset % 120),
      y: 60 + (offset % 180),
      width: size.width,
      height: size.height,
      ...defaults[type],
    } as CanvasElement

    setElements((prev) => {
      const next = [...prev, element]
      persist(next, element.id)
      return next
    })
    setSelectedId(element.id)
    toast.info("Element added — drag it into place")
  }

  function startDrag(event: React.MouseEvent<HTMLDivElement>, id: string) {
    if (!canvasRef.current) return
    const element = elements.find((item) => item.id === id)
    if (!element) return

    const rect = canvasRef.current.getBoundingClientRect()
    dragRef.current = {
      id,
      offsetX: event.clientX - rect.left - element.x,
      offsetY: event.clientY - rect.top - element.y,
    }
    setSelectedId(id)
  }

  function updateSelected(patch: Partial<CanvasElement>) {
    if (!selectedId) return
    setElements((prev) => {
      const next = prev.map((e) =>
        e.id === selectedId ? { ...e, ...patch } : e
      )
      persist(next)
      return next
    })
  }

  function removeSelected() {
    if (!selectedId) return
    setElements((prev) => {
      const next = prev.filter((e) => e.id !== selectedId)
      persist(next, null)
      return next
    })
    setSelectedId(null)
  }

  const templateBg =
    TEMPLATES.find((t) => t.name === template)?.bg ??
    "from-amber-50 to-yellow-100"
  const frameSize = PAGE_DIMENSIONS[pageSize]

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
                  persist(elements, selectedId, t.name, pageSize)
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
                onClick={() => {
                  setPageSize(s)
                  persist(elements, selectedId, template, s)
                }}
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
          ref={canvasRef}
          className={cn(
            "relative overflow-hidden rounded-sm bg-linear-to-b shadow-[0_8px_40px_rgba(0,0,0,0.12)]",
            templateBg
          )}
          style={{ width: frameSize.width, height: frameSize.height }}
        >
          {elements.map((el) => (
            <div
              key={el.id}
              onClick={() => setSelectedId(el.id)}
              onMouseDown={(event) => startDrag(event, el.id)}
              style={{
                left: el.x,
                top: el.y,
                color: el.color,
                fontSize: el.fontSize,
                width: el.width,
                minHeight: el.height,
              }}
              className={cn(
                "absolute cursor-grab rounded px-2 py-1 transition-all select-none active:cursor-grabbing",
                selectedId === el.id
                  ? "ring-2 ring-amber-400"
                  : "hover:ring-2 hover:ring-amber-200",
                el.type === "shape" &&
                  "rounded-[10px] border border-amber-200 bg-amber-50/80 px-3 py-2",
                el.type === "divider" && "h-px border-t border-current py-0"
              )}
            >
              {el.type === "image" ? (
                <div
                  className="flex items-center justify-center rounded-[8px] border-2 border-dashed border-gray-300 bg-gray-50 text-4xl"
                  style={{ width: el.width, height: el.height }}
                >
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
                Position
              </p>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  className="w-14 rounded-[7px] border border-border bg-card px-2 py-1 text-[0.74rem] outline-none focus:border-amber-400"
                  value={Math.round(selected.x)}
                  onChange={(e) =>
                    updateSelected({ x: Number(e.target.value) || 0 })
                  }
                />
                <input
                  type="number"
                  className="w-14 rounded-[7px] border border-border bg-card px-2 py-1 text-[0.74rem] outline-none focus:border-amber-400"
                  value={Math.round(selected.y)}
                  onChange={(e) =>
                    updateSelected({ y: Number(e.target.value) || 0 })
                  }
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
                    const duplicateId = `el-${nextIdRef.current}`
                    nextIdRef.current += 1
                    const copy = {
                      ...selected,
                      id: duplicateId,
                      x: selected.x + 10,
                      y: selected.y + 10,
                    }
                    setElements((prev) => {
                      const next = [...prev, copy]
                      persist(next, copy.id)
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
