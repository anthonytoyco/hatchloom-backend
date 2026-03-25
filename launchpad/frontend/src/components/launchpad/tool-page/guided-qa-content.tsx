import type { SandboxTool } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface QAStep {
  label: string
  question: string
  hint: string
  placeholder: string
  example: string
}

const QA_STEPS: QAStep[] = [
  {
    label: "STEP 1 OF 4",
    question: "Who has this problem?",
    hint: 'Think about the specific person or group who experiences this pain. Not "everyone" - be specific. A real name or role is great.',
    placeholder:
      "e.g. Students who commute between off-campus housing and university buildings",
    example:
      'Good: "Students who commute 2-5km between housing and campus"\nToo vague: "People who need transportation"',
  },
  {
    label: "STEP 2 OF 4",
    question: "What is the problem they face?",
    hint: "Describe the pain in plain language. What happens? How often? What have they tried that doesn't work?",
    placeholder:
      "e.g. No safe, affordable, and trusted option that fits a student schedule",
    example:
      'Good: "No peer-verified rideshare exists - taxis are too expensive, public transit stops at 11pm"\nToo vague: "Transport is hard for students"',
  },
  {
    label: "STEP 3 OF 4",
    question: "Why does this matter?",
    hint: "What's the impact if nothing changes? Think about the emotional, safety, or financial cost.",
    placeholder:
      "e.g. Students skip late classes, pay $25+ for late Ubers, or walk home alone at night",
    example:
      'Good: "30% of students report skipping late events because of transport cost or safety concerns"\nToo vague: "It\'s a problem"',
  },
  {
    label: "FINAL STEP",
    question: "Your Problem Statement",
    hint: "We've combined your answers into one clear sentence. Edit it until it feels right - this becomes the north star for your project.",
    placeholder: "",
    example: "",
  },
]

