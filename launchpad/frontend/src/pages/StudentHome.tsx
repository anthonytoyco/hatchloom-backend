import { AppLayout } from "@/components/layout/AppLayout"
import {
  BADGES,
  CONNECT_ITEMS,
  EXPLORE_ITEMS,
  INITIAL_BANNERS,
  ONLINE_PEERS,
  RANK_ORDER,
  SKILL_LEVELS,
  STUDENT_HOME_SIDEBAR_SECTIONS,
} from "@/components/student-home/constants"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useLaunchPadHome } from "@/hooks/use-launchpad-home"
import { useStudent } from "@/hooks/use-student"
import { RANK_META } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { ChevronRight, Handshake, Rocket, Telescope, X } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router"

// ── Sub-components ────────────────────────────────────────────────────────────

function SkillRadar() {
  return (
    <div className="flex items-center gap-3">
      {Object.entries(SKILL_LEVELS).map(([label, level]) => (
        <div key={label} className="flex items-center gap-1">
          <span className="font-heading text-[0.58rem] font-bold text-muted-foreground">
            {label}
          </span>
          {RANK_ORDER.map((rank, i) => (
            <span
              key={rank}
              className={cn(
                "inline-block size-2 rounded-full",
                i < level
                  ? RANK_META[rank].colorClass.replace("text-", "bg-")
                  : "bg-border"
              )}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function BadgeCoins() {
  return (
    <div className="flex items-center">
      {BADGES.map((b, i) => (
        <div
          key={b.label}
          title={b.label}
          className={cn(
            "relative flex size-7 cursor-default items-center justify-center rounded-full border-2 border-card text-sm shadow-sm",
            b.bg,
            i > 0 && "-ml-1.5"
          )}
        >
          {b.emoji}
        </div>
      ))}
    </div>
  )
}

function UrgentBanners() {
  const [banners, setBanners] = useState(INITIAL_BANNERS)
  if (banners.length === 0) return null
  return (
    <div className="mb-5 flex flex-col gap-2">
      {banners.map((b) => (
        <div
          key={b.id}
          className="flex animate-[fadeUp_0.4s_ease_both] items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm"
          style={{ borderLeft: "4px solid var(--hatch-pink)" }}
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-lg">
            {b.icon}
          </div>
          <p className="flex-1 text-[0.84rem] leading-snug font-semibold text-foreground">
            {b.text}
          </p>
          <Button
            size="sm"
            className="shrink-0 bg-hatch-pink text-white hover:bg-hatch-pink/90"
          >
            {b.cta}
          </Button>
          <button
            onClick={() =>
              setBanners((prev) => prev.filter((x) => x.id !== b.id))
            }
            className="flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}

const ACTIVITY_FEED = [
  {
    icon: "🏆",
    bg: "bg-pink-50",
    text: (
      <>
        You earned the <strong>Entrepreneur's Choice</strong> badge in Design
        Thinking 101
      </>
    ),
    time: "Today, 9:14 AM",
  },
  {
    icon: "💡",
    bg: "bg-sky-50",
    text: (
      <>
        You completed <strong>Idea Validation</strong> - 3 tools used
      </>
    ),
    time: "Yesterday, 4:02 PM",
  },
  {
    icon: "🚀",
    bg: "bg-orange-50",
    text: (
      <>
        <strong>Flavour Butter Co.</strong> promoted to Live Venture
      </>
    ),
    time: "Mar 20, 11:30 AM",
  },
  {
    icon: "🤝",
    bg: "bg-green-50",
    text: (
      <>
        Sam Okafor joined your team on <strong>Flavour Butter Co.</strong>
      </>
    ),
    time: "Mar 18, 3:15 PM",
  },
  {
    icon: "⚡",
    bg: "bg-amber-50",
    text: (
      <>
        Reached <strong>Challenger</strong> rank - 2,500 XP milestone!
      </>
    ),
    time: "Mar 15, 7:00 AM",
  },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export function StudentHome() {
  const { data: student } = useStudent()
  const { data: launchpad } = useLaunchPadHome(student?.id ?? "")

  const today = new Date().toLocaleDateString("en-CA", {
    weekday: "long",
    month: "short",
    day: "numeric",
  })

  const rank = student ? RANK_META[student.rank] : null
  const xpPercent = student
    ? Math.round((student.xp / student.xpToNextRank) * 100)
    : 0

  return (
    <AppLayout
      sidebarSections={STUDENT_HOME_SIDEBAR_SECTIONS}
      sidebarCta={{ label: "Upgrade to Pro", href: "/upgrade" }}
    >
      {/* Sidebar profile block - injected via a portal-like approach using CSS order */}
      <div className="px-7 py-7">
        {/* ── Greeting ── */}
        <div className="mb-6">
          <h1 className="mb-2 font-heading text-[1.6rem] font-black tracking-tight text-hatch-charcoal">
            Hey, <span className="text-hatch-pink">{student?.name ?? "…"}</span>{" "}
            {student?.emoji}
          </h1>

          <div className="mb-1.5 flex items-center gap-5">
            <SkillRadar />
            <BadgeCoins />
          </div>

          {rank && student && (
            <div className="mb-1 flex items-center gap-3">
              <span
                className={cn(
                  "font-heading text-xs font-bold",
                  rank.colorClass
                )}
              >
                {rank.label}
              </span>
              <div className="w-32">
                <Progress value={xpPercent} className="h-1.5" />
              </div>
              <span className="text-xs text-muted-foreground">
                {(student.xpToNextRank - student.xp).toLocaleString()} XP to
                next rank
              </span>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            {today} · 2 deadlines this week
          </p>
        </div>

        {/* ── Urgent banners ── */}
        <UrgentBanners />

        {/* ── Three pillar cards ── */}
        <div className="mb-7 grid grid-cols-3 gap-4">
          {/* Explore */}
          <Card className="overflow-hidden rounded-[18px] border-border p-0 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-pink-50">
                  <Telescope className="size-3.5 text-hatch-pink" />
                </div>
                <span className="font-heading text-[0.88rem] font-extrabold text-hatch-pink">
                  Continue Exploring
                </span>
              </div>
              <Link
                to="/explore"
                className="font-heading text-[0.68rem] font-bold text-muted-foreground transition-colors hover:text-foreground"
              >
                Explore <ChevronRight className="inline size-3" />
              </Link>
            </div>
            <div className="px-4 py-3">
              {EXPLORE_ITEMS.map((item) => (
                <div
                  key={item.name}
                  className="flex cursor-pointer items-center gap-2 border-b border-border py-1.5 last:border-0 hover:opacity-80"
                >
                  <span className="w-5 text-center text-sm">{item.icon}</span>
                  <span className="flex-1 truncate font-heading text-[0.78rem] font-bold text-hatch-charcoal">
                    {item.name}
                  </span>
                  <span className="shrink-0 text-[0.65rem] font-semibold text-muted-foreground">
                    {item.next}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Connect */}
          <Card className="overflow-hidden rounded-[18px] border-border p-0 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-sky-50">
                  <Handshake className="size-3.5 text-sky-600" />
                </div>
                <span className="font-heading text-[0.88rem] font-extrabold text-sky-600">
                  Connecting Now
                </span>
              </div>
              <Link
                to="/connecthub"
                className="font-heading text-[0.68rem] font-bold text-muted-foreground transition-colors hover:text-foreground"
              >
                Connect <ChevronRight className="inline size-3" />
              </Link>
            </div>
            <div className="px-4 py-3">
              <div className="mb-2 flex items-center gap-2 rounded-lg bg-sky-50 px-2.5 py-1.5">
                <span className="flex size-6 items-center justify-center rounded-full bg-sky-600 font-heading text-[0.7rem] font-black text-white">
                  16
                </span>
                <span className="text-[0.75rem] font-semibold text-sky-600">
                  unread messages
                </span>
              </div>
              {CONNECT_ITEMS.map((item) => (
                <div
                  key={item.name}
                  className="flex cursor-pointer items-start gap-2 border-b border-border py-1.5 last:border-0 hover:opacity-80"
                >
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full text-xs",
                      item.bg
                    )}
                  >
                    {item.emoji}
                  </span>
                  <p className="text-[0.75rem] leading-snug text-foreground">
                    <strong className="font-heading font-black text-hatch-charcoal">
                      {item.name}
                    </strong>{" "}
                    {item.text}
                  </p>
                </div>
              ))}
              <div className="mt-1.5 flex items-center gap-2 border-t border-border pt-2">
                <span className="font-heading text-[0.65rem] font-bold whitespace-nowrap text-muted-foreground">
                  Online:
                </span>
                <div className="flex items-center">
                  {ONLINE_PEERS.map((p, i) => (
                    <span
                      key={i}
                      className={cn(
                        "flex size-5 items-center justify-center rounded-full border-[1.5px] border-card text-[0.6rem]",
                        p.bg,
                        i > 0 && "-ml-1"
                      )}
                    >
                      {p.emoji}
                    </span>
                  ))}
                </div>
                <span className="text-[0.65rem] font-bold text-muted-foreground">
                  +8 more
                </span>
              </div>
            </div>
          </Card>

          {/* LaunchPad */}
          <Card className="overflow-hidden rounded-[18px] border-border p-0 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-orange-50">
                  <Rocket className="size-3.5 text-hatch-orange" />
                </div>
                <span className="font-heading text-[0.88rem] font-extrabold text-hatch-orange">
                  Go for Launch
                </span>
              </div>
              <Link
                to="/launchpad"
                className="font-heading text-[0.68rem] font-bold text-muted-foreground transition-colors hover:text-foreground"
              >
                Launch <ChevronRight className="inline size-3" />
              </Link>
            </div>
            <div className="px-4 py-3">
              {launchpad && (
                <>
                  <p className="mb-1 font-heading text-[0.62rem] font-black tracking-wider text-muted-foreground/60 uppercase">
                    Sandboxes
                  </p>
                  {launchpad.sandboxes.map((s) => (
                    <Link
                      key={s.id}
                      to={`/launchpad/sandboxes/${s.id}`}
                      className="flex cursor-pointer items-center gap-2 border-b border-border py-1.5 last:border-0 hover:opacity-80"
                    >
                      <span className="w-5 text-center text-sm">🌿</span>
                      <span className="flex-1 font-heading text-[0.78rem] font-bold text-hatch-charcoal">
                        {s.title}
                      </span>
                      <span className="size-2 rounded-full bg-rank-rookie" />
                    </Link>
                  ))}
                  <p className="mt-2 mb-1 font-heading text-[0.62rem] font-black tracking-wider text-muted-foreground/60 uppercase">
                    SideHustles
                  </p>
                  {launchpad.sideHustles.map((sh) => (
                    <Link
                      key={sh.id}
                      to={`/launchpad/sidehustles/${sh.id}`}
                      className="flex cursor-pointer items-center gap-2 border-b border-border py-1.5 last:border-0 hover:opacity-80"
                    >
                      <span className="w-5 text-center text-sm">🧈</span>
                      <span className="flex-1 font-heading text-[0.78rem] font-bold text-hatch-charcoal">
                        {sh.title}
                      </span>
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          sh.status === "LIVE_VENTURE"
                            ? "bg-rank-rookie"
                            : "bg-border"
                        )}
                      />
                    </Link>
                  ))}
                </>
              )}
              {!launchpad && (
                <div className="space-y-1.5 py-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-7 animate-pulse rounded-md bg-muted"
                    />
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* ── Recent Activity ── */}
        <div>
          <p className="mb-3 font-heading text-[0.95rem] font-extrabold text-hatch-charcoal">
            Recent Activity
          </p>
          <ScrollArea className="rounded-xl border border-border bg-card shadow-sm">
            <div className="px-4">
              {ACTIVITY_FEED.map((item, i) => (
                <div key={i}>
                  <div className="flex items-start gap-3 py-3">
                    <div
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-[10px] text-[0.95rem]",
                        item.bg
                      )}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-[0.8rem] leading-snug text-foreground [&_strong]:font-heading [&_strong]:font-bold">
                        {item.text}
                      </p>
                      <p className="mt-0.5 text-[0.68rem] font-medium text-muted-foreground/60">
                        {item.time}
                      </p>
                    </div>
                  </div>
                  {i < ACTIVITY_FEED.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* ── Sidebar profile block (visual only, sits outside layout) ── */}
        {student && (
          <div className="fixed top-[58px] left-0 z-40 w-[215px]">
            {/* This is rendered below the sidebar Home item, using absolute positioning within the sidebar column */}
            {/* The actual sidebar profile block is part of the sidebar in the full design; */}
            {/* For now it's shown in the main area as a "profile card" at the bottom of the sidebar */}
          </div>
        )}
      </div>
    </AppLayout>
  )
}

// Sidebar profile card - rendered inside the sidebar via AppLayout's sidebarSections
// The avatar + name block is a design-only element on this page; the generic Sidebar
// handles navigation. The full profile block will be a future enhancement.

function _SidebarProfileBlock({
  student,
}: {
  student: ReturnType<typeof useStudent>["data"]
}) {
  if (!student) return null
  const rank = RANK_META[student.rank]
  return (
    <div className="flex flex-col items-center px-3.5 pt-4 pb-3 text-center">
      <Avatar className="mb-2 size-14 border-[3px] border-card bg-gradient-to-br from-hatch-charcoal to-[#3D3060] shadow-[0_3px_12px_rgba(255,31,90,0.15)]">
        <AvatarFallback className="bg-transparent text-3xl">
          {student.emoji}
        </AvatarFallback>
      </Avatar>
      <p className="font-heading text-[0.9rem] font-extrabold text-hatch-charcoal">
        {student.name}
      </p>
      <p
        className={cn(
          "mb-2 font-heading text-[0.68rem] font-bold",
          rank.colorClass
        )}
      >
        {rank.label}
      </p>
      <button className="rounded-md border border-border bg-card px-2.5 py-1 font-heading text-[0.68rem] font-bold text-hatch-pink transition-colors hover:border-hatch-pink hover:bg-pink-50">
        ✏️ Edit Profile
      </button>
    </div>
  )
}

// Suppress unused warning - will be wired into a custom sidebar variant later
void _SidebarProfileBlock
