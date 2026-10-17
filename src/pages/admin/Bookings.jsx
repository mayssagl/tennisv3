import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabaseClient'
import Loader from '../../components/ui/Loader'
import EmptyState from '../../components/ui/EmptyState'
import StatusBadge from '../../components/ui/StatusBadge'
import Icon from '../../components/Icon'

export default function AdminBookings() {
  const [rows, setRows] = useState(null)

  async function load() {
    const { data } = await supabase
      .from('bookings')
      .select('id,date,start_time,end_time,status,courts(name),profiles(full_name,email)')
      .order('created_at', { ascending: false })
    setRows(data ?? [])
  }
  useEffect(() => { load() }, [])

  async function setStatus(id, status) {
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id)
    if (error) return toast.error("Échec de la mise à jour")
    toast.success(status === 'approved' ? 'Réservation approuvée' : 'Réservation rejetée')
    setRows(rs => rs.map(r => r.id === id ? { ...r, status } : r))
  }

  if (!rows) return <Loader />

  return (
    <>
      <div className="page-head"><div><h1>Réservations</h1><p>Validez ou rejetez les demandes des membres.</p></div></div>
      <div className="panel" style={{ padding: 0 }}>
        {rows.length === 0
          ? <EmptyState icon="calendar" title="Aucune réservation" hint="Les demandes apparaîtront ici." />
          : (
          <table>
            <thead><tr><th>Membre</th><th>Court</th><th>Date</th><th>Créneau</th><th>Statut</th><th></th></tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{r.profiles?.full_name ?? '—'}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{r.profiles?.email}</div>
                  </td>
                  <td>{r.courts?.name ?? '—'}</td>
                  <td>{r.date}</td>
                  <td>{r.start_time?.slice(0,5)}–{r.end_time?.slice(0,5)}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>
                    {r.status === 'pending' && (
                      <div className="row-actions">
                        <button className="icon-btn ok" onClick={() => setStatus(r.id, 'approved')}><Icon name="check" /> Approuver</button>
                        <button className="icon-btn no" onClick={() => setStatus(r.id, 'rejected')}><Icon name="x" /> Rejeter</button>
                      </div>
                    )}
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
