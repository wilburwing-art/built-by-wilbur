import type { Recipe } from "@/data/recipes"
import { displayIngredient, displayStep, formatScale } from "@/lib/ingredient-scale"
import type { Units } from "@/lib/ingredient-scale"

const KITCHEN_URL = "https://builtbywilbur.com/kitchen"

/**
 * Plain text for the clipboard: readable pasted into Messages, Notes, or
 * email. Mirrors whatever scale and units are on screen, and says so in the
 * header when they are not the defaults, so a pasted recipe declares what
 * it is.
 */
export function toPlainText(recipe: Recipe, scale = 1, units: Units = "us"): string {
  const notes = [
    scale !== 1 ? `scaled ${formatScale(scale)}` : null,
    units === "metric" ? "metric" : null,
  ].filter(Boolean)
  const lines = [
    recipe.name,
    `${recipe.category} · ${recipe.time} · ${recipe.difficulty}${notes.length > 0 ? ` · ${notes.join(" · ")}` : ""}`,
    "",
    recipe.desc,
    "",
    "INGREDIENTS",
    ...recipe.ingredients.map((i) => `- ${displayIngredient(i, scale, units)}`),
    "",
    "INSTRUCTIONS",
    ...recipe.steps.map((s, i) => `${i + 1}. ${displayStep(s, units)}`),
    "",
    `${KITCHEN_URL}/${recipe.slug}`,
  ]
  return lines.join("\n")
}

export interface StepTimer {
  /** Seconds to count down. On a range this is the lower bound. */
  seconds: number
  /** The text this was read out of, so the button says what it is timing. */
  matched: string
  /** Upper bound in seconds when the step gave a range. */
  upperSeconds?: number
}

const UNIT_SECONDS: Record<string, number> = {
  sec: 1,
  secs: 1,
  second: 1,
  seconds: 1,
  min: 60,
  mins: 60,
  minute: 60,
  minutes: 60,
  hr: 3600,
  hrs: 3600,
  hour: 3600,
  hours: 3600,
}

/**
 * A timer is offered only where the step text actually states a duration.
 * A step with nothing parseable gets no button rather than a guessed one, and
 * anything over four hours is refused: an overnight rise or a 24 hour brine is
 * not something a browser tab counts down.
 */
const MAX_TIMER_SECONDS = 4 * 3600

const DURATION =
  /(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)\s*(sec|secs|second|seconds|min|mins|minute|minutes|hr|hrs|hour|hours)\b|(\d+(?:\.\d+)?)\s*(sec|secs|second|seconds|min|mins|minute|minutes|hr|hrs|hour|hours)\b/i

export function parseDuration(step: string): StepTimer | null {
  const m = DURATION.exec(step)
  if (!m) return null

  const isRange = m[1] !== undefined
  const unit = (isRange ? m[3] : m[5]).toLowerCase()
  const factor = UNIT_SECONDS[unit]
  if (!factor) return null

  const low = Math.round(Number(isRange ? m[1] : m[4]) * factor)
  const high = isRange ? Math.round(Number(m[2]) * factor) : undefined

  if (!Number.isFinite(low) || low <= 0) return null
  if (low > MAX_TIMER_SECONDS) return null
  if (high !== undefined && (!Number.isFinite(high) || high < low)) return null

  return { seconds: low, matched: m[0], upperSeconds: high }
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (n: number) => String(n).padStart(2, "0")
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`
}
