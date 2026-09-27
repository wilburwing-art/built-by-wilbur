# Recipe archive

One JSON file per recipe; these files are the source of truth for
builtbywilbur.com/kitchen. `scripts/build-recipes.mjs` validates every file
and generates `src/data/recipes.gen.ts` for the site; it runs at the front of
`npm run dev` and `npm run build`, so an invalid file fails the build. Run it
directly with `npm run gen`, or validate without writing via
`node scripts/build-recipes.mjs --check`.

## Contract

Every key is present on every record. An unresearched or unknown value is an
explicit `null`, so a blank is always distinguishable from a real empty.

- `ingredients[]`: `raw` is the authored line and is what the site renders
  (scaling and unit conversion parse it at render time). `qty` / `qtyMax` /
  `unit` / `item` / `prep` / `note` are a structured tier derived from `raw`
  for downstream use (nutrition, gram conversion). 1,308 of 1,536 lines
  parsed mechanically at migration (2026-09-01); the rest are compound
  ("Sauce: 1 tsp X, 2 tsp Y") or unquantified ("Salt to taste") lines that
  carry nulls until someone structures them by hand. `raw` never changes to
  make parsing easier.
- `source`: provenance research. `matchType` is `original` (this recipe's
  actual source), `closest` (same dish, strong ingredient overlap, origin
  unconfirmed), `none` (researched, nothing suitable found), or
  `unresearched`. A claimed match requires `url`, `evidence`, and
  `checkedOn`; the validator refuses one without all three.
- `servings`: `count` plus `basis` (`publisher` when read off the source
  page, `estimated` otherwise) plus `source` (where a publisher count was
  read). Publisher counts are verbatim from the page; nothing invents one.

The unit vocabulary for `unit` is canonical singular: cup, tbsp, tsp, fl oz,
oz, lb, g, kg, ml, l, pint, quart, pinch, dash, can, jar, package, packet,
bottle, bag, box, stick, clove, slice, stalk, sprig, bunch, head, ear, part,
shot, scoop, piece, strip. `null` means counted by item ("2 eggs") or
unparsed.

## Printed cards

A recipe with a printed card (a scan or the publisher's PDF) has it at
`public/kitchen/cards/<slug>.pdf`, with its two pages rendered beside it as
`<slug>-front.jpg` and `<slug>-back.jpg`:

    pdftoppm -jpeg -jpegopt quality=82 -scale-to 1600 -f 1 -l 1 -singlefile <slug>.pdf <slug>-front
    pdftoppm -jpeg -jpegopt quality=82 -scale-to 1600 -f 2 -l 2 -singlefile <slug>.pdf <slug>-back

`build-recipes.mjs` attaches these as `card` on the generated recipe (null
when there is none) and fails the build on a card whose slug matches no
recipe or that is missing a rendered side. The recipe JSON carries no card
key: the file name is the join.
