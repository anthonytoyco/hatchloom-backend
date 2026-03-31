import type { SandboxTool } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"
import { useState } from "react"

interface Slide {
  id: string
  tag: string
  title: string
  subtitle: string
  bullets: string[]
  gradient: string
  textColor: string
  footer: string
}

interface DeckData {
  slides: Slide[]
}

interface LegacyDeckSlide {
  id: string
  title: string
  body: string
}

const DEMO_SLIDES: Slide[] = [
  {
    id: "s1",
    tag: "TITLE SLIDE",
    title: "EcoSnack Packaging",
    subtitle: "Compostable snack wrappers for school cafeterias",
    bullets: ["EcoSnack Packaging - Ridgewood Academy - Feb 2026"],
    gradient: "linear-gradient(135deg,#059669,#34D399)",
    textColor: "#FFFFFF",
    footer: "hatchloom",
  },
  {
    id: "s2",
    tag: "THE PROBLEM",
    title: "200+ wrappers hit the trash every lunch",
    subtitle: "",
    bullets: [
      "School cafeterias produce massive daily packaging waste",
      "Reusable containers fail - students will not use them",
      "Staff feel guilty but have no alternatives",
      "Schools miss sustainability targets",
    ],
    gradient: "linear-gradient(135deg,#1E1E2E,#374151)",
    textColor: "#FFFFFF",
    footer: "hatchloom",
  },
  {
    id: "s3",
    tag: "THE SOLUTION",
    title: "Wrappers that compost in 90 days",
    subtitle: "",
    bullets: [
      "Compostable packaging made from plant-based materials",
      "Breaks down in standard school garden composters",
      "Drop-in replacement with no behavior change needed",
      "Priced to match existing cafeteria packaging",
    ],
    gradient: "linear-gradient(135deg,#F0FDF4,#DCFCE7)",
    textColor: "#1E1E2E",
    footer: "hatchloom",
  },
  {
    id: "s4",
    tag: "THE MARKET",
    title: "50+ schools in Calgary alone",
    subtitle: "",
    bullets: [
      "Calgary has 245 public schools with green targets",
      "Starting with Ridgewood Academy as the pilot",
      "Expand to the Calgary Board of Education next",
      "Long-term path: Alberta-wide school boards",
    ],
    gradient: "linear-gradient(135deg,#F0FBFD,#E0F5F9)",
    textColor: "#1E1E2E",
    footer: "hatchloom",
  },
  {
    id: "s5",
    tag: "HOW WE EARN",
    title: "$9 per jar - per-unit sales to schools",
    subtitle: "",
    bullets: [
      "Direct sales of packaging units to school cafeterias",
      "Semester-long bulk contracts for recurring revenue",
      "Materials cost about $3.50 per unit for ~60% margin",
      "Break-even once 15 schools are onboarded",
    ],
    gradient: "linear-gradient(135deg,#FFFBEB,#FEF3C7)",
    textColor: "#1E1E2E",
    footer: "hatchloom",
  },
  {
    id: "s6",
    tag: "THE ASK",
    title: "We need 1 pilot school to prove it works",
    subtitle: "",
    bullets: [
      "Confirm the Ridgewood pilot in March 2026",
      "Order a sample batch from EcoWraps",
      "Measure waste reduction over 4 weeks",
      "Present the results to the Calgary school board",
    ],
    gradient: "linear-gradient(135deg,#FF1F5A,#FF6B8A)",
    textColor: "#FFFFFF",
    footer: "hatchloom",
  },
]

function hydrateDeck(tool: SandboxTool): DeckData {
  try {
    const parsed = JSON.parse(tool.data ?? "{}") as unknown
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !("slides" in parsed) ||
      !Array.isArray(parsed.slides)
    ) {
      return { slides: DEMO_SLIDES }
    }

    const rawSlides = parsed.slides as Array<Slide | LegacyDeckSlide>

    if (rawSlides.length === 0) {
      return { slides: DEMO_SLIDES }
    }

    if ("body" in rawSlides[0]) {
      return {
        slides: rawSlides.map((slide, index) => {
          const legacy = slide as LegacyDeckSlide
          return {
            id: slide.id,
            tag: DEMO_SLIDES[index]?.tag ?? `SLIDE ${index + 1}`,
            title: legacy.title,
            subtitle: "",
            bullets: legacy.body ? legacy.body.split("\n").filter(Boolean) : [],
            gradient:
              DEMO_SLIDES[index]?.gradient ??
              "linear-gradient(135deg,#F3F4F6,#E5E7EB)",
            textColor: DEMO_SLIDES[index]?.textColor ?? "#1E1E2E",
            footer: "hatchloom",
          }
        }),
      }
    }

    return { slides: rawSlides as Slide[] }
  } catch {
    return { slides: DEMO_SLIDES }
  }
}

