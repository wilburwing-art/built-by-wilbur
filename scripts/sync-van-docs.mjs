// Copies van docs out of ~/repos/dreamvan into public/van/ so they are
// readable on a phone at builtbywilbur.com/van/. Markdown is rendered to a
// page, finished HTML dashboards are copied through, and imported Apple
// Notes are deduplicated first (the export repeats every line) with their
// image references dropped. Every page gets a noindex meta and a scrub of
// personal details; /van/index.html lists them by group.
//
// Wired into dev and build. On Vercel the dreamvan repo is absent, so the
// script leaves the committed copies alone; the sync only happens on the
// machine that has both repos, and the result has to be committed.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"
import { marked } from "marked"

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const SRC = process.env.DREAMVAN_DIR ?? path.join(ROOT, "..", "dreamvan")
const OUT = path.join(ROOT, "public", "van")
const VAN = "vehicles/van/transit-trail-mine"

// kind: md (render), html (copy through), note (Apple Notes export: dedupe,
// drop images, render). src may be a list; the parts are joined in order.
const DOCS = [
  { group: "Galley", title: "Galley cabinet", out: "galley.html", kind: "md",
    src: `${VAN}/design/galley-cabinet.md`,
    blurb: "Design doc: frame, cut list, uppers, lights, lining, shower, storage, dividers, totals, assembly order, open items." },
  { group: "Galley", title: "Galley BOM", out: "galley-bom.html", kind: "html",
    src: `${VAN}/design/galley-cabinet-bom.html`,
    blurb: "Interactive parts list: every line with vendor, SKU, verified price, search and filters, section totals." },
  { group: "Keep it running", title: "Maintenance record", out: "maintenance.html", kind: "note",
    src: [`${VAN}/notes/🚐 Van maintenance record ford transit van.md`, `${VAN}/notes/VAn maintenance.md`],
    blurb: "Service log, part numbers and torques, fluids, the dealer's notes, the needs list. Deduplicated from the Apple Notes export." },
  { group: "Keep it running", title: "Suspension dashboard", out: "suspension.html", kind: "html",
    src: `${VAN}/design/suspension-dashboard.html`,
    blurb: "Restore-to-spec at 200k: verified part numbers and current retail pricing for the Transit 250 suspension." },
  { group: "Systems", title: "12 V system", out: "12v.html", kind: "md",
    src: `${VAN}/design/12v-system.md`,
    blurb: "The aux-battery plan as one doc: CCP, breaker, isolator or DC-DC, house and Yeti fuse blocks, load list, where the galley circuits land." },
  { group: "Seating", title: "Removable + swivel seating", out: "seating.html", kind: "md",
    src: "shared/topics/seating-removable-swivel-2016-transit-130wb.md",
    blurb: "FMVSS constraints, floor rail systems, seat options and prices for the 2016 Transit 130\" WB." },
  { group: "Seating", title: "Seating dashboard", out: "seating-dashboard.html", kind: "html",
    src: "shared/topics/seating-removable-swivel-dashboard.html",
    blurb: "The seating options side by side with verified pricing." },
]

// Published copy only; the repo files keep the originals.
const SCRUB = [
  [/Angelo's sled/g, "the sled"],
  [/Angelo's/g, "the"],
  [/E Salt Lake City, 84108/g, "local store"],
  [/E SLC, 84108/g, "local store"],
  [/at E Salt Lake City/g, "at the local store"],
  [/E Salt Lake City/g, "local store"],
  [/Home Depot E SLC/g, "Home Depot"],
  [/E SLC/g, "local"],
  [/\b[A-HJ-NPR-Z0-9]{17}\b/g, "[VIN removed]"],
]
const scrub = (text) => SCRUB.reduce((t, [re, to]) => t.replace(re, to), text)

// The Apple Notes export repeats each line (often many times) and links
// attachments that are not copied. Keep the first occurrence of every
// non-blank line, drop image lines, promote the note's title line.
function cleanNote(text) {
  const seen = new Set()
  const lines = []
  for (const raw of text.split("\n")) {
    const line = raw.replace(/\s+$/, "")
    if (!line.trim()) continue
    if (/!\[[^\]]*\]\([^)]*Attachments\/[^)]*\)/.test(line)) continue
    if (seen.has(line)) continue
    seen.add(line)
    lines.push(line)
  }
  if (lines.length && !/^#/.test(lines[0])) lines[0] = `## ${lines[0].trim()}`
  return lines.join("\n\n")
}

const NOINDEX = '<meta name="robots" content="noindex, nofollow">'
const NAV = '<nav class="van-nav"><a href="/van/">Van docs</a></nav>'
const NAV_CSS =
  ".van-nav{display:flex;gap:8px;margin-bottom:18px}" +
  ".van-nav a{color:var(--gold,#ffd166);text-decoration:none;border:1px solid var(--line,#243244);border-radius:999px;padding:6px 14px;font-size:14px;font-weight:600}"
// Dashboards written for a laptop carry wide tables; each one is wrapped in
// a scrolling div so on a phone the table scrolls inside itself instead of
// pushing the page sideways.
const PHONE_CSS = ".tscroll{overflow-x:auto;max-width:100%}img{max-width:100%}"

