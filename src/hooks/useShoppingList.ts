import { useCallback, useEffect, useState } from "react"
import { AISLES, aisleFor } from "@/lib/shopping-list"
import type { Aisle, ListItem } from "@/lib/shopping-list"

const LIST_KEY = "bbw-kitchen-list"

const isAisle = (value: unknown): value is Aisle =>
  typeof value === "string" && (AISLES as readonly string[]).includes(value)

/**
 * Anything stored by an older version of the page, or edited by hand, is read
 * defensively: a row that cannot be repaired is dropped rather than rendered
 * as a blank line.
 */
function parse(raw: string | null): ListItem[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const items: ListItem[] = []
    for (const row of parsed) {
      if (typeof row !== "object" || row === null) continue
      const r = row as Record<string, unknown>
      if (typeof r.key !== "string" || typeof r.text !== "string" || !r.text.trim()) continue
      items.push({
        key: r.key,
        text: r.text,
        aisle: isAisle(r.aisle) ? r.aisle : aisleFor(r.text),
        source: typeof r.source === "string" ? r.source : null,
        slug: typeof r.slug === "string" ? r.slug : null,
        checked: r.checked === true,
      })
    }
    return items
  } catch {
    return []
  }
}

function read(): ListItem[] {
  try {
    return parse(window.localStorage.getItem(LIST_KEY))
  } catch {
    return []
  }
}

export function useShoppingList() {
  const [items, setItems] = useState<ListItem[]>(read)

  useEffect(() => {
    try {
      window.localStorage.setItem(LIST_KEY, JSON.stringify(items))
    } catch {
      // Private window or blocked site data; the list still works for this visit.
    }
  }, [items])

  // A list open in two tabs is the normal case on a phone left on the counter,
  // so the other tab's writes are picked up rather than silently overwritten.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== LIST_KEY) return
      setItems(parse(e.newValue))
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  /** Adding a line already on the list replaces it, keeping its position. */
  const add = useCallback((incoming: ListItem[]) => {
    setItems((prev) => {
      const next = [...prev]
      for (const item of incoming) {
        const at = next.findIndex((i) => i.key === item.key)
        if (at === -1) next.push(item)
        else next[at] = { ...item, checked: next[at].checked }
      }
      return next
    })
  }, [])

  const remove = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key))
  }, [])

  const toggle = useCallback((key: string) => {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, checked: !i.checked } : i)))
  }, [])

  const clearChecked = useCallback(() => {
    setItems((prev) => prev.filter((i) => !i.checked))
  }, [])

  const clearAll = useCallback(() => setItems([]), [])

  return { items, add, remove, toggle, clearChecked, clearAll }
}
