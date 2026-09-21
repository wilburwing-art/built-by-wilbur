// Copies the van galley docs out of ~/repos/dreamvan into public/van/ so they
// are readable on a phone at builtbywilbur.com/van/. The markdown design doc
// is rendered to a page; the BOM HTML is copied as is. Both get a noindex
// meta and two personal details scrubbed (a friend's name, the local store).
//
// Wired into dev and build. On Vercel the dreamvan repo is absent, so the
// script leaves the committed copies alone; the sync only happens on the
// machine that has both repos, and the result has to be committed.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"
import { marked } from "marked"

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const SRC =
  process.env.DREAMVAN_DIR ??
  path.join(ROOT, "..", "dreamvan", "vehicles", "van", "transit-trail-mine", "design")
const OUT = path.join(ROOT, "public", "van")

const DOCS = [
  { src: "galley-cabinet.md", out: "galley.html", title: "Galley cabinet", render: true },
  { src: "galley-cabinet-bom.html", out: "galley-bom.html", title: "Galley BOM", render: false },
]

// Published copy only; the repo doc keeps the originals.
const SCRUB = [
  [/Angelo's sled/g, "the sled"],
  [/Angelo's/g, "the"],
  [/E Salt Lake City, 84108/g, "local store"],
  [/E SLC, 84108/g, "local store"],
  [/at E Salt Lake City/g, "at the local store"],
  [/E Salt Lake City/g, "local store"],
  [/Home Depot E SLC/g, "Home Depot"],
  [/E SLC/g, "local"],
]
const scrub = (text) => SCRUB.reduce((t, [re, to]) => t.replace(re, to), text)

const NOINDEX = '<meta name="robots" content="noindex, nofollow">'
const NAV =
  '<nav class="van-nav"><a href="/van/galley.html">Design doc</a><a href="/van/galley-bom.html">BOM</a></nav>'

const pageCss = `
:root{color-scheme:dark;--bg:#0a0e14;--card:#141c28;--line:#243244;--txt:#dce6f2;--dim:#8fa3bb;--gold:#ffd166;--bamboo:#d9a441}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--txt);font:16px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
.wrap{max-width:860px;margin:0 auto;padding:20px 16px 60px}
.van-nav{display:flex;gap:8px;margin-bottom:18px}
.van-nav a{color:var(--gold);text-decoration:none;border:1px solid var(--line);border-radius:999px;padding:6px 14px;font-size:14px;font-weight:600}
h1{font-size:26px;line-height:1.25;margin:0 0 12px}
h2{font-size:21px;margin:34px 0 10px;padding-top:18px;border-top:1px solid var(--line)}
h3{font-size:17px;margin:22px 0 8px;color:var(--gold)}
a{color:var(--bamboo)}
code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.9em;background:rgba(255,255,255,.07);padding:1px 5px;border-radius:5px}
pre{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px;overflow-x:auto;font-size:12px;line-height:1.35}
pre code{background:none;padding:0;font-size:inherit}
table{border-collapse:collapse;width:100%;display:block;overflow-x:auto;font-size:13.5px;margin:10px 0 16px}
th,td{border:1px solid var(--line);padding:6px 9px;text-align:left;vertical-align:top;white-space:nowrap}
td:last-child,th:last-child{white-space:normal;min-width:180px}
th{background:var(--card);color:var(--dim);font-size:12px;text-transform:uppercase;letter-spacing:.06em}
strong{color:#fff}
li{margin:4px 0}
blockquote{margin:0;padding-left:12px;border-left:3px solid var(--line);color:var(--dim)}
.stamp{color:var(--dim);font-size:12px;margin-bottom:14px}
`

function renderMarkdown(md, title, stamp) {
  const body = marked.parse(md, { gfm: true, breaks: false })
  return `<!DOCTYPE html>
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
${NAV}
<div class="stamp">Synced from dreamvan ${stamp}</div>
${body}
</div>
</body>
</html>
`
}

// The BOM page is a finished document; it only needs the noindex tag and the
// nav so the two pages link to each other.
function passthroughHtml(html) {
  return html
    .replace("<head>", `<head>\n${NOINDEX}`)
    .replace('<div class="wrap">', `<div class="wrap">\n  ${NAV}`)
    .replace("</style>", `  .van-nav{display:flex;gap:8px;margin-bottom:18px}\n  .van-nav a{color:var(--gold);text-decoration:none;border:1px solid var(--line);border-radius:999px;padding:6px 14px;font-size:13px;font-weight:600}\n</style>`)
}

if (!existsSync(SRC)) {
  console.log(`sync-van-docs: ${SRC} not present, keeping the committed public/van/ copies`)
  process.exit(0)
}

mkdirSync(OUT, { recursive: true })
const stamp = new Date().toISOString().slice(0, 10)
for (const doc of DOCS) {
  const from = path.join(SRC, doc.src)
  if (!existsSync(from)) {
    console.error(`sync-van-docs: missing ${from}`)
    process.exit(1)
  }
  const raw = scrub(readFileSync(from, "utf8"))
  const html = doc.render ? renderMarkdown(raw, doc.title, stamp) : passthroughHtml(raw)
  writeFileSync(path.join(OUT, doc.out), html)
  console.log(`sync-van-docs: ${doc.src} -> public/van/${doc.out} (${html.length} bytes)`)
}
