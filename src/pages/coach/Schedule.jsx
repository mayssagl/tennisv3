import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import Loader from '../../components/ui/Loader'
import EmptyState from '../../components/ui/EmptyState'
import Icon from '../../components/Icon'

export default function CoachSchedule() {
  const { user } = useAuth()
  const [rows, setRows] = useState(null)
  const [courts, setCourts] = useState([])
  const [players, setPlayers] = useState([])
  const [form, setForm] = useState({ player_id: '', court_id: '', date: '', time: '09:00', notes: '' })

  async function load() {
    const [{ data: sess }, { data: cts }, { data: pls }] = await Promise.all([
      supabase.from('sessions')
        .select('id,date,time,notes,courts(name),player:profiles!sessions_player_id_fkey(full_name)')
        .eq('coach_id', user.id).order('date'),
      supabase.from('courts').select('id,name'),
      supabase.from('profiles').select('id,full_name').eq('role', 'player'),
    ])
    setRows(sess ?? []); setCourts(cts ?? []); setPlayers(pls ?? [])
  }
  useEffect(() => { load() }, [])

  async function add() {
    if (!form.player_id || !form.date) return toast.error('Joueur et date requis')
    const { error } = await supabase.from('sessions').insert({ ...form, coach_id: user.id })
    if (error) return toast.error(error.message)
    toast.success('Session planifiée'); setForm({ ...form, player_id: '', notes: '' }); load()
  }

  if (!rows) return <Loader />

  return (
    <>
      <div className="page-head"><div><h1>Mon planning</h1><p>Planifiez et suivez vos sessions.</p></div></div>

      <div className="panel">
        <h3>Nouvelle session</h3>
        <div className="form-grid">
          <div className="field"><label>Joueur</label>
            <select value={form.player_id} onChange={e => setForm({ ...form, player_id: e.target.value })}>
              <option value="">— choisir —</option>
              {players.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
            </select></div>
          <div className="field"><label>Court</label>
            <select value={form.court_id} onChange={e => setForm({ ...form, court_id: e.target.value })}>
              <option value="">— choisir —</option>
              {courts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select></div>
          <div className="field"><label>Date</label>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
          <div className="field"><label>Heure</label>
            <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} /></div>
        </div>
        <div className="field" style={{ marginTop: 16 }}><label>Notes</label>
          <textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
        <button className="btn btn-lime btn-sm" style={{ marginTop: 16 }} onClick={add}><Icon name="plus" /> Planifier</button>
      </div>

      <div className="panel" style={{ padding: rows.length ? 0 : 24 }}>
        {rows.length === 0
          ? <EmptyState icon="calendar" title="Aucune session" hint="Planifiez votre première session ci-dessus." />
          : (
          <table>
            <thead><tr><th>Date</th><th>Heure</th><th>Joueur</th><th>Court</th><th>Notes</th></tr></thead>
            <tbody>{rows.map(s => (
              <tr key={s.id}><td>{s.date}</td><td>{s.time?.slice(0,5)}</td>
                <td style={{ fontWeight: 600 }}>{s.player?.full_name ?? '—'}</td>
                <td>{s.courts?.name ?? '—'}</td><td style={{ color: 'var(--muted)' }}>{s.notes}</td></tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </>
  )
}
