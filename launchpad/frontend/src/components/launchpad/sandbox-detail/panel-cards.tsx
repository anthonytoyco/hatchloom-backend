import type {
  Channel,
  Resource,
} from "@/components/launchpad/sandbox-detail/demo-data"
import {
  CONTACTS,
  EMAILS,
  MESSAGES,
  TODOS,
} from "@/components/launchpad/sandbox-detail/demo-data"
import { cn } from "@/lib/utils"
import { Check, Plus } from "lucide-react"
import type { ReactNode } from "react"
import { useState } from "react"
import { toast } from "sonner"

type CommsTab = "msgs" | "emails" | "phonebook"

export function TodoCard() {
  const [checked, setChecked] = useState<Set<string>>(
    () => new Set(TODOS.filter((t) => t.done).map((t) => t.id))
  )

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="rounded-[14px] border border-border bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-heading text-[0.85rem] font-extrabold text-hatch-charcoal">
            ✅ Todos
          </span>
          <span className="rounded-full bg-muted px-[0.45rem] py-0.5 font-heading text-[0.65rem] font-bold text-muted-foreground/60">
            {TODOS.length}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              toast.info("Placeholder: Todo creation flow is not wired yet.")
            }
            className="flex items-center gap-1 font-heading text-[0.7rem] font-bold text-sandbox-green hover:opacity-80"
          >
            <Plus className="size-3" /> Add
          </button>
          <button
            onClick={() =>
              toast.info("Placeholder: full Todo list view is not wired yet.")
            }
            className="font-heading text-[0.7rem] font-bold text-hatch-pink hover:opacity-80"
          >
            See all →
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-0 divide-y divide-border/50">
        {TODOS.map((todo) => {
          const done = checked.has(todo.id)
          return (
            <div
              key={todo.id}
              className="flex cursor-pointer items-center gap-2.5 py-[0.3rem] transition-colors hover:text-sandbox-green"
              onClick={() => toggle(todo.id)}
            >
              <div
                className={cn(
                  "flex size-[15px] shrink-0 items-center justify-center rounded border-[1.5px] transition-all",
                  done
                    ? "border-sandbox-green bg-sandbox-green"
                    : "border-border"
                )}
              >
                {done && (
                  <Check className="size-2.5 text-white" strokeWidth={3} />
                )}
              </div>
              <span
                className={cn(
                  "flex-1 text-[0.78rem] font-medium",
                  done && "text-muted-foreground/50 line-through"
                )}
              >
                {todo.text}
              </span>
              <span
                className={cn(
                  "shrink-0 text-[0.6rem] font-semibold text-muted-foreground/50",
                  todo.urgent &&
                    !done &&
                    "rounded bg-rose-50 px-1.5 py-0.5 font-bold text-hatch-pink"
                )}
              >
                {todo.date}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function CommsCard() {
  const [tab, setTab] = useState<CommsTab>("msgs")
  const messages = tab === "msgs" ? MESSAGES : EMAILS

  return (
    <div className="rounded-[14px] border border-border bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
      <div className="mb-3 flex items-center gap-0 border-b border-border">
        {(["msgs", "emails"] as CommsTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex items-center gap-1.5 rounded-t-md border-b-2 px-3 py-2 text-[0.9rem] transition-all hover:bg-muted",
              tab === t ? "border-sandbox-green" : "border-transparent"
            )}
          >
            {t === "msgs" ? "💬" : "✉️"}
            <span className="flex size-[14px] items-center justify-center rounded-full bg-hatch-pink font-heading text-[0.5rem] font-extrabold text-white">
              {t === "msgs" ? 2 : 1}
            </span>
          </button>
        ))}
        <button
          onClick={() => setTab("phonebook")}
          className="ml-auto flex items-center gap-1.5 px-2.5 py-2 text-[0.9rem] text-muted-foreground transition-colors hover:text-sandbox-green"
        >
          📇
          <span className="flex size-[14px] items-center justify-center rounded-full bg-sandbox-green font-heading text-[0.5rem] font-extrabold text-white">
            4
          </span>
        </button>
      </div>

      {tab !== "phonebook" ? (
        <div className="flex flex-col divide-y divide-border/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="-mx-1 flex cursor-pointer items-start gap-2 rounded px-1 py-[0.45rem] transition-colors hover:bg-muted/50"
            >
              <div
                className={cn(
                  "flex size-[22px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[0.65rem]",
                  msg.grad
                )}
              >
                {msg.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="font-heading text-[0.7rem] font-bold text-hatch-charcoal">
                    {msg.sender}
                  </span>
                  {msg.isAI && (
                    <span className="rounded bg-violet-50 px-1 py-px font-heading text-[0.5rem] font-extrabold text-violet-600">
                      AI
                    </span>
                  )}
                </div>
                <p className="truncate text-[0.67rem] leading-snug text-muted-foreground">
                  {msg.text}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-[0.58rem] text-muted-foreground/50">
                  {msg.time}
                </span>
                {msg.unread && (
                  <span className="size-[5px] rounded-full bg-hatch-pink" />
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {CONTACTS.map((c) => (
            <div
              key={c.name}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-2.5 py-2 transition-all hover:border-sandbox-green hover:bg-green-50/50"
            >
              <div
                className={cn(
                  "flex size-[22px] shrink-0 items-center justify-center rounded-md text-[0.65rem]",
                  c.bg
                )}
              >
                {c.emoji}
              </div>
              <div className="min-w-0">
                <p className="font-heading text-[0.7rem] font-bold text-hatch-charcoal">
                  {c.name}
                </p>
                <p className="text-[0.58rem] text-muted-foreground">{c.type}</p>
              </div>
            </div>
          ))}
          <button
            onClick={() =>
              toast.info(
                "Placeholder: Add contact flow is not wired yet for Sandbox comms."
              )
            }
            className="mt-1 text-left font-heading text-[0.65rem] font-bold text-sandbox-green hover:opacity-80"
          >
            + Add contact
          </button>
        </div>
      )}
    </div>
  )
}

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
        "Placeholder: Tagged Resources action will open the full resources manager.",
      "📡 Active Channels":
        "Placeholder: Active Channels action will open channel management.",
    }

    toast.info(
      messageByTitle[title] ??
        "Placeholder: This shelf action is not wired yet."
    )
  }

  return (
    <div className="mb-7">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="font-heading text-[0.9rem] font-extrabold text-hatch-charcoal">
          {title}
        </span>
        {action && (
          <button
            onClick={showShelfActionPlaceholder}
            className="font-heading text-[0.72rem] font-bold text-hatch-pink hover:opacity-80"
          >
            {action}
          </button>
        )}
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
        {children}
      </div>
    </div>
  )
}

export function ResourceCard({ r }: { r: Resource }) {
  return (
    <div className="w-[180px] shrink-0 cursor-pointer rounded-xl border border-border bg-card p-3.5 transition-all hover:-translate-y-0.5 hover:border-sandbox-green hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
      <div
        className={cn(
          "mb-2 flex size-9 items-center justify-center rounded-[10px] text-[1.1rem]",
          r.bg
        )}
      >
        {r.emoji}
      </div>
      <p className="font-heading text-[0.78rem] leading-snug font-bold text-hatch-charcoal">
        {r.name}
      </p>
      <p className="mt-0.5 text-[0.67rem] leading-snug text-muted-foreground">
        {r.sub}
      </p>
      <span
        className={cn(
          "mt-2 inline-flex rounded px-1.5 py-0.5 font-heading text-[0.58rem] font-bold",
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
    <div className="flex w-[200px] shrink-0 cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-all hover:border-sandbox-green hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-[10px] text-[1.1rem]",
          c.bg
        )}
      >
        {c.emoji}
      </div>
      <div className="min-w-0">
        <p className="font-heading text-[0.78rem] font-bold text-hatch-charcoal">
          {c.name}
        </p>
        <div className="mt-0.5 flex items-center gap-1.5 text-[0.65rem] text-muted-foreground">
          <span
            className={cn(
              "size-[5px] shrink-0 rounded-full",
              c.active ? "bg-sandbox-green" : "bg-border"
            )}
          />
          {c.status}
        </div>
      </div>
    </div>
  )
}
