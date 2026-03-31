import type { SandboxTool } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"
import { useState } from "react"

interface CanvasItem {
  id: string
  text: string
}

interface CanvasData {
  kp: CanvasItem[]
  ka: CanvasItem[]
  kr: CanvasItem[]
  vp: CanvasItem[]
  cr: CanvasItem[]
  ch: CanvasItem[]
  cs: CanvasItem[]
  cost: CanvasItem[]
  rev: CanvasItem[]
}

type ZoneKey = keyof CanvasData

const DEMO: CanvasData = {
  kp: [
    { id: "kp1", text: "School cafeteria manager" },
    { id: "kp2", text: "EcoWraps (material supplier)" },
  ],
  ka: [
    { id: "ka1", text: "Research compostable materials" },
    { id: "ka2", text: "Design packaging prototypes" },
    { id: "ka3", text: "Test with cafeteria pilot" },
  ],
  kr: [
    { id: "kr1", text: "Compostable material samples" },
    { id: "kr2", text: "School Eco Club volunteers" },
  ],
  vp: [
    { id: "vp1", text: "Snack wrappers that compost in 90 days" },
    { id: "vp2", text: "Schools reduce landfill waste by 60%" },
    { id: "vp3", text: "Affordable — within supply budget" },
  ],
  cr: [
    { id: "cr1", text: "Direct demo + free sample pack" },
    { id: "cr2", text: "Monthly check-in with cafeteria staff" },
  ],
  ch: [
    { id: "ch1", text: "In-person cafeteria demos" },
    { id: "ch2", text: "School board sustainability meetings" },
  ],
  cs: [
    { id: "cs1", text: "School cafeterias (50+ schools)" },
    { id: "cs2", text: "Eco-conscious school boards" },
  ],
  cost: [
    { id: "cost1", text: "Compostable material (biggest cost)" },
    { id: "cost2", text: "Prototype printing" },
    { id: "cost3", text: "Sample packs for demos" },
  ],
  rev: [
    { id: "rev1", text: "Per-unit packaging sales" },
    { id: "rev2", text: "Bulk order contracts" },
  ],
}

const ZONES: {
  key: ZoneKey
  label: string
  icon: string
  addLabel: string
  gridClass: string
  horizontal?: boolean
}[] = [
  {
    key: "kp",
    label: "Key Partners",
    icon: "🤝",
    addLabel: "Add partner",
    gridClass: "col-start-1 row-start-1 row-span-2",
  },
  {
    key: "ka",
    label: "Key Activities",
    icon: "⚙️",
    addLabel: "Add activity",
    gridClass: "col-start-2 row-start-1",
  },
  {
    key: "vp",
    label: "Value Propositions",
    icon: "💎",
    addLabel: "Add value prop",
    gridClass: "col-start-3 row-start-1 row-span-2",
  },
  {
    key: "cr",
    label: "Customer Relationships",
    icon: "❤️",
    addLabel: "Add relationship",
    gridClass: "col-start-4 row-start-1",
  },
  {
    key: "cs",
    label: "Customer Segments",
    icon: "👥",
    addLabel: "Add segment",
    gridClass: "col-start-5 row-start-1 row-span-2",
  },
  {
    key: "kr",
    label: "Key Resources",
    icon: "🔑",
    addLabel: "Add resource",
    gridClass: "col-start-2 row-start-2",
  },
  {
    key: "ch",
    label: "Channels",
    icon: "📣",
    addLabel: "Add channel",
    gridClass: "col-start-4 row-start-2",
  },
  {
    key: "cost",
    label: "Cost Structure",
    icon: "💸",
    addLabel: "Add cost",
    gridClass: "col-start-1 row-start-3 col-span-3",
    horizontal: true,
  },
  {
    key: "rev",
    label: "Revenue Streams",
    icon: "💰",
    addLabel: "Add revenue",
    gridClass: "col-start-4 row-start-3 col-span-2",
    horizontal: true,
  },
]

