import { useState, type MouseEvent } from "react"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import { Link } from "react-router-dom"
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion"
import type { Project, Status } from "@/data/projects"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GithubIcon } from "@/components/icons"
import { ProjectPreview } from "@/components/ProjectPreview"
import { TechIcon, techKey } from "@/components/TechIcon"

const STATUS_LABEL: Record<Status, string> = {
  live: "Live",
  "in-dev": "In development",
  prototype: "Prototype",
}

const SPRING = { stiffness: 180, damping: 18, mass: 0.6 }

export function ProjectCard({ project }: { project: Project }) {
  const reduced = useReducedMotion()
  const [hovered, setHovered] = useState(false)

  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const smx = useSpring(mx, SPRING)
  const smy = useSpring(my, SPRING)

  const rotateX = useTransform(smy, [0, 1], [6, -6])
  const rotateY = useTransform(smx, [0, 1], [-8, 8])

  const shineX = useTransform(mx, (v) => `${v * 100}%`)
  const shineY = useTransform(my, (v) => `${v * 100}%`)
  const shine = useMotionTemplate`radial-gradient(circle at ${shineX} ${shineY}, rgba(255,255,255,0.12), transparent 40%)`

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (reduced) return
    const rect = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - rect.left) / rect.width)
    my.set((e.clientY - rect.top) / rect.height)
  }

  function handleMouseLeave() {
    setHovered(false)
    mx.set(0.5)
    my.set(0.5)
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={
        reduced
          ? undefined
          : { rotateX, rotateY, transformPerspective: 1200, transformStyle: "preserve-3d" }
      }
      className="relative"
    >
      <Card className="group relative overflow-hidden border-border/60 bg-card/80 backdrop-blur transition-shadow duration-300 hover:shadow-2xl">
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: shine }}
        />

        <div className="px-6 pt-6">
          <ProjectPreview kind={project.preview} accent={project.accent} hovered={hovered} />
        </div>

        <CardContent className="flex flex-col gap-4 pt-5">
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
              <h3 className="text-xl font-semibold tracking-tight">{project.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{project.tagline}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              {project.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="muted" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>

          {project.note && (
            <p className="text-xs text-muted-foreground/80 italic">{project.note}</p>
          )}

          <div className="flex flex-wrap gap-1.5">
            {project.stack.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded"
              >
                {techKey(item) && <TechIcon name={item} className="size-3" />}
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
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <GithubIcon className="size-4" />
                Code
              </a>
            )}
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
    </motion.div>
  )
}
