import { LAUNCHPAD_SIDEBAR_SECTIONS } from "@/components/launchpad/navigation"
import {
  CHANNELS,
  RECOMMENDED,
  TAGGED_RESOURCES,
  TEAM_MEMBERS,
} from "@/components/launchpad/sidehustle-detail/demo-data"
import {
  AddTeamMemberDialog,
  BMCSection,
  EditSideHustleDialog,
  PositionsSection,
} from "@/components/launchpad/sidehustle-detail/management-sections"
import {
  BusinessCard,
  ChannelCard,
  CommsCard,
  HeroCard,
  ResourceCard,
  ShelfRow,
  TodoCard,
} from "@/components/launchpad/sidehustle-detail/panel-cards"
import { AppLayout } from "@/components/layout/AppLayout"
import { useDeleteSideHustle, useRemoveTeamMember } from "@/hooks/use-mutations"
import { useSideHustle } from "@/hooks/use-side-hustle"
import { getSideHustleEmoji, getSideHustleGradient } from "@/lib/sandbox-colors"
import { ChevronRight } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { toast } from "sonner"

// ── Page ──────────────────────────────────────────────────────────────────────

export function SideHustleDetail() {
  const { sideHustleId = "22222222-2222-2222-2222-222222222201" } = useParams<{
    sideHustleId: string
  }>()
  const navigate = useNavigate()
  const [isDeleting, setIsDeleting] = useState(false)
  const activeSideHustleId = isDeleting ? "" : sideHustleId
  const { sideHustle, bmc, team, positions, isLoading } =
    useSideHustle(activeSideHustleId)
  const deleteSideHustle = useDeleteSideHustle()
  const removeTeamMember = useRemoveTeamMember(sideHustleId)

  const [showEdit, setShowEdit] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)

  async function handleDelete() {
    try {
      setIsDeleting(true)
      await deleteSideHustle.mutateAsync(sideHustleId)
      void navigate("/launchpad")
    } catch {
      setIsDeleting(false)
      toast.error("Failed to delete side hustle")
    }
  }

  async function handleRemoveMember(userId: string) {
    try {
      await removeTeamMember.mutateAsync(userId)
    } catch {
      toast.error("Failed to remove team member")
    }
  }

  return (
    <AppLayout
      sidebarSections={LAUNCHPAD_SIDEBAR_SECTIONS}
      sidebarCta={{ label: "💬 Contact Hatchloom", href: "/contact" }}
    >
      <div className="px-7 pt-5 pb-10">
        {/* Breadcrumb */}
        <nav className="mb-2.5 flex items-center gap-1.5 text-[0.72rem] font-semibold text-muted-foreground">
          <Link to="/" className="text-hatch-pink hover:underline">
            Student Home
          </Link>
          <ChevronRight className="size-3 text-border" />
          <Link to="/launchpad" className="text-hatch-pink hover:underline">
            Launchpad
          </Link>
          <ChevronRight className="size-3 text-border" />
          <Link
            to="/launchpad/sidehustles"
            className="text-hatch-pink hover:underline"
          >
            My SideHustles
          </Link>
          <ChevronRight className="size-3 text-border" />
          <span>
            {sideHustle ? getSideHustleEmoji(sideHustle.id) : "…"}{" "}
            {sideHustle?.title ?? "…"}
          </span>
        </nav>

        {isLoading ? (
          <>
            {/* Hero */}
            <div className="mb-4 h-[90px] animate-pulse rounded-2xl bg-muted" />

            {/* Business cards */}
            <div className="mb-5 grid grid-cols-2 gap-5">
              <div className="h-[140px] animate-pulse rounded-2xl bg-muted" />
              <div className="h-[140px] animate-pulse rounded-2xl bg-muted" />
            </div>
          </>
        ) : sideHustle ? (
          <>
            {/* Hero */}
            <HeroCard
              title={sideHustle.title}
              description={sideHustle.description}
              status={sideHustle.status}
              gradient={getSideHustleGradient(sideHustle.id)}
              emoji={getSideHustleEmoji(sideHustle.id)}
              createdAt={sideHustle.createdAt}
              updatedAt={sideHustle.updatedAt}
              team={team}
              fallbackTeam={TEAM_MEMBERS}
              onEdit={() => setShowEdit(true)}
              onDelete={() => void handleDelete()}
              onAddMember={() => setShowAddMember(true)}
              onRemoveMember={(userId) => void handleRemoveMember(userId)}
            />

            {/* Business cards */}
            <BusinessCard type="running" />
            <BusinessCard type="growing" />

            {/* BMC */}
            {bmc && <BMCSection bmc={bmc} sideHustleId={sideHustleId} />}

            {/* Positions */}
            <PositionsSection
              positions={positions}
              sideHustleId={sideHustleId}
            />

            {/* Todos + Comms */}
            <div className="mb-5 grid grid-cols-2 gap-4">
              <TodoCard />
              <CommsCard />
            </div>

            {/* Shelves */}
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
            <ShelfRow title="✨ Recommended">
              {RECOMMENDED.map((r) => (
                <ResourceCard key={r.name} r={r} />
              ))}
            </ShelfRow>
          </>
        ) : (
          <div className="flex min-h-[600px] flex-col items-center justify-center gap-4">
            <div className="text-center">
              <p className="mb-2 text-sm font-semibold text-muted-foreground">
                Side Hustle not found
              </p>
              <p className="mb-6 text-xs text-muted-foreground">
                This side hustle doesn't exist or you don't have access to it.
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
      {sideHustle && (
        <EditSideHustleDialog
          open={showEdit}
          sideHustleId={sideHustleId}
          initialTitle={sideHustle.title}
          initialDescription={sideHustle.description}
          onClose={() => setShowEdit(false)}
        />
      )}
      <AddTeamMemberDialog
        open={showAddMember}
        sideHustleId={sideHustleId}
        team={team}
        onClose={() => setShowAddMember(false)}
      />
    </AppLayout>
  )
}
