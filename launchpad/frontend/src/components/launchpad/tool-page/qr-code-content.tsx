import type { SandboxTool } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

type QrType = "url" | "text" | "email" | "wifi"
type QrSize = 160 | 240 | 400 | 600

interface SavedQr {
  id: string
  label: string
  url: string
  icon: string
  date: string
}

interface QrData {
  url: string
  label: string
  fgColor: string
  bgColor: string
  size: QrSize
  saved: SavedQr[]
}

const DEMO: QrData = {
  url: "https://hatchloom.com/sidehustle/flavour-butter/order",
  label: "Order Form — Flavour Butter Co.",
  fgColor: "#1E1E2E",
  bgColor: "#FFFFFF",
  size: 240,
  saved: [
    {
      id: "s1",
      label: "Order Form",
      url: "https://hatchloom.com/sidehustle/flavour-butter/order",
      icon: "🔗",
      date: "Today",
    },
    {
      id: "s2",
      label: "Instagram Profile",
      url: "https://instagram.com/flavourbutter",
      icon: "📸",
      date: "Feb 18",
    },
    {
      id: "s3",
      label: "Feedback Form",
      url: "https://hatchloom.com/sidehustle/flavour-butter/feedback",
      icon: "⭐",
      date: "Feb 12",
    },
  ],
}

const COLOR_PRESETS: { name: string; fg: string; bg: string }[] = [
  { name: "Classic", fg: "#1E1E2E", bg: "#FFFFFF" },
  { name: "Butter", fg: "#D97706", bg: "#FFFBEB" },
  { name: "Eco", fg: "#059669", bg: "#F0FDF4" },
]

// Visual QR-like pattern generator (deterministic from input — not a real QR encoder)
function drawQr(
  canvas: HTMLCanvasElement,
  input: string,
  fg: string,
  bg: string
) {
  const ctx = canvas.getContext("2d")!
  if (!ctx) return
  const s = canvas.width
  const cellSize = Math.floor(s / 25)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, s, s)

  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (Math.imul(31, hash) + input.charCodeAt(i)) | 0
  }
  const seed = Math.abs(hash)
  function pseudoRand(n: number) {
    return ((((seed * 13 + n * 7 + n * n * 3) % 100) + 100) % 100) / 100
  }

  ctx.fillStyle = fg
  const off = Math.floor((s - 25 * cellSize) / 2)

  function drawFinder(x: number, y: number) {
    const s7 = cellSize * 7
    const s5 = cellSize * 5
    const s3 = cellSize * 3
    ctx.fillStyle = fg
    ctx.fillRect(x, y, s7, s7)
    ctx.fillStyle = bg
    ctx.fillRect(x + cellSize, y + cellSize, s5, s5)
    ctx.fillStyle = fg
    ctx.fillRect(x + cellSize * 2, y + cellSize * 2, s3, s3)
  }

  drawFinder(off, off)
  drawFinder(off + (25 - 7) * cellSize, off)
  drawFinder(off, off + (25 - 7) * cellSize)

  ctx.fillStyle = fg
  for (let r = 0; r < 25; r++) {
    for (let c = 0; c < 25; c++) {
      if ((r < 8 && c < 8) || (r < 8 && c > 16) || (r > 16 && c < 8)) continue
      if (pseudoRand(r * 25 + c) > 0.5) {
        ctx.fillRect(off + c * cellSize, off + r * cellSize, cellSize, cellSize)
      }
    }
  }
}

