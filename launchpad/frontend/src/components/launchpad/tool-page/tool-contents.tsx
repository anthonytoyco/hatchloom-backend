import { CanvasBoardContent } from "@/components/launchpad/tool-page/canvas-board-content"
import { CalculatorContent } from "@/components/launchpad/tool-page/calculator-content"
import { ChecklistContent } from "@/components/launchpad/tool-page/checklist-content"
import { ComingSoonContent } from "@/components/launchpad/tool-page/coming-soon-content"
import { DeckContent } from "@/components/launchpad/tool-page/deck-content"
import { DownloadContent } from "@/components/launchpad/tool-page/download-content"
import { GuidedQAContent } from "@/components/launchpad/tool-page/guided-qa-content"
import { ImagePdfContent } from "@/components/launchpad/tool-page/image-pdf-content"
import { PostItContent } from "@/components/launchpad/tool-page/postit-content"
import { QrCodeContent } from "@/components/launchpad/tool-page/qr-code-content"
import { SocialPostContent } from "@/components/launchpad/tool-page/social-post-content"
import { TemplateFormContent } from "@/components/launchpad/tool-page/template-form-content"
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
    case "CANVAS_BOARD":
      return <CanvasBoardContent tool={tool} onUnsaved={onUnsaved} />
    case "CALCULATOR":
      return <CalculatorContent tool={tool} onUnsaved={onUnsaved} />
    case "TEMPLATE_FORM":
      return <TemplateFormContent tool={tool} onUnsaved={onUnsaved} />
    case "DOWNLOAD":
      return <DownloadContent tool={tool} onUnsaved={onUnsaved} />
    case "IMAGE_PDF":
      return <ImagePdfContent tool={tool} onUnsaved={onUnsaved} />
    case "SOCIAL_POST":
      return <SocialPostContent tool={tool} onUnsaved={onUnsaved} />
    case "QR_CODE":
      return <QrCodeContent tool={tool} onUnsaved={onUnsaved} />
    default:
      return <ComingSoonContent toolType={toolType} />
  }
}