export function CanvasBoardContent({
  tool,
  onUnsaved,
}: {
  tool: SandboxTool
  onUnsaved: (data: string) => void
}) {
  const initial: CanvasData = (() => {
    try {
      const parsed = JSON.parse(tool.data ?? "{}") as Partial<CanvasData>
      if (parsed.kp) return parsed as CanvasData
      return DEMO
    } catch {
      return DEMO
    }
  })()

  const [data, setData] = useState<CanvasData>(initial)

  function updateItem(zone: ZoneKey, id: string, text: string) {
    setData((prev) => {
      const next = {
        ...prev,
        [zone]: prev[zone].map((i) => (i.id === id ? { ...i, text } : i)),
      }
      onUnsaved(JSON.stringify(next))
      return next
    })
  }

  function addItem(zone: ZoneKey) {
    setData((prev) => {
      const next = {
        ...prev,
        [zone]: [...prev[zone], { id: `${zone}-${Date.now()}`, text: "" }],
      }
      onUnsaved(JSON.stringify(next))
      return next
    })
  }

  function removeItem(zone: ZoneKey, id: string) {
    setData((prev) => {
      const next = { ...prev, [zone]: prev[zone].filter((i) => i.id !== id) }
      onUnsaved(JSON.stringify(next))
      return next
    })
  }

  const totalItems = (Object.keys(data) as ZoneKey[]).reduce(
    (s, k) => s + data[k].length,
    0
  )

  return (
    <div className="flex-1 overflow-auto px-5 py-4">
      <div className="grid min-h-[500px] grid-cols-5 grid-rows-3 overflow-hidden rounded-[14px] border border-border">
        {ZONES.map((zone) => (
          <div
            key={zone.key}
            className={cn(
              "flex flex-col overflow-hidden border-[0.5px] border-border p-2.5",
              zone.gridClass
            )}
          >
            <div className="mb-2 flex shrink-0 items-center gap-1.5 border-b border-border pb-2">
              <span className="text-[0.82rem]">{zone.icon}</span>
              <span className="flex-1 font-heading text-[0.58rem] leading-tight font-extrabold tracking-[0.04em] text-hatch-charcoal uppercase">
                {zone.label}
              </span>
              <span className="rounded-full bg-hatch-bg px-1.5 py-px font-heading text-[0.52rem] font-bold text-muted-foreground/50">
                {data[zone.key].length}
              </span>
            </div>
            <div
              className={cn(
                "flex min-h-0 flex-1 gap-1.5",
                zone.horizontal
                  ? "flex-row flex-wrap content-start overflow-x-auto"
                  : "flex-col overflow-y-auto"
              )}
            >
              {data[zone.key].map((item) => (
                <div
                  key={item.id}
                  className="group flex shrink-0 items-start gap-1.5 rounded-md border border-transparent bg-hatch-bg px-1.5 py-1 transition-all hover:border-green-200 hover:bg-green-50"
                >
                  <span className="mt-[7px] size-[4px] shrink-0 rounded-full bg-sandbox-green" />
                  <input
                    className="w-full min-w-0 flex-1 bg-transparent text-[0.7rem] leading-snug text-foreground outline-none placeholder:text-muted-foreground/40"
                    value={item.text}
                    placeholder="Type here..."
                    onChange={(e) =>
                      updateItem(zone.key, item.id, e.target.value)
                    }
                  />
                  <button
                    onClick={() => removeItem(zone.key, item.id)}
                    className="shrink-0 pt-0.5 text-[0.55rem] text-muted-foreground/40 opacity-0 transition-all group-hover:opacity-100 hover:text-hatch-pink"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => addItem(zone.key)}
                className="flex shrink-0 items-center gap-1 rounded-md border border-dashed border-transparent px-1.5 py-1 text-[0.62rem] text-muted-foreground/40 transition-all hover:border-green-200 hover:bg-green-50 hover:text-sandbox-green"
              >
                <Plus className="size-2.5" />
                {zone.addLabel}
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 text-right text-[0.68rem] text-muted-foreground/40">
        Canvas · 9 zones · {totalItems} items
      </div>
    </div>
  )
}
