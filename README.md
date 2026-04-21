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
