import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useCreateSandbox, useCreateSideHustle } from "@/hooks/use-mutations"
import type { SandboxSummary } from "@/lib/types"
import { useState } from "react"
import { useNavigate } from "react-router"

export function CreateSandboxDialog({
  open,
  onClose,
  studentId,
}: {
  open: boolean
  onClose: () => void
  studentId: string
}) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const { mutateAsync } = useCreateSandbox()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    const createdSandbox = await mutateAsync({
      studentId,
      title: title.trim(),
      description: description.trim() || undefined,
    })
    onClose()
    setTitle("")
    setDescription("")
    void navigate(`/sandboxes/${createdSandbox.id}`)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-black text-hatch-charcoal">
            New Sandbox 🧪
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            void handleSubmit(e)
          }}
          className="space-y-4 pt-2"
        >
          <div className="space-y-1.5">
            <Label
              htmlFor="sb-title"
              className="font-heading text-xs font-bold"
            >
              Title <span className="text-hatch-pink">*</span>
            </Label>
            <Input
              id="sb-title"
              placeholder="e.g. Sustainable Packaging Idea"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sb-desc" className="font-heading text-xs font-bold">
              Description
            </Label>
            <Textarea
              id="sb-desc"
              placeholder="What are you exploring?"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim()}
              className="bg-hatch-pink text-white hover:bg-hatch-pink/90"
            >
              Create Sandbox
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function CreateSideHustleDialog({
  open,
  onClose,
  sandboxes,
  studentId,
}: {
  open: boolean
  onClose: () => void
  sandboxes: SandboxSummary[]
  studentId: string
}) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<"IN_THE_LAB" | "LIVE_VENTURE">("IN_THE_LAB")
  const [sandboxId, setSandboxId] = useState("")
  const selectedSandboxId = sandboxId || sandboxes[0]?.id || ""
  const { mutateAsync } = useCreateSideHustle()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !selectedSandboxId) return
    const createdSideHustle = await mutateAsync({
      sandboxId: selectedSandboxId,
      studentId,
      title: title.trim(),
      description: description.trim() || undefined,
      type,
    })
    onClose()
    setTitle("")
    setDescription("")
    setType("IN_THE_LAB")
    setSandboxId("")
    void navigate(`/sidehustles/${createdSideHustle.id}`)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-black text-hatch-charcoal">
            New SideHustle 💼
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            void handleSubmit(e)
          }}
          className="space-y-4 pt-2"
        >
          <div className="space-y-1.5">
            <Label
              htmlFor="sh-title"
              className="font-heading text-xs font-bold"
            >
              Title <span className="text-hatch-pink">*</span>
            </Label>
            <Input
              id="sh-title"
              placeholder="e.g. Flavour Butter Co."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="sh-sandbox"
              className="font-heading text-xs font-bold"
            >
              Sandbox <span className="text-hatch-pink">*</span>
            </Label>
            <Select
              value={selectedSandboxId}
              onValueChange={(value) => setSandboxId(value ?? "")}
            >
              <SelectTrigger id="sh-sandbox">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sandboxes.map((sandbox) => (
                  <SelectItem key={sandbox.id} value={sandbox.id}>
                    {sandbox.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {sandboxes.length === 0 ? (
              <p className="text-[0.72rem] text-muted-foreground">
                Create a sandbox first before starting a side hustle.
              </p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sh-type" className="font-heading text-xs font-bold">
              Type
            </Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as typeof type)}
            >
              <SelectTrigger id="sh-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN_THE_LAB">
                  In the Lab (exploring)
                </SelectItem>
                <SelectItem value="LIVE_VENTURE">
                  Live Venture (active)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sh-desc" className="font-heading text-xs font-bold">
              Description
            </Label>
            <Textarea
              id="sh-desc"
              placeholder="What does your venture do?"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || !selectedSandboxId}
              className="bg-hatch-pink text-white hover:bg-hatch-pink/90"
            >
              Create SideHustle
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
