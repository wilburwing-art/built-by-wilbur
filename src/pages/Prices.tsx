import { useEffect, useMemo, useState } from "react"
import { Seo } from "@/components/Seo"

type PriceRow = {
  model_number: string
  brand: string | null
  name: string
  category: string | null
  platform: string | null
  current_best_price: number | null
  current_best_retailer: string | null
  current_best_url: string | null
  all_time_low: number | null
  all_time_low_date: string | null
  all_time_low_retailer: string | null
  pct_above_atl: number | null
  n_observations: number
}

type PriceSnapshot = { generated_at: string; tools: PriceRow[] }

export function Prices() {
  const [snapshot, setSnapshot] = useState<PriceSnapshot | null>(null)
  const [query, setQuery] = useState("")
  useEffect(() => {
    fetch("/prices.json").then((r) => r.json()).then(setSnapshot)
  }, [])
  const rows = useMemo(() => {
    const q = query.toLowerCase().trim()
    return (snapshot?.tools ?? [])
      .filter((row) => !q || `${row.name} ${row.model_number} ${row.brand ?? ""}`.toLowerCase().includes(q))
      .sort((a, b) => (a.pct_above_atl ?? 999) - (b.pct_above_atl ?? 999))
  }, [snapshot, query])
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <Seo title="Tool prices" path="/prices" noindex />
      <div className="mx-auto max-w-6xl">
        <p className="mb-3 text-sm uppercase tracking-[0.25em] text-orange-400">Price almanac</p>
        <h1 className="mb-3 text-4xl font-semibold">Tool prices</h1>
        <p className="mb-8 max-w-2xl text-slate-400">A public snapshot of tracked market prices and all-time lows. Purchase history is excluded.</p>
        <input className="mb-6 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-orange-400" placeholder="Search model or tool" value={query} onChange={(e) => setQuery(e.target.value)} />
        {!snapshot ? <p className="text-slate-400">Loading…</p> : (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900 text-xs uppercase tracking-wider text-slate-400"><tr><th className="px-4 py-3">Tool</th><th className="px-4 py-3">Current best</th><th className="px-4 py-3">All-time low</th><th className="px-4 py-3">Above ATL</th></tr></thead>
              <tbody>{rows.map((row) => <tr className="border-t border-slate-800" key={row.model_number}><td className="px-4 py-3"><div className="font-medium">{row.name}</div><div className="text-xs text-slate-500">{row.model_number}</div></td><td className="px-4 py-3">{row.current_best_price == null ? "-" : <><a className="text-orange-300 hover:underline" href={row.current_best_url ?? "#"}>{`$${row.current_best_price.toFixed(2)}`}</a><div className="text-xs text-slate-500">{row.current_best_retailer}</div></>}</td><td className="px-4 py-3">{row.all_time_low == null ? "-" : <><span>{`$${row.all_time_low.toFixed(2)}`}</span><div className="text-xs text-slate-500">{row.all_time_low_retailer} · {row.all_time_low_date}</div></>}</td><td className="px-4 py-3">{row.pct_above_atl == null ? "-" : `${row.pct_above_atl}%`}</td></tr>)}</tbody>
            </table>
          </div>
        )}
        {snapshot && <p className="mt-4 text-xs text-slate-500">{rows.length} tools · refreshed {snapshot.generated_at}</p>}
      </div>
    </main>
  )
}
