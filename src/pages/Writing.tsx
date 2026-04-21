import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { posts } from "@/data/posts"
import { Badge } from "@/components/ui/badge"
import { Seo } from "@/components/Seo"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function Writing() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      <Seo
        title="Writing"
        description="Short notes on building: AI engineering, RAG retrieval, and web craft."
        path="/writing"
      />
      <header className="mb-12">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
          Writing
        </p>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight mb-4">
          Notes on building.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          Short pieces on how I think about AI engineering, RAG retrieval, and
          web craft. Drafts appear first, polished versions follow.
        </p>
      </header>

      <ul className="flex flex-col divide-y divide-border/60">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link
              to={`/writing/${p.slug}`}
              className="group flex flex-col gap-2 py-6 transition-colors hover:bg-muted/20 -mx-4 px-4 rounded-md"
            >
              <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
                <span>{formatDate(p.date)}</span>
                {p.status === "draft" && (
                  <Badge variant="muted" className="text-[10px]">
                    Draft
                  </Badge>
                )}
                {p.tags.map((t) => (
                  <Badge key={t} variant="outline" className="text-[10px]">
                    {t}
                  </Badge>
                ))}
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight group-hover:underline decoration-muted-foreground underline-offset-4">
                {p.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {p.summary}
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Read
                <ArrowRight className="size-4" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
