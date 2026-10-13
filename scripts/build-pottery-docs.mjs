// Renders the studio build docs in data/pottery/*.md into public/pottery/ so
// they are readable on a phone at builtbywilbur.com/pottery/. Unlisted:
// every page carries a noindex meta and vercel.json adds the header.
// Wired into dev and build; the output is committed like public/van/.
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"
import { renderMarkdown, indexPage } from "./lib/doc-page.mjs"

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const SRC = path.join(ROOT, "data", "pottery")
const OUT = path.join(ROOT, "public", "pottery")
const BASE = "/pottery/"
const NAV_LABEL = "Pottery builds"

const DOCS = [
  { group: "Tools", title: "Power clay extruder", out: "power-extruder.html", src: "power-extruder.md",
    blurb: "DeWalt DCE560B caulk gun to clay extruder. Why the Shimpo barrel does not fit, the 1-1/2 in. PVC barrel build, dies, use notes, what still needs measuring." },
  { group: "Reclaim", title: "Vertical reclaim stack", out: "reclaim-stack.html", src: "reclaim-stack.md",
    blurb: "Two 5 gallon buckets, a pillowcase filter and a terracotta dewatering pot stacked in one footprint. Parts, tools, build order, use notes." },
]

mkdirSync(OUT, { recursive: true })
// Images live beside the markdown in data/pottery/img/<doc>/ and are copied
// through unchanged, so public/pottery/ stays fully generated.
const IMG = path.join(SRC, "img")
if (existsSync(IMG)) {
  rmSync(path.join(OUT, "img"), { recursive: true, force: true })
  cpSync(IMG, path.join(OUT, "img"), { recursive: true })
  console.log("build-pottery-docs: img/ copied")
}
const stamp = `Pyns Pottery studio builds · ${new Date().toISOString().slice(0, 10)}`
for (const doc of DOCS) {
  const md = readFileSync(path.join(SRC, doc.src), "utf8")
  const html = renderMarkdown(md, { title: doc.title, stamp, navHref: BASE, navLabel: NAV_LABEL })
  writeFileSync(path.join(OUT, doc.out), html)
  console.log(`build-pottery-docs: ${doc.title} -> public/pottery/${doc.out} (${html.length} bytes)`)
}
writeFileSync(path.join(OUT, "index.html"), indexPage({ title: NAV_LABEL, stamp, docs: DOCS, base: BASE }))
console.log("build-pottery-docs: index -> public/pottery/index.html")
