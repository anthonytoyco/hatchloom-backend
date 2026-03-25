import { Link } from "react-router"

export function PlaceholderPage({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
      <span className="mb-4 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 font-heading text-xs font-bold text-amber-700">
        Coming Soon
      </span>
      <h1 className="font-heading text-3xl font-black tracking-tight text-hatch-charcoal">
        {title}
      </h1>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">
        {description}
      </p>
      <div className="mt-8 flex items-center gap-3">
        <Link
          to="/"
          className="rounded-lg border border-border bg-card px-4 py-2 font-heading text-sm font-bold text-foreground hover:bg-muted"
        >
          Back to Student Home
        </Link>
        <Link
          to="/launchpad"
          className="rounded-lg bg-hatch-pink px-4 py-2 font-heading text-sm font-bold text-white hover:opacity-90"
        >
          Open LaunchPad
        </Link>
      </div>
    </div>
  )
}
