import type { SandboxTool } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Plus, X } from "lucide-react"
import { useState } from "react"

interface NoteEntry {
  id: string
  date: string
  title: string
  preview: string
  tags: string[]
  content: string
}

interface PostItData {
  notes: NoteEntry[]
  availableTags: string[]
}

const DEMO_NOTES: NoteEntry[] = [
  {
    id: "n1",
    date: "FEB 20, 2026",
    title: "Cafeteria visit - wow moment",
    preview:
      "Counted 200+ wrappers in ONE lunch period. Mrs. Patterson said she feels guilty every day.",
    tags: ["Observation", "Win"],
    content:
      "Went to the Ridgewood cafeteria during lunch today with @oceandive to observe.\n\nWhat we saw:\n- 220 individual snack wrappers in the main bin before 1pm\n- Mrs. Patterson told us she bags 3 full garbage bags every lunch shift\n- The 'recyclable' bins had candy wrappers in them anyway\n\nThis is the problem. It's real, it's every day, and it embarrasses the staff.\n\nNext step: write a one-paragraph summary for the problem statement tool.",
  },
  {
    id: "n2",
    date: "FEB 15, 2026",
    title: "Compostable materials research",
    preview:
      "Found 3 suppliers. EcoWraps looks most promising - they do small orders for startups.",
    tags: ["Idea"],
    content:
      "Found 3 suppliers. EcoWraps looks most promising - they do small orders for startups. Need to email them.",
  },
  {
    id: "n3",
    date: "FEB 8, 2026",
    title: "Competitor check - what's out there",
    preview:
      "Most eco-packaging companies sell to big food brands, not schools. Nobody is targeting school cafeterias.",
    tags: ["Observation"],
    content:
      "Most eco-packaging companies sell to big food brands, not schools. Nobody is targeting school cafeterias specifically. This is a gap.",
  },
  {
    id: "n4",
    date: "JAN 30, 2026",
    title: "Kickoff - why I care",
    preview:
      "Started EcoSnack because I'm tired of seeing the trash at lunch. If I can solve this for our school, maybe other schools want it too.",
    tags: ["Idea", "To-Do"],
    content:
      "Started EcoSnack because I'm tired of seeing the trash at lunch. If I can solve this for our school, maybe other schools want it too.",
  },
]

const TAG_COLORS: Record<string, string> = {
  Idea: "bg-amber-50 border-amber-300 text-amber-700",
  Observation: "bg-sky-50 border-sky-200 text-cyan-700",
  "To-Do": "bg-rose-50 border-rose-200 text-hatch-pink",
  Win: "bg-green-50 border-green-200 text-sandbox-green",
}

const DEFAULT_TAGS = ["Idea", "Observation", "To-Do", "Win"]

function buildPreview(content: string, fallbackTitle: string) {
  const firstMeaningfulLine = content
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean)

  if (!firstMeaningfulLine) {
    return fallbackTitle
      ? `${fallbackTitle} - start writing...`
      : "Start writing..."
  }

  return firstMeaningfulLine.slice(0, 120)
}

function formatCardDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
    .format(date)
    .toUpperCase()
}

function formatHeaderDate(date: string) {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
    .format(parsed)
    .toUpperCase()
}

function hydratePostItData(tool?: SandboxTool): PostItData {
  const fallback: PostItData = {
    notes: DEMO_NOTES,
    availableTags: DEFAULT_TAGS,
  }

  if (!tool?.data) return fallback

  try {
    const parsed = JSON.parse(tool.data) as PostItData | NoteEntry[]

    if (Array.isArray(parsed)) {
      const notes = parsed.map((note) => ({
        ...note,
        preview: note.preview || buildPreview(note.content, note.title),
      }))
      return {
        notes,
        availableTags: Array.from(
          new Set([...DEFAULT_TAGS, ...notes.flatMap((note) => note.tags)])
        ),
      }
    }

    if (parsed.notes) {
      const notes = parsed.notes.map((note) => ({
        ...note,
        preview: note.preview || buildPreview(note.content, note.title),
      }))
      return {
        notes: notes.length > 0 ? notes : DEMO_NOTES,
        availableTags:
          parsed.availableTags && parsed.availableTags.length > 0
            ? parsed.availableTags
            : Array.from(
                new Set([
                  ...DEFAULT_TAGS,
                  ...notes.flatMap((note) => note.tags),
                ])
              ),
      }
    }

    return fallback
  } catch {
    return fallback
  }
}

