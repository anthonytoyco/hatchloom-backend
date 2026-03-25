import type { SandboxTool } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import { useState } from "react"

interface CheckItem {
  id: string
  text: string
  checked: boolean
}

export function ChecklistContent({
  tool,
  onUnsaved,
}: {
  tool: SandboxTool
  onUnsaved: (data: string) => void
}) {
  const parsed = (() => {
    try {
      return JSON.parse(tool.data ?? '{"items":[]}') as { items: CheckItem[] }
    } catch {
      return { items: [] as CheckItem[] }
    }
  })()
  const [items, setItems] = useState<CheckItem[]>(parsed.items)
  const [newText, setNewText] = useState("")

  function toggle(id: string) {
    setItems((prev) => {
      const next = prev.map((i) =>
        i.id === id ? { ...i, checked: !i.checked } : i
      )
      onUnsaved(JSON.stringify({ items: next }))
      return next
    })
  }

  function addItem() {
    if (!newText.trim()) return
    setItems((prev) => {
      const next = [
        ...prev,
        { id: `item-${Date.now()}`, text: newText.trim(), checked: false },
      ]
      onUnsaved(JSON.stringify({ items: next }))
      return next
    })
    setNewText("")
  }

  function removeItem(id: string) {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id)
      onUnsaved(JSON.stringify({ items: next }))
      return next
    })
  }

  const done = items.filter((i) => i.checked).length
  const remaining = items.length - done
  const pct = items.length > 0 ? Math.round((done / items.length) * 100) : 0

  return (
    <div className="flex-1 overflow-auto px-6 py-5">
      <div className="mb-4 grid grid-cols-4 gap-3">
        {[
          { label: "Total Items", value: items.length, sub: "in this list" },
          {
            label: "Completed",
            value: done,
            sub: "tasks done",
            highlight: "green",
          },
          {
            label: "Remaining",
            value: remaining,
            sub: "still to do",
            highlight: remaining > 0 ? "red" : undefined,
          },
          { label: "Progress", value: `${pct}%`, sub: "completion" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-border bg-hatch-bg px-4 py-3"
          >
            <p className="font-heading text-[0.65rem] font-bold tracking-[0.04em] text-muted-foreground/60 uppercase">
              {s.label}
            </p>
            <p
              className={cn(
                "my-0.5 font-heading text-[1.3rem] font-black",
                s.highlight === "green" && "text-sandbox-green",
                s.highlight === "red" && remaining > 0 && "text-red-500",
                !s.highlight && "text-hatch-charcoal"
              )}
            >
              {s.value}
            </p>
            <p className="text-[0.68rem] text-muted-foreground">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 h-[6px] overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-sandbox-green transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="overflow-hidden rounded-[14px] border border-border bg-card">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border bg-hatch-bg">
              <th className="px-3.5 py-2.5 text-left font-heading text-[0.68rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
                Task
              </th>
              <th className="w-[80px] px-3.5 py-2.5 text-center font-heading text-[0.68rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
                Status
              </th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className={cn(
                  "border-b border-border last:border-0 hover:bg-muted/40",
                  item.checked && "opacity-60"
                )}
              >
                <td className="px-3.5 py-3">
                  <div
                    className="flex cursor-pointer items-center gap-3"
                    onClick={() => toggle(item.id)}
                  >
                    <div
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded border-[1.5px] transition-all",
                        item.checked
                          ? "border-sandbox-green bg-sandbox-green"
                          : "border-border"
                      )}
                    >
                      {item.checked && (
                        <Check
                          className="size-2.5 text-white"
                          strokeWidth={3}
                        />
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-[0.8rem]",
                        item.checked && "text-muted-foreground line-through"
                      )}
                    >
                      {item.text}
                    </span>
                  </div>
                </td>
                <td className="px-3.5 py-3 text-center">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-heading text-[0.62rem] font-bold",
                      item.checked
                        ? "border-green-200 bg-green-50 text-sandbox-green"
                        : "border-border bg-hatch-bg text-muted-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "size-[5px] rounded-full",
                        item.checked
                          ? "bg-sandbox-green"
                          : "bg-muted-foreground/50"
                      )}
                    />
                    {item.checked ? "Done" : "Pending"}
                  </span>
                </td>
                <td className="px-2 py-3 text-center">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-[0.7rem] text-muted-foreground/30 transition-colors hover:text-hatch-pink"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center gap-2 border-t border-dashed border-border px-3.5 py-2.5">
          <input
            className="flex-1 bg-transparent text-[0.78rem] text-foreground outline-none placeholder:text-muted-foreground/40"
            placeholder="Add a new item..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addItem()
            }}
          />
          <button
            onClick={addItem}
            disabled={!newText.trim()}
            className="font-heading text-[0.72rem] font-bold text-sandbox-green transition-opacity hover:opacity-80 disabled:text-muted-foreground/40"
          >
            + Add
          </button>
        </div>
      </div>
    </div>
  )
}
