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
    slug: "zero-fill-means-nobody-wrote-the-join",
    title: "A column at exactly zero percent means nobody wrote the join",
    summary:
      "Two fields on my campervan schema were empty on all 19,383 rows. Both sides of the join were already on disk. What a fill rate of 0.0 tells you that a fill rate of 3 percent does not.",
    date: "2026-08-26",
    tags: ["Data", "Pipelines"],
    status: "published",
    body: `My campervan spot database declares two fields I care about a lot: miles to the nearest dump station, and miles to the nearest potable water. Both have been in the schema since I wrote it. Both were empty on all 19,383 spots. My first instinct was that the data did not exist upstream, and I started scoping a fetch.

Both sides were already sitting in the repo. One directory held 14,000 service rows across ten categories. Another held the spots. Nothing in the codebase read both. The join I eventually wrote runs in 1.4 seconds and touches no network. What looked like a collection gap was a wiring gap, and the tell was the number itself: a derived column at exactly 0.0 percent is a different symptom from one at 3 percent. Partial fill means the code ran and the source is thin. Exact zero means the code was never called. Check for the directory before you scope the fetch.

Running the join let me measure the service layer for the first time, and the layer was thinner than it should have been. OpenStreetMap records these services in two places: as a standalone amenity node, and as a property flag on the campground that contains one. Every fetcher I had written asked only for the first form. A sweep for the second took my dump station file from 271 rows to 513, and set on site flags on 154 campgrounds that were already in the database.

Rerunning the join against the larger layer moved the median distance to a dump station from 28.9 miles to 21.9. The share of spots with one inside 25 miles went from 42 percent to 56. The number of spots with nothing at all inside 100 miles fell from 253 to 95. Same spots, same afternoon, a better question asked of the same source.

Propane is the control case that keeps me honest about the diagnostic. Its median is 51.6 miles and 4,208 spots have none within 100. That one really is upstream: Idaho has exactly four propane sources tagged in OpenStreetMap, and my database holds all four. Sparse input, complete ingest, and no amount of joining will improve it.

Two rules came out of it. Store the id of the row you matched beside the distance, so a suspicious number traces back to a real record instead of asking you to trust the arithmetic. And return null past a threshold rather than a very large number, because beyond about 100 miles the answer is describing the edge of my coverage rather than the ground.`,
  },
  {
    slug: "reachable-denominator",
    title: "Five percent filled, and already finished",
    summary:
      "A report flagged two joins as the cheapest unclaimed work I had. Both were at their exact ceiling. The fix was to stop dividing by the size of the table.",
    date: "2026-08-29",
    tags: ["Data", "Metrics"],
    status: "published",
    body: `A capability report I generated over my own repos flagged two joins as the cheapest unclaimed value in the portfolio. Ski resorts linked to a snow telemetry station: 377 of 6,971 resorts, about five percent. Nordic areas linked to the same network: 8,334 of 50,898, about sixteen. Two obvious wins, sitting there.

Both were already filled to their exact ceiling. The station network covers the mountain west of the United States and stops. Of 3,898 stations in the registry, 1,132 actually report daily observations, and the box they cover contains 523 of those 6,971 resorts and 12,853 of those 50,898 nordic areas. Every resort a station could possibly serve already had one. The five percent was measuring the shape of North America.

So the tooling now prints a column called reachable: source rows sitting inside the target's measured footprint, counting only target rows capable of serving a match. It prints the instrument that drew the footprint next to it, because a denominator cannot be read without knowing how it was measured. A raw minimum and maximum is correct for a contiguous target and badly wrong for a scattered one, where it draws a box over thousands of miles of empty ocean and hands you a denominator with no rows behind it.

The completion test is filled equals ceiling, where ceiling counts reachable rows that have a target inside the registered radius. When those two match, the pair is finished and the gap that remains belongs to the target's coverage. Both of my supposed wins passed it.

That denominator also moves, which surprised me. I backfilled the almanac from one water year to ten, reaching 13.4 million daily observations, and the set of reporting stations grew from 1,112 to 1,132. Seventeen California stations, two in Alaska and one in Montana had reported in earlier years and not in this one. That opened matches which did not exist the week before, and the ski join went from 375 to 377 without a line of code changing. A completeness verdict against a time series is relative to how deep the series goes, so date it, and rerun it after any backfill.

Published percentages create work. I came close to spending a week filling two columns that had no rows left to fill.`,
  },
  {
    slug: "checks-that-ran-on-nothing",
    title: "Four checks that passed because they ran on nothing",
    summary:
      "A design linter that had never executed once, an auditor scanning two empty directories, and a render time gate that turned out to be a permanent hiding place for a typo.",
    date: "2026-08-24",
    tags: ["Testing", "Tooling"],
    status: "published",
    body: `While porting a design linter between two of my atlas sites I found a check that had never executed. It compared rendered pages against a list of candidate sample files by name, and both names belonged to the repo it had been copied from. Neither file existed here. It found no sample, ran zero comparisons, and exited zero.

There were three more in the same repo. A metadata auditor scanned two directories that were both empty, so it audited zero pages and reported clean. Two separate build scripts each wrote the sitemap with a different list of top pages, so whichever ran last won and neither was wrong on its own terms. A link checker scraped adjacent pairs of fields that the templates had stopped emitting months earlier, so it verified no links at all.

They share one shape: every one of them reported success. A check with no targets and a check whose targets all pass produce the same exit code, and only one of those tells you anything. The remedy is cheap. Print the target count, and exit nonzero when it is zero.

The root cause of the first one was the hardcoded list of candidate paths. A path list copied between repos rots into exactly this failure, so the config now takes a directory and the check walks it. It also names the file it actually looked at, per source, which puts a zero in the log instead of leaving it to be inferred from an absence.

A subtler version of the same thing bit me in a viewer. I have a render time gate that hides a filter control when its column carries no data, which is correct behavior and also a permanent hiding place for a typo. Two of my viewers declared column keys the API never returns. One asked for agency and url while the rows carry managing_agency and source_url, so the values came back undefined on every row and the gate hid an agency dropdown that had real content behind 86 percent of them. A fill rate gate cannot tell no data apart from wrong key. Diff the declared keys against the keys the API actually returns before gating anything on them.

The last step was installing the linter's own pre push hook, which the repo had never had: the hooks directory held only the samples git ships with. It failed on its first run, on a 404 from a permit URL I had written from a guessed path.`,
  },
  {
    slug: "webfetch-invents-the-field",
    title: "The fetch tool will invent a number that is not on the page",
    summary:
      "Building a permit database taught me that an agent asked for a missing field returns something plausible rather than nothing. Two fabrications, and the protocol that caught them.",
    date: "2026-08-25",
    tags: ["AI", "Research"],
    status: "published",
    body: `I built an atlas of long distance backpacking routes where the moat is the permit: what kind, which application window, published lottery odds, cost, how much of the quota is held for walk ups. Forty seven routes across 29 states and provinces, every permit field read from the agency that manages the trail.

I filled those fields with an agent that fetches a page and returns the value. The important property of that tool is that it returns a small model's summary of the page rather than the page, and when a field is absent, the summary supplies something plausible instead of nothing. That is the failure mode the whole pipeline has to be designed against, because a fabricated permit fee is indistinguishable from a real one at the point where it lands in your database.

Two got caught in a single pass. A search summary offered 2,700 Wonderland Trail applications, when the Park Service publishes 5,000 across climbing, Wonderland and backpacking combined. The number was real, attached to the wrong thing, and off by half. The second announced itself: a six dollar fee "based on information from related permit systems", which is a model saying out loud that it is inferring. Wonderland's odds field is null today because I could not source it, and that null is the correct value.

The protocol that stuck is boring. Every field gets pulled with a prompt demanding a verbatim quote from the page or the literal string NOT ON PAGE, and nothing else is accepted into the record. The Enchantments odds field now carries "typically less than 10% of applicants are successful" as a quote from the Forest Service page. Wonderland carries nothing.

Then enforce it in the schema, because a protocol nobody can violate beats a protocol everybody agrees with. My validator rejects any route that sets permitRequired or permitOdds without a permitSource URL. "No permit required" is the single claim in this dataset that can strand somebody at a trailhead at 6am, so it does not get to be an unsourced assertion. Forty six of the forty seven routes carry a source.

The other half of the discipline is presence. Every required key is written on every route, and an unresearched one is an explicit null that renders as an italic "unknown". A blank cell cannot be told apart from a real empty. Once a reader learns that a missing field means nobody has looked yet, the atlas gets to be honest about being half finished, which is the only accurate thing it could be.`,
  },
  {
    slug: "one-agency-many-spellings",
    title: "One agency, 1,851 spellings",
    summary:
      "A free text column that every filter and every count disagreed with, and no error would surface it. The three tier reference dimension I built to fix it across five databases.",
    date: "2026-08-29",
    tags: ["Data", "Modeling"],
    status: "published",
    body: `My trailhead database has a managing_agency column, filled on 62,506 of 73,044 rows and carrying 1,851 distinct values. The Forest Service appears as USFS 8,400 times, as US Forest Service 486 times, and as U.S. Forest Service another 33. The Park Service splits 2,823 to 473 the same way. Another 1,674 rows hold Federal, State, Local or County, which name an ownership class where the column asks for an agency. Nothing in that list is a typo. Every value came from a real upstream source that spelled it that way.

Every filter, every group by and every count taken off that column disagreed with every other one, and no error would ever surface it. So the column became a foreign key into a shared reference dimension, with the original string kept in place beside the id and the match method recorded next to both.

It has three tiers and the split between them does the work. A seed command rewrites the registry files wholesale from public federal sources: 49 agencies and 2,011 administrative units, each carrying the URL it came from. A derive command rewrites a second pair of files from pattern rules that turn structured administrative names into real rows, which is how Landkreis, Provincie, Consell and the Seoul district offices got covered without hand entry. A third file holds 64 hand written rows and is never written by any command. Put a curated row in a generated file and the next run deletes it, so a test fails if an id shows up in more than one file.

The hand tier is demand driven. Every row in it is a value that actually appeared in the unmatched report, ranked by how many rows it covers rather than by distinct string, because one value covering 2,100 rows outweighs several hundred entries in the tail. That ordering is the reason the hand tier is 64 rows and not 600.

Widening the geographic scope beyond the United States exposed a real bug. Slug ids are built by folding a name to ASCII, and a Korean agency name folds to an empty string, so every Korean row was dropped with nothing written to the log. The function now falls back to a stable digest of the original. Its sibling failure, two distinct names collapsing onto the same slug, had already bitten a different repo of mine months earlier, which is a reasonable argument for treating id generation as a component with its own tests rather than a one line helper.

Two tests broke when the scope widened, and both were the rule going stale rather than the data being wrong. Expect that class whenever geographic scope moves. Expect this one too: one atlas went from 1,100 of 1,843 values resolved to 2,501 of 6,434. The rate fell from 60 percent to 39, and 1,401 more rows resolved. Across a scope change, read the counts. The rate is describing a denominator that moved underneath it.`,
  },
  {
    slug: "orchestrating-claude-agents",
    title: "Orchestrating Claude agents without burning your budget",
    summary:
      "What I learned from building a small committee of agents instead of one big context stuffer: routing, structured outputs, and where multi-agent architectures earn their keep.",
    date: "2026-04-22",
    tags: ["AI", "Agents"],
    status: "draft",
    body: `Most multi-agent systems I've seen in the wild aren't actually multi-agent. They're one giant prompt with roleplay. That works until it doesn't, and when it doesn't, the bill arrives.

Building Fit-AI, I wanted each "agent" to be a narrow, typed function with a clear contract. PydanticAI made that boringly simple. The router agent's only job is to decide which downstream agent runs and at what model tier. The planner agent only ever sees a structured training history and returns a structured plan. The feedback agent takes the plan plus recent workouts and produces the next week.

The result is a system I can actually reason about. Cost per turn is predictable. Failures are local; a bad response from the planner doesn't poison the feedback loop. And because every hand-off is typed, I can swap models without rewriting downstream code.

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

I rewrote the chunker around speaker turns with overlap. Added speaker and timestamp as first-class metadata. Required the generator to cite chunk IDs in every response. That last part is the one that turned "retrieval looks fine" into "retrieval is actually fine", because now failures are visible instead of plausible.

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
    body: `I ship production apps on Next.js all the time. Formbook runs on Next 16. But a portfolio isn't a product. It's a few static sections and a grid. Every bit of Next.js infrastructure is dead weight for that.

Vite + React + TypeScript + Tailwind + shadcn/ui gets me the same developer experience with a tenth of the build pipeline. The bundle is smaller. Cold start is faster. I don't need an API route; if I ever do, I can always add one behind a worker.

The real rule: use the framework that matches the shape of your problem. A single-page portfolio is not the shape Next.js is optimized for.`,
  },
]

export const bySlug = (slug: string) => posts.find((p) => p.slug === slug)
