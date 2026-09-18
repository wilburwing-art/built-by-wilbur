import { useCallback, useMemo, useState } from "react"
import { groupByAisle, listToText, typedItem } from "@/lib/shopping-list"
import type { ListItem } from "@/lib/shopping-list"

interface ShoppingListProps {
  items: ListItem[]
  onAdd: (items: ListItem[]) => void
  onToggle: (key: string) => void
  onRemove: (key: string) => void
  onClearChecked: () => void
  onClearAll: () => void
  onOpenRecipe: (slug: string) => void
  onBrowse: () => void
}

export function ShoppingList({
  items,
  onAdd,
  onToggle,
  onRemove,
  onClearChecked,
  onClearAll,
  onOpenRecipe,
  onBrowse,
}: ShoppingListProps) {
  const [draft, setDraft] = useState("")
  const [copied, setCopied] = useState(false)
  // Clearing the whole list is the one action here that cannot be undone, so
  // the button asks a second time instead of opening a dialog.
  const [confirmingClear, setConfirmingClear] = useState(false)

  const groups = useMemo(() => groupByAisle(items), [items])
  const checked = items.filter((i) => i.checked).length

  const submit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const item = typedItem(draft)
      if (!item) return
      onAdd([item])
      setDraft("")
    },
    [draft, onAdd],
  )

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(listToText(items))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }, [items])

  return (
    <div className="list">
      <form className="list-add" onSubmit={submit}>
        <input
          type="text"
          className="list-add-input"
          placeholder="Add something else (paper towels, ice…)"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          autoComplete="off"
        />
        <button type="submit" className="list-add-btn" disabled={!draft.trim()}>
          Add
        </button>
      </form>

      {items.length === 0 ? (
        <div className="dir-empty">
          <p>Your list is empty.</p>
          <button className="dir-clear-big" onClick={onBrowse}>
            Find a recipe to shop for
          </button>
        </div>
      ) : (
        <>
          <div className="dir-count">
            {items.length - checked} to buy
            {checked > 0 && ` · ${checked} in the cart`}
          </div>

          {groups.map((group) => (
            <section key={group.aisle} className="list-group">
              <h3 className="list-aisle">{group.aisle}</h3>
              <ul className="list-items">
                {group.items.map((item) => {
                  const { slug, source } = item
                  return (
                  <li key={item.key} className={`list-item ${item.checked ? "done" : ""}`}>
                    <label className="list-check">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => onToggle(item.key)}
                      />
                      <span className="list-text">{item.text}</span>
                    </label>
                    {slug && source && (
                      <button
                        className="list-source"
                        onClick={() => onOpenRecipe(slug)}
                        title={`Open ${source}`}
                      >
                        {source}
                      </button>
                    )}
                    <button
                      className="list-remove"
                      onClick={() => onRemove(item.key)}
                      aria-label={`Remove ${item.text}`}
                    >
                      ✕
                    </button>
                  </li>
                  )
                })}
              </ul>
            </section>
          ))}

          <div className="list-actions">
            <button className="action-btn" onClick={() => void copy()}>
              {copied ? "Copied" : "Copy list"}
            </button>
            {checked > 0 && (
              <button className="action-btn" onClick={onClearChecked}>
                Clear {checked} checked
              </button>
            )}
            <button
              className="action-btn"
              onClick={() => {
                if (confirmingClear) {
                  onClearAll()
                  setConfirmingClear(false)
                } else {
                  setConfirmingClear(true)
                }
              }}
              onBlur={() => setConfirmingClear(false)}
            >
              {confirmingClear ? "Tap again to empty" : "Empty list"}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
