/**
 * Scaled and metric renderings are derived at render time; the authored
 * ingredient strings in recipes.ts stay the source of truth. At 1× in US
 * mode the text is returned byte-identical.
 */

export type Units = "us" | "metric"

export const SCALES = [0.5, 1, 1.5, 2, 3] as const

export function formatScale(scale: number): string {
  if (scale === 0.5) return "½×"
  if (scale === 1.5) return "1½×"
  return `${scale}×`
}

// A third of the newer recipes write quantities with unicode fractions
// ("1 ¼ pounds", "½ cup"), so those are first-class number forms.
const UF = "¼½¾⅓⅔⅕⅙⅛⅜⅝⅞"
const NUM = String.raw`\d+\s*[${UF}]|[${UF}]|\d+\s+\d+/\d+|\d+/\d+|\d+(?:\.\d+)?`

// Ordered longest-first so "grams" wins over "g" and "ounces" over "oz".
// The count nouns at the end are here only so "1 egg" can become "2 eggs";
// they never convert to metric.
const UNIT = [
  String.raw`fluid\s+ounces?`,
  String.raw`fl\.?\s*oz`,
  "tablespoons?",
  "teaspoons?",
  "packages?",
  "packets?",
  "pints?",
  "ounces?",
  "pounds?",
  "pinch(?:es)?",
  "cloves?",
  "slices?",
  "sticks?",
  "stalks?",
  "grams?",
  "lemons?",
  "limes?",
  "eggs?",
  "cups?",
  "cans?",
  "jars?",
  "tbsp",
  "tsp",
  "lbs?",
  "oz",
  "ml",
  "g",
].join("|")

// The trailing lookahead does what \b would, but also works after a
// unicode fraction, which is a non-word character \b cannot anchor to.
const QTY = new RegExp(
  `(${NUM})(?:(\\s*(?:-|–|\\bto\\b)\\s*)(${NUM}))?(\\s*(?:${UNIT}))?(?![\\w])`,
  "gi",
)

interface UnitInfo {
  /** ml per unit for US volume, grams per unit for US weight. */
  ml?: number
  g?: number
  /** The unit is already metric: scale it but never convert it. */
  metric?: "ml" | "g"
}

function lookupUnit(word: string): UnitInfo {
  const w = word.toLowerCase().replace(/\s+/g, " ")
  if (/^cups?$/.test(w)) return { ml: 240 }
  if (/^pints?$/.test(w)) return { ml: 473 }
  if (/^(tablespoons?|tbsp)$/.test(w)) return { ml: 15 }
  if (/^(teaspoons?|tsp)$/.test(w)) return { ml: 5 }
  if (/^(fluid ounces?|fl\.? ?oz)$/.test(w)) return { ml: 30 }
  if (/^(ounces?|oz)$/.test(w)) return { g: 28.35 }
  if (/^(pounds?|lbs?)$/.test(w)) return { g: 453.6 }
  if (/^(grams?|g)$/.test(w)) return { metric: "g" }
  if (/^ml$/.test(w)) return { metric: "ml" }
  return {}
}

const PLURAL_PAIRS: [string, string][] = [
  ["cup", "cups"],
  ["teaspoon", "teaspoons"],
  ["tablespoon", "tablespoons"],
  ["fluid ounce", "fluid ounces"],
  ["ounce", "ounces"],
  ["pound", "pounds"],
  ["lb", "lbs"],
  ["can", "cans"],
  ["jar", "jars"],
  ["package", "packages"],
  ["packet", "packets"],
  ["pint", "pints"],
  ["clove", "cloves"],
  ["slice", "slices"],
  ["stick", "sticks"],
  ["stalk", "stalks"],
  ["egg", "eggs"],
  ["pinch", "pinches"],
  ["lemon", "lemons"],
  ["lime", "limes"],
]

function pluralize(word: string, value: number): string {
  const w = word.toLowerCase().replace(/\s+/g, " ")
  for (const [sing, plur] of PLURAL_PAIRS) {
    if (w === sing || w === plur) {
      const out = value > 1 ? plur : sing
      // "1-4 Tablespoons Water" keeps its capital T.
      return /^[A-Z]/.test(word) ? out[0].toUpperCase() + out.slice(1) : out
    }
  }
  return word
}