export function DeckContent({
  tool,
  onUnsaved,
}: {
  tool: SandboxTool
  onUnsaved: (data: string) => void
}) {
  const initial = hydrateDeck(tool)
  const [slides, setSlides] = useState<Slide[]>(initial.slides)
  const [activeId, setActiveId] = useState(slides[0]?.id ?? "")
  const active = slides.find((s) => s.id === activeId) ?? slides[0]

  function updateSlide(patch: Partial<Slide>) {
    setSlides((prev) => {
      const next = prev.map((s) => (s.id === activeId ? { ...s, ...patch } : s))
      onUnsaved(JSON.stringify({ slides: next }))
      return next
    })
  }

  function addSlide() {
    const newSlide: Slide = {
      id: `s-${Date.now()}`,
      tag: `NEW SLIDE`,
      title: "New slide title",
      subtitle: "Add a short supporting line",
      bullets: ["First key point", "Second key point"],
      gradient: "linear-gradient(135deg,#EEF2FF,#C7D2FE)",
      textColor: "#312E81",
      footer: "hatchloom",
    }

    setSlides((prev) => {
      const next = [...prev, newSlide]
      onUnsaved(JSON.stringify({ slides: next }))
      return next
    })
    setActiveId(newSlide.id)
  }

  if (!active) return null

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex w-50 shrink-0 flex-col gap-2 overflow-y-auto border-r border-border bg-hatch-bg px-3 py-4">
        {slides.map((s, i) => (
          <div
            key={s.id}
            onClick={() => setActiveId(s.id)}
            className={cn(
              "cursor-pointer overflow-hidden rounded-[10px] border-2 transition-all",
              s.id === activeId
                ? "border-sandbox-green shadow-[0_2px_12px_rgba(5,150,105,0.15)]"
                : "border-transparent hover:border-muted-foreground/30"
            )}
          >
            <div
              className="aspect-[16/10] px-2.5 py-2"
              style={{ background: s.gradient, color: s.textColor }}
            >
              <p className="font-heading text-[0.55rem] font-bold tracking-[0.04em] uppercase opacity-50">
                {i + 1}
              </p>
              <p className="mt-1 line-clamp-3 font-heading text-[0.68rem] leading-snug font-extrabold">
                {s.title}
              </p>
              <p className="mt-1 text-[0.52rem] opacity-70">{s.tag}</p>
            </div>
          </div>
        ))}
        <button
          onClick={addSlide}
          className="flex items-center justify-center gap-1 rounded-lg border border-dashed border-border py-2 font-heading text-[0.68rem] font-bold text-muted-foreground/40 transition-all hover:border-hatch-orange hover:bg-orange-50 hover:text-hatch-orange"
        >
          <Plus className="size-3" /> Add slide
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 items-center justify-center overflow-auto bg-[#E5E7EB] p-6">
          <div className="flex aspect-[16/10] w-full max-w-[820px] flex-col overflow-hidden rounded-[16px] shadow-[0_8px_40px_rgba(0,0,0,0.12)]">
            <div
              className="relative flex flex-1 flex-col"
              style={{ background: active.gradient, color: active.textColor }}
            >
              <div className="relative z-[1] flex flex-1 flex-col justify-center px-14 py-12">
                <input
                  className="mb-2 bg-transparent font-heading text-[0.7rem] font-extrabold tracking-[0.06em] uppercase opacity-60 outline-none"
                  value={active.tag}
                  onChange={(e) => updateSlide({ tag: e.target.value })}
                />
                <textarea
                  className="resize-none bg-transparent font-heading text-[2rem] leading-[1.2] font-black outline-none"
                  value={active.title}
                  onChange={(e) => updateSlide({ title: e.target.value })}
                  rows={2}
                />
                <textarea
                  className="mt-2 resize-none bg-transparent font-heading text-[1rem] leading-[1.4] font-bold outline-none"
                  value={active.subtitle}
                  onChange={(e) => updateSlide({ subtitle: e.target.value })}
                  rows={active.subtitle ? 2 : 1}
                  placeholder="Optional subtitle"
                />
                <textarea
                  className="mt-4 min-h-37.5 resize-none bg-transparent text-[0.92rem] leading-[1.7] outline-none"
                  value={active.bullets.join("\n")}
                  onChange={(e) =>
                    updateSlide({
                      bullets: e.target.value
                        .split("\n")
                        .map((line) => line.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="One bullet per line"
                />
              </div>
              <div className="absolute right-5 bottom-3 text-[0.65rem] font-bold opacity-40">
                {slides.findIndex((slide) => slide.id === activeId) + 1} /{" "}
                {slides.length}
              </div>
              <div className="absolute bottom-3 left-5 font-heading text-[0.7rem] font-black opacity-30">
                {active.footer}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border bg-card px-6 py-3">
          <span className="font-heading text-[0.72rem] font-bold text-muted-foreground">
            Slide {slides.findIndex((slide) => slide.id === activeId) + 1} of{" "}
            {slides.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const currentIndex = slides.findIndex(
                  (slide) => slide.id === activeId
                )
                if (currentIndex > 0) setActiveId(slides[currentIndex - 1].id)
              }}
              className="rounded-lg border border-border bg-card px-4 py-[0.45rem] font-heading text-[0.78rem] font-bold text-foreground transition-all hover:bg-hatch-bg"
            >
              ← Prev
            </button>
            <button
              onClick={() => {
                const currentIndex = slides.findIndex(
                  (slide) => slide.id === activeId
                )
                if (currentIndex < slides.length - 1)
                  setActiveId(slides[currentIndex + 1].id)
              }}
              className="rounded-lg border border-border bg-card px-4 py-[0.45rem] font-heading text-[0.78rem] font-bold text-foreground transition-all hover:bg-hatch-bg"
            >
              Next →
            </button>
            <button className="rounded-lg bg-hatch-charcoal px-4 py-[0.45rem] font-heading text-[0.78rem] font-bold text-white transition-all hover:bg-black">
              ▶ Present
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
