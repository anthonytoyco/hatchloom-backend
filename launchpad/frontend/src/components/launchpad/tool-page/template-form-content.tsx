import type { SandboxTool } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface FeedbackEntry {
  id: string
  name: string
  date: string
  rating: number
  comment: string
  product: string
  channel: string
  actionPlan: string
  actionDone: boolean
}

interface FormData {
  entries: FeedbackEntry[]
}

const DEMO: FormData = {
  entries: [
    {
      id: "e1",
      name: "Mrs. Kim (teacher)",
      date: "Feb 18",
      rating: 5,
      comment:
        '"The garlic herb butter is incredible! I bought 3 jars for my family. The only thing — the label came off in my fridge."',
      product: "Garlic Herb Butter",
      channel: "In person",
      actionPlan: "Switched to waterproof labels",
      actionDone: true,
    },
    {
      id: "e2",
      name: "Jake (@skateboard_jake)",
      date: "Feb 12",
      rating: 4,
      comment: '"Pretty good on toast. Wish you had a spicy version though."',
      product: "Classic Salted Butter",
      channel: "Through a friend",
      actionPlan: "Added Chili Lime flavour to lineup",
      actionDone: true,
    },
    {
      id: "e3",
      name: "Coach Davies",
      date: "Feb 5",
      rating: 4,
      comment:
        '"Bought at the school fair. Good quality. Price is fair but I\'d buy more if there was a discount for 3+."',
      product: "Honey Cinnamon Butter",
      channel: "In person",
      actionPlan: "Consider multi-buy discount",
      actionDone: false,
    },
  ],
}

const CHANNELS = [
  "In person (at school/market)",
  "Through a friend",
  "Online order",
  "Other",
]

