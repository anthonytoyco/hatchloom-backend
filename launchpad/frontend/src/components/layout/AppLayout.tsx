import { TooltipProvider } from "@/components/ui/tooltip"
import { useStudent } from "@/hooks/use-student"
import type { NavItem } from "@/lib/types"
import type { ReactNode } from "react"
import { Sidebar } from "./Sidebar"
import { TopNav } from "./TopNav"

interface SidebarSection {
  label?: string
  items: NavItem[]
}

interface AppLayoutProps {
  children: ReactNode
  sidebarSections: SidebarSection[]
  sidebarCta?: { label: string; href: string }
}

export function AppLayout({
  children,
  sidebarSections,
  sidebarCta,
}: AppLayoutProps) {
  const { data: student } = useStudent()

  return (
    <TooltipProvider delay={400}>
      <div className="min-h-dvh bg-hatch-bg">
        {student && <TopNav student={student} />}

        <div className="flex">
          <Sidebar
            sections={sidebarSections}
            ctaLabel={sidebarCta?.label}
            ctaHref={sidebarCta?.href}
          />
          <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  )
}
