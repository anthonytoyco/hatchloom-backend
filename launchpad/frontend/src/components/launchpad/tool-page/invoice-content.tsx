import type { SandboxTool } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Plus, Printer, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface LineItem {
  id: string
  description: string
  qty: number
  rate: number
}

interface InvoiceData {
  invoiceNumber: string
  issueDate: string
  dueDate: string
  fromName: string
  fromEmail: string
  fromBusiness: string
  toName: string
  toEmail: string
  items: LineItem[]
  taxRate: number
  notes: string
  status: "draft" | "sent" | "paid"
}

const today = new Date().toISOString().split("T")[0] ?? ""
const dueIn14 = new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0] ?? ""

const DEMO: InvoiceData = {
  invoiceNumber: "INV-001",
  issueDate: today,
  dueDate: dueIn14,
  fromName: "Alex Chen",
  fromEmail: "alex@flavourbutter.com",
  fromBusiness: "Flavour Butter Co.",
  toName: "School Cafeteria",
  toEmail: "cafe@westvalley.edu",
  items: [
    { id: "i1", description: "Garlic Herb Butter (6 jars)", qty: 6, rate: 9 },
    { id: "i2", description: "Honey Cinnamon Butter (4 jars)", qty: 4, rate: 9 },
    { id: "i3", description: "Gift box packaging", qty: 3, rate: 4.5 },
  ],
  taxRate: 13,
  notes: "Thank you for your order! Payment due within 14 days.",
  status: "draft",
}

function fmt(n: number) {
  return "$" + n.toFixed(2)
}

