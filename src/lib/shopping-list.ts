import type { Recipe } from "@/data/recipes"
import { displayIngredient } from "@/lib/ingredient-scale"
import type { Units } from "@/lib/ingredient-scale"

/**
 * Aisles are ordered the way a store is walked, not alphabetically, so the
 * list reads top to bottom on the way around.
 */
export const AISLES = [
  "Produce",
  "Meat & Seafood",
  "Dairy & Eggs",
  "Bakery",
  "Frozen",
  "Pantry",
  "Spices & Baking",
  "Drinks",
  "Other",
] as const

export type Aisle = (typeof AISLES)[number]

export interface ListItem {
  /**
   * Dedupe identity and React key. Recipe lines are keyed by where they came
   * from, so re-adding at a different scale replaces the line instead of
   * doubling it; typed items are keyed by their own text.
   */
  key: string
  text: string
  aisle: Aisle
  /** Recipe this line came from, or null for something typed in by hand. */
  source: string | null
  slug: string | null
  checked: boolean
}

/**
 * First match wins, so the order is the whole design: anything that would be
 * mis-shelved by a bare word ("chicken broth", "dried thyme", "peanut
 * butter") is caught by a specific rule before the fresh-food rules run.
 */
const RULES: [Aisle, RegExp][] = [
  ["Frozen", /\b(frozen|ice cream|ice|puff pastry|phyllo|whipped topping|cool whip)\b/],
  [
    "Bakery",
    /\b(bread(?!\s*crumbs)|flatbreads?|baguette|tortillas?|tostada|taco shells|pita|naan|buns?|bagels?|croissants?|english muffins?|crusts?|biscuits?|crescent rolls?|dinner rolls?|hoagie|sub rolls?)\b/,
  ],
  [
    "Drinks",
    /\b(wine|beer|vodka|rum|tequila|bourbon|whiske?y|gin|prosecco|champagne|vermouth|cointreau|triple sec|liqueur|aperol|campari|brandy|cognac|bitters|club soda|tonic|cola|ginger beer|coffee|espresso|tea bags?)\b/,
  ],
  // Peppers before the spice rule: a bell or poblano is produce, while
  // "red pepper flakes" and a bare "pepper" in a quantity are the shaker.
  [
    "Produce",
    /\b(?:bell|yellow|orange|green|red|long green|banana|chil[ei]|poblano|jalape\w*|serrano|habanero|anaheim|shishito)\s+peppers?\b(?!\s+flakes)/,
  ],
  [
    "Spices & Baking",
    /\b(salt|peppers?|peppercorns?|cayenne|paprika|cumin|coriander|turmeric|cinnamon|nutmeg|allspice|cardamom|ground cloves|chili powder|curry powder|(?:garlic|onion|mustard) powder|seasoning|spice blend|old bay|bay leaf|bay leaves|(?:dried|ground)\s+(?:thyme|oregano|basil|rosemary|sage|parsley|dill|mint|ginger|cilantro|chives|marjoram|tarragon)|vanilla|almond extract|baking powder|baking soda|yeast|cream of tartar|cocoa|chocolate chips?|chocolate|flour|sugar(?!\s+snap)|molasses|cacao|marshmallows?|graham crackers?|oregano|marjoram|tarragon|(?:red |chil[ei] |pepper )?flakes|sprinkles|food coloring|(?:sesame|poppy|fennel|caraway|celery|chia|flax)\s+seeds?)\b/,
  ],
  [
    "Pantry",
    /\b(broth|stock|bouillon|canned|cans?|jars?|coconut milk|evaporated milk|condensed milk|tomato (?:paste|sauce|puree)|(?:crushed|diced|whole peeled|sun.dried) tomatoes|marinara|salsa|soy sauce|fish sauce|worcestershire|hoisin|sriracha|gochujang|miso|tahini|harissa|curry paste|chili crisp|oyster sauce|mirin|rice wine|hot sauce|bbq sauce|barbecue sauce|buffalo sauce|vinaigrette|dressing|ranch|aminos|paste packet|syrup|ketchup|mustard|mayonnaise|peanut butter|almond butter|jam|jelly|honey|maple syrup|corn syrup|corn ?starch|shortening|lard|oils?|vinegar)\b/,
  ],
  // Deli and refrigerated dips, before Produce claims the pepper in a crema.
  ["Dairy & Eggs", /\b(hummus|tzatziki|guacamole|queso|crema|pesto)\b/],
  [
    "Produce",
    /\b(onions?|shallots?|garlic|scallions?|green onions?|leeks?|tomato(?:es)?|potato(?:es)?|carrots?|celery|lettuce|romaine|spinach|kale|arugula|coleslaw|slaw mix|salad mix|spring mix|brussels sprouts|sprouts|jalape\w*|serrano|poblano|habanero|chil(?:i|e)(?:s|es)?|cabbage|broccoli|cauliflower|zucchini|squash|cucumbers?|mushrooms?|corn|peas|green beans|asparagus|avocados?|lemons?|limes?|oranges?|apples?|bananas?|\w*berr(?:y|ies)|cherr(?:y|ies)|cilantro|parsley|basil|mint|dill|rosemary|thyme|sage|chives|ginger|lemongrass|beets?|radish\w*|turnips?|eggplant|pumpkin|pineapple|mango\w*|peach\w*|pears?)\b/,
  ],
  [
    "Meat & Seafood",
    /\b(chicken|beef|steaks?|meat|pork|bacon|sausages?|chorizo|ham|prosciutto|salami|pepperoni|turkey|lamb|veal|roast|brisket|ribs|tenderloin|cutlets?|thighs?|drumsticks?|shrimp|salmon|tilapia|cod|halibut|scallops|crab|lobster|clams|mussels|fish fillets?)\b/,
  ],
  [
    "Dairy & Eggs",
    /\b(milk|heavy cream|half.and.half|cream cheese|sour cream|cream|butter|buttermilk|cheeses?|parmesan|cheddar|mozzarella|feta|cotija|ricotta|ghee|gruy\w*|provolone|monterey jack|pepper jack|pecorino|romano|asiago|gouda|havarti|colby|swiss|brie|goat cheese|queso fresco|yogurt|eggs?|tofu)\b/,
  ],
  [
    "Pantry",
    /\b(pasta|spaghetti|noodles?|macaroni|gnocchi|tagliatelle|fettuccine|linguine|penne|rigatoni|orzo|ramen|udon|tortellini|ravioli|rice|quinoa|couscous|oats|oatmeal|beans|lentils|chickpeas|breadcrumbs|panko|nuts|almonds|walnuts|pecans|cashews|raisins|olives|capers|pickles|tuna|anchov\w*|gelatin|tortilla chips|crackers|cereal|oreos?|cookies?|wafers?)\b/,
  ],
]

