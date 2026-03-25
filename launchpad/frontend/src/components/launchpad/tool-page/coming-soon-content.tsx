import { TOOL_META } from "@/lib/mock-data"
import { ToolIcon } from "./shared"

export function ComingSoonContent({ toolType }: { toolType: string }) {
  const meta = TOOL_META.find((m) => m.type === toolType)
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl border border-border bg-hatch-bg shadow-sm">
        {meta ? (
          <ToolIcon
            name={meta.icon}
            className="size-7 text-muted-foreground/60"
          />
        ) : (
          <span className="text-2xl">🔧</span>
        )}
      </div>
      <div>
        <p className="font-heading text-[1.1rem] font-extrabold text-hatch-charcoal">
          {meta?.label ?? toolType}
        </p>
        <p className="mt-1 text-[0.82rem] text-muted-foreground">
          {meta?.description}
        </p>
      </div>
      <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 font-heading text-[0.7rem] font-bold text-amber-700">
        Coming soon in backend integration phase
      </span>
    </div>
  )
}
