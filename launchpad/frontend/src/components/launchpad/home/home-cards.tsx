import { Badge } from "@/components/ui/badge"
import type { SandboxSummary, SideHustleSummary } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Link } from "react-router"

const SANDBOX_GRADIENTS = [
  "from-emerald-400 to-emerald-600",
  "from-pink-400 to-pink-600",
  "from-orange-300 to-orange-500",
  "from-violet-400 to-violet-600",
  "from-sky-400 to-sky-600",
]
const SANDBOX_EMOJIS = ["♻️", "🎨", "🐕", "💡", "🌿"]
const SIDEHUSTLE_GRADIENTS = [
  "from-amber-300 to-amber-600",
  "from-green-400 to-green-600",
]
const SIDEHUSTLE_EMOJIS = ["🧈", "🚗"]

function formatShortDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "unknown"
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return "unknown"
  return d.toLocaleDateString("en-CA", { month: "short", day: "numeric" })
}

const STATUS_MESSAGES = [
  {
    text: "ms.rivera@school.ca · Feedback on packaging mockup",
    project: "♻️",
    projectName: "EcoSnack",
  },
  {
    text: "jordan_hl · Supplier quote for shea butter",
    project: "🧈",
    projectName: "Flavour Butter",
  },
  {
    text: "mr.hoffman_hl · Great work on your pitch draft",
    project: "♻️",
    projectName: "EcoSnack",
  },
]

const STATUS_TASKS = [
  {
    text: "Define target customer",
    project: "🧈",
    due: "Today",
    urgent: true,
  },
  { text: "Update pricing model", project: "🧈", due: "Thu", urgent: false },
]

const STATUS_MILESTONES = [
  { text: "First sale", project: "🧈", due: "Feb 22", urgent: true },
  { text: "MVP sketch", project: "♻️", due: "Mar 1", urgent: false },
]

