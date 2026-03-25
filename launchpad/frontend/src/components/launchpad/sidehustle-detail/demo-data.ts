export type TileVariant = "green" | "amber" | "red"

export interface MetricTileData {
  label: string
  metric: string
  detail: string
  variant: TileVariant
  alert?: boolean
}

export interface TodoItem {
  id: string
  text: string
  done: boolean
  date: string
  urgent?: boolean
}

export interface Message {
  id: string
  emoji: string
  grad: string
  sender: string
  isAI?: boolean
  text: string
  time: string
  unread?: boolean
}

export interface Contact {
  emoji: string
  bg: string
  name: string
  type: string
}

export interface Resource {
  emoji: string
  bg: string
  name: string
  sub: string
  tagLabel: string
  tagBg: string
  tagColor: string
}

export interface Channel {
  emoji: string
  bg: string
  name: string
  status: string
  active: boolean
}

export const TEAM_MEMBERS = [
  {
    id: "1",
    emoji: "🦊",
    name: "@firefox_hl (You)",
    grad: "from-[#1E1E2E] to-[#3D3060]",
    role: "Founder",
    isAI: false,
  },
  {
    id: "2",
    emoji: "🎓",
    name: "@oceandive",
    grad: "from-blue-500 to-blue-400",
    role: "Helper",
    isAI: false,
  },
  {
    id: "3",
    emoji: "💡",
    name: "Spark",
    grad: "from-violet-600 to-violet-400",
    role: "Ideas",
    isAI: true,
  },
  {
    id: "4",
    emoji: "🌍",
    name: "Scout",
    grad: "from-green-500 to-green-700",
    role: "Market",
    isAI: true,
  },
  {
    id: "5",
    emoji: "📊",
    name: "Barry",
    grad: "from-cyan-600 to-cyan-400",
    role: "Mentor",
    isAI: true,
  },
]

export const RUNNING_TILES: MetricTileData[] = [
  {
    label: "Per-Unit Profit",
    metric: "$4.50 / jar",
    detail: "$3.50 cost · $8 sell",
    variant: "green",
  },
  {
    label: "Stock",
    metric: "0 jars",
    detail: "Sold out at market!",
    variant: "red",
    alert: true,
  },
  {
    label: "Orders",
    metric: "1 pending",
    detail: "@bake_lover · 2 jars",
    variant: "green",
  },
  {
    label: "Time Spent",
    metric: "Not tracked",
    detail: "Start logging hours",
    variant: "red",
    alert: true,
  },
  {
    label: "Supplies",
    metric: "LOW (3 items)",
    detail: "Butter · Jars · Labels",
    variant: "amber",
  },
]

export const GROWING_TILES: MetricTileData[] = [
  {
    label: "Reach",
    metric: "23 followers",
    detail: "+4 this week",
    variant: "amber",
  },
  {
    label: "Repeat Buyers",
    metric: "1 of 8",
    detail: "Dad's coworker!",
    variant: "amber",
  },
  {
    label: "Next Opportunity",
    metric: "Mar 1 market",
    detail: "+ Mar 8 bake sale",
    variant: "green",
  },
  {
    label: "Feedback",
    metric: "None yet",
    detail: "Ask buyers!",
    variant: "red",
    alert: true,
  },
  {
    label: "Visibility",
    metric: "1 post / week",
    detail: "2 channels active",
    variant: "amber",
  },
]

export const TODOS: TodoItem[] = [
  {
    id: "t1",
    text: "Make 12 jars garlic herb for market",
    done: true,
    date: "Feb 20",
  },
  {
    id: "t2",
    text: "Set up booth at Farmers Market",
    done: true,
    date: "Feb 22",
  },
  {
    id: "t3",
    text: "Buy jars + butter from Superstore",
    done: false,
    date: "Feb 24",
    urgent: true,
  },
  {
    id: "t4",
    text: "Reply to @bake_lover about 2-jar order",
    done: false,
    date: "Feb 25",
  },
]

export const MESSAGES: Message[] = [
  {
    id: "m1",
    emoji: "🎓",
    grad: "from-blue-500 to-blue-400",
    sender: "@oceandive",
    text: "We sold ALL 12 jars!!! Your garlic herb is 🔥",
    time: "1h",
    unread: true,
  },
  {
    id: "m2",
    emoji: "📊",
    grad: "from-cyan-600 to-cyan-400",
    sender: "Barry",
    isAI: true,
    text: "Nice market day! I've updated your numbers - check your Running tiles.",
    time: "4h",
    unread: true,
  },
]

