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
import { Textarea } from "@/components/ui/textarea"
import { useUpdateSandbox } from "@/hooks/use-mutations"
import { useState } from "react"

export function EditSandboxDialog({
  open,
  sandboxId,
  initialTitle,
  initialDescription,
  onClose,
}: {
  open: boolean
  sandboxId: string
  initialTitle: string
  initialDescription: string | null
  onClose: () => void
}) {
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription ?? "")
  const { mutateAsync, isPending } = useUpdateSandbox(sandboxId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    await mutateAsync({
      title: title.trim(),
      description: description.trim() || undefined,
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-black text-hatch-charcoal">
            Edit Sandbox ✏️
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label
              htmlFor="sb-edit-title"
              className="font-heading text-xs font-bold"
            >
              Title <span className="text-hatch-pink">*</span>
            </Label>
            <Input
              id="sb-edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="sb-edit-desc"
              className="font-heading text-xs font-bold"
            >
              Description
            </Label>
            <Textarea
              id="sb-edit-desc"
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
              disabled={!title.trim() || isPending}
              className="bg-hatch-pink text-white hover:bg-hatch-pink/90"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
