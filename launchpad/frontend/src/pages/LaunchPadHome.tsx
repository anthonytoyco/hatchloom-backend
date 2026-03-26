import {
  CreateSandboxDialog,
  CreateSideHustleDialog,
} from "@/components/launchpad/home/create-dialogs"
import {
  NewTile,
  SandboxTile,
  SideHustleTile,
  SkeletonTile,
  StatusBar,
} from "@/components/launchpad/home/home-cards"
import { LAUNCHPAD_SIDEBAR_SECTIONS } from "@/components/launchpad/navigation"
import { AppLayout } from "@/components/layout/AppLayout"
import { Badge } from "@/components/ui/badge"
import { useLaunchPadHome } from "@/hooks/use-launchpad-home"
import { useStudent } from "@/hooks/use-student"
import { cn } from "@/lib/utils"
import {
  ArrowRight,
  Briefcase,
  ChevronRight,
  FlaskConical,
  X,
} from "lucide-react"
import { useState } from "react"
import { Link } from "react-router"
import { toast } from "sonner"

const FEATURED_TOOLS = [
  {
    icon: "📋",
    bg: "bg-pink-50",
    name: "Business Model Canvas",
    sub: "Map your whole business on one page",
  },
  {
    icon: "🧠",
    bg: "bg-sky-50",
    name: "Brainstorm Board",
    sub: "Dump ideas, find the best one",
  },
  {
    icon: "💰",
    bg: "bg-orange-50",
    name: "Simple Cash Flow",
    sub: "What comes in vs. what goes out",
  },
  {
    icon: "👤",
    bg: "bg-green-50",
    name: "Customer Profile",
    sub: "Who actually buys your thing?",
  },
]

