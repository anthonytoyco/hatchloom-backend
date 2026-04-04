import { Link } from "react-router"

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
      <p className="font-heading text-xs font-black tracking-[0.08em] text-muted-foreground uppercase">
        404
      </p>
      <h1 className="mt-2 font-heading text-3xl font-black tracking-tight text-hatch-charcoal">
        Page Not Found
      </h1>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">
        The page you requested is not currently available in this build.
      </p>
      <div className="mt-8 flex items-center gap-3">
        <Link
          to="/"
          className="rounded-lg border border-border bg-card px-4 py-2 font-heading text-sm font-bold text-foreground hover:bg-muted"
        >
          Go to Student Home
        </Link>
        <Link
          to="/"
          className="rounded-lg bg-hatch-pink px-4 py-2 font-heading text-sm font-bold text-white hover:opacity-90"
        >
          Go to LaunchPad
        </Link>
      </div>
    </div>
  )
}