const UNICODE_FRACTION: Record<string, number> = {
  "¼": 1 / 4,
  "½": 1 / 2,
  "¾": 3 / 4,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "⅕": 1 / 5,
  "⅙": 1 / 6,
  "⅛": 1 / 8,
  "⅜": 3 / 8,
  "⅝": 5 / 8,
  "⅞": 7 / 8,
}

function parseNum(s: string): number {
  const uf = new RegExp(`^(?:(\\d+)\\s*)?([${UF}])$`).exec(s)
  if (uf) return Number(uf[1] ?? 0) + UNICODE_FRACTION[uf[2]]
  const mixed = /^(\d+)\s+(\d+)\/(\d+)$/.exec(s)
  if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3])
  const frac = /^(\d+)\/(\d+)$/.exec(s)
  if (frac) return Number(frac[1]) / Number(frac[2])
  return parseFloat(s)
}

// The grid a measuring-cup set can actually produce, plus 1/6 and 3/8,
// which are what halving thirds and 1.5×-ing quarters land on.
const FRACTIONS: [number, string][] = [
  [1 / 8, "1/8"],
  [1 / 6, "1/6"],
  [1 / 4, "1/4"],
  [1 / 3, "1/3"],
  [3 / 8, "3/8"],
  [1 / 2, "1/2"],
  [5 / 8, "5/8"],
  [2 / 3, "2/3"],
  [3 / 4, "3/4"],
  [7 / 8, "7/8"],
]

function formatQty(v: number): string {
  const whole = Math.floor(v + 1e-9)
  const frac = v - whole
  if (frac < 0.02) return String(whole)
  if (frac > 0.98) return String(whole + 1)
  let best: string | null = null
  let bestDiff = 0.02
  for (const [val, label] of FRACTIONS) {
    const diff = Math.abs(frac - val)
    if (diff < bestDiff) {
      best = label
      bestDiff = diff
    }
  }
  if (best) return whole > 0 ? `${whole} ${best}` : best
  return String(Math.round(v * 100) / 100)
}

function fmtMetric(v: number, kind: "ml" | "g"): { n: string; u: string } {
  if (v >= 1000) {
    return {
      n: String(Math.round((v / 1000) * 10) / 10),
      u: kind === "ml" ? "L" : "kg",
    }
  }
  // Spoon-sized amounts keep quarter-ml precision (1/4 tsp is 1.25 ml, not
  // 1.5); everything bigger rounds the way a cook actually measures.
  const r =
    v >= 20 ? Math.round(v / 5) * 5
    : v >= 5 ? Math.max(0.5, Math.round(v * 2) / 2)
    : Math.max(0.25, Math.round(v * 4) / 4)
  return { n: String(r), u: kind }
}

function fmtMetricOut(v1: number, v2: number | null, kind: "ml" | "g", sep: string): string {
  const a = fmtMetric(v1, kind)
  if (v2 === null) return `${a.n} ${a.u}`
  const b = fmtMetric(v2, kind)
  return a.u === b.u ? `${a.n}${sep}${b.n} ${a.u}` : `${a.n} ${a.u}${sep}${b.n} ${b.u}`
}

/**
 * Product sizes and descriptors live in parentheses — "(9.6 oz) package",
 * "(70% cacao)", "(1 inch) piece" — and must never be rewritten, so only
 * the text outside them is transformed.
 */
function transformOutsideParens(text: string, fn: (seg: string) => string): string {
  let out = ""
  let buf = ""
  let depth = 0
  for (const ch of text) {
    if (ch === "(") {
      if (depth === 0) {
        out += fn(buf)
        buf = ""
      }
      depth++
      out += ch
    } else if (ch === ")") {
      depth = Math.max(0, depth - 1)
      out += ch
    } else if (depth === 0) {
      buf += ch
    } else {
      out += ch
    }
  }
  return out + fn(buf)
}

