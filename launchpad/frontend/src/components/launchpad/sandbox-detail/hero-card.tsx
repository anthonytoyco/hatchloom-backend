import {
  GATES,
  PHASES,
  TEAM_MEMBERS,
} from "@/components/launchpad/sandbox-detail/demo-data"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Check, Trash2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

function PhaseTracker() {
  const [openGate, setOpenGate] = useState<string | null>(null)
  const [gateAnswers, setGateAnswers] = useState<Record<string, string>>({})
  const trackerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!openGate) return
    function handleOutside(e: MouseEvent) {
      if (
        trackerRef.current &&
        !trackerRef.current.contains(e.target as Node)
      ) {
        setOpenGate(null)
      }
    }
    document.addEventListener("mousedown", handleOutside)
    return () => document.removeEventListener("mousedown", handleOutside)
  }, [openGate])

  const doneCount = PHASES.filter((p) => p.status === "done").length
  const progressPct = Math.round((doneCount / (PHASES.length - 1)) * 100)

  return (
    <div className="border-t border-border px-6 pt-3.5 pb-4" ref={trackerRef}>
      <div className="mb-2.5 flex items-center justify-between">
        <span className="font-heading text-[0.78rem] font-extrabold text-hatch-charcoal">
          📍 Project Phase
        </span>
        <button
          onClick={() =>
            toast.info(
              "Placeholder: phase editing is not wired yet. This will open phase configuration."
            )
          }
          className="font-heading text-[0.65rem] font-bold text-muted-foreground transition-colors hover:text-sandbox-green"
        >
          ✏️ Edit phases
        </button>
      </div>

      <div className="relative mb-2 flex items-start">
        <div className="absolute top-[14px] right-10 left-10 z-[1] h-[3px] rounded-full bg-border">
          <div
            className="h-full rounded-full bg-sandbox-green transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {PHASES.map((phase, i) => (
          <div key={phase.id} className="flex items-start">
            <div className="relative z-[2] flex flex-col items-center">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <div
                      className={cn(
                        "flex size-7 cursor-pointer items-center justify-center rounded-full border-[3px] text-[0.7rem] font-extrabold text-white transition-all",
                        phase.isLaunch && "size-8 text-[0.85rem]",
                        phase.status === "done" &&
                          "border-sandbox-green bg-sandbox-green",
                        phase.status === "current" &&
                          "animate-[phasePulse_2s_ease_infinite] border-hatch-orange bg-hatch-orange shadow-[0_0_0_4px_rgba(255,140,0,0.2)]",
                        phase.status === "future" &&
                          !phase.isLaunch &&
                          "border-border bg-white text-border",
                        phase.isLaunch &&
                          phase.status === "future" &&
                          "border-border bg-white text-border",
                        phase.isLaunch &&
                          phase.status !== "future" &&
                          "border-hatch-pink bg-gradient-to-br from-hatch-pink to-[#E6004E]"
                      )}
                    />
                  }
                >
                  {phase.status === "done" ? (
                    <Check className="size-3.5" />
                  ) : (
                    phase.step
                  )}
                </TooltipTrigger>
                <TooltipContent className="max-w-[160px] text-center text-[0.65rem]">
                  {phase.tooltip}
                </TooltipContent>
              </Tooltip>
              <span
                className={cn(
                  "mt-1 max-w-[76px] text-center font-heading text-[0.6rem] leading-tight font-bold text-muted-foreground",
                  phase.status === "done" && "text-sandbox-green",
                  phase.status === "current" &&
                    "font-extrabold text-hatch-orange",
                  phase.isLaunch && "font-extrabold text-hatch-pink"
                )}
              >
                {phase.label}
              </span>
            </div>

            {i < GATES.length && (
              <div className="relative z-[3] flex shrink-0 flex-col items-center px-1 pt-0.5">
                <div
                  className={cn(
                    "size-[18px] rotate-45 cursor-pointer border-2 bg-white transition-all hover:border-hatch-orange hover:bg-orange-50",
                    GATES[i].answered
                      ? "border-sandbox-green bg-green-50"
                      : "border-border",
                    openGate === GATES[i].id &&
                      "border-hatch-orange bg-orange-50"
                  )}
                  onClick={() =>
                    setOpenGate(openGate === GATES[i].id ? null : GATES[i].id)
                  }
                >
                  <span
                    className={cn(
                      "flex size-full -rotate-45 items-center justify-center text-[0.5rem] font-black",
                      GATES[i].answered
                        ? "text-sandbox-green"
                        : "text-muted-foreground"
                    )}
                  >
                    {GATES[i].answered ? "✓" : "?"}
                  </span>
                </div>
                <span
                  className={cn(
                    "mt-0.5 font-heading text-[0.5rem] font-bold whitespace-nowrap text-muted-foreground/60",
                    GATES[i].answered && "text-sandbox-green"
                  )}
                >
                  {GATES[i].dueDate}
                </span>

                {openGate === GATES[i].id && (
                  <div className="absolute top-[26px] left-1/2 z-50 w-[220px] -translate-x-1/2 rounded-[10px] border border-border bg-card p-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                    <div className="absolute -top-[5px] left-1/2 size-[10px] -translate-x-1/2 rotate-45 border-t border-l border-border bg-card" />
                    <p className="mb-2 font-heading text-[0.72rem] leading-snug font-bold text-hatch-charcoal">
                      {GATES[i].question}
                    </p>
                    {GATES[i].answered ? (
                      <p className="text-[0.65rem] leading-snug text-muted-foreground italic">
                        "{GATES[i].answer}"
                      </p>
                    ) : (
                      <>
                        <textarea
                          className="min-h-[48px] w-full resize-none rounded-lg border border-border px-2.5 py-1.5 text-[0.72rem] text-foreground transition-colors outline-none focus:border-sandbox-green"
                          placeholder="Write your answer here..."
                          value={gateAnswers[GATES[i].id] ?? ""}
                          onChange={(e) =>
                            setGateAnswers((prev) => ({
                              ...prev,
                              [GATES[i].id]: e.target.value,
                            }))
                          }
                        />
                        <div className="mt-1 flex justify-end">
                          <button
                            onClick={() =>
                              toast.info(
                                "Placeholder: gate answers are not persisted yet."
                              )
                            }
                            className="font-heading text-[0.65rem] font-bold text-sandbox-green hover:opacity-80"
                          >
                            Save →
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-1 flex items-center justify-end gap-3">
        <span className="font-heading text-[0.65rem] font-semibold text-muted-foreground">
          Skip ahead anytime
        </span>
        <button
          onClick={() =>
            toast.info(
              "Placeholder: promote Sandbox to SideHustle flow is not wired yet."
            )
          }
          className="flex items-center gap-1.5 rounded-[10px] bg-gradient-to-r from-hatch-pink to-[#E6004E] px-4 py-[0.45rem] font-heading text-[0.75rem] font-extrabold text-white shadow-[0_2px_8px_rgba(255,31,90,0.2)] transition-opacity hover:opacity-90"
        >
          🚀 Ready to Launch as SideHustle?
        </button>
      </div>
    </div>
  )
}

export function HeroCard({
  title,
  description,
  onEdit,
  onDelete,
}: {
  title: string
  description: string | null
  onEdit: () => void
  onDelete: () => void
}) {
  const [teamOpen, setTeamOpen] = useState(false)
  const teamRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!teamOpen) return
    function handleOutside(e: MouseEvent) {
      if (teamRef.current && !teamRef.current.contains(e.target as Node)) {
        setTeamOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOutside)
    return () => document.removeEventListener("mousedown", handleOutside)
  }, [teamOpen])

  return (
    <div className="mb-4 animate-[fadeUp_0.4s_ease_both] overflow-visible rounded-[18px] border border-border bg-card shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className="relative flex h-[72px] items-center rounded-t-[18px] bg-gradient-to-r from-emerald-400 to-emerald-600 px-6">
        <div className="flex size-[52px] shrink-0 items-center justify-center rounded-[14px] bg-white/90 text-[1.6rem] shadow-[0_2px_12px_rgba(0,0,0,0.1)] backdrop-blur-sm">
          ♻️
        </div>
        <div className="ml-4 flex flex-col gap-0.5">
          <span className="w-fit rounded-full bg-white/25 px-2 py-0.5 font-heading text-[0.6rem] font-extrabold tracking-[0.06em] text-white uppercase">
            🧪 Sandbox · Idea Lab
          </span>
          <div className="flex items-center gap-1.5">
            <span className="size-[6px] rounded-full bg-emerald-600" />
            <span className="font-heading text-[0.6rem] font-extrabold text-emerald-700">
              In Lab
            </span>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="text-right font-heading text-[0.6rem] leading-relaxed font-semibold text-white/70">
            Created Jan 28, 2026
            <br />
            Updated 2 hours ago
          </div>

          <div className="relative" ref={teamRef}>
            <button
              onClick={() => setTeamOpen((v) => !v)}
              className="flex items-center transition-opacity hover:opacity-85"
            >
              {TEAM_MEMBERS.slice(0, 5).map((m, i) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex size-[26px] items-center justify-center rounded-full border-2 border-white/80 bg-gradient-to-br text-[0.7rem] shadow-sm",
                    m.grad,
                    i > 0 && "-ml-1.5"
                  )}
                >
                  {m.emoji}
                </div>
              ))}
              <span className="ml-1.5 font-heading text-[0.6rem] font-extrabold text-white/85">
                {TEAM_MEMBERS.length}
              </span>
            </button>

            {teamOpen && (
              <div className="absolute top-full right-0 z-50 mt-2 w-[240px] rounded-[10px] border border-border bg-white p-2 shadow-[0_12px_32px_rgba(0,0,0,0.22)]">
                {TEAM_MEMBERS.map((m, i) => (
                  <div key={m.id}>
                    {i === 2 && <Separator className="my-1" />}
                    <div className="flex items-center gap-2 rounded-md px-1 py-1.5 hover:bg-muted/60">
                      <div
                        className={cn(
                          "flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br text-[0.7rem] shadow-sm",
                          m.grad
                        )}
                      >
                        {m.emoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-heading text-[0.75rem] font-bold text-hatch-charcoal">
                          {m.name}
                        </span>{" "}
                        <span className="text-[0.68rem] text-muted-foreground">
                          {m.role}
                        </span>
                        {m.isAI && (
                          <span className="ml-1 rounded bg-violet-50 px-1 py-px font-heading text-[0.5rem] font-extrabold text-violet-600">
                            AI
                          </span>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        {m.isAI ? (
                          <button
                            onClick={() =>
                              toast.info(
                                "Placeholder: AI teammate chat handoff is not wired yet."
                              )
                            }
                            className="flex items-center gap-1 rounded-md border border-transparent px-2 py-1 font-heading text-[0.6rem] font-bold text-muted-foreground transition-all hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600"
                          >
                            💬 Ask
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() =>
                                toast.info(
                                  "Placeholder: direct message compose is not wired yet."
                                )
                              }
                              className="flex size-6 items-center justify-center rounded-md border border-transparent text-[0.65rem] text-muted-foreground transition-all hover:border-sandbox-green/30 hover:bg-green-50 hover:text-sandbox-green"
                            >
                              ✉️
                            </button>
                            <button
                              onClick={() =>
                                toast.info(
                                  "Placeholder: mention/invite flow is not wired yet."
                                )
                              }
                              className="flex size-6 items-center justify-center rounded-md border border-transparent text-[0.65rem] text-muted-foreground transition-all hover:border-sandbox-green/30 hover:bg-green-50 hover:text-sandbox-green"
                            >
                              @
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-start justify-between gap-3 px-6 pt-4 pb-3">
        <div>
          <h1 className="mb-1 font-heading text-[1.35rem] leading-tight font-black tracking-tight text-hatch-charcoal">
            {title}
          </h1>
          <p className="text-[0.85rem] leading-relaxed text-muted-foreground">
            {description ?? "No description yet."}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 pt-1">
          <button
            onClick={onEdit}
            className="rounded-lg border border-border bg-hatch-bg px-2.5 py-1 font-heading text-[0.72rem] font-bold text-muted-foreground transition-all hover:border-sandbox-green hover:bg-green-50 hover:text-sandbox-green"
          >
            ✏️ Edit
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg border border-border bg-hatch-bg px-2.5 py-1 font-heading text-[0.72rem] font-bold text-muted-foreground transition-all hover:border-hatch-pink/50 hover:bg-rose-50 hover:text-hatch-pink"
          >
            <Trash2 className="inline size-3" /> Delete
          </button>
        </div>
      </div>

      <PhaseTracker />
    </div>
  )
}
