import type { NavItem } from "@/lib/types"

export const LAUNCHPAD_SIDEBAR_SECTIONS: Array<{
  label?: string
  items: NavItem[]
}> = [
  {
    items: [
      {
        id: "home",
        label: "Launchpad Home",
        icon: "Rocket",
        href: "/launchpad",
      },
    ],
  },
  {
    label: "Launchpad",
    items: [
      {
        id: "sandboxes",
        label: "My Sandboxes",
        icon: "FlaskConical",
        href: "/launchpad/sandboxes",
      },
      {
        id: "sidehustles",
        label: "My SideHustles",
        icon: "Briefcase",
        href: "/launchpad/sidehustles",
      },
    ],
  },
  {
    label: "Community",
    items: [
      {
        id: "teams",
        label: "My Teams",
        icon: "Users",
        href: "/launchpad/teams",
      },
      {
        id: "events",
        label: "Upcoming Events",
        icon: "Calendar",
        href: "/launchpad/events",
        badge: "NEW" as const,
      },
      {
        id: "classifieds",
        label: "Classifieds",
        icon: "ClipboardList",
        href: "/launchpad/classifieds",
        badge: 4,
      },
      {
        id: "market",
        label: "Market Square",
        icon: "ShoppingBag",
        href: "/launchpad/market",
      },
    ],
  },
  {
    label: "Library",
    items: [
      { id: "tools", label: "Tools", icon: "Wrench", href: "/launchpad/tools" },
      {
        id: "orgs",
        label: "Organizations",
        icon: "Building2",
        href: "/launchpad/organizations",
      },
      {
        id: "learning",
        label: "Learning Paths",
        icon: "BookOpen",
        href: "/launchpad/learning",
      },
    ],
  },
]
