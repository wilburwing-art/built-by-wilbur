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
