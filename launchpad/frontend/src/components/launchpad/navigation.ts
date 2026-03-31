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
        icon: "🚀",
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
        icon: "🧪",
        href: "/launchpad",
        scrollToId: "sandboxes-section",
      },
      {
        id: "sidehustles",
        label: "My SideHustles",
        icon: "💼",
        href: "/launchpad",
        scrollToId: "sidehustles-section",
      },
    ],
  },
  {
    label: "Community",
    items: [
      {
        id: "teams",
        label: "My Teams",
        icon: "👥",
        href: "/launchpad/teams",
      },
      {
        id: "events",
        label: "Upcoming Events",
        icon: "📅",
        href: "/launchpad/events",
        badge: "NEW" as const,
      },
      {
        id: "classifieds",
        label: "Classifieds",
        icon: "📋",
        href: "/launchpad/classifieds",
        badge: 4,
      },
      {
        id: "market",
        label: "Market Square",
        icon: "🏪",
        href: "/launchpad/market",
      },
    ],
  },
  {
    label: "Library",
    items: [
      { id: "tools", label: "Tools", icon: "🛠️", href: "/launchpad/tools" },
      {
        id: "orgs",
        label: "Organizations",
        icon: "🤝",
        href: "/launchpad/organizations",
      },
      {
        id: "learning",
        label: "Learning Paths",
        icon: "📚",
        href: "/launchpad/learning",
      },
    ],
  },
]
