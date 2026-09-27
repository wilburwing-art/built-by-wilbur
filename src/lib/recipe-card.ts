import type { Recipe } from "@/data/recipes"
import { CATEGORY_COLORS } from "@/data/recipes"
import { displayIngredient, displayStep, formatScale } from "@/lib/ingredient-scale"
import type { Units } from "@/lib/ingredient-scale"
import { isHeading } from "@/lib/shopping-list"

/**
 * A recipe card drawn to a canvas, so it can be shown on the recipe page and
 * saved as a PNG to a camera roll or printed. The card is a cream index card
 * at a fixed width; its height grows with the recipe so a long one is never
 * cut off. It mirrors whatever scale and units are on screen, like the copy
 * and print paths do.
 */

/** Layout is in card units; the canvas is drawn at PIXEL_RATIO for a crisp print. */
const WIDTH = 1080
const PIXEL_RATIO = 2
const PAD = 72
const INNER = WIDTH - PAD * 2

const PAPER = "#FBF6EA"
const INK = "#2A2520"
const MUTED = "#6F665B"
const RULE = "#E4D9C3"

const SERIF = "'Playfair Display', Georgia, serif"
const SANS = "'DM Sans', system-ui, sans-serif"
const KITCHEN_HOST = "builtbywilbur.com/kitchen"

type Op = (ctx: CanvasRenderingContext2D) => void

/** Greedy word wrap against the font currently set on ctx. */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  let line = ""
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width <= maxWidth || !line) {
      line = next
    } else {
      lines.push(line)
      line = word
    }
  }
  if (line) lines.push(line)
  return lines
}

async function loadFonts() {
  if (!document.fonts) return
  try {
    await Promise.all([
      document.fonts.load(`700 40px 'Playfair Display'`),
      document.fonts.load(`400 20px 'DM Sans'`),
      document.fonts.load(`700 20px 'DM Sans'`),
    ])
  } catch {
    // The fallback fonts in the stacks still make a readable card.
  }
}

/**
 * Two passes over the same layout: the first on a scratch context only to
 * measure the height, the second on the real canvas. Every draw call is
 * queued as an op so both passes share one layout function.
 */
