import { ArrowRight, Mail } from "lucide-react"
import { byAudience, type Audience } from "@/data/projects"
import { ProjectCard } from "@/components/ProjectCard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GithubIcon, LinkedinIcon } from "@/components/icons"
import { useAudience } from "@/hooks/useAudience"
import { cn } from "@/lib/utils"
import { FadeUp, StaggerGrid, StaggerItem } from "@/components/motion"
import { Seo } from "@/components/Seo"
import { TechIcon, techKey } from "@/components/TechIcon"
import {
  AuroraBackdrop,
  CursorSpotlight,
  GradientText,
  Magnetic,
} from "@/components/Reactive"

function Hero({ audience }: { audience: Audience }) {
  const aiCopy = {
    headingLead: "Hi, I'm Wilbur.",
    headingAccent: "I build AI-native products with Claude, PydanticAI, and RAG.",
    sub:
      "AI engineer focused on agent orchestration, retrieval pipelines, and cost-aware production deployments. I ship small, test often, and instrument everything.",
  }
  const clientCopy = {
    headingLead: "Hi, I'm Wilbur.",
    headingAccent: "I design and ship beautiful, fast websites, end to end.",
    sub:
      "Full-stack web builder working in React, TypeScript, Tailwind, and Vercel. I take small and medium businesses from no-site to launched in a week, with craft on every screen.",
  }
  const copy = audience === "ai" ? aiCopy : clientCopy

  return (
    <section
      id="top"
      className="relative isolate mx-auto max-w-6xl px-6 pt-20 pb-16 sm:pt-28 sm:pb-20 overflow-hidden"
    >
      <AuroraBackdrop />
      <CursorSpotlight />
      <div className="flex flex-col gap-6 max-w-3xl">
        <FadeUp>
          <Badge
            variant="outline"
            className="w-fit px-3 py-1 font-mono text-xs group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
              </span>
              Available for hire
            </span>
          </Badge>
        </FadeUp>
        <FadeUp delay={0.05}>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05]">
            {copy.headingLead}
            <br />
            <GradientText>{copy.headingAccent}</GradientText>
          </h1>
        </FadeUp>
        <FadeUp delay={0.12}>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            {copy.sub}
          </p>
        </FadeUp>
        <FadeUp delay={0.18}>
          <div className="flex flex-wrap gap-3 pt-2">
            <Magnetic>
              <a href="#work">
                <Button size="lg" className="gap-2">
                  See the work
                  <ArrowRight className="size-4" />
                </Button>
              </a>
            </Magnetic>
            <Magnetic>
              <a href="mailto:WilburWing@gmail.com">
                <Button size="lg" variant="outline" className="gap-2">
                  <Mail className="size-4" />
                  Get in touch
                </Button>
              </a>
            </Magnetic>
          </div>
        </FadeUp>
      </div>
    </section>
  )
}

function AudienceToggle({
  audience,
  setAudience,
}: {
  audience: Audience
  setAudience: (a: Audience) => void
}) {
  const options: { value: Audience; label: string; sub: string }[] = [
    { value: "ai", label: "AI Engineering", sub: "Agents, RAG, orchestration" },
    { value: "client", label: "Client Work", sub: "Sites, products, tools" },
  ]
  return (
    <div
      role="tablist"
      aria-label="Work view"
      className="inline-flex items-center gap-1 p-1 rounded-lg border border-border bg-muted/40"
    >
      {options.map((opt) => {
        const active = audience === opt.value
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => setAudience(opt.value)}
            className={cn(
              "px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="block">{opt.label}</span>
            <span className="hidden sm:block text-[11px] font-normal text-muted-foreground">
              {opt.sub}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function Work({
  audience,
  setAudience,
}: {
  audience: Audience
  setAudience: (a: Audience) => void
}) {
  const items = byAudience(audience)
  return (
    <section id="work" className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Selected work
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            {audience === "ai"
              ? "AI systems I've built."
              : "Sites and products I've shipped."}
          </h2>
        </div>
        <AudienceToggle audience={audience} setAudience={setAudience} />
      </div>

      <StaggerGrid
        key={audience}
        className="grid gap-6 sm:grid-cols-2"
      >
        {items.map((p) => (
          <StaggerItem key={p.slug}>
            <ProjectCard project={p} />
          </StaggerItem>
        ))}
      </StaggerGrid>
    </section>
  )
}

function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-6 py-16 sm:py-20 border-t border-border/60">
      <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
            About
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            A builder who ships.
          </h2>
        </div>
        <div className="flex flex-col gap-5 text-base leading-relaxed text-muted-foreground max-w-2xl">
          <p>
            I build tools for the domains I actually live in: ceramics,
            backcountry travel, fitness, and real-estate development. Most of
            what you see above is running for real users, not tutorials.
          </p>
          <p>
            On the AI side, I work with the Anthropic SDK, PydanticAI, RAG
            pipelines, and multi-agent orchestration. I think hard about cost,
            latency, and where an LLM is the right hammer, and where it isn't.
          </p>
          <p>
            On the web side, I ship in React, TypeScript, Tailwind, Next.js,
            Vite, Supabase, and Vercel. I care about typography, load time, and
            the craft that separates "indistinguishable from a template" from
            "this feels good to use."
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {[
              "TypeScript",
              "React",
              "Next.js",
              "Vite",
              "Tailwind",
              "Python",
              "FastAPI",
              "Anthropic SDK",
              "PydanticAI",
              "RAG",
              "Supabase",
              "Postgres",
              "Vercel",
            ].map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="group font-mono text-xs gap-1.5 transition-all hover:scale-105 hover:shadow-sm"
              >
                {techKey(skill) && (
                  <TechIcon
                    name={skill}
                    className="size-3.5 transition-transform group-hover:scale-110"
                  />
                )}
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section
      id="contact"
      className="mx-auto max-w-6xl px-6 py-20 sm:py-28 border-t border-border/60"
    >
      <div className="flex flex-col items-start gap-6 max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Contact
        </p>
        <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight">
          Got a project?
          <br />
          <span className="text-muted-foreground">Let's talk.</span>
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed">
          I take on a small number of client projects each month, plus full-time
          AI Engineer roles. Email is fastest.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <a href="mailto:WilburWing@gmail.com">
            <Button size="lg" className="gap-2">
              <Mail className="size-4" />
              WilburWing@gmail.com
            </Button>
          </a>
          <a href="https://github.com/wilburwing-art" target="_blank" rel="noreferrer">
            <Button size="lg" variant="outline" className="gap-2">
              <GithubIcon className="size-4" />
              @wilburwing-art
            </Button>
          </a>
          <a href="https://www.linkedin.com/in/wilbur-pyn/" target="_blank" rel="noreferrer">
            <Button size="lg" variant="outline" className="gap-2">
              <LinkedinIcon className="size-4" />
              LinkedIn
            </Button>
          </a>
        </div>
      </div>
    </section>
  )
}

export function Home() {
  const [audience, setAudience] = useAudience()

  return (
    <>
      <Seo
        title={audience === "ai" ? "AI Engineering" : "Client Work"}
        description={
          audience === "ai"
            ? "Wilbur Pyn. AI engineer. Agents, RAG, orchestration, Claude and the Anthropic stack."
            : "Wilbur Pyn. Full-stack web builder. Fast, beautiful sites and products for small and medium businesses."
        }
      />
      <Hero audience={audience} />
      <Work audience={audience} setAudience={setAudience} />
      <About />
      <Contact />
    </>
  )
}
