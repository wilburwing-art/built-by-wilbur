// Shared shell for the unlisted static doc sections (/van/, /pottery/).
// Each section script renders markdown or copies finished HTML through
// this so every page carries the same CSS, the noindex meta and a nav
// pill back to its section index.
import { marked } from "marked"

export const NOINDEX = '<meta name="robots" content="noindex, nofollow">'

export const NAV_CSS =
  ".doc-nav{display:flex;gap:8px;margin-bottom:18px}" +
  ".doc-nav a{color:var(--gold,#ffd166);text-decoration:none;border:1px solid var(--line,#243244);border-radius:999px;padding:6px 14px;font-size:14px;font-weight:600}"

// Dashboards written for a laptop carry wide tables; each one is wrapped in
// a scrolling div so on a phone the table scrolls inside itself instead of
// pushing the page sideways.
export const PHONE_CSS = ".tscroll{overflow-x:auto;max-width:100%}img{max-width:100%}"

export const nav = (href, label) => `<nav class="doc-nav"><a href="${href}">${label}</a></nav>`

export const pageCss = `
:root{color-scheme:dark;--bg:#0a0e14;--card:#141c28;--line:#243244;--txt:#dce6f2;--dim:#8fa3bb;--gold:#ffd166;--bamboo:#d9a441;--todo:#ffb4a2}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--txt);font:16px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
.wrap{max-width:860px;margin:0 auto;padding:20px 16px 60px}
${NAV_CSS}
h1{font-size:26px;line-height:1.25;margin:0 0 12px}
h2{font-size:21px;margin:34px 0 10px;padding-top:18px;border-top:1px solid var(--line)}
h3{font-size:17px;margin:22px 0 8px;color:var(--gold)}
a{color:var(--bamboo);word-break:break-word}
code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.9em;background:rgba(255,255,255,.07);padding:1px 5px;border-radius:5px}
code.copy{cursor:pointer}
code.copied{background:var(--gold);color:#000}
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
img{max-width:100%;height:auto;border-radius:12px;display:block}
.figure{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:10px;margin:14px 0}
.figure img{border-radius:8px;margin:0 auto}
.figure em{display:block;color:var(--dim);font-size:13px;margin-top:8px;text-align:center;font-style:normal}
mark.todo{background:var(--todo);color:#000;border-radius:5px;padding:1px 6px;font:600 .85em ui-monospace,SFMono-Regular,Menlo,monospace;white-space:nowrap}
.callout{background:var(--card);border:1px solid var(--todo);border-left-width:4px;border-radius:12px;padding:12px 14px;margin:14px 0}
.callout p{margin:0}
.callout p+p{margin-top:8px}
.stamp{color:var(--dim);font-size:12px;margin-bottom:14px}
ul.docs{list-style:none;padding:0;margin:0}
ul.docs li{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 16px;margin:0 0 12px}
ul.docs a{display:block;font-size:19px;font-weight:700;color:var(--gold);text-decoration:none;margin-bottom:4px}
ul.docs span{color:var(--dim);font-size:14px}
h2.group{border-top:none;padding-top:0;margin-top:26px;color:var(--dim);font-size:13px;text-transform:uppercase;letter-spacing:.12em}
`

// Tapping a part name copies it, for pasting into a store search on a phone.
const COPY_JS = `<script>
document.querySelectorAll("p code, li code, td code").forEach(function(c){
  c.classList.add("copy");c.title="Tap to copy";
  c.addEventListener("click",function(){
    navigator.clipboard.writeText(c.textContent).then(function(){
      c.classList.add("copied");setTimeout(function(){c.classList.remove("copied")},700)
    })
  })
})
</script>`

export const shell = (title, body) => `<!DOCTYPE html>
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
${COPY_JS}
</body>
</html>
`

// \`TODO: MEASURE\` and \`TODO: TEST\` in the markdown become highlighted
// marks; a blockquote whose first line starts with "To verify" becomes a
// callout box. Values are never filled in here.
export function renderMarkdown(md, { title, stamp, navHref, navLabel }) {
  let body = marked.parse(md, { gfm: true, breaks: false })
  body = body
    .replace(/<code>(TODO: [A-Z]+)<\/code>/g, '<mark class="todo">$1</mark>')
    .replace(/<blockquote>\s*<p>(To verify|Note)\b/g, '<blockquote class="callout"><p><strong>$1</strong>')
    .replace(/<p>(<img [^>]*>)(?:\s*<br>)?\s*(<em>[^<]*<\/em>)?<\/p>/g, '<div class="figure">$1$2</div>')
  return shell(title, `${nav(navHref, navLabel)}\n<div class="stamp">${stamp}</div>\n${body}`)
}

export function indexPage({ title, stamp, docs, base }) {
  const groups = [...new Set(docs.map((d) => d.group))]
  const body = groups
    .map(
      (g) =>
        `<h2 class="group">${g}</h2>\n<ul class="docs">\n` +
        docs.filter((d) => d.group === g)
          .map((d) => `<li><a href="${base}${d.out}">${d.title}</a><span>${d.blurb}</span></li>`)
          .join("\n") +
        "\n</ul>",
    )
    .join("\n")
  return shell(title, `<h1>${title}</h1>\n<div class="stamp">${stamp}</div>\n${body}`)
}
