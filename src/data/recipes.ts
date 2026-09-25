import { recipesData } from "./recipes.gen"

export const CATEGORIES = [
  "All",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Sides & Snacks",
  "Desserts",
  "Drinks",
] as const

export type Category = (typeof CATEGORIES)[number]
export type RecipeCategory = Exclude<Category, "All">
export type Difficulty = "Easy" | "Medium" | "Hard"

/**
 * One authored ingredient line. `raw` is what the site renders (scaling and
 * unit conversion parse it at render time); the structured fields are a
 * derived tier for downstream use and are null where the line resisted a
 * mechanical parse. See data/recipes/README.md for the contract.
 */
export interface IngredientLine {
  raw: string
  qty: number | null
  qtyMax: number | null
  unit: string | null
  item: string | null
  prep: string | null
  note: string | null
}

export interface RecipeSource {
  url: string | null
  site: string | null
  title: string | null
  matchType: "original" | "closest" | "none" | "unresearched"
  evidence: string | null
  checkedOn: string | null
}

/** A published recipe consulted to fill a gap the source left. */
export interface RecipeReference {
  url: string
  site: string | null
  title: string | null
  /** What was taken from it, e.g. "flour and sugar amounts, bake time". */
  usedFor: string
  checkedOn: string
}

export interface RecipeServings {
  count: number | null
  basis: "publisher" | "estimated" | null
  source: string | null
}

export interface Recipe {
  slug: string
  name: string
  category: RecipeCategory
  emoji: string
  desc: string
  time: string
  /** Derived once from `time` so the directory can filter and sort without parsing text. */
  minutes: number
  difficulty: Difficulty
  /** Null on the recipes that came from the original spinner: their real dates are not known. */
  addedOn: string | null
  source: RecipeSource
  servings: RecipeServings
  ingredients: IngredientLine[]
  steps: string[]
  tips: string[]
  references: RecipeReference[]
}

export const CATEGORY_COLORS: Record<Category, string> = {
  All: "#E8584F",
  Breakfast: "#F5A623",
  Lunch: "#4CAF50",
  Dinner: "#E8584F",
  "Sides & Snacks": "#9C6ADE",
  Desserts: "#E85D9A",
  Drinks: "#3B82F6",
}

export const CATEGORY_ICONS: Record<Category, string> = {
  All: "🎰",
  Breakfast: "🌅",
  Lunch: "☀️",
  Dinner: "🌙",
  "Sides & Snacks": "🧂",
  Desserts: "🍰",
  Drinks: "🍹",
}

// The data itself lives in data/recipes/*.json; scripts/build-recipes.mjs
// validates it and generates recipes.gen.ts at the front of dev and build.
export const recipes: Recipe[] = recipesData

export const bySlug = (slug: string) => recipes.find((r) => r.slug === slug)
