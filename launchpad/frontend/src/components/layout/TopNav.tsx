import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { RANK_META } from "@/lib/mock-data"
import type { StudentProfile } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Bell, Flame, Zap } from "lucide-react"
import { NavLink } from "react-router"

interface NavItem {
  label: string
  href: string
}

const NAV_ITEMS: NavItem[] = [
  { label: "LaunchPad", href: "/launchpad" },
  { label: "ConnectHub", href: "/connecthub" },
]

interface TopNavProps {
  student: StudentProfile
}

export function TopNav({ student }: TopNavProps) {
  const rank = RANK_META[student.rank]

  return (
    <header className="sticky top-0 z-50 flex h-[58px] items-center justify-between border-b border-border bg-card px-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      {/* Left - logo + context */}
      <div className="flex items-center gap-2.5">
        <span className="font-heading text-[1.35rem] font-black tracking-tight text-hatch-charcoal">
          hatch<span className="text-hatch-pink">loom</span>
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
        {NAV_ITEMS.map((item) => (
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
        ))}
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
            <Flame className="size-3.5" />
            {student.streakDays}
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
            <Zap className="size-3.5" />
            {student.xp.toLocaleString()} XP
          </TooltipTrigger>
          <TooltipContent>
            {student.xpToNextRank - student.xp} XP to next rank
          </TooltipContent>
        </Tooltip>

        {/* Rank badge */}
        <Tooltip>
          <TooltipTrigger
            render={
              <span
                className={cn(
                  "cursor-default rounded-full border px-2.5 py-1 font-heading text-[0.68rem] font-bold",
                  rank.colorClass,
                  rank.bgClass,
                  rank.borderClass
                )}
              />
            }
          >
            {rank.label}
          </TooltipTrigger>
          <TooltipContent>Your current rank</TooltipContent>
        </Tooltip>

        {/* Notification bell */}
        <Tooltip>
          <TooltipTrigger
            render={
              <button className="relative flex size-[34px] cursor-pointer items-center justify-center rounded-full border border-border bg-background transition-colors hover:bg-muted" />
            }
          >
            <Bell className="size-4 text-muted-foreground" />
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
              <AvatarFallback className="bg-transparent text-xl">
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
