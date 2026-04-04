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
        href: "/",
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
        href: "/",
        scrollToId: "sandboxes-section",
      },
      {
        id: "sidehustles",
        label: "My SideHustles",
        icon: "💼",
        href: "/",
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
        href: "/teams",
      },
      {
        id: "events",
        label: "Upcoming Events",
        icon: "📅",
        href: "/events",
        badge: "NEW" as const,
      },
      {
        id: "classifieds",
        label: "Classifieds",
        icon: "📋",
        href: "/classifieds",
        badge: 4,
      },
      {
        id: "market",
        label: "Market Square",
        icon: "🏪",
        href: "/market",
      },
    ],
  },
  {
    label: "Library",
    items: [
      { id: "tools", label: "Tools", icon: "🛠️", href: "/tools" },
      {
        id: "orgs",
        label: "Organizations",
        icon: "🤝",
        href: "/organizations",
      },
      {
        id: "learning",
        label: "Learning Paths",
        icon: "📚",
        href: "/learning",
      },
    ],
  },
]
