// ─────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────

export type SideHustleStatus = "IN_THE_LAB" | "LIVE_VENTURE"

export type PositionStatus = "OPEN" | "FILLED" | "CLOSED"

export type ToolType =
  | "POSTIT"
  | "GUIDED_QA"
  | "CANVAS_BOARD"
  | "CHECKLIST"
  | "CALCULATOR"
  | "DECK"
  | "TEMPLATE_FORM"
  | "DOWNLOAD"
  | "IMAGE_PDF"
  | "VIDEO_AUDIO"
  | "SOCIAL_POST"
  | "LOGO_BRAND"
  | "SURVEY"
  | "INVOICE"
  | "QR_CODE"

export type RankTier = "ROOKIE" | "EXPLORER" | "CHALLENGER" | "PRO" | "LEGEND"

export type Swimlane = "EI" | "SS" | "RB" | "EE"

// ─────────────────────────────────────────────
// Core backend entities (mirrors LaunchPad DTOs)
// ─────────────────────────────────────────────

export interface Sandbox {
  id: string
  studentId: string
  title: string
  description: string | null
  createdAt: string // ISO 8601
  updatedAt: string
}

export interface SandboxTool {
  id: string
  sandboxId: string
  toolType: ToolType
  data: string | null // JSON string stored by backend
  createdAt: string
}

export interface SideHustle {
  id: string
  sandboxId: string | null
  studentId: string
  title: string
  description: string | null
  status: SideHustleStatus
  hasOpenPositions: boolean
  createdAt: string
  updatedAt: string
}

export interface BusinessModelCanvas {
  id: string
  sideHustleId: string
  keyPartners: string | null
  keyActivities: string | null
  keyResources: string | null
  valuePropositions: string | null
  customerRelationships: string | null
  channels: string | null
  customerSegments: string | null
  costStructure: string | null
  revenueStreams: string | null
}

export interface Team {
  id: string
  sideHustleId: string
  createdAt: string
}

export interface TeamMember {
  id: string
  teamId: string
  studentId: string
  role: string | null
  joinedAt: string
  // UI-only display fields populated client-side from student profile
  displayName?: string
  emoji?: string
}

export interface Position {
  id: string
  sideHustleId: string
  title: string
  description: string | null
  status: PositionStatus
}

// ─────────────────────────────────────────────
// Aggregator DTOs (mirrors LaunchPadHomeView)
// ─────────────────────────────────────────────

export interface SandboxSummary {
  id: string
  title: string
  description: string | null
  createdAt: string
  toolCount: number
}

export interface SideHustleSummary {
  id: string
  title: string
  status: SideHustleStatus
  hasOpenPositions: boolean
  teamSize: number
  createdAt: string
}

export interface LaunchPadHomeView {
  studentId: string
  inTheLabCount: number
  liveVenturesCount: number
  sandboxes: SandboxSummary[]
  sideHustles: SideHustleSummary[]
}

// ─────────────────────────────────────────────
// UI-only types (not from backend)
// ─────────────────────────────────────────────

export interface StudentProfile {
  id: string
  name: string
  emoji: string
  school: string
  rank: RankTier
  xp: number
  xpToNextRank: number
  streakDays: number
  swimlane: Swimlane
}

// Rank metadata used for display (colors, labels, XP thresholds)
export interface RankMeta {
  tier: RankTier
  label: string
  colorClass: string // Tailwind text color
  bgClass: string // Tailwind bg color
  borderClass: string // Tailwind border color
  xpRequired: number
}

// Tool type metadata used for the tool picker and tool cards
export interface ToolMeta {
  type: ToolType
  label: string
  description: string
  icon: string // Lucide icon name
}

// Sidebar nav item shape
export interface NavItem {
  id: string
  label: string
  icon: string // Lucide icon name
  href: string
  badge?: number | "NEW"
}

// ─────────────────────────────────────────────
// Request shapes (mirrors backend request DTOs)
// Used by mutation hooks and form validation schemas
// ─────────────────────────────────────────────

export interface CreateSandboxRequest {
  studentId: string
  title: string
  description?: string
}

export interface UpdateSandboxRequest {
  title: string
  description?: string
}

export interface CreateSideHustleRequest {
  sandboxId: string
  studentId: string
  title: string
  description?: string
  type: SideHustleStatus
}

export interface UpdateSideHustleRequest {
  title: string
  description?: string
}

export interface EditBMCRequest {
  section: string
  content: string
}

export interface AddTeamMemberRequest {
  userId: string
  role?: string
}

export interface CreatePositionRequest {
  title: string
  description?: string
}

export interface UpdatePositionStatusRequest {
  status: PositionStatus
}

export interface CreateSandboxToolRequest {
  toolType: ToolType
  data?: string
}

export interface UpdateSandboxToolRequest {
  data: string
}
