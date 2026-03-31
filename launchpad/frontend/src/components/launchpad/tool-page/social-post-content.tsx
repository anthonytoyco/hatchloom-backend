import type { SandboxTool } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { toast } from "sonner"

type PostFormat = "square" | "story" | "landscape"
type Platform = "ig" | "tt" | "tw"

interface PostData {
  headline: string
  subline: string
  caption: string
  ctaText: string
  bgIndex: number
  format: PostFormat
  platform: Platform
}

const BACKGROUNDS: { gradient: string; textColor: string }[] = [
  { gradient: "linear-gradient(135deg,#FFFBEB,#FDE68A)", textColor: "#92400E" },
  { gradient: "linear-gradient(135deg,#059669,#34D399)", textColor: "#ffffff" },
  { gradient: "linear-gradient(135deg,#FF1F5A,#FF6B8A)", textColor: "#ffffff" },
  { gradient: "linear-gradient(135deg,#1E1E2E,#374151)", textColor: "#ffffff" },
  { gradient: "linear-gradient(135deg,#F0FBFD,#BAE6F0)", textColor: "#1E1E2E" },
  { gradient: "linear-gradient(135deg,#EEF2FF,#C7D2FE)", textColor: "#312E81" },
]

const CTA_OPTIONS = ["Try it Wednesday!", "Order now", "Link in bio", ""]

const DEMO: PostData = {
  headline: "🧈 NEW: Chili Lime Butter!",
  subline: "Our spiciest flavour yet. Available now at the school cafeteria.",
  caption:
    "Our newest flavour just dropped! 🌶️ Say hello to Chili Lime Butter — it's got a kick. Grab yours at the school cafeteria every Wednesday.\n\n#FlavourButterCo #StudentBusiness #ChiliLime #SupportLocalStudents",
  ctaText: "Try it Wednesday!",
  bgIndex: 0,
  format: "square",
  platform: "ig",
}

