import type { SandboxTool } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Plus, Trash2 } from "lucide-react"
import { useState } from "react"

interface InventoryItem {
  id: string
  name: string
  onHand: number
  reorderAt: number
  costPerUnit: number
}

interface InventoryData {
  items: InventoryItem[]
}

interface LegacyChecklistItem {
  id: string
  text: string
  checked: boolean
}

const DEMO_ITEMS: InventoryItem[] = [
  {
    id: "i1",
    name: "Salted Butter (500g block)",
    onHand: 12,
    reorderAt: 5,
    costPerUnit: 3.5,
  },
  {
    id: "i2",
    name: "Garlic (fresh heads)",
    onHand: 8,
    reorderAt: 4,
    costPerUnit: 0.75,
  },
  {
    id: "i3",
    name: "Fresh Herbs (mixed pack)",
    onHand: 3,
    reorderAt: 3,
    costPerUnit: 2.5,
  },
  {
    id: "i4",
    name: "Glass Jars (250ml, 12-pack)",
    onHand: 24,
    reorderAt: 12,
    costPerUnit: 0.85,
  },
  {
    id: "i5",
    name: "Labels (printed, roll of 50)",
    onHand: 0,
    reorderAt: 10,
    costPerUnit: 0.12,
  },
  {
    id: "i6",
    name: "Wax Paper Wraps (pack of 20)",
    onHand: 15,
    reorderAt: 5,
    costPerUnit: 0.77,
  },
]

function hydrateInventory(tool: SandboxTool): InventoryData {
  try {
    const parsed = JSON.parse(tool.data ?? "{}") as unknown

    if (
      !parsed ||
      typeof parsed !== "object" ||
      !("items" in parsed) ||
      !Array.isArray(parsed.items)
    ) {
      return { items: DEMO_ITEMS }
    }

    const rawItems = parsed.items as Array<InventoryItem | LegacyChecklistItem>

    if (rawItems.length === 0) {
      return { items: DEMO_ITEMS }
    }

    if ("checked" in rawItems[0]) {
      return {
        items: rawItems.map((item) => {
          const legacy = item as LegacyChecklistItem
          return {
            id: item.id,
            name: legacy.text,
            onHand: legacy.checked ? 1 : 0,
            reorderAt: 2,
            costPerUnit: 1,
          }
        }),
      }
    }

    return {
      items: rawItems.map((item) => {
        const inventory = item as InventoryItem
        return {
          id: item.id,
          name: inventory.name,
          onHand: Number(inventory.onHand) || 0,
          reorderAt: Number(inventory.reorderAt) || 0,
          costPerUnit: Number(inventory.costPerUnit) || 0,
        }
      }),
    }
  } catch {
    return { items: DEMO_ITEMS }
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value)
}

function getStatus(item: InventoryItem) {
  if (item.onHand <= 0) return "OUT"
  if (item.onHand <= item.reorderAt) return "REORDER"
  return "IN_STOCK"
}

