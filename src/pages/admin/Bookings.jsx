import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabaseClient'
import { SLOTS, endTime, todayISO, formatDate, bookingError } from '../../lib/booking'
import Loader from '../../components/ui/Loader'
import EmptyState from '../../components/ui/EmptyState'
import StatusBadge from '../../components/ui/StatusBadge'
import Icon from '../../components/Icon'

const FILTERS = [
  { key: 'pending', label: 'En attente' },
  { key: 'today', label: "Aujourd'hui" },
  { key: 'upcoming', label: 'À venir' },
  { key: 'all', label: 'Toutes' },
]

export default function AdminBookings() {
  const [rows, setRows] = useState(null)
  const [filter, setFilter] = useState('pending')
  const [q, setQ] = useState('')
  const [showNew, setShowNew] = useState(false)

  async function load() {
    const { data, error } = await supabase
      .from('bookings')
      .select('id,date,start_time,end_time,status,created_at,player_id,court_id,courts(name),profiles(full_name,email,phone)')
      .order('date', { ascending: false }).order('start_time')
    if (error) toast.error(error.message)
    setRows(data ?? [])
  }
  useEffect(() => { load() }, [])

  const today = todayISO()
  const counts = useMemo(() => ({
    pending: (rows ?? []).filter(r => r.status === 'pending').length,
    today: (rows ?? []).filter(r => r.date === today && r.status !== 'cancelled' && r.status !== 'rejected').length,
  }), [rows, today])

  const shown = useMemo(() => {
    let list = rows ?? []
    if (filter === 'pending') list = list.filter(r => r.status === 'pending')
    if (filter === 'today') list = list.filter(r => r.date === today)
    if (filter === 'upcoming') list = list.filter(r => r.date >= today && ['pending', 'approved'].includes(r.status))
    if (filter !== 'all') list = [...list].sort((a, b) => (a.date + a.start_time).localeCompare(b.date + b.start_time))
    const s = q.trim().toLowerCase()
    if (s) list = list.filter(r => `${r.profiles?.full_name} ${r.profiles?.email} ${r.courts?.name}`.toLowerCase().includes(s))
    return list
  }, [rows, filter, q, today])

  async function setStatus(r, status) {
    if (status === 'cancelled' && !confirm(`Annuler la réservation de ${r.profiles?.full_name ?? 'ce membre'} ? Le créneau sera libéré.`)) return
    const { error } = await supabase.from('bookings').update({ status }).eq('id', r.id)
    if (error) return toast.error(bookingError(error, { forAdmin: true }))
    toast.success({ approved: 'Réservation approuvée', rejected: 'Réservation rejetée', cancelled: 'Réservation annulée' }[status])
    setRows(rs => rs.map(x => x.id === r.id ? { ...x, status } : x))
  }

  if (!rows) return <Loader />

  return (
    <>
      <div className="page-head">
        <div><h1>Réservations</h1><p>Validez les demandes, annulez un créneau ou réservez pour un membre.</p></div>
        <button className="btn btn-lime btn-sm" onClick={() => setShowNew(s => !s)}>
          <Icon name={showNew ? 'x' : 'plus'} />{showNew ? 'Fermer' : 'Réserver pour un membre'}
        </button>
      </div>

      {showNew && <NewBooking onDone={() => { setShowNew(false); setFilter('upcoming'); load() }} />}

      <div className="toolbar">
        <div className="tabs">
          {FILTERS.map(f => (
            <button key={f.key} className={filter === f.key ? 'on' : ''} onClick={() => setFilter(f.key)}>
              {f.label}{counts[f.key] > 0 && <span className="tab-count">{counts[f.key]}</span>}
            </button>
          ))}
        </div>
        <label className="search"><Icon name="search" />
          <input placeholder="Rechercher un membre ou un court" value={q} onChange={e => setQ(e.target.value)} /></label>
      </div>

      <div className="panel" style={{ padding: shown.length ? 0 : 24 }}>
        {shown.length === 0
          ? <EmptyState icon="calendar" title={filter === 'pending' ? 'Aucune demande en attente' : 'Aucune réservation'} hint="Les réservations apparaîtront ici." />
          : (
          <table>
            <thead><tr><th>Membre</th><th>Court</th><th>Date</th><th>Créneau</th><th>Statut</th><th></th></tr></thead>
            <tbody>
              {shown.map(r => (
                <tr key={r.id}>
                  <td>
                    <div className="cell-strong">{r.profiles?.full_name ?? '—'}</div>
                    <div className="sub-muted">{r.profiles?.phone || r.profiles?.email}</div>
                  </td>
                  <td>{r.courts?.name ?? '—'}</td>
                  <td>{formatDate(r.date)}</td>
                  <td>{r.start_time?.slice(0, 5)}–{r.end_time?.slice(0, 5)}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>
                    <div className="row-actions">
                      {r.status === 'pending' && <>
                        <button className="icon-btn ok" onClick={() => setStatus(r, 'approved')}><Icon name="check" /> Approuver</button>
                        <button className="icon-btn no" onClick={() => setStatus(r, 'rejected')}><Icon name="x" /> Rejeter</button>
                      </>}
                      {r.status === 'approved' && r.date >= today &&
                        <button className="icon-btn no" onClick={() => setStatus(r, 'cancelled')}><Icon name="x" /> Annuler</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}

/* Admin books a slot for a member (e.g. a phone or WhatsApp request). Approved straight away. */
function NewBooking({ onDone }) {
  const [members, setMembers] = useState([])
  const [courts, setCourts] = useState([])
  const [taken, setTaken] = useState([])
  const [form, setForm] = useState({ player_id: '', court_id: '', date: todayISO(), slot: '' })
  const [find, setFind] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    Promise.all([
      supabase.from('profiles').select('id,full_name,email,phone').order('full_name'),
      supabase.from('courts').select('id,name,status').order('type').order('name'),
    ]).then(([m, c]) => { setMembers(m.data ?? []); setCourts(c.data ?? []) })
  }, [])

  useEffect(() => {
    if (!form.court_id || !form.date) return setTaken([])
    supabase.from('bookings').select('start_time')
      .eq('court_id', form.court_id).eq('date', form.date).in('status', ['pending', 'approved'])
      .then(({ data }) => setTaken((data ?? []).map(b => b.start_time.slice(0, 5))))
  }, [form.court_id, form.date])

  const matches = members.filter(m => `${m.full_name} ${m.email} ${m.phone}`.toLowerCase().includes(find.trim().toLowerCase()))

  async function submit() {
    if (!form.player_id || !form.court_id || !form.date || !form.slot) return toast.error('Choisissez un membre, un court, une date et un créneau')
    if (taken.includes(form.slot)) return toast.error('Ce créneau est déjà pris')
    setBusy(true)
    const { error } = await supabase.from('bookings').insert({
      player_id: form.player_id, court_id: form.court_id, date: form.date,
      start_time: form.slot, end_time: endTime(form.slot), status: 'approved',
    })
    setBusy(false)
    if (error) return toast.error(bookingError(error, { forAdmin: true }))
    toast.success('Réservation confirmée')
    onDone()
  }

  return (
    <div className="panel">
      <h3>Réserver pour un membre</h3>
      <div className="form-grid">
        <div className="field"><label>Membre</label>
          <input placeholder="Tapez un nom, e-mail ou téléphone…" value={find} onChange={e => setFind(e.target.value)} style={{ marginBottom: 8 }} />
          <select value={form.player_id} onChange={e => setForm({ ...form, player_id: e.target.value })} size={Math.min(5, Math.max(2, matches.length))}>
            {matches.map(m => <option key={m.id} value={m.id}>{m.full_name ?? m.email}{m.phone ? ` · ${m.phone}` : ''}</option>)}
          </select>
        </div>
        <div>
          <div className="field"><label>Court</label>
            <select value={form.court_id} onChange={e => setForm({ ...form, court_id: e.target.value, slot: '' })}>
              <option value="">— choisir —</option>
              {courts.map(c => <option key={c.id} value={c.id} disabled={c.status !== 'available'}>{c.name}{c.status !== 'available' ? ' (maintenance)' : ''}</option>)}
            </select></div>
          <div className="field"><label>Date</label>
            <input type="date" value={form.date} min={todayISO()} onChange={e => setForm({ ...form, date: e.target.value, slot: '' })} /></div>
        </div>
      </div>
      <label className="slot-label">Créneau (1 h)</label>
      <div className="slot-grid">
        {SLOTS.map(s => (
          <button key={s} type="button" disabled={!form.court_id || taken.includes(s)}
            className={`slot${form.slot === s ? ' sel' : ''}`} onClick={() => setForm({ ...form, slot: s })}>{s}</button>
        ))}
      </div>
      <div className="form-actions">
        <button className="btn btn-lime btn-sm" disabled={busy} onClick={submit}><Icon name="check" />{busy ? 'Enregistrement…' : 'Confirmer la réservation'}</button>
        <span className="sub-muted">La réservation est confirmée directement, sans validation.</span>
      </div>
    </div>
  )
}
