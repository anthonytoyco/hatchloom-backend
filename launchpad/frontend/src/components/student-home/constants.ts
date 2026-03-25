import type { NavItem } from "@/lib/types"

export const STUDENT_HOME_SIDEBAR_SECTIONS = [
  {
    items: [
      { id: "home", label: "Home", icon: "House", href: "/" },
    ] satisfies NavItem[],
  },
  {
    label: "Profile",
    items: [
      { id: "profile", label: "Profile", icon: "User", href: "/profile" },
      {
        id: "wallet",
        label: "Credential Wallet",
        icon: "GraduationCap",
        href: "/wallet",
      },
      {
        id: "settings",
        label: "Settings",
        icon: "Settings",
        href: "/settings",
      },
    ] satisfies NavItem[],
  },
  {
    items: [
      {
        id: "contact",
        label: "Contact Hatchloom",
        icon: "MessageCircle",
        href: "/contact",
      },
    ] satisfies NavItem[],
  },
]

export const SKILL_LEVELS: Record<string, number> = {
  EE: 4,
  "E&I": 2,
  RB: 1,
  SS: 4,
}

export const RANK_ORDER = ["ROOKIE", "EXPLORER", "CHALLENGER", "PRO", "LEGEND"]

export const BADGES = [
  { emoji: "🏆", label: "Entrepreneur's Choice", bg: "bg-amber-50" },
  { emoji: "🎯", label: "Problem Solver", bg: "bg-pink-50" },
  { emoji: "⚡", label: "Quick Learner", bg: "bg-sky-50" },
  { emoji: "🌟", label: "First Challenge", bg: "bg-green-50" },
]

export interface UrgentBanner {
  id: string
  icon: string
  text: string
  cta: string
}

export const INITIAL_BANNERS: UrgentBanner[] = [
  {
    id: "b1",
    icon: "🚨",
    text: "Last day to sign up for Calgary's Teen Hackathon is today!",
    cta: "Sign Up →",
  },
  {
    id: "b2",
    icon: "🎙️",
    text: "Live podcast with Manjit Minhas tomorrow at 3:30 MST",
    cta: "View Details →",
  },
]

export const EXPLORE_ITEMS = [
  { icon: "📚", name: "Design Thinking 101", next: "Pitch Day Mar 6" },
  { icon: "📚", name: "Business Model Canvas", next: "Live session Feb 19" },
  { icon: "📚", name: "Financial Literacy 103", next: "Office hours Feb 21" },
  { icon: "🎧", name: "How I Built This", next: "Ep 3 of 6" },
  { icon: "📖", name: "Pricing Your Product", next: "Activity 3 of 7" },
]

export const CONNECT_ITEMS = [
  {
    emoji: "🐯",
    bg: "bg-[#FF6B6B]/20",
    name: "TigerSpark",
    text: "asking about empathy map in Design Thinking 101",
  },
  {
    emoji: "🐬",
    bg: "bg-[#4ECDC4]/20",
    name: "DolphinDash",
    text: "looking for team for Sarah Chen's challenge",
  },
  {
    emoji: "🦁",
    bg: "bg-orange-100",
    name: "LionHeart Crafts",
    text: "needs a logo designer",
  },
]

export const ONLINE_PEERS = [
  { emoji: "🐯", bg: "bg-[#FF6B6B]/20" },
  { emoji: "🐬", bg: "bg-[#4ECDC4]/20" },
  { emoji: "🦋", bg: "bg-purple-100" },
  { emoji: "🦅", bg: "bg-orange-100" },
]