export function aisleFor(text: string): Aisle {
  const t = text.toLowerCase()
  for (const [aisle, pattern] of RULES) {
    if (pattern.test(t)) return aisle
  }
  return "Other"
}

const normalize = (text: string) => text.trim().replace(/\s+/g, " ")

/**
 * Twenty recipes group their ingredients under headings ("Slaw:", "To
 * assemble:"). Those are structure, not something to buy, so they never
 * become list lines.
 */
export const isHeading = (ingredient: string) => /:\s*$/.test(ingredient)

/** Every line of a recipe, rendered at whatever scale and units are on screen. */
export function recipeItems(recipe: Recipe, scale: number, units: Units): ListItem[] {
  return recipe.ingredients.flatMap((ing, i) =>
    isHeading(ing.raw) ? [] : [ingredientItem(recipe, i, ing.raw, scale, units)],
  )
}

export function ingredientItem(
  recipe: Recipe,
  index: number,
  ingredient: string,
  scale: number,
  units: Units,
): ListItem {
  const text = displayIngredient(ingredient, scale, units)
  return {
    key: `${recipe.slug}#${index}`,
    text,
    aisle: aisleFor(ingredient),
    source: recipe.name,
    slug: recipe.slug,
    checked: false,
  }
}

/** Returns null for an empty box rather than adding a blank row. */
export function typedItem(text: string): ListItem | null {
  const clean = normalize(text)
  if (!clean) return null
  return {
    key: `typed:${clean.toLowerCase()}`,
    text: clean,
    aisle: aisleFor(clean),
    source: null,
    slug: null,
    checked: false,
  }
}

export interface AisleGroup {
  aisle: Aisle
  items: ListItem[]
}

/** Empty aisles are dropped, so the list only shows what is actually on it. */
export function groupByAisle(items: ListItem[]): AisleGroup[] {
  return AISLES.map((aisle) => ({ aisle, items: items.filter((i) => i.aisle === aisle) })).filter(
    (g) => g.items.length > 0,
  )
}

/**
 * Plain text for the clipboard, keeping the aisle headings. Checked items are
 * left out: what is copied is what is still needed.
 */
export function listToText(items: ListItem[]): string {
  const open = items.filter((i) => !i.checked)
  if (open.length === 0) return "Shopping list\n\n(nothing left to buy)"
  const lines: string[] = ["Shopping list", ""]
  for (const group of groupByAisle(open)) {
    lines.push(group.aisle.toUpperCase())
    for (const item of group.items) lines.push(`- ${item.text}`)
    lines.push("")
  }
  return lines.join("\n").trimEnd()
}
