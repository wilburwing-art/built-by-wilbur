// Validates data/recipes/*.json (the canonical recipe archive) and emits
// src/data/recipes.gen.ts for the site to import. Run with --check to
// validate without writing. Wired into the dev and build scripts, so an
// invalid recipe file fails the build instead of shipping.
import { readFileSync, readdirSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const DATA = path.join(ROOT, "data", "recipes")
const OUT = path.join(ROOT, "src", "data", "recipes.gen.ts")
const checkOnly = process.argv.includes("--check")

const CATEGORIES = ["Breakfast", "Lunch", "Dinner", "Sides & Snacks", "Desserts", "Drinks"]
const DIFFICULTIES = ["Easy", "Medium", "Hard"]
const MATCH_TYPES = ["original", "closest", "none", "unresearched"]
const SERVING_BASES = ["publisher", "estimated"]

const RECIPE_KEYS = ["slug", "name", "category", "emoji", "desc", "time", "minutes", "difficulty", "addedOn", "source", "servings", "ingredients", "steps", "tips", "references"]
const SOURCE_KEYS = ["url", "site", "title", "matchType", "evidence", "checkedOn"]
const SERVINGS_KEYS = ["count", "basis", "source"]
const REFERENCE_KEYS = ["url", "site", "title", "usedFor", "checkedOn"]
const INGREDIENT_KEYS = ["raw", "qty", "qtyMax", "unit", "item", "prep", "note"]

const errors = []
const err = (file, msg) => errors.push(`${file}: ${msg}`)

// Presence is the contract: every key exists on every record, and an
// unresearched value is an explicit null. A missing key is always a bug,
// never a shorthand.
function requireKeys(file, obj, keys, label) {
  for (const k of keys) if (!(k in obj)) err(file, `${label} is missing key "${k}"`)
  for (const k of Object.keys(obj)) if (!keys.includes(k)) err(file, `${label} has unknown key "${k}"`)
}

const isStr = (v) => typeof v === "string" && v.length > 0
const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v)

const files = readdirSync(DATA).filter((f) => f.endsWith(".json")).sort()
const recipes = []
const slugs = new Set()

