import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { CSSProperties } from "react"
import { Helmet } from "react-helmet-async"
import { useNavigate, useParams } from "react-router-dom"
import {
  CATEGORIES,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  bySlug,
  recipes,
} from "@/data/recipes"
import type { Recipe } from "@/data/recipes"
import { CookMode } from "@/components/CookMode"
import { RecipeDirectory } from "@/components/RecipeDirectory"
import { toPlainText } from "@/lib/recipe-text"
import { EMPTY_FILTERS, isFiltered, selectRecipes } from "@/lib/recipe-search"
import { TIME_FILTERS } from "@/lib/recipe-search"
import type { Filters, SortKey } from "@/lib/recipe-search"
import { Seo } from "@/components/Seo"
import "./kitchen.css"

const MODE_KEY = "bbw-kitchen-mode"

function readMode(): "spin" | "browse" {
  try {
    return window.localStorage.getItem(MODE_KEY) === "browse" ? "browse" : "spin"
  } catch {
    return "spin"
  }
}

export function Kitchen() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const [mode, setModeState] = useState<"spin" | "browse">(readMode)
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [sort, setSort] = useState<SortKey>("relevance")
  const [isSpinning, setIsSpinning] = useState(false)
  const [result, setResult] = useState<Recipe | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [spinDisplay, setSpinDisplay] = useState<Recipe[]>([])
  const [history, setHistory] = useState<Recipe[]>([])
  // The URL is the single source of truth for which recipe is open, so a link
  // someone was sent opens on that recipe and the back button closes it.
  const viewingRecipe = slug ? (bySlug(slug) ?? null) : null
  // Held as a slug rather than a boolean so leaving a recipe by any route,
  // the back button included, cannot leave cook mode armed for the next one.
  const [cookingSlug, setCookingSlug] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const intervalRef = useRef<number | null>(null)
  const timeoutRef = useRef<number | null>(null)

  // One pool for both modes, so the counter under the wheel always tells the
  // truth about what a spin can land on.
  const pool = useMemo(() => selectRecipes(recipes, filters, sort), [filters, sort])

  const setMode = useCallback((next: "spin" | "browse") => {
    setModeState(next)
    try {
      window.localStorage.setItem(MODE_KEY, next)
    } catch {
      // Private window or blocked site data; the mode just will not be remembered.
    }
  }, [])

  useEffect(() => {
    if (slug && !viewingRecipe) navigate("/kitchen", { replace: true })
  }, [slug, viewingRecipe, navigate])

  const openRecipe = useCallback(
    (recipe: Recipe) => {
      navigate(`/kitchen/${recipe.slug}`)
    },
    [navigate],
  )

  const closeRecipe = useCallback(() => {
    setCookingSlug(null)
    navigate("/kitchen")
  }, [navigate])

  const spin = useCallback(() => {
    if (isSpinning || pool.length === 0) return
    setIsSpinning(true)
    setShowResult(false)
    setResult(null)
    let count = 0
    const totalTicks = 22
    const pick = pool[Math.floor(Math.random() * pool.length)]
    intervalRef.current = window.setInterval(() => {
      count++
      setSpinDisplay((prev) =>
        [pool[Math.floor(Math.random() * pool.length)], ...prev].slice(0, 5),
      )
      if (count >= totalTicks) {
        if (intervalRef.current !== null) window.clearInterval(intervalRef.current)
        setSpinDisplay([pick])
        timeoutRef.current = window.setTimeout(() => {
          setResult(pick)
          setShowResult(true)
          setIsSpinning(false)
          setHistory((prev) => [pick, ...prev].slice(0, 10))
        }, 300)
      }
    }, 60 + count * 8)
  }, [isSpinning, pool])

  const spinFresh = useCallback(() => {
    if (viewingRecipe) closeRecipe()
    spin()
  }, [closeRecipe, spin, viewingRecipe])

  useEffect(
    () => () => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current)
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
    },
    [],
  )

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !cookingSlug && viewingRecipe) closeRecipe()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [closeRecipe, cookingSlug, viewingRecipe])

  const copyRecipe = useCallback(async (recipe: Recipe) => {
    try {
      await navigator.clipboard.writeText(toPlainText(recipe))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }, [])

  const accentColor = CATEGORY_COLORS[filters.category]

  return (
    <div className="kitchen-root" style={{ "--accent": accentColor } as CSSProperties}>
      <Seo
        title="Kitchen"
        description="A private recipe spinner."
        path="/kitchen"
        noindex
      />
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:wght@400;500;600;700&display=swap"
        />
      </Helmet>

      <div
        className="kitchen-glow"
        style={{
          background: `radial-gradient(ellipse, color-mix(in srgb, ${accentColor} 8%, transparent), transparent 70%)`,
        }}
      />

      <div className="kitchen-inner">
        <div className="kitchen-head">
          <h1>
            What's for{" "}
            <span style={{ color: accentColor, fontStyle: "italic", transition: "color 0.3s ease" }}>
              {filters.category === "All" ? "dinner" : filters.category.toLowerCase()}
            </span>
            ?
          </h1>
          <p>
            {mode === "spin"
              ? "Spin the wheel. Let fate decide."
              : "Search by name or by what is in the fridge."}
          </p>
        </div>

        <div className="cat-row">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`cat-btn ${filters.category === cat ? "active" : ""}`}
              style={{ "--accent": CATEGORY_COLORS[cat] } as CSSProperties}
              onClick={() => {
                setFilters({ ...filters, category: cat })
                setShowResult(false)
                setResult(null)
                if (viewingRecipe) closeRecipe()
              }}
            >
              <span>{CATEGORY_ICONS[cat]}</span>
              {cat}
            </button>
          ))}
        </div>

        <div className="mode-row">
          <button
            className={`mode-btn ${mode === "spin" ? "active" : ""}`}
            onClick={() => setMode("spin")}
          >
            <span aria-hidden="true">🎰</span> Spin
          </button>
          <button
            className={`mode-btn ${mode === "browse" ? "active" : ""}`}
            onClick={() => setMode("browse")}
          >
            <span aria-hidden="true">📖</span> Browse
          </button>
        </div>

        {mode === "spin" && (
          <>
        <div className="spin-wrap">
          <button
            className={`spin-btn ${isSpinning ? "spinning" : ""}`}
            onClick={spin}
            disabled={pool.length === 0}
          >
            <span className={`spin-emoji ${isSpinning ? "anim" : ""}`}>
              {isSpinning && spinDisplay[0] ? spinDisplay[0].emoji : result ? result.emoji : "🎰"}
            </span>
            <span>{isSpinning ? "..." : "SPIN"}</span>
          </button>
          <p className="counter">
            {pool.length === 0
              ? "Nothing matches those filters"
              : `${pool.length} recipe${pool.length !== 1 ? "s" : ""} in the pot`}
          </p>
          {/* Browse's filters narrow the wheel too, so Spin has to say why the
              pot shrank and offer a way out without switching modes. */}
          {isFiltered(filters) && (
            <p className="counter pot-why">
              {[
                filters.query.trim() && `matching "${filters.query.trim()}"`,
                filters.category !== "All" && filters.category.toLowerCase(),
                filters.time !== "any" &&
                  TIME_FILTERS.find((t) => t.key === filters.time)?.label.toLowerCase(),
                filters.difficulty !== "Any" && `${filters.difficulty.toLowerCase()} only`,
              ]
                .filter(Boolean)
                .join(" · ")}
              <button className="dir-clear" onClick={() => setFilters({ ...EMPTY_FILTERS })}>
                Clear
              </button>
            </p>
          )}
        </div>

        <div className="result-wrap">
          <div className={`result-card ${showResult ? "visible" : ""}`}>
            {result && (
              <>
                <div className="result-top">
                  <span className="result-emoji">{result.emoji}</span>
                  <div className="result-badges">
                    <span
                      className="badge"
                      style={{
                        background: `color-mix(in srgb, ${CATEGORY_COLORS[result.category]} 20%, transparent)`,
                        color: CATEGORY_COLORS[result.category],
                      }}
                    >
                      {result.category}
                    </span>
                    <span
                      className="badge"
                      style={{ background: "rgba(240,237,230,0.08)", color: "rgba(240,237,230,0.7)" }}
                    >
                      {result.difficulty}
                    </span>
                  </div>
                </div>
                <h2 className="result-name" onClick={() => openRecipe(result)}>
                  {result.name}
                </h2>
                <p className="result-desc">{result.desc}</p>
                <div className="result-time">⏱ {result.time}</div>
                <button className="view-btn" onClick={() => openRecipe(result)}>
                  View Full Recipe →
                </button>
                <button className="spin-again-btn" onClick={spin}>
                  Spin again
                </button>
              </>
            )}
          </div>
        </div>

        {history.length > 0 && (
          <div className="history-wrap">
            <h3 className="history-title">Recent spins</h3>
            <div className="history-list">
              {history.map((item, i) => (
                <button
                  key={`${item.slug}-${i}`}
                  className="history-item"
                  onClick={() => openRecipe(item)}
                  style={{ animation: `fadeSlideIn 0.3s ease ${i * 0.05}s both` }}
                >
                  <span style={{ fontSize: 20 }}>{item.emoji}</span>
                  <span className="history-name">{item.name}</span>
                  <span className="history-cat" style={{ color: CATEGORY_COLORS[item.category] }}>
                    {item.category}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

          </>
        )}

        {mode === "browse" && (
          <RecipeDirectory
            results={pool}
            total={recipes.length}
            filters={filters}
            setFilters={setFilters}
            sort={sort}
            setSort={setSort}
            onOpen={openRecipe}
          />
        )}

        <div className="kitchen-foot">{recipes.length} recipes from your collection</div>
      </div>

      {viewingRecipe && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeRecipe()
          }}
        >
          <div
            className="modal-card"
            style={{ "--accent": CATEGORY_COLORS[viewingRecipe.category] } as CSSProperties}
          >
            <button className="modal-close" onClick={closeRecipe} aria-label="Close recipe">
              ✕
            </button>
            <div
              className="modal-head"
              style={{
                background: `linear-gradient(135deg, color-mix(in srgb, ${CATEGORY_COLORS[viewingRecipe.category]} 25%, #161616), #161616)`,
              }}
            >
              <div className="modal-badges">
                <span
                  className="badge"
                  style={{
                    background: `color-mix(in srgb, ${CATEGORY_COLORS[viewingRecipe.category]} 25%, transparent)`,
                    color: CATEGORY_COLORS[viewingRecipe.category],
                  }}
                >
                  {viewingRecipe.category}
                </span>
                <span
                  className="badge"
                  style={{ background: "rgba(240,237,230,0.08)", color: "rgba(240,237,230,0.7)" }}
                >
                  ⏱ {viewingRecipe.time}
                </span>
                <span
                  className="badge"
                  style={{ background: "rgba(240,237,230,0.08)", color: "rgba(240,237,230,0.7)" }}
                >
                  {viewingRecipe.difficulty}
                </span>
              </div>
              <div className="modal-title-row">
                <span className="modal-emoji">{viewingRecipe.emoji}</span>
                <div>
                  <h2>{viewingRecipe.name}</h2>
                  <p className="modal-desc">{viewingRecipe.desc}</p>
                </div>
              </div>
            </div>

            <div className="modal-body">
              <div className="action-row">
                <button
                  className="action-btn primary"
                  onClick={() => setCookingSlug(viewingRecipe.slug)}
                >
                  Cook mode
                </button>
                <button className="action-btn" onClick={() => void copyRecipe(viewingRecipe)}>
                  {copied ? "Copied" : "Copy recipe"}
                </button>
                <button className="action-btn" onClick={() => window.print()}>
                  Print
                </button>
              </div>

              <div style={{ marginBottom: 32 }}>
                <h3 className="section-title">
                  <span style={{ color: CATEGORY_COLORS[viewingRecipe.category] }}>◆</span>{" "}
                  Ingredients
                </h3>
                <div className="ing-box">
                  {viewingRecipe.ingredients.map((ing, i) => (
                    <div key={i} className="ingredient-item">
                      <div
                        className="ingredient-dot"
                        style={{ background: CATEGORY_COLORS[viewingRecipe.category] }}
                      />
                      {ing}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="section-title">
                  <span style={{ color: CATEGORY_COLORS[viewingRecipe.category] }}>◆</span>{" "}
                  Instructions
                </h3>
                <div>
                  {viewingRecipe.steps.map((stepText, i) => (
                    <div key={i} className="step-item">
                      <div
                        className="step-num"
                        style={{
                          background: `color-mix(in srgb, ${CATEGORY_COLORS[viewingRecipe.category]} 20%, transparent)`,
                          color: CATEGORY_COLORS[viewingRecipe.category],
                        }}
                      >
                        {i + 1}
                      </div>
                      <div className="step-text">{stepText}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button className="spin-again-btn" style={{ marginTop: 28 }} onClick={spinFresh}>
                🎰 Spin for something else
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingRecipe && cookingSlug === viewingRecipe.slug && (
        <CookMode
          recipe={viewingRecipe}
          accent={CATEGORY_COLORS[viewingRecipe.category]}
          onClose={() => setCookingSlug(null)}
        />
      )}
    </div>
  )
}
