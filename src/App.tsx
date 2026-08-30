import { Suspense, lazy, useEffect } from "react"
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Home } from "@/pages/Home"
import { ProjectCaseStudy } from "@/pages/ProjectCaseStudy"
import { Writing } from "@/pages/Writing"
import { Post } from "@/pages/Post"
import { useDarkMode } from "@/hooks/useDarkMode"
import { PageFade } from "@/components/motion"
import { ScrollProgress } from "@/components/Reactive"

// Split out: the recipe data is ~25 kB gzipped and the portfolio should not
// ship it to everyone who lands on the home page.
const Kitchen = lazy(() =>
  import("@/pages/Kitchen").then((m) => ({ default: m.Kitchen })),
)

/** Unlisted, and deliberately without the portfolio's own chrome. */
const isKitchen = (pathname: string) =>
  pathname === "/kitchen" || pathname.startsWith("/kitchen/")

function ScrollManager() {
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1))
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" })
        return
      }
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior })
  }, [location.pathname, location.hash])

  return null
}

function AnimatedRoutes() {
  const location = useLocation()
  const key = isKitchen(location.pathname) ? "/kitchen" : location.pathname
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={key}>
        <Route
          path="/"
          element={
            <PageFade>
              <Home />
            </PageFade>
          }
        />
        <Route
          path="/project/:slug"
          element={
            <PageFade>
              <ProjectCaseStudy />
            </PageFade>
          }
        />
        <Route
          path="/writing"
          element={
            <PageFade>
              <Writing />
            </PageFade>
          }
        />
        <Route
          path="/writing/:slug"
          element={
            <PageFade>
              <Post />
            </PageFade>
          }
        />
        <Route
          path="/kitchen"
          element={
            <Suspense fallback={null}>
              <Kitchen />
            </Suspense>
          }
        />
        <Route
          path="/kitchen/:slug"
          element={
            <Suspense fallback={null}>
              <Kitchen />
            </Suspense>
          }
        />
      </Routes>
    </AnimatePresence>
  )
}

function Shell() {
  const [dark, setDark] = useDarkMode()
  const bare = isKitchen(useLocation().pathname)

  // useDarkMode stays mounted either way: it is the only thing that manages the
  // .dark class on <html>, and the kitchen sets its own colours regardless.
  if (bare) {
    return (
      <div className="min-h-screen">
        <ScrollManager />
        <AnimatedRoutes />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <ScrollProgress />
      <Header dark={dark} toggleDark={() => setDark(!dark)} />
      <main className="flex-1">
        <ScrollManager />
        <AnimatedRoutes />
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  )
}

export default App
