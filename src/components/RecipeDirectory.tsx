import type { CSSProperties } from "react"
import { CATEGORY_COLORS } from "@/data/recipes"
import type { Recipe } from "@/data/recipes"
import {
  DIFFICULTIES,
  EMPTY_FILTERS,
  SORTS,
  TIME_FILTERS,
  isFiltered,
} from "@/lib/recipe-search"
import type { Filters, SortKey } from "@/lib/recipe-search"

interface RecipeDirectoryProps {
  results: Recipe[]
  total: number
  filters: Filters
  setFilters: (f: Filters) => void
  sort: SortKey
  setSort: (s: SortKey) => void
  onOpen: (recipe: Recipe) => void
}

export function RecipeDirectory({
  results,
  total,
  filters,
  setFilters,
  sort,
  setSort,
  onOpen,
}: RecipeDirectoryProps) {
  const clearAll = () => {
    setFilters({ ...EMPTY_FILTERS })
    setSort("relevance")
  }

  return (
    <div className="dir">
      <div className="dir-search">
        <span className="dir-search-icon" aria-hidden="true">
          ⌕
        </span>
        <input
          type="search"
          className="dir-search-input"
          placeholder={`Search ${total} recipes by name or ingredient`}
          value={filters.query}
          onChange={(e) => setFilters({ ...filters, query: e.target.value })}
          autoComplete="off"
          spellCheck={false}
        />
        {filters.query && (
          <button
            className="dir-search-clear"
            onClick={() => setFilters({ ...filters, query: "" })}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      <div className="dir-controls">
        <label className="dir-select">
          <span>Time</span>
          <select
            value={filters.time}
            onChange={(e) => setFilters({ ...filters, time: e.target.value as Filters["time"] })}
          >
            {TIME_FILTERS.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="dir-select">
          <span>Effort</span>
          <select
            value={filters.difficulty}
            onChange={(e) =>
              setFilters({ ...filters, difficulty: e.target.value as Filters["difficulty"] })
            }
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d === "Any" ? "Any effort" : d}
              </option>
            ))}
          </select>
        </label>
        <label className="dir-select">
          <span>Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="dir-count">
        {results.length === total
          ? `All ${total} recipes`
          : `${results.length} of ${total} recipes`}
        {isFiltered(filters) && (
          <button className="dir-clear" onClick={clearAll}>
            Clear
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <div className="dir-empty">
          <p>Nothing matches that.</p>
          <button className="dir-clear-big" onClick={clearAll}>
            Clear search and filters
          </button>
        </div>
      ) : (
        <ul className="dir-list">
          {results.map((r) => (
            <li key={r.slug}>
              <button
                className="dir-row"
                onClick={() => onOpen(r)}
                style={{ "--accent": CATEGORY_COLORS[r.category] } as CSSProperties}
              >
                <span className="dir-emoji">{r.emoji}</span>
                <span className="dir-body">
                  <span className="dir-name">{r.name}</span>
                  <span className="dir-desc">{r.desc}</span>
                </span>
                <span className="dir-meta">
                  <span className="dir-cat">{r.category}</span>
                  <span className="dir-time">
                    {r.time} · {r.ingredients.length} ing
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
