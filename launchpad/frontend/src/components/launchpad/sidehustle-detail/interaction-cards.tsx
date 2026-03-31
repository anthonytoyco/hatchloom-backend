import {
  CONTACTS,
  EMAILS,
  MESSAGES,
  TODOS,
} from "@/components/launchpad/sidehustle-detail/demo-data"
import { cn } from "@/lib/utils"
import { Check, Pencil, Plus, Trash2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

type CommsTab = "msgs" | "emails" | "phonebook"

interface LocalTodo {
  id: string
  text: string
  done: boolean
  displayDate: string
  isoDate: string
  urgent: boolean
}

function parseDisplayDate(displayDate: string): string {
  const value = displayDate.trim()
  if (!value) return ""
  const parsed = new Date(`${value}, 2026`)
  if (isNaN(parsed.getTime())) return ""
  return parsed.toISOString().slice(0, 10)
}

function formatDisplayDate(isoDate: string): string {
  if (!isoDate) return ""
  const parsed = new Date(isoDate)
  if (isNaN(parsed.getTime())) return ""
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function byIsoDate(left: LocalTodo, right: LocalTodo): number {
  if (!left.isoDate && !right.isoDate)
    return left.text.localeCompare(right.text)
  if (!left.isoDate) return 1
  if (!right.isoDate) return -1
  return left.isoDate.localeCompare(right.isoDate)
}

function isUrgent(isoDate: string): boolean {
  if (!isoDate) return false
  const today = new Date("2026-02-22T00:00:00Z")
  const due = new Date(`${isoDate}T00:00:00Z`)
  if (isNaN(due.getTime())) return false
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / 86_400_000)
  return diffDays >= 0 && diffDays <= 3
}

export function TodoCard() {
  const [todos, setTodos] = useState<LocalTodo[]>(() =>
    TODOS.map((todo) => {
      const isoDate = parseDisplayDate(todo.date)
      return {
        id: todo.id,
        text: todo.text,
        done: todo.done,
        displayDate: todo.date,
        isoDate,
        urgent: todo.urgent ?? isUrgent(isoDate),
      }
    }).sort(byIsoDate)
  )
  const [isAdding, setIsAdding] = useState(false)
  const [newText, setNewText] = useState("")
  const [newDate, setNewDate] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [editDate, setEditDate] = useState("")
  const addInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isAdding) addInputRef.current?.focus()
  }, [isAdding])

  function updateTodos(next: LocalTodo[]) {
    setTodos([...next].sort(byIsoDate))
  }

  function toggle(id: string) {
    updateTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      )
    )
  }

  function openAdd() {
    setIsAdding(true)
    setNewText("")
    setNewDate("")
  }

  function cancelAdd() {
    setIsAdding(false)
    setNewText("")
    setNewDate("")
  }

  function saveAdd() {
    const text = newText.trim()
    if (!text) return
    const displayDate = newDate ? formatDisplayDate(newDate) : ""
    updateTodos([
      ...todos,
      {
        id: `todo-${Date.now()}`,
        text,
        done: false,
        displayDate,
        isoDate: newDate,
        urgent: isUrgent(newDate),
      },
    ])
    cancelAdd()
  }

  function openEdit(todo: LocalTodo) {
    setEditingId(todo.id)
    setEditText(todo.text)
    setEditDate(todo.isoDate)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditText("")
    setEditDate("")
  }

  function saveEdit(id: string) {
    const text = editText.trim()
    if (!text) return
    updateTodos(
      todos.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              text,
              isoDate: editDate,
              displayDate: editDate ? formatDisplayDate(editDate) : "",
              urgent: isUrgent(editDate),
            }
          : todo
      )
    )
    cancelEdit()
  }

  function removeTodo(id: string) {
    updateTodos(todos.filter((todo) => todo.id !== id))
  }

  const incompleteCount = todos.filter((todo) => !todo.done).length

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-[0_1px_6px_rgba(0,0,0,0.03)]">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-heading text-[0.8rem] font-extrabold text-hatch-charcoal">
            ✅ Todos
          </span>
          <span className="rounded-full bg-muted px-[0.35rem] py-0.5 font-heading text-[0.58rem] font-bold text-muted-foreground/60">
            {incompleteCount}/{todos.length}
          </span>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-0.5 font-heading text-[0.65rem] font-bold text-amber-600 transition-opacity hover:opacity-80"
        >
          <Plus className="size-2.5" /> Add
        </button>
      </div>
      <div className="flex flex-col divide-y divide-border/40">
        {todos.map((todo) => {
          const isEditing = editingId === todo.id
          return (
            <div
              key={todo.id}
              className="group flex items-center gap-2 py-[0.2rem]"
            >
              <button
                type="button"
                onClick={() => toggle(todo.id)}
                className={cn(
                  "flex size-[13px] shrink-0 items-center justify-center rounded border-[1.5px] transition-all",
                  todo.done ? "border-amber-500 bg-amber-500" : "border-border"
                )}
                aria-label={
                  todo.done ? "Mark todo incomplete" : "Mark todo complete"
                }
              >
                {todo.done && (
                  <Check className="size-2 text-white" strokeWidth={3} />
                )}
              </button>

              {isEditing ? (
                <>
                  <input
                    className="min-w-0 flex-1 rounded-md border border-border px-2 py-1 text-[0.72rem] font-medium text-hatch-charcoal outline-none focus:border-amber-500"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(todo.id)
                      if (e.key === "Escape") cancelEdit()
                    }}
                  />
                  <input
                    type="date"
                    className="rounded-md border border-border px-2 py-1 text-[0.68rem] text-muted-foreground outline-none focus:border-amber-500"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => saveEdit(todo.id)}
                    className="font-heading text-[0.6rem] font-bold text-amber-600 hover:opacity-80"
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => toggle(todo.id)}
                    className="flex flex-1 items-center gap-2 text-left transition-colors hover:text-amber-600"
                  >
                    <span
                      className={cn(
                        "flex-1 text-[0.74rem] font-medium",
                        todo.done && "text-muted-foreground/40 line-through"
                      )}
                    >
                      {todo.text}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 text-[0.55rem] font-semibold text-muted-foreground/50",
                        todo.urgent &&
                          !todo.done &&
                          "rounded bg-rose-50 px-1 py-px font-bold text-hatch-pink"
                      )}
                    >
                      {todo.displayDate || "No date"}
                    </span>
                  </button>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => openEdit(todo)}
                      className="flex size-6 items-center justify-center rounded border border-transparent text-muted-foreground transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600"
                      aria-label="Edit todo"
                    >
                      <Pencil className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeTodo(todo.id)}
                      className="flex size-6 items-center justify-center rounded border border-transparent text-muted-foreground transition-all hover:border-hatch-pink/40 hover:bg-rose-50 hover:text-hatch-pink"
                      aria-label="Delete todo"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </>
              )}
            </div>
          )
        })}

        {isAdding && (
          <div className="flex items-center gap-2 py-2">
            <input
              ref={addInputRef}
              className="min-w-0 flex-1 rounded-md border border-border px-2 py-1 text-[0.72rem] font-medium text-hatch-charcoal outline-none focus:border-amber-500"
              placeholder="New todo"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveAdd()
                if (e.key === "Escape") cancelAdd()
              }}
            />
            <input
              type="date"
              className="rounded-md border border-border px-2 py-1 text-[0.68rem] text-muted-foreground outline-none focus:border-amber-500"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
            <button
              type="button"
              onClick={saveAdd}
              className="font-heading text-[0.6rem] font-bold text-amber-600 hover:opacity-80"
            >
              Save
            </button>
          </div>
        )}
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
