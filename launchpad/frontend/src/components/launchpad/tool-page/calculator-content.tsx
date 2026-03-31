import type { SandboxTool } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"
import { useState } from "react"

interface LineItem {
  id: string
  label: string
  amount: number
  isIncome: boolean
}

interface Month {
  id: string
  name: string
  items: LineItem[]
}

interface CalcData {
  months: Month[]
}

const DEMO: CalcData = {
  months: [
    {
      id: "m1",
      name: "Nov 2025",
      items: [
        {
          id: "m1i1",
          label: "Butter sales (6 jars)",
          amount: 54,
          isIncome: true,
        },
        { id: "m1i2", label: "Ingredients", amount: 18.5, isIncome: false },
        { id: "m1i3", label: "Labels + jars", amount: 13, isIncome: false },
      ],
    },
    {
      id: "m2",
      name: "Dec 2025",
      items: [
        {
          id: "m2i1",
          label: "Butter sales (10 jars)",
          amount: 90,
          isIncome: true,
        },
        {
          id: "m2i2",
          label: "Holiday gift sets (3)",
          amount: 36,
          isIncome: true,
        },
        { id: "m2i3", label: "Ingredients", amount: 32, isIncome: false },
        { id: "m2i4", label: "Labels + jars", amount: 22, isIncome: false },
        {
          id: "m2i5",
          label: "Gift box packaging",
          amount: 26,
          isIncome: false,
        },
      ],
    },
    {
      id: "m3",
      name: "Jan 2026",
      items: [
        {
          id: "m3i1",
          label: "Butter sales (4 jars)",
          amount: 36,
          isIncome: true,
        },
        { id: "m3i2", label: "Ingredients", amount: 15, isIncome: false },
        { id: "m3i3", label: "Labels + jars", amount: 8, isIncome: false },
        { id: "m3i4", label: "Social media ads", amount: 25, isIncome: false },
      ],
    },
    {
      id: "m4",
      name: "Feb 2026",
      items: [
        {
          id: "m4i1",
          label: "Butter sales (8 jars)",
          amount: 72,
          isIncome: true,
        },
        { id: "m4i2", label: "School fair booth", amount: 22, isIncome: true },
        { id: "m4i3", label: "Ingredients", amount: 14, isIncome: false },
      ],
    },
  ],
}

function monthNet(month: Month) {
  return month.items.reduce(
    (s, i) => s + (i.isIncome ? i.amount : -i.amount),
    0
  )
}

function fmt(n: number) {
  return (n < 0 ? "-$" : "$") + Math.abs(n).toFixed(2)
}

