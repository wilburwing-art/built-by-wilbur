import { useCallback, useEffect, useRef, useState } from "react"
import type { CSSProperties } from "react"
import type { Recipe } from "@/data/recipes"
import { displayIngredient, displayStep } from "@/lib/ingredient-scale"
import type { Units } from "@/lib/ingredient-scale"
import { formatClock, parseDuration } from "@/lib/recipe-text"

interface CookModeProps {
  recipe: Recipe
  accent: string
  scale: number
  units: Units
  onClose: () => void
}

const checkedKey = (slug: string) => `bbw-kitchen-checked:${slug}`

function readChecked(slug: string): number[] {
  try {
    const raw = window.localStorage.getItem(checkedKey(slug))
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === "number") : []
  } catch {
    return []
  }
}

function writeChecked(slug: string, values: number[]) {
  try {
    window.localStorage.setItem(checkedKey(slug), JSON.stringify(values))
  } catch {
    // A private window, or blocked site data. The checklist still works for
    // this visit, it just will not survive a reload.
  }
}

function beep() {
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return
    const ctx = new Ctor()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 1)
    osc.onended = () => void ctx.close()
  } catch {
    // Audio is a nicety, never a requirement.
  }
}

export function CookMode({ recipe, accent, scale, units, onClose }: CookModeProps) {
  const [stepIndex, setStepIndex] = useState(0)
  // Collapsed by default: the step is what a cook needs on screen, and the
  // full ingredient list is one tap away and was just read on the recipe page.
  const [showIngredients, setShowIngredients] = useState(false)
  const [checked, setChecked] = useState<number[]>(() => readChecked(recipe.slug))

  // A timer is held as a wall-clock deadline rather than a decrementing count,
  // so a phone that throttles the tab mid step still comes back with the right
  // time left. It is tagged with the step it was read out of, which is what
  // retires it when the cook moves on, with no reset needed.
  const [timerStep, setTimerStep] = useState<number | null>(null)
  const [deadline, setDeadline] = useState<number | null>(null)
  const [pausedAt, setPausedAt] = useState<number | null>(null)
  const [ticking, setTicking] = useState<number | null>(null)

  const sentinelRef = useRef<WakeLockSentinel | null>(null)

  const step = recipe.steps[stepIndex]
  // The timer reads the authored text: durations are unit-independent, so
  // temperature conversion cannot break it.
  const timer = parseDuration(step)
  const last = stepIndex === recipe.steps.length - 1

  const remaining = timerStep === stepIndex ? (pausedAt ?? ticking) : null
  const rang = remaining === 0

  // Keep the screen on while someone is cooking off their phone. Absent on
  // older iOS, where the page behaves as it always has.
  useEffect(() => {
    let cancelled = false
    // Typed as always present by lib.dom, missing at runtime on older Safari.
    const supported = "wakeLock" in navigator

    const acquire = async () => {
      if (!supported) return
      try {
        const sentinel = await navigator.wakeLock.request("screen")
        if (cancelled) {
          void sentinel.release()
          return
        }
        sentinelRef.current = sentinel
      } catch {
        // Denied, or the tab lost focus mid request.
      }
    }

    const onVisibility = () => {
      if (document.visibilityState === "visible") void acquire()
    }

    void acquire()
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      cancelled = true
      document.removeEventListener("visibilitychange", onVisibility)
      const sentinel = sentinelRef.current
      sentinelRef.current = null
      if (sentinel) void sentinel.release()
    }
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") setStepIndex((i) => Math.min(i + 1, recipe.steps.length - 1))
      if (e.key === "ArrowLeft") setStepIndex((i) => Math.max(i - 1, 0))
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose, recipe.steps.length])

  // Re-read the clock often enough for it to look like a clock, and stop as
  // soon as the deadline passes.
  useEffect(() => {
    if (deadline === null) return
    const id = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      setTicking(left)
      if (left === 0) window.clearInterval(id)
    }, 250)
    return () => window.clearInterval(id)
  }, [deadline])

  useEffect(() => {
    if (rang) beep()
  }, [rang])

  const toggleIngredient = useCallback(
    (i: number) => {
      setChecked((prev) => {
        const next = prev.includes(i) ? prev.filter((n) => n !== i) : [...prev, i]
        writeChecked(recipe.slug, next)
        return next
      })
    },
    [recipe.slug],
  )

  const clearChecked = useCallback(() => {
    setChecked([])
    writeChecked(recipe.slug, [])
  }, [recipe.slug])

  const startTimer = () => {
    if (!timer) return
    setTimerStep(stepIndex)
    setPausedAt(null)
    setTicking(timer.seconds)
    setDeadline(Date.now() + timer.seconds * 1000)
  }

  const pauseTimer = () => {
    setPausedAt(remaining ?? 0)
    setDeadline(null)
  }


  const resumeTimer = () => {
    setDeadline(Date.now() + (pausedAt ?? 0) * 1000)
    setPausedAt(null)
  }

  const dismissTimer = () => {
    setTimerStep(null)
    setDeadline(null)
    setPausedAt(null)
    setTicking(null)
  }

  return (
    <div className="cook-mode" style={{ "--accent": accent } as CSSProperties}>
      <div className="cook-bar">
        <div className="cook-bar-title">{recipe.name}</div>
        <div className="cook-bar-count">
          Step {stepIndex + 1} of {recipe.steps.length}
        </div>
        <button className="cook-close" onClick={onClose} aria-label="Leave cook mode">
          ✕
        </button>
      </div>

      <div className="cook-progress">
        <div
          className="cook-progress-fill"
          style={{ width: `${((stepIndex + 1) / recipe.steps.length) * 100}%` }}
        />
      </div>

      <div className="cook-body">
        <p className="cook-step">{displayStep(step, units)}</p>

        {timer && (
          <div className="cook-timer">
            {remaining === null ? (
              <button className="cook-timer-start" onClick={startTimer}>
                Start timer for {timer.matched}
              </button>
            ) : (
              <div className="cook-timer-live">
                <div className={`cook-clock ${rang ? "rang" : ""}`}>{formatClock(remaining)}</div>
                <div className="cook-timer-note">
                  {rang
                    ? timer.upperSeconds
                      ? `Check it. The step allows up to ${formatClock(timer.upperSeconds)}.`
                      : "Time."
                    : timer.upperSeconds
                      ? `Counting the low end of ${timer.matched}. Check at zero.`
                      : `Counting ${timer.matched}.`}
                </div>
                <div className="cook-timer-controls">
                  {!rang &&
                    (pausedAt === null ? (
                      <button onClick={pauseTimer}>Pause</button>
                    ) : (
                      <button onClick={resumeTimer}>Resume</button>
                    ))}
                  <button onClick={startTimer}>Reset</button>
                  <button onClick={dismissTimer}>Dismiss</button>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="cook-ing">
          <button
            className="cook-ing-toggle"
            onClick={() => setShowIngredients((v) => !v)}
            aria-expanded={showIngredients}
          >
            <span>
              Ingredients · {checked.length} of {recipe.ingredients.length} checked
            </span>
            <span>{showIngredients ? "Hide" : "Show"}</span>
          </button>
          {showIngredients && (
            <div className="cook-ing-list">
              {recipe.ingredients.map((ing, i) => (
                <label key={i} className={`cook-ing-item ${checked.includes(i) ? "done" : ""}`}>
                  <input
                    type="checkbox"
                    checked={checked.includes(i)}
                    onChange={() => toggleIngredient(i)}
                  />
                  <span>{displayIngredient(ing, scale, units)}</span>
                </label>
              ))}
              {checked.length > 0 && (
                <button className="cook-ing-clear" onClick={clearChecked}>
                  Uncheck all
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="cook-nav">
        <button
          className="cook-nav-btn"
          disabled={stepIndex === 0}
          onClick={() => setStepIndex((i) => Math.max(i - 1, 0))}
        >
          Back
        </button>
        {last ? (
          <button className="cook-nav-btn primary" onClick={onClose}>
            Done
          </button>
        ) : (
          <button
            className="cook-nav-btn primary"
            onClick={() => setStepIndex((i) => Math.min(i + 1, recipe.steps.length - 1))}
          >
            Next
          </button>
        )}
      </div>
    </div>
  )
}