export function QrCodeContent({
  tool,
  onUnsaved,
}: {
  tool: SandboxTool
  onUnsaved: (data: string) => void
}) {
  const initial: QrData = (() => {
    try {
      const parsed = JSON.parse(tool.data ?? "{}") as QrData
      if (parsed.url !== undefined) return parsed
      return DEMO
    } catch {
      return DEMO
    }
  })()

  const [data, setData] = useState<QrData>(initial)
  const [qrType, setQrType] = useState<QrType>("url")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const refreshQr = useCallback(() => {
    if (!canvasRef.current) return
    drawQr(canvasRef.current, data.url || " ", data.fgColor, data.bgColor)
  }, [data.url, data.fgColor, data.bgColor])

  useEffect(() => {
    refreshQr()
  }, [refreshQr])

  function update(patch: Partial<QrData>) {
    setData((prev) => {
      const next = { ...prev, ...patch }
      onUnsaved(JSON.stringify(next))
      return next
    })
  }

  function saveQr() {
    if (!data.url.trim()) {
      toast.error("Enter a URL first.")
      return
    }
    const entry: SavedQr = {
      id: `s-${Date.now()}`,
      label: data.label || "Untitled QR",
      url: data.url,
      icon:
        qrType === "email"
          ? "📧"
          : qrType === "wifi"
            ? "📶"
            : qrType === "text"
              ? "📝"
              : "🔗",
      date: "Today",
    }
    update({ saved: [entry, ...data.saved.slice(0, 9)] })
    toast.success("QR code saved!")
  }

  function loadSaved(s: SavedQr) {
    update({ url: s.url, label: s.label })
    toast.info(`Loaded: ${s.label}`)
  }

  function removeSaved(id: string) {
    update({ saved: data.saved.filter((s) => s.id !== id) })
  }

  let displayUrl = data.url
  try {
    const u = new URL(data.url)
    displayUrl = u.host + u.pathname
  } catch {
    // not a valid URL — show raw input
  }

  const typePlaceholders: Record<QrType, string> = {
    url: "Paste a URL…",
    text: "Type your message…",
    email: "Enter email address…",
    wifi: "Network name…",
  }

  return (
    <div className="flex flex-1 justify-center overflow-auto px-6 py-5">
      <div className="flex w-full max-w-[860px] items-start gap-8">
        {/* Left: inputs */}
        <div className="flex flex-1 flex-col gap-5">
          {/* Type selector */}
          <div>
            <p className="mb-2 font-heading text-[0.65rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
              What should the QR code link to?
            </p>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {(
                [
                  { key: "url", label: "🔗 URL" },
                  { key: "text", label: "📝 Text" },
                  { key: "email", label: "📧 Email" },
                  { key: "wifi", label: "📶 Wi-Fi" },
                ] as const
              ).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setQrType(t.key)}
                  className={cn(
                    "rounded-[8px] border px-3 py-1.5 font-heading text-[0.7rem] font-bold transition-all",
                    qrType === t.key
                      ? "border-amber-400 bg-amber-50 text-amber-700"
                      : "border-border bg-card text-muted-foreground hover:border-muted-foreground/20"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <input
              className="w-full rounded-[10px] border border-border bg-card px-3 py-2.5 text-[0.84rem] text-foreground transition-colors outline-none placeholder:text-muted-foreground/40 focus:border-amber-400"
              placeholder={typePlaceholders[qrType]}
              value={data.url}
              onChange={(e) => update({ url: e.target.value })}
            />
            <p className="mt-1 text-[0.65rem] text-muted-foreground/60">
              This is what people see when they scan your code
            </p>
          </div>

          {/* Label */}
          <div>
            <p className="mb-1.5 font-heading text-[0.65rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
              Label (optional)
            </p>
            <input
              className="w-full rounded-[10px] border border-border bg-card px-3 py-2.5 text-[0.84rem] text-foreground transition-colors outline-none placeholder:text-muted-foreground/40 focus:border-amber-400"
              placeholder="Give this QR a name so you remember what it's for"
              value={data.label}
              onChange={(e) => update({ label: e.target.value })}
            />
          </div>

          {/* Colors */}
          <div>
            <p className="mb-2 font-heading text-[0.65rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
              Colors
            </p>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-1">
                <input
                  type="color"
                  className="size-9 cursor-pointer rounded-[8px] border-2 border-border"
                  value={data.fgColor}
                  onChange={(e) => update({ fgColor: e.target.value })}
                />
                <span className="font-heading text-[0.58rem] font-bold text-muted-foreground/60">
                  Code
                </span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <input
                  type="color"
                  className="size-9 cursor-pointer rounded-[8px] border-2 border-border"
                  value={data.bgColor}
                  onChange={(e) => update({ bgColor: e.target.value })}
                />
                <span className="font-heading text-[0.58rem] font-bold text-muted-foreground/60">
                  Background
                </span>
              </div>
              <div className="ml-2 flex flex-col gap-1.5">
                {COLOR_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => update({ fgColor: p.fg, bgColor: p.bg })}
                    className="rounded-[7px] border border-border bg-card px-2.5 py-0.5 font-heading text-[0.62rem] font-bold text-muted-foreground transition-all hover:border-amber-300 hover:bg-amber-50"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Size */}
          <div>
            <p className="mb-2 font-heading text-[0.65rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
              Export Size
            </p>
            <div className="flex gap-1.5">
              {([160, 240, 400, 600] as QrSize[]).map((sz, i) => (
                <button
                  key={sz}
                  onClick={() => update({ size: sz })}
                  className={cn(
                    "flex-1 rounded-[8px] border py-2 text-center transition-all",
                    data.size === sz
                      ? "border-amber-400 bg-amber-50 text-amber-700"
                      : "border-border bg-card text-muted-foreground hover:border-muted-foreground/20"
                  )}
                >
                  <p className="font-heading text-[0.68rem] font-bold">
                    {["Small", "Medium", "Large", "Print"][i]}
                  </p>
                  <p className="text-[0.56rem] text-muted-foreground/60">
                    {sz}px
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Usage tip */}
          <div className="rounded-xl border border-border bg-hatch-bg p-3">
            <p className="mb-1 font-heading text-[0.65rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
              Where to use it
            </p>
            <p className="text-[0.72rem] leading-relaxed text-muted-foreground">
              Print on product labels, flyers, business cards, or posters.
              People scan with their phone camera and go straight to your link.
              Great for market stalls, school fairs, and packaging.
            </p>
          </div>
        </div>

        {/* Right: preview */}
        <div className="flex w-[300px] shrink-0 flex-col items-center gap-3">
          <div className="flex size-[280px] items-center justify-center rounded-2xl border-2 border-border bg-card shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <canvas
              ref={canvasRef}
              width={240}
              height={240}
              className="rounded-[8px]"
            />
          </div>

          <p className="max-w-[260px] text-center font-heading text-[0.75rem] font-bold break-all text-hatch-charcoal">
            {data.label || "Untitled QR Code"}
          </p>
          <p className="max-w-[260px] truncate text-center text-[0.65rem] text-muted-foreground/60">
            {displayUrl}
          </p>

          <div className="flex w-full gap-2">
            <button
              onClick={() => {
                navigator.clipboard?.writeText(data.url).catch(() => {})
                toast.success("URL copied to clipboard!")
              }}
              className="flex-1 rounded-[10px] border border-border bg-card py-2.5 font-heading text-[0.76rem] font-bold text-foreground transition-colors hover:bg-hatch-bg"
            >
              📋 Copy URL
            </button>
            <button
              onClick={() =>
                toast.info("Download wired in backend integration phase")
              }
              className="flex-1 rounded-[10px] bg-amber-500 py-2.5 font-heading text-[0.76rem] font-bold text-white transition-colors hover:bg-amber-600"
            >
              ⬇️ Download PNG
            </button>
          </div>

          <button
            onClick={saveQr}
            className="w-full rounded-[10px] border border-amber-300 bg-amber-50 py-2 font-heading text-[0.74rem] font-bold text-amber-700 transition-colors hover:bg-amber-100"
          >
            💾 Save QR Code
          </button>

          {/* Saved list */}
          {data.saved.length > 0 && (
            <div className="w-full">
              <p className="mb-2 font-heading text-[0.62rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
                Your QR Codes
              </p>
              <div className="flex flex-col gap-1.5">
                {data.saved.map((s) => (
                  <div
                    key={s.id}
                    className="group flex cursor-pointer items-center gap-2 rounded-[8px] border border-border bg-hatch-bg px-2.5 py-2 transition-all hover:border-amber-300 hover:bg-amber-50"
                    onClick={() => loadSaved(s)}
                  >
                    <span className="text-[0.95rem]">{s.icon}</span>
                    <span className="min-w-0 flex-1 truncate font-heading text-[0.72rem] font-bold text-hatch-charcoal">
                      {s.label}
                    </span>
                    <span className="shrink-0 text-[0.6rem] text-muted-foreground/50">
                      {s.date}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeSaved(s.id)
                      }}
                      className="text-[0.6rem] text-muted-foreground/30 opacity-0 transition-all group-hover:opacity-100 hover:text-hatch-pink"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
