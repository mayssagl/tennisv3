import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { supabase } from '../../lib/supabaseClient'
import StatCard from '../../components/ui/StatCard'
import Loader from '../../components/ui/Loader'

export default function Overview() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ members: 0, today: 0, revenue: 0, courts: 0 })
  const [chart, setChart] = useState([])

  useEffect(() => { load() }, [])

  async function load() {
    const today = new Date().toISOString().slice(0, 10)
    const [{ count: members }, { count: todayCount }, { data: pays },
           { count: courts }, { data: bookings }] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('date', today),
      supabase.from('payments').select('amount').eq('status', 'paid'),
      supabase.from('courts').select('*', { count: 'exact', head: true }).eq('status', 'available'),
      supabase.from('bookings').select('date'),
    ])
    const revenue = (pays ?? []).reduce((s, p) => s + Number(p.amount), 0)

    // bookings per weekday (last 7 days)
    const days = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam']
    const buckets = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      buckets[d.toISOString().slice(0,10)] = { jour: days[d.getDay()], total: 0 }
    }
    ;(bookings ?? []).forEach(b => { if (buckets[b.date]) buckets[b.date].total++ })

    setStats({ members: members ?? 0, today: todayCount ?? 0, revenue, courts: courts ?? 0 })
    setChart(Object.values(buckets))
    setLoading(false)
  }

  if (loading) return <Loader />

  return (
    <>
      <div className="page-head">
        <div><h1>Vue d'ensemble</h1><p>Activité du club en temps réel.</p></div>
      </div>

      <div className="stats">
        <StatCard icon="users"    label="Membres"            value={stats.members} />
        <StatCard icon="calendar" label="Résa. aujourd'hui"  value={stats.today} />
        <StatCard icon="cash"     label="Revenus (DT)"       value={stats.revenue.toFixed(0)} />
        <StatCard icon="court"    label="Courts actifs"      value={stats.courts} />
      </div>

      <div className="panel">
        <h3>Réservations · 7 derniers jours</h3>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
              <XAxis dataKey="jour" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
              <Tooltip cursor={{ fill: 'rgba(174,206,60,.1)' }} />
              <Bar dataKey="total" fill="#aece3c" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  )
}
