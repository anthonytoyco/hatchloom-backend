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
  { key: "kp", label: "Key Partners", icon: "🤝", addLabel: "Add partner", gridClass: "col-start-1 row-start-1 row-span-2" },
  { key: "ka", label: "Key Activities", icon: "⚙️", addLabel: "Add activity", gridClass: "col-start-2 row-start-1" },
  { key: "vp", label: "Value Propositions", icon: "💎", addLabel: "Add value prop", gridClass: "col-start-3 row-start-1 row-span-2" },
  { key: "cr", label: "Customer Relationships", icon: "❤️", addLabel: "Add relationship", gridClass: "col-start-4 row-start-1" },
  { key: "cs", label: "Customer Segments", icon: "👥", addLabel: "Add segment", gridClass: "col-start-5 row-start-1 row-span-2" },
  { key: "kr", label: "Key Resources", icon: "🔑", addLabel: "Add resource", gridClass: "col-start-2 row-start-2" },
  { key: "ch", label: "Channels", icon: "📣", addLabel: "Add channel", gridClass: "col-start-4 row-start-2" },
  { key: "cost", label: "Cost Structure", icon: "💸", addLabel: "Add cost", gridClass: "col-start-1 row-start-3 col-span-3", horizontal: true },
  { key: "rev", label: "Revenue Streams", icon: "💰", addLabel: "Add revenue", gridClass: "col-start-4 row-start-3 col-span-2", horizontal: true },
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
      const next = { ...prev, [zone]: prev[zone].map((i) => (i.id === id ? { ...i, text } : i)) }
      onUnsaved(JSON.stringify(next))
      return next
    })
  }

  function addItem(zone: ZoneKey) {
    setData((prev) => {
      const next = { ...prev, [zone]: [...prev[zone], { id: `${zone}-${Date.now()}`, text: "" }] }
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

  const totalItems = Object.values(data).reduce((s, a) => s + a.length, 0)

  return (
    <div className="flex-1 overflow-auto px-5 py-4">
      <div className="grid grid-cols-5 grid-rows-3 border border-border rounded-[14px] overflow-hidden min-h-[500px]">
        {ZONES.map((zone) => (
          <div
            key={zone.key}
            className={cn(
              "border-[0.5px] border-border p-2.5 flex flex-col overflow-hidden",
              zone.gridClass
            )}
          >
            <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-border shrink-0">
              <span className="text-[0.82rem]">{zone.icon}</span>
              <span className="font-heading text-[0.58rem] font-extrabold uppercase tracking-[0.04em] text-hatch-charcoal flex-1 leading-tight">
                {zone.label}
              </span>
              <span className="font-heading text-[0.52rem] font-bold text-muted-foreground/50 bg-hatch-bg px-1.5 py-px rounded-full">
                {data[zone.key].length}
              </span>
            </div>
            <div
              className={cn(
                "flex gap-1.5 flex-1 min-h-0",
                zone.horizontal ? "flex-row flex-wrap overflow-x-auto content-start" : "flex-col overflow-y-auto"
              )}
            >
              {data[zone.key].map((item) => (
                <div
                  key={item.id}
                  className="group flex items-start gap-1.5 px-1.5 py-1 rounded-md bg-hatch-bg border border-transparent hover:border-green-200 hover:bg-green-50 transition-all shrink-0"
                >
                  <span className="size-[4px] rounded-full bg-sandbox-green mt-[7px] shrink-0" />
                  <input
                    className="flex-1 text-[0.7rem] leading-snug bg-transparent outline-none text-foreground placeholder:text-muted-foreground/40 min-w-0 w-full"
                    value={item.text}
                    placeholder="Type here..."
                    onChange={(e) => updateItem(zone.key, item.id, e.target.value)}
                  />
                  <button
                    onClick={() => removeItem(zone.key, item.id)}
                    className="opacity-0 group-hover:opacity-100 text-[0.55rem] text-muted-foreground/40 hover:text-hatch-pink transition-all shrink-0 pt-0.5"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => addItem(zone.key)}
                className="flex items-center gap-1 px-1.5 py-1 rounded-md text-[0.62rem] text-muted-foreground/40 border border-dashed border-transparent hover:border-green-200 hover:bg-green-50 hover:text-sandbox-green transition-all shrink-0"
              >
                <Plus className="size-2.5" />
                {zone.addLabel}
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 text-[0.68rem] text-muted-foreground/40 text-right">
        Canvas · 9 zones · {totalItems} items
      </div>
    </div>
  )
}
