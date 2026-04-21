import { useEffect } from "react"
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
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
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
      </Routes>
    </AnimatePresence>
  )
}

function Shell() {
  const [dark, setDark] = useDarkMode()
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
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