export function InvoiceContent({
  tool,
  onUnsaved,
}: {
  tool: SandboxTool
  onUnsaved: (data: string) => void
}) {
  const initial: InvoiceData = (() => {
    try {
      const parsed = JSON.parse(tool.data ?? "{}") as InvoiceData
      if (parsed.invoiceNumber !== undefined) return parsed
      return DEMO
    } catch {
      return DEMO
    }
  })()

  const [inv, setInv] = useState<InvoiceData>(initial)

  function update(patch: Partial<InvoiceData>) {
    setInv((prev) => {
      const next = { ...prev, ...patch }
      onUnsaved(JSON.stringify(next))
      return next
    })
  }

  function updateItem(id: string, patch: Partial<LineItem>) {
    update({
      items: inv.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    })
  }

  function addItem() {
    update({
      items: [
        ...inv.items,
        { id: `i-${Date.now()}`, description: "", qty: 1, rate: 0 },
      ],
    })
  }

  function removeItem(id: string) {
    update({ items: inv.items.filter((i) => i.id !== id) })
  }

  const subtotal = inv.items.reduce((s, i) => s + i.qty * i.rate, 0)
  const tax = subtotal * (inv.taxRate / 100)
  const total = subtotal + tax

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left: form */}
      <div className="flex w-[300px] shrink-0 flex-col gap-4 overflow-y-auto border-r border-border bg-hatch-bg p-4">
        {/* Status */}
        <div>
          <p className="mb-1.5 font-heading text-[0.6rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
            Status
          </p>
          <div className="flex gap-1.5">
            {(["draft", "sent", "paid"] as const).map((s) => (
              <button
                key={s}
                onClick={() => update({ status: s })}
                className={cn(
                  "flex-1 rounded-[7px] border py-1.5 font-heading text-[0.65rem] font-bold capitalize transition-all",
                  inv.status === s
                    ? s === "paid"
                      ? "border-green-400 bg-green-50 text-green-700"
                      : s === "sent"
                        ? "border-blue-300 bg-blue-50 text-blue-700"
                        : "border-amber-400 bg-amber-50 text-amber-700"
                    : "border-border bg-card text-muted-foreground hover:border-muted-foreground/30"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Invoice meta */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="mb-1 font-heading text-[0.6rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
              Invoice #
            </p>
            <input
              className="w-full rounded-[7px] border border-border bg-card px-2 py-1.5 text-[0.76rem] outline-none focus:border-amber-400"
              value={inv.invoiceNumber}
              onChange={(e) => update({ invoiceNumber: e.target.value })}
            />
          </div>
          <div>
            <p className="mb-1 font-heading text-[0.6rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
              Issue Date
            </p>
            <input
              type="date"
              className="w-full rounded-[7px] border border-border bg-card px-2 py-1.5 text-[0.76rem] outline-none focus:border-amber-400"
              value={inv.issueDate}
              onChange={(e) => update({ issueDate: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <p className="mb-1 font-heading text-[0.6rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
              Due Date
            </p>
            <input
              type="date"
              className="w-full rounded-[7px] border border-border bg-card px-2 py-1.5 text-[0.76rem] outline-none focus:border-amber-400"
              value={inv.dueDate}
              onChange={(e) => update({ dueDate: e.target.value })}
            />
          </div>
        </div>

        {/* From */}
        <div>
          <p className="mb-1.5 font-heading text-[0.6rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
            From (You)
          </p>
          <div className="flex flex-col gap-1.5">
            <input
              className="w-full rounded-[7px] border border-border bg-card px-2 py-1.5 text-[0.76rem] outline-none focus:border-amber-400"
              placeholder="Business name"
              value={inv.fromBusiness}
              onChange={(e) => update({ fromBusiness: e.target.value })}
            />
            <input
              className="w-full rounded-[7px] border border-border bg-card px-2 py-1.5 text-[0.76rem] outline-none focus:border-amber-400"
              placeholder="Your name"
              value={inv.fromName}
              onChange={(e) => update({ fromName: e.target.value })}
            />
            <input
              className="w-full rounded-[7px] border border-border bg-card px-2 py-1.5 text-[0.76rem] outline-none focus:border-amber-400"
              placeholder="your@email.com"
              type="email"
              value={inv.fromEmail}
              onChange={(e) => update({ fromEmail: e.target.value })}
            />
          </div>
        </div>

        {/* To */}
        <div>
          <p className="mb-1.5 font-heading text-[0.6rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
            Bill To
          </p>
          <div className="flex flex-col gap-1.5">
            <input
              className="w-full rounded-[7px] border border-border bg-card px-2 py-1.5 text-[0.76rem] outline-none focus:border-amber-400"
              placeholder="Client name"
              value={inv.toName}
              onChange={(e) => update({ toName: e.target.value })}
            />
            <input
              className="w-full rounded-[7px] border border-border bg-card px-2 py-1.5 text-[0.76rem] outline-none focus:border-amber-400"
              placeholder="client@email.com"
              type="email"
              value={inv.toEmail}
              onChange={(e) => update({ toEmail: e.target.value })}
            />
          </div>
        </div>

        {/* Tax + notes */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="mb-1 font-heading text-[0.6rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
              Tax (%)
            </p>
            <input
              type="number"
              min={0}
              max={100}
              className="w-full rounded-[7px] border border-border bg-card px-2 py-1.5 text-[0.76rem] outline-none focus:border-amber-400"
              value={inv.taxRate}
              onChange={(e) => update({ taxRate: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div>
          <p className="mb-1 font-heading text-[0.6rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
            Notes
          </p>
          <textarea
            className="min-h-16 w-full resize-none rounded-[7px] border border-border bg-card px-2 py-1.5 text-[0.76rem] outline-none focus:border-amber-400"
            value={inv.notes}
            onChange={(e) => update({ notes: e.target.value })}
            placeholder="Payment terms, thank you note…"
          />
        </div>

        <button
          onClick={() => toast.success("Invoice marked as sent!")}
          className="w-full rounded-[10px] bg-amber-500 py-2.5 font-heading text-[0.78rem] font-bold text-white transition-colors hover:bg-amber-600"
        >
          Send Invoice
        </button>
      </div>

      {/* Right: invoice preview */}
      <div className="flex flex-1 flex-col items-center overflow-auto bg-[#E5E7EB] p-6">
        {/* Print button */}
        <div className="mb-4 flex w-full max-w-2xl justify-end">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-[8px] border border-border bg-white px-3 py-1.5 font-heading text-[0.72rem] font-bold text-muted-foreground shadow-sm transition-all hover:bg-hatch-bg"
          >
            <Printer className="size-3.5" />
            Print / Save PDF
          </button>
        </div>

        {/* Invoice document */}
        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-[0_8px_40px_rgba(0,0,0,0.10)] overflow-hidden print:rounded-none print:shadow-none">
          {/* Header */}
          <div className="flex items-start justify-between bg-[#1E1E2E] px-8 py-6">
            <div>
              <p className="font-heading text-2xl font-black text-white">
                {inv.fromBusiness || "Your Business"}
              </p>
              <p className="mt-0.5 text-[0.78rem] text-white/60">{inv.fromName}</p>
              <p className="text-[0.72rem] text-white/50">{inv.fromEmail}</p>
            </div>
            <div className="text-right">
              <p className="font-heading text-3xl font-black text-amber-400">INVOICE</p>
              <p className="mt-1 font-heading text-[0.78rem] font-bold text-white/70">
                {inv.invoiceNumber}
              </p>
              <span
                className={cn(
                  "mt-1 inline-block rounded-full px-2.5 py-0.5 font-heading text-[0.6rem] font-bold uppercase",
                  inv.status === "paid"
                    ? "bg-green-500/20 text-green-300"
                    : inv.status === "sent"
                      ? "bg-blue-500/20 text-blue-300"
                      : "bg-amber-500/20 text-amber-300"
                )}
              >
                {inv.status}
              </span>
            </div>
          </div>

          <div className="px-8 py-6">
            {/* Bill to + dates */}
            <div className="mb-6 flex gap-8">
              <div className="flex-1">
                <p className="mb-1 font-heading text-[0.6rem] font-extrabold tracking-[0.06em] text-muted-foreground/50 uppercase">
                  Bill To
                </p>
                <p className="font-heading text-[0.88rem] font-bold text-hatch-charcoal">
                  {inv.toName || "Client Name"}
                </p>
                <p className="text-[0.76rem] text-muted-foreground">{inv.toEmail}</p>
              </div>
              <div className="text-right">
                <div className="mb-1">
                  <p className="font-heading text-[0.6rem] font-extrabold tracking-[0.06em] text-muted-foreground/50 uppercase">
                    Issue Date
                  </p>
                  <p className="font-heading text-[0.82rem] font-bold text-hatch-charcoal">{inv.issueDate}</p>
                </div>
                <div>
                  <p className="font-heading text-[0.6rem] font-extrabold tracking-[0.06em] text-muted-foreground/50 uppercase">
                    Due Date
                  </p>
                  <p className="font-heading text-[0.82rem] font-bold text-hatch-charcoal">{inv.dueDate}</p>
                </div>
              </div>
            </div>

            {/* Items table */}
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[#1E1E2E]">
                  <th className="pb-2 text-left font-heading text-[0.65rem] font-extrabold tracking-[0.05em] text-muted-foreground/60 uppercase">
                    Description
                  </th>
                  <th className="pb-2 text-center font-heading text-[0.65rem] font-extrabold tracking-[0.05em] text-muted-foreground/60 uppercase">
                    Qty
                  </th>
                  <th className="pb-2 text-right font-heading text-[0.65rem] font-extrabold tracking-[0.05em] text-muted-foreground/60 uppercase">
                    Rate
                  </th>
                  <th className="pb-2 text-right font-heading text-[0.65rem] font-extrabold tracking-[0.05em] text-muted-foreground/60 uppercase">
                    Amount
                  </th>
                  <th className="w-6 pb-2" />
                </tr>
              </thead>
              <tbody>
                {inv.items.map((item) => (
                  <tr key={item.id} className="group border-b border-border">
                    <td className="py-2 pr-4">
                      <input
                        className="w-full bg-transparent text-[0.82rem] text-foreground outline-none placeholder:text-muted-foreground/30 focus:bg-hatch-bg focus:px-1 rounded"
                        value={item.description}
                        placeholder="Item description"
                        onChange={(e) => updateItem(item.id, { description: e.target.value })}
                      />
                    </td>
                    <td className="py-2 text-center">
                      <input
                        type="number"
                        min={0}
                        className="w-12 bg-transparent text-center text-[0.82rem] outline-none focus:bg-hatch-bg focus:rounded"
                        value={item.qty}
                        onChange={(e) => updateItem(item.id, { qty: parseFloat(e.target.value) || 0 })}
                      />
                    </td>
                    <td className="py-2 text-right">
                      <input
                        type="number"
                        min={0}
                        className="w-20 bg-transparent text-right text-[0.82rem] outline-none focus:bg-hatch-bg focus:rounded"
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, { rate: parseFloat(e.target.value) || 0 })}
                      />
                    </td>
                    <td className="py-2 text-right font-heading text-[0.82rem] font-semibold text-hatch-charcoal">
                      {fmt(item.qty * item.rate)}
                    </td>
                    <td className="py-2 pl-2">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Trash2 className="size-3.5 text-hatch-pink" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              onClick={addItem}
              className="mt-2 flex items-center gap-1 text-[0.72rem] text-muted-foreground/40 transition-colors hover:text-amber-600"
            >
              <Plus className="size-3" /> Add line item
            </button>

            {/* Totals */}
            <div className="mt-6 flex justify-end">
              <div className="w-56">
                <div className="flex justify-between py-1 text-[0.8rem]">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold text-hatch-charcoal">{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between py-1 text-[0.8rem]">
                  <span className="text-muted-foreground">Tax ({inv.taxRate}%)</span>
                  <span className="font-semibold text-hatch-charcoal">{fmt(tax)}</span>
                </div>
                <div className="mt-1 flex justify-between rounded-[8px] bg-[#1E1E2E] px-3 py-2">
                  <span className="font-heading text-[0.78rem] font-extrabold text-white">Total</span>
                  <span className="font-heading text-[0.9rem] font-black text-amber-400">{fmt(total)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {inv.notes && (
              <div className="mt-6 rounded-[10px] border border-border bg-hatch-bg px-4 py-3">
                <p className="mb-1 font-heading text-[0.6rem] font-extrabold tracking-[0.05em] text-muted-foreground/50 uppercase">
                  Notes
                </p>
                <p className="text-[0.78rem] leading-relaxed text-muted-foreground">{inv.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
