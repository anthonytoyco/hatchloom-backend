import { cn } from "@/lib/utils"
import * as Icons from "lucide-react"

export type SaveState = "saved" | "unsaved" | "saving"

export function ToolIcon({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const Icon = (
    Icons as unknown as Record<
      string,
      React.ComponentType<{ className?: string }>
    >
  )[name]
  if (!Icon) return null
  return <Icon className={className} />
}

export function Toast({ msg, visible }: { msg: string; visible: boolean }) {
  return (
    <div
      className={cn(
        "fixed bottom-5 left-1/2 z-[9999] -translate-x-1/2 rounded-[10px] bg-hatch-charcoal px-4 py-2 font-heading text-[0.8rem] font-semibold text-white shadow-[0_8px_32px_rgba(0,0,0,0.25)] transition-[transform,opacity] duration-300",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-16 opacity-0"
      )}
    >
      {msg}
    </div>
  )
}

export function ActionBtn({
  emoji,
  label,
  onClick,
  active,
  danger,
}: {
  emoji: string
  label: string
  onClick?: () => void
  active?: boolean
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        "group relative flex size-8 cursor-pointer items-center justify-center rounded-[7px] border border-border bg-card text-[0.85rem] transition-all hover:bg-muted",
        active && "border-amber-200 bg-amber-50 text-hatch-orange",
        danger &&
          "hover:border-hatch-pink/50 hover:bg-rose-50 hover:text-hatch-pink"
      )}
    >
      {emoji}
      <span className="pointer-events-none absolute bottom-[calc(100%+5px)] left-1/2 z-10 -translate-x-1/2 rounded bg-hatch-charcoal px-1.5 py-0.5 font-heading text-[0.6rem] font-semibold whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
        {label}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-[3px] border-transparent border-t-hatch-charcoal" />
      </span>
    </button>
  )
}

export function ABSep() {
  return <div className="mx-[0.15rem] h-[18px] w-px bg-border" />
}
