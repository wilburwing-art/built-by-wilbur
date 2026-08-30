import { ArrowLeft } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { bySlug } from "@/data/posts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Seo } from "@/components/Seo"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })
}

export function Post() {
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? bySlug(slug) : undefined

  if (!post) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold tracking-tight mb-3">
          Post not found
        </h1>
        <Link to="/writing">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="size-4" />
            Back to writing
          </Button>
        </Link>
      </section>
    )
  }

  return (
    <article className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
      <Seo
        title={post.title}
        description={post.summary}
        path={`/writing/${post.slug}`}
        type="article"
      />
      <Link
        to="/writing"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
      >
        <ArrowLeft className="size-4" />
        Back to writing
      </Link>

      <header className="flex flex-col gap-4 mb-10">
        <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
          <span>{formatDate(post.date)}</span>
          {post.status === "draft" && (
            <Badge variant="muted" className="text-[10px]">
              Draft
            </Badge>
          )}
          {post.tags.map((t) => (
            <Badge key={t} variant="outline" className="text-[10px]">
              {t}
            </Badge>
          ))}
        </div>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight">
          {post.title}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {post.summary}
        </p>
      </header>

      <div className="flex flex-col gap-6 text-base leading-relaxed text-foreground">
        {post.body.split("\n\n").map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </article>
  )
}
