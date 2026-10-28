import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabaseClient'
import { todayISO, formatDate } from '../../lib/booking'
import Loader from '../../components/ui/Loader'
import EmptyState from '../../components/ui/EmptyState'
import Icon from '../../components/Icon'

const FILTERS = [{ key: 'upcoming', label: 'À venir' }, { key: 'past', label: 'Passées' }, { key: 'all', label: 'Toutes' }]

export default function AdminCoaching() {
  const [rows, setRows] = useState(null)
  const [filter, setFilter] = useState('upcoming')
  const [coach, setCoach] = useState('')

  async function load() {
    const { data, error } = await supabase.from('sessions')
      .select('id,date,time,notes,coach_id,courts(name),coach:profiles!sessions_coach_id_fkey(full_name),player:profiles!sessions_player_id_fkey(full_name)')
      .order('date').order('time')
    if (error) toast.error(error.message)
    setRows(data ?? [])
  }
  useEffect(() => { load() }, [])

  const today = todayISO()
  const coaches = useMemo(() => {
    const m = new Map(); (rows ?? []).forEach(s => m.set(s.coach_id, s.coach?.full_name ?? '—'))
    return [...m.entries()].sort((a, b) => a[1].localeCompare(b[1]))
  }, [rows])

  const shown = useMemo(() => {
    let list = rows ?? []
    if (filter === 'upcoming') list = list.filter(s => s.date >= today)
    if (filter === 'past') list = [...list.filter(s => s.date < today)].reverse()
    if (coach) list = list.filter(s => s.coach_id === coach)
    return list
  }, [rows, filter, coach, today])

  async function remove(s) {
    if (!confirm(`Supprimer la session du ${formatDate(s.date)} (${s.coach?.full_name}) ?`)) return
    const { error } = await supabase.from('sessions').delete().eq('id', s.id)
    if (error) return toast.error(error.message)
    toast.success('Session supprimée'); setRows(rs => rs.filter(r => r.id !== s.id))
  }

  if (!rows) return <Loader />

  return (
    <>
      <div className="page-head"><div><h1>Coaching</h1><p>Toutes les sessions planifiées par les coachs.</p></div></div>
      <div className="toolbar">
        <div className="tabs">{FILTERS.map(f => <button key={f.key} className={filter === f.key ? 'on' : ''} onClick={() => setFilter(f.key)}>{f.label}</button>)}</div>
        <div className="field" style={{ marginBottom: 0, minWidth: 220 }}>
          <select value={coach} onChange={e => setCoach(e.target.value)}>
            <option value="">Tous les coachs</option>
            {coaches.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
        </div>
      </div>

      <div className="panel" style={{ padding: shown.length ? 0 : 24 }}>
        {shown.length === 0 ? <EmptyState icon="calendar" title="Aucune session" hint="Les coachs planifient leurs sessions depuis leur espace." /> : (
          <table>
            <thead><tr><th>Date</th><th>Heure</th><th>Coach</th><th>Joueur</th><th>Court</th><th>Notes</th><th></th></tr></thead>
            <tbody>{shown.map(s => (
              <tr key={s.id}>
                <td>{formatDate(s.date)}</td><td>{s.time?.slice(0, 5)}</td>
                <td className="cell-strong">{s.coach?.full_name ?? '—'}</td>
                <td>{s.player?.full_name ?? '—'}</td>
                <td>{s.courts?.name ?? '—'}</td>
                <td className="sub-muted" style={{ maxWidth: 260, whiteSpace: 'normal' }}>{s.notes}</td>
                <td><button className="icon-btn no" onClick={() => remove(s)} title="Supprimer"><Icon name="trash" /></button></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </>
  )
}
