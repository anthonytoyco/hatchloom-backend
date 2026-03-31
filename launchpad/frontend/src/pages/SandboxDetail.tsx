import { LAUNCHPAD_SIDEBAR_SECTIONS } from "@/components/launchpad/navigation"
import {
  CHANNELS,
  RECOMMENDED,
  TAGGED_RESOURCES,
} from "@/components/launchpad/sandbox-detail/demo-data"
import {
  ActiveToolsCard,
  AddToolDialog,
  EditSandboxDialog,
  HeroCard,
} from "@/components/launchpad/sandbox-detail/main-sections"
import {
  ChannelCard,
  CommsCard,
  ResourceCard,
  ShelfRow,
  TodoCard,
} from "@/components/launchpad/sandbox-detail/panel-cards"
import { AppLayout } from "@/components/layout/AppLayout"
import { useDeleteSandbox } from "@/hooks/use-mutations"
import { useSandbox } from "@/hooks/use-sandbox"
import { getSandboxEmoji } from "@/lib/sandbox-colors"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { toast } from "sonner"

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-[14px] bg-muted", className)} />
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function SandboxDetail() {
  const { sandboxId = "11111111-1111-1111-1111-111111111101" } = useParams<{
    sandboxId: string
  }>()
  const navigate = useNavigate()
  const { sandbox, tools, isLoading } = useSandbox(sandboxId)
  const deleteSandbox = useDeleteSandbox()

  const [showAddTool, setShowAddTool] = useState(false)
  const [showEditSandbox, setShowEditSandbox] = useState(false)

  async function handleDelete() {
    try {
      await deleteSandbox.mutateAsync(sandboxId)
      void navigate("/launchpad")
    } catch {
      toast.error("Failed to delete sandbox")
    }
  }

  return (
    <AppLayout
      sidebarSections={LAUNCHPAD_SIDEBAR_SECTIONS}
      sidebarCta={{ label: "💬 Contact Hatchloom", href: "/contact" }}
    >
      <div className="px-8 pt-6 pb-10">
        {/* Breadcrumb */}
        <nav className="mb-3 flex items-center gap-1.5 text-[0.72rem] font-semibold text-muted-foreground">
          <Link to="/" className="text-hatch-pink hover:underline">
            Student Home
          </Link>
          <ChevronRight className="size-3 text-border" />
          <Link to="/launchpad" className="text-hatch-pink hover:underline">
            Launchpad
          </Link>
          <ChevronRight className="size-3 text-border" />
          <Link to="/launchpad" className="text-hatch-pink hover:underline">
            My Sandboxes
          </Link>
          <ChevronRight className="size-3 text-border" />
          <span>
            {sandbox ? getSandboxEmoji(sandbox.id) : "…"}{" "}
            {sandbox?.title ?? "…"}
          </span>
        </nav>

        {isLoading ? (
          <>
            {/* Zone 1 - Hero */}
            <SkeletonCard className="mb-4 h-[340px]" />

            {/* Zone 2 - Working Wall */}
            {/* Active Tools */}
            <SkeletonCard className="mb-5 h-[130px]" />

            {/* Todos + Comms */}
            <div className="mb-8 grid animate-[fadeUp_0.4s_ease_0.16s_both] grid-cols-2 gap-5">
              <SkeletonCard className="h-[200px]" />
              <SkeletonCard className="h-[200px]" />
            </div>
          </>
        ) : sandbox ? (
          <>
            {/* Zone 1 - Hero */}
            <HeroCard
              title={sandbox.title}
              description={sandbox.description}
              sandboxId={sandbox.id}
              studentId={sandbox.studentId}
              createdAt={sandbox.createdAt}
              updatedAt={sandbox.updatedAt}
              onEdit={() => setShowEditSandbox(true)}
              onDelete={() => void handleDelete()}
            />

            {/* Zone 2 - Working Wall */}

            {/* Active Tools */}
            <div className="mb-5 animate-[fadeUp_0.4s_ease_0.12s_both]">
              <ActiveToolsCard
                tools={tools}
                sandboxId={sandboxId}
                onAddTool={() => setShowAddTool(true)}
              />
            </div>

            {/* Todos + Comms */}
            <div className="mb-8 grid animate-[fadeUp_0.4s_ease_0.16s_both] grid-cols-2 gap-5">
              <TodoCard />
              <CommsCard />
            </div>

            {/* Zone 3 - Shelf */}
            <div className="animate-[fadeUp_0.4s_ease_0.28s_both]">
              <ShelfRow title="📌 Tagged Resources" action="See all →">
                {TAGGED_RESOURCES.map((r) => (
                  <ResourceCard key={r.name} r={r} />
                ))}
              </ShelfRow>

              <ShelfRow title="📡 Active Channels" action="Manage →">
                {CHANNELS.map((c) => (
                  <ChannelCard key={c.name} c={c} />
                ))}
              </ShelfRow>

              <ShelfRow title="✨ Recommended for This Project">
                {RECOMMENDED.map((r) => (
                  <ResourceCard key={r.name} r={r} />
                ))}
              </ShelfRow>
            </div>
          </>
        ) : (
          <div className="flex min-h-[600px] flex-col items-center justify-center gap-4">
            <div className="text-center">
              <p className="mb-2 text-sm font-semibold text-muted-foreground">
                Sandbox not found
              </p>
              <p className="mb-6 text-xs text-muted-foreground">
                This sandbox doesn't exist or you don't have access to it.
              </p>
              <Link
                to="/launchpad"
                className="inline-flex items-center gap-2 rounded-lg bg-hatch-pink px-4 py-2 text-xs font-semibold text-white transition-all hover:opacity-90"
              >
                Back to LaunchPad
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <AddToolDialog
        open={showAddTool}
        sandboxId={sandboxId}
        onClose={() => setShowAddTool(false)}
      />
      {sandbox && (
        <EditSandboxDialog
          open={showEditSandbox}
          sandboxId={sandboxId}
          initialTitle={sandbox.title}
          initialDescription={sandbox.description}
          onClose={() => setShowEditSandbox(false)}
        />
      )}
    </AppLayout>
  )
}
