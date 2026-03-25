import type {
  BusinessModelCanvas,
  LaunchPadHomeView,
  Position,
  RankMeta,
  Sandbox,
  SandboxSummary,
  SandboxTool,
  SideHustle,
  SideHustleSummary,
  StudentProfile,
  TeamMember,
  ToolMeta,
} from "./types"

// ─────────────────────────────────────────────
// Student
// ─────────────────────────────────────────────

export const MOCK_STUDENT: StudentProfile = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "Alex Rivera",
  emoji: "🦊",
  school: "Westview Academy",
  rank: "CHALLENGER",
  xp: 3420,
  xpToNextRank: 5000,
  streakDays: 14,
  swimlane: "EI",
}

// ─────────────────────────────────────────────
// Sandboxes
// ─────────────────────────────────────────────

export const MOCK_SANDBOXES: Sandbox[] = [
  {
    id: "11111111-1111-1111-1111-111111111101",
    studentId: "00000000-0000-0000-0000-000000000001",
    title: "EcoSnack Packaging",
    description:
      "Exploring sustainable packaging solutions for the snack food industry.",
    createdAt: "2026-01-10T09:00:00Z",
    updatedAt: "2026-03-20T14:30:00Z",
  },
  {
    id: "11111111-1111-1111-1111-111111111102",
    studentId: "00000000-0000-0000-0000-000000000001",
    title: "Campus Ride Share",
    description:
      "A peer-to-peer ride sharing app designed for university campuses.",
    createdAt: "2026-02-05T11:00:00Z",
    updatedAt: "2026-03-18T10:15:00Z",
  },
  {
    id: "11111111-1111-1111-1111-111111111103",
    studentId: "00000000-0000-0000-0000-000000000001",
    title: "AI Tutor Bot",
    description: null,
    createdAt: "2026-03-01T08:00:00Z",
    updatedAt: "2026-03-01T08:00:00Z",
  },
]

// ─────────────────────────────────────────────
// Sandbox Tools
// ─────────────────────────────────────────────

export const MOCK_SANDBOX_TOOLS: SandboxTool[] = [
  {
    id: "77777777-7777-7777-7777-777777777701",
    sandboxId: "11111111-1111-1111-1111-111111111101",
    toolType: "POSTIT",
    data: JSON.stringify({
      content:
        "Look into compostable mycelium packaging as a key differentiator.",
    }),
    createdAt: "2026-01-12T10:00:00Z",
  },
  {
    id: "77777777-7777-7777-7777-777777777702",
    sandboxId: "11111111-1111-1111-1111-111111111101",
    toolType: "CHECKLIST",
    data: JSON.stringify({
      items: [
        { id: "1", text: "Research compostable materials", checked: true },
        { id: "2", text: "Interview 5 snack brand owners", checked: true },
        { id: "3", text: "Prototype packaging mock-up", checked: false },
        {
          id: "4",
          text: "Cost analysis vs. traditional packaging",
          checked: false,
        },
      ],
    }),
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "77777777-7777-7777-7777-777777777703",
    sandboxId: "11111111-1111-1111-1111-111111111101",
    toolType: "CANVAS_BOARD",
    data: JSON.stringify({ notes: [] }),
    createdAt: "2026-02-01T10:00:00Z",
  },
  {
    id: "77777777-7777-7777-7777-777777777704",
    sandboxId: "11111111-1111-1111-1111-111111111102",
    toolType: "GUIDED_QA",
    data: JSON.stringify({
      currentStep: 2,
      answers: {
        "0": "Students who commute between off-campus housing and university buildings.",
        "1": "No safe, affordable, and trusted option that fits a student schedule.",
      },
    }),
    createdAt: "2026-02-10T09:00:00Z",
  },
  {
    id: "77777777-7777-7777-7777-777777777705",
    sandboxId: "11111111-1111-1111-1111-111111111102",
    toolType: "DECK",
    data: JSON.stringify({
      slides: [
        {
          id: "s1",
          title: "Campus Ride Share",
          body: "Connecting students, one ride at a time.",
        },
        {
          id: "s2",
          title: "The Problem",
          body: "Students lack safe, affordable campus transport options.",
        },
        {
          id: "s3",
          title: "Our Solution",
          body: "A verified, student-only ride share platform.",
        },
      ],
    }),
    createdAt: "2026-02-20T10:00:00Z",
  },
]

// ─────────────────────────────────────────────
// SideHustles
// ─────────────────────────────────────────────