export const EMAILS: Message[] = [
  {
    id: "e1",
    emoji: "🏪",
    grad: "from-emerald-600 to-emerald-400",
    sender: "Calgary Farmers Market",
    text: "Spring season vendor registration opens March 1…",
    time: "4h",
    unread: true,
  },
  {
    id: "e2",
    emoji: "🏫",
    grad: "from-blue-500 to-blue-400",
    sender: "Ridgewood Parent Council",
    text: "RE: Bake sale booth - interested in your butter for March 8.",
    time: "2d",
  },
]

export const CONTACTS: Contact[] = [
  {
    emoji: "🛒",
    bg: "bg-green-50",
    name: "Superstore Crowfoot",
    type: "Supplier",
  },
  {
    emoji: "🏪",
    bg: "bg-amber-50",
    name: "Calgary Farmers Market",
    type: "Sales Channel",
  },
  {
    emoji: "🏫",
    bg: "bg-blue-50",
    name: "Ridgewood Parent Council",
    type: "Customer",
  },
]

export const TAGGED_RESOURCES: Resource[] = [
  {
    emoji: "📋",
    bg: "bg-amber-50",
    name: "My Business Canvas",
    sub: "Last edited Feb 20",
    tagLabel: "Editable",
    tagBg: "bg-amber-50",
    tagColor: "text-amber-700",
  },
  {
    emoji: "📄",
    bg: "bg-green-50",
    name: "Alberta Cottage Food Rules",
    sub: "External link",
    tagLabel: "Reference",
    tagBg: "bg-muted",
    tagColor: "text-muted-foreground",
  },
  {
    emoji: "🎬",
    bg: "bg-sky-50",
    name: "How Packaging Sells",
    sub: "Video · 8 min",
    tagLabel: "Video",
    tagBg: "bg-blue-50",
    tagColor: "text-blue-700",
  },
  {
    emoji: "🏷",
    bg: "bg-amber-50",
    name: "Pricing 101",
    sub: "Course · 4 blocks",
    tagLabel: "Course",
    tagBg: "bg-blue-50",
    tagColor: "text-blue-700",
  },
  {
    emoji: "📸",
    bg: "bg-violet-50",
    name: "Product Photos",
    sub: "Article",
    tagLabel: "Learning",
    tagBg: "bg-green-50",
    tagColor: "text-green-700",
  },
]

export const CHANNELS: Channel[] = [
  {
    emoji: "🏪",
    bg: "bg-amber-50",
    name: "Calgary Farmers Market",
    status: "Active",
    active: true,
  },
  {
    emoji: "🏫",
    bg: "bg-green-50",
    name: "Ridgewood Entrepreneurs Club",
    status: "Collaborating",
    active: true,
  },
  {
    emoji: "🧈",
    bg: "bg-violet-50",
    name: "Alberta Young Makers",
    status: "Exploring",
    active: false,
  },
]

export const RECOMMENDED: Resource[] = [
  {
    emoji: "🎉",
    bg: "bg-amber-50",
    name: "After Your First Sale",
    sub: "Mini-course",
    tagLabel: "Course",
    tagBg: "bg-blue-50",
    tagColor: "text-blue-700",
  },
  {
    emoji: "📝",
    bg: "bg-sky-50",
    name: "Customer Feedback Template",
    sub: "Get reviews",
    tagLabel: "Tool",
    tagBg: "bg-amber-50",
    tagColor: "text-amber-700",
  },
  {
    emoji: "💰",
    bg: "bg-green-50",
    name: "Simple Money Tracking",
    sub: "Course · 3 blocks",
    tagLabel: "Course",
    tagBg: "bg-blue-50",
    tagColor: "text-blue-700",
  },
  {
    emoji: "🌟",
    bg: "bg-rose-50",
    name: "Teens Past $500/mo",
    sub: "Peer stories",
    tagLabel: "Stories",
    tagBg: "bg-green-50",
    tagColor: "text-green-700",
  },
  {
    emoji: "🧮",
    bg: "bg-violet-50",
    name: "Batch Planner",
    sub: "Calculator tool",
    tagLabel: "Tool",
    tagBg: "bg-amber-50",
    tagColor: "text-amber-700",
  },
]

export const WEEKLY_DATA: [number, number][] = [
  [0, 14],
  [0, 9],
  [0, 5],
  [0, 4],
  [16, 5],
  [48, 18],
]
