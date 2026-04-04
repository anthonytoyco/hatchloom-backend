import type { SandboxTool } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useNavigate, useParams } from "react-router"

interface QAStep {
  label: string
  question: string
  hint: string
  placeholder: string
  example: string
  railLabel: string
}

const QA_STEPS: QAStep[] = [
  {
    label: "STEP 1 OF 4",
    railLabel: "Who has the problem?",
    question: "Who has this problem?",
    hint: 'Think about the specific person or group who experiences this pain. Not "everyone" - be specific. A real name or role is great.',
    placeholder:
      "e.g. Students who commute between off-campus housing and university buildings",
    example:
      'Good: "Students who commute 2-5km between housing and campus"\nToo vague: "People who need transportation"',
  },
  {
    label: "STEP 2 OF 4",
    railLabel: "What is the problem?",
    question: "What is the problem they face?",
    hint: "Describe the pain in plain language. What happens? How often? What have they tried that doesn't work?",
    placeholder:
      "e.g. No safe, affordable, and trusted option that fits a student schedule",
    example:
      'Good: "No peer-verified rideshare exists - taxis are too expensive, public transit stops at 11pm"\nToo vague: "Transport is hard for students"',
  },
  {
    label: "STEP 3 OF 4",
    railLabel: "Why does it matter?",
    question: "Why does this matter?",
    hint: "What's the impact if nothing changes? Think about the emotional, safety, or financial cost.",
    placeholder:
      "e.g. Students skip late classes, pay $25+ for late Ubers, or walk home alone at night",
    example:
      'Good: "30% of students report skipping late events because of transport cost or safety concerns"\nToo vague: "It\'s a problem"',
  },
  {
    label: "FINAL STEP",
    railLabel: "One-sentence statement",
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
  const navigate = useNavigate()
  const { sandboxId = tool.sandboxId } = useParams<{ sandboxId: string }>()
  const parsed = (() => {
    try {
      return JSON.parse(
        tool.data ?? '{"currentStep":0,"answers":{},"statement":""}'
      ) as {
        currentStep: number
        answers: Record<string, string>
        statement?: string
      }
    } catch {
      return {
        currentStep: 0,
        answers: {} as Record<string, string>,
        statement: "",
      }
    }
  })()
  const [currentStep, setCurrentStep] = useState(parsed.currentStep)
  const [answers, setAnswers] = useState<Record<string, string>>(parsed.answers)

  function buildStatement(nextAnswers: Record<string, string>) {
    return nextAnswers["0"] && nextAnswers["1"] && nextAnswers["2"]
      ? `${nextAnswers["0"]} face a problem: ${nextAnswers["1"]} This matters because ${nextAnswers["2"]}`
      : ""
  }

  const [statement, setStatement] = useState(
    parsed.statement || buildStatement(parsed.answers)
  )

  function persist(
    nextCurrentStep: number,
    nextAnswers: Record<string, string>,
    nextStatement: string
  ) {
    onUnsaved(
      JSON.stringify({
        currentStep: nextCurrentStep,
        answers: nextAnswers,
        statement: nextStatement,
      })
    )
  }

  function goStep(i: number) {
    setCurrentStep(i)
    persist(i, answers, statement)
  }

  function setAnswer(val: string) {
    const nextAnswers = { ...answers, [currentStep]: val }
    const nextStatement = buildStatement(nextAnswers)
    setAnswers(nextAnswers)
    setStatement((prev) => (currentStep === 2 || !prev ? nextStatement : prev))
    persist(
      currentStep,
      nextAnswers,
      currentStep === 2 || !statement ? nextStatement : statement
    )
  }

  function handleStatementChange(val: string) {
    setStatement(val)
    persist(currentStep, answers, val)
  }

  function handleStepChange(nextStep: number) {
    setCurrentStep(nextStep)
    persist(nextStep, answers, statement)
  }

  function handleComplete() {
    void navigate(`/sandboxes/${sandboxId}`)
  }

  const step = QA_STEPS[currentStep]
  const isSummary = currentStep === 3
  const progressPct = Math.round((currentStep / (QA_STEPS.length - 1)) * 100)

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex w-60 shrink-0 flex-col gap-0 overflow-y-auto border-r border-border bg-hatch-bg px-3 py-5">
        {QA_STEPS.map((s, i) => {
          const isDone =
            i < currentStep || !!answers[i] || (i === 3 && !!statement)
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
                    "flex size-6.5 shrink-0 items-center justify-center rounded-full border-2 font-heading text-[0.7rem] font-extrabold transition-all",
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
                    {s.railLabel}
                  </p>
                  <p className="text-[0.64rem] text-muted-foreground/60">
                    {isDone
                      ? "Completed"
                      : isActive
                        ? "Current step"
                        : "Not yet"}
                  </p>
                </div>
              </div>
              {i < QA_STEPS.length - 1 && (
                <div
                  className={cn(
                    "ml-[1.55rem] h-3 w-0.5",
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
          <div className="mx-auto w-full max-w-160">
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
                  className="font-body min-h-30 w-full resize-none rounded-xl border border-border px-4 py-3 text-[0.9rem] leading-relaxed text-foreground transition-colors outline-none focus:border-sandbox-green"
                  placeholder={step.placeholder}
                  value={answers[currentStep] ?? ""}
                  onChange={(e) => setAnswer(e.target.value)}
                />
                {step.example && (
                  <div className="mt-3 rounded-[10px] border border-border bg-hatch-bg px-4 py-3">
                    <p className="mb-1 font-heading text-[0.65rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
                      💡 Example
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
                  {step.label}
                </p>
                <h2 className="mb-1 font-heading text-[1.35rem] leading-snug font-black text-hatch-charcoal">
                  {step.question}
                </h2>
                <p className="mb-5 text-[0.82rem] leading-relaxed text-muted-foreground">
                  {step.hint}
                </p>
                <div className="rounded-[14px] border-2 border-green-200 bg-green-50 p-5">
                  <p className="mb-3 font-heading text-[0.75rem] font-extrabold tracking-[0.04em] text-sandbox-green uppercase">
                    ✨ Your Problem Statement
                  </p>
                  <textarea
                    className="min-h-40 w-full resize-none rounded-[10px] border-[1.5px] border-green-200 bg-white px-4 py-3 font-heading text-[1.05rem] leading-relaxed font-bold text-hatch-charcoal outline-none focus:border-sandbox-green"
                    value={statement || buildStatement(answers)}
                    onChange={(e) => handleStatementChange(e.target.value)}
                  />
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
            <div className="h-1.5 w-30 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-sandbox-green transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleStepChange(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="rounded-lg border border-border bg-card px-4 py-[0.45rem] font-heading text-[0.78rem] font-bold text-foreground transition-all hover:bg-hatch-bg disabled:opacity-40"
            >
              ← Back
            </button>
            {isSummary ? (
              <button
                onClick={handleComplete}
                className="rounded-lg bg-sandbox-green px-5 py-[0.45rem] font-heading text-[0.78rem] font-bold text-white transition-all hover:bg-emerald-700"
              >
                ✓ Complete
              </button>
            ) : (
              <button
                onClick={() =>
                  handleStepChange(
                    Math.min(QA_STEPS.length - 1, currentStep + 1)
                  )
                }
                className="rounded-lg bg-sandbox-green px-5 py-[0.45rem] font-heading text-[0.78rem] font-bold text-white transition-all hover:bg-emerald-700"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
