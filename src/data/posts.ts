export interface Post {
  slug: string
  title: string
  summary: string
  date: string
  tags: string[]
  status: "draft" | "published"
  body: string
}

export const posts: Post[] = [
  {
    slug: "orchestrating-claude-agents",
    title: "Orchestrating Claude agents without burning your budget",
    summary:
      "What I learned from building a small committee of agents instead of one big context stuffer — routing, structured outputs, and where multi-agent architectures earn their keep.",
    date: "2026-04-22",
    tags: ["AI", "Agents"],
    status: "draft",
    body: `Most multi-agent systems I've seen in the wild aren't actually multi-agent — they're one giant prompt with roleplay. That works until it doesn't, and when it doesn't, the bill arrives.

Building Fit-AI, I wanted each "agent" to be a narrow, typed function with a clear contract. PydanticAI made that boringly simple. The router agent's only job is to decide which downstream agent runs and at what model tier. The planner agent only ever sees a structured training history and returns a structured plan. The feedback agent takes the plan plus recent workouts and produces the next week.

The result is a system I can actually reason about. Cost per turn is predictable. Failures are local — a bad response from the planner doesn't poison the feedback loop. And because every hand-off is typed, I can swap models without rewriting downstream code.

More soon on how I'm evaluating this.`,
  },
  {
    slug: "rag-retrieval-on-transcripts",
    title: "RAG retrieval failures I hit on clinical transcripts",
    summary:
      "Default chunkers fall apart on conversation data. Here's how I rebuilt retrieval around speaker turns, why citations matter more than you think, and what a real eval loop looks like.",
    date: "2026-04-15",
    tags: ["AI", "RAG"],
    status: "draft",
    body: `Every RAG tutorial on the internet uses the same example: split a PDF by token count, embed, retrieve, generate. Works great. Try it on a transcript of two humans talking for an hour and watch it melt.

The failures were predictable in hindsight. Fixed-window chunks cut mid-sentence. Speaker turns got merged. The model couldn't tell which voice said what, so the generation layer hallucinated confident attributions. Retrieval scores looked fine; output was garbage.

I rewrote the chunker around speaker turns with overlap. Added speaker and timestamp as first-class metadata. Required the generator to cite chunk IDs in every response. That last part is the one that turned "retrieval looks fine" into "retrieval is actually fine" — because now failures are visible instead of plausible.

Full writeup coming.`,
  },
  {
    slug: "next-to-vite-portfolio",
    title: "Why I built my portfolio on Vite, not Next.js",
    summary:
      "Next.js is a great framework for products with routes. A portfolio doesn't need routes, it needs load time and control. Here's the short version of the tradeoff.",
    date: "2026-04-10",
    tags: ["Web", "Tooling"],
    status: "draft",
    body: `I ship production apps on Next.js all the time. Formbook runs on Next 16. But a portfolio isn't a product — it's a few static sections and a grid. Every bit of Next.js infrastructure is dead weight for that.

Vite + React + TypeScript + Tailwind + shadcn/ui gets me the same developer experience with a tenth of the build pipeline. The bundle is smaller. Cold start is faster. I don't need an API route; if I ever do, I can always add one behind a worker.

The real rule: use the framework that matches the shape of your problem. A single-page portfolio is not the shape Next.js is optimized for.`,
  },
]

export const bySlug = (slug: string) => posts.find((p) => p.slug === slug)
