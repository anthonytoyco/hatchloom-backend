import type { TeamMember } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Plus, Trash2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"

function formatDate(isoStr: string): string {
  const date = new Date(isoStr)
  if (isNaN(date.getTime())) return "unknown"
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatUpdated(isoStr: string): string {
  const date = new Date(isoStr)
  if (isNaN(date.getTime())) return "unknown"
  const diffH = Math.floor((Date.now() - date.getTime()) / 3_600_000)
  if (diffH < 1) return "just now"
  if (diffH < 24) return `${diffH}h ago`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 7) return `${diffD}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function HeroCard({
  title,
  description,
  status,
  gradient,
  emoji,
  createdAt,
  updatedAt,
  team,
  fallbackTeam,
  onEdit,
  onDelete,
  onAddMember,
  onRemoveMember,
}: {
  title: string
  description: string | null
  status: string
  gradient: string
  emoji: string
  createdAt: string
  updatedAt: string
  team: TeamMember[]
  fallbackTeam: Array<{
    id: string
    emoji: string
    grad: string
    name: string
    role: string
  }>
  onEdit: () => void
  onDelete: () => void
  onAddMember: () => void
  onRemoveMember: (userId: string) => void
}) {
  const [teamOpen, setTeamOpen] = useState(false)
  const teamRef = useRef<HTMLDivElement>(null)
  const isLive = status === "LIVE_VENTURE"
  const displayMembers = team.length > 0 ? team : fallbackTeam

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
    <div
      className={cn(
        "relative mb-4 animate-[fadeUp_0.35s_ease_both] overflow-visible rounded-2xl border border-border bg-card shadow-[0_2px_10px_rgba(0,0,0,0.04)]",
        teamOpen ? "z-40" : "z-0"
      )}
    >
      <div
        className={cn(
          "relative flex h-[60px] items-center rounded-t-2xl bg-gradient-to-r px-5",
          gradient
        )}
      >
        <div className="flex size-[42px] shrink-0 items-center justify-center rounded-[10px] bg-white/90 text-[1.3rem] shadow-[0_2px_8px_rgba(0,0,0,0.1)] backdrop-blur-sm">
          {emoji}
        </div>
        <div className="ml-3 flex flex-col gap-0.5">
          <span className="w-fit rounded-full bg-white/25 px-1.5 py-px font-heading text-[0.55rem] font-extrabold tracking-[0.06em] text-white uppercase">
            💼 SideHustle
          </span>
          <div className="flex items-center gap-1">
            <span
              className={cn(
                "size-[5px] rounded-full",
                isLive ? "bg-emerald-600" : "bg-amber-700"
              )}
            />
            <span className="font-heading text-[0.55rem] font-extrabold text-amber-900">
              {isLive ? "Live" : "In The Lab"}
            </span>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="text-right font-heading text-[0.55rem] leading-relaxed font-semibold text-white/70">
            Launched {formatDate(createdAt)}
            <br />
            Updated {formatUpdated(updatedAt)}
          </div>

          <div className="relative z-10" ref={teamRef}>
            <button
              onClick={() => setTeamOpen((v) => !v)}
              className="flex items-center transition-opacity hover:opacity-85"
            >
              {displayMembers.slice(0, 5).map((m, i) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex size-[22px] items-center justify-center rounded-full border-2 border-white/80 bg-gradient-to-br text-[0.6rem] shadow-sm",
                    "grad" in m ? m.grad : "from-[#1E1E2E] to-[#3D3060]",
                    i > 0 && "-ml-1"
                  )}
                >
                  {"emoji" in m ? m.emoji : "👤"}
                </div>
              ))}
              <span className="ml-1 font-heading text-[0.55rem] font-extrabold text-white/85">
                {displayMembers.length}
              </span>
            </button>

            {teamOpen && (
              <div className="absolute top-full right-0 z-50 mt-2 w-[240px] rounded-[9px] border border-border bg-white p-1.5 shadow-[0_10px_28px_rgba(0,0,0,0.2)]">
                {team.length > 0
                  ? team.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-1.5 rounded px-1 py-1 hover:bg-muted/60"
                      >
                        <div className="flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-white bg-gradient-to-br from-[#1E1E2E] to-[#3D3060] text-[0.6rem] shadow-sm">
                          👤
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-heading text-[0.68rem] font-bold text-hatch-charcoal">
                            {m.displayName ?? m.studentId.slice(0, 8)}
                          </span>
                          {m.role && (
                            <span className="ml-1 text-[0.6rem] text-muted-foreground">
                              {m.role}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => onRemoveMember(m.studentId)}
                          className="flex size-5 shrink-0 items-center justify-center rounded border border-transparent text-[0.55rem] text-muted-foreground transition-all hover:border-hatch-pink/40 hover:bg-rose-50 hover:text-hatch-pink"
                        >
                          <Trash2 className="size-2.5" />
                        </button>
                      </div>
                    ))
                  : fallbackTeam.map((m, i) => (
                      <div key={m.id}>
                        {i === 2 && <div className="my-1 h-px bg-border" />}
                        <div className="flex items-center gap-1.5 rounded px-1 py-1 hover:bg-muted/60">
                          <div
                            className={cn(
                              "flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-white bg-gradient-to-br text-[0.6rem] shadow-sm",
                              m.grad
                            )}
                          >
                            {m.emoji}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-heading text-[0.68rem] font-bold text-hatch-charcoal">
                              {m.name}
                            </span>
                            <span className="ml-1 text-[0.6rem] text-muted-foreground">
                              {m.role}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                <button
                  onClick={() => {
                    setTeamOpen(false)
                    onAddMember()
                  }}
                  className="mt-1 flex w-full items-center justify-center gap-1 rounded border border-dashed border-border py-1 font-heading text-[0.6rem] font-bold text-muted-foreground/50 transition-all hover:border-amber-400 hover:bg-amber-50 hover:text-amber-600"
                >
                  <Plus className="size-3" /> Add member
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-start justify-between gap-3 px-5 py-2.5">
        <div>
          <h1 className="shrink-0 font-heading text-[1.15rem] font-black tracking-tight text-hatch-charcoal">
            {title}
          </h1>
          <p className="text-[0.78rem] leading-snug text-muted-foreground">
            {description ?? "No description yet."}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
          <button
            onClick={onEdit}
            className="rounded-lg border border-border bg-hatch-bg px-2.5 py-1 font-heading text-[0.72rem] font-bold text-muted-foreground transition-all hover:border-amber-400 hover:bg-amber-50 hover:text-amber-600"
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
    </div>
  )
}