export function SocialPostContent({
  tool,
  onUnsaved,
}: {
  tool: SandboxTool
  onUnsaved: (data: string) => void
}) {
  const initial: PostData = (() => {
    try {
      const parsed = JSON.parse(tool.data ?? "{}") as PostData
      if (parsed.headline !== undefined) return parsed
      return DEMO
    } catch {
      return DEMO
    }
  })()

  const [data, setData] = useState<PostData>(initial)

  function update(patch: Partial<PostData>) {
    setData((prev) => {
      const next = { ...prev, ...patch }
      onUnsaved(JSON.stringify(next))
      return next
    })
  }

  const bg = BACKGROUNDS[data.bgIndex]

  // Derive caption lines for preview
  const captionLines = data.caption.split("\n").filter((l) => l.trim())
  const hashLines = captionLines.filter((l) => l.trim().startsWith("#"))
  const textLines = captionLines.filter((l) => !l.trim().startsWith("#"))

  const postAspect =
    data.format === "square"
      ? "aspect-square"
      : data.format === "story"
        ? "aspect-[9/16]"
        : "aspect-video"

  const platformLabel =
    data.platform === "ig"
      ? "Instagram"
      : data.platform === "tt"
        ? "TikTok"
        : "X / Twitter"

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Settings panel */}
      <div className="flex w-70 shrink-0 flex-col gap-4 overflow-y-auto border-r border-border bg-hatch-bg p-4">
        {/* Format */}
        <div>
          <p className="mb-2 font-heading text-[0.62rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
            Post Format
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {(
              [
                {
                  key: "square",
                  icon: "◻️",
                  name: "Square",
                  size: "1080×1080",
                },
                { key: "story", icon: "📱", name: "Story", size: "1080×1920" },
                {
                  key: "landscape",
                  icon: "🖥",
                  name: "Landscape",
                  size: "1920×1080",
                },
              ] as const
            ).map((f) => (
              <button
                key={f.key}
                onClick={() => update({ format: f.key })}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-[9px] border px-1 py-2 text-center transition-all",
                  data.format === f.key
                    ? "border-amber-400 bg-amber-50"
                    : "border-border bg-card hover:border-muted-foreground/20"
                )}
              >
                <span className="text-[1.1rem]">{f.icon}</span>
                <span className="font-heading text-[0.62rem] font-bold text-hatch-charcoal">
                  {f.name}
                </span>
                <span className="text-[0.54rem] text-muted-foreground/60">
                  {f.size}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Platform */}
        <div>
          <p className="mb-2 font-heading text-[0.62rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
            Platform Preview
          </p>
          <div className="flex gap-1.5">
            {(
              [
                { key: "ig", label: "📸 Instagram" },
                { key: "tt", label: "🎵 TikTok" },
                { key: "tw", label: "🐦 X/Twitter" },
              ] as const
            ).map((p) => (
              <button
                key={p.key}
                onClick={() => update({ platform: p.key })}
                className={cn(
                  "flex-1 rounded-[8px] border py-1.5 font-heading text-[0.62rem] font-bold transition-all",
                  data.platform === p.key
                    ? "border-amber-400 bg-amber-50 text-amber-700"
                    : "border-border bg-card text-muted-foreground hover:border-muted-foreground/20"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Background */}
        <div>
          <p className="mb-2 font-heading text-[0.62rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
            Background
          </p>
          <div className="grid grid-cols-6 gap-1.5">
            {BACKGROUNDS.map((bg, i) => (
              <button
                key={i}
                style={{ background: bg.gradient }}
                onClick={() => update({ bgIndex: i })}
                className={cn(
                  "aspect-square rounded-[6px] border-2 transition-all hover:scale-110",
                  data.bgIndex === i
                    ? "border-hatch-charcoal shadow-sm"
                    : "border-transparent"
                )}
              />
            ))}
          </div>
        </div>

        {/* Photo upload */}
        <div>
          <p className="mb-2 font-heading text-[0.62rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
            Upload Photo (optional)
          </p>
          <button
            onClick={() =>
              toast.info("Photo upload wired in backend integration phase")
            }
            className="w-full rounded-[9px] border-2 border-dashed border-border py-3 text-center text-[0.74rem] text-muted-foreground/60 transition-all hover:border-amber-300 hover:bg-amber-50"
          >
            📷 Click to upload a background photo
          </button>
        </div>

        {/* Headline */}
        <div>
          <label className="mb-1 flex items-center justify-between">
            <span className="font-heading text-[0.62rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
              Headline
            </span>
            <span className="text-[0.6rem] text-muted-foreground/50">
              {data.headline.length}/60
            </span>
          </label>
          <textarea
            className="min-h-12.5 w-full resize-none rounded-[9px] border border-border bg-card px-2.5 py-2 text-[0.8rem] leading-relaxed text-foreground transition-colors outline-none placeholder:text-muted-foreground/40 focus:border-amber-400"
            placeholder="Your main message"
            value={data.headline}
            onChange={(e) => update({ headline: e.target.value })}
          />
        </div>

        {/* Subline */}
        <div>
          <label className="mb-1 flex items-center justify-between">
            <span className="font-heading text-[0.62rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
              Subline
            </span>
            <span className="text-[0.6rem] text-muted-foreground/50">
              {data.subline.length}/120
            </span>
          </label>
          <textarea
            className="min-h-10 w-full resize-none rounded-[9px] border border-border bg-card px-2.5 py-2 text-[0.8rem] leading-relaxed text-foreground transition-colors outline-none placeholder:text-muted-foreground/40 focus:border-amber-400"
            placeholder="Supporting info"
            value={data.subline}
            onChange={(e) => update({ subline: e.target.value })}
          />
        </div>

        {/* CTA */}
        <div>
          <p className="mb-2 font-heading text-[0.62rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
            Call to Action
          </p>
          <div className="flex flex-wrap gap-1.5">
            {CTA_OPTIONS.map((cta, i) => (
              <button
                key={i}
                onClick={() => update({ ctaText: cta })}
                className={cn(
                  "rounded-[7px] border px-2.5 py-1 font-heading text-[0.65rem] font-bold transition-all",
                  data.ctaText === cta
                    ? "border-amber-400 bg-amber-50 text-amber-700"
                    : "border-border bg-card text-muted-foreground hover:border-muted-foreground/20"
                )}
              >
                {cta === "" ? "None" : cta}
              </button>
            ))}
          </div>
        </div>

        {/* Caption */}
        <div>
          <p className="mb-1 font-heading text-[0.62rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
            Caption & Hashtags
          </p>
          <textarea
            className="min-h-20 w-full resize-y rounded-[9px] border border-border bg-card px-2.5 py-2 text-[0.76rem] leading-relaxed text-foreground transition-colors outline-none placeholder:text-muted-foreground/40 focus:border-amber-400"
            placeholder="Write your caption and add #hashtags at the end..."
            value={data.caption}
            onChange={(e) => update({ caption: e.target.value })}
          />
        </div>
      </div>

      {/* Preview area */}
      <div className="flex flex-1 items-center justify-center overflow-auto bg-[#E5E7EB] p-6">
        <div className="flex flex-col items-center gap-3">
          {/* Phone mockup */}
          <div className="w-[320px] rounded-[32px] bg-[#1E1E2E] p-2 shadow-[0_12px_48px_rgba(0,0,0,0.2)]">
            <div className="overflow-hidden rounded-[26px] bg-black">
              {/* Notch */}
              <div className="mx-auto h-5.5 w-25 rounded-b-[14px] bg-[#1E1E2E]" />

              {/* Post image */}
              <div className={cn("relative w-76 overflow-hidden", postAspect)}>
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
                  style={{ background: bg.gradient, color: bg.textColor }}
                >
                  <p
                    className="mb-1 font-heading leading-snug font-black"
                    style={{ fontSize: "clamp(14px, 4vw, 22px)" }}
                  >
                    {data.headline || "Your headline here"}
                  </p>
                  <p className="text-[0.72rem] leading-snug opacity-85">
                    {data.subline || "Your subline here"}
                  </p>
                  {data.ctaText && (
                    <span
                      className="mt-3 inline-block rounded-full px-4 py-1.5 font-heading text-[0.7rem] font-extrabold"
                      style={{
                        background: bg.textColor,
                        color: bg.gradient.includes("#fff")
                          ? "#1E1E2E"
                          : "#FFFBEB",
                      }}
                    >
                      {data.ctaText}
                    </span>
                  )}
                  <span className="absolute bottom-2 left-1/2 -translate-x-1/2 font-heading text-[0.58rem] font-bold opacity-40">
                    @yourbusiness
                  </span>
                </div>
              </div>

              {/* IG action bar */}
              <div className="flex items-center gap-2 bg-black px-3 py-2">
                <div className="flex flex-1 gap-3 opacity-80">
                  <span className="text-lg text-white">♡</span>
                  <span className="text-lg text-white">💬</span>
                  <span className="text-lg text-white">➤</span>
                </div>
                <div className="flex flex-1 justify-center gap-0.75">
                  <div className="size-1.25 rounded-full bg-white" />
                  <div className="size-1.25 rounded-full bg-white/30" />
                  <div className="size-1.25 rounded-full bg-white/30" />
                </div>
                <div className="flex-1 text-right text-lg text-white/80">
                  🔖
                </div>
              </div>

              {/* Caption */}
              <div className="bg-black px-3 py-2">
                <p className="font-heading text-[0.68rem] font-bold text-white">
                  yourbusiness
                </p>
                <p className="mt-0.5 text-[0.65rem] leading-snug text-white/80">
                  {textLines.join(" ").substring(0, 100) ||
                    "Your caption here..."}
                </p>
                {hashLines.length > 0 && (
                  <p className="mt-0.5 text-[0.6rem] text-[#8B9CF7]">
                    {hashLines.join(" ").substring(0, 80)}
                  </p>
                )}
              </div>
            </div>
          </div>

          <p className="font-heading text-[0.68rem] font-bold text-muted-foreground/60">
            {data.format.charAt(0).toUpperCase() + data.format.slice(1)} ·{" "}
            {platformLabel}
          </p>
        </div>
      </div>
    </div>
  )
}