function scaleSegment(seg: string, scale: number, units: Units): string {
  return seg.replace(QTY, (match, n1: string, sep: string | undefined, n2: string | undefined, unitRaw: string | undefined, offset: number, full: string) => {
    const before = full.slice(0, offset)
    const after = full.slice(offset + match.length)

    // Not a measurable amount: part of another number, a dimension ("13x9"),
    // a percentage, a temperature, or an inch size.
    if (/[\d/.]$/.test(before) || /\dx\s*$/i.test(before)) return match
    if (/^\s*(?:%|°|["”]|x\s*\d)/i.test(after)) return match
    if (/^[\s-]*inch/i.test(after)) return match
    if (/^\s*(?:seconds?|secs?|minutes?|mins?|hours?|hrs?|degrees)\b/i.test(after)) return match
    // A dash right after a match is a range the parser could not consume
    // ("100-110F"): scaling only its first half would corrupt it.
    if (sep === undefined && /^\s*[-–]\s*\d/.test(after)) return match

    const unitWord = unitRaw ? unitRaw.trim() : null

    // "One 7oz can of chipotle peppers": the ounces are the size of the can,
    // not an amount of the ingredient.
    if (unitWord && /^(?:oz|ounces?)$/i.test(unitWord) && /^\s*(?:can|jar|package|bag|bottle)/i.test(after)) {
      return match
    }

    const v1 = parseNum(n1) * scale
    const v2 = n2 !== undefined ? parseNum(n2) * scale : null
    if (!Number.isFinite(v1)) return match
    const info = unitWord ? lookupUnit(unitWord) : {}

    // Already metric: scale, keep metric, in both modes.
    if (info.metric) return fmtMetricOut(v1, v2, info.metric, sep ?? "-")

    if (units === "metric" && (info.ml !== undefined || info.g !== undefined)) {
      const kind = info.ml !== undefined ? "ml" : "g"
      const per = info.ml ?? info.g ?? 1
      return fmtMetricOut(v1 * per, v2 === null ? null : v2 * per, kind, sep ?? "-")
    }

    const numOut = v2 !== null ? `${formatQty(v1)}${sep ?? "-"}${formatQty(v2)}` : formatQty(v1)
    if (!unitRaw || !unitWord) return numOut
    const spacing = unitRaw.slice(0, unitRaw.length - unitWord.length)
    return `${numOut}${spacing}${pluralize(unitWord, v2 ?? v1)}`
  })
}

export function displayIngredient(text: string, scale: number, units: Units): string {
  if (scale === 1 && units === "us") return text
  return transformOutsideParens(text, (seg) => scaleSegment(seg, scale, units))
}

function toCelsius(f: number): number {
  return Math.round(((f - 32) * 5) / 9 / 5) * 5
}

/**
 * Steps only ever get temperature conversion. Quantities in step text are
 * per-item amounts ("1/4 cup batter per pancake") that are correct at any
 * multiplier, so they are left alone.
 */
export function displayStep(text: string, units: Units): string {
  if (units !== "metric") return text
  return text
    // A few steps were authored with both scales — "375°F (190°C)",
    // "400°F/200°C". The authored Celsius value wins over a computed one.
    .replace(
      /(\d+)\s*(?:°\s*F\b|degrees\s+F\w*)\s*(?:\(\s*(\d+)\s*(?:°\s*C\b|degrees\s+C\b)\s*\)|\/\s*(\d+)\s*(?:°\s*C\b|degrees\s+C\b))/g,
      (_, _f: string, c1: string | undefined, c2: string | undefined) => `${c1 ?? c2}°C`,
    )
    .replace(/(\d+)\s*°\s*F\b/g, (_, f: string) => `${toCelsius(Number(f))}°C`)
    .replace(/(\d+)\s*degrees(\s*F(?:ahrenheit)?\b)?/gi, (m: string, f: string, suffix: string | undefined) => {
      // A bare "350 degrees" in a US recipe is an oven temperature in
      // Fahrenheit; below 250 it could be either scale, so it is left
      // alone rather than guessed.
      if (suffix || Number(f) >= 250) return `${toCelsius(Number(f))}°C`
      return m
    })
}