export function LaunchPadHome() {
  const { data: student } = useStudent()
  const { data: launchpad, isLoading } = useLaunchPadHome(student?.id ?? "")

  const [showCreateSandbox, setShowCreateSandbox] = useState(false)
  const [showCreateSideHustle, setShowCreateSideHustle] = useState(false)
  const [gsDismissed, setGsDismissed] = useState(false)

  return (
    <AppLayout
      sidebarSections={LAUNCHPAD_SIDEBAR_SECTIONS}
      sidebarCta={{ label: "💬 Contact Hatchloom", href: "/contact" }}
    >
      <div className="py-7">
        <div className="mb-5 px-8">
          <nav className="mb-1.5 flex items-center gap-1.5 text-[0.72rem] font-semibold text-muted-foreground">
            <Link
              to="/"
              className="text-hatch-pink transition-opacity hover:opacity-70"
            >
              Student Home
            </Link>
            <span className="text-muted-foreground/40">›</span>
            <span>Launchpad</span>
          </nav>
          <h1 className="font-heading text-[1.6rem] font-black tracking-tight text-hatch-charcoal">
            My <span className="text-hatch-orange">Launchpad</span> 🚀
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Where ideas become real - nurture your Sandboxes, grow your
            SideHustles.
          </p>
        </div>

        <StatusBar />

        <div className="mb-8">
          <div className="mb-3.5 flex items-center justify-between px-8">
            <div className="flex items-center gap-2">
              <FlaskConical className="size-4 text-hatch-charcoal" />
              <span className="font-heading text-[1rem] font-extrabold text-hatch-charcoal">
                My Sandboxes
              </span>
              <Badge className="rounded-md bg-green-50 font-heading text-[0.7rem] font-bold text-green-700 hover:bg-green-50">
                Idea Lab
              </Badge>
              <span className="font-heading text-[0.72rem] font-semibold text-muted-foreground">
                {launchpad ? `${launchpad.sandboxes.length} projects` : "…"}
              </span>
            </div>
            <button
              onClick={() =>
                toast.info(
                  "My Sandboxes listing is not wired yet. Placeholder: this will open the full sandboxes index."
                )
              }
              className="font-heading text-[0.75rem] font-bold text-hatch-pink transition-opacity hover:opacity-70"
            >
              See all <ChevronRight className="inline size-3.5" />
            </button>
          </div>

          <div className="flex [scroll-snap-type:x_mandatory] gap-4 overflow-x-auto px-8 pt-1 pb-4 [scrollbar-width:thin]">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonTile key={i} />
                ))
              : launchpad?.sandboxes.map((sandbox, i) => (
                  <SandboxTile key={sandbox.id} sandbox={sandbox} index={i} />
                ))}
            <NewTile
              label="New Sandbox"
              sub="Got an idea? Start here."
              icon="💡"
              onClick={() => setShowCreateSandbox(true)}
            />
          </div>
        </div>

        <div className="mb-8">
          <div className="mb-3.5 flex items-center justify-between px-8">
            <div className="flex items-center gap-2">
              <Briefcase className="size-4 text-hatch-charcoal" />
              <span className="font-heading text-[1rem] font-extrabold text-hatch-charcoal">
                My SideHustles
              </span>
              <Badge className="rounded-md bg-orange-50 font-heading text-[0.7rem] font-bold text-hatch-orange hover:bg-orange-50">
                Real Ventures
              </Badge>
              <span className="font-heading text-[0.72rem] font-semibold text-muted-foreground">
                {launchpad ? `${launchpad.sideHustles.length} active` : "…"}
              </span>
            </div>
            <button
              onClick={() =>
                toast.info(
                  "My SideHustles listing is not wired yet. Placeholder: this will open the full side hustles index."
                )
              }
              className="font-heading text-[0.75rem] font-bold text-hatch-pink transition-opacity hover:opacity-70"
            >
              See all <ChevronRight className="inline size-3.5" />
            </button>
          </div>

          <div className="flex [scroll-snap-type:x_mandatory] gap-4 overflow-x-auto px-8 pt-1 pb-4 [scrollbar-width:thin]">
            {isLoading
              ? Array.from({ length: 2 }).map((_, i) => (
                  <SkeletonTile key={i} />
                ))
              : launchpad?.sideHustles.map((sideHustle, i) => (
                  <SideHustleTile
                    key={sideHustle.id}
                    sh={sideHustle}
                    index={i}
                  />
                ))}
            <NewTile
              label="New SideHustle"
              sub="Ready to make money?"
              icon="💼"
              onClick={() => setShowCreateSideHustle(true)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5 px-8 pb-8">
          <div>
            <p className="mb-3 flex items-center gap-1.5 font-heading text-[0.65rem] font-black tracking-[0.09em] text-muted-foreground/50 uppercase">
              ✦ Getting Started
            </p>
            {!gsDismissed ? (
              <div className="rounded-xl border border-amber-200/60 bg-gradient-to-br from-orange-50 to-amber-50 p-4">
                <p className="mb-1 font-heading text-[0.85rem] font-black text-hatch-charcoal">
                  What's the difference?
                </p>
                <p className="mb-3 text-[0.74rem] leading-snug text-muted-foreground">
                  Not sure where to start? Here's the quick version:
                </p>
                <div className="flex gap-2">
                  <div
                    className="flex flex-1 cursor-pointer items-start gap-2.5 rounded-[10px] border border-border bg-white p-2.5 transition-all hover:border-hatch-orange hover:shadow-sm"
                    onClick={() => setShowCreateSandbox(true)}
                  >
                    <span className="mt-0.5 text-lg">🧪</span>
                    <div>
                      <p className="font-heading text-[0.8rem] font-bold text-hatch-charcoal">
                        Sandbox
                      </p>
                      <p className="text-[0.7rem] leading-snug text-muted-foreground">
                        Got an idea but not sure yet? Explore it safely here.
                      </p>
                    </div>
                  </div>
                  <div
                    className="flex flex-1 cursor-pointer items-start gap-2.5 rounded-[10px] border border-border bg-white p-2.5 transition-all hover:border-hatch-orange hover:shadow-sm"
                    onClick={() => setShowCreateSideHustle(true)}
                  >
                    <span className="mt-0.5 text-lg">💼</span>
                    <div>
                      <p className="font-heading text-[0.8rem] font-bold text-hatch-charcoal">
                        SideHustle
                      </p>
                      <p className="text-[0.7rem] leading-snug text-muted-foreground">
                        Ready to actually sell something? This is your real
                        venture.
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setGsDismissed(true)}
                  className="mt-2.5 flex w-full items-center justify-end gap-1 text-[0.7rem] font-semibold text-muted-foreground transition-colors hover:text-hatch-pink"
                >
                  Got it, hide this <X className="size-3" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {[
                  {
                    label: "🧪 What's a Sandbox?",
                    onClick: () => setShowCreateSandbox(true),
                  },
                  {
                    label: "💼 What's a SideHustle?",
                    onClick: () => setShowCreateSideHustle(true),
                  },
                ].map((pill) => (
                  <button
                    key={pill.label}
                    onClick={pill.onClick}
                    className="flex items-center gap-2 rounded-full border border-border bg-hatch-bg px-3 py-1.5 text-[0.74rem] font-semibold text-muted-foreground transition-all hover:border-hatch-orange hover:bg-orange-50 hover:text-hatch-orange"
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="mb-3 flex items-center gap-1.5 font-heading text-[0.65rem] font-black tracking-[0.09em] text-muted-foreground/50 uppercase">
              🛠 Featured Tools
            </p>
            <div className="grid grid-cols-2 gap-2">
              {FEATURED_TOOLS.map((tool) => (
                <div
                  key={tool.name}
                  className="group flex cursor-pointer items-center gap-2.5 rounded-[10px] border border-border bg-hatch-bg p-2.5 transition-all hover:border-gray-300 hover:bg-card hover:shadow-sm"
                >
                  <div
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-lg text-[0.95rem]",
                      tool.bg
                    )}
                  >
                    {tool.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-[0.78rem] font-bold text-hatch-charcoal">
                      {tool.name}
                    </p>
                    <p className="text-[0.68rem] text-muted-foreground">
                      {tool.sub}
                    </p>
                  </div>
                  <ArrowRight className="size-3.5 shrink-0 text-border transition-colors group-hover:text-hatch-orange" />
                </div>
              ))}
              <div className="group col-span-2 flex cursor-pointer items-center gap-2.5 rounded-[10px] border border-border bg-hatch-bg p-2.5 transition-all hover:border-gray-300 hover:bg-card hover:shadow-sm">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-[0.95rem]">
                  📊
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-heading text-[0.78rem] font-bold text-hatch-charcoal">
                    Pitch Deck Starter
                  </p>
                  <p className="text-[0.68rem] text-muted-foreground">
                    Tell your story to investors
                  </p>
                </div>
                <ArrowRight className="size-3.5 shrink-0 text-border transition-colors group-hover:text-hatch-orange" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateSandboxDialog
        open={showCreateSandbox}
        onClose={() => setShowCreateSandbox(false)}
        studentId={student?.id ?? ""}
      />
      <CreateSideHustleDialog
        open={showCreateSideHustle}
        onClose={() => setShowCreateSideHustle(false)}
        sandboxes={launchpad?.sandboxes ?? []}
        studentId={student?.id ?? ""}
      />
    </AppLayout>
  )
}
