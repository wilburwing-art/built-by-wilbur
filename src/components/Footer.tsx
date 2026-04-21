export function Footer() {
  return (
    <footer className="border-t border-border/60 mt-8">
      <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <p className="font-mono">built by wilbur · {new Date().getFullYear()}</p>
        <div className="flex items-center gap-4 font-mono">
          <a
            href="https://www.upwork.com/freelancers/~01459c60bf3db4069f"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground transition-colors"
          >
            upwork
          </a>
          <a
            href="https://github.com/wilburwing-art/built-by-wilbur"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground transition-colors"
          >
            source
          </a>
        </div>
      </div>
    </footer>
  )
}