export function TemplateFormContent({
  tool,
  onUnsaved,
}: {
  tool: SandboxTool
  onUnsaved: (data: string) => void
}) {
  const initial: FormData = (() => {
    try {
      const parsed = JSON.parse(tool.data ?? "{}") as FormData
      if (parsed.entries) return parsed
      return DEMO
    } catch {
      return DEMO
    }
  })()

  const [data, setData] = useState<FormData>(initial)

  // New entry form state
  const [name, setName] = useState("")
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [product, setProduct] = useState("")
  const [channel, setChannel] = useState("")
  const [actionPlan, setActionPlan] = useState("")

  function submitEntry() {
    if (!name.trim() || rating === 0) {
      toast.error("Name and rating are required.")
      return
    }
    const entry: FeedbackEntry = {
      id: `e-${Date.now()}`,
      name: name.trim(),
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      rating,
      comment,
      product,
      channel,
      actionPlan,
      actionDone: false,
    }
    setData((prev) => {
      const next = { entries: [entry, ...prev.entries] }
      onUnsaved(JSON.stringify(next))
      return next
    })
    setName("")
    setRating(0)
    setComment("")
    setProduct("")
    setChannel("")
    setActionPlan("")
    toast.success("Feedback logged!")
  }

  function toggleDone(id: string) {
    setData((prev) => {
      const next = {
        entries: prev.entries.map((e) =>
          e.id === id ? { ...e, actionDone: !e.actionDone } : e
        ),
      }
      onUnsaved(JSON.stringify(next))
      return next
    })
  }

  function removeEntry(id: string) {
    setData((prev) => {
      const next = { entries: prev.entries.filter((e) => e.id !== id) }
      onUnsaved(JSON.stringify(next))
      return next
    })
  }

  const avgRating =
    data.entries.length > 0
      ? (
          data.entries.reduce((s, e) => s + e.rating, 0) / data.entries.length
        ).toFixed(1)
      : "—"
  const actionsTaken = data.entries.filter((e) => e.actionDone).length
  const pending = data.entries.filter((e) => !e.actionDone).length

  return (
    <div className="flex-1 overflow-auto px-6 py-5">
      <div className="mx-auto max-w-180">
        {/* Summary bar */}
        <div className="mb-5 grid grid-cols-4 overflow-hidden rounded-xl border border-border bg-hatch-bg">
          {[
            {
              label: "Responses",
              value: data.entries.length,
              cls: "text-hatch-charcoal",
            },
            {
              label: "Avg Rating",
              value: `${avgRating} ⭐`,
              cls: "text-amber-600",
            },
            {
              label: "Actions Taken",
              value: actionsTaken,
              cls: "text-sandbox-green",
            },
            {
              label: "Pending",
              value: pending,
              cls: pending > 0 ? "text-hatch-pink" : "text-muted-foreground",
            },
          ].map((s, i) => (
            <div
              key={s.label}
              className={cn(
                "flex min-w-0 flex-col items-center gap-0.5 px-4 py-3",
                i < 3 && "border-r border-border"
              )}
            >
              <span
                className={cn("font-heading text-[1.25rem] font-black", s.cls)}
              >
                {s.value}
              </span>
              <span className="font-heading text-[0.6rem] font-bold tracking-[0.03em] text-muted-foreground/60 uppercase">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* New feedback form */}
        <div className="mb-5">
          <p className="mb-1 font-heading text-[0.8rem] font-extrabold text-hatch-charcoal">
            Log New Feedback
          </p>
          <p className="mb-4 text-[0.74rem] text-muted-foreground">
            Got feedback from a customer? Log it here so you don't forget.
          </p>

          <div className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block font-heading text-[0.74rem] font-bold text-hatch-charcoal">
                Customer Name <span className="text-hatch-pink">*</span>
              </label>
              <input
                className="w-full rounded-[9px] border border-border bg-card px-3 py-2 text-[0.82rem] text-foreground transition-colors outline-none placeholder:text-muted-foreground/50 focus:border-amber-400"
                placeholder="Who gave you feedback?"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block font-heading text-[0.74rem] font-bold text-hatch-charcoal">
                Rating <span className="text-hatch-pink">*</span>
              </label>
              <p className="mb-1 text-[0.68rem] text-muted-foreground/60">
                How happy were they overall?
              </p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    className="text-2xl transition-transform hover:scale-110"
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(n)}
                  >
                    {n <= (hoverRating || rating) ? "★" : "☆"}
                  </button>
                ))}
                <span className="ml-2 text-[0.68rem] text-muted-foreground/60">
                  {rating === 0
                    ? "Click to rate"
                    : ["", "Terrible", "Not great", "OK", "Good", "Amazing!"][
                        rating
                      ] + ` (${rating}/5)`}
                </span>
              </div>
            </div>

            <div>
              <label className="mb-1 block font-heading text-[0.74rem] font-bold text-hatch-charcoal">
                What did they say?
              </label>
              <textarea
                className="min-h-17.5 w-full resize-y rounded-[9px] border border-border bg-card px-3 py-2 text-[0.82rem] leading-relaxed text-foreground transition-colors outline-none placeholder:text-muted-foreground/50 focus:border-amber-400"
                placeholder="Write down what the customer told you — exact words are best"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block font-heading text-[0.74rem] font-bold text-hatch-charcoal">
                  Which product?
                </label>
                <input
                  className="w-full rounded-[9px] border border-border bg-card px-3 py-2 text-[0.82rem] text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-amber-400"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  placeholder="Type the product name"
                />
              </div>

              <div>
                <label className="mb-1 block font-heading text-[0.74rem] font-bold text-hatch-charcoal">
                  How did they buy?
                </label>
                <select
                  className="w-full cursor-pointer rounded-[9px] border border-border bg-card px-3 py-2 text-[0.82rem] text-foreground outline-none focus:border-amber-400"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                >
                  <option value="">Select…</option>
                  {CHANNELS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block font-heading text-[0.74rem] font-bold text-hatch-charcoal">
                Your action plan
              </label>
              <textarea
                className="min-h-12.5 w-full resize-none rounded-[9px] border border-border bg-card px-3 py-2 text-[0.82rem] leading-relaxed text-foreground transition-colors outline-none placeholder:text-muted-foreground/50 focus:border-amber-400"
                placeholder="e.g. Adjust recipe, follow up with customer, change packaging…"
                value={actionPlan}
                onChange={(e) => setActionPlan(e.target.value)}
              />
            </div>

            <button
              onClick={submitEntry}
              className="flex items-center gap-2 self-start rounded-[9px] bg-amber-500 px-4 py-2 font-heading text-[0.78rem] font-bold text-white transition-colors hover:bg-amber-600"
            >
              <Plus className="size-3.5" />
              Log Feedback
            </button>
          </div>
        </div>

        <div className="my-5 h-px bg-border" />

        {/* Past entries */}
        <div>
          <p className="mb-3 font-heading text-[0.8rem] font-extrabold text-hatch-charcoal">
            📋 Previous Feedback{" "}
            <span className="ml-1 rounded-full bg-hatch-bg px-1.5 py-px font-heading text-[0.6rem] font-bold text-muted-foreground/50">
              {data.entries.length}
            </span>
          </p>
          {data.entries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-8 text-center text-[0.78rem] text-muted-foreground/50">
              No feedback logged yet. Use the form above to add your first
              entry.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border">
              {data.entries.map((entry, idx) => (
                <div
                  key={entry.id}
                  className={cn(
                    "group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-amber-50/50",
                    idx < data.entries.length - 1 && "border-b border-border"
                  )}
                >
                  <div className="shrink-0 pt-0.5 text-[0.9rem]">
                    {"⭐".repeat(entry.rating)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-heading text-[0.75rem] font-bold text-hatch-charcoal">
                        {entry.name}
                      </span>
                      <span className="text-[0.65rem] text-muted-foreground/60">
                        · {entry.date}
                      </span>
                      {entry.product && (
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-1.5 py-px font-heading text-[0.6rem] font-bold text-amber-600">
                          {entry.product}
                        </span>
                      )}
                    </div>
                    {entry.comment && (
                      <p className="mt-0.5 text-[0.77rem] leading-snug text-foreground">
                        {entry.comment}
                      </p>
                    )}
                    {entry.actionPlan && (
                      <button
                        onClick={() => toggleDone(entry.id)}
                        className={cn(
                          "mt-1 flex items-center gap-1 text-[0.68rem] font-semibold transition-colors",
                          entry.actionDone
                            ? "text-sandbox-green"
                            : "text-hatch-pink"
                        )}
                      >
                        {entry.actionDone ? "✅" : "⏳"}{" "}
                        {entry.actionDone ? "Action taken: " : "Pending: "}
                        {entry.actionPlan}
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => removeEntry(entry.id)}
                    className="mt-0.5 shrink-0 text-[0.68rem] text-muted-foreground/30 opacity-0 transition-all group-hover:opacity-100 hover:text-hatch-pink"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