export function CalculatorContent({
  tool,
  onUnsaved,
}: {
  tool: SandboxTool
  onUnsaved: (data: string) => void
}) {
  const initial: CalcData = (() => {
    try {
      const parsed = JSON.parse(tool.data ?? "{}") as CalcData
      if (parsed.months?.length) return parsed
      return DEMO
    } catch {
      return DEMO
    }
  })()

  const [data, setData] = useState<CalcData>(initial)

  function persist(next: CalcData) {
    onUnsaved(JSON.stringify(next))
    return next
  }

  function updateItem(mId: string, iId: string, patch: Partial<LineItem>) {
    setData((prev) =>
      persist({
        months: prev.months.map((m) =>
          m.id === mId
            ? {
                ...m,
                items: m.items.map((i) =>
                  i.id === iId ? { ...i, ...patch } : i
                ),
              }
            : m
        ),
      })
    )
  }

  function addItem(mId: string, isIncome: boolean) {
    setData((prev) =>
      persist({
        months: prev.months.map((m) =>
          m.id === mId
            ? {
                ...m,
                items: [
                  ...m.items,
                  {
                    id: `${mId}-${Date.now()}`,
                    label: isIncome ? "New income" : "New expense",
                    amount: 0,
                    isIncome,
                  },
                ],
              }
            : m
        ),
      })
    )
  }

  function removeItem(mId: string, iId: string) {
    setData((prev) =>
      persist({
        months: prev.months.map((m) =>
          m.id === mId
            ? { ...m, items: m.items.filter((i) => i.id !== iId) }
            : m
        ),
      })
    )
  }

  function addMonth() {
    setData((prev) => {
      const next = {
        months: [
          ...prev.months,
          {
            id: `m-${Date.now()}`,
            name: "New Month",
            items: [],
          },
        ],
      }
      persist(next)
      return next
    })
  }

  const allIncome = data.months.reduce(
    (s, m) =>
      s + m.items.filter((i) => i.isIncome).reduce((a, i) => a + i.amount, 0),
    0
  )
  const allExpenses = data.months.reduce(
    (s, m) =>
      s + m.items.filter((i) => !i.isIncome).reduce((a, i) => a + i.amount, 0),
    0
  )
  const netProfit = allIncome - allExpenses
  const maxInMonth = Math.max(
    ...data.months.map((m) =>
      Math.max(
        m.items.filter((i) => i.isIncome).reduce((a, i) => a + i.amount, 0),
        m.items.filter((i) => !i.isIncome).reduce((a, i) => a + i.amount, 0)
      )
    ),
    1
  )

  return (
    <div className="flex-1 overflow-auto px-6 py-5">
      {/* Summary cards */}
      <div className="mb-4 grid grid-cols-4 gap-3">
        {[
          {
            label: "Total Income",
            value: fmt(allIncome),
            cls: "text-sandbox-green",
            bg: "bg-green-50 border-green-200",
          },
          {
            label: "Total Expenses",
            value: fmt(allExpenses),
            cls: "text-red-500",
            bg: "bg-red-50 border-red-200",
          },
          {
            label: "Net Profit",
            value: fmt(netProfit),
            cls: netProfit >= 0 ? "text-amber-600" : "text-red-500",
            bg: "bg-amber-50 border-amber-200",
          },
          {
            label: "Running Balance",
            value: fmt(netProfit),
            cls: "text-cyan-600",
            bg: "bg-cyan-50 border-cyan-200",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={cn("rounded-xl border px-4 py-3", s.bg)}
          >
            <p className="font-heading text-[0.62rem] font-bold tracking-[0.04em] text-muted-foreground/60 uppercase">
              {s.label}
            </p>
            <p
              className={cn(
                "my-0.5 font-heading text-[1.25rem] font-black",
                s.cls
              )}
            >
              {s.value}
            </p>
            <p className="text-[0.65rem] text-muted-foreground">
              across {data.months.length} months
            </p>
          </div>
        ))}
      </div>

      {/* Month cards */}
      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {data.months.map((month) => {
          const inc = month.items.filter((i) => i.isIncome)
          const exp = month.items.filter((i) => !i.isIncome)
          const net = monthNet(month)
          return (
            <div
              key={month.id}
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              <div className="flex items-center justify-between border-b border-border bg-hatch-bg px-3 py-2">
                <input
                  className="w-full bg-transparent font-heading text-[0.75rem] font-extrabold text-hatch-charcoal outline-none"
                  value={month.name}
                  onChange={(e) =>
                    setData((prev) =>
                      persist({
                        months: prev.months.map((m) =>
                          m.id === month.id ? { ...m, name: e.target.value } : m
                        ),
                      })
                    )
                  }
                />
                <span
                  className={cn(
                    "ml-1 shrink-0 font-heading text-[0.7rem] font-extrabold",
                    net >= 0 ? "text-sandbox-green" : "text-red-500"
                  )}
                >
                  {net >= 0 ? "+" : ""}
                  {fmt(net)}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 p-2.5">
                {inc.map((item) => (
                  <div
                    key={item.id}
                    className="group flex items-center gap-1.5 py-0.5"
                  >
                    <span className="shrink-0 text-[0.65rem]">💵</span>
                    <input
                      className="min-w-0 flex-1 bg-transparent text-[0.72rem] text-foreground outline-none"
                      value={item.label}
                      onChange={(e) =>
                        updateItem(month.id, item.id, { label: e.target.value })
                      }
                    />
                    <input
                      className="w-16 shrink-0 bg-transparent text-right text-[0.72rem] font-semibold text-sandbox-green outline-none"
                      value={item.amount}
                      type="number"
                      min={0}
                      onChange={(e) =>
                        updateItem(month.id, item.id, {
                          amount: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                    <button
                      onClick={() => removeItem(month.id, item.id)}
                      className="shrink-0 text-[0.6rem] text-muted-foreground/40 opacity-0 group-hover:opacity-100 hover:text-hatch-pink"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addItem(month.id, true)}
                  className="flex items-center gap-1 py-0.5 text-[0.65rem] text-muted-foreground/40 transition-colors hover:text-sandbox-green"
                >
                  <Plus className="size-2.5" /> Add income
                </button>
                <div className="my-1.5 border-t border-border" />
                {exp.map((item) => (
                  <div
                    key={item.id}
                    className="group flex items-center gap-1.5 py-0.5"
                  >
                    <span className="shrink-0 text-[0.65rem]">📝</span>
                    <input
                      className="min-w-0 flex-1 bg-transparent text-[0.72rem] text-foreground outline-none"
                      value={item.label}
                      onChange={(e) =>
                        updateItem(month.id, item.id, { label: e.target.value })
                      }
                    />
                    <input
                      className="w-16 shrink-0 bg-transparent text-right text-[0.72rem] font-semibold text-red-500 outline-none"
                      value={item.amount}
                      type="number"
                      min={0}
                      onChange={(e) =>
                        updateItem(month.id, item.id, {
                          amount: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                    <button
                      onClick={() => removeItem(month.id, item.id)}
                      className="shrink-0 text-[0.6rem] text-muted-foreground/40 opacity-0 group-hover:opacity-100 hover:text-hatch-pink"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addItem(month.id, false)}
                  className="flex items-center gap-1 py-0.5 text-[0.65rem] text-muted-foreground/40 transition-colors hover:text-red-400"
                >
                  <Plus className="size-2.5" /> Add expense
                </button>
                <div className="mt-1.5 flex justify-between border-t border-border pt-1.5">
                  <span className="font-heading text-[0.72rem] font-extrabold text-hatch-charcoal">
                    Net
                  </span>
                  <span
                    className={cn(
                      "font-heading text-[0.72rem] font-extrabold",
                      net >= 0 ? "text-sandbox-green" : "text-red-500"
                    )}
                  >
                    {net >= 0 ? "+" : ""}
                    {fmt(net)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
        <button
          onClick={addMonth}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-8 font-heading text-[0.78rem] font-bold text-muted-foreground/40 transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600"
        >
          <Plus className="size-4" />
          Add Month
        </button>
      </div>

      {/* Bar chart */}
      <div className="rounded-[14px] border border-border bg-card p-4">
        <p className="mb-3 font-heading text-[0.8rem] font-extrabold text-hatch-charcoal">
          📊 Income vs Expenses
        </p>
        <div className="flex h-27.5 items-end gap-4">
          {data.months.map((month) => {
            const inc = month.items
              .filter((i) => i.isIncome)
              .reduce((a, i) => a + i.amount, 0)
            const exp = month.items
              .filter((i) => !i.isIncome)
              .reduce((a, i) => a + i.amount, 0)
            const incH = Math.round((inc / maxInMonth) * 100)
            const expH = Math.round((exp / maxInMonth) * 100)
            return (
              <div
                key={month.id}
                className="flex flex-1 flex-col items-center gap-1.5"
              >
                <div className="flex h-25 items-end gap-0.75">
                  <div
                    className="w-4.5 rounded-t-lg bg-sandbox-green transition-all duration-300"
                    style={{ height: `${Math.max(incH, 2)}%` }}
                  />
                  <div
                    className="w-4.5 rounded-t-lg bg-red-200 transition-all duration-300"
                    style={{ height: `${Math.max(expH, 2)}%` }}
                  />
                </div>
                <span className="font-heading text-[0.6rem] font-bold text-muted-foreground/60">
                  {month.name.split(" ")[0]}
                </span>
              </div>
            )
          })}
        </div>
        <div className="mt-2 flex justify-center gap-4">
          <div className="flex items-center gap-1.5 text-[0.65rem] text-muted-foreground">
            <div className="size-2.5 rounded-xs bg-sandbox-green" />
            Income
          </div>
          <div className="flex items-center gap-1.5 text-[0.65rem] text-muted-foreground">
            <div className="size-2.5 rounded-xs bg-red-200" />
            Expenses
          </div>
        </div>
      </div>
    </div>
  )
}
