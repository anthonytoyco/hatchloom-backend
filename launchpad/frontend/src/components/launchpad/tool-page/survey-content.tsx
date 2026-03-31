import type { SandboxTool } from "@/lib/types"
import { cn } from "@/lib/utils"
import { GripVertical, Plus, Star, Trash2 } from "lucide-react"
import { useCallback, useState } from "react"
import { toast } from "sonner"

type QuestionType = "short" | "long" | "rating" | "choice" | "yesno"

interface Choice {
  id: string
  text: string
}

interface Question {
  id: string
  type: QuestionType
  prompt: string
  required: boolean
  choices?: Choice[]
}

interface Response {
  id: string
  date: string
  answers: Record<string, string | number>
}

interface SurveyData {
  title: string
  description: string
  questions: Question[]
  responses: Response[]
}

const TYPE_LABELS: Record<QuestionType, { label: string; icon: string }> = {
  short: { label: "Short Answer", icon: "✏️" },
  long: { label: "Paragraph", icon: "📝" },
  rating: { label: "Star Rating", icon: "⭐" },
  choice: { label: "Multiple Choice", icon: "🔘" },
  yesno: { label: "Yes / No", icon: "✅" },
}

const DEMO: SurveyData = {
  title: "Flavour Butter Co. — Customer Feedback",
  description: "Help us improve! Answers take less than 2 minutes.",
  questions: [
    {
      id: "q1",
      type: "rating",
      prompt: "How would you rate the flavour of our butter?",
      required: true,
    },
    {
      id: "q2",
      type: "choice",
      prompt: "Which flavour did you try?",
      required: true,
      choices: [
        { id: "c1", text: "Garlic Herb" },
        { id: "c2", text: "Honey Cinnamon" },
        { id: "c3", text: "Classic Salted" },
        { id: "c4", text: "Chili Lime" },
      ],
    },
    {
      id: "q3",
      type: "yesno",
      prompt: "Would you recommend us to a friend?",
      required: true,
    },
    {
      id: "q4",
      type: "long",
      prompt: "Any other feedback or suggestions?",
      required: false,
    },
  ],
  responses: [
    { id: "r1", date: "Feb 20", answers: { q1: 5, q2: "Garlic Herb", q3: "Yes", q4: "Loved it!" } },
    { id: "r2", date: "Feb 21", answers: { q1: 4, q2: "Honey Cinnamon", q3: "Yes", q4: "" } },
    { id: "r3", date: "Feb 22", answers: { q1: 5, q2: "Chili Lime", q3: "Yes", q4: "More spice next time" } },
  ],
}

function StarRating({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          type="button"
        >
          <Star
            className={cn(
              "size-6 transition-colors",
              (hover || value) >= n
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-muted-foreground/30"
            )}
          />
        </button>
      ))}
    </div>
  )
}

