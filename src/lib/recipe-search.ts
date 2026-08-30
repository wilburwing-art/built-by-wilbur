import type { Category, Difficulty, Recipe } from "@/data/recipes"

export const SORTS = [
  { key: "relevance", label: "Best match" },
  { key: "az", label: "A to Z" },
  { key: "quickest", label: "Quickest" },
  { key: "newest", label: "Recently added" },
  { key: "fewest", label: "Fewest ingredients" },
] as const

export type SortKey = (typeof SORTS)[number]["key"]

export const TIME_FILTERS = [
  { key: "any", label: "Any time", maxMinutes: null },
  { key: "30", label: "Under 30 min", maxMinutes: 30 },
  { key: "60", label: "Under 1 hr", maxMinutes: 60 },
  { key: "120", label: "Under 2 hrs", maxMinutes: 120 },
] as const

export type TimeKey = (typeof TIME_FILTERS)[number]["key"]

export const DIFFICULTIES = ["Any", "Easy", "Medium", "Hard"] as const
export type DifficultyFilter = (typeof DIFFICULTIES)[number]

export interface Filters {
  query: string
  category: Category
  time: TimeKey
  difficulty: DifficultyFilter
}

export const EMPTY_FILTERS: Filters = {
  query: "",
  category: "All",
  time: "any",
  difficulty: "Any",
}

export const isFiltered = (f: Filters) =>
  f.query.trim() !== "" || f.category !== "All" || f.time !== "any" || f.difficulty !== "Any"

/**
 * Where a token was found, lowest wins. Steps are deliberately not searched:
 * across 731 of them, "broil" or "medium heat" would bury the real answers.
 */
const NAME_PREFIX = 0
const NAME = 1
const DESC = 2
const INGREDIENT = 3
const MISS = 99

function tokenRank(recipe: Recipe, token: string): number {
  const name = recipe.name.toLowerCase()
  if (name.startsWith(token)) return NAME_PREFIX
  if (name.includes(token)) return NAME
  if (recipe.desc.toLowerCase().includes(token)) return DESC
  if (recipe.ingredients.some((i) => i.toLowerCase().includes(token))) return INGREDIENT
  return MISS
}

/**
 * Every token has to land somewhere, so "chicken thigh" does not return
 * everything containing chicken. The score sums each token's best field, which
 * keeps a name hit ahead of an ingredient hit.
 */
export function scoreRecipe(recipe: Recipe, tokens: string[]): number | null {
  let score = 0
  for (const t of tokens) {
    const r = tokenRank(recipe, t)
    if (r === MISS) return null
    score += r
  }
  return score
}

const byName = (a: Recipe, b: Recipe) => a.name.localeCompare(b.name)

export function selectRecipes(recipes: Recipe[], filters: Filters, sort: SortKey): Recipe[] {
  const tokens = filters.query.toLowerCase().split(/\s+/).filter(Boolean)
  const maxMinutes = TIME_FILTERS.find((t) => t.key === filters.time)?.maxMinutes ?? null

  const scored: { recipe: Recipe; score: number; order: number }[] = []
  recipes.forEach((recipe, order) => {
    if (filters.category !== "All" && recipe.category !== filters.category) return
    if (maxMinutes !== null && recipe.minutes > maxMinutes) return
    if (filters.difficulty !== "Any" && recipe.difficulty !== (filters.difficulty as Difficulty))
      return
    const score = tokens.length ? scoreRecipe(recipe, tokens) : 0
    if (score === null) return
    scored.push({ recipe, score, order })
  })

  // Relevance means nothing without a query, so it falls back to alphabetical.
  const effective: SortKey = sort === "relevance" && !tokens.length ? "az" : sort

  scored.sort((a, b) => {
    switch (effective) {
      case "relevance":
        return a.score - b.score || byName(a.recipe, b.recipe)
      case "quickest":
        return a.recipe.minutes - b.recipe.minutes || byName(a.recipe, b.recipe)
      case "fewest":
        return (
          a.recipe.ingredients.length - b.recipe.ingredients.length || byName(a.recipe, b.recipe)
        )
      case "newest": {
        // Undated recipes came from the original spinner and sort last rather
        // than being given a date nobody knows.
        const ad = a.recipe.addedOn ?? ""
        const bd = b.recipe.addedOn ?? ""
        if (ad !== bd) return bd.localeCompare(ad)
        return a.order - b.order
      }
      default:
        return byName(a.recipe, b.recipe)
    }
  })

  return scored.map((s) => s.recipe)
}