export function GuidedQAContent({
  tool,
  onUnsaved,
}: {
  tool: SandboxTool
  onUnsaved: (data: string) => void
}) {
  const parsed = (() => {
    try {
      return JSON.parse(tool.data ?? '{"currentStep":0,"answers":{}}') as {
        currentStep: number
        answers: Record<string, string>
      }
    } catch {
      return { currentStep: 0, answers: {} as Record<string, string> }
    }
  })()
  const [currentStep, setCurrentStep] = useState(parsed.currentStep)
  const [answers, setAnswers] = useState<Record<string, string>>(parsed.answers)

  const generated =
    answers["0"] && answers["1"] && answers["2"]
      ? `${answers["0"]} struggle with ${answers["1"]}. This matters because ${answers["2"]}.`
      : ""

  function goStep(i: number) {
    setCurrentStep(i)
  }

  function setAnswer(val: string) {
    setAnswers((prev) => {
      const next = { ...prev, [currentStep]: val }
      onUnsaved(JSON.stringify({ currentStep, answers: next }))
      return next
    })
  }

  const step = QA_STEPS[currentStep]
  const isSummary = currentStep === 3
  const progressPct = Math.round((currentStep / (QA_STEPS.length - 1)) * 100)

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex w-[240px] shrink-0 flex-col gap-0 overflow-y-auto border-r border-border bg-hatch-bg px-3 py-5">
        {QA_STEPS.map((s, i) => {
          const isDone = i < currentStep || !!answers[i]
          const isActive = i === currentStep
          return (
            <div key={i}>
              <div
                onClick={() => goStep(i)}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-[10px] px-2.5 py-[0.55rem] transition-all hover:bg-card",
                  isActive && "bg-card shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                )}
              >
                <div
                  className={cn(
                    "flex size-[26px] shrink-0 items-center justify-center rounded-full border-2 font-heading text-[0.7rem] font-extrabold transition-all",
                    isDone &&
                      "border-sandbox-green bg-sandbox-green text-white",
                    isActive &&
                      !isDone &&
                      "border-hatch-orange bg-hatch-orange text-white",
                    !isDone &&
                      !isActive &&
                      "border-border bg-card text-muted-foreground/50"
                  )}
                >
                  {isDone ? "✓" : i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-heading text-[0.76rem] font-bold text-hatch-charcoal">
                    {s.question}
                  </p>
                  <p className="text-[0.64rem] text-muted-foreground/60">
                    {isDone
                      ? "Completed"
                      : isActive
                        ? "Current step"
                        : "Not yet"}
                  </p>
                </div>
                {isDone && !isActive && (
                  <span className="shrink-0 text-[0.75rem] text-sandbox-green">
                    ✓
                  </span>
                )}
              </div>
              {i < QA_STEPS.length - 1 && (
                <div
                  className={cn(
                    "ml-[1.55rem] h-3 w-[2px]",
                    isDone ? "bg-sandbox-green" : "bg-border"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto w-full max-w-[640px]">
            {!isSummary ? (
              <>
                <p className="mb-1.5 font-heading text-[0.68rem] font-extrabold tracking-[0.06em] text-hatch-orange uppercase">
                  {step.label}
                </p>
                <h2 className="mb-1 font-heading text-[1.35rem] leading-snug font-black text-hatch-charcoal">
                  {step.question}
                </h2>
                <p className="mb-5 text-[0.82rem] leading-relaxed text-muted-foreground">
                  {step.hint}
                </p>
                <textarea
                  className="font-body min-h-[120px] w-full resize-none rounded-xl border border-border px-4 py-3 text-[0.9rem] leading-relaxed text-foreground transition-colors outline-none focus:border-sandbox-green"
                  placeholder={step.placeholder}
                  value={answers[currentStep] ?? ""}
                  onChange={(e) => setAnswer(e.target.value)}
                />
                {step.example && (
                  <div className="mt-3 rounded-[10px] border border-border bg-hatch-bg px-4 py-3">
                    <p className="mb-1 font-heading text-[0.65rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
                      Example
                    </p>
                    <p className="text-[0.78rem] leading-relaxed whitespace-pre-line text-muted-foreground">
                      {step.example}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="mb-1.5 font-heading text-[0.68rem] font-extrabold tracking-[0.06em] text-hatch-orange uppercase">
                  FINAL STEP
                </p>
                <h2 className="mb-1 font-heading text-[1.35rem] leading-snug font-black text-hatch-charcoal">
                  Your Problem Statement
                </h2>
                <p className="mb-5 text-[0.82rem] leading-relaxed text-muted-foreground">
                  {step.hint}
                </p>
                <div className="rounded-[14px] border-2 border-green-200 bg-green-50 p-5">
                  <p className="mb-3 font-heading text-[0.75rem] font-extrabold tracking-[0.04em] text-sandbox-green uppercase">
                    Your Statement
                  </p>
                  <div className="rounded-[10px] border-[1.5px] border-green-200 bg-white px-4 py-3">
                    <p className="font-heading text-[1.1rem] leading-relaxed font-bold text-hatch-charcoal">
                      {generated ||
                        "Answer the previous steps to generate your problem statement."}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border px-8 py-3">
          <div className="flex items-center gap-2.5 font-heading text-[0.72rem] font-bold text-muted-foreground/60">
            <span>
              Step {currentStep + 1} of {QA_STEPS.length}
            </span>
            <div className="h-[6px] w-[120px] overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-sandbox-green transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentStep((v) => Math.max(0, v - 1))}
              disabled={currentStep === 0}
              className="rounded-lg border border-border bg-card px-4 py-[0.45rem] font-heading text-[0.78rem] font-bold text-foreground transition-all hover:bg-hatch-bg disabled:opacity-40"
            >
              ← Back
            </button>
            <button
              onClick={() =>
                setCurrentStep((v) => Math.min(QA_STEPS.length - 1, v + 1))
              }
              disabled={currentStep === QA_STEPS.length - 1}
              className="rounded-lg bg-sandbox-green px-5 py-[0.45rem] font-heading text-[0.78rem] font-bold text-white transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-border disabled:text-muted-foreground"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