export function SurveyContent({
  tool,
  onUnsaved,
}: {
  tool: SandboxTool
  onUnsaved: (data: string) => void
}) {
  const initial: SurveyData = (() => {
    try {
      const parsed = JSON.parse(tool.data ?? "{}") as SurveyData
      if (parsed.questions?.length) return parsed
      return DEMO
    } catch {
      return DEMO
    }
  })()

  const [data, setData] = useState<SurveyData>(initial)
  const [tab, setTab] = useState<"builder" | "preview" | "responses">("builder")
  const [selectedQId, setSelectedQId] = useState<string | null>(data.questions[0]?.id ?? null)
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, string | number>>({})
  const [submitted, setSubmitted] = useState(false)

  function persist(next: SurveyData) {
    onUnsaved(JSON.stringify(next))
    setData(next)
  }

  function updateMeta(patch: Partial<SurveyData>) {
    persist({ ...data, ...patch })
  }

  const addQuestion = useCallback(
    (type: QuestionType) => {
      const now = Date.now()
      const q: Question = {
        id: `q-${now}`,
        type,
        prompt: TYPE_LABELS[type].label + " question",
        required: false,
        choices:
          type === "choice"
            ? [
                { id: `c-${now}`, text: "Option 1" },
                { id: `c-${now + 1}`, text: "Option 2" },
              ]
            : undefined,
      }
      setData((prev) => {
        const next = { ...prev, questions: [...prev.questions, q] }
        onUnsaved(JSON.stringify(next))
        return next
      })
      setSelectedQId(q.id)
    },
    [onUnsaved]
  )

  function updateQuestion(id: string, patch: Partial<Question>) {
    persist({
      ...data,
      questions: data.questions.map((q) => (q.id === id ? { ...q, ...patch } : q)),
    })
  }

  function removeQuestion(id: string) {
    const next = { ...data, questions: data.questions.filter((q) => q.id !== id) }
    persist(next)
    if (selectedQId === id) setSelectedQId(next.questions[0]?.id ?? null)
  }

  const addChoice = useCallback(
    (qId: string) => {
      const id = `c-${Date.now()}`
      setData((prev) => {
        const next = {
          ...prev,
          questions: prev.questions.map((q) =>
            q.id === qId
              ? { ...q, choices: [...(q.choices ?? []), { id, text: "New option" }] }
              : q
          ),
        }
        onUnsaved(JSON.stringify(next))
        return next
      })
    },
    [onUnsaved]
  )

  function updateChoice(qId: string, cId: string, text: string) {
    persist({
      ...data,
      questions: data.questions.map((q) =>
        q.id === qId
          ? { ...q, choices: q.choices?.map((c) => (c.id === cId ? { ...c, text } : c)) }
          : q
      ),
    })
  }

  const submitPreview = useCallback(() => {
    setData((prev) => {
      const unanswered = prev.questions.filter(
        (q) => q.required && !previewAnswers[q.id]
      )
      if (unanswered.length > 0) {
        toast.error("Please answer all required questions.")
        return prev
      }
      const resp: Response = {
        id: `r-${Date.now()}`,
        date: "Today",
        answers: previewAnswers,
      }
      const next = { ...prev, responses: [...prev.responses, resp] }
      onUnsaved(JSON.stringify(next))
      setPreviewAnswers({})
      setSubmitted(true)
      toast.success("Response recorded!")
      return next
    })
  }, [previewAnswers, onUnsaved])

  const selectedQ = data.questions.find((q) => q.id === selectedQId)

  const avgRating =
    data.responses.length > 0
      ? (
          data.responses
            .map((r) => {
              const ratingQ = data.questions.find((q) => q.type === "rating")
              return ratingQ ? Number(r.answers[ratingQ.id] ?? 0) : 0
            })
            .reduce((a, b) => a + b, 0) / data.responses.length
        ).toFixed(1)
      : "—"

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left sidebar: question list */}
      <div className="flex w-[220px] shrink-0 flex-col overflow-y-auto border-r border-border bg-hatch-bg">
        {/* Tabs */}
        <div className="flex border-b border-border">
          {(["builder", "preview", "responses"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setSubmitted(false) }}
              className={cn(
                "flex-1 py-2.5 font-heading text-[0.58rem] font-extrabold tracking-[0.04em] uppercase transition-all",
                tab === t
                  ? "border-b-2 border-amber-500 text-amber-700"
                  : "text-muted-foreground/60 hover:text-muted-foreground"
              )}
            >
              {t === "builder" ? "Build" : t === "preview" ? "Preview" : "Responses"}
            </button>
          ))}
        </div>

        {tab === "builder" && (
          <div className="flex flex-col gap-3 p-3">
            <div>
              <p className="mb-1 font-heading text-[0.6rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
                Survey Title
              </p>
              <input
                className="w-full rounded-[7px] border border-border bg-card px-2 py-1.5 text-[0.74rem] outline-none focus:border-amber-400"
                value={data.title}
                onChange={(e) => updateMeta({ title: e.target.value })}
              />
            </div>
            <div>
              <p className="mb-1.5 font-heading text-[0.6rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
                Questions ({data.questions.length})
              </p>
              <div className="flex flex-col gap-1">
                {data.questions.map((q, i) => (
                  <div
                    key={q.id}
                    onClick={() => setSelectedQId(q.id)}
                    className={cn(
                      "group flex cursor-pointer items-center gap-1.5 rounded-[7px] border px-2 py-1.5 transition-all",
                      selectedQId === q.id
                        ? "border-amber-400 bg-amber-50"
                        : "border-border bg-card hover:border-amber-300"
                    )}
                  >
                    <GripVertical className="size-3 shrink-0 text-muted-foreground/30" />
                    <span className="text-[0.75rem]">{TYPE_LABELS[q.type].icon}</span>
                    <p className="min-w-0 flex-1 truncate font-heading text-[0.65rem] font-bold text-hatch-charcoal">
                      Q{i + 1}. {q.prompt}
                    </p>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeQuestion(q.id) }}
                      className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 className="size-2.5 text-hatch-pink" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1.5 font-heading text-[0.6rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
                Add Question
              </p>
              <div className="flex flex-col gap-1">
                {(Object.keys(TYPE_LABELS) as QuestionType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => addQuestion(type)}
                    className="flex items-center gap-2 rounded-[7px] border border-dashed border-border px-2 py-1.5 text-left transition-all hover:border-amber-300 hover:bg-amber-50"
                  >
                    <span className="text-[0.75rem]">{TYPE_LABELS[type].icon}</span>
                    <span className="font-heading text-[0.65rem] font-bold text-muted-foreground">
                      {TYPE_LABELS[type].label}
                    </span>
                    <Plus className="ml-auto size-2.5 text-muted-foreground/40" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {(tab === "preview" || tab === "responses") && (
          <div className="flex flex-col gap-2 p-3">
            <div className="rounded-[8px] border border-border bg-card px-3 py-2.5">
              <p className="font-heading text-[0.6rem] font-bold text-muted-foreground/60 uppercase">
                Responses
              </p>
              <p className="font-heading text-xl font-black text-hatch-charcoal">
                {data.responses.length}
              </p>
            </div>
            <div className="rounded-[8px] border border-amber-200 bg-amber-50 px-3 py-2.5">
              <p className="font-heading text-[0.6rem] font-bold text-muted-foreground/60 uppercase">
                Avg Rating
              </p>
              <p className="font-heading text-xl font-black text-amber-700">{avgRating}</p>
            </div>
          </div>
        )}
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {tab === "builder" && selectedQ && (
          <div className="flex flex-1 flex-col gap-5 overflow-auto p-5">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="mb-3 font-heading text-[0.65rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
                Edit Question
              </p>
              <div className="flex flex-col gap-3">
                <div>
                  <p className="mb-1 font-heading text-[0.6rem] font-bold text-muted-foreground/60 uppercase">
                    Question Text
                  </p>
                  <textarea
                    className="min-h-16 w-full resize-none rounded-[8px] border border-border bg-hatch-bg px-3 py-2 text-[0.82rem] outline-none focus:border-amber-400"
                    value={selectedQ.prompt}
                    onChange={(e) => updateQuestion(selectedQ.id, { prompt: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="req"
                    checked={selectedQ.required}
                    onChange={(e) => updateQuestion(selectedQ.id, { required: e.target.checked })}
                    className="size-3.5 accent-amber-500"
                  />
                  <label htmlFor="req" className="font-heading text-[0.7rem] font-bold text-muted-foreground">
                    Required
                  </label>
                </div>
                {selectedQ.type === "choice" && (
                  <div>
                    <p className="mb-1.5 font-heading text-[0.6rem] font-bold text-muted-foreground/60 uppercase">
                      Options
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {selectedQ.choices?.map((c) => (
                        <input
                          key={c.id}
                          className="w-full rounded-[7px] border border-border bg-hatch-bg px-2.5 py-1.5 text-[0.78rem] outline-none focus:border-amber-400"
                          value={c.text}
                          onChange={(e) => updateChoice(selectedQ.id, c.id, e.target.value)}
                        />
                      ))}
                      <button
                        onClick={() => addChoice(selectedQ.id)}
                        className="flex items-center gap-1 rounded-[7px] border border-dashed border-border px-2.5 py-1.5 font-heading text-[0.68rem] font-bold text-muted-foreground/50 transition-all hover:border-amber-300 hover:text-amber-600"
                      >
                        <Plus className="size-3" /> Add option
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "preview" && (
          <div className="flex flex-1 flex-col items-center overflow-auto bg-[#F7F8FC] p-6">
            {submitted ? (
              <div className="flex flex-col items-center gap-4 py-12 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-green-100">
                  <Star className="size-8 fill-green-500 text-green-500" />
                </div>
                <p className="font-heading text-xl font-black text-hatch-charcoal">Thanks for your response!</p>
                <p className="text-[0.82rem] text-muted-foreground">Your feedback has been recorded.</p>
                <button
                  onClick={() => { setSubmitted(false); setPreviewAnswers({}) }}
                  className="rounded-[9px] border border-border bg-card px-4 py-2 font-heading text-[0.74rem] font-bold text-muted-foreground transition-all hover:bg-hatch-bg"
                >
                  Submit another
                </button>
              </div>
            ) : (
              <div className="w-full max-w-xl">
                <div className="mb-5 rounded-xl border border-border bg-white p-5 shadow-sm">
                  <p className="font-heading text-xl font-black text-hatch-charcoal">{data.title}</p>
                  {data.description && (
                    <p className="mt-1 text-[0.82rem] text-muted-foreground">{data.description}</p>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  {data.questions.map((q, i) => (
                    <div key={q.id} className="rounded-xl border border-border bg-white p-4 shadow-sm">
                      <p className="mb-2 font-heading text-[0.84rem] font-bold text-hatch-charcoal">
                        {i + 1}. {q.prompt}
                        {q.required && <span className="ml-1 text-hatch-pink">*</span>}
                      </p>
                      {q.type === "short" && (
                        <input
                          className="w-full rounded-[8px] border border-border bg-hatch-bg px-3 py-2 text-[0.82rem] outline-none focus:border-amber-400"
                          placeholder="Your answer"
                          value={String(previewAnswers[q.id] ?? "")}
                          onChange={(e) => setPreviewAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                        />
                      )}
                      {q.type === "long" && (
                        <textarea
                          className="min-h-20 w-full resize-none rounded-[8px] border border-border bg-hatch-bg px-3 py-2 text-[0.82rem] outline-none focus:border-amber-400"
                          placeholder="Your answer"
                          value={String(previewAnswers[q.id] ?? "")}
                          onChange={(e) => setPreviewAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                        />
                      )}
                      {q.type === "rating" && (
                        <StarRating
                          value={Number(previewAnswers[q.id] ?? 0)}
                          onChange={(v) => setPreviewAnswers((p) => ({ ...p, [q.id]: v }))}
                        />
                      )}
                      {q.type === "choice" && (
                        <div className="flex flex-col gap-1.5">
                          {q.choices?.map((c) => (
                            <label key={c.id} className="flex cursor-pointer items-center gap-2">
                              <input
                                type="radio"
                                name={q.id}
                                checked={previewAnswers[q.id] === c.text}
                                onChange={() => setPreviewAnswers((p) => ({ ...p, [q.id]: c.text }))}
                                className="accent-amber-500"
                              />
                              <span className="text-[0.82rem] text-foreground">{c.text}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      {q.type === "yesno" && (
                        <div className="flex gap-2">
                          {["Yes", "No"].map((opt) => (
                            <button
                              key={opt}
                              onClick={() => setPreviewAnswers((p) => ({ ...p, [q.id]: opt }))}
                              className={cn(
                                "rounded-[8px] border px-5 py-1.5 font-heading text-[0.74rem] font-bold transition-all",
                                previewAnswers[q.id] === opt
                                  ? "border-amber-400 bg-amber-50 text-amber-700"
                                  : "border-border bg-hatch-bg text-muted-foreground hover:border-amber-300"
                              )}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={submitPreview}
                  className="mt-4 w-full rounded-[10px] bg-amber-500 py-3 font-heading text-[0.82rem] font-bold text-white transition-colors hover:bg-amber-600"
                >
                  Submit Response
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "responses" && (
          <div className="flex flex-1 flex-col gap-4 overflow-auto p-5">
            {data.responses.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                <p className="font-heading text-[0.9rem] font-extrabold text-muted-foreground">No responses yet</p>
                <p className="text-[0.76rem] text-muted-foreground/60">
                  Share your survey link to start collecting feedback
                </p>
              </div>
            ) : (
              data.responses.map((resp, ri) => (
                <div key={resp.id} className="rounded-xl border border-border bg-card p-4">
                  <p className="mb-3 font-heading text-[0.68rem] font-bold text-muted-foreground/60">
                    Response #{ri + 1} · {resp.date}
                  </p>
                  <div className="flex flex-col gap-2">
                    {data.questions.map((q) => (
                      <div key={q.id}>
                        <p className="font-heading text-[0.72rem] font-bold text-muted-foreground">{q.prompt}</p>
                        <p className="mt-0.5 text-[0.8rem] text-foreground">
                          {q.type === "rating"
                            ? `${"★".repeat(Number(resp.answers[q.id] ?? 0))}${"☆".repeat(5 - Number(resp.answers[q.id] ?? 0))}`
                            : String(resp.answers[q.id] || "—")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
