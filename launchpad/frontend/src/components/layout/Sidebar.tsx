import { Separator } from "@/components/ui/separator"
import type { NavItem } from "@/lib/types"
import { cn } from "@/lib/utils"
import * as Icons from "lucide-react"
import { NavLink } from "react-router"

interface SidebarSection {
  label?: string
  items: NavItem[]
}

interface SidebarProps {
  sections: SidebarSection[]
  ctaLabel?: string
  ctaHref?: string
}

function NavIcon({ name }: { name: string }) {
  const Icon = (
    Icons as unknown as Record<
      string,
      React.ComponentType<{ className?: string }>
    >
  )[name]
  if (!Icon) return <span className="size-[18px]" />
  return <Icon className="size-[15px] shrink-0" />
}

export function Sidebar({ sections, ctaLabel, ctaHref }: SidebarProps) {
  return (
    <aside className="sticky top-[58px] flex h-[calc(100vh-58px)] w-[215px] shrink-0 flex-col overflow-y-auto border-r border-border bg-card py-5">
      {sections.map((section, si) => (
        <div key={si} className="px-3.5">
          {section.label && (
            <p className="mt-4 mb-1.5 ml-2 font-heading text-[0.63rem] font-black tracking-[0.09em] text-muted-foreground/60 uppercase first:mt-0">
              {section.label}
            </p>
          )}

          {section.items.map((item) => (
            <NavLink
              key={item.id}
              to={item.href}
              end={item.href === "/launchpad"}
              className={({ isActive }) =>
                cn(
                  "mb-0.5 flex items-center gap-2 rounded-[9px] px-3 py-[0.525rem] text-[0.8125rem] font-semibold transition-all",
                  isActive
                    ? "bg-orange-50 text-hatch-orange"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <NavIcon name={item.icon} />
              <span className="flex-1">{item.label}</span>
              {typeof item.badge === "number" && item.badge > 0 && (
                <span className="rounded-full bg-hatch-pink px-1.5 py-0.5 font-heading text-[0.6rem] font-black text-white">
                  {item.badge}
                </span>
              )}
              {item.badge === "NEW" && (
                <span className="rounded bg-pink-50 px-1.5 py-0.5 font-heading text-[0.58rem] font-black text-hatch-pink">
                  NEW
                </span>
              )}
            </NavLink>
          ))}

          {si < sections.length - 1 && <Separator className="mx-0 my-2.5" />}
        </div>
      ))}

      {/* Spacer pushes CTA to bottom */}
      <div className="flex-1" />

      {ctaLabel && (
        <div className="px-3.5">
          <NavLink
            to={ctaHref ?? "#"}
            className="block w-full rounded-[10px] bg-hatch-pink px-4 py-2.5 text-center font-heading text-[0.78rem] font-bold text-white transition-opacity hover:opacity-90"
          >
            {ctaLabel}
          </NavLink>
        </div>
      )}
    </aside>
  )
}
