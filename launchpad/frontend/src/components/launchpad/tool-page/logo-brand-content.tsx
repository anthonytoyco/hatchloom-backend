import type { SandboxTool } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { toast } from "sonner"

interface BrandKit {
  name: string
  tagline: string
  icon: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  headingFont: string
  bodyFont: string
  style: "icon-text" | "text-only" | "icon-only"
}

const ICONS = [
  "🌱", "🔥", "⚡", "🎯", "🌊", "🍀", "🦋", "🌸",
  "🏆", "🚀", "💡", "🎨", "🌿", "🍋", "🦁", "🐝",
]

const HEADING_FONTS = [
  "Outfit", "Inter", "Poppins", "Raleway", "Playfair Display",
  "Montserrat", "Space Grotesk", "DM Serif Display",
]

const BODY_FONTS = [
  "DM Sans", "Inter", "Lato", "Open Sans", "Source Sans 3",
  "Nunito", "Jost", "Work Sans",
]

const COLOR_PRESETS: { name: string; primary: string; secondary: string; accent: string }[] = [
  { name: "Sunset", primary: "#D97706", secondary: "#FFFBEB", accent: "#1E1E2E" },
  { name: "Forest", primary: "#059669", secondary: "#F0FDF4", accent: "#1E1E2E" },
  { name: "Ocean", primary: "#0891B2", secondary: "#F0FDFF", accent: "#1E1E2E" },
  { name: "Berry", primary: "#7C3AED", secondary: "#F5F3FF", accent: "#1E1E2E" },
  { name: "Rose", primary: "#E11D48", secondary: "#FFF1F2", accent: "#1E1E2E" },
  { name: "Slate", primary: "#334155", secondary: "#F8FAFC", accent: "#D97706" },
]

const DEMO: BrandKit = {
  name: "Flavour Butter Co.",
  tagline: "Handmade artisan flavoured butters",
  icon: "🧈",
  primaryColor: "#D97706",
  secondaryColor: "#FFFBEB",
  accentColor: "#1E1E2E",
  headingFont: "Outfit",
  bodyFont: "DM Sans",
  style: "icon-text",
}

