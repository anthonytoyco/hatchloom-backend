import type { SandboxTool } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"
import { useState } from "react"

interface Slide {
  id: string
  title: string
  body: string
}

export function DeckContent({
  tool,
  onUnsaved,
}: {
  tool: SandboxTool
  onUnsaved: (data: string) => void
}) {
  const parsed = (() => {
    try {
      return JSON.parse(tool.data ?? '{"slides":[]}') as { slides: Slide[] }
    } catch {
      return { slides: [] as Slide[] }
    }
  })()
  const [slides, setSlides] = useState<Slide[]>(parsed.slides)
  const [activeId, setActiveId] = useState(slides[0]?.id ?? "")
  const active = slides.find((s) => s.id === activeId) ?? slides[0]

  function updateSlide(patch: Partial<Slide>) {
    setSlides((prev) => {
      const next = prev.map((s) => (s.id === activeId ? { ...s, ...patch } : s))
      onUnsaved(JSON.stringify({ slides: next }))
      return next
    })
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex w-[200px] shrink-0 flex-col gap-2 overflow-y-auto border-r border-border bg-hatch-bg px-3 py-4">
        {slides.map((s, i) => (
          <div
            key={s.id}
            onClick={() => setActiveId(s.id)}
            className={cn(
              "cursor-pointer rounded-lg border p-2.5 transition-all",
              s.id === activeId
                ? "border-hatch-orange bg-orange-50 shadow-sm"
                : "border-border bg-card hover:border-muted-foreground/30"
            )}
          >
            <p className="font-heading text-[0.55rem] font-bold tracking-[0.04em] text-muted-foreground/50 uppercase">
              Slide {i + 1}
            </p>
            <p className="mt-0.5 line-clamp-2 font-heading text-[0.72rem] leading-snug font-extrabold text-hatch-charcoal">
              {s.title}
            </p>
            <p className="mt-0.5 line-clamp-2 text-[0.6rem] leading-snug text-muted-foreground">
              {s.body}
            </p>
          </div>
        ))}
        <button
          onClick={() => {
            const newSlide: Slide = {
              id: `s${Date.now()}`,
              title: "New Slide",
              body: "",
            }
            setSlides((prev) => {
              const next = [...prev, newSlide]
              onUnsaved(JSON.stringify({ slides: next }))
              return next
            })
            setActiveId(newSlide.id)
          }}
          className="flex items-center justify-center gap-1 rounded-lg border border-dashed border-border py-2 font-heading text-[0.68rem] font-bold text-muted-foreground/40 transition-all hover:border-hatch-orange hover:bg-orange-50 hover:text-hatch-orange"
        >
          <Plus className="size-3" /> Add slide
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto bg-hatch-bg p-8">
        {active && (
          <div className="flex aspect-video w-full max-w-[700px] flex-col overflow-hidden rounded-[18px] border border-border bg-white shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
            <div className="h-[6px] bg-gradient-to-r from-hatch-orange to-hatch-pink" />
            <div className="flex flex-1 flex-col items-center justify-center p-10">
              <input
                className="w-full bg-transparent text-center font-heading text-[1.8rem] font-black text-hatch-charcoal outline-none placeholder:text-muted-foreground/30"
                value={active.title}
                onChange={(e) => updateSlide({ title: e.target.value })}
                placeholder="Slide title"
              />
              <textarea
                className="mt-4 w-full resize-none bg-transparent text-center text-[1rem] leading-relaxed text-muted-foreground outline-none placeholder:text-muted-foreground/30"
                value={active.body}
                onChange={(e) => updateSlide({ body: e.target.value })}
                placeholder="Slide content..."
                rows={3}
              />
            </div>
            <div className="flex justify-center border-t border-border px-6 py-2">
              <span className="font-heading text-[0.6rem] font-bold tracking-widest text-muted-foreground/40 uppercase">
                {slides.findIndex((s) => s.id === activeId) + 1} /{" "}
                {slides.length}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
