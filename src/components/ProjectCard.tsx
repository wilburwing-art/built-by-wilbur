import { ArrowRight, ArrowUpRight } from "lucide-react"
import { Link } from "react-router-dom"
import type { Project, Status } from "@/data/projects"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GithubIcon } from "@/components/icons"

const STATUS_LABEL: Record<Status, string> = {
  live: "Live",
  "in-dev": "In development",
  prototype: "Prototype",
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 gap-5">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
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
            </div>
            <CardTitle className="text-xl">{project.name}</CardTitle>
            <CardDescription className="mt-1">{project.tagline}</CardDescription>
          </div>
          <div className="flex gap-1 shrink-0">
            {project.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="muted" className="text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {project.description}
        </p>

        {project.note && (
          <p className="text-xs text-muted-foreground/80 italic">{project.note}</p>
        )}

        <div className="flex flex-wrap gap-1.5">
          {project.stack.map((item) => (
            <span
              key={item}
              className="text-[11px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-4 pt-1">
          {project.caseStudy && (
            <Link
              to={`/project/${project.slug}`}
              className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
            >
              Case study
              <ArrowRight className="size-4" />
            </Link>
          )}
          <a
            href={project.github}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <GithubIcon className="size-4" />
            Code
          </a>
          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Live
              <ArrowUpRight className="size-4" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