const pageCss = `
:root{color-scheme:dark;--bg:#0a0e14;--card:#141c28;--line:#243244;--txt:#dce6f2;--dim:#8fa3bb;--gold:#ffd166;--bamboo:#d9a441}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--txt);font:16px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
.wrap{max-width:860px;margin:0 auto;padding:20px 16px 60px}
${NAV_CSS}
h1{font-size:26px;line-height:1.25;margin:0 0 12px}
h2{font-size:21px;margin:34px 0 10px;padding-top:18px;border-top:1px solid var(--line)}
h3{font-size:17px;margin:22px 0 8px;color:var(--gold)}
a{color:var(--bamboo);word-break:break-word}
code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.9em;background:rgba(255,255,255,.07);padding:1px 5px;border-radius:5px}
pre{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px;overflow-x:auto;font-size:12px;line-height:1.35}
pre code{background:none;padding:0;font-size:inherit}
table{border-collapse:collapse;width:100%;display:block;overflow-x:auto;font-size:13.5px;margin:10px 0 16px}
th,td{border:1px solid var(--line);padding:6px 9px;text-align:left;vertical-align:top;white-space:nowrap}
td:last-child,th:last-child{white-space:normal;min-width:180px}
th{background:var(--card);color:var(--dim);font-size:12px;text-transform:uppercase;letter-spacing:.06em}
strong{color:#fff}
li{margin:4px 0}
input[type=checkbox]{margin-right:6px}
blockquote{margin:0;padding-left:12px;border-left:3px solid var(--line);color:var(--dim)}
.stamp{color:var(--dim);font-size:12px;margin-bottom:14px}
ul.docs{list-style:none;padding:0;margin:0}
ul.docs li{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 16px;margin:0 0 12px}
ul.docs a{display:block;font-size:19px;font-weight:700;color:var(--gold);text-decoration:none;margin-bottom:4px}
ul.docs span{color:var(--dim);font-size:14px}
h2.group{border-top:none;padding-top:0;margin-top:26px;color:var(--dim);font-size:13px;text-transform:uppercase;letter-spacing:.12em}
`

const shell = (title, body) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${NOINDEX}
<title>${title}</title>
<style>${pageCss}</style>
</head>
<body>
<div class="wrap">
${body}
</div>
</body>
</html>
`

function renderMarkdown(md, title, stamp) {
  const body = marked.parse(md, { gfm: true, breaks: false })
  return shell(title, `${NAV}\n<div class="stamp">Synced from dreamvan ${stamp}</div>\n${body}`)
}

// A finished dashboard keeps its own styling; it only gains the noindex
// tag, the nav back to the index, and the nav's CSS.
function passthroughHtml(html) {
  const out = html
    .replace("<head>", `<head>\n${NOINDEX}`)
    .replace("</style>", `${NAV_CSS}\n${PHONE_CSS}\n</style>`)
    .replace(/<table\b/g, '<div class="tscroll"><table')
    .replace(/<\/table>/g, "</table></div>")
  const anchor = out.includes('<div class="wrap">') ? '<div class="wrap">' : /<body[^>]*>/.exec(out)?.[0]
  return anchor ? out.replace(anchor, `${anchor}\n${NAV}`) : out
}

// /van with no filename would otherwise fall through the SPA rewrite to the
// portfolio shell, which has no route for it and renders an empty page.
function indexPage(stamp) {
  const groups = [...new Set(DOCS.map((d) => d.group))]
  const body = groups
    .map(
      (g) =>
        `<h2 class="group">${g}</h2>\n<ul class="docs">\n` +
        DOCS.filter((d) => d.group === g)
          .map((d) => `<li><a href="/van/${d.out}">${d.title}</a><span>${d.blurb}</span></li>`)
          .join("\n") +
        "\n</ul>",
    )
    .join("\n")
  return shell(
    "Van docs",
    `<h1>Van docs</h1>\n<div class="stamp">2016 Transit 250 · synced from dreamvan ${stamp}</div>\n${body}`,
  )
}

if (!existsSync(SRC)) {
  console.log(`sync-van-docs: ${SRC} not present, keeping the committed public/van/ copies`)
  process.exit(0)
}

mkdirSync(OUT, { recursive: true })
const stamp = new Date().toISOString().slice(0, 10)
for (const doc of DOCS) {
  const parts = Array.isArray(doc.src) ? doc.src : [doc.src]
  const texts = parts.map((rel) => {
    const from = path.join(SRC, rel)
    if (!existsSync(from)) {
      console.error(`sync-van-docs: missing ${from}`)
      process.exit(1)
    }
    return readFileSync(from, "utf8")
  })
  let html
  if (doc.kind === "html") {
    html = passthroughHtml(scrub(texts[0]))
  } else {
    const md = texts.map((t) => (doc.kind === "note" ? cleanNote(t) : t)).join("\n\n---\n\n")
    html = renderMarkdown(scrub(md), doc.title, stamp)
  }
  writeFileSync(path.join(OUT, doc.out), html)
  console.log(`sync-van-docs: ${doc.title} -> public/van/${doc.out} (${html.length} bytes)`)
}
writeFileSync(path.join(OUT, "index.html"), indexPage(stamp))
console.log("sync-van-docs: index -> public/van/index.html")
