import type { ImgHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type IconDef = {
  slug: string
  title: string
  color?: string
  mono?: boolean
}

const ICONS: Record<string, IconDef> = {
  typescript: { slug: "typescript", title: "TypeScript", color: "3178C6" },
  react: { slug: "react", title: "React", color: "61DAFB" },
  nextjs: { slug: "nextdotjs", title: "Next.js", mono: true },
  vite: { slug: "vite", title: "Vite", color: "646CFF" },
  tailwindcss: { slug: "tailwindcss", title: "Tailwind CSS", color: "06B6D4" },
  python: { slug: "python", title: "Python", color: "3776AB" },
  fastapi: { slug: "fastapi", title: "FastAPI", color: "009688" },
  anthropic: { slug: "anthropic", title: "Anthropic", mono: true },
  supabase: { slug: "supabase", title: "Supabase", color: "3FCF8E" },
  postgresql: { slug: "postgresql", title: "PostgreSQL", color: "4169E1" },
  vercel: { slug: "vercel", title: "Vercel", mono: true },
  htmx: { slug: "htmx", title: "HTMX", color: "3366CC" },
  pydantic: { slug: "pydantic", title: "Pydantic", color: "E92063" },
  github: { slug: "github", title: "GitHub", mono: true },
  githubactions: { slug: "githubactions", title: "GitHub Actions", color: "2088FF" },
  cloudflare: { slug: "cloudflare", title: "Cloudflare", color: "F38020" },
  cloudflarepages: { slug: "cloudflarepages", title: "Cloudflare Pages", color: "F38020" },
  cloudflareworkers: { slug: "cloudflareworkers", title: "Cloudflare Workers", color: "F38020" },
  leaflet: { slug: "leaflet", title: "Leaflet", color: "199900" },
  openstreetmap: { slug: "openstreetmap", title: "OpenStreetMap", color: "7EBC6F" },
  resend: { slug: "resend", title: "Resend", mono: true },
  html5: { slug: "html5", title: "HTML", color: "E34F26" },
  css: { slug: "css", title: "CSS", color: "663399" },
  javascript: { slug: "javascript", title: "JavaScript", color: "F7DF1E" },
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "")
}

const ALIASES: Record<string, string> = {
  claude45: "anthropic",
  claude4: "anthropic",
  claudeapi: "anthropic",
  claudesonnet45: "anthropic",
  anthropicsdk: "anthropic",
  anthropicapi: "anthropic",
  anthropic: "anthropic",
  next: "nextjs",
  nextjs: "nextjs",
  nextjs16: "nextjs",
  react: "react",
  react19: "react",
  tailwind: "tailwindcss",
  tailwind4: "tailwindcss",
  tailwindcss: "tailwindcss",
  python: "python",
  python312: "python",
  postgres: "postgresql",
  postgresql: "postgresql",
  fastapi: "fastapi",
  vercel: "vercel",
  vite: "vite",
  supabase: "supabase",
  typescript: "typescript",
  htmx: "htmx",
  pydanticai: "pydantic",
  pydantic: "pydantic",
  github: "github",
  githubactions: "githubactions",
  cloudflare: "cloudflare",
  cloudflarepages: "cloudflarepages",
  cloudflareworkers: "cloudflareworkers",
  leaflet: "leaflet",
  openstreetmap: "openstreetmap",
  resend: "resend",
  htmlcssjs: "html5",
  html: "html5",
  html5: "html5",
  css: "css",
  css3: "css",
  javascript: "javascript",
  js: "javascript",
}

export function techKey(name: string): string | null {
  const slug = slugify(name)
  const resolved = ALIASES[slug]
  return resolved && ICONS[resolved] ? resolved : null
}

export function TechIcon({
  name,
  className,
  ...props
}: { name: string } & Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt">) {
  const key = techKey(name)
  if (!key) return null
  const def = ICONS[key]
  const url = def.color
    ? `https://cdn.simpleicons.org/${def.slug}/${def.color}`
    : `https://cdn.simpleicons.org/${def.slug}`
  return (
    <img
      src={url}
      alt={def.title}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={cn(
        "inline-block select-none",
        def.mono && "dark:invert",
        className,
      )}
      {...props}
    />
  )
}
