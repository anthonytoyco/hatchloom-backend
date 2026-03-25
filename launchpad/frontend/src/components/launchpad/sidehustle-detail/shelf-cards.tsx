import type {
  Channel,
  Resource,
} from "@/components/launchpad/sidehustle-detail/demo-data"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"
import { toast } from "sonner"

export function ShelfRow({
  title,
  action,
  children,
}: {
  title: string
  action?: string
  children: ReactNode
}) {
  function showShelfActionPlaceholder() {
    const messageByTitle: Record<string, string> = {
      "📌 Tagged Resources":
        "Placeholder: SideHustle Tagged Resources action is not wired yet.",
      "📡 Active Channels":
        "Placeholder: SideHustle Active Channels management is not wired yet.",
    }

    toast.info(
      messageByTitle[title] ??
        "Placeholder: this shelf action is not wired yet."
    )
  }

  return (
    <div className="mb-5">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="font-heading text-[0.82rem] font-extrabold text-hatch-charcoal">
          {title}
        </span>
        {action && (
          <button
            onClick={showShelfActionPlaceholder}
            className="font-heading text-[0.65rem] font-bold text-hatch-pink hover:opacity-80"
          >
            {action}
          </button>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
        {children}
      </div>
    </div>
  )
}

export function ResourceCard({ r }: { r: Resource }) {
  return (
    <div className="w-[155px] shrink-0 cursor-pointer rounded-[10px] border border-border bg-card p-2.5 transition-all hover:-translate-y-px hover:border-amber-400 hover:shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
      <div
        className={cn(
          "mb-1.5 flex size-7 items-center justify-center rounded-lg text-[0.9rem]",
          r.bg
        )}
      >
        {r.emoji}
      </div>
      <p className="font-heading text-[0.68rem] leading-snug font-bold text-hatch-charcoal">
        {r.name}
      </p>
      <p className="mt-0.5 text-[0.58rem] leading-snug text-muted-foreground">
        {r.sub}
      </p>
      <span
        className={cn(
          "mt-1.5 inline-flex rounded px-1 py-px font-heading text-[0.5rem] font-bold",
          r.tagBg,
          r.tagColor
        )}
      >
        {r.tagLabel}
      </span>
    </div>
  )
}

export function ChannelCard({ c }: { c: Channel }) {
  return (
    <div className="flex w-[175px] shrink-0 cursor-pointer items-center gap-2 rounded-[10px] border border-border bg-card px-3 py-2.5 transition-all hover:border-amber-400 hover:shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
      <div
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-lg text-[0.9rem]",
          c.bg
        )}
      >
        {c.emoji}
      </div>
      <div className="min-w-0">
        <p className="font-heading text-[0.68rem] font-bold text-hatch-charcoal">
          {c.name}
        </p>
        <div className="mt-0.5 flex items-center gap-1 text-[0.58rem] text-muted-foreground">
          <span
            className={cn(
              "size-[4px] shrink-0 rounded-full",
              c.active ? "bg-sandbox-green" : "bg-border"
            )}
          />
          {c.status}
        </div>
      </div>
    </div>
  )
}