export const MOCK_SIDE_HUSTLES: SideHustle[] = [
  {
    id: "22222222-2222-2222-2222-222222222201",
    sandboxId: "11111111-1111-1111-1111-111111111101",
    studentId: "00000000-0000-0000-0000-000000000001",
    title: "Flavour Butter Co.",
    description:
      "Small-batch artisan nut butters with bold, unexpected flavour combinations.",
    status: "LIVE_VENTURE",
    hasOpenPositions: true,
    createdAt: "2026-02-14T09:00:00Z",
    updatedAt: "2026-03-22T16:00:00Z",
  },
  {
    id: "22222222-2222-2222-2222-222222222202",
    sandboxId: "11111111-1111-1111-1111-111111111102",
    studentId: "00000000-0000-0000-0000-000000000001",
    title: "GreenRoute Logistics",
    description:
      "Carbon-neutral last-mile delivery network for local indie retailers.",
    status: "IN_THE_LAB",
    hasOpenPositions: false,
    createdAt: "2026-03-05T11:00:00Z",
    updatedAt: "2026-03-15T09:30:00Z",
  },
]

// ─────────────────────────────────────────────
// Business Model Canvas
// ─────────────────────────────────────────────

export const MOCK_BMC: BusinessModelCanvas = {
  id: "33333333-3333-3333-3333-333333333301",
  sideHustleId: "22222222-2222-2222-2222-222222222201",
  keyPartners:
    "Local nut farms · Specialty flavour suppliers · Eco-packaging vendors",
  keyActivities:
    "Small-batch production · Flavour R&D · Farmers market sales · Online order fulfilment",
  keyResources:
    "Commercial kitchen (shared) · Brand identity · Founder culinary expertise",
  valuePropositions:
    "Unique flavour profiles unavailable in mass-market products · Transparent local sourcing · Allergen-friendly options",
  customerRelationships:
    "Weekly newsletter · Instagram community · Personalised tasting notes with every order",
  channels:
    "Farmers markets · Instagram DMs / Shopify store · Local specialty grocery consignment",
  customerSegments:
    "Health-conscious foodies aged 22–40 · Gift buyers · Local specialty grocers",
  costStructure: null,
  revenueStreams:
    "Direct-to-consumer online sales · Farmers market revenue · Wholesale to retailers",
}

// ─────────────────────────────────────────────
// Team Members
// ─────────────────────────────────────────────

export const MOCK_TEAM: TeamMember[] = [
  {
    id: "55555555-5555-5555-5555-555555555501",
    teamId: "44444444-4444-4444-4444-444444444401",
    studentId: "00000000-0000-0000-0000-000000000001",
    role: "Founder & Product",
    joinedAt: "2026-02-14T09:00:00Z",
    displayName: "Alex Rivera",
    emoji: "🦊",
  },
  {
    id: "55555555-5555-5555-5555-555555555502",
    teamId: "44444444-4444-4444-4444-444444444401",
    studentId: "00000000-0000-0000-0000-000000000002",
    role: "Marketing",
    joinedAt: "2026-02-20T10:00:00Z",
    displayName: "Jordan Lee",
    emoji: "🐼",
  },
  {
    id: "55555555-5555-5555-5555-555555555503",
    teamId: "44444444-4444-4444-4444-444444444401",
    studentId: "00000000-0000-0000-0000-000000000003",
    role: "Operations",
    joinedAt: "2026-03-01T09:00:00Z",
    displayName: "Sam Okafor",
    emoji: "🦁",
  },
]

// ─────────────────────────────────────────────
// Positions
// ─────────────────────────────────────────────

export const MOCK_POSITIONS: Position[] = [
  {
    id: "66666666-6666-6666-6666-666666666601",
    sideHustleId: "22222222-2222-2222-2222-222222222201",
    title: "Finance Lead",
    description:
      "Manage budgeting, pricing strategy, and monthly P&L reporting for the venture.",
    status: "OPEN",
  },
  {
    id: "66666666-6666-6666-6666-666666666602",
    sideHustleId: "22222222-2222-2222-2222-222222222201",
    title: "Brand Designer",
    description:
      "Own visual identity: packaging design, social assets, and brand guidelines.",
    status: "FILLED",
  },
  {
    id: "66666666-6666-6666-6666-666666666603",
    sideHustleId: "22222222-2222-2222-2222-222222222201",
    title: "Sales Rep (Grocery)",
    description:
      "Pitch and onboard local specialty grocers as wholesale accounts.",
    status: "CLOSED",
  },
]

// ─────────────────────────────────────────────
// LaunchPad Home View (Aggregator)
// ─────────────────────────────────────────────