export function ChecklistContent({
  tool,
  onUnsaved,
}: {
  tool: SandboxTool
  onUnsaved: (data: string) => void
}) {
  const initial = hydrateInventory(tool)
  const [items, setItems] = useState<InventoryItem[]>(initial.items)

  function persist(next: InventoryItem[]) {
    onUnsaved(JSON.stringify({ items: next }))
  }

  function updateItem(id: string, patch: Partial<InventoryItem>) {
    setItems((prev) => {
      const next = prev.map((item) =>
        item.id === id ? { ...item, ...patch } : item
      )
      persist(next)
      return next
    })
  }

  function addItem() {
    setItems((prev) => {
      const next = [
        ...prev,
        {
          id: `item-${Date.now()}`,
          name: "",
          onHand: 0,
          reorderAt: 5,
          costPerUnit: 0,
        },
      ]
      persist(next)
      return next
    })
  }

  function removeItem(id: string) {
    setItems((prev) => {
      const next = prev.filter((item) => item.id !== id)
      persist(next)
      return next
    })
  }

  const inStock = items.filter((item) => getStatus(item) === "IN_STOCK").length
  const lowOrOut = items.filter((item) => getStatus(item) !== "IN_STOCK").length
  const totalValue = items.reduce(
    (sum, item) => sum + item.onHand * item.costPerUnit,
    0
  )

  return (
    <div className="flex-1 overflow-auto px-6 py-5">
      <div className="mb-4 grid grid-cols-4 gap-3">
        {[
          {
            label: "Total Items",
            value: items.length,
            sub: "products tracked",
          },
          {
            label: "In Stock",
            value: inStock,
            sub: "above reorder point",
            highlight: "green",
          },
          {
            label: "Low / Out",
            value: lowOrOut,
            sub: "need restocking",
            highlight: lowOrOut > 0 ? "red" : undefined,
          },
          {
            label: "Total Value",
            value: formatCurrency(totalValue),
            sub: "inventory at cost",
          },
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
                s.highlight === "red" && lowOrOut > 0 && "text-red-500",
                !s.highlight && "text-hatch-charcoal"
              )}
            >
              {s.value}
            </p>
            <p className="text-[0.68rem] text-muted-foreground">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-[14px] border border-border bg-card">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border bg-hatch-bg">
              <th className="px-3.5 py-2.5 text-left font-heading text-[0.68rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
                Item
              </th>
              <th className="w-[110px] px-3.5 py-2.5 text-right font-heading text-[0.68rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
                On Hand
              </th>
              <th className="w-[110px] px-3.5 py-2.5 text-right font-heading text-[0.68rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
                Reorder At
              </th>
              <th className="w-30 px-3.5 py-2.5 text-right font-heading text-[0.68rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
                Cost / Unit
              </th>
              <th className="w-30 px-3.5 py-2.5 text-right font-heading text-[0.68rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
                Value
              </th>
              <th className="w-[110px] px-3.5 py-2.5 text-left font-heading text-[0.68rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
                Status
              </th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className={cn(
                  "border-b border-border last:border-0 hover:bg-muted/40",
                  getStatus(item) === "OUT" && "bg-red-50/60"
                )}
              >
                <td className="px-3.5 py-3">
                  <input
                    className="w-full bg-transparent text-[0.8rem] text-foreground outline-none focus:border-b focus:border-hatch-orange"
                    value={item.name}
                    placeholder="Item name"
                    onChange={(e) =>
                      updateItem(item.id, { name: e.target.value })
                    }
                  />
                </td>
                <td className="px-3.5 py-3 text-right">
                  <input
                    type="number"
                    className="w-full bg-transparent text-right text-[0.8rem] text-foreground tabular-nums outline-none focus:border-b focus:border-hatch-orange"
                    value={item.onHand}
                    onChange={(e) =>
                      updateItem(item.id, {
                        onHand: Number(e.target.value) || 0,
                      })
                    }
                  />
                </td>
                <td className="px-3.5 py-3 text-right">
                  <input
                    type="number"
                    className="w-full bg-transparent text-right text-[0.8rem] text-foreground tabular-nums outline-none focus:border-b focus:border-hatch-orange"
                    value={item.reorderAt}
                    onChange={(e) =>
                      updateItem(item.id, {
                        reorderAt: Number(e.target.value) || 0,
                      })
                    }
                  />
                </td>
                <td className="px-3.5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-[0.75rem] text-muted-foreground">
                      $
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-16 bg-transparent text-right text-[0.8rem] text-foreground tabular-nums outline-none focus:border-b focus:border-hatch-orange"
                      value={item.costPerUnit}
                      onChange={(e) =>
                        updateItem(item.id, {
                          costPerUnit: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </td>
                <td className="px-3.5 py-3 text-right font-semibold text-hatch-charcoal tabular-nums">
                  {formatCurrency(item.onHand * item.costPerUnit)}
                </td>
                <td className="px-3.5 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-heading text-[0.62rem] font-bold",
                      getStatus(item) === "IN_STOCK" &&
                        "border-green-200 bg-green-50 text-sandbox-green",
                      getStatus(item) === "REORDER" &&
                        "border-amber-200 bg-amber-50 text-hatch-orange",
                      getStatus(item) === "OUT" &&
                        "border-red-200 bg-red-50 text-red-600"
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.25 rounded-full",
                        getStatus(item) === "IN_STOCK" && "bg-sandbox-green",
                        getStatus(item) === "REORDER" && "bg-hatch-orange",
                        getStatus(item) === "OUT" && "bg-red-600"
                      )}
                    />
                    {getStatus(item) === "IN_STOCK"
                      ? "In Stock"
                      : getStatus(item) === "REORDER"
                        ? "Reorder"
                        : "Out!"}
                  </span>
                </td>
                <td className="px-2 py-3 text-center">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-[0.7rem] text-muted-foreground/30 transition-colors hover:text-hatch-pink"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center gap-2 border-t border-dashed border-border px-3.5 py-2.5 text-[0.78rem] text-muted-foreground transition-colors hover:bg-amber-50 hover:text-hatch-orange">
          <button
            onClick={addItem}
            className="inline-flex items-center gap-2 font-heading text-[0.72rem] font-bold"
          >
            <Plus className="size-3.5" /> Add item
          </button>
        </div>
      </div>
    </div>
  )
}