export function LogoBrandContent({
  tool,
  onUnsaved,
}: {
  tool: SandboxTool
  onUnsaved: (data: string) => void
}) {
  const initial: BrandKit = (() => {
    try {
      const parsed = JSON.parse(tool.data ?? "{}") as BrandKit
      if (parsed.name !== undefined) return parsed
      return DEMO
    } catch {
      return DEMO
    }
  })()

  const [brand, setBrand] = useState<BrandKit>(initial)
  const [activeTab, setActiveTab] = useState<"identity" | "colors" | "typography">("identity")

  function update(patch: Partial<BrandKit>) {
    setBrand((prev) => {
      const next = { ...prev, ...patch }
      onUnsaved(JSON.stringify(next))
      return next
    })
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left: editor */}
      <div className="flex w-[260px] shrink-0 flex-col overflow-y-auto border-r border-border bg-hatch-bg">
        {/* Tabs */}
        <div className="flex border-b border-border">
          {(["identity", "colors", "typography"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-2.5 font-heading text-[0.62rem] font-extrabold tracking-[0.04em] uppercase transition-all",
                activeTab === tab
                  ? "border-b-2 border-amber-500 text-amber-700"
                  : "text-muted-foreground/60 hover:text-muted-foreground"
              )}
            >
              {tab === "identity" ? "Brand" : tab === "colors" ? "Colors" : "Fonts"}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4 p-3">
          {activeTab === "identity" && (
            <>
              <div>
                <p className="mb-1.5 font-heading text-[0.6rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
                  Business Name
                </p>
                <input
                  className="w-full rounded-[8px] border border-border bg-card px-2.5 py-2 text-[0.82rem] text-foreground outline-none focus:border-amber-400"
                  value={brand.name}
                  onChange={(e) => update({ name: e.target.value })}
                  placeholder="Your business name"
                />
              </div>
              <div>
                <p className="mb-1.5 font-heading text-[0.6rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
                  Tagline
                </p>
                <input
                  className="w-full rounded-[8px] border border-border bg-card px-2.5 py-2 text-[0.82rem] text-foreground outline-none focus:border-amber-400"
                  value={brand.tagline}
                  onChange={(e) => update({ tagline: e.target.value })}
                  placeholder="Short description"
                />
              </div>
              <div>
                <p className="mb-1.5 font-heading text-[0.6rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
                  Logo Style
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["icon-text", "text-only", "icon-only"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => update({ style: s })}
                      className={cn(
                        "rounded-[7px] border py-2 font-heading text-[0.58rem] font-bold text-center transition-all",
                        brand.style === s
                          ? "border-amber-400 bg-amber-50 text-amber-700"
                          : "border-border bg-card text-muted-foreground hover:border-amber-300"
                      )}
                    >
                      {s === "icon-text" ? "Icon + Text" : s === "text-only" ? "Text Only" : "Icon Only"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 font-heading text-[0.6rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
                  Logo Icon
                </p>
                <div className="grid grid-cols-8 gap-1">
                  {ICONS.map((ic) => (
                    <button
                      key={ic}
                      onClick={() => update({ icon: ic })}
                      className={cn(
                        "flex items-center justify-center rounded-[6px] py-1.5 text-[1rem] transition-all",
                        brand.icon === ic
                          ? "bg-amber-100 ring-2 ring-amber-400"
                          : "hover:bg-hatch-bg"
                      )}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "colors" && (
            <>
              <div>
                <p className="mb-2 font-heading text-[0.6rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
                  Presets
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {COLOR_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => update({ primaryColor: p.primary, secondaryColor: p.secondary, accentColor: p.accent })}
                      className="flex flex-col items-center gap-1 rounded-[8px] border border-border p-1.5 transition-all hover:border-amber-300"
                    >
                      <div className="flex gap-0.5">
                        <div className="size-3 rounded-full" style={{ background: p.primary }} />
                        <div className="size-3 rounded-full border border-border" style={{ background: p.secondary }} />
                        <div className="size-3 rounded-full" style={{ background: p.accent }} />
                      </div>
                      <span className="font-heading text-[0.56rem] font-bold text-muted-foreground">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              {[
                { key: "primaryColor" as const, label: "Primary" },
                { key: "secondaryColor" as const, label: "Background" },
                { key: "accentColor" as const, label: "Accent / Text" },
              ].map((c) => (
                <div key={c.key}>
                  <p className="mb-1.5 font-heading text-[0.6rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
                    {c.label}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      className="size-8 cursor-pointer rounded-[6px] border border-border"
                      value={brand[c.key]}
                      onChange={(e) => update({ [c.key]: e.target.value })}
                    />
                    <input
                      className="flex-1 rounded-[7px] border border-border bg-card px-2 py-1 font-mono text-[0.68rem] outline-none focus:border-amber-400"
                      value={brand[c.key]}
                      onChange={(e) => update({ [c.key]: e.target.value })}
                    />
                  </div>
                </div>
              ))}
            </>
          )}

          {activeTab === "typography" && (
            <>
              {[
                { key: "headingFont" as const, label: "Heading Font", options: HEADING_FONTS },
                { key: "bodyFont" as const, label: "Body Font", options: BODY_FONTS },
              ].map((f) => (
                <div key={f.key}>
                  <p className="mb-1.5 font-heading text-[0.6rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
                    {f.label}
                  </p>
                  <div className="flex flex-col gap-1">
                    {f.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => update({ [f.key]: opt })}
                        className={cn(
                          "rounded-[7px] border px-2.5 py-1.5 text-left text-[0.78rem] transition-all",
                          brand[f.key] === opt
                            ? "border-amber-400 bg-amber-50 font-semibold text-amber-700"
                            : "border-border bg-card text-muted-foreground hover:border-amber-300"
                        )}
                        style={{ fontFamily: opt }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Right: live preview */}
      <div className="flex flex-1 flex-col items-center justify-start gap-6 overflow-auto p-6" style={{ background: "#F1F5F9" }}>
        <p className="font-heading text-[0.65rem] font-extrabold tracking-[0.06em] text-slate-400 uppercase">
          Brand Preview
        </p>

        {/* Logo mark */}
        <div
          className="flex w-full max-w-md flex-col items-center gap-2 rounded-2xl p-8 shadow-md"
          style={{ background: brand.secondaryColor }}
        >
          <div className="mb-1 flex items-center gap-3">
            {brand.style !== "text-only" && (
              <span className="text-4xl">{brand.icon}</span>
            )}
            {brand.style !== "icon-only" && (
              <div>
                <p
                  className="font-black leading-none"
                  style={{
                    fontFamily: brand.headingFont,
                    color: brand.primaryColor,
                    fontSize: "1.6rem",
                  }}
                >
                  {brand.name || "Your Brand"}
                </p>
                {brand.tagline && (
                  <p
                    className="mt-0.5 text-[0.78rem]"
                    style={{ fontFamily: brand.bodyFont, color: brand.accentColor, opacity: 0.7 }}
                  >
                    {brand.tagline}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Business card */}
        <div
          className="w-full max-w-md overflow-hidden rounded-xl shadow-md"
          style={{ background: brand.primaryColor }}
        >
          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <p
                className="font-black text-white"
                style={{ fontFamily: brand.headingFont, fontSize: "1.1rem" }}
              >
                {brand.name || "Your Brand"}
              </p>
              <p
                className="mt-0.5 text-white/70"
                style={{ fontFamily: brand.bodyFont, fontSize: "0.74rem" }}
              >
                {brand.tagline || "Your tagline"}
              </p>
            </div>
            {brand.style !== "text-only" && (
              <span className="text-3xl opacity-90">{brand.icon}</span>
            )}
          </div>
          <div
            className="px-6 py-3"
            style={{ background: brand.accentColor }}
          >
            <p
              className="text-white/60"
              style={{ fontFamily: brand.bodyFont, fontSize: "0.65rem" }}
            >
              hello@{brand.name.toLowerCase().replace(/\s+/g, "")}.com · yourbusiness.com
            </p>
          </div>
        </div>

        {/* Color palette */}
        <div className="w-full max-w-md rounded-xl border border-border bg-white p-4 shadow-sm">
          <p className="mb-3 font-heading text-[0.62rem] font-extrabold tracking-[0.04em] text-muted-foreground/50 uppercase">
            Brand Colors
          </p>
          <div className="flex gap-3">
            {[
              { color: brand.primaryColor, label: "Primary" },
              { color: brand.secondaryColor, label: "Background" },
              { color: brand.accentColor, label: "Accent" },
            ].map((c) => (
              <div key={c.label} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className="h-12 w-full rounded-[8px] border border-border/40 shadow-sm"
                  style={{ background: c.color }}
                />
                <p className="font-heading text-[0.6rem] font-bold text-muted-foreground">{c.label}</p>
                <p className="font-mono text-[0.58rem] text-muted-foreground/60">{c.color.toUpperCase()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Typography preview */}
        <div className="w-full max-w-md rounded-xl border border-border bg-white p-4 shadow-sm">
          <p className="mb-3 font-heading text-[0.62rem] font-extrabold tracking-[0.04em] text-muted-foreground/50 uppercase">
            Typography
          </p>
          <p
            className="font-black"
            style={{ fontFamily: brand.headingFont, color: brand.accentColor, fontSize: "1.4rem" }}
          >
            {brand.headingFont}
          </p>
          <p
            className="mt-1"
            style={{ fontFamily: brand.bodyFont, color: brand.accentColor, opacity: 0.6, fontSize: "0.88rem" }}
          >
            {brand.bodyFont} — body text goes here
          </p>
        </div>

        <button
          onClick={() => toast.success("Brand kit copied to clipboard!")}
          className="rounded-[10px] bg-amber-500 px-6 py-2.5 font-heading text-[0.78rem] font-bold text-white transition-colors hover:bg-amber-600"
        >
          Export Brand Kit
        </button>
      </div>
    </div>
  )
}