for (const f of files) {
  let r
  try {
    r = JSON.parse(readFileSync(path.join(DATA, f), "utf8"))
  } catch (e) {
    err(f, `invalid JSON: ${e.message}`)
    continue
  }
  requireKeys(f, r, RECIPE_KEYS, "recipe")
  if (r.slug !== f.replace(/\.json$/, "")) err(f, `slug "${r.slug}" does not match filename`)
  if (slugs.has(r.slug)) err(f, `duplicate slug "${r.slug}"`)
  slugs.add(r.slug)
  if (!isStr(r.name)) err(f, "name must be a non-empty string")
  if (!CATEGORIES.includes(r.category)) err(f, `category "${r.category}" not in ${CATEGORIES.join("|")}`)
  if (!DIFFICULTIES.includes(r.difficulty)) err(f, `difficulty "${r.difficulty}" invalid`)
  if (!isStr(r.emoji) || !isStr(r.desc) || !isStr(r.time)) err(f, "emoji/desc/time must be non-empty strings")
  if (!Number.isInteger(r.minutes) || r.minutes <= 0) err(f, "minutes must be a positive integer")
  if (r.addedOn !== null && !isDate(r.addedOn)) err(f, "addedOn must be null or YYYY-MM-DD")
  if (!Array.isArray(r.steps) || r.steps.length === 0 || !r.steps.every(isStr)) err(f, "steps must be a non-empty array of strings")

  if (!Array.isArray(r.tips) || !r.tips.every(isStr)) err(f, "tips must be an array of non-empty strings ([] when none)")

  // Published recipes consulted to fill gaps the source left (amounts,
  // specific ingredient names, missing steps). Each is auditable: a URL,
  // what was taken from it, and when it was read.
  if (Array.isArray(r.references)) {
    r.references.forEach((ref, idx) => {
      if (!ref || typeof ref !== "object") return err(f, `reference ${idx} must be an object`)
      requireKeys(f, ref, REFERENCE_KEYS, `reference ${idx}`)
      if (!isStr(ref.url) || !/^https?:\/\//.test(ref.url)) err(f, `reference ${idx} needs an http(s) url`)
      if (!isStr(ref.usedFor)) err(f, `reference ${idx} needs usedFor (what was taken from it)`)
      if (!isStr(ref.checkedOn) || !isDate(ref.checkedOn)) err(f, `reference ${idx} needs checkedOn YYYY-MM-DD`)
    })
  } else err(f, "references must be an array ([] when none)")

  if (r.source && typeof r.source === "object") {
    const s = r.source
    requireKeys(f, s, SOURCE_KEYS, "source")
    if (!MATCH_TYPES.includes(s.matchType)) err(f, `source.matchType "${s.matchType}" invalid`)
    if (s.matchType === "original" || s.matchType === "closest") {
      // A claimed source with no URL or no evidence is a claim nobody can
      // audit; refuse it rather than store it.
      if (!isStr(s.url) || !/^https?:\/\//.test(s.url)) err(f, `matchType "${s.matchType}" requires a source.url`)
      if (!isStr(s.evidence)) err(f, `matchType "${s.matchType}" requires source.evidence`)
      if (!isStr(s.checkedOn) || !isDate(s.checkedOn)) err(f, `matchType "${s.matchType}" requires source.checkedOn`)
    }
    if (s.matchType === "none" && s.url !== null) err(f, 'matchType "none" must have url null')
    if (s.matchType === "unresearched" && (s.url !== null || s.checkedOn !== null)) err(f, 'matchType "unresearched" must have url and checkedOn null')
  } else err(f, "source must be an object")

  if (r.servings && typeof r.servings === "object") {
    const sv = r.servings
    requireKeys(f, sv, SERVINGS_KEYS, "servings")
    if (sv.count !== null && (!Number.isFinite(sv.count) || sv.count <= 0)) err(f, "servings.count must be null or a positive number")
    if (sv.count !== null && !SERVING_BASES.includes(sv.basis)) err(f, "a servings.count needs basis publisher|estimated")
    if (sv.basis === "publisher" && !isStr(sv.source)) err(f, "publisher servings need servings.source (where it was read)")
    if (sv.count === null && (sv.basis !== null || sv.source !== null)) err(f, "null servings.count must have null basis and source")
  } else err(f, "servings must be an object")

  if (Array.isArray(r.ingredients) && r.ingredients.length > 0) {
    r.ingredients.forEach((i, idx) => {
      if (!i || typeof i !== "object") return err(f, `ingredient ${idx} must be an object`)
      requireKeys(f, i, INGREDIENT_KEYS, `ingredient ${idx}`)
      if (!isStr(i.raw)) err(f, `ingredient ${idx} raw must be a non-empty string`)
      if (i.qty !== null && (!Number.isFinite(i.qty) || i.qty <= 0)) err(f, `ingredient ${idx} qty invalid`)
      if (i.qtyMax !== null && (i.qty === null || i.qtyMax <= i.qty)) err(f, `ingredient ${idx} qtyMax needs a smaller qty beside it`)
      if (i.qty !== null && i.item === null) err(f, `ingredient ${idx} has qty but no item; a half-parse is not a parse`)
    })
  } else err(f, "ingredients must be a non-empty array")

  recipes.push(r)
}

if (errors.length > 0) {
  console.error(`build-recipes: ${errors.length} error(s) across ${files.length} files`)
  for (const e of errors) console.error("  " + e)
  process.exit(1)
}

if (!checkOnly) {
  const banner = "// GENERATED by scripts/build-recipes.mjs from data/recipes/*.json — do not edit.\n"
  const body = `${banner}import type { Recipe } from "./recipes"\n\nexport const recipesData: Recipe[] = ${JSON.stringify(recipes, null, 2)}\n`
  writeFileSync(OUT, body)
}
console.log(`build-recipes: ${recipes.length} recipes valid${checkOnly ? " (check only)" : ", wrote src/data/recipes.gen.ts"}`)
