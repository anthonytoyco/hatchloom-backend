import {
  CONTACTS,
  EMAILS,
  MESSAGES,
  TODOS,
} from "@/components/launchpad/sidehustle-detail/demo-data"
import { cn } from "@/lib/utils"
import { Check, Plus } from "lucide-react"
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
    <div className="rounded-xl border border-border bg-card p-4 shadow-[0_1px_6px_rgba(0,0,0,0.03)]">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-heading text-[0.8rem] font-extrabold text-hatch-charcoal">
            ✅ Todos
          </span>
          <span className="rounded-full bg-muted px-[0.35rem] py-0.5 font-heading text-[0.58rem] font-bold text-muted-foreground/60">
            {TODOS.length}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              toast.info(
                "Placeholder: SideHustle todo creation flow is not wired yet."
              )
            }
            className="flex items-center gap-0.5 font-heading text-[0.65rem] font-bold text-amber-600 hover:opacity-80"
          >
            <Plus className="size-2.5" /> Add
          </button>
          <button
            onClick={() =>
              toast.info(
                "Placeholder: SideHustle full todo list view is not wired yet."
              )
            }
            className="font-heading text-[0.65rem] font-bold text-hatch-pink hover:opacity-80"
          >
            See all →
          </button>
        </div>
      </div>
      <div className="flex flex-col divide-y divide-border/40">
        {TODOS.map((todo) => {
          const done = checked.has(todo.id)
          return (
            <div
              key={todo.id}
              className="flex cursor-pointer items-center gap-2 py-[0.2rem] transition-colors hover:text-amber-600"
              onClick={() => toggle(todo.id)}
            >
              <div
                className={cn(
                  "flex size-[13px] shrink-0 items-center justify-center rounded border-[1.5px] transition-all",
                  done ? "border-amber-500 bg-amber-500" : "border-border"
                )}
              >
                {done && (
                  <Check className="size-2 text-white" strokeWidth={3} />
                )}
              </div>
              <span
                className={cn(
                  "flex-1 text-[0.74rem] font-medium",
                  done && "text-muted-foreground/40 line-through"
                )}
              >
                {todo.text}
              </span>
              <span
                className={cn(
                  "shrink-0 text-[0.55rem] font-semibold text-muted-foreground/50",
                  todo.urgent &&
                    !done &&
                    "rounded bg-rose-50 px-1 py-px font-bold text-hatch-pink"
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
    <div className="rounded-xl border border-border bg-card p-4 shadow-[0_1px_6px_rgba(0,0,0,0.03)]">
      <div className="mb-2.5 flex items-center gap-0 border-b border-border">
        {(["msgs", "emails"] as CommsTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex items-center gap-1 rounded-t border-b-2 px-2.5 py-[0.35rem] text-[0.8rem] transition-all hover:bg-muted",
              tab === t ? "border-amber-500" : "border-transparent"
            )}
          >
            {t === "msgs" ? "💬" : "✉️"}
            <span className="flex size-[12px] items-center justify-center rounded-full bg-hatch-pink font-heading text-[0.45rem] font-extrabold text-white">
              {t === "msgs" ? 2 : 1}
            </span>
          </button>
        ))}
        <button
          onClick={() => setTab("phonebook")}
          className="ml-auto flex items-center gap-1 px-2 py-[0.35rem] text-[0.8rem] text-muted-foreground transition-colors hover:text-amber-600"
        >
          📇
          <span className="flex size-[12px] items-center justify-center rounded-full bg-amber-500 font-heading text-[0.45rem] font-extrabold text-white">
            3
          </span>
        </button>
      </div>

      {tab !== "phonebook" ? (
        <div className="flex flex-col divide-y divide-border/40">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="-mx-1 flex cursor-pointer items-start gap-1.5 rounded px-1 py-[0.3rem] transition-colors hover:bg-muted/40"
            >
              <div
                className={cn(
                  "flex size-[18px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[0.55rem]",
                  msg.grad
                )}
              >
                {msg.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="font-heading text-[0.65rem] font-bold text-hatch-charcoal">
                    {msg.sender}
                  </span>
                  {msg.isAI && (
                    <span className="rounded bg-violet-50 px-0.5 font-heading text-[0.45rem] font-extrabold text-violet-600">
                      AI
                    </span>
                  )}
                </div>
                <p className="truncate text-[0.6rem] leading-snug text-muted-foreground">
                  {msg.text}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-[0.52rem] text-muted-foreground/40">
                  {msg.time}
                </span>
                {msg.unread && (
                  <span className="size-[4px] rounded-full bg-hatch-pink" />
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {CONTACTS.map((c) => (
            <div
              key={c.name}
              className="flex cursor-pointer items-center gap-1.5 rounded-md border border-border px-2 py-1.5 transition-all hover:border-amber-400 hover:bg-amber-50/50"
            >
              <div
                className={cn(
                  "flex size-[18px] shrink-0 items-center justify-center rounded text-[0.55rem]",
                  c.bg
                )}
              >
                {c.emoji}
              </div>
              <div className="min-w-0">
                <p className="font-heading text-[0.65rem] font-bold text-hatch-charcoal">
                  {c.name}
                </p>
                <p className="text-[0.52rem] text-muted-foreground">{c.type}</p>
              </div>
            </div>
          ))}
          <button
            onClick={() =>
              toast.info(
                "Placeholder: SideHustle add-contact flow is not wired yet."
              )
            }
            className="mt-0.5 text-left font-heading text-[0.58rem] font-bold text-amber-600 hover:opacity-80"
          >
            + Add contact
          </button>
        </div>
      )}
    </div>
  )
}
