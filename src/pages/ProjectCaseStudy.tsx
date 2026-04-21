import { ArrowLeft, ArrowUpRight } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { bySlug, type Status } from "@/data/projects"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GithubIcon } from "@/components/icons"
import { Seo } from "@/components/Seo"

const STATUS_LABEL: Record<Status, string> = {
  live: "Live",
  "in-dev": "In development",
  prototype: "Prototype",
}

export function ProjectCaseStudy() {
  const { slug } = useParams<{ slug: string }>()
  const project = slug ? bySlug(slug) : undefined

  if (!project || !project.caseStudy) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold tracking-tight mb-3">
          Case study not found
        </h1>
        <p className="text-muted-foreground mb-8">
          That project either doesn't exist or doesn't have a case study yet.
        </p>
        <Link to="/">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="size-4" />
            Back to work
          </Button>
        </Link>
      </section>
    )
  }

  const { caseStudy } = project

  return (
    <article className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <Seo
        title={project.name}
        description={project.tagline + " — " + project.description.slice(0, 140)}
        path={`/project/${project.slug}`}
        type="article"
      />
      <Link
        to="/#work"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
      >
        <ArrowLeft className="size-4" />
        Back to work
      </Link>

      <header className="flex flex-col gap-4 mb-10">
        <div className="flex items-center gap-2">
          <span
            className={
              "inline-flex h-1.5 w-1.5 rounded-full " +
              (project.status === "live"
                ? "bg-emerald-500"
                : project.status === "in-dev"
                ? "bg-amber-500"
                : "bg-muted-foreground/50")
            }
            aria-hidden
          />
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {STATUS_LABEL[project.status]}
          </span>
          {project.tags.map((tag) => (
            <Badge key={tag} variant="muted" className="text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight">
          {project.name}
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          {project.tagline}
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <a href={project.github} target="_blank" rel="noreferrer">
            <Button variant="outline" className="gap-2">
              <GithubIcon className="size-4" />
              Code
            </Button>
          </a>
          {project.live && (
            <a href={project.live} target="_blank" rel="noreferrer">
              <Button className="gap-2">
                Live
                <ArrowUpRight className="size-4" />
              </Button>
            </a>
          )}
        </div>
      </header>

      {caseStudy.metrics && caseStudy.metrics.length > 0 && (
        <section className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-5 rounded-xl border border-border bg-muted/30 mb-12">
          {caseStudy.metrics.map((m) => (
            <div key={m.label} className="flex flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {m.label}
              </span>
              <span className="text-lg font-semibold text-foreground">
                {m.value}
              </span>
            </div>
          ))}
        </section>
      )}

      <section className="flex flex-col gap-10 text-base leading-relaxed">
        <div>
          <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
            Problem
          </h2>
          <p className="text-foreground">{caseStudy.problem}</p>
        </div>
        <div>
          <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
            Decision
          </h2>
          <p className="text-foreground">{caseStudy.decision}</p>
        </div>
        <div>
          <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
            Outcome
          </h2>
          <p className="text-foreground">{caseStudy.outcome}</p>
        </div>
        <div>
          <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
            Stack
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {project.stack.map((item) => (
              <span
                key={item}
                className="text-xs font-mono text-muted-foreground bg-muted/60 px-2 py-1 rounded"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {project.note && (
        <p className="mt-12 text-sm text-muted-foreground italic border-l-2 border-border pl-4">
          {project.note}
        </p>
      )}
    </article>
  )
}
