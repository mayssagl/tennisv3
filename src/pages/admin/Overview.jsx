import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { supabase } from '../../lib/supabaseClient'
import { todayISO, formatDate, bookingError } from '../../lib/booking'
import StatCard from '../../components/ui/StatCard'
import Loader from '../../components/ui/Loader'
import Icon from '../../components/Icon'

const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export default function Overview() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ members: 0, today: 0, pending: 0, courts: 0 })
  const [pending, setPending] = useState([])
  const [chart, setChart] = useState([])

  useEffect(() => { load() }, [])

  async function load() {
    const today = todayISO()
    const since = new Date(); since.setDate(since.getDate() - 6)
    const [{ count: members }, { count: todayCount }, { data: pend },
           { count: courts }, { data: bookings }] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('date', today).in('status', ['pending', 'approved']),
      supabase.from('bookings').select('id,date,start_time,end_time,courts(name),profiles(full_name)').eq('status', 'pending').order('date').order('start_time'),
      supabase.from('courts').select('*', { count: 'exact', head: true }).eq('status', 'available'),
      supabase.from('bookings').select('date').gte('date', iso(since)).lte('date', today).in('status', ['pending', 'approved']),
    ])

    // bookings per day (last 7 days)
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
    const buckets = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      buckets[iso(d)] = { jour: days[d.getDay()], total: 0 }
    }
    ;(bookings ?? []).forEach(b => { if (buckets[b.date]) buckets[b.date].total++ })

    setStats({ members: members ?? 0, today: todayCount ?? 0, pending: pend?.length ?? 0, courts: courts ?? 0 })
    setPending(pend ?? [])
    setChart(Object.values(buckets))
    setLoading(false)
  }

  async function decide(b, status) {
    const { error } = await supabase.from('bookings').update({ status }).eq('id', b.id)
    if (error) return toast.error(bookingError(error, { forAdmin: true }))
    toast.success(status === 'approved' ? 'Réservation approuvée' : 'Réservation rejetée')
    setPending(p => p.filter(x => x.id !== b.id))
    setStats(s => ({ ...s, pending: s.pending - 1 }))
  }

  if (loading) return <Loader />

  return (
    <>
      <div className="page-head">
        <div><h1>Vue d'ensemble</h1><p>Activité du club en temps réel.</p></div>
      </div>

      <div className="stats">
        <StatCard icon="users"    label="Membres"           value={stats.members} />
        <StatCard icon="calendar" label="Résa. aujourd'hui" value={stats.today} />
        <StatCard icon="clock"    label="En attente"        value={stats.pending} />
        <StatCard icon="court"    label="Courts actifs"     value={stats.courts} />
      </div>

      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
          <h3>Demandes à valider</h3>
          <Link to="/admin/bookings" className="sub-muted" style={{ borderBottom: '1px solid currentColor' }}>Toutes les réservations →</Link>
        </div>
        {pending.length === 0
          ? <p className="sub-muted">Aucune demande en attente. Tout est à jour.</p>
          : pending.slice(0, 6).map(b => (
            <div key={b.id} className="list-row" style={{ alignItems: 'center' }}>
              <div>
                <h4 style={{ marginBottom: 2 }}>{b.profiles?.full_name ?? '—'}</h4>
                <p>{b.courts?.name ?? '—'} · {formatDate(b.date)} · {b.start_time?.slice(0, 5)}–{b.end_time?.slice(0, 5)}</p>
              </div>
              <div className="row-actions">
                <button className="icon-btn ok" onClick={() => decide(b, 'approved')}><Icon name="check" /> Approuver</button>
                <button className="icon-btn no" onClick={() => decide(b, 'rejected')}><Icon name="x" /> Rejeter</button>
              </div>
            </div>
          ))}
        {pending.length > 6 && <p className="sub-muted" style={{ marginTop: 10 }}>+ {pending.length - 6} autre(s) dans Réservations.</p>}
      </div>

      <div className="panel">
        <h3>Réservations · 7 derniers jours</h3>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(27,33,28,.1)" vertical={false} />
              <XAxis dataKey="jour" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
              <Tooltip cursor={{ fill: 'rgba(180,83,43,.08)' }} />
              <Bar dataKey="total" name="Réservations" fill="#b4532b" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  )
}
