export const SANDBOX_GRADIENTS = [
  "from-emerald-400 to-emerald-600",
  "from-pink-400 to-pink-600",
  "from-orange-300 to-orange-500",
  "from-violet-400 to-violet-600",
  "from-sky-400 to-sky-600",
]

export const SANDBOX_EMOJIS = ["♻️", "🎨", "🐕", "💡", "🌿"]

export const SIDEHUSTLE_GRADIENTS = [
  "from-amber-300 to-amber-600",
  "from-green-400 to-green-600",
]

export const SIDEHUSTLE_EMOJIS = ["🧈", "🚗"]

function stableHash(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (Math.imul(31, hash) + id.charCodeAt(i)) >>> 0
  }
  return hash
}

export function getSandboxGradient(id: string): string {
  return SANDBOX_GRADIENTS[stableHash(id) % SANDBOX_GRADIENTS.length]
}

export function getSandboxEmoji(id: string): string {
  return SANDBOX_EMOJIS[stableHash(id) % SANDBOX_EMOJIS.length]
}

export function getSideHustleGradient(id: string): string {
  return SIDEHUSTLE_GRADIENTS[stableHash(id) % SIDEHUSTLE_GRADIENTS.length]
}

export function getSideHustleEmoji(id: string): string {
  return SIDEHUSTLE_EMOJIS[stableHash(id) % SIDEHUSTLE_EMOJIS.length]
}
