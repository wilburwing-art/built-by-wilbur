import { useState } from "react"
import type { Recipe, RecipeCardFiles } from "@/data/recipes"

interface Props {
  recipe: Recipe
  card: RecipeCardFiles
}

/**
 * The recipe card for a recipe, with a Front/Back toggle when the card has
 * two sides, and a download of the original file (the printed PDF, or the
 * generated PNG).
 */
export function RecipeCard({ recipe, card }: Props) {
  const [side, setSide] = useState<"front" | "back">("front")
  const src = side === "back" && card.back ? card.back : card.front
  const ext = card.download.slice(card.download.lastIndexOf(".") + 1)

  return (
    <div className="card-wrap" id="recipe-card">
      {card.back && (
        <div className="scale-group card-sides" role="group" aria-label="Card side">
          <button
            className={`scale-btn ${side === "front" ? "active" : ""}`}
            onClick={() => setSide("front")}
          >
            Front
          </button>
          <button
            className={`scale-btn ${side === "back" ? "active" : ""}`}
            onClick={() => setSide("back")}
          >
            Back
          </button>
        </div>
      )}
      <a className="card-frame" href={src} target="_blank" rel="noreferrer">
        <img
          src={src}
          alt={`Recipe card for ${recipe.name}${card.back ? `, ${side}` : ""}`}
          className="card-img"
          loading="lazy"
        />
      </a>
      <div className="action-row card-actions">
        <a
          className="action-btn card-download"
          href={card.download}
          download={`${recipe.slug}-recipe-card.${ext}`}
        >
          Download card ({ext.toUpperCase()})
        </a>
      </div>
    </div>
  )
}
