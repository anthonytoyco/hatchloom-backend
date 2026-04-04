import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { StudentProfile } from "@/lib/types"
import { cn } from "@/lib/utils"
import { NavLink } from "react-router"

const CONNECTHUB_URL: string =
  (import.meta.env.VITE_CONNECTHUB_URL as string | undefined) ??
  "http://localhost:5173"

interface NavItem {
  label: string
  href: string
  external?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: "🔭 Explore", href: "/explore" },
  { label: "🔗 Connect", href: CONNECTHUB_URL, external: true },
  { label: "🚀 Launch", href: "/" },
]

interface TopNavProps {
  student: StudentProfile
}

export function TopNav({ student }: TopNavProps) {
  return (
    <header className="sticky top-0 z-50 flex h-[58px] items-center justify-between border-b border-border bg-card px-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      {/* Left - logo + context */}
      <div className="flex items-center gap-2.5">
        <span className="font-heading text-[1.35rem] font-black tracking-tight text-hatch-pink">
          hatch<span className="text-hatch-charcoal">loom</span>
        </span>
        <Badge
          variant="outline"
          className="border-sky-200 bg-sky-50 font-heading text-[0.68rem] font-bold text-sky-600"
        >
          Student
        </Badge>
        <span className="font-heading text-[0.78rem] font-semibold text-muted-foreground">
          {student.school}
        </span>
      </div>

      {/* Center - nav links */}
      <nav className="flex items-center gap-0.5">
        {NAV_ITEMS.map((item) =>
          item.external ? (
            <a
              key={item.href}
              href={item.href}
              className="rounded-lg px-3.5 py-[0.45rem] font-heading text-sm font-semibold text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </a>
          ) : (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-3.5 py-[0.45rem] font-heading text-sm font-semibold transition-all",
                  isActive
                    ? "bg-orange-50 text-hatch-orange"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              {item.label}
            </NavLink>
          )
        )}
      </nav>

      {/* Right - gamification + avatar */}
      <div className="flex items-center gap-2.5">
        {/* Streak pill */}
        <Tooltip>
          <TooltipTrigger
            render={
              <button className="flex cursor-pointer items-center gap-1.5 rounded-full border border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100 px-3 py-1.5 font-heading text-[0.78rem] font-extrabold text-amber-700 transition-all hover:brightness-95" />
            }
          >
            🔥 {student.streakDays}-day streak
          </TooltipTrigger>
          <TooltipContent>{student.streakDays}-day streak</TooltipContent>
        </Tooltip>

        {/* XP pill */}
        <Tooltip>
          <TooltipTrigger
            render={
              <button className="flex cursor-pointer items-center gap-1.5 rounded-full border border-sky-200 bg-gradient-to-br from-sky-50 to-sky-100 px-3 py-1.5 font-heading text-[0.78rem] font-extrabold text-sky-600 transition-all hover:brightness-95" />
            }
          >
            ⚡ {student.xp.toLocaleString()} XP
          </TooltipTrigger>
          <TooltipContent>
            {student.xpToNextRank - student.xp} XP to next rank
          </TooltipContent>
        </Tooltip>

        {/* Email button */}
        <Tooltip>
          <TooltipTrigger
            render={
              <button className="relative flex size-[34px] cursor-pointer items-center justify-center rounded-full border border-border bg-background transition-colors hover:bg-muted" />
            }
          >
            <span className="text-base leading-none">✉️</span>
            <span className="absolute -top-0.5 -right-0.5 flex size-[15px] items-center justify-center rounded-full border-2 border-card bg-hatch-pink font-heading text-[0.55rem] font-black text-white">
              3
            </span>
          </TooltipTrigger>
          <TooltipContent>Messages</TooltipContent>
        </Tooltip>

        {/* Notification bell */}
        <Tooltip>
          <TooltipTrigger
            render={
              <button className="relative flex size-[34px] cursor-pointer items-center justify-center rounded-full border border-border bg-background transition-colors hover:bg-muted" />
            }
          >
            <span className="text-base leading-none">🔔</span>
            <span className="absolute -top-0.5 -right-0.5 flex size-[15px] items-center justify-center rounded-full border-2 border-card bg-hatch-pink font-heading text-[0.55rem] font-black text-white">
              3
            </span>
          </TooltipTrigger>
          <TooltipContent>Notifications</TooltipContent>
        </Tooltip>

        {/* Avatar */}
        <Tooltip>
          <TooltipTrigger
            render={
              <button className="cursor-pointer rounded-full border-[2.5px] border-card shadow-[0_2px_8px_rgba(255,31,90,0.2)] transition-transform hover:scale-105" />
            }
          >
            <Avatar className="size-9 bg-gradient-to-br from-hatch-charcoal to-[#3D3060]">
              <AvatarFallback className="text-xl bg-transparent">
                {student.emoji}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>{student.name}</TooltipContent>
        </Tooltip>
      </div>
    </header>
  )
}