function layout(
  measure: CanvasRenderingContext2D,
  recipe: Recipe,
  scale: number,
  units: Units,
): { height: number; ops: Op[] } {
  const accent = CATEGORY_COLORS[recipe.category]
  const ops: Op[] = []
  let y = PAD

  const text = (
    str: string,
    x: number,
    font: string,
    color: string,
    align: CanvasTextAlign = "left",
  ) => {
    const at = y
    ops.push((ctx) => {
      ctx.font = font
      ctx.fillStyle = color
      ctx.textAlign = align
      ctx.textBaseline = "top"
      ctx.fillText(str, x, at)
    })
  }

  const paragraph = (
    str: string,
    x: number,
    maxWidth: number,
    font: string,
    color: string,
    lineHeight: number,
  ) => {
    measure.font = font
    for (const line of wrap(measure, str, maxWidth)) {
      text(line, x, font, color)
      y += lineHeight
    }
  }

  const sectionTitle = (title: string) => {
    const at = y
    ops.push((ctx) => {
      ctx.fillStyle = accent
      ctx.fillRect(PAD, at + 10, 14, 14)
    })
    text(title.toUpperCase(), PAD + 28, `700 22px ${SANS}`, INK)
    y += 40
    const ruleAt = y
    ops.push((ctx) => {
      ctx.fillStyle = RULE
      ctx.fillRect(PAD, ruleAt, INNER, 2)
    })
    y += 20
  }

  // Header: emoji, name, meta line, description.
  text(recipe.emoji, PAD, `64px ${SANS}`, INK)
  const titleX = PAD + 96
  y += 4
  paragraph(recipe.name, titleX, INNER - 96, `700 46px ${SERIF}`, INK, 56)
  y += 6

  const serves =
    recipe.servings.count !== null
      ? `Serves ${recipe.servings.basis === "estimated" ? "~" : ""}${Math.round(recipe.servings.count * scale * 2) / 2}`
      : null
  const meta = [
    recipe.category,
    recipe.time,
    recipe.difficulty,
    serves,
    scale !== 1 ? `Scaled ${formatScale(scale)}` : null,
    units === "metric" ? "Metric" : null,
  ].filter(Boolean)
  paragraph(meta.join("  ·  "), titleX, INNER - 96, `700 20px ${SANS}`, accent, 30)
  y = Math.max(y, PAD + 96) + 18
  paragraph(recipe.desc, PAD, INNER, `italic 400 24px ${SERIF}`, MUTED, 36)
  y += 36

  // Ingredients, in two columns once the list is long enough to be worth it.
  sectionTitle("Ingredients")
  const lines = recipe.ingredients.map((i) => displayIngredient(i.raw, scale, units))
  const twoCol = lines.length > 8
  const colGap = 48
  const colWidth = twoCol ? (INNER - colGap) / 2 : INNER
  const bulletIndent = 26
  const ingFont = `400 21px ${SANS}`
  const headFont = `700 21px ${SANS}`
  measure.font = ingFont

  const blocks = lines.map((line) => {
    const heading = isHeading(line)
    measure.font = heading ? headFont : ingFont
    const wrapped = wrap(measure, line, colWidth - (heading ? 0 : bulletIndent))
    return { heading, wrapped, height: wrapped.length * 30 + 10 }
  })

  // Split so the left column is never shorter than the right.
  const total = blocks.reduce((sum, b) => sum + b.height, 0)
  let split = blocks.length
  if (twoCol) {
    let running = 0
    split = blocks.findIndex((b) => {
      running += b.height
      return running >= total / 2
    })
    split += 1
    // Keep a sub-heading with the lines under it.
    if (split < blocks.length && blocks[split - 1].heading) split -= 1
  }

  const columnTop = y
  let columnBottom = y
  ;[blocks.slice(0, split), blocks.slice(split)].forEach((col, c) => {
    const x = PAD + c * (colWidth + colGap)
    y = columnTop
    for (const block of col) {
      if (!block.heading) {
        const dotAt = y
        ops.push((ctx) => {
          ctx.fillStyle = accent
          ctx.beginPath()
          ctx.arc(x + 6, dotAt + 14, 5, 0, Math.PI * 2)
          ctx.fill()
        })
      }
      for (const line of block.wrapped) {
        text(
          line,
          x + (block.heading ? 0 : bulletIndent),
          block.heading ? headFont : ingFont,
          INK,
        )
        y += 30
      }
      y += 10
    }
    columnBottom = Math.max(columnBottom, y)
  })
  y = columnBottom + 30

  // Steps, each with a numbered disc.
  sectionTitle("Instructions")
  const stepIndent = 56
  recipe.steps.forEach((step, i) => {
    const at = y
    ops.push((ctx) => {
      ctx.fillStyle = accent
      ctx.beginPath()
      ctx.arc(PAD + 18, at + 16, 18, 0, Math.PI * 2)
      ctx.fill()
      ctx.font = `700 18px ${SANS}`
      ctx.fillStyle = "#FFFFFF"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(String(i + 1), PAD + 18, at + 17)
    })
    paragraph(displayStep(step, units), PAD + stepIndent, INNER - stepIndent, `400 21px ${SANS}`, INK, 31)
    y = Math.max(y, at + 36) + 16
  })

  if (recipe.tips.length > 0) {
    y += 14
    sectionTitle("Tips")
    for (const tip of recipe.tips) {
      const at = y
      ops.push((ctx) => {
        ctx.fillStyle = accent
        ctx.beginPath()
        ctx.arc(PAD + 6, at + 14, 5, 0, Math.PI * 2)
        ctx.fill()
      })
      paragraph(displayStep(tip, units), PAD + bulletIndent, INNER - bulletIndent, `400 21px ${SANS}`, INK, 31)
      y += 12
    }
  }

  // Footer: where it came from and where to find it again.
  y += 24
  const footAt = y
  ops.push((ctx) => {
    ctx.fillStyle = RULE
    ctx.fillRect(PAD, footAt, INNER, 2)
  })
  y += 22
  const sourceLabel = recipe.source.url
    ? `${recipe.source.matchType === "original" ? "Source" : "Closest match"}: ${recipe.source.site ?? new URL(recipe.source.url).hostname}`
    : ""
  text(sourceLabel, PAD, `400 18px ${SANS}`, MUTED)
  text(`${KITCHEN_HOST}/${recipe.slug}`, WIDTH - PAD, `700 18px ${SANS}`, MUTED, "right")
  y += 26 + PAD

  return { height: Math.ceil(y), ops }
}

export async function drawRecipeCard(
  recipe: Recipe,
  scale: number,
  units: Units,
): Promise<HTMLCanvasElement> {
  await loadFonts()
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas is not available")

  const { height, ops } = layout(ctx, recipe, scale, units)
  canvas.width = WIDTH * PIXEL_RATIO
  canvas.height = height * PIXEL_RATIO
  // Resizing resets the context, so the scale goes on after.
  ctx.scale(PIXEL_RATIO, PIXEL_RATIO)

  ctx.fillStyle = PAPER
  ctx.fillRect(0, 0, WIDTH, height)
  // The colored band across the top is the index card's red rule.
  ctx.fillStyle = CATEGORY_COLORS[recipe.category]
  ctx.fillRect(0, 0, WIDTH, 14)

  for (const op of ops) op(ctx)
  return canvas
}

export function recipeCardFilename(recipe: Recipe, scale: number, units: Units): string {
  const suffix = [scale !== 1 ? `x${scale}` : null, units === "metric" ? "metric" : null]
    .filter(Boolean)
    .join("-")
  return `${recipe.slug}${suffix ? `-${suffix}` : ""}-recipe-card.png`
}
