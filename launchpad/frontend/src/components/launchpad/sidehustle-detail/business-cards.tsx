import type {
  MetricTileData,
  TileVariant,
} from "@/components/launchpad/sidehustle-detail/demo-data"
import {
  GROWING_TILES,
  RUNNING_TILES,
  WEEKLY_DATA,
} from "@/components/launchpad/sidehustle-detail/demo-data"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function MiniBarChart() {
  const W = 160,
    H = 55,
    padL = 2,
    padR = 2,
    padT = 4,
    padB = 12
  const chartW = W - padL - padR
  const chartH = H - padT - padB
  const max = 52
  const bw = chartW / WEEKLY_DATA.length
  const barW = Math.min(bw * 0.35, 8)

  const cumulative = WEEKLY_DATA.reduce<number[]>((acc, [e, s], i) => {
    acc.push((acc[i - 1] ?? 0) + (e - s))
    return acc
  }, [])
  const minCum = Math.min(...cumulative)
  const maxCum = Math.max(...cumulative)
  const cumRange = maxCum - minCum || 1

  function toCumY(v: number) {
    return padT + chartH - ((v - minCum) / cumRange) * chartH
  }

  const linePoints = WEEKLY_DATA.map((_, i) => {
    const cx = padL + i * bw + bw / 2
    return `${cx},${toCumY(cumulative[i])}`
  }).join(" ")

  return (
    <svg width={W} height={H} className="shrink-0">
      {WEEKLY_DATA.map(([earned, spent], i) => {
        const cx = padL + i * bw + bw / 2
        const eH = (earned / max) * chartH
        const sH = (spent / max) * chartH
        return (
          <g key={i}>
            {earned > 0 && (
              <rect
                x={cx - barW - 1}
                y={padT + chartH - eH}
                width={barW}
                height={eH}
                rx={1.5}
                fill={i === 5 ? "#D97706" : "#FCD34D"}
              />
            )}
            {spent > 0 && (
              <rect
                x={cx + 1}
                y={padT + chartH - sH}
                width={barW}
                height={sH}
                rx={1.5}
                fill="#E5E7EB"
              />
            )}
            <text
              x={cx}
              y={H - 2}
              textAnchor="middle"
              fontSize={6}
              fontWeight={700}
              fill={i === 5 ? "#D97706" : "#D1D5DB"}
            >
              W{i + 1}
            </text>
          </g>
        )
      })}
      <polyline
        points={linePoints}
        fill="none"
        stroke="#22C55E"
        strokeWidth={1.2}
        strokeDasharray="2 1.5"
      />
    </svg>
  )
}

export function MetricTile({ t }: { t: MetricTileData }) {
  const borderMap: Record<TileVariant, string> = {
    green: "border-l-green-500 hover:border-green-600",
    amber: "border-l-amber-400 hover:border-amber-500",
    red: "border-l-red-500  hover:border-red-600",
  }
  return (
    <div
      className={cn(
        "relative cursor-pointer rounded-lg border border-l-[3px] border-border px-[0.4rem] py-[0.45rem] transition-all hover:-translate-y-px hover:shadow-[0_3px_10px_rgba(0,0,0,0.07)]",
        borderMap[t.variant]
      )}
    >
      <p className="font-heading text-[0.5rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
        {t.label}
      </p>
      <p
        className={cn(
          "font-heading text-[0.75rem] leading-tight font-black",
          t.alert ? "text-red-500" : "text-hatch-charcoal",
          t.variant === "amber" && !t.alert && "[&_span]:text-amber-500"
        )}
      >
        {t.metric}
      </p>
      <p className="mt-[0.06rem] text-[0.5rem] leading-snug text-muted-foreground">
        {t.detail}
      </p>
      <span className="absolute top-[0.3rem] right-[0.3rem] text-[0.4rem] text-border group-hover:text-hatch-charcoal">
        →
      </span>
    </div>
  )
}

export function BusinessCard({ type }: { type: "running" | "growing" }) {
  const isRunning = type === "running"
  const tiles = isRunning ? RUNNING_TILES : GROWING_TILES
  return (
    <div className="mb-4 animate-[fadeUp_0.35s_ease_both] rounded-xl border border-border bg-card p-4 shadow-[0_1px_6px_rgba(0,0,0,0.03)]">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-heading text-[0.82rem] font-extrabold text-hatch-charcoal">
            {isRunning ? "📊 Running My Business" : "🌱 Growing My Business"}
          </span>
          <span className="rounded bg-muted px-[0.4rem] py-px font-heading text-[0.58rem] font-bold text-muted-foreground/60">
            Feb 2026
          </span>
        </div>
        <span className="font-heading text-[0.55rem] font-semibold text-muted-foreground/60">
          Suggested by Barry · Tap to open
        </span>
      </div>

      {isRunning && (
        <div className="mb-3 flex items-center gap-3 border-b border-border pb-3">
          <div className="relative shrink-0">
            <MiniBarChart />
            <div className="absolute top-0 right-0 text-right">
              <span className="block font-heading text-[0.42rem] font-bold tracking-[0.03em] text-muted-foreground/50 uppercase">
                Cashflow since launch
              </span>
              <span className="font-heading text-[0.65rem] leading-none font-black text-emerald-600">
                +$9
              </span>
            </div>
          </div>
          <div className="flex flex-1 gap-1.5">
            {[
              { label: "Earned", val: "$64", highlight: false },
              { label: "Spent", val: "$27", highlight: false },
              { label: "Profit", val: "$37", highlight: true },
            ].map((m) => (
              <div
                key={m.label}
                className="flex-1 cursor-pointer rounded-lg border border-border bg-hatch-bg p-1.5 text-center transition-all hover:border-amber-400 hover:bg-white hover:shadow-[0_2px_6px_rgba(217,119,6,0.08)]"
              >
                <p className="font-heading text-[0.5rem] font-bold tracking-[0.03em] text-muted-foreground/50 uppercase">
                  {m.label}
                </p>
                <p
                  className={cn(
                    "font-heading text-[0.95rem] leading-tight font-black",
                    m.highlight ? "text-emerald-600" : "text-hatch-charcoal"
                  )}
                >
                  {m.val}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-6 gap-x-2 gap-y-1.5">
        {tiles.map((t) => (
          <MetricTile key={t.label} t={t} />
        ))}
        <button
          onClick={() =>
            toast.info(
              "Placeholder: custom metric-tile creation is not wired yet."
            )
          }
          className="flex cursor-pointer items-center justify-center gap-0.5 rounded-lg border-[1.5px] border-dashed border-muted-foreground/30 bg-hatch-bg px-1 py-[0.45rem] font-heading text-[0.55rem] font-bold text-muted-foreground/40 transition-all hover:border-amber-400 hover:bg-amber-50 hover:text-amber-600"
        >
          + Add tile
        </button>
      </div>
      <div className="mt-1.5 flex items-center">
        <button
          onClick={() =>
            toast.info(
              "Placeholder: Barry suggestion workflow is not wired yet."
            )
          }
          className="font-heading text-[0.58rem] font-bold text-violet-500 hover:opacity-80"
        >
          🔄 Barry can suggest more
        </button>
      </div>
    </div>
  )
}
