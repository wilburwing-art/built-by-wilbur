import { useEffect, useState } from "react"
import type { Recipe } from "@/data/recipes"
import type { Units } from "@/lib/ingredient-scale"
import { drawRecipeCard, recipeCardFilename } from "@/lib/recipe-card"

interface Props {
  recipe: Recipe
  scale: number
  units: Units
}

interface Card {
  url: string
  blob: Blob
  filename: string
}

/**
 * The recipe card shown under a recipe, redrawn whenever the scale or units
 * change so the saved image always matches what is on screen. On phones that
 * can share files, Share hands the PNG to the share sheet, which is the
 * shortest way into Photos or Messages.
 */
export function RecipeCard({ recipe, scale, units }: Props) {
  // Tagged with what it was drawn for, so a stale card never shows under a
  // new scale or unit choice while the next one is drawing.
  const key = `${recipe.slug}|${scale}|${units}`
  const [drawn, setDrawn] = useState<{ key: string; card: Card | null } | null>(null)
  const current = drawn?.key === key ? drawn : null
  const card = current?.card ?? null
  const failed = current !== null && current.card === null

  useEffect(() => {
    let cancelled = false
    let url: string | null = null
    drawRecipeCard(recipe, scale, units)
      .then(
        (canvas) =>
          new Promise<Blob>((resolve, reject) =>
            canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png"),
          ),
      )
      .then((blob) => {
        if (cancelled) return
        url = URL.createObjectURL(blob)
        setDrawn({ key, card: { url, blob, filename: recipeCardFilename(recipe, scale, units) } })
      })
      .catch(() => {
        if (!cancelled) setDrawn({ key, card: null })
      })
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [key, recipe, scale, units])

  const file = card ? new File([card.blob], card.filename, { type: "image/png" }) : null
  const canShare =
    file !== null && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })

  const share = async () => {
    if (!file) return
    try {
      await navigator.share({ files: [file], title: recipe.name })
    } catch {
      // Dismissing the share sheet rejects too; nothing to report.
    }
  }

  if (failed) return null

  return (
    <div className="card-wrap" id="recipe-card">
      <div className="card-frame">
        {card ? (
          <img src={card.url} alt={`Recipe card for ${recipe.name}`} className="card-img" />
        ) : (
          <div className="card-loading">Drawing card…</div>
        )}
      </div>
      <div className="action-row card-actions">
        <a
          className={`action-btn card-download ${card ? "" : "disabled"}`}
          href={card?.url}
          download={card?.filename}
          aria-disabled={!card}
        >
          Download card
        </a>
        {canShare && (
          <button className="action-btn" onClick={() => void share()}>
            Share card
          </button>
        )}
      </div>
    </div>
  )
}