export function PostItContent({
  tool,
  onUnsaved,
}: {
  tool?: SandboxTool
  onUnsaved: (data: string) => void
}) {
  const initial = hydratePostItData(tool)
  const [selectedId, setSelectedId] = useState(initial.notes[0]?.id ?? "n1")
  const [notes, setNotes] = useState(initial.notes)
  const [availableTags, setAvailableTags] = useState(initial.availableTags)
  const [newTag, setNewTag] = useState("")
  const selected = notes.find((n) => n.id === selectedId) ?? notes[0]

  function persist(nextNotes: NoteEntry[], nextTags: string[]) {
    onUnsaved(JSON.stringify({ notes: nextNotes, availableTags: nextTags }))
  }

  function updateSelected(patch: Partial<NoteEntry>) {
    setNotes((prev) => {
      const next = prev.map((note) => {
        if (note.id !== selectedId) return note
        const merged = { ...note, ...patch }
        return {
          ...merged,
          preview: buildPreview(merged.content, merged.title),
        }
      })
      persist(next, availableTags)
      return next
    })
  }

  function createEntry() {
    const now = new Date()
    const newEntry: NoteEntry = {
      id: `n-${Date.now()}`,
      date: now.toISOString(),
      title: "New entry",
      preview: "Start writing...",
      tags: ["Idea"],
      content: "",
    }

    setNotes((prev) => {
      const next = [newEntry, ...prev]
      persist(next, availableTags)
      return next
    })
    setSelectedId(newEntry.id)
  }

  function toggleTag(tag: string) {
    if (!selected) return
    const hasTag = selected.tags.includes(tag)
    updateSelected({
      tags: hasTag
        ? selected.tags.filter((value) => value !== tag)
        : [...selected.tags, tag],
    })
  }

  function addCustomTag() {
    const trimmed = newTag.trim()
    if (!trimmed || !selected) return

    const nextTags = availableTags.includes(trimmed)
      ? availableTags
      : [...availableTags, trimmed]
    setAvailableTags(nextTags)
    setNewTag("")

    if (!selected.tags.includes(trimmed)) {
      setNotes((prev) => {
        const next = prev.map((note) =>
          note.id === selected.id
            ? { ...note, tags: [...note.tags, trimmed] }
            : note
        )
        persist(next, nextTags)
        return next
      })
    } else {
      persist(notes, nextTags)
    }
  }

  function removeTag(tag: string) {
    if (!selected) return
    updateSelected({ tags: selected.tags.filter((value) => value !== tag) })
  }

  if (!selected) {
    return null
  }

  return (
    <div className="flex flex-1 gap-5 overflow-hidden px-6 py-5">
      <div className="flex w-[280px] shrink-0 flex-col gap-2 overflow-y-auto">
        {notes.map((n) => (
          <div
            key={n.id}
            onClick={() => setSelectedId(n.id)}
            className={cn(
              "cursor-pointer rounded-xl border bg-hatch-bg px-3.5 py-3 transition-all hover:border-muted-foreground/30 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
              n.id === selectedId
                ? "border-sandbox-green bg-green-50 shadow-[0_2px_12px_rgba(5,150,105,0.1)]"
                : "border-border"
            )}
          >
            <p className="font-heading text-[0.62rem] font-bold tracking-[0.04em] text-muted-foreground/60 uppercase">
              {formatCardDate(new Date(n.date))}
            </p>
            <p className="my-0.5 truncate font-heading text-[0.82rem] font-extrabold text-hatch-charcoal">
              {n.title}
            </p>
            <p className="line-clamp-2 text-[0.72rem] leading-snug text-muted-foreground">
              {n.preview}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {n.tags.map((t) => (
                <span
                  key={t}
                  className={cn(
                    "rounded-full border px-1.5 py-px font-heading text-[0.58rem] font-bold",
                    TAG_COLORS[t] ??
                      "border-border bg-muted text-muted-foreground"
                  )}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
        <button
          onClick={createEntry}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2.5 font-heading text-[0.78rem] font-bold text-muted-foreground/50 transition-all hover:border-sandbox-green hover:bg-green-50 hover:text-sandbox-green"
        >
          <Plus className="size-3.5" /> New Entry
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-[14px] border border-border bg-card">
        <div className="border-b border-border bg-hatch-bg px-4 py-3">
          <p className="font-heading text-[0.65rem] font-bold tracking-[0.04em] text-muted-foreground/60 uppercase">
            {formatHeaderDate(selected.date)}
          </p>
          <input
            className="mt-0.5 w-full border-none bg-transparent font-heading text-[1.15rem] font-black text-hatch-charcoal outline-none placeholder:text-muted-foreground/40 focus:border-b-2 focus:border-sandbox-green"
            value={selected.title}
            onChange={(e) => updateSelected({ title: e.target.value })}
          />
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {selected.tags.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => removeTag(t)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-px font-heading text-[0.6rem] font-bold",
                  TAG_COLORS[t] ??
                    "border-border bg-muted text-muted-foreground"
                )}
              >
                {t}
                <X className="size-2.5" />
              </button>
            ))}
            {availableTags
              .filter((tag) => !selected.tags.includes(tag))
              .map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className="rounded-full border border-dashed border-border px-2 py-px font-heading text-[0.6rem] font-bold text-muted-foreground/60 transition-all hover:border-sandbox-green hover:bg-green-50 hover:text-sandbox-green"
                >
                  + {tag}
                </button>
              ))}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input
              className="h-9 flex-1 rounded-full border border-dashed border-border bg-white px-3 text-[0.72rem] text-foreground outline-none placeholder:text-muted-foreground/40 focus:border-sandbox-green"
              placeholder="Create a custom tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addCustomTag()
                }
              }}
            />
            <button
              type="button"
              onClick={addCustomTag}
              className="rounded-full border border-dashed border-border px-3 py-1.5 font-heading text-[0.68rem] font-bold text-muted-foreground/60 transition-all hover:border-sandbox-green hover:bg-green-50 hover:text-sandbox-green"
            >
              + Tag
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <textarea
            className="font-body size-full resize-none border-none bg-transparent text-[0.88rem] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/40"
            placeholder="Write your thoughts, observations, and ideas here..."
            value={selected.content}
            onChange={(e) => updateSelected({ content: e.target.value })}
          />
        </div>
        <div className="flex items-center border-t border-border px-4 py-2 text-[0.68rem] text-muted-foreground/50">
          <span>
            Entry {notes.findIndex((note) => note.id === selected.id) + 1} of{" "}
            {notes.length}
          </span>
          <span className="ml-auto">{selected.content.length} characters</span>
        </div>
      </div>
    </div>
  )
}
