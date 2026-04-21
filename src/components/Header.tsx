import { Moon, Sun } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function Header({
  dark,
  toggleDark,
}: {
  dark: boolean
  toggleDark: () => void
}) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        <Link to="/" className="font-mono text-sm tracking-tight font-semibold">
          built by wilbur
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            to="/#work"
            className="hidden sm:inline-block text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 transition-colors"
          >
            Work
          </Link>
          <Link
            to="/writing"
            className="hidden sm:inline-block text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 transition-colors"
          >
            Writing
          </Link>
          <Link
            to="/#about"
            className="hidden sm:inline-block text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 transition-colors"
          >
            About
          </Link>
          <Link
            to="/#contact"
            className="hidden sm:inline-block text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 transition-colors"
          >
            Contact
          </Link>
          <Button variant="ghost" size="icon" onClick={toggleDark} aria-label="Toggle theme">
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
        </nav>
      </div>
    </header>
  )
}
