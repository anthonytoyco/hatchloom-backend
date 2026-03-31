export type PhaseStatus = "done" | "current" | "future"

export interface PhaseStep {
  id: string
  label: string
  step: number | "🚀"
  status: PhaseStatus
  tooltip: string
  isLaunch?: boolean
}

export interface Gate {
  id: string
  afterPhaseIdx: number // which segment (between phase[afterPhaseIdx] and [afterPhaseIdx+1])
  question: string
  dueDate: string // display label e.g. "Feb 10"
  isoDate: string // YYYY-MM-DD for sorting / editing
  answered: boolean
  answer?: string
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

export const PHASES: PhaseStep[] = [
  {
    id: "p1",
    label: "Understand",
    step: 1,
    status: "done",
    tooltip: "Discover who your customer is and what they struggle with",
  },
  {
    id: "p2",
    label: "Define Problem",
    step: 2,
    status: "current",
    tooltip: "Pinpoint the specific problem worth solving",
  },
  {
    id: "p3",
    label: "Ideas",
    step: 3,
    status: "future",
    tooltip: "Generate a range of possible solutions",
  },
  {
    id: "p4",
    label: "Build It",
    step: 4,
    status: "future",
    tooltip: "Turn your best idea into something tangible",
  },
  {
    id: "p5",
    label: "Test It",
    step: 5,
    status: "future",
    tooltip: "Validate your solution with real users",
  },
  {
    id: "p6",
    label: "Launch!",
    step: "🚀",
    status: "future",
    tooltip: "Go to market",
    isLaunch: true,
  },
]

export const GATES: Gate[] = [
  {
    id: "g1",
    afterPhaseIdx: 0,
    question: "What's the #1 pain point I discovered?",
    dueDate: "Feb 10",
    isoDate: "2026-02-10",
    answered: true,
    answer:
      "Cafeteria staff throw out 200+ wrappers daily and feel guilty about it.",
  },
  {
    id: "g2",
    afterPhaseIdx: 1,
    question: "What problem am I solving, and for who?",
    dueDate: "Feb 25",
    isoDate: "2026-02-25",
    answered: false,
  },
  {
    id: "g3",
    afterPhaseIdx: 2,
    question: "Which idea am I going with, and why?",
    dueDate: "Mar 8",
    isoDate: "2026-03-08",
    answered: false,
  },
  {
    id: "g4",
    afterPhaseIdx: 3,
    question: "What exactly am I putting in front of people?",
    dueDate: "Mar 18",
    isoDate: "2026-03-18",
    answered: false,
  },
  {
    id: "g5",
    afterPhaseIdx: 4,
    question: "What did I change based on feedback?",
    dueDate: "Mar 28",
    isoDate: "2026-03-28",
    answered: false,
  },
]

export const TODOS: TodoItem[] = [
  {
    id: "t1",
    text: "Talk to 5 cafeteria workers about waste",
    done: true,
    date: "Feb 10",
  },
  {
    id: "t2",
    text: "Count wrappers thrown out in one lunch",
    done: true,
    date: "Feb 14",
  },
  {
    id: "t3",
    text: "Write problem statement in one sentence",
    done: false,
    date: "Feb 24",
    urgent: true,
  },
  {
    id: "t4",
    text: "List 3 things that make this problem hard",
    done: false,
    date: "Feb 28",
  },
  {
    id: "t5",
    text: "Share problem statement with team",
    done: false,
    date: "Mar 2",
  },
]

export const MESSAGES: Message[] = [
  {
    id: "m1",
    emoji: "🐬",
    grad: "from-blue-500 to-blue-400",
    sender: "@oceandive",
    text: "Found a compostable film supplier in BC - check this link!",
    time: "2h",
    unread: true,
  },
  {
    id: "m2",
    emoji: "💡",
    grad: "from-violet-600 to-violet-400",
    sender: "Spark",
    isAI: true,
    text: "Try narrowing your problem statement - who exactly feels the pain?",
    time: "5h",
  },
  {
    id: "m3",
    emoji: "👩‍🏫",
    grad: "from-orange-400 to-orange-300",
    sender: "Ms. Patel",
    text: "Great interview notes! Your problem statement draft is due Friday.",
    time: "1d",
  },
]

export const EMAILS: Message[] = [
  {
    id: "e1",
    emoji: "🏭",
    grad: "from-emerald-600 to-emerald-400",
    sender: "GreenWrap BC",
    text: "RE: Compostable film samples - We can ship 3 sample rolls by March 1...",
    time: "4h",
    unread: true,
  },
  {
    id: "e2",
    emoji: "🏫",
    grad: "from-blue-500 to-blue-400",
    sender: "Cafeteria Manager",
    text: "Happy to let you observe lunch service - come by Tuesday at 11:30.",
    time: "2d",
  },
]

export const CONTACTS: Contact[] = [
  { emoji: "🏭", bg: "bg-blue-50", name: "GreenWrap BC", type: "Supplier" },
  {
    emoji: "🏫",
    bg: "bg-green-50",
    name: "School Cafeteria",
    type: "Customer",
  },
  {
    emoji: "🧑‍🔬",
    bg: "bg-violet-50",
    name: "Alberta Innovates",
    type: "Organization",
  },
  {
    emoji: "🛒",
    bg: "bg-amber-50",
    name: "Calgary Farmers Mkt",
    type: "Marketplace",
  },
]

export const TAGGED_RESOURCES: Resource[] = [
  {
    emoji: "📄",
    bg: "bg-green-50",
    name: "Compostable Materials Guide",
    sub: "PDF · Saved from Explore",
    tagLabel: "Learning",
    tagBg: "bg-green-50",
    tagColor: "text-green-700",
  },
  {
    emoji: "🎬",
    bg: "bg-sky-50",
    name: "How Packaging Gets Made",
    sub: "Video · 12 min · Hatchloom",
    tagLabel: "Video",
    tagBg: "bg-blue-50",
    tagColor: "text-blue-700",
  },
  {
    emoji: "📝",
    bg: "bg-amber-50",
    name: "Guide to Writing a Problem Statement",
    sub: "Article · From Library",
    tagLabel: "Learning",
    tagBg: "bg-green-50",
    tagColor: "text-green-700",
  },
  {
    emoji: "♻️",
    bg: "bg-violet-50",
    name: "Compostable vs Recyclable Explained",
    sub: "Article · Bookmarked",
    tagLabel: "Learning",
    tagBg: "bg-green-50",
    tagColor: "text-green-700",
  },
  {
    emoji: "🔗",
    bg: "bg-muted",
    name: "CFIA Food Packaging Rules",
    sub: "External link · Bookmarked",
    tagLabel: "Reference",
    tagBg: "bg-muted",
    tagColor: "text-muted-foreground",
  },
]

export const CHANNELS: Channel[] = [
  {
    emoji: "🏫",
    bg: "bg-green-50",
    name: "School Cafeteria",
    status: "Active - 3 conversations",
    active: true,
  },
  {
    emoji: "🌿",
    bg: "bg-blue-50",
    name: "Ridgewood Eco Club",
    status: "Active - collaborating",
    active: true,
  },
  {
    emoji: "♻️",
    bg: "bg-violet-50",
    name: "Alberta Zero Waste Network",
    status: "Exploring",
    active: false,
  },
  {
    emoji: "🛒",
    bg: "bg-amber-50",
    name: "Calgary Farmers Market",
    status: "Bookmarked",
    active: false,
  },
]

export const RECOMMENDED: Resource[] = [
  {
    emoji: "📝",
    bg: "bg-amber-50",
    name: "Problem Statement Template",
    sub: "Directly useful right now",
    tagLabel: "Tool",
    tagBg: "bg-amber-50",
    tagColor: "text-amber-700",
  },
  {
    emoji: "👤",
    bg: "bg-sky-50",
    name: "Who Is Your Customer?",
    sub: "Mini-course · 3 blocks",
    tagLabel: "Course",
    tagBg: "bg-blue-50",
    tagColor: "text-blue-700",
  },
  {
    emoji: "🌍",
    bg: "bg-rose-50",
    name: "How Other Teens Solved Packaging Problems",
    sub: "Peer examples · Inspiring",
    tagLabel: "Stories",
    tagBg: "bg-green-50",
    tagColor: "text-green-700",
  },
  {
    emoji: "📓",
    bg: "bg-green-50",
    name: "Observation Journal Template",
    sub: "Organise what you learned",
    tagLabel: "Tool",
    tagBg: "bg-amber-50",
    tagColor: "text-amber-700",
  },
  {
    emoji: "💡",
    bg: "bg-violet-50",
    name: "Idea Generator",
    sub: "Get ready for your next phase",
    tagLabel: "Tool",
    tagBg: "bg-amber-50",
    tagColor: "text-amber-700",
  },
]

export const TEAM_MEMBERS = [
  {
    id: "1",
    emoji: "🦊",
    name: "@firefox_hl (You)",
    grad: "from-[#1E1E2E] to-[#3D3060]",
    role: "Lead",
    isAI: false,
  },
  {
    id: "2",
    emoji: "🐬",
    name: "@oceandive",
    grad: "from-blue-500 to-blue-400",
    role: "Researcher",
    isAI: false,
  },
  {
    id: "3",
    emoji: "💡",
    name: "Spark",
    grad: "from-violet-600 to-violet-400",
    role: "Ideas Coach",
    isAI: true,
  },
  {
    id: "4",
    emoji: "🌍",
    name: "Scout",
    grad: "from-green-500 to-green-700",
    role: "Market Explorer",
    isAI: true,
  },
  {
    id: "5",
    emoji: "📊",
    name: "Barry",
    grad: "from-cyan-600 to-cyan-400",
    role: "Business Mentor",
    isAI: true,
  },
]
