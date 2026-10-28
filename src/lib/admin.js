// Helpers shared by the admin pages.

// True when Supabase says a table/column doesn't exist yet (migration not run).
export function needsMigration(error) {
  if (!error) return false
  const m = `${error.code ?? ''} ${error.message ?? ''}`
  return /42P01|42703|PGRST204|PGRST205|does not exist|schema cache|Could not find/i.test(m)
}

// Re-number rows after moving one up/down; returns only the rows whose order changed.
export function reorder(rows, index, dir) {
  const target = index + dir
  if (target < 0 || target >= rows.length) return { rows, changed: [] }
  const next = [...rows]
  ;[next[index], next[target]] = [next[target], next[index]]
  const changed = []
  next.forEach((r, i) => { if (r.sort_order !== i) changed.push({ id: r.id, sort_order: i }) })
  return { rows: next.map((r, i) => ({ ...r, sort_order: i })), changed }
}

export const initials = name => (name || '?').split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase()

export const fmtDateTime = iso => iso
  ? new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  : '—'
