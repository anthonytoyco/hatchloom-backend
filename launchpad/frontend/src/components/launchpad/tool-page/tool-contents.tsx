import { ChecklistContent } from "@/components/launchpad/tool-page/checklist-content"
import { ComingSoonContent } from "@/components/launchpad/tool-page/coming-soon-content"
import { DeckContent } from "@/components/launchpad/tool-page/deck-content"
import { GuidedQAContent } from "@/components/launchpad/tool-page/guided-qa-content"
import { PostItContent } from "@/components/launchpad/tool-page/postit-content"
import type { SandboxTool } from "@/lib/types"

export function ToolContent({
  toolType,
  tool,
  onUnsaved,
}: {
  toolType: string
  tool: SandboxTool | undefined
  onUnsaved: (data: string) => void
}) {
  if (!tool) return <ComingSoonContent toolType={toolType} />

  switch (toolType) {
    case "POSTIT":
      return <PostItContent tool={tool} onUnsaved={onUnsaved} />
    case "CHECKLIST":
      return <ChecklistContent tool={tool} onUnsaved={onUnsaved} />
    case "GUIDED_QA":
      return <GuidedQAContent tool={tool} onUnsaved={onUnsaved} />
    case "DECK":
      return <DeckContent tool={tool} onUnsaved={onUnsaved} />
    default:
      return <ComingSoonContent toolType={toolType} />
  }
}
