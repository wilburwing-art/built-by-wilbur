# built-by-wilbur

Portfolio site for Wilbur — selected work in React, TypeScript, and the Anthropic stack.

## Stack

- Vite + React 19 + TypeScript
- Tailwind CSS v4
- shadcn/ui primitives (hand-rolled, no CLI)
- lucide-react icons
- Deploys to Vercel

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build   # tsc -b && vite build
npm run preview # preview the production build locally
```

## Deploy

Push to GitHub and connect the repo in Vercel — `vercel.json` is preconfigured for Vite + SPA routing.

## Edit the projects shown

All content lives in `src/data/projects.ts`. Update that file to add, remove, or reorder cards. Items with `tier: "featured"` render in the large grid; `tier: "more"` render in the compact grid below.

## Agent skills

`.claude/skills/` holds a vendored copy of [Superpowers](https://github.com/obra/superpowers) (MIT, Jesse Vincent) — a skill library covering brainstorming, TDD, systematic debugging, plan writing and execution, code review, and git worktrees. Claude Code picks these up automatically for anyone working in this repo, including web sessions where plugin install is not available.

Do not edit the vendored files. To update:

```bash
scripts/sync-superpowers.sh          # pinned version
scripts/sync-superpowers.sh v6.5.0   # or a specific tag
```

The pinned version and upstream commit are recorded in `.claude/skills/SUPERPOWERS-VERSION`.

### Brainstorming on every turn

`.claude/settings.json` registers a `UserPromptSubmit` hook that tells Claude to invoke the `brainstorming` skill before responding, on every message. The skill classifies how much process a request actually needs, so trivial asks stay quick. The one carve-out is work already brainstormed earlier in the same session, so execution is not interrupted to re-design what was just agreed.

To turn it off for yourself without changing the repo, set `disableAllHooks` in `.claude/settings.local.json`, or delete the `hooks` block here to turn it off for everyone.

### Document skills (Word, Excel, PowerPoint, PDF)

`.claude/settings.json` also registers the [anthropics/skills](https://github.com/anthropics/skills) marketplace and enables its `document-skills` plugin, which provides the `docx`, `xlsx`, `pptx`, and `pdf` skills.

These skills are source-available, not open source, and their license forbids keeping copies outside Anthropic's services, so unlike Superpowers they are not vendored here. Claude Code installs them from the marketplace instead. If a session reports them as not installed, run:

```bash
claude plugin install document-skills@anthropic-agent-skills
```

The same marketplace also offers `example-skills` (frontend-design, canvas-design, theme-factory, webapp-testing, and more), installable the same way.