export function StatusBar() {
  return (
    <div className="mx-8 mb-7 grid grid-cols-[1fr_1px_1fr_1px_1fr] items-center gap-0 rounded-2xl border border-border bg-card px-5 py-4 shadow-sm">
      <div className="pr-5">
        <p className="mb-2 flex items-center gap-1.5 font-heading text-[0.62rem] font-black tracking-[0.08em] text-muted-foreground/50 uppercase">
          ✉️ New
        </p>
        <div className="space-y-1.5">
          {STATUS_MESSAGES.map((message, i) => (
            <div
              key={i}
              className="flex cursor-pointer items-center gap-2 text-[0.78rem] font-semibold text-foreground transition-colors hover:text-hatch-pink"
            >
              <span className="flex-1 truncate">{message.text}</span>
              <span
                title={message.projectName}
                className="flex size-[22px] shrink-0 items-center justify-center rounded-md border border-black/5 bg-emerald-100 text-xs"
              >
                {message.project}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-10 w-px bg-border" />

      <div className="px-5">
        <p className="mb-2 flex items-center gap-1.5 font-heading text-[0.62rem] font-black tracking-[0.08em] text-muted-foreground/50 uppercase">
          ✅ Tasks Due
        </p>
        <div className="space-y-1.5">
          {STATUS_TASKS.map((task, i) => (
            <div
              key={i}
              className="flex cursor-pointer items-center gap-2 text-[0.78rem] font-semibold text-foreground transition-colors hover:text-hatch-pink"
            >
              <span className="flex size-[22px] shrink-0 items-center justify-center rounded-md border border-black/5 bg-amber-100 text-xs">
                {task.project}
              </span>
              <span className="flex-1">{task.text}</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 font-heading text-[0.65rem] font-black",
                  task.urgent
                    ? "bg-pink-50 text-hatch-pink"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {task.due}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-10 w-px bg-border" />

      <div className="pl-5">
        <p className="mb-2 flex items-center gap-1.5 font-heading text-[0.62rem] font-black tracking-[0.08em] text-muted-foreground/50 uppercase">
          🏁 Upcoming Milestones
        </p>
        <div className="space-y-1.5">
          {STATUS_MILESTONES.map((milestone, i) => (
            <div
              key={i}
              className="flex cursor-pointer items-center gap-2 text-[0.78rem] font-semibold text-foreground transition-colors hover:text-hatch-pink"
            >
              <span className="flex size-[22px] shrink-0 items-center justify-center rounded-md border border-black/5 bg-amber-50 text-xs">
                {milestone.project}
              </span>
              <span className="flex-1">{milestone.text}</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 font-heading text-[0.65rem] font-black",
                  milestone.urgent
                    ? "bg-pink-50 text-hatch-pink"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {milestone.due}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SandboxTile({
  sandbox,
  index,
}: {
  sandbox: SandboxSummary
  index: number
}) {
  const gradient = SANDBOX_GRADIENTS[index % SANDBOX_GRADIENTS.length]
  const emoji = SANDBOX_EMOJIS[index % SANDBOX_EMOJIS.length]
  const date = formatShortDate(sandbox.createdAt)

  return (
    <Link
      to={`/launchpad/sandboxes/${sandbox.id}`}
      className="group scroll-snap-align-start flex w-[240px] shrink-0 flex-col overflow-hidden rounded-[18px] border border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:border-gray-300 hover:shadow-xl"
    >
      <div
        className={cn(
          "relative flex h-[90px] items-center justify-center bg-gradient-to-br",
          gradient
        )}
      >
        <span className="text-[2rem] drop-shadow-md">{emoji}</span>
        <span className="absolute top-2 right-2 rounded-full bg-white/90 px-2 py-0.5 font-heading text-[0.6rem] font-black tracking-wide text-sky-600 uppercase">
          In Lab
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <p className="font-heading text-[0.9rem] leading-tight font-black tracking-tight text-hatch-charcoal">
          {sandbox.title}
        </p>
        <p className="line-clamp-2 text-[0.74rem] leading-snug text-muted-foreground">
          {sandbox.description ?? "No description yet."}
        </p>
        <div className="flex items-center gap-1.5 rounded-md bg-hatch-bg px-2 py-1 text-[0.7rem] font-semibold text-muted-foreground">
          <span className="size-1.5 rounded-full bg-hatch-orange" />
          {sandbox.toolCount} tool{sandbox.toolCount !== 1 ? "s" : ""} added
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-border pt-2">
          <span className="text-[0.68rem] font-medium text-muted-foreground/60">
            Started {date}
          </span>
          <span className="flex items-center gap-0.5">
            <span className="flex size-5 items-center justify-center rounded-full border-[1.5px] border-card bg-gradient-to-br from-hatch-charcoal to-[#3D3060] text-[0.65rem]">
              🦊
            </span>
          </span>
        </div>
      </div>
    </Link>
  )
}

export function SideHustleTile({
  sh,
  index,
}: {
  sh: SideHustleSummary
  index: number
}) {
  const gradient = SIDEHUSTLE_GRADIENTS[index % SIDEHUSTLE_GRADIENTS.length]
  const emoji = SIDEHUSTLE_EMOJIS[index % SIDEHUSTLE_EMOJIS.length]
  const isLive = sh.status === "LIVE_VENTURE"
  const date = formatShortDate(sh.createdAt)

  return (
    <Link
      to={`/launchpad/sidehustles/${sh.id}`}
      className="group flex w-[240px] shrink-0 flex-col overflow-hidden rounded-[18px] border border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:border-gray-300 hover:shadow-xl"
    >
      <div
        className={cn(
          "relative flex h-[90px] items-center justify-center bg-gradient-to-br",
          gradient
        )}
      >
        <span className="text-[2rem] drop-shadow-md">{emoji}</span>
        <span
          className={cn(
            "absolute top-2 right-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 font-heading text-[0.6rem] font-black tracking-wide uppercase",
            isLive ? "text-green-700" : "text-sky-600"
          )}
        >
          {isLive && <span className="size-1.5 rounded-full bg-green-500" />}
          {isLive ? "Live" : "In Lab"}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <p className="font-heading text-[0.9rem] leading-tight font-black tracking-tight text-hatch-charcoal">
          {sh.title}
        </p>
        <p className="line-clamp-2 text-[0.74rem] leading-snug text-muted-foreground">
          {sh.description ?? "No description yet."}
        </p>
        {sh.hasOpenPositions && (
          <Badge
            variant="outline"
            className="w-fit border-pink-200 bg-pink-50 font-heading text-[0.6rem] font-black text-hatch-pink"
          >
            Hiring
          </Badge>
        )}
        <div className="mt-auto flex items-center justify-between border-t border-border pt-2">
          <span className="text-[0.68rem] font-medium text-muted-foreground/60">
            Launched {date}
          </span>
          {sh.teamSize != null && sh.teamSize > 0 && (
            <span className="font-heading text-[0.65rem] font-bold text-muted-foreground">
              {sh.teamSize} member{sh.teamSize !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export function NewTile({
  label,
  sub,
  icon,
  onClick,
}: {
  label: string
  sub: string
  icon: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="group flex min-h-[200px] w-[200px] shrink-0 flex-col items-center justify-center gap-2 rounded-[18px] border-2 border-dashed border-border p-6 text-center transition-all hover:border-hatch-orange hover:bg-orange-50"
    >
      <div className="flex size-10 items-center justify-center rounded-full bg-muted text-xl transition-colors group-hover:bg-orange-100">
        {icon}
      </div>
      <div>
        <p className="font-heading text-[0.8rem] font-bold text-muted-foreground transition-colors group-hover:text-hatch-orange">
          {label}
        </p>
        <p className="mt-0.5 text-[0.7rem] text-muted-foreground/60">{sub}</p>
      </div>
    </button>
  )
}

export function SkeletonTile() {
  return (
    <div className="h-[230px] w-[240px] shrink-0 animate-pulse rounded-[18px] bg-muted" />
  )
}
