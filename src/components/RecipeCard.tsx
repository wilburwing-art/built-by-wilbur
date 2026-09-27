import { useState } from "react"
import type { Recipe, RecipeCardFiles } from "@/data/recipes"

interface Props {
  recipe: Recipe
  card: RecipeCardFiles
}

/**
 * The printed recipe card for a recipe, shown one side at a time with a
 * toggle, and downloadable as the original two-page PDF.
 */
export function RecipeCard({ recipe, card }: Props) {
  const [side, setSide] = useState<"front" | "back">("front")

  return (
    <div className="card-wrap" id="recipe-card">
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
      <a className="card-frame" href={card[side]} target="_blank" rel="noreferrer">
        <img
          src={card[side]}
          alt={`Recipe card for ${recipe.name}, ${side}`}
          className="card-img"
          loading="lazy"
        />
      </a>
      <div className="action-row card-actions">
        <a className="action-btn card-download" href={card.pdf} download={`${recipe.slug}-recipe-card.pdf`}>
          Download card (PDF)
        </a>
      </div>
    </div>
  )
}
