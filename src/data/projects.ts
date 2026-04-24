export type Audience = "ai" | "client" | "both"
export type Status = "live" | "in-dev" | "prototype"

export type PreviewKind =
  | "agents"
  | "rag"
  | "voice"
  | "ceramic"
  | "atlas"
  | "blueprint"
  | "ripple"

export interface Metric {
  label: string
  value: string
}

export interface CaseStudy {
  problem: string
  decision: string
  outcome: string
  metrics?: Metric[]
}

export interface Project {
  slug: string
  name: string
  tagline: string
  description: string
  stack: string[]
  tags: string[]
  audience: Audience
  status: Status
  github: string
  live?: string
  note?: string
  caseStudy?: CaseStudy
  preview: PreviewKind
  accent: string
}

export const projects: Project[] = [
  {
    slug: "fit-ai",
    name: "Fit-AI",
    tagline: "Multi-agent AI fitness coach",
    description:
      "FastAPI backend orchestrating PydanticAI agents over Claude Sonnet 4.5. Structured outputs, cost-aware model routing, and a streaming HTMX frontend. The interesting part isn't the chat, it's deciding which agent runs and how much context it sees.",
    stack: ["FastAPI", "PydanticAI", "Claude 4.5", "Postgres", "HTMX", "Tailwind"],
    tags: ["AI", "Agents"],
    audience: "ai",
    status: "in-dev",
    github: "https://github.com/wilburwing-art/fit-AI",
    note: "Live demo in progress. Walkthrough available on request.",
    preview: "agents",
    accent: "from-violet-500/30 via-fuchsia-500/20 to-sky-500/20",
    caseStudy: {
      problem:
        "Off-the-shelf fitness chatbots either give generic advice or melt your token budget by stuffing every conversation into the model's context. I wanted a coach that remembers training history, adapts plans week to week, and does not cost a dollar per session.",
      decision:
        "Built a small committee of PydanticAI agents (a router, a planner, a feedback agent) each with narrowly typed inputs and outputs. The router picks the cheapest model that can plausibly handle the turn; context is fetched from Postgres on demand, not pre-baked. Structured outputs keep downstream code deterministic, and streaming keeps the HTMX UI responsive.",
      outcome:
        "Agents coordinate cleanly and I can reason about cost per turn instead of hoping. Structured outputs eliminated a whole class of parsing errors the prototype was hitting. The architecture generalizes beyond fitness, which is the real win.",
      metrics: [
        { label: "Agents in pipeline", value: "3" },
        { label: "Model tiers routed", value: "2" },
        { label: "Avg turns / session", value: "~6" },
      ],
    },
  },
  {
    slug: "session-notes-rag",
    name: "Session Notes RAG",
    tagline: "Retrieval over clinical transcripts",
    description:
      "End-to-end pipeline for session transcripts: audio in, chunked and embedded, served back through a retrieval-augmented chatbot. Built with synthetic data; the problem is handling long, semi-structured conversation chunks without the retrieval step hallucinating context.",
    stack: ["Python 3.12", "Anthropic API", "RAG", "GitHub Actions"],
    tags: ["AI", "RAG"],
    audience: "ai",
    status: "in-dev",
    github: "https://github.com/wilburwing-art/therapy-session-rag",
    note: "Built on synthetic data for portfolio purposes.",
    preview: "rag",
    accent: "from-emerald-500/25 via-teal-500/20 to-cyan-500/20",
    caseStudy: {
      problem:
        "Conversational transcripts break naive RAG. Default chunkers cut mid-sentence, lose speaker turns, and blur the emotional arc a clinician actually needs to find. Retrieval that looks fine on a technical doc quickly hallucinates on a human transcript.",
      decision:
        "Chunk on speaker turns with overlap, not fixed token windows. Store speaker + timestamp as metadata and filter at query time. Route the retrieval augmentation through Claude with an explicit instruction to cite chunk IDs, so I can evaluate retrieval quality separately from generation quality. CI runs a suite of golden queries on every commit.",
      outcome:
        "Citations make retrieval failures visible instead of plausible-sounding. The eval suite catches regressions before they ship. The pipeline generalizes to any long-form conversation: interviews, meetings, support calls.",
      metrics: [
        { label: "Synthetic transcripts", value: "24" },
        { label: "Golden eval queries", value: "18" },
        { label: "CI runs before merge", value: "every commit" },
      ],
    },
  },
  {
    slug: "voice-to-blender",
    name: "Voice to Blender",
    tagline: "Speak a scene, get a render",
    description:
      "Voice capture → Whisper → Claude → Blender MCP → rendered output. The pipeline is the point: demonstrates Claude as an orchestrator between a creative tool and a natural-language input, not just a chat endpoint.",
    stack: ["Python", "Claude API", "Blender MCP", "Whisper"],
    tags: ["AI", "MCP"],
    audience: "ai",
    status: "prototype",
    github: "https://github.com/wilburwing-art/voice-to-blender",
    note: "Early prototype. Video walkthrough coming.",
    preview: "voice",
    accent: "from-orange-500/25 via-rose-500/20 to-purple-500/25",
    caseStudy: {
      problem:
        "Blender is powerful but menu-driven; every creative person I know who wants to model something gives up in the first ten clicks. I wanted to see if a voice layer plus a model could collapse the learning curve without replacing the tool.",
      decision:
        "Voice is captured locally, transcribed via Whisper, and handed to Claude with a Blender MCP tool harness. Claude decides whether to call Blender or to ask a clarifying question. No chat UI: the render is the UI.",
      outcome:
        "Proof of concept shows that Claude plus MCP is enough to turn natural language into basic scene construction. The interesting failure cases are about Blender's geometry math, not the language model, which is exactly where an MCP-based workflow should fail.",
      metrics: [
        { label: "Round-trip latency", value: "~3s" },
        { label: "MCP tools exposed", value: "6" },
        { label: "Clicks saved per scene", value: "many" },
      ],
    },
  },
  {
    slug: "formbook",
    name: "Formbook",
    tagline: "Studio journal for wheel-thrown ceramic forms",
    description:
      "Full-stack web app for potters. Custom SVG rendering pipeline turns a handful of form parameters into publication-quality sections, with per-user auth, transactional email, and a production Postgres DB. Ships real email to real users.",
    stack: ["Next.js 16", "React 19", "TypeScript", "Tailwind 4", "Supabase", "Resend"],
    tags: ["Full-stack", "Shipped"],
    audience: "both",
    status: "live",
    github: "https://github.com/wilburwing-art/formbook",
    live: "https://formbook-nine.vercel.app",
    preview: "ceramic",
    accent: "from-amber-500/25 via-orange-500/20 to-stone-500/20",
    caseStudy: {
      problem:
        "Potters track form specs in notebooks and phone photos. Nothing on the market rendered a proper cross-section from the measurements they already take (rim, shoulder, waist, foot) in a way you could share, archive, or compare across firings.",
      decision:
        "Wrote a tiny SVG renderer that turns a handful of parameters into a publication-quality section. Built the full app on Next.js App Router with Supabase for auth and Postgres, Resend for transactional email, and a minimal Tailwind design language. Kept the data model flat enough that non-technical users can actually enter forms.",
      outcome:
        "Shipped to real studio users. The rendering pipeline is the thing that makes the app feel like a product and not a form. The backend is boring on purpose. Boring backends ship.",
      metrics: [
        { label: "Deployed", value: "Vercel" },
        { label: "DB", value: "Supabase Postgres" },
        { label: "Real users", value: "yes" },
      ],
    },
  },
  {
    slug: "hut-atlas",
    name: "Hut Atlas",
    tagline: "Filterable map of 96+ Western backcountry huts",
    description:
      "Hand-verified atlas. Every entry checked against an operator's site. Static-first build, linter-enforced design system, Leaflet + OpenStreetMap. Shipped to Cloudflare Pages at hutatlas.com.",
    stack: ["HTML/CSS/JS", "Leaflet", "OpenStreetMap", "Cloudflare Pages"],
    tags: ["Shipped", "Design"],
    audience: "client",
    status: "live",
    github: "https://github.com/wilburwing-art/hut-atlas",
    live: "https://hutatlas.com",
    preview: "atlas",
    accent: "from-green-500/25 via-emerald-500/20 to-lime-500/20",
    caseStudy: {
      problem:
        "Backcountry hut information is fragmented across operator sites, PDFs, and forum threads. A planner trying to route a trip ends up with fifteen browser tabs and no way to compare capacity, access, or season at a glance.",
      decision:
        "Skipped the framework. Single-file HTML with Leaflet and a hand-curated JSON file, so the whole site loads instantly and renders without JS for search engines. Enforced the design system with CSS custom properties and a linter. Every card looks consistent because it has to. Verified every hut against an operator source.",
      outcome:
        "Shipped to hutatlas.com on Cloudflare Pages. Loads fast, indexes well, no build step to babysit. The editorial constraint (every entry is hand-verified) is the product; the tech is boring in the best way.",
      metrics: [
        { label: "Huts cataloged", value: "96+" },
        { label: "JS frameworks", value: "0" },
        { label: "First paint", value: "sub-second" },
      ],
    },
  },
  {
    slug: "fourplex-project",
    name: "Fourplex Project",
    tagline: "Real-estate development command center",
    description:
      "Private hub for a Utah County fourplex build: 60-day action plan, live proforma math, lender comparisons, planning/lots/qualifier tabs. Persists offline via localStorage for field use during lot visits.",
    stack: ["React 19", "Vite", "TypeScript", "Tailwind 4", "Supabase"],
    tags: ["Product", "React"],
    audience: "client",
    status: "live",
    github: "https://github.com/wilburwing-art/fourplex-project",
    preview: "blueprint",
    accent: "from-blue-500/25 via-indigo-500/20 to-slate-500/20",
    caseStudy: {
      problem:
        "A fourplex build has roughly a thousand moving parts across lot research, zoning, lenders, and a 60-day pre-construction action plan. Keeping them in spreadsheets means you are always on the wrong tab when you need to be on a different tab.",
      decision:
        "Built a React app with a tab-per-workstream layout: actions, timeline, proforma, lenders, planning, lots, qualifier. Persists to localStorage so it works offline on lot visits, syncs to Supabase when back on wifi. Math updates live. No save button, no stale numbers.",
      outcome:
        "Actively used to run a real build. The offline-first decision turned out to matter more than expected; cell service at rural lots is unreliable. Switching Excel workflows to this app saved the kind of time nobody tracks until they stop losing it.",
      metrics: [
        { label: "Workstreams tracked", value: "7" },
        { label: "Offline-capable", value: "yes" },
        { label: "Save button", value: "none" },
      ],
    },
  },
  {
    slug: "hot-springs-atlas",
    name: "Hot Springs Atlas",
    tagline: "White-label atlas pattern for niche communities",
    description:
      "Second atlas built from the same design system as Hut Atlas. 30+ Western hot springs, same map-driven discovery UX. Validates the atlas pattern as a productized offering: map + filter + hand-curated data, deployable in a week.",
    stack: ["HTML/CSS/JS", "Leaflet", "Cloudflare Workers"],
    tags: ["Design", "Pattern"],
    audience: "client",
    status: "in-dev",
    github: "https://github.com/wilburwing-art/hot-springs-atlas",
    preview: "ripple",
    accent: "from-sky-500/25 via-cyan-500/20 to-teal-500/20",
    caseStudy: {
      problem:
        "Every niche community (hot springs, trailheads, boutique campsites, coffee roasters) has the same problem: scattered data, no canonical reference. Building each one from scratch is silly.",
      decision:
        "Treated Hut Atlas as the template. Cloned the design system and swapped the JSON dataset. Deployed behind Cloudflare Workers for edge caching. The thesis: this is a repeatable client offering. Hand me a dataset, get a branded atlas in a week.",
      outcome:
        "Proves the pattern scales without a framework. Second atlas went from zero to data-complete in days, not months. The productized version of this is the interesting part. Every niche community is a potential client.",
      metrics: [
        { label: "Second deploy time", value: "days" },
        { label: "Shared components", value: "100%" },
        { label: "Repeatable", value: "yes" },
      ],
    },
  },
]

export const byAudience = (a: Audience) =>
  projects.filter((p) => p.audience === a || p.audience === "both")

export const bySlug = (slug: string) =>
  projects.find((p) => p.slug === slug)
