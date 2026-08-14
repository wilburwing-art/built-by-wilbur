export type Audience = "ai" | "client" | "both"
export type Status = "live" | "in-dev" | "prototype"

export type PreviewKind =
  | "agents"
  | "rag"
  | "voice"
  | "ceramic"
  | "hut"
  | "blueprint"
  | "ripple"
  | "campground"
  | "canyon"
  | "rib"
  | "bikeshare"

export interface Metric {
  label: string
  value: string
}

/** Blocks for long-form case studies that need more than three paragraphs. */
export type Block =
  | { kind: "prose"; text: string }
  | { kind: "sql"; code: string; caption?: string }
  | { kind: "table"; head: string[]; rows: string[][]; caption?: string }
  | { kind: "list"; items: string[] }

export interface Section {
  title: string
  blocks: Block[]
}

export interface CaseStudy {
  problem: string
  decision: string
  outcome: string
  metrics?: Metric[]
  /** Full walkthrough rendered below the summary. */
  sections?: Section[]
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
  /** Absent for analysis work that has no repo. */
  github?: string
  live?: string
  note?: string
  caseStudy?: CaseStudy
  preview: PreviewKind
  accent: string
}

export const projects: Project[] = [
  {
    slug: "cyclistic-bike-share",
    name: "Cyclistic Bike Share Analysis",
    tagline: "5.7M rides in BigQuery, and what separates a member from a casual",
    description:
      "Google Data Analytics capstone. Twelve months of public Chicago bike share data unioned into a single BigQuery table, cleaned, and queried to answer one question: how do annual members and casual riders actually use the bikes differently? The answer turned into a targeting recommendation, not a chart dump.",
    stack: ["SQL", "BigQuery", "Spreadsheets", "Data Cleaning"],
    tags: ["Data", "SQL"],
    audience: "both",
    status: "live",
    preview: "bikeshare",
    accent: "from-sky-600/25 via-blue-500/20 to-indigo-500/20",
    note: "Capstone for the Google Data Analytics Professional Certificate, 2023. Data is real Divvy trip data released publicly by Motivate International Inc.",
    caseStudy: {
      problem:
        "Cyclistic's marketing director believed future growth depended on converting casual riders into annual members. Nobody had established how the two groups actually differ. Without that, any conversion campaign is a guess sprayed at everyone who has ever rented a bike.",
      decision:
        "Twelve monthly CSVs, over five million rows, put spreadsheets out of the running immediately. I loaded all twelve into BigQuery, unioned them into one table, and did every step of cleaning and analysis in SQL so each decision stayed reproducible and auditable. Derived ride length, day of week, and month as columns rather than recomputing them per query, then cut the rows that were physically impossible before analyzing anything.",
      outcome:
        "Casual riders and members turned out to be nearly opposite populations: double the ride length, opposite peak days, opposite peak seasons, and only one shared station in either top ten. That killed the broad-campaign idea. The recommendation was narrow instead: target the casual riders whose behavior already looks like a member's.",
      metrics: [
        { label: "Rides analyzed", value: "5.7M" },
        { label: "Months unioned", value: "12" },
        { label: "Invalid rides cut", value: "4,272" },
        { label: "Casual avg ride", value: "26.3 min" },
        { label: "Member avg ride", value: "13.0 min" },
        { label: "Casual seasonal swing", value: "2,275%" },
      ],
      sections: [
        {
          title: "Business task",
          blocks: [
            {
              kind: "prose",
              text: "Cyclistic is a Chicago bike share company with two customer types: casual riders who buy single rides or day passes, and annual members. The marketing team wanted a strategy to convert casual riders into members, and executives would only approve recommendations backed by data. My assignment was the upstream question: how do annual members and casual riders use Cyclistic bikes differently?",
            },
          ],
        },
        {
          title: "Prepare",
          blocks: [
            {
              kind: "prose",
              text: "The data is real bike share data released publicly by Motivate International Inc., treated here as Cyclistic's own. I used the most recent twelve months available: May 2021 through April 2022, one CSV per month, all personally identifiable information already stripped. Each file carries the same 13 columns.",
            },
            {
              kind: "list",
              items: [
                "ride_id, rideable_type",
                "started_at, ended_at",
                "start_station_name, start_station_id",
                "end_station_name, end_station_id",
                "start_lat, start_lng, end_lat, end_lng",
                "member_casual",
              ],
            },
          ],
        },
        {
          title: "Process",
          blocks: [
            {
              kind: "prose",
              text: "Over five million rows ruled out a spreadsheet. I chose SQL in BigQuery, loaded each month as its own table named YYYYMM, then unioned all twelve into a single table.",
            },
            {
              kind: "sql",
              caption: "Union all twelve monthly tables",
              code: `SELECT ride_id, rideable_type, started_at, ended_at,
       start_station_name, start_station_id,
       end_station_name, end_station_id,
       start_lat, start_lng, end_lat, end_lng, member_casual
FROM \`course50.cyclistic.202105\`
UNION ALL
SELECT ride_id, rideable_type, started_at, ended_at,
       start_station_name, start_station_id,
       end_station_name, end_station_id,
       start_lat, start_lng, end_lat, end_lng, member_casual
FROM \`course50.cyclistic.202106\`
-- repeated for all 12 monthly tables`,
            },
            {
              kind: "prose",
              text: "I checked every string column for misspellings and stray values with DISTINCT, then checked for duplicate ride IDs. Five turned up. Inspecting them showed they were genuinely distinct rides that happened to share an ID, so I left them in rather than deleting real data over a cosmetic collision.",
            },
            {
              kind: "sql",
              caption: "Derive ride length, day of week, and month",
              code: `SELECT ride_id, rideable_type, started_at, ended_at,
       ROUND(TIMESTAMP_DIFF(ended_at, started_at, second) / 60, 1)
         AS ride_length_minutes,
       EXTRACT(DAYOFWEEK FROM started_at) AS day_of_week,
       EXTRACT(MONTH     FROM started_at) AS month,
       start_station_name, start_station_id,
       end_station_name, end_station_id,
       start_lat, start_lng, end_lat, end_lng, member_casual
FROM \`course50.cyclistic.bikeshare3\``,
            },
            {
              kind: "prose",
              text: "Profiling ride_length_minutes exposed the real data quality problem. The average looked plausible at 21.1 minutes, but the minimum was negative 58 minutes and the maximum was 55,940 minutes, roughly 39 days. A ride cannot run backwards, and a bike out for over 24 hours is a lost or stolen unit, not a trip. I found 86 negative rides and 4,186 rides longer than a day, and deleted both groups before analyzing anything.",
            },
            {
              kind: "sql",
              caption: "Cut physically impossible rides",
              code: `DELETE FROM \`course50.cyclistic.bikeshare3\`
WHERE ride_length_minutes < 0
   OR ride_length_minutes > 1440`,
            },
          ],
        },
        {
          title: "Analyze",
          blocks: [
            {
              kind: "prose",
              text: "With the data clean, the average ride length settled at 18.8 minutes overall. Split by rider type, the gap is the headline finding of the whole study.",
            },
            {
              kind: "table",
              caption: "Average ride length and total rides by rider type",
              head: ["Rider type", "Avg ride length", "Rides taken"],
              rows: [
                ["Member", "13.0 min", "3,199,427"],
                ["Casual", "26.3 min", "2,517,131"],
              ],
            },
            {
              kind: "prose",
              text: "Members take more rides but keep them short and consistent. Casual riders take fewer, longer rides. Grouping by day of week showed the two groups are close to inverted, with members peaking midweek and casual riders peaking on the weekend.",
            },
            {
              kind: "table",
              caption: "Rides by day of week (1 = Sunday, 7 = Saturday)",
              head: ["Day", "Member rides", "Casual rides"],
              rows: [
                ["1 Sun", "385,022", "473,338"],
                ["2 Mon", "442,879", "286,949"],
                ["3 Tue", "495,632", "268,523"],
                ["4 Wed", "503,621", "282,744"],
                ["5 Thu", "482,723", "295,779"],
                ["6 Fri", "450,116", "355,357"],
                ["7 Sat", "439,434", "554,441"],
              ],
            },
            {
              kind: "prose",
              text: "Seasonality separates them even harder. Both groups ride less in winter, but casual demand collapses and rebuilds on a completely different scale than member demand does.",
            },
            {
              kind: "table",
              caption: "Seasonal swing, low month to peak month",
              head: ["Metric", "Members", "Casual"],
              rows: [
                ["Ride count growth", "356%", "2,275%"],
                ["Ride time growth", "34%", "81%"],
                ["Weekly ride-count swing", "30%", "106%"],
              ],
            },
            {
              kind: "prose",
              text: "Finally I ranked stations, saving each result as its own table so I could join start counts to end counts and get total visits per station per group. Members and casual riders barely overlap: only one station appears in both top tens.",
            },
            {
              kind: "table",
              caption: "Top five stations by total visits",
              head: ["Member stations", "Casual stations"],
              rows: [
                ["Kingsbury St & Kinzie St", "Streeter Dr & Grand Ave"],
                ["Clark St & Elm St", "Millennium Park"],
                ["Wells St & Concord Ln", "Michigan Ave & Oak St"],
                ["Wells St & Elm St", "Shedd Aquarium"],
                ["Dearborn St & Erie St", "Theater on the Lake"],
              ],
            },
            {
              kind: "prose",
              text: "The member list is a commute: Loop and near-north street corners. The casual list is a waterfront tour: Navy Pier, Millennium Park, the aquarium. Not a single member in the dataset rode a docked bike, while casual riders took 289,175 docked rides.",
            },
          ],
        },
        {
          title: "What the data says",
          blocks: [
            {
              kind: "list",
              items: [
                "Members took roughly 56% of all rides, but casual riders rode twice as long per trip: 26.3 minutes against 13.0.",
                "Members peak on Wednesday and bottom out on the weekend. Casual riders do the exact opposite.",
                "Casual ride volume grew 2,275% from its January low to its July peak. Member volume grew 356%.",
                "Weekday morning and evening commute spikes belong to members. Weekends belong to casual riders.",
                "The two groups share only one station in the top ten. Casual riders hug the waterfront, members ride the street grid.",
              ],
            },
          ],
        },
        {
          title: "Recommendation",
          blocks: [
            {
              kind: "prose",
              text: "Because the populations barely overlap, a broad conversion campaign aimed at all casual riders would spend most of its budget on tourists who will never buy an annual membership in Chicago. The efficient target is the minority of casual riders who are already behaving like members. Concentrate the offer on casual riders who:",
            },
            {
              kind: "list",
              items: [
                "start or end at a station that ranks high for members",
                "take rides of roughly 13 minutes",
                "ride on a weekday",
                "ride in winter",
                "ride during normal commuting hours",
              ],
            },
            {
              kind: "prose",
              text: "Each of those five filters is a behavior a member already exhibits. A casual rider matching all five is commuting on single rides and is a pricing decision away from a membership. That is a targetable segment, and it is derived from the data rather than assumed.",
            },
          ],
        },
      ],
    },
  },
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
    tagline: "Filterable map of 175 backcountry huts",
    description:
      "Hand-verified atlas. Every entry checked against an operator's site. Static-first build, linter-enforced design system, Leaflet + OpenStreetMap. Shipped to Cloudflare Pages at hutatlas.com.",
    stack: ["HTML/CSS/JS", "Leaflet", "OpenStreetMap", "Cloudflare Pages"],
    tags: ["Shipped", "Design"],
    audience: "client",
    status: "live",
    github: "https://github.com/wilburwing-art/hut-atlas",
    live: "https://hutatlas.com",
    preview: "hut",
    accent: "from-green-500/25 via-emerald-500/20 to-lime-500/20",
    caseStudy: {
      problem:
        "Backcountry hut information is fragmented across operator sites, PDFs, and forum threads. A planner trying to route a trip ends up with fifteen browser tabs and no way to compare capacity, access, or season at a glance.",
      decision:
        "Skipped the framework. Single-file HTML with Leaflet and a hand-curated JSON file, so the whole site loads instantly and renders without JS for search engines. Enforced the design system with CSS custom properties and a linter. Every card looks consistent because it has to. Verified every hut against an operator source.",
      outcome:
        "Shipped to hutatlas.com on Cloudflare Pages. Loads fast, indexes well, no build step to babysit. The editorial constraint (every entry is hand-verified) is the product; the tech is boring in the best way.",
      metrics: [
        { label: "Huts cataloged", value: "175" },
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
      "Second atlas built from the same design system as Hut Atlas. 30 Western hot springs with water temperature, soak type, access, and booking details, same sortable-table discovery UX. Validates the atlas pattern as a productized offering: filter + hand-curated data, deployable in a week.",
    stack: ["HTML/CSS/JS", "Leaflet", "Vercel"],
    tags: ["Shipped", "Design"],
    audience: "client",
    status: "live",
    github: "https://github.com/wilburwing-art/hot-springs-atlas",
    live: "https://hotspringsatlas.com",
    preview: "ripple",
    accent: "from-sky-500/25 via-cyan-500/20 to-teal-500/20",
    caseStudy: {
      problem:
        "Every niche community (hot springs, trailheads, boutique campsites, coffee roasters) has the same problem: scattered data, no canonical reference. Building each one from scratch is silly.",
      decision:
        "Treated Hut Atlas as the template. Cloned the design system and swapped the JSON dataset. Deployed to Vercel. The thesis: this is a repeatable client offering. Hand me a dataset, get a branded atlas in a week.",
      outcome:
        "Proves the pattern scales without a framework. Second atlas went from zero to data-complete in days, not months. The productized version of this is the interesting part. Every niche community is a potential client.",
      metrics: [
        { label: "Second deploy time", value: "days" },
        { label: "Shared components", value: "100%" },
        { label: "Repeatable", value: "yes" },
      ],
    },
  },
  {
    slug: "campground-atlas",
    name: "Campground Atlas",
    tagline: "Every campground in the US, Canada, and Mexico",
    description:
      "40,954 campgrounds in one sortable spreadsheet, plus a map and region browser. Open data sourced from federal, state, provincial, and OpenStreetMap records, normalized into a single schema so you can sort and filter any column instead of digging through a dozen agency sites.",
    stack: ["HTML/CSS/JS", "Leaflet", "OpenStreetMap", "Vercel"],
    tags: ["Shipped", "Design"],
    audience: "client",
    status: "live",
    github: "https://github.com/wilburwing-art/campground-db",
    live: "https://campgroundatlas.com",
    preview: "campground",
    accent: "from-amber-600/25 via-red-600/15 to-orange-500/20",
  },
  {
    slug: "slot-canyon-atlas",
    name: "Slot Canyon Atlas",
    tagline: "Every slot canyon, in one sortable map",
    description:
      "790 canyons across 245 regions, filterable by difficulty class, water, and flood risk, trip-planned against current agency permit rules. Pin color on the map matches ACA difficulty class. Free, no account, no ads.",
    stack: ["HTML/CSS/JS", "Leaflet", "OpenStreetMap", "Vercel"],
    tags: ["Shipped", "Design"],
    audience: "client",
    status: "live",
    github: "https://github.com/wilburwing-art/slot-canyon-atlas",
    live: "https://slotcanyonatlas.com",
    preview: "canyon",
    accent: "from-rose-600/25 via-orange-600/15 to-amber-500/20",
  },
  {
    slug: "throwform",
    name: "ThrowForm",
    tagline: "Parametric pottery rib tool generator",
    description:
      "Design a bowl profile, and the app extracts wall curvature into a rib tool shape, exports 1:1mm SVG/DXF files for laser cutting, computes wet clay weight with shrinkage compensation, and models unit economics through Amazon FBA. A dedicated Agents tab runs Claude for market research, listing copy, and vendor comparison.",
    stack: ["React", "Vite", "Claude API"],
    tags: ["AI", "Shipped"],
    audience: "both",
    status: "live",
    github: "https://github.com/wilburwing-art/throwform",
    live: "https://throwform.vercel.app",
    note: "Formbook designs the form; ThrowForm cuts the rib that matches it.",
    preview: "rib",
    accent: "from-zinc-500/25 via-slate-500/20 to-stone-400/20",
  },
]

export const byAudience = (a: Audience) =>
  projects.filter((p) => p.audience === a || p.audience === "both")

export const bySlug = (slug: string) =>
  projects.find((p) => p.slug === slug)
