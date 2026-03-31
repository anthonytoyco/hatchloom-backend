import type { SandboxTool } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Mic, MicOff, Square, Video, VideoOff } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

type RecordMode = "video" | "audio"

interface Recording {
  id: string
  mode: RecordMode
  url: string
  duration: number
  date: string
  size: string
}

interface VideoAudioData {
  recordings: Recording[]
}

const DEMO: VideoAudioData = { recordings: [] }

export function VideoAudioContent({
  tool,
  onUnsaved,
}: {
  tool: SandboxTool
  onUnsaved: (data: string) => void
}) {
  const initial: VideoAudioData = (() => {
    try {
      const parsed = JSON.parse(tool.data ?? "{}") as VideoAudioData
      if (parsed.recordings) return parsed
      return DEMO
    } catch {
      return DEMO
    }
  })()

  const [data, setData] = useState<VideoAudioData>(initial)
  const [mode, setMode] = useState<RecordMode>("video")
  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const playbackRef = useRef<HTMLVideoElement | HTMLAudioElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    let cancelled = false
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
    }
    navigator.mediaDevices
      .getUserMedia({ video: mode === "video", audio: true })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        setHasPermission(true)
        if (mode === "video" && videoRef.current) {
          videoRef.current.srcObject = stream
        }
      })
      .catch(() => {
        if (!cancelled) setHasPermission(false)
      })
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [mode])

  function startRecording() {
    if (!streamRef.current) return
    chunksRef.current = []
    const mr = new MediaRecorder(streamRef.current)
    mr.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }
    mr.onstop = () => {
      const mimeType = mode === "video" ? "video/webm" : "audio/webm"
      const blob = new Blob(chunksRef.current, { type: mimeType })
      const url = URL.createObjectURL(blob)
      const dur = Math.round((Date.now() - startTimeRef.current) / 1000)
      const kb = Math.round(blob.size / 1024)
      const sizeStr = kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`
      const rec: Recording = {
        id: `r-${Date.now()}`,
        mode,
        url,
        duration: dur,
        date: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        size: sizeStr,
      }
      setData((prev) => {
        const next = { recordings: [rec, ...prev.recordings] }
        onUnsaved(JSON.stringify(next))
        return next
      })
      setSelectedId(rec.id)
      toast.success("Recording saved!")
    }
    mediaRecorderRef.current = mr
    startTimeRef.current = Date.now()
    mr.start()
    setRecording(true)
    setElapsed(0)
    timerRef.current = setInterval(() => {
      setElapsed(Math.round((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    setRecording(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  function removeRecording(id: string) {
    setData((prev) => {
      const next = { recordings: prev.recordings.filter((r) => r.id !== id) }
      onUnsaved(JSON.stringify(next))
      return next
    })
    if (selectedId === id) setSelectedId(null)
  }

  function fmtDur(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${String(sec).padStart(2, "0")}`
  }

  const selected = data.recordings.find((r) => r.id === selectedId)

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left: controls */}
      <div className="flex w-[220px] shrink-0 flex-col gap-4 overflow-y-auto border-r border-border bg-hatch-bg p-3">
        <div>
          <p className="mb-2 font-heading text-[0.62rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
            Mode
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {(["video", "audio"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  if (!recording) setMode(m)
                }}
                disabled={recording}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-[9px] border py-3 transition-all",
                  mode === m
                    ? "border-amber-400 bg-amber-50"
                    : "border-border bg-card hover:border-amber-300",
                  recording && "cursor-not-allowed opacity-50"
                )}
              >
                {m === "video" ? (
                  <Video className="size-4 text-amber-600" />
                ) : (
                  <Mic className="size-4 text-amber-600" />
                )}
                <span className="font-heading text-[0.65rem] font-bold text-hatch-charcoal capitalize">
                  {m}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 font-heading text-[0.62rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
            Status
          </p>
          <div
            className={cn(
              "flex items-center gap-2 rounded-[9px] border px-3 py-2",
              recording
                ? "border-red-200 bg-red-50"
                : "border-border bg-card"
            )}
          >
            <div
              className={cn(
                "size-2 rounded-full",
                recording ? "animate-pulse bg-red-500" : "bg-gray-300"
              )}
            />
            <span className="font-heading text-[0.72rem] font-bold text-hatch-charcoal">
              {recording ? `Recording ${fmtDur(elapsed)}` : "Ready"}
            </span>
          </div>
        </div>

        <button
          onClick={recording ? stopRecording : startRecording}
          disabled={hasPermission === false}
          className={cn(
            "flex items-center justify-center gap-2 rounded-[10px] py-3 font-heading text-[0.8rem] font-bold transition-all",
            recording
              ? "border border-red-300 bg-red-50 text-red-600 hover:bg-red-100"
              : hasPermission === false
                ? "cursor-not-allowed border border-border bg-card text-muted-foreground"
                : "bg-amber-500 text-white hover:bg-amber-600"
          )}
        >
          {recording ? (
            <>
              <Square className="size-3.5" />
              Stop
            </>
          ) : (
            <>
              {mode === "video" ? (
                <Video className="size-3.5" />
              ) : (
                <Mic className="size-3.5" />
              )}
              Record
            </>
          )}
        </button>

        {/* Recordings list */}
        <div>
          <p className="mb-2 font-heading text-[0.62rem] font-extrabold tracking-[0.04em] text-muted-foreground/60 uppercase">
            Recordings ({data.recordings.length})
          </p>
          {data.recordings.length === 0 ? (
            <p className="text-center text-[0.68rem] text-muted-foreground/50 py-4">
              No recordings yet
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {data.recordings.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className={cn(
                    "group flex cursor-pointer items-center gap-2 rounded-[8px] border px-2.5 py-2 transition-all",
                    selectedId === r.id
                      ? "border-amber-400 bg-amber-50"
                      : "border-border bg-card hover:border-amber-300"
                  )}
                >
                  {r.mode === "video" ? (
                    <Video className="size-3.5 shrink-0 text-amber-600" />
                  ) : (
                    <Mic className="size-3.5 shrink-0 text-amber-600" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-heading text-[0.68rem] font-bold text-hatch-charcoal">
                      {r.mode === "video" ? "Video" : "Audio"} · {fmtDur(r.duration)}
                    </p>
                    <p className="text-[0.58rem] text-muted-foreground/60">
                      {r.date} · {r.size}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeRecording(r.id)
                    }}
                    className="shrink-0 text-[0.6rem] text-muted-foreground/30 opacity-0 transition-all group-hover:opacity-100 hover:text-hatch-pink"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center: preview / playback */}
      <div className="flex flex-1 flex-col items-center justify-center gap-4 overflow-auto bg-[#111827] p-6">
        {selected ? (
          <div className="flex flex-col items-center gap-3">
            <p className="font-heading text-[0.72rem] font-bold text-white/60 uppercase tracking-widest">
              Playback
            </p>
            {selected.mode === "video" ? (
              <video
                ref={playbackRef as React.RefObject<HTMLVideoElement>}
                src={selected.url}
                controls
                className="max-h-[400px] max-w-full rounded-xl shadow-2xl"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-8 py-6">
                <Mic className="size-12 text-amber-400" />
                <audio
                  ref={playbackRef as React.RefObject<HTMLAudioElement>}
                  src={selected.url}
                  controls
                  className="w-64"
                />
              </div>
            )}
            <a
              href={selected.url}
              download={`recording-${selected.id}.${selected.mode === "video" ? "webm" : "webm"}`}
              className="rounded-[9px] bg-amber-500 px-4 py-2 font-heading text-[0.74rem] font-bold text-white transition-colors hover:bg-amber-600"
            >
              Download
            </a>
          </div>
        ) : hasPermission === false ? (
          <div className="flex flex-col items-center gap-3 text-center">
            {mode === "video" ? (
              <VideoOff className="size-12 text-white/30" />
            ) : (
              <MicOff className="size-12 text-white/30" />
            )}
            <p className="font-heading text-[0.9rem] font-bold text-white/70">
              Permission denied
            </p>
            <p className="max-w-[300px] text-[0.76rem] text-white/40">
              Allow camera/microphone access in your browser settings, then reload.
            </p>
          </div>
        ) : mode === "video" ? (
          <div className="flex flex-col items-center gap-3">
            <p className="font-heading text-[0.72rem] font-bold text-white/60 uppercase tracking-widest">
              {recording ? "Recording…" : "Camera Preview"}
            </p>
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="max-h-[400px] max-w-full rounded-xl shadow-2xl"
              />
              {recording && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1">
                  <div className="size-1.5 animate-pulse rounded-full bg-red-500" />
                  <span className="font-heading text-[0.65rem] font-bold text-white">
                    {fmtDur(elapsed)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <p className="font-heading text-[0.72rem] font-bold text-white/60 uppercase tracking-widest">
              {recording ? "Recording audio…" : "Ready to record"}
            </p>
            <div
              className={cn(
                "flex size-32 items-center justify-center rounded-full border-4 transition-all",
                recording
                  ? "animate-pulse border-red-500 bg-red-500/10"
                  : "border-amber-500/40 bg-amber-500/10"
              )}
            >
              <Mic
                className={cn(
                  "size-12",
                  recording ? "text-red-400" : "text-amber-400"
                )}
              />
            </div>
            {recording && (
              <p className="font-heading text-2xl font-black text-white">
                {fmtDur(elapsed)}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