export const MOCK_HOME_VIEW: LaunchPadHomeView = {
  studentId: "00000000-0000-0000-0000-000000000001",
  inTheLabCount: 2,
  liveVenturesCount: 1,
  sandboxes: MOCK_SANDBOXES.map<SandboxSummary>((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    createdAt: s.createdAt,
    toolCount: MOCK_SANDBOX_TOOLS.filter((t) => t.sandboxId === s.id).length,
  })),
  sideHustles: MOCK_SIDE_HUSTLES.map<SideHustleSummary>((sh) => ({
    id: sh.id,
    title: sh.title,
    status: sh.status,
    hasOpenPositions: sh.hasOpenPositions,
    teamSize: MOCK_TEAM.filter(
      (m) => m.teamId === "44444444-4444-4444-4444-444444444401"
    ).length,
    createdAt: sh.createdAt,
  })),
}

// ─────────────────────────────────────────────
// Rank metadata (display config)
// ─────────────────────────────────────────────

export const RANK_META: Record<string, RankMeta> = {
  ROOKIE: {
    tier: "ROOKIE",
    label: "Rookie",
    colorClass: "text-rank-rookie",
    bgClass: "bg-green-50",
    borderClass: "border-green-200",
    xpRequired: 0,
  },
  EXPLORER: {
    tier: "EXPLORER",
    label: "Explorer",
    colorClass: "text-rank-explorer",
    bgClass: "bg-blue-50",
    borderClass: "border-blue-200",
    xpRequired: 1000,
  },
  CHALLENGER: {
    tier: "CHALLENGER",
    label: "Challenger",
    colorClass: "text-rank-challenger",
    bgClass: "bg-orange-50",
    borderClass: "border-orange-200",
    xpRequired: 2500,
  },
  PRO: {
    tier: "PRO",
    label: "Pro",
    colorClass: "text-rank-pro",
    bgClass: "bg-purple-50",
    borderClass: "border-purple-200",
    xpRequired: 5000,
  },
  LEGEND: {
    tier: "LEGEND",
    label: "Legend",
    colorClass: "text-rank-legend",
    bgClass: "bg-yellow-50",
    borderClass: "border-yellow-200",
    xpRequired: 10000,
  },
}

// ─────────────────────────────────────────────
// Tool metadata (display config for picker + cards)
// ─────────────────────────────────────────────

export const TOOL_META: ToolMeta[] = [
  {
    type: "POSTIT",
    label: "Post-it Note",
    description: "Quick freeform notes",
    icon: "StickyNote",
  },
  {
    type: "GUIDED_QA",
    label: "Guided Q&A",
    description: "Step-by-step question flow",
    icon: "MessageSquare",
  },
  {
    type: "CANVAS_BOARD",
    label: "Canvas Board",
    description: "Visual sticky-note board",
    icon: "LayoutDashboard",
  },
  {
    type: "CHECKLIST",
    label: "Checklist",
    description: "Task tracker with progress",
    icon: "CheckSquare",
  },
  {
    type: "CALCULATOR",
    label: "Calculator",
    description: "Key-value table with totals",
    icon: "Calculator",
  },
  {
    type: "DECK",
    label: "Slide Deck",
    description: "Simple presentation slides",
    icon: "GalleryHorizontal",
  },
  {
    type: "TEMPLATE_FORM",
    label: "Template Form",
    description: "Structured data entry form",
    icon: "FileText",
  },
  {
    type: "DOWNLOAD",
    label: "Downloads",
    description: "Curated file & link collection",
    icon: "Download",
  },
  {
    type: "IMAGE_PDF",
    label: "Image / PDF Maker",
    description: "Create visual documents",
    icon: "Image",
  },
  {
    type: "VIDEO_AUDIO",
    label: "Video & Audio",
    description: "Record media clips",
    icon: "Video",
  },
  {
    type: "SOCIAL_POST",
    label: "Social Post",
    description: "Draft social content",
    icon: "Share2",
  },
  {
    type: "LOGO_BRAND",
    label: "Logo & Brand Kit",
    description: "Brand asset builder",
    icon: "Palette",
  },
  {
    type: "SURVEY",
    label: "Survey",
    description: "Collect structured feedback",
    icon: "ClipboardList",
  },
  {
    type: "INVOICE",
    label: "Invoice",
    description: "Generate invoices & receipts",
    icon: "Receipt",
  },
  {
    type: "QR_CODE",
    label: "QR Code",
    description: "Generate scannable QR codes",
    icon: "QrCode",
  },
]
