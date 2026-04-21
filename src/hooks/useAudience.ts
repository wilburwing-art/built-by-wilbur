import { useState } from "react"
import type { Audience } from "@/data/projects"

export function useAudience(): [Audience, (a: Audience) => void] {
  const readFromUrl = (): Audience => {
    if (typeof window === "undefined") return "ai"
    const v = new URLSearchParams(window.location.search).get("view")
    return v === "client" ? "client" : "ai"
  }
  const [audience, setAudienceState] = useState<Audience>(readFromUrl)

  const setAudience = (a: Audience) => {
    setAudienceState(a)
    const url = new URL(window.location.href)
    url.searchParams.set("view", a)
    window.history.replaceState({}, "", url.toString())
  }

  return [audience, setAudience]
}
