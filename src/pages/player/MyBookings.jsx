import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import Loader from '../../components/ui/Loader'
import EmptyState from '../../components/ui/EmptyState'
import StatusBadge from '../../components/ui/StatusBadge'
import Icon from '../../components/Icon'

export default function MyBookings() {
  const { user } = useAuth()
  const [rows, setRows] = useState(null)

  async function load() {
    const { data } = await supabase.from('bookings')
      .select('id,date,start_time,end_time,status,courts(name)')
      .eq('player_id', user.id).order('date', { ascending: false })
    setRows(data ?? [])
  }
  useEffect(() => { load() }, [])

  async function cancel(id) {
    const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id)
    if (error) return toast.error(error.message)
    toast.success('Réservation annulée')
    setRows(rs => rs.map(r => r.id === id ? { ...r, status: 'cancelled' } : r))
  }

  if (!rows) return <Loader />

  return (
    <>
      <div className="page-head"><div><h1>Mes réservations</h1><p>Suivez le statut de vos demandes.</p></div></div>
      <div className="panel" style={{ padding: 0 }}>
        {rows.length === 0
          ? <EmptyState icon="clipboard" title="Aucune réservation" hint="Réservez votre premier créneau." />
          : (
          <table>
            <thead><tr><th>Court</th><th>Date</th><th>Créneau</th><th>Statut</th><th></th></tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.courts?.name ?? '—'}</td>
                  <td>{r.date}</td>
                  <td>{r.start_time?.slice(0,5)}–{r.end_time?.slice(0,5)}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>{['pending','approved'].includes(r.status) &&
                    <button className="icon-btn no" onClick={() => cancel(r.id)}><Icon name="x" /> Annuler</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
